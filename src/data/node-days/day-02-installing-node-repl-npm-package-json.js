export default {
  id: 'day-02-installing-node-repl-npm-package-json',
  title: 'Installing Node, the REPL, Running Scripts, npm, package.json, Scripts and Semantic Versioning',
  module: 'Module 1: Node.js Fundamentals',
  day: 2,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Set up Node.js properly, experiment in the REPL, run scripts with arguments, create a package.json with npm, add npm scripts, install dependencies and understand semantic version ranges like ^ and ~.',
  objectives: [
    'Install Node.js 22 LTS (installer or nvm) and verify node and npm versions',
    'Use the REPL and node -e / node -p for quick experiments',
    'Run scripts and read command-line arguments with process.argv',
    'Create and understand package.json, dependencies vs devDependencies, package-lock.json and node_modules',
    'Write npm scripts and read semver ranges (^, ~, exact, latest)',
  ],
  theory: [
    {
      heading: 'Installing Node.js the right way',
      content:
        'Download the **LTS** version (Node.js 22) from **nodejs.org**. The installer also installs **npm** (Node Package Manager) and **npx** (runs package binaries without installing them globally).\n\nProfessional developers usually install Node through a **version manager**, because different projects need different Node versions:\n\n- **nvm** (macOS / Linux) or **nvm-windows** / **fnm** (Windows)\n- `nvm install 22` installs Node 22, `nvm use 22` switches to it, `nvm ls` lists installed versions\n- A `.nvmrc` file containing `22` lets teammates run `nvm use` and get the same version\n\nAnalogy: nvm is like having several **keys on one key ring**: you pick the right Node version for each project door.',
      syntax:
        '# verify the installation\nnode -v      # e.g. v22.x.x\nnpm -v       # e.g. 10.x.x\n\n# with nvm\nnvm install 22\nnvm use 22\nnode -v',
      tip: 'Avoid `sudo npm install -g` on Linux/macOS. If global installs need sudo, use nvm instead: it installs Node in your home folder so no admin rights are needed.',
    },
    {
      heading: 'The REPL and quick one-liners',
      content:
        '**REPL** stands for **Read, Eval, Print, Loop**. Type `node` with no file name and you get a `>` prompt. Node reads what you type, evaluates it, prints the result and loops back. It is a calculator and playground for JavaScript.\n\nUseful REPL features:\n\n- `_` holds the result of the last expression\n- **Tab** auto-completes (try `fs.` then Tab)\n- `.help` lists commands, `.editor` opens multi-line mode, `.save file.js` / `.load file.js`, `.exit` (or Ctrl + C twice / Ctrl + D) quits\n- Core modules like `fs`, `path`, `os` are available without `require` inside the REPL\n\nFor one-liners without the REPL: `node -e "code"` **evaluates** code, `node -p "expr"` **evaluates and prints** the result.',
    },
    {
      heading: 'Running scripts and reading arguments',
      content:
        'Save code in a `.js` file and run `node file.js` (the `.js` extension can be omitted: `node file`).\n\nEverything you type after the file name ends up in **process.argv**, an array of strings:\n\n- `process.argv[0]`: path to the node executable\n- `process.argv[1]`: path to your script\n- `process.argv[2]` onwards: your own arguments\n\nSo the usual pattern is `const args = process.argv.slice(2);`. Arguments are **always strings**, so convert numbers with `Number()`.\n\nUseful flags: `node --watch app.js` restarts on file changes (built in since Node 18/22), `node --env-file=.env app.js` loads environment variables (Day 4).',
    },
    {
      heading: 'npm and package.json',
      content:
        '**npm** is the default package manager and the world\'s largest software registry (npmjs.com). A **package** is a folder of reusable code with a `package.json`.\n\n`npm init` asks questions and creates **package.json**; `npm init -y` accepts all defaults. package.json is the project\'s **ID card**: name, version, entry file (`main`), `scripts`, `dependencies`, `devDependencies`, `type` (commonjs or module), `engines` and more.\n\nInstalling packages:\n\n- `npm install express` (or `npm i express`): adds to **dependencies** (needed at runtime)\n- `npm i -D nodemon`: adds to **devDependencies** (only needed while developing / testing)\n- `npm i -g pkg`: global install for CLI tools (prefer `npx pkg` instead)\n- `npm uninstall express`, `npm update`, `npm outdated`, `npm ls`\n- `npm install` (no name) installs everything listed in package.json\n\nnpm also creates **node_modules/** (the downloaded code; never commit it, add it to `.gitignore`) and **package-lock.json** (exact versions of every installed package and sub-package; ALWAYS commit it so the whole team and the server get identical versions). On CI servers use `npm ci` for a clean, exact install from the lock file.',
      points: [
        'Analogy: package.json is your shopping list; package-lock.json is the receipt with exact brands and weights; node_modules is the full fridge',
        'You can delete node_modules any time and get it back with npm install',
        'Alternatives to npm: pnpm, Yarn, Bun (same package.json format)',
      ],
    },
    {
      heading: 'npm scripts',
      content:
        'The `scripts` section of package.json stores named commands, so the whole team runs the project the same way:\n\n- `npm start` runs the `start` script and `npm test` runs `test` (no `run` needed for these two)\n- Any other script needs `npm run <name>`, e.g. `npm run dev`\n- Scripts can use binaries from `node_modules/.bin` directly (e.g. `nodemon`, `jest`) without a global install\n- Pass extra arguments after `--`: `npm run greet -- Asha`\n- `pre` and `post` hooks: a script called `prebuild` runs automatically before `build`',
      syntax:
        '"scripts": {\n  "start": "node server.js",\n  "dev": "node --watch server.js",\n  "test": "node --test"\n}',
    },
    {
      heading: 'Semantic Versioning (semver)',
      content:
        'Versions follow **MAJOR.MINOR.PATCH**, e.g. `5.1.0`:\n\n- **MAJOR**: breaking changes (Express 4 → 5)\n- **MINOR**: new features, backward compatible\n- **PATCH**: bug fixes only\n\nRanges in package.json:\n\n- `^4.18.2` (caret, the npm default): allows **minor and patch** updates, `>=4.18.2 <5.0.0`\n- `~4.18.2` (tilde): allows **patch** updates only, `>=4.18.2 <4.19.0`\n- `4.18.2`: exact version only\n- `*` or `latest`: anything (dangerous)\n- Special rule: for `0.x` versions, `^0.2.3` means `>=0.2.3 <0.3.0` because 0.x is considered unstable\n\nAnalogy: `^` says "any newer model of this phone generation", `~` says "only software updates of this exact model".',
    },
  ],
  examples: [
    {
      title: 'Checking versions, one-liners and a REPL session',
      scenario: 'Verify the installation and try JavaScript quickly without creating a file.',
      steps: [
        'Open a terminal (Command Prompt, PowerShell or Terminal)',
        'Run `node -v` and `npm -v`',
        'Try `node -e` (evaluate) and `node -p` (evaluate and print)',
        'Start the REPL with `node`, type the three lines, then `.exit` (here the lines are piped in with printf to record the session)',
      ],
      code: "node -v\nnpm -v\nnode -e \"console.log('Hello from node -e')\"\nnode -p \"Math.max(3, 9, 4) * 2\"\n\n# REPL session (normally you type these lines after running `node`)\nprintf '1 + 2\\nconst marks = [70, 85, 90]\\nmarks.map(m => m + 5)\\n_.length\\n.exit\\n' | node -i",
      result: "v24.13.0\n11.6.2\nHello from node -e\n18\nWelcome to Node.js v24.13.0.\nType \".help\" for more information.\n> 3\n> undefined\n> [ 75, 90, 95 ]\n> 3\n>",
      explanation:
        '`node -v` / `npm -v` print the installed versions (yours may differ; use Node 22 LTS or newer). `-e` only runs code, so you need console.log; `-p` prints the value of the expression automatically. In the REPL each expression result is printed after `>`; `const` declarations print `undefined`, and `_` holds the last result (the mapped array), so `_.length` is 3.',
    },
    {
      title: 'Reading command-line arguments with process.argv',
      scenario: 'Build a small calculator CLI: `node calc.js add 10 5`.',
      steps: [
        'Create `calc.js` with the code below',
        'Run `node calc.js add 10 5`',
        'Try `mul`, `sub` and a wrong operation too',
      ],
      code: "// calc.js   run: node calc.js add 10 5\nconst [op, a, b] = process.argv.slice(2); // skip node path and script path\nconst x = Number(a);\nconst y = Number(b);\n\nconsole.log('Raw arguments:', process.argv.slice(2));\nconsole.log('Types:', typeof a, typeof x);\n\nconst ops = {\n  add: (p, q) => p + q,\n  sub: (p, q) => p - q,\n  mul: (p, q) => p * q,\n};\n\nif (!ops[op]) {\n  console.log('Usage: node calc.js <add|sub|mul> <a> <b>');\n  process.exit(1);\n}\nconsole.log(`${x} ${op} ${y} = ${ops[op](x, y)}`);",
      result: "$ node calc.js add 10 5\nRaw arguments: [ 'add', '10', '5' ]\nTypes: string number\n10 add 5 = 15",
      explanation:
        '`process.argv.slice(2)` returns only your arguments. They arrive as strings ("10"), so `Number()` converts them; without it `"10" + "5"` would give "105". `process.exit(1)` ends the program with a non-zero exit code, which signals failure to the shell and CI tools.',
    },
    {
      title: 'Creating package.json with npm init -y',
      scenario: 'Start a new Node project the standard way and inspect the generated file.',
      steps: [
        'Create and enter an empty folder: `mkdir my-api && cd my-api`',
        'Run `npm init -y`',
        'Open package.json (here we print it with cat)',
        'Run `npm pkg set` to edit fields from the command line',
      ],
      code: "npm init -y > /dev/null\nnpm pkg set description=\"My first Node API\" scripts.start=\"node index.js\"\ncat package.json",
      result: "{\n  \"name\": \"my-api\",\n  \"version\": \"1.0.0\",\n  \"description\": \"My first Node API\",\n  \"main\": \"index.js\",\n  \"scripts\": {\n    \"test\": \"echo \\\"Error: no test specified\\\" && exit 1\",\n    \"start\": \"node index.js\"\n  },\n  \"keywords\": [],\n  \"author\": \"\",\n  \"license\": \"ISC\",\n  \"type\": \"commonjs\"\n}",
      explanation:
        '`npm init -y` uses the folder name as `name`, `1.0.0` as `version` and `index.js` as `main`. `npm pkg set` safely edits package.json from the terminal (you can also edit it by hand; it must stay valid JSON, so no comments and no trailing commas). The `type` field `commonjs` means `.js` files use `require` (Day 3 covers ES Modules).',
    },
    {
      title: 'npm scripts with arguments and pre-hooks',
      scenario: 'Add `greet`, `pregreet` and `start` scripts and run them with npm.',
      steps: [
        'Create `greet.js` that prints a greeting for the first argument',
        'Add the scripts to package.json',
        'Run `npm start` and `npm run greet -- Asha`',
        'Notice that `pregreet` runs automatically before `greet`',
      ],
      code: "# File: greet.js\nconst name = process.argv[2] || 'World';\nconsole.log(`Hello, ${name}!`);\n\n# File: package.json\n{\n  \"name\": \"scripts-demo\",\n  \"version\": \"1.0.0\",\n  \"scripts\": {\n    \"start\": \"node greet.js\",\n    \"pregreet\": \"node -p \\\"'Preparing greeting...'\\\"\",\n    \"greet\": \"node greet.js\"\n  }\n}\n\n# Terminal\nnpm start\nnpm run greet -- Asha",
      result: "\n> scripts-demo@1.0.0 start\n> node greet.js\n\nHello, World!\n\n> scripts-demo@1.0.0 pregreet\n> node -p \"'Preparing greeting...'\"\n\nPreparing greeting...\n\n> scripts-demo@1.0.0 greet\n> node greet.js Asha\n\nHello, Asha!",
      explanation:
        'npm prints a header (`> package@version script` and the command) before running each script. `npm start` needs no `run`. Arguments after `--` are appended to the command, so `greet.js` receives "Asha". Because a script named `pregreet` exists, npm runs it automatically before `greet`.',
    },
    {
      title: 'Installing a dependency and testing semver ranges',
      scenario: 'Install the real `semver` package (the same library npm uses) and check which versions ^ and ~ accept.',
      steps: [
        'In a new folder run `npm init -y` and `npm install semver@7`',
        'Create `ranges.js` with the code below',
        'Run `node ranges.js`',
      ],
      code: "# File: ranges.js\nconst semver = require('semver');\nconst versions = ['4.17.0', '4.18.2', '4.18.3', '4.21.2', '5.0.0'];\nfor (const range of ['^4.18.2', '~4.18.2', '4.18.2']) {\n  const ok = versions.filter(v => semver.satisfies(v, range));\n  console.log(range.padEnd(8), '->', ok.join(', ') || 'none');\n}\nconsole.log('^0.2.3 allows 0.3.0?', semver.satisfies('0.3.0', '^0.2.3'));\n\n# Terminal\nnpm init -y > /dev/null\nnpm install semver@7 --silent\nnode -p \"require('./package.json').dependencies\"\nnode ranges.js",
      result: "{ semver: '^7.8.6' }\n^4.18.2  -> 4.18.2, 4.18.3, 4.21.2\n~4.18.2  -> 4.18.2, 4.18.3\n4.18.2   -> 4.18.2\n^0.2.3 allows 0.3.0? false",
      explanation:
        '`npm install semver@7` saved `"semver": "^7.x.x"` in dependencies (caret by default). The script shows that `^4.18.2` accepts minor and patch updates but not 5.0.0, `~4.18.2` only accepts 4.18.x patches, and the exact version accepts only itself. For 0.x versions the caret is stricter, so 0.3.0 is rejected.',
    },
  ],
  interview: [
    { q: 'What is npm?', a: 'npm (Node Package Manager) is the default package manager for Node.js. It is a CLI to install, update and publish packages and also the public registry (npmjs.com) that hosts them.', level: 'Easy' },
    { q: 'What is package.json and what does it contain?', a: 'The manifest of a Node project: name, version, description, main entry, type (commonjs/module), scripts, dependencies, devDependencies, engines, license, repository, etc. npm reads it to install packages and run scripts.', level: 'Easy' },
    { q: 'Difference between dependencies and devDependencies?', a: 'dependencies are needed at runtime in production (express, mongoose). devDependencies are only needed during development or testing (nodemon, jest, eslint). `npm install --omit=dev` (or NODE_ENV=production) skips devDependencies.', level: 'Easy' },
    { q: 'What is package-lock.json and should it be committed?', a: 'It records the exact resolved version and integrity hash of every installed package, including nested ones, so installs are reproducible. Yes, always commit it; never commit node_modules.', level: 'Medium' },
    { q: 'Difference between npm install and npm ci?', a: 'npm install resolves ranges from package.json and may update package-lock.json. npm ci deletes node_modules and installs exactly what package-lock.json says; it fails if package.json and the lock file disagree. npm ci is faster and deterministic, ideal for CI/CD.', level: 'Medium' },
    { q: 'Explain ^ and ~ in version ranges.', a: '^1.4.2 allows minor and patch updates (>=1.4.2 <2.0.0). ~1.4.2 allows only patch updates (>=1.4.2 <1.5.0). For 0.x versions the caret only allows patch updates, e.g. ^0.4.2 means <0.5.0.', level: 'Medium' },
    { q: 'What is semantic versioning?', a: 'A versioning scheme MAJOR.MINOR.PATCH: increase MAJOR for breaking changes, MINOR for backward-compatible features and PATCH for backward-compatible bug fixes.', level: 'Easy' },
    { q: 'What is the REPL?', a: 'Read-Eval-Print-Loop: an interactive Node shell started with `node`. It evaluates JavaScript line by line, prints results, supports Tab completion, the `_` last-result variable and dot commands like .help, .editor, .save, .load and .exit.', level: 'Easy' },
    { q: 'What is the difference between npm and npx?', a: 'npm installs and manages packages. npx executes a package binary: either from local node_modules/.bin or by temporarily downloading it, e.g. `npx create-vite@latest`, without a global install.', level: 'Medium' },
    { q: 'How do you read command-line arguments in Node?', a: 'With process.argv, an array where index 0 is the node executable, index 1 the script path and the rest are user arguments, so `process.argv.slice(2)`. For complex CLIs use util.parseArgs (built in) or packages like commander/yargs.', level: 'Easy' },
    { q: 'Why use nvm?', a: 'To install and switch between multiple Node versions per project without admin rights, and to pin a version with a .nvmrc file so the team uses the same runtime.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a project folder `practice-02`, run `npm init -y`, then use `npm pkg set` to set the description to "Practice project" and add a `start` script that runs `node index.js`. Create index.js that prints "Started!" and run `npm start`.',
      hint: 'npm pkg set key=value works for nested keys like scripts.start.',
      solution: "mkdir practice-02 && cd practice-02\nnpm init -y\nnpm pkg set description=\"Practice project\" scripts.start=\"node index.js\"\necho \"console.log('Started!')\" > index.js\nnpm start\n# > practice-02@1.0.0 start\n# > node index.js\n#\n# Started!",
    },
    {
      task: 'Write `bmi.js` that takes weight (kg) and height (m) as arguments and prints the BMI with 1 decimal place. Print a usage message and exit with code 1 if arguments are missing.',
      hint: 'Number(process.argv[2]); BMI = weight / (height * height); toFixed(1).',
      solution: "// node bmi.js 70 1.75  -> BMI: 22.9\nconst [w, h] = process.argv.slice(2).map(Number);\nif (!w || !h) {\n  console.log('Usage: node bmi.js <weightKg> <heightM>');\n  process.exit(1);\n}\nconsole.log('BMI:', (w / (h * h)).toFixed(1));",
    },
    {
      task: 'For each range, list which of these versions match: 2.3.0, 2.4.1, 2.9.0, 3.0.0. Ranges: ^2.4.0, ~2.4.0, 2.4.1, >=2.4.0 <3.0.0.',
      hint: 'Caret allows minor, tilde allows patch only.',
      solution: "^2.4.0         -> 2.4.1, 2.9.0\n~2.4.0         -> 2.4.1\n2.4.1          -> 2.4.1\n>=2.4.0 <3.0.0 -> 2.4.1, 2.9.0   (same as ^2.4.0)",
    },
    {
      task: 'Install `nodemon` as a dev dependency and add a `dev` script that uses it. Also add a `dev:native` script that uses Node\'s built-in watch mode.',
      hint: 'npm i -D nodemon; scripts can call local binaries directly.',
      solution: "npm i -D nodemon\n\n// package.json\n\"scripts\": {\n  \"start\": \"node index.js\",\n  \"dev\": \"nodemon index.js\",\n  \"dev:native\": \"node --watch index.js\"\n}\n\n// run with: npm run dev   or   npm run dev:native",
    },
    {
      task: 'Write the `.gitignore` and `.nvmrc` files a new Node project should have, and explain in one line why node_modules is ignored but package-lock.json is not.',
      hint: 'node_modules can be recreated; the lock file guarantees identical installs.',
      solution: "# .gitignore\nnode_modules/\n.env\n*.log\n\n# .nvmrc\n22\n\n# node_modules is huge and can be rebuilt with `npm ci`; package-lock.json must be committed so everyone gets the exact same versions.",
    },
  ],
  quiz: [
    { question: 'Which command creates package.json with default values?', options: ['npm start', 'npm init -y', 'npm install -g', 'node init'], answer: 1, explanation: 'npm init -y creates package.json accepting all defaults.' },
    { question: 'Which versions does "^1.2.3" allow?', options: ['Only 1.2.3', '>=1.2.3 <1.3.0', '>=1.2.3 <2.0.0', 'Any version'], answer: 2, explanation: 'The caret allows minor and patch updates but not a new major version.' },
    { question: 'Which script can be run WITHOUT the word "run"?', options: ['dev', 'build', 'lint', 'start'], answer: 3, explanation: 'npm start and npm test are shortcuts; other scripts need npm run <name>.' },
    { question: 'What is process.argv[2] when you run "node app.js hello world"?', options: ['"hello"', '"app.js"', '"world"', 'The node executable path'], answer: 0, explanation: 'Index 0 is node, 1 is the script, 2 is the first user argument.' },
    { question: 'Which file should NOT be committed to Git?', options: ['package.json', 'package-lock.json', 'node_modules/', '.nvmrc'], answer: 2, explanation: 'node_modules is large and can always be recreated from package.json and the lock file.' },
  ],
};
