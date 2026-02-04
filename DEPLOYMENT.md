# Deployment & Setup Guide

## Church Management System API - Production Deployment

This guide covers local development setup, testing, and production deployment.

---

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Database Setup](#database-setup)
3. [Testing the Application](#testing-the-application)
4. [Production Deployment](#production-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites Check
Verify you have the required software installed:

```powershell
# Check Node.js version (should be v18+)
node --version

# Check npm version
npm --version

# Check PostgreSQL (should be v14+)
psql --version

# Check Git
git --version
```

### Step 1: Install Dependencies

```powershell
# Navigate to project directory
cd chmsApi

# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 2: Environment Configuration

Create a `.env` file from the example:

```powershell
# Copy example file
Copy-Item .env.example .env

# Edit .env file with your settings
notepad .env
```

**Required Environment Variables:**

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=church_management

# JWT Configuration (Use strong secrets in production!)
JWT_SECRET=change-this-to-a-very-secure-random-string-in-production
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=change-this-to-another-very-secure-random-string
JWT_REFRESH_EXPIRATION=7d

# Application Configuration
PORT=3000
NODE_ENV=development
API_PREFIX=api/v1
```

---

## Database Setup

### Step 1: Install PostgreSQL

**Windows (using Chocolatey):**
```powershell
choco install postgresql
```

**Or download from:** https://www.postgresql.org/download/windows/

### Step 2: Create Database

```powershell
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL shell, create database
CREATE DATABASE church_management;

# Create user (optional, for security)
CREATE USER church_admin WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE church_management TO church_admin;

# Exit PostgreSQL
\q
```

### Step 3: Verify Database Connection

```powershell
# Test connection
psql -U postgres -d church_management -c "SELECT version();"
```

### Step 4: Run Database Migrations

```powershell
# TypeORM will auto-create tables in development mode
# Or run migrations manually:
npm run migration:run
```

---

## Testing the Application

### Step 1: Build the Project

```powershell
# Compile TypeScript
npm run build

# Check for compilation errors
```

### Step 2: Start Development Server

```powershell
# Start in watch mode
npm run start:dev

# You should see output like:
# Application is running on: http://localhost:3000
# Swagger documentation: http://localhost:3000/api/docs
```

### Step 3: Verify API Endpoints

**Test 1: Health Check (Open in browser)**
```
http://localhost:3000/api/v1
```

**Test 2: Swagger Documentation**
```
http://localhost:3000/api/docs
```

**Test 3: Register a User (PowerShell)**
```powershell
$body = @{
    firstName = "Admin"
    lastName = "User"
    email = "admin@church.com"
    phone = "+233201234567"
    password = "AdminPass123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Test 4: Login**
```powershell
$loginBody = @{
    email = "admin@church.com"
    password = "AdminPass123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

# Save token for subsequent requests
$token = $response.accessToken
```

**Test 5: Seed Departments**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/departments/seed" `
    -Method POST `
    -Headers @{ Authorization = "Bearer $token" }
```

### Step 4: Run Unit Tests

```powershell
# Run all tests
npm test

# Run with coverage
npm run test:cov

# View coverage report
start coverage/lcov-report/index.html
```

### Step 5: Run E2E Tests

```powershell
# Run end-to-end tests
npm run test:e2e
```

---

## Production Deployment

### Option 1: Traditional Server Deployment

#### 1. Prepare Production Environment

```powershell
# Set NODE_ENV to production
$env:NODE_ENV="production"

# Update .env for production
# - Use strong JWT secrets
# - Set proper database credentials
# - Configure production database host
```

#### 2. Build for Production

```powershell
# Install production dependencies only
npm ci --only=production

# Build the application
npm run build

# The compiled code will be in the dist/ folder
```

#### 3. Configure Database for Production

```powershell
# Update .env
DB_HOST=your-production-db-host
DB_USERNAME=production_user
DB_PASSWORD=very_secure_password
DB_DATABASE=church_management_prod

# Disable synchronize in production
# Edit src/config/typeorm.config.ts
# Set synchronize: false
```

#### 4. Run Migrations

```powershell
# Run migrations in production
npm run migration:run
```

#### 5. Start Production Server

```powershell
# Start the application
npm run start:prod

# Or use PM2 for process management
npm install -g pm2
pm2 start dist/main.js --name church-api
pm2 save
pm2 startup
```

---

### Option 2: Heroku Deployment

#### 1. Install Heroku CLI
```powershell
# Install via Chocolatey
choco install heroku-cli

# Login to Heroku
heroku login
```

#### 2. Create Heroku App
```powershell
# Create app
heroku create church-management-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini
```

#### 3. Configure Environment Variables
```powershell
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set JWT_REFRESH_SECRET=your-refresh-secret
heroku config:set JWT_EXPIRATION=1h
heroku config:set JWT_REFRESH_EXPIRATION=7d
heroku config:set API_PREFIX=api/v1
```

#### 4. Deploy
```powershell
# Initialize git if not done
git init
git add .
git commit -m "Initial deployment"

# Deploy to Heroku
git push heroku main

# Check logs
heroku logs --tail
```

---

### Option 3: AWS Deployment (EC2)

#### 1. Launch EC2 Instance
- AMI: Ubuntu Server 22.04 LTS
- Instance Type: t3.small or larger
- Security Group: Open ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

#### 2. Connect and Setup
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx (reverse proxy)
sudo apt install nginx
```

#### 3. Deploy Application
```bash
# Clone repository
git clone your-repo-url
cd chmsApi

# Install dependencies
npm ci --only=production

# Build
npm run build

# Setup PM2
npm install -g pm2
pm2 start dist/main.js --name church-api
pm2 startup
pm2 save
```

#### 4. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/church-api

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/church-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_DATABASE=church_management
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=church_management
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy with Docker

```powershell
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Troubleshooting

### Issue: Cannot connect to database

**Solution:**
```powershell
# Check PostgreSQL is running
Get-Service postgresql*

# Start PostgreSQL if stopped
Start-Service postgresql-x64-14

# Test connection
psql -U postgres -c "SELECT 1"
```

### Issue: Port 3000 already in use

**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

### Issue: JWT token errors

**Solution:**
- Ensure JWT_SECRET and JWT_REFRESH_SECRET are set in .env
- Verify tokens haven't expired
- Check Bearer token format in Authorization header

### Issue: Migration errors

**Solution:**
```powershell
# Drop all tables and recreate
# WARNING: This deletes all data!
psql -U postgres -d church_management -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Restart application to recreate tables
npm run start:dev
```

### Issue: TypeORM synchronize issues

**Solution:**
- In development, set `synchronize: true` in typeorm.config.ts
- In production, always use migrations and set `synchronize: false`

---

## Performance Optimization

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_contributions_date ON contributions(date);
CREATE INDEX idx_contributions_type ON contributions("contributionType");
CREATE INDEX idx_expenses_date ON expenses("expenseDate");
CREATE INDEX idx_expenses_department ON expenses(department);
```

### Application Optimization

```typescript
// Enable caching in production
// Add to main.ts
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
});
```

### Monitoring

```powershell
# Install PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View real-time monitoring
pm2 monit
```

---

## Security Checklist

- [ ] Strong JWT secrets in production
- [ ] Database credentials secured
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Helmet.js for security headers
- [ ] Regular security updates
- [ ] Database backups automated
- [ ] Environment variables not committed to git
- [ ] API documentation not exposed in production

---

## Backup Strategy

### Automated Database Backups

```powershell
# Create backup script (backup.ps1)
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backup_$date.sql"

& "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" `
    -U postgres `
    -d church_management `
    -F c `
    -f "C:\backups\$backupFile"

# Schedule with Task Scheduler
# Run daily at 2 AM
```

### Restore from Backup

```powershell
& "C:\Program Files\PostgreSQL\14\bin\pg_restore.exe" `
    -U postgres `
    -d church_management `
    -c `
    "C:\backups\backup_file.sql"
```

---

## Support & Maintenance

### Log Locations

- Application logs: `logs/` directory
- PM2 logs: `~/.pm2/logs/`
- PostgreSQL logs: Check PostgreSQL data directory

### Health Monitoring

Create a health check endpoint:
```typescript
// Add to app.controller.ts
@Get('health')
healthCheck() {
  return { status: 'ok', timestamp: new Date() };
}
```

Monitor with:
```powershell
# Check every 5 minutes
while ($true) {
  Invoke-RestMethod http://localhost:3000/api/v1/health
  Start-Sleep 300
}
```

---

**Deployment Complete!** Your Church Management System API is now ready for production use.

For issues or questions, refer to the main README.md or contact the development team.
