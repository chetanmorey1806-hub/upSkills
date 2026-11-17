export default {
  id: "day-07-permissions-custom-permissions",
  title: "Permissions and Custom Permissions",
  module: "Module 2: Auth & Advanced",
  day: 7,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Control who can do what in your API. Use DRF's built-in permission classes, combine them with & | ~, write custom view-level and object-level permissions like IsOwnerOrReadOnly, and use Django model permissions and groups.",
  objectives: [
    "Explain how DRF evaluates permission classes and when 401 vs 403 is returned",
    "Use AllowAny, IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly, DjangoModelPermissions",
    "Write custom permissions with has_permission and has_object_permission",
    "Combine permissions with &, | and ~ and choose permissions per action with get_permissions()",
    "Restrict querysets per user so users never see other users' data",
  ],
  theory: [
    {
      heading: "How Permissions Work in DRF",
      content: "After authentication sets request.user, DRF runs check_permissions() before your handler. Every class in permission_classes must return True from has_permission(request, view). For detail views, get_object() also calls check_object_permissions(), which runs has_object_permission(request, view, obj) on every class. If any check fails, DRF raises an error: NotAuthenticated (401) if the user is anonymous and the first authenticator supports WWW-Authenticate, otherwise PermissionDenied (403). Think of a cinema: the ticket checker at the entrance is has_permission (do you have any ticket?), and the usher at your row is has_object_permission (is THIS seat yours?).",
      points: [
        "View-level: has_permission(self, request, view) — runs on every request",
        "Object-level: has_object_permission(self, request, view, obj) — only when get_object() is called",
        "List views do NOT run object-level checks; filter the queryset instead",
        "All classes in the list must pass (AND logic)",
      ],
    },
    {
      heading: "Built-in Permission Classes",
      content: "Import them from rest_framework.permissions.",
      points: [
        "AllowAny: everyone, even anonymous (default if you set nothing)",
        "IsAuthenticated: only logged-in users",
        "IsAdminUser: only users with is_staff=True",
        "IsAuthenticatedOrReadOnly: anyone can read (GET, HEAD, OPTIONS); only logged-in users can write",
        "DjangoModelPermissions: maps POST/PUT/PATCH/DELETE to Django add/change/delete model permissions (GET is open to authenticated users)",
        "DjangoModelPermissionsOrAnonReadOnly: same, with anonymous read access",
        "DjangoObjectPermissions: per-object permissions with a backend like django-guardian",
      ],
      syntax: `# Global default (settings.py)
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
}

# Per view
class BookViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

# Function view
@api_view(["GET"])
@permission_classes([IsAdminUser])
def report(request): ...`,
    },
    {
      heading: "Custom Permissions",
      content: "Create a class that extends BasePermission and override one or both methods. Return True to allow, False to deny. Set the message attribute to customise the error. SAFE_METHODS is the tuple ('GET', 'HEAD', 'OPTIONS').",
      syntax: `from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrReadOnly(BasePermission):
    message = "You can edit only your own items."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.owner == request.user`,
      tip: "BasePermission.has_permission returns True by default, so a class that only overrides has_object_permission never blocks list or create. Combine it with IsAuthenticated.",
    },
    {
      heading: "Combining Permissions and Per-Action Permissions",
      content: "Since DRF 3.9 you can compose permission classes with & (and), | (or) and ~ (not) — without instantiating them. For ViewSets, override get_permissions() to return different permissions for each action. This is the clean way to express rules like 'anyone can read, only staff can delete'.",
      syntax: `permission_classes = [IsAuthenticated & (IsOwner | IsAdminUser)]

def get_permissions(self):
    if self.action in ("list", "retrieve"):
        return [AllowAny()]
    if self.action == "destroy":
        return [IsAdminUser()]
    return [IsAuthenticated()]`,
    },
    {
      heading: "Permissions vs Queryset Filtering",
      content: "Permissions say yes or no; they do not hide rows. If users must only see their own orders, filter get_queryset() by request.user. Then other users' objects give 404 (not 403), which also avoids revealing that the object exists. Use both: queryset filtering for visibility and object permissions for write rules.",
      points: [
        "Common mistake: relying on has_object_permission for list views — it is never called there",
        "Common mistake: forgetting that the default AllowAny makes everything public",
        "Common mistake: comparing obj.owner == request.user.username (compare objects or ids)",
        "Common mistake: overriding get_object() without calling check_object_permissions()",
      ],
    },
  ],
  examples: [
    {
      title: "Built-in Permissions and 401 vs 403",
      scenario: "Books can be read by anyone, created by logged-in users and deleted only by staff.",
      steps: [
        "Open books/views.py in VS Code / PyCharm",
        "Add get_permissions() to BookViewSet",
        "Create a normal user (asha) and a staff user (admin)",
        "Get JWT tokens for both (Day 6) and test with curl",
      ],
      code: `# books/views.py
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by("id")
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            permission_classes = [AllowAny]
        elif self.action == "destroy":
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [p() for p in permission_classes]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

# curl
curl http://127.0.0.1:8000/api/books/
curl -X POST http://127.0.0.1:8000/api/books/ -H "Content-Type: application/json" -d '{}'
curl -X DELETE http://127.0.0.1:8000/api/books/2/ -H "Authorization: Bearer <asha_access>"
curl -X DELETE -i http://127.0.0.1:8000/api/books/2/ -H "Authorization: Bearer <admin_access>"`,
      result: `GET /api/books/ (anonymous)               -> 200 OK  [ ...books... ]

POST /api/books/ (anonymous)              -> 401 Unauthorized
{"detail": "Authentication credentials were not provided."}

DELETE /api/books/2/ (asha, not staff)    -> 403 Forbidden
{"detail": "You do not have permission to perform this action."}

DELETE /api/books/2/ (admin, is_staff)    -> 204 No Content`,
      explanation: "Anonymous + permission denied = 401 (please log in). Authenticated + denied = 403 (you are known but not allowed). get_permissions must return instances, hence p().",
    },
    {
      title: "Custom IsOwnerOrReadOnly + Per-User Queryset",
      scenario: "Build a personal Notes API: each user sees and edits only their own notes, while admins can read everything.",
      steps: [
        "python manage.py startapp notes and add it to INSTALLED_APPS",
        "Create the Note model and migrate",
        "Create notes/permissions.py with custom permission classes",
        "Write NoteViewSet and register at /api/notes/",
        "Test with tokens of two different users",
      ],
      code: `# notes/models.py
from django.conf import settings
from django.db import models


class Note(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notes")
    title = models.CharField(max_length=120)
    body = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


# notes/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrReadOnly(BasePermission):
    message = "You can modify only your own notes."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.owner_id == request.user.id


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.owner_id == request.user.id


# notes/serializers.py
class NoteSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.username")

    class Meta:
        model = Note
        fields = ["id", "owner", "title", "body", "is_public", "created_at"]


# notes/views.py
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Note
from .permissions import IsOwnerOrReadOnly
from .serializers import NoteSerializer


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Note.objects.select_related("owner").all()
        return Note.objects.select_related("owner").filter(Q(owner=user) | Q(is_public=True))

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

# notes/urls.py -> router.register("notes", NoteViewSet, basename="note")

# curl (asha creates a public and a private note, ravi tries)
curl -X POST http://127.0.0.1:8000/api/notes/ -H "Authorization: Bearer <asha>" \\
     -H "Content-Type: application/json" -d '{"title":"DRF tips","is_public":true}'
curl http://127.0.0.1:8000/api/notes/ -H "Authorization: Bearer <ravi>"
curl -X PATCH http://127.0.0.1:8000/api/notes/1/ -H "Authorization: Bearer <ravi>" \\
     -H "Content-Type: application/json" -d '{"title":"hacked"}'
curl http://127.0.0.1:8000/api/notes/2/ -H "Authorization: Bearer <ravi>"`,
      result: `POST /api/notes/ (asha) -> 201 Created
{"id": 1, "owner": "asha", "title": "DRF tips", "body": "", "is_public": true,
 "created_at": "2026-11-17T12:00:00Z"}

GET /api/notes/ (ravi) -> 200 OK
[{"id": 1, "owner": "asha", "title": "DRF tips", "body": "", "is_public": true, ...}]
(asha's private note id 2 is not listed)

PATCH /api/notes/1/ (ravi) -> 403 Forbidden
{"detail": "You can modify only your own notes."}

GET /api/notes/2/ (ravi, private note of asha) -> 404 Not Found
{"detail": "No Note matches the given query."}`,
      explanation: "get_queryset hides private notes of others (404, so ravi cannot even confirm they exist). For the public note, ravi can GET it but the object permission blocks PATCH with our custom message. owner_id comparison avoids an extra query.",
    },
    {
      title: "Combining Permissions with & | ~ and DjangoModelPermissions",
      scenario: "Librarians (a Django group with add/change book permissions) can manage books; staff can do anything; and a custom permission blocks all writes when the system is in read-only maintenance mode.",
      steps: [
        "In /admin/ create a group 'Librarian' with books | book | Can add/change book",
        "Add user asha to the group",
        "Add MAINTENANCE_MODE = False to settings.py",
        "Write the permission classes and combine them",
        "Test with a librarian and a normal user",
      ],
      code: `# books/permissions.py
from django.conf import settings
from rest_framework.permissions import BasePermission, SAFE_METHODS


class NotInMaintenance(BasePermission):
    message = "API is in read-only maintenance mode."

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or not getattr(settings, "MAINTENANCE_MODE", False)


class IsLibrarian(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name="Librarian").exists()


# books/views.py
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly, IsAdminUser


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [NotInMaintenance & (DjangoModelPermissionsOrAnonReadOnly | IsAdminUser)]


# Group permissions from the shell (instead of admin)
python manage.py shell
>>> from django.contrib.auth.models import Group, Permission, User
>>> g, _ = Group.objects.get_or_create(name="Librarian")
>>> g.permissions.add(*Permission.objects.filter(codename__in=["add_book", "change_book"]))
>>> User.objects.get(username="asha").groups.add(g)

# curl
curl -X POST http://127.0.0.1:8000/api/books/ -H "Authorization: Bearer <asha>" \\
     -H "Content-Type: application/json" \\
     -d '{"title":"Python Crash Course","author":"Eric Matthes","isbn":"9781718502703","price":"599"}'
curl -X DELETE http://127.0.0.1:8000/api/books/6/ -H "Authorization: Bearer <asha>"
curl -X POST http://127.0.0.1:8000/api/books/ -H "Authorization: Bearer <ravi>" -H "Content-Type: application/json" -d '{}'
# set MAINTENANCE_MODE = True and retry asha's POST`,
      result: `POST /api/books/ (asha, Librarian: add_book) -> 201 Created
{"id": 6, "title": "Python Crash Course", ...}

DELETE /api/books/6/ (asha, no delete_book) -> 403 Forbidden
{"detail": "You do not have permission to perform this action."}

POST /api/books/ (ravi, no group) -> 403 Forbidden

POST /api/books/ (MAINTENANCE_MODE = True) -> 403 Forbidden
{"detail": "API is in read-only maintenance mode."}`,
      explanation: "DjangoModelPermissions maps POST->add, PUT/PATCH->change, DELETE->delete permissions, managed from the admin without code changes. & and | build readable rules. The custom message is used when that specific permission fails.",
    },
    {
      title: "Pure Python Demo: Evaluating Composed Permissions",
      scenario: "Simulate DRF's permission checks, including SAFE_METHODS, object ownership and the & | operators.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `SAFE_METHODS = ("GET", "HEAD", "OPTIONS")


class Perm:
    def __and__(self, other):
        return Combined(self, other, all)

    def __or__(self, other):
        return Combined(self, other, any)


class Combined(Perm):
    def __init__(self, a, b, op):
        self.a, self.b, self.op = a, b, op

    def has_object_permission(self, req, obj):
        return self.op([self.a.has_object_permission(req, obj),
                        self.b.has_object_permission(req, obj)])


class IsAuthenticated(Perm):
    def has_object_permission(self, req, obj):
        return req["user"] is not None


class IsOwner(Perm):
    def has_object_permission(self, req, obj):
        return obj["owner"] == req["user"]


class IsAdmin(Perm):
    def has_object_permission(self, req, obj):
        return req["user"] == "admin"


class ReadOnly(Perm):
    def has_object_permission(self, req, obj):
        return req["method"] in SAFE_METHODS


rule = IsAuthenticated() & (IsOwner() | IsAdmin() | ReadOnly())
note = {"id": 1, "owner": "asha"}

for user, method in [("asha", "PATCH"), ("ravi", "GET"), ("ravi", "DELETE"),
                     ("admin", "DELETE"), (None, "GET")]:
    allowed = rule.has_object_permission({"user": user, "method": method}, note)
    print(f"{str(user):6} {method:7} -> {'ALLOW' if allowed else 'DENY'}")`,
      python: {
        files: {
          "main.py": `SAFE_METHODS = ("GET", "HEAD", "OPTIONS")


class Perm:
    def __and__(self, other):
        return Combined(self, other, all)

    def __or__(self, other):
        return Combined(self, other, any)


class Combined(Perm):
    def __init__(self, a, b, op):
        self.a, self.b, self.op = a, b, op

    def has_object_permission(self, req, obj):
        return self.op([self.a.has_object_permission(req, obj),
                        self.b.has_object_permission(req, obj)])


class IsAuthenticated(Perm):
    def has_object_permission(self, req, obj):
        return req["user"] is not None


class IsOwner(Perm):
    def has_object_permission(self, req, obj):
        return obj["owner"] == req["user"]


class IsAdmin(Perm):
    def has_object_permission(self, req, obj):
        return req["user"] == "admin"


class ReadOnly(Perm):
    def has_object_permission(self, req, obj):
        return req["method"] in SAFE_METHODS


rule = IsAuthenticated() & (IsOwner() | IsAdmin() | ReadOnly())
note = {"id": 1, "owner": "asha"}

for user, method in [("asha", "PATCH"), ("ravi", "GET"), ("ravi", "DELETE"),
                     ("admin", "DELETE"), (None, "GET")]:
    allowed = rule.has_object_permission({"user": user, "method": method}, note)
    print(f"{str(user):6} {method:7} -> {'ALLOW' if allowed else 'DENY'}")
`,
        },
      },
      result: `asha   PATCH   -> ALLOW
ravi   GET     -> ALLOW
ravi   DELETE  -> DENY
admin  DELETE  -> ALLOW
None   GET     -> DENY`,
      explanation: "Operator overloading (__and__, __or__) is exactly how DRF lets you write IsAuthenticated & (IsOwner | IsAdminUser). Anonymous users fail IsAuthenticated even for GET because & requires both sides.",
    },
  ],
  interview: [
    { q: "What is the difference between has_permission and has_object_permission?", a: "has_permission runs for every request at the view level. has_object_permission runs only when get_object() is called for a specific instance (retrieve, update, destroy, detail actions).", level: "Easy" },
    { q: "Why is has_object_permission not called for list views?", a: "Checking every object would be expensive and list views do not call get_object(). Restrict list results by filtering get_queryset() instead.", level: "Medium" },
    { q: "When does DRF return 401 vs 403 for a permission failure?", a: "If the request was not authenticated and the first authentication class provides an authenticate_header (Token, Basic, JWT), DRF returns 401. If the user is authenticated, or the scheme is Session (no header), it returns 403.", level: "Hard" },
    { q: "What is SAFE_METHODS?", a: "A tuple ('GET', 'HEAD', 'OPTIONS') of HTTP methods that do not modify data. Used to allow read-only access.", level: "Easy" },
    { q: "What is the default permission class in DRF?", a: "AllowAny, unless DEFAULT_PERMISSION_CLASSES is set in settings. Production APIs usually set IsAuthenticated globally.", level: "Easy" },
    { q: "How do you set different permissions for different ViewSet actions?", a: "Override get_permissions() and return a list of permission instances based on self.action.", level: "Medium" },
    { q: "How does DjangoModelPermissions map HTTP methods?", a: "POST -> add_<model>, PUT/PATCH -> change_<model>, DELETE -> delete_<model>. GET/HEAD/OPTIONS only require authentication (view permission is not checked by default).", level: "Hard" },
    { q: "How do you combine permission classes with OR?", a: "Use the | operator: permission_classes = [IsAdminUser | IsOwner]. & is AND and ~ is NOT. Supported since DRF 3.9.", level: "Medium" },
    { q: "How do you change the error message of a custom permission?", a: "Set a message attribute on the permission class (and optionally code). DRF uses it in the PermissionDenied response.", level: "Easy" },
    { q: "Why might you return 404 instead of 403 for another user's object?", a: "Filtering the queryset by owner makes other users' objects not found, which avoids leaking the existence of private resources.", level: "Medium" },
    { q: "Where should the owner of a new object be set?", a: "In perform_create with serializer.save(owner=self.request.user); never trust an owner id sent by the client.", level: "Medium" },
  ],
  practice: [
    {
      task: "Write IsAuthorOrReadOnly for a Post model with an author field.",
      hint: "Same as IsOwnerOrReadOnly with obj.author.",
      solution: `class IsAuthorOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.method in SAFE_METHODS or obj.author == request.user`,
    },
    {
      task: "Write a permission that allows access only on weekdays between 9:00 and 18:00 server time.",
      hint: "django.utils.timezone.localtime(); weekday() < 5.",
      solution: `from django.utils import timezone


class OfficeHoursOnly(BasePermission):
    message = "API available Mon-Fri 9:00-18:00."

    def has_permission(self, request, view):
        now = timezone.localtime()
        return now.weekday() < 5 and 9 <= now.hour < 18`,
    },
    {
      task: "Make an Order ViewSet where customers see only their orders and staff see all, and only staff can delete.",
      hint: "get_queryset + get_permissions.",
      solution: `class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        u = self.request.user
        return Order.objects.all() if u.is_staff else Order.objects.filter(customer=u)

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)`,
    },
    {
      task: "Allow a request if the client sends header X-API-KEY equal to settings.INTERNAL_API_KEY OR the user is staff.",
      hint: "request.headers.get('X-API-KEY') and the | operator.",
      solution: `class HasInternalKey(BasePermission):
    def has_permission(self, request, view):
        return request.headers.get("X-API-KEY") == settings.INTERNAL_API_KEY

permission_classes = [HasInternalKey | IsAdminUser]`,
    },
  ],
  quiz: [
    { question: "Which permission lets anyone read but only authenticated users write?", options: ["AllowAny", "IsAuthenticatedOrReadOnly", "IsAdminUser", "DjangoModelPermissions"], answer: 1, explanation: "Safe methods are allowed for everyone; others need authentication." },
    { question: "IsAdminUser checks which attribute?", options: ["is_superuser", "is_active", "is_staff", "groups"], answer: 2, explanation: "IsAdminUser returns request.user.is_staff." },
    { question: "has_object_permission is called by:", options: ["get_object()", "get_queryset()", "list()", "perform_create()"], answer: 0, explanation: "get_object() calls check_object_permissions(request, obj)." },
    { question: "Which is valid syntax to allow staff OR owner?", options: ["[IsAdminUser, IsOwner]", "[IsAdminUser or IsOwner]", "[IsAdminUser + IsOwner]", "[IsAdminUser | IsOwner]"], answer: 3, explanation: "Use the | operator; a list means AND." },
    { question: "An anonymous request to a JWT-protected endpoint returns:", options: ["403", "401", "404", "400"], answer: 1, explanation: "JWTAuthentication provides a WWW-Authenticate header, so NotAuthenticated becomes 401." },
  ],
};
