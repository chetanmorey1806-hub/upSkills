export default {
  lesson: 'extra-01-match-case-pattern-matching',
  minutes: 25,
  intro: 'Practise structural pattern matching: literal, capture and wildcard patterns, sequence and mapping patterns, class patterns and guards.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A `match` statement has three `case` blocks and the FIRST one matches. What happens next?',
      options: ['The other cases also run (fall-through) until a `break`', 'Only the first matching case runs, then Python leaves the match', 'Python raises an error because more than one case could match', 'The last matching case wins'],
      answer: 1,
      explain: 'match-case has **no fall-through**: exactly one case (the first that matches) runs and no `break` is needed. If nothing matches and there is no `case _`, nothing happens and no error is raised. People coming from C/Java often expect fall-through.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about patterns are TRUE? (choose all that apply)',
      options: ['`case _:` matches anything and binds no name', '`case code:` (a bare name) is a capture pattern that always matches', '`case "y" | "yes":` is an OR-pattern', 'A guard `if ...` is checked BEFORE the structure is matched', '`case {"type": "click"}:` fails if the dict has extra keys'],
      answers: [0, 1, 2],
      explain: 'A bare name captures (and always matches), `_` is the wildcard, and `|` joins alternatives. A guard runs only **after** a successful structural match. Mapping patterns match if the listed keys exist; **extra keys are ignored** (use `**rest` to capture them).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `def describe(cmd):
    match cmd.split():
        case ["go", direction]:
            return f"move {direction}"
        case ["drop", *items]:
            return f"drop {len(items)}"
        case ["quit" | "exit"]:
            return "bye"
        case _:
            return "unknown"

print(describe("go north"))
print(describe("drop pen book bag"))
print(describe("exit"))
print(describe("go"))`,
      expected: 'move north\ndrop 3\nbye\nunknown',
      explain: '`["go", direction]` needs exactly 2 items, so plain `"go"` (1 item) falls to `case _`. `*items` collects any number of remaining items. `"quit" | "exit"` is an OR-pattern inside a sequence pattern.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `http_message(code)` using **match-case** that returns:\n- `"OK"` for 200 or 201\n- `"Not Found"` for 404\n- `"Server Error"` for any code from 500 to 599 (use a guard)\n- `"Unknown"` otherwise',
      example: { title: 'OR-pattern and guard', code: 'match marks:\n    case 100:\n        grade = "perfect"\n    case m if m >= 35:\n        grade = "pass"\n    case _:\n        grade = "fail"' },
      starter: 'def http_message(code):\n    # TODO: use match code: ...\n    pass\n',
      solution: 'def http_message(code):\n    match code:\n        case 200 | 201:\n            return "OK"\n        case 404:\n            return "Not Found"\n        case c if 500 <= c <= 599:\n            return "Server Error"\n        case _:\n            return "Unknown"\n',
      tests: [
        { call: 'http_message(200)', expect: 'OK' },
        { call: 'http_message(201)', expect: 'OK' },
        { call: 'http_message(404)', expect: 'Not Found' },
        { call: 'http_message(503)', expect: 'Server Error' },
        { call: 'http_message(599)', expect: 'Server Error' },
        { call: 'http_message(302)', expect: 'Unknown' },
      ],
      explain: '`200 | 201` is an OR-pattern of literals. `case c if 500 <= c <= 599` captures the value and then checks the guard. Keep `case _` last: a capture or wildcard before other cases would make them unreachable (Python raises SyntaxError for an irrefutable pattern that is not last).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'An app receives events as dicts. Write `handle(event)` with match-case **mapping patterns**:\n- `{"type": "order", "item": item, "qty": qty}` → `"order item x qty"` e.g. `"order pen x 3"`\n- `{"type": "refund", "amount": amt}` where amt > 0 → `"refund amt"` e.g. `"refund 250"`\n- anything else → `"ignored"`',
      example: { title: 'mapping pattern', code: 'match user:\n    case {"name": name, "city": "Pune"}:\n        print(name, "lives in Pune")\n    case {"name": name}:\n        print(name)' },
      starter: 'def handle(event):\n    # TODO\n    return None\n',
      solution: 'def handle(event):\n    match event:\n        case {"type": "order", "item": item, "qty": qty}:\n            return f"order {item} x {qty}"\n        case {"type": "refund", "amount": amt} if amt > 0:\n            return f"refund {amt}"\n        case _:\n            return "ignored"\n',
      tests: [
        { call: 'handle({"type": "order", "item": "pen", "qty": 3})', expect: 'order pen x 3' },
        { call: 'handle({"type": "order", "item": "bag", "qty": 1, "user": "asha"})', expect: 'order bag x 1', msg: 'Extra keys must be ignored' },
        { call: 'handle({"type": "refund", "amount": 250})', expect: 'refund 250' },
        { call: 'handle({"type": "refund", "amount": 0})', expect: 'ignored', msg: 'Refund of 0 is ignored (guard)' },
        { call: 'handle({"type": "login"})', expect: 'ignored' },
        { call: 'handle("hello")', expect: 'ignored' },
      ],
      explain: 'Mapping patterns check that the listed keys exist and their values match; extra keys are allowed. The guard `if amt > 0` runs after the structure matched. A non-dict subject such as a string simply does not match a mapping pattern.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Use a **class pattern**. A dataclass `Point(x, y)` is given in the starter. Write `where(p)` that returns:\n- `"origin"` for Point(0, 0)\n- `"on x-axis"` when y is 0\n- `"on y-axis"` when x is 0\n- `"diagonal"` when x == y (guard)\n- `"somewhere"` otherwise',
      example: { title: 'class pattern with positional args', code: '@dataclass\nclass Size:\n    w: int\n    h: int\n\nmatch s:\n    case Size(0, _):\n        print("no width")\n    case Size(w, h) if w == h:\n        print("square")' },
      starter: 'from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: int\n    y: int\n\ndef where(p):\n    # TODO: match p: case Point(...)\n    return "somewhere"\n',
      solution: 'from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: int\n    y: int\n\ndef where(p):\n    match p:\n        case Point(0, 0):\n            return "origin"\n        case Point(_, 0):\n            return "on x-axis"\n        case Point(0, _):\n            return "on y-axis"\n        case Point(x, y) if x == y:\n            return "diagonal"\n        case _:\n            return "somewhere"\n',
      tests: [
        { call: 'where(Point(0, 0))', expect: 'origin' },
        { call: 'where(Point(5, 0))', expect: 'on x-axis' },
        { call: 'where(Point(0, -2))', expect: 'on y-axis' },
        { call: 'where(Point(3, 3))', expect: 'diagonal' },
        { call: 'where(Point(2, 7))', expect: 'somewhere' },
      ],
      explain: 'Dataclasses generate `__match_args__ = ("x", "y")`, so positional sub-patterns like `Point(_, 0)` work. Order matters: `Point(0, 0)` must come before the axis cases, otherwise the origin would be reported as "on x-axis".',
    },
  ],
};
