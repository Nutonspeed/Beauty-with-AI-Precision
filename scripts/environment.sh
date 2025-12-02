#!/bin/bash

# Environment Management Script
set -e

ENVIRONMENT=${1:-development}
ACTION=${2:-setup}

echo "🔧 Environment Management: $ENVIRONMENT - $ACTION"

case $ENVIRONMENT in
    "development"|"staging"|"production")
        ;;
    *)
        echo "❌ Error: Invalid environment. Use: development, staging, or production"
        exit 1
        ;;
esac

case $ACTION in
    "setup")
        echo "⚙️ Setting up $ENVIRONMENT environment..."
        
        # Create environment file if it doesn't exist
        if [ ! -f ".env.$ENVIRONMENT" ]; then
            echo "📝 Creating .env.$ENVIRONMENT file..."
            cp "environments/$ENVIRONMENT/.env.example" ".env.$ENVIRONMENT" 2>/dev/null || {
                cat > ".env.$ENVIRONMENT" << EOF
# $ENVIRONMENT Environment Configuration
NODE_ENV=$ENVIRONMENT
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
REDIS_URL=
SENTRY_DSN=
EOF
            }
        fi
        
        # Create Docker Compose override if needed
        if [ "$ENVIRONMENT" != "development" ] && [ ! -f "docker-compose.$ENVIRONMENT.yml" ]; then
            echo "🐳 Creating Docker Compose configuration..."
            ln -s "docker/environments/$ENVIRONMENT/docker-compose.yml" "docker-compose.$ENVIRONMENT.yml"
        fi
        
        echo "✅ $ENVIRONMENT environment setup completed"
        ;;
        
    "deploy")
        echo "🚀 Deploying to $ENVIRONMENT..."
        ./scripts/deploy/$ENVIRONMENT/deploy.sh
        ;;
        
    "test")
        echo "🧪 Testing $ENVIRONMENT environment..."
        NODE_ENV=$ENVIRONMENT pnpm test
        ;;
        
    "build")
        echo "🔨 Building for $ENVIRONMENT..."
        NODE_ENV=$ENVIRONMENT pnpm build
        ;;
        
    "start")
        echo "🌟 Starting $ENVIRONMENT server..."
        NODE_ENV=$ENVIRONMENT pnpm start
        ;;
        
    "logs")
        echo "📋 Showing $ENVIRONMENT logs..."
        if command -v docker-compose &> /dev/null; then
            docker-compose -f docker-compose.$ENVIRONMENT.yml logs -f
        else
            echo "❌ Docker Compose not available"
        fi
        ;;
        
    "stop")
        echo "🛑 Stopping $ENVIRONMENT environment..."
        if command -v docker-compose &> /dev/null; then
            docker-compose -f docker-compose.$ENVIRONMENT.yml down
        else
            echo "❌ Docker Compose not available"
        fi
        ;;
        
    "clean")
        echo "🧹 Cleaning $ENVIRONMENT environment..."
        if command -v docker-compose &> /dev/null; then
            docker-compose -f docker-compose.$ENVURATION.yml down -v
            docker system prune -f
        fi
        rm -rf .next
        rm -rf node_modules/.cache
        ;;
        
    *)
        echo "❌ Error: Invalid action. Use: setup, deploy, test, build, start, logs, stop, clean"
        exit 1
        ;;
esac
