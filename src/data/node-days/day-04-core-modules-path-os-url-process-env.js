export default {
  id: 'day-04-core-modules-path-os-url-process-env',
  title: 'Core Modules: path, os, url, process and Environment Variables (.env)',
  module: 'Module 1: Node.js Fundamentals',
  day: 4,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Use the everyday core modules: path to build safe file paths, os to read system information, URL / URLSearchParams to parse links and query strings, the process object to talk to the running program, and environment variables loaded from a .env file to configure apps without hard-coding secrets.',
  objectives: [
    'Build cross-platform file paths with path.join, path.resolve, basename, extname, dirname and parse',
    'Read CPU, memory and platform information with the os module',
    'Parse and build URLs and query strings with URL and URLSearchParams',
    'Use process.argv, process.env, process.cwd(), process.exit / exitCode and process events',
    'Load configuration from a .env file with node --env-file (or dotenv) and keep secrets out of Git',
  ],
  theory: [
    {
      heading: 'The path module: never glue paths with +',
      content:
        'Windows uses backslashes (`C:\\\\app\\\\data`) while Linux and macOS use forward slashes (`/home/app/data`). If you build paths with string concatenation (`dir + "/" + file`) your code breaks on some systems. The **path** module builds correct paths for the current OS.\n\n- `path.join(a, b, c)` joins segments with the right separator and normalises `..` and `.`\n- `path.resolve(a, b)` returns an **absolute** path (processes right to left until it has an absolute path, otherwise prepends `process.cwd()`)\n- `path.basename(p)` file name, `path.basename(p, ".js")` without extension\n- `path.dirname(p)` folder part, `path.extname(p)` extension (with the dot)\n- `path.parse(p)` gives `{ root, dir, base, ext, name }`, `path.format(obj)` does the reverse\n- `path.normalize(p)`, `path.relative(from, to)`, `path.isAbsolute(p)`, `path.sep` (`/` or `\\\\`)\n\nAnalogy: path is a **GPS** for files. You say "start here, go into data, then users.json" and it writes the correct address for any country (OS).',
      syntax:
        "const path = require('node:path');\nconst dataFile = path.join(__dirname, 'data', 'users.json');\n// ESM: path.join(import.meta.dirname, 'data', 'users.json')",
      tip: 'Use `__dirname` (or `import.meta.dirname`) as the base for files that belong to your project. Relative paths like `"./data.json"` are resolved from the folder you RUN node from (process.cwd()), not from the file\'s folder, a very common bug.',
    },
    {
      heading: 'The os module',
      content:
        'The **os** module reads information about the computer the program runs on:\n\n- `os.platform()` (`linux`, `win32`, `darwin`), `os.type()`, `os.arch()` (`x64`, `arm64`), `os.release()`\n- `os.cpus()` array with one entry per logical CPU core (useful for the cluster module later)\n- `os.totalmem()` / `os.freemem()` in bytes\n- `os.uptime()` in seconds, `os.hostname()`, `os.homedir()`, `os.tmpdir()`, `os.userInfo()`\n- `os.EOL` line ending (`\\n` on Linux/macOS, `\\r\\n` on Windows)\n\nTypical uses: health-check endpoints, deciding how many worker processes to start, logging server info, writing files with the right line endings.',
    },
    {
      heading: 'URLs and query strings: URL and URLSearchParams',
      content:
        'The global **URL** class (WHATWG standard, same as in browsers) parses a URL string into parts:\n\n`https://shop.com:8080/products/42?sort=price&page=2#reviews`\n\n- `protocol` `https:`, `hostname` `shop.com`, `port` `8080`, `host` `shop.com:8080`\n- `pathname` `/products/42`, `search` `?sort=price&page=2`, `hash` `#reviews`\n- `searchParams` is a **URLSearchParams** object: `get`, `getAll`, `has`, `set`, `append`, `delete`, `toString()`, iterable\n\nAll query values are **strings**, so convert numbers yourself. URLSearchParams also encodes special characters (spaces, &, =) for you. The `node:url` module adds helpers like `fileURLToPath()` and `pathToFileURL()`. The old `url.parse()` and the `querystring` module are legacy; use `URL`.',
      syntax:
        "const u = new URL('/search?q=node js&page=2', 'https://example.com');\nu.searchParams.get('q');    // 'node js'\nNumber(u.searchParams.get('page')); // 2",
    },
    {
      heading: 'The process object',
      content:
        '**process** is a global object representing the running Node program:\n\n- `process.argv` command-line arguments, `process.env` environment variables\n- `process.cwd()` current working directory, `process.pid` process id, `process.platform`, `process.version`\n- `process.memoryUsage()`, `process.uptime()`, `process.hrtime.bigint()` for precise timing\n- `process.exit(code)` stops immediately; setting `process.exitCode = 1` lets pending work finish first (preferred)\n- `process.stdout.write()`, `process.stdin` streams\n- Events: `process.on(\'exit\')`, `process.on(\'SIGINT\')` (Ctrl + C) and `SIGTERM` (graceful shutdown in Docker / cloud), `uncaughtException`, `unhandledRejection`\n\nExit code `0` means success; anything else means failure (CI pipelines and Docker rely on this).',
    },
    {
      heading: 'Environment variables and .env files',
      content:
        '**Environment variables** are key=value settings given to a program by the operating system. They let the SAME code run with different configuration in development, testing and production, and they keep **secrets** (database passwords, API keys, JWT secrets) **out of the source code**. This is rule III of the "Twelve-Factor App".\n\nRead them with `process.env.NAME`. Values are **always strings** (or `undefined`), so convert: `Number(process.env.PORT) || 3000`, `process.env.DEBUG === \'true\'`.\n\nA **.env file** stores variables for local development:\n\n```\nPORT=4000\nDB_URL=mongodb://localhost:27017/shop\n```\n\nWays to load it:\n\n1. **Built in (Node 20.6+)**: `node --env-file=.env app.js` (add it to your npm scripts), or `process.loadEnvFile()` in code\n2. **dotenv package** (classic): `npm i dotenv`, then `require(\'dotenv\').config()` at the very top of your entry file\n\nRules: add `.env` to **.gitignore**, commit a `.env.example` with dummy values, and on servers (Render, Railway, Docker, AWS) set real variables in the platform settings. Variables already set in the shell win over values in the .env file.',
      tip: 'Validate configuration at startup: if a required variable like JWT_SECRET is missing, log a clear message and exit with code 1. Failing fast is much better than crashing on the first request.',
    },
  ],
  examples: [
    {
      title: 'Building safe file paths with the path module',
      scenario: 'A project stores uploads under /home/asha/shop. Build and inspect paths without string concatenation.',
      steps: [
        'Create `paths.js` and paste the code',
        'Run `node paths.js`',
        'Compare join (keeps it relative) with resolve (always absolute)',
      ],
      code: "// paths.js\nconst path = require('node:path');\n\nconst project = '/home/asha/shop';\nconst file = path.join(project, 'uploads', '..', 'public', 'img', 'logo.png');\n\nconsole.log('join      :', file);\nconsole.log('basename  :', path.basename(file));\nconsole.log('name only :', path.basename(file, path.extname(file)));\nconsole.log('extname   :', path.extname(file));\nconsole.log('dirname   :', path.dirname(file));\nconsole.log('parse     :', path.parse(file));\nconsole.log('resolve   :', path.resolve(project, 'src', './routes/users.js'));\nconsole.log('relative  :', path.relative(project + '/src/routes', project + '/public/img'));\nconsole.log('normalize :', path.normalize('/home//asha/./shop/../blog/'));\nconsole.log('isAbsolute:', path.isAbsolute('data/x.json'), path.isAbsolute('/data/x.json'));\nconsole.log('this file :', path.basename(__filename), '| sep:', path.sep);",
      result: "join      : /home/asha/shop/public/img/logo.png\nbasename  : logo.png\nname only : logo\nextname   : .png\ndirname   : /home/asha/shop/public/img\nparse     : {\n  root: '/',\n  dir: '/home/asha/shop/public/img',\n  base: 'logo.png',\n  ext: '.png',\n  name: 'logo'\n}\nresolve   : /home/asha/shop/src/routes/users.js\nrelative  : ../../public/img\nnormalize : /home/asha/blog/\nisAbsolute: false true\nthis file : paths.js | sep: /",
      explanation:
        '`path.join` removed the `uploads/..` part automatically. `path.parse` splits a path into root, dir, base, ext and name. `path.resolve` produced an absolute path because the first argument was absolute. `path.relative` computes how to walk from one folder to another (two levels up, then into public/img). On Windows the same code prints backslashes.',
    },
    {
      title: 'Reading system information with os',
      scenario: 'Build a small system-info report, like the one a /health endpoint might return.',
      steps: [
        'Create `sysinfo.js`',
        'Run `node sysinfo.js` (your numbers will differ: they describe YOUR machine)',
      ],
      code: "// sysinfo.js\nconst os = require('node:os');\n\nconst toGB = bytes => (bytes / 1024 ** 3).toFixed(1) + ' GB';\n\nconst info = {\n  platform: os.platform(),\n  type: os.type(),\n  arch: os.arch(),\n  cpuCores: os.cpus().length,\n  totalMemory: toGB(os.totalmem()),\n  freeMemoryPercent: Math.round((os.freemem() / os.totalmem()) * 100) + '%',\n  uptimeHours: Math.floor(os.uptime() / 3600),\n  eolIsLF: os.EOL === '\\n',\n};\n\nconsole.table(info);",
      result: "┌───────────────────┬───────────┐\n│ (index)           │ Values    │\n├───────────────────┼───────────┤\n│ platform          │ 'linux'   │\n│ type              │ 'Linux'   │\n│ arch              │ 'x64'     │\n│ cpuCores          │ 4         │\n│ totalMemory       │ '11.6 GB' │\n│ freeMemoryPercent │ '33%'     │\n│ uptimeHours       │ 1         │\n│ eolIsLF           │ true      │\n└───────────────────┴───────────┘",
      explanation:
        'Every os function reads live data from the operating system. Memory is reported in bytes, so the helper converts to GB. `console.table` prints objects as a neat table. On a Windows laptop you would see `win32`, `Windows_NT` and `eolIsLF: false`.',
    },
    {
      title: 'Parsing and building URLs with URL and URLSearchParams',
      scenario: 'Read filters from a product search URL and build a new "next page" link.',
      steps: [
        'Create `urls.js`',
        'Run `node urls.js`',
        'Notice that query values are strings and that spaces are encoded automatically',
      ],
      code: "// urls.js\nconst { fileURLToPath, pathToFileURL } = require('node:url');\n\nconst link = new URL('https://shop.com:8080/products/42?sort=price&page=2&tag=new&tag=sale#reviews');\n\nconsole.log('protocol :', link.protocol);\nconsole.log('hostname :', link.hostname, '| port:', link.port);\nconsole.log('pathname :', link.pathname, '| hash:', link.hash);\nconsole.log('page     :', link.searchParams.get('page'), typeof link.searchParams.get('page'));\nconsole.log('tags     :', link.searchParams.getAll('tag'));\nconsole.log('id       :', Number(link.pathname.split('/').pop()));\n\n// build the next page link\nlink.searchParams.set('page', Number(link.searchParams.get('page')) + 1);\nlink.searchParams.delete('tag');\nlink.searchParams.append('q', 'running shoes & socks');\nconsole.log('next     :', link.toString());\n\n// query string from an object\nconst qs = new URLSearchParams({ city: 'Pune', minPrice: 500 });\nconsole.log('qs       :', qs.toString(), '| entries:', Object.fromEntries(qs));\n\nconsole.log('file URL :', pathToFileURL('/srv/app/index.js').href);\nconsole.log('file path:', fileURLToPath('file:///srv/app/index.js'));",
      result: "protocol : https:\nhostname : shop.com | port: 8080\npathname : /products/42 | hash: #reviews\npage     : 2 string\ntags     : [ 'new', 'sale' ]\nid       : 42\nnext     : https://shop.com:8080/products/42?sort=price&page=3&q=running+shoes+%26+socks#reviews\nqs       : city=Pune&minPrice=500 | entries: { city: 'Pune', minPrice: '500' }\nfile URL : file:///srv/app/index.js\nfile path: /srv/app/index.js",
      explanation:
        '`URL` splits the address into parts. `searchParams.get` returns strings (or null), `getAll` returns every value of a repeated key. `set`, `delete` and `append` modify the query and `toString()` re-encodes it: spaces become `+` and `&` becomes `%26`. `fileURLToPath` converts the `file://` URLs used by ES modules into normal paths.',
    },
    {
      title: 'Working with the process object',
      scenario: 'Read arguments and environment, measure time precisely and set an exit code correctly.',
      steps: [
        'Create `proc.js`',
        'Run `node proc.js --verbose` with the APP_MODE variable set: `APP_MODE=demo node proc.js --verbose` (PowerShell: `$env:APP_MODE="demo"; node proc.js --verbose`)',
        'After it finishes, `echo $?` shows the exit code',
      ],
      code: "// proc.js\nconst start = process.hrtime.bigint();\n\nconsole.log('args       :', process.argv.slice(2));\nconsole.log('APP_MODE   :', process.env.APP_MODE);\nconsole.log('MISSING    :', process.env.SOME_MISSING_VAR);\nconsole.log('cwd folder :', require('node:path').basename(process.cwd()));\nconsole.log('pid type   :', typeof process.pid);\nconsole.log('platform   :', process.platform);\nconsole.log('heap < 100MB?', process.memoryUsage().heapUsed < 100 * 1024 * 1024);\n\nlet total = 0;\nfor (let i = 0; i < 1e6; i++) total += i;\nconst ms = Number(process.hrtime.bigint() - start) / 1e6;\nconsole.log('loop total :', total, '| took < 1s?', ms < 1000);\n\nprocess.on('exit', code => console.log('exiting with code', code));\n\nif (!process.argv.includes('--force')) {\n  console.log('No --force flag: marking the run as failed');\n  process.exitCode = 1; // lets pending work finish, then exits with 1\n}",
      result: "$ APP_MODE=demo node proc.js --verbose\nargs       : [ '--verbose' ]\nAPP_MODE   : demo\nMISSING    : undefined\ncwd folder : proc-demo\npid type   : number\nplatform   : linux\nheap < 100MB? true\nloop total : 499999500000 | took < 1s? true\nNo --force flag: marking the run as failed\nexiting with code 1",
      explanation:
        'Environment variables that are not set are `undefined`. `process.hrtime.bigint()` gives nanosecond precision for timing. Setting `process.exitCode` instead of calling `process.exit(1)` lets Node finish pending callbacks; the `exit` event then fires with the final code, and the shell sees 1 (failure).',
    },
    {
      title: 'Loading configuration from a .env file',
      scenario: 'Configure an app with a .env file using Node\'s built-in --env-file flag, with type conversion, defaults and validation.',
      steps: [
        'Create a `.env` file (and add `.env` to .gitignore)',
        'Create `config.js` that reads, converts and validates the variables',
        'Run `NODE_ENV=production node --env-file=.env config.js` (the shell variable overrides the file)',
        'Add it to package.json: `"start": "node --env-file=.env config.js"`',
      ],
      code: "# File: .env\n# local development settings - never commit this file\nPORT=4000\nNODE_ENV=development\nDB_URL=mongodb://localhost:27017/shop\nENABLE_CACHE=true\nJWT_SECRET=dev-only-secret\n\n// File: config.js\nconst required = ['DB_URL', 'JWT_SECRET'];\nconst missing = required.filter(name => !process.env[name]);\nif (missing.length) {\n  console.error('Missing env vars:', missing.join(', '));\n  process.exit(1);\n}\n\nconst config = {\n  port: Number(process.env.PORT) || 3000,          // strings -> number\n  env: process.env.NODE_ENV || 'development',\n  dbUrl: process.env.DB_URL,\n  cacheEnabled: process.env.ENABLE_CACHE === 'true', // string -> boolean\n  logLevel: process.env.LOG_LEVEL ?? 'info',         // default when not set\n};\n\nconsole.log(config);\nconsole.log('typeof PORT in env:', typeof process.env.PORT, '| typeof config.port:', typeof config.port);\nconsole.log('secret loaded?', Boolean(process.env.JWT_SECRET));",
      result: "$ NODE_ENV=production node --env-file=.env config.js\n{\n  port: 4000,\n  env: 'production',\n  dbUrl: 'mongodb://localhost:27017/shop',\n  cacheEnabled: true,\n  logLevel: 'info'\n}\ntypeof PORT in env: string | typeof config.port: number\nsecret loaded? true",
      explanation:
        '`--env-file=.env` copies each line into `process.env` before your code runs (lines starting with # are comments). NODE_ENV shows `production` because a variable already set in the shell takes precedence over the file. Every value in process.env is a string, so the config module converts PORT to a number and ENABLE_CACHE to a boolean, and fails fast if a required secret is missing. With the dotenv package the equivalent is `require(\'dotenv\').config()` as the first line.',
    },
  ],
  interview: [
    { q: 'Why use path.join instead of string concatenation?', a: 'path.join uses the correct separator for the OS (/ or \\), removes duplicate separators and resolves . and .. segments, so paths work on Windows, Linux and macOS.', level: 'Easy' },
    { q: 'Difference between path.join and path.resolve?', a: 'path.join simply concatenates and normalises segments, and the result can be relative. path.resolve processes segments right to left until it builds an absolute path, prepending process.cwd() if needed, so it always returns an absolute path.', level: 'Medium' },
    { q: 'Difference between __dirname and process.cwd()?', a: '__dirname is the folder of the current module file and never changes. process.cwd() is the folder from which the node process was started, which depends on where you ran the command. Use __dirname (or import.meta.dirname) for project files.', level: 'Medium' },
    { q: 'What are environment variables and why use them?', a: 'Key-value settings provided by the OS to a process. They separate configuration from code, allow the same build to run in dev/test/prod, and keep secrets like DB passwords and API keys out of source control.', level: 'Easy' },
    { q: 'How do you load a .env file in Node.js?', a: 'Node 20.6+: node --env-file=.env app.js or process.loadEnvFile(). Older or more featured: the dotenv package, require("dotenv").config() at the start of the entry file. The .env file must be in .gitignore.', level: 'Easy' },
    { q: 'What type are values in process.env?', a: 'Always strings (or undefined if not set). Convert explicitly: Number(process.env.PORT), process.env.FLAG === "true".', level: 'Easy' },
    { q: 'Difference between process.exit() and process.exitCode?', a: 'process.exit(code) terminates immediately, possibly dropping pending async work such as log writes. Setting process.exitCode lets the event loop finish naturally and then exits with that code; it is the safer choice.', level: 'Medium' },
    { q: 'How do you parse query strings in modern Node?', a: 'With the WHATWG URL class and its searchParams (URLSearchParams): new URL(req.url, "http://localhost").searchParams.get("page"). The legacy url.parse and querystring module should be avoided in new code.', level: 'Medium' },
    { q: 'How would you handle graceful shutdown?', a: 'Listen for SIGTERM / SIGINT with process.on, stop accepting new connections (server.close()), finish in-flight requests, close DB connections, then exit with code 0. Platforms like Docker and Kubernetes send SIGTERM before killing a container.', level: 'Hard' },
    { q: 'What is the os module used for in real apps?', a: 'Reading CPU count (to decide how many cluster workers to fork), memory usage for health checks and monitoring, platform detection, temp directory location and the correct line ending (os.EOL).', level: 'Easy' },
    { q: 'What is NODE_ENV?', a: 'A conventional environment variable (development, production, test). Libraries like Express use it: in production mode Express hides error stack traces and enables view caching. Always set NODE_ENV=production on servers.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Given "/var/www/blog/posts/hello-world.md", print the folder, the file name without extension, the extension, and a new path to the same file name but with .html in a sibling folder "public".',
      hint: 'dirname, basename(p, ext), extname, and path.join(dirname, "..", "public", name + ".html").',
      solution: "const path = require('node:path');\nconst p = '/var/www/blog/posts/hello-world.md';\nconst ext = path.extname(p);\nconst name = path.basename(p, ext);\nconsole.log(path.dirname(p)); // /var/www/blog/posts\nconsole.log(name, ext);       // hello-world .md\nconsole.log(path.join(path.dirname(p), '..', 'public', name + '.html'));\n// /var/www/blog/public/hello-world.html",
    },
    {
      task: 'Write `health.js` that prints a JSON object with platform, number of CPU cores, used memory percentage and process uptime in seconds.',
      hint: 'used = 1 - freemem/totalmem; process.uptime().',
      solution: "const os = require('node:os');\nconst health = {\n  status: 'ok',\n  platform: os.platform(),\n  cores: os.cpus().length,\n  memoryUsedPercent: Math.round((1 - os.freemem() / os.totalmem()) * 100),\n  uptimeSeconds: Math.round(process.uptime()),\n};\nconsole.log(JSON.stringify(health, null, 2));",
    },
    {
      task: 'Parse "https://api.site.com/v1/users?limit=10&page=3&role=admin" and print limit and page as numbers, then build the URL of the previous page.',
      hint: 'Number(url.searchParams.get("page")) - 1, then set and toString().',
      solution: "const url = new URL('https://api.site.com/v1/users?limit=10&page=3&role=admin');\nconst limit = Number(url.searchParams.get('limit'));\nconst page = Number(url.searchParams.get('page'));\nconsole.log(limit, page); // 10 3\nurl.searchParams.set('page', page - 1);\nconsole.log(url.href); // https://api.site.com/v1/users?limit=10&page=2&role=admin",
    },
    {
      task: 'Create a `.env` with APP_NAME and MAX_USERS, and a script that prints "<APP_NAME> allows <MAX_USERS + 5> users" using the built-in --env-file flag. Add a `start` npm script for it.',
      hint: 'Convert MAX_USERS with Number() before adding.',
      solution: "# .env\nAPP_NAME=StudyHub\nMAX_USERS=20\n\n// app.js\nconst max = Number(process.env.MAX_USERS);\nconsole.log(`${process.env.APP_NAME} allows ${max + 5} users`); // StudyHub allows 25 users\n\n// package.json\n\"scripts\": { \"start\": \"node --env-file=.env app.js\" }",
    },
    {
      task: 'Make a script that prints "Bye! Cleaning up..." when the user presses Ctrl + C, then exits with code 0. Keep the process alive with setInterval printing a dot every second.',
      hint: 'process.on("SIGINT", ...) and clearInterval + process.exit(0).',
      solution: "const timer = setInterval(() => process.stdout.write('.'), 1000);\nprocess.on('SIGINT', () => {\n  clearInterval(timer);\n  console.log('\\nBye! Cleaning up...');\n  process.exit(0);\n});\nconsole.log('Running... press Ctrl + C to stop');",
    },
  ],
  quiz: [
    { question: 'What does path.extname("report.final.pdf") return?', options: ['"pdf"', '".final.pdf"', '".pdf"', '"report"'], answer: 2, explanation: 'extname returns the last extension including the dot.' },
    { question: 'What is the type of process.env.PORT when PORT=5000 is set?', options: ['number', 'string', 'bigint', 'object'], answer: 1, explanation: 'Environment variables are always strings.' },
    { question: 'Which Node.js flag loads variables from a .env file without any package?', options: ['--env-file=.env', '--dotenv', '--config .env', '--load-env'], answer: 0, explanation: 'node --env-file=.env app.js is built in since Node 20.6.' },
    { question: 'new URL("https://a.com/p?x=1&x=2").searchParams.getAll("x") returns:', options: ['"1"', '"2"', '[1, 2]', '["1", "2"]'], answer: 3, explanation: 'getAll returns every value for the key, as strings.' },
    { question: 'Which should be committed to Git?', options: ['.env', '.env.example', 'node_modules', 'Both .env and .env.example'], answer: 1, explanation: 'Commit .env.example with dummy values; keep the real .env private.' },
  ],
};
