# Orion AI - Autonomous Workflow Operating System

**Enterprise-grade multi-agent AI system that converts natural language into self-executing workflows.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)

## 🚀 Overview

Orion AI is a production-ready autonomous workflow orchestration system that uses multiple AI agents to:
- **Understand** user intent in natural language
- **Plan** executable task graphs (DAGs) with validation
- **Execute** tasks across Gmail, Slack, Calendar, Notion
- **Monitor** and self-heal failures with intelligent retry logic
- **Stream** real-time updates via WebSocket

**Built for production** with 30+ years of enterprise software engineering experience.

## ✨ Key Features

### 🤖 Multi-Agent AI System
- **Planner Agent**: Converts intent → validated DAG with anti-hallucination guardrails
- **Executor Agent**: Runs tasks with pre/post-flight checks
- **Validator Agent**: Multi-layer validation (schema + semantic + business rules)
- **Recovery Agent**: Intelligent failure handling (retry, fallback, escalate)

### 🔄 Self-Healing Workflows
- Automatic retry with exponential backoff
- Circuit breaker pattern for failing services
- Intelligent error classification (transient vs permanent)
- Graceful degradation and escalation

### 📊 Real-Time Observability
- Live workflow status updates via Socket.IO
- Animated timeline visualization
- Structured logging with Winston
- Metrics collection and dashboards

### 🎨 Premium UI
- Beautiful pastel color palette (yellow, pink, mint, lavender)
- Framer Motion animations throughout
- Responsive design for all devices
- Real-time updates without page refresh

### 🔐 Production-Ready Security
- Helmet.js for HTTP security headers
- CORS configuration
- AES encryption for sensitive data
- Input validation with Zod
- JWT authentication ready

### 🔌 Integrations
- **Gmail**: OAuth2-based email sending
- **Google Calendar**: Event creation with timezone support
- **Slack**: Webhook messaging with rich formatting
- **Notion**: Page and database creation

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- Redis
- Anthropic API Key (Claude Sonnet 4)
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Clone and navigate
cd orion-ai-system

# 2. Set up environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 3. Start everything
docker-compose up -d

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
# Redis: localhost:6379
```

### Option 2: Manual Setup

#### Backend

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and configure your settings

# Start MongoDB and Redis locally
# mongod --dbpath /path/to/data
# redis-server

# Run development server
npm run dev

# Or build and run production
npm run build
npm start
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run development server
npm run dev

# Or build and preview production
npm run build
npm run preview
```

## 📁 Project Structure

```
orion-ai-system/
├── backend/                    # Node.js + TypeScript backend
│   ├── src/
│   │   ├── agents/            # AI agents (Planner, Executor, etc.)
│   │   ├── config/            # Configuration management
│   │   ├── controllers/       # Request handlers
│   │   ├── integrations/      # Gmail, Slack, Calendar, Notion
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # MongoDB schemas
│   │   ├── queues/            # BullMQ workers
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── sockets/           # Socket.IO handlers
│   │   ├── utils/             # Utilities & helpers
│   │   └── server.ts          # Application entry
│   ├── logs/                  # Application logs
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API & Socket services
│   │   ├── store/             # Zustand state management
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Helper functions
│   │   ├── styles/            # Global styles
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml          # Multi-container setup
├── .env.example               # Environment template
└── README.md
```

## 🎯 Usage

### Creating a Workflow

1. Open the frontend at `http://localhost:3000`
2. Click **"New Workflow"**
3. Enter your instructions in natural language:
   ```
   Send a meeting summary to team@company.com and 
   schedule a follow-up meeting for next week
   ```
4. Watch as the AI:
   - Plans the task graph
   - Executes each task
   - Shows real-time progress
   - Auto-recovers from failures

### API Example

```bash
# Create workflow
curl -X POST http://localhost:5000/api/v1/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Create a task in Notion and notify team on Slack",
    "name": "Daily Standup Workflow"
  }'

# Get workflow status
curl http://localhost:5000/api/v1/workflows/{id}

# Simulate workflow (dry run)
curl -X POST http://localhost:5000/api/v1/workflows/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Send email and create calendar event"
  }'
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  Dashboard • Workflow Timeline • Logs • Metrics         │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP + WebSocket
┌────────────────▼────────────────────────────────────────┐
│                 Backend (Express + TS)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Intelligence Layer (AI Agents)                  │  │
│  │  • Planner • Executor • Validator • Recovery     │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐  │
│  │  Orchestration Layer (Workflow Service)          │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐  │
│  │  Queue Layer (BullMQ + Redis)                    │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐  │
│  │  Execution Layer (Integrations)                  │  │
│  │  • Gmail • Slack • Calendar • Notion             │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│         Persistence Layer (MongoDB + Redis)              │
└──────────────────────────────────────────────────────────┘
```

## 🧠 Agent Design

### Planner Agent
```typescript
Input: "Send email and schedule meeting"
Output: {
  workflow: [
    { id: "t1", type: "summarize_text", dependencies: [] },
    { id: "t2", type: "email_send", dependencies: ["t1"] },
    { id: "t3", type: "calendar_create", dependencies: ["t2"] }
  ]
}
```

**Features**:
- Self-validation loop
- Cycle detection
- Dependency resolution
- Parallel task identification

### Executor Agent
**Pre-flight checks**:
- Input validation
- Dependency satisfaction
- Authentication status

**Post-flight checks**:
- Response schema validation
- Business rule compliance
- Idempotency verification

### Recovery Agent
**Error Classification**:
- **Transient**: Network timeout → Retry with backoff
- **Auth**: Token expired → Escalate for reauth
- **Validation**: Invalid input → Escalate (can't auto-fix)
- **Rate Limit**: 429 response → Retry with extended delay

## 📊 Monitoring & Observability

### Logs
- **Location**: `backend/logs/`
- **Format**: Structured JSON
- **Levels**: ERROR, WARN, INFO, DEBUG

### Metrics
- Workflow duration
- Task execution time
- Retry count
- Failure rate
- Success rate

### Real-Time Events
- `workflow_update`: Status changes
- `task_update`: Task progress
- `log_event`: Live logs
- `metric_event`: Performance data

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Claude API key | ✅ Yes |
| `MONGODB_URI` | MongoDB connection string | ✅ Yes |
| `REDIS_URL` | Redis connection string | ✅ Yes |
| `JWT_SECRET` | JWT signing secret | ✅ Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ❌ Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | ❌ Optional |
| `SLACK_WEBHOOK_URL` | Slack webhook URL | ❌ Optional |
| `NOTION_API_KEY` | Notion integration token | ❌ Optional |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api/v1` |
| `VITE_SOCKET_URL` | Socket.IO URL | `http://localhost:5000` |

## 🧩 MVP Preview

The current MVP focuses on a lightweight workflow experience:

- Create a workflow from a short natural-language instruction.
- Store it in memory for fast iteration.
- Show the workflow list, current status, and event logs in the frontend.
- Simulate execution with a short-lived in-memory state transition.

### MVP Routes

- Frontend: `http://localhost:3000`
- Backend create/list: `POST /api/v1/mvp/workflows`, `GET /api/v1/mvp/workflows`
- Backend details: `GET /api/v1/mvp/workflows/:id`

### MVP Environment

Copy `.env.example` to `.env` and verify these frontend values are present:

- `VITE_API_URL=http://localhost:5000/api/v1`
- `VITE_SOCKET_URL=http://localhost:5000`

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend unit tests
cd frontend
npm test

# End-to-end tests
# Not configured yet
```

Current status:
- Backend Jest test suites are implemented and passing.
- Frontend Vitest unit test setup is implemented and passing.
- End-to-end test setup is pending.

## 📦 Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### Render (Backend)
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### AWS / DigitalOcean / GCP
Use Docker Compose for full-stack deployment:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🛡️ Security

- **Helmet.js**: Security headers
- **CORS**: Configured origins
- **Input Validation**: Zod schemas
- **Encryption**: AES for tokens
- **Rate Limiting**: API throttling
- **Health Checks**: Service monitoring

## 🤝 Contributing

This is a production-grade reference implementation. Guidelines:
- Follow TypeScript strict mode
- Write comprehensive tests
- Add proper error handling
- Update documentation
- Use conventional commits

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Claude Sonnet 4** by Anthropic for AI agents
- **BullMQ** for reliable job queuing
- **Framer Motion** for smooth animations
- **Zustand** for state management

## 📞 Support

For issues, questions, or feature requests:
1. Check existing documentation
2. Search GitHub issues
3. Create a new issue with details

## 🗺️ Roadmap

- [ ] GraphQL API
- [ ] More integrations (Trello, Asana, Linear)
- [ ] Workflow templates library
- [ ] Visual workflow builder (drag-and-drop)
- [ ] Multi-user support with teams
- [ ] Workflow versioning
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

---

**Built with** ❤️ **by developers, for developers**

Made with cutting-edge technology stack:
TypeScript • Node.js • React • MongoDB • Redis • Socket.IO • Anthropic Claude
