export default {
  lesson: 'day-03-file-based-routing-pages-layouts-nested-layouts',
  minutes: 30,
  intro: 'Map folders to URLs, read page params the Next.js 15 way and build nested layouts that wrap each other.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which file creates the page at the URL **/courses/react**?',
      options: ['app/courses/react.js', 'app/courses/react/page.js', 'app/courses-react/page.js', 'pages/app/courses/react/index.js'],
      answer: 1,
      explain: 'In the App Router **folders are URL segments** and only a `page.js` inside the folder makes the route public. So `/courses/react` needs `app/courses/react/page.js`. A plain `react.js` file is not a route.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **layouts** are TRUE? (choose all that apply)',
      options: [
        'A layout receives the page (or nested layout) as the `children` prop',
        'The root layout `app/layout.js` must render `<html>` and `<body>`',
        'Layouts re-mount and lose their state on every navigation',
        'A layout in `app/dashboard/layout.js` wraps every page under `/dashboard`',
        'A `template.js` re-mounts on navigation, unlike a layout',
      ],
      answers: [0, 1, 3, 4],
      explain: 'Layouts **preserve state** and do not re-render when you move between sibling pages; that is their main benefit (e.g. a sidebar keeps its scroll position). If you want a fresh instance on every navigation, use `template.js`. The root layout is the only place with `<html>` and `<body>`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In Next.js 15 the `params` prop of a page is a **Promise**. Complete the missing keyword:\n\n```\nexport default async function Page({ params }) {\n  const { slug } = ____ params;\n  return <h1>{slug}</h1>;\n}\n```',
      accept: ['await'],
      explain: 'Since Next.js 15, `params` and `searchParams` are Promises, so you must `await params` inside an `async` page (or use `React.use(params)` in a Client Component). Reading `params.slug` directly gives `undefined` and a warning.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'This code imitates how Next.js nests layouts for the URL `/dashboard/settings` (root layout → dashboard layout → page). What is printed?',
      code: `const RootLayout = (children) => '[Root ' + children + ']';
const DashboardLayout = (children) => '[Dashboard ' + children + ']';
const SettingsPage = () => 'Settings';

console.log(RootLayout(DashboardLayout(SettingsPage())));`,
      expected: '[Root [Dashboard Settings]]',
      explain: 'Layouts nest from the outside in: `app/layout.js` wraps `app/dashboard/layout.js`, which wraps `app/dashboard/settings/page.js`. The page is always the innermost piece.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: 'Write `urlFor(file)` that converts an App Router file path to its URL, or returns `null` if the file is not a page.\n- Only paths ending in `/page.js` are pages, otherwise return `null`\n- Any folder starting with `_` (private folder) makes it `null`\n- `app/page.js` → `/`\n- `app/courses/react/page.js` → `/courses/react`',
      example: { title: 'splitting a path into segments', code: "'app/a/b/file.js'.split('/')   // ['app', 'a', 'b', 'file.js']\n['a', 'b'].join('/')          // 'a/b'" },
      starter: 'function urlFor(file) {\n  // TODO\n}\n',
      solution: "function urlFor(file) {\n  const parts = file.split('/');\n  if (parts[0] !== 'app' || parts[parts.length - 1] !== 'page.js') return null;\n  const segs = parts.slice(1, -1);\n  if (segs.some((s) => s.startsWith('_'))) return null;\n  return '/' + segs.join('/');\n}",
      tests: [
        { call: "urlFor('app/page.js')", expect: '/' },
        { call: "urlFor('app/about/page.js')", expect: '/about' },
        { call: "urlFor('app/courses/react/page.js')", expect: '/courses/react' },
        { call: "urlFor('app/courses/layout.js')", expect: null, msg: 'A layout is not a page' },
        { call: "urlFor('app/_components/page.js')", expect: null, msg: 'Private folders (_name) are never routable' },
      ],
      explain: 'Each folder between `app/` and `page.js` becomes one URL segment. Layouts, components and anything inside a `_private` folder are colocated safely because they never become routes.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 8,
      q: 'Rebuild **nested layouts** in plain React for `/dashboard/settings`:\n- `RootLayout` renders a `<nav>` and then `children`\n- `DashboardLayout` renders `<div className="dashboard">` containing an `<aside>` (sidebar) and a `<section>` with `children`\n- `SettingsPage` renders `<h1>Settings</h1>`\n- `App` combines them in the right order',
      example: { title: 'nesting wrappers', code: "<Outer>\n  <Inner>\n    <Content />\n  </Inner>\n</Outer>" },
      starter: 'function RootLayout({ children }) { return null; }\nfunction DashboardLayout({ children }) { return null; }\nfunction SettingsPage() { return null; }\n\nfunction App() {\n  // TODO\n  return <div />;\n}\n',
      solution: 'function RootLayout({ children }) {\n  return (\n    <div>\n      <nav>UpSkillr</nav>\n      {children}\n    </div>\n  );\n}\nfunction DashboardLayout({ children }) {\n  return (\n    <div className="dashboard">\n      <aside>Profile | Settings</aside>\n      <section>{children}</section>\n    </div>\n  );\n}\nfunction SettingsPage() {\n  return <h1>Settings</h1>;\n}\n\nfunction App() {\n  return (\n    <RootLayout>\n      <DashboardLayout>\n        <SettingsPage />\n      </DashboardLayout>\n    </RootLayout>\n  );\n}',
      checks: [
        { sel: 'nav', count: 1, msg: 'RootLayout must render one <nav>' },
        { sel: '.dashboard aside', count: 1, msg: 'DashboardLayout needs an <aside> inside .dashboard' },
        { sel: '.dashboard section h1', textEq: 'Settings', msg: 'The <h1>Settings</h1> page must be inside the dashboard <section>' },
      ],
      explain: 'This is what Next.js does automatically from the folder tree: `app/layout.js` → `app/dashboard/layout.js` → `app/dashboard/settings/page.js`. Each layout only knows about its own UI and renders `children` for whatever is deeper.',
    },
  ],
};
