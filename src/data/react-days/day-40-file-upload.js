const HELPERS = `// ---------- helpers ----------
const formatBytes = bytes =>
  bytes < 1024 ? bytes + ' B' : bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / (1024 * 1024)).toFixed(1) + ' MB';

// Sample files so the demo works even without picking a file from your computer
function sampleImage(label, color) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="100%" height="100%" fill="' + color +
    '"/><text x="50%" y="55%" font-size="28" text-anchor="middle" fill="#fff" font-family="sans-serif">' + label + '</text></svg>';
  return new File([svg], label.toLowerCase().replace(/\\s+/g, '-') + '.svg', { type: 'image/svg+xml' });
}
const sampleBigPhoto = () => new File([new Uint8Array(3 * 1024 * 1024)], 'goa-trip-raw.jpg', { type: 'image/jpeg' });
const samplePdf = () => new File(['%PDF-1.4 fake resume'], 'resume.pdf', { type: 'application/pdf' });
// ---------- end helpers ----------
`;

const VALIDATE = `
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_SIZE = 2 * 1024 * 1024;   // 2 MB
const MAX_FILES = 4;

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return file.name + ': only JPG, PNG, WebP or SVG images are allowed';
  if (file.size > MAX_SIZE) return file.name + ': ' + formatBytes(file.size) + ' is larger than 2 MB';
  if (file.size === 0) return file.name + ': file is empty';
  return null;
}
`;

const FAKE_UPLOAD = `
// Simulated upload with progress (the playground has no upload server).
// Same signature as the real XHR/Axios version: uploadFile(file, { onProgress, signal }) -> Promise
function uploadFile(file, { onProgress, signal }) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);                      // what you would send to the server
    let loaded = 0;
    const total = Math.max(file.size, 200000);
    const timer = setInterval(() => {
      loaded = Math.min(total, loaded + total / 20);
      onProgress(Math.round((loaded / total) * 100));
      if (loaded >= total) {
        clearInterval(timer);
        if (file.name.includes('fail')) reject(new Error('Server rejected the file (500)'));
        else resolve({ url: URL.createObjectURL(file), id: Date.now() });
      }
    }, 120);
    if (signal) signal.addEventListener('abort', () => { clearInterval(timer); reject(new DOMException('Upload cancelled', 'AbortError')); });
  });
}
`;

const CSS = `.drop{border:2px dashed #94a3b8;border-radius:12px;padding:24px;text-align:center;color:#475569;transition:background .15s,border-color .15s}
.drop.active{background:#ecfeff;border-color:#0891b2;color:#0e7490}
.thumbs{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;margin-top:12px}
.thumb{border:1px solid #e2e8f0;border-radius:8px;padding:6px;font-size:12px;position:relative}
.thumb img{width:100%;height:80px;object-fit:cover;border-radius:6px;display:block}
.thumb .x{position:absolute;top:2px;right:2px;border:0;background:#0f172a;color:#fff;border-radius:50%;width:22px;height:22px;cursor:pointer}
.err{color:#b91c1c;font-size:13px}.ok{color:#15803d}.muted{color:#64748b;font-size:13px}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0}button{padding:6px 12px;cursor:pointer}
.bar{height:10px;background:#e2e8f0;border-radius:999px;overflow:hidden}.bar span{display:block;height:100%;background:#0d9488;transition:width .1s}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`;

export default {
  id: 'day-40-file-upload',
  title: 'File Upload in React: Image Preview, Validation (Type/Size), Progress Bar, FormData and Drag-and-Drop',
  module: 'Module 8: Working with APIs like a Pro',
  day: 40,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Profile photos, KYC documents, product images, resumes: almost every app uploads files. Learn how React handles file inputs, shows instant previews, validates type and size, sends files with FormData, displays a real progress bar with cancel, and builds an accessible drag-and-drop zone.',
  objectives: [
    'Read files from <input type="file"> and understand the File and FileList objects',
    'Show image previews with URL.createObjectURL and clean them up with revokeObjectURL',
    'Validate file type, size and count on the client (and explain why the server must validate again)',
    'Upload with FormData and show progress with Axios onUploadProgress / XMLHttpRequest, with cancel',
    'Build an accessible drag-and-drop upload zone',
  ],
  theory: [
    {
      heading: 'File inputs in React',
      content:
        '`<input type="file">` is always an **uncontrolled** input in React: you cannot set its value from state (browsers forbid it for security). You read the chosen files in `onChange` from `e.target.files`, which is a **FileList** (array-like). Convert it with `Array.from(e.target.files)`.\n\nEach **File** object has `name`, `size` (bytes), `type` (MIME type such as `image/png`) and `lastModified`. A File is a **Blob**, so you can slice it, read it or upload it.\n\nUseful attributes:\n\n- `accept="image/*"` or `accept=".pdf,.docx"`: filters the file picker (a hint only; users can still choose "All files")\n- `multiple`: allow more than one file\n- `capture="environment"`: on mobile, open the back camera directly (great for KYC/receipt photos)\n\nTo let the user pick the **same file again** after removing it, reset the input: `inputRef.current.value = \'\'`.\n\nCompanies usually hide the native input and show a styled `<label htmlFor>` or button that calls `inputRef.current.click()`.',
      syntax: `function AvatarInput({ onSelect }) {
  const inputRef = useRef(null);
  const handleChange = e => {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
    e.target.value = '';                 // allow choosing the same file again
  };
  return (
    <>
      <input ref={inputRef} id="avatar" type="file" accept="image/*" hidden onChange={handleChange} />
      <button type="button" onClick={() => inputRef.current.click()}>Choose photo</button>
    </>
  );
}`,
    },
    {
      heading: 'Previews: createObjectURL vs FileReader',
      content:
        'Users expect to see the image **before** uploading. Two ways:\n\n- **`URL.createObjectURL(file)`** returns a short `blob:` URL pointing to the file in memory. Instant, no reading, works for images, video and PDFs. You **must** call `URL.revokeObjectURL(url)` when you no longer need it, otherwise memory leaks (each URL holds the whole file).\n- **`FileReader.readAsDataURL(file)`** reads the file and gives a base64 `data:` string. Asynchronous, about 33% bigger, slow for large files. Use it only when you need the data as text (e.g. saving a tiny image in localStorage).\n\nIn React, create the object URL in an effect (or `useMemo`) and revoke it in the **cleanup** so it is freed when the file changes or the component unmounts.',
      syntax: `function usePreview(file) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file) return setUrl(null);
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);     // free memory
  }, [file]);
  return url;
}`,
      tip: 'Never put a File object or a blob URL into Redux or localStorage. Files are not serializable and blob URLs die when the page reloads. Store the server URL after upload instead.',
    },
    {
      heading: 'Client-side validation (and why it is not enough)',
      content:
        'Validate as soon as files are selected so users get instant feedback:\n\n1. **Type**: check `file.type` against an allow-list (`[\'image/jpeg\', \'image/png\', \'image/webp\']`) and optionally the extension. Prefer allow-lists over block-lists.\n2. **Size**: `file.size > 2 * 1024 * 1024` for a 2 MB limit. Show sizes in KB/MB with a `formatBytes` helper.\n3. **Count**: maximum number of files (e.g. 5 product photos).\n4. **Dimensions** (images): load into `new Image()` and check `naturalWidth` / `naturalHeight` (e.g. a banner must be at least 1200×400).\n5. **Empty files**: `size === 0`.\n\nShow errors **per file** next to the file name and keep valid files.\n\nSecurity: anybody can bypass browser checks (rename `virus.exe` to `photo.jpg`, or call the API with curl). The **server must validate again** (real content/magic bytes, size limits, virus scan) and must never trust the file name.',
      syntax: `const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX = 2 * 1024 * 1024;

export function validateImage(file) {
  if (!ALLOWED.includes(file.type)) return 'Only JPG, PNG or WebP';
  if (file.size > MAX) return 'Max size is 2 MB';
  return null;
}

export const getImageSize = file => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(img.src); };
  img.onerror = reject;
  img.src = URL.createObjectURL(file);
});`,
    },
    {
      heading: 'Uploading: FormData, progress and cancel',
      content:
        'Files are sent as **multipart/form-data** using **FormData**:\n\n`const form = new FormData(); form.append(\'avatar\', file); form.append(\'userId\', \'42\');`\n\nImportant: **do not set the Content-Type header yourself**. The browser (or Axios) sets `multipart/form-data; boundary=----xyz` automatically; if you set it manually the boundary is missing and the server cannot parse the body.\n\n**Progress**: `fetch()` cannot report **upload** progress yet. Use **Axios** `onUploadProgress` (it uses XMLHttpRequest in the browser) or XHR `xhr.upload.onprogress` directly. Progress = `loaded / total * 100`.\n\n**Cancel**: pass an `AbortController` signal to Axios (`signal`) or call `xhr.abort()`.\n\n**Direct-to-cloud uploads**: big companies rarely send files through their own API server. The backend creates a short-lived **pre-signed URL** (AWS S3, Google Cloud Storage) or a signed upload preset (Cloudinary), and the browser uploads straight to storage, then sends only the final URL to the API. This saves server bandwidth.',
      syntax: `import { api } from '@/lib/api';

export function uploadAvatar(file, { onProgress, signal }) {
  const form = new FormData();
  form.append('avatar', file);
  return api.post('/users/me/avatar', form, {
    signal,
    onUploadProgress: e => onProgress(Math.round((e.loaded * 100) / (e.total ?? file.size))),
  }).then(res => res.data);   // e.g. { url: 'https://cdn.example.com/avatars/42.webp' }
}`,
      tip: 'Common mistake: JSON.stringify({ file }) sends "{}" because a File has no enumerable properties. Files must go in FormData (or as a raw body to a pre-signed URL).',
    },
    {
      heading: 'Drag-and-drop upload zones',
      content:
        'The HTML Drag and Drop API (HTML Extra Day 10) gives you these events on the drop zone:\n\n- `onDragEnter` / `onDragOver`: a file is over the zone. You **must** call `e.preventDefault()` in `onDragOver`, otherwise the browser opens the file in the tab instead of allowing a drop.\n- `onDragLeave`: remove the highlight (careful: it also fires when moving over child elements; check `e.currentTarget.contains(e.relatedTarget)`).\n- `onDrop`: `e.preventDefault()` and read `e.dataTransfer.files`.\n\n**Accessibility**: drag-and-drop is impossible for keyboard and many touch users. Always include a real button/label that opens the file picker, make the zone focusable with a clear label, and announce results with `aria-live`.\n\nIn production many teams use **react-dropzone** (`useDropzone({ accept, maxSize, maxFiles, onDrop })`), which handles all edge cases and returns `getRootProps()` and `getInputProps()`.',
      syntax: `import { useDropzone } from 'react-dropzone';

function ProductImagesDropzone({ onFiles }) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 2 * 1024 * 1024,
    maxFiles: 5,
    onDrop: accepted => onFiles(accepted),
  });
  return (
    <div {...getRootProps({ className: isDragActive ? 'drop active' : 'drop' })}>
      <input {...getInputProps()} />
      <p>{isDragActive ? 'Drop the images here…' : 'Drag images here, or click to choose'}</p>
      {fileRejections.map(({ file, errors }) => <p key={file.name}>{file.name}: {errors[0].message}</p>)}
    </div>
  );
}`,
      tip: 'Coming next (Day 41): authentication. Upload endpoints are almost always protected, so the Axios instance will add the JWT automatically.',
    },
  ],
  examples: [
    {
      title: 'Profile photo picker with live preview',
      scenario: 'A "Edit profile" page lets the user pick a photo and see it in a round avatar before saving. The object URL must be cleaned up when the photo changes.',
      steps: [
        'Add a hidden <input type="file" accept="image/*"> and a visible button that clicks it',
        'Store the selected File in state',
        'Create a usePreview(file) hook that creates and revokes the object URL',
        'Show name, type and size of the file',
        'Run the playground: choose a photo, or click "Use sample image"',
      ],
      code: `export function ProfilePhoto() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const preview = usePreview(file);            // hook from theory section 2

  return (
    <section>
      <img className="avatar" src={preview ?? '/default-avatar.png'} alt="Profile preview" />
      <input ref={inputRef} type="file" accept="image/*" hidden
        onChange={e => { setFile(e.target.files?.[0] ?? null); e.target.value = ''; }} />
      <button type="button" onClick={() => inputRef.current.click()}>Change photo</button>
      {file && <p>{file.name} · {formatBytes(file.size)}</p>}
    </section>
  );
}`,
      playground: {
        jsx: HELPERS + `
function usePreview(file) {
  const [url, setUrl] = React.useState(null);
  React.useEffect(() => {
    if (!file) { setUrl(null); return; }
    const objectUrl = URL.createObjectURL(file);
    console.log('created ' + objectUrl);
    setUrl(objectUrl);
    return () => { URL.revokeObjectURL(objectUrl); console.log('revoked ' + objectUrl); };
  }, [file]);
  return url;
}

function App() {
  const inputRef = React.useRef(null);
  const [file, setFile] = React.useState(null);
  const preview = usePreview(file);
  const [n, setN] = React.useState(0);
  const colors = ['#0d9488', '#7c3aed', '#ea580c'];

  return (
    <section style={{ textAlign: 'center' }}>
      <div className="avatar">{preview ? <img src={preview} alt="Profile preview" /> : <span>👤</span>}</div>
      <input ref={inputRef} type="file" accept="image/*" hidden
        onChange={e => { setFile(e.target.files[0] || null); e.target.value = ''; }} />
      <div className="row" style={{ justifyContent: 'center' }}>
        <button type="button" onClick={() => inputRef.current.click()}>Choose photo</button>
        <button type="button" onClick={() => { setFile(sampleImage('Priya ' + (n + 1), colors[n % 3])); setN(n + 1); }}>Use sample image</button>
        {file && <button type="button" onClick={() => setFile(null)}>Remove</button>}
      </div>
      {file ? <p className="muted">{file.name} · {file.type || 'unknown type'} · {formatBytes(file.size)}</p> : <p className="muted">No photo selected</p>}
    </section>
  );
}`,
        css: CSS + `
.avatar{width:140px;height:140px;border-radius:50%;margin:0 auto 12px;overflow:hidden;background:#e2e8f0;display:grid;place-items:center;font-size:56px;border:4px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.15)}
.avatar img{width:100%;height:100%;object-fit:cover}`,
      },
      result: 'Choosing a photo (or clicking "Use sample image") shows it inside the round avatar with its name, type and size. Each new selection logs "created blob:…" and "revoked blob:…" for the previous one.',
      explanation:
        'The File object is kept in state; the preview URL is derived from it inside an effect. When file changes, React runs the cleanup of the previous effect first, which revokes the old blob URL, then creates a new one. Resetting e.target.value lets the user pick the same file again after removing it. The sample button builds a real File from an SVG string, so the demo works without any file on your computer.',
    },
    {
      title: 'Validating type, size and count for multiple files',
      scenario: 'A seller uploads up to 4 product images (JPG/PNG/WebP/SVG, max 2 MB each). Invalid files must be rejected with a clear reason per file, valid ones kept.',
      steps: [
        'Write validateFile(file) that returns an error string or null',
        'On change, split files into accepted and rejected',
        'Enforce the maximum count across already-selected and new files',
        'Show rejected files with reasons in a role="alert" list',
        'Run the playground and use the sample buttons (good image, 3 MB photo, PDF)',
      ],
      code: `function handleFiles(newFiles) {
  const accepted = [];
  const rejected = [];
  for (const file of newFiles) {
    const error = validateFile(file);
    if (error) rejected.push(error);
    else if (files.length + accepted.length >= MAX_FILES) rejected.push(file.name + ': maximum ' + MAX_FILES + ' images');
    else accepted.push(file);
  }
  setFiles(prev => [...prev, ...accepted]);
  setErrors(rejected);
}

<input type="file" multiple accept="image/jpeg,image/png,image/webp"
  onChange={e => { handleFiles(Array.from(e.target.files)); e.target.value = ''; }} />`,
      playground: {
        jsx: HELPERS + VALIDATE + `
function Thumb({ file, onRemove }) {
  const [url, setUrl] = React.useState(null);
  React.useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <div className="thumb">
      {url && <img src={url} alt={file.name} />}
      <button className="x" onClick={onRemove} aria-label={'Remove ' + file.name}>✕</button>
      <div>{file.name}</div><div className="muted">{formatBytes(file.size)}</div>
    </div>
  );
}

function App() {
  const [files, setFiles] = React.useState([]);
  const [errors, setErrors] = React.useState([]);
  const colors = ['#2563eb', '#db2777', '#16a34a', '#9333ea', '#f59e0b'];

  const handleFiles = newFiles => {
    const accepted = [];
    const rejected = [];
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) rejected.push(error);
      else if (files.length + accepted.length >= MAX_FILES) rejected.push(file.name + ': you can upload at most ' + MAX_FILES + ' images');
      else accepted.push(file);
    }
    setFiles(prev => [...prev, ...accepted]);
    setErrors(rejected);
  };

  return (
    <div>
      <label className="muted" htmlFor="imgs">Product images (max {MAX_FILES}, 2 MB each)</label>
      <div className="row">
        <input id="imgs" type="file" multiple accept={ALLOWED_TYPES.join(',')}
          onChange={e => { handleFiles(Array.from(e.target.files)); e.target.value = ''; }} />
      </div>
      <div className="row">
        <button onClick={() => handleFiles([sampleImage('Kurta ' + (files.length + 1), colors[files.length % 5])])}>+ valid image</button>
        <button onClick={() => handleFiles([sampleBigPhoto()])}>+ 3 MB photo</button>
        <button onClick={() => handleFiles([samplePdf()])}>+ PDF</button>
      </div>
      {errors.length > 0 && (
        <ul role="alert" className="err">{errors.map(e => <li key={e}>{e}</li>)}</ul>
      )}
      <p className="muted">{files.length} / {MAX_FILES} selected</p>
      <div className="thumbs">
        {files.map((f, i) => <Thumb key={f.name + f.lastModified + i} file={f} onRemove={() => setFiles(prev => prev.filter((_, j) => j !== i))} />)}
      </div>
    </div>
  );
}`,
        css: CSS,
      },
      result: '"+ valid image" adds thumbnails until 4 are selected; a 5th shows "you can upload at most 4 images". "+ 3 MB photo" shows "goa-trip-raw.jpg: 3.0 MB is larger than 2 MB" and "+ PDF" shows "only JPG, PNG, WebP or SVG images are allowed". Each thumbnail has a ✕ remove button.',
      explanation:
        'validateFile checks the allow-list and size; the count check considers files already selected plus the ones accepted in this batch. Valid files are kept even if others in the same batch fail, which is friendlier than rejecting the whole selection. Errors are rendered in a role="alert" list so screen readers announce them. Each Thumb owns its blob URL and revokes it when removed. Remember: this is only for user experience; the server must validate again.',
    },
    {
      title: 'Upload with FormData, progress bar, cancel and retry',
      scenario: 'Uploading a KYC document (Aadhaar/PAN scan) must show percentage progress, allow cancelling, and allow retry after a failure. The playground simulates the network because it has no upload server; the code panel shows the real Axios and XHR versions.',
      steps: [
        'Write uploadFile(file, { onProgress, signal }) using Axios onUploadProgress (or XHR)',
        'Keep status (idle | uploading | done | error | cancelled) and progress in state',
        'Create an AbortController per upload and keep it in a ref so Cancel can abort it',
        'Render a progress bar with role="progressbar" and aria-valuenow',
        'Run the playground: upload a sample file, try Cancel, and try the "…fail" file to see Retry',
      ],
      code: `// Real version with Axios
export function uploadDocument(file, { onProgress, signal }) {
  const form = new FormData();
  form.append('document', file);
  form.append('docType', 'PAN');
  return api.post('/kyc/documents', form, {
    signal,
    onUploadProgress: e => onProgress(Math.round((e.loaded * 100) / (e.total ?? file.size))),
  }).then(r => r.data);
}

// Same thing with plain XMLHttpRequest (fetch has no upload progress)
export function uploadWithXhr(url, file, { onProgress, signal }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('file', file);
    xhr.upload.onprogress = e => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status < 300 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error('HTTP ' + xhr.status)));
    xhr.onerror = () => reject(new Error('Network error'));
    signal?.addEventListener('abort', () => { xhr.abort(); reject(new DOMException('Cancelled', 'AbortError')); });
    xhr.open('POST', url);
    xhr.send(form);                 // no Content-Type header: the browser adds the boundary
  });
}`,
      playground: {
        jsx: HELPERS + FAKE_UPLOAD + `
function Uploader() {
  const [file, setFile] = React.useState(null);
  const [status, setStatus] = React.useState('idle');
  const [progress, setProgress] = React.useState(0);
  const [message, setMessage] = React.useState('');
  const controllerRef = React.useRef(null);

  const start = async () => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus('uploading'); setProgress(0); setMessage('');
    try {
      const result = await uploadFile(file, { onProgress: setProgress, signal: controller.signal });
      setStatus('done');
      setMessage('Uploaded. Server id: ' + result.id);
    } catch (err) {
      if (err.name === 'AbortError') { setStatus('cancelled'); setMessage('Upload cancelled'); }
      else { setStatus('error'); setMessage(err.message); }
    }
  };

  React.useEffect(() => () => controllerRef.current && controllerRef.current.abort(), []);   // abort on unmount

  return (
    <div>
      <div className="row">
        <button onClick={() => { setFile(sampleImage('PAN card', '#1e3a8a')); setStatus('idle'); setProgress(0); setMessage(''); }}>Pick sample: pan-card.svg</button>
        <button onClick={() => { setFile(new File(['x'.repeat(400000)], 'aadhaar-fail.pdf', { type: 'application/pdf' })); setStatus('idle'); setProgress(0); setMessage(''); }}>Pick sample: aadhaar-fail.pdf</button>
      </div>
      {file && <p className="muted">Selected: {file.name} ({formatBytes(file.size)})</p>}
      <div className="bar" role="progressbar" aria-label="Upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <span style={{ width: progress + '%' }} />
      </div>
      <p className="muted">{status} · {progress}%</p>
      <div className="row">
        <button disabled={!file || status === 'uploading' || status === 'done'} onClick={start}>{status === 'error' || status === 'cancelled' ? 'Retry' : 'Upload'}</button>
        {status === 'uploading' && <button onClick={() => controllerRef.current.abort()}>Cancel</button>}
      </div>
      <p aria-live="polite" className={status === 'done' ? 'ok' : status === 'error' ? 'err' : 'muted'}>{message}</p>
    </div>
  );
}

function App() {
  return <div><h3>KYC document upload</h3><Uploader /></div>;
}`,
        css: CSS,
      },
      result: 'After picking pan-card.svg, Upload fills the teal bar from 0% to 100% and shows "Uploaded. Server id: …". Cancel during upload stops the bar and shows "Upload cancelled" with a Retry button. aadhaar-fail.pdf reaches 100% and then shows "Server rejected the file (500)" with Retry.',
      explanation:
        'The upload function accepts onProgress and an AbortSignal, exactly like the Axios/XHR versions, so the component would not change when the fake is swapped for the real API. A new AbortController per attempt is stored in a ref (it is not UI state). Abort errors are separated from real errors so cancelling is not shown as a failure. The progress bar uses role="progressbar" with aria-valuenow so assistive tech can read it, and the effect cleanup aborts an upload if the user leaves the page.',
    },
    {
      title: 'Accessible drag-and-drop zone with previews and per-file progress',
      scenario: 'A product gallery uploader: drag several images onto the zone (or press the button), see previews, then upload them all with individual progress bars.',
      steps: [
        'Create a DropZone with onDragOver (preventDefault), onDragLeave and onDrop handlers',
        'Highlight the zone while a file is dragged over it',
        'Include a "Browse files" button for keyboard and mobile users',
        'Store items as { id, file, progress, status } and validate on add',
        'Upload all items in parallel with Promise.allSettled and update each item\'s progress',
        'Run the playground: drag images from your desktop onto the zone or use "Add samples"',
      ],
      code: `function DropZone({ onFiles }) {
  const [active, setActive] = useState(false);
  const inputRef = useRef(null);
  return (
    <div
      className={'drop' + (active ? ' active' : '')}
      onDragOver={e => { e.preventDefault(); setActive(true); }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setActive(false); }}
      onDrop={e => { e.preventDefault(); setActive(false); onFiles(Array.from(e.dataTransfer.files)); }}
    >
      <p>Drag and drop images here</p>
      <button type="button" onClick={() => inputRef.current.click()}>Browse files</button>
      <input ref={inputRef} type="file" multiple accept="image/*" hidden
        onChange={e => { onFiles(Array.from(e.target.files)); e.target.value = ''; }} />
    </div>
  );
}

const uploadAll = items =>
  Promise.allSettled(items.map(item =>
    uploadFile(item.file, { onProgress: p => updateItem(item.id, { progress: p }) })
      .then(() => updateItem(item.id, { status: 'done' }))
      .catch(err => { updateItem(item.id, { status: 'error', error: err.message }); throw err; })
  ));`,
      playground: {
        jsx: HELPERS + VALIDATE + FAKE_UPLOAD + `
function DropZone({ onFiles }) {
  const [active, setActive] = React.useState(false);
  const inputRef = React.useRef(null);
  return (
    <div
      className={'drop' + (active ? ' active' : '')}
      onDragOver={e => { e.preventDefault(); setActive(true); }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setActive(false); }}
      onDrop={e => { e.preventDefault(); setActive(false); onFiles(Array.from(e.dataTransfer.files)); }}
    >
      <p style={{ margin: '0 0 8px' }}>{active ? 'Drop to add images' : 'Drag and drop images here'}</p>
      <button type="button" onClick={() => inputRef.current.click()}>Browse files</button>
      <input ref={inputRef} type="file" multiple accept="image/*" className="sr" tabIndex={-1} aria-hidden="true"
        onChange={e => { onFiles(Array.from(e.target.files)); e.target.value = ''; }} />
    </div>
  );
}

let nextId = 1;
function Item({ item, onRemove }) {
  const [url, setUrl] = React.useState(null);
  React.useEffect(() => { const u = URL.createObjectURL(item.file); setUrl(u); return () => URL.revokeObjectURL(u); }, [item.file]);
  return (
    <div className="thumb">
      {url && <img src={url} alt={item.file.name} />}
      {item.status === 'queued' && <button className="x" onClick={onRemove} aria-label={'Remove ' + item.file.name}>✕</button>}
      <div>{item.file.name}</div>
      <div className="bar" role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: item.progress + '%' }} /></div>
      <div className={item.status === 'error' ? 'err' : item.status === 'done' ? 'ok' : 'muted'}>{item.status === 'error' ? item.error : item.status}</div>
    </div>
  );
}

function App() {
  const [items, setItems] = React.useState([]);
  const [errors, setErrors] = React.useState([]);
  const [summary, setSummary] = React.useState('');
  const updateItem = (id, patch) => setItems(prev => prev.map(it => (it.id === id ? { ...it, ...patch } : it)));

  const addFiles = files => {
    const bad = [];
    const good = [];
    files.forEach(f => { const e = validateFile(f); if (e) bad.push(e); else good.push({ id: nextId++, file: f, progress: 0, status: 'queued' }); });
    setErrors(bad);
    setItems(prev => [...prev, ...good].slice(0, MAX_FILES));
    if (items.length + good.length > MAX_FILES) setErrors(e => [...e, 'Only the first ' + MAX_FILES + ' images were kept']);
  };

  const uploadAll = async () => {
    const queued = items.filter(it => it.status === 'queued' || it.status === 'error');
    queued.forEach(it => updateItem(it.id, { status: 'uploading', progress: 0 }));
    const results = await Promise.allSettled(queued.map(it =>
      uploadFile(it.file, { onProgress: p => updateItem(it.id, { progress: p }) })
        .then(() => updateItem(it.id, { status: 'done' }))
        .catch(err => { updateItem(it.id, { status: 'error', error: err.message }); throw err; })
    ));
    const failed = results.filter(r => r.status === 'rejected').length;
    setSummary((queued.length - failed) + ' uploaded, ' + failed + ' failed');
  };

  return (
    <div>
      <DropZone onFiles={addFiles} />
      <div className="row">
        <button onClick={() => addFiles([sampleImage('Saree front', '#be123c'), sampleImage('Saree back', '#9d174d'), sampleImage('Saree fail', '#64748b')])}>Add samples</button>
        <button disabled={!items.some(it => it.status === 'queued' || it.status === 'error')} onClick={uploadAll}>Upload all</button>
        <button onClick={() => { setItems([]); setErrors([]); setSummary(''); }}>Clear</button>
      </div>
      {errors.length > 0 && <ul role="alert" className="err">{errors.map(e => <li key={e}>{e}</li>)}</ul>}
      <p aria-live="polite" className="muted">{summary}</p>
      <div className="thumbs">{items.map(it => <Item key={it.id} item={it} onRemove={() => setItems(prev => prev.filter(x => x.id !== it.id))} />)}</div>
    </div>
  );
}`,
        css: CSS,
      },
      result: 'Dragging image files over the dashed zone turns it cyan; dropping adds thumbnails marked "queued". "Add samples" adds three images. "Upload all" fills each bar independently; "saree-fail.svg" ends with a red error and the summary says "2 uploaded, 1 failed". Clicking Upload all again retries only the failed one.',
      explanation:
        'preventDefault in onDragOver tells the browser this element accepts drops; without it, onDrop never fires and the browser navigates to the file. The relatedTarget check avoids flicker when the pointer moves over the child button. Files dropped or browsed go through the same addFiles + validateFile path. Each item has its own progress and status in an array of objects, updated immutably by id. Promise.allSettled waits for all uploads even if some fail, so you can report a summary and retry only failures.',
    },
  ],
  interview: [
    { q: 'Why is <input type="file"> uncontrolled in React?', a: 'For security, browsers do not allow JavaScript to set a file input\'s value (otherwise a page could silently pick files). You can only read e.target.files in onChange and reset the value to an empty string.', level: 'Easy' },
    { q: 'URL.createObjectURL vs FileReader.readAsDataURL for previews?', a: 'createObjectURL is synchronous and instant, creating a blob: URL referencing the in-memory file; it must be revoked with URL.revokeObjectURL. readAsDataURL is asynchronous and creates a base64 string ~33% larger; useful only when you need the data as a string.', level: 'Medium' },
    { q: 'Why must you revoke object URLs, and where in React?', a: 'Each object URL keeps the whole file in memory until the document unloads. Revoke it in the useEffect cleanup that created it, so it is released when the file changes or the component unmounts.', level: 'Medium' },
    { q: 'How do you upload a file to an API?', a: 'Create a FormData, append the file (and other fields), and POST it with fetch or Axios. Do not set Content-Type manually; the browser adds multipart/form-data with the correct boundary.', level: 'Easy' },
    { q: 'How do you show upload progress?', a: 'fetch does not expose upload progress, so use Axios onUploadProgress (XHR under the hood) or xhr.upload.onprogress, computing Math.round(loaded / total * 100). Show it with a <progress> element or role="progressbar" with aria-valuenow.', level: 'Medium' },
    { q: 'How do you cancel an upload?', a: 'Create an AbortController, pass controller.signal to Axios (or call xhr.abort()), keep the controller in a ref, and call abort() from a Cancel button or the effect cleanup on unmount. Handle AbortError separately from real errors.', level: 'Medium' },
    { q: 'Is client-side validation of type and size enough?', a: 'No. It only improves UX. Users can bypass it with devtools or direct API calls, and file.type is derived from the extension. The server must check size, real content (magic bytes), allowed types, scan for malware and generate safe file names.', level: 'Medium' },
    { q: 'What is required to make an element a drop target?', a: 'Handle dragover and call e.preventDefault() (also usually on dragenter), then handle drop, call preventDefault and read e.dataTransfer.files. Without preventDefault on dragover the drop event never fires and the browser opens the file.', level: 'Hard' },
    { q: 'What are pre-signed URLs and why use them?', a: 'A backend-generated, time-limited URL that allows the browser to upload directly to object storage (S3, GCS) without credentials. It removes large file traffic from your API servers, scales better and keeps storage keys secret. After upload the client sends the object key/URL to the API.', level: 'Hard' },
    { q: 'How would you handle very large files (e.g. 2 GB videos)?', a: 'Chunked/resumable uploads: split the File with file.slice(), upload chunks with retries (S3 multipart upload, tus protocol), track progress across chunks and resume after network loss. Also validate size early and compress images client-side when appropriate.', level: 'Hard' },
    { q: 'How do you make a drag-and-drop uploader accessible?', a: 'Provide a real button/label that opens the native file picker, give the zone an accessible name, ensure keyboard focus styles, announce added files, errors and completion with aria-live, and give progress bars accessible labels and values.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a reusable useFilePreview(files) hook that accepts an array of Files and returns an array of preview URLs, revoking all of them on change/unmount.',
      hint: 'useMemo cannot clean up; use useEffect + state.',
      solution: `import { useEffect, useState } from 'react';

export function useFilePreviews(files) {
  const [urls, setUrls] = useState([]);
  useEffect(() => {
    const created = files.map(f => URL.createObjectURL(f));
    setUrls(created);
    return () => created.forEach(u => URL.revokeObjectURL(u));
  }, [files]);
  return urls;
}

// usage
const previews = useFilePreviews(files);
previews.map((src, i) => <img key={src} src={src} alt={files[i].name} />);`,
    },
    {
      task: 'Add a minimum dimension check: banner images must be at least 1200×400 pixels. Show "Image is 800×300, minimum is 1200×400" for small images.',
      hint: 'Load the file into new Image() via an object URL and await onload.',
      solution: `function getImageSize(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { reject(new Error('Not a valid image')); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

export async function validateBanner(file) {
  const basic = validateFile(file);           // type + size
  if (basic) return basic;
  const { width, height } = await getImageSize(file);
  if (width < 1200 || height < 400) return 'Image is ' + width + '×' + height + ', minimum is 1200×400';
  return null;
}

// in the change handler
const error = await validateBanner(file);
if (error) setError(error); else setBanner(file);`,
    },
    {
      task: 'Write a useUpload() hook that returns { upload(file), progress, status, error, cancel, reset } using Axios, so any component can upload with one line.',
      hint: 'Keep the AbortController in a ref; status: idle | uploading | success | error | cancelled.',
      solution: `import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { api } from '@/lib/api';

export function useUpload(endpoint, fieldName = 'file') {
  const [state, setState] = useState({ status: 'idle', progress: 0, error: null, data: null });
  const controllerRef = useRef(null);

  const upload = useCallback(async file => {
    controllerRef.current = new AbortController();
    setState({ status: 'uploading', progress: 0, error: null, data: null });
    const form = new FormData();
    form.append(fieldName, file);
    try {
      const res = await api.post(endpoint, form, {
        signal: controllerRef.current.signal,
        onUploadProgress: e => setState(s => ({ ...s, progress: Math.round((e.loaded * 100) / (e.total ?? file.size)) })),
      });
      setState({ status: 'success', progress: 100, error: null, data: res.data });
      return res.data;
    } catch (err) {
      const cancelled = axios.isCancel(err);
      setState(s => ({ ...s, status: cancelled ? 'cancelled' : 'error', error: cancelled ? null : err.message }));
    }
  }, [endpoint, fieldName]);

  const cancel = useCallback(() => controllerRef.current?.abort(), []);
  const reset = useCallback(() => setState({ status: 'idle', progress: 0, error: null, data: null }), []);
  useEffect(() => cancel, [cancel]);           // abort on unmount

  return { ...state, upload, cancel, reset };
}`,
    },
    {
      task: 'Allow users to paste a screenshot (Ctrl+V) into a support-ticket form and show it as an attachment preview.',
      hint: 'Listen to the paste event and read e.clipboardData.files.',
      solution: `function TicketAttachments() {
  const [files, setFiles] = useState([]);
  const previews = useFilePreviews(files);

  useEffect(() => {
    const onPaste = e => {
      const pasted = Array.from(e.clipboardData?.files ?? []).filter(f => f.type.startsWith('image/'));
      if (pasted.length) setFiles(prev => [...prev, ...pasted]);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  return (
    <div>
      <p>Paste a screenshot (Ctrl+V) to attach it</p>
      {previews.map((src, i) => <img key={src} src={src} alt={'Attachment ' + (i + 1)} width={120} />)}
    </div>
  );
}`,
    },
    {
      task: 'Upload a resume directly to S3 with a pre-signed URL: first ask your API for { uploadUrl, fileUrl }, then PUT the file to uploadUrl with progress, then save fileUrl to the profile.',
      hint: 'Use axios.put (not your api instance: no auth header to S3) with Content-Type set to file.type.',
      solution: `import axios from 'axios';
import { api } from '@/lib/api';

export async function uploadResume(file, onProgress) {
  // 1. ask our backend for a signed URL
  const { data } = await api.post('/uploads/presign', { fileName: file.name, contentType: file.type, size: file.size });
  // 2. upload straight to S3 (raw body, not FormData)
  await axios.put(data.uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: e => onProgress(Math.round((e.loaded * 100) / (e.total ?? file.size))),
  });
  // 3. tell our backend where the file is
  await api.patch('/users/me', { resumeUrl: data.fileUrl });
  return data.fileUrl;
}`,
    },
  ],
  quiz: [
    {
      question: 'How do you read the files a user selected in <input type="file" multiple>?',
      options: ['e.target.value', 'e.target.files (a FileList)', 'e.dataTransfer.items', 'useRef().files only'],
      answer: 1,
      explanation: 'onChange gives you e.target.files; convert with Array.from().',
    },
    {
      question: 'What should you do with a URL created by URL.createObjectURL when it is no longer needed?',
      options: ['Nothing', 'Store it in localStorage', 'Call URL.revokeObjectURL(url)', 'Set it to null in state'],
      answer: 2,
      explanation: 'Revoking frees the memory held by the blob URL.',
    },
    {
      question: 'When sending FormData with fetch or Axios, what should you do with the Content-Type header?',
      options: ['Let the browser set it so the multipart boundary is included', 'Set it to application/json', 'Set it to multipart/form-data manually', 'Set it to text/plain'],
      answer: 0,
      explanation: 'A manually set multipart header lacks the boundary and breaks parsing.',
    },
    {
      question: 'Why does a drop zone need e.preventDefault() in onDragOver?',
      options: ['To stop event bubbling', 'To read dataTransfer.files', 'It improves performance', 'Without it the element is not a valid drop target and the browser opens the file'],
      answer: 3,
      explanation: 'Cancelling dragover marks the element as accepting drops.',
    },
    {
      question: 'Which API can report upload progress in the browser today?',
      options: ['fetch Response.body', 'XMLHttpRequest upload.onprogress (used by Axios onUploadProgress)', 'localStorage', 'IntersectionObserver'],
      answer: 1,
      explanation: 'fetch has no upload progress events; XHR does.',
    },
  ],
};
