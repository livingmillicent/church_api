# Test login and members access
Write-Host "Testing Admin Login..." -ForegroundColor Cyan

# Login
$body = @{
    email = 'admin@church.com'
    password = 'Admin@123'
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/login' -Method POST -Body $body -ContentType 'application/json'
    
    Write-Host "`n✅ Login Successful!" -ForegroundColor Green
    Write-Host "Access Token: $($response.accessToken.Substring(0, 50))..." -ForegroundColor Yellow
    
    # Test members endpoint
    Write-Host "`nTesting Members Access..." -ForegroundColor Cyan
    $headers = @{
        'Authorization' = "Bearer $($response.accessToken)"
        'Content-Type' = 'application/json'
    }
    
    $members = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/members' -Method GET -Headers $headers
    
    Write-Host "✅ Members Access Successful!" -ForegroundColor Green
    Write-Host "Total Members: $($members.Length)" -ForegroundColor Yellow
    
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
