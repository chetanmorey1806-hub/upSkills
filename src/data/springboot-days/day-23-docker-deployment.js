export default {
  id: 'day-23-docker-deployment',
  title: 'Docker and Deployment of a Spring Boot Application',
  module: 'Module 5: Advanced',
  day: 23,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Package a Spring Boot 3 application as an executable JAR, containerize it with a multi-stage Dockerfile (or Buildpacks), run it together with MySQL using Docker Compose, and deploy it to a Linux server / cloud with environment-based configuration and health checks.',
  objectives: [
    'Build an executable fat JAR with Maven and run it with java -jar',
    'Explain images, containers, layers, registries and volumes',
    'Write a multi-stage Dockerfile and build/run the image',
    'Run app + MySQL with docker-compose and externalize secrets via environment variables',
    'Deploy to a server/cloud with profiles, Actuator health checks and basic CI ideas',
  ],
  theory: [
    {
      heading: '1. From Code to a Runnable JAR',
      content: 'spring-boot-maven-plugin builds a "fat" (uber) JAR containing your classes, all dependency JARs and an embedded Tomcat. Anyone with Java 17+ can run it: java -jar app.jar. No external server installation is needed — this is why Spring Boot apps are easy to deploy.',
      syntax: `mvn clean package -DskipTests     # creates target/product-api-0.0.1-SNAPSHOT.jar
java -jar target/product-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --server.port=9090`,
      points: [
        'IntelliJ: Maven tool window > Lifecycle > double-click clean then package',
        'Eclipse/STS: right-click project > Run As > Maven build... > Goals: clean package > Run',
        'Command-line args and environment variables override application.properties (SPRING_DATASOURCE_URL overrides spring.datasource.url)',
      ],
    },
    {
      heading: '2. Docker Concepts in Simple Words',
      content: '"It works on my machine" problem: different Java versions, OS, configs. Docker packages the app WITH its runtime into an IMAGE. A CONTAINER is a running instance of an image. Analogy: an image is a recipe + all ingredients sealed in a lunch box; a container is that lunch box opened and being eaten — you can open many identical boxes.',
      points: [
        'Image – read-only template built from a Dockerfile, made of cached layers',
        'Container – running, isolated process from an image (docker run)',
        'Registry – image store (Docker Hub, GitHub Container Registry, AWS ECR)',
        'Volume – persistent storage that survives container removal (database data)',
        'Port mapping -p 8080:8080 → hostPort:containerPort',
        'Network – containers on the same Compose network reach each other by service name (mysql:3306)',
      ],
    },
    {
      heading: '3. Dockerfile: Multi-stage Build',
      content: 'A multi-stage Dockerfile builds the JAR in a big image that has Maven + JDK, then copies only the JAR into a small JRE image. The final image is smaller and contains no source code or build tools. Run as a non-root user for security.',
      syntax: `FROM maven:3.9-eclipse-temurin-17 AS build     # stage 1: build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline                # cache dependencies layer
COPY src ./src
RUN mvn -q clean package -DskipTests

FROM eclipse-temurin:17-jre                     # stage 2: run
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`,
      tip: 'Add a .dockerignore (target/, .git/, .idea/) so the build context is small and fast. Alternative without a Dockerfile: mvn spring-boot:build-image (Cloud Native Buildpacks).',
    },
    {
      heading: '4. Docker Compose for Multi-container Apps',
      content: 'A real app needs a database too. docker-compose.yml describes all services, their environment variables, ports, volumes and start order. One command (docker compose up) starts everything. Inside the Compose network the app connects to jdbc:mysql://mysql:3306/... where "mysql" is the service name, not localhost.',
      points: [
        'depends_on with condition: service_healthy waits until MySQL is ready',
        'Keep secrets in a .env file (not committed) or a secrets manager, never in the image',
        'docker compose up -d --build, docker compose logs -f app, docker compose down (-v also deletes volumes)',
      ],
    },
    {
      heading: '5. Deployment Options and Production Checklist',
      content: 'You can deploy the JAR or the container to: a Linux VM (AWS EC2, DigitalOcean) with systemd or Docker; a PaaS (Render, Railway, Heroku, AWS Elastic Beanstalk, Azure App Service); or container platforms (AWS ECS, Google Cloud Run, Kubernetes). Production checklist below.',
      points: [
        'Use a prod profile: ddl-auto=validate, Flyway migrations, show-sql=false',
        'Secrets (DB password, JWT secret) only from environment variables / secret store',
        'Actuator /actuator/health for load-balancer and container health checks (management.endpoint.health.probes.enabled=true for Kubernetes)',
        'Logs to stdout (containers) and centralized logging',
        'HTTPS via a reverse proxy (Nginx) or the cloud load balancer',
        'CI/CD: GitHub Actions builds, tests, builds the image, pushes to a registry and deploys',
      ],
    },
  ],
  examples: [
    {
      title: 'Example 1: Build and Run the Executable JAR with a prod Profile',
      scenario: 'Prepare the product API for production with external configuration and check its health.',
      steps: [
        'Add spring-boot-starter-actuator to pom.xml',
        'Create application-prod.properties that reads everything from environment variables',
        'Build: IntelliJ Maven tool window > Lifecycle > clean, package (or terminal: ./mvnw clean package)',
        'STS: right-click project > Run As > Maven build... > Goals "clean package" > Run',
        'Run the JAR from the terminal with the prod profile and environment variables',
        'Open http://localhost:8080/actuator/health',
      ],
      code: `<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<!-- already present from Initializr: -->
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>

# ===== src/main/resources/application-prod.properties =====
spring.datasource.url=\${DB_URL}
spring.datasource.username=\${DB_USER}
spring.datasource.password=\${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
app.jwt.secret=\${JWT_SECRET}
server.port=\${PORT:8080}
management.endpoints.web.exposure.include=health,info
management.endpoint.health.probes.enabled=true

# ===== Terminal (Linux/macOS) =====
./mvnw clean package -DskipTests
export DB_URL=jdbc:mysql://localhost:3306/shopdb
export DB_USER=shop
export DB_PASSWORD=Secret#123
export JWT_SECRET=$(openssl rand -base64 32)
java -jar target/product-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# ===== Windows PowerShell =====
$env:DB_URL="jdbc:mysql://localhost:3306/shopdb"
$env:DB_USER="shop"
$env:DB_PASSWORD="Secret#123"
java -jar target\\product-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod`,
      result: `[INFO] Building jar: .../target/product-api-0.0.1-SNAPSHOT.jar
[INFO] BUILD SUCCESS

  .   ____          _            __ _ _
 :: Spring Boot ::                (v3.4.x)
The following 1 profile is active: "prod"
Tomcat started on port 8080 (http) with context path '/'
Started ProductApiApplication in 5.1 seconds

GET http://localhost:8080/actuator/health
{"status":"UP","groups":["liveness","readiness"]}`,
      explanation: 'The same JAR runs in every environment; only environment variables change. \${DB_URL} placeholders are resolved from the OS environment at startup. \${PORT:8080} uses 8080 when PORT is not set — many cloud platforms set PORT automatically. Note: in a shell, $(openssl ...) is command substitution.',
    },
    {
      title: 'Example 2: Dockerize the App with a Multi-stage Dockerfile',
      scenario: 'Create a small, secure Docker image of the API and run it as a container.',
      steps: [
        'Install Docker Desktop (Windows/macOS) or Docker Engine (Linux); check with docker --version',
        'Create Dockerfile and .dockerignore in the project root (IntelliJ: right-click project > New > File > Dockerfile; the Docker plugin adds a ▶ run icon in the gutter)',
        'Eclipse/STS: create the files via File > New > File; run Docker commands in the Terminal view (Window > Show View > Terminal)',
        'Build the image: docker build -t product-api:1.0 .',
        'Run: docker run -d --name product-api -p 8080:8080 -e SPRING_PROFILES_ACTIVE=dev product-api:1.0',
        'Check logs and health; stop and remove the container when done',
      ],
      code: `# ===== .dockerignore =====
target/
.git/
.idea/
.vscode/
*.iml
.mvn/wrapper/maven-wrapper.jar

# ===== Dockerfile =====
# ---------- Stage 1: build ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B clean package -DskipTests

# ---------- Stage 2: run ----------
FROM eclipse-temurin:17-jre
WORKDIR /app
RUN useradd --system --uid 1001 spring
COPY --from=build /workspace/target/*.jar app.jar
USER spring
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \\
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]

# ===== Commands =====
docker build -t product-api:1.0 .
docker images product-api
docker run -d --name product-api -p 8080:8080 -e SPRING_PROFILES_ACTIVE=dev product-api:1.0
docker ps
docker logs -f product-api
curl http://localhost:8080/actuator/health
docker stop product-api && docker rm product-api

# Alternative without Dockerfile (Cloud Native Buildpacks):
./mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=product-api:1.0`,
      result: `docker build ...
 => [build 4/6] RUN mvn -q -B dependency:go-offline     (cached on next builds)
 => exporting to image  => naming to docker.io/library/product-api:1.0

docker images product-api
REPOSITORY    TAG   IMAGE ID       SIZE
product-api   1.0   4f2c9d1e7a10   ~300MB  (JRE + app; exact ID/size differ)

docker ps
CONTAINER ID  IMAGE            STATUS                    PORTS
a1b2c3d4e5f6  product-api:1.0  Up 1 minute (healthy)     0.0.0.0:8080->8080/tcp

curl http://localhost:8080/actuator/health -> {"status":"UP",...}`,
      explanation: 'Copying pom.xml first and running dependency:go-offline creates a cached layer: when only Java code changes, Docker reuses the dependency layer and rebuilds in seconds. The final image has only the JRE and the JAR, runs as non-root user "spring", and HEALTHCHECK marks the container healthy when Actuator reports UP. (If wget is missing in your base image, use curl or remove HEALTHCHECK and rely on the platform health check.)',
    },
    {
      title: 'Example 3: Docker Compose — Spring Boot + MySQL, and Deploying to a Server',
      scenario: 'Run the full backend (API + MySQL with persistent data) with one command locally, and then on a cloud Linux VM.',
      steps: [
        'Create .env (do NOT commit it — add to .gitignore) and docker-compose.yml in the project root',
        'Run docker compose up -d --build',
        'Watch logs: docker compose logs -f app — Flyway migrations run on first start',
        'Test the API on http://localhost:8080',
        'Deploy: copy the project (or pull the image from a registry) to an Ubuntu VM with Docker installed and run the same compose command',
        'Optional CI: GitHub Actions workflow builds and pushes the image on every push to main',
      ],
      code: `# ===== .env =====
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_DATABASE=shopdb
MYSQL_USER=shop
MYSQL_PASSWORD=Secret123
JWT_SECRET=ZGV2LW9ubHktc2VjcmV0LWtleS1mb3Itand0LWRlbW8tMTIzNDU2Nzg5MA==

# ===== docker-compose.yml =====
services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: \${MYSQL_DATABASE}
      MYSQL_USER: \${MYSQL_USER}
      MYSQL_PASSWORD: \${MYSQL_PASSWORD}
    ports:
      - "3307:3306"            # host 3307 to avoid clash with a local MySQL
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      retries: 10

  app:
    build: .
    image: product-api:1.0
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_URL: jdbc:mysql://mysql:3306/\${MYSQL_DATABASE}
      DB_USER: \${MYSQL_USER}
      DB_PASSWORD: \${MYSQL_PASSWORD}
      JWT_SECRET: \${JWT_SECRET}
    ports:
      - "8080:8080"
    restart: unless-stopped

volumes:
  mysql-data:

# ===== Commands =====
docker compose up -d --build
docker compose ps
docker compose logs -f app
docker compose down          # stop (data kept in volume)
docker compose down -v       # stop AND delete data

# ===== On an Ubuntu cloud VM (e.g. AWS EC2) =====
sudo apt update && sudo apt install -y docker.io docker-compose-v2
git clone https://github.com/<you>/product-api.git && cd product-api
nano .env                    # create secrets on the server
sudo docker compose up -d --build
# open port 8080 (or 80 behind Nginx) in the cloud security group

# ===== .github/workflows/docker.yml (CI: build & push image) =====
name: build-and-push
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '17', cache: maven }
      - run: ./mvnw -B test
      - uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKERHUB_USER }}
          password: \${{ secrets.DOCKERHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: \${{ secrets.DOCKERHUB_USER }}/product-api:latest`,
      result: `docker compose up -d --build
[+] Running 3/3
 ✔ Volume "product-api_mysql-data"  Created
 ✔ Container product-api-mysql-1    Healthy
 ✔ Container product-api-app-1      Started

docker compose logs -f app
app-1 | The following 1 profile is active: "prod"
app-1 | Successfully applied 3 migrations to schema \`shopdb\`, now at version v3
app-1 | Tomcat started on port 8080 (http)

docker compose ps
NAME                  STATUS                  PORTS
product-api-mysql-1   Up 40s (healthy)        0.0.0.0:3307->3306/tcp
product-api-app-1     Up 20s                  0.0.0.0:8080->8080/tcp`,
      explanation: 'Compose creates a private network where the app reaches the database at host "mysql" (the service name). depends_on + healthcheck makes the app wait until MySQL accepts connections. The named volume keeps data across restarts. The exact same files run on a laptop and on a cloud VM; the CI workflow automates test → build → push on every commit.',
    },
  ],
  interview: [
    { q: 'What is the difference between a Docker image and a container?', a: 'An image is a read-only, layered template (app + runtime + config). A container is a running (or stopped) instance of an image with its own writable layer, process and network.', level: 'Easy' },
    { q: 'What is a multi-stage build and why use it?', a: 'A Dockerfile with several FROM stages; the build stage compiles with JDK + Maven and the final stage copies only the artifact into a slim JRE image. Benefits: smaller, more secure images without build tools or sources.', level: 'Medium' },
    { q: 'How do you pass configuration to a Spring Boot container?', a: 'Environment variables (relaxed binding: SPRING_DATASOURCE_URL → spring.datasource.url), command-line args, mounted config files, or a config server / secrets manager. Never bake secrets into the image.', level: 'Medium' },
    { q: 'Why does the app use "mysql" instead of "localhost" as DB host in Compose?', a: 'Each container has its own localhost. Compose puts services on a shared network with DNS names equal to service names, so the app reaches MySQL at mysql:3306.', level: 'Medium' },
    { q: 'What is the purpose of Docker volumes?', a: 'To persist data outside the container lifecycle (e.g. database files), so data survives container removal and upgrades.', level: 'Easy' },
    { q: 'CMD vs ENTRYPOINT?', a: 'ENTRYPOINT defines the executable that always runs; CMD supplies default arguments (or a default command) that can be overridden at docker run. Commonly ENTRYPOINT ["java","-jar","app.jar"].', level: 'Medium' },
    { q: 'What is a fat JAR?', a: 'An executable JAR built by spring-boot-maven-plugin that contains the application classes, all dependencies and an embedded server, launchable with java -jar.', level: 'Easy' },
    { q: 'How do health checks help in deployment?', a: 'Orchestrators/load balancers call /actuator/health (liveness/readiness) to know if an instance should receive traffic or be restarted, enabling zero-downtime deployments and self-healing.', level: 'Medium' },
    { q: 'What does mvn spring-boot:build-image do?', a: 'Builds an OCI image using Cloud Native Buildpacks without a Dockerfile, with layered JARs and sensible JVM memory settings.', level: 'Hard' },
    { q: 'Name some ways to deploy a Spring Boot app to the cloud.', a: 'Run the JAR on a VM with systemd; Docker/Compose on a VM; PaaS (Elastic Beanstalk, Azure App Service, Render, Railway); containers on ECS/Cloud Run; Kubernetes (EKS/GKE/AKS) with Deployments and Services.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write a Dockerfile for an already-built JAR (no multi-stage), exposing port 9090.',
      hint: 'FROM eclipse-temurin:17-jre, COPY target/*.jar app.jar.',
      solution: `FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/*.jar app.jar
ENV SERVER_PORT=9090
EXPOSE 9090
ENTRYPOINT ["java", "-jar", "app.jar"]`,
    },
    {
      task: 'Create a systemd service so the JAR starts automatically on an Ubuntu server.',
      hint: '/etc/systemd/system/product-api.service with ExecStart and Environment lines.',
      solution: `[Unit]
Description=Product API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/product-api
Environment=SPRING_PROFILES_ACTIVE=prod
EnvironmentFile=/opt/product-api/app.env
ExecStart=/usr/bin/java -jar /opt/product-api/app.jar
Restart=always

[Install]
WantedBy=multi-user.target

# then:
# sudo systemctl daemon-reload
# sudo systemctl enable --now product-api
# journalctl -u product-api -f`,
    },
    {
      task: 'Add phpMyAdmin (or Adminer) to the docker-compose file to browse the database on port 8081.',
      hint: 'image: adminer, depends_on mysql.',
      solution: `  adminer:
    image: adminer
    ports:
      - "8081:8080"
    depends_on:
      - mysql
# open http://localhost:8081, server = mysql, user = shop`,
    },
    {
      task: 'Tag and push your image to Docker Hub.',
      hint: 'docker login, docker tag, docker push.',
      solution: `docker login
docker tag product-api:1.0 yourname/product-api:1.0
docker push yourname/product-api:1.0
# on any server:
docker run -d -p 8080:8080 --env-file app.env yourname/product-api:1.0`,
    },
  ],
  quiz: [
    { question: 'Command that builds an image from the Dockerfile in the current folder:', options: ['docker run -t app .', 'docker build -t app .', 'docker compose image app', 'docker create app'], answer: 1, explanation: 'docker build -t name:tag <context>.' },
    { question: '-p 8080:9090 means:', options: ['Host 8080 → container 9090', 'Host 9090 → container 8080', 'Both ports on host', 'Container to container'], answer: 0, explanation: 'hostPort:containerPort.' },
    { question: 'Environment variable that sets spring.datasource.password:', options: ['spring.datasource.password', 'DATASOURCE-PASSWORD', 'DB.PASSWORD', 'SPRING_DATASOURCE_PASSWORD'], answer: 3, explanation: 'Relaxed binding: dots → underscores, uppercase.' },
    { question: 'Data that must survive container removal should be stored in:', options: ['The image', 'A volume', 'The container layer', '/tmp'], answer: 1, explanation: 'Volumes persist independently.' },
    { question: 'Main benefit of a multi-stage Dockerfile:', options: ['Faster Java code', 'Automatic HTTPS', 'Smaller final image without build tools', 'No need for Java'], answer: 2, explanation: 'Only the runtime and JAR are shipped.' },
  ],
};
