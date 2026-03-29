# Orion AI Frontend - Autonomous Workflow OS

Premium React frontend for the Orion AI autonomous workflow orchestration platform.

## Features

- 🎨 **Premium UI Design**: Pastel color palette with smooth animations
- ⚡ **Real-Time Updates**: Socket.IO integration for live workflow monitoring
- 🎭 **Framer Motion**: Fluid animations throughout the entire interface
- 📊 **Interactive Dashboard**: Visual workflow cards with live status updates
- 🔄 **Animated Timeline**: Beautiful task execution visualization
- 📜 **Live Logs**: Real-time event streaming with auto-scroll
- 💾 **Type-Safe**: Full TypeScript with strict typing
- 📱 **Responsive**: Mobile-friendly design

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Routing**: React Router v6
- **API Client**: Axios
- **Real-Time**: Socket.IO Client
- **Notifications**: React Hot Toast
- **Date Formatting**: date-fns

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Backend server running on port 5000

### Installation

```bash
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Configure your environment variables:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── LoadingSpinner.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── WorkflowCard.tsx
│   │   ├── WorkflowTimeline.tsx
│   │   └── LogsPanel.tsx
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx
│   │   └── WorkflowDetails.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useWorkflow.ts
│   │   └── useWorkflowList.ts
│   ├── services/          # API and Socket services
│   │   ├── api.ts
│   │   └── socket.ts
│   ├── store/             # Zustand state management
│   │   └── workflowStore.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   └── helpers.ts
│   ├── styles/            # Global styles
│   │   └── globals.css
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json
```

## Key Components

### Dashboard
Main landing page showing all workflows with:
- Grid layout of workflow cards
- Create new workflow modal
- Real-time status updates
- Animated hover effects

### WorkflowDetails
Detailed view of a single workflow with:
- Animated timeline visualization
- Real-time task status updates
- Live event logs panel
- Workflow metrics and statistics

### WorkflowTimeline
Premium animated timeline showing:
- Task nodes with status indicators
- Pulsing animations for running tasks
- Shake animation for failed tasks
- Dependency visualization
- Task details on hover

### LogsPanel
Real-time log viewer with:
- Color-coded log levels
- Auto-scroll functionality
- Smooth entry animations
- Filtering by log level

## State Management

Uses Zustand for lightweight, performant state management:

```typescript
const { workflows, tasks, logs, updateTask } = useWorkflowStore();
```

## Real-Time Updates

Socket.IO integration provides live updates for:
- Workflow status changes
- Task execution progress
- Live event logs
- Metric updates

```typescript
socketService.onTaskUpdate((data) => {
  // Handle real-time task updates
});
```

## Custom Hooks

### useWorkflow
Manages single workflow operations:
```typescript
const { workflow, tasks, logs, fetchWorkflow, createWorkflow } = useWorkflow(id);
```

### useWorkflowList
Manages workflow list operations:
```typescript
const { workflows, fetchWorkflows, refresh } = useWorkflowList();
```

## Styling

### Tailwind Configuration
Custom theme with pastel colors:
- `accent-yellow`: #FDE68A
- `accent-pink`: #FBCFE8
- `accent-mint`: #A7F3D0
- `accent-lavender`: #DDD6FE
- `accent-peach`: #FED7AA
- `accent-sky`: #BAE6FD

### Animations
Framer Motion animations for:
- Page transitions
- Component mounting
- Hover effects
- Status changes
- Real-time updates

## API Integration

All API calls are handled through the `apiService`:

```typescript
import { apiService } from '@/services/api';

// Create workflow
const response = await apiService.createWorkflow({
  input: "Send email and create calendar event",
  name: "My Workflow"
});

// Get workflow details
const workflow = await apiService.getWorkflow(id);
```

## Error Handling

- Automatic error toasts via React Hot Toast
- Graceful degradation for missing data
- Loading states for async operations
- Network error recovery

## Performance Optimizations

- Lazy loading of components
- Memoized expensive computations
- Debounced search and filters
- Optimistic UI updates
- Virtual scrolling for large lists (when needed)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries
- Add prop types for all components

### Component Structure
```typescript
import { FC } from 'react';
import { motion } from 'framer-motion';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {title}
    </motion.div>
  );
};
```

### State Management Best Practices
- Use local state for UI-only state
- Use Zustand for shared application state
- Keep state as close to where it's used as possible
- Avoid prop drilling with context when needed

## Testing

```bash
npm run test
```

## Linting

```bash
npm run lint
```

## Formatting

```bash
npm run format
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist/` folder
3. Configure redirects for SPA routing

### Docker

```bash
docker build -t orion-ai-frontend .
docker run -p 3000:3000 orion-ai-frontend
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` |
| `VITE_SOCKET_URL` | Socket.IO server URL | `http://localhost:5000` |

## Troubleshooting

### Socket.IO Connection Issues
- Ensure backend server is running
- Check CORS configuration
- Verify Socket.IO URL in environment variables

### API Errors
- Check network tab in browser dev tools
- Verify backend is accessible
- Check API URL configuration

### Build Errors
- Clear node_modules and reinstall
- Check Node.js version (>=18)
- Verify all dependencies are installed

## Contributing

1. Follow the existing code style
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation as needed

## License

MIT

## Support

For issues and questions, please refer to the documentation or create an issue in the repository.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
