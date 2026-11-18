export default {
  id: 'day-07-file-and-image-uploads-end-to-end',
  title: 'File and Image Uploads End to End: React Previews, Multer, Cloudinary and Signed Direct Uploads',
  module: 'Module 3: Real Features',
  day: 7,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Build a complete image upload feature for a MERN app: a React picker with instant previews, validation and progress bar, an Express 5 endpoint that streams files from multer memory storage to Cloudinary, signed direct-to-Cloudinary uploads for large files, and storing only the URL and public_id in MongoDB.',
  objectives: [
    'Explain why images are stored in a cloud service (Cloudinary/S3) and only metadata in MongoDB',
    'Build a React file picker with previews (URL.createObjectURL), client-side validation and upload progress',
    'Upload through the server with multer memoryStorage + Cloudinary upload_stream, with limits and fileFilter',
    'Implement signed direct uploads (server signs, browser uploads straight to Cloudinary) and save the result safely',
    'Delete and replace images correctly so you do not leave orphan files',
  ],
  theory: [
    {
      heading: 'Where do uploaded files live in a MERN app?',
      content:
        "Beginners often save images to a `uploads/` folder on the Express server. That works on your laptop but breaks in production:\n\n- Render, Railway, Heroku and Docker containers have an **ephemeral file system**: files disappear when the app restarts or redeploys.\n- With 2+ server instances, a file saved on instance A does not exist on instance B.\n- Serving images from Node wastes CPU that should serve your API.\n\nThe production pattern is:\n\n1. Store the **file** in object storage / a media CDN: **Cloudinary** (popular in India, generous free tier, built-in transformations), AWS S3 + CloudFront, or Firebase Storage.\n2. Store only **metadata** in MongoDB: `{ url, publicId, width, height, bytes, format }`.\n3. Serve images from the CDN with on-the-fly resizing (`w_400,f_auto,q_auto`).\n\nAnalogy: MongoDB is your **register book** that says \"photo #17 is in locker B-12\"; Cloudinary is the **locker room**. You never put the actual photo inside the register.",
      syntax: `// server/src/models/Product.js
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },       // https://res.cloudinary.com/<cloud>/image/upload/v1/products/abc.jpg
    publicId: { type: String, required: true },  // products/abc  (needed to delete/transform)
    width: Number,
    height: Number,
  },
  { _id: false },
);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [imageSchema], validate: [(a) => a.length <= 5, 'Max 5 images'] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });`,
    },
    {
      heading: 'Two upload architectures: through the server vs direct (signed)',
      content:
        "**A. Upload through your server** (browser → Express → Cloudinary)\n\n- React sends `multipart/form-data` with `FormData`.\n- `multer` parses it; with `memoryStorage()` the file is a Buffer in `req.file.buffer`.\n- The server streams the buffer to Cloudinary with `upload_stream` and saves the result.\n- Pros: simple, the server sees and validates the real file. Cons: every byte passes through your server (bandwidth, memory, 30s request timeouts on some hosts). Good for avatars and small images (≤ 5 MB).\n\n**B. Signed direct upload** (browser → Cloudinary, server only signs)\n\n1. React asks `POST /api/uploads/signature` (authenticated).\n2. Express creates a signature with the **API secret** for fixed parameters (`timestamp`, `folder`, maybe `public_id`), using `cloudinary.utils.api_sign_request`.\n3. React posts the file + `api_key`, `timestamp`, `signature`, `folder` directly to `https://api.cloudinary.com/v1_1/<cloud>/image/upload`.\n4. Cloudinary returns `secure_url` and `public_id`; React sends those to `POST /api/products/:id/images`, and the server verifies they belong to your cloud and allowed folder before saving.\n\n- Pros: large files and videos never touch your server, faster, scales well. Cons: a bit more code, and you must validate what the client reports back.\n\n**Unsigned upload presets** let anyone upload with only the preset name. They are fine for demos but in real apps prefer signed uploads so only logged-in users can upload, into folders you choose.",
      points: [
        'Never send the Cloudinary API secret to the browser; only the signature',
        'The signature includes a timestamp and expires (Cloudinary rejects signatures older than 1 hour)',
        'S3 equivalent of a signed upload: a presigned PUT/POST URL from the AWS SDK',
      ],
    },
    {
      heading: 'multer essentials for production',
      content:
        "multer is middleware for `multipart/form-data`. Key options:\n\n- `storage: multer.memoryStorage()` keeps the file in RAM as a Buffer (good for forwarding to Cloudinary). `diskStorage` writes to disk (only for temporary files).\n- `limits: { fileSize: 5 * 1024 * 1024, files: 5 }` rejects big or too many files with a `MulterError` (`LIMIT_FILE_SIZE`, `LIMIT_FILE_COUNT`, `LIMIT_UNEXPECTED_FILE`).\n- `fileFilter(req, file, cb)` accepts or rejects by `file.mimetype`.\n- `upload.single('avatar')` → `req.file`; `upload.array('images', 5)` → `req.files`; `upload.fields([...])` for several fields.\n\n**The field name must match**: if React appends `formData.append('images', file)` the server must use `upload.array('images')`, otherwise you get \"Unexpected field\".\n\n**Do not trust the mimetype**. It comes from the client. For stricter checks read the magic bytes with the `file-type` package, and let Cloudinary re-encode the image (`resource_type: 'image'` rejects non-images).\n\nmulter 2.x is the current major version (it fixed security issues in 1.x); install `multer@2`.",
      syntax: `import multer from 'multer';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
  },
});`,
    },
    {
      heading: 'React side: FormData, previews and progress',
      content:
        "On the client you need four things:\n\n1. `<input type=\"file\" accept=\"image/*\" multiple>`: `accept` only filters the dialog; still validate in JS.\n2. **Previews**: `URL.createObjectURL(file)` returns a temporary `blob:` URL you can put in `<img src>`. Call `URL.revokeObjectURL(url)` when the preview is removed or the component unmounts to free memory.\n3. **FormData**: `const fd = new FormData(); files.forEach(f => fd.append('images', f));` Do NOT set the `Content-Type` header yourself; axios/fetch add the correct `multipart/form-data; boundary=...`.\n4. **Progress**: axios supports `onUploadProgress: (e) => setProgress(Math.round(e.loaded * 100 / e.total))`. `fetch` does not report upload progress.\n\nWith TanStack Query wrap the upload in `useMutation` and invalidate the product query on success so the gallery refreshes.\n\nGood UX extras: drag-and-drop zone, show file size, compress large photos in the browser (`browser-image-compression`) before upload, and disable the submit button while uploading.",
    },
    {
      heading: 'Replacing and deleting images (no orphans)',
      content:
        "An **orphan** is a file in Cloudinary that no document points to. Orphans cost storage money and may contain personal data you promised to delete.\n\nRules:\n\n- When a product is deleted, delete its images: `cloudinary.uploader.destroy(publicId)` for each (or `cloudinary.api.delete_resources([...ids])`).\n- When a user changes their avatar: upload the new one, save it in MongoDB, **then** destroy the old `publicId`. If you delete first and the upload fails, the user has no avatar.\n- If the DB save fails after a successful upload, destroy the just-uploaded file in the `catch`.\n- For signed direct uploads, a user might upload and never save. Use a **tag** like `pending` and a scheduled cleanup job, or Cloudinary's upload with `folder: 'tmp'` and a periodic sweep.\n\nAlways do the ownership check (Day 5) before deleting: only the product owner or an admin can remove its images.",
    },
    {
      heading: 'Delivering images fast: transformations and CDN',
      content:
        "Never send a 4000px phone photo to a 300px product card. Cloudinary transforms images through the URL:\n\n`https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,g_auto,f_auto,q_auto/products/shoe.jpg`\n\n- `w_400,h_400,c_fill`: resize and crop to 400x400\n- `g_auto`: smart crop around the important part\n- `f_auto`: send WebP/AVIF to browsers that support them\n- `q_auto`: automatic quality/size balance\n\nIn React use `srcSet` for responsive images and `loading=\"lazy\"` for images below the fold. Store the original `publicId` and build URLs with a helper (or the `@cloudinary/url-gen` SDK) instead of storing many URL sizes.",
      syntax: `// client/src/lib/img.js
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const img = (publicId, w) =>
  \`https://res.cloudinary.com/\${CLOUD}/image/upload/w_\${w},c_fill,g_auto,f_auto,q_auto/\${publicId}\`;

<img
  src={img(p.images[0].publicId, 400)}
  srcSet={\`\${img(p.images[0].publicId, 400)} 400w, \${img(p.images[0].publicId, 800)} 800w\`}
  sizes="(max-width: 640px) 100vw, 400px"
  loading="lazy"
  alt={p.name}
/>`,
    },
  ],
  examples: [
    {
      title: 'React image picker with previews, validation and simulated progress',
      scenario: 'A seller adds up to 3 product photos. Show previews instantly, reject non-images and files over 2 MB, and show an upload progress bar.',
      steps: [
        'Render an input type="file" with accept="image/*" and multiple',
        'Validate each file (type and size) and create preview URLs with URL.createObjectURL',
        'Revoke preview URLs when removing a file and on unmount',
        'On submit, build FormData (real app: axios.post with onUploadProgress)',
        'Click Run, choose some images from your computer and press Upload',
      ],
      code: `// client/src/features/products/ImagePicker.jsx (real app)
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

const MAX = 3, MAX_BYTES = 2 * 1024 * 1024, TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImagePicker({ productId }) {
  const [items, setItems] = useState([]);   // { file, url }
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const qc = useQueryClient();

  useEffect(() => () => items.forEach((i) => URL.revokeObjectURL(i.url)), []); // eslint-disable-line

  const upload = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      items.forEach((i) => fd.append('images', i.file));
      return api.post(\`/products/\${productId}/images\`, fd, {
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
    },
    onSuccess: () => {
      items.forEach((i) => URL.revokeObjectURL(i.url));
      setItems([]);
      qc.invalidateQueries({ queryKey: ['products', productId] });
    },
  });

  function onPick(e) {
    const picked = [...e.target.files];
    const bad = picked.find((f) => !TYPES.includes(f.type) || f.size > MAX_BYTES);
    if (bad) return setError(bad.name + ': only JPG/PNG/WebP up to 2 MB');
    if (items.length + picked.length > MAX) return setError('Maximum ' + MAX + ' images');
    setError('');
    setItems((prev) => [...prev, ...picked.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
    e.target.value = '';
  }
  // ...render same as the playground
}`,
      playground: {
        jsx: `const { useState, useEffect, useRef } = React;
const MAX = 3, MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function App() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => () => itemsRef.current.forEach(i => URL.revokeObjectURL(i.url)), []);

  function onPick(e) {
    const picked = Array.from(e.target.files);
    const bad = picked.find(f => !TYPES.includes(f.type) || f.size > MAX_BYTES);
    if (bad) { setError(bad.name + ': only images up to 2 MB'); e.target.value = ''; return; }
    if (items.length + picked.length > MAX) { setError('Maximum ' + MAX + ' images'); e.target.value = ''; return; }
    setError('');
    setItems(prev => [...prev, ...picked.map(file => ({ file, url: URL.createObjectURL(file) }))]);
    e.target.value = '';
  }

  function remove(idx) {
    URL.revokeObjectURL(items[idx].url);
    setItems(items.filter((_, i) => i !== idx));
  }

  function upload() {
    const fd = new FormData();
    items.forEach(i => fd.append('images', i.file));
    console.log('FormData fields:', [...fd.keys()].join(', '));
    // real app: api.post(url, fd, { onUploadProgress })
    setProgress(0);
    let p = 0;
    const t = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) { clearInterval(t); console.log('Uploaded', items.length, 'file(s)'); }
    }, 300);
  }

  const kb = n => (n / 1024).toFixed(0) + ' KB';
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 520 }}>
      <h3>Product photos ({items.length}/{MAX})</h3>
      <input type="file" accept="image/*" multiple onChange={onPick} disabled={items.length >= MAX} />
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {items.map((i, idx) => (
          <figure key={i.url} style={{ margin: 0, width: 120 }}>
            <img src={i.url} alt={i.file.name} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
            <figcaption style={{ fontSize: 12 }}>{kb(i.file.size)} <button onClick={() => remove(idx)}>x</button></figcaption>
          </figure>
        ))}
      </div>
      <button onClick={upload} disabled={!items.length || (progress !== null && progress < 100)} style={{ marginTop: 12 }}>
        Upload
      </button>
      {progress !== null && (
        <div style={{ marginTop: 8, background: '#eee', borderRadius: 4 }}>
          <div style={{ width: progress + '%', background: '#16a34a', color: '#fff', fontSize: 12, padding: 2, borderRadius: 4, transition: 'width .3s' }}>
            {progress}%
          </div>
        </div>
      )}
    </div>
  );
}`,
      },
      result: 'Choosing images shows square previews immediately with their size. A PDF or a file over 2 MB shows a red error. Upload logs "FormData fields: images, images" in the console and the progress bar fills to 100%.',
      explanation:
        "URL.createObjectURL gives the browser a local blob: URL for the file, so the preview appears before any upload. Revoking it frees memory. Resetting e.target.value lets the user pick the same file again. The FormData uses the same field name ('images') that multer expects with upload.array('images'). The progress bar is simulated here; in the real app axios onUploadProgress reports actual bytes sent.",
    },
    {
      title: 'Server upload: multer memoryStorage → Cloudinary upload_stream → MongoDB',
      scenario: 'POST /api/products/:id/images receives up to 5 images, uploads them to Cloudinary in parallel and saves url + publicId on the product.',
      steps: [
        'npm i multer@2 cloudinary and configure Cloudinary from env variables',
        'Create the uploadImages multer middleware with limits and fileFilter',
        'Write a helper that wraps upload_stream in a Promise',
        'In the controller: check ownership, upload with Promise.all, push to product.images, save',
        'Map MulterError codes to 400/413 in the error handler',
      ],
      code: `// server/src/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
export default cloudinary;

// server/src/utils/uploadBuffer.js
import cloudinary from '../config/cloudinary.js';
export function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', ...options },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    stream.end(buffer);
  });
}

// server/src/routes/products.js
router.post('/:id/images', protect, uploadImages.array('images', 5), addProductImages);

// server/src/controllers/productImages.js
import Product from '../models/Product.js';
import { uploadBuffer } from '../utils/uploadBuffer.js';
import cloudinary from '../config/cloudinary.js';

export async function addProductImages(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (!product.owner.equals(req.user.id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not your product' });
  }
  if (!req.files?.length) return res.status(400).json({ message: 'No images received' });
  if (product.images.length + req.files.length > 5) {
    return res.status(400).json({ message: 'A product can have at most 5 images' });
  }

  const results = await Promise.all(
    req.files.map((f) => uploadBuffer(f.buffer, { folder: 'products/' + product.id })),
  );
  try {
    product.images.push(...results.map((r) => ({
      url: r.secure_url, publicId: r.public_id, width: r.width, height: r.height,
    })));
    await product.save();
  } catch (err) {
    await cloudinary.api.delete_resources(results.map((r) => r.public_id)); // no orphans
    throw err;
  }
  res.status(201).json(product.images);
}

// server/src/middleware/error.js (part)
import multer from 'multer';
export function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5 MB)' : err.message });
  }
  // ...other errors
}`,
      explanation:
        "memoryStorage keeps each file as a Buffer, and upload_stream streams it to Cloudinary without writing temp files (important on read-only or ephemeral disks). Promise.all uploads in parallel. Express 5 forwards rejected promises to the error handler automatically, so no try/catch is needed except where we must clean up uploaded files. The folder 'products/<id>' keeps media organised and makes cleanup easy. MulterError codes become clear 400/413 responses for the React app.",
    },
    {
      title: 'Simulating multer limits and fileFilter (API Lab)',
      scenario: 'You want to see exactly which status code and message React receives for wrong type, too large and too many files. The API Lab cannot send real files, so a tiny middleware reads file metadata from JSON and applies the same rules multer would.',
      steps: [
        'Define the same ALLOWED types and MAX_BYTES you use in multer',
        'Write fakeMulter that turns rule violations into errors with multer-like codes',
        'Map the codes to 400/413 in a 4-argument error handler',
        'Send a valid upload, a PDF, a 9 MB image and 6 files',
      ],
      code: `// Real code: multer({ limits: { fileSize: MAX_BYTES, files: 5 }, fileFilter }) does these checks.
// See the API Lab code for the simulation.`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 5;

class UploadError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

// Simulates multer: real multer reads multipart data; here req.body.files = [{ name, mimetype, size }]
function fakeMulter(req, res, next) {
  const files = req.body.files || [];
  if (files.length > MAX_FILES) return next(new UploadError('LIMIT_FILE_COUNT', 'Too many files (max 5)'));
  for (const f of files) {
    if (!ALLOWED.includes(f.mimetype)) return next(new UploadError('LIMIT_UNEXPECTED_FILE', f.name + ' is not a JPG/PNG/WebP image'));
    if (f.size > MAX_BYTES) return next(new UploadError('LIMIT_FILE_SIZE', f.name + ' is larger than 5 MB'));
  }
  req.files = files;
  next();
}

app.post('/api/products/:id/images', fakeMulter, (req, res) => {
  if (!req.files.length) return res.status(400).json({ message: 'No images received' });
  const images = req.files.map((f, i) => ({
    url: 'https://res.cloudinary.com/demo/image/upload/products/' + req.params.id + '/img' + (i + 1) + '.webp',
    publicId: 'products/' + req.params.id + '/img' + (i + 1),
  }));
  res.status(201).json(images);
});

app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ code: err.code, message: err.message });
  if (err.code && err.code.startsWith('LIMIT_')) return res.status(400).json({ code: err.code, message: err.message });
  res.status(500).json({ message: 'Upload failed' });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/products/p42/images', body: { files: [{ name: 'shoe.jpg', mimetype: 'image/jpeg', size: 350000 }] } },
          { method: 'POST', url: '/api/products/p42/images', body: { files: [{ name: 'invoice.pdf', mimetype: 'application/pdf', size: 90000 }] } },
          { method: 'POST', url: '/api/products/p42/images', body: { files: [{ name: 'raw.png', mimetype: 'image/png', size: 9000000 }] } },
          { method: 'POST', url: '/api/products/p42/images', body: { files: [1, 2, 3, 4, 5, 6].map((n) => ({ name: n + '.jpg', mimetype: 'image/jpeg', size: 1000 })) } },
        ],
      },
      result: "POST /api/products/p42/images → 201 [{\"url\":\"https://res.cloudinary.com/demo/image/upload/products/p42/img1.webp\",\"publicId\":\"products/p42/img1\"}]\nPOST /api/products/p42/images → 400 {\"code\":\"LIMIT_UNEXPECTED_FILE\",\"message\":\"invoice.pdf is not a JPG/PNG/WebP image\"}\nPOST /api/products/p42/images → 413 {\"code\":\"LIMIT_FILE_SIZE\",\"message\":\"raw.png is larger than 5 MB\"}\nPOST /api/products/p42/images → 400 {\"code\":\"LIMIT_FILE_COUNT\",\"message\":\"Too many files (max 5)\"}",
      explanation:
        "The valid image returns 201 with the url and publicId that will be stored in MongoDB. The PDF fails the fileFilter (400), the 9 MB PNG hits the size limit (413 Payload Too Large) and six files exceed the count limit (400). Real multer raises MulterError with the same codes (LIMIT_FILE_SIZE, LIMIT_FILE_COUNT, LIMIT_UNEXPECTED_FILE), so your real error handler can use the same mapping and React can show err.response.data.message.",
    },
    {
      title: 'Signed direct upload: server signs, React uploads straight to Cloudinary',
      scenario: 'Sellers upload 20 MB product videos. You do not want those bytes to pass through your Render server.',
      steps: [
        'Create POST /api/uploads/signature (protected) that signs timestamp + folder with the API secret',
        'In React, request a signature, then POST the file to api.cloudinary.com with axios and progress',
        'Send the returned public_id and secure_url to your API',
        'On the server, verify the URL host/cloud and folder before saving (next example)',
      ],
      code: `// ===== server/src/controllers/uploads.js =====
import cloudinary from '../config/cloudinary.js';

export function getUploadSignature(req, res) {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'products/' + req.user.id;          // user cannot choose another folder
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
  res.json({
    timestamp, folder, signature,
    apiKey: process.env.CLOUDINARY_API_KEY,             // public, fine to send
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
// routes: router.post('/uploads/signature', protect, getUploadSignature);

// ===== client/src/api/uploads.js =====
import axios from 'axios';
import { api } from './client';

export async function directUpload(file, onProgress, resourceType = 'auto') {
  const { data: s } = await api.post('/uploads/signature');
  const fd = new FormData();
  fd.append('file', file);
  fd.append('api_key', s.apiKey);
  fd.append('timestamp', s.timestamp);
  fd.append('signature', s.signature);
  fd.append('folder', s.folder);

  // plain axios (NOT our api instance) so we don't send our cookies/Authorization to Cloudinary
  const { data } = await axios.post(
    \`https://api.cloudinary.com/v1_1/\${s.cloudName}/\${resourceType}/upload\`,
    fd,
    { onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)) },
  );
  return { url: data.secure_url, publicId: data.public_id, resourceType: data.resource_type };
}

// ===== usage in a component =====
const media = await directUpload(file, setProgress, 'video');
await api.post(\`/products/\${id}/media\`, media);`,
      explanation:
        "The API secret never leaves the server; the browser only gets a signature valid for these exact parameters (timestamp + folder). If the user changes the folder, Cloudinary rejects the upload because the signature no longer matches, and signatures expire after about an hour. The upload goes directly to Cloudinary's CDN, so your server handles only two small JSON requests. Every parameter you add to the FormData (except file, api_key, resource_type, cloud_name) must also be in paramsToSign.",
    },
    {
      title: 'Saving direct-upload results safely + deleting images (API Lab)',
      scenario: 'After a direct upload React sends { url, publicId }. A malicious user could send any URL. Validate it, limit to 5 images, and support delete.',
      steps: [
        'Check that the URL starts with your Cloudinary delivery prefix',
        "Check that publicId is inside the user's allowed folder",
        'Reject when the product already has 5 images',
        'DELETE /images/:publicId removes it from the product (real code also calls cloudinary.uploader.destroy)',
        'Run all requests and compare responses',
      ],
      code: `// Real controller adds: await cloudinary.uploader.destroy(publicId) on delete,
// and reads req.user from the protect middleware (JWT).`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const CLOUD_PREFIX = 'https://res.cloudinary.com/shopcloud/';
const product = { id: 'p1', owner: 'u7', images: [] };

// pretend protect middleware already decoded the JWT
app.use((req, res, next) => { req.user = { id: 'u7' }; next(); });

app.post('/api/products/p1/images', (req, res) => {
  const { url, publicId } = req.body;
  if (typeof url !== 'string' || !url.startsWith(CLOUD_PREFIX)) {
    return res.status(400).json({ message: 'Image must be hosted on our Cloudinary account' });
  }
  if (typeof publicId !== 'string' || !publicId.startsWith('products/' + req.user.id + '/')) {
    return res.status(403).json({ message: 'Image is not in your upload folder' });
  }
  if (product.images.length >= 5) return res.status(400).json({ message: 'Max 5 images' });
  product.images.push({ url, publicId });
  res.status(201).json({ count: product.images.length, images: product.images.map(i => i.publicId) });
});

// publicId contains slashes, so use a splat route (Express 5 syntax)
app.delete('/api/products/p1/images/*publicId', (req, res) => {
  const raw = req.params.publicId; // Express 5 gives an array of segments
  const publicId = Array.isArray(raw) ? raw.join('/') : raw;
  const before = product.images.length;
  product.images = product.images.filter(i => i.publicId !== publicId);
  if (product.images.length === before) return res.status(404).json({ message: 'Image not found' });
  // real app: await cloudinary.uploader.destroy(publicId);
  res.json({ deleted: publicId, count: product.images.length });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/products/p1/images', body: { url: 'https://res.cloudinary.com/shopcloud/image/upload/v1/products/u7/a.jpg', publicId: 'products/u7/a' } },
          { method: 'POST', url: '/api/products/p1/images', body: { url: 'https://evil.example/malware.jpg', publicId: 'products/u7/b' } },
          { method: 'POST', url: '/api/products/p1/images', body: { url: 'https://res.cloudinary.com/shopcloud/image/upload/v1/products/u9/c.jpg', publicId: 'products/u9/c' } },
          { method: 'DELETE', url: '/api/products/p1/images/products/u7/a' },
          { method: 'DELETE', url: '/api/products/p1/images/products/u7/a' },
        ],
      },
      result: "POST /api/products/p1/images → 201 {\"count\":1,\"images\":[\"products/u7/a\"]}\nPOST /api/products/p1/images → 400 {\"message\":\"Image must be hosted on our Cloudinary account\"}\nPOST /api/products/p1/images → 403 {\"message\":\"Image is not in your upload folder\"}\nDELETE /api/products/p1/images/products/u7/a → 200 {\"deleted\":\"products/u7/a\",\"count\":0}\nDELETE /api/products/p1/images/products/u7/a → 404 {\"message\":\"Image not found\"}",
      explanation:
        "Only URLs from our own Cloudinary account and publicIds inside the user's folder (products/u7/) are accepted, so a user cannot attach random external URLs or someone else's media. Because publicIds contain slashes, the delete route uses the Express 5 splat syntax /*publicId, which in Express 5 gives an array of path segments that we join back with '/' (the Array.isArray check also handles simulators that return a plain string). Deleting twice returns 404 the second time. In production also call cloudinary.uploader.destroy(publicId) so no orphan file remains.",
    },
  ],
  interview: [
    {
      q: 'Why should you not store uploaded images on the Express server disk in production?',
      a: "Most PaaS hosts (Render, Railway, Heroku) and containers have ephemeral disks that are wiped on restart/redeploy; multiple instances do not share files; serving files wastes Node resources and you lose CDN benefits. Store files in Cloudinary/S3 and keep only metadata (url, publicId) in MongoDB.",
      level: 'Easy',
    },
    {
      q: 'Should you store images in MongoDB as Buffers or with GridFS?',
      a: "Generally no for a typical web app. Documents are limited to 16 MB, binary data bloats the database, backups and working set (RAM), and you lose CDN caching and transformations. GridFS can store large files in chunks and is acceptable for some internal tools, but object storage + CDN is cheaper and faster for user images.",
      level: 'Medium',
    },
    {
      q: 'What is the difference between multer memoryStorage and diskStorage? When would you use each?',
      a: "memoryStorage keeps files as Buffers in RAM (req.file.buffer); ideal for forwarding small files to Cloudinary/S3 without touching disk, but large files or many concurrent uploads can exhaust memory, so set limits.fileSize. diskStorage writes to a folder you configure; useful for very large files or processing with CLI tools, but you must clean up temp files and the disk may be ephemeral.",
      level: 'Medium',
    },
    {
      q: 'Explain signed direct uploads to Cloudinary (or S3 presigned URLs). Why use them?',
      a: "The server, which holds the secret, signs a set of upload parameters (timestamp, folder, maybe public_id) and returns the signature. The browser uploads the file directly to Cloudinary with that signature; Cloudinary checks it. Benefits: large files skip your server (less bandwidth, no request timeouts), better scalability, and the secret is never exposed. The server must still validate the URL/publicId the client reports back before saving.",
      level: 'Hard',
    },
    {
      q: 'Why is relying on file.mimetype or the accept attribute not enough for validation?',
      a: "Both are controlled by the client: accept only filters the file dialog, and the mimetype comes from the multipart header the client sends. An attacker can upload an HTML or SVG with script disguised as image/png. Validate magic bytes on the server (file-type package), restrict allowed types, let the media service re-encode (resource_type image), serve uploads from a different domain/CDN, and never execute uploaded files.",
      level: 'Medium',
    },
    {
      q: 'How do you show an image preview before uploading in React?',
      a: "Create a temporary object URL with URL.createObjectURL(file) and use it as the img src. Revoke it with URL.revokeObjectURL when the file is removed or the component unmounts to avoid memory leaks. FileReader.readAsDataURL also works but creates large base64 strings.",
      level: 'Easy',
    },
    {
      q: 'Why should you not manually set Content-Type: multipart/form-data when sending FormData with axios or fetch?',
      a: "The multipart Content-Type header needs a boundary parameter (multipart/form-data; boundary=----xyz) that separates the parts. When you pass a FormData body, the browser generates the boundary and header automatically. Setting it manually omits the boundary and the server (multer) cannot parse the body.",
      level: 'Medium',
    },
    {
      q: 'How do you avoid orphan files when uploading and saving to MongoDB?',
      a: "Order operations safely: upload, then save to DB; if the save fails, delete the uploaded files in a catch. When replacing (avatar), save the new reference first, then destroy the old publicId. When deleting a document, also delete its media. For direct uploads that may never be confirmed, tag them as pending or use a tmp folder and run a scheduled cleanup job.",
      level: 'Hard',
    },
    {
      q: 'How would you show real upload progress in React?',
      a: "Use axios with onUploadProgress (XHR under the hood), computing Math.round(e.loaded * 100 / e.total), and store it in state to render a progress bar. fetch does not expose upload progress events. For multiple files, track progress per file or the total bytes.",
      level: 'Easy',
    },
    {
      q: 'Your Render free instance times out on 50 MB video uploads. What do you change?',
      a: "Switch to signed direct uploads (or S3 presigned URLs/multipart uploads) so the browser uploads straight to the storage service, optionally with chunked/resumable uploads (Cloudinary upload_large, tus). The server only signs and later saves the metadata. Also raise multer limits only if absolutely needed and show progress in the UI.",
      level: 'Medium',
    },
    {
      q: 'How do you serve the right image size for different devices with Cloudinary?',
      a: "Store the publicId and build transformation URLs like w_400,c_fill,g_auto,f_auto,q_auto. Use srcSet + sizes in React so the browser picks the best width, and loading='lazy' for off-screen images. f_auto sends WebP/AVIF when supported and q_auto chooses quality; all of it is cached at the CDN edge.",
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Implement a complete avatar feature: PUT /api/users/me/avatar (multer single "avatar", max 2 MB, Cloudinary folder avatars/<userId>, 256x256 face crop), which saves the new avatar and then deletes the old one.',
      hint: 'Use upload_stream with transformation; destroy the old publicId only after save succeeds.',
      solution: `// routes/users.js
router.put('/me/avatar', protect, multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, f, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(f.mimetype)),
}).single('avatar'), updateAvatar);

// controllers/users.js
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import { uploadBuffer } from '../utils/uploadBuffer.js';

export async function updateAvatar(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Please choose a JPG, PNG or WebP image' });
  const user = await User.findById(req.user.id);
  const oldId = user.avatar?.publicId;

  const r = await uploadBuffer(req.file.buffer, {
    folder: 'avatars/' + user.id,
    transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }],
  });
  try {
    user.avatar = { url: r.secure_url, publicId: r.public_id };
    await user.save();
  } catch (err) {
    await cloudinary.uploader.destroy(r.public_id);
    throw err;
  }
  if (oldId) cloudinary.uploader.destroy(oldId).catch((e) => console.error('cleanup failed', e));
  res.json({ avatar: user.avatar });
}`,
    },
    {
      task: 'Build a React AvatarUploader component using TanStack Query useMutation that previews the chosen image, uploads with progress, updates the cached "me" query on success and shows server errors (413/400).',
      hint: 'setQueryData(["me"], ...) after success; read err.response.data.message.',
      solution: `import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export default function AvatarUploader({ current }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const qc = useQueryClient();

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await api.put('/users/me/avatar', fd, {
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      return data.avatar;
    },
    onSuccess: (avatar) => {
      qc.setQueryData(['me'], (me) => (me ? { ...me, avatar } : me));
      setFile(null);
      setProgress(0);
    },
  });

  return (
    <div>
      <img src={preview || current?.url || '/avatar.svg'} alt="Avatar" width={96} height={96} style={{ borderRadius: '50%', objectFit: 'cover' }} />
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0] || null)} />
      <button disabled={!file || mutation.isPending} onClick={() => mutation.mutate()}>
        {mutation.isPending ? 'Uploading ' + progress + '%' : 'Save avatar'}
      </button>
      {mutation.isError && <p role="alert">{mutation.error.response?.data?.message || 'Upload failed'}</p>}
    </div>
  );
}`,
    },
    {
      task: 'When a product is deleted, delete all its Cloudinary images too. Write the controller and explain what happens if Cloudinary is down.',
      hint: 'delete_resources accepts up to 100 public ids. Decide: fail the request or delete DB first and retry cleanup later.',
      solution: `export async function deleteProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (!product.owner.equals(req.user.id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not allowed' });
  }
  const ids = product.images.map((i) => i.publicId);
  await product.deleteOne();

  if (ids.length) {
    try {
      await cloudinary.api.delete_resources(ids);
    } catch (err) {
      // Cloudinary down: the user's action already succeeded.
      // Record the ids so a cron job / queue retries later instead of leaving orphans forever.
      await CleanupJob.create({ provider: 'cloudinary', publicIds: ids, reason: err.message });
    }
  }
  res.status(204).end();
}
// Explanation: the database is the source of truth, so we delete it first and treat media
// cleanup as a retryable background task. A BullMQ queue or a daily cron reading CleanupJob works well.`,
    },
    {
      task: 'Write a React <Dropzone> component that supports drag-and-drop AND click-to-browse, highlights while dragging, and calls onFiles(files) with only image files.',
      hint: 'Handle onDragOver (preventDefault), onDragLeave, onDrop (e.dataTransfer.files). Use a hidden input and a ref.',
      solution: `import { useRef, useState } from 'react';

export default function Dropzone({ onFiles }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  const emit = (list) => {
    const files = [...list].filter((f) => f.type.startsWith('image/'));
    if (files.length) onFiles(files);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); emit(e.dataTransfer.files); }}
      style={{
        border: '2px dashed ' + (over ? '#2563eb' : '#aaa'),
        background: over ? '#eff6ff' : 'transparent',
        padding: 32, borderRadius: 12, textAlign: 'center', cursor: 'pointer',
      }}
    >
      Drag images here or click to browse
      <input ref={inputRef} type="file" accept="image/*" multiple hidden
        onChange={(e) => { emit(e.target.files); e.target.value = ''; }} />
    </div>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'What should you store in MongoDB for an uploaded product image?',
      options: ['The full image as a base64 string', 'The url and publicId returned by Cloudinary', 'The local file path on the server', 'Nothing, images are found by product name'],
      answer: 1,
      explanation: 'Keep files in object storage/CDN and only metadata in MongoDB. publicId is needed to delete or transform the image later.',
    },
    {
      question: "React sends formData.append('photos', file) but the server uses upload.array('images'). What happens?",
      options: ['The files are renamed automatically', 'Upload works but is slower', 'multer throws an "Unexpected field" error', 'The files are saved to disk instead'],
      answer: 2,
      explanation: 'The field name in FormData must match the name given to multer (single/array/fields).',
    },
    {
      question: 'In a signed Cloudinary upload, what does the browser receive from your server?',
      options: ['The API secret', 'The MongoDB connection string', 'A JWT refresh token', 'A signature for specific parameters plus the public api_key and timestamp'],
      answer: 3,
      explanation: 'The secret stays on the server. The signature proves the parameters were approved by your server and expires.',
    },
    {
      question: 'Which call frees the memory used by a preview created with URL.createObjectURL(file)?',
      options: ['URL.revokeObjectURL(url)', 'file.close()', 'URL.delete(url)', 'It is freed immediately after the img loads'],
      answer: 0,
      explanation: 'Object URLs live until the document unloads unless you revoke them, so revoke on remove/unmount.',
    },
    {
      question: 'A user replaces their avatar. Which order avoids losing data and orphan files?',
      options: [
        'Delete old image, upload new image, save DB',
        'Upload new image, save new reference in DB, then delete old image',
        'Save DB first with an empty avatar, then upload',
        'Upload new image and never delete the old one',
      ],
      answer: 1,
      explanation: 'If the upload or save fails, the old avatar is still valid. Only after the new reference is saved do you destroy the old file.',
    },
  ],
};
