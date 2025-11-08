@echo off
echo 🚀 Starting AI367Bar Production Environment...
echo.

echo 📋 Checking prerequisites...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed or not running
    echo Please install Docker Desktop and start it
    pause
    exit /b 1
)

echo ✅ Docker is available
echo.

echo 🏗️ Building production images...
docker-compose -f docker-compose.prod.yml build
if errorlevel 1 (
    echo ❌ Failed to build production images
    pause
    exit /b 1
)

echo ✅ Production images built successfully
echo.

echo 🏃 Starting production services...
docker-compose -f docker-compose.prod.yml up -d
if errorlevel 1 (
    echo ❌ Failed to start production services
    pause
    exit /b 1
)

echo ✅ Production services started
echo.

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo 🔍 Checking service health...
docker-compose -f docker-compose.prod.yml ps

echo.
echo 🎉 Production environment is ready!
echo.
echo 📊 Service URLs:
echo    Application: http://localhost:3000
echo    Database: postgres://ai367bar_user:ai367bar_pass@localhost:5432/ai367bar_prod
echo.
echo 🛠️ Useful commands:
echo    View logs: docker-compose -f docker-compose.prod.yml logs -f
echo    Stop services: docker-compose -f docker-compose.prod.yml down
echo    Run setup: npx tsx scripts/setup-production.ts
echo.
echo 📝 Next steps:
echo 1. Run database setup: npx tsx scripts/setup-production.ts
echo 2. Test the application at http://localhost:3000
echo 3. Check logs if needed: docker-compose -f docker-compose.prod.yml logs -f
echo.
pause
