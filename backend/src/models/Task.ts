import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  workflowId: string;
  taskId: string;
  type: string;
  description: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  dependencies: string[];
  priority: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying' | 'skipped';
  agent?: string;
  retries: number;
  maxRetries: number;
  result?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    workflowId: {
      type: String,
      required: true,
      index: true,
    },
    taskId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    inputs: {
      type: Schema.Types.Mixed,
      default: {},
    },
    outputs: {
      type: Schema.Types.Mixed,
      default: {},
    },
    dependencies: [
      {
        type: String,
      },
    ],
    priority: {
      type: Number,
      default: 5,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'retrying', 'skipped'],
      default: 'pending',
      index: true,
    },
    agent: {
      type: String,
    },
    retries: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    result: {
      type: Schema.Types.Mixed,
    },
    error: {
      type: String,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Composite index for efficient querying
TaskSchema.index({ workflowId: 1, status: 1 });
TaskSchema.index({ workflowId: 1, taskId: 1 }, { unique: true });

export default mongoose.model<ITask>('Task', TaskSchema);
