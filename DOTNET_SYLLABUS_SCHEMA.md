# .NET Full Stack (120 days) – topic file spec

Folders (ONE file per lesson):
- `src/data/dotnet-days/day-NNN-<slug>.js`  (NNN = 001..120, three digits!)  → `day: N`
- `src/data/dotnet-extra/extra-NN-<slug>.js` (NN = 01..54)                   → `extraNo: N` (no `day`)

Plain ES module with a default export; NO imports; valid JS. Put code in template literals (escape backticks as \` and `${` as \${;
C# interpolated strings like $"Hi {name}" are fine — only the two characters `$` followed by `{` together need escaping as \${).

```js
export default {
  id,                    // = filename without .js
  title, module,         // exact module name from the syllabus below
  day | extraNo, level, duration, summary, objectives: [3-5],
  theory: [ { heading, content, syntax?, points?, tip? } ],     // 4-7 sections; simple English; explain EVERY sub-topic of the day
  examples: [                                                   // 3-6 SOLVED examples (live-coding style)
    {
      title, scenario,
      steps: ['In Visual Studio: File > New > Project > Console App', 'Name it ...', 'Replace Program.cs with the code', 'Press Ctrl+F5'],   // REQUIRED
      code: `...`,                       // the full code shown (C#, Razor, JSON, T-SQL, JS, JSX, PowerShell, Dockerfile …)
      csharp: { files: { 'Program.cs': `...` }, stdin: '' },    // REQUIRED for every example that is a plain C# console program (top-level statements or class Program with Main). Multiple .cs files allowed.
      tsql: `CREATE DATABASE StudentDB; GO USE StudentDB; ...`,  // REQUIRED for SQL Server examples that run in the in-app SSMS Lab (see rules)
      playground: { html, css, js } | { jsx },                  // for frontend days (same rules as WEB_SYLLABUS_SCHEMA.md: React uses React globals, defines function App, no imports)
      result: 'EXACT console output / query result / what the student sees',
      explanation: '...',
    },
  ],
  interview: [ { q, a, level: 'Easy'|'Medium'|'Hard' } ],     // 8-12 (25+ on big days); include output-based C# questions
  practice: [ { task, hint, solution } ],                      // 4-6 (use the syllabus's "Practical Examples / Student Tasks" and assignment bank)
  quiz: [ { question, options: [4], answer: 0-3, explanation } ],   // EXACTLY 5; vary the correct position
};
```

Rules
- Target .NET 10 LTS / C# 14 (code must also be valid for .NET 8), ASP.NET Core, EF Core 9/10, SQL Server 2022 + SSMS, Visual Studio 2022/2026.
- C# console examples: NO .NET SDK on the writing machine, so trace every output by hand very carefully. Avoid culture-dependent output
  (prefer `ToString("0.00", CultureInfo.InvariantCulture)` or plain integers; never print currency symbols via "C" format), avoid Dictionary/HashSet
  order dependence (or say order may vary), avoid DateTime.Now and Random in `result` unless explained.
- Use real Visual Studio menu paths, shortcuts (F5, Ctrl+F5, F9 breakpoint, F10/F11 stepping, Ctrl+K,Ctrl+D format), NuGet commands, dotnet CLI.
- Every ASP.NET/EF/Web API day: give full Program.cs, controllers, models, DbContext, appsettings.json, migrations commands, Swagger/Postman requests with JSON.
- Explain OOP topics with real-world analogies AND console code students can run.

T-SQL examples (`tsql` field) run in the in-app **SSMS Lab**, an emulator on SQLite. Supported: CREATE/DROP DATABASE, USE, GO batch separators,
CREATE TABLE with INT IDENTITY(1,1) PRIMARY KEY, NVARCHAR/VARCHAR(n|MAX), DECIMAL, BIT, DATE, DATETIME, DEFAULT, CHECK, UNIQUE, FOREIGN KEY,
INSERT (multi-row), UPDATE, DELETE, SELECT with TOP n, WHERE, DISTINCT, ORDER BY, OFFSET … ROWS FETCH NEXT … ROWS ONLY, GROUP BY/HAVING, all JOINs,
subqueries, EXISTS, UNION, CASE, IIF, CTEs incl. recursive, window functions, views, CREATE INDEX, SELECT … INTO new_table, temp tables (#t),
BEGIN TRAN/COMMIT/ROLLBACK, functions GETDATE, ISNULL, COALESCE, LEN, UPPER, LOWER, LTRIM, RTRIM, TRIM, SUBSTRING, LEFT, RIGHT, REPLACE, CHARINDEX,
CONCAT, CAST, CONVERT(type, expr), DATEADD(part, n, date), DATEDIFF(part, a, b), YEAR, MONTH, DAY, ROUND, ABS, CEILING, FLOOR, PRINT 'text',
string concatenation with + when one side is a string literal or CAST(... AS VARCHAR).
NOT supported (give code + SSMS steps only): stored procedures/EXEC, user functions, triggers with T-SQL bodies, DECLARE @variables, cursors,
dynamic SQL, MERGE, security/logins, backup/restore, execution plans. Write every T-SQL statement ending with `;` and put `GO` on its own line between batches. Known lab differences (mention them in the explanation when they matter): DECIMAL values print without trailing zeros (88.5 instead of 88.50), string comparisons with `=` are case-sensitive (SQL Server's default is case-insensitive), DATETIME DEFAULT GETDATE() shows UTC time.
Verify every `tsql` script with
`python3 /home/stn/Pictures/DayWise/EXcel_And_PoweBI/tools/wb_check.py --tsql file.sql` and paste the real output into `result`.

Validation (run after writing; fix failures):
```
cd /home/stn/Pictures/DayWise/EXcel_And_PoweBI && for f in <your files>; do node --input-type=module -e "import('./$f').then(m=>{const d=m.default; const ok=d.id&&d.title&&d.module&&(d.day||d.extraNo)&&d.theory?.length>=4&&d.examples?.length>=3&&d.examples.every(e=>Array.isArray(e.steps)&&e.steps.length)&&d.interview?.length>=8&&d.practice?.length>=4&&d.quiz?.length===5&&d.quiz.every(q=>q.options.length===4&&q.answer>=0&&q.answer<4); if(!ok) throw new Error('schema'); console.log('ok', d.id)})" || echo FAIL $f; done
```
Keep scratch files in your own uniquely named scratchpad subfolder (other agents share the scratchpad).

## 120-day syllabus (module names exactly as written)
Module 1: C# Programming Fundamentals (Day 1–15)
1 Introduction to .NET, C#, .NET Framework vs Modern .NET, CLR, CTS, CLS, JIT — Understand how C# code executes
2 Visual Studio Installation, IDE, Solution, Project, Debugging — Create first Console Application
3 C# Syntax, Statements, Comments, Namespace, Main Method — Print student details
4 Variables, Constants, Data Types — Store name, age, salary, marks
5 Value Types and Reference Types, Type Casting, Convert, Parse, TryParse — Convert string to integer
6 Operators: Arithmetic, Assignment, Comparison, Logical — Simple calculator
7 Conditional Statements: if, else, else-if, nested if — Student pass/fail program
8 switch, switch expressions, Conditional Operator — Menu-driven calculator
9 Loops: for, while, do-while — Print multiplication tables
10 Nested Loops, break, continue — Star and number patterns
11 Arrays: One-dimensional and Multidimensional — Student marks array
12 Strings, String Methods, StringBuilder — Reverse string, palindrome
13 Methods, Parameters, Return Types — Addition, subtraction methods
14 Method Overloading, Optional Parameters, Named Arguments — Calculator using methods
15 Recursion, Scope, Local and Global Concepts, var and dynamic — Factorial and Fibonacci
(Module 1 practice must also cover the 15 student practical programs: Hello World, add two numbers, even/odd, largest of three, positive/negative/zero,
multiplication table, factorial, reverse a number, palindrome number, prime, Fibonacci, reverse string, vowels/consonants, max in array, sort array.)
Module 2: OOPs – Complete Object-Oriented Programming (Day 16–28)
16 Introduction to OOPs, Class, Object, Properties, Fields — Student class and objects
17 Constructors, Default Constructor, Parameterized Constructor — Employee constructor
18 Constructor Overloading, Static Constructor, Private Constructor — Multiple employee objects
19 this Keyword, static Keyword, Instance Members — Bank account class
20 Encapsulation, Access Modifiers: public, private, protected, internal — Bank balance protection
21 Inheritance, Single, Multilevel, Hierarchical Inheritance — Person → Employee
22 base Keyword, Constructor Chaining, Method Hiding — Parent-child classes
23 Polymorphism, Compile-Time Polymorphism, Method Overloading — Calculator methods
24 Runtime Polymorphism, Method Overriding, virtual, override — Animal sound program
25 Abstraction, Abstract Classes, Abstract Methods — Payment system
26 Interfaces, Multiple Interface Implementation, Interface vs Abstract Class — Payment gateway
27 Sealed Classes, Sealed Methods, Partial Classes, Partial Methods — Employee partial class
28 Object Class, ToString(), Equals(), GetHashCode(), is, as, Boxing, Unboxing — Object comparison
(Use the BankAccount / Person→Employee / Payment (UPI, Card, Cash) / INotification (Email, SMS, WhatsApp) examples from the syllabus where they fit.)
Module 3: Advanced C# Programming (Day 29–38)
29 Collections: ArrayList, List, Dictionary, HashSet, Queue, Stack — Student collection
30 Generics, Generic Collections, Constraints — Generic repository example
31 Exception Handling: try, catch, finally, throw — Division by zero
32 Custom Exceptions, Exception Filters — Invalid age exception
33 File Handling, File, Directory, FileStream — Create and read text file
34 StreamReader, StreamWriter, BinaryReader, BinaryWriter — Save student records
35 LINQ Introduction, Query Syntax, Method Syntax — Filter students by marks
36 LINQ: Where, Select, OrderBy, ThenBy, GroupBy — Employee filtering
37 LINQ: First, FirstOrDefault, Single, Any, All, Count, Sum, Average — Student result analysis
38 Async, Await, Task, Task<T>, CancellationToken, Threading Basics — Asynchronous file reading
Module 4: SQL Server & Database Management (Day 39–50)
39 Introduction to Database, DBMS, RDBMS, SQL Server, SSMS Installation — Create StudentDB
40 Database, Table, Rows, Columns, Data Types, Primary Key, Foreign Key — Create Student and Course tables
41 SQL Commands: DDL, DML, DQL, DCL, TCL — CREATE, INSERT, UPDATE, DELETE
42 SELECT, WHERE, DISTINCT, ORDER BY, TOP, Aliases — Display student records
43 AND, OR, NOT, IN, BETWEEN, LIKE, IS NULL — Search students by conditions
44 Aggregate Functions: COUNT, SUM, AVG, MIN, MAX — Calculate student marks
45 GROUP BY, HAVING, ORDER BY with aggregate functions — Department-wise employee count
46 SQL Joins: INNER, LEFT, RIGHT, FULL, CROSS JOIN — Student and course details
47 Subqueries, Nested Queries, Correlated Subqueries — Find employees above average salary
48 Constraints: PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, DEFAULT, NOT NULL — Create employee table with constraints
49 Views, Stored Procedures, Parameters, Functions — Create employee stored procedure
50 Triggers, Transactions, COMMIT, ROLLBACK, Indexes, Normalization — Stock update transaction
Module 5: Frontend Development – HTML, CSS, JavaScript (Day 51–62)
51 HTML Introduction, Structure, Tags, Elements, Attributes, Headings, Paragraphs — Create first webpage
52 HTML Lists, Links, Images, Tables, Semantic Elements — Student information webpage
53 HTML Forms, Input Types, Labels, Select, Radio, Checkbox, Validation — Registration form
54 CSS Introduction, Inline, Internal, External CSS, Selectors — Style registration form
55 Colors, Backgrounds, Fonts, Text, Borders, Margins, Padding — Design profile card
56 CSS Box Model, Display, Position, Float, Overflow, Z-index — Create webpage layout
57 Flexbox, CSS Grid, Media Queries, Responsive Design (incl. Bootstrap 5 intro) — Responsive navbar
58 CSS Transitions, Transform, Animations, Pseudo Classes, Pseudo Elements — Animated login page
59 JavaScript Introduction, Variables, Data Types, Operators, Conditions — Calculator
60 Loops, Functions, Arrays, Strings, Objects, Array Methods — Student marks calculator
61 DOM Manipulation, Events, Event Listeners, Form Validation — Registration form with validation
62 ES6, let, const, Arrow Functions, Destructuring, Spread, Rest, Modules, JSON, Local Storage, Fetch API — Store and display student records
(Frontend days are compact but complete; each example needs a runnable `playground`; mention the full HTML/CSS/JS courses in the app for depth.)
Module 6: ASP.NET Core & .NET Web Development (Day 63–77)
63 Introduction to ASP.NET Core, .NET Architecture, CLR, Middleware, Kestrel Server — Create ASP.NET Core project
64 Project Structure, Program.cs, appsettings.json, Launch Settings, Environment — Understand project configuration
65 HTTP Protocol, Request, Response, GET, POST, PUT, PATCH, DELETE, Status Codes — Understand browser requests
66 ASP.NET Core MVC Architecture, Model, View, Controller, Routing — Create MVC application
67 Controllers, Actions, Action Results, Attribute Routing — StudentController
68 Razor Views, Razor Syntax, Layout Pages, Partial Views — Student listing page
69 Razor Pages, ViewData, ViewBag, TempData, Strongly Typed Views — Pass data to views
70 Model Binding, Model Validation, Data Annotations — Student registration
71 HTML Helpers, Tag Helpers, Form Submission — Employee form
72 Dependency Injection, Service Lifetime: Transient, Scoped, Singleton — Create student service
73 Middleware, Custom Middleware, Exception Handling — Request logging middleware
74 Configuration, appsettings.json, Environments, Logging — Development and production settings
75 Session Management, Cookies, TempData, Cache Basics — Shopping cart session
76 Filters: Authorization, Action, Result, Exception, Resource Filters — Custom logging filter
77 MVC CRUD Application, Model Validation, Error Handling — Complete Student Management System
Module 7: Entity Framework Core & Database Connectivity (Day 78–85)
78 Introduction to Entity Framework Core, ORM, EF Core Architecture — Connect ASP.NET Core to SQL Server
79 Code First Approach, Database First Approach, DbContext, DbSet — Create Student Entity
80 Migrations, Add-Migration, Update-Database, Remove-Migration — Automatically create database tables
81 CRUD Operations using EF Core — Insert, Display, Update, Delete students
82 Relationships: One-to-One, One-to-Many, Many-to-Many — Student-Course relationship
83 Fluent API, Data Annotations, Navigation Properties — Configure employee database
84 LINQ with EF Core, Include, ThenInclude, AsNoTracking, Eager and Lazy Loading — Fetch employee with department
85 Transactions, Async Database Operations, Pagination, Performance Optimization — Search and paginate records
Module 8: ASP.NET Core Web API (Day 86–97)
86 Introduction to REST API, REST Architecture, Web API vs MVC — Create first Web API
87 API Project Structure, Controllers, Endpoints, HTTP Methods — Employee API
88 GET API, POST API, Request Body, Response Body — Display and insert students
89 PUT, PATCH, DELETE APIs, Route Parameters — Complete CRUD API
90 DTO, Request DTO, Response DTO, AutoMapper Basics — Employee DTO mapping
91 Dependency Injection, Service Layer, Repository Pattern — Separate business logic
92 Model Validation, Data Annotations, Custom Validation — Validate API input
93 Swagger / OpenAPI, Postman, API Testing, HTTP Status Codes — Test all API methods
94 JWT Authentication, Access Tokens, Refresh Token Concepts — Secure login API
95 Authorization, Roles, Claims, Policies, ASP.NET Core Identity — Admin and User roles
96 CORS, Global Exception Handling, Logging, API Security — Secure API application
97 API Pagination, Searching, Sorting, Filtering, File Upload — Product Management API
Module 9: React.js Frontend with .NET Web API (Day 98–109)
98 React Introduction, Features, SPA, React Architecture, Node.js, npm, Vite Setup — Create React project
99 JSX, Components, Functional Components, Props — Student profile component
100 useState, Events, Conditional Rendering, Lists, Keys — Student list
101 useEffect, Lifecycle Concepts, API Calls — Fetch student data
102 React Forms, Controlled Components, Form Validation — Registration form
103 React Router, BrowserRouter, Routes, Route, Link, Navigate — Multi-page application
104 Nested Routes, Outlet, useNavigate, useParams — Admin dashboard
105 Axios, GET, POST, PUT, PATCH, DELETE — Connect .NET API
106 Context API, useContext, useReducer, State Management — Global authentication state
107 JWT Login, Token Handling, Protected Routes, Role-Based UI — Login and admin panel
108 Bootstrap / Tailwind CSS, Responsive Design, React Icons, Reusable Components — Responsive dashboard
109 React CRUD Integration, Loading States, Error Handling, Deployment Build — Complete React + .NET CRUD
(React days connect to the ASP.NET Core Web API built in Module 8; playgrounds use plain React globals; show real axios/router code in `code`.)
Module 10: Authentication, Security, Testing & Integration (Day 110–116)
110 Authentication vs Authorization, ASP.NET Core Identity, User Registration, Login
111 Password Hashing, Password Validation, JWT Access Tokens, Refresh Tokens
112 Role-Based Access Control, Claims-Based Authorization, Policy Authorization
113 API Security, CORS, HTTPS, SQL Injection Prevention, XSS, CSRF Basics
114 Unit Testing, xUnit, NUnit Basics, Moq
115 Integration Testing, WebApplicationFactory, API Testing
116 Git, GitHub, Branching, Commit, Push, Pull, Merge, .gitignore
Module 11: Deployment & Professional Development (Day 117–118)
117 Application Publishing, IIS Hosting, Azure App Service, Environment Configuration, Connection Strings
118 Docker Basics, Dockerfile, Containerization, CI/CD Introduction, GitHub Actions, Production Debugging
Module 12: Final Real-Time Projects (Day 119–120)
119 Final Projects Part 1: Student Management System and Employee Management System (full feature list, architecture, DB schema, API endpoints, React pages, step-by-step build)
120 Final Projects Part 2: Inventory, E-Commerce and Hospital Management Systems + Course Assessment & Exam Pattern + 40 mixed interview Q&A

## Extra topics (dotnet-extra, extraNo, module = the group name)
'Extra: OOP Concepts' — 1 Association; 2 Aggregation; 3 Composition; 4 Dependency; 5 Constructor Injection; 6 Destructor and Garbage Collection;
7 IDisposable and Dispose() (using); 8 Properties: get, set, init; 9 Auto-Implemented Properties; 10 Readonly and Const; 11 Extension Methods;
12 Anonymous Types; 13 Nested Classes; 14 Generic Classes; 15 Generic Methods; 16 Delegates; 17 Multicast Delegates; 18 Events and Event Handlers;
19 Lambda Expressions; 20 Func, Action and Predicate; 21 SOLID Principles – SRP, OCP, LSP, ISP, DIP; 22 Design Patterns – Singleton, Factory, Repository, Strategy
'Extra: Advanced C#' — 23 Nullable Value Types, Null-Conditional (?.) and Null-Coalescing (??, ??=) Operators; 24 Pattern Matching; 25 Records and Structs;
26 Enum and Flags; 27 Tuples and Deconstruction; 28 Iterators, yield return and Async Streams; 29 Dynamic, Reflection and Attributes;
30 DateTime, TimeSpan and Regular Expressions; 31 JSON Serialization and Deserialization (System.Text.Json)
'Extra: SQL Server' — 32 UNION/UNION ALL, CASE, EXISTS and NOT EXISTS; 33 CTE and Recursive CTE; 34 Temporary Tables and Table Variables;
35 Window Functions: ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, PARTITION BY; 36 Dynamic SQL and Cursor Basics; 37 Query Optimization and Execution Plans;
38 Database Backup and Restore; 39 Database Security, Logins, Users and Roles; 40 SQL Practical Programs (Student, Employee Salary, Department, Product/Category, Sales/Purchase, Customer Orders, Inventory)
'Extra: ASP.NET Core, EF Core & Web API' — 41 Minimal APIs; 42 Conventional vs Attribute Routing and Areas; 43 View Components and Custom Tag Helpers;
44 Global Exception Handling, Structured Logging and Health Checks; 45 Response, Output and Memory Caching; 46 Localization; 47 Background and Hosted Services;
48 SignalR Real-Time Communication; 49 Repository and Unit of Work Patterns; 50 EF Core Advanced: Change Tracking, Shadow Properties, Owned Types, Global Query Filters, Concurrency, Seeding;
51 EF Core Raw SQL, Stored Procedure Integration and Connection Strings; 52 Web API Advanced: Versioning, Rate Limiting, Caching, Filters, Content Negotiation;
53 File Download API, Background Processing and Webhooks; 54 Refresh Token Rotation/Revocation and Integration Testing
