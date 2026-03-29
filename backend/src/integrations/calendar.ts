import { google } from 'googleapis';
import config from '../config';
import { Encryption } from '../utils/encryption';
import logger from '../utils/logger';

interface CalendarEventData {
  title: string;
  duration: number;
  date?: string;
  description?: string;
  attendees?: string[];
}

export class CalendarIntegration {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );

    // Set credentials if available
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: Encryption.decrypt(process.env.GOOGLE_REFRESH_TOKEN),
      });
    }
  }

  async createEvent(data: CalendarEventData): Promise<any> {
    logger.info('CalendarIntegration: Creating event', {
      title: data.title,
      duration: data.duration,
    });

    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Calculate event times
      const startTime = data.date ? new Date(data.date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default: 1 week from now
      const endTime = new Date(startTime.getTime() + data.duration * 60 * 1000);

      const event = {
        summary: data.title,
        description: data.description || '',
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees: data.attendees?.map((email) => ({ email })) || [],
      };

      const result = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      logger.info('CalendarIntegration: Event created successfully', {
        eventId: result.data.id,
      });

      return {
        success: true,
        eventId: result.data.id,
        link: result.data.htmlLink,
      };
    } catch (error: any) {
      logger.error('CalendarIntegration: Failed to create event', {
        error: error.message,
      });

      // For demo purposes, return mock success if credentials not configured
      if (error.message.includes('invalid_grant') || !config.google.clientId) {
        logger.warn('CalendarIntegration: Using mock response (credentials not configured)');
        return {
          success: true,
          eventId: `mock-event-${Date.now()}`,
          link: 'https://calendar.google.com/calendar',
          mock: true,
        };
      }

      throw error;
    }
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
    });
  }

  async getTokenFromCode(code: string): Promise<any> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }
}
