export default {
  id: 'day-17-spring-security-basics',
  title: 'Spring Security Basics, Security Filter Chain, In-memory and Database Users',
  module: 'Module 4: Security',
  day: 17,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Understand how Spring Security 6 protects a Spring Boot 3 app through a chain of servlet filters, configure it with a SecurityFilterChain bean (lambda DSL), and authenticate users stored in memory and in a database.',
  objectives: [
    'Explain authentication vs authorization and the default behaviour of spring-boot-starter-security',
    'Describe the filter chain: DelegatingFilterProxy → FilterChainProxy → SecurityFilterChain',
    'Write a SecurityFilterChain bean with the lambda DSL (no WebSecurityConfigurerAdapter)',
    'Configure in-memory users with InMemoryUserDetailsManager and BCrypt',
    'Load users from MySQL/H2 with a custom UserDetailsService',
  ],
  theory: [
    {
      heading: '1. Authentication vs Authorization',
      content: 'Authentication = WHO are you? (login with username/password). Authorization = WHAT are you allowed to do? (only ADMIN can delete). Airport analogy: showing your passport at the entrance is authentication; your boarding pass deciding which gate/plane you can enter is authorization.',
      points: [
        '401 Unauthorized → not authenticated (no or wrong credentials)',
        '403 Forbidden → authenticated, but not allowed',
        'Principal = the logged-in user; GrantedAuthority = a permission/role such as ROLE_ADMIN',
      ],
    },
    {
      heading: '2. What Happens When You Add the Starter?',
      content: 'Just adding spring-boot-starter-security secures EVERY endpoint. Spring Boot creates a default user called "user" with a random password printed in the console ("Using generated security password: ..."), a login form at /login, a logout at /logout, HTTP Basic support, CSRF protection and security headers.',
      tip: 'You can set a fixed default user quickly with spring.security.user.name=admin and spring.security.user.password=admin123 — fine for demos only.',
    },
    {
      heading: '3. The Security Filter Chain (Architecture)',
      content: 'Spring Security works BEFORE your controller, as servlet filters. Diagram in words: HTTP request → Tomcat → DelegatingFilterProxy (bridge to Spring) → FilterChainProxy → your SecurityFilterChain (a list of filters: CsrfFilter → UsernamePasswordAuthenticationFilter → BasicAuthenticationFilter → ... → ExceptionTranslationFilter → AuthorizationFilter) → DispatcherServlet → Controller. Like security checkpoints at an airport: each checkpoint can stop you or let you continue.',
      points: [
        'AuthenticationManager (ProviderManager) delegates to AuthenticationProvider(s)',
        'DaoAuthenticationProvider uses UserDetailsService (load user) + PasswordEncoder (check password)',
        'On success, an Authentication object is stored in the SecurityContextHolder (thread-local) for this request',
        'ExceptionTranslationFilter turns security exceptions into 401/403 responses',
      ],
    },
    {
      heading: '4. SecurityFilterChain with Lambda DSL (Spring Security 6)',
      content: 'WebSecurityConfigurerAdapter was REMOVED in Spring Security 6. Now you declare a @Bean of type SecurityFilterChain and configure HttpSecurity with lambdas. Rules in authorizeHttpRequests are checked top to bottom — put specific rules first and anyRequest() last.',
      syntax: `@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/", "/public/**").permitAll()
            .requestMatchers("/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated())
        .formLogin(Customizer.withDefaults())
        .httpBasic(Customizer.withDefaults());
    return http.build();
}`,
      tip: 'Old style .antMatchers(), .and(), .authorizeRequests() are removed/deprecated in 6.x. Use requestMatchers() and lambdas.',
    },
    {
      heading: '5. Users: UserDetails, UserDetailsService, PasswordEncoder',
      content: 'Spring Security does not care where users live. It only asks a UserDetailsService: "give me the user named X". You can answer from memory (InMemoryUserDetailsManager), from a database (your own implementation or JdbcUserDetailsManager), or from LDAP. Passwords must NEVER be stored as plain text — use BCryptPasswordEncoder (one-way hash with random salt).',
      points: [
        'UserDetails = username, password (hashed), authorities, account flags (enabled, locked...)',
        'roles("ADMIN") stores authority "ROLE_ADMIN"; hasRole("ADMIN") checks for "ROLE_ADMIN"',
        'If you define a UserDetailsService bean + PasswordEncoder bean, Boot wires a DaoAuthenticationProvider automatically',
        '{noop}password means "no encoding" — only for experiments',
      ],
    },
    {
      heading: '6. CSRF and Stateless APIs (Preview)',
      content: 'CSRF protection is ON by default and blocks POST/PUT/DELETE without a CSRF token. For browser form apps keep it on. For pure REST APIs using tokens (JWT, Day 18) and no cookies, disable it with csrf(csrf -> csrf.disable()) and set session management to STATELESS.',
    },
  ],
  examples: [
    {
      title: 'Example 1: Default Security and Accessing the Logged-in User',
      scenario: 'Add security to an existing REST app and see what Spring Boot does automatically.',
      steps: [
        'IntelliJ: New Project > Spring Boot > add Spring Web and Spring Security > Create. (Existing project: add the dependency to pom.xml and click the Maven reload icon)',
        'STS: File > New > Spring Starter Project > secure-demo > select Spring Web, Spring Security > Finish',
        'Create HelloController below and Run',
        'Copy the generated password from the console ("Using generated security password: ...")',
        'Open http://localhost:8080/hello → redirected to /login → login as user / <generated password>',
        'In Postman: Authorization tab > Basic Auth > enter user and password > Send',
      ],
      code: `<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

// ===== controller/HelloController.java =====
package com.demo.secure.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello(Authentication auth) {
        return "Hello " + auth.getName() + ", roles = " + auth.getAuthorities();
    }

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal UserDetails user) {
        return Map.of("username", user.getUsername(),
                      "enabled", user.isEnabled());
    }
}`,
      result: `Console:
Using generated security password: 3f1c7a2e-9b44-4c51-8e0d-1d2a6f7b9c10
(the UUID is different on every start)

GET /hello without login (Postman, no auth) -> 401 Unauthorized
GET /hello with Basic user/<password>    -> Hello user, roles = []
GET /me                                    -> {"username":"user","enabled":true}`,
      explanation: 'With zero configuration every URL is protected. Spring injects the Authentication object (or the principal via @AuthenticationPrincipal) into controller methods. The default user has no roles, so the authority list is empty.',
    },
    {
      title: 'Example 2: SecurityFilterChain with In-memory Users',
      scenario: 'A small internal app with two fixed users: a normal user and an admin. Public pages are open, /admin/** only for admins.',
      steps: [
        'Create package config and class SecurityConfig with @Configuration and @EnableWebSecurity',
        'Define PasswordEncoder, UserDetailsService (InMemoryUserDetailsManager) and SecurityFilterChain beans',
        'Create PublicController, UserController, AdminController',
        'Run; the generated password is no longer printed because we defined our own users',
        'Test in Postman with Basic Auth: ravi/ravi123 and admin/admin123',
      ],
      code: `// ===== config/SecurityConfig.java =====
package com.demo.secure.config;

import org.springframework.context.annotation.*;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService users(PasswordEncoder encoder) {
        UserDetails ravi = User.withUsername("ravi")
                .password(encoder.encode("ravi123"))
                .roles("USER")
                .build();
        UserDetails admin = User.withUsername("admin")
                .password(encoder.encode("admin123"))
                .roles("ADMIN", "USER")
                .build();
        return new InMemoryUserDetailsManager(ravi, admin);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/public/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")
                .anyRequest().authenticated())
            .formLogin(Customizer.withDefaults())
            .httpBasic(Customizer.withDefaults())
            .logout(logout -> logout.logoutSuccessUrl("/public/bye"));
        return http.build();
    }
}

// ===== controller/PagesController.java =====
package com.demo.secure.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
public class PagesController {
    @GetMapping("/public/info") public String info() { return "Anyone can see this"; }
    @GetMapping("/public/bye")  public String bye()  { return "You are logged out"; }

    @GetMapping("/user/dashboard")
    public String user(Authentication a) { return "User dashboard for " + a.getName(); }

    @GetMapping("/admin/panel")
    public String admin(Authentication a) { return "Admin panel for " + a.getName(); }
}`,
      result: `GET /public/info (no auth)            -> 200 Anyone can see this
GET /user/dashboard (no auth)         -> 401 Unauthorized
GET /user/dashboard (ravi/ravi123)    -> 200 User dashboard for ravi
GET /admin/panel   (ravi/ravi123)     -> 403 Forbidden
GET /admin/panel   (admin/admin123)   -> 200 Admin panel for admin
GET /admin/panel   (admin/wrong)      -> 401 Unauthorized`,
      explanation: 'Rules are matched top to bottom. ravi is authenticated but lacks ROLE_ADMIN → 403. A wrong password fails authentication → 401. Passwords are stored as BCrypt hashes even in memory.',
    },
    {
      title: 'Example 3: Database Users with a Custom UserDetailsService',
      scenario: 'Real apps keep users in a database. Users register via an API and log in with credentials stored (hashed) in MySQL/H2.',
      steps: [
        'Add Spring Data JPA and H2/MySQL Driver starters',
        'Create AppUser entity and AppUserRepository with findByUsername',
        'Create DbUserDetailsService implements UserDetailsService',
        'Remove the in-memory UserDetailsService bean from SecurityConfig and permit /auth/register',
        'Create AuthController with POST /auth/register that hashes the password with BCrypt',
        'Register a user in Postman (POST, Body > raw > JSON), then call /user/dashboard with Basic Auth',
      ],
      code: `// ===== entity/AppUser.java =====
package com.demo.secure.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "app_users")
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String username;
    @Column(nullable = false)
    private String password;      // BCrypt hash
    private String role;          // e.g. "USER" or "ADMIN"
    private boolean enabled = true;

    protected AppUser() {}
    public AppUser(String username, String password, String role) {
        this.username = username; this.password = password; this.role = role;
    }
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getRole() { return role; }
    public boolean isEnabled() { return enabled; }
}

// ===== repository/AppUserRepository.java =====
package com.demo.secure.repository;
import com.demo.secure.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);
    boolean existsByUsername(String username);
}

// ===== security/DbUserDetailsService.java =====
package com.demo.secure.security;

import com.demo.secure.repository.AppUserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class DbUserDetailsService implements UserDetailsService {
    private final AppUserRepository repo;
    public DbUserDetailsService(AppUserRepository repo) { this.repo = repo; }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repo.findByUsername(username)
            .map(u -> User.withUsername(u.getUsername())
                    .password(u.getPassword())
                    .roles(u.getRole())
                    .disabled(!u.isEnabled())
                    .build())
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}

// ===== config/SecurityConfig.java (DB version) =====
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())    // REST API tested from Postman
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/register", "/h2-console/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .headers(h -> h.frameOptions(f -> f.sameOrigin()))   // allow H2 console frames
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }
    // DbUserDetailsService is a @Service bean, so Boot uses it automatically
}

// ===== controller/AuthController.java =====
package com.demo.secure.controller;

import com.demo.secure.entity.AppUser;
import com.demo.secure.repository.AppUserRepository;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AppUserRepository repo;
    private final PasswordEncoder encoder;
    public AuthController(AppUserRepository repo, PasswordEncoder encoder) {
        this.repo = repo; this.encoder = encoder;
    }

    public record RegisterRequest(String username, String password) {}

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest req) {
        if (repo.existsByUsername(req.username())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username taken");
        }
        repo.save(new AppUser(req.username(), encoder.encode(req.password()), "USER"));
        return ResponseEntity.status(HttpStatus.CREATED).body("Registered " + req.username());
    }
}`,
      result: `POST /auth/register {"username":"sita","password":"sita@123"} -> 201 Registered sita
POST /auth/register {"username":"sita","password":"x"}        -> 409 Username taken

H2 console: SELECT username, password FROM app_users
sita | $2a$10$Qe0n0x... (60-character BCrypt hash, different every time)

GET /user/dashboard (Basic sita/sita@123) -> 200 User dashboard for sita
GET /admin/panel    (Basic sita/sita@123) -> 403 Forbidden`,
      explanation: 'At login DaoAuthenticationProvider calls loadUserByUsername("sita"), gets the stored hash and calls passwordEncoder.matches(raw, hash). The DB never contains the real password. Because DbUserDetailsService and PasswordEncoder are beans, Spring Boot wires them automatically — no AuthenticationManager configuration needed.',
    },
  ],
  interview: [
    { q: 'What is the difference between authentication and authorization?', a: 'Authentication verifies identity (who you are). Authorization decides access rights (what you can do). Failed authentication → 401, failed authorization → 403.', level: 'Easy' },
    { q: 'What replaced WebSecurityConfigurerAdapter?', a: 'In Spring Security 5.7+ (removed in 6) you expose a SecurityFilterChain @Bean that configures HttpSecurity, plus separate beans for UserDetailsService, PasswordEncoder, and WebSecurityCustomizer if needed.', level: 'Easy' },
    { q: 'Explain the Spring Security filter chain.', a: 'DelegatingFilterProxy (servlet filter) delegates to Spring\'s FilterChainProxy, which picks the matching SecurityFilterChain and runs its ordered filters (CSRF, authentication filters, ExceptionTranslationFilter, AuthorizationFilter) before the request reaches DispatcherServlet.', level: 'Medium' },
    { q: 'What is UserDetailsService?', a: 'A core interface with one method loadUserByUsername(String) that returns UserDetails. Spring Security uses it to fetch user data from any store (memory, DB, LDAP).', level: 'Easy' },
    { q: 'Why BCrypt?', a: 'BCrypt is a slow, salted, adaptive one-way hash. Salt prevents rainbow-table attacks; the work factor (strength, default 10) can be increased as hardware gets faster.', level: 'Medium' },
    { q: 'What is the difference between hasRole("ADMIN") and hasAuthority("ADMIN")?', a: 'hasRole adds the ROLE_ prefix and checks for "ROLE_ADMIN". hasAuthority checks the exact string "ADMIN".', level: 'Medium' },
    { q: 'What is SecurityContextHolder?', a: 'It stores the SecurityContext (containing the Authentication) for the current thread (ThreadLocal by default). Code can read SecurityContextHolder.getContext().getAuthentication() to get the current user.', level: 'Medium' },
    { q: 'What is CSRF and when can you disable it?', a: 'Cross-Site Request Forgery tricks a logged-in browser into sending unwanted requests using its cookies. Protection is needed for cookie/session-based browser apps; it can be disabled for stateless REST APIs that use Authorization headers (JWT) instead of cookies.', level: 'Hard' },
    { q: 'Why does order matter in authorizeHttpRequests?', a: 'Rules are evaluated top-down and the first match wins. If anyRequest().authenticated() is placed before a permitAll rule, the later rule is never reached (Spring 6 actually throws an error if anyRequest is not last).', level: 'Medium' },
    { q: 'What does Spring Boot do when you only add spring-boot-starter-security?', a: 'Secures all endpoints, creates user "user" with a random password logged at startup, enables form login, HTTP Basic, logout, CSRF and secure headers.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a SecurityFilterChain where /api/products GET is public, but POST/PUT/DELETE require ROLE_ADMIN.',
      hint: 'requestMatchers(HttpMethod.GET, "/api/products/**").permitAll().',
      solution: `@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.csrf(c -> c.disable())
        .authorizeHttpRequests(a -> a
            .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
            .anyRequest().authenticated())
        .httpBasic(Customizer.withDefaults());
    return http.build();
}`,
    },
    {
      task: 'Add three in-memory users (student, trainer, admin) with BCrypt passwords and different roles.',
      hint: 'User.withUsername(...).password(encoder.encode(...)).roles(...).',
      solution: `@Bean
UserDetailsService users(PasswordEncoder enc) {
    return new InMemoryUserDetailsManager(
        User.withUsername("student").password(enc.encode("s123")).roles("STUDENT").build(),
        User.withUsername("trainer").password(enc.encode("t123")).roles("TRAINER").build(),
        User.withUsername("admin").password(enc.encode("a123")).roles("ADMIN").build());
}`,
    },
    {
      task: 'Write an endpoint /whoami that returns the username and roles of the current user using SecurityContextHolder.',
      hint: 'SecurityContextHolder.getContext().getAuthentication().',
      solution: `@GetMapping("/whoami")
public Map<String, Object> whoami() {
    Authentication a = SecurityContextHolder.getContext().getAuthentication();
    List<String> roles = a.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority).toList();
    return Map.of("user", a.getName(), "roles", roles);
}`,
    },
    {
      task: 'Seed an admin user into the database on startup only if it does not exist.',
      hint: 'Use a CommandLineRunner bean.',
      solution: `@Bean
CommandLineRunner seedAdmin(AppUserRepository repo, PasswordEncoder enc) {
    return args -> {
        if (!repo.existsByUsername("admin")) {
            repo.save(new AppUser("admin", enc.encode("admin@123"), "ADMIN"));
        }
    };
}`,
    },
  ],
  quiz: [
    { question: 'Which is the Spring Security 6 way to configure HTTP security?', options: ['Extend WebSecurityConfigurerAdapter', 'Declare a SecurityFilterChain @Bean', 'Use web.xml', 'Use @EnableGlobalSecurity only'], answer: 1, explanation: 'WebSecurityConfigurerAdapter was removed.' },
    { question: 'An authenticated user without the required role gets:', options: ['401', '404', '500', '403'], answer: 3, explanation: '403 Forbidden = authenticated but not authorized.' },
    { question: 'roles("ADMIN") stores the authority:', options: ['ROLE_ADMIN', 'ADMIN', 'admin', 'AUTH_ADMIN'], answer: 0, explanation: 'roles() adds the ROLE_ prefix.' },
    { question: 'Which interface loads a user by username?', options: ['AuthenticationManager', 'PasswordEncoder', 'UserDetailsService', 'SecurityContext'], answer: 2, explanation: 'loadUserByUsername(String).' },
    { question: 'Which encoder should store passwords?', options: ['NoOpPasswordEncoder', 'Base64', 'MD5', 'BCryptPasswordEncoder'], answer: 3, explanation: 'BCrypt is salted and adaptive.' },
  ],
};
