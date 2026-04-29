# Plateforme d'Engagement — StagiaireDXC

Plateforme de gestion de stagiaires basée sur une architecture microservices. Elle permet l'authentification (y compris par reconnaissance faciale), la gestion d'équipes et de missions, la messagerie en temps réel, les notifications, et la gamification.

## 📁 Structure du projet

```
plateforme-engagement/
│
├── epic-1-authentication/              # Authentification & identité
│   ├── backend/
│   │   └── iam-service/                # Spring Boot — JWT, RBAC, inscription, profils
│   └── PFE_FACIAL_AI/                  # FastAPI — reconnaissance faciale (DeepFace, pgvector)
│
├── epic-2-teams-missions/              # Équipes & missions
│   └── backend/
│       └── team-mission-service/       # Spring Boot — CRUD équipes, missions, livrables
│
├── epic-4-gamification/                # Points, badges, classements (prévu)
│   ├── backend/
│   └── frontend/
│
├── epic-6-chat/                        # Messagerie temps réel
│   └── backend/
│       └── chat-service/               # Spring Boot — WebSocket (STOMP), messages, upload fichiers/images
│
├── epic-7-notifications/               # Notifications in-app
│   └── backend/
│       └── notification-service/       # Spring Boot — CRUD notifications, polling
│
├── infrastructure/                     # Services d'infrastructure
│   ├── api-gateway/                    # Spring Cloud Gateway (:8080)
│   └── discovery-service/              # Eureka Server (:8761)
│
├── shared/                             # Ressources partagées
│   └── frontend/                       # Angular 19 — application frontend unifiée (:4200)
│       └── src/
│           ├── components/
│           │   ├── admin/              # Header admin (avec notifications), dashboard, inscriptions
│           │   ├── stagiaire/          # Header, profil, missions stagiaire
│           │   ├── encadrant/          # Header, profil, équipes encadrant
│           │   ├── chat/               # Messagerie (texte, images, fichiers)
│           │   ├── face-auth/          # Connexion par reconnaissance faciale
│           │   ├── login/              # Page de connexion
│           │   ├── register/           # Formulaire d'inscription
│           │   ├── home/               # Page d'accueil
│           │   └── ...
│           └── services/
│               ├── auth.service.ts
│               ├── chat.service.ts
│               ├── notification.service.ts
│               ├── mission.service.ts
│               ├── team.service.ts
│               └── ...
│
├── docs/                               # Documentation
├── docker-compose.yml                  # Orchestration complète
├── init-admin.sql                      # Script d'initialisation admin
└── .gitignore
```

## 🛠 Stack technique

| Couche         | Technologie                                             |
|----------------|----------------------------------------------------------|
| Frontend       | Angular 19, CSS custom, MediaPipe (WASM)                |
| Backend        | Spring Boot 3.x (Java 21), FastAPI (Python 3.11)        |
| API Gateway    | Spring Cloud Gateway (reactive)                          |
| Discovery      | Netflix Eureka                                           |
| Messaging      | Apache Kafka (KRaft), WebSocket (STOMP + SockJS)         |
| Bases de données| PostgreSQL 16 (× 4 instances), pgvector                 |
| AI/ML          | DeepFace (FaceNet), MediaPipe Face Detection             |
| Conteneurs     | Docker, Docker Compose                                   |

## 🚀 Démarrage rapide

```bash
# Démarrer tous les services
docker compose up -d --build

# Accès
# Frontend:        http://localhost:4200
# API Gateway:     http://localhost:8080
# Eureka Dashboard: http://localhost:8761
```

## 📌 Ports des services

| Service                     | Port  |
|-----------------------------|-------|
| Frontend (Angular)          | 4200  |
| API Gateway                 | 8080  |
| IAM Service (identity)      | 8081  |
| Team-Mission Service        | 8082  |
| Chat Service                | 8083  |
| Notification Service        | 8084  |
| Facial AI Service (FastAPI) | 8000  |
| Eureka Discovery            | 8761  |
| Kafka                       | 29092 |
| PostgreSQL (identity)       | 5436  |
| PostgreSQL (teams)          | 5437  |
| PostgreSQL (chat)           | 5438  |
| PostgreSQL (notifications)  | 5439  |

## ✨ Fonctionnalités principales

- **Authentification** — JWT, login classique, inscription avec validation admin
- **Reconnaissance faciale** — Enregistrement et identification via DeepFace + liveness detection
- **Rôles** — Admin, Encadrant, Stagiaire avec dashboards dédiés
- **Équipes & missions** — Création, affectation, suivi, livrables
- **Chat temps réel** — Messages texte, envoi d'images et fichiers, WebSocket + polling fallback
- **Notifications** — Notifications admin (nouvelles inscriptions), notifications utilisateur (validation/rejet), notifications chat

## 📐 Architecture

Voir [docs/architecture/README.md](docs/architecture/README.md) pour la documentation d'architecture complète.
