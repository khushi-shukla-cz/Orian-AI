import { io, Socket } from 'socket.io-client';
import type {
  WorkflowUpdateEvent,
  TaskUpdateEvent,
  LogEvent,
  MetricEvent,
} from '@/types';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket.IO disconnected');
    }
  }

  subscribeToWorkflow(workflowId: string): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('subscribe_workflow', workflowId);
    console.log('Subscribed to workflow:', workflowId);
  }

  unsubscribeFromWorkflow(workflowId: string): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('unsubscribe_workflow', workflowId);
    console.log('Unsubscribed from workflow:', workflowId);
  }

  onWorkflowUpdate(callback: (data: WorkflowUpdateEvent) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('workflow_update', callback);
  }

  onTaskUpdate(callback: (data: TaskUpdateEvent) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('task_update', callback);
  }

  onLogEvent(callback: (data: LogEvent) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('log_event', callback);
  }

  onMetricEvent(callback: (data: MetricEvent) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('metric_event', callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
