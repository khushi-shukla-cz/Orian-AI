import { z } from 'zod';

// Task type validation
export const TaskTypeSchema = z.enum([
  'email_send',
  'calendar_create',
  'slack_notify',
  'notion_create',
  'summarize_text',
]);

export type TaskType = z.infer<typeof TaskTypeSchema>;

// Task schema
export const TaskSchema = z.object({
  id: z.string(),
  type: TaskTypeSchema,
  description: z.string(),
  inputs: z.record(z.any()).optional().default({}),
  outputs: z.record(z.any()).optional().default({}),
  dependencies: z.array(z.string()).default([]),
  priority: z.number().min(1).max(10).default(5),
});

export type Task = z.infer<typeof TaskSchema>;

// Workflow schema
export const WorkflowSchema = z.object({
  workflow: z.array(TaskSchema),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

// Validation functions
export class WorkflowValidator {
  static validateWorkflow(workflow: Workflow): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for cycles
    if (this.hasCycles(workflow.workflow)) {
      errors.push('Workflow contains circular dependencies');
    }

    // Check all dependencies exist
    const taskIds = new Set(workflow.workflow.map((t) => t.id));
    for (const task of workflow.workflow) {
      for (const dep of task.dependencies) {
        if (!taskIds.has(dep)) {
          errors.push(`Task ${task.id} depends on non-existent task ${dep}`);
        }
      }
    }

    // Check for duplicate IDs
    const uniqueIds = new Set(workflow.workflow.map((t) => t.id));
    if (uniqueIds.size !== workflow.workflow.length) {
      errors.push('Workflow contains duplicate task IDs');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private static hasCycles(tasks: Task[]): boolean {
    const graph = new Map<string, string[]>();
    
    // Build adjacency list
    for (const task of tasks) {
      graph.set(task.id, task.dependencies);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (taskId: string): boolean => {
      visited.add(taskId);
      recStack.add(taskId);

      const deps = graph.get(taskId) || [];
      for (const dep of deps) {
        if (!visited.has(dep)) {
          if (dfs(dep)) return true;
        } else if (recStack.has(dep)) {
          return true;
        }
      }

      recStack.delete(taskId);
      return false;
    };

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        if (dfs(task.id)) return true;
      }
    }

    return false;
  }

  static topologicalSort(tasks: Task[]): Task[] {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const taskMap = new Map<string, Task>();

    // Initialize
    for (const task of tasks) {
      graph.set(task.id, task.dependencies);
      inDegree.set(task.id, task.dependencies.length);
      taskMap.set(task.id, task);
    }

    const queue: string[] = [];
    const result: Task[] = [];

    // Find tasks with no dependencies
    for (const [taskId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(taskId);
      }
    }

    while (queue.length > 0) {
      const taskId = queue.shift()!;
      const task = taskMap.get(taskId)!;
      result.push(task);

      // Update in-degrees for dependent tasks
      for (const [id, deps] of graph.entries()) {
        if (deps.includes(taskId)) {
          const newDegree = (inDegree.get(id) || 0) - 1;
          inDegree.set(id, newDegree);
          if (newDegree === 0) {
            queue.push(id);
          }
        }
      }
    }

    return result;
  }
}
