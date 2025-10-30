@echo off
REM Production deployment script for ecommerce application

echo Starting production deployment...

REM Check if required files exist
if not exist "docker-compose.prod.yml" (
    echo Error: docker-compose.prod.yml not found
    exit /b 1
)

REM Check if secrets are configured
set SECRETS_DIR=secrets
set REQUIRED_SECRETS=mysql_root_password.txt mysql_user_password.txt mysql_product_password.txt mysql_order_password.txt jwt_secret.txt grafana_admin_password.txt

for %%s in (%REQUIRED_SECRETS%) do (
    if not exist "%SECRETS_DIR%\%%s" (
        echo Error: Secret file %SECRETS_DIR%\%%s not found
        echo Please create all required secret files before deployment
        exit /b 1
    )
)

REM Check if SSL certificates exist
if not exist "nginx\ssl\cert.pem" (
    echo Warning: SSL certificates not found. Generating self-signed certificates...
    call scripts\generate-ssl-certs.bat
)

REM Create necessary directories
if not exist logs mkdir logs
if not exist uploads mkdir uploads
if not exist nginx\logs mkdir nginx\logs
if not exist mysql\logs mkdir mysql\logs
if not exist redis\logs mkdir redis\logs

REM Pull latest images
echo Pulling latest Docker images...
docker-compose -f docker-compose.prod.yml pull

REM Build custom images
echo Building application images...
docker-compose -f docker-compose.prod.yml build --no-cache

REM Stop existing containers
echo Stopping existing containers...
docker-compose -f docker-compose.prod.yml down

REM Start services
echo Starting production services...
docker-compose -f docker-compose.prod.yml up -d

REM Wait for services to be healthy
echo Waiting for services to be healthy...
timeout /t 30 /nobreak > nul

REM Check service health
echo Checking service health...
docker-compose -f docker-compose.prod.yml ps

REM Run health checks
echo Running health checks...
for /l %%i in (1,1,30) do (
    curl -f http://localhost/health > nul 2>&1
    if not errorlevel 1 (
        echo Application is healthy!
        goto :healthy
    )
    echo Waiting for application to be ready... (%%i/30)
    timeout /t 10 /nobreak > nul
)

:healthy
REM Display running services
echo Production deployment completed!
echo Services running:
docker-compose -f docker-compose.prod.yml ps

echo.
echo Access points:
echo - Application: https://localhost
echo - Grafana: http://localhost:3000
echo - Prometheus: http://localhost:9090
echo - Kibana: http://localhost:5601
echo.
echo To view logs: docker-compose -f docker-compose.prod.yml logs -f [service-name]
echo To stop services: docker-compose -f docker-compose.prod.yml down