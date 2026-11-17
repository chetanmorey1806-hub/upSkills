export default {
  id: 'day-28-deployment',
  title: 'Deployment: Gunicorn, Nginx, environment variables, collectstatic, PythonAnywhere/Render',
  module: 'Module 5: Advanced Django',
  day: 28,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Take the Student Portal from your laptop to the internet: prepare production settings with environment variables, serve static files with WhiteNoise or Nginx, run Django under Gunicorn, and deploy to a Linux VPS, Render and PythonAnywhere.',
  objectives: [
    'Explain the production stack: browser -> Nginx -> Gunicorn (WSGI) -> Django -> MySQL',
    'Prepare settings, requirements.txt and environment variables for production',
    'Use collectstatic, STATIC_ROOT and WhiteNoise for static files',
    'Deploy on Ubuntu with Gunicorn + systemd + Nginx + HTTPS (Certbot)',
    'Deploy on Render (build/start commands) and PythonAnywhere (WSGI file)',
  ],
  theory: [
    {
      heading: 'Why runserver is not for production',
      content: 'python manage.py runserver is a development server: single process, not security-audited, reloads on file change and serves static files only in DEBUG. In production we use a WSGI server (Gunicorn or uWSGI) that runs several worker processes, and a web server/reverse proxy (Nginx) in front that handles HTTPS, static/media files, buffering and slow clients. Think of Nginx as the reception desk and Gunicorn workers as the clerks doing the actual work.',
      points: [
        'WSGI (Web Server Gateway Interface): standard between Python apps and servers; Django exposes portal/wsgi.py',
        'ASGI: async version (portal/asgi.py) for WebSockets/async views, served by Uvicorn/Daphne',
        'Gunicorn workers rule of thumb: (2 x CPU cores) + 1',
      ],
    },
    {
      heading: 'Production checklist',
      content: 'Before deploying, make settings environment-driven and secure (Day 23). Pin dependencies, run migrations and collect static files during the build.',
      points: [
        'DEBUG=False, SECRET_KEY and DB credentials from environment variables',
        'ALLOWED_HOSTS and CSRF_TRUSTED_ORIGINS set to your domain',
        'requirements.txt with pinned versions (pip freeze > requirements.txt)',
        'python manage.py migrate, collectstatic --noinput, check --deploy',
        'Logging configured, ADMINS for error mails, database backups',
        'Media files on persistent storage (disk on VPS, S3 on PaaS)',
      ],
    },
    {
      heading: 'Static files: collectstatic and WhiteNoise',
      content: 'In development Django finds static files inside each app. In production, collectstatic copies them all (including admin CSS) into one folder STATIC_ROOT, which Nginx or WhiteNoise serves. WhiteNoise is a middleware that lets Gunicorn serve compressed, cache-busted static files efficiently, perfect for Render/Heroku where there is no Nginx you control.',
      syntax: `STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
# MIDDLEWARE: "whitenoise.middleware.WhiteNoiseMiddleware" right after SecurityMiddleware`,
      tip: 'Common error after deploy: admin has no CSS. Cause: collectstatic not run, STATIC_ROOT missing, or WhiteNoise/Nginx not configured.',
    },
    {
      heading: 'Environment variables',
      content: 'Settings that differ between machines or are secret (SECRET_KEY, DEBUG, DATABASE_URL, EMAIL password) come from the environment. Locally they come from a .env file; on Render you add them in the dashboard; on a VPS you put them in an EnvironmentFile used by systemd. dj-database-url converts one DATABASE_URL string into Django\'s DATABASES dict.',
      syntax: `DATABASE_URL=mysql://portal_user:pass@127.0.0.1:3306/student_portal
DATABASES = {"default": dj_database_url.config(conn_max_age=600)}`,
    },
    {
      heading: 'Hosting choices',
      content: 'PaaS (Render, Railway, PythonAnywhere, Heroku) handles servers for you: push code, set env vars, done. VPS (AWS EC2, DigitalOcean, Linode) gives full control but you install and maintain Nginx, Gunicorn, MySQL, SSL and updates. Containers (Docker) package everything the same way everywhere.',
      points: [
        'PythonAnywhere: beginner friendly, free tier, MySQL available, configure WSGI file in the Web tab',
        'Render: Git-based auto-deploy, free/paid tiers, PostgreSQL managed DB (MySQL via external provider)',
        'VPS: Ubuntu + Nginx + Gunicorn + systemd + Certbot (Let\'s Encrypt HTTPS)',
      ],
    },
  ],
  examples: [
    {
      title: 'Production-ready settings, requirements and build script',
      scenario: 'Prepare the Student Portal repository so it can run on any host using only environment variables.',
      steps: [
        'VS Code / PyCharm terminal: pip install gunicorn whitenoise dj-database-url python-dotenv mysqlclient',
        'pip freeze > requirements.txt and review the pinned versions',
        'Edit portal/settings.py as below',
        'Create build.sh and make it executable (chmod +x build.sh)',
        'Test locally like production: DJANGO_DEBUG=False python manage.py collectstatic --noinput then gunicorn portal.wsgi',
        'Commit and push to GitHub (.env and media/ must be in .gitignore)',
      ],
      code: `# Project tree
student_portal/
├── accounts/  students/  templates/  static/
├── portal/
│   ├── settings.py
│   ├── wsgi.py
│   └── asgi.py
├── build.sh
├── render.yaml
├── requirements.txt
├── .env.example
└── manage.py

# requirements.txt
Django==5.1.4
gunicorn==23.0.0
whitenoise==6.8.2
dj-database-url==2.3.0
python-dotenv==1.0.1
mysqlclient==2.2.6
Pillow==11.0.0
redis==5.2.1

# .env.example (commit this, NOT .env)
DJANGO_SECRET_KEY=
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=portal.example.com
DATABASE_URL=mysql://user:password@host:3306/student_portal
REDIS_URL=redis://127.0.0.1:6379/1

# portal/settings.py (production-relevant parts)
import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
DEBUG = os.getenv("DJANGO_DEBUG", "False") == "True"
ALLOWED_HOSTS = [h.strip() for h in os.getenv("DJANGO_ALLOWED_HOSTS", "localhost").split(",")]
if os.getenv("RENDER_EXTERNAL_HOSTNAME"):
    ALLOWED_HOSTS.append(os.environ["RENDER_EXTERNAL_HOSTNAME"])
CSRF_TRUSTED_ORIGINS = [f"https://{h}" for h in ALLOWED_HOSTS if "." in h]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    # ... rest unchanged
]

DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}", conn_max_age=600
    )
}

STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = Path(os.getenv("MEDIA_ROOT", BASE_DIR / "media"))
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}

# build.sh
#!/usr/bin/env bash
set -o errexit
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate --noinput

# Local production test
DJANGO_DEBUG=False python manage.py collectstatic --noinput
gunicorn portal.wsgi:application --bind 127.0.0.1:8000 --workers 3`,
      result: `collectstatic: "171 static files copied to '/home/asha/student_portal/staticfiles', 482 post-processed."
gunicorn: "[INFO] Listening at: http://127.0.0.1:8000 ... [INFO] Booting worker with pid: 4121" (3 workers). The site and the admin CSS load with DEBUG=False.`,
      explanation: 'The same code now runs in development (SQLite, .env) and production (MySQL via DATABASE_URL). WhiteNoise serves hashed, gzip/brotli-compressed static files.',
    },
    {
      title: 'Ubuntu VPS: Gunicorn + systemd + Nginx + HTTPS',
      scenario: 'Deploy the portal on an Ubuntu 24.04 server with MySQL 8 and a domain portal.example.com.',
      steps: [
        'SSH into the server (VS Code: Remote-SSH extension; PyCharm Professional: Tools > Deployment / SSH Session)',
        'Install packages, create the MySQL database and user',
        'Clone the repo to /srv/student_portal, create venv and install requirements',
        'Create /srv/student_portal/.env with production values',
        'Run migrate, collectstatic, createsuperuser',
        'Create the systemd socket/service for Gunicorn and the Nginx site; enable both',
        'Run certbot for HTTPS and test https://portal.example.com',
      ],
      code: `# 1. System packages
sudo apt update && sudo apt install -y python3-venv python3-dev build-essential \\
     default-libmysqlclient-dev pkg-config mysql-server nginx certbot python3-certbot-nginx

# 2. MySQL
sudo mysql
CREATE DATABASE student_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'portal_user'@'localhost' IDENTIFIED BY 'StrongDbPass#2026';
GRANT ALL PRIVILEGES ON student_portal.* TO 'portal_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 3. Code and venv
sudo mkdir -p /srv/student_portal && sudo chown $USER:www-data /srv/student_portal
git clone https://github.com/<you>/student_portal.git /srv/student_portal
cd /srv/student_portal
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# 4. /srv/student_portal/.env
DJANGO_SECRET_KEY=<generated-key>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=portal.example.com,www.portal.example.com
DATABASE_URL=mysql://portal_user:StrongDbPass%232026@127.0.0.1:3306/student_portal
MEDIA_ROOT=/srv/student_portal/media

# 5. Django setup
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
python manage.py check --deploy

# 6a. /etc/systemd/system/gunicorn.socket
[Unit]
Description=gunicorn socket for student portal

[Socket]
ListenStream=/run/gunicorn.sock

[Install]
WantedBy=sockets.target

# 6b. /etc/systemd/system/gunicorn.service
[Unit]
Description=Gunicorn daemon for Student Portal
Requires=gunicorn.socket
After=network.target

[Service]
User=deploy
Group=www-data
WorkingDirectory=/srv/student_portal
EnvironmentFile=/srv/student_portal/.env
ExecStart=/srv/student_portal/venv/bin/gunicorn \\
          --access-logfile - \\
          --workers 3 \\
          --timeout 60 \\
          --bind unix:/run/gunicorn.sock \\
          portal.wsgi:application
Restart=on-failure

[Install]
WantedBy=multi-user.target

sudo systemctl daemon-reload
sudo systemctl enable --now gunicorn.socket
sudo systemctl status gunicorn

# 6c. /etc/nginx/sites-available/student_portal
server {
    listen 80;
    server_name portal.example.com www.portal.example.com;
    client_max_body_size 10M;

    location = /favicon.ico { access_log off; log_not_found off; }

    location /static/ {
        alias /srv/student_portal/staticfiles/;
        expires 30d;
    }

    location /media/ {
        alias /srv/student_portal/media/;
    }

    location / {
        include proxy_params;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://unix:/run/gunicorn.sock;
    }
}

sudo ln -s /etc/nginx/sites-available/student_portal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
sudo ufw allow 'Nginx Full'

# 7. HTTPS with Let's Encrypt
sudo certbot --nginx -d portal.example.com -d www.portal.example.com

# Redeploy after a git push
cd /srv/student_portal && git pull && source venv/bin/activate \\
  && pip install -r requirements.txt && python manage.py migrate \\
  && python manage.py collectstatic --noinput && sudo systemctl restart gunicorn

# Logs
sudo journalctl -u gunicorn -f
sudo tail -f /var/log/nginx/error.log`,
      result: 'nginx -t prints "syntax is ok ... test is successful". systemctl status gunicorn shows "active (running)". https://portal.example.com loads with a valid padlock and http:// redirects to https://.',
      explanation: 'Nginx serves /static/ and /media/ directly from disk and forwards everything else to Gunicorn through a Unix socket. X-Forwarded-Proto lets Django (SECURE_PROXY_SSL_HEADER) know the original request was HTTPS.',
    },
    {
      title: 'Deploy to Render and PythonAnywhere',
      scenario: 'Deploy the same repository to a PaaS without managing servers.',
      steps: [
        'Render: push the repo to GitHub, click New > Web Service (or Blueprint with render.yaml), connect the repo',
        'Render: Build Command ./build.sh, Start Command gunicorn portal.wsgi:application, add env vars, deploy',
        'PythonAnywhere: open a Bash console, git clone the repo, mkvirtualenv and pip install -r requirements.txt',
        'PythonAnywhere: Databases tab > create MySQL DB; Web tab > Add new web app > Manual configuration (Python 3.12)',
        'PythonAnywhere: edit the WSGI file, set virtualenv path, static file mappings, then click Reload',
      ],
      code: `# render.yaml (Blueprint)
services:
  - type: web
    name: student-portal
    runtime: python
    buildCommand: "./build.sh"
    startCommand: "gunicorn portal.wsgi:application --workers 3"
    envVars:
      - key: PYTHON_VERSION
        value: 3.12.7
      - key: DJANGO_SECRET_KEY
        generateValue: true
      - key: DJANGO_DEBUG
        value: "False"
      - key: DJANGO_ALLOWED_HOSTS
        value: student-portal.onrender.com
      - key: DATABASE_URL
        sync: false            # paste your MySQL/PostgreSQL URL in the dashboard
# Note: Render's disk is ephemeral; store media on S3/Cloudinary (django-storages) or attach a Render Disk.

# ---------------- PythonAnywhere ----------------
# Bash console
git clone https://github.com/<you>/student_portal.git
cd student_portal
mkvirtualenv portal-venv --python=python3.12
pip install -r requirements.txt

# ~/student_portal/.env
DJANGO_SECRET_KEY=<generated-key>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=asha.pythonanywhere.com
DATABASE_URL=mysql://asha:DbPass@asha.mysql.pythonanywhere-services.com/asha$student_portal

python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser

# /var/www/asha_pythonanywhere_com_wsgi.py  (Web tab > WSGI configuration file)
import os
import sys

path = "/home/asha/student_portal"
if path not in sys.path:
    sys.path.insert(0, path)

os.environ["DJANGO_SETTINGS_MODULE"] = "portal.settings"

from dotenv import load_dotenv
load_dotenv(os.path.join(path, ".env"))

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

# Web tab settings
# Virtualenv:     /home/asha/.virtualenvs/portal-venv
# Static files:   URL /static/  ->  Directory /home/asha/student_portal/staticfiles
#                 URL /media/   ->  Directory /home/asha/student_portal/media
# Force HTTPS:    enabled
# Then click the green "Reload" button. Error log link shows tracebacks.`,
      result: 'Render build log ends with "==> Your service is live" at https://student-portal.onrender.com. PythonAnywhere serves the portal at https://asha.pythonanywhere.com with admin CSS loaded.',
      explanation: 'Both platforms run Gunicorn/uWSGI for you. The only per-platform work is environment variables, the start command (Render) or WSGI file (PythonAnywhere), and static mappings.',
    },
    {
      title: 'Pure Python demo: reading config from environment variables',
      scenario: 'Understand how settings read typed values (bool, list, int) from strings in the environment.',
      steps: [
        'Create main.py in VS Code or PyCharm',
        'Run python main.py',
      ],
      code: `import os

os.environ.update({
    "DJANGO_DEBUG": "False",
    "DJANGO_ALLOWED_HOSTS": "portal.example.com, www.portal.example.com",
    "GUNICORN_WORKERS": "5",
})

def env_bool(name, default=False):
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}

def env_list(name, default=""):
    return [x.strip() for x in os.getenv(name, default).split(",") if x.strip()]

def env_int(name, default):
    return int(os.getenv(name, default))

DEBUG = env_bool("DJANGO_DEBUG")
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS")
WORKERS = env_int("GUNICORN_WORKERS", 3)
CPU = 2
print("DEBUG:", DEBUG)
print("ALLOWED_HOSTS:", ALLOWED_HOSTS)
print("Workers:", WORKERS, "| recommended:", 2 * CPU + 1)
print("SECRET_KEY set:", "DJANGO_SECRET_KEY" in os.environ)`,
      python: {
        files: {
          'main.py': `import os

os.environ.update({
    "DJANGO_DEBUG": "False",
    "DJANGO_ALLOWED_HOSTS": "portal.example.com, www.portal.example.com",
    "GUNICORN_WORKERS": "5",
})

def env_bool(name, default=False):
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}

def env_list(name, default=""):
    return [x.strip() for x in os.getenv(name, default).split(",") if x.strip()]

def env_int(name, default):
    return int(os.getenv(name, default))

DEBUG = env_bool("DJANGO_DEBUG")
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS")
WORKERS = env_int("GUNICORN_WORKERS", 3)
CPU = 2
print("DEBUG:", DEBUG)
print("ALLOWED_HOSTS:", ALLOWED_HOSTS)
print("Workers:", WORKERS, "| recommended:", 2 * CPU + 1)
print("SECRET_KEY set:", "DJANGO_SECRET_KEY" in os.environ)`,
        },
      },
      result: `DEBUG: False
ALLOWED_HOSTS: ['portal.example.com', 'www.portal.example.com']
Workers: 5 | recommended: 5
SECRET_KEY set: False`,
      explanation: 'Environment variables are always strings, so "False" must be converted carefully (bool("False") would be True!). Lists are split on commas and trimmed.',
    },
  ],
  interview: [
    { q: 'Why not use runserver in production?', a: 'It is single-threaded/limited, not security-hardened, not designed for performance, and does not serve static files with DEBUG=False.', level: 'Easy' },
    { q: 'What is Gunicorn?', a: 'A Python WSGI HTTP server that runs multiple worker processes of your Django app (gunicorn portal.wsgi:application).', level: 'Easy' },
    { q: 'Why put Nginx in front of Gunicorn?', a: 'Nginx handles HTTPS termination, serves static/media files efficiently, buffers slow clients, load-balances and protects Gunicorn workers.', level: 'Medium' },
    { q: 'WSGI vs ASGI?', a: 'WSGI is the synchronous interface (one request per worker at a time). ASGI supports async, long-lived connections like WebSockets, served by Uvicorn/Daphne.', level: 'Medium' },
    { q: 'What does collectstatic do?', a: 'Copies static files from all apps and STATICFILES_DIRS into STATIC_ROOT so the web server or WhiteNoise can serve them.', level: 'Easy' },
    { q: 'What is WhiteNoise?', a: 'Middleware that lets the Python app serve static files efficiently with compression and far-future cache headers; useful on PaaS without Nginx.', level: 'Medium' },
    { q: 'How do you manage secrets in deployment?', a: 'Environment variables (platform dashboard, systemd EnvironmentFile, .env not in Git) or a secrets manager; never hard-code them in settings.py.', level: 'Easy' },
    { q: 'How many Gunicorn workers should you run?', a: 'A common starting point is (2 x CPU cores) + 1, then tune based on memory and load testing.', level: 'Medium' },
    { q: 'Why does the admin look unstyled after deployment?', a: 'Static files are not served: collectstatic not run, wrong STATIC_ROOT, or no WhiteNoise/Nginx location for /static/.', level: 'Easy' },
    { q: 'What is SECURE_PROXY_SSL_HEADER for?', a: 'Behind a proxy, Django sees HTTP from Nginx. The header (X-Forwarded-Proto) tells Django the original request was HTTPS so request.is_secure() and SSL redirect work.', level: 'Hard' },
    { q: 'How do you achieve zero-downtime deploys?', a: 'Run migrations that are backward compatible, then gracefully reload Gunicorn (HUP signal / systemctl reload) or do rolling/blue-green deployments behind a load balancer.', level: 'Hard' },
    { q: 'Where should media files go on Render or Heroku?', a: 'Their file systems are ephemeral, so use object storage (S3, Cloudinary, GCS) via django-storages, or a persistent disk add-on.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a Procfile for Heroku-style platforms that runs migrations on release.',
      hint: 'release: and web: process types.',
      solution: `release: python manage.py migrate --noinput
web: gunicorn portal.wsgi:application --log-file -`,
    },
    {
      task: 'Write a gunicorn.conf.py with 3 workers, 60s timeout and access logs to stdout.',
      hint: 'Gunicorn reads Python variables from the config file.',
      solution: `# gunicorn.conf.py
bind = "0.0.0.0:8000"
workers = 3
timeout = 60
accesslog = "-"
errorlog = "-"
# run: gunicorn -c gunicorn.conf.py portal.wsgi:application`,
    },
    {
      task: 'Write a minimal Dockerfile for the portal.',
      hint: 'python:3.12-slim, install requirements, collectstatic, gunicorn.',
      solution: `FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y build-essential default-libmysqlclient-dev pkg-config && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN DJANGO_SECRET_KEY=build python manage.py collectstatic --noinput
CMD ["gunicorn", "portal.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]`,
    },
    {
      task: 'Add a /healthz/ URL that returns "ok" for load balancer checks.',
      hint: 'A tiny view returning HttpResponse.',
      solution: `from django.http import HttpResponse

def healthz(request):
    return HttpResponse("ok")

path("healthz/", healthz),`,
    },
  ],
  quiz: [
    { question: 'Which command gathers all static files into STATIC_ROOT?', options: ['python manage.py collectstatic', 'python manage.py findstatic', 'python manage.py runserver --static', 'python manage.py migrate'], answer: 0, explanation: 'collectstatic copies files for production serving.' },
    { question: 'In the stack Nginx -> Gunicorn -> Django, Gunicorn is the:', options: ['Database', 'Reverse proxy', 'WSGI application server', 'Cache'], answer: 2, explanation: 'Gunicorn runs the Django WSGI app in worker processes.' },
    { question: 'Which package helps serve static files from Django on Render?', options: ['django-environ', 'WhiteNoise', 'Celery', 'Pillow'], answer: 1, explanation: 'WhiteNoise serves static files efficiently from the app.' },
    { question: 'Recommended starting Gunicorn workers for a 2-core server:', options: ['1', '2', '16', '5'], answer: 3, explanation: '(2 x 2) + 1 = 5.' },
    { question: 'On PythonAnywhere, Django is connected through:', options: ['A WSGI configuration file in the Web tab', 'A Procfile', 'An Nginx file you write', 'manage.py runserver'], answer: 0, explanation: 'PythonAnywhere loads application from the WSGI file.' },
  ],
};
