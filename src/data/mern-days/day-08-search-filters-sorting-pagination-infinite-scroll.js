export default {
  id: 'day-08-search-filters-sorting-pagination-infinite-scroll',
  title: 'Search, Filters, Sorting, Pagination and Infinite Scroll End to End (URL State, MongoDB Indexes, Cursor vs Offset)',
  module: 'Module 3: Real Features',
  day: 8,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Build a product listing page like Flipkart or Naukri where search, filters, sort and page live in the URL, React fetches with TanStack Query (including useInfiniteQuery for infinite scroll), and Express turns query params into a safe, indexed MongoDB query with offset or cursor pagination.',
  objectives: [
    'Design a list API contract (q, filters, sort, page/limit or cursor) and its response shape',
    'Translate query params into a safe MongoDB filter with whitelisted sort fields',
    'Choose between offset and cursor (keyset) pagination and implement both',
    'Create the right MongoDB indexes (ESR rule, text index) and check them with explain()',
    'Keep list state in the URL with useSearchParams, debounce search, and build infinite scroll with useInfiniteQuery + IntersectionObserver',
  ],
  theory: [
    {
      heading: 'The full flow of a listing page',
      content:
        "When a user on a job portal types \"react\" in the search box, picks \"Pune\" and sorts by \"Newest\", this happens:\n\n1. **React** updates the URL: `/jobs?q=react&city=Pune&sort=-createdAt&page=1` (so the page is shareable and the back button works).\n2. **TanStack Query** uses those params as part of the `queryKey`: `['jobs', { q, city, sort, page }]`. A new key → a new request; an old key → instant data from cache.\n3. **axios** calls `GET /api/jobs?q=react&city=Pune&sort=-createdAt&page=1&limit=20`.\n4. **Express** validates the params (Zod), builds a MongoDB filter `{ city: 'Pune', $text: { $search: 'react' } }`, a sort `{ createdAt: -1, _id: -1 }`, and pagination.\n5. **MongoDB** uses an **index** to find and sort the documents quickly, and returns one page.\n6. Express returns `{ data, page, limit, total, totalPages }` (offset) or `{ data, nextCursor }` (cursor).\n7. React renders the list, pagination buttons or loads more on scroll.\n\nAnalogy: the URL is the **order slip**. Anyone holding the same slip (a shared link) gets exactly the same plate of results.",
      syntax: `// API contract (document it in README / Swagger)
GET /api/jobs?q=react&city=Pune&minSalary=600000&type=full-time,remote&sort=-createdAt&page=2&limit=20

200 OK
{
  "data": [ { "_id": "...", "title": "React Developer", "city": "Pune", ... } ],
  "page": 2, "limit": 20, "total": 134, "totalPages": 7
}`,
    },
    {
      heading: 'Building a safe MongoDB query from req.query',
      content:
        "`req.query` is user input. Treat every value as an untrusted string (or array, if the key repeats).\n\nRules:\n\n- **Validate and coerce** with Zod: `page: z.coerce.number().int().min(1).default(1)`, `limit: z.coerce.number().int().min(1).max(50).default(20)`. In Express 5 `req.query` is a read-only getter, so store the parsed result in `req.validatedQuery` or a local variable.\n- **Build the filter yourself** key by key. Never do `Model.find(req.query)`: that allows operator injection like `?price[$gt]=0` (with the extended query parser) and querying fields you never meant to expose.\n- **Whitelist sort fields**: `?sort=-price` is fine, `?sort=passwordHash` is not. Always add `_id` as a final tie-breaker so ordering is stable (two products with the same price must not swap between pages).\n- **Escape regex**: if you use `$regex` for \"contains\" search, escape special characters, otherwise `?q=.*` or a catastrophic pattern can slow your DB.\n- **Cap limit** (e.g. 50) so nobody downloads 1 million rows.\n- Use `.lean()` for read-only lists (plain objects, faster) and `.select()` to return only the fields the card needs.\n\nNote: Express 5's default query parser is \"simple\" (`querystring`), so `?price[gte]=100` is NOT turned into an object any more; prefer flat names like `minPrice` and `maxPrice`.",
      syntax: `const escapeRegex = (s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');

const SORTABLE = { createdAt: 1, salary: 1, title: 1 };
function buildSort(sort = '-createdAt') {
  const out = {};
  for (const part of String(sort).split(',')) {
    const field = part.replace(/^-/, '');
    if (SORTABLE[field]) out[field] = part.startsWith('-') ? -1 : 1;
  }
  if (!Object.keys(out).length) out.createdAt = -1;
  out._id = out.createdAt ?? -1;   // stable tie-breaker
  return out;
}`,
    },
    {
      heading: 'Offset vs cursor (keyset) pagination',
      content:
        "**Offset pagination**: `skip((page - 1) * limit).limit(limit)` + `countDocuments(filter)`.\n\n- Pros: easy, supports \"jump to page 7\" and showing \"134 results, page 2 of 7\".\n- Cons: `skip(100000)` still walks over 100,000 index entries, so deep pages get slow; if new items are inserted while the user browses, items shift and the user sees **duplicates or misses items**; `countDocuments` on big collections is expensive.\n\n**Cursor (keyset) pagination**: remember the last item you showed and ask for items **after** it: `find({ ...filter, $or: [{ createdAt: { $lt: last.createdAt } }, { createdAt: last.createdAt, _id: { $lt: last._id } }] }).sort({ createdAt: -1, _id: -1 }).limit(limit + 1)`.\n\n- Fetch `limit + 1` documents; if you got the extra one, there is a next page. Return `nextCursor` (often base64 of `createdAt|_id`) and drop the extra item.\n- Pros: constant speed at any depth (uses the index), no duplicates when new items arrive. Perfect for **infinite scroll** feeds, chat history, notifications.\n- Cons: no \"jump to page 7\", total count is not natural, and the cursor must encode every sort field.\n\nRule of thumb: **admin tables and search results with page numbers → offset**; **feeds, infinite scroll and huge collections → cursor**.",
      tip: "Make cursors opaque (base64) so clients do not build them by hand, and always include _id in both the sort and the cursor to break ties.",
    },
    {
      heading: 'Indexes that make it fast: ESR rule, text and Atlas Search',
      content:
        "Without an index MongoDB does a **COLLSCAN** (reads every document). With 5 lakh jobs, that is slow and expensive.\n\n**Compound index order: the ESR rule** = **E**quality fields first, then **S**ort fields, then **R**ange fields.\n\nQuery: `{ city: 'Pune', salary: { $gte: 600000 } }` sorted by `{ createdAt: -1 }` → index `{ city: 1, createdAt: -1, salary: 1 }`.\n\n**Search options**:\n\n- `$regex: '^rea', $options: 'i'` (prefix, case-insensitive): simple; only a **case-sensitive prefix** regex uses an index efficiently. \"Contains\" search scans.\n- **Text index**: `jobSchema.index({ title: 'text', skills: 'text' }, { weights: { title: 5, skills: 2 } })` then `{ $text: { $search: 'react node' } }` with `score: { $meta: 'textScore' }`. Word-based with stemming, one text index per collection, no partial-word matching.\n- **Atlas Search** (Lucene, on MongoDB Atlas): autocomplete, fuzzy (typos like \"reat\"), facets (counts per city) via the `$search` aggregation stage. This is what production job portals and shops use.\n\nCheck your query: `await Job.find(filter).sort(sort).explain('executionStats')` and look for `IXSCAN` (good) vs `COLLSCAN` (bad), and compare `totalDocsExamined` with `nReturned`.",
      syntax: `// server/src/models/Job.js
jobSchema.index({ city: 1, createdAt: -1, _id: -1 });        // filter by city, newest first
jobSchema.index({ type: 1, salary: -1 });                     // filter by type, sort by salary
jobSchema.index({ title: 'text', skills: 'text', company: 'text' },
                { weights: { title: 10, skills: 5, company: 2 }, name: 'job_text' });

// production: build indexes with a migration / Atlas UI, and set autoIndex: false
mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');`,
    },
    {
      heading: 'React: the URL as the single source of truth',
      content:
        "Do not keep filters in `useState` only. Keep them in the URL with React Router 7's `useSearchParams`:\n\n- Refreshing the page keeps the filters.\n- Users can share or bookmark `/jobs?city=Pune&q=react`.\n- Back/forward buttons work.\n\nPattern:\n\n1. Read: `const [params, setParams] = useSearchParams(); const city = params.get('city') ?? '';`\n2. Write: a helper `update({ city: 'Pune' })` that sets the param, deletes empty ones, and **resets `page` to 1** whenever a filter changes (otherwise you might be on page 5 of a list that now has 2 pages).\n3. Search box: keep the typed text in local state and **debounce** (300-400 ms) before writing it to the URL, so you do not fire a request per keystroke.\n4. Query: `useQuery({ queryKey: ['jobs', Object.fromEntries(params)], queryFn, placeholderData: keepPreviousData })`. `keepPreviousData` keeps the old page visible while the next one loads, avoiding a flash of the spinner.\n5. Prefetch the next page with `queryClient.prefetchQuery` for instant \"Next\" clicks.",
    },
    {
      heading: 'Infinite scroll with useInfiniteQuery and IntersectionObserver',
      content:
        "TanStack Query 5 has `useInfiniteQuery` for \"load more\" lists:\n\n- `initialPageParam: null` (first page has no cursor)\n- `queryFn: ({ pageParam }) => fetchJobs({ ...filters, cursor: pageParam })`\n- `getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined` (return `undefined` to say \"no more pages\")\n- Data shape: `data.pages` is an array of pages; flatten with `data.pages.flatMap(p => p.data)`.\n- Call `fetchNextPage()` when a **sentinel** `<div>` at the bottom becomes visible, detected by an `IntersectionObserver`. Check `hasNextPage && !isFetchingNextPage` first.\n\nAccessibility and UX: also show a \"Load more\" button (keyboard users, footer access), keep scroll position when going back (cache + `scrollRestoration`), and for very long lists use virtualization (`@tanstack/react-virtual`) so only visible rows are in the DOM.",
      syntax: `const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
  queryKey: ['feed', filters],
  queryFn: ({ pageParam, signal }) =>
    api.get('/jobs/feed', { params: { ...filters, cursor: pageParam }, signal }).then((r) => r.data),
  initialPageParam: null,
  getNextPageParam: (last) => last.nextCursor ?? undefined,
});
const jobs = data?.pages.flatMap((p) => p.data) ?? [];`,
    },
  ],
  examples: [
    {
      title: 'Query params → MongoDB filter, sort and offset pagination (API Lab)',
      scenario: 'GET /api/jobs supports q, city, type (comma list), minSalary, sort and page/limit. The response also shows the Mongo filter and sort that would be sent to Mongoose, so you can see the translation.',
      steps: [
        'Parse and cap page and limit; default sort -createdAt',
        'Build the filter object key by key (never pass req.query directly)',
        'Whitelist sort fields and add _id as tie-breaker',
        'Apply the same logic to an in-memory array to simulate Job.find(filter).sort(sort).skip().limit()',
        'Return data plus page metadata; try the requests below',
      ],
      code: `// server/src/controllers/jobs.js (real Mongoose version)
import Job from '../models/Job.js';
import { z } from 'zod';

const querySchema = z.object({
  q: z.string().trim().max(100).optional(),
  city: z.string().trim().max(50).optional(),
  type: z.string().optional(),                       // "full-time,remote"
  minSalary: z.coerce.number().min(0).optional(),
  sort: z.string().default('-createdAt'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
const SORTABLE = ['createdAt', 'salary', 'title'];

export async function listJobs(req, res) {
  const { q, city, type, minSalary, sort, page, limit } = querySchema.parse(req.query);

  const filter = { status: 'open' };
  if (city) filter.city = city;
  if (type) filter.type = { $in: type.split(',') };
  if (minSalary) filter.salary = { $gte: minSalary };
  if (q) filter.$text = { $search: q };

  const sortObj = {};
  for (const p of sort.split(',')) {
    const f = p.replace(/^-/, '');
    if (SORTABLE.includes(f)) sortObj[f] = p.startsWith('-') ? -1 : 1;
  }
  sortObj._id = -1;

  const [data, total] = await Promise.all([
    Job.find(filter).sort(sortObj).skip((page - 1) * limit).limit(limit)
      .select('title company city salary type createdAt').lean(),
    Job.countDocuments(filter),
  ]);
  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}`,
      api: {
        code: `const express = require('express');
const app = express();

const jobs = [
  { _id: 1, title: 'React Developer', city: 'Pune', type: 'full-time', salary: 800000, createdAt: '2026-11-01' },
  { _id: 2, title: 'Node.js Backend Engineer', city: 'Bengaluru', type: 'remote', salary: 1200000, createdAt: '2026-11-03' },
  { _id: 3, title: 'MERN Stack Intern', city: 'Pune', type: 'internship', salary: 180000, createdAt: '2026-11-05' },
  { _id: 4, title: 'Full Stack Developer (React + Node)', city: 'Pune', type: 'remote', salary: 1000000, createdAt: '2026-11-05' },
  { _id: 5, title: 'Frontend Engineer React', city: 'Hyderabad', type: 'full-time', salary: 900000, createdAt: '2026-11-07' },
];
const SORTABLE = ['createdAt', 'salary', 'title'];
const escapeRegex = (s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');

app.get('/api/jobs', (req, res) => {
  const { q, city, type, minSalary, sort = '-createdAt' } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 2, 1), 50);

  // 1. build the Mongo filter
  const filter = {};
  if (city) filter.city = String(city);
  if (type) filter.type = { $in: String(type).split(',') };
  if (minSalary) filter.salary = { $gte: Number(minSalary) };
  if (q) filter.title = { $regex: escapeRegex(String(q)), $options: 'i' };

  // 2. build the sort with a whitelist + _id tie-breaker
  const sortObj = {};
  for (const p of String(sort).split(',')) {
    const f = p.replace(/^-/, '');
    if (SORTABLE.includes(f)) sortObj[f] = p.startsWith('-') ? -1 : 1;
  }
  sortObj._id = -1;

  // 3. simulate Job.find(filter).sort(sortObj).skip().limit()
  let rows = jobs.filter(j =>
    (!filter.city || j.city === filter.city) &&
    (!filter.type || filter.type.$in.includes(j.type)) &&
    (!filter.salary || j.salary >= filter.salary.$gte) &&
    (!filter.title || new RegExp(filter.title.$regex, 'i').test(j.title)));
  rows.sort((a, b) => {
    for (const [f, dir] of Object.entries(sortObj)) {
      if (a[f] < b[f]) return -dir;
      if (a[f] > b[f]) return dir;
    }
    return 0;
  });
  const total = rows.length;
  const data = rows.slice((page - 1) * limit, page * limit).map(j => j._id + ': ' + j.title);
  res.json({ mongo: { filter, sort: sortObj }, data, page, limit, total, totalPages: Math.ceil(total / limit) });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/jobs?city=Pune' },
          { method: 'GET', url: '/api/jobs?city=Pune&page=2' },
          { method: 'GET', url: '/api/jobs?q=react&type=full-time,remote&minSalary=850000&sort=-salary' },
          { method: 'GET', url: '/api/jobs?sort=password&limit=100' },
        ],
      },
      result: "GET /api/jobs?city=Pune → 200 {\"mongo\":{\"filter\":{\"city\":\"Pune\"},\"sort\":{\"createdAt\":-1,\"_id\":-1}},\"data\":[\"4: Full Stack Developer (React + Node)\",\"3: MERN Stack Intern\"],\"page\":1,\"limit\":2,\"total\":3,\"totalPages\":2}\nGET /api/jobs?city=Pune&page=2 → 200 {\"mongo\":{\"filter\":{\"city\":\"Pune\"},\"sort\":{\"createdAt\":-1,\"_id\":-1}},\"data\":[\"1: React Developer\"],\"page\":2,\"limit\":2,\"total\":3,\"totalPages\":2}\nGET /api/jobs?q=react&type=full-time,remote&minSalary=850000&sort=-salary → 200 {\"mongo\":{\"filter\":{\"type\":{\"$in\":[\"full-time\",\"remote\"]},\"salary\":{\"$gte\":850000},\"title\":{\"$regex\":\"react\",\"$options\":\"i\"}},\"sort\":{\"salary\":-1,\"_id\":-1}},\"data\":[\"4: Full Stack Developer (React + Node)\",\"5: Frontend Engineer React\"],\"page\":1,\"limit\":2,\"total\":2,\"totalPages\":1}\nGET /api/jobs?sort=password&limit=100 → 200 {\"mongo\":{\"filter\":{},\"sort\":{\"_id\":-1}},\"data\":[\"5: Frontend Engineer React\",\"4: Full Stack Developer (React + Node)\",\"3: MERN Stack Intern\",\"2: Node.js Backend Engineer\",\"1: React Developer\"],\"page\":1,\"limit\":50,\"total\":5,\"totalPages\":1}",
      explanation:
        "Request 1 builds { city: 'Pune' } sorted newest first; jobs 3 and 4 have the same createdAt, and the _id tie-breaker (-1) puts 4 before 3 every time, so pages never swap items. Request 2 is page 2 of the same list. Request 3 combines regex search (escaped), $in for the comma list and $gte for salary, sorted by salary descending. Request 4 shows that an unknown sort field ('password') is ignored and limit is capped to 50. In the real controller the same filter and sort objects are passed to Job.find().",
    },
    {
      title: 'Cursor (keyset) pagination for an infinite feed (API Lab)',
      scenario: 'The job feed uses infinite scroll. Return 2 jobs per request with an opaque nextCursor based on createdAt + _id.',
      steps: [
        'Sort by createdAt desc, _id desc',
        'Decode the cursor (base64 of "createdAt|_id") if present',
        'Keep only items strictly after the cursor position',
        'Take limit + 1 items to know if there is a next page',
        'Encode the last returned item as nextCursor; follow the cursors in the requests',
      ],
      code: `// Real Mongoose version
export async function jobFeed(req, res) {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const filter = { status: 'open' };
  if (req.query.cursor) {
    const [createdAt, id] = Buffer.from(String(req.query.cursor), 'base64url').toString().split('|');
    filter.$or = [
      { createdAt: { $lt: new Date(createdAt) } },
      { createdAt: new Date(createdAt), _id: { $lt: new mongoose.Types.ObjectId(id) } },
    ];
  }
  const docs = await Job.find(filter).sort({ createdAt: -1, _id: -1 }).limit(limit + 1).lean();
  const hasMore = docs.length > limit;
  const data = hasMore ? docs.slice(0, limit) : docs;
  const last = data.at(-1);
  const nextCursor = hasMore
    ? Buffer.from(last.createdAt.toISOString() + '|' + last._id).toString('base64url')
    : null;
  res.json({ data, nextCursor });
}
// Index: jobSchema.index({ status: 1, createdAt: -1, _id: -1 });`,
      api: {
        code: `const express = require('express');
const app = express();

const jobs = [
  { _id: 1, title: 'React Developer', createdAt: '2026-11-01' },
  { _id: 2, title: 'Node.js Engineer', createdAt: '2026-11-03' },
  { _id: 3, title: 'MERN Intern', createdAt: '2026-11-05' },
  { _id: 4, title: 'Full Stack Dev', createdAt: '2026-11-05' },
  { _id: 5, title: 'Frontend Engineer', createdAt: '2026-11-07' },
];
// newest first, _id as tie-breaker (same as .sort({ createdAt: -1, _id: -1 }))
const sorted = [...jobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b._id - a._id);

const encode = (j) => btoa(j.createdAt + '|' + j._id);
const decode = (c) => { const [createdAt, id] = atob(c).split('|'); return { createdAt, id: Number(id) }; };

app.get('/api/jobs/feed', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 2, 50);
  let rows = sorted;
  if (req.query.cursor) {
    const c = decode(String(req.query.cursor));
    // $or: [{ createdAt < c.createdAt }, { createdAt == c.createdAt, _id < c.id }]
    rows = rows.filter(j => j.createdAt < c.createdAt || (j.createdAt === c.createdAt && j._id < c.id));
  }
  const page = rows.slice(0, limit + 1);
  const hasMore = page.length > limit;
  const data = hasMore ? page.slice(0, limit) : page;
  res.json({
    data: data.map(j => j._id + ': ' + j.title + ' (' + j.createdAt + ')'),
    nextCursor: hasMore ? encode(data[data.length - 1]) : null,
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/jobs/feed' },
          { method: 'GET', url: '/api/jobs/feed?cursor=MjAyNi0xMS0wNXw0' },
          { method: 'GET', url: '/api/jobs/feed?cursor=MjAyNi0xMS0wM3wy' },
        ],
      },
      result: "GET /api/jobs/feed → 200 {\"data\":[\"5: Frontend Engineer (2026-11-07)\",\"4: Full Stack Dev (2026-11-05)\"],\"nextCursor\":\"MjAyNi0xMS0wNXw0\"}\nGET /api/jobs/feed?cursor=MjAyNi0xMS0wNXw0 → 200 {\"data\":[\"3: MERN Intern (2026-11-05)\",\"2: Node.js Engineer (2026-11-03)\"],\"nextCursor\":\"MjAyNi0xMS0wM3wy\"}\nGET /api/jobs/feed?cursor=MjAyNi0xMS0wM3wy → 200 {\"data\":[\"1: React Developer (2026-11-01)\"],\"nextCursor\":null}",
      explanation:
        "Page 1 returns jobs 5 and 4 with nextCursor MjAyNi0xMS0wNXw0, which is base64 of '2026-11-05|4'. Page 2 asks for items after that position: job 3 has the same date but a smaller _id, so it correctly comes next (a cursor on createdAt alone would skip it). Page 3 returns the last job and nextCursor null, which tells useInfiniteQuery there are no more pages. If a new job is inserted at the top while the user scrolls, nothing shifts, unlike skip-based pages.",
    },
    {
      title: 'React list page with filters in the URL-style state, debounced search and pagination',
      scenario: 'Build the jobs page UI: search box (debounced), city select, sort select and Prev/Next. The playground has no router, so the "URL" is shown as text; the real code uses useSearchParams.',
      steps: [
        'Keep params in one object (real app: useSearchParams)',
        'Write update() that removes empty values and resets page to 1 when a filter changes',
        'Debounce the search input by 400 ms with useEffect + setTimeout',
        'Fetch from a fake API whenever the params change (real app: useQuery with keepPreviousData)',
        'Click Run and try search, filters and paging',
      ],
      code: `// client/src/pages/JobsPage.jsx (real app, React Router 7 + TanStack Query 5)
import { useSearchParams } from 'react-router';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '../api/client';

const fetchJobs = (params, signal) => api.get('/jobs', { params, signal }).then((r) => r.data);

export default function JobsPage() {
  const [params, setParams] = useSearchParams();
  const filters = Object.fromEntries(params);            // { q, city, sort, page }
  const page = Number(filters.page || 1);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');          // filter changed -> page 1
    setParams(next);
  };

  const [text, setText] = useState(filters.q || '');
  useEffect(() => {
    const t = setTimeout(() => { if (text !== (filters.q || '')) update({ q: text }); }, 400);
    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isPending, isError, isPlaceholderData } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: ({ signal }) => fetchJobs(filters, signal),
    placeholderData: keepPreviousData,
  });
  // ...render inputs, list, Prev/Next calling update({ page: page + 1 })
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

const ALL = [
  { id: 1, title: 'React Developer', city: 'Pune', salary: 8 },
  { id: 2, title: 'Node.js Backend Engineer', city: 'Bengaluru', salary: 12 },
  { id: 3, title: 'MERN Stack Intern', city: 'Pune', salary: 2 },
  { id: 4, title: 'Full Stack Developer', city: 'Pune', salary: 10 },
  { id: 5, title: 'Frontend Engineer React', city: 'Hyderabad', salary: 9 },
  { id: 6, title: 'MongoDB Data Engineer', city: 'Bengaluru', salary: 14 },
  { id: 7, title: 'React Native Developer', city: 'Mumbai', salary: 11 },
];

// fake API with latency (real app: axios GET /api/jobs?...)
function fakeApi(p) {
  return new Promise(resolve => setTimeout(() => {
    let rows = ALL.filter(j =>
      (!p.q || j.title.toLowerCase().includes(p.q.toLowerCase())) &&
      (!p.city || j.city === p.city));
    if (p.sort === '-salary') rows = [...rows].sort((a, b) => b.salary - a.salary);
    const page = Number(p.page || 1), limit = 3;
    resolve({ data: rows.slice((page - 1) * limit, page * limit), total: rows.length, page, totalPages: Math.max(1, Math.ceil(rows.length / limit)) });
  }, 300));
}

function App() {
  const [params, setParams] = useState({});           // real app: useSearchParams()
  const [text, setText] = useState('');
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (patch) => setParams(prev => {
    const next = { ...prev, ...patch };
    Object.keys(next).forEach(k => { if (!next[k]) delete next[k]; });
    if (!('page' in patch)) delete next.page;          // filters changed -> back to page 1
    return next;
  });

  useEffect(() => {                                   // debounce search box
    const t = setTimeout(() => { if (text !== (params.q || '')) update({ q: text }); }, 400);
    return () => clearTimeout(t);
  }, [text]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    console.log('GET /api/jobs?' + new URLSearchParams(params).toString());
    fakeApi(params).then(r => { if (active) { setRes(r); setLoading(false); } });
    return () => { active = false; };                 // ignore out-of-order responses
  }, [params]);

  const page = Number(params.page || 1);
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 560 }}>
      <code style={{ display: 'block', background: '#f1f5f9', padding: 6 }}>/jobs?{new URLSearchParams(params).toString()}</code>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input placeholder="Search jobs" value={text} onChange={e => setText(e.target.value)} />
        <select value={params.city || ''} onChange={e => update({ city: e.target.value })}>
          <option value="">All cities</option>
          {['Pune', 'Bengaluru', 'Hyderabad', 'Mumbai'].map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={params.sort || ''} onChange={e => update({ sort: e.target.value })}>
          <option value="">Newest</option>
          <option value="-salary">Salary: high to low</option>
        </select>
      </div>
      <div style={{ opacity: loading ? 0.5 : 1 }}>
        {res && res.data.length === 0 && <p>No jobs found.</p>}
        <ul>{res && res.data.map(j => <li key={j.id}>{j.title} - {j.city} - {j.salary} LPA</li>)}</ul>
      </div>
      {res && (
        <div>
          <button disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>Prev</button>
          <span> Page {res.page} of {res.totalPages} ({res.total} jobs) </span>
          <button disabled={page >= res.totalPages} onClick={() => update({ page: String(page + 1) })}>Next</button>
        </div>
      )}
    </div>
  );
}`,
      },
      result: 'The page shows 3 jobs per page with "Page 1 of 3 (7 jobs)". Typing "react" waits 400 ms, then logs GET /api/jobs?q=react and shows 3 React jobs. Choosing Pune resets to page 1; Next/Prev move pages and the fake URL updates each time. The list fades while loading instead of disappearing.',
      explanation:
        "All list state is one params object, exactly like URLSearchParams in the real app, so the 'URL' fully describes the screen. update() removes empty values and resets page whenever a filter changes. The debounce effect clears its timer on every keystroke, so only the final text triggers a request. The 'active' flag ignores slow responses from old params (TanStack Query does this for you using the queryKey and AbortSignal). Keeping the old list visible at 50% opacity mimics placeholderData: keepPreviousData.",
    },
    {
      title: 'Infinite scroll with IntersectionObserver (useInfiniteQuery pattern)',
      scenario: 'A notifications feed loads 5 items at a time and fetches the next page automatically when the user scrolls to the bottom.',
      steps: [
        'Store pages in an array like data.pages in useInfiniteQuery',
        'Keep a nextCursor; null means no more pages',
        'Place a sentinel div after the list and observe it with IntersectionObserver',
        'When the sentinel is visible and not already loading, fetch the next page',
        'Click Run and scroll inside the box',
      ],
      code: `// client/src/features/feed/Feed.jsx (real app)
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { api } from '../../api/client';

export default function Feed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfiniteQuery({
    queryKey: ['jobs', 'feed'],
    queryFn: ({ pageParam, signal }) =>
      api.get('/jobs/feed', { params: { cursor: pageParam, limit: 20 }, signal }).then((r) => r.data),
    initialPageParam: null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const sentinel = useRef(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') return <p>Loading...</p>;
  if (status === 'error') return <p>{error.message}</p>;
  const jobs = data.pages.flatMap((p) => p.data);
  return (
    <>
      {jobs.map((j) => <JobCard key={j._id} job={j} />)}
      <div ref={sentinel} />
      {isFetchingNextPage && <p>Loading more...</p>}
      {!hasNextPage && <p>You are all caught up</p>}
      {hasNextPage && <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>Load more</button>}
    </>
  );
}`,
      playground: {
        jsx: `const { useState, useEffect, useRef, useCallback } = React;

// fake cursor API: 23 items, 5 per page
function fetchFeed(cursor) {
  return new Promise(resolve => setTimeout(() => {
    const start = cursor ?? 0, end = Math.min(start + 5, 23);
    const data = [];
    for (let i = start; i < end; i++) data.push({ id: i + 1, text: 'Notification #' + (i + 1) });
    resolve({ data, nextCursor: end < 23 ? end : null });
  }, 500));
}

function App() {
  const [pages, setPages] = useState([]);
  const [nextCursor, setNextCursor] = useState(undefined); // undefined = not loaded yet
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const sentinelRef = useRef(null);
  const hasNextPage = nextCursor !== null;

  const fetchNextPage = useCallback(() => {
    if (loading || !hasNextPage) return;
    setLoading(true);
    fetchFeed(nextCursor).then(page => {
      console.log('loaded page', pages.length + 1, 'nextCursor =', page.nextCursor);
      setPages(p => [...p, page]);
      setNextCursor(page.nextCursor);
      setLoading(false);
    });
  }, [loading, hasNextPage, nextCursor, pages.length]);

  useEffect(() => { fetchNextPage(); }, []);   // first page

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) fetchNextPage();
    }, { root: boxRef.current, rootMargin: '50px' });
    io.observe(el);
    return () => io.disconnect();
  }, [fetchNextPage]);

  const items = pages.flatMap(p => p.data);
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h3>Notifications ({items.length})</h3>
      <div ref={boxRef} style={{ height: 220, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 8 }}>
        {items.map(n => (
          <div key={n.id} style={{ padding: 12, borderBottom: '1px solid #eee' }}>{n.text}</div>
        ))}
        <div ref={sentinelRef} style={{ height: 1 }} />
        {loading && <p style={{ textAlign: 'center' }}>Loading more...</p>}
        {!hasNextPage && <p style={{ textAlign: 'center', color: '#16a34a' }}>You are all caught up</p>}
      </div>
      {hasNextPage && <button style={{ marginTop: 8 }} onClick={fetchNextPage} disabled={loading}>Load more</button>}
    </div>
  );
}`,
      },
      result: 'The first 5 notifications appear. Scrolling to the bottom of the box shows "Loading more..." and appends 5 more each time (console: loaded page 2, nextCursor = 10 ...). After 23 items it shows "You are all caught up" and the Load more button disappears.',
      explanation:
        "The pages array and nextCursor mirror useInfiniteQuery's data.pages and getNextPageParam. The sentinel is a 1px div after the list; IntersectionObserver (with root set to the scroll box) fires when it becomes visible, which triggers the next fetch. The guard against loading prevents double requests. A visible Load more button is kept for keyboard and screen-reader users. In production TanStack Query also handles caching, refetching and errors for you.",
    },
    {
      title: 'Indexes and explain(): proving the query is fast',
      scenario: 'The jobs listing became slow at 3 lakh documents. Add the right indexes and confirm with explain().',
      steps: [
        'Write down the most common query shapes (filters + sort)',
        'Create compound indexes following the ESR rule, plus a weighted text index',
        'Run explain("executionStats") before and after',
        'Compare totalDocsExamined with nReturned and look for IXSCAN',
      ],
      code: `// server/src/models/Job.js
const jobSchema = new mongoose.Schema({
  title: String, company: String, skills: [String],
  city: { type: String, index: false },
  type: { type: String, enum: ['full-time', 'remote', 'internship'] },
  salary: Number,
  status: { type: String, default: 'open' },
}, { timestamps: true });

// E (status, city) -> S (createdAt, _id) -> R (salary)
jobSchema.index({ status: 1, city: 1, createdAt: -1, _id: -1, salary: 1 });
jobSchema.index({ status: 1, createdAt: -1, _id: -1 });                  // feed / cursor pagination
jobSchema.index({ title: 'text', skills: 'text', company: 'text' },
                { weights: { title: 10, skills: 5, company: 1 }, name: 'job_text' });

// scripts/explain.js  (node scripts/explain.js)
import mongoose from 'mongoose';
import Job from '../src/models/Job.js';
await mongoose.connect(process.env.MONGO_URI);
const plan = await Job.find({ status: 'open', city: 'Pune', salary: { $gte: 600000 } })
  .sort({ createdAt: -1, _id: -1 }).limit(20).explain('executionStats');
const s = plan.executionStats;
console.log({
  stage: plan.queryPlanner.winningPlan.inputStage?.stage ?? plan.queryPlanner.winningPlan.stage,
  nReturned: s.nReturned,
  totalKeysExamined: s.totalKeysExamined,
  totalDocsExamined: s.totalDocsExamined,
  ms: s.executionTimeMillis,
});
await mongoose.disconnect();

/* Typical output
   before index: { stage: 'SORT', nReturned: 20, totalDocsExamined: 300000, ms: 420 }  (COLLSCAN + in-memory sort)
   after index:  { stage: 'IXSCAN' (under LIMIT/FETCH), nReturned: 20, totalKeysExamined: 23, totalDocsExamined: 20, ms: 2 } */

// Text search sorted by relevance
const results = await Job.find({ $text: { $search: 'react node' }, status: 'open' },
                               { score: { $meta: 'textScore' } })
  .sort({ score: { $meta: 'textScore' } }).limit(20).lean();`,
      explanation:
        "Equality fields (status, city) come first so MongoDB jumps straight to 'open jobs in Pune'; the sort fields come next so results are already in createdAt order inside the index (no in-memory SORT stage, which is limited to 100 MB); the range field (salary) is last. A healthy query examines about as many keys/docs as it returns. The text index lets $text search words in title, skills and company with weights, and textScore sorts by relevance. In production create indexes deliberately (migration or Atlas UI) rather than relying on autoIndex at startup.",
    },
  ],
  interview: [
    {
      q: 'Compare offset and cursor pagination. When would you use each?',
      a: "Offset uses skip/limit and page numbers; easy, supports jumping to a page and total counts, but skip is O(n) for deep pages and items shift when data changes (duplicates/misses). Cursor (keyset) pagination filters by the last seen sort key (e.g. createdAt + _id) with limit; constant performance using an index and stable with inserts, ideal for infinite scroll, feeds and huge collections, but no random page jumps. Use offset for admin tables and small results; cursor for feeds and large datasets.",
      level: 'Medium',
    },
    {
      q: 'Why should the sort always include a unique field like _id?',
      a: "If many documents share the same sort value (same price or createdAt), MongoDB does not guarantee their order, so the same item can appear on two pages or be skipped. Adding _id as a final tie-breaker makes the order deterministic. Cursor pagination also needs it in the cursor so equal timestamps are handled correctly.",
      level: 'Medium',
    },
    {
      q: 'What is the ESR rule for compound indexes?',
      a: "Order index fields as Equality, then Sort, then Range. Example: query { city: 'Pune', salary: { $gte: 5 } } sorted by createdAt: index { city: 1, createdAt: -1, salary: 1 }. Equality narrows to a contiguous index range, the sort field then gives already-sorted keys (no blocking in-memory SORT), and range filters are applied last.",
      level: 'Hard',
    },
    {
      q: 'Why is Model.find(req.query) dangerous?',
      a: "It passes user-controlled keys and values straight into the database query: users can filter on fields you never intended (e.g. role, isDeleted), and with an extended query parser can inject operators like price[$gt]=0 or $where. It also skips validation and type coercion. Build the filter explicitly from validated, whitelisted params.",
      level: 'Easy',
    },
    {
      q: 'How do you implement search in a MERN app? Compare $regex, text indexes and Atlas Search.',
      a: "$regex is simple; only case-sensitive prefix patterns use an index efficiently, and 'contains' search scans; always escape user input. A text index supports word search with stemming, weights and relevance scores ($text, textScore) but no partial words, fuzzy matching or autocomplete, and only one per collection. Atlas Search (Lucene) supports autocomplete, fuzzy typo tolerance, synonyms, highlighting and facets through the $search aggregation stage; best for production search UX on Atlas.",
      level: 'Hard',
    },
    {
      q: 'Why should list filters live in the URL instead of only in React state?',
      a: "The URL survives refresh, can be shared and bookmarked, works with back/forward navigation, and can be read on first load (deep links). With React Router's useSearchParams you treat the URL as the source of truth and derive the TanStack Query key from it.",
      level: 'Easy',
    },
    {
      q: 'What does placeholderData: keepPreviousData do in TanStack Query 5?',
      a: "When the query key changes (e.g. page 1 to page 2), it keeps showing the previous data while the new data is fetched instead of switching to a pending state. isPlaceholderData tells you the shown data is from the old key, so you can disable the Next button or dim the list. It replaced the v4 keepPreviousData: true option.",
      level: 'Medium',
    },
    {
      q: 'How does useInfiniteQuery know whether there is another page?',
      a: "Through getNextPageParam(lastPage, allPages). Return the next cursor/page number if more data exists, or undefined/null when there are no more pages; hasNextPage is derived from it. In v5 you must also provide initialPageParam.",
      level: 'Medium',
    },
    {
      q: 'Why debounce a search box and how?',
      a: "Without debouncing every keystroke triggers a request, wasting server and DB resources and causing out-of-order responses. Debounce waits until the user pauses (300-500 ms): in a useEffect start a setTimeout that writes the value to the URL/query key and clear it in the cleanup. Also cancel stale requests with AbortController (TanStack Query passes a signal).",
      level: 'Easy',
    },
    {
      q: 'countDocuments is slow on a huge collection. How can you still show totals?',
      a: "Options: use estimatedDocumentCount when there is no filter (uses metadata); cap counts (\"1000+ results\") by counting with a limit; cache counts in Redis for popular filters; use Atlas Search facets/count; or switch the UI to cursor pagination without totals (\"Load more\"). Also ensure the filter itself uses an index so counting is an index scan.",
      level: 'Hard',
    },
    {
      q: 'How do you check whether a MongoDB query uses an index?',
      a: "Run .explain('executionStats') (Mongoose: Model.find(...).explain('executionStats')) or use Compass/Atlas Performance Advisor. Look for IXSCAN instead of COLLSCAN, no blocking SORT stage, and totalKeysExamined/totalDocsExamined close to nReturned. Atlas also suggests indexes from slow query logs.",
      level: 'Medium',
    },
    {
      q: 'What changes in Express 5 regarding req.query that affects list APIs?',
      a: "req.query is a getter, so you cannot assign to it (sanitising middlewares that reassign it break); store parsed values elsewhere. The default query parser is 'simple', so nested syntax like price[gte]=10 is no longer parsed into objects unless you set app.set('query parser', 'extended'). Repeated keys still become arrays (type=a&type=b).",
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Write a reusable buildListQuery(query, { sortable, filters }) helper for Express that returns { filter, sort, page, limit, skip } and use it in GET /api/products with filters category, brand (comma list), minPrice, maxPrice, inStock and search q.',
      hint: 'Keep it generic: a filters config maps param names to functions that return a Mongo condition.',
      solution: `// server/src/utils/listQuery.js
const escapeRegex = (s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');

export function buildListQuery(query, { sortable = [], filters = {}, defaultSort = '-createdAt', maxLimit = 50 }) {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 20, 1), maxLimit);
  const filter = {};
  for (const [param, toCondition] of Object.entries(filters)) {
    const value = query[param];
    if (value === undefined || value === '') continue;
    Object.assign(filter, toCondition(String(value), filter));
  }
  const sort = {};
  for (const part of String(query.sort || defaultSort).split(',')) {
    const f = part.replace(/^-/, '');
    if (sortable.includes(f)) sort[f] = part.startsWith('-') ? -1 : 1;
  }
  sort._id = -1;
  return { filter, sort, page, limit, skip: (page - 1) * limit };
}

// server/src/controllers/products.js
export async function listProducts(req, res) {
  const { filter, sort, page, limit, skip } = buildListQuery(req.query, {
    sortable: ['price', 'rating', 'createdAt', 'name'],
    filters: {
      category: (v) => ({ category: v }),
      brand: (v) => ({ brand: { $in: v.split(',') } }),
      minPrice: (v, f) => ({ price: { ...f.price, $gte: Number(v) } }),
      maxPrice: (v, f) => ({ price: { ...f.price, $lte: Number(v) } }),
      inStock: (v) => (v === 'true' ? { stock: { $gt: 0 } } : {}),
      q: (v) => ({ name: { $regex: escapeRegex(v), $options: 'i' } }),
    },
  });
  const [data, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).select('name price images rating brand').lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}`,
    },
    {
      task: 'Create a custom hook useListParams() for React Router 7 that returns { params, update, reset } where update(patch) removes empty values and resets page to 1 unless page is in the patch. Use it with useQuery and prefetch the next page.',
      hint: 'useSearchParams + queryClient.prefetchQuery in a useEffect.',
      solution: `// client/src/hooks/useListParams.js
import { useSearchParams } from 'react-router';
import { useCallback, useMemo } from 'react';

export function useListParams(defaults = {}) {
  const [sp, setSp] = useSearchParams();
  const params = useMemo(() => ({ ...defaults, ...Object.fromEntries(sp) }), [sp]); // eslint-disable-line
  const update = useCallback((patch) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, String(v))));
      if (!('page' in patch)) next.delete('page');
      return next;
    });
  }, [setSp]);
  const reset = useCallback(() => setSp(new URLSearchParams()), [setSp]);
  return { params, update, reset };
}

// client/src/pages/ProductsPage.jsx
import { useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '../api/client';
import { useListParams } from '../hooks/useListParams';

const fetchProducts = (p, signal) => api.get('/products', { params: p, signal }).then((r) => r.data);

export default function ProductsPage() {
  const { params, update, reset } = useListParams({ page: '1', sort: '-createdAt' });
  const qc = useQueryClient();
  const { data, isPending, isPlaceholderData } = useQuery({
    queryKey: ['products', params],
    queryFn: ({ signal }) => fetchProducts(params, signal),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (data && Number(params.page) < data.totalPages) {
      const next = { ...params, page: String(Number(params.page) + 1) };
      qc.prefetchQuery({ queryKey: ['products', next], queryFn: ({ signal }) => fetchProducts(next, signal) });
    }
  }, [data, params, qc]);

  if (isPending) return <p>Loading...</p>;
  const page = Number(params.page);
  return (
    <div>
      <button onClick={reset}>Clear filters</button>
      <select value={params.sort} onChange={(e) => update({ sort: e.target.value })}>
        <option value="-createdAt">Newest</option>
        <option value="price">Price: low to high</option>
        <option value="-price">Price: high to low</option>
      </select>
      <ul style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
        {data.data.map((p) => <li key={p._id}>{p.name} - Rs {p.price}</li>)}
      </ul>
      <button disabled={page <= 1} onClick={() => update({ page: page - 1 })}>Prev</button>
      <span> {page} / {data.totalPages} </span>
      <button disabled={isPlaceholderData || page >= data.totalPages} onClick={() => update({ page: page + 1 })}>Next</button>
    </div>
  );
}`,
    },
    {
      task: 'Implement cursor pagination for chat messages: GET /api/rooms/:roomId/messages?before=<cursor>&limit=30 returns older messages (for scrolling up) in ascending order for display, plus prevCursor.',
      hint: 'Query newest-first with limit+1, then reverse for display.',
      solution: `// Index: messageSchema.index({ room: 1, createdAt: -1, _id: -1 });
export async function listMessages(req, res) {
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const filter = { room: req.params.roomId };
  if (req.query.before) {
    const [ts, id] = Buffer.from(String(req.query.before), 'base64url').toString().split('|');
    filter.$or = [
      { createdAt: { $lt: new Date(ts) } },
      { createdAt: new Date(ts), _id: { $lt: new mongoose.Types.ObjectId(id) } },
    ];
  }
  const docs = await Message.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate('sender', 'name avatar')
    .lean();
  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const oldest = page.at(-1);
  res.json({
    data: page.reverse(),       // oldest -> newest for rendering top to bottom
    prevCursor: hasMore ? Buffer.from(oldest.createdAt.toISOString() + '|' + oldest._id).toString('base64url') : null,
  });
}`,
    },
    {
      task: 'Add a text index to a Product model and a GET /api/products/search?q= endpoint that returns results sorted by relevance with the score, falling back to a prefix regex when q is shorter than 3 characters.',
      hint: "Use { score: { $meta: 'textScore' } } in the projection and sort.",
      solution: `productSchema.index({ name: 'text', brand: 'text', description: 'text' },
  { weights: { name: 10, brand: 5, description: 1 }, name: 'product_text' });

const escapeRegex = (s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');

export async function searchProducts(req, res) {
  const q = String(req.query.q || '').trim().slice(0, 100);
  if (!q) return res.json({ data: [] });

  if (q.length < 3) {
    const data = await Product.find({ name: { $regex: '^' + escapeRegex(q), $options: 'i' } })
      .limit(10).select('name price').lean();
    return res.json({ data, mode: 'prefix' });
  }
  const data = await Product.find({ $text: { $search: q } }, { score: { $meta: 'textScore' }, name: 1, price: 1 })
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .lean();
  res.json({ data, mode: 'text' });
}`,
    },
  ],
  quiz: [
    {
      question: 'Which pagination type stays fast on page 5,000 and does not show duplicates when new items are inserted?',
      options: ['Offset with skip()', 'Cursor (keyset) pagination', 'Loading everything and slicing in React', 'Random sampling'],
      answer: 1,
      explanation: 'Cursor pagination filters from the last seen sort key using an index, so depth does not matter and inserts do not shift pages.',
    },
    {
      question: 'Query: { city: "Pune", salary: { $gte: 500000 } } sorted by { createdAt: -1 }. Which index follows the ESR rule?',
      options: ['{ salary: 1, city: 1, createdAt: -1 }', '{ createdAt: -1, salary: 1, city: 1 }', '{ city: 1, createdAt: -1, salary: 1 }', '{ salary: 1 }'],
      answer: 2,
      explanation: 'Equality (city) first, then Sort (createdAt), then Range (salary).',
    },
    {
      question: 'In useInfiniteQuery, what should getNextPageParam return when there are no more pages?',
      options: ['undefined (or null)', '0', 'An empty array', 'The first cursor again'],
      answer: 0,
      explanation: 'Returning undefined/null makes hasNextPage false and stops fetchNextPage from loading more.',
    },
    {
      question: 'A user changes the city filter while on page 6. What should the list page do?',
      options: ['Stay on page 6', 'Reload the browser', 'Clear all filters', 'Reset page to 1'],
      answer: 3,
      explanation: 'The new filter may have fewer pages; always reset page to 1 when filters change.',
    },
    {
      question: 'Why add _id to the sort, e.g. { price: 1, _id: 1 }?',
      options: ['MongoDB requires _id in every sort', 'To make the order deterministic when prices are equal', 'To make the query use a text index', 'To hide the _id from the response'],
      answer: 1,
      explanation: 'Ties in the sort field can come back in any order, causing duplicates or missing items across pages. _id breaks ties.',
    },
  ],
};
