export default {
  id: 'day-13-express-router-mvc-structure',
  title: 'express.Router and MVC Folder Structure (routes, controllers, services)',
  module: 'Module 2: Express.js',
  day: 13,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Putting every route in app.js works for 5 routes but becomes chaos at 50. Today you split an API into routers, controllers, services and models – the layered MVC structure used in real Node.js projects.',
  objectives: [
    'Create modular routes with express.Router() and mount them with prefixes',
    'Use router.route() to group handlers for the same path, and router.param() for shared parameter logic',
    'Explain the MVC pattern and the Routes → Controllers → Services → Models layering',
    'Organise a project into a professional folder structure (src/routes, src/controllers, src/services ...)',
    'Version APIs (/api/v1) and nest routers with mergeParams',
  ],
  theory: [
    {
      heading: 'Why split the app? (the restaurant analogy)',
      content: `Imagine a restaurant where **one person** takes orders, cooks, washes dishes and handles the bill. It works for 3 customers, not for 300. Real restaurants split work:

- **Waiter (Route)** – knows *which table asked for what*: maps URL + method to a controller function.
- **Head chef (Controller)** – reads the order (req), decides what to prepare, and sends the dish back (res). No raw ingredients logic.
- **Kitchen staff (Service)** – does the actual cooking: business rules ("a student cannot enrol twice", "price includes 18% GST").
- **Store room (Model / Repository)** – where ingredients live: database access (in-memory array today, MongoDB on Day 18).

Each layer has **one responsibility**. You can change the database without touching routes, or test business rules without starting a server.`,
      points: [
        'Routes: URL + HTTP method → controller (no logic)',
        'Controllers: read req, call service, choose status code, send res',
        'Services: business logic, no req/res objects',
        'Models: data shape and data access',
      ],
    },
    {
      heading: 'express.Router(): a mini app',
      content: `\`express.Router()\` creates an isolated "mini application" that has its own middleware and routes but cannot listen on a port. You **mount** it on the main app with a path prefix:

- Inside the router, paths are **relative** to the mount point: \`router.get('/:id')\` mounted at \`/api/students\` answers \`GET /api/students/5\`.
- \`router.use(fn)\` adds middleware only for this router.
- \`router.route('/:id').get(...).put(...).delete(...)\` chains handlers for one path – less repetition, fewer typos.
- \`router.param('id', fn)\` runs \`fn(req, res, next, value)\` whenever a route in this router has \`:id\` – great for loading the record once.
- \`express.Router({ mergeParams: true })\` lets a nested router read params from its parent (e.g. \`/courses/:courseId/lessons\`).`,
      syntax: `// routes/student.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/student.controller');

router.route('/')
  .get(ctrl.list)
  .post(ctrl.create);

router.route('/:id')
  .get(ctrl.getOne)
  .put(ctrl.update)
  .delete(ctrl.remove);

module.exports = router;

// app.js
app.use('/api/v1/students', require('./routes/student.routes'));`,
    },
    {
      heading: 'MVC in an API project',
      content: `**MVC** = Model – View – Controller. In server-rendered apps the **View** is an HTML template (EJS, Day 15). In a JSON API the "view" is simply the JSON you send, so most Node APIs use the extended layering **Routes → Controllers → Services → Models**.

A request flows like this:
1. \`app.js\` receives \`GET /api/v1/students/2\` and passes it to the students router.
2. The **router** matches \`/:id\` and calls \`studentController.getOne\`.
3. The **controller** reads \`req.params.id\`, calls \`studentService.findById(2)\`.
4. The **service** applies rules and asks the **model** for the data.
5. The controller converts the result into an HTTP response (200 / 404).`,
      tip: 'Keep req and res OUT of services. A service that receives plain values (id, data) can be reused from a CLI script, a cron job or a test without HTTP.',
    },
    {
      heading: 'A professional folder structure',
      content: `There is no single official structure, but this one is common and scales well:

\`\`\`
my-api/
├── package.json
├── .env
└── src/
    ├── server.js            # starts the HTTP server (app.listen)
    ├── app.js               # creates app, global middleware, mounts routes
    ├── config/              # env config, db connection
    ├── routes/
    │   ├── index.js         # mounts all routers under /api/v1
    │   └── student.routes.js
    ├── controllers/
    │   └── student.controller.js
    ├── services/
    │   └── student.service.js
    ├── models/
    │   └── student.model.js
    ├── middlewares/         # auth, validate, errorHandler, notFound
    └── utils/               # AppError, asyncHandler, helpers
\`\`\`

Splitting **app.js** (build the app) from **server.js** (listen) lets tests import the app without opening a port (Supertest, Day 26).

Alternative: **feature-based** folders (\`src/modules/students/{routes,controller,service,model}.js\`) – each feature lives together. Good for big codebases.`,
    },
    {
      heading: 'API versioning and nested routers',
      content: `Prefix routes with a version: \`/api/v1/...\`. When you must make a breaking change, add \`/api/v2\` and keep v1 alive for old clients.

Nested resources (lessons of a course) use a child router with \`mergeParams: true\` so it can see \`:courseId\` from the parent mount path.`,
      syntax: `const lessonsRouter = express.Router({ mergeParams: true });
lessonsRouter.get('/', (req, res) => {
  res.json({ courseId: req.params.courseId }); // works because of mergeParams
});
coursesRouter.use('/:courseId/lessons', lessonsRouter);`,
      tip: 'Coming next (Day 14): centralised error handling so controllers can simply throw errors.',
    },
  ],
  examples: [
    {
      title: 'Moving routes into an express.Router',
      scenario: 'Refactor a students API from app.get/app.post into a router mounted at /api/students.',
      steps: [
        'Create const studentRouter = express.Router()',
        'Move the routes onto studentRouter using RELATIVE paths ("/" and "/:id")',
        'Mount it: app.use("/api/students", studentRouter)',
        'Send requests – URLs stay the same for clients',
      ],
      code: `const studentRouter = express.Router();
studentRouter.get('/', (req, res) => res.json(students));
studentRouter.get('/:id', (req, res) => { ... });
app.use('/api/students', studentRouter);`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const students = [
  { id: 1, name: 'Asha', course: 'Node' },
  { id: 2, name: 'Ravi', course: 'React' },
];

// ---- routes/student.routes.js ----
const studentRouter = express.Router();

studentRouter.get('/', (req, res) => {
  res.json(students);
});

studentRouter.get('/:id', (req, res) => {
  const student = students.find(s => s.id === Number(req.params.id));
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

studentRouter.post('/', (req, res) => {
  const student = { id: students.length + 1, ...req.body };
  students.push(student);
  res.status(201).json(student);
});

// ---- app.js ----
app.use('/api/students', studentRouter);

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/students' },
          { method: 'GET', url: '/api/students/2' },
          { method: 'POST', url: '/api/students', body: { name: 'Meera', course: 'Express' } },
          { method: 'GET', url: '/api/students/3' },
        ],
      },
      result: `GET /api/students → 200 [{"id":1,"name":"Asha","course":"Node"},{"id":2,"name":"Ravi","course":"React"}]
GET /api/students/2 → 200 {"id":2,"name":"Ravi","course":"React"}
POST /api/students → 201 {"id":3,"name":"Meera","course":"Express"}
GET /api/students/3 → 200 {"id":3,"name":"Meera","course":"Express"}`,
      explanation: 'The router only knows "/" and "/:id". The mount path /api/students is added by app.use, so you can move the whole router to /api/v2/students by changing one line.',
    },
    {
      title: 'Full layered MVC: routes → controller → service → model',
      scenario: 'Build a books API where each layer has one job. In a real project these are separate files; here the file sections are marked with comments so it runs in the API Lab.',
      steps: [
        'Model: an in-memory "table" with findAll, findById, create, update, remove',
        'Service: business rules (title required, price must be > 0, discount price) – no req/res',
        'Controller: read req, call the service, map results to status codes',
        'Router: router.route("/").get().post() and router.route("/:id").get().put().delete()',
        'Mount at /api/v1/books and test every endpoint',
      ],
      code: `// src/models/book.model.js
const books = [];
module.exports = { findAll, findById, create, update, remove };

// src/services/book.service.js
const Book = require('../models/book.model');
exports.createBook = (data) => { /* validate + Book.create */ };

// src/controllers/book.controller.js
const service = require('../services/book.service');
exports.create = (req, res) => { const result = service.createBook(req.body); ... };

// src/routes/book.routes.js
router.route('/').get(ctrl.list).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).put(ctrl.update).delete(ctrl.remove);

// src/app.js
app.use('/api/v1/books', require('./routes/book.routes'));`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

// ================= models/book.model.js =================
let books = [
  { id: 1, title: 'Node.js Design Patterns', price: 800 },
  { id: 2, title: 'Eloquent JavaScript', price: 500 },
];
let nextId = 3;
const BookModel = {
  findAll: () => books,
  findById: (id) => books.find(b => b.id === id) || null,
  create: (data) => { const book = { id: nextId++, ...data }; books.push(book); return book; },
  update: (id, data) => {
    const book = books.find(b => b.id === id);
    if (!book) return null;
    Object.assign(book, data);
    return book;
  },
  remove: (id) => { const n = books.length; books = books.filter(b => b.id !== id); return books.length < n; },
};

// ================= services/book.service.js =================
// business rules only: no req / res here
const BookService = {
  list: () => BookModel.findAll(),
  get: (id) => BookModel.findById(id),
  create: ({ title, price }) => {
    if (!title || typeof price !== 'number' || price <= 0) {
      return { error: 'title and a positive price are required' };
    }
    return { book: BookModel.create({ title: title.trim(), price }) };
  },
  update: (id, { title, price }) => {
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) return { error: 'price must be positive' };
    const changes = {};
    if (title) changes.title = title.trim();
    if (price !== undefined) changes.price = price;
    const book = BookModel.update(id, changes);
    return book ? { book } : { notFound: true };
  },
  remove: (id) => BookModel.remove(id),
};

// ================= controllers/book.controller.js =================
const BookController = {
  list: (req, res) => res.json(BookService.list()),
  getOne: (req, res) => {
    const book = BookService.get(Number(req.params.id));
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  },
  create: (req, res) => {
    const result = BookService.create(req.body ?? {});
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(201).json(result.book);
  },
  update: (req, res) => {
    const result = BookService.update(Number(req.params.id), req.body ?? {});
    if (result.error) return res.status(400).json({ error: result.error });
    if (result.notFound) return res.status(404).json({ error: 'Book not found' });
    res.json(result.book);
  },
  remove: (req, res) => {
    if (!BookService.remove(Number(req.params.id))) return res.status(404).json({ error: 'Book not found' });
    res.sendStatus(204);
  },
};

// ================= routes/book.routes.js =================
const bookRouter = express.Router();
bookRouter.route('/')
  .get(BookController.list)
  .post(BookController.create);
bookRouter.route('/:id')
  .get(BookController.getOne)
  .put(BookController.update)
  .delete(BookController.remove);

// ================= app.js =================
app.use('/api/v1/books', bookRouter);

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/v1/books' },
          { method: 'POST', url: '/api/v1/books', body: { title: 'Clean Code', price: -5 } },
          { method: 'POST', url: '/api/v1/books', body: { title: 'Clean Code', price: 650 } },
          { method: 'PUT', url: '/api/v1/books/2', body: { price: 450 } },
          { method: 'DELETE', url: '/api/v1/books/1' },
          { method: 'GET', url: '/api/v1/books/1' },
          { method: 'GET', url: '/api/v1/books' },
        ],
      },
      result: `GET /api/v1/books → 200 [{"id":1,"title":"Node.js Design Patterns","price":800},{"id":2,"title":"Eloquent JavaScript","price":500}]
POST /api/v1/books → 400 {"error":"title and a positive price are required"}
POST /api/v1/books → 201 {"id":3,"title":"Clean Code","price":650}
PUT /api/v1/books/2 → 200 {"id":2,"title":"Eloquent JavaScript","price":450}
DELETE /api/v1/books/1 → 204
GET /api/v1/books/1 → 404 {"error":"Book not found"}
GET /api/v1/books → 200 [{"id":2,"title":"Eloquent JavaScript","price":450},{"id":3,"title":"Clean Code","price":650}]`,
      explanation: 'The controller never touches the books array and the service never touches req/res. Tomorrow you could swap BookModel for a Mongoose model and only the model (and the async keywords) would change.',
    },
    {
      title: 'router.param() and nested routers with mergeParams',
      scenario: 'Courses have lessons: /api/courses/:courseId/lessons. Load the course once with router.param and let the lessons router read courseId.',
      steps: [
        'Create coursesRouter and add coursesRouter.param("courseId", loader)',
        'The loader finds the course, attaches req.course or responds 404',
        'Create lessonsRouter = express.Router({ mergeParams: true })',
        'Mount lessonsRouter at "/:courseId/lessons" on coursesRouter',
        'Mount coursesRouter at /api/courses and test',
      ],
      code: `coursesRouter.param('courseId', (req, res, next, value) => {
  const course = courses.find(c => c.id === Number(value));
  if (!course) return res.status(404).json({ error: 'Course not found' });
  req.course = course;
  next();
});
const lessonsRouter = express.Router({ mergeParams: true });
coursesRouter.use('/:courseId/lessons', lessonsRouter);`,
      api: {
        code: `const express = require('express');
const app = express();

const courses = [
  { id: 1, title: 'Node.js', lessons: ['Intro', 'Modules', 'fs'] },
  { id: 2, title: 'Express', lessons: ['Routing', 'Middleware'] },
];

const coursesRouter = express.Router();

// runs whenever a route on this router contains :courseId
coursesRouter.param('courseId', (req, res, next, value) => {
  const course = courses.find(c => c.id === Number(value));
  if (!course) return res.status(404).json({ error: 'Course not found' });
  req.course = course;
  next();
});

coursesRouter.get('/', (req, res) => {
  res.json(courses.map(c => ({ id: c.id, title: c.title })));
});

coursesRouter.get('/:courseId', (req, res) => {
  res.json({ id: req.course.id, title: req.course.title, totalLessons: req.course.lessons.length });
});

// nested router: needs mergeParams to read :courseId
const lessonsRouter = express.Router({ mergeParams: true });
lessonsRouter.get('/', (req, res) => {
  res.json({ courseId: req.params.courseId, lessons: req.course.lessons });
});
lessonsRouter.get('/:index', (req, res) => {
  const lesson = req.course.lessons[Number(req.params.index) - 1];
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  res.json({ courseId: req.params.courseId, lesson });
});

coursesRouter.use('/:courseId/lessons', lessonsRouter);
app.use('/api/courses', coursesRouter);

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/courses' },
          { method: 'GET', url: '/api/courses/2' },
          { method: 'GET', url: '/api/courses/1/lessons' },
          { method: 'GET', url: '/api/courses/1/lessons/3' },
          { method: 'GET', url: '/api/courses/7/lessons' },
        ],
      },
      result: `GET /api/courses → 200 [{"id":1,"title":"Node.js"},{"id":2,"title":"Express"}]
GET /api/courses/2 → 200 {"id":2,"title":"Express","totalLessons":2}
GET /api/courses/1/lessons → 200 {"courseId":"1","lessons":["Intro","Modules","fs"]}
GET /api/courses/1/lessons/3 → 200 {"courseId":"1","lesson":"fs"}
GET /api/courses/7/lessons → 404 {"error":"Course not found"}`,
      explanation: 'router.param runs once per request before any matching route, so no route needs to repeat the lookup. Without mergeParams: true, req.params.courseId would be undefined inside lessonsRouter.',
    },
    {
      title: 'Real multi-file project with app.js / server.js split (run locally)',
      scenario: 'Create the actual folder structure used in companies.',
      steps: [
        'mkdir student-api && cd student-api && npm init -y && npm i express',
        'Create the folders: src/routes, src/controllers, src/services, src/models',
        'Create each file below',
        'Add "dev": "node --watch src/server.js" to package.json scripts',
        'npm run dev and open http://localhost:3000/api/v1/students',
      ],
      code: `// src/models/student.model.js
const students = [{ id: 1, name: 'Asha' }];
exports.findAll = () => students;
exports.findById = (id) => students.find(s => s.id === id);
exports.create = (name) => { const s = { id: students.length + 1, name }; students.push(s); return s; };

// src/services/student.service.js
const Student = require('../models/student.model');
exports.getAll = () => Student.findAll();
exports.getById = (id) => Student.findById(id);
exports.create = ({ name }) => {
  if (!name) throw new Error('name is required');
  return Student.create(name.trim());
};

// src/controllers/student.controller.js
const service = require('../services/student.service');
exports.list = (req, res) => res.json(service.getAll());
exports.getOne = (req, res) => {
  const s = service.getById(Number(req.params.id));
  if (!s) return res.status(404).json({ error: 'Student not found' });
  res.json(s);
};
exports.create = (req, res) => {
  try {
    res.status(201).json(service.create(req.body ?? {}));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// src/routes/student.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/student.controller');
router.route('/').get(ctrl.list).post(ctrl.create);
router.get('/:id', ctrl.getOne);
module.exports = router;

// src/routes/index.js
const router = require('express').Router();
router.use('/students', require('./student.routes'));
module.exports = router;

// src/app.js
const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/v1', require('./routes'));
module.exports = app;

// src/server.js
const app = require('./app');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));`,
      result: `GET /api/v1/students → 200 [{"id":1,"name":"Asha"}]
POST /api/v1/students {"name":"Ravi"} → 201 {"id":2,"name":"Ravi"}
POST /api/v1/students {} → 400 {"error":"name is required"}`,
      explanation: 'routes/index.js is a "router of routers": adding a new resource means one new line there. server.js is the only file that opens a port, so tests can require("./app") directly.',
    },
  ],
  interview: [
    { q: 'What is express.Router()?', a: 'A factory that creates a modular, mountable mini-app with its own middleware and routes. It is mounted on the main app (or another router) with app.use(prefix, router).', level: 'Easy' },
    { q: 'Explain MVC in the context of an Express app.', a: 'Model = data and data access (Mongoose/Sequelize models), View = the output (EJS templates or JSON), Controller = receives the request, coordinates the model, and returns the view/response. APIs usually add a Service layer for business logic.', level: 'Medium' },
    { q: 'Why add a service layer instead of putting logic in controllers?', a: 'Separation of concerns: services hold business rules without req/res, so they are reusable (CLI, jobs, other controllers), easier to unit-test and the controller stays thin (HTTP only).', level: 'Medium' },
    { q: 'What does router.route() give you?', a: 'A single route object for one path on which you chain .get().post().put().delete(), avoiding duplicated path strings.', level: 'Easy' },
    { q: 'What is mergeParams?', a: 'An option of express.Router({ mergeParams: true }) that lets a child router access route parameters defined in the parent mount path, e.g. :courseId in /courses/:courseId/lessons.', level: 'Medium' },
    { q: 'What is router.param()?', a: 'A hook that runs a callback (req, res, next, value) whenever a route in that router contains the named parameter, typically to load and validate the record once.', level: 'Hard' },
    { q: 'Why separate app.js and server.js?', a: 'app.js builds and exports the Express app; server.js calls listen. Tests (Supertest) import the app without binding a port, and you can start the server differently (cluster, https) without touching the app.', level: 'Medium' },
    { q: 'Layer-based vs feature-based folder structure?', a: 'Layer-based groups by type (routes/, controllers/, services/). Feature-based groups by domain (modules/users/, modules/orders/) with each feature holding its own route, controller, service and model. Feature-based scales better for large teams.', level: 'Medium' },
    { q: 'How do you version a REST API in Express?', a: 'Mount routers under a versioned prefix: app.use("/api/v1", v1Router), app.use("/api/v2", v2Router). Other options: a header (Accept-Version) or media type versioning.', level: 'Easy' },
    { q: 'Can a router have its own middleware and error handler?', a: 'Yes. router.use() adds middleware only for that router, and a 4-argument middleware added to the router handles errors raised in its routes (errors not handled there bubble to the app).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a products router with GET / and GET /:id and mount it at /api/v1/products.',
      hint: 'express.Router(), relative paths, app.use.',
      solution: `const products = [{ id: 1, name: 'Mouse' }, { id: 2, name: 'Keyboard' }];
const productRouter = express.Router();
productRouter.get('/', (req, res) => res.json(products));
productRouter.get('/:id', (req, res) => {
  const p = products.find(x => x.id === Number(req.params.id));
  p ? res.json(p) : res.status(404).json({ error: 'Not found' });
});
app.use('/api/v1/products', productRouter);`,
    },
    {
      task: 'Add a router-level middleware to the products router that logs "[products] METHOD URL".',
      hint: 'productRouter.use() before the routes.',
      solution: `productRouter.use((req, res, next) => {
  console.log('[products]', req.method, req.originalUrl);
  next();
});`,
    },
    {
      task: 'Write a todo service (no req/res) with add(title), list(), toggle(id) and a controller using it.',
      hint: 'Service returns data or null; controller maps null → 404.',
      solution: `// service
const todos = [];
const TodoService = {
  list: () => todos,
  add: (title) => { const t = { id: todos.length + 1, title, done: false }; todos.push(t); return t; },
  toggle: (id) => { const t = todos.find(x => x.id === id); if (!t) return null; t.done = !t.done; return t; },
};
// controller
const TodoController = {
  list: (req, res) => res.json(TodoService.list()),
  add: (req, res) => {
    if (!req.body?.title) return res.status(400).json({ error: 'title required' });
    res.status(201).json(TodoService.add(req.body.title));
  },
  toggle: (req, res) => {
    const t = TodoService.toggle(Number(req.params.id));
    t ? res.json(t) : res.status(404).json({ error: 'Todo not found' });
  },
};
// routes
const r = express.Router();
r.route('/').get(TodoController.list).post(TodoController.add);
r.patch('/:id/toggle', TodoController.toggle);
app.use('/api/todos', r);`,
    },
    {
      task: 'Build nested routes /api/users/:userId/orders that return the orders of that user.',
      hint: 'express.Router({ mergeParams: true }).',
      solution: `const orders = [{ id: 1, userId: 1, item: 'Pen' }, { id: 2, userId: 2, item: 'Bag' }];
const ordersRouter = express.Router({ mergeParams: true });
ordersRouter.get('/', (req, res) => {
  res.json(orders.filter(o => o.userId === Number(req.params.userId)));
});
const usersRouter = express.Router();
usersRouter.use('/:userId/orders', ordersRouter);
app.use('/api/users', usersRouter);`,
    },
    {
      task: 'Write src/routes/index.js that mounts students, courses and health routers under /api/v1.',
      hint: 'One router that uses other routers.',
      solution: `// src/routes/index.js
const router = require('express').Router();
router.use('/students', require('./student.routes'));
router.use('/courses', require('./course.routes'));
router.get('/health', (req, res) => res.json({ status: 'ok' }));
module.exports = router;

// src/app.js
app.use('/api/v1', require('./routes'));`,
    },
  ],
  quiz: [
    { question: 'A router has router.get("/:id") and is mounted with app.use("/api/books", router). Which URL reaches it?', options: ['/:id', '/books/5', '/api/books/5', '/api/5'], answer: 2, explanation: 'The mount prefix + the relative router path.' },
    { question: 'Which layer should contain the rule "price must be positive"?', options: ['Service', 'Route', 'server.js', 'Model only'], answer: 0, explanation: 'Business rules belong in the service layer.' },
    { question: 'Which option lets a child router read :courseId from its parent path?', options: ['strict: true', 'caseSensitive: true', 'mergeParams: true', 'params: "inherit"'], answer: 2, explanation: 'mergeParams merges the parent params into req.params.' },
    { question: 'What is NOT a responsibility of a controller?', options: ['Reading req.params', 'Choosing the status code', 'Sending the response', 'Running SQL queries directly'], answer: 3, explanation: 'Data access belongs in the model/repository layer.' },
    { question: 'Which call chains several methods for one path?', options: ['router.all()', 'router.route("/:id").get(...).put(...)', 'router.param()', 'app.listen()'], answer: 1, explanation: 'router.route() returns a route object you can chain.' },
  ],
};
