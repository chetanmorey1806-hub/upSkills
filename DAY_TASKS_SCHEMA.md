# Day Task files (timed, auto-graded practice for every lesson)

Every lesson (day) gets ONE task file. Students open the lesson's **📝 Day Task** tab, start a timer, solve the
tasks in the browser and press **Submit all**. Each task is graded automatically and every wrong answer is
explained (which check failed + `explain` + the correct answer / model solution).

## Where
`src/data/day-tasks/<trackKey>/<lessonId>.js` — `trackKey` is the key in `src/data/index.js` (e.g. `html`, `css`,
`js`, `python`, `corejava`, `excel`, `powerbi`, `dotnet` …). `lessonId` = the lesson file's `id` (= its file name
without `.js`). Example: `src/data/day-tasks/html/day-01-introduction-to-html.js` (a finished reference file — read it).

## File format (plain ES module, no imports)
```js
export default {
  lesson: 'day-01-introduction-to-html',   // = file name
  minutes: 20,                              // realistic total time (15-40 for most days)
  intro: 'One sentence: what the student practises today.',
  tasks: [ /* 5-8 tasks, ONLY about this day's topic (+ earlier days if needed), easy → harder */ ],
};
```
Every task has: `type`, `q` (the task text; markdown-ish: `code`, **bold**, "- " bullets, "1. " lists),
`explain` (teach WHY the right answer is right and what the common mistake is), optional `mins` (estimate) and
optional `example: { title, text?, code? }` (a small worked example shown above the task — use it on every
hands-on task so students see how to approach it, but do not give away the exact answer).

### Task types
| type | fields | graded by |
|---|---|---|
| `mcq` | `options: [..4]`, `answer: index` | exact choice |
| `multi` | `options: [...]`, `answers: [indexes]` | exact set (missing / extra choices are listed) |
| `fill` | `accept: ['ans', 'variant']`, optional `acceptRegex: ['^...$']`, `caseSensitive` | normalised text (spaces around `(){}[];,=<>:` ignored, case-insensitive by default). Give ALL reasonable variants. |
| `output` | `code` (shown), `expected` | student types the exact output (lines trimmed). `expected` MUST be the real output: run it (node / python3), or for Java/C# run the same logic in JS/Python. Keep it short and deterministic. |
| `written` | `rules: [{ any:[..] \| all:[..] \| regex:'..' \| not:[..], msg }]`, `minWords`, `maxWords`, `sample` | every rule must pass. `msg` says what is required. Use for soft skills, prompts, explanations, emails. |
| `code` | `lang`, `starter`, `solution`, + lang fields below | runs/inspects the student's code |

### `code` languages
- `html` — student writes body HTML (or a full document). `checks: [...]`, optional `css`, `libs: ['bootstrap','bootstrap-icons']`.
- `css` — `html` is GIVEN (shown to the student), student writes CSS. `checks` use computed styles.
- `dom` — `html` (+ `css`) given, student writes browser JavaScript. Optional `actions` run before checks:
  `[{ click: '#btn' }, { input: ['#name', 'Asha'] }, { check: '#agree' }, { submit: 'form' }, { wait: 300 }]`. `libs: ['vue']` for Vue tasks (global `Vue`).
- `jsx` — React: student writes `function App() {...}` (React 18 global, `const { useState } = React;`, NO imports). `actions` + `checks` after render.
- DOM checks (html/css/dom/jsx): `{ sel, msg, count?, min?, max?, notExists?, nonEmpty?, text? (substring, case-insens), textEq?, attr?: { name, value? | includes? }, style?: { 'css-prop': 'value' }, prop?: { checked: true }, index? }`.
  `msg` is shown when the check fails, so write it as the requirement: "The <img> needs an alt attribute".
- `js` — plain JavaScript (no DOM). `tests: [{ call: 'sum(2, 3)', expect: 5 }, { log: 'expected console output' }]` (deep-equal; `log` = everything printed by console.log, joined by newlines). Optional `msg` per test.
- `python` — `tests: [{ call: 'square(3)', expect: 9 }, { stdout: 'printed output' }]`, optional `stdin: 'line1\nline2'` for `input()`. Runs real Python 3.12 (Pyodide; numpy/pandas/scikit-learn available, no network, no files outside the working dir).
- `sql` (SQLite), `mysql` (MySQL syntax), `tsql` (SQL Server syntax) — `setup` (CREATE TABLE + INSERT, shown to the student), `solution` query. The student's result rows are compared with the solution's rows (`ordered: true` when ORDER BY matters). For INSERT/UPDATE/DELETE tasks add `check: 'SELECT ... '` (compared after both run). For mysql/tsql a database `practice` is created and selected automatically — do NOT write CREATE DATABASE/USE in `setup`.
- `mongo` — `dataset: 'shop' | 'college' | 'blog'` (see `src/data/mongoDatasets.js`), `solution` (mongosh code), optional `check`, `ordered`.
- `excel` — `grid: { A1: 'Item', B1: 'Price', A2: 'Pen', B2: '10', ... }` (all values as strings), `solution: '=SUM(B2:B5)'`; the student's formula value is compared. Check the function is supported: `src/engine/excel.js` (`SUPPORTED`).
- `dax` — `solution: 'SUM(Sales[Quantity])'` over the DAX Lab model (`src/engine/daxModel.js`: Sales, Product, Customer, Date) and compared in many filter contexts; optional `measures: { 'Total Sales': '...' }` the student may reference.
- `express` — Express 5 app (API Lab simulator, `require('express')` only), `tests` in the MERN project format:
  `[{ name, steps: [{ method, url, body?, headers?, expect: { status, json (partial), length } }] }]`.
- Java, C#, Spring, Hibernate, Power Query (M), Next.js server code, Docker, Git etc. cannot run in the browser:
  use `mcq`, `multi`, `fill` (e.g. "complete the missing line" with all valid variants) and `output` (predict the output) for those.

## Quality rules
- 5-8 tasks per day. Mix: 2-3 quick concept checks (mcq/multi/fill), 1 output or fill-the-code, and 2-4 HANDS-ON tasks
  graded by running/inspecting code wherever a grader exists for the technology. Real-world scenarios (students, shop, employees, Indian context).
- Stay on THIS day's topic. Do not require things taught in later days.
- `starter` must NOT pass (leave TODOs). The `solution`/answers MUST pass. Write checks that accept any correct approach (check behaviour/result, not exact formatting).
- `explain` is mandatory and teaches: why the correct answer is right + the typical mistake.
- Strings: prefer template literals for multi-line code; escape backticks and `${` inside them (\` and \${).

## Verify (mandatory)
A dev server must be running on port 5199 (the coordinator keeps it running). Then:
```
node /tmp/claude-1000/-home-stn-Pictures-DayWise-EXcel-And-PoweBI/99e5cdd5-5346-42f0-8d7f-63fb11a0a32f/scratchpad/verify-day-tasks.mjs <trackKey> [lessonId1,lessonId2]
```
It loads each file in a real browser and grades every model answer with the real in-app grader (must pass), checks
that each `starter` fails, and validates the schema. Fix every ✗ until it prints `ALL OK`. Verify in batches of
5-10 lessons with the second argument (faster), and the whole track at the end.
