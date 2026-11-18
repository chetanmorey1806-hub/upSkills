export default {
  lesson: 'day-02-setup-create-next-app-project-structure',
  minutes: 25,
  intro: 'Check that you know how a Next.js project is created, what each folder and npm script is for, and how the root layout wraps every page.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which command creates a new Next.js project with the official interactive setup?',
      options: ['npm install next-app', 'npx create-next-app@latest', 'npm init next', 'npx next new my-app'],
      answer: 1,
      explain: '`npx create-next-app@latest my-app` downloads the latest scaffolding tool and asks about TypeScript, ESLint, Tailwind, the `src/` folder, App Router, Turbopack and the import alias. `npm install next` alone only adds the package, it does not create the folders and config.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are **reserved file names** with a special meaning inside the `app/` folder of the App Router? (choose all that apply)',
      options: ['page.js', 'layout.js', 'index.js', 'loading.js', 'not-found.js', 'routes.js', 'route.js'],
      answers: [0, 1, 3, 4, 6],
      explain: 'The App Router uses `page`, `layout`, `loading`, `error`, `not-found`, `template` and `route` (with .js/.jsx/.ts/.tsx). `index.js` was the Pages Router convention and means nothing special in `app/`. It is `route.js` (singular), not `routes.js`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'A file is saved as `public/images/logo.png`. What URL path does the browser use to load it? (start with `/`)',
      accept: ['/images/logo.png'],
      explain: 'Everything inside `public/` is served from the site root, and the word `public` is **not** part of the URL. So `public/images/logo.png` is available at `/images/logo.png`. Writing `/public/images/logo.png` is the most common mistake.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You want to test the **production** version of your app locally. Which order of npm scripts is correct?',
      options: ['npm run dev, then npm run start', 'npm run build, then npm run start', 'npm run start, then npm run build', 'npm run lint, then npm run dev'],
      answer: 1,
      explain: '`npm run build` (next build) creates the optimised `.next` production build, and `npm run start` (next start) serves that build. `npm run dev` is the development server with hot reload and is never used in production.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Given these two files, what visible text does the page at `/` show? Write each text on its own line, top to bottom.',
      code: `// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>UpSkillr</header>
        {children}
        <footer>Made in India</footer>
      </body>
    </html>
  );
}

// app/page.js
export default function Home() {
  return <h1>Welcome</h1>;
}`,
      expected: 'UpSkillr\nWelcome\nMade in India',
      explain: 'The root layout wraps every page: Next.js passes the page as `children`, so the page content appears exactly where `{children}` is written, between the header and the footer.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `isSpecialFile(name)` that returns `true` when a file name is one of the App Router special files `page`, `layout`, `loading`, `error`, `not-found` or `route` with the extension `.js`, `.jsx`, `.ts` or `.tsx`. Everything else returns `false`.',
      example: { title: 'checking name + extension', code: "function isImage(name) {\n  const [base, ext] = name.split('.');\n  return ['png', 'jpg'].includes(ext);\n}" },
      starter: 'function isSpecialFile(name) {\n  // TODO\n}\n',
      solution: "function isSpecialFile(name) {\n  const dot = name.lastIndexOf('.');\n  if (dot === -1) return false;\n  const base = name.slice(0, dot);\n  const ext = name.slice(dot + 1);\n  return ['page', 'layout', 'loading', 'error', 'not-found', 'route'].includes(base) && ['js', 'jsx', 'ts', 'tsx'].includes(ext);\n}",
      tests: [
        { call: "isSpecialFile('page.js')", expect: true },
        { call: "isSpecialFile('layout.tsx')", expect: true },
        { call: "isSpecialFile('not-found.jsx')", expect: true },
        { call: "isSpecialFile('index.js')", expect: false, msg: 'index.js is not special in the App Router' },
        { call: "isSpecialFile('page.css')", expect: false, msg: 'Only js/jsx/ts/tsx extensions count' },
        { call: "isSpecialFile('Button.jsx')", expect: false },
      ],
      explain: 'Next.js only gives meaning to these exact base names with a JS/TS extension. Other files (components, CSS, utilities) can live in `app/` safely: they are never turned into routes. Split on the LAST dot so that `not-found.jsx` works.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 6,
      q: 'Practise the **root layout** pattern with plain React. Write a `RootLayout({ children })` component that renders a `<header>` with the text `UpSkillr`, then the `children` inside a `<main>`, then a `<footer>`. `App` must render a home page `<h1>Home</h1>` through the layout.',
      example: { title: 'a component that wraps children', code: "function Card({ children }) {\n  return <div className=\"card\">{children}</div>;\n}\n// <Card><p>Hi</p></Card>" },
      starter: 'function RootLayout({ children }) {\n  // TODO\n  return null;\n}\n\nfunction App() {\n  // TODO: render <h1>Home</h1> inside RootLayout\n  return <div />;\n}\n',
      solution: 'function RootLayout({ children }) {\n  return (\n    <div>\n      <header>UpSkillr</header>\n      <main>{children}</main>\n      <footer>© 2025 UpSkillr</footer>\n    </div>\n  );\n}\n\nfunction App() {\n  return (\n    <RootLayout>\n      <h1>Home</h1>\n    </RootLayout>\n  );\n}',
      checks: [
        { sel: 'header', text: 'UpSkillr', msg: 'Add a <header> containing "UpSkillr"' },
        { sel: 'main h1', textEq: 'Home', msg: 'The page <h1>Home</h1> must be rendered inside <main> (via children)' },
        { sel: 'footer', count: 1, msg: 'Add one <footer>' },
      ],
      explain: 'In Next.js `app/layout.js` receives the current page as `children`. Whatever the layout renders around `{children}` (header, nav, footer) appears on every page. In a real root layout you also render `<html>` and `<body>`.',
    },
  ],
};
