FROM mysql:8.0

RUN microdnf install -y cronie tar bash tzdata && microdnf clean all

WORKDIR /app

COPY backup.sh /usr/local/bin/backup.sh
COPY crontab /var/spool/cron/root

RUN chmod +x /usr/local/bin/backup.sh

CMD ["crond", "-f"]
