import { motion } from 'framer-motion';
import { getStatusColor, getTaskTypeIcon, getTaskTypeLabel } from '@/utils/helpers';
import type { WorkflowTask } from '@/types';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';

interface WorkflowTimelineProps {
  tasks: WorkflowTask[];
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ tasks }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />;
      case 'retrying':
        return <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNodeAnimation = (status: string) => {
    switch (status) {
      case 'running':
      case 'retrying':
        return {
          scale: [1, 1.2, 1],
          boxShadow: [
            '0 0 0 0 rgba(253, 230, 138, 0)',
            '0 0 0 10px rgba(253, 230, 138, 0.3)',
            '0 0 0 0 rgba(253, 230, 138, 0)',
          ],
        };
      case 'completed':
        return {
          scale: [0.8, 1],
        };
      case 'failed':
        return {
          x: [-5, 5, -5, 5, 0],
        };
      default:
        return {};
    }
  };

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute top-12 left-12 bottom-0 w-0.5 bg-gradient-to-b from-accent-lavender via-accent-pink to-accent-mint" />

      {/* Tasks */}
      <div className="space-y-6">
        {tasks.map((task, index) => (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="relative flex items-start gap-6"
          >
            {/* Node */}
            <motion.div
              className={`relative z-10 w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center shadow-medium ${
                task.status === 'running'
                  ? 'bg-accent-yellow/20 border-accent-yellow shadow-glow'
                  : task.status === 'completed'
                  ? 'bg-accent-mint/20 border-accent-mint'
                  : task.status === 'failed'
                  ? 'bg-red-50 border-red-300'
                  : 'bg-white border-gray-200'
              }`}
              animate={getNodeAnimation(task.status)}
              transition={{
                repeat: task.status === 'running' || task.status === 'retrying' ? Infinity : 0,
                duration: 2,
              }}
            >
              <div className="text-2xl mb-1">{getTaskTypeIcon(task.type)}</div>
              <div className={`text-xs font-medium ${getStatusColor(task.status)}`}>
                {getTaskTypeLabel(task.type)}
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 pt-2">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-base font-semibold text-text-primary">
                  {task.description}
                </h4>
                {getStatusIcon(task.status)}
              </div>

              {/* Task Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span>ID: {task.taskId}</span>
                  {task.agent && <span>Agent: {task.agent}</span>}
                  {task.retries > 0 && (
                    <span className="text-orange-600">Retries: {task.retries}</span>
                  )}
                </div>

                {task.dependencies.length > 0 && (
                  <div className="text-xs text-text-secondary">
                    Dependencies: {task.dependencies.join(', ')}
                  </div>
                )}

                {task.error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-sm text-red-700">{task.error}</p>
                  </motion.div>
                )}

                {task.result && task.status === 'completed' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 p-3 bg-accent-mint/10 border border-accent-mint rounded-lg"
                  >
                    <p className="text-sm text-green-700">
                      ✓ {typeof task.result === 'object' ? 'Task completed successfully' : task.result}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
