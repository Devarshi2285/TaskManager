import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from 'socket.io-client';
import LeftNavbar from "./LeftNavbar";
import customFetch from "../../fetchInstance";

function Chat() {
  const [socket, setSocket] = useState(null);
  const { receiverid } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [receiverName, setReceiverName] = useState(null);
  const [replyMessageId, setReplyMessageId] = useState(null);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idres = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/getid`, null);
        const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/profile`, null);
        const data = res.data;
        setUser(data.username);
        console.log('Fetch response status:', idres.status);

        const iddata = idres.data;
        console.log(socket);
        if (socket) {
          socket.emit('register', iddata.userid);
        }

        setUserId(iddata.userid);
      } catch (err) {
        navigate('/login');
        console.error('Error fetching profile:', err);
      }
    };
    fetchData();
    fetchReceiverName();
  }, [receiverid, socket, navigate]);

  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [userId]);

  useEffect(() => {
    if (socket) {
      const handleMessage = (newMessage) => {
        setMessages(prevMessages => [...prevMessages, newMessage.message]);
      };

      const handleFile = (newFile) => {
        setMessages(prevMessages => [...prevMessages, newFile.message]);
      };

      socket.on('personalmessage', handleMessage);
      socket.on('personalfile', handleFile);

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
        socket.off('personalmessage', handleMessage);
        socket.off('personalfile', handleFile);
        socket.off('newAccessToken');
        socket.off('gotosignin');
      };
    }
  }, [socket, navigate]);

  const fetchMessages = async () => {
    const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/message/getmessages`, { userId, receiverid });
    if (res.status === 200) {
      const data = res.data;
      console.log(data.messages);
      setMessages(data.messages);
    } else if (res.status === 402) {
      window.alert('Problem in fetching Messages');
    }
  };

  const fetchReceiverName = async () => {
    const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/getreceivername`, { receiverid: receiverid });
    const data = res.data;
    setReceiverName(data.username);
  };

  const handleReply = (item) => {
    setReplyMessage(item);
    setReplyMessageId(item._id);
  };

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
        receiverid: receiverid,
        commented: replyMessageId,
      };
      const response = await fetch('http://localhost:3004/upload', {
        method: 'POST',
        body: formData
      });

      if(response.ok){
        const resdata=await response.json();

        console.log(resdata.downloadURL);

        data.fileData.url=resdata.downloadURL;

        socket.emit('personalfile', data );
      }
      
    } else if (message.trim() !== '') {
      const data = {
        content: message,
        senderId: userId,
        receiverid: receiverid,
        commented: replyMessageId,
      };
      
      socket.emit('personalmessage', data);
    }
    setMessage('');
    setReplyMessageId(null);
    setFile(null);
    setReplyMessage(null);
  };
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
                    <h1 className="text-3xl font-bold">Chat</h1>
                  </div>
                </div>
              </div>
              <div className="w-10/12 pt-5 pl-11 flex flex-col flex-1 overflow-hidden mb-32">
                <div className="w-full bg-slate-100 flex-1 rounded-xl border-slate-100 border-2 flex flex-col overflow-hidden">
                  <div className="w-full">
                    <div className="p-4 bg-white">
                      <img className="w-12 pl-3 pt-1 float-left" src="\src\assets\img\profile-user.png" alt="" />
                      <h1 className="pt-1 pl-14 text-lg font-semibold">{receiverName}</h1>
                    </div>
                  </div>
                  <div className="w-full flex-1 overflow-y-auto p-4">
                    {messages.map((message) => (
                      <div key={message._id} className={`flex ${message.sender._id === userId ? "justify-end" : "justify-start"} mb-4`}>
                        <div className="flex items-center">
                          {message.sender._id === userId && (
                            <img src="\src\assets\img\reply.png" alt="Reply" className="w-5 ml-1 pl-1" onClick={() => handleReply(message)} />
                          )}
                        </div>
                        <div className={`p-2 rounded-lg ${message.sender._id === userId ? "bg-green-200" : "bg-gray-200"}`} style={{ maxWidth: "45%" }}>
                          {message.isCommneted && message.isCommneted.typeOfMessage === 'text' && (
                            <div className="bg-slate-100 p-2 rounded mb-2 min-w-40">
                              <h5 className="font-semibold">{message.isCommneted.sender?._id === userId ? 'You' : message.isCommneted.sender?.name}</h5>
                              <p className="text-sm">{message.isCommneted.content}</p>
                            </div>
                          )}
                          {message.isCommneted && message.isCommneted.typeOfMessage === 'file' && (
                            <div className="bg-slate-100 p-2 rounded mb-2 min-w-40">
                              <h5 className="font-semibold">{message.isCommneted.sender?._id === userId ? 'You' : message.isCommneted.sender?.name}</h5>
                              <p className="text-sm">{message.isCommneted.content}</p>
                              <p className="text-sm">{message.isCommneted.attachment}</p>
                            </div>
                          )}
                          { message.typeOfMessage==='text' ? (
                      <div>
                       
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-gray-500 pt-1">{message.timestamp.substring(0, 10)}</p>
                      </div>
                    )
                    :(
                      <div>
                        
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
                          {message.sender._id !== userId && (
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
                                  {replyMessage.sender._id === userId ? "You" : replyMessage.sender?.name}:
                                </h5>
                              </div>
                              <div className="float-right w-1/5 pl-40">
                                <img onClick={() => {
                                  setReplyMessage('');
                                  setReplyMessageId(null);
                                }} className="w-4 hover:cursor-pointer" src="/img/close.png" alt="" />
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
                                }} className="w-4 hover:cursor-pointer" src="/img/close.png" alt="" />
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
                  <form action="" onSubmit={sendMessage}>
                    <div className="grid grid-cols-13">
                    
                      <div className="col-start-1 col-end-12 p-4 flex items-center">
                        <textarea
                          type='text'
                          value={message}
                          rows={1}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type your message"
                          name="inputMessage"
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
                        <button type="submit">
                        <img
                          className="w-6 hover:cursor-pointer"
                          src="\src\assets\img\send.png"
                          alt="Send Message"
                        />
                        </button>
                      </div>
                   
                    </div>
                    </form>
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
  }

  export default Chat;
