export default {
  lesson: 'day-24-middleware-context-processors-signals',
  minutes: 35,
  intro: 'Practise middleware order (the onion), class-based middleware, context processors and signals, and build a middleware chain and a signal dispatcher in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'MIDDLEWARE = [A, B, C]. In which order does the code run for a request and its response?',
      options: ['A, B, C, view, A, B, C', 'A, B, C, view, C, B, A', 'C, B, A, view, A, B, C', 'view, A, B, C'],
      answer: 1,
      explain: 'Middleware wraps the view like onion layers: the request passes A → B → C → view, and the response comes back C → B → A. That is why `SecurityMiddleware` is first and why order matters (sessions before auth, auth before your middleware that uses `request.user`).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the class-based middleware so it passes the request on and gets the response:\n\n```\nclass TimingMiddleware:\n    def __init__(self, get_response):\n        self.get_response = get_response\n\n    def __call__(self, request):\n        start = time.time()\n        response = ______\n        response[\'X-Time\'] = f\'{time.time() - start:.3f}\'\n        return response\n```',
      accept: ['self.get_response(request)'],
      explain: '`self.get_response(request)` calls the next middleware (or the view). Code before it runs on the way **in**, code after it on the way **out**. Returning a response without calling it short-circuits the chain (e.g. a maintenance page).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'A context processor is a function(request) that returns a dict added to every template rendered with a request',
        "It must be registered in TEMPLATES['OPTIONS']['context_processors']",
        'post_save receivers get created=True when a new row was inserted',
        'QuerySet.update() and bulk_create() send post_save for each row',
        'Signals are good for decoupling apps but make code flow harder to follow',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Context processors add globals like `site_name` or `cart_count` to every `render()`. `post_save` has a `created` flag. Bulk operations (`update`, `bulk_create`, `delete` on querysets partially) skip `save()` and its signals - a common surprise. Use signals sparingly.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Build the middleware onion. Write `build_chain(middlewares, view)` that returns a function `handler(request)`. Each middleware is a factory `mw(get_response)` returning a callable `(request) -> response` (exactly like Django). The **first** middleware in the list must be the **outermost** layer. Use the given middlewares to test: each appends to `request[\'log\']`.',
      example: { title: 'wrapping functions', code: "def shout(fn):\n    def wrapper(x):\n        return fn(x).upper()\n    return wrapper\n\nhello = shout(lambda name: f'hi {name}')\nprint(hello('asha'))   # HI ASHA" },
      starter: `def make_mw(name):
    def mw(get_response):
        def middleware(request):
            request['log'].append(f'{name} in')
            response = get_response(request)
            request['log'].append(f'{name} out')
            return response
        return middleware
    return mw

def view(request):
    request['log'].append('view')
    return 'OK'

def build_chain(middlewares, view):
    # TODO
    return view
`,
      solution: `def make_mw(name):
    def mw(get_response):
        def middleware(request):
            request['log'].append(f'{name} in')
            response = get_response(request)
            request['log'].append(f'{name} out')
            return response
        return middleware
    return mw

def view(request):
    request['log'].append('view')
    return 'OK'

def build_chain(middlewares, view):
    handler = view
    for mw in reversed(middlewares):
        handler = mw(handler)
    return handler
`,
      tests: [
        { call: "(lambda r: (build_chain([make_mw('Security'), make_mw('Session'), make_mw('Auth')], view)(r), r['log']))({'log': []})", expect: ['OK', ['Security in', 'Session in', 'Auth in', 'view', 'Auth out', 'Session out', 'Security out']] },
        { call: "(lambda r: (build_chain([], view)(r), r['log']))({'log': []})", expect: ['OK', ['view']] },
        { call: "(lambda r: (build_chain([lambda gr: (lambda req: 'Maintenance'), make_mw('Auth')], view)(r), r['log']))({'log': []})", expect: ['Maintenance', []], msg: 'A middleware that returns early must stop the chain' },
      ],
      explain: 'Django builds the handler exactly like this when the server starts: it wraps the view with the **last** middleware first, so the first one ends up outermost. That gives the onion order "in A, B, C → view → out C, B, A" and lets any layer short-circuit.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write a tiny signal system. Class `Signal` with:\n- `connect(receiver, sender=None)` registers a function\n- `send(sender, **kwargs)` calls every receiver whose `sender` is `None` or equals the given sender, as `receiver(sender=sender, **kwargs)`, and returns a list of `(receiver.__name__, return_value)` in connection order\n- connecting the same receiver twice must not register it twice (like `dispatch_uid`)',
      example: { title: 'calling stored functions', code: "handlers = [print, len]\nfor h in handlers:\n    h('hi')" },
      starter: `def create_profile(sender, created, **kwargs):
    return 'profile created' if created else 'skip'

class Signal:
    def __init__(self):
        self.receivers = []

    # TODO: connect, send
`,
      solution: `def create_profile(sender, created, **kwargs):
    return 'profile created' if created else 'skip'

class Signal:
    def __init__(self):
        self.receivers = []

    def connect(self, receiver, sender=None):
        if all(r is not receiver for r, _ in self.receivers):
            self.receivers.append((receiver, sender))

    def send(self, sender, **kwargs):
        results = []
        for receiver, wanted in self.receivers:
            if wanted is None or wanted == sender:
                results.append((receiver.__name__, receiver(sender=sender, **kwargs)))
        return results
`,
      tests: [
        { call: "(lambda s: (s.connect(create_profile), s.send('User', created=True))[1])(Signal())", expect: [['create_profile', 'profile created']] },
        { call: "(lambda s, f: (s.connect(f), s.connect(f), len(s.receivers))[2])(Signal(), lambda sender, **kw: 1)", expect: 1, msg: 'Connecting twice must register once' },
        { call: "(lambda s: (s.connect(lambda sender, **kw: 'fee', sender='Payment'), s.connect(lambda sender, **kw: 'all'), [v for _, v in s.send('Student')])[2])(Signal())", expect: ['all'], msg: 'Receivers for another sender must not run' },
      ],
      explain: 'Django\'s `post_save.connect(create_profile, sender=User)` works this way: the model calls `post_save.send(sender=User, instance=..., created=...)` after saving, and only matching receivers run. `dispatch_uid` prevents duplicate connections when a module is imported twice.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from django.dispatch import Signal, receiver
from django.http import HttpResponse
from django.test import RequestFactory
from django.template import engines

fee_paid = Signal()

@receiver(fee_paid)
def send_receipt(sender, amount, **kwargs):
    return f'receipt for Rs {amount}'

print(fee_paid.send(sender='Payment', amount=25000)[0][1])

def portal_info(request):
    return {'portal_name': 'Student Portal', 'year': 2026}

def middleware(get_response):
    def mw(request):
        request.branch = 'Pune'
        response = get_response(request)
        response['X-Branch'] = request.branch
        return response
    return mw

def view(request):
    t = engines['django'].from_string('{{ portal_name }} {{ year }} - {{ request.branch }}')
    ctx = {**portal_info(request), 'request': request}
    return HttpResponse(t.render(ctx))

r = middleware(view)(RequestFactory().get('/'))
print(r.content.decode(), r['X-Branch'])`,
      expected: 'receipt for Rs 25000\nStudent Portal 2026 - Pune Pune',
      explain: '`send()` returns a list of `(receiver, response)` pairs. The middleware adds `request.branch` on the way in and a header on the way out. The context processor\'s dict is merged into the template context (in a real project Django does that automatically for every `render(request, ...)`).',
    },
  ],
};
