export default {
  lesson: 'day-27-docker-aspnet-core-compose',
  minutes: 25,
  intro: 'Practise multi-stage Dockerfiles, layer caching, environment configuration and docker compose with SQL Server, Redis, volumes and health checks.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which image should the FINAL stage of the Placement API Dockerfile use?',
      options: ['mcr.microsoft.com/dotnet/sdk:8.0', 'mcr.microsoft.com/dotnet/aspnet:8.0', 'mcr.microsoft.com/mssql/server:2022-latest', 'redis:7-alpine'],
      answer: 1,
      explain: 'The aspnet image has only the ASP.NET Core runtime (about 220 MB). The SDK image is needed only to build and publish, so it stays in the build stage. Shipping the SDK makes the image about 4x bigger and gives attackers more tools.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the line that copies the published output from the build stage into the runtime stage:
\`\`\`
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --______=build /app/publish .
\`\`\``,
      example: { title: 'Stage names', code: `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build   # "build" is the stage name` },
      accept: ['from'],
      caseSensitive: true,
      explain: '`COPY --from=<stage>` copies files from an earlier stage (or another image) instead of from the build context. This is what makes multi-stage builds small: only `/app/publish` crosses over, and the SDK and source code do not.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'You already built this image once. Now you edit only `Controllers/StudentsController.cs` and build again. For each step 1-6 write **CACHED** or **REBUILT**, one per line.',
      example: { title: 'Cache rule', text: 'Docker reuses a layer if the instruction and its inputs are unchanged AND every earlier layer was reused. From the first changed step onward, everything is rebuilt.' },
      code: `# 1
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# 2
WORKDIR /src
# 3
COPY ["Placement.Api/Placement.Api.csproj", "Placement.Api/"]
# 4
RUN dotnet restore "Placement.Api/Placement.Api.csproj"
# 5
COPY . .
# 6
RUN dotnet publish "Placement.Api/Placement.Api.csproj" -c Release -o /app/publish`,
      expected: `CACHED
CACHED
CACHED
CACHED
REBUILT
REBUILT`,
      explain: 'The .csproj did not change, so steps 1-4 (including the slow restore) are reused. `COPY . .` includes the edited controller, so its checksum changes and step 5 is rebuilt, and step 6 after it too. That is exactly why the .csproj is copied and restored BEFORE `COPY . .`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'appsettings.json has `"ConnectionStrings": { "PlacementDb": "..." }`. Write the **environment variable name** that overrides it inside a Linux container.',
      example: { title: 'Pattern', code: `"Jwt": { "Issuer": "..." }   ->   Jwt__Issuer=...` },
      accept: ['ConnectionStrings__PlacementDb'],
      explain: 'Configuration sections are joined with `:` in .NET, but `:` is not allowed in Linux environment variable names, so ASP.NET Core maps a double underscore `__` to `:`. A single underscore (ConnectionStrings_PlacementDb) does not work, which is a very common bug that causes a null connection string.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Make the API wait until SQL Server's healthcheck passes, not just until its container has started:
\`\`\`
  api:
    depends_on:
      sqlserver:
        condition: ______
\`\`\``,
      example: { title: 'Healthcheck on the dependency', code: `  redis:
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]` },
      accept: ['service_healthy'],
      caseSensitive: true,
      explain: '`service_healthy` waits for the dependency\'s healthcheck to report healthy. The default (`service_started`) only waits for the container to start, and SQL Server needs 10-30 seconds more before it accepts logins, so the first EF Core migration would fail.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements about this compose setup are TRUE? (services: `api`, `sqlserver` with volume `sqldata:/var/opt/mssql`, `redis`). Select all that apply.',
      options: [
        'The API connects with `Server=sqlserver,1433` because compose provides DNS by service name',
        'The API can use `Server=localhost,1433` because all containers share localhost',
        '`docker compose down` keeps the `sqldata` volume, so the database survives',
        '`docker compose down -v` deletes the `sqldata` volume',
        '`EXPOSE 8080` in the Dockerfile publishes the API on the host automatically',
      ],
      answers: [0, 2, 3],
      explain: 'Each container has its own localhost, so other services are reached by their service name. `down` removes containers and networks but keeps named volumes, while `down -v` removes volumes too (data lost). EXPOSE is only documentation. Publishing needs `ports: - "5080:8080"` or `-p`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Where should the SQL Server sa password for the API container come from?',
      options: [
        '`ENV ConnectionStrings__PlacementDb=...Password=...` in the Dockerfile',
        'A `COPY appsettings.Production.json` that contains it',
        'At run time: compose `environment` filled from a git-ignored `.env`, `--env-file`, a K8s Secret or Key Vault',
        'Hard-coded in Program.cs',
      ],
      answer: 2,
      explain: 'Anything put into an image with ENV or COPY can be read by anyone who pulls the image (`docker history`, `docker inspect`). Secrets must be injected when the container starts, and the files that hold them must be excluded from Git and from the build context (.dockerignore).',
    },
  ],
};
