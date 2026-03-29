import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflow extends Document {
  name: string;
  description: string;
  input: string;
  graph: {
    tasks: Array<{
      id: string;
      type: string;
      description: string;
      inputs: Record<string, any>;
      outputs: Record<string, any>;
      dependencies: string[];
      priority: number;
    }>;
  };
  status: 'pending' | 'planning' | 'executing' | 'completed' | 'failed' | 'cancelled';
  currentTask?: string;
  results: Record<string, any>;
  metrics: {
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    tasksCompleted: number;
    tasksFailed: number;
    totalRetries: number;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    input: {
      type: String,
      required: true,
    },
    graph: {
      tasks: [
        {
          id: { type: String, required: true },
          type: { type: String, required: true },
          description: { type: String, required: true },
          inputs: { type: Schema.Types.Mixed, default: {} },
          outputs: { type: Schema.Types.Mixed, default: {} },
          dependencies: [{ type: String }],
          priority: { type: Number, default: 5 },
        },
      ],
    },
    status: {
      type: String,
      enum: ['pending', 'planning', 'executing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    currentTask: {
      type: String,
    },
    results: {
      type: Schema.Types.Mixed,
      default: {},
    },
    metrics: {
      startTime: Date,
      endTime: Date,
      duration: Number,
      tasksCompleted: { type: Number, default: 0 },
      tasksFailed: { type: Number, default: 0 },
      totalRetries: { type: Number, default: 0 },
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
WorkflowSchema.index({ createdAt: -1 });
WorkflowSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
