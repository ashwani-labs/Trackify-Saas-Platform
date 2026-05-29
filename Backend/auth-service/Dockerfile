# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy root pom and common-lib first
COPY pom.xml .
COPY common-lib/pom.xml common-lib/
COPY common-lib/src common-lib/src/

# Install common-lib to local maven repo
RUN mvn install -pl common-lib

# Copy service pom and build
COPY auth-service/pom.xml auth-service/
COPY auth-service/src auth-service/src/
RUN mvn package -pl auth-service -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-jammy
RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/auth-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
