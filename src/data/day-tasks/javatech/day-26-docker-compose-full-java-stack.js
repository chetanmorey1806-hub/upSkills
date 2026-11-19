export default {
  lesson: 'day-26-docker-compose-full-java-stack',
  minutes: 24,
  intro: 'Run React/nginx + Spring Boot + MySQL + Redis with Compose: networks, volumes, healthchecks, .env files and everyday commands.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'In the Compose file, the services are `web` (nginx), `api` (Spring Boot), `mysql` and `redis`. Which datasource URL should the **api** container use?',
      options: [
        'jdbc:mysql://localhost:3306/college',
        'jdbc:mysql://mysql:3306/college',
        'jdbc:mysql://127.0.0.1:3307/college',
        'jdbc:mysql://host.docker.internal/college',
      ],
      answer: 1,
      explain: 'Compose puts all services on one network with **DNS by service name**, so the api reaches MySQL at `mysql:3306`. Inside a container, `localhost` is the container itself - the most common Compose mistake.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'The api starts before MySQL is ready and crashes. MySQL has a `healthcheck`. Complete the api\'s depends_on:\n```\napi:\n  depends_on:\n    mysql:\n      condition: ???\n```',
      example: { title: 'a MySQL healthcheck', code: 'healthcheck:\n  test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]\n  interval: 10s\n  retries: 5' },
      accept: ['service_healthy'],
      caseSensitive: true,
      explain: 'Plain `depends_on` only waits for the container to **start**, not for MySQL to accept connections. `condition: service_healthy` waits until the healthcheck passes.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The `.env` file and the mysql service are shown. Type two lines: (1) the port you use in MySQL Workbench **on your laptop**, (2) the port the api container uses to connect to mysql.',
      example: { title: 'variables from .env', text: 'Compose automatically reads .env in the project folder and replaces ${NAME} in the YAML.' },
      code: `# .env
MYSQL_HOST_PORT=3307
MYSQL_ROOT_PASSWORD=root

# docker-compose.yml
mysql:
  image: mysql:8.4
  ports:
    - "\${MYSQL_HOST_PORT}:3306"
  environment:
    MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}`,
      expected: '3307\n3306',
      explain: 'The mapping is `HOST:CONTAINER` = `3307:3306`. Your laptop uses **3307** (handy if a local MySQL already uses 3306). Containers on the Compose network talk to the container port directly: **3306**. The published port is only for the host.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'You changed the Spring Boot code. Write the single command that rebuilds the images and starts the whole stack **in the background**.',
      example: { title: 'following logs', code: 'docker compose logs -f api' },
      accept: ['docker compose up -d --build', 'docker compose up --build -d', 'docker-compose up -d --build', 'docker-compose up --build -d'],
      explain: '`--build` rebuilds images whose Dockerfile/context changed; `-d` (detached) returns your terminal. Without `--build`, Compose reuses the old image and your change seems "not to work".',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'MySQL uses the named volume `mysql-data:/var/lib/mysql`. Which statements are TRUE? (choose all that apply)',
      options: [
        'docker compose down stops and removes containers, but the named volume (and data) remains',
        'docker compose down -v also deletes the named volumes, so the data is lost',
        'Without a volume, data is lost when the container is removed',
        'Named volumes are stored inside the image',
        'An init script mounted to /docker-entrypoint-initdb.d runs only when the data directory is empty',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Volumes live outside containers and images. `down -v` is the "factory reset". MySQL init scripts run only on first start (empty volume), which is why changing them later seems to have no effect.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'nginx (service `web`, published as port 80) serves the React build and proxies the API. The browser calls `http://localhost/api/students`. Type two lines: the **host:port** nginx forwards to, and the **path** the Spring Boot app receives.',
      example: { title: 'proxy_pass without a URI', text: 'If proxy_pass has no path after host:port, nginx forwards the original request path unchanged.' },
      code: `server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    try_files $uri /index.html;
  }
  location /api/ {
    proxy_pass http://api:8080;
  }
}`,
      expected: 'api:8080\n/api/students',
      explain: '`/api/...` matches the second location and goes to the **api** service on port 8080 with the path unchanged (`/api/students`). Because the browser only talks to nginx (same origin), no CORS is needed. `try_files ... /index.html` makes React Router deep links work.',
    },
  ],
};
