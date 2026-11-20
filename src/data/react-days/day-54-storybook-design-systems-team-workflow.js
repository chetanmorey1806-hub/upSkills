export default {
  id: 'day-54-storybook-design-systems-team-workflow',
  title: 'Storybook and Design Systems, Code Reviews, PR Checklist, Conventional Commits and Team Workflow',
  module: 'Module 11: Testing, Quality & Deployment',
  day: 54,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'In a company you rarely work alone: designers, other developers, QA and product managers all touch the same UI. Today you learn how teams build a shared design system with design tokens, document and test components in Storybook, and collaborate through branches, pull requests, code reviews, PR checklists and Conventional Commits.',
  objectives: [
    'Explain what a design system is: tokens, components, patterns and documentation',
    'Write Storybook stories (CSF3) with args, controls, actions, decorators and play functions',
    'Design reusable component APIs (variants, sizes, states, accessibility) backed by design tokens',
    'Write and review pull requests using a PR template, checklist and constructive review comments',
    'Use Conventional Commits with commitlint, Husky and lint-staged in a feature-branch workflow',
  ],
  theory: [
    {
      heading: 'What is a design system?',
      content:
        'A **design system** is the single source of truth for how a company\'s products look and behave. It has layers:\n\n1. **Design tokens**: named values for colours, spacing, typography, radius, shadows (`--color-primary-600`, `--space-4`, `--radius-md`). Designers define them in Figma; developers use them as CSS variables or a Tailwind theme\n2. **Components**: Button, Input, Select, Badge, Card, Modal, Toast… built once, accessible, tested\n3. **Patterns**: forms, empty states, page layouts, error handling\n4. **Documentation and guidelines**: when to use which variant, do\'s and don\'ts, content tone\n\nReal examples: Google Material Design, Atlassian Design System, Shopify Polaris, IBM Carbon, and in India **Razorpay Blade** (open source) and Swiggy/Zomato internal systems.\n\nAnalogy: tokens are the bricks and paint colours, components are the standard doors and windows, patterns are the room layouts. Every team builds houses faster and they all look like one city.\n\nBenefits: consistency, speed, accessibility built in once, easy rebranding (change tokens, not 500 files). Small teams often start with **shadcn/ui** or MUI and customise its theme instead of building from scratch.',
    },
    {
      heading: 'Storybook: a workshop for components',
      content:
        '**Storybook** (v8) lets you develop and document components **in isolation**, outside your app, with every state visible: default, loading, disabled, error, long text, dark mode, mobile width.\n\nSetup: `npx storybook@latest init` in a Vite React project. It creates `.storybook/main.js`, `.storybook/preview.js` and example stories. Run with `npm run storybook` (port 6006); `npm run build-storybook` builds a static site that teams deploy for designers and QA.\n\n**Component Story Format 3 (CSF3)**: a `*.stories.jsx` file next to the component:\n- `default export` (meta): `title`, `component`, `args` defaults, `argTypes`, `tags: ["autodocs"]`\n- each **named export is a story**: an object with `args`\n- **Controls** panel edits args live; **Actions** log callbacks like `onClick` (`fn()` from `@storybook/test`)\n- **Decorators** wrap stories with providers (theme, router, i18n)\n- **Autodocs** generates a docs page from props and comments\n- **Addons**: a11y (axe checks per story), viewport, interactions; **play functions** click and type in a story and assert (they are tests!)\n- **Chromatic** (by the Storybook team) does visual regression testing: screenshots of every story in each PR',
      syntax: `// src/components/ui/Button.stories.jsx
import { fn } from "@storybook/test";
import { Button } from "./Button";

export default {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Add to cart", onClick: fn() },
  argTypes: { variant: { control: "select", options: ["primary", "secondary", "danger", "ghost"] } },
};

export const Primary = { args: { variant: "primary" } };
export const Loading = { args: { loading: true } };
export const Disabled = { args: { disabled: true } };
export const LongText = { args: { children: "Proceed to secure checkout with UPI" } };`,
      tip: 'Stories double as test cases: the Storybook test runner / Vitest addon can run every story and its play function in CI, so a component cannot silently break.',
    },
    {
      heading: 'Designing a good component API',
      content:
        'Design-system components are used hundreds of times, so their **props API** matters more than their implementation.\n\n- **Variants via props, not new components**: `<Button variant="primary" size="sm" />`, not `PrimarySmallButton`\n- **Limited, named options** (`"sm" | "md" | "lg"`) instead of free values (`padding={13}`)\n- **Pass through native props** with `...rest` so `type`, `aria-*`, `onClick`, `disabled`, `form` all work; forward the ref (React 19: ref as a prop)\n- **Composition** with `children` and slots (`leftIcon`, `rightIcon`) instead of 20 boolean props\n- **States** covered: hover, focus-visible, active, disabled, loading, error\n- **Accessible by default**: real `<button>`, `aria-busy` when loading, visible focus ring, contrast from tokens\n- **Styling with tokens**: CSS variables, Tailwind theme or `cva` (class-variance-authority) for variant classes; consumers can add `className`\n- **Document** each prop (JSDoc/TypeScript) and version the library with **semver**: breaking prop changes = major version',
      syntax: `/* tokens.css */
:root {
  --color-primary: #4f46e5; --color-primary-hover: #4338ca;
  --color-danger: #dc2626; --color-text: #111827; --color-surface: #ffffff;
  --radius-md: 8px; --space-2: 8px; --space-3: 12px; --font-sm: 14px;
}
[data-theme="dark"] { --color-text: #f9fafb; --color-surface: #111827; }`,
    },
    {
      heading: 'Pull requests and code reviews',
      content:
        'Every change goes through a **pull request (PR)** reviewed by at least one teammate before merging into `main`.\n\n**A good PR (author):**\n- Small and focused: one ticket, ideally under ~400 changed lines\n- Clear title (`feat(cart): add coupon field`) and description: what, why, how to test, screenshots/video for UI changes, link to the Jira ticket\n- Self-review the diff first; CI green (lint, tests, build); no console.logs, commented-out code or secrets\n\n**A good review (reviewer):**\n- Check correctness, edge cases (empty, error, loading, slow network), accessibility, security (XSS, secrets), performance, naming, tests\n- Be kind and specific; comment on code, not the person; explain why; suggest code\n- Use prefixes: **nit:** (optional style), **question:**, **suggestion:**, **blocking:**\n- Approve when it is good enough, not perfect; respond within a working day\n\nTools: GitHub/GitLab/Bitbucket PRs, **CODEOWNERS** to auto-assign reviewers, branch protection requiring approvals and green checks, PR templates in `.github/pull_request_template.md`.',
      points: [
        'Bad comment: "This is wrong." Good comment: "blocking: if the API returns an empty list, items[0].id crashes. Could we show the EmptyState here?"',
        'Bad PR: "fixes" with 40 files changed. Good PR: "fix(auth): refresh token before expiry (JIRA-231)" with 5 files and a test',
      ],
    },
    {
      heading: 'Conventional Commits, Husky and lint-staged',
      content:
        '**Conventional Commits** is a standard commit message format: `type(scope): description`.\n\nTypes: `feat` (new feature → minor version), `fix` (bug fix → patch), `docs`, `style` (formatting), `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Add `!` or a `BREAKING CHANGE:` footer for breaking changes (→ major version).\n\nExamples:\n- `feat(cart): apply coupon codes at checkout`\n- `fix(auth): logout user when refresh token expires`\n- `refactor(ui)!: rename Button prop "kind" to "variant"`\n\nWhy companies use it: readable history, automatic **CHANGELOG** and version bumps (semantic-release, changesets, release-please), easy to find when a bug was introduced.\n\n**Enforcement with Git hooks:**\n- **Husky** runs scripts on Git hooks (`pre-commit`, `commit-msg`, `pre-push`)\n- **lint-staged** runs ESLint/Prettier only on staged files in `pre-commit` (fast)\n- **commitlint** with `@commitlint/config-conventional` rejects bad messages in `commit-msg`',
      syntax: `npm i -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init

# .husky/pre-commit
npx lint-staged

# .husky/commit-msg
npx --no -- commitlint --edit "$1"

// package.json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,md,json}": ["prettier --write"]
}

// commitlint.config.js
export default { extends: ["@commitlint/config-conventional"] };`,
    },
    {
      heading: 'A typical team workflow (sprint to production)',
      content:
        'How a feature moves through an Indian product company or service company team:\n\n1. **Ticket**: the product manager writes a user story in Jira/Linear with acceptance criteria; the team estimates it in sprint planning\n2. **Branch** from `main`: `feature/JIRA-231-coupon-field` (or `fix/…`, `chore/…`)\n3. **Develop** with small Conventional Commits; build the component in Storybook first; write tests\n4. **Rebase/merge** latest `main`, push, open a **PR** using the template; CI runs lint, tests, build, Storybook/Chromatic, preview deployment\n5. **Review**: 1–2 approvals, address comments, re-request review\n6. **Merge** (usually **squash merge** so main has one clean commit per PR)\n7. **QA** on staging, then release to production (Day 55), demo in sprint review, lessons in the retrospective\n\nTrunk-based development (short-lived branches + feature flags) is the most common modern model; GitFlow (develop/release branches) is still used in some service companies with scheduled releases.',
      tip: 'Coming next: Day 55 automates steps 4–7 with GitHub Actions, preview deployments on Vercel/Netlify and environments per stage.',
    },
  ],
  examples: [
    {
      title: 'A mini Storybook: Button stories with a Controls panel',
      scenario: 'Build the design-system Button and its stories. The playground imitates Storybook (story list, canvas, controls, actions log) in plain React because Storybook itself cannot run in the playground.',
      steps: [
        'Create src/components/ui/Button.jsx with variant, size, loading, leftIcon and ...rest props',
        'Create Button.stories.jsx with meta (title, component, args, argTypes) and named stories',
        'Run npm run storybook and open UI/Button',
        'In the playground pick a story on the left, change args in the Controls panel and click the button to see the Actions log',
      ],
      code: `// src/components/ui/Button.jsx
import { clsx } from "clsx";
import "./button.css";

export function Button({ variant = "primary", size = "md", loading = false, leftIcon, className, children, disabled, ...rest }) {
  return (
    <button
      className={clsx("btn", "btn--" + variant, "btn--" + size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : leftIcon}
      <span>{children}</span>
    </button>
  );
}

// src/components/ui/Button.stories.jsx
import { fn, expect, userEvent, within } from "@storybook/test";
import { Button } from "./Button";

export default {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Add to cart", variant: "primary", size: "md", onClick: fn() },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "danger", "ghost"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
};

export const Primary = {};
export const Secondary = { args: { variant: "secondary", children: "Save for later" } };
export const Danger = { args: { variant: "danger", children: "Delete address" } };
export const Loading = { args: { loading: true, children: "Placing order" } };

// play function = interaction test that runs in Storybook and CI
export const ClickCallsHandler = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /add to cart/i }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};`,
      playground: {
        jsx: `const { useState } = React;

// ===== the design-system component =====
function Button({ variant = "primary", size = "md", loading = false, leftIcon, className = "", children, disabled, ...rest }) {
  return (
    <button
      className={["btn", "btn--" + variant, "btn--" + size, className].join(" ")}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : leftIcon}
      <span>{children}</span>
    </button>
  );
}

// ===== stories (same shape as CSF3) =====
const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Add to cart", variant: "primary", size: "md", loading: false, disabled: false },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "danger", "ghost"] },
    size: { control: "radio", options: ["sm", "md", "lg"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
};
const stories = {
  Primary: {},
  Secondary: { args: { variant: "secondary", children: "Save for later" } },
  Danger: { args: { variant: "danger", children: "Delete address" } },
  Ghost: { args: { variant: "ghost", children: "Cancel" } },
  Loading: { args: { loading: true, children: "Placing order" } },
  WithIcon: { args: { leftIcon: "🛒", children: "Buy now · ₹1,299" } },
  LongText: { args: { children: "Proceed to secure checkout with UPI / Cards / Net banking", size: "sm" } },
};

// ===== tiny Storybook UI =====
function Control({ name, type, options, value, onChange }) {
  if (type === "boolean") return <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />;
  if (type === "select") return <select value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select>;
  if (type === "radio") return <span>{options.map(o => <label key={o}><input type="radio" name={name} checked={value === o} onChange={() => onChange(o)} />{o} </label>)}</span>;
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}

function App() {
  const [storyName, setStoryName] = useState("Primary");
  const [overrides, setOverrides] = useState({});
  const [actions, setActions] = useState([]);
  const args = { ...meta.args, ...stories[storyName].args, ...overrides };

  function selectStory(name) { setStoryName(name); setOverrides({}); }
  const onClick = () => setActions(a => [new Date().toLocaleTimeString("en-IN") + "  onClick()  [" + storyName + "]", ...a].slice(0, 5));

  return (
    <div className="sb">
      <nav aria-label="Stories">
        <div className="group">{meta.title}</div>
        {Object.keys(stories).map(n => (
          <button key={n} className={"story" + (n === storyName ? " active" : "")} aria-current={n === storyName} onClick={() => selectStory(n)}>{n}</button>
        ))}
      </nav>
      <main>
        <div className="canvas"><Button {...args} onClick={onClick} /></div>
        <div className="panel">
          <b>Controls</b>
          <table><tbody>
            {Object.entries(meta.argTypes).map(([name, t]) => (
              <tr key={name}><td>{name}</td><td>
                <Control name={name} type={t.control} options={t.options} value={args[name]} onChange={v => setOverrides(o => ({ ...o, [name]: v }))} />
              </td></tr>
            ))}
          </tbody></table>
          <b>Actions</b>
          <ul className="actions">{actions.length ? actions.map((a, i) => <li key={i}>{a}</li>) : <li>Click the button…</li>}</ul>
        </div>
      </main>
    </div>
  );
}`,
        css: `:root { --color-primary: #4f46e5; --color-primary-hover: #4338ca; --color-danger: #dc2626; --radius-md: 8px; }
.sb { display: grid; grid-template-columns: 140px 1fr; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; font-size: 14px; }
nav { background: #f8fafc; padding: 8px; border-right: 1px solid #e5e7eb; }
.group { font-weight: 700; font-size: 12px; color: #64748b; margin-bottom: 4px; }
.story { display: block; width: 100%; text-align: left; border: none; background: none; padding: 5px 8px; border-radius: 6px; cursor: pointer; }
.story.active { background: #e0e7ff; color: #3730a3; font-weight: 600; }
.canvas { padding: 30px; display: grid; place-items: center; background: repeating-conic-gradient(#fafafa 0 25%, #fff 0 50%) 0 0 / 16px 16px; border-bottom: 1px solid #e5e7eb; min-height: 60px; }
.panel { padding: 8px 12px; }
.panel td { padding: 3px 8px 3px 0; }
.actions { font-family: monospace; font-size: 12px; padding-left: 16px; color: #334155; }
.btn { display: inline-flex; align-items: center; gap: 6px; border: 1px solid transparent; border-radius: var(--radius-md); cursor: pointer; font-weight: 600; }
.btn--sm { padding: 4px 10px; font-size: 13px; } .btn--md { padding: 8px 16px; font-size: 14px; } .btn--lg { padding: 12px 22px; font-size: 16px; }
.btn--primary { background: var(--color-primary); color: white; } .btn--primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.btn--secondary { background: white; color: var(--color-primary); border-color: var(--color-primary); }
.btn--danger { background: var(--color-danger); color: white; }
.btn--ghost { background: transparent; color: #334155; }
.btn:disabled { opacity: .55; cursor: not-allowed; }
.btn:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
.btn__spinner { width: 12px; height: 12px; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }`,
      },
      result: 'A Storybook-like screen: story list on the left (Primary, Secondary, Danger, Ghost, Loading, WithIcon, LongText), the button rendered on a checkered canvas, live Controls (variant, size, loading, disabled, text) and an Actions log that records each click.',
      explanation:
        'A story is just "the component + a set of args". meta.args are defaults, each story overrides some, and the Controls panel overrides them again at runtime, exactly how Storybook merges args. Seeing every state side by side is how designers review components and how developers catch problems like long text overflow or a missing disabled style. The real Storybook adds autodocs, the a11y addon, interaction tests (play) and visual testing.',
    },
    {
      title: 'Design tokens and theme switching with CSS variables',
      scenario: 'The brand team changes the primary colour and wants dark mode. With tokens, the whole component library updates by changing variables in one place.',
      steps: [
        'Define tokens as CSS variables on :root and override them under [data-theme="dark"] and [data-brand="..."]',
        'Use only tokens inside component CSS (no hard-coded hex values)',
        'Build Badge and Card components that read the tokens',
        'Toggle theme and brand in the playground and watch every component update',
      ],
      code: `// tokens exported from Figma (e.g. Tokens Studio) → tokens.json → build to CSS with Style Dictionary
{
  "color": { "primary": { "value": "#4f46e5" }, "success": { "value": "#16a34a" } },
  "radius": { "md": { "value": "8px" } },
  "space": { "2": { "value": "8px" }, "4": { "value": "16px" } }
}

/* Tailwind CSS 4: tokens live in CSS with @theme */
@import "tailwindcss";
@theme {
  --color-primary: #4f46e5;
  --radius-card: 12px;
}
/* now classes like bg-primary and rounded-card exist */`,
      playground: {
        jsx: `const { useState, useEffect } = React;

function Badge({ tone = "neutral", children }) {
  return <span className={"badge badge--" + tone}>{children}</span>;
}

function Card({ title, price, badge, children }) {
  return (
    <article className="card">
      <div className="card__img" aria-hidden="true" />
      <div className="card__body">
        {badge}
        <h3>{title}</h3>
        <p className="price">{"₹" + price.toLocaleString("en-IN")}</p>
        {children}
      </div>
    </article>
  );
}

function App() {
  const [theme, setTheme] = useState("light");
  const [brand, setBrand] = useState("indigo");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.brand = brand;
  }, [theme, brand]);
  return (
    <div className="page">
      <div className="toolbar">
        <label>Theme <select value={theme} onChange={e => setTheme(e.target.value)}><option>light</option><option>dark</option></select></label>
        <label>Brand <select value={brand} onChange={e => setBrand(e.target.value)}><option>indigo</option><option>saffron</option><option>teal</option></select></label>
      </div>
      <div className="grid">
        <Card title="Handloom Cotton Saree" price={2499} badge={<Badge tone="success">In stock</Badge>}>
          <button className="btn">Add to cart</button>
        </Card>
        <Card title="Brass Diya Set" price={799} badge={<Badge tone="warning">Only 3 left</Badge>}>
          <button className="btn">Add to cart</button>
        </Card>
        <Card title="Bamboo Lamp" price={1299} badge={<Badge>New</Badge>}>
          <button className="btn" disabled>Notify me</button>
        </Card>
      </div>
    </div>
  );
}`,
        css: `:root {
  --color-primary: #4f46e5; --color-on-primary: #fff;
  --color-bg: #f8fafc; --color-surface: #fff; --color-text: #0f172a; --color-muted: #64748b; --color-border: #e2e8f0;
  --color-success-bg: #dcfce7; --color-success: #166534; --color-warning-bg: #fef3c7; --color-warning: #92400e;
  --radius-md: 8px; --radius-lg: 14px; --space-2: 8px; --space-3: 12px;
}
:root[data-brand="saffron"] { --color-primary: #ea580c; }
:root[data-brand="teal"] { --color-primary: #0f766e; }
:root[data-theme="dark"] {
  --color-bg: #0f172a; --color-surface: #1e293b; --color-text: #f1f5f9; --color-muted: #94a3b8; --color-border: #334155;
  --color-success-bg: #14532d; --color-success: #bbf7d0; --color-warning-bg: #78350f; --color-warning: #fde68a;
}
body { background: var(--color-bg); color: var(--color-text); }
.toolbar { display: flex; gap: var(--space-3); margin-bottom: var(--space-3); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: var(--space-3); }
.card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.card__img { height: 80px; background: linear-gradient(135deg, var(--color-primary), transparent); }
.card__body { padding: var(--space-3); }
.card h3 { font-size: 15px; margin: 6px 0 2px; }
.price { color: var(--color-muted); margin: 0 0 8px; }
.badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 99px; background: var(--color-border); }
.badge--success { background: var(--color-success-bg); color: var(--color-success); }
.badge--warning { background: var(--color-warning-bg); color: var(--color-warning); }
.btn { width: 100%; padding: var(--space-2); border: none; border-radius: var(--radius-md); background: var(--color-primary); color: var(--color-on-primary); font-weight: 600; }
.btn:disabled { opacity: .5; }`,
      },
      result: 'Three product cards with badges. Switching Brand changes the button and image colours everywhere; switching Theme to dark changes backgrounds, text, borders and badge colours, with no change to any component code.',
      explanation:
        'Components reference semantic tokens (--color-primary, --color-surface) instead of raw colours. Themes and brands are just different values for the same variables, set by a data attribute on <html>. This is how design systems support dark mode, white-label products and rebrands. In Storybook a decorator or the themes addon toggles the same data attribute so every story can be checked in every theme.',
    },
    {
      title: 'Conventional Commit validator (what commitlint does)',
      scenario: 'New team members keep writing commit messages like "changes" or "fixed bug". Build the rule checker that the commit-msg hook runs, and see which messages pass.',
      steps: [
        'Parse the header with a regex: type(scope)!: subject',
        'Check the type is in the allowed list, the subject is lower-case start, no trailing full stop, header ≤ 72 chars',
        'Detect breaking changes (! or BREAKING CHANGE footer) and map to the semver bump',
        'Type messages in the playground or click the examples',
      ],
      code: `# Good history after a sprint (git log --oneline)
a1b2c3d feat(checkout): add UPI payment option
9f8e7d6 fix(cart): prevent negative quantity
5d4c3b2 test(cart): cover coupon edge cases
1a2b3c4 docs(readme): add local setup steps
0f9e8d7 refactor(ui)!: rename Button prop "kind" to "variant"

# semantic-release / release-please read these to decide the next version:
# fix → 1.4.1 (patch), feat → 1.5.0 (minor), ! or BREAKING CHANGE → 2.0.0 (major)`,
      playground: {
        jsx: `const { useState } = React;

const TYPES = ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"];
const HEADER = /^(\\w+)(?:\\(([\\w\\-./]+)\\))?(!)?: (.+)$/;

function lint(message) {
  const [header, ...rest] = message.split("\\n");
  const body = rest.join("\\n");
  const errors = [];
  const m = header.match(HEADER);
  if (!m) return { errors: ["Header must look like: type(scope): subject"], bump: null };
  const [, type, scope, bang, subject] = m;
  if (!TYPES.includes(type)) errors.push('type "' + type + '" is not allowed (use ' + TYPES.join(", ") + ")");
  if (header.length > 72) errors.push("header is " + header.length + " characters (max 72)");
  if (/^[A-Z]/.test(subject)) errors.push("subject must not start with a capital letter");
  if (/\\.$/.test(subject)) errors.push("subject must not end with a full stop");
  if (subject.trim().length < 5) errors.push("subject is too short to be meaningful");
  if (rest.length && rest[0] !== "") errors.push("leave a blank line between header and body");
  const breaking = !!bang || /BREAKING CHANGE:/.test(body);
  const bump = breaking ? "major" : type === "feat" ? "minor" : type === "fix" || type === "perf" ? "patch" : "none";
  return { errors, bump, type, scope };
}

const EXAMPLES = [
  "feat(checkout): add UPI payment option",
  "fix(cart): prevent negative quantity",
  "Fixed bug.",
  "changes",
  "feature(auth): login with OTP",
  "refactor(ui)!: rename Button prop kind to variant",
  "fix(api): handle 429 rate limit\\n\\nRetry with backoff.\\n\\nRefs: JIRA-231",
  "feat(search): Add debounced search.",
];

function App() {
  const [msg, setMsg] = useState(EXAMPLES[0]);
  const r = lint(msg);
  const ok = r.errors.length === 0;
  return (
    <div className="wrap">
      <label htmlFor="msg"><b>Commit message</b></label>
      <textarea id="msg" rows={4} value={msg} onChange={e => setMsg(e.target.value)} />
      <div className={"result " + (ok ? "ok" : "bad")} role="status">
        {ok ? (
          <span>✔ commitlint passed · type: <b>{r.type}</b>{r.scope && <> · scope: <b>{r.scope}</b></>} · version bump: <b>{r.bump}</b></span>
        ) : (
          <ul>{r.errors.map(e => <li key={e}>✖ {e}</li>)}</ul>
        )}
      </div>
      <p><b>Try:</b></p>
      <div className="chips">{EXAMPLES.map(e => <button key={e} onClick={() => setMsg(e)}>{e.split("\\n")[0]}</button>)}</div>
    </div>
  );
}`,
        css: `.wrap { max-width: 480px; }
textarea { width: 100%; font-family: monospace; padding: 8px; margin-top: 4px; box-sizing: border-box; }
.result { margin-top: 8px; padding: 8px 10px; border-radius: 8px; font-size: 14px; }
.result ul { margin: 0; padding-left: 4px; list-style: none; }
.ok { background: #dcfce7; color: #14532d; } .bad { background: #fee2e2; color: #7f1d1d; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chips button { font-family: monospace; font-size: 12px; padding: 4px 8px; border-radius: 99px; border: 1px solid #cbd5e1; background: white; cursor: pointer; }`,
      },
      result: '"feat(checkout): add UPI payment option" passes with a minor bump; "Fixed bug." and "changes" fail with clear reasons; the "!" example shows a major bump; "feat(search): Add debounced search." fails for the capital letter and the full stop.',
      explanation:
        'commitlint parses the header into type, optional scope, optional "!" and subject, then applies rules from @commitlint/config-conventional (allowed types, case, length, blank line before body). Husky runs it in the commit-msg hook so a bad message is rejected before it enters history. Release tools read the same structure to decide the semantic version bump and write the changelog.',
    },
    {
      title: 'PR template, CODEOWNERS and a review conversation',
      scenario: 'Set up the repository so every PR has the same checklist and the right people are asked to review, then see what good review comments look like.',
      steps: [
        'Add .github/pull_request_template.md: GitHub pre-fills every new PR with it',
        'Add .github/CODEOWNERS so the design-system team reviews any change in src/components/ui',
        'Enable branch protection on main: require PR, 1 approval, CODEOWNERS review, green status checks, squash merge',
        'Open a PR, fill the template, add screenshots; reviewers comment with nit/suggestion/blocking prefixes',
      ],
      code: `<!-- .github/pull_request_template.md -->
## What & why
<!-- Short description. Link the ticket: JIRA-231 -->

## How to test
1. Go to /checkout
2. Enter coupon DIWALI50
3. Total should reduce by 50% (max ₹500)

## Screenshots / video
| Before | After |
|--------|-------|

## Checklist
- [ ] Title follows Conventional Commits (feat/fix/...)
- [ ] Self-reviewed the diff; no console.log, commented code or secrets
- [ ] Loading, empty and error states handled
- [ ] Accessible: labels, keyboard, focus, contrast; checked a11y addon in Storybook
- [ ] Tests added/updated (unit / integration / e2e) and passing
- [ ] Stories added/updated for new UI components
- [ ] Works on mobile width (360px) and in dark mode
- [ ] No new heavy dependency (checked bundle size)
- [ ] Docs / env variables / README updated if needed

# .github/CODEOWNERS
*                       @acme/frontend-team
/src/components/ui/     @acme/design-system
/src/features/payments/ @acme/payments-team
/.github/workflows/     @acme/devops

# Example review comments
# blocking: \`items[0].price\` crashes when the cart is empty. Can we render <EmptyCart /> first?
# suggestion: this fetch logic is repeated in 3 places; a useProducts() hook would help.
# question: why do we store total in state? It can be derived from items during render.
# nit: prefer \`isLoading\` over \`flag\` for readability.
# praise: nice job covering the error state with an MSW test 👏`,
      result: 'Every new PR opens with the checklist pre-filled, the design-system team is auto-requested for UI library changes, and main cannot be changed without an approved, green PR.',
      explanation:
        'Templates and CODEOWNERS turn team agreements into automation, so quality does not depend on memory. Review comments with clear prefixes tell the author what must change (blocking) and what is optional (nit), keep discussions friendly, and speed up merging. This example is configuration, so it has no playground.',
    },
  ],
  interview: [
    { q: 'What is a design system and what are design tokens?', a: 'A design system is a shared set of design decisions, reusable accessible components, patterns and documentation that keeps products consistent. Design tokens are the named primitive values (colours, spacing, typography, radius, shadows) that both design tools and code use, usually exported as CSS variables or theme config.', level: 'Easy' },
    { q: 'Why use Storybook?', a: 'To build and review components in isolation with all their states, generate living documentation (autodocs), let designers/QA review without running the app, run accessibility checks per story, write interaction tests with play functions, and do visual regression testing (Chromatic).', level: 'Easy' },
    { q: 'What is CSF3 and what are args?', a: 'Component Story Format 3: a stories file default-exports meta (title, component, default args, argTypes, decorators) and each named export is a story object. Args are the props passed to the component for that story; Controls edit them live and Actions log callback args.', level: 'Medium' },
    { q: 'What are Storybook decorators used for?', a: 'Wrapping stories with extra markup or providers: theme provider, router (MemoryRouter), i18n, Redux/Query clients, padding or a specific layout. They can be global (preview.js), per component (meta) or per story.', level: 'Medium' },
    { q: 'How do you design a reusable Button API?', a: 'Use a native <button>, variant and size props with limited options, loading/disabled states, icon slots, pass-through ...rest for native attributes and aria props, forward refs, allow className extension, style with tokens, and document/test every state. Avoid many boolean props and one-off components.', level: 'Medium' },
    { q: 'What makes a good pull request?', a: 'Small and focused, linked to a ticket, clear title and description with testing steps and screenshots, self-reviewed, tests and stories included, CI passing, no unrelated changes. Smaller PRs get faster and better reviews.', level: 'Easy' },
    { q: 'What do you look for when reviewing React code?', a: 'Correctness and edge cases (empty/loading/error), state placement and unnecessary effects, keys, accessibility, security (XSS, secrets), performance (re-renders, bundle), naming/readability, reuse of existing components/hooks, test coverage, and consistency with the design system.', level: 'Medium' },
    { q: 'Explain Conventional Commits and how they relate to semver.', a: 'A commit format type(scope): subject with optional body/footers. fix maps to a patch release, feat to a minor release, and a ! or BREAKING CHANGE footer to a major release, enabling automatic versioning and changelogs (semantic-release, release-please, changesets).', level: 'Medium' },
    { q: 'What do Husky, lint-staged and commitlint do?', a: 'Husky installs Git hooks; lint-staged runs linters/formatters only on staged files in pre-commit; commitlint validates the commit message in the commit-msg hook. Together they keep the repo clean before code even reaches CI.', level: 'Easy' },
    { q: 'Squash merge vs merge commit vs rebase?', a: 'Squash merge combines the PR into one commit on main (clean, one commit per feature, common in product teams). Merge commit keeps all branch commits plus a merge commit (full history). Rebase-and-merge replays commits linearly without a merge commit. Teams pick one and enforce it.', level: 'Medium' },
    { q: 'Trunk-based development vs GitFlow?', a: 'Trunk-based: short-lived branches merged to main daily, feature flags hide unfinished work, continuous deployment. GitFlow: long-lived develop, feature, release and hotfix branches for scheduled releases. Modern web teams prefer trunk-based; GitFlow suits versioned or tightly scheduled releases.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a Badge.stories.jsx (CSF3) with meta and stories for neutral, success, warning and danger tones, a control for tone, and autodocs.',
      hint: 'argTypes.tone = { control: "select", options: [...] }.',
      solution: `import { Badge } from "./Badge";

export default {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "In stock", tone: "neutral" },
  argTypes: { tone: { control: "select", options: ["neutral", "success", "warning", "danger"] } },
};

export const Neutral = {};
export const Success = { args: { tone: "success", children: "Delivered" } };
export const Warning = { args: { tone: "warning", children: "Only 2 left" } };
export const Danger = { args: { tone: "danger", children: "Payment failed" } };
export const AllTones = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      {["neutral", "success", "warning", "danger"].map(t => <Badge key={t} tone={t}>{t}</Badge>)}
    </div>
  ),
};`,
    },
    {
      task: 'Add a global decorator in .storybook/preview.jsx that wraps every story in a ThemeProvider and a MemoryRouter, and adds a toolbar switch for light/dark theme.',
      hint: 'Use globalTypes for the toolbar and read context.globals.theme in the decorator.',
      solution: `// .storybook/preview.jsx
import { MemoryRouter } from "react-router";
import "../src/styles/tokens.css";

export const globalTypes = {
  theme: {
    description: "Colour theme",
    toolbar: { title: "Theme", icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
  },
};
export const initialGlobals = { theme: "light" };

export const decorators = [
  (Story, context) => {
    document.documentElement.dataset.theme = context.globals.theme;
    return (
      <MemoryRouter>
        <div style={{ padding: 16, background: "var(--color-bg)" }}>
          <Story />
        </div>
      </MemoryRouter>
    );
  },
];

export const parameters = { a11y: { test: "error" }, layout: "centered" };`,
    },
    {
      task: 'Build an Input component for the design system with label, hint, error, required marker and pass-through props, and show three states in a playground.',
      hint: 'useId for ids; aria-invalid and aria-describedby linking hint/error.',
      solution: `const { useId } = React;
function Input({ label, hint, error, required, ...rest }) {
  const id = useId();
  const describedBy = error ? id + "-err" : hint ? id + "-hint" : undefined;
  return (
    <div style={{ display: "grid", gap: 4, marginBottom: 12, maxWidth: 280 }}>
      <label htmlFor={id} style={{ fontWeight: 600 }}>{label}{required && <span aria-hidden="true" style={{ color: "#dc2626" }}> *</span>}</label>
      <input id={id} required={required} aria-invalid={!!error} aria-describedby={describedBy}
        style={{ padding: 8, borderRadius: 8, border: "2px solid " + (error ? "#dc2626" : "#cbd5e1") }} {...rest} />
      {hint && !error && <small id={id + "-hint"} style={{ color: "#64748b" }}>{hint}</small>}
      {error && <small id={id + "-err"} role="alert" style={{ color: "#b91c1c" }}>{error}</small>}
    </div>
  );
}
function App() {
  return (
    <div>
      <Input label="Full name" placeholder="Ritika Sharma" />
      <Input label="Mobile" hint="10 digits, without +91" required inputMode="numeric" />
      <Input label="PIN code" defaultValue="4110" error="PIN code must be 6 digits" />
    </div>
  );
}`,
    },
    {
      task: 'Set up Husky + lint-staged + commitlint in a Vite React project and write the exact commands and config files.',
      hint: 'npx husky init creates .husky/pre-commit; add a commit-msg hook.',
      solution: `npm i -D husky lint-staged @commitlint/cli @commitlint/config-conventional prettier
npx husky init
echo "npx lint-staged" > .husky/pre-commit
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg

// commitlint.config.js
export default {
  extends: ["@commitlint/config-conventional"],
  rules: { "scope-enum": [2, "always", ["auth", "cart", "checkout", "ui", "api", "deps"]] },
};

// package.json (excerpt)
{
  "scripts": { "prepare": "husky", "lint": "eslint .", "format": "prettier --write ." },
  "lint-staged": {
    "*.{js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": "prettier --write"
  }
}

// test it
git commit -m "changes"                       // ✖ rejected by commitlint
git commit -m "feat(cart): add coupon field"  // ✔ accepted`,
    },
  ],
  quiz: [
    { question: 'In Storybook CSF3, what is each named export of a *.stories.jsx file?', options: ['A story', 'A decorator', 'An addon', 'A test runner'], answer: 0, explanation: 'The default export is meta; each named export is one story.' },
    { question: 'Which commit message follows Conventional Commits?', options: ['Fixed the cart bug.', 'fix(cart): prevent negative quantity', 'FIX - cart', 'cart: fixed'], answer: 1, explanation: 'Format: type(scope): lower-case subject without a full stop.' },
    { question: 'A commit "feat(ui)!: rename Button prop" should produce which version bump?', options: ['Patch', 'Minor', 'Major', 'None'], answer: 2, explanation: 'The ! marks a breaking change, which is a major version.' },
    { question: 'What does lint-staged do?', options: ['Deploys the app', 'Writes the changelog', 'Assigns reviewers', 'Runs linters/formatters only on staged files before commit'], answer: 3, explanation: 'It keeps pre-commit checks fast by processing only staged files.' },
    { question: 'Which review comment is the most helpful?', options: ['"This is bad."', '"Rewrite this."', '"blocking: items[0] crashes when the cart is empty; render <EmptyCart /> first?"', '"Why?"'], answer: 2, explanation: 'It is specific, explains the impact, marks severity and suggests a fix.' },
  ],
};
