import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  env: string;
  port: number;
  apiVersion: string;
  mongodb: {
    uri: string;
  };
  redis: {
    url: string;
  };
  anthropic: {
    apiKey: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  slack: {
    botToken: string;
    webhookUrl: string;
  };
  notion: {
    apiKey: string;
  };
  encryption: {
    key: string;
  };
  queue: {
    concurrency: number;
    maxRetries: number;
  };
  cors: {
    origin: string;
  };
  logging: {
    level: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/orion-ai',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/v1/auth/google/callback',
  },
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN || '',
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
  },
  notion: {
    apiKey: process.env.NOTION_API_KEY || '',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'change-this-32-char-key-value!',
  },
  queue: {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

export default config;
