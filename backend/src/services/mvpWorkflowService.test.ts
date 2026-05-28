import { MVPWorkflowService } from './mvpWorkflowService';

describe('MVPWorkflowService', () => {
  let service: MVPWorkflowService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new MVPWorkflowService();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  it('creates, lists, and resolves workflows', async () => {
    const created = await service.create('Send a summary email to the team', 'Weekly update');

    expect(created.name).toBe('Weekly update');
    expect(created.status).toBe('executing');

    const list = await service.list();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(created.id);
    expect(list[0].status).toBe('executing');

    const current = await service.get(created.id);
    expect(current.logs.some((log) => log.message.includes('Execution started'))).toBe(true);

    jest.advanceTimersByTime(2000);
    await Promise.resolve();

    const completed = await service.get(created.id);
    expect(completed.status).toBe('completed');
    expect(completed.logs.some((log) => log.message.includes('Execution completed'))).toBe(true);
  });
});
