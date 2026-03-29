# Orion AI Backend - Autonomous Workflow OS

Enterprise-grade backend for autonomous workflow orchestration powered by multi-agent AI system.

## Features

- 🤖 **Multi-Agent AI System**: Planner, Executor, Validator, and Recovery agents
- 🔄 **Self-Healing Workflows**: Automatic retry and recovery mechanisms
- 📊 **Real-Time Monitoring**: Socket.IO for live workflow updates
- 🔐 **Production Security**: Helmet, CORS, JWT, encryption
- 📈 **Scalable Queue System**: BullMQ with Redis for distributed task execution
- 🎯 **Type-Safe**: Full TypeScript with strict validation

## Architecture

```
Backend Architecture:
├── Input Layer (REST API)
├── Intelligence Layer (AI Agents)
│   ├── Planner Agent (DAG Creation)
│   ├── Executor Agent (Task Execution)
│   ├── Validator Agent (Result Validation)
│   └── Recovery Agent (Failure Handling)
├── Orchestration Layer (Workflow Service)
├── Queue Layer (BullMQ + Redis)
├── Persistence Layer (MongoDB)
└── Real-Time Layer (Socket.IO)
```

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **Cache/Queue**: Redis + BullMQ
- **AI**: Anthropic Claude Sonnet 4
- **Real-Time**: Socket.IO
- **Validation**: Zod
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- Redis
- Anthropic API Key

### Installation

```bash
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Configure your environment variables:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/orion-ai
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=your_api_key

# Optional (for integrations)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SLACK_WEBHOOK_URL=your_slack_webhook
NOTION_API_KEY=your_notion_key
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Workflows

#### Create Workflow
```http
POST /api/v1/workflows
Content-Type: application/json

{
  "input": "Send meeting summary to team@company.com and schedule follow-up",
  "name": "Meeting Follow-up Workflow"
}
```

#### Get Workflow
```http
GET /api/v1/workflows/:id
```

#### List Workflows
```http
GET /api/v1/workflows?limit=20
```

#### Get Metrics
```http
GET /api/v1/workflows/:id/metrics
```

#### Simulate Workflow
```http
POST /api/v1/workflows/simulate
Content-Type: application/json

{
  "input": "Create a task in Notion and notify team on Slack"
}
```

## Socket.IO Events

### Client → Server
- `subscribe_workflow`: Subscribe to workflow updates
- `unsubscribe_workflow`: Unsubscribe from updates

### Server → Client
- `workflow_update`: Workflow status changes
- `task_update`: Task execution updates
- `log_event`: Real-time logs
- `metric_event`: Performance metrics

## Project Structure

```
backend/
├── src/
│   ├── agents/           # AI agents (Planner, Executor, etc.)
│   ├── config/           # Configuration and database
│   ├── controllers/      # Request handlers
│   ├── integrations/     # External service integrations
│   ├── middleware/       # Express middleware
│   ├── models/           # MongoDB schemas
│   ├── queues/           # BullMQ workers
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── sockets/          # Socket.IO handlers
│   ├── utils/            # Utilities and helpers
│   └── server.ts         # Application entry point
├── logs/                 # Application logs
├── package.json
└── tsconfig.json
```

## Agents

### Planner Agent
Converts user intent into executable task DAG with strict validation and anti-hallucination guardrails.

### Executor Agent
Executes individual tasks with pre-flight and post-flight checks. Supports:
- Email (Gmail)
- Calendar (Google Calendar)
- Slack notifications
- Notion page creation
- Text summarization

### Validator Agent
Multi-layer validation:
1. Schema validation
2. Semantic validation
3. Business rules validation

### Recovery Agent
Intelligent failure handling:
- Transient errors → Retry with exponential backoff
- Auth errors → Escalate
- Rate limits → Retry with extended delay

## Integrations

### Gmail
OAuth2-based email sending with automatic token refresh.

### Google Calendar
Event creation with timezone support and attendee management.

### Slack
Webhook-based messaging with rich formatting support.

### Notion
Page and database creation via Notion API.

## Testing

```bash
npm test
```

## Linting & Formatting

```bash
npm run lint
npm run format
```

## Deployment

### Docker (Recommended)

Build image:
```bash
docker build -t orion-ai-backend .
```

Run container:
```bash
docker run -p 5000:5000 --env-file .env orion-ai-backend
```

### Traditional Deployment

Deploy to platforms like:
- Render
- Railway
- Heroku
- AWS EC2
- DigitalOcean

## Monitoring

Logs are stored in:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

Use Winston log levels: error, warn, info, debug

## Security

- Helmet.js for HTTP headers
- CORS configuration
- JWT authentication (ready for implementation)
- AES encryption for sensitive data
- Input validation with Zod
- Rate limiting (configurable)

## Performance

- Horizontal scaling support (stateless design)
- Redis caching
- Connection pooling (MongoDB)
- Optimized database indexes
- Configurable queue concurrency

## Contributing

This is a production-grade system. Follow these guidelines:
- Write TypeScript with strict typing
- Add comprehensive error handling
- Include logging for debugging
- Validate all inputs
- Write tests for new features

## License

MIT

## Support

For issues and questions, please refer to the documentation or create an issue in the repository.
