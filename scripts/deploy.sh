#!/bin/bash

# Deployment script for production
set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=(
        "MONGODB_URI"
        "JWT_SECRET"
        "NODE_ENV"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Environment variable $var is not set"
            exit 1
        fi
    done
    
    print_status "All required environment variables are set ✓"
}

# Install dependencies
install_dependencies() {
    print_status "Installing server dependencies..."
    cd server
    npm ci --only=production
    cd ..
    
    print_status "Installing client dependencies..."
    cd client
    npm ci
    cd ..
}

# Build client
build_client() {
    print_status "Building client application..."
    cd client
    npm run build
    cd ..
    print_status "Client build completed ✓"
}

# Run health checks
health_check() {
    print_status "Running health checks..."
    
    # Start server in background
    cd server
    npm start &
    SERVER_PID=$!
    cd ..
    
    # Wait for server to start
    sleep 10
    
    # Check health endpoint
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_status "Health check passed ✓"
    else
        print_error "Health check failed"
        kill $SERVER_PID
        exit 1
    fi
    
    # Kill the background server
    kill $SERVER_PID
}

# Main deployment function
deploy() {
    print_status "Starting MERN Chat App deployment..."
    
    check_env_vars
    install_dependencies
    build_client
    health_check
    
    print_status "Deployment completed successfully! 🎉"
    print_status "Your application is ready to run with: npm start"
}

# Run deployment
deploy
