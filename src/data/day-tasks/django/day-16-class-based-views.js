export default {
  lesson: 'day-16-class-based-views',
  minutes: 30,
  intro: 'Practise View, TemplateView, ListView and DetailView, as_view() and dispatch(), get_queryset() and get_context_data(), and build a mini class-based view system in Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'For `class StudentListView(ListView): model = Student`, what is the default template name and context variable?',
      options: ['student_list.html and students', 'students/student_list.html and student_list (also object_list)', 'list.html and objects', 'students/index.html and object'],
      answer: 1,
      explain: 'ListView looks for `<app>/<model>_list.html` and puts the queryset in `object_list` and `<model>_list`. DetailView uses `<app>/<model>_detail.html` with `object` and `<model>`. Override with `template_name` and `context_object_name`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the URL pattern that connects the class-based view:\n\n```\npath(\'students/\', ______, name=\'student-list\'),\n```',
      accept: ['StudentListView.as_view()', 'views.StudentListView.as_view()'],
      explain: '`path()` needs a function; `as_view()` creates one that, on every request, makes a new view instance and calls `dispatch()`, which calls `get()`/`post()` depending on the method. Writing `StudentListView` without `.as_view()` is a common error.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'Override get_queryset() to filter the list (e.g. only active students)',
        'Override get_context_data() and call super() to add extra template variables',
        'paginate_by = 10 on a ListView adds page_obj and is_paginated to the context',
        'A View subclass without a post() method answers POST requests with 405',
        'Class-based views are always better than function-based views',
      ],
      answers: [0, 1, 2, 3],
      explain: 'CBVs are customised by overriding small hook methods (always call `super()` in `get_context_data`). `dispatch()` returns 405 for methods the class does not define. FBVs are often clearer for one-off logic - choose per case.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from django.http import HttpResponse
from django.test import RequestFactory
from django.views import View
from django.views.generic import TemplateView

class Hello(View):
    greeting = 'Namaste'
    def get(self, request, name):
        return HttpResponse(f'{self.greeting}, {name}!')

class Hi(Hello):
    greeting = 'Hi'

class About(TemplateView):
    template_name = 'about.html'
    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['portal'] = 'Student Portal'
        return ctx

rf = RequestFactory()
print(Hello.as_view()(rf.get('/'), name='Asha').content.decode())
print(Hi.as_view()(rf.get('/'), name='Ravi').content.decode())
print(Hello.as_view(greeting='Hello')(rf.get('/'), name='Meera').content.decode())
print(Hello.as_view()(rf.post('/'), name='Dev').status_code)
r = About.as_view()(rf.get('/about/'), course='bca')
print(r.template_name, sorted(r.context_data))`,
      expected: "Namaste, Asha!\nHi, Ravi!\nHello, Meera!\n405\n['about.html'] ['course', 'portal', 'view']",
      explain: 'URL kwargs reach `get()`. Subclasses override class attributes (`Hi`), and `as_view(greeting=...)` overrides them per URL. No `post()` → 405. TemplateView puts URL kwargs and `view` in the context; `get_context_data` adds `portal`. The response is lazy (`TemplateResponse`), so the template is rendered later.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Build a mini CBV system. Complete `View.as_view(**initkwargs)` so it returns a function `view(method, **kwargs)` that creates a **new instance** per call, sets the init kwargs as attributes, and calls `dispatch(method, **kwargs)`. `dispatch` calls the method named `method.lower()` if it exists, otherwise returns `(405, \'Method Not Allowed\')`.\nThen write `StudentList(View)` with `queryset` and a `get(self, city=None)` returning `(200, [names])` (filtered by city if given) via a `get_queryset()` method.',
      example: { title: 'getattr to find a method by name', code: "class Robot:\n    def walk(self):\n        return 'walking'\n\nr = Robot()\nhandler = getattr(r, 'walk', None)\nprint(handler() if handler else 'cannot')" },
      starter: `class View:
    @classmethod
    def as_view(cls, **initkwargs):
        # TODO
        pass

    def dispatch(self, method, **kwargs):
        # TODO
        pass

# TODO: StudentList
`,
      solution: `class View:
    @classmethod
    def as_view(cls, **initkwargs):
        def view(method, **kwargs):
            self = cls()
            for k, v in initkwargs.items():
                setattr(self, k, v)
            return self.dispatch(method, **kwargs)
        return view

    def dispatch(self, method, **kwargs):
        handler = getattr(self, method.lower(), None)
        if handler is None:
            return (405, 'Method Not Allowed')
        return handler(**kwargs)

class StudentList(View):
    queryset = [
        {'name': 'Asha', 'city': 'Pune'},
        {'name': 'Ravi', 'city': 'Mumbai'},
        {'name': 'Meera', 'city': 'Pune'},
    ]

    def get_queryset(self):
        return list(self.queryset)

    def get(self, city=None):
        rows = self.get_queryset()
        if city:
            rows = [r for r in rows if r['city'] == city]
        return (200, [r['name'] for r in rows])
`,
      tests: [
        { call: "StudentList.as_view()('GET')", expect: [200, ['Asha', 'Ravi', 'Meera']] },
        { call: "StudentList.as_view()('GET', city='Pune')", expect: [200, ['Asha', 'Meera']] },
        { call: "StudentList.as_view()('POST')", expect: [405, 'Method Not Allowed'] },
        { call: "StudentList.as_view(queryset=[{'name': 'Zoya', 'city': 'Goa'}])('get')", expect: [200, ['Zoya']], msg: 'as_view(**initkwargs) must override class attributes' },
      ],
      explain: 'This is how Django CBVs work: `as_view()` returns a plain function, each request gets a **fresh instance** (so storing data on `self` is safe), and `dispatch()` routes by HTTP method. Hooks like `get_queryset()` let subclasses change one step without rewriting `get()`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Python decides which method runs using the **MRO**. Write `mro_names(cls)` that returns the list of class names in `cls.__mro__`, excluding `object`. Then define (in the same file) `class Base`, `class LoginRequiredMixin`, `class OwnerMixin` and `class EditView(LoginRequiredMixin, OwnerMixin, Base)` (empty bodies are fine).',
      example: { title: 'looking at the MRO', code: "class A: pass\nclass B(A): pass\nprint([c.__name__ for c in B.__mro__])   # ['B', 'A', 'object']" },
      starter: `def mro_names(cls):
    # TODO
    return []

# TODO: Base, LoginRequiredMixin, OwnerMixin, EditView
`,
      solution: `def mro_names(cls):
    return [c.__name__ for c in cls.__mro__ if c is not object]

class Base:
    pass

class LoginRequiredMixin:
    pass

class OwnerMixin:
    pass

class EditView(LoginRequiredMixin, OwnerMixin, Base):
    pass
`,
      tests: [
        { call: 'mro_names(EditView)', expect: ['EditView', 'LoginRequiredMixin', 'OwnerMixin', 'Base'] },
        { call: 'mro_names(Base)', expect: ['Base'] },
      ],
      explain: 'Python looks up methods left to right along the MRO. That is why **mixins go first** and the base view (`UpdateView`) last: `LoginRequiredMixin.dispatch()` must run before the view\'s own `dispatch()`. Putting the mixin after the view means its check never runs.',
    },
  ],
};
