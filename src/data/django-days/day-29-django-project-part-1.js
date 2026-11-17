export default {
  id: 'day-29-django-project-part-1',
  title: 'Django Project Part 1: Campus Blog — models, views, templates',
  module: 'Module 6: Project',
  day: 29,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Start the capstone project: a Campus Blog app inside the Student Portal where teachers and students publish posts by category and tag. Today we design the database, build models, admin, read-only class-based views, URLs and templates.',
  objectives: [
    'Plan a project: requirements, apps, ER design and URL map',
    'Build Category, Tag, Post and Comment models with slugs, choices, custom managers and indexes',
    'Customise the admin for content editors',
    'Create list, detail, category, tag and search pages with ListView/DetailView and pagination',
    'Organise templates with base layout, includes and reusable partials',
  ],
  theory: [
    {
      heading: 'Project requirements',
      content: 'Real projects start with a clear list of features, not code. Our Campus Blog lives in the existing Student Portal (custom user from Day 21, permissions from Day 22). Part 1 covers everything a READER sees; Part 2 (Day 30) covers writing, comments, security, performance, tests and deployment.',
      points: [
        'Readers: browse published posts, filter by category/tag, search, read a post with comments',
        'Authors (Teachers group / students with permission): create, edit, delete their own posts (Day 30)',
        'Editors (Office Staff): publish/unpublish any post via admin',
        'Posts have draft/published status, slug URLs, cover image, reading time and view count',
      ],
    },
    {
      heading: 'Database design (ER)',
      content: 'Category 1 --- * Post (each post has one category). Post * --- * Tag (many tags per post). User 1 --- * Post (author). Post 1 --- * Comment, User 1 --- * Comment. Use slugs for clean URLs (/blog/django-tips-for-freshers/), PROTECT on category delete so posts are never lost by accident, and indexes on fields used for filtering and ordering.',
      syntax: `accounts_user (id, email, role ...)
blog_category (id, name, slug)
blog_tag      (id, name, slug)
blog_post     (id, title, slug, author_id FK, category_id FK, body, cover, status,
               published_at, created_at, updated_at, views)
blog_post_tags (post_id, tag_id)        -- M2M join table
blog_comment  (id, post_id FK, user_id FK, body, is_approved, created_at)`,
    },
    {
      heading: 'Custom managers and QuerySets',
      content: 'Instead of repeating .filter(status="PUBLISHED", published_at__lte=now()) in every view, create a custom QuerySet with a published() method and use it as the manager. This keeps business rules in one place (the "fat models, thin views" principle).',
      syntax: `class PostQuerySet(models.QuerySet):
    def published(self):
        return self.filter(status=Post.Status.PUBLISHED, published_at__lte=timezone.now())

class Post(models.Model):
    objects = PostQuerySet.as_manager()

Post.objects.published().filter(category__slug="exams")`,
    },
    {
      heading: 'App structure and URL map',
      content: 'Create a separate app blog with its own urls.py and app_name for namespacing. Keep templates in templates/blog/ and small reusable pieces in templates/blog/includes/.',
      points: [
        '/blog/                          -> PostListView (all published)',
        '/blog/category/<slug>/          -> PostListView filtered by category',
        '/blog/tag/<slug>/               -> PostListView filtered by tag',
        '/blog/search/?q=                -> SearchView',
        '/blog/<int:year>/<slug>/        -> PostDetailView',
      ],
      tip: 'Put URL patterns with fixed words (category/, tag/, search/) before the generic slug pattern so they are matched first.',
    },
    {
      heading: 'Performance from day one',
      content: 'A blog list shows author, category and tags for each post. Without care that is 1 + 3N queries. Use select_related for ForeignKeys (author, category) and prefetch_related for ManyToMany/reverse FKs (tags, comments). Annotate counts (comment_count) in the same query. Use F() to increment the view counter atomically.',
    },
  ],
  examples: [
    {
      title: 'Step 1: create the app and models',
      scenario: 'Add a blog app to the Student Portal with Category, Tag, Post and Comment.',
      steps: [
        'VS Code / PyCharm terminal (venv active): python manage.py startapp blog',
        'Add "blog" to INSTALLED_APPS in portal/settings.py',
        'Write blog/models.py as below',
        'Run python manage.py makemigrations blog and python manage.py migrate',
        'PyCharm: open the Database tool window to see the new tables; VS Code: use the SQLTools/MySQL extension',
      ],
      code: `# Project tree (new parts)
student_portal/
├── accounts/            # custom User (Day 21)
├── students/            # Student, Course, Result ...
├── blog/
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── urls.py
│   ├── views.py
│   └── templatetags/blog_extras.py
└── templates/blog/
    ├── post_list.html
    ├── post_detail.html
    └── includes/_post_card.html

# blog/models.py
import math

from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(max_length=70, unique=True, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("blog:category", args=[self.slug])

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=40, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    def get_absolute_url(self):
        return reverse("blog:tag", args=[self.slug])

    def __str__(self):
        return self.name


class PostQuerySet(models.QuerySet):
    def published(self):
        return self.filter(status=Post.Status.PUBLISHED, published_at__lte=timezone.now())

    def with_related(self):
        return (self.select_related("author", "category")
                    .prefetch_related("tags")
                    .annotate(comment_count=models.Count("comments",
                              filter=models.Q(comments__is_approved=True))))


class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PUBLISHED = "PUBLISHED", "Published"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique_for_date="published_at", blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="posts")
    tags = models.ManyToManyField(Tag, blank=True, related_name="posts")
    excerpt = models.CharField(max_length=300, blank=True)
    body = models.TextField()
    cover = models.ImageField(upload_to="blog/covers/%Y/%m/", blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    published_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.PositiveIntegerField(default=0)

    objects = PostQuerySet.as_manager()

    class Meta:
        ordering = ["-published_at"]
        indexes = [models.Index(fields=["status", "-published_at"])]
        permissions = [("publish_post", "Can publish posts")]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:220]
        if not self.excerpt:
            self.excerpt = self.body[:280]
        super().save(*args, **kwargs)

    @property
    def reading_time(self):
        return max(1, math.ceil(len(self.body.split()) / 200))   # 200 words per minute

    def get_absolute_url(self):
        return reverse("blog:detail", args=[self.published_at.year, self.slug])

    def __str__(self):
        return self.title


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments")
    body = models.TextField(max_length=1000)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.user} on {self.post}"


# Terminal
python manage.py makemigrations blog
python manage.py migrate`,
      result: 'Migrations for \'blog\': blog/migrations/0001_initial.py - Create model Category, Create model Tag, Create model Post, Create model Comment, Create index blog_post_status_... on field(s) status, -published_at of model post. Then "Applying blog.0001_initial... OK".',
      explanation: 'PROTECT stops deleting a category that still has posts. unique_for_date lets two posts in different years share a slug. The custom QuerySet keeps the "published" rule in one place.',
    },
    {
      title: 'Step 2: admin for editors and seed data',
      scenario: 'Office staff manage posts from the admin with filters, search, slug prepopulation and a bulk "publish" action.',
      steps: [
        'Write blog/admin.py',
        'Run the server and open /admin/blog/post/',
        'Create categories (Exams, Events, Placements) and a few posts, or load the shell seed script below',
      ],
      code: `# blog/admin.py
from django.contrib import admin, messages
from django.utils import timezone
from .models import Category, Comment, Post, Tag


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    fields = ("user", "body", "is_approved")


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "category", "status", "published_at", "views")
    list_filter = ("status", "category", "published_at")
    search_fields = ("title", "body", "author__email")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("author",)
    filter_horizontal = ("tags",)
    date_hierarchy = "published_at"
    list_select_related = ("author", "category")
    inlines = [CommentInline]
    actions = ["make_published"]

    @admin.action(description="Publish selected posts", permissions=["publish"])
    def make_published(self, request, queryset):
        updated = queryset.update(status=Post.Status.PUBLISHED, published_at=timezone.now())
        self.message_user(request, f"{updated} post(s) published.", messages.SUCCESS)

    def has_publish_permission(self, request):
        return request.user.has_perm("blog.publish_post")

# accounts/admin.py needs search_fields = ("email", ...) for autocomplete_fields to work (already set on Day 21)


# Seed data (python manage.py shell)
from django.contrib.auth import get_user_model
from blog.models import Category, Post, Tag

author = get_user_model().objects.get(email="meena@portal.com")
exams, _ = Category.objects.get_or_create(name="Exams")
events, _ = Category.objects.get_or_create(name="Events")
django_tag, _ = Tag.objects.get_or_create(name="Django", slug="django")
tips, _ = Tag.objects.get_or_create(name="Tips", slug="tips")

p1 = Post.objects.create(title="Semester exam timetable released", author=author, category=exams,
                         body="The semester exams start on 1 December. " * 40, status="PUBLISHED")
p1.tags.add(tips)
p2 = Post.objects.create(title="Django tips for freshers", author=author, category=events,
                         body="Use class based views and write tests. " * 120, status="PUBLISHED")
p2.tags.add(django_tag, tips)
Post.objects.create(title="Draft: annual day plan", author=author, category=events, body="TBD")
print(Post.objects.count(), Post.objects.published().count())`,
      result: 'Shell prints: 3 2 (three posts, two published). The admin list shows Title, Author, Category, Status, Published at, Views with filters on the right and a "Publish selected posts" action for users with blog.publish_post.',
      explanation: 'list_select_related avoids N+1 queries in the admin list. Custom admin action permissions ensure only editors can bulk publish.',
    },
    {
      title: 'Step 3: views, URLs and templates for readers',
      scenario: 'Build the public blog pages: list with category/tag filters and pagination, search, and detail with view counter and related posts.',
      steps: [
        'Write blog/views.py and blog/urls.py',
        'Include blog URLs in portal/urls.py: path("blog/", include("blog.urls"))',
        'Create a custom template filter in blog/templatetags/blog_extras.py (add empty __init__.py)',
        'Create post_list.html, post_detail.html and includes/_post_card.html',
        'Run python manage.py runserver and visit /blog/, /blog/category/exams/, /blog/search/?q=django',
      ],
      code: `# blog/views.py
from django.db.models import Count, F, Q
from django.shortcuts import get_object_or_404
from django.views.generic import DetailView, ListView

from .models import Category, Post, Tag


class PostListView(ListView):
    template_name = "blog/post_list.html"
    context_object_name = "posts"
    paginate_by = 6

    def get_queryset(self):
        qs = Post.objects.published().with_related()
        self.category = self.tag = None
        if "category_slug" in self.kwargs:
            self.category = get_object_or_404(Category, slug=self.kwargs["category_slug"])
            qs = qs.filter(category=self.category)
        if "tag_slug" in self.kwargs:
            self.tag = get_object_or_404(Tag, slug=self.kwargs["tag_slug"])
            qs = qs.filter(tags=self.tag)
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["category"] = self.category
        context["tag"] = self.tag
        context["categories"] = Category.objects.annotate(
            n=Count("posts", filter=Q(posts__status=Post.Status.PUBLISHED)))
        return context


class SearchView(PostListView):
    def get_queryset(self):
        self.query = self.request.GET.get("q", "").strip()
        qs = Post.objects.published().with_related()
        if not self.query:
            return qs.none()
        return qs.filter(Q(title__icontains=self.query) | Q(body__icontains=self.query)
                         | Q(tags__name__iexact=self.query)).distinct()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["query"] = self.query
        return context


class PostDetailView(DetailView):
    template_name = "blog/post_detail.html"
    context_object_name = "post"

    def get_object(self, queryset=None):
        post = get_object_or_404(
            Post.objects.published().select_related("author", "category").prefetch_related("tags"),
            slug=self.kwargs["slug"], published_at__year=self.kwargs["year"],
        )
        Post.objects.filter(pk=post.pk).update(views=F("views") + 1)   # atomic increment
        return post

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        post = self.object
        context["comments"] = post.comments.filter(is_approved=True).select_related("user")
        tag_ids = post.tags.values_list("id", flat=True)
        context["related"] = (Post.objects.published().filter(tags__in=tag_ids)
                              .exclude(pk=post.pk)
                              .annotate(same_tags=Count("tags"))
                              .order_by("-same_tags", "-published_at")[:3])
        return context


# blog/urls.py
from django.urls import path
from . import views

app_name = "blog"
urlpatterns = [
    path("", views.PostListView.as_view(), name="list"),
    path("category/<slug:category_slug>/", views.PostListView.as_view(), name="category"),
    path("tag/<slug:tag_slug>/", views.PostListView.as_view(), name="tag"),
    path("search/", views.SearchView.as_view(), name="search"),
    path("<int:year>/<slug:slug>/", views.PostDetailView.as_view(), name="detail"),
]

# portal/urls.py
path("blog/", include("blog.urls")),

# blog/templatetags/blog_extras.py
from django import template

register = template.Library()


@register.filter
def initials(user):
    name = user.get_full_name() or user.email
    return "".join(part[0].upper() for part in name.split()[:2])


@register.inclusion_tag("blog/includes/_tag_list.html")
def tag_list(post):
    return {"tags": post.tags.all()}

<!-- templates/blog/includes/_tag_list.html -->
{% for t in tags %}<a class="tag" href="{{ t.get_absolute_url }}">#{{ t.name }}</a> {% endfor %}

<!-- templates/blog/includes/_post_card.html -->
{% load blog_extras %}
<article class="card">
  {% if post.cover %}<img src="{{ post.cover.url }}" alt="{{ post.title }}">{% endif %}
  <a href="{{ post.category.get_absolute_url }}" class="badge">{{ post.category }}</a>
  <h3><a href="{{ post.get_absolute_url }}">{{ post.title }}</a></h3>
  <p>{{ post.excerpt|truncatewords:30 }}</p>
  <small>
    <span class="avatar">{{ post.author|initials }}</span>
    {{ post.published_at|date:"d M Y" }} · {{ post.reading_time }} min read ·
    {{ post.comment_count }} comment{{ post.comment_count|pluralize }}
  </small>
  {% tag_list post %}
</article>

<!-- templates/blog/post_list.html -->
{% extends "base.html" %}
{% block title %}Campus Blog{% endblock %}
{% block content %}
<div class="blog-layout">
  <main>
    <h1>
      {% if category %}Category: {{ category }}
      {% elif tag %}Tag: #{{ tag }}
      {% elif query is not None %}Search: "{{ query }}"
      {% else %}Campus Blog{% endif %}
    </h1>
    {% for post in posts %}
      {% include "blog/includes/_post_card.html" %}
    {% empty %}
      <p>No posts found.</p>
    {% endfor %}
    {% include "includes/_pagination.html" %}
  </main>
  <aside>
    <form action="{% url 'blog:search' %}"><input name="q" value="{{ query|default:'' }}" placeholder="Search posts"></form>
    <h4>Categories</h4>
    <ul>{% for c in categories %}<li><a href="{{ c.get_absolute_url }}">{{ c.name }}</a> ({{ c.n }})</li>{% endfor %}</ul>
  </aside>
</div>
{% endblock %}

<!-- templates/blog/post_detail.html -->
{% extends "base.html" %}
{% load blog_extras %}
{% block title %}{{ post.title }}{% endblock %}
{% block content %}
<article>
  <h1>{{ post.title }}</h1>
  <p>By {{ post.author.get_full_name|default:post.author.email }} in
     <a href="{{ post.category.get_absolute_url }}">{{ post.category }}</a> ·
     {{ post.published_at|date:"d M Y" }} · {{ post.reading_time }} min read · {{ post.views }} views</p>
  {% if post.cover %}<img src="{{ post.cover.url }}" alt="">{% endif %}
  {{ post.body|linebreaks }}
  {% tag_list post %}
</article>

<section>
  <h3>Comments ({{ comments|length }})</h3>
  {% for c in comments %}
    <p><strong>{{ c.user|initials }}</strong> {{ c.body|linebreaksbr }} <small>{{ c.created_at|timesince }} ago</small></p>
  {% empty %}<p>No comments yet.</p>{% endfor %}
  {# comment form added on Day 30 #}
</section>

{% if related %}
<section><h3>Related posts</h3>
  <ul>{% for r in related %}<li><a href="{{ r.get_absolute_url }}">{{ r.title }}</a></li>{% endfor %}</ul>
</section>
{% endif %}
{% endblock %}`,
      result: '/blog/ shows 2 published post cards (the draft is hidden) with "Exams (1)" and "Events (1)" in the sidebar. /blog/2026/django-tips-for-freshers/ shows the post, "3 min read", views increase on each refresh, and related posts sharing the "Tips" tag. /blog/search/?q=django finds the Django post. The list page runs about 5 SQL queries regardless of how many posts are shown.',
      explanation: 'One PostListView class serves three URLs by checking self.kwargs. with_related() prevents N+1 queries; F("views") + 1 increments in SQL so two simultaneous readers do not lose a count.',
    },
    {
      title: 'Pure Python demo: slugify and reading time',
      scenario: 'Recreate the small helpers used by the Post model to understand them.',
      steps: [
        'Create main.py in VS Code or PyCharm',
        'Run python main.py',
      ],
      code: `import math
import re
import unicodedata

def slugify(value):
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^\\w\\s-]", "", value.lower())
    return re.sub(r"[-\\s]+", "-", value).strip("-_")

def reading_time(text, wpm=200):
    return max(1, math.ceil(len(text.split()) / wpm))

titles = ["Django Tips for Freshers!", "  Semester   Exam -- Timetable ", "Café & Résumé 2026"]
for t in titles:
    print(repr(t), "->", slugify(t))

body = "word " * 450
print("450 words ->", reading_time(body), "min read")
print("short post ->", reading_time("Hello campus"), "min read")`,
      python: {
        files: {
          'main.py': `import math
import re
import unicodedata

def slugify(value):
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^\\w\\s-]", "", value.lower())
    return re.sub(r"[-\\s]+", "-", value).strip("-_")

def reading_time(text, wpm=200):
    return max(1, math.ceil(len(text.split()) / wpm))

titles = ["Django Tips for Freshers!", "  Semester   Exam -- Timetable ", "Café & Résumé 2026"]
for t in titles:
    print(repr(t), "->", slugify(t))

body = "word " * 450
print("450 words ->", reading_time(body), "min read")
print("short post ->", reading_time("Hello campus"), "min read")`,
        },
      },
      result: `'Django Tips for Freshers!' -> django-tips-for-freshers
'  Semester   Exam -- Timetable ' -> semester-exam-timetable
'Café & Résumé 2026' -> cafe-resume-2026
450 words -> 3 min read
short post -> 1 min read`,
      explanation: 'This is almost exactly Django\'s django.utils.text.slugify: remove accents, drop punctuation, lowercase, and join words with hyphens.',
    },
  ],
  interview: [
    { q: 'How do you start planning a Django project?', a: 'Write requirements and user roles, design the ER diagram, split features into apps, list URLs and pages, then build models first, admin second, views and templates next.', level: 'Easy' },
    { q: 'What is a slug and why use it?', a: 'A URL-friendly string (lowercase, hyphens) generated from a title. It makes URLs readable and SEO friendly, e.g. /blog/2026/django-tips/.', level: 'Easy' },
    { q: 'What does on_delete=models.PROTECT do?', a: 'It prevents deleting the referenced object while related objects exist, raising ProtectedError.', level: 'Medium' },
    { q: 'Why use a custom QuerySet/manager?', a: 'To keep reusable query logic (like published()) in the model layer, chainable and consistent across views, admin and APIs.', level: 'Medium' },
    { q: 'How do you avoid N+1 queries on a post list showing author, category and tags?', a: 'select_related("author", "category") for FKs and prefetch_related("tags") for M2M, and annotate counts instead of calling .count() per row.', level: 'Medium' },
    { q: 'Why use F() for incrementing a view counter?', a: 'F("views") + 1 performs the increment in the database atomically, avoiding race conditions where two requests read the same value and overwrite each other.', level: 'Hard' },
    { q: 'What is unique_for_date?', a: 'A field option ensuring the value is unique for the date of the given DateTimeField, validated in model validation (forms), not by a DB constraint.', level: 'Hard' },
    { q: 'What is a custom template filter vs inclusion tag?', a: 'A filter transforms a value ({{ user|initials }}). An inclusion tag renders another template with its own context ({% tag_list post %}).', level: 'Medium' },
    { q: 'How does one ListView serve category and tag pages?', a: 'Different URL patterns pass different kwargs; get_queryset() checks self.kwargs and filters accordingly.', level: 'Medium' },
    { q: 'Why add Meta.indexes on status and published_at?', a: 'The list query filters by status and orders by published_at; a composite index lets the database find and sort rows without scanning the whole table.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add an archive page /blog/archive/<year>/ listing published posts of that year.',
      hint: 'Reuse PostListView pattern or YearArchiveView.',
      solution: `from django.views.generic.dates import YearArchiveView

class PostYearArchiveView(YearArchiveView):
    queryset = Post.objects.published()
    date_field = "published_at"
    make_object_list = True

path("archive/<int:year>/", PostYearArchiveView.as_view(), name="archive"),`,
    },
    {
      task: 'Show the 5 most viewed posts in the sidebar.',
      hint: 'order_by("-views")[:5] in get_context_data.',
      solution: `context["popular"] = Post.objects.published().order_by("-views")[:5]`,
    },
    {
      task: 'Add an "author page" /blog/author/<id>/ listing that user\'s published posts.',
      hint: 'Filter by author_id from kwargs.',
      solution: `class AuthorPostListView(PostListView):
    def get_queryset(self):
        return Post.objects.published().with_related().filter(author_id=self.kwargs["pk"])

path("author/<int:pk>/", AuthorPostListView.as_view(), name="author"),`,
    },
    {
      task: 'Write a template filter word_count that returns the number of words in a text.',
      hint: '@register.filter in blog_extras.py.',
      solution: `@register.filter
def word_count(text):
    return len(str(text).split())

{{ post.body|word_count }} words`,
    },
  ],
  quiz: [
    { question: 'Which relationship fits Post and Tag?', options: ['ForeignKey', 'ManyToManyField', 'OneToOneField', 'No relation'], answer: 1, explanation: 'A post has many tags and a tag belongs to many posts.' },
    { question: 'Which call loads author and category with a SQL JOIN?', options: ['select_related("author", "category")', 'prefetch_related("author")', 'only("author")', 'values("category")'], answer: 0, explanation: 'select_related joins forward FK/OneToOne relations.' },
    { question: 'Post.objects.published() works because of:', options: ['a signal', 'middleware', 'a context processor', 'a custom QuerySet used as manager'], answer: 3, explanation: 'PostQuerySet.as_manager() exposes published() on objects.' },
    { question: 'Deleting a Category with posts when on_delete=PROTECT:', options: ['deletes the posts', 'sets category to NULL', 'raises ProtectedError', 'silently does nothing'], answer: 2, explanation: 'PROTECT blocks deletion.' },
    { question: 'Best way to add 1 to views safely under concurrency:', options: ['post.views += 1; post.save()', 'Post.objects.filter(pk=pk).update(views=F("views") + 1)', 'cache.set("views", 1)', 'a JavaScript counter'], answer: 1, explanation: 'F() runs the increment inside the database.' },
  ],
};
