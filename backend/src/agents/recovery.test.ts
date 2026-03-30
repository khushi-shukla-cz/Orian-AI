import { RecoveryAgent } from './recovery';
import { Task } from '../utils/validators';

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const baseTask: Task = {
  id: 't1',
  type: 'email_send',
  description: 'Send email',
  dependencies: [],
  priority: 1,
  inputs: { to: 'team@example.com', subject: 'Test' },
  outputs: {},
};

describe('RecoveryAgent', () => {
  const agent = new RecoveryAgent();

  it('returns skip when task succeeds', async () => {
    const strategy = await agent.determineStrategy(baseTask, { success: true, data: {} }, 0);

    expect(strategy.action).toBe('skip');
    expect(strategy.reason).toContain('Task succeeded');
  });

  it('retries transient failures with exponential backoff', async () => {
    const strategy = await agent.determineStrategy(
      baseTask,
      { success: false, error: 'Network timeout while calling provider' },
      1
    );

    expect(strategy.action).toBe('retry');
    expect(strategy.reason).toContain('Transient');
    expect(strategy.delayMs).toBe(2000);
  });

  it('escalates authentication failures', async () => {
    const strategy = await agent.determineStrategy(
      baseTask,
      { success: false, error: '401 unauthorized token expired' },
      0
    );

    expect(strategy.action).toBe('escalate');
    expect(strategy.reason).toContain('Authentication');
  });

  it('retries rate limit failures with extended delay', async () => {
    const strategy = await agent.determineStrategy(
      baseTask,
      { success: false, error: '429 rate limit exceeded' },
      2
    );

    expect(strategy.action).toBe('retry');
    expect(strategy.reason).toContain('Rate limit');
    expect(strategy.delayMs).toBe(8000);
  });

  it('escalates when max retries are reached', async () => {
    const strategy = await agent.determineStrategy(
      baseTask,
      { success: false, error: 'network timeout' },
      3
    );

    expect(strategy.action).toBe('escalate');
    expect(strategy.reason).toContain('Max retries');
  });
});
