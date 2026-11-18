export default {
  id: "day-07-authentication-oauth2-jwt",
  title: "Authentication: OAuth2 Password Flow, JWT and Password Hashing",
  module: "Module 3: Security & Advanced",
  day: 7,
  level: "Advanced",
  duration: "4 hours",
  summary: "Secure your API the way real companies do: hash passwords with Argon2/bcrypt, implement the OAuth2 password flow with OAuth2PasswordBearer and OAuth2PasswordRequestForm, issue and verify JWT access tokens with PyJWT, protect routes with a get_current_user dependency, and add role-based authorization.",
  objectives: [
    "Explain authentication vs authorization and session vs token based auth",
    "Hash and verify passwords securely (never store plain text)",
    "Understand JWT structure (header.payload.signature), claims and expiry",
    "Implement /token login with OAuth2PasswordRequestForm and test it with Swagger's Authorize button",
    "Protect routes with get_current_user and role checks, returning correct 401/403 errors",
  ],
  theory: [
    {
      heading: "Authentication vs authorization",
      content: "**Authentication** answers 'Who are you?' - verifying identity with a username/password, OTP or Google login. **Authorization** answers 'What are you allowed to do?' - checking roles or permissions such as admin vs student.\n\nTraditional web apps (Django/Flask templates) often use **session cookies**: the server stores the session and the browser sends a session id. APIs consumed by React, Android and other services usually use **token-based auth**: after login the server gives a signed token (JWT), and the client sends it in every request as `Authorization: Bearer <token>`. The server does not need to store sessions - it is **stateless**, which scales easily across many servers.",
      points: [
        "Failed authentication -> 401 Unauthorized + WWW-Authenticate: Bearer",
        "Failed authorization -> 403 Forbidden",
        "Always use HTTPS in production - tokens and passwords travel in headers/body",
      ],
    },
    {
      heading: "Password hashing",
      content: "Never store passwords in plain text or with simple hashes like MD5/SHA-256. If the DB leaks, attackers can crack them quickly. Use slow, salted password hashing algorithms: **Argon2** (modern recommendation, used in current FastAPI docs via `pwdlib`) or **bcrypt** (via `passlib` or the `bcrypt` package).\n\nA **salt** is random data added before hashing, so two users with the same password get different hashes. Login verification re-hashes the provided password with the stored salt and compares. Hashing is one-way: you cannot 'decrypt' a hash.",
      syntax: "pip install \"pwdlib[argon2]\"\n\nfrom pwdlib import PasswordHash\npassword_hash = PasswordHash.recommended()\n\nhashed = password_hash.hash(\"secret123\")      # $argon2id$v=19$m=65536...\npassword_hash.verify(\"secret123\", hashed)     # True",
      tip: "Interview: 'Hashing is one-way, encryption is two-way. Passwords are hashed, never encrypted.'",
    },
    {
      heading: "JWT (JSON Web Token) explained",
      content: "A JWT is a compact, URL-safe string with three Base64URL parts separated by dots: **header.payload.signature**.\n\n**Header**: algorithm and type, e.g. {\"alg\": \"HS256\", \"typ\": \"JWT\"}.\n**Payload**: claims (data), e.g. {\"sub\": \"asha\", \"role\": \"admin\", \"exp\": 1763459200}. Standard claims: `sub` (subject/user id), `exp` (expiry), `iat` (issued at), `iss` (issuer), `aud` (audience).\n**Signature**: HMAC-SHA256 of header+payload using the server's SECRET_KEY.\n\nThe payload is only encoded, **not encrypted** - anyone can read it at jwt.io. Never put passwords or sensitive data inside. The signature guarantees it was not modified: if someone changes role to admin, the signature check fails.",
      syntax: "pip install pyjwt\n\nimport jwt\ntoken = jwt.encode({\"sub\": \"asha\", \"exp\": expire}, SECRET_KEY, algorithm=\"HS256\")\npayload = jwt.decode(token, SECRET_KEY, algorithms=[\"HS256\"])",
      points: [
        "Generate a secret: openssl rand -hex 32 or python -c \"import secrets; print(secrets.token_hex(32))\"",
        "Keep SECRET_KEY in environment variables, never in Git",
        "Short-lived access tokens (15-60 min) + longer refresh tokens is the common pattern",
        "jwt.decode raises ExpiredSignatureError or InvalidTokenError on problems",
      ],
    },
    {
      heading: "OAuth2 password flow in FastAPI",
      content: "OAuth2 is a standard for authorization. Its simplest 'password' flow fits first-party apps: the client sends username and password as **form data** to a token URL, and receives `{\"access_token\": \"...\", \"token_type\": \"bearer\"}`.\n\nFastAPI provides two helpers:\n`OAuth2PasswordBearer(tokenUrl=\"token\")` - a dependency that reads the `Authorization: Bearer <token>` header, returns the token string, and returns 401 if missing. It also adds the **Authorize** button to Swagger UI.\n`OAuth2PasswordRequestForm` - a dependency that reads `username` and `password` from form data (requires python-multipart, included in fastapi[standard]).",
      syntax: "oauth2_scheme = OAuth2PasswordBearer(tokenUrl=\"token\")\n\n@app.post(\"/token\")\ndef login(form: Annotated[OAuth2PasswordRequestForm, Depends()]):\n    ...\n    return {\"access_token\": token, \"token_type\": \"bearer\"}",
    },
    {
      heading: "Protecting routes with get_current_user",
      content: "Combine everything into one dependency: `get_current_user(token = Depends(oauth2_scheme), db = Depends(get_db))` decodes the JWT, reads `sub`, loads the user from the DB, and raises 401 if anything is wrong. Any endpoint that declares `current_user: CurrentUser` is now protected.\n\nAdd sub-dependencies for authorization: `get_current_active_user` checks is_active, and `require_role(\"admin\")` checks the role and raises 403. Apply to whole routers with `dependencies=[Depends(...)]`.",
      points: [
        "Login flow: POST /token -> verify password -> create JWT -> return token",
        "Request flow: Bearer header -> oauth2_scheme -> decode -> load user -> endpoint",
        "Logout with JWT: client deletes token; server-side revocation needs a denylist (e.g. Redis) or short expiry",
      ],
    },
    {
      heading: "Security best practices",
      content: "Authentication bugs are serious, so follow known practices. Return the same generic message for wrong username and wrong password ('Incorrect username or password') to avoid revealing which usernames exist. Rate-limit the login endpoint to stop brute force. Use HTTPS. Keep tokens short-lived. Store refresh tokens securely (httpOnly cookies for browsers). Validate `exp` (PyJWT does this automatically). Always specify `algorithms=[\"HS256\"]` when decoding to avoid algorithm confusion attacks.",
      tip: "For production you can also use providers like Auth0, Firebase Auth, AWS Cognito or Keycloak, but interviewers expect you to explain how JWT auth works internally.",
    },
  ],
  examples: [
    {
      title: "Hashing and verifying passwords",
      scenario: "See how Argon2 hashes look and why the same password gives different hashes.",
      steps: [
        "pip install \"pwdlib[argon2]\"",
        "Save as hash_demo.py and run python hash_demo.py",
      ],
      code: `from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()   # Argon2id

h1 = password_hash.hash("secret123")
h2 = password_hash.hash("secret123")

print(h1)
print(h1 == h2)                                  # different salts
print(password_hash.verify("secret123", h1))     # correct password
print(password_hash.verify("wrong", h1))         # wrong password

# Alternative with bcrypt directly:
# pip install bcrypt
# import bcrypt
# hashed = bcrypt.hashpw(b"secret123", bcrypt.gensalt())
# bcrypt.checkpw(b"secret123", hashed)  -> True`,
      result: "$argon2id$v=19$m=65536,t=3,p=4$Xk1...$9b0...\nFalse\nTrue\nFalse",
      explanation: "The hash string stores algorithm, parameters and salt, so verify() knows how to re-hash. Two hashes of the same password differ because of random salts, which defeats rainbow-table attacks.",
    },
    {
      title: "Create and decode a JWT",
      scenario: "Understand token creation, expiry and tampering detection before using it in an API.",
      steps: [
        "pip install pyjwt",
        "Save as jwt_demo.py and run python jwt_demo.py",
        "Paste the printed token into jwt.io to see the decoded payload",
      ],
      code: `from datetime import datetime, timedelta, timezone

import jwt

SECRET_KEY = "change-me-use-env-variable"
ALGORITHM = "HS256"

expire = datetime.now(timezone.utc) + timedelta(minutes=30)
token = jwt.encode({"sub": "asha", "role": "admin", "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
print(token)

payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
print(payload)

# Tampering: change one character of the signature
bad = token[:-2] + ("A" if token[-2] != "A" else "B") + token[-1]
try:
    jwt.decode(bad, SECRET_KEY, algorithms=[ALGORITHM])
except jwt.InvalidTokenError as e:
    print("Rejected:", type(e).__name__)

# Expired token
old = jwt.encode({"sub": "asha", "exp": datetime.now(timezone.utc) - timedelta(seconds=1)}, SECRET_KEY, algorithm=ALGORITHM)
try:
    jwt.decode(old, SECRET_KEY, algorithms=[ALGORITHM])
except jwt.ExpiredSignatureError:
    print("Rejected: token expired")`,
      result: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhc2hhIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzYz...\n{'sub': 'asha', 'role': 'admin', 'exp': 1763461800}\nRejected: InvalidSignatureError\nRejected: token expired",
      explanation: "exp is stored as a Unix timestamp and checked automatically by decode. Any change to header or payload invalidates the signature. ExpiredSignatureError and InvalidSignatureError are subclasses of InvalidTokenError, so catching InvalidTokenError covers all cases.",
    },
    {
      title: "Complete OAuth2 + JWT login API",
      scenario: "Login with username/password, receive a token, and access a protected /users/me endpoint (in-memory users for clarity).",
      steps: [
        "pip install \"fastapi[standard]\" pyjwt \"pwdlib[argon2]\"",
        "Save main.py and run fastapi dev main.py",
        "In /docs click the green Authorize button, enter asha / secret123, click Authorize",
        "Execute GET /users/me - Swagger sends the Bearer token automatically",
      ],
      code: `from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pwdlib import PasswordHash
from pydantic import BaseModel

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"  # load from env in real apps
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
app = FastAPI()

USERS = {
    "asha": {"username": "asha", "role": "admin", "disabled": False,
             "hashed_password": password_hash.hash("secret123")},
    "ravi": {"username": "ravi", "role": "student", "disabled": False,
             "hashed_password": password_hash.hash("ravi@2024")},
}


class Token(BaseModel):
    access_token: str
    token_type: str


class User(BaseModel):
    username: str
    role: str
    disabled: bool = False


def authenticate(username: str, password: str) -> dict | None:
    user = USERS.get(username)
    if not user or not password_hash.verify(password, user["hashed_password"]):
        return None
    return user


def create_access_token(data: dict, minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
    except jwt.InvalidTokenError:
        raise credentials_error
    user = USERS.get(username) if username else None
    if user is None:
        raise credentials_error
    return User(**user)


def get_current_active_user(user: Annotated[User, Depends(get_current_user)]) -> User:
    if user.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Inactive user")
    return user


CurrentUser = Annotated[User, Depends(get_current_active_user)]


@app.post("/token", response_model=Token)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = authenticate(form.username, form.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user["username"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/users/me", response_model=User)
def read_me(current_user: CurrentUser):
    return current_user`,
      result: "POST /token (form: username=asha, password=secret123) -> {\"access_token\":\"eyJhbGciOi...\",\"token_type\":\"bearer\"}\nWrong password -> 401 {\"detail\":\"Incorrect username or password\"}\nGET /users/me without token -> 401 {\"detail\":\"Not authenticated\"}\nGET /users/me after Authorize -> {\"username\":\"asha\",\"role\":\"admin\",\"disabled\":false}\ncurl: curl -X POST http://127.0.0.1:8000/token -d \"username=asha&password=secret123\" then curl -H \"Authorization: Bearer <token>\" http://127.0.0.1:8000/users/me",
      explanation: "OAuth2PasswordRequestForm reads form fields (not JSON) as the OAuth2 spec requires. oauth2_scheme extracts the bearer token and makes Swagger show the Authorize button. get_current_user decodes the JWT and loads the user; any failure becomes 401. hashed_password never appears in responses because User does not include it.",
    },
    {
      title: "Role-based authorization and a protected router",
      scenario: "Only admins may list all users; students can only view their own profile.",
      steps: [
        "Add the code below to main.py from Example 3",
        "Log in as ravi (student) in Swagger and call GET /admin/users",
        "Log out, log in as asha (admin) and call it again",
      ],
      code: `from fastapi import APIRouter


def require_role(*roles: str):
    def checker(user: CurrentUser) -> User:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Not enough permissions")
        return user
    return checker


admin_router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_role("admin"))],
)


@admin_router.get("/users", response_model=list[User])
def all_users():
    return [User(**u) for u in USERS.values()]


@admin_router.delete("/users/{username}", status_code=204)
def delete_user(username: str):
    USERS.pop(username, None)


app.include_router(admin_router)`,
      result: "As ravi (student): GET /admin/users -> 403 {\"detail\":\"Not enough permissions\"}\nAs asha (admin): GET /admin/users -> [{\"username\":\"asha\",\"role\":\"admin\",\"disabled\":false},{\"username\":\"ravi\",\"role\":\"student\",\"disabled\":false}]\nWithout token: 401 Not authenticated",
      explanation: "require_role is a dependency factory returning a checker that depends on CurrentUser, so authentication runs first (401) and then authorization (403). Putting it in APIRouter(dependencies=...) protects every admin route at once - you cannot forget it on a new endpoint.",
    },
  ],
  interview: [
    { q: "Difference between authentication and authorization?", a: "Authentication verifies identity (who you are) via credentials like password/OTP/token. Authorization decides what an authenticated identity may access (roles, permissions). Failures map to 401 and 403 respectively.", level: "Easy" },
    { q: "What is a JWT and what are its parts?", a: "JSON Web Token: header.payload.signature, each Base64URL encoded. Header has alg/typ, payload has claims (sub, exp, iat, custom like role), signature = HMAC/RSA over header and payload with a secret/private key. It proves integrity and origin, not confidentiality.", level: "Easy" },
    { q: "Is JWT payload encrypted? What should not go inside?", a: "No, it is only Base64URL encoded and readable by anyone. Do not store passwords, card numbers, Aadhaar/PAN or other secrets. Store identifiers and minimal claims. If you need encryption use JWE.", level: "Medium" },
    { q: "Why hash passwords instead of encrypting them?", a: "Hashing is one-way; the server never needs the original password, only to verify it. Encryption is reversible, so a stolen key exposes all passwords. Use slow salted algorithms (Argon2, bcrypt, scrypt) to make brute force expensive.", level: "Medium" },
    { q: "What does OAuth2PasswordBearer do?", a: "It is a security dependency that extracts the token from the Authorization: Bearer header, returns 401 'Not authenticated' if missing, and registers the OAuth2 password flow in OpenAPI so Swagger shows an Authorize button pointing to tokenUrl. It does not validate the token - you do that in get_current_user.", level: "Medium" },
    { q: "Why does the /token endpoint use form data instead of JSON?", a: "The OAuth2 password flow specification requires username and password sent as application/x-www-form-urlencoded form fields. OAuth2PasswordRequestForm reads them (and optional scope, grant_type), and Swagger's Authorize dialog sends them this way.", level: "Medium" },
    { q: "How do you implement logout with stateless JWT?", a: "The client deletes the token. Because the server stores nothing, the token remains valid until exp. Solutions: short-lived access tokens with refresh tokens, a denylist of revoked token ids (jti) in Redis checked in get_current_user, or rotating a per-user token version stored in the DB.", level: "Hard" },
    { q: "Explain access tokens vs refresh tokens.", a: "Access token: short-lived (minutes), sent with every API call. Refresh token: long-lived (days), sent only to a /refresh endpoint to get a new access token, stored securely (httpOnly cookie), can be revoked and rotated. This limits damage if an access token leaks while keeping users logged in.", level: "Hard" },
    { q: "HS256 vs RS256?", a: "HS256 is symmetric: the same secret signs and verifies, so every verifying service needs the secret. RS256 is asymmetric: a private key signs (auth server only) and a public key verifies (any service), ideal for microservices and third-party verification.", level: "Hard" },
    { q: "Why always pass algorithms=[...] to jwt.decode?", a: "To prevent algorithm confusion attacks, e.g. a token with alg 'none' or an attacker switching RS256 to HS256 using the public key as HMAC secret. Explicitly allowing only the expected algorithm closes these holes.", level: "Hard" },
    { q: "Why return the same error for wrong username and wrong password?", a: "To avoid user enumeration: different messages would tell attackers which usernames/emails exist. Also combine with rate limiting and account lockout to stop brute-force attacks.", level: "Medium" },
    { q: "How would you add role-based access control in FastAPI?", a: "Store a role (or permissions) on the user and/or in the token claims. Create a dependency factory require_role('admin') that depends on get_current_user and raises 403 if the role does not match. Apply it per endpoint or on an APIRouter via dependencies=[...]. For fine-grained permissions use OAuth2 scopes with Security() and SecurityScopes.", level: "Medium" },
  ],
  practice: [
    {
      task: "Write a /register endpoint that accepts username and password (JSON), rejects duplicates with 409, stores the hashed password, and returns the user without the password.",
      hint: "Separate UserCreate and UserOut models; use password_hash.hash().",
      solution: `class UserCreate(BaseModel):
    username: str = Field(min_length=3)
    password: str = Field(min_length=8)


class UserOut(BaseModel):
    username: str
    role: str


@app.post("/register", response_model=UserOut, status_code=201)
def register(data: UserCreate):
    if data.username in USERS:
        raise HTTPException(409, "Username already taken")
    USERS[data.username] = {
        "username": data.username,
        "role": "student",
        "disabled": False,
        "hashed_password": password_hash.hash(data.password),
    }
    return USERS[data.username]`,
    },
    {
      task: "Move SECRET_KEY and token expiry to environment variables using pydantic-settings, with a .env file.",
      hint: "pip install pydantic-settings; class Settings(BaseSettings) with model_config = SettingsConfigDict(env_file='.env').",
      solution: `# .env  (add .env to .gitignore!)
# SECRET_KEY=3f9a...generated...
# ACCESS_TOKEN_EXPIRE_MINUTES=60

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
# use settings.secret_key and settings.access_token_expire_minutes`,
    },
    {
      task: "Add a refresh-token flow: /token returns both access_token (15 min) and refresh_token (7 days, with claim type='refresh'); POST /refresh accepts the refresh token and returns a new access token.",
      hint: "Add a 'type' claim and check it when decoding.",
      solution: `class RefreshIn(BaseModel):
    refresh_token: str


def create_token(sub: str, kind: str, delta: timedelta) -> str:
    exp = datetime.now(timezone.utc) + delta
    return jwt.encode({"sub": sub, "type": kind, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)


@app.post("/token")
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = authenticate(form.username, form.password)
    if not user:
        raise HTTPException(401, "Incorrect username or password")
    return {
        "access_token": create_token(user["username"], "access", timedelta(minutes=15)),
        "refresh_token": create_token(user["username"], "refresh", timedelta(days=7)),
        "token_type": "bearer",
    }


@app.post("/refresh")
def refresh(body: RefreshIn):
    try:
        payload = jwt.decode(body.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid refresh token")
    if payload.get("type") != "refresh":
        raise HTTPException(401, "Not a refresh token")
    return {"access_token": create_token(payload["sub"], "access", timedelta(minutes=15)),
            "token_type": "bearer"}

# Also check payload["type"] == "access" inside get_current_user.`,
    },
    {
      task: "Protect a /grades/{username} endpoint so students can only see their own grades, while admins can see anyone's.",
      hint: "Compare current_user.username with the path parameter unless role is admin.",
      solution: `GRADES = {"ravi": {"python": "A", "sql": "B+"}, "asha": {"python": "A+"}}


@app.get("/grades/{username}")
def grades(username: str, current_user: CurrentUser):
    if current_user.role != "admin" and current_user.username != username:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only view your own grades")
    if username not in GRADES:
        raise HTTPException(404, "No grades found")
    return {"username": username, "grades": GRADES[username]}`,
    },
  ],
  quiz: [
    { question: "Which part of a JWT prevents tampering?", options: ["Header", "Payload", "Signature", "Token type"], answer: 2, explanation: "The signature is computed with the secret; any change to header/payload breaks it." },
    { question: "Which status code should be returned when the token is missing or invalid?", options: ["400", "401", "403", "404"], answer: 1, explanation: "401 Unauthorized with the WWW-Authenticate: Bearer header." },
    { question: "OAuth2PasswordRequestForm reads credentials from...", options: ["JSON body", "Query string", "Form data", "Cookies"], answer: 2, explanation: "The OAuth2 password flow sends username and password as form fields." },
    { question: "Which is a recommended password hashing algorithm?", options: ["MD5", "SHA-1", "Base64", "Argon2"], answer: 3, explanation: "Argon2 (or bcrypt/scrypt) is slow and salted; MD5/SHA-1 are fast and unsafe; Base64 is just encoding." },
    { question: "The JWT claim that stores the expiry time is...", options: ["iat", "sub", "exp", "aud"], answer: 2, explanation: "exp = expiration time; PyJWT validates it automatically." },
    { question: "What does OAuth2PasswordBearer(tokenUrl=\"token\") do by itself?", options: ["Verifies the JWT signature", "Extracts the bearer token and enables Swagger's Authorize button", "Hashes passwords", "Creates users"], answer: 1, explanation: "It only reads the Authorization header; validation is your get_current_user dependency." },
  ],
};
