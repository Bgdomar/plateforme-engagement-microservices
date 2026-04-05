# Infrastructure

Shared infrastructure services for the platform.

## Services

### api-gateway (Spring Cloud Gateway)
Central API gateway routing requests to microservices via Eureka discovery.
- Route-based load balancing
- CORS configuration
- Request deduplication

**Port:** 8080

### discovery-service (Eureka Server)
Service registry for microservice discovery and health monitoring.

**Port:** 8761

### config-server
> Planned — centralized configuration management (Spring Cloud Config).

### docker/
Docker Compose files and environment configurations.

### monitoring/
> Planned — Prometheus, Grafana, ELK stack for observability.
