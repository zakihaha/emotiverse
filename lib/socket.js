import { io } from 'socket.io-client';

let socket;

export const getSocket = (token) => {
  if (!socket) {
    socket = io(`${process.env.NEXT_PUBLIC_WS_URL}`, {
      auth: {
        token, // pass JWT here
      },
      transports: ['websocket'],
      autoConnect: false, // manually connect
    });
  }

  return socket;
};
