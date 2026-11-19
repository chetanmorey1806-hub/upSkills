export default {
  lesson: 'day-20-user-authentication',
  minutes: 35,
  intro: 'Practise authenticate/login/logout, the built-in auth views, @login_required and LoginRequiredMixin, and how Django stores passwords - with real Django hashing and plain-Python checks.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `authenticate(request, username=\'asha\', password=\'Secret@123\')` return when the password is wrong?',
      options: ['False', 'None', 'It raises PermissionDenied', 'An AnonymousUser'],
      answer: 1,
      explain: '`authenticate()` returns the **User** if the credentials are valid, otherwise `None`. It does not log anyone in - you call `login(request, user)` afterwards, which stores the user id in the session.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the decorator so anonymous users are sent to the login page:\n\n```\n______\ndef dashboard(request):\n    return render(request, \'dashboard.html\')\n```',
      accept: ['@login_required'],
      explain: '`@login_required` redirects anonymous users to `settings.LOGIN_URL` with `?next=/dashboard/`. For class-based views use `LoginRequiredMixin` as the **first** base class.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        "path('accounts/', include('django.contrib.auth.urls')) adds login, logout and password change/reset URLs",
        'In Django 5 the logout view must be called with POST, not a GET link',
        'UserCreationForm validates that both passwords match and runs the password validators',
        'request.user.is_authenticated is True for logged-in users',
        'User passwords are stored encrypted so admins can read them',
      ],
      answers: [0, 1, 2, 3],
      explain: 'The auth URLs give ready-made views (you provide templates in `registration/`). Django 5 removed GET logout - use a small POST form. Passwords are **hashed** (PBKDF2 by default, one-way), never readable - not even by admins.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from django.contrib.auth.hashers import make_password, check_password, identify_hasher

h1 = make_password('Secret@123')
h2 = make_password('Secret@123')
print(h1.split('$')[0], h1.count('$'))
print(h1 == h2)
print(check_password('Secret@123', h1), check_password('secret@123', h1))
print(identify_hasher(h1).algorithm)`,
      expected: 'pbkdf2_sha256 3\nFalse\nTrue False\npbkdf2_sha256',
      explain: 'Django stores `algorithm$iterations$salt$hash`. Because each call uses a new random **salt**, hashing the same password twice gives different strings, yet `check_password` still verifies it. Passwords are case-sensitive.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Implement Django-style password storage with a simplified key-stretching hash (real Django uses PBKDF2). Write:\n- `make_password(raw, salt, iterations=1000)` → `f\'sha256_iter${iterations}${salt}${b64}\'` where you start with `d = (salt + raw).encode()`, repeat `iterations` times `d = hashlib.sha256(d).digest()`, and `b64` = `base64.b64encode(d).decode()`\n- `check_password(raw, encoded)` → split the 4 parts, re-hash with the stored salt and iterations, compare with `hmac.compare_digest`',
      example: { title: 'repeating a hash', code: "import hashlib, base64\nd = b'saltpw'\nfor _ in range(3):\n    d = hashlib.sha256(d).digest()\nprint(base64.b64encode(d).decode()[:10])" },
      starter: `import base64, hashlib, hmac

def make_password(raw, salt, iterations=1000):
    # TODO
    return raw

def check_password(raw, encoded):
    # TODO
    return raw == encoded
`,
      solution: `import base64, hashlib, hmac

def make_password(raw, salt, iterations=1000):
    d = (salt + raw).encode()
    for _ in range(iterations):
        d = hashlib.sha256(d).digest()
    return f'sha256_iter\${iterations}\${salt}\${base64.b64encode(d).decode()}'

def check_password(raw, encoded):
    algorithm, iterations, salt, _ = encoded.split('$')
    return hmac.compare_digest(make_password(raw, salt, int(iterations)), encoded)
`,
      tests: [
        { call: "make_password('Secret@123', 'abc', 1000).split('$')[:3]", expect: ['sha256_iter', '1000', 'abc'] },
        { call: "make_password('Secret@123', 'abc') != make_password('Secret@123', 'xyz')", expect: true, msg: 'Different salts must give different hashes' },
        { call: "check_password('Secret@123', make_password('Secret@123', 'n4cl', 2000))", expect: true },
        { call: "check_password('Secret@124', make_password('Secret@123', 'n4cl', 2000))", expect: false },
        { call: "'Secret@123' in make_password('Secret@123', 'abc')", expect: false },
      ],
      explain: 'This mirrors the format of `auth_user.password` (`pbkdf2_sha256$iterations$salt$hash`). Storing the algorithm and iteration count lets Django upgrade hashes over time (it re-hashes with more iterations at the next login). Repeating the hash many times (Django\'s PBKDF2 uses hundreds of thousands of iterations) makes brute-force attacks expensive. Never write your own in production - use `make_password`/`check_password`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `login_required_check(user, path, login_url=\'/accounts/login/\')` that returns what `@login_required` does: `None` if `user` is authenticated (a dict with `is_authenticated: True`), otherwise the redirect URL `login_url + \'?next=\' + quote(path)` using `urllib.parse.quote` (keep `/` unescaped). `user` may be `None` (anonymous).',
      example: { title: 'quote a path', code: "from urllib.parse import quote\nprint(quote('/fees/?term=2'))   # /fees/%3Fterm%3D2" },
      starter: `from urllib.parse import quote

def login_required_check(user, path, login_url='/accounts/login/'):
    # TODO
    return None
`,
      solution: `from urllib.parse import quote

def login_required_check(user, path, login_url='/accounts/login/'):
    if user and user.get('is_authenticated'):
        return None
    return login_url + '?next=' + quote(path)
`,
      tests: [
        { call: "login_required_check({'username': 'asha', 'is_authenticated': True}, '/dashboard/')", expect: null },
        { call: "login_required_check(None, '/dashboard/')", expect: '/accounts/login/?next=/dashboard/' },
        { call: "login_required_check({'is_authenticated': False}, '/fees/?term=2', '/login/')", expect: '/login/?next=/fees/%3Fterm%3D2' },
      ],
      explain: 'The `next` parameter brings the user back to the page they wanted after logging in. It must be URL-encoded (the `?` and `=` of the original URL would otherwise mix with the login URL\'s own query string). `LoginView` then redirects safely to `next`.',
    },
  ],
};
