export default {
  lesson: 'day-05-web-scraping-with-beautifulsoup',
  minutes: 35,
  intro: 'Scrape responsibly: know the BeautifulSoup API and CSS selectors, check robots.txt, and extract products, tables and links from HTML strings with the standard library (html.parser, re, urllib.robotparser) and save them to CSV.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'With BeautifulSoup, which call returns **all** `<div class="product">` elements?',
      options: ['soup.find("div", class_="product")', 'soup.find_all("div", class_="product")  (or soup.select("div.product"))', 'soup.get("div.product")', 'soup.div.product'],
      answer: 1,
      explain: '`find` returns only the **first** match (or None); `find_all` / `select` return a list. Note `class_` with an underscore because `class` is a Python keyword. Then use `.get_text(strip=True)` for text and `tag["href"]` / `tag.get("href")` for attributes.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which practices make scraping **responsible**? (choose all that apply)',
      options: ['Check robots.txt and the site\'s terms of service', 'Prefer an official API if one exists', 'Add a delay between requests (e.g. 1-2 seconds)', 'Send a descriptive User-Agent', 'Scrape personal data (emails, phone numbers) and resell it'],
      answers: [0, 1, 2, 3],
      explain: 'Collecting and selling personal data can break privacy laws (India\'s DPDP Act 2023, GDPR) even if the page is public. Be polite: low request rate, honour robots.txt, cache pages you already downloaded.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 10,
      q: '**Parse products with html.parser.** Write `parse_products(html)` that returns a list of dicts `{"name": ..., "price": int}` for every `<div class="product">`. Inside each product the name is in `<h2>` and the price in `<span class="price">` like `₹1,299`. Use `html.parser.HTMLParser` (or `re`) – no external libraries.',
      example: { title: 'a tiny HTMLParser subclass', code: 'from html.parser import HTMLParser\nclass Titles(HTMLParser):\n    def __init__(self):\n        super().__init__(); self.inside = False; self.titles = []\n    def handle_starttag(self, tag, attrs):\n        self.inside = tag == "h1"\n    def handle_data(self, data):\n        if self.inside: self.titles.append(data.strip())\n    def handle_endtag(self, tag):\n        self.inside = False' },
      starter: 'from html.parser import HTMLParser\n\ndef parse_products(html):\n    # TODO\n    pass\n',
      solution: `from html.parser import HTMLParser

class _P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.items, self.cur, self.field = [], None, None
    def handle_starttag(self, tag, attrs):
        cls = dict(attrs).get("class", "") or ""
        if tag == "div" and "product" in cls.split():
            self.cur = {}
        elif self.cur is not None and tag == "h2":
            self.field = "name"
        elif self.cur is not None and tag == "span" and "price" in cls.split():
            self.field = "price"
    def handle_data(self, data):
        if self.cur is not None and self.field and data.strip():
            self.cur[self.field] = self.cur.get(self.field, "") + data.strip()
    def handle_endtag(self, tag):
        if tag in ("h2", "span"):
            self.field = None
        if tag == "div" and self.cur is not None:
            price = int("".join(ch for ch in self.cur.get("price", "0") if ch.isdigit()))
            self.items.append({"name": self.cur.get("name", ""), "price": price})
            self.cur = None

def parse_products(html):
    p = _P()
    p.feed(html)
    return p.items
`,
      tests: [
        { call: 'parse_products(\'<div class="product"><h2>Earphones</h2><span class="price">₹1,299</span></div><div class="product sale"><h2> Power Bank </h2><span class="price">₹899</span></div><div class="banner">Diwali offer</div>\')', expect: [{ name: 'Earphones', price: 1299 }, { name: 'Power Bank', price: 899 }] },
        { call: 'parse_products("<p>no products</p>")', expect: [] },
      ],
      explain: 'Scraping = find the repeating container, then pull each field from inside it, then **clean** the values (strip spaces, turn "₹1,299" into 1299). Note the second product has two classes ("product sale"), so check membership in the class list instead of comparing the whole string. With BeautifulSoup the same is `for d in soup.select("div.product"): d.h2.get_text(strip=True)`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: '**robots.txt.** Using `urllib.robotparser.RobotFileParser` and its `parse(lines)` method (no network), write `allowed(robots_text, url, agent="UpSkillrBot")` that returns True/False, and `crawl_delay(robots_text, agent="UpSkillrBot")` that returns the Crawl-delay for that agent (or None).',
      example: { title: 'parsing robots.txt offline', code: 'from urllib.robotparser import RobotFileParser\nrp = RobotFileParser()\nrp.parse("User-agent: *\\nDisallow: /admin".splitlines())\nrp.can_fetch("MyBot", "https://x.in/admin/users")   # False' },
      starter: 'from urllib.robotparser import RobotFileParser\n\ndef allowed(robots_text, url, agent="UpSkillrBot"):\n    # TODO\n    pass\n\ndef crawl_delay(robots_text, agent="UpSkillrBot"):\n    # TODO\n    pass\n',
      solution: 'from urllib.robotparser import RobotFileParser\n\ndef _rp(text):\n    rp = RobotFileParser()\n    rp.parse(text.splitlines())\n    return rp\n\ndef allowed(robots_text, url, agent="UpSkillrBot"):\n    return _rp(robots_text).can_fetch(agent, url)\n\ndef crawl_delay(robots_text, agent="UpSkillrBot"):\n    return _rp(robots_text).crawl_delay(agent)\n',
      tests: [
        { call: 'allowed("User-agent: *\\nDisallow: /checkout\\nDisallow: /account/\\nCrawl-delay: 2", "https://shop.in/products/pen")', expect: true },
        { call: 'allowed("User-agent: *\\nDisallow: /checkout\\nDisallow: /account/\\nCrawl-delay: 2", "https://shop.in/account/orders")', expect: false },
        { call: 'crawl_delay("User-agent: *\\nDisallow: /checkout\\nCrawl-delay: 2")', expect: 2 },
        { call: 'crawl_delay("User-agent: *\\nDisallow:")', expect: null },
      ],
      explain: '`Disallow` rules are path prefixes; `can_fetch` applies them for your user agent. Honour `Crawl-delay` by sleeping that many seconds between requests. In a live script you would call `rp.set_url(".../robots.txt"); rp.read()` instead of `parse`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Table to CSV.** Write `table_to_csv(html, path)` that extracts every row of the first `<table>` (both `<th>` and `<td>` cells, text stripped) and writes them to a CSV file at `path` with the `csv` module. Return the number of **data** rows written (rows without the header).',
      example: { title: 'csv.writer', code: 'import csv\nwith open("out.csv", "w", newline="", encoding="utf-8") as f:\n    w = csv.writer(f)\n    w.writerow(["name", "price"])\n    w.writerows(rows)' },
      starter: 'import csv, re\n\ndef table_to_csv(html, path):\n    # TODO\n    pass\n',
      solution: `import csv, re

def table_to_csv(html, path):
    table = re.search(r"<table.*?>(.*?)</table>", html, re.S | re.I).group(1)
    rows = []
    for tr in re.findall(r"<tr.*?>(.*?)</tr>", table, re.S | re.I):
        cells = re.findall(r"<t[hd].*?>(.*?)</t[hd]>", tr, re.S | re.I)
        rows.append([re.sub(r"<.*?>", "", c).strip() for c in cells])
    with open(path, "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerows(rows)
    return len(rows) - 1
`,
      tests: [
        { call: 'table_to_csv("<table><tr><th>City</th><th>Temp</th></tr><tr><td>Pune</td><td> 31 </td></tr><tr><td><b>Delhi</b></td><td>38</td></tr></table>", "temps.csv")', expect: 2 },
        { call: '[r for r in __import__("csv").reader(open("temps.csv", encoding="utf-8"))]', expect: [['City', 'Temp'], ['Pune', '31'], ['Delhi', '38']] },
      ],
      explain: 'Always open CSV files with `newline=""` (otherwise Windows gets blank lines between rows) and `encoding="utf-8"` (for ₹ and Indian-language text). For real pages `pandas.read_html(html)` or BeautifulSoup is more robust than regex, which breaks on nested tables.',
    },
  ],
};
