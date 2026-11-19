export default {
  lesson: 'day-18-messages-pagination',
  minutes: 30,
  intro: 'Practise the messages framework (levels, tags, SuccessMessageMixin) and Paginator / paginate_by, and write the page-link and message logic in plain Python.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that shows a green "Student saved successfully" message after saving:\n\n```\nform.save()\n______(request, \'Student saved successfully\')\nreturn redirect(\'student-list\')\n```',
      accept: ['messages.success'],
      caseSensitive: true,
      explain: '`messages.success(request, \'...\')` stores a one-time message with level SUCCESS (tag `success`, which maps nicely to Bootstrap\'s `alert-success`). Other helpers: `messages.info`, `warning`, `error`, `debug`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'When is a message removed?',
      options: ['After 5 minutes', 'When the template iterates over `messages` (it is shown once)', 'When the user logs out', 'Never, you must delete it'],
      answer: 1,
      explain: 'Messages are stored (session or cookie storage) until they are **iterated** in a template, then they are marked as used. That is why they survive the redirect and show exactly once - and why you must loop over `messages` in `base.html` or they pile up.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'paginate_by = 10 on ListView adds page_obj, paginator and is_paginated to the context',
        'paginator.get_page("abc") returns page 1 instead of raising an error',
        'paginator.get_page(999) returns the last page',
        'Pagination links should keep other query parameters such as ?q=asha',
        'Paginator loads every row into memory first',
      ],
      answers: [0, 1, 2, 3],
      explain: '`get_page()` is forgiving (non-number → 1, too large → last page), while `page()` raises errors. Paginator uses `count()` and slicing (`LIMIT/OFFSET`) on querysets, not loading everything. Keep search/filter params in page links or page 2 loses the filter.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from django.core.paginator import Paginator

students = [f'S{i}' for i in range(1, 24)]
p = Paginator(students, 5)
print(p.count, p.num_pages, list(p.page_range))
page = p.get_page(3)
print(list(page), page.has_previous(), page.has_next(), page.start_index(), page.end_index())
last = p.get_page('xyz')
print(last.number, p.get_page(50).number, list(p.get_page(50)))`,
      expected: "23 5 [1, 2, 3, 4, 5]\n['S11', 'S12', 'S13', 'S14', 'S15'] True True 11 15\n1 5 ['S21', 'S22', 'S23']",
      explain: '23 items at 5 per page = 5 pages. Page 3 holds items 11-15 (`start_index`/`end_index` are 1-based, good for "Showing 11-15 of 23"). An invalid page gives page 1 and a too-large one the last page.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write `page_links(page, num_pages, query, window=2)` that builds the pagination bar. Return a list of `(label, url)`:\n- `(\'«\', url_for(page-1))` if there is a previous page\n- page numbers from `page-window` to `page+window` (clamped to 1..num_pages); the current page has url `None`\n- `(\'»\', url_for(page+1))` if there is a next page\n\n`url_for(n)` = `\'?\'` + urlencode of `query` (a dict, other params like `q`) with `page=n` **added last** (replace any existing `page`). Labels for numbers are strings.',
      example: { title: 'keeping other params', code: "from urllib.parse import urlencode\nparams = {'q': 'asha', 'page': 3}\nparams['page'] = 4\nprint('?' + urlencode(params))   # ?q=asha&page=4" },
      starter: `from urllib.parse import urlencode

def page_links(page, num_pages, query, window=2):
    # TODO
    return []
`,
      solution: `from urllib.parse import urlencode

def page_links(page, num_pages, query, window=2):
    def url_for(n):
        params = {k: v for k, v in query.items() if k != 'page'}
        params['page'] = n
        return '?' + urlencode(params)
    links = []
    if page > 1:
        links.append(('«', url_for(page - 1)))
    for n in range(max(1, page - window), min(num_pages, page + window) + 1):
        links.append((str(n), None if n == page else url_for(n)))
    if page < num_pages:
        links.append(('»', url_for(page + 1)))
    return links
`,
      tests: [
        { call: "page_links(1, 3, {})", expect: [['1', null], ['2', '?page=2'], ['3', '?page=3'], ['»', '?page=2']] },
        { call: "page_links(5, 10, {'q': 'asha', 'page': '5'}, 1)", expect: [['«', '?q=asha&page=4'], ['4', '?q=asha&page=4'], ['5', null], ['6', '?q=asha&page=6'], ['»', '?q=asha&page=6']] },
        { call: "page_links(4, 4, {'city': 'Pune'})", expect: [['«', '?city=Pune&page=3'], ['2', '?city=Pune&page=2'], ['3', '?city=Pune&page=3'], ['4', null]] },
        { call: "page_links(1, 1, {})", expect: [['1', null]] },
      ],
      explain: 'Showing a small window of page numbers keeps the bar short for 500 pages. Building links from the current query dict (Django: `request.GET.copy()`, set `page`, then `.urlencode()`) keeps the search and filters while paging.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `render_messages(stored)` that does what the `{% for message in messages %}` loop in base.html does. `stored` is a list of `(level, text)` tuples where level is one of `10, 20, 25, 30, 40` (DEBUG, INFO, SUCCESS, WARNING, ERROR). Skip DEBUG (default MESSAGE_LEVEL is INFO). Map tags to Bootstrap: `info→info`, `success→success`, `warning→warning`, `error→danger`. Return a list of `\'<div class="alert alert-TAG">TEXT</div>\'` strings and **empty** `stored` afterwards (messages are shown once).',
      example: { title: 'MESSAGE_TAGS in settings', code: "from django.contrib.messages import constants as messages\nMESSAGE_TAGS = {messages.ERROR: 'danger'}" },
      starter: `def render_messages(stored):
    # TODO
    return []
`,
      solution: `TAGS = {20: 'info', 25: 'success', 30: 'warning', 40: 'danger'}

def render_messages(stored):
    html = [f'<div class="alert alert-{TAGS[level]}">{text}</div>' for level, text in stored if level >= 20]
    stored.clear()
    return html
`,
      tests: [
        { call: "render_messages([(25, 'Student saved'), (10, 'debug info'), (40, 'Fee pending')])", expect: ['<div class="alert alert-success">Student saved</div>', '<div class="alert alert-danger">Fee pending</div>'] },
        { call: "(lambda s: (render_messages(s), render_messages(s))[1])([(20, 'Hello')])", expect: [], msg: 'Messages must be shown only once' },
      ],
      explain: 'Messages below `MESSAGE_LEVEL` (INFO by default) are dropped, which is why `messages.debug()` shows nothing unless you lower the level. Django\'s ERROR tag is `error`, but Bootstrap uses `danger` - map it with `MESSAGE_TAGS` in settings.',
    },
  ],
};
