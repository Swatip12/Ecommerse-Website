# Ecommerce Application Deployment Guide

This document provides comprehensive instructions for deploying the ecommerce application in different environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configurations](#environment-configurations)
3. [Production Deployment](#production-deployment)
4. [Staging Deployment](#staging-deployment)
5. [Development Deployment](#development-deployment)
6. [Security Configuration](#security-configuration)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)

## Prerequisites

### System Requirements

- Docker Engine 20.10+
- Docker Compose 2.0+
- OpenSSL (for SSL certificate generation)
- Minimum 4GB RAM
- Minimum 20GB disk space

### Required Software

```bash
# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Environment Configurations

### Available Environments

1. **Development** (`docker-compose.dev.yml`)
   - Hot reloading enabled
   - Debug logging
   - Development tools included

2. **Staging** (`docker-compose.staging.yml`)
   - Production-like environment
   - Relaxed security for testing
   - Full monitoring stack

3. **Production** (`docker-compose.prod.yml`)
   - Optimized for performance
   - Full security hardening
   - Complete monitoring and logging

## Production Deployment

### 1. Prepare Secrets

Create secure passwords for all services:

```bash
# Generate secure passwords
openssl rand -base64 32 > secrets/mysql_root_password.txt
openssl rand -base64 32 > secrets/mysql_user_password.txt
openssl rand -base64 32 > secrets/mysql_product_password.txt
openssl rand -base64 32 > secrets/mysql_order_password.txt
openssl rand -base64 64 > secrets/jwt_secret.txt
openssl rand -base64 32 > secrets/grafana_admin_password.txt
```

### 2. Configure SSL Certificates

For production, obtain certificates from a trusted CA. For testing:

```bash
# Generate self-signed certificates (Linux/Mac)
./scripts/generate-ssl-certs.sh

# Generate self-signed certificates (Windows)
scripts\generate-ssl-certs.bat
```

### 3. Update Configuration

Edit `backend/main-application/src/main/resources/application-production.yml`:

```yaml
cors:
  allowed-origins: https://yourdomain.com,https://www.yourdomain.com

websocket:
  allowed-origins: https://yourdomain.com,https://www.yourdomain.com
```

### 4. Deploy to Production

```bash
# Linux/Mac
./scripts/deploy-production.sh

# Windows
scripts\deploy-production.bat
```

### 5. Verify Deployment

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Check application health
curl -f https://localhost/health

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

## Staging Deployment

### 1. Deploy Staging Environment

```bash
# Start staging environment
docker-compose -f docker-compose.staging.yml up -d

# Check status
docker-compose -f docker-compose.staging.yml ps
```

### 2. Access Staging Services

- Application: http://localhost
- Database Admin: http://localhost:8081
- Prometheus: http://localhost:9090

## Development Deployment

### 1. Start Development Environment

```bash
# Start development services only (database, redis)
docker-compose -f docker-compose.dev.yml up -d

# Run backend locally
cd backend
mvn spring-boot:run

# Run frontend locally
cd frontend
npm start
```

## Security Configuration

### SSL/TLS Configuration

1. **Production**: Use certificates from trusted CA
2. **Staging**: Use valid certificates or self-signed
3. **Development**: HTTP only (no SSL required)

### Security Headers

The Nginx configuration includes:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS only)
- `Content-Security-Policy`

### Database Security

- Separate users for each service
- Strong passwords stored in secrets
- Connection encryption enabled
- Regular security updates

### Application Security

- JWT tokens with secure secrets
- Password hashing with BCrypt
- Input validation and sanitization
- Rate limiting on API endpoints

## Monitoring and Logging

### Monitoring Stack

1. **Prometheus**: Metrics collection
   - Access: http://localhost:9090
   - Scrapes metrics from application and infrastructure

2. **Grafana**: Visualization
   - Access: http://localhost:3000
   - Default admin credentials in secrets

3. **Alerting**: Configured alert rules
   - Application health
   - Database performance
   - System resources

### Logging Stack

1. **Elasticsearch**: Log storage
   - Stores application and infrastructure logs

2. **Logstash**: Log processing
   - Parses and enriches log data

3. **Kibana**: Log visualization
   - Access: http://localhost:5601

### Key Metrics to Monitor

- Application response times
- Error rates
- Database connection pool usage
- Memory and CPU usage
- Disk space
- Network traffic

## Troubleshooting

### Common Issues

#### 1. Services Not Starting

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs [service-name]

# Check system resources
docker system df
docker system prune
```

#### 2. Database Connection Issues

```bash
# Check MySQL logs
docker-compose -f docker-compose.prod.yml logs mysql

# Test database connection
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p
```

#### 3. SSL Certificate Issues

```bash
# Regenerate certificates
./scripts/generate-ssl-certs.sh

# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout
```

#### 4. Memory Issues

```bash
# Check container memory usage
docker stats

# Increase memory limits in docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 4G
```

### Health Checks

```bash
# Application health
curl -f http://localhost/health

# Database health
docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping

# Redis health
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

## Maintenance

### Regular Tasks

#### 1. Update Dependencies

```bash
# Update Docker images
docker-compose -f docker-compose.prod.yml pull

# Rebuild application images
docker-compose -f docker-compose.prod.yml build --no-cache
```

#### 2. Database Maintenance

```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec mysql mysqldump -u root -p ecommerce > backup.sql

# Optimize tables
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p -e "OPTIMIZE TABLE products, orders, users;"
```

#### 3. Log Rotation

```bash
# Clean old logs
docker-compose -f docker-compose.prod.yml exec backend find /app/logs -name "*.log" -mtime +30 -delete

# Rotate Nginx logs
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reopen
```

#### 4. Security Updates

```bash
# Update base images
docker-compose -f docker-compose.prod.yml pull

# Restart services with new images
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling

#### Horizontal Scaling

```yaml
# In docker-compose.prod.yml
backend:
  deploy:
    replicas: 3
    
# Add load balancer configuration
nginx:
  # Update upstream configuration for multiple backend instances
```

#### Vertical Scaling

```yaml
# Increase resource limits
backend:
  deploy:
    resources:
      limits:
        memory: 4G
        cpus: '2.0'
```

### Backup Strategy

1. **Database Backups**: Daily automated backups
2. **File Uploads**: Regular sync to external storage
3. **Configuration**: Version controlled in Git
4. **Secrets**: Secure backup of secret files

### Disaster Recovery

1. **Database Recovery**: Restore from latest backup
2. **Application Recovery**: Redeploy from Git repository
3. **Data Recovery**: Restore uploaded files from backup
4. **Monitoring**: Verify all services after recovery

## Performance Optimization

### Database Optimization

- Regular index analysis
- Query performance monitoring
- Connection pool tuning
- Read replica configuration

### Application Optimization

- JVM tuning for backend
- Angular build optimization
- CDN for static assets
- Caching strategy optimization

### Infrastructure Optimization

- Container resource allocation
- Network optimization
- Storage performance tuning
- Load balancing configuration

## Support and Documentation

For additional support:

1. Check application logs in `/logs` directory
2. Review monitoring dashboards in Grafana
3. Consult API documentation at `/api/docs`
4. Review this deployment guide

Remember to keep this documentation updated as the deployment process evolves.