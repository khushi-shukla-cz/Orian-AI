import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWorkflow } from '@/hooks/useWorkflow';
import { WorkflowTimeline } from '@/components/WorkflowTimeline';
import { LogsPanel } from '@/components/LogsPanel';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDate, formatDuration } from '@/utils/helpers';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Layers,
} from 'lucide-react';

export const WorkflowDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workflow, tasks, logs, loading, fetchWorkflow } = useWorkflow(id);

  useEffect(() => {
    if (id) {
      fetchWorkflow(id);
    }
  }, [id, fetchWorkflow]);

  if (loading && !workflow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading workflow..." />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Workflow not found</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const failedTasks = tasks.filter((t) => t.status === 'failed').length;
  const runningTasks = tasks.filter((t) => t.status === 'running').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent-yellow/10 via-accent-pink/10 to-accent-lavender/10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold text-text-primary mb-2">
                  {workflow.name}
                </h1>
                <p className="text-text-secondary mb-4">{workflow.description}</p>

                <div className="flex items-center gap-4">
                  <StatusBadge status={workflow.status} />

                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Calendar className="w-4 h-4" />
                    {formatDate(workflow.createdAt)}
                  </div>

                  {workflow.metrics.duration && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Clock className="w-4 h-4" />
                      {formatDuration(workflow.metrics.duration)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-sky/20 flex items-center justify-center">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Tasks</p>
                <p className="text-2xl font-semibold text-text-primary">{totalTasks}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-mint/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Completed</p>
                <p className="text-2xl font-semibold text-green-600">{completedTasks}</p>
              </div>
            </div>
          </motion.div>

          {runningTasks > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent-yellow/20 flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-yellow-600 animate-spin" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Running</p>
                  <p className="text-2xl font-semibold text-yellow-600">{runningTasks}</p>
                </div>
              </div>
            </motion.div>
          )}

          {failedTasks > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Failed</p>
                  <p className="text-2xl font-semibold text-red-600">{failedTasks}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-8"
            >
              <h2 className="text-xl font-semibold text-text-primary mb-6">
                Workflow Timeline
              </h2>
              {tasks.length > 0 ? (
                <WorkflowTimeline tasks={tasks} />
              ) : (
                <div className="text-center py-12 text-text-secondary">
                  No tasks available
                </div>
              )}
            </motion.div>
          </div>

          {/* Logs Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="h-[800px]"
            >
              <LogsPanel logs={logs} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
