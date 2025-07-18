#!/bin/bash

# Development setup script
set -e

echo "🛠️  Setting up MERN Chat App for development..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        echo "Node.js is not installed. Please install Node.js 16+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        echo "Node.js version 16+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_status "Node.js version: $(node -v) ✓"
}

# Install dependencies
install_deps() {
    print_status "Installing root dependencies..."
    npm install
    
    print_status "Installing server dependencies..."
    cd server && npm install && cd ..
    
    print_status "Installing client dependencies..."
    cd client && npm install && cd ..
    
    print_status "All dependencies installed ✓"
}

# Setup environment files
setup_env() {
    print_status "Setting up environment files..."
    
    if [ ! -f "server/.env" ]; then
        cp server/.env.example server/.env
        print_warning "Created server/.env from template. Please update with your values."
    fi
    
    if [ ! -f "client/.env" ]; then
        cp client/.env.example client/.env
        print_warning "Created client/.env from template. Please update with your values."
    fi
    
    print_status "Environment files ready ✓"
}

# Create uploads directory
setup_directories() {
    print_status "Creating necessary directories..."
    mkdir -p server/uploads
    print_status "Directories created ✓"
}

# Main setup function
setup() {
    check_node
    install_deps
    setup_env
    setup_directories
    
    print_status "Development setup completed! 🎉"
    echo ""
    echo "Next steps:"
    echo "1. Update environment variables in server/.env and client/.env"
    echo "2. Start MongoDB (locally or use MongoDB Atlas)"
    echo "3. Run 'npm run dev' to start development servers"
    echo ""
    echo "Available commands:"
    echo "  npm run dev          - Start both client and server in development mode"
    echo "  npm run server:dev   - Start only the server"
    echo "  npm run client:dev   - Start only the client"
    echo "  npm run build        - Build the client for production"
}

# Run setup
setup
