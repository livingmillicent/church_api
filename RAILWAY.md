# Deploy to Railway

Complete guide for deploying the Church Management System API to Railway - **No credit card required!**

## Why Railway?

- ✅ **No credit card required** for free tier
- ✅ $5 free credits per month
- ✅ PostgreSQL database included
- ✅ Auto-deploy from GitHub
- ✅ Simple setup (5 minutes)
- ✅ Great developer experience

## Prerequisites

1. Railway account (sign up at https://railway.app)
2. GitHub account with your code pushed
3. That's it! No credit card needed.

## Quick Deploy (Recommended)

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Login with GitHub"
3. Authorize Railway

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `livingmillicent/church_api`
4. Select branch: `develop`

### Step 3: Add PostgreSQL Database

1. In your project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway automatically creates and links the database

### Step 4: Configure Environment Variables

Railway auto-detects some variables from PostgreSQL, but add these manually:

**Click on your service → Variables tab → Add variables:**

```bash
NODE_ENV=production
PORT=3000

# Database (Railway auto-provides these, but verify):
# DATABASE_URL is auto-generated
# Or use individual variables:
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_DATABASE=${{Postgres.PGDATABASE}}

# JWT Configuration (generate secure secrets)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_REFRESH_EXPIRATION=7d
```

**To generate secure secrets in PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Step 5: Deploy

1. Railway automatically deploys after configuration
2. Wait for build to complete (2-3 minutes)
3. Your API is live! 🎉

### Step 6: Initialize Database

**Option A: Using Railway CLI**

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login and link project:
   ```bash
   railway login
   railway link
   ```

3. Run database setup:
   ```bash
   railway run psql -f database-setup.sql
   ```

**Option B: Manual (Using Database URL)**

1. Get database URL from Railway dashboard:
   - Click on PostgreSQL service
   - Copy "Connect" → "PostgreSQL Connection URL"

2. Run setup script:
   ```bash
   psql "postgresql://..." -f database-setup.sql
   ```

## Project Structure

Your Railway project will have:
- **Web Service** - Your NestJS API
- **PostgreSQL** - Database service
- **Automatic deployments** - Push to trigger deploy

## Environment Variable Reference

Railway provides these automatically from PostgreSQL:
- `${{Postgres.DATABASE_URL}}` - Full connection string
- `${{Postgres.PGHOST}}` - Database host
- `${{Postgres.PGPORT}}` - Database port (5432)
- `${{Postgres.PGUSER}}` - Database user
- `${{Postgres.PGPASSWORD}}` - Database password
- `${{Postgres.PGDATABASE}}` - Database name

## Custom Domain

1. Go to your service settings
2. Click "Settings" → "Domains"
3. Click "Generate Domain" (free Railway subdomain)
4. Or add your custom domain

## Auto-Deploy

Push to GitHub to automatically deploy:

```bash
git add .
git commit -m "Update API"
git push origin develop
```

Railway detects the push and deploys automatically.

## Monitoring

### View Logs
1. Click on your service
2. Go to "Deployments" tab
3. Click on active deployment
4. View real-time logs

### Metrics
Railway provides:
- CPU usage
- Memory usage
- Network usage
- Build times

## Railway CLI Commands

```bash
# Install
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Open service
railway open

# Run commands in Railway environment
railway run node dist/main

# Access database
railway run psql
```

## Database Management

### Connect to PostgreSQL

**Using Railway CLI:**
```bash
railway run psql
```

**Using connection URL:**
```bash
psql $DATABASE_URL
```

### Backup Database

```bash
# Export
railway run pg_dump > backup.sql

# Restore
railway run psql < backup.sql
```

## Troubleshooting

### Build Failures

**Issue:** Build fails
**Solution:**
- Check build logs in Railway dashboard
- Verify `package.json` scripts are correct
- Ensure all dependencies are in `package.json`

### Database Connection Issues

**Issue:** Can't connect to database
**Solution:**
- Verify environment variables are set correctly
- Use Railway's provided variables: `${{Postgres.PGHOST}}`
- Check PostgreSQL service is running

### Port Issues

**Issue:** Application not accessible
**Solution:**
- Ensure your app uses `process.env.PORT`
- Railway automatically assigns port
- Check in `main.ts`:
  ```typescript
  await app.listen(process.env.PORT || 3000);
  ```

### Out of Credits

**Issue:** Service stopped (out of $5 credits)
**Solution:**
- Monitor usage in Railway dashboard
- Optimize resource usage
- Consider upgrading to paid plan ($5/month for $5 credits + no resource limits)
- Free plan resets monthly

## Resource Usage Tips

**Minimize Credit Usage:**

1. **Use efficient queries** - Optimize database queries
2. **Implement caching** - Reduce database calls
3. **Limit logging** - Excessive logging uses resources
4. **Sleep during inactivity** - Railway auto-sleeps free services
5. **Monitor usage** - Check dashboard regularly

## Scaling

### Free Tier Limits
- $5 credits/month
- Shared resources
- Auto-sleep after inactivity
- Limited to starter resources

### Upgrade Options
- **Developer Plan:** $5/month + usage
- **Team Plan:** $20/month + usage
- Pay only for what you use

## Cost Estimation

**Free Tier ($5 credits):**
- Light usage: Full month
- Medium usage: 2-3 weeks
- Heavy usage: 1 week

**Example Usage:**
- Small API (low traffic): ~$3/month
- Medium API (moderate traffic): ~$8/month

## Security Best Practices

1. ✅ Use environment variables for secrets
2. ✅ Generate strong JWT secrets (32+ characters)
3. ✅ Enable HTTPS (automatic on Railway)
4. ✅ Use Railway's internal networking
5. ✅ Regularly update dependencies
6. ✅ Monitor logs for issues
7. ✅ Use private variables for sensitive data

## Migrate from Other Platforms

### From Render
- Export database: `pg_dump > backup.sql`
- Create Railway project (steps above)
- Import database: `railway run psql < backup.sql`
- Update DNS if using custom domain

### From Heroku
- Similar process to Render
- Railway CLI similar to Heroku CLI
- Environment variables map directly

## Getting Help

- **Railway Docs:** https://docs.railway.app
- **Discord Community:** https://discord.gg/railway
- **GitHub Issues:** https://github.com/livingmillicent/church_api/issues

## Quick Links

- Railway Dashboard: https://railway.app/dashboard
- Project URL: Will be `https://your-app.railway.app`
- API Docs: `https://your-app.railway.app/api`

## Next Steps After Deployment

1. ✅ Test API endpoints
2. ✅ Initialize database with setup script
3. ✅ Create first admin user
4. ✅ Test authentication
5. ✅ Configure custom domain (optional)
6. ✅ Set up monitoring/alerts
7. ✅ Document API URL for frontend team

---

**Your Church Management API is now live on Railway! 🚀**
