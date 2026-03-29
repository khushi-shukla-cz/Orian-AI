import { Request, Response, NextFunction } from 'express';
import { WorkflowService } from '../services/workflowService';
import logger from '../utils/logger';
import { z } from 'zod';

const workflowService = new WorkflowService();

// Request validation schemas
const CreateWorkflowSchema = z.object({
  input: z.string().min(10, 'Input must be at least 10 characters'),
  name: z.string().optional(),
});

const SimulateWorkflowSchema = z.object({
  input: z.string().min(10, 'Input must be at least 10 characters'),
});

export class WorkflowController {
  async createWorkflow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData = CreateWorkflowSchema.parse(req.body);

      logger.info('WorkflowController: Creating workflow', {
        input: validatedData.input.substring(0, 50),
      });

      const result = await workflowService.createWorkflow(
        validatedData.input,
        validatedData.name
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('WorkflowController: Failed to create workflow', {
        error: error.message,
      });

      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues,
        });
      } else if (
        /anthropic_api_key|api key|authentication|unauthorized|forbidden/i.test(
          error?.message || ''
        )
      ) {
        res.status(503).json({
          success: false,
          error:
            'AI planner is not configured. Set a valid ANTHROPIC_API_KEY in backend/.env and retry.',
        });
      } else {
        next(error);
      }
    }
  }

  async getWorkflow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      logger.info('WorkflowController: Fetching workflow', { workflowId: id });

      const result = await workflowService.getWorkflow(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('WorkflowController: Failed to fetch workflow', {
        error: error.message,
      });
      next(error);
    }
  }

  async listWorkflows(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      logger.info('WorkflowController: Listing workflows', { limit });

      const result = await workflowService.listWorkflows(limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('WorkflowController: Failed to list workflows', {
        error: error.message,
      });
      next(error);
    }
  }

  async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      logger.info('WorkflowController: Fetching metrics', { workflowId: id });

      const result = await workflowService.getMetrics(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('WorkflowController: Failed to fetch metrics', {
        error: error.message,
      });
      next(error);
    }
  }

  async simulateWorkflow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData = SimulateWorkflowSchema.parse(req.body);

      logger.info('WorkflowController: Simulating workflow', {
        input: validatedData.input.substring(0, 50),
      });

      // For simulation, we only run the planner agent
      const { PlannerAgent } = await import('../agents/planner');
      const plannerAgent = new PlannerAgent();

      const plan = await plannerAgent.plan(validatedData.input);

      // Estimate duration and confidence
      const estimatedDuration = plan.workflow.length * 5000; // 5 seconds per task average
      const confidence = 0.85; // Mock confidence score

      res.status(200).json({
        success: true,
        data: {
          plan: plan.workflow,
          predicted_duration: estimatedDuration,
          predicted_failures: 0,
          confidence_score: confidence,
          task_count: plan.workflow.length,
        },
      });
    } catch (error: any) {
      logger.error('WorkflowController: Failed to simulate workflow', {
        error: error.message,
      });

      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues,
        });
      } else if (
        /anthropic_api_key|api key|authentication|unauthorized|forbidden/i.test(
          error?.message || ''
        )
      ) {
        res.status(503).json({
          success: false,
          error:
            'AI planner is not configured. Set a valid ANTHROPIC_API_KEY in backend/.env and retry.',
        });
      } else {
        next(error);
      }
    }
  }
}
