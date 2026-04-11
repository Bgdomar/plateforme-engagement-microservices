# Architecture Documentation

## Overview

The **Plateforme d'Engagement** is a microservices-based platform built with:

- **Backend:** Spring Boot 3.x (Java) + FastAPI (Python)
- **Frontend:** Angular 19 + TailwindCSS
- **Infrastructure:** Spring Cloud Gateway, Eureka, Kafka, PostgreSQL, MinIO
- **AI:** MediaPipe (client-side face detection) + face_recognition (server-side encoding/matching)

## Architecture Style
- **Microservices** with service discovery (Eureka)
- **Event-driven** communication via Apache Kafka
- **API Gateway** pattern for unified entry point
- **JWT-based** authentication and authorization

## Service Communication

```
[Frontend :4200]
      │
      ▼
[API Gateway :8080]  ──── Eureka Discovery :8761
      │
      ├── com.engagement.iam-service :8081          (PostgreSQL)
      ├── facial-ai-service :8082    (SQLite)
      ├── mission-service :8083      (PostgreSQL)
      ├── team-service (planned)
      ├── gamification-service (planned)
      ├── dashboard-service (planned)
      ├── chat-service (planned)
      └── notification-service (planned)
```

## Epic Breakdown

| Epic | Domain | Backend | Frontend | Status |
|------|--------|---------|----------|--------|
| 1 | Authentication | com.engagement.iam-service, facial-ai-service | auth-ui | ✅ Active |
| 2 | Team Management | team-service | team-ui | 📋 Planned |
| 3 | Missions | mission-service | mission-ui | ✅ Active |
| 4 | Gamification | gamification-service | gamification-ui | 📋 Planned |
| 5 | Dashboard | dashboard-service | dashboard-ui | 🔄 Partial |
| 6 | Chat | chat-service | chat-ui | 📋 Planned |
| 7 | Notifications | notification-service | notification-ui | 📋 Planned |
