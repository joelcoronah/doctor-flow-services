# DocFlow Backend

NestJS backend API for DocFlow dental practice management system.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
npm run migration:run

# Seed database
npm run seed

# Start development server
npm run start:dev
```

## Documentation

See the main [README.md](../README.md) in the root directory for:
- Full project documentation
- Environment variables
- API endpoints
- Technologies used
- Deployment instructions

## Available Scripts

```bash
npm run start:dev        # Start development server
npm run start:prod       # Start production server
npm run build           # Build for production
npm run test            # Run tests
npm run migration:generate  # Generate new migration
npm run migration:run      # Run migrations (local, uses ts-node)
npm run migration:run:prod # Run migrations in Docker/production (uses compiled dist)
npm run migration:revert   # Revert last migration
npm run seed            # Seed database
```
