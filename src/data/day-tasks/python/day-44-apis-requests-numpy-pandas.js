export default {
  lesson: 'day-44-apis-requests-numpy-pandas',
  minutes: 40,
  intro: 'Build API URLs, handle JSON responses and status codes safely, then analyse data with NumPy arrays and Pandas DataFrames.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You POST a new student to `/api/students` and the server creates it. Which HTTP status code should it return?',
      options: ['200 OK', '201 Created', '204 No Content', '404 Not Found'],
      answer: 1,
      explain: '**201 Created** means a new resource was created (often with its URL in the Location header). 200 is a general success, 204 success without a body, 4xx are client errors (404 not found, 401 unauthorised) and 5xx server errors.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Working with JSON and query strings offline. What is printed?',
      code: `import json
from urllib.parse import urlencode
body = '{"page": 1, "results": [{"name": "Asha", "active": true}, {"name": "Ravi", "active": false}]}'
data = json.loads(body)
print(type(data).__name__, len(data["results"]))
print([u["name"] for u in data["results"] if u["active"]])
print("https://api.example.com/users?" + urlencode({"city": "Navi Mumbai", "page": 2}))`,
      expected: "dict 2\n['Asha']\nhttps://api.example.com/users?city=Navi+Mumbai&page=2",
      explain: '`json.loads` turns JSON text into Python dicts/lists (`true` → True). `urlencode` builds a safe query string and encodes spaces as `+`. With requests you would simply pass `params={...}` and call `response.json()`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Robust API handling (with a fake client, no network). `fetch(url)` returns a tuple `(status_code, body_text)`. Write `get_json(fetch, url)` that:\n- returns the parsed JSON (dict/list) for status **200**\n- returns `{"error": "not found"}` for **404**\n- returns `{"error": "server error"}` for any **5xx**\n- returns `{"error": "bad json"}` if a 200 body is not valid JSON (`json.JSONDecodeError`)',
      example: { title: 'checking the status first', code: 'status, body = 200, \'{"ok": true}\'\nif status == 200:\n    data = json.loads(body)\nelif status >= 500:\n    print("try again later")' },
      starter: `import json

def get_json(fetch, url):
    status, body = fetch(url)
    return json.loads(body)   # TODO: handle status codes and bad JSON
`,
      solution: `import json

def get_json(fetch, url):
    status, body = fetch(url)
    if status == 404:
        return {"error": "not found"}
    if 500 <= status < 600:
        return {"error": "server error"}
    try:
        return json.loads(body)
    except json.JSONDecodeError:
        return {"error": "bad json"}
`,
      tests: [
        { call: 'get_json(lambda u: (200, \'{"id": 7, "name": "Asha"}\'), "/users/7")', expect: { id: 7, name: 'Asha' } },
        { call: 'get_json(lambda u: (404, "Not Found"), "/users/99")', expect: { error: 'not found' } },
        { call: 'get_json(lambda u: (503, "<html>down</html>"), "/users")', expect: { error: 'server error' } },
        { call: 'get_json(lambda u: (200, "<html>oops</html>"), "/users")', expect: { error: 'bad json' } },
      ],
      explain: 'Always check the status **before** parsing: error pages are often HTML, and `json.loads` on them raises JSONDecodeError. With `requests`, `response.raise_for_status()` and a `timeout=` argument are the usual safety nets.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'NumPy basics. Using `numpy` (vectorised operations, **no Python loops**), write:\n- `above_average(marks)` → list of marks strictly above the mean (boolean filtering, return `.tolist()`)\n- `with_gst(prices)` → list of prices × 1.18 rounded to 2 (`np.round`)\n- `scale(matrix, factors)` → each **column** multiplied by the matching factor (broadcasting), as a nested list',
      example: { title: 'vectorised NumPy', code: 'import numpy as np\na = np.array([10, 20, 30])\nprint(a * 2)            # [20 40 60]\nprint(a[a > 15])        # [20 30]\nprint(np.array([[1, 2], [3, 4]]) * np.array([10, 100]))  # broadcasting per column' },
      starter: `import numpy as np

def above_average(marks):
    pass  # TODO

def with_gst(prices):
    pass  # TODO

def scale(matrix, factors):
    pass  # TODO
`,
      solution: `import numpy as np

def above_average(marks):
    a = np.array(marks)
    return a[a > a.mean()].tolist()

def with_gst(prices):
    return np.round(np.array(prices) * 1.18, 2).tolist()

def scale(matrix, factors):
    return (np.array(matrix) * np.array(factors)).tolist()
`,
      tests: [
        { call: 'above_average([50, 80, 70, 90]) == [80, 90]', expect: true, msg: 'above_average([50, 80, 70, 90]) should be [80, 90]' },
        { call: 'with_gst([100, 49.99]) == [118.0, 58.99]', expect: true, msg: 'with_gst([100, 49.99]) should be [118.0, 58.99]' },
        { call: 'scale([[1, 2], [3, 4]], [10, 100]) == [[10, 200], [30, 400]]', expect: true, msg: 'scale([[1, 2], [3, 4]], [10, 100]) should be [[10, 200], [30, 400]]' },
      ],
      explain: 'NumPy applies an operation to the whole array at once (fast C loops). `a > a.mean()` creates a boolean mask that selects items. A shape (2,) array is **broadcast** across each row, multiplying column-wise. `.tolist()` converts back to plain Python values.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Pandas basics. `rows` is a list of dicts with keys `city`, `product`, `qty`, `price`. Write `city_report(rows)` that:\n1. builds a DataFrame\n2. adds a column `amount = qty * price`\n3. keeps only rows with `qty > 0`\n4. groups by `city` and sums `amount`\n5. returns a plain dict city → total (Python ints), **sorted by total, highest first**',
      example: { title: 'DataFrame essentials', code: 'import pandas as pd\ndf = pd.DataFrame([{"a": 1, "b": 2}, {"a": 3, "b": 4}])\ndf["c"] = df["a"] * df["b"]\nprint(df[df["a"] > 1])\nprint(df.groupby("a")["c"].sum())' },
      starter: `import pandas as pd

def city_report(rows):
    df = pd.DataFrame(rows)
    # TODO
    return {}
`,
      solution: `import pandas as pd

def city_report(rows):
    df = pd.DataFrame(rows)
    df["amount"] = df["qty"] * df["price"]
    df = df[df["qty"] > 0]
    totals = df.groupby("city")["amount"].sum().sort_values(ascending=False)
    return {city: int(total) for city, total in totals.items()}
`,
      tests: [
        { call: `(lambda r: (r == {"Pune": 1700, "Delhi": 650}, list(r)))(city_report([{"city": "Pune", "product": "pen", "qty": 10, "price": 10}, {"city": "Delhi", "product": "bag", "qty": 1, "price": 650}, {"city": "Pune", "product": "book", "qty": 4, "price": 400}, {"city": "Delhi", "product": "pen", "qty": 0, "price": 10}]))`, expect: [true, ['Pune', 'Delhi']], msg: 'expected {"Pune": 1700, "Delhi": 650} in this order (highest total first)' },
      ],
      explain: 'Column arithmetic (`df["qty"] * df["price"]`) works on whole columns; filtering uses a boolean mask; `groupby(...)[col].sum()` aggregates. Pandas returns NumPy integers, so convert with `int()` before handing data to JSON or other code.',
    },
  ],
};
