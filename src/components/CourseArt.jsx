// Professional illustrated course covers (pure SVG – no external images, works offline).
// Each course gets a scene for its kind (code editor, spreadsheet, dashboard, database, AI chat,
// presentation) filled with real code / formulas / queries from that course.
import { useMemo } from 'react';

const C = { bg: '#0b1020', win: '#0f172a', bar: '#1e293b', line: '#334155', txt: '#e2e8f0', mute: '#94a3b8', str: '#86efac', num: '#fdba74', kw: '#c4b5fd', fn: '#93c5fd', type: '#67e8f9', tag: '#f9a8d4', com: '#64748b' };
const solid = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#6366f1');

/* ------------------------------------------------------------ per-course content */
const J = (file, code, out) => ({ scene: 'code', file, code, out });
const ART = {
  // Java
  corejava: J('Main.java', ['public class Main {', '  public static void main(String[] a) {', '    int[] marks = {82, 91, 76};', '    int total = 0;', '    for (int m : marks) total += m;', '    System.out.println("Avg: " + total / 3);', '  }', '}'], 'Avg: 83'),
  collections: J('Main.java', ['Map<String, Integer> stock = new HashMap<>();', 'stock.put("Pen", 40);', 'stock.put("Book", 12);', 'List<String> items = new ArrayList<>(stock.keySet());', 'Collections.sort(items);', 'System.out.println(items);'], '[Book, Pen]'),
  advjava: J('StudentServlet.java', ['@WebServlet("/students")', 'public class StudentServlet extends HttpServlet {', '  protected void doGet(HttpServletRequest req,', '      HttpServletResponse res) throws IOException {', '    List<Student> list = dao.findAll();', '    req.setAttribute("students", list);', '  }', '}'], 'GET /students 200 OK'),
  hibernate: J('Student.java', ['@Entity', '@Table(name = "students")', 'public class Student {', '  @Id @GeneratedValue', '  private Long id;', '  private String name;', '  @OneToMany(mappedBy = "student")', '  private List<Course> courses;', '}'], 'Hibernate: insert into students'),
  spring: J('AppConfig.java', ['@Configuration', '@ComponentScan("com.shop")', 'public class AppConfig {', '  @Bean', '  public PaymentService payment() {', '    return new UpiPaymentService();', '  }', '}'], 'Context started ✓'),
  springboot: J('ProductController.java', ['@RestController', '@RequestMapping("/api/products")', 'public class ProductController {', '  @GetMapping("/{id}")', '  public Product get(@PathVariable Long id) {', '    return service.findById(id);', '  }', '}'], 'Tomcat started on port 8080'),
  javatech: J('pom.xml', ['<dependency>', '  <groupId>org.springframework.boot</groupId>', '  <artifactId>spring-boot-starter-web</artifactId>', '</dependency>', '<dependency>', '  <groupId>org.junit.jupiter</groupId>', '  <artifactId>junit-jupiter</artifactId>', '</dependency>'], 'BUILD SUCCESS'),
  // Python
  python: J('main.py', ['def grade(marks):', '    avg = sum(marks) / len(marks)', '    return "A" if avg >= 80 else "B"', '', 'students = {"Riya": [88, 92], "Aman": [71, 75]}', 'for name, m in students.items():', '    print(name, grade(m))'], 'Riya A  ·  Aman B'),
  pyextra: J('utils.py', ['from functools import lru_cache', '', '@lru_cache(maxsize=None)', 'def fib(n: int) -> int:', '    return n if n < 2 else fib(n - 1) + fib(n - 2)', '', 'squares = [x * x for x in range(6)]', 'print(fib(30), squares)'], '832040 [0, 1, 4, 9, 16, 25]'),
  pydsa: J('search.py', ['def binary_search(arr, target):', '    lo, hi = 0, len(arr) - 1', '    while lo <= hi:', '        mid = (lo + hi) // 2', '        if arr[mid] == target: return mid', '        if arr[mid] < target: lo = mid + 1', '        else: hi = mid - 1', '    return -1'], 'Found at index 4 · O(log n)'),
  pydata: J('analysis.py', ['import pandas as pd', '', 'df = pd.read_csv("sales.csv")', 'top = (df.groupby("region")["revenue"]', '        .sum()', '        .sort_values(ascending=False))', 'print(top.head(3))'], 'West 4.2M · North 3.8M'),
  pyml: J('model.py', ['from sklearn.model_selection import train_test_split', 'from sklearn.ensemble import RandomForestClassifier', '', 'X_train, X_test, y_train, y_test = train_test_split(X, y)', 'model = RandomForestClassifier(n_estimators=100)', 'model.fit(X_train, y_train)', 'print(model.score(X_test, y_test))'], 'Accuracy: 0.94'),
  sql: { scene: 'db', file: 'query.sql', code: ['SELECT d.name, COUNT(e.id) AS staff,', '       ROUND(AVG(e.salary)) AS avg_pay', 'FROM employees e', 'JOIN departments d ON d.id = e.dept_id', 'GROUP BY d.name', 'ORDER BY avg_pay DESC;'], rows: [['IT', '12', '78,500'], ['Finance', '8', '71,200'], ['HR', '5', '52,900']], cols: ['name', 'staff', 'avg_pay'] },
  flask: J('app.py', ['from flask import Flask, jsonify', '', 'app = Flask(__name__)', '', '@app.route("/api/courses")', 'def courses():', '    return jsonify([c.to_dict() for c in Course.query.all()])'], 'Running on http://127.0.0.1:5000'),
  django: J('views.py', ['from django.shortcuts import render', 'from .models import Post', '', 'def home(request):', '    posts = Post.objects.filter(published=True)', '    return render(request, "blog/home.html",', '                  {"posts": posts})'], 'Starting development server…'),
  drf: J('views.py', ['from rest_framework import viewsets', 'from .models import Book', 'from .serializers import BookSerializer', '', 'class BookViewSet(viewsets.ModelViewSet):', '    queryset = Book.objects.all()', '    serializer_class = BookSerializer'], 'GET /api/books/ 200'),
  fastapi: J('main.py', ['from fastapi import FastAPI', 'from pydantic import BaseModel', '', 'app = FastAPI()', '', 'class Item(BaseModel):', '    name: str', '    price: float', '', '@app.post("/items")', 'async def create(item: Item): return item'], 'Uvicorn running on :8000'),
  pyauto: J('scraper.py', ['import requests', 'from bs4 import BeautifulSoup', '', 'html = requests.get(URL, timeout=10).text', 'soup = BeautifulSoup(html, "html.parser")', 'for job in soup.select(".job-title"):', '    print(job.get_text(strip=True))'], '24 jobs saved to jobs.csv'),
  pytools: J('Dockerfile', ['FROM python:3.12-slim', 'WORKDIR /app', 'COPY requirements.txt .', 'RUN pip install -r requirements.txt', 'COPY . .', 'CMD ["gunicorn", "app:app", "-b", "0.0.0.0:8000"]'], 'Successfully built image'),
  // Web
  html: J('index.html', ['<header class="hero">', '  <nav>', '    <a href="#courses">Courses</a>', '    <a href="#contact">Contact</a>', '  </nav>', '  <h1>Learn Web Development</h1>', '  <button>Start now</button>', '</header>'], 'Page rendered ✓'),
  htmlextra: J('form.html', ['<form action="/register" method="post">', '  <label for="email">Email</label>', '  <input id="email" type="email" required>', '  <dialog id="done">Saved!</dialog>', '  <button type="submit">Register</button>', '</form>'], 'Valid HTML5 ✓'),
  css: J('style.css', ['.grid {', '  display: grid;', '  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));', '  gap: 24px;', '}', '.card:hover {', '  transform: translateY(-4px);', '  box-shadow: 0 12px 30px rgb(0 0 0 / .2);', '}'], 'Responsive layout ✓'),
  bootstrap: J('index.html', ['<div class="container py-5">', '  <div class="row g-4">', '    <div class="col-md-4">', '      <div class="card shadow-sm">', '        <div class="card-body">', '          <h5 class="card-title">Pro Plan</h5>', '          <a class="btn btn-primary">Buy</a>'], 'Looks great on mobile ✓'),
  js: J('script.js', ['const cart = [{ name: "Pen", price: 20, qty: 3 },', '              { name: "Book", price: 150, qty: 1 }];', '', 'const total = cart', '  .map((item) => item.price * item.qty)', '  .reduce((sum, x) => sum + x, 0);', '', 'console.log(`Total: ₹${total}`);'], 'Total: ₹210'),
  react: J('App.jsx', ['function App() {', '  const [count, setCount] = useState(0);', '  return (', '    <button onClick={() => setCount(count + 1)}>', '      Clicked {count} times', '    </button>', '  );', '}'], 'Compiled successfully'),
  reactpro: J('useFetch.js', ['export function useFetch(url) {', '  const [data, setData] = useState(null);', '  useEffect(() => {', '    const ctrl = new AbortController();', '    fetch(url, { signal: ctrl.signal })', '      .then((r) => r.json()).then(setData);', '    return () => ctrl.abort();', '  }, [url]);', '  return data;', '}'], 'Rendered in 12 ms'),
  ts: J('types.ts', ['interface User {', '  id: number;', '  name: string;', '  role: "admin" | "student";', '}', '', 'function greet(user: User): string {', '  return `Hello, ${user.name}!`;', '}'], 'tsc: 0 errors'),
  node: J('server.js', ['const express = require("express");', 'const app = express();', 'app.use(express.json());', '', 'app.get("/api/tasks", async (req, res) => {', '  const tasks = await Task.find();', '  res.json(tasks);', '});', '', 'app.listen(3000);'], 'Server listening on 3000'),
  mongodb: { scene: 'db', file: 'shell', mongo: true, code: ['db.orders.aggregate([', '  { $match: { status: "paid" } },', '  { $group: { _id: "$city",', '      revenue: { $sum: "$amount" } } },', '  { $sort: { revenue: -1 } }', '])'], rows: [['Pune', '1,24,500'], ['Mumbai', '98,200'], ['Nagpur', '61,900']], cols: ['_id', 'revenue'] },
  mern: J('server.js', ['app.post("/api/auth/login", async (req, res) => {', '  const user = await User.findOne({ email: req.body.email });', '  if (!user || !(await user.check(req.body.password)))', '    return res.status(401).json({ error: "Invalid login" });', '  res.json({ token: sign(user) });', '});'], 'Deployed ✓ api + client'),
  merninterview: J('interview.js', ['// Q: What does this print?', 'for (var i = 0; i < 3; i++) {', '  setTimeout(() => console.log(i), 0);', '}', '// A: 3 3 3  (var is function-scoped)', '// Fix: use let → 0 1 2'], 'Ready for the interview ✓'),
  nextjs: J('page.tsx', ['export default async function Page() {', '  const posts = await getPosts();', '  return (', '    <main>', '      {posts.map((p) => <PostCard key={p.id} post={p} />)}', '    </main>', '  );', '}'], '✓ Compiled /page in 312 ms'),
  vue: J('TodoList.vue', ['<script setup>', 'import { ref, computed } from "vue";', 'const todos = ref([]);', 'const left = computed(() =>', '  todos.value.filter((t) => !t.done).length);', '</script>', '<template><p>{{ left }} tasks left</p></template>'], 'Vite ready in 280 ms'),
  // .NET
  dotnet: J('ProductsController.cs', ['[ApiController]', '[Route("api/[controller]")]', 'public class ProductsController : ControllerBase', '{', '    [HttpGet]', '    public async Task<IActionResult> Get()', '        => Ok(await _db.Products.ToListAsync());', '}'], 'Now listening on :5001'),
  dotnetextra: J('Program.cs', ['var top = students', '    .Where(s => s.Marks >= 75)', '    .OrderByDescending(s => s.Marks)', '    .Select(s => new { s.Name, s.Marks })', '    .Take(3);', '', 'foreach (var s in top) Console.WriteLine(s);'], '{ Name = Riya, Marks = 92 }'),
  // databases
  mysql: { scene: 'db', file: 'Query 1', code: ['CREATE VIEW top_customers AS', 'SELECT c.name, SUM(o.amount) AS spent', 'FROM customers c', 'JOIN orders o ON o.customer_id = c.id', 'GROUP BY c.id', 'HAVING spent > 10000;'], rows: [['Asha', '24,800'], ['Ravi', '18,350'], ['Neha', '12,900']], cols: ['name', 'spent'] },
  // data analytics
  excel: { scene: 'sheet', formula: '=XLOOKUP(A2, Products[ID], Products[Price])' },
  extra: { scene: 'sheet', formula: '=LET(t, SUM(D2:D9), FILTER(A2:D9, D2:D9 > t/8))' },
  guides: { scene: 'sheet', formula: '=SUMIFS(Sales[Amount], Sales[Region], "West")' },
  powerbi: { scene: 'dash', formula: 'Total Sales = SUM(Sales[Amount])' },
  pbiextra: { scene: 'dash', formula: 'YoY % = DIVIDE([Sales] - [Sales LY], [Sales LY])' },
  pbiguides: { scene: 'dash', formula: 'Sales LY = CALCULATE([Sales], SAMEPERIODLASTYEAR(Date[Date]))' },
  // other
  ai: { scene: 'ai', prompt: 'Explain recursion with a real-life example', answer: ['Think of Russian dolls: each doll', 'opens to a smaller one until the', 'smallest. A recursive function calls', 'itself until it reaches a base case.'] },
  softskills: { scene: 'talk' },
};
const LANG_DEFAULT = { java: 'corejava', python: 'python', web: 'js', dotnet: 'dotnet', mysql: 'mysql', ai: 'ai', soft: 'softskills', pbi: 'powerbi' };
export function artFor(track) {
  return ART[track?.key] || ART[LANG_DEFAULT[track?.lang]] || (track?.group === 'data' ? ART.excel : ART.js);
}

/* ------------------------------------------------------------ syntax highlighting */
const KW = 'public|private|protected|class|static|void|int|new|return|for|if|else|while|extends|implements|import|from|def|async|await|const|let|var|function|interface|export|default|throws|true|false|null|None|True|False|in|and|or|not|as|lambda|try|catch|select|from|where|join|on|group|by|order|having|create|view|asc|desc|round|count|sum|avg|foreach|using|namespace|string|float|bool|package|this|self|FROM|WORKDIR|COPY|RUN|CMD|SELECT|JOIN|ON|GROUP|BY|ORDER|HAVING|CREATE|VIEW|AS|AND|WHERE|COUNT|SUM|AVG|ROUND|DESC';
const KW_RE = new RegExp(`^(${KW})$`);
const TOKEN = /(\/\/.*|#(?![\w-]*\s*=).*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`|<\/?[A-Za-z][\w.-]*|\/?>|@\w+|\$\w+|\b\d[\d.]*\b|\b[A-Za-z_]\w*\b|\s+|.)/g;
function tokens(line) {
  const out = [];
  const parts = line.match(TOKEN) || [];
  parts.forEach((t, i) => {
    let col = C.txt;
    if (/^(\/\/|#)/.test(t) && t.length > 1 && !/^#\w+$/.test(t)) col = C.com;
    else if (/^["'`]/.test(t)) col = C.str;
    else if (/^<\/?[A-Za-z]/.test(t) || t === '/>' || t === '>') col = C.tag;
    else if (/^@\w/.test(t) || /^\$\w/.test(t)) col = C.num;
    else if (/^\d/.test(t)) col = C.num;
    else if (KW_RE.test(t)) col = C.kw;
    else if (/^[A-Za-z_]\w*$/.test(t)) {
      const next = parts.slice(i + 1).find((x) => !/^\s+$/.test(x));
      if (next === '(') col = C.fn; else if (/^[A-Z]/.test(t)) col = C.type;
    }
    out.push([col, t]);
  });
  return out;
}

/* ------------------------------------------------------------ scenes (drawn in a 420 x 240 box) */
function Window({ x, y, w, h, title, accent, children }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx="12" fill={C.win} stroke="#ffffff" strokeOpacity=".12" />
      <path d={`M12 0h${w - 24}a12 12 0 0 1 12 12v14H0V12A12 12 0 0 1 12 0z`} fill={C.bar} />
      {['#f87171', '#fbbf24', '#34d399'].map((c, i) => <circle key={c} cx={16 + i * 13} cy="13" r="4" fill={c} />)}
      {title && <><rect x="58" y="5" width={Math.min(w - 70, title.length * 6.4 + 18)} height="21" rx="5" fill={C.win} /><circle cx="68" cy="15.5" r="3" fill={accent} /><text x="76" y="19.5" fontSize="10.5" fill={C.txt} fontFamily="JetBrains Mono, monospace">{title}</text></>}
      <g transform="translate(0 26)">{children}</g>
    </g>
  );
}
function CodeScene({ a, accent }) {
  const lines = a.code.slice(0, 9);
  return (
    <>
      <Window x={0} y={0} w={400} h={206} title={a.file} accent={accent}>
        {lines.map((l, i) => (
          <g key={i}>
            <text x="12" y={20 + i * 19} fontSize="10" fill="#475569" fontFamily="JetBrains Mono, monospace" textAnchor="end" dx="8">{i + 1}</text>
            <text x="30" y={20 + i * 19} fontSize="11.2" fontFamily="JetBrains Mono, Consolas, monospace" xmlSpace="preserve">
              {tokens(l.length > 52 ? `${l.slice(0, 50)}…` : l).map(([c, t], k) => <tspan key={k} fill={c}>{t}</tspan>)}
            </text>
          </g>
        ))}
        <rect x="30" y={6 + Math.min(lines.length - 1, 3) * 19} width="2" height="16" fill={accent}><animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" /></rect>
      </Window>
      <g transform="translate(232 168)">
        <rect width="200" height="56" rx="10" fill="#020617" stroke={accent} strokeOpacity=".7" />
        <text x="12" y="20" fontSize="9.5" fill={C.mute} fontFamily="JetBrains Mono, monospace">$ run</text>
        <text x="12" y="40" fontSize="11" fill={C.str} fontFamily="JetBrains Mono, monospace">{`✓ ${a.out}`.slice(0, 30)}</text>
      </g>
    </>
  );
}
function SheetScene({ a, accent }) {
  const rows = [['Product', 'Region', 'Units', 'Sales'], ['Laptop', 'West', '42', '₹21.0L'], ['Phone', 'North', '88', '₹17.6L'], ['Tablet', 'South', '35', '₹8.7L'], ['Monitor', 'East', '51', '₹6.1L'], ['Printer', 'West', '23', '₹2.9L']];
  return (
    <>
      <Window x={0} y={0} w={400} h={206} title="Sales Report.xlsx" accent={accent}>
        <rect x="0" y="0" width="400" height="22" fill="#111827" />
        <text x="10" y="15" fontSize="10" fill={accent} fontWeight="700" fontFamily="Inter, sans-serif">fx</text>
        <text x="30" y="15" fontSize="10.5" fill={C.txt} fontFamily="JetBrains Mono, monospace">{a.formula.slice(0, 52)}</text>
        {['', 'A', 'B', 'C', 'D'].map((h, i) => <text key={h || 'n'} x={i === 0 ? 10 : 30 + (i - 1) * 92 + 40} y="38" fontSize="9.5" fill={C.mute} textAnchor="middle" fontFamily="Inter, sans-serif">{h}</text>)}
        {rows.map((r, ri) => (
          <g key={ri} transform={`translate(0 ${44 + ri * 22})`}>
            <rect x="24" width="370" height="22" fill={ri === 0 ? '#1e293b' : ri === 2 ? `${accent}22` : 'transparent'} stroke={C.line} strokeWidth=".6" />
            <text x="10" y="15" fontSize="9" fill={C.mute} textAnchor="middle" fontFamily="Inter, sans-serif">{ri + 1}</text>
            {r.map((c, ci) => <text key={ci} x={30 + ci * 92 + (ci >= 2 ? 80 : 4)} y="15" fontSize="10.5" textAnchor={ci >= 2 ? 'end' : 'start'} fill={ri === 0 ? '#fff' : C.txt} fontWeight={ri === 0 ? 700 : 400} fontFamily="Inter, sans-serif">{c}</text>)}
          </g>
        ))}
        <rect x={30 + 3 * 92 - 6} y={44 + 2 * 22} width="92" height="22" fill="none" stroke={accent} strokeWidth="2" />
      </Window>
      <g transform="translate(272 150)">
        <rect width="160" height="78" rx="10" fill="#020617" stroke={accent} strokeOpacity=".7" />
        {[46, 38, 20, 14, 7].map((v, i) => <rect key={i} x={14 + i * 28} y={66 - v} width="18" height={v} rx="3" fill={accent} opacity={1 - i * 0.14} />)}
        <text x="14" y="16" fontSize="9" fill={C.mute} fontFamily="Inter, sans-serif">Sales by product</text>
      </g>
    </>
  );
}
function DashScene({ a, accent }) {
  const kpis = [['Revenue', '₹4.82 Cr', '+12.4%'], ['Orders', '18,240', '+6.1%'], ['Margin', '31.6%', '+2.3%']];
  return (
    <>
      <Window x={0} y={0} w={410} h={210} title="Sales Dashboard" accent={accent}>
        {kpis.map(([l, v, d], i) => (
          <g key={l} transform={`translate(${12 + i * 132} 10)`}>
            <rect width="122" height="50" rx="8" fill="#111827" stroke={C.line} />
            <text x="10" y="17" fontSize="9" fill={C.mute} fontFamily="Inter, sans-serif">{l}</text>
            <text x="10" y="37" fontSize="15" fontWeight="800" fill="#fff" fontFamily="Inter, sans-serif">{v}</text>
            <text x="112" y="17" fontSize="8.5" fill={C.str} textAnchor="end" fontFamily="Inter, sans-serif">{d}</text>
          </g>
        ))}
        <g transform="translate(12 70)">
          <rect width="250" height="104" rx="8" fill="#111827" stroke={C.line} />
          <path d="M14 84 L48 66 L82 72 L116 48 L150 54 L184 30 L218 36 L240 18" fill="none" stroke={accent} strokeWidth="3" strokeLinejoin="round" />
          <path d="M14 84 L48 66 L82 72 L116 48 L150 54 L184 30 L218 36 L240 18 L240 96 L14 96 Z" fill={accent} opacity=".15" />
          <path d="M14 90 L48 80 L82 84 L116 70 L150 74 L184 60 L218 64 L240 52" fill="none" stroke={C.mute} strokeWidth="1.5" strokeDasharray="4 3" />
        </g>
        <g transform="translate(272 70)">
          <rect width="126" height="104" rx="8" fill="#111827" stroke={C.line} />
          <circle cx="63" cy="52" r="32" fill="none" stroke={C.line} strokeWidth="14" />
          <circle cx="63" cy="52" r="32" fill="none" stroke={accent} strokeWidth="14" strokeDasharray="140 201" transform="rotate(-90 63 52)" />
          <circle cx="63" cy="52" r="32" fill="none" stroke={C.type} strokeWidth="14" strokeDasharray="40 201" strokeDashoffset="-140" transform="rotate(-90 63 52)" />
          <text x="63" y="57" fontSize="13" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="Inter, sans-serif">70%</text>
        </g>
      </Window>
      <g transform="translate(150 196)">
        <rect width="282" height="34" rx="9" fill="#020617" stroke={accent} strokeOpacity=".7" />
        <text x="12" y="22" fontSize="10.5" fontFamily="JetBrains Mono, monospace">{tokens(a.formula.slice(0, 40)).map(([c, t], k) => <tspan key={k} fill={c === C.txt ? C.fn : c}>{t}</tspan>)}</text>
      </g>
    </>
  );
}
function DbScene({ a, accent }) {
  return (
    <>
      <Window x={0} y={0} w={330} h={150} title={a.file} accent={accent}>
        {a.code.slice(0, 6).map((l, i) => (
          <text key={i} x="12" y={20 + i * 18} fontSize="11" fontFamily="JetBrains Mono, Consolas, monospace" xmlSpace="preserve">{tokens(l.length > 44 ? `${l.slice(0, 42)}…` : l).map(([c, t], k) => <tspan key={k} fill={c}>{t}</tspan>)}</text>
        ))}
      </Window>
      <g transform="translate(150 118)">
        <rect width="280" height={30 + a.rows.length * 22} rx="10" fill="#020617" stroke={accent} strokeOpacity=".7" />
        <rect width="280" height="24" rx="10" fill="#1e293b" />
        {a.cols.map((c, i) => <text key={c} x={14 + i * (252 / a.cols.length)} y="16" fontSize="10" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif">{c}</text>)}
        {a.rows.map((r, ri) => r.map((c, ci) => <text key={`${ri}${ci}`} x={14 + ci * (252 / a.cols.length)} y={42 + ri * 22} fontSize="10.5" fill={C.txt} fontFamily="Inter, sans-serif">{c}</text>))}
      </g>
      <g transform="translate(352 16)">
        <ellipse cx="34" cy="10" rx="34" ry="10" fill={accent} />
        <path d="M0 10v56c0 5.5 15 10 34 10s34-4.5 34-10V10" fill={accent} opacity=".75" />
        <ellipse cx="34" cy="38" rx="34" ry="10" fill="none" stroke="#fff" strokeOpacity=".35" />
        <ellipse cx="34" cy="10" rx="34" ry="10" fill="#fff" fillOpacity=".25" />
      </g>
    </>
  );
}
function AiScene({ a, accent }) {
  const nodes = [[0, [20, 60, 100]], [1, [10, 45, 80, 115]], [2, [40, 80]]];
  return (
    <>
      <g transform="translate(300 40) scale(1.05)">
        {nodes.slice(0, -1).map(([l, ys]) => ys.map((y) => nodes[l + 1][1].map((y2) => <line key={`${l}${y}${y2}`} x1={l * 50} y1={y} x2={(l + 1) * 50} y2={y2} stroke={accent} strokeOpacity=".45" />)))}
        {nodes.map(([l, ys]) => ys.map((y) => <circle key={`${l}${y}`} cx={l * 50} cy={y} r="8" fill={C.win} stroke={accent} strokeWidth="2.5" />))}
      </g>
      <Window x={0} y={0} w={290} h={226} title="AI Assistant" accent={accent}>
        <rect x="80" y="12" width="198" height="40" rx="10" fill={accent} />
        <text x="90" y="30" fontSize="10" fill="#fff" fontFamily="Inter, sans-serif">{a.prompt.slice(0, 32)}</text>
        <text x="90" y="44" fontSize="10" fill="#fff" fontFamily="Inter, sans-serif">{a.prompt.slice(32, 64)}</text>
        <rect x="12" y="62" width="234" height="98" rx="10" fill="#1e293b" />
        <circle cx="26" cy="76" r="7" fill={C.str} />
        {a.answer.map((l, i) => <text key={i} x="40" y={80 + i * 18} fontSize="10" fill={C.txt} fontFamily="Inter, sans-serif">{l}</text>)}
        <rect x="12" y="170" width="266" height="24" rx="12" fill="#111827" stroke={C.line} />
        <text x="24" y="186" fontSize="9.5" fill={C.mute} fontFamily="Inter, sans-serif">Ask anything…</text>
        <circle cx="264" cy="182" r="8" fill={accent} />
      </Window>
    </>
  );
}
function TalkScene({ accent }) {
  return (
    <>
      <Window x={0} y={0} w={300} h={180} title="Interview Ready.pptx" accent={accent}>
        <text x="20" y="34" fontSize="16" fontWeight="800" fill="#fff" fontFamily="Inter, sans-serif">Tell me about yourself</text>
        {['Education & skills', 'Best project & impact', 'Why this role'].map((t, i) => (
          <g key={t} transform={`translate(20 ${54 + i * 26})`}><circle cx="6" cy="-4" r="5" fill={accent} /><text x="18" y="0" fontSize="11.5" fill={C.txt} fontFamily="Inter, sans-serif">{t}</text></g>
        ))}
        <g transform="translate(200 50)">{[30, 48, 66, 84].map((h, i) => <rect key={i} x={i * 18} y={90 - h} width="12" height={h} rx="3" fill={accent} opacity={0.5 + i * 0.15} />)}</g>
      </Window>
      <g transform="translate(250 120)">
        <rect width="180" height="46" rx="14" fill="#1e293b" stroke={accent} strokeOpacity=".7" />
        <path d="M24 46 l-6 12 l16 -12z" fill="#1e293b" />
        <text x="14" y="20" fontSize="10.5" fill={C.txt} fontFamily="Inter, sans-serif">“I built an e-commerce API</text>
        <text x="14" y="35" fontSize="10.5" fill={C.txt} fontFamily="Inter, sans-serif">used by 200+ users…”</text>
      </g>
      <g transform="translate(330 186)">
        <rect width="100" height="36" rx="18" fill={accent} />
        <text x="50" y="23" fontSize="11" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="Inter, sans-serif">✓ Confident</text>
      </g>
    </>
  );
}
const SCENES = { code: CodeScene, sheet: SheetScene, dash: DashScene, db: DbScene, ai: AiScene, talk: TalkScene };

/* ------------------------------------------------------------ the cover */
export default function CourseArt({ track, height = 160, showTitle = true, wide = false }) {
  const accent = solid(track?.color);
  const a = artFor(track);
  const Scene = SCENES[a.scene] || CodeScene;
  const id = `ca-${track?.key || 'x'}-${wide ? 'w' : 'n'}-${showTitle ? 't' : 'f'}`;
  const W = wide ? 1200 : showTitle ? 760 : 640;
  const H = 260;
  const modules = useMemo(() => new Set((track?.topics || []).map((t) => t.module).filter(Boolean)).size, [track]);
  const lessons = track?.topics?.length || 0;
  const group = { java: 'JAVA FULL STACK', python: 'PYTHON', web: 'WEB DEVELOPMENT', mern: 'MERN STACK', dotnet: '.NET FULL STACK', db: 'DATABASES', ai: 'ARTIFICIAL INTELLIGENCE', data: 'DATA ANALYTICS', career: 'CAREER SKILLS' }[track?.group] || 'COURSE';
  const sceneScale = showTitle ? (wide ? 0.98 : 0.86) : 0.98;
  const sceneX = showTitle ? W - 440 * sceneScale - (wide ? 70 : 24) : (W - 440 * sceneScale) / 2;
  const sceneY = showTitle ? (H - 240 * sceneScale) / 2 + 4 : 14;
  const title = track?.name || '';
  const words = title.split(' ');
  const maxCh = wide ? 30 : 17;
  const lines = []; let cur = '';
  words.forEach((w) => { if ((`${cur} ${w}`).trim().length > maxCh && cur) { lines.push(cur); cur = w; } else cur = `${cur} ${w}`.trim(); });
  if (cur) lines.push(cur);
  const tl = lines.slice(0, 3);
  return (
    <svg className="course-cover course-art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ height }} role="img" aria-label={`${title} course cover`}>
      <defs>
        <radialGradient id={`${id}-g1`} cx="80%" cy="20%" r="70%"><stop offset="0" stopColor={accent} stopOpacity=".55" /><stop offset="1" stopColor={accent} stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}-g2`} cx="10%" cy="100%" r="60%"><stop offset="0" stopColor="#06b6d4" stopOpacity=".25" /><stop offset="1" stopColor="#06b6d4" stopOpacity="0" /></radialGradient>
        <pattern id={`${id}-dots`} width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#fff" opacity=".07" /></pattern>
        <filter id={`${id}-sh`} x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#000" floodOpacity=".45" /></filter>
      </defs>
      <rect width={W} height={H} fill={C.bg} />
      <rect width={W} height={H} fill={`url(#${id}-g1)`} />
      <rect width={W} height={H} fill={`url(#${id}-g2)`} />
      <rect width={W} height={H} fill={`url(#${id}-dots)`} />
      <g transform={`translate(${sceneX} ${sceneY}) scale(${sceneScale})`} filter={`url(#${id}-sh)`}>
        <Scene a={a} accent={accent} />
      </g>
      {showTitle && (
        <g fontFamily="Inter, system-ui, sans-serif">
          <rect x={wide ? 70 : 34} y={wide ? 50 : 38} width={group.length * (wide ? 8.4 : 7.4) + 22} height={wide ? 28 : 24} rx="12" fill={accent} fillOpacity=".22" stroke={accent} strokeOpacity=".6" />
          <text x={(wide ? 70 : 34) + 11} y={wide ? 69 : 55} fontSize={wide ? 12.5 : 11} fontWeight="800" letterSpacing="1.4" fill="#fff">{group}</text>
          {tl.map((l, i) => <text key={i} x={wide ? 70 : 34} y={(wide ? 122 : 98) + i * (wide ? 46 : 34)} fontSize={wide ? 40 : 29} fontWeight="800" fill="#fff" letterSpacing="-.5">{l}</text>)}
          <text x={wide ? 70 : 34} y={(wide ? 122 : 98) + tl.length * (wide ? 46 : 34) + (wide ? 8 : 4)} fontSize={wide ? 16 : 13} fill="#cbd5e1">{lessons ? `${lessons} lessons${modules > 1 ? ` · ${modules} modules` : ''} · practice · interview prep` : 'Practice · interview prep'}</text>
        </g>
      )}
    </svg>
  );
}
