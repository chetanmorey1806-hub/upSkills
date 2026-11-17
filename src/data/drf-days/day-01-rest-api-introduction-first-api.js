export default {
  id: "day-01-rest-api-introduction-first-api",
  title: "REST APIs Introduction, Installing DRF, First API",
  module: "Module 1: DRF Basics",
  day: 1,
  level: "Beginner",
  duration: "2 hours",
  summary: "Understand what an API and a REST API are, how HTTP methods, status codes and JSON work together, why Django REST Framework (DRF) exists, and build and test your first DRF 3.15 API with the browsable API, Postman and curl.",
  objectives: [
    "Explain API, REST, resource, endpoint and the six REST constraints in simple words",
    "Map CRUD operations to HTTP methods (GET, POST, PUT, PATCH, DELETE) and pick correct status codes",
    "Create a Django 5 project, install djangorestframework 3.15 and register it in INSTALLED_APPS",
    "Build a first API endpoint with @api_view and test it with the browser, Postman and curl",
    "Compare a plain Django JsonResponse view with a DRF Response view",
  ],
  theory: [
    {
      heading: "What is an API? What is a REST API?",
      content: "An API (Application Programming Interface) is a contract that lets one program talk to another. A web API is an API reached over HTTP. Think of a restaurant menu: the menu (API) lists what you can order (endpoints), you give the order to the waiter (HTTP request) and the kitchen (server) sends back food (HTTP response). You never enter the kitchen. REST (REpresentational State Transfer) is an architectural style defined by Roy Fielding in 2000. In REST, everything is a resource (a book, a user, an order) identified by a URL such as /api/books/7/. The client asks for a representation of that resource, usually JSON. A React app, an Android app and an iOS app can all use the same REST API, which is why every full stack developer must know how to build one.",
      points: [
        "Resource: a thing your API exposes (Book, Student, Order)",
        "Endpoint: a URL + method that works on a resource, e.g. GET /api/books/",
        "Representation: the data format sent back, usually JSON",
        "REST API = web API that follows REST constraints",
      ],
    },
    {
      heading: "The Six REST Constraints",
      content: "An API is called RESTful when it follows these rules. You do not need to memorise the thesis, but interviewers love asking about statelessness and uniform interface.",
      points: [
        "Client-Server: frontend and backend are separate and can change independently",
        "Stateless: every request carries everything needed (for example the token); the server keeps no client session between requests",
        "Cacheable: responses say whether they can be cached (Cache-Control, ETag)",
        "Uniform Interface: resources are identified by URLs and manipulated with standard HTTP methods",
        "Layered System: there may be load balancers, proxies or gateways between client and server",
        "Code on Demand (optional): server can send code (like JavaScript) to the client",
      ],
      tip: "Use nouns in URLs, not verbs: /api/books/ is good, /api/getAllBooks/ is not RESTful. The HTTP method already says the action.",
    },
    {
      heading: "HTTP Methods, CRUD and Status Codes",
      content: "Each CRUD operation maps to an HTTP method. GET and DELETE usually have no body; POST, PUT and PATCH send JSON in the body. Safe methods (GET, HEAD, OPTIONS) never change data. Idempotent methods (GET, PUT, DELETE) give the same final result even if repeated; POST is not idempotent because calling it twice creates two records.",
      syntax: `CRUD     HTTP method   URL example          Success code
Create   POST          /api/books/          201 Created
Read     GET           /api/books/          200 OK (list)
Read     GET           /api/books/7/        200 OK (detail)
Update   PUT           /api/books/7/        200 OK (full update)
Update   PATCH         /api/books/7/        200 OK (partial update)
Delete   DELETE        /api/books/7/        204 No Content

Common errors: 400 Bad Request (validation), 401 Unauthorized (not logged in),
403 Forbidden (logged in but not allowed), 404 Not Found, 405 Method Not Allowed,
429 Too Many Requests, 500 Internal Server Error`,
      points: [
        "PUT replaces the whole resource; PATCH changes only the fields sent",
        "2xx = success, 4xx = client mistake, 5xx = server mistake",
        "401 means 'who are you?', 403 means 'I know you, but no'",
      ],
    },
    {
      heading: "JSON: The Language of APIs",
      content: "JSON (JavaScript Object Notation) is a light text format for data. It has objects { }, arrays [ ], strings in double quotes, numbers, true/false and null. Python dict maps to JSON object, list to array, True to true, None to null. In Python the json module converts between them: json.dumps() turns Python into a JSON string and json.loads() turns a JSON string into Python. An API request sends the header Content-Type: application/json and the response comes back with the same content type.",
      syntax: `{
  "id": 1,
  "title": "Clean Code",
  "price": 450.0,
  "in_stock": true,
  "tags": ["programming", "best-practices"],
  "publisher": null
}`,
    },
    {
      heading: "Why Django REST Framework?",
      content: "Plain Django can return JSON with JsonResponse, but you would write a lot by hand: converting model objects to dicts, parsing JSON bodies, validating input, authentication with tokens, permissions, pagination, throttling and documentation. DRF is a toolkit on top of Django that gives all of this. DRF 3.15 supports Django 4.2 and 5.x and Python 3.8+. Its main building blocks, which you will learn over the next 12 days, are: Serializers (convert and validate data), Request/Response objects, API views (function and class based), Generic views and ViewSets, Routers (auto URLs), Authentication, Permissions, Throttling, Filtering, Pagination and the Browsable API (an HTML page to test your API in the browser).",
      points: [
        "Serializer: model object <-> Python dict <-> JSON, with validation",
        "Response: content-negotiated response (JSON for Postman, HTML browsable page for browsers)",
        "Browsable API: free web UI at every endpoint for testing",
        "Used by Mozilla, Red Hat, Heroku, Eventbrite and thousands of startups",
      ],
    },
    {
      heading: "Tools for Testing APIs: Browser, Postman, curl",
      content: "A browser can only easily send GET requests. For POST, PUT, PATCH and DELETE we use tools. Postman is a GUI app: choose the method, type the URL, put JSON in Body -> raw -> JSON and press Send. curl is a command line tool that comes with Linux, macOS and Windows 10+. HTTPie (http command) is a friendlier CLI alternative. DRF's browsable API also gives an HTML form for POST/PUT at every endpoint.",
      syntax: `# GET
curl http://127.0.0.1:8000/api/hello/

# POST with JSON body
curl -X POST http://127.0.0.1:8000/api/hello/ \\
     -H "Content-Type: application/json" \\
     -d '{"name": "Asha"}'

# Show response headers too
curl -i http://127.0.0.1:8000/api/hello/`,
      tip: "On Windows CMD, use double quotes outside and escaped quotes inside: -d \"{\\\"name\\\": \\\"Asha\\\"}\". In PowerShell use Invoke-RestMethod or curl.exe.",
    },
  ],
  examples: [
    {
      title: "Create a Django 5 + DRF 3.15 Project",
      scenario: "You are starting a Library API for a college. Set up the project, a virtual environment and install DRF.",
      steps: [
        "Open VS Code (or PyCharm -> New Project -> Django, Python 3.12, new virtualenv)",
        "Open the terminal (Ctrl + `) in an empty folder named library_api",
        "Run the commands below one by one",
        "Add 'rest_framework' and 'books' to INSTALLED_APPS in config/settings.py",
        "Run python manage.py runserver and open http://127.0.0.1:8000/",
      ],
      code: `# Terminal (Windows: venv\\Scripts\\activate, Linux/Mac: source venv/bin/activate)
python -m venv venv
source venv/bin/activate
pip install "django>=5.0,<6" "djangorestframework==3.15.*"
pip freeze > requirements.txt
django-admin startproject config .
python manage.py startapp books
python manage.py migrate
python manage.py runserver

# requirements.txt (main lines)
Django==5.1.4
djangorestframework==3.15.2

# Project tree
library_api/
├── venv/
├── manage.py
├── requirements.txt
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
└── books/
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── models.py
    ├── views.py
    └── migrations/

# config/settings.py (only the part you change)
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # third party
    "rest_framework",
    # local apps
    "books",
]`,
      result: `Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
Django version 5.1.4, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.`,
      explanation: "DRF is just a Django app named rest_framework. Installing it with pip is not enough; you must add it to INSTALLED_APPS so Django loads its templates (for the browsable API) and static files. Keep third-party apps and your own apps in separate groups for readability.",
    },
    {
      title: "Your First API Endpoint with @api_view",
      scenario: "Create GET /api/hello/ that returns a greeting, and POST /api/hello/ that greets the name sent in JSON.",
      steps: [
        "Open books/views.py and write the hello view",
        "Create books/urls.py and include it in config/urls.py under 'api/'",
        "Run python manage.py runserver",
        "Open http://127.0.0.1:8000/api/hello/ in the browser to see the browsable API",
        "Test POST in Postman: Body -> raw -> JSON -> {\"name\": \"Asha\"} -> Send",
      ],
      code: `# books/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(["GET", "POST"])
def hello(request):
    if request.method == "POST":
        name = request.data.get("name", "Guest")
        return Response({"message": f"Hello, {name}!"}, status=status.HTTP_201_CREATED)
    return Response({"message": "Hello, REST world!", "framework": "DRF 3.15"})


# books/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("hello/", views.hello, name="hello"),
]


# config/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("books.urls")),
]


# ---- Test with curl ----
curl -i http://127.0.0.1:8000/api/hello/

curl -X POST http://127.0.0.1:8000/api/hello/ \\
     -H "Content-Type: application/json" \\
     -d '{"name": "Asha"}'`,
      result: `GET /api/hello/
HTTP/1.1 200 OK
Content-Type: application/json
Allow: GET, POST, OPTIONS

{"message": "Hello, REST world!", "framework": "DRF 3.15"}

POST /api/hello/   body: {"name": "Asha"}
HTTP/1.1 201 Created

{"message": "Hello, Asha!"}`,
      explanation: "@api_view turns a normal function into a DRF view: request becomes a DRF Request with request.data (parsed JSON), and Response chooses JSON or HTML automatically. Any method not listed (like DELETE) gets 405 Method Not Allowed for free. DRF adds OPTIONS automatically.",
    },
    {
      title: "Plain Django JsonResponse vs DRF Response",
      scenario: "Your team lead asks why we need DRF if Django already has JsonResponse. Build the same Book list both ways and compare.",
      steps: [
        "Create a Book model in books/models.py",
        "Run python manage.py makemigrations and python manage.py migrate",
        "Add two books from python manage.py shell or the admin",
        "Write both views in books/views.py and map them in books/urls.py",
        "Open /api/books-django/ and /api/books-drf/ in the browser and compare",
      ],
      code: `# books/models.py
from django.db import models


class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    published = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.title


# books/views.py
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Book


@csrf_exempt
def books_django(request):
    # Everything by hand: query, convert, parse body, validate, status codes
    if request.method == "GET":
        data = list(Book.objects.values("id", "title", "author", "price"))
        for row in data:
            row["price"] = str(row["price"])   # Decimal is not JSON serializable
        return JsonResponse(data, safe=False)
    if request.method == "POST":
        body = json.loads(request.body)
        book = Book.objects.create(**body)      # no validation at all!
        return JsonResponse({"id": book.id}, status=201)
    return JsonResponse({"error": "Method not allowed"}, status=405)


@api_view(["GET"])
def books_drf(request):
    data = list(Book.objects.values("id", "title", "author", "price"))
    return Response(data)   # DRF's JSON encoder handles Decimal and dates


# books/urls.py
urlpatterns = [
    path("hello/", views.hello),
    path("books-django/", views.books_django),
    path("books-drf/", views.books_drf),
]

# shell
python manage.py shell
>>> from books.models import Book
>>> Book.objects.create(title="Clean Code", author="Robert Martin", price=450)
>>> Book.objects.create(title="Fluent Python", author="Luciano Ramalho", price=899.5)`,
      result: `GET /api/books-drf/
HTTP 200 OK
[
    {"id": 1, "title": "Clean Code", "author": "Robert Martin", "price": "450.00"},
    {"id": 2, "title": "Fluent Python", "author": "Luciano Ramalho", "price": "899.50"}
]`,
      explanation: "The Django version needs csrf_exempt, manual json.loads, manual Decimal conversion, manual 405 handling and still has no validation. The DRF version handles content negotiation, Decimal/date encoding, 405 and gives a browsable page. Tomorrow serializers will replace .values() and add validation.",
    },
    {
      title: "Pure Python Demo: What Serialization Means",
      scenario: "Before using DRF serializers, understand the core idea with only the standard library: convert Python objects to JSON text and back.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `import json
from dataclasses import dataclass, asdict
from decimal import Decimal


@dataclass
class Book:
    id: int
    title: str
    price: Decimal
    in_stock: bool


books = [Book(1, "Clean Code", Decimal("450.00"), True),
         Book(2, "Fluent Python", Decimal("899.50"), False)]


def to_dict(book):
    d = asdict(book)
    d["price"] = str(d["price"])  # Decimal -> string, like DRF does
    return d


payload = json.dumps([to_dict(b) for b in books], indent=2)
print("Serialized JSON:")
print(payload)

incoming = '{"title": "Two Scoops of Django", "price": "650.00", "in_stock": true}'
data = json.loads(incoming)
print("Deserialized:", data)
print("Type of in_stock:", type(data["in_stock"]).__name__)`,
      python: {
        files: {
          "main.py": `import json
from dataclasses import dataclass, asdict
from decimal import Decimal


@dataclass
class Book:
    id: int
    title: str
    price: Decimal
    in_stock: bool


books = [Book(1, "Clean Code", Decimal("450.00"), True),
         Book(2, "Fluent Python", Decimal("899.50"), False)]


def to_dict(book):
    d = asdict(book)
    d["price"] = str(d["price"])  # Decimal -> string, like DRF does
    return d


payload = json.dumps([to_dict(b) for b in books], indent=2)
print("Serialized JSON:")
print(payload)

incoming = '{"title": "Two Scoops of Django", "price": "650.00", "in_stock": true}'
data = json.loads(incoming)
print("Deserialized:", data)
print("Type of in_stock:", type(data["in_stock"]).__name__)
`,
        },
      },
      result: `Serialized JSON:
[
  {
    "id": 1,
    "title": "Clean Code",
    "price": "450.00",
    "in_stock": true
  },
  {
    "id": 2,
    "title": "Fluent Python",
    "price": "899.50",
    "in_stock": false
  }
]
Deserialized: {'title': 'Two Scoops of Django', 'price': '650.00', 'in_stock': True}
Type of in_stock: bool`,
      explanation: "Serialization = object to JSON text (response). Deserialization = JSON text to Python data (request). Notice True became true and Decimal had to be turned into a string. A DRF serializer automates exactly this, plus validation.",
    },
  ],
  interview: [
    { q: "What is a REST API?", a: "A web API that follows the REST architectural style: resources identified by URLs, manipulated with standard HTTP methods, stateless requests, and representations (usually JSON) sent between client and server.", level: "Easy" },
    { q: "What does stateless mean in REST?", a: "Each request must contain all information needed to process it (such as the auth token). The server does not remember previous requests of that client in a session. This makes scaling across many servers easy.", level: "Easy" },
    { q: "Difference between PUT and PATCH?", a: "PUT replaces the whole resource, so all required fields must be sent. PATCH updates only the fields sent. Both return 200 OK on success in DRF.", level: "Easy" },
    { q: "Which HTTP methods are idempotent?", a: "GET, HEAD, OPTIONS, PUT and DELETE are idempotent: repeating them leaves the server in the same state. POST is not idempotent; PATCH is not guaranteed to be.", level: "Medium" },
    { q: "Difference between 401 and 403?", a: "401 Unauthorized means the request is not authenticated (missing or invalid credentials). 403 Forbidden means the user is authenticated but does not have permission.", level: "Easy" },
    { q: "Why use DRF instead of Django JsonResponse?", a: "DRF provides serializers with validation, request parsing (request.data), content negotiation, authentication (token/JWT), permissions, throttling, pagination, filtering, viewsets with routers, and a browsable API. With JsonResponse you would write all of that by hand.", level: "Medium" },
    { q: "What status code should a successful POST return? A successful DELETE?", a: "POST that creates a resource returns 201 Created (often with the new object). DELETE returns 204 No Content with an empty body.", level: "Easy" },
    { q: "What is the browsable API?", a: "An HTML interface DRF renders when the request comes from a browser (Accept: text/html). It shows the JSON response, allowed methods and forms to send POST/PUT requests. It is produced by BrowsableAPIRenderer.", level: "Easy" },
    { q: "What is the difference between an API and an endpoint?", a: "An API is the whole contract of a service. An endpoint is one URL + HTTP method in that API, for example GET /api/books/.", level: "Easy" },
    { q: "Is installing djangorestframework with pip enough to use it?", a: "No. You must also add 'rest_framework' to INSTALLED_APPS so its templates and static files (used by the browsable API) are found. Common fresher mistake: TemplateDoesNotExist rest_framework/api.html.", level: "Medium" },
    { q: "Why should URLs use nouns instead of verbs in REST?", a: "Because the HTTP method already expresses the action. /api/books/ with GET, POST, etc. is uniform and predictable, while /api/createBook/ mixes action into the URL and breaks the uniform interface.", level: "Medium" },
  ],
  practice: [
    {
      task: "Create an endpoint GET /api/status/ that returns {\"status\": \"ok\", \"version\": \"1.0\"}.",
      hint: "Use @api_view(['GET']) and return Response({...}).",
      solution: `from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def api_status(request):
    return Response({"status": "ok", "version": "1.0"})

# urls.py
path("status/", views.api_status),`,
    },
    {
      task: "Create POST /api/add/ that takes {\"a\": 5, \"b\": 7} and returns {\"sum\": 12}. Return 400 if a or b is missing.",
      hint: "Read request.data and use status.HTTP_400_BAD_REQUEST.",
      solution: `from rest_framework import status


@api_view(["POST"])
def add(request):
    a = request.data.get("a")
    b = request.data.get("b")
    if a is None or b is None:
        return Response({"error": "a and b are required"}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"sum": a + b})

# curl -X POST http://127.0.0.1:8000/api/add/ -H "Content-Type: application/json" -d '{"a":5,"b":7}'
# {"sum": 12}`,
    },
    {
      task: "Write the HTTP method + URL + success status code for: list students, get student 3, create student, rename student 3, delete student 3.",
      hint: "Use the CRUD table from theory.",
      solution: `GET    /api/students/      200 OK
GET    /api/students/3/    200 OK
POST   /api/students/      201 Created
PATCH  /api/students/3/    200 OK
DELETE /api/students/3/    204 No Content`,
    },
    {
      task: "Make GET /api/books-drf/ return books ordered by price, most expensive first, only title and price.",
      hint: "Use .order_by('-price').values('title', 'price').",
      solution: `@api_view(["GET"])
def books_drf(request):
    data = Book.objects.order_by("-price").values("title", "price")
    return Response(list(data))`,
    },
  ],
  quiz: [
    { question: "Which HTTP method is NOT idempotent?", options: ["GET", "PUT", "POST", "DELETE"], answer: 2, explanation: "Calling POST twice usually creates two resources, so it is not idempotent." },
    { question: "What status code should a successful DELETE return in DRF?", options: ["204 No Content", "200 OK with deleted object", "201 Created", "202 Accepted"], answer: 0, explanation: "DRF's destroy returns 204 No Content with an empty body." },
    { question: "Where must you add 'rest_framework' after pip install?", options: ["MIDDLEWARE", "TEMPLATES", "ROOT_URLCONF", "INSTALLED_APPS"], answer: 3, explanation: "DRF is a Django app and must be listed in INSTALLED_APPS." },
    { question: "In DRF, how do you read the parsed JSON body of a POST request?", options: ["request.POST", "request.data", "request.body.json()", "request.json"], answer: 1, explanation: "request.data contains the parsed body for JSON, form and multipart content." },
    { question: "A user is logged in but tries to delete someone else's post. Best status code?", options: ["400", "401", "403", "404"], answer: 2, explanation: "The user is authenticated but not allowed: 403 Forbidden." },
  ],
};
