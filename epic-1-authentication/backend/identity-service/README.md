# Identity Service

Service fusionné combinant **IAM Service** et **User Profile Service** en un seul service unifié.

## 📋 Description

Ce service gère :
- **Authentification** (login classique et facial)
- **Inscription** (demandes avec validation admin)
- **Profils utilisateurs** (stagiaires et encadrants)
- **Gestion des avatars**

## 🏗️ Architecture

### Entités conformes au schéma UML

```
┌─────────────────────┐
│    Utilisateur      │
├─────────────────────┤
│ - id: UUID          │
│ - email: String     │
│ - motDePasse        │
│ - typeCompte: Enum  │
│ - statut: Enum      │
│ - dateCreation      │
│ - derniereConnexion │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐   ┌────▼────────┐
│Demande│   │ProfilUtilisateur│
└───────┘   └────┬────────┘
                 │
        ┌────────┴────────┐
        │                 │
   ┌────▼────┐      ┌────▼────┐
   │Stagiaire│      │Encadrant│
   └─────────┘      └─────────┘
```

## 🔗 API Endpoints

### Authentification (`/auth`)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/auth/login` | POST | Connexion avec email/mot de passe |
| `/auth/facial-login` | POST | Connexion faciale (UUID ou email) |
| `/auth/reset-password` | POST | Réinitialisation mot de passe |

### Inscription (`/inscriptions`)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/inscriptions/demandes` | POST | Soumettre demande (multipart avec photo) |
| `/inscriptions/demandes-simple` | POST | Soumettre demande (JSON) |

### Administration (`/api/admin/inscriptions`)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/admin/inscriptions` | GET | Lister toutes les demandes |
| `/api/admin/inscriptions/{id}/traiter` | PATCH | Approuver/Rejeter une demande |

### Profil (`/api/profil`)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/profil/{userId}` | GET | Récupérer le profil |
| `/api/profil/{userId}` | PUT | Mettre à jour le profil |
| `/api/profil/{userId}/avatar` | POST | Upload avatar |
| `/api/profil/{userId}/avatar` | DELETE | Supprimer avatar |

## 🚀 Démarrage

### Configuration Docker

Ajouter au `docker-compose.yml` :

```yaml
identity-service:
  build:
    context: ./epic-1-authentication/backend/identity-service
  ports:
    - "8081:8081"
  environment:
    SPRING_DATASOURCE_URL: jdbc:postgresql://identity-db:5432/identity_db
    SPRING_DATASOURCE_USERNAME: postgres
    SPRING_DATASOURCE_PASSWORD: postgres
  depends_on:
    - identity-db

identity-db:
  image: postgres:16
  environment:
    POSTGRES_DB: identity_db
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
  ports:
    - "5436:5432"
```

### Compilation

```bash
cd epic-1-authentication/backend/identity-service
mvn clean package -DskipTests
```

### Exécution

```bash
mvn spring-boot:run
```

## 📝 Port

- **Service** : 8081
- **Base de données** : 5436 (PostgreSQL)

## 🔒 Sécurité

- JWT pour l'authentification
- BCrypt pour le hashage des mots de passe
- CORS configuré pour localhost:4200
- Rôles : STAGIAIRE, ENCADRANT, ADMINISTRATEUR

## 📦 Migration depuis les anciens services

Les APIs restent **100% compatibles** avec les anciens services :
- Mêmes endpoints
- Mêmes DTOs
- Mêmes codes de réponse

Aucune modification requise sur le frontend !
