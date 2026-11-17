export default {
  id: "day-10-throttling-versioning-api-docs",
  title: "Throttling, Versioning, API Documentation (drf-spectacular / Swagger)",
  module: "Module 2: Auth & Advanced",
  day: 10,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Protect your API from abuse with throttling (rate limits), evolve it safely with versioning (URL path, namespace, header), and generate OpenAPI 3 documentation with Swagger UI and ReDoc using drf-spectacular.",
  objectives: [
    "Configure AnonRateThrottle, UserRateThrottle and ScopedRateThrottle and read 429 responses",
    "Write a custom throttle class and understand that throttling needs a cache",
    "Implement URLPathVersioning, NamespaceVersioning and AcceptHeaderVersioning and branch on request.version",
    "Generate an OpenAPI 3 schema with drf-spectacular and serve Swagger UI and ReDoc",
    "Improve documentation with @extend_schema, OpenApiParameter and OpenApiExample",
  ],
  theory: [
    {
      heading: "Throttling: Rate Limiting Your API",
      content: "Throttling limits how many requests a client can make in a time window, like a ticket counter that serves each person at most 5 times an hour. It protects against brute-force login attempts, scrapers and accidental infinite loops in a frontend. DRF checks throttles after authentication and permissions. When the limit is exceeded it returns 429 Too Many Requests with a Retry-After header. Throttle history is stored in Django's cache (LocMemCache by default) — in production with multiple servers use Redis so all servers share the counts.",
      points: [
        "AnonRateThrottle: limits anonymous users by IP address (scope 'anon')",
        "UserRateThrottle: limits authenticated users by user id (scope 'user')",
        "ScopedRateThrottle: different limits per view using throttle_scope = 'uploads'",
        "Rates: '100/day', '10/minute', '5/hour', '2/second'",
        "Throttling is for fairness and protection, NOT a security wall — combine with auth",
      ],
      syntax: `REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "20/minute",
        "user": "100/minute",
        "login": "5/minute",          # used by ScopedRateThrottle
    },
}`,
    },
    {
      heading: "Custom Throttles",
      content: "Subclass SimpleRateThrottle (or UserRateThrottle) and implement get_cache_key() to decide WHO is being counted, and set scope for the rate. Return None from get_cache_key to skip throttling for that request (for example staff users). Behind a load balancer set NUM_PROXIES so DRF reads the real client IP from X-Forwarded-For.",
      syntax: `class BurstRateThrottle(UserRateThrottle):
    scope = "burst"        # e.g. "10/second"

class SustainedRateThrottle(UserRateThrottle):
    scope = "sustained"    # e.g. "1000/day"

throttle_classes = [BurstRateThrottle, SustainedRateThrottle]`,
    },
    {
      heading: "API Versioning",
      content: "Once a mobile app is in users' phones, you cannot force everyone to update. If you rename a field, old apps break. Versioning lets v1 and v2 live side by side. DRF sets request.version from the chosen scheme; your view or serializer branches on it. Think of a textbook with editions: the 2nd edition is new, but students with the 1st edition can still follow their class.",
      points: [
        "URLPathVersioning: /api/v1/books/ — most visible and popular; needs <version> in the URL",
        "NamespaceVersioning: same URLs but versions come from include(..., namespace='v1')",
        "AcceptHeaderVersioning: Accept: application/json; version=2.0 — clean URLs",
        "QueryParameterVersioning: /api/books/?version=v2",
        "HostNameVersioning: v1.api.example.com",
        "Settings: DEFAULT_VERSION, ALLOWED_VERSIONS, VERSION_PARAM",
      ],
      tip: "Only create a new version for breaking changes (removing/renaming fields, changing types). Adding a new optional field is not breaking.",
    },
    {
      heading: "API Documentation with OpenAPI and drf-spectacular",
      content: "Frontend and mobile developers need to know every endpoint, its parameters, request body and response shape. OpenAPI 3 (formerly Swagger spec) is the standard machine-readable description of a REST API. drf-spectacular reads your ViewSets, serializers, filters, pagination and authentication and generates the OpenAPI schema automatically. Swagger UI displays it as interactive docs with a 'Try it out' button; ReDoc displays clean read-only docs. The older drf-yasg supports only OpenAPI 2, so drf-spectacular is the recommended choice for DRF 3.15.",
      syntax: `pip install drf-spectacular

INSTALLED_APPS += ["drf_spectacular"]
REST_FRAMEWORK = {"DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema"}
SPECTACULAR_SETTINGS = {"TITLE": "Library API", "VERSION": "1.0.0"}

# urls.py
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),`,
    },
    {
      heading: "Improving the Generated Docs",
      content: "Auto-generation covers most endpoints, but function views, custom actions and SerializerMethodField need hints. Use @extend_schema on views/actions, @extend_schema_view for ViewSets, @extend_schema_field for method fields, OpenApiParameter for query params and OpenApiExample for sample bodies. Run python manage.py spectacular --file schema.yml --validate in CI to catch warnings.",
      points: [
        "@extend_schema(request=..., responses={200: ...}, summary='...', tags=['books'])",
        "OpenApiParameter('search', str, description='...')",
        "Docstrings of views become descriptions",
        "Add the JWT 'Authorize' button: SimpleJWT is auto-detected by drf-spectacular",
        "Hide docs in production or protect them with SERVE_PERMISSIONS",
      ],
    },
  ],
  examples: [
    {
      title: "Global and Scoped Throttling (protect the login endpoint)",
      scenario: "Limit anonymous users to 20 requests/minute, logged-in users to 100/minute, and the JWT login endpoint to 5 attempts/minute to stop password guessing.",
      steps: [
        "Edit REST_FRAMEWORK in config/settings.py with throttle classes and rates",
        "Subclass TokenObtainPairView with ScopedRateThrottle and throttle_scope='login'",
        "Run the server and send 6 wrong login requests quickly with a bash loop",
        "Observe the 429 response and Retry-After header",
      ],
      code: `# config/settings.py
REST_FRAMEWORK = {
    # ... auth, permissions, pagination from earlier days ...
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "20/minute",
        "user": "100/minute",
        "login": "5/minute",
    },
}

# Production: shared cache so all Gunicorn workers/servers share counters
# CACHES = {"default": {"BACKEND": "django.core.cache.backends.redis.RedisCache",
#                       "LOCATION": "redis://127.0.0.1:6379/1"}}


# accounts/views.py
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView


class ThrottledLoginView(TokenObtainPairView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

# accounts/urls.py
path("token/", ThrottledLoginView.as_view(), name="token_obtain_pair"),


# bash: 6 wrong attempts
for i in 1 2 3 4 5 6; do
  curl -s -o /dev/null -w "%{http_code}\\n" -X POST http://127.0.0.1:8000/api/auth/token/ \\
       -H "Content-Type: application/json" -d '{"username":"asha","password":"wrong"}'
done

curl -i -X POST http://127.0.0.1:8000/api/auth/token/ \\
     -H "Content-Type: application/json" -d '{"username":"asha","password":"wrong"}'`,
      result: `401
401
401
401
401
429

HTTP/1.1 429 Too Many Requests
Retry-After: 52
Content-Type: application/json

{"detail": "Request was throttled. Expected available in 52 seconds."}`,
      explanation: "Failed logins still count, so attackers get only 5 guesses per minute per IP. Setting throttle_classes on the view replaces the global anon/user throttles for that view. The counter lives in the cache; LocMemCache is per-process, so use Redis when running multiple workers.",
    },
    {
      title: "URL Path Versioning: v1 and v2 Side by Side",
      scenario: "v1 of the books API returns 'author' as a string. v2 changes it to a nested object and adds 'rating'. Old mobile apps must keep working.",
      steps: [
        "Add DEFAULT_VERSIONING_CLASS and ALLOWED_VERSIONS to REST_FRAMEWORK",
        "Change config/urls.py to include books.urls under api/<version>/",
        "Write BookSerializerV1 and BookSerializerV2",
        "Choose the serializer in get_serializer_class using self.request.version",
        "Call /api/v1/books/1/, /api/v2/books/1/ and /api/v3/books/1/",
      ],
      code: `# config/settings.py
REST_FRAMEWORK = {
    ...
    "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.URLPathVersioning",
    "DEFAULT_VERSION": "v1",
    "ALLOWED_VERSIONS": ["v1", "v2"],
    "VERSION_PARAM": "version",
}

# config/urls.py
from django.urls import re_path
urlpatterns = [
    path("admin/", admin.site.urls),
    re_path(r"^api/(?P<version>v1|v2)/", include("books.urls")),
    path("api/auth/", include("accounts.urls")),
]


# books/serializers.py
class BookSerializerV1(serializers.ModelSerializer):
    author = serializers.StringRelatedField()

    class Meta:
        model = Book
        fields = ["id", "title", "author", "price"]


class BookSerializerV2(serializers.ModelSerializer):
    author = AuthorMiniSerializer(read_only=True)
    rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Book
        fields = ["id", "title", "author", "price", "rating"]


# books/views.py
from django.db.models import Avg


class BookViewSet(viewsets.ReadOnlyModelViewSet):
    def get_queryset(self):
        qs = Book.objects.select_related("author").order_by("id")
        if self.request.version == "v2":
            qs = qs.annotate(rating=Avg("reviews__rating"))
        return qs

    def get_serializer_class(self):
        return BookSerializerV2 if self.request.version == "v2" else BookSerializerV1


# Reverse URLs keep the version automatically:
# reverse("book-detail", kwargs={"pk": 1}, request=request) -> /api/v2/books/1/

# curl
curl http://127.0.0.1:8000/api/v1/books/1/
curl http://127.0.0.1:8000/api/v2/books/1/
curl http://127.0.0.1:8000/api/v3/books/1/`,
      result: `GET /api/v1/books/1/ -> 200 OK
{"id": 1, "title": "Clean Code", "author": "Robert Martin", "price": "425.00"}

GET /api/v2/books/1/ -> 200 OK
{"id": 1, "title": "Clean Code",
 "author": {"id": 1, "name": "Robert Martin", "slug": "robert-martin"},
 "price": "425.00", "rating": 4.5}

GET /api/v3/books/1/ -> 404 Not Found   (regex allows only v1|v2)
(with a generic <str:version> pattern DRF would return 404 {"detail": "Invalid version in URL path."})`,
      explanation: "request.version is set by the versioning class before your code runs. One ViewSet serves both versions; only the serializer and queryset differ. Deprecate old versions with a timeline and a Deprecation/Sunset header rather than deleting them suddenly.",
    },
    {
      title: "Swagger UI and ReDoc with drf-spectacular",
      scenario: "The React and Android teams need interactive API docs with JWT authorization and examples.",
      steps: [
        "pip install drf-spectacular and update requirements.txt",
        "Add 'drf_spectacular' to INSTALLED_APPS and DEFAULT_SCHEMA_CLASS to REST_FRAMEWORK",
        "Add SPECTACULAR_SETTINGS and the three URLs",
        "Decorate the custom action and the stats view with @extend_schema",
        "Open http://127.0.0.1:8000/api/docs/, click Authorize, paste the access token and try an endpoint",
        "Generate the schema file: python manage.py spectacular --file schema.yml --validate",
      ],
      code: `pip install drf-spectacular      # drf-spectacular==0.28.0

# config/settings.py
INSTALLED_APPS += ["drf_spectacular"]

REST_FRAMEWORK = {
    ...
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Library API",
    "DESCRIPTION": "Books, authors, reviews and orders for the Library project.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
}

# config/urls.py
from drf_spectacular.views import (SpectacularAPIView, SpectacularRedocView,
                                   SpectacularSwaggerView)

urlpatterns += [
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]


# books/views.py
from drf_spectacular.utils import (OpenApiExample, OpenApiParameter, extend_schema,
                                   extend_schema_view, inline_serializer)
from rest_framework import serializers


@extend_schema_view(
    list=extend_schema(summary="List books", tags=["books"],
                       parameters=[OpenApiParameter("search", str, description="Search title/author")]),
    create=extend_schema(summary="Create a book", tags=["books"],
                         examples=[OpenApiExample("Sample book", value={
                             "title": "Clean Code", "price": "450.00", "author_id": 1, "tag_ids": [1]})]),
)
class BookViewSet(viewsets.ModelViewSet):
    """CRUD for books. Anyone can read; librarians can write."""
    ...

    @extend_schema(request=None, responses={200: BookSerializer}, tags=["books"],
                   summary="Mark a book as sold out")
    @action(detail=True, methods=["post"], url_path="mark-sold-out")
    def mark_sold_out(self, request, pk=None, version=None):
        ...


@extend_schema(
    tags=["stats"],
    responses=inline_serializer("Stats", fields={
        "total": serializers.IntegerField(),
        "avg_price": serializers.DecimalField(max_digits=8, decimal_places=2),
    }),
)
@api_view(["GET"])
def book_stats(request, version=None):
    ...

# terminal
python manage.py spectacular --file schema.yml --validate
curl http://127.0.0.1:8000/api/schema/ -H "Accept: application/json" | head -c 300`,
      result: `GET /api/docs/  -> Swagger UI page:
  [Authorize]  Library API 1.0.0
  books   GET /api/{version}/books/        List books
          POST /api/{version}/books/       Create a book
          GET /api/{version}/books/{id}/
          POST /api/{version}/books/{id}/mark-sold-out/   Mark a book as sold out
  auth    POST /api/auth/token/ ...
  stats   GET /api/{version}/stats/

GET /api/schema/ (Accept: application/json) ->
{"openapi": "3.0.3", "info": {"title": "Library API", "version": "1.0.0",
 "description": "Books, authors, reviews and orders for the Library project."},
 "paths": {"/api/{version}/books/": {"get": {"operationId": "books_list", ...`,
      explanation: "drf-spectacular introspects serializers, so request/response bodies, required fields, enums, pagination wrappers and filter params appear automatically. The JWT security scheme is detected from SimpleJWT, giving the Authorize button. COMPONENT_SPLIT_REQUEST creates separate request/response components so read_only fields are not shown as inputs. --validate fails CI if the schema is broken.",
    },
    {
      title: "Pure Python Demo: A Sliding-Window Rate Limiter",
      scenario: "Implement the same algorithm DRF's SimpleRateThrottle uses: keep a history of request timestamps per key and allow a request only if fewer than N happened in the last window.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `class SimpleRateThrottle:
    def __init__(self, rate):
        num, period = rate.split("/")
        self.num_requests = int(num)
        self.duration = {"s": 1, "m": 60, "h": 3600, "d": 86400}[period[0]]
        self.cache = {}

    def allow_request(self, key, now):
        history = [t for t in self.cache.get(key, []) if t > now - self.duration]
        if len(history) >= self.num_requests:
            self.cache[key] = history
            self.wait_seconds = self.duration - (now - history[0])
            return False
        history.append(now)
        self.cache[key] = history
        return True


throttle = SimpleRateThrottle("3/minute")
timeline = [("ip-1", 0), ("ip-1", 10), ("ip-2", 15), ("ip-1", 20),
            ("ip-1", 30), ("ip-1", 61), ("ip-1", 65)]

for key, t in timeline:
    if throttle.allow_request(key, t):
        print(f"t={t:>3}s {key}: 200 OK")
    else:
        print(f"t={t:>3}s {key}: 429 Too Many Requests (retry after {throttle.wait_seconds}s)")`,
      python: {
        files: {
          "main.py": `class SimpleRateThrottle:
    def __init__(self, rate):
        num, period = rate.split("/")
        self.num_requests = int(num)
        self.duration = {"s": 1, "m": 60, "h": 3600, "d": 86400}[period[0]]
        self.cache = {}

    def allow_request(self, key, now):
        history = [t for t in self.cache.get(key, []) if t > now - self.duration]
        if len(history) >= self.num_requests:
            self.cache[key] = history
            self.wait_seconds = self.duration - (now - history[0])
            return False
        history.append(now)
        self.cache[key] = history
        return True


throttle = SimpleRateThrottle("3/minute")
timeline = [("ip-1", 0), ("ip-1", 10), ("ip-2", 15), ("ip-1", 20),
            ("ip-1", 30), ("ip-1", 61), ("ip-1", 65)]

for key, t in timeline:
    if throttle.allow_request(key, t):
        print(f"t={t:>3}s {key}: 200 OK")
    else:
        print(f"t={t:>3}s {key}: 429 Too Many Requests (retry after {throttle.wait_seconds}s)")
`,
        },
      },
      result: `t=  0s ip-1: 200 OK
t= 10s ip-1: 200 OK
t= 15s ip-2: 200 OK
t= 20s ip-1: 200 OK
t= 30s ip-1: 429 Too Many Requests (retry after 30s)
t= 61s ip-1: 200 OK
t= 65s ip-1: 429 Too Many Requests (retry after 5s)`,
      explanation: "Each client key (IP or user id) has its own history list. At t=30 ip-1 already has 3 requests within 60 s, so it is blocked until the oldest (t=0) expires. At t=61 the t=0 entry falls out of the window, so one more request is allowed. ip-2 is counted separately. DRF stores this history in the Django cache.",
    },
  ],
  interview: [
    { q: "What is throttling in DRF?", a: "Rate limiting: controlling how many requests a client can make in a time period. DRF returns 429 Too Many Requests with a Retry-After header when the limit is exceeded.", level: "Easy" },
    { q: "Difference between AnonRateThrottle, UserRateThrottle and ScopedRateThrottle?", a: "AnonRateThrottle limits unauthenticated requests by IP. UserRateThrottle limits by user id (IP for anonymous). ScopedRateThrottle applies a rate from DEFAULT_THROTTLE_RATES based on the view's throttle_scope attribute.", level: "Medium" },
    { q: "Where does DRF store throttle data and why does it matter?", a: "In Django's cache. With the default LocMemCache each process has separate counters, so with several Gunicorn workers or servers limits are not enforced correctly. Use a shared cache like Redis.", level: "Hard" },
    { q: "Is throttling a security feature?", a: "Partly. It slows brute force and abuse, but it is not a substitute for authentication, permissions or a WAF; IPs can be spoofed or rotated, and determined attackers can distribute requests.", level: "Medium" },
    { q: "Why version an API?", a: "To introduce breaking changes (renamed/removed fields, different structures) without breaking existing clients, especially mobile apps that cannot be updated instantly.", level: "Easy" },
    { q: "Name DRF versioning schemes.", a: "URLPathVersioning, NamespaceVersioning, AcceptHeaderVersioning, QueryParameterVersioning and HostNameVersioning.", level: "Easy" },
    { q: "How do you access the version in a view?", a: "request.version, set by the versioning class. request.versioning_scheme gives the scheme instance (used for reverse()).", level: "Easy" },
    { q: "What is OpenAPI?", a: "A standard, language-agnostic specification (YAML/JSON) describing REST API endpoints, parameters, request/response bodies and auth. Swagger UI and ReDoc render it as documentation; code generators can create clients from it.", level: "Easy" },
    { q: "drf-spectacular vs drf-yasg?", a: "drf-spectacular generates OpenAPI 3.0 and is actively maintained and recommended for modern DRF. drf-yasg generates Swagger/OpenAPI 2.0. DRF's own built-in schema generation is deprecated.", level: "Medium" },
    { q: "How do you document a custom @action or function view with drf-spectacular?", a: "Use @extend_schema with request, responses, parameters (OpenApiParameter), examples (OpenApiExample), summary and tags. For SerializerMethodField use @extend_schema_field.", level: "Medium" },
    { q: "Which status code and header does a throttled request get?", a: "429 Too Many Requests with a Retry-After header giving the seconds to wait.", level: "Easy" },
    { q: "When should you NOT create a new API version?", a: "For non-breaking changes like adding optional fields or new endpoints. Clients ignore unknown fields, so these can be added to the existing version.", level: "Medium" },
  ],
  practice: [
    {
      task: "Allow at most 10 uploads per hour per user on an upload endpoint, without affecting other endpoints.",
      hint: "ScopedRateThrottle with throttle_scope='uploads' and rate '10/hour'.",
      solution: `# settings
"DEFAULT_THROTTLE_RATES": {"anon": "20/minute", "user": "100/minute", "uploads": "10/hour"}

class UploadView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "uploads"`,
    },
    {
      task: "Write a throttle that never limits staff users but limits others to 30/minute.",
      hint: "Subclass UserRateThrottle; return None from get_cache_key or True from allow_request for staff.",
      solution: `class NonStaffThrottle(UserRateThrottle):
    scope = "nonstaff"     # "30/minute" in DEFAULT_THROTTLE_RATES

    def allow_request(self, request, view):
        if request.user.is_authenticated and request.user.is_staff:
            return True
        return super().allow_request(request, view)`,
    },
    {
      task: "Use AcceptHeaderVersioning so clients send Accept: application/json; version=2.0.",
      hint: "DEFAULT_VERSIONING_CLASS and ALLOWED_VERSIONS.",
      solution: `REST_FRAMEWORK = {
    "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.AcceptHeaderVersioning",
    "DEFAULT_VERSION": "1.0",
    "ALLOWED_VERSIONS": ["1.0", "2.0"],
}

# curl -H "Accept: application/json; version=2.0" http://127.0.0.1:8000/api/books/`,
    },
    {
      task: "Document a query parameter ?in_stock=true on the books list in Swagger.",
      hint: "@extend_schema with OpenApiParameter of type bool.",
      solution: `@extend_schema(parameters=[
    OpenApiParameter("in_stock", bool, OpenApiParameter.QUERY, description="Only books in stock"),
])
def list(self, request, *args, **kwargs):
    return super().list(request, *args, **kwargs)`,
    },
    {
      task: "Restrict the Swagger docs to staff users only.",
      hint: "SPECTACULAR_SETTINGS SERVE_PERMISSIONS.",
      solution: `SPECTACULAR_SETTINGS = {
    "TITLE": "Library API",
    "VERSION": "1.0.0",
    "SERVE_PERMISSIONS": ["rest_framework.permissions.IsAdminUser"],
}`,
    },
  ],
  quiz: [
    { question: "Throttled requests receive which status code?", options: ["403", "503", "429", "408"], answer: 2, explanation: "429 Too Many Requests, with Retry-After." },
    { question: "Which throttle uses a per-view throttle_scope?", options: ["ScopedRateThrottle", "AnonRateThrottle", "UserRateThrottle", "BaseThrottle"], answer: 0, explanation: "ScopedRateThrottle reads view.throttle_scope." },
    { question: "With URLPathVersioning, where does DRF put the version?", options: ["request.data['version']", "request.version", "request.META['VERSION']", "view.version"], answer: 1, explanation: "All versioning schemes set request.version." },
    { question: "drf-spectacular generates which spec?", options: ["Swagger 2.0", "RAML", "GraphQL SDL", "OpenAPI 3"], answer: 3, explanation: "drf-spectacular targets OpenAPI 3.0." },
    { question: "Which decorator customises schema for a view or action in drf-spectacular?", options: ["@swagger_auto_schema", "@extend_schema", "@api_doc", "@openapi"], answer: 1, explanation: "@extend_schema is drf-spectacular's main decorator (@swagger_auto_schema is drf-yasg)." },
  ],
};
