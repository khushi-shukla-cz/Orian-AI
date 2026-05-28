import { Router } from 'express';
import { WorkflowController } from '../controllers/workflowController';
import { MVPController } from '../controllers/mvpController';

const router = Router();
const workflowController = new WorkflowController();
const mvpController = new MVPController();

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

// MVP routes (in-memory small-scope endpoints for early product)
router.post('/mvp/workflows', (req, res, next) => mvpController.create(req, res, next));
router.get('/mvp/workflows', (req, res, next) => mvpController.list(req, res, next));
router.get('/mvp/workflows/:id', (req, res, next) => mvpController.get(req, res, next));
