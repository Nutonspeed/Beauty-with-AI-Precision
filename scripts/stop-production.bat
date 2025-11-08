@echo off
echo 🛑 Stopping AI367Bar Production Environment...
echo.

echo 📋 Checking if services are running...
docker-compose -f docker-compose.prod.yml ps --services --filter "status=running" | findstr . >nul
if errorlevel 1 (
    echo ℹ️ No production services are currently running
    goto :cleanup
)

echo 🛑 Stopping production services...
docker-compose -f docker-compose.prod.yml down

:cleanup
echo 🧹 Cleaning up unused resources...
docker system prune -f

echo.
echo ✅ Production environment stopped and cleaned up
echo.
echo 📝 To restart production environment, run: scripts\start-production.bat
echo.
pause
