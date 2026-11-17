export default {
  id: 'day-15-modelforms-crud',
  title: 'ModelForms and CRUD with Forms',
  module: 'Module 3: Forms & Views',
  day: 15,
  level: 'Intermediate',
  duration: '3 hours',
  summary: `Generate forms directly from models with ModelForm and build complete Create, Read, Update and Delete pages for students in the Student Portal using function-based views: list, detail, add, edit (instance=) and delete with confirmation, plus save(commit=False), save_m2m(), unique validation and success messages.`,
  objectives: [
    `Create a ModelForm with Meta.model, fields/exclude, widgets, labels, help_texts and error_messages`,
    `Understand how model fields map to form fields (ForeignKey -> ModelChoiceField, ManyToMany -> ModelMultipleChoiceField)`,
    `Use form.save(), instance= for editing, and save(commit=False) with save_m2m()`,
    `Build full CRUD views, URLs and templates (one shared form template for add and edit)`,
    `Delete safely with a POST confirmation page and show feedback with the messages framework`,
  ],
  theory: [
    {
      heading: `What is a ModelForm?`,
      content: `On Day 14 we wrote every field by hand in forms.Form, then copied cleaned_data into a model. When a form edits a model, that is duplicate work. A ModelForm reads the model and creates the form fields automatically - same types, max_length, choices, required/blank rules, unique checks - and can save directly to the database. Analogy: instead of designing a new admission paper by hand, you photocopy the college register's column headings.`,
      syntax: `from django import forms
from .models import Student

class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ["roll_no", "name", "email", "course", "subjects", "marks"]
        # or fields = "__all__"   (avoid: may expose fields you did not intend)
        # or exclude = ["created_at"]`,
      tip: `Always list fields explicitly. "__all__" can accidentally let users edit fields like is_active or fee_paid (mass-assignment vulnerability).`,
    },
    {
      heading: `Field mapping and Meta options`,
      content: `Each model field becomes the matching form field. Non-editable fields (auto_now, auto_now_add, AutoField) are skipped automatically.`,
      points: [
        `CharField -> CharField (max_length kept); TextField -> CharField with Textarea; EmailField -> EmailField.`,
        `IntegerField/PositiveIntegerField -> IntegerField (min_value=0 for positive); DecimalField -> DecimalField.`,
        `BooleanField -> BooleanField(required=False); DateField -> DateField.`,
        `Field with choices -> TypedChoiceField (a dropdown).`,
        `ForeignKey -> ModelChoiceField (dropdown of Course objects using __str__).`,
        `ManyToManyField -> ModelMultipleChoiceField (multi-select).`,
        `blank=True on the model -> required=False in the form.`,
        `Meta options: widgets, labels, help_texts, error_messages, field_classes.`,
      ],
    },
    {
      heading: `Saving: save(), instance and commit=False`,
      content: `form.save() creates a new object (INSERT) or, if the form was built with instance=obj, updates that object (UPDATE). With commit=False Django returns an unsaved object so you can set extra fields (e.g. created_by=request.user) before saving; then you must call form.save_m2m() yourself because ManyToMany links need the object to exist first.`,
      syntax: `form = StudentForm(request.POST)                    # create
student = form.save()

form = StudentForm(request.POST, instance=student)  # update existing
form.save()

student = form.save(commit=False)                   # unsaved object
student.name = student.name.title()
student.save()
form.save_m2m()                                     # REQUIRED after commit=False when M2M fields exist`,
    },
    {
      heading: `Validation in ModelForms`,
      content: `ModelForm validation = form validation + model validation. After the field checks and your clean_<field>()/clean(), Django calls instance.full_clean() which checks model field validators, choices, and unique / unique_together constraints with a database query. So a duplicate roll_no gives a friendly form error instead of an IntegrityError crash.`,
      points: [
        `Default unique message: "Student with this Roll Number already exists." - customise via Meta.error_messages.`,
        `When editing (instance=...), the unique check excludes the current object, so saving without changes works.`,
        `form.has_changed() and form.changed_data tell you which fields were modified - handy for audit logs.`,
      ],
    },
    {
      heading: `CRUD URL design`,
      content: `A clean, conventional set of URLs for one resource. Delete must use POST - a GET link that deletes data can be triggered by crawlers, link prefetching or a malicious <img src> on another site.`,
      syntax: `students/                 GET        list      student_list
students/add/             GET, POST  create    student_create
students/<int:pk>/        GET        detail    student_detail
students/<int:pk>/edit/   GET, POST  update    student_update
students/<int:pk>/delete/ GET, POST  delete    student_delete (GET = confirm page, POST = delete)`,
      tip: `On Day 17 the same CRUD becomes 4 short class-based views (CreateView, UpdateView, DeleteView). Learn the function-based version first - it shows every step.`,
    },
  ],
  examples: [
    {
      title: `StudentForm (ModelForm) and testing it in the shell`,
      scenario: `Create a ModelForm for the Student model from Day 10 and check what Django generated, how it saves, and how unique validation works.`,
      steps: [
        `Open students/forms.py in VS Code or PyCharm and add StudentForm below the Day 14 forms.`,
        `Run python manage.py shell and paste the shell lines (courses and subjects are loaded from the Day 13 fixture).`,
        `Compare the output.`,
      ],
      code: `# students/forms.py (add)
from .models import Student


class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ["roll_no", "name", "email", "gender", "date_of_birth", "course",
                  "subjects", "marks", "fee_paid", "phone", "is_active"]
        widgets = {
            "date_of_birth": forms.DateInput(attrs={"type": "date"}),
            "subjects": forms.CheckboxSelectMultiple,
        }
        labels = {"fee_paid": "Fee paid (Rs.)"}
        help_texts = {"roll_no": "Format: S followed by 3-4 digits, e.g. S101"}
        error_messages = {"roll_no": {"unique": "This roll number is already taken."}}

    def clean_roll_no(self):
        roll = self.cleaned_data["roll_no"].upper()
        if not (roll.startswith("S") and roll[1:].isdigit()):
            raise forms.ValidationError("Roll number must look like S101.")
        return roll

    def clean_marks(self):
        marks = self.cleaned_data["marks"]
        if marks > 100:
            raise forms.ValidationError("Marks cannot exceed 100.")
        return marks

# python manage.py shell
>>> from students.forms import StudentForm
>>> from students.models import Course
>>> f = StudentForm()
>>> list(f.fields)
>>> f.fields["course"].__class__.__name__, f.fields["subjects"].__class__.__name__
>>> data = {"roll_no": "s101", "name": "Asha Verma", "email": "asha@college.in", "gender": "F",
...         "course": Course.objects.get(code="BCA").pk, "subjects": [1, 3], "marks": 92,
...         "fee_paid": "45000", "is_active": "on"}
>>> f = StudentForm(data)
>>> f.is_valid()
>>> s = f.save()
>>> print(s, s.course, list(s.subjects.values_list("name", flat=True)))
>>> f2 = StudentForm({**data, "roll_no": "S101", "email": "x@college.in", "marks": 120})
>>> f2.is_valid()
>>> for k, v in f2.errors.items(): print(k, "->", v[0])
>>> f3 = StudentForm({**data, "roll_no": "S101", "marks": 95}, instance=s)
>>> f3.is_valid(), f3.has_changed(), f3.changed_data
>>> f3.save().marks`,
      result: `['roll_no', 'name', 'email', 'gender', 'date_of_birth', 'course', 'subjects', 'marks', 'fee_paid', 'phone', 'is_active']
('ModelChoiceField', 'ModelMultipleChoiceField')
True
S101 - Asha Verma BCA ['Python', 'SQL']
False
marks -> Marks cannot exceed 100.
roll_no -> This roll number is already taken.
(True, True, ['marks'])
95`,
      explanation: `created_at/updated_at are not in the form (non-editable). course became a dropdown of Course objects and subjects a multi-select. save() inserted the student AND the two subject links. The unique check on roll_no ran against the database and used our custom message. With instance=s the unique check ignores Asha herself, and save() performed an UPDATE.`,
    },
    {
      title: `Full CRUD views and URLs`,
      scenario: `Build list (from Day 14), detail, add, edit and delete pages for students with success messages.`,
      steps: [
        `Add the views below to students/views.py.`,
        `Replace students/urls.py with the CRUD routes.`,
        `Make sure "django.contrib.messages" is in INSTALLED_APPS and its middleware/context processor are enabled (they are by default).`,
        `Run python manage.py runserver. Visit /students/add/, create a student, edit it, delete it.`,
        `Debug tip: put a breakpoint inside student_update (click in the gutter in VS Code/PyCharm), start the server in Debug mode and inspect form.errors.`,
      ],
      code: `# students/views.py (add)
from django.contrib import messages
from django.shortcuts import get_object_or_404, redirect, render

from .forms import StudentForm
from .models import Student


def student_detail(request, pk):
    student = get_object_or_404(Student.objects.select_related("course"), pk=pk)
    return render(request, "students/student_detail.html", {"student": student})


def student_create(request):
    if request.method == "POST":
        form = StudentForm(request.POST)
        if form.is_valid():
            student = form.save()
            messages.success(request, f"Student {student.name} added successfully.")
            return redirect("students:detail", pk=student.pk)
    else:
        form = StudentForm(initial={"is_active": True})
    return render(request, "students/student_form.html", {"form": form, "title": "Add Student"})


def student_update(request, pk):
    student = get_object_or_404(Student, pk=pk)
    if request.method == "POST":
        form = StudentForm(request.POST, instance=student)
        if form.is_valid():
            form.save()
            messages.success(request, f"Student {student.name} updated.")
            return redirect("students:detail", pk=student.pk)
    else:
        form = StudentForm(instance=student)          # pre-filled with current values
    return render(request, "students/student_form.html",
                  {"form": form, "title": f"Edit {student.name}", "student": student})


def student_delete(request, pk):
    student = get_object_or_404(Student, pk=pk)
    if request.method == "POST":
        name = student.name
        student.delete()
        messages.warning(request, f"Student {name} deleted.")
        return redirect("students:list")
    return render(request, "students/student_confirm_delete.html", {"student": student})

# students/urls.py
from django.urls import path
from . import views

app_name = "students"
urlpatterns = [
    path("", views.student_list, name="list"),
    path("add/", views.student_create, name="create"),
    path("<int:pk>/", views.student_detail, name="detail"),
    path("<int:pk>/edit/", views.student_update, name="update"),
    path("<int:pk>/delete/", views.student_delete, name="delete"),
    path("enquiry/", views.enquiry, name="enquiry"),
    path("enquiry/thanks/", views.enquiry_thanks, name="enquiry_thanks"),
]`,
      result: `GET  /students/add/        -> 200 empty form
POST /students/add/ (valid) -> 302 to /students/1/ ; page shows "Student Asha Verma added successfully."
POST /students/add/ (same roll/email again) -> 200 with errors:
     roll_no: This roll number is already taken.
     email:   Student with this Email already exists.
POST /students/1/edit/ marks=95 -> 302 to /students/1/ ; "Student Asha Verma updated."
GET  /students/1/delete/   -> confirmation page "Delete Asha Verma?"
POST /students/1/delete/   -> 302 to /students/ ; "Student Asha Verma deleted." ; row removed
GET  /students/999/edit/   -> 404`,
      explanation: `Create and update share the same pattern; the only difference is instance=student. get_object_or_404 protects every pk-based view. Delete only happens on POST, after the user confirms. messages are stored in the session/cookie and shown once on the next page.`,
    },
    {
      title: `Templates: shared form, detail, delete confirmation and messages`,
      scenario: `Write the HTML for the CRUD pages, reusing one template for both Add and Edit.`,
      steps: [
        `Add the messages block to templates/base.html (once, for the whole site).`,
        `Create student_form.html, student_detail.html and student_confirm_delete.html in students/templates/students/.`,
        `Add "Add student", "Edit" and "Delete" links to student_list.html.`,
        `Open the pages in the browser and test validation errors by leaving required fields empty.`,
      ],
      code: `<!-- templates/base.html (inside <main>, before the content block) -->
{% if messages %}
  {% for message in messages %}
    <div class="alert alert-{{ message.tags }}">{{ message }}</div>
  {% endfor %}
{% endif %}

<!-- students/templates/students/student_form.html -->
{% extends "base.html" %}
{% block title %}{{ title }}{% endblock %}
{% block content %}
<h1>{{ title }}</h1>
<form method="post" novalidate>
  {% csrf_token %}
  {{ form.non_field_errors }}
  {% for field in form %}
    <div class="form-row">
      {{ field.label_tag }} {{ field }}
      {% if field.help_text %}<small>{{ field.help_text }}</small>{% endif %}
      {% for error in field.errors %}<div class="fail">{{ error }}</div>{% endfor %}
    </div>
  {% endfor %}
  <button type="submit">{% if student %}Update{% else %}Save{% endif %}</button>
  <a href="{% if student %}{% url 'students:detail' student.pk %}{% else %}{% url 'students:list' %}{% endif %}">Cancel</a>
</form>
{% endblock %}

<!-- students/templates/students/student_detail.html -->
{% extends "base.html" %}
{% block content %}
<h1>{{ student.name }} <small>({{ student.roll_no }})</small></h1>
<p>Course: {{ student.course.name }}</p>
<p>Subjects: {{ student.subjects.all|join:", "|default:"None" }}</p>
<p>Marks: {{ student.marks }} - {{ student.result }}</p>
<p>Gender: {{ student.get_gender_display }} | Email: {{ student.email }}</p>
<a href="{% url 'students:update' student.pk %}">Edit</a> |
<a href="{% url 'students:delete' student.pk %}">Delete</a> |
<a href="{% url 'students:list' %}">Back</a>
{% endblock %}

<!-- students/templates/students/student_confirm_delete.html -->
{% extends "base.html" %}
{% block content %}
<h1>Delete student</h1>
<p>Are you sure you want to delete <b>{{ student.name }}</b> ({{ student.roll_no }})? This cannot be undone.</p>
<form method="post">
  {% csrf_token %}
  <button type="submit">Yes, delete</button>
  <a href="{% url 'students:detail' student.pk %}">Cancel</a>
</form>
{% endblock %}

<!-- students/templates/students/student_list.html (add) -->
<a href="{% url 'students:create' %}">+ Add student</a>
...
<td>
  <a href="{% url 'students:update' s.pk %}">Edit</a>
  <a href="{% url 'students:delete' s.pk %}">Delete</a>
</td>

/* static/css/style.css (add) */
.alert { padding: 10px; margin-bottom: 12px; border-radius: 4px; }
.alert-success { background: #dcfce7; }
.alert-warning { background: #fef9c3; }
.form-row { margin-bottom: 10px; }`,
      result: `Add page: inputs for Roll Number (with help text), Name, Email, Gender dropdown, date picker, Course dropdown (BCA/BSC/BCOM),
Subjects checkboxes, Marks, Fee paid (Rs.), Phone, Is active.
Edit page: same template, title "Edit Asha Verma", fields pre-filled, button "Update".
Detail page: "Asha Verma (S101)", Course: Bachelor of Computer Applications, Subjects: Python, SQL, Marks: 95 - Pass.
Green "added/updated" and yellow "deleted" messages appear once at the top.`,
      explanation: `One template serves create and edit because the view passes a different title and (for edit) the student. message.tags gives "success"/"warning", which we use as CSS classes. The delete confirmation is a small POST form with a CSRF token. The full messages framework is covered on Day 18.`,
    },
    {
      title: `save(commit=False) and save_m2m()`,
      scenario: `When a student is added, the roll number is generated automatically (next number) instead of typed, so the form excludes roll_no and the view fills it before saving.`,
      steps: [
        `Create a second ModelForm StudentQuickAddForm without roll_no.`,
        `Write student_quick_add view using commit=False.`,
        `Add path("quick-add/", views.student_quick_add, name="quick_add") and test.`,
      ],
      code: `# students/forms.py
class StudentQuickAddForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ["name", "email", "course", "subjects", "marks"]

# students/views.py
from django.db.models import Max
from .forms import StudentQuickAddForm

def next_roll_no():
    last = Student.objects.aggregate(m=Max("id"))["m"] or 0
    return f"S{1001 + last}"

def student_quick_add(request):
    form = StudentQuickAddForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        student = form.save(commit=False)   # object in memory, NOT in DB yet
        student.roll_no = next_roll_no()
        student.save()                      # INSERT
        form.save_m2m()                     # now save subjects (needs student.id)
        messages.success(request, f"Added {student.name} with roll no {student.roll_no}")
        return redirect("students:detail", pk=student.pk)
    return render(request, "students/student_form.html", {"form": form, "title": "Quick add"})`,
      result: `POST name="Ravi Kumar", course=BSC, subjects=[Python, SQL], marks=76
-> "Added Ravi Kumar with roll no S1002" (when the last id was 1)
-> detail page lists Subjects: Python, SQL`,
      explanation: `commit=False lets you add values that do not come from the user. Forgetting form.save_m2m() is a classic bug: the student is saved but the selected subjects are silently lost. (For heavy concurrency use a database sequence or unique retry logic for roll numbers.)`,
    },
    {
      title: `Pure Python: how a ModelForm creates or updates`,
      scenario: `Build a mini ModelForm that takes its fields from a dataclass "model", validates types and uniqueness, and saves as INSERT (no instance) or UPDATE (instance given).`,
      steps: [
        `Create main.py in VS Code or PyCharm.`,
        `Run python main.py.`,
        `Try creating a second student S102 and print len(DB).`,
      ],
      code: `from dataclasses import dataclass, fields

DB = {}          # pretend table: id -> Student
NEXT_ID = [1]


@dataclass
class Student:
    roll_no: str
    name: str
    marks: int
    id: int = 0

    def save(self):
        if not self.id:                       # no id yet -> INSERT
            self.id = NEXT_ID[0]
            NEXT_ID[0] += 1
            print(f"INSERT id={self.id}")
        else:                                 # has id -> UPDATE
            print(f"UPDATE id={self.id}")
        DB[self.id] = self


class StudentForm:
    """A tiny ModelForm: fields come from the model, save() creates or updates."""
    model = Student
    field_names = [f.name for f in fields(Student) if f.name != "id"]

    def __init__(self, data, instance=None):
        self.data = data
        self.instance = instance
        self.errors = {}
        self.cleaned_data = {}

    def is_valid(self):
        types = {f.name: f.type for f in fields(self.model)}
        for name in self.field_names:
            raw = self.data.get(name, "")
            if raw == "":
                self.errors[name] = "This field is required."
                continue
            try:
                self.cleaned_data[name] = types[name](raw)
            except ValueError:
                self.errors[name] = "Enter a valid value."
        roll = self.cleaned_data.get("roll_no")
        taken = [s for s in DB.values() if s.roll_no == roll and s is not self.instance]
        if taken:
            self.errors["roll_no"] = "Student with this Roll no already exists."
        return not self.errors

    def save(self):
        if self.instance is None:
            self.instance = self.model(**self.cleaned_data)
        else:
            for k, v in self.cleaned_data.items():
                setattr(self.instance, k, v)
        self.instance.save()
        return self.instance


print("fields:", StudentForm.field_names)
f = StudentForm({"roll_no": "S101", "name": "Asha", "marks": "92"})
print(f.is_valid(), f.save())
f = StudentForm({"roll_no": "S101", "name": "Copy", "marks": "x"})
print(f.is_valid(), f.errors)
asha = DB[1]
f = StudentForm({"roll_no": "S101", "name": "Asha Verma", "marks": "95"}, instance=asha)
print(f.is_valid(), f.save())
print("rows in DB:", len(DB))`,
      python: {
        files: {
          'main.py': `from dataclasses import dataclass, fields

DB = {}          # pretend table: id -> Student
NEXT_ID = [1]


@dataclass
class Student:
    roll_no: str
    name: str
    marks: int
    id: int = 0

    def save(self):
        if not self.id:                       # no id yet -> INSERT
            self.id = NEXT_ID[0]
            NEXT_ID[0] += 1
            print(f"INSERT id={self.id}")
        else:                                 # has id -> UPDATE
            print(f"UPDATE id={self.id}")
        DB[self.id] = self


class StudentForm:
    """A tiny ModelForm: fields come from the model, save() creates or updates."""
    model = Student
    field_names = [f.name for f in fields(Student) if f.name != "id"]

    def __init__(self, data, instance=None):
        self.data = data
        self.instance = instance
        self.errors = {}
        self.cleaned_data = {}

    def is_valid(self):
        types = {f.name: f.type for f in fields(self.model)}
        for name in self.field_names:
            raw = self.data.get(name, "")
            if raw == "":
                self.errors[name] = "This field is required."
                continue
            try:
                self.cleaned_data[name] = types[name](raw)
            except ValueError:
                self.errors[name] = "Enter a valid value."
        roll = self.cleaned_data.get("roll_no")
        taken = [s for s in DB.values() if s.roll_no == roll and s is not self.instance]
        if taken:
            self.errors["roll_no"] = "Student with this Roll no already exists."
        return not self.errors

    def save(self):
        if self.instance is None:
            self.instance = self.model(**self.cleaned_data)
        else:
            for k, v in self.cleaned_data.items():
                setattr(self.instance, k, v)
        self.instance.save()
        return self.instance


print("fields:", StudentForm.field_names)
f = StudentForm({"roll_no": "S101", "name": "Asha", "marks": "92"})
print(f.is_valid(), f.save())
f = StudentForm({"roll_no": "S101", "name": "Copy", "marks": "x"})
print(f.is_valid(), f.errors)
asha = DB[1]
f = StudentForm({"roll_no": "S101", "name": "Asha Verma", "marks": "95"}, instance=asha)
print(f.is_valid(), f.save())
print("rows in DB:", len(DB))
`,
        },
      },
      result: `fields: ['roll_no', 'name', 'marks']
INSERT id=1
True Student(roll_no='S101', name='Asha', marks=92, id=1)
False {'marks': 'Enter a valid value.', 'roll_no': 'Student with this Roll no already exists.'}
UPDATE id=1
True Student(roll_no='S101', name='Asha Verma', marks=95, id=1)
rows in DB: 1`,
      explanation: `Fields are read from the model definition (like Meta.model + fields). Without an instance, save() builds a new object and INSERTs; with instance=asha it updates the same object, and the uniqueness check skips the instance itself - exactly why editing a student without changing the roll number does not raise "already exists" in Django.`,
    },
  ],
  interview: [
    { q: `What is a ModelForm and how is it different from a Form?`, a: `A ModelForm automatically generates form fields from a model (types, lengths, choices, required) and can save to the database with save(). A plain Form defines fields manually and has no save(); you handle cleaned_data yourself.`, level: 'Easy' },
    { q: `Why is fields = "__all__" discouraged?`, a: `New model fields become editable automatically, which can expose sensitive fields (is_staff, fee_paid) to users - a mass-assignment security risk. Listing fields explicitly is safer.`, level: 'Medium' },
    { q: `How do you edit an existing object with a ModelForm?`, a: `Pass instance=obj: StudentForm(request.POST, instance=student) on POST and StudentForm(instance=student) on GET to pre-fill. form.save() then performs an UPDATE.`, level: 'Easy' },
    { q: `What does save(commit=False) do?`, a: `Returns a model instance populated from the form without saving it, so you can set extra attributes before calling instance.save(). If the form has ManyToMany fields you must then call form.save_m2m().`, level: 'Medium' },
    { q: `Why is save_m2m() needed after commit=False?`, a: `ManyToMany links require the object's primary key. With commit=False the object is not yet saved, so Django defers the M2M data; save_m2m() writes it after you save the object.`, level: 'Medium' },
    { q: `How does a ModelForm validate unique fields?`, a: `In _post_clean it calls instance.full_clean(), including validate_unique(), which queries the database for duplicates (excluding the current instance when editing) and adds form errors.`, level: 'Hard' },
    { q: `Which form field does a ForeignKey become?`, a: `ModelChoiceField (a select of related objects using __str__); ManyToManyField becomes ModelMultipleChoiceField.`, level: 'Easy' },
    { q: `Why should delete views only delete on POST?`, a: `GET requests must be safe (no side effects). A GET delete could be triggered by crawlers, prefetching, or a malicious link/image (CSRF). POST requires a CSRF token and an explicit user action.`, level: 'Medium' },
    { q: `How do you customise a widget or label in a ModelForm?`, a: `Use Meta.widgets = {"field": forms.Textarea(...)}, Meta.labels, Meta.help_texts, Meta.error_messages, or override the field declaratively in the form class.`, level: 'Easy' },
    { q: `How can you limit the choices of a ForeignKey dropdown in a ModelForm?`, a: `In __init__: self.fields["course"].queryset = Course.objects.filter(is_active=True) (or based on the logged-in user passed into the form).`, level: 'Hard' },
    { q: `What do form.has_changed() and form.changed_data return?`, a: `has_changed() is True if any submitted value differs from the initial data; changed_data is the list of field names that changed.`, level: 'Medium' },
  ],
  practice: [
    { task: `Create a CourseForm (ModelForm) and add/edit views for courses at /courses/add/ and /courses/<pk>/edit/.`, hint: `Same pattern as student_create/student_update.`, solution: `class CourseForm(forms.ModelForm):\n    class Meta:\n        model = Course\n        fields = ["code", "name", "duration_years"]\n\ndef course_create(request):\n    form = CourseForm(request.POST or None)\n    if request.method == "POST" and form.is_valid():\n        form.save()\n        return redirect("students:list")\n    return render(request, "students/student_form.html", {"form": form, "title": "Add Course"})\n\ndef course_update(request, pk):\n    course = get_object_or_404(Course, pk=pk)\n    form = CourseForm(request.POST or None, instance=course)\n    if request.method == "POST" and form.is_valid():\n        form.save()\n        return redirect("students:list")\n    return render(request, "students/student_form.html", {"form": form, "title": f"Edit {course.code}"})` },
    { task: `In StudentForm, show only courses whose duration is 3 years in the course dropdown.`, hint: `Override __init__ and set the queryset.`, solution: `def __init__(self, *args, **kwargs):\n    super().__init__(*args, **kwargs)\n    self.fields["course"].queryset = Course.objects.filter(duration_years=3).order_by("code")` },
    { task: `Add a clean() to StudentForm: if the course is BCOM, the subject "Python" must not be selected.`, hint: `cleaned.get("subjects") is a QuerySet of Subject objects.`, solution: `def clean(self):\n    cleaned = super().clean()\n    course = cleaned.get("course")\n    subjects = cleaned.get("subjects") or []\n    if course and course.code == "BCOM" and any(s.name == "Python" for s in subjects):\n        self.add_error("subjects", "Python is not offered for BCOM.")\n    return cleaned` },
    { task: `Make the delete view refuse to delete students with marks >= 90 (toppers) and show an error message.`, hint: `messages.error and redirect to detail.`, solution: `def student_delete(request, pk):\n    student = get_object_or_404(Student, pk=pk)\n    if student.marks >= 90:\n        messages.error(request, "Toppers cannot be deleted.")\n        return redirect("students:detail", pk=pk)\n    ...rest of the view...` },
  ],
  quiz: [
    { question: `Which inner class configures a ModelForm?`, options: [`class Config`, `class Meta`, `class Model`, `class Options`], answer: 1, explanation: `ModelForm options go in class Meta (model, fields, widgets...).` },
    { question: `To update an existing student you create the form with:`, options: [`StudentForm(request.POST, instance=student)`, `StudentForm(request.POST, pk=student.pk)`, `StudentForm(student)`, `StudentForm.update(student)`], answer: 0, explanation: `instance= makes save() update that object.` },
    { question: `After form.save(commit=False) and obj.save(), what else is needed when the form has M2M fields?`, options: [`form.commit()`, `obj.refresh_from_db()`, `Nothing`, `form.save_m2m()`], answer: 3, explanation: `save_m2m() saves the deferred many-to-many data.` },
    { question: `A ForeignKey field appears in a ModelForm as:`, options: [`CharField`, `IntegerField`, `ModelChoiceField`, `MultipleChoiceField`], answer: 2, explanation: `ForeignKey maps to ModelChoiceField (dropdown of related objects).` },
    { question: `The safest way to delete a record from a view is:`, options: [`A GET link that deletes immediately`, `A POST form with CSRF token after confirmation`, `A JavaScript alert only`, `Deleting in the template`], answer: 1, explanation: `Deletion changes data, so it must use POST with CSRF protection.` },
  ],
};
