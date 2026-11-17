export default {
  id: 'day-06-static-and-media-files',
  title: 'Static Files and Media Files',
  module: 'Module 1: Django Basics',
  day: 6,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Add CSS, JavaScript and images to the Student Portal with Django's staticfiles app, understand STATIC_URL, STATICFILES_DIRS and STATIC_ROOT, run collectstatic, and configure MEDIA_URL and MEDIA_ROOT for user-uploaded files such as student photos.`,
  objectives: [
    `Explain the difference between static files and media files`,
    `Configure STATIC_URL, STATICFILES_DIRS, STATIC_ROOT, MEDIA_URL and MEDIA_ROOT`,
    `Use {% load static %} and {% static %} in templates`,
    `Serve media files during development with static() in urls.py`,
    `Understand collectstatic and how static/media are served in production`,
  ],
  theory: [
    {
      heading: `Static vs Media files`,
      content: `Static files are files YOU (the developer) ship with the code: CSS, JavaScript, logos, fonts. They are the same for every user and are version-controlled in Git. Media files are files your USERS upload at runtime: profile photos, assignment PDFs, ID cards. They are not in Git and grow over time. Django handles them with different settings because they have different security and storage needs.`,
      points: [
        `Static: style.css, app.js, logo.png -> STATIC_URL / STATICFILES_DIRS / STATIC_ROOT`,
        `Media: media/students/photos/asha.jpg -> MEDIA_URL / MEDIA_ROOT`,
        `Analogy: static files are the furniture of a classroom (fixed, set up by the college); media files are the notebooks students bring in.`,
      ],
    },
    {
      heading: `Static settings`,
      content: `django.contrib.staticfiles (already in INSTALLED_APPS) finds and serves static files in development when DEBUG=True.`,
      syntax: `# settings.py
STATIC_URL = "static/"                    # URL prefix: /static/css/style.css
STATICFILES_DIRS = [BASE_DIR / "static"]  # extra project-level folders you create
STATIC_ROOT = BASE_DIR / "staticfiles"    # where collectstatic COPIES everything (production)`,
      points: [
        `App static files go in <app>/static/<app>/ (e.g. students/static/students/students.css) - found automatically, like templates.`,
        `Project-wide static files go in the folders listed in STATICFILES_DIRS.`,
        `STATIC_ROOT must NOT be the same folder as any STATICFILES_DIRS entry.`,
      ],
    },
    {
      heading: `Using static files in templates`,
      content: `Load the static tag library once per template (yes, even in child templates - {% load %} is not inherited) and build URLs with {% static %}. Never hard-code "/static/..." - if STATIC_URL changes to a CDN, {% static %} updates every link automatically.`,
      syntax: `{% load static %}
<link rel="stylesheet" href="{% static 'css/style.css' %}">
<script src="{% static 'js/app.js' %}" defer></script>
<img src="{% static 'images/logo.png' %}" alt="College logo">`,
    },
    {
      heading: `Media settings`,
      content: `MEDIA_ROOT is the folder on disk where uploaded files are saved; MEDIA_URL is the URL prefix used to access them. Model fields FileField/ImageField store only the relative path in the database; the file itself lives in MEDIA_ROOT. ImageField needs the Pillow library (pip install Pillow). Full upload forms come on Day 19.`,
      syntax: `# settings.py
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

# student_portal/urls.py  - serve media in development only
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [ ... ]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# template
<img src="{{ student.photo.url }}">   {# -> /media/students/photos/asha.jpg #}`,
    },
    {
      heading: `collectstatic and production`,
      content: `In production (DEBUG=False), Django does NOT serve static or media files - that job belongs to a web server (Nginx) or a package like WhiteNoise, or cloud storage (S3). python manage.py collectstatic copies every static file from all apps and STATICFILES_DIRS (including admin CSS) into one folder: STATIC_ROOT. Nginx then serves that folder directly.`,
      syntax: `python manage.py collectstatic
# 127 static files copied to '/path/student_portal/staticfiles'.

# Optional: WhiteNoise for simple deployments
pip install whitenoise
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",   # right after SecurityMiddleware
    ...
]`,
      tip: `Common mistakes: forgetting {% load static %} (TemplateSyntaxError: Invalid block tag 'static'), adding "/" at the start of the path in {% static '/css/style.css' %}, and expecting media files to work with DEBUG=False without a web server.`,
    },
  ],
  examples: [
    {
      title: `Add CSS, JS and a logo to the Student Portal`,
      scenario: `Style the base layout with a global stylesheet, a small script and a logo image.`,
      steps: [
        `Create folders static/css, static/js and static/images next to manage.py (PyCharm: right-click project > New > Directory; VS Code: New Folder icon).`,
        `Add the settings below to settings.py.`,
        `Create static/css/style.css and static/js/app.js; place any logo.png in static/images/.`,
        `Update templates/base.html to load static files.`,
        `Restart runserver (new static folders are picked up on restart) and hard-refresh the browser (Ctrl+F5).`,
      ],
      code: `# Project tree
student_portal/
|-- manage.py
|-- static/
|   |-- css/style.css
|   |-- js/app.js
|   \`-- images/logo.png
|-- media/                 <- created automatically on first upload
|-- templates/base.html
|-- student_portal/settings.py
\`-- students/

# student_portal/settings.py
STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

/* static/css/style.css */
body { font-family: Arial, sans-serif; margin: 0; background: #f5f7fb; }
nav { background: #1e3a8a; padding: 12px 20px; }
nav a { color: #fff; margin-right: 15px; text-decoration: none; }
nav img { height: 32px; vertical-align: middle; margin-right: 10px; }
table { border-collapse: collapse; background: #fff; }
th { background: #e0e7ff; }
.fail { color: #b91c1c; font-weight: bold; }

// static/js/app.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("Student Portal loaded");
});

<!-- templates/base.html -->
{% load static %}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{% block title %}Student Portal{% endblock %}</title>
  <link rel="stylesheet" href="{% static 'css/style.css' %}">
  {% block extra_css %}{% endblock %}
</head>
<body>
  <nav>
    <img src="{% static 'images/logo.png' %}" alt="Logo">
    <a href="{% url 'home' %}">Home</a>
    <a href="{% url 'students:list' %}">Students</a>
  </nav>
  <main style="padding:20px">{% block content %}{% endblock %}</main>
  <script src="{% static 'js/app.js' %}" defer></script>
</body>
</html>`,
      result: `Page source shows:
<link rel="stylesheet" href="/static/css/style.css">
<img src="/static/images/logo.png" alt="Logo">
The navbar is dark blue with the logo, and the browser console prints "Student Portal loaded".`,
      explanation: `{% static 'css/style.css' %} joins STATIC_URL with the relative path. With DEBUG=True, the staticfiles app finds the file inside STATICFILES_DIRS and serves it. The extra_css block lets child pages add their own stylesheet.`,
    },
    {
      title: `App-level static file and serving media in development`,
      scenario: `Give the students app its own stylesheet, and configure media URLs so uploaded student photos can be displayed (the model with ImageField arrives on Day 19 - for now we drop a file into media/ manually).`,
      steps: [
        `Create students/static/students/students.css.`,
        `Override the extra_css block in student_list.html.`,
        `Update student_portal/urls.py with the static() helper.`,
        `Create media/students/ and copy any image named asha.jpg into it.`,
        `Visit http://127.0.0.1:8000/media/students/asha.jpg.`,
      ],
      code: `/* students/static/students/students.css */
.topper { background: #fef3c7; }

<!-- students/templates/students/student_list.html (top) -->
{% extends "base.html" %}
{% load static %}
{% block extra_css %}
  <link rel="stylesheet" href="{% static 'students/students.css' %}">
{% endblock %}

# student_portal/urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from students import views as student_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", student_views.home, name="home"),
    path("students/", include("students.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

<!-- later, with a model ImageField called photo -->
{% if student.photo %}
  <img src="{{ student.photo.url }}" width="120" alt="{{ student.name }}">
{% else %}
  <img src="{% static 'images/default-avatar.png' %}" width="120" alt="No photo">
{% endif %}`,
      result: `/static/students/students.css -> served from the app's static folder
/media/students/asha.jpg      -> the image is displayed
With DEBUG=False the media URL returns 404 (production must use Nginx / cloud storage).`,
      explanation: `App static files are found by the AppDirectoriesFinder, just like app templates, and namespaced with the app name. static() adds a URL pattern only when DEBUG is True, which is why it is wrapped in the if.`,
    },
    {
      title: `collectstatic for deployment`,
      scenario: `Prepare static files for production and see where they go.`,
      steps: [
        `Make sure STATIC_ROOT = BASE_DIR / "staticfiles" is set.`,
        `Run python manage.py collectstatic in the VS Code / PyCharm terminal and type yes.`,
        `Open the new staticfiles/ folder and find admin/, css/, students/.`,
        `Add staticfiles/ and media/ to .gitignore.`,
      ],
      code: `python manage.py collectstatic

# .gitignore
venv/
__pycache__/
db.sqlite3
staticfiles/
media/
.env

# Nginx (production) snippet
location /static/ { alias /home/ubuntu/student_portal/staticfiles/; }
location /media/  { alias /home/ubuntu/student_portal/media/; }`,
      result: `You have requested to collect static files at the destination
location as specified in your settings:

    /home/you/student_portal/staticfiles

This will overwrite existing files!
Are you sure you want to do this?

Type 'yes' to continue, or 'no' to cancel: yes

128 static files copied to '/home/you/student_portal/staticfiles'.`,
      explanation: `collectstatic gathers admin CSS/JS plus your own files into one folder so a fast web server can serve them. The count depends on your files (admin alone has ~125). Media is never collected - it is already in MEDIA_ROOT.`,
    },
    {
      title: `Pure Python: how {% static %} and .url build paths`,
      scenario: `Use urllib.parse.urljoin and pathlib to see how URL prefixes and disk paths are combined - a small model of Django's storage classes.`,
      steps: [
        `Create main.py and run python main.py.`,
        `Change STATIC_URL to a CDN address and run again.`,
      ],
      code: `from pathlib import PurePosixPath
from urllib.parse import urljoin

STATIC_URL = "/static/"
MEDIA_URL = "/media/"
BASE_DIR = PurePosixPath("/home/you/student_portal")
MEDIA_ROOT = BASE_DIR / "media"

def static(path):
    return urljoin(STATIC_URL, path)

class FieldFile:
    def __init__(self, name):
        self.name = name                     # what the database stores
    @property
    def url(self):
        return urljoin(MEDIA_URL, self.name)
    @property
    def path(self):
        return str(MEDIA_ROOT / self.name)

print(static("css/style.css"))
photo = FieldFile("students/photos/asha.jpg")
print(photo.name)
print(photo.url)
print(photo.path)
STATIC_URL = "https://cdn.college.in/static/"
print(static("css/style.css"))`,
      python: {
        files: {
          'main.py': `from pathlib import PurePosixPath
from urllib.parse import urljoin

STATIC_URL = "/static/"
MEDIA_URL = "/media/"
BASE_DIR = PurePosixPath("/home/you/student_portal")
MEDIA_ROOT = BASE_DIR / "media"

def static(path):
    return urljoin(STATIC_URL, path)

class FieldFile:
    def __init__(self, name):
        self.name = name                     # what the database stores
    @property
    def url(self):
        return urljoin(MEDIA_URL, self.name)
    @property
    def path(self):
        return str(MEDIA_ROOT / self.name)

print(static("css/style.css"))
photo = FieldFile("students/photos/asha.jpg")
print(photo.name)
print(photo.url)
print(photo.path)
STATIC_URL = "https://cdn.college.in/static/"
print(static("css/style.css"))
`,
        },
      },
      result: `/static/css/style.css
students/photos/asha.jpg
/media/students/photos/asha.jpg
/home/you/student_portal/media/students/photos/asha.jpg
https://cdn.college.in/static/css/style.css`,
      explanation: `The database stores only the relative name. .url joins it with MEDIA_URL for the browser; .path joins it with MEDIA_ROOT for the disk. Changing STATIC_URL to a CDN changes every generated link - the reason we never hard-code /static/.`,
    },
  ],
  interview: [
    { q: `What is the difference between static and media files?`, a: `Static files are developer-provided assets (CSS, JS, images) shipped with code. Media files are user-uploaded at runtime (photos, documents) and stored in MEDIA_ROOT.`, level: 'Easy' },
    { q: `Explain STATIC_URL, STATICFILES_DIRS and STATIC_ROOT.`, a: `STATIC_URL is the URL prefix for static files. STATICFILES_DIRS lists extra source folders searched for static files. STATIC_ROOT is the single destination folder where collectstatic copies all static files for production serving.`, level: 'Medium' },
    { q: `What does collectstatic do?`, a: `It copies static files from every installed app's static/ folder and from STATICFILES_DIRS into STATIC_ROOT so a web server or CDN can serve them efficiently.`, level: 'Easy' },
    { q: `Why use {% static %} instead of a hard-coded /static/ path?`, a: `It respects STATIC_URL and storage backends (CDN, hashed file names with ManifestStaticFilesStorage), so URLs stay correct if configuration changes.`, level: 'Medium' },
    { q: `Why do media files not show when DEBUG=False?`, a: `Django only serves media in development via static() in urls.py, which adds patterns only when DEBUG is True. In production a web server (Nginx) or cloud storage must serve MEDIA_ROOT.`, level: 'Medium' },
    { q: `What error appears if you forget {% load static %}?`, a: `TemplateSyntaxError: Invalid block tag 'static'. Did you forget to register or load this tag?`, level: 'Easy' },
    { q: `What is WhiteNoise?`, a: `A package that lets the Python app serve compressed, cached static files efficiently in production without Nginx - popular on Heroku/Render. It does not serve media files.`, level: 'Medium' },
    { q: `What does an ImageField store in the database?`, a: `Only the relative file path (a varchar), e.g. "students/photos/asha.jpg". The file is saved to MEDIA_ROOT/upload_to path on disk or remote storage.`, level: 'Medium' },
    { q: `Can STATIC_ROOT be one of the STATICFILES_DIRS?`, a: `No. Django raises ImproperlyConfigured because collectstatic would copy files into the folder it reads from.`, level: 'Hard' },
    { q: `Why should media uploads be treated as untrusted?`, a: `Users can upload malicious files. Validate type/size, never execute uploaded files, serve them from a separate domain or with correct content types, and keep them out of version control.`, level: 'Hard' },
  ],
  practice: [
    { task: `Add a favicon.ico from static/images to base.html.`, hint: `<link rel="icon">`, solution: `<link rel="icon" href="{% static 'images/favicon.ico' %}">` },
    { task: `Make the Fail result use the .fail CSS class from style.css.`, hint: `class attribute inside {% if %}`, solution: `<td {% if s.marks < 40 %}class="fail"{% endif %}>{% if s.marks < 40 %}Fail{% else %}Pass{% endif %}</td>` },
    { task: `Add Bootstrap 5 from a CDN in base.html and keep your own style.css after it.`, hint: `CDN link first, local CSS second so yours overrides.`, solution: `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">\n<link rel="stylesheet" href="{% static 'css/style.css' %}">` },
    { task: `Configure MEDIA settings for a project and serve them in development. Write all required code.`, hint: `settings + urls.py static()`, solution: `# settings.py\nMEDIA_URL = "media/"\nMEDIA_ROOT = BASE_DIR / "media"\n# urls.py\nfrom django.conf import settings\nfrom django.conf.urls.static import static\nif settings.DEBUG:\n    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)` },
  ],
  quiz: [
    { question: `Which of these is a media file?`, options: [`style.css`, `app.js`, `A student's uploaded profile photo`, `The college logo used in the navbar`], answer: 2, explanation: `Media = user uploads; the others are static files.` },
    { question: `Where does collectstatic copy files to?`, options: [`STATIC_ROOT`, `STATICFILES_DIRS`, `MEDIA_ROOT`, `STATIC_URL`], answer: 0, explanation: `STATIC_ROOT is the collection destination.` },
    { question: `What must appear in a template before using {% static %}?`, options: [`{% extends "static" %}`, `{% include static %}`, `{% static on %}`, `{% load static %}`], answer: 3, explanation: `The static tag library must be loaded in each template that uses it.` },
    { question: `Which library is required for ImageField?`, options: [`NumPy`, `Pillow`, `OpenCV`, `matplotlib`], answer: 1, explanation: `ImageField uses Pillow to validate images.` },
    { question: `static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) in urls.py works when:`, options: [`Always`, `Only with MySQL`, `Only when DEBUG is True`, `Only in production`], answer: 2, explanation: `The helper returns an empty list when DEBUG is False.` },
  ],
};
