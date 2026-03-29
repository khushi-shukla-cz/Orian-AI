import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { formatRelativeTime, formatDuration, calculateProgress, truncateText } from '@/utils/helpers';
import type { Workflow } from '@/types';
import { Play, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface WorkflowCardProps {
  workflow: Workflow;
  index?: number;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, index = 0 }) => {
  const navigate = useNavigate();

  const totalTasks = workflow.graph.tasks.length;
  const progress = calculateProgress(workflow.metrics.tasksCompleted, totalTasks);

  const handleClick = () => {
    navigate(`/workflow/${workflow._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={handleClick}
      className="card card-hover p-6 cursor-pointer bg-gradient-to-br from-white to-gray-50/50 border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-1 line-clamp-1">
            {workflow.name}
          </h3>
          <p className="text-sm text-text-secondary line-clamp-2">
            {truncateText(workflow.description || workflow.input, 120)}
          </p>
        </div>
        <StatusBadge status={workflow.status} />
      </div>

      {/* Progress Bar */}
      {workflow.status === 'executing' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">Progress</span>
            <span className="text-xs font-medium text-text-primary">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-yellow to-accent-peach"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-sky/20 flex items-center justify-center">
            <Play className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-text-secondary">Tasks</p>
            <p className="text-sm font-semibold text-text-primary">{totalTasks}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-mint/20 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-text-secondary">Done</p>
            <p className="text-sm font-semibold text-text-primary">
              {workflow.metrics.tasksCompleted}
            </p>
          </div>
        </div>

        {workflow.metrics.tasksFailed > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Failed</p>
              <p className="text-sm font-semibold text-red-600">
                {workflow.metrics.tasksFailed}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Clock className="w-3 h-3" />
          {formatRelativeTime(workflow.createdAt)}
        </div>

        {workflow.metrics.duration && (
          <div className="text-xs font-medium text-text-primary">
            {formatDuration(workflow.metrics.duration)}
          </div>
        )}
      </div>
    </motion.div>
  );
};
