export default {
  lesson: 'day-22-pip-venv-requirements',
  minutes: 25,
  intro: 'Practise the pip / venv / requirements.txt workflow and write small helpers that read requirement lines and compare versions.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Why should every project have its own **virtual environment**?',
      options: [
        'It makes Python run faster',
        'Each project gets its own package versions, so projects do not break each other',
        'It is required to run any .py file',
        'It encrypts your source code',
      ],
      answer: 1,
      explain: 'Project A may need Django 4.2 and project B Django 5.1. A venv is an isolated folder with its own interpreter link and site-packages, so installs in one project do not affect another or the system Python.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the command that saves the exact versions of all installed packages into a requirements file:\n```\npip ____ > requirements.txt\n```',
      accept: ['freeze'],
      explain: '`pip freeze` prints `name==version` for every installed package; `>` redirects it into the file. Teammates then run `pip install -r requirements.txt` to get the same versions.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'On **Windows** (Command Prompt / PowerShell), how do you activate a venv created with `python -m venv venv`?',
      options: ['source venv/bin/activate', 'venv\\Scripts\\activate', 'pip activate venv', 'python venv activate'],
      answer: 1,
      explain: 'Windows puts the scripts in `venv\\Scripts\\`; macOS/Linux use `source venv/bin/activate`. After activating, the prompt shows `(venv)` and `pip install` goes into this project only. `deactivate` leaves it.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about version specifiers in requirements.txt are true? (select all that apply)',
      options: [
        '`requests==2.32.3` installs exactly that version',
        '`django>=4.2` allows 4.2 or any newer version, even 6.0',
        '`numpy~=1.26.0` allows 1.26.x but not 1.27',
        '`pandas` without a version always installs pandas 1.0',
        'The venv folder itself should be committed to Git',
      ],
      answers: [0, 1, 2],
      explain: '`==` pins exactly, `>=` sets only a minimum, `~=` is "compatible release" (same minor series). No specifier installs the **latest**. Never commit the venv folder: add it to .gitignore and commit requirements.txt instead.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `parse_requirements(text)` that reads the contents of a requirements.txt and returns a dict **package → version** for pinned lines (`name==version`). Ignore blank lines and comments (`#`); strip spaces; package names are lowercased. For lines without `==`, use the value `None`.\n\n```\ntext = """# web\nDjango==5.1.2\n\nrequests == 2.32.3\npandas\n"""\n```\n→ `{"django": "5.1.2", "requests": "2.32.3", "pandas": None}`',
      example: { title: 'splitting a line', code: 'line = " numpy==1.26.4 "\nname, ver = line.strip().split("==")\nprint(name, ver)   # numpy 1.26.4' },
      starter: `def parse_requirements(text):
    result = {}
    # TODO
    return result
`,
      solution: `def parse_requirements(text):
    result = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "==" in line:
            name, ver = line.split("==")
            result[name.strip().lower()] = ver.strip()
        else:
            result[line.lower()] = None
    return result
`,
      tests: [
        { call: 'parse_requirements("# web\\nDjango==5.1.2\\n\\nrequests == 2.32.3\\npandas\\n")', expect: { django: '5.1.2', requests: '2.32.3', pandas: null } },
        { call: 'parse_requirements("")', expect: {} },
      ],
      explain: '`splitlines()` gives each line; `strip()` removes spaces so "requests == 2.32.3" still works. Skip empty lines and comments before splitting, otherwise `split("==")` on a comment gives one part and unpacking fails.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `is_newer(v1, v2)` that returns `True` when version `v1` is newer than `v2` (versions like `"1.10.0"`).\n\nCareful: as strings, `"1.10.0" < "1.9.3"` is True, which is wrong! Compare the numbers instead.',
      example: { title: 'tuples compare item by item', code: 'print((1, 10, 0) > (1, 9, 3))   # True\nprint("1.10.0" > "1.9.3")      # False (string comparison!)' },
      starter: `def is_newer(v1, v2):
    return v1 > v2   # TODO: wrong for "1.10.0" vs "1.9.3"
`,
      solution: `def is_newer(v1, v2):
    a = tuple(int(x) for x in v1.split("."))
    b = tuple(int(x) for x in v2.split("."))
    return a > b
`,
      tests: [
        { call: 'is_newer("1.10.0", "1.9.3")', expect: true },
        { call: 'is_newer("2.0.0", "10.0.0")', expect: false },
        { call: 'is_newer("3.12.1", "3.12.1")', expect: false },
        { call: 'is_newer("5.1.2", "4.2.16")', expect: true },
      ],
      explain: 'Strings compare character by character ("1" < "9"), so "1.10" looks older than "1.9". Converting each part to int and comparing **tuples** compares major, then minor, then patch: exactly semantic versioning order.',
    },
  ],
};
