# Deploy to Render

This guide explains how to deploy the Church Management System API to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Your code pushed to GitHub
3. PostgreSQL database requirements

## Deployment Options

### Option 1: Using render.yaml (Recommended)

1. **Connect your GitHub repository to Render:**
   - Go to https://dashboard.render.com
   - Click "New" → "Blueprint"
   - Connect your GitHub account
   - Select the repository: `livingmillicent/church_api`
   - Select branch: `develop`

2. **Render will automatically detect the `render.yaml` file and create:**
   - PostgreSQL database service
   - Web service (API)
   - Environment variables
   - Auto-deploy on push

3. **Manual Configuration (if needed):**
   - Review and approve the services
   - Click "Apply" to deploy

### Option 2: Manual Setup

#### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard
2. Click "New" → "PostgreSQL"
3. Configure:
   - **Name:** `chms-postgres`
   - **Database:** `church_management`
   - **User:** `postgres`
   - **Region:** Choose closest to you
   - **Plan:** Starter (Free) or paid plan
4. Click "Create Database"
5. **Save the connection details** (Internal Database URL)

#### Step 2: Create Web Service

1. Click "New" → "Web Service"
2. Connect your GitHub repository: `livingmillicent/church_api`
3. Configure:
   - **Name:** `chms-api`
   - **Region:** Same as database
   - **Branch:** `develop`
   - **Runtime:** Node
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `node dist/main`
   - **Plan:** Starter (Free) or paid plan

#### Step 3: Configure Environment Variables

Add these environment variables in the Render dashboard:

```
NODE_ENV=production
PORT=3000
DB_HOST=[From PostgreSQL Internal Connection - hostname]
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=[From PostgreSQL Connection Info]
DB_DATABASE=church_management
JWT_SECRET=[Generate a secure random string]
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=[Generate another secure random string]
JWT_REFRESH_EXPIRATION=7d
```

**To generate secure secrets:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### Step 4: Initialize Database

After first deployment:

1. Go to your PostgreSQL service in Render
2. Click "Connect" → "External Connection"
3. Use the PSQL command or connect via GUI tool
4. Run the `database-setup.sql` script:

```bash
psql -h [hostname] -U postgres -d church_management < database-setup.sql
```

Or use the Render Shell:
1. Go to your web service
2. Click "Shell"
3. Run migration commands if configured

## Auto-Deploy

Render automatically deploys when you push to the connected branch:

```bash
git add .
git commit -m "Your commit message"
git push origin develop
```

## Monitoring & Logs

- **View Logs:** Dashboard → Your Service → Logs
- **Metrics:** Dashboard → Your Service → Metrics
- **Health Check:** Automatically monitored at `/` endpoint

## Custom Domain

1. Go to your web service settings
2. Click "Add Custom Domain"
3. Enter your domain
4. Configure DNS records as instructed

## Environment-Specific Configurations

### Database Connection Pooling

For better performance, update `typeorm.config.ts`:

```typescript
extra: {
  max: 10, // Maximum pool size
  min: 2,  // Minimum pool size
  idleTimeoutMillis: 30000,
}
```

### SSL Configuration (for PostgreSQL)

Render PostgreSQL uses SSL by default. Ensure your TypeORM config includes:

```typescript
ssl: {
  rejectUnauthorized: false
}
```

## Troubleshooting

### Database Connection Issues

1. Check environment variables are correct
2. Verify database internal hostname is used
3. Check database logs in Render dashboard

### Build Failures

1. Check build logs
2. Verify all dependencies in `package.json`
3. Ensure Node version compatibility

### Application Not Starting

1. Check start command is correct: `node dist/main`
2. Verify build created `dist` folder
3. Check application logs

### Port Binding Issues

Render automatically sets the `PORT` environment variable. Ensure your app uses:

```typescript
await app.listen(process.env.PORT || 3000);
```

## Scaling

### Vertical Scaling
Upgrade your plan for more resources:
- Starter: 0.5 GB RAM
- Standard: 2 GB RAM
- Pro: 4+ GB RAM

### Horizontal Scaling
Enable multiple instances in service settings.

## Costs

- **Free Tier:**
  - Web Services: 750 hours/month (enough for 1 service)
  - PostgreSQL: 90 days free, then $7/month for Starter

- **Paid Plans:**
  - Starter: $7/month (Web), $7/month (PostgreSQL)
  - Standard: $25/month (Web), $20/month (PostgreSQL)

## Backup & Recovery

### Database Backups

Render automatically backs up PostgreSQL:
- Daily backups (retained for 7 days on Starter)
- Point-in-time recovery available on higher plans

### Manual Backup

```bash
# Export database
pg_dump -h [hostname] -U postgres -d church_management > backup.sql

# Restore
psql -h [hostname] -U postgres -d church_management < backup.sql
```

## Security Best Practices

1. ✅ Use environment variables for secrets
2. ✅ Enable HTTPS (automatic on Render)
3. ✅ Use strong JWT secrets (auto-generated in render.yaml)
4. ✅ Regularly update dependencies
5. ✅ Monitor logs for suspicious activity
6. ✅ Use internal database URL (not public)
7. ✅ Enable CORS only for trusted domains

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: https://github.com/livingmillicent/church_api/issues
