import { useCallback, useEffect } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { apiService } from '@/services/api';
import { socketService } from '@/services/socket';
import toast from 'react-hot-toast';
import type { CreateWorkflowRequest } from '@/types';

export const useWorkflow = (workflowId?: string) => {
  const {
    workflows,
    tasks,
    logs,
    loading,
    error,
    setWorkflow,
    setTasks,
    setLogs,
    updateWorkflow,
    updateTask,
    addLog,
    setCurrentWorkflow,
    setLoading,
    setError,
  } = useWorkflowStore();

  const workflow = workflowId ? workflows[workflowId] : null;
  const workflowTasks = workflowId ? tasks[workflowId] || [] : [];
  const workflowLogs = workflowId ? logs[workflowId] || [] : [];

  // Fetch workflow details
  const fetchWorkflow = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getWorkflow(id);

        if (response.success) {
          setWorkflow(response.data.workflow);
          setTasks(id, response.data.tasks);
          setLogs(id, response.data.logs);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch workflow');
      } finally {
        setLoading(false);
      }
    },
    [setWorkflow, setTasks, setLogs, setLoading, setError]
  );

  // Create new workflow
  const createWorkflow = useCallback(
    async (data: CreateWorkflowRequest) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.createWorkflow(data);

        if (response.success) {
          toast.success('Workflow created successfully!');
          return response.data.workflowId;
        }
      } catch (err: any) {
        setError(err.message || 'Failed to create workflow');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Subscribe to real-time updates
  useEffect(() => {
    if (!workflowId) return;

    socketService.subscribeToWorkflow(workflowId);

    const handleWorkflowUpdate = (data: any) => {
      if (data.workflowId === workflowId) {
        updateWorkflow(workflowId, {
          status: data.status,
          metrics: {
            ...workflow?.metrics,
            ...data,
          },
        });
      }
    };

    const handleTaskUpdate = (data: any) => {
      if (data.workflowId === workflowId) {
        updateTask(workflowId, data.taskId, {
          status: data.status,
          agent: data.agent,
          result: data.result,
          error: data.error,
          retries: data.retries,
        });
      }
    };

    const handleLogEvent = (data: any) => {
      if (data.workflowId === workflowId) {
        addLog(workflowId, {
          _id: `log-${Date.now()}`,
          workflowId: data.workflowId,
          level: data.level,
          action: 'event',
          message: data.message,
          timestamp: data.timestamp,
        });
      }
    };

    socketService.onWorkflowUpdate(handleWorkflowUpdate);
    socketService.onTaskUpdate(handleTaskUpdate);
    socketService.onLogEvent(handleLogEvent);

    return () => {
      socketService.unsubscribeFromWorkflow(workflowId);
      socketService.off('workflow_update', handleWorkflowUpdate);
      socketService.off('task_update', handleTaskUpdate);
      socketService.off('log_event', handleLogEvent);
    };
  }, [workflowId, workflow, updateWorkflow, updateTask, addLog]);

  return {
    workflow,
    tasks: workflowTasks,
    logs: workflowLogs,
    loading,
    error,
    fetchWorkflow,
    createWorkflow,
    setCurrentWorkflow,
  };
};
