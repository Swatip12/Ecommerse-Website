@echo off

REM Start development environment script for Windows

echo Starting Ecommerce Website Development Environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker first.
    exit /b 1
)

REM Start infrastructure services (MySQL and Redis)
echo Starting infrastructure services...
docker-compose -f docker-compose.dev.yml up -d mysql redis phpmyadmin redis-commander

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check if services are healthy
echo Checking service health...
docker-compose -f docker-compose.dev.yml ps

echo.
echo Development environment started successfully!
echo.
echo Services available at:
echo - MySQL: localhost:3306
echo - Redis: localhost:6379
echo - phpMyAdmin: http://localhost:8081
echo - Redis Commander: http://localhost:8082
echo.
echo To start the backend:
echo   cd backend ^&^& mvn spring-boot:run
echo.
echo To start the frontend:
echo   cd frontend ^&^& ng serve
echo.
echo To stop infrastructure services:
echo   docker-compose -f docker-compose.dev.yml down

pause