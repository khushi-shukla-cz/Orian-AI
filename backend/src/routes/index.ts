import { Router } from 'express';
import { WorkflowController } from '../controllers/workflowController';

const router = Router();
const workflowController = new WorkflowController();

// Workflow routes
router.post('/workflows', (req, res, next) => workflowController.createWorkflow(req, res, next));
router.get('/workflows', (req, res, next) => workflowController.listWorkflows(req, res, next));
router.get('/workflows/:id', (req, res, next) => workflowController.getWorkflow(req, res, next));
router.get('/workflows/:id/metrics', (req, res, next) =>
  workflowController.getMetrics(req, res, next)
);
router.post('/workflows/simulate', (req, res, next) =>
  workflowController.simulateWorkflow(req, res, next)
);

// Health check
router.get('/health', (_req, res) => {
  void _req;
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
