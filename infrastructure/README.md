# Infrastructure

Services d'infrastructure partagés pour la plateforme.

## Services

### api-gateway — Spring Cloud Gateway (:8080)
Passerelle API centrale qui route les requêtes vers les microservices via Eureka.
- Routage par path : `/auth/**`, `/api/chat/**`, `/api/notifications/**`, `/uploads/**`, etc.
- CORS configuré pour `localhost:4200`
- Support WebSocket (`/ws/**` → chat-service)
- Support upload fichiers (max 12 MB)

### discovery-service — Eureka Server (:8761)
Registre de services pour la découverte et le health monitoring.

## Routes principales

| Path                    | Service              |
|-------------------------|----------------------|
| `/auth/**`              | identity-service     |
| `/api/profil/**`        | identity-service     |
| `/api/admin/**`         | identity-service     |
| `/uploads/chat/**`      | chat-service         |
| `/uploads/**`           | identity-service     |
| `/api/chat/**`          | chat-service         |
| `/ws/**`                | chat-service (WS)    |
| `/api/notifications/**` | notification-service |
| `/api/equipes/**`       | team-mission-service |
| `/api/missions/**`      | team-mission-service |
| `/facial-ai/**`         | facial-ai-service    |
