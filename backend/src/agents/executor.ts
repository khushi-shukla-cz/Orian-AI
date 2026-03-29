import { Task } from '../utils/validators';
import logger from '../utils/logger';
import { GmailIntegration } from '../integrations/gmail';
import { SlackIntegration } from '../integrations/slack';
import { CalendarIntegration } from '../integrations/calendar';
import { NotionIntegration } from '../integrations/notion';
import Anthropic from '@anthropic-ai/sdk';
import config from '../config';

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

const EXECUTOR_SYSTEM_PROMPT = `You are part of a production AI system.

STRICT RULES:
- Do NOT hallucinate or assume missing data.
- If required information is missing, return an explicit error.
- Output must strictly follow the defined JSON schema.
- Do not include explanations outside JSON.
- If uncertain, return: { "success": false, "error": "reason" }
- Never invent API responses.

You are an execution agent.

You MUST:
- Execute ONLY the given task
- Use provided inputs
- Call the correct integration

DO NOT:
- Invent responses
- Skip execution

RETURN FORMAT:
{
  "success": true/false,
  "data": {},
  "error": null/string
}

If API fails:
Return exact error.`;

export class ExecutorAgent {
  private integrations: {
    gmail: GmailIntegration;
    slack: SlackIntegration;
    calendar: CalendarIntegration;
    notion: NotionIntegration;
  };

  constructor() {
    this.integrations = {
      gmail: new GmailIntegration(),
      slack: new SlackIntegration(),
      calendar: new CalendarIntegration(),
      notion: new NotionIntegration(),
    };
  }

  async execute(task: Task, context: Record<string, any>): Promise<ExecutionResult> {
    logger.info('ExecutorAgent: Executing task', {
      taskId: task.id,
      type: task.type,
    });

    try {
      // Pre-flight validation
      const validation = this.validateTask(task, context);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Execute based on task type
      let result: ExecutionResult;

      switch (task.type) {
        case 'email_send':
          result = await this.executeEmailSend(task, context);
          break;
        case 'calendar_create':
          result = await this.executeCalendarCreate(task, context);
          break;
        case 'slack_notify':
          result = await this.executeSlackNotify(task, context);
          break;
        case 'notion_create':
          result = await this.executeNotionCreate(task, context);
          break;
        case 'summarize_text':
          result = await this.executeSummarize(task, context);
          break;
        default:
          result = {
            success: false,
            error: `Unknown task type: ${task.type}`,
          };
      }

      // Post-flight validation
      if (result.success) {
        logger.info('ExecutorAgent: Task executed successfully', {
          taskId: task.id,
        });
      } else {
        logger.warn('ExecutorAgent: Task execution failed', {
          taskId: task.id,
          error: result.error,
        });
      }

      return result;
    } catch (error: any) {
      logger.error('ExecutorAgent: Unexpected error during execution', {
        taskId: task.id,
        error: error.message,
      });

      return {
        success: false,
        error: error.message || 'Unknown execution error',
      };
    }
  }

  private validateTask(task: Task, context: Record<string, any>): { valid: boolean; error?: string } {
    // Check if all dependencies are satisfied
    for (const dep of task.dependencies) {
      if (!context[dep]) {
        return {
          valid: false,
          error: `Missing dependency result: ${dep}`,
        };
      }
    }

    return { valid: true };
  }

  private async executeEmailSend(task: Task, context: Record<string, any>): Promise<ExecutionResult> {
    try {
      const { to, subject, body } = task.inputs;

      if (!to || !subject) {
        return {
          success: false,
          error: 'Missing required inputs: to, subject',
        };
      }

      // Use summary from context if available
      const emailBody = body || context.summary || 'No content provided';

      const result = await this.integrations.gmail.sendEmail({
        to,
        subject,
        body: emailBody,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async executeCalendarCreate(task: Task, context: Record<string, any>): Promise<ExecutionResult> {
    try {
      const { title, duration, date } = task.inputs;

      if (!title) {
        return {
          success: false,
          error: 'Missing required input: title',
        };
      }

      const result = await this.integrations.calendar.createEvent({
        title,
        duration: duration || 60,
        date,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async executeSlackNotify(task: Task, context: Record<string, any>): Promise<ExecutionResult> {
    try {
      const { channel, message } = task.inputs;

      if (!channel || !message) {
        return {
          success: false,
          error: 'Missing required inputs: channel, message',
        };
      }

      const result = await this.integrations.slack.sendMessage({
        channel,
        message,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async executeNotionCreate(task: Task, context: Record<string, any>): Promise<ExecutionResult> {
    try {
      const { title, content } = task.inputs;

      if (!title) {
        return {
          success: false,
          error: 'Missing required input: title',
        };
      }

      const result = await this.integrations.notion.createPage({
        title,
        content: content || '',
      });

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async executeSummarize(task: Task, context: Record<string, any>): Promise<ExecutionResult> {
    try {
      const text = task.inputs.text || context.originalInput || '';

      if (!text) {
        return {
          success: false,
          error: 'No text provided to summarize',
        };
      }

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: EXECUTOR_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Summarize the following text concisely:\n\n${text}`,
          },
        ],
      });

      const textContent = message.content.find((block) => block.type === 'text');
      const summary = textContent && textContent.type === 'text' ? textContent.text : '';

      return {
        success: true,
        data: { summary },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
