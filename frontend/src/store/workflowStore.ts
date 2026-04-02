import { create } from 'zustand';
import type { Workflow, WorkflowTask, Log } from '@/types';

interface WorkflowStore {
  workflows: Record<string, Workflow>;
  tasks: Record<string, WorkflowTask[]>;
  logs: Record<string, Log[]>;
  currentWorkflowId: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  setWorkflows: (workflows: Workflow[]) => void;
  setWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (workflowId: string, updates: Partial<Workflow>) => void;
  setTasks: (workflowId: string, tasks: WorkflowTask[]) => void;
  updateTask: (workflowId: string, taskId: string, updates: Partial<WorkflowTask>) => void;
  setLogs: (workflowId: string, logs: Log[]) => void;
  addLog: (workflowId: string, log: Log) => void;
  setCurrentWorkflow: (workflowId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearWorkflow: (workflowId: string) => void;
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  workflows: {},
  tasks: {},
  logs: {},
  currentWorkflowId: null,
  loading: false,
  error: null,

  setWorkflows: (workflows) =>
    set((state) => ({
      workflows: workflows.reduce(
        (acc, w) => {
          acc[w._id] = w;
          return acc;
        },
        { ...state.workflows }
      ),
    })),

  setWorkflow: (workflow) =>
    set((state) => ({
      workflows: {
        ...state.workflows,
        [workflow._id]: workflow,
      },
    })),

  updateWorkflow: (workflowId, updates) =>
    set((state) => ({
      workflows: {
        ...state.workflows,
        [workflowId]: {
          ...state.workflows[workflowId],
          ...updates,
        },
      },
    })),

  setTasks: (workflowId, tasks) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [workflowId]: tasks,
      },
    })),

  updateTask: (workflowId, taskId, updates) =>
    set((state) => {
      const workflowTasks = state.tasks[workflowId] || [];
      const updatedTasks = workflowTasks.map((task) =>
        task.taskId === taskId ? { ...task, ...updates } : task
      );

      return {
        tasks: {
          ...state.tasks,
          [workflowId]: updatedTasks,
        },
      };
    }),

  setLogs: (workflowId, logs) =>
    set((state) => ({
      logs: {
        ...state.logs,
        [workflowId]: logs,
      },
    })),

  addLog: (workflowId, log) =>
    set((state) => {
      const workflowLogs = state.logs[workflowId] || [];
      return {
        logs: {
          ...state.logs,
          [workflowId]: [log, ...workflowLogs].slice(0, 100), // Keep last 100 logs
        },
      };
    }),

  setCurrentWorkflow: (workflowId) =>
    set({
      currentWorkflowId: workflowId,
    }),

  setLoading: (loading) =>
    set({
      loading,
    }),

  setError: (error) =>
    set({
      error,
    }),

  clearWorkflow: (workflowId) =>
    set((state) => {
      const remainingWorkflows = { ...state.workflows };
      delete remainingWorkflows[workflowId];

      const remainingTasks = { ...state.tasks };
      delete remainingTasks[workflowId];

      const remainingLogs = { ...state.logs };
      delete remainingLogs[workflowId];

      return {
        workflows: remainingWorkflows,
        tasks: remainingTasks,
        logs: remainingLogs,
        currentWorkflowId:
          state.currentWorkflowId === workflowId ? null : state.currentWorkflowId,
      };
    }),

  reset: () =>
    set({
      workflows: {},
      tasks: {},
      logs: {},
      currentWorkflowId: null,
      loading: false,
      error: null,
    }),
}));
