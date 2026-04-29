FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app
COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache tzdata

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]
