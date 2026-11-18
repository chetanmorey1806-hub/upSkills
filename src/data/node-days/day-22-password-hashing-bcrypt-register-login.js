export default {
  id: 'day-22-password-hashing-bcrypt-register-login',
  title: 'Password Hashing with bcrypt, Register and Login',
  module: 'Module 4: Authentication & Security',
  day: 22,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Never store passwords. Store a slow, salted bcrypt hash and compare at login. Today you build secure register and login endpoints with Express 5 and bcrypt, and learn why MD5/SHA-256 and encryption are the wrong tools.',
  objectives: [
    'Explain hashing vs encryption and why passwords must be hashed, not encrypted',
    'Understand salt, cost factor (salt rounds) and the bcrypt hash format $2b$10$...',
    'Use bcrypt.hash() and bcrypt.compare() (async) correctly',
    'Build register and login endpoints with validation, duplicate checks and safe error messages',
    'Hash passwords automatically in a Mongoose pre("save") hook and hide the hash with select: false',
  ],
  theory: [
    {
      heading: 'Never store plain passwords',
      content:
        'If your users table stores `password: "Secret@123"` and the database leaks (backups, SQL injection, a curious employee), every user is compromised - and because people reuse passwords, also their email and bank accounts.\n\nThe solution is a **one-way hash**: a function that turns `Secret@123` into something like `$2b$10$f9HX...` and cannot be reversed. At login you hash what the user typed and compare the results. You never need to know the original password.\n\n**Analogy:** a hash is like a fingerprint. From a person you can always get the same fingerprint, but from a fingerprint you cannot rebuild the person.\n\n**Hashing vs encryption:**\n- Encryption is two-way (with a key you can decrypt). If the key leaks, all passwords leak. Use it for data you must read back (e.g. an API key you must send to another service).\n- Hashing is one-way. Use it for passwords.',
      points: [
        'Plain text: catastrophic on any leak',
        'Encryption: reversible - wrong tool for passwords',
        'Fast hashes (MD5, SHA-1, SHA-256): one-way but too FAST - GPUs try billions per second',
        'Password hashing functions (bcrypt, scrypt, Argon2id): one-way, salted and deliberately SLOW',
      ],
    },
    {
      heading: 'Salt and cost factor: what makes bcrypt special',
      content:
        '**Salt** is a random value mixed into each password before hashing. Two users with the same password get completely different hashes, and attackers cannot use precomputed "rainbow tables". bcrypt generates the salt for you and stores it **inside** the hash string, so you do not need a separate column.\n\n**Cost factor** (saltRounds) makes hashing slow on purpose: the work is 2^cost. Every +1 doubles the time. For a normal login, 100-300 ms is unnoticeable to a user but makes brute force billions of times more expensive. 10-12 is a common choice today; measure on your server.\n\nAnatomy of a bcrypt hash (always 60 characters):\n`$2b$10$f9HXEckj68diYpgY/qQMX.1NGTZ/DKQ3uugPe50PeeQJEN1UDbNNu`\n- `$2b$` - algorithm version\n- `10$` - cost factor\n- next 22 characters - the salt\n- remaining 31 characters - the actual hash',
      syntax: `const bcrypt = require('bcrypt');          // npm install bcrypt
const hash = await bcrypt.hash(plainPassword, 12);   // salt generated automatically
const ok = await bcrypt.compare(plainPassword, hash); // true / false`,
      tip: 'bcrypt only uses the first 72 bytes of a password. Enforce a reasonable max length (e.g. 64-72 characters) or pre-hash very long passwords. Argon2id (npm argon2) is the modern OWASP first choice; bcrypt is still widely accepted.',
    },
    {
      heading: 'bcrypt vs bcryptjs, sync vs async',
      content:
        '- **bcrypt** is a native C++ addon: fastest, needs a prebuilt binary for your platform (works on Node 22 out of the box for common OSes).\n- **bcryptjs** is pure JavaScript with the same API: no compilation problems (good on serverless or unusual platforms), roughly 30% slower.\n\nAlways use the **async** versions (`hash`, `compare`) in a server. `hashSync`/`compareSync` block the event loop for ~100 ms per call: with 50 users logging in at once, every other request in your app waits. The async version runs the work on the libuv thread pool.\n\nIn Express 5 an `async` route handler that throws or rejects is automatically sent to the error middleware - no `try/catch` or `express-async-handler` needed just for forwarding errors (in Express 4 you needed them).',
      tip: 'Never write if (user.password === req.body.password). Always use bcrypt.compare(), which also compares in constant time.',
    },
    {
      heading: 'Designing register and login endpoints',
      content:
        '**Register** `POST /api/auth/register`\n1. Validate input (required fields, email format, password length/strength).\n2. Normalise the email (`trim().toLowerCase()`).\n3. Check for duplicates → `409 Conflict`. Also put a **unique index** on email in the database (two simultaneous requests can both pass the check).\n4. Hash the password and save the user.\n5. Respond `201 Created` **without** the hash.\n\n**Login** `POST /api/auth/login`\n1. Find the user by normalised email.\n2. `bcrypt.compare(password, user.passwordHash)`.\n3. On failure respond `401` with the same message for "unknown email" and "wrong password" - this prevents **user enumeration** (attackers learning which emails are registered).\n4. On success return a session or token (JWT comes tomorrow, Day 23).',
      points: [
        '400 Bad Request - missing/invalid fields',
        '409 Conflict - email already registered',
        '201 Created - user registered',
        '401 Unauthorized - wrong credentials',
        '429 Too Many Requests - too many login attempts (rate limiting, Day 24)',
      ],
    },
    {
      heading: 'Hashing inside the Mongoose model',
      content:
        'In real projects you put hashing in the model so no developer can forget it:\n- `password: { type: String, required: true, select: false }` - the field is **excluded from queries by default**, so `User.find()` never leaks it. At login you explicitly ask for it with `.select("+password")`.\n- `userSchema.pre("save", async function () { ... })` - hash only when `this.isModified("password")`, otherwise updating the user name would re-hash an already hashed password.\n- An instance method `userSchema.methods.comparePassword = function (plain) { return bcrypt.compare(plain, this.password) }`.\n- A `toJSON` transform that deletes the password as a second safety net.',
      syntax: `userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});`,
      tip: 'Mongoose 8 middleware can be async without calling next(). Note: findByIdAndUpdate / updateOne do NOT run save hooks - change passwords with user.password = x; await user.save().',
    },
  ],
  examples: [
    {
      title: 'bcrypt basics: hash, salt and compare',
      scenario: 'See with your own eyes that the same password gives different hashes, yet compare() still works.',
      steps: [
        'mkdir bcrypt-demo && cd bcrypt-demo && npm init -y',
        'npm install bcrypt',
        'Create hash-demo.js with the code below',
        'Run node hash-demo.js (your hashes will differ - they are random)',
      ],
      code: `const bcrypt = require('bcrypt');

async function main() {
  const password = 'Secret@123';
  const saltRounds = 10;

  const hash1 = await bcrypt.hash(password, saltRounds);
  const hash2 = await bcrypt.hash(password, saltRounds);
  console.log('hash1:', hash1);
  console.log('hash2:', hash2);
  console.log('same hash?', hash1 === hash2);
  console.log('length:', hash1.length);
  console.log('rounds used:', bcrypt.getRounds(hash1));

  console.log('correct password:', await bcrypt.compare('Secret@123', hash1));
  console.log('wrong password:', await bcrypt.compare('secret@123', hash1));
}
main();`,
      result: `hash1: $2b$10$f9HXEckj68diYpgY/qQMX.1NGTZ/DKQ3uugPe50PeeQJEN1UDbNNu
hash2: $2b$10$LSXfcaZVpoVMQo2b46xOuO.kbdYoaQzdhf6TCNuV8yZhsy2R4oTtq
same hash? false
length: 60
rounds used: 10
correct password: true
wrong password: false`,
      explanation:
        'Each hash() call generates a new random salt, so hash1 and hash2 differ. compare() reads the cost and salt from the stored hash itself, re-hashes the candidate password with them and compares. Passwords are case-sensitive, so "secret@123" fails.',
    },
    {
      title: 'Measuring the cost factor',
      scenario: 'Choose saltRounds for your server by measuring how long one hash takes.',
      steps: [
        'In the same project create cost.js',
        'Hash the same password with cost 8, 10, 12 and 14 and time each',
        'Run node cost.js and pick the highest cost that stays under ~250 ms on your production hardware',
      ],
      code: `const bcrypt = require('bcrypt');

async function main() {
  for (const rounds of [8, 10, 12, 14]) {
    const start = performance.now();
    await bcrypt.hash('Secret@123', rounds);
    const ms = Math.round(performance.now() - start);
    console.log(\`cost \${rounds}: \${ms} ms\`);
  }
}
main();`,
      result: `cost 8: 30 ms
cost 10: 104 ms
cost 12: 406 ms
cost 14: 1754 ms
(measured on a laptop with Node 24; your numbers will differ but each +1 roughly doubles the time)`,
      explanation:
        'Work grows as 2^cost: 8 → 10 is 4x, 10 → 12 is 4x again. An attacker with a stolen hash pays the same price for every guess, so 400 ms per guess turns a billion guesses into years of computing time, while a real user waits less than half a second once per login.',
    },
    {
      title: 'Register and login API with real bcrypt',
      scenario: 'Build the two most important auth endpoints with validation, duplicate detection and safe error messages.',
      steps: [
        'npm install express bcrypt',
        'Create server.js with the code below (users are kept in an array for now)',
        'node server.js',
        'Register Asha (note the mixed-case email), try registering again, try a short password',
        'Login with the correct password, a wrong password and an unknown email',
      ],
      code: `const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const users = []; // replace with a database in real apps
const SALT_ROUNDS = 12;

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (users.some(u => u.email === normalizedEmail)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = { id: users.length + 1, name, email: normalizedEmail, passwordHash };
  users.push(user);
  res.status(201).json({ id: user.id, name: user.name, email: user.email }); // never return the hash
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = users.find(u => u.email === String(email).trim().toLowerCase());
  // same message for "no such user" and "wrong password" -> no user enumeration
  const ok = user ? await bcrypt.compare(String(password), user.passwordHash) : false;
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ message: 'Login successful', user: { id: user.id, name: user.name } });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
      result: `POST /api/auth/register {"name":"Asha","email":"Asha@Mail.com","password":"Secret@123"} → 201 {"id":1,"name":"Asha","email":"asha@mail.com"}
POST /api/auth/register {"name":"Asha","email":"asha@mail.com","password":"Secret@123"} → 409 {"error":"Email already registered"}
POST /api/auth/register {"name":"Ravi","email":"ravi@mail.com","password":"123"} → 400 {"error":"Password must be at least 8 characters"}
POST /api/auth/login {"email":"asha@mail.com","password":"Secret@123"} → 200 {"message":"Login successful","user":{"id":1,"name":"Asha"}}
POST /api/auth/login {"email":"asha@mail.com","password":"wrong"} → 401 {"error":"Invalid email or password"}
POST /api/auth/login {"email":"nobody@mail.com","password":"x"} → 401 {"error":"Invalid email or password"}`,
      explanation:
        'req.body ?? {} matters in Express 5: when no body parser matched (e.g. missing Content-Type), req.body is undefined instead of {}. The email is normalised so "Asha@Mail.com" and "asha@mail.com" are the same account. The hash is stored but never sent back. Both login failures return the identical 401 message.',
    },
    {
      title: 'API Lab simulation of the register/login flow',
      scenario: 'The browser API Lab cannot load native bcrypt, so this version uses a clearly fake stand-in hash function to show the HTTP flow (status codes, bodies, duplicate and wrong-password cases).',
      steps: [
        'Open the API Lab and paste the code',
        'Send the requests in order: register, duplicate register, login OK, wrong password, list users',
        'Notice GET /api/users never exposes the stored hash',
        'In a real project replace fakeHash/fakeCompare with bcrypt.hash/bcrypt.compare (previous example)',
      ],
      code: `// fakeHash is ONLY for the simulator - in real code use bcrypt.hash()
const fakeHash = (pw) => 'fake$' + pw.split('').reverse().join('');
const fakeCompare = (pw, hash) => fakeHash(pw) === hash;`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

// Simulator stand-in for bcrypt. NOT secure - real code: await bcrypt.hash(pw, 12)
const fakeHash = (pw) => 'fake$' + pw.split('').reverse().join('');
const fakeCompare = (pw, hash) => fakeHash(pw) === hash;

const users = [];

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password are required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const normalized = email.trim().toLowerCase();
  if (users.some(u => u.email === normalized)) return res.status(409).json({ error: 'Email already registered' });
  const user = { id: users.length + 1, name, email: normalized, passwordHash: fakeHash(password) };
  users.push(user);
  res.status(201).json({ id: user.id, name, email: normalized });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  const user = users.find(u => u.email === String(email).trim().toLowerCase());
  if (!user || !fakeCompare(String(password), user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ message: 'Login successful', user: { id: user.id, name: user.name } });
});

app.get('/api/users', (req, res) => {
  res.json(users.map(({ passwordHash, ...safe }) => safe));
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/auth/register', body: { name: 'Asha', email: 'Asha@Mail.com', password: 'Secret@123' } },
          { method: 'POST', url: '/api/auth/register', body: { name: 'Asha 2', email: 'asha@mail.com', password: 'Another@123' } },
          { method: 'POST', url: '/api/auth/register', body: { name: 'Ravi' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'asha@mail.com', password: 'Secret@123' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'asha@mail.com', password: 'Secret@124' } },
          { method: 'GET', url: '/api/users' },
        ],
      },
      result: "POST /api/auth/register → 201 {\"id\":1,\"name\":\"Asha\",\"email\":\"asha@mail.com\"}\nPOST /api/auth/register → 409 {\"error\":\"Email already registered\"}\nPOST /api/auth/register → 400 {\"error\":\"name, email and password are required\"}\nPOST /api/auth/login → 200 {\"message\":\"Login successful\",\"user\":{\"id\":1,\"name\":\"Asha\"}}\nPOST /api/auth/login → 401 {\"error\":\"Invalid email or password\"}\nGET /api/users → 200 [{\"id\":1,\"name\":\"Asha\",\"email\":\"asha@mail.com\"}]",
      explanation:
        'The status codes and messages are identical to the real bcrypt version; only the hashing function is replaced. The destructuring ({ passwordHash, ...safe }) removes the hash from every user before sending the list - a good habit even with real hashes.',
    },
    {
      title: 'Production pattern: Mongoose User model with automatic hashing',
      scenario: 'Move users to MongoDB and make it impossible to forget hashing or to leak the hash in responses.',
      steps: [
        'npm install express mongoose bcrypt',
        'Create models/User.js with select: false, a pre("save") hook and comparePassword()',
        'Create controllers/authController.js using the model',
        'Mount the routes on /api/auth and test with Postman/Thunder Client',
      ],
      code: `// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;      // do not re-hash on other updates
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.password; delete ret.__v; return ret; },
});

module.exports = mongoose.model('User', userSchema);

// controllers/authController.js
const User = require('../models/User');

exports.register = async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
  try {
    const user = await User.create({ name, email, password });  // hook hashes it
    res.status(201).json(user);                                  // toJSON removes password
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email already registered' });
    throw err; // Express 5 forwards it to the error middleware
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(String(password)))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ message: 'Login successful', user });
};

// routes/auth.js
const router = require('express').Router();
const auth = require('../controllers/authController');
router.post('/register', auth.register);
router.post('/login', auth.login);
module.exports = router;   // app.use('/api/auth', router)`,
      result:
        'POST /api/auth/register → 201 {"name":"Asha","email":"asha@mail.com","role":"user","_id":"...","createdAt":"...","updatedAt":"..."} - in MongoDB Compass the password field shows a $2b$12$... hash. A second register with the same email → 409 thanks to the unique index (error code 11000).',
      explanation:
        'select: false keeps the hash out of all normal queries; login opts back in with .select("+password"). isModified("password") prevents double hashing when the user later updates their name. Catching error code 11000 handles the race condition where two registrations pass the duplicate check at the same time.',
    },
  ],
  interview: [
    { q: 'Why should passwords be hashed and not encrypted?', a: 'Encryption is reversible with a key; if the key leaks (it lives on the same server) every password is exposed. Hashing is one-way: the server only needs to verify, never to recover, the password. Login re-hashes the input and compares.', level: 'Easy' },
    { q: 'What is a salt and why is it needed?', a: 'A random value added to each password before hashing. It makes identical passwords produce different hashes and defeats precomputed rainbow tables, forcing attackers to crack each hash separately. bcrypt generates a 16-byte salt and stores it inside the 60-char hash string.', level: 'Easy' },
    { q: 'Why not use SHA-256 for passwords?', a: 'SHA-256 is designed to be fast; GPUs compute billions per second, so brute-forcing common passwords is cheap. Password hashing functions (bcrypt, scrypt, Argon2id) are deliberately slow and tunable (cost factor), and scrypt/Argon2 are also memory-hard.', level: 'Medium' },
    { q: 'What is the bcrypt cost factor (salt rounds)?', a: 'The log2 of the number of iterations: cost 12 means 2^12 rounds of the key setup. Each +1 doubles the time. Choose the highest value that keeps hashing around 100-300 ms on your hardware (commonly 10-12) and increase it over time; bcrypt.getRounds(hash) lets you detect old hashes and re-hash on next login.', level: 'Medium' },
    { q: 'Explain the parts of $2b$10$N9qo8uLOickgx2ZMRZoMye...', a: '$2b$ is the bcrypt version, 10 is the cost, the next 22 characters are the base64-encoded salt and the last 31 characters are the hash. Because salt and cost are inside the string, compare() needs only the plain password and the stored hash.', level: 'Medium' },
    { q: 'Why use bcrypt.hash instead of bcrypt.hashSync in Express?', a: 'hashSync runs on the main thread and blocks the event loop for the whole hashing time (~100+ ms), freezing every other request. The async version runs on the libuv thread pool and returns a Promise.', level: 'Medium' },
    { q: 'What is user enumeration and how do you avoid it in login and register?', a: 'An attacker discovers which emails exist because the API answers differently ("user not found" vs "wrong password"). Return one generic 401 message for both, keep response times similar, and for password reset always reply "if the email exists, we sent a link". Registration duplicates are harder to hide; rate-limit them.', level: 'Hard' },
    { q: 'How do you hash passwords automatically in Mongoose and what is the common bug?', a: 'Use a pre("save") hook that hashes this.password. The common bug is hashing on every save, double-hashing an already hashed password when the user updates another field; guard with if (!this.isModified("password")) return. Also remember update queries (findByIdAndUpdate) skip save hooks.', level: 'Medium' },
    { q: 'What does select: false do on a schema field?', a: 'The field is excluded from query results by default, so the password hash is never returned accidentally. Fetch it explicitly where needed with .select("+password").', level: 'Easy' },
    { q: 'bcrypt vs bcryptjs vs argon2 - which would you pick?', a: 'bcrypt (native) is fast and widely used; bcryptjs is pure JS, portable and API-compatible but slower; argon2 (Argon2id) is the current OWASP recommendation, memory-hard and resistant to GPU attacks. For a new project Argon2id or bcrypt with cost >= 10 are both acceptable.', level: 'Hard' },
    { q: 'What is the 72-byte limit in bcrypt?', a: 'bcrypt ignores everything after the first 72 bytes of input, so two long passwords sharing the first 72 bytes produce the same hash. Limit password length (e.g. 72) or pre-hash with SHA-256 (base64) before bcrypt, carefully.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a function validatePassword(pw) that returns an array of error messages: min 8 chars, at least one uppercase, one lowercase, one digit, one special character, max 72 chars.',
      hint: 'Use regex tests like /[A-Z]/.test(pw).',
      solution: `function validatePassword(pw = '') {
  const errors = [];
  if (pw.length < 8) errors.push('At least 8 characters');
  if (pw.length > 72) errors.push('At most 72 characters');
  if (!/[A-Z]/.test(pw)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(pw)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(pw)) errors.push('One digit');
  if (!/[^A-Za-z0-9]/.test(pw)) errors.push('One special character');
  return errors;
}
console.log(validatePassword('abc'));        // 4 messages (length, uppercase, digit, special)
console.log(validatePassword('Secret@123')); // []`,
    },
    {
      task: 'Add a PUT /api/auth/change-password endpoint that takes email, oldPassword and newPassword, verifies the old one with bcrypt and stores a new hash.',
      hint: 'compare first; reject if new === old; hash the new password.',
      solution: `app.put('/api/auth/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body ?? {};
  const user = users.find(u => u.email === String(email).toLowerCase());
  if (!user || !(await bcrypt.compare(String(oldPassword), user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: 'New password too short' });
  if (oldPassword === newPassword) return res.status(400).json({ error: 'New password must be different' });
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  res.json({ message: 'Password changed' });
});`,
    },
    {
      task: 'Implement "rehash on login": if a stored hash was created with cost 10 and your current cost is 12, re-hash the password after a successful login.',
      hint: 'bcrypt.getRounds(hash) returns the cost stored in the hash.',
      solution: `const CURRENT_COST = 12;
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = users.find(u => u.email === String(email).toLowerCase());
  const ok = user ? await bcrypt.compare(String(password), user.passwordHash) : false;
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
  if (bcrypt.getRounds(user.passwordHash) < CURRENT_COST) {
    user.passwordHash = await bcrypt.hash(String(password), CURRENT_COST); // upgrade silently
  }
  res.json({ message: 'Login successful' });
});`,
    },
    {
      task: 'Write a small script that proves sync hashing blocks the event loop: start a setInterval that logs every 20 ms, then call bcrypt.hashSync with cost 13, then the async version.',
      hint: 'Watch the gap between interval ticks while hashSync runs.',
      solution: `const bcrypt = require('bcrypt');
let last = Date.now();
const t = setInterval(() => { const now = Date.now(); console.log('tick gap', now - last, 'ms'); last = now; }, 20);

setTimeout(() => {
  console.log('--- hashSync (blocks) ---');
  bcrypt.hashSync('Secret@123', 13);       // you will see one huge tick gap after this
  setTimeout(async () => {
    console.log('--- hash async (does not block) ---');
    await bcrypt.hash('Secret@123', 13);   // ticks keep coming every ~20 ms
    clearInterval(t);
  }, 100);
}, 100);`,
    },
    {
      task: 'Add a Mongoose static User.register({ name, email, password }) that throws a custom ConflictError (status 409) on duplicate email, and an error middleware that returns { error } with err.status.',
      hint: 'Catch err.code === 11000; Express 5 forwards thrown errors from async handlers.',
      solution: `class ConflictError extends Error { constructor(msg) { super(msg); this.status = 409; } }

userSchema.statics.register = async function (data) {
  try { return await this.create(data); }
  catch (err) {
    if (err.code === 11000) throw new ConflictError('Email already registered');
    throw err;
  }
};

app.post('/api/auth/register', async (req, res) => {
  const user = await User.register(req.body ?? {});
  res.status(201).json(user);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Internal Server Error' });
});`,
    },
  ],
  quiz: [
    { question: 'Which is the correct way to check a login password with bcrypt?', options: ['hash(input) === storedHash', 'await bcrypt.compare(input, storedHash)', 'decrypt(storedHash) === input', 'storedHash.includes(input)'], answer: 1, explanation: 'Because of the random salt you cannot compare two hash() outputs; compare() re-hashes the input with the stored salt.' },
    { question: 'Increasing bcrypt cost from 10 to 12 makes hashing roughly...', options: ['2 ms slower', '2 times slower', '4 times slower', '12 times slower'], answer: 2, explanation: 'Work is 2^cost, so +2 means 2^2 = 4 times more work.' },
    { question: 'Where does bcrypt store the salt?', options: ['Inside the 60-character hash string', 'In a separate salt column you must create', 'In an environment variable', 'It does not use a salt'], answer: 0, explanation: 'The hash format $2b$cost$<22-char salt><31-char hash> contains it.' },
    { question: 'What is the best response when the login email does not exist?', options: ['404 "User not found"', '400 "Email not registered"', '500 error', '401 "Invalid email or password" (same as wrong password)'], answer: 3, explanation: 'Identical responses prevent user enumeration.' },
    { question: 'Why should Express apps avoid bcrypt.hashSync?', options: ['It produces weaker hashes', 'It blocks the event loop so all other requests wait', 'It is deprecated in Node 22', 'It cannot be compared later'], answer: 1, explanation: 'The async version uses the libuv thread pool and keeps the server responsive.' },
  ],
};
