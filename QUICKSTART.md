# Quick Start Guide - Orion AI

Get Orion AI running in under 5 minutes!

## Prerequisites

✅ Node.js 18+ installed  
✅ Docker & Docker Compose installed (recommended)  
✅ Anthropic API Key ([Get one here](https://console.anthropic.com/))

## 🚀 Fastest Way (Docker)

### Step 1: Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Anthropic API key
nano .env  # or use your favorite editor
```

Add your API key:
```env
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

### Step 2: Start Everything

```bash
# Start all services (MongoDB, Redis, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f
```

### Step 3: Access the App

Open your browser:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/v1/health

## ✨ Create Your First Workflow

1. Click **"New Workflow"**
2. Enter a name (optional): "Team Update"
3. Enter instructions:
   ```
   Summarize this meeting and send the summary to team@company.com
   ```
4. Click **"Create Workflow"**
5. Watch the magic happen! 🎉

## 🛠️ Manual Setup (Without Docker)

### Step 1: Install Dependencies

```bash
./install.sh
```

### Step 2: Start Services

**Terminal 1 - MongoDB:**
```bash
mongod --dbpath /path/to/your/data
```

**Terminal 2 - Redis:**
```bash
redis-server
```

**Terminal 3 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 3: Access

Open http://localhost:3000

## 🔧 Configuration

### Required Environment Variables

Only one is truly required to get started:

```env
ANTHROPIC_API_KEY=your_key_here
```

### Optional Integrations

Add these for full functionality:

**Google (Gmail & Calendar):**
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

**Slack:**
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

**Notion:**
```env
NOTION_API_KEY=secret_your_notion_token
```

## 📖 Example Workflows

Try these sample workflow instructions:

### 1. Email & Calendar
```
Send a summary email to john@company.com and 
schedule a follow-up meeting for next Tuesday at 2pm
```

### 2. Slack Notification
```
Create a task in Notion titled "Review Q4 Reports" and 
notify #team channel on Slack
```

### 3. Meeting Follow-up
```
Summarize the meeting notes and send to all@company.com, 
then schedule a follow-up for next week
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Or start it manually
mongod --dbpath /data/db
```

### Redis Connection Failed
```bash
# Check if Redis is running
docker ps | grep redis

# Or start it manually
redis-server
```

### API Key Issues
- Verify your key in `.env`
- Check it's not wrapped in quotes
- Ensure no extra spaces

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

## 📚 Next Steps

1. **Read the Architecture**: See `/docs/ARCHITECTURE.md`
2. **Add Integrations**: Configure Gmail, Slack, etc.
3. **Explore the API**: Check `/docs/API.md`
4. **Customize Agents**: Modify agent prompts in `/backend/src/agents/`
5. **Deploy**: Follow deployment guides for Vercel/Render

## 🆘 Need Help?

- Check the [README.md](README.md) for detailed docs
- See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup
- Open an issue on GitHub

## 🎉 You're Ready!

Orion AI is now running. Start creating autonomous workflows!

**Pro Tip**: The system works even without integrations configured - it will use mock responses for demos.
