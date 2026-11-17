export default {
  id: 'day-18-messages-pagination',
  title: 'Messages Framework and Pagination',
  module: 'Module 3: Forms & Views',
  day: 18,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Show one-time flash messages like "Student saved successfully" with django.contrib.messages, and split long lists into pages using Paginator in both function-based and class-based views.',
  objectives: [
    'Configure and use the messages framework (success, info, warning, error)',
    'Show messages in base.html with Bootstrap-style CSS classes',
    'Use SuccessMessageMixin with CreateView and UpdateView',
    'Paginate querysets with Paginator and with ListView.paginate_by',
    'Build reusable pagination links that keep search query parameters',
  ],
  theory: [
    {
      heading: 'What is the messages framework?',
      content: 'After a user submits a form we redirect them (Post/Redirect/Get pattern). But how do we tell them "Saved!" on the next page? The messages framework stores a short note for ONE next request and deletes it after it is shown. It is like a sticky note on your desk that you throw away after reading.',
      points: [
        'Enabled by default: django.contrib.messages in INSTALLED_APPS, MessageMiddleware in MIDDLEWARE, messages context processor in TEMPLATES',
        'Levels: DEBUG, INFO, SUCCESS, WARNING, ERROR',
        'Storage: FallbackStorage (cookie first, then session) by default',
      ],
      syntax: `from django.contrib import messages

messages.success(request, "Student saved successfully.")
messages.error(request, "Something went wrong.")
messages.add_message(request, messages.INFO, "Hello")`,
    },
    {
      heading: 'Displaying messages in templates',
      content: 'The context processor adds a messages variable. Loop over it in base.html so every page can show alerts. Each message has .tags (like "success") which you can use as a CSS class. Iterating marks them as read so they will not show again.',
      syntax: `{% if messages %}
  <ul class="messages">
    {% for message in messages %}
      <li class="alert alert-{{ message.tags }}">{{ message }}</li>
    {% endfor %}
  </ul>
{% endif %}`,
      tip: 'Bootstrap uses "danger" not "error". Map it once in settings: MESSAGE_TAGS = {messages.ERROR: "danger"}.',
    },
    {
      heading: 'SuccessMessageMixin for CBVs',
      content: 'For CreateView, UpdateView and FormView you can add SuccessMessageMixin and set success_message. It can include form fields using %(field)s formatting. For DeleteView in Django 4+ the mixin also works because DeleteView uses form_valid().',
      syntax: `from django.contrib.messages.views import SuccessMessageMixin

class StudentCreateView(SuccessMessageMixin, CreateView):
    model = Student
    form_class = StudentForm
    success_message = "%(name)s was added successfully"`,
    },
    {
      heading: 'Pagination with Paginator',
      content: 'Showing 10,000 students on one page is slow and hard to read. Paginator splits a queryset or list into pages. The database only fetches one page of rows using LIMIT/OFFSET. get_page() is safe: it returns the first page for invalid input and the last page for numbers that are too large.',
      syntax: `from django.core.paginator import Paginator

paginator = Paginator(queryset, 10)        # 10 per page
page_obj = paginator.get_page(request.GET.get("page"))
page_obj.object_list, page_obj.number, page_obj.has_next(), page_obj.next_page_number()
paginator.count, paginator.num_pages, paginator.page_range`,
      tip: 'Always order the queryset before paginating, otherwise Django warns UnorderedObjectListWarning and pages may repeat rows.',
    },
    {
      heading: 'Pagination in ListView',
      content: 'In ListView just set paginate_by = 10. Django then adds paginator, page_obj and is_paginated to the context, and object_list contains only the current page. The page number comes from ?page=2 in the URL.',
      points: [
        'paginate_by = 10',
        'page_kwarg = "page" (change the query parameter name)',
        'paginate_orphans = 2 (merge a tiny last page into the previous one)',
        'Use a reusable include template _pagination.html',
      ],
    },
  ],
  examples: [
    {
      title: 'Messages in function-based and class-based views',
      scenario: 'When staff add or delete a student, show a green or red alert after redirect.',
      steps: [
        'Check settings.py has django.contrib.messages and MessageMiddleware (default projects have them)',
        'Add MESSAGE_TAGS in settings.py',
        'Add the messages block to templates/base.html',
        'Add SuccessMessageMixin to StudentCreateView and a message in the delete view',
        'Run the server in VS Code (terminal) or PyCharm (Run > Django Server) and add a student',
      ],
      code: `# portal/settings.py
from django.contrib.messages import constants as message_constants

MESSAGE_TAGS = {
    message_constants.ERROR: "danger",
}

<!-- templates/base.html (inside <body>) -->
<div class="container">
  {% if messages %}
    {% for message in messages %}
      <div class="alert alert-{{ message.tags }}">{{ message }}</div>
    {% endfor %}
  {% endif %}
  {% block content %}{% endblock %}
</div>

# students/views.py
from django.contrib import messages
from django.contrib.messages.views import SuccessMessageMixin
from django.shortcuts import get_object_or_404, redirect
from django.views.generic import CreateView, DeleteView
from django.urls import reverse_lazy


class StudentCreateView(SuccessMessageMixin, CreateView):
    model = Student
    form_class = StudentForm
    success_message = "%(name)s (%(roll_no)s) was added successfully."


class StudentDeleteView(DeleteView):
    model = Student
    success_url = reverse_lazy("students:list")

    def form_valid(self, form):
        messages.warning(self.request, f"{self.object.name} was deleted.")
        return super().form_valid(form)


# A function-based example
def toggle_active(request, pk):
    student = get_object_or_404(Student, pk=pk)
    student.is_active = not student.is_active
    student.save(update_fields=["is_active"])
    if student.is_active:
        messages.success(request, f"{student.name} activated.")
    else:
        messages.info(request, f"{student.name} deactivated.")
    return redirect("students:list")`,
      result: 'After adding Asha: green alert "Asha (STU101) was added successfully." on the detail page. Refreshing the page removes the alert because it was already shown once.',
      explanation: 'Messages survive exactly one redirect. SuccessMessageMixin fills %(name)s from form.cleaned_data.',
    },
    {
      title: 'ListView pagination with a reusable template that keeps ?q=',
      scenario: 'The student list has 250 rows. Show 10 per page and keep the search term when moving between pages.',
      steps: [
        'Add paginate_by = 10 and ordering to StudentListView',
        'Create templates/includes/_pagination.html',
        'Include it in student_list.html',
        'Open /students/?q=a&page=2 to test',
      ],
      code: `# students/views.py
class StudentListView(ListView):
    model = Student
    context_object_name = "students"
    ordering = ["roll_no"]
    paginate_by = 10
    paginate_orphans = 2

    def get_queryset(self):
        qs = super().get_queryset().select_related("course")
        q = self.request.GET.get("q", "")
        return qs.filter(name__icontains=q) if q else qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        params = self.request.GET.copy()
        params.pop("page", None)
        context["querystring"] = params.urlencode()   # e.g. "q=a"
        return context

<!-- templates/includes/_pagination.html -->
{% if is_paginated %}
<nav class="pagination">
  {% if page_obj.has_previous %}
    <a href="?{{ querystring }}&page=1">&laquo; First</a>
    <a href="?{{ querystring }}&page={{ page_obj.previous_page_number }}">Prev</a>
  {% endif %}

  <span>Page {{ page_obj.number }} of {{ page_obj.paginator.num_pages }}
        ({{ page_obj.paginator.count }} students)</span>

  {% if page_obj.has_next %}
    <a href="?{{ querystring }}&page={{ page_obj.next_page_number }}">Next</a>
    <a href="?{{ querystring }}&page={{ page_obj.paginator.num_pages }}">Last &raquo;</a>
  {% endif %}
</nav>
{% endif %}

<!-- templates/students/student_list.html -->
{% for s in students %} ... {% endfor %}
{% include "includes/_pagination.html" %}`,
      result: '/students/?q=a&page=2 shows rows 11 to 20 of the matching students and the text "Page 2 of 9 (85 students)". Next link is ?q=a&page=3.',
      explanation: 'request.GET.copy() gives a mutable QueryDict; removing "page" and urlencoding the rest keeps the filters on every pagination link.',
    },
    {
      title: 'Paginator in a function-based view',
      scenario: 'The notices page is a function view; paginate it manually.',
      steps: [
        'Open students/views.py',
        'Write notice_list using Paginator.get_page()',
        'Render notices/notice_list.html',
      ],
      code: `from django.core.paginator import Paginator
from django.shortcuts import render


def notice_list(request):
    notices = Notice.objects.order_by("-created_at")
    paginator = Paginator(notices, 5)
    page_obj = paginator.get_page(request.GET.get("page"))
    return render(request, "students/notice_list.html", {"page_obj": page_obj})

<!-- templates/students/notice_list.html -->
{% for n in page_obj %}
  <h4>{{ n.title }}</h4><p>{{ n.body|truncatewords:20 }}</p>
{% endfor %}
<p>
  {% for num in page_obj.paginator.page_range %}
    {% if num == page_obj.number %}<strong>{{ num }}</strong>
    {% else %}<a href="?page={{ num }}">{{ num }}</a>{% endif %}
  {% endfor %}
</p>`,
      result: '/notices/?page=abc safely shows page 1; /notices/?page=999 shows the last page instead of an error.',
      explanation: 'get_page() handles invalid and out-of-range values. paginator.page() would instead raise PageNotAnInteger or EmptyPage.',
    },
    {
      title: 'Pure Python demo: how pagination maths works',
      scenario: 'Understand the slice math behind Paginator for 23 students with 5 per page.',
      steps: [
        'Create main.py in VS Code or PyCharm',
        'Run python main.py',
      ],
      code: `import math

students = [f"STU{n:03d}" for n in range(1, 24)]   # 23 students
per_page = 5
num_pages = math.ceil(len(students) / per_page)

def get_page(number):
    try:
        number = int(number)
    except (TypeError, ValueError):
        number = 1
    number = max(1, min(number, num_pages))
    start = (number - 1) * per_page
    return number, students[start:start + per_page]

print("Total pages:", num_pages)
for value in [1, "3", "abc", 99]:
    n, items = get_page(value)
    print(f"page {value!r} -> {n}: {items}")`,
      python: {
        files: {
          'main.py': `import math

students = [f"STU{n:03d}" for n in range(1, 24)]   # 23 students
per_page = 5
num_pages = math.ceil(len(students) / per_page)

def get_page(number):
    try:
        number = int(number)
    except (TypeError, ValueError):
        number = 1
    number = max(1, min(number, num_pages))
    start = (number - 1) * per_page
    return number, students[start:start + per_page]

print("Total pages:", num_pages)
for value in [1, "3", "abc", 99]:
    n, items = get_page(value)
    print(f"page {value!r} -> {n}: {items}")`,
        },
      },
      result: `Total pages: 5
page 1 -> 1: ['STU001', 'STU002', 'STU003', 'STU004', 'STU005']
page '3' -> 3: ['STU011', 'STU012', 'STU013', 'STU014', 'STU015']
page 'abc' -> 1: ['STU001', 'STU002', 'STU003', 'STU004', 'STU005']
page 99 -> 5: ['STU021', 'STU022', 'STU023']`,
      explanation: 'This mirrors get_page(): bad input becomes page 1, big numbers become the last page, and slicing becomes LIMIT/OFFSET in SQL.',
    },
  ],
  interview: [
    { q: 'What is the Django messages framework?', a: 'A system to store one-time notifications for a user between requests, typically shown after a redirect. Messages are removed once iterated in a template.', level: 'Easy' },
    { q: 'Which settings are needed for messages?', a: 'django.contrib.messages in INSTALLED_APPS, SessionMiddleware and MessageMiddleware in MIDDLEWARE, and the django.contrib.messages.context_processors.messages context processor.', level: 'Medium' },
    { q: 'What are message levels?', a: 'DEBUG (10), INFO (20), SUCCESS (25), WARNING (30), ERROR (40). MESSAGE_LEVEL sets the minimum recorded; DEBUG is ignored by default.', level: 'Medium' },
    { q: 'Where are messages stored?', a: 'By default FallbackStorage: first in a signed cookie, falling back to the session if the cookie is too big. Alternatives: SessionStorage, CookieStorage.', level: 'Hard' },
    { q: 'What is SuccessMessageMixin?', a: 'A mixin for form views that adds success_message after form_valid(), using %(field)s placeholders from cleaned_data.', level: 'Easy' },
    { q: 'What is the difference between paginator.page() and paginator.get_page()?', a: 'page() raises PageNotAnInteger or EmptyPage for bad numbers; get_page() handles them and returns page 1 or the last page.', level: 'Medium' },
    { q: 'What context does ListView add when paginate_by is set?', a: 'paginator, page_obj, is_paginated, and object_list limited to the current page.', level: 'Easy' },
    { q: 'Why order a queryset before pagination?', a: 'Without ORDER BY the database may return rows in any order, so rows can repeat or be skipped across pages; Django warns with UnorderedObjectListWarning.', level: 'Medium' },
    { q: 'What is a drawback of OFFSET pagination for very large tables?', a: 'The database still scans skipped rows, so page 10,000 is slow. Keyset (cursor) pagination using WHERE id > last_id is faster.', level: 'Hard' },
    { q: 'What does paginate_orphans do?', a: 'If the last page would have that many items or fewer, they are added to the previous page.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Show an error message when a student tries to open a disabled course and redirect home.',
      hint: 'messages.error then redirect.',
      solution: `def course_detail(request, pk):
    course = get_object_or_404(Course, pk=pk)
    if not course.is_open:
        messages.error(request, "This course is closed.")
        return redirect("students:home")
    return render(request, "students/course_detail.html", {"course": course})`,
    },
    {
      task: 'Add a success message to StudentUpdateView: "Details of <name> updated."',
      hint: 'SuccessMessageMixin with %(name)s.',
      solution: `class StudentUpdateView(SuccessMessageMixin, UpdateView):
    model = Student
    form_class = StudentForm
    success_message = "Details of %(name)s updated."`,
    },
    {
      task: 'Paginate CourseListView with 3 courses per page and show "Page X of Y".',
      hint: 'paginate_by and page_obj.',
      solution: `class CourseListView(ListView):
    model = Course
    ordering = ["name"]
    paginate_by = 3

<!-- template -->
Page {{ page_obj.number }} of {{ page_obj.paginator.num_pages }}`,
    },
    {
      task: 'Use ?p= instead of ?page= for pagination in StudentListView.',
      hint: 'page_kwarg attribute.',
      solution: `class StudentListView(ListView):
    model = Student
    paginate_by = 10
    page_kwarg = "p"`,
    },
  ],
  quiz: [
    { question: 'How many times is a message shown by default?', options: ['Until logout', 'Once', 'Twice', 'Forever'], answer: 1, explanation: 'Iterating messages in a template marks them as used.' },
    { question: 'Which ListView attribute enables pagination?', options: ['page_size', 'per_page', 'limit', 'paginate_by'], answer: 3, explanation: 'paginate_by = N splits object_list into pages of N.' },
    { question: 'paginator.get_page("abc") returns:', options: ['The first page', 'An exception', 'None', 'The last page'], answer: 0, explanation: 'Non-integer input falls back to page 1.' },
    { question: 'Which mixin adds a message after a successful CreateView?', options: ['MessageMixin', 'FlashMixin', 'SuccessMessageMixin', 'AlertMixin'], answer: 2, explanation: 'django.contrib.messages.views.SuccessMessageMixin.' },
    { question: 'To use "danger" CSS class for errors you set:', options: ['MESSAGE_LEVEL', 'MESSAGE_TAGS', 'MESSAGE_STORAGE', 'ERROR_CLASS'], answer: 1, explanation: 'MESSAGE_TAGS maps levels to tag strings.' },
  ],
};
