export default {
  lesson: 'day-29-django-project-part-1',
  minutes: 40,
  intro: 'Build the Campus Blog foundations: model design with slugs, choices and custom managers, the URL map and read-only views - practised with SQL, Python and real Django utilities.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In the Campus Blog, a Post has one Category and many Tags. Which model fields fit?',
      options: ['category = ManyToManyField(Category); tags = ForeignKey(Tag)', 'category = ForeignKey(Category, on_delete=models.PROTECT); tags = ManyToManyField(Tag, blank=True)', 'Both ForeignKey', 'Both OneToOneField'],
      answer: 1,
      explain: 'One category per post → ForeignKey (PROTECT so a category with posts cannot be deleted by accident). Many tags per post and many posts per tag → ManyToManyField (`blank=True` so tags are optional in forms).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the custom manager method so `Post.published.all()` returns only published posts:\n\n```\nclass PublishedManager(models.Manager):\n    def get_queryset(self):\n        return ______\n```',
      accept: ["super().get_queryset().filter(status='published')", 'super().get_queryset().filter(status="published")', "super().get_queryset().filter(status=Post.Status.PUBLISHED)", "super().get_queryset().filter(status='PB')", 'super().get_queryset().filter(status="PB")'],
      explain: 'A custom manager overrides `get_queryset()` and starts from `super().get_queryset()`. Keep `objects = models.Manager()` too (declared first) so the admin and other code still see drafts.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which design decisions are good for the blog? (choose all that apply)',
      options: [
        'slug = SlugField(unique_for_date="publish") or unique=True for clean URLs like /blog/2026/11/django-tips/',
        "class Meta: ordering = ['-publish'] and an index on publish",
        'Status as TextChoices (DRAFT / PUBLISHED) instead of free text',
        'Storing the author name as a CharField copied from the user',
        'get_absolute_url() using reverse() so templates call {{ post.get_absolute_url }}',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Slugs give readable URLs; ordering + index make the newest-first list fast; choices prevent typos; `get_absolute_url` keeps URLs in one place. The author must be a **ForeignKey** to the user model, not a copied name that goes stale.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 7,
      q: 'The blog home page shows published posts with category name and number of tags, newest first. Write the SQL: `title`, `category` (name), `tags` (count, 0 if none) for posts with `status = \'PB\'`, ordered by `publish` DESC.',
      example: { title: 'JOIN + LEFT JOIN + GROUP BY', code: "SELECT p.name, c.name AS category, COUNT(r.id) AS reviews\nFROM shop_product p\nJOIN shop_category c ON c.id = p.category_id\nLEFT JOIN shop_review r ON r.product_id = p.id\nGROUP BY p.id\nORDER BY p.created DESC;" },
      setup: `CREATE TABLE blog_category (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE blog_post (id INTEGER PRIMARY KEY, title TEXT, slug TEXT, status TEXT, publish TEXT, category_id INTEGER REFERENCES blog_category(id));
CREATE TABLE blog_post_tags (id INTEGER PRIMARY KEY, post_id INTEGER, tag_id INTEGER);
INSERT INTO blog_category VALUES (1, 'Events'), (2, 'Tech');
INSERT INTO blog_post VALUES (1, 'Fresher Party 2026', 'fresher-party-2026', 'PB', '2026-08-10', 1), (2, 'Django Tips', 'django-tips', 'PB', '2026-11-02', 2), (3, 'Draft: Hackathon', 'hackathon', 'DF', '2026-11-15', 2), (4, 'Sports Day', 'sports-day', 'PB', '2026-10-05', 1);
INSERT INTO blog_post_tags (post_id, tag_id) VALUES (1, 1), (1, 2), (2, 3), (2, 4), (2, 5);`,
      starter: "SELECT title FROM blog_post WHERE status = 'PB';",
      solution: "SELECT p.title, c.name AS category, COUNT(pt.tag_id) AS tags FROM blog_post p JOIN blog_category c ON c.id = p.category_id LEFT JOIN blog_post_tags pt ON pt.post_id = p.id WHERE p.status = 'PB' GROUP BY p.id ORDER BY p.publish DESC;",
      ordered: true,
      explain: 'In Django: `Post.published.select_related(\'category\').annotate(tags_count=Count(\'tags\')).order_by(\'-publish\')`. The LEFT JOIN keeps "Sports Day" with 0 tags, and the draft is filtered out by the custom manager (`WHERE status = \'PB\'`).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write `unique_slug(title, existing)` like a `save()` override: slugify the title (lower-case, every run of non `a-z0-9` characters → one `-`, trimmed), and if that slug is in the set `existing`, append `-2`, `-3`, ... until it is free. An empty result becomes `\'post\'`.',
      example: { title: 'loop until free', code: "name, n = 'file', 1\nwhile name in taken:\n    n += 1\n    name = f'file-{n}'" },
      starter: `import re

def unique_slug(title, existing):
    # TODO
    return title
`,
      solution: `import re

def unique_slug(title, existing):
    base = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-') or 'post'
    slug, n = base, 1
    while slug in existing:
        n += 1
        slug = f'{base}-{n}'
    return slug
`,
      tests: [
        { call: "unique_slug('Django Tips & Tricks!', set())", expect: 'django-tips-tricks' },
        { call: "unique_slug('Django Tips', {'django-tips'})", expect: 'django-tips-2' },
        { call: "unique_slug('Django Tips', {'django-tips', 'django-tips-2', 'django-tips-3'})", expect: 'django-tips-4' },
        { call: "unique_slug('!!!', set())", expect: 'post' },
        { call: "unique_slug('  Fresher Party 2026  ', set())", expect: 'fresher-party-2026' },
      ],
      explain: 'Slugs appear in URLs, so they must be unique (or unique per date). Django\'s `slugify()` does the cleaning; the loop adds a counter for duplicates. In the model you would do this in `save()` only when `self.slug` is empty, so editing a title does not break old links.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project; this file is the ROOT_URLCONF)',
      code: `from django.db import models
from django.urls import path, reverse
from django.utils.text import slugify
from django.http import HttpResponse

class Status(models.TextChoices):
    DRAFT = 'DF', 'Draft'
    PUBLISHED = 'PB', 'Published'

def post_detail(request, year, month, slug):
    return HttpResponse(slug)

urlpatterns = [
    path('blog/<int:year>/<int:month>/<slug:slug>/', post_detail, name='post_detail'),
]

print(slugify('Fresher Party 2026 – Photos!'))
print(Status.PUBLISHED, Status.PUBLISHED.label, Status.choices)
print(reverse('post_detail', args=[2026, 11, 'django-tips']))`,
      expected: "fresher-party-2026-photos\nPB Published [('DF', 'Draft'), ('PB', 'Published')]\n/blog/2026/11/django-tips/",
      explain: '`slugify` lower-cases, drops special characters like "–" and "!" and joins words with hyphens. TextChoices give a stored value (`PB`), a label and the `choices` list for the field. The URL map uses year/month/slug for SEO-friendly post URLs.',
    },
  ],
};
