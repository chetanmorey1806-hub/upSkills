export default {
  lesson: 'day-118-docker-cicd-github-actions',
  minutes: 30,
  intro: 'Containerise an ASP.NET Core API with a multi-stage Dockerfile, run it with port mapping and automate build-test-deploy with a GitHub Actions workflow.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: 'In a multi-stage Dockerfile, the **final** stage should be based on the small runtime image (not the SDK). Complete it:\n```\nFROM mcr.microsoft.com/dotnet/sdk:8.0 AS build\nWORKDIR /src\nCOPY . .\nRUN dotnet publish -c Release -o /app\n\nFROM ______ AS final\nWORKDIR /app\nCOPY --from=build /app .\nENTRYPOINT ["dotnet", "StudentApi.dll"]\n```',
      example: { title: 'the SDK image (build stage only)', code: 'FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build' },
      accept: ['mcr.microsoft.com/dotnet/aspnet:8.0'],
      acceptRegex: ['^mcr\\.microsoft\\.com/dotnet/aspnet:8\\.0(-[a-z0-9.-]+)?$'],
      explain: 'The **sdk** image (compilers, ~700 MB) builds the app; the **aspnet** runtime image (~200 MB) runs it. Multi-stage builds copy only the published output, giving smaller and safer images.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'The container listens on port 8080. Complete the command so `http://localhost:5000` on your machine reaches it:\n`docker run -d -p ______ --name student-api student-api:1.0`',
      example: { title: 'building the image', code: 'docker build -t student-api:1.0 .' },
      accept: ['5000:8080'],
      explain: 'Port mapping is `-p HOST:CONTAINER`. .NET 8 images listen on 8080 by default. Writing `8080:5000` is the classic mistake (it maps the wrong way round).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about Docker are TRUE? (choose all that apply)',
      options: [
        'An image is a read-only template; a container is a running instance of an image',
        'A .dockerignore with bin/ obj/ keeps the build context small',
        'Configuration such as connection strings can be passed with -e ConnectionStrings__Default=...',
        'Data written inside a container survives docker rm even without a volume',
        'docker compose can start the API and a SQL Server container together',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Images vs containers, small build context, configuration through environment variables and compose for multi-container setups. Data inside a container is lost when the container is removed - persistent data needs a **volume** (or a managed database).',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A developer pushes a commit to the branch `feature/login` (no pull request). Which **jobs** of this workflow run? Type their names one per line in order, or `none`.',
      example: { title: 'job dependencies', code: 'deploy:\n  needs: build   # runs only after build succeeds' },
      code: `name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: '8.0.x' }
      - run: dotnet test
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo deploying`,
      expected: 'none',
      explain: 'The workflow triggers only on pushes to **main** and on pull requests targeting main. A plain push to `feature/login` matches neither, so nothing runs. Opening a PR to main would run `build` (but not `deploy`, because `github.ref` is not main).',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the workflow key that chooses the virtual machine a job runs on:\n```\njobs:\n  build:\n    ______: ubuntu-latest\n```',
      example: { title: 'a Windows runner', code: 'runs-on: windows-latest' },
      accept: ['runs-on', 'runs-on:'],
      caseSensitive: true,
      explain: '`runs-on` selects the GitHub-hosted runner. Each job gets a clean VM, so steps must check out the code (`actions/checkout`) and install the SDK (`actions/setup-dotnet`) every time.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'The deploy step needs the Azure publish profile. Where should it be stored?',
      options: ['Directly in the YAML file', 'In GitHub repository Secrets, used as ${{ secrets.AZURE_PUBLISH_PROFILE }}', 'In appsettings.json', 'In the README'],
      answer: 1,
      explain: 'Secrets are encrypted, hidden in logs and never committed. Anything in the YAML or repo files is visible to everyone with read access.',
    },
  ],
};
