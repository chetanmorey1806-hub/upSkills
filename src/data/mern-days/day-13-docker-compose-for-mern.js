export default {
  id: 'day-13-docker-compose-for-mern',
  title: 'Docker and Docker Compose for MERN: Client, Server, MongoDB, Redis and Production Builds',
  module: 'Module 4: Production',
  day: 13,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Package the React client and Express server into small, secure Docker images with multi-stage builds, then run the whole MERN stack (client, server, MongoDB, Redis) with one docker compose command for development and production-like environments.',
  objectives: [
    'Explain images, containers, layers, volumes and networks in the context of a MERN app',
    'Write a production Dockerfile for the Express API (Node 22 alpine, npm ci --omit=dev, non-root user, healthcheck)',
    'Build the React app with Vite in a multi-stage Dockerfile and serve it with Nginx, proxying /api to the server',
    'Write docker-compose.yml with mongo, redis, server and client services, named volumes, env files, healthchecks and depends_on',
    'Use compose for development (bind mounts / compose watch) and debug containers with logs, exec and ps',
  ],
  theory: [
    {
      heading: 'Why Docker for a MERN project?',
      content:
        '"It works on my machine" happens because every laptop and server has a different Node version, MongoDB version and OS. **Docker** packages your app together with its runtime and dependencies into an **image**. Anyone can run that image as a **container** and get the same behaviour on Windows, macOS, Linux, CI and the cloud.\n\nAnalogy: shipping containers. Before them, every ship loaded goods differently. With standard containers, the same box goes from truck to ship to train without unpacking. A Docker image is that standard box for software.\n\nKey terms:\n\n- **Image**: a read-only template built from a `Dockerfile` (like a class).\n- **Container**: a running instance of an image (like an object). You can run many containers from one image.\n- **Layer**: each Dockerfile instruction creates a cached layer. Order instructions so that rarely-changing steps (installing dependencies) come before frequently-changing ones (copying source code).\n- **Volume**: storage that lives outside the container, so MongoDB data survives `docker compose down`.\n- **Network**: compose creates a private network where services reach each other by **service name** (`mongodb://mongo:27017`, `redis://redis:6379`).\n- **Registry**: where images are stored (Docker Hub, GitHub Container Registry ghcr.io, AWS ECR).',
      points: [
        'New teammate setup becomes: install Docker, run docker compose up',
        'Same image runs in CI, staging and production',
        'Render, Railway, Fly.io, AWS ECS and Kubernetes all run Docker images',
        'Docker is not a virtual machine: containers share the host kernel, so they start in seconds and use less memory',
      ],
    },
    {
      heading: 'A production Dockerfile for the Express API',
      content:
        'Good Node images follow these rules:\n\n1. **Small official base**: `node:22-alpine` (about 50 MB compressed) instead of `node:22` (about 400 MB).\n2. **Copy package files first**, run `npm ci`, then copy the source. Docker reuses the cached dependency layer when only your code changes, so rebuilds take seconds.\n3. **Production dependencies only**: `npm ci --omit=dev` (no Jest, nodemon, ESLint in production).\n4. **Run as non-root**: the official image has a `node` user; use `USER node` so a hacked process cannot control the container as root.\n5. **`.dockerignore`**: exclude `node_modules`, `.env`, `.git`, tests and logs, so secrets and junk never enter the image.\n6. **Start with `node`, not `npm start`**: `CMD ["node", "src/server.js"]` so the Node process receives SIGTERM directly and can shut down gracefully.\n7. **HEALTHCHECK** or a platform health check URL so the orchestrator knows when the app is ready.\n8. **Never bake secrets into images**. Pass them at runtime with environment variables or secret managers.',
      syntax:
        "# server/Dockerfile\nFROM node:22-alpine\nWORKDIR /app\nENV NODE_ENV=production\nCOPY package*.json ./\nRUN npm ci --omit=dev && npm cache clean --force\nCOPY --chown=node:node . .\nUSER node\nEXPOSE 5000\nHEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:5000/api/health || exit 1\nCMD [\"node\", \"src/server.js\"]",
      tip: 'Docker builds layer by layer. If you write COPY . . before RUN npm ci, every code change invalidates the cache and reinstalls all packages. Always copy package*.json first.',
    },
    {
      heading: 'Multi-stage build for the React client (Vite + Nginx)',
      content:
        'A React app in production is just **static files** (`index.html`, JS, CSS) produced by `vite build`. You do not need Node to serve them. A **multi-stage build** uses one stage to build and a second, tiny stage to serve:\n\n- **Stage 1 (build)**: `node:22-alpine`, `npm ci`, `npm run build` → `dist/`.\n- **Stage 2 (serve)**: `nginx:alpine` (about 20 MB), copy only `dist/` from stage 1. Node, node_modules and source code are thrown away.\n\nNginx config needs two things for a MERN SPA:\n\n1. **SPA fallback**: `try_files $uri /index.html;` so React Router routes like `/products/42` work on refresh.\n2. **API proxy**: `location /api/ { proxy_pass http://server:5000; }` so the browser calls the same origin (no CORS, cookies just work) and Nginx forwards to the server container.\n\n**Important about env variables**: `VITE_*` variables are **baked in at build time** (`import.meta.env.VITE_API_URL` is replaced with a string). Changing them at container start does nothing. Pass them as `--build-arg` or, better, use relative URLs (`/api`) behind the proxy so one image works everywhere.',
      tip: 'Never put secrets in VITE_ variables. Everything in the client bundle is public: anyone can open DevTools and read it.',
    },
    {
      heading: 'docker compose: the whole stack in one file',
      content:
        '`docker-compose.yml` (or `compose.yaml`) describes all services, and `docker compose up` starts them together on a shared network.\n\nServices for a MERN app:\n\n- **mongo**: image `mongo:8`, named volume `mongo-data:/data/db`, healthcheck using `mongosh --eval "db.adminCommand(\'ping\')"`.\n- **redis**: image `redis:7-alpine`, optional volume, healthcheck `redis-cli ping`.\n- **server**: `build: ./server`, environment `MONGO_URI=mongodb://mongo:27017/shop`, `REDIS_URL=redis://redis:6379`, `depends_on` with `condition: service_healthy`.\n- **client**: `build: ./client`, publishes port 80 (or 8080) to the host.\n\nNotes:\n\n- Inside the compose network, use the **service name** as hostname, never `localhost` (inside a container, localhost means the container itself).\n- Only publish ports you need on the host (`ports`). MongoDB and Redis usually do not need to be published in production.\n- `env_file: ./server/.env` loads variables without hardcoding them in the YAML.\n- `depends_on` alone only waits for the container to **start**, not to be **ready**; use healthchecks + `condition: service_healthy`, and still add retry logic in the app.\n- `restart: unless-stopped` restarts crashed services.',
      syntax:
        'docker compose up -d --build     # build images and start in background\ndocker compose ps                # status + health\ndocker compose logs -f server    # follow server logs\ndocker compose exec mongo mongosh shop   # open a shell inside mongo\ndocker compose down              # stop and remove containers (volumes kept)\ndocker compose down -v           # ALSO delete volumes (database wiped!)',
    },
    {
      heading: 'Development vs production with compose',
      content:
        'In **development** you want hot reload, so you mount your source code into the container (**bind mount**) and run `node --watch` or `vite` inside it. Docker Compose also has **`develop.watch`** (`docker compose watch`), which syncs changed files into the container and rebuilds when `package.json` changes.\n\nIn **production** you want immutable images: no bind mounts, `NODE_ENV=production`, built assets, non-root users, restart policies and resource limits.\n\nCommon approach:\n\n- `compose.yaml`: base services (mongo, redis, server, client).\n- `compose.override.yaml`: dev-only additions (bind mounts, dev commands, exposed Mongo port for Compass). Compose loads it automatically in dev.\n- `compose.prod.yaml`: production settings, used with `docker compose -f compose.yaml -f compose.prod.yaml up -d`.\n\nFor real production on a single VPS (e.g. DigitalOcean, AWS Lightsail, Hostinger VPS), compose + Nginx/Caddy for HTTPS works well. For managed platforms (Render, Railway) you usually deploy the server image alone and use MongoDB Atlas + managed Redis instead of running databases in containers.',
      tip: 'Do not mount node_modules from a Windows/macOS host into a Linux container; native packages (bcrypt, sharp) compiled for your OS will crash. Use an anonymous volume for /app/node_modules so the container keeps its own.',
    },
    {
      heading: 'Graceful shutdown, health checks and debugging containers',
      content:
        'Orchestrators (compose, Render, Kubernetes) stop containers by sending **SIGTERM**, waiting (10 s in compose by default), then SIGKILL. Your server should listen for SIGTERM, stop accepting new requests (`server.close()`), finish in-flight ones, close MongoDB and Redis connections, then exit. Otherwise users see errors during every deploy.\n\nExpose two endpoints:\n\n- **Liveness** `/api/health`: "the process is alive" (always 200 if Express responds).\n- **Readiness** `/api/ready`: "I can serve traffic" (200 only when MongoDB is connected; 503 otherwise). Load balancers send traffic only to ready instances.\n\nDebugging checklist:\n\n1. `docker compose ps` → is the service running or restarting? healthy?\n2. `docker compose logs server` → crash message (often a wrong MONGO_URI or missing env var).\n3. `docker compose exec server sh` → look inside, `env`, `wget -qO- localhost:5000/api/health`.\n4. `docker image ls` → image sizes; `docker history <image>` → which layer is big.',
      syntax:
        "// server/src/server.js\nconst server = app.listen(PORT, () => console.log('API on', PORT));\nconst shutdown = async (signal) => {\n  console.log(signal, 'received, shutting down');\n  server.close(async () => {\n    await mongoose.connection.close();\n    await redis.quit();\n    process.exit(0);\n  });\n  setTimeout(() => process.exit(1), 10000).unref(); // force exit\n};\nprocess.on('SIGTERM', shutdown);\nprocess.on('SIGINT', shutdown);",
    },
  ],
  examples: [
    {
      title: 'Liveness and readiness endpoints for containers (simulated)',
      scenario:
        'When compose or Render starts the server container, MongoDB may not be ready yet. /api/health says the process is alive; /api/ready returns 503 until the database connection is up, so the load balancer waits before sending traffic.',
      steps: [
        'Keep a dbState variable that mimics mongoose.connection.readyState (0 disconnected, 2 connecting, 1 connected)',
        'GET /api/health always returns 200 with uptime-free, deterministic data',
        'GET /api/ready returns 503 unless dbState is 1',
        'A demo-only route simulates the "connected" event (in real code mongoose.connection.on("connected") sets it)',
        'Run the requests: ready is 503, then 200 after the connection event',
      ],
      code: `// Real version with Mongoose
import mongoose from 'mongoose';
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/ready', (req, res) => {
  const ready = mongoose.connection.readyState === 1;   // 1 = connected
  res.status(ready ? 200 : 503).json({ ready, db: mongoose.STATES[mongoose.connection.readyState] });
});`,
      api: {
        code: `const express = require('express');
const app = express();

const STATES = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
let dbState = 2;   // like mongoose.connection.readyState while connecting

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'shop-api' });     // liveness: process is up
});

app.get('/api/ready', (req, res) => {
  const ready = dbState === 1;                         // readiness: DB connected?
  res.status(ready ? 200 : 503).json({ ready, db: STATES[dbState] });
});

// DEMO ONLY: in real code mongoose.connection.on('connected') does this
app.post('/demo/db-connected', (req, res) => {
  dbState = 1;
  res.json({ db: STATES[dbState] });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/health' },
          { method: 'GET', url: '/api/ready' },
          { method: 'POST', url: '/demo/db-connected' },
          { method: 'GET', url: '/api/ready' },
        ],
      },
      result: "GET /api/health → 200 {\"status\":\"ok\",\"service\":\"shop-api\"}\nGET /api/ready → 503 {\"ready\":false,\"db\":\"connecting\"}\nPOST /demo/db-connected → 200 {\"db\":\"connected\"}\nGET /api/ready → 200 {\"ready\":true,\"db\":\"connected\"}",
      explanation:
        'Health stays 200 the whole time because the Node process is fine. Ready is 503 while the database is connecting, then 200 once connected. In compose, the server HEALTHCHECK can call /api/ready so dependent services wait; on Render you set the Health Check Path so a new deploy only receives traffic once it is ready (zero-downtime deploys).',
    },
    {
      title: 'Production Dockerfile for the Express server + .dockerignore',
      scenario: 'Build a small, secure image for the API that installs only production dependencies and runs as a non-root user.',
      steps: [
        'Create server/.dockerignore',
        'Create server/Dockerfile using node:22-alpine',
        'Build: docker build -t shop-api:1.0 ./server',
        'Run: docker run --rm -p 5000:5000 --env-file server/.env shop-api:1.0',
        'Check size: docker image ls shop-api',
      ],
      code: `# server/.dockerignore
node_modules
npm-debug.log
.env
.env.*
.git
coverage
tests
Dockerfile
.dockerignore

# server/Dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# 1) dependencies layer (cached unless package files change)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 2) application code
COPY --chown=node:node src ./src

# 3) security + runtime
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \\
  CMD wget -qO- http://localhost:5000/api/ready || exit 1
CMD ["node", "src/server.js"]`,
      result:
        'docker build finishes; a second build after changing only src/ shows "CACHED" for the npm ci step and takes a few seconds. docker image ls shows shop-api 1.0 at roughly 150-200 MB (versus 1 GB+ with node:22 and dev dependencies). docker run prints "API on 5000" and curl localhost:5000/api/health returns {"status":"ok"}.',
      explanation:
        'Copying package files before src/ keeps the expensive npm ci layer cached. .dockerignore stops your local .env (secrets) and node_modules (compiled for your OS) from entering the image. USER node means the process runs without root privileges. CMD with the exec form runs node as PID 1 so SIGTERM reaches your shutdown handler. Note: inside a Dockerfile continuation lines end with a single backslash.',
    },
    {
      title: 'Multi-stage React build served by Nginx with /api proxy',
      scenario: 'Ship the Vite React client as static files in a ~25 MB Nginx image that also forwards /api requests to the server container.',
      steps: [
        'Create client/nginx.conf with SPA fallback and /api proxy',
        'Create client/Dockerfile with a build stage and an nginx stage',
        'Make the axios baseURL "/api" (relative) so no rebuild is needed per environment',
        'Build: docker build -t shop-client:1.0 ./client',
        'It will be started by compose in the next example (it needs the server service for the proxy)',
      ],
      code: `# client/nginx.conf
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml;

  # hashed Vite assets: cache forever
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # API + Socket.IO go to the Express container
  location /api/ {
    proxy_pass http://server:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  location /socket.io/ {
    proxy_pass http://server:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  # React Router: unknown paths -> index.html
  location / {
    try_files $uri /index.html;
    add_header Cache-Control "no-cache";
  }
}

# client/Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_RAZORPAY_KEY_ID
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

// client/src/lib/api.js
import axios from 'axios';
export const api = axios.create({ baseURL: '/api', withCredentials: true });`,
      result:
        'docker image ls shows shop-client 1.0 at about 25 MB. The final image contains only Nginx and the dist folder: no Node, no node_modules, no source code.',
      explanation:
        'COPY --from=build pulls just the build output from the first stage. Because the browser calls /api on the same origin, there is no CORS configuration and httpOnly cookies work without SameSite=None. VITE_ variables are fixed at build time, so the public Razorpay key id is passed as a build arg (it is public anyway); secret keys stay only on the server. The /socket.io/ block adds the Upgrade headers that WebSockets need through a proxy. Since $host and $uri are Nginx variables, this file must not be processed with envsubst unless you escape them.',
    },
    {
      title: 'docker compose for the full MERN stack (client, server, mongo, redis)',
      scenario: 'Start MongoDB, Redis, the API and the React client with one command, with persistent data and correct start order.',
      steps: [
        'Create compose.yaml in the project root (next to client/ and server/)',
        'Create server/.env.docker with JWT secrets etc. (not committed)',
        'Run docker compose up -d --build',
        'Open http://localhost:8080 for the app; docker compose ps shows all services healthy',
        'Run docker compose down and up again: data in MongoDB is still there because of the named volume',
      ],
      code: `# compose.yaml
services:
  mongo:
    image: mongo:8
    restart: unless-stopped
    volumes:
      - mongo-data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping').ok"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  server:
    build: ./server
    restart: unless-stopped
    env_file: ./server/.env.docker
    environment:
      MONGO_URI: mongodb://mongo:27017/shop
      REDIS_URL: redis://redis:6379
      CLIENT_URL: http://localhost:8080
      PORT: "5000"
    depends_on:
      mongo:
        condition: service_healthy
      redis:
        condition: service_healthy

  client:
    build:
      context: ./client
      args:
        VITE_RAZORPAY_KEY_ID: rzp_test_xxxxxxxx
    restart: unless-stopped
    ports:
      - "8080:80"
    depends_on:
      - server

volumes:
  mongo-data:
  redis-data:

# server/.env.docker  (add to .gitignore)
JWT_ACCESS_SECRET=change-me-long-random
JWT_REFRESH_SECRET=change-me-too
CLOUDINARY_URL=cloudinary://key:secret@cloud-name`,
      result:
        'docker compose ps:\nNAME            SERVICE  STATUS                   PORTS\nshop-mongo-1    mongo    Up 30 seconds (healthy)  27017/tcp\nshop-redis-1    redis    Up 30 seconds (healthy)  6379/tcp\nshop-server-1   server   Up 20 seconds (healthy)  5000/tcp\nshop-client-1   client   Up 19 seconds            0.0.0.0:8080->80/tcp\nhttp://localhost:8080 shows the shop; API calls go to /api through Nginx.',
      explanation:
        'Only the client publishes a port to the host; mongo, redis and server are reachable only inside the compose network (more secure). The server connects to mongo and redis by service name. depends_on with condition: service_healthy waits for the healthchecks, so the server does not crash on start with ECONNREFUSED. Named volumes keep MongoDB and Redis data across restarts; only docker compose down -v deletes them.',
    },
    {
      title: 'Development setup with hot reload (compose.override.yaml + compose watch)',
      scenario: 'Developers want to edit code on their laptop and see changes instantly, while MongoDB and Redis still run in containers.',
      steps: [
        'Create compose.override.yaml (loaded automatically by docker compose up)',
        'Run the server with node --watch and the client with vite --host',
        'Use develop.watch to sync source files and rebuild on package.json changes',
        'Run docker compose watch (or docker compose up with bind mounts)',
        'Connect MongoDB Compass to mongodb://localhost:27017 (port published only in dev)',
      ],
      code: `# compose.override.yaml  (development only)
services:
  mongo:
    ports:
      - "27017:27017"          # so Compass on your laptop can connect

  server:
    build:
      context: ./server
      target: base
    command: ["node", "--watch", "src/server.js"]
    environment:
      NODE_ENV: development
    ports:
      - "5000:5000"
    develop:
      watch:
        - action: sync
          path: ./server/src
          target: /app/src
        - action: rebuild
          path: ./server/package.json

  client:
    build:
      context: ./client
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    develop:
      watch:
        - action: sync
          path: ./client/src
          target: /app/src
        - action: rebuild
          path: ./client/package.json

# client/Dockerfile.dev
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["npx", "vite", "--host", "0.0.0.0"]

# client/vite.config.js (dev proxy points to the server SERVICE name)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': { target: 'http://server:5000', changeOrigin: true } },
    watch: { usePolling: true },   // reliable file events inside Docker on Windows/macOS
  },
});`,
      result:
        'docker compose watch starts everything. Editing server/src/routes/product.routes.js syncs the file and node --watch restarts the API in about a second; editing a React component triggers Vite HMR at http://localhost:5173. Changing package.json triggers an image rebuild automatically.',
      explanation:
        'The override file adds dev-only behaviour without touching the production compose.yaml. sync copies changed files into the running container (faster and more reliable than bind mounts on Windows/macOS), and rebuild handles dependency changes. Vite must listen on 0.0.0.0 inside the container, otherwise it is unreachable from your browser. In production you run: docker compose -f compose.yaml up -d (without the override).',
    },
  ],
  interview: [
    {
      q: 'What is the difference between a Docker image and a container?',
      a: 'An image is a read-only, layered template built from a Dockerfile containing the app, runtime and dependencies. A container is a running (or stopped) instance of an image with its own writable layer, process, network interface and filesystem view. One image can run as many containers, like one class creating many objects.',
      level: 'Easy',
    },
    {
      q: 'Why do we copy package.json and run npm ci before copying the rest of the source code?',
      a: 'Docker caches each layer and reuses it if the inputs did not change. Dependencies change rarely, source code changes often. By installing dependencies in a layer that depends only on package.json and package-lock.json, code changes do not invalidate that layer, so rebuilds skip npm ci and take seconds instead of minutes.',
      level: 'Medium',
    },
    {
      q: 'What is a multi-stage build and why is it useful for React?',
      a: 'A Dockerfile with several FROM stages where later stages copy only selected files from earlier ones. For React, stage one uses Node to run vite build; stage two uses nginx:alpine and copies only dist/. The final image has no Node, node_modules or source code, so it is small (about 25 MB), faster to deploy and has a smaller attack surface.',
      level: 'Medium',
    },
    {
      q: 'Inside a compose network, why does mongodb://localhost:27017 fail from the server container?',
      a: 'Each container has its own network namespace; localhost inside the server container refers to the server container itself, where MongoDB is not running. Compose provides DNS so services reach each other by service name, e.g. mongodb://mongo:27017/shop.',
      level: 'Easy',
    },
    {
      q: 'Does depends_on guarantee that MongoDB is ready before the server starts?',
      a: 'Not by default. Plain depends_on only orders container start. To wait for readiness, define a healthcheck on the mongo service and use depends_on: { mongo: { condition: service_healthy } }. Even then the app should retry connections, because databases can restart later; Mongoose and the driver retry on reconnect, and the initial connect can be wrapped in a retry loop.',
      level: 'Medium',
    },
    {
      q: 'How do you persist MongoDB data when using Docker?',
      a: 'Mount a named volume (or bind mount) at /data/db, e.g. volumes: [mongo-data:/data/db]. The container filesystem is discarded when the container is removed, but the volume remains until you delete it explicitly (docker compose down -v or docker volume rm). In production most teams use MongoDB Atlas instead of self-managing the database container.',
      level: 'Easy',
    },
    {
      q: 'Why can you not change VITE_API_URL when starting the client container?',
      a: 'Vite replaces import.meta.env.VITE_* references with literal strings during the build, so the value is frozen inside the JS bundle. Runtime environment variables of the Nginx container are never read by the browser. Solutions: use a relative /api URL behind a reverse proxy, pass values as build args per environment, or load a small runtime config file (config.json / window.__CONFIG__) generated at container start.',
      level: 'Hard',
    },
    {
      q: 'Why should a Node container run as a non-root user and use CMD ["node", "server.js"] instead of npm start?',
      a: 'Non-root limits damage if the app is compromised (cannot modify system files or easily escape). Using node directly in exec form makes Node PID 1 and lets it receive SIGTERM/SIGINT for graceful shutdown; npm start adds an extra process that historically did not forward signals reliably, causing 10-second forced kills on every deploy.',
      level: 'Hard',
    },
    {
      q: 'What is the difference between liveness and readiness checks?',
      a: 'Liveness answers "is the process alive?"; if it fails repeatedly the orchestrator restarts the container. Readiness answers "can it serve traffic now?" (e.g. DB connected, warm-up done); if it fails the instance is removed from the load balancer but not restarted. Using a DB check in liveness can cause restart loops when the database is briefly down.',
      level: 'Medium',
    },
    {
      q: 'What should be in .dockerignore for a MERN project and why?',
      a: 'node_modules (huge, OS-specific), .env files (secrets), .git (history, size), coverage, logs, tests and local build output. It keeps the build context small and fast, prevents leaking secrets into image layers, and avoids copying binaries compiled for the host OS that would break inside Linux containers.',
      level: 'Easy',
    },
    {
      q: 'Would you run MongoDB in Docker in production?',
      a: 'It is possible (with volumes, replica sets, backups, monitoring), but for most teams a managed service like MongoDB Atlas is better: automatic backups, replica sets, scaling, security patches and monitoring. Docker MongoDB is ideal for local development, CI and tests. The same reasoning applies to Redis (Upstash, Redis Cloud, ElastiCache).',
      level: 'Medium',
    },
    {
      q: 'How do you debug a container that keeps restarting?',
      a: 'docker compose ps to see the status and restart count; docker compose logs <service> for the crash error (missing env var, wrong MONGO_URI, port already used); docker compose run --rm --entrypoint sh <service> to start a shell without the failing command; docker inspect for env, health logs and exit code; and verify the healthcheck command itself works inside the container.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Add graceful shutdown to an Express + Mongoose + Redis server so docker compose stop does not drop in-flight requests.',
      hint: 'server.close() stops accepting new connections and calls back when existing ones finish.',
      solution: `// server/src/server.js
import mongoose from 'mongoose';
import app from './app.js';
import { redis, connectRedis } from './lib/redis.js';

const PORT = process.env.PORT || 5000;
await mongoose.connect(process.env.MONGO_URI);
await connectRedis();
const server = app.listen(PORT, () => console.log('API on', PORT));

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(signal + ' received: closing HTTP server');
  server.close(async (err) => {
    try {
      await mongoose.connection.close();
      if (redis.isOpen) await redis.quit();
      console.log('Closed cleanly');
      process.exit(err ? 1 : 0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
  setTimeout(() => { console.error('Forced exit'); process.exit(1); }, 9000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);`,
    },
    {
      task: 'Write a compose healthcheck for the server service that calls /api/ready, and make the client wait for the server to be healthy.',
      hint: 'node:22-alpine includes wget (BusyBox). Use condition: service_healthy.',
      solution: `services:
  server:
    build: ./server
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:5000/api/ready"]
      interval: 10s
      timeout: 3s
      start_period: 20s
      retries: 3

  client:
    build: ./client
    ports: ["8080:80"]
    depends_on:
      server:
        condition: service_healthy`,
    },
    {
      task: 'Write a script seed.js and run it inside the running server container to insert sample products into the compose MongoDB.',
      hint: 'docker compose exec server node scripts/seed.js uses the container env (MONGO_URI=mongodb://mongo:27017/shop).',
      solution: `// server/scripts/seed.js
import mongoose from 'mongoose';
import { Product } from '../src/models/Product.js';

await mongoose.connect(process.env.MONGO_URI);
await Product.deleteMany({});
await Product.insertMany([
  { name: 'Redmi Note 13', category: 'phones', price: 15999 },
  { name: 'boAt Airdopes 141', category: 'audio', price: 1299 },
  { name: 'HP Victus 15', category: 'laptops', price: 62990 },
]);
console.log('Seeded', await Product.countDocuments(), 'products');
await mongoose.disconnect();

# Dockerfile: make sure scripts/ is copied too
# COPY --chown=node:node scripts ./scripts

# run it
docker compose exec server node scripts/seed.js
# -> Seeded 3 products`,
    },
    {
      task: 'Create compose.prod.yaml that adds resource limits, log rotation and removes published database ports, and show the command to use it.',
      hint: 'Use deploy.resources.limits and the logging options of the json-file driver.',
      solution: `# compose.prod.yaml
x-logging: &default-logging
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"

services:
  mongo:
    ports: !reset []
    logging: *default-logging
  redis:
    logging: *default-logging
  server:
    environment:
      NODE_ENV: production
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
    logging: *default-logging
  client:
    ports:
      - "80:80"
    logging: *default-logging

# run (without the dev override):
# docker compose -f compose.yaml -f compose.prod.yaml up -d --build`,
    },
  ],
  quiz: [
    {
      question: 'In compose, what hostname should the server use to connect to the MongoDB service named "mongo"?',
      options: ['localhost', '127.0.0.1', 'mongo', 'host.docker.internal'],
      answer: 2,
      explanation: 'Compose creates DNS entries for each service name on the shared network.',
    },
    {
      question: 'What happens to MongoDB data stored in a named volume after docker compose down?',
      options: [
        'It is kept; only down -v removes volumes',
        'It is deleted together with the containers',
        'It is moved into the image',
        'It is uploaded to Docker Hub',
      ],
      answer: 0,
      explanation: 'docker compose down removes containers and networks but keeps named volumes unless -v is given.',
    },
    {
      question: 'Why is the final stage of the client Dockerfile based on nginx:alpine?',
      options: [
        'Nginx can run the Vite dev server',
        'The built React app is static files, so a tiny web server is enough and Node is not needed',
        'Nginx compiles JSX',
        'Alpine includes MongoDB',
      ],
      answer: 1,
      explanation: 'After vite build, only static HTML/JS/CSS remain; Nginx serves them efficiently and can proxy /api.',
    },
    {
      question: 'Which line belongs in .dockerignore to avoid leaking secrets into the image?',
      options: ['package.json', 'src', 'Dockerfile.dev', '.env'],
      answer: 3,
      explanation: 'Environment files contain secrets and must be provided at runtime, never copied into image layers.',
    },
    {
      question: 'What does depends_on with condition: service_healthy do?',
      options: [
        'Restarts a service every time another one restarts',
        'Shares the filesystem between services',
        'Starts the dependent service only after the dependency passes its healthcheck',
        'Publishes the dependency port on the host',
      ],
      answer: 2,
      explanation: 'It waits for the healthcheck to report healthy, not just for the container to start.',
    },
  ],
};
