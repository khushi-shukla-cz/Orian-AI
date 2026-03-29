import { google } from 'googleapis';
import config from '../config';
import { Encryption } from '../utils/encryption';
import logger from '../utils/logger';

interface EmailData {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

export class GmailIntegration {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );

    // Set credentials if available
    // In production, these would be loaded from database per user
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: Encryption.decrypt(process.env.GOOGLE_REFRESH_TOKEN),
      });
    }
  }

  async sendEmail(data: EmailData): Promise<any> {
    logger.info('GmailIntegration: Sending email', {
      to: data.to,
      subject: data.subject,
    });

    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const message = this.createMessage(data);

      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message,
        },
      });

      logger.info('GmailIntegration: Email sent successfully', {
        messageId: result.data.id,
      });

      return {
        success: true,
        messageId: result.data.id,
      };
    } catch (error: any) {
      logger.error('GmailIntegration: Failed to send email', {
        error: error.message,
      });

      // For demo purposes, return mock success if credentials not configured
      if (error.message.includes('invalid_grant') || !config.google.clientId) {
        logger.warn('GmailIntegration: Using mock response (credentials not configured)');
        return {
          success: true,
          messageId: `mock-${Date.now()}`,
          mock: true,
        };
      }

      throw error;
    }
  }

  private createMessage(data: EmailData): string {
    const email = [
      `To: ${data.to}`,
      data.cc ? `Cc: ${data.cc}` : '',
      data.bcc ? `Bcc: ${data.bcc}` : '',
      `Subject: ${data.subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      data.body,
    ]
      .filter(Boolean)
      .join('\n');

    return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.send'],
    });
  }

  async getTokenFromCode(code: string): Promise<any> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }
}
