#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Check if Docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: Docker is not installed.' >&2
  exit 1
fi

# Check if Docker Compose is installed
if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Error: Docker Compose is not installed.' >&2
  exit 1
fi

# Build and deploy the application
echo "Building and deploying the application..."

# Build the Docker image
docker build -t erp-immobilier-frontend:latest .

# Stop and remove the existing container if it exists
docker-compose down frontend-prod || true

# Start the new container
docker-compose up -d frontend-prod

echo "Deployment completed successfully!"
