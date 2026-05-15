FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app
COPY . .

# Rendre mvnw exécutable et construire le projet
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine

# Installer tzdata pour les fuseaux horaires
RUN apk add --no-cache tzdata

WORKDIR /app

# Créer le dossier pour les uploads de livrables
RUN mkdir -p /app/uploads/livrables

# Copier le JAR depuis le builder
COPY --from=builder /app/target/*.jar app.jar

# Exposer le port 8082
EXPOSE 8082

# Lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]