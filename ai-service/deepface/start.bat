@echo off
REM DeepFace Service Startup Script for Windows

echo 🤖 Starting DeepFace AI Service...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create necessary directories
if not exist "models" mkdir models
if not exist "cache" mkdir cache
if not exist "logs" mkdir logs

echo 🏗️ Building Docker images...
docker-compose build

echo 🚀 Starting services...
docker-compose up -d

REM Wait for service to be ready
echo ⏳ Waiting for service to be ready...
timeout /t 10 /nobreak >nul

REM Health check
echo 🏥 Performing health check...
curl -f http://localhost:8001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ DeepFace service is running successfully!
    echo 🌐 API available at: http://localhost:8001
    echo 📚 Documentation at: http://localhost:8001/docs
) else (
    echo ❌ Service health check failed
    echo Showing logs:
    docker-compose logs
    pause
    exit /b 1
)

echo 🎉 DeepFace AI Service setup completed!
pause
