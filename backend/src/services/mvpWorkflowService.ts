import { v4 as uuidv4 } from 'uuid';

type MVPWorkflow = {
  id: string;
  name: string;
  input: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  logs: Array<{ level: string; message: string; timestamp: string }>;
};

export class MVPWorkflowService {
  private store: Map<string, MVPWorkflow> = new Map();

  async create(input: string, name?: string) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const wf: MVPWorkflow = {
      id,
      name: name || 'Untitled MVP Workflow',
      input,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      logs: [
        { level: 'INFO', message: 'Workflow created', timestamp: now },
      ],
    };

    this.store.set(id, wf);

    // Simulate execution asynchronously
    this.executeStub(id);

    return { id, status: wf.status, name: wf.name };
  }

  async list(limit = 20) {
    return Array.from(this.store.values())
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
      .slice(0, limit);
  }

  async get(id: string) {
    const wf = this.store.get(id);
    if (!wf) throw new Error('Workflow not found');
    return wf;
  }

  private async executeStub(id: string) {
    const wf = this.store.get(id);
    if (!wf) return;
    wf.status = 'executing';
    wf.updatedAt = new Date().toISOString();
    wf.logs.push({ level: 'INFO', message: 'Execution started (stub)', timestamp: wf.updatedAt });
    this.store.set(id, wf);

    // After a short delay, mark as completed
    setTimeout(() => {
      const now = new Date().toISOString();
      const item = this.store.get(id);
      if (!item) return;
      item.status = 'completed';
      item.updatedAt = now;
      item.logs.push({ level: 'INFO', message: 'Execution completed (stub)', timestamp: now });
      this.store.set(id, item);
    }, 2000);
  }
}
