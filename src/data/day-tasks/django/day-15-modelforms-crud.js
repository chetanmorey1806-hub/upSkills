export default {
  lesson: 'day-15-modelforms-crud',
  minutes: 35,
  intro: 'Practise ModelForm Meta options, instance= for editing, save(commit=False) and CRUD URL design, and write the CRUD routing and save logic in plain Python.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line in the **edit** view that fills the form with the existing student and the submitted data:\n\n```\nstudent = get_object_or_404(Student, pk=pk)\nform = StudentForm(request.POST or None, ______)\n```',
      accept: ['instance=student'],
      explain: '`instance=student` tells the ModelForm to edit this object: on GET the fields are pre-filled, on POST `form.save()` runs an UPDATE instead of creating a new row. Forgetting it creates a duplicate student on every edit.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why call `form.save(commit=False)`?',
      options: ['To delete the object', 'To get an unsaved object so you can set extra fields (e.g. created_by = request.user) before saving', 'To skip validation', 'To save twice'],
      answer: 1,
      explain: '`obj = form.save(commit=False)` builds the object without hitting the database; set extra values, then `obj.save()`. If the form has ManyToMany fields, call `form.save_m2m()` afterwards, because M2M rows need the object\'s id.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about ModelForms are TRUE? (choose all that apply)',
      options: [
        "class Meta: model = Student; fields = ['name', 'email', 'course'] chooses the fields",
        'A ForeignKey becomes a ModelChoiceField (a <select>)',
        'unique=True on the model is checked by form.is_valid() (validate_unique)',
        "fields = '__all__' is always the safest choice",
        'Deleting should happen on a POST from a confirmation page, not a GET link',
      ],
      answers: [0, 1, 2, 4],
      explain: 'ModelForms map model fields to form fields (FK → ModelChoiceField, M2M → ModelMultipleChoiceField) and run model validation including uniqueness. List fields explicitly - `__all__` can expose fields like `is_verified`. A GET must never delete data (crawlers and prefetchers follow links).',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project; `Group` is a model with a unique `name`)',
      code: `from django import forms
from django.contrib.auth.models import Group
from django.core.management import call_command

call_command('migrate', 'auth', verbosity=0)

class GroupForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ['name']

f = GroupForm({'name': 'Teachers'})
print(f.is_valid(), f.save().pk)
f = GroupForm({'name': 'Teachers'})
print(f.is_valid(), f.errors['name'][0])
g = Group.objects.get(name='Teachers')
f = GroupForm({'name': 'Senior Teachers'}, instance=g)
f.save()
print(Group.objects.count(), Group.objects.get(pk=g.pk).name)`,
      expected: 'True 1\nFalse Group with this Name already exists.\n1 Senior Teachers',
      explain: 'The first save creates row 1. The second form fails because `name` is unique - ModelForm validation checks the database. With `instance=g` the third form **updates** the same row, so the count stays 1.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Design the CRUD URLs. Write `crud_route(method, path)` for the students app that returns the view name, or `\'404\'` / `\'405\'`:\n- `/students/` GET → `\'student_list\'`\n- `/students/add/` GET or POST → `\'student_create\'`\n- `/students/<id>/` GET → `\'student_detail\'`\n- `/students/<id>/edit/` GET or POST → `\'student_update\'`\n- `/students/<id>/delete/` GET (confirm page) or POST → `\'student_delete\'`\n- a known URL with another method → `\'405\'`; anything else → `\'404\'` (`<id>` = digits only)',
      example: { title: 'matching with a regex', code: "import re\nm = re.fullmatch(r'/orders/(\\d+)/', '/orders/42/')\nprint(m.group(1) if m else None)   # 42" },
      starter: `import re

def crud_route(method, path):
    # TODO
    return '404'
`,
      solution: `import re

ROUTES = [
    (r'/students/', 'student_list', {'GET'}),
    (r'/students/add/', 'student_create', {'GET', 'POST'}),
    (r'/students/\\d+/', 'student_detail', {'GET'}),
    (r'/students/\\d+/edit/', 'student_update', {'GET', 'POST'}),
    (r'/students/\\d+/delete/', 'student_delete', {'GET', 'POST'}),
]

def crud_route(method, path):
    for pattern, name, methods in ROUTES:
        if re.fullmatch(pattern, path):
            return name if method in methods else '405'
    return '404'
`,
      tests: [
        { call: "crud_route('GET', '/students/')", expect: 'student_list' },
        { call: "crud_route('POST', '/students/add/')", expect: 'student_create' },
        { call: "crud_route('GET', '/students/12/')", expect: 'student_detail' },
        { call: "crud_route('POST', '/students/12/edit/')", expect: 'student_update' },
        { call: "crud_route('GET', '/students/12/delete/')", expect: 'student_delete' },
        { call: "crud_route('DELETE', '/students/12/')", expect: '405' },
        { call: "crud_route('GET', '/students/abc/')", expect: '404' },
        { call: "crud_route('GET', '/students/add')", expect: '404', msg: 'Without the trailing slash this route does not match' },
      ],
      explain: 'Classic HTML CRUD uses five URLs: list, add, detail, edit, delete (GET shows a page, POST changes data). Note `add/` must not be captured by the `<int:pk>` route - with `int` it cannot, because "add" is not digits.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `save_student(form_data, user, db, instance_id=None, commit=True)` that mimics ModelForm saving with a list `db` of dicts:\n- build the object from `form_data` (only keys `name`, `email`, `course`) and add `created_by=user` (like `commit=False` + extra field)\n- if `instance_id` is given: update that row (keep its `id` and original `created_by`) and return it\n- otherwise give it `id = len(db) + 1`\n- if `commit` is False return the object **without** adding/updating `db`; else save and return it',
      example: { title: 'commit=False in a view', code: "student = form.save(commit=False)\nstudent.created_by = request.user\nstudent.save()\nform.save_m2m()" },
      starter: `def save_student(form_data, user, db, instance_id=None, commit=True):
    # TODO
    return None
`,
      solution: `def save_student(form_data, user, db, instance_id=None, commit=True):
    obj = {k: form_data[k] for k in ('name', 'email', 'course') if k in form_data}
    if instance_id is not None:
        current = next(r for r in db if r['id'] == instance_id)
        obj = {**current, **obj}
        if commit:
            current.update(obj)
            return current
        return obj
    obj['created_by'] = user
    obj['id'] = len(db) + 1
    if commit:
        db.append(obj)
    return obj
`,
      tests: [
        { call: "(lambda db: (save_student({'name': 'Asha', 'email': 'a@x.in', 'course': 'BCA', 'is_admin': True}, 'teacher1', db), db))([])", expect: [{ name: 'Asha', email: 'a@x.in', course: 'BCA', created_by: 'teacher1', id: 1 }, [{ name: 'Asha', email: 'a@x.in', course: 'BCA', created_by: 'teacher1', id: 1 }]] },
        { call: "(lambda db: (save_student({'name': 'Ravi'}, 'teacher1', db, commit=False), len(db)))([])", expect: [{ name: 'Ravi', created_by: 'teacher1', id: 1 }, 0], msg: 'commit=False must not save' },
        { call: "(lambda db: (save_student({'name': 'Asha Patil', 'course': 'MCA'}, 'teacher2', db, instance_id=1), len(db)))([{'id': 1, 'name': 'Asha', 'email': 'a@x.in', 'course': 'BCA', 'created_by': 'teacher1'}])", expect: [{ id: 1, name: 'Asha Patil', email: 'a@x.in', course: 'MCA', created_by: 'teacher1' }, 1] },
      ],
      explain: 'Only fields listed in `Meta.fields` are taken from the user (an injected `is_admin` is ignored). Fields the user must not choose (`created_by`) are set in the view after `commit=False`. With `instance=` the same row is updated, never duplicated.',
    },
  ],
};
