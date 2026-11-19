export default {
  lesson: 'day-06-authentication-session-token-jwt',
  minutes: 35,
  intro: 'Practise DRF authentication classes, Token and JWT (SimpleJWT) flows and header formats, and write the header parsing and token-lifetime logic in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which header does DRF\'s built-in **TokenAuthentication** expect?',
      options: ['Authorization: Bearer <token>', 'Authorization: Token <token>', 'X-Token: <token>', 'Cookie: token=<token>'],
      answer: 1,
      explain: 'DRF TokenAuthentication uses the keyword **Token**: `Authorization: Token 9944b0...`. SimpleJWT uses **Bearer** by default. Sending the wrong keyword is a very common reason for "Authentication credentials were not provided".',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about SimpleJWT are TRUE? (choose all that apply)',
      options: [
        'POST /api/token/ with username + password returns an access and a refresh token',
        'The access token is short-lived; the refresh token is used to get a new access token',
        'JWT payloads are encrypted so it is safe to put the password inside',
        'With ROTATE_REFRESH_TOKENS and the blacklist app, logout can blacklist the refresh token',
        'The server must store every access token in the database to verify it',
      ],
      answers: [0, 1, 3],
      explain: 'Access tokens (e.g. 5-15 min) are sent with every request; refresh tokens (e.g. 1 day) only to `/api/token/refresh/`. JWTs are **signed, not encrypted** - anyone can read the payload. Verification only needs the signature + expiry, which is why JWT is stateless (unlike DRF Token, stored in a table).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete `settings.py` so DRF uses JWT authentication by default:\n\n```\nREST_FRAMEWORK = {\n    \'DEFAULT_AUTHENTICATION_CLASSES\': [\n        ______,\n    ],\n}\n```',
      accept: ["'rest_framework_simplejwt.authentication.JWTAuthentication'", '"rest_framework_simplejwt.authentication.JWTAuthentication"'],
      explain: 'Settings take the **dotted import path as a string**. `DEFAULT_AUTHENTICATION_CLASSES` is a list - DRF tries each class in order until one identifies the user. Per view you can override with `authentication_classes = [...]`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `parse_auth_header(header, keyword=\'Bearer\')` like DRF authentication classes do. Return:\n- `None` if the header is missing/empty or uses a different keyword (another auth class may handle it)\n- `\'error: no credentials\'` if it is only the keyword (`\'Bearer\'`)\n- `\'error: contains spaces\'` if there are more than 2 parts\n- otherwise the token string\n\nThe keyword comparison is case-insensitive.',
      example: { title: 'splitting a header', code: "parts = 'Token abc123'.split()\nprint(parts)   # ['Token', 'abc123']" },
      starter: `def parse_auth_header(header, keyword='Bearer'):
    # TODO
    return None
`,
      solution: `def parse_auth_header(header, keyword='Bearer'):
    if not header:
        return None
    parts = header.split()
    if parts[0].lower() != keyword.lower():
        return None
    if len(parts) == 1:
        return 'error: no credentials'
    if len(parts) > 2:
        return 'error: contains spaces'
    return parts[1]
`,
      tests: [
        { call: "parse_auth_header('Bearer eyJhbGciOi.abc.def')", expect: 'eyJhbGciOi.abc.def' },
        { call: "parse_auth_header('bearer xyz')", expect: 'xyz' },
        { call: "parse_auth_header('Token 9944b09199c62bcf', 'Token')", expect: '9944b09199c62bcf' },
        { call: "parse_auth_header('Token 9944b09199c62bcf')", expect: null, msg: 'A different keyword is not our job: return None' },
        { call: "parse_auth_header('Bearer')", expect: 'error: no credentials' },
        { call: "parse_auth_header('Bearer a b')", expect: 'error: contains spaces' },
        { call: "parse_auth_header('')", expect: null },
      ],
      explain: 'Returning `None` means "not my scheme" so DRF tries the next authentication class; a malformed header with the right keyword is an **error** (401). This is almost line-for-line what `TokenAuthentication.authenticate()` and SimpleJWT do before checking the token itself.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write a tiny JWT-like token store without crypto to understand lifetimes and logout. Class `TokenService(access_minutes=5, refresh_days=1)` with:\n- `login(user, now)` → dict `{\'access\': {\'user\': user, \'type\': \'access\', \'exp\': now + access_minutes*60}, \'refresh\': {..., \'type\': \'refresh\', \'exp\': now + refresh_days*86400, \'jti\': <unique int starting at 1>}}`\n- `refresh(token, now)` → new access dict, or `\'401\'` if it is not a refresh token, is expired, or its `jti` is blacklisted\n- `logout(token)` → adds the refresh token\'s `jti` to the blacklist\n\n`now` is seconds.',
      example: { title: 'expiry check', code: "token = {'exp': 1300}\nnow = 1200\nprint(now < token['exp'])   # True -> still valid" },
      starter: `class TokenService:
    def __init__(self, access_minutes=5, refresh_days=1):
        self.access_minutes = access_minutes
        self.refresh_days = refresh_days
        self.blacklist = set()
        self.next_jti = 1

    # TODO: login, refresh, logout
`,
      solution: `class TokenService:
    def __init__(self, access_minutes=5, refresh_days=1):
        self.access_minutes = access_minutes
        self.refresh_days = refresh_days
        self.blacklist = set()
        self.next_jti = 1

    def _access(self, user, now):
        return {'user': user, 'type': 'access', 'exp': now + self.access_minutes * 60}

    def login(self, user, now):
        refresh = {'user': user, 'type': 'refresh', 'exp': now + self.refresh_days * 86400, 'jti': self.next_jti}
        self.next_jti += 1
        return {'access': self._access(user, now), 'refresh': refresh}

    def refresh(self, token, now):
        if token.get('type') != 'refresh' or now >= token['exp'] or token.get('jti') in self.blacklist:
            return '401'
        return self._access(token['user'], now)

    def logout(self, token):
        self.blacklist.add(token.get('jti'))
`,
      tests: [
        { call: "TokenService().login('asha', 1000)", expect: { access: { user: 'asha', type: 'access', exp: 1300 }, refresh: { user: 'asha', type: 'refresh', exp: 87400, jti: 1 } } },
        { call: "(lambda s: s.refresh(s.login('asha', 0)['refresh'], 5000))(TokenService())", expect: { user: 'asha', type: 'access', exp: 5300 } },
        { call: "(lambda s: s.refresh(s.login('asha', 0)['access'], 10))(TokenService())", expect: '401', msg: 'An access token cannot be used to refresh' },
        { call: "(lambda s: s.refresh(s.login('asha', 0)['refresh'], 90000))(TokenService())", expect: '401', msg: 'An expired refresh token must be rejected' },
        { call: "(lambda s, t: (s.logout(t['refresh']), s.refresh(t['refresh'], 10))[1])(*(lambda s: (s, s.login('ravi', 0)))(TokenService()))", expect: '401', msg: 'After logout the refresh token is blacklisted' },
        { call: "(lambda s: [s.login('a', 0)['refresh']['jti'], s.login('b', 0)['refresh']['jti']])(TokenService())", expect: [1, 2] },
      ],
      explain: 'Short access tokens limit the damage of a stolen token; the refresh endpoint issues new ones. Because JWTs are stateless, the only way to "log out" before expiry is a **blacklist** of refresh token ids (`jti`) - that is what `rest_framework_simplejwt.token_blacklist` stores.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from rest_framework.authentication import BasicAuthentication, SessionAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory

@api_view(['GET'])
@authentication_classes([BasicAuthentication])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response({'user': request.user.username})

@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def session_profile(request):
    return Response({'user': request.user.username})

@api_view(['GET'])
def whoami(request):
    return Response({'authenticated': request.user.is_authenticated, 'auth': request.auth})

f = APIRequestFactory()
r = profile(f.get('/me/'))
print(r.status_code, r.data['detail'])
r = session_profile(f.get('/me2/'))
print(r.status_code, r.data['detail'])
print(whoami(f.get('/who/')).data)`,
      expected: "401 Authentication credentials were not provided.\n403 Authentication credentials were not provided.\n{'authenticated': False, 'auth': None}",
      explain: 'Without credentials `request.user` is `AnonymousUser` and `request.auth` is `None`, so `IsAuthenticated` denies access. DRF answers **401** when the first authentication class can send a `WWW-Authenticate` header (Basic, Token, JWT). SessionAuthentication has no such header (the browser cannot be asked to log in), so the same error becomes **403**. That is why your authentication setup changes 401 vs 403.',
    },
  ],
};
