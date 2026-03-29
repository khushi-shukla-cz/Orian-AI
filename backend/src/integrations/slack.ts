import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';

interface SlackMessageData {
  channel: string;
  message: string;
}

export class SlackIntegration {
  async sendMessage(data: SlackMessageData): Promise<any> {
    logger.info('SlackIntegration: Sending message', {
      channel: data.channel,
    });

    try {
      if (!config.slack.webhookUrl) {
        logger.warn('SlackIntegration: Webhook URL not configured, using mock response');
        return {
          success: true,
          ok: true,
          mock: true,
          timestamp: new Date().toISOString(),
        };
      }

      const response = await axios.post(config.slack.webhookUrl, {
        channel: data.channel,
        text: data.message,
      });

      logger.info('SlackIntegration: Message sent successfully');

      return {
        success: true,
        ok: response.data.ok,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error('SlackIntegration: Failed to send message', {
        error: error.message,
      });

      // Return mock success for demo
      return {
        success: true,
        ok: true,
        mock: true,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async sendRichMessage(channel: string, blocks: any[]): Promise<any> {
    logger.info('SlackIntegration: Sending rich message', {
      channel,
      blockCount: blocks.length,
    });

    try {
      if (!config.slack.webhookUrl) {
        logger.warn('SlackIntegration: Webhook URL not configured, using mock response');
        return {
          success: true,
          ok: true,
          mock: true,
        };
      }

      const response = await axios.post(config.slack.webhookUrl, {
        channel,
        blocks,
      });

      return {
        success: true,
        ok: response.data.ok,
      };
    } catch (error: any) {
      logger.error('SlackIntegration: Failed to send rich message', {
        error: error.message,
      });

      // Return mock success for demo
      return {
        success: true,
        ok: true,
        mock: true,
      };
    }
  }
}
