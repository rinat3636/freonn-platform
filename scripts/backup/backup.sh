#!/bin/sh
set -e

BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
MYSQL_HOST="${MYSQL_HOST:-mysql}"
MYSQL_USER="${MYSQL_USER:-freonn}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-freonn}"
MYSQL_DATABASE="${MYSQL_DATABASE:-freonn_platform}"
UPLOADS_DIR="${UPLOADS_DIR:-/app/uploads}"

DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

echo "[backup] starting backup $DATE"

mysqldump -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" > "$BACKUP_DIR/db_${DATE}.sql"
tar czf "$BACKUP_DIR/uploads_${DATE}.tar.gz" -C "$UPLOADS_DIR" .

echo "[backup] created $BACKUP_DIR/db_${DATE}.sql and uploads_${DATE}.tar.gz"

find "$BACKUP_DIR" -name 'db_*.sql' -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name 'uploads_*.tar.gz' -mtime +$RETENTION_DAYS -delete

echo "[backup] removed backups older than $RETENTION_DAYS days"
