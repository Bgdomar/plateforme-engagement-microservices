# Plateforme d'Engagement

A microservices-based engagement platform built with Spring Boot, Angular, and Python (FastAPI).

##  Project Structure

```
plateforme-engagement/
│
├── epic-1-authentication/          # User authentication & identity
│   ├── backend/
│   │   ├── iam-service/            # Spring Boot — JWT, RBAC, profile management
│   │   └── facial-ai-service/      # FastAPI — face recognition (register/identify)
│   └── frontend/
│       └── auth-ui/                # (stub) Login, Register, FaceID pages
│
├── epic-2-team-management/         # Team lifecycle
│   ├── backend/
│   │   └── team-service/           # (planned)
│   └── frontend/
│       └── team-ui/                # (planned)
│
├── epic-3-missions/                # Mission management
│   ├── backend/
│   │   └── mission-service/        # Spring Boot — CRUD, assignment, tracking
│   └── frontend/
│       └── mission-ui/             # (stub)
│
├── epic-4-gamification/            # Points, badges, leaderboards
│   ├── backend/
│   │   └── gamification-service/   # (planned)
│   └── frontend/
│       └── gamification-ui/        # (planned)
│
├── epic-5-dashboard/               # KPIs, analytics, activity feed
│   ├── backend/
│   │   └── dashboard-service/      # (planned)
│   └── frontend/
│       └── dashboard-ui/           # (stub)
│
├── epic-6-chat/                    # Real-time messaging
│   ├── backend/
│   │   └── chat-service/           # (planned)
│   └── frontend/
│       └── chat-ui/                # (planned)
│
├── epic-7-notifications/           # Push & in-app notifications
│   ├── backend/
│   │   └── notification-service/   # (planned)
│   └── frontend/
│       └── notification-ui/        # (planned)
│
├── infrastructure/                 # Cross-cutting infra services
│   ├── api-gateway/                # Spring Cloud Gateway (:8080)
│   ├── discovery-service/          # Eureka Server (:8761)
│   ├── config-server/              # (planned) Spring Cloud Config
│   ├── docker/                     # Docker Compose files
│   └── monitoring/                 # (planned) Prometheus, Grafana
│
├── shared/                         # Shared resources
│   ├── frontend/                   # Angular 19 monolithic frontend (:4200)
│   ├── common-models/              # (planned) Shared DTOs & enums
│   ├── security/                   # (planned) Shared JWT/auth utilities
│   └── utils/                      # (planned) Shared helpers
│
├── docs/                           # Documentation
│   ├── architecture/               # Architecture decisions & overview
│   └── diagrams/                   # System & sequence diagrams
│
├── docker-compose.yml              # Full-stack orchestration
└── .gitignore
```

## 🛠 Tech Stack

| Layer          | Technology                                      |
|----------------|--------------------------------------------------|
| Frontend       | Angular 19, TailwindCSS, MediaPipe (WASM)       |
| Backend        | Spring Boot 3.x (Java 17+), FastAPI (Python)    |
| API Gateway    | Spring Cloud Gateway                             |
| Discovery      | Netflix Eureka                                   |
| Messaging      | Apache Kafka (KRaft mode)                        |
| Databases      | PostgreSQL 16, SQLite                            |
| Object Storage | MinIO (S3-compatible)                            |
| AI/ML          | face_recognition (dlib), MediaPipe Face Detection|
| Containers     | Docker, Docker Compose                           |

## Quick Start

```bash
# Create the Docker network (first time only)
docker network create plateforme-engagement-network

# Start all services
docker compose up -d --build

# Access
# Frontend:   http://localhost:4200
# API Gateway: http://localhost:8080
# Eureka:     http://localhost:8761
# MinIO:      http://localhost:9001
```

##  Service Ports

| Service                 | Port |
|------------------------|------|
| Frontend               | 4200 |
| API Gateway            | 8080 |
| IAM Service            | 8081 |
| Facial AI Service      | 8082 |
| Mission Service        | 8083 |
| Eureka Discovery       | 8761 |
| PostgreSQL (IAM)       | 5432 |
| PostgreSQL (Missions)  | 5433 |
| Kafka                  | 29092|
| MinIO API              | 9000 |
| MinIO Console          | 9001 |

##  Architecture

See [docs/architecture/README.md](docs/architecture/README.md) for full architecture documentation.
