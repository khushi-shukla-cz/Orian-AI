import { PlannerAgent } from '../agents/planner';
import Workflow from '../models/Workflow';
import Task from '../models/Task';
import Log from '../models/Log';
import { taskQueue } from '../queues';
import { WorkflowValidator } from '../utils/validators';
import logger from '../utils/logger';
import { emitWorkflowUpdate, emitLogEvent } from '../sockets';

export class WorkflowService {
  private plannerAgent: PlannerAgent;

  constructor() {
    this.plannerAgent = new PlannerAgent();
  }

  async createWorkflow(input: string, name?: string): Promise<any> {
    logger.info('WorkflowService: Creating new workflow', { input: input.substring(0, 100) });

    let workflow: any | null = null;

    try {
      // Create initial workflow document
      workflow = await Workflow.create({
        name: name || 'Untitled Workflow',
        description: input.substring(0, 200),
        input,
        status: 'planning',
        metrics: {
          startTime: new Date(),
          tasksCompleted: 0,
          tasksFailed: 0,
          totalRetries: 0,
        },
      });

      emitWorkflowUpdate(workflow._id.toString(), {
        status: 'planning',
      });

      await Log.create({
        workflowId: workflow._id.toString(),
        level: 'INFO',
        agent: 'planner',
        action: 'workflow_start',
        message: 'Workflow creation started',
      });

      emitLogEvent(workflow._id.toString(), {
        level: 'INFO',
        message: 'Planning workflow...',
        timestamp: new Date(),
      });

      // Use planner agent to create task graph
      const workflowPlan = await this.plannerAgent.plan(input);

      // Validate the plan
      const validation = WorkflowValidator.validateWorkflow(workflowPlan);
      if (!validation.valid) {
        throw new Error(`Invalid workflow plan: ${validation.errors.join(', ')}`);
      }

      // Sort tasks topologically
      const sortedTasks = WorkflowValidator.topologicalSort(workflowPlan.workflow);

      // Update workflow with graph
      workflow.graph = {
        tasks: sortedTasks.map((t) => ({
          id: t.id,
          type: t.type,
          description: t.description,
          inputs: t.inputs || {},
          outputs: t.outputs || {},
          dependencies: t.dependencies,
          priority: t.priority,
        })),
      };
      workflow.status = 'executing';
      await workflow.save();

      // Create task documents
      const taskPromises = sortedTasks.map((task) =>
        Task.create({
          workflowId: workflow._id.toString(),
          taskId: task.id,
          type: task.type,
          description: task.description,
          inputs: task.inputs || {},
          outputs: task.outputs || {},
          dependencies: task.dependencies,
          priority: task.priority,
          status: 'pending',
          retries: 0,
          maxRetries: 3,
        })
      );

      await Promise.all(taskPromises);

      await Log.create({
        workflowId: workflow._id.toString(),
        level: 'INFO',
        agent: 'planner',
        action: 'plan_complete',
        message: `Workflow plan created with ${sortedTasks.length} tasks`,
      });

      emitLogEvent(workflow._id.toString(), {
        level: 'INFO',
        message: `Plan created: ${sortedTasks.length} tasks`,
        timestamp: new Date(),
      });

      emitWorkflowUpdate(workflow._id.toString(), {
        status: 'executing',
        taskCount: sortedTasks.length,
      });

      // Start executing tasks
      await this.executeWorkflow(workflow._id.toString());

      return {
        workflowId: workflow._id.toString(),
        status: workflow.status,
        taskCount: sortedTasks.length,
      };
    } catch (error: any) {
      if (workflow?._id) {
        await Workflow.findByIdAndUpdate(workflow._id.toString(), {
          status: 'failed',
          error: error.message,
          'metrics.endTime': new Date(),
        });

        emitWorkflowUpdate(workflow._id.toString(), {
          status: 'failed',
          error: error.message,
        });

        await Log.create({
          workflowId: workflow._id.toString(),
          level: 'ERROR',
          agent: 'planner',
          action: 'workflow_create_failed',
          message: error.message,
        });
      }

      logger.error('WorkflowService: Failed to create workflow', {
        error: error.message,
      });
      throw error;
    }
  }

  async executeWorkflow(workflowId: string): Promise<void> {
    logger.info('WorkflowService: Starting workflow execution', { workflowId });

    try {
      const workflow = await Workflow.findById(workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const tasks = await Task.find({ workflowId }).sort({ priority: 1 });

      // Build context for task execution
      const context: Record<string, any> = {
        originalInput: workflow.input,
      };

      // Execute tasks in topological order
      await this.executeTasks(workflowId, tasks, context);

      logger.info('WorkflowService: All tasks queued for execution', {
        workflowId,
      });
    } catch (error: any) {
      logger.error('WorkflowService: Workflow execution error', {
        workflowId,
        error: error.message,
      });

      await Workflow.findByIdAndUpdate(workflowId, {
        status: 'failed',
        error: error.message,
        'metrics.endTime': new Date(),
      });

      emitWorkflowUpdate(workflowId, {
        status: 'failed',
        error: error.message,
      });
    }
  }

  private async executeTasks(
    workflowId: string,
    tasks: any[],
    context: Record<string, any>
  ): Promise<void> {
    const taskMap = new Map(tasks.map((t) => [t.taskId, t]));
    const completedTasks = new Set<string>();

    const executeTask = async (taskId: string): Promise<void> => {
      const task = taskMap.get(taskId);
      if (!task || completedTasks.has(taskId)) {
        return;
      }

      // Wait for dependencies
      const depPromises = task.dependencies.map((depId: string) => executeTask(depId));
      await Promise.all(depPromises);

      // Add dependency results to context
      for (const depId of task.dependencies) {
        const depTask = await Task.findOne({ workflowId, taskId: depId });
        if (depTask && depTask.result) {
          context[depId] = depTask.result;
        }
      }

      // Queue the task
      await taskQueue.add(
        `task-${taskId}`,
        {
          workflowId,
          task: {
            id: task.taskId,
            type: task.type,
            description: task.description,
            inputs: task.inputs,
            outputs: task.outputs,
            dependencies: task.dependencies,
            priority: task.priority,
          },
          context,
        },
        {
          priority: task.priority,
        }
      );

      completedTasks.add(taskId);
    };

    // Execute all tasks
    const rootTasks = tasks.filter((t) => t.dependencies.length === 0);
    await Promise.all(rootTasks.map((t) => executeTask(t.taskId)));

    // Monitor completion
    this.monitorWorkflowCompletion(workflowId, tasks.length);
  }

  private async monitorWorkflowCompletion(workflowId: string, totalTasks: number): Promise<void> {
    const checkInterval = setInterval(async () => {
      const workflow = await Workflow.findById(workflowId);
      if (!workflow) {
        clearInterval(checkInterval);
        return;
      }

      const completedCount = await Task.countDocuments({
        workflowId,
        status: 'completed',
      });

      const failedCount = await Task.countDocuments({
        workflowId,
        status: 'failed',
      });

      if (completedCount + failedCount >= totalTasks) {
        clearInterval(checkInterval);

        const finalStatus = failedCount > 0 ? 'failed' : 'completed';
        const endTime = new Date();
        const duration = workflow.metrics.startTime
          ? endTime.getTime() - workflow.metrics.startTime.getTime()
          : 0;

        await Workflow.findByIdAndUpdate(workflowId, {
          status: finalStatus,
          'metrics.endTime': endTime,
          'metrics.duration': duration,
        });

        await Log.create({
          workflowId,
          level: 'INFO',
          agent: 'orchestrator',
          action: 'workflow_complete',
          message: `Workflow ${finalStatus}: ${completedCount} completed, ${failedCount} failed`,
        });

        emitWorkflowUpdate(workflowId, {
          status: finalStatus,
          completedCount,
          failedCount,
          duration,
        });

        emitLogEvent(workflowId, {
          level: 'INFO',
          message: `Workflow ${finalStatus}! Duration: ${Math.round(duration / 1000)}s`,
          timestamp: new Date(),
        });
      }
    }, 2000); // Check every 2 seconds
  }

  async getWorkflow(workflowId: string): Promise<any> {
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const tasks = await Task.find({ workflowId });
    const logs = await Log.find({ workflowId }).sort({ timestamp: -1 }).limit(100);

    return {
      workflow,
      tasks,
      logs,
    };
  }

  async listWorkflows(limit: number = 20): Promise<any[]> {
    return await Workflow.find().sort({ createdAt: -1 }).limit(limit);
  }

  async getMetrics(workflowId: string): Promise<any> {
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const tasks = await Task.find({ workflowId });

    const tasksByStatus = tasks.reduce((acc: any, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    const avgRetries =
      tasks.reduce((sum, task) => sum + task.retries, 0) / tasks.length || 0;

    return {
      ...workflow.metrics,
      tasksByStatus,
      avgRetries: avgRetries.toFixed(2),
      successRate: tasksByStatus.completed
        ? ((tasksByStatus.completed / tasks.length) * 100).toFixed(2)
        : 0,
    };
  }
}
