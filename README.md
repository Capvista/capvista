# Capvista

Private markets infrastructure platform connecting verified African startups with global capital.

## Overview

Capvista is a trust-first platform enabling structured investment into Nigerian businesses through two lanes:

- **Yield Lane**: Predictable, cash-flow backed investments (Revenue Share Notes, Asset-Backed Participation)
- **Ventures Lane**: High-risk equity investments (Convertibles, SAFEs, SPV Equity)

## Architecture

This is a monorepo containing:

- **apps/web**: Main platform (capvista.com) - Next.js
- **apps/admin**: Admin portal (admin.capvista.com) - Next.js
- **apps/api**: Backend API - Node.js + Express
- **packages/database**: Shared Prisma database schema
- **packages/ui**: Shared React components
- **packages/types**: Shared TypeScript types
- **packages/config**: Shared configuration

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **Auth**: Clerk
- **Storage**: Azure Blob Storage
- **Deployment**: Azure App Services
- **Monitoring**: Sentry

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+

### Installation
```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Set up database
pnpm db:generate
pnpm db:push

# Start development servers
pnpm dev
```

This will start:
- Web app: http://localhost:3000
- Admin app: http://localhost:3002
- API: http://localhost:3001

### Database Management
```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Create a migration
pnpm db:migrate

# Open Prisma Studio (database GUI)
pnpm db:studio
```

## Development

### Project Structure
```
capvista/
├── apps/
│   ├── web/          # Main platform
│   ├── admin/        # Admin portal
│   └── api/          # Backend API
├── packages/
│   ├── database/     # Prisma schema
│   ├── ui/           # Shared components
│   ├── types/        # TypeScript types
│   └── config/       # Shared configs
└── .github/          # CI/CD workflows
```

### Available Scripts
```bash
pnpm dev          # Start all apps in development
pnpm build        # Build all apps
pnpm lint         # Lint all packages
pnpm test         # Run tests
pnpm format       # Format code with Prettier
```

## Deployment

Applications are deployed to Azure:

- **Production Web**: capvista.com
- **Production Admin**: admin.capvista.com
- **Production API**: api.capvista.com

Deployments are automated via GitHub Actions on push to `main`.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Submit a pull request
4. Ensure all checks pass

## License

Proprietary - All rights reserved