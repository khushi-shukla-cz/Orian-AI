import { useState, useEffect, useCallback } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { apiService } from '@/services/api';

export const useWorkflowList = () => {
  const { workflows, setWorkflows, setLoading, setError } = useWorkflowStore();
  const [refreshKey, setRefreshKey] = useState(0);

  const workflowList = Object.values(workflows).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const fetchWorkflows = useCallback(
    async (limit: number = 20) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.listWorkflows(limit);

        if (response.success) {
          setWorkflows(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch workflows');
      } finally {
        setLoading(false);
      }
    },
    [setWorkflows, setLoading, setError]
  );

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [refreshKey, fetchWorkflows]);

  return {
    workflows: workflowList,
    fetchWorkflows,
    refresh,
  };
};
