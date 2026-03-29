import Anthropic from '@anthropic-ai/sdk';
import config from '../config';
import { WorkflowValidator, WorkflowSchema, Workflow } from '../utils/validators';
import logger from '../utils/logger';

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!config.anthropic.apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY. Please configure backend/.env.');
  }

  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
  }

  return anthropicClient;
}

const PLANNER_SYSTEM_PROMPT = `You are part of a production AI system.

STRICT RULES:
- Do NOT hallucinate or assume missing data.
- If required information is missing, return an explicit error.
- Output must strictly follow the defined JSON schema.
- Do not include explanations outside JSON.
- If uncertain, return: { "success": false, "error": "reason" }
- Never invent API responses.

You are a senior workflow orchestration engine.

Your job is to convert user intent into a valid execution DAG.

CONSTRAINTS:
- Output ONLY valid JSON.
- No circular dependencies.
- Each task must be atomic and executable.
- Prefer parallel execution where possible.
- Do NOT create tasks that require undefined inputs.

TASK TYPES ALLOWED:
- email_send: Send emails via Gmail
- calendar_create: Create calendar events
- slack_notify: Send Slack notifications
- notion_create: Create Notion tasks/pages
- summarize_text: Summarize meeting transcripts or documents

SCHEMA:
{
  "workflow": [
    {
      "id": "string (unique identifier, e.g., 't1', 't2')",
      "type": "string (one of allowed task types)",
      "description": "string (clear description of what this task does)",
      "inputs": {},
      "dependencies": ["array of task IDs this task depends on"],
      "priority": number (1-10, lower runs first)
    }
  ]
}

VALIDATION BEFORE OUTPUT:
1. Check for cycles
2. Ensure all dependencies exist
3. Ensure task types are valid
4. Ensure no missing inputs

If validation fails:
Return:
{ "error": "Invalid workflow", "details": "reason" }

EXAMPLES:

Input: "Send meeting summary to team@company.com and schedule a follow-up for next week"
Output:
{
  "workflow": [
    {
      "id": "t1",
      "type": "summarize_text",
      "description": "Summarize the meeting content",
      "inputs": {},
      "dependencies": [],
      "priority": 1
    },
    {
      "id": "t2",
      "type": "email_send",
      "description": "Send summary email to team",
      "inputs": {
        "to": "team@company.com",
        "subject": "Meeting Summary"
      },
      "dependencies": ["t1"],
      "priority": 2
    },
    {
      "id": "t3",
      "type": "calendar_create",
      "description": "Schedule follow-up meeting",
      "inputs": {
        "title": "Follow-up Meeting",
        "duration": 60
      },
      "dependencies": ["t2"],
      "priority": 3
    }
  ]
}`;

export class PlannerAgent {
  private maxRetries = 2;

  async plan(input: string): Promise<Workflow> {
    logger.info('PlannerAgent: Starting workflow planning', { input });

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.callLLM(input, attempt > 0);
        const workflow = this.parseResponse(response);

        // Validate workflow
        const validation = WorkflowValidator.validateWorkflow(workflow);
        
        if (!validation.valid) {
          if (attempt < this.maxRetries) {
            logger.warn(`PlannerAgent: Validation failed, retrying (attempt ${attempt + 1})`, {
              errors: validation.errors,
            });
            input = `${input}\n\nPrevious attempt had errors: ${validation.errors.join(', ')}. Please fix these issues.`;
            continue;
          } else {
            throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`);
          }
        }

        logger.info('PlannerAgent: Workflow created successfully', {
          taskCount: workflow.workflow.length,
        });

        return workflow;
      } catch (error) {
        if (attempt === this.maxRetries) {
          logger.error('PlannerAgent: Failed after max retries', { error });
          throw error;
        }
        logger.warn(`PlannerAgent: Attempt ${attempt + 1} failed, retrying`, { error });
      }
    }

    throw new Error('Failed to create workflow plan');
  }

  private async callLLM(input: string, isRetry: boolean): Promise<string> {
    const anthropic = getAnthropicClient();
    const userMessage = isRetry
      ? `${input}\n\nThis is a retry. Please ensure the workflow is valid and has no errors.`
      : input;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: PLANNER_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from LLM');
    }

    return textContent.text;
  }

  private parseResponse(response: string): Workflow {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    try {
      const parsed = JSON.parse(cleaned);
      
      // Validate against schema
      const workflow = WorkflowSchema.parse(parsed);
      return workflow;
    } catch (error) {
      logger.error('PlannerAgent: Failed to parse LLM response', {
        response: cleaned.substring(0, 500),
        error,
      });
      throw new Error(`Failed to parse workflow JSON: ${error}`);
    }
  }
}
