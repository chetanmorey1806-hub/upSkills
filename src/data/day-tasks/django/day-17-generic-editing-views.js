export default {
  lesson: 'day-17-generic-editing-views',
  minutes: 30,
  intro: 'Practise CreateView, UpdateView, DeleteView, success_url, reverse_lazy and form_valid(), and write the generic editing flow in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Why must a class attribute use `success_url = reverse_lazy(\'student-list\')` instead of `reverse(...)`?',
      options: ['reverse_lazy is faster', 'Class attributes are evaluated when the module is imported, before the URLconf is loaded; reverse_lazy waits until the value is used', 'reverse only works in templates', 'There is no difference'],
      answer: 1,
      explain: 'The class body runs at import time - often while `urls.py` itself is being imported - so `reverse()` would fail (circular import / NoReverseMatch). `reverse_lazy` returns a lazy object evaluated on first use. Inside methods (e.g. `get_success_url`) plain `reverse` is fine.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the hook that sets the logged-in user as the creator before CreateView saves:\n\n```\nclass StudentCreateView(LoginRequiredMixin, CreateView):\n    model = Student\n    fields = [\'name\', \'email\', \'course\']\n\n    def form_valid(self, form):\n        form.instance.created_by = self.request.user\n        return ______\n```',
      accept: ['super().form_valid(form)'],
      explain: '`form_valid()` is called after validation. Change `form.instance`, then let the parent save it and redirect: `return super().form_valid(form)`. Forgetting `return` gives "The view didn\'t return an HttpResponse object".',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'CreateView and UpdateView use the template <model>_form.html by default (one template for both)',
        'DeleteView shows <model>_confirm_delete.html on GET and deletes on POST',
        'If the model has get_absolute_url(), success_url can be omitted in CreateView/UpdateView',
        'form_invalid() is called when validation fails and re-renders the form with errors',
        'UpdateView needs pk or slug in the URL to find the object',
      ],
      answers: [0, 1, 2, 3, 4],
      explain: 'All five are true: shared `_form.html` (check `object` in the template to show "Edit" vs "Add"), confirm page + POST delete, `get_absolute_url` fallback, `form_invalid` re-render, and `pk`/`slug` URL kwargs for `get_object()`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Write the generic editing flow `edit_flow(method, data, obj, validate, save, success_url)`:\n- `GET` → `(\'render\', {\'form_data\': obj or {}, \'errors\': {}})`\n- `POST` → `errors = validate(data)`; if errors (form_invalid) → `(\'render\', {\'form_data\': data, \'errors\': errors})`; else (form_valid) → `save(obj, data)` and return `(\'redirect\', success_url)`\n- other methods → `(\'405\', None)`\n\n`obj` is `None` for create and a dict for update.',
      example: { title: 'passing functions as arguments', code: "def apply(fn, x):\n    return fn(x)\n\nprint(apply(str.upper, 'asha'))   # ASHA" },
      starter: `def edit_flow(method, data, obj, validate, save, success_url):
    # TODO
    return ('405', None)
`,
      solution: `def edit_flow(method, data, obj, validate, save, success_url):
    if method == 'GET':
        return ('render', {'form_data': obj or {}, 'errors': {}})
    if method == 'POST':
        errors = validate(data)
        if errors:
            return ('render', {'form_data': data, 'errors': errors})
        save(obj, data)
        return ('redirect', success_url)
    return ('405', None)
`,
      tests: [
        { call: "edit_flow('GET', None, {'name': 'Asha'}, None, None, '/students/')", expect: ['render', { form_data: { name: 'Asha' }, errors: {} }] },
        { call: "edit_flow('GET', None, None, None, None, '/students/')", expect: ['render', { form_data: {}, errors: {} }] },
        { call: "edit_flow('POST', {'name': ''}, None, lambda d: {} if d.get('name') else {'name': 'This field is required.'}, None, '/students/')", expect: ['render', { form_data: { name: '' }, errors: { name: 'This field is required.' } }] },
        { call: "(lambda db: (edit_flow('POST', {'name': 'Ravi'}, None, lambda d: {}, lambda o, d: db.append(d), '/students/'), db))([])", expect: [['redirect', '/students/'], [{ name: 'Ravi' }]] },
        { call: "edit_flow('PUT', {}, None, None, None, '/')", expect: ['405', null] },
      ],
      explain: 'CreateView/UpdateView implement exactly this: GET shows the (pre-filled) form, POST validates; invalid → `form_invalid()` re-renders with the user\'s data and errors (status 200), valid → `form_valid()` saves and **redirects** to `success_url` (Post/Redirect/Get).',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print? (runs inside a configured Django project; this file is the ROOT_URLCONF)',
      code: `from django.urls import path, reverse, reverse_lazy
from django.http import HttpResponse

def student_list(request):
    return HttpResponse('list')

success_url = reverse_lazy('student-list')
print(type(success_url).__name__)

urlpatterns = [path('students/', student_list, name='student-list')]

print(str(success_url))
print(reverse('student-list') == success_url)`,
      expected: '__proxy__\n/students/\nTrue',
      explain: '`reverse_lazy` is created **before** `urlpatterns` exists and returns a lazy proxy object. It is only resolved when used (`str()`), by which time the URL is known. A plain `reverse()` at that first line would raise `NoReverseMatch`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `get_success_url(obj, success_url=None, next_url=None)` the way a well-behaved UpdateView would:\n1. a safe `next_url` (starts with `/` but not `//`) wins\n2. else `success_url` if given (may contain `{id}`, which is filled with `obj[\'id\']`, like Django\'s `success_url = \'/students/{id}/\'`)\n3. else `f"/students/{obj[\'id\']}/"` (what `get_absolute_url()` would return)',
      example: { title: 'format with a dict', code: "print('/orders/{id}/'.format(**{'id': 5}))   # /orders/5/" },
      starter: `def get_success_url(obj, success_url=None, next_url=None):
    # TODO
    return '/'
`,
      solution: `def get_success_url(obj, success_url=None, next_url=None):
    if next_url and next_url.startswith('/') and not next_url.startswith('//'):
        return next_url
    if success_url:
        return success_url.format(**obj)
    return f"/students/{obj['id']}/"
`,
      tests: [
        { call: "get_success_url({'id': 7})", expect: '/students/7/' },
        { call: "get_success_url({'id': 7}, '/students/')", expect: '/students/' },
        { call: "get_success_url({'id': 7}, '/students/{id}/marks/')", expect: '/students/7/marks/' },
        { call: "get_success_url({'id': 7}, '/students/', '/fees/?page=2')", expect: '/fees/?page=2' },
        { call: "get_success_url({'id': 7}, '/students/', '//evil.com')", expect: '/students/' },
      ],
      explain: 'Django\'s `ModelFormMixin.get_success_url()` formats `success_url` with the object\'s fields and falls back to `get_absolute_url()`. Supporting a `?next=` parameter is handy (return to the filtered list) but must be checked to avoid open redirects.',
    },
  ],
};
