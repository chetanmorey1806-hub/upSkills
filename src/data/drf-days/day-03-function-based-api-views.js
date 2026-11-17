export default {
  id: "day-03-function-based-api-views",
  title: "Function-based API Views (@api_view), Request and Response",
  module: "Module 1: DRF Basics",
  day: 3,
  level: "Beginner",
  duration: "2 hours",
  summary: "Build a complete CRUD API using function-based views with the @api_view decorator. Understand DRF's Request object (data, query_params, user), the Response object, status codes, parsers, renderers and format suffixes.",
  objectives: [
    "Use @api_view to create list/create and retrieve/update/delete endpoints",
    "Read request.data, request.query_params, request.method and request.user",
    "Return Response objects with correct status constants and headers",
    "Handle missing objects with get_object_or_404 and errors with proper 4xx codes",
    "Explain content negotiation, parsers, renderers and format suffix patterns",
  ],
  theory: [
    {
      heading: "The @api_view Decorator",
      content: "@api_view is the simplest way to write DRF endpoints. It wraps a normal Django function and gives it DRF superpowers: a DRF Request object instead of HttpRequest, automatic 405 Method Not Allowed for methods you did not list, authentication and permission checks from settings, exception handling (errors become JSON) and the browsable API. Think of it as a smart receptionist: it checks who you are, what you want and if you are allowed, before passing you to the function.",
      syntax: `from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

@api_view(["GET", "POST"])        # allowed methods; default is ["GET"]
def book_list(request):
    ...`,
      points: [
        "Without a list, @api_view() allows only GET",
        "CSRF is enforced only for session-authenticated users, not for token/JWT clients",
        "Extra decorators: @permission_classes, @authentication_classes, @throttle_classes, @parser_classes, @renderer_classes",
      ],
    },
    {
      heading: "The DRF Request Object",
      content: "DRF's Request extends Django's HttpRequest. The most important attribute is request.data, which contains the parsed body for JSON, form and multipart requests (Django's request.POST only works for form data). request.query_params is a clearer name for request.GET — the ?key=value part of the URL. request.user and request.auth are filled in by authentication classes.",
      points: [
        "request.data: parsed body (dict-like) for POST, PUT, PATCH",
        "request.query_params: URL query string, e.g. ?search=django&page=2",
        "request.method: 'GET', 'POST', ...",
        "request.user: User instance or AnonymousUser",
        "request.auth: the token/credentials used (None for session)",
        "request.FILES: uploaded files in multipart requests",
      ],
      tip: "Never use request.POST in DRF code. For JSON requests it is empty. Always use request.data.",
    },
    {
      heading: "Response and Status Codes",
      content: "Response(data, status=None, headers=None) takes plain Python data (dict, list) — not JSON text — and the renderer turns it into JSON or HTML. Use the named constants from rest_framework.status instead of bare numbers: they are self-documenting and prevent typos.",
      syntax: `from rest_framework import status

Response(serializer.data)                                   # 200
Response(serializer.data, status=status.HTTP_201_CREATED)   # 201
Response(status=status.HTTP_204_NO_CONTENT)                 # 204, no body
Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
Response(data, headers={"X-Total-Count": "42"})`,
    },
    {
      heading: "Parsers, Renderers and Content Negotiation",
      content: "Parsers read the incoming body based on the Content-Type header: JSONParser (application/json), FormParser (application/x-www-form-urlencoded), MultiPartParser (multipart/form-data). Renderers produce the output based on the Accept header: JSONRenderer (application/json) and BrowsableAPIRenderer (text/html). This choosing process is called content negotiation. That is why the same URL shows a nice HTML page in Chrome but raw JSON in Postman.",
      syntax: `# settings.py
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",  # remove in production if you want JSON only
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ],
}`,
    },
    {
      heading: "Format Suffixes and Error Handling",
      content: "format_suffix_patterns lets clients add .json or .api to the URL (/api/books.json) to force a format, or ?format=json. For missing objects, use get_object_or_404 from django.shortcuts — inside a DRF view, the Http404 is converted to {\"detail\": \"No Book matches the given query.\"} with status 404. Any exceptions.APIException subclass (ValidationError, NotFound, PermissionDenied, NotAuthenticated) is also converted to a clean JSON error.",
      points: [
        "urlpatterns = format_suffix_patterns(urlpatterns) and add format=None to the view",
        "raise NotFound('Book not available') -> 404 {\"detail\": \"Book not available\"}",
        "raise ValidationError({'qty': 'Must be positive'}) -> 400",
        "Unhandled Python exceptions still give 500 — fix them, do not hide them",
      ],
    },
  ],
  examples: [
    {
      title: "Full CRUD with Two Function-Based Views",
      scenario: "Build the classic pair: /api/books/ (GET list, POST create) and /api/books/<id>/ (GET, PUT, PATCH, DELETE) for the Library API.",
      steps: [
        "Open the library_api project in VS Code / PyCharm",
        "Keep the Book model and BookSerializer from Day 2",
        "Write the two views in books/views.py",
        "Map URLs in books/urls.py",
        "Run python manage.py runserver and test each method in Postman",
      ],
      code: `# books/views.py
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Book
from .serializers import BookSerializer


@api_view(["GET", "POST"])
def book_list(request):
    if request.method == "GET":
        books = Book.objects.all().order_by("id")
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

    serializer = BookSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
def book_detail(request, pk):
    book = get_object_or_404(Book, pk=pk)

    if request.method == "GET":
        return Response(BookSerializer(book).data)

    if request.method in ("PUT", "PATCH"):
        serializer = BookSerializer(book, data=request.data,
                                    partial=request.method == "PATCH")
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    book.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# books/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("books/", views.book_list, name="book-list"),
    path("books/<int:pk>/", views.book_detail, name="book-detail"),
]


# ---- curl tests ----
curl http://127.0.0.1:8000/api/books/1/
curl -X PATCH http://127.0.0.1:8000/api/books/1/ -H "Content-Type: application/json" -d '{"price": "425.00"}'
curl -X DELETE -i http://127.0.0.1:8000/api/books/1/
curl -i http://127.0.0.1:8000/api/books/1/
curl -X DELETE -i http://127.0.0.1:8000/api/books/`,
      result: `GET /api/books/1/                      -> 200 OK
{"id": 1, "title": "Clean Code", "author": "Robert Martin", "isbn": "9780132350884",
 "price": "450.00", "discount_price": null, "in_stock": true, "is_expensive": false,
 "created_at": "2026-11-17T09:00:00Z"}

PATCH /api/books/1/ {"price": "425.00"} -> 200 OK
{"id": 1, "title": "Clean Code", ..., "price": "425.00", ...}

DELETE /api/books/1/                   -> 204 No Content   (empty body)

GET /api/books/1/                      -> 404 Not Found
{"detail": "No Book matches the given query."}

DELETE /api/books/                     -> 405 Method Not Allowed
{"detail": "Method \\"DELETE\\" not allowed."}`,
      explanation: "One function handles one URL and branches on request.method. partial=request.method == 'PATCH' reuses the same code for PUT and PATCH. get_object_or_404 gives a JSON 404 automatically. The 405 for DELETE on the list URL comes free from @api_view.",
    },
    {
      title: "Using query_params for Search and Limit",
      scenario: "The frontend wants /api/books/search/?q=python&max_price=900&limit=5. Implement it with query_params and validate the numbers.",
      steps: [
        "Add a book_search view to books/views.py",
        "Add the path search/ BEFORE <int:pk>/ in urls.py",
        "Call the URL from the browser and Postman (Params tab)",
      ],
      code: `# books/views.py
from django.db.models import Q
from rest_framework.exceptions import ValidationError


@api_view(["GET"])
def book_search(request):
    q = request.query_params.get("q", "").strip()
    max_price = request.query_params.get("max_price")
    try:
        limit = int(request.query_params.get("limit", 10))
    except ValueError:
        raise ValidationError({"limit": "limit must be an integer."})

    books = Book.objects.all()
    if q:
        books = books.filter(Q(title__icontains=q) | Q(author__icontains=q))
    if max_price:
        books = books.filter(price__lte=max_price)

    data = BookSerializer(books[:limit], many=True).data
    return Response({"count": len(data), "results": data})

# books/urls.py
path("books/search/", views.book_search, name="book-search"),

# curl
curl "http://127.0.0.1:8000/api/books/search/?q=python&max_price=900&limit=5"
curl "http://127.0.0.1:8000/api/books/search/?limit=abc"`,
      result: `GET /api/books/search/?q=python&max_price=900&limit=5 -> 200 OK
{
    "count": 1,
    "results": [
        {"id": 2, "title": "Fluent Python", "author": "Luciano Ramalho", "price": "899.50", ...}
    ]
}

GET /api/books/search/?limit=abc -> 400 Bad Request
{"limit": "limit must be an integer."}`,
      explanation: "Query params are always strings, so convert and validate them. Raising ValidationError inside a DRF view returns a 400 JSON response. Quote the URL in curl because & has a special meaning in the shell.",
    },
    {
      title: "request.user, Custom Headers and Format Suffixes",
      scenario: "Add a /api/me/ endpoint that shows who is calling and a list endpoint that sends an X-Total-Count header and supports .json suffix.",
      steps: [
        "Create a superuser: python manage.py createsuperuser",
        "Add the whoami view and update book_list with format=None",
        "Wrap urlpatterns with format_suffix_patterns",
        "Log in at /admin/ then open /api/me/ in the same browser; also call it with curl (anonymous)",
      ],
      code: `# books/views.py
@api_view(["GET"])
def whoami(request):
    return Response({
        "is_authenticated": request.user.is_authenticated,
        "username": request.user.username or None,
        "auth": str(request.auth),
        "method": request.method,
        "accept": request.accepted_media_type,
    })


@api_view(["GET", "POST"])
def book_list(request, format=None):
    if request.method == "GET":
        books = Book.objects.all()
        data = BookSerializer(books, many=True).data
        return Response(data, headers={"X-Total-Count": str(books.count())})
    ...


# books/urls.py
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    path("me/", views.whoami),
    path("books/", views.book_list, name="book-list"),
    path("books/<int:pk>/", views.book_detail, name="book-detail"),
]
urlpatterns = format_suffix_patterns(urlpatterns)

# curl
curl http://127.0.0.1:8000/api/me/
curl -i http://127.0.0.1:8000/api/books.json`,
      result: `GET /api/me/ (anonymous curl) -> 200 OK
{"is_authenticated": false, "username": null, "auth": "None", "method": "GET", "accept": "application/json"}

GET /api/me/ (browser after admin login) -> browsable page showing
{"is_authenticated": true, "username": "admin", "auth": "None", "method": "GET", "accept": "text/html"}

GET /api/books.json -> 200 OK
X-Total-Count: 2
Content-Type: application/json
[ {...}, {...} ]`,
      explanation: "Session login from the admin makes request.user available to the API in the same browser. curl sends no cookie so the user is AnonymousUser (username is empty string, so 'or None' gives null). The .json suffix forces JSONRenderer even in a browser.",
    },
    {
      title: "Pure Python Demo: How @api_view Restricts Methods",
      scenario: "Recreate the idea of @api_view with a small decorator that returns 405 for methods not allowed.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `import functools


def api_view(methods):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(request):
            if request["method"] not in methods:
                return 405, {"detail": f'Method "{request["method"]}" not allowed.'}
            try:
                return func(request)
            except KeyError as e:
                return 400, {"detail": f"Missing field {e}"}
        wrapper.allowed = methods
        return wrapper
    return decorator


BOOKS = [{"id": 1, "title": "Clean Code"}]


@api_view(["GET", "POST"])
def book_list(request):
    if request["method"] == "GET":
        return 200, BOOKS
    book = {"id": len(BOOKS) + 1, "title": request["data"]["title"]}
    BOOKS.append(book)
    return 201, book


print(book_list({"method": "GET"}))
print(book_list({"method": "POST", "data": {"title": "Fluent Python"}}))
print(book_list({"method": "POST", "data": {}}))
print(book_list({"method": "DELETE"}))
print(book_list.__name__, book_list.allowed)`,
      python: {
        files: {
          "main.py": `import functools


def api_view(methods):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(request):
            if request["method"] not in methods:
                return 405, {"detail": f'Method "{request["method"]}" not allowed.'}
            try:
                return func(request)
            except KeyError as e:
                return 400, {"detail": f"Missing field {e}"}
        wrapper.allowed = methods
        return wrapper
    return decorator


BOOKS = [{"id": 1, "title": "Clean Code"}]


@api_view(["GET", "POST"])
def book_list(request):
    if request["method"] == "GET":
        return 200, BOOKS
    book = {"id": len(BOOKS) + 1, "title": request["data"]["title"]}
    BOOKS.append(book)
    return 201, book


print(book_list({"method": "GET"}))
print(book_list({"method": "POST", "data": {"title": "Fluent Python"}}))
print(book_list({"method": "POST", "data": {}}))
print(book_list({"method": "DELETE"}))
print(book_list.__name__, book_list.allowed)
`,
        },
      },
      result: `(200, [{'id': 1, 'title': 'Clean Code'}])
(201, {'id': 2, 'title': 'Fluent Python'})
(400, {'detail': "Missing field 'title'"})
(405, {'detail': 'Method "DELETE" not allowed.'})
book_list ['GET', 'POST']`,
      explanation: "A decorator wraps the view, checks the method first and converts exceptions into error responses — the same idea DRF uses (with much more: authentication, permissions, throttling, content negotiation).",
    },
  ],
  interview: [
    { q: "What does the @api_view decorator do?", a: "It converts a Django function view into a DRF APIView: wraps the request in a DRF Request, enforces the allowed HTTP methods (405 otherwise), runs authentication, permission and throttle checks, handles APIExceptions and enables content negotiation and the browsable API.", level: "Easy" },
    { q: "Difference between request.data and request.POST?", a: "request.POST only contains form-encoded data for POST requests. request.data contains parsed data for any content type supported by the parsers (JSON, form, multipart) and for POST, PUT and PATCH.", level: "Easy" },
    { q: "What is request.query_params?", a: "A more correctly named alias for request.GET; it holds the URL query string parameters for any HTTP method.", level: "Easy" },
    { q: "What is content negotiation?", a: "The process of selecting the response format (renderer) based on the client's Accept header or format suffix, and the parser based on the Content-Type header.", level: "Medium" },
    { q: "What does @api_view() with no arguments allow?", a: "Only GET (and OPTIONS/HEAD handled automatically). Any other method returns 405.", level: "Medium" },
    { q: "Why use status.HTTP_201_CREATED instead of 201?", a: "Readability and fewer mistakes; the constant names describe the meaning. Both work identically.", level: "Easy" },
    { q: "What happens if get_object_or_404 does not find the object in a DRF view?", a: "It raises Http404 which DRF's exception handler converts to a 404 response with {\"detail\": \"No Book matches the given query.\"}.", level: "Medium" },
    { q: "Do function-based DRF views need csrf_exempt for POST from Postman?", a: "No. DRF views are csrf_exempt by default; CSRF is checked only when SessionAuthentication authenticates the user. Token and JWT clients do not need CSRF tokens.", level: "Hard" },
    { q: "How do you send a custom response header in DRF?", a: "Pass headers={...} to Response, or set response['X-Header'] = 'value' before returning.", level: "Easy" },
    { q: "What is format_suffix_patterns used for?", a: "It adds optional .json/.api suffixes to URL patterns so clients can request a format via the URL. The view must accept a format=None argument.", level: "Medium" },
    { q: "When should you prefer function-based API views?", a: "For small, one-off or non-CRUD endpoints (health check, login helper, report). For standard CRUD on a model, generic views or viewsets reduce code and duplication.", level: "Medium" },
  ],
  practice: [
    {
      task: "Write a Student CRUD API with two function-based views: /api/students/ and /api/students/<id>/.",
      hint: "Copy the book_list/book_detail pattern and swap the model and serializer.",
      solution: `@api_view(["GET", "POST"])
def student_list(request):
    if request.method == "GET":
        return Response(StudentSerializer(Student.objects.all(), many=True).data)
    s = StudentSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    s.save()
    return Response(s.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
def student_detail(request, pk):
    student = get_object_or_404(Student, pk=pk)
    if request.method == "GET":
        return Response(StudentSerializer(student).data)
    if request.method == "DELETE":
        student.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    s = StudentSerializer(student, data=request.data, partial=request.method == "PATCH")
    s.is_valid(raise_exception=True)
    s.save()
    return Response(s.data)`,
    },
    {
      task: "Create GET /api/books/stats/ returning total books, average price and max price.",
      hint: "Use Book.objects.aggregate(Count, Avg, Max).",
      solution: `from django.db.models import Avg, Count, Max


@api_view(["GET"])
def book_stats(request):
    stats = Book.objects.aggregate(total=Count("id"), avg_price=Avg("price"), max_price=Max("price"))
    return Response(stats)

# {"total": 2, "avg_price": "674.750000", "max_price": "899.50"}`,
    },
    {
      task: "Add POST /api/books/<id>/toggle-stock/ that flips in_stock and returns the new value.",
      hint: "get_object_or_404, flip the boolean, save(update_fields=[...]).",
      solution: `@api_view(["POST"])
def toggle_stock(request, pk):
    book = get_object_or_404(Book, pk=pk)
    book.in_stock = not book.in_stock
    book.save(update_fields=["in_stock"])
    return Response({"id": book.id, "in_stock": book.in_stock})`,
    },
    {
      task: "Make /api/books/ return 400 with {\"detail\": \"Too many\"} if ?limit is above 50.",
      hint: "Read query_params, convert to int, raise ValidationError.",
      solution: `limit = int(request.query_params.get("limit", 10))
if limit > 50:
    raise ValidationError({"detail": "Too many"})`,
    },
  ],
  quiz: [
    { question: "Which attribute holds parsed JSON body in DRF?", options: ["request.body", "request.POST", "request.json", "request.data"], answer: 3, explanation: "request.data works for JSON, form and multipart bodies." },
    { question: "@api_view(['GET']) receives a PUT request. Response?", options: ["405 Method Not Allowed", "400 Bad Request", "404 Not Found", "200 OK"], answer: 0, explanation: "Methods not in the list are rejected with 405." },
    { question: "What does request.query_params correspond to in Django?", options: ["request.POST", "request.GET", "request.META", "request.COOKIES"], answer: 1, explanation: "query_params is a clearer alias for request.GET." },
    { question: "Which renderer gives the HTML page in the browser?", options: ["JSONRenderer", "TemplateHTMLRenderer", "BrowsableAPIRenderer", "StaticHTMLRenderer"], answer: 2, explanation: "BrowsableAPIRenderer renders the interactive HTML page." },
    { question: "Correct return for a successful delete?", options: ["Response(status=204)", "Response({'deleted': True}, status=201)", "Response(None, status=404)", "HttpResponse('ok')"], answer: 0, explanation: "204 No Content with no body is the REST convention." },
  ],
};
