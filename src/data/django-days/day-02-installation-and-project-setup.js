export default {
  id: 'day-02-installation-and-project-setup',
  title: 'Installation, Virtual Environment, Creating a Project, Project Structure, runserver',
  module: 'Module 1: Django Basics',
  day: 2,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Install Django 5 inside a virtual environment, create the student_portal project with django-admin, understand every generated file, and start the development server from the terminal, VS Code and PyCharm.`,
  objectives: [
    `Create and activate a Python virtual environment on Windows, macOS and Linux`,
    `Install Django 5 with pip and freeze it into requirements.txt`,
    `Create a project with django-admin startproject and explain every generated file`,
    `Run the development server, change the port, and apply the initial migrations`,
    `Set up the same project in VS Code and in PyCharm`,
  ],
  theory: [
    {
      heading: `Why a virtual environment?`,
      content: `A virtual environment (venv) is a private, isolated copy of Python for one project. Packages installed in it do not affect other projects. Project A can use Django 4.2 while project B uses Django 5.1 on the same laptop. Always create a venv before installing Django.`,
      syntax: `# Windows (Command Prompt / PowerShell)
python -m venv venv
venv\\Scripts\\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate

# You will see (venv) at the start of the prompt.
# To leave the environment:
deactivate`,
      tip: `PowerShell error "running scripts is disabled"? Run once: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned, then activate again.`,
    },
    {
      heading: `Installing Django 5`,
      content: `With the venv active, install Django using pip. Then save the exact versions into requirements.txt so teammates and servers can install the same versions.`,
      syntax: `python -m pip install --upgrade pip
pip install "django>=5.0,<6.0"
python -m django --version        # e.g. 5.1.4
pip freeze > requirements.txt     # save dependencies
pip install -r requirements.txt   # (on another machine) install them`,
      points: [
        `pip install django installs the latest stable 5.x version along with asgiref, sqlparse (and tzdata on Windows).`,
        `python -m django --version confirms the installation.`,
        `Do not name your own file django.py - it will shadow the real package.`,
      ],
    },
    {
      heading: `Creating the project: django-admin startproject`,
      content: `django-admin is a command-line tool installed with Django. startproject generates the skeleton of a project. Adding a dot (.) at the end creates the files in the current folder instead of creating an extra nested folder - this keeps the tree clean.`,
      syntax: `mkdir student_portal
cd student_portal
python -m venv venv
venv\\Scripts\\activate            # or: source venv/bin/activate
pip install django
django-admin startproject student_portal .

# Resulting tree
student_portal/                 <- outer folder (any name, just a container)
|-- venv/
|-- manage.py                   <- command runner for this project
|-- requirements.txt
\`-- student_portal/             <- project package (Python package)
    |-- __init__.py             <- marks the folder as a package
    |-- settings.py             <- all configuration
    |-- urls.py                 <- root URL routes (ROOT_URLCONF)
    |-- asgi.py                 <- entry point for async servers
    \`-- wsgi.py                 <- entry point for WSGI servers (Gunicorn)`,
    },
    {
      heading: `What each generated file does`,
      content: `Knowing the purpose of each file is a very common interview question.`,
      points: [
        `manage.py: a thin wrapper around django-admin that sets DJANGO_SETTINGS_MODULE=student_portal.settings. Every command runs through it: runserver, startapp, makemigrations, migrate, createsuperuser, shell.`,
        `settings.py: BASE_DIR, SECRET_KEY, DEBUG, ALLOWED_HOSTS, INSTALLED_APPS, MIDDLEWARE, ROOT_URLCONF, TEMPLATES, DATABASES, AUTH_PASSWORD_VALIDATORS, LANGUAGE_CODE, TIME_ZONE, STATIC_URL, DEFAULT_AUTO_FIELD.`,
        `urls.py: the main list of URL patterns; by default only admin/.`,
        `wsgi.py / asgi.py: expose the "application" object used by production servers.`,
        `__init__.py: empty file that makes the folder a Python package.`,
        `db.sqlite3: appears after the first migrate/runserver - the default SQLite database file.`,
      ],
    },
    {
      heading: `runserver and migrate`,
      content: `runserver starts Django's lightweight development server with auto-reload: whenever you save a .py file, it restarts automatically. It is only for development, never for production. On the first run you will see a warning about 18 unapplied migrations - these create tables for built-in apps (auth, admin, sessions). Run migrate to apply them.`,
      syntax: `python manage.py runserver              # http://127.0.0.1:8000/
python manage.py runserver 8080         # different port
python manage.py runserver 0.0.0.0:8000 # accessible on your LAN
python manage.py migrate                # create built-in tables in db.sqlite3
python manage.py createsuperuser        # admin login (username, email, password)
# Stop the server: Ctrl + C`,
      tip: `"Error: That port is already in use" means another server is running. Stop it with Ctrl+C in that terminal, or use another port: runserver 8001.`,
    },
    {
      heading: `Setting up in VS Code and PyCharm`,
      content: `Both IDEs work well; choose one and stay consistent.`,
      points: [
        `VS Code 1: File > Open Folder > select student_portal.`,
        `VS Code 2: Install extensions "Python" (Microsoft) and optionally "Django" (Baptiste Darthenay) for template highlighting.`,
        `VS Code 3: Ctrl+Shift+P > "Python: Select Interpreter" > choose .\\venv\\Scripts\\python.exe (or ./venv/bin/python).`,
        `VS Code 4: Terminal > New Terminal (it auto-activates the venv) > python manage.py runserver.`,
        `PyCharm Professional: File > New Project > Django > location student_portal, interpreter "New Virtualenv", project name student_portal > Create. It generates the project and a run configuration; click the green Run button.`,
        `PyCharm Community (no Django template): File > New Project > Pure Python with new venv > open Terminal tab > pip install django > django-admin startproject student_portal . > Run > Edit Configurations > + Python > script: manage.py, parameters: runserver.`,
      ],
    },
  ],
  examples: [
    {
      title: `Create the Student Portal project from scratch (terminal)`,
      scenario: `Set up the project that we will use for the rest of the course, using only the terminal.`,
      steps: [
        `Open a terminal (VS Code: Terminal > New Terminal; PyCharm: Terminal tab at the bottom).`,
        `Run the commands below one by one.`,
        `Open http://127.0.0.1:8000/ in the browser - you should see the rocket page "The install worked successfully!"`,
      ],
      code: `# 1. Create folder and virtual environment
mkdir student_portal
cd student_portal
python -m venv venv

# 2. Activate
venv\\Scripts\\activate          # Windows
source venv/bin/activate        # macOS / Linux

# 3. Install Django 5 and save requirements
pip install "django>=5.0,<6.0"
pip freeze > requirements.txt

# 4. Create project in current folder (note the dot)
django-admin startproject student_portal .

# 5. Create built-in tables and an admin user
python manage.py migrate
python manage.py createsuperuser

# 6. Start the server
python manage.py runserver`,
      result: `Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
November 17, 2026 - 10:15:02
Django version 5.1.4, using settings 'student_portal.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.`,
      explanation: `The venv isolates packages, startproject generates the skeleton, migrate creates tables for auth/admin/sessions in db.sqlite3 and runserver serves the site. Visit /admin/ and log in with the superuser you created.`,
    },
    {
      title: `requirements.txt and the generated settings.py`,
      scenario: `Look at the important parts of the generated settings.py file and the requirements file so you know what you will edit in later days.`,
      steps: [
        `Open student_portal/settings.py in VS Code or PyCharm.`,
        `Find each setting shown below and read the comment.`,
        `Do not change SECRET_KEY now; we will move it to an environment variable in the security lesson.`,
      ],
      code: `# requirements.txt
asgiref==3.8.1
Django==5.1.4
sqlparse==0.5.2
tzdata==2024.2      # only on Windows

# student_portal/settings.py (generated, trimmed)
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent   # outer student_portal folder

SECRET_KEY = "django-insecure-...change-me..."   # used for signing cookies, tokens
DEBUG = True                                      # detailed error pages (False in production)
ALLOWED_HOSTS = []                                # e.g. ["studentportal.com"] in production

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

ROOT_URLCONF = "student_portal.urls"
WSGI_APPLICATION = "student_portal.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"          # change to "Asia/Kolkata" for India
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"`,
      result: `Nothing is printed - this is configuration. After python manage.py migrate a db.sqlite3 file appears next to manage.py.`,
      explanation: `BASE_DIR is built with pathlib so paths work on all operating systems. SQLite is the default database - perfect for learning because it needs no server. On Day 7 we will switch DATABASES to MySQL 8.`,
    },
    {
      title: `Run the project from VS Code and PyCharm with a debugger`,
      scenario: `Instead of typing runserver every time, create a reusable run/debug configuration in each IDE.`,
      steps: [
        `VS Code: open the Run and Debug panel (Ctrl+Shift+D) > "create a launch.json file" > choose Python Debugger > Django. Save the file shown below as .vscode/launch.json. Press F5.`,
        `PyCharm: Run > Edit Configurations > + > Django Server (Professional) or Python (Community: script manage.py, parameters runserver). Click Run or Debug.`,
        `Put a breakpoint in any view later and the server will stop there.`,
      ],
      code: `// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Django: runserver",
      "type": "debugpy",
      "request": "launch",
      "program": "\${workspaceFolder}/manage.py",
      "args": ["runserver"],
      "django": true,
      "justMyCode": true
    }
  ]
}

# PyCharm Community run configuration (Run > Edit Configurations > + Python)
Name:              runserver
Script path:       <project>/manage.py
Parameters:        runserver
Working directory: <project>
Python interpreter: <project>/venv`,
      result: `Pressing F5 (VS Code) or the green Run button (PyCharm) starts the server and prints "Starting development server at http://127.0.0.1:8000/".`,
      explanation: `"django": true tells the VS Code debugger to also allow breakpoints in templates. PyCharm stores run configurations in the .idea folder. Both use the interpreter from the venv.`,
    },
    {
      title: `Check your environment with a tiny Python script`,
      scenario: `Write a quick script that prints the Python version info and verifies that it is new enough for Django 5. This catches the most common installation problem early.`,
      steps: [
        `Create check_env.py as main.py in any folder.`,
        `Run python main.py inside the activated venv.`,
        `If it says "too old", install Python 3.12 and recreate the venv.`,
      ],
      code: `import sys

major, minor = sys.version_info[:2]
print("Python", f"{major}.{minor}")
if (major, minor) >= (3, 10):
    print("OK: compatible with Django 5")
else:
    print("Too old: install Python 3.10+")
inside_venv = sys.prefix != sys.base_prefix
print("Running inside a venv:", inside_venv)`,
      python: {
        files: {
          'main.py': `import sys

major, minor = sys.version_info[:2]
print("Python", f"{major}.{minor}")
if (major, minor) >= (3, 10):
    print("OK: compatible with Django 5")
else:
    print("Too old: install Python 3.10+")
inside_venv = sys.prefix != sys.base_prefix
print("Running inside a venv:", inside_venv)
`,
        },
      },
      result: `Python 3.12
OK: compatible with Django 5
Running inside a venv: False`,
      explanation: `sys.version_info gives the running version. sys.prefix differs from sys.base_prefix only inside a virtual environment, so the last line prints True once you activate your venv (False when run with the system Python, as here).`,
    },
  ],
  interview: [
    { q: `Why should you use a virtual environment for Django projects?`, a: `To isolate project dependencies. Each project can have its own Django and package versions without conflicts, and requirements.txt can reproduce the exact environment.`, level: 'Easy' },
    { q: `What is the difference between django-admin and manage.py?`, a: `django-admin is the global command tool installed with Django. manage.py does the same but automatically sets DJANGO_SETTINGS_MODULE to the project's settings, so commands run in the project context. Use django-admin only for startproject; use manage.py for everything else.`, level: 'Medium' },
    { q: `What files does startproject create?`, a: `manage.py and a package with __init__.py, settings.py, urls.py, asgi.py and wsgi.py.`, level: 'Easy' },
    { q: `What does the dot in "django-admin startproject student_portal ." do?`, a: `It creates the project in the current directory instead of creating an extra outer folder with the same name, avoiding student_portal/student_portal/student_portal nesting.`, level: 'Easy' },
    { q: `Is runserver suitable for production?`, a: `No. It is a single-process development server with no security hardening or performance tuning. Use Gunicorn/uWSGI (WSGI) or Uvicorn/Daphne (ASGI) behind Nginx in production.`, level: 'Easy' },
    { q: `What does migrate do on a fresh project?`, a: `It applies the migrations of the built-in apps (admin, auth, contenttypes, sessions), creating their tables in the configured database (db.sqlite3 by default).`, level: 'Medium' },
    { q: `What is BASE_DIR?`, a: `A pathlib.Path pointing to the outer project directory (the folder containing manage.py). It is used to build OS-independent paths for the database, templates, static and media folders.`, level: 'Easy' },
    { q: `What is the role of SECRET_KEY?`, a: `It is used for cryptographic signing: sessions, CSRF tokens, password reset tokens, signed cookies. It must be kept secret and loaded from an environment variable in production.`, level: 'Medium' },
    { q: `How do you run the server on a different port or make it visible on the network?`, a: `python manage.py runserver 8080 for a port; python manage.py runserver 0.0.0.0:8000 to listen on all interfaces (also add the IP to ALLOWED_HOSTS).`, level: 'Easy' },
    { q: `What is the difference between wsgi.py and asgi.py?`, a: `wsgi.py exposes a synchronous WSGI application for servers like Gunicorn. asgi.py exposes an ASGI application for async servers like Uvicorn/Daphne, enabling async views and WebSockets (with Channels).`, level: 'Hard' },
  ],
  practice: [
    { task: `Create a new project called library_portal in its own venv, install Django 5 and run it on port 8050.`, hint: `startproject with a dot, then runserver 8050.`, solution: `mkdir library_portal && cd library_portal\npython -m venv venv\nvenv\\Scripts\\activate  (or source venv/bin/activate)\npip install django\ndjango-admin startproject library_portal .\npython manage.py migrate\npython manage.py runserver 8050` },
    { task: `Change TIME_ZONE to Indian time and restart the server. What does the startup message show?`, hint: `Asia/Kolkata`, solution: `In settings.py set TIME_ZONE = "Asia/Kolkata". The date/time printed by runserver now shows IST.` },
    { task: `Create a superuser and log in to /admin/. Which two models can you see?`, hint: `They come from django.contrib.auth.`, solution: `python manage.py createsuperuser, then open http://127.0.0.1:8000/admin/. You see Groups and Users under "Authentication and Authorization".` },
    { task: `Generate requirements.txt, delete the venv, recreate it and reinstall from the file.`, hint: `pip freeze and pip install -r.`, solution: `pip freeze > requirements.txt\ndeactivate\nrmdir /s venv (Windows) or rm -rf venv\npython -m venv venv && activate\npip install -r requirements.txt` },
  ],
  quiz: [
    { question: `Which command creates a new Django project?`, options: [`python manage.py startapp`, `django-admin startproject`, `pip install project`, `python manage.py newproject`], answer: 1, explanation: `django-admin startproject <name> creates the project skeleton.` },
    { question: `On Windows, how do you activate a venv named venv?`, options: [`source venv/bin/activate`, `activate venv`, `venv\\Scripts\\activate`, `python venv`], answer: 2, explanation: `Windows uses venv\\Scripts\\activate; macOS/Linux use source venv/bin/activate.` },
    { question: `Which file stores the database configuration?`, options: [`urls.py`, `wsgi.py`, `manage.py`, `settings.py`], answer: 3, explanation: `DATABASES is defined in settings.py.` },
    { question: `Default address of the development server?`, options: [`http://127.0.0.1:8000/`, `http://localhost:5000/`, `http://127.0.0.1:3000/`, `http://localhost:8080/`], answer: 0, explanation: `runserver listens on 127.0.0.1:8000 by default (Flask uses 5000).` },
    { question: `Which database does a new Django project use by default?`, options: [`MySQL`, `PostgreSQL`, `SQLite`, `MongoDB`], answer: 2, explanation: `The default ENGINE is django.db.backends.sqlite3 with the file db.sqlite3.` },
  ],
};
