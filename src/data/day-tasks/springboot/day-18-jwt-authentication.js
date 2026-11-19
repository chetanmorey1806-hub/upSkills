export default {
  lesson: 'day-18-jwt-authentication',
  minutes: 24,
  intro: 'Understand the JWT structure and login flow, configure a stateless filter chain and predict token results.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about a JWT like `xxxxx.yyyyy.zzzzz` are TRUE? (choose all that apply)',
      options: [
        'It has three parts: header, payload and signature',
        'The payload is only Base64URL-encoded, so anyone can read it',
        'The signature lets the server detect if the token was changed',
        'The payload is encrypted, so storing the password in it is safe',
        'The server must store every issued token in a session',
      ],
      answers: [0, 1, 2],
      explain: 'Header.Payload.Signature. Header and payload are **encoded, not encrypted** - paste one into jwt.io and you can read it, so never put passwords in claims. The signature (HMAC with the secret) proves it was not modified. The server keeps no session: that is the point of stateless JWT.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The token is created at `issuedAt = 1700000000000` ms (epoch). What value does the `exp` claim (in **seconds**) contain?',
      example: { title: 'JWT times', text: 'iat and exp claims are stored in SECONDS since 1970, while Java Date / System.currentTimeMillis() use milliseconds.' },
      code: `long now = 1700000000000L;              // ms
long validityMs = 60 * 60 * 1000;       // 1 hour
String token = Jwts.builder()
        .subject("asha@mail.com")
        .issuedAt(new Date(now))
        .expiration(new Date(now + validityMs))
        .signWith(key)
        .compact();`,
      expected: '1700003600',
      explain: 'Expiry in ms = 1700000000000 + 3 600 000 = 1700003600000. JWT stores seconds, so `exp` = **1700003600**. jjwt converts the Date for you.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'In the JWT filter, the header is `Authorization: Bearer eyJhbGci...`. Complete the line that extracts only the token:\n```\nString header = request.getHeader("Authorization");\nif (header != null && header.startsWith("Bearer ")) {\n    String token = ???;\n}\n```',
      example: { title: 'substring', code: '"Hello World".substring(6)   // "World"' },
      accept: ['header.substring(7)', 'header.substring(7);', 'header.substring("Bearer ".length())', 'header.replace("Bearer ", "")', 'header.substring(7).trim()'],
      explain: '"Bearer " is 7 characters (6 letters + a space), so `substring(7)` returns the token. Using `substring(6)` leaves a leading space and the signature check fails.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the configuration so Spring Security never creates an HTTP session (stateless JWT API):\n```\nhttp.sessionManagement(sm -> sm.sessionCreationPolicy(???));\n```',
      example: { title: 'adding your filter', code: 'http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);' },
      accept: ['SessionCreationPolicy.STATELESS'],
      explain: '`SessionCreationPolicy.STATELESS` means no `JSESSIONID` session is created or used; every request must bring its JWT. CSRF protection is usually disabled for such token APIs because no cookie is sent automatically.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The chain permits `/api/auth/**` and requires authentication for everything else; the JWT filter only sets the user when the token is valid. Type the status of each request, one per line:\n1. `POST /api/auth/login` with correct email/password\n2. `GET /api/students` with no header\n3. `GET /api/students` with a valid token\n4. `GET /api/students` with an **expired** token\n5. `GET /api/students` with a token whose payload was edited by hand',
      example: { title: 'what the filter does', text: 'Valid token → SecurityContextHolder gets an Authentication. Invalid / missing → context stays empty → the request is treated as anonymous.' },
      code: `.requestMatchers("/api/auth/**").permitAll()
.anyRequest().authenticated()`,
      expected: '200\n401\n200\n401\n401',
      explain: 'Login is public → 200 with a token. Without a valid authentication in the context, protected URLs answer **401**. An expired token fails the `exp` check, and an edited payload no longer matches the signature, so both are rejected like no token.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why do many apps use a short-lived **access token** plus a long-lived **refresh token**?',
      options: [
        'Refresh tokens are sent with every API call',
        'A stolen access token is useful only for minutes; the refresh token (stored more safely) is used only to get a new access token without logging in again',
        'Access tokens never expire',
        'It removes the need for HTTPS',
      ],
      answer: 1,
      explain: 'Short access tokens (e.g. 15 min) limit damage if leaked. The refresh token is sent only to `/api/auth/refresh`, can be revoked on the server, and keeps the user logged in. HTTPS is still mandatory.',
    },
  ],
};
