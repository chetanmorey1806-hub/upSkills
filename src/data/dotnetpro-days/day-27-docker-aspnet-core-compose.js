const dockerfileCode = `# ===== Solution layout =====
# PlacementPortal/
#   PlacementPortal.sln
#   src/Placement.Api/Placement.Api.csproj
#   src/Placement.Application/Placement.Application.csproj
#   src/Placement.Infrastructure/Placement.Infrastructure.csproj
#   src/Placement.Domain/Placement.Domain.csproj
#   src/Placement.Api/Dockerfile        <- this file
#   .dockerignore                       <- at the build-context root
#   docker-compose.yml

# ===== src/Placement.Api/Dockerfile =====
# syntax=docker/dockerfile:1

# ---------- Stage 1: restore + build with the SDK (about 800 MB, never shipped) ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# 1) copy ONLY project files first -> the restore layer stays cached until a .csproj changes
COPY ["src/Placement.Api/Placement.Api.csproj", "src/Placement.Api/"]
COPY ["src/Placement.Application/Placement.Application.csproj", "src/Placement.Application/"]
COPY ["src/Placement.Infrastructure/Placement.Infrastructure.csproj", "src/Placement.Infrastructure/"]
COPY ["src/Placement.Domain/Placement.Domain.csproj", "src/Placement.Domain/"]
RUN dotnet restore "src/Placement.Api/Placement.Api.csproj"

# 2) now copy the source (changes often) and publish
COPY . .
WORKDIR /src/src/Placement.Api
RUN dotnet publish "Placement.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish --no-restore /p:UseAppHost=false

# ---------- Stage 2: optional test stage (docker build --target test .) ----------
FROM build AS test
WORKDIR /src
RUN dotnet test --no-restore || exit 1

# ---------- Stage 3: runtime only (about 220 MB) ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# curl is used by the HEALTHCHECK below (the aspnet image does not include it)
RUN apt-get update && apt-get install -y --no-install-recommends curl \\
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production \\
    ASPNETCORE_HTTP_PORTS=8080 \\
    DOTNET_RUNNING_IN_CONTAINER=true
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \\
  CMD curl -f http://localhost:8080/health/live || exit 1

# non-root user built into .NET 8+ images
USER app
ENTRYPOINT ["dotnet", "Placement.Api.dll"]

# ===== .dockerignore (next to the .sln = build context) =====
**/bin/
**/obj/
**/.vs/
**/.vscode/
**/node_modules/
**/*.user
**/TestResults/
.git/
.github/
**/appsettings.Development.json
**/secrets.json
**/*.pfx
Dockerfile*
docker-compose*
README.md

# ===== Build, inspect, run =====
docker build -t placement-api:1.0 -f src/Placement.Api/Dockerfile .
docker images placement-api
docker history placement-api:1.0           # see each layer and its size
docker run -d --name placement-api -p 5080:8080 -e ASPNETCORE_ENVIRONMENT=Development placement-api:1.0
docker ps                                  # STATUS shows (health: starting) then (healthy)
docker logs -f placement-api
docker inspect --format "{{.State.Health.Status}}" placement-api`;

const configCode = `// ===== How ASP.NET Core reads configuration inside a container =====
// Order (later wins): appsettings.json -> appsettings.{Environment}.json -> user secrets (Development only)
//                     -> ENVIRONMENT VARIABLES -> command-line args
// A colon in a key becomes a DOUBLE UNDERSCORE in an env variable name (":" is not allowed on Linux).

// appsettings.json
{
  "ConnectionStrings": {
    "PlacementDb": "Server=localhost;Database=PlacementDb;Trusted_Connection=True;TrustServerCertificate=True",
    "Redis": "localhost:6379"
  },
  "Email": { "SmtpHost": "localhost", "From": "tpo@gcoe.ac.in" },
  "Cors": { "AllowedOrigins": [ "http://localhost:4200" ] }
}

# Environment variables that override them (docker run -e / compose environment / K8s / Azure App Settings)
ConnectionStrings__PlacementDb=Server=sqlserver,1433;Database=PlacementDb;User Id=sa;Password=Placement@2026;TrustServerCertificate=True
ConnectionStrings__Redis=redis:6379
Email__SmtpHost=mailhog
Cors__AllowedOrigins__0=http://localhost:4200
Cors__AllowedOrigins__1=https://placement.gcoe.ac.in

// ----- Program.cs (container friendly parts) -----
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<PlacementDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("PlacementDb"),
        sql => sql.EnableRetryOnFailure(5)));          // SQL container may still be starting

builder.Services.AddStackExchangeRedisCache(o =>
{
    o.Configuration = builder.Configuration.GetConnectionString("Redis");
    o.InstanceName = "placement:";
});

// dotnet add package AspNetCore.HealthChecks.SqlServer
// dotnet add package AspNetCore.HealthChecks.Redis
builder.Services.AddHealthChecks()
    .AddSqlServer(builder.Configuration.GetConnectionString("PlacementDb")!, name: "sql", tags: ["ready"])
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!, name: "redis", tags: ["ready"]);

var app = builder.Build();

// liveness: "is the process alive?" (no dependency checks)
app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });
// readiness: "can I serve traffic?" (SQL + Redis reachable)
app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = r => r.Tags.Contains("ready") });

// apply EF migrations at startup in dev/test containers only (production: run migrations in the pipeline)
if (app.Configuration.GetValue<bool>("RunMigrations"))
{
    using var scope = app.Services.CreateScope();
    scope.ServiceProvider.GetRequiredService<PlacementDbContext>().Database.Migrate();
}

app.MapControllers();
app.Run();

# ----- Logs: containers log to stdout. Use JSON console logs for log collectors -----
Logging__Console__FormatterName=json`;

const composeCode = `# ===== .env (same folder as docker-compose.yml; add to .gitignore!) =====
SA_PASSWORD=Placement@2026
API_PORT=5080
TAG=1.0

# ===== docker-compose.yml =====
name: placement

services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: placement-sql
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: \${SA_PASSWORD}
      MSSQL_PID: Developer
    ports:
      - "1433:1433"                          # SSMS: localhost,1433  user sa
    volumes:
      - sqldata:/var/opt/mssql               # named volume: data survives "docker compose down"
    networks: [backend]
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P \\"$$MSSQL_SA_PASSWORD\\" -C -Q \\"SELECT 1\\" || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s

  redis:
    image: redis:7-alpine
    container_name: placement-redis
    command: ["redis-server", "--appendonly", "yes"]   # persist to disk
    volumes:
      - redisdata:/data
    networks: [backend]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    image: placement-api:\${TAG}
    build:
      context: .
      dockerfile: src/Placement.Api/Dockerfile
    container_name: placement-api
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      RunMigrations: "true"
      ConnectionStrings__PlacementDb: "Server=sqlserver,1433;Database=PlacementDb;User Id=sa;Password=\${SA_PASSWORD};TrustServerCertificate=True"
      ConnectionStrings__Redis: "redis:6379"
      Cors__AllowedOrigins__0: "http://localhost:4200"
    ports:
      - "\${API_PORT}:8080"                    # host 5080 -> container 8080
    depends_on:
      sqlserver:
        condition: service_healthy           # wait for the healthcheck, not just "started"
      redis:
        condition: service_healthy
    networks: [backend, frontend]
    restart: unless-stopped

  ui:
    build: ./placement-ui                    # Angular -> nginx (Dockerfile below)
    container_name: placement-ui
    ports:
      - "4200:80"
    depends_on: [api]
    networks: [frontend]

volumes:
  sqldata:
  redisdata:

networks:
  backend:                                   # sqlserver, redis, api
  frontend:                                  # api, ui
# Note: the browser calls the API through the host port (http://localhost:5080),
# containers call each other by SERVICE NAME (sqlserver, redis) on the shared network.

# ===== placement-ui/Dockerfile (Angular build -> nginx) =====
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/placement-ui/browser /usr/share/nginx/html
EXPOSE 80

# placement-ui/nginx.conf
server {
  listen 80;
  root /usr/share/nginx/html;
  location / { try_files $uri $uri/ /index.html; }    # Angular routes -> index.html
}`;

const commandsCode = `# ===== Everyday docker compose commands =====
docker compose config                      # print the final YAML with .env values filled in (great for debugging)
docker compose up -d --build               # build images and start everything in the background
docker compose ps                          # status + health of each service
docker compose logs -f api                 # follow API logs
docker compose exec redis redis-cli keys "placement:*"
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Placement@2026" -C -Q "SELECT name FROM sys.databases"
docker compose restart api
docker compose up -d --scale api=2         # (remove container_name and the fixed host port first)
docker compose down                        # stop + remove containers and networks (volumes are KEPT)
docker compose down -v                     # also delete named volumes -> database is gone!

# ===== Volumes and networks =====
docker volume ls
docker volume inspect placement_sqldata    # Mountpoint: /var/lib/docker/volumes/placement_sqldata/_data
docker network ls
docker network inspect placement_backend   # which containers are attached + their IPs

# Bind mount (host folder) vs named volume (managed by Docker)
#   - ./uploads:/app/uploads           bind mount: you see files on your PC (dev, config files)
#   - sqldata:/var/opt/mssql            named volume: best for databases, portable, fast

# ===== Cleaning up =====
docker system df                           # disk used by images, containers, volumes, build cache
docker image prune -f                      # delete dangling images
docker builder prune -f                    # delete build cache

# ===== Push to a registry =====
docker tag placement-api:1.0 ghcr.io/gcoe-tpo/placement-api:1.0
docker login ghcr.io -u <github-user>      # password = a GitHub PAT with write:packages
docker push ghcr.io/gcoe-tpo/placement-api:1.0`;

const overrideCode = `# ===== docker-compose.override.yml (picked up AUTOMATICALLY by "docker compose up") =====
# Dev-only settings live here, so docker-compose.yml stays close to production.
services:
  api:
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      Logging__LogLevel__Default: Debug
    ports:
      - "5080:8080"

  mailhog:                                 # fake SMTP server for the email background job
    image: mailhog/mailhog:v1.0.1
    ports:
      - "8025:8025"                        # web inbox at http://localhost:8025
    networks: [backend]

# ===== docker-compose.prod.yml =====
services:
  api:
    image: ghcr.io/gcoe-tpo/placement-api:\${TAG}
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      RunMigrations: "false"
    deploy:
      resources:
        limits: { cpus: "1.0", memory: 512M }
    restart: always

# run with explicit files (the override file is then NOT loaded):
# docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# ===== Secrets: do not bake them into images =====
# BAD :  ENV ConnectionStrings__PlacementDb=...Password=...   (visible in "docker history" and to anyone who pulls the image)
# GOOD:  pass at run time (-e, --env-file, compose environment from .env, K8s Secret, Azure Key Vault)
docker run --env-file ./api.env -p 5080:8080 placement-api:1.0`;

export default {
  id: 'day-27-docker-aspnet-core-compose',
  title: 'Docker for ASP.NET Core in Depth: Multi-stage Builds, Compose, Volumes, Networks and Health Checks',
  module: 'Module 7: DevOps & Cloud for .NET',
  day: 27,
  level: 'Advanced',
  duration: '3.5 hours',
  summary:
    'Containerise a Clean Architecture ASP.NET Core API the way real teams do. You will write a cached multi-stage Dockerfile, keep the build context clean with .dockerignore, and configure the app with environment variables. Then you will run API + SQL Server + Redis + Angular together with docker compose, using named volumes, separate networks and health checks so services start in the right order.',
  objectives: [
    'Write a layer-cached multi-stage Dockerfile for a multi-project .NET solution and explain every line',
    'Use .dockerignore, ENV/ARG, EXPOSE, USER, HEALTHCHECK and ENTRYPOINT correctly',
    'Override appsettings.json with environment variables (double underscore) inside containers',
    'Run API + SQL Server + Redis + UI with docker compose using volumes, networks and depends_on conditions',
    'Add liveness/readiness health endpoints in ASP.NET Core and debug containers with logs, exec and inspect',
  ],
  theory: [
    {
      heading: 'Images, layers and the build cache',
      content:
        'A Docker image is a stack of read-only layers. Each instruction in a Dockerfile (FROM, COPY, RUN) creates one layer. Docker caches layers. When you build again, it reuses every layer until the first instruction whose input has changed, and from that point everything is rebuilt. This is why .NET Dockerfiles copy the .csproj files and run dotnet restore BEFORE copying the source code. Your code changes many times a day, but NuGet packages change rarely, so the slow restore step stays cached. A container is a running instance of an image with a thin writable layer on top. When the container is deleted, that writable layer is deleted too, which is why databases need volumes.',
      points: [
        'Order instructions from least to most frequently changing',
        'Combine apt-get update && install && cleanup in ONE RUN so the cache files are not kept in a layer',
        'docker history <image> shows each layer and its size',
        'Tags are versions: placement-api:1.0, :1.1, :latest. Never deploy :latest to production, because you cannot tell which version is running',
      ],
    },
    {
      heading: 'Multi-stage Dockerfile for .NET explained',
      content:
        'A multi-stage Dockerfile has several FROM lines. The build stage uses mcr.microsoft.com/dotnet/sdk (compilers, NuGet, about 800 MB). The final stage starts fresh from mcr.microsoft.com/dotnet/aspnet (runtime only, about 220 MB) and copies only the published DLLs with COPY --from=build. The SDK, the source code and obj folders never reach production. The image is smaller, faster to pull and has a smaller attack surface. You can add a test stage and run it in CI with docker build --target test.',
      points: [
        'FROM image AS name - starts a stage. COPY --from=name copies files from an earlier stage',
        'WORKDIR - sets (and creates) the current folder. Use it instead of RUN cd',
        'ARG - a build-time variable (docker build --build-arg BUILD_CONFIGURATION=Debug). ENV - a runtime variable inside the container',
        'EXPOSE 8080 - documentation only. Publishing a port needs -p 5080:8080 or ports: in compose',
        '.NET 8+ images listen on 8080 (ASPNETCORE_HTTP_PORTS) and include a non-root user "app". Switch to it with USER app',
        'ENTRYPOINT ["dotnet", "Placement.Api.dll"] - the exec form (JSON array) so the app gets SIGTERM and shuts down gracefully',
        'Smaller options: -alpine images, or the "chiseled" Ubuntu images (aspnet:8.0-jammy-chiseled, no shell). You can also publish self-contained and trimmed apps for runtime-deps images',
      ],
      tip: 'Visual Studio: right-click the API project > Add > Docker Support > Linux generates a similar Dockerfile, and the "Container (Dockerfile)" launch profile lets you press F5 to debug inside the container.',
    },
    {
      heading: '.dockerignore and environment configuration',
      content:
        'The last argument of docker build (usually ".") is the build context. Docker sends that whole folder to the builder. Without a .dockerignore file it uploads bin/obj, .git and node_modules (hundreds of MB), which slows every build. Worse, COPY . . would copy your Windows bin/obj and break the Linux build, or leak secrets such as appsettings.Development.json. ASP.NET Core configuration is layered: appsettings.json, then appsettings.{Environment}.json, then environment variables, then command-line args, and the later source wins. Inside containers, environment variables are the standard way to configure the app. Because ":" is not allowed in Linux variable names, nested keys use a double underscore: ConnectionStrings:PlacementDb becomes ConnectionStrings__PlacementDb. Array items use an index, as in Cors__AllowedOrigins__0.',
      points: [
        'ASPNETCORE_ENVIRONMENT=Production | Staging | Development picks appsettings.{env}.json and changes behaviour (developer exception page, Swagger)',
        'Pass config with -e KEY=value, --env-file file.env, compose environment:, K8s ConfigMap/Secret, or Azure App Settings',
        'Never bake passwords into the image with ENV. Anyone who pulls the image can read them with docker inspect or docker history',
        'Inside a container, localhost means the container itself. Use the service name (sqlserver) or host.docker.internal to reach your PC',
      ],
      syntax: `docker run -e ASPNETCORE_ENVIRONMENT=Staging \\
  -e ConnectionStrings__PlacementDb="Server=sqlserver,1433;..." \\
  -p 5080:8080 placement-api:1.0`,
    },
    {
      heading: 'docker compose: API + SQL Server + Redis as one application',
      content:
        'docker compose describes a multi-container application in one YAML file. Each service becomes one or more containers. Compose creates a default network where services find each other by service name using built-in DNS, so the API connects to Server=sqlserver,1433 and redis:6379. Variables like ${SA_PASSWORD} are filled from a .env file next to the compose file. Keep that file out of Git. docker-compose.override.yml is merged automatically for local development, and -f files let you choose other combinations, such as prod.',
      points: [
        'services, image, build (context + dockerfile), environment, ports (HOST:CONTAINER), volumes, networks, depends_on, restart, healthcheck',
        'docker compose up -d --build, ps, logs -f api, exec, down, down -v (deletes volumes)',
        'docker compose config shows the final merged YAML with values filled in, which is the first debugging step',
        'restart: unless-stopped / always / on-failure restarts crashed containers',
        'In compose files write $$ to pass a literal $ into the container shell (as in the SQL healthcheck)',
      ],
    },
    {
      heading: 'Volumes and networks',
      content:
        'Containers are disposable, but data is not. A named volume (sqldata:/var/opt/mssql) is storage managed by Docker that lives outside the container\'s life. You can delete and recreate the SQL Server container, even with a newer image, and the database is still there. A bind mount (./uploads:/app/uploads) maps a folder on your PC into the container. It is good for development and config files, but it is slower on Windows and depends on the host path. Networks isolate traffic. If you put the database and Redis on a "backend" network and the UI on a "frontend" network, only the API (attached to both) can reach the database. Containers on different networks cannot talk to each other.',
      points: [
        'docker volume ls / inspect / rm. docker compose down keeps volumes, and down -v deletes them',
        'Back up a volume: docker run --rm -v placement_sqldata:/data -v ${PWD}:/backup alpine tar czf /backup/sql.tgz /data',
        'Default network driver is bridge. Compose names it <project>_default, or <project>_<name> for networks you declare',
        'Only publish ports you need from the host. The database port 1433 is published only so SSMS can connect in development',
      ],
    },
    {
      heading: 'Health checks and startup order',
      content:
        'depends_on alone only waits for a container to START, not for SQL Server to be ready to accept logins, which takes 10-30 seconds. Add a healthcheck to each dependency and use depends_on: { sqlserver: { condition: service_healthy } }. The API then starts only when sqlcmd SELECT 1 succeeds. Inside the API, ASP.NET Core health checks expose endpoints: /health/live answers "the process is alive" with no dependency checks, and /health/ready answers "SQL and Redis are reachable, send me traffic". The Dockerfile HEALTHCHECK, compose, Kubernetes probes (Day 28) and Azure App Service health check (Day 29) all call these endpoints.',
      points: [
        'Container health states: starting -> healthy / unhealthy (see docker ps or docker inspect --format "{{.State.Health.Status}}")',
        'HEALTHCHECK options: --interval, --timeout, --start-period (grace time at boot), --retries',
        'Packages: AspNetCore.HealthChecks.SqlServer, .Redis, .RabbitMQ, .Uris (community, widely used)',
        'Still add EF Core EnableRetryOnFailure(). Networks blip in production even after startup',
        'Docker itself does not restart an "unhealthy" container. Orchestrators (Kubernetes, App Service) do',
      ],
    },
  ],
  examples: [
    {
      title: 'Cached multi-stage Dockerfile for a Clean Architecture API',
      scenario:
        'The Placement Portal API has 4 projects (Api, Application, Infrastructure, Domain). Build a production image that restores packages only when a .csproj changes, runs as non-root and reports its health.',
      steps: [
        'Install Docker Desktop (WSL 2 backend on Windows) and check docker version',
        'Create src/Placement.Api/Dockerfile and .dockerignore at the solution root',
        'Open a terminal in the solution folder (where the .sln is) and run docker build -t placement-api:1.0 -f src/Placement.Api/Dockerfile .',
        'Change one line in a controller and build again, and notice that the restore step shows CACHED',
        'docker run -d ... and watch docker ps until the status is (healthy)',
      ],
      code: dockerfileCode,
      result: `PS> docker build -t placement-api:1.0 -f src/Placement.Api/Dockerfile .
[+] Building 58.3s (19/19) FINISHED
 => [internal] load .dockerignore                                    0.0s
 => [internal] load build context  transferring context: 412.31kB   0.3s
 => [build 3/9] COPY [src/Placement.Api/Placement.Api.csproj, ...]  0.1s
 => [build 7/9] RUN dotnet restore "src/Placement.Api/...csproj"    31.6s
 => [build 9/9] RUN dotnet publish ...                              17.9s
 => [final 3/3] COPY --from=build /app/publish .                    0.2s
 => naming to docker.io/library/placement-api:1.0

(second build after editing a controller)
 => CACHED [build 7/9] RUN dotnet restore ...
[+] Building 14.2s FINISHED

PS> docker images placement-api
REPOSITORY      TAG   IMAGE ID       SIZE
placement-api   1.0   3f9c2d1a7b44   236MB

PS> docker ps
CONTAINER ID  IMAGE              STATUS                    PORTS
a1c9e2f0b3d4  placement-api:1.0  Up 40 seconds (healthy)   0.0.0.0:5080->8080/tcp`,
      explanation:
        'Copying only the four .csproj files before restore is the key trick: restore takes 30+ seconds, and it now re-runs only when a package reference changes. The context transfer is small (412 kB) because .dockerignore skips bin, obj and .git. The test stage is not part of the final image unless you ask for it with --target test. The final image is about 236 MB instead of about 900 MB with the SDK. Your image id, sizes and times will differ.',
    },
    {
      title: 'Environment-based configuration and health endpoints',
      scenario:
        'The same image must run on a laptop, in QA and in production with different databases and Redis servers. It must also tell Docker (and later Kubernetes/Azure) whether it is alive and ready.',
      steps: [
        'dotnet add package AspNetCore.HealthChecks.SqlServer and AspNetCore.HealthChecks.Redis',
        'dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis',
        'Update Program.cs with the health checks, Redis cache and retry-on-failure code',
        'Run the container with -e ConnectionStrings__PlacementDb=... and call /health/live and /health/ready',
      ],
      code: configCode,
      result: `GET http://localhost:5080/health/live   -> 200 Healthy
GET http://localhost:5080/health/ready  -> 200 Healthy        (SQL and Redis up)

docker compose stop redis
GET http://localhost:5080/health/ready  -> 503 Unhealthy
GET http://localhost:5080/health/live   -> 200 Healthy        (process is still fine, do not restart it)

docker logs placement-api (json formatter)
{"EventId":0,"LogLevel":"Information","Category":"Microsoft.Hosting.Lifetime","Message":"Now listening on: http://[::]:8080"}`,
      explanation:
        'Environment variables override appsettings.json because they are added later in the configuration chain. A double underscore maps to the ":" separator. Separating live and ready matters. If Redis is down, restarting the API will not fix Redis, so liveness stays healthy while readiness fails. That tells an orchestrator to stop sending traffic without killing the pod. EnableRetryOnFailure handles short SQL connection drops.',
    },
    {
      title: 'docker compose: API + SQL Server + Redis + Angular UI',
      scenario:
        'A new developer joins the placement team. With one command they should get the database, the cache, the API and the UI running, with data that survives restarts.',
      steps: [
        'Create .env and docker-compose.yml in the solution folder and add .env to .gitignore',
        'Add the placement-ui Dockerfile and nginx.conf',
        'Run docker compose config to check the variables',
        'Run docker compose up -d --build, then docker compose ps',
        'Open http://localhost:4200 (UI), http://localhost:5080/swagger (API), and connect SSMS to localhost,1433',
      ],
      code: composeCode,
      result: `PS> docker compose up -d --build
[+] Running 8/8
 ✔ Network placement_backend     Created
 ✔ Network placement_frontend    Created
 ✔ Volume "placement_sqldata"    Created
 ✔ Volume "placement_redisdata"  Created
 ✔ Container placement-redis     Healthy
 ✔ Container placement-sql       Healthy
 ✔ Container placement-api       Started
 ✔ Container placement-ui        Started

PS> docker compose ps
NAME              SERVICE     STATUS                    PORTS
placement-api     api         Up 25 seconds (healthy)   0.0.0.0:5080->8080/tcp
placement-redis   redis       Up 41 seconds (healthy)   6379/tcp
placement-sql     sqlserver   Up 41 seconds (healthy)   0.0.0.0:1433->1433/tcp
placement-ui      ui          Up 24 seconds             0.0.0.0:4200->80/tcp`,
      explanation:
        'The API starts only after the SQL and Redis health checks pass (condition: service_healthy), so the first EF migration does not crash. Inside the backend network the API reaches the database as "sqlserver" and the cache as "redis". The UI container is not on the backend network, so it cannot reach SQL Server directly. Redis has no published port, so only containers can use it. The named volume sqldata keeps the PlacementDb database after docker compose down. $$MSSQL_SA_PASSWORD in the healthcheck is escaped so compose leaves the $ for the container shell.',
    },
    {
      title: 'Daily compose commands: logs, exec, volumes, networks and cleanup',
      scenario:
        'The API returns 500 for the students list. Investigate using only Docker commands: logs, the Redis keys, the database list, the network and disk usage.',
      steps: [
        'Run docker compose logs -f api and reproduce the error from Swagger',
        'Use docker compose exec to run redis-cli and sqlcmd inside the containers',
        'Inspect the backend network to see which containers are attached',
        'Practise down vs down -v on a throw-away copy, never on data you need',
      ],
      code: commandsCode,
      result: `PS> docker compose exec redis redis-cli keys "placement:*"
1) "placement:students:all"
2) "placement:companies:all"

PS> docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd ... -Q "SELECT name FROM sys.databases"
name
--------------
master
tempdb
model
msdb
PlacementDb

PS> docker network inspect placement_backend --format "{{range .Containers}}{{.Name}} {{end}}"
placement-sql placement-redis placement-api

PS> docker compose down
 ✔ Container placement-ui     Removed
 ✔ Container placement-api    Removed
 ✔ Container placement-redis  Removed
 ✔ Container placement-sql    Removed
 ✔ Network placement_backend  Removed
 ✔ Network placement_frontend Removed
(volumes kept: docker volume ls still shows placement_sqldata)`,
      explanation:
        'docker compose exec runs a command in a running service container, which is the fastest way to check what the app really sees. The Redis keys have the "placement:" prefix from InstanceName. Network inspect proves the UI is isolated from the database. down removes containers and networks but keeps named volumes, so the next up starts with the same data. down -v wipes them, which is useful for a clean test run.',
    },
    {
      title: 'Override files, production compose and keeping secrets out of images',
      scenario:
        'Developers need MailHog and debug logging, while the server needs registry images, resource limits and no auto-migration. Do it without copying the whole compose file.',
      steps: [
        'Create docker-compose.override.yml (used automatically by docker compose up)',
        'Create docker-compose.prod.yml for the server',
        'On the server run docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d',
        'Check that no password appears in docker history placement-api:1.0',
      ],
      code: overrideCode,
      result: `Developer laptop: docker compose up -d
  -> api + sqlserver + redis + ui + mailhog, Debug logs, inbox at http://localhost:8025

Server: docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
  -> api uses ghcr.io/gcoe-tpo/placement-api:1.0, Production, max 1 CPU / 512 MB, no mailhog

PS> docker history placement-api:1.0 | Select-String Password
(no output - no secret is stored in any layer)`,
      explanation:
        'Compose merges files in order, so later files override or extend earlier ones. The override file is loaded only when you do not pass -f. This keeps one base file and small per-environment deltas. Secrets are given at run time from .env, --env-file or an orchestrator secret, never with ENV in the Dockerfile, because image layers can be read by anyone who has the image.',
    },
  ],
  interview: [
    { q: 'Why copy the .csproj files and run dotnet restore before COPY . . ?', a: 'Docker caches each layer and rebuilds from the first changed instruction. Project files change rarely, so the slow restore layer stays cached and only the publish step runs again when code changes.', level: 'Medium' },
    { q: 'What are the benefits of a multi-stage build?', a: 'You build with the big SDK image but ship only the runtime image plus the published output. The image is smaller, has no compilers or source, has a smaller attack surface and is faster to pull. You can also add test or lint stages.', level: 'Easy' },
    { q: 'ARG vs ENV in a Dockerfile?', a: 'ARG exists only while building (docker build --build-arg) and is not in the running container. ENV is set in the image and is available to the running app. It can be overridden with -e at run time.', level: 'Medium' },
    { q: 'Does EXPOSE publish a port?', a: 'No. EXPOSE is only documentation and metadata. You publish a port with -p HOST:CONTAINER (docker run) or ports: in compose. Containers on the same network can reach each other on any listening port anyway.', level: 'Easy' },
    { q: 'CMD vs ENTRYPOINT? Shell form vs exec form?', a: 'ENTRYPOINT is the main executable. CMD gives default arguments (or the command if there is no ENTRYPOINT) and is easy to override. Exec form ["dotnet","App.dll"] runs the process as PID 1, so it receives SIGTERM for graceful shutdown. Shell form wraps it in /bin/sh -c, which may not forward signals.', level: 'Hard' },
    { q: 'What is .dockerignore for?', a: 'It excludes files from the build context: bin, obj, .git, node_modules, secrets. Builds are faster, the cache is not broken by irrelevant files, Windows build outputs do not get into the Linux build, and secrets do not leak into images.', level: 'Easy' },
    { q: 'How do you set ConnectionStrings:Default with an environment variable?', a: 'ConnectionStrings__Default=... The double underscore replaces ":" because colons are not allowed in Linux environment variable names. Environment variables override appsettings.json.', level: 'Easy' },
    { q: 'The API container cannot connect to Server=localhost,1433 where SQL Server runs in another container. Why?', a: 'localhost inside a container is the container itself. On a compose network use the service name (Server=sqlserver,1433). To reach SQL Server installed on your PC use host.docker.internal.', level: 'Medium' },
    { q: 'depends_on vs depends_on with condition: service_healthy?', a: 'Plain depends_on only controls start order: the dependency container has started. With condition: service_healthy, compose waits until the dependency\'s healthcheck passes, so SQL Server is really accepting connections.', level: 'Medium' },
    { q: 'Named volume vs bind mount?', a: 'A named volume is managed by Docker, portable and fast, and is best for database data. A bind mount maps a specific host folder into the container. It is good for source code or config in development, but depends on the host path and is slower on Windows/macOS.', level: 'Medium' },
    { q: 'What happens to data on docker compose down vs down -v?', a: 'down stops and removes containers and networks, and named volumes stay, so the data is kept. down -v also removes the named volumes, so the data is lost.', level: 'Easy' },
    { q: 'Liveness vs readiness health checks?', a: 'Liveness checks whether the process is alive and not deadlocked. If it fails, restart it. Readiness checks whether it can serve requests now (DB and cache reachable, warm-up done). If it fails, stop routing traffic but do not restart. Map them to /health/live and /health/ready.', level: 'Medium' },
    { q: 'Why run the container as a non-root user?', a: 'If an attacker breaks into the app, they get the limited "app" user instead of root, which limits the damage to the container and host. .NET 8+ images include the app user (USER app), and the app listens on 8080 because non-root users cannot bind ports below 1024.', level: 'Medium' },
    { q: 'How do you keep secrets out of Docker images?', a: 'Never use ENV or COPY for secrets. Pass them at run time (environment, --env-file, Docker/K8s secrets, Azure Key Vault). Exclude secret files in .dockerignore. Use BuildKit --secret mounts for build-time secrets such as a private NuGet token.', level: 'Hard' },
    { q: 'How do you reduce a .NET image size further?', a: 'Use a multi-stage build, the alpine or chiseled aspnet images, publish trimmed or self-contained apps onto runtime-deps images, remove unneeded packages, clean apt caches in the same RUN, and keep the context small with .dockerignore.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a multi-stage Dockerfile for a .NET Worker Service (Placement.EmailWorker) that has no HTTP port. Use the runtime image (not aspnet) and a non-root user.',
      hint: 'A worker needs mcr.microsoft.com/dotnet/runtime:8.0. No EXPOSE.',
      solution: `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/Placement.EmailWorker/Placement.EmailWorker.csproj", "src/Placement.EmailWorker/"]
RUN dotnet restore "src/Placement.EmailWorker/Placement.EmailWorker.csproj"
COPY . .
RUN dotnet publish "src/Placement.EmailWorker/Placement.EmailWorker.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/runtime:8.0
WORKDIR /app
COPY --from=build /app/publish .
USER app
ENTRYPOINT ["dotnet", "Placement.EmailWorker.dll"]`,
    },
    {
      task: 'Add a RabbitMQ service (with management UI) to the compose file, with a healthcheck, a named volume and the backend network. Make the API wait for it.',
      hint: 'Image rabbitmq:3-management. Healthcheck: rabbitmq-diagnostics -q ping. Ports 5672 and 15672.',
      solution: `  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "15672:15672"          # management UI (guest/guest in dev)
    volumes:
      - rabbitdata:/var/lib/rabbitmq
    networks: [backend]
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 10s
      retries: 10

  api:
    environment:
      RabbitMq__Host: "rabbitmq"
    depends_on:
      rabbitmq:
        condition: service_healthy

volumes:
  rabbitdata:`,
    },
    {
      task: 'Prove that a named volume keeps data: insert a row with sqlcmd, run docker compose down, then up again and select the row. Repeat with down -v and explain the difference.',
      hint: 'Use docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd ... -C -Q "...".',
      solution: `docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Placement@2026" -C -Q "CREATE TABLE PlacementDb.dbo.Demo(Id INT); INSERT PlacementDb.dbo.Demo VALUES(1)"
docker compose down && docker compose up -d
...-Q "SELECT * FROM PlacementDb.dbo.Demo"     -> 1 row (volume kept)
docker compose down -v && docker compose up -d
...-Q "SELECT * FROM PlacementDb.dbo.Demo"     -> Invalid object name (volume deleted, DB recreated by migrations without Demo)`,
    },
    {
      task: 'The team complains that every build takes 60 seconds even for a one-line change. The Dockerfile starts with COPY . . then RUN dotnet restore. Fix it and explain why it helps.',
      hint: 'Think about which layer is invalidated by a code change.',
      solution: `Problem: COPY . . changes on every code edit, so every layer after it (restore + publish) is rebuilt.
Fix:
COPY ["src/Placement.Api/Placement.Api.csproj", "src/Placement.Api/"]
COPY ["src/Placement.Application/Placement.Application.csproj", "src/Placement.Application/"]
RUN dotnet restore "src/Placement.Api/Placement.Api.csproj"
COPY . .
RUN dotnet publish ... --no-restore
Also add a .dockerignore so bin/obj/.git changes do not invalidate COPY . .`,
    },
    {
      task: 'Write a health check class that reports Degraded when the pending email queue has more than 100 items, and expose it on /health/ready.',
      hint: 'Implement IHealthCheck and register it with AddCheck<T>("email-queue", tags: ["ready"]).',
      solution: `public class EmailQueueHealthCheck(IEmailQueue queue) : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        int pending = queue.Count;
        return Task.FromResult(pending > 100
            ? HealthCheckResult.Degraded($"{pending} emails waiting")
            : HealthCheckResult.Healthy($"{pending} emails waiting"));
    }
}
builder.Services.AddHealthChecks().AddCheck<EmailQueueHealthCheck>("email-queue", tags: ["ready"]);`,
    },
  ],
  quiz: [
    {
      question: 'Which base image should the FINAL stage of an ASP.NET Core API Dockerfile use?',
      options: ['mcr.microsoft.com/dotnet/sdk:8.0', 'mcr.microsoft.com/dotnet/aspnet:8.0', 'mcr.microsoft.com/mssql/server:2022-latest', 'node:22-alpine'],
      answer: 1,
      explanation: 'aspnet contains the ASP.NET Core runtime only. The SDK is needed only in the build stage.',
    },
    {
      question: 'Which environment variable overrides "ConnectionStrings": { "PlacementDb": "..." } in appsettings.json?',
      options: ['ConnectionStrings:PlacementDb', 'CONNECTIONSTRINGS_PLACEMENTDB', 'ConnectionStrings__PlacementDb', 'PlacementDb'],
      answer: 2,
      explanation: 'A double underscore represents the ":" hierarchy separator in environment variable names.',
    },
    {
      question: 'In docker compose, how does the API container connect to the SQL Server service named "sqlserver"?',
      options: ['Server=localhost,1433', 'Server=sqlserver,1433', 'Server=127.0.0.1,1433', 'Server=host,1433'],
      answer: 1,
      explanation: 'Compose networks provide DNS. Each service is reachable by its service name.',
    },
    {
      question: 'What does "docker compose down -v" do that "docker compose down" does not?',
      options: ['Stops containers', 'Removes networks', 'Rebuilds images', 'Deletes the named volumes (data is lost)'],
      answer: 3,
      explanation: 'Both stop and remove containers and networks. -v also removes named volumes.',
    },
    {
      question: 'Why use depends_on with condition: service_healthy for SQL Server?',
      options: ['To wait until SQL Server actually accepts connections, not just until its container has started', 'To make SQL Server start faster', 'To publish port 1433', 'To create the database automatically'],
      answer: 0,
      explanation: 'SQL Server needs several seconds after the container starts. The healthcheck condition prevents the API from failing its first connection.',
    },
  ],
};
