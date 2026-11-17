export default {
  id: "day-12-full-stack-project-interview",
  title: "Python Full Stack Final Project and Interview Questions",
  module: "Module 3: Full Stack",
  day: 12,
  level: "Advanced",
  duration: "6 hours",
  summary: "Build and test a complete Python full stack project — BookNest, an online bookstore with Django 5 + DRF 3.15 + SimpleJWT + django-filter + drf-spectacular on the backend and React on the frontend — then take a practical test and revise 30 must-know DRF interview questions.",
  objectives: [
    "Plan a full stack project: requirements, data model, API contract and folder structure",
    "Implement a production-style DRF backend with JWT auth, permissions, filters, pagination, nested orders and docs",
    "Write automated API tests with APITestCase and APIClient (auth, permissions, validation, business rules)",
    "Connect the React frontend and prepare the project for deployment (env vars, MySQL, Gunicorn, CORS)",
    "Answer 25+ common DRF and full stack interview questions confidently",
  ],
  theory: [
    {
      heading: "Project Brief: BookNest Online Bookstore",
      content: "BookNest is a small but complete e-commerce style project that ties together all 12 days. Customers can register, log in with JWT, browse and search books by category and price, view book details with reviews, add a review (once per book), and place an order with multiple items. Staff users manage books and categories. The API is documented with Swagger, protected with throttling, and consumed by a React SPA. This is exactly the kind of project to put on your resume and GitHub, and to explain in interviews.",
      points: [
        "Users: register, login, refresh, logout, profile (/api/auth/...)",
        "Catalogue: categories, books with search/filter/order/pagination (/api/v1/books/)",
        "Reviews: one review per user per book, rating 1-5, average rating on book",
        "Orders: nested order items, server-side totals, stock check, customer sees only own orders",
        "Admin/staff: full CRUD on books; customers read-only",
        "Docs: /api/docs/ (Swagger), /api/redoc/; Tests: python manage.py test",
      ],
    },
    {
      heading: "Architecture and Folder Structure",
      content: "Keep the backend and frontend as two folders in one Git repository (a monorepo) or two repositories. Split the Django project into apps by domain: accounts, catalog, orders. Each app owns its models, serializers, views, permissions, urls and tests. Settings read secrets from environment variables so the same code runs locally and in production.",
      syntax: `booknest/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env                      # SECRET_KEY, DEBUG, DB_*, CORS origins (never commit)
│   ├── config/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── accounts/   (serializers.py, views.py, urls.py, tests.py)
│   ├── catalog/    (models.py, serializers.py, views.py, filters.py, permissions.py, urls.py, tests.py)
│   └── orders/     (models.py, serializers.py, views.py, urls.py, tests.py)
└── frontend/
    ├── .env                      # VITE_API_URL
    └── src/ (api/, context/, components/, pages/)`,
    },
    {
      heading: "API Contract (Design Before Code)",
      content: "Write the endpoint table first and agree on it with the frontend developer. This is the 'menu' both teams build against. Follow REST rules: plural nouns, proper methods and status codes, consistent error format.",
      syntax: `Method  URL                                   Auth        Description
POST    /api/auth/register/                    public      create account -> tokens
POST    /api/auth/token/                       public      login -> access/refresh (5/min)
POST    /api/auth/token/refresh/               public      new access token
POST    /api/auth/logout/                      user        blacklist refresh
GET     /api/auth/me/                          user        profile
GET     /api/v1/categories/                    public      list categories (no pagination)
GET     /api/v1/books/?search=&category=&min_price=&max_price=&ordering=&page=
                                               public      list books
GET     /api/v1/books/{slug}/                  public      book detail + reviews
POST    /api/v1/books/                         staff       create book
PATCH   /api/v1/books/{slug}/                  staff       update
DELETE  /api/v1/books/{slug}/                  staff       delete
POST    /api/v1/books/{slug}/reviews/          user        add review (one per user)
GET     /api/v1/orders/                        user        my orders
POST    /api/v1/orders/                        user        place order (nested items)
GET     /api/v1/orders/{id}/                   owner       order detail
POST    /api/v1/orders/{id}/cancel/            owner       cancel if PENDING`,
    },
    {
      heading: "Testing DRF APIs",
      content: "Automated tests prove your API works and keep it working when you change code. DRF provides APITestCase (a Django TestCase with an APIClient) and APIClient, which can send JSON (format='json') and authenticate with force_authenticate(user=...) or real credentials. Each test runs inside a transaction on a fresh test database, so tests do not affect each other or your real data. Test the behaviour clients care about: status codes, response data, permissions (401/403/404), validation errors (400) and business rules (stock reduced, total calculated). Use reverse() with router names instead of hard-coding URLs.",
      syntax: `from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

class BookAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):              # runs once per class (fast)
        cls.user = User.objects.create_user("asha", password="pass12345")

    def test_list_is_public(self):
        res = self.client.get(reverse("book-list", kwargs={"version": "v1"}))
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_create_requires_staff(self):
        self.client.force_authenticate(self.user)
        res = self.client.post(reverse("book-list", kwargs={"version": "v1"}), {...}, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

# python manage.py test            (all)
# python manage.py test orders -v 2 (one app, verbose)
# coverage run manage.py test && coverage report`,
      points: [
        "Arrange - Act - Assert: create data, call the API, check the result",
        "force_authenticate skips the login; test the real login flow once separately",
        "assertNumQueries protects against N+1 regressions",
        "pytest + pytest-django is a popular alternative test runner",
      ],
    },
    {
      heading: "Production Checklist",
      content: "Before deploying (Render, Railway, AWS, PythonAnywhere), go through this list. Interviewers often ask 'what changes for production?'.",
      points: [
        "DEBUG=False, SECRET_KEY and DB credentials from environment variables",
        "ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS and CSRF_TRUSTED_ORIGINS set to real domains",
        "MySQL/PostgreSQL instead of SQLite; run migrate on deploy",
        "Remove BrowsableAPIRenderer if you want JSON-only responses",
        "Gunicorn as WSGI server behind Nginx; HTTPS everywhere (SECURE_SSL_REDIRECT)",
        "Redis cache for throttling; logging and error monitoring (Sentry)",
        "python manage.py check --deploy, collectstatic, and tests in CI (GitHub Actions)",
        "React: npm run build, serve dist/ from Nginx/Netlify/Vercel with VITE_API_URL pointing to the API",
      ],
    },
    {
      heading: "How to Present This Project in an Interview",
      content: "Interviewers care less about how many features you have and more about whether you understand your decisions. Prepare a 2-minute explanation: the problem, the stack, the architecture diagram (React -> DRF -> MySQL), one hard problem you solved (e.g. preventing overselling with transaction.atomic and F expressions, or N+1 queries fixed with select_related), how you secured it (JWT, permissions, throttling) and how you tested it. Keep the GitHub README clear with setup steps, screenshots and the API table.",
      tip: "Be honest about what you would improve: Celery for emails, Redis caching, payment gateway integration, Docker, refresh token in httpOnly cookie.",
    },
  ],
  examples: [
    {
      title: "Backend Setup: Settings, Requirements and URLs",
      scenario: "Create the BookNest backend with all packages from the course and production-ready settings that read from environment variables.",
      steps: [
        "Create folder booknest/backend, open it in VS Code (or PyCharm -> New Project with a virtualenv)",
        "Create and activate venv; pip install the requirements below",
        "django-admin startproject config . then startapp accounts, catalog, orders",
        "Write config/settings.py (key parts below) and .env",
        "Run python manage.py migrate, createsuperuser, runserver; open /api/docs/",
      ],
      code: `# requirements.txt
Django==5.1.4
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.1
django-filter==24.3
django-cors-headers==4.6.0
drf-spectacular==0.28.0
python-dotenv==1.0.1
mysqlclient==2.2.6          # optional: MySQL
gunicorn==23.0.0            # production

# commands
python -m venv venv && source venv/bin/activate      # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
django-admin startproject config .
python manage.py startapp accounts
python manage.py startapp catalog
python manage.py startapp orders

# .env  (do not commit; add to .gitignore)
SECRET_KEY=change-me-in-production
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173
DB_ENGINE=sqlite
# DB_ENGINE=mysql  DB_NAME=booknest  DB_USER=root  DB_PASSWORD=secret  DB_HOST=127.0.0.1


# config/settings.py (key parts)
import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.environ["SECRET_KEY"]
DEBUG = os.getenv("DEBUG", "False") == "True"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

INSTALLED_APPS = [
    "django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
    "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles",
    "corsheaders", "rest_framework", "rest_framework_simplejwt.token_blacklist",
    "django_filters", "drf_spectacular",
    "accounts", "catalog", "orders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

if os.getenv("DB_ENGINE") == "mysql":
    DATABASES = {"default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.environ["DB_NAME"], "USER": os.environ["DB_USER"],
        "PASSWORD": os.environ["DB_PASSWORD"], "HOST": os.getenv("DB_HOST", "127.0.0.1"),
        "PORT": os.getenv("DB_PORT", "3306"), "OPTIONS": {"charset": "utf8mb4"},
    }}
else:
    DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}

CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticatedOrReadOnly"],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
    "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.URLPathVersioning",
    "ALLOWED_VERSIONS": ["v1"],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {"anon": "60/minute", "user": "300/minute", "login": "5/minute"},
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

SPECTACULAR_SETTINGS = {"TITLE": "BookNest API", "VERSION": "1.0.0", "COMPONENT_SPLIT_REQUEST": True}


# config/urls.py
from django.contrib import admin
from django.urls import include, path, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    re_path(r"^api/(?P<version>v1)/", include("catalog.urls")),
    re_path(r"^api/(?P<version>v1)/", include("orders.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]`,
      result: `$ python manage.py migrate
Operations to perform:
  Apply all migrations: accounts, admin, auth, catalog, contenttypes, orders, sessions, token_blacklist
Running migrations:
  ...
  Applying token_blacklist.0012_alter_outstandingtoken_user... OK

$ python manage.py runserver
System check identified no issues (0 silenced).
Django version 5.1.4, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/`,
      explanation: "All course packages come together in one REST_FRAMEWORK dict: JWT auth, default read-only for anonymous users, global filter backends, pagination, URL versioning, throttling and drf-spectacular. python-dotenv loads .env so secrets never live in code. Switching to MySQL is one env variable.",
    },
    {
      title: "Catalog App: Models, Serializers, Permissions, Filters and ViewSets",
      scenario: "Implement categories, books (slug lookup, staff-only writes, search/filter/order) and reviews (one per user per book, with average rating).",
      steps: [
        "Write catalog/models.py and run makemigrations catalog + migrate",
        "Register models in catalog/admin.py and add sample data from /admin/",
        "Write catalog/permissions.py, filters.py, serializers.py, views.py and urls.py",
        "Test with curl or Swagger: list, filter, detail, create (staff), review (user)",
      ],
      code: `# catalog/models.py
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Book(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    author = models.CharField(max_length=120)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="books")
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2,
                                validators=[MinValueValidator(1)])
    stock = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Review(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["book", "user"], name="one_review_per_user")]
        ordering = ["-created_at"]


# catalog/permissions.py
from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsStaffOrReadOnly(BasePermission):
    message = "Only staff can modify the catalogue."

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or bool(request.user and request.user.is_staff)


# catalog/filters.py
import django_filters
from .models import Book


class BookFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    in_stock = django_filters.BooleanFilter(method="filter_in_stock")

    class Meta:
        model = Book
        fields = ["category", "author"]

    def filter_in_stock(self, qs, name, value):
        return qs.filter(stock__gt=0) if value else qs.filter(stock=0)


# catalog/serializers.py
from rest_framework import serializers
from .models import Book, Category, Review


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Review
        fields = ["id", "user", "rating", "comment", "created_at"]


class BookListSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(slug_field="name", read_only=True)
    avg_rating = serializers.FloatField(read_only=True, allow_null=True)

    class Meta:
        model = Book
        fields = ["id", "slug", "title", "author", "category", "price", "stock", "avg_rating"]


class BookDetailSerializer(BookListSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta(BookListSerializer.Meta):
        fields = BookListSerializer.Meta.fields + ["category_id", "description", "reviews"]


# catalog/views.py
from django.db.models import Avg
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .filters import BookFilter
from .models import Book, Category, Review
from .permissions import IsStaffOrReadOnly
from .serializers import (BookDetailSerializer, BookListSerializer,
                          CategorySerializer, ReviewSerializer)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsStaffOrReadOnly]
    pagination_class = None
    lookup_field = "slug"


class BookViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffOrReadOnly]
    filterset_class = BookFilter
    search_fields = ["title", "author", "description"]
    ordering_fields = ["price", "title", "created_at", "avg_rating"]
    lookup_field = "slug"

    def get_queryset(self):
        qs = Book.objects.select_related("category").annotate(avg_rating=Avg("reviews__rating"))
        if self.action == "retrieve":
            qs = qs.prefetch_related("reviews__user")
        return qs

    def get_serializer_class(self):
        return BookListSerializer if self.action == "list" else BookDetailSerializer

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def reviews(self, request, slug=None, version=None):
        book = self.get_object()
        if Review.objects.filter(book=book, user=request.user).exists():
            return Response({"detail": "You have already reviewed this book."},
                            status=status.HTTP_400_BAD_REQUEST)
        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(book=book, user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# catalog/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, CategoryViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("books", BookViewSet, basename="book")
urlpatterns = [path("", include(router.urls))]


# curl
curl "http://127.0.0.1:8000/api/v1/books/?category=programming&max_price=800&ordering=-avg_rating"
curl -X POST http://127.0.0.1:8000/api/v1/books/clean-code/reviews/ \\
     -H "Authorization: Bearer <asha>" -H "Content-Type: application/json" \\
     -d '{"rating": 5, "comment": "Must read for every developer"}'`,
      result: `GET /api/v1/books/?category=programming&max_price=800&ordering=-avg_rating -> 200 OK
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {"id": 1, "slug": "clean-code", "title": "Clean Code", "author": "Robert Martin",
     "category": "Programming", "price": "425.00", "stock": 12, "avg_rating": 4.5},
    {"id": 4, "slug": "python-crash-course", "title": "Python Crash Course", "author": "Eric Matthes",
     "category": "Programming", "price": "599.00", "stock": 3, "avg_rating": 4.0}
  ]
}

POST /api/v1/books/clean-code/reviews/ -> 201 Created
{"id": 9, "user": "asha", "rating": 5, "comment": "Must read for every developer",
 "created_at": "2026-11-17T15:02:44.120Z"}

POST again -> 400 Bad Request
{"detail": "You have already reviewed this book."}`,
      explanation: "This app uses every Module 1-2 concept: ModelSerializer with inheritance (detail extends list), SlugRelatedField + write-only id, nested reviews, custom permission, FilterSet, global search/ordering backends, annotate(Avg) for avg_rating (orderable!), select_related/prefetch_related, ViewSet with slug lookup and an authenticated @action. The UniqueConstraint is a database-level safety net behind the API check.",
    },
    {
      title: "Orders App: Nested Create, Stock Safety and Cancel Action",
      scenario: "Customers place orders with several items. Prevent overselling even when two customers buy the last copy at the same time, and allow cancelling pending orders (restoring stock).",
      steps: [
        "Write orders/models.py and migrate",
        "Write orders/serializers.py with validate_items and an atomic create()",
        "Write OrderViewSet with per-user queryset and a cancel action",
        "Register at /api/v1/orders/ and test with curl",
      ],
      code: `# orders/models.py
from django.conf import settings
from django.db import models
from catalog.models import Book


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING"
        SHIPPED = "SHIPPED"
        CANCELLED = "CANCELLED"

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    address = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)


# orders/serializers.py
from django.db import transaction
from django.db.models import F
from rest_framework import serializers
from catalog.models import Book
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    book = serializers.SlugRelatedField(slug_field="slug", queryset=Book.objects.all())
    title = serializers.ReadOnlyField(source="book.title")

    class Meta:
        model = OrderItem
        fields = ["book", "title", "quantity", "unit_price"]
        read_only_fields = ["unit_price"]
        extra_kwargs = {"quantity": {"min_value": 1, "max_value": 10}}


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ["id", "address", "status", "total", "created_at", "items"]
        read_only_fields = ["status", "total", "created_at"]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Add at least one item.")
        slugs = [i["book"].slug for i in items]
        if len(slugs) != len(set(slugs)):
            raise serializers.ValidationError("Duplicate books in order.")
        return items

    @transaction.atomic
    def create(self, validated_data):
        items = validated_data.pop("items")
        order = Order.objects.create(**validated_data)
        total = 0
        for item in items:
            # lock the row so two orders cannot read the same stock at once
            book = Book.objects.select_for_update().get(pk=item["book"].pk)
            if book.stock < item["quantity"]:
                raise serializers.ValidationError(
                    {"items": [f"Only {book.stock} left for '{book.title}'."]})
            Book.objects.filter(pk=book.pk).update(stock=F("stock") - item["quantity"])
            OrderItem.objects.create(order=order, book=book,
                                     quantity=item["quantity"], unit_price=book.price)
            total += book.price * item["quantity"]
        order.total = total
        order.save(update_fields=["total"])
        return order


# orders/views.py
from django.db import transaction
from django.db.models import F
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from catalog.models import Book
from .models import Order
from .serializers import OrderSerializer


class OrderViewSet(mixins.CreateModelMixin, mixins.ListModelMixin,
                   mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status"]
    ordering_fields = ["created_at", "total"]

    def get_queryset(self):
        return (Order.objects.filter(customer=self.request.user)
                .prefetch_related("items__book").order_by("-created_at"))

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def cancel(self, request, pk=None, version=None):
        order = self.get_object()
        if order.status != Order.Status.PENDING:
            return Response({"detail": f"Cannot cancel a {order.status.lower()} order."},
                            status=status.HTTP_400_BAD_REQUEST)
        for item in order.items.all():
            Book.objects.filter(pk=item.book_id).update(stock=F("stock") + item.quantity)
        order.status = Order.Status.CANCELLED
        order.save(update_fields=["status"])
        return Response(self.get_serializer(order).data)


# orders/urls.py
router = DefaultRouter()
router.register("orders", OrderViewSet, basename="order")
urlpatterns = [path("", include(router.urls))]

# curl
curl -X POST http://127.0.0.1:8000/api/v1/orders/ -H "Authorization: Bearer <asha>" \\
     -H "Content-Type: application/json" \\
     -d '{"address":"12 MG Road, Pune","items":[{"book":"clean-code","quantity":2},{"book":"python-crash-course","quantity":1}]}'
curl -X POST http://127.0.0.1:8000/api/v1/orders/1/cancel/ -H "Authorization: Bearer <asha>"
curl http://127.0.0.1:8000/api/v1/orders/1/ -H "Authorization: Bearer <ravi>"`,
      result: `POST /api/v1/orders/ -> 201 Created
{
  "id": 1,
  "address": "12 MG Road, Pune",
  "status": "PENDING",
  "total": "1449.00",
  "created_at": "2026-11-17T15:30:12.551Z",
  "items": [
    {"book": "clean-code", "title": "Clean Code", "quantity": 2, "unit_price": "425.00"},
    {"book": "python-crash-course", "title": "Python Crash Course", "quantity": 1, "unit_price": "599.00"}
  ]
}

POST /api/v1/orders/1/cancel/ -> 200 OK
{"id": 1, "address": "12 MG Road, Pune", "status": "CANCELLED", "total": "1449.00", ...}

POST /api/v1/orders/1/cancel/ (again) -> 400 Bad Request
{"detail": "Cannot cancel a cancelled order."}

GET /api/v1/orders/1/ (ravi, not the owner) -> 404 Not Found
{"detail": "No Order matches the given query."}`,
      explanation: "select_for_update() locks the book rows inside the transaction so concurrent orders wait instead of both seeing stock=1 (on SQLite this is a no-op, on MySQL/PostgreSQL it is a real row lock). Raising ValidationError inside the atomic block rolls back the order and any stock already deducted. total = 2*425 + 599 = 1449, computed on the server. Per-user get_queryset returns 404 for others' orders.",
    },
    {
      title: "Automated API Tests with APITestCase",
      scenario: "Write tests for the most important rules: public listing, staff-only writes, JWT login, review once, order total and stock, and order privacy.",
      steps: [
        "Create catalog/tests.py and orders/tests.py (delete the default tests.py content)",
        "Paste the test classes",
        "Run python manage.py test -v 2 in the VS Code terminal (PyCharm: right-click tests.py -> Run)",
        "Optional: pip install coverage; coverage run manage.py test; coverage report",
      ],
      code: `# orders/tests.py
from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from catalog.models import Book, Category
from orders.models import Order


class BookNestAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.staff = User.objects.create_user("admin", password="Admin@12345", is_staff=True)
        cls.asha = User.objects.create_user("asha", password="Asha@12345")
        cls.ravi = User.objects.create_user("ravi", password="Ravi@12345")
        cat = Category.objects.create(name="Programming", slug="programming")
        cls.book1 = Book.objects.create(title="Clean Code", author="Robert Martin",
                                        category=cat, price=Decimal("425"), stock=5)
        cls.book2 = Book.objects.create(title="Python Crash Course", author="Eric Matthes",
                                        category=cat, price=Decimal("599"), stock=1)
        cls.books_url = reverse("book-list", kwargs={"version": "v1"})
        cls.orders_url = reverse("order-list", kwargs={"version": "v1"})

    # ---------- catalog ----------
    def test_book_list_is_public_and_paginated(self):
        res = self.client.get(self.books_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 2)

    def test_search_filters_books(self):
        res = self.client.get(self.books_url, {"search": "python"})
        self.assertEqual([b["slug"] for b in res.data["results"]], ["python-crash-course"])

    def test_customer_cannot_create_book(self):
        self.client.force_authenticate(self.asha)
        res = self.client.post(self.books_url, {"title": "X"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_create_book(self):
        res = self.client.post(self.books_url, {"title": "X"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_can_create_book(self):
        self.client.force_authenticate(self.staff)
        payload = {"title": "Refactoring", "author": "Martin Fowler", "price": "700",
                   "stock": 3, "category_id": self.book1.category_id}
        res = self.client.post(self.books_url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["slug"], "refactoring")

    def test_review_only_once(self):
        self.client.force_authenticate(self.asha)
        url = reverse("book-reviews", kwargs={"version": "v1", "slug": "clean-code"})
        self.assertEqual(self.client.post(url, {"rating": 5}, format="json").status_code, 201)
        self.assertEqual(self.client.post(url, {"rating": 4}, format="json").status_code, 400)

    # ---------- auth ----------
    def test_jwt_login_returns_tokens(self):
        res = self.client.post(reverse("token_obtain_pair"),
                               {"username": "asha", "password": "Asha@12345"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + res.data["access"])
        self.assertEqual(self.client.get(reverse("me")).data["username"], "asha")

    # ---------- orders ----------
    def place_order(self, user, items):
        self.client.force_authenticate(user)
        return self.client.post(self.orders_url, {"address": "Pune", "items": items}, format="json")

    def test_order_total_and_stock(self):
        res = self.place_order(self.asha, [{"book": "clean-code", "quantity": 2},
                                           {"book": "python-crash-course", "quantity": 1}])
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["total"], "1449.00")
        self.book1.refresh_from_db()
        self.assertEqual(self.book1.stock, 3)

    def test_cannot_oversell_and_rolls_back(self):
        res = self.place_order(self.asha, [{"book": "clean-code", "quantity": 1},
                                           {"book": "python-crash-course", "quantity": 2}])
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.book1.refresh_from_db()
        self.assertEqual(self.book1.stock, 5)          # rolled back
        self.assertEqual(Order.objects.count(), 0)

    def test_other_user_cannot_see_order(self):
        order_id = self.place_order(self.asha, [{"book": "clean-code", "quantity": 1}]).data["id"]
        self.client.force_authenticate(self.ravi)
        res = self.client.get(reverse("order-detail", kwargs={"version": "v1", "pk": order_id}))
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_cancel_restores_stock(self):
        order_id = self.place_order(self.asha, [{"book": "clean-code", "quantity": 2}]).data["id"]
        url = reverse("order-cancel", kwargs={"version": "v1", "pk": order_id})
        self.assertEqual(self.client.post(url).data["status"], "CANCELLED")
        self.book1.refresh_from_db()
        self.assertEqual(self.book1.stock, 5)


# Terminal
python manage.py test -v 2`,
      result: `Found 11 test(s).
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
test_anonymous_cannot_create_book (orders.tests.BookNestAPITests.test_anonymous_cannot_create_book) ... ok
test_book_list_is_public_and_paginated (orders.tests.BookNestAPITests.test_book_list_is_public_and_paginated) ... ok
test_cancel_restores_stock (orders.tests.BookNestAPITests.test_cancel_restores_stock) ... ok
test_cannot_oversell_and_rolls_back (orders.tests.BookNestAPITests.test_cannot_oversell_and_rolls_back) ... ok
test_customer_cannot_create_book (orders.tests.BookNestAPITests.test_customer_cannot_create_book) ... ok
test_jwt_login_returns_tokens (orders.tests.BookNestAPITests.test_jwt_login_returns_tokens) ... ok
test_order_total_and_stock (orders.tests.BookNestAPITests.test_order_total_and_stock) ... ok
test_other_user_cannot_see_order (orders.tests.BookNestAPITests.test_other_user_cannot_see_order) ... ok
test_review_only_once (orders.tests.BookNestAPITests.test_review_only_once) ... ok
test_search_filters_books (orders.tests.BookNestAPITests.test_search_filters_books) ... ok
test_staff_can_create_book (orders.tests.BookNestAPITests.test_staff_can_create_book) ... ok

----------------------------------------------------------------------
Ran 11 tests in 2.874s

OK
Destroying test database for alias 'default'...`,
      explanation: "setUpTestData creates shared data once per class (fast). reverse() with router names (book-list, book-reviews, order-cancel) keeps tests valid if URLs change. force_authenticate skips the login, while test_jwt_login_returns_tokens checks the real JWT flow with client.credentials(). The rollback test proves transaction.atomic works. Anonymous POST gives 401 because JWTAuthentication is the first auth class. Note: the test DB is throttle-limited too; if you test many logins, override DEFAULT_THROTTLE_RATES with @override_settings.",
    },
    {
      title: "Frontend Integration and Deployment Commands",
      scenario: "Wire the Day 11 React app to BookNest endpoints, then prepare both parts for deployment.",
      steps: [
        "Copy the Day 11 frontend into booknest/frontend; set VITE_API_URL=http://127.0.0.1:8000/api",
        "Change book URLs to /v1/books/ and use slug for detail/review routes",
        "Add a Cart (React state) and a Checkout page that POSTs to /v1/orders/",
        "Run backend (runserver) and frontend (npm run dev) together and place an order",
        "Follow the deployment commands for production",
      ],
      code: `// frontend/src/api/shop.js
import api from "./client";

export const listBooks = (params) => api.get("/v1/books/", { params }).then((r) => r.data);
export const getBook = (slug) => api.get("/v1/books/" + slug + "/").then((r) => r.data);
export const addReview = (slug, body) => api.post("/v1/books/" + slug + "/reviews/", body);
export const placeOrder = (address, cart) =>
  api.post("/v1/orders/", {
    address,
    items: cart.map((c) => ({ book: c.slug, quantity: c.qty })),
  }).then((r) => r.data);
export const myOrders = () => api.get("/v1/orders/").then((r) => r.data);


// frontend/src/pages/CheckoutPage.jsx (core logic)
const submit = async () => {
  try {
    const order = await placeOrder(address, cart);
    clearCart();
    navigate("/orders", { state: { message: "Order #" + order.id + " placed. Total ₹" + order.total } });
  } catch (err) {
    const data = err.response?.data || {};
    setError(data.items?.[0] || data.address?.[0] || data.detail || "Could not place order");
  }
};


# ---- Production (Linux server) ----
# backend
export DEBUG=False SECRET_KEY='long-random' ALLOWED_HOSTS=api.booknest.in \\
       CORS_ALLOWED_ORIGINS=https://booknest.in DB_ENGINE=mysql DB_NAME=booknest ...
python manage.py check --deploy
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py test
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3

# frontend
cd frontend
echo "VITE_API_URL=https://api.booknest.in/api" > .env.production
npm run build            # creates dist/ -> upload to Netlify/Vercel or serve with Nginx`,
      result: `Browser flow:
  /books  -> GET /api/v1/books/?page=1                     200
  /books/clean-code -> GET /api/v1/books/clean-code/       200 (with reviews)
  Add to cart x2, Checkout -> POST /api/v1/orders/         201
  Redirect /orders: "Order #3 placed. Total ₹850.00"

$ python manage.py check --deploy
System check identified no issues (0 silenced).

$ npm run build
vite v5.4.x building for production...
✓ 112 modules transformed.
dist/index.html                  0.46 kB
dist/assets/index-B1x9.css       1.20 kB
dist/assets/index-C8f2.js      176.31 kB
✓ built in 2.41s`,
      explanation: "The frontend maps the cart to exactly the JSON shape OrderSerializer expects (book slug + quantity) and shows the first DRF error message. In production DEBUG is off, secrets come from the environment, CORS lists only the real frontend domain, and check --deploy warns about any missing security settings.",
    },
    {
      title: "Pure Python Demo: Test-Driven Order Total Logic",
      scenario: "Practise the testing mindset with the core business rule of BookNest (order total + stock check + rollback) written in plain Python and tested with unittest.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `import copy
import unittest
from decimal import Decimal


class OutOfStock(Exception):
    pass


def place_order(inventory, items):
    """Return total; update inventory only if every item is available (atomic)."""
    working = copy.deepcopy(inventory)
    total = Decimal("0")
    for slug, qty in items:
        if qty < 1:
            raise ValueError("Quantity must be at least 1.")
        book = working[slug]
        if book["stock"] < qty:
            raise OutOfStock(f"Only {book['stock']} left for '{slug}'.")
        book["stock"] -= qty
        total += book["price"] * qty
    inventory.clear()
    inventory.update(working)          # commit
    return total


class PlaceOrderTests(unittest.TestCase):
    def setUp(self):
        self.inv = {"clean-code": {"price": Decimal("425"), "stock": 5},
                    "python-crash-course": {"price": Decimal("599"), "stock": 1}}

    def test_total(self):
        total = place_order(self.inv, [("clean-code", 2), ("python-crash-course", 1)])
        self.assertEqual(total, Decimal("1449"))

    def test_stock_reduced(self):
        place_order(self.inv, [("clean-code", 2)])
        self.assertEqual(self.inv["clean-code"]["stock"], 3)

    def test_rollback_on_out_of_stock(self):
        with self.assertRaises(OutOfStock):
            place_order(self.inv, [("clean-code", 1), ("python-crash-course", 2)])
        self.assertEqual(self.inv["clean-code"]["stock"], 5)

    def test_invalid_quantity(self):
        with self.assertRaisesRegex(ValueError, "at least 1"):
            place_order(self.inv, [("clean-code", 0)])


suite = unittest.defaultTestLoader.loadTestsFromTestCase(PlaceOrderTests)
tests = list(suite)
result = unittest.TestResult()
suite.run(result)
for test in tests:
    name = test.id().split(".")[-1]
    failed = any(t is test for t, _ in result.failures + result.errors)
    print(f"{name:32} {'FAIL' if failed else 'ok'}")
print(f"Ran {result.testsRun} tests: {'OK' if result.wasSuccessful() else 'FAILED'}")
try:
    place_order({"clean-code": {"price": Decimal("425"), "stock": 1}}, [("clean-code", 3)])
except OutOfStock as e:
    print("API would return 400:", {"items": [str(e)]})`,
      python: {
        files: {
          "main.py": `import copy
import unittest
from decimal import Decimal


class OutOfStock(Exception):
    pass


def place_order(inventory, items):
    """Return total; update inventory only if every item is available (atomic)."""
    working = copy.deepcopy(inventory)
    total = Decimal("0")
    for slug, qty in items:
        if qty < 1:
            raise ValueError("Quantity must be at least 1.")
        book = working[slug]
        if book["stock"] < qty:
            raise OutOfStock(f"Only {book['stock']} left for '{slug}'.")
        book["stock"] -= qty
        total += book["price"] * qty
    inventory.clear()
    inventory.update(working)          # commit
    return total


class PlaceOrderTests(unittest.TestCase):
    def setUp(self):
        self.inv = {"clean-code": {"price": Decimal("425"), "stock": 5},
                    "python-crash-course": {"price": Decimal("599"), "stock": 1}}

    def test_total(self):
        total = place_order(self.inv, [("clean-code", 2), ("python-crash-course", 1)])
        self.assertEqual(total, Decimal("1449"))

    def test_stock_reduced(self):
        place_order(self.inv, [("clean-code", 2)])
        self.assertEqual(self.inv["clean-code"]["stock"], 3)

    def test_rollback_on_out_of_stock(self):
        with self.assertRaises(OutOfStock):
            place_order(self.inv, [("clean-code", 1), ("python-crash-course", 2)])
        self.assertEqual(self.inv["clean-code"]["stock"], 5)

    def test_invalid_quantity(self):
        with self.assertRaisesRegex(ValueError, "at least 1"):
            place_order(self.inv, [("clean-code", 0)])


suite = unittest.defaultTestLoader.loadTestsFromTestCase(PlaceOrderTests)
tests = list(suite)
result = unittest.TestResult()
suite.run(result)
for test in tests:
    name = test.id().split(".")[-1]
    failed = any(t is test for t, _ in result.failures + result.errors)
    print(f"{name:32} {'FAIL' if failed else 'ok'}")
print(f"Ran {result.testsRun} tests: {'OK' if result.wasSuccessful() else 'FAILED'}")
try:
    place_order({"clean-code": {"price": Decimal("425"), "stock": 1}}, [("clean-code", 3)])
except OutOfStock as e:
    print("API would return 400:", {"items": [str(e)]})
`,
        },
      },
      result: `test_invalid_quantity            ok
test_rollback_on_out_of_stock    ok
test_stock_reduced               ok
test_total                       ok
Ran 4 tests: OK
API would return 400: {'items': ["Only 1 left for 'clean-code'."]}`,
      explanation: "Working on a deep copy and committing only at the end mimics transaction.atomic: a failure on the second item leaves stock untouched. unittest loads tests in alphabetical order. Writing business rules as small testable functions (or model/service methods) makes DRF views thin and easy to test.",
    },
  ],
  interview: [
    { q: "Explain the request lifecycle in DRF.", a: "URL resolver -> view.as_view() -> APIView.dispatch: wrap HttpRequest in DRF Request -> initial(): perform_authentication, check_permissions, check_throttles, determine version and content negotiation -> handler (get/post or ViewSet action) -> serializer validation/save -> Response -> finalize_response renders with the chosen renderer. Exceptions are handled by handle_exception -> EXCEPTION_HANDLER.", level: "Hard" },
    { q: "What is the difference between Serializer and ModelSerializer?", a: "Serializer requires explicitly declared fields and create()/update(). ModelSerializer generates fields and validators from the model and provides default create()/update().", level: "Easy" },
    { q: "What are the different types of views in DRF?", a: "Function-based views with @api_view, class-based APIView, GenericAPIView with mixins, concrete generic views (ListCreateAPIView etc.), and ViewSets (ViewSet, GenericViewSet, ModelViewSet, ReadOnlyModelViewSet) used with routers.", level: "Easy" },
    { q: "When would you use APIView instead of a ModelViewSet?", a: "When the endpoint is not standard CRUD on one model: a dashboard aggregating data, file export, payment callback, or an operation touching several models where explicit code is clearer.", level: "Medium" },
    { q: "How do you validate data in DRF?", a: "Field arguments (required, max_length, min_value), validators=[...] (e.g. UniqueValidator), validate_<field>() for single fields and validate(attrs) for cross-field rules. Model constraints are a database-level safety net.", level: "Easy" },
    { q: "What is the difference between authentication and permissions in DRF?", a: "Authentication identifies the user and sets request.user/request.auth. Permissions decide if that user may perform the request (has_permission/has_object_permission).", level: "Easy" },
    { q: "Explain JWT access and refresh tokens.", a: "Access token: short-lived signed token sent on every request in Authorization: Bearer. Refresh token: long-lived token used only at the refresh endpoint to get new access tokens. Rotation + blacklisting make refresh tokens single-use.", level: "Medium" },
    { q: "How do you implement 'users can edit only their own objects'?", a: "Filter get_queryset by request.user for visibility and add an object-level permission like IsOwnerOrReadOnly comparing obj.owner to request.user. Set owner in perform_create, never from client data.", level: "Medium" },
    { q: "What is the N+1 query problem and how do you fix it in DRF?", a: "One query for the list plus one per row for related data. Fix with select_related (FK/OneToOne) and prefetch_related/Prefetch (M2M/reverse FK) in get_queryset, and annotate for counts/averages.", level: "Medium" },
    { q: "How do you handle nested writes?", a: "Override create()/update() in the parent serializer, pop the nested data, create parent then children, inside transaction.atomic so failures roll back.", level: "Medium" },
    { q: "How do you prevent overselling stock when two users order simultaneously?", a: "Do the check and update inside transaction.atomic with select_for_update() to lock rows, and/or use conditional updates like filter(pk=x, stock__gte=q).update(stock=F('stock')-q) and check the affected row count.", level: "Hard" },
    { q: "Difference between PageNumberPagination, LimitOffsetPagination and CursorPagination?", a: "PageNumber: ?page=n with count. LimitOffset: ?limit&offset, flexible. Cursor: opaque cursor, fixed ordering, no count, consistent and efficient for large or frequently changing datasets.", level: "Medium" },
    { q: "How do filtering, searching and ordering differ?", a: "Filtering (django-filter) restricts by specific fields and lookups; SearchFilter does free-text icontains search across several fields; OrderingFilter sorts by whitelisted fields via ?ordering=.", level: "Easy" },
    { q: "What is throttling and how is it different from permissions?", a: "Throttling limits request rate (429) temporarily based on cache counters; permissions grant or deny access permanently based on who the user is (401/403).", level: "Medium" },
    { q: "Why and how do you version an API?", a: "To introduce breaking changes without breaking existing clients. DRF supports URLPath, Namespace, AcceptHeader, QueryParameter and HostName versioning; views branch on request.version.", level: "Medium" },
    { q: "How do you document a DRF API?", a: "Generate an OpenAPI 3 schema with drf-spectacular, serve Swagger UI/ReDoc, and enrich it with @extend_schema, OpenApiParameter and OpenApiExample.", level: "Easy" },
    { q: "What is CORS and how do you enable it for a React frontend?", a: "A browser mechanism letting servers allow cross-origin reads via Access-Control-* headers. Install django-cors-headers, add corsheaders and CorsMiddleware at the top, and set CORS_ALLOWED_ORIGINS.", level: "Easy" },
    { q: "How do you test a DRF API?", a: "Use APITestCase/APIClient: create data in setUpTestData, authenticate with force_authenticate or credentials(), call endpoints with format='json', assert status codes, response data and database side effects. Use reverse() with route names.", level: "Medium" },
    { q: "What is the difference between force_authenticate and credentials in APIClient?", a: "force_authenticate(user) bypasses authentication entirely and sets the user. credentials(HTTP_AUTHORIZATION='Bearer ...') sends a real header so the actual authentication class runs.", level: "Medium" },
    { q: "What is a custom exception handler and why use one?", a: "A function set in EXCEPTION_HANDLER that wraps DRF's default handler to change the error format (e.g. {success: false, errors: {...}}), add logging, or handle extra exception types consistently.", level: "Hard" },
    { q: "What does perform_create do and why use it?", a: "A GenericAPIView/mixin hook called after validation that calls serializer.save(). Override it to inject server-side data (owner=request.user) or trigger side effects.", level: "Easy" },
    { q: "How do you use different serializers for list and detail?", a: "Override get_serializer_class() and return a lightweight serializer when self.action == 'list' and a detailed one otherwise.", level: "Easy" },
    { q: "What does SerializerMethodField do, and what is its downside?", a: "A read-only field computed by get_<name>(obj). Downside: it runs per object and can trigger N+1 queries; prefer annotate() in the queryset for aggregates.", level: "Medium" },
    { q: "How do you make DRF return only JSON in production?", a: "Set DEFAULT_RENDERER_CLASSES to only JSONRenderer, removing BrowsableAPIRenderer.", level: "Easy" },
    { q: "What changes when moving a DRF project to production?", a: "DEBUG=False, secrets in env vars, ALLOWED_HOSTS/CORS/CSRF trusted origins, production DB, Gunicorn + Nginx, HTTPS, Redis cache for throttling, logging/monitoring, check --deploy, tests in CI.", level: "Medium" },
    { q: "What is the difference between 400, 401, 403, 404 and 405 in DRF?", a: "400 validation error; 401 not authenticated; 403 authenticated but no permission; 404 object not found or hidden by queryset; 405 method not allowed on that endpoint.", level: "Easy" },
    { q: "Explain the HyperlinkedModelSerializer.", a: "Like ModelSerializer but represents relationships and the object itself with URLs (url field) instead of primary keys; requires request in context and matching view names.", level: "Medium" },
    { q: "How do you upload files/images through DRF?", a: "Use ImageField/FileField in the model and serializer, MultiPartParser (default included), send multipart/form-data from the client (FormData in React), and configure MEDIA_ROOT/MEDIA_URL.", level: "Medium" },
    { q: "Where should business logic live in a DRF project?", a: "Keep views thin. Put validation in serializers and domain logic in model methods or a services module, so it is reusable (admin, management commands, Celery tasks) and easy to unit test.", level: "Hard" },
    { q: "Describe your full stack project in two minutes.", a: "BookNest: React SPA + Django REST API. JWT auth with refresh rotation, staff-only catalogue management, search/filter/pagination with django-filter, nested order creation with transaction.atomic and select_for_update to prevent overselling, Swagger docs via drf-spectacular, throttled login, 11 API tests, deployed with Gunicorn behind Nginx using MySQL. Next steps: Celery for order emails, Redis caching, payments.", level: "Medium" },
  ],
  practice: [
    {
      task: "Practical Test 1 (backend): Add a Wishlist feature — POST /api/v1/books/{slug}/wishlist/ toggles the book in the user's wishlist; GET /api/v1/wishlist/ lists it.",
      hint: "M2M field on a Profile or a Wishlist model (user, book, unique together); @action on BookViewSet; a ListAPIView filtered by request.user.",
      solution: `# catalog/models.py
class WishlistItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wishlist")
    book = models.ForeignKey(Book, on_delete=models.CASCADE)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "book"], name="unique_wish")]

# BookViewSet
@action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
def wishlist(self, request, slug=None, version=None):
    book = self.get_object()
    item, created = WishlistItem.objects.get_or_create(user=request.user, book=book)
    if not created:
        item.delete()
    return Response({"book": book.slug, "in_wishlist": created})

# views.py
class WishlistView(generics.ListAPIView):
    serializer_class = BookListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (Book.objects.filter(wishlistitem__user=self.request.user)
                .select_related("category").annotate(avg_rating=Avg("reviews__rating")))`,
    },
    {
      task: "Practical Test 2 (tests): Write tests for the wishlist toggle (first call adds, second removes) and that anonymous users get 401.",
      hint: "APITestCase, reverse('book-wishlist', kwargs={...}).",
      solution: `class WishlistTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user("asha", password="Asha@12345")
        cat = Category.objects.create(name="Programming", slug="programming")
        Book.objects.create(title="Clean Code", author="R. Martin", category=cat, price=425, stock=1)
        cls.url = reverse("book-wishlist", kwargs={"version": "v1", "slug": "clean-code"})

    def test_anonymous(self):
        self.assertEqual(self.client.post(self.url).status_code, 401)

    def test_toggle(self):
        self.client.force_authenticate(self.user)
        self.assertTrue(self.client.post(self.url).data["in_wishlist"])
        self.assertFalse(self.client.post(self.url).data["in_wishlist"])`,
    },
    {
      task: "Practical Test 3 (admin report): Staff-only GET /api/v1/reports/sales/ returning total revenue, number of orders and top 3 books by quantity sold (excluding cancelled orders).",
      hint: "APIView + IsAdminUser + aggregate/annotate with Sum.",
      solution: `from django.db.models import Count, Sum


class SalesReportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, version=None):
        orders = Order.objects.exclude(status=Order.Status.CANCELLED)
        summary = orders.aggregate(revenue=Sum("total"), orders=Count("id"))
        top = (OrderItem.objects.filter(order__in=orders)
               .values("book__title").annotate(sold=Sum("quantity"))
               .order_by("-sold")[:3])
        return Response({**summary, "top_books": list(top)})`,
    },
    {
      task: "Practical Test 4 (error format): Make every error response look like {\"success\": false, \"errors\": ...}.",
      hint: "Custom EXCEPTION_HANDLER wrapping rest_framework.views.exception_handler.",
      solution: `# config/exceptions.py
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        response.data = {"success": False, "status": response.status_code, "errors": response.data}
    return response

# settings.py
REST_FRAMEWORK["EXCEPTION_HANDLER"] = "config.exceptions.custom_exception_handler"`,
    },
    {
      task: "Practical Test 5 (frontend): Build a React 'My Orders' page that lists orders with status badges and a Cancel button only for PENDING orders.",
      hint: "myOrders() from api/shop.js; POST /v1/orders/{id}/cancel/; update state with the returned order.",
      solution: `export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { myOrders().then((d) => setOrders(d.results)); }, []);

  const cancel = async (id) => {
    const { data } = await api.post("/v1/orders/" + id + "/cancel/");
    setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));
  };

  return (
    <ul>
      {orders.map((o) => (
        <li key={o.id}>
          #{o.id} ₹{o.total} <b>{o.status}</b>
          {o.status === "PENDING" && <button onClick={() => cancel(o.id)}>Cancel</button>}
        </li>
      ))}
    </ul>
  );
}`,
    },
    {
      task: "Practical Test 6 (performance): The book detail endpoint makes 12 queries. Reduce it and prove it with a test.",
      hint: "select_related('category'), prefetch_related('reviews__user'), annotate avg; assertNumQueries.",
      solution: `def get_queryset(self):
    return (Book.objects.select_related("category")
            .prefetch_related("reviews__user")
            .annotate(avg_rating=Avg("reviews__rating")))

def test_detail_query_count(self):
    url = reverse("book-detail", kwargs={"version": "v1", "slug": "clean-code"})
    with self.assertNumQueries(2):     # book+category+avg, then reviews+users
        self.client.get(url)`,
    },
  ],
  quiz: [
    { question: "In BookNest, which tool prevents two orders from buying the last copy at the same time on MySQL?", options: ["select_for_update() inside transaction.atomic", "prefetch_related()", "throttling", "CursorPagination"], answer: 0, explanation: "Row locks inside a transaction serialise concurrent stock updates." },
    { question: "Which APIClient method sends a real Authorization header?", options: ["force_authenticate()", "login_required()", "credentials()", "set_user()"], answer: 2, explanation: "credentials(HTTP_AUTHORIZATION='Bearer ...') sets headers for following requests." },
    { question: "A customer requests another customer's order and gets 404. Why?", options: ["The order was deleted", "get_queryset filters orders by request.user", "Throttling blocked the request", "CORS blocked it"], answer: 1, explanation: "Objects outside the user's queryset are simply not found." },
    { question: "Which command checks common production security settings?", options: ["python manage.py runserver --prod", "python manage.py migrate --check", "python manage.py test --deploy", "python manage.py check --deploy"], answer: 3, explanation: "check --deploy reports missing HTTPS, cookie and DEBUG settings." },
    { question: "Where should the order total be calculated?", options: ["In React before sending", "On the server inside the serializer/service", "In the database trigger only", "It should be sent by the client and trusted"], answer: 1, explanation: "Never trust client-calculated prices; compute from database prices on the server." },
  ],
};
