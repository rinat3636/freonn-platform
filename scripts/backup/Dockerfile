FROM alpine:3.20

RUN apk add --no-cache mariadb-client bash tzdata

WORKDIR /app

COPY backup.sh /usr/local/bin/backup.sh
COPY crontab /etc/crontabs/root

RUN chmod +x /usr/local/bin/backup.sh

CMD ["crond", "-f"]
