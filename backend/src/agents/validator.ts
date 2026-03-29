import { ExecutionResult } from './executor';
import logger from '../utils/logger';
import { Task } from '../utils/validators';

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

export class ValidatorAgent {
  async validate(task: Task, result: ExecutionResult): Promise<ValidationResult> {
    logger.info('ValidatorAgent: Validating task result', {
      taskId: task.id,
      success: result.success,
    });

    const issues: string[] = [];

    // Check 1: API response format
    if (!result.hasOwnProperty('success')) {
      issues.push('Result missing success field');
    }

    // Check 2: If failed, must have error message
    if (!result.success && !result.error) {
      issues.push('Failed result missing error message');
    }

    // Check 3: Type-specific validation
    if (result.success) {
      const typeValidation = this.validateByType(task, result);
      if (!typeValidation.valid) {
        issues.push(...typeValidation.issues);
      }
    }

    // Check 4: Required fields present
    if (result.success && !result.data) {
      issues.push('Successful result missing data field');
    }

    const isValid = issues.length === 0;

    if (!isValid) {
      logger.warn('ValidatorAgent: Validation failed', {
        taskId: task.id,
        issues,
      });
    } else {
      logger.info('ValidatorAgent: Validation passed', {
        taskId: task.id,
      });
    }

    return {
      valid: isValid,
      issues,
    };
  }

  private validateByType(task: Task, result: ExecutionResult): ValidationResult {
    const issues: string[] = [];

    switch (task.type) {
      case 'email_send':
        if (!result.data?.messageId && !result.data?.id) {
          issues.push('Email result missing message ID');
        }
        break;

      case 'calendar_create':
        if (!result.data?.eventId && !result.data?.id) {
          issues.push('Calendar result missing event ID');
        }
        break;

      case 'slack_notify':
        if (!result.data?.ok && !result.data?.success) {
          issues.push('Slack result missing success indicator');
        }
        break;

      case 'notion_create':
        if (!result.data?.id) {
          issues.push('Notion result missing page ID');
        }
        break;

      case 'summarize_text':
        if (!result.data?.summary) {
          issues.push('Summarize result missing summary text');
        }
        break;
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
