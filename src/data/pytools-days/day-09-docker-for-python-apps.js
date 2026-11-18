export default {
  id: "day-09-docker-for-python-apps",
  title: "Docker for Python Apps: Dockerfile, Images, Containers and Compose",
  module: "Module 3: Production",
  day: 9,
  level: "Advanced",
  duration: "4 hours",
  summary: "Package a Python web app and all its dependencies into a Docker image that runs the same on every laptop and server. Write efficient Dockerfiles, manage containers, volumes and networks, and run a Flask/FastAPI + Postgres + Redis stack with docker compose.",
  objectives: [
    "Explain images, containers, layers and registries and how Docker differs from a virtual machine",
    "Write a production-friendly Dockerfile for a Python app using a slim base image and layer caching",
    "Use .dockerignore, environment variables and a non-root user",
    "Build, run, inspect, log into and clean up containers with the Docker CLI",
    "Run a multi-container app (web + Postgres + Redis) with docker compose, volumes and healthchecks",
    "Answer common Docker interview questions confidently",
  ],
  theory: [
    {
      heading: "What Problem Does Docker Solve?",
      content: "\"It works on my machine\" is the classic developer problem. Your laptop has Python 3.12, the server has 3.10; you have libpq installed, the teammate does not. **Docker** packages your code together with the exact Python version, system libraries and pip packages into an **image**. That image runs identically on any machine that has Docker: your laptop, a CI runner, AWS, Render or Kubernetes.\n\nA **container** is a running instance of an image. Containers are isolated processes that share the host's Linux kernel, so they start in about a second and use far less memory than virtual machines, which each boot a full guest operating system.",
      points: [
        "Image: read-only template (like a class). Container: running instance (like an object)",
        "Dockerfile: text recipe that builds an image step by step",
        "Registry: store for images - Docker Hub, GitHub Container Registry (ghcr.io), AWS ECR",
        "Docker Desktop on Windows/macOS runs containers inside a lightweight Linux VM (WSL 2 on Windows)",
        "VM = hardware virtualization, own kernel, GBs, minutes to boot; Container = OS-level isolation, shared kernel, MBs, seconds",
      ],
    },
    {
      heading: "Dockerfile Instructions",
      content: "Each instruction in a Dockerfile creates a **layer**. Docker caches layers, and if nothing changed in a step (and the steps before it), it reuses the cached layer. This is why order matters: put things that rarely change (installing requirements) before things that change often (your source code).",
      points: [
        "FROM python:3.12-slim - base image (slim = Debian minus extras, ~45 MB compressed; avoid alpine for Python because many wheels need glibc)",
        "WORKDIR /app - sets and creates the working directory",
        "COPY requirements.txt . - copies files from build context into the image",
        "RUN pip install --no-cache-dir -r requirements.txt - runs a command at build time",
        "ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 - set environment variables (unbuffered = logs appear immediately)",
        "EXPOSE 8000 - documents the port (does not publish it)",
        "USER appuser - run as a non-root user for security",
        "CMD [\"gunicorn\", ...] - default command when the container starts (exec form, JSON array)",
        "ENTRYPOINT - fixed executable; CMD then supplies default arguments",
        "ARG - build-time variable; ENV - variable available at build and run time",
      ],
      tip: "Use the exec form CMD [\"python\", \"app.py\"] rather than shell form CMD python app.py, so your app is PID 1 and receives SIGTERM for graceful shutdown.",
    },
    {
      heading: "Essential Docker CLI Commands",
      content: "These commands cover 90% of daily Docker work. The `-t` flag tags an image with name:version; `-p host:container` publishes a port; `-d` runs in the background; `--rm` deletes the container when it stops; `-e` sets an env var; `-v` mounts a volume.",
      syntax: `docker build -t shop-api:1.0 .           # build image from Dockerfile in current folder
docker images                             # list images
docker run -d --name api -p 8000:8000 --env-file .env shop-api:1.0
docker ps            # running containers   (docker ps -a = include stopped)
docker logs -f api                        # follow logs
docker exec -it api bash                  # shell inside a running container (use sh for slim/alpine without bash)
docker stop api && docker rm api
docker rmi shop-api:1.0                   # remove image
docker system prune                       # remove unused containers, networks, dangling images
docker tag shop-api:1.0 ghcr.io/asha/shop-api:1.0
docker push ghcr.io/asha/shop-api:1.0`,
    },
    {
      heading: ".dockerignore, Environment Variables and Secrets",
      content: "When you run `docker build .`, the whole folder (the **build context**) is sent to Docker. A `.dockerignore` file excludes things you never want in the image: virtual environments, git history, caches and secrets. This makes builds faster and images smaller and safer.\n\nConfiguration should come from environment variables at **run time** (`-e`, `--env-file`, compose `environment:`), not be baked into the image. Never put passwords in the Dockerfile with ENV or ARG: anyone with the image can read them with `docker history` or `docker inspect`.",
      syntax: `# .dockerignore
.venv/
__pycache__/
*.pyc
.git/
.env
.pytest_cache/
.mypy_cache/
node_modules/
*.sqlite3
Dockerfile
docker-compose.yml`,
    },
    {
      heading: "Volumes and Networks",
      content: "A container's filesystem is temporary: delete the container and its data is gone. For databases and uploaded files use **volumes**. A named volume (`pgdata:/var/lib/postgresql/data`) is managed by Docker and survives container removal. A **bind mount** (`./src:/app/src`) maps a host folder into the container, which is handy in development for live code reload.\n\nContainers talk to each other over Docker **networks**. Compose automatically creates one network per project, and each service is reachable by its **service name** as hostname. So the web container connects to Postgres at host `db`, not `localhost`. Inside a container, `localhost` means the container itself.",
      points: [
        "docker volume ls / docker volume rm <name>",
        "docker compose down keeps named volumes; docker compose down -v deletes them (data loss!)",
        "Use bind mounts for dev code, named volumes for database data",
      ],
      tip: "The #1 beginner bug: DATABASE_URL=postgresql://...@localhost:5432/... inside a container. Use the service name, e.g. @db:5432.",
    },
    {
      heading: "Docker Compose for Multi-Container Apps",
      content: "Real apps need several services: the web app, Postgres, Redis, a Celery worker. **Docker Compose** describes them all in one `compose.yaml` (or `docker-compose.yml`) and starts them with one command. Compose v2 is built into Docker as `docker compose` (with a space); the old `docker-compose` Python tool is deprecated, and the top-level `version:` key is no longer needed.",
      syntax: `docker compose up -d --build     # build images and start all services
docker compose ps                # status
docker compose logs -f web       # logs of one service
docker compose exec web python manage.py migrate
docker compose run --rm web pytest
docker compose down              # stop and remove containers + network`,
      points: [
        "depends_on with condition: service_healthy waits for the DB healthcheck, not just container start",
        "restart: unless-stopped restarts crashed services automatically",
        "Compose reads a .env file in the same folder for variable substitution like \${POSTGRES_PASSWORD}",
      ],
    },
    {
      heading: "Image Size, Multi-Stage Builds and Security",
      content: "Smaller images build, push and deploy faster and have fewer vulnerabilities. Use `python:3.12-slim`, `pip install --no-cache-dir`, combine apt commands and clean apt lists in the same RUN, and use **multi-stage builds**: a first stage with compilers builds wheels, and the final stage copies only the wheels/virtualenv, leaving build tools behind.",
      points: [
        "Pin versions: python:3.12-slim (or a specific patch tag) and pinned requirements.txt",
        "Run as non-root (USER appuser)",
        "Scan images: docker scout cves shop-api:1.0 or trivy image shop-api:1.0",
        "Add a HEALTHCHECK or use the platform's health checks",
        "One process per container: web and Celery worker are separate containers from the same image",
        "Use gunicorn/uvicorn in containers, never Flask/Django development servers",
      ],
    },
  ],
  examples: [
    {
      title: "Dockerize a FastAPI App",
      scenario: "A small FastAPI service must run identically on every developer's laptop and on the server.",
      steps: [
        "Install Docker Desktop (Windows/macOS) or Docker Engine (Linux) and check: docker --version",
        "Create a folder with main.py, requirements.txt, Dockerfile and .dockerignore as below",
        "Build: docker build -t hello-api:1.0 .",
        "Run: docker run -d --name hello -p 8000:8000 hello-api:1.0",
        "Open http://localhost:8000/ and http://localhost:8000/docs, then: docker logs hello",
      ],
      code: `# main.py
import os
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Hello from Docker", "env": os.getenv("APP_ENV", "dev")}

# requirements.txt
fastapi==0.115.6
uvicorn[standard]==0.34.0

# Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
      result: `$ docker build -t hello-api:1.0 .
 => [4/6] RUN pip install --no-cache-dir -r requirements.txt
 => naming to docker.io/library/hello-api:1.0
$ docker run -d --name hello -p 8000:8000 -e APP_ENV=docker hello-api:1.0
$ curl http://localhost:8000/
{"message":"Hello from Docker","env":"docker"}`,
      explanation: "requirements.txt is copied and installed before the source code, so editing main.py and rebuilding reuses the cached pip layer and builds in seconds. --host 0.0.0.0 is required: if uvicorn binds to 127.0.0.1 inside the container, it is unreachable from outside. -p 8000:8000 maps host port 8000 to the container port. The app runs as a non-root user.",
    },
    {
      title: "Flask + Postgres + Redis with Docker Compose",
      scenario: "A Flask shop app needs a Postgres database and Redis cache. New team members should start everything with one command.",
      steps: [
        "Create a .env file with POSTGRES_PASSWORD=devpass (and add .env to .gitignore)",
        "Create compose.yaml as below next to your Dockerfile",
        "Run: docker compose up -d --build",
        "Check: docker compose ps (db should show healthy)",
        "Create tables: docker compose exec web flask db upgrade",
        "Stop: docker compose down (data stays in the pgdata volume)",
      ],
      code: `# compose.yaml
services:
  web:
    build: .
    command: gunicorn -w 3 -b 0.0.0.0:8000 "app:create_app()"
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+psycopg://shop:\${POSTGRES_PASSWORD}@db:5432/shop
      REDIS_URL: redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: shop
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: shop
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U shop -d shop"]
      interval: 5s
      timeout: 3s
      retries: 10

  redis:
    image: redis:7-alpine

volumes:
  pgdata:`,
      result: `$ docker compose up -d --build
[+] Running 5/5
 ✔ Network shop_default      Created
 ✔ Volume "shop_pgdata"      Created
 ✔ Container shop-redis-1    Started
 ✔ Container shop-db-1       Healthy
 ✔ Container shop-web-1      Started
$ docker compose ps
NAME          SERVICE   STATUS                   PORTS
shop-db-1     db        Up 20 seconds (healthy)  5432/tcp
shop-redis-1  redis     Up 20 seconds            6379/tcp
shop-web-1    web       Up 8 seconds             0.0.0.0:8000->8000/tcp`,
      explanation: "Compose creates a shared network, so web reaches Postgres at host db and Redis at host redis. ${POSTGRES_PASSWORD} is substituted from the .env file, keeping the secret out of compose.yaml. The healthcheck plus condition: service_healthy makes web wait until Postgres actually accepts connections. Only web publishes a port; db and redis stay private to the network. The named volume pgdata keeps the data across restarts.",
    },
    {
      title: "Multi-Stage Build for a Smaller Django Image",
      scenario: "The Django image is 1.1 GB because psycopg needs build tools. We want to ship only what is needed at runtime.",
      steps: [
        "Replace the Dockerfile with the multi-stage version below",
        "Build: docker build -t shop-web:2.0 .",
        "Compare sizes: docker images | grep shop-web",
        "Run collectstatic and migrations as separate commands in CI or a release step",
      ],
      code: `# ---- Stage 1: builder ----
FROM python:3.12-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \\
        build-essential libpq-dev \\
    && rm -rf /var/lib/apt/lists/*
WORKDIR /build
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# ---- Stage 2: runtime ----
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 \\
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels
COPY . .
RUN python manage.py collectstatic --noinput \\
    && useradd --create-home django && chown -R django /app
USER django
EXPOSE 8000
CMD ["gunicorn", "shop.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]`,
      result: `$ docker images | grep shop-web
shop-web   2.0   9c1e2f3a4b5c   10 seconds ago   245MB
shop-web   1.0   1a2b3c4d5e6f   2 days ago       1.12GB`,
      explanation: "Compilers and header files exist only in the builder stage. The final stage starts again from a clean slim image and copies only prebuilt wheels, plus the small runtime library libpq5. apt lists are deleted in the same RUN so they never land in a layer. (Exact sizes vary with your dependencies.) If collectstatic needs settings like SECRET_KEY, give it a dummy build-time value via your settings, never a real secret.",
    },
    {
      title: "Debugging a Container That Will Not Start",
      scenario: "After docker run the container exits immediately and the site does not open. We investigate step by step.",
      steps: [
        "List all containers including stopped ones: docker ps -a",
        "Read the logs: docker logs api",
        "Inspect the exit code and environment: docker inspect api --format '{{.State.ExitCode}}'",
        "Start an interactive shell from the same image to test: docker run --rm -it shop-api:1.0 sh",
        "Fix the problem, rebuild and run again",
      ],
      code: `$ docker ps -a
CONTAINER ID  IMAGE          STATUS                     NAMES
4f2a91c0d7e1  shop-api:1.0   Exited (1) 5 seconds ago   api

$ docker logs api
psycopg.OperationalError: connection failed: connection to server at
"127.0.0.1", port 5432 failed: Connection refused

# Cause: DATABASE_URL used localhost. Inside a container, localhost = the container itself.
# Fix in .env:
DATABASE_URL=postgresql+psycopg://shop:devpass@db:5432/shop

$ docker compose up -d --build web`,
      result: `$ docker compose logs web
web-1  | [INFO] Starting gunicorn 23.0.0
web-1  | [INFO] Listening at: http://0.0.0.0:8000
web-1  | [INFO] Booting worker with pid: 7`,
      explanation: "Exited (1) means the main process crashed. docker logs shows stdout/stderr (visible immediately because PYTHONUNBUFFERED=1). The classic mistakes are: using localhost for another container, binding the server to 127.0.0.1 instead of 0.0.0.0, a missing env var, or a wrong CMD path. docker run -it ... sh lets you poke around the image to check files and installed packages.",
    },
  ],
  interview: [
    {
      q: "What is the difference between a Docker image and a container?",
      a: "An image is a read-only, layered template containing the OS libraries, Python, dependencies and code. A container is a running (or stopped) instance of an image with its own writable layer, process space and network. One image can start many containers - like a class and its objects.",
      level: "Easy",
    },
    {
      q: "How is a container different from a virtual machine?",
      a: "A VM virtualizes hardware and runs a full guest OS with its own kernel, so it is heavy (GBs) and slow to boot. A container is an isolated process using Linux namespaces and cgroups that shares the host kernel, so it is light (MBs) and starts in about a second. VMs give stronger isolation; containers give density and speed.",
      level: "Easy",
    },
    {
      q: "Why do we copy requirements.txt and run pip install before copying the rest of the code?",
      a: "Layer caching. Docker reuses a cached layer when the instruction and its inputs have not changed. Dependencies change rarely, code changes often. Installing requirements first means a code-only change rebuilds only the final COPY layer instead of reinstalling every package.",
      level: "Medium",
    },
    {
      q: "What is the difference between CMD and ENTRYPOINT? And RUN?",
      a: "RUN executes at build time and creates a layer (e.g. pip install). CMD sets the default command when a container starts and can be overridden by arguments to docker run. ENTRYPOINT sets the fixed executable; CMD then provides default arguments to it. Prefer the exec (JSON array) form so the process is PID 1 and receives signals.",
      level: "Medium",
    },
    {
      q: "What is the difference between EXPOSE and -p?",
      a: "EXPOSE only documents which port the app listens on inside the container. `-p 8080:8000` (or compose ports:) actually publishes the container port 8000 on host port 8080 so it is reachable from outside.",
      level: "Easy",
    },
    {
      q: "Why does my Flask app in Docker work inside the container but not from the browser?",
      a: "Most likely it binds to 127.0.0.1 (Flask's default), which is only reachable inside the container. Bind to 0.0.0.0 (flask run --host=0.0.0.0, or gunicorn -b 0.0.0.0:8000) and publish the port with -p.",
      level: "Medium",
    },
    {
      q: "How do containers in Docker Compose communicate?",
      a: "Compose creates a user-defined bridge network for the project. Each service is registered in Docker's internal DNS by its service name, so the web service connects to db:5432 or redis:6379. Ports do not need to be published for container-to-container traffic.",
      level: "Medium",
    },
    {
      q: "How do you persist database data in Docker?",
      a: "Mount a named volume at the database's data directory, e.g. `pgdata:/var/lib/postgresql/data`. Volumes live outside the container's writable layer, so data survives docker compose down and container recreation. Be careful: `docker compose down -v` deletes the volumes.",
      level: "Easy",
    },
    {
      q: "What does depends_on guarantee? How do you wait for Postgres to be ready?",
      a: "Plain depends_on only controls start order; Postgres may still be initializing when the web container starts. Add a healthcheck (pg_isready) to db and use `depends_on: db: condition: service_healthy`. The app should also retry DB connections, because in production databases restart too.",
      level: "Hard",
    },
    {
      q: "How do you reduce the size of a Python Docker image?",
      a: "Use python:3.12-slim, install with --no-cache-dir, use a .dockerignore, install only runtime system packages and clean apt lists in the same RUN, use multi-stage builds to keep compilers out of the final image, and do not install dev/test dependencies in production images.",
      level: "Medium",
    },
    {
      q: "How should you handle secrets with Docker?",
      a: "Never bake them into the image with ENV/ARG or COPY .env, since image layers and history can be read. Provide them at run time via environment variables from the platform's secret store, --env-file, compose secrets, or Docker/Kubernetes secrets mounted as files. Keep .env in .dockerignore and .gitignore. For build-time secrets use BuildKit --secret mounts.",
      level: "Hard",
    },
    {
      q: "Why should a container run as a non-root user and handle SIGTERM?",
      a: "If an attacker exploits the app, root inside the container makes escaping or damaging mounted files easier, so USER appuser limits impact. On docker stop, Docker sends SIGTERM to PID 1 and kills it after 10 seconds. Using exec-form CMD and servers like gunicorn ensures graceful shutdown - finishing in-flight requests - instead of abrupt kills.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Write a Dockerfile for a Flask app (app.py with `app = Flask(__name__)`) that installs requirements with caching in mind, runs as a non-root user and starts with gunicorn on port 5000. Also write the build and run commands.",
      hint: "FROM python:3.12-slim, copy requirements first, CMD exec form with gunicorn -b 0.0.0.0:5000 app:app.",
      solution: `# Dockerfile
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd --create-home web
USER web
EXPOSE 5000
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5000", "app:app"]

# requirements.txt
# flask==3.1.0
# gunicorn==23.0.0

# commands
# docker build -t flask-demo:1.0 .
# docker run -d --name flask-demo -p 5000:5000 flask-demo:1.0
# curl http://localhost:5000/
`,
    },
    {
      task: "Create a .dockerignore for a typical Django project and explain why each line is there.",
      hint: "Think about virtualenvs, caches, git, local DB, secrets.",
      solution: `.venv/           # local virtualenv - image installs its own packages
__pycache__/     # compiled bytecode, regenerated anyway
*.pyc
.git/            # history is large and not needed at runtime
.env             # secrets must not be baked into the image
db.sqlite3       # local dev database
media/           # user uploads belong in a volume or S3
staticfiles/     # rebuilt by collectstatic inside the image
.pytest_cache/
.coverage
htmlcov/
`,
    },
    {
      task: "Write a compose.yaml with three services: web (built from the current folder, port 8000), worker (same image, runs a Celery worker) and redis. The web and worker must use REDIS_URL pointing to the redis service.",
      hint: "Both web and worker use build: . with different command values.",
      solution: `services:
  web:
    build: .
    command: uvicorn main:app --host 0.0.0.0 --port 8000
    ports:
      - "8000:8000"
    environment:
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - redis

  worker:
    build: .
    command: celery -A tasks worker --loglevel=INFO
    environment:
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - redis

  redis:
    image: redis:7-alpine

# docker compose up -d --build
# docker compose logs -f worker
`,
    },
    {
      task: "Your container keeps exiting. Write the sequence of Docker commands you would use to find the cause, and list three common causes for Python apps.",
      hint: "ps -a, logs, inspect, run -it sh.",
      solution: `docker ps -a                                   # see status and exit code
docker logs <name>                             # read the traceback
docker inspect <name> --format '{{.State.ExitCode}} {{.Config.Cmd}}'
docker run --rm -it --entrypoint sh <image>    # explore the image manually
docker compose config                          # check final compose values after substitution

Common causes:
1. Missing env var / wrong DATABASE_URL (using localhost instead of the service name)
2. Server bound to 127.0.0.1 or wrong module path in CMD (e.g. main:app vs app.main:app)
3. Dependency missing from requirements.txt (works locally because it is installed in your venv)
`,
    },
  ],
  quiz: [
    {
      question: "Which instruction runs during the image BUILD, not when the container starts?",
      options: ["CMD", "ENTRYPOINT", "RUN", "EXPOSE"],
      answer: 2,
      explanation: "RUN executes at build time and creates a layer; CMD/ENTRYPOINT run at container start.",
    },
    {
      question: "In docker run -p 8080:8000 api, what does 8080 refer to?",
      options: ["Container port", "Host port", "Postgres port", "Docker daemon port"],
      answer: 1,
      explanation: "The format is host:container, so host 8080 forwards to container port 8000.",
    },
    {
      question: "Inside Compose, how should the web service reach a Postgres service named db?",
      options: ["localhost:5432", "127.0.0.1:5432", "db:5432", "postgres.local:5432"],
      answer: 2,
      explanation: "Services resolve each other by service name on the Compose network.",
    },
    {
      question: "Why copy requirements.txt and install packages before COPY . . ?",
      options: ["Docker requires it", "To use layer caching so code changes do not reinstall packages", "To make the container run as root", "To reduce the number of volumes"],
      answer: 1,
      explanation: "The pip layer stays cached unless requirements.txt changes.",
    },
    {
      question: "Which command removes containers AND named volumes of a Compose project?",
      options: ["docker compose stop", "docker compose down", "docker compose down -v", "docker compose rm"],
      answer: 2,
      explanation: "The -v flag deletes named volumes too, which deletes database data.",
    },
    {
      question: "Which base image is generally recommended for Python apps that need compiled wheels?",
      options: ["python:3.12-alpine", "python:3.12-slim", "ubuntu:latest with Python compiled from source", "scratch"],
      answer: 1,
      explanation: "slim is small and uses glibc, so manylinux wheels install without compiling; alpine uses musl and often forces slow source builds.",
    },
  ],
};
