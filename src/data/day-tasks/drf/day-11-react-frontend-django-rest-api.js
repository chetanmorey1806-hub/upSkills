export default {
  lesson: 'day-11-react-frontend-django-rest-api',
  minutes: 30,
  intro: 'Practise CORS with django-cors-headers, fetch vs axios, the JWT login flow and token refresh, and write the origin check and token-refresh decision logic in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Where must `corsheaders.middleware.CorsMiddleware` be placed in `MIDDLEWARE`?',
      options: ['At the very end', 'As high as possible, before CommonMiddleware', 'It does not matter', 'Only in urls.py'],
      answer: 1,
      explain: 'CorsMiddleware must run **before** any middleware that can generate a response (especially `CommonMiddleware`), otherwise some responses (redirects, errors, preflight OPTIONS) go out without CORS headers and the browser blocks them.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the setting that allows only the React dev server (Vite on port 5173) to call the API:\n\n```\n______ = [\n    \'http://localhost:5173\',\n]\n```',
      accept: ['CORS_ALLOWED_ORIGINS'],
      caseSensitive: true,
      explain: '`CORS_ALLOWED_ORIGINS` lists exact origins (scheme + host + port, no trailing slash). `CORS_ALLOW_ALL_ORIGINS = True` is only acceptable for quick local experiments; in production list your real frontend domain.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about calling the API from React are TRUE? (choose all that apply)',
      options: [
        'fetch() does NOT reject on 400/500 responses - you must check response.ok',
        'axios rejects the promise for non-2xx status codes and parses JSON automatically',
        'The access token is sent as the header Authorization: Bearer <token>',
        'A browser preflight OPTIONS request is sent for a JSON POST with an Authorization header',
        'CORS errors can be fixed by adding headers in the React code',
      ],
      answers: [0, 1, 2, 3],
      explain: '`fetch` only rejects on network errors; axios throws for 4xx/5xx (error.response holds the data). Custom headers like Authorization or Content-Type: application/json trigger a **preflight**. CORS is decided by the server\'s response headers - React cannot fix it.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `cors_allowed(origin, allowed_origins, allowed_regexes=())` like django-cors-headers: return `True` if `origin` exactly equals one of `allowed_origins` (after removing a trailing `/` from the configured values) or fully matches one of `allowed_regexes` (use `re.fullmatch`). Empty/None origin → `False`.',
      example: { title: 'a full regex match', code: "import re\nprint(bool(re.fullmatch(r'https://\\w+\\.netlify\\.app', 'https://booknest.netlify.app')))   # True" },
      starter: `import re

def cors_allowed(origin, allowed_origins, allowed_regexes=()):
    # TODO
    return False
`,
      solution: `import re

def cors_allowed(origin, allowed_origins, allowed_regexes=()):
    if not origin:
        return False
    if origin in [o.rstrip('/') for o in allowed_origins]:
        return True
    return any(re.fullmatch(rx, origin) for rx in allowed_regexes)
`,
      tests: [
        { call: "cors_allowed('http://localhost:5173', ['http://localhost:5173'])", expect: true },
        { call: "cors_allowed('http://localhost:3000', ['http://localhost:5173'])", expect: false, msg: 'A different port is a different origin' },
        { call: "cors_allowed('https://booknest.in', ['https://booknest.in/'])", expect: true },
        { call: "cors_allowed('http://booknest.in', ['https://booknest.in'])", expect: false, msg: 'http and https are different origins' },
        { call: "cors_allowed('https://pr-12.booknest.netlify.app', [], [r'https://[\\w-]+\\.booknest\\.netlify\\.app'])", expect: true },
        { call: "cors_allowed('https://evil.com?x=.booknest.netlify.app', [], [r'https://[\\w-]+\\.booknest\\.netlify\\.app'])", expect: false },
        { call: "cors_allowed(None, ['*'])", expect: false },
      ],
      explain: 'An origin is **scheme + host + port**, compared exactly. Regexes (`CORS_ALLOWED_ORIGIN_REGEXES`) help with preview deployments, but must match the **whole** origin (`fullmatch`), otherwise an attacker\'s domain containing your name could pass.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'An axios interceptor decides what to do after each API response. Write `after_response(status, url, retried, has_refresh)` returning one of:\n- `\'ok\'` for status < 400\n- `\'logout\'` if status is 401 and (`url` is the refresh URL `/api/token/refresh/`, or the request was already `retried`, or there is no refresh token)\n- `\'refresh-and-retry\'` for any other 401\n- `\'show-error\'` for every other status >= 400',
      example: { title: 'the interceptor in React', code: "api.interceptors.response.use(r => r, async (error) => {\n  if (error.response?.status === 401 && !error.config._retry) {\n    error.config._retry = true;\n    // refresh the token, then retry the request\n  }\n  return Promise.reject(error);\n});" },
      starter: `def after_response(status, url, retried, has_refresh):
    # TODO
    return 'ok'
`,
      solution: `def after_response(status, url, retried, has_refresh):
    if status < 400:
        return 'ok'
    if status == 401:
        if url == '/api/token/refresh/' or retried or not has_refresh:
            return 'logout'
        return 'refresh-and-retry'
    return 'show-error'
`,
      tests: [
        { call: "after_response(200, '/api/books/', False, True)", expect: 'ok' },
        { call: "after_response(401, '/api/books/', False, True)", expect: 'refresh-and-retry' },
        { call: "after_response(401, '/api/books/', True, True)", expect: 'logout', msg: 'Never retry a request twice (infinite loop)' },
        { call: "after_response(401, '/api/token/refresh/', False, True)", expect: 'logout', msg: 'If the refresh call itself fails, the session is over' },
        { call: "after_response(401, '/api/books/', False, False)", expect: 'logout' },
        { call: "after_response(400, '/api/books/', False, True)", expect: 'show-error' },
        { call: "after_response(403, '/api/books/7/', False, True)", expect: 'show-error', msg: '403 means not allowed - refreshing the token will not help' },
      ],
      explain: 'Only **401** means "token expired/invalid", so only 401 triggers a refresh - and only once per request (`_retry` flag), otherwise a bad refresh token causes an endless loop. 403 is a permission problem and 400 a validation error: show them to the user.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'This Django view checks what django-cors-headers would decide for a preflight request. What does it print? (runs inside a configured Django project)',
      code: `from django.test import RequestFactory
from django.http import JsonResponse

ALLOWED = {'http://localhost:5173'}

def cors(view):
    def wrapper(request, *args, **kwargs):
        origin = request.headers.get('Origin')
        if request.method == 'OPTIONS':
            response = JsonResponse({}, status=200)
        else:
            response = view(request, *args, **kwargs)
        if origin in ALLOWED:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Headers'] = 'authorization, content-type'
        return response
    return wrapper

@cors
def books(request):
    return JsonResponse({'count': 2})

rf = RequestFactory()
r = books(rf.options('/api/books/', HTTP_ORIGIN='http://localhost:5173'))
print(r.status_code, r.get('Access-Control-Allow-Origin'))
r = books(rf.get('/api/books/', HTTP_ORIGIN='http://localhost:3000'))
print(r.status_code, r.get('Access-Control-Allow-Origin'))`,
      expected: '200 http://localhost:5173\n200 None',
      explain: 'For the allowed origin the preflight gets the `Access-Control-Allow-*` headers, so the browser continues. The request from `localhost:3000` still reaches the server and gets 200 - but **without** the CORS header, so the **browser** hides the response from JavaScript. CORS protects users\' browsers; it is not server-side access control.',
    },
  ],
};
