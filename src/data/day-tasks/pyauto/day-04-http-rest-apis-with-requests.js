export default {
  lesson: 'day-04-http-rest-apis-with-requests',
  minutes: 30,
  intro: 'Understand HTTP methods and status codes, call REST APIs with requests (params, JSON, headers, timeouts, retries), and practise the offline logic: building URLs, collecting paginated results and handling errors.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which HTTP facts are correct? (choose all that apply)',
      options: ['GET reads data; POST creates; PUT/PATCH update; DELETE removes', '200 = OK, 201 = Created, 404 = Not Found', '401 = not authenticated, 403 = authenticated but not allowed', '429 = Too Many Requests (rate limit) – wait and retry', '500 errors mean your request JSON had a typo'],
      answers: [0, 1, 2, 3],
      explain: '**4xx** codes are client errors (your request: bad data 400/422, auth 401/403, missing 404, rate limit 429); **5xx** are server errors (500, 502, 503) – often temporary and worth retrying with backoff.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which requests call is the **most robust** way to fetch `https://api.example.com/orders?status=paid&page=2`?',
      options: [
        'requests.get("https://api.example.com/orders?status=paid&page=2")',
        'r = requests.get("https://api.example.com/orders", params={"status": "paid", "page": 2}, timeout=10)\nr.raise_for_status()\ndata = r.json()',
        'requests.post("https://api.example.com/orders", data="status=paid")',
        'eval(requests.get("https://api.example.com/orders").text)',
      ],
      answer: 1,
      explain: '`params=` builds and URL-encodes the query string, `timeout=` stops the script hanging forever (requests has **no** default timeout), `raise_for_status()` turns 4xx/5xx into exceptions, and `.json()` parses the body safely. Never `eval` text from the internet.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'requests uses the same encoding as `urllib.parse.urlencode`. What does this print?',
      code: `from urllib.parse import urlencode, urlparse, parse_qs
q = urlencode({"city": "New Delhi", "page": 2, "tags": "a&b"})
print(q)
u = urlparse("https://api.shop.in/v1/orders?status=paid&page=3")
print(u.netloc, u.path)
print(parse_qs(u.query)["page"])`,
      expected: "city=New+Delhi&page=2&tags=a%26b\napi.shop.in /v1/orders\n['3']",
      explain: 'Spaces become `+` and `&` inside a value becomes `%26` – otherwise it would start a new parameter. That is why you pass `params={...}` instead of gluing strings. `parse_qs` returns **lists of strings**, because a key can repeat.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**Collect all pages.** `fake_get(page)` simulates an API that returns JSON like `{"data": [...], "next_page": 2}` (`next_page` is `None` on the last page). Write `fetch_all(get_page)` that starts at page 1, keeps calling `get_page(page)` until `next_page` is None, and returns the combined list of items. Also stop (raise `RuntimeError`) if more than 50 pages are requested, to avoid an infinite loop.',
      example: { title: 'a pagination loop', code: 'page, items = 1, []\nwhile page is not None:\n    body = get_page(page)          # requests.get(url, params={"page": page}).json()\n    items.extend(body["results"])\n    page = body["next"]' },
      starter: `PAGES = {1: {"data": [101, 102], "next_page": 2},
         2: {"data": [103, 104], "next_page": 3},
         3: {"data": [105], "next_page": None}}

def fake_get(page):
    return PAGES[page]

def fetch_all(get_page):
    # TODO
    pass
`,
      solution: `PAGES = {1: {"data": [101, 102], "next_page": 2},
         2: {"data": [103, 104], "next_page": 3},
         3: {"data": [105], "next_page": None}}

def fake_get(page):
    return PAGES[page]

def fetch_all(get_page):
    items, page, calls = [], 1, 0
    while page is not None:
        calls += 1
        if calls > 50:
            raise RuntimeError("too many pages")
        body = get_page(page)
        items.extend(body["data"])
        page = body["next_page"]
    return items
`,
      tests: [
        { call: 'fetch_all(fake_get)', expect: [101, 102, 103, 104, 105] },
        { call: 'fetch_all(lambda p: {"data": ["only"], "next_page": None})', expect: ['only'] },
        { call: '__import__("unittest").TestCase().assertRaises(RuntimeError, fetch_all, lambda p: {"data": [p], "next_page": p + 1})', expect: null, msg: 'an API that never ends must raise RuntimeError after 50 pages' },
      ],
      explain: 'Passing the page-fetching function in (instead of calling requests directly) makes the loop testable offline – in production you pass a function that calls `session.get(url, params={"page": p}, timeout=10).json()`. A page limit protects you from a buggy API that always returns a next page.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Retry with backoff.** Write `call_with_retry(func, retries=3, base_delay=1)` that calls `func()` and returns its result. If it raises an exception, retry up to `retries` more times. Do **not** really sleep: instead collect the delays you *would* wait (`base_delay * 2**attempt`: 1, 2, 4, …) in a global list `waits`. If all attempts fail, re-raise the last exception.',
      example: { title: 'exponential backoff', code: 'for attempt in range(4):\n    try:\n        return do_request()\n    except ConnectionError:\n        time.sleep(2 ** attempt)   # 1, 2, 4, 8 seconds' },
      starter: 'waits = []\n\ndef call_with_retry(func, retries=3, base_delay=1):\n    # TODO\n    pass\n',
      solution: 'waits = []\n\ndef call_with_retry(func, retries=3, base_delay=1):\n    for attempt in range(retries + 1):\n        try:\n            return func()\n        except Exception:\n            if attempt == retries:\n                raise\n            waits.append(base_delay * 2 ** attempt)\n',
      tests: [
        { call: '(lambda it: (waits.clear(), call_with_retry(lambda: next(it)() ), list(waits))[1:])(iter([lambda: 1 / 0, lambda: 1 / 0, lambda: "ok"]))', expect: ['ok', [1, 2]], msg: 'two failures then success: result "ok" after waiting 1 and 2 seconds' },
        { call: '(waits.clear(), call_with_retry(lambda: 42), list(waits))[1:]', expect: [42, []] },
        { call: '__import__("unittest").TestCase().assertRaises(ZeroDivisionError, call_with_retry, lambda: 1 / 0, 2)', expect: null, msg: 'after all retries fail, the last exception must be raised again' },
      ],
      explain: 'Temporary failures (timeouts, 429, 503) often succeed a moment later; doubling the wait each time (exponential backoff) gives the server room to recover. Only retry errors that can be temporary – a 400 Bad Request will fail every time. Libraries like `urllib3.Retry` (via `HTTPAdapter`) or `tenacity` do this for you.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the header that sends a bearer token read from an environment variable:\n\n`headers = {"Authorization": f"____ {os.environ[\'API_TOKEN\']}"}`',
      accept: ['Bearer'],
      explain: '`Authorization: Bearer <token>` is the standard for OAuth/JWT tokens. Keep tokens in environment variables or a `.env` file that is **not** committed to Git; never hard-code them in the script.',
    },
  ],
};
