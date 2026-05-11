import { Worker, Job } from 'bullmq';
import config from '../config';
import logger from '../utils/logger';
import { ExecutorAgent } from '../agents/executor';
import { ValidatorAgent } from '../agents/validator';
import { RecoveryAgent } from '../agents/recovery';
import Task from '../models/Task';
import Workflow from '../models/Workflow';
import Log from '../models/Log';
import { Task as TaskType } from '../utils/validators';
import { emitTaskUpdate, emitLogEvent } from '../sockets';
import { bullConnection } from './index';

interface TaskJobData {
  workflowId: string;
  task: TaskType;
  context: Record<string, any>;
}

const executorAgent = new ExecutorAgent();
const validatorAgent = new ValidatorAgent();
const recoveryAgent = new RecoveryAgent();

export const taskWorker = new Worker<TaskJobData>(
  'workflow-tasks',
  async (job: Job<TaskJobData>) => {
    const { workflowId, task, context } = job.data;

    logger.info('TaskWorker: Processing task', {
      jobId: job.id,
      workflowId,
      taskId: task.id,
    });

    try {
      // Update task status to running
      await Task.findOneAndUpdate(
        { workflowId, taskId: task.id },
        {
          status: 'running',
          startTime: new Date(),
          agent: 'executor',
        }
      );

      // Emit real-time update
      emitTaskUpdate(workflowId, {
        taskId: task.id,
        status: 'running',
        agent: 'executor',
      });

      // Log task start
      await Log.create({
        workflowId,
        taskId: task.id,
        level: 'INFO',
        agent: 'executor',
        action: 'task_start',
        message: `Starting task: ${task.description}`,
      });

      emitLogEvent(workflowId, {
        level: 'INFO',
        message: `[${task.id}] Executing: ${task.description}`,
        timestamp: new Date(),
      });

      // Execute the task
      const executionResult = await executorAgent.execute(task, context);

      // Validate the result
      const validationResult = await validatorAgent.validate(task, executionResult);

      if (!validationResult.valid) {
        logger.warn('TaskWorker: Validation failed', {
          taskId: task.id,
          issues: validationResult.issues,
        });

        executionResult.success = false;
        executionResult.error = `Validation failed: ${validationResult.issues.join(', ')}`;
      }

      // Handle success or failure
      if (executionResult.success) {
        // Task succeeded
        const endTime = new Date();
        const startTime = (await Task.findOne({ workflowId, taskId: task.id }))?.startTime || endTime;
        const duration = endTime.getTime() - startTime.getTime();

        await Task.findOneAndUpdate(
          { workflowId, taskId: task.id },
          {
            status: 'completed',
            result: executionResult.data,
            endTime,
            duration,
          }
        );

        await Log.create({
          workflowId,
          taskId: task.id,
          level: 'INFO',
          agent: 'executor',
          action: 'task_complete',
          message: `Task completed successfully: ${task.description}`,
        });

        emitTaskUpdate(workflowId, {
          taskId: task.id,
          status: 'completed',
          result: executionResult.data,
        });

        emitLogEvent(workflowId, {
          level: 'INFO',
          message: `[${task.id}] ✓ Completed successfully`,
          timestamp: new Date(),
        });

        // Update workflow metrics
        await Workflow.findByIdAndUpdate(workflowId, {
          $inc: { 'metrics.tasksCompleted': 1 },
          $set: { [`results.${task.id}`]: executionResult.data },
        });

        return executionResult.data;
      } else {
        // Task failed - determine recovery strategy
        const currentTask = await Task.findOne({ workflowId, taskId: task.id });
        const currentRetries = currentTask?.retries || 0;

        const recoveryStrategy = await recoveryAgent.determineStrategy(
          task,
          executionResult,
          currentRetries
        );

        await Log.create({
          workflowId,
          taskId: task.id,
          level: 'WARN',
          agent: 'recovery',
          action: 'recovery_decision',
          message: `Recovery strategy: ${recoveryStrategy.action} - ${recoveryStrategy.reason}`,
        });

        emitLogEvent(workflowId, {
          level: 'WARN',
          message: `[${task.id}] ${recoveryStrategy.action.toUpperCase()}: ${recoveryStrategy.reason}`,
          timestamp: new Date(),
        });

        if (recoveryStrategy.action === 'retry') {
          // Update retry count
          await Task.findOneAndUpdate(
            { workflowId, taskId: task.id },
            {
              status: 'retrying',
              $inc: { retries: 1 },
              error: executionResult.error,
            }
          );

          await Workflow.findByIdAndUpdate(workflowId, {
            $inc: { 'metrics.totalRetries': 1 },
          });

          emitTaskUpdate(workflowId, {
            taskId: task.id,
            status: 'retrying',
            retries: currentRetries + 1,
          });

          // Throw error to trigger BullMQ retry
          throw new Error(executionResult.error || 'Task execution failed');
        } else {
          // Escalate or skip
          await Task.findOneAndUpdate(
            { workflowId, taskId: task.id },
            {
              status: 'failed',
              error: executionResult.error,
              endTime: new Date(),
            }
          );

          await Workflow.findByIdAndUpdate(workflowId, {
            $inc: { 'metrics.tasksFailed': 1 },
          });

          emitTaskUpdate(workflowId, {
            taskId: task.id,
            status: 'failed',
            error: executionResult.error,
          });

          throw new Error(executionResult.error || 'Task execution failed - escalated');
        }
      }
    } catch (error: any) {
      logger.error('TaskWorker: Task processing error', {
        taskId: task.id,
        error: error.message,
      });

      await Log.create({
        workflowId,
        taskId: task.id,
        level: 'ERROR',
        agent: 'worker',
        action: 'task_error',
        message: `Task error: ${error.message}`,
      });

      emitLogEvent(workflowId, {
        level: 'ERROR',
        message: `[${task.id}] ✗ Error: ${error.message}`,
        timestamp: new Date(),
      });

      throw error;
    }
  },
  {
    connection: bullConnection,
    concurrency: config.queue.concurrency,
  }
);

taskWorker.on('completed', (job) => {
  logger.info('TaskWorker: Job completed', { jobId: job.id });
});

taskWorker.on('failed', (job, err) => {
  logger.error('TaskWorker: Job failed', {
    jobId: job?.id,
    error: err.message,
  });
});

export default taskWorker;
