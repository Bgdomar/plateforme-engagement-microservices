# Architecture Documentation

## Overview

La **Plateforme d'Engagement** est une plateforme microservices pour la gestion de stagiaires.

- **Backend:** Spring Boot 3.x (Java 21) + FastAPI (Python 3.11)
- **Frontend:** Angular 19 (application unifiée)
- **Infrastructure:** Spring Cloud Gateway, Eureka, Kafka, PostgreSQL (×4), pgvector
- **AI:** DeepFace/FaceNet (server-side) + MediaPipe (client-side liveness)

## Architecture Style
- **Microservices** avec service discovery (Eureka)
- **API Gateway** comme point d'entrée unique
- **JWT** pour l'authentification et l'autorisation
- **WebSocket** (STOMP + SockJS) pour le chat temps réel
- **Kafka** pour la communication événementielle

## Communication des services

```
[Angular Frontend :4200]
      │
      ▼
[API Gateway :8080]  ──── Eureka Discovery :8761
      │
      ├── identity-service :8081         (PostgreSQL :5436)
      ├── facial-ai-service :8000        (PostgreSQL + pgvector)
      ├── team-mission-service :8082     (PostgreSQL :5437)
      ├── chat-service :8083             (PostgreSQL :5438)
      ├── notification-service :8084     (PostgreSQL :5439)
      └── kafka :29092
```

## Epics

| Epic | Domaine           | Backend                                   | Frontend              | Statut     |
|------|-------------------|-------------------------------------------|-----------------------|------------|
| 1    | Authentification  | identity-service, facial-ai-service       | login, register, face-auth | ✅ Actif |
| 2    | Équipes & Missions| team-mission-service                      | encadrant, stagiaire  | ✅ Actif   |
| 6    | Chat              | chat-service (texte, images, fichiers)    | chat component        | ✅ Actif   |
| 7    | Notifications     | notification-service                      | intégré dans headers  | ✅ Actif   |
