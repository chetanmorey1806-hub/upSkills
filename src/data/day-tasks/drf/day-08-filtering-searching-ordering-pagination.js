export default {
  lesson: 'day-08-filtering-searching-ordering-pagination',
  minutes: 35,
  intro: 'Practise django-filter, SearchFilter, OrderingFilter and the three pagination styles, and write the filter/search/order/paginate pipeline in plain Python and SQL.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'With `PageNumberPagination` (PAGE_SIZE = 10) and 45 books, what does `GET /api/books/?page=5` return?',
      options: ['404 - there is no page 5', '200 with count 45, next null and 5 results', '200 with count 10 and 10 results', '200 with an empty results list'],
      answer: 1,
      explain: '45 books / 10 per page = 5 pages; page 5 has the last **5** books, `next` is `null` and `previous` points to page 4. `count` is always the **total** (45). Page 6 would give 404 "Invalid page."',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the attribute so `?search=` looks in the book title and the author\'s name (`author` is a ForeignKey):\n\n```\nclass BookViewSet(viewsets.ModelViewSet):\n    filter_backends = [filters.SearchFilter]\n    ______\n```',
      accept: ["search_fields = ['title', 'author__name']", 'search_fields = ["title", "author__name"]', "search_fields = ('title', 'author__name')", "search_fields = ['author__name', 'title']", 'search_fields = ["author__name", "title"]'],
      explain: '`search_fields` lists fields for case-insensitive partial matching (`icontains`); use `__` to follow relations. Prefixes change the lookup: `^title` = starts with, `=title` = exact, `@` = full-text (PostgreSQL).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        '?ordering=-price sorts by price descending',
        'ordering_fields should list which fields clients may sort by',
        'LimitOffsetPagination uses ?limit=10&offset=20',
        'CursorPagination supports jumping to any page number',
        'DjangoFilterBackend with filterset_fields = ["category"] supports ?category=Fiction',
      ],
      answers: [0, 1, 2, 4],
      explain: 'OrderingFilter uses `?ordering=field` (minus = descending); always restrict with `ordering_fields`. LimitOffset is offset-based. **CursorPagination** only gives next/previous links (no page numbers) but is fast and stable for huge or changing tables. django-filter adds exact and lookup filters.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 10,
      q: 'Write `query_books(books, params, page_size=2)` - the full DRF pipeline in the correct order. `params` is a dict of strings (like `request.query_params`):\n1. **filter**: `category` (exact), `min_price` / `max_price` (inclusive, convert to int)\n2. **search**: `search` - case-insensitive substring of `title` OR `author`\n3. **order**: `ordering` (e.g. `price`, `-price`, `title`); only `price` and `title` are allowed, others are ignored; default order is by `id`\n4. **paginate**: `page` (default 1). Return `{\'count\': total, \'next\': page+1 or None, \'previous\': page-1 or None, \'results\': [ids]}`',
      example: { title: 'sorting with a sign', code: "field = '-price'\nreverse = field.startswith('-')\nrows.sort(key=lambda r: r[field.lstrip('-')], reverse=reverse)" },
      starter: `def query_books(books, params, page_size=2):
    rows = list(books)
    # TODO: filter, search, order, paginate
    return {'count': 0, 'next': None, 'previous': None, 'results': []}
`,
      solution: `import math

def query_books(books, params, page_size=2):
    rows = list(books)
    if params.get('category'):
        rows = [b for b in rows if b['category'] == params['category']]
    if params.get('min_price'):
        rows = [b for b in rows if b['price'] >= int(params['min_price'])]
    if params.get('max_price'):
        rows = [b for b in rows if b['price'] <= int(params['max_price'])]
    s = params.get('search', '').lower()
    if s:
        rows = [b for b in rows if s in b['title'].lower() or s in b['author'].lower()]
    ordering = params.get('ordering', '')
    field = ordering.lstrip('-')
    if field in ('price', 'title'):
        rows.sort(key=lambda b: (b[field], b['id']), reverse=ordering.startswith('-'))
    else:
        rows.sort(key=lambda b: b['id'])
    count = len(rows)
    page = int(params.get('page', 1))
    pages = math.ceil(count / page_size)
    start = (page - 1) * page_size
    return {
        'count': count,
        'next': page + 1 if page < pages else None,
        'previous': page - 1 if page > 1 else None,
        'results': [b['id'] for b in rows[start:start + page_size]],
    }
`,
      tests: [
        { call: "query_books([{'id': 1, 'title': 'Godaan', 'author': 'Premchand', 'category': 'Fiction', 'price': 250}, {'id': 2, 'title': 'Wings of Fire', 'author': 'A P J Abdul Kalam', 'category': 'Biography', 'price': 300}, {'id': 3, 'title': 'Gaban', 'author': 'Premchand', 'category': 'Fiction', 'price': 180}, {'id': 4, 'title': 'The Guide', 'author': 'R K Narayan', 'category': 'Fiction', 'price': 220}, {'id': 5, 'title': 'Ignited Minds', 'author': 'A P J Abdul Kalam', 'category': 'Biography', 'price': 199}], {})", expect: { count: 5, next: 2, previous: null, results: [1, 2] } },
        { call: "query_books([{'id': 1, 'title': 'Godaan', 'author': 'Premchand', 'category': 'Fiction', 'price': 250}, {'id': 2, 'title': 'Wings of Fire', 'author': 'A P J Abdul Kalam', 'category': 'Biography', 'price': 300}, {'id': 3, 'title': 'Gaban', 'author': 'Premchand', 'category': 'Fiction', 'price': 180}, {'id': 4, 'title': 'The Guide', 'author': 'R K Narayan', 'category': 'Fiction', 'price': 220}, {'id': 5, 'title': 'Ignited Minds', 'author': 'A P J Abdul Kalam', 'category': 'Biography', 'price': 199}], {'category': 'Fiction', 'ordering': '-price'})", expect: { count: 3, next: 2, previous: null, results: [1, 4] } },
        { call: "query_books([{'id': 1, 'title': 'Godaan', 'author': 'Premchand', 'category': 'Fiction', 'price': 250}, {'id': 2, 'title': 'Wings of Fire', 'author': 'A P J Abdul Kalam', 'category': 'Biography', 'price': 300}, {'id': 3, 'title': 'Gaban', 'author': 'Premchand', 'category': 'Fiction', 'price': 180}, {'id': 4, 'title': 'The Guide', 'author': 'R K Narayan', 'category': 'Fiction', 'price': 220}, {'id': 5, 'title': 'Ignited Minds', 'author': 'A P J Abdul Kalam', 'category': 'Biography', 'price': 199}], {'category': 'Fiction', 'ordering': '-price', 'page': '2'})", expect: { count: 3, next: null, previous: 1, results: [3] } },
        { call: "query_books([{'id': 1, 'title': 'Godaan', 'author': 'Premchand', 'category': 'Fiction', 'price': 250}, {'id': 2, 'title': 'Wings of Fire', 'author': 'A P J Abdul Kalam', 'category': 'Biography', 'price': 300}, {'id': 3, 'title': 'Gaban', 'author': 'Premchand', 'category': 'Fiction', 'price': 180}, {'id': 4, 'title': 'The Guide', 'author': 'R K Narayan', 'category': 'Fiction', 'price': 220}, {'id': 5, 'title': 'Ignited Minds', 'author': 'A P J Abdul Kalam', 'category': 'Biography', 'price': 199}], {'search': 'kalam', 'max_price': '250', 'ordering': 'title'})", expect: { count: 1, next: null, previous: null, results: [5] } },
        { call: "query_books([{'id': 1, 'title': 'Godaan', 'author': 'Premchand', 'category': 'Fiction', 'price': 250}, {'id': 3, 'title': 'Gaban', 'author': 'Premchand', 'category': 'Fiction', 'price': 180}], {'ordering': 'password', 'min_price': '100'})", expect: { count: 2, next: null, previous: null, results: [1, 3] }, msg: 'Ordering by a field that is not allowed must be ignored' },
      ],
      explain: 'DRF applies filter backends in order (filter → search → ordering) on the queryset, and pagination runs **last** on the final result, so `count` is the filtered total. Whitelisting ordering fields stops clients sorting by private columns. Adding `id` as a tie-breaker keeps pages stable.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: '`GET /api/books/?category=Fiction&search=pre&ordering=-price&limit=2&offset=0` (LimitOffsetPagination) runs one SQL query for the results. Write it: return `id`, `title`, `price` of Fiction books whose title or author contains `pre` (case-insensitive), most expensive first, 2 rows.',
      example: { title: 'LIKE for "contains"', code: "SELECT id, name FROM product\nWHERE category = 'Toys' AND (name LIKE '%car%' OR brand LIKE '%car%')\nORDER BY price DESC\nLIMIT 5 OFFSET 0;" },
      setup: `CREATE TABLE book (id INTEGER PRIMARY KEY, title TEXT, author TEXT, category TEXT, price INTEGER);
INSERT INTO book VALUES (1, 'Godaan', 'Premchand', 'Fiction', 250), (2, 'Wings of Fire', 'A P J Abdul Kalam', 'Biography', 300), (3, 'Gaban', 'Premchand', 'Fiction', 180), (4, 'The Guide', 'R K Narayan', 'Fiction', 220), (5, 'Pride and Prejudice', 'Jane Austen', 'Fiction', 199), (6, 'Nirmala', 'Premchand', 'Fiction', 150);`,
      starter: "SELECT id, title, price FROM book WHERE category = 'Fiction';",
      solution: "SELECT id, title, price FROM book WHERE category = 'Fiction' AND (title LIKE '%pre%' OR author LIKE '%pre%') ORDER BY price DESC LIMIT 2 OFFSET 0;",
      ordered: true,
      explain: 'SearchFilter builds `(title ILIKE %pre% OR author ILIKE %pre%)` - the OR must be in **brackets**, otherwise `AND` binds first and Biography rows could slip in. In SQLite `LIKE` is already case-insensitive for ASCII. `ORDER BY` runs before `LIMIT/OFFSET`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `page_links(base_url, count, page, page_size)` that builds the `next` and `previous` URLs of PageNumberPagination. Return `(next, previous)`:\n- `next` = `f\'{base_url}?page={page+1}\'` if there is a next page, else `None`\n- `previous`: for page 2 DRF links to `base_url` **without** `?page=1`; for pages > 2 `f\'{base_url}?page={page-1}\'`; for page 1 `None`',
      example: { title: 'number of pages', code: "import math\nprint(math.ceil(45 / 10))   # 5" },
      starter: `def page_links(base_url, count, page, page_size):
    # TODO
    return (None, None)
`,
      solution: `import math

def page_links(base_url, count, page, page_size):
    pages = math.ceil(count / page_size)
    nxt = f'{base_url}?page={page + 1}' if page < pages else None
    if page <= 1:
        prev = None
    elif page == 2:
        prev = base_url
    else:
        prev = f'{base_url}?page={page - 1}'
    return (nxt, prev)
`,
      tests: [
        { call: "page_links('/api/books/', 45, 1, 10)", expect: ['/api/books/?page=2', null] },
        { call: "page_links('/api/books/', 45, 2, 10)", expect: ['/api/books/?page=3', '/api/books/'] },
        { call: "page_links('/api/books/', 45, 5, 10)", expect: [null, '/api/books/?page=4'] },
        { call: "page_links('/api/books/', 7, 1, 10)", expect: [null, null] },
      ],
      explain: 'Clients (React, mobile apps) should follow the `next` link instead of computing page numbers themselves - keep fetching until `next` is `null`. DRF drops `page=1` from the previous link because page 1 is the default.',
    },
  ],
};
