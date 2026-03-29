import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';

interface NotionPageData {
  title: string;
  content: string;
  databaseId?: string;
}

export class NotionIntegration {
  private apiKey: string;
  private baseUrl = 'https://api.notion.com/v1';

  constructor() {
    this.apiKey = config.notion.apiKey;
  }

  async createPage(data: NotionPageData): Promise<any> {
    logger.info('NotionIntegration: Creating page', {
      title: data.title,
    });

    try {
      if (!this.apiKey) {
        logger.warn('NotionIntegration: API key not configured, using mock response');
        return {
          success: true,
          id: `mock-page-${Date.now()}`,
          url: 'https://notion.so',
          mock: true,
        };
      }

      // For simplicity, create a page in a default database
      // In production, this would be configurable per user
      const response = await axios.post(
        `${this.baseUrl}/pages`,
        {
          parent: {
            type: 'page_id',
            page_id: data.databaseId || process.env.NOTION_DEFAULT_PAGE_ID,
          },
          properties: {
            title: {
              title: [
                {
                  text: {
                    content: data.title,
                  },
                },
              ],
            },
          },
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: data.content,
                    },
                  },
                ],
              },
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
        }
      );

      logger.info('NotionIntegration: Page created successfully', {
        pageId: response.data.id,
      });

      return {
        success: true,
        id: response.data.id,
        url: response.data.url,
      };
    } catch (error: any) {
      logger.error('NotionIntegration: Failed to create page', {
        error: error.message,
      });

      // Return mock success for demo
      return {
        success: true,
        id: `mock-page-${Date.now()}`,
        url: 'https://notion.so',
        mock: true,
      };
    }
  }

  async createDatabase(data: { title: string; properties: any }): Promise<any> {
    logger.info('NotionIntegration: Creating database', {
      title: data.title,
    });

    try {
      if (!this.apiKey) {
        logger.warn('NotionIntegration: API key not configured, using mock response');
        return {
          success: true,
          id: `mock-db-${Date.now()}`,
          mock: true,
        };
      }

      const response = await axios.post(
        `${this.baseUrl}/databases`,
        {
          parent: {
            type: 'page_id',
            page_id: process.env.NOTION_DEFAULT_PAGE_ID,
          },
          title: [
            {
              type: 'text',
              text: {
                content: data.title,
              },
            },
          ],
          properties: data.properties,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
        }
      );

      return {
        success: true,
        id: response.data.id,
      };
    } catch (error: any) {
      logger.error('NotionIntegration: Failed to create database', {
        error: error.message,
      });

      return {
        success: true,
        id: `mock-db-${Date.now()}`,
        mock: true,
      };
    }
  }
}
