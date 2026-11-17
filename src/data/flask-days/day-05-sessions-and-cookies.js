export default {
  id: "day-05-sessions-and-cookies",
  title: "Sessions and Cookies",
  module: "Module 1: Flask Basics",
  day: 5,
  level: "Beginner",
  duration: "2 hours",
  summary: "Understand why HTTP is stateless, set and read cookies with make_response and request.cookies, store per-user data in Flask's signed session, control lifetime and security flags, and build a login-protected page and a shopping cart.",
  objectives: [
    "Explain statelessness and how cookies let a server remember a browser",
    "Set, read and delete cookies with response.set_cookie, request.cookies and delete_cookie",
    "Use the Flask session object to store user data across requests and clear it on logout",
    "Configure permanent sessions, PERMANENT_SESSION_LIFETIME and secure cookie flags (HttpOnly, Secure, SameSite)",
    "Know the difference between client-side signed sessions and server-side sessions (Flask-Session)",
  ],
  theory: [
    {
      heading: "HTTP is Stateless - Why We Need Cookies",
      content: "HTTP does not remember anything between requests: each request is like a new customer at a shop counter who the shopkeeper has never seen. To 'remember' a user (logged in, cart items, language), the server gives the browser a small token called a cookie. The browser automatically sends that cookie back with every later request to the same site, like a token number given at a bank counter. A cookie is a name=value pair (max about 4 KB) plus attributes: expiry, path, domain, Secure, HttpOnly, SameSite.",
      points: [
        "Server sets a cookie with the Set-Cookie response header",
        "Browser sends it back in the Cookie request header",
        "Session cookie (no expiry) disappears when the browser closes; persistent cookie has max_age/expires",
        "Users can see and edit cookies in DevTools > Application > Cookies - never trust raw cookie values",
      ],
    },
    {
      heading: "Working with Cookies in Flask",
      content: "To set a cookie you need a response object: resp = make_response(render_template(...)) then resp.set_cookie('theme', 'dark', max_age=30*24*3600). Read it on later requests with request.cookies.get('theme', 'light'). Delete it with resp.delete_cookie('theme') (this sends an expired cookie). Raw cookies are good for non-sensitive preferences such as theme or language, because a user can change them freely.",
      syntax: "resp = make_response('Theme saved')\nresp.set_cookie('theme', 'dark', max_age=60*60*24*30, httponly=True, samesite='Lax')\nreturn resp",
      points: [
        "max_age in seconds; expires accepts a datetime",
        "httponly=True: JavaScript cannot read it (protects from XSS stealing)",
        "secure=True: only sent over HTTPS",
        "samesite='Lax' or 'Strict': reduces CSRF by not sending cookies on cross-site requests",
      ],
    },
    {
      heading: "The Flask session Object",
      content: "session is a dict-like object that stores data per browser. By default Flask stores the whole session INSIDE a cookie named 'session', but signs it with SECRET_KEY using itsdangerous. Signing means the user can READ the data (it is only base64-encoded, not encrypted) but cannot CHANGE it - if they do, the signature fails and Flask discards it. Analogy: a sealed envelope with a wax stamp - anyone can see the envelope, but if the stamp is broken you know it was tampered with. Use session['user_id'] = 5 to store, session.get('user_id') to read, session.pop('user_id', None) or session.clear() to remove.",
      syntax: "from flask import session\n\nsession['username'] = 'asha'\nname = session.get('username')\nsession.pop('username', None)\nsession.clear()",
      points: [
        "SECRET_KEY must be set, long and secret; changing it logs everyone out",
        "Do NOT store passwords or secret data in the default session - it is readable",
        "Keep it small (cookie limit about 4 KB): store ids, not whole objects",
        "Mutating a nested object (session['cart'].append(x)) is not detected: set session.modified = True",
      ],
    },
    {
      heading: "Session Lifetime and Security Settings",
      content: "By default the session cookie expires when the browser closes. Set session.permanent = True to use PERMANENT_SESSION_LIFETIME (default 31 days) - typical for a 'Remember me' checkbox. Production settings: SESSION_COOKIE_SECURE=True (HTTPS only), SESSION_COOKIE_HTTPONLY=True (default), SESSION_COOKIE_SAMESITE='Lax'. When you need large or truly private session data, or the ability to log out a user from the server, use server-side sessions with the Flask-Session extension (Redis, filesystem or database), where the cookie holds only a random session id.",
      syntax: "from datetime import timedelta\napp.config.update(\n    PERMANENT_SESSION_LIFETIME=timedelta(days=7),\n    SESSION_COOKIE_SECURE=True,\n    SESSION_COOKIE_SAMESITE='Lax',\n)",
      tip: "Interview line: 'Flask's default session is client-side: the data lives in a cookie signed with SECRET_KEY, so it is tamper-proof but not encrypted.'",
    },
    {
      heading: "Cookies vs Session vs Database",
      content: "Choose where to keep state based on sensitivity and size. Cookie: tiny, non-sensitive, user-editable preferences. Flask session: small data that must not be tampered with, such as user id, cart ids, flash messages. Database: anything permanent or large - orders, profiles. A common pattern is: session holds user_id, and each request loads the user from the database (Flask-Login does exactly this on Day 8).",
      points: [
        "Cookie: client stores, user can modify",
        "Session (default): client stores, signed, user can read but not modify",
        "Server-side session: server stores, cookie keeps only an id",
        "g object: data for ONE request only (e.g. current DB connection), not across requests",
      ],
    },
  ],
  examples: [
    {
      title: "Theme preference with a raw cookie",
      scenario: "Let visitors choose light or dark theme and remember it for 30 days.",
      steps: [
        "Create a folder cookie_app and open it in VS Code or PyCharm; create and select a .venv",
        "pip install Flask",
        "Create app.py and templates/home.html as below",
        "Run flask --app app run --debug, open /, click Dark",
        "Open DevTools (F12) > Application > Cookies > http://127.0.0.1:5000 to see theme=dark",
      ],
      code: `# Project tree
cookie_app/
├── app.py
└── templates/
    └── home.html

# ---- app.py ----
from flask import Flask, render_template, request, make_response, redirect, url_for

app = Flask(__name__)
THIRTY_DAYS = 30 * 24 * 60 * 60


@app.route("/")
def home():
    theme = request.cookies.get("theme", "light")
    visits = int(request.cookies.get("visits", 0)) + 1
    resp = make_response(render_template("home.html", theme=theme, visits=visits))
    resp.set_cookie("visits", str(visits), max_age=THIRTY_DAYS)
    return resp


@app.route("/theme/<choice>")
def set_theme(choice):
    if choice not in ("light", "dark"):
        choice = "light"
    resp = make_response(redirect(url_for("home")))
    resp.set_cookie("theme", choice, max_age=THIRTY_DAYS, httponly=True, samesite="Lax")
    return resp


@app.route("/reset")
def reset():
    resp = make_response(redirect(url_for("home")))
    resp.delete_cookie("theme")
    resp.delete_cookie("visits")
    return resp


# ---- templates/home.html ----
<!DOCTYPE html>
<html>
<body style="background: {{ '#111' if theme == 'dark' else '#fff' }}; color: {{ '#eee' if theme == 'dark' else '#111' }}">
  <h1>Current theme: {{ theme }}</h1>
  <p>You visited this page {{ visits }} time(s).</p>
  <a href="{{ url_for('set_theme', choice='light') }}">Light</a> |
  <a href="{{ url_for('set_theme', choice='dark') }}">Dark</a> |
  <a href="{{ url_for('reset') }}">Reset</a>
</body>
</html>`,
      result: `First visit:        Current theme: light / You visited this page 1 time(s).
Click Dark:         page turns dark, Current theme: dark / visits 2
Close & reopen browser: still dark (cookie has max_age)
Click Reset:        theme back to light, visits starts again from 1

Response header seen in DevTools:
Set-Cookie: theme=dark; Expires=...; Max-Age=2592000; HttpOnly; Path=/; SameSite=Lax`,
      explanation: "Cookies are set on the response and read from request.cookies on the next request. int() conversion is needed because cookie values are always strings. A user could edit 'visits' to 999 - acceptable for a counter, not for anything important.",
    },
    {
      title: "Login with session, protected dashboard, logout",
      scenario: "Simple login (hard-coded user) that remembers the user across pages and offers 'Remember me'.",
      steps: [
        "Create session_app with the tree below in VS Code or PyCharm",
        "pip install Flask",
        "Paste the files and run flask --app app run --debug",
        "Open /dashboard (redirects to login), log in as asha / flask123, tick Remember me",
        "Check the 'session' cookie in DevTools; then click Logout",
      ],
      code: `# Project tree
session_app/
├── app.py
└── templates/
    ├── base.html
    ├── login.html
    └── dashboard.html

# ---- app.py ----
from datetime import timedelta
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, session, flash

app = Flask(__name__)
app.config.update(
    SECRET_KEY="replace-with-secrets-token-hex",
    PERMANENT_SESSION_LIFETIME=timedelta(days=7),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    # SESSION_COOKIE_SECURE=True,  # enable when using HTTPS
)

USERS = {"asha": "flask123", "ravi": "python123"}   # demo only, hashing comes on Day 8


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if "username" not in session:
            flash("Please log in first.", "warning")
            return redirect(url_for("login", next=request.path))
        return view(*args, **kwargs)
    return wrapped


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        if USERS.get(username) == password:
            session.clear()
            session["username"] = username
            session.permanent = bool(request.form.get("remember"))
            flash(f"Welcome back, {username}!", "success")
            return redirect(request.args.get("next") or url_for("dashboard"))
        flash("Invalid username or password.", "danger")
    return render_template("login.html")


@app.route("/dashboard")
@login_required
def dashboard():
    session["page_views"] = session.get("page_views", 0) + 1
    return render_template("dashboard.html", username=session["username"],
                           views=session["page_views"])


@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))


# ---- templates/base.html ----
<!DOCTYPE html>
<html><body>
  {% if session.username %}<p>Logged in as {{ session.username }} | <a href="{{ url_for('logout') }}">Logout</a></p>{% endif %}
  {% for cat, msg in get_flashed_messages(with_categories=true) %}<p class="{{ cat }}">{{ msg }}</p>{% endfor %}
  {% block content %}{% endblock %}
</body></html>

# ---- templates/login.html ----
{% extends "base.html" %}
{% block content %}
<form method="post">
  <input name="username" placeholder="Username">
  <input name="password" type="password" placeholder="Password">
  <label><input type="checkbox" name="remember"> Remember me</label>
  <button>Login</button>
</form>
{% endblock %}

# ---- templates/dashboard.html ----
{% extends "base.html" %}
{% block content %}
<h1>Dashboard</h1>
<p>Hello {{ username }}, you opened this dashboard {{ views }} time(s) in this session.</p>
{% endblock %}`,
      result: `GET /dashboard (not logged in) -> redirect to /login?next=/dashboard + 'Please log in first.'
POST /login asha/flask123     -> 'Welcome back, asha!' then /dashboard:
                                 Hello asha, you opened this dashboard 1 time(s) in this session.
Refresh                        -> ... 2 time(s) ...
POST /login asha/wrong         -> 'Invalid username or password.'
GET /logout                    -> 'You have been logged out.' and /dashboard is protected again`,
      explanation: "session['username'] marks the user as logged in. The login_required decorator checks it before every protected view. session.permanent = True keeps the cookie for 7 days. session.clear() on login prevents session fixation and on logout removes everything.",
    },
    {
      title: "Shopping cart in the session",
      scenario: "Add products to a cart, show the count in the navbar and the total on the cart page.",
      steps: [
        "Add the routes below to session_app/app.py",
        "Create templates/cart.html",
        "Run the app; open /add/1 twice and /add/2 once; then open /cart",
      ],
      code: `# ---- app.py (add) ----
PRODUCTS = {1: ("Notebook", 60), 2: ("Pen", 20), 3: ("Bag", 900)}


@app.route("/add/<int:product_id>")
def add_to_cart(product_id):
    if product_id not in PRODUCTS:
        flash("Unknown product", "danger")
        return redirect(url_for("cart"))
    cart = session.setdefault("cart", {})          # keys must be strings in JSON
    key = str(product_id)
    cart[key] = cart.get(key, 0) + 1
    session.modified = True                          # nested change -> tell Flask
    flash(f"Added {PRODUCTS[product_id][0]}", "success")
    return redirect(url_for("cart"))


@app.route("/cart")
def cart():
    items, total = [], 0
    for key, qty in session.get("cart", {}).items():
        name, price = PRODUCTS[int(key)]
        items.append({"name": name, "qty": qty, "subtotal": qty * price})
        total += qty * price
    return render_template("cart.html", items=items, total=total)


@app.route("/cart/clear")
def clear_cart():
    session.pop("cart", None)
    return redirect(url_for("cart"))


# ---- templates/cart.html ----
{% extends "base.html" %}
{% block content %}
<h1>Your Cart ({{ session.get('cart', {})|length }} products)</h1>
<ul>
  {% for i in items %}
    <li>{{ i.name }} x {{ i.qty }} = Rs. {{ i.subtotal }}</li>
  {% else %}
    <li>Cart is empty</li>
  {% endfor %}
</ul>
<p><strong>Total: Rs. {{ total }}</strong></p>
<a href="{{ url_for('clear_cart') }}">Clear cart</a>
{% endblock %}`,
      result: `Your Cart (2 products)
- Notebook x 2 = Rs. 120
- Pen x 1 = Rs. 20
Total: Rs. 140`,
      explanation: "The session is serialised to JSON, so dict keys become strings - we store str(product_id). Because we modified a nested dict, session.modified = True forces Flask to send the updated cookie.",
    },
    {
      title: "Pure Python demo: how a signed session cookie works",
      scenario: "Recreate the idea behind itsdangerous: encode data, sign it with a secret key and detect tampering.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `import base64
import hashlib
import hmac
import json

SECRET_KEY = b"dev-secret-key"


def sign(data):
    payload = base64.urlsafe_b64encode(json.dumps(data).encode()).decode()
    sig = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()[:16]
    return payload + "." + sig


def unsign(cookie):
    payload, sig = cookie.rsplit(".", 1)
    good = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()[:16]
    if not hmac.compare_digest(sig, good):
        return None
    return json.loads(base64.urlsafe_b64decode(payload))


cookie = sign({"user": "asha", "cart": 2})
print("Cookie value:", cookie)
print("Read back:", unsign(cookie))

tampered_payload = base64.urlsafe_b64encode(json.dumps({"user": "admin", "cart": 2}).encode()).decode()
tampered = tampered_payload + "." + cookie.rsplit(".", 1)[1]
print("Tampered:", unsign(tampered))`,
      python: { files: { "main.py": `import base64
import hashlib
import hmac
import json

SECRET_KEY = b"dev-secret-key"


def sign(data):
    payload = base64.urlsafe_b64encode(json.dumps(data).encode()).decode()
    sig = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()[:16]
    return payload + "." + sig


def unsign(cookie):
    payload, sig = cookie.rsplit(".", 1)
    good = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()[:16]
    if not hmac.compare_digest(sig, good):
        return None
    return json.loads(base64.urlsafe_b64decode(payload))


cookie = sign({"user": "asha", "cart": 2})
print("Cookie value:", cookie)
print("Read back:", unsign(cookie))

tampered_payload = base64.urlsafe_b64encode(json.dumps({"user": "admin", "cart": 2}).encode()).decode()
tampered = tampered_payload + "." + cookie.rsplit(".", 1)[1]
print("Tampered:", unsign(tampered))` } },
      result: `Cookie value: eyJ1c2VyIjogImFzaGEiLCAiY2FydCI6IDJ9.2dbb9f86b0a50c44
Read back: {'user': 'asha', 'cart': 2}
Tampered: None`,
      explanation: "The payload is only base64 (anyone can decode it), but the HMAC signature depends on SECRET_KEY. Changing 'asha' to 'admin' without the key produces a wrong signature, so the server rejects it - this is why Flask sessions are tamper-proof but not secret.",
    },
  ],
  interview: [
    { q: "Why is HTTP called stateless?", a: "Each request is independent; the server does not automatically remember previous requests from the same client. Cookies and sessions add state on top.", level: "Easy" },
    { q: "Difference between a cookie and a session in Flask?", a: "A cookie is raw name=value data stored in the browser that the user can change. Flask's session is a dict stored in a cookie too, but signed with SECRET_KEY so it cannot be modified without detection.", level: "Easy" },
    { q: "Is data in the default Flask session encrypted?", a: "No. It is serialised, base64-encoded and signed, not encrypted. Anyone can decode and read it, so never store passwords or secrets there.", level: "Medium" },
    { q: "How do you set a cookie in Flask?", a: "Create a response (make_response or a redirect) and call resp.set_cookie(name, value, max_age=..., httponly=True, secure=True, samesite='Lax'), then return resp.", level: "Easy" },
    { q: "What are HttpOnly, Secure and SameSite flags?", a: "HttpOnly blocks JavaScript access (XSS protection); Secure sends the cookie only over HTTPS; SameSite controls whether the cookie is sent on cross-site requests (CSRF protection).", level: "Medium" },
    { q: "How do you make a session last 7 days?", a: "Set app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7) and session.permanent = True after login.", level: "Medium" },
    { q: "Why might a change to session['cart'].append(x) not be saved?", a: "Flask only detects assignment to top-level keys. Mutating a nested object does not mark the session modified; set session.modified = True.", level: "Hard" },
    { q: "What happens if you change SECRET_KEY?", a: "All existing session cookies and CSRF tokens become invalid, so every user is logged out.", level: "Medium" },
    { q: "When would you use server-side sessions?", a: "When session data is large or sensitive, or you need to invalidate sessions from the server. Flask-Session stores data in Redis/DB/filesystem and the cookie holds only an id.", level: "Hard" },
    { q: "What is the difference between session and g?", a: "session persists across requests for one browser; g lives only for the current request (app context) and is used for things like the current DB connection or loaded user.", level: "Medium" },
    { q: "What is session fixation and how do you reduce it?", a: "An attacker forces a known session identifier on a victim before login. Clearing/regenerating the session at login (session.clear()) reduces it.", level: "Hard" },
  ],
  practice: [
    {
      task: "Store the user's preferred language (en/hi) in a cookie for 1 year and greet them in that language.",
      hint: "max_age=365*24*3600; request.cookies.get('lang', 'en').",
      solution: `@app.route("/")
def home():
    lang = request.cookies.get("lang", "en")
    return "Namaste!" if lang == "hi" else "Hello!"


@app.route("/lang/<code>")
def set_lang(code):
    resp = make_response(redirect(url_for("home")))
    resp.set_cookie("lang", code if code in ("en", "hi") else "en", max_age=365 * 24 * 3600)
    return resp`,
    },
    {
      task: "Count how many times a user opened /counter in the current session and add /counter/reset.",
      hint: "session.get('count', 0) + 1",
      solution: `@app.route("/counter")
def counter():
    session["count"] = session.get("count", 0) + 1
    return f"You opened this page {session['count']} times"


@app.route("/counter/reset")
def counter_reset():
    session.pop("count", None)
    return redirect(url_for("counter"))`,
    },
    {
      task: "Create a 'recently viewed products' list in the session that keeps only the last 3 product ids.",
      hint: "Read list, append, slice [-3:], assign back.",
      solution: `@app.route("/product/<int:pid>")
def product(pid):
    recent = session.get("recent", [])
    if pid in recent:
        recent.remove(pid)
    recent.append(pid)
    session["recent"] = recent[-3:]   # assignment -> auto-detected
    return f"Product {pid}. Recently viewed: {session['recent']}"`,
    },
    {
      task: "Write production-ready session cookie settings in app.config.",
      hint: "SECURE, HTTPONLY, SAMESITE, lifetime.",
      solution: `import os
from datetime import timedelta

app.config.update(
    SECRET_KEY=os.environ["SECRET_KEY"],
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    PERMANENT_SESSION_LIFETIME=timedelta(hours=12),
)`,
    },
  ],
  quiz: [
    {
      question: "Where does Flask store the default session data?",
      options: ["In a server-side file", "In a signed cookie in the browser", "In the database", "In request.args"],
      answer: 1,
      explanation: "Default sessions are client-side signed cookies.",
    },
    {
      question: "Which object is needed to set a cookie?",
      options: ["request", "session", "a response object", "g"],
      answer: 2,
      explanation: "set_cookie is a method of the Response object.",
    },
    {
      question: "Which flag stops JavaScript from reading a cookie?",
      options: ["Secure", "SameSite", "Path", "HttpOnly"],
      answer: 3,
      explanation: "HttpOnly hides the cookie from document.cookie.",
    },
    {
      question: "What removes ALL keys from the session?",
      options: ["session.clear()", "session.pop()", "del session", "session.delete_cookie()"],
      answer: 0,
      explanation: "session.clear() empties the session dict.",
    },
    {
      question: "Session data can be ...",
      options: ["read and modified by the user", "read but not modified without detection", "neither read nor modified", "modified but not read"],
      answer: 1,
      explanation: "It is signed, not encrypted.",
    },
  ],
};
