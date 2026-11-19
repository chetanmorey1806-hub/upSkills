export default {
  lesson: 'day-36-context-managers',
  minutes: 30,
  intro: 'Write class-based and @contextmanager context managers that always clean up, and control exceptions inside __exit__.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `class Trace:
    def __enter__(self):
        print("enter")
        return "resource"
    def __exit__(self, exc_type, exc, tb):
        print("exit", exc_type.__name__ if exc_type else None)
        return True

with Trace() as r:
    print("using", r)
    1 / 0
    print("never")
print("after")`,
      expected: 'enter\nusing resource\nexit ZeroDivisionError\nafter',
      explain: '`as r` receives what `__enter__` **returns**. When the block raises, Python calls `__exit__` with the exception details. Returning **True** from `__exit__` suppresses the exception, so the program continues with "after"; the rest of the block is skipped.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Your `__exit__` returns `None` (no return statement) and an exception happened in the with block. What happens?',
      options: [
        'The exception is suppressed',
        'The exception continues (is re-raised) after __exit__ finishes',
        '__exit__ is not called',
        'Python raises TypeError',
      ],
      answer: 1,
      explain: 'Only a **truthy** return value suppresses the exception; None/False lets it propagate after clean-up. That is the safe default: hide exceptions only on purpose.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Class-based context manager. Create `DBConnection(log)` where `log` is a list:\n- `__enter__` appends `"open"` and returns the object\n- `__exit__` appends `"commit"` when there was **no** exception, or `"rollback"` when there was one, then always appends `"close"`. It must **not** suppress exceptions.',
      example: { title: 'enter / exit', code: 'class Door:\n    def __enter__(self):\n        print("open door")\n        return self\n    def __exit__(self, exc_type, exc, tb):\n        print("close door")\n        return False' },
      starter: `class DBConnection:
    def __init__(self, log):
        self.log = log
    # TODO: __enter__ and __exit__
`,
      solution: `class DBConnection:
    def __init__(self, log):
        self.log = log

    def __enter__(self):
        self.log.append("open")
        return self

    def __exit__(self, exc_type, exc, tb):
        self.log.append("commit" if exc_type is None else "rollback")
        self.log.append("close")
        return False
`,
      tests: [
        { call: `exec("_log = []\\nwith DBConnection(_log) as db:\\n    _same = db.log is _log") or [_log, _same]`, expect: [['open', 'commit', 'close'], true], msg: 'normal block → open, commit, close (and `as` gives the connection)' },
        { call: `exec("_log2 = []\\ntry:\\n    with DBConnection(_log2):\\n        raise ValueError('bad row')\\n    _e = 'suppressed'\\nexcept ValueError:\\n    _e = 'raised'") or [_log2, _e]`, expect: [['open', 'rollback', 'close'], 'raised'], msg: 'error in block → open, rollback, close, and the ValueError must still be raised' },
      ],
      explain: '`exc_type` is None when the block finished normally. Return False (or nothing) so the caller still sees the error after the rollback; returning True would silently hide failed database writes.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Generator-based context manager. Using `@contextmanager`, write `temp_setting(settings, key, value)` that sets `settings[key] = value` for the duration of the with block and then **restores the old value**, even if the block raises.',
      example: { title: '@contextmanager shape', code: 'from contextlib import contextmanager\n\n@contextmanager\ndef tag(name):\n    print(f"<{name}>")\n    try:\n        yield\n    finally:\n        print(f"</{name}>")' },
      starter: `from contextlib import contextmanager

def temp_setting(settings, key, value):
    # TODO
    pass
`,
      solution: `from contextlib import contextmanager

@contextmanager
def temp_setting(settings, key, value):
    old = settings[key]
    settings[key] = value
    try:
        yield settings
    finally:
        settings[key] = old
`,
      tests: [
        { call: `exec("_s = {'debug': False}\\nwith temp_setting(_s, 'debug', True):\\n    _inside = _s['debug']") or [_inside, _s['debug']]`, expect: [true, false], msg: 'inside the block the value is changed, after it is restored' },
        { call: `exec("_s2 = {'lang': 'en'}\\ntry:\\n    with temp_setting(_s2, 'lang', 'hi'):\\n        raise KeyError('x')\\nexcept KeyError:\\n    pass") or _s2`, expect: { lang: 'en' }, msg: 'the old value must be restored even when the block raises (use try/finally)' },
      ],
      explain: 'Code before `yield` is the "enter" part, code after it the "exit" part. Without `try/finally`, an exception inside the with block is raised **at the yield** and the restore line never runs.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the standard-library helper that ignores a missing file while deleting it:\n```\nfrom contextlib import ____\nwith ____(FileNotFoundError):\n    os.remove("temp.txt")\n```',
      accept: ['suppress'],
      explain: '`contextlib.suppress(*exceptions)` swallows only the listed exceptions, a clean replacement for `try: ... except FileNotFoundError: pass`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write your own `Ignore(*exc_types)` class that behaves like `contextlib.suppress`: exceptions of the given types are swallowed, all others propagate.',
      example: { title: 'issubclass for exception types', code: 'print(issubclass(ZeroDivisionError, ArithmeticError))   # True\nprint(issubclass(KeyError, (ValueError, LookupError)))   # True' },
      starter: `class Ignore:
    def __init__(self, *exc_types):
        self.exc_types = exc_types
    # TODO
`,
      solution: `class Ignore:
    def __init__(self, *exc_types):
        self.exc_types = exc_types

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return exc_type is not None and issubclass(exc_type, self.exc_types)
`,
      tests: [
        { call: `exec("with Ignore(ZeroDivisionError):\\n    1 / 0\\n_ok = 'swallowed'") or _ok`, expect: 'swallowed' },
        { call: `exec("try:\\n    with Ignore(KeyError):\\n        int('x')\\n    _r = 'swallowed'\\nexcept ValueError:\\n    _r = 'propagated'") or _r`, expect: 'propagated', msg: 'other exceptions must propagate' },
        { call: `exec("with Ignore(LookupError):\\n    {}['k']\\n_ok2 = 'subclass ok'") or _ok2`, expect: 'subclass ok', msg: 'subclasses (KeyError is a LookupError) must also be swallowed' },
      ],
      explain: '`__exit__` returns True only for matching types; `issubclass(exc_type, tuple_of_types)` also accepts subclasses. Check `exc_type is not None` first: issubclass(None, ...) raises TypeError when no exception happened.',
    },
  ],
};
