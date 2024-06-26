import { useEffect } from 'react';
import { io } from 'socket.io-client';

let socket;

function connectToSocket() {
  if (!socket) {
    socket = io('http://localhost:3001', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Connected to the WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from the WebSocket server');
    });

    // Add your event listeners here
    socket.on('message', (message) => {
      console.log('New message:', message);
    });
  }
}

function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

function handleSocketConnection(pathname) {
  if (pathname.startsWith('/discussion') || pathname.startsWith('/chat')) {
    connectToSocket();
  } else {
    disconnectSocket();
  }
}

function useWebSocketConnection(location) {
  useEffect(() => {
    handleSocketConnection(location.pathname);
  }, [location.pathname]);
}

export default useWebSocketConnection;
