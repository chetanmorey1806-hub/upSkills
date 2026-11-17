export default {
  id: 'day-18-jwt-authentication',
  title: 'JWT Authentication',
  module: 'Module 4: Security',
  day: 18,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Build stateless login for a REST API: the server issues a signed JSON Web Token (JWT) after checking the password, and a custom filter validates the token on every request. Uses Spring Security 6 and the jjwt 0.12 API.',
  objectives: [
    'Explain JWT structure (header.payload.signature) and stateless authentication',
    'Generate and validate tokens with jjwt 0.12 (Jwts.builder(), Jwts.parser().verifyWith())',
    'Write a OncePerRequestFilter that reads the Authorization: Bearer header',
    'Expose an AuthenticationManager bean and build /api/auth/login',
    'Configure a stateless SecurityFilterChain with a custom 401 entry point',
  ],
  theory: [
    {
      heading: '1. Session vs Token Authentication',
      content: 'Session-based login stores the user on the SERVER (HttpSession) and gives the browser a JSESSIONID cookie. Token-based login gives the CLIENT a signed token; the server stores nothing and simply verifies the signature on each request. Analogy: a session is a cloakroom (the server keeps your coat and gives you a numbered tag); a JWT is a stamped concert wristband — any guard can check the stamp without looking up a list.',
      points: [
        'Stateless → easy to scale horizontally (any server instance can verify)',
        'Works well for SPAs (React/Angular), mobile apps and microservices',
        'Trade-off: a token cannot be "logged out" server-side before expiry unless you keep a blacklist — so keep expiry short',
      ],
    },
    {
      heading: '2. Structure of a JWT',
      content: 'A JWT is three Base64URL strings joined by dots: HEADER.PAYLOAD.SIGNATURE. Header says the algorithm (e.g. HS256). Payload contains claims: sub (subject/username), iat (issued at), exp (expiry), plus custom claims like roles. Signature = HMAC-SHA256(header + "." + payload, secretKey). If anyone changes the payload, the signature no longer matches.',
      syntax: `eyJhbGciOiJIUzI1NiJ9            <- header  {"alg":"HS256"}
.eyJzdWIiOiJyYXZpIiwicm9sZXMiOlsiVVNFUiJdLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMzYwMH0
                                 <- payload {"sub":"ravi","roles":["USER"],"iat":...,"exp":...}
.Xk3...signature...`,
      tip: 'The payload is only ENCODED, not encrypted. Anyone can read it at jwt.io. Never put passwords or secrets in a JWT.',
    },
    {
      heading: '3. The JWT Login Flow (diagram in words)',
      content: 'Step 1: Client POSTs {username, password} to /api/auth/login. Step 2: AuthenticationManager checks credentials via UserDetailsService + BCrypt. Step 3: Server creates a JWT and returns {"token": "..."}. Step 4: Client stores the token and sends "Authorization: Bearer <token>" on every request. Step 5: JwtAuthFilter extracts and validates the token, loads the user, and puts an Authentication into the SecurityContext. Step 6: AuthorizationFilter checks roles and the controller runs.',
    },
    {
      heading: '4. jjwt 0.12 API (new style)',
      content: 'jjwt 0.12 renamed many methods. Old: setSubject, setExpiration, signWith(SignatureAlgorithm, key), parserBuilder().setSigningKey().build().parseClaimsJws(). New ones below. The key must be at least 256 bits (32 bytes) for HS256.',
      syntax: `SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64Secret));

String token = Jwts.builder()
        .subject("ravi")
        .claim("roles", List.of("USER"))
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + 3600_000))
        .signWith(key)                    // algorithm chosen from key size (HS256/384/512)
        .compact();

Claims claims = Jwts.parser()
        .verifyWith(key)
        .build()
        .parseSignedClaims(token)          // throws JwtException if invalid/expired
        .getPayload();`,
      points: [
        'Dependencies: jjwt-api (compile), jjwt-impl and jjwt-jackson (runtime)',
        'ExpiredJwtException, SignatureException, MalformedJwtException all extend JwtException',
        'Store the secret in an environment variable, not in Git',
      ],
    },
    {
      heading: '5. Stateless SecurityFilterChain',
      content: 'For a JWT API: disable CSRF (no cookies), set SessionCreationPolicy.STATELESS (no HttpSession), permit /api/auth/**, and add your JwtAuthFilter BEFORE UsernamePasswordAuthenticationFilter. Also return clean 401 JSON via an AuthenticationEntryPoint.',
      syntax: `http.csrf(csrf -> csrf.disable())
    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .authorizeHttpRequests(a -> a.requestMatchers("/api/auth/**").permitAll()
                                 .anyRequest().authenticated())
    .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);`,
    },
    {
      heading: '6. Access Token vs Refresh Token',
      content: 'Access tokens are short-lived (5–60 minutes) to limit damage if stolen. A refresh token is long-lived (days), stored securely (HttpOnly cookie or DB), and used only at /api/auth/refresh to get a new access token. Logging out = deleting/revoking the refresh token.',
    },
  ],
  examples: [
    {
      title: 'Example 1: JwtService — Generate and Validate Tokens (jjwt 0.12)',
      scenario: 'Create a reusable service that issues tokens with username and roles and validates them.',
      steps: [
        'Open the Day 17 project (DB users with DbUserDetailsService)',
        'Add jjwt-api, jjwt-impl, jjwt-jackson 0.12.6 to pom.xml; IntelliJ: click "Load Maven Changes"; STS: Alt+F5 (Maven > Update Project)',
        'Generate a 256-bit Base64 secret: in a terminal run  openssl rand -base64 32  and put it in application.properties (or env var JWT_SECRET)',
        'Create package security and class JwtService',
        'Write a quick test: right-click test folder > New > Java Class JwtServiceTest and run it (IntelliJ: green ▶ in gutter; STS: Run As > JUnit Test)',
      ],
      code: `<!-- ===== pom.xml ===== -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>

# ===== application.properties =====
# reads env var JWT_SECRET, falls back to a dev-only value (32+ bytes Base64)
app.jwt.secret=\${JWT_SECRET:ZGV2LW9ubHktc2VjcmV0LWtleS1mb3Itand0LWRlbW8tMTIzNDU2Nzg5MA==}
app.jwt.expiration-ms=3600000

// ===== security/JwtService.java =====
package com.demo.secure.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationMs;

    public JwtService(@Value("\${app.jwt.secret}") String secret,
                      @Value("\${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.expirationMs = expirationMs;
    }

    public String generateToken(UserDetails user) {
        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList();
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return parse(token).getSubject();
    }

    public boolean isValid(String token, UserDetails user) {
        try {
            Claims c = parse(token);           // checks signature + expiry
            return c.getSubject().equals(user.getUsername());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}

// ===== src/test/java/.../JwtServiceTest.java =====
package com.demo.secure.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    private final JwtService jwt = new JwtService(
        "ZGV2LW9ubHktc2VjcmV0LWtleS1mb3Itand0LWRlbW8tMTIzNDU2Nzg5MA==", 60_000);

    @Test
    void tokenRoundTrip() {
        UserDetails ravi = User.withUsername("ravi").password("x").roles("USER").build();
        String token = jwt.generateToken(ravi);
        assertEquals(3, token.split("\\\\.").length);
        assertEquals("ravi", jwt.extractUsername(token));
        assertTrue(jwt.isValid(token, ravi));
        assertFalse(jwt.isValid(token + "tampered", ravi));
    }
}`,
      result: `JwtServiceTest > tokenRoundTrip()  PASSED

Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`,
      explanation: 'The token has three parts. extractUsername reads the "sub" claim after verifying the signature. Appending characters breaks the signature, so parseSignedClaims throws a SignatureException (a JwtException) and isValid returns false. Note: in the Java source the split regex is "\\\\." (escaped dot).',
    },
    {
      title: 'Example 2: JwtAuthFilter and Stateless Security Configuration',
      scenario: 'Every request with "Authorization: Bearer <token>" must be authenticated without a session.',
      steps: [
        'Create security/JwtAuthFilter extends OncePerRequestFilter',
        'Replace SecurityConfig with the stateless version below; expose AuthenticationManager as a bean',
        'Create security/RestAuthEntryPoint to return JSON for 401',
        'Note: IntelliJ may warn "Could not autowire" for HttpSecurity in older versions — ignore, it is provided by Spring Security',
      ],
      code: `// ===== security/JwtAuthFilter.java =====
package com.demo.secure.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthFilter(JwtService jwtService, UserDetailsService uds) {
        this.jwtService = jwtService;
        this.userDetailsService = uds;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);      // no token: continue, rules decide
            return;
        }
        String token = header.substring(7);
        try {
            String username = jwtService.extractUsername(token);
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails user = userDetailsService.loadUserByUsername(username);
                if (jwtService.isValid(token, user)) {
                    var auth = new UsernamePasswordAuthenticationToken(
                            user, null, user.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        } catch (Exception ex) {
            // invalid/expired token: leave context empty -> entry point returns 401
        }
        chain.doFilter(request, response);
    }
}

// ===== security/RestAuthEntryPoint.java =====
package com.demo.secure.security;

import jakarta.servlet.http.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class RestAuthEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest req, HttpServletResponse res,
                         AuthenticationException ex) throws IOException {
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setContentType("application/json");
        res.getWriter().write("{\\"error\\":\\"Unauthorized\\",\\"message\\":\\"Missing or invalid token\\"}");
    }
}

// ===== config/SecurityConfig.java =====
package com.demo.secure.config;

import com.demo.secure.security.*;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    private final RestAuthEntryPoint entryPoint;

    public SecurityConfig(JwtAuthFilter f, RestAuthEntryPoint e) {
        this.jwtAuthFilter = f; this.entryPoint = e;
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
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
}`,
      result: `GET /api/profile  (no header)
-> 401 {"error":"Unauthorized","message":"Missing or invalid token"}

GET /api/profile  Authorization: Bearer abc.def.ghi
-> 401 {"error":"Unauthorized","message":"Missing or invalid token"}`,
      explanation: 'OncePerRequestFilter guarantees one execution per request. When the token is valid the filter stores an authenticated UsernamePasswordAuthenticationToken in the SecurityContext; later filters treat the request as logged in. With no/invalid token the context stays empty and the entry point sends 401 JSON. STATELESS means no JSESSIONID cookie is ever created.',
    },
    {
      title: 'Example 3: Login Endpoint and Calling Protected APIs with Postman',
      scenario: 'Users log in with username/password, receive a token, then call protected endpoints with it.',
      steps: [
        'Create dto records LoginRequest and AuthResponse',
        'Create AuthController with /api/auth/register and /api/auth/login',
        'Create ProfileController with GET /api/profile',
        'Run the app (IntelliJ ▶ / STS Boot Dashboard)',
        'Postman: POST http://localhost:8080/api/auth/login, Body > raw > JSON {"username":"sita","password":"sita@123"}',
        'Copy the token; in the next request open Authorization tab > Type: Bearer Token > paste > Send GET /api/profile',
        'Tip: in Postman Tests tab store it automatically: pm.environment.set("token", pm.response.json().token) and use {{token}}',
      ],
      code: `// ===== dto/AuthDtos.java =====
package com.demo.secure.dto;

public class AuthDtos {
    public record LoginRequest(String username, String password) {}
    public record RegisterRequest(String username, String password) {}
    public record AuthResponse(String token, String type, long expiresInSeconds) {}
}

// ===== controller/AuthController.java =====
package com.demo.secure.controller;

import com.demo.secure.dto.AuthDtos.*;
import com.demo.secure.entity.AppUser;
import com.demo.secure.repository.AppUserRepository;
import com.demo.secure.security.JwtService;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final AppUserRepository repo;
    private final PasswordEncoder encoder;

    public AuthController(AuthenticationManager am, JwtService js,
                          AppUserRepository repo, PasswordEncoder enc) {
        this.authManager = am; this.jwtService = js; this.repo = repo; this.encoder = enc;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest req) {
        if (repo.existsByUsername(req.username()))
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username taken");
        repo.save(new AppUser(req.username(), encoder.encode(req.password()), "USER"));
        return ResponseEntity.status(HttpStatus.CREATED).body("Registered");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));
            UserDetails user = (UserDetails) auth.getPrincipal();
            String token = jwtService.generateToken(user);
            return ResponseEntity.ok(new AuthResponse(token, "Bearer", 3600));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }
}

// ===== controller/ProfileController.java =====
package com.demo.secure.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
public class ProfileController {
    @GetMapping("/api/profile")
    public Map<String, Object> profile(Authentication auth) {
        return Map.of("username", auth.getName(),
                      "authorities", auth.getAuthorities().toString());
    }
}`,
      result: `POST /api/auth/register {"username":"sita","password":"sita@123"}  -> 201 Registered

POST /api/auth/login {"username":"sita","password":"wrong"}
-> 401 Invalid username or password

POST /api/auth/login {"username":"sita","password":"sita@123"}
-> 200 {"token":"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzaXRhIi...","type":"Bearer","expiresInSeconds":3600}

GET /api/profile   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
-> 200 {"username":"sita","authorities":"[ROLE_USER]"}

GET /api/admin/users  (sita's token) -> 403 Forbidden`,
      explanation: 'authManager.authenticate() runs the same DaoAuthenticationProvider as form login (UserDetailsService + BCrypt). On success we return a JWT. On each later request JwtAuthFilter rebuilds the Authentication from the token, so no session is needed. sita has ROLE_USER only, so admin URLs return 403.',
    },
  ],
  interview: [
    { q: 'What is a JWT and what are its parts?', a: 'JSON Web Token: a compact, URL-safe, signed token with three Base64URL parts — header (algorithm), payload (claims like sub, exp, roles) and signature (HMAC or RSA of header+payload).', level: 'Easy' },
    { q: 'Is the JWT payload encrypted?', a: 'No, it is only Base64URL-encoded and can be decoded by anyone. The signature only guarantees integrity. Use JWE if encryption is needed, and never store secrets in it.', level: 'Easy' },
    { q: 'Why is JWT authentication called stateless?', a: 'The server does not store session data; all information needed to authenticate is inside the signed token, verified with the secret key on every request.', level: 'Easy' },
    { q: 'Where do you add the JWT filter and why?', a: 'addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class) so that the SecurityContext is populated before Spring\'s authentication/authorization filters run.', level: 'Medium' },
    { q: 'Why extend OncePerRequestFilter?', a: 'It guarantees the filter runs exactly once per request even with internal forwards/error dispatches, and gives a simple doFilterInternal method.', level: 'Medium' },
    { q: 'How do you log out a user with JWT?', a: 'The client deletes the token. Server-side options: short access-token expiry, revoking refresh tokens in DB, or a token blacklist/deny-list (e.g. in Redis) checked by the filter.', level: 'Hard' },
    { q: 'What changed in jjwt 0.12?', a: 'Fluent names without set: subject(), expiration(), issuedAt(); signWith(key) infers the algorithm; parsing uses Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(). parserBuilder(), setSigningKey(), parseClaimsJws() are deprecated/removed.', level: 'Medium' },
    { q: 'HS256 vs RS256?', a: 'HS256 uses one shared secret for signing and verifying (good for a single service). RS256 uses a private key to sign and a public key to verify, so other services can verify without being able to create tokens — better for microservices/OAuth2.', level: 'Hard' },
    { q: 'Why disable CSRF for JWT APIs?', a: 'CSRF attacks rely on browsers automatically sending cookies. If the token is sent manually in the Authorization header, a malicious site cannot attach it, so CSRF protection is unnecessary. (If you store the JWT in a cookie, CSRF protection is needed again.)', level: 'Hard' },
    { q: 'How do you get an AuthenticationManager in Spring Security 6?', a: 'Expose it as a bean from AuthenticationConfiguration: @Bean AuthenticationManager am(AuthenticationConfiguration c) { return c.getAuthenticationManager(); }.', level: 'Medium' },
    { q: 'What is a refresh token?', a: 'A long-lived credential used only to obtain new short-lived access tokens without asking for the password again. It is stored securely and can be revoked.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add a custom claim "email" to the token and return it from /api/profile by reading the token claims.',
      hint: '.claim("email", value) when building; read with claims.get("email", String.class).',
      solution: `// JwtService
public String generateToken(UserDetails user, String email) {
    Date now = new Date();
    return Jwts.builder().subject(user.getUsername())
            .claim("email", email)
            .issuedAt(now).expiration(new Date(now.getTime() + expirationMs))
            .signWith(key).compact();
}

// ProfileController
@GetMapping("/api/profile/email")
public Map<String, String> email(@RequestHeader("Authorization") String header) {
    Claims c = jwtService.parse(header.substring(7));
    return Map.of("email", c.get("email", String.class));
}`,
    },
    {
      task: 'Return a specific message when the token is expired ("Token expired") instead of the generic 401.',
      hint: 'Catch ExpiredJwtException in the filter and set a request attribute that the entry point reads.',
      solution: `// in JwtAuthFilter
} catch (ExpiredJwtException ex) {
    request.setAttribute("jwt_error", "Token expired");
} catch (JwtException ex) {
    request.setAttribute("jwt_error", "Invalid token");
}

// in RestAuthEntryPoint
Object msg = req.getAttribute("jwt_error");
String text = msg == null ? "Missing or invalid token" : msg.toString();
res.setStatus(401);
res.setContentType("application/json");
res.getWriter().write("{\\"error\\":\\"Unauthorized\\",\\"message\\":\\"" + text + "\\"}");`,
    },
    {
      task: 'Implement a simple refresh token: issue a 7-day refresh token at login and an endpoint /api/auth/refresh that returns a new access token.',
      hint: 'Use a claim "type":"refresh" and a different expiry.',
      solution: `public String generateRefreshToken(String username) {
    Date now = new Date();
    return Jwts.builder().subject(username).claim("type", "refresh")
            .issuedAt(now).expiration(new Date(now.getTime() + 7L * 24 * 3600 * 1000))
            .signWith(key).compact();
}

@PostMapping("/refresh")
public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
    try {
        Claims c = jwtService.parse(body.get("refreshToken"));
        if (!"refresh".equals(c.get("type", String.class)))
            return ResponseEntity.status(401).body("Not a refresh token");
        UserDetails u = userDetailsService.loadUserByUsername(c.getSubject());
        return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(u), "Bearer", 3600));
    } catch (JwtException e) {
        return ResponseEntity.status(401).body("Invalid refresh token");
    }
}`,
    },
    {
      task: 'Write a JUnit test proving that an expired token is rejected.',
      hint: 'Create JwtService with expirationMs = -1000 (already expired).',
      solution: `@Test
void expiredTokenIsInvalid() {
    JwtService expired = new JwtService(
        "ZGV2LW9ubHktc2VjcmV0LWtleS1mb3Itand0LWRlbW8tMTIzNDU2Nzg5MA==", -1000);
    UserDetails u = User.withUsername("a").password("x").roles("USER").build();
    String token = expired.generateToken(u);
    assertFalse(expired.isValid(token, u));
    assertThrows(ExpiredJwtException.class, () -> expired.parse(token));
}`,
    },
  ],
  quiz: [
    { question: 'Which header carries the JWT?', options: ['Cookie: JWT=...', 'X-Token: ...', 'Authorization: Bearer <token>', 'Accept: token'], answer: 2, explanation: 'Bearer scheme in the Authorization header.' },
    { question: 'jjwt 0.12 method to verify and read claims:', options: ['parseClaimsJws(token).getBody()', 'parser().verifyWith(key).build().parseSignedClaims(token).getPayload()', 'decode(token)', 'parserBuilder().setSigningKey(key)'], answer: 1, explanation: 'New 0.12 API.' },
    { question: 'Session policy for JWT APIs:', options: ['STATELESS', 'ALWAYS', 'IF_REQUIRED', 'NEVER_EXPIRE'], answer: 0, explanation: 'No HttpSession is created or used.' },
    { question: 'Minimum key size for HS256:', options: ['64 bits', '128 bits', '512 bits', '256 bits'], answer: 3, explanation: 'Keys.hmacShaKeyFor requires at least 256 bits.' },
    { question: 'Changing one character of the payload causes:', options: ['Nothing', 'A longer expiry', 'Signature verification failure', 'Role upgrade'], answer: 2, explanation: 'The signature no longer matches.' },
  ],
};
