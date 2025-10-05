#!/bin/bash

# Backup Supabase database with automatic date prefix
# Usage: ./scripts/backup-database.sh

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | grep PGPASSWORD | xargs)
else
    echo "❌ .env file not found"
    exit 1
fi

# Database connection details
PROJECT_REF="bitcdiwokieloffrmwkb"
DB_HOST="db.$PROJECT_REF.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

# Generate timestamp (YYYYMMDD format)
TIMESTAMP=$(date +%Y%m%d)

# Backup directory
BACKUP_DIR="database/backup"
mkdir -p "$BACKUP_DIR"

# Backup filename
BACKUP_FILE="$BACKUP_DIR/$TIMESTAMP-backup.sql"

echo "Backing up database to $BACKUP_FILE..."
pg_dump "postgresql://$DB_USER:$PGPASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup successful: $BACKUP_FILE"
else
    echo "❌ Backup failed"
    exit 1
fi
