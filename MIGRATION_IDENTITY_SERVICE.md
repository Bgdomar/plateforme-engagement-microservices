# 🚀 Migration vers Identity Service (IAM + User Profile fusionnés)

## 📋 Résumé

Ce document explique comment migrer de l'architecture **microservices séparés** (IAM Service + User Profile Service) vers le nouveau **Identity Service** fusionné.

## ✅ Avantages de la fusion

- **1 seule base de données** au lieu de 2
- **1 seul service** à maintenir
- **Transactions cohérentes** entre authentification et profil
- **APIs compatibles** - aucun changement frontend requis
- **Performance améliorée** (pas de communication inter-service)

## 🗺️ Architecture avant/après

### Avant (Microservices séparés)
```
Frontend
    │
    ├──► IAM Service (port 8081)
    │       └── PostgreSQL IAM (port 5433)
    │
    └──► User Profile Service (port 8084)
            └── PostgreSQL User Profile (port 5435)
```

### Après (Service fusionné)
```
Frontend
    │
    └──► Identity Service (port 8081)
            └── PostgreSQL Identity (port 5437)
```

## 🔧 Étapes de migration

### Étape 1 : Arrêter les anciens services

```bash
# Arrêter les services existants
docker-compose stop iam-service user-profile-service
docker-compose stop postgres-iam postgres-user-profile
```

### Étape 2 : Démarrer le nouveau service

```bash
# Construire et démarrer le nouveau service
docker-compose up -d --build identity-service postgres-identity
```

### Étape 3 : Vérifier le fonctionnement

```bash
# Vérifier que le service est démarré
curl http://localhost:8081/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","motDePasse":"test"}'

# Vérifier la base de données
docker-compose exec postgres-identity psql -U identity_user -d identity_db -c "\\dt"
```

## 📊 Mapping des APIs

Les APIs restent **identiques**, aucun changement requis sur le frontend :

| Ancienne API | Nouvelle API | Changement |
|--------------|--------------|------------|
| `POST /auth/login` | `POST /auth/login` | ✅ Identique |
| `POST /auth/facial-login` | `POST /auth/facial-login` | ✅ Identique |
| `POST /inscriptions/demandes` | `POST /inscriptions/demandes` | ✅ Identique |
| `GET /api/admin/inscriptions` | `GET /api/admin/inscriptions` | ✅ Identique |
| `GET /api/profil/{userId}` | `GET /api/profil/{userId}` | ✅ Identique |
| `PUT /api/profil/{userId}` | `PUT /api/profil/{userId}` | ✅ Identique |

## 🔌 Ports

| Service | Ancien Port | Nouveau Port |
|---------|-------------|--------------|
| IAM Service | 8081 | **8081** (inchangé) |
| User Profile Service | 8084 | **8081** (fusionné) |
| PostgreSQL IAM | 5433 | **5437** (nouveau) |
| PostgreSQL User Profile | 5435 | **5437** (fusionné) |

## 🗄️ Schéma de base de données

### Tables créées automatiquement

```sql
-- Utilisateur (authentification)
utilisateur (
    id: UUID PRIMARY KEY,
    email: VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe: VARCHAR(255) NOT NULL,
    type_compte: ENUM('STAGIAIRE', 'ENCADRANT', 'ADMINISTRATEUR'),
    statut: ENUM('EN_ATTENTE', 'ACTIF', 'SUSPENDU', 'DESACTIVE'),
    date_creation: TIMESTAMP,
    derniere_connexion: TIMESTAMP
)

-- Demande d'inscription
demande_inscription (
    id: UUID PRIMARY KEY,
    utilisateur_id: UUID,
    type_compte: ENUM,
    nom: VARCHAR(100),
    prenom: VARCHAR(100),
    statut: ENUM('EN_ATTENTE', 'VALIDEE', 'REFUSEE'),
    date_demande: TIMESTAMP,
    date_traitement: TIMESTAMP,
    ...
)

-- Profil utilisateur
profil_utilisateur (
    id: UUID PRIMARY KEY,
    user_id: UUID UNIQUE NOT NULL,
    nom: VARCHAR(100),
    prenom: VARCHAR(100),
    email: VARCHAR(255),
    type_compte: VARCHAR(20),
    avatar: VARCHAR(500),
    bio: TEXT,
    date_creation: TIMESTAMP,
    date_mise_a_jour: TIMESTAMP
)

-- Profil stagiaire (spécifique)
profil_stagiaire (
    id: UUID PRIMARY KEY,
    user_id: UUID UNIQUE,
    profil_id: UUID,
    niveau_etudes: VARCHAR(100),
    filiere: VARCHAR(100),
    etablissement: VARCHAR(150)
)

-- Profil encadrant (spécifique)
profil_encadrant (
    id: UUID PRIMARY KEY,
    user_id: UUID UNIQUE,
    profil_id: UUID,
    departement: VARCHAR(150),
    specialite: VARCHAR(150)
)

-- Profil biométrique (Face ID)
profil_biometrique (
    id: UUID PRIMARY KEY,
    user_id: UUID UNIQUE,
    embedding: FLOAT[],
    photo_url: VARCHAR(500),
    date_enregistrement: TIMESTAMP
)
```

## 🔄 Processus d'inscription (nouveau)

```
1. Utilisateur soumet demande
   └── POST /inscriptions/demandes

2. Admin approuve la demande
   └── PATCH /api/admin/inscriptions/{id}/traiter
   
3. ✅ Profil automatiquement créé
   └── Pas besoin d'événement Kafka!
   
4. Utilisateur peut compléter son profil
   └── PUT /api/profil/{userId}
```

## ⚠️ Points d'attention

### 1. Données existantes
- Les anciennes bases de données (`postgres-iam`, `postgres-user-profile`) sont conservées
- Pour migrer les données existantes, utiliser un script SQL

### 2. Configuration frontend
- **Aucun changement requis** si l'API Gateway route correctement
- URLs restent identiques : `/auth/**`, `/inscriptions/**`, `/api/profil/**`

### 3. Environnement
- Variables d'environnement similaires aux anciens services
- JWT_SECRET identique pour compatibilité

## 🧪 Tests

### Test 1 : Inscription
```bash
curl -X POST http://localhost:8081/inscriptions/demandes-simple \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "motDePasse": "password123",
    "typeCompte": "STAGIAIRE",
    "nom": "Dupont",
    "prenom": "Jean",
    "niveauEtudes": "Master",
    "filiere": "Informatique",
    "etablissement": "Université Paris"
  }'
```

### Test 2 : Connexion
```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "motDePasse": "password123"
  }'
```

### Test 3 : Récupération de profil
```bash
curl http://localhost:8081/api/profil/{user-id} \
  -H "Authorization: Bearer {token}"
```

## 🛠️ Dépannage

### Problème : Port déjà utilisé
```bash
# Si le port 5437 est déjà utilisé
# Modifier dans docker-compose.yml :
# ports:
#   - "5438:5432"  # Au lieu de 5437
```

### Problème : Erreur de connexion à la DB
```bash
# Vérifier les logs
docker-compose logs postgres-identity

# Vérifier que la DB est créée
docker-compose exec postgres-identity psql -U identity_user -c "\\l"
```

## 📞 Support

En cas de problème :
1. Vérifier les logs : `docker-compose logs identity-service`
2. Vérifier la santé : `curl http://localhost:8081/actuator/health`
3. Consulter le README du service : `./identity-service/README.md`

## ✅ Checklist de validation

- [ ] Service démarré sans erreur
- [ ] Base de données accessible
- [ ] Endpoints `/auth/**` fonctionnels
- [ ] Endpoints `/inscriptions/**` fonctionnels
- [ ] Endpoints `/api/profil/**` fonctionnels
- [ ] Authentification JWT fonctionnelle
- [ ] Upload d'avatar fonctionnel
- [ ] Frontend peut se connecter

---

**🎉 Migration terminée !** Vous avez maintenant un service unifié plus simple à maintenir.
