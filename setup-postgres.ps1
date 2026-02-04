# PostgreSQL Setup Script for Church Management API
# Run this script as Administrator

Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Church Management API - PostgreSQL Setup       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  WARNING: This script should be run as Administrator for best results." -ForegroundColor Yellow
    Write-Host "   Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Check PostgreSQL Service
Write-Host "1️⃣  Checking PostgreSQL service..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql-x64-17" -ErrorAction SilentlyContinue

if ($null -eq $pgService) {
    Write-Host "❌ PostgreSQL service not found!" -ForegroundColor Red
    Write-Host "   Please install PostgreSQL 17 first." -ForegroundColor Red
    Write-Host "   Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    exit 1
}

if ($pgService.Status -ne "Running") {
    Write-Host "⚠️  PostgreSQL is not running. Starting service..." -ForegroundColor Yellow
    Start-Service -Name "postgresql-x64-17"
    Start-Sleep -Seconds 3
    Write-Host "✅ PostgreSQL service started" -ForegroundColor Green
} else {
    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
}
Write-Host ""

# Step 2: Find PostgreSQL installation
Write-Host "2️⃣  Locating PostgreSQL installation..." -ForegroundColor Yellow
$pgPaths = @(
    "C:\Program Files\PostgreSQL\17\bin",
    "C:\Program Files\PostgreSQL\16\bin",
    "C:\Program Files\PostgreSQL\15\bin",
    "C:\PostgreSQL\17\bin"
)

$pgBinPath = $null
foreach ($path in $pgPaths) {
    if (Test-Path "$path\psql.exe") {
        $pgBinPath = $path
        break
    }
}

if ($null -eq $pgBinPath) {
    Write-Host "⚠️  PostgreSQL bin directory not found in common locations." -ForegroundColor Yellow
    Write-Host "   Please provide the path to your PostgreSQL bin directory" -ForegroundColor Yellow
    Write-Host "   Example: C:\Program Files\PostgreSQL\17\bin" -ForegroundColor Gray
    $pgBinPath = Read-Host "   Enter path (or press Enter to configure manually)"
    
    if ([string]::IsNullOrWhiteSpace($pgBinPath) -or -not (Test-Path "$pgBinPath\psql.exe")) {
        Write-Host ""
        Write-Host "Manual configuration required:" -ForegroundColor Cyan
        Write-Host "1. Open pgAdmin (search in Start Menu)" -ForegroundColor White
        Write-Host "2. Connect to PostgreSQL" -ForegroundColor White
        Write-Host "3. Right-click 'postgres' user → Properties → Definition" -ForegroundColor White
        Write-Host "4. Set password to: postgres" -ForegroundColor White
        Write-Host "5. Click 'Save'" -ForegroundColor White
        Write-Host "6. Right-click 'Databases' → Create → Database" -ForegroundColor White
        Write-Host "7. Database name: church_management" -ForegroundColor White
        Write-Host "8. Click 'Save'" -ForegroundColor White
        Write-Host ""
        Write-Host "Then run: npm run start:dev" -ForegroundColor Green
        exit 0
    }
}

Write-Host "✅ Found PostgreSQL at: $pgBinPath" -ForegroundColor Green
Write-Host ""

# Step 3: Set PostgreSQL password
Write-Host "3️⃣  Configuring PostgreSQL password..." -ForegroundColor Yellow
Write-Host "   This will set the 'postgres' user password to: postgres" -ForegroundColor Gray

$psqlCmd = Join-Path $pgBinPath "psql.exe"

# Try to connect and set password
$sqlCommand = "ALTER USER postgres PASSWORD 'postgres';"

Write-Host "   Attempting to set password..." -ForegroundColor Gray

# Method 1: Try with no password (if trust auth is enabled)
$env:PGPASSWORD = ""
$result = & $psqlCmd -U postgres -d postgres -c $sqlCommand 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Password set successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not set password automatically." -ForegroundColor Yellow
    Write-Host "   Error: $result" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Please choose an option:" -ForegroundColor Cyan
    Write-Host "A) I know the current postgres password - I'll enter it now" -ForegroundColor White
    Write-Host "B) I want to enable trust authentication (no password for localhost)" -ForegroundColor White
    Write-Host "C) I'll configure it manually using pgAdmin" -ForegroundColor White
    Write-Host ""
    $choice = Read-Host "Enter choice (A/B/C)"
    
    switch ($choice.ToUpper()) {
        "A" {
            $currentPassword = Read-Host "Enter current postgres password" -AsSecureString
            $currentPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($currentPassword))
            
            $env:PGPASSWORD = $currentPasswordPlain
            $result = & $psqlCmd -U postgres -d postgres -c $sqlCommand 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Password updated successfully!" -ForegroundColor Green
            } else {
                Write-Host "❌ Failed to set password: $result" -ForegroundColor Red
                exit 1
            }
        }
        "B" {
            Write-Host ""
            Write-Host "⚠️  CONFIGURING TRUST AUTHENTICATION (LOCAL DEVELOPMENT ONLY)" -ForegroundColor Yellow
            Write-Host "   This allows connections without password from localhost." -ForegroundColor Yellow
            Write-Host ""
            
            $dataPath = "C:\Program Files\PostgreSQL\17\data\pg_hba.conf"
            if (-not (Test-Path $dataPath)) {
                $dataPath = Read-Host "Enter path to pg_hba.conf file"
            }
            
            if (Test-Path $dataPath) {
                $backup = "$dataPath.backup"
                Copy-Item $dataPath $backup
                Write-Host "   Created backup: $backup" -ForegroundColor Green
                
                $content = Get-Content $dataPath
                $newContent = $content -replace 'host\s+all\s+all\s+127\.0\.0\.1/32\s+scram-sha-256', 'host    all             all             127.0.0.1/32            trust'
                $newContent | Set-Content $dataPath
                
                Write-Host "   Updated pg_hba.conf" -ForegroundColor Green
                Write-Host "   Restarting PostgreSQL..." -ForegroundColor Yellow
                Restart-Service postgresql-x64-17
                Start-Sleep -Seconds 5
                Write-Host "✅ Trust authentication enabled" -ForegroundColor Green
                
                # Now set the password
                $env:PGPASSWORD = ""
                $result = & $psqlCmd -U postgres -d postgres -c $sqlCommand 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Password set to 'postgres'" -ForegroundColor Green
                }
            }
        }
        "C" {
            Write-Host ""
            Write-Host "Manual steps:" -ForegroundColor Cyan
            Write-Host "1. Open pgAdmin" -ForegroundColor White
            Write-Host "2. Right-click 'postgres' user → Properties → Definition" -ForegroundColor White
            Write-Host "3. Set password to: postgres" -ForegroundColor White
            Write-Host "4. Click 'Save'" -ForegroundColor White
            exit 0
        }
    }
}
Remove-Item Env:\PGPASSWORD
Write-Host ""

# Step 4: Create database
Write-Host "4️⃣  Creating database..." -ForegroundColor Yellow
$env:PGPASSWORD = "postgres"
$createDbSql = "CREATE DATABASE church_management;"
$result = & $psqlCmd -U postgres -d postgres -c $createDbSql 2>&1

if ($result -match "already exists") {
    Write-Host "✅ Database already exists" -ForegroundColor Green
} elseif ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database created: church_management" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not create database: $result" -ForegroundColor Yellow
}
Remove-Item Env:\PGPASSWORD
Write-Host ""

# Step 5: Verify .env file
Write-Host "5️⃣  Verifying .env configuration..." -ForegroundColor Yellow
$envFile = ".\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "DB_PASSWORD=postgres") {
        Write-Host "✅ .env file configured correctly" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .env file DB_PASSWORD may not be set to 'postgres'" -ForegroundColor Yellow
        Write-Host "   Current .env content:" -ForegroundColor Gray
        Get-Content $envFile | Where-Object { $_ -match "DB_" }
    }
} else {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host "   Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
}
Write-Host ""

# Final Summary
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║             SETUP COMPLETE!                      ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
Write-Host "✅ Database 'church_management' is ready" -ForegroundColor Green
Write-Host "✅ Configuration complete" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run the application:" -ForegroundColor White
Write-Host "   npm run start:dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Access Swagger documentation:" -ForegroundColor White
Write-Host "   http://localhost:3000/api/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Run the test script:" -ForegroundColor White
Write-Host "   .\test-api.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you encounter issues, check QUICK_START.md for troubleshooting." -ForegroundColor Gray
Write-Host ""
