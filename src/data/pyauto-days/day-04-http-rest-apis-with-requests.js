export default {
  id: "day-04-http-rest-apis-with-requests",
  title: "HTTP and REST APIs with requests",
  module: "Module 2: Web & APIs",
  day: 4,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Understand how HTTP works and use the requests library to call REST APIs: GET and POST, query parameters, JSON, headers, authentication, pagination, timeouts, retries and proper error handling. APIs are the cleanest and most reliable way to automate data collection.",
  objectives: [
    "Explain HTTP methods, status codes, headers and JSON bodies",
    "Send GET and POST requests with params, json and headers using requests",
    "Authenticate with API keys and bearer tokens stored in environment variables",
    "Handle errors with raise_for_status(), timeouts and retries",
    "Collect all records from paginated APIs",
  ],
  theory: [
    {
      heading: "HTTP in 5 Minutes",
      content: "Every time your browser opens a page or an app loads data, it sends an **HTTP request** and gets an **HTTP response**. A request has a method (GET, POST...), a URL, headers and optionally a body. A response has a status code, headers and a body (HTML, JSON, image...).\n\nA **REST API** is a web service that returns data (usually JSON) instead of web pages. Examples: GitHub API, weather APIs, payment gateways like Razorpay, government open-data portals. Using an API is always better than scraping a website: the data is structured, stable and the provider officially allows it.",
      points: [
        "GET: read data | POST: create | PUT/PATCH: update | DELETE: remove",
        "2xx success (200 OK, 201 Created, 204 No Content)",
        "4xx client error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests)",
        "5xx server error (500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable)",
      ],
    },
    {
      heading: "GET Requests, Params and JSON",
      content: "Install with `pip install requests`. `requests.get(url, params=...)` builds the query string for you (`?city=Pune&units=metric`), so you never concatenate URLs by hand. `response.json()` converts the JSON body into Python dicts and lists. Always pass a `timeout`, otherwise a slow server can hang your script forever.",
      syntax: `import requests

resp = requests.get(
    "https://api.github.com/search/repositories",
    params={"q": "language:python", "sort": "stars", "per_page": 5},
    timeout=10,
)
print(resp.status_code)        # 200
print(resp.url)                # full URL with query string
data = resp.json()             # dict
for repo in data["items"]:
    print(repo["full_name"], repo["stargazers_count"])
`,
      tip: "timeout=10 means 10 seconds for connecting and 10 for each read. You can pass a tuple: timeout=(3, 30).",
    },
    {
      heading: "POST, PUT, DELETE and Request Bodies",
      content: "To send JSON, use the `json=` argument: requests serialises the dict and sets `Content-Type: application/json`. Use `data=` for HTML form-style data and `files=` for uploads. The response to a successful create is usually `201 Created` with the new object.",
      syntax: `new_post = {"title": "Daily report", "body": "Sales up 8%", "userId": 1}
r = requests.post("https://jsonplaceholder.typicode.com/posts", json=new_post, timeout=10)
print(r.status_code, r.json()["id"])     # 201 101

requests.put(url, json=full_object, timeout=10)
requests.patch(url, json={"title": "new"}, timeout=10)
requests.delete(url, timeout=10)
requests.post(url, files={"file": open("report.pdf", "rb")}, timeout=30)
`,
    },
    {
      heading: "Headers and Authentication",
      content: "Headers carry extra information: `User-Agent`, `Accept`, and most importantly authentication. Common styles: an **API key** in a header or query parameter, a **Bearer token** (`Authorization: Bearer <token>`), or **Basic auth** (`auth=(user, password)`). Never hardcode secrets in code or commit them to Git; read them from environment variables or a `.env` file loaded with python-dotenv.",
      syntax: `import os
token = os.environ["GITHUB_TOKEN"]          # set in terminal, not in code
headers = {
    "Authorization": f"Bearer {token}",
    "Accept": "application/vnd.github+json",
    "User-Agent": "upskillr-report-bot/1.0",
}
r = requests.get("https://api.github.com/user", headers=headers, timeout=10)

r = requests.get(url, auth=("api_user", os.environ["API_PASS"]), timeout=10)  # Basic auth
`,
      tip: "Linux/macOS: export GITHUB_TOKEN=xxx   Windows PowerShell: $env:GITHUB_TOKEN=\"xxx\"",
    },
    {
      heading: "Error Handling, Timeouts and Retries",
      content: "requests does **not** raise an error for 404 or 500 by default; you must check. `resp.raise_for_status()` raises `requests.HTTPError` for 4xx/5xx. Network problems raise `requests.ConnectionError` and slow servers raise `requests.Timeout`. All of them inherit from `requests.RequestException`.\n\nFor temporary errors (429, 500, 502, 503, 504) retry with exponential backoff. You can mount a `urllib3` `Retry` on a `Session`, which also reuses connections (faster for many calls).",
      syntax: `from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()
retry = Retry(total=3, backoff_factor=1,
              status_forcelist=[429, 500, 502, 503, 504],
              allowed_methods=["GET"])
session.mount("https://", HTTPAdapter(max_retries=retry))

try:
    r = session.get(url, timeout=10)
    r.raise_for_status()
except requests.Timeout:
    print("Server too slow")
except requests.HTTPError as e:
    print("HTTP error:", e.response.status_code)
except requests.RequestException as e:
    print("Network problem:", e)
`,
    },
    {
      heading: "Pagination and Rate Limits",
      content: "APIs rarely return thousands of records at once. They split results into **pages**. Common styles: page number (`?page=2&per_page=100`), offset/limit (`?offset=200&limit=100`), cursor (`next_cursor` in the response) or a `next` URL in the body or in the `Link` header (GitHub uses this; requests exposes it as `resp.links`). Loop until there is no next page.\n\nAPIs also limit how many calls you may make per minute or hour. Respect `429 Too Many Requests` and the `Retry-After` header, add small sleeps between calls and cache results you already have.",
      points: [
        "Read the API documentation first: page size limits, auth and rate limits",
        "Check headers like X-RateLimit-Remaining when the API provides them",
        "Store raw responses in JSON files while developing, so you do not call the API repeatedly",
      ],
    },
  ],
  examples: [
    {
      title: "First GET Request and Reading JSON",
      scenario: "Fetch a sample to-do item from the free JSONPlaceholder test API and print selected fields.",
      steps: [
        "Install: pip install requests",
        "Create main.py and paste the code",
        "Run: python main.py (needs internet)",
      ],
      code: `import requests

resp = requests.get("https://jsonplaceholder.typicode.com/todos/1", timeout=10)
print("Status:", resp.status_code)
print("Content-Type:", resp.headers["Content-Type"])
todo = resp.json()
print(type(todo).__name__, todo)
print("Done?" , "Yes" if todo["completed"] else "No")
`,
      result: `Status: 200
Content-Type: application/json; charset=utf-8
dict {'userId': 1, 'id': 1, 'title': 'delectus aut autem', 'completed': False}
Done? No`,
      explanation: "requests.get() sends the request; status_code 200 means success. Header lookup is case-insensitive in requests. resp.json() turns JSON into a Python dict, where JSON false becomes Python False.",
    },
    {
      title: "POST JSON and Check the Created Object",
      scenario: "Create a new post on the test API, as you would create a ticket or order in a real system.",
      steps: [
        "Install: pip install requests",
        "Run: python main.py (needs internet)",
        "JSONPlaceholder fakes the save, so id 101 is always returned",
      ],
      code: `import requests

payload = {"title": "Daily sales report", "body": "Revenue Rs 2,45,000", "userId": 7}
resp = requests.post("https://jsonplaceholder.typicode.com/posts", json=payload, timeout=10)
resp.raise_for_status()

print("Status:", resp.status_code)
print("Sent header:", resp.request.headers["Content-Type"])
print("Created:", resp.json())
`,
      result: `Status: 201
Sent header: application/json
Created: {'title': 'Daily sales report', 'body': 'Revenue Rs 2,45,000', 'userId': 7, 'id': 101}`,
      explanation: "json=payload serialises the dict and sets the Content-Type header automatically (resp.request shows what was actually sent). 201 Created is the standard success code for creating a resource. raise_for_status() would raise HTTPError if the server had returned 4xx or 5xx.",
    },
    {
      title: "Robust API Client with Session, Retries and Errors",
      scenario: "A nightly job calls an API many times. It must reuse connections, retry temporary failures and report clear errors instead of crashing.",
      steps: [
        "Install: pip install requests",
        "Run: python main.py (needs internet)",
        "httpbin.org/status/404 deliberately returns 404 to test error handling",
      ],
      code: `import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def make_session():
    s = requests.Session()
    retry = Retry(total=3, backoff_factor=0.5,
                  status_forcelist=[429, 500, 502, 503, 504],
                  allowed_methods=["GET"], respect_retry_after_header=True)
    s.mount("https://", HTTPAdapter(max_retries=retry))
    s.headers.update({"User-Agent": "upskillr-bot/1.0"})
    return s

def fetch_json(session, url, **params):
    try:
        r = session.get(url, params=params, timeout=(3, 10))
        r.raise_for_status()
        return r.json()
    except requests.Timeout:
        print("TIMEOUT:", url)
    except requests.HTTPError as e:
        print("HTTP", e.response.status_code, "for", e.response.url)
    except requests.RequestException as e:
        print("NETWORK ERROR:", type(e).__name__)
    return None

s = make_session()
users = fetch_json(s, "https://jsonplaceholder.typicode.com/users")
print("Users:", len(users), "| first city:", users[0]["address"]["city"])
fetch_json(s, "https://httpbin.org/status/404")
`,
      result: `Users: 10 | first city: Gwenborough
HTTP 404 for https://httpbin.org/status/404`,
      explanation: "A Session reuses TCP connections and default headers. The Retry adapter retries only safe GET requests on temporary status codes with exponential backoff (0.5s, 1s, 2s). 404 is not in status_forcelist, so it is not retried; raise_for_status() turns it into HTTPError, which we catch and report. The function returns None on any failure, so the caller can decide what to do.",
    },
    {
      title: "Collect All Pages from a Paginated API (Offline Simulation)",
      scenario: "Learn the pagination loop without internet: a fake API function returns 4 items per page and a next_page value, just like many real APIs.",
      steps: [
        "No pip install needed (standard library only)",
        "Run: python main.py",
        "Then replace fake_api() with session.get(url, params={'page': page}).json() for a real API",
      ],
      code: `import json

DATA = [{"id": i, "amount": i * 150} for i in range(1, 11)]

def fake_api(page, per_page=4):
    start = (page - 1) * per_page
    items = DATA[start:start + per_page]
    has_more = start + per_page < len(DATA)
    body = {"page": page, "items": items, "next_page": page + 1 if has_more else None}
    return json.dumps(body)          # real APIs send JSON text

all_items = []
page = 1
while page is not None:
    body = json.loads(fake_api(page))
    all_items.extend(body["items"])
    print(f"page {body['page']}: got {len(body['items'])} items")
    page = body["next_page"]

print("Total items:", len(all_items))
print("Total amount:", sum(item["amount"] for item in all_items))
`,
      result: `page 1: got 4 items
page 2: got 4 items
page 3: got 2 items
Total items: 10
Total amount: 8250`,
      explanation: "The loop keeps requesting pages until next_page is None. json.dumps/json.loads mimic the text that travels over HTTP. In real code, add time.sleep() between calls and a safety limit on the maximum number of pages to avoid infinite loops if the API misbehaves.",
      python: {
        files: {
          "main.py": `import json

DATA = [{"id": i, "amount": i * 150} for i in range(1, 11)]

def fake_api(page, per_page=4):
    start = (page - 1) * per_page
    items = DATA[start:start + per_page]
    has_more = start + per_page < len(DATA)
    body = {"page": page, "items": items, "next_page": page + 1 if has_more else None}
    return json.dumps(body)          # real APIs send JSON text

all_items = []
page = 1
while page is not None:
    body = json.loads(fake_api(page))
    all_items.extend(body["items"])
    print(f"page {body['page']}: got {len(body['items'])} items")
    page = body["next_page"]

print("Total items:", len(all_items))
print("Total amount:", sum(item["amount"] for item in all_items))
`,
        },
      },
    },
    {
      title: "Authenticated API Call with a Token from the Environment",
      scenario: "List your own GitHub repositories using a personal access token without writing the token in the code, following the Link header for pagination.",
      steps: [
        "Install: pip install requests",
        "Create a fine-grained token on GitHub (Settings > Developer settings) with read-only access",
        "Set it: export GITHUB_TOKEN=xxxx (PowerShell: $env:GITHUB_TOKEN=\"xxxx\")",
        "Run: python main.py",
      ],
      code: `import os
import sys
import time
import requests

token = os.getenv("GITHUB_TOKEN")
if not token:
    sys.exit("Please set the GITHUB_TOKEN environment variable")

session = requests.Session()
session.headers.update({
    "Authorization": f"Bearer {token}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
})

url = "https://api.github.com/user/repos"
params = {"per_page": 50, "sort": "updated"}
repos = []
while url:
    r = session.get(url, params=params, timeout=10)
    if r.status_code == 401:
        sys.exit("Token is invalid or expired")
    r.raise_for_status()
    repos.extend(r.json())
    print("Remaining calls this hour:", r.headers.get("X-RateLimit-Remaining"))
    url = r.links.get("next", {}).get("url")
    params = None              # the next URL already contains the query string
    time.sleep(0.5)

for repo in repos[:5]:
    print(repo["name"], "| private" if repo["private"] else "| public")
print("Total repos:", len(repos))
`,
      result: `Remaining calls this hour: 4999
url-shortener | public
sales-dashboard | private
python-automation | public
...
Total repos: 23
(values depend on your account)`,
      explanation: "os.getenv reads the token at runtime so it never appears in source control. A 401 means bad credentials. GitHub sends pagination links in the Link header; requests parses it into r.links. We stop when there is no 'next' link and sleep briefly between calls to be polite with rate limits.",
    },
  ],
  interview: [
    { q: "What is the difference between GET and POST?", a: "GET retrieves data; parameters go in the URL query string; it should not change server state and is idempotent and cacheable. POST sends data in the request body to create or process something; it is not idempotent (sending twice may create two records).", level: "Easy" },
    { q: "What do status codes 401, 403, 404 and 429 mean?", a: "401 Unauthorized: missing or invalid credentials. 403 Forbidden: authenticated but not allowed. 404 Not Found: resource does not exist. 429 Too Many Requests: you hit the rate limit; slow down and respect Retry-After.", level: "Easy" },
    { q: "What is the difference between json= and data= in requests.post()?", a: "`json=` serialises a Python object to JSON and sets Content-Type: application/json. `data=` with a dict sends form-encoded data (application/x-www-form-urlencoded); with a string/bytes it sends the raw body as is.", level: "Medium" },
    { q: "Does requests raise an exception for a 500 response?", a: "No. Only network-level problems raise exceptions automatically. Call `resp.raise_for_status()` or check `resp.ok` / `resp.status_code` yourself.", level: "Easy" },
    { q: "Why must you always set a timeout?", a: "requests has no default timeout, so a server that never responds can block your script forever, which is dangerous in scheduled jobs. Use timeout=(connect, read), e.g. (3, 30).", level: "Medium" },
    { q: "What is the benefit of requests.Session()?", a: "It reuses the underlying TCP/TLS connection (connection pooling), which is much faster for many calls, keeps cookies between requests, and lets you set default headers and auth once. You can also mount retry adapters on it.", level: "Medium" },
    { q: "How do you implement retries with exponential backoff?", a: "Mount `HTTPAdapter(max_retries=Retry(total=..., backoff_factor=..., status_forcelist=[429,500,502,503,504], allowed_methods=[\"GET\"]))` on a Session, or write a loop that sleeps `base * 2**attempt` seconds (plus random jitter) between attempts. Only retry idempotent requests and temporary errors.", level: "Hard" },
    { q: "Explain different pagination styles.", a: "Page-number (page=3&per_page=100), offset/limit (offset=200&limit=100), cursor-based (API returns next_cursor; stable even when data changes) and link-based (a next URL in the body or Link header). Cursor pagination is preferred for large, frequently changing datasets.", level: "Medium" },
    { q: "How do you keep API keys secure in automation scripts?", a: "Read them from environment variables, a .env file excluded via .gitignore, or a secrets manager (AWS Secrets Manager, Azure Key Vault). Never print or log them, never commit them, and use tokens with minimum permissions that can be rotated.", level: "Medium" },
    { q: "Why prefer an official API over scraping a website?", a: "APIs return structured JSON, are documented and versioned, do not break when the page design changes, are faster, and using them is explicitly permitted under the provider's terms. Scraping can violate terms of service and is fragile.", level: "Easy" },
    { q: "Your script gets 429 errors after a few hundred calls. How do you fix it?", a: "Read the API's rate limit docs; slow down with sleeps or a token bucket; honour the Retry-After header; use exponential backoff; cache responses; request bigger pages to reduce calls; and if allowed, use bulk endpoints or request a higher quota.", level: "Hard" },
    { q: "What is idempotency and why does it matter for retries?", a: "An operation is idempotent if doing it many times has the same effect as doing it once (GET, PUT, DELETE). Retrying idempotent calls is safe. Retrying a POST may create duplicates, so many APIs (e.g. payment gateways) accept an Idempotency-Key header.", level: "Hard" },
  ],
  practice: [
    {
      task: "Fetch https://jsonplaceholder.typicode.com/users and print each user's name and city.",
      hint: "resp.json() returns a list of dicts; city is under user['address']['city'].",
      solution: `import requests

r = requests.get("https://jsonplaceholder.typicode.com/users", timeout=10)
r.raise_for_status()
for u in r.json():
    print(u["name"], "-", u["address"]["city"])
`,
    },
    {
      task: "Use params= to fetch only the posts of userId 3 from https://jsonplaceholder.typicode.com/posts and print how many there are.",
      hint: "params={'userId': 3}",
      solution: `import requests

r = requests.get("https://jsonplaceholder.typicode.com/posts", params={"userId": 3}, timeout=10)
r.raise_for_status()
print(r.url)
print(len(r.json()), "posts")   # 10
`,
    },
    {
      task: "Write a function get_with_retry(url, attempts=3) that retries on ConnectionError, Timeout or 5xx with exponential backoff (1s, 2s, 4s) and returns the JSON.",
      hint: "Loop with for attempt in range(attempts) and time.sleep(2 ** attempt).",
      solution: `import time
import requests

def get_with_retry(url, attempts=3):
    for attempt in range(attempts):
        try:
            r = requests.get(url, timeout=10)
            if r.status_code < 500:
                r.raise_for_status()
                return r.json()
            print("Server error", r.status_code)
        except (requests.ConnectionError, requests.Timeout) as e:
            print("Attempt", attempt + 1, "failed:", type(e).__name__)
        time.sleep(2 ** attempt)
    raise RuntimeError(f"Failed after {attempts} attempts: {url}")
`,
    },
    {
      task: "Fetch all comments from https://jsonplaceholder.typicode.com/comments using _page and _limit=100 query parameters until an empty list is returned, then save them to comments.json.",
      hint: "JSONPlaceholder supports _page and _limit. Stop when the list is empty.",
      solution: `import json
import time
import requests

all_comments, page = [], 1
with requests.Session() as s:
    while True:
        r = s.get("https://jsonplaceholder.typicode.com/comments",
                  params={"_page": page, "_limit": 100}, timeout=10)
        r.raise_for_status()
        batch = r.json()
        if not batch:
            break
        all_comments.extend(batch)
        page += 1
        time.sleep(0.2)

with open("comments.json", "w", encoding="utf-8") as f:
    json.dump(all_comments, f, indent=2)
print(len(all_comments), "comments saved")   # 500
`,
    },
  ],
  quiz: [
    { question: "Which status code means the resource was created successfully?", options: ["200", "201", "204", "302"], answer: 1, explanation: "201 Created is returned after a successful create, typically for POST." },
    { question: "What does resp.raise_for_status() do?", options: ["Retries the request", "Raises HTTPError if the status is 4xx or 5xx", "Prints the status code", "Converts the body to JSON"], answer: 1, explanation: "It does nothing for success codes and raises requests.HTTPError for client/server errors." },
    { question: "Which argument automatically sends a dict as a JSON body?", options: ["data=", "params=", "json=", "body="], answer: 2, explanation: "json= serialises the object and sets the JSON Content-Type header." },
    { question: "What is the default timeout of requests.get()?", options: ["5 seconds", "30 seconds", "60 seconds", "No timeout: it can wait forever"], answer: 3, explanation: "requests has no default timeout; always pass one." },
    { question: "Where should an API token be stored for a script?", options: ["Hardcoded in main.py", "In an environment variable or secrets manager", "In the URL of a public GitHub README", "In a comment at the top of the file"], answer: 1, explanation: "Secrets must stay out of source code and version control." },
    { question: "Which status code tells you that you are sending requests too fast?", options: ["400", "403", "429", "503"], answer: 2, explanation: "429 Too Many Requests indicates rate limiting." },
  ],
};
