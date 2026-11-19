export default {
  lesson: 'day-25-sessions-cookies-caching',
  minutes: 35,
  intro: 'Practise cookies, request.session, session engines, the cache framework (cache_page, {% cache %}, low-level API) and invalidation, and implement a recently-viewed list and a TTL cache in Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'With Django\'s default session engine (`db`), where is the session data stored?',
      options: ['Entirely in the browser cookie', 'In the django_session database table; the browser only keeps a random sessionid cookie', 'In settings.py', 'In localStorage'],
      answer: 1,
      explain: 'The default `SessionMiddleware` + `db` engine stores data server-side in `django_session`; the browser only holds the session **key**. Other engines: `cache`, `cached_db`, `file`, and `signed_cookies` (data in the cookie, signed but readable).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the decorator that caches the whole course list page for 15 minutes:\n\n```\n______\ndef course_list(request):\n    ...\n```',
      accept: ['@cache_page(60 * 15)', '@cache_page(900)', '@cache_page(15 * 60)', '@cache_page(60*15)', '@cache_page(15*60)'],
      explain: '`@cache_page(seconds)` stores the full response in the cache, keyed by URL (query string included). Use it for public pages that look the same for everyone - not for pages showing the logged-in user\'s data.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'request.session behaves like a dict: request.session["theme"] = "dark"',
        'After changing a list inside the session in place, set request.session.modified = True',
        'cache.get("key") returns None when the key is missing or expired',
        'LocMemCache is shared between all Gunicorn worker processes',
        'When a course is updated, its cached data must be deleted or refreshed (invalidation)',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Sessions save automatically only when you **assign**; in-place changes need `modified = True`. LocMemCache is per **process**, so multiple workers have separate caches - use Redis/Memcached in production. Cache invalidation (e.g. `cache.delete` in a `post_save` signal) keeps data fresh.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `track_view(session, student_id, limit=5)` for a "Recently viewed students" box. `session` is a dict (like `request.session`). Keep `session[\'recent\']` as a list of ids, **newest first**, no duplicates (viewing again moves the id to the front), at most `limit` items. Set `session[\'modified\'] = True` and return the list.',
      example: { title: 'move to front', code: "items = [3, 1, 2]\nitems.remove(1)\nitems.insert(0, 1)\nprint(items)   # [1, 3, 2]" },
      starter: `def track_view(session, student_id, limit=5):
    # TODO
    return []
`,
      solution: `def track_view(session, student_id, limit=5):
    recent = session.get('recent', [])
    if student_id in recent:
        recent.remove(student_id)
    recent.insert(0, student_id)
    session['recent'] = recent[:limit]
    session['modified'] = True
    return session['recent']
`,
      tests: [
        { call: 'track_view({}, 7)', expect: [7] },
        { call: "(lambda s: [track_view(s, i) for i in (1, 2, 3)][-1])({})", expect: [3, 2, 1] },
        { call: "(lambda s: [track_view(s, i) for i in (1, 2, 3, 1)][-1])({})", expect: [1, 3, 2], msg: 'Viewing again moves the id to the front' },
        { call: "(lambda s: [track_view(s, i, 3) for i in range(1, 8)][-1])({})", expect: [7, 6, 5] },
        { call: "(lambda s: (track_view(s, 4), s['modified'])[1])({})", expect: true },
      ],
      explain: 'Store only **ids** in the session (small and always fresh - load the students from the DB when displaying). In real Django assigning `request.session[\'recent\'] = ...` already marks it modified; mutating the list in place would not.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Implement the low-level cache API with expiry. Class `Cache` with `set(key, value, timeout, now)`, `get(key, now, default=None)` (expired or missing → default, and remove expired keys), `delete(key)` and `get_or_set(key, func, timeout, now)` (returns the cached value, or calls `func()`, stores and returns it). Also keep `self.hits` and `self.misses` counters updated by `get`/`get_or_set`.',
      example: { title: 'the real API', code: "from django.core.cache import cache\ncourses = cache.get_or_set('course_list', lambda: list(Course.objects.all()), 300)" },
      starter: `class Cache:
    def __init__(self):
        self.store = {}
        self.hits = 0
        self.misses = 0

    # TODO: set, get, delete, get_or_set
`,
      solution: `class Cache:
    def __init__(self):
        self.store = {}
        self.hits = 0
        self.misses = 0

    def set(self, key, value, timeout, now):
        self.store[key] = (value, now + timeout)

    def get(self, key, now, default=None):
        item = self.store.get(key)
        if item is None or item[1] <= now:
            self.store.pop(key, None)
            self.misses += 1
            return default
        self.hits += 1
        return item[0]

    def delete(self, key):
        self.store.pop(key, None)

    def get_or_set(self, key, func, timeout, now):
        sentinel = object()
        value = self.get(key, now, sentinel)
        if value is sentinel:
            value = func()
            self.set(key, value, timeout, now)
        return value
`,
      tests: [
        { call: "(lambda c: (c.set('courses', ['BCA', 'MCA'], 300, 0), c.get('courses', 100), c.get('courses', 300)))(Cache())[1:]", expect: [['BCA', 'MCA'], null] },
        { call: "(lambda c, calls: (c.get_or_set('n', lambda: calls.append(1) or 42, 60, 0), c.get_or_set('n', lambda: calls.append(1) or 99, 60, 10), len(calls), c.hits, c.misses))(Cache(), [])", expect: [42, 42, 1, 1, 1], msg: 'The second get_or_set must use the cache (func called once)' },
        { call: "(lambda c: (c.set('k', 'v', 60, 0), c.delete('k'), c.get('k', 1, 'gone'))[2])(Cache())", expect: 'gone' },
        { call: "(lambda c: (c.set('zero', 0, 60, 0), c.get_or_set('zero', lambda: 5, 60, 1))[1])(Cache())", expect: 0, msg: 'A cached falsy value like 0 is still a hit' },
      ],
      explain: '`get_or_set` is the classic "cache-aside" pattern. Using a sentinel object (not `None`/falsy) lets you cache values like 0 or empty lists. Expiry (`timeout`) and explicit `delete` (invalidation when data changes) are the two ways stale data leaves the cache.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project using the default local-memory cache)',
      code: `from django.core.cache import cache
from django.http import HttpResponse
from django.test import RequestFactory

cache.set('course_count', 12, 300)
print(cache.get('course_count'), cache.get('missing'), cache.get('missing', 'n/a'))
print(cache.incr('course_count'), cache.add('course_count', 99), cache.get('course_count'))
cache.delete('course_count')
print(cache.get_or_set('course_count', lambda: 20, 300))

rf = RequestFactory()
def set_theme(request):
    r = HttpResponse('saved')
    r.set_cookie('theme', 'dark', max_age=3600, httponly=True, samesite='Lax')
    return r
c = set_theme(rf.get('/')).cookies['theme']
print(c.value, c['max-age'], c['httponly'], c['samesite'])`,
      expected: '12 None n/a\n13 False 13\n20\ndark 3600 True Lax',
      explain: '`get` returns None (or your default) for missing keys. `incr` increases atomically; `add` only sets if the key does **not** exist, so it returns False. After delete, `get_or_set` computes 20. `set_cookie` produces a `Set-Cookie` header with max-age, HttpOnly and SameSite flags.',
    },
  ],
};
