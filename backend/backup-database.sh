#!/bin/bash
# KaroVita Database Backup Script
# Add to crontab: 0 2 * * * /path/to/backup-database.sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups/karovita"
DB_NAME="karovita_production"
DB_USER="karovita_user"
DB_PASS="YOUR_DB_PASSWORD"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Create backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/karovita_$TIMESTAMP.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "karovita_*.sql.gz" -mtime +30 -delete

echo "Backup completed: karovita_$TIMESTAMP.sql.gz"
