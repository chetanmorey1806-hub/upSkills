export default {
  id: 'day-19-role-based-authorization-cors',
  title: 'Role-based Authorization, Password Encoding, CORS',
  module: 'Module 4: Security',
  day: 19,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Control who can do what with URL rules and method security (@PreAuthorize), store passwords safely with BCrypt / DelegatingPasswordEncoder, and allow a browser frontend on another origin to call your API using CORS.',
  objectives: [
    'Apply role/authority rules at URL level and method level (@EnableMethodSecurity, @PreAuthorize)',
    'Understand roles vs authorities and design USER/ADMIN/MANAGER permissions',
    'Use BCrypt and DelegatingPasswordEncoder; implement change-password safely',
    'Explain the browser Same-Origin Policy, preflight OPTIONS requests and CORS headers',
    'Configure CORS globally with CorsConfigurationSource inside Spring Security',
  ],
  theory: [
    {
      heading: '1. Roles vs Authorities',
      content: 'Both are GrantedAuthority strings. A ROLE is a coarse group ("ROLE_ADMIN"); an AUTHORITY is a fine permission ("product:delete"). Office analogy: your role is "Manager"; your key-card permissions are "open room 3", "approve leave". A role can bundle many permissions.',
      points: [
        'hasRole("ADMIN") ⇔ hasAuthority("ROLE_ADMIN")',
        'hasAnyRole("ADMIN","MANAGER"), hasAuthority("product:write")',
        'Store roles in DB as a separate table (user_roles) for many-to-many, or an enum column for simple apps',
      ],
    },
    {
      heading: '2. URL-level vs Method-level Security',
      content: 'URL rules in SecurityFilterChain protect paths. Method security protects Java methods — closer to the business logic and safer when the same service is reached from several controllers. Enable it with @EnableMethodSecurity (replaces @EnableGlobalMethodSecurity in Spring Security 6).',
      syntax: `@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) { ... }

@PreAuthorize("hasRole('ADMIN') or #username == authentication.name")
public UserDto getProfile(String username) { ... }

@PostAuthorize("returnObject.owner == authentication.name")
public Order getOrder(Long id) { ... }`,
      points: [
        '@PreAuthorize – checked BEFORE the method runs (most used)',
        '@PostAuthorize – checked AFTER, can use returnObject',
        '@Secured("ROLE_ADMIN") and @RolesAllowed – simpler, no SpEL (need securedEnabled/jsr250Enabled = true)',
        'Denied method access throws AccessDeniedException → 403',
      ],
    },
    {
      heading: '3. Password Encoding in Depth',
      content: 'Hashing is one-way: you can check a password but never read it back. BCrypt generates a random salt every time, so the same password gives a different hash each time, and matches() still works because the salt is stored inside the hash ($2a$10$<22-char salt><31-char hash>). The "10" is the cost factor — each +1 doubles the work.',
      points: [
        'Never compare hashes with equals(); always encoder.matches(raw, hash)',
        'PasswordEncoderFactories.createDelegatingPasswordEncoder() stores "{bcrypt}$2a$..." so you can migrate algorithms later (argon2, pbkdf2) while old hashes still work',
        'Validate password strength on registration (min length, digits, etc.) with Bean Validation',
        'Change password = verify old password with matches(), then save encode(newPassword)',
      ],
    },
    {
      heading: '4. Same-Origin Policy and CORS',
      content: 'An ORIGIN = scheme + host + port. http://localhost:5173 (React/Vite) and http://localhost:8080 (Spring Boot) are DIFFERENT origins. Browsers block JavaScript from reading responses from another origin unless the server says it is allowed — that permission system is CORS (Cross-Origin Resource Sharing). Postman ignores CORS; only browsers enforce it.',
      points: [
        'Simple requests (GET with normal headers) are sent directly; the browser checks Access-Control-Allow-Origin in the response',
        'Requests with Authorization header, JSON content-type, PUT/DELETE trigger a PREFLIGHT: the browser first sends OPTIONS with Access-Control-Request-Method/Headers',
        'Server must answer with Access-Control-Allow-Origin, -Methods, -Headers (and -Credentials if cookies are used)',
        'allowCredentials(true) cannot be combined with origin "*" — list exact origins or use allowedOriginPatterns',
      ],
    },
    {
      heading: '5. CORS with Spring Security',
      content: 'If Spring Security is present, the preflight OPTIONS request hits the security filters first and may be rejected with 401 before Spring MVC CORS config runs. Therefore configure CORS inside the SecurityFilterChain with http.cors(...) and a CorsConfigurationSource bean. Other options: @CrossOrigin on a controller (only for small apps) or WebMvcConfigurer.addCorsMappings (without security).',
      syntax: `http.cors(cors -> cors.configurationSource(corsConfigurationSource()))

@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(List.of("http://localhost:5173"));
    c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
    c.setAllowedHeaders(List.of("Authorization","Content-Type"));
    UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
    src.registerCorsConfiguration("/**", c);
    return src;
}`,
      tip: 'Typical browser error: "has been blocked by CORS policy: No \'Access-Control-Allow-Origin\' header is present". The fix is on the SERVER, not in React.',
    },
  ],
  examples: [
    {
      title: 'Example 1: Roles in the Database and URL-level Rules',
      scenario: 'A company portal with three roles: USER can view products, MANAGER can add/edit, ADMIN can delete and manage users.',
      steps: [
        'Continue the Day 18 JWT project',
        'Create enum Role {USER, MANAGER, ADMIN} and change AppUser to hold Set<Role> with @ElementCollection',
        'Update DbUserDetailsService to map roles',
        'Update SecurityConfig URL rules with HttpMethod specific matchers',
        'Seed users with a CommandLineRunner; restart and log in as each user in Postman',
      ],
      code: `// ===== entity/Role.java =====
package com.demo.secure.entity;
public enum Role { USER, MANAGER, ADMIN }

// ===== entity/AppUser.java (roles part) =====
@ElementCollection(fetch = FetchType.EAGER)
@CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
@Enumerated(EnumType.STRING)
@Column(name = "role")
private Set<Role> roles = new HashSet<>();

public AppUser(String username, String password, Set<Role> roles) {
    this.username = username; this.password = password; this.roles = roles;
}
public Set<Role> getRoles() { return roles; }

// ===== security/DbUserDetailsService.java =====
@Override
public UserDetails loadUserByUsername(String username) {
    AppUser u = repo.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException(username));
    String[] roles = u.getRoles().stream().map(Enum::name).toArray(String[]::new);
    return User.withUsername(u.getUsername())
            .password(u.getPassword())
            .roles(roles)                    // ROLE_USER, ROLE_ADMIN ...
            .build();
}

// ===== config/SecurityConfig.java (rules) =====
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers(HttpMethod.GET, "/api/products/**").hasAnyRole("USER", "MANAGER", "ADMIN")
    .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyRole("MANAGER", "ADMIN")
    .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAnyRole("MANAGER", "ADMIN")
    .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
    .requestMatchers("/api/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated())

// ===== DataSeeder.java =====
@Bean
CommandLineRunner seed(AppUserRepository repo, PasswordEncoder enc) {
    return args -> {
        if (repo.count() == 0) {
            repo.save(new AppUser("uma", enc.encode("uma123"), Set.of(Role.USER)));
            repo.save(new AppUser("manoj", enc.encode("manoj123"), Set.of(Role.USER, Role.MANAGER)));
            repo.save(new AppUser("admin", enc.encode("admin123"), Set.of(Role.ADMIN)));
        }
    };
}`,
      result: `Token of uma   : GET /api/products -> 200 | POST /api/products -> 403 | DELETE /api/products/1 -> 403
Token of manoj : GET -> 200 | POST -> 201 | DELETE -> 403
Token of admin : GET -> 200 | POST -> 201 | DELETE -> 204 | GET /api/admin/users -> 200`,
      explanation: 'Each rule matches HTTP method + path. A user may have several roles (manoj = USER + MANAGER). @ElementCollection stores roles in a separate user_roles table without needing a Role entity.',
    },
    {
      title: 'Example 2: Method Security with @PreAuthorize and Ownership Checks',
      scenario: 'Users may read and update only their own profile; admins can read any profile and delete users.',
      steps: [
        'Add @EnableMethodSecurity to SecurityConfig',
        'Create UserService with @PreAuthorize annotations',
        'Create UserController endpoints',
        'Add a @RestControllerAdvice to return a JSON 403 for AccessDeniedException',
        'Test in IntelliJ HTTP Client (.http file) or Postman with tokens of different users',
      ],
      code: `// ===== config/SecurityConfig.java =====
@Configuration
@EnableWebSecurity
@EnableMethodSecurity            // enables @PreAuthorize / @PostAuthorize
public class SecurityConfig { ... }

// ===== service/UserService.java =====
package com.demo.secure.service;

import com.demo.secure.repository.AppUserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class UserService {
    private final AppUserRepository repo;
    public UserService(AppUserRepository repo) { this.repo = repo; }

    public record UserView(Long id, String username, Set<String> roles) {}

    @PreAuthorize("hasRole('ADMIN') or #username == authentication.name")
    public UserView profile(String username) {
        var u = repo.findByUsername(username).orElseThrow();
        Set<String> roles = new TreeSet<>();
        u.getRoles().forEach(r -> roles.add(r.name()));
        return new UserView(u.getId(), u.getUsername(), roles);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void delete(Long id) { repo.deleteById(id); }

    @PreAuthorize("hasRole('ADMIN')")
    public List<String> allUsernames() {
        return repo.findAll().stream().map(u -> u.getUsername()).sorted().toList();
    }
}

// ===== controller/UserController.java =====
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService service;
    public UserController(UserService service) { this.service = service; }

    @GetMapping("/{username}")
    public UserService.UserView profile(@PathVariable String username) {
        return service.profile(username);
    }

    @GetMapping
    public List<String> all() { return service.allUsernames(); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

// ===== exception/SecurityExceptionHandler.java =====
@RestControllerAdvice
public class SecurityExceptionHandler {
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> denied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Forbidden", "message", "You do not have permission"));
    }
}`,
      result: `uma's token:
GET /api/users/uma    -> 200 {"id":1,"username":"uma","roles":["USER"]}
GET /api/users/manoj  -> 403 {"error":"Forbidden","message":"You do not have permission"}
GET /api/users        -> 403

admin's token:
GET /api/users/manoj  -> 200 {"id":2,"username":"manoj","roles":["MANAGER","USER"]}
GET /api/users        -> 200 ["admin","manoj","uma"]`,
      explanation: 'SpEL in @PreAuthorize can use method parameters (#username) and the current authentication. Spring creates a proxy around UserService and checks the expression before calling the method. TreeSet and sorted() give a predictable order in the output.',
    },
    {
      title: 'Example 3: Change Password and Global CORS for a React App',
      scenario: 'Users change their own password, and a React app running on http://localhost:5173 must call the API from the browser.',
      steps: [
        'Switch to DelegatingPasswordEncoder bean (existing BCrypt hashes need {bcrypt} prefix — fine for new projects)',
        'Add PUT /api/users/me/password in UserController',
        'Add CorsConfigurationSource bean and http.cors(...) in SecurityConfig',
        'Put allowed origins in application.properties so production can use the real domain',
        'Test CORS preflight with curl (below) or from the React dev server opened in Chrome > DevTools > Network',
      ],
      code: `# ===== application.properties =====
app.cors.allowed-origins=http://localhost:5173,http://localhost:3000

// ===== config/SecurityConfig.java (complete) =====
package com.demo.secure.config;

import com.demo.secure.security.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    private final RestAuthEntryPoint entryPoint;
    private final List<String> allowedOrigins;

    public SecurityConfig(JwtAuthFilter f, RestAuthEntryPoint e,
                          @Value("\${app.cors.allowed-origins}") List<String> origins) {
        this.jwtAuthFilter = f; this.entryPoint = e; this.allowedOrigins = origins;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder(); // {bcrypt} by default
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration c) throws Exception {
        return c.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(allowedOrigins);
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        cfg.setExposedHeaders(List.of("Location"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);                 // cache preflight for 1 hour
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cfg);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(e -> e.authenticationEntryPoint(entryPoint))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}

// ===== UserController.java (add) =====
public record ChangePasswordRequest(String oldPassword, String newPassword) {}

@PutMapping("/me/password")
public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest req,
                                             Authentication auth) {
    AppUser u = repo.findByUsername(auth.getName()).orElseThrow();
    if (!encoder.matches(req.oldPassword(), u.getPassword())) {
        return ResponseEntity.badRequest().body("Old password is wrong");
    }
    if (req.newPassword() == null || req.newPassword().length() < 8) {
        return ResponseEntity.badRequest().body("New password must have at least 8 characters");
    }
    u.setPassword(encoder.encode(req.newPassword()));
    repo.save(u);
    return ResponseEntity.ok("Password changed");
}

# ===== Testing the preflight with curl =====
curl -i -X OPTIONS http://localhost:8080/api/products \\
  -H "Origin: http://localhost:5173" \\
  -H "Access-Control-Request-Method: GET" \\
  -H "Access-Control-Request-Headers: authorization"`,
      result: `PUT /api/users/me/password {"oldPassword":"wrong","newPassword":"newpass123"} -> 400 Old password is wrong
PUT /api/users/me/password {"oldPassword":"uma123","newPassword":"newpass123"} -> 200 Password changed
DB now stores: {bcrypt}$2a$10$....

curl preflight output:
HTTP/1.1 200
Vary: Origin
Vary: Access-Control-Request-Method
Vary: Access-Control-Request-Headers
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
Access-Control-Allow-Headers: authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600

Same curl with Origin: http://evil.com -> HTTP/1.1 403  Invalid CORS request`,
      explanation: 'http.cors() puts a CorsFilter early in the security chain, so the OPTIONS preflight is answered before authentication is required. Unknown origins get 403. DelegatingPasswordEncoder prefixes hashes with {bcrypt}, so you can switch algorithms later without breaking old passwords. Password change always verifies the old password with matches().',
    },
  ],
  interview: [
    { q: 'What is the difference between @EnableMethodSecurity and @EnableGlobalMethodSecurity?', a: '@EnableMethodSecurity is the Spring Security 6 replacement; it enables @PreAuthorize/@PostAuthorize by default (prePostEnabled = true) and uses the newer AuthorizationManager API. @EnableGlobalMethodSecurity is deprecated.', level: 'Medium' },
    { q: '@PreAuthorize vs @Secured?', a: '@PreAuthorize supports SpEL expressions (hasRole, parameters, authentication.name). @Secured only takes a list of role names and needs securedEnabled = true.', level: 'Easy' },
    { q: 'How do you allow users to edit only their own data?', a: 'Use @PreAuthorize("#username == authentication.name or hasRole(\'ADMIN\')") or check ownership in the service and throw AccessDeniedException; @PostAuthorize can check returnObject ownership.', level: 'Medium' },
    { q: 'Why does BCrypt produce different hashes for the same password?', a: 'It generates a new random salt for each encode call and embeds that salt in the output. matches() extracts the salt to recompute and compare.', level: 'Medium' },
    { q: 'What is DelegatingPasswordEncoder?', a: 'An encoder that prefixes hashes with an id like {bcrypt} or {argon2} and delegates to the matching encoder. It allows migrating algorithms while old hashes keep working.', level: 'Hard' },
    { q: 'What is CORS and why does Postman not show CORS errors?', a: 'CORS is a browser mechanism that lets servers permit cross-origin JavaScript requests via Access-Control-* headers. Postman is not a browser and does not enforce the Same-Origin Policy.', level: 'Easy' },
    { q: 'What is a preflight request?', a: 'An automatic OPTIONS request the browser sends before "non-simple" requests (custom headers like Authorization, JSON body, PUT/DELETE) to ask the server which methods/headers/origins are allowed.', level: 'Medium' },
    { q: 'Why configure CORS in Spring Security rather than only @CrossOrigin?', a: 'The preflight OPTIONS request carries no credentials; security filters may reject it with 401 before reaching MVC. http.cors() handles CORS early in the filter chain.', level: 'Hard' },
    { q: 'Can you use allowedOrigins("*") with allowCredentials(true)?', a: 'No. Browsers reject wildcard with credentials and Spring throws an error. Use a list of exact origins or allowedOriginPatterns.', level: 'Medium' },
    { q: 'What status do you get for a missing role on a @PreAuthorize method?', a: 'AccessDeniedException is thrown, translated to 403 Forbidden (or handled by your @RestControllerAdvice).', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Allow MANAGER to approve leave requests only for their own department using @PreAuthorize and a helper bean.',
      hint: 'SpEL can call beans: @PreAuthorize("@leaveSecurity.canApprove(#leaveId, authentication)").',
      solution: `@Component("leaveSecurity")
public class LeaveSecurity {
    private final LeaveRepository leaves;
    private final AppUserRepository users;
    public LeaveSecurity(LeaveRepository l, AppUserRepository u) { leaves = l; users = u; }

    public boolean canApprove(Long leaveId, Authentication auth) {
        var manager = users.findByUsername(auth.getName()).orElseThrow();
        var leave = leaves.findById(leaveId).orElseThrow();
        return leave.getDepartment().equals(manager.getDepartment());
    }
}

@PreAuthorize("hasRole('MANAGER') and @leaveSecurity.canApprove(#leaveId, authentication)")
public void approve(Long leaveId) { ... }`,
    },
    {
      task: 'Add an admin endpoint to grant a role to a user: PUT /api/admin/users/{id}/roles/{role}.',
      hint: 'Role.valueOf(role.toUpperCase()); add to the Set and save.',
      solution: `@PutMapping("/api/admin/users/{id}/roles/{role}")
@PreAuthorize("hasRole('ADMIN')")
public Set<Role> grant(@PathVariable Long id, @PathVariable String role) {
    AppUser u = repo.findById(id).orElseThrow();
    u.getRoles().add(Role.valueOf(role.toUpperCase()));
    repo.save(u);
    return u.getRoles();
}`,
    },
    {
      task: 'Configure CORS using WebMvcConfigurer for a project WITHOUT Spring Security.',
      hint: 'Override addCorsMappings.',
      solution: `@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}`,
    },
    {
      task: 'Validate password strength on registration with Bean Validation (min 8, one digit, one letter).',
      hint: '@Pattern on the record component and @Valid on the @RequestBody.',
      solution: `public record RegisterRequest(
    @NotBlank @Size(min = 3, max = 30) String username,
    @NotBlank
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\\\d).{8,}$",
             message = "Password needs 8+ chars with letters and digits")
    String password) {}

@PostMapping("/register")
public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest req) { ... }`,
    },
  ],
  quiz: [
    { question: 'Which annotation enables @PreAuthorize in Spring Security 6?', options: ['@EnableMethodSecurity', '@EnableWebMvc', '@EnablePreAuth', '@EnableGlobalAuthentication'], answer: 0, explanation: '@EnableMethodSecurity, prePostEnabled is true by default.' },
    { question: 'Which pair are different origins?', options: ['http://a.com/x and http://a.com/y', 'http://a.com and http://a.com:80', 'http://localhost:5173 and http://localhost:8080', 'https://a.com/p and https://a.com/q'], answer: 2, explanation: 'Different ports = different origins.' },
    { question: 'The browser sends a preflight using HTTP method:', options: ['HEAD', 'GET', 'TRACE', 'OPTIONS'], answer: 3, explanation: 'Preflight is an OPTIONS request.' },
    { question: 'To verify a raw password against a stored BCrypt hash you call:', options: ['hash.equals(encode(raw))', 'encoder.matches(raw, hash)', 'encoder.decode(hash)', 'BCrypt.reverse(hash)'], answer: 1, explanation: 'matches() handles the salt.' },
    { question: '@PreAuthorize("#id == authentication.name") uses:', options: ['JPQL', 'SQL', 'SpEL', 'Regex'], answer: 2, explanation: 'Spring Expression Language.' },
  ],
};
