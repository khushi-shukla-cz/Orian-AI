import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { apiService } from "@/services/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { LogsPanel } from "@/components/LogsPanel";
import { StatusBadge } from "@/components/StatusBadge";
import type { Log, MvpWorkflow } from "@/types";
import {
  Plus,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Clock,
  Hash,
} from "lucide-react";

const POLL_INTERVAL_MS = 2500;

function mapLogs(workflow: MvpWorkflow | null): Log[] {
  if (!workflow) return [];

  return workflow.logs.map((log, index) => ({
    _id: `${workflow.id}-${index}`,
    workflowId: workflow.id,
    level: log.level,
    action: "mvp_event",
    message: log.message,
    timestamp: log.timestamp,
  }));
}

export const MvpDashboard: React.FC = () => {
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [workflows, setWorkflows] = useState<MvpWorkflow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<MvpWorkflow | null>(
    null,
  );
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [creating, setCreating] = useState(false);

  const trimmedInput = input.trim();
  const canSubmit = trimmedInput.length >= 5 && !creating;

  const fetchWorkflows = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await apiService.listMvpWorkflows(50);
      if (response.success) {
        setWorkflows(response.data);
        setSelectedWorkflow((current) => {
          if (!selectedId) return current;
          const match = response.data.find(
            (workflow) => workflow.id === selectedId,
          );
          return match || current;
        });
      }
    } catch {
      // Toasts are handled by apiService
    } finally {
      setLoadingList(false);
    }
  }, [selectedId]);

  const fetchWorkflowDetail = useCallback(async (workflowId: string) => {
    setLoadingDetail(true);
    try {
      const response = await apiService.getMvpWorkflow(workflowId);
      if (response.success) {
        setSelectedWorkflow(response.data);
      }
    } catch {
      // Toasts are handled by apiService
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleCreate = async () => {
    if (!canSubmit) {
      toast.error("Enter at least 5 characters");
      return;
    }

    setCreating(true);
    try {
      const response = await apiService.createMvpWorkflow({
        input: trimmedInput,
        name: name.trim() || undefined,
      });

      if (response.success) {
        toast.success("MVP workflow created");
        setInput("");
        setName("");
        await fetchWorkflows();
        setSelectedId(response.data.id);
        await fetchWorkflowDetail(response.data.id);
      }
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    const timer = window.setInterval(fetchWorkflows, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [fetchWorkflows]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedWorkflow(null);
      return;
    }

    fetchWorkflowDetail(selectedId);
    const timer = window.setInterval(
      () => fetchWorkflowDetail(selectedId),
      POLL_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [selectedId, fetchWorkflowDetail]);

  useEffect(() => {
    if (!selectedId && workflows.length > 0) {
      setSelectedId(workflows[0].id);
    }
  }, [selectedId, workflows]);

  const selectedLogs = useMemo(
    () => mapLogs(selectedWorkflow),
    [selectedWorkflow],
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-accent-yellow/10 via-accent-pink/10 to-accent-lavender/10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-8 h-8 text-accent-lavender animate-float" />
              <div>
                <h1 className="text-display-sm font-display text-gradient">
                  Orion AI MVP
                </h1>
                <p className="text-text-secondary">
                  Create a workflow, watch it execute, and inspect its live
                  status.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-5 gap-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="xl:col-span-2 card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                New Workflow
              </h2>
              <p className="text-sm text-text-secondary">
                Create a minimal workflow from plain text.
              </p>
            </div>
            <button
              onClick={fetchWorkflows}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Workflow Name
              </label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Weekly update"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Instructions
              </label>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Send a summary email to the team and mark the workflow complete"
                className="input-field min-h-[180px] resize-none"
              />
              <p className="text-xs text-text-secondary mt-2">
                Minimum 5 characters.
              </p>
            </div>

            <button
              onClick={handleCreate}
              disabled={!canSubmit}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Workflow
                </>
              )}
            </button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-1 card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Workflows
              </h2>
              <p className="text-sm text-text-secondary">
                {workflows.length} total
              </p>
            </div>
            <Hash className="w-5 h-5 text-accent-lavender" />
          </div>

          {loadingList ? (
            <div className="py-10 flex justify-center">
              <LoadingSpinner size="md" text="Loading workflows..." />
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-10 text-text-secondary">
              No MVP workflows yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[720px] overflow-y-auto no-scrollbar pr-1">
              {workflows.map((workflow) => {
                const isActive = selectedId === workflow.id;
                return (
                  <button
                    key={workflow.id}
                    onClick={() => setSelectedId(workflow.id)}
                    className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${
                      isActive
                        ? "border-accent-lavender bg-accent-lavender/10 shadow-soft"
                        : "border-gray-200 bg-white hover:border-accent-lavender/40 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-text-primary truncate">
                          {workflow.name}
                        </p>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                          {workflow.input}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-secondary shrink-0" />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <StatusBadge status={workflow.status} animated={false} />
                      <span className="text-xs text-text-secondary flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(workflow.updatedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="xl:col-span-2 space-y-6"
        >
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  Workflow Details
                </h2>
                <p className="text-sm text-text-secondary">
                  Live status and execution log stream.
                </p>
              </div>
              {selectedWorkflow && (
                <StatusBadge status={selectedWorkflow.status} />
              )}
            </div>

            {!selectedWorkflow ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-text-secondary">
                Select a workflow to inspect status and logs.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-text-secondary mb-1">
                      Name
                    </p>
                    <p className="font-semibold text-text-primary">
                      {selectedWorkflow.name}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-text-secondary mb-1">
                      Updated
                    </p>
                    <p className="font-semibold text-text-primary">
                      {new Date(selectedWorkflow.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-gray-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-text-secondary mb-2">
                    Instructions
                  </p>
                  <p className="text-sm text-text-primary leading-6 whitespace-pre-wrap">
                    {selectedWorkflow.input}
                  </p>
                </div>

                <div className="rounded-xl bg-white border border-gray-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-text-secondary mb-2">
                    Log stream
                  </p>
                  {loadingDetail && selectedLogs.length === 0 ? (
                    <div className="py-6">
                      <LoadingSpinner
                        size="sm"
                        text="Syncing workflow details..."
                      />
                    </div>
                  ) : (
                    <LogsPanel logs={selectedLogs} />
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
};
