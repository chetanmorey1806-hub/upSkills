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
const javaGlob = {
  corejava: load(import.meta.glob('./corejava-days/*.js', { eager: true })),
  collections: load(import.meta.glob('./collections-days/*.js', { eager: true })),
  advjava: load(import.meta.glob('./advjava-days/*.js', { eager: true })),
  hibernate: load(import.meta.glob('./hibernate-days/*.js', { eager: true })),
  spring: load(import.meta.glob('./spring-days/*.js', { eager: true })),
  springboot: load(import.meta.glob('./springboot-days/*.js', { eager: true })),
};
Object.values(javaGlob).forEach((l) => l.sort(byDay));
const pyGlob = {
  python: load(import.meta.glob('./python-days/*.js', { eager: true })),
  sql: load(import.meta.glob('./sql-days/*.js', { eager: true })),
  flask: load(import.meta.glob('./flask-days/*.js', { eager: true })),
  django: load(import.meta.glob('./django-days/*.js', { eager: true })),
  drf: load(import.meta.glob('./drf-days/*.js', { eager: true })),
};
Object.values(pyGlob).forEach((l) => l.sort(byDay));
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
    key: 'react', name: 'React 30-Day Course', short: 'React', icon: '⚛️', color: '#0891b2', unit: 'Day', lang: 'web', group: 'web',
    tagline: '6 modules, 30 days: JSX, components, props, state, hooks, routing, Redux Toolkit, performance, testing, TypeScript and deployment.',
    topics: reactDays,
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
  mysql: {
    key: 'mysql', name: 'MySQL with Workbench (30 Days)', short: 'MySQL', icon: '🐬', color: '#00758f', unit: 'Day', lang: 'mysql', group: 'db',
    tagline: '6 modules, 30 days: install MySQL & Workbench, CRUD, functions, joins, subqueries, views, indexes, procedures, triggers, transactions, window functions, EER diagrams, users and backup.',
    topics: mysqlDays,
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

export const trackOrder = ['excel', 'extra', 'powerbi', 'pbiextra', 'guides', 'pbiguides', 'html', 'htmlextra', 'css', 'js', 'react', 'corejava', 'collections', 'advjava', 'hibernate', 'spring', 'springboot', 'python', 'sql', 'flask', 'django', 'drf', 'mysql'];
export const trackGroups = [
  { key: 'data', name: '📈 Data Analytics', tracks: ['excel', 'extra', 'powerbi', 'pbiextra', 'guides', 'pbiguides'] },
  { key: 'web', name: '💻 Web Development', tracks: ['html', 'htmlextra', 'css', 'js', 'react'] },
  { key: 'java', name: '☕ Java Full Stack', tracks: ['corejava', 'collections', 'advjava', 'hibernate', 'spring', 'springboot'] },
  { key: 'python', name: '🐍 Python Full Stack', tracks: ['python', 'sql', 'flask', 'django', 'drf'] },
  { key: 'db', name: '🗄️ Databases', tracks: ['mysql', 'sql'] },
];
export const isMySQL = (track) => tracks[track]?.lang === 'mysql';
export const isPython = (track) => tracks[track]?.lang === 'python';
export const isJava = (track) => tracks[track]?.lang === 'java';
export const isWeb = (track) => tracks[track]?.lang === 'web';
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
