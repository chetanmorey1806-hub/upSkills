// Real pictures for video lessons, taken from Wikipedia / Wikimedia Commons (free to reuse, credited on screen).
// A slide asks for a picture by its heading + the course subject; the Wikipedia search API returns the best
// matching article and its lead image (a photo, screenshot, diagram or logo). Results are cached in this browser.
// Offline, or when nothing relevant is found, the slide keeps its drawn illustration.
import { tracks } from '../data/index.js';

const API = 'https://en.wikipedia.org/w/api.php';
const CACHE_KEY = 'upskillr-video-img-v6';
const SIZE = 960;

// Course -> [Wikipedia article for the course picture, short keyword added to every slide search]
const SUBJECT = {
  excel: ['Microsoft Excel', 'Excel'], extra: ['Microsoft Excel', 'Excel'], guides: ['Microsoft Excel', 'Excel'],
  powerbi: ['Power Query', 'Power BI'], pbiextra: ['Power Query', 'Power BI'], pbiguides: ['Power Query', 'Power BI'],
  html: ['HTML', 'HTML'], htmlextra: ['HTML', 'HTML'], css: ['CSS', 'CSS'], js: ['JavaScript', 'JavaScript programming'],
  react: ['React (software)', 'React JavaScript'], reactpro: ['React (software)', 'React JavaScript'], ts: ['TypeScript', 'TypeScript'],
  bootstrap: ['Bootstrap (front-end framework)', 'Bootstrap'], node: ['Node.js', 'Node.js'], nextjs: ['Next.js', 'Next.js'],
  vue: ['Vue.js', 'Vue.js'], mongodb: ['MongoDB', 'MongoDB'], mern: ['MongoDB', 'web development'], merninterview: ['Node.js', 'web development'],
  corejava: ['Java virtual machine', 'Java programming'], collections: ['Java collections framework', 'Java programming'], advjava: ['Jakarta EE', 'Java programming'],
  hibernate: ['Hibernate (framework)', 'Hibernate Java'], spring: ['Spring Framework', 'Spring Java'], springboot: ['Spring Boot', 'Spring Boot'],
  javatech: ['Java virtual machine', 'Java programming'],
  python: ['Python (programming language)', 'Python programming'], pyextra: ['Python (programming language)', 'Python programming'],
  pydsa: ['Data structure', 'algorithm'], pydata: ['Pandas (software)', 'data analysis'], pyml: ['Machine learning', 'machine learning'],
  sql: ['SQL', 'SQL'], mysql: ['MySQL', 'MySQL'], flask: ['Flask (web framework)', 'Flask Python'], django: ['Django (web framework)', 'Django Python'],
  drf: ['Django (web framework)', 'REST API'], fastapi: ['FastAPI', 'API'], pyauto: ['Automation', 'automation'], pytools: ['Python (programming language)', 'Python programming'],
  dotnet: ['.NET', 'C#'], dotnetextra: ['.NET', 'C#'], ai: ['Artificial intelligence', 'artificial intelligence'], softskills: ['Communication', 'communication'],
};

// Picture pool per course family: lead images of related articles (people, tools, screenshots).
// One request per course; slides without a picture of their own take turns using these.
const POOLS = {
  python: ['Python (programming language)', 'Guido van Rossum', 'PyCon', 'Project Jupyter', 'Visual Studio Code', 'PyCharm', 'Source code', 'Computer programming', 'Programmer'],
  java: ['Java virtual machine', 'James Gosling', 'Sun Microsystems', 'Eclipse (software)', 'IntelliJ IDEA', 'Apache Tomcat', 'Oracle Corporation', 'Computer programming', 'Programmer'],
  springjava: ['Spring Framework', 'Spring Boot', 'Jakarta EE', 'Hibernate (framework)', 'Microservices', 'Docker (software)', 'Apache Tomcat', 'James Gosling', 'Server (computing)'],
  excel: ['Microsoft Excel', 'Spreadsheet', 'Pivot table', 'VisiCalc', 'Microsoft Office', 'Accountant', 'Data analysis', 'Office'],
  powerbi: ['Power Query', 'Dashboard (computing)', 'Data and information visualization', 'Microsoft Excel', 'Data analysis', 'Business analyst', 'Spreadsheet'],
  web: ['HTML', 'CSS', 'JavaScript', 'World Wide Web', 'Tim Berners-Lee', 'Web browser', 'Brendan Eich', 'Responsive web design', 'Web design', 'Visual Studio Code'],
  jsstack: ['React (software)', 'Node.js', 'Next.js', 'Vue.js', 'TypeScript', 'MongoDB', 'JavaScript', 'Single-page application', 'Ryan Dahl', 'Visual Studio Code'],
  db: ['MySQL', 'Relational database', 'Database', 'Data center', 'Edgar F. Codd', 'Michael Widenius', 'Server room', 'Database administrator'],
  pyweb: ['Django (web framework)', 'Flask (web framework)', 'FastAPI', 'Web server', 'REST', 'Guido van Rossum', 'Data center', 'Visual Studio Code'],
  data: ['Pandas (software)', 'NumPy', 'Matplotlib', 'Project Jupyter', 'Data science', 'Data and information visualization', 'Data analysis', 'Algorithm', 'Data structure'],
  ai: ['Artificial intelligence', 'Machine learning', 'Neural network (machine learning)', 'Alan Turing', 'Deep learning', 'ChatGPT', 'Robot', 'Data center', 'Geoffrey Hinton'],
  auto: ['Automation', 'Robotic process automation', 'Web scraping', 'Python (programming language)', 'Microsoft Excel', 'Industrial robot', 'Computer programming'],
  dotnet: ['.NET', 'C Sharp (programming language)', 'Anders Hejlsberg', 'Visual Studio', 'ASP.NET Core', 'Microsoft SQL Server', 'Microsoft', 'Computer programming'],
  soft: ['Public speaking', 'Job interview', 'Body language', 'Communication', 'Presentation', 'Handshake', 'Meeting', 'Active listening', 'Business etiquette', 'Interview'],
};
const POOL_OF = {
  python: 'python', pyextra: 'python', pytools: 'auto', pyauto: 'auto', pydsa: 'data', pydata: 'data', pyml: 'ai', ai: 'ai',
  corejava: 'java', collections: 'java', javatech: 'java', advjava: 'springjava', hibernate: 'springjava', spring: 'springjava', springboot: 'springjava',
  excel: 'excel', extra: 'excel', guides: 'excel', powerbi: 'powerbi', pbiextra: 'powerbi', pbiguides: 'powerbi',
  html: 'web', htmlextra: 'web', css: 'web', js: 'web', bootstrap: 'web',
  react: 'jsstack', reactpro: 'jsstack', ts: 'jsstack', node: 'jsstack', nextjs: 'jsstack', vue: 'jsstack', mongodb: 'jsstack', mern: 'jsstack', merninterview: 'jsstack',
  sql: 'db', mysql: 'db', flask: 'pyweb', django: 'pyweb', drf: 'pyweb', fastapi: 'pyweb', dotnet: 'dotnet', dotnetextra: 'dotnet', softskills: 'soft',
};
const BAD_FILE = /icon|logo|flag|symbol|commons-|wiki|edit-|question_book|padlock|ambox|disambig|crystal|nuvola|folder|portal|increase|decrease|steady|pog|ooui|protection|text-x|gnome|emblem|star|lock|bee|bird|flower|cosmos|insect|lampyris|howl|wolf|cat\b|dog\b|snake/i;

const STOP = new Set('what is are the and for with from into that this your you how why when where which does using use used about part key points example examples introduction basics overview vs versus between difference other more than its their them they then also only very just will can our own new day lesson module course step steps'.split(' '));
const BAD_TITLE = /disambiguation|\((film|band|album|song|novel|tv series|video game|magazine|surname|given name|name)\)|^list of|\b(cat|dog|animal|bird|snake|python(s)? in|insect|plant)s?\b/i;
// Wikipedia short descriptions that are never what a lesson slide means
const BAD_DESC = /\b(species|genus|family of|animal|mammal|reptile|snake|bird|fish|insect|plant|film|movie|album|song|band|singer|actor|actress|footballer|cricketer|athlete|politician|novel|television|tv series|episode|village|town|city in|river|mountain|district|municipality|cat|dog|horse|deity|mytholog)/i;
const okPage = (p) => p?.thumbnail?.source && !BAD_TITLE.test(p.title) && !BAD_DESC.test(p.description || '');

export const trackKeyOf = (tr) => Object.keys(tracks).find((k) => tracks[k] === tr) || '';

export function subjectOf(tr) {
  const key = trackKeyOf(tr);
  const pool = POOLS[POOL_OF[key]] || [];
  const inner = POOL_OF[key] !== 'soft' && POOL_OF[key] !== 'ai';
  if (SUBJECT[key]) return { article: SUBJECT[key][0], keyword: SUBJECT[key][1], pool, inner };
  const name = String(tr?.name || '').replace(/\(.*?\)/g, '').replace(/\b\d+[- ]?days?\b|\bcourse\b|\bextra topics\b/gi, '').trim();
  return { article: name, keyword: name, pool, inner };
}

// "What is Python? (1/2)" -> "Python"; "Lists: key points" -> "Lists"
export function cleanHeading(h = '') {
  return String(h)
    .replace(/\(\d+\/\d+\)/g, ' ')
    .replace(/:\s*(key points|मुख्य मुद्दे|महत्वाचे मुद्दे).*$/i, '')
    .replace(/[`*_#"“”'’]/g, '')
    .replace(/^(example\s*\d+\s*[:.-]?)/i, '')
    .replace(/^(what|why|how|when|where|which)\s+(is|are|do|does|to|can)\s+(an?\s+|the\s+)?/i, '')
    .replace(/[?!:;,.()[\]{}<>=|\\/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const words = (s) => String(s).toLowerCase().split(/[^a-z0-9#+.]+/).filter((w) => w.length >= 3 && !STOP.has(w));

/* ------------------------------ cache ------------------------------ */
let cache = null;
const readCache = () => {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { cache = {}; }
  return cache;
};
const writeCache = (k, v) => {
  const c = readCache();
  c[k] = v;
  const keys = Object.keys(c);
  if (keys.length > 600) keys.slice(0, keys.length - 600).forEach((x) => delete c[x]);
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch { /* full or blocked */ }
};

// Wikipedia asks API clients to be polite: one request at a time, a small gap, and back off when told to.
let queue = Promise.resolve();
let pauseUntil = 0;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function api(params) {
  const run = async () => {
    const now = Date.now();
    if (now < pauseUntil) throw new Error('wiki: backing off');
    const qs = new URLSearchParams({ format: 'json', origin: '*', action: 'query', prop: 'pageimages|description', piprop: 'thumbnail', pithumbsize: String(SIZE), ...params });
    if (params.prop === 'imageinfo') { qs.delete('piprop'); qs.delete('pithumbsize'); }
    const r = await fetch(`${API}?${qs}`, { headers: { 'Api-User-Agent': 'UpSkillr-lesson-videos/1.0' } });
    if (r.status === 429 || r.status >= 500) { pauseUntil = Date.now() + 60000; throw new Error(`wiki ${r.status}`); }
    if (!r.ok) throw new Error(`wiki ${r.status}`);
    const d = await r.json();
    if (d?.error) { pauseUntil = Date.now() + 60000; throw new Error(`wiki ${d.error.code}`); }
    return Object.values(d?.query?.pages || {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  };
  const job = queue.then(run);
  queue = job.catch(() => {}).then(() => wait(400));
  return job;
}

const pick = (p) => (p?.thumbnail?.source ? { url: p.thumbnail.source, title: p.title } : null);

// The course picture: lead image of the subject's article, else the best search hit for the course keyword.
async function findSubject(subject) {
  const pages = await api({ titles: subject.article, redirects: '1' });
  const direct = pick(pages[0]);
  if (direct) return direct;
  const kw = words(subject.keyword);
  const hits = await api({ generator: 'search', gsrsearch: subject.keyword, gsrlimit: '6', gsrnamespace: '0' });
  const ok = hits.find((p) => okPage(p) && kw.some((w) => p.title.toLowerCase().includes(w)));
  return pick(ok);
}

// Candidate pictures for one slide, best first (topic articles, then course-related articles).
async function findSlide(heading, subject) {
  const h = cleanHeading(heading);
  const kw = words(subject.keyword);
  const aw = words(subject.article.replace(/[()]/g, ' '));
  // words that are about this slide, not just the course name ("What is Python?" has none -> course picture)
  const hw = words(h).filter((w) => !kw.includes(w) && !aw.includes(w));
  const q = `${h} ${subject.keyword}`;
  const pages = await api({ generator: 'search', gsrsearch: q, gsrlimit: '6', gsrnamespace: '0' });
  const usable = pages.filter(okPage);
  const tw = (p) => words(p.title.toLowerCase().replace(/[()]/g, ' '));
  const topical = (p) => tw(p).some((x) => hw.some((w) => x === w || (w.length >= 5 && x.startsWith(w.slice(0, -1)))));
  const related = (p) => (aw.length && aw.every((w) => tw(p).includes(w))) || (kw.length && kw.every((w) => tw(p).some((x) => x === w || x.startsWith(w))));
  // "Pivot table", "Garbage collection" first; then articles about the course itself ("Nonverbal communication")
  return [...usable.filter(topical), ...usable.filter((p) => !topical(p) && related(p))].slice(0, 5).map(pick);
}

// The course's picture pool: lead images of related articles + (tech courses) the screenshots inside the main article.
async function findPool(subject) {
  const out = [];
  if (subject.pool?.length) {
    const pages = await api({ titles: subject.pool.slice(0, 40).join('|'), redirects: '1' });
    const order = (t) => { const i = subject.pool.indexOf(t); return i < 0 ? 99 : i; };
    pages.filter(okPage).sort((a, b) => order(a.title) - order(b.title)).forEach((p) => out.push(pick(p)));
  }
  if (subject.inner) {
    const qs = { generator: 'images', titles: subject.article, gimlimit: '40', prop: 'imageinfo', iiprop: 'url|size|mime', iiurlwidth: String(SIZE), redirects: '1' };
    const files = await api(qs);
    files.forEach((f) => {
      const ii = f.imageinfo?.[0];
      if (!ii || !/image\/(jpeg|png)/.test(ii.mime) || (ii.width || 0) < 320 || BAD_FILE.test(f.title)) return;
      out.push({ url: ii.thumburl || ii.url, title: f.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, '') });
    });
  }
  return out.filter((x, i, all) => x?.url && all.findIndex((y) => y.url === x.url) === i);
}

const inflight = new Map();
/**
 * Resolve a picture request to a list of candidates [{ url, title }] (best first). kind: 'subject' | 'slide'.
 * Cached per query; network failures are not cached so they are retried later.
 */
export function findPicture(req) {
  const key = `${req.kind}|${req.kind === 'slide' ? `${cleanHeading(req.heading)}|${req.subject.keyword}` : req.subject.article}`.toLowerCase();
  const c = readCache();
  if (Array.isArray(c[key])) return Promise.resolve(c[key]);
  if (inflight.has(key)) return inflight.get(key);
  const job = (req.kind === 'subject' ? findSubject(req.subject) : req.kind === 'pool' ? findPool(req.subject) : findSlide(req.heading, req.subject))
    .then((v) => { const list = (Array.isArray(v) ? v : [v]).filter(Boolean); writeCache(key, list); return list; })
    .catch(() => [])
    .finally(() => inflight.delete(key));
  inflight.set(key, job);
  return job;
}

/* ------------------------------ image loading ------------------------------ */
const imgs = new Map(); // url -> Promise<HTMLImageElement|null>
export function loadImage(url) {
  if (!url) return Promise.resolve(null);
  if (imgs.has(url)) return imgs.get(url);
  const job = new Promise((res) => {
    const im = new Image();
    im.crossOrigin = 'anonymous'; // keeps the canvas exportable (Download video)
    im.decoding = 'async';
    im.onload = () => res(im.naturalWidth ? im : null);
    im.onerror = () => res(null);
    im.src = url;
  });
  imgs.set(url, job);
  return job;
}

// Picture request(s) for a scene: { kind, heading?, subject }
export function pictureFor(scene, subject) {
  switch (scene.type) {
    case 'intro': case 'outro': return { kind: 'subject', subject };
    case 'text': case 'bullets': case 'tip':
      return scene.photoHeading ? { kind: 'slide', heading: scene.photoHeading, subject } : { kind: 'subject', subject };
    case 'qa': return { kind: 'slide', heading: scene.q, subject };
    default: return null;
  }
}
