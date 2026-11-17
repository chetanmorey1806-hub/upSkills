export default {
  id: "day-04-apiview-generic-views-mixins",
  title: "Class-based APIView, Generic Views and Mixins",
  module: "Module 1: DRF Basics",
  day: 4,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Move from function views to class-based views. Write CRUD with APIView, then see how GenericAPIView plus mixins remove repetition, and finally use the concrete generic views (ListCreateAPIView, RetrieveUpdateDestroyAPIView) that do CRUD in three lines.",
  objectives: [
    "Write CRUD endpoints with APIView using get/post/put/patch/delete methods",
    "Explain GenericAPIView attributes: queryset, serializer_class, lookup_field, get_queryset(), get_serializer()",
    "Combine mixins (ListModelMixin, CreateModelMixin, ...) with GenericAPIView",
    "Use concrete generic views and customise them with perform_create and get_queryset",
    "Choose between function views, APIView and generic views",
  ],
  theory: [
    {
      heading: "APIView: Class-Based DRF Views",
      content: "APIView is the base class for all DRF class-based views (@api_view also creates one under the hood). Instead of if request.method == 'GET', you write one method per HTTP verb: get(), post(), put(), patch(), delete(). DRF calls the right method automatically. Class attributes like permission_classes and authentication_classes configure the view. It is like moving from one big switch-board operator (function view) to separate desks for each type of request.",
      syntax: `from rest_framework.views import APIView

class BookList(APIView):
    def get(self, request):
        ...
    def post(self, request):
        ...

# urls.py
path("books/", BookList.as_view())`,
      points: [
        "Methods not defined -> 405 automatically",
        "Supports inheritance: put common code in a base class",
        "Still fully manual: you write querying and serializer code yourself",
      ],
    },
    {
      heading: "GenericAPIView: Common Behaviour as Attributes",
      content: "GenericAPIView extends APIView with the patterns every CRUD view repeats. You set queryset and serializer_class once, and helper methods use them. lookup_field (default 'pk') decides which URL kwarg finds the object.",
      points: [
        "queryset / get_queryset(): which rows this view works on (override get_queryset for per-user data)",
        "serializer_class / get_serializer_class(): which serializer to use",
        "get_object(): fetches one object using lookup_field, returns 404 if missing, checks object permissions",
        "get_serializer(*args, **kwargs): creates the serializer and passes context (request, view)",
        "filter_queryset(), paginate_queryset(): plug in filters and pagination (Day 8)",
        "lookup_field = 'slug' to use /books/<slug:slug>/ instead of pk",
      ],
      tip: "Always use get_queryset() rather than self.queryset inside methods: DRF caches the class attribute queryset, and get_queryset() ensures a fresh query per request.",
    },
    {
      heading: "Mixins: Lego Blocks of CRUD",
      content: "Mixins are small classes that each provide one action. Mix them with GenericAPIView and connect HTTP methods to actions.",
      syntax: `ListModelMixin      -> .list(request)      GET    collection  200
CreateModelMixin    -> .create(request)    POST   collection  201
RetrieveModelMixin  -> .retrieve(request)  GET    single      200
UpdateModelMixin    -> .update(request)    PUT    single      200
                    -> .partial_update()   PATCH  single      200
DestroyModelMixin   -> .destroy(request)   DELETE single      204

Hooks you can override:
perform_create(self, serializer)   -> serializer.save()
perform_update(self, serializer)   -> serializer.save()
perform_destroy(self, instance)    -> instance.delete()`,
    },
    {
      heading: "Concrete Generic Views",
      content: "DRF already combined the mixins for you. These are the classes you will use most in real projects.",
      points: [
        "ListAPIView (GET list), CreateAPIView (POST), RetrieveAPIView (GET one)",
        "UpdateAPIView (PUT/PATCH), DestroyAPIView (DELETE)",
        "ListCreateAPIView (GET list + POST)",
        "RetrieveUpdateAPIView, RetrieveDestroyAPIView",
        "RetrieveUpdateDestroyAPIView (GET + PUT + PATCH + DELETE on one object)",
      ],
      tip: "Two classes (ListCreateAPIView + RetrieveUpdateDestroyAPIView) replace about 40 lines of function-view code from Day 3.",
    },
    {
      heading: "Which View Style Should I Use?",
      content: "There is no single right answer, but there is a practical rule. The higher the abstraction, the less code — and the less visible the logic. Freshers should understand all levels because interviewers ask how generic views work internally.",
      points: [
        "@api_view: tiny or non-CRUD endpoints (health check, stats, custom actions)",
        "APIView: custom logic that does not fit CRUD (file export, multi-model operations)",
        "Generic views: standard CRUD on one model with small customisations",
        "ViewSets + Routers (Day 5): full CRUD resources with auto-generated URLs",
      ],
    },
  ],
  examples: [
    {
      title: "CRUD with APIView",
      scenario: "Rewrite Day 3's book_list/book_detail as two APIView classes.",
      steps: [
        "Open books/views.py in VS Code / PyCharm",
        "Write BookListAPIView and BookDetailAPIView",
        "Update books/urls.py to use .as_view()",
        "Run python manage.py runserver and test in Postman",
      ],
      code: `# books/views.py
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Book
from .serializers import BookSerializer


class BookListAPIView(APIView):
    def get(self, request):
        books = Book.objects.all().order_by("id")
        return Response(BookSerializer(books, many=True).data)

    def post(self, request):
        serializer = BookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BookDetailAPIView(APIView):
    def get_object(self, pk):
        return get_object_or_404(Book, pk=pk)

    def get(self, request, pk):
        return Response(BookSerializer(self.get_object(pk)).data)

    def put(self, request, pk):
        serializer = BookSerializer(self.get_object(pk), data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        serializer = BookSerializer(self.get_object(pk), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        self.get_object(pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# books/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("v1/books/", views.BookListAPIView.as_view(), name="v1-book-list"),
    path("v1/books/<int:pk>/", views.BookDetailAPIView.as_view(), name="v1-book-detail"),
]

# curl
curl -X PUT http://127.0.0.1:8000/api/v1/books/2/ -H "Content-Type: application/json" \\
  -d '{"title":"Fluent Python 2e","author":"Luciano Ramalho","isbn":"9781492056355","price":"950"}'`,
      result: `PUT /api/v1/books/2/ -> 200 OK
{
    "id": 2,
    "title": "Fluent Python 2E",
    "author": "Luciano Ramalho",
    "isbn": "9781492056355",
    "price": "950.00",
    "discount_price": null,
    "in_stock": true,
    "is_expensive": true,
    "created_at": "2026-11-17T10:15:22.418Z"
}`,
      explanation: "Each HTTP method has its own method — cleaner than if/elif. Notice 'Fluent Python 2E': our validate_title from Day 2 applies .title(). PUT requires all required fields; leaving out isbn would give 400. The UniqueValidator automatically excludes the current instance on update.",
    },
    {
      title: "GenericAPIView + Mixins",
      scenario: "See what generic views do internally by building them from mixins.",
      steps: [
        "Add the two mixin-based classes to books/views.py",
        "Map them under v2/ in books/urls.py",
        "Test GET, POST, PATCH, DELETE in Postman",
      ],
      code: `# books/views.py
from rest_framework import generics, mixins


class BookListMixinView(mixins.ListModelMixin,
                        mixins.CreateModelMixin,
                        generics.GenericAPIView):
    queryset = Book.objects.all().order_by("id")
    serializer_class = BookSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class BookDetailMixinView(mixins.RetrieveModelMixin,
                          mixins.UpdateModelMixin,
                          mixins.DestroyModelMixin,
                          generics.GenericAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


# books/urls.py
path("v2/books/", views.BookListMixinView.as_view()),
path("v2/books/<int:pk>/", views.BookDetailMixinView.as_view()),

# curl
curl -X POST http://127.0.0.1:8000/api/v2/books/ -H "Content-Type: application/json" \\
  -d '{"title":"Two Scoops of Django","author":"Greenfeld","isbn":"9780692915721","price":"650"}'
curl -i -X DELETE http://127.0.0.1:8000/api/v2/books/3/`,
      result: `POST /api/v2/books/ -> 201 Created
{"id": 3, "title": "Two Scoops Of Django", "author": "Greenfeld", "isbn": "9780692915721",
 "price": "650.00", "discount_price": null, "in_stock": true, "is_expensive": true,
 "created_at": "2026-11-17T11:02:10.003Z"}

DELETE /api/v2/books/3/ -> 204 No Content`,
      explanation: "CreateModelMixin.create() does exactly what we wrote by hand: get_serializer(data=...), is_valid(raise_exception=True), perform_create(), return 201. The URL kwarg must be named pk because lookup_field defaults to 'pk'.",
    },
    {
      title: "Concrete Generic Views with Customisation",
      scenario: "Final version: three lines of CRUD, plus filtering by ?in_stock=true, saving the creator from request.user, a slug lookup, and blocking deletion of in-stock books.",
      steps: [
        "Add created_by (ForeignKey to User, null=True) and slug (SlugField unique) to Book, then makemigrations and migrate",
        "Write the generic views below",
        "Map URLs; use <slug:slug> for the detail URL",
        "Log in through the browsable API (add path('api-auth/', include('rest_framework.urls')) to config/urls.py) and POST a book",
      ],
      code: `# books/models.py (add)
from django.conf import settings
from django.utils.text import slugify

class Book(models.Model):
    ...
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                   on_delete=models.SET_NULL, related_name="books")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


# books/serializers.py  (add to Meta.fields: "slug", "created_by")
class BookSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source="created_by.username")
    ...
    class Meta:
        model = Book
        fields = ["id", "slug", "title", "author", "isbn", "price", "discount_price",
                  "in_stock", "is_expensive", "created_by", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]


# books/views.py
from rest_framework import generics
from rest_framework.exceptions import ValidationError


class BookListCreateView(generics.ListCreateAPIView):
    serializer_class = BookSerializer

    def get_queryset(self):
        qs = Book.objects.select_related("created_by").order_by("-created_at")
        in_stock = self.request.query_params.get("in_stock")
        if in_stock in ("true", "false"):
            qs = qs.filter(in_stock=(in_stock == "true"))
        return qs

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(created_by=user)


class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    lookup_field = "slug"

    def perform_destroy(self, instance):
        if instance.in_stock:
            raise ValidationError({"detail": "Cannot delete a book that is in stock."})
        instance.delete()


# books/urls.py
urlpatterns = [
    path("v3/books/", views.BookListCreateView.as_view(), name="book-list-v3"),
    path("v3/books/<slug:slug>/", views.BookDetailView.as_view(), name="book-detail-v3"),
]

# config/urls.py
path("api-auth/", include("rest_framework.urls")),   # adds Log in link to browsable API

# curl
curl "http://127.0.0.1:8000/api/v3/books/?in_stock=true"
curl http://127.0.0.1:8000/api/v3/books/clean-code/
curl -X DELETE http://127.0.0.1:8000/api/v3/books/clean-code/`,
      result: `GET /api/v3/books/?in_stock=true -> 200 OK
[
  {"id": 4, "slug": "atomic-habits", "title": "Atomic Habits", ..., "created_by": "admin", ...},
  {"id": 1, "slug": "clean-code", "title": "Clean Code", ..., "created_by": null, ...}
]

GET /api/v3/books/clean-code/ -> 200 OK
{"id": 1, "slug": "clean-code", "title": "Clean Code", "price": "425.00", ...}

DELETE /api/v3/books/clean-code/ -> 400 Bad Request
{"detail": "Cannot delete a book that is in stock."}`,
      explanation: "perform_create is the right hook to inject data that does not come from the client (the logged-in user). get_queryset allows per-request filtering. lookup_field='slug' must match the URL kwarg name. ReadOnlyField with source shows the username instead of the user id. select_related avoids an extra query per book for created_by.",
    },
    {
      title: "Pure Python Demo: How Mixins Compose Behaviour",
      scenario: "Understand multiple inheritance and the MRO that makes DRF mixins work, using only plain Python classes.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `class GenericView:
    queryset = []

    def get_queryset(self):
        return list(self.queryset)

    def dispatch(self, method, **kw):
        handler = getattr(self, method.lower(), None)
        if handler is None:
            return 405, "Method not allowed"
        return handler(**kw)


class ListMixin:
    def list(self):
        return 200, self.get_queryset()


class CreateMixin:
    def create(self, data):
        self.perform_create(data)
        return 201, data

    def perform_create(self, data):
        self.queryset.append(data)


class BookListCreate(ListMixin, CreateMixin, GenericView):
    queryset = ["Clean Code"]

    def get(self):
        return self.list()

    def post(self, data):
        return self.create(data)

    def perform_create(self, data):          # hook override
        super().perform_create(data.upper())


view = BookListCreate()
print(view.dispatch("GET"))
print(view.dispatch("POST", data="fluent python"))
print(view.dispatch("GET"))
print(view.dispatch("DELETE"))
print([c.__name__ for c in BookListCreate.__mro__])`,
      python: {
        files: {
          "main.py": `class GenericView:
    queryset = []

    def get_queryset(self):
        return list(self.queryset)

    def dispatch(self, method, **kw):
        handler = getattr(self, method.lower(), None)
        if handler is None:
            return 405, "Method not allowed"
        return handler(**kw)


class ListMixin:
    def list(self):
        return 200, self.get_queryset()


class CreateMixin:
    def create(self, data):
        self.perform_create(data)
        return 201, data

    def perform_create(self, data):
        self.queryset.append(data)


class BookListCreate(ListMixin, CreateMixin, GenericView):
    queryset = ["Clean Code"]

    def get(self):
        return self.list()

    def post(self, data):
        return self.create(data)

    def perform_create(self, data):          # hook override
        super().perform_create(data.upper())


view = BookListCreate()
print(view.dispatch("GET"))
print(view.dispatch("POST", data="fluent python"))
print(view.dispatch("GET"))
print(view.dispatch("DELETE"))
print([c.__name__ for c in BookListCreate.__mro__])
`,
        },
      },
      result: `(200, ['Clean Code'])
(201, 'fluent python')
(200, ['Clean Code', 'FLUENT PYTHON'])
(405, 'Method not allowed')
['BookListCreate', 'ListMixin', 'CreateMixin', 'GenericView', 'object']`,
      explanation: "dispatch() finds a method by the HTTP verb name (like APIView.dispatch). Mixins provide list/create, the base provides get_queryset, and overriding the perform_create hook changes behaviour without rewriting create(). The MRO shows the lookup order — mixins must come BEFORE GenericAPIView in the class definition.",
    },
  ],
  interview: [
    { q: "Difference between APIView and GenericAPIView?", a: "APIView gives request handling, auth, permissions and method dispatch but no model helpers. GenericAPIView adds queryset, serializer_class, get_object(), get_serializer(), lookup_field, filtering and pagination support.", level: "Medium" },
    { q: "What is a mixin in DRF?", a: "A small class that provides one reusable action (list, create, retrieve, update, destroy). Combined with GenericAPIView via multiple inheritance to build views.", level: "Easy" },
    { q: "Name the concrete generic view for GET + PUT + PATCH + DELETE on a single object.", a: "RetrieveUpdateDestroyAPIView.", level: "Easy" },
    { q: "Why override get_queryset() instead of setting queryset?", a: "To make the query depend on the request: the current user, query params or URL kwargs. Also queryset class attributes are evaluated once and cached, get_queryset() runs per request.", level: "Medium" },
    { q: "What is perform_create used for?", a: "A hook called by CreateModelMixin after validation; override it to pass extra data to save(), e.g. serializer.save(owner=self.request.user), or to trigger side effects like sending an email.", level: "Medium" },
    { q: "What does get_object() do?", a: "Filters get_queryset() by the lookup_field value from the URL, returns 404 if not found, and calls check_object_permissions() so object-level permissions are enforced.", level: "Hard" },
    { q: "How do you use a slug instead of id in detail URLs?", a: "Set lookup_field = 'slug' in the view and use <slug:slug> in the URL pattern. Optionally set lookup_url_kwarg if the URL name differs.", level: "Easy" },
    { q: "Why must mixins come before GenericAPIView in the base class list?", a: "Because of Python's MRO: classes are searched left to right, so mixin methods are found before the base class. Placing GenericAPIView first can hide mixin behaviour.", level: "Hard" },
    { q: "What is the difference between update() and partial_update() in UpdateModelMixin?", a: "update() handles PUT and requires all required fields. partial_update() handles PATCH and calls update() with partial=True.", level: "Medium" },
    { q: "When would you still use plain APIView?", a: "When the endpoint is not a simple CRUD on one model: aggregated dashboards, file exports, triggering a job, combining multiple models.", level: "Medium" },
    { q: "How does a class-based view know which method to call?", a: "as_view() returns a function; on each request dispatch() lowercases request.method and calls the matching handler (get, post...). If missing, http_method_not_allowed returns 405.", level: "Medium" },
  ],
  practice: [
    {
      task: "Create a read-only API for Authors: list at /api/authors/ and detail at /api/authors/<pk>/ using generic views.",
      hint: "ListAPIView and RetrieveAPIView.",
      solution: `class AuthorList(generics.ListAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer


class AuthorDetail(generics.RetrieveAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer`,
    },
    {
      task: "Make a Note list API that only returns notes of the logged-in user and saves owner automatically.",
      hint: "get_queryset filter owner=self.request.user; perform_create save(owner=...).",
      solution: `class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)`,
    },
    {
      task: "Use APIView to create GET /api/books/export/ that returns all titles as a plain list of strings.",
      hint: "values_list('title', flat=True).",
      solution: `class BookExport(APIView):
    def get(self, request):
        titles = list(Book.objects.values_list("title", flat=True))
        return Response(titles)`,
    },
    {
      task: "Use different serializers for list (short) and detail (full) in a ListCreateAPIView: GET uses BookShortSerializer, POST uses BookSerializer.",
      hint: "Override get_serializer_class and check self.request.method.",
      solution: `class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return BookShortSerializer
        return BookSerializer`,
    },
  ],
  quiz: [
    { question: "Which mixin provides partial_update()?", options: ["CreateModelMixin", "UpdateModelMixin", "RetrieveModelMixin", "DestroyModelMixin"], answer: 1, explanation: "UpdateModelMixin provides update() and partial_update()." },
    { question: "Default lookup_field in GenericAPIView?", options: ["id", "slug", "pk", "uuid"], answer: 2, explanation: "lookup_field defaults to 'pk'." },
    { question: "Which hook should set owner=request.user on creation?", options: ["get_queryset", "perform_create", "get_object", "initial"], answer: 1, explanation: "perform_create(self, serializer) calls serializer.save(); pass extra kwargs there." },
    { question: "ListCreateAPIView handles which methods?", options: ["GET and POST", "GET and PUT", "POST and DELETE", "GET only"], answer: 0, explanation: "It combines ListModelMixin (GET) and CreateModelMixin (POST)." },
    { question: "In a class-based view, which method routes the request to get()/post()?", options: ["as_view", "initial", "finalize_response", "dispatch"], answer: 3, explanation: "dispatch() picks the handler matching request.method." },
  ],
};
