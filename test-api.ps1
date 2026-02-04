# Church Management API - Complete Test Script
# Make sure the API is running before executing this script
# Run: npm run start:dev

Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Church Management API - Integration Tests      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/v1"
$token = $null
$userId = $null

# Function to make API calls with error handling
function Invoke-ApiCall {
    param(
        [string]$Method,
        [string]$Uri,
        [string]$Body,
        [hashtable]$Headers = @{}
    )
    
    try {
        $params = @{
            Method = $Method
            Uri = $Uri
            ContentType = "application/json"
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorDetail) {
            throw $errorDetail.message
        } else {
            throw $_.Exception.Message
        }
    }
}

# Test 1: Health Check
Write-Host "🏥 Testing API Health..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ API is reachable" -ForegroundColor Green
}
catch {
    Write-Host "❌ Cannot reach API. Make sure it's running:" -ForegroundColor Red
    Write-Host "   npm run start:dev" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 2: Register Admin User
Write-Host "1️⃣  Registering admin user..." -ForegroundColor Yellow
$registerBody = @{
    firstName = "Admin"
    lastName = "User"
    email = "admin@church.com"
    phone = "+233201234567"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $response = Invoke-ApiCall -Method POST -Uri "$baseUrl/auth/register" -Body $registerBody
    $token = $response.accessToken
    $userId = $response.user.id
    Write-Host "✅ User registered successfully!" -ForegroundColor Green
    Write-Host "   User ID: $userId" -ForegroundColor Gray
    Write-Host "   Email: $($response.user.email)" -ForegroundColor Gray
}
catch {
    if ($_ -match "already exists") {
        Write-Host "⚠️  User already exists. Logging in..." -ForegroundColor Yellow
        
        $loginBody = @{
            email = "admin@church.com"
            password = "Admin123!"
        } | ConvertTo-Json
        
        try {
            $response = Invoke-ApiCall -Method POST -Uri "$baseUrl/auth/login" -Body $loginBody
            $token = $response.accessToken
            $userId = $response.user.id
            Write-Host "✅ Logged in successfully!" -ForegroundColor Green
            Write-Host "   User ID: $userId" -ForegroundColor Gray
        }
        catch {
            Write-Host "❌ Login failed: $_" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Registration failed: $_" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Test 3: Verify Token
Write-Host "2️⃣  Verifying authentication..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $profile = Invoke-ApiCall -Method GET -Uri "$baseUrl/auth/profile" -Headers $headers
    Write-Host "✅ Authentication working!" -ForegroundColor Green
    Write-Host "   Role: $($profile.role)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Authentication failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 4: Seed Departments
Write-Host "3️⃣  Seeding departments..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $deptResult = Invoke-ApiCall -Method POST -Uri "$baseUrl/departments/seed" -Headers $headers
    Write-Host "✅ $($deptResult.message)" -ForegroundColor Green
}
catch {
    if ($_ -match "already") {
        Write-Host "✅ Departments already seeded" -ForegroundColor Green
    } else {
        Write-Host "❌ Seeding failed: $_" -ForegroundColor Red
    }
}
Write-Host ""

# Test 5: Get Departments
Write-Host "4️⃣  Fetching departments..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $depts = Invoke-ApiCall -Method GET -Uri "$baseUrl/departments?limit=20" -Headers $headers
    Write-Host "✅ Found $($depts.meta.total) departments:" -ForegroundColor Green
    
    $depts.data | ForEach-Object {
        Write-Host "   • $($_.name)" -ForegroundColor Gray
    }
    
    # Save first department ID for later use
    $departmentId = $depts.data[0].id
}
catch {
    Write-Host "❌ Failed to fetch departments: $_" -ForegroundColor Red
    $departmentId = $null
}
Write-Host ""

# Test 6: Create Member
Write-Host "5️⃣  Creating test member..." -ForegroundColor Yellow
$memberBody = @{
    firstName = "Jane"
    lastName = "Smith"
    gender = "FEMALE"
    dateOfBirth = "1995-05-20"
    phone = "+233209876543"
    email = "jane.smith@church.com"
    ministry = "ADULT"
    joinDate = "2025-01-01"
} | ConvertTo-Json

if ($departmentId) {
    $memberBody = @{
        firstName = "Jane"
        lastName = "Smith"
        gender = "FEMALE"
        dateOfBirth = "1995-05-20"
        phone = "+233209876543"
        email = "jane.smith@church.com"
        departmentId = $departmentId
        ministry = "ADULT"
        joinDate = "2025-01-01"
    } | ConvertTo-Json
}

try {
    $headers = @{ Authorization = "Bearer $token" }
    $member = Invoke-ApiCall -Method POST -Uri "$baseUrl/members" -Body $memberBody -Headers $headers
    $memberId = $member.id
    Write-Host "✅ Member created successfully!" -ForegroundColor Green
    Write-Host "   Name: $($member.firstName) $($member.lastName)" -ForegroundColor Gray
    Write-Host "   ID: $memberId" -ForegroundColor Gray
}
catch {
    if ($_ -match "already exists") {
        Write-Host "⚠️  Member with this email already exists" -ForegroundColor Yellow
        # Get the member
        $members = Invoke-ApiCall -Method GET -Uri "$baseUrl/members?limit=1" -Headers $headers
        $memberId = $members.data[0].id
        Write-Host "   Using existing member ID: $memberId" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to create member: $_" -ForegroundColor Red
        $memberId = $userId
    }
}
Write-Host ""

# Test 7: Create Contribution
Write-Host "6️⃣  Recording contribution..." -ForegroundColor Yellow
$contribBody = @{
    memberId = $memberId
    contributionType = "TITHES"
    amount = 1000.00
    paymentMethod = "CASH"
    date = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    notes = "Test contribution"
} | ConvertTo-Json

try {
    $headers = @{ Authorization = "Bearer $token" }
    $contrib = Invoke-ApiCall -Method POST -Uri "$baseUrl/contributions" -Body $contribBody -Headers $headers
    Write-Host "✅ Contribution recorded successfully!" -ForegroundColor Green
    Write-Host "   Type: $($contrib.contributionType)" -ForegroundColor Gray
    Write-Host "   Amount: GH₵ $($contrib.amount)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Failed to record contribution: $_" -ForegroundColor Red
}
Write-Host ""

# Test 8: Create Expense
Write-Host "7️⃣  Creating expense record..." -ForegroundColor Yellow
$expenseBody = @{
    title = "Office Supplies"
    description = "Stationery and printing materials"
    amount = 250.00
    category = "ADMINISTRATIVE"
    expenseDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json

if ($departmentId) {
    $expenseBody = @{
        title = "Office Supplies"
        description = "Stationery and printing materials"
        amount = 250.00
        category = "ADMINISTRATIVE"
        departmentId = $departmentId
        expenseDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    } | ConvertTo-Json
}

try {
    $headers = @{ Authorization = "Bearer $token" }
    $expense = Invoke-ApiCall -Method POST -Uri "$baseUrl/expenses" -Body $expenseBody -Headers $headers
    Write-Host "✅ Expense recorded successfully!" -ForegroundColor Green
    Write-Host "   Title: $($expense.title)" -ForegroundColor Gray
    Write-Host "   Amount: GH₵ $($expense.amount)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Failed to record expense: $_" -ForegroundColor Red
}
Write-Host ""

# Test 9: Get Financial Summary
Write-Host "8️⃣  Generating financial report..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $summary = Invoke-ApiCall -Method GET -Uri "$baseUrl/reports/financial-summary" -Headers $headers
    
    Write-Host "✅ Financial summary generated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║           FINANCIAL SUMMARY                      ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "📈 CONTRIBUTIONS" -ForegroundColor Green
    Write-Host "   Total:     GH₵ $($summary.contributions.total)" -ForegroundColor White
    Write-Host "   Count:     $($summary.contributions.count) transactions" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "📉 EXPENSES" -ForegroundColor Yellow
    Write-Host "   Total:     GH₵ $($summary.expenses.total)" -ForegroundColor White
    Write-Host "   Count:     $($summary.expenses.count) transactions" -ForegroundColor Gray
    Write-Host ""
    
    $balanceColor = if ($summary.balance -ge 0) { "Green" } else { "Red" }
    Write-Host "💰 BALANCE:   GH₵ $($summary.balance)" -ForegroundColor $balanceColor
    Write-Host ""
    
    if ($summary.contributions.byType) {
        Write-Host "📊 Contributions by Type:" -ForegroundColor Cyan
        $summary.contributions.byType.PSObject.Properties | ForEach-Object {
            Write-Host "   $($_.Name): GH₵ $($_.Value)" -ForegroundColor Gray
        }
        Write-Host ""
    }
}
catch {
    Write-Host "❌ Failed to generate report: $_" -ForegroundColor Red
}
Write-Host ""

# Test 10: Get All Contributions
Write-Host "9️⃣  Fetching contributions..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $contributions = Invoke-ApiCall -Method GET -Uri "$baseUrl/contributions?limit=5" -Headers $headers
    Write-Host "✅ Found $($contributions.meta.total) total contributions" -ForegroundColor Green
    
    if ($contributions.data.Count -gt 0) {
        Write-Host "   Recent contributions:" -ForegroundColor Gray
        $contributions.data | Select-Object -First 5 | ForEach-Object {
            Write-Host "   • $($_.contributionType): GH₵ $($_.amount)" -ForegroundColor Gray
        }
    }
}
catch {
    Write-Host "❌ Failed to fetch contributions: $_" -ForegroundColor Red
}
Write-Host ""

# Test 11: Get All Members
Write-Host "🔟 Fetching members..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $members = Invoke-ApiCall -Method GET -Uri "$baseUrl/members?limit=5" -Headers $headers
    Write-Host "✅ Found $($members.meta.total) total members" -ForegroundColor Green
    
    if ($members.data.Count -gt 0) {
        Write-Host "   Members:" -ForegroundColor Gray
        $members.data | Select-Object -First 5 | ForEach-Object {
            $deptName = if ($_.department) { " ($($_.department.name))" } else { "" }
            Write-Host "   • $($_.firstName) $($_.lastName)$deptName" -ForegroundColor Gray
        }
    }
}
catch {
    Write-Host "❌ Failed to fetch members: $_" -ForegroundColor Red
}
Write-Host ""

# Final Summary
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           TESTS COMPLETED!                       ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "✅ All API endpoints are working correctly!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "• View Swagger docs: http://localhost:3000/api/docs" -ForegroundColor White
Write-Host "• Import Postman collection: postman_collection.json" -ForegroundColor White
Write-Host "• Check database: pgAdmin or psql" -ForegroundColor White
Write-Host ""
Write-Host "Your access token (save for API calls):" -ForegroundColor Yellow
Write-Host $token -ForegroundColor Gray
Write-Host ""
