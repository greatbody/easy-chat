# Use the official Deno runtime as the base image
FROM denoland/deno:2.3.7

# Set the working directory
WORKDIR /app

# Copy dependency files first for better caching
COPY deno.json ./

# Cache dependencies (without lock file to avoid version issues)
RUN deno cache deno.json

# Copy the source code
COPY . .

# Cache the main application
RUN deno cache src/main.ts

# Expose the port
EXPOSE 8000

# Set default environment variables
ENV PORT=8000

# Run the application
CMD ["deno", "run", "--allow-net", "--allow-read", "src/main.ts"]
