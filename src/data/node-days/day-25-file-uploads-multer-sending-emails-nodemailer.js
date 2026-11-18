export default {
  id: 'day-25-file-uploads-multer-sending-emails-nodemailer',
  title: 'File Uploads with multer and Sending Emails with nodemailer',
  module: 'Module 4: Authentication & Security',
  day: 25,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Profile pictures, product photos, invoices and "verify your email" links are part of almost every real app. Today you accept multipart/form-data uploads safely with multer (type and size checks, safe file names, error handling, cloud storage) and send transactional emails with nodemailer (SMTP, HTML templates, password-reset flow).',
  objectives: [
    'Explain multipart/form-data and why express.json() cannot read file uploads',
    'Use multer single(), array() and fields() with diskStorage and memoryStorage',
    'Validate uploads (mimetype whitelist, size and count limits) and turn MulterError into clean JSON responses',
    'Know why production apps store files in S3 / Cloudinary instead of the server disk',
    'Send text and HTML emails with nodemailer and build a secure password-reset email flow',
  ],
  theory: [
    {
      heading: 'How file uploads travel: multipart/form-data',
      content:
        'JSON is text, but a photo is binary. HTML forms and `FormData` in the browser send files with the content type **multipart/form-data**: the body is split into "parts" separated by a boundary string, and each part has its own headers (field name, original file name, content type) followed by its raw bytes.\n\n`express.json()` and `express.urlencoded()` ignore this content type, so `req.body` stays empty. You need a multipart parser: **multer** (built on busboy) is the standard for Express.\n\nFront-end side:\n- HTML: `<form method="POST" enctype="multipart/form-data"><input type="file" name="avatar"></form>`\n- JS: `const fd = new FormData(); fd.append("avatar", fileInput.files[0]); fetch(url, { method: "POST", body: fd })` - do **not** set the Content-Type header yourself; the browser adds it with the boundary.\n- curl: `curl -F "avatar=@photo.png" http://localhost:3000/api/users/me/avatar`',
    },
    {
      heading: 'multer basics',
      content:
        '`npm install multer` (v2 is current). Create an upload middleware with options, then attach it **only to the routes that accept files**:\n- `upload.single("avatar")` → one file in `req.file`\n- `upload.array("photos", 5)` → up to 5 files with the same field name in `req.files` (array)\n- `upload.fields([{ name: "cover", maxCount: 1 }, { name: "gallery", maxCount: 8 }])` → `req.files.cover[0]`, `req.files.gallery`\n- `upload.none()` → text-only multipart forms\n\nText fields of the same form arrive in `req.body`.\n\nEach file object has `fieldname`, `originalname`, `mimetype`, `size`, and depending on storage either `destination/filename/path` (disk) or `buffer` (memory).\n\n**Storage engines:**\n- `multer.diskStorage({ destination, filename })` - writes to a folder; you choose the name.\n- `multer.memoryStorage()` - keeps the file in RAM as a Buffer; ideal to pass on to S3/Cloudinary or image processing (sharp). Combine with a size limit or large uploads can exhaust memory.',
      syntax: `const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads'),
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 2 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => cb(null, ['image/png', 'image/jpeg'].includes(file.mimetype)),
});
app.post('/api/users/me/avatar', upload.single('avatar'), handler);`,
    },
    {
      heading: 'Upload security checklist',
      content:
        'File upload is one of the most dangerous features of a web app. Rules:\n1. **Limit size and count** (`limits.fileSize`, `limits.files`) - otherwise someone uploads 10 GB and fills your disk.\n2. **Whitelist types** with `fileFilter`. Remember `mimetype` comes from the client and can be faked; for high-security uploads check the real file signature ("magic bytes", e.g. with the `file-type` package) or re-encode images with `sharp`.\n3. **Never use the original file name** for storage: `../../server.js` (path traversal) or `shell.php` could be dangerous. Generate a random name (UUID) and keep the original only as metadata.\n4. **Do not store uploads inside your code folder** or serve them with execute permissions. Serve them from a separate static path or a CDN, ideally a different domain.\n5. **Authenticate** upload routes and check ownership (user A must not replace user B\'s avatar).\n6. Scan for malware when users share files with others (ClamAV, cloud services).',
      tip: 'Multer errors (too large, too many files, unexpected field) are instances of multer.MulterError with a code like LIMIT_FILE_SIZE. Catch them in your error middleware and return 400/413 with a friendly message.',
    },
    {
      heading: 'Where to store files in production',
      content:
        'The server disk is fine for learning, but in production it is a problem:\n- Platforms like Render, Railway and Heroku have an **ephemeral file system** - files disappear on every deploy/restart.\n- With 3 server instances, a file uploaded to instance 1 does not exist on instance 2.\n- Disks are expensive to back up and scale.\n\nSo real apps upload to **object storage**: Amazon S3 (or compatible: Cloudflare R2, DigitalOcean Spaces, MinIO) or a media service like **Cloudinary** (automatic resizing, CDN). The database stores only the URL/key.\n\nTwo patterns:\n- **Through your server**: multer memoryStorage → upload the buffer to S3 with `@aws-sdk/client-s3`. Simple, but your server handles all bytes.\n- **Direct upload with presigned URLs**: the server creates a short-lived signed URL (`@aws-sdk/s3-request-presigner`), the browser PUTs the file directly to S3. Scales best for large files and videos.',
    },
    {
      heading: 'Sending emails with nodemailer',
      content:
        '`npm install nodemailer`. You create a **transporter** (how to send) once, then call `sendMail()`.\n\nTransport options:\n- **SMTP** from a transactional email provider: Brevo, Mailgun, SendGrid, Amazon SES, Postmark, Resend (most also offer HTTP APIs). They handle deliverability (SPF, DKIM, DMARC records) so your mails do not land in spam.\n- **Gmail** for testing only: needs an App Password, low daily limits.\n- **Ethereal** (`nodemailer.createTestAccount()`) - a fake SMTP service where you can view the sent mail in a browser.\n- **jsonTransport / streamTransport** - builds the message without sending; perfect for unit tests.\n\nA mail has `from`, `to`, `subject`, `text` (fallback) and `html`, optionally `attachments: [{ filename, path | content }]`.\n\n**Do not make the user wait for email**: sending can take seconds or fail. For important mails use a queue (BullMQ + Redis) with retries; at minimum, do not let an email failure break registration.',
      syntax: `const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,           // e.g. smtp-relay.brevo.com
  port: 587,
  secure: false,                          // true for port 465, false uses STARTTLS on 587
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
await transporter.sendMail({ from: '"MyShop" <no-reply@myshop.com>', to, subject, text, html });`,
      tip: 'Escape user-provided values (like the user\'s name) before inserting them into HTML emails, and never put secrets in email content except one-time links that expire.',
    },
    {
      heading: 'Password reset flow (uploads + email + security together)',
      content:
        'The classic "Forgot password" feature combines what you learned this week:\n1. `POST /api/auth/forgot-password { email }` → always answer `200 "If that email exists, we sent a link"` (no user enumeration, Day 22).\n2. If the user exists: generate a random token `crypto.randomBytes(32).toString("hex")`, store only its **SHA-256 hash** and an expiry (15-30 minutes) in the DB.\n3. Email the link `https://myshop.com/reset-password?token=<raw token>`.\n4. `POST /api/auth/reset-password { token, newPassword }` → hash the received token, find a user with that hash and a non-expired time, bcrypt the new password, delete the token, and invalidate sessions/refresh tokens.\n\nStoring only the hash means a database leak does not reveal usable reset links. Rate-limit both endpoints (Day 24).',
    },
  ],
  examples: [
    {
      title: 'Avatar and product photo uploads with multer (disk storage)',
      scenario: 'Users upload a profile picture (one image, max 2 MB) and admins upload up to 5 product photos. Bad files must give clean JSON errors.',
      steps: [
        'npm init -y && npm install express multer',
        'Create server.js with the code below and run node server.js',
        'Upload with curl -F "avatar=@photo.png" -F caption=Me http://localhost:3000/api/users/me/avatar',
        'Try a .txt file, a 3 MB image, no file, and a wrong field name',
        'Upload two photos to /api/products/7/photos and open the returned url in the browser',
      ],
      code: `const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomUUID() + ext);          // never trust the original name
  },
});

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 5 },  // 2 MB per file, max 5 files
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(Object.assign(new Error('Only JPEG, PNG or WEBP images are allowed'), { status: 400 }));
  },
});

app.use('/uploads', express.static(UPLOAD_DIR));   // serve uploaded files

// single file: field name "avatar"
app.post('/api/users/me/avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'avatar file is required' });
  res.status(201).json({
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: '/uploads/' + req.file.filename,
    caption: req.body.caption,                     // text fields arrive in req.body
  });
});

// multiple files: field name "photos", up to 5
app.post('/api/products/:id/photos', upload.array('photos', 5), (req, res) => {
  res.status(201).json({ count: req.files.length, files: req.files.map(f => f.originalname) });
});

// multer errors -> 400 / 413 JSON
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const messages = {
      LIMIT_FILE_SIZE: 'File too large (max 2 MB)',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field: ' + err.field,
      LIMIT_FILE_COUNT: 'Too many files (max 5)',
    };
    return res.status(status).json({ error: messages[err.code] || err.message, code: err.code });
  }
  if (err.status) return res.status(err.status).json({ error: err.message });
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
      result: `curl -F "avatar=@photo.png;type=image/png" -F caption=Me .../api/users/me/avatar
→ 201 {"originalName":"photo.png","mimetype":"image/png","size":1500,"url":"/uploads/6fc9c7bc-9df4-4bd8-a119-1f475e2f5e1d.png","caption":"Me"}
curl -F "avatar=@notes.txt;type=text/plain" ...      → 400 {"error":"Only JPEG, PNG or WEBP images are allowed"}
curl -F "avatar=@big.jpg;type=image/jpeg" (3 MB) ... → 413 {"error":"File too large (max 2 MB)","code":"LIMIT_FILE_SIZE"}
curl -F caption=x ... (no file)                       → 400 {"error":"avatar file is required"}
curl -F "photos=@a.png" -F "photos=@b.png" .../api/products/7/photos → 201 {"count":2,"files":["a.png","b.png"]}
curl -F "wrongfield=@a.png;type=image/png" .../api/users/me/avatar   → 400 {"error":"Unexpected file field: wrongfield","code":"LIMIT_UNEXPECTED_FILE"}
GET /uploads/<generated-name>.png → 200 image/png
(the UUID in the url is different on every upload)`,
      explanation:
        'multer parses the multipart body, applies fileFilter and limits while streaming, writes the file with a UUID name and fills req.file / req.files and req.body. Errors from multer (size, unexpected field) and from our fileFilter reach the 4-argument error middleware, which converts them into JSON with the right status. express.static then serves the stored files.',
    },
    {
      title: 'API Lab simulation: upload validation rules and an email outbox',
      scenario: 'The API Lab cannot send real multipart bodies or emails, so the client sends the file metadata multer would produce, and "sent" emails go to an in-memory outbox you can inspect.',
      steps: [
        'Paste the code into the API Lab',
        'Send the upload requests: a valid image, a PDF, and a 5 MB image',
        'Register a user and then GET /api/dev/outbox to see the welcome email',
        'Compare with the real multer + nodemailer examples',
      ],
      code: `// What multer gives you in req.file (disk storage):
// { fieldname: 'avatar', originalname: 'me.png', mimetype: 'image/png', size: 48211,
//   destination: 'uploads', filename: '3f2c...e1.png', path: 'uploads/3f2c...e1.png' }`,
      api: {
        code: `const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024;
const files = [];
const outbox = []; // stand-in for nodemailer: "sent" emails land here

// Simulates multer's checks on the metadata of an uploaded file
app.post('/api/uploads', (req, res) => {
  const { originalname, mimetype, size } = req.body ?? {};
  if (!originalname) return res.status(400).json({ error: 'file is required' });
  if (!ALLOWED.includes(mimetype)) return res.status(400).json({ error: 'Only JPEG, PNG or WEBP images are allowed' });
  if (size > MAX_SIZE) return res.status(413).json({ error: 'File too large (max 2 MB)', code: 'LIMIT_FILE_SIZE' });
  const filename = 'file-' + (files.length + 1) + path.extname(originalname).toLowerCase();
  files.push({ originalname, filename, size });
  res.status(201).json({ url: '/uploads/' + filename, size });
});

function sendMail(mail) {           // real code: await transporter.sendMail(mail)
  outbox.push(mail);
  return { messageId: '<' + outbox.length + '@myshop.local>' };
}

app.post('/api/auth/register', (req, res) => {
  const { name, email } = req.body ?? {};
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  const info = sendMail({
    from: 'MyShop <no-reply@myshop.com>',
    to: email,
    subject: 'Welcome to MyShop, ' + name + '!',
    text: 'Hi ' + name + ', thanks for registering.',
  });
  res.status(201).json({ message: 'Registered', emailId: info.messageId });
});

app.get('/api/dev/outbox', (req, res) => res.json(outbox));

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/uploads', body: { originalname: 'Me.PNG', mimetype: 'image/png', size: 48211 } },
          { method: 'POST', url: '/api/uploads', body: { originalname: 'cv.pdf', mimetype: 'application/pdf', size: 90000 } },
          { method: 'POST', url: '/api/uploads', body: { originalname: 'huge.jpg', mimetype: 'image/jpeg', size: 5242880 } },
          { method: 'POST', url: '/api/auth/register', body: { name: 'Asha', email: 'asha@mail.com' } },
          { method: 'GET', url: '/api/dev/outbox' },
        ],
      },
      result: "POST /api/uploads → 201 {\"url\":\"/uploads/file-1.png\",\"size\":48211}\nPOST /api/uploads → 400 {\"error\":\"Only JPEG, PNG or WEBP images are allowed\"}\nPOST /api/uploads → 413 {\"error\":\"File too large (max 2 MB)\",\"code\":\"LIMIT_FILE_SIZE\"}\nPOST /api/auth/register → 201 {\"message\":\"Registered\",\"emailId\":\"<1@myshop.local>\"}\nGET /api/dev/outbox → 200 [{\"from\":\"MyShop <no-reply@myshop.com>\",\"to\":\"asha@mail.com\",\"subject\":\"Welcome to MyShop, Asha!\",\"text\":\"Hi Asha, thanks for registering.\"}]",
      explanation:
        'The same three checks multer performs (presence, type whitelist, size limit) give the same status codes. path.extname plus lower-casing produces a safe ".png" extension while the stored name is generated by the server. The outbox pattern is also how you test email features in real projects: inject a fake transport and assert on what would have been sent.',
    },
    {
      title: 'Send a welcome email with nodemailer',
      scenario: 'Build and inspect a real email message. jsonTransport builds the complete message without needing an SMTP server.',
      steps: [
        'npm install nodemailer',
        'Create mail.js with the code below and run node mail.js',
        'To really deliver mail, replace the transport with SMTP settings from your provider (or nodemailer.createTestAccount() for Ethereal)',
      ],
      code: `const nodemailer = require('nodemailer');

// jsonTransport builds the full message but does not send it - perfect for learning and tests.
// Production: nodemailer.createTransport({ host, port, secure, auth: { user, pass } })
const transporter = nodemailer.createTransport({ jsonTransport: true });

async function sendWelcomeEmail(user) {
  const info = await transporter.sendMail({
    from: '"MyShop" <no-reply@myshop.com>',
    to: user.email,
    subject: \`Welcome to MyShop, \${user.name}!\`,
    text: \`Hi \${user.name}, thanks for registering.\`,
    html: \`<h1>Hi \${user.name}</h1><p>Thanks for registering at <b>MyShop</b>.</p>\`,
  });
  return info;
}

sendWelcomeEmail({ name: 'Asha', email: 'asha@mail.com' }).then((info) => {
  const msg = JSON.parse(info.message);
  console.log('envelope:', info.envelope);
  console.log('subject:', msg.subject);
  console.log('to:', msg.to);
  console.log('html:', msg.html);
});`,
      result: `envelope: { from: 'no-reply@myshop.com', to: [ 'asha@mail.com' ] }
subject: Welcome to MyShop, Asha!
to: [ { address: 'asha@mail.com', name: '' } ]
html: <h1>Hi Asha</h1><p>Thanks for registering at <b>MyShop</b>.</p>`,
      explanation:
        'sendMail returns info about the message: the SMTP envelope (actual sender/recipients) and, for jsonTransport, the full message as JSON. With a real SMTP transport info.messageId and info.response ("250 OK") tell you the provider accepted the mail. Always provide a plain-text version for clients that do not render HTML.',
    },
    {
      title: 'Forgot / reset password with a hashed one-time token',
      scenario: 'Implement the complete, secure reset-password flow with nodemailer, crypto and bcrypt on a Mongoose User model.',
      steps: [
        'Add resetTokenHash and resetTokenExpires fields to the User schema',
        'POST /forgot-password: create a random token, save its SHA-256 hash, email the raw token link',
        'POST /reset-password: hash the received token, find a matching unexpired user, set the new password',
        'Always respond with the same message from forgot-password',
      ],
      code: `const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: 587, secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const genericReply = { message: 'If that email is registered, a reset link has been sent.' };
  const user = await User.findOne({ email: String(req.body?.email || '').toLowerCase() });
  if (!user) return res.json(genericReply);

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetTokenHash = sha256(rawToken);                 // store only the hash
  user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const link = \`\${process.env.CLIENT_URL}/reset-password?token=\${rawToken}\`;
  try {
    await transporter.sendMail({
      from: '"MyShop" <no-reply@myshop.com>',
      to: user.email,
      subject: 'Reset your MyShop password',
      text: \`Reset your password (valid 30 minutes): \${link}\`,
      html: \`<p>Click to reset your password (valid 30 minutes):</p><p><a href="\${link}">Reset password</a></p>\`,
    });
  } catch (err) {
    console.error('Email failed', err.message);           // log, but do not reveal to the client
  }
  res.json(genericReply);
};

// POST /api/auth/reset-password  { token, newPassword }
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body ?? {};
  if (!token || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Valid token and a password of 8+ characters are required' });
  }
  const user = await User.findOne({
    resetTokenHash: sha256(String(token)),
    resetTokenExpires: { $gt: new Date() },
  }).select('+password');
  if (!user) return res.status(400).json({ error: 'Reset link is invalid or has expired' });

  user.password = newPassword;            // pre('save') hook hashes it with bcrypt (Day 22)
  user.resetTokenHash = undefined;        // one-time use
  user.resetTokenExpires = undefined;
  user.tokenVersion = (user.tokenVersion || 0) + 1;   // log out other sessions (Day 23)
  await user.save();
  res.json({ message: 'Password updated. Please log in.' });
};`,
      result:
        'POST /api/auth/forgot-password {"email":"asha@mail.com"} → 200 {"message":"If that email is registered, a reset link has been sent."} (same reply for unknown emails). Asha receives a link with a 64-character hex token. POST /api/auth/reset-password with that token → 200 {"message":"Password updated. Please log in."}; reusing the same token → 400 {"error":"Reset link is invalid or has expired"}.',
      explanation:
        'crypto.randomBytes(32) gives 256 bits of randomness - impossible to guess. Only the SHA-256 hash is stored (a fast hash is fine here because the token is long and random, unlike human passwords). Expiry plus deletion after use make the link one-time. Bumping tokenVersion kicks out an attacker who may already be logged in.',
    },
    {
      title: 'Uploading to Cloudinary / S3 with memoryStorage',
      scenario: 'Prepare uploads for production hosting where the local disk is temporary.',
      steps: [
        'npm install multer @aws-sdk/client-s3',
        'Use multer.memoryStorage() so the file is a Buffer in req.file.buffer',
        'Send the buffer to S3 with PutObjectCommand using a generated key',
        'Save only the resulting URL/key in the database',
      ],
      code: `const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: process.env.AWS_REGION });   // credentials from env / IAM role
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\\/(png|jpe?g|webp)$/.test(file.mimetype)),
});

app.post('/api/products/:id/image', authenticate, authorize('admin'), upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image (png/jpg/webp, max 5 MB) is required' });
  const key = \`products/\${req.params.id}/\${crypto.randomUUID()}\${path.extname(req.file.originalname).toLowerCase()}\`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  }));
  const url = \`https://\${process.env.S3_BUCKET}.s3.\${process.env.AWS_REGION}.amazonaws.com/\${key}\`;
  await Product.findByIdAndUpdate(req.params.id, { $push: { images: url } });
  res.status(201).json({ url });
});`,
      result:
        'POST /api/products/66f.../image (admin token, image field) → 201 {"url":"https://myshop-media.s3.ap-south-1.amazonaws.com/products/66f.../9b1c....jpg"}. The file lives in S3, survives deploys and is shared by all server instances.',
      explanation:
        'memoryStorage avoids temporary files; the size limit protects RAM. When fileFilter calls cb(null, false) the file is skipped silently, so req.file is undefined and we answer 400. In Express 5 a failed S3 upload (rejected promise) automatically reaches the error middleware.',
    },
  ],
  interview: [
    { q: 'Why can\'t express.json() handle file uploads?', a: 'File uploads are sent as multipart/form-data (binary parts separated by a boundary). express.json only parses application/json and express.urlencoded parses form-urlencoded text. A multipart parser such as multer (busboy) is required.', level: 'Easy' },
    { q: 'Difference between upload.single, upload.array and upload.fields?', a: 'single("f") accepts one file → req.file; array("f", n) accepts up to n files from one field → req.files array; fields([{name, maxCount}]) accepts several named fields → req.files object keyed by field name. upload.none() accepts only text fields.', level: 'Easy' },
    { q: 'diskStorage vs memoryStorage?', a: 'diskStorage streams files to a folder with a destination and filename you control - good for local storage. memoryStorage keeps the file as a Buffer in req.file.buffer - convenient for forwarding to S3/Cloudinary or processing with sharp, but must be combined with a strict size limit to protect RAM.', level: 'Medium' },
    { q: 'How do you secure file uploads?', a: 'Authenticate and authorize the route; limit size and count; whitelist MIME types and ideally verify magic bytes or re-encode images; generate random file names (no path traversal); store outside the app folder or in object storage; serve with correct Content-Type and nosniff, ideally from a separate domain/CDN; scan files shared with other users.', level: 'Hard' },
    { q: 'How do you handle multer errors like a file that is too large?', a: 'multer passes a MulterError (err.code LIMIT_FILE_SIZE, LIMIT_FILE_COUNT, LIMIT_UNEXPECTED_FILE...) to next(err). In a 4-argument error middleware check err instanceof multer.MulterError and respond 413/400 with a friendly JSON message.', level: 'Medium' },
    { q: 'Why not store uploaded files on the server disk in production?', a: 'Many PaaS file systems are ephemeral (wiped on deploy/restart), multiple instances do not share a disk, and backups/scaling are harder. Object storage (S3, R2, GCS) or Cloudinary is durable, cheap, CDN-friendly; the DB stores the URL/key.', level: 'Medium' },
    { q: 'What is a presigned URL?', a: 'A time-limited URL signed by the server with cloud credentials that allows the client to upload (PUT) or download a specific object directly from S3 without going through the API server and without having credentials. Great for large files.', level: 'Hard' },
    { q: 'What is a nodemailer transporter and which transports are common?', a: 'An object created with createTransport() that knows how to deliver messages: SMTP (provider host/port/auth), SES, sendmail, or test transports like Ethereal, jsonTransport and streamTransport. You create it once and reuse it for all sendMail calls.', level: 'Easy' },
    { q: 'Why should emails be sent asynchronously or via a queue?', a: 'SMTP calls can be slow or fail temporarily; making the HTTP response wait hurts UX and an email failure should not fail the main action. A job queue (BullMQ/Redis, SQS) sends in the background with retries and rate limits.', level: 'Medium' },
    { q: 'How do you implement a secure password-reset token?', a: 'Generate a long random token (crypto.randomBytes(32)), store only its hash with a short expiry, email the raw token link, verify by hashing the submitted token and checking expiry, make it single-use, rate-limit the endpoints, and respond identically whether or not the email exists.', level: 'Hard' },
    { q: 'What are SPF, DKIM and DMARC?', a: 'Email authentication DNS records: SPF lists servers allowed to send for your domain, DKIM adds a cryptographic signature to messages, DMARC tells receivers what to do when SPF/DKIM fail and where to send reports. Configuring them (usually via your email provider) keeps your mails out of spam.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a product route that accepts one "cover" image and up to 4 "gallery" images using upload.fields and returns the stored file names grouped by field.',
      hint: 'req.files is an object: { cover: [file], gallery: [file, ...] }.',
      solution: `app.post('/api/products', upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'gallery', maxCount: 4 },
]), (req, res) => {
  if (!req.files?.cover) return res.status(400).json({ error: 'cover image is required' });
  res.status(201).json({
    name: req.body.name,
    cover: '/uploads/' + req.files.cover[0].filename,
    gallery: (req.files.gallery || []).map(f => '/uploads/' + f.filename),
  });
});`,
    },
    {
      task: 'Add DELETE /api/users/me/avatar that removes the old file from disk safely (only inside the uploads folder) and clears the avatar field.',
      hint: 'Use path.basename to strip any directories, then fs.promises.unlink; ignore ENOENT.',
      solution: `const fsp = require('fs/promises');
app.delete('/api/users/me/avatar', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.avatar) {
    const file = path.join(UPLOAD_DIR, path.basename(user.avatar)); // no ../ tricks
    await fsp.unlink(file).catch(err => { if (err.code !== 'ENOENT') throw err; });
    user.avatar = undefined;
    await user.save();
  }
  res.sendStatus(204);
});`,
    },
    {
      task: 'Write a React component AvatarUpload that previews the selected image and uploads it with FormData and fetch, showing progress text and errors.',
      hint: 'URL.createObjectURL for preview; do not set Content-Type manually.',
      solution: `function AvatarUpload({ token }) {
  const [file, setFile] = React.useState(null);
  const [status, setStatus] = React.useState('');
  const preview = React.useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    setStatus('Uploading...');
    const res = await fetch('/api/users/me/avatar', {
      method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: fd,
    });
    const data = await res.json();
    setStatus(res.ok ? 'Uploaded: ' + data.url : 'Error: ' + data.error);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setFile(e.target.files[0])} />
      {preview && <img src={preview} alt="preview" width="120" />}
      <button disabled={!file}>Upload</button>
      <p>{status}</p>
    </form>
  );
}`,
    },
    {
      task: 'Create a mailer.js module with a sendEmail({ to, subject, html }) function that uses Ethereal in development (logging the preview URL) and SMTP from env vars in production.',
      hint: 'nodemailer.createTestAccount() and nodemailer.getTestMessageUrl(info).',
      solution: `const nodemailer = require('nodemailer');
let transporterPromise;

async function getTransporter() {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  const test = await nodemailer.createTestAccount();
  return nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, auth: { user: test.user, pass: test.pass } });
}

async function sendEmail({ to, subject, html }) {
  transporterPromise ??= getTransporter();          // create once, reuse
  const transporter = await transporterPromise;
  const info = await transporter.sendMail({ from: '"MyShop" <no-reply@myshop.com>', to, subject, html });
  if (process.env.NODE_ENV !== 'production') console.log('Preview:', nodemailer.getTestMessageUrl(info));
  return info;
}
module.exports = { sendEmail };`,
    },
    {
      task: 'Send an order invoice email with a PDF attachment that already exists at invoices/<orderId>.pdf and an inline logo image.',
      hint: 'attachments: [{ filename, path }, { filename, path, cid }] and <img src="cid:...">.',
      solution: `await transporter.sendMail({
  from: '"MyShop" <billing@myshop.com>',
  to: order.customerEmail,
  subject: \`Invoice for order #\${order.id}\`,
  html: \`<img src="cid:logo@myshop" width="120"><p>Thanks for your order #\${order.id}. Your invoice is attached.</p>\`,
  attachments: [
    { filename: \`invoice-\${order.id}.pdf\`, path: path.join(__dirname, 'invoices', order.id + '.pdf') },
    { filename: 'logo.png', path: path.join(__dirname, 'public', 'logo.png'), cid: 'logo@myshop' },
  ],
});`,
    },
  ],
  quiz: [
    { question: 'Where does multer put a single uploaded file when you use upload.single("avatar")?', options: ['req.body.avatar', 'req.files[0]', 'req.file', 'req.upload'], answer: 2, explanation: 'single() → req.file; array()/fields() → req.files.' },
    { question: 'Which Content-Type do browsers use to upload files from a form?', options: ['multipart/form-data', 'application/json', 'text/plain', 'application/x-www-form-urlencoded'], answer: 0, explanation: 'Files are sent as multipart/form-data with a boundary.' },
    { question: 'Why should you NOT save uploads using file.originalname?', options: ['It is too long', 'multer forbids it', 'It is always undefined', 'Names can collide or contain path traversal / dangerous extensions'], answer: 3, explanation: 'Generate random names (UUID) and keep the original name only as metadata.' },
    { question: 'Which multer error code means the file exceeded limits.fileSize?', options: ['LIMIT_FIELD_KEY', 'LIMIT_FILE_SIZE', 'ENOSPC', 'FILE_TOO_BIG'], answer: 1, explanation: 'MulterError with code LIMIT_FILE_SIZE (good to map to 413).' },
    { question: 'In a password-reset flow, what should be stored in the database?', options: ['The raw token', 'The user\'s new password in plain text', 'A hash of the random token plus an expiry time', 'Nothing - the token is in the email'], answer: 2, explanation: 'Store only a hash with expiry so a DB leak does not reveal usable reset links.' },
  ],
};
