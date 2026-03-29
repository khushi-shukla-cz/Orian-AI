import { motion } from 'framer-motion';
import { getStatusBadgeClass } from '@/utils/helpers';
import type { TaskStatus, WorkflowStatus } from '@/types';

interface StatusBadgeProps {
  status: TaskStatus | WorkflowStatus;
  animated?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, animated = true }) => {
  const Component = animated ? motion.span : 'span';

  const animationProps = animated
    ? {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component className={getStatusBadgeClass(status)} {...animationProps}>
      {status}
    </Component>
  );
};
