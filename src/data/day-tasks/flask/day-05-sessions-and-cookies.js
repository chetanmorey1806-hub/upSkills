export default {
  lesson: 'day-05-sessions-and-cookies',
  minutes: 30,
  intro: 'Practise cookies, the Flask session, cookie security flags and a session-based cart, and write the logic that powers them.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Where does Flask\'s default `session` store its data?',
      options: ['In a database table called sessions', 'In server memory only', 'In a cookie on the browser, signed with SECRET_KEY (readable but not changeable)', 'In localStorage'],
      answer: 2,
      explain: 'Flask\'s default session is a **signed cookie**: the data is base64-encoded JSON plus a signature made with `SECRET_KEY`. The user can **read** it but cannot **change** it without breaking the signature. So never store passwords or secrets in it; for large/secret data use server-side sessions (Flask-Session) or the database.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which cookie settings improve security? (choose all that apply)',
      options: ['HttpOnly - JavaScript cannot read the cookie', 'Secure - sent only over HTTPS', 'SameSite=Lax - not sent on most cross-site requests', 'max_age=999999999 - keeps users logged in forever', 'Storing the plain password in a cookie for "remember me"'],
      answers: [0, 1, 2],
      explain: '**HttpOnly** blocks theft through XSS, **Secure** blocks sending over plain HTTP, **SameSite** helps against CSRF. Very long lifetimes and passwords in cookies are bad ideas. In Flask: `SESSION_COOKIE_HTTPONLY`, `SESSION_COOKIE_SECURE`, `SESSION_COOKIE_SAMESITE`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line that sets a cookie `theme` with value `dark` for 30 days on the response object `resp`:\n\n```\nresp = make_response(\'Theme saved\')\n______\nreturn resp\n```',
      accept: ["resp.set_cookie('theme', 'dark', max_age=30*24*60*60)", "resp.set_cookie('theme', 'dark', max_age=2592000)", "resp.set_cookie('theme', 'dark', max_age=60*60*24*30)", "resp.set_cookie('theme', 'dark', max_age=30*24*3600)", "resp.set_cookie('theme', value='dark', max_age=2592000)", "resp.set_cookie(key='theme', value='dark', max_age=2592000)"],
      acceptRegex: ["^resp\\.set_cookie\\(\\s*(key\\s*=\\s*)?['\"]theme['\"]\\s*,\\s*(value\\s*=\\s*)?['\"]dark['\"]\\s*,\\s*max_age\\s*=\\s*(2592000|30\\s*\\*\\s*24\\s*\\*\\s*60\\s*\\*\\s*60|60\\s*\\*\\s*60\\s*\\*\\s*24\\s*\\*\\s*30|30\\s*\\*\\s*24\\s*\\*\\s*3600|30\\s*\\*\\s*86400|86400\\s*\\*\\s*30)\\s*\\)\\s*;?$"],
      explain: '`response.set_cookie(key, value, max_age=seconds)` adds a `Set-Cookie` header. 30 days = 30 × 24 × 60 × 60 = **2,592,000** seconds. Read it later with `request.cookies.get(\'theme\')` and remove it with `resp.delete_cookie(\'theme\')`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The test client keeps cookies between requests like a browser. What does this program print?',
      code: `from flask import Flask, session

app = Flask(__name__)
app.secret_key = 'dev-key'

@app.route('/visit')
def visit():
    session['count'] = session.get('count', 0) + 1
    return f"Visit {session['count']}"

@app.route('/logout')
def logout():
    session.clear()
    return 'Bye'

c = app.test_client()
print(c.get('/visit').get_data(as_text=True))
print(c.get('/visit').get_data(as_text=True))
print(c.get('/logout').get_data(as_text=True))
print(c.get('/visit').get_data(as_text=True))`,
      expected: 'Visit 1\nVisit 2\nBye\nVisit 1',
      explain: 'The session cookie travels with every request, so the counter grows: 1, 2. `session.clear()` removes everything (this is how logout works), so the next visit starts again at 1. Without `secret_key` Flask would raise an error when writing to the session.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'A shopping cart is usually kept in `session[\'cart\']` as a dict `{product_id: qty}`. Write the helpers that the cart views call (here `session` is a plain dict passed in):\n- `add_to_cart(session, pid, qty=1)` adds qty (create the cart if missing) and returns the cart\n- `remove_from_cart(session, pid)` removes the product if present and returns the cart\n- `cart_total(session, prices)` returns the total using the `prices` dict `{pid: price}` (0 for an empty/missing cart)',
      example: { title: 'dict default + update', code: "stock = {}\nstock['pen'] = stock.get('pen', 0) + 5\nprint(stock)   # {'pen': 5}" },
      starter: `def add_to_cart(session, pid, qty=1):
    # TODO
    pass

def remove_from_cart(session, pid):
    # TODO
    pass

def cart_total(session, prices):
    # TODO
    return 0
`,
      solution: `def add_to_cart(session, pid, qty=1):
    cart = session.setdefault('cart', {})
    cart[pid] = cart.get(pid, 0) + qty
    return cart

def remove_from_cart(session, pid):
    cart = session.setdefault('cart', {})
    cart.pop(pid, None)
    return cart

def cart_total(session, prices):
    cart = session.get('cart', {})
    return sum(prices[pid] * qty for pid, qty in cart.items())
`,
      tests: [
        { call: "add_to_cart({}, 'p1', 2)", expect: { p1: 2 } },
        { call: "(lambda s: (add_to_cart(s, 'p1'), add_to_cart(s, 'p1', 2), add_to_cart(s, 'p2'))[2])({})", expect: { p1: 3, p2: 1 } },
        { call: "remove_from_cart({'cart': {'p1': 1, 'p2': 4}}, 'p1')", expect: { p2: 4 } },
        { call: "remove_from_cart({'cart': {'p2': 4}}, 'p9')", expect: { p2: 4 }, msg: 'Removing a missing product must not crash' },
        { call: "cart_total({'cart': {'pen': 3, 'book': 2}}, {'pen': 10, 'book': 250})", expect: 530 },
        { call: 'cart_total({}, {})', expect: 0 },
      ],
      explain: 'Keep only **ids and quantities** in the session (small, no prices - prices must come from the database so users cannot change them). `setdefault` creates the cart on first use and `pop(pid, None)` avoids a KeyError. In real Flask, after changing a nested dict also set `session.modified = True` so the cookie is re-sent.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Cookies are only signed, not hidden. Write `sign(value, secret)` that returns `value + \'.\' + sig` where `sig` is the first 10 hex chars of `hashlib.sha256((secret + value).encode()).hexdigest()`, and `unsign(signed, secret)` that returns the original value if the signature is correct, otherwise `None`.',
      example: { title: 'hashing a string', code: "import hashlib\nprint(hashlib.sha256('abc'.encode()).hexdigest()[:10])   # ba7816bf8f" },
      starter: `import hashlib

def sign(value, secret):
    # TODO
    return value

def unsign(signed, secret):
    # TODO
    return None
`,
      solution: `import hashlib

def _sig(value, secret):
    return hashlib.sha256((secret + value).encode()).hexdigest()[:10]

def sign(value, secret):
    return value + '.' + _sig(value, secret)

def unsign(signed, secret):
    value, _, sig = signed.rpartition('.')
    if value and sig == _sig(value, secret):
        return value
    return None
`,
      tests: [
        { call: "unsign(sign('user=asha', 'k1'), 'k1')", expect: 'user=asha' },
        { call: "sign('cart=3', 's').startswith('cart=3.')", expect: true },
        { call: "unsign(sign('user=asha', 'k1').replace('asha', 'admin'), 'k1')", expect: null, msg: 'A changed value must be rejected' },
        { call: "unsign(sign('user=asha', 'k1'), 'other-key')", expect: null, msg: 'A different secret must be rejected' },
      ],
      explain: 'This is the idea behind Flask\'s signed session cookie (itsdangerous uses HMAC): anyone can **read** `user=asha`, but changing it to `admin` breaks the signature, and only the server knows the secret. That is why `SECRET_KEY` must be long, random and secret - if it leaks, attackers can forge sessions.',
    },
  ],
};
