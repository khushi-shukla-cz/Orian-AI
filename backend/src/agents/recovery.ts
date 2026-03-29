import { Task } from '../utils/validators';
import { ExecutionResult } from './executor';
import logger from '../utils/logger';

export interface RecoveryStrategy {
  action: 'retry' | 'fallback' | 'escalate' | 'skip';
  reason: string;
  delayMs?: number;
}

export class RecoveryAgent {
  private maxRetries = 3;

  async determineStrategy(
    task: Task,
    result: ExecutionResult,
    currentRetries: number
  ): Promise<RecoveryStrategy> {
    logger.info('RecoveryAgent: Determining recovery strategy', {
      taskId: task.id,
      currentRetries,
      error: result.error,
    });

    // If succeeded, no recovery needed
    if (result.success) {
      return {
        action: 'skip',
        reason: 'Task succeeded',
      };
    }

    // Check retry limit
    if (currentRetries >= this.maxRetries) {
      logger.warn('RecoveryAgent: Max retries exceeded', {
        taskId: task.id,
        retries: currentRetries,
      });

      return {
        action: 'escalate',
        reason: `Max retries (${this.maxRetries}) exceeded`,
      };
    }

    // Analyze error type
    const errorType = this.classifyError(result.error || '');

    switch (errorType) {
      case 'transient':
        // Network errors, timeouts - retry with backoff
        return {
          action: 'retry',
          reason: 'Transient error detected',
          delayMs: this.calculateBackoff(currentRetries),
        };

      case 'auth':
        // Authentication errors - escalate
        return {
          action: 'escalate',
          reason: 'Authentication error - requires manual intervention',
        };

      case 'validation':
        // Input validation errors - escalate
        return {
          action: 'escalate',
          reason: 'Input validation error - cannot auto-recover',
        };

      case 'rate_limit':
        // Rate limiting - retry with longer delay
        return {
          action: 'retry',
          reason: 'Rate limit exceeded',
          delayMs: this.calculateBackoff(currentRetries) * 2,
        };

      default:
        // Unknown error - try once more
        if (currentRetries === 0) {
          return {
            action: 'retry',
            reason: 'First retry for unknown error',
            delayMs: this.calculateBackoff(currentRetries),
          };
        } else {
          return {
            action: 'escalate',
            reason: 'Unknown error after retry',
          };
        }
    }
  }

  private classifyError(error: string): 'transient' | 'auth' | 'validation' | 'rate_limit' | 'unknown' {
    const errorLower = error.toLowerCase();

    if (
      errorLower.includes('timeout') ||
      errorLower.includes('network') ||
      errorLower.includes('econnrefused') ||
      errorLower.includes('socket')
    ) {
      return 'transient';
    }

    if (
      errorLower.includes('unauthorized') ||
      errorLower.includes('authentication') ||
      errorLower.includes('401') ||
      errorLower.includes('403')
    ) {
      return 'auth';
    }

    if (
      errorLower.includes('invalid') ||
      errorLower.includes('validation') ||
      errorLower.includes('required') ||
      errorLower.includes('missing')
    ) {
      return 'validation';
    }

    if (errorLower.includes('rate limit') || errorLower.includes('429')) {
      return 'rate_limit';
    }

    return 'unknown';
  }

  private calculateBackoff(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s...
    const baseDelay = 1000; // 1 second
    return baseDelay * Math.pow(2, retryCount);
  }
}
