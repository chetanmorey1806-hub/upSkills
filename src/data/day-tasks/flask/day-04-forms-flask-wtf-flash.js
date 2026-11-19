export default {
  lesson: 'day-04-forms-flask-wtf-flash',
  minutes: 30,
  intro: 'Practise request.form, Flask-WTF forms, validators, CSRF and flash messages, then write the validation logic a form class runs for you.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'An HTML form posts a field `<input name="email">`. How do you read it safely in a Flask view (no error if it is missing)?',
      options: ["request.args['email']", "request.form.get('email')", "request.json['email']", "request.email"],
      answer: 1,
      explain: 'POSTed form fields are in **`request.form`**; `.get(\'email\')` returns `None` instead of raising a 400 error when the field is missing. `request.args` is the **query string** (`?email=...`) and `request.json` is for JSON bodies.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the `if` so the block runs only when the form was **POSTed and passed all validators**:\n\n```\nform = EnquiryForm()\nif ______:\n    flash(\'Enquiry sent!\', \'success\')\n    return redirect(url_for(\'home\'))\nreturn render_template(\'enquiry.html\', form=form)\n```',
      accept: ['form.validate_on_submit()'],
      explain: '`form.validate_on_submit()` = "is this a POST **and** are all validators (including the CSRF token) OK?". On a GET it returns False, so the empty form is shown. Calling `form.validate()` alone would also run on GET and show errors before the user typed anything.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about Flask-WTF, CSRF and flash are TRUE? (choose all that apply)',
      options: [
        'Flask-WTF needs app.config["SECRET_KEY"] to sign the CSRF token',
        'Every POST form template must include {{ form.hidden_tag() }} (or form.csrf_token)',
        'A flash message is shown on every page until the user logs out',
        'flash("Saved", "success") stores a category that the template can use as a CSS class',
        'CSRF protection stops SQL injection',
      ],
      answers: [0, 1, 3],
      explain: 'The CSRF token is a signed hidden field; without `SECRET_KEY` it cannot be created, and without `hidden_tag()` in the template every submit fails validation. Flash messages are **one-time**: they are shown on the next request and then removed. CSRF protects against forged cross-site form posts, not SQL injection.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'This view validates a form manually. What does the program print?',
      code: `from flask import Flask, request

app = Flask(__name__)

@app.post('/register')
def register():
    errors = []
    name = request.form.get('name', '').strip()
    age = request.form.get('age', '')
    if not name:
        errors.append('Name is required')
    if not age.isdigit() or int(age) < 16:
        errors.append('Age must be 16+')
    if errors:
        return ', '.join(errors), 400
    return f'Welcome {name}', 201

c = app.test_client()
r1 = c.post('/register', data={'name': '  ', 'age': '15'})
r2 = c.post('/register', data={'name': 'Meera', 'age': '19'})
print(r1.status_code, r1.get_data(as_text=True))
print(r2.status_code, r2.get_data(as_text=True))`,
      expected: '400 Name is required, Age must be 16+\n201 Welcome Meera',
      explain: '`\'  \'.strip()` is an empty string, so the name check fails, and 15 < 16 fails the age check: both errors are joined and the view returns a **(body, status)** tuple with 400. The second request passes and returns 201.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write `validate_enquiry(data)` - the checks a FlaskForm with validators would run. `data` is a dict of strings. Return a dict `{field: message}` of errors (empty dict = valid):\n- `name`: required (after strip) → `\'This field is required.\'`; at least 3 characters → `\'Name must be at least 3 characters.\'`\n- `email`: must contain `@` and a `.` after the `@` → `\'Invalid email address.\'`\n- `phone`: exactly 10 digits → `\'Enter a 10-digit mobile number.\'`',
      example: { title: 'collecting errors in a dict', code: "errors = {}\nif not data.get('city', '').strip():\n    errors['city'] = 'This field is required.'\nreturn errors" },
      starter: `def validate_enquiry(data):
    errors = {}
    # TODO: name, email, phone
    return errors
`,
      solution: `def validate_enquiry(data):
    errors = {}
    name = data.get('name', '').strip()
    if not name:
        errors['name'] = 'This field is required.'
    elif len(name) < 3:
        errors['name'] = 'Name must be at least 3 characters.'
    email = data.get('email', '').strip()
    at = email.find('@')
    if at < 1 or '.' not in email[at + 1:]:
        errors['email'] = 'Invalid email address.'
    phone = data.get('phone', '').strip()
    if not (phone.isdigit() and len(phone) == 10):
        errors['phone'] = 'Enter a 10-digit mobile number.'
    return errors
`,
      tests: [
        { call: "validate_enquiry({'name': 'Asha Patil', 'email': 'asha@gmail.com', 'phone': '9876543210'})", expect: {} },
        { call: "validate_enquiry({'name': '  ', 'email': 'asha@gmail.com', 'phone': '9876543210'})", expect: { name: 'This field is required.' } },
        { call: "validate_enquiry({'name': 'Al', 'email': 'al.gmail.com', 'phone': '98765'})", expect: { name: 'Name must be at least 3 characters.', email: 'Invalid email address.', phone: 'Enter a 10-digit mobile number.' } },
        { call: "validate_enquiry({'name': 'Ravi', 'email': 'ravi@mail', 'phone': '98765abc10'})", expect: { email: 'Invalid email address.', phone: 'Enter a 10-digit mobile number.' } },
      ],
      explain: 'This is what `DataRequired()`, `Length(min=3)`, `Email()` and a custom phone validator do in a FlaskForm: each field collects its own error in `form.errors` (a dict). Note the `elif`: once "required" fails there is no point checking the length. Always `strip()` first, otherwise a name of spaces passes.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Flash messages are stored in a list and removed once read. Write two functions that share the list `MESSAGES`:\n- `flash(message, category=\'message\')` appends a `(category, message)` tuple\n- `get_flashed_messages()` returns the list of **messages** (text only) and then **empties** `MESSAGES`',
      example: { title: 'emptying a list in place', code: "items = [1, 2, 3]\ncopy = list(items)\nitems.clear()\nprint(copy, items)   # [1, 2, 3] []" },
      starter: `MESSAGES = []

def flash(message, category='message'):
    # TODO
    pass

def get_flashed_messages():
    # TODO
    return []
`,
      solution: `MESSAGES = []

def flash(message, category='message'):
    MESSAGES.append((category, message))

def get_flashed_messages():
    texts = [m for _, m in MESSAGES]
    MESSAGES.clear()
    return texts
`,
      tests: [
        { call: "(flash('Saved', 'success'), flash('Check email'), get_flashed_messages())[2]", expect: ['Saved', 'Check email'] },
        { call: 'get_flashed_messages()', expect: [], msg: 'Messages must be gone after they were read once' },
        { call: "(flash('Bye', 'info'), MESSAGES[0])[1]", expect: ['info', 'Bye'] },
      ],
      explain: 'Real Flask stores flashed messages in the **session** and `get_flashed_messages()` pops them, which is why a message appears exactly once - typically on the page you redirect to after a successful POST. Forgetting to clear the list would show the same message on every page.',
    },
  ],
};
