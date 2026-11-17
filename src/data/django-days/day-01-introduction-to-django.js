export default {
  id: 'day-01-introduction-to-django',
  title: 'Introduction to Django, MVT Architecture, Django vs Flask',
  module: 'Module 1: Django Basics',
  day: 1,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Understand what Django is, why companies use it, how a request travels through the MVT (Model-View-Template) architecture, and how Django compares with Flask. We also introduce the Student Portal project that we will build across the whole course.`,
  objectives: [
    `Explain what a web framework is and why Django is called "batteries included"`,
    `Describe the MVT architecture and the role of Model, View, Template and URLconf`,
    `Trace the full request-response cycle of a Django application`,
    `Compare Django with Flask and choose the right one for a project`,
    `Understand the Student Portal project plan used throughout this course`,
  ],
  theory: [
    {
      heading: `What is Django?`,
      content: `Django is a free, open-source, high-level Python web framework. A web framework is a ready-made toolkit that handles the boring, repeated parts of building a website (URL routing, talking to the database, HTML generation, login, security) so you can focus on your business logic. Django was created in 2003 at the Lawrence Journal-World newspaper by Adrian Holovaty and Simon Willison and released publicly in 2005. It is named after the jazz guitarist Django Reinhardt. Current major version: Django 5 (5.0 released Dec 2023, 5.1 in 2024, 5.2 LTS in 2025). Django 5 needs Python 3.10 or newer.`,
      points: [
        `Batteries included: ORM, admin panel, authentication, forms, sessions, messages, caching, email, testing tools all come built in.`,
        `Secure by default: protection against CSRF, XSS, SQL injection and clickjacking is switched on automatically.`,
        `Scalable: used by Instagram, Pinterest (early), Mozilla, Disqus, Spotify (internal tools), NASA sites.`,
        `DRY principle: "Don't Repeat Yourself" - write a thing once (e.g. a model) and reuse it in admin, forms and APIs.`,
        `Huge ecosystem: Django REST Framework, Celery, django-allauth, django-filter and thousands of packages.`,
      ],
      tip: `Real-world analogy: building a website from scratch is like building a car by casting your own engine. Django is like buying a fully equipped car - you only choose the colour, seats and route.`,
    },
    {
      heading: `MVT Architecture (Model - View - Template)`,
      content: `Django follows the MVT pattern, a variation of the classic MVC (Model-View-Controller) pattern. The job of each part is clearly separated so that database code, business logic and HTML never get mixed up.`,
      points: [
        `Model: a Python class that describes a database table (e.g. Student with name, roll_no, marks). Django's ORM converts it into SQL automatically.`,
        `View: a Python function or class that receives an HTTP request, talks to models, and returns an HTTP response. It holds the business logic.`,
        `Template: an HTML file with special Django Template Language tags like {{ student.name }} and {% for %} that shows data to the user.`,
        `URLconf (urls.py): the "receptionist" that maps a URL like /students/5/ to the correct view.`,
        `In MVC terms: Django Model = Model, Django Template = View, Django View + the framework itself = Controller. That is why Django calls itself MTV/MVT.`,
      ],
      syntax: `Browser  --->  urls.py  --->  views.py  --->  models.py  ---> Database
   ^                              |
   |                              v
   +------- HTML response <--- templates/*.html`,
      tip: `Analogy - a restaurant: URLconf is the waiter who takes your order to the right chef, the View is the chef, the Model is the store-room (database) the chef takes ingredients from, and the Template is the plate on which the food is presented.`,
    },
    {
      heading: `The Request-Response Cycle step by step`,
      content: `Every time a user opens a page in a Django site, the same cycle happens. Learning this cycle is the single most important concept for interviews and debugging.`,
      points: [
        `1. The user types http://127.0.0.1:8000/students/ in the browser. The browser sends an HTTP GET request.`,
        `2. The web server (runserver in development, Gunicorn in production) passes it to Django via WSGI/ASGI.`,
        `3. Middleware runs first (security, sessions, CSRF, authentication).`,
        `4. Django reads ROOT_URLCONF and matches the path "students/" against urlpatterns.`,
        `5. The matched view function is called with a request object.`,
        `6. The view queries the Model (Student.objects.all()) - the ORM sends SQL to the database.`,
        `7. The view passes data (a context dictionary) to a Template and renders HTML.`,
        `8. The view returns an HttpResponse; middleware runs again on the way out; the browser displays the page.`,
      ],
    },
    {
      heading: `Django vs Flask`,
      content: `Both are popular Python web frameworks. Flask is a micro-framework: it gives you only routing and templates, and you add everything else (database, forms, login) with extensions. Django is a full-stack framework: everything comes in the box with fixed conventions.`,
      points: [
        `Size: Django = full-stack, "batteries included"; Flask = micro, minimal core.`,
        `Database: Django has its own ORM + migrations built in; Flask uses extensions like Flask-SQLAlchemy + Flask-Migrate.`,
        `Admin panel: Django generates a complete admin UI automatically; Flask has none by default (Flask-Admin extension).`,
        `Authentication: built into Django (django.contrib.auth); Flask needs Flask-Login.`,
        `Project structure: Django enforces a structure (project + apps); Flask lets you decide.`,
        `Learning curve: Flask is quicker to start; Django takes a little longer but saves time on big projects.`,
        `Use Django for: e-commerce, CMS, ERPs, school/college portals, admin-heavy apps. Use Flask for: small APIs, microservices, prototypes, ML model serving.`,
      ],
      tip: `Interview line: "Flask gives you freedom, Django gives you structure. For a large data-driven application with users and an admin panel I prefer Django; for a tiny microservice I prefer Flask or FastAPI."`,
    },
    {
      heading: `Project vs App and our running example: Student Portal`,
      content: `In Django, a project is the whole website (settings, root URLs) and an app is one feature module inside it (students, courses, accounts). One project can contain many apps, and one app can be reused in many projects. In this course we build one project called student_portal and grow it day by day.`,
      points: [
        `Day 2: create the project student_portal and run it.`,
        `Day 3-6: add the students app, views, URLs, templates, static and media files.`,
        `Day 7-13: add Student, Course, Subject and Profile models, use MySQL, ORM queries and the admin panel.`,
        `Day 14-15: build forms and full CRUD (add, edit, delete students).`,
        `Later days: class-based views, authentication, file uploads, testing and deployment.`,
      ],
      syntax: `student_portal/            <- project folder (outer)
    manage.py
    student_portal/        <- project package (settings, urls)
    students/              <- app: student records
    courses/               <- app (later)
    templates/
    static/
    media/`,
    },
    {
      heading: `Common beginner mistakes`,
      content: `Avoid these from Day 1 and you will save hours of debugging.`,
      points: [
        `Confusing Django "View" with MVC "View" - in Django the view is the logic, the template is the presentation.`,
        `Writing SQL or business logic inside templates - templates should only display data.`,
        `Putting everything into one giant app - split features into small apps.`,
        `Installing Django globally instead of inside a virtual environment.`,
        `Using Python older than 3.10 with Django 5 - installation will fail or pick an old Django version.`,
      ],
    },
  ],
  examples: [
    {
      title: `MVT pieces of a Student Portal page (overview code)`,
      scenario: `See how a single "student list" page is split across model, view, URL and template. You will write and run this code properly from Day 2 to Day 7; today just read and understand the flow.`,
      steps: [
        `Read each file below from top to bottom: models.py -> views.py -> urls.py -> template.`,
        `Draw arrows on paper: URL -> view -> model -> template -> response.`,
        `In VS Code or PyCharm you will create these exact files in the next few days.`,
      ],
      code: `# students/models.py  (Model = data)
from django.db import models

class Student(models.Model):
    name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=20, unique=True)
    marks = models.IntegerField(default=0)

    def __str__(self):
        return self.name


# students/views.py  (View = logic)
from django.shortcuts import render
from .models import Student

def student_list(request):
    students = Student.objects.all()          # ORM -> SELECT * FROM students_student
    return render(request, "students/student_list.html", {"students": students})


# students/urls.py  (URLconf = routing)
from django.urls import path
from . import views

urlpatterns = [
    path("", views.student_list, name="student_list"),
]


<!-- templates/students/student_list.html  (Template = presentation) -->
<h1>All Students</h1>
<ul>
  {% for s in students %}
    <li>{{ s.roll_no }} - {{ s.name }} ({{ s.marks }})</li>
  {% empty %}
    <li>No students yet.</li>
  {% endfor %}
</ul>`,
      result: `Browser at /students/ shows:
All Students
 - S101 - Asha (88)
 - S102 - Ravi (76)`,
      explanation: `The URL /students/ is matched in urls.py, which calls student_list. The view asks the Model for all students (the ORM writes SQL for us), then hands the list to the Template, which loops over it to build HTML. Each layer has exactly one job.`,
    },
    {
      title: `Simulating the request-response cycle in pure Python`,
      scenario: `Before installing Django, model the MVT flow with plain Python so the idea becomes concrete: a URL table, a "model" list, a view function and a tiny template renderer.`,
      steps: [
        `Open VS Code (or PyCharm) and create a folder day01_demo.`,
        `Create main.py and paste the code.`,
        `Run with python main.py (python3 main.py on macOS/Linux).`,
      ],
      code: `# A toy "framework" that mimics Django's MVT flow
STUDENTS = [  # Model (pretend database table)
    {"roll_no": "S101", "name": "Asha", "marks": 88},
    {"roll_no": "S102", "name": "Ravi", "marks": 76},
]

def render(template, context):  # Template engine
    html = template
    for key, value in context.items():
        html = html.replace("{{ " + key + " }}", str(value))
    return html

def student_list(request):  # View
    rows = "".join(f"<li>{s['roll_no']} - {s['name']}</li>" for s in STUDENTS)
    return render("<h1>{{ title }}</h1><ul>{{ rows }}</ul>",
                  {"title": "All Students", "rows": rows})

def home(request):  # View
    return "<h1>Welcome to Student Portal</h1>"

urlpatterns = {"/": home, "/students/": student_list}  # URLconf

def handle(path):  # What Django does for every request
    view = urlpatterns.get(path)
    if view is None:
        return "404 Not Found"
    return view({"path": path})

for p in ["/", "/students/", "/teachers/"]:
    print(p, "->", handle(p))`,
      python: {
        files: {
          'main.py': `# A toy "framework" that mimics Django's MVT flow
STUDENTS = [  # Model (pretend database table)
    {"roll_no": "S101", "name": "Asha", "marks": 88},
    {"roll_no": "S102", "name": "Ravi", "marks": 76},
]

def render(template, context):  # Template engine
    html = template
    for key, value in context.items():
        html = html.replace("{{ " + key + " }}", str(value))
    return html

def student_list(request):  # View
    rows = "".join(f"<li>{s['roll_no']} - {s['name']}</li>" for s in STUDENTS)
    return render("<h1>{{ title }}</h1><ul>{{ rows }}</ul>",
                  {"title": "All Students", "rows": rows})

def home(request):  # View
    return "<h1>Welcome to Student Portal</h1>"

urlpatterns = {"/": home, "/students/": student_list}  # URLconf

def handle(path):  # What Django does for every request
    view = urlpatterns.get(path)
    if view is None:
        return "404 Not Found"
    return view({"path": path})

for p in ["/", "/students/", "/teachers/"]:
    print(p, "->", handle(p))
`,
        },
      },
      result: `/ -> <h1>Welcome to Student Portal</h1>
/students/ -> <h1>All Students</h1><ul><li>S101 - Asha</li><li>S102 - Ravi</li></ul>
/teachers/ -> 404 Not Found`,
      explanation: `urlpatterns plays the URLconf, the functions are views, STUDENTS is the model data and render() is a mini template engine. Real Django does the same thing but with regex/path converters, a real database and a powerful template language. An unknown path gives 404, exactly like Django.`,
    },
    {
      title: `Same "Hello" page in Flask and in Django`,
      scenario: `Compare how much structure each framework needs for a single page. This helps you answer the Django vs Flask interview question with real code.`,
      steps: [
        `Read the Flask version: one file is enough.`,
        `Read the Django version: the code is spread over views.py and urls.py inside a generated project.`,
        `Note: Django needs more files for "hello", but for a 50-page app with login and admin, Django saves far more time.`,
      ],
      code: `# ---------- Flask: app.py (single file) ----------
from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello from Flask"

if __name__ == "__main__":
    app.run(debug=True)
# run: python app.py   -> http://127.0.0.1:5000/


# ---------- Django: inside a project ----------
# students/views.py
from django.http import HttpResponse

def hello(request):
    return HttpResponse("Hello from Django")

# student_portal/urls.py
from django.contrib import admin
from django.urls import path
from students import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.hello),
]
# run: python manage.py runserver   -> http://127.0.0.1:8000/`,
      result: `Flask  -> http://127.0.0.1:5000/  shows: Hello from Flask
Django -> http://127.0.0.1:8000/  shows: Hello from Django (plus a free admin at /admin/)`,
      explanation: `Flask routes with a decorator in one file; Django keeps routes in urls.py separated from views. Notice Django gives you /admin/ for free - this is the "batteries included" advantage.`,
    },
  ],
  interview: [
    { q: `What is Django?`, a: `Django is a high-level, open-source Python web framework that follows the MVT architecture and the DRY principle. It provides an ORM, admin panel, authentication, forms, security features and more out of the box, so developers can build secure, scalable web applications quickly.`, level: 'Easy' },
    { q: `Explain MVT architecture.`, a: `Model handles data and database tables through the ORM; View contains business logic, receives the request and returns a response; Template is the HTML presentation layer using the Django Template Language. The URL dispatcher (urls.py) maps URLs to views. The framework itself acts as the controller.`, level: 'Easy' },
    { q: `How is MVT different from MVC?`, a: `In MVC the controller handles the request and chooses the view. In Django the framework (URL dispatcher + view functions) does the controller work, the Django "View" holds logic (like a controller), and the "Template" is the presentation (like the MVC view).`, level: 'Medium' },
    { q: `Explain the Django request-response cycle.`, a: `Browser sends request -> WSGI/ASGI server -> middleware (request phase) -> URL resolver matches ROOT_URLCONF patterns -> view is called -> view uses models (ORM to DB) -> renders template with context -> returns HttpResponse -> middleware (response phase) -> browser.`, level: 'Medium' },
    { q: `Django vs Flask - when would you choose each?`, a: `Django for large, database-driven apps needing admin, auth and structure (e-commerce, ERP, portals). Flask for small apps, microservices, simple APIs or when you want full control over components.`, level: 'Easy' },
    { q: `What does "batteries included" mean?`, a: `Django ships with most features a web app needs - ORM, migrations, admin, auth, sessions, forms, caching, messages, email, testing - so you do not need third-party packages for common tasks.`, level: 'Easy' },
    { q: `What is the difference between a Django project and an app?`, a: `A project is the entire website/configuration (settings, root URLs, WSGI). An app is a self-contained module providing one feature (e.g. students, blog). A project contains many apps; an app can be reused across projects.`, level: 'Easy' },
    { q: `Name some companies that use Django.`, a: `Instagram, Mozilla, Disqus, Pinterest (early days), Bitbucket, The Washington Post, NASA and many startups.`, level: 'Easy' },
    { q: `What is WSGI and ASGI?`, a: `WSGI (Web Server Gateway Interface) is the standard synchronous interface between Python web apps and web servers like Gunicorn. ASGI (Asynchronous Server Gateway Interface) is its async successor that supports WebSockets and async views (servers: Uvicorn, Daphne). Django supports both via wsgi.py and asgi.py.`, level: 'Medium' },
    { q: `Which Python version does Django 5 require?`, a: `Django 5.0 and 5.1 support Python 3.10, 3.11 and 3.12 (5.1/5.2 also 3.13). Older Python versions are not supported.`, level: 'Medium' },
    { q: `What security features does Django provide by default?`, a: `CSRF protection, automatic HTML escaping in templates (XSS), parameterised queries in the ORM (SQL injection), clickjacking protection via X-Frame-Options, secure password hashing (PBKDF2) and host header validation (ALLOWED_HOSTS).`, level: 'Hard' },
  ],
  practice: [
    { task: `Draw the MVT diagram for a "View student marks" page of the Student Portal and label each arrow.`, hint: `Start from the browser URL /students/5/marks/.`, solution: `Browser -> urls.py path("students/<int:id>/marks/") -> view student_marks(request, id) -> Student.objects.get(id=id) -> DB returns row -> view renders "marks.html" with {"student": s} -> HttpResponse HTML -> browser.` },
    { task: `List 5 built-in Django features you would use in a college Student Portal and say why.`, hint: `Think about login, admin staff, forms, messages.`, solution: `1) Admin panel - staff manage students without coding. 2) Auth - login for students/teachers. 3) ORM - store students, courses. 4) Forms - admission form with validation. 5) Messages framework - "Student saved successfully" alerts.` },
    { task: `Extend the pure-Python simulation (Example 2) with a route "/about/" that returns "<h1>About Student Portal</h1>".`, hint: `Write a new view function and add it to the urlpatterns dict.`, solution: `def about(request):\n    return "<h1>About Student Portal</h1>"\n\nurlpatterns = {"/": home, "/students/": student_list, "/about/": about}` },
    { task: `Write a 4-line comparison table of Django vs Flask (ORM, Admin, Auth, Structure).`, hint: `Built-in vs extension.`, solution: `ORM: Django built-in / Flask needs Flask-SQLAlchemy. Admin: Django built-in / Flask-Admin. Auth: django.contrib.auth / Flask-Login. Structure: Django enforced project+apps / Flask free-form.` },
  ],
  quiz: [
    { question: `In Django's MVT, which component contains the business logic?`, options: [`Model`, `View`, `Template`, `Settings`], answer: 1, explanation: `The View receives the request, applies logic, uses models and returns a response.` },
    { question: `Which file maps URLs to views?`, options: [`settings.py`, `models.py`, `wsgi.py`, `urls.py`], answer: 3, explanation: `urls.py holds urlpatterns, the URL dispatcher configuration.` },
    { question: `Django is best described as a:`, options: [`Full-stack "batteries included" framework`, `Micro-framework`, `JavaScript library`, `Database engine`], answer: 0, explanation: `Django ships with ORM, admin, auth and more - it is full-stack. Flask is the micro-framework.` },
    { question: `What does ORM stand for?`, options: [`Online Request Manager`, `Object Routing Model`, `Object Relational Mapper`, `Ordered Record Module`], answer: 2, explanation: `The Object Relational Mapper converts Python classes/objects to database tables/rows.` },
    { question: `Which minimum Python version is required for Django 5.0?`, options: [`3.6`, `3.8`, `3.10`, `2.7`], answer: 2, explanation: `Django 5.0 dropped support for Python 3.8 and 3.9; it requires 3.10+.` },
  ],
};
