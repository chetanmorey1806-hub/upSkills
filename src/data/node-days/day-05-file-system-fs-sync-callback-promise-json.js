export default {
  id: 'day-05-file-system-fs-sync-callback-promise-json',
  title: 'File System (fs): Sync, Callback and Promise APIs, Reading and Writing JSON Files',
  module: 'Module 1: Node.js Fundamentals',
  day: 5,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Read, write, append, list, rename and delete files and folders with the fs module in all three styles (synchronous, callback and promise / async-await), handle file errors properly, and build a small JSON-file "database".',
  objectives: [
    'Know the three fs API styles and when each is appropriate',
    'Read and write text files, append data, create and list folders, rename and delete',
    'Use error-first callbacks and handle error codes like ENOENT and EEXIST',
    'Use fs/promises with async / await and Promise.all',
    'Store and update data in a JSON file safely (read, parse, modify, stringify, write)',
  ],
  theory: [
    {
      heading: 'The fs module and its three API styles',
      content:
        'The **fs** (file system) module lets Node work with files and folders. Every operation exists in up to three flavours:\n\n1. **Synchronous**: `fs.readFileSync()` blocks the thread until done. Simple; errors are thrown, so use try / catch.\n2. **Callback**: `fs.readFile(path, cb)` returns immediately and calls `cb(err, data)` later (**error-first callback**: the first argument is always the error or null).\n3. **Promise**: `require(\'node:fs/promises\')` or `fs.promises`, e.g. `await fsp.readFile(path)`. Non-blocking AND readable; the modern default.\n\nWhen to use which:\n\n- **Sync**: startup code (loading a config file once), CLI scripts, build tools\n- **Promise / async-await**: everything inside a running server (request handlers) so you never block other users\n- **Callback**: older code bases and a few streaming / watcher APIs\n\nAnalogy: sync is **standing at the counter** until your coffee is ready; callback is **leaving your phone number** to be called; promise is getting a **token** you can `await`.',
      syntax:
        "const fs = require('node:fs');            // sync + callback\nconst fsp = require('node:fs/promises');  // promises\n// ESM: import { readFile } from 'node:fs/promises';",
    },
    {
      heading: 'Reading and writing files',
      content:
        '- `readFile(path, \'utf8\')` returns a **string**; without an encoding it returns a **Buffer** (raw bytes, Day 7)\n- `writeFile(path, data)` creates the file or **replaces** its content\n- `appendFile(path, data)` adds to the end (great for logs)\n- Flags: `{ flag: \'a\' }` append, `{ flag: \'wx\' }` write only if the file does NOT exist (fails with EEXIST)\n- `copyFile(src, dest)`, `rename(old, new)` (also moves files), `unlink(path)` deletes a file\n- `rm(path, { recursive: true, force: true })` deletes folders or files (like `rm -rf`)\n\nAll functions accept paths relative to `process.cwd()`. For project files, build paths with `path.join(__dirname, ...)` (Day 4).',
    },
    {
      heading: 'Folders and file information',
      content:
        '- `mkdir(path, { recursive: true })` creates nested folders and does not fail if they already exist\n- `readdir(path)` lists names; `{ withFileTypes: true }` returns Dirent objects with `isFile()` / `isDirectory()`; `{ recursive: true }` (Node 20+) lists every nested file\n- `stat(path)` returns size, `isFile()`, `isDirectory()`, `mtime` (last modified) and more\n- `existsSync(path)` quick check (the async `exists` is deprecated; with promises use `access()` or just try the operation and catch ENOENT)\n- `cp(src, dest, { recursive: true })` copies whole folders\n- `watch(path)` reacts to changes (used by tools like nodemon)',
    },
    {
      heading: 'Handling errors: ENOENT, EEXIST, EACCES',
      content:
        'File operations fail often: missing file, no permission, disk full. Errors carry a **code**:\n\n- `ENOENT`: no such file or directory\n- `EEXIST`: file already exists (e.g. with flag `wx` or `mkdir` without recursive)\n- `EACCES` / `EPERM`: permission denied\n- `EISDIR`: expected a file but got a directory\n- `ENOTEMPTY`: tried to remove a non-empty folder\n\nRules:\n\n1. **Sync**: wrap in try / catch\n2. **Callback**: always check `if (err)` first and `return` after handling it\n3. **Promise**: use try / catch around `await` (or `.catch()`)\n4. Check `err.code` to react differently (missing file → create defaults; permission error → log and stop)\n\nAvoid the "check then act" pattern (`if (exists) read`): the file can change in between (a race condition). Just try the operation and handle the error.',
    },
    {
      heading: 'JSON files as simple storage',
      content:
        'JSON files are handy for config, seed data and small prototypes (we use real databases from Day 17).\n\n- **Read**: `JSON.parse(await fsp.readFile(file, \'utf8\'))`\n- **Write**: `await fsp.writeFile(file, JSON.stringify(data, null, 2))` (the `2` pretty-prints with 2 spaces)\n- If the file does not exist yet, catch ENOENT and start with an empty array\n- `require(\'./data.json\')` also loads JSON, but only **once** (it is cached), so never use it for data that changes at runtime\n- In ESM: `import data from \'./data.json\' with { type: \'json\' }`\n\nAnalogy: a JSON file is a **notebook**: to change one line you read the whole page, edit it and write the page back. That is fine for small data but slow and unsafe with many simultaneous writers, which is why real apps use databases.',
      tip: 'Write to a temporary file first and then `rename` it over the real file. Rename is atomic on most systems, so a crash mid-write cannot leave a half-written, corrupted JSON file.',
    },
  ],
  examples: [
    {
      title: 'Synchronous API: files and folders step by step',
      scenario: 'A setup script creates a folder structure, writes and appends to a log, inspects and cleans up files.',
      steps: [
        'Create `sync.js` and run `node sync.js`',
        'Watch each operation in order (sync code runs top to bottom)',
        'Notice how the missing-file error is caught with try / catch',
      ],
      code: "// sync.js\nconst fs = require('node:fs');\nconst path = require('node:path');\n\nconst dir = path.join(__dirname, 'logs', '2025');\nfs.mkdirSync(dir, { recursive: true });                 // nested folders\n\nconst file = path.join(dir, 'app.log');\nfs.writeFileSync(file, 'Server started\\n');            // create / replace\nfs.appendFileSync(file, 'User Asha logged in\\n');      // add to end\nfs.appendFileSync(file, 'User Ravi logged in\\n');\n\nconsole.log(fs.readFileSync(file, 'utf8'));\nconsole.log('Buffer without encoding:', fs.readFileSync(file).subarray(0, 6));\nconsole.log('size:', fs.statSync(file).size, 'bytes | isFile:', fs.statSync(file).isFile());\nconsole.log('in logs/2025:', fs.readdirSync(dir));\n\nfs.renameSync(file, path.join(dir, 'old.log'));\nconsole.log('after rename:', fs.readdirSync(dir), '| app.log exists?', fs.existsSync(file));\n\ntry {\n  fs.readFileSync(path.join(dir, 'missing.txt'), 'utf8');\n} catch (err) {\n  console.log('Caught:', err.code);\n}\n\nfs.rmSync(path.join(__dirname, 'logs'), { recursive: true, force: true });\nconsole.log('cleaned up, logs exists?', fs.existsSync(path.join(__dirname, 'logs')));",
      result: "Server started\nUser Asha logged in\nUser Ravi logged in\n\nBuffer without encoding: <Buffer 53 65 72 76 65 72>\nsize: 55 bytes | isFile: true\nin logs/2025: [ 'app.log' ]\nafter rename: [ 'old.log' ] | app.log exists? false\nCaught: ENOENT\ncleaned up, logs exists? false",
      explanation:
        'Each sync call finishes before the next starts, so the order is guaranteed. `mkdirSync` with `recursive` creates both folders. Reading without an encoding gives a Buffer of bytes (`53 65 72...` are the letters "Ser..."). Errors are thrown, so try / catch handles the missing file and `err.code` tells us why. `rmSync` with `recursive` and `force` removes the whole tree.',
    },
    {
      title: 'Callback API: error-first callbacks',
      scenario: 'Write a file, then read it, then delete it using callbacks, and handle a missing-file error.',
      steps: [
        'Create `callbacks.js` and run `node callbacks.js`',
        'Notice "Started all operations" prints first',
        'Notice the nesting: each step starts inside the previous callback (the start of "callback hell")',
      ],
      code: "// callbacks.js\nconst fs = require('node:fs');\n\nfs.readFile('does-not-exist.txt', 'utf8', (err, data) => {\n  if (err) {\n    console.log('Error-first callback ->', err.code, '| data is', data);\n    return; // stop here\n  }\n  console.log(data);\n});\n\nfs.writeFile('note.txt', 'Callbacks run later', err => {\n  if (err) return console.error(err);\n  console.log('1) written');\n  fs.readFile('note.txt', 'utf8', (err, text) => {\n    if (err) return console.error(err);\n    console.log('2) read:', text);\n    fs.unlink('note.txt', err => {\n      if (err) return console.error(err);\n      console.log('3) deleted');\n    });\n  });\n});\n\nconsole.log('Started all operations');",
      result: "Started all operations\nError-first callback -> ENOENT | data is undefined\n1) written\n2) read: Callbacks run later\n3) deleted",
      explanation:
        'Callbacks always receive `(err, result)`. When something fails, `err` is an Error object and the result is undefined, so we check `err` first and return. Because the operations are asynchronous, the synchronous log prints first. The write → read → delete chain must be nested, which quickly becomes hard to read; the promise API solves that.',
    },
    {
      title: 'Promise API with async / await',
      scenario: 'Create three report files in parallel, list them with types and sizes, then read them all back.',
      steps: [
        'Create `promises.js` and run `node promises.js`',
        'Use `node:fs/promises` and an async main function',
        'Use Promise.all to run independent file operations at the same time',
      ],
      code: "// promises.js\nconst fsp = require('node:fs/promises');\nconst path = require('node:path');\n\nasync function main() {\n  const dir = path.join(__dirname, 'reports');\n  await fsp.mkdir(path.join(dir, 'archive'), { recursive: true });\n\n  const months = ['jan', 'feb', 'mar'];\n  await Promise.all(\n    months.map((m, i) => fsp.writeFile(path.join(dir, `${m}.txt`), `Sales for ${m}: ${(i + 1) * 1000}`))\n  );\n\n  const entries = await fsp.readdir(dir, { withFileTypes: true });\n  entries.sort((a, b) => a.name.localeCompare(b.name));\n  for (const e of entries) {\n    const info = await fsp.stat(path.join(dir, e.name));\n    console.log(e.isDirectory() ? 'DIR ' : 'FILE', e.name.padEnd(8), e.isFile() ? info.size + ' bytes' : '');\n  }\n\n  const texts = await Promise.all(months.map(m => fsp.readFile(path.join(dir, `${m}.txt`), 'utf8')));\n  console.log(texts);\n\n  try {\n    await fsp.writeFile(path.join(dir, 'jan.txt'), 'overwrite?', { flag: 'wx' });\n  } catch (err) {\n    console.log('wx flag refused to overwrite ->', err.code);\n  }\n\n  await fsp.rm(dir, { recursive: true });\n  console.log('done');\n}\n\nmain().catch(err => {\n  console.error('Unexpected error:', err.message);\n  process.exitCode = 1;\n});",
      result: "DIR  archive  \nFILE feb.txt  19 bytes\nFILE jan.txt  19 bytes\nFILE mar.txt  19 bytes\n[ 'Sales for jan: 1000', 'Sales for feb: 2000', 'Sales for mar: 3000' ]\nwx flag refused to overwrite -> EEXIST\ndone",
      explanation:
        'Each `await` pauses only this async function, not the whole server. `Promise.all` starts the three writes together and waits for all of them. `readdir` with `withFileTypes` returns Dirent objects so we can tell files from folders. The `wx` flag refuses to overwrite an existing file and throws EEXIST, which try / catch handles just like synchronous code.',
    },
    {
      title: 'A JSON file "database" for students',
      scenario: 'Store students in students.json: load (or start empty), add, update and delete records, saving safely each time.',
      steps: [
        'Create `jsonDb.js` and run `node jsonDb.js`',
        'The first load finds no file (ENOENT) and starts with []',
        'Each change is written to a temp file and then renamed (atomic save)',
        'Open students.json afterwards to see the pretty-printed result',
      ],
      code: "// jsonDb.js\nconst fsp = require('node:fs/promises');\nconst path = require('node:path');\n\nconst FILE = path.join(__dirname, 'students.json');\n\nasync function load() {\n  try {\n    return JSON.parse(await fsp.readFile(FILE, 'utf8'));\n  } catch (err) {\n    if (err.code === 'ENOENT') return []; // first run: no file yet\n    throw err;                            // real problem: bubble up\n  }\n}\n\nasync function save(data) {\n  const tmp = FILE + '.tmp';\n  await fsp.writeFile(tmp, JSON.stringify(data, null, 2));\n  await fsp.rename(tmp, FILE); // atomic replace\n}\n\nasync function main() {\n  let students = await load();\n  console.log('Loaded:', students);\n\n  students.push({ id: 1, name: 'Asha', marks: 82 }, { id: 2, name: 'Ravi', marks: 67 });\n  students.push({ id: 3, name: 'Meera', marks: 91 });\n  await save(students);\n\n  students = await load();\n  students.find(s => s.id === 2).marks = 75;    // update\n  students = students.filter(s => s.id !== 3);  // delete\n  await save(students);\n\n  console.log('Final file content:');\n  console.log(await fsp.readFile(FILE, 'utf8'));\n  const avg = students.reduce((sum, s) => sum + s.marks, 0) / students.length;\n  console.log('Average marks:', avg);\n}\n\nmain();",
      result: "Loaded: []\nFinal file content:\n[\n  {\n    \"id\": 1,\n    \"name\": \"Asha\",\n    \"marks\": 82\n  },\n  {\n    \"id\": 2,\n    \"name\": \"Ravi\",\n    \"marks\": 75\n  }\n]\nAverage marks: 78.5",
      explanation:
        'The load / modify / save cycle is the core pattern for JSON storage. Missing file is not an error for us (ENOENT → empty array), but any other error is re-thrown. `JSON.stringify(data, null, 2)` writes readable, indented JSON. Writing to `students.json.tmp` and renaming protects the real file from half-finished writes.',
    },
    {
      title: 'Mini project: organise a messy folder by file type',
      scenario: 'A Downloads folder has mixed files. Move each into a sub-folder named after its extension and print the final tree.',
      steps: [
        'Create `organise.js` (it creates a sample "downloads" folder first)',
        'Run `node organise.js`',
        'Notice readdir with { recursive: true } listing nested files (Node 20+)',
      ],
      code: "// organise.js\nconst fsp = require('node:fs/promises');\nconst path = require('node:path');\n\nconst root = path.join(__dirname, 'downloads');\n\nasync function createSample() {\n  await fsp.rm(root, { recursive: true, force: true });\n  await fsp.mkdir(root);\n  const names = ['cv.pdf', 'photo.jpg', 'notes.txt', 'invoice.pdf', 'logo.png', 'README'];\n  await Promise.all(names.map(n => fsp.writeFile(path.join(root, n), 'sample')));\n}\n\nasync function organise() {\n  const entries = await fsp.readdir(root, { withFileTypes: true });\n  let moved = 0;\n  for (const entry of entries) {\n    if (!entry.isFile()) continue;\n    const ext = path.extname(entry.name).slice(1).toLowerCase() || 'other';\n    const targetDir = path.join(root, ext);\n    await fsp.mkdir(targetDir, { recursive: true });\n    await fsp.rename(path.join(root, entry.name), path.join(targetDir, entry.name));\n    moved++;\n  }\n  return moved;\n}\n\n(async () => {\n  await createSample();\n  console.log('Before:', (await fsp.readdir(root)).sort());\n  const moved = await organise();\n  console.log(`Moved ${moved} files`);\n  const all = await fsp.readdir(root, { recursive: true });\n  console.log('After :', all.sort());\n})();",
      result: "Before: [\n  'README',\n  'cv.pdf',\n  'invoice.pdf',\n  'logo.png',\n  'notes.txt',\n  'photo.jpg'\n]\nMoved 6 files\nAfter : [\n  'jpg',\n  'jpg/photo.jpg',\n  'other',\n  'other/README',\n  'pdf',\n  'pdf/cv.pdf',\n  'pdf/invoice.pdf',\n  'png',\n  'png/logo.png',\n  'txt',\n  'txt/notes.txt'\n]",
      explanation:
        '`path.extname` finds the type, `mkdir` with `recursive` creates the target folder only if needed, and `rename` moves the file. Files with no extension go to "other". The recursive readdir returns relative paths like `pdf/cv.pdf`. Sorting the arrays makes the output order predictable because the file system does not guarantee an order.',
    },
  ],
  interview: [
    { q: 'What are the three API styles of the fs module?', a: 'Synchronous (readFileSync, blocks and throws errors), callback-based (readFile with an error-first callback) and promise-based (fs/promises, used with async/await).', level: 'Easy' },
    { q: 'Why should you avoid sync fs methods inside request handlers?', a: 'They block the single JavaScript thread, so every other request waits until the file operation finishes. In a server, use the promise or callback APIs; sync methods are fine at startup or in CLI scripts.', level: 'Medium' },
    { q: 'What is an error-first callback?', a: 'A Node convention where the callback\'s first parameter is an error (or null) and the following parameters hold the result: (err, data) => { if (err) ...; }.', level: 'Easy' },
    { q: 'What does ENOENT mean?', a: 'Error NO ENTry: the file or directory does not exist. Check err.code === "ENOENT" to handle missing files, e.g. by creating defaults.', level: 'Easy' },
    { q: 'Difference between writeFile and appendFile?', a: 'writeFile creates the file or replaces its entire content. appendFile adds data to the end, creating the file if needed.', level: 'Easy' },
    { q: 'What does readFile return without an encoding?', a: 'A Buffer containing raw bytes. Pass "utf8" (or call buffer.toString()) to get a string.', level: 'Easy' },
    { q: 'Why not use require() to read a JSON data file that changes?', a: 'require caches the result after the first load, so later changes on disk are not seen. Use fs.readFile + JSON.parse for data that changes.', level: 'Medium' },
    { q: 'Why is "if (fs.existsSync(f)) fs.readFile(f)" considered an anti-pattern?', a: 'It is a race condition (TOCTOU: time of check to time of use): the file can be deleted between the check and the read. Better to attempt the operation and handle ENOENT.', level: 'Hard' },
    { q: 'How do you write a JSON file safely?', a: 'JSON.stringify the data, write it to a temporary file, then rename the temp file over the target. Rename is atomic, so readers never see a partially written file. For concurrent writers use a real database.', level: 'Hard' },
    { q: 'How do you create nested folders and delete a folder with its contents?', a: 'fs.mkdir(path, { recursive: true }) and fs.rm(path, { recursive: true, force: true }).', level: 'Easy' },
    { q: 'How do you read a very large file (e.g. 5 GB) efficiently?', a: 'Not with readFile, which loads everything into memory. Use streams (fs.createReadStream) to process it chunk by chunk with constant memory, covered on Day 7.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a script that creates `todo.txt` with "Buy milk", appends "Learn fs" and "Practice Node" on new lines, then prints the number of lines in the file.',
      hint: 'writeFileSync + appendFileSync with "\\n", then split("\\n").filter(Boolean).length.',
      solution: "const fs = require('node:fs');\nfs.writeFileSync('todo.txt', 'Buy milk\\n');\nfs.appendFileSync('todo.txt', 'Learn fs\\n');\nfs.appendFileSync('todo.txt', 'Practice Node\\n');\nconst lines = fs.readFileSync('todo.txt', 'utf8').split('\\n').filter(Boolean);\nconsole.log(lines.length, 'lines'); // 3 lines",
    },
    {
      task: 'Using fs/promises, write a function `countWords(file)` that returns the number of words in a text file, and returns 0 (instead of crashing) if the file does not exist.',
      hint: 'Catch the error and check err.code === "ENOENT".',
      solution: "const fsp = require('node:fs/promises');\nasync function countWords(file) {\n  try {\n    const text = await fsp.readFile(file, 'utf8');\n    return text.split(/\\s+/).filter(Boolean).length;\n  } catch (err) {\n    if (err.code === 'ENOENT') return 0;\n    throw err;\n  }\n}\n(async () => {\n  await fsp.writeFile('poem.txt', 'Node is fast and fun');\n  console.log(await countWords('poem.txt'));   // 5\n  console.log(await countWords('nothing.txt')); // 0\n})();",
    },
    {
      task: 'Build a tiny "visit counter": a script that reads `counter.json` ({ "visits": n }), increments visits, saves it and prints "Visit number n". Running it 3 times should print 1, 2, 3.',
      hint: 'Start with { visits: 0 } when the file is missing.',
      solution: "const fs = require('node:fs');\nconst FILE = 'counter.json';\nlet data = { visits: 0 };\ntry {\n  data = JSON.parse(fs.readFileSync(FILE, 'utf8'));\n} catch (err) {\n  if (err.code !== 'ENOENT') throw err;\n}\ndata.visits += 1;\nfs.writeFileSync(FILE, JSON.stringify(data, null, 2));\nconsole.log('Visit number', data.visits);",
    },
    {
      task: 'Write `listSizes(dir)` that prints every file in a folder with its size in KB (1 decimal), sorted from largest to smallest, ignoring sub-folders.',
      hint: 'readdir withFileTypes, stat each file, sort by size descending.',
      solution: "const fsp = require('node:fs/promises');\nconst path = require('node:path');\nasync function listSizes(dir) {\n  const entries = await fsp.readdir(dir, { withFileTypes: true });\n  const files = await Promise.all(\n    entries.filter(e => e.isFile()).map(async e => ({\n      name: e.name,\n      size: (await fsp.stat(path.join(dir, e.name))).size,\n    }))\n  );\n  files.sort((a, b) => b.size - a.size)\n    .forEach(f => console.log(f.name.padEnd(20), (f.size / 1024).toFixed(1), 'KB'));\n}\nlistSizes('.');",
    },
    {
      task: 'Rewrite the callback chain write → read → delete from Example 2 using async / await and fs/promises, so there is no nesting.',
      hint: 'Three awaits in one try / catch block.',
      solution: "const fsp = require('node:fs/promises');\n(async () => {\n  try {\n    await fsp.writeFile('note.txt', 'Promises are flat');\n    console.log('1) written');\n    console.log('2) read:', await fsp.readFile('note.txt', 'utf8'));\n    await fsp.unlink('note.txt');\n    console.log('3) deleted');\n  } catch (err) {\n    console.error('Failed:', err.message);\n  }\n})();",
    },
  ],
  quiz: [
    { question: 'Which import gives you the promise-based fs API?', options: ["require('fs-promise')", "require('node:fs/promises')", "require('node:fs').sync", "require('promises')"], answer: 1, explanation: 'node:fs/promises (or fs.promises) provides promise-returning functions.' },
    { question: 'What does fs.writeFile do if the file already exists?', options: ['Throws EEXIST', 'Appends to the end', 'Replaces the whole content', 'Creates a copy'], answer: 2, explanation: 'writeFile overwrites by default; use appendFile or the wx flag for other behaviour.' },
    { question: 'In fs.readFile("a.txt", "utf8", (err, data) => {}), what is err when the read succeeds?', options: ['undefined or null', 'An empty string', 'false', 'An Error with code OK'], answer: 0, explanation: 'Error-first callbacks pass null (no error) as the first argument on success.' },
    { question: 'Which option creates /a/b/c even if /a does not exist?', options: ["{ flag: 'w' }", '{ force: true }', '{ withFileTypes: true }', '{ recursive: true }'], answer: 3, explanation: 'mkdir with recursive: true creates all missing parent folders.' },
    { question: 'Best way to update a JSON data file inside an Express route handler?', options: ['readFileSync + writeFileSync', 'require() the JSON file', 'await fsp.readFile, modify, await fsp.writeFile', 'Edit it manually'], answer: 2, explanation: 'Async promise APIs do not block other requests; require() is cached and sync APIs block.' },
  ],
};
