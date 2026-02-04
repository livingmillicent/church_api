# Docker Setup Guide

## Prerequisites

- Docker installed on your system
- Docker Compose installed

## Quick Start

1. **Build and start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f api
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

4. **Stop and remove volumes (clears database):**
   ```bash
   docker-compose down -v
   ```

## Service Details

### PostgreSQL Database
- **Container Name:** chms-postgres
- **Port:** 5432
- **Database:** church_management
- **Username:** postgres
- **Password:** postgres123

### API Application
- **Container Name:** chms-api
- **Port:** 3000
- **URL:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api

## Common Commands

### Rebuild after code changes:
```bash
docker-compose up -d --build
```

### Access PostgreSQL shell:
```bash
docker exec -it chms-postgres psql -U postgres -d church_management
```

### View API logs:
```bash
docker logs -f chms-api
```

### Restart a service:
```bash
docker-compose restart api
```

### Execute command in API container:
```bash
docker exec -it chms-api npm run migration:run
```

## Environment Variables

Modify `docker-compose.yml` or create a `.env` file to customize:

- `DB_HOST`: Database host (default: postgres)
- `DB_PORT`: Database port (default: 5432)
- `DB_USERNAME`: Database user (default: postgres)
- `DB_PASSWORD`: Database password
- `DB_DATABASE`: Database name (default: church_management)
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRATION`: Access token expiration
- `JWT_REFRESH_SECRET`: Refresh token secret
- `JWT_REFRESH_EXPIRATION`: Refresh token expiration

## Production Deployment

**Important:** Change all secrets before deploying to production!

1. Update secrets in `docker-compose.yml` or use environment variables
2. Use Docker secrets or vault for sensitive data
3. Configure reverse proxy (nginx) for HTTPS
4. Set up proper backup strategy for PostgreSQL volume
5. Configure resource limits in docker-compose.yml

## Troubleshooting

### Database connection issues:
```bash
docker-compose logs postgres
docker exec -it chms-postgres pg_isready -U postgres
```

### API not starting:
```bash
docker-compose logs api
```

### Clean restart:
```bash
docker-compose down -v
docker-compose up -d
```
