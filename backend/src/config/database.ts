import mongoose from 'mongoose';
import config from '../config';
import logger from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodb.uri);

    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      db: mongoose.connection.name,
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (error: any) {
    logger.error('Failed to connect to MongoDB', { error: error.message });
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error: any) {
    logger.error('Error closing MongoDB connection', { error: error.message });
    throw error;
  }
};
