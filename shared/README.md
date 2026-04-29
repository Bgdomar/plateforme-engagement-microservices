# Shared

Ressources partagées utilisées par tous les epics.

## frontend/ — Angular 19 (:4200)

Application frontend unifiée servant toutes les pages de la plateforme.

### Composants principaux

| Dossier                 | Description                                    |
|-------------------------|------------------------------------------------|
| `components/admin/`     | Header admin (notifications), dashboard, gestion inscriptions |
| `components/stagiaire/` | Header stagiaire (notifications), profil, missions |
| `components/encadrant/` | Header encadrant, profil, équipes              |
| `components/chat/`      | Messagerie temps réel (texte, images, fichiers)|
| `components/face-auth/` | Authentification par reconnaissance faciale     |
| `components/login/`     | Page de connexion                               |
| `components/register/`  | Formulaire d'inscription                        |
| `components/home/`      | Page d'accueil                                  |

### Services

| Fichier                     | Rôle                                          |
|-----------------------------|-----------------------------------------------|
| `auth.service.ts`           | Authentification JWT, login/logout             |
| `chat.service.ts`           | Messages REST + WebSocket, upload fichiers     |
| `notification.service.ts`   | Notifications avec polling                     |
| `mission.service.ts`        | CRUD missions                                  |
| `team.service.ts`           | CRUD équipes                                   |
| `facial-ai.service.ts`      | Enregistrement/identification faciale          |
| `inscription.service.ts`    | Soumission de demandes d'inscription           |
