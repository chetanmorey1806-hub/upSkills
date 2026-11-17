export default {
  id: "day-06-authentication-session-token-jwt",
  title: "Authentication: Session, Token, JWT (SimpleJWT)",
  module: "Module 2: Auth & Advanced",
  day: 6,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Learn how DRF identifies who is calling an API. Compare Basic, Session, Token and JWT authentication, set up DRF TokenAuthentication with a login endpoint, then implement JWT login, refresh, blacklist/logout and registration with djangorestframework-simplejwt.",
  objectives: [
    "Explain authentication vs authorization and how DRF sets request.user and request.auth",
    "Configure DEFAULT_AUTHENTICATION_CLASSES globally and per view",
    "Use TokenAuthentication with obtain_auth_token and the Authorization: Token header",
    "Implement JWT with SimpleJWT: access/refresh tokens, lifetimes, rotation, blacklist and custom claims",
    "Build register, login, refresh, logout and profile endpoints and test them with curl/Postman",
  ],
  theory: [
    {
      heading: "Authentication vs Authorization",
      content: "Authentication answers 'Who are you?' — it checks credentials (username/password, token) and identifies the user. Authorization (permissions, Day 7) answers 'What are you allowed to do?'. At an office gate, the security guard checks your ID card (authentication); the lift only takes you to floors your card allows (authorization). In DRF, authentication runs at the start of every request; the authentication classes are tried in order and the first that succeeds sets request.user and request.auth. If none succeed, request.user is AnonymousUser. Authentication itself never blocks a request — permissions do.",
      points: [
        "request.user: django.contrib.auth User or AnonymousUser",
        "request.auth: extra info, e.g. the Token instance or the validated JWT",
        "401 Unauthorized: credentials missing/invalid; 403 Forbidden: authenticated but not allowed",
      ],
    },
    {
      heading: "DRF Authentication Schemes",
      content: "DRF ships with Basic, Session and Token authentication; JWT comes from the djangorestframework-simplejwt package.",
      points: [
        "BasicAuthentication: username:password base64 in every request. Only for testing over HTTPS",
        "SessionAuthentication: Django login cookie (sessionid) + CSRF token. Best for same-domain browser apps and the browsable API",
        "TokenAuthentication: one random token per user stored in the DB (authtoken_token table). Header: Authorization: Token <key>. Simple, but the token never expires by default",
        "JWT (SimpleJWT): signed, self-contained tokens; short-lived access token + long-lived refresh token. Header: Authorization: Bearer <access>. Stateless — no DB lookup per request for the token",
      ],
      tip: "Mobile apps and React/Angular SPAs on a different domain usually use JWT. Server-rendered Django sites and the browsable API use Session.",
    },
    {
      heading: "How JWT Works",
      content: "A JSON Web Token has three base64url parts separated by dots: header.payload.signature. The header says the algorithm (HS256). The payload holds claims: user_id, token_type, exp (expiry time), iat (issued at), jti (unique id). The signature is HMAC-SHA256(header.payload, SECRET_KEY). Anyone can READ the payload (it is only encoded, not encrypted) but nobody can CHANGE it without the secret key, because the signature would no longer match. Never put passwords or sensitive data in a JWT.",
      syntax: `Login:   POST /api/auth/token/          {username, password}  -> {access, refresh}
Use:     GET  /api/books/   Header: Authorization: Bearer <access>
Expired: 401 {"detail": "Given token not valid for any token type", "code": "token_not_valid"}
Refresh: POST /api/auth/token/refresh/  {refresh}              -> {access (, refresh)}
Logout:  POST /api/auth/logout/         {refresh}  -> refresh token blacklisted`,
      points: [
        "Access token: short life (5-30 min), sent with every request",
        "Refresh token: long life (1-7 days), only sent to the refresh endpoint",
        "ROTATE_REFRESH_TOKENS: refresh returns a new refresh token too",
        "BLACKLIST_AFTER_ROTATION + token_blacklist app: old refresh tokens cannot be reused",
      ],
    },
    {
      heading: "Configuring Authentication",
      content: "Set defaults in settings.REST_FRAMEWORK and override per view with authentication_classes. Order matters: DRF tries each class in order. Put the scheme used by most clients first; the first class also decides the WWW-Authenticate header for 401 responses.",
      syntax: `REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

# per view
class PublicView(APIView):
    authentication_classes = []          # no auth at all
    permission_classes = [AllowAny]`,
    },
    {
      heading: "Security Best Practices for Tokens",
      content: "Tokens are like house keys — whoever holds them gets in. Protect them.",
      points: [
        "Always use HTTPS in production; tokens in plain HTTP can be sniffed",
        "Keep access tokens short-lived; use refresh tokens to get new ones",
        "Store the SIGNING_KEY / SECRET_KEY in environment variables, never in Git",
        "Blacklist refresh tokens on logout; change the secret to invalidate all tokens in an emergency",
        "In the browser prefer memory + httpOnly cookie for refresh; localStorage is easy but vulnerable to XSS",
        "Never log Authorization headers",
      ],
    },
  ],
  examples: [
    {
      title: "DRF TokenAuthentication with obtain_auth_token",
      scenario: "Give each library member a permanent API token for a simple internal tool.",
      steps: [
        "Add 'rest_framework.authtoken' to INSTALLED_APPS",
        "Run python manage.py migrate (creates authtoken_token table)",
        "Add TokenAuthentication to settings and the token URL",
        "Create a user and get a token with curl, then call a protected endpoint",
      ],
      code: `# config/settings.py
INSTALLED_APPS += ["rest_framework.authtoken"]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
}

# config/urls.py
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns += [
    path("api/token-auth/", obtain_auth_token),
]

# Create token automatically for every new user (books/signals.py)
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

# Commands
python manage.py migrate
python manage.py drf_create_token asha        # token for an existing user

# curl
curl -X POST http://127.0.0.1:8000/api/token-auth/ \\
     -H "Content-Type: application/json" -d '{"username":"asha","password":"secret123"}'

curl -X POST http://127.0.0.1:8000/api/books/ -H "Content-Type: application/json" \\
     -d '{"title":"Refactoring","author":"Martin Fowler","isbn":"9780134757599","price":"700"}'

curl -X POST http://127.0.0.1:8000/api/books/ -H "Content-Type: application/json" \\
     -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b" \\
     -d '{"title":"Refactoring","author":"Martin Fowler","isbn":"9780134757599","price":"700"}'`,
      result: `POST /api/token-auth/ -> 200 OK
{"token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"}

POST /api/books/ (no header) -> 401 Unauthorized
WWW-Authenticate: Token
{"detail": "Authentication credentials were not provided."}

POST /api/books/ (with Token header) -> 201 Created
{"id": 5, "slug": "refactoring", "title": "Refactoring", ..., "created_by": "asha"}`,
      explanation: "The header word is 'Token' (not Bearer) for DRF tokens. The 401 includes WWW-Authenticate because TokenAuthentication is first. IsAuthenticatedOrReadOnly lets anonymous users GET but not POST. The token is stored in the DB and never expires unless deleted.",
    },
    {
      title: "JWT Login, Refresh, Verify and Logout with SimpleJWT",
      scenario: "The React app (Day 11) needs JWT. Install SimpleJWT, configure lifetimes, rotation and blacklist, and expose the auth endpoints.",
      steps: [
        "pip install djangorestframework-simplejwt and update requirements.txt",
        "Add 'rest_framework_simplejwt.token_blacklist' to INSTALLED_APPS and migrate",
        "Configure REST_FRAMEWORK and SIMPLE_JWT in settings.py",
        "Create accounts app: python manage.py startapp accounts, add URLs",
        "Test login, protected call, refresh and logout in Postman (Authorization tab -> Bearer Token)",
      ],
      code: `pip install djangorestframework-simplejwt
pip freeze > requirements.txt   # djangorestframework-simplejwt==5.3.1, PyJWT==2.9.0

# config/settings.py
from datetime import timedelta

INSTALLED_APPS += ["rest_framework_simplejwt.token_blacklist", "accounts"]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    # "SIGNING_KEY": os.environ["JWT_SIGNING_KEY"],   # defaults to SECRET_KEY
}

# accounts/views.py
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get("refresh"))
            token.blacklist()
        except TokenError:
            return Response({"detail": "Invalid or expired refresh token."},
                            status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({"id": u.id, "username": u.username, "email": u.email,
                         "is_staff": u.is_staff})

# accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView,
                                            TokenVerifyView)
from .views import LogoutView, MeView

urlpatterns = [
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
]

# config/urls.py
path("api/auth/", include("accounts.urls")),

python manage.py migrate

# ---- curl flow ----
curl -X POST http://127.0.0.1:8000/api/auth/token/ -H "Content-Type: application/json" \\
     -d '{"username":"asha","password":"secret123"}'

curl http://127.0.0.1:8000/api/auth/me/ -H "Authorization: Bearer <access>"

curl -X POST http://127.0.0.1:8000/api/auth/token/refresh/ -H "Content-Type: application/json" \\
     -d '{"refresh":"<refresh>"}'

curl -X POST http://127.0.0.1:8000/api/auth/logout/ -H "Authorization: Bearer <access>" \\
     -H "Content-Type: application/json" -d '{"refresh":"<new refresh>"}'`,
      result: `POST /api/auth/token/ -> 200 OK
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6...",
  "access":  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoi..."
}

POST /api/auth/token/ (wrong password) -> 401 Unauthorized
{"detail": "No active account found with the given credentials"}

GET /api/auth/me/ -> 200 OK
{"id": 2, "username": "asha", "email": "asha@mail.com", "is_staff": false}

GET /api/auth/me/ (after 15 minutes) -> 401 Unauthorized
{"detail": "Given token not valid for any token type", "code": "token_not_valid",
 "messages": [{"token_class": "AccessToken", "token_type": "access", "message": "Token is expired"}]}

POST /api/auth/token/refresh/ -> 200 OK
{"access": "eyJhbGciOi...", "refresh": "eyJhbGciOi...(new, rotated)"}

POST /api/auth/logout/ -> 205 Reset Content

POST /api/auth/token/refresh/ (with blacklisted refresh) -> 401 Unauthorized
{"detail": "Token is blacklisted", "code": "token_not_valid"}`,
      explanation: "TokenObtainPairView checks username/password and returns a pair. Clients send the access token as Bearer; when it expires they call refresh. With rotation + blacklist, each refresh token can be used only once, and logout blacklists the current one. The access token stays valid until it expires — that is why it must be short-lived.",
    },
    {
      title: "Registration Endpoint and Custom JWT Claims",
      scenario: "New users must sign up via the API and receive tokens immediately. The React app also wants the username and is_staff inside the token.",
      steps: [
        "Write RegisterSerializer and RegisterView in accounts/",
        "Write MyTokenObtainPairSerializer with extra claims",
        "Point the token/ URL to the custom view",
        "Test POST /api/auth/register/ in Postman",
        "Decode the access token at jwt.io to see the claims",
      ],
      code: `# accounts/serializers.py
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value.lower()

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username       # custom claims
        token["is_staff"] = user.is_staff
        return token


# accounts/views.py
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({"user": serializer.data,
                         "refresh": str(refresh),
                         "access": str(refresh.access_token)},
                        status=status.HTTP_201_CREATED)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# accounts/urls.py
path("register/", RegisterView.as_view(), name="register"),
path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),

# curl
curl -X POST http://127.0.0.1:8000/api/auth/register/ -H "Content-Type: application/json" \\
     -d '{"username":"ravi","email":"Ravi@Mail.com","password":"Str0ng!Pass"}'

curl -X POST http://127.0.0.1:8000/api/auth/register/ -H "Content-Type: application/json" \\
     -d '{"username":"ravi","email":"x@mail.com","password":"123"}'`,
      result: `POST /api/auth/register/ -> 201 Created
{
  "user": {"id": 3, "username": "ravi", "email": "ravi@mail.com"},
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "access": "eyJhbGciOiJIUzI1NiIs..."
}

POST /api/auth/register/ (weak password, duplicate username) -> 400 Bad Request
{
  "username": ["A user with that username already exists."],
  "password": ["This password is too short. It must contain at least 8 characters.",
               "This password is too common.",
               "This password is entirely numeric."]
}

Decoded access payload (jwt.io):
{"token_type": "access", "exp": 1794914100, "iat": 1794913200,
 "jti": "4f0c...", "user_id": 3, "username": "ravi", "is_staff": false}`,
      explanation: "validate_password reuses Django's AUTH_PASSWORD_VALIDATORS. RefreshToken.for_user() creates tokens manually so the user is logged in right after registering. Custom claims are added in get_token; they are readable by the frontend but tamper-proof because of the signature. authentication_classes = [] on RegisterView avoids a 401 if the client sends an expired token by mistake.",
    },
    {
      title: "Pure Python Demo: Build and Verify a JWT (HS256) by Hand",
      scenario: "Understand exactly what SimpleJWT does: base64url encode header and payload, sign with HMAC-SHA256, and detect tampering.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `import base64
import hashlib
import hmac
import json

SECRET = b"django-insecure-demo-key"


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def b64url_decode(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def make_jwt(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    h = b64url(json.dumps(header, separators=(",", ":")).encode())
    p = b64url(json.dumps(payload, separators=(",", ":")).encode())
    sig = hmac.new(SECRET, f"{h}.{p}".encode(), hashlib.sha256).digest()
    return f"{h}.{p}.{b64url(sig)}"


def verify_jwt(token: str, now: int) -> dict:
    h, p, s = token.split(".")
    expected = b64url(hmac.new(SECRET, f"{h}.{p}".encode(), hashlib.sha256).digest())
    if not hmac.compare_digest(expected, s):
        raise ValueError("Signature verification failed")
    payload = json.loads(b64url_decode(p))
    if payload["exp"] < now:
        raise ValueError("Token is expired")
    return payload


token = make_jwt({"token_type": "access", "user_id": 7, "iat": 1000, "exp": 1900})
print("Token parts:", len(token.split(".")))
print("Header :", b64url_decode(token.split(".")[0]).decode())
print("Payload:", b64url_decode(token.split(".")[1]).decode())
print("Valid  :", verify_jwt(token, now=1500))

for now, tok in [(2000, token)]:
    try:
        verify_jwt(tok, now)
    except ValueError as e:
        print("At", now, "->", e)

h, p, s = token.split(".")
evil = json.loads(b64url_decode(p)) | {"user_id": 1}
tampered = f"{h}.{b64url(json.dumps(evil, separators=(',', ':')).encode())}.{s}"
try:
    verify_jwt(tampered, now=1500)
except ValueError as e:
    print("Tampered ->", e)`,
      python: {
        files: {
          "main.py": `import base64
import hashlib
import hmac
import json

SECRET = b"django-insecure-demo-key"


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def b64url_decode(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def make_jwt(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    h = b64url(json.dumps(header, separators=(",", ":")).encode())
    p = b64url(json.dumps(payload, separators=(",", ":")).encode())
    sig = hmac.new(SECRET, f"{h}.{p}".encode(), hashlib.sha256).digest()
    return f"{h}.{p}.{b64url(sig)}"


def verify_jwt(token: str, now: int) -> dict:
    h, p, s = token.split(".")
    expected = b64url(hmac.new(SECRET, f"{h}.{p}".encode(), hashlib.sha256).digest())
    if not hmac.compare_digest(expected, s):
        raise ValueError("Signature verification failed")
    payload = json.loads(b64url_decode(p))
    if payload["exp"] < now:
        raise ValueError("Token is expired")
    return payload


token = make_jwt({"token_type": "access", "user_id": 7, "iat": 1000, "exp": 1900})
print("Token parts:", len(token.split(".")))
print("Header :", b64url_decode(token.split(".")[0]).decode())
print("Payload:", b64url_decode(token.split(".")[1]).decode())
print("Valid  :", verify_jwt(token, now=1500))

for now, tok in [(2000, token)]:
    try:
        verify_jwt(tok, now)
    except ValueError as e:
        print("At", now, "->", e)

h, p, s = token.split(".")
evil = json.loads(b64url_decode(p)) | {"user_id": 1}
tampered = f"{h}.{b64url(json.dumps(evil, separators=(',', ':')).encode())}.{s}"
try:
    verify_jwt(tampered, now=1500)
except ValueError as e:
    print("Tampered ->", e)
`,
        },
      },
      result: `Token parts: 3
Header : {"alg":"HS256","typ":"JWT"}
Payload: {"token_type":"access","user_id":7,"iat":1000,"exp":1900}
Valid  : {'token_type': 'access', 'user_id': 7, 'iat': 1000, 'exp': 1900}
At 2000 -> Token is expired
Tampered -> Signature verification failed`,
      explanation: "The payload is readable by anyone (just base64), so never store secrets in it. Changing user_id breaks the signature because the attacker does not know SECRET. hmac.compare_digest avoids timing attacks. SimpleJWT (via PyJWT) does exactly this plus jti, blacklist and token_type checks.",
    },
  ],
  interview: [
    { q: "Difference between authentication and authorization?", a: "Authentication identifies the user (who are you). Authorization decides what the identified user may do (permissions). In DRF, authentication classes set request.user; permission classes allow or deny.", level: "Easy" },
    { q: "What are the built-in authentication classes in DRF?", a: "BasicAuthentication, SessionAuthentication, TokenAuthentication and RemoteUserAuthentication. JWT is provided by third-party packages like djangorestframework-simplejwt.", level: "Easy" },
    { q: "What is JWT and what are its three parts?", a: "JSON Web Token: a signed, self-contained token. Parts: header (algorithm, type), payload (claims like user_id, exp) and signature (HMAC or RSA over header.payload).", level: "Easy" },
    { q: "Why do we have both access and refresh tokens?", a: "Access tokens are short-lived to limit damage if stolen and are sent on every request. Refresh tokens are long-lived, sent only to the refresh endpoint, and used to get new access tokens without asking for the password again.", level: "Medium" },
    { q: "Is the JWT payload encrypted?", a: "No, it is only base64url-encoded; anyone can decode it. It is signed, so it cannot be modified without the key. Never store passwords or secrets in it.", level: "Medium" },
    { q: "How do you log out with JWT if tokens are stateless?", a: "Blacklist the refresh token (SimpleJWT token_blacklist app) and delete tokens on the client. The access token stays valid until expiry, so keep it short-lived.", level: "Hard" },
    { q: "TokenAuthentication vs JWT?", a: "DRF Token is a random key stored in the database, looked up on every request, no expiry by default, one per user. JWT is signed and self-contained, verified without DB lookup, has built-in expiry and supports refresh/rotation.", level: "Medium" },
    { q: "What header format does SimpleJWT expect?", a: "Authorization: Bearer <access_token> (configurable via AUTH_HEADER_TYPES). DRF TokenAuthentication expects Authorization: Token <key>.", level: "Easy" },
    { q: "Why does SessionAuthentication require CSRF but TokenAuthentication does not?", a: "Browsers send session cookies automatically, so a malicious site could trigger requests; CSRF tokens prevent that. Tokens in the Authorization header are not sent automatically by the browser, so CSRF is not possible.", level: "Hard" },
    { q: "What happens when no authentication class succeeds?", a: "request.user is set to AnonymousUser and request.auth to None. The request is not rejected unless a permission class requires authentication.", level: "Medium" },
    { q: "What does ROTATE_REFRESH_TOKENS do?", a: "When True, the refresh endpoint returns a new refresh token as well as a new access token. With BLACKLIST_AFTER_ROTATION the old refresh token is blacklisted.", level: "Medium" },
    { q: "How do you add custom data to a SimpleJWT token?", a: "Subclass TokenObtainPairSerializer, override get_token(cls, user) to add claims, and use it in a subclass of TokenObtainPairView.", level: "Medium" },
  ],
  practice: [
    {
      task: "Make the books list public (no auth needed) while everything else requires JWT.",
      hint: "Global IsAuthenticated + per-view permission_classes = [AllowAny] for list, or IsAuthenticatedOrReadOnly.",
      solution: `class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]`,
    },
    {
      task: "Write a change-password endpoint: POST /api/auth/change-password/ with old_password and new_password.",
      hint: "user.check_password, validate_password, set_password, save.",
      solution: `class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.check_password(request.data.get("old_password", "")):
            return Response({"old_password": "Wrong password."}, status=400)
        new = request.data.get("new_password", "")
        validate_password(new, user)
        user.set_password(new)
        user.save()
        return Response({"detail": "Password changed."})`,
    },
    {
      task: "Allow login with email instead of username for JWT.",
      hint: "Custom serializer that looks up the user by email and calls super().validate with the username.",
      solution: `class EmailTokenSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        user = User.objects.filter(email__iexact=attrs.get("email")).first()
        if user is None:
            raise serializers.ValidationError("No active account found with the given credentials")
        attrs = {"username": user.username, "password": attrs.get("password")}
        self.username_field = "username"
        return super().validate(attrs)`,
    },
    {
      task: "Set access token lifetime to 30 minutes and refresh to 7 days, using an environment variable for the signing key.",
      hint: "SIMPLE_JWT dict with timedelta and os.environ.get.",
      solution: `import os
from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "SIGNING_KEY": os.environ.get("JWT_SIGNING_KEY", SECRET_KEY),
}`,
    },
  ],
  quiz: [
    { question: "Which header does SimpleJWT expect by default?", options: ["Authorization: Token <t>", "X-Auth: <t>", "Authorization: Bearer <t>", "Cookie: jwt=<t>"], answer: 2, explanation: "AUTH_HEADER_TYPES defaults to ('Bearer',)." },
    { question: "Which part of a JWT prevents tampering?", options: ["Signature", "Header", "Payload", "jti claim"], answer: 0, explanation: "The signature is computed with the secret key over header and payload." },
    { question: "If no authentication class succeeds, request.user is:", options: ["None", "AnonymousUser", "an exception is raised", "the first superuser"], answer: 1, explanation: "DRF sets an AnonymousUser; permissions decide whether to block." },
    { question: "Which app must be installed to blacklist SimpleJWT refresh tokens?", options: ["rest_framework.authtoken", "django.contrib.sessions", "corsheaders", "rest_framework_simplejwt.token_blacklist"], answer: 3, explanation: "token_blacklist stores outstanding and blacklisted tokens." },
    { question: "DRF TokenAuthentication tokens by default:", options: ["never expire", "expire after 5 minutes", "expire after 1 day", "expire on server restart"], answer: 0, explanation: "They are permanent until deleted; you must implement expiry yourself." },
  ],
};
