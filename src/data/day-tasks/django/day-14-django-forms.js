export default {
  lesson: 'day-14-django-forms',
  minutes: 35,
  intro: 'Practise Form classes, fields and widgets, the GET/POST view pattern, is_valid/cleaned_data, clean_<field>() and clean(), and run real Django forms.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In which order does Django validate a form?',
      options: ['clean() → clean_<field>() → field validation', 'Field to_python/validators → clean_<field>() for each field → clean() for the whole form', 'Only clean() runs', 'Validation happens in the template'],
      answer: 1,
      explain: 'Each field first converts and validates its value (required, max_length, validators), then your `clean_<field>()` runs; after all fields, the form-level `clean()` runs for cross-field rules. Values that passed are in `cleaned_data`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the standard view pattern line that creates a **bound** form from submitted data:\n\n```\nif request.method == \'POST\':\n    form = EnquiryForm(______)\n    if form.is_valid():\n        ...\n        return redirect(\'enquiry-thanks\')\nelse:\n    form = EnquiryForm()\n```',
      accept: ['request.POST'],
      caseSensitive: true,
      explain: '`EnquiryForm(request.POST)` = bound form (has data, can be validated). `EnquiryForm()` = unbound empty form for GET. For file uploads also pass `request.FILES`. Redirect after a successful POST (PRG pattern) so refreshing does not resubmit.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'Every POST form template needs {% csrf_token %}',
        'A search form should use method="get" so the URL can be bookmarked',
        'form.cleaned_data is available only after is_valid() returns True (for valid fields)',
        'widget=forms.Textarea changes how a field is validated',
        'Errors from clean() appear in form.non_field_errors()',
      ],
      answers: [0, 1, 2, 4],
      explain: 'POST forms need the CSRF token or Django returns 403. GET suits searches (no data change, shareable URL). Widgets control the **HTML** (`<textarea>`), fields control **validation**. Form-level errors are "non-field errors".',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from django import forms

class EnquiryForm(forms.Form):
    name = forms.CharField(max_length=50)
    email = forms.EmailField()
    age = forms.IntegerField(min_value=16)
    course = forms.ChoiceField(choices=[('bca', 'BCA'), ('mca', 'MCA')])

    def clean_name(self):
        return self.cleaned_data['name'].strip().title()

    def clean(self):
        data = super().clean()
        if data.get('course') == 'mca' and data.get('age', 0) < 20:
            raise forms.ValidationError('MCA needs age 20+')
        return data

f = EnquiryForm({'name': '  asha patil ', 'email': 'asha@gmail.com', 'age': '19', 'course': 'bca'})
print(f.is_valid(), f.cleaned_data['name'], f.cleaned_data['age'] + 1)
f = EnquiryForm({'name': 'Ravi', 'email': 'ravi.gmail.com', 'age': '15', 'course': 'phd'})
print(f.is_valid(), sorted(f.errors))
f = EnquiryForm({'name': 'Meera', 'email': 'm@x.in', 'age': '19', 'course': 'mca'})
print(f.is_valid(), f.non_field_errors()[0])`,
      expected: "True Asha Patil 20\nFalse ['age', 'course', 'email']\nFalse MCA needs age 20+",
      explain: '`cleaned_data` holds converted values (`\'19\'` → 19) and `clean_name` tidies the name. The second form fails three field checks (invalid email, min_value, invalid choice). The third passes all fields but fails the cross-field rule in `clean()`, which becomes a non-field error.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Re-create the form validation flow in plain Python. Write `validate_admission(data)` returning `(is_valid, cleaned_data, errors)`:\n- `name`: required (stripped) → `\'This field is required.\'`; cleaned: title case\n- `phone`: exactly 10 digits, first digit 6-9 → `\'Enter a valid mobile number.\'`\n- `marks_12th`: number 0-100 (string allowed, convert to float) → `\'Enter marks between 0 and 100.\'`\n- form-level (only if marks are valid): `stream == \'science\'` requires marks >= 50 → error under `\'__all__\'`: `\'Science stream needs 50% or more.\'`\n\n`errors` maps field → message; `cleaned_data` contains only fields that passed.',
      example: { title: 'a clean_<field> method', code: "def clean_pincode(self):\n    p = self.cleaned_data['pincode']\n    if not (p.isdigit() and len(p) == 6):\n        raise forms.ValidationError('Enter a 6-digit PIN code.')\n    return p" },
      starter: `def validate_admission(data):
    cleaned, errors = {}, {}
    # TODO
    return (not errors, cleaned, errors)
`,
      solution: `def validate_admission(data):
    cleaned, errors = {}, {}
    name = str(data.get('name', '')).strip()
    if not name:
        errors['name'] = 'This field is required.'
    else:
        cleaned['name'] = name.title()
    phone = str(data.get('phone', '')).strip()
    if len(phone) == 10 and phone.isdigit() and phone[0] in '6789':
        cleaned['phone'] = phone
    else:
        errors['phone'] = 'Enter a valid mobile number.'
    try:
        marks = float(data.get('marks_12th', ''))
        if not 0 <= marks <= 100:
            raise ValueError
        cleaned['marks_12th'] = marks
    except (TypeError, ValueError):
        errors['marks_12th'] = 'Enter marks between 0 and 100.'
    if 'stream' in data:
        cleaned['stream'] = data['stream']
    if 'marks_12th' in cleaned and data.get('stream') == 'science' and cleaned['marks_12th'] < 50:
        errors['__all__'] = 'Science stream needs 50% or more.'
    return (not errors, cleaned, errors)
`,
      tests: [
        { call: "validate_admission({'name': ' asha patil', 'phone': '9876543210', 'marks_12th': '78.5', 'stream': 'science'})", expect: [true, { name: 'Asha Patil', phone: '9876543210', marks_12th: 78.5, stream: 'science' }, {}] },
        { call: "validate_admission({'name': '', 'phone': '1234567890', 'marks_12th': '105', 'stream': 'commerce'})[2]", expect: { name: 'This field is required.', phone: 'Enter a valid mobile number.', marks_12th: 'Enter marks between 0 and 100.' } },
        { call: "validate_admission({'name': 'Ravi', 'phone': '9123456789', 'marks_12th': '45.5', 'stream': 'science'})[2]", expect: { __all__: 'Science stream needs 50% or more.' } },
        { call: "validate_admission({'name': 'Ravi', 'phone': '9123456789', 'marks_12th': 'abc', 'stream': 'science'})[2]", expect: { marks_12th: 'Enter marks between 0 and 100.' }, msg: 'The form-level rule must not run when the marks field is invalid' },
      ],
      explain: 'Field checks collect errors per field; only fields that passed go into `cleaned_data`. The form-level rule uses `cleaned_data` and must check the field exists first - in Django, `clean()` runs even if some fields failed, so use `data.get(...)`. `__all__` is the key Django uses for non-field errors.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What HTML does Django render for this field? (runs inside a configured Django project)',
      code: `from django import forms

class SearchForm(forms.Form):
    q = forms.CharField(label='Search', max_length=30, required=False,
                        widget=forms.TextInput(attrs={'placeholder': 'Name or roll no', 'class': 'form-control'}))

f = SearchForm()
print(f['q'])
print(SearchForm({'q': 'asha'}).is_valid(), SearchForm({}).is_valid())`,
      expected: '<input type="text" name="q" placeholder="Name or roll no" class="form-control" maxlength="30" id="id_q">\nTrue True',
      explain: 'The widget renders `<input type="text">` with your `attrs`, plus `maxlength` from the field and an automatic `id="id_<name>"`. With `required=False` an empty search is valid, so the list page can show all students.',
    },
  ],
};
