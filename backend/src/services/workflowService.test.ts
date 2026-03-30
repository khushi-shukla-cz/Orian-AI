const mockPlannerPlan = jest.fn();

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../agents/planner', () => ({
  PlannerAgent: jest.fn().mockImplementation(() => ({
    plan: mockPlannerPlan,
  })),
}));

const mockWorkflowCreate = jest.fn();
const mockWorkflowFindByIdAndUpdate = jest.fn();

jest.mock('../models/Workflow', () => ({
  __esModule: true,
  default: {
    create: mockWorkflowCreate,
    findByIdAndUpdate: mockWorkflowFindByIdAndUpdate,
  },
}));

const mockTaskCreate = jest.fn();

jest.mock('../models/Task', () => ({
  __esModule: true,
  default: {
    create: mockTaskCreate,
  },
}));

const mockLogCreate = jest.fn();

jest.mock('../models/Log', () => ({
  __esModule: true,
  default: {
    create: mockLogCreate,
  },
}));

const mockQueueAdd = jest.fn();

jest.mock('../queues', () => ({
  taskQueue: {
    add: mockQueueAdd,
  },
  isRedisReady: jest.fn(() => true),
}));

const mockEmitWorkflowUpdate = jest.fn();
const mockEmitLogEvent = jest.fn();

jest.mock('../sockets', () => ({
  emitWorkflowUpdate: mockEmitWorkflowUpdate,
  emitLogEvent: mockEmitLogEvent,
}));

import { WorkflowService } from './workflowService';

describe('WorkflowService.createWorkflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates workflow, stores tasks, and triggers execution', async () => {
    const fakeWorkflowDoc = {
      _id: {
        toString: () => 'wf-1',
      },
      status: 'planning',
      input: 'send summary',
      metrics: {
        startTime: new Date('2026-01-01T00:00:00.000Z'),
      },
      save: jest.fn().mockResolvedValue(undefined),
      graph: undefined as any,
    };

    mockWorkflowCreate.mockResolvedValue(fakeWorkflowDoc);
    mockPlannerPlan.mockResolvedValue({
      workflow: [
        {
          id: 't1',
          type: 'summarize_text',
          description: 'Summarize text',
          dependencies: [],
          priority: 1,
          inputs: {},
          outputs: {},
        },
      ],
    });

    const service = new WorkflowService();
    const executeSpy = jest.spyOn(service, 'executeWorkflow').mockResolvedValue(undefined);

    const result = await service.createWorkflow('Send summary to team', 'Summary Flow');

    expect(mockWorkflowCreate).toHaveBeenCalledTimes(1);
    expect(mockTaskCreate).toHaveBeenCalledTimes(1);
    expect(executeSpy).toHaveBeenCalledWith('wf-1');
    expect(fakeWorkflowDoc.save).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      workflowId: 'wf-1',
      status: 'executing',
      taskCount: 1,
    });
  });

  it('marks workflow as failed when plan is invalid', async () => {
    const fakeWorkflowDoc = {
      _id: {
        toString: () => 'wf-2',
      },
      status: 'planning',
      input: 'invalid flow',
      metrics: {
        startTime: new Date('2026-01-01T00:00:00.000Z'),
      },
      save: jest.fn().mockResolvedValue(undefined),
      graph: undefined as any,
    };

    mockWorkflowCreate.mockResolvedValue(fakeWorkflowDoc);
    mockPlannerPlan.mockResolvedValue({
      workflow: [
        {
          id: 't1',
          type: 'email_send',
          description: 'Send email',
          dependencies: ['missing-task'],
          priority: 1,
          inputs: { to: 'a@b.com', subject: 'Hi' },
          outputs: {},
        },
      ],
    });

    const service = new WorkflowService();

    await expect(service.createWorkflow('Invalid')).rejects.toThrow('Invalid workflow plan');

    expect(mockWorkflowFindByIdAndUpdate).toHaveBeenCalledWith('wf-2',
      expect.objectContaining({
        status: 'failed',
      })
    );
    expect(mockEmitWorkflowUpdate).toHaveBeenCalledWith('wf-2',
      expect.objectContaining({
        status: 'failed',
      })
    );
  });
});
