export default {
  lesson: 'day-10-throttling-versioning-api-docs',
  minutes: 30,
  intro: 'Practise throttle classes and rates, API versioning schemes and drf-spectacular docs, and implement a rate limiter and version detection in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A client exceeds its throttle rate. Which status code does DRF return?',
      options: ['403 Forbidden', '401 Unauthorized', '429 Too Many Requests', '503 Service Unavailable'],
      answer: 2,
      explain: 'Throttled requests get **429 Too Many Requests** with a `Retry-After` header and a message like "Request was throttled. Expected available in 42 seconds." Clients should wait that long before retrying.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the settings so anonymous users get 100 requests per day and logged-in users 1000 per day:\n\n```\n\'DEFAULT_THROTTLE_RATES\': {\n    \'anon\': \'100/day\',\n    ______,\n},\n```',
      accept: ["'user': '1000/day'", '"user": "1000/day"', "'user': '1000/d'", '"user": "1000/d"'],
      explain: 'Rates are `"number/period"` with period `second`, `minute`, `hour` or `day` (only the first letter matters). The keys match the throttle `scope`: `AnonRateThrottle` uses `anon`, `UserRateThrottle` uses `user`. Throttle history is stored in the **cache**, so production needs a shared cache like Redis.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'URLPathVersioning reads the version from the URL, e.g. /api/v2/books/',
        'AcceptHeaderVersioning reads it from Accept: application/json; version=2.0',
        'Inside a view, request.version holds the detected version',
        'drf-spectacular serves Swagger UI from the OpenAPI schema it generates',
        'Throttling is a reliable security protection against DDoS attacks',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Versioning schemes only differ in **where** the version is read from; views branch on `request.version` (e.g. return a different serializer). drf-spectacular generates the OpenAPI 3 schema and serves Swagger UI / ReDoc. Throttling limits fair use; it is not DDoS protection (that happens at the network/proxy level).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Implement DRF\'s throttle algorithm (sliding window). Class `RateThrottle(rate)` where `rate` is like `\'3/minute\'` (periods: `second`=1, `minute`=60, `hour`=3600, `day`=86400). Keep `self.history = {key: [timestamps]}`. Method `allow(key, now)`:\n1. drop timestamps older than `now - duration` (keep those `> now - duration`)\n2. if the remaining count >= num_requests → return `(False, wait)` where `wait` = `duration - (now - oldest_remaining)`\n3. otherwise record `now` and return `(True, 0)`',
      example: { title: 'parsing the rate', code: "num, period = '100/day'.split('/')\nprint(int(num), period[0])   # 100 d" },
      starter: `class RateThrottle:
    DURATIONS = {'s': 1, 'm': 60, 'h': 3600, 'd': 86400}

    def __init__(self, rate):
        self.history = {}
        # TODO: parse rate into self.num_requests and self.duration

    def allow(self, key, now):
        # TODO
        return (True, 0)
`,
      solution: `class RateThrottle:
    DURATIONS = {'s': 1, 'm': 60, 'h': 3600, 'd': 86400}

    def __init__(self, rate):
        self.history = {}
        num, period = rate.split('/')
        self.num_requests = int(num)
        self.duration = self.DURATIONS[period[0]]

    def allow(self, key, now):
        hist = [t for t in self.history.get(key, []) if t > now - self.duration]
        self.history[key] = hist
        if len(hist) >= self.num_requests:
            return (False, self.duration - (now - min(hist)))
        hist.append(now)
        return (True, 0)
`,
      tests: [
        { call: "(lambda t: [t.allow('ip1', s) for s in (0, 10, 20, 30)])(RateThrottle('3/minute'))", expect: [[true, 0], [true, 0], [true, 0], [false, 30]] },
        { call: "(lambda t: [t.allow('ip1', s) for s in (0, 10, 20, 61)])(RateThrottle('3/minute'))", expect: [[true, 0], [true, 0], [true, 0], [true, 0]], msg: 'After 60 s the first request leaves the window' },
        { call: "(lambda t: [t.allow('asha', 0), t.allow('ravi', 1), t.allow('asha', 2)])(RateThrottle('1/hour'))", expect: [[true, 0], [true, 0], [false, 3598]], msg: 'Each user/IP key has its own history' },
        { call: "(lambda t: [t.num_requests, t.duration])(RateThrottle('100/day'))", expect: [100, 86400] },
      ],
      explain: 'DRF\'s `SimpleRateThrottle` stores a list of request times per key (user id or IP) in the cache, removes old ones and compares the count with the limit; `wait()` becomes the `Retry-After` header. Note DRF only looks at the first letter of the period, which is why `\'1000/d\'` also works.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `detect_version(path, accept, scheme, allowed=(\'v1\', \'v2\'), default=\'v1\')` returning the version string or `\'404\'` (invalid version):\n- `scheme == \'url\'`: the path part right after `/api/` (e.g. `/api/v2/books/` → `\'v2\'`)\n- `scheme == \'header\'`: from the `accept` header parameter `version=...` (e.g. `application/json; version=v2`); missing → `default`\n- a version not in `allowed` → `\'404\'`',
      example: { title: 'reading a header parameter', code: "accept = 'application/json; version=v2'\nfor part in accept.split(';'):\n    k, _, v = part.strip().partition('=')\n    print(k, v)" },
      starter: `def detect_version(path, accept, scheme, allowed=('v1', 'v2'), default='v1'):
    # TODO
    return default
`,
      solution: `def detect_version(path, accept, scheme, allowed=('v1', 'v2'), default='v1'):
    version = default
    if scheme == 'url':
        parts = path.strip('/').split('/')
        version = parts[1] if len(parts) > 1 and parts[0] == 'api' else default
    elif scheme == 'header':
        for part in (accept or '').split(';'):
            key, _, value = part.strip().partition('=')
            if key == 'version':
                version = value.strip()
    return version if version in allowed else '404'
`,
      tests: [
        { call: "detect_version('/api/v2/books/', '', 'url')", expect: 'v2' },
        { call: "detect_version('/api/v1/books/7/', '', 'url')", expect: 'v1' },
        { call: "detect_version('/api/v9/books/', '', 'url')", expect: '404' },
        { call: "detect_version('/api/books/', 'application/json; version=v2', 'header')", expect: 'v2' },
        { call: "detect_version('/api/books/', 'application/json', 'header')", expect: 'v1' },
        { call: "detect_version('/api/books/', 'application/json; version=v3', 'header')", expect: '404' },
      ],
      explain: 'Versioning lets old mobile apps keep using v1 while new clients use v2. URL versioning is the most visible and easiest to test in a browser; header versioning keeps URLs clean. `ALLOWED_VERSIONS` makes DRF reject unknown versions instead of silently serving something unexpected.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from rest_framework.throttling import SimpleRateThrottle

class BurstThrottle(SimpleRateThrottle):
    scope = 'burst'
    rate = '5/minute'
    def get_cache_key(self, request, view):
        return 'burst-asha'

t = BurstThrottle()
print(t.num_requests, t.duration)
print(t.parse_rate('100/day'))
print(t.parse_rate('2/s'))`,
      expected: '5 60\n(100, 86400)\n(2, 1)',
      explain: '`parse_rate` splits `"number/period"` and maps the **first letter** of the period to seconds (s=1, m=60, h=3600, d=86400). A custom throttle only needs a `scope`/`rate` and `get_cache_key()` that says whom to count (user id, IP, API key...).',
    },
  ],
};
