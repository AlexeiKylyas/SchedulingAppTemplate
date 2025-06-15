#!/bin/bash
set -e

# The PostgreSQL Docker image already creates the user and database based on the environment variables,
# so this script is mainly for additional setup if needed.

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create extensions if they don't exist
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Additional setup can be added here
EOSQL

echo "Database initialization completed."
