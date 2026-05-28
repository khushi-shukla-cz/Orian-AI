export type WorkflowStatus =
  | "pending"
  | "planning"
  | "executing"
  | "completed"
  | "failed"
  | "cancelled";
export type TaskStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "retrying"
  | "skipped";
export type TaskType =
  | "email_send"
  | "calendar_create"
  | "slack_notify"
  | "notion_create"
  | "summarize_text";
export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export interface Task {
  id: string;
  type: TaskType;
  description: string;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  dependencies: string[];
  priority: number;
}

export interface WorkflowTask extends Task {
  _id: string;
  workflowId: string;
  taskId: string;
  status: TaskStatus;
  agent?: string;
  retries: number;
  maxRetries: number;
  result?: any;
  error?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  _id: string;
  name: string;
  description: string;
  input: string;
  graph: {
    tasks: Task[];
  };
  status: WorkflowStatus;
  currentTask?: string;
  results: Record<string, any>;
  metrics: {
    startTime?: string;
    endTime?: string;
    duration?: number;
    tasksCompleted: number;
    tasksFailed: number;
    totalRetries: number;
  };
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Log {
  _id: string;
  workflowId: string;
  taskId?: string;
  level: LogLevel;
  agent?: string;
  action: string;
  message: string;
  meta?: Record<string, any>;
  timestamp: string;
}

export interface WorkflowMetrics {
  startTime?: string;
  endTime?: string;
  duration?: number;
  tasksCompleted: number;
  tasksFailed: number;
  totalRetries: number;
  tasksByStatus: Record<TaskStatus, number>;
  avgRetries: string;
  successRate: string;
}

export interface SocketEvent {
  workflowId: string;
  timestamp: string;
}

export interface WorkflowUpdateEvent extends SocketEvent {
  status?: WorkflowStatus;
  taskCount?: number;
  completedCount?: number;
  failedCount?: number;
  duration?: number;
  error?: string;
}

export interface TaskUpdateEvent extends SocketEvent {
  taskId: string;
  status?: TaskStatus;
  agent?: string;
  result?: any;
  error?: string;
  retries?: number;
}

export interface LogEvent extends SocketEvent {
  level: LogLevel;
  message: string;
}

export interface MetricEvent extends SocketEvent {
  metric: string;
  value: any;
}

export interface CreateWorkflowRequest {
  input: string;
  name?: string;
}

export interface CreateWorkflowResponse {
  success: boolean;
  data: {
    workflowId: string;
    status: WorkflowStatus;
    taskCount: number;
  };
}

export interface WorkflowDetailsResponse {
  success: boolean;
  data: {
    workflow: Workflow;
    tasks: WorkflowTask[];
    logs: Log[];
  };
}

export interface SimulateWorkflowRequest {
  input: string;
}

export interface SimulateWorkflowResponse {
  success: boolean;
  data: {
    plan: Task[];
    predicted_duration: number;
    predicted_failures: number;
    confidence_score: number;
    task_count: number;
  };
}

export interface MvpWorkflowLog {
  level: LogLevel;
  message: string;
  timestamp: string;
}

export interface MvpWorkflow {
  id: string;
  name: string;
  input: string;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  logs: MvpWorkflowLog[];
}

export interface CreateMvpWorkflowRequest {
  input: string;
  name?: string;
}

export interface CreateMvpWorkflowResponse {
  success: boolean;
  data: {
    id: string;
    status: WorkflowStatus;
    name: string;
  };
}

export interface ListMvpWorkflowsResponse {
  success: boolean;
  data: MvpWorkflow[];
}

export interface GetMvpWorkflowResponse {
  success: boolean;
  data: MvpWorkflow;
}
