export default {
  id: 'extra-07-nodejs-interview',
  title: 'Node.js Interview: Event Loop Phases, libuv, Streams, Buffers, Cluster, Worker Threads, Modules & Error Handling',
  module: 'Interview: Backend',
  extraNo: 7,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Revision notes and 28 interview questions on Node.js internals that MERN interviewers love to ask: how a single thread handles thousands of requests, event loop phases, streams and buffers, scaling with cluster and worker threads, CommonJS vs ES modules, process, error handling and npm.',
  objectives: [
    'Explain how Node.js is single-threaded yet non-blocking, using the event loop and libuv thread pool',
    'Predict the output order of process.nextTick, promises, setTimeout and setImmediate',
    'Explain streams, buffers, backpressure and when to use them',
    'Compare cluster, worker threads and child processes for scaling and CPU work',
    'Answer questions on CommonJS vs ESM, process object, error handling and npm/package.json confidently',
  ],
  theory: [
    {
      heading: 'What Node.js is (the 30-second answer)',
      content: `**Node.js is a JavaScript runtime built on Chrome's V8 engine and the libuv library.** V8 compiles and runs your JavaScript; libuv gives Node an **event loop** and a **thread pool** for asynchronous I/O (files, DNS, crypto, compression). Network I/O uses the operating system's non-blocking mechanisms (epoll on Linux, kqueue on macOS, IOCP on Windows).

Your JavaScript runs on **one main thread**. When you call \`fs.readFile\` or make a DB query, Node hands the work to the OS or the libuv pool and immediately moves on. When the work finishes, a callback is queued and the event loop runs it. This is why one Node process can serve thousands of concurrent connections: it never sits idle waiting for I/O.

Analogy: a single waiter in a restaurant takes an order, gives it to the kitchen (libuv/OS) and goes to the next table. He does not stand in the kitchen waiting for the food.

**Good for:** REST APIs, real-time apps (chat, Socket.IO), streaming, BFF/API gateways, microservices.
**Not ideal for:** heavy CPU work (image processing, big calculations) on the main thread, because it blocks every other request. Use worker threads or a separate service for that.

Node.js 22 is the current LTS line you should mention: built-in \`fetch\`, \`node --watch\`, \`node --env-file=.env\`, built-in test runner (\`node:test\`), stable \`require()\` of synchronous ES modules (behind a flag in early 22, enabled by default from 22.12), and WebSocket client.`,
      tip: 'How to answer: "Node is single-threaded for JavaScript, but not for I/O." Then mention V8 + libuv + event loop + thread pool (default size 4, set with UV_THREADPOOL_SIZE).',
    },
    {
      heading: 'Event loop phases, nextTick and microtasks',
      content: `The libuv event loop runs in **phases**. Each phase has a FIFO queue of callbacks:

1. **timers** – callbacks of \`setTimeout\` / \`setInterval\` whose time has expired
2. **pending callbacks** – some system I/O callbacks deferred from the previous loop (e.g. TCP errors)
3. **idle / prepare** – internal use
4. **poll** – get new I/O events and run their callbacks (fs, network). The loop may wait here for I/O
5. **check** – \`setImmediate\` callbacks
6. **close callbacks** – e.g. \`socket.on('close')\`

Between every callback (Node 11+), Node drains two special queues:
- **process.nextTick queue** first (highest priority, Node-specific)
- then the **microtask queue** (promise \`.then/.catch/.finally\`, \`queueMicrotask\`, code after \`await\`)

So the priority is: **synchronous code → nextTick → microtasks → next phase callback**.

**setTimeout(fn, 0) vs setImmediate(fn):** in the main module the order is **not guaranteed** (depends on process performance and the 1 ms timer minimum). Inside an I/O callback, \`setImmediate\` **always** runs first because the check phase comes right after poll.`,
      syntax: `setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
console.log('sync');
// sync, nextTick, promise, then timeout/immediate (order of last two may vary)`,
      tip: 'A recursive process.nextTick can starve the event loop (I/O never runs). Prefer setImmediate for "do it later" work.',
    },
    {
      heading: 'Streams and Buffers',
      content: `A **Buffer** is a fixed-size chunk of raw binary memory outside the V8 heap, used for bytes (files, images, TCP packets). \`Buffer.from('Hi')\`, \`buf.toString('base64')\`, \`Buffer.alloc(10)\`. Note: \`'₹'.length\` is 1 character but 3 bytes in UTF-8.

A **stream** processes data **piece by piece (chunks)** instead of loading everything in memory. Reading a 2 GB file with \`fs.readFile\` loads 2 GB in RAM; \`fs.createReadStream\` reads 64 KB chunks.

Four types:
- **Readable** – source (\`fs.createReadStream\`, \`req\` in an HTTP server)
- **Writable** – destination (\`fs.createWriteStream\`, \`res\`)
- **Duplex** – both, independent (TCP socket)
- **Transform** – duplex that changes data (\`zlib.createGzip()\`, encryption)

**Backpressure:** when the writable side is slower than the readable side, \`write()\` returns \`false\`; you should pause until the \`'drain'\` event. \`pipe()\` and \`stream.pipeline()\` handle this automatically. Prefer \`pipeline\` (or \`stream/promises\` pipeline) because it also forwards errors and destroys all streams on failure.`,
      syntax: `const { pipeline } = require('node:stream/promises');
const fs = require('node:fs');
const zlib = require('node:zlib');
await pipeline(
  fs.createReadStream('big.log'),
  zlib.createGzip(),
  fs.createWriteStream('big.log.gz')
);`,
      tip: 'Real-world answer: "I used streams to download a large CSV report from Express: res is a writable stream, so I piped a DB cursor through a CSV transform into res."',
    },
    {
      heading: 'Scaling: cluster, worker threads, child processes',
      content: `- **cluster** – forks multiple **processes** of your server (usually one per CPU core) that share the same port. The primary process distributes connections. Each worker has its own memory and event loop. Used for scaling HTTP servers. In production, **PM2** (\`pm2 start app.js -i max\`) or Kubernetes replicas do the same job.
- **worker_threads** – multiple **threads** inside one process, each with its own V8 isolate and event loop. They can share memory via \`SharedArrayBuffer\` and talk with \`postMessage\`. Used for **CPU-heavy tasks** (image resize, PDF generation, hashing big data) so the main thread stays free.
- **child_process** – run another program (\`spawn\`, \`exec\`, \`execFile\`, \`fork\`). \`spawn\` streams output; \`exec\` buffers output and uses a shell; \`fork\` starts another Node script with an IPC channel.

Rule of thumb: **I/O-bound → event loop is enough; scale with cluster/PM2. CPU-bound → worker threads.**`,
      tip: 'Do not say "Node is multi-threaded because of worker threads". Say "JS runs on one thread by default; worker threads are opt-in for CPU work".',
    },
    {
      heading: 'Modules, process object and npm',
      content: `**CommonJS (CJS):** \`require\` / \`module.exports\`, synchronous loading, the default for \`.js\` files unless package.json has \`"type": "module"\`. Has \`__dirname\`, \`__filename\`.

**ES Modules (ESM):** \`import\` / \`export\`, static (analysable, tree-shakeable), supports top-level \`await\`. Used for \`.mjs\` files or when \`"type": "module"\`. Use \`import.meta.dirname\` / \`import.meta.filename\` (Node 20.11+) instead of \`__dirname\`.

Modules are **cached** after the first load: requiring the same file twice returns the same object (that is how a shared DB connection module works).

**process** gives information about the current process: \`process.env\` (environment variables), \`process.argv\` (CLI args), \`process.exit(code)\`, \`process.pid\`, \`process.memoryUsage()\`, \`process.cwd()\`, and events like \`'uncaughtException'\`, \`'unhandledRejection'\`, \`'SIGTERM'\`.

**npm:** \`package.json\` lists dependencies and scripts. \`dependencies\` go to production; \`devDependencies\` are build/test tools. Versions use **semver** MAJOR.MINOR.PATCH; \`^1.2.3\` allows minor+patch updates, \`~1.2.3\` allows only patch updates. \`package-lock.json\` locks exact versions so every machine installs the same tree; use \`npm ci\` in CI. \`npx\` runs a package binary without installing it globally.`,
      tip: 'Always commit package-lock.json. Never commit node_modules or .env.',
    },
    {
      heading: 'Error handling in Node.js',
      content: `Three styles of errors:
- **Synchronous** – use \`try/catch\`.
- **Callbacks** – error-first convention: \`fs.readFile(path, (err, data) => { if (err) ... })\`.
- **Promises / async-await** – \`try/catch\` around \`await\`, or \`.catch()\`.
- **EventEmitters / streams** – listen to the \`'error'\` event. An \`'error'\` event with no listener **crashes the process**.

**Operational errors** (DB down, invalid input, timeout) are expected: handle them and return a proper response. **Programmer errors** (undefined variable, wrong type) are bugs: fix the code.

Safety nets: \`process.on('unhandledRejection')\` and \`process.on('uncaughtException')\` should **log and exit** (let PM2/Docker restart the process), because the app may be in an unknown state. Since Node 15, an unhandled promise rejection crashes the process by default.

**Graceful shutdown:** on \`SIGTERM\` stop accepting new requests (\`server.close()\`), finish running ones, close the DB connection, then \`process.exit(0)\`.`,
      syntax: `process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});
process.on('SIGTERM', () => {
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
});`,
      tip: 'How to answer: name the 4 styles, the operational vs programmer difference, and graceful shutdown. That covers 90% of follow-ups.',
    },
  ],
  examples: [
    {
      title: 'Output prediction: nextTick, promises, timers, setImmediate and I/O',
      scenario: 'The most common Node.js output question. Predict the order before running.',
      steps: [
        'Save the code as order.js',
        'Run: node order.js',
        'Compare the printed order with the phase rules (sync → nextTick → microtasks → timers → check; inside I/O: check before timers)',
      ],
      code: `const fs = require('node:fs');
console.log('1: sync start');
setTimeout(() => console.log('6: setTimeout'), 0);
setImmediate(() => console.log('7: setImmediate'));
Promise.resolve().then(() => console.log('4: promise.then'));
process.nextTick(() => console.log('3: nextTick'));
queueMicrotask(() => console.log('5: queueMicrotask'));
fs.readFile(__filename, () => {
  console.log('8: readFile callback (poll phase)');
  setTimeout(() => console.log('10: timeout inside I/O'), 0);
  setImmediate(() => console.log('9: immediate inside I/O'));
});
console.log('2: sync end');`,
      result: `1: sync start
2: sync end
3: nextTick
4: promise.then
5: queueMicrotask
6: setTimeout
7: setImmediate
8: readFile callback (poll phase)
9: immediate inside I/O
10: timeout inside I/O

(Lines 6 and 7 can swap on some runs: top-level setTimeout(0) vs setImmediate is not guaranteed. Lines 9 and 10 are always in this order.)`,
      explanation: `Synchronous code runs first (1, 2). Then Node drains the nextTick queue (3) and then the microtask queue in order (4, 5). The loop enters the timers phase (6) and the check phase (7). The file read finishes later, so its callback runs in the poll phase (8). From inside an I/O callback the next phase is check, so setImmediate (9) always beats setTimeout (10), which waits for the next loop's timers phase. This example needs Node (process.nextTick, setImmediate and fs do not exist in the browser).`,
    },
    {
      title: 'Build your own EventEmitter (on, once, off, emit)',
      scenario: 'A popular coding question: "Implement a simple EventEmitter". It also proves you understand the pattern behind streams, http.Server and Socket.IO.',
      steps: [
        'Create a class with an events object: name -> array of listeners',
        'on() pushes a listener; off() removes it',
        'once() wraps the listener so it removes itself after the first call',
        'emit() calls a copy of the listener array and returns true if there were listeners',
        'Click Run and read the console',
      ],
      code: `class MyEmitter {
  constructor() { this.events = {}; }
  on(name, fn) { (this.events[name] ||= []).push(fn); return this; }
  once(name, fn) {
    const wrapper = (...args) => { this.off(name, wrapper); fn(...args); };
    return this.on(name, wrapper);
  }
  off(name, fn) {
    this.events[name] = (this.events[name] || []).filter((f) => f !== fn);
    return this;
  }
  emit(name, ...args) {
    const list = [...(this.events[name] || [])];
    list.forEach((fn) => fn(...args));
    return list.length > 0;
  }
}
const orders = new MyEmitter();
orders.on('placed', (id) => console.log('Send email for order', id));
orders.once('placed', (id) => console.log('First order bonus for', id));
console.log(orders.emit('placed', 101));
console.log(orders.emit('placed', 102));
console.log(orders.emit('cancelled', 103));`,
      playground: {
        html: '<p>Open the console to see the EventEmitter output.</p>',
        js: `class MyEmitter {
  constructor() { this.events = {}; }
  on(name, fn) { (this.events[name] ||= []).push(fn); return this; }
  once(name, fn) {
    const wrapper = (...args) => { this.off(name, wrapper); fn(...args); };
    return this.on(name, wrapper);
  }
  off(name, fn) {
    this.events[name] = (this.events[name] || []).filter((f) => f !== fn);
    return this;
  }
  emit(name, ...args) {
    const list = [...(this.events[name] || [])];
    list.forEach((fn) => fn(...args));
    return list.length > 0;
  }
}
const orders = new MyEmitter();
orders.on('placed', (id) => console.log('Send email for order', id));
orders.once('placed', (id) => console.log('First order bonus for', id));
console.log(orders.emit('placed', 101));
console.log(orders.emit('placed', 102));
console.log(orders.emit('cancelled', 103));`,
      },
      result: `Send email for order 101
First order bonus for 101
true
Send email for order 102
true
false`,
      explanation: `The once() wrapper removes itself before calling the real listener, so the bonus is printed only for order 101. emit() iterates over a copy of the array, so removing a listener during emit does not skip the next listener. emit returns false for an event with no listeners, exactly like Node's built-in EventEmitter. Like Node's EventEmitter, listeners are called synchronously, in the order they were added.`,
    },
    {
      title: 'Buffers and a Transform stream with pipeline()',
      scenario: 'Interviewer: "What is a Buffer? Show a stream that transforms data." This shows bytes vs characters and a safe pipeline.',
      steps: [
        'Save as streams.js and run: node streams.js',
        'Notice the ₹ sign takes 3 bytes',
        'Readable.from() creates a readable stream from an array; the Transform upper-cases each chunk',
        'pipeline() connects the streams and reports success or error in one callback',
      ],
      code: `const buf = Buffer.from('Hi ₹');
console.log(buf);
console.log('bytes:', buf.length, 'chars:', 'Hi ₹'.length);
console.log(buf.toString('base64'));
console.log(Buffer.from('SGkg4oK5', 'base64').toString('utf8'));

const { Readable, Transform, pipeline } = require('node:stream');
const upper = new Transform({
  transform(chunk, enc, cb) { cb(null, chunk.toString().toUpperCase()); },
});
const chunks = [];
pipeline(
  Readable.from(['mern ', 'stack ', 'developer']),
  upper,
  async function (source) { for await (const c of source) chunks.push(c.toString()); },
  (err) => console.log(err ? 'failed' : 'done:', chunks.join(''))
);`,
      result: `<Buffer 48 69 20 e2 82 b9>
bytes: 6 chars: 4
SGkg4oK5
Hi ₹
done: MERN STACK DEVELOPER`,
      explanation: `'H', 'i' and space are 1 byte each; '₹' is e2 82 b9 (3 bytes) in UTF-8, so the buffer has 6 bytes while the string has 4 characters. That is why you must not use string length to compute Content-Length. base64 encoding/decoding is a common use of Buffer (e.g. Basic auth headers, images in JSON). In the stream part, each chunk flows through the Transform one at a time; pipeline() also handles backpressure and destroys all streams if any one fails. Runs only in Node (Buffer and node:stream are Node APIs).`,
    },
    {
      title: 'Async error handling: try/catch/finally and Promise.allSettled',
      scenario: 'Interviewer: "How do you handle errors in async code? What if one of many parallel calls fails?"',
      steps: [
        'getUser() returns a promise that rejects for invalid ids',
        'Wrap awaits in try/catch/finally',
        'Use Promise.allSettled when you want every result, even if some fail',
        'Click Run',
      ],
      code: `function getUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (id > 0 ? resolve({ id, name: 'Asha' }) : reject(new Error('Invalid id'))), 10);
  });
}
async function main() {
  try {
    const u = await getUser(1);
    console.log('Got user:', u.name);
    await getUser(-1);
    console.log('never printed');
  } catch (err) {
    console.log('Caught:', err.message);
  } finally {
    console.log('cleanup done');
  }
  const results = await Promise.allSettled([getUser(2), getUser(0)]);
  console.log(results.map((r) => r.status));
}
main();`,
      playground: {
        html: '<p>Open the console to see the async error handling output.</p>',
        js: `function getUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (id > 0 ? resolve({ id, name: 'Asha' }) : reject(new Error('Invalid id'))), 10);
  });
}
async function main() {
  try {
    const u = await getUser(1);
    console.log('Got user:', u.name);
    await getUser(-1);
    console.log('never printed');
  } catch (err) {
    console.log('Caught:', err.message);
  } finally {
    console.log('cleanup done');
  }
  const results = await Promise.allSettled([getUser(2), getUser(0)]);
  console.log(results.map((r) => r.status));
}
main();`,
      },
      result: `Got user: Asha
Caught: Invalid id
cleanup done
[ 'fulfilled', 'rejected' ]`,
      explanation: `A rejected promise that is awaited throws inside the async function, so the catch block receives it and the line after it never runs. finally runs in both cases (close DB cursors, release locks). Promise.all would reject as soon as getUser(0) fails; Promise.allSettled waits for all and gives each result's status, which is better for "send 50 notifications, report which failed".`,
    },
  ],
  interview: [
    {
      q: 'What is Node.js and why is it single-threaded but still fast?',
      level: 'Easy',
      a: `Node.js is a JavaScript runtime built on the V8 engine and libuv. Your JS runs on a single main thread, but I/O work (network, files, DB) is non-blocking: Node gives it to the OS or the libuv thread pool and continues with other requests. When the I/O completes, its callback is queued and the event loop runs it.

So Node does not waste time waiting. A thread-per-request server (classic Java/PHP model) needs one thread per waiting request; Node handles thousands of concurrent connections with one thread and small memory. It is fast for I/O-heavy apps (APIs, chat, streaming) but not for CPU-heavy work on the main thread.`,
    },
    {
      q: 'What is the event loop? Name its phases.',
      level: 'Medium',
      a: `The event loop is the mechanism (provided by libuv) that keeps checking for completed work and runs its callbacks on the main thread. Phases in order:
1. timers – setTimeout/setInterval callbacks
2. pending callbacks – deferred system I/O callbacks
3. idle/prepare – internal
4. poll – retrieve new I/O events and run I/O callbacks; may block here waiting
5. check – setImmediate callbacks
6. close callbacks – e.g. socket 'close'

Between each callback Node drains the process.nextTick queue and then the promise microtask queue. The loop exits when nothing is pending (no timers, sockets, etc.).`,
    },
    {
      q: 'What is libuv and what is the thread pool used for?',
      level: 'Medium',
      a: `libuv is a C library that provides Node's event loop, async I/O abstraction across operating systems, and a thread pool.

The thread pool (default 4 threads, change with UV_THREADPOOL_SIZE env var, max 1024) runs operations that have no non-blocking OS API: most fs operations, dns.lookup, crypto (pbkdf2, scrypt, randomBytes), zlib compression. Network sockets do NOT use the pool; they use epoll/kqueue/IOCP.

Example: 6 parallel crypto.pbkdf2 calls with the default pool: 4 run together, 2 wait. That is why heavy bcrypt hashing can slow other fs work.`,
    },
    {
      q: 'Difference between process.nextTick(), setImmediate() and setTimeout(fn, 0)?',
      level: 'Medium',
      a: `- process.nextTick(fn): runs right after the current operation, before promise microtasks and before the event loop continues. Highest priority.
- setImmediate(fn): runs in the check phase, after the poll (I/O) phase of the current loop iteration.
- setTimeout(fn, 0): runs in the timers phase of the next loop, after at least 1 ms.

Order in main module: nextTick → promises → setTimeout/setImmediate (these two can swap). Inside an I/O callback: setImmediate always runs before setTimeout(0).

Use nextTick rarely (e.g. emit an event after the constructor returns); prefer setImmediate to defer work without starving I/O.`,
    },
    {
      q: 'What are microtasks and macrotasks in Node.js?',
      level: 'Medium',
      a: `Macrotasks (tasks) are callbacks scheduled in event loop phases: setTimeout, setInterval, setImmediate, I/O callbacks.
Microtasks are promise reactions (.then/.catch/.finally, code after await) and queueMicrotask callbacks. Node also has the nextTick queue which runs even before microtasks.

After each macrotask, Node empties nextTick queue then the microtask queue completely before moving on. Example:
setTimeout(() => console.log('A'));
Promise.resolve().then(() => console.log('B'));
prints B then A.`,
    },
    {
      q: 'What does "blocking the event loop" mean? How do you avoid it?',
      level: 'Medium',
      a: `Blocking means running long synchronous code on the main thread so no other callback (incoming requests, timers) can run. Examples: a big for-loop calculation, JSON.parse of a 200 MB string, fs.readFileSync in a request handler, a catastrophic regex, synchronous bcrypt (hashSync).

Avoid it by: using async APIs (fs.promises, bcrypt.hash), streaming large data, splitting work into chunks with setImmediate, moving CPU work to worker_threads or a job queue (BullMQ), and paginating DB results. Tools: clinic.js, --prof, or monitoring event loop lag with perf_hooks.monitorEventLoopDelay().`,
    },
    {
      q: 'What are streams? Name the types with examples.',
      level: 'Easy',
      a: `Streams let you process data in chunks as it arrives instead of loading it all into memory. They are EventEmitters.
- Readable: fs.createReadStream, http request (req), process.stdin
- Writable: fs.createWriteStream, http response (res), process.stdout
- Duplex: net.Socket (read and write independently)
- Transform: zlib.createGzip, crypto.createCipheriv (output depends on input)

Example: serving a video – fs.createReadStream('movie.mp4').pipe(res) uses constant memory even for a 4 GB file. Benefits: low memory, faster time-to-first-byte, composability.`,
    },
    {
      q: 'What is backpressure in streams?',
      level: 'Hard',
      a: `Backpressure happens when the writable destination cannot consume data as fast as the readable source produces it. Without handling it, data piles up in memory.

writable.write(chunk) returns false when its internal buffer passes highWaterMark (16 KB default for byte streams). The producer should stop and wait for the 'drain' event before writing again. readable.pipe() and stream.pipeline() do this automatically by pausing and resuming the readable.

Example: reading a file from fast SSD and uploading to a slow network socket – pipeline keeps memory flat.`,
    },
    {
      q: 'Why use stream.pipeline() instead of .pipe()?',
      level: 'Medium',
      a: `pipe() does not forward errors: if the middle stream fails, the source and destination may stay open, leaking file descriptors and memory, and you must attach an 'error' listener to every stream.

pipeline(src, transform, dest, callback) (or the promise version from 'node:stream/promises') forwards errors from any stream, destroys all streams on error, and gives one callback/promise for completion. So:
await pipeline(fs.createReadStream('a.csv'), zlib.createGzip(), fs.createWriteStream('a.csv.gz'));`,
    },
    {
      q: 'What is a Buffer? Why does Node need it?',
      level: 'Easy',
      a: `A Buffer is a fixed-length sequence of bytes (a subclass of Uint8Array) allocated outside the V8 heap. JavaScript strings are text (UTF-16), but files, images, network packets and crypto work with raw bytes, so Node needs a binary type.

Examples: Buffer.from('hello'), Buffer.from(base64String, 'base64'), buf.toString('hex'), Buffer.alloc(16) (zero-filled). Use Buffer.alloc instead of Buffer.allocUnsafe unless you overwrite all bytes immediately, because allocUnsafe may contain old memory data. Remember byte length differs from string length: Buffer.byteLength('₹') is 3.`,
    },
    {
      q: 'Cluster module vs worker threads vs child process?',
      level: 'Hard',
      a: `- cluster: forks multiple Node processes that share one server port; each has its own memory and event loop. Used to use all CPU cores for an HTTP server. PM2 cluster mode (pm2 start app.js -i max) wraps it.
- worker_threads: threads inside the same process with separate V8 isolates; communicate via postMessage, can share memory with SharedArrayBuffer. Used for CPU-heavy tasks (image resize, report generation) without blocking the main thread.
- child_process: run any external program or Node script (spawn/exec/execFile/fork). Used for running ffmpeg, Python scripts, shell commands.

Processes are isolated (a crash kills one worker only) but heavier; threads are lighter and can share memory.`,
    },
    {
      q: 'How would you run a CPU-intensive task in an Express app without blocking other requests?',
      level: 'Hard',
      a: `Move it off the main thread:
const { Worker } = require('node:worker_threads');
app.post('/report', (req, res) => {
  const worker = new Worker('./report-worker.js', { workerData: req.body });
  worker.once('message', (pdfPath) => res.json({ pdfPath }));
  worker.once('error', (err) => res.status(500).json({ error: err.message }));
});
In report-worker.js: const { parentPort, workerData } = require('node:worker_threads'); ... parentPort.postMessage(result).

For production use a worker pool (piscina) instead of one worker per request, or a job queue (BullMQ + Redis): the API returns 202 Accepted with a job id and the client polls or gets a WebSocket notification.`,
    },
    {
      q: 'CommonJS vs ES Modules in Node.js?',
      level: 'Medium',
      a: `CommonJS: require()/module.exports, loaded synchronously at runtime, dynamic (require can be inside an if), has __dirname/__filename, default for .js files.
ESM: import/export, statically analysed (enables tree-shaking), loaded asynchronously, supports top-level await, strict mode by default, uses import.meta.dirname. Enabled with .mjs or "type": "module" in package.json.

Interop: ESM can import CJS. CJS can load ESM with dynamic import(), and in Node 22.12+ also with require() if the ESM has no top-level await. New projects should prefer ESM because it is the JavaScript standard used by browsers and bundlers.`,
    },
    {
      q: 'What is the difference between module.exports and exports?',
      level: 'Easy',
      a: `exports is just a shortcut variable pointing to module.exports. require() always returns module.exports.

exports.add = (a, b) => a + b;   // works: adds a property to the same object
exports = { add };               // does NOT work: rebinds the local variable only
module.exports = { add };        // works: replaces the exported object

Rule: to export a single function/class or a new object, assign module.exports.`,
    },
    {
      q: 'What is module caching? How does it help?',
      level: 'Medium',
      a: `After a module is loaded the first time, Node stores it in require.cache (ESM has its own module map). Later require() calls with the same resolved path return the same exported object without re-running the file.

Benefits: a db.js file that creates one MongoDB connection is shared by every file (a singleton). Side effect: mutating an exported object affects all importers. To reload in development use node --watch or nodemon, which restarts the process.`,
    },
    {
      q: 'What is the process object? Give common uses.',
      level: 'Easy',
      a: `process is a global object about the running Node process:
- process.env.PORT / process.env.MONGO_URI – configuration (load .env with node --env-file=.env in Node 20.6+ or the dotenv package)
- process.argv – command-line arguments
- process.exit(code) – exit (0 = success, non-zero = failure)
- process.cwd(), process.pid, process.platform, process.memoryUsage(), process.uptime()
- events: 'exit', 'uncaughtException', 'unhandledRejection', 'SIGINT', 'SIGTERM' (graceful shutdown in Docker/Kubernetes)
- process.nextTick() for scheduling.`,
    },
    {
      q: 'How do you handle errors in Node.js? What are operational vs programmer errors?',
      level: 'Medium',
      a: `Sync: try/catch. Callbacks: error-first (err, data). Promises: .catch or try/catch with await. EventEmitters/streams: 'error' listeners (an unhandled 'error' event crashes the process).

Operational errors are expected runtime problems: invalid user input, DB connection lost, file not found, timeout. Handle them: retry, return 400/404/503, log.
Programmer errors are bugs: reading a property of undefined, wrong argument type. You cannot handle them correctly at runtime; log, crash and restart via PM2/Docker, then fix the code.

In Express, centralise errors in an error-handling middleware with 4 arguments.`,
    },
    {
      q: 'What happens with an unhandled promise rejection or uncaught exception?',
      level: 'Medium',
      a: `Since Node 15, an unhandled rejection is treated like an uncaught exception: Node prints the error and exits with code 1 (default --unhandled-rejections=throw).

You can add process.on('unhandledRejection') and process.on('uncaughtException') to log the error (e.g. to Sentry), but you should still exit, because the app state may be corrupted. A process manager (PM2, Docker restart policy, Kubernetes) restarts it. Never use uncaughtException to "keep the server alive" silently.`,
    },
    {
      q: 'How do you implement graceful shutdown in a Node/Express server?',
      level: 'Hard',
      a: `When Docker/Kubernetes stops a container it sends SIGTERM. Steps:
const server = app.listen(PORT);
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(async () => {          // stop new connections, wait for in-flight requests
    await mongoose.connection.close(); // close DB, Redis, queues
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref(); // force exit if stuck
});
This avoids cutting off users mid-request and losing data during deploys.`,
    },
    {
      q: 'What is the difference between fs.readFile and fs.createReadStream?',
      level: 'Easy',
      a: `fs.readFile loads the entire file into memory and gives you one Buffer/string when done. Simple, fine for small files (config, small JSON).
fs.createReadStream reads the file in chunks (64 KB default highWaterMark) and emits them as they are read. Memory stays constant regardless of file size, and you can start sending data immediately.

For a 2 GB log file or video download, use a stream: fs.createReadStream(path).pipe(res). Also avoid fs.readFileSync inside request handlers because it blocks the event loop.`,
    },
    {
      q: 'What is EventEmitter? Where is it used in Node?',
      level: 'Easy',
      a: `EventEmitter (from 'node:events') implements the observer/pub-sub pattern: objects emit named events and listeners react.
const EventEmitter = require('node:events');
const bus = new EventEmitter();
bus.on('userRegistered', (user) => sendWelcomeEmail(user));
bus.emit('userRegistered', { email: 'a@b.com' });

Used everywhere in Node: http.Server ('request'), streams ('data', 'end', 'error'), process ('exit'), sockets. Listeners run synchronously in registration order. Default max 10 listeners per event before a memory-leak warning.`,
    },
    {
      q: 'Explain package.json, package-lock.json, dependencies vs devDependencies.',
      level: 'Easy',
      a: `package.json describes the project: name, version, "type", scripts (npm run dev), engines, dependencies.
- dependencies: needed at runtime in production (express, mongoose, jsonwebtoken).
- devDependencies: needed only for development/build/test (nodemon, jest, eslint, vite). npm ci --omit=dev skips them in production images.
package-lock.json records the exact resolved version of every package in the tree so all developers and CI get identical installs. Commit it; use npm ci in CI (clean, faster, fails if lock and package.json disagree).`,
    },
    {
      q: 'What does ^ and ~ mean in package versions (semver)?',
      level: 'Easy',
      a: `Semver is MAJOR.MINOR.PATCH: major = breaking changes, minor = new features (backward compatible), patch = bug fixes.
- "^4.18.2" allows 4.x.x updates >= 4.18.2 (minor and patch), not 5.0.0.
- "~4.18.2" allows only patch updates: 4.18.x.
- "4.18.2" exact version.
Special case: for 0.x versions, ^0.2.3 only allows 0.2.x because 0.x minor bumps may break.`,
    },
    {
      q: 'npm vs npx? What is npm ci?',
      level: 'Easy',
      a: `npm installs and manages packages (npm install express) and runs scripts (npm run build).
npx executes a package binary without a global install: npx create-vite@latest my-app, or runs the local binary from node_modules/.bin.
npm ci deletes node_modules and installs exactly what package-lock.json says. It is faster and reproducible, so it is used in CI pipelines and Dockerfiles. npm install may update the lock file.`,
    },
    {
      q: 'How do you secure a Node.js application?',
      level: 'Medium',
      a: `- Keep secrets in environment variables, never in code/Git.
- Validate and sanitise all input (zod/joi/express-validator); prevent NoSQL injection (reject objects like {"$gt": ""} in login fields).
- Hash passwords with bcrypt/argon2, never store plain text.
- Use helmet for security headers, configure CORS to known origins, use HTTPS.
- Rate limit login and APIs (express-rate-limit), limit body size (express.json({ limit: '100kb' })).
- Run npm audit and keep dependencies updated; use lock files.
- Do not leak stack traces in production error responses.
- Run as a non-root user in Docker.`,
    },
    {
      q: 'How do you debug memory leaks in Node.js?',
      level: 'Hard',
      a: `Symptoms: process.memoryUsage().heapUsed keeps growing, eventually "JavaScript heap out of memory".
Common causes: global arrays/maps used as caches without limits, event listeners added on every request and never removed, closures holding big objects, timers not cleared, unclosed DB cursors.
Tools: node --inspect then Chrome DevTools Memory tab, take heap snapshots before and after load and compare retained objects; clinic.js heapprofiler; --heapsnapshot-signal. Fixes: use LRU caches with max size (lru-cache), remove listeners (off/once), clear intervals, use WeakMap for metadata keyed by objects.`,
    },
    {
      q: 'Is Node.js good for CPU-intensive tasks? What would you choose instead?',
      level: 'Medium',
      a: `Not on the main thread. A 2-second CPU task blocks every other user for 2 seconds.
Options: worker_threads (or a pool like piscina) for CPU work inside Node; a background job queue (BullMQ) so the request returns quickly; a separate service in Go/Java/Python for heavy computation; native addons/WASM for hot paths. For typical MERN apps (CRUD, auth, chat) the workload is I/O-bound and Node is an excellent fit.`,
    },
    {
      q: 'What new features in recent Node.js versions (20/22) would you mention?',
      level: 'Medium',
      a: `- Built-in fetch, Web Streams, WebSocket client (22), structuredClone.
- node --watch (auto-restart, replaces nodemon for simple cases).
- node --env-file=.env (no dotenv needed).
- Built-in test runner: import { test } from 'node:test' and node --test.
- require() of synchronous ES modules (enabled by default in 22.12+).
- import.meta.dirname / import.meta.filename.
- Permission model (--permission, experimental in 20, stable from 22.13 / 23.5), glob in fs.
Mentioning one or two you have actually used (watch mode, env-file, fetch) shows you are current.`,
    },
  ],
  practice: [
    {
      task: 'Predict and verify the output: console.log("A"); setTimeout(()=>console.log("B")); Promise.resolve().then(()=>console.log("C")); process.nextTick(()=>console.log("D")); (async()=>{ console.log("E"); await null; console.log("F"); })(); console.log("G");',
      hint: 'The async function body runs synchronously until the first await. Code after await is a microtask.',
      solution: `// Output (run with node):
// A
// E
// G
// D   <- nextTick queue first
// C   <- microtasks in the order they were queued
// F
// B   <- timers phase
console.log('A');
setTimeout(() => console.log('B'));
Promise.resolve().then(() => console.log('C'));
process.nextTick(() => console.log('D'));
(async () => { console.log('E'); await null; console.log('F'); })();
console.log('G');`,
    },
    {
      task: 'Write a Node script that counts lines in a very large file using streams (do not load it fully into memory).',
      hint: 'Use readline.createInterface with fs.createReadStream and for await.',
      solution: `const fs = require('node:fs');
const readline = require('node:readline');

async function countLines(path) {
  const rl = readline.createInterface({
    input: fs.createReadStream(path),
    crlfDelay: Infinity,
  });
  let count = 0;
  for await (const _line of rl) count++;
  return count;
}

countLines(process.argv[2] || __filename)
  .then((n) => console.log('Lines:', n))
  .catch((err) => { console.error(err.message); process.exit(1); });`,
    },
    {
      task: 'Create a minimal HTTP server with only node:http (no Express) that returns JSON for GET /health and 404 for other routes, and shuts down gracefully on SIGTERM.',
      hint: 'http.createServer((req, res) => ...); res.writeHead(status, headers); server.close().',
      solution: `const http = require('node:http');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(process.env.PORT || 3000, () => console.log('Listening'));

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Closed cleanly');
    process.exit(0);
  });
});`,
    },
    {
      task: 'Move a CPU-heavy function (sum of primes below N) to a worker thread so the main thread stays responsive.',
      hint: 'Use one file with isMainThread to keep it short.',
      solution: `const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');

function sumPrimes(n) {
  let sum = 0;
  for (let i = 2; i < n; i++) {
    let prime = true;
    for (let j = 2; j * j <= i; j++) if (i % j === 0) { prime = false; break; }
    if (prime) sum += i;
  }
  return sum;
}

if (isMainThread) {
  const worker = new Worker(__filename, { workerData: 2_000_000 });
  const timer = setInterval(() => console.log('main thread still free...'), 200);
  worker.on('message', (sum) => { console.log('Sum:', sum); clearInterval(timer); });
  worker.on('error', (e) => console.error(e));
} else {
  parentPort.postMessage(sumPrimes(workerData));
}`,
    },
    {
      task: 'Write a promisified sleep and a retry helper: retry(fn, { retries: 3, delayMs: 200 }) that retries a failing async function with exponential backoff.',
      hint: 'Use node:timers/promises setTimeout or new Promise(r => setTimeout(r, ms)). Double the delay each attempt.',
      solution: `const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function retry(fn, { retries = 3, delayMs = 200 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      const wait = delayMs * 2 ** attempt;
      console.log('attempt', attempt + 1, 'failed, retrying in', wait, 'ms');
      await sleep(wait);
    }
  }
  throw lastErr;
}

let calls = 0;
retry(async () => { calls++; if (calls < 3) throw new Error('DB busy'); return 'connected'; })
  .then((r) => console.log(r, 'after', calls, 'calls'));
// attempt 1 failed, retrying in 200 ms
// attempt 2 failed, retrying in 400 ms
// connected after 3 calls`,
    },
  ],
  quiz: [
    {
      question: 'Which runs first after synchronous code finishes in Node.js?',
      options: ['setTimeout(fn, 0)', 'Promise.resolve().then(fn)', 'process.nextTick(fn)', 'setImmediate(fn)'],
      answer: 2,
      explanation: 'The nextTick queue is drained before the promise microtask queue, and both run before any event loop phase (timers, check).',
    },
    {
      question: 'Which of these does NOT use the libuv thread pool by default?',
      options: ['TCP network sockets', 'fs.readFile', 'crypto.pbkdf2', 'zlib.gzip'],
      answer: 0,
      explanation: 'Network I/O uses the OS non-blocking mechanisms (epoll/kqueue/IOCP). File system, some crypto, dns.lookup and zlib use the thread pool.',
    },
    {
      question: 'You must generate large PDF reports (CPU heavy) inside an Express API. Best choice?',
      options: ['Use fs.readFileSync', 'Increase setTimeout delays', 'Use process.nextTick in a loop', 'Run the work in worker_threads or a background job queue'],
      answer: 3,
      explanation: 'CPU work blocks the single JS thread. Worker threads or a job queue keep the event loop free for other requests.',
    },
    {
      question: 'What does writable.write() returning false mean?',
      options: ['The write failed permanently', 'The internal buffer is full; wait for the drain event (backpressure)', 'The stream is closed', 'The data was written twice'],
      answer: 1,
      explanation: 'false is the backpressure signal. Stop writing until drain. pipe()/pipeline() handle this for you.',
    },
    {
      question: 'In package.json, "express": "~5.1.0" allows which update?',
      options: ['5.2.0', '6.0.0', '5.1.3', 'Any version'],
      answer: 2,
      explanation: 'Tilde allows only patch updates (5.1.x). Caret (^5.1.0) would allow 5.2.0.',
    },
  ],
};
