import { WorkflowValidator, Workflow } from './validators';

describe('WorkflowValidator', () => {
  it('validates a correct workflow', () => {
    const workflow: Workflow = {
      workflow: [
        {
          id: 't1',
          type: 'summarize_text',
          description: 'Summarize input',
          dependencies: [],
          priority: 1,
          inputs: {},
          outputs: {},
        },
        {
          id: 't2',
          type: 'email_send',
          description: 'Send summary email',
          dependencies: ['t1'],
          priority: 2,
          inputs: { to: 'team@example.com', subject: 'Summary' },
          outputs: {},
        },
      ],
    };

    const result = WorkflowValidator.validateWorkflow(workflow);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails validation when a dependency is missing', () => {
    const workflow: Workflow = {
      workflow: [
        {
          id: 't1',
          type: 'slack_notify',
          description: 'Notify Slack',
          dependencies: ['missing'],
          priority: 1,
          inputs: { channel: '#general', message: 'Hi' },
          outputs: {},
        },
      ],
    };

    const result = WorkflowValidator.validateWorkflow(workflow);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Task t1 depends on non-existent task missing');
  });

  it('fails validation when duplicate task ids exist', () => {
    const workflow: Workflow = {
      workflow: [
        {
          id: 't1',
          type: 'notion_create',
          description: 'Create note',
          dependencies: [],
          priority: 1,
          inputs: { title: 'Doc' },
          outputs: {},
        },
        {
          id: 't1',
          type: 'calendar_create',
          description: 'Create event',
          dependencies: [],
          priority: 2,
          inputs: { title: 'Meeting' },
          outputs: {},
        },
      ],
    };

    const result = WorkflowValidator.validateWorkflow(workflow);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Workflow contains duplicate task IDs');
  });

  it('fails validation when a cycle exists', () => {
    const workflow: Workflow = {
      workflow: [
        {
          id: 't1',
          type: 'summarize_text',
          description: 'Step 1',
          dependencies: ['t2'],
          priority: 1,
          inputs: {},
          outputs: {},
        },
        {
          id: 't2',
          type: 'email_send',
          description: 'Step 2',
          dependencies: ['t1'],
          priority: 2,
          inputs: { to: 'team@example.com', subject: 'X' },
          outputs: {},
        },
      ],
    };

    const result = WorkflowValidator.validateWorkflow(workflow);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Workflow contains circular dependencies');
  });

  it('returns tasks in topological order', () => {
    const tasks: Workflow['workflow'] = [
      {
        id: 't3',
        type: 'calendar_create',
        description: 'Create follow-up event',
        dependencies: ['t2'],
        priority: 3,
        inputs: { title: 'Follow-up' },
        outputs: {},
      },
      {
        id: 't1',
        type: 'summarize_text',
        description: 'Summarize discussion',
        dependencies: [],
        priority: 1,
        inputs: {},
        outputs: {},
      },
      {
        id: 't2',
        type: 'email_send',
        description: 'Send summary',
        dependencies: ['t1'],
        priority: 2,
        inputs: { to: 'team@example.com', subject: 'Summary' },
        outputs: {},
      },
    ];

    const sorted = WorkflowValidator.topologicalSort(tasks);
    const ids = sorted.map((t) => t.id);

    expect(ids.indexOf('t1')).toBeLessThan(ids.indexOf('t2'));
    expect(ids.indexOf('t2')).toBeLessThan(ids.indexOf('t3'));
  });
});
