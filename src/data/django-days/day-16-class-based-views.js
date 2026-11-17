export default {
  id: 'day-16-class-based-views',
  title: 'Class-Based Views: View, TemplateView, ListView, DetailView',
  module: 'Module 3: Forms & Views',
  day: 16,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Learn how Django class-based views (CBVs) turn repeated view logic into reusable classes. We rebuild the Student Portal pages using View, TemplateView, ListView and DetailView.',
  objectives: [
    'Explain the difference between function-based views (FBV) and class-based views (CBV)',
    'Use the base View class with get() and post() methods',
    'Build static pages with TemplateView and add extra context with get_context_data()',
    'List and show model records using ListView and DetailView',
    'Customise CBVs with attributes (model, template_name, context_object_name) and methods (get_queryset)',
  ],
  theory: [
    {
      heading: 'What is a Class-Based View?',
      content: 'A view is a Python callable that takes a request and returns a response. Until now we wrote views as functions. A class-based view (CBV) is a class whose methods handle each HTTP method: get() for GET, post() for POST, and so on. Think of a restaurant: a function view is one waiter who does everything with if/else, while a class view is a team where each person (method) handles one job. Django also ships ready-made "generic" CBVs for common jobs like listing records or showing one record.',
      points: [
        'FBV: simple, explicit, good for small or unusual logic',
        'CBV: reusable, less repeated code, easy to extend through inheritance and mixins',
        'Generic CBVs: ListView, DetailView, CreateView, UpdateView, DeleteView, TemplateView, RedirectView',
        'In urls.py you always call .as_view() on a CBV: path("", StudentListView.as_view())',
      ],
    },
    {
      heading: 'How a CBV handles a request: as_view() and dispatch()',
      content: 'as_view() returns a normal function that Django can call. For every request it creates a NEW instance of your class, stores request, args and kwargs on self, then calls dispatch(). dispatch() looks at request.method (GET, POST...) and calls the method with the same lowercase name. If the method does not exist, Django returns 405 Method Not Allowed automatically.',
      syntax: `from django.views import View
from django.http import HttpResponse

class HelloView(View):
    def get(self, request):
        return HttpResponse("Hello with GET")

    def post(self, request):
        return HttpResponse("Hello with POST")

# urls.py
path("hello/", HelloView.as_view(), name="hello")`,
      tip: 'A new instance is created per request, so it is safe to store data on self inside a request. Never store per-user data on class attributes.',
    },
    {
      heading: 'TemplateView: render a template with context',
      content: 'TemplateView is perfect for pages that mostly show a template: home page, about page, dashboard. You set template_name and, if you need data, override get_context_data(). Always call super() first so you keep the default context (it includes "view").',
      syntax: `from django.views.generic import TemplateView

class HomeView(TemplateView):
    template_name = "students/home.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["total_students"] = Student.objects.count()
        return context`,
    },
    {
      heading: 'ListView: show many records',
      content: 'ListView fetches a queryset and renders it. Default template name is <app>/<model>_list.html and the list is available as object_list and as <model>_list (for example student_list). You can change the name with context_object_name, filter with get_queryset(), sort with ordering and split into pages with paginate_by.',
      points: [
        'model = Student  -> queryset is Student.objects.all()',
        'queryset = Student.objects.filter(is_active=True)  -> fixed custom queryset',
        'def get_queryset(self): ...  -> dynamic queryset (for example based on ?q= search)',
        'paginate_by = 10  -> adds page_obj, paginator, is_paginated to context',
      ],
    },
    {
      heading: 'DetailView: show one record',
      content: 'DetailView looks up ONE object using pk or slug from the URL. Default template is <app>/<model>_detail.html and the object is available as object and as <model> (for example student). If the object is not found, Django raises Http404 for you, just like get_object_or_404.',
      syntax: `class StudentDetailView(DetailView):
    model = Student
    # URL: path("students/<int:pk>/", StudentDetailView.as_view())
    # or slug: path("students/<slug:slug>/", ...), slug_field = "slug"`,
      tip: 'Common mistake: naming the URL parameter id instead of pk. DetailView looks for pk or slug by default (change with pk_url_kwarg).',
    },
    {
      heading: 'MRO, mixins and when to choose FBV vs CBV',
      content: 'Generic views are built from small mixins (ContextMixin, TemplateResponseMixin, MultipleObjectMixin, SingleObjectMixin). Python\'s Method Resolution Order (MRO) decides which method runs when classes are combined. Rule: put your own mixins on the LEFT, the Django base view on the RIGHT. Choose CBVs for standard CRUD pages and FBVs when the flow is unusual or very short.',
      points: [
        'class MyView(LoginRequiredMixin, ListView)  -> correct order',
        'Use ccbv.co.uk (Classy Class-Based Views) to browse all attributes and methods',
        'Interview line: "CBVs give reuse through inheritance; FBVs give clarity through explicit code."',
      ],
    },
  ],
  examples: [
    {
      title: 'Base View with get() and post()',
      scenario: 'The Student Portal needs a simple "contact office" page: GET shows a form, POST shows a thank-you message. We write it as a class instead of an if/else function.',
      steps: [
        'VS Code: open the student_portal folder, activate venv (source venv/bin/activate or venv\\Scripts\\activate)',
        'PyCharm: open the project, make sure the interpreter is set to the venv (Settings > Project > Python Interpreter)',
        'Open students/views.py and add ContactView',
        'Create templates/students/contact.html',
        'Add the URL in students/urls.py and run python manage.py runserver',
        'Visit http://127.0.0.1:8000/contact/ and submit the form',
      ],
      code: `# students/views.py
from django.shortcuts import render
from django.views import View


class ContactView(View):
    template_name = "students/contact.html"

    def get(self, request):
        return render(request, self.template_name)

    def post(self, request):
        name = request.POST.get("name", "Student")
        return render(request, self.template_name, {"thanks": f"Thank you {name}, the office will reply soon."})


# students/urls.py
from django.urls import path
from . import views

app_name = "students"
urlpatterns = [
    path("contact/", views.ContactView.as_view(), name="contact"),
]

<!-- templates/students/contact.html -->
{% extends "base.html" %}
{% block content %}
  {% if thanks %}
    <p class="alert">{{ thanks }}</p>
  {% else %}
    <form method="post">
      {% csrf_token %}
      <input name="name" placeholder="Your name">
      <button type="submit">Send</button>
    </form>
  {% endif %}
{% endblock %}`,
      result: 'GET /contact/ shows the form. POST with name=Asha shows: "Thank you Asha, the office will reply soon." A PUT request returns 405 Method Not Allowed.',
      explanation: 'dispatch() routes GET to get() and POST to post(). There is no if request.method == "POST" check, which keeps each method short and clear.',
    },
    {
      title: 'TemplateView home page with extra context',
      scenario: 'The portal home page shows total students and total courses.',
      steps: [
        'Open students/views.py in VS Code or PyCharm',
        'Create HomeView(TemplateView) and override get_context_data()',
        'Create templates/students/home.html',
        'Map the empty path "" to HomeView.as_view()',
        'Run python manage.py runserver and open http://127.0.0.1:8000/',
      ],
      code: `# students/views.py
from django.views.generic import TemplateView
from .models import Student, Course


class HomeView(TemplateView):
    template_name = "students/home.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["total_students"] = Student.objects.count()
        context["total_courses"] = Course.objects.count()
        context["latest"] = Student.objects.order_by("-id")[:5]
        return context


# students/urls.py
path("", views.HomeView.as_view(), name="home"),

<!-- templates/students/home.html -->
{% extends "base.html" %}
{% block content %}
  <h1>Student Portal</h1>
  <p>Students: {{ total_students }} | Courses: {{ total_courses }}</p>
  <h3>Newest students</h3>
  <ul>
    {% for s in latest %}<li>{{ s.name }} ({{ s.roll_no }})</li>{% endfor %}
  </ul>
{% endblock %}

# Simple pages need no Python class at all:
# path("about/", TemplateView.as_view(template_name="students/about.html"), name="about"),`,
      result: 'Home page shows: Student Portal / Students: 3 | Courses: 2 and a list of the newest five students.',
      explanation: 'super().get_context_data() keeps the default context; we just add our own keys. as_view() also accepts attributes as keyword arguments, so an about page needs only one line in urls.py.',
    },
    {
      title: 'ListView with search, ordering and DetailView',
      scenario: 'Show all students with a search box (?q=) and a detail page for each student.',
      steps: [
        'Make sure the Student model exists (name, roll_no, email, course FK, is_active)',
        'Add StudentListView and StudentDetailView in students/views.py',
        'Create student_list.html and student_detail.html in templates/students/',
        'Add the two URLs and run the server',
        'Open /students/?q=ra to test search, then click a name to open the detail page',
      ],
      code: `# students/models.py (from earlier days)
from django.db import models
from django.urls import reverse


class Course(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Student(models.Model):
    name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, related_name="students")
    is_active = models.BooleanField(default=True)

    def get_absolute_url(self):
        return reverse("students:detail", args=[self.pk])

    def __str__(self):
        return self.name


# students/views.py
from django.views.generic import ListView, DetailView
from .models import Student


class StudentListView(ListView):
    model = Student
    template_name = "students/student_list.html"
    context_object_name = "students"
    ordering = ["name"]

    def get_queryset(self):
        qs = super().get_queryset().select_related("course").filter(is_active=True)
        q = self.request.GET.get("q")
        if q:
            qs = qs.filter(name__icontains=q)
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["q"] = self.request.GET.get("q", "")
        return context


class StudentDetailView(DetailView):
    model = Student
    context_object_name = "student"
    # template defaults to students/student_detail.html


# students/urls.py
path("students/", views.StudentListView.as_view(), name="list"),
path("students/<int:pk>/", views.StudentDetailView.as_view(), name="detail"),

<!-- templates/students/student_list.html -->
{% extends "base.html" %}
{% block content %}
<form method="get">
  <input name="q" value="{{ q }}" placeholder="Search name">
  <button>Search</button>
</form>
<table>
  <tr><th>Roll</th><th>Name</th><th>Course</th></tr>
  {% for s in students %}
    <tr>
      <td>{{ s.roll_no }}</td>
      <td><a href="{{ s.get_absolute_url }}">{{ s.name }}</a></td>
      <td>{{ s.course|default:"-" }}</td>
    </tr>
  {% empty %}
    <tr><td colspan="3">No students found.</td></tr>
  {% endfor %}
</table>
{% endblock %}

<!-- templates/students/student_detail.html -->
{% extends "base.html" %}
{% block content %}
  <h2>{{ student.name }}</h2>
  <p>Roll No: {{ student.roll_no }}</p>
  <p>Email: {{ student.email }}</p>
  <p>Course: {{ student.course }}</p>
  <a href="{% url 'students:list' %}">Back</a>
{% endblock %}`,
      result: '/students/?q=ra lists matching students like "Rahul" and "Ravi" in name order. /students/1/ shows the detail page; /students/999/ returns 404 Page Not Found.',
      explanation: 'get_queryset() makes the list dynamic, select_related avoids the N+1 problem for course, and DetailView raises Http404 automatically when the pk does not exist.',
    },
    {
      title: 'Pure Python demo: how dispatch() picks a method',
      scenario: 'To understand CBVs, we build a tiny imitation of View.as_view() and dispatch() without Django.',
      steps: [
        'Open VS Code or PyCharm and create a folder cbv_demo',
        'Create main.py with the code below',
        'Run with python main.py',
      ],
      code: `class View:
    http_method_names = ["get", "post", "put", "delete"]

    @classmethod
    def as_view(cls):
        def view(request):
            self = cls()              # new object per request
            self.request = request
            return self.dispatch(request)
        return view

    def dispatch(self, request):
        method = request["method"].lower()
        handler = getattr(self, method, None)
        if method not in self.http_method_names or handler is None:
            return "405 Method Not Allowed"
        return handler(request)


class StudentView(View):
    def get(self, request):
        return "200 List of students"

    def post(self, request):
        return "201 Student created: " + request["data"]


view = StudentView.as_view()
print(view({"method": "GET"}))
print(view({"method": "POST", "data": "Asha"}))
print(view({"method": "DELETE"}))`,
      python: {
        files: {
          'main.py': `class View:
    http_method_names = ["get", "post", "put", "delete"]

    @classmethod
    def as_view(cls):
        def view(request):
            self = cls()              # new object per request
            self.request = request
            return self.dispatch(request)
        return view

    def dispatch(self, request):
        method = request["method"].lower()
        handler = getattr(self, method, None)
        if method not in self.http_method_names or handler is None:
            return "405 Method Not Allowed"
        return handler(request)


class StudentView(View):
    def get(self, request):
        return "200 List of students"

    def post(self, request):
        return "201 Student created: " + request["data"]


view = StudentView.as_view()
print(view({"method": "GET"}))
print(view({"method": "POST", "data": "Asha"}))
print(view({"method": "DELETE"}))`,
        },
      },
      result: `200 List of students
201 Student created: Asha
405 Method Not Allowed`,
      explanation: 'as_view() returns a function; each call makes a fresh object and dispatch() uses getattr() to find a method named after the HTTP verb. DELETE has no handler, so we get 405, exactly like Django.',
    },
  ],
  interview: [
    { q: 'What is the difference between FBV and CBV?', a: 'An FBV is a function that handles all HTTP methods using if/else. A CBV is a class with one method per HTTP verb (get, post). CBVs allow reuse through inheritance and mixins; FBVs are simpler and more explicit.', level: 'Easy' },
    { q: 'Why do we call .as_view() in urls.py?', a: 'URL patterns need a callable function. as_view() is a class method that returns a function; on each request that function creates a new instance of the class and calls dispatch().', level: 'Easy' },
    { q: 'What does dispatch() do?', a: 'It reads request.method, lowercases it, finds the matching method (get, post...) on the view and calls it. If the method is not allowed it returns HttpResponseNotAllowed (405).', level: 'Medium' },
    { q: 'What is the default template name for ListView of model Student in app students?', a: 'students/student_list.html. For DetailView it is students/student_detail.html.', level: 'Easy' },
    { q: 'What context variables does ListView provide?', a: 'object_list, <model>_list (e.g. student_list) or the name in context_object_name, plus view. With paginate_by it also adds paginator, page_obj and is_paginated.', level: 'Medium' },
    { q: 'How do you filter a ListView based on the logged-in user or a query string?', a: 'Override get_queryset() and use self.request.user or self.request.GET, e.g. return Student.objects.filter(name__icontains=self.request.GET.get("q", "")).', level: 'Medium' },
    { q: 'How do you add extra data to a CBV template?', a: 'Override get_context_data(self, **kwargs), call context = super().get_context_data(**kwargs), add keys and return context.', level: 'Easy' },
    { q: 'What happens if DetailView cannot find the object?', a: 'get_object() raises Http404, so the user sees a 404 page.', level: 'Easy' },
    { q: 'Why does mixin order matter in CBVs?', a: 'Python resolves methods using the MRO from left to right. Mixins like LoginRequiredMixin must be on the left so their dispatch() runs before the base view\'s dispatch().', level: 'Hard' },
    { q: 'Is it safe to store request data on self in a CBV?', a: 'Yes, because as_view() creates a new instance for every request. But class-level attributes are shared, so never mutate them per request.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create an AboutView that renders students/about.html without writing a class.',
      hint: 'Pass template_name directly to TemplateView.as_view().',
      solution: `from django.views.generic import TemplateView

path("about/", TemplateView.as_view(template_name="students/about.html"), name="about")`,
    },
    {
      task: 'Create CourseListView that lists courses sorted by name and shows 5 per page.',
      hint: 'Use model, ordering and paginate_by.',
      solution: `class CourseListView(ListView):
    model = Course
    ordering = ["name"]
    paginate_by = 5
    context_object_name = "courses"`,
    },
    {
      task: 'Make a CourseDetailView that also passes the list of students in that course.',
      hint: 'Use get_context_data and the related_name "students".',
      solution: `class CourseDetailView(DetailView):
    model = Course

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["students"] = self.object.students.all()
        return context`,
    },
    {
      task: 'Write a ListView that shows only inactive students at /students/inactive/.',
      hint: 'Set the queryset attribute.',
      solution: `class InactiveStudentListView(ListView):
    queryset = Student.objects.filter(is_active=False)
    template_name = "students/student_list.html"
    context_object_name = "students"

path("students/inactive/", InactiveStudentListView.as_view(), name="inactive")`,
    },
    {
      task: 'Convert this FBV to a View class: def ping(request): return HttpResponse("pong")',
      hint: 'Subclass View and define get().',
      solution: `class PingView(View):
    def get(self, request):
        return HttpResponse("pong")

path("ping/", PingView.as_view())`,
    },
  ],
  quiz: [
    { question: 'Which method must you call on a CBV in urls.py?', options: ['.render()', '.as_view()', '.dispatch()', '.view()'], answer: 1, explanation: 'as_view() returns the callable function that Django\'s URL resolver needs.' },
    { question: 'What is the default context name for the object in DetailView with model Student?', options: ['student and object', 'item', 'detail', 'record'], answer: 0, explanation: 'DetailView provides both object and the lowercased model name.' },
    { question: 'Which method should you override to change the records a ListView shows dynamically?', options: ['get_context_data()', 'get_template_names()', 'dispatch()', 'get_queryset()'], answer: 3, explanation: 'get_queryset() returns the queryset that ListView renders.' },
    { question: 'A View subclass defines only get(). What does a POST request return?', options: ['200 OK', '404 Not Found', '405 Method Not Allowed', '500 Server Error'], answer: 2, explanation: 'dispatch() cannot find post(), so http_method_not_allowed returns 405.' },
    { question: 'Which generic view is best for a static About page?', options: ['TemplateView', 'ListView', 'DetailView', 'FormView'], answer: 0, explanation: 'TemplateView only renders a template with optional context.' },
  ],
};
