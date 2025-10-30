# Ecommerce Website

A real-time ecommerce website built with Angular frontend, Spring Boot backend, and MySQL database with Redis caching.

## Project Structure

```
ecommerce-website/
├── frontend/                 # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/     # Feature modules
│   │   │   │   ├── product/
│   │   │   │   ├── cart/
│   │   │   │   ├── order/
│   │   │   │   ├── user/
│   │   │   │   └── admin/
│   │   │   └── shared/      # Shared components and services
│   │   └── ...
│   └── ...
├── backend/                  # Spring Boot multi-module application
│   ├── common/              # Shared utilities and configurations
│   ├── user-service/        # User domain service
│   ├── product-service/     # Product domain service
│   ├── order-service/       # Order domain service
│   ├── main-application/    # Main Spring Boot application
│   └── Dockerfile
├── database/
│   └── init-scripts/        # Database initialization scripts
├── docker-compose.yml       # Production Docker setup
├── docker-compose.dev.yml   # Development Docker setup
└── README.md
```

## Technology Stack

### Frontend
- **Angular 17+** with standalone components
- **Angular Material** for UI components
- **NgRx** for state management
- **SCSS** for styling
- **TypeScript** for type safety

### Backend
- **Spring Boot 3.x** with multi-module architecture
- **Spring Security** with JWT authentication
- **Spring Data JPA** with Hibernate
- **Spring WebSocket** for real-time features
- **Maven** for dependency management

### Database & Caching
- **MySQL 8.0** with domain-specific databases
- **Redis** for caching and session management

### DevOps
- **Docker & Docker Compose** for containerization
- **Multi-stage builds** for optimized images

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Java 17+ (for local backend development)
- Maven 3.9+ (for local backend development)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-website
   ```

2. **Start infrastructure services (MySQL & Redis)**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Run backend locally**
   ```bash
   cd backend
   mvn clean install
   cd main-application
   mvn spring-boot:run
   ```

4. **Run frontend locally**
   ```bash
   cd frontend
   npm install
   ng serve
   ```

5. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8080
   - phpMyAdmin: http://localhost:8081
   - Redis Commander: http://localhost:8082

### Full Docker Setup

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8080
   - phpMyAdmin: http://localhost:8081
   - Redis Commander: http://localhost:8082

## Database Configuration

The application uses domain-driven database design with separate databases:

- **ecommerce_users**: User management and authentication
- **ecommerce_products**: Product catalog and inventory
- **ecommerce_orders**: Order processing and shopping cart

### Default Credentials

- **MySQL Root**: root / rootpassword
- **Admin User**: admin@ecommerce.com / password

## API Documentation

The backend provides RESTful APIs for:

- **User Management**: `/api/users`
- **Product Catalog**: `/api/products`
- **Shopping Cart**: `/api/cart`
- **Order Processing**: `/api/orders`
- **Admin Functions**: `/api/admin`

## Real-time Features

- **WebSocket** for cart synchronization across devices
- **Server-Sent Events (SSE)** for order status updates
- **Real-time inventory** updates
- **Live notifications** for customers and admins

## Development Guidelines

### Frontend Development
- Use standalone components architecture
- Implement lazy loading for feature modules
- Follow Angular style guide
- Use NgRx for state management
- Implement proper error handling

### Backend Development
- Follow domain-driven design principles
- Use proper separation of concerns
- Implement comprehensive error handling
- Add proper validation and security
- Use caching for frequently accessed data

## Testing

### Frontend Testing
```bash
cd frontend
npm test                 # Unit tests
npm run e2e             # End-to-end tests
```

### Backend Testing
```bash
cd backend
mvn test                # Unit tests
mvn verify              # Integration tests
```

## Deployment

### Production Deployment
```bash
docker-compose up -d
```

### Environment Variables
Configure the following environment variables for production:

- `MYSQL_ROOT_PASSWORD`
- `JWT_SECRET`
- `REDIS_PASSWORD`
- `CORS_ALLOWED_ORIGINS`

## Monitoring and Management

- **Spring Boot Actuator**: Health checks and metrics
- **Application Logs**: Centralized logging
- **Database Monitoring**: phpMyAdmin interface
- **Cache Monitoring**: Redis Commander interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.