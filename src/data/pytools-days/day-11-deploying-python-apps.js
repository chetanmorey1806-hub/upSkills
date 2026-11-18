export default {
  id: "day-11-deploying-python-apps",
  title: "Deploying Python Apps: Gunicorn, Uvicorn, Nginx, Render, PythonAnywhere and AWS EC2",
  module: "Module 3: Production",
  day: 11,
  level: "Advanced",
  duration: "3.5 hours",
  summary: "Take a Flask, Django or FastAPI app from your laptop to the internet: run it with a production server (Gunicorn/Uvicorn), put Nginx in front, manage environment variables, and deploy on Render, Railway, PythonAnywhere or an AWS EC2 Linux server.",
  objectives: [
    "Explain why the development server must never be used in production",
    "Run WSGI apps with Gunicorn and ASGI apps with Uvicorn workers",
    "Configure Nginx as a reverse proxy with static files and HTTPS",
    "Manage configuration and secrets with environment variables",
    "Deploy to a PaaS (Render/Railway/PythonAnywhere) and to an AWS EC2 server with systemd",
    "Prepare a production checklist: DEBUG off, logging, health checks, migrations",
  ],
  theory: [
    {
      heading: "From Development Server to Production",
      content: "Commands like `flask run`, `python manage.py runserver` or `fastapi dev` start a **development server**. It is single-process, auto-reloads, may show debug pages with your source code, and is not built for security or heavy traffic. In production we use a dedicated application server.\n\nPython web apps follow a standard interface: **WSGI** (Web Server Gateway Interface) for synchronous frameworks like Flask and Django, and **ASGI** (Asynchronous Server Gateway Interface) for async frameworks like FastAPI, Starlette and Django Channels. The application server speaks HTTP to the outside world and calls your app through this interface.",
      points: [
        "WSGI servers: Gunicorn (Linux), uWSGI, Waitress (works on Windows)",
        "ASGI servers: Uvicorn, Hypercorn, Daphne",
        "Flask app object: app; Django: project/wsgi.py application; FastAPI: app (ASGI)",
      ],
      tip: "Interview line: \"runserver is for development only; in production I use Gunicorn behind Nginx.\"",
    },
    {
      heading: "Gunicorn and Uvicorn",
      content: "**Gunicorn** is a pre-fork WSGI server: one master process manages several worker processes; each worker handles requests. If a worker crashes, the master restarts it. A common starting rule for workers is `(2 x CPU cores) + 1`.\n\nFor FastAPI, you can run **Uvicorn** directly with several workers, or run Gunicorn as the process manager with Uvicorn worker classes. Both are common in production.",
      syntax: `# Flask (module app.py, object app)
gunicorn app:app --workers 3 --bind 0.0.0.0:8000

# Django
gunicorn mysite.wsgi:application --workers 3 --bind 0.0.0.0:8000

# FastAPI with Uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# FastAPI with Gunicorn managing Uvicorn workers
gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:8000
`,
      points: [
        "--timeout 30: kill workers stuck for more than 30 seconds",
        "--access-logfile -: print access logs to stdout (good for Docker/PaaS)",
        "Gunicorn does not run on Windows; use Waitress there, or deploy on Linux",
      ],
    },
    {
      heading: "Nginx as a Reverse Proxy",
      content: "**Nginx** sits in front of Gunicorn/Uvicorn. Browsers talk to Nginx on ports 80/443; Nginx forwards (proxies) requests to the app on 127.0.0.1:8000. This is called a **reverse proxy**.\n\nWhy add Nginx? It serves static and media files very fast, terminates HTTPS (SSL), buffers slow clients so Python workers are not blocked, applies limits (request size, rate limiting), gzip compresses responses and can load-balance across several app servers.",
      syntax: `server {
    listen 80;
    server_name shop.example.com;

    location /static/ {
        alias /home/ubuntu/shop/staticfiles/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`,
      tip: "Free HTTPS: install certbot and run sudo certbot --nginx -d shop.example.com. It edits the Nginx config and auto-renews Let's Encrypt certificates.",
    },
    {
      heading: "Environment Variables and Configuration",
      content: "Follow the **12-factor app** rule: keep configuration (database URL, secret keys, API keys, DEBUG flag) in environment variables, not in code. The same code can then run in development, staging and production with different settings, and secrets never land in Git.\n\nLocally you can keep them in a `.env` file (added to .gitignore) and load it with python-dotenv or pydantic-settings. On a PaaS you add them in the dashboard; on a Linux server you put them in the systemd service file or an EnvironmentFile.",
      syntax: `import os

SECRET_KEY = os.environ["SECRET_KEY"]                 # required: crash early if missing
DEBUG = os.getenv("DEBUG", "False") == "True"         # optional with default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///db.sqlite3")
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost").split(",")
`,
      points: [
        "Commit a .env.example with dummy values so teammates know which variables are needed",
        "Read required secrets with os.environ[...] so the app fails at startup, not at the first request",
      ],
    },
    {
      heading: "Platform-as-a-Service: Render, Railway, PythonAnywhere",
      content: "A **PaaS** hides servers from you: connect a GitHub repo, set a build command and a start command, add environment variables, and the platform builds and runs your app with HTTPS on a public URL. Pushing to main redeploys automatically.\n\n**Render**: create a Web Service, build command `pip install -r requirements.txt`, start command `gunicorn app:app`; it provides managed PostgreSQL and free/low-cost plans (free instances sleep after inactivity). **Railway**: detects Python automatically, provisions databases in one click, reads the PORT variable. **PythonAnywhere**: beginner-friendly Python hosting; you upload code or git clone in its Bash console, create a virtualenv, and configure the WSGI file from the Web tab - great for Flask/Django portfolio projects.",
      points: [
        "Always bind to the PORT the platform gives you: gunicorn app:app --bind 0.0.0.0:$PORT",
        "Run database migrations as a pre-deploy or release command",
        "Free tiers change often; check current limits before choosing",
      ],
    },
    {
      heading: "AWS EC2 Basics",
      content: "**EC2** (Elastic Compute Cloud) gives you a virtual Linux server. You control everything, which means more power and more responsibility. The flow: launch an Ubuntu instance, choose an instance type (t3.micro/t2.micro for practice), create a key pair (.pem) for SSH, and configure the **security group** (firewall) to allow ports 22 (SSH, only your IP), 80 and 443.\n\nOn the server you install Python, git and Nginx, clone your project, create a venv, install requirements, run Gunicorn as a **systemd service** so it starts on boot and restarts on crash, and configure Nginx. Attach an **Elastic IP** so the public IP does not change, and point your domain's DNS A record to it.",
      points: [
        "Never open port 8000 or the database port to the world; only Nginx should be public",
        "Use RDS for a managed database instead of installing Postgres on the same box for serious apps",
        "Stop or terminate unused instances to avoid bills",
      ],
    },
    {
      heading: "Production Checklist",
      content: "Before going live, walk through this checklist. Interviewers often ask \"what would you check before deploying?\"",
      points: [
        "DEBUG=False, strong SECRET_KEY from env, ALLOWED_HOSTS / CORS set correctly",
        "Run migrations; collectstatic for Django (or WhiteNoise / Nginx for static files)",
        "HTTPS enabled; secure cookies (SESSION_COOKIE_SECURE, CSRF_COOKIE_SECURE)",
        "Logs go to stdout or files with rotation; error tracking such as Sentry",
        "A /health endpoint for load balancers and uptime monitors",
        "Pinned dependency versions; backups of the database",
        "Process manager (systemd, Docker, PaaS) restarts the app on crash",
      ],
    },
  ],
  examples: [
    {
      title: "Run a Flask App with Gunicorn Locally",
      scenario: "Your Flask app works with flask run. Before deploying you want to test it with the same server you will use in production.",
      steps: [
        "Activate your venv (Linux/macOS or WSL): source .venv/bin/activate",
        "pip install gunicorn and add it to requirements.txt: pip freeze > requirements.txt",
        "Create app.py with the code below",
        "Run: gunicorn app:app --workers 3 --bind 0.0.0.0:8000 --access-logfile -",
        "Open http://localhost:8000/health in the browser",
      ],
      code: `# app.py
import os
from flask import Flask, jsonify

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-only")

@app.get("/")
def home():
    return jsonify(message="Hello from production server")

@app.get("/health")
def health():
    return jsonify(status="ok")

# terminal
# gunicorn app:app --workers 3 --bind 0.0.0.0:8000 --access-logfile -
`,
      result: `[INFO] Starting gunicorn 23.0.0
[INFO] Listening at: http://0.0.0.0:8000 (12345)
[INFO] Using worker: sync
[INFO] Booting worker with pid: 12346
[INFO] Booting worker with pid: 12347
[INFO] Booting worker with pid: 12348
Browser /health -> {"status": "ok"}`,
      explanation: "app:app means 'module app.py, variable app'. Gunicorn starts one master and three sync workers. We do NOT call app.run() - Gunicorn imports the app object itself. The /health endpoint is useful for platform health checks.",
    },
    {
      title: "Deploy FastAPI to Render",
      scenario: "You built a FastAPI expense tracker and want a public HTTPS URL to put on your resume.",
      steps: [
        "Push the project to GitHub with requirements.txt containing fastapi and uvicorn[standard]",
        "Log in to render.com > New > Web Service > connect your GitHub repo",
        "Runtime: Python 3; Build Command: pip install -r requirements.txt",
        "Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT",
        "Environment tab: add DATABASE_URL and SECRET_KEY (and PYTHON_VERSION=3.12.7 if needed)",
        "Click Create Web Service and wait for the 'Your service is live' message",
      ],
      code: `# main.py
import os
from fastapi import FastAPI

app = FastAPI(title="Expense Tracker")

@app.get("/health")
def health():
    return {"status": "ok", "env": os.getenv("APP_ENV", "dev")}

# requirements.txt
# fastapi==0.115.6
# uvicorn[standard]==0.34.0

# Render start command
# uvicorn main:app --host 0.0.0.0 --port $PORT
`,
      result: `==> Build successful
==> Running 'uvicorn main:app --host 0.0.0.0 --port $PORT'
INFO:     Uvicorn running on http://0.0.0.0:10000
==> Your service is live at https://expense-tracker-xyz.onrender.com
GET /health -> {"status":"ok","env":"production"}`,
      explanation: "Render injects the PORT variable; binding to 0.0.0.0:$PORT makes the app reachable. HTTPS is provided automatically. Every push to the connected branch triggers a new build and deploy. Secrets live in the Environment tab, never in the repo.",
    },
    {
      title: "Deploy a Django Project on PythonAnywhere",
      scenario: "A fresher wants to host a Django portfolio/blog for free without managing servers.",
      steps: [
        "Create a free account on pythonanywhere.com and open a Bash console",
        "git clone https://github.com/<user>/blog.git",
        "mkvirtualenv blogenv --python=python3.12 && pip install -r blog/requirements.txt",
        "Web tab > Add a new web app > Manual configuration > Python 3.12",
        "Set Virtualenv path to /home/<user>/.virtualenvs/blogenv and source code to /home/<user>/blog",
        "Edit the WSGI configuration file as shown, set static files mapping /static/ -> /home/<user>/blog/staticfiles",
        "Run python manage.py migrate and python manage.py collectstatic, then click Reload",
      ],
      code: `# /var/www/<user>_pythonanywhere_com_wsgi.py
import os
import sys

path = "/home/<user>/blog"
if path not in sys.path:
    sys.path.append(path)

os.environ["DJANGO_SETTINGS_MODULE"] = "blog.settings"

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

# settings.py
# DEBUG = False
# ALLOWED_HOSTS = ["<user>.pythonanywhere.com"]
# STATIC_ROOT = BASE_DIR / "staticfiles"
`,
      result: `Web tab: "Reload <user>.pythonanywhere.com" -> OK
https://<user>.pythonanywhere.com shows the blog home page with CSS loaded`,
      explanation: "PythonAnywhere runs your app through its own WSGI server, so you only edit the WSGI file to point at your project. The static files mapping lets their web server serve CSS/JS directly. If you see an error, check the error log link on the Web tab.",
    },
    {
      title: "AWS EC2: Gunicorn as a systemd Service Behind Nginx",
      scenario: "Your company wants the Flask inventory API on its own Ubuntu EC2 server with a domain and HTTPS.",
      steps: [
        "Launch an Ubuntu 24.04 EC2 instance; security group: 22 (your IP), 80, 443",
        "ssh -i key.pem ubuntu@<public-ip>",
        "sudo apt update && sudo apt install -y python3-venv python3-pip nginx git",
        "git clone the repo into /home/ubuntu/inventory, python3 -m venv .venv, .venv/bin/pip install -r requirements.txt gunicorn",
        "Create /etc/systemd/system/inventory.service (below), then: sudo systemctl daemon-reload && sudo systemctl enable --now inventory",
        "Create /etc/nginx/sites-available/inventory, link it into sites-enabled, sudo nginx -t && sudo systemctl reload nginx",
        "Point DNS A record to the Elastic IP, then sudo certbot --nginx -d api.example.com",
      ],
      code: `# /etc/systemd/system/inventory.service
[Unit]
Description=Inventory Flask API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/inventory
EnvironmentFile=/home/ubuntu/inventory/.env
ExecStart=/home/ubuntu/inventory/.venv/bin/gunicorn app:app --workers 3 --bind 127.0.0.1:8000
Restart=always

[Install]
WantedBy=multi-user.target

# /etc/nginx/sites-available/inventory
server {
    listen 80;
    server_name api.example.com;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`,
      result: `$ sudo systemctl status inventory
● inventory.service - Inventory Flask API
     Active: active (running)
$ curl https://api.example.com/health
{"status":"ok"}`,
      explanation: "Gunicorn binds only to 127.0.0.1, so it is not reachable directly from the internet; Nginx is the public entry point. systemd starts the service at boot, restarts it on crash (Restart=always) and loads secrets from the EnvironmentFile. Check logs with journalctl -u inventory -f. Certbot adds HTTPS on port 443.",
    },
    {
      title: "Zero-Surprise Config with Environment Variables",
      scenario: "Your app worked locally but crashed on the server with KeyError: 'DATABASE_URL'. You restructure config so missing variables are reported clearly at startup.",
      steps: [
        "Create config.py with the code below",
        "Create .env.example listing all needed variables and commit it",
        "Add .env to .gitignore",
        "On the server or PaaS set the real values, then restart the app",
      ],
      code: `# config.py
import os

REQUIRED = ["SECRET_KEY", "DATABASE_URL"]
missing = [name for name in REQUIRED if not os.getenv(name)]
if missing:
    raise RuntimeError(f"Missing environment variables: {', '.join(missing)}")

SECRET_KEY = os.environ["SECRET_KEY"]
DATABASE_URL = os.environ["DATABASE_URL"]
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
WORKERS = int(os.getenv("WEB_CONCURRENCY", "2"))

# .env.example (committed)
# SECRET_KEY=change-me
# DATABASE_URL=postgresql://user:pass@localhost:5432/app
# DEBUG=false
`,
      result: `Starting without variables:
RuntimeError: Missing environment variables: SECRET_KEY, DATABASE_URL
Starting with variables set: app boots normally`,
      explanation: "Failing fast at startup gives a clear message instead of a random crash on the first request. DEBUG is parsed as a boolean safely (any value other than 'true' means False, which is the safe default). .env.example documents the configuration without exposing secrets.",
    },
  ],
  interview: [
    {
      q: "Why should you not use flask run or manage.py runserver in production?",
      a: "They are development servers: single-process or limited concurrency, not hardened for security, not designed for performance, and they may expose debug information. Production uses a WSGI/ASGI server like Gunicorn or Uvicorn, usually behind Nginx.",
      level: "Easy",
    },
    {
      q: "What is the difference between WSGI and ASGI?",
      a: "WSGI is the synchronous standard interface between web servers and Python apps (one request per worker thread/process at a time) used by Flask and classic Django. ASGI is its async successor supporting async/await, WebSockets and long-lived connections; used by FastAPI, Starlette and Django Channels. Gunicorn is WSGI; Uvicorn is ASGI.",
      level: "Easy",
    },
    {
      q: "What is a reverse proxy and why use Nginx in front of Gunicorn?",
      a: "A reverse proxy receives client requests and forwards them to backend servers. Nginx handles HTTPS termination, serves static files efficiently, buffers slow clients so Python workers are free, compresses responses, limits request sizes and rates, and can load balance across multiple app instances.",
      level: "Medium",
    },
    {
      q: "How many Gunicorn workers should you run?",
      a: "A common starting point is (2 x CPU cores) + 1 for sync workers, then tune by load testing and monitoring memory/CPU. I/O-heavy apps may use gthread or async workers; for FastAPI use UvicornWorker. Too many workers waste memory; too few cause queued requests.",
      level: "Medium",
    },
    {
      q: "How do you manage secrets in a deployed Python app?",
      a: "Keep them out of code and Git. Use environment variables set in the PaaS dashboard, systemd EnvironmentFile, Docker/Kubernetes secrets, or a secret manager like AWS Secrets Manager/SSM Parameter Store. Locally use a git-ignored .env and commit only .env.example. Rotate keys if they leak.",
      level: "Medium",
    },
    {
      q: "What is the 12-factor app methodology? Name a few factors.",
      a: "A set of principles for cloud-ready apps: one codebase in version control, explicitly declared dependencies, config in environment variables, backing services (DB, cache) as attached resources, strict separation of build/release/run, stateless processes, port binding, scale out via processes, disposability (fast start/stop), dev/prod parity, logs as event streams, admin tasks as one-off processes.",
      level: "Medium",
    },
    {
      q: "Steps to deploy a Django app on an Ubuntu EC2 server?",
      a: "Launch instance and configure the security group (22 from your IP, 80, 443); SSH in; install python3-venv, nginx, git; clone repo; create venv and install requirements + gunicorn; set environment variables; run migrate and collectstatic; create a systemd service for Gunicorn bound to 127.0.0.1:8000 or a Unix socket; configure Nginx as reverse proxy and to serve /static/; enable HTTPS with certbot; set DEBUG=False and ALLOWED_HOSTS.",
      level: "Medium",
    },
    {
      q: "What is systemd and why use it for Gunicorn?",
      a: "systemd is the Linux init/service manager. A unit file lets Gunicorn start automatically on boot, restart on failure (Restart=always), run as a non-root user, load environment variables, and send logs to journald (journalctl -u name). It replaces running the app inside a terminal or screen session.",
      level: "Medium",
    },
    {
      q: "On Render or Railway, why must the app bind to $PORT?",
      a: "The platform assigns the port at runtime and routes external HTTPS traffic to it. If the app listens on a hard-coded port or on 127.0.0.1, the platform's router cannot reach it and the health check fails. Use --host 0.0.0.0 --port $PORT.",
      level: "Easy",
    },
    {
      q: "How do you do zero-downtime deployments?",
      a: "Run at least two instances behind a load balancer and update them one at a time (rolling update), or use blue-green (deploy new version alongside, switch traffic, keep old for rollback) or canary releases. Gunicorn also supports graceful reload with HUP signal. Database migrations must be backward-compatible (expand then contract) so old and new code both work during the switch. Health checks ensure traffic goes only to ready instances.",
      level: "Hard",
    },
    {
      q: "Your deployed app returns 502 Bad Gateway from Nginx. How do you troubleshoot?",
      a: "502 means Nginx could not get a valid response from the upstream. Check if Gunicorn is running (systemctl status, journalctl logs), whether it crashed on import (missing env var, missing package), whether proxy_pass address/socket matches the bind address, socket file permissions, worker timeouts on slow requests, and Nginx error log at /var/log/nginx/error.log.",
      level: "Hard",
    },
    {
      q: "PaaS vs IaaS (EC2): when would you choose each?",
      a: "PaaS (Render, Railway, Heroku, PythonAnywhere): fastest to ship, managed HTTPS, scaling and patching, ideal for small teams and MVPs, but less control and higher cost at scale. IaaS (EC2): full control over OS, networking and cost optimisation, required for special needs, but you handle security updates, monitoring and scaling yourself. Containers on managed services (ECS, Cloud Run) are a middle ground.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Write the Gunicorn command to run a Django project named 'school' with 4 workers on port 8000, logging access logs to stdout, and a 60 second timeout.",
      hint: "Django's WSGI object is in school/wsgi.py and is called application.",
      solution: `gunicorn school.wsgi:application \\
  --workers 4 \\
  --bind 0.0.0.0:8000 \\
  --access-logfile - \\
  --timeout 60
`,
    },
    {
      task: "Write an Nginx server block for domain notes.example.com that serves /static/ from /srv/notes/static/ and proxies everything else to a Uvicorn app on 127.0.0.1:8001.",
      hint: "Use two location blocks: alias for static and proxy_pass for the app.",
      solution: `server {
    listen 80;
    server_name notes.example.com;

    location /static/ {
        alias /srv/notes/static/;
    }

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`,
    },
    {
      task: "Write a systemd unit file that runs a FastAPI app (main:app) from /srv/notes with Gunicorn + Uvicorn workers, as user www-data, restarting automatically.",
      hint: "Use -k uvicorn.workers.UvicornWorker and Restart=always.",
      solution: `[Unit]
Description=Notes FastAPI
After=network.target

[Service]
User=www-data
WorkingDirectory=/srv/notes
EnvironmentFile=/srv/notes/.env
ExecStart=/srv/notes/.venv/bin/gunicorn main:app -k uvicorn.workers.UvicornWorker -w 3 -b 127.0.0.1:8001
Restart=always

[Install]
WantedBy=multi-user.target
`,
    },
    {
      task: "Make a Django settings snippet production-ready using environment variables: SECRET_KEY (required), DEBUG (default False), ALLOWED_HOSTS (comma-separated), and secure cookies when not in debug.",
      hint: "Use os.environ[...] for required values and split(',') for the host list.",
      solution: `import os

SECRET_KEY = os.environ["SECRET_KEY"]
DEBUG = os.getenv("DEBUG", "False") == "True"
ALLOWED_HOSTS = [h.strip() for h in os.getenv("ALLOWED_HOSTS", "").split(",") if h.strip()]

if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
`,
    },
    {
      task: "List the exact EC2 security group inbound rules you would create for a web server and explain each.",
      hint: "Think SSH, HTTP, HTTPS - and what should NOT be open.",
      solution: `Inbound rules:
1. SSH  TCP 22   Source: My IP (e.g. 203.0.113.10/32) - admin access only
2. HTTP TCP 80   Source: 0.0.0.0/0 (and ::/0)       - redirect to HTTPS / certbot
3. HTTPS TCP 443 Source: 0.0.0.0/0 (and ::/0)       - public traffic

Do NOT open 8000 (Gunicorn) or 5432 (Postgres) to the internet:
Gunicorn listens on 127.0.0.1 behind Nginx, and the DB should only
allow the app server's security group.
`,
    },
  ],
  quiz: [
    {
      question: "Which server is used to run a FastAPI (ASGI) application?",
      options: ["Gunicorn with default sync workers only", "Uvicorn", "Apache Tomcat", "flask run"],
      answer: 1,
      explanation: "Uvicorn is an ASGI server. Gunicorn can also be used, but only with Uvicorn worker classes.",
    },
    {
      question: "In 'gunicorn app:app', what does the part before the colon mean?",
      options: ["The Flask object name", "The Python module (app.py)", "The port", "The worker class"],
      answer: 1,
      explanation: "The format is module:variable, so app.py is the module and app is the WSGI object.",
    },
    {
      question: "What is NOT a typical job of Nginx in front of Gunicorn?",
      options: ["Serving static files", "Terminating HTTPS", "Running Python view functions", "Buffering slow clients"],
      answer: 2,
      explanation: "Python code runs in Gunicorn/Uvicorn workers; Nginx only proxies the request.",
    },
    {
      question: "Where should a production SECRET_KEY be stored?",
      options: ["Hard-coded in settings.py", "In an environment variable or secret manager", "In README.md", "In a public GitHub gist"],
      answer: 1,
      explanation: "Secrets must stay out of source code and Git; environment variables or a secret manager are standard.",
    },
    {
      question: "A common starting formula for the number of Gunicorn sync workers is:",
      options: ["1", "CPU cores / 2", "(2 x CPU cores) + 1", "100"],
      answer: 2,
      explanation: "(2 x cores) + 1 is the Gunicorn documentation's suggested starting point, then tune by load testing.",
    },
    {
      question: "Which AWS feature keeps your EC2 instance's public IP the same after a stop/start?",
      options: ["Security group", "Elastic IP", "Key pair", "AMI"],
      answer: 1,
      explanation: "An Elastic IP is a static public IPv4 address you attach to the instance.",
    },
  ],
};
