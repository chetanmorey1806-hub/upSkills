export default {
  id: "day-04-forms-flask-wtf-flash",
  title: "Forms: request.form, Flask-WTF, Validation, Flash Messages",
  module: "Module 1: Flask Basics",
  day: 4,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Handle HTML forms with request.form, then upgrade to Flask-WTF for class-based forms, built-in and custom validators, CSRF protection and file uploads, and give users feedback with flash messages.",
  objectives: [
    "Read submitted form data with request.form and validate it manually",
    "Install Flask-WTF and define forms as FlaskForm classes with fields and validators",
    "Use form.validate_on_submit(), render fields and errors in Jinja2, and understand CSRF tokens",
    "Write custom validators (inline validate_<field> and reusable functions)",
    "Show one-time feedback with flash() and get_flashed_messages() using categories",
  ],
  theory: [
    {
      heading: "HTML Forms and request.form",
      content: "An HTML form collects user input and sends it to the server. method='post' sends data in the request body; action is the URL that receives it (empty means the same URL). Every input needs a name attribute - that name becomes the key in request.form, which is a MultiDict (a dict that can hold several values per key). Use request.form.get('email') for safe reading and request.form.getlist('skills') for checkboxes with the same name. Uploaded files arrive in request.files and require enctype='multipart/form-data' on the form.",
      syntax: "<form method=\"post\">\n  <input name=\"email\">\n  <button type=\"submit\">Send</button>\n</form>\n\nemail = request.form.get('email', '').strip()",
      points: [
        "request.form['x'] raises 400 Bad Request if x is missing; .get() returns None",
        "Always validate on the server - browser 'required' attributes can be bypassed",
        "Strip whitespace and convert types (int(), float()) yourself",
        "After success, redirect (PRG pattern) so refresh does not resubmit",
      ],
    },
    {
      heading: "Flask-WTF: Forms as Python Classes",
      content: "Manual validation gets long and repetitive. Flask-WTF integrates the WTForms library with Flask. You describe a form once as a class: each attribute is a field (StringField, PasswordField, EmailField, IntegerField, SelectField, BooleanField, TextAreaField, FileField, SubmitField) with a list of validators. The same class then renders the HTML input, re-fills values after an error, validates input and protects against CSRF. Analogy: a bank form with printed rules - 'PAN must be 10 characters' - the clerk (validator) checks each box against the rules.",
      syntax: "pip install Flask-WTF email-validator\n\nclass RegisterForm(FlaskForm):\n    name = StringField('Name', validators=[DataRequired(), Length(min=3)])\n    submit = SubmitField('Register')",
      points: [
        "Validators: DataRequired, InputRequired, Email (needs email-validator), Length, NumberRange, EqualTo, Regexp, Optional, URL, AnyOf",
        "form.validate_on_submit() = request is POST/PUT/PATCH/DELETE AND all validators pass",
        "form.field.data holds the converted value; form.field.errors holds error messages",
        "form.populate_obj(obj) copies data onto a model object (useful on Day 6)",
      ],
    },
    {
      heading: "CSRF Protection and SECRET_KEY",
      content: "Cross-Site Request Forgery (CSRF) tricks a logged-in user's browser into submitting a form to your site from another site (for example, a hidden form that transfers money). Flask-WTF defends by putting a secret random token in a hidden field ({{ form.hidden_tag() }} or {{ form.csrf_token }}); the POST is accepted only if the token matches the one signed into the user's session. Signing needs app.config['SECRET_KEY'] - a long random string. Without it you get 'A secret key is required to use CSRF'. For plain HTML forms or AJAX, enable CSRFProtect(app) and send csrf_token() manually.",
      points: [
        "Generate a key: python -c \"import secrets; print(secrets.token_hex(32))\"",
        "Never commit the real SECRET_KEY to Git; load it from an environment variable (Day 11)",
        "'The CSRF token is missing' error = you forgot {{ form.hidden_tag() }} in the template",
        "In unit tests set WTF_CSRF_ENABLED = False",
      ],
    },
    {
      heading: "Custom Validators",
      content: "When built-in validators are not enough, write your own. Inline validator: add a method named validate_<fieldname>(self, field) to the form class; raise ValidationError('message') if invalid. Reusable validator: write a function (form, field) or a factory that returns such a function, and add it to the validators list. Example uses: username already taken, password must contain a digit, date must be in the future. Override validate() for checks that involve many fields.",
      syntax: "def validate_username(self, field):\n    if field.data.lower() in TAKEN:\n        raise ValidationError('Username already taken.')",
    },
    {
      heading: "Flash Messages",
      content: "A flash message is a one-time notification stored in the session and shown on the NEXT request - perfect after a redirect: 'Profile saved!' Call flash('message', 'category') in the view, and in base.html loop over get_flashed_messages(with_categories=true). Once read, messages are removed. Categories (success, danger, warning, info) map nicely to CSS or Bootstrap alert classes. Flash needs SECRET_KEY because it uses the session.",
      syntax: "flash('Account created!', 'success')\nreturn redirect(url_for('home'))",
      points: [
        "Messages survive exactly one redirect and then disappear",
        "Put the flash loop in base.html so every page can show messages",
        "Keep messages short; do not put sensitive data in them (session cookies are readable)",
      ],
    },
  ],
  examples: [
    {
      title: "Manual form handling with request.form and flash",
      scenario: "A contact form must reject empty names and short messages, and show success or error notifications.",
      steps: [
        "Create the project tree below in VS Code or PyCharm and activate the .venv",
        "pip install Flask",
        "Paste app.py, base.html and contact.html",
        "Run flask --app app run --debug and open /contact",
        "Submit empty, then valid data, and watch the flash messages",
      ],
      code: `# Project tree
contact_app/
├── app.py
└── templates/
    ├── base.html
    └── contact.html

# ---- app.py ----
from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.config["SECRET_KEY"] = "change-me-in-production"   # needed for flash


@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        message = request.form.get("message", "").strip()
        errors = []
        if not name:
            errors.append("Name is required.")
        if len(message) < 10:
            errors.append("Message must be at least 10 characters.")
        if errors:
            for e in errors:
                flash(e, "danger")
            # re-render with old values so the user does not retype
            return render_template("contact.html", name=name, message=message), 400
        flash(f"Thanks {name}, we received your message!", "success")
        return redirect(url_for("contact"))
    return render_template("contact.html", name="", message="")


# ---- templates/base.html ----
<!DOCTYPE html>
<html>
<head>
  <title>{% block title %}Forms Demo{% endblock %}</title>
  <style>
    .alert { padding: 8px; margin: 6px 0; border-radius: 4px; }
    .alert-success { background: #dcfce7; } .alert-danger { background: #fee2e2; }
  </style>
</head>
<body>
  {% with messages = get_flashed_messages(with_categories=true) %}
    {% for category, msg in messages %}
      <div class="alert alert-{{ category }}">{{ msg }}</div>
    {% endfor %}
  {% endwith %}
  {% block content %}{% endblock %}
</body>
</html>

# ---- templates/contact.html ----
{% extends "base.html" %}
{% block content %}
<h1>Contact Us</h1>
<form method="post">
  <input name="name" value="{{ name }}" placeholder="Your name"><br>
  <textarea name="message" placeholder="Message">{{ message }}</textarea><br>
  <button type="submit">Send</button>
</form>
{% endblock %}`,
      result: `Submit empty form:
[red]   Name is required.
[red]   Message must be at least 10 characters.
(status 400, form shown again)

Submit name=Asha, message='I want to join the Flask batch':
[green] Thanks Asha, we received your message!
(after redirect; refresh -> message disappears)`,
      explanation: "request.form.get reads fields safely. On error we re-render (not redirect) so the typed values stay. On success we flash and redirect; the flash is shown once on the next GET.",
    },
    {
      title: "Registration form with Flask-WTF, validators and CSRF",
      scenario: "Build a student registration form with name, email, age, course choice, password and confirm password.",
      steps: [
        "Create the project tree below (VS Code: Explorer; PyCharm: right-click > New)",
        "Run pip install Flask Flask-WTF email-validator and then pip freeze > requirements.txt",
        "Paste forms.py, app.py and templates (reuse base.html from the previous example)",
        "Run flask --app app run --debug and open /register",
        "Submit invalid data to see field errors, then valid data to see the success flash",
        "View page source in the browser to see the hidden csrf_token input",
      ],
      code: `# Project tree
wtf_app/
├── app.py
├── forms.py
├── requirements.txt
└── templates/
    ├── base.html
    ├── _field.html
    └── register.html

# ---- requirements.txt ----
Flask==3.0.3
Flask-WTF==1.2.1
WTForms==3.1.2
email-validator==2.2.0

# ---- forms.py ----
from flask_wtf import FlaskForm
from wtforms import (StringField, EmailField, IntegerField, SelectField,
                     PasswordField, BooleanField, SubmitField)
from wtforms.validators import (DataRequired, Email, Length, NumberRange,
                                EqualTo, ValidationError)

TAKEN_USERNAMES = {"admin", "root", "test"}


def must_contain_digit(form, field):
    if not any(ch.isdigit() for ch in field.data or ""):
        raise ValidationError("Password must contain at least one digit.")


class RegisterForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired(), Length(min=3, max=20)])
    email = EmailField("Email", validators=[DataRequired(), Email()])
    age = IntegerField("Age", validators=[DataRequired(), NumberRange(min=18, max=60)])
    course = SelectField("Course", choices=[("py", "Python"), ("fl", "Flask"), ("dj", "Django")])
    password = PasswordField("Password", validators=[DataRequired(), Length(min=8), must_contain_digit])
    confirm = PasswordField("Confirm Password",
                            validators=[DataRequired(), EqualTo("password", message="Passwords must match.")])
    agree = BooleanField("I accept the terms", validators=[DataRequired()])
    submit = SubmitField("Register")

    # inline validator: validate_<fieldname>
    def validate_username(self, field):
        if field.data.lower() in TAKEN_USERNAMES:
            raise ValidationError("Username already taken.")


# ---- app.py ----
from flask import Flask, render_template, redirect, url_for, flash
from forms import RegisterForm

app = Flask(__name__)
app.config["SECRET_KEY"] = "a-long-random-secret-key"


@app.route("/register", methods=["GET", "POST"])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        # form.<field>.data contains clean, converted values
        flash(f"Welcome {form.username.data}! Registered for {dict(form.course.choices)[form.course.data]}.", "success")
        return redirect(url_for("register"))
    return render_template("register.html", form=form)


# ---- templates/_field.html ----
{% macro render_field(field) %}
  <p>
    {{ field.label }}<br>
    {{ field(class_="form-control", placeholder=field.label.text) }}
    {% for error in field.errors %}
      <br><small style="color:red">{{ error }}</small>
    {% endfor %}
  </p>
{% endmacro %}

# ---- templates/register.html ----
{% extends "base.html" %}
{% from "_field.html" import render_field %}
{% block content %}
<h1>Student Registration</h1>
<form method="post" novalidate>
  {{ form.hidden_tag() }}
  {{ render_field(form.username) }}
  {{ render_field(form.email) }}
  {{ render_field(form.age) }}
  {{ render_field(form.course) }}
  {{ render_field(form.password) }}
  {{ render_field(form.confirm) }}
  <p>{{ form.agree() }} {{ form.agree.label }}</p>
  {% for e in form.agree.errors %}<small style="color:red">{{ e }}</small>{% endfor %}
  {{ form.submit() }}
</form>
{% endblock %}`,
      result: `Submit: username=admin, email=abc, age=15, password=short, confirm=x
Username        -> Username already taken.
Email           -> Invalid email address.
Age             -> Number must be between 18 and 60.
Password        -> Field must be at least 8 characters long.
                   Password must contain at least one digit.
Confirm         -> Passwords must match.
I accept terms  -> This field is required.

Submit valid data (asha / asha@mail.com / 21 / Flask / flask2026 / flask2026 / ticked):
[green] Welcome asha! Registered for Flask.

Page source contains:
<input id="csrf_token" name="csrf_token" type="hidden" value="IjM4...">`,
      explanation: "validate_on_submit runs every validator only on POST. Errors are attached to each field and rendered by the macro. hidden_tag() outputs the CSRF token; without it every POST fails with 'The CSRF token is missing.' novalidate disables browser checks so you can see server-side errors.",
    },
    {
      title: "File upload with FileField and FileAllowed",
      scenario: "Students upload a profile photo (jpg/png only, max 2 MB).",
      steps: [
        "In the wtf_app project create an uploads folder",
        "Add the form and route below to forms.py and app.py",
        "Create templates/upload.html",
        "Run the app and upload a .png, then try a .pdf",
      ],
      code: `# ---- forms.py (add) ----
from flask_wtf.file import FileField, FileRequired, FileAllowed


class PhotoForm(FlaskForm):
    photo = FileField("Photo", validators=[FileRequired(), FileAllowed(["jpg", "jpeg", "png"], "Images only!")])
    submit = SubmitField("Upload")


# ---- app.py (add) ----
import os
from werkzeug.utils import secure_filename
from forms import PhotoForm

app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path, "uploads")
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024   # 2 MB -> 413 if bigger


@app.route("/upload", methods=["GET", "POST"])
def upload():
    form = PhotoForm()
    if form.validate_on_submit():
        f = form.photo.data
        filename = secure_filename(f.filename)          # '../../evil.png' -> 'evil.png'
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
        f.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        flash(f"Uploaded {filename}", "success")
        return redirect(url_for("upload"))
    return render_template("upload.html", form=form)


# ---- templates/upload.html ----
{% extends "base.html" %}
{% block content %}
<form method="post" enctype="multipart/form-data">
  {{ form.hidden_tag() }}
  {{ form.photo() }}
  {% for e in form.photo.errors %}<small style="color:red">{{ e }}</small>{% endfor %}
  {{ form.submit() }}
</form>
{% endblock %}`,
      result: `Upload my photo.png   -> [green] Uploaded my_photo.png (file saved in uploads/)
Upload resume.pdf     -> Images only!
Upload 5 MB image     -> 413 Request Entity Too Large`,
      explanation: "enctype='multipart/form-data' is mandatory for files. secure_filename removes dangerous path parts and spaces. MAX_CONTENT_LENGTH rejects big uploads before your code runs.",
    },
    {
      title: "Pure Python demo: what a validator does",
      scenario: "Re-create the logic of DataRequired, Length, Email and NumberRange to understand form validation.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `import re

EMAIL_RE = re.compile(r"^[^@ ]+@[^@ ]+[.][a-z]+$")


def validate(form):
    errors = {}
    name = form.get("name", "").strip()
    email = form.get("email", "").strip()
    age = form.get("age", "").strip()
    if not name:
        errors["name"] = "This field is required."
    elif len(name) < 3:
        errors["name"] = "Field must be at least 3 characters long."
    if not EMAIL_RE.match(email):
        errors["email"] = "Invalid email address."
    if not age.isdigit() or not 18 <= int(age) <= 60:
        errors["age"] = "Age must be between 18 and 60."
    return errors


forms = [
    {"name": "Asha", "email": "asha@example.com", "age": "21"},
    {"name": "Al", "email": "al-at-mail", "age": "15"},
]
for form in forms:
    errors = validate(form)
    if errors:
        print("Flash (danger):", errors)
    else:
        print("Flash (success): Welcome,", form["name"])`,
      python: { files: { "main.py": `import re

EMAIL_RE = re.compile(r"^[^@ ]+@[^@ ]+[.][a-z]+$")


def validate(form):
    errors = {}
    name = form.get("name", "").strip()
    email = form.get("email", "").strip()
    age = form.get("age", "").strip()
    if not name:
        errors["name"] = "This field is required."
    elif len(name) < 3:
        errors["name"] = "Field must be at least 3 characters long."
    if not EMAIL_RE.match(email):
        errors["email"] = "Invalid email address."
    if not age.isdigit() or not 18 <= int(age) <= 60:
        errors["age"] = "Age must be between 18 and 60."
    return errors


forms = [
    {"name": "Asha", "email": "asha@example.com", "age": "21"},
    {"name": "Al", "email": "al-at-mail", "age": "15"},
]
for form in forms:
    errors = validate(form)
    if errors:
        print("Flash (danger):", errors)
    else:
        print("Flash (success): Welcome,", form["name"])` } },
      result: `Flash (success): Welcome, Asha
Flash (danger): {'name': 'Field must be at least 3 characters long.', 'email': 'Invalid email address.', 'age': 'Age must be between 18 and 60.'}`,
      explanation: "Each rule checks one field and stores an error message by field name - exactly what WTForms puts into form.errors. If the errors dict is empty the form is valid.",
    },
  ],
  interview: [
    { q: "How do you access form data in Flask?", a: "request.form (a MultiDict) for form fields, request.files for uploads, request.args for query strings. Use .get() to avoid a 400 error on missing keys and .getlist() for multiple values.", level: "Easy" },
    { q: "What is Flask-WTF and why use it?", a: "An extension integrating WTForms with Flask. It gives class-based forms, field rendering, validation, error messages, file upload helpers and CSRF protection, reducing repetitive manual validation.", level: "Easy" },
    { q: "What does validate_on_submit() do?", a: "It returns True only if the request is a submission (POST, PUT, PATCH or DELETE) and form.validate() passes all validators including the CSRF check.", level: "Medium" },
    { q: "What is CSRF and how does Flask-WTF prevent it?", a: "Cross-Site Request Forgery makes a victim's browser submit an unwanted request to a site where they are logged in. Flask-WTF adds a signed random token in a hidden field and rejects submissions without the matching token.", level: "Medium" },
    { q: "Why is SECRET_KEY required for forms and flash?", a: "It is used to sign the session cookie and the CSRF token. Without it Flask cannot store flash messages in the session or create CSRF tokens.", level: "Medium" },
    { q: "How do you write a custom validator in WTForms?", a: "Either a method validate_<fieldname>(self, field) on the form, or a function (form, field) added to the validators list. Raise wtforms.validators.ValidationError with a message when invalid.", level: "Medium" },
    { q: "Difference between DataRequired and InputRequired?", a: "DataRequired checks the processed data is truthy (so 0 or whitespace fails); InputRequired checks that raw input was provided. For IntegerField where 0 is valid, use InputRequired.", level: "Hard" },
    { q: "What are flash messages and how long do they live?", a: "One-time messages stored in the session by flash() and read with get_flashed_messages(); they are removed after being read, usually on the next request after a redirect.", level: "Easy" },
    { q: "Why use secure_filename for uploads?", a: "It removes path separators and unsafe characters so a filename like '../../etc/passwd' cannot write outside the upload folder (path traversal).", level: "Medium" },
    { q: "Why re-render the template instead of redirecting when validation fails?", a: "Re-rendering keeps the submitted values and error messages in the form object. Redirecting would lose them. Redirect only after success.", level: "Medium" },
    { q: "What happens if MAX_CONTENT_LENGTH is exceeded?", a: "Werkzeug raises RequestEntityTooLarge and Flask returns 413 before the view processes the data.", level: "Hard" },
  ],
  practice: [
    {
      task: "Create a LoginForm with email (required, valid email), password (required, min 6) and remember_me checkbox.",
      hint: "EmailField, PasswordField, BooleanField.",
      solution: `from flask_wtf import FlaskForm
from wtforms import EmailField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Email, Length


class LoginForm(FlaskForm):
    email = EmailField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired(), Length(min=6)])
    remember_me = BooleanField("Remember me")
    submit = SubmitField("Login")`,
    },
    {
      task: "Write a reusable validator factory no_spaces(message) and use it on a username field.",
      hint: "Return an inner function _check(form, field).",
      solution: `from wtforms.validators import ValidationError


def no_spaces(message="Spaces are not allowed."):
    def _check(form, field):
        if " " in (field.data or ""):
            raise ValidationError(message)
    return _check


class ProfileForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired(), no_spaces()])`,
    },
    {
      task: "Add a feedback form with a SelectField rating (1-5) coerced to int and flash 'Thanks for rating N stars'.",
      hint: "SelectField(coerce=int, choices=[(i, str(i)) for i in range(1, 6)])",
      solution: `class FeedbackForm(FlaskForm):
    rating = SelectField("Rating", coerce=int, choices=[(i, str(i)) for i in range(1, 6)])
    submit = SubmitField("Send")


@app.route("/feedback", methods=["GET", "POST"])
def feedback():
    form = FeedbackForm()
    if form.validate_on_submit():
        flash(f"Thanks for rating {form.rating.data} stars", "success")
        return redirect(url_for("feedback"))
    return render_template("feedback.html", form=form)`,
    },
    {
      task: "Show flash messages as Bootstrap 5 dismissible alerts in base.html.",
      hint: "Use category as the alert-* class.",
      solution: `{% with messages = get_flashed_messages(with_categories=true) %}
  {% for category, msg in messages %}
    <div class="alert alert-{{ category }} alert-dismissible fade show" role="alert">
      {{ msg }}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  {% endfor %}
{% endwith %}`,
    },
  ],
  quiz: [
    {
      question: "Which template call outputs the CSRF hidden field in Flask-WTF?",
      options: ["{{ csrf() }}", "{{ form.hidden_tag() }}", "{{ form.secret }}", "{{ request.csrf }}"],
      answer: 1,
      explanation: "hidden_tag() renders all hidden fields including csrf_token.",
    },
    {
      question: "form.validate_on_submit() returns True when...",
      options: ["the request is a valid POST and all validators pass", "the page is opened with GET", "the form has a submit button", "SECRET_KEY is set"],
      answer: 0,
      explanation: "It combines 'is submitted' and 'validate()'.",
    },
    {
      question: "Which validator compares two password fields?",
      options: ["Length", "Regexp", "AnyOf", "EqualTo"],
      answer: 3,
      explanation: "EqualTo('password') checks the field equals another field.",
    },
    {
      question: "Which form attribute is required for file uploads?",
      options: ["method='get'", "action='upload'", "enctype='multipart/form-data'", "accept='files'"],
      answer: 2,
      explanation: "Without multipart encoding request.files is empty.",
    },
    {
      question: "Where are flash messages stored between requests?",
      options: ["In the session", "In the database", "In a global list", "In request.args"],
      answer: 0,
      explanation: "flash() appends to session['_flashes'], so SECRET_KEY is required.",
    },
  ],
};
