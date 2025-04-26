// import { io } from 'socket.io-client';

// let socket;

// export const connectSocket = (token) => {
//     socket = io('http://localhost:4000', {
//         auth: { token }
//     });

//     socket.on('connect', () => {
//         console.log('✅ Connected to WebSocket');
//     });

//     socket.on('disconnect', () => {
//         console.log('❌ Disconnected from WebSocket');
//     });

//     return socket;
// };

// export const getSocket = () => socket;

import { io } from 'socket.io-client';

let socket;

export const getSocket = (token) => {
  if (!socket) {
    socket = io('http://localhost:4000', {
      auth: {
        token, // pass JWT here
      },
      transports: ['websocket'],
      autoConnect: false, // manually connect
    });
  }

  return socket;
};
