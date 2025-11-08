-- Initialize production database
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database if it doesn't exist (this is handled by POSTGRES_DB env var)
-- But we can add any additional setup here

-- Set timezone
SET timezone = 'UTC';

-- Create any additional schemas or initial data if needed
-- This will be populated by Prisma migrations during deployment
