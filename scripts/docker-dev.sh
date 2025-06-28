#!/bin/bash

# Docker development helper script for Easy Chat

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to build the image
build() {
    print_status "Building Easy Chat Docker image..."
    docker build -t easy-chat:latest .
    print_success "Image built successfully!"
}

# Function to run the container
run() {
    print_status "Starting Easy Chat container..."

    # Stop existing container if running
    if docker ps -q -f name=easy-chat-dev > /dev/null; then
        print_warning "Stopping existing container..."
        docker stop easy-chat-dev > /dev/null
        docker rm easy-chat-dev > /dev/null
    fi

    # Run new container
    docker run -d \
        --name easy-chat-dev \
        -p 8000:8000 \
        -e PORT=8000 \
        easy-chat:latest

    print_success "Container started! Access the app at http://localhost:8000"
}

# Function to stop the container
stop() {
    print_status "Stopping Easy Chat container..."
    if docker ps -q -f name=easy-chat-dev > /dev/null; then
        docker stop easy-chat-dev > /dev/null
        docker rm easy-chat-dev > /dev/null
        print_success "Container stopped and removed!"
    else
        print_warning "No running container found."
    fi
}

# Function to view logs
logs() {
    if docker ps -q -f name=easy-chat-dev > /dev/null; then
        print_status "Showing container logs (Ctrl+C to exit)..."
        docker logs -f easy-chat-dev
    else
        print_error "No running container found."
        exit 1
    fi
}

# Function to run with compose
compose_up() {
    print_status "Starting with Docker Compose..."
    docker compose up -d
    print_success "Services started! Access the app at http://localhost:8000"
}

# Function to stop compose services
compose_down() {
    print_status "Stopping Docker Compose services..."
    docker compose down
    print_success "Services stopped!"
}

# Function to show help
show_help() {
    echo "Easy Chat Docker Development Helper"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build         Build the Docker image"
    echo "  run           Run the container (builds if needed)"
    echo "  stop          Stop and remove the container"
    echo "  logs          Show container logs"
    echo "  restart       Stop and start the container"
    echo "  compose-up    Start with Docker Compose"
    echo "  compose-down  Stop Docker Compose services"
    echo "  clean         Remove container and image"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build && $0 run    # Build and run"
    echo "  $0 restart            # Restart the container"
    echo "  $0 logs               # View logs"
}

# Function to restart
restart() {
    stop
    run
}

# Function to clean up
clean() {
    print_status "Cleaning up Docker resources..."

    # Stop and remove container
    if docker ps -aq -f name=easy-chat-dev > /dev/null; then
        docker stop easy-chat-dev > /dev/null 2>&1 || true
        docker rm easy-chat-dev > /dev/null 2>&1 || true
    fi

    # Remove image
    if docker images -q easy-chat:latest > /dev/null; then
        docker rmi easy-chat:latest > /dev/null
    fi

    print_success "Cleanup completed!"
}

# Main script logic
check_docker

case "${1:-help}" in
    build)
        build
        ;;
    run)
        if ! docker images -q easy-chat:latest > /dev/null; then
            print_warning "Image not found. Building first..."
            build
        fi
        run
        ;;
    stop)
        stop
        ;;
    logs)
        logs
        ;;
    restart)
        restart
        ;;
    compose-up)
        compose_up
        ;;
    compose-down)
        compose_down
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
