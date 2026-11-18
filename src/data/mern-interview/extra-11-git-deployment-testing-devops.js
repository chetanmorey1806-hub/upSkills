export default {
  id: 'extra-11-git-deployment-testing-devops',
  title: 'Git, Deployment, Testing & DevOps Interview Questions for MERN Developers',
  module: 'Interview: Full Stack',
  extraNo: 11,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Every MERN interview has a few "practical engineering" questions: Git commands and workflows, how you deployed your project, environment variables, testing with Jest/Vitest/Supertest, Docker, CI/CD and monitoring. This topic gives revision notes, runnable demos and interview-ready answers.',
  objectives: [
    'Answer Git questions: merge vs rebase, reset vs revert, stash, cherry-pick, conflicts, branching strategies',
    'Explain how to deploy a MERN app (Vercel/Netlify + Render/Railway/EC2 + MongoDB Atlas) with env variables and HTTPS',
    'Explain unit, integration and end-to-end testing and write tests with Jest/Vitest, Supertest and React Testing Library',
    'Write a Dockerfile, docker-compose file and a GitHub Actions pipeline for a MERN app',
    'Discuss logging, monitoring, PM2 and zero-downtime deployments',
  ],
  theory: [
    {
      heading: 'Git essentials interviewers ask about',
      content: `Git is a **distributed version control system**: every developer has the full history locally. GitHub/GitLab/Bitbucket are hosting services on top of Git.

**Three areas:** working directory -> \`git add\` -> staging area (index) -> \`git commit\` -> local repository -> \`git push\` -> remote.

**Must-know commands:**
- \`git clone\`, \`git status\`, \`git add\`, \`git commit -m\`, \`git push\`, \`git pull\` (= fetch + merge), \`git fetch\` (download only, no merge)
- \`git branch\`, \`git switch -c feature/login\` (newer than \`checkout -b\`), \`git merge\`, \`git rebase\`
- \`git stash\` / \`git stash pop\`: park unfinished work
- \`git log --oneline --graph\`, \`git diff\`, \`git blame\`
- \`git reset\` (move branch pointer: \`--soft\` keeps staged, \`--mixed\` default keeps files unstaged, \`--hard\` discards changes)
- \`git revert <sha>\`: new commit that undoes a commit; **safe for shared branches**
- \`git cherry-pick <sha>\`: copy one commit to the current branch (e.g. a hotfix)
- \`git reflog\`: history of where HEAD has been; rescues "lost" commits after a bad reset

**Merge vs rebase:** merge keeps history as it happened and adds a merge commit; rebase replays your commits on top of the target branch for a linear history, but rewrites commit hashes. **Golden rule: never rebase commits that others have already pulled.**`,
      syntax: `git switch -c feature/cart        # new branch
git add . && git commit -m "feat(cart): add quantity update"
git fetch origin
git rebase origin/main            # or: git merge origin/main
git push -u origin feature/cart   # then open a Pull Request
# after review: squash-merge on GitHub, delete branch`,
      tip: 'Use Conventional Commits (feat:, fix:, docs:, refactor:, test:, chore:). It shows professionalism and enables automatic changelogs.',
    },
    {
      heading: 'Branching strategies, PRs and merge conflicts',
      content: `**Feature branch workflow / GitHub Flow**: \`main\` is always deployable; every change is a short-lived branch -> Pull Request -> code review + CI checks -> merge -> auto deploy. Most startups use this.

**Git Flow**: \`main\` (releases), \`develop\` (integration), \`feature/*\`, \`release/*\`, \`hotfix/*\`. Heavier; used by teams with scheduled releases (common in service companies).

**Trunk-based development**: everyone merges small changes into main at least daily, hiding unfinished work behind **feature flags**.

**Merge conflict**: happens when two branches change the same lines (or one deletes a file the other edits). Git marks the file:
\`<<<<<<< HEAD\` (your version) \`=======\` \`>>>>>>> feature\` (incoming). Resolve by editing to the correct final code, remove the markers, run tests, \`git add\`, then \`git commit\` (or \`git rebase --continue\`).

**.gitignore** for MERN: \`node_modules/\`, \`.env\`, \`dist/\`, \`build/\`, \`coverage/\`, \`*.log\`. If you accidentally committed \`.env\`: remove it with \`git rm --cached .env\`, **rotate the leaked secrets** (they are still in history), and if needed clean history with \`git filter-repo\`.`,
      tip: 'How to answer "how do you handle conflicts?": "I pull/rebase main often to keep conflicts small, talk to the other developer if the intent is unclear, resolve in VS Code, then run the tests before pushing."',
    },
    {
      heading: 'Deploying a MERN application',
      content: `A typical, interview-friendly setup:
- **Frontend (React + Vite)**: \`npm run build\` creates static files in \`dist/\`. Host on **Vercel / Netlify / Cloudflare Pages** or S3 + CloudFront. Configure SPA fallback (all routes -> index.html) so React Router deep links do not 404.
- **Backend (Node + Express)**: **Render / Railway / Fly.io** (PaaS), or an **AWS EC2 / DigitalOcean** VM with **PM2** + **Nginx** reverse proxy + **Let's Encrypt** HTTPS, or Docker containers on ECS/Kubernetes.
- **Database**: **MongoDB Atlas** (managed replica set, backups). Whitelist server IPs, use a DB user with least privileges.

**Environment variables**: secrets (\`MONGO_URI\`, \`JWT_SECRET\`, API keys) live in the hosting platform's env settings, never in Git. Locally use \`.env\` (Node 22 can load it natively: \`node --env-file=.env server.js\`, or the \`dotenv\` package). In Vite, only variables prefixed \`VITE_\` reach the browser, and **anything in the frontend bundle is public**.

**Production checklist**: \`NODE_ENV=production\`, CORS whitelist with the frontend domain, \`app.set('trust proxy', 1)\` behind a proxy, Helmet, compression, rate limiting, central error handler without stack traces, health-check endpoint, graceful shutdown on SIGTERM, logs and monitoring.`,
      syntax: `# EC2 + PM2 + Nginx (short version)
npm ci --omit=dev
pm2 start server.js -i max --name api   # cluster mode, 1 process per CPU core
pm2 save && pm2 startup                  # restart on reboot
# nginx: location /api/ { proxy_pass http://localhost:5000; }
sudo certbot --nginx -d api.myshop.in    # free HTTPS`,
      tip: 'In interviews, describe YOUR real deployment: "Frontend on Vercel, API on Render, DB on Atlas, env vars in Render dashboard, auto-deploy on push to main." Concrete beats generic.',
    },
    {
      heading: 'Testing: unit, integration, end-to-end',
      content: `**Testing pyramid**: many fast **unit tests** (a single function/component), fewer **integration tests** (API route + DB, or component + context), very few slow **end-to-end (E2E)** tests (real browser clicking through the app).

**Tools in the MERN world:**
- **Jest** or **Vitest** (Vite-native, Jest-compatible API): test runner + assertions + mocks
- **Supertest**: send HTTP requests to your Express \`app\` without starting a real server
- **mongodb-memory-server**: an in-memory MongoDB for integration tests
- **React Testing Library (RTL)**: test components the way users use them (\`getByRole\`, \`userEvent.click\`), not implementation details
- **Playwright** or **Cypress**: E2E in a real browser
- **MSW (Mock Service Worker)**: mock API responses in frontend tests

**Key ideas:** AAA pattern (Arrange, Act, Assert); **mocks/stubs/spies** to replace slow or external dependencies (email, payment); **code coverage** (\`--coverage\`) shows which lines ran, but 100% coverage does not mean bug-free; **TDD** = write a failing test first, make it pass, refactor (red-green-refactor).

To make Express testable, **export \`app\` from app.js** and call \`app.listen\` only in server.js.`,
      syntax: `// tests/auth.test.js  (Jest/Vitest + Supertest)
import request from 'supertest';
import app from '../src/app.js';

describe('POST /api/auth/login', () => {
  it('returns 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });
});`,
    },
    {
      heading: 'Docker and CI/CD',
      content: `**Docker** packages your app with its runtime and dependencies into an **image**; a running image is a **container**. "Works on my machine" problems disappear because every environment runs the same image.
- **Image vs container**: class vs object. **Dockerfile**: recipe to build an image. **Docker Hub / ECR**: image registry.
- **Container vs VM**: containers share the host OS kernel, so they start in seconds and are lightweight; VMs include a full guest OS.
- **docker compose**: run multi-container apps (api + mongo + redis) with one \`docker compose up\`.
- **Volumes** keep data (MongoDB files) after a container is removed.
- Best practices: small base image (\`node:22-alpine\`), copy \`package*.json\` first and \`npm ci\` for layer caching, \`.dockerignore\` (node_modules, .env), run as non-root user, multi-stage builds for React.

**CI/CD**: **Continuous Integration** = on every push/PR, automatically install, lint, test and build. **Continuous Delivery/Deployment** = automatically deploy what passed (to staging, then production). Tools: **GitHub Actions**, GitLab CI, Jenkins, CircleCI.`,
      syntax: `# Dockerfile for the Express API
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
USER node
EXPOSE 5000
CMD ["node", "server.js"]

# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run build`,
      tip: 'Say the difference clearly: CI is about merging code safely (tests on every change); CD is about shipping it automatically.',
    },
    {
      heading: 'npm, monitoring and production operations',
      content: `**npm questions:**
- \`dependencies\` (needed at runtime: express, mongoose) vs \`devDependencies\` (only for development: jest, eslint, nodemon, vite)
- **Semantic versioning** MAJOR.MINOR.PATCH: \`^1.4.2\` allows 1.x.x >= 1.4.2; \`~1.4.2\` allows 1.4.x >= 1.4.2
- **package-lock.json** pins exact versions of the whole dependency tree: commit it. \`npm ci\` installs exactly from the lock file (clean, faster, fails if out of sync) -> use in CI and Docker.
- \`npm audit\` / Dependabot for vulnerable packages; \`npx\` runs a package binary without installing globally.

**Monitoring & operations:**
- **Logs**: structured JSON logs (pino, winston), request logging (morgan / pino-http), ship to a log service (CloudWatch, Datadog, Grafana Loki). Never log passwords or tokens.
- **Metrics & alerts**: response time (p95), error rate, CPU/memory, event-loop lag; uptime checks on \`/health\`.
- **Error tracking**: Sentry for frontend and backend exceptions with stack traces and source maps.
- **PM2**: process manager -> auto restart on crash, cluster mode, \`pm2 reload\` for zero-downtime restarts, log management.
- **Zero-downtime deploys**: rolling updates behind a load balancer, blue-green (switch traffic between two identical environments) or canary (send 5% traffic to the new version first). Always keep a quick **rollback** path.`,
      points: [
        'Commit package-lock.json, never commit node_modules or .env',
        'Use npm ci in CI/CD and Docker',
        'Graceful shutdown: on SIGTERM stop accepting requests, finish in-flight ones, close the DB connection, then exit',
      ],
    },
  ],
  examples: [
    {
      title: 'How a test runner works: a 20-line mini Jest',
      scenario: 'Interviewers ask "What does describe/it/expect do?" or "write a unit test for this function". Building a tiny runner shows you understand assertions, passing and failing tests.',
      steps: [
        'Define describe (groups tests), it (runs one test in try/catch) and expect (throws on mismatch)',
        'Write the code under test: finalPrice(price, discountPercent)',
        'Write four tests, one of them with a wrong expectation on purpose',
        'Click Run and read the report',
      ],
      code: `// A 20-line "Jest" to understand describe / it / expect
const results = { passed: 0, failed: 0 };
function describe(name, fn) { console.log(name); fn(); }
function it(name, fn) {
  try { fn(); results.passed++; console.log('  ✓ ' + name); }
  catch (err) { results.failed++; console.log('  ✗ ' + name + ' -> ' + err.message); }
}
function expect(actual) {
  return {
    toBe(expected) { if (actual !== expected) throw new Error('expected ' + expected + ', got ' + actual); },
    toThrow() { try { actual(); } catch { return; } throw new Error('expected function to throw'); },
  };
}
// Code under test (would live in utils/price.js)
function finalPrice(price, discountPercent) {
  if (price < 0) throw new Error('price cannot be negative');
  return Math.round(price - (price * discountPercent) / 100);
}
describe('finalPrice()', () => {
  it('applies 10% discount', () => expect(finalPrice(1000, 10)).toBe(900));
  it('returns same price for 0% discount', () => expect(finalPrice(499, 0)).toBe(499));
  it('rejects negative price', () => expect(() => finalPrice(-1, 10)).toThrow());
  it('rounds to nearest rupee', () => expect(finalPrice(999, 15)).toBe(850));
});
console.log(results.passed + ' passed, ' + results.failed + ' failed');`,
      playground: {
        html: '<h3>Mini test runner - open the console</h3>',
        js: `const results = { passed: 0, failed: 0 };
function describe(name, fn) { console.log(name); fn(); }
function it(name, fn) {
  try { fn(); results.passed++; console.log('  ✓ ' + name); }
  catch (err) { results.failed++; console.log('  ✗ ' + name + ' -> ' + err.message); }
}
function expect(actual) {
  return {
    toBe(expected) { if (actual !== expected) throw new Error('expected ' + expected + ', got ' + actual); },
    toThrow() { try { actual(); } catch { return; } throw new Error('expected function to throw'); },
  };
}
function finalPrice(price, discountPercent) {
  if (price < 0) throw new Error('price cannot be negative');
  return Math.round(price - (price * discountPercent) / 100);
}
describe('finalPrice()', () => {
  it('applies 10% discount', () => expect(finalPrice(1000, 10)).toBe(900));
  it('returns same price for 0% discount', () => expect(finalPrice(499, 0)).toBe(499));
  it('rejects negative price', () => expect(() => finalPrice(-1, 10)).toThrow());
  it('rounds to nearest rupee', () => expect(finalPrice(999, 15)).toBe(850));
});
console.log(results.passed + ' passed, ' + results.failed + ' failed');`,
      },
      result: `finalPrice()
  ✓ applies 10% discount
  ✓ returns same price for 0% discount
  ✓ rejects negative price
  ✗ rounds to nearest rupee -> expected 850, got 849
3 passed, 1 failed`,
      explanation: `999 - 149.85 = 849.15, which rounds to 849, so the last test's expectation was wrong. This is the point: a failing test tells you that either the code or your assumption is wrong, and you must decide which. Real Jest/Vitest work the same way: \`it\`/\`test\` registers a test, \`expect(x).toBe(y)\` throws an assertion error on mismatch, and the runner catches it and reports. Note \`toThrow\` needs a function (\`() => finalPrice(-1)\`), not a call, otherwise the error is thrown before expect runs: a classic interview trap.`,
    },
    {
      title: 'Mocking dependencies: testing signup without a database or email server',
      scenario: '"How do you unit test code that calls MongoDB or sends emails?" Use dependency injection + mock functions that record their calls (like jest.fn()).',
      steps: [
        'Write signup so it receives userRepo and mailer as parameters (dependency injection)',
        'Create mockFn: a function that records calls and returns a fake value',
        'Call signup with a new and an existing email',
        'Assert on the results AND on how the mocks were called. Click Run',
      ],
      code: `// Mocking: test signup logic without a real database or email server
function createSignup({ userRepo, mailer }) {
  return async function signup(email) {
    if (await userRepo.findByEmail(email)) return { status: 409, msg: 'Email already registered' };
    const user = await userRepo.create({ email });
    await mailer.sendWelcome(email);
    return { status: 201, id: user.id };
  };
}
function mockFn(impl) {
  const fn = async (...args) => { fn.calls.push(args); return impl(...args); };
  fn.calls = [];
  return fn;
}
(async () => {
  const userRepo = {
    findByEmail: mockFn((e) => (e === 'old@x.com' ? { id: 1 } : null)),
    create: mockFn(() => ({ id: 42 })),
  };
  const mailer = { sendWelcome: mockFn(() => true) };
  const signup = createSignup({ userRepo, mailer });
  console.log(await signup('new@x.com'));
  console.log(await signup('old@x.com'));
  console.log('create called', userRepo.create.calls.length, 'time(s)');
  console.log('welcome mail sent to', mailer.sendWelcome.calls.map((c) => c[0]));
})();`,
      playground: {
        html: '<h3>Mocks and spies - open the console</h3>',
        js: `function createSignup({ userRepo, mailer }) {
  return async function signup(email) {
    if (await userRepo.findByEmail(email)) return { status: 409, msg: 'Email already registered' };
    const user = await userRepo.create({ email });
    await mailer.sendWelcome(email);
    return { status: 201, id: user.id };
  };
}
function mockFn(impl) {
  const fn = async (...args) => { fn.calls.push(args); return impl(...args); };
  fn.calls = [];
  return fn;
}
(async () => {
  const userRepo = {
    findByEmail: mockFn((e) => (e === 'old@x.com' ? { id: 1 } : null)),
    create: mockFn(() => ({ id: 42 })),
  };
  const mailer = { sendWelcome: mockFn(() => true) };
  const signup = createSignup({ userRepo, mailer });
  console.log(await signup('new@x.com'));
  console.log(await signup('old@x.com'));
  console.log('create called', userRepo.create.calls.length, 'time(s)');
  console.log('welcome mail sent to', mailer.sendWelcome.calls.map((c) => c[0]));
})();`,
      },
      result: `{ status: 201, id: 42 }
{ status: 409, msg: 'Email already registered' }
create called 1 time(s)
welcome mail sent to [ 'new@x.com' ]`,
      explanation: `The test runs in milliseconds and never touches MongoDB or an SMTP server. We check behaviour (409 for duplicates) and interactions (create called once, email sent only to the new user). In Jest/Vitest you would write \`const create = vi.fn().mockResolvedValue({ id: 42 })\` and \`expect(mailer.sendWelcome).toHaveBeenCalledWith('new@x.com')\`, or mock a whole module with \`vi.mock('../services/mailer.js')\`. Mocks for unit tests; a real (in-memory) MongoDB for integration tests.`,
    },
    {
      title: 'Semantic versioning: what ^ and ~ allow in package.json',
      scenario: '"What is the difference between ^1.4.2 and ~1.4.2?" is a very common npm question. Let us implement a simplified checker.',
      steps: [
        'Split versions into MAJOR.MINOR.PATCH numbers',
        'Both ranges require version >= 1.4.2',
        '^ keeps the same MAJOR, ~ keeps the same MAJOR.MINOR',
        'Click Run to see a table',
      ],
      code: `// How npm reads "^1.4.2" and "~1.4.2" in package.json
function parse(v) { return v.split('.').map(Number); }
function satisfies(version, range) {
  const op = range[0];
  const [M, m, p] = parse(range.slice(1));
  const [vM, vm, vp] = parse(version);
  const gte = vM > M || (vM === M && (vm > m || (vm === m && vp >= p)));
  if (!gte) return false;
  if (op === '^') return vM === M;          // same major (when major >= 1)
  if (op === '~') return vM === M && vm === m; // same major.minor
  return false;
}
for (const v of ['1.4.2', '1.4.9', '1.9.0', '2.0.0', '1.3.9']) {
  console.log(v.padEnd(6), '^1.4.2:', String(satisfies(v, '^1.4.2')).padEnd(5), ' ~1.4.2:', satisfies(v, '~1.4.2'));
}`,
      playground: {
        html: '<h3>Semver ranges - open the console</h3>',
        js: `function parse(v) { return v.split('.').map(Number); }
function satisfies(version, range) {
  const op = range[0];
  const [M, m, p] = parse(range.slice(1));
  const [vM, vm, vp] = parse(version);
  const gte = vM > M || (vM === M && (vm > m || (vm === m && vp >= p)));
  if (!gte) return false;
  if (op === '^') return vM === M;
  if (op === '~') return vM === M && vm === m;
  return false;
}
for (const v of ['1.4.2', '1.4.9', '1.9.0', '2.0.0', '1.3.9']) {
  console.log(v.padEnd(6), '^1.4.2:', String(satisfies(v, '^1.4.2')).padEnd(5), ' ~1.4.2:', satisfies(v, '~1.4.2'));
}`,
      },
      result: `1.4.2  ^1.4.2: true   ~1.4.2: true
1.4.9  ^1.4.2: true   ~1.4.2: true
1.9.0  ^1.4.2: true   ~1.4.2: false
2.0.0  ^1.4.2: false  ~1.4.2: false
1.3.9  ^1.4.2: false  ~1.4.2: false`,
      explanation: `MAJOR = breaking changes, MINOR = new backward-compatible features, PATCH = bug fixes. Caret (^, npm's default) accepts new minor and patch versions; tilde (~) accepts only patches. Special case: for 0.x versions, ^0.4.2 only allows 0.4.x because 0.x is considered unstable. Since ranges can resolve to different versions on different days, package-lock.json + npm ci keep installs reproducible.`,
    },
    {
      title: 'Fail-fast environment configuration before app.listen()',
      scenario: '"How do you manage configuration and secrets across dev, staging and production?" Validate env vars at startup so a missing secret crashes immediately with a clear message, not hours later.',
      steps: [
        'List the required variables',
        'Throw a clear error if any are missing',
        'Convert types (PORT to number) and set defaults',
        'Never print secrets: mask them in logs. Click Run',
      ],
      code: `// Fail-fast config check, like the first lines of server.js before app.listen()
function loadConfig(env) {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter((k) => !env[k]);
  if (missing.length) throw new Error('Missing env vars: ' + missing.join(', '));
  return {
    port: Number(env.PORT) || 5000,
    mongoUri: env.MONGO_URI,
    jwtSecret: env.JWT_SECRET,
    isProd: env.NODE_ENV === 'production',
  };
}
try {
  loadConfig({ PORT: '8080', MONGO_URI: 'mongodb://localhost/shop' });
} catch (e) { console.log('Startup failed:', e.message); }
const cfg = loadConfig({ MONGO_URI: 'mongodb+srv://cluster0/shop', JWT_SECRET: 's3cr3t', NODE_ENV: 'production' });
console.log({ ...cfg, jwtSecret: '***' });`,
      playground: {
        html: '<h3>Config validation - open the console</h3>',
        js: `function loadConfig(env) {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter((k) => !env[k]);
  if (missing.length) throw new Error('Missing env vars: ' + missing.join(', '));
  return {
    port: Number(env.PORT) || 5000,
    mongoUri: env.MONGO_URI,
    jwtSecret: env.JWT_SECRET,
    isProd: env.NODE_ENV === 'production',
  };
}
try {
  loadConfig({ PORT: '8080', MONGO_URI: 'mongodb://localhost/shop' });
} catch (e) { console.log('Startup failed:', e.message); }
const cfg = loadConfig({ MONGO_URI: 'mongodb+srv://cluster0/shop', JWT_SECRET: 's3cr3t', NODE_ENV: 'production' });
console.log({ ...cfg, jwtSecret: '***' });`,
      },
      result: `Startup failed: Missing env vars: JWT_SECRET
{
  port: 5000,
  mongoUri: 'mongodb+srv://cluster0/shop',
  jwtSecret: '***',
  isProd: true
}`,
      explanation: `In the real server you call \`loadConfig(process.env)\`. Environment variables are always strings, so "8080" must become a number. Each environment (dev/staging/prod) gets its own values from the platform dashboard, CI secrets or a secrets manager (AWS Secrets Manager, Vault); the code stays the same (12-Factor App: config in the environment). Libraries like zod or envalid do the same validation with less code. Keep a \`.env.example\` with keys but no real values in Git.`,
    },
  ],
  interview: [
    { q: 'What is Git and how is it different from GitHub?', level: 'Easy', a: `Git is a distributed version control system that tracks changes to files, lets you create branches, merge work and go back to any previous version. Every clone has the full history, so you can commit offline.\nGitHub is a cloud hosting service for Git repositories that adds collaboration features: pull requests, code review, issues, GitHub Actions CI/CD, project boards. Alternatives: GitLab, Bitbucket, Azure Repos.` },
    { q: 'Explain the working directory, staging area and repository.', level: 'Easy', a: `Working directory: the files you are editing.\nStaging area (index): a snapshot of changes selected for the next commit, using git add.\nRepository (.git): the committed history, created with git commit.\nThe staging area lets you commit only part of your changes, e.g. git add src/cart.js to commit the cart fix separately from unfinished login work. git status shows which files are in which area.` },
    { q: 'What is the difference between git fetch and git pull?', level: 'Easy', a: `git fetch downloads new commits and branches from the remote into origin/* tracking branches but does not change your local branch or files. Safe for checking what changed (git log main..origin/main).\ngit pull = git fetch + git merge (or rebase with git pull --rebase) into the current branch. Use fetch when you want to review first; pull when you just want to update.` },
    { q: 'Merge vs rebase: what is the difference and when do you use each?', level: 'Medium', a: `Both integrate changes from one branch into another.\nMerge creates a merge commit joining both histories. Non-destructive, preserves true history, but adds merge commits.\nRebase moves your branch's commits to start from the tip of the target branch, rewriting them with new hashes. Gives a clean linear history.\nUse rebase to update your own local feature branch with main before opening a PR (git rebase origin/main); use merge (or squash-merge) to bring a reviewed PR into main. Never rebase commits that are already pushed and used by others, because it rewrites shared history.` },
    { q: 'git reset vs git revert: what is the difference?', level: 'Medium', a: `git reset moves the branch pointer back to an older commit, effectively removing commits from the branch history:\n- --soft: keep changes staged\n- --mixed (default): keep changes in the working directory, unstaged\n- --hard: throw the changes away\nUse it only for local, unpushed commits.\ngit revert <sha> creates a new commit that undoes the changes of a given commit. History is preserved, so it is safe on shared branches like main. Example: a bad commit deployed to production -> git revert abc123 and push.` },
    { q: 'What is git stash and when do you use it?', level: 'Easy', a: `git stash temporarily saves uncommitted changes and gives you a clean working directory. Use case: you are halfway through a feature and need to fix an urgent bug on another branch.\n\ngit stash push -m "wip cart"\ngit switch main   # fix bug, commit\ngit switch feature/cart\ngit stash pop     # re-apply and drop the stash\n\ngit stash list shows saved stashes; git stash apply re-applies without deleting; git stash -u also stashes untracked files.` },
    { q: 'What is git cherry-pick?', level: 'Medium', a: `git cherry-pick <commit-sha> applies the changes of a specific commit from another branch onto the current branch as a new commit.\nUse case: a bug fix was committed on the develop branch but production (main/release) needs it now without the rest of develop: git switch main && git cherry-pick 9f2c1ab.\nOveruse leads to duplicate commits and confusing history, so prefer merging when possible.` },
    { q: 'How do you resolve a merge conflict?', level: 'Medium', a: `A conflict happens when two branches change the same lines of a file differently. Steps:\n1. git status shows conflicted files.\n2. Open the file; Git marks <<<<<<< HEAD (your changes), ======= and >>>>>>> other-branch (incoming).\n3. Edit to the correct combined code and remove the markers (VS Code has Accept Current/Incoming/Both buttons).\n4. Run the app/tests.\n5. git add <file>, then git commit (merge) or git rebase --continue.\nTo abort: git merge --abort or git rebase --abort. To reduce conflicts: small PRs, sync with main often, and communicate with teammates.` },
    { q: 'How do you undo the last commit?', level: 'Easy', a: `Depends on whether it is pushed:\n- Not pushed, keep changes: git reset --soft HEAD~1 (changes stay staged) or git reset HEAD~1.\n- Not pushed, discard: git reset --hard HEAD~1.\n- Only fix the message or add a forgotten file: git commit --amend.\n- Already pushed to a shared branch: git revert HEAD and push, so you do not rewrite others' history.\nIf you reset by mistake, git reflog shows the old commit hash and you can git reset --hard <sha> back.` },
    { q: 'What is .gitignore? What should a MERN project ignore? What if .env was committed?', level: 'Easy', a: `.gitignore lists files and folders Git should not track. MERN: node_modules/, .env (and .env.*.local), dist/, build/, coverage/, *.log, .DS_Store, IDE folders.\nIf .env was already committed, adding it to .gitignore is not enough because Git already tracks it: run git rm --cached .env, commit, and most importantly rotate every secret in it (new DB password, new JWT secret, new API keys) because they remain in history. Optionally purge history with git filter-repo and force push. Keep a .env.example with variable names only.` },
    { q: 'Which branching strategy have you used? Explain GitHub Flow vs Git Flow.', level: 'Medium', a: `GitHub Flow: main is always deployable. Create a short-lived feature branch, push, open a pull request, CI runs tests, teammate reviews, squash-merge into main, auto-deploy. Simple; good for web apps with continuous deployment.\nGit Flow: long-lived main and develop branches plus feature/*, release/* and hotfix/* branches. Suited to versioned products with scheduled releases, but heavier.\nTrunk-based: very small, frequent merges to main with feature flags.\nSample answer: "In my project I used GitHub Flow: feature branches, PRs with review, and Vercel/Render auto-deployed main."` },
    { q: 'What is a pull request and what do you check in a code review?', level: 'Easy', a: `A pull request (PR) asks to merge a branch into another, with a place for discussion, review comments and automated checks.\nIn review I check: correctness and edge cases, readability and naming, no secrets or console.logs left, error handling, security (validation, auth checks), performance (N+1 queries, missing indexes), tests added/updated, and that CI is green. Feedback should be specific and polite; keep PRs small so they are easy to review.` },
    { q: 'How did you deploy your MERN project?', level: 'Easy', a: `Model answer: "The React app is built with Vite (npm run build) and deployed on Vercel, which serves the static files from a CDN and redeploys on every push to main. The Express API is deployed on Render as a web service using npm ci and node server.js; environment variables like MONGO_URI, JWT_SECRET and CLIENT_URL are set in the Render dashboard. The database is MongoDB Atlas free tier with network access restricted to the server. The frontend uses VITE_API_URL to call the API, and the API's CORS allows only the Vercel domain. I added a /health endpoint for uptime checks."\nAdapt it to what you actually did; interviewers follow up on details.` },
    { q: 'How do environment variables work in Node and in a Vite React app?', level: 'Medium', a: `Node: process.env holds variables from the OS/hosting platform. Locally load a .env file with node --env-file=.env server.js (Node 20.6+) or the dotenv package. Values are strings, so convert numbers/booleans.\nVite React: variables must start with VITE_ and are read with import.meta.env.VITE_API_URL. They are replaced at BUILD time and end up in the JavaScript bundle, so they are public. Never put secrets (DB passwords, private API keys) in frontend env vars; keep them in the backend and proxy the call.` },
    { q: 'Your React app works locally but shows 404 on refresh of /dashboard after deployment. Why?', level: 'Medium', a: `With client-side routing (React Router BrowserRouter), /dashboard does not exist as a file on the server. On refresh the host looks for dashboard/index.html, finds nothing and returns 404.\nFix: configure an SPA fallback so all unknown paths serve index.html:\n- Netlify: _redirects file with "/* /index.html 200"\n- Vercel: rewrites in vercel.json { "rewrites": [{ "source": "/(.*)", "destination": "/" }] }\n- Nginx: try_files $uri /index.html;\n- Express serving the build: app.get('*splat', (req, res) => res.sendFile(path.resolve('dist/index.html'))) after the API routes (Express 5 needs a named wildcard).` },
    { q: 'What are unit, integration and end-to-end tests?', level: 'Easy', a: `Unit test: tests one small unit (a function, a React component) in isolation, with dependencies mocked. Very fast, many of them. Example: calculateTotal(cart) returns the right amount.\nIntegration test: tests several parts together. Example: POST /api/orders with Supertest against an in-memory MongoDB checks routing, validation, controller and DB.\nEnd-to-end (E2E) test: tests the whole app like a real user in a browser with Playwright/Cypress. Example: log in, add to cart, checkout.\nTesting pyramid: many unit, fewer integration, few E2E because E2E is slow and flaky.` },
    { q: 'How do you test an Express API?', level: 'Medium', a: `Export the app without calling listen, then use Supertest with Jest/Vitest:\n\nimport request from 'supertest';\nimport app from '../src/app.js';\n\nit('creates a product', async () => {\n  const res = await request(app)\n    .post('/api/products')\n    .set('Authorization', 'Bearer ' + adminToken)\n    .send({ name: 'Pen', price: 10 });\n  expect(res.status).toBe(201);\n  expect(res.body.name).toBe('Pen');\n});\n\nFor the DB use mongodb-memory-server (or a separate test database), connect in beforeAll, clear collections in afterEach, disconnect in afterAll. Test happy paths, validation errors (400), auth (401/403) and not found (404).` },
    { q: 'How do you test React components?', level: 'Medium', a: `Use React Testing Library with Vitest/Jest and jsdom. Test behaviour the user sees, not internal state:\n\nimport { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('increments counter', async () => {\n  render(<Counter />);\n  await userEvent.click(screen.getByRole('button', { name: /add/i }));\n  expect(screen.getByText('Count: 1')).toBeInTheDocument();\n});\n\nPrefer getByRole/getByLabelText queries (also improves accessibility), use findBy* for async content, and mock network calls with MSW instead of mocking fetch everywhere.` },
    { q: 'What is mocking? Mock vs stub vs spy?', level: 'Medium', a: `Mocking replaces a real dependency (DB, payment gateway, email, time) with a fake so tests are fast, deterministic and isolated.\n- Stub: returns a fixed answer (findUser always returns { id: 1 }).\n- Spy: wraps a function and records calls without (necessarily) changing behaviour (vi.spyOn(console, 'error')).\n- Mock: a fake with expectations about how it is called (expect(sendEmail).toHaveBeenCalledWith('a@b.com')).\nIn Jest/Vitest: jest.fn()/vi.fn(), mockResolvedValue, vi.mock('module'), fake timers (vi.useFakeTimers()). Do not over-mock: if you mock everything, the test proves nothing.` },
    { q: 'What is code coverage? Is 100% coverage enough?', level: 'Medium', a: `Coverage measures which lines, branches, functions and statements ran during tests (jest --coverage / vitest --coverage). It helps find untested code.\n100% coverage does not mean bug-free: a test can execute a line without asserting the right result, and it says nothing about missing features or edge-case inputs. Teams usually target 70-80% on business logic and focus on meaningful assertions, critical paths (auth, payments) and regression tests for fixed bugs.` },
    { q: 'What is Docker? Image vs container? Container vs virtual machine?', level: 'Medium', a: `Docker packages an application with its runtime, libraries and config into a portable image, so it runs the same on a laptop, CI and the cloud.\nImage: read-only template built from a Dockerfile (like a class). Container: a running instance of an image (like an object); you can run many from one image.\nContainer vs VM: containers share the host's OS kernel and isolate processes, so they are MBs in size and start in seconds. VMs run a full guest OS on a hypervisor: GBs, minutes to boot, stronger isolation.` },
    { q: 'Write a Dockerfile for a Node/Express API and explain each line.', level: 'Medium', a: `FROM node:22-alpine          # small official Node base image\nWORKDIR /app                 # all next commands run here\nCOPY package*.json ./        # copy only manifests first...\nRUN npm ci --omit=dev        # ...so this layer is cached until deps change\nCOPY . .                     # then the source code\nENV NODE_ENV=production\nUSER node                    # do not run as root\nEXPOSE 5000                  # documents the port\nCMD ["node", "server.js"]    # start command (exec form handles SIGTERM correctly)\n\nAdd a .dockerignore with node_modules, .env, .git so they are not copied. Build: docker build -t shop-api . ; run: docker run -p 5000:5000 --env-file .env shop-api.` },
    { q: 'What is docker compose? Show a compose file for a MERN stack.', level: 'Medium', a: `Docker Compose defines and runs multi-container apps from one YAML file. docker compose up starts everything with a shared network where services reach each other by name.\n\nservices:\n  mongo:\n    image: mongo:8\n    volumes: [mongo-data:/data/db]\n  api:\n    build: ./server\n    ports: ["5000:5000"]\n    environment:\n      MONGO_URI: mongodb://mongo:27017/shop\n      JWT_SECRET: devsecret\n    depends_on: [mongo]\n  client:\n    build: ./client\n    ports: ["5173:80"]\nvolumes:\n  mongo-data:\n\nNote the API connects to host "mongo" (the service name), not localhost. The named volume keeps data when containers are recreated.` },
    { q: 'What is CI/CD? Describe a pipeline for a MERN project.', level: 'Medium', a: `CI (Continuous Integration): every push/PR automatically installs dependencies, runs lint, tests and build, so broken code is caught before merging.\nCD (Continuous Delivery/Deployment): after CI passes on main, the app is automatically deployed to staging/production (delivery may need a manual approval; deployment is fully automatic).\nPipeline with GitHub Actions: on pull_request -> checkout, setup-node 22 with npm cache, npm ci, npm run lint, npm test, npm run build. On push to main -> same checks, then build a Docker image, push to a registry and trigger deploy (Render deploy hook, ECS update, or Vercel). Secrets stored in GitHub Actions secrets. Branch protection requires green CI and one review before merge.` },
    { q: 'dependencies vs devDependencies, and npm install vs npm ci?', level: 'Easy', a: `dependencies: packages needed to run the app in production (express, mongoose, jsonwebtoken, react). devDependencies: only for development/build/test (jest, vitest, eslint, nodemon, vite, prettier). npm install --omit=dev skips devDependencies on the server.\nnpm install: installs/updates according to package.json ranges and may update package-lock.json.\nnpm ci: deletes node_modules and installs exactly what package-lock.json says; fails if package.json and lock are out of sync. Faster and reproducible: use it in CI and Dockerfiles.` },
    { q: 'What is package-lock.json and should you commit it?', level: 'Easy', a: `package-lock.json records the exact resolved version (and integrity hash) of every installed package, including nested dependencies. package.json only stores ranges like ^4.21.0.\nYes, commit it: it guarantees teammates, CI and production install the same dependency tree, avoiding "works on my machine" bugs when a sub-dependency publishes a new version. Do not commit node_modules.` },
    { q: 'What is PM2 and why use it in production?', level: 'Medium', a: `PM2 is a production process manager for Node.js.\n- Auto-restarts the app if it crashes\n- Cluster mode: pm2 start server.js -i max runs one process per CPU core with built-in load balancing\n- Zero-downtime reload: pm2 reload api\n- Log management and monitoring (pm2 logs, pm2 monit)\n- Starts on system boot (pm2 startup, pm2 save)\nOn Docker/Kubernetes you often skip PM2 and let the orchestrator restart containers and scale replicas instead.` },
    { q: 'How do you monitor and log a Node.js app in production?', level: 'Medium', a: `Logging: structured JSON logs with pino or winston, request logs with pino-http/morgan, a request ID per request for tracing, log levels (error/warn/info/debug), never log passwords/tokens/PII. Ship logs to CloudWatch, Datadog, ELK or Grafana Loki.\nError tracking: Sentry on frontend and backend with source maps.\nMetrics: latency (p95/p99), throughput, error rate, CPU, memory, event-loop lag; dashboards in Grafana/Datadog/New Relic.\nAlerts: notify on high error rate or downtime; uptime checks on /health.\nAlso handle process-level events: log unhandledRejection/uncaughtException and restart gracefully.` },
    { q: 'What is blue-green deployment vs canary vs rolling deployment?', level: 'Hard', a: `Rolling: replace instances one at a time with the new version; no extra infrastructure, but old and new versions run together for a while.\nBlue-green: two identical environments. Blue serves live traffic; deploy to green, test it, then switch the load balancer to green. Instant rollback by switching back. Costs double infrastructure during the switch.\nCanary: send a small percentage (e.g. 5%) of real traffic to the new version, watch error rates and latency, then gradually increase to 100% or roll back.\nAll of them need backward-compatible DB changes (add fields first, remove later).` },
    { q: 'How do you implement graceful shutdown in an Express server?', level: 'Hard', a: `Platforms (Docker, Kubernetes, PM2, Render) send SIGTERM before stopping a process. Handle it so in-flight requests finish:\n\nconst server = app.listen(port);\nprocess.on('SIGTERM', () => {\n  console.log('SIGTERM received, shutting down');\n  server.close(async () => {          // stop accepting new connections\n    await mongoose.connection.close(); // close DB\n    process.exit(0);\n  });\n  setTimeout(() => process.exit(1), 10_000).unref(); // force exit if stuck\n});\n\nAlso make the health check fail during shutdown so the load balancer stops sending traffic. Use CMD ["node", "server.js"] (exec form) in Docker so Node receives the signal.` },
  ],
  practice: [
    {
      task: 'You committed 3 commits on main locally by mistake (not pushed). Move them to a new branch feature/profile and reset main to match origin. Write the exact commands.',
      hint: 'Create the branch first (it keeps the commits), then reset main.',
      solution: `git branch feature/profile        # new branch points at your 3 commits
git fetch origin
git reset --hard origin/main      # main goes back to the remote state
git switch feature/profile        # your commits are safe here
git push -u origin feature/profile
# If something goes wrong: git reflog shows every previous HEAD position,
# and git reset --hard <sha> brings it back.`,
    },
    {
      task: 'Write a Supertest + Vitest (or Jest) integration test file for GET /api/products/:id covering: 200 with a valid id, 404 for a non-existing id, 400 for an invalid ObjectId. Use mongodb-memory-server.',
      hint: 'Connect in beforeAll, seed one product, disconnect and stop the memory server in afterAll.',
      solution: `// tests/products.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Product from '../src/models/Product.js';

let mongod, product;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  product = await Product.create({ name: 'Notebook', price: 60, stock: 10 });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('GET /api/products/:id', () => {
  it('returns the product', async () => {
    const res = await request(app).get('/api/products/' + product.id);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Notebook');
  });

  it('returns 404 when product does not exist', async () => {
    const res = await request(app).get('/api/products/' + new mongoose.Types.ObjectId());
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid id', async () => {
    const res = await request(app).get('/api/products/abc');
    expect(res.status).toBe(400);
  });
});

// Controller that passes these tests:
// export async function getProduct(req, res) {
//   if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
//   const p = await Product.findById(req.params.id).lean();
//   if (!p) return res.status(404).json({ error: 'Product not found' });
//   res.json(p);
// }`,
    },
    {
      task: 'Write a multi-stage Dockerfile for the React (Vite) frontend that builds the app with Node and serves it with Nginx, including SPA fallback.',
      hint: 'Stage 1: node:22-alpine runs npm ci and npm run build. Stage 2: nginx:alpine copies /app/dist.',
      solution: `# client/Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# client/nginx.conf
# server {
#   listen 80;
#   root /usr/share/nginx/html;
#   location / { try_files $uri $uri/ /index.html; }   # SPA fallback for React Router
#   location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; }
# }

# Build: docker build --build-arg VITE_API_URL=https://api.myshop.in -t shop-client ./client
# The final image contains only Nginx + static files (~50 MB), no node_modules.`,
    },
    {
      task: 'Create a GitHub Actions workflow for a monorepo with /server and /client folders: on every PR run install, lint and test for the server and build for the client; on push to main also call a Render deploy hook stored in secrets.',
      hint: 'Use defaults.run.working-directory per job and a separate deploy job with needs: and an if: condition.',
      solution: `# .github/workflows/ci-cd.yml
name: CI-CD
on:
  pull_request:
  push:
    branches: [main]

jobs:
  server:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: server } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: server/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm test

  client:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: client } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: client/package-lock.json
      - run: npm ci
      - run: npm run build

  deploy:
    needs: [server, client]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render deploy
        run: curl -fsS -X POST "\${{ secrets.RENDER_DEPLOY_HOOK }}"`,
    },
    {
      task: 'Add production-readiness to an Express server: health check, Helmet, CORS whitelist from env, morgan logging only in development, central error handler that hides stack traces in production, and graceful shutdown.',
      hint: 'Error middleware has 4 parameters (err, req, res, next) and goes after all routes.',
      solution: `// server.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import productRoutes from './routes/products.js';

const isProd = process.env.NODE_ENV === 'production';
const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL.split(','), credentials: true }));
app.use(express.json({ limit: '1mb' }));
if (!isProd) app.use(morgan('dev'));

app.get('/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'db-down', uptime: process.uptime() });
});
app.use('/api/products', productRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 && isProd ? 'Internal server error' : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });
});

await mongoose.connect(process.env.MONGO_URI);
const server = app.listen(process.env.PORT || 5000, () => console.log('API ready'));

process.on('SIGTERM', () => {
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
});`,
    },
  ],
  quiz: [
    {
      question: 'A bad commit is already pushed to the shared main branch. What is the safest way to undo it?',
      options: ['git reset --hard HEAD~1 and force push', 'Delete the repository and re-clone', 'git revert <sha> and push', 'git stash'],
      answer: 2,
      explanation: 'revert adds a new commit that undoes the change without rewriting shared history, so teammates are not affected.',
    },
    {
      question: 'Which command should a CI pipeline or Dockerfile use to install exact versions from package-lock.json?',
      options: ['npm ci', 'npm install --force', 'npm update', 'npx install'],
      answer: 0,
      explanation: 'npm ci performs a clean, reproducible install strictly from the lock file and fails if it does not match package.json.',
    },
    {
      question: 'In a Vite React app, which statement about VITE_ environment variables is TRUE?',
      options: ['They are only available on the server', 'They are encrypted in the bundle', 'They are read at runtime from the user\'s machine', 'They are embedded in the public JS bundle at build time, so never put secrets there'],
      answer: 3,
      explanation: 'Vite replaces import.meta.env.VITE_* at build time; anyone can read them in the browser.',
    },
    {
      question: 'With "express": "^5.1.0" in package.json, which version can npm install?',
      options: ['6.0.0', '5.2.3', '4.21.2', '5.0.9'],
      answer: 1,
      explanation: 'Caret allows any version >= 5.1.0 and < 6.0.0. 5.0.9 is lower than 5.1.0 and 6.0.0 is a new major.',
    },
    {
      question: 'Which test type best fits "log in, add an item to the cart and complete checkout in a real browser"?',
      options: ['Unit test', 'Snapshot test', 'End-to-end test with Playwright or Cypress', 'Linting'],
      answer: 2,
      explanation: 'E2E tests drive the full application through a real browser, covering frontend, backend and database together.',
    },
  ],
};
