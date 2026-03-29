import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import config from '../config';
import logger from '../utils/logger';

let io: SocketIOServer | null = null;

export const initializeSocket = (server: HttpServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info('Socket.IO: Client connected', { socketId: socket.id });

    socket.on('subscribe_workflow', (workflowId: string) => {
      socket.join(`workflow:${workflowId}`);
      logger.info('Socket.IO: Client subscribed to workflow', {
        socketId: socket.id,
        workflowId,
      });
    });

    socket.on('unsubscribe_workflow', (workflowId: string) => {
      socket.leave(`workflow:${workflowId}`);
      logger.info('Socket.IO: Client unsubscribed from workflow', {
        socketId: socket.id,
        workflowId,
      });
    });

    socket.on('disconnect', () => {
      logger.info('Socket.IO: Client disconnected', { socketId: socket.id });
    });
  });

  logger.info('Socket.IO initialized');
  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Event emitters
export const emitWorkflowUpdate = (workflowId: string, data: any) => {
  if (io) {
    io.to(`workflow:${workflowId}`).emit('workflow_update', {
      workflowId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
};

export const emitTaskUpdate = (workflowId: string, data: any) => {
  if (io) {
    io.to(`workflow:${workflowId}`).emit('task_update', {
      workflowId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
};

export const emitLogEvent = (workflowId: string, data: any) => {
  if (io) {
    io.to(`workflow:${workflowId}`).emit('log_event', {
      workflowId,
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    });
  }
};

export const emitMetricEvent = (workflowId: string, data: any) => {
  if (io) {
    io.to(`workflow:${workflowId}`).emit('metric_event', {
      workflowId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
};
