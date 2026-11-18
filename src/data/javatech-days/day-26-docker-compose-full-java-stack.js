export default {
  id: 'day-26-docker-compose-full-java-stack',
  title: 'Docker Compose for a Full Java Stack: Spring Boot + MySQL + Redis + React/nginx',
  module: 'Module 7: DevOps, Cloud & Professional Tools',
  day: 26,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Run a complete production-like system on your laptop with one command: a React build served by nginx (which also proxies /api), a Spring Boot API, MySQL with a persistent volume and Redis cache. Learn Compose networks, volumes, healthchecks with depends_on conditions, .env files, profiles and override files.',
  objectives: [
    'Structure a multi-container project and write a complete compose.yaml',
    'Use user-defined networks and service names as hostnames; understand ports vs expose',
    'Persist data with named volumes and initialize MySQL with scripts',
    'Use healthchecks and depends_on: condition: service_healthy to start services in the right order',
    'Manage configuration with .env files, env_file, profiles and compose.override.yaml, and debug with docker compose commands',
  ],
  theory: [
    {
      heading: '1. Why Docker Compose?',
      content: 'A real Java project is not one container. Our ShopKart system needs MySQL, Redis, the Spring Boot API and the React frontend. Starting four containers with long docker run commands, in the right order, with the right network and environment variables is error-prone. Docker Compose describes the WHOLE system in one YAML file (compose.yaml or docker-compose.yml) and manages it with one command: docker compose up. Analogy: docker run is cooking one dish; Compose is the full wedding menu card telling the caterer what to cook, in which order, and on which counter to serve.',
      points: [
        'Compose V2 command is "docker compose" (with a space); old "docker-compose" (hyphen) is V1 and retired',
        'The top-level "version:" key is obsolete; Compose ignores it with a warning — just omit it',
        'Project name = folder name by default; containers are named <project>-<service>-1',
        'Compose is great for local dev, CI testing and small single-server deployments; for many servers use Kubernetes (Day 27)',
      ],
    },
    {
      heading: '2. Networks: How Containers Find Each Other',
      content: 'Compose automatically creates a network named <project>_default and attaches every service to it. Inside that network each service name is a DNS hostname. So the Spring Boot container connects to jdbc:mysql://mysql:3306/shopdb — NOT localhost, because localhost inside a container means that container itself. You can define your own networks to isolate tiers: the frontend network (nginx + api) and the backend network (api + mysql + redis); nginx then cannot reach MySQL directly.',
      points: [
        'ports: "8080:8080" publishes HOST:CONTAINER — reachable from your browser',
        'Without ports, a service is reachable only by other containers on the same network (safer for databases)',
        'expose: only documents the port; it does not publish to the host',
        'Container-to-container traffic always uses the CONTAINER port (3306), never the host-mapped port',
      ],
      syntax: `Browser --8080--> [nginx :80] --frontend net--> [api :8080] --backend net--> [mysql :3306]
                                                                       \\--> [redis :6379]`,
    },
    {
      heading: '3. Volumes: Keeping Data Safe',
      content: 'Containers are disposable; when you remove a MySQL container, its data inside is gone. A NAMED VOLUME (mysql-data:/var/lib/mysql) is storage managed by Docker that survives container removal. A BIND MOUNT (./db/init:/docker-entrypoint-initdb.d) maps a folder from your laptop into the container — useful for config files and init scripts. The official MySQL image runs *.sql files in /docker-entrypoint-initdb.d ONLY on the first start when the data directory is empty.',
      points: [
        'docker compose down keeps named volumes; docker compose down -v DELETES them (all DB data!)',
        'Use :ro (read-only) for mounted config files',
        'Back up a volume: docker run --rm -v shop_mysql-data:/data -v $PWD:/backup alpine tar czf /backup/db.tgz -C /data .',
        'On Windows, keep bind-mounted project folders inside WSL2 for better performance',
      ],
    },
    {
      heading: '4. Healthchecks and Startup Order',
      content: 'depends_on: [mysql] only waits until the MySQL container has STARTED, not until MySQL is READY to accept connections (which takes 10-30 seconds on first boot). Spring Boot then fails with "Communications link failure". The fix: give mysql a healthcheck and use the long form depends_on with condition: service_healthy. Compose shows status starting -> healthy -> (or unhealthy).',
      syntax: `mysql:
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-p$$MYSQL_ROOT_PASSWORD"]
    interval: 10s
    timeout: 5s
    retries: 10
    start_period: 30s

api:
  depends_on:
    mysql:
      condition: service_healthy
    redis:
      condition: service_started`,
      tip: '$$ in compose.yaml means a literal $ passed to the container shell (so the container reads its own env variable). A single $ is replaced by Compose from your .env file.',
    },
    {
      heading: '5. Configuration: .env, env_file, Profiles and Overrides',
      content: 'Never hard-code passwords in compose.yaml committed to Git. Compose automatically reads a file named .env in the project folder and substitutes ${VAR} in the YAML. env_file: passes all variables from a file into the container environment. Spring Boot maps environment variables to properties by relaxed binding: SPRING_DATASOURCE_URL -> spring.datasource.url, SPRING_DATA_REDIS_HOST -> spring.data.redis.host.',
      points: [
        '${DB_PASSWORD:?error message} makes Compose fail fast if the variable is missing; ${PORT:-8080} gives a default',
        'compose.override.yaml is merged automatically — keep dev-only things there (exposed DB port, debug port)',
        'docker compose -f compose.yaml -f compose.prod.yaml up -d merges a prod file instead',
        'profiles: ["tools"] marks optional services (adminer, redis-insight) started only with --profile tools',
        'docker compose config prints the final merged YAML with variables substituted — your best debugging tool',
      ],
    },
    {
      heading: '6. Everyday Compose Commands',
      content: 'These commands are used daily in IT companies. Run them in the folder containing compose.yaml.',
      points: [
        'docker compose up -d --build : build images and start in background',
        'docker compose ps : list services with status and health',
        'docker compose logs -f api : follow logs of one service',
        'docker compose exec mysql mysql -uroot -p : open a shell/tool inside a running container',
        'docker compose restart api / stop / start',
        'docker compose up -d --no-deps --build api : rebuild and restart only the API',
        'docker compose down (stop + remove containers and networks), add -v to remove volumes',
        'docker compose watch (Compose 2.22+) : auto-sync/rebuild on file changes during development',
      ],
    },
  ],
  examples: [
    {
      title: 'Example 1: Project Layout, Dockerfiles for API and React/nginx',
      scenario: 'Prepare the ShopKart monorepo so each part can be built as an image.',
      steps: [
        'Create the folder structure shown below (backend = Spring Boot Maven project, frontend = Vite React project)',
        'Add backend/Dockerfile (multi-stage Maven build) and backend/.dockerignore',
        'Add frontend/Dockerfile (Node build stage + nginx stage) and frontend/nginx.conf that serves React and proxies /api to the api service',
        'In React code call relative URLs like fetch("/api/products") so the same build works everywhere',
        'In IntelliJ, the Docker plugin shows a ▶ icon next to each Dockerfile and a Services tool window for containers; in Eclipse use the Terminal view',
      ],
      code: `shopkart/
├── compose.yaml
├── compose.override.yaml
├── .env                 (NOT committed)
├── .env.example         (committed, with dummy values)
├── db/
│   └── init/01-schema.sql
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── pom.xml
│   └── src/...
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/...

# ===== backend/Dockerfile =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build /src/target/*.jar app.jar
USER spring
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]

# ===== backend/.dockerignore =====
target/
.idea/
*.iml
.git/

# ===== frontend/Dockerfile =====
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build            # Vite output -> /app/dist

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

# ===== frontend/nginx.conf =====
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # React Router: unknown paths -> index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy to Spring Boot (service name "api" on the Docker network)
    location /api/ {
        proxy_pass http://api:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ===== frontend/.dockerignore =====
node_modules/
dist/`,
      result: `docker build -t shopkart-api ./backend      -> Successfully tagged shopkart-api:latest
docker build -t shopkart-web ./frontend     -> naming to docker.io/library/shopkart-web:latest

docker images
REPOSITORY      TAG      SIZE
shopkart-web    latest   ~50MB    (nginx + static files only)
shopkart-api    latest   ~200MB   (alpine JRE + jar; sizes vary)`,
      explanation: 'Both Dockerfiles are multi-stage: heavy build tools (Maven, Node, node_modules) stay in the first stage and only the output goes into the small runtime image. Because nginx proxies /api to the API, the browser talks to ONE origin (http://localhost:8080) — no CORS configuration is needed in production. try_files sends unknown paths to index.html so a refresh on /products/5 does not give a 404.',
    },
    {
      title: 'Example 2: The Complete compose.yaml with Networks, Volumes, Healthchecks and .env',
      scenario: 'Start MySQL, Redis, Spring Boot API and nginx/React together in the correct order with secrets in .env.',
      steps: [
        'Create .env (and add ".env" to .gitignore) and .env.example with dummy values for teammates',
        'Create db/init/01-schema.sql',
        'Create compose.yaml exactly as below in the project root',
        'Add Actuator and Redis dependencies to the backend and the application.yml properties shown',
        'Run docker compose config to verify substitution, then docker compose up -d --build',
        'Run docker compose ps until all show healthy, open http://localhost:8080 and http://localhost:8080/api/products',
      ],
      code: `# ===== .env =====
MYSQL_ROOT_PASSWORD=RootPass@123
MYSQL_DATABASE=shopdb
MYSQL_USER=shop
MYSQL_PASSWORD=ShopPass@123
WEB_PORT=8080
SPRING_PROFILES_ACTIVE=docker

# ===== db/init/01-schema.sql =====
CREATE TABLE IF NOT EXISTS product (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
INSERT INTO product (name, price) VALUES ('Laptop', 55000.00), ('Mouse', 499.00);

# ===== compose.yaml =====
name: shopkart

services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD:?set MYSQL_ROOT_PASSWORD in .env}
      MYSQL_DATABASE: \${MYSQL_DATABASE}
      MYSQL_USER: \${MYSQL_USER}
      MYSQL_PASSWORD: \${MYSQL_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
      - ./db/init:/docker-entrypoint-initdb.d:ro
    networks: [backend]
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -u root -p$$MYSQL_ROOT_PASSWORD --silent"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis-data:/data
    networks: [backend]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    restart: unless-stopped

  api:
    build: ./backend
    image: shopkart-api:latest
    environment:
      SPRING_PROFILES_ACTIVE: \${SPRING_PROFILES_ACTIVE:-docker}
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/\${MYSQL_DATABASE}
      SPRING_DATASOURCE_USERNAME: \${MYSQL_USER}
      SPRING_DATASOURCE_PASSWORD: \${MYSQL_PASSWORD}
      SPRING_DATA_REDIS_HOST: redis
      SPRING_DATA_REDIS_PORT: 6379
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks: [backend, frontend]
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:8080/actuator/health | grep -q UP"]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 40s
    restart: unless-stopped

  web:
    build: ./frontend
    image: shopkart-web:latest
    ports:
      - "\${WEB_PORT:-8080}:80"
    depends_on:
      api:
        condition: service_healthy
    networks: [frontend]
    restart: unless-stopped

networks:
  frontend:
  backend:

volumes:
  mysql-data:
  redis-data:

# ===== backend: application.yml (docker profile) =====
spring:
  config:
    activate:
      on-profile: docker
  jpa:
    hibernate:
      ddl-auto: validate
  cache:
    type: redis
management:
  endpoints:
    web:
      exposure:
        include: health,info

# ===== Commands =====
docker compose config | head -30
docker compose up -d --build
docker compose ps
curl http://localhost:8080/api/products
docker compose logs -f api`,
      result: `[+] Running 7/7
 ✔ Network shopkart_backend    Created
 ✔ Network shopkart_frontend   Created
 ✔ Volume "shopkart_mysql-data" Created
 ✔ Volume "shopkart_redis-data" Created
 ✔ Container shopkart-mysql-1  Healthy
 ✔ Container shopkart-redis-1  Healthy
 ✔ Container shopkart-api-1    Healthy
 ✔ Container shopkart-web-1    Started

docker compose ps
NAME               SERVICE  STATUS                   PORTS
shopkart-api-1     api      Up 1 minute (healthy)    8080/tcp
shopkart-mysql-1   mysql    Up 2 minutes (healthy)   3306/tcp, 33060/tcp
shopkart-redis-1   redis    Up 2 minutes (healthy)   6379/tcp
shopkart-web-1     web      Up 40 seconds            0.0.0.0:8080->80/tcp

curl http://localhost:8080/api/products
[{"id":1,"name":"Laptop","price":55000.00},{"id":2,"name":"Mouse","price":499.00}]`,
      explanation: 'Only "web" publishes a port; MySQL, Redis and the API are hidden inside Docker networks, which is how production should look. Startup order is mysql/redis healthy -> api healthy -> web. The API reaches MySQL at hostname "mysql" and Redis at "redis". The init SQL ran because the mysql-data volume was empty on first start; on the next "up" it is skipped and data is kept. The eclipse-temurin alpine image contains BusyBox wget, so the API healthcheck works without curl.',
    },
    {
      title: 'Example 3: Dev Overrides, Optional Tools with Profiles, and Remote Debugging',
      scenario: 'Developers want to connect MySQL Workbench to the DB, use Adminer in the browser and attach the IntelliJ debugger to the API container — without changing the production compose file.',
      steps: [
        'Create compose.override.yaml next to compose.yaml (Compose merges it automatically)',
        'Run docker compose up -d — MySQL now listens on localhost:3307 and debug port 5005 is open',
        'Start optional tools with docker compose --profile tools up -d and open http://localhost:8081 (Adminer)',
        'IntelliJ: Run > Edit Configurations > + > Remote JVM Debug > host localhost, port 5005 > Debug. Set a breakpoint in a controller and call the API',
        'Eclipse: Run > Debug Configurations > Remote Java Application > port 5005 > Debug',
        'For production run: docker compose -f compose.yaml up -d (override ignored)',
      ],
      code: `# ===== compose.override.yaml (dev only) =====
services:
  mysql:
    ports:
      - "3307:3306"          # Workbench: host 127.0.0.1 port 3307

  api:
    ports:
      - "5005:5005"          # remote debug
    environment:
      JAVA_TOOL_OPTIONS: "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
      LOGGING_LEVEL_COM_SHOP: DEBUG

  adminer:
    image: adminer:4
    profiles: ["tools"]
    ports:
      - "8081:8080"
    networks: [backend]

# ===== Commands =====
docker compose up -d                       # compose.yaml + compose.override.yaml
docker compose --profile tools up -d       # also starts adminer
docker compose -f compose.yaml up -d       # production-like, override NOT applied
docker compose exec mysql mysql -ushop -p shopdb -e "SELECT COUNT(*) FROM product;"`,
      result: `docker compose logs api | head -3
api-1  | Picked up JAVA_TOOL_OPTIONS: -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
api-1  | Listening for transport dt_socket at address: 5005
api-1  |   .   ____          _            __ _ _ ...

docker compose exec mysql mysql -ushop -p shopdb -e "SELECT COUNT(*) FROM product;"
Enter password: ShopPass@123
+----------+
| COUNT(*) |
+----------+
|        2 |
+----------+

IntelliJ Debug console: Connected to the target VM, address: 'localhost:5005', transport: 'socket'`,
      explanation: 'The JVM reads JAVA_TOOL_OPTIONS automatically, so the Dockerfile does not change. Lists like ports are merged (appended) and maps like environment are merged by key. Adminer joins the backend network so it can use server name "mysql". Never publish database or debug ports in production.',
    },
    {
      title: 'Example 4: Troubleshooting the Five Most Common Compose Errors',
      scenario: 'Learn to read the error, find the cause and fix it — this is what seniors expect from a fresher.',
      steps: [
        'Read logs of the failing service: docker compose logs api --tail 50',
        'Check health details: docker inspect --format "{{json .State.Health}}" shopkart-mysql-1',
        'Check resolved config: docker compose config',
        'Check network membership: docker network inspect shopkart_backend',
        'Apply the fix from the table below and run docker compose up -d again',
      ],
      code: `ERROR 1: Communications link failure / Connection refused (api logs)
Cause : api started before MySQL was ready OR URL uses localhost
Fix   : depends_on with condition: service_healthy; URL jdbc:mysql://mysql:3306/shopdb

ERROR 2: Bind for 0.0.0.0:8080 failed: port is already allocated
Cause : another process (local Spring Boot, Tomcat, other container) uses 8080
Fix   : stop it (Windows: netstat -ano | findstr :8080 ; Linux/mac: lsof -i :8080)
        or change WEB_PORT=9090 in .env

ERROR 3: Access denied for user 'shop'@'%' after changing MYSQL_PASSWORD in .env
Cause : MYSQL_* variables are applied ONLY when the data volume is created
Fix   : change password with ALTER USER inside MySQL, or (dev only, data lost)
        docker compose down -v && docker compose up -d

ERROR 4: 502 Bad Gateway from nginx on /api
Cause : api container down/unhealthy or nginx not on the same network as api
Fix   : docker compose ps; put web and api on the "frontend" network;
        proxy_pass http://api:8080 (service name + container port)

ERROR 5: required variable MYSQL_ROOT_PASSWORD is missing a value: set MYSQL_ROOT_PASSWORD in .env
Cause : .env file missing or named wrongly (.env.txt on Windows!)
Fix   : create .env in the same folder as compose.yaml; check with docker compose config`,
      result: `Example diagnosis:
$ docker compose logs api --tail 5
api-1 | com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure
api-1 | Caused by: java.net.ConnectException: Connection refused
$ docker compose config | grep DATASOURCE_URL
      SPRING_DATASOURCE_URL: jdbc:mysql://localhost:3306/shopdb     <- wrong host found
After fixing to mysql:3306 -> api-1 | Started ShopApplication in 7.9 seconds`,
      explanation: 'Most Compose problems are one of: wrong hostname, startup order, port conflict, stale volume or missing environment variable. Always read the logs of the failing container first, then compare the resolved configuration. Saving .env in Windows Notepad often creates ".env.txt" — enable "File name extensions" in Explorer to check.',
    },
  ],
  interview: [
    { q: 'What is Docker Compose?', a: 'A tool to define and run multi-container applications using a YAML file (compose.yaml) that describes services, networks, volumes and configuration, managed with commands like docker compose up/down/logs.', level: 'Easy' },
    { q: 'How does a Spring Boot container connect to a MySQL container in Compose?', a: 'Both are on the same Compose network, so the service name works as hostname: jdbc:mysql://mysql:3306/db. localhost would refer to the API container itself.', level: 'Easy' },
    { q: 'Difference between ports and expose?', a: 'ports publishes a container port to the host (HOST:CONTAINER) so outside clients can reach it. expose only documents/opens the port to other containers; services on the same network can reach each other anyway.', level: 'Medium' },
    { q: 'Named volume vs bind mount?', a: 'Named volume is managed by Docker (docker volume ls), portable and ideal for database data. Bind mount maps a specific host path, good for source code, config files and init scripts during development.', level: 'Medium' },
    { q: 'Why is depends_on alone not enough for databases?', a: 'Short-form depends_on waits only for the container to start, not for the application inside to be ready. Use a healthcheck and depends_on condition: service_healthy, and also keep retry logic in the app.', level: 'Medium' },
    { q: 'What does docker compose down -v do?', a: 'Stops and removes containers and networks AND removes named volumes declared in the file, which deletes the database data. Use carefully.', level: 'Easy' },
    { q: 'How do you keep secrets out of compose.yaml?', a: 'Use variable substitution from a .env file (not committed, provide .env.example), env_file, Docker secrets (mounted under /run/secrets), or a secret manager in production. Never commit real passwords.', level: 'Medium' },
    { q: 'What is the purpose of compose.override.yaml?', a: 'It is automatically merged with compose.yaml to add developer-specific settings like extra ports, debug options and tools without changing the base file. In production you run with -f compose.yaml only or a separate prod file.', level: 'Medium' },
    { q: 'Why serve React through nginx with a reverse proxy to the API?', a: 'nginx efficiently serves static files, handles SPA fallback (try_files) and proxies /api to the backend so the browser sees a single origin — no CORS, one TLS certificate, and backend ports remain private.', level: 'Hard' },
    { q: 'How does Spring Boot read SPRING_DATASOURCE_URL from Compose?', a: 'Relaxed binding: environment variables in uppercase with underscores map to properties (SPRING_DATASOURCE_URL -> spring.datasource.url). Environment variables override application.properties values.', level: 'Medium' },
    { q: 'Compose vs Kubernetes?', a: 'Compose runs containers on a single host and is simple, great for dev/testing/small deployments. Kubernetes orchestrates across many nodes with self-healing, scaling, rolling updates and service discovery.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add RabbitMQ (with management UI) to the compose file so the API can publish events. Only the management UI should be published on the host, and only in dev.',
      hint: 'rabbitmq:3.13-management image; healthcheck with rabbitmq-diagnostics; put the port in the override file.',
      solution: `# compose.yaml additions
services:
  rabbitmq:
    image: rabbitmq:3.13-management
    environment:
      RABBITMQ_DEFAULT_USER: \${RABBIT_USER:-shop}
      RABBITMQ_DEFAULT_PASS: \${RABBIT_PASS:?set RABBIT_PASS}
    volumes:
      - rabbit-data:/var/lib/rabbitmq
    networks: [backend]
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 15s
      timeout: 10s
      retries: 5

  api:
    environment:
      SPRING_RABBITMQ_HOST: rabbitmq
      SPRING_RABBITMQ_USERNAME: \${RABBIT_USER:-shop}
      SPRING_RABBITMQ_PASSWORD: \${RABBIT_PASS}
    depends_on:
      rabbitmq:
        condition: service_healthy

volumes:
  rabbit-data:

# compose.override.yaml
services:
  rabbitmq:
    ports:
      - "15672:15672"`,
    },
    {
      task: 'Scale the API to 3 instances and let nginx load-balance them.',
      hint: 'Remove fixed container_name/ports from api; docker compose up -d --scale api=3. Docker DNS returns all IPs for "api".',
      solution: `# api service must NOT have container_name or host ports.
docker compose up -d --scale api=3

docker compose ps api
NAME             STATUS
shopkart-api-1   Up (healthy)
shopkart-api-2   Up (healthy)
shopkart-api-3   Up (healthy)

# nginx.conf - use Docker DNS resolver so new IPs are picked up
resolver 127.0.0.11 valid=10s;
server {
    listen 80;
    location /api/ {
        set $backend http://api:8080;
        proxy_pass $backend;
    }
    location / { root /usr/share/nginx/html; try_files $uri /index.html; }
}
# Requests are now spread across the instances (check with docker compose logs api).
# Sessions must be stateless (JWT) or stored in Redis (spring-session-data-redis).`,
    },
    {
      task: 'Write a one-line backup and restore procedure for the MySQL database running in Compose.',
      hint: 'mysqldump through docker compose exec -T.',
      solution: `# Backup to a file on the host
docker compose exec -T mysql sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" shopdb' > backup-shopdb.sql

# Restore into the running container
docker compose exec -T mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" shopdb' < backup-shopdb.sql

# -T disables the pseudo-terminal so redirection with > and < works.
# Single quotes make $MYSQL_ROOT_PASSWORD expand INSIDE the container.`,
    },
    {
      task: 'Create a compose.prod.yaml that uses pre-built images from Docker Hub (no build), sets memory limits and always restarts.',
      hint: 'image: user/shopkart-api:1.2.0; deploy.resources.limits.memory is honored by docker compose.',
      solution: `# compose.prod.yaml
services:
  api:
    image: yourdockerid/shopkart-api:1.2.0
    build: !reset null
    restart: always
    deploy:
      resources:
        limits:
          memory: 768m
          cpus: "1.0"
    environment:
      SPRING_PROFILES_ACTIVE: prod

  web:
    image: yourdockerid/shopkart-web:1.2.0
    build: !reset null
    restart: always
    ports:
      - "80:80"

# Run on the server:
# docker compose -f compose.yaml -f compose.prod.yaml pull
# docker compose -f compose.yaml -f compose.prod.yaml up -d`,
    },
  ],
  quiz: [
    {
      question: 'Inside the api container, which JDBC URL correctly reaches the "mysql" service?',
      options: ['jdbc:mysql://localhost:3306/shopdb', 'jdbc:mysql://mysql:3306/shopdb', 'jdbc:mysql://127.0.0.1:3307/shopdb', 'jdbc:mysql://host:3306/shopdb'],
      answer: 1,
      explanation: 'Service name is the DNS hostname on the Compose network; use the container port.',
    },
    {
      question: 'Which command removes containers AND named volumes?',
      options: ['docker compose stop', 'docker compose down', 'docker compose rm', 'docker compose down -v'],
      answer: 3,
      explanation: '-v removes volumes declared in the file.',
    },
    {
      question: 'Which depends_on condition waits until the database passes its healthcheck?',
      options: ['service_healthy', 'service_started', 'service_completed_successfully', 'service_ready'],
      answer: 0,
      explanation: 'condition: service_healthy requires a healthcheck on the dependency.',
    },
    {
      question: 'Which file does Compose read automatically for variable substitution like ${MYSQL_PASSWORD}?',
      options: ['application.properties', 'compose.env', '.env', 'variables.yml'],
      answer: 2,
      explanation: 'A file named .env in the project directory.',
    },
    {
      question: 'MySQL init scripts in /docker-entrypoint-initdb.d run:',
      options: ['On every container start', 'Only when the data directory (volume) is empty, i.e., first start', 'Only with --build', 'Never; they need a manual command'],
      answer: 1,
      explanation: 'They run only during first initialization of an empty data directory.',
    },
  ],
};
