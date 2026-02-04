# Deploy to Render

Complete guide for deploying the Church Management System API to Render.

## Why Render?

- ✅ **Reliable and stable** platform
- ✅ **PostgreSQL included** (90 days free, then $7/month)
- ✅ **Auto-deploy** from GitHub
- ✅ **Great documentation** and support
- ✅ **Production-ready** infrastructure
- ✅ **Easy setup** with render.yaml

## Prerequisites

1. Render account (sign up at https://render.com)
2. GitHub account with your code pushed ✅
3. Credit card (for verification, not charged immediately)

---

## Quick Deploy (Recommended - Using Blueprint)

### Step 1: Create Render Account

1. Go to https://render.com
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with GitHub
4. Verify your email

### Step 2: Deploy from Blueprint

1. Go to https://dashboard.render.com
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub account (if not already)
4. Select repository: `livingmillicent/church_api`
5. Select branch: `develop`
6. Render detects `render.yaml` automatically
7. Review the services:
   - PostgreSQL Database (chms-postgres)
   - Web Service (chms-api)
8. Click **"Apply"**

Render will:
- Create PostgreSQL database
- Deploy your API
- Configure environment variables automatically
- Link database to API

**Wait 5-10 minutes for deployment to complete.**

---

## Manual Setup (Alternative)

If you prefer manual setup instead of blueprint:

### Step 1: Create PostgreSQL Database

1. In Render Dashboard, click **"New"** → **"PostgreSQL"**
2. Configure:
   - **Name:** `chms-postgres`
   - **Database:** `church_management`
   - **User:** `postgres`
   - **Region:** Oregon (or closest to you)
   - **Plan:** Free
3. Click **"Create Database"**
4. **Save the Internal Database URL** (you'll need it)

### Step 2: Create Web Service

1. Click **"New"** → **"Web Service"**
2. Connect GitHub repository: `livingmillicent/church_api`
3. Configure:
   - **Name:** `chms-api`
   - **Region:** Oregon (same as database)
   - **Branch:** `develop`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/main`
   - **Plan:** Free
4. Click **"Create Web Service"**

### Step 3: Add Environment Variables

In your web service, go to **Environment** tab and add:

```bash
NODE_ENV=production
PORT=3000

# Database (get from PostgreSQL service)
DB_HOST=<from PostgreSQL Internal Connection>
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<from PostgreSQL>
DB_DATABASE=church_management

# JWT (generate secure secrets)
JWT_SECRET=<generate-secure-32-char-string>
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=<generate-different-32-char-string>
JWT_REFRESH_EXPIRATION=7d
```

**Generate secrets in PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Click **"Save Changes"** - Render will redeploy.

---

## Step 4: Initialize Database

After deployment completes:

### Option A: Using Render Shell

1. Go to your PostgreSQL service
2. Click **"Connect"** → **"External Connection"**
3. Copy the PSQL command
4. Run in your local terminal:
   ```bash
   psql <connection-url> < database-setup.sql
   ```

### Option B: Using Web Shell

1. Go to your web service in Render
2. Click **"Shell"** in the top menu
3. If you have migrations configured, run them

### Option C: Manual via pgAdmin/DBeaver

1. Use connection details from Render PostgreSQL
2. Connect with your favorite database tool
3. Execute `database-setup.sql` script

---

## Your API is Live! 🎉

**API URL:** `https://chms-api.onrender.com` (or your custom name)

**Swagger Docs:** `https://chms-api.onrender.com/api`

---

## Auto-Deploy

Every push to `develop` branch triggers automatic deployment:

```bash
git add .
git commit -m "Update API"
git push origin develop
```

Render detects the push and redeploys (~3-5 minutes).

---

## Monitoring & Logs

### View Logs
1. Go to your service in Render Dashboard
2. Click **"Logs"** tab
3. View real-time application logs

### Metrics
1. Click **"Metrics"** tab
2. View:
   - CPU usage
   - Memory usage
   - Request counts
   - Response times

### Events
1. Click **"Events"** tab
2. See deployment history and status

---

## Custom Domain

1. Go to your web service **Settings**
2. Scroll to **"Custom Domain"**
3. Click **"Add Custom Domain"**
4. Enter your domain (e.g., `api.yourchurch.com`)
5. Configure DNS records as instructed by Render:
   ```
   Type: CNAME
   Name: api
   Value: chms-api.onrender.com
   ```
6. SSL certificate is automatic (via Let's Encrypt)

---

## Database Management

### Connect to PostgreSQL

**Get Connection Info:**
1. Go to PostgreSQL service
2. Click **"Connect"**
3. Use **Internal Database URL** for your app
4. Use **External Connection** for local tools

**Using psql:**
```bash
psql postgresql://postgres:<password>@<host>/church_management
```

**Using GUI Tools (pgAdmin, DBeaver, etc.):**
- Host: From connection info
- Port: 5432
- Database: church_management
- User: postgres
- Password: From Render dashboard

### Backup Database

**Automatic Backups:**
- Render automatically backs up databases daily
- Free tier: 7 days retention
- Paid tier: 30 days retention

**Manual Backup:**
```bash
pg_dump postgresql://postgres:<password>@<host>/church_management > backup.sql
```

**Restore:**
```bash
psql postgresql://postgres:<password>@<host>/church_management < backup.sql
```

---

## Troubleshooting

### Issue: Build Fails

**Solutions:**
1. Check build logs in Render dashboard
2. Verify `package.json` has all dependencies
3. Ensure build command is correct
4. Check Node.js version compatibility

### Issue: Database Connection Error

**Solutions:**
1. Verify environment variables are correct
2. Use **Internal Database URL** (not external)
3. Check PostgreSQL service is running
4. Verify database credentials

### Issue: App Crashes on Start

**Solutions:**
1. Check application logs
2. Verify start command: `node dist/main`
3. Ensure `dist` folder was created during build
4. Check all environment variables are set

### Issue: Free Service Spins Down

**Note:** Free tier web services spin down after 15 minutes of inactivity.
- First request after spin down takes 30-60 seconds
- Database stays active (doesn't spin down)
- Upgrade to paid plan ($7/month) to prevent spin down

### Issue: Port Binding Error

**Solution:**
Ensure your `main.ts` uses `process.env.PORT`:
```typescript
await app.listen(process.env.PORT || 3000);
```

---

## Costs & Limits

### Free Tier
- **Web Services:** 750 hours/month (enough for 1 service)
- **PostgreSQL:** 90 days free trial, then $7/month
- **Bandwidth:** 100GB/month
- **Build Minutes:** 500/month
- **Services spin down** after 15 min inactivity

### Paid Plans

**Starter - $7/month each:**
- Web Service: No spin down, 0.5GB RAM
- PostgreSQL: Always on, 1GB storage, 7-day backups

**Standard - $25/month (Web) / $20/month (DB):**
- Web: 2GB RAM, better performance
- PostgreSQL: 10GB storage, 30-day backups

---

## Performance Optimization

### 1. Database Connection Pooling

Update `typeorm.config.ts`:
```typescript
extra: {
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
}
```

### 2. Enable Health Checks

Health check is already configured in `render.yaml`:
```yaml
healthCheckPath: /
```

### 3. Reduce Cold Start Times

For free tier:
- Use lighter dependencies
- Optimize build size
- Consider upgrading to avoid spin down

---

## Scaling

### Horizontal Scaling
1. Go to service **Settings**
2. Increase **"Instance Count"**
3. Render load balances automatically

### Vertical Scaling
1. Upgrade to higher plan (more RAM/CPU)
2. Standard: 2GB RAM
3. Pro: 4GB RAM
4. Pro Plus: 8GB+ RAM

---

## Security Best Practices

1. ✅ Use **Internal Database URL** for your application
2. ✅ Never expose database credentials in code
3. ✅ Use strong JWT secrets (32+ characters)
4. ✅ Enable HTTPS (automatic on Render)
5. ✅ Regularly update dependencies
6. ✅ Monitor logs for suspicious activity
7. ✅ Use environment variables for all secrets
8. ✅ Configure CORS for specific domains only
9. ✅ Implement rate limiting
10. ✅ Keep PostgreSQL updated (automatic on Render)

---

## Environment Variables Reference

### Required Variables

```bash
# Node Environment
NODE_ENV=production
PORT=3000

# Database (auto-populated by render.yaml)
DB_HOST=<internal-hostname>
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<auto-generated>
DB_DATABASE=church_management

# JWT Authentication
JWT_SECRET=<32-char-secret>
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=<32-char-secret>
JWT_REFRESH_EXPIRATION=7d
```

### Optional Variables

```bash
# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=https://yourfrontend.com

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

---

## CI/CD Pipeline

Render automatically provides CI/CD:

1. **Push to GitHub** → Triggers webhook
2. **Render pulls code** → Checks for changes
3. **Runs build** → `npm install && npm run build`
4. **Runs tests** (if configured)
5. **Deploys** → Zero-downtime deployment
6. **Health check** → Verifies deployment

**To skip a deployment:**
Add `[skip ci]` or `[ci skip]` to commit message.

---

## Support & Resources

- **Render Docs:** https://render.com/docs
- **Community Forum:** https://community.render.com
- **Status Page:** https://status.render.com
- **GitHub Issues:** https://github.com/livingmillicent/church_api/issues

---

## Quick Reference Commands

### View Logs
```bash
# From Render dashboard → Logs tab
# Or use Render CLI:
render logs <service-name>
```

### SSH into Service
```bash
# From dashboard → Shell
# Or use Render CLI:
render shell <service-name>
```

### Trigger Manual Deploy
1. Go to service in dashboard
2. Click **"Manual Deploy"**
3. Select branch
4. Click **"Deploy"**

---

## Next Steps After Deployment ✅

1. ✅ Verify API is accessible
2. ✅ Initialize database with `database-setup.sql`
3. ✅ Test Swagger documentation
4. ✅ Register first admin user
5. ✅ Test authentication endpoints
6. ✅ Configure custom domain (optional)
7. ✅ Set up monitoring alerts
8. ✅ Share API URL with team
9. ✅ Document credentials securely

---

**Your Church Management API is deployed and ready! 🚀**

Access it at: `https://chms-api.onrender.com/api`
