# Contributing to Orion AI

Thank you for your interest in contributing to Orion AI! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the best outcome for the community

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/orion-ai.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit: `git commit -m "feat: add amazing feature"`
7. Push: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

```bash
# Install dependencies
./install.sh

# Start development environment
docker-compose up -d

# Or manually
cd backend && npm run dev
cd frontend && npm run dev
```

## Code Style

### TypeScript
- Use TypeScript strict mode
- Define interfaces for all data structures
- Avoid `any` type when possible
- Use meaningful variable names

### React
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for props
- Follow React best practices

### Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build/tooling changes

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## Project Structure

```
backend/
├── src/
│   ├── agents/      # AI agent logic
│   ├── services/    # Business logic
│   ├── controllers/ # HTTP handlers
│   └── models/      # Database models

frontend/
├── src/
│   ├── components/  # Reusable UI
│   ├── pages/       # Route pages
│   └── hooks/       # Custom hooks
```

## Questions?

- Check existing issues and discussions
- Create a new issue for bugs
- Start a discussion for questions

Thank you for contributing! 🚀
