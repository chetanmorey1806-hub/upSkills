export default {
  id: 'day-30-django-project-part-2-interview',
  title: 'Django Project Part 2 and Interview Questions',
  module: 'Module 6: Project',
  day: 30,
  level: 'Advanced',
  duration: '4 hours',
  summary: 'Finish the Campus Blog: authoring with generic editing views and ownership permissions, comments with signals and email notifications, caching, RSS feed and sitemap, a full test suite and a production deployment checklist. Then revise the whole Django course with 30 interview questions.',
  objectives: [
    'Build create, update and delete pages with ModelForms, mixins and object-level permissions',
    'Add comments with a form on the detail page, moderation and email notifications via signals',
    'Improve performance with caching and add an RSS feed and a sitemap',
    'Write tests for permissions, forms, views and signals and prepare the project for deployment',
    'Answer the most common Django interview questions with confidence',
  ],
  theory: [
    {
      heading: 'Part 2 feature list',
      content: 'Day 29 built everything a reader sees. Today we add everything an author and an editor does, then make the project production ready. Treat this like a real sprint: each feature comes with its own test.',
      points: [
        'Authors: /blog/new/, /blog/<pk>/edit/, /blog/<pk>/delete/ (only own posts; editors can edit any)',
        'Logged-in users: comment on posts; authors get an email when someone comments',
        'Editors: publish permission (blog.publish_post); drafts visible only to their author',
        'Performance: cached sidebar and list fragments, cache invalidation on save',
        'Extras: RSS feed (/blog/feed/), sitemap.xml, my-posts dashboard',
      ],
    },
    {
      heading: 'Ownership: a reusable mixin',
      content: 'Built-in permissions are model-wide. For "edit only your own post" write a small mixin that limits get_queryset() to the user\'s posts unless they have a special permission. Reuse it in UpdateView and DeleteView. Objects outside the queryset give 404, which also hides that they exist.',
      syntax: `class OwnerOrEditorMixin:
    editor_perm = "blog.change_post"

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.has_perm(self.editor_perm):
            return qs
        return qs.filter(author=self.request.user)`,
    },
    {
      heading: 'Handling a second form on a DetailView',
      content: 'The post detail page shows the post AND a comment form. A clean approach: the DetailView shows the empty form in context, and the form posts to a small separate CreateView (CommentCreateView) that sets post and user in form_valid() and redirects back. This keeps each view single-purpose.',
    },
    {
      heading: 'Feeds and sitemaps',
      content: 'django.contrib.syndication creates RSS/Atom feeds from a class with items(), item_title() and item_description(). django.contrib.sitemaps generates sitemap.xml so search engines find every post. Both need only a few lines and get_absolute_url() on the model.',
    },
    {
      heading: 'Course recap: the request lifecycle',
      content: 'Everything from 30 days fits in one picture. Browser -> Nginx -> Gunicorn -> Django WSGI handler -> middleware (security, session, CSRF, auth, messages) -> URL resolver -> view (FBV/CBV) -> forms/validation -> ORM/models -> database -> template rendering with context processors -> response back through middleware -> Nginx -> browser. Signals fire around model saves, caching short-circuits expensive steps, and tests check each layer.',
      tip: 'In interviews, explaining this flow clearly is one of the best ways to show you really understand Django.',
    },
  ],
  examples: [
    {
      title: 'Authoring: PostForm and Create/Update/Delete views with ownership',
      scenario: 'Teachers (and students given blog.add_post) write posts; they can edit and delete only their own; editors can edit any. Only users with blog.publish_post may set status to Published.',
      steps: [
        'Create blog/forms.py with PostForm',
        'Create blog/mixins.py with OwnerOrEditorMixin',
        'Add PostCreateView, PostUpdateView, PostDeleteView and MyPostsView to blog/views.py',
        'Add URLs (before the year/slug pattern) and templates post_form.html, post_confirm_delete.html',
        'Give the Teachers group blog.add_post, blog.change_post is NOT given (so teachers edit only their own)',
        'Run the server in VS Code (F5 with a Django launch config) or PyCharm (Run > Django server) and test with two teacher accounts',
      ],
      code: `# blog/forms.py
from django import forms
from .models import Comment, Post


class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ["title", "category", "tags", "excerpt", "body", "cover", "status", "published_at"]
        widgets = {
            "body": forms.Textarea(attrs={"rows": 12}),
            "tags": forms.CheckboxSelectMultiple,
            "published_at": forms.DateTimeInput(attrs={"type": "datetime-local"}, format="%Y-%m-%dT%H:%M"),
        }

    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user
        if user is not None and not user.has_perm("blog.publish_post"):
            self.fields["status"].choices = [(Post.Status.DRAFT, "Draft")]
            self.fields["status"].help_text = "An editor will publish your post."

    def clean_title(self):
        title = self.cleaned_data["title"].strip()
        if len(title) < 10:
            raise forms.ValidationError("Title must be at least 10 characters.")
        return title


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ["body"]
        widgets = {"body": forms.Textarea(attrs={"rows": 3, "placeholder": "Write a comment..."})}


# blog/mixins.py
class OwnerOrEditorMixin:
    editor_perm = "blog.change_post"

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.has_perm(self.editor_perm):
            return qs
        return qs.filter(author=self.request.user)


class FormUserKwargMixin:
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs["user"] = self.request.user
        return kwargs


# blog/views.py (new views)
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.urls import reverse_lazy
from django.views.generic import CreateView, DeleteView, ListView, UpdateView

from .forms import PostForm
from .mixins import FormUserKwargMixin, OwnerOrEditorMixin
from .models import Post


class PostCreateView(LoginRequiredMixin, PermissionRequiredMixin, FormUserKwargMixin,
                     SuccessMessageMixin, CreateView):
    model = Post
    form_class = PostForm
    permission_required = "blog.add_post"
    raise_exception = True
    success_message = "Post \\"%(title)s\\" saved."

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

    def get_success_url(self):
        if self.object.status == Post.Status.PUBLISHED:
            return self.object.get_absolute_url()
        return reverse_lazy("blog:my_posts")


class PostUpdateView(LoginRequiredMixin, OwnerOrEditorMixin, FormUserKwargMixin,
                     SuccessMessageMixin, UpdateView):
    model = Post
    form_class = PostForm
    success_message = "Post updated."
    success_url = reverse_lazy("blog:my_posts")


class PostDeleteView(LoginRequiredMixin, OwnerOrEditorMixin, DeleteView):
    model = Post
    editor_perm = "blog.delete_post"
    success_url = reverse_lazy("blog:my_posts")

    def form_valid(self, form):
        messages.warning(self.request, f"Post \\"{self.object.title}\\" deleted.")
        return super().form_valid(form)


class MyPostsView(LoginRequiredMixin, ListView):
    template_name = "blog/my_posts.html"
    context_object_name = "posts"
    paginate_by = 10

    def get_queryset(self):
        return (Post.objects.filter(author=self.request.user)
                .select_related("category").order_by("-updated_at"))


# blog/urls.py (complete)
urlpatterns = [
    path("", views.PostListView.as_view(), name="list"),
    path("new/", views.PostCreateView.as_view(), name="create"),
    path("mine/", views.MyPostsView.as_view(), name="my_posts"),
    path("<int:pk>/edit/", views.PostUpdateView.as_view(), name="update"),
    path("<int:pk>/delete/", views.PostDeleteView.as_view(), name="delete"),
    path("<int:pk>/comment/", views.CommentCreateView.as_view(), name="comment"),
    path("category/<slug:category_slug>/", views.PostListView.as_view(), name="category"),
    path("tag/<slug:tag_slug>/", views.PostListView.as_view(), name="tag"),
    path("search/", views.SearchView.as_view(), name="search"),
    path("feed/", feeds.LatestPostsFeed(), name="feed"),
    path("<int:year>/<slug:slug>/", views.PostDetailView.as_view(), name="detail"),
]

<!-- templates/blog/post_form.html -->
{% extends "base.html" %}
{% block content %}
  <h2>{% if object %}Edit post{% else %}New post{% endif %}</h2>
  <form method="post" enctype="multipart/form-data" novalidate>
    {% csrf_token %}
    {{ form.non_field_errors }}
    {% for field in form %}
      <div class="field">
        {{ field.label_tag }} {{ field }}
        {% if field.help_text %}<small>{{ field.help_text }}</small>{% endif %}
        {{ field.errors }}
      </div>
    {% endfor %}
    <button type="submit">Save</button>
  </form>
{% endblock %}

<!-- templates/blog/my_posts.html -->
{% extends "base.html" %}
{% block content %}
<h2>My posts</h2> <a href="{% url 'blog:create' %}">+ New post</a>
<table>
  {% for p in posts %}
  <tr>
    <td>{{ p.title }}</td><td>{{ p.get_status_display }}</td><td>{{ p.views }} views</td>
    <td><a href="{% url 'blog:update' p.pk %}">Edit</a>
        <a href="{% url 'blog:delete' p.pk %}">Delete</a></td>
  </tr>
  {% empty %}<tr><td>You have not written any posts yet.</td></tr>{% endfor %}
</table>
{% include "includes/_pagination.html" %}
{% endblock %}`,
      result: 'Teacher Meena creates "Django tips for freshers" -> saved as Draft (status choices show only Draft) and redirected to /blog/mine/ with message "Post "Django tips for freshers" saved.". Teacher Ravi opening /blog/12/edit/ (Meena\'s post) gets 404. An editor with blog.change_post can edit it and can choose Published.',
      explanation: 'Mixins split responsibilities: login, ownership, passing user to the form, messages. The form itself enforces the publish rule, so even a crafted POST with status=PUBLISHED fails validation for normal authors.',
    },
    {
      title: 'Comments with signals, email notification and moderation',
      scenario: 'Logged-in users comment from the post page; the post author receives an email; comments with blocked words are held for moderation.',
      steps: [
        'Add CommentCreateView to blog/views.py and pass CommentForm into PostDetailView context',
        'Add the comment form to post_detail.html',
        'Create blog/signals.py and register it in BlogConfig.ready()',
        'Set EMAIL_BACKEND to console in development and post a comment to see the email in the terminal',
      ],
      code: `# blog/views.py
from django.shortcuts import get_object_or_404, redirect
from .forms import CommentForm
from .models import Comment

BLOCKED_WORDS = {"spam", "scam"}


class CommentCreateView(LoginRequiredMixin, CreateView):
    model = Comment
    form_class = CommentForm
    http_method_names = ["post"]                      # no GET page

    def dispatch(self, request, *args, **kwargs):
        self.post_obj = get_object_or_404(Post.objects.published(), pk=kwargs["pk"])
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        form.instance.post = self.post_obj
        form.instance.user = self.request.user
        words = set(form.cleaned_data["body"].lower().split())
        form.instance.is_approved = not (words & BLOCKED_WORDS)
        response = super().form_valid(form)
        if form.instance.is_approved:
            messages.success(self.request, "Comment posted.")
        else:
            messages.info(self.request, "Your comment is waiting for moderation.")
        return response

    def form_invalid(self, form):
        messages.error(self.request, "Comment cannot be empty.")
        return redirect(self.post_obj)

    def get_success_url(self):
        return self.post_obj.get_absolute_url() + "#comments"


# PostDetailView.get_context_data (add)
context["comment_form"] = CommentForm()

<!-- templates/blog/post_detail.html (comments section) -->
<section id="comments">
  <h3>Comments ({{ comments|length }})</h3>
  {% for c in comments %} ... {% endfor %}
  {% if user.is_authenticated %}
    <form method="post" action="{% url 'blog:comment' post.pk %}">
      {% csrf_token %}{{ comment_form.body }}<button>Comment</button>
    </form>
  {% else %}
    <p><a href="{% url 'login' %}?next={{ request.path }}">Log in</a> to comment.</p>
  {% endif %}
</section>

# blog/signals.py
from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.db import transaction
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Comment, Post


@receiver(post_save, sender=Comment, dispatch_uid="notify_author_on_comment")
def notify_author(sender, instance, created, **kwargs):
    if not created or not instance.is_approved or instance.user_id == instance.post.author_id:
        return
    post = instance.post
    link = settings.SITE_URL + post.get_absolute_url()

    def _send():
        send_mail(
            subject=f"New comment on \\"{post.title}\\"",
            message=f"{instance.user} wrote:\\n\\n{instance.body}\\n\\nView: {link}#comments",
            from_email=None,
            recipient_list=[post.author.email],
            fail_silently=True,
        )
    transaction.on_commit(_send)


@receiver([post_save, post_delete], sender=Post, dispatch_uid="clear_blog_cache")
def clear_blog_cache(sender, **kwargs):
    cache.delete_many(["blog_sidebar_categories", "blog_popular_posts"])


# blog/apps.py
class BlogConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "blog"

    def ready(self):
        from . import signals  # noqa: F401`,
      result: `Ravi comments "Great tips, thank you!" on Meena's post -> "Comment posted." and the console shows:
Subject: New comment on "Django tips for freshers"
To: meena@portal.com
Ravi wrote: Great tips, thank you! View: http://127.0.0.1:8000/blog/2026/django-tips-for-freshers/#comments
A comment containing "scam" is saved with is_approved=False, no email is sent, and the user sees "Your comment is waiting for moderation."`,
      explanation: 'The view handles only commenting; the signal handles notification, so the comment view does not need to know about email. on_commit ensures the email goes out only if the comment really saved.',
    },
    {
      title: 'Performance and extras: caching, RSS feed, sitemap',
      scenario: 'Speed up the sidebar, expose an RSS feed for the latest posts and a sitemap for search engines.',
      steps: [
        'Add "django.contrib.sitemaps" and "django.contrib.sites" to INSTALLED_APPS and set SITE_ID = 1, then migrate',
        'Create blog/feeds.py and blog/sitemaps.py',
        'Wire sitemap.xml in portal/urls.py',
        'Cache sidebar data with cache.get_or_set (cleared by the signal above)',
        'Open /blog/feed/ and /sitemap.xml in the browser',
      ],
      code: `# blog/views.py  (sidebar helper used in PostListView.get_context_data)
from django.core.cache import cache


def sidebar_categories():
    return cache.get_or_set(
        "blog_sidebar_categories",
        lambda: list(Category.objects.annotate(
            n=Count("posts", filter=Q(posts__status=Post.Status.PUBLISHED))).values("name", "slug", "n")),
        timeout=60 * 30,
    )

# in get_context_data:  context["categories"] = sidebar_categories()

# blog/feeds.py
from django.contrib.syndication.views import Feed
from django.template.defaultfilters import truncatewords
from django.urls import reverse_lazy
from .models import Post


class LatestPostsFeed(Feed):
    title = "Campus Blog - Student Portal"
    link = reverse_lazy("blog:list")
    description = "Latest posts from teachers and students."

    def items(self):
        return Post.objects.published().select_related("author")[:10]

    def item_title(self, item):
        return item.title

    def item_description(self, item):
        return truncatewords(item.excerpt or item.body, 40)

    def item_pubdate(self, item):
        return item.published_at

    def item_author_name(self, item):
        return item.author.get_full_name() or item.author.email


# blog/sitemaps.py
from django.contrib.sitemaps import Sitemap
from .models import Post


class PostSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Post.objects.published()

    def lastmod(self, obj):
        return obj.updated_at


# portal/urls.py
from django.contrib.sitemaps.views import sitemap
from blog.sitemaps import PostSitemap

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("accounts/", include("django.contrib.auth.urls")),
    path("blog/", include("blog.urls")),
    path("sitemap.xml", sitemap, {"sitemaps": {"posts": PostSitemap}}, name="sitemap"),
    path("", include("students.urls")),
]

<!-- templates/base.html <head> -->
<link rel="alternate" type="application/rss+xml" title="Campus Blog" href="{% url 'blog:feed' %}">

<!-- templates/blog/post_list.html: cache the popular widget per page for 10 minutes -->
{% load cache %}
{% cache 600 blog_popular_widget %}
  <h4>Popular</h4>
  <ul>{% for p in popular %}<li><a href="{{ p.get_absolute_url }}">{{ p.title }}</a></li>{% endfor %}</ul>
{% endcache %}`,
      result: `/blog/feed/ returns RSS XML: <rss version="2.0"><channel><title>Campus Blog - Student Portal</title> ... <item><title>Django tips for freshers</title> ...
/sitemap.xml returns <urlset><url><loc>https://portal.example.com/blog/2026/django-tips-for-freshers/</loc><lastmod>2026-11-17</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>...
Sidebar queries drop from 1 per page view to 1 per 30 minutes (or per post change).`,
      explanation: 'Feeds and sitemaps reuse get_absolute_url() and the published() QuerySet. The cache is invalidated by the Post signal so editors see changes immediately.',
    },
    {
      title: 'Test suite for the blog and deployment checklist',
      scenario: 'Prove that drafts are hidden, ownership works, normal authors cannot publish, comments notify authors, and the feed works. Then deploy.',
      steps: [
        'Create blog/tests.py with the tests below',
        'Run python manage.py test blog -v 2 (VS Code Testing panel or PyCharm green run arrow next to the class)',
        'Run coverage run manage.py test and coverage report -m',
        'Follow the deployment checklist from Day 28 and push to Render/PythonAnywhere/VPS',
      ],
      code: `# blog/tests.py
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core import mail
from django.test import TestCase
from django.urls import reverse

from .models import Category, Comment, Post

User = get_user_model()


class BlogTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.cat = Category.objects.create(name="Events")
        add_post = Permission.objects.get(codename="add_post")
        cls.meena = User.objects.create_user(email="meena@portal.com", password="x", first_name="Meena")
        cls.ravi = User.objects.create_user(email="ravi@portal.com", password="x", first_name="Ravi")
        cls.meena.user_permissions.add(add_post)
        cls.editor = User.objects.create_user(email="editor@portal.com", password="x")
        cls.editor.user_permissions.add(
            *Permission.objects.filter(codename__in=["change_post", "publish_post", "add_post"]))
        cls.post = Post.objects.create(title="Django tips for freshers", author=cls.meena,
                                       category=cls.cat, body="word " * 300, status="PUBLISHED")
        cls.draft = Post.objects.create(title="Secret draft post", author=cls.meena,
                                        category=cls.cat, body="draft body")

    def test_list_hides_drafts(self):
        r = self.client.get(reverse("blog:list"))
        self.assertContains(r, "Django tips for freshers")
        self.assertNotContains(r, "Secret draft post")

    def test_detail_increments_views(self):
        self.client.get(self.post.get_absolute_url())
        self.post.refresh_from_db()
        self.assertEqual(self.post.views, 1)

    def test_reading_time(self):
        self.assertEqual(self.post.reading_time, 2)

    def test_other_author_cannot_edit(self):
        self.client.force_login(self.ravi)
        r = self.client.get(reverse("blog:update", args=[self.post.pk]))
        self.assertEqual(r.status_code, 404)

    def test_editor_can_edit_any_post(self):
        self.client.force_login(self.editor)
        r = self.client.get(reverse("blog:update", args=[self.post.pk]))
        self.assertEqual(r.status_code, 200)

    def test_author_cannot_publish(self):
        self.client.force_login(self.meena)
        data = {"title": "Trying to publish directly", "category": self.cat.pk, "body": "text",
                "status": "PUBLISHED", "published_at": "2026-11-17T10:00"}
        r = self.client.post(reverse("blog:create"), data)
        self.assertEqual(r.status_code, 200)               # form re-rendered with error
        self.assertFalse(Post.objects.filter(title="Trying to publish directly").exists())

    def test_user_without_permission_gets_403_on_create(self):
        self.client.force_login(self.ravi)
        self.assertEqual(self.client.get(reverse("blog:create")).status_code, 403)

    def test_comment_notifies_author(self):
        self.client.force_login(self.ravi)
        with self.captureOnCommitCallbacks(execute=True):
            self.client.post(reverse("blog:comment", args=[self.post.pk]), {"body": "Great tips!"})
        self.assertEqual(Comment.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["meena@portal.com"])

    def test_blocked_comment_is_held(self):
        self.client.force_login(self.ravi)
        self.client.post(reverse("blog:comment", args=[self.post.pk]), {"body": "this is spam"})
        self.assertFalse(Comment.objects.get().is_approved)

    def test_feed(self):
        r = self.client.get(reverse("blog:feed"))
        self.assertEqual(r["Content-Type"], "application/rss+xml; charset=utf-8")
        self.assertContains(r, "Django tips for freshers")


# ---------------- Deployment checklist ----------------
# 1. python manage.py test && coverage report        -> all green
# 2. DJANGO_DEBUG=False python manage.py check --deploy  -> 0 issues
# 3. pip freeze > requirements.txt ; commit ; push
# 4. On server / Render build: pip install -r requirements.txt
#    python manage.py migrate --noinput
#    python manage.py collectstatic --noinput
# 5. Env vars: DJANGO_SECRET_KEY, DJANGO_ALLOWED_HOSTS, DATABASE_URL, REDIS_URL,
#    EMAIL_HOST_USER/PASSWORD, SITE_URL
# 6. Start: gunicorn portal.wsgi:application --workers 3  (behind Nginx + HTTPS)
# 7. Create groups (data migration) and a superuser; set Site domain in admin (for sitemap)
# 8. Monitor: error emails to ADMINS / Sentry, logs (journalctl), DB backups (mysqldump cron)`,
      result: `Found 10 test(s).
Creating test database for alias 'default'...
..........
----------------------------------------------------------------------
Ran 10 tests in 1.128s

OK
Destroying test database for alias 'default'...`,
      explanation: 'Each test checks one rule from the requirements, so the suite doubles as documentation. Once tests and check --deploy pass, the Day 28 deployment steps put the finished Student Portal with Campus Blog online.',
    },
    {
      title: 'Pure Python demo: the permission rules of the blog as plain functions',
      scenario: 'Before coding views, model the business rules in plain Python and test them with assert. This is a common interview exercise.',
      steps: [
        'Create main.py in VS Code or PyCharm',
        'Run python main.py',
      ],
      code: `from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    perms: set = field(default_factory=set)
    def has_perm(self, p):
        return p in self.perms

@dataclass
class Post:
    title: str
    author: User
    status: str = "DRAFT"

def can_view(user, post):
    return post.status == "PUBLISHED" or (user is not None and user is post.author)

def can_edit(user, post):
    return user is post.author or user.has_perm("blog.change_post")

def allowed_statuses(user):
    return ["DRAFT", "PUBLISHED"] if user.has_perm("blog.publish_post") else ["DRAFT"]

meena = User("Meena", {"blog.add_post"})
ravi = User("Ravi")
editor = User("Editor", {"blog.change_post", "blog.publish_post"})
draft = Post("Secret draft", meena)
live = Post("Django tips", meena, "PUBLISHED")

checks = {
    "anonymous sees live post": can_view(None, live),
    "anonymous sees draft": can_view(None, draft),
    "author sees own draft": can_view(meena, draft),
    "ravi edits meena's post": can_edit(ravi, live),
    "editor edits meena's post": can_edit(editor, live),
}
for name, value in checks.items():
    print(f"{name:28} -> {value}")
print("Meena can set:", allowed_statuses(meena))
print("Editor can set:", allowed_statuses(editor))`,
      python: {
        files: {
          'main.py': `from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    perms: set = field(default_factory=set)
    def has_perm(self, p):
        return p in self.perms

@dataclass
class Post:
    title: str
    author: User
    status: str = "DRAFT"

def can_view(user, post):
    return post.status == "PUBLISHED" or (user is not None and user is post.author)

def can_edit(user, post):
    return user is post.author or user.has_perm("blog.change_post")

def allowed_statuses(user):
    return ["DRAFT", "PUBLISHED"] if user.has_perm("blog.publish_post") else ["DRAFT"]

meena = User("Meena", {"blog.add_post"})
ravi = User("Ravi")
editor = User("Editor", {"blog.change_post", "blog.publish_post"})
draft = Post("Secret draft", meena)
live = Post("Django tips", meena, "PUBLISHED")

checks = {
    "anonymous sees live post": can_view(None, live),
    "anonymous sees draft": can_view(None, draft),
    "author sees own draft": can_view(meena, draft),
    "ravi edits meena's post": can_edit(ravi, live),
    "editor edits meena's post": can_edit(editor, live),
}
for name, value in checks.items():
    print(f"{name:28} -> {value}")
print("Meena can set:", allowed_statuses(meena))
print("Editor can set:", allowed_statuses(editor))`,
        },
      },
      result: `anonymous sees live post     -> True
anonymous sees draft         -> False
author sees own draft        -> True
ravi edits meena's post      -> False
editor edits meena's post    -> True
Meena can set: ['DRAFT']
Editor can set: ['DRAFT', 'PUBLISHED']`,
      explanation: 'These three small functions are exactly what OwnerOrEditorMixin, the published() QuerySet and PostForm.__init__ implement in Django. Writing rules first makes the views simple and testable.',
    },
  ],
  interview: [
    { q: 'What is Django and what are its main features?', a: 'A high-level Python web framework following "batteries included": ORM, admin, auth, forms, templates, security protections, caching, i18n, migrations and a test framework.', level: 'Easy' },
    { q: 'Explain MVT architecture.', a: 'Model (data and business rules, ORM), View (request handling logic returning a response), Template (presentation). Django itself acts as the controller via the URL dispatcher.', level: 'Easy' },
    { q: 'Project vs app in Django?', a: 'A project is the whole site with settings and root URLs; an app is a reusable module for one feature (blog, accounts). A project contains many apps.', level: 'Easy' },
    { q: 'Explain the Django request/response lifecycle.', a: 'WSGI/ASGI handler creates HttpRequest -> request middleware -> URL resolver picks a view -> view uses models/forms -> template renders -> HttpResponse -> response middleware -> server -> client.', level: 'Medium' },
    { q: 'What happens when you run makemigrations and migrate?', a: 'makemigrations compares models with the last migration state and writes migration files; migrate applies unapplied migrations to the database and records them in django_migrations.', level: 'Easy' },
    { q: 'What is a QuerySet and why is it lazy?', a: 'A representation of a database query. It is not executed until evaluated (iteration, slicing with step, len, list, bool), allowing chaining without extra queries.', level: 'Medium' },
    { q: 'select_related vs prefetch_related?', a: 'select_related uses SQL JOIN for ForeignKey/OneToOne in one query. prefetch_related runs a separate query for ManyToMany/reverse FK and joins in Python.', level: 'Medium' },
    { q: 'What are Q and F objects?', a: 'Q builds complex conditions with OR/NOT (Q(a=1) | Q(b=2)). F refers to a field value in the database for comparisons or atomic updates (F("views") + 1).', level: 'Medium' },
    { q: 'annotate() vs aggregate()?', a: 'aggregate returns a single dict summarizing the whole queryset; annotate adds a computed value to each object in the queryset.', level: 'Medium' },
    { q: 'What is the N+1 query problem?', a: 'Fetching a list (1 query) and then a related object per row (N queries). Fix with select_related/prefetch_related and detect with Debug Toolbar or assertNumQueries.', level: 'Medium' },
    { q: 'Form vs ModelForm?', a: 'Form defines fields manually for any data; ModelForm generates fields from a model and can save() to the database.', level: 'Easy' },
    { q: 'How does form validation work?', a: 'is_valid() runs field to_python/validate/validators, then clean_<field>() methods, then clean(); errors go to form.errors and clean values to cleaned_data.', level: 'Medium' },
    { q: 'FBV vs CBV — when to use which?', a: 'CBVs (especially generic ones) for standard CRUD with reuse via mixins; FBVs for simple or unusual logic where explicit code is clearer.', level: 'Medium' },
    { q: 'How do you restrict a view to logged-in users and to users with permissions?', a: '@login_required / LoginRequiredMixin, @permission_required / PermissionRequiredMixin, UserPassesTestMixin for custom checks, and queryset filtering for object-level rules.', level: 'Medium' },
    { q: 'Why create a custom user model at the start?', a: 'Changing AUTH_USER_MODEL after initial migrations is very difficult; starting with AbstractUser lets you add fields like role or email login later easily.', level: 'Medium' },
    { q: 'How does Django protect against CSRF, XSS and SQL injection?', a: 'CSRF tokens via CsrfViewMiddleware; auto-escaping in templates; parameterized queries in the ORM. Plus clickjacking protection and secure cookie/HTTPS settings.', level: 'Medium' },
    { q: 'What is middleware? Give an example of a custom one.', a: 'A layer processing every request/response. Example: timing middleware adding X-Response-Time, or maintenance mode returning 503.', level: 'Medium' },
    { q: 'What are signals and their drawbacks?', a: 'Observer hooks like post_save. Drawbacks: hidden control flow, synchronous, not fired by bulk update/raw SQL, harder to test and debug.', level: 'Medium' },
    { q: 'Explain sessions vs cookies in Django.', a: 'Cookies store data in the browser; sessions store data server-side (db/cache) keyed by a sessionid cookie. Auth uses sessions.', level: 'Easy' },
    { q: 'What caching options does Django provide?', a: 'Backends (Redis, Memcached, DB, file, locmem) and levels: per-site middleware, per-view cache_page, template fragment {% cache %}, and low-level cache API.', level: 'Medium' },
    { q: 'How do you test a Django application?', a: 'django.test.TestCase with the test Client, setUpTestData, assertContains/assertRedirects/assertNumQueries, mail.outbox, call_command; pytest-django and coverage for tooling.', level: 'Medium' },
    { q: 'How do you deploy Django to production?', a: 'DEBUG=False, env-based secrets, ALLOWED_HOSTS, migrate, collectstatic, run under Gunicorn/uWSGI behind Nginx with HTTPS, or use a PaaS like Render/PythonAnywhere; configure logging and backups.', level: 'Medium' },
    { q: 'What does collectstatic do and why is WhiteNoise used?', a: 'collectstatic copies all static files to STATIC_ROOT. WhiteNoise serves them from the app efficiently with compression and caching when no Nginx is available.', level: 'Easy' },
    { q: 'What is the difference between null=True and blank=True?', a: 'null=True allows NULL in the database; blank=True allows an empty value in form validation. For CharField prefer blank=True without null.', level: 'Easy' },
    { q: 'What are the on_delete options?', a: 'CASCADE, PROTECT, RESTRICT, SET_NULL (needs null=True), SET_DEFAULT, SET(...), DO_NOTHING.', level: 'Medium' },
    { q: 'How do you run raw SQL safely?', a: 'Model.objects.raw(sql, params) or connection.cursor().execute(sql, params) with %s placeholders, never string formatting.', level: 'Medium' },
    { q: 'What are transactions in Django?', a: 'By default autocommit per query. Use transaction.atomic() to group operations so they all succeed or all roll back; transaction.on_commit() runs code after a successful commit.', level: 'Hard' },
    { q: 'How do you handle slow tasks like emails or reports?', a: 'Offload to background workers (Celery + Redis/RabbitMQ, django-q2, RQ) triggered after commit, and schedule periodic tasks with Celery beat or cron + management commands.', level: 'Hard' },
    { q: 'What is the difference between WSGI and ASGI, and does Django support async?', a: 'WSGI is synchronous; ASGI supports async and WebSockets. Django supports async views, async ORM methods (aget, acount, async iteration) and runs under ASGI servers like Uvicorn/Daphne.', level: 'Hard' },
    { q: 'How would you scale a Django app for high traffic?', a: 'Optimize queries and indexes, cache aggressively (Redis), use a CDN for static/media, add Gunicorn workers and multiple app servers behind a load balancer, read replicas, background queues, and monitor with APM tools.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a "Like" feature: logged-in users can like a post once; show the like count.',
      hint: 'ManyToManyField(User, related_name="liked_posts") and a POST-only toggle view.',
      solution: `# models.py
likes = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="liked_posts")

# views.py
@login_required
@require_POST
def toggle_like(request, pk):
    post = get_object_or_404(Post.objects.published(), pk=pk)
    if post.likes.filter(pk=request.user.pk).exists():
        post.likes.remove(request.user)
    else:
        post.likes.add(request.user)
    return redirect(post)

# template
{{ post.likes.count }} likes
<form method="post" action="{% url 'blog:like' post.pk %}">{% csrf_token %}<button>Like</button></form>`,
    },
    {
      task: 'Allow authors to preview their own drafts at the detail URL.',
      hint: 'In PostDetailView.get_object, include drafts where author == request.user.',
      solution: `def get_object(self, queryset=None):
    qs = Post.objects.select_related("author", "category")
    visible = Q(status=Post.Status.PUBLISHED, published_at__lte=timezone.now())
    if self.request.user.is_authenticated:
        visible |= Q(author=self.request.user)
    return get_object_or_404(qs.filter(visible), slug=self.kwargs["slug"],
                             published_at__year=self.kwargs["year"])`,
    },
    {
      task: 'Write a management command publish_scheduled that publishes posts whose published_at has passed and status is SCHEDULED.',
      hint: 'Add a SCHEDULED status and use update().',
      solution: `class Command(BaseCommand):
    help = "Publish scheduled posts"

    def handle(self, *args, **opts):
        n = Post.objects.filter(status="SCHEDULED", published_at__lte=timezone.now()) \\
                        .update(status=Post.Status.PUBLISHED)
        cache.delete_many(["blog_sidebar_categories", "blog_popular_posts"])  # update() skips signals
        self.stdout.write(self.style.SUCCESS(f"Published {n} post(s)"))`,
    },
    {
      task: 'Add a test that the sitemap contains the published post URL and not the draft.',
      hint: 'GET /sitemap.xml and assertContains / assertNotContains.',
      solution: `def test_sitemap(self):
    r = self.client.get("/sitemap.xml")
    self.assertContains(r, self.post.get_absolute_url())
    self.assertNotContains(r, "secret-draft-post")`,
    },
    {
      task: 'Build a Django REST-ready JSON endpoint /blog/api/latest/ returning the 5 latest titles and URLs without DRF.',
      hint: 'JsonResponse with values().',
      solution: `def latest_json(request):
    posts = Post.objects.published()[:5]
    data = [{"title": p.title, "url": request.build_absolute_uri(p.get_absolute_url())} for p in posts]
    return JsonResponse({"results": data})`,
    },
    {
      task: 'Final task: write a README section listing setup steps for a new developer.',
      hint: 'Clone, venv, install, .env, migrate, createsuperuser, runserver, test.',
      solution: `git clone <repo> && cd student_portal
python -m venv venv && source venv/bin/activate   # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env   # fill values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
python manage.py test`,
    },
  ],
  quiz: [
    { question: 'An author tries to open another author\'s post edit URL. With OwnerOrEditorMixin they get:', options: ['200 OK', '403 Forbidden', '404 Not Found', '500 Server Error'], answer: 2, explanation: 'The object is not in the filtered queryset, so get_object() raises Http404.' },
    { question: 'Which Django contrib app generates RSS feeds?', options: ['django.contrib.syndication', 'django.contrib.sitemaps', 'django.contrib.feeds', 'django.contrib.rss'], answer: 0, explanation: 'Feed classes live in django.contrib.syndication.views.' },
    { question: 'Why is the comment email sent inside transaction.on_commit()?', options: ['To send it faster', 'To skip the email in tests', 'Because signals require it', 'To send only after the comment is really saved'], answer: 3, explanation: 'If the transaction rolls back, no email is sent.' },
    { question: 'Which statement about Post.objects.filter(...).update(status="PUBLISHED") is true?', options: ['It sends post_save for each post', 'It does not send post_save, so cache must be cleared manually', 'It calls Post.save()', 'It cannot change status'], answer: 1, explanation: 'update() runs one SQL UPDATE without model signals.' },
    { question: 'Which tool best proves the blog list page has no N+1 problem?', options: ['assertContains', 'assertRedirects', 'assertNumQueries', 'assertTemplateUsed'], answer: 2, explanation: 'assertNumQueries fails if the number of queries changes.' },
  ],
};
