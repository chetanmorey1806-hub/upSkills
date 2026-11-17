export default {
  id: "day-44-apis-requests-numpy-pandas",
  title: "Working with APIs using requests, Intro to NumPy and Pandas",
  module: "Module 7: Interview Prep & Project",
  day: 44,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Understand REST APIs, HTTP methods, status codes and JSON, call real APIs with the requests library (and practise offline with the json module), then take your first steps in data analysis with NumPy arrays and Pandas DataFrames.",
  objectives: [
    "Explain APIs, REST, HTTP methods, status codes, headers and JSON",
    "Make GET/POST requests with requests, pass params, headers and timeouts, and handle errors",
    "Parse and build JSON data with the json module and simulate API responses offline",
    "Create NumPy arrays and use vectorised operations, broadcasting, aggregation and boolean filtering",
    "Create Pandas DataFrames, read CSV, select, filter, sort, add columns and group data",
  ],
  theory: [
    {
      heading: "What is an API?",
      content: "An API (Application Programming Interface) is a way for two programs to talk to each other. A web API lets your Python program request data from a server over HTTP, e.g. weather data, payment status or a list of products. Analogy: a restaurant waiter - you (client) give an order (request) to the waiter (API), who brings food (response) from the kitchen (server). REST APIs use URLs for resources (/users/1) and HTTP methods for actions, and usually return JSON.",
      points: [
        "GET - read data",
        "POST - create new data",
        "PUT / PATCH - update data (full / partial)",
        "DELETE - remove data",
        "Status codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error",
        "Headers carry metadata: Content-Type, Authorization: Bearer <token>",
      ],
    },
    {
      heading: "The requests Library",
      content: "requests is the most popular third-party library for HTTP in Python (pip install requests). requests.get(url, params=..., headers=..., timeout=...) returns a Response object with status_code, headers, text and a .json() method. requests.post(url, json=payload) sends JSON. Always set a timeout, check the status (response.raise_for_status() raises HTTPError for 4xx/5xx), and catch requests.exceptions.RequestException for network problems.",
      syntax: `import requests

resp = requests.get("https://api.example.com/products",
                    params={"category": "books", "page": 1},
                    headers={"Authorization": "Bearer MY_TOKEN"},
                    timeout=10)
resp.raise_for_status()
data = resp.json()          # dict / list
`,
      tip: "Never hard-code API keys in code. Store them in environment variables: os.environ['API_KEY']. Note: requests needs internet, so practise offline with the json module in the browser IDE.",
    },
    {
      heading: "JSON in Python",
      content: "JSON (JavaScript Object Notation) is the text format used by almost all APIs. json.loads(text) converts JSON text into Python objects (object -> dict, array -> list, true -> True, null -> None). json.dumps(obj, indent=2) converts Python objects into JSON text. json.load / json.dump work with files.",
      syntax: `import json
text = '{"name": "Asha", "active": true, "skills": ["python", "sql"]}'
user = json.loads(text)      # dict
print(user["skills"][0])     # python
print(json.dumps(user, indent=2))
`,
    },
    {
      heading: "Introduction to NumPy",
      content: "NumPy (Numerical Python, pip install numpy) provides the ndarray: a fast, fixed-type, multi-dimensional array. Operations are vectorised - written once for the whole array and executed in optimised C code, often 10-100x faster than Python loops. Broadcasting lets you combine arrays of different shapes (array + 5). It is the foundation of Pandas, scikit-learn, TensorFlow and OpenCV.",
      syntax: `import numpy as np
a = np.array([1, 2, 3])
a * 2              # [2 4 6]  (a list would repeat: [1, 2, 3, 1, 2, 3])
a.sum(), a.mean()
m = np.arange(6).reshape(2, 3)
m[:, 1]            # second column
a[a > 1]           # boolean filtering
`,
      points: [
        "shape, ndim, dtype, size describe an array",
        "np.zeros, np.ones, np.arange, np.linspace, np.random create arrays",
        "axis=0 means down the columns, axis=1 across the rows",
      ],
    },
    {
      heading: "Introduction to Pandas",
      content: "Pandas (pip install pandas) is the Excel of Python. A Series is one labelled column; a DataFrame is a table of rows and columns with an index. You can read CSV/Excel/SQL/JSON, clean data, filter rows, add calculated columns, group and aggregate, merge tables and export results - the same tasks you do in Excel or Power BI, but automated and repeatable.",
      syntax: `import pandas as pd
df = pd.read_csv("sales.csv")
df.head()                       # first 5 rows
df["total"] = df["price"] * df["qty"]
df[df["total"] > 1000]          # filter
df.groupby("region")["total"].sum()
df.sort_values("total", ascending=False)
df.to_csv("report.csv", index=False)
`,
      points: [
        "df.shape, df.columns, df.dtypes, df.info(), df.describe()",
        "Select: df['col'], df[['a', 'b']], df.loc[row_label, col], df.iloc[row_pos, col_pos]",
        "Missing data: df.isna(), df.dropna(), df.fillna(value)",
      ],
    },
    {
      heading: "Common Mistakes",
      content: "Forgetting timeout in requests (the program can hang), not checking status codes, calling .json() on an HTML error page, confusing json.load (file) with json.loads (string), using Python loops over NumPy arrays instead of vectorised operations, and chained assignment in pandas (use df.loc[mask, 'col'] = value).",
      points: [
        "NumPy arrays have one dtype; mixing types upcasts (e.g. to float or str)",
        "pandas filter conditions need & and | with brackets: df[(df.a > 1) & (df.b < 5)]",
        "NumPy/Pandas/requests are NOT part of the standard library - install them with pip in your venv",
      ],
    },
  ],
  examples: [
    {
      title: "Calling a Real REST API with requests (run locally)",
      scenario: "Fetch a user from the free JSONPlaceholder test API and create a new post.",
      steps: [
        "Activate your virtual environment and run: pip install requests",
        "Create api_demo.py in VS Code / PyCharm and paste the code",
        "Run: python api_demo.py (internet connection required)",
        "Compare your output with the result below",
      ],
      code: `# pip install requests
import requests

BASE = "https://jsonplaceholder.typicode.com"

try:
    resp = requests.get(f"{BASE}/users/1", timeout=10)
    resp.raise_for_status()                 # error for 4xx / 5xx
    user = resp.json()                      # JSON -> dict
    print("Status:", resp.status_code)
    print("Name:", user["name"])
    print("Email:", user["email"])
    print("City:", user["address"]["city"])

    new_post = {"title": "Hello API", "body": "Learning Python", "userId": 1}
    created = requests.post(f"{BASE}/posts", json=new_post, timeout=10)
    print("Created:", created.status_code, "id =", created.json()["id"])

    missing = requests.get(f"{BASE}/users/9999", timeout=10)
    print("Missing user status:", missing.status_code)
except requests.exceptions.Timeout:
    print("Server too slow")
except requests.exceptions.RequestException as e:
    print("Request failed:", e)
`,
      result: `Status: 200
Name: Leanne Graham
Email: Sincere@april.biz
City: Gwenborough
Created: 201 id = 101
Missing user status: 404`,
      explanation: "requests.get returns a Response; raise_for_status() stops on HTTP errors; .json() converts the body to Python objects so nested data is read with normal dict keys. requests.post(json=...) sends JSON and the server replies 201 Created with the new id (101 on this fake API). A non-existent user gives 404. This needs internet and pip install requests, so it does not run in the browser IDE - the next examples practise the same ideas offline.",
    },
    {
      title: "Offline API Practice with json and urllib.parse",
      scenario: "Simulate an e-commerce API response, parse it, handle status codes and build request URLs and payloads - all offline.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import json
from urllib.parse import urlencode

API_RESPONSE = '''
{
  "status": 200,
  "page": 1,
  "total_pages": 2,
  "data": [
    {"id": 1, "name": "Laptop", "price": 55000, "in_stock": true, "tags": ["electronics"]},
    {"id": 2, "name": "Mouse", "price": 499, "in_stock": false, "tags": []},
    {"id": 3, "name": "Desk", "price": 7500, "in_stock": true, "discount": null}
  ]
}
'''

payload = json.loads(API_RESPONSE)          # JSON text -> dict
print(type(payload).__name__, payload["status"], len(payload["data"]), "products")

for p in payload["data"]:
    stock = "In stock" if p["in_stock"] else "Out of stock"
    print(f"{p['id']}. {p['name']:<7} Rs.{p['price']:>6,}  {stock}")

print("discount for Desk:", payload["data"][2]["discount"])
print("Missing key with get():", payload["data"][0].get("discount", 0))

available = [p["name"] for p in payload["data"] if p["in_stock"]]
print("Available:", available)

query = urlencode({"category": "office chairs", "page": 2, "sort": "price"})
print("GET URL: https://api.shop.com/products?" + query)

order = {"product_id": 1, "qty": 2, "gift": False, "note": None}
body = json.dumps(order)
print("POST body:", body)

STATUS = {200: "OK", 201: "Created", 400: "Bad Request", 401: "Unauthorized", 404: "Not Found", 500: "Server Error"}
for code in (201, 404, 500):
    advice = "success" if code < 300 else "retry later" if code >= 500 else "fix the request"
    print(code, STATUS[code], "->", advice)
`,
      python: {
        files: {
          "main.py": `import json
from urllib.parse import urlencode

API_RESPONSE = '''
{
  "status": 200,
  "page": 1,
  "total_pages": 2,
  "data": [
    {"id": 1, "name": "Laptop", "price": 55000, "in_stock": true, "tags": ["electronics"]},
    {"id": 2, "name": "Mouse", "price": 499, "in_stock": false, "tags": []},
    {"id": 3, "name": "Desk", "price": 7500, "in_stock": true, "discount": null}
  ]
}
'''

payload = json.loads(API_RESPONSE)          # JSON text -> dict
print(type(payload).__name__, payload["status"], len(payload["data"]), "products")

for p in payload["data"]:
    stock = "In stock" if p["in_stock"] else "Out of stock"
    print(f"{p['id']}. {p['name']:<7} Rs.{p['price']:>6,}  {stock}")

print("discount for Desk:", payload["data"][2]["discount"])
print("Missing key with get():", payload["data"][0].get("discount", 0))

available = [p["name"] for p in payload["data"] if p["in_stock"]]
print("Available:", available)

query = urlencode({"category": "office chairs", "page": 2, "sort": "price"})
print("GET URL: https://api.shop.com/products?" + query)

order = {"product_id": 1, "qty": 2, "gift": False, "note": None}
body = json.dumps(order)
print("POST body:", body)

STATUS = {200: "OK", 201: "Created", 400: "Bad Request", 401: "Unauthorized", 404: "Not Found", 500: "Server Error"}
for code in (201, 404, 500):
    advice = "success" if code < 300 else "retry later" if code >= 500 else "fix the request"
    print(code, STATUS[code], "->", advice)
`,
        },
      },
      result: `dict 200 3 products
1. Laptop  Rs.55,000  In stock
2. Mouse   Rs.   499  Out of stock
3. Desk    Rs. 7,500  In stock
discount for Desk: None
Missing key with get(): 0
Available: ['Laptop', 'Desk']
GET URL: https://api.shop.com/products?category=office+chairs&page=2&sort=price
POST body: {"product_id": 1, "qty": 2, "gift": false, "note": null}
201 Created -> success
404 Not Found -> fix the request
500 Server Error -> retry later`,
      explanation: "json.loads turns the JSON text into dicts and lists: true/false become True/False and null becomes None. .get() avoids KeyError for missing fields. urlencode builds a safe query string (spaces become +). json.dumps converts a Python dict to JSON text for a POST body - note False -> false and None -> null. 5xx errors are usually temporary, so clients retry.",
    },
    {
      title: "Reusable API Client with Error Handling (Mocked Server)",
      scenario: "Build a small client class that retries on server errors and handles pagination, tested against a fake in-memory server.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import json

class FakeServer:
    """Pretends to be a remote API so we can practise without internet."""
    def __init__(self):
        self.calls = 0
        self.users = [{"id": i, "name": n} for i, n in enumerate(["Asha", "Ravi", "Neha", "Arun", "Divya"], 1)]

    def handle(self, method, path, params):
        self.calls += 1
        if self.calls == 1:
            return 503, json.dumps({"error": "Service busy"})
        if path == "/users":
            page, size = params.get("page", 1), 2
            chunk = self.users[(page - 1) * size: page * size]
            return 200, json.dumps({"page": page, "has_next": page * size < len(self.users), "data": chunk})
        return 404, json.dumps({"error": "Not found"})

class APIError(Exception):
    pass

class APIClient:
    def __init__(self, server, retries=3):
        self.server = server
        self.retries = retries

    def get(self, path, **params):
        for attempt in range(1, self.retries + 1):
            status, text = self.server.handle("GET", path, params)
            data = json.loads(text)
            if status == 200:
                return data
            if status >= 500:
                print(f"  attempt {attempt}: {status} {data['error']} - retrying")
                continue
            raise APIError(f"{status}: {data['error']}")
        raise APIError("server unavailable")

    def get_all_users(self):
        users, page = [], 1
        while True:
            body = self.get("/users", page=page)
            users.extend(body["data"])
            print(f"  fetched page {page}: {[u['name'] for u in body['data']]}")
            if not body["has_next"]:
                return users
            page += 1

client = APIClient(FakeServer())
all_users = client.get_all_users()
print("Total users:", len(all_users))
try:
    client.get("/orders")
except APIError as e:
    print("APIError:", e)
`,
      python: {
        files: {
          "main.py": `import json

class FakeServer:
    """Pretends to be a remote API so we can practise without internet."""
    def __init__(self):
        self.calls = 0
        self.users = [{"id": i, "name": n} for i, n in enumerate(["Asha", "Ravi", "Neha", "Arun", "Divya"], 1)]

    def handle(self, method, path, params):
        self.calls += 1
        if self.calls == 1:
            return 503, json.dumps({"error": "Service busy"})
        if path == "/users":
            page, size = params.get("page", 1), 2
            chunk = self.users[(page - 1) * size: page * size]
            return 200, json.dumps({"page": page, "has_next": page * size < len(self.users), "data": chunk})
        return 404, json.dumps({"error": "Not found"})

class APIError(Exception):
    pass

class APIClient:
    def __init__(self, server, retries=3):
        self.server = server
        self.retries = retries

    def get(self, path, **params):
        for attempt in range(1, self.retries + 1):
            status, text = self.server.handle("GET", path, params)
            data = json.loads(text)
            if status == 200:
                return data
            if status >= 500:
                print(f"  attempt {attempt}: {status} {data['error']} - retrying")
                continue
            raise APIError(f"{status}: {data['error']}")
        raise APIError("server unavailable")

    def get_all_users(self):
        users, page = [], 1
        while True:
            body = self.get("/users", page=page)
            users.extend(body["data"])
            print(f"  fetched page {page}: {[u['name'] for u in body['data']]}")
            if not body["has_next"]:
                return users
            page += 1

client = APIClient(FakeServer())
all_users = client.get_all_users()
print("Total users:", len(all_users))
try:
    client.get("/orders")
except APIError as e:
    print("APIError:", e)
`,
        },
      },
      result: `  attempt 1: 503 Service busy - retrying
  fetched page 1: ['Asha', 'Ravi']
  fetched page 2: ['Neha', 'Arun']
  fetched page 3: ['Divya']
Total users: 5
APIError: 404: Not found`,
      explanation: "The fake server fails the first call with 503, so the client retries and then succeeds - real clients do the same for temporary server errors. Pagination: the client keeps requesting the next page while has_next is true and collects all users. A 404 is a client error, so it is raised immediately as APIError instead of retrying.",
    },
    {
      title: "NumPy Basics: Arrays, Vectorised Maths, Broadcasting, Filtering",
      scenario: "Analyse student marks and shop sales using NumPy arrays instead of loops.",
      steps: [
        "Activate your virtual environment and run: pip install numpy",
        "Create numpy_demo.py and paste the code",
        "Run: python numpy_demo.py (in the browser IDE it runs directly - numpy is loaded automatically)",
        "Compare your output with the result below",
      ],
      code: `# Local machine: pip install numpy   (the browser IDE loads numpy automatically)
import numpy as np

marks = np.array([78, 92, 85, 64, 90])
print(marks)
print(marks.shape, marks.ndim, marks.size)
print(marks + 5)                       # broadcasting: add 5 to every element
print(marks.mean(), marks.max(), marks.min())
print(marks[marks >= 85])              # boolean filtering
print(np.where(marks >= 75, "Pass", "Fail"))

py_list = [1, 2, 3]
print(py_list * 2, np.array(py_list) * 2)

m = np.array([[1, 2, 3], [4, 5, 6]])
print(m.shape)
print(m.T)
print(m.sum(axis=0), m.sum(axis=1))
print(m[:, 1], m[1, 2])
print(np.arange(1, 7).reshape(3, 2))

price = np.array([100, 250, 40])
qty = np.array([2, 1, 5])
print(price * qty, (price * qty).sum(), np.dot(price, qty))
print(np.zeros(3), np.linspace(0, 1, 5))
`,
      python: {
        files: {
          "main.py": `# Local machine: pip install numpy   (the browser IDE loads numpy automatically)
import numpy as np

marks = np.array([78, 92, 85, 64, 90])
print(marks)
print(marks.shape, marks.ndim, marks.size)
print(marks + 5)                       # broadcasting: add 5 to every element
print(marks.mean(), marks.max(), marks.min())
print(marks[marks >= 85])              # boolean filtering
print(np.where(marks >= 75, "Pass", "Fail"))

py_list = [1, 2, 3]
print(py_list * 2, np.array(py_list) * 2)

m = np.array([[1, 2, 3], [4, 5, 6]])
print(m.shape)
print(m.T)
print(m.sum(axis=0), m.sum(axis=1))
print(m[:, 1], m[1, 2])
print(np.arange(1, 7).reshape(3, 2))

price = np.array([100, 250, 40])
qty = np.array([2, 1, 5])
print(price * qty, (price * qty).sum(), np.dot(price, qty))
print(np.zeros(3), np.linspace(0, 1, 5))
`,
        },
      },
      result: `[78 92 85 64 90]
(5,) 1 5
[83 97 90 69 95]
81.8 92 64
[92 85 90]
['Pass' 'Pass' 'Pass' 'Fail' 'Pass']
[1, 2, 3, 1, 2, 3] [2 4 6]
(2, 3)
[[1 4]
 [2 5]
 [3 6]]
[5 7 9] [ 6 15]
[2 5] 6
[[1 2]
 [3 4]
 [5 6]]
[200 250 200] 650 650
[0. 0. 0.] [0.   0.25 0.5  0.75 1.  ]`,
      explanation: "Operations like marks + 5 or price * qty apply to every element at once (vectorised), without a for loop. The mean is 409 / 5 = 81.8. A boolean mask (marks >= 85) selects matching elements, and np.where picks values element-wise. Multiplying a list repeats it, but multiplying an array multiplies each number. axis=0 sums down the columns, axis=1 across the rows. NumPy is not in the standard library: install it with pip install numpy on your machine.",
    },
    {
      title: "Pandas Basics: DataFrame, Filter, Sort, New Column, Group By",
      scenario: "Turn a small CSV of student data into a report, the same way you would in Excel or Power BI.",
      steps: [
        "Activate your virtual environment and run: pip install pandas",
        "Create pandas_demo.py and paste the code",
        "Run: python pandas_demo.py (in the browser IDE it runs directly - pandas is loaded automatically)",
        "Compare your output with the result below",
      ],
      code: `# Local machine: pip install pandas   (the browser IDE loads pandas automatically)
import io
import numpy as np
import pandas as pd

csv_text = '''name,dept,marks
Asha,CSE,88
Ravi,ECE,72
Neha,CSE,95
Arun,MECH,60
Divya,ECE,81
'''
df = pd.read_csv(io.StringIO(csv_text))   # same as pd.read_csv("students.csv")
print(df)
print(df.shape, df.columns.tolist())
print("Average marks:", df["marks"].mean())
print("Name in row 2:", df.loc[2, "name"])

print(df[df["marks"] > 80])

print(df.sort_values("marks", ascending=False).head(3))

df["result"] = np.where(df["marks"] >= 75, "Distinction", "Pass")
print(df[["name", "marks", "result"]])

for dept, avg in df.groupby("dept")["marks"].mean().items():
    print(f"{dept:<5} average {avg:.1f}")

df.to_csv("report.csv", index=False)
print(open("report.csv").read().splitlines()[0])
`,
      python: {
        files: {
          "main.py": `# Local machine: pip install pandas   (the browser IDE loads pandas automatically)
import io
import numpy as np
import pandas as pd

csv_text = '''name,dept,marks
Asha,CSE,88
Ravi,ECE,72
Neha,CSE,95
Arun,MECH,60
Divya,ECE,81
'''
df = pd.read_csv(io.StringIO(csv_text))   # same as pd.read_csv("students.csv")
print(df)
print(df.shape, df.columns.tolist())
print("Average marks:", df["marks"].mean())
print("Name in row 2:", df.loc[2, "name"])

print(df[df["marks"] > 80])

print(df.sort_values("marks", ascending=False).head(3))

df["result"] = np.where(df["marks"] >= 75, "Distinction", "Pass")
print(df[["name", "marks", "result"]])

for dept, avg in df.groupby("dept")["marks"].mean().items():
    print(f"{dept:<5} average {avg:.1f}")

df.to_csv("report.csv", index=False)
print(open("report.csv").read().splitlines()[0])
`,
        },
      },
      result: `    name  dept  marks
0   Asha   CSE     88
1   Ravi   ECE     72
2   Neha   CSE     95
3   Arun  MECH     60
4  Divya   ECE     81
(5, 3) ['name', 'dept', 'marks']
Average marks: 79.2
Name in row 2: Neha
    name  dept  marks
0   Asha   CSE     88
2   Neha   CSE     95
4  Divya   ECE     81
    name  dept  marks
2   Neha   CSE     95
0   Asha   CSE     88
4  Divya   ECE     81
    name  marks       result
0   Asha     88  Distinction
1   Ravi     72         Pass
2   Neha     95  Distinction
3   Arun     60         Pass
4  Divya     81  Distinction
CSE   average 91.5
ECE   average 76.5
MECH  average 60.0
name,dept,marks,result`,
      explanation: "read_csv builds a DataFrame (a table with an index 0-4). df[df['marks'] > 80] keeps only matching rows and their original index labels. sort_values sorts rows; head(3) keeps the top 3. np.where creates a new column from a condition. groupby('dept') splits the rows by department and mean() aggregates each group: CSE (88 + 95) / 2 = 91.5, ECE (72 + 81) / 2 = 76.5, MECH 60.0. to_csv exports the report. Pandas is not in the standard library: install it with pip install pandas.",
    },
  ],
  interview: [
    {
      q: "What is an API and what is REST?",
      a: "An API is an interface that lets programs communicate. REST is an architectural style for web APIs that uses URLs for resources, standard HTTP methods (GET, POST, PUT, PATCH, DELETE), stateless requests and usually JSON responses.",
      level: "Easy",
    },
    {
      q: "Difference between GET and POST?",
      a: "GET retrieves data, sends parameters in the URL, should not change server state and is cacheable. POST sends data in the request body to create/process something.",
      level: "Easy",
    },
    {
      q: "Difference between PUT and PATCH?",
      a: "PUT replaces the whole resource with the data sent; PATCH updates only the given fields.",
      level: "Medium",
    },
    {
      q: "What do status codes 200, 201, 400, 401, 403, 404 and 500 mean?",
      a: "200 OK, 201 Created, 400 Bad Request (invalid input), 401 Unauthorized (not logged in), 403 Forbidden (no permission), 404 Not Found, 500 Internal Server Error.",
      level: "Easy",
    },
    {
      q: "Difference between json.loads and json.load?",
      a: "json.loads parses a JSON string; json.load reads and parses from a file object. Similarly dumps returns a string and dump writes to a file.",
      level: "Easy",
    },
    {
      q: "Why should you set a timeout in requests?",
      a: "Without it, a request can wait forever if the server does not respond, freezing your program. Use timeout=seconds and handle requests.exceptions.Timeout.",
      level: "Medium",
    },
    {
      q: "What does response.raise_for_status() do?",
      a: "It raises requests.exceptions.HTTPError if the status code is 4xx or 5xx; otherwise it does nothing.",
      level: "Medium",
    },
    {
      q: "Why is NumPy faster than Python lists?",
      a: "Arrays store fixed-type values in contiguous memory and operations run in optimised compiled C code (vectorisation) without per-element Python overhead.",
      level: "Medium",
    },
    {
      q: "What is broadcasting in NumPy?",
      a: "Automatically expanding arrays of different but compatible shapes during arithmetic, e.g. adding a scalar or a row vector to every row of a matrix, without copying data.",
      level: "Hard",
    },
    {
      q: "Difference between a Pandas Series and DataFrame?",
      a: "A Series is a one-dimensional labelled array (one column). A DataFrame is a two-dimensional table made of multiple Series sharing an index.",
      level: "Easy",
    },
    {
      q: "Difference between loc and iloc?",
      a: "loc selects by labels (index labels and column names, end inclusive in slices). iloc selects by integer positions (end exclusive).",
      level: "Medium",
    },
    {
      q: `What is the output?
import json
print(json.dumps({'ok': True, 'v': None}))`,
      a: "{\"ok\": true, \"v\": null} - Python True/None become JSON true/null.",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Parse this JSON and print each employee's name and salary: '[{\"name\": \"A\", \"salary\": 50000}, {\"name\": \"B\", \"salary\": 65000}]'",
      hint: "json.loads returns a list of dicts.",
      solution: `import json
text = '[{"name": "A", "salary": 50000}, {"name": "B", "salary": 65000}]'
for emp in json.loads(text):
    print(emp["name"], emp["salary"])
`,
    },
    {
      task: "Write a function that calls GET https://jsonplaceholder.typicode.com/todos?userId=1 with requests and counts completed todos (run locally).",
      hint: "Use params={'userId': 1} and sum(t['completed'] for t in data).",
      solution: `import requests
def completed_todos(user_id):
    r = requests.get("https://jsonplaceholder.typicode.com/todos",
                     params={"userId": user_id}, timeout=10)
    r.raise_for_status()
    return sum(t["completed"] for t in r.json())
print(completed_todos(1))
`,
    },
    {
      task: "Save a Python dict to config.json with indentation and read it back.",
      hint: "json.dump(obj, f, indent=2) and json.load(f).",
      solution: `import json
cfg = {"debug": True, "port": 8000}
with open("config.json", "w") as f:
    json.dump(cfg, f, indent=2)
with open("config.json") as f:
    print(json.load(f))
`,
    },
    {
      task: "With NumPy, convert temperatures [30, 25, 40] from Celsius to Fahrenheit in one expression.",
      hint: "F = C * 9 / 5 + 32",
      solution: `import numpy as np
c = np.array([30, 25, 40])
print(c * 9 / 5 + 32)   # [ 86.  77. 104.]
`,
    },
    {
      task: "With Pandas, create a DataFrame of products (name, price, qty), add a total column and print products with total > 1000.",
      hint: "df['total'] = df['price'] * df['qty']",
      solution: `import pandas as pd
df = pd.DataFrame({"name": ["Pen", "Bag", "Shoe"], "price": [10, 800, 1500], "qty": [50, 2, 1]})
df["total"] = df["price"] * df["qty"]
print(df[df["total"] > 1000])
`,
    },
  ],
  quiz: [
    {
      question: "Which HTTP method is used to create a new resource?",
      options: [
        "GET",
        "POST",
        "DELETE",
        "HEAD",
      ],
      answer: 1,
      explanation: "POST sends data to create a resource.",
    },
    {
      question: "Which status code means 'Not Found'?",
      options: [
        "200",
        "500",
        "404",
        "201",
      ],
      answer: 2,
      explanation: "404 Not Found.",
    },
    {
      question: "json.loads('null') returns:",
      options: [
        "None",
        "'null'",
        "0",
        "False",
      ],
      answer: 0,
      explanation: "JSON null maps to Python None.",
    },
    {
      question: "What is np.array([1, 2, 3]) * 2?",
      options: [
        "[1, 2, 3, 1, 2, 3]",
        "Error",
        "[1 2 3 2]",
        "[2 4 6]",
      ],
      answer: 3,
      explanation: "NumPy multiplies element-wise.",
    },
    {
      question: "Which Pandas method groups rows to aggregate them?",
      options: [
        "df.split()",
        "df.pivot_only()",
        "df.groupby()",
        "df.cluster()",
      ],
      answer: 2,
      explanation: "groupby + an aggregation like sum/mean.",
    },
  ],
};
