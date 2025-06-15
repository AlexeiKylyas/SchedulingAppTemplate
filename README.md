# Scheduling App Template

A comprehensive application template for scheduling client appointments for beauty salons, barbershops, and similar businesses.

## Project Overview

This is a monorepo project with the following components:

### Backend
- Node.js
- TypeScript
- Nest.js
- TypeORM with migrations

### Database
- PostgreSQL

### Frontend
- Vue 3
- TypeScript
- UI Framework

### Deployment
- Docker containers for backend, frontend, and database

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- Docker and Docker Compose
- npm or yarn

### Installation
1. Clone the repository
2. Run `npm install` in the root directory
3. Start the development environment with `docker-compose up -d`

## Project Structure
```
scheduling-app/
├── backend/           # Nest.js backend application
├── frontend/          # Vue 3 frontend application
├── docker/            # Docker configuration files
└── package.json       # Root package.json for monorepo management
```

## Development

### Backend
```bash
cd backend
npm run start:dev
```

### Frontend
```bash
cd frontend
npm run serve
```

### Database
```bash
# Start the database
npm run db:start

# Stop the database
npm run db:stop
```

The database is set up to run in a Docker container. For detailed instructions on database management and migrations, see the [Docker README](docker/README.md).

### Docker
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down
```

## License
[MIT](LICENSE)
