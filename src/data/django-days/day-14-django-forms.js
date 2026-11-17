export default {
  id: 'day-14-django-forms',
  title: 'Django Forms: Form class, Validation, Rendering',
  module: 'Module 3: Forms & Views',
  day: 14,
  level: 'Intermediate',
  duration: '3 hours',
  summary: `Build an Admission Enquiry form and a Student Search form for the Student Portal using django.forms.Form. Learn form fields and widgets, the GET/POST view pattern, CSRF protection, is_valid() and cleaned_data, field-level and form-level validation, custom validators, error display, and different ways to render forms in templates.`,
  objectives: [
    `Define a Form class with fields, widgets, labels, help text and validators`,
    `Write the standard view pattern: unbound form on GET, bound form + is_valid() on POST, redirect after success`,
    `Validate with built-in rules, validators, clean_<field>() and clean()`,
    `Render forms with as_div/as_p, field by field, and show field and non-field errors`,
    `Use a GET form for searching and understand CSRF protection for POST forms`,
  ],
  theory: [
    {
      heading: `Why Django forms?`,
      content: `Handling HTML forms by hand means reading request.POST, converting strings to numbers and dates, checking required fields, validating emails, showing error messages next to inputs, re-filling the form after an error, and protecting against attacks. Django's forms library does all of this. Analogy: a form class is like an admission office clerk with a checklist - collects the paper, checks every box, returns it with red marks if something is wrong, and files it only when everything is correct.`,
      points: [
        `Form class -> describes fields and rules (in forms.py).`,
        `Bound form = created with data (request.POST); Unbound form = empty (for first display).`,
        `is_valid() runs all validation and fills form.cleaned_data (Python types) or form.errors.`,
        `Rendering generates HTML inputs with correct names, types, required attributes and errors.`,
      ],
    },
    {
      heading: `Form fields and widgets`,
      content: `A field handles validation and conversion; a widget decides the HTML input element. Each field has a default widget that you can override.`,
      syntax: `from django import forms

class AdmissionEnquiryForm(forms.Form):
    full_name = forms.CharField(max_length=100, label="Full name",
                                widget=forms.TextInput(attrs={"placeholder": "Your full name"}))
    email = forms.EmailField()
    date_of_birth = forms.DateField(widget=forms.DateInput(attrs={"type": "date"}))
    course = forms.ChoiceField(choices=[("BCA", "BCA"), ("BSC", "B.Sc CS")])
    percentage_12th = forms.DecimalField(max_digits=5, decimal_places=2, min_value=0, max_value=100)
    hostel_required = forms.BooleanField(required=False)   # unchecked box = not sent
    message = forms.CharField(widget=forms.Textarea(attrs={"rows": 3}), required=False)`,
      points: [
        `Fields: CharField, EmailField, IntegerField, DecimalField, FloatField, BooleanField, DateField, DateTimeField, ChoiceField, MultipleChoiceField, FileField, ImageField, URLField, SlugField, RegexField, ModelChoiceField.`,
        `Common arguments: required (default True), label, initial, help_text, max_length, min_value, max_value, validators, widget, disabled.`,
        `Widgets: TextInput, Textarea, PasswordInput, EmailInput, NumberInput, DateInput, Select, RadioSelect, CheckboxInput, CheckboxSelectMultiple, HiddenInput, FileInput.`,
        `BooleanField must use required=False if unchecked should be allowed.`,
      ],
    },
    {
      heading: `The view pattern: GET, POST, validate, redirect`,
      content: `This pattern is used in almost every Django form view. After a successful POST always redirect (Post/Redirect/Get pattern) so that pressing browser Refresh does not resubmit the form.`,
      syntax: `def enquiry(request):
    if request.method == "POST":
        form = AdmissionEnquiryForm(request.POST)   # bound
        if form.is_valid():
            data = form.cleaned_data                 # converted Python values
            ...save / email...
            return redirect("students:enquiry_thanks")
    else:
        form = AdmissionEnquiryForm()                # unbound, empty
    return render(request, "students/enquiry_form.html", {"form": form})
    # invalid POST falls through: the form is re-rendered WITH data and errors`,
    },
    {
      heading: `Validation order`,
      content: `When you call is_valid(), Django validates in a fixed order. Knowing it is a classic interview question.`,
      points: [
        `1. field.to_python() - convert the string ("86.5" -> Decimal("86.5")); errors like "Enter a number."`,
        `2. field.validate() + field.run_validators() - required, max_length, min_value, EmailValidator, your validators=[...].`,
        `3. form.clean_<fieldname>() - your custom rule for ONE field; read self.cleaned_data["field"], return the (possibly changed) value or raise ValidationError.`,
        `4. form.clean() - rules that involve SEVERAL fields (e.g. course + percentage). Errors go to non_field_errors() (key "__all__"), or use self.add_error("field", "msg").`,
        `Result: form.cleaned_data has only valid fields; form.errors maps field name -> list of messages.`,
      ],
      syntax: `from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator

phone_validator = RegexValidator(r"^[6-9][0-9]{9}$", "Enter a valid 10-digit Indian mobile number.")

def clean_full_name(self):
    name = self.cleaned_data["full_name"].strip()
    if len(name.split()) < 2:
        raise ValidationError("Please enter first name and last name.")
    return name.title()          # ALWAYS return the value`,
      tip: `Forgetting to return the value from clean_<field>() sets that field to None in cleaned_data - a very common bug.`,
    },
    {
      heading: `Rendering forms in templates`,
      content: `Quick ways: {{ form }} / {{ form.as_div }} (Django 5 default, accessible), {{ form.as_p }}, {{ form.as_table }}, {{ form.as_ul }}. For full control, render each field: label, widget, errors and help text. Django 5.0 added {{ form.field.as_field_group }} to render label + widget + errors + help text of one field.`,
      syntax: `<form method="post" novalidate>
  {% csrf_token %}
  {{ form.non_field_errors }}
  {% for field in form %}
    <div class="mb-3">
      {{ field.label_tag }} {{ field }}
      {% if field.help_text %}<small>{{ field.help_text }}</small>{% endif %}
      {% for error in field.errors %}<div class="text-danger">{{ error }}</div>{% endfor %}
    </div>
  {% endfor %}
  <button type="submit">Submit</button>
</form>`,
      points: [
        `{% csrf_token %} is mandatory in every POST form - without it Django returns 403 Forbidden (CSRF verification failed).`,
        `novalidate disables browser HTML5 validation so you can see Django's server-side errors while learning; server validation always runs anyway.`,
        `Add CSS classes via widget attrs or in __init__: self.fields["email"].widget.attrs["class"] = "form-control".`,
        `Use method="get" for search/filter forms (bookmarkable URL, no CSRF needed); method="post" for anything that changes data.`,
      ],
    },
  ],
  examples: [
    {
      title: `Admission Enquiry form: forms.py, model, view, URLs and template`,
      scenario: `Visitors fill an admission enquiry. The form validates name, email, Indian mobile number, age (16+), course and 12th percentage (BCA needs 50%+). Valid enquiries are saved to an Enquiry model and the user is redirected to a thank-you page.`,
      steps: [
        `Create students/forms.py (VS Code: New File; PyCharm: right-click students > New > Python File > forms).`,
        `Add the Enquiry model to students/models.py, then run python manage.py makemigrations students and python manage.py migrate.`,
        `Add the views, URLs and the two templates.`,
        `Register Enquiry in admin.py (admin.site.register(Enquiry)) to see saved enquiries.`,
        `Run the server and open http://127.0.0.1:8000/students/enquiry/. Submit an empty form, then a wrong one, then a correct one.`,
      ],
      code: `# Project tree (new/changed files)
students/
|-- forms.py                                   <- NEW
|-- models.py                                  <- + Enquiry
|-- views.py                                   <- + enquiry, enquiry_thanks
|-- urls.py
\`-- templates/students/
    |-- enquiry_form.html                      <- NEW
    \`-- enquiry_thanks.html                    <- NEW

# students/forms.py
from datetime import date

from django import forms
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator

phone_validator = RegexValidator(r"^[6-9][0-9]{9}$", "Enter a valid 10-digit Indian mobile number.")


class AdmissionEnquiryForm(forms.Form):
    COURSE_CHOICES = [("", "-- Select course --"), ("BCA", "BCA"), ("BSC", "B.Sc CS"), ("BCOM", "B.Com")]

    full_name = forms.CharField(max_length=100, label="Full name",
                                widget=forms.TextInput(attrs={"placeholder": "Your full name"}))
    email = forms.EmailField()
    phone = forms.CharField(max_length=10, validators=[phone_validator])
    date_of_birth = forms.DateField(widget=forms.DateInput(attrs={"type": "date"}))
    course = forms.ChoiceField(choices=COURSE_CHOICES)
    percentage_12th = forms.DecimalField(max_digits=5, decimal_places=2, min_value=0, max_value=100,
                                         label="12th percentage")
    hostel_required = forms.BooleanField(required=False)
    message = forms.CharField(widget=forms.Textarea(attrs={"rows": 3}), required=False)

    def clean_full_name(self):
        name = self.cleaned_data["full_name"].strip()
        if len(name.split()) < 2:
            raise ValidationError("Please enter first name and last name.")
        return name.title()

    def clean_date_of_birth(self):
        dob = self.cleaned_data["date_of_birth"]
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        if age < 16:
            raise ValidationError("You must be at least 16 years old.")
        return dob

    def clean(self):
        cleaned = super().clean()
        course = cleaned.get("course")
        pct = cleaned.get("percentage_12th")
        if course == "BCA" and pct is not None and pct < 50:
            raise ValidationError("BCA requires at least 50% in 12th.")
        return cleaned

# students/models.py (add)
class Enquiry(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=10)
    date_of_birth = models.DateField()
    course = models.CharField(max_length=10)
    percentage_12th = models.DecimalField(max_digits=5, decimal_places=2)
    hostel_required = models.BooleanField(default=False)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.course})"

# students/views.py (add)
from django.shortcuts import redirect, render
from .forms import AdmissionEnquiryForm
from .models import Enquiry

def enquiry(request):
    if request.method == "POST":
        form = AdmissionEnquiryForm(request.POST)
        if form.is_valid():
            Enquiry.objects.create(**form.cleaned_data)
            return redirect("students:enquiry_thanks")
    else:
        form = AdmissionEnquiryForm()
    return render(request, "students/enquiry_form.html", {"form": form})

def enquiry_thanks(request):
    return render(request, "students/enquiry_thanks.html")

# students/urls.py (add to urlpatterns)
    path("enquiry/", views.enquiry, name="enquiry"),
    path("enquiry/thanks/", views.enquiry_thanks, name="enquiry_thanks"),

<!-- students/templates/students/enquiry_form.html -->
{% extends "base.html" %}
{% block title %}Admission Enquiry{% endblock %}
{% block content %}
<h1>Admission Enquiry</h1>
<form method="post" novalidate>
  {% csrf_token %}
  {% if form.non_field_errors %}
    <div class="alert">{{ form.non_field_errors }}</div>
  {% endif %}
  {% for field in form %}
    <div class="form-row">
      {{ field.label_tag }}
      {{ field }}
      {% for error in field.errors %}<div class="fail">{{ error }}</div>{% endfor %}
    </div>
  {% endfor %}
  <button type="submit">Submit enquiry</button>
</form>
{% endblock %}

<!-- students/templates/students/enquiry_thanks.html -->
{% extends "base.html" %}
{% block content %}
<h1>Thank you!</h1>
<p>Our admission team will contact you within 2 working days.</p>
<a href="{% url 'students:list' %}">Back to students</a>
{% endblock %}`,
      result: `GET /students/enquiry/                     -> 200, empty form
POST name="asha", email="x", phone="1"...   -> 200, form re-shown with your data and errors:
   Full name: Please enter first name and last name.
   Email: Enter a valid email address.
   Phone: Enter a valid 10-digit Indian mobile number.
POST valid data ("asha verma", asha@gmail.com, 9876543210, 2007-05-12, BCA, 86.5)
                                            -> 302 redirect to /students/enquiry/thanks/
Admin > Enquirys shows: Asha Verma (BCA)   (name was title-cased by clean_full_name)`,
      explanation: `Invalid POSTs are re-rendered with the bound form, so the user sees their data and the errors. A valid POST saves cleaned_data (already converted: date object, Decimal, bool) and redirects (PRG pattern). The keys of cleaned_data match the model fields, so ** unpacking works. Set verbose_name_plural = "Enquiries" in Meta to fix the admin label.`,
    },
    {
      title: `Checking validation in the Django shell`,
      scenario: `Test the form without a browser - faster while developing and exactly how you would unit test it.`,
      steps: [
        `Run python manage.py shell.`,
        `Create bound forms with dictionaries (the same as request.POST).`,
        `Inspect is_valid(), cleaned_data and errors.`,
      ],
      code: `>>> from students.forms import AdmissionEnquiryForm
>>> good = {"full_name": "asha verma", "email": "asha@gmail.com", "phone": "9876543210",
...         "date_of_birth": "2007-05-12", "course": "BCA", "percentage_12th": "86.5",
...         "hostel_required": "on"}
>>> f = AdmissionEnquiryForm(good)
>>> f.is_bound, f.is_valid()
>>> f.cleaned_data
>>> bad = {"full_name": "asha", "email": "asha@", "phone": "12345",
...        "date_of_birth": "2015-01-01", "course": "BCA", "percentage_12th": "45"}
>>> f2 = AdmissionEnquiryForm(bad)
>>> f2.is_valid()
>>> for field, errs in f2.errors.items():
...     print(field, "->", errs[0])
>>> AdmissionEnquiryForm().is_bound
>>> print(AdmissionEnquiryForm()["full_name"])`,
      result: `(True, True)
{'full_name': 'Asha Verma', 'email': 'asha@gmail.com', 'phone': '9876543210', 'date_of_birth': datetime.date(2007, 5, 12), 'course': 'BCA', 'percentage_12th': Decimal('86.5'), 'hostel_required': True, 'message': ''}
False
full_name -> Please enter first name and last name.
email -> Enter a valid email address.
phone -> Enter a valid 10-digit Indian mobile number.
date_of_birth -> You must be at least 16 years old.
__all__ -> BCA requires at least 50% in 12th.
False
<input type="text" name="full_name" placeholder="Your full name" maxlength="100" required id="id_full_name">`,
      explanation: `Strings were converted into a date, a Decimal and a bool. Each failing field reports its own message; the cross-field rule from clean() appears under "__all__" (non-field errors). Even with errors in other fields, clean() still runs using whatever is in cleaned_data, which is why it uses .get().`,
    },
    {
      title: `Student Search form with GET`,
      scenario: `Replace the manual request.GET parsing from Day 8 with a validated search form: name/roll number, course dropdown and minimum marks.`,
      steps: [
        `Add StudentSearchForm to students/forms.py.`,
        `Update the student_list view and the top of student_list.html.`,
        `Open /students/?q=asha&course=BCA&min_marks=60 and /students/?min_marks=200.`,
      ],
      code: `# students/forms.py (add)
class StudentSearchForm(forms.Form):
    q = forms.CharField(required=False, label="Name or roll no")
    course = forms.ChoiceField(required=False, choices=[("", "All courses"), ("BCA", "BCA"),
                                                        ("BSC", "BSC"), ("BCOM", "BCOM")])
    min_marks = forms.IntegerField(required=False, min_value=0, max_value=100)

# students/views.py
from django.db.models import Q
from .forms import StudentSearchForm

def student_list(request):
    form = StudentSearchForm(request.GET or None)      # unbound when there is no query string
    students = Student.objects.select_related("course")
    if form.is_valid():
        q = form.cleaned_data["q"]
        course = form.cleaned_data["course"]
        min_marks = form.cleaned_data["min_marks"]
        if q:
            students = students.filter(Q(name__icontains=q) | Q(roll_no__iexact=q))
        if course:
            students = students.filter(course__code=course)
        if min_marks is not None:
            students = students.filter(marks__gte=min_marks)
    return render(request, "students/student_list.html", {"form": form, "students": students})

<!-- student_list.html (above the table) -->
<form method="get" class="search">
  {{ form.as_div }}
  <button type="submit">Search</button>
  <a href="{% url 'students:list' %}">Reset</a>
</form>`,
      result: `/students/?q=asha&course=BCA&min_marks=60 -> only matching students; the inputs keep the typed values
/students/?min_marks=200                   -> all students listed, and under the field:
   Ensure this value is less than or equal to 100.`,
      explanation: `request.GET or None keeps the form unbound on the first visit (no errors shown). A GET form needs no csrf_token and produces bookmarkable URLs. Validation turns min_marks into an int, so no try/except is needed in the view.`,
    },
    {
      title: `Pure Python: the validation pipeline behind is_valid()`,
      scenario: `Build a tiny Form class that converts values, calls clean_<field>() hooks and finally clean(), collecting errors - to understand exactly what Django does.`,
      steps: [
        `Create main.py in VS Code or PyCharm.`,
        `Run python main.py.`,
        `Change the second data dict to fix the errors one by one.`,
      ],
      code: `class ValidationError(Exception):
    pass


class Field:
    def __init__(self, required=True, to_python=str):
        self.required = required
        self.to_python = to_python

    def clean(self, raw):
        if raw in (None, ""):
            if self.required:
                raise ValidationError("This field is required.")
            return None
        try:
            return self.to_python(raw)
        except ValueError:
            raise ValidationError("Enter a valid value.")


class Form:
    def __init__(self, data=None):
        self.data = data
        self.is_bound = data is not None
        self.errors = {}
        self.cleaned_data = {}

    def is_valid(self):
        if not self.is_bound:
            return False
        fields = {k: v for k, v in type(self).__dict__.items() if isinstance(v, Field)}
        for name, field in fields.items():                 # 1. field.clean()
            try:
                value = field.clean(self.data.get(name))
                hook = getattr(self, f"clean_{name}", None)  # 2. clean_<field>()
                if hook:
                    self.cleaned_data[name] = value
                    value = hook()
                self.cleaned_data[name] = value
            except ValidationError as e:
                self.errors[name] = str(e)
                self.cleaned_data.pop(name, None)
        try:                                               # 3. clean() for the whole form
            self.clean()
        except ValidationError as e:
            self.errors["__all__"] = str(e)
        return not self.errors

    def clean(self):
        pass


class EnquiryForm(Form):
    name = Field()
    age = Field(to_python=int)
    course = Field()
    percentage = Field(to_python=float)

    def clean_name(self):
        name = self.cleaned_data["name"].strip()
        if len(name.split()) < 2:
            raise ValidationError("Please enter first name and last name.")
        return name.title()

    def clean(self):
        if self.cleaned_data.get("course") == "BCA" and self.cleaned_data.get("percentage", 100) < 50:
            raise ValidationError("BCA requires at least 50% in 12th.")


for data in [
    {"name": "asha verma", "age": "19", "course": "BCA", "percentage": "86.5"},
    {"name": "ravi", "age": "abc", "course": "BCA", "percentage": "45"},
    None,
]:
    form = EnquiryForm(data)
    print("bound:", form.is_bound, "| valid:", form.is_valid())
    print("  cleaned:", form.cleaned_data)
    print("  errors :", form.errors)`,
      python: {
        files: {
          'main.py': `class ValidationError(Exception):
    pass


class Field:
    def __init__(self, required=True, to_python=str):
        self.required = required
        self.to_python = to_python

    def clean(self, raw):
        if raw in (None, ""):
            if self.required:
                raise ValidationError("This field is required.")
            return None
        try:
            return self.to_python(raw)
        except ValueError:
            raise ValidationError("Enter a valid value.")


class Form:
    def __init__(self, data=None):
        self.data = data
        self.is_bound = data is not None
        self.errors = {}
        self.cleaned_data = {}

    def is_valid(self):
        if not self.is_bound:
            return False
        fields = {k: v for k, v in type(self).__dict__.items() if isinstance(v, Field)}
        for name, field in fields.items():                 # 1. field.clean()
            try:
                value = field.clean(self.data.get(name))
                hook = getattr(self, f"clean_{name}", None)  # 2. clean_<field>()
                if hook:
                    self.cleaned_data[name] = value
                    value = hook()
                self.cleaned_data[name] = value
            except ValidationError as e:
                self.errors[name] = str(e)
                self.cleaned_data.pop(name, None)
        try:                                               # 3. clean() for the whole form
            self.clean()
        except ValidationError as e:
            self.errors["__all__"] = str(e)
        return not self.errors

    def clean(self):
        pass


class EnquiryForm(Form):
    name = Field()
    age = Field(to_python=int)
    course = Field()
    percentage = Field(to_python=float)

    def clean_name(self):
        name = self.cleaned_data["name"].strip()
        if len(name.split()) < 2:
            raise ValidationError("Please enter first name and last name.")
        return name.title()

    def clean(self):
        if self.cleaned_data.get("course") == "BCA" and self.cleaned_data.get("percentage", 100) < 50:
            raise ValidationError("BCA requires at least 50% in 12th.")


for data in [
    {"name": "asha verma", "age": "19", "course": "BCA", "percentage": "86.5"},
    {"name": "ravi", "age": "abc", "course": "BCA", "percentage": "45"},
    None,
]:
    form = EnquiryForm(data)
    print("bound:", form.is_bound, "| valid:", form.is_valid())
    print("  cleaned:", form.cleaned_data)
    print("  errors :", form.errors)
`,
        },
      },
      result: `bound: True | valid: True
  cleaned: {'name': 'Asha Verma', 'age': 19, 'course': 'BCA', 'percentage': 86.5}
  errors : {}
bound: True | valid: False
  cleaned: {'course': 'BCA', 'percentage': 45.0}
  errors : {'name': 'Please enter first name and last name.', 'age': 'Enter a valid value.', '__all__': 'BCA requires at least 50% in 12th.'}
bound: False | valid: False
  cleaned: {}
  errors : {}`,
      explanation: `Every field is converted first, then its clean_<field> hook runs, then clean() checks cross-field rules using whatever survived. Invalid fields are removed from cleaned_data. An unbound form (None) is never valid and has no errors - which is why the first GET shows an empty form without red messages.`,
    },
  ],
  interview: [
    { q: `What is the difference between a bound and an unbound form?`, a: `A bound form has data (e.g. Form(request.POST)) and can be validated. An unbound form has no data; it is rendered empty (or with initial values) and is_valid() returns False without errors.`, level: 'Easy' },
    { q: `What does is_valid() do?`, a: `Runs the complete validation (field to_python, validators, clean_<field>, clean), fills cleaned_data with converted valid values and errors with messages, and returns True only if there are no errors.`, level: 'Easy' },
    { q: `Explain the order of form validation methods.`, a: `For each field: to_python() -> validate() -> run_validators() -> clean_<fieldname>(). After all fields: form.clean() for cross-field validation. Errors from clean() become non-field errors unless add_error() targets a field.`, level: 'Medium' },
    { q: `What is cleaned_data?`, a: `A dictionary of validated values converted to Python types (int, Decimal, date, bool), available after is_valid(). Always use it instead of raw request.POST.`, level: 'Easy' },
    { q: `Why redirect after a successful POST?`, a: `Post/Redirect/Get prevents duplicate submissions when the user refreshes the page, and gives a clean URL for the result page.`, level: 'Medium' },
    { q: `What is {% csrf_token %} and what happens without it?`, a: `It outputs a hidden input with a secret token that CsrfViewMiddleware checks on POST to prevent Cross-Site Request Forgery. Without it, Django rejects the POST with 403 Forbidden.`, level: 'Easy' },
    { q: `Difference between a field and a widget?`, a: `A field validates and converts data (server logic). A widget renders the HTML input and extracts the raw value from submitted data (presentation).`, level: 'Medium' },
    { q: `How do you show an error on a specific field from clean()?`, a: `Use self.add_error("field_name", "message") inside clean(); raising ValidationError in clean() creates a non-field error instead.`, level: 'Medium' },
    { q: `What happens if clean_email() does not return a value?`, a: `It returns None implicitly, so cleaned_data["email"] becomes None - a common bug. Always return the cleaned value.`, level: 'Medium' },
    { q: `When would you use a GET form instead of POST?`, a: `For searches and filters that do not change data: URLs are bookmarkable/shareable and no CSRF token is needed. Use POST for create/update/delete and sensitive data.`, level: 'Easy' },
    { q: `Is HTML5 browser validation enough?`, a: `No. It can be bypassed (DevTools, curl). Server-side validation in Django forms always runs and is the real protection.`, level: 'Easy' },
    { q: `How do you add a Bootstrap class to all fields?`, a: `In the form's __init__: for field in self.fields.values(): field.widget.attrs["class"] = "form-control"; or use widget attrs, or packages like django-crispy-forms / django-widget-tweaks.`, level: 'Medium' },
  ],
  practice: [
    { task: `Create a ContactForm with name, email, subject (choices: Admission, Fees, Exams) and message (min 20 characters).`, hint: `forms.CharField(min_length=20, widget=forms.Textarea)`, solution: `class ContactForm(forms.Form):\n    name = forms.CharField(max_length=80)\n    email = forms.EmailField()\n    subject = forms.ChoiceField(choices=[("admission", "Admission"), ("fees", "Fees"), ("exams", "Exams")])\n    message = forms.CharField(min_length=20, widget=forms.Textarea(attrs={"rows": 4}))` },
    { task: `Add a clean_email() to AdmissionEnquiryForm that rejects emails ending with "@test.com".`, hint: `endswith + return value.`, solution: `def clean_email(self):\n    email = self.cleaned_data["email"].lower()\n    if email.endswith("@test.com"):\n        raise ValidationError("Please use a real email address.")\n    return email` },
    { task: `Add confirm_email to the form and verify both emails match in clean() with add_error.`, hint: `self.add_error("confirm_email", ...)`, solution: `confirm_email = forms.EmailField()\n\ndef clean(self):\n    cleaned = super().clean()\n    if cleaned.get("email") and cleaned.get("email") != cleaned.get("confirm_email"):\n        self.add_error("confirm_email", "Emails do not match.")\n    return cleaned` },
    { task: `Add the Bootstrap class form-control to every field of AdmissionEnquiryForm (except the checkbox).`, hint: `__init__ loop with isinstance(widget, forms.CheckboxInput).`, solution: `def __init__(self, *args, **kwargs):\n    super().__init__(*args, **kwargs)\n    for field in self.fields.values():\n        if not isinstance(field.widget, forms.CheckboxInput):\n            field.widget.attrs["class"] = "form-control"` },
  ],
  quiz: [
    { question: `Which call creates a bound form?`, options: [`AdmissionEnquiryForm()`, `AdmissionEnquiryForm(request.POST)`, `AdmissionEnquiryForm.bind()`, `forms.bind(AdmissionEnquiryForm)`], answer: 1, explanation: `Passing data makes the form bound.` },
    { question: `Where do you read validated, converted values?`, options: [`form.data`, `request.POST`, `form.cleaned_data`, `form.fields`], answer: 2, explanation: `cleaned_data holds converted Python values after is_valid().` },
    { question: `Which method validates several fields together?`, options: [`clean()`, `clean_<field>()`, `to_python()`, `validate_all()`], answer: 0, explanation: `Form.clean() is for cross-field validation.` },
    { question: `A POST form without {% csrf_token %} results in:`, options: [`200 OK`, `404 Not Found`, `500 Server Error`, `403 Forbidden`], answer: 3, explanation: `CsrfViewMiddleware rejects the request with 403.` },
    { question: `After a successful form submission you should usually:`, options: [`Render the same template again`, `Redirect to another URL`, `Return JsonResponse`, `Raise Http404`], answer: 1, explanation: `Post/Redirect/Get avoids duplicate submissions on refresh.` },
  ],
};
