export default {
  lesson: 'day-17-spring-security-basics',
  minutes: 24,
  intro: 'Understand the security filter chain, configure SecurityFilterChain rules and users, and predict which requests are allowed.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between **authentication** and **authorization**?',
      options: [
        'They are the same',
        'Authentication = who are you? (verify identity); Authorization = what are you allowed to do? (check permissions)',
        'Authentication is for admins only',
        'Authorization happens before authentication',
      ],
      answer: 1,
      explain: 'First the user proves identity (login → authentication, failure = **401**), then each request is checked against roles/permissions (authorization, failure = **403**).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'You only add `spring-boot-starter-security` and restart. What happens? (choose all that apply)',
      options: [
        'Every endpoint now requires authentication',
        'A default user named "user" is created',
        'A random password is printed in the startup log',
        'A login form and HTTP Basic are enabled',
        'All endpoints stay public until you write configuration',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Security is **secure by default**: all URLs are protected, a user `user` with a generated password (in the console) is created, and form login + HTTP Basic are on. You then relax it with your own `SecurityFilterChain`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the rule so everything under `/api/public/` is open to everyone:\n```\nhttp.authorizeHttpRequests(auth -> auth\n    .???\n    .anyRequest().authenticated());\n```',
      example: { title: 'a rule for one method', code: '.requestMatchers(HttpMethod.GET, "/api/courses/**").permitAll()' },
      accept: ['requestMatchers("/api/public/**").permitAll()'],
      explain: '`requestMatchers("/api/public/**").permitAll()` - `**` matches any sub-path. Rules are checked **top to bottom**, so specific rules go before `anyRequest()`. In Spring Security 6 the old `antMatchers` no longer exists.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Users: `asha` / `pass123` (in memory). HTTP Basic is enabled. Type the status code of each request, one per line:\n1. `GET /api/public/courses` (no credentials)\n2. `GET /api/students` (no credentials)\n3. `GET /api/students` as asha / pass123\n4. `GET /api/students` as asha / wrong',
      example: { title: 'Basic auth in Postman', text: 'Authorization tab → Basic Auth → username + password. Postman sends the header Authorization: Basic base64(user:pass).' },
      code: `@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/public/**").permitAll()
            .anyRequest().authenticated())
        .httpBasic(Customizer.withDefaults());
    return http.build();
}`,
      expected: '200\n401\n200\n401',
      explain: 'Public URLs pass without login (200). Protected URLs without credentials → **401**. Correct credentials → 200. A wrong password fails authentication → also **401** (403 would mean "logged in but not allowed").',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the bean so passwords are hashed with BCrypt:\n```\n@Bean\npublic PasswordEncoder passwordEncoder() {\n    return ???;\n}\n```',
      example: { title: 'using it when saving a user', code: 'user.setPassword(passwordEncoder.encode(rawPassword));' },
      accept: ['new BCryptPasswordEncoder()', 'new BCryptPasswordEncoder();', 'new BCryptPasswordEncoder(12)', 'PasswordEncoderFactories.createDelegatingPasswordEncoder()'],
      explain: '`new BCryptPasswordEncoder()` hashes with a random salt. Storing plain text passwords (or using `NoOpPasswordEncoder`) is a serious security bug. Spring compares with `matches(raw, hash)`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'To load users from the MySQL `users` table, which interface do you implement?',
      options: ['UserRepository', 'UserDetailsService with loadUserByUsername(String username)', 'AuthenticationManagerBuilder', 'SecurityContextHolder'],
      answer: 1,
      explain: '`UserDetailsService.loadUserByUsername` finds the user (via your JPA repository) and returns a `UserDetails` (username, hashed password, authorities). Spring\'s `DaoAuthenticationProvider` calls it and checks the password with the `PasswordEncoder`.',
    },
  ],
};
