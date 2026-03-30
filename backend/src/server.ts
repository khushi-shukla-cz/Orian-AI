import express, { Application } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import config from './config';
import logger from './utils/logger';
import { connectDatabase } from './config/database';
import { initializeRedis } from './queues';
import { initializeSocket } from './sockets';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app: Application = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  next();
});

// Routes
app.use(`/api/${config.apiVersion}`, routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize services
const initializeServices = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Connect to Redis (non-blocking for API availability)
    const redisReady = await initializeRedis();

    if (redisReady) {
      // Load worker only after Redis is available.
      await import('./queues/taskWorker');
      logger.info('Task worker started');
    } else {
      logger.warn('Redis unavailable. Background task execution is disabled until Redis is up.');
    }

    // Initialize Socket.IO
    initializeSocket(server);

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services', { error });
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server gracefully...');

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      const { closeQueues } = await import('./queues');
      await closeQueues();

      const { disconnectDatabase } = await import('./config/database');
      await disconnectDatabase();

      logger.info('All connections closed, exiting process');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  await initializeServices();

  server.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`, {
      env: config.env,
      apiVersion: config.apiVersion,
    });
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║         ORION AI - AUTONOMOUS WORKFLOW OS             ║
║                                                       ║
║  Server: http://localhost:${config.port}                      ║
║  API: http://localhost:${config.port}/api/${config.apiVersion}            ║
║  Environment: ${config.env.toUpperCase().padEnd(36)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  });
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  process.exit(1);
});

startServer();

export default app;
