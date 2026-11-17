export default {
  id: 'day-17-generic-editing-views',
  title: 'Generic Editing Views: CreateView, UpdateView, DeleteView',
  module: 'Module 3: Forms & Views',
  day: 17,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Build complete Create, Update and Delete pages for the Student Portal with almost no code using Django\'s generic editing views, and learn how form_valid(), success_url and reverse_lazy work.',
  objectives: [
    'Create records with CreateView using fields or a ModelForm',
    'Edit records with UpdateView and delete with DeleteView (confirm page)',
    'Use success_url, reverse_lazy and get_absolute_url correctly',
    'Customise saving with form_valid() and validation errors with form_invalid()',
    'Understand FormView for forms that are not tied to a model',
  ],
  theory: [
    {
      heading: 'Why generic editing views?',
      content: 'On Day 15 we wrote create and update functions by hand: check request.method, build the form, validate, save, redirect. That is the same pattern every time. Generic editing views pack this pattern into classes. Like a printed application form at a bank, the layout is ready and you only fill in your details (model, fields, template, success_url).',
      points: [
        'CreateView: shows an empty form (GET), validates and saves a new object (POST)',
        'UpdateView: same as CreateView but loads an existing object by pk/slug',
        'DeleteView: GET shows a confirm page, POST deletes and redirects',
        'FormView: shows any Form (not model based) and calls form_valid() on success',
      ],
    },
    {
      heading: 'CreateView and UpdateView attributes',
      content: 'Set model plus either fields (Django builds a ModelForm for you) or form_class (your own ModelForm). The default template is <app>/<model>_form.html for BOTH create and update. Inside the template the form is available as form, and in UpdateView the object is available as object.',
      syntax: `class StudentCreateView(CreateView):
    model = Student
    fields = ["name", "roll_no", "email", "course"]   # or form_class = StudentForm
    success_url = reverse_lazy("students:list")         # optional if model has get_absolute_url()`,
      tip: 'You cannot use both fields and form_class. Pick one. Using fields = "__all__" is risky because new sensitive fields get exposed automatically.',
    },
    {
      heading: 'success_url, reverse() vs reverse_lazy()',
      content: 'After a successful save, the view redirects. It uses success_url if set, otherwise the object\'s get_absolute_url(). Class attributes are evaluated when Python loads the module, before the URLconf is ready, so reverse() at class level crashes. reverse_lazy() delays the lookup until it is actually needed.',
      points: [
        'Class attribute: success_url = reverse_lazy("students:list")',
        'Inside a method: return reverse("students:detail", args=[self.object.pk])',
        'Override get_success_url() for dynamic redirects',
      ],
    },
    {
      heading: 'Hooks: form_valid() and form_invalid()',
      content: 'form_valid(form) runs when the submitted data passes validation. The default saves the form and redirects. Override it to set extra fields (like created_by = request.user), send a message or an email. form_invalid(form) re-renders the page with errors. Always return super().form_valid(form) (or a response) at the end.',
      syntax: `def form_valid(self, form):
    form.instance.created_by = self.request.user
    return super().form_valid(form)`,
    },
    {
      heading: 'DeleteView in Django 5',
      content: 'Since Django 4.0, DeleteView uses FormMixin, so deletion happens in form_valid() on POST. Put custom logic (like a message or soft delete) in form_valid(), not in delete(). The default template is <app>/<model>_confirm_delete.html. GET never deletes; only POST does, which protects you from accidental deletes by links or crawlers.',
      tip: 'Common mistake: deleting with a GET link like <a href="/delete/5/">. Always use a POST form with {% csrf_token %}.',
    },
  ],
  examples: [
    {
      title: 'Full CRUD for Student with generic views',
      scenario: 'Admin staff of the Student Portal must add, edit and delete students from the website.',
      steps: [
        'VS Code: open student_portal, activate venv, open students/forms.py and students/views.py side by side',
        'PyCharm: right-click students > New > Python File to create forms.py if missing',
        'Write StudentForm, then StudentCreateView, StudentUpdateView, StudentDeleteView',
        'Create templates/students/student_form.html and student_confirm_delete.html',
        'Add URLs, run python manage.py runserver and test /students/add/, /students/1/edit/, /students/1/delete/',
      ],
      code: `# students/forms.py
from django import forms
from .models import Student


class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ["name", "roll_no", "email", "course", "is_active"]

    def clean_roll_no(self):
        roll = self.cleaned_data["roll_no"].upper()
        if not roll.startswith("STU"):
            raise forms.ValidationError("Roll number must start with STU")
        return roll


# students/views.py
from django.urls import reverse_lazy
from django.views.generic import CreateView, UpdateView, DeleteView
from .forms import StudentForm
from .models import Student


class StudentCreateView(CreateView):
    model = Student
    form_class = StudentForm
    # no success_url: redirects to student.get_absolute_url()


class StudentUpdateView(UpdateView):
    model = Student
    form_class = StudentForm


class StudentDeleteView(DeleteView):
    model = Student
    success_url = reverse_lazy("students:list")


# students/urls.py
urlpatterns = [
    path("students/", views.StudentListView.as_view(), name="list"),
    path("students/add/", views.StudentCreateView.as_view(), name="create"),
    path("students/<int:pk>/", views.StudentDetailView.as_view(), name="detail"),
    path("students/<int:pk>/edit/", views.StudentUpdateView.as_view(), name="update"),
    path("students/<int:pk>/delete/", views.StudentDeleteView.as_view(), name="delete"),
]

<!-- templates/students/student_form.html (used by create AND update) -->
{% extends "base.html" %}
{% block content %}
  <h2>{% if object %}Edit {{ object.name }}{% else %}Add Student{% endif %}</h2>
  <form method="post" novalidate>
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit">Save</button>
  </form>
{% endblock %}

<!-- templates/students/student_confirm_delete.html -->
{% extends "base.html" %}
{% block content %}
  <h2>Delete {{ object.name }}?</h2>
  <form method="post">
    {% csrf_token %}
    <button type="submit">Yes, delete</button>
    <a href="{{ object.get_absolute_url }}">Cancel</a>
  </form>
{% endblock %}`,
      result: 'POST /students/add/ with roll_no "abc1" shows the error "Roll number must start with STU". With "stu101" it saves roll STU101 and redirects to /students/4/. POST /students/4/delete/ removes the record and redirects to /students/.',
      explanation: 'Four tiny classes replace about 60 lines of function code. One template serves create and update because the default template name for both is student_form.html; we check {% if object %} to change the heading.',
    },
    {
      title: 'form_valid(): set the user who created the record',
      scenario: 'Each Notice in the portal should store which staff member posted it. The user must not choose this in the form.',
      steps: [
        'Add a Notice model in students/models.py with created_by FK to settings.AUTH_USER_MODEL',
        'Run python manage.py makemigrations and python manage.py migrate (PyCharm: Tools > Run manage.py Task)',
        'Write NoticeCreateView with form_valid()',
        'Log in as admin and post a notice at /notices/add/',
      ],
      code: `# students/models.py
from django.conf import settings


class Notice(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# students/views.py
from django.contrib.auth.mixins import LoginRequiredMixin


class NoticeCreateView(LoginRequiredMixin, CreateView):
    model = Notice
    fields = ["title", "body"]          # created_by is NOT in the form
    success_url = reverse_lazy("students:home")

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        return super().form_valid(form)


# students/urls.py
path("notices/add/", views.NoticeCreateView.as_view(), name="notice_create"),`,
      result: 'Logged-in user "admin" posts "Exam on Monday". The Notice row is saved with created_by = admin and the browser is redirected to the home page.',
      explanation: 'form.instance is the unsaved model object. Setting fields on it before super().form_valid() saves them along with the form data. LoginRequiredMixin (Day 20) ensures request.user is a real user.',
    },
    {
      title: 'Custom DeleteView: soft delete and dynamic success URL',
      scenario: 'Instead of really deleting a student, the portal marks them inactive and goes back to their course page.',
      steps: [
        'Open students/views.py',
        'Override form_valid() in a DeleteView subclass',
        'Override get_success_url() to use the course',
        'Test by submitting the delete confirm form',
      ],
      code: `from django.http import HttpResponseRedirect
from django.urls import reverse


class StudentDeactivateView(DeleteView):
    model = Student
    template_name = "students/student_confirm_delete.html"

    def form_valid(self, form):
        self.object.is_active = False      # self.object already loaded by DeleteView
        self.object.save(update_fields=["is_active"])
        return HttpResponseRedirect(self.get_success_url())

    def get_success_url(self):
        if self.object.course_id:
            return reverse("students:course_detail", args=[self.object.course_id])
        return reverse("students:list")`,
      result: 'After confirming, the student row still exists with is_active=False, and the user lands on /courses/2/.',
      explanation: 'In Django 5 the delete logic lives in form_valid(). We replace it with an update. reverse() is fine here because it runs inside a method at request time.',
    },
    {
      title: 'Pure Python demo: why reverse_lazy is lazy',
      scenario: 'Understand the idea of a lazy value that is computed only when used, which is what reverse_lazy does.',
      steps: [
        'Create main.py in VS Code or PyCharm',
        'Paste the code and run python main.py',
      ],
      code: `URLS = {}

def reverse(name):
    return URLS[name]          # fails if URLs are not loaded yet

class Lazy:
    def __init__(self, func, *args):
        self.func, self.args = func, args
    def __str__(self):
        return self.func(*self.args)

def reverse_lazy(name):
    return Lazy(reverse, name)

# class body runs at import time, before URLs exist
try:
    eager = reverse("students:list")
except KeyError:
    print("reverse() failed: URLs not loaded yet")

success_url = reverse_lazy("students:list")
print("lazy object created")

URLS["students:list"] = "/students/"     # URLconf loads later
print("redirect to", str(success_url))`,
      python: {
        files: {
          'main.py': `URLS = {}

def reverse(name):
    return URLS[name]          # fails if URLs are not loaded yet

class Lazy:
    def __init__(self, func, *args):
        self.func, self.args = func, args
    def __str__(self):
        return self.func(*self.args)

def reverse_lazy(name):
    return Lazy(reverse, name)

# class body runs at import time, before URLs exist
try:
    eager = reverse("students:list")
except KeyError:
    print("reverse() failed: URLs not loaded yet")

success_url = reverse_lazy("students:list")
print("lazy object created")

URLS["students:list"] = "/students/"     # URLconf loads later
print("redirect to", str(success_url))`,
        },
      },
      result: `reverse() failed: URLs not loaded yet
lazy object created
redirect to /students/`,
      explanation: 'The lazy object stores the function and its arguments and only calls it when converted to a string, after the URL table is ready.',
    },
  ],
  interview: [
    { q: 'What are Django\'s generic editing views?', a: 'CreateView, UpdateView, DeleteView and FormView. They handle showing a form, validating POST data, saving and redirecting.', level: 'Easy' },
    { q: 'What is the default template for CreateView and UpdateView?', a: 'Both use <app>/<model>_form.html, for example students/student_form.html. DeleteView uses <model>_confirm_delete.html.', level: 'Easy' },
    { q: 'Difference between reverse() and reverse_lazy()?', a: 'reverse() resolves the URL immediately; reverse_lazy() returns a lazy object resolved when used. Use reverse_lazy for class attributes like success_url because the URLconf may not be loaded at import time.', level: 'Medium' },
    { q: 'Where does a CreateView redirect if success_url is not set?', a: 'To self.object.get_absolute_url(). If the model has no get_absolute_url, Django raises ImproperlyConfigured.', level: 'Medium' },
    { q: 'How do you save the logged-in user on a new object in CreateView?', a: 'Override form_valid(): form.instance.owner = self.request.user, then return super().form_valid(form).', level: 'Medium' },
    { q: 'Can you set both fields and form_class?', a: 'No. Django raises ImproperlyConfigured. Use fields for quick auto-forms, form_class for custom validation and widgets.', level: 'Easy' },
    { q: 'How does DeleteView work in Django 4+/5?', a: 'GET renders a confirm template; POST runs form_valid() which calls self.object.delete() and redirects to success_url. Custom logic belongs in form_valid().', level: 'Hard' },
    { q: 'Why should deletion use POST and not GET?', a: 'GET must be safe (no side effects). Links can be prefetched or crawled, and GET has no CSRF protection, so a delete via GET can happen accidentally or through an attack.', level: 'Medium' },
    { q: 'What is FormView used for?', a: 'For forms not tied to a model, like a contact form or search form. You set form_class, template_name, success_url and put logic in form_valid().', level: 'Easy' },
    { q: 'How do you restrict UpdateView so a user can edit only their own objects?', a: 'Override get_queryset() to return Model.objects.filter(owner=self.request.user). Other objects then give 404.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create CourseCreateView with fields name only and redirect to the course list.',
      hint: 'Use reverse_lazy for success_url.',
      solution: `class CourseCreateView(CreateView):
    model = Course
    fields = ["name"]
    success_url = reverse_lazy("students:course_list")`,
    },
    {
      task: 'Make UpdateView use a different template students/student_edit.html.',
      hint: 'Set template_name.',
      solution: `class StudentUpdateView(UpdateView):
    model = Student
    form_class = StudentForm
    template_name = "students/student_edit.html"`,
    },
    {
      task: 'Build a FeedbackView (FormView) with a message field that prints the message and redirects home.',
      hint: 'Create a forms.Form, then override form_valid.',
      solution: `class FeedbackForm(forms.Form):
    message = forms.CharField(widget=forms.Textarea)

class FeedbackView(FormView):
    form_class = FeedbackForm
    template_name = "students/feedback.html"
    success_url = reverse_lazy("students:home")

    def form_valid(self, form):
        print("Feedback:", form.cleaned_data["message"])
        return super().form_valid(form)`,
    },
    {
      task: 'After updating a student, redirect to the student list filtered by their name.',
      hint: 'Override get_success_url().',
      solution: `def get_success_url(self):
    return reverse("students:list") + "?q=" + self.object.name`,
    },
  ],
  quiz: [
    { question: 'Which view shows a confirmation page before removing a record?', options: ['UpdateView', 'FormView', 'DeleteView', 'DetailView'], answer: 2, explanation: 'DeleteView renders <model>_confirm_delete.html on GET.' },
    { question: 'For success_url as a class attribute you should use:', options: ['reverse_lazy()', 'reverse()', 'redirect()', 'url()'], answer: 0, explanation: 'Class attributes are evaluated at import time, so the lazy version is needed.' },
    { question: 'Which method do you override to add data to form.instance before saving?', options: ['get_object()', 'form_invalid()', 'get_context_data()', 'form_valid()'], answer: 3, explanation: 'form_valid() runs after validation and before saving.' },
    { question: 'Default template for UpdateView on model Student in app students:', options: ['students/student_update.html', 'students/student_form.html', 'students/update.html', 'students/student_edit.html'], answer: 1, explanation: 'Create and update both use the _form suffix.' },
    { question: 'If CreateView has no success_url, Django uses:', options: ['the home page', 'the same page', 'object.get_absolute_url()', 'the admin page'], answer: 2, explanation: 'ModelFormMixin falls back to get_absolute_url().' },
  ],
};
