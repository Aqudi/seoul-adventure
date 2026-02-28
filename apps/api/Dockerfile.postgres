# PostgreSQL container tailored for local/testing environments
FROM postgres:16-alpine

ENV POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=postgres \
    POSTGRES_DB=seoul_advanture

EXPOSE 5432

# Basic healthcheck to ensure the DB is ready before tests run
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD pg_isready -U "$POSTGRES_USER"
