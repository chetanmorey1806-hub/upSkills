export default {
  id: "day-06-database-crud-sqlalchemy",
  title: "Database CRUD with SQLAlchemy 2.0 and SQLite",
  module: "Module 2: Building APIs",
  day: 6,
  level: "Intermediate",
  duration: "4 hours",
  summary: "Connect FastAPI to a real database using SQLAlchemy 2.0 and SQLite: set up the engine and session, define ORM models with Mapped and mapped_column, create a get_db yield dependency, separate Pydantic schemas from ORM models, and build complete Create-Read-Update-Delete endpoints with relationships.",
  objectives: [
    "Explain ORM, engine, session and the project structure for a database-backed API",
    "Define SQLAlchemy 2.0 models with DeclarativeBase, Mapped and mapped_column",
    "Provide a session per request with a yield dependency",
    "Write Pydantic schemas with from_attributes=True to return ORM objects",
    "Implement full CRUD with select(), session.get(), commit, refresh and delete",
    "Model one-to-many relationships and know when to use Alembic migrations",
  ],
  theory: [
    {
      heading: "ORM, engine and session",
      content: "An **ORM** (Object Relational Mapper) maps Python classes to tables and objects to rows, so you write `db.add(Student(name=\"Asha\"))` instead of raw INSERT statements. SQLAlchemy is the most popular Python ORM, and version 2.0 introduced a modern, fully typed API.\n\nThree key objects:\n**Engine** - knows how to connect to the database (URL + connection pool). Create once per app.\n**Session** - a workspace for one unit of work: you add/modify objects and then commit them in a transaction. Create one per request and close it afterwards.\n**sessionmaker** - a factory that creates sessions with the same settings.",
      syntax: "from sqlalchemy import create_engine\nfrom sqlalchemy.orm import sessionmaker\n\nDATABASE_URL = \"sqlite:///./school.db\"\nengine = create_engine(DATABASE_URL, connect_args={\"check_same_thread\": False})\nSessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)",
      points: [
        "SQLite: sqlite:///./app.db (file) - no server needed, perfect for learning",
        "PostgreSQL: postgresql+psycopg://user:pass@localhost:5432/dbname",
        "MySQL: mysql+pymysql://user:pass@localhost:3306/dbname",
        "check_same_thread=False is needed only for SQLite because FastAPI may use the session from a different thread",
      ],
    },
    {
      heading: "Project structure",
      content: "Keep database code separate from routes. A common beginner-friendly layout:\n\n`database.py` - engine, SessionLocal, Base, get_db\n`models.py` - SQLAlchemy ORM classes (tables)\n`schemas.py` - Pydantic models (API input/output)\n`crud.py` - functions that talk to the DB (optional but clean)\n`main.py` - FastAPI app and routes\n\nThe key idea: **models** describe the database, **schemas** describe the API. They look similar but serve different purposes, and keeping them separate lets you hide columns and validate input.",
      tip: "SQLModel (by the FastAPI author) merges both into one class. It is nice, but interviewers expect you to understand plain SQLAlchemy + Pydantic.",
    },
    {
      heading: "Defining models in SQLAlchemy 2.0",
      content: "Create a `Base` class from `DeclarativeBase`. Each model sets `__tablename__` and declares columns with `Mapped[type]` annotations and `mapped_column(...)` for options. `Mapped[str]` means NOT NULL; `Mapped[str | None]` means nullable. Call `Base.metadata.create_all(bind=engine)` to create tables that do not exist yet.",
      syntax: "from sqlalchemy import String\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Student(Base):\n    __tablename__ = \"students\"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    name: Mapped[str] = mapped_column(String(100))\n    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)\n    city: Mapped[str | None]",
      points: [
        "primary_key=True on an int column gives auto-increment",
        "unique=True, index=True, nullable=..., default=..., server_default=...",
        "create_all never alters existing tables - use Alembic migrations for schema changes",
      ],
    },
    {
      heading: "Session per request with a yield dependency",
      content: "Each request should get its own session and close it at the end. This is the classic yield dependency from Day 5. Declare it with Annotated to reuse as `SessionDep`.\n\nWe use normal `def` endpoints because the standard SQLAlchemy Session is synchronous (blocking). FastAPI runs def endpoints in a threadpool, so the event loop is not blocked. For async drivers you would use `AsyncSession` with `create_async_engine` and `async def` endpoints.",
      syntax: "def get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()\n\nSessionDep = Annotated[Session, Depends(get_db)]",
    },
    {
      heading: "CRUD operations in SQLAlchemy 2.0 style",
      content: "**Create**: `obj = Student(**data.model_dump()); db.add(obj); db.commit(); db.refresh(obj)` - refresh loads generated values like id.\n**Read one**: `db.get(Student, id)` returns the object or None.\n**Read many**: `db.scalars(select(Student).where(Student.city == \"Pune\").offset(skip).limit(limit)).all()`.\n**Update**: change attributes (`setattr(obj, key, value)`), then commit.\n**Delete**: `db.delete(obj); db.commit()`.\n\nIf a commit fails (e.g. unique constraint), catch `IntegrityError`, call `db.rollback()` and return 409. The old `db.query(Student).filter(...)` style still works but is legacy in 2.0.",
      syntax: "from sqlalchemy import select, func\n\nstmt = select(Student).where(Student.name.ilike(\"%sh%\")).order_by(Student.id.desc())\nstudents = db.scalars(stmt).all()\ncount = db.scalar(select(func.count()).select_from(Student))",
    },
    {
      heading: "Schemas with from_attributes and relationships",
      content: "Pydantic reads dicts by default. To let a response model read attributes from ORM objects, set `model_config = ConfigDict(from_attributes=True)` (this was `orm_mode = True` in Pydantic v1). Then you can return ORM objects directly with `response_model=StudentOut`.\n\nRelationships: a Student has many Enrollments/Tasks. Use `ForeignKey` on the child and `relationship()` with `back_populates` on both sides. Nested schemas (e.g. StudentWithTasks containing list[TaskOut]) will read the relationship automatically. Beware of the N+1 query problem when listing; use `selectinload()` to load children efficiently.",
      syntax: "class Task(Base):\n    __tablename__ = \"tasks\"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    title: Mapped[str]\n    student_id: Mapped[int] = mapped_column(ForeignKey(\"students.id\"))\n    student: Mapped[\"Student\"] = relationship(back_populates=\"tasks\")\n\n# in Student:\n    tasks: Mapped[list[\"Task\"]] = relationship(back_populates=\"student\", cascade=\"all, delete-orphan\")",
      tip: "SQLite does not enforce foreign keys unless you enable PRAGMA foreign_keys=ON. PostgreSQL/MySQL enforce them by default.",
    },
  ],
  examples: [
    {
      title: "Project setup: database.py, models.py and schemas.py",
      scenario: "Build the foundation of a Student API backed by SQLite.",
      steps: [
        "mkdir student_api && cd student_api, create and activate a venv",
        "pip install \"fastapi[standard]\" sqlalchemy",
        "Create database.py, models.py and schemas.py with the code below",
        "These files are used by the next example (main.py)",
      ],
      code: `# ---------- database.py ----------
from typing import Annotated

from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DATABASE_URL = "sqlite:///./school.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, echo=True)
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

# ---------- models.py ----------
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    city: Mapped[str | None] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(default=True)

# ---------- schemas.py ----------
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class StudentBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    city: str | None = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2)
    email: EmailStr | None = None
    city: str | None = None
    is_active: bool | None = None


class StudentOut(StudentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_active: bool`,
      result: "No output yet - these modules are imported by main.py. With echo=True, every SQL statement will be printed in the terminal once the app runs, which is great for learning.",
      explanation: "database.py holds infrastructure, models.py describes the table, schemas.py describes the API contract. StudentUpdate has all-optional fields for PATCH. from_attributes=True allows StudentOut to be built from a Student ORM object.",
    },
    {
      title: "Complete CRUD endpoints",
      scenario: "Expose create, list, get, update and delete for students.",
      steps: [
        "Create main.py next to the files from Example 1",
        "fastapi dev main.py - school.db is created on startup",
        "Use /docs to POST two students, list them, PATCH one, DELETE one",
        "Optional: open school.db with the VS Code 'SQLite Viewer' extension or DB Browser for SQLite",
      ],
      code: `# ---------- main.py ----------
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

import models
from database import Base, SessionDep, engine
from schemas import StudentCreate, StudentOut, StudentUpdate


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)   # create tables at startup
    yield


app = FastAPI(title="Student API", lifespan=lifespan)


def get_student_or_404(db, student_id: int) -> models.Student:
    student = db.get(models.Student, student_id)
    if student is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Student not found")
    return student


@app.post("/students", response_model=StudentOut, status_code=201)
def create_student(data: StudentCreate, db: SessionDep):
    student = models.Student(**data.model_dump())
    db.add(student)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    db.refresh(student)
    return student


@app.get("/students", response_model=list[StudentOut])
def list_students(db: SessionDep, city: str | None = None,
                  skip: int = Query(0, ge=0), limit: int = Query(10, le=100)):
    stmt = select(models.Student)
    if city:
        stmt = stmt.where(models.Student.city == city)
    stmt = stmt.order_by(models.Student.id).offset(skip).limit(limit)
    return db.scalars(stmt).all()


@app.get("/students/{student_id}", response_model=StudentOut)
def read_student(student_id: int, db: SessionDep):
    return get_student_or_404(db, student_id)


@app.patch("/students/{student_id}", response_model=StudentOut)
def update_student(student_id: int, data: StudentUpdate, db: SessionDep):
    student = get_student_or_404(db, student_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    return student


@app.delete("/students/{student_id}", status_code=204)
def delete_student(student_id: int, db: SessionDep):
    student = get_student_or_404(db, student_id)
    db.delete(student)
    db.commit()`,
      result: "POST {\"name\":\"Asha\",\"email\":\"asha@gmail.com\",\"city\":\"Pune\"} -> 201 {\"name\":\"Asha\",\"email\":\"asha@gmail.com\",\"city\":\"Pune\",\"id\":1,\"is_active\":true}\nSame email again -> 409 {\"detail\":\"Email already registered\"}\nGET /students?city=Pune -> [ {...Asha...} ]\nPATCH /students/1 {\"city\":\"Mumbai\"} -> city updated, other fields unchanged\nDELETE /students/1 -> 204; GET /students/1 -> 404\nTerminal shows SQL like: INSERT INTO students (name, email, city, is_active) VALUES (?, ?, ?, ?)",
      explanation: "lifespan runs create_all once at startup. Each endpoint receives its own session via SessionDep. db.refresh loads the generated id. The unique email constraint is enforced by the DB and translated to 409. PATCH uses exclude_unset so only sent fields change.",
    },
    {
      title: "One-to-many relationship: students and tasks",
      scenario: "Each student has many tasks. Return a student with nested tasks.",
      steps: [
        "Add the Task model and update Student in models.py",
        "Add TaskCreate, TaskOut and StudentWithTasks in schemas.py",
        "Delete school.db (create_all does not alter existing tables) and restart",
        "POST /students/1/tasks then GET /students/1/tasks-detail",
      ],
      code: `# ---------- models.py (additions) ----------
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship


class Student(Base):
    __tablename__ = "students"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(120), unique=True)
    city: Mapped[str | None] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(default=True)
    tasks: Mapped[list["Task"]] = relationship(back_populates="student", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    done: Mapped[bool] = mapped_column(default=False)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    student: Mapped["Student"] = relationship(back_populates="tasks")

# ---------- schemas.py (additions) ----------
class TaskCreate(BaseModel):
    title: str


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    done: bool


class StudentWithTasks(StudentOut):
    tasks: list[TaskOut] = []

# ---------- main.py (additions) ----------
from sqlalchemy.orm import selectinload


@app.post("/students/{student_id}/tasks", response_model=TaskOut, status_code=201)
def add_task(student_id: int, data: TaskCreate, db: SessionDep):
    get_student_or_404(db, student_id)
    task = models.Task(title=data.title, student_id=student_id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.get("/students/{student_id}/tasks-detail", response_model=StudentWithTasks)
def student_with_tasks(student_id: int, db: SessionDep):
    stmt = (select(models.Student)
            .options(selectinload(models.Student.tasks))
            .where(models.Student.id == student_id))
    student = db.scalars(stmt).first()
    if not student:
        raise HTTPException(404, "Student not found")
    return student`,
      result: "POST /students/1/tasks {\"title\":\"Finish FastAPI Day 6\"} -> 201 {\"id\":1,\"title\":\"Finish FastAPI Day 6\",\"done\":false}\nGET /students/1/tasks-detail -> {\"name\":\"Asha\",\"email\":\"asha@gmail.com\",\"city\":\"Pune\",\"id\":1,\"is_active\":true,\"tasks\":[{\"id\":1,\"title\":\"Finish FastAPI Day 6\",\"done\":false}]}",
      explanation: "ForeignKey links tasks.student_id to students.id; relationship gives Python attributes student.tasks and task.student. cascade='all, delete-orphan' deletes tasks when a student is deleted. selectinload fetches all tasks in one extra query, avoiding N+1 queries when listing many students.",
    },
    {
      title: "Search, count and simple statistics with select()",
      scenario: "An admin dashboard needs total students, students per city, and a name search.",
      steps: [
        "Add the endpoints to main.py",
        "Create a few students in different cities",
        "Open /stats and /students/search?q=as",
      ],
      code: `from sqlalchemy import func, select


@app.get("/stats")
def stats(db: SessionDep):
    total = db.scalar(select(func.count()).select_from(models.Student))
    rows = db.execute(
        select(models.Student.city, func.count(models.Student.id))
        .group_by(models.Student.city)
        .order_by(func.count(models.Student.id).desc())
    ).all()
    return {"total": total, "by_city": {city or "Unknown": n for city, n in rows}}


@app.get("/students/search", response_model=list[StudentOut])
def search(q: str, db: SessionDep):
    stmt = select(models.Student).where(models.Student.name.ilike(f"%{q}%"))
    return db.scalars(stmt).all()`,
      result: "/stats -> {\"total\":4,\"by_city\":{\"Pune\":2,\"Mumbai\":1,\"Unknown\":1}}\n/students/search?q=as -> [{\"name\":\"Asha\",...}]\n(Note: declare /students/search ABOVE /students/{student_id} or it will be matched as an id and return 422.)",
      explanation: "db.scalar returns a single value; db.execute(...).all() returns Row tuples for multi-column queries. ilike is case-insensitive LIKE. The bound parameter prevents SQL injection even though the search text comes from the user. Remember route ordering.",
    },
  ],
  interview: [
    { q: "What is an ORM and what are its pros and cons?", a: "Object Relational Mapper maps classes to tables and objects to rows. Pros: Python code instead of SQL strings, protection from SQL injection via bound parameters, database portability, relationships as attributes. Cons: can generate inefficient queries (N+1), learning curve, complex reports may still need raw SQL.", level: "Easy" },
    { q: "Difference between SQLAlchemy model and Pydantic schema?", a: "SQLAlchemy model defines the database table (columns, keys, relationships) and is used to persist data. Pydantic schema defines the API contract: what the client sends and receives, with validation. They are separate so we can hide fields (password hash), have different create/update/output shapes and keep DB and API concerns independent.", level: "Easy" },
    { q: "Why use a yield dependency for the DB session?", a: "Each request gets its own session, which is always closed in finally even if an error occurs, preventing connection leaks. It also makes it easy to override get_db in tests with a session to a test database.", level: "Medium" },
    { q: "What does from_attributes=True do?", a: "It lets a Pydantic v2 model be created from arbitrary objects by reading attributes (obj.name) instead of dict keys. Needed to return SQLAlchemy objects with response_model. In Pydantic v1 it was orm_mode = True.", level: "Easy" },
    { q: "Why is check_same_thread=False needed for SQLite?", a: "SQLite's Python driver by default only allows a connection to be used in the thread that created it. FastAPI may handle one request across different threads (threadpool for def functions and dependencies), so we disable that check. Since each request has its own session, it is safe.", level: "Medium" },
    { q: "What is db.refresh(obj) for?", a: "After commit, refresh reloads the object's state from the database, populating server-generated values like auto-increment id, defaults and timestamps, so the response contains them.", level: "Easy" },
    { q: "What is the N+1 query problem and how do you fix it in SQLAlchemy?", a: "When you load N parent rows and then access a lazy relationship on each, SQLAlchemy runs 1 query for parents plus N queries for children. Fix with eager loading: selectinload (second query with IN), joinedload (JOIN) or by writing an explicit join query.", level: "Hard" },
    { q: "Why not rely on Base.metadata.create_all in production?", a: "create_all only creates missing tables; it does not add/alter columns or migrate data. Production schema changes should be versioned with Alembic migrations (alembic revision --autogenerate, alembic upgrade head) and reviewed in code.", level: "Medium" },
    { q: "How do you handle a unique constraint violation?", a: "Catch sqlalchemy.exc.IntegrityError around commit, call db.rollback() to reset the session, and raise HTTPException(409, 'already exists'). Optionally check existence first, but the DB constraint is the final guarantee against race conditions.", level: "Medium" },
    { q: "SQLAlchemy 2.0 select() style vs legacy query() style?", a: "2.0 style: db.scalars(select(User).where(User.id == 1)).first(), db.get(User, 1), db.execute(...). Legacy: db.query(User).filter(User.id == 1).first(). 2.0 unifies Core and ORM, is better typed and works the same with AsyncSession. query() still works but is considered legacy.", level: "Medium" },
    { q: "Should DB endpoints be def or async def?", a: "With the regular synchronous Session use def, so FastAPI runs it in the threadpool. Using async def with a sync session would block the event loop. For async def, use an async driver (asyncpg, aiosqlite) with create_async_engine and AsyncSession and await all DB calls.", level: "Hard" },
    { q: "What is expire_on_commit and why set it to False?", a: "By default the session expires all loaded objects after commit, so the next attribute access triggers a new SELECT (and fails if the session is closed). expire_on_commit=False keeps the loaded values, which is convenient when returning objects after commit, especially with async sessions.", level: "Hard" },
  ],
  practice: [
    {
      task: "Create a Product model (id, name unique, price float, stock int default 0) and endpoints POST /products and GET /products?min_price=&max_price= using SQLAlchemy 2.0.",
      hint: "Build the select() step by step with .where() only for parameters that are not None.",
      solution: `# models.py
class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    price: Mapped[float]
    stock: Mapped[int] = mapped_column(default=0)

# schemas.py
class ProductIn(BaseModel):
    name: str
    price: float = Field(gt=0)
    stock: int = Field(default=0, ge=0)


class ProductOut(ProductIn):
    model_config = ConfigDict(from_attributes=True)
    id: int

# main.py
@app.post("/products", response_model=ProductOut, status_code=201)
def create_product(data: ProductIn, db: SessionDep):
    p = models.Product(**data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@app.get("/products", response_model=list[ProductOut])
def list_products(db: SessionDep, min_price: float | None = None, max_price: float | None = None):
    stmt = select(models.Product)
    if min_price is not None:
        stmt = stmt.where(models.Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(models.Product.price <= max_price)
    return db.scalars(stmt.order_by(models.Product.price)).all()`,
    },
    {
      task: "Add POST /products/{id}/purchase?qty=2 that reduces stock and returns 400 if stock is insufficient, 404 if product missing.",
      hint: "db.get, compare stock, update and commit.",
      solution: `@app.post("/products/{product_id}/purchase", response_model=ProductOut)
def purchase(product_id: int, db: SessionDep, qty: int = Query(1, ge=1)):
    p = db.get(models.Product, product_id)
    if p is None:
        raise HTTPException(404, "Product not found")
    if p.stock < qty:
        raise HTTPException(400, f"Only {p.stock} left in stock")
    p.stock -= qty
    db.commit()
    db.refresh(p)
    return p`,
    },
    {
      task: "Add created_at to the Student model with a server-side default of the current timestamp and include it in StudentOut.",
      hint: "mapped_column(server_default=func.now()) and a datetime field in the schema.",
      solution: `from datetime import datetime
from sqlalchemy import func

class Student(Base):
    # ... existing columns ...
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

# schemas.py
from datetime import datetime

class StudentOut(StudentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_active: bool
    created_at: datetime

# Delete school.db and restart (or write an Alembic migration).
# Response: "created_at": "2026-11-18T10:15:30"`,
    },
    {
      task: "Write GET /students/count?active=true that returns the number of active (or inactive) students using func.count.",
      hint: "select(func.count()).select_from(Student).where(...)",
      solution: `from sqlalchemy import func, select


@app.get("/students/count")
def count_students(db: SessionDep, active: bool = True):
    stmt = (select(func.count())
            .select_from(models.Student)
            .where(models.Student.is_active == active))
    return {"active": active, "count": db.scalar(stmt)}

# Declare this route above /students/{student_id}.`,
    },
  ],
  quiz: [
    { question: "In SQLAlchemy 2.0, how do you fetch a row by primary key?", options: ["db.find(Student, 1)", "db.get(Student, 1)", "Student.get(1)", "db.select(1)"], answer: 1, explanation: "Session.get(Model, pk) returns the object or None." },
    { question: "Which Pydantic v2 setting allows building a schema from an ORM object?", options: ["orm_mode = True", "from_attributes=True", "arbitrary_types=True", "extra='allow'"], answer: 1, explanation: "ConfigDict(from_attributes=True) replaced orm_mode." },
    { question: "Mapped[str | None] in a model means the column is...", options: ["Primary key", "NOT NULL", "Nullable", "Indexed"], answer: 2, explanation: "Optional types map to nullable columns." },
    { question: "What does Base.metadata.create_all(engine) do to an existing table with a new column in the model?", options: ["Adds the column", "Drops and recreates the table", "Nothing", "Raises an error"], answer: 2, explanation: "create_all only creates missing tables; use Alembic for changes." },
    { question: "Which loader option avoids the N+1 problem by issuing a second SELECT ... WHERE id IN (...)?", options: ["lazyload", "selectinload", "noload", "raiseload"], answer: 1, explanation: "selectinload loads all related rows in one extra query." },
    { question: "After db.commit() fails with IntegrityError, what must you call?", options: ["db.close()", "db.flush()", "db.rollback()", "db.refresh()"], answer: 2, explanation: "Rollback resets the failed transaction so the session is usable again." },
  ],
};
