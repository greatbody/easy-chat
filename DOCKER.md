# Docker Setup for Easy Chat

This document explains how to build, run, and deploy the Easy Chat application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- Git (for cloning the repository)

## Quick Start with Docker Compose

### Using Pre-built Image from GitHub Container Registry

1. **Pull and run the latest image:**
   ```bash
   docker compose up -d
   ```

2. **Access the application:**
   - Open your browser and go to `http://localhost:8000`

3. **View logs:**
   ```bash
   docker compose logs -f easy-chat
   ```

4. **Stop the application:**
   ```bash
   docker compose down
   ```

### Building Locally

If you want to build the image locally instead of using the pre-built one:

1. **Edit compose.yml** to use local build:
   ```yaml
   services:
     easy-chat:
       build:
         context: .
         dockerfile: Dockerfile
       # Comment out the image line
       # image: ghcr.io/greatbody/easy-chat:latest
   ```

2. **Build and run:**
   ```bash
   docker compose up --build -d
   ```

## Manual Docker Commands

### Building the Image

```bash
# Build the image
docker build -t easy-chat .

# Build with a specific tag
docker build -t easy-chat:v1.0.0 .
```

### Running the Container

```bash
# Run the container
docker run -d \
  --name easy-chat-app \
  -p 8000:8000 \
  -e PORT=8000 \
  easy-chat

# Run with custom port
docker run -d \
  --name easy-chat-app \
  -p 3000:3000 \
  -e PORT=3000 \
  easy-chat
```

### Container Management

```bash
# View running containers
docker ps

# View logs
docker logs easy-chat-app

# Stop the container
docker stop easy-chat-app

# Remove the container
docker rm easy-chat-app

# Remove the image
docker rmi easy-chat
```

## GitHub Container Registry

The application is automatically built and pushed to GitHub Container Registry when changes are made to the main branch.

### Pulling from Registry

```bash
# Pull the latest image
docker pull ghcr.io/greatbody/easy-chat:latest

# Pull a specific version
docker pull ghcr.io/greatbody/easy-chat:v1.0.0
```

### Available Tags

- `latest` - Latest build from main branch
- `main` - Latest build from main branch
- `v*` - Semantic version tags (e.g., v1.0.0, v1.1.0)

## Health Check

The application includes a health check endpoint at `/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "easy-chat"
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | Port number for the HTTP server |
| `NODE_ENV` | - | Environment mode (development/production) |

## Troubleshooting

### Container Won't Start

1. Check if port 8000 is already in use:
   ```bash
   lsof -i :8000
   ```

2. Use a different port:
   ```bash
   docker run -p 3000:8000 easy-chat
   ```

### Health Check Failing

1. Check container logs:
   ```bash
   docker logs easy-chat-app
   ```

2. Test health endpoint manually:
   ```bash
   curl http://localhost:8000/health
   ```

### Build Issues

1. Clear Docker cache:
   ```bash
   docker system prune -a
   ```

2. Rebuild without cache:
   ```bash
   docker build --no-cache -t easy-chat .
   ```

## Security Considerations

- The container runs as a non-root user
- Only necessary ports are exposed
- Vulnerability scanning is performed during CI/CD
- Use specific image tags in production instead of `latest`

## Performance Tuning

The compose.yml includes resource limits:
- Memory: 512MB limit, 256MB reservation
- CPU: 0.5 cores limit, 0.25 cores reservation

Adjust these values based on your requirements and available resources.
