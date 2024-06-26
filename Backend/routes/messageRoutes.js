const express = require('express');
const Message = require('../Models/Messages.model');
const TeamDiscussion=require('../Models/TeamDiscussion.model');
const authtoken = require('../Middleware/authtoken');
const decryptMessage = require('../Middleware/decryptmessage');
const router = express.Router();
const decryptTeamMessage=require('../Middleware/decryptteammessage');
const DiscussionObject=require('../Models/DiscussionObject.model');



router.get('/getdiscussionmessages/:teamid',authtoken,async (req,res)=>{

    const teamid= req.params.teamid;
    
    try{
      let messageData = await TeamDiscussion.findOne({'TeamId':teamid})
      .populate({
          path: 'discussionObjects',
          populate: [
              { path: 'isCommneted' },  // Populate all fields of isCommneted
              { path: 'creator' }       // Populate all fields of creator
          ]
      }).lean();
      
   
        if(messageData===null){
          const TeamDiscussionObj=new TeamDiscussion({
            TeamId:teamid,
            discussionObjects:[]
          });
  
          await TeamDiscussionObj.save();
        
        }
        messageData = await TeamDiscussion.findOne({'TeamId':teamid})
      .populate({
          path: 'discussionObjects',
          populate: [
            {
              path: 'isCommneted',
              select: 'content attachment typeOfMessage url', // Include the content field from isCommneted
              populate: [
                { path: 'creator', select: '_id name' }
              ]
          },  // Populate all fields of isCommneted
              { path: 'creator' }       // Populate all fields of creator
          ]
      });

      if(messageData===null){
        messageData.discussionObjects=[];
      }

      for (let newMessageObject of messageData.discussionObjects) {
        if (newMessageObject.isCommneted) {
            const decryptedMessage = decryptTeamMessage(newMessageObject.isCommneted.content);
            newMessageObject.isCommneted.content = decryptedMessage;
        }

        const decryptedMessage = decryptTeamMessage(newMessageObject.content);

        newMessageObject.content = decryptedMessage;
    }

        
        res.status(200).json({messages:messageData.discussionObjects});

      }
    catch(err){
      console.log(err);
        res.status(402).json(err);
    }

  });

  router.post('/getmessages', authtoken, async (req, res) => {
    const { userId, receiverid } = req.body;
    
    try {
        let messageData = await Message.find({
                $or: [
                    { $and: [{ 'sender': userId }, { 'receiver': receiverid }] },
                    { $and: [{ 'sender': receiverid }, { 'receiver': userId }] }
                ]
            })
            .populate({
                path: 'sender',
                select: '_id name'
            })
            .populate({
                path: 'receiver',
                select: '_id name'
            })
            .populate({
                path: 'isCommneted',
                select: 'content attachment typeOfMessage url', // Include the content field from isCommneted
                populate: [
                    { path: 'sender', select: '_id name' },
                    { path: 'receiver', select: '_id name' }
                ]
            })
            

        //console.log(messageData);

        if (messageData === null) {
            messageData = [];
        }

        
        for (let newMessageObject of messageData) {
            if (newMessageObject.isCommneted) {
                const decryptedMessage = await decryptMessage(newMessageObject.isCommneted.content, newMessageObject.isCommneted.receiver._id, process.env.APP_KEY);
                newMessageObject.isCommneted.content = decryptedMessage;
            }

            const decryptedMessage = await decryptMessage(newMessageObject.content,newMessageObject.receiver._id, process.env.APP_KEY);

            newMessageObject.content = decryptedMessage;
        }

        res.status(200).json({ messages: messageData });
    } catch (err) {
        console.log(err);
        res.status(402).json(err);
    }
});
module.exports=router;