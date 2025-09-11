# Movie Ticket App - Web Frontend

A modern React + TypeScript + Vite application for movie ticket booking system.

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (recommended package manager)

### Installation

1. Clone the repository

```bash
git clone https://github.com/htruc-tcnct/movie-ticket-web.git
cd movie-ticket-web
```

2. Install dependencies

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests with Vitest
- `pnpm check-types` - Type checking with TypeScript

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **ESLint + Prettier** - Code quality and formatting
- **Husky + Commitlint** - Git hooks and commit message validation

## Project Structure

```
src/
├── features/           # Feature-based modules
│   ├── auth/          # Authentication feature
│   ├── admin/         # Admin features
│   ├── customer/      # Customer features
│   ├── employee/      # Employee features
│   └── home/          # Homepage
├── shared/            # Shared components and utilities
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom hooks
│   ├── api/           # API client setup
│   ├── routes/        # Route definitions
│   └── utils/         # Utility functions
└── main.tsx           # Application entry point
```

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/). All commit messages must follow this format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Types:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Examples:

```bash
feat: add user authentication
fix: resolve login form validation issue
docs: update API documentation
chore: update dependencies
```
