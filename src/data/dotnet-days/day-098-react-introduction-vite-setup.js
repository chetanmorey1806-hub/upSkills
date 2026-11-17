export default {
  id: 'day-098-react-introduction-vite-setup',
  title: 'React Introduction, Features, SPA, React Architecture, Node.js, npm and Vite Setup',
  module: 'Module 9: React.js Frontend with .NET Web API',
  day: 98,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Start the frontend half of the full stack: understand what React is, why Single Page Applications pair so well with an ASP.NET Core Web API, install Node.js and npm, and create a React project with Vite that will talk to the Module 8 API.',
  objectives: [
    'Explain React, its key features and the Single Page Application (SPA) model',
    'Describe how a React SPA and an ASP.NET Core Web API work together (JSON over HTTP, CORS)',
    'Install Node.js / npm and create a React project with Vite',
    'Understand the Vite project structure, npm scripts and the dev server proxy to the .NET API',
  ],
  theory: [
    {
      heading: 'What is React and why do .NET developers learn it?',
      content:
        '**React** is a free, open-source JavaScript **library** (made by Meta) for building user interfaces out of small reusable pieces called **components**. It only handles the **view** layer: what the user sees and how it changes when data changes.\n\nIn Module 8 you built an **ASP.NET Core Web API** that returns JSON. An API has no screens. React is the most popular way to build the screens that call that API. Together they form a classic full-stack setup:\n\n- **Frontend**: React (runs in the browser, port 5173 in development)\n- **Backend**: ASP.NET Core Web API (runs on Kestrel, e.g. https://localhost:7045)\n- **Database**: SQL Server through EF Core\n\nAnalogy: the Web API is the **kitchen** of a restaurant, React is the **dining room + waiter**. The waiter (React) takes orders, carries them to the kitchen (HTTP request), and brings back food (JSON response) that is served nicely on the table (UI).',
      points: [
        '**Library, not framework**: React gives you components; you choose router (react-router-dom), HTTP client (axios) and styling yourself',
        'Used by Facebook, Instagram, Netflix, Airbnb, and many .NET shops (Visual Studio even ships a "React and ASP.NET Core" template)',
      ],
    },
    {
      heading: 'Key features of React',
      content:
        'React became popular because of a few big ideas:',
      points: [
        '**Component-based**: UI is split into components (Navbar, StudentCard, StudentTable) that you write once and reuse',
        '**Declarative**: you describe WHAT the UI should look like for the current data; React works out HOW to update the page',
        '**JSX**: HTML-like syntax inside JavaScript (`<h1>{name}</h1>`), compiled to plain JavaScript',
        '**Virtual DOM**: React keeps a lightweight copy of the page in memory, compares old vs new (diffing / reconciliation) and changes only what is different in the real DOM',
        '**One-way data flow**: data goes from parent to child through props, which makes bugs easier to track',
        '**Hooks**: functions like useState and useEffect that add state and side effects to function components',
        '**Huge ecosystem**: react-router-dom, axios, Redux Toolkit, React Query, Tailwind, Bootstrap',
      ],
      tip: 'Do not confuse React (web) with React Native (mobile apps). The concepts are the same, the output is different.',
    },
    {
      heading: 'SPA vs MPA: how pages are delivered',
      content:
        'In the **MVC / Razor** days (Module 6) the server built a full HTML page for every click. That is a **Multi Page Application (MPA)**: each navigation reloads the whole page.\n\nA **Single Page Application (SPA)** loads **one** HTML page (`index.html`) and a JavaScript bundle **once**. After that, clicking links only swaps components in the browser, and data comes from the API as **JSON**.\n\n1. Browser requests `http://localhost:5173/` and gets index.html + main.js\n2. React renders the app into `<div id="root">`\n3. When a page needs data, React calls `GET https://localhost:7045/api/students`\n4. The ASP.NET Core API returns JSON, React updates only the table',
      points: [
        '**SPA pros**: fast navigation, app-like feel, backend is reusable for mobile apps',
        '**SPA cons**: first load is larger, SEO needs extra work (server rendering frameworks like Next.js solve it)',
        'MVC with Razor = server renders HTML; Web API + React = server sends data, browser renders HTML',
      ],
    },
    {
      heading: 'React architecture: component tree, state, props and the Virtual DOM',
      content:
        'A React app is a **tree of components**. `main.jsx` renders `<App />`; App renders `<Navbar />`, `<StudentList />` and so on.\n\n- **Props** flow down the tree (parent to child), like method parameters\n- **State** is data owned by a component that can change (like a private field)\n- When state changes, React **re-renders** that component, builds a new Virtual DOM, **diffs** it with the previous one and **commits** only the changes to the real DOM\n\nThis render → diff → commit cycle is why you never write `document.getElementById(...).innerHTML = ...` in React.',
      syntax: `main.jsx
  └── <App>
        ├── <Navbar />
        ├── <StudentList students={students}>
        │      └── <StudentRow /> x N
        └── <Footer />`,
    },
    {
      heading: 'Node.js, npm and Vite',
      content:
        '**Node.js** is a JavaScript runtime outside the browser. React does not need Node in production, but all the **build tools** run on Node. Installing Node gives you **npm** (Node Package Manager), the "NuGet of JavaScript".\n\n- NuGet ↔ npm\n- .csproj PackageReference ↔ package.json dependencies\n- dotnet restore ↔ npm install\n- dotnet run ↔ npm run dev\n- dotnet publish ↔ npm run build\n\n**Vite** is the modern build tool for React. It starts a dev server in milliseconds with **HMR** (Hot Module Replacement: save a file and only that component refreshes) and bundles the app into a `dist/` folder for production. Create React App (CRA) is deprecated; use Vite.',
      syntax: `node -v                     # v20 or v22 LTS recommended
npm -v
npm create vite@latest student-portal -- --template react
cd student-portal
npm install
npm run dev                 # http://localhost:5173`,
      tip: 'Install the LTS version of Node.js from nodejs.org. In Visual Studio 2022/2026 you can also use File > New > Project > "React and ASP.NET Core" which creates both projects in one solution.',
    },
    {
      heading: 'Connecting Vite to the ASP.NET Core API: CORS or proxy',
      content:
        'The React dev server runs on `http://localhost:5173` and the API on `https://localhost:7045`. Different port = different **origin**, so the browser blocks the call unless the API allows it with **CORS** (Day 96).\n\nTwo ways to make it work in development:\n\n1. **CORS on the API** (recommended, also needed in production when domains differ): `builder.Services.AddCors(...)` with `WithOrigins("http://localhost:5173")` and `app.UseCors("ReactApp")`.\n2. **Vite proxy**: in `vite.config.js` forward `/api` calls to the .NET API. The browser thinks it is talking to 5173, so no CORS is needed during development.\n\nStore the API address in a `.env` file: `VITE_API_URL=https://localhost:7045/api`. Only variables starting with `VITE_` are exposed to React code via `import.meta.env`.',
      syntax: `// Program.cs (ASP.NET Core API)
builder.Services.AddCors(o => o.AddPolicy("ReactApp", p =>
    p.WithOrigins("http://localhost:5173")
     .AllowAnyHeader()
     .AllowAnyMethod()));
...
app.UseCors("ReactApp");   // before UseAuthentication / MapControllers`,
      tip: 'Run `dotnet dev-certs https --trust` once so the browser trusts the local HTTPS certificate, otherwise fetch fails with a certificate error.',
    },
  ],
  examples: [
    {
      title: 'Create the React project with Vite',
      scenario: 'Create the "student-portal" React project that will become the frontend for the Student API built in Module 8.',
      steps: [
        'Install Node.js LTS from nodejs.org and check with node -v and npm -v',
        'Open a terminal (or Visual Studio Code > Terminal > New Terminal) in your workspace folder',
        'Run: npm create vite@latest student-portal -- --template react',
        'Run: cd student-portal, then npm install',
        'Run: npm run dev and open http://localhost:5173',
        'Replace src/App.jsx with the code below and save: the browser updates instantly (HMR)',
      ],
      code: `// Terminal
npm create vite@latest student-portal -- --template react
cd student-portal
npm install
npm install axios react-router-dom      // used from Day 101 and 103
npm run dev

// student-portal/
// ├── index.html          <div id="root"></div> + <script type="module" src="/src/main.jsx">
// ├── package.json        scripts: dev, build, preview, lint
// ├── vite.config.js
// ├── .env                VITE_API_URL=https://localhost:7045/api
// └── src/
//     ├── main.jsx        entry point
//     ├── App.jsx         root component
//     └── index.css

// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// src/App.jsx
function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  return (
    <div className="container">
      <h1>Student Portal</h1>
      <p>React (Vite) frontend for the ASP.NET Core Web API</p>
      <p>API base URL: {apiUrl}</p>
    </div>
  );
}

export default App;`,
      playground: {
        jsx: `function App() {
  const apiUrl = "https://localhost:7045/api"; // in Vite: import.meta.env.VITE_API_URL
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 24 }}>
      <h1>Student Portal</h1>
      <p>React (Vite) frontend for the ASP.NET Core Web API</p>
      <p>API base URL: <code>{apiUrl}</code></p>
    </div>
  );
}`,
      },
      result: 'The page shows the heading "Student Portal", the line "React (Vite) frontend for the ASP.NET Core Web API" and "API base URL: https://localhost:7045/api".',
      explanation:
        'npm create vite scaffolds the project, npm install downloads React and Vite into node_modules, and npm run dev starts the Vite dev server. main.jsx finds the #root div from index.html and renders App into it. import.meta.env.VITE_API_URL reads the value from the .env file (the playground hard-codes it because there is no .env there).',
    },
    {
      title: 'SPA in action: switching "pages" without reloading',
      scenario: 'Show students how a Single Page Application changes the screen without asking the server for a new HTML page (unlike the MVC app from Module 6).',
      steps: [
        'Open src/App.jsx in the student-portal project',
        'Paste the code, save and watch the browser',
        'Open DevTools (F12) > Network tab and click the menu buttons',
        'Notice that no new document request is made: only React re-renders',
      ],
      code: `// src/App.jsx  (manual page switch; Day 103 replaces this with react-router-dom)
import { useState } from "react";

function Home() { return <p>Welcome to the Student Portal.</p>; }
function Students() { return <p>Student list will be loaded from GET /api/students.</p>; }
function About() { return <p>Frontend: React + Vite. Backend: ASP.NET Core Web API.</p>; }

export default function App() {
  const [page, setPage] = useState("home");
  const [renders, setRenders] = useState(0);

  function go(p) { setPage(p); setRenders(r => r + 1); }

  return (
    <div>
      <nav>
        <button onClick={() => go("home")}>Home</button>
        <button onClick={() => go("students")}>Students</button>
        <button onClick={() => go("about")}>About</button>
      </nav>
      {page === "home" && <Home />}
      {page === "students" && <Students />}
      {page === "about" && <About />}
      <small>Page switches without reload: {renders}</small>
    </div>
  );
}`,
      playground: {
        jsx: `const { useState } = React;

function Home() { return <p>Welcome to the Student Portal.</p>; }
function Students() { return <p>Student list will be loaded from GET /api/students.</p>; }
function About() { return <p>Frontend: React + Vite. Backend: ASP.NET Core Web API.</p>; }

function App() {
  const [page, setPage] = useState("home");
  const [renders, setRenders] = useState(0);

  function go(p) { setPage(p); setRenders(r => r + 1); }

  const btn = (p, label) => (
    <button onClick={() => go(p)}
      style={{ marginRight: 8, padding: "6px 12px", background: page === p ? "#512bd4" : "#eee", color: page === p ? "#fff" : "#000", border: 0, borderRadius: 4 }}>
      {label}
    </button>
  );

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 20 }}>
      <nav style={{ marginBottom: 12 }}>
        {btn("home", "Home")}{btn("students", "Students")}{btn("about", "About")}
      </nav>
      {page === "home" && <Home />}
      {page === "students" && <Students />}
      {page === "about" && <About />}
      <small>Page switches without reload: {renders}</small>
    </div>
  );
}`,
      },
      result: 'Initially "Welcome to the Student Portal." and "Page switches without reload: 0". Clicking Students shows "Student list will be loaded from GET /api/students." and the counter becomes 1; the browser never reloads.',
      explanation:
        'The whole app lives in one page. useState stores which "page" is active; changing it makes React re-render and swap the component. The counter would reset to 0 if the browser reloaded, proving it is a SPA.',
    },
    {
      title: 'Configure the Vite proxy and CORS for the .NET API',
      scenario: 'Prepare both sides so that React on port 5173 can call the Module 8 Student API on https://localhost:7045.',
      steps: [
        'In the ASP.NET Core API project open Program.cs and add the CORS policy shown',
        'Run the API with F5 in Visual Studio (Swagger opens at https://localhost:7045/swagger)',
        'In the React project create .env with VITE_API_URL',
        'Optionally edit vite.config.js to add the proxy, then restart npm run dev',
        'Use the playground to see what the call returns (simulated API)',
      ],
      code: `// ===== ASP.NET Core API: Program.cs (Module 8 project) =====
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseHttpsRedirection();
app.UseCors("ReactApp");
app.UseAuthorization();
app.MapControllers();
app.Run();

// ===== React: .env =====
VITE_API_URL=https://localhost:7045/api

// ===== React: vite.config.js (optional dev proxy) =====
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "https://localhost:7045", changeOrigin: true, secure: false }
    }
  }
});

// ===== React: quick test in App.jsx =====
fetch(import.meta.env.VITE_API_URL + "/students")
  .then(r => r.json())
  .then(data => console.log(data));`,
      playground: {
        jsx: `const { useState } = React;

// Fake API that behaves like GET https://localhost:7045/api/students
function fakeGetStudents() {
  return new Promise(resolve =>
    setTimeout(() => resolve([
      { id: 1, name: "Asha", course: "C#" },
      { id: 2, name: "Ravi", course: "React" }
    ]), 600));
}

function App() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("Not called yet");

  async function callApi() {
    setStatus("Calling GET /api/students ...");
    const students = await fakeGetStudents();
    setData(students);
    setStatus("200 OK (CORS allowed for http://localhost:5173)");
  }

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 20 }}>
      <button onClick={callApi}>Call API</button>
      <p>{status}</p>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}`,
      },
      result: 'Click "Call API": the status shows "Calling GET /api/students ..." then "200 OK (CORS allowed for http://localhost:5173)" and the JSON array with Asha and Ravi is printed.',
      explanation:
        'AddCors registers a named policy that only trusts the React dev origin; UseCors must come before authorization and MapControllers so the preflight (OPTIONS) request gets the Access-Control-Allow-Origin header. The Vite proxy is an alternative for development: /api calls go to 5173 and Vite forwards them to 7045 on the server side, where CORS does not apply.',
    },
  ],
  interview: [
    { q: 'What is React?', a: 'An open-source JavaScript library by Meta for building user interfaces from reusable components. It focuses only on the view layer and updates the DOM efficiently using a Virtual DOM.', level: 'Easy' },
    { q: 'Is React a library or a framework?', a: 'A library. It handles rendering UI; routing, HTTP calls, forms and state management are added with other libraries (react-router-dom, axios, Redux Toolkit). Angular, by contrast, is a full framework.', level: 'Easy' },
    { q: 'What is a Single Page Application?', a: 'An app that loads one HTML page and a JavaScript bundle once; navigation swaps components in the browser and data is fetched as JSON from an API, so the page never fully reloads.', level: 'Easy' },
    { q: 'What is the Virtual DOM and why is it fast?', a: 'An in-memory JavaScript representation of the UI. On every state change React builds a new virtual tree, diffs it with the previous one (reconciliation) and applies only the minimal changes to the real DOM, which is the expensive part.', level: 'Medium' },
    { q: 'Why do we need Node.js if React runs in the browser?', a: 'Node.js runs the development tools: npm to install packages, Vite to serve and bundle, ESLint, Babel/esbuild for JSX. The production output in dist/ is plain HTML/CSS/JS and needs no Node.', level: 'Easy' },
    { q: 'Compare npm with NuGet.', a: 'Both are package managers. npm reads package.json (like .csproj PackageReference), installs into node_modules (like the NuGet cache), and package-lock.json pins exact versions (like packages.lock.json).', level: 'Easy' },
    { q: 'Why Vite instead of Create React App?', a: 'Vite serves source files as native ES modules, so it starts instantly and has very fast HMR; it builds with Rollup for production. CRA used Webpack, was slow and is deprecated.', level: 'Medium' },
    { q: 'Why does a React app on localhost:5173 get a CORS error when calling https://localhost:7045?', a: 'Different port and scheme means a different origin. The browser enforces the same-origin policy and blocks the response unless the API sends Access-Control-Allow-Origin for http://localhost:5173. Fix it with AddCors/UseCors in Program.cs or with a Vite dev proxy.', level: 'Medium' },
    { q: 'How do you expose environment variables to a Vite React app?', a: 'Put them in .env files with the VITE_ prefix (VITE_API_URL=...) and read them with import.meta.env.VITE_API_URL. Variables without the prefix are not exposed to the browser bundle. Never put secrets there: everything in the bundle is public.', level: 'Medium' },
    { q: 'What is the difference between ASP.NET Core MVC with Razor and Web API + React?', a: 'MVC renders HTML on the server per request (MPA). Web API returns only JSON, and React renders the HTML in the browser (SPA). The API can then also serve mobile apps or other clients.', level: 'Medium' },
    { q: 'What does StrictMode do?', a: 'A development-only wrapper that warns about unsafe patterns and intentionally double-invokes renders and effects to reveal side-effect bugs. It does nothing in production builds.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a Vite React project named "employee-portal", install axios and react-router-dom, and run it.',
      hint: 'npm create vite@latest <name> -- --template react',
      solution: `npm create vite@latest employee-portal -- --template react
cd employee-portal
npm install
npm install axios react-router-dom
npm run dev
# open http://localhost:5173`,
    },
    {
      task: 'Add a .env file with VITE_API_URL pointing to your Module 8 Employee API and display it in App.jsx.',
      hint: 'Restart npm run dev after creating .env; read with import.meta.env.',
      solution: `// .env
VITE_API_URL=https://localhost:7045/api

// src/App.jsx
export default function App() {
  return (
    <div>
      <h1>Employee Portal</h1>
      <p>API: {import.meta.env.VITE_API_URL}</p>
    </div>
  );
}`,
    },
    {
      task: 'Add a CORS policy to the Employee API that allows http://localhost:5173 and http://localhost:3000.',
      hint: 'WithOrigins accepts multiple origins; call UseCors before MapControllers.',
      solution: `builder.Services.AddCors(o => o.AddPolicy("ReactApp", p =>
    p.WithOrigins("http://localhost:5173", "http://localhost:3000")
     .AllowAnyHeader()
     .AllowAnyMethod()));
var app = builder.Build();
app.UseCors("ReactApp");
app.MapControllers();`,
    },
    {
      task: 'Configure the Vite dev proxy so that fetch("/api/employees") reaches https://localhost:7045/api/employees.',
      hint: 'server.proxy in vite.config.js; secure:false for the self-signed dev certificate.',
      solution: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": { target: "https://localhost:7045", changeOrigin: true, secure: false } } }
});`,
    },
    {
      task: 'Build the project for production and preview it.',
      hint: 'npm run build creates dist/, npm run preview serves it.',
      solution: `npm run build      # creates dist/index.html and dist/assets/*.js, *.css
npm run preview    # serves dist on http://localhost:4173`,
    },
  ],
  quiz: [
    { question: 'Which company created React?', options: ['Google', 'Microsoft', 'Meta (Facebook)', 'Amazon'], answer: 2, explanation: 'React was created at Facebook (now Meta) and open-sourced in 2013.' },
    { question: 'In a SPA, what does the ASP.NET Core Web API usually return?', options: ['JSON data', 'Full Razor HTML pages', 'CSS files', 'Compiled DLLs'], answer: 0, explanation: 'The API returns JSON; React renders HTML in the browser.' },
    { question: 'Which command starts the Vite development server?', options: ['npm start', 'dotnet run', 'npm run build', 'npm run dev'], answer: 3, explanation: 'The Vite template defines "dev": "vite", so npm run dev starts the dev server on port 5173.' },
    { question: 'Which env variable name can be read in Vite React code?', options: ['API_URL', 'VITE_API_URL', 'REACT_URL', 'NODE_API'], answer: 1, explanation: 'Only variables prefixed with VITE_ are exposed via import.meta.env.' },
    { question: 'Where must app.UseCors("ReactApp") be placed in Program.cs?', options: ['After app.Run()', 'Inside a controller', 'Before UseAuthorization and MapControllers', 'In appsettings.json'], answer: 2, explanation: 'CORS middleware must run before authorization and endpoint mapping so preflight requests get the CORS headers.' },
  ],
};
