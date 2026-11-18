const workerCode = `using System;
using System.Collections.Generic;

// 12-factor style: configuration comes from environment variables (docker run -e ...)
string appName = Environment.GetEnvironmentVariable("SCHOOL_APP_NAME") ?? "SchoolWorker";
string env = Environment.GetEnvironmentVariable("SCHOOL_ENV") ?? "Production";
int batchSize = int.TryParse(Environment.GetEnvironmentVariable("SCHOOL_BATCH_SIZE"), out int b) ? b : 2;

Log("info", $"{appName} starting in {env}, batch size {batchSize}");

var jobs = new Queue<string>(new[] { "send-report:101", "send-report:102", "resize-photo:7", "bad-job" });
int batch = 0;
while (jobs.Count > 0)
{
    batch++;
    for (int i = 0; i < batchSize && jobs.Count > 0; i++)
    {
        string job = jobs.Dequeue();
        try
        {
            Process(job);
            Log("info", $"batch {batch}: done {job}");
        }
        catch (Exception ex)
        {
            Log("error", $"batch {batch}: {job} failed - {ex.Message}");
        }
    }
}
Log("info", "all jobs processed, exiting with code 0");

void Process(string job)
{
    if (!job.Contains(':')) throw new FormatException("expected name:id");
}

// Containers log to STDOUT; Docker / Azure collect it (docker logs <container>)
void Log(string level, string message) => Console.WriteLine($"[{level}] {message}");
`;

const pipelineCode = `using System;
using System.Collections.Generic;

RunPipeline("a1b2c3d", "Add attendance API", failingTests: 0);
Console.WriteLine();
RunPipeline("e4f5a6b", "Refactor grade rules", failingTests: 2);

void RunPipeline(string sha, string message, int failingTests)
{
    Console.WriteLine($"Pipeline for {sha} '{message}'");

    var stages = new List<(string Name, Func<(bool Ok, string Info)> Run)>
    {
        ("Checkout", () => (true, $"commit {sha}")),
        ("Restore",  () => (true, "12 packages restored")),
        ("Build",    () => (true, "0 warnings, 0 errors")),
        ("Test",     () => failingTests == 0
                            ? (true, "48 passed")
                            : (false, $"{48 - failingTests} passed, {failingTests} failed")),
        ("Publish",  () => (true, "artifact school-api.zip")),
        ("Deploy",   () => (true, "deployed to staging"))
    };

    bool failed = false;
    int step = 0;
    foreach (var (name, run) in stages)
    {
        step++;
        if (failed)
        {
            Console.WriteLine($"  {step}. {name,-9} SKIPPED");
            continue;
        }
        var (ok, info) = run();
        Console.WriteLine($"  {step}. {name,-9} {(ok ? "OK    " : "FAILED")} {info}");
        if (!ok) failed = true;                 // a red stage stops the pipeline
    }
    Console.WriteLine(failed ? "  Result: FAILED - nothing deployed, author notified" : "  Result: SUCCESS");
}
`;

const retryCode = `using System;
using System.Threading.Tasks;

int calls = 0;
string correlationId = "req-0001";

// Scenario 1: a flaky dependency (network/SQL hiccup) fails twice, then works
string result = await RetryAsync<string>(GetStudentsFromDb, maxAttempts: 4, baseDelayMs: 200);
Console.WriteLine($"[{correlationId}] Result: {result}");

// Scenario 2: the dependency is really down -> retries give up -> global error handler
correlationId = "req-0002";
try
{
    await RetryAsync<string>(AlwaysTimesOut, maxAttempts: 3, baseDelayMs: 200);
}
catch (Exception ex)
{
    // what app.UseExceptionHandler does: log everything, return a safe message + trace id
    Console.WriteLine($"[{correlationId}] ERROR {ex.GetType().Name}: {ex.Message}");
    Console.WriteLine($"HTTP 500 -> {{ title: Something went wrong, traceId: {correlationId} }}");
}

Task<string> GetStudentsFromDb()
{
    calls++;
    if (calls <= 2) throw new TimeoutException($"SQL timeout (call {calls})");
    return Task.FromResult("3 students");
}

Task<string> AlwaysTimesOut() => throw new TimeoutException("SQL server unreachable");

async Task<T> RetryAsync<T>(Func<Task<T>> action, int maxAttempts, int baseDelayMs)
{
    for (int attempt = 1; ; attempt++)
    {
        try
        {
            return await action();
        }
        catch (TimeoutException ex) when (attempt < maxAttempts)
        {
            int delay = baseDelayMs * (int)Math.Pow(2, attempt - 1);      // exponential backoff
            Console.WriteLine($"[{correlationId}] attempt {attempt} failed: {ex.Message}; retrying in {delay} ms");
            await Task.Delay(10);                                         // shortened for the demo
        }
    }
}
`;

const dockerfileCode = `# ===== SchoolApi/Dockerfile (multi-stage build) =====
# ---- Stage 1: build with the full SDK image ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy only the project file first -> "dotnet restore" layer is cached until packages change
COPY SchoolApi/SchoolApi.csproj SchoolApi/
RUN dotnet restore SchoolApi/SchoolApi.csproj

# copy the rest of the source and publish
COPY . .
RUN dotnet publish SchoolApi/SchoolApi.csproj -c Release -o /app/publish /p:UseAppHost=false

# ---- Stage 2: small runtime-only image ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

# .NET 8+ images contain a non-root user called "app"
USER app
ENTRYPOINT ["dotnet", "SchoolApi.dll"]

# ===== .dockerignore (in the build-context folder) =====
# **/bin
# **/obj
# **/.vs
# **/node_modules
# **/*.user
# .git
# **/appsettings.Development.json

# ===== Build and run (from the solution folder) =====
# docker build -t school-api:1.0 -f SchoolApi/Dockerfile .
# docker images
# docker run -d --name school-api -p 8080:8080 \`
#   -e ConnectionStrings__DefaultConnection="Server=host.docker.internal,1433;Database=SchoolDb;User Id=sa;Password=Your_Strong_Pwd1;TrustServerCertificate=True" \`
#   -e Jwt__Key="a-long-random-key-for-the-container-123456" \`
#   school-api:1.0
# docker ps
# docker logs -f school-api
# docker exec -it school-api bash        (look inside the running container; aspnet image has bash)
# docker stop school-api ; docker rm school-api

# ===== Visual Studio =====
# Right-click SchoolApi > Add > Docker Support > Linux  -> generates a Dockerfile
# Choose the "Container (Dockerfile)" launch profile and press F5 to debug INSIDE the container

# ===== Program.cs additions useful in containers =====
# builder.Services.AddHealthChecks().AddDbContextCheck<AppDbContext>();
# app.MapHealthChecks("/health");
# // behind a reverse proxy / load balancer:
# builder.Services.Configure<ForwardedHeadersOptions>(o =>
#     o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto);
# app.UseForwardedHeaders();`;

const composeCode = `# ===== docker-compose.yml (solution folder) =====
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: "Your_Strong_Pwd1"
    ports:
      - "1433:1433"                      # connect from SSMS: localhost,1433 / sa
    volumes:
      - sqldata:/var/opt/mssql           # keep data when the container is recreated

  api:
    build:
      context: .
      dockerfile: SchoolApi/Dockerfile
    environment:
      ASPNETCORE_ENVIRONMENT: "Development"
      ConnectionStrings__DefaultConnection: "Server=sqlserver,1433;Database=SchoolDb;User Id=sa;Password=Your_Strong_Pwd1;TrustServerCertificate=True"
      Cors__AllowedOrigins__0: "http://localhost:3000"
    ports:
      - "8080:8080"
    depends_on:
      - sqlserver
    restart: on-failure                  # SQL Server needs a few seconds to start

  web:
    build:
      context: ./school-react
    ports:
      - "3000:80"
    depends_on:
      - api

volumes:
  sqldata:

# ===== school-react/Dockerfile (build React, serve with nginx) =====
# FROM node:20-alpine AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# ARG VITE_API_URL=http://localhost:8080/api
# ENV VITE_API_URL=$VITE_API_URL
# RUN npm run build
#
# FROM nginx:1.27-alpine
# COPY --from=build /app/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf      # try_files $uri /index.html; for React Router
# EXPOSE 80

# ===== Commands =====
# docker compose up -d --build
# docker compose ps
# docker compose logs -f api
# docker compose down            (add -v to also delete the database volume)`;

const actionsCode = `# ===== .github/workflows/ci-cd.yml =====
name: SchoolApi CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  DOTNET_VERSION: '8.0.x'
  AZURE_WEBAPP_NAME: school-api-demo

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: \${{ env.DOTNET_VERSION }}

      - name: Restore
        run: dotnet restore

      - name: Build
        run: dotnet build --no-restore -c Release

      - name: Test (unit + integration)
        run: dotnet test --no-build -c Release --logger trx --collect:"XPlat Code Coverage"

      - name: Publish
        run: dotnet publish SchoolApi/SchoolApi.csproj --no-build -c Release -o ./publish

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: school-api
          path: ./publish

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: school-react
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: school-react/package-lock.json
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run build

  docker:
    needs: build-test
    if: github.event_name == 'push'          # not for pull requests
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          file: SchoolApi/Dockerfile
          push: true
          tags: ghcr.io/\${{ github.repository_owner }}/school-api:\${{ github.sha }}

  deploy:
    needs: build-test
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production                   # can require manual approval in repo settings
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: school-api
          path: ./publish
      - uses: azure/webapps-deploy@v3
        with:
          app-name: \${{ env.AZURE_WEBAPP_NAME }}
          publish-profile: \${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ./publish

# Setup once:
# Azure portal > App Service > Download publish profile
# GitHub repo > Settings > Secrets and variables > Actions > New repository secret
#   Name: AZURE_WEBAPP_PUBLISH_PROFILE   Value: <paste the XML>
# Settings > Branches > protect main: "Require status checks to pass" -> build-test, frontend`;

export default {
  id: 'day-118-docker-cicd-github-actions',
  title: 'Docker Basics, Dockerfile, Containerization, CI/CD Introduction, GitHub Actions and Production Debugging',
  module: 'Module 11: Deployment & Professional Development',
  day: 118,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Package the .NET API, SQL Server and React app into containers with Docker and Docker Compose, then automate build, test and deployment with a GitHub Actions CI/CD pipeline. Finish with production debugging: logs, health checks, correlation ids, retries, Application Insights and diagnostic tools.',
  objectives: [
    'Explain images, containers, registries, layers and why containers solve "works on my machine"',
    'Write a multi-stage Dockerfile for ASP.NET Core and run it with environment variables and ports',
    'Run API + SQL Server + React together with docker compose',
    'Explain CI/CD and build a GitHub Actions workflow that restores, builds, tests, publishes and deploys',
    'Debug production problems with logs, health checks, correlation ids, retries and monitoring tools',
  ],
  theory: [
    {
      heading: 'What is Docker and why containers?',
      content:
        'A container packages your app together with everything it needs (runtime, libraries, OS files, configuration defaults) and runs it isolated from other apps on the same machine. Unlike a virtual machine, a container shares the host\'s operating system kernel, so it starts in seconds and uses little memory. Analogy: shipping containers – the ship does not care what is inside, every container has the same shape. Docker builds and runs containers; the same image runs identically on a laptop, a test server and in the cloud, which ends "it works on my machine".',
      points: [
        'Image = read-only template built from a Dockerfile (like a class)',
        'Container = a running instance of an image (like an object); many containers can run from one image',
        'Registry = image storage: Docker Hub, GitHub Container Registry (ghcr.io), Azure Container Registry',
        'Layers: each Dockerfile instruction creates a cached layer – order instructions from least to most frequently changing',
        'Install Docker Desktop on Windows (uses WSL 2); Linux containers are the default for .NET',
      ],
    },
    {
      heading: 'Dockerfile for ASP.NET Core (multi-stage)',
      content:
        'Microsoft publishes official images: mcr.microsoft.com/dotnet/sdk (big, contains the compiler – used to build) and mcr.microsoft.com/dotnet/aspnet (small, runtime only – used to run). A multi-stage Dockerfile builds in the SDK stage and copies only the publish output into the aspnet stage, so the final image is small and contains no source code or compiler. Since .NET 8 the images listen on port 8080 by default (ASPNETCORE_HTTP_PORTS) and include a non-root user "app". .NET 8+ can even build images without a Dockerfile: dotnet publish /t:PublishContainer.',
      syntax: `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish SchoolApi/SchoolApi.csproj -c Release -o /app
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "SchoolApi.dll"]`,
      points: [
        'docker build -t name:tag .   |   docker run -d -p 8080:8080 -e KEY=value name:tag',
        'docker ps, docker logs -f <name>, docker exec -it <name> bash, docker stop/rm',
        '-p host:container maps ports; -e sets environment variables (ConnectionStrings__DefaultConnection ...)',
        '.dockerignore keeps bin/obj/node_modules/.git out of the build context',
      ],
    },
    {
      heading: 'Docker Compose: multi-container apps',
      content:
        'Real apps need several containers: SQL Server, the API and the React frontend (served by nginx). docker-compose.yml describes all services, their images or build folders, ports, environment variables, volumes and dependencies. Services on the same compose network reach each other by service name, so the API\'s connection string uses Server=sqlserver,1433 – not localhost (inside a container, localhost is the container itself). Volumes keep database files when containers are recreated.',
      syntax: `docker compose up -d --build
docker compose logs -f api
docker compose down          # -v also removes volumes (data!)`,
    },
    {
      heading: 'CI/CD concepts',
      content:
        'Continuous Integration (CI): every push or pull request automatically restores, builds and runs all tests, so broken code is caught within minutes – before it is merged. Continuous Delivery: every successful build produces a deployable artifact (zip or Docker image) that can be released with one click. Continuous Deployment: successful builds on main are deployed automatically. A pipeline is a series of stages; if one fails, later stages are skipped and the author is notified. Tools: GitHub Actions, Azure DevOps Pipelines, GitLab CI, Jenkins.',
      points: [
        'Typical stages: checkout -> restore -> build -> test -> publish artifact -> build/push image -> deploy to staging -> approve -> production',
        'Branch protection: PRs cannot be merged unless the CI checks are green',
        'Secrets (publish profiles, registry passwords) are stored in the CI system, never in the repo',
      ],
    },
    {
      heading: 'GitHub Actions',
      content:
        'GitHub Actions runs workflows defined in YAML files in .github/workflows/. A workflow has triggers (on: push, pull_request, schedule, workflow_dispatch), one or more jobs that run on runners (ubuntu-latest, windows-latest) and steps that either run shell commands (run:) or reuse actions from the Marketplace (uses: actions/checkout@v4, actions/setup-dotnet@v4, azure/webapps-deploy@v3). Jobs run in parallel unless needs: makes them wait. Secrets are read with the expression syntax secrets.NAME inside double curly braces. Results appear in the repo\'s Actions tab and as checks on pull requests.',
    },
    {
      heading: 'Production debugging and monitoring',
      content:
        'In production you cannot press F5. You rely on: structured logging (ILogger with message templates, Serilog to files/Seq/Elastic) written to stdout in containers; correlation/trace ids (HttpContext.TraceIdentifier, Activity.Current.TraceId) included in every log line and returned in error responses so a user\'s complaint can be matched to logs; health checks (/health) used by load balancers, Docker and App Service; Application Insights / OpenTelemetry for requests, dependencies, exceptions and performance; resilience (retries with exponential backoff, timeouts, circuit breakers via Microsoft.Extensions.Http.Resilience / Polly; EF Core EnableRetryOnFailure). For deep issues use dotnet-counters (CPU, GC, requests/sec), dotnet-trace and dotnet-dump (memory dumps), Azure Log stream, Kudu and docker logs.',
      points: [
        'Never return stack traces to clients – log them and return ProblemDetails with a traceId',
        'Log levels: Trace < Debug < Information < Warning < Error < Critical; Production usually Warning+ for framework logs',
        'Reproduce with the same image/config in staging; feature flags help to switch off broken features quickly',
      ],
    },
  ],
  examples: [
    {
      title: 'A container-friendly console worker (env config + stdout logs)',
      scenario:
        'Write a small background worker the way containers expect: settings from environment variables with sensible defaults, logs to standard output, and a clean exit. Then containerize it and override settings with docker run -e.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it SchoolWorker',
        'Replace Program.cs with the code below and press Ctrl+F5 (no environment variables set = defaults)',
        'Right-click the project > Add > Docker Support (or write a Dockerfile using the mcr.microsoft.com/dotnet/runtime:8.0 image)',
        'docker build -t school-worker . then docker run --rm -e SCHOOL_BATCH_SIZE=3 -e SCHOOL_ENV=Staging school-worker',
      ],
      code: workerCode,
      csharp: { files: { 'Program.cs': workerCode }, stdin: '' },
      result: `[info] SchoolWorker starting in Production, batch size 2
[info] batch 1: done send-report:101
[info] batch 1: done send-report:102
[info] batch 2: done resize-photo:7
[error] batch 2: bad-job failed - expected name:id
[info] all jobs processed, exiting with code 0`,
      explanation:
        'With no environment variables, the defaults are used: Production and batch size 2, so 4 jobs run in 2 batches. "bad-job" has no colon, throws FormatException, is logged as an error and the worker continues – one bad message must not crash the container. With -e SCHOOL_BATCH_SIZE=3 the first batch would take 3 jobs. Everything is written to stdout so docker logs, Azure and Kubernetes can collect it.',
    },
    {
      title: 'Dockerizing the ASP.NET Core API',
      scenario:
        'Write a multi-stage Dockerfile for SchoolApi, keep the build context clean with .dockerignore, build the image, run it with port mapping and environment variables, and inspect it with docker logs and docker exec.',
      steps: [
        'Install Docker Desktop and make sure "docker version" works in a terminal',
        'Add SchoolApi/Dockerfile and .dockerignore (or right-click the project > Add > Docker Support)',
        'From the solution folder: docker build -t school-api:1.0 -f SchoolApi/Dockerfile .',
        'docker run ... (see the commands) and open http://localhost:8080/health',
        'docker logs -f school-api while calling the API from Postman',
      ],
      code: dockerfileCode,
      result: `PS> docker build -t school-api:1.0 -f SchoolApi/Dockerfile .
[+] Building 41.2s (14/14) FINISHED
 => [build 3/6] COPY SchoolApi/SchoolApi.csproj SchoolApi/
 => [build 4/6] RUN dotnet restore SchoolApi/SchoolApi.csproj
 => [build 6/6] RUN dotnet publish ...
 => [final 3/3] COPY --from=build /app/publish .
 => naming to docker.io/library/school-api:1.0

PS> docker images school-api
REPOSITORY   TAG   IMAGE ID       SIZE
school-api   1.0   3c5d9e0b1a7f   228MB

PS> docker logs school-api
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://[::]:8080
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Production

GET http://localhost:8080/health -> Healthy`,
      explanation:
        'Only the aspnet runtime stage ends up in the final image (the 800+ MB SDK stage is discarded). Copying the .csproj before the source makes the restore layer reusable: change a .cs file and rebuild – restore is CACHED. -p 8080:8080 maps the host port to the container port; host.docker.internal lets the container reach SQL Server on your PC. Secrets are passed at run time, never baked into the image. Image ids, sizes and timings will differ.',
    },
    {
      title: 'API + SQL Server + React with Docker Compose',
      scenario:
        'Start the complete Student Management System with one command: SQL Server 2022 in a container with a persistent volume, the API connected to it by service name, and the React build served by nginx.',
      steps: [
        'Create docker-compose.yml in the solution folder and the React Dockerfile + nginx.conf in school-react',
        'Run docker compose up -d --build',
        'Connect SSMS to localhost,1433 with user sa to see the SchoolDb database (after migrations)',
        'Open http://localhost:3000 for React and http://localhost:8080/swagger for the API (Development)',
        'Stop with docker compose down',
      ],
      code: composeCode,
      result: `PS> docker compose up -d --build
[+] Running 4/4
 ✔ Network schoolapp_default        Created
 ✔ Container schoolapp-sqlserver-1  Started
 ✔ Container schoolapp-api-1        Started
 ✔ Container schoolapp-web-1        Started

PS> docker compose ps
NAME                    SERVICE     STATUS    PORTS
schoolapp-api-1         api         running   0.0.0.0:8080->8080/tcp
schoolapp-sqlserver-1   sqlserver   running   0.0.0.0:1433->1433/tcp
schoolapp-web-1         web         running   0.0.0.0:3000->80/tcp`,
      explanation:
        'Compose creates a private network where each service name is a DNS name, so the API uses Server=sqlserver,1433. Environment variables with __ configure nested settings, and Cors__AllowedOrigins__0 sets the first array element. depends_on only controls start ORDER, not readiness, so restart: on-failure (or a healthcheck) handles SQL Server\'s slow start. The named volume sqldata keeps the database between "down" and "up" unless you use -v.',
    },
    {
      title: 'GitHub Actions CI/CD pipeline',
      scenario:
        'On every pull request: build and test the API and build the React app. On every push to main: additionally push a Docker image to GitHub Container Registry and deploy the published API to Azure App Service.',
      steps: [
        'Create the folder .github/workflows in the repo and add ci-cd.yml',
        'In Azure portal download the App Service publish profile; in GitHub add it as secret AZURE_WEBAPP_PUBLISH_PROFILE',
        'Commit and push; open the repository\'s Actions tab and watch the jobs run',
        'Open a pull request with a failing test – the check turns red and (with branch protection) the PR cannot be merged',
      ],
      code: actionsCode,
      result: `Actions › SchoolApi CI/CD › #27 (push to main by ravi)
  ✓ build-test   1m 42s
      ✓ Checkout code  ✓ Setup .NET  ✓ Restore  ✓ Build
      ✓ Test (unit + integration)   Passed: 48, Failed: 0
      ✓ Publish  ✓ Upload artifact
  ✓ frontend     58s
  ✓ docker       1m 10s   pushed ghcr.io/ravi/school-api:4f2c9e1...
  ✓ deploy       35s      https://school-api-demo.azurewebsites.net

Pull request #31 "Refactor grade rules"
  ✗ build-test — Test (unit + integration): Failed: 2, Passed: 46
  Merging is blocked: required status check "build-test" has failed`,
      explanation:
        'Each job runs on a fresh Ubuntu VM. build-test and frontend run in parallel; docker and deploy wait (needs: build-test) and run only for pushes, not PRs. The publish output is passed between jobs as an artifact. Secrets are injected at runtime and masked in logs. Because tests run before deploy, a broken change never reaches production. Note: the expressions in the YAML use dollar sign plus double curly braces, e.g. secrets.GITHUB_TOKEN.',
    },
    {
      title: 'Pipeline logic: a failed stage stops the release (simulation)',
      scenario:
        'Model a CI/CD pipeline as a list of stages. Run it for a good commit and for a commit with 2 failing tests and see that Publish and Deploy are skipped.',
      steps: [
        'File > New > Project > Console App, name it PipelineSimulator',
        'Replace Program.cs with the code below and press Ctrl+F5',
        'Change failingTests of the second run to 0 – both runs succeed',
      ],
      code: pipelineCode,
      csharp: { files: { 'Program.cs': pipelineCode }, stdin: '' },
      result: `Pipeline for a1b2c3d 'Add attendance API'
  1. Checkout  OK     commit a1b2c3d
  2. Restore   OK     12 packages restored
  3. Build     OK     0 warnings, 0 errors
  4. Test      OK     48 passed
  5. Publish   OK     artifact school-api.zip
  6. Deploy    OK     deployed to staging
  Result: SUCCESS

Pipeline for e4f5a6b 'Refactor grade rules'
  1. Checkout  OK     commit e4f5a6b
  2. Restore   OK     12 packages restored
  3. Build     OK     0 warnings, 0 errors
  4. Test      FAILED 46 passed, 2 failed
  5. Publish   SKIPPED
  6. Deploy    SKIPPED
  Result: FAILED - nothing deployed, author notified`,
      explanation:
        'Each stage is a (Name, Func) tuple; the lambdas capture sha and failingTests. Once a stage returns Ok = false, the flag makes every later stage SKIPPED – the same behaviour as GitHub Actions steps (later steps do not run after a failure) and jobs connected with needs:. {name,-9} pads stage names so the columns line up.',
    },
    {
      title: 'Production debugging: retries, correlation ids and safe errors',
      scenario:
        'A database call sometimes times out in production. Add retry with exponential backoff for transient failures, include a correlation id in every log line, and when retries give up, log the real error but return only a safe 500 message with the trace id – as UseExceptionHandler does.',
      steps: [
        'File > New > Project > Console App, name it ResilienceDemo',
        'Replace Program.cs with the code below and press Ctrl+F5',
        'In a real API use EnableRetryOnFailure for EF Core, AddStandardResilienceHandler for HttpClient, and HttpContext.TraceIdentifier as the correlation id',
      ],
      code: retryCode,
      csharp: { files: { 'Program.cs': retryCode }, stdin: '' },
      result: `[req-0001] attempt 1 failed: SQL timeout (call 1); retrying in 200 ms
[req-0001] attempt 2 failed: SQL timeout (call 2); retrying in 400 ms
[req-0001] Result: 3 students
[req-0002] attempt 1 failed: SQL server unreachable; retrying in 200 ms
[req-0002] attempt 2 failed: SQL server unreachable; retrying in 400 ms
[req-0002] ERROR TimeoutException: SQL server unreachable
HTTP 500 -> { title: Something went wrong, traceId: req-0002 }`,
      explanation:
        'The exception filter "when (attempt < maxAttempts)" retries only while attempts remain; on the last attempt the exception escapes to the caller. Delays double each time (200, 400, 800 ms) to give the database time to recover without hammering it. Every line carries the correlation id, so support can search the logs for req-0002 after a user reports the error. {{ and }} print literal braces in an interpolated string.',
    },
  ],
  interview: [
    { q: 'What is the difference between an image and a container?', a: 'An image is a read-only, layered template built from a Dockerfile. A container is a running (or stopped) instance of an image with its own writable layer, process and network.', level: 'Easy' },
    { q: 'Container vs virtual machine?', a: 'A VM virtualizes hardware and runs a full guest OS (GBs, minutes to boot). A container shares the host kernel and isolates processes (MBs, starts in seconds). Containers are lighter; VMs give stronger isolation.', level: 'Easy' },
    { q: 'Why use a multi-stage Dockerfile for .NET?', a: 'Build with the large SDK image, then copy only the publish output into the small aspnet runtime image. The final image is smaller, faster to pull and has a smaller attack surface (no SDK, no source).', level: 'Medium' },
    { q: 'Why copy the .csproj and run dotnet restore before copying the rest of the source?', a: 'Docker caches layers. Package restore only re-runs when the .csproj changes, so code-only changes rebuild much faster.', level: 'Medium' },
    { q: 'Inside a compose network, why can\'t the API use Server=localhost for SQL Server?', a: 'localhost inside a container refers to that container itself. Services reach each other by service name (Server=sqlserver,1433).', level: 'Medium' },
    { q: 'What port does an ASP.NET Core 8 container listen on by default?', a: '8080 (ASPNETCORE_HTTP_PORTS=8080). Earlier versions used port 80.', level: 'Medium' },
    { q: 'Explain CI, Continuous Delivery and Continuous Deployment.', a: 'CI: automatically build and test every change. Continuous Delivery: every green build produces a release-ready artifact deployable with one click/approval. Continuous Deployment: every green change on main is deployed automatically.', level: 'Easy' },
    { q: 'What are the building blocks of a GitHub Actions workflow?', a: 'Workflow YAML in .github/workflows with triggers (on), jobs (run on runners, can depend via needs), steps (run commands or uses actions), plus env, secrets, artifacts and environments.', level: 'Medium' },
    { q: 'How do you keep secrets safe in a pipeline?', a: 'Store them as encrypted repository/environment secrets (or use OIDC federated credentials to Azure), reference them via the secrets context, never echo them, and never commit them.', level: 'Medium' },
    { q: 'What is a correlation id and why is it useful?', a: 'A unique id attached to a request and included in all its log entries (and error responses). It lets you find every log line belonging to one user\'s failing request across services.', level: 'Medium' },
    { q: 'Which tools help diagnose a production .NET app that has high CPU or memory?', a: 'dotnet-counters for live metrics, dotnet-trace for CPU traces, dotnet-dump / dotnet-gcdump for memory analysis, Application Insights profiler, plus logs and health checks.', level: 'Hard' },
    { q: 'What is exponential backoff and why add jitter?', a: 'Waiting longer after each failed retry (200, 400, 800 ms…) to let a dependency recover. Random jitter prevents many clients from retrying at exactly the same moments.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a Dockerfile for the SchoolWorker console app using the runtime image, build it and run it twice with different SCHOOL_BATCH_SIZE values.',
      hint: 'Use mcr.microsoft.com/dotnet/sdk:8.0 to publish and mcr.microsoft.com/dotnet/runtime:8.0 to run.',
      solution: `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/runtime:8.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "SchoolWorker.dll"]

# docker build -t school-worker .
# docker run --rm school-worker
# docker run --rm -e SCHOOL_BATCH_SIZE=4 school-worker`,
    },
    {
      task: 'Add a healthcheck to the sqlserver service in docker-compose.yml and make the api wait until it is healthy.',
      hint: 'healthcheck: test: sqlcmd query; depends_on: sqlserver: condition: service_healthy.',
      solution: `  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P Your_Strong_Pwd1 -C -Q 'SELECT 1' || exit 1"]
      interval: 10s
      retries: 10
  api:
    depends_on:
      sqlserver:
        condition: service_healthy`,
    },
    {
      task: 'Create a minimal GitHub Actions workflow that runs dotnet test on windows-latest AND ubuntu-latest for every pull request.',
      hint: 'Use strategy: matrix: os: [ ... ] and runs-on with the matrix expression.',
      solution: `name: tests
on: [pull_request]
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
    runs-on: \${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'
      - run: dotnet test`,
    },
    {
      task: 'Add a correlation-id middleware to the API: read X-Correlation-Id from the request (or create one), add it to the response headers and to a logging scope.',
      hint: 'Use logger.BeginScope(new Dictionary<string, object> { ["CorrelationId"] = id }).',
      solution: `app.Use(async (ctx, next) =>
{
    string id = ctx.Request.Headers.TryGetValue("X-Correlation-Id", out var v) && !string.IsNullOrEmpty(v)
        ? v.ToString()
        : ctx.TraceIdentifier;
    ctx.Response.Headers["X-Correlation-Id"] = id;
    var logger = ctx.RequestServices.GetRequiredService<ILogger<Program>>();
    using (logger.BeginScope(new Dictionary<string, object> { ["CorrelationId"] = id }))
    {
        await next();
    }
});`,
    },
    {
      task: 'Extend the pipeline simulator with a "Manual approval" stage before Deploy that only passes when an approved flag is true.',
      hint: 'Add a parameter bool approved and a stage ("Approval", () => approved ? (true, "approved by lead") : (false, "waiting for approval")).',
      solution: `void RunPipeline(string sha, string message, int failingTests, bool approved)
{
    // ... same as before, add before Deploy:
    // ("Approval", () => approved ? (true, "approved by lead") : (false, "waiting for approval")),
}
RunPipeline("c7d8e9f", "Release 1.2", failingTests: 0, approved: false);
// 6. Approval  FAILED waiting for approval
// 7. Deploy    SKIPPED`,
    },
  ],
  quiz: [
    {
      question: 'Which base image should the FINAL stage of an ASP.NET Core Dockerfile use?',
      options: ['mcr.microsoft.com/dotnet/sdk', 'mcr.microsoft.com/dotnet/aspnet', 'node:20', 'mcr.microsoft.com/mssql/server'],
      answer: 1,
      explanation: 'The aspnet image contains only the ASP.NET Core runtime, keeping the final image small.',
    },
    {
      question: 'What does "docker run -p 5000:8080 school-api" do?',
      options: ['Maps host port 5000 to container port 8080', 'Maps host port 8080 to container port 5000', 'Runs 5000 containers', 'Sets the environment to port 8080 only inside the image'],
      answer: 0,
      explanation: 'The format is -p HOST:CONTAINER.',
    },
    {
      question: 'Where are GitHub Actions workflow files stored?',
      options: ['/workflows', '.github/actions.json', 'appsettings.json', '.github/workflows/*.yml'],
      answer: 3,
      explanation: 'GitHub reads YAML files from the .github/workflows folder.',
    },
    {
      question: 'In a CI pipeline the Test stage fails. What should happen next?',
      options: ['Deploy anyway', 'Skip later stages such as publish and deploy and report the failure', 'Delete the repository', 'Retry forever'],
      answer: 1,
      explanation: 'A failed stage stops the pipeline so broken code never reaches production.',
    },
    {
      question: 'Which is the BEST way for a user\'s bug report to be matched with server logs?',
      options: ['Ask the user for the exact time only', 'Return the full stack trace to the user', 'Return a trace/correlation id in the error response and log it with every entry', 'Enable Debug logging forever'],
      answer: 2,
      explanation: 'A correlation id links the user-visible error to all related log entries without exposing internals.',
    },
  ],
};
