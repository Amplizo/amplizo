# Contributing to Amplizo

Thank you for your interest in contributing to Amplizo! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/amplizo/amplizo/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Open a [Feature Request](https://github.com/amplizo/amplizo/issues/new?template=feature_request.md) issue
2. Describe the feature and its use case
3. Explain why this would be useful for Amplizo users

### Pull Requests

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/amplizo.git`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes**
5. **Commit** with clear messages: `git commit -m "Add: feature description"`
6. **Push** to your fork: `git push origin feature/your-feature-name`
7. **Open a Pull Request**

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Getting Started

```bash
# Clone the repository
git clone https://github.com/amplizo/amplizo.git
cd amplizo

# Setup backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run seed
npm run start:dev

# Setup frontend (in a new terminal)
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types when possible

### Naming Conventions
- **Files**: kebab-case (`user-service.ts`)
- **Classes**: PascalCase (`UserService`)
- **Functions/Variables**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)

### Commit Messages
We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example: `feat: add dark mode toggle to header`

## Project Structure

```
amplizo/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/      # Pages and routes
│   │   ├── components/# UI components
│   │   ├── lib/      # Utilities
│   │   └── store/    # State management
│   └── ...
├── backend/           # NestJS application
│   ├── src/
│   │   ├── modules/  # Feature modules
│   │   ├── common/   # Shared services
│   │   └── ...
│   └── ...
└── ...
```

## Testing

- Write unit tests for new features
- Run tests before submitting PR: `npm test`
- Aim for good code coverage

## Documentation

- Update README.md if needed
- Document new features
- Add JSDoc comments for public APIs

## Questions?

Feel free to reach out:
- Open a [Discussion](https://github.com/amplizo/amplizo/discussions)
- Email: support@amplizo.ai

Thank you for contributing!
