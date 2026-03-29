import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWorkflowList } from '@/hooks/useWorkflowList';
import { useWorkflow } from '@/hooks/useWorkflow';
import { WorkflowCard } from '@/components/WorkflowCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Plus, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { workflows, refresh } = useWorkflowList();
  const { createWorkflow } = useWorkflow();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const trimmedInput = input.trim();
  const isInputValid = trimmedInput.length >= 10;

  const handleCreateWorkflow = async () => {
    if (!trimmedInput) {
      toast.error('Please enter workflow instructions');
      return;
    }

    if (!isInputValid) {
      toast.error('Instructions must be at least 10 characters');
      return;
    }

    setIsCreating(true);

    try {
      const workflowId = await createWorkflow({
        input: trimmedInput,
        name: name.trim() || undefined,
      });

      if (workflowId) {
        setShowCreateModal(false);
        setInput('');
        setName('');
        navigate(`/workflow/${workflowId}`);
      }
    } catch (error) {
      // Error already handled by hook
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent-yellow/10 via-accent-pink/10 to-accent-lavender/10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-accent-lavender" />
              <h1 className="text-display-sm font-display text-gradient">
                Orion AI
              </h1>
            </div>
            <p className="text-lg text-text-secondary max-w-2xl">
              Autonomous workflow orchestration powered by multi-agent AI. Convert natural language
              into executable workflows that run themselves.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">Your Workflows</h2>
            <p className="text-sm text-text-secondary mt-1">
              {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refresh}
              className="px-4 py-2 bg-surface border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Workflow
            </motion.button>
          </div>
        </div>

        {/* Workflows Grid */}
        {workflows.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-accent-lavender/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-accent-lavender" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No workflows yet
            </h3>
            <p className="text-text-secondary mb-6">
              Create your first autonomous workflow to get started
            </p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create Workflow
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow, index) => (
              <WorkflowCard key={workflow._id} workflow={workflow} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !isCreating && setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-2xl shadow-strong max-w-2xl w-full p-8"
          >
            <h2 className="text-2xl font-semibold text-text-primary mb-2">
              Create New Workflow
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              Describe what you want to accomplish in natural language
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Workflow Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Weekly Team Update"
                  className="input-field"
                  disabled={isCreating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Instructions
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g., Send a summary email to team@company.com and schedule a follow-up meeting for next week"
                  className="input-field min-h-[150px] resize-none"
                  disabled={isCreating}
                />
                <p className="text-xs text-text-secondary mt-2">
                  Minimum 10 characters ({trimmedInput.length}/10)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={isCreating}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                disabled={isCreating || !isInputValid}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Workflow
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
