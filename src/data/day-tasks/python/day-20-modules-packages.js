export default {
  lesson: 'day-20-modules-packages',
  minutes: 25,
  intro: 'Use the different import styles, build packages with __init__.py and protect script code with the __main__ guard.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Why is `from math import *` discouraged in real projects?',
      options: [
        'It is slower than other imports',
        'It hides where names come from and can silently overwrite your own names',
        'It imports only half of the module',
        'It is a SyntaxError in Python 3',
      ],
      answer: 1,
      explain: '`import *` dumps every public name into your namespace: readers cannot tell where `sqrt` came from, and a later `from statistics import *` could overwrite names silently. Prefer `import math` or `from math import sqrt`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which file do you put inside a folder to make it a regular **package** (it may even be empty)?',
      accept: ['__init__.py', '__init__'],
      explain: '`__init__.py` marks a folder as a package and runs when the package is first imported. You can use it to expose names, e.g. `from .billing import total`.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'This file is run directly with `python main.py`. What is printed?',
      code: `import math
import math as m
from math import sqrt
print(__name__)
print(math.__name__)
print(m is math, sqrt(16))`,
      expected: '__main__\nmath\nTrue 4.0',
      explain: 'The file you run directly gets `__name__ == "__main__"`; an imported module gets its own name. Modules are imported **once** and cached in `sys.modules`, so `math` and the alias `m` are the same object. `sqrt` always returns a float.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are true? (select all that apply)',
      options: [
        'Importing a module a second time does not run its code again (it is cached in sys.modules)',
        'Python searches the folders listed in sys.path to find a module',
        'Naming your own file random.py can break `import random` in that folder',
        'Code under `if __name__ == "__main__":` runs when the file is imported',
      ],
      answers: [0, 1, 2],
      explain: 'Modules are cached after the first import, found via `sys.path` (the script’s folder comes first, so your own random.py shadows the standard one). The main-guard code runs only when the file is executed directly, **not** when imported.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Make this file safe to import. It is a module `gst.py` with a function `add_gst(amount, rate=18)` (returns amount + rate % rounded to 2) and some demo prints.\n\nThe grader **imports** your file, so nothing should be printed on import: move the demo prints under the `__main__` guard and finish the function.',
      example: { title: 'the main guard', code: 'def greet(name):\n    return "Hi " + name\n\nif __name__ == "__main__":\n    print(greet("Asha"))   # runs only with: python greet.py' },
      starter: `def add_gst(amount, rate=18):
    # TODO
    pass

print("Demo:", add_gst(100))
print("Demo:", add_gst(250, 5))
`,
      solution: `def add_gst(amount, rate=18):
    return round(amount + amount * rate / 100, 2)

if __name__ == "__main__":
    print("Demo:", add_gst(100))
    print("Demo:", add_gst(250, 5))
`,
      tests: [
        { call: 'add_gst(99.5)', expect: 117.41 },
        { call: 'add_gst(250, 5)', expect: 262.5 },
        { stdout: '', msg: 'Importing the module must print nothing (put the demo under if __name__ == "__main__":)' },
      ],
      explain: 'When imported, `__name__` is the module name, not "__main__", so guarded code is skipped. Without the guard, every `import gst` would print the demo lines, which is a common annoyance in real projects.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Use **from-import** and an **alias**:\n- import `pi` and `sqrt` from `math` with `from ... import ...`\n- import `statistics` as `st`\n\nThen write:\n- `circle_area(r)` → `pi * r * r` rounded to 2\n- `hypotenuse(a, b)` → `sqrt(a*a + b*b)`\n- `middle(values)` → `st.median(values)`',
      example: { title: 'import styles', code: 'import datetime as dt\nfrom random import choice\nprint(dt.date(2026, 1, 26), choice(["a", "b"]))' },
      starter: `# TODO: imports

def circle_area(r):
    pass

def hypotenuse(a, b):
    pass

def middle(values):
    pass
`,
      solution: `from math import pi, sqrt
import statistics as st

def circle_area(r):
    return round(pi * r * r, 2)

def hypotenuse(a, b):
    return sqrt(a * a + b * b)

def middle(values):
    return st.median(values)
`,
      tests: [
        { call: 'circle_area(7)', expect: 153.94 },
        { call: 'hypotenuse(3, 4) == 5', expect: true, msg: 'hypotenuse(3, 4) should be 5.0' },
        { call: 'middle([7, 1, 5])', expect: 5 },
        { call: "'st' in globals() and 'sqrt' in globals() and 'pi' in globals()", expect: true, msg: 'use from math import pi, sqrt and import statistics as st' },
      ],
      explain: '`from math import pi, sqrt` lets you use the names directly; `import statistics as st` gives a short alias you use as `st.median(...)`. After `import statistics as st`, the name `statistics` itself is NOT defined.',
    },
  ],
};
