const http = require('http');
  const express = require('express');
  const cors = require('cors');
  const socketIO = require('socket.io');
  const decryptMessage = require('../Backend/Middleware/decryptmessage');
  const encryptMessage = require('../Backend/Middleware/encryptmessage');
  const path = require('path');
  const fs = require('fs');
  const Employee = require('../Backend/Models/Emplyoee.model');
  const DiscussionObject = require('../Backend/Models/DiscussionObject.model');
  const connectToDatabase = require('./dbconnect');
  const Message = require('../Backend/Models/Messages.model');
  const app = express();
  const TeamDiscussion = require('./Models/TeamDiscussion.model');
  const decryptTeamMessage = require('./Middleware/decryptteammessage');
  const encryptTeamMessage = require('./Middleware/encryptteammessage');
  const notifier = require('node-notifier');
  const generateToken = require('./Middleware/generateToken');

  const axios = require('axios');
  require('dotenv').config();
  const admin = require('firebase-admin');
  const jwt = require('jsonwebtoken');

  const server = http.createServer(app);

  const allowedOrigins = [
    process.env.FRONT_END_URI
  ];

  const corsOptions = {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    maxHttpBufferSize: 1e8
  };



  app.use(cors(corsOptions));

  const io = socketIO(server, {
    cors: corsOptions
  });
  // Serve static files from the 'uploads' directory
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  const userSocketMap = {};
  const teamSocketMap = {};
  const teamUserCount = {}; // Track the number of users on each team discussion page

  (async () => {
  try{
    await connectToDatabase();
    
    io.use(async (socket, next) => {
      const { token, refreshtoken } = socket.handshake.auth;
      console.log(typeof(token),typeof(refreshtoken));
      if (!token) {
        console.log("token is not here");
          return next(new Error('Authentication token required'));
      }

      try {
        // console.log("here");
          const decoded = jwt.verify(token, process.env.TOKEN_GENERATION_KEY);
          //socket.userId = decoded.userId;
          console.log("Done GO ahead");
          return next();
      } catch (err) {

        //console.log(token+"   "+process.env.TOKEN_GENERATION_KEY+"Token is not working");

          if (!refreshtoken) {
            console.log("refresh is not here");
              return next(new Error('Refresh token required'));
          }

          try {
            // console.log("here");
              const decoded = jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_GENERATION_KEY);
              const user = await Employee.findOne({ _id: decoded.userId, refreshtoken: refreshtoken });

              if (!user) {
                  socket.emit('gotosignin', 'Login again');
                  return next(new Error('Invalid refresh token'));
              }

              const accessToken = generateToken(user);

              // Emit new access token only to the current socket
              socket.emit('newAccessToken', { accessToken });
              socket.userId = user._id;
              return next();
          } catch (refreshErr) {
              socket.emit('gotosignin', 'Login again');
              
              return next(new Error('Invalid refresh token'));
          }
      }
  });

    io.on('connection', (socket) => {
      //console.log('A user connected');
    // console.log('A user connected:');
      socket.on('register', (userId) => {
        if(!userSocketMap[userId]){
        userSocketMap[userId] = socket.id;
        console.log('User registered:', userId, socket.id);
        }
        
      });

      socket.on('registerteam', (teamId, userId) => {

        if(!userSocketMap[userId]){
          userSocketMap[userId] = socket.id;
          console.log('User registered:', userId, socket.id);
          }

        if (!teamSocketMap[teamId]) {
          teamSocketMap[teamId] = [];
          teamUserCount[teamId] = new Set();
        }
        if (!teamUserCount[teamId].has(userId)) {
          teamSocketMap[teamId].push(socket.id);
          teamUserCount[teamId].add(userId);
          console.log('Team registered:', teamId, socket.id, teamUserCount);
        }

        // console.log(teamUserCount);
        // console.log(teamSocketMap);


      });

      

      socket.on('message', async (data) => {
        const { content, commented, senderId, teamId } = data;
      

        try {
          let commentedObj = null;
          if (commented !== '') {
            commentedObj = commented;
          }

          const encryptedMessage = await encryptTeamMessage(content);
          const newDiscussionObject = new DiscussionObject({
            creator: senderId,
            content: encryptedMessage,
            typeOfMessage: "text",
            teamId: teamId,
            isCommneted: commentedObj
          });

          await newDiscussionObject.save();
          const updatedTeamDiscussion = await TeamDiscussion.findOneAndUpdate(
            { TeamId: teamId },
            { $push: { discussionObjects: newDiscussionObject._id } },
            { new: true }
          );
          if (!updatedTeamDiscussion) {
            const TeamDiscussionObj = new TeamDiscussion({
              TeamId: teamId,
              discussionObjects: []
            });

            await TeamDiscussionObj.save();

            await TeamDiscussion.findOneAndUpdate(
              { TeamId: teamId },
              { $push: { discussionObjects: newDiscussionObject._id } },
              { new: true }
            );
          }

          await newDiscussionObject.populate('creator', '_id name')
          if (newDiscussionObject.isCommneted) {
            await newDiscussionObject.populate({
              path: 'isCommneted',
              select: 'content attachment typeOfMessage',
              populate: [
                { path: 'creator', select: '_id name' }
              ]
            });
          }

          if (newDiscussionObject.isCommneted) {
            const decryptedMessage = decryptTeamMessage(newDiscussionObject.isCommneted.content);
            newDiscussionObject.isCommneted.content = decryptedMessage;
          }

          newDiscussionObject.content = content;
          const newMessage = { type: 'message', message: newDiscussionObject };
          
          if (teamSocketMap[teamId]) {
            teamSocketMap[teamId].forEach(id => io.to(id).emit('message', newMessage));
          }
          //sendDesktopNotification('New Message', 'You have a new message!');
        } catch (err) {
          console.error('Error saving message to MongoDB:', err);
        }
      });

      socket.on('file', async (data) => {
        const { fileData, content, senderId, commented, teamId } = data;

        
        if (!fileData || !fileData.fileName ) {
          console.error('Invalid file data received:', fileData);
          return;
        }
        try {
          let commentedObj = null;
          if (commented !== '') {
            commentedObj = commented;
          }
          const encryptedMessage = await encryptTeamMessage(content);
          const newDiscussionObject = new DiscussionObject({
            creator: senderId,
            content: encryptedMessage,
            attachment: fileData.fileName,
            url:fileData.url,
            typeOfMessage: "file",
            teamId: teamId,
            isCommneted: commentedObj
          });

          await newDiscussionObject.save();

          await TeamDiscussion.findOneAndUpdate(
            { TeamId: teamId },
            { $push: { discussionObjects: newDiscussionObject._id } },
            { new: true }
          );

          await newDiscussionObject.populate('creator', '_id name')
          if (newDiscussionObject.isCommneted) {
            await newDiscussionObject.populate({
              path: 'isCommneted',
              select: 'content attachment typeOfMessage',
              populate: [
                { path: 'creator', select: '_id name' }
              ]
            });
          };

          
          

            if (newDiscussionObject.isCommneted) {
              const decryptedMessage = decryptTeamMessage(newDiscussionObject.isCommneted.content);
              newDiscussionObject.isCommneted.content = decryptedMessage;
            }

            newDiscussionObject.content = content;
            const newFile = { type: 'file', message: newDiscussionObject };
            if (teamSocketMap[teamId]) {
              teamSocketMap[teamId].forEach(id => io.to(id).emit('file', newFile));
            }

        } catch (err) {
          console.log(err);
        }
      });

      socket.on('personalfile', async ( data ) => {
      
        if (!data.fileData || !data.fileData.fileName ) {
          console.error('Invalid file data received:', data.fileData);
          return;
        }
        try {
          let commentedObj = null;
          if (data.commented !== '') {
            commentedObj = data.commented;
          }

          const newContent = await encryptMessage(data.content, data.receiverid);

          const newMessageObject = new Message({
            sender: data.senderId,
            receiver: data.receiverid,
            content: newContent,
            typeOfMessage: 'file',
            url:data.fileData.url,
            attachment: data.fileData.fileName,
            isCommneted: commentedObj
          });

          await newMessageObject.save();
        

          await newMessageObject.populate('sender', '_id name');
          await newMessageObject.populate('receiver', '_id name');
          if (newMessageObject.isCommneted) {
            await newMessageObject.populate({
              path: 'isCommneted',
              select: 'content attachment typeOfMessage',
              populate: [
                { path: 'sender', select: '_id name' },
                { path: 'receiver', select: '_id name' }
              ]
            });
          }
        


            if (newMessageObject.isCommneted) {
              const decryptedMessage = await decryptMessage(newMessageObject.isCommneted.content, newMessageObject.isCommneted.receiver?._id, process.env.APP_KEY);
              newMessageObject.isCommneted.content = decryptedMessage;
            }
            newMessageObject.content = data.content;
            console.log(data.fileData.url);
            newMessageObject.url=data.fileData.url;

            const newFile = { type: 'file', message: newMessageObject };
            io.to(userSocketMap[data.senderId]).emit('personalfile', newFile);
            io.to(userSocketMap[data.receiverid]).emit('personalfile', newFile);
          

        } catch (err) {
          console.log(err);
        }
      });

      socket.on('personalmessage', async (data) => {
        try {
          const { content, senderId, receiverid, commented } = data;

          if (!content) {
            throw new Error('No message content provided');
          }

          let commentedObj = null;
          if (commented !== '') {
            commentedObj = commented;
          }
          const newContent = await encryptMessage(content, receiverid);

          const newMessageObject = new Message({
            sender: senderId,
            receiver: receiverid,
            typeOfMessage: 'text',
            content: newContent,
            isCommneted: commentedObj
          });

          await newMessageObject.save();

          await newMessageObject.populate('sender', '_id name');
          await newMessageObject.populate('receiver', '_id name');
          if (newMessageObject.isCommneted) {
            await newMessageObject.populate({
              path: 'isCommneted',
              select: 'content attachment typeOfMessage',
              populate: [
                { path: 'sender', select: '_id name' },
                { path: 'receiver', select: '_id name' }
              ]
            });
          }

          if (newMessageObject.isCommneted) {
            const decryptedMessage = await decryptMessage(newMessageObject.isCommneted.content, newMessageObject.isCommneted.receiver?._id, process.env.APP_KEY);
            newMessageObject.isCommneted.content = decryptedMessage;
          }

          newMessageObject.content = content;
          const newMessage = { type: 'message', message: newMessageObject };
          if(userSocketMap[senderId]){
            // console.log('here'+userSocketMap[senderId]);
          console.log(newMessage);  
          io.to(userSocketMap[senderId]).emit('personalmessage', newMessage);
          }
          if(userSocketMap[receiverid]){
          io.to(userSocketMap[receiverid]).emit('personalmessage', newMessage);
          }
        } catch (err) {
          console.error('Error handling personalmessage event:', err);
        }
      });

      socket.on('disconnect', () => {
        console.log("A user disconnects");
        let disconnectedUserId = null;
        
        // Find the userId corresponding to the disconnected socket.id
        for (const [userId, socketId] of Object.entries(userSocketMap)) {
          if (socketId === socket.id) {
            disconnectedUserId = userId;
            delete userSocketMap[userId];
            break;
          }
        }
      
        
      
        // Remove the disconnected user from the team user count
        for (let teamId in teamSocketMap) {
          if (teamSocketMap[teamId].includes(socket.id)) {
            teamSocketMap[teamId] = teamSocketMap[teamId].filter(id => id !== socket.id);
            if (teamUserCount[teamId].has(disconnectedUserId)) {
              teamUserCount[teamId].delete(disconnectedUserId);
            }
            if (teamUserCount[teamId].size === 0) {
              console.log('No member on discussion');
              delete teamSocketMap[teamId];
              delete teamUserCount[teamId];

            }
            break;
          }
        }
      });
      
      

    });


    server.listen(3001, () => {
      console.log('Server is running on port 3001');
    });
  }catch(err){
      console.log(err);
  }
  })();
