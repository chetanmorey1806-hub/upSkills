export default {
  lesson: 'day-08-middleware-cors-background-files-routers',
  minutes: 35,
  intro: 'Practise middleware, CORS, BackgroundTasks, UploadFile and APIRouter, and write the CORS check, middleware chain and upload validation in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Your React app on `http://localhost:5173` calls the API on `http://localhost:8000` and the browser shows a CORS error. Where is the fix?',
      options: ['In React: add mode "no-cors" to fetch', 'In the API: add CORSMiddleware with allow_origins=["http://localhost:5173"]', 'Change the API port to 5173', 'Disable JavaScript in the browser'],
      answer: 1,
      explain: 'CORS is enforced by the **browser** but controlled by the **server**: the API must send `Access-Control-Allow-Origin` for that origin. Different ports = different origins. `mode: "no-cors"` only gives you an unreadable (opaque) response.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'BackgroundTasks run after the response has been sent, e.g. sending a welcome email',
        'For heavy, long or retryable jobs a task queue like Celery is a better choice',
        'File uploads need python-multipart and are sent as multipart/form-data, not JSON',
        "allow_origins=['*'] together with allow_credentials=True is the recommended production setting",
        'APIRouter(prefix="/students", tags=["students"]) groups routes and their docs',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Background tasks run in the same process after the response - fine for small jobs. Uploads use `UploadFile`/`File()` with multipart form data. Wildcard origins with credentials is insecure (and browsers reject it); list exact origins. Routers with prefixes and tags keep big apps organised.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line inside `main.py` that adds the students router to the app:\n\n```\nfrom app.routers import students\napp = FastAPI()\n______\n```',
      accept: ['app.include_router(students.router)', "app.include_router(students.router, prefix='/students')", 'app.include_router(students.router, prefix="/students")'],
      explain: '`app.include_router(router)` mounts all routes of an `APIRouter`; the prefix and tags can be set on the router itself or here. A router that is never included has no effect - a common "my endpoint returns 404" cause.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print?',
      code: `from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.testclient import TestClient

app = FastAPI()
LOG = []

@app.middleware('http')
async def add_header(request: Request, call_next):
    LOG.append(f'before {request.url.path}')
    response = await call_next(request)
    response.headers['X-App'] = 'UpSkillr'
    LOG.append('after')
    return response

def send_email(to: str):
    LOG.append(f'email to {to}')

@app.post('/register')
def register(email: str, tasks: BackgroundTasks):
    tasks.add_task(send_email, email)
    LOG.append('view')
    return {'ok': True}

c = TestClient(app)
r = c.post('/register?email=asha@x.in')
print(r.json(), r.headers['X-App'])
print(LOG)`,
      expected: "{'ok': True} UpSkillr\n['before /register', 'view', 'after', 'email to asha@x.in']",
      explain: 'Middleware wraps the whole request: code before `call_next` runs first, then the view, then the code after. Background tasks run only **after the response has been sent** - even after the middleware has finished - so the email is logged last and the user never waits for it. The middleware adds the `X-App` header to every response.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `cors_headers(origin, allowed, method=\'GET\', allowed_methods=(\'GET\', \'POST\'))` - the decision CORSMiddleware makes. Return a dict of headers to add:\n- if `origin` is in `allowed` (or `allowed` contains `\'*\'`) **and** `method` is in `allowed_methods`: `{\'Access-Control-Allow-Origin\': origin, \'Access-Control-Allow-Methods\': \', \'.join(allowed_methods)}`\n- otherwise: `{}` (the browser will block the response)',
      example: { title: 'membership checks', code: "allowed = ['https://upskillr.in']\nprint('https://evil.com' in allowed)   # False" },
      starter: `def cors_headers(origin, allowed, method='GET', allowed_methods=('GET', 'POST')):
    # TODO
    return {}
`,
      solution: `def cors_headers(origin, allowed, method='GET', allowed_methods=('GET', 'POST')):
    if (origin in allowed or '*' in allowed) and method in allowed_methods:
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': ', '.join(allowed_methods),
        }
    return {}
`,
      tests: [
        { call: "cors_headers('http://localhost:5173', ['http://localhost:5173'])", expect: { 'Access-Control-Allow-Origin': 'http://localhost:5173', 'Access-Control-Allow-Methods': 'GET, POST' } },
        { call: "cors_headers('http://localhost:3000', ['http://localhost:5173'])", expect: {} },
        { call: "cors_headers('https://shop.in', ['*'], 'DELETE', ('GET', 'DELETE'))", expect: { 'Access-Control-Allow-Origin': 'https://shop.in', 'Access-Control-Allow-Methods': 'GET, DELETE' } },
        { call: "cors_headers('http://localhost:5173', ['http://localhost:5173'], 'PUT')", expect: {} },
      ],
      explain: 'For a "preflight" `OPTIONS` request the browser asks "may origin X use method Y?" and only proceeds if these headers come back. Origins must match **exactly** (scheme + host + port), which is why `localhost:3000` is refused when only `5173` is allowed.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `check_upload(filename, size_bytes, allowed=(\'.jpg\', \'.jpeg\', \'.png\', \'.pdf\'), max_mb=2)` for an `UploadFile` endpoint. Return `(ok, message_or_safe_name)`:\n- extension (case-insensitive) not allowed → `(False, \'File type not allowed\')`\n- size > max_mb × 1024 × 1024 → `(False, \'File too large\')`\n- otherwise → `(True, safe_name)` where safe_name is the **base name only** (drop any folders before the last `/` or `\\\\`), lower-case, with spaces replaced by `_`',
      example: { title: 'getting the extension', code: "import os\nprint(os.path.splitext('Photo.JPG')[1].lower())   # .jpg" },
      starter: `import os

def check_upload(filename, size_bytes, allowed=('.jpg', '.jpeg', '.png', '.pdf'), max_mb=2):
    # TODO
    return (True, filename)
`,
      solution: `import os

def check_upload(filename, size_bytes, allowed=('.jpg', '.jpeg', '.png', '.pdf'), max_mb=2):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in allowed:
        return (False, 'File type not allowed')
    if size_bytes > max_mb * 1024 * 1024:
        return (False, 'File too large')
    base = filename.replace('\\\\', '/').split('/')[-1]
    return (True, base.lower().replace(' ', '_'))
`,
      tests: [
        { call: "check_upload('Asha Photo.JPG', 300000)", expect: [true, 'asha_photo.jpg'] },
        { call: "check_upload('resume.exe', 1000)", expect: [false, 'File type not allowed'] },
        { call: "check_upload('marks.pdf', 3 * 1024 * 1024)", expect: [false, 'File too large'] },
        { call: "check_upload('../../etc/ID Card.png', 5000)", expect: [true, 'id_card.png'], msg: 'Folder parts like ../../ must be removed' },
        { call: "check_upload('C:\\\\Users\\\\ravi\\\\Fee Receipt.pdf', 5000)", expect: [true, 'fee_receipt.pdf'] },
      ],
      explain: 'Never trust `file.filename`: a name like `../../etc/passwd` could write outside your upload folder (path traversal). Check the extension, the size (read in chunks for big files) and keep only a cleaned base name - or better, generate your own name with `uuid4()`.',
    },
  ],
};
