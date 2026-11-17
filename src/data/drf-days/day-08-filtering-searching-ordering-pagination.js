export default {
  id: "day-08-filtering-searching-ordering-pagination",
  title: "Filtering, Searching, Ordering, Pagination",
  module: "Module 2: Auth & Advanced",
  day: 8,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Let clients ask for exactly the data they need. Add exact and range filters with django-filter, keyword search with SearchFilter, sorting with OrderingFilter, and split large results with PageNumber, LimitOffset and Cursor pagination.",
  objectives: [
    "Filter querysets manually with query_params and with django-filter's DjangoFilterBackend",
    "Write a FilterSet with lookup expressions (gte, lte, icontains) and custom filter methods",
    "Add SearchFilter (search_fields with ^ = @ prefixes) and OrderingFilter (ordering_fields)",
    "Configure PageNumberPagination, LimitOffsetPagination and CursorPagination globally and per view",
    "Read paginated responses (count, next, previous, results) from the client side",
  ],
  theory: [
    {
      heading: "Why Filter, Search, Order and Paginate?",
      content: "Imagine an online bookshop with 50,000 books. Returning all of them in one response would be slow for the server, the network and the phone. Clients usually want a slice: 'Python books under 500 rupees, newest first, 10 per page'. DRF gives this through filter backends and pagination classes that read query parameters. Think of a library catalogue computer: filter by category (filter), type a keyword (search), sort by year (ordering), and see 10 results per screen (pagination).",
      syntax: `GET /api/books/?category=programming&price__lte=500     # filtering
GET /api/books/?search=django                            # searching
GET /api/books/?ordering=-price,title                    # ordering
GET /api/books/?page=2&page_size=10                      # pagination
GET /api/books/?search=python&ordering=-created_at&page=1  # all together`,
    },
    {
      heading: "django-filter and DjangoFilterBackend",
      content: "django-filter is a separate package that builds filters from model fields. Install it, add 'django_filters' to INSTALLED_APPS and add DjangoFilterBackend to filter_backends. The quick way is filterset_fields = ['category', 'in_stock'] (exact matches). For ranges and partial matches, write a FilterSet class with explicit filters and lookup_expr.",
      syntax: `pip install django-filter

import django_filters

class BookFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    title = django_filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = Book
        fields = ["category", "in_stock"]   # exact filters
        # or fields = {"price": ["lt", "gt"], "published": ["year__gte"]}`,
      points: [
        "Invalid filter values return 400 with field errors",
        "Unknown query params are ignored, not errors",
        "Filter on related fields: field_name='author__name'",
        "Custom logic: django_filters.CharFilter(method='filter_xyz')",
      ],
    },
    {
      heading: "SearchFilter and OrderingFilter",
      content: "SearchFilter (built into DRF) does a simple keyword search over search_fields using icontains, across multiple fields with OR, and splits multiple words with AND. Prefixes change the lookup: '^' starts-with, '=' exact, '@' full-text (PostgreSQL), '$' regex. OrderingFilter lets the client sort by ?ordering=field or -field (descending); always whitelist ordering_fields so clients cannot sort on sensitive or unindexed columns. Set ordering on the view for the default order.",
      syntax: `from rest_framework import filters

class BookViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "^author__name", "=isbn"]
    ordering_fields = ["price", "title", "created_at"]
    ordering = ["-created_at"]          # default`,
    },
    {
      heading: "Pagination Styles",
      content: "Pagination splits results into pages and wraps the response with metadata. Set it globally with DEFAULT_PAGINATION_CLASS and PAGE_SIZE, or per view with pagination_class. Pagination applies to list actions only.",
      points: [
        "PageNumberPagination: ?page=3 — familiar for page numbers in UIs; returns count, next, previous, results",
        "LimitOffsetPagination: ?limit=20&offset=40 — like SQL LIMIT/OFFSET; flexible for tables",
        "CursorPagination: ?cursor=cD0yMDI2... — opaque cursor; stable and fast for infinite scroll and huge tables; requires a fixed unique ordering; no total count",
        "Customise: subclass and set page_size, page_size_query_param, max_page_size",
        "Large OFFSET values are slow in SQL — cursor pagination avoids this",
      ],
      syntax: `REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
}`,
    },
    {
      heading: "Order of Operations and Common Mistakes",
      content: "In a generic list view the flow is: get_queryset() -> filter_queryset() (all backends in order) -> paginate_queryset() -> serializer -> get_paginated_response(). So filters work on your already-restricted queryset (e.g. only the user's orders), and pagination counts AFTER filtering.",
      points: [
        "Forgetting 'django_filters' in INSTALLED_APPS: the filter form in the browsable API breaks",
        "Setting filter_backends on the view REPLACES the defaults — list all you need",
        "Paginating an unordered queryset gives UnorderedObjectListWarning and inconsistent pages",
        "Pagination in an @action: call self.paginate_queryset() and self.get_paginated_response() yourself",
        "Not setting max_page_size lets clients request ?page_size=100000",
      ],
    },
  ],
  examples: [
    {
      title: "django-filter: Exact, Range and Custom Filters",
      scenario: "The bookshop frontend needs filters for category, stock, price range, publication year and 'has discount'.",
      steps: [
        "pip install django-filter and add 'django_filters' to INSTALLED_APPS",
        "Add a Category model and category FK + published date to Book, then migrate",
        "Create books/filters.py with BookFilter",
        "Attach it to BookViewSet with filterset_class",
        "Open /api/books/ in the browser — a Filters button appears",
      ],
      code: `pip install django-filter      # django-filter==24.3

# config/settings.py
INSTALLED_APPS += ["django_filters"]

# books/models.py (add)
class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    def __str__(self):
        return self.name

class Book(models.Model):
    ...
    category = models.ForeignKey(Category, null=True, on_delete=models.SET_NULL, related_name="books")
    published = models.DateField(null=True, blank=True)


# books/filters.py
import django_filters
from .models import Book


class BookFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    category = django_filters.CharFilter(field_name="category__name", lookup_expr="iexact")
    year = django_filters.NumberFilter(field_name="published", lookup_expr="year")
    has_discount = django_filters.BooleanFilter(method="filter_has_discount")

    class Meta:
        model = Book
        fields = ["in_stock", "author"]

    def filter_has_discount(self, queryset, name, value):
        if value:
            return queryset.filter(discount_price__isnull=False)
        return queryset.filter(discount_price__isnull=True)


# books/views.py
from django_filters.rest_framework import DjangoFilterBackend
from .filters import BookFilter


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.select_related("category").order_by("id")
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = BookFilter

# curl
curl "http://127.0.0.1:8000/api/books/?category=programming&min_price=400&max_price=900"
curl "http://127.0.0.1:8000/api/books/?has_discount=true"
curl "http://127.0.0.1:8000/api/books/?min_price=abc"`,
      result: `GET /api/books/?category=programming&min_price=400&max_price=900 -> 200 OK
[
  {"id": 1, "title": "Clean Code", "price": "425.00", "category": 1, ...},
  {"id": 6, "title": "Python Crash Course", "price": "599.00", "category": 1, ...}
]

GET /api/books/?has_discount=true -> 200 OK
[{"id": 2, "title": "Fluent Python 2E", "price": "950.00", "discount_price": "799.00", ...}]

GET /api/books/?min_price=abc -> 400 Bad Request
{"min_price": ["Enter a number."]}`,
      explanation: "Each filter maps a query param to an ORM lookup: min_price -> price__gte. category__name lets clients filter by name instead of id. method= gives full control for custom rules. Invalid values produce validation errors automatically.",
    },
    {
      title: "SearchFilter + OrderingFilter",
      scenario: "Add a search box (title, author, ISBN exact) and sortable columns (price, title, newest) to the books list.",
      steps: [
        "Add filters.SearchFilter and filters.OrderingFilter to filter_backends",
        "Set search_fields, ordering_fields and default ordering",
        "Test combinations in Postman's Params tab",
      ],
      code: `# books/views.py
from rest_framework import filters


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.select_related("category")
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BookFilter
    search_fields = ["title", "author", "=isbn", "category__name"]
    ordering_fields = ["price", "title", "created_at"]
    ordering = ["-created_at"]

# curl
curl "http://127.0.0.1:8000/api/books/?search=python"
curl "http://127.0.0.1:8000/api/books/?search=martin code"
curl "http://127.0.0.1:8000/api/books/?search=9780132350884"
curl "http://127.0.0.1:8000/api/books/?ordering=-price"
curl "http://127.0.0.1:8000/api/books/?search=python&ordering=price&max_price=1000"`,
      result: `?search=python             -> Fluent Python 2E, Python Crash Course
?search=martin code        -> Clean Code   (both words must match, in any search field)
?search=9780132350884      -> Clean Code   (=isbn exact match)
?ordering=-price           -> Fluent Python 2E (950), Refactoring (700), Python Crash Course (599), Atomic Habits (500), Clean Code (425)
?search=python&ordering=price&max_price=1000
[
  {"id": 6, "title": "Python Crash Course", "price": "599.00", ...},
  {"id": 2, "title": "Fluent Python 2E", "price": "950.00", ...}
]`,
      explanation: "SearchFilter splits the search term by spaces; each word must match at least one field (AND between words, OR between fields). ordering_fields whitelist prevents ?ordering=created_by__password style abuse. All backends chain together on the same queryset.",
    },
    {
      title: "PageNumber, LimitOffset and Cursor Pagination",
      scenario: "Use page numbers for the web catalogue, limit/offset for an admin table, and cursor pagination for a mobile infinite-scroll review feed.",
      steps: [
        "Create books/pagination.py with three custom classes",
        "Set the default pagination in settings.py",
        "Override pagination_class per ViewSet",
        "Test each with curl and inspect next/previous links",
      ],
      code: `# books/pagination.py
from rest_framework.pagination import (CursorPagination, LimitOffsetPagination,
                                       PageNumberPagination)


class StandardPagination(PageNumberPagination):
    page_size = 2
    page_size_query_param = "page_size"
    max_page_size = 50


class AdminTablePagination(LimitOffsetPagination):
    default_limit = 20
    max_limit = 100


class FeedCursorPagination(CursorPagination):
    page_size = 3
    ordering = "-created_at"          # must be unique-ish and unchanging


# config/settings.py
REST_FRAMEWORK = {
    ...
    "DEFAULT_PAGINATION_CLASS": "books.pagination.StandardPagination",
    "PAGE_SIZE": 2,
}

# books/views.py
class BookViewSet(viewsets.ModelViewSet):
    ...                                   # uses StandardPagination by default

class ReviewViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    pagination_class = FeedCursorPagination

# Pagination inside a custom @action
@action(detail=False)
def expensive(self, request):
    qs = self.filter_queryset(self.get_queryset()).filter(price__gt=500)
    page = self.paginate_queryset(qs)
    serializer = self.get_serializer(page, many=True)
    return self.get_paginated_response(serializer.data)

# curl
curl "http://127.0.0.1:8000/api/books/?page=2"
curl "http://127.0.0.1:8000/api/books/?page=99"
curl "http://127.0.0.1:8000/api/reviews/"`,
      result: `GET /api/books/?page=2 -> 200 OK
{
    "count": 5,
    "next": "http://127.0.0.1:8000/api/books/?page=3",
    "previous": "http://127.0.0.1:8000/api/books/",
    "results": [
        {"id": 4, "title": "Atomic Habits", ...},
        {"id": 2, "title": "Fluent Python 2E", ...}
    ]
}

GET /api/books/?page=99 -> 404 Not Found
{"detail": "Invalid page."}

GET /api/reviews/ (cursor) -> 200 OK
{
    "next": "http://127.0.0.1:8000/api/reviews/?cursor=cD0yMDI2LTExLTE3KzEwJTNBMDAlM0EwMA%3D%3D",
    "previous": null,
    "results": [ {...}, {...}, {...} ]
}`,
      explanation: "PageNumber gives count for 'Page 2 of 3' UIs. Notice previous for page 2 has no ?page=1 — DRF removes it because page 1 is the default. Cursor pagination has no count and an opaque cursor, but stays correct when new rows are inserted while scrolling. Asking for a page that does not exist returns 404.",
    },
    {
      title: "Pure Python Demo: Filter, Search, Order and Paginate a List",
      scenario: "Simulate the whole list pipeline (filter_queryset then paginate_queryset) on an in-memory list to see how query params shape the response.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `import math

BOOKS = [
    {"id": 1, "title": "Clean Code", "author": "Robert Martin", "price": 425, "cat": "programming"},
    {"id": 2, "title": "Fluent Python", "author": "Luciano Ramalho", "price": 950, "cat": "programming"},
    {"id": 3, "title": "Atomic Habits", "author": "James Clear", "price": 500, "cat": "self-help"},
    {"id": 4, "title": "Python Crash Course", "author": "Eric Matthes", "price": 599, "cat": "programming"},
    {"id": 5, "title": "Refactoring", "author": "Martin Fowler", "price": 700, "cat": "programming"},
]


def list_books(params, page_size=2):
    rows = BOOKS
    if "cat" in params:
        rows = [b for b in rows if b["cat"] == params["cat"]]
    if "max_price" in params:
        rows = [b for b in rows if b["price"] <= int(params["max_price"])]
    if "search" in params:
        for word in params["search"].lower().split():
            rows = [b for b in rows if word in b["title"].lower() or word in b["author"].lower()]
    if "ordering" in params:
        key = params["ordering"].lstrip("-")
        rows = sorted(rows, key=lambda b: b[key], reverse=params["ordering"].startswith("-"))
    page = int(params.get("page", 1))
    pages = max(1, math.ceil(len(rows) / page_size))
    if page > pages:
        return {"detail": "Invalid page."}
    start = (page - 1) * page_size
    return {
        "count": len(rows),
        "next": page + 1 if page < pages else None,
        "previous": page - 1 if page > 1 else None,
        "results": [b["title"] for b in rows[start:start + page_size]],
    }


print(list_books({"cat": "programming", "ordering": "-price"}))
print(list_books({"cat": "programming", "ordering": "-price", "page": "2"}))
print(list_books({"search": "martin", "ordering": "title"}))
print(list_books({"max_price": "600", "page": "5"}))`,
      python: {
        files: {
          "main.py": `import math

BOOKS = [
    {"id": 1, "title": "Clean Code", "author": "Robert Martin", "price": 425, "cat": "programming"},
    {"id": 2, "title": "Fluent Python", "author": "Luciano Ramalho", "price": 950, "cat": "programming"},
    {"id": 3, "title": "Atomic Habits", "author": "James Clear", "price": 500, "cat": "self-help"},
    {"id": 4, "title": "Python Crash Course", "author": "Eric Matthes", "price": 599, "cat": "programming"},
    {"id": 5, "title": "Refactoring", "author": "Martin Fowler", "price": 700, "cat": "programming"},
]


def list_books(params, page_size=2):
    rows = BOOKS
    if "cat" in params:
        rows = [b for b in rows if b["cat"] == params["cat"]]
    if "max_price" in params:
        rows = [b for b in rows if b["price"] <= int(params["max_price"])]
    if "search" in params:
        for word in params["search"].lower().split():
            rows = [b for b in rows if word in b["title"].lower() or word in b["author"].lower()]
    if "ordering" in params:
        key = params["ordering"].lstrip("-")
        rows = sorted(rows, key=lambda b: b[key], reverse=params["ordering"].startswith("-"))
    page = int(params.get("page", 1))
    pages = max(1, math.ceil(len(rows) / page_size))
    if page > pages:
        return {"detail": "Invalid page."}
    start = (page - 1) * page_size
    return {
        "count": len(rows),
        "next": page + 1 if page < pages else None,
        "previous": page - 1 if page > 1 else None,
        "results": [b["title"] for b in rows[start:start + page_size]],
    }


print(list_books({"cat": "programming", "ordering": "-price"}))
print(list_books({"cat": "programming", "ordering": "-price", "page": "2"}))
print(list_books({"search": "martin", "ordering": "title"}))
print(list_books({"max_price": "600", "page": "5"}))
`,
        },
      },
      result: `{'count': 4, 'next': 2, 'previous': None, 'results': ['Fluent Python', 'Refactoring']}
{'count': 4, 'next': None, 'previous': 1, 'results': ['Python Crash Course', 'Clean Code']}
{'count': 2, 'next': None, 'previous': None, 'results': ['Clean Code', 'Refactoring']}
{'detail': 'Invalid page.'}`,
      explanation: "Filtering happens first, then ordering, then the page slice — the same order DRF uses. count is the number of rows AFTER filtering. Asking for a page beyond the last returns an error just like DRF's 404 Invalid page.",
    },
  ],
  interview: [
    { q: "What is the difference between filtering and searching in DRF?", a: "Filtering (django-filter) matches specific fields with specific lookups (?category=x&price__lte=500). Searching (SearchFilter) takes one free-text term and matches it against several fields with icontains.", level: "Easy" },
    { q: "How do you enable django-filter in a view?", a: "Install django-filter, add 'django_filters' to INSTALLED_APPS, set filter_backends = [DjangoFilterBackend] (or globally) and define filterset_fields or filterset_class.", level: "Easy" },
    { q: "What do the prefixes ^, = and @ mean in search_fields?", a: "^ istartswith, = iexact, @ full-text search (PostgreSQL only), $ regex. No prefix means icontains.", level: "Medium" },
    { q: "Why should you set ordering_fields?", a: "To whitelist sortable fields. Without it, clients may sort by any serializer field, potentially exposing information via ordering or causing slow queries on unindexed columns.", level: "Medium" },
    { q: "Compare PageNumberPagination, LimitOffsetPagination and CursorPagination.", a: "PageNumber uses ?page=n and returns count. LimitOffset uses ?limit&offset and is flexible. Cursor uses an opaque cursor with fixed ordering, has no count, stays consistent when data changes and is efficient for very large datasets.", level: "Medium" },
    { q: "Why is OFFSET pagination slow on big tables?", a: "The database still scans and discards all the offset rows before returning the page; OFFSET 1,000,000 reads a million rows. Cursor (keyset) pagination uses WHERE created_at < x, which can use an index.", level: "Hard" },
    { q: "What does a paginated response contain?", a: "For PageNumber and LimitOffset: count, next, previous and results. Cursor pagination returns next, previous and results only.", level: "Easy" },
    { q: "How do you allow the client to choose page size?", a: "Subclass PageNumberPagination and set page_size_query_param = 'page_size' and max_page_size to cap it.", level: "Easy" },
    { q: "How do you paginate inside a custom @action?", a: "Call page = self.paginate_queryset(qs), serialize page, then return self.get_paginated_response(serializer.data). Handle page is None if pagination is disabled.", level: "Medium" },
    { q: "What happens if you set filter_backends on a view?", a: "It replaces DEFAULT_FILTER_BACKENDS for that view; include every backend you need.", level: "Medium" },
    { q: "Why might you see UnorderedObjectListWarning?", a: "Pagination of an unordered QuerySet; pages may overlap or skip rows. Add order_by() or an ordering attribute.", level: "Medium" },
  ],
  practice: [
    {
      task: "Allow filtering students by ?city=pune and ?min_age=18 and searching by name or email.",
      hint: "FilterSet with NumberFilter(lookup_expr='gte') + SearchFilter.",
      solution: `class StudentFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(lookup_expr="iexact")
    min_age = django_filters.NumberFilter(field_name="age", lookup_expr="gte")

    class Meta:
        model = Student
        fields = []


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by("id")
    serializer_class = StudentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = StudentFilter
    search_fields = ["name", "email"]`,
    },
    {
      task: "Add a date range filter ?date_from=2026-01-01&date_to=2026-06-30 on Order.created_at.",
      hint: "Two DateFilters with field_name='created_at__date' and lookup_expr gte / lte.",
      solution: `class OrderFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name="created_at__date", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="created_at__date", lookup_expr="lte")

    class Meta:
        model = Order
        fields = ["status"]

# GET /api/orders/?date_from=2026-01-01&date_to=2026-06-30`,
    },
    {
      task: "Create a pagination class with 5 items per page and add total_pages to the response.",
      hint: "Override get_paginated_response.",
      solution: `class TotalPagesPagination(PageNumberPagination):
    page_size = 5

    def get_paginated_response(self, data):
        return Response({
            "count": self.page.paginator.count,
            "total_pages": self.page.paginator.num_pages,
            "current_page": self.page.number,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        })`,
    },
    {
      task: "Disable pagination for a Category list (small fixed data) while keeping it globally enabled.",
      hint: "pagination_class = None.",
      solution: `class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None`,
    },
  ],
  quiz: [
    { question: "Which query string sorts books by price descending with OrderingFilter?", options: ["?sort=price desc", "?ordering=-price", "?order_by=price&desc=1", "?ordering=price-"], answer: 1, explanation: "A leading minus means descending." },
    { question: "Which pagination class does NOT return count?", options: ["PageNumberPagination", "LimitOffsetPagination", "CursorPagination", "All return count"], answer: 2, explanation: "Cursor pagination avoids COUNT(*) for performance." },
    { question: "In search_fields, '^title' means:", options: ["title starts with term", "exact match", "full-text search", "regex"], answer: 0, explanation: "^ uses istartswith." },
    { question: "Package that provides DjangoFilterBackend:", options: ["djangorestframework", "drf-spectacular", "django-cors-headers", "django-filter"], answer: 3, explanation: "Install django-filter and import from django_filters.rest_framework." },
    { question: "Requesting ?page=99 beyond the last page returns:", options: ["200 with empty results", "404 Invalid page", "400 Bad Request", "the last page"], answer: 1, explanation: "PageNumberPagination raises NotFound('Invalid page.')." },
  ],
};
