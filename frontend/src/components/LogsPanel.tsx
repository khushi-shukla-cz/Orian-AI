import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { formatDate } from '@/utils/helpers';
import type { Log } from '@/types';
import { Info, AlertTriangle, XCircle, Bug } from 'lucide-react';

interface LogsPanelProps {
  logs: Log[];
  autoScroll?: boolean;
}

export const LogsPanel: React.FC<LogsPanelProps> = ({ logs, autoScroll = true }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'WARN':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'DEBUG':
        return <Bug className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'WARN':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'DEBUG':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface rounded-xl shadow-soft border border-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-text-primary">Event Logs</h3>
        <p className="text-sm text-text-secondary mt-1">
          Real-time workflow execution logs
        </p>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {logs.map((log, index) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`p-3 rounded-lg border ${getLevelColor(log.level)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getLevelIcon(log.level)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold">
                      {log.level}
                    </span>
                    {log.agent && (
                      <span className="text-xs px-2 py-0.5 bg-white/50 rounded">
                        {log.agent}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium break-words">{log.message}</p>
                  {log.taskId && (
                    <p className="text-xs text-gray-600 mt-1">Task: {log.taskId}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {logs.length === 0 && (
          <div className="flex items-center justify-center h-full text-text-secondary">
            <p className="text-sm">No logs yet</p>
          </div>
        )}

        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
