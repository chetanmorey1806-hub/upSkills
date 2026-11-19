export default {
  lesson: 'day-07-authentication-oauth2-jwt',
  minutes: 35,
  intro: 'Practise OAuth2 password flow, JWT structure, password hashing and get_current_user, and build JWT encoding/verification and role checks in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A JWT looks like `xxxxx.yyyyy.zzzzz`. What are the three parts?',
      options: ['username.password.expiry', 'header.payload.signature (each base64url-encoded)', 'encrypted data that nobody can read', 'session id.cookie.csrf token'],
      answer: 1,
      explain: 'Header (algorithm), payload (claims like `sub`, `exp`, `role`) and signature. The payload is only **encoded, not encrypted** - anyone can decode and read it, so never put passwords in it. The signature (made with the server\'s secret) proves it was not changed.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about FastAPI auth are TRUE? (choose all that apply)',
      options: [
        'OAuth2PasswordRequestForm reads username and password as FORM data, not JSON',
        'OAuth2PasswordBearer(tokenUrl="token") reads the token from the Authorization: Bearer header',
        'A missing/invalid token should return 401 with header WWW-Authenticate: Bearer',
        'A logged-in user without the admin role should get 401',
        'The exp claim lets the server reject old tokens',
      ],
      answers: [0, 1, 2, 4],
      explain: 'The /token endpoint receives form fields (that is what Swagger\'s Authorize button sends). **401** = "who are you?" (not authenticated), **403** = "I know you, but you are not allowed" - so a non-admin gets 403. `exp` makes tokens expire.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line that verifies a login password against the stored hash with pwdlib / passlib style API (`password_hash` is the hasher object):\n\n```\nif not user or not ______:\n    raise HTTPException(401, \'Incorrect username or password\')\n```',
      accept: ['password_hash.verify(form_data.password, user.hashed_password)', 'password_hash.verify(form.password, user.hashed_password)', 'password_hash.verify(form_data.password, user.password_hash)', 'pwd_context.verify(form_data.password, user.hashed_password)'],
      explain: '`verify(plain, hashed)` re-hashes the typed password with the stored salt and compares. Never compare `plain == hashed` and never decrypt - hashes are one-way. Return the same message for "unknown user" and "wrong password" so attackers cannot discover which usernames exist.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 10,
      q: 'Build a mini JWT (HS256) with the standard library. Write:\n- `b64(data: bytes)` → `base64.urlsafe_b64encode(data).rstrip(b\'=\').decode()`\n- `encode(payload, secret)` → `header.payload.signature` where header is `{"alg":"HS256","typ":"JWT"}`, JSON is made with `json.dumps(obj, separators=(\',\', \':\'))`, and signature = `b64(hmac.new(secret.encode(), f\'{h}.{p}\'.encode(), hashlib.sha256).digest())`\n- `decode(token, secret, now)` → payload dict, or `\'invalid\'` if the signature is wrong, or `\'expired\'` if `payload[\'exp\'] < now`',
      example: { title: 'HMAC signature', code: "import hmac, hashlib\nsig = hmac.new(b'key', b'message', hashlib.sha256).hexdigest()\nprint(sig[:8])" },
      starter: `import base64, hashlib, hmac, json

def b64(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def encode(payload, secret):
    # TODO
    return ''

def decode(token, secret, now):
    # TODO
    return 'invalid'
`,
      solution: `import base64, hashlib, hmac, json

def b64(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def _json(obj):
    return json.dumps(obj, separators=(',', ':')).encode()

def _sign(signing_input, secret):
    return b64(hmac.new(secret.encode(), signing_input.encode(), hashlib.sha256).digest())

def encode(payload, secret):
    h = b64(_json({'alg': 'HS256', 'typ': 'JWT'}))
    p = b64(_json(payload))
    return f'{h}.{p}.{_sign(f"{h}.{p}", secret)}'

def decode(token, secret, now):
    try:
        h, p, s = token.split('.')
    except ValueError:
        return 'invalid'
    if not hmac.compare_digest(s, _sign(f'{h}.{p}', secret)):
        return 'invalid'
    payload = json.loads(base64.urlsafe_b64decode(p + '=' * (-len(p) % 4)))
    if payload.get('exp', now) < now:
        return 'expired'
    return payload
`,
      tests: [
        { call: "encode({'sub': 'asha'}, 'k').split('.')[0]", expect: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' },
        { call: "decode(encode({'sub': 'asha', 'role': 'student', 'exp': 2000}, 'k'), 'k', 1000)", expect: { sub: 'asha', role: 'student', exp: 2000 } },
        { call: "decode(encode({'sub': 'asha', 'exp': 2000}, 'k'), 'other', 1000)", expect: 'invalid' },
        { call: "decode(encode({'sub': 'asha', 'exp': 2000}, 'k'), 'k', 3000)", expect: 'expired' },
        { call: "(lambda t: decode(t.split('.')[0] + '.' + encode({'sub': 'admin', 'exp': 2000}, 'x').split('.')[1] + '.' + t.split('.')[2], 'k', 1000))(encode({'sub': 'asha', 'exp': 2000}, 'k'))", expect: 'invalid', msg: 'A token whose payload was swapped must be rejected' },
      ],
      explain: 'This is exactly what PyJWT does: the signature covers header + payload, so changing `sub` to `admin` breaks it, and only someone with the secret can sign. `exp` is checked **after** the signature. `hmac.compare_digest` avoids timing attacks. In production use `jwt.encode/jwt.decode` - never your own crypto.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `authorize(token_payload, required_role=None)` used by `get_current_user` + role dependencies. Return a tuple `(status, detail)`:\n- payload is `None` (no/invalid token) → `(401, \'Not authenticated\')`\n- `required_role` given and `payload[\'role\']` is different (admins pass every role check) → `(403, \'Not enough permissions\')`\n- otherwise → `(200, payload[\'sub\'])`',
      example: { title: 'two different failure codes', code: "if user is None:\n    raise HTTPException(401, 'Not authenticated')\nif user.role != 'admin':\n    raise HTTPException(403, 'Admins only')" },
      starter: `def authorize(token_payload, required_role=None):
    # TODO
    return (200, '')
`,
      solution: `def authorize(token_payload, required_role=None):
    if token_payload is None:
        return (401, 'Not authenticated')
    role = token_payload.get('role')
    if required_role and role != required_role and role != 'admin':
        return (403, 'Not enough permissions')
    return (200, token_payload['sub'])
`,
      tests: [
        { call: 'authorize(None)', expect: [401, 'Not authenticated'] },
        { call: "authorize({'sub': 'asha', 'role': 'student'})", expect: [200, 'asha'] },
        { call: "authorize({'sub': 'asha', 'role': 'student'}, 'teacher')", expect: [403, 'Not enough permissions'] },
        { call: "authorize({'sub': 'ravi', 'role': 'teacher'}, 'teacher')", expect: [200, 'ravi'] },
        { call: "authorize({'sub': 'root', 'role': 'admin'}, 'teacher')", expect: [200, 'root'] },
      ],
      explain: 'Authentication (who are you? → 401) is checked before authorization (what may you do? → 403). In FastAPI this is a chain of dependencies: `get_current_user` decodes the token, and `require_role(\'teacher\')` depends on it.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print?',
      code: `from typing import Annotated
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi.testclient import TestClient

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')
TOKENS = {'tok-asha': {'sub': 'asha', 'role': 'student'}}

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    user = TOKENS.get(token)
    if not user:
        raise HTTPException(401, 'Invalid token', headers={'WWW-Authenticate': 'Bearer'})
    return user

app = FastAPI()

@app.get('/me')
def me(user: Annotated[dict, Depends(get_current_user)]):
    return {'username': user['sub']}

c = TestClient(app)
print(c.get('/me').status_code, c.get('/me').json())
print(c.get('/me', headers={'Authorization': 'Bearer wrong'}).json())
print(c.get('/me', headers={'Authorization': 'Bearer tok-asha'}).json())`,
      expected: "401 {'detail': 'Not authenticated'}\n{'detail': 'Invalid token'}\n{'username': 'asha'}",
      explain: 'Without an `Authorization` header `OAuth2PasswordBearer` itself returns 401 "Not authenticated" before your code runs. With a wrong token our dependency raises 401 "Invalid token". With a valid Bearer token the endpoint receives the user.',
    },
  ],
};
