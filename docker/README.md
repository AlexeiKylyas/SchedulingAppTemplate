# Docker Setup for Scheduling App

This directory contains Docker configuration files for the Scheduling App.

## Database Setup

The application uses PostgreSQL as its database, which is set up to run in a Docker container.

### Starting the Database

To start the database, run:

```bash
npm run db:start
```

This will start the PostgreSQL container and a pgAdmin container for database management.

### Stopping the Database

To stop the database, run:

```bash
npm run db:stop
```

## Database Management

### pgAdmin

The Docker setup includes pgAdmin, a web-based administration tool for PostgreSQL. You can access it at:

- URL: http://localhost:5050
- Email: admin@admin.com
- Password: admin

To connect to the PostgreSQL server in pgAdmin:

1. Click "Add New Server"
2. In the "General" tab, give it a name (e.g., "Scheduling App")
3. In the "Connection" tab, enter:
   - Host: postgres
   - Port: 5432
   - Username: postgres
   - Password: postgres
   - Database: scheduling_app

## Migrations

The application uses TypeORM migrations to manage database schema changes.

### Generating Migrations

After making changes to entity files, generate a migration:

```bash
npm run db:migration:generate -- <migration-name>
```

For example:

```bash
npm run db:migration:generate -- CreateUsersTable
```

The migration files will be created in the `backend/src/migrations` directory. The TypeORM configuration for migrations is in the `backend/typeorm.config.ts` file.

### Running Migrations

To apply all pending migrations:

```bash
npm run db:migration:run
```

### Reverting Migrations

To revert the most recent migration:

```bash
npm run db:migration:revert
```

## Database Configuration

The database connection is configured in the backend's `.env` file. The default configuration is:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=scheduling_app
```

If you need to change these settings, update both the `.env` file and the `docker-compose.yml` file.
