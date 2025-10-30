#!/bin/bash

# Production deployment script for ecommerce application

set -e

echo "Starting production deployment..."

# Check if required files exist
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "Error: docker-compose.prod.yml not found"
    exit 1
fi

# Check if secrets are configured
SECRETS_DIR="secrets"
REQUIRED_SECRETS=("mysql_root_password.txt" "mysql_user_password.txt" "mysql_product_password.txt" "mysql_order_password.txt" "jwt_secret.txt" "grafana_admin_password.txt")

for secret in "${REQUIRED_SECRETS[@]}"; do
    if [ ! -f "$SECRETS_DIR/$secret" ]; then
        echo "Error: Secret file $SECRETS_DIR/$secret not found"
        echo "Please create all required secret files before deployment"
        exit 1
    fi
done

# Check if SSL certificates exist
if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
    echo "Warning: SSL certificates not found. Generating self-signed certificates..."
    ./scripts/generate-ssl-certs.sh
fi

# Create necessary directories
mkdir -p logs uploads nginx/logs mysql/logs redis/logs

# Set proper permissions
chmod 755 logs uploads nginx/logs mysql/logs redis/logs
chmod 600 secrets/*.txt

# Pull latest images
echo "Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

# Build custom images
echo "Building application images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Stop existing containers
echo "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start services
echo "Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 30

# Check service health
echo "Checking service health..."
docker-compose -f docker-compose.prod.yml ps

# Run health checks
echo "Running health checks..."
for i in {1..30}; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo "Application is healthy!"
        break
    fi
    echo "Waiting for application to be ready... ($i/30)"
    sleep 10
done

# Display running services
echo "Production deployment completed!"
echo "Services running:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "Access points:"
echo "- Application: https://localhost"
echo "- Grafana: http://localhost:3000"
echo "- Prometheus: http://localhost:9090"
echo "- Kibana: http://localhost:5601"
echo ""
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f [service-name]"
echo "To stop services: docker-compose -f docker-compose.prod.yml down"