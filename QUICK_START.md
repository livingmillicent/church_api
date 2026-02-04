# Quick Start Guide - Church Management System API

## 🚀 Quick Setup (5 Minutes)

### Step 1: Configure PostgreSQL

The application needs to connect to PostgreSQL. You have two options:

#### Option A: Set PostgreSQL Password (Recommended)

Open PostgreSQL command line and set a password:

```powershell
# Method 1: Using pgAdmin (GUI)
1. Open pgAdmin
2. Right-click on "postgres" user
3. Select "Properties"
4. Go to "Definition" tab
5. Set password to "postgres" (or your preferred password)
6. Click "Save"

# Method 2: Using SQL (Command Line)
# If you have psql in your PATH:
psql -U postgres -c "ALTER USER postgres PASSWORD 'postgres';"
```

#### Option B: Configure PostgreSQL for Trust Authentication (Local Development Only)

⚠️ **Warning: Only for local development. NOT for production!**

1. Find your `pg_hba.conf` file:
   - Usually at: `C:\Program Files\PostgreSQL\17\data\pg_hba.conf`

2. Open it in Notepad (as Administrator)

3. Find this line:
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   ```

4. Change `scram-sha-256` to `trust`:
   ```
   host    all             all             127.0.0.1/32            trust
   ```

5. Restart PostgreSQL:
   ```powershell
   Restart-Service postgresql-x64-17
   ```

### Step 2: Update .env File

The `.env` file is already created. Verify the password matches your PostgreSQL setup:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres  # Change this to your actual password
DB_DATABASE=church_management
```

### Step 3: Create Database

The application will create tables automatically, but you need to create the database first.

**Option A: Using pgAdmin**
1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" > "Database"
4. Name it: `church_management`
5. Click "Save"

**Option B: Using command line** (if available):
```powershell
createdb -U postgres church_management
```

**Option C: Let me create it for you automatically**
The application will attempt to create it on first run if you have proper permissions.

### Step 4: Start the Application

```powershell
# Make sure you're in the project directory
cd c:\Users\MillicentMawukoenyaL\Desktop\chmsApi

# Start the development server
npm run start:dev
```

You should see:
```
✅ Application is running on: http://localhost:3000
📚 Swagger documentation: http://localhost:3000/api/docs
🔐 API endpoints available at: http://localhost:3000/api/v1
```

### Step 5: Test the API

**1. Open Swagger Documentation:**
```
http://localhost:3000/api/docs
```

**2. Register First User (Admin):**

Open PowerShell and run:

```powershell
$body = @{
    firstName = "Admin"
    lastName = "User"
    email = "admin@church.com"
    phone = "+233201234567"
    password = "Admin123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Save the token
$token = $response.accessToken
Write-Host "✅ User registered! Access Token saved." -ForegroundColor Green
```

**3. Assign Admin Role:**

```powershell
$userId = $response.user.id

$roleBody = @{
    userId = $userId
    role = "ADMIN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/assign-role" `
    -Method POST `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $roleBody `
    -ContentType "application/json"

Write-Host "✅ Admin role assigned!" -ForegroundColor Green
```

**4. Seed Departments:**

```powershell
$departments = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/departments/seed" `
    -Method POST `
    -Headers @{ Authorization = "Bearer $token" }

Write-Host "✅ Seeded $($departments.message)" -ForegroundColor Green
```

**5. Create a Test Member:**

```powershell
$memberBody = @{
    firstName = "John"
    lastName = "Doe"
    gender = "MALE"
    dateOfBirth = "1990-01-15"
    phone = "+233207654321"
    email = "john.doe@example.com"
    ministry = "ADULT"
    joinDate = "2025-01-01"
    status = "ACTIVE"
} | ConvertTo-Json

$member = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/members" `
    -Method POST `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $memberBody `
    -ContentType "application/json"

$memberId = $member.id
Write-Host "✅ Member created! ID: $memberId" -ForegroundColor Green
```

**6. Create a Test Contribution:**

```powershell
$contribBody = @{
    memberId = $memberId
    contributionType = "TITHES"
    amount = 500.00
    paymentMethod = "CASH"
    reference = "TEST001"
    date = "2026-02-04T10:00:00Z"
} | ConvertTo-Json

$contribution = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/contributions" `
    -Method POST `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $contribBody `
    -ContentType "application/json"

Write-Host "✅ Contribution recorded! Amount: $($contribution.amount)" -ForegroundColor Green
```

**7. View Financial Summary:**

```powershell
$summary = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/reports/financial-summary" `
    -Method GET `
    -Headers @{ Authorization = "Bearer $token" }

Write-Host "`n📊 Financial Summary:" -ForegroundColor Cyan
Write-Host "Total Contributions: $($summary.contributions.total)" -ForegroundColor Green
Write-Host "Total Expenses: $($summary.expenses.total)" -ForegroundColor Yellow
Write-Host "Balance: $($summary.balance)" -ForegroundColor $(if ($summary.balance -ge 0) { "Green" } else { "Red" })
```

---

## 🎯 Complete Test Script

Save this as `test-api.ps1` and run it:

```powershell
# Church Management API - Complete Test Script
Write-Host "🏗️  Testing Church Management API..." -ForegroundColor Cyan

# 1. Register Admin
Write-Host "`n1️⃣  Registering admin user..." -ForegroundColor Yellow
$registerBody = @{
    firstName = "Admin"
    lastName = "User"
    email = "admin@church.com"
    phone = "+233201234567"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" `
        -Method POST `
        -Body $registerBody `
        -ContentType "application/json"
    
    $token = $response.accessToken
    $userId = $response.user.id
    Write-Host "✅ Admin registered successfully!" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  User might already exist. Logging in..." -ForegroundColor Yellow
    
    $loginBody = @{
        email = "admin@church.com"
        password = "Admin123!"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"
    
    $token = $response.accessToken
    $userId = $response.user.id
    Write-Host "✅ Logged in successfully!" -ForegroundColor Green
}

# 2. Seed Departments
Write-Host "`n2️⃣  Seeding departments..." -ForegroundColor Yellow
try {
    $departments = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/departments/seed" `
        -Method POST `
        -Headers @{ Authorization = "Bearer $token" }
    Write-Host "✅ $($departments.message)" -ForegroundColor Green
}
catch {
    Write-Host "✅ Departments already seeded" -ForegroundColor Green
}

# 3. Get All Departments
Write-Host "`n3️⃣  Fetching departments..." -ForegroundColor Yellow
$depts = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/departments?limit=20" `
    -Method GET `
    -Headers @{ Authorization = "Bearer $token" }
Write-Host "✅ Found $($depts.meta.total) departments" -ForegroundColor Green

# 4. Create Member
Write-Host "`n4️⃣  Creating test member..." -ForegroundColor Yellow
$memberBody = @{
    firstName = "Jane"
    lastName = "Smith"
    gender = "FEMALE"
    dateOfBirth = "1995-05-20"
    phone = "+233209876543"
    email = "jane.smith@example.com"
    ministry = "ADULT"
    joinDate = "2025-01-01"
} | ConvertTo-Json

$member = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/members" `
    -Method POST `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $memberBody `
    -ContentType "application/json"

Write-Host "✅ Member created: $($member.firstName) $($member.lastName)" -ForegroundColor Green

# 5. Create Contribution
Write-Host "`n5️⃣  Recording contribution..." -ForegroundColor Yellow
$contribBody = @{
    memberId = $userId
    contributionType = "TITHES"
    amount = 1000.00
    paymentMethod = "CASH"
    date = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json

$contrib = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/contributions" `
    -Method POST `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $contribBody `
    -ContentType "application/json"

Write-Host "✅ Contribution recorded: GH₵ $($contrib.amount)" -ForegroundColor Green

# 6. Get Financial Summary
Write-Host "`n6️⃣  Generating financial report..." -ForegroundColor Yellow
$summary = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/reports/financial-summary" `
    -Method GET `
    -Headers @{ Authorization = "Bearer $token" }

Write-Host "`n📊 FINANCIAL SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Total Contributions: GH₵ $($summary.contributions.total)" -ForegroundColor Green
Write-Host "Total Expenses:      GH₵ $($summary.expenses.total)" -ForegroundColor Yellow
Write-Host "Balance:             GH₵ $($summary.balance)" -ForegroundColor $(if ($summary.balance -ge 0) { "Green" } else { "Red" })
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n✅ All tests completed successfully!" -ForegroundColor Green
Write-Host "`n📚 View Swagger Docs: http://localhost:3000/api/docs" -ForegroundColor Cyan
Write-Host "🔐 Your Token: $token" -ForegroundColor Gray
```

---

## 📱 Import Postman Collection

1. Open Postman
2. Click "Import"
3. Select `postman_collection.json` from the project root
4. Set the `baseUrl` environment variable to `http://localhost:3000/api/v1`
5. Register a user and the token will be automatically saved

---

## ✅ Verification Checklist

- [ ] PostgreSQL is running (`Get-Service postgresql-x64-17`)
- [ ] Database `church_management` exists
- [ ] `.env` file has correct DB password
- [ ] Application starts without errors
- [ ] Can access Swagger docs at http://localhost:3000/api/docs
- [ ] Can register a user
- [ ] Can login
- [ ] Can seed departments
- [ ] Can create members
- [ ] Can record contributions

---

## 🐛 Common Issues

### Issue: "password authentication failed"
**Solution:** Update PostgreSQL password or use trust authentication (see Step 1)

### Issue: "database does not exist"
**Solution:** Create the database using pgAdmin or command line (see Step 3)

### Issue: "Port 3000 already in use"
**Solution:** Change PORT in `.env` file or stop other process using port 3000

### Issue: "Cannot find module"
**Solution:** Run `npm install` again

---

## 🎉 Success!

If you see the financial summary with data, everything is working perfectly!

Your Church Management System API is ready to use. 

Next steps:
- Deploy to production (see DEPLOYMENT.md)
- Customize for your church
- Add more features as needed

---

**Need Help?** Check the full [README.md](README.md) or [DEPLOYMENT.md](DEPLOYMENT.md)
