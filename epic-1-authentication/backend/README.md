# Epic 1 — Authentication Backend

## Services

### com.engagement.iam-service (Spring Boot)
Identity & Access Management service handling:
- User registration and login (email/password)
- JWT token generation and validation
- Role-based access control (ADMIN, ORGANIZATION, STUDENT)
- Profile management with MinIO avatar storage
- Biometric login endpoint for FaceID

**Port:** 8081  
**Database:** PostgreSQL (`iam_db`)

### facial-ai-service (FastAPI / Python)
AI-powered facial recognition service:
- Face registration (encoding + storage)
- Face identification (1:N matching)
- Eureka service discovery integration

**Port:** 8082  
**Database:** SQLite (embedded)

### auth-service
> Planned — authentication orchestration layer (optional).
