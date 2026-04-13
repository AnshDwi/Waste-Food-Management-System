import { Server } from 'socket.io';

export const registerSocket = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on('join:delivery', (deliveryId: string) => {
      socket.join(`delivery:${deliveryId}`);
    });

    socket.on('delivery:update', (payload) => {
      io.to(`delivery:${payload.deliveryId}`).emit('delivery:status', payload);
    });
  });
};
