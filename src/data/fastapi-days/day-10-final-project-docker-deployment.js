export default {
  id: "day-10-final-project-docker-deployment",
  title: "Final Project: Task Manager REST API, Docker and Deployment",
  module: "Module 4: Project",
  day: 10,
  level: "Advanced",
  duration: "6 hours",
  summary: "Put everything together: build a Student Task Manager REST API with JWT auth, SQLAlchemy 2.0, routers, tests and settings; containerise it with Docker and docker compose; deploy it to Render or Railway; and prepare for interviews with a clear FastAPI vs Flask vs Django comparison.",
  objectives: [
    "Design endpoints, data models and folder structure for a real REST API project",
    "Implement auth, per-user task CRUD with filters and pagination using routers and dependencies",
    "Manage configuration with pydantic-settings and environment variables",
    "Write a production Dockerfile and docker-compose.yml with PostgreSQL",
    "Deploy to Render or Railway and verify with /health and /docs",
    "Explain FastAPI vs Flask vs Django confidently in interviews",
  ],
  theory: [
    {
      heading: "Project requirements and API design",
      content: "We build **TaskFlow**, a task manager for students. Every student registers, logs in and manages only their own tasks. Good API design starts on paper before code: list resources, endpoints, status codes and data models.\n\nREST conventions: use nouns for resources (/tasks, not /getTasks), HTTP methods for actions, plural names, proper status codes, filtering and pagination via query parameters, and versioning with /api/v1.",
      points: [
        "POST /api/v1/auth/register -> 201 user (no password)",
        "POST /api/v1/auth/token -> 200 {access_token, token_type}",
        "GET /api/v1/users/me -> current user",
        "GET /api/v1/tasks?status=pending&priority=high&skip=0&limit=10 -> own tasks only",
        "POST /api/v1/tasks -> 201, GET/PATCH/DELETE /api/v1/tasks/{id} -> 404 if not yours",
        "GET /health -> {status: ok} for load balancers",
      ],
      tip: "Return 404 (not 403) when a user requests another user's task id - this does not reveal that the task exists.",
    },
    {
      heading: "Folder structure",
      content: "A layered structure keeps responsibilities clear and is what reviewers look for in take-home assignments:",
      syntax: "taskflow/\n├── app/\n│   ├── __init__.py\n│   ├── main.py          # app, middleware, routers, lifespan\n│   ├── config.py        # Settings (pydantic-settings)\n│   ├── database.py      # engine, SessionLocal, Base, get_db\n│   ├── models.py        # User, Task (SQLAlchemy)\n│   ├── schemas.py       # Pydantic in/out models\n│   ├── security.py      # hashing, JWT, get_current_user\n│   └── routers/\n│       ├── __init__.py\n│       ├── auth.py\n│       └── tasks.py\n├── tests/\n│   ├── conftest.py\n│   └── test_tasks.py\n├── .env              # never commit\n├── .env.example\n├── .dockerignore\n├── Dockerfile\n├── docker-compose.yml\n├── requirements.txt\n└── README.md",
      points: [
        "routers = HTTP layer, models = DB layer, schemas = API contract",
        "security.py isolates all auth logic so it is reusable and testable",
        "README with setup steps, env variables and sample curl commands",
      ],
    },
    {
      heading: "Configuration with environment variables",
      content: "The same code runs on your laptop, in CI and in production; only configuration changes (Twelve-Factor App principle). Use `pydantic-settings` to read env variables with types and defaults. Locally values come from `.env`; on Render/Railway you set them in the dashboard.\n\nCommon settings: DATABASE_URL, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, CORS_ORIGINS. Commit a `.env.example` with dummy values and add `.env` to `.gitignore`.",
      syntax: "from pydantic_settings import BaseSettings, SettingsConfigDict\n\nclass Settings(BaseSettings):\n    database_url: str = \"sqlite:///./taskflow.db\"\n    secret_key: str\n    access_token_expire_minutes: int = 60\n    cors_origins: list[str] = [\"http://localhost:5173\"]\n    model_config = SettingsConfigDict(env_file=\".env\")",
    },
    {
      heading: "Docker basics for Python APIs",
      content: "Docker packages your app with its exact Python version and dependencies into an **image**; a running image is a **container**. 'It works on my machine' problems disappear because every environment runs the same image.\n\nKey Dockerfile ideas: start from a slim official image (python:3.12-slim), copy requirements.txt first and install (so this layer is cached when only code changes), copy the code, run as a non-root user, expose the port and start with `fastapi run` (or uvicorn). Use `.dockerignore` to exclude .venv, .git, __pycache__ and .env.\n\n**docker compose** runs multiple containers together, e.g. the API plus PostgreSQL, with one command.",
      points: [
        "docker build -t taskflow .",
        "docker run -p 8000:8000 --env-file .env taskflow",
        "docker compose up --build / docker compose down",
        "docker ps, docker logs <id>, docker exec -it <id> sh",
      ],
    },
    {
      heading: "Deployment to Render or Railway",
      content: "Both platforms build from your GitHub repository and give an HTTPS URL. Free tiers change often and may sleep after inactivity, so check current limits.\n\n**Render**: New > Web Service > connect repo. Either choose Docker (uses your Dockerfile) or Python runtime with build command `pip install -r requirements.txt` and start command `fastapi run app/main.py --host 0.0.0.0 --port $PORT`. Add a Render PostgreSQL database and set DATABASE_URL and SECRET_KEY in Environment.\n\n**Railway**: New Project > Deploy from GitHub; add a PostgreSQL plugin; Railway injects DATABASE_URL and PORT. It detects the Dockerfile automatically.\n\nAfter deploying: open /health and /docs, run Alembic migrations (or create_all for the demo), check logs, and set CORS_ORIGINS to your frontend URL.",
      tip: "Platforms provide the port in the PORT environment variable - always bind to 0.0.0.0 and that port, not 127.0.0.1:8000.",
    },
    {
      heading: "FastAPI vs Flask vs Django",
      content: "This comparison is asked in almost every Python backend interview. Answer with trade-offs, not opinions.\n\n**FastAPI**: ASGI, async-first, type hints + Pydantic validation, automatic OpenAPI docs, dependency injection. Best for REST/JSON APIs, microservices, ML model serving, high-concurrency I/O. You choose your own ORM, admin and migrations.\n\n**Flask**: WSGI micro-framework, minimal and flexible, huge extension ecosystem (Flask-SQLAlchemy, Flask-Login). Best for small/medium apps, server-rendered pages, prototypes. Validation and docs need extensions; async support exists but is limited.\n\n**Django**: 'batteries included' full-stack framework: ORM, migrations, admin panel, auth, forms, templates, security defaults. Django REST Framework (DRF) for APIs. Best for large content/business apps that need admin and fast CRUD development. Heavier and more opinionated; async support is improving.",
      points: [
        "Performance: FastAPI (async I/O) > Flask ≈ Django for concurrent I/O workloads",
        "Learning curve: Flask easiest, FastAPI moderate (type hints, async), Django largest surface",
        "Admin panel: built into Django only",
        "Auto API docs: built into FastAPI; Django/Flask need drf-spectacular/flasgger etc.",
        "Many companies use Django for the main app and FastAPI for ML/microservices",
      ],
    },
  ],
  examples: [
    {
      title: "Core files: config, database, models and schemas",
      scenario: "Set up the foundation of TaskFlow with users and tasks.",
      steps: [
        "mkdir taskflow && cd taskflow, create and activate a venv",
        "pip install \"fastapi[standard]\" sqlalchemy pydantic-settings pyjwt \"pwdlib[argon2]\" psycopg[binary] pytest",
        "pip freeze > requirements.txt",
        "Create .env with SECRET_KEY=<output of python -c \"import secrets; print(secrets.token_hex(32))\">",
        "Create the app/ files below",
      ],
      code: `# app/config.py
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./taskflow.db"
    secret_key: str = "dev-only-change-me"
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = ["http://localhost:5173"]
    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings() -> Settings:
    return Settings()

# app/database.py
from typing import Annotated
from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from app.config import get_settings

url = get_settings().database_url
if url.startswith("postgres://"):                    # some hosts use the old scheme
    url = url.replace("postgres://", "postgresql+psycopg://", 1)
elif url.startswith("postgresql://"):
    url = url.replace("postgresql://", "postgresql+psycopg://", 1)
args = {"check_same_thread": False} if url.startswith("sqlite") else {}
engine = create_engine(url, connect_args=args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


SessionDep = Annotated[Session, Depends(get_db)]

# app/models.py
import enum
from datetime import date, datetime
from sqlalchemy import ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Status(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    done = "done"


class Priority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(100))
    hashed_password: Mapped[str] = mapped_column(String(255))
    tasks: Mapped[list["Task"]] = relationship(back_populates="owner", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None]
    status: Mapped[Status] = mapped_column(default=Status.pending)
    priority: Mapped[Priority] = mapped_column(default=Priority.medium)
    due_date: Mapped[date | None]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    owner: Mapped["User"] = relationship(back_populates="tasks")

# app/schemas.py
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models import Priority, Status


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=8)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    full_name: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    priority: Priority = Priority.medium
    due_date: date | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    status: Status | None = None
    priority: Priority | None = None
    due_date: date | None = None


class TaskOut(TaskCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: Status
    created_at: datetime


class TaskPage(BaseModel):
    total: int
    items: list[TaskOut]`,
      result: "No output yet. Running python -c \"from app.models import Task; print(Task.__table__.columns.keys())\" prints ['id', 'title', 'description', 'status', 'priority', 'due_date', 'created_at', 'owner_id'].",
      explanation: "Settings read env variables with safe defaults for development. database.py normalises postgres URLs to the psycopg 3 driver and only applies the SQLite thread option for SQLite. Python Enums become constrained columns and dropdowns in Swagger. TaskPage wraps paginated results with a total count.",
    },
    {
      title: "Security and routers: auth and per-user task CRUD",
      scenario: "Implement registration, login, current user and task endpoints where each user sees only their own tasks.",
      steps: [
        "Create app/security.py, app/routers/auth.py, app/routers/tasks.py and app/main.py",
        "fastapi dev app/main.py",
        "In /docs: register, click Authorize (username = your email), create tasks, try filters",
      ],
      code: `# app/security.py
from datetime import datetime, timedelta, timezone
from typing import Annotated
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from app.config import get_settings
from app.database import SessionDep
from app.models import User

password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")
ALGORITHM = "HS256"


def create_access_token(user_id: int) -> str:
    s = get_settings()
    exp = datetime.now(timezone.utc) + timedelta(minutes=s.access_token_expire_minutes)
    return jwt.encode({"sub": str(user_id), "exp": exp}, s.secret_key, algorithm=ALGORITHM)


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: SessionDep) -> User:
    error = HTTPException(status.HTTP_401_UNAUTHORIZED, "Could not validate credentials",
                          headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, get_settings().secret_key, algorithms=[ALGORITHM])
        user = db.get(User, int(payload["sub"]))
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise error
    if user is None:
        raise error
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]

# app/routers/auth.py
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from app.database import SessionDep
from app.models import User
from app.schemas import Token, UserCreate, UserOut
from app.security import CurrentUser, create_access_token, password_hash

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(data: UserCreate, db: SessionDep):
    if db.scalar(select(User).where(User.email == data.email)):
        raise HTTPException(409, "Email already registered")
    user = User(email=data.email, full_name=data.full_name,
                hashed_password=password_hash.hash(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/token", response_model=Token)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], db: SessionDep):
    user = db.scalar(select(User).where(User.email == form.username))
    if not user or not password_hash.verify(form.password, user.hashed_password):
        raise HTTPException(401, "Incorrect email or password",
                            headers={"WWW-Authenticate": "Bearer"})
    return {"access_token": create_access_token(user.id), "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser):
    return user

# app/routers/tasks.py
from typing import Annotated
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import func, select
from app.database import SessionDep
from app.models import Priority, Status, Task
from app.schemas import TaskCreate, TaskOut, TaskPage, TaskUpdate
from app.security import CurrentUser

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def own_task_or_404(db, task_id: int, user) -> Task:
    task = db.get(Task, task_id)
    if task is None or task.owner_id != user.id:
        raise HTTPException(404, "Task not found")
    return task


@router.post("", response_model=TaskOut, status_code=201)
def create_task(data: TaskCreate, db: SessionDep, user: CurrentUser):
    task = Task(**data.model_dump(), owner_id=user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("", response_model=TaskPage)
def list_tasks(db: SessionDep, user: CurrentUser,
               status: Status | None = None, priority: Priority | None = None,
               q: str | None = None,
               skip: Annotated[int, Query(ge=0)] = 0,
               limit: Annotated[int, Query(ge=1, le=100)] = 10):
    stmt = select(Task).where(Task.owner_id == user.id)
    if status:
        stmt = stmt.where(Task.status == status)
    if priority:
        stmt = stmt.where(Task.priority == priority)
    if q:
        stmt = stmt.where(Task.title.ilike(f"%{q}%"))
    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    items = db.scalars(stmt.order_by(Task.created_at.desc()).offset(skip).limit(limit)).all()
    return {"total": total, "items": items}


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: SessionDep, user: CurrentUser):
    return own_task_or_404(db, task_id, user)


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, data: TaskUpdate, db: SessionDep, user: CurrentUser):
    task = own_task_or_404(db, task_id, user)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: SessionDep, user: CurrentUser):
    db.delete(own_task_or_404(db, task_id, user))
    db.commit()

# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import Base, engine
from app.routers import auth, tasks


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)   # use Alembic in real production
    yield


app = FastAPI(title="TaskFlow API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=get_settings().cors_origins,
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")


@app.get("/health", tags=["System"])
def health():
    return {"status": "ok"}`,
      result: "POST /api/v1/auth/register {\"email\":\"asha@gmail.com\",\"full_name\":\"Asha Patil\",\"password\":\"secret123\"} -> 201 {\"id\":1,\"email\":\"asha@gmail.com\",\"full_name\":\"Asha Patil\"}\nAuthorize -> POST /api/v1/tasks {\"title\":\"Finish FastAPI project\",\"priority\":\"high\"} -> 201 {\"title\":\"Finish FastAPI project\",\"description\":null,\"priority\":\"high\",\"due_date\":null,\"id\":1,\"status\":\"pending\",\"created_at\":\"2026-11-18T10:40:12\"}\nGET /api/v1/tasks?priority=high -> {\"total\":1,\"items\":[...]}\nAnother user GET /api/v1/tasks/1 -> 404 {\"detail\":\"Task not found\"}",
      explanation: "Every task query is filtered by owner_id from the JWT user, which prevents IDOR (Insecure Direct Object Reference) bugs. The count uses the same filtered statement as a subquery so total matches the filters. Routers keep auth and tasks separate; main.py only wires things together.",
    },
    {
      title: "Tests for the project",
      scenario: "Prove that auth, CRUD and user isolation work, using an in-memory database.",
      steps: [
        "Create tests/conftest.py and tests/test_tasks.py",
        "Add an empty tests/__init__.py",
        "Run pytest -v from the project root",
      ],
      code: `# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app.main import app

engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestSession = sessionmaker(bind=engine, expire_on_commit=False)


@pytest.fixture
def client():
    Base.metadata.create_all(engine)

    def override():
        db = TestSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)


def auth_headers(client, email="asha@gmail.com"):
    client.post("/api/v1/auth/register",
                json={"email": email, "full_name": "Test User", "password": "secret123"})
    token = client.post("/api/v1/auth/token",
                        data={"username": email, "password": "secret123"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# tests/test_tasks.py
from tests.conftest import auth_headers


def test_requires_login(client):
    assert client.get("/api/v1/tasks").status_code == 401


def test_create_and_filter(client):
    h = auth_headers(client)
    client.post("/api/v1/tasks", json={"title": "A", "priority": "high"}, headers=h)
    client.post("/api/v1/tasks", json={"title": "B", "priority": "low"}, headers=h)
    r = client.get("/api/v1/tasks?priority=high", headers=h)
    assert r.json()["total"] == 1 and r.json()["items"][0]["title"] == "A"


def test_mark_done(client):
    h = auth_headers(client)
    tid = client.post("/api/v1/tasks", json={"title": "X"}, headers=h).json()["id"]
    r = client.patch(f"/api/v1/tasks/{tid}", json={"status": "done"}, headers=h)
    assert r.json()["status"] == "done"


def test_users_cannot_see_each_others_tasks(client):
    h1 = auth_headers(client, "a@gmail.com")
    h2 = auth_headers(client, "b@gmail.com")
    tid = client.post("/api/v1/tasks", json={"title": "Private"}, headers=h1).json()["id"]
    assert client.get(f"/api/v1/tasks/{tid}", headers=h2).status_code == 404
    assert client.delete(f"/api/v1/tasks/{tid}", headers=h2).status_code == 404`,
      result: "$ pytest -v\ntests/test_tasks.py::test_requires_login PASSED\ntests/test_tasks.py::test_create_and_filter PASSED\ntests/test_tasks.py::test_mark_done PASSED\ntests/test_tasks.py::test_users_cannot_see_each_others_tasks PASSED\n==================== 4 passed in 1.12s ====================",
      explanation: "The fixture swaps the real DB for an in-memory one, and the helper performs the real register + login flow so JWT handling is tested too. The isolation test is the most important security test in a multi-user API.",
    },
    {
      title: "Dockerfile and docker compose with PostgreSQL",
      scenario: "Run the API and a PostgreSQL database in containers with one command.",
      steps: [
        "Install Docker Desktop (Windows/macOS) or Docker Engine (Linux)",
        "Create Dockerfile, .dockerignore and docker-compose.yml in the project root",
        "docker compose up --build",
        "Open http://localhost:8000/docs; stop with docker compose down (add -v to delete DB data)",
      ],
      code: `# Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    PORT=8000

WORKDIR /code

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app

RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
CMD fastapi run app/main.py --host 0.0.0.0 --port $PORT

# .dockerignore
.venv
__pycache__
*.pyc
.git
.env
*.db
tests

# docker-compose.yml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: taskflow
      POSTGRES_PASSWORD: taskflow
      POSTGRES_DB: taskflow
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U taskflow"]
      interval: 5s
      retries: 5

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+psycopg://taskflow:taskflow@db:5432/taskflow
      SECRET_KEY: change-me-in-production
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:`,
      result: "db-1   | database system is ready to accept connections\napi-1  | INFO:     Started server process [1]\napi-1  | INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)\nhttp://localhost:8000/health -> {\"status\":\"ok\"}\nhttp://localhost:8000/docs -> TaskFlow API 1.0.0 with Auth, Tasks and System groups",
      explanation: "Copying requirements.txt before the code lets Docker cache the pip install layer. The container runs as a non-root user and binds to 0.0.0.0 on $PORT so it works locally (8000) and on platforms that inject PORT. Inside compose, the API reaches Postgres by the service name db. The healthcheck makes the API wait until the database is ready, and the named volume keeps data between restarts.",
    },
    {
      title: "Deploy to Render (or Railway) from GitHub",
      scenario: "Publish TaskFlow on the internet with an HTTPS URL to share in your resume and LinkedIn.",
      steps: [
        "git init, add .gitignore (.venv, .env, *.db, __pycache__), commit and push to a GitHub repository",
        "Render: New > PostgreSQL (free) and copy its Internal Database URL",
        "Render: New > Web Service > connect the repo > Language: Docker (it uses your Dockerfile)",
        "Environment: DATABASE_URL=<internal URL>, SECRET_KEY=<random 64 hex chars>, CORS_ORIGINS=[\"https://your-frontend.vercel.app\"]",
        "Deploy and watch the logs; open https://<service>.onrender.com/health and /docs",
        "Railway alternative: New Project > Deploy from GitHub repo > + New > Database > PostgreSQL; add variable DATABASE_URL=\${{Postgres.DATABASE_URL}} and SECRET_KEY; Settings > Networking > Generate Domain",
      ],
      code: `# Without Docker on Render (Python runtime):
#   Build Command:  pip install -r requirements.txt
#   Start Command:  fastapi run app/main.py --host 0.0.0.0 --port $PORT

# Smoke test the live API from your terminal
BASE=https://taskflow-api.onrender.com

curl $BASE/health

curl -X POST $BASE/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"demo@gmail.com","full_name":"Demo User","password":"demo12345"}'

TOKEN=$(curl -s -X POST $BASE/api/v1/auth/token \\
  -d "username=demo@gmail.com&password=demo12345" | python -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

curl -H "Authorization: Bearer $TOKEN" $BASE/api/v1/tasks

# README.md checklist
# - Live URL + /docs link
# - Tech stack: FastAPI, SQLAlchemy 2.0, PostgreSQL, JWT, Docker, pytest
# - Local setup: venv / docker compose up
# - Env variables table (.env.example)
# - Sample requests and screenshots of Swagger`,
      result: "curl $BASE/health -> {\"status\":\"ok\"}\nregister -> {\"id\":1,\"email\":\"demo@gmail.com\",\"full_name\":\"Demo User\"}\ntasks -> {\"total\":0,\"items\":[]}\nhttps://taskflow-api.onrender.com/docs shows Swagger UI over HTTPS\n(On free plans the first request after inactivity may take 30-60 seconds while the service wakes up.)",
      explanation: "The platform builds the Docker image from GitHub on every push (continuous deployment). Secrets live in the platform's environment settings, not in code. Railway's reference variable syntax links the database URL automatically, and database.py converts postgresql:// to the psycopg driver. Smoke tests confirm the deployment really works end to end.",
    },
  ],
  interview: [
    { q: "Compare FastAPI, Flask and Django.", a: "FastAPI: ASGI, async-first, Pydantic validation, auto OpenAPI docs, DI; best for APIs/microservices/ML serving. Flask: WSGI micro-framework, minimal and flexible, extensions for everything; best for small apps and prototypes. Django: batteries-included (ORM, migrations, admin, auth, templates), DRF for APIs; best for large business/content apps needing admin and fast CRUD. Choice depends on project needs, team skills and ecosystem.", level: "Medium" },
    { q: "When would you NOT choose FastAPI?", a: "When you need a full-stack app with server-rendered pages, built-in admin panel, auth and ORM out of the box quickly - Django is more productive there. Also for tiny scripts or teams already standardised on Django/Flask where switching adds cost.", level: "Medium" },
    { q: "Walk me through your FastAPI project architecture.", a: "Layers: routers (HTTP, validation via schemas), dependencies (get_db, get_current_user), models (SQLAlchemy), schemas (Pydantic in/out), security (hashing, JWT), config (pydantic-settings). JWT auth with OAuth2 password flow, per-user filtering of tasks, pagination and filters, consistent status codes, pytest tests with dependency overrides and in-memory DB, Docker + Postgres, deployed on Render with env-based config.", level: "Hard" },
    { q: "What is IDOR and how did you prevent it?", a: "Insecure Direct Object Reference: a user accesses another user's resource by changing an id in the URL. Prevent by always filtering queries by the authenticated user's id (owner_id == current_user.id) and returning 404 for resources not owned by them.", level: "Hard" },
    { q: "Explain the Dockerfile layers you wrote and why order matters.", a: "Base image python:3.12-slim, set env vars, WORKDIR, copy requirements.txt and pip install, then copy code, create non-root user, CMD to start. Docker caches layers; since dependencies change rarely, installing them before copying code means code changes only rebuild the last layers, making builds much faster.", level: "Medium" },
    { q: "Image vs container? What does docker compose do?", a: "An image is a read-only template (app + dependencies); a container is a running instance of an image with its own process and writable layer. docker compose defines and runs multi-container apps (API + DB + Redis) from a YAML file with networks, volumes, env and dependencies.", level: "Easy" },
    { q: "How do you manage secrets and configuration across environments?", a: "Environment variables read via pydantic-settings; .env for local dev (gitignored), .env.example committed; secrets set in the hosting dashboard or a secrets manager (AWS Secrets Manager, Vault). Never hardcode SECRET_KEY or DB passwords.", level: "Easy" },
    { q: "How do you run FastAPI in production?", a: "fastapi run (Uvicorn) with multiple workers (--workers N) or Gunicorn with UvicornWorker, behind a reverse proxy/load balancer (Nginx, platform router) with HTTPS. Use Docker, health checks, structured logging, env-based config, Alembic migrations, and horizontal scaling with multiple containers.", level: "Medium" },
    { q: "Why use Alembic instead of create_all in production?", a: "Alembic versions schema changes as migration scripts (upgrade/downgrade), can autogenerate diffs from models, and applies changes like adding columns without losing data. create_all only creates missing tables and cannot alter existing ones.", level: "Medium" },
    { q: "How would you scale this API to many users?", a: "Stateless app (JWT) so multiple instances behind a load balancer work; PostgreSQL with indexes (owner_id, status) and connection pooling; caching hot reads in Redis; background jobs in Celery; pagination everywhere; async I/O for external calls; monitoring (logs, metrics, tracing) to find bottlenecks.", level: "Hard" },
    { q: "Why bind to 0.0.0.0 and $PORT on cloud platforms?", a: "127.0.0.1 only accepts connections from inside the container, so the platform's router cannot reach it. 0.0.0.0 listens on all interfaces. Platforms assign the port dynamically via the PORT environment variable, so the app must read it.", level: "Easy" },
    { q: "Does Django support async now? Does that remove FastAPI's advantage?", a: "Django supports async views since 3.1 and an async ORM interface since 4.1, but parts of the stack (some ORM operations, many third-party packages) are still sync internally. FastAPI remains lighter, async-native and offers type-driven validation and docs. Both are valid; choose based on needs.", level: "Hard" },
  ],
  practice: [
    {
      task: "Add GET /api/v1/tasks/stats that returns the current user's task counts by status, e.g. {\"pending\": 3, \"in_progress\": 1, \"done\": 5}.",
      hint: "select(Task.status, func.count()).where(owner).group_by(Task.status). Declare it before /{task_id}.",
      solution: `@router.get("/stats")
def task_stats(db: SessionDep, user: CurrentUser):
    rows = db.execute(
        select(Task.status, func.count(Task.id))
        .where(Task.owner_id == user.id)
        .group_by(Task.status)
    ).all()
    stats = {s.value: 0 for s in Status}
    for status_value, count in rows:
        stats[status_value.value] = count
    return stats`,
    },
    {
      task: "Add GET /api/v1/tasks/overdue returning tasks whose due_date is before today and status is not done.",
      hint: "date.today() and Task.status != Status.done.",
      solution: `from datetime import date


@router.get("/overdue", response_model=list[TaskOut])
def overdue_tasks(db: SessionDep, user: CurrentUser):
    stmt = (select(Task)
            .where(Task.owner_id == user.id,
                   Task.due_date < date.today(),
                   Task.status != Status.done)
            .order_by(Task.due_date))
    return db.scalars(stmt).all()`,
    },
    {
      task: "Set up Alembic migrations for the project instead of create_all.",
      hint: "alembic init, point env.py to Base.metadata and the settings URL, then autogenerate.",
      solution: `pip install alembic
alembic init migrations

# migrations/env.py (edit)
from app.config import get_settings
from app.database import Base
from app import models  # noqa: F401  (registers tables)

config.set_main_option("sqlalchemy.url", get_settings().database_url)
target_metadata = Base.metadata

# commands
alembic revision --autogenerate -m "create users and tasks"
alembic upgrade head

# Remove create_all from lifespan, and run "alembic upgrade head"
# before starting the app (e.g. Render pre-deploy command).`,
    },
    {
      task: "Add a GitHub Actions workflow that runs pytest on every push.",
      hint: "Create .github/workflows/tests.yml using actions/setup-python.",
      solution: `# .github/workflows/tests.yml
name: tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: pytest -v
        env:
          SECRET_KEY: test-secret`,
    },
    {
      task: "Prepare a 60-second interview pitch explaining your project and one technical challenge you solved.",
      hint: "Problem -> stack -> key features -> challenge -> result/link.",
      solution: `"I built TaskFlow, a multi-user task manager REST API using FastAPI,
SQLAlchemy 2.0 and PostgreSQL. Users register and log in with the OAuth2
password flow; passwords are hashed with Argon2 and requests are authorised
with short-lived JWT tokens. The API supports filtering, search and
pagination, and every query is scoped to the logged-in user to prevent IDOR.
I structured it with APIRouters, dependency injection and pydantic-settings,
wrote pytest tests using dependency_overrides and an in-memory SQLite DB, and
containerised it with Docker and docker compose. It is deployed on Render
with automatic deploys from GitHub.

One challenge: my paginated count did not match the filters. I fixed it by
counting over the same filtered statement as a subquery, and added a test
for it. Live docs: https://taskflow-api.onrender.com/docs"`,
    },
  ],
  quiz: [
    { question: "Which framework includes a built-in admin panel?", options: ["FastAPI", "Flask", "Django", "Starlette"], answer: 2, explanation: "Django ships with django.contrib.admin; FastAPI and Flask need third-party packages." },
    { question: "Why copy requirements.txt and run pip install before copying the app code in a Dockerfile?", options: ["It is required syntax", "To reuse the cached dependency layer when only code changes", "To reduce image security", "Docker cannot copy folders first"], answer: 1, explanation: "Layer caching makes rebuilds fast when dependencies have not changed." },
    { question: "On Render/Railway, the app should listen on...", options: ["127.0.0.1:8000", "0.0.0.0 and the PORT environment variable", "localhost:5173", "Any random port"], answer: 1, explanation: "The platform routes traffic to 0.0.0.0:$PORT inside the container." },
    { question: "A user requests GET /tasks/15 which belongs to another user. Best response?", options: ["200 with the task", "403 with owner details", "404 Task not found", "500"], answer: 2, explanation: "404 avoids revealing that the resource exists and prevents IDOR." },
    { question: "Where should SECRET_KEY be stored for production?", options: ["Hardcoded in main.py", "In the Git repository README", "In environment variables / platform secrets", "In the JWT payload"], answer: 2, explanation: "Secrets belong in environment variables or a secrets manager, never in code." },
    { question: "Inside docker compose, how does the api service reach PostgreSQL?", options: ["localhost:5432", "db:5432 (service name)", "127.0.0.1:8000", "postgres.com"], answer: 1, explanation: "Compose creates a network where services resolve each other by service name." },
  ],
};
