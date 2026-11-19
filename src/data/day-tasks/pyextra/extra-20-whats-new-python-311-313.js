export default {
  lesson: 'extra-20-whats-new-python-311-313',
  minutes: 25,
  intro: 'Use the newer Python features: ExceptionGroup and except*, exception notes, tomllib, typing.Self, @override and the 3.12 generic syntax, and know the 3.13 changes.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the main reason Python 3.11 runs typical code 10-60% faster than 3.10?',
      options: ['It removed the GIL', 'A built-in JIT compiler is enabled by default', 'The Faster CPython work: a specializing adaptive interpreter, cheaper frames and zero-cost exceptions', 'It compiles Python to C'],
      answer: 2,
      explain: '3.11 added a **specializing adaptive interpreter** that rewrites hot bytecode into faster type-specific versions, plus lighter frames. The free-threaded (no-GIL) build and the experimental JIT arrived later, in 3.13, and are not the defaults.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about Python 3.13 are TRUE? (choose all that apply)',
      options: ['It has an experimental free-threaded build where the GIL can be disabled', 'It includes an experimental JIT that is off by default', 'It has a new interactive REPL with multi-line editing and colours', 'The GIL is removed from the standard build', 'Free-threading is the default for all installs'],
      answers: [0, 1, 2],
      explain: 'Free-threading (PEP 703) is a **separate, experimental build** (`python3.13t`); the normal build still has the GIL. The JIT also has to be enabled at build time. The new REPL is the default in 3.13.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `def run():
    raise ExceptionGroup("batch failed", [
        ValueError("bad price"),
        TypeError("bad type"),
        ValueError("bad qty"),
    ])

try:
    run()
except* ValueError as eg:
    print("values:", len(eg.exceptions))
except* TypeError as eg:
    print("types:", [str(e) for e in eg.exceptions])`,
      expected: "values: 2\ntypes: ['bad type']",
      explain: 'Unlike `except`, **every** matching `except*` block runs, each receiving a sub-group with only its matching exceptions. That is why both lines print. This is useful when several concurrent tasks fail at once (e.g. asyncio.TaskGroup).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Validate a list of student rows and report ALL problems at once. Write `validate(rows)` where each row is `(name, marks)`. Collect a `ValueError(f"{name}: marks out of range")` for marks outside 0-100 and a `TypeError(f"{name}: marks not a number")` when marks is not an int. If any errors were found, raise `ExceptionGroup("invalid rows", errors)`; otherwise return `"ok"`. Then write `summary(rows)` that calls `validate` and uses `except*` to return a dict `{"value": count, "type": count}` (or `"ok"`).',
      example: { title: 'raising and catching a group', code: 'errors = [ValueError("a"), KeyError("b")]\ntry:\n    raise ExceptionGroup("many", errors)\nexcept* KeyError as eg:\n    print("keys", len(eg.exceptions))\nexcept* ValueError as eg:\n    print("values", len(eg.exceptions))' },
      starter: 'def validate(rows):\n    errors = []\n    # TODO\n    return "ok"\n\ndef summary(rows):\n    # TODO: try / except*\n    return validate(rows)\n',
      solution: 'def validate(rows):\n    errors = []\n    for name, marks in rows:\n        if not isinstance(marks, int):\n            errors.append(TypeError(f"{name}: marks not a number"))\n        elif not 0 <= marks <= 100:\n            errors.append(ValueError(f"{name}: marks out of range"))\n    if errors:\n        raise ExceptionGroup("invalid rows", errors)\n    return "ok"\n\ndef summary(rows):\n    counts = {"value": 0, "type": 0}\n    try:\n        return validate(rows)\n    except* ValueError as eg:\n        counts["value"] = len(eg.exceptions)\n    except* TypeError as eg:\n        counts["type"] = len(eg.exceptions)\n    return counts\n',
      tests: [
        { call: 'summary([("Asha", 90), ("Ravi", 45)])', expect: 'ok' },
        { call: 'summary([("Asha", 120), ("Ravi", "ninety"), ("Om", -5)])', expect: { value: 2, type: 1 } },
        { call: 'summary([("Meera", 3.5)])', expect: { value: 0, type: 1 } },
      ],
      explain: 'Raising only the first error makes users fix problems one at a time. An ExceptionGroup carries all of them, and `except*` lets each handler process its own kind. A plain `except ValueError` would NOT catch an ExceptionGroup.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Exception notes (3.11). Write `load_price(row_no, text)` that converts `text` to float. If that raises `ValueError`, add a note with `e.add_note(f"while reading row {row_no}")` and re-raise. Also write `explain_error(row_no, text)` that calls `load_price` and returns the list `e.__notes__` from the caught ValueError (or `[]` when there is no error).',
      example: { title: 'add_note', code: 'try:\n    int("abc")\nexcept ValueError as e:\n    e.add_note("hint: the column must contain digits")\n    raise' },
      starter: 'def load_price(row_no, text):\n    return float(text)\n\ndef explain_error(row_no, text):\n    # TODO\n    return []\n',
      solution: 'def load_price(row_no, text):\n    try:\n        return float(text)\n    except ValueError as e:\n        e.add_note(f"while reading row {row_no}")\n        raise\n\ndef explain_error(row_no, text):\n    try:\n        load_price(row_no, text)\n    except ValueError as e:\n        return e.__notes__\n    return []\n',
      tests: [
        { call: 'load_price(1, "99.5")', expect: 99.5 },
        { call: 'explain_error(7, "₹99")', expect: ['while reading row 7'] },
        { call: 'explain_error(2, "10")', expect: [] },
      ],
      explain: 'Notes add context to an exception without wrapping it in a new type, and they are shown under the traceback. Use a bare `raise` to re-raise the SAME exception object so the original traceback is kept.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Use `typing.Self` (3.11) for a fluent builder. Write class `Query` with `__init__` setting `self.parts = []`, methods `where(cond) -> Self` and `limit(n) -> Self` that append `f"WHERE {cond}"` / `f"LIMIT {n}"` and return `self`, and `build() -> str` that returns `"SELECT * FROM t"` followed by the parts joined with spaces.',
      example: { title: 'returning Self', code: 'from typing import Self\n\nclass Counter:\n    def __init__(self): self.n = 0\n    def inc(self) -> Self:\n        self.n += 1\n        return self\n\nCounter().inc().inc().n  # 2' },
      starter: 'from typing import Self\n\nclass Query:\n    def __init__(self):\n        self.parts = []\n    # TODO\n',
      solution: 'from typing import Self\n\nclass Query:\n    def __init__(self):\n        self.parts = []\n    def where(self, cond: str) -> Self:\n        self.parts.append(f"WHERE {cond}")\n        return self\n    def limit(self, n: int) -> Self:\n        self.parts.append(f"LIMIT {n}")\n        return self\n    def build(self) -> str:\n        return " ".join(["SELECT * FROM t", *self.parts])\n',
      tests: [
        { call: 'Query().where("city = \'Pune\'").limit(5).build()', expect: "SELECT * FROM t WHERE city = 'Pune' LIMIT 5" },
        { call: 'Query().build()', expect: 'SELECT * FROM t' },
        { call: 'Query.where.__annotations__["return"] is __import__("typing").Self', expect: true, msg: 'where must be annotated -> Self' },
      ],
      explain: '`Self` means "an instance of whatever class this is", so a subclass of Query also gets the right type from `where()`. Before 3.11 you needed a bound TypeVar for this.',
    },
  ],
};
