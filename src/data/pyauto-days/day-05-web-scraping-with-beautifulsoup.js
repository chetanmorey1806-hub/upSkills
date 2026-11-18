export default {
  id: "day-05-web-scraping-with-beautifulsoup",
  title: "Web Scraping with BeautifulSoup",
  module: "Module 2: Web & APIs",
  day: 5,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Learn to extract data from web pages responsibly: understand HTML structure, parse pages with BeautifulSoup, select elements with find() and CSS selectors, scrape tables and multiple pages, and save results to CSV, while respecting robots.txt, terms of service and rate limits.",
  objectives: [
    "Read HTML structure: tags, attributes, classes, ids and nesting",
    "Parse HTML with BeautifulSoup and select elements with find_all() and select()",
    "Extract text, links and table data and clean it",
    "Scrape paginated listings politely with delays and a clear User-Agent",
    "Save scraped data to CSV and explain the ethics and legality of scraping",
  ],
  theory: [
    {
      heading: "What is Web Scraping and When is it OK?",
      content: "Web scraping means downloading web pages with a program and extracting data from the HTML. It is useful when there is **no official API**: price monitoring of your own products, collecting public notices, research on public data.\n\nScraping has legal and ethical limits. Before scraping any site, check these points. If an official API or a downloadable dataset exists, use that instead.",
      points: [
        "robots.txt (e.g. https://example.com/robots.txt) tells bots which paths are disallowed; respect it",
        "Read the website's Terms of Service; many forbid automated access or reuse of data",
        "Never scrape personal data (names, phone numbers, emails) - India's DPDP Act 2023 and GDPR protect it",
        "Do not bypass logins, paywalls or CAPTCHAs, and do not copy copyrighted content for republishing",
        "Rate limit: one request every 1-3 seconds, scrape off-peak, cache pages, identify yourself in the User-Agent",
      ],
      tip: "Interview line: \"First I look for an API; if none exists I check robots.txt and the ToS, scrape only public non-personal data, and throttle my requests.\"",
    },
    {
      heading: "HTML Structure Refresher",
      content: "An HTML page is a tree of **elements**. Each element has a tag name (`div`, `a`, `table`), optional **attributes** (`href`, `class`, `id`, `data-price`) and children. Scraping is mostly about finding the repeated pattern that wraps each record, for example every product is a `<div class=\"product\">` that contains a name, a price and a link. Use the browser's **Inspect** tool (right-click > Inspect) to see this structure.",
      syntax: `<div class="product" data-id="101">
  <h2 class="name">Wireless Mouse</h2>
  <span class="price">Rs 599</span>
  <a href="/p/101">Details</a>
</div>
`,
      tip: "Prefer stable hooks such as id, data-* attributes or meaningful class names. Auto-generated classes like 'css-1x9az' change often.",
    },
    {
      heading: "BeautifulSoup Basics",
      content: "Install with `pip install requests beautifulsoup4` (optionally `lxml` for a faster parser). Download the page with requests, then create a soup. `find()` returns the first match or `None`, `find_all()` returns a list. `.get_text(strip=True)` gives clean text and `tag[\"href\"]` or `tag.get(\"href\")` reads an attribute.",
      syntax: `import requests
from bs4 import BeautifulSoup

html = requests.get(url, headers={"User-Agent": "StudentBot/1.0 (contact: me@example.com)"}, timeout=10).text
soup = BeautifulSoup(html, "html.parser")       # or "lxml"

soup.title.get_text()
soup.find("h1")
soup.find_all("a", class_="nav-link")          # class_ because class is a keyword
soup.find("div", id="main")
soup.find("span", attrs={"data-type": "price"})
link = soup.find("a")
link.get("href")
`,
    },
    {
      heading: "CSS Selectors with select()",
      content: "`select()` (all matches) and `select_one()` (first match) accept CSS selectors, the same syntax used in stylesheets and browser DevTools. They are often shorter than chains of find().",
      syntax: `soup.select("div.product")              # div with class product
soup.select_one("#total")                # element with id total
soup.select("table.rates tr")            # tr inside table.rates
soup.select("ul > li")                   # direct children
soup.select('a[href^="https"]')          # attribute starts with
soup.select("div.product h2.name")       # descendant
`,
      points: [
        "Right-click an element in DevTools > Copy > Copy selector gives a starting point (usually needs simplifying)",
        "select_one() returns None when nothing matches; guard before calling .get_text()",
      ],
    },
    {
      heading: "Scraping Tables, Links and Multiple Pages",
      content: "For HTML tables, loop over `tr` rows and read `th`/`td` cells; or use `pandas.read_html()` which turns every `<table>` into a DataFrame in one line (needs lxml). Links are often relative (`/page/2`); convert them with `urllib.parse.urljoin(base_url, href)`. For pagination, follow the 'Next' link until it disappears, sleeping between requests and limiting the number of pages.",
      syntax: `from urllib.parse import urljoin
import time

url = "https://books.toscrape.com/"
for _ in range(3):                      # safety limit
    soup = BeautifulSoup(session.get(url, timeout=10).text, "html.parser")
    # ... extract data ...
    nxt = soup.select_one("li.next > a")
    if not nxt:
        break
    url = urljoin(url, nxt["href"])
    time.sleep(2)                        # be polite
`,
    },
    {
      heading: "Cleaning and Saving Data",
      content: "Scraped text is messy: extra spaces, currency symbols, commas in numbers, missing fields. Clean it immediately: `strip()`, `replace(\",\", \"\")`, `re.sub()` and conversion to `float`/`int`. Then save with the `csv` module (`DictWriter`) or pandas `to_csv()`. Use `encoding=\"utf-8-sig\"` if the CSV will be opened in Excel, so the Rupee symbol and Hindi text display correctly.",
      points: [
        "Static vs dynamic pages: if data is missing from resp.text but visible in the browser, it is loaded by JavaScript; check the Network tab for a JSON API or use Selenium (Day 6)",
        "Always handle missing elements: name = tag.get_text(strip=True) if tag else ''",
        "Save raw HTML while developing so you can re-parse without re-downloading",
      ],
    },
  ],
  examples: [
    {
      title: "Parse Products from HTML with the Standard Library",
      scenario: "Before installing anything, see how parsing works using Python's built-in html.parser on an HTML string. We extract product names and prices.",
      steps: [
        "No pip install needed: html.parser is built in",
        "Run: python main.py",
        "Add another product div to the HTML string and run again",
      ],
      code: `from html.parser import HTMLParser

HTML = """
<div class="product"><h2 class="name">Wireless Mouse</h2><span class="price">Rs 599</span></div>
<div class="product"><h2 class="name">USB Keyboard</h2><span class="price">Rs 1,249</span></div>
<div class="product"><h2 class="name">Laptop Stand</h2><span class="price">Rs 899</span></div>
"""

class ProductParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.field = None
        self.products = []

    def handle_starttag(self, tag, attrs):
        cls = dict(attrs).get("class")
        if cls == "product":
            self.products.append({})
        elif cls in ("name", "price"):
            self.field = cls

    def handle_data(self, data):
        if self.field:
            self.products[-1][self.field] = data.strip()
            self.field = None

parser = ProductParser()
parser.feed(HTML)
for p in parser.products:
    price = int(p["price"].replace("Rs", "").replace(",", ""))
    print(f"{p['name']:<15} {price:>6}")
print("Most expensive:", max(parser.products, key=lambda p: int(p["price"][3:].replace(",", "")))["name"])
`,
      result: `Wireless Mouse     599
USB Keyboard      1249
Laptop Stand       899
Most expensive: USB Keyboard`,
      explanation: "HTMLParser calls handle_starttag for every opening tag and handle_data for the text inside. We start a new dict when a product div opens and remember which field (name or price) we are inside. This shows what BeautifulSoup does for you: it builds the whole tree so you can search it easily. Prices are cleaned by removing 'Rs' and commas before converting to int.",
      python: {
        files: {
          "main.py": `from html.parser import HTMLParser

HTML = """
<div class="product"><h2 class="name">Wireless Mouse</h2><span class="price">Rs 599</span></div>
<div class="product"><h2 class="name">USB Keyboard</h2><span class="price">Rs 1,249</span></div>
<div class="product"><h2 class="name">Laptop Stand</h2><span class="price">Rs 899</span></div>
"""

class ProductParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.field = None
        self.products = []

    def handle_starttag(self, tag, attrs):
        cls = dict(attrs).get("class")
        if cls == "product":
            self.products.append({})
        elif cls in ("name", "price"):
            self.field = cls

    def handle_data(self, data):
        if self.field:
            self.products[-1][self.field] = data.strip()
            self.field = None

parser = ProductParser()
parser.feed(HTML)
for p in parser.products:
    price = int(p["price"].replace("Rs", "").replace(",", ""))
    print(f"{p['name']:<15} {price:>6}")
print("Most expensive:", max(parser.products, key=lambda p: int(p["price"][3:].replace(",", "")))["name"])
`,
        },
      },
    },
    {
      title: "Check robots.txt Before Scraping",
      scenario: "Your scraper must automatically refuse to fetch paths that the site's robots.txt disallows. The standard library has a parser for this. Here we parse a robots.txt stored in a string.",
      steps: [
        "No pip install needed (urllib.robotparser is built in)",
        "Run: python main.py",
        "For a live site use rp.set_url('https://site.com/robots.txt') and rp.read()",
      ],
      code: `from urllib.robotparser import RobotFileParser

ROBOTS = """
User-agent: *
Disallow: /checkout/
Disallow: /account/
Crawl-delay: 2

User-agent: BadBot
Disallow: /
"""

rp = RobotFileParser()
rp.parse(ROBOTS.splitlines())

agent = "StudentBot"
for path in ["/products/page-1", "/checkout/cart", "/account/orders", "/blog/offers"]:
    url = "https://shop.example.com" + path
    status = "ALLOWED " if rp.can_fetch(agent, url) else "BLOCKED "
    print(status, path)
print("Crawl delay:", rp.crawl_delay(agent), "seconds")
print("BadBot can fetch home?", rp.can_fetch("BadBot", "https://shop.example.com/"))
`,
      result: `ALLOWED  /products/page-1
BLOCKED  /checkout/cart
BLOCKED  /account/orders
ALLOWED  /blog/offers
Crawl delay: 2 seconds
BadBot can fetch home? False`,
      explanation: "RobotFileParser reads the rules. can_fetch(agent, url) returns False for disallowed paths, so your scraper can skip them. crawl_delay() returns the delay the site asks for; use it with time.sleep(). The rules for 'BadBot' block everything, showing that rules can target specific user agents. robots.txt is a convention, not a security wall, but respecting it is basic professional ethics.",
      python: {
        files: {
          "main.py": `from urllib.robotparser import RobotFileParser

ROBOTS = """
User-agent: *
Disallow: /checkout/
Disallow: /account/
Crawl-delay: 2

User-agent: BadBot
Disallow: /
"""

rp = RobotFileParser()
rp.parse(ROBOTS.splitlines())

agent = "StudentBot"
for path in ["/products/page-1", "/checkout/cart", "/account/orders", "/blog/offers"]:
    url = "https://shop.example.com" + path
    status = "ALLOWED " if rp.can_fetch(agent, url) else "BLOCKED "
    print(status, path)
print("Crawl delay:", rp.crawl_delay(agent), "seconds")
print("BadBot can fetch home?", rp.can_fetch("BadBot", "https://shop.example.com/"))
`,
        },
      },
    },
    {
      title: "Scrape an HTML Table with BeautifulSoup",
      scenario: "A page shows fuel prices in an HTML table. Extract rows into a list of dicts and save them to CSV. The HTML is stored in a string so you can practise offline.",
      steps: [
        "Install: pip install beautifulsoup4",
        "Run: python main.py",
        "Open fuel_prices.csv in Excel",
      ],
      code: `import csv
from bs4 import BeautifulSoup

html = """
<table id="rates">
  <tr><th>City</th><th>Petrol (Rs/L)</th><th>Diesel (Rs/L)</th></tr>
  <tr><td>Mumbai</td><td> 103.50 </td><td>90.03</td></tr>
  <tr><td>Delhi</td><td>94.77</td><td>87.67</td></tr>
  <tr><td>Pune</td><td>104.04</td><td>90.57</td></tr>
</table>
"""

soup = BeautifulSoup(html, "html.parser")
rows = soup.select("table#rates tr")
headers = [th.get_text(strip=True) for th in rows[0].find_all("th")]

records = []
for tr in rows[1:]:
    cells = [td.get_text(strip=True) for td in tr.find_all("td")]
    records.append(dict(zip(headers, cells)))

with open("fuel_prices.csv", "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=headers)
    writer.writeheader()
    writer.writerows(records)

for r in records:
    print(r)
cheapest = min(records, key=lambda r: float(r["Petrol (Rs/L)"]))
print("Cheapest petrol:", cheapest["City"])
`,
      result: `{'City': 'Mumbai', 'Petrol (Rs/L)': '103.50', 'Diesel (Rs/L)': '90.03'}
{'City': 'Delhi', 'Petrol (Rs/L)': '94.77', 'Diesel (Rs/L)': '87.67'}
{'City': 'Pune', 'Petrol (Rs/L)': '104.04', 'Diesel (Rs/L)': '90.57'}
Cheapest petrol: Delhi`,
      explanation: "select('table#rates tr') finds every row of the table with id rates. The first row gives the header names. For each data row we strip spaces (note ' 103.50 ' became '103.50') and zip headers with cells into a dict. csv.DictWriter writes the records; newline='' prevents blank lines on Windows and utf-8-sig makes Excel read the encoding correctly.",
    },
    {
      title: "Scrape Multiple Pages Politely (books.toscrape.com)",
      scenario: "books.toscrape.com is a sandbox website made for scraping practice. Collect title, price and rating from the first 3 pages, following the Next button, and save to CSV.",
      steps: [
        "Install: pip install requests beautifulsoup4",
        "Open https://books.toscrape.com/robots.txt and the site in a browser and inspect one book card",
        "Run: python main.py (needs internet)",
      ],
      code: `import csv
import time
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup

BASE = "https://books.toscrape.com/"
RATING = {"One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5}
session = requests.Session()
session.headers["User-Agent"] = "UpSkillrStudentBot/1.0 (learning project)"

books, url = [], BASE
for page in range(1, 4):                      # max 3 pages
    resp = session.get(url, timeout=10)
    resp.raise_for_status()
    resp.encoding = "utf-8"
    soup = BeautifulSoup(resp.text, "html.parser")
    for card in soup.select("article.product_pod"):
        books.append({
            "title": card.h3.a["title"],
            "price_gbp": float(card.select_one("p.price_color").get_text(strip=True).lstrip("£")),
            "rating": RATING[card.select_one("p.star-rating")["class"][1]],
            "url": urljoin(url, card.h3.a["href"]),
        })
    print(f"Page {page}: total {len(books)} books")
    nxt = soup.select_one("li.next > a")
    if not nxt:
        break
    url = urljoin(url, nxt["href"])
    time.sleep(2)                             # polite delay

with open("books.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=books[0].keys())
    w.writeheader()
    w.writerows(books)
print("Top rated:", [b["title"] for b in books if b["rating"] == 5][:3])
`,
      result: `Page 1: total 20 books
Page 2: total 40 books
Page 3: total 60 books
Top rated: ['Sapiens: A Brief History of Humankind', 'Set Me Free', "Scott Pilgrim's Precious Little Life (Scott Pilgrim #1)"]
(exact output depends on the live practice site)`,
      explanation: "Each book is an article.product_pod. The full title is in the title attribute of the link (the visible text is shortened). The rating is stored as a CSS class like 'star-rating Three', so we read class[1] and map it to a number. urljoin converts relative links to absolute ones. The loop follows li.next until there is none, with a hard limit of 3 pages and a 2-second sleep between requests.",
    },
    {
      title: "Extract Links and Emails Responsibly with Regex",
      scenario: "You saved a public 'Contact us' page of your own company to check which links are broken and that only official role-based email addresses (not personal ones) are published.",
      steps: [
        "No pip install needed (re module)",
        "Run: python main.py",
        "Note: collecting personal emails from other sites is not allowed; this example audits your own page",
      ],
      code: `import re

page = """
<p>Sales: <a href="mailto:sales@acme.co.in">sales@acme.co.in</a></p>
<p>Support: support@acme.co.in | Careers: <a href="/careers">Jobs</a></p>
<a href="https://acme.co.in/about">About</a> <a href="http://old.acme.co.in/pricing">Pricing</a>
"""

emails = sorted(set(re.findall(r"[\\w.+-]+@[\\w-]+\\.[\\w.]+", page)))
links = re.findall(r'href="([^"]+)"', page)
insecure = [l for l in links if l.startswith("http://")]

print("Emails:", emails)
print("Links:", links)
print("Insecure links:", insecure)
`,
      result: `Emails: ['sales@acme.co.in', 'support@acme.co.in']
Links: ['mailto:sales@acme.co.in', '/careers', 'https://acme.co.in/about', 'http://old.acme.co.in/pricing']
Insecure links: ['http://old.acme.co.in/pricing']`,
      explanation: "re.findall returns all matches. A set removes duplicates (sales@ appears twice). The href pattern captures everything between the quotes. Regex is fine for small, predictable snippets, but for real pages use a parser like BeautifulSoup because HTML can be nested and irregular.",
      python: {
        files: {
          "main.py": `import re

page = """
<p>Sales: <a href="mailto:sales@acme.co.in">sales@acme.co.in</a></p>
<p>Support: support@acme.co.in | Careers: <a href="/careers">Jobs</a></p>
<a href="https://acme.co.in/about">About</a> <a href="http://old.acme.co.in/pricing">Pricing</a>
"""

emails = sorted(set(re.findall(r"[\\w.+-]+@[\\w-]+\\.[\\w.]+", page)))
links = re.findall(r'href="([^"]+)"', page)
insecure = [l for l in links if l.startswith("http://")]

print("Emails:", emails)
print("Links:", links)
print("Insecure links:", insecure)
`,
        },
      },
    },
  ],
  interview: [
    { q: "Is web scraping legal?", a: "It depends. Scraping publicly available, non-personal data while respecting robots.txt, terms of service and rate limits is generally acceptable; but bypassing logins or technical barriers, violating ToS, collecting personal data (DPDP Act 2023 in India, GDPR in the EU) or republishing copyrighted content can be illegal. Prefer official APIs and get permission when in doubt.", level: "Medium" },
    { q: "What is robots.txt?", a: "A text file at the root of a website (/robots.txt) that tells crawlers which paths they may or may not access, and sometimes a Crawl-delay. It is a voluntary standard; ethical scrapers follow it. Python's urllib.robotparser can check it automatically.", level: "Easy" },
    { q: "Difference between find(), find_all(), select() and select_one()?", a: "find() returns the first matching Tag or None; find_all() returns a list of all matches (filters by tag, attributes, class_). select() takes a CSS selector and returns a list; select_one() returns the first match or None.", level: "Easy" },
    { q: "Why do we write class_ instead of class in find_all()?", a: "class is a reserved keyword in Python, so BeautifulSoup uses the keyword argument class_. Alternatively pass attrs={'class': 'price'}.", level: "Easy" },
    { q: "The data is visible in the browser but missing in response.text. Why?", a: "The page loads data with JavaScript after the initial HTML. Check the Network tab (XHR/Fetch) for the JSON API it calls and request that directly (if allowed), or use a browser automation tool like Selenium or Playwright to render the page.", level: "Medium" },
    { q: "How do you avoid getting blocked while scraping?", a: "Behave politely: obey robots.txt, add delays (1-3 s, randomised), limit concurrency, use a descriptive User-Agent, reuse a Session, cache pages, scrape off-peak, and stop on 429/403. Do not try to evade blocks with rotating proxies or CAPTCHA solving; that usually violates terms.", level: "Medium" },
    { q: "Which parsers can BeautifulSoup use?", a: "html.parser (built-in, no install), lxml (very fast, needs pip install lxml), and html5lib (slow but parses like a browser, most lenient). Choose with BeautifulSoup(html, 'lxml').", level: "Medium" },
    { q: "How do you convert relative links to absolute ones?", a: "Use urllib.parse.urljoin(page_url, href). For example urljoin('https://site.com/catalogue/page-2.html', 'book_1/index.html') gives 'https://site.com/catalogue/book_1/index.html'.", level: "Easy" },
    { q: "How would you make a scraper resilient to small layout changes?", a: "Use stable selectors (ids, data attributes, semantic classes), guard against None, centralise selectors in one place, log when expected elements are missing, write tests with saved HTML fixtures, and monitor row counts to detect silent failures.", level: "Hard" },
    { q: "When would you use pandas.read_html()?", a: "When the data is in a clean HTML <table>. read_html(url_or_html) returns a list of DataFrames, one per table. It is quick but gives little control; for messy tables or data outside tables use BeautifulSoup.", level: "Medium" },
    { q: "How do you design a scraper that runs daily and only stores new items?", a: "Give each item a unique key (URL or product ID), store results in a database or CSV, check existing keys before inserting (upsert), stop pagination when you reach already-seen items, log runs, and schedule it with cron/Task Scheduler (Day 8).", level: "Hard" },
    { q: "Why should you never scrape personal data like phone numbers from a directory site?", a: "Personal data is protected by privacy laws (India's DPDP Act 2023, GDPR). Collecting it without consent and a lawful purpose can lead to penalties, and it usually violates the site's terms. Ethical automation uses only non-personal or properly consented data.", level: "Medium" },
  ],
  practice: [
    {
      task: "Given html = '<ul><li class=\"city\">Pune</li><li class=\"city\">Nagpur</li><li>Other</li></ul>', print only the cities using BeautifulSoup.",
      hint: "soup.select('li.city') or find_all('li', class_='city').",
      solution: `from bs4 import BeautifulSoup

html = '<ul><li class="city">Pune</li><li class="city">Nagpur</li><li>Other</li></ul>'
soup = BeautifulSoup(html, "html.parser")
print([li.get_text() for li in soup.select("li.city")])   # ['Pune', 'Nagpur']
`,
    },
    {
      task: "Write a function safe_text(parent, selector) that returns the stripped text of the first match or an empty string if nothing matches.",
      hint: "select_one() returns None when there is no match.",
      solution: `def safe_text(parent, selector):
    tag = parent.select_one(selector)
    return tag.get_text(strip=True) if tag else ""
`,
    },
    {
      task: "Scrape https://quotes.toscrape.com/ (a practice site): collect quote text and author from the first 2 pages and save to quotes.csv.",
      hint: "Each quote is div.quote with span.text and small.author; next page link is li.next a.",
      solution: `import csv, time
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup

url, rows = "https://quotes.toscrape.com/", []
for _ in range(2):
    soup = BeautifulSoup(requests.get(url, timeout=10).text, "html.parser")
    for q in soup.select("div.quote"):
        rows.append({"quote": q.select_one("span.text").get_text(strip=True),
                     "author": q.select_one("small.author").get_text(strip=True)})
    nxt = soup.select_one("li.next a")
    if not nxt:
        break
    url = urljoin(url, nxt["href"])
    time.sleep(2)

with open("quotes.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=["quote", "author"])
    w.writeheader()
    w.writerows(rows)
print(len(rows), "quotes saved")   # 20
`,
    },
    {
      task: "Before scraping any URL, write a function allowed(url, agent) that downloads that site's robots.txt and returns True/False.",
      hint: "Build the robots URL with urllib.parse.urlparse; use RobotFileParser.set_url() and read().",
      solution: `from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

def allowed(url, agent="UpSkillrStudentBot"):
    parts = urlparse(url)
    rp = RobotFileParser()
    rp.set_url(f"{parts.scheme}://{parts.netloc}/robots.txt")
    rp.read()
    return rp.can_fetch(agent, url)

print(allowed("https://books.toscrape.com/catalogue/page-2.html"))
`,
    },
  ],
  quiz: [
    { question: "What should you check first before scraping a website?", options: ["Whether the site uses React", "Whether an official API exists, plus robots.txt and terms of service", "How many images it has", "The site's server location"], answer: 1, explanation: "APIs are preferred, and robots.txt and ToS define what automated access is permitted." },
    { question: "What does soup.find('div') return if no div exists?", options: ["An empty list", "An empty string", "None", "It raises an exception"], answer: 2, explanation: "find() and select_one() return None when nothing matches; find_all() returns []." },
    { question: "Which CSS selector selects elements with class 'price' inside elements with class 'product'?", options: [".product .price", "#product #price", "product > price", ".product+.price"], answer: 0, explanation: "A space means descendant; a dot means class." },
    { question: "Which function turns '/page/2' into a full URL?", options: ["os.path.join", "urllib.parse.urljoin", "str.join", "requests.join"], answer: 1, explanation: "urljoin resolves relative URLs against a base URL." },
    { question: "Which of these is NOT ethical scraping practice?", options: ["Adding delays between requests", "Using a descriptive User-Agent", "Collecting users' phone numbers from profiles for marketing", "Caching pages you already downloaded"], answer: 2, explanation: "Collecting personal data without consent violates privacy laws and terms." },
    { question: "Data appears in the browser but not in requests' HTML. What is the likely cause?", options: ["The site uses CSS", "The content is loaded by JavaScript", "requests cannot read HTTPS", "BeautifulSoup is outdated"], answer: 1, explanation: "Dynamic content is rendered by JavaScript after page load." },
  ],
};
