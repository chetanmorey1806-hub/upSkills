export default {
  id: 'day-03-django-apps-and-settings',
  title: 'Django Apps, settings.py, INSTALLED_APPS',
  module: 'Module 1: Django Basics',
  day: 3,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Create the students app inside the Student Portal project, understand every file in an app, register it in INSTALLED_APPS, and walk through the important settings in settings.py such as DEBUG, ALLOWED_HOSTS, MIDDLEWARE, TEMPLATES and DATABASES.`,
  objectives: [
    `Create an app with python manage.py startapp and explain each generated file`,
    `Register an app in INSTALLED_APPS (short name vs AppConfig path)`,
    `Explain the key settings: DEBUG, ALLOWED_HOSTS, MIDDLEWARE, TEMPLATES, DATABASES, TIME_ZONE`,
    `Wire an app's urls.py into the project's urls.py using include()`,
    `Organise a project into multiple apps following the single-responsibility idea`,
  ],
  theory: [
    {
      heading: `What is a Django app?`,
      content: `An app is a Python package that does one job inside a project, such as managing students, courses, or user accounts. Think of the project as a shopping mall and each app as one shop. Apps keep code organised and can be copied to other projects. Django's own features (admin, auth, sessions) are also apps - that is why they appear in INSTALLED_APPS.`,
      syntax: `python manage.py startapp students

students/
|-- __init__.py
|-- admin.py        <- register models for the admin panel
|-- apps.py         <- AppConfig class (app name, settings)
|-- migrations/     <- database migration files (auto-generated)
|   \`-- __init__.py
|-- models.py       <- database models
|-- tests.py        <- unit tests
\`-- views.py        <- view functions/classes
# You create these yourself:
|-- urls.py         <- app-level URL patterns
|-- forms.py        <- forms (Day 14)
\`-- templates/students/   <- app templates`,
    },
    {
      heading: `Registering the app in INSTALLED_APPS`,
      content: `Creating the folder is not enough. Django only "knows" about an app after it is added to INSTALLED_APPS. Only then will Django find its models (for migrations), templates, static files, admin registrations and management commands.`,
      syntax: `# student_portal/settings.py
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Local apps
    "students",                     # short form
    # or the explicit form: "students.apps.StudentsConfig",
]`,
      points: [
        `Short form "students": Django automatically uses the single AppConfig found in students/apps.py.`,
        `Explicit form "students.apps.StudentsConfig": recommended when you customise AppConfig (e.g. ready() for signals).`,
        `Keep a comment separating built-in, third-party and local apps - very readable.`,
        `Order matters for templates and static files: the first app that has a matching file wins.`,
      ],
      tip: `Forgot to add the app? makemigrations will say "No changes detected" and templates in the app will give TemplateDoesNotExist.`,
    },
    {
      heading: `apps.py and AppConfig`,
      content: `Each app has an AppConfig class that stores metadata. verbose_name changes how the app is displayed in the admin. The ready() method runs once when Django starts, and is the right place to import signals.`,
      syntax: `# students/apps.py
from django.apps import AppConfig

class StudentsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "students"                  # full Python path of the app
    verbose_name = "Student Records"   # shown in admin

    def ready(self):
        # import students.signals  (Day 24)
        pass`,
    },
    {
      heading: `Tour of settings.py`,
      content: `settings.py is a plain Python module. Every variable in CAPITAL letters is a setting. You can read settings anywhere with from django.conf import settings.`,
      points: [
        `DEBUG = True shows detailed yellow error pages. Must be False in production, or attackers see your code and settings.`,
        `ALLOWED_HOSTS: list of domains allowed to serve the site. Empty is fine while DEBUG=True; required when DEBUG=False (e.g. ["127.0.0.1", "studentportal.in"]).`,
        `MIDDLEWARE: an ordered list of hooks that process every request/response (SecurityMiddleware, SessionMiddleware, CsrfViewMiddleware, AuthenticationMiddleware, MessageMiddleware...).`,
        `ROOT_URLCONF: the module holding the root URL patterns ("student_portal.urls").`,
        `TEMPLATES: template engine config. DIRS lists project-level template folders; APP_DIRS=True also searches each app's templates/ folder.`,
        `DATABASES: connection settings (SQLite default; MySQL from Day 7).`,
        `LANGUAGE_CODE, TIME_ZONE, USE_TZ: localisation. Use "Asia/Kolkata" for India.`,
        `STATIC_URL, STATICFILES_DIRS, MEDIA_URL, MEDIA_ROOT: static and uploaded files (Day 6).`,
      ],
    },
    {
      heading: `Connecting app URLs with include()`,
      content: `Each app should own its URLs in its own urls.py. The project urls.py then includes them under a prefix. This means you can change the prefix in one place, and the app stays reusable.`,
      syntax: `# student_portal/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("students/", include("students.urls")),   # all student URLs start with /students/
]`,
      tip: `app_name = "students" inside the app urls.py creates a namespace, so you can reverse URLs as "students:list" without clashing with other apps.`,
    },
    {
      heading: `How to split a project into apps`,
      content: `A good rule: if you can describe the app in one sentence without using "and", it is the right size. For a Student Portal: students (student records), courses (courses and subjects), accounts (login/registration), attendance, results. Avoid one huge "main" app with everything.`,
      points: [
        `App names: short, plural, lowercase, no hyphens (students, courses).`,
        `Never name an app the same as a Python module (e.g. "test", "email", "django").`,
        `Apps can import each other's models, e.g. from courses.models import Course.`,
      ],
    },
  ],
  examples: [
    {
      title: `Create the students app and show a first page`,
      scenario: `Add the first feature app to the Student Portal and connect it so /students/ shows a welcome message.`,
      steps: [
        `Activate the venv and open the project folder in VS Code or PyCharm.`,
        `Terminal: python manage.py startapp students.`,
        `Add "students" to INSTALLED_APPS in settings.py.`,
        `Create students/urls.py (new file) and edit students/views.py and student_portal/urls.py as shown.`,
        `PyCharm: right-click the students folder > New > Python File > urls. VS Code: click the "New File" icon in Explorer.`,
        `Run python manage.py runserver and open http://127.0.0.1:8000/students/.`,
      ],
      code: `# Project tree after this step
student_portal/
|-- manage.py
|-- db.sqlite3
|-- student_portal/
|   |-- settings.py
|   \`-- urls.py
\`-- students/
    |-- __init__.py
    |-- admin.py
    |-- apps.py
    |-- migrations/
    |-- models.py
    |-- tests.py
    |-- urls.py        <- NEW
    \`-- views.py

# student_portal/settings.py
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "students.apps.StudentsConfig",   # local app
]

# students/views.py
from django.http import HttpResponse

def index(request):
    return HttpResponse("<h1>Students app is working!</h1>")

# students/urls.py
from django.urls import path
from . import views

app_name = "students"
urlpatterns = [
    path("", views.index, name="index"),
]

# student_portal/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("students/", include("students.urls")),
]`,
      result: `http://127.0.0.1:8000/students/  ->  Students app is working!  (big heading)
http://127.0.0.1:8000/          ->  404 Page not found (only admin/ and students/ are defined)`,
      explanation: `The request for /students/ matches "students/" in the root URLconf, the remaining empty path "" matches inside students.urls, and views.index returns an HttpResponse. The home page 404s because we have not mapped "" in the root yet (we will on Day 4).`,
    },
    {
      title: `Customise settings for an Indian college portal`,
      scenario: `Configure time zone, templates folder, allowed hosts and the AppConfig display name.`,
      steps: [
        `Edit student_portal/settings.py as below.`,
        `Create a folder templates/ next to manage.py (right-click project root > New > Directory in PyCharm).`,
        `Edit students/apps.py to set verbose_name.`,
        `Restart runserver and check there are no errors (python manage.py check).`,
      ],
      code: `# student_portal/settings.py (changed parts)
DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],    # project-level templates folder
        "APP_DIRS": True,                     # also search <app>/templates/
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# students/apps.py
from django.apps import AppConfig

class StudentsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "students"
    verbose_name = "Student Records"

# Terminal
python manage.py check`,
      result: `System check identified no issues (0 silenced).`,
      explanation: `python manage.py check validates settings and apps without starting the server. DIRS points to a shared templates folder; APP_DIRS=True lets each app ship its own templates. verbose_name will appear as the section title in the admin panel.`,
    },
    {
      title: `Reading settings from your own code`,
      scenario: `Show a debug page that reads values from settings - useful to confirm which settings file is loaded.`,
      steps: [
        `Add a view settings_info to students/views.py.`,
        `Add path("settings-info/", views.settings_info) to students/urls.py.`,
        `Visit http://127.0.0.1:8000/students/settings-info/.`,
      ],
      code: `# students/views.py
from django.conf import settings
from django.http import HttpResponse

def settings_info(request):
    lines = [
        f"DEBUG = {settings.DEBUG}",
        f"TIME_ZONE = {settings.TIME_ZONE}",
        f"Apps installed = {len(settings.INSTALLED_APPS)}",
        f"Database engine = {settings.DATABASES['default']['ENGINE']}",
    ]
    return HttpResponse("<br>".join(lines))

# students/urls.py
urlpatterns = [
    path("", views.index, name="index"),
    path("settings-info/", views.settings_info, name="settings_info"),
]`,
      result: `DEBUG = True
TIME_ZONE = Asia/Kolkata
Apps installed = 7
Database engine = django.db.backends.sqlite3`,
      explanation: `Always import settings with from django.conf import settings, never "from student_portal import settings" - the former respects DJANGO_SETTINGS_MODULE and default values. Never expose such a page in production.`,
    },
    {
      title: `Pure Python: how INSTALLED_APPS lookup works`,
      scenario: `Simulate how Django searches installed apps in order for a template, to understand why order and registration matter.`,
      steps: [
        `Create main.py in VS Code/PyCharm.`,
        `Run python main.py.`,
        `Try removing "students" from INSTALLED_APPS and run again.`,
      ],
      code: `INSTALLED_APPS = ["django.contrib.admin", "students", "courses"]
APP_TEMPLATES = {
    "django.contrib.admin": ["admin/base.html"],
    "students": ["students/list.html", "base.html"],
    "courses": ["courses/list.html", "base.html"],
}

def find_template(name):
    for app in INSTALLED_APPS:
        if name in APP_TEMPLATES.get(app, []):
            return f"{name} found in app '{app}'"
    return f"TemplateDoesNotExist: {name}"

for t in ["students/list.html", "base.html", "teachers/list.html"]:
    print(find_template(t))`,
      python: {
        files: {
          'main.py': `INSTALLED_APPS = ["django.contrib.admin", "students", "courses"]
APP_TEMPLATES = {
    "django.contrib.admin": ["admin/base.html"],
    "students": ["students/list.html", "base.html"],
    "courses": ["courses/list.html", "base.html"],
}

def find_template(name):
    for app in INSTALLED_APPS:
        if name in APP_TEMPLATES.get(app, []):
            return f"{name} found in app '{app}'"
    return f"TemplateDoesNotExist: {name}"

for t in ["students/list.html", "base.html", "teachers/list.html"]:
    print(find_template(t))
`,
        },
      },
      result: `students/list.html found in app 'students'
base.html found in app 'students'
TemplateDoesNotExist: teachers/list.html`,
      explanation: `Django's app-directories loader walks INSTALLED_APPS in order and returns the first match. base.html exists in both students and courses, but students is listed first, so its copy wins. A template in no installed app raises TemplateDoesNotExist - exactly what happens if you forget to register an app. This is also why we namespace templates as templates/students/... inside each app.`,
    },
  ],
  interview: [
    { q: `What is a Django app and how is it different from a project?`, a: `An app is a reusable module that provides one feature (models, views, templates for, say, students). A project is the collection of apps plus configuration (settings, root URLs, WSGI/ASGI). A project has many apps.`, level: 'Easy' },
    { q: `What happens if you create an app but forget to add it to INSTALLED_APPS?`, a: `Django ignores it: makemigrations finds no models, app templates/static files are not found, admin registrations and management commands are not loaded.`, level: 'Easy' },
    { q: `What is the purpose of apps.py?`, a: `It defines an AppConfig subclass with the app's name, label, verbose_name and default_auto_field, and a ready() hook that runs at startup (commonly used to register signals).`, level: 'Medium' },
    { q: `Why must DEBUG be False in production?`, a: `With DEBUG=True Django shows full tracebacks, settings and SQL to anyone who triggers an error, and keeps queries in memory. It is a serious security and performance risk.`, level: 'Easy' },
    { q: `What is ALLOWED_HOSTS?`, a: `A list of host/domain names the site can serve. It prevents HTTP Host header attacks. When DEBUG=False and the list is empty or wrong, Django returns 400 Bad Request.`, level: 'Medium' },
    { q: `What does include() do in urls.py?`, a: `It delegates matching of the rest of the URL to another URLconf module (usually an app's urls.py), allowing modular URL design and prefixes.`, level: 'Easy' },
    { q: `Difference between TEMPLATES DIRS and APP_DIRS?`, a: `DIRS is a list of extra folders (e.g. project-level templates/) searched first. APP_DIRS=True makes Django also search the templates/ subfolder of each installed app.`, level: 'Medium' },
    { q: `How do you access settings inside a view?`, a: `from django.conf import settings and then settings.DEBUG, settings.TIME_ZONE etc. This lazy object respects DJANGO_SETTINGS_MODULE and global defaults.`, level: 'Easy' },
    { q: `What is MIDDLEWARE and does its order matter?`, a: `A list of classes that process every request and response globally (security, sessions, CSRF, auth, messages). Order matters: requests go top-to-bottom, responses bottom-to-top; e.g. AuthenticationMiddleware needs SessionMiddleware before it.`, level: 'Hard' },
    { q: `What is python manage.py check?`, a: `It runs Django's system check framework to detect common problems in settings, models, URLs and admin without running the server or touching the database.`, level: 'Medium' },
  ],
  practice: [
    { task: `Create a second app courses, register it, and make /courses/ return "Courses coming soon".`, hint: `startapp, INSTALLED_APPS, courses/urls.py, include().`, solution: `python manage.py startapp courses\n# settings: add "courses"\n# courses/views.py\nfrom django.http import HttpResponse\ndef index(request):\n    return HttpResponse("Courses coming soon")\n# courses/urls.py\nfrom django.urls import path\nfrom . import views\napp_name = "courses"\nurlpatterns = [path("", views.index, name="index")]\n# project urls.py\npath("courses/", include("courses.urls")),` },
    { task: `Set verbose_name of the courses app to "Course Catalogue".`, hint: `apps.py`, solution: `class CoursesConfig(AppConfig):\n    default_auto_field = "django.db.models.BigAutoField"\n    name = "courses"\n    verbose_name = "Course Catalogue"` },
    { task: `Set DEBUG=False and visit the site. What error appears and how do you fix it?`, hint: `ALLOWED_HOSTS`, solution: `runserver refuses to start with "CommandError: You must set settings.ALLOWED_HOSTS if DEBUG is False." Fix: ALLOWED_HOSTS = ["127.0.0.1", "localhost"]. Then set DEBUG back to True for development.` },
    { task: `Add a custom setting PORTAL_NAME = "ABC College Student Portal" and display it from a view.`, hint: `from django.conf import settings`, solution: `# settings.py\nPORTAL_NAME = "ABC College Student Portal"\n# views.py\nfrom django.conf import settings\ndef index(request):\n    return HttpResponse(settings.PORTAL_NAME)` },
  ],
  quiz: [
    { question: `Which command creates an app called students?`, options: [`django-admin startproject students`, `python manage.py startapp students`, `python manage.py createapp students`, `pip install students`], answer: 1, explanation: `startapp creates an app inside the current project.` },
    { question: `Where must you register a new app?`, options: [`MIDDLEWARE`, `urls.py`, `INSTALLED_APPS`, `TEMPLATES`], answer: 2, explanation: `Apps are registered in the INSTALLED_APPS list in settings.py.` },
    { question: `Which file is NOT created automatically by startapp?`, options: [`urls.py`, `models.py`, `admin.py`, `apps.py`], answer: 0, explanation: `You create the app-level urls.py yourself.` },
    { question: `Which setting must be filled when DEBUG = False?`, options: [`SECRET_KEY only`, `TIME_ZONE`, `STATIC_ROOT`, `ALLOWED_HOSTS`], answer: 3, explanation: `Without ALLOWED_HOSTS, Django refuses to serve requests when DEBUG is False.` },
    { question: `APP_DIRS = True in TEMPLATES means:`, options: [`Templates are disabled`, `Django searches each app's templates/ folder`, `Only the project templates folder is used`, `Apps are auto-installed`], answer: 1, explanation: `APP_DIRS enables the app directories template loader.` },
  ],
};
