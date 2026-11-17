# Python Full Stack courses: topic file spec

Folders (ONE file per lesson, `day-NN-<slug>.js`):
- `src/data/python-days/`  Python Core + Advanced (Day 1–45)
- `src/data/sql-days/`     SQL & MySQL (Day 1–15)
- `src/data/flask-days/`   Flask (Day 1–12)
- `src/data/django-days/`  Django (Day 1–30)
- `src/data/drf-days/`     Django REST Framework (Day 1–12)

Plain ES module with a default export. NO imports. Valid JS. Put code in template literals (escape backticks as \` and `${` as \${).
Python code must keep correct indentation inside the strings.

```js
export default {
  id: 'day-12-functions',            // = filename without .js
  title: 'Functions: def, Parameters, Return, Default and Keyword Arguments',
  module: 'Module 3: Functions & Modules',   // exact module name from the syllabus below
  day: 12,
  level: 'Beginner' | 'Intermediate' | 'Advanced',
  duration: '2 hours',
  summary: '1-2 sentences.',
  objectives: ['...'],               // 3-5
  theory: [ { heading, content, syntax?, points?, tip? } ],   // 4-7 sections; simple English, real-world analogies, explain every sub-topic
  examples: [                        // 3-6 SOLVED examples
    {
      title, scenario,
      steps: ['Open VS Code / PyCharm', 'Create main.py', 'Run with python main.py'],   // REQUIRED
      code: `...`,                   // full code shown (Python / SQL / HTML templates / settings / shell commands)
      python: {                      // REQUIRED for every example that is plain Python (standard library only)
        files: { 'main.py': `print("hi")` },   // main.py is executed; extra .py files can be imported as modules
        stdin: 'Asha\n21\n',         // optional: lines consumed by input()
      },
      sql: {                         // REQUIRED for SQL course examples that can run in SQLite: the in-browser SQL lab runs `setup` then `query`
        setup: 'CREATE TABLE ...; INSERT INTO ...;',
        query: 'SELECT ...;',
      },
      result: 'EXACT output',        // must match what the code prints / the query returns (for SQL show a small text table)
      explanation: '...',
    },
  ],
  interview: [ { q, a, level: 'Easy' | 'Medium' | 'Hard' } ],   // 8-12; include "what is the output" questions for Python
  practice: [ { task, hint, solution } ],       // 4-6
  quiz: [ { question, options: [4], answer: 0-3, explanation } ],   // EXACTLY 5; vary correct position
};
```

Rules:
- Python 3.12. `python.files` must run with only the standard library in a browser sandbox (Pyodide): no network, no threads that block forever, no os.system, no tkinter. File I/O to the current directory is fine (in-memory FS).
- VERIFY every runnable example: run it with `python3` on this machine (it is installed) — feed `stdin` — and paste the real output into `result`.
- SQL: write MySQL syntax in `code`; in `sql` give a SQLite-compatible version (the in-browser lab uses SQLite). Verify with `python3 -c "import sqlite3 ..."` and paste the real result.
- Flask 3, Django 5, DRF 3.15, MySQL 8. Give full code (project tree, settings, urls, views, models, templates, requirements.txt, commands) and steps in VS Code and PyCharm. Django/Flask code is not runnable in the browser — just give `code` + steps (you may add a small pure-Python `python` demo of the core idea when useful).
- Simple English for freshers; interview-ready definitions; common mistakes.

Validation (run after writing; fix every failure):
```
cd /home/stn/Pictures/DayWise/EXcel_And_PoweBI && for f in <your files>; do node --input-type=module -e "import('./$f').then(m=>{const d=m.default; const ok=d.id&&d.title&&d.module&&d.day&&d.theory?.length>=4&&d.examples?.length>=3&&d.examples.every(e=>Array.isArray(e.steps)&&e.steps.length)&&d.interview?.length>=8&&d.practice?.length>=4&&d.quiz?.length===5&&d.quiz.every(q=>q.options.length===4&&q.answer>=0&&q.answer<4); if(!ok) throw new Error('schema'); console.log('ok', d.id)})" || echo FAIL $f; done
```

## Python – 45 days
Module 1: Python Basics (Day 1–8)
1 Introduction to Python, History, Features, Applications, Python 2 vs 3
2 Installing Python, VS Code and PyCharm Setup, First Program, Interactive Shell, Running .py files
3 Syntax, Indentation, Comments, Keywords, Identifiers, print() options (sep, end)
4 Variables and Data Types (int, float, complex, bool, str, None), type(), Dynamic Typing
5 Type Conversion, input() and Formatted Output (f-strings, format())
6 Operators: Arithmetic, Comparison, Logical, Assignment, Identity, Membership, Bitwise
7 Conditional Statements: if, elif, else, nested if, match-case
8 Loops: for, while, range(), break, continue, pass, else on loops
Module 2: Data Structures (Day 9–15)
9 Strings: indexing, slicing, string methods, immutability
10 Lists: creation, indexing, slicing, list methods, nested lists
11 List Comprehensions and Common List Programs
12 Tuples, Packing/Unpacking, Tuple vs List
13 Sets and Set Operations
14 Dictionaries, Dictionary Methods, Nested Dictionaries, Dict Comprehensions
15 Pattern Programs and Practice Problems on Data Structures
Module 3: Functions & Modules (Day 16–22)
16 Functions: def, Parameters, Return, Default and Keyword Arguments
17 *args and **kwargs, Scope (LEGB), global and nonlocal
18 Lambda Functions, map(), filter(), reduce(), sorted() with key
19 Recursion
20 Modules and Packages, import styles, __name__ == "__main__"
21 Standard Library Tour: math, random, datetime, os, sys, collections, itertools
22 pip, Virtual Environments (venv), requirements.txt
Module 4: Exceptions & Files (Day 23–26)
23 Exception Handling: try, except, else, finally, multiple exceptions
24 raise, Custom Exceptions, assert
25 File Handling: open modes, read/write, with statement
26 Working with CSV and JSON Files
Module 5: Object-Oriented Programming (Day 27–33)
27 Classes and Objects, __init__, self, Instance vs Class Variables
28 Methods: Instance, Class (@classmethod), Static (@staticmethod)
29 Encapsulation: public, protected, private (name mangling), @property
30 Inheritance: single, multiple, multilevel, super(), MRO
31 Polymorphism, Method Overriding, Duck Typing, Abstract Classes (abc)
32 Magic / Dunder Methods: __str__, __repr__, __len__, __eq__, __add__, operator overloading
33 Dataclasses and Enums
Module 6: Advanced Python (Day 34–41)
34 Iterators and Generators, yield
35 Decorators (function decorators, decorators with arguments, functools.wraps)
36 Context Managers (with, __enter__/__exit__, contextlib)
37 Regular Expressions (re module)
38 Comprehensions Deep Dive, Shallow vs Deep Copy, Mutable vs Immutable, Memory and Garbage Collection
39 Multithreading, Multiprocessing and the GIL (concepts)
40 Async Programming: async / await, asyncio basics
41 Type Hints and Unit Testing (unittest / pytest)
Module 7: Interview Prep & Project (Day 42–45)
42 Logging and Debugging, Python Best Practices (PEP 8)
43 Must-Know Python Coding Interview Programs
44 Working with APIs using requests (concept + code; offline demo with json), Intro to NumPy and Pandas
45 Python Final Project, Practical Test, Interview Questions (bigger: console project + test + 25+ Q&A)

## SQL & MySQL – 15 days (modules: 'Module 1: SQL Basics' 1-5, 'Module 2: Joins & Functions' 6-10, 'Module 3: Advanced SQL' 11-15)
1 Introduction to Databases, DBMS vs RDBMS, MySQL Installation, MySQL Workbench
2 DDL: CREATE, ALTER, DROP, TRUNCATE, Data Types, Constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, DEFAULT, CHECK)
3 DML: INSERT, UPDATE, DELETE; DQL: SELECT, WHERE
4 Operators, ORDER BY, LIMIT, DISTINCT, LIKE, IN, BETWEEN, IS NULL
5 Aggregate Functions, GROUP BY, HAVING
6 Joins: INNER, LEFT, RIGHT, FULL (via UNION), SELF, CROSS
7 Subqueries and Correlated Subqueries
8 String, Date and Numeric Functions, CASE
9 Set Operations (UNION, UNION ALL), Views
10 Indexes and Query Performance, EXPLAIN
11 Normalization (1NF, 2NF, 3NF, BCNF), ER Diagrams
12 Transactions, ACID, COMMIT, ROLLBACK, Isolation Levels
13 Stored Procedures, Functions and Triggers
14 Window Functions: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, running totals; CTEs
15 Python + MySQL (mysql-connector), SQL Interview Questions and Practice Queries (bigger: 25+ Q&A)

## Flask – 12 days (modules: 'Module 1: Flask Basics' 1-5, 'Module 2: Database & Auth' 6-9, 'Module 3: APIs & Deployment' 10-12)
1 Introduction to Web Frameworks, Flask vs Django, Installing Flask, First App
2 Routing, URL Variables, HTTP Methods, url_for, redirect
3 Jinja2 Templates, Template Inheritance, Static Files
4 Forms: request.form, Flask-WTF, Validation, Flash Messages
5 Sessions and Cookies
6 Flask-SQLAlchemy: Models, CRUD
7 Database Migrations (Flask-Migrate), Relationships
8 User Authentication with Flask-Login, Password Hashing
9 Blueprints and Application Factory Pattern
10 Building REST APIs with Flask (jsonify, request.json), Error Handling
11 Configuration, Environment Variables, Deployment (Gunicorn, Render)
12 Flask Project (Blog / Todo App) and Interview Questions (bigger: 20+ Q&A)

## Django – 30 days
Module 1: Django Basics (Day 1–6)
1 Introduction to Django, MVT Architecture, Django vs Flask
2 Installation, Virtual Environment, Creating a Project, Project Structure, runserver
3 Django Apps, settings.py, INSTALLED_APPS
4 URLs and Views (function-based), HttpResponse, URL Parameters
5 Templates, Template Language (variables, tags, filters), Template Inheritance
6 Static Files and Media Files
Module 2: Models & Database (Day 7–13)
7 Models, Fields, Migrations (makemigrations, migrate), MySQL configuration
8 Django ORM: CRUD, QuerySets, filter, exclude, get, order_by
9 Field Lookups, Q and F objects, Aggregation and Annotation
10 Relationships: ForeignKey, OneToOne, ManyToMany, related_name
11 Django Admin: registering models, customizing ModelAdmin
12 select_related, prefetch_related, N+1 Problem
13 Django Shell and Data Seeding, Fixtures
Module 3: Forms & Views (Day 14–19)
14 Django Forms: Form class, validation, rendering
15 ModelForms and CRUD with Forms
16 Class-Based Views: View, TemplateView, ListView, DetailView
17 Generic Editing Views: CreateView, UpdateView, DeleteView
18 Messages Framework, Pagination
19 File Uploads (ImageField), Media Handling
Module 4: Authentication & Security (Day 20–23)
20 User Authentication: login, logout, register, @login_required
21 Custom User Model, Profiles
22 Permissions, Groups, Authorization
23 Security: CSRF, XSS, SQL Injection protection, settings for production
Module 5: Advanced Django (Day 24–28)
24 Middleware, Context Processors, Signals
25 Sessions, Cookies and Caching
26 Sending Emails, Custom Management Commands
27 Testing in Django
28 Deployment: Gunicorn, Nginx, environment variables, collectstatic, PythonAnywhere/Render
Module 6: Project (Day 29–30)
29 Django Project Part 1: E-commerce / Blog — models, views, templates
30 Django Project Part 2 and Interview Questions (bigger: 25+ Q&A)

## Django REST Framework – 12 days (modules: 'Module 1: DRF Basics' 1-5, 'Module 2: Auth & Advanced' 6-10, 'Module 3: Full Stack' 11-12)
1 REST APIs Introduction, Installing DRF, First API
2 Serializers and ModelSerializers, Validation
3 Function-based API Views (@api_view), Request and Response
4 Class-based APIView, Generic Views and Mixins
5 ViewSets and Routers
6 Authentication: Session, Token, JWT (SimpleJWT)
7 Permissions and Custom Permissions
8 Filtering, Searching, Ordering, Pagination
9 Nested Serializers and Relationships
10 Throttling, Versioning, API Documentation (drf-spectacular / Swagger)
11 Connecting React Frontend to Django REST API (CORS, fetch/axios, JWT login)
12 Python Full Stack Final Project and Interview Questions (bigger: project + test + 25+ Q&A)
