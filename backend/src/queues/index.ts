import { Queue, QueueEvents } from 'bullmq';
import { createClient } from 'redis';
import config from '../config';
import logger from '../utils/logger';

let redisAvailable = false;

// Redis connection
const connection = createClient({
  url: config.redis.url,
});

connection.on('error', (err) => {
  redisAvailable = false;
  logger.error('Redis Client Error', err);
});
connection.on('connect', () => {
  redisAvailable = true;
  logger.info('Redis Client Connected');
});
connection.on('end', () => {
  redisAvailable = false;
  logger.warn('Redis Client Disconnected');
});

// Task execution queue
export const taskQueue = new Queue('workflow-tasks', {
  connection,
  defaultJobOptions: {
    attempts: config.queue.maxRetries,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600, // 24 hours
    },
    removeOnFail: {
      count: 100,
      age: 7 * 24 * 3600, // 7 days
    },
  },
});

// Queue events for monitoring
export const taskQueueEvents = new QueueEvents('workflow-tasks', {
  connection,
});

taskQueueEvents.on('completed', ({ jobId }) => {
  logger.info('Task completed', { jobId });
});

taskQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error('Task failed', { jobId, failedReason });
});

taskQueueEvents.on('progress', ({ jobId, data }) => {
  logger.debug('Task progress', { jobId, progress: data });
});

// Workflow orchestration queue
export const workflowQueue = new Queue('workflows', {
  connection,
  defaultJobOptions: {
    attempts: 1, // Workflows are not retried, individual tasks are
    removeOnComplete: {
      count: 50,
      age: 24 * 3600,
    },
    removeOnFail: {
      count: 50,
      age: 7 * 24 * 3600,
    },
  },
});

export const workflowQueueEvents = new QueueEvents('workflows', {
  connection,
});

workflowQueueEvents.on('completed', ({ jobId }) => {
  logger.info('Workflow completed', { jobId });
});

workflowQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error('Workflow failed', { jobId, failedReason });
});

// Initialize connection
export const initializeRedis = async () => {
  try {
    await connection.connect();
    redisAvailable = true;
    logger.info('Redis connection initialized');
    return true;
  } catch (error) {
    redisAvailable = false;
    logger.error('Failed to connect to Redis', { error });
    return false;
  }
};

export const isRedisReady = (): boolean => redisAvailable && connection.isOpen;

// Graceful shutdown
export const closeQueues = async () => {
  await taskQueue.close();
  await workflowQueue.close();
  if (connection.isOpen) {
    await connection.quit();
  }
  logger.info('Queues and Redis connection closed');
};
