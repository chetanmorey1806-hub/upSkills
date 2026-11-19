export default {
  lesson: 'day-19-role-based-authorization-cors',
  minutes: 24,
  intro: 'Protect URLs and methods by role, understand BCrypt hashing and configure CORS for a React frontend.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'A user has the authority `ROLE_ADMIN`. Which rule allows them?',
      options: ['hasRole("ROLE_ADMIN")', 'hasRole("ADMIN")', 'hasAuthority("ADMIN")', 'hasRole("admin")'],
      answer: 1,
      explain: '`hasRole("ADMIN")` automatically adds the `ROLE_` prefix and checks `ROLE_ADMIN`. `hasAuthority` compares the exact string, so it would need `hasAuthority("ROLE_ADMIN")`. Writing `hasRole("ROLE_ADMIN")` throws an error in Spring Security 6.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Users: `ravi` has `ROLE_USER`, `meera` has `ROLE_ADMIN`. Both send valid credentials. Type the status code of each request, one per line:\n1. ravi → `GET /api/courses`\n2. ravi → `DELETE /api/courses/3`\n3. meera → `DELETE /api/courses/3`\n4. ravi → `GET /api/admin/reports`\n5. meera → `GET /api/admin/reports`',
      example: { title: 'first match wins', text: 'Rules are checked in the order written; the first matching rule decides.' },
      code: `.authorizeHttpRequests(auth -> auth
    .requestMatchers(HttpMethod.GET, "/api/courses/**").hasAnyRole("USER", "ADMIN")
    .requestMatchers(HttpMethod.DELETE, "/api/courses/**").hasRole("ADMIN")
    .requestMatchers("/api/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated())`,
      expected: '200\n403\n200\n403\n200',
      explain: 'Ravi may read courses (200) but DELETE needs ADMIN → **403** (he is authenticated, just not allowed). Meera is ADMIN → 200 for both admin actions. Ravi on /api/admin → 403.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the method-level rule so only admins can call this service method:\n```\n???\npublic void deleteStudent(Long id) { ... }\n```',
      example: { title: 'owner-or-admin rule', code: '@PreAuthorize("hasRole(\'ADMIN\') or #username == authentication.name")' },
      accept: ['@PreAuthorize("hasRole(\'ADMIN\')")', '@PreAuthorize("hasAuthority(\'ROLE_ADMIN\')")', '@Secured("ROLE_ADMIN")', '@RolesAllowed("ADMIN")'],
      explain: '`@PreAuthorize("hasRole(\'ADMIN\')")` is checked before the method runs. It only works when method security is switched on with **@EnableMethodSecurity** on a configuration class.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`encoder.encode("pass123")` is called twice with `BCryptPasswordEncoder`. What is true?',
      options: [
        'Both hashes are identical',
        'The hashes differ (random salt), but encoder.matches("pass123", hash) is true for both',
        'The second call throws an exception',
        'You can decode the hash back to "pass123"',
      ],
      answer: 1,
      explain: 'BCrypt stores a **random salt** inside each hash (`$2a$10$...`), so equal passwords get different hashes. Hashing is one-way: you never decode, you only check with `matches(raw, hash)`. That is why you cannot compare hashes with `equals`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'A React app on `http://localhost:5173` calls the API on `http://localhost:8080`. Which statements about **CORS** are TRUE? (choose all that apply)',
      options: [
        'The two URLs are different origins because the ports differ',
        'CORS is enforced by the browser; Postman does not care about it',
        'For JSON POST/PUT with an Authorization header the browser first sends an OPTIONS preflight request',
        'allowedOrigins("http://localhost:5173") on the backend allows that frontend',
        'CORS protects the API from all hackers',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Origin = scheme + host + **port**. The browser blocks the response unless the server sends `Access-Control-Allow-Origin`. Preflight `OPTIONS` must be permitted by the security chain (`http.cors(...)`). CORS is a browser rule, not real protection: curl/Postman ignore it.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the CORS mapping line inside `addCorsMappings(CorsRegistry registry)` so the React dev server is allowed for all `/api/**` URLs:\n```\nregistry.addMapping("/api/**")\n        .???\n        .allowedMethods("GET", "POST", "PUT", "DELETE");\n```',
      example: { title: 'allowing headers', code: '.allowedHeaders("*")' },
      accept: ['allowedOrigins("http://localhost:5173")', 'allowedOriginPatterns("http://localhost:5173")', 'allowedOrigins("http://localhost:5173/")'],
      explain: '`allowedOrigins("http://localhost:5173")` must match the frontend origin exactly (scheme, host, port). Using `"*"` together with `allowCredentials(true)` is not allowed - another common error.',
    },
  ],
};
