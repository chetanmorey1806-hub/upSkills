// Auto-loads every topic file in each folder (sorted by filename).
// Files that are missing a default export (e.g. half-written) are skipped.
const load = (mods) =>
  Object.keys(mods)
    .sort()
    .map((k) => mods[k].default)
    .filter((t) => t && t.id && Array.isArray(t.theory));

const excelDays = load(import.meta.glob('./excel-days/*.js', { eager: true })).sort((a, b) => (a.day || 0) - (b.day || 0));
const excelExtra = load(import.meta.glob('./excel-extra/*.js', { eager: true })).sort((a, b) => (a.extraNo || 0) - (b.extraNo || 0));
const excelGuides = load(import.meta.glob('./excel/*.js', { eager: true }));
const powerbiGuides = load(import.meta.glob('./powerbi/*.js', { eager: true }));
const powerbiDays = load(import.meta.glob('./powerbi-days/*.js', { eager: true })).sort((a, b) => (a.day || 0) - (b.day || 0));
const byDay = (a, b) => (a.day || 0) - (b.day || 0);
const byExtra = (a, b) => (a.extraNo || 0) - (b.extraNo || 0);
const htmlDays = load(import.meta.glob('./html-days/*.js', { eager: true })).sort(byDay);
const htmlExtra = load(import.meta.glob('./html-extra/*.js', { eager: true })).sort(byExtra);
const cssDays = load(import.meta.glob('./css-days/*.js', { eager: true })).sort(byDay);
const jsDays = load(import.meta.glob('./js-days/*.js', { eager: true })).sort(byDay);
const reactDays = load(import.meta.glob('./react-days/*.js', { eager: true })).sort(byDay);
const bootstrapDays = load(import.meta.glob('./bootstrap-days/*.js', { eager: true })).sort(byDay);
const nodeDays = load(import.meta.glob('./node-days/*.js', { eager: true })).sort(byDay);
const nextjsDays = load(import.meta.glob('./nextjs-days/*.js', { eager: true })).sort(byDay);
const vueDays = load(import.meta.glob('./vue-days/*.js', { eager: true })).sort(byDay);
const mongodbDays = load(import.meta.glob('./mongodb-days/*.js', { eager: true })).sort(byDay);
const reactproDays = load(import.meta.glob('./reactpro-days/*.js', { eager: true })).sort(byDay);
const tsDays = load(import.meta.glob('./ts-days/*.js', { eager: true })).sort(byDay);
const mernDays = load(import.meta.glob('./mern-days/*.js', { eager: true })).sort(byDay);
const mernInterview = load(import.meta.glob('./mern-interview/*.js', { eager: true })).sort((a, b) => (a.extraNo || 0) - (b.extraNo || 0));
const javaGlob = {
  corejava: load(import.meta.glob('./corejava-days/*.js', { eager: true })),
  collections: load(import.meta.glob('./collections-days/*.js', { eager: true })),
  advjava: load(import.meta.glob('./advjava-days/*.js', { eager: true })),
  hibernate: load(import.meta.glob('./hibernate-days/*.js', { eager: true })),
  spring: load(import.meta.glob('./spring-days/*.js', { eager: true })),
  springboot: load(import.meta.glob('./springboot-days/*.js', { eager: true })),
  javatech: load(import.meta.glob('./javatech-days/*.js', { eager: true })),
};
Object.values(javaGlob).forEach((l) => l.sort(byDay));
const pyGlob = {
  python: load(import.meta.glob('./python-days/*.js', { eager: true })),
  sql: load(import.meta.glob('./sql-days/*.js', { eager: true })),
  flask: load(import.meta.glob('./flask-days/*.js', { eager: true })),
  django: load(import.meta.glob('./django-days/*.js', { eager: true })),
  drf: load(import.meta.glob('./drf-days/*.js', { eager: true })),
  pydsa: load(import.meta.glob('./pydsa-days/*.js', { eager: true })),
  pydata: load(import.meta.glob('./pydata-days/*.js', { eager: true })),
  pyml: load(import.meta.glob('./pyml-days/*.js', { eager: true })),
  fastapi: load(import.meta.glob('./fastapi-days/*.js', { eager: true })),
  pyauto: load(import.meta.glob('./pyauto-days/*.js', { eager: true })),
  pytools: load(import.meta.glob('./pytools-days/*.js', { eager: true })),
};
const pythonExtra = load(import.meta.glob('./python-extra/*.js', { eager: true })).sort(byExtra);
const softDays = load(import.meta.glob('./softskills-days/*.js', { eager: true })).sort(byDay);
Object.values(pyGlob).forEach((l) => l.sort(byDay));
const dotnetDays = load(import.meta.glob('./dotnet-days/*.js', { eager: true })).sort(byDay);
const dotnetExtra = load(import.meta.glob('./dotnet-extra/*.js', { eager: true })).sort(byExtra);
const dotnetPro = load(import.meta.glob('./dotnetpro-days/*.js', { eager: true })).sort(byDay);
const aiDays = load(import.meta.glob('./ai-days/*.js', { eager: true })).sort(byDay);
const mysqlDays = load(import.meta.glob('./mysql-days/*.js', { eager: true })).sort(byDay);
const powerbiExtra = load(import.meta.glob('./powerbi-extra/*.js', { eager: true })).sort((a, b) => (a.extraNo || 0) - (b.extraNo || 0));

export const tracks = {
  excel: {
    key: 'excel',
    name: 'Excel 60-Day Course',
    short: 'Excel',
    icon: '📗',
    color: 'var(--excel)',
    tagline: '8 modules, 60 days: from Excel basics to formulas, lookups, pivots, dashboards, Power Query and VBA.',
    unit: 'Day',
    topics: excelDays,
  },
  extra: {
    key: 'extra',
    name: 'Excel Extra Skills',
    short: 'Extra Skills',
    icon: '🚀',
    color: '#0e7490',
    tagline: '28 job-oriented skills: shortcuts, Paste Special, dynamic arrays, LET/LAMBDA, M language and Power BI integration.',
    unit: 'Skill',
    topics: excelExtra,
  },
  powerbi: {
    key: 'powerbi',
    name: 'Power BI 45-Day Course',
    short: 'Power BI',
    icon: '📊',
    color: 'var(--pbi)',
    tagline: '8 modules, 45 days: Power Query, data modeling, DAX, visuals, advanced features, Service, AI and a final project.',
    unit: 'Day',
    lang: 'pbi',
    topics: powerbiDays,
  },
  pbiextra: {
    key: 'pbiextra',
    name: 'Power BI Extra Topics',
    short: 'PBI Extra',
    icon: '⚙️',
    color: '#b45309',
    tagline: '44 advanced topics: M language, DAX functions, reporting features, and administration (composite models, Direct Lake, pipelines, XMLA, Embedded).',
    unit: 'Topic',
    lang: 'pbi',
    topics: powerbiExtra,
  },
  pbiguides: {
    key: 'pbiguides',
    name: 'Power BI Topic Guides',
    short: 'PBI Guides',
    icon: '📘',
    color: '#9333ea',
    tagline: 'Topic-wise deep-dive revision notes (18 topics) with PL-300 style interview questions.',
    unit: 'Topic',
    lang: 'pbi',
    topics: powerbiGuides,
  },
  html: {
    key: 'html', name: 'HTML 30-Day Course', short: 'HTML', icon: '🟧', color: '#e34c26', unit: 'Day', lang: 'web', group: 'web',
    tagline: '6 modules, 30 days: structure, text, links, images, lists, tables, forms, semantic HTML, media, HTML5, SEO and accessibility.',
    topics: htmlDays,
  },
  htmlextra: {
    key: 'htmlextra', name: 'HTML Extra Topics', short: 'HTML Extra', icon: '🧩', color: '#c2410c', unit: 'Topic', lang: 'web', group: 'web',
    tagline: '15 must-know topics: data-* attributes, dialog, picture/srcset, FormData, Web Storage, drag & drop, PWA, Open Graph, JSON-LD and ARIA.',
    topics: htmlExtra,
  },
  css: {
    key: 'css', name: 'CSS 30-Day Course', short: 'CSS', icon: '🟦', color: '#2563eb', unit: 'Day', lang: 'web', group: 'web',
    tagline: '7 modules, 30 days: selectors, box model, positioning, Flexbox, Grid, responsive design, variables, animations and modern CSS.',
    topics: cssDays,
  },
  js: {
    key: 'js', name: 'JavaScript 45-Day Course', short: 'JavaScript', icon: '🟨', color: '#ca8a04', unit: 'Day', lang: 'web', group: 'web',
    tagline: '7 modules, 45 days: basics, functions, arrays, objects, DOM & events, async (promises, fetch, event loop), OOP and advanced JS.',
    topics: jsDays,
  },
  react: {
    key: 'react', name: 'React 60-Day Course', short: 'React', icon: '⚛️', color: '#0891b2', unit: 'Day', lang: 'web', group: 'web',
    tagline: '12 modules, 60 days: JSX, hooks, routing, Redux, then industry skills (Tailwind/MUI, Axios, React Query, auth, charts, tables, testing, CI/CD), React Native and 3 final projects: Weather app, E-commerce website and E-commerce mobile app.',
    topics: reactDays,
  },
  bootstrap: {
    key: 'bootstrap', name: 'Bootstrap 5 (15 Days)', short: 'Bootstrap', icon: '🅱️', color: '#7952b3', unit: 'Day', lang: 'web', group: 'web',
    tagline: 'Responsive grid, utilities, components (navbar, cards, forms, modals, carousel), JS plugins, theming / dark mode and React-Bootstrap.',
    topics: bootstrapDays,
  },
  node: {
    key: 'node', name: 'Node.js + Express (30 Days)', short: 'Node & Express', icon: '🟩', color: '#3c873a', unit: 'Day', lang: 'web', group: 'web',
    tagline: 'Node core, npm, fs, events, streams, Express routing & middleware, REST APIs, MongoDB/Mongoose, MySQL, JWT auth, security, testing, Socket.io and deployment.',
    topics: nodeDays,
  },
  mongodb: {
    key: 'mongodb', name: 'MongoDB & Mongoose (15 Days)', short: 'MongoDB', icon: '🍃', color: '#13aa52', unit: 'Day', lang: 'web', group: 'mern',
    tagline: 'NoSQL basics, CRUD, query operators, aggregation pipeline, indexes & explain, schema design, transactions, Mongoose models/populate/middleware, Atlas and interview prep, with a built-in MongoDB shell.',
    topics: mongodbDays,
  },
  reactpro: {
    key: 'reactpro', name: 'Advanced React for MERN (12 Days)', short: 'Advanced React', icon: '⚛️', color: '#087ea4', unit: 'Day', lang: 'web', group: 'mern',
    tagline: 'React internals and React 19, TanStack Query, Redux Toolkit/Zustand, advanced forms, patterns, performance, auth UI, Tailwind, testing with MSW, React + TypeScript and machine-coding rounds.',
    topics: reactproDays,
  },
  ts: {
    key: 'ts', name: 'TypeScript for MERN (12 Days)', short: 'TypeScript', icon: '🔷', color: '#3178c6', unit: 'Day', lang: 'web', group: 'mern',
    tagline: 'Types, functions, interfaces, narrowing, generics, classes, utility and advanced types, then TypeScript with React, Node, Express, Mongoose and Zod.',
    topics: tsDays,
  },
  mern: {
    key: 'mern', name: 'MERN Full Stack: Integration & Deployment (15 Days)', short: 'MERN Full Stack', icon: '🚀', color: '#0f766e', unit: 'Day', lang: 'web', group: 'mern',
    tagline: 'Connect React, Express and MongoDB end to end: CRUD, JWT + refresh-token auth, RBAC, security, uploads, search & pagination, Socket.IO, payments, caching, testing, Docker, CI/CD, deployment and a capstone.',
    topics: mernDays,
  },
  merninterview: {
    key: 'merninterview', name: 'MERN Interview Preparation', short: 'MERN Interview', icon: '🎯', color: '#be123c', unit: 'Topic', lang: 'web', group: 'mern',
    tagline: 'JavaScript, async JS, coding round polyfills, web fundamentals, React, machine coding, Node.js, Express/REST, MongoDB, system design, DevOps and project/HR round: 300+ interview questions with answers.',
    topics: mernInterview,
  },
  nextjs: {
    key: 'nextjs', name: 'Next.js (20 Days)', short: 'Next.js', icon: '▲', color: '#111827', unit: 'Day', lang: 'web', group: 'web',
    tagline: 'App Router, Server & Client Components, data fetching & caching, Server Actions, route handlers, Prisma, Auth.js, middleware, SEO and Vercel deployment.',
    topics: nextjsDays,
  },
  vue: {
    key: 'vue', name: 'Vue.js 3 (25 Days)', short: 'Vue.js', icon: '💚', color: '#42b883', unit: 'Day', lang: 'web', group: 'web',
    tagline: 'Templates & directives, reactivity, computed & watchers, components, props/emits/slots, Composition API, composables, Vue Router, Pinia, testing and Nuxt.',
    topics: vueDays,
  },
  corejava: {
    key: 'corejava', name: 'Core Java 45-Day Course', short: 'Core Java', icon: '☕', color: '#e76f00', unit: 'Day', lang: 'java', group: 'java',
    tagline: '8 modules, 45 days: basics, OOP, exceptions, generics, multithreading, Java 8+ streams & lambdas, JVM and coding programs.',
    topics: javaGlob.corejava,
  },
  collections: {
    key: 'collections', name: 'Collection Framework (15 Days)', short: 'Collections', icon: '🗂️', color: '#b45309', unit: 'Day', lang: 'java', group: 'java',
    tagline: 'List, Set, Queue, Map, HashMap internals, Comparable vs Comparator, concurrent and immutable collections.',
    topics: javaGlob.collections,
  },
  advjava: {
    key: 'advjava', name: 'Advanced Java: JDBC, Servlet, JSP (20 Days)', short: 'Adv Java', icon: '🌐', color: '#0f766e', unit: 'Day', lang: 'java', group: 'java',
    tagline: 'JDBC with MySQL, Servlets on Tomcat, sessions, filters, JSP, EL/JSTL and an MVC CRUD project.',
    topics: javaGlob.advjava,
  },
  hibernate: {
    key: 'hibernate', name: 'Hibernate (12 Days)', short: 'Hibernate', icon: '🐘', color: '#7c2d12', unit: 'Day', lang: 'java', group: 'java',
    tagline: 'ORM, entities, Session, HQL/JPQL, Criteria, mappings, fetch types, N+1 and caching.',
    topics: javaGlob.hibernate,
  },
  spring: {
    key: 'spring', name: 'Spring Framework (15 Days)', short: 'Spring', icon: '🌱', color: '#15803d', unit: 'Day', lang: 'java', group: 'java',
    tagline: 'IoC, dependency injection, bean lifecycle, AOP, JdbcTemplate, transactions and Spring MVC.',
    topics: javaGlob.spring,
  },
  springboot: {
    key: 'springboot', name: 'Spring Boot (25 Days)', short: 'Spring Boot', icon: '🚀', color: '#16a34a', unit: 'Day', lang: 'java', group: 'java',
    tagline: 'REST APIs, validation, Spring Data JPA, Spring Security + JWT, testing, microservices, Docker and a React full-stack project.',
    topics: javaGlob.springboot,
  },
  javatech: {
    key: 'javatech', name: 'Java Technologies & Frameworks (30 Days)', short: 'Java Tech', icon: '🧰', color: '#9a3412', unit: 'Day', lang: 'java', group: 'java',
    tagline: '7 modules, 30 days: Maven, Gradle, Git, Lombok, logging, JUnit & Mockito, SOLID & design patterns, DSA, Java 21, JVM tuning, JavaFX, Thymeleaf, MongoDB, Redis, Batch, WebFlux, Spring Cloud, Kafka, GraphQL, OAuth2/Keycloak, Docker, Kubernetes, CI/CD and AWS.',
    topics: javaGlob.javatech,
  },
  python: {
    key: 'python', name: 'Python 45-Day Course', short: 'Python', icon: '🐍', color: '#3776ab', unit: 'Day', lang: 'python', group: 'python',
    tagline: '7 modules, 45 days: basics, data structures, functions, files, OOP, decorators, generators, async, testing and coding programs.',
    topics: pyGlob.python,
  },
  sql: {
    key: 'sql', name: 'SQL & MySQL (15 Days)', short: 'SQL', icon: '🗄️', color: '#00758f', unit: 'Day', lang: 'python', group: 'python',
    tagline: 'DDL, DML, joins, subqueries, GROUP BY, views, indexes, normalization, transactions, procedures, window functions and CTEs.',
    topics: pyGlob.sql,
  },
  flask: {
    key: 'flask', name: 'Flask (12 Days)', short: 'Flask', icon: '🧪', color: '#334155', unit: 'Day', lang: 'python', group: 'python',
    tagline: 'Routing, Jinja templates, forms, sessions, SQLAlchemy, migrations, login, blueprints, REST APIs and deployment.',
    topics: pyGlob.flask,
  },
  django: {
    key: 'django', name: 'Django 30-Day Course', short: 'Django', icon: '🟩', color: '#0c4b33', unit: 'Day', lang: 'python', group: 'python',
    tagline: 'MVT, ORM, admin, forms, class-based views, authentication, permissions, middleware, caching, testing and deployment.',
    topics: pyGlob.django,
  },
  drf: {
    key: 'drf', name: 'Django REST Framework (12 Days)', short: 'DRF', icon: '🔌', color: '#a30000', unit: 'Day', lang: 'python', group: 'python',
    tagline: 'Serializers, API views, viewsets, routers, JWT auth, permissions, filtering, pagination, docs and a React full-stack project.',
    topics: pyGlob.drf,
  },
  pyextra: {
    key: 'pyextra', name: 'Python Extra Topics (20)', short: 'Python Extra', icon: '🧩', color: '#4b8bbe', unit: 'Topic', lang: 'python', group: 'python',
    tagline: 'match-case, collections, itertools, functools, datetime, pathlib, argparse, descriptors, metaclasses, memory management, typing, packaging and new Python 3.11-3.13 features.',
    topics: pythonExtra,
  },
  pydsa: {
    key: 'pydsa', name: 'DSA with Python (15 Days)', short: 'Python DSA', icon: '🧠', color: '#0f766e', unit: 'Day', lang: 'python', group: 'python',
    tagline: 'Big-O, arrays, strings, hashing, recursion, stacks, queues, linked lists, searching, sorting, trees, heaps, graphs and dynamic programming for coding interviews.',
    topics: pyGlob.pydsa,
  },
  pydata: {
    key: 'pydata', name: 'Data Analysis with Python (15 Days)', short: 'NumPy & Pandas', icon: '🐼', color: '#150458', unit: 'Day', lang: 'python', group: 'python',
    tagline: 'NumPy, Pandas, data cleaning, groupby, merges, time series, Matplotlib, Seaborn and end-to-end EDA projects.',
    topics: pyGlob.pydata,
  },
  pyml: {
    key: 'pyml', name: 'Machine Learning with Python (12 Days)', short: 'ML', icon: '🤖', color: '#f7931e', unit: 'Day', lang: 'python', group: 'python',
    tagline: 'scikit-learn: preprocessing, regression, classification, trees, ensembles, clustering, PCA, tuning, deep learning intro and an end-to-end ML project.',
    topics: pyGlob.pyml,
  },
  fastapi: {
    key: 'fastapi', name: 'FastAPI (10 Days)', short: 'FastAPI', icon: '⚡', color: '#009688', unit: 'Day', lang: 'python', group: 'python',
    tagline: 'Path/query params, Pydantic, response models, dependency injection, SQLAlchemy CRUD, JWT auth, middleware, async, testing and deployment.',
    topics: pyGlob.fastapi,
  },
  pyauto: {
    key: 'pyauto', name: 'Python Automation & Web Scraping (10 Days)', short: 'Automation', icon: '⚙️', color: '#b45309', unit: 'Day', lang: 'python', group: 'python',
    tagline: 'Automate files, Excel, Word/PDF, emails and browsers; REST APIs with requests, scraping with BeautifulSoup and Selenium, scheduling and bots.',
    topics: pyGlob.pyauto,
  },
  pytools: {
    key: 'pytools', name: 'Python Tools & Deployment (12 Days)', short: 'Python Tools', icon: '🧰', color: '#475569', unit: 'Day', lang: 'python', group: 'python',
    tagline: 'Git, project structure, pytest, SQLAlchemy, Tkinter, Streamlit, Pydantic, Celery, Docker, GitHub Actions CI/CD, deployment and system design basics.',
    topics: pyGlob.pytools,
  },
  softskills: {
    key: 'softskills', name: 'Soft Skills & HR Interview (15 Days)', short: 'Soft Skills', icon: '🗣️', color: '#db2777', unit: 'Day', lang: 'soft', group: 'career',
    tagline: 'Communication, self-introduction, spoken English, body language, emails, resume, LinkedIn, HR and STAR answers, group discussion, presentations and workplace skills.',
    topics: softDays,
  },
  mysql: {
    key: 'mysql', name: 'MySQL with Workbench (30 Days)', short: 'MySQL', icon: '🐬', color: '#00758f', unit: 'Day', lang: 'mysql', group: 'db',
    tagline: '6 modules, 30 days: install MySQL & Workbench, CRUD, functions, joins, subqueries, views, indexes, procedures, triggers, transactions, window functions, EER diagrams, users and backup.',
    topics: mysqlDays,
  },
  dotnet: {
    key: 'dotnet', name: '.NET Full Stack (120 Days)', short: '.NET', icon: '🟣', color: '#68217a', unit: 'Day', lang: 'dotnet', group: 'dotnet',
    tagline: '12 modules, 120 days: C#, complete OOPs, advanced C# & LINQ, SQL Server, HTML/CSS/JS, ASP.NET Core MVC, EF Core, Web API, React, security, testing, Git, deployment and 5 real-time projects.',
    topics: dotnetDays,
  },
  dotnetextra: {
    key: 'dotnetextra', name: '.NET Extra Topics (54)', short: '.NET Extra', icon: '🧱', color: '#512bd4', unit: 'Topic', lang: 'dotnet', group: 'dotnet',
    tagline: 'OOP concepts (association → SOLID & design patterns), advanced C#, advanced SQL Server, and advanced ASP.NET Core / EF Core / Web API.',
    topics: dotnetExtra,
  },
  dotnetpro: {
    key: 'dotnetpro', name: '.NET Advanced: Enterprise Stack (30 Days)', short: '.NET Advanced', icon: '🏢', color: '#3b2fc9', unit: 'Day', lang: 'dotnet', group: 'dotnet',
    tagline: '7 modules, 30 days: ADO.NET & Dapper, Clean Architecture, CQRS & MediatR, Blazor, Redis caching, background jobs, RabbitMQ, microservices, API gateway, gRPC, Polly, TypeScript, Angular with Web API, Docker, Kubernetes and Azure CI/CD.',
    topics: dotnetPro,
  },
  ai: {
    key: 'ai', name: 'Artificial Intelligence (45 Days)', short: 'AI', icon: '🤖', color: '#9333ea', unit: 'Day', lang: 'ai', group: 'ai',
    tagline: '7 modules, 45 days: AI & ML foundations, generative AI & LLMs, prompt engineering, 40+ AI tools, AI APIs, RAG & agents, hands-on ML, careers and a final AI app project.',
    topics: aiDays,
  },
  guides: {
    key: 'guides',
    name: 'Excel Topic Guides',
    short: 'Excel Guides',
    icon: '📚',
    color: '#7c3aed',
    tagline: 'Topic-wise deep-dive revision notes (20 topics) for interview preparation.',
    unit: 'Topic',
    topics: excelGuides,
  },
};

export const trackOrder = ['excel', 'extra', 'powerbi', 'pbiextra', 'guides', 'pbiguides', 'html', 'htmlextra', 'css', 'js', 'react', 'reactpro', 'ts', 'mongodb', 'mern', 'merninterview', 'corejava', 'collections', 'advjava', 'hibernate', 'spring', 'springboot', 'javatech', 'python', 'pyextra', 'pydsa', 'pydata', 'pyml', 'sql', 'flask', 'django', 'drf', 'fastapi', 'pyauto', 'pytools', 'mysql', 'dotnet', 'dotnetextra', 'dotnetpro', 'ai', 'softskills', 'bootstrap', 'node', 'nextjs', 'vue'];
export const trackGroups = [
  { key: 'ai', name: 'Artificial Intelligence', tracks: ['ai'] },
  { key: 'data', name: 'Data Analytics', tracks: ['excel', 'extra', 'powerbi', 'pbiextra', 'guides', 'pbiguides'] },
  { key: 'mern', name: 'MERN Stack', tracks: ['html', 'css', 'js', 'react', 'reactpro', 'ts', 'node', 'mongodb', 'mern', 'merninterview'] },
  { key: 'web', name: 'Web Development', tracks: ['html', 'htmlextra', 'css', 'bootstrap', 'js', 'react', 'node', 'nextjs', 'vue'] },
  { key: 'java', name: 'Java Full Stack', tracks: ['corejava', 'collections', 'advjava', 'hibernate', 'spring', 'springboot', 'javatech'] },
  { key: 'python', name: 'Python Full Stack', tracks: ['python', 'pyextra', 'pydsa', 'pydata', 'pyml', 'sql', 'flask', 'django', 'drf', 'fastapi', 'pyauto', 'pytools'] },
  { key: 'dotnet', name: '.NET Full Stack', tracks: ['dotnet', 'dotnetextra', 'dotnetpro'] },
  { key: 'db', name: 'Databases', tracks: ['mysql', 'sql'] },
  { key: 'career', name: 'Career & Soft Skills', tracks: ['softskills'] },
];
export const isAI = (track) => tracks[track]?.lang === 'ai';
export const isDotnet = (track) => tracks[track]?.lang === 'dotnet';
export const isMySQL = (track) => tracks[track]?.lang === 'mysql';
export const isPython = (track) => tracks[track]?.lang === 'python';
export const isJava = (track) => tracks[track]?.lang === 'java';
export const isWeb = (track) => tracks[track]?.lang === 'web';
export const isSoft = (track) => tracks[track]?.lang === 'soft';
export const isPbi = (track) => tracks[track]?.lang === 'pbi';

export const allTopics = trackOrder.flatMap((k) => tracks[k].topics.map((t) => ({ ...t, track: k })));

export const topicKey = (track, id) => `${track}/${id}`;

export function topicLabel(track, t, index) {
  if (t.day && tracks[track]?.unit === 'Day') return `Day ${t.day}`;
  if (t.extraNo) return `${track === 'extra' ? 'Skill' : 'Topic'} ${t.extraNo}`;
  return `${tracks[track]?.unit || 'Topic'} ${index + 1}`;
}

export function findTopic(track, id) {
  const list = tracks[track]?.topics || [];
  const index = list.findIndex((t) => t.id === id);
  return index === -1 ? null : { topic: list[index], index, list };
}
