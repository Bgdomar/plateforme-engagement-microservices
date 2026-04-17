# Étape 1 : Build avec Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

WORKDIR /app
COPY pom.xml .
COPY src ./src

# Compiler et packager l'application (sans tests)
RUN mvn clean package -DskipTests

# Étape 2 : Image finale légère
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Créer le répertoire pour les uploads
RUN mkdir -p /app/assets/images

# Copier le JAR généré
COPY --from=build /app/target/*.jar app.jar

# Exposer le port
EXPOSE 8081

# Lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]
