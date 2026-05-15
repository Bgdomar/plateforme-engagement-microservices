FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app
COPY . .

RUN sed -i 's/\r$//' mvnw && \
    chmod +x mvnw && \
    ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache tzdata
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
RUN mkdir -p /app/uploads/chat
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]