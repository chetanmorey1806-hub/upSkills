export default {
  lesson: 'day-30-django-project-part-2-interview',
  minutes: 40,
  intro: 'Finish the Campus Blog (ownership mixin, comments with moderation, caching) and revise the whole Django course with interview-style questions and hands-on checks.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Interview: explain the Django request lifecycle in the right order.',
      options: [
        'View → URLconf → Middleware → Template → Response',
        'WSGI/ASGI server → middleware (request) → URL resolver → view (ORM, template) → middleware (response) → server',
        'Template → Model → View → URL',
        'Browser → Database → View → Browser',
      ],
      answer: 1,
      explain: 'The server hands the request to Django\'s handler, middleware runs top-down, the URL resolver picks a view, the view uses models and templates and returns a response, which passes back through middleware bottom-up to the server.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Interview revision: which statements are TRUE? (choose all that apply)',
      options: [
        'select_related uses a JOIN; prefetch_related uses a separate query per relation',
        'null=True is about the database, blank=True is about form validation',
        'F() expressions avoid race conditions in updates like views = views + 1',
        'Signals run asynchronously in a background thread by default',
        'A custom user model should be set up before the first migration',
        'CSRF protection is disabled for POST forms by default',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Django signals are **synchronous** - receivers run inside the same request (slow receivers slow the request). CSRF protection is **enabled** by default through `CsrfViewMiddleware`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the reusable ownership mixin so only the author can edit or delete a post (others get 404):\n\n```\nclass OwnerRequiredMixin:\n    def get_queryset(self):\n        return super().get_queryset().filter(______)\n```',
      accept: ['author=self.request.user', 'author_id=self.request.user.id', 'owner=self.request.user', 'author__pk=self.request.user.pk'],
      explain: 'Filtering in `get_queryset()` means `get_object()` simply cannot find other users\' posts → 404, for both UpdateView and DeleteView. Combine as `class PostUpdateView(LoginRequiredMixin, OwnerRequiredMixin, UpdateView)`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Comment moderation for the blog. Write `moderate(text, banned, author_trusted)` returning `(status, cleaned_text)`:\n- strip and collapse multiple spaces into one; empty → `(\'rejected\', \'\')`\n- longer than 500 chars → `(\'rejected\', cleaned)`\n- every banned word (case-insensitive, whole words only) is replaced by `***` in cleaned text\n- status: `\'approved\'` if the author is trusted and no banned word was found; `\'pending\'` otherwise (needs a moderator); more than 2 links (`http`) → `\'spam\'`',
      example: { title: 'whole-word replace', code: "import re\nprint(re.sub(r'\\bbad\\b', '***', 'bad badge Bad', flags=re.I))   # *** badge ***" },
      starter: `import re

def moderate(text, banned, author_trusted):
    # TODO
    return ('pending', text)
`,
      solution: `import re

def moderate(text, banned, author_trusted):
    cleaned = re.sub(r'\\s+', ' ', text).strip()
    if not cleaned:
        return ('rejected', '')
    if len(cleaned) > 500:
        return ('rejected', cleaned)
    found = False
    for word in banned:
        pattern = r'\\b' + re.escape(word) + r'\\b'
        if re.search(pattern, cleaned, flags=re.I):
            found = True
            cleaned = re.sub(pattern, '***', cleaned, flags=re.I)
    if cleaned.lower().count('http') > 2:
        return ('spam', cleaned)
    if author_trusted and not found:
        return ('approved', cleaned)
    return ('pending', cleaned)
`,
      tests: [
        { call: "moderate('  Great   article,   thanks! ', ['stupid'], True)", expect: ['approved', 'Great article, thanks!'] },
        { call: "moderate('This is STUPID but stupidity is fine', ['stupid'], True)", expect: ['pending', 'This is *** but stupidity is fine'] },
        { call: "moderate('Nice post', [], False)", expect: ['pending', 'Nice post'] },
        { call: "moderate('   ', [], True)", expect: ['rejected', ''] },
        { call: "moderate('buy http://a.in http://b.in http://c.in', [], True)", expect: ['spam', 'buy http://a.in http://b.in http://c.in'] },
        { call: "moderate('a' * 501, [], True)[0]", expect: 'rejected' },
      ],
      explain: 'Put rules like this in a plain function (or the form\'s `clean_body()`) so they are easy to test. The Comment model stores the status; only `approved` comments are shown, and a `post_save` signal can email the post author about new comments.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'Author dashboard: for every author show `username`, `posts` (published posts) and `comments` (approved comments on their published posts), including authors with no posts; order by `comments` DESC then `username`.',
      example: { title: 'counting distinct values across two joins', code: "SELECT c.name, COUNT(DISTINCT o.id) AS orders, COUNT(i.id) AS items\nFROM customer c\nLEFT JOIN orders o ON o.customer_id = c.id\nLEFT JOIN order_item i ON i.order_id = o.id\nGROUP BY c.id;" },
      setup: `CREATE TABLE auth_user (id INTEGER PRIMARY KEY, username TEXT);
CREATE TABLE blog_post (id INTEGER PRIMARY KEY, title TEXT, status TEXT, author_id INTEGER);
CREATE TABLE blog_comment (id INTEGER PRIMARY KEY, post_id INTEGER, body TEXT, status TEXT);
INSERT INTO auth_user VALUES (1, 'meena_teacher'), (2, 'asha'), (3, 'ravi');
INSERT INTO blog_post VALUES (1, 'Django Tips', 'PB', 1), (2, 'Exam Schedule', 'PB', 1), (3, 'My Draft', 'DF', 2), (4, 'Sports Day', 'PB', 2);
INSERT INTO blog_comment VALUES (1, 1, 'Great', 'approved'), (2, 1, 'Thanks', 'approved'), (3, 2, 'spam link', 'spam'), (4, 4, 'Nice', 'approved'), (5, 3, 'early', 'approved');`,
      starter: 'SELECT username FROM auth_user;',
      solution: "SELECT u.username, COUNT(DISTINCT p.id) AS posts, COUNT(c.id) AS comments FROM auth_user u LEFT JOIN blog_post p ON p.author_id = u.id AND p.status = 'PB' LEFT JOIN blog_comment c ON c.post_id = p.id AND c.status = 'approved' GROUP BY u.id ORDER BY comments DESC, u.username;",
      ordered: true,
      explain: 'Putting the status conditions in the **ON** clauses (not WHERE) keeps authors without matching rows (ravi). Joining posts and comments multiplies rows, so posts need `COUNT(DISTINCT p.id)`. In Django: `annotate(posts=Count(\'posts\', filter=Q(...), distinct=True), comments=Count(\'posts__comments\', filter=Q(...)))`.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'The finished blog caches its sidebar and paginates posts. What does this program print? (runs inside a configured Django project)',
      code: `from django.core.cache import cache
from django.core.paginator import Paginator
from django.template import Template, Context

calls = []
def popular_tags():
    calls.append(1)
    return ['django', 'events', 'exams']

for _ in range(3):
    tags = cache.get_or_set('sidebar:popular_tags', popular_tags, 600)
print(tags, len(calls))

posts = [f'Post {i}' for i in range(1, 8)]
page = Paginator(posts, 3).get_page(3)
t = Template('{% for p in page %}{{ p }}{% if not forloop.last %}, {% endif %}{% endfor %} | page {{ page.number }} of {{ page.paginator.num_pages }}{% if page.has_previous %} | prev {{ page.previous_page_number }}{% endif %}')
print(t.render(Context({'page': page})))`,
      expected: "['django', 'events', 'exams'] 1\nPost 7 | page 3 of 3 | prev 2",
      explain: '`get_or_set` computes the expensive sidebar once and serves it from the cache afterwards (1 call for 3 requests) - invalidate it when tags change. The last page holds the remaining post; the template uses `page_obj`-style helpers to draw the pager.',
    },
  ],
};
