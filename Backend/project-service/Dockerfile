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
COPY project-service/pom.xml project-service/
COPY project-service/src project-service/src/
RUN mvn package -pl project-service -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/project-service/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
