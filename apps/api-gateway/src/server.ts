import http from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { registerSocket } from './common/events/socket.js';
import { logger } from './common/utils/logger.js';
import { logisticsService } from './modules/logistics/logistics.service.js';

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientUrl
  }
});

app.set('io', io);
registerSocket(io);
logisticsService.setPublisher((event, payload) => {
  io.emit(event, payload);
});
logisticsService.listDeliveries()
  .filter((delivery) => delivery.status !== 'DELIVERED')
  .forEach((delivery) => {
    logisticsService.startTracking(delivery.id);
  });

server.listen(env.port, () => {
  logger.info({ port: env.port }, `api gateway listening on port ${env.port}`);
});
