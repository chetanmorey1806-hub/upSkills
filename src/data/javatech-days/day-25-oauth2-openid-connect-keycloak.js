export default {
  id: 'day-25-oauth2-openid-connect-keycloak',
  title: 'OAuth2, OpenID Connect and Keycloak with Spring Security',
  module: 'Module 6: Microservices, Messaging & APIs',
  day: 25,
  level: 'Advanced',
  duration: '3.5 hours',
  summary: 'Move from home-made JWT login to industry-standard security. Understand OAuth2 roles and flows, access/refresh/ID tokens and OpenID Connect, add "Login with Google" to a Spring Boot web app, run Keycloak as an identity server, and protect REST APIs as an OAuth2 Resource Server with role mapping.',
  objectives: [
    'Explain OAuth2 roles (resource owner, client, authorization server, resource server) and the main grant types',
    'Differentiate access token, refresh token and ID token, and OAuth2 vs OpenID Connect',
    'Implement "Login with Google" using spring-boot-starter-oauth2-client',
    'Set up Keycloak in Docker with realm, client, roles and users',
    'Protect a Spring Boot REST API as a Resource Server validating Keycloak JWTs and mapping realm roles to authorities',
  ],
  theory: [
    {
      heading: '1. The Problem OAuth2 Solves',
      content: 'Earlier you wrote your own /login that checks the password and issues a JWT. In a company with 15 apps (HR portal, payroll, CRM, mobile app) each app would store passwords and implement login, MFA, forgot password, account lock... OAuth2 moves all of this to ONE Authorization Server. Apps never see the user password; they receive tokens. Analogy: a hotel key card. Reception (authorization server) checks your ID once and gives a key card (access token) that opens only your room (scope) until checkout (expiry). The room door (resource server) only checks the card, not your Aadhaar.',
      points: [
        'Resource Owner: the user who owns the data',
        'Client: the application that wants access (React app, mobile app, Spring MVC app)',
        'Authorization Server: issues tokens (Keycloak, Okta, Auth0, Google, Azure AD/Entra ID, Spring Authorization Server)',
        'Resource Server: the API that holds data and accepts access tokens (your Spring Boot REST API)',
      ],
    },
    {
      heading: '2. OAuth2 Grant Types (Flows)',
      content: 'A flow is the way a client obtains a token. Choose based on who the client is.',
      points: [
        'Authorization Code + PKCE: user is redirected to the login page of the auth server, logs in, comes back with a short-lived "code", the client exchanges the code for tokens. Used for web apps, SPAs (React) and mobile apps. PKCE (code_verifier/code_challenge) stops stolen codes from being used',
        'Client Credentials: no user; service-to-service (order-service calls payment-service with its own client id/secret)',
        'Refresh Token: get a new access token without asking the user to log in again',
        'Device Code: smart TV / CLI shows a code, you approve on your phone',
        'Deprecated (OAuth 2.1): Implicit flow and Resource Owner Password Credentials (app collects the password) — do not use in new projects',
      ],
      syntax: `Authorization Code flow (simplified)
Browser -> App          : click "Login"
App -> Browser          : 302 to https://auth/authorize?response_type=code&client_id=..&redirect_uri=..&scope=openid profile&state=xyz&code_challenge=..
User logs in at auth server
Auth -> Browser         : 302 to https://app/callback?code=abc123&state=xyz
App -> Auth (backend)   : POST /token code=abc123 + client_secret/code_verifier
Auth -> App             : { access_token, refresh_token, id_token, expires_in }
App -> API              : GET /api/orders  Authorization: Bearer <access_token>`,
    },
    {
      heading: '3. Tokens: Access, Refresh and ID Token',
      content: 'ACCESS TOKEN: proof of permission sent to APIs in the Authorization: Bearer header. Short life (5-15 minutes). Usually a signed JWT containing iss (issuer), sub (user id), aud, exp, scope and roles. REFRESH TOKEN: long-lived (hours/days), sent ONLY to the authorization server to get new access tokens; must be stored securely and can be revoked. ID TOKEN: comes from OpenID Connect, is ALWAYS a JWT, and tells the CLIENT who the user is (name, email). Never send the ID token to an API as an access token.',
      points: [
        'Resource server validates the JWT signature using public keys from the issuer JWKS endpoint (.../protocol/openid-connect/certs in Keycloak)',
        'Because validation is local (no DB call), it is fast and scales well',
        'Logout/revocation is hard with JWT: keep access tokens short-lived',
        'Scopes (read:orders) are permissions the client asked for; roles (ADMIN) are what the user has',
      ],
    },
    {
      heading: '4. OpenID Connect (OIDC)',
      content: 'OAuth2 is about AUTHORIZATION (what can this app do). It does not define how to know WHO the user is. OpenID Connect is a thin identity layer on top of OAuth2: the client adds scope "openid", receives an ID token, and can call the /userinfo endpoint. OIDC also defines discovery: https://issuer/.well-known/openid-configuration lists all endpoints, so Spring Boot needs only the issuer-uri. "Login with Google" is OIDC.',
      tip: 'Interview one-liner: OAuth2 = valet key for your car (what it can do); OIDC = valet key + driving licence copy (who you are).',
    },
    {
      heading: '5. Spring Security Modules for OAuth2',
      content: 'Spring Boot has three different starters; choosing the right one is half the work.',
      points: [
        'spring-boot-starter-oauth2-client: your app is a CLIENT that logs users in (server-rendered MVC/Thymeleaf app, or a BFF for React). Configure spring.security.oauth2.client.registration.*',
        'spring-boot-starter-oauth2-resource-server: your app is an API that ACCEPTS bearer tokens. Configure spring.security.oauth2.resourceserver.jwt.issuer-uri',
        'spring-boot-starter-oauth2-authorization-server: your app ISSUES tokens (build your own auth server). Most companies use Keycloak/Okta instead',
        'In SecurityFilterChain: .oauth2Login() for client, .oauth2ResourceServer(o -> o.jwt(...)) for API',
      ],
    },
    {
      heading: '6. Keycloak Basics',
      content: 'Keycloak is a free, open-source identity and access management server (by Red Hat, now a CNCF project). Main concepts: REALM (an isolated tenant, e.g., "shopkart"), CLIENT (an app registered in the realm, e.g., "shop-frontend" public client, "shop-api" bearer-only/backend), USER, ROLES (realm roles like ADMIN, USER, or client roles), GROUPS and IDENTITY PROVIDERS (Google, GitHub, LDAP/Active Directory). It gives you login pages, registration, forgot password, MFA/OTP and admin console out of the box.',
      points: [
        'Issuer URL format: http://localhost:8180/realms/shopkart',
        'Realm roles appear in the JWT under realm_access.roles, client roles under resource_access.<client>.roles',
        'Spring does NOT read Keycloak roles automatically; write a JwtAuthenticationConverter',
        'Never use the master realm for your apps; create your own realm',
      ],
    },
  ],
  examples: [
    {
      title: 'Example 1: "Login with Google" in a Spring Boot Web App',
      scenario: 'Add Google sign-in to a Spring Boot app and show the logged-in user name, email and picture.',
      steps: [
        'Go to Google Cloud Console > APIs & Services > Credentials > Create Credentials > OAuth client ID (configure the consent screen first: External, app name, support email)',
        'Application type: Web application. Authorized redirect URI: http://localhost:8080/login/oauth2/code/google',
        'Copy Client ID and Client Secret; set them as environment variables GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (IntelliJ: Run > Edit Configurations > Environment variables; Eclipse STS: Run Configurations > Environment tab)',
        'start.spring.io: Spring Web + OAuth2 Client + Spring Security; add the files below',
        'Run and open http://localhost:8080 — you are redirected to Google, log in, and come back to /me',
      ],
      code: `<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>

# application.yml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: \${GOOGLE_CLIENT_ID}
            client-secret: \${GOOGLE_CLIENT_SECRET}
            scope: openid, profile, email

// SecurityConfig.java
package com.demo.oauth;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/public/**").permitAll()
                .anyRequest().authenticated())
            .oauth2Login(o -> o.defaultSuccessUrl("/me", true))
            .logout(l -> l.logoutSuccessUrl("/"));
        return http.build();
    }
}

// ProfileController.java
package com.demo.oauth;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
public class ProfileController {

    @GetMapping("/")
    public String home() {
        return "<a href='/oauth2/authorization/google'>Login with Google</a>";
    }

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal OidcUser user) {
        return Map.of(
            "name", user.getFullName(),
            "email", user.getEmail(),
            "picture", user.getPicture(),
            "googleId", user.getSubject(),
            "idTokenExpires", user.getIdToken().getExpiresAt().toString());
    }
}`,
      result: `Browser flow:
http://localhost:8080  -> click "Login with Google"
-> 302 https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=...&scope=openid%20profile%20email&state=...&redirect_uri=http://localhost:8080/login/oauth2/code/google&nonce=...
-> Google login + consent
-> 302 http://localhost:8080/login/oauth2/code/google?code=4/0Ad...&state=...
-> 302 /me

GET /me
{"name":"Priya Sharma","email":"priya.sharma@gmail.com","picture":"https://lh3.googleusercontent.com/a/...",
 "googleId":"10987654321098765432","idTokenExpires":"2026-11-18T11:42:10Z"}`,
      explanation: 'Spring Boot already knows Google endpoints (CommonOAuth2Provider), so only client id/secret are needed. The link /oauth2/authorization/google starts the Authorization Code flow; Spring handles the redirect, state check, code-for-token exchange, ID-token validation and creates an OidcUser in the session. The redirect URI must match EXACTLY what you registered in Google Console, otherwise you see "Error 400: redirect_uri_mismatch". Keep secrets out of Git by using environment variables.',
    },
    {
      title: 'Example 2: Run Keycloak and Create Realm, Client, Roles and Users',
      scenario: 'Prepare a Keycloak server for a "shopkart" system with ADMIN and USER roles.',
      steps: [
        'Run: docker run -d --name keycloak -p 8180:8080 -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:26.0 start-dev',
        'Open http://localhost:8180 > Administration Console > log in as admin/admin',
        'Top-left realm dropdown > Create realm > Realm name: shopkart > Create',
        'Clients > Create client > Client ID: shop-postman > Next > Client authentication ON, Standard flow ON, Direct access grants ON (only for local testing) > Valid redirect URIs: https://oauth.pstmn.io/v1/callback > Save. Copy the secret from the Credentials tab',
        'Realm roles > Create role: ADMIN, then USER',
        'Users > Add user: ravi (email ravi@shop.com, Email verified ON) > Create > Credentials > Set password ravi123, Temporary OFF > Role mapping > Assign role USER',
        'Add user anita with password anita123 and roles USER and ADMIN',
        'Get a token with curl (below) and paste the access_token in https://jwt.io to read the claims',
      ],
      code: `# Discovery document (all endpoints)
curl http://localhost:8180/realms/shopkart/.well-known/openid-configuration

# Get tokens (password grant ONLY for local learning; real apps use Authorization Code + PKCE)
curl -X POST http://localhost:8180/realms/shopkart/protocol/openid-connect/token \\
  -d grant_type=password \\
  -d client_id=shop-postman \\
  -d client_secret=PASTE_SECRET \\
  -d username=anita \\
  -d password=anita123 \\
  -d scope=openid

# Refresh the access token
curl -X POST http://localhost:8180/realms/shopkart/protocol/openid-connect/token \\
  -d grant_type=refresh_token \\
  -d client_id=shop-postman \\
  -d client_secret=PASTE_SECRET \\
  -d refresh_token=PASTE_REFRESH_TOKEN

# Docker Compose version (keeps data in a volume)
services:
  keycloak:
    image: quay.io/keycloak/keycloak:26.0
    command: start-dev
    environment:
      KC_BOOTSTRAP_ADMIN_USERNAME: admin
      KC_BOOTSTRAP_ADMIN_PASSWORD: admin
    ports:
      - "8180:8080"
    volumes:
      - keycloak-data:/opt/keycloak/data
volumes:
  keycloak-data:`,
      result: `Token response:
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6Ij...",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik...",
  "scope": "openid profile email"
}

Decoded access_token payload (jwt.io):
{
  "exp": 1763465000, "iat": 1763464700,
  "iss": "http://localhost:8180/realms/shopkart",
  "sub": "5c1f9b2e-...",
  "azp": "shop-postman",
  "realm_access": { "roles": ["ADMIN", "USER", "offline_access", "default-roles-shopkart", "uma_authorization"] },
  "preferred_username": "anita",
  "email": "anita@shop.com"
}`,
      explanation: 'expires_in 300 means the access token lives 5 minutes (Keycloak default); the refresh token lasts 30 minutes for the SSO session. The access token is signed with RS256 by the realm private key; anyone can verify it using the public keys from the certs endpoint. Notice roles are inside realm_access.roles, which Spring will not understand until we map them (Example 3). KC_BOOTSTRAP_ADMIN_* variables are for Keycloak 26+; older versions used KEYCLOAK_ADMIN and KEYCLOAK_ADMIN_PASSWORD.',
    },
    {
      title: 'Example 3: Protect a REST API as an OAuth2 Resource Server with Keycloak Roles',
      scenario: 'product-api must accept only Keycloak-issued tokens: GET products for USER, DELETE only for ADMIN.',
      steps: [
        'start.spring.io: Spring Web + OAuth2 Resource Server; add the config below',
        'Set issuer-uri to the Keycloak realm; run the API on port 8080 (Keycloak is on 8180)',
        'Create KeycloakRoleConverter and SecurityConfig',
        'In Postman: Authorization tab > Type OAuth 2.0 > Grant type Authorization Code (With PKCE) > Auth URL / Token URL from the discovery document > Client ID shop-postman + secret > Get New Access Token > Use Token',
        'Call GET and DELETE as ravi (USER) and anita (ADMIN) and compare responses',
      ],
      code: `<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>

# application.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8180/realms/shopkart

// KeycloakRoleConverter.java
package com.shop.api.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.*;

public class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    @Override
    @SuppressWarnings("unchecked")
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null || realmAccess.get("roles") == null) {
            return List.of();
        }
        List<String> roles = (List<String>) realmAccess.get("roles");
        List<GrantedAuthority> result = new ArrayList<>();
        for (String r : roles) {
            result.add(new SimpleGrantedAuthority("ROLE_" + r));   // ADMIN -> ROLE_ADMIN
        }
        return result;
    }
}

// SecurityConfig.java
package com.shop.api.security;

import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new KeycloakRoleConverter());
        converter.setPrincipalClaimName("preferred_username");

        http
            .csrf(c -> c.disable())                       // stateless API with bearer tokens
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                .requestMatchers("/api/**").hasAnyRole("USER", "ADMIN")
                .anyRequest().authenticated())
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(converter)));
        return http.build();
    }
}

// ProductController.java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @GetMapping
    public List<String> all(Authentication auth) {
        return List.of("Laptop", "Mouse", "Keyboard (viewed by " + auth.getName() + ")");
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        return "Product " + id + " deleted";
    }

    @GetMapping("/whoami")
    public Map<String, Object> whoami(@AuthenticationPrincipal Jwt jwt) {
        return Map.of("user", jwt.getClaimAsString("preferred_username"),
                      "email", jwt.getClaimAsString("email"),
                      "expiresAt", jwt.getExpiresAt().toString());
    }
}`,
      result: `No token:
GET /api/products -> 401 Unauthorized
WWW-Authenticate: Bearer

Token of ravi (USER):
GET    /api/products      -> 200 ["Laptop","Mouse","Keyboard (viewed by ravi)"]
DELETE /api/products/5    -> 403 Forbidden
WWW-Authenticate: Bearer error="insufficient_scope", ...

Token of anita (ADMIN, USER):
DELETE /api/products/5    -> 200 "Product 5 deleted"

Expired token (after 5 min):
GET /api/products -> 401
WWW-Authenticate: Bearer error="invalid_token", error_description="An error occurred while attempting to decode the Jwt: Jwt expired at 2026-11-18T10:23:20Z", ...`,
      explanation: 'With issuer-uri, Spring downloads the discovery document at startup, finds the JWKS URL and validates signature, issuer and expiry of every token — no database lookup. Our converter turns realm_access.roles into ROLE_ authorities so hasRole("ADMIN") works. 401 means "who are you?" (no/invalid token); 403 means "I know you, but you are not allowed". Note: the API must be able to reach the issuer URL; inside Docker, use the same hostname in tokens and config (issuer mismatch is a very common error).',
    },
    {
      title: 'Example 4: Service-to-Service Call with Client Credentials',
      scenario: 'order-service (no user involved) calls product-api using its own Keycloak client and an automatically refreshed token.',
      steps: [
        'In Keycloak create client "order-service": Client authentication ON, Standard flow OFF, Service accounts roles ON; in Service account roles tab assign realm role USER',
        'In order-service add spring-boot-starter-oauth2-client and spring-boot-starter-web',
        'Configure a registration with authorization-grant-type client_credentials',
        'Create a RestClient with OAuth2ClientHttpRequestInterceptor (Spring Security 6.4+) that attaches the token',
        'Call order-service endpoint and check product-api receives a valid bearer token',
      ],
      code: `# order-service application.yml
spring:
  security:
    oauth2:
      client:
        registration:
          keycloak-orders:
            provider: keycloak
            client-id: order-service
            client-secret: \${ORDER_CLIENT_SECRET}
            authorization-grant-type: client_credentials
        provider:
          keycloak:
            issuer-uri: http://localhost:8180/realms/shopkart

// RestClientConfig.java
@Configuration
public class RestClientConfig {
    @Bean
    RestClient productClient(RestClient.Builder builder, OAuth2AuthorizedClientManager manager) {
        var interceptor = new OAuth2ClientHttpRequestInterceptor(manager);
        interceptor.setClientRegistrationIdResolver(request -> "keycloak-orders");
        return builder.baseUrl("http://localhost:8080")
                      .requestInterceptor(interceptor)
                      .build();
    }
}

// OrderController.java
@RestController
public class OrderController {
    private final RestClient productClient;
    public OrderController(RestClient productClient) { this.productClient = productClient; }

    @GetMapping("/orders/products")
    public String products() {
        return productClient.get().uri("/api/products").retrieve().body(String.class);
    }
}

// The security config of order-service can permit /orders/** for this demo.`,
      result: `GET http://localhost:8081/orders/products
-> ["Laptop","Mouse","Keyboard (viewed by service-account-order-service)"]

Behind the scenes (first call only, token cached until it expires):
POST http://localhost:8180/realms/shopkart/protocol/openid-connect/token
grant_type=client_credentials&client_id=order-service&client_secret=****
-> {"access_token":"eyJ...","expires_in":300,"token_type":"Bearer"}  (no refresh_token)`,
      explanation: 'Client credentials represents the application itself, so the username becomes service-account-order-service. The OAuth2AuthorizedClientManager (auto-configured by Spring Boot for servlet apps) caches the token and fetches a new one when it expires — you never handle tokens manually. If you are on an older Spring Security version without OAuth2ClientHttpRequestInterceptor, write a ClientHttpRequestInterceptor that calls manager.authorize(...) and sets the Authorization header.',
    },
  ],
  interview: [
    { q: 'What is OAuth2?', a: 'An authorization framework (RFC 6749) that lets a client application obtain limited access to a resource on behalf of a user (or itself) by using tokens issued by an authorization server, without sharing the user password with the client.', level: 'Easy' },
    { q: 'Name the four roles in OAuth2.', a: 'Resource Owner (user), Client (app), Authorization Server (issues tokens), Resource Server (API that accepts tokens).', level: 'Easy' },
    { q: 'Which grant type should a React SPA or mobile app use?', a: 'Authorization Code with PKCE. Implicit flow and password grant are deprecated in OAuth 2.1. Many teams also use a Backend-for-Frontend (BFF) so tokens never reach the browser JavaScript.', level: 'Medium' },
    { q: 'Difference between OAuth2 and OpenID Connect?', a: 'OAuth2 handles authorization (access tokens for APIs). OIDC is an identity layer on top: with scope openid it returns an ID token (JWT) describing the authenticated user, a /userinfo endpoint and discovery metadata.', level: 'Easy' },
    { q: 'Access token vs refresh token vs ID token?', a: 'Access token: short-lived, sent to APIs. Refresh token: long-lived, sent only to the auth server to get new access tokens. ID token: JWT for the client describing the user; not for calling APIs.', level: 'Medium' },
    { q: 'How does a resource server validate a JWT without calling the auth server each time?', a: 'It downloads the public keys (JWKS) once from the issuer and verifies the signature locally, then checks iss, exp, nbf and optionally aud. Keys are cached and refreshed when a new kid appears.', level: 'Medium' },
    { q: 'What is PKCE?', a: 'Proof Key for Code Exchange: the client creates a random code_verifier, sends its SHA-256 hash (code_challenge) in the authorize request and the original verifier in the token request. A stolen authorization code is useless without the verifier.', level: 'Hard' },
    { q: 'Why does hasRole("ADMIN") fail with Keycloak tokens by default?', a: 'Spring maps only the "scope"/"scp" claim to SCOPE_ authorities. Keycloak puts roles in realm_access.roles, so you need a custom JwtAuthenticationConverter that creates ROLE_ADMIN authorities.', level: 'Hard' },
    { q: 'When do you use the client credentials grant?', a: 'For machine-to-machine communication where no user is involved, e.g., a batch job or microservice calling another API. The client authenticates with its own id and secret (or private key JWT).', level: 'Medium' },
    { q: 'What is Keycloak realm?', a: 'An isolated space that manages its own users, clients, roles, identity providers and settings. Tokens are issued per realm with issuer http://host/realms/<realm>.', level: 'Easy' },
    { q: '401 vs 403 in an OAuth2-protected API?', a: '401 Unauthorized: token missing, malformed, expired or invalid signature. 403 Forbidden: token valid but the user lacks the required role/scope.', level: 'Easy' },
    { q: 'What is the "state" parameter and the "nonce" in OIDC?', a: 'state is a random value sent and returned in the redirect to prevent CSRF on the callback. nonce is placed in the ID token to bind it to the original request and prevent replay. Spring Security generates and checks both.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add "Login with GitHub" next to Google in the Example 1 app.',
      hint: 'Register an OAuth App in GitHub Developer settings with callback /login/oauth2/code/github. GitHub is OAuth2, not OIDC, so the principal is OAuth2User.',
      solution: `# application.yml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: \${GOOGLE_CLIENT_ID}
            client-secret: \${GOOGLE_CLIENT_SECRET}
            scope: openid, profile, email
          github:
            client-id: \${GITHUB_CLIENT_ID}
            client-secret: \${GITHUB_CLIENT_SECRET}
            scope: read:user, user:email

// Controller
@GetMapping("/")
public String home() {
    return "<a href='/oauth2/authorization/google'>Google</a> | "
         + "<a href='/oauth2/authorization/github'>GitHub</a>";
}

@GetMapping("/me")
public Map<String, Object> me(@AuthenticationPrincipal OAuth2User user) {
    // works for both: OidcUser extends OAuth2User
    Object name = user.getAttribute("name");
    Object login = user.getAttribute("login");     // GitHub username (null for Google)
    return Map.of("name", String.valueOf(name), "login", String.valueOf(login));
}`,
    },
    {
      task: 'Write a JUnit/MockMvc test proving that USER gets 403 and ADMIN gets 200 on DELETE /api/products/1, without a running Keycloak.',
      hint: 'spring-security-test provides jwt() request post-processor.',
      solution: `<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.security</groupId>
  <artifactId>spring-security-test</artifactId>
  <scope>test</scope>
</dependency>

@WebMvcTest(ProductController.class)
@Import(SecurityConfig.class)
class ProductSecurityTest {

    @Autowired MockMvc mvc;
    @MockBean JwtDecoder jwtDecoder;   // avoid contacting the issuer (@MockitoBean in Boot 3.4+)

    @Test
    void userCannotDelete() throws Exception {
        mvc.perform(delete("/api/products/1")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
           .andExpect(status().isForbidden());
    }

    @Test
    void adminCanDelete() throws Exception {
        mvc.perform(delete("/api/products/1")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
           .andExpect(status().isOk())
           .andExpect(content().string("Product 1 deleted"));
    }

    @Test
    void noTokenIs401() throws Exception {
        mvc.perform(get("/api/products")).andExpect(status().isUnauthorized());
    }
}`,
    },
    {
      task: 'Use method-level security: only the owner (same username) or an ADMIN can view /api/orders/{username}.',
      hint: '@PreAuthorize with SpEL: #username == authentication.name or hasRole(...).',
      solution: `@RestController
@RequestMapping("/api/orders")
public class OrderQueryController {

    @GetMapping("/{username}")
    @PreAuthorize("#username == authentication.name or hasRole('ADMIN')")
    public List<String> ordersOf(@PathVariable String username) {
        return List.of("ORD-1001 for " + username, "ORD-1002 for " + username);
    }
}
// Requires @EnableMethodSecurity (already on SecurityConfig) and
// converter.setPrincipalClaimName("preferred_username") so authentication.name = "ravi".
// ravi -> /api/orders/ravi  200,  /api/orders/anita 403
// anita (ADMIN) -> both 200`,
    },
    {
      task: 'Configure Postman to get a Keycloak token using Authorization Code with PKCE and reuse it in a collection.',
      hint: 'Collection > Authorization tab; use {{variables}} from an environment.',
      solution: `Environment "keycloak-local":
  kc_base   = http://localhost:8180/realms/shopkart/protocol/openid-connect
  client_id = shop-postman
  client_secret = (secret from Keycloak Credentials tab)

Collection "Shop API" > Authorization tab:
  Type: OAuth 2.0
  Add auth data to: Request Headers
  Grant type: Authorization Code (With PKCE)
  Callback URL: https://oauth.pstmn.io/v1/callback   (tick "Authorize using browser")
  Auth URL:     {{kc_base}}/auth
  Access Token URL: {{kc_base}}/token
  Client ID: {{client_id}}     Client Secret: {{client_secret}}
  Code Challenge Method: SHA-256
  Scope: openid
  -> Get New Access Token -> browser opens Keycloak login -> Use Token

Every request in the collection: Authorization = Inherit auth from parent.
Postman can auto-refresh: enable "Auto-refresh token".`,
    },
  ],
  quiz: [
    {
      question: 'Which OAuth2 flow is recommended for a React single-page application?',
      options: ['Implicit', 'Resource Owner Password', 'Authorization Code with PKCE', 'Client Credentials'],
      answer: 2,
      explanation: 'OAuth 2.1 removes Implicit and Password; SPAs use Authorization Code + PKCE.',
    },
    {
      question: 'Which token tells the client WHO the user is?',
      options: ['ID token', 'Access token', 'Refresh token', 'CSRF token'],
      answer: 0,
      explanation: 'The OIDC ID token carries identity claims for the client.',
    },
    {
      question: 'Which Spring Boot starter is used for an API that only validates bearer tokens?',
      options: ['spring-boot-starter-oauth2-client', 'spring-boot-starter-oauth2-authorization-server', 'spring-boot-starter-security-jwt', 'spring-boot-starter-oauth2-resource-server'],
      answer: 3,
      explanation: 'Resource server + spring.security.oauth2.resourceserver.jwt.issuer-uri.',
    },
    {
      question: 'Where does Keycloak place realm roles inside the access token?',
      options: ['scope', 'realm_access.roles', 'authorities', 'groups'],
      answer: 1,
      explanation: 'realm_access.roles; client roles are under resource_access.<clientId>.roles.',
    },
    {
      question: 'A valid token of a USER calls an ADMIN-only endpoint. The response is:',
      options: ['401 Unauthorized', '400 Bad Request', '403 Forbidden', '404 Not Found'],
      answer: 2,
      explanation: 'Authenticated but not authorized -> 403.',
    },
  ],
};
