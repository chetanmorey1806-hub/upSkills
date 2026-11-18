export default {
  id: 'day-07-buffers-and-streams',
  title: 'Buffers and Streams: Readable, Writable, Transform, pipe and pipeline',
  module: 'Module 1: Node.js Fundamentals',
  day: 7,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Understand Buffers (raw binary data) and Streams (processing data piece by piece), the four stream types, pipe() vs pipeline(), backpressure, and how to process large files with constant memory: copy, compress, transform and read line by line.',
  objectives: [
    'Create and convert Buffers between strings, hex and base64, and explain bytes vs characters',
    'Describe the four stream types: Readable, Writable, Duplex and Transform',
    'Read and write files with fs.createReadStream / createWriteStream and stream events',
    'Connect streams safely with pipeline() (and know why plain pipe() is risky)',
    'Build custom Transform and Writable streams and explain backpressure',
  ],
  theory: [
    {
      heading: 'Buffers: working with raw bytes',
      content:
        'Computers store everything as **bytes** (numbers 0 to 255). Images, PDFs, zip files, network packets: all bytes. JavaScript strings are for text, so Node adds the **Buffer** class: a fixed-size chunk of memory holding raw bytes (a subclass of `Uint8Array`).\n\n- `Buffer.from(\'Hello\')` text → bytes (UTF-8 by default)\n- `Buffer.from(\'48656c6c6f\', \'hex\')`, `Buffer.from(str, \'base64\')`\n- `Buffer.alloc(10)` 10 zero bytes; `Buffer.allocUnsafe(10)` faster but may contain old memory (fill it before use)\n- `buf.toString(\'utf8\' | \'hex\' | \'base64\')`, `buf.length` (number of **bytes**), `buf[0]` one byte\n- `Buffer.concat([a, b])`, `buf.subarray(start, end)` (shares memory), `buf.equals(other)`, `Buffer.byteLength(str)`\n\n**Bytes are not characters**: English letters take 1 byte in UTF-8, Hindi letters 3 bytes, most emojis 4 bytes. That matters for upload size limits and for chunks that cut a character in half.\n\nAnalogy: a Buffer is a **row of numbered lockers**, each holding one small number (a byte).',
      syntax:
        "const buf = Buffer.from('Hi');\nconsole.log(buf);                    // <Buffer 48 69>\nconsole.log(buf.toString('base64')); // SGk=",
    },
    {
      heading: 'What are streams and why use them?',
      content:
        'Reading a 4 GB video with `fs.readFile` loads all 4 GB into memory before you can do anything. A **stream** delivers data in **small chunks** (64 KB by default for files) as soon as each chunk is ready.\n\nBenefits:\n\n- **Memory efficiency**: constant memory, whatever the file size\n- **Time efficiency**: start processing (or sending to the user) immediately\n- **Composability**: connect small pieces like LEGO: read → compress → encrypt → upload\n\nAnalogy: downloading a whole movie before watching vs **streaming** it on YouTube, where playback starts after the first few seconds arrive. Or water: you do not carry the whole lake home in a bucket; you connect **pipes** and the water flows.\n\nStreams are everywhere: `req` and `res` in HTTP servers, `process.stdin` / `stdout`, file streams, zlib compression, crypto, sockets.',
    },
    {
      heading: 'The four stream types',
      content:
        '1. **Readable**: a source you read from. `fs.createReadStream`, HTTP `req` on the server, `process.stdin`, `Readable.from(array)`.\n2. **Writable**: a destination you write to. `fs.createWriteStream`, HTTP `res`, `process.stdout`.\n3. **Duplex**: both readable and writable, independently. A TCP socket.\n4. **Transform**: a Duplex that **modifies** data passing through. `zlib.createGzip()`, `crypto.createCipheriv()`, your own uppercase or CSV-parser stream.\n\nAll streams are **EventEmitters** (Day 6). Important events:\n\n- Readable: `data` (a chunk arrived), `end` (no more data), `error`, `close`\n- Writable: `drain` (ready for more after backpressure), `finish` (all data flushed), `error`\n\nReadables are also **async iterables**: `for await (const chunk of stream) { ... }` is the most modern way to consume them.',
    },
    {
      heading: 'pipe() vs pipeline()',
      content:
        '`readable.pipe(writable)` connects streams and handles backpressure automatically. But `pipe` does **not forward errors** and does not destroy the other streams when one fails, which can leak file handles and memory.\n\n`pipeline()` from `node:stream/promises` connects any number of streams, forwards errors, **cleans up every stream** on failure, and returns a Promise you can `await`:\n\n```\nconst { pipeline } = require(\'node:stream/promises\');\nawait pipeline(\n  fs.createReadStream(\'big.log\'),\n  zlib.createGzip(),\n  fs.createWriteStream(\'big.log.gz\')\n);\n```\n\nUse `pipeline` in production code; know `pipe` because you will see it in older code and tutorials.',
    },
    {
      heading: 'Backpressure, highWaterMark and custom streams',
      content:
        'If a fast producer (reading from SSD) writes into a slow consumer (uploading over a slow network), data piles up in memory. **Backpressure** is the mechanism that tells the producer to **slow down**:\n\n- Each stream has an internal buffer limit called **highWaterMark** (64 KB for file read streams, 16 KB for most writables; in object mode it counts objects)\n- `writable.write(chunk)` returns **false** when the buffer is above the limit: stop writing\n- The writable emits **drain** when it is ready again: resume writing\n- `pipe` and `pipeline` do this for you automatically\n\nCustom streams: extend or construct `Readable`, `Writable` or `Transform` and implement `_read`, `_write(chunk, encoding, callback)` or `_transform(chunk, encoding, callback)`. Call the callback when you have finished with the chunk. With `{ objectMode: true }` a stream can carry JavaScript objects instead of bytes.',
      tip: 'For reading a text file line by line (logs, CSV), combine `fs.createReadStream` with `readline.createInterface` and `for await (const line of rl)`. It handles lines that are split across chunks for you.',
    },
  ],
  examples: [
    {
      title: 'Buffer basics: bytes, encodings and characters',
      scenario: 'See how text is stored as bytes, convert between encodings, and why byte length differs from string length.',
      steps: [
        'Create `buffers.js` and run `node buffers.js`',
        'Compare `.length` of strings and Buffers for English, Hindi and emoji text',
        'Encode a value as base64 (used in emails, data URLs and Basic auth headers)',
      ],
      code: "// buffers.js\nconst hello = Buffer.from('Hello');\nconsole.log(hello);                         // raw bytes in hex\nconsole.log('first byte:', hello[0], '=', String.fromCharCode(hello[0]));\nconsole.log('hex   :', hello.toString('hex'));\nconsole.log('base64:', hello.toString('base64'));\nconsole.log('back  :', Buffer.from('SGVsbG8=', 'base64').toString('utf8'));\n\nfor (const text of ['abc', 'नमस्ते', '😀']) {\n  console.log(`${text} -> string length ${text.length}, bytes ${Buffer.byteLength(text)}`);\n}\n\nconst a = Buffer.from('Node');\nconst b = Buffer.from('.js');\nconst joined = Buffer.concat([a, b]);\nconsole.log('concat:', joined.toString(), '| subarray(0,4):', joined.subarray(0, 4).toString());\nconsole.log('alloc :', Buffer.alloc(4), '| equals:', a.equals(Buffer.from('Node')));\n\nconst auth = Buffer.from('admin:secret123').toString('base64');\nconsole.log('Basic auth header -> Authorization: Basic ' + auth);",
      result: "<Buffer 48 65 6c 6c 6f>\nfirst byte: 72 = H\nhex   : 48656c6c6f\nbase64: SGVsbG8=\nback  : Hello\nabc -> string length 3, bytes 3\nनमस्ते -> string length 6, bytes 18\n😀 -> string length 2, bytes 4\nconcat: Node.js | subarray(0,4): Node\nalloc : <Buffer 00 00 00 00> | equals: true\nBasic auth header -> Authorization: Basic YWRtaW46c2VjcmV0MTIz",
      explanation:
        'Node prints Buffers as hex bytes: 48 is "H", 65 is "e" and so on. `toString` converts back using an encoding. "नमस्ते" is 6 JavaScript characters but 18 bytes in UTF-8, and the emoji is 2 UTF-16 code units but 4 bytes. Base64 turns any bytes into safe text, which is how HTTP Basic auth sends credentials (it is encoding, NOT encryption).',
    },
    {
      title: 'Reading a large file in chunks with a Readable stream',
      scenario: 'Generate a 1 MB file, then read it with a stream and count the chunks instead of loading it all at once.',
      steps: [
        'Create `readStream.js` and run `node readStream.js`',
        'Listen to the `data`, `end` and `error` events',
        'Then read it again with for await and a custom highWaterMark',
      ],
      code: "// readStream.js\nconst fs = require('node:fs');\n\nfs.writeFileSync('big.txt', 'x'.repeat(1024 * 1024)); // 1 MB sample file\n\nlet chunks = 0;\nlet bytes = 0;\nconst stream = fs.createReadStream('big.txt'); // default highWaterMark = 64 KB\n\nstream.on('data', chunk => {\n  chunks++;\n  bytes += chunk.length;\n  if (chunks === 1) console.log('first chunk is a', chunk.constructor.name, 'of', chunk.length, 'bytes');\n});\nstream.on('end', async () => {\n  console.log(`events: ${chunks} chunks, ${bytes} bytes total`);\n\n  let n = 0;\n  for await (const chunk of fs.createReadStream('big.txt', { highWaterMark: 256 * 1024 })) n++;\n  console.log('for await with 256 KB chunks:', n, 'chunks');\n  fs.unlinkSync('big.txt');\n});\nstream.on('error', err => console.error('Read failed:', err.message));\n\nfs.createReadStream('no-such-file.txt').on('error', err => console.log('error event ->', err.code));",
      result: "error event -> ENOENT\nfirst chunk is a Buffer of 65536 bytes\nevents: 16 chunks, 1048576 bytes total\nfor await with 256 KB chunks: 4 chunks",
      explanation:
        '1 MB / 64 KB = 16 chunks, each a Buffer. Only one chunk needs to be in memory at a time, so the same code works for a 10 GB file. With a 256 KB highWaterMark we get 4 bigger chunks. Errors (like a missing file) arrive as an `error` event instead of a thrown exception, so always listen for it. That line prints first simply because failing to open a file is quicker than reading 1 MB.',
    },
    {
      title: 'Copy and compress a file with pipeline()',
      scenario: 'Compress a log file with gzip and then decompress it again, using pipeline so errors and cleanup are handled.',
      steps: [
        'Create `compress.js` and run `node compress.js`',
        'Connect read stream → gzip transform → write stream with `pipeline` from `node:stream/promises`',
        'Check the sizes and verify the round trip',
      ],
      code: "// compress.js\nconst fs = require('node:fs');\nconst zlib = require('node:zlib');\nconst { pipeline } = require('node:stream/promises');\n\nasync function main() {\n  const lines = Array.from({ length: 5000 }, (_, i) => `2025-01-01 INFO request ${i} served in 12ms`);\n  fs.writeFileSync('app.log', lines.join('\\n'));\n\n  await pipeline(\n    fs.createReadStream('app.log'),\n    zlib.createGzip(),\n    fs.createWriteStream('app.log.gz')\n  );\n  const original = fs.statSync('app.log').size;\n  const gz = fs.statSync('app.log.gz').size;\n  console.log(`original: ${original} bytes, gzip: ${gz} bytes (${Math.round((gz / original) * 100)}% of original)`);\n\n  await pipeline(\n    fs.createReadStream('app.log.gz'),\n    zlib.createGunzip(),\n    fs.createWriteStream('restored.log')\n  );\n  const same = fs.readFileSync('restored.log').equals(fs.readFileSync('app.log'));\n  console.log('restored file identical?', same);\n\n  try {\n    await pipeline(fs.createReadStream('missing.log'), zlib.createGzip(), fs.createWriteStream('x.gz'));\n  } catch (err) {\n    console.log('pipeline rejected:', err.code);\n  }\n  for (const f of ['app.log', 'app.log.gz', 'restored.log', 'x.gz']) fs.rmSync(f, { force: true });\n}\n\nmain();",
      result: "original: 218889 bytes, gzip: 13613 bytes (6% of original)\nrestored file identical? true\npipeline rejected: ENOENT",
      explanation:
        'Data flows through the chain chunk by chunk, so even a multi-gigabyte log could be compressed with little memory. Repetitive log text compresses extremely well. `pipeline` returns a Promise, so we can `await` it and use try / catch: when the source file is missing, the error is forwarded and all three streams are destroyed properly, something plain `.pipe()` does not do.',
    },
    {
      title: 'Custom Transform stream: CSV rows to JSON objects',
      scenario: 'Write a reusable Transform that converts CSV lines into objects, and connect it to a Readable and a Writable.',
      steps: [
        'Create `transform.js` and run `node transform.js`',
        'Use `Readable.from()` to turn an array into a stream',
        'Implement `transform(chunk, encoding, callback)` and push results',
        'Collect output in a custom Writable in object mode',
      ],
      code: "// transform.js\nconst { Readable, Transform, Writable } = require('node:stream');\nconst { pipeline } = require('node:stream/promises');\n\nconst csvLines = ['name,city,marks', 'Asha,Pune,82', 'Ravi,Delhi,67', 'Meera,Mumbai,91'];\n\nfunction csvToObjects() {\n  let headers = null;\n  return new Transform({\n    objectMode: true,\n    transform(line, _enc, callback) {\n      const cells = line.split(',');\n      if (!headers) { headers = cells; return callback(); } // first line = header\n      const row = Object.fromEntries(headers.map((h, i) => [h, cells[i]]));\n      row.marks = Number(row.marks);\n      callback(null, row); // same as this.push(row); callback();\n    },\n  });\n}\n\nconst onlyToppers = new Transform({\n  objectMode: true,\n  transform(row, _enc, cb) { cb(null, row.marks >= 80 ? row : undefined); },\n});\n\nconst results = [];\nconst collect = new Writable({\n  objectMode: true,\n  write(row, _enc, cb) { results.push(row); cb(); },\n});\n\npipeline(Readable.from(csvLines), csvToObjects(), onlyToppers, collect).then(() => {\n  console.log('Toppers:', results);\n  console.log('Average of toppers:', results.reduce((s, r) => s + r.marks, 0) / results.length);\n});",
      result: "Toppers: [\n  { name: 'Asha', city: 'Pune', marks: 82 },\n  { name: 'Meera', city: 'Mumbai', marks: 91 }\n]\nAverage of toppers: 86.5",
      explanation:
        '`Readable.from` creates an object-mode readable from any iterable. The first Transform remembers the header row and turns every later line into an object. Passing `undefined` to the callback in the second Transform drops a row (a filter). `objectMode: true` lets JavaScript objects flow instead of Buffers. This is exactly how CSV import tools process million-row files.',
    },
    {
      title: 'Reading a CSV file line by line with readline',
      scenario: 'Calculate total sales per city from a sales file without loading the whole file into memory.',
      steps: [
        'Create `sales.js` (it writes a sample sales.csv first)',
        'Pipe a read stream into `readline.createInterface`',
        'Loop with `for await (const line of rl)` and aggregate',
        'Run `node sales.js`',
      ],
      code: "// sales.js\nconst fs = require('node:fs');\nconst readline = require('node:readline');\n\nfs.writeFileSync('sales.csv', [\n  'date,city,amount',\n  '2025-01-01,Pune,1200',\n  '2025-01-01,Delhi,800',\n  '2025-01-02,Pune,450',\n  '2025-01-02,Mumbai,2300',\n  '2025-01-03,Delhi,950',\n].join('\\n'));\n\nasync function main() {\n  const rl = readline.createInterface({\n    input: fs.createReadStream('sales.csv'),\n    crlfDelay: Infinity, // treat \\r\\n as one line break (Windows files)\n  });\n\n  const totals = {};\n  let lineNo = 0;\n  for await (const line of rl) {\n    if (lineNo++ === 0) continue; // skip header\n    const [, city, amount] = line.split(',');\n    totals[city] = (totals[city] || 0) + Number(amount);\n  }\n  console.log(`Processed ${lineNo - 1} rows`);\n  console.table(totals);\n  fs.unlinkSync('sales.csv');\n}\n\nmain();",
      result: "Processed 5 rows\n┌─────────┬────────┐\n│ (index) │ Values │\n├─────────┼────────┤\n│ Pune    │ 1650   │\n│ Delhi   │ 1750   │\n│ Mumbai  │ 2300   │\n└─────────┴────────┘",
      explanation:
        'readline splits the incoming chunks into complete lines, even when a line is cut between two chunks. The `for await` loop processes one line at a time, so memory stays tiny whatever the file size. `console.table` prints the aggregated object neatly.',
    },
    {
      title: 'Backpressure: write() returning false and the drain event',
      scenario: 'Write 10 chunks into a slow Writable with a small buffer and respect backpressure manually.',
      steps: [
        'Create `backpressure.js` and run `node backpressure.js`',
        'The Writable takes 10 ms per chunk and has highWaterMark 3 (object mode)',
        'When write() returns false, wait for the drain event before writing more',
      ],
      code: "// backpressure.js\nconst { Writable } = require('node:stream');\nconst { once } = require('node:events');\n\nconst slowSink = new Writable({\n  objectMode: true,\n  highWaterMark: 3, // buffer at most 3 items\n  write(item, _enc, cb) { setTimeout(cb, 10); }, // pretend the disk/network is slow\n});\n\nasync function produce() {\n  let pauses = 0;\n  for (let i = 1; i <= 10; i++) {\n    const ok = slowSink.write(`item-${i}`);\n    if (!ok) {\n      pauses++;\n      console.log(`write(item-${i}) returned false -> waiting for drain (buffered: ${slowSink.writableLength})`);\n      await once(slowSink, 'drain');\n    }\n  }\n  slowSink.end();\n  await once(slowSink, 'finish');\n  console.log(`All items written, producer paused ${pauses} times`);\n}\n\nproduce();",
      result: "write(item-3) returned false -> waiting for drain (buffered: 3)\nwrite(item-6) returned false -> waiting for drain (buffered: 3)\nwrite(item-9) returned false -> waiting for drain (buffered: 3)\nAll items written, producer paused 3 times",
      explanation:
        'Each time the internal buffer reaches the highWaterMark of 3 items, `write()` returns false and the producer pauses until `drain`. Without this check the producer would keep pushing and memory would grow without limit. `pipe()` and `pipeline()` perform exactly this pause / resume logic for you.',
    },
  ],
  interview: [
    { q: 'What is a Buffer in Node.js?', a: 'A fixed-length sequence of raw bytes stored outside the V8 heap, used to handle binary data (files, network packets, images). Buffer is a subclass of Uint8Array and supports encodings like utf8, hex and base64.', level: 'Easy' },
    { q: 'Why can Buffer.byteLength(str) differ from str.length?', a: 'str.length counts UTF-16 code units, while byteLength counts the bytes in the chosen encoding (UTF-8 by default). Non-ASCII characters take 2 to 4 bytes, so Hindi text or emojis have more bytes than characters.', level: 'Medium' },
    { q: 'What is a stream?', a: 'An abstraction for handling data piece by piece (chunks) over time instead of all at once. Streams are EventEmitters and save memory and time when dealing with large or continuous data.', level: 'Easy' },
    { q: 'Name the four types of streams with examples.', a: 'Readable (fs.createReadStream, HTTP request), Writable (fs.createWriteStream, HTTP response), Duplex (TCP socket), Transform (zlib.createGzip, crypto cipher).', level: 'Easy' },
    { q: 'Difference between readFile and createReadStream?', a: 'readFile loads the whole file into memory before you get it; createReadStream delivers it in chunks (default 64 KB) with constant memory, and you can start processing immediately. Use streams for large files or when piping to a response.', level: 'Medium' },
    { q: 'What is backpressure?', a: 'A flow-control mechanism: when a writable cannot keep up, write() returns false and the producer should pause until the drain event. pipe() and pipeline() handle it automatically, preventing unbounded memory growth.', level: 'Hard' },
    { q: 'Why prefer pipeline() over pipe()?', a: 'pipe() does not propagate errors or destroy the other streams on failure, which can leak resources. pipeline() forwards errors, cleans up all streams, and (from stream/promises) returns a Promise you can await.', level: 'Medium' },
    { q: 'What is highWaterMark?', a: 'The threshold of a stream\'s internal buffer, in bytes (or objects in objectMode). Readable streams read ahead up to it; writables return false from write() once their buffer exceeds it. Defaults: 64 KB for fs read streams, 16 KB for most others, 16 objects in object mode.', level: 'Hard' },
    { q: 'What is a Transform stream? Give a real use.', a: 'A duplex stream whose output is computed from its input, implemented with transform(chunk, enc, callback). Uses: gzip compression, encryption, converting CSV to JSON, uppercase or filtering lines.', level: 'Medium' },
    { q: 'What is objectMode?', a: 'A stream option that lets the stream carry arbitrary JavaScript values instead of Buffers/strings. highWaterMark then counts objects.', level: 'Medium' },
    { q: 'How would you send a large video file to the client in an HTTP server?', a: 'Create a read stream and pipe it to the response (pipeline(fs.createReadStream(file), res)), setting Content-Type and optionally handling Range headers for seeking. This avoids loading the whole video into memory.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Convert the string "Node.js rocks" to a Buffer and print its byte length, hex representation and base64 representation. Then decode the base64 back to text.',
      hint: 'Buffer.from(str), buf.toString("hex"), buf.toString("base64").',
      solution: "const buf = Buffer.from('Node.js rocks');\nconsole.log(buf.length);              // 13\nconsole.log(buf.toString('hex'));     // 4e6f64652e6a7320726f636b73\nconst b64 = buf.toString('base64');\nconsole.log(b64);                     // Tm9kZS5qcyByb2Nrcw==\nconsole.log(Buffer.from(b64, 'base64').toString()); // Node.js rocks",
    },
    {
      task: 'Write `copy.js` that copies `input.txt` to `output.txt` using streams and pipeline, and prints "Copy complete" or the error message.',
      hint: 'await pipeline(fs.createReadStream(src), fs.createWriteStream(dest)).',
      solution: "const fs = require('node:fs');\nconst { pipeline } = require('node:stream/promises');\n(async () => {\n  try {\n    await pipeline(fs.createReadStream('input.txt'), fs.createWriteStream('output.txt'));\n    console.log('Copy complete');\n  } catch (err) {\n    console.error('Copy failed:', err.message);\n  }\n})();",
    },
    {
      task: 'Create an `upperCase` Transform stream and use it so that whatever you type into the terminal is echoed back in capital letters (process.stdin → upperCase → process.stdout).',
      hint: 'callback(null, chunk.toString().toUpperCase()).',
      solution: "const { Transform, pipeline } = require('node:stream');\nconst upperCase = new Transform({\n  transform(chunk, _enc, cb) { cb(null, chunk.toString().toUpperCase()); },\n});\npipeline(process.stdin, upperCase, process.stdout, err => {\n  if (err) console.error(err);\n});\n// run: node upper.js   then type text and press Enter; Ctrl + D (Ctrl + Z on Windows) to end",
    },
    {
      task: 'Count how many lines in a log file contain the word "ERROR", using readline so it works for very large files.',
      hint: 'for await (const line of rl) if (line.includes("ERROR")) count++.',
      solution: "const fs = require('node:fs');\nconst readline = require('node:readline');\nasync function countErrors(file) {\n  const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });\n  let count = 0;\n  for await (const line of rl) if (line.includes('ERROR')) count++;\n  return count;\n}\nfs.writeFileSync('app.log', 'INFO ok\\nERROR db down\\nINFO ok\\nERROR timeout\\n');\ncountErrors('app.log').then(n => console.log('ERROR lines:', n)); // ERROR lines: 2",
    },
    {
      task: 'Gzip every .txt file in a folder in parallel (file.txt → file.txt.gz) using pipeline, and print each file name with its compressed size.',
      hint: 'readdir, filter by extname, Promise.all(files.map(f => pipeline(...))).',
      solution: "const fs = require('node:fs');\nconst path = require('node:path');\nconst zlib = require('node:zlib');\nconst { pipeline } = require('node:stream/promises');\n\nasync function gzipAll(dir) {\n  const files = fs.readdirSync(dir).filter(f => path.extname(f) === '.txt');\n  await Promise.all(files.map(f => pipeline(\n    fs.createReadStream(path.join(dir, f)),\n    zlib.createGzip(),\n    fs.createWriteStream(path.join(dir, f + '.gz'))\n  )));\n  for (const f of files) console.log(f, '->', fs.statSync(path.join(dir, f + '.gz')).size, 'bytes');\n}\ngzipAll('.');",
    },
  ],
  quiz: [
    { question: 'Buffer.from("Hi").toString("hex") returns:', options: ['"Hi"', '"4869"', '"SGk="', '"72 105"'], answer: 1, explanation: 'H is 0x48 and i is 0x69.' },
    { question: 'Which stream type is zlib.createGzip()?', options: ['Readable', 'Writable', 'Transform', 'None, it is a function'], answer: 2, explanation: 'Gzip reads uncompressed data and outputs compressed data: a Transform stream.' },
    { question: 'What does writable.write() returning false mean?', options: ['The write failed permanently', 'The stream is closed', 'The data was discarded', 'The internal buffer is full: wait for "drain"'], answer: 3, explanation: 'false signals backpressure; resume after the drain event.' },
    { question: 'Main advantage of pipeline() over pipe()?', options: ['It is faster', 'It forwards errors and cleans up all streams', 'It works without streams', 'It loads the whole file first'], answer: 1, explanation: 'pipeline handles errors and destroys every stream on failure.' },
    { question: 'Default chunk size (highWaterMark) of fs.createReadStream?', options: ['64 KB', '1 KB', '1 MB', 'The whole file'], answer: 0, explanation: 'File read streams default to 64 KB chunks.' },
  ],
};
