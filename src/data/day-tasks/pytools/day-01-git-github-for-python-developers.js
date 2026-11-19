export default {
  lesson: 'day-01-git-github-for-python-developers',
  minutes: 25,
  intro: 'Check your Git and GitHub basics: staging and committing, .gitignore for Python projects, branches, merge conflicts, pull requests and clean commit messages. Git cannot run in the browser, so the hands-on parts are small Python helpers around Git concepts.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between Git and GitHub?',
      options: ['They are the same thing', 'Git is the version control tool on your computer; GitHub is a website that hosts Git repositories and adds pull requests, issues and CI', 'GitHub is the command-line tool and Git is the website', 'Git only works with GitHub'],
      answer: 1,
      explain: 'Git tracks history locally and works offline. GitHub (like GitLab or Bitbucket) hosts remote repositories and adds collaboration features such as pull requests, code review, issues and Actions.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You edited `app.py` and want ONLY that file in the next commit. Which commands are correct?',
      options: ['`git commit app.py -m "msg"` then `git add`', '`git add app.py` then `git commit -m "Fix login redirect"`', '`git push app.py`', '`git init app.py`'],
      answer: 1,
      explain: '`git add` moves changes into the **staging area**; `git commit` saves exactly what is staged as a snapshot. `git push` uploads commits to the remote; `git init` creates a new repository.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these should be listed in a Python project\'s `.gitignore`? (choose all that apply)',
      options: ['`venv/` or `.venv/`', '`__pycache__/`', '`.env`', '`requirements.txt`', '`*.pyc`', '`README.md`'],
      answers: [0, 1, 2, 4],
      explain: 'Ignore things that are generated or secret: virtual environments (recreate with pip), bytecode caches, and `.env` with passwords and API keys. `requirements.txt` and `README.md` MUST be committed because others need them.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the single command that creates a new branch called `feature/login` AND switches to it (modern syntax).',
      accept: ['git switch -c feature/login', 'git checkout -b feature/login', 'git switch --create feature/login'],
      explain: '`git switch -c <name>` (Git 2.23+) or the older `git checkout -b <name>` create the branch from the current commit and switch to it. Work on feature branches keeps `main` stable.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'During a merge, Git writes this into `config.py`. Which version is from the branch you are merging IN (`feature`)? Type the value of `TIMEOUT` from that side.',
      code: `print("""<<<<<<< HEAD
TIMEOUT = 30
=======
TIMEOUT = 60
>>>>>>> feature""".split("=======")[1].split()[2])`,
      expected: '60',
      explain: 'Between `<<<<<<< HEAD` and `=======` is YOUR current branch; between `=======` and `>>>>>>> feature` is the incoming branch. Resolve by editing the file to the correct final content, removing all markers, then `git add` and `git commit`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Teams use **Conventional Commits**. Write `is_conventional(msg)` that returns True if the FIRST line of `msg`:\n- starts with a type from `feat, fix, docs, style, refactor, test, chore`\n- optionally has a scope in brackets, e.g. `feat(auth)`\n- optionally has `!` for breaking changes\n- then `: ` and a description\n- and the whole first line is at most 72 characters',
      example: { title: 'regex building blocks', code: 'import re\nre.match(r"^(add|remove)(\\([a-z]+\\))?: .+", "add(cart): pen")  # match' },
      starter: 'import re\n\ndef is_conventional(msg):\n    # TODO\n    return True\n',
      solution: 'import re\n\nPATTERN = re.compile(r"^(feat|fix|docs|style|refactor|test|chore)(\\([\\w-]+\\))?!?: \\S.*$")\n\ndef is_conventional(msg):\n    first = msg.splitlines()[0] if msg else ""\n    return len(first) <= 72 and bool(PATTERN.match(first))\n',
      tests: [
        { call: 'is_conventional("feat(auth): add OTP login")', expect: true },
        { call: 'is_conventional("fix: handle empty cart\\n\\nLonger body text here.")', expect: true },
        { call: 'is_conventional("feat!: drop Python 3.8 support")', expect: true },
        { call: 'is_conventional("updated stuff")', expect: false },
        { call: 'is_conventional("Fix: typo")', expect: false, msg: 'Types are lower case' },
        { call: 'is_conventional("docs: " + "x" * 80)', expect: false, msg: 'First line too long' },
        { call: 'is_conventional("")', expect: false },
      ],
      explain: 'A clear format ("type(scope): what changed") makes history readable and lets tools generate changelogs and version bumps automatically. Only the first line (the subject) is checked; the body after a blank line can be longer.',
    },
  ],
};
