import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import customFetch from '../../fetchInstance';
import LeftNavbar from './LeftNavbar';

const Discussion = () => {
  const { teamid } = useParams();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [replyMessageId, setReplyMessageId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);

  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_SOCKET_SERVER_URI}`, {
      auth: {
        token: localStorage.getItem('token'),
        refreshtoken: localStorage.getItem('refreshtoken')
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('Disconnected:', reason);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/message/getdiscussionmessages/${teamid}`);
      if (res.status === 200) {
        const data = res.data;
        setMessages(data.messages);
      } else {
        throw new Error(res.data.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [teamid]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idres = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/getid`);
        if (idres.status !== 200) {
          throw new Error('Failed to fetch profile');
        }
        const iddata = idres.data;
        if (socket) {
          socket.emit('registerteam', teamid, iddata.userid);
        }
        const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/profile`);
        const data = res.data;
        setUser(data.username);
        setUserId(iddata.userid);
      } catch (err) {
        navigate('/signup');
        console.error('Error fetching profile:', err.message);
      }
    };

    fetchData();
  }, [teamid, navigate, socket]);

  useEffect(() => {
    if (socket) {
      const handleMessage = (newMessage) => {
        setMessages(prevMessages => [...prevMessages, newMessage.message]);
      };

      const handleFile = (newFile) => {
        setMessages(prevMessages => [...prevMessages, newFile.message]);
      };

      socket.on('message', handleMessage);
      socket.on('file', handleFile);

      socket.on('newAccessToken', ({ accessToken, refreshToken }) => {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshtoken', refreshToken);
        socket.auth.token = accessToken;
        socket.auth.refreshtoken = refreshToken;
      });

      socket.on('gotosignin', (message) => {
        alert(message);
        navigate('/login');
      });

      return () => {
        socket.off('message', handleMessage);
        socket.off('file', handleFile);
        socket.off('newAccessToken');
        socket.off('gotosignin');
      };
    }
  }, [socket, navigate]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (file !== null) {
      
      const formData = new FormData();
      formData.append('file', file, file.name);
     
      
      
      const data = {
        fileData: {
          fileName: file.name,
          contentType: file.type
        },
        content: message,
        senderId: userId,
        teamId:teamid,
        commented: replyMessageId,
      };
      const response = await fetch(`${import.meta.env.VITE_SERVER_REQ_URI}/upload`, {
        method: 'POST',
        body: formData
      });

      if(response.ok){
        const resdata=await response.json();

        console.log(resdata.downloadURL);

        data.fileData.url=resdata.downloadURL;

        socket.emit('file', data );
      }
      
    } else if (message.trim() !== '') {
      const data = {
        content: message,
        senderId: userId,
        commented: replyMessageId,
        teamId:teamid
      };
      
      socket.emit('message', data);
    }
    setMessage('');
    setReplyMessageId(null);
    setFile(null);
    setReplyMessage(null);
  };

  const handleReply = (item) => {
    setReplyMessage(item);
    setReplyMessageId(item._id);
  };

  useEffect(() => {
    if (replyMessageId) {
      const repliedMsg = messages.find(msg => msg._id === replyMessageId);
      setReplyMessage(repliedMsg);
    } else {
      setReplyMessage(null);
    }
  }, [replyMessageId, messages]);

  return (
    
    <>
      <div className="w-full h-screen flex flex-col">
  <div className="grid grid-cols-5 gap-3 flex-1 overflow-hidden">
    <div className="grid col-start-1 col-end-2 mt-9">
      <LeftNavbar username={user} id={userId} on={""}/>
    </div>
    <div className="col-start-2 col-end-6 flex flex-col overflow-hidden">
      <div className="w-full">
        <div className="w-full">
          <div className="pl-11 pt-5 text-left">
            <h1 className="text-3xl font-bold">Discussion</h1>
          </div>
        </div>
      </div>
      <div className="w-10/12 pt-5 pl-11 flex flex-col flex-1 overflow-hidden mb-32">
        <div className="w-full bg-slate-100 flex-1 rounded-xl border-slate-100 border-2 flex flex-col overflow-hidden">
          
          <div className="w-full flex-1 overflow-y-auto p-4">
            {messages.map((message) => (
              <div key={message._id} className={`flex ${message.creator._id === userId ? "justify-end" : "justify-start"} mb-4`}>
                <div className="flex items-center">
                  {message.creator._id === userId && (
                    <img src="\src\assets\img\reply.png" alt="Reply" className="w-5 ml-1 pl-1" onClick={() => handleReply(message)} />
                  )}
                </div>
                <div className={`p-2 rounded-lg ${message.creator._id === userId ? "bg-green-200" : "bg-gray-200"} }`} style={{ maxWidth: "45%" }}>
                  {message.isCommneted && message.isCommneted.typeOfMessage==='text' && (
                    <div className="bg-slate-100 p-2 rounded mb-2 min-w-40">
                      <h5 className="font-semibold">{ message.isCommneted.creator?._id===userId ? 'You' : message.isCommneted.creator?.name}</h5>
                      <p className="text-sm">{message.isCommneted.content}</p>
                    </div>
                  )}
                  {message.isCommneted && message.isCommneted.typeOfMessage==='file' &&   (
                    <div className="bg-slate-100 p-2 rounded mb-2  min-w-40">
                      <h5 className="font-semibold">{ message.isCommneted.creator?._id===userId ? 'You' : message.isCommneted.creator?.name}</h5>
                      <p className="text-sm">{message.isCommneted.content}</p>
                     <p className="text-sm">{message.isCommneted.attachment}</p>
                    </div>
                  )}
                  { message.typeOfMessage==='text' ? (
                      <div>
                        <p className='font-bold'>{message.creator?._id!==userId ? message.creator?.name : ''}</p>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-gray-500 pt-1">{message.timestamp.substring(0, 10)}</p>
                      </div>
                    )
                    :(
                      <div>
                          <p className='font-bold'>{message.creator?._id!==userId ? message.creator?.name : ''}</p>
                      <a target="_blank" className="underline text-blue-600" href={message.url} download={message.attachment}>
                      <img className="w-80 m-auto" src={message.url} alt=""/>
                      <p className="text-xs font-semibold">{message.attachment}</p>
                      </a>
                      
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-gray-500 pt-1">{message.timestamp.substring(0, 10)}</p>
                      </div>
                    )
                  }
                  
                </div>
                <div className="flex items-center">
                  {message.creator._id !== userId && (
                    <img src="\src\assets\img\reply-2.png" alt="Reply" className="w-4 ml-1" onClick={() => handleReply(message)} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="w-full">
            <div className="grid grid-cols-13 pl-4">
              {replyMessage && (
                <div className="col-start-1 col-end-12 p-3 bg-gray-300 rounded-lg">
                  <div className="w-full">
                    <div className="w-full">
                      <div className="float-left w-4/5">
                        <h5 className="font-semibold float-left">
                          {replyMessage.creator._id === userId ? "You" : replyMessage.creator?.name}:
                        </h5>
                      </div>
                      <div className="float-right w-1/5 pl-40">
                        <img onClick={() => {
                          setReplyMessage('');
                          setReplyMessageId(null);
                        }} className="w-4 hover:cursor-pointer" src="\src\assets\img\close.png" alt="" />
                      </div>
                    </div>
                    <div className="w-full float-left">
                      <p className="w-full">{replyMessage.content}</p>
                      <p className="w-full">{replyMessage.attachment}</p>
                    </div>
                  </div>
                </div>
              )}
              {file && (
                <div className="col-start-1 col-end-12 p-3 bg-gray-300 rounded-lg">
                  <div className="w-full">
                    <div className="w-full">
                      <div className="float-left w-4/5">
                        <h5 className="font-semibold float-left">
                          Selected File:
                        </h5>
                      </div>
                      <div className="float-right w-1/5 pl-40">
                        <img onClick={() => {
                          setFile(null);
                          fileInputRef.current.value = null;
                        }} className="w-4 hover:cursor-pointer" src="\src\assets\img\close.png" alt="" />
                      </div>
                    </div>
                    <div className="w-full float-left">
                      <p className="w-full">{file.name}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
          <div className="w-full">
            <div className="grid grid-cols-13">
              <div className="col-start-1 col-end-12 p-4 flex items-center">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message"
                  rows={1}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="col-start-12 col-end-13 flex items-center">
                <label htmlFor="fileInput">
                  <input
                    type="file"
                    id="fileInput"
                    name="fileInput"
                    ref={fileInputRef} 
                    className="hidden"
                    onChange={(e) => { setFile(e.target.files[0]) }}
                  />
                  <img
                    className="w-6 hover:cursor-pointer"
                    src="\src\assets\img\attach-file.png"
                    alt="Attach File"
                  />
                </label>
              </div>
              <div className="col-start-13 col-end-14 flex items-center">
                <img
                  onClick={sendMessage}
                  className="w-6 hover:cursor-pointer"
                  src="\src\assets\img\send.png"
                  alt="Send Message"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div className="pt-5">
  <div className="w-full bg-black min-h-16 text-center">
    <p className="text-white pt-6">@All rights reserved</p>
  </div>
  </div>
  
</div>

    </>



  );
};

export default Discussion;