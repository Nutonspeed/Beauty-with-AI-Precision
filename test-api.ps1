# Test API Connection
$response = Invoke-WebRequest -Uri 'http://localhost:3000/api/test-db-connection' -UseBasicParsing
Write-Host "Status Code:" $response.StatusCode
Write-Host "Content:"
$response.Content
