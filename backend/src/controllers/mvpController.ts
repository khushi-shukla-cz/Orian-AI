import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { MVPWorkflowService } from '../services/mvpWorkflowService';

const service = new MVPWorkflowService();

const CreateSchema = z.object({
  input: z.string().min(5),
  name: z.string().optional(),
});

export class MVPController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CreateSchema.parse(req.body);
      const result = await service.create(data.input, data.name);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: 'Validation', details: err.issues });
      } else {
        next(err);
      }
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const items = await service.list(limit);
      res.status(200).json({ success: true, data: items });
    } catch (err: any) {
      next(err);
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await service.get(id);
      res.status(200).json({ success: true, data: item });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }
}
