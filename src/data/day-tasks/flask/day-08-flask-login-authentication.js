export default {
  lesson: 'day-08-flask-login-authentication',
  minutes: 35,
  intro: 'Practise password hashing, Flask-Login and safe redirects, and write the checks a real login system needs: password strength, verification and the open-redirect guard.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'How should a Flask app store user passwords?',
      options: ['Plain text, so admins can tell users their password', 'Encrypted with AES so they can be decrypted at login', 'As a salted hash with generate_password_hash(), checked with check_password_hash()', 'Base64-encoded in the session'],
      answer: 2,
      explain: 'Passwords must be **hashed** (one-way, with a random salt), never encrypted (reversible) or stored in plain text. Werkzeug\'s `generate_password_hash` uses a slow algorithm (scrypt/pbkdf2) with a salt, so the same password gives a different hash each time and leaked hashes are very hard to crack.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which pieces are needed to make Flask-Login work? (choose all that apply)',
      options: [
        'A LoginManager initialised with the app (login_manager.init_app(app))',
        'A @login_manager.user_loader function that returns the user for an id',
        'The User model inheriting UserMixin (gives is_authenticated, get_id ...)',
        'Storing the password hash in the session cookie',
        'login_manager.login_view so @login_required redirects to the login page',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Flask-Login keeps only the **user id** in the session; on every request `user_loader` turns that id back into a User object (`current_user`). `UserMixin` supplies the required properties, and `login_view` tells `@login_required` where to send anonymous users. Passwords never go into the session.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the decorator that blocks the dashboard for users who are not logged in:\n\n```\n@app.route(\'/dashboard\')\n______\ndef dashboard():\n    return render_template(\'dashboard.html\', user=current_user)\n```',
      accept: ['@login_required'],
      explain: '`@login_required` must sit **below** `@app.route` (decorators apply bottom-up, and the route must register the protected function). Anonymous users are redirected to `login_view` with `?next=/dashboard`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `password_errors(pw)` for the registration form. Return a list of the rules that FAIL (in this order, empty list = strong):\n1. `\'at least 8 characters\'`\n2. `\'an uppercase letter\'`\n3. `\'a lowercase letter\'`\n4. `\'a digit\'`\n5. `\'a special character\'` (anything that is not a letter or digit)',
      example: { title: 'testing characters with any()', code: "print(any(ch.isdigit() for ch in 'abc1'))   # True\nprint(any(ch.isupper() for ch in 'abc'))    # False" },
      starter: `def password_errors(pw):
    errors = []
    # TODO
    return errors
`,
      solution: `def password_errors(pw):
    errors = []
    if len(pw) < 8:
        errors.append('at least 8 characters')
    if not any(c.isupper() for c in pw):
        errors.append('an uppercase letter')
    if not any(c.islower() for c in pw):
        errors.append('a lowercase letter')
    if not any(c.isdigit() for c in pw):
        errors.append('a digit')
    if not any(not c.isalnum() for c in pw):
        errors.append('a special character')
    return errors
`,
      tests: [
        { call: "password_errors('Asha@2024')", expect: [] },
        { call: "password_errors('asha')", expect: ['at least 8 characters', 'an uppercase letter', 'a digit', 'a special character'] },
        { call: "password_errors('PASSWORD123')", expect: ['a lowercase letter', 'a special character'] },
        { call: "password_errors('')", expect: ['at least 8 characters', 'an uppercase letter', 'a lowercase letter', 'a digit', 'a special character'] },
      ],
      explain: 'Returning **all** failing rules lets the form show the user everything to fix at once. `isalnum()` is True for letters and digits, so `not c.isalnum()` detects symbols like `@ # !`. Strength checks run before hashing - the hash itself cannot be checked later.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Build a mini version of Werkzeug\'s hashing with a salt. Write:\n- `hash_password(pw, salt)` → `\'sha256$\' + salt + \'$\' + hashlib.sha256((salt + pw).encode()).hexdigest()`\n- `check_password(stored, pw)` → split `stored` on `$`, re-hash `pw` with the stored salt and return `True` only if it matches',
      example: { title: 'splitting a stored value', code: "algo, salt, digest = 'sha256$ab12$ff00'.split('$')\nprint(salt)   # ab12" },
      starter: `import hashlib

def hash_password(pw, salt):
    # TODO
    return pw

def check_password(stored, pw):
    # TODO
    return stored == pw
`,
      solution: `import hashlib

def hash_password(pw, salt):
    return 'sha256$' + salt + '$' + hashlib.sha256((salt + pw).encode()).hexdigest()

def check_password(stored, pw):
    algo, salt, digest = stored.split('$')
    return hash_password(pw, salt) == stored
`,
      tests: [
        { call: "hash_password('Secret@1', 'x9').startswith('sha256$x9$')", expect: true },
        { call: "hash_password('Secret@1', 'x9') != hash_password('Secret@1', 'k2')", expect: true, msg: 'Different salts must give different hashes' },
        { call: "check_password(hash_password('Secret@1', 'x9'), 'Secret@1')", expect: true },
        { call: "check_password(hash_password('Secret@1', 'x9'), 'secret@1')", expect: false },
        { call: "'Secret@1' in hash_password('Secret@1', 'x9')", expect: false, msg: 'The stored value must not contain the plain password' },
      ],
      explain: 'The salt is stored **next to** the hash so the same password can be re-hashed at login and compared. Because every user gets a random salt, two users with the same password have different hashes and pre-computed "rainbow tables" are useless. Real apps use slow algorithms (scrypt, bcrypt, argon2) instead of a single sha256 - use `generate_password_hash`, never roll your own in production.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'After login Flask apps redirect to `request.args.get(\'next\')`. An attacker can send `?next=https://evil.com`. Write `safe_next(next_url)` that returns `next_url` only if it is a **relative path on our site** (starts with a single `/`, does not start with `//`, and has no `://`), otherwise returns `\'/dashboard\'`. `None` or `\'\'` also give `\'/dashboard\'`.',
      example: { title: 'string checks', code: "u = '/courses?page=2'\nprint(u.startswith('/'), u.startswith('//'), '://' in u)   # True False False" },
      starter: `def safe_next(next_url):
    # TODO
    return next_url
`,
      solution: `def safe_next(next_url):
    if not next_url:
        return '/dashboard'
    if next_url.startswith('/') and not next_url.startswith('//') and '://' not in next_url:
        return next_url
    return '/dashboard'
`,
      tests: [
        { call: "safe_next('/profile')", expect: '/profile' },
        { call: "safe_next('/courses?page=2')", expect: '/courses?page=2' },
        { call: "safe_next('https://evil.com/login')", expect: '/dashboard' },
        { call: "safe_next('//evil.com')", expect: '/dashboard' },
        { call: 'safe_next(None)', expect: '/dashboard' },
        { call: "safe_next('')", expect: '/dashboard' },
      ],
      explain: 'This prevents an **open redirect**: a phishing link to your real login page that sends users to a fake site after they log in. `//evil.com` is a protocol-relative URL, so it must be blocked too. Real apps check with `urlsplit(next).netloc == \'\'`.',
    },
  ],
};
