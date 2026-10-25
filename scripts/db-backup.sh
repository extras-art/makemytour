#!/usr/bin/env bash
# scripts/db-backup.sh
# Non-destructive database backup utility for MakeMyTour (MySQL)

set -euo pipefail

DB_NAME="${DB_NAME:-makemytour}"
DB_USER="${DB_USER:-root}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "Starting backup of database '${DB_NAME}' from ${DB_HOST}:${DB_PORT}..."

if command -v mysqldump >/dev/null 2>&1; then
    mysqldump \
        --host="${DB_HOST}" \
        --port="${DB_PORT}" \
        --user="${DB_USER}" \
        --single-transaction \
        --quick \
        --routines \
        --triggers \
        "${DB_NAME}" | gzip > "${BACKUP_FILE}"
    echo "Backup completed successfully: ${BACKUP_FILE}"
else
    echo "Error: mysqldump command not found. Please install MySQL client tools."
    exit 1
fi
