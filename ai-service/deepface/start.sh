#!/bin/bash

# DeepFace Service Startup Script

set -e

echo "🤖 Starting DeepFace AI Service..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Navigate to service directory
cd "$(dirname "$0")"

# Create necessary directories
mkdir -p models cache logs

# Download models if not exists
if [ ! -d "models/.deepface" ]; then
    echo "📥 Downloading DeepFace models..."
    python3 -c "from deepface.basemodels import VGGFace, Age, Gender, Race, Emotion; print('Models downloaded')"
fi

# Build and start services
echo "🏗️ Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for service to be ready
echo "⏳ Waiting for service to be ready..."
sleep 10

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:8001/health > /dev/null 2>&1; then
    echo "✅ DeepFace service is running successfully!"
    echo "🌐 API available at: http://localhost:8001"
    echo "📚 Documentation at: http://localhost:8001/docs"
else
    echo "❌ Service health check failed"
    docker-compose logs
    exit 1
fi

echo "🎉 DeepFace AI Service setup completed!"
