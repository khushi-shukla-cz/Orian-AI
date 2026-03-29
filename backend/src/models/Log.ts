import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  workflowId: string;
  taskId?: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  agent?: string;
  action: string;
  message: string;
  meta?: Record<string, any>;
  timestamp: Date;
}

const LogSchema: Schema = new Schema(
  {
    workflowId: {
      type: String,
      required: true,
      index: true,
    },
    taskId: {
      type: String,
      index: true,
    },
    level: {
      type: String,
      enum: ['INFO', 'WARN', 'ERROR', 'DEBUG'],
      required: true,
      default: 'INFO',
    },
    agent: {
      type: String,
    },
    action: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    meta: {
      type: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Index for efficient log retrieval
LogSchema.index({ workflowId: 1, timestamp: -1 });

export default mongoose.model<ILog>('Log', LogSchema);
