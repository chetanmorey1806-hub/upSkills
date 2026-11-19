export default {
  lesson: 'day-35-decorators',
  minutes: 35,
  intro: 'Write decorators that wrap functions, keep their metadata with functools.wraps, take arguments, and stack them.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Stacking decorators. What is printed?',
      code: `def bold(fn):
    def wrapper():
        return "<b>" + fn() + "</b>"
    return wrapper

def italic(fn):
    def wrapper():
        return "<i>" + fn() + "</i>"
    return wrapper

@bold
@italic
def hello():
    return "hi"

print(hello())
print(hello.__name__)`,
      expected: '<b><i>hi</i></b>\nwrapper',
      explain: 'Decorators apply **bottom-up**: `hello = bold(italic(hello))`, so italic wraps first and bold is outermost. Without `functools.wraps`, the decorated function’s name becomes "wrapper", which confuses logs and debugging.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `@functools.wraps(fn)` on the inner wrapper do?',
      options: [
        'Makes the function run faster',
        'Copies the original function’s name, docstring and other metadata to the wrapper',
        'Caches results',
        'Allows the decorator to take arguments',
      ],
      answer: 1,
      explain: '`wraps` copies `__name__`, `__doc__`, `__module__` etc. and sets `__wrapped__`, so `help()`, logging and test tools still see the real function. Caching is `lru_cache`; decorator arguments need an extra outer function.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write a decorator `shout` that converts the decorated function’s **return value** to upper case. It must work for functions with any arguments and keep the original `__name__` (use `functools.wraps`).',
      example: { title: 'decorator skeleton', code: 'import functools\n\ndef my_decorator(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        result = fn(*args, **kwargs)\n        return result\n    return wrapper' },
      starter: `import functools

def shout(fn):
    # TODO
    return fn

@shout
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}"
`,
      solution: `import functools

def shout(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs).upper()
    return wrapper

@shout
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}"
`,
      tests: [
        { call: 'greet("Asha")', expect: 'HELLO, ASHA' },
        { call: 'greet("Ravi", greeting="Namaste")', expect: 'NAMASTE, RAVI' },
        { call: 'greet.__name__', expect: 'greet', msg: 'use @functools.wraps(fn) so the name stays "greet"' },
        { call: 'shout(lambda: "ok")()', expect: 'OK' },
      ],
      explain: '`*args, **kwargs` let the wrapper accept and forward any arguments. The wrapper must **return** the result; forgetting `return` makes every decorated function return None.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Decorator **with arguments**. Write `repeat(times)` so that\n```\n@repeat(3)\ndef ping():\n    return "pong"\n```\nmakes `ping()` call the original function 3 times and return the list of results: `["pong", "pong", "pong"]`.',
      example: { title: 'three levels', code: 'def tag(name):            # 1. takes the argument\n    def decorator(fn):       # 2. takes the function\n        def wrapper(*a, **k):   # 3. runs on each call\n            return f"<{name}>{fn(*a, **k)}"\n        return wrapper\n    return decorator' },
      starter: `import functools

def repeat(times):
    # TODO
    pass
`,
      solution: `import functools

def repeat(times):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            return [fn(*args, **kwargs) for _ in range(times)]
        return wrapper
    return decorator
`,
      tests: [
        { call: 'repeat(3)(lambda: "pong")()', expect: ['pong', 'pong', 'pong'] },
        { call: 'repeat(2)(lambda x, y=1: x * y)(5, y=2)', expect: [10, 10] },
        { call: '(lambda calls: (repeat(4)(lambda: calls.append(1))(), len(calls))[1])([])', expect: 4, msg: 'the original function must actually run `times` times' },
      ],
      explain: '`@repeat(3)` first **calls** `repeat(3)`, which must return the real decorator; that decorator receives the function and returns the wrapper. Writing only two levels makes Python pass the function as `times`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write a decorator `count_calls` that counts how many times the function was called and stores it in an attribute `calls` on the wrapper (starting at 0).\n\n```\n@count_calls\ndef add(a, b):\n    return a + b\nadd(1, 2); add(3, 4)\nadd.calls   # 2\n```',
      example: { title: 'functions can have attributes', code: 'def f():\n    pass\nf.visits = 0\nf.visits += 1\nprint(f.visits)   # 1' },
      starter: `import functools

def count_calls(fn):
    # TODO
    return fn
`,
      solution: `import functools

def count_calls(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return fn(*args, **kwargs)
    wrapper.calls = 0
    return wrapper
`,
      tests: [
        { call: '(lambda f: (f(1, 2), f(3, 4), f.calls)[2])(count_calls(lambda a, b: a + b))', expect: 2 },
        { call: '(lambda f: [f(10, 5), f.calls])(count_calls(lambda a, b: a - b))', expect: [5, 1], msg: 'the result must still be returned' },
        { call: 'count_calls(len).calls', expect: 0, msg: 'calls must start at 0 for each decorated function' },
      ],
      explain: 'Set `wrapper.calls = 0` once when decorating, and increment it inside the wrapper. Each decorated function gets its own wrapper, so counts are independent. A global counter would be shared by all functions.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Access control. Write `require_role(role)` so a decorated function receives a `user` dict as its **first** argument and runs only when `user["role"] == role`; otherwise it returns `"Access denied"`.\n\n```\n@require_role("admin")\ndef delete_course(user, course_id):\n    return f"Deleted {course_id}"\n```',
      example: { title: 'checking before calling', code: 'def only_positive(fn):\n    def wrapper(n):\n        if n < 0:\n            return "invalid"\n        return fn(n)\n    return wrapper' },
      starter: `import functools

def require_role(role):
    # TODO
    pass
`,
      solution: `import functools

def require_role(role):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(user, *args, **kwargs):
            if user.get("role") != role:
                return "Access denied"
            return fn(user, *args, **kwargs)
        return wrapper
    return decorator
`,
      tests: [
        { call: 'require_role("admin")(lambda user, cid: f"Deleted {cid}")({"name": "Asha", "role": "admin"}, 7)', expect: 'Deleted 7' },
        { call: 'require_role("admin")(lambda user, cid: f"Deleted {cid}")({"name": "Ravi", "role": "student"}, 7)', expect: 'Access denied' },
      ],
      explain: 'This is how web frameworks implement `@login_required` or permission checks: the wrapper decides whether to call the real function at all. Passing `user` on to `fn` keeps the original signature working.',
    },
  ],
};
