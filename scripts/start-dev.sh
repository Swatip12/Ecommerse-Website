#!/bin/bash

# Start development environment script

echo "Starting Ecommerce Website Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Start infrastructure services (MySQL and Redis)
echo "Starting infrastructure services..."
docker-compose -f docker-compose.dev.yml up -d mysql redis phpmyadmin redis-commander

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Check if services are healthy
echo "Checking service health..."
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "Development environment started successfully!"
echo ""
echo "Services available at:"
echo "- MySQL: localhost:3306"
echo "- Redis: localhost:6379"
echo "- phpMyAdmin: http://localhost:8081"
echo "- Redis Commander: http://localhost:8082"
echo ""
echo "To start the backend:"
echo "  cd backend && mvn spring-boot:run"
echo ""
echo "To start the frontend:"
echo "  cd frontend && ng serve"
echo ""
echo "To stop infrastructure services:"
echo "  docker-compose -f docker-compose.dev.yml down"