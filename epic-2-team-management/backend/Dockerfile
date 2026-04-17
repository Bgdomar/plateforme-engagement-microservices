# Étape 1: Build (utilisation de maven avec JDK)
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copier les fichiers Maven
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Rendre mvnw exécutable
RUN chmod +x mvnw

# Télécharger les dépendances
RUN ./mvnw dependency:go-offline -B

# Copier le code source et compiler
COPY src src
RUN ./mvnw package -DskipTests

# Étape 2: Runtime (seulement JRE)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copier le JAR depuis l'étape de build
COPY --from=build /app/target/team-management-service-*.jar app.jar

# Exposer le port
EXPOSE 8085

# Démarrer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]