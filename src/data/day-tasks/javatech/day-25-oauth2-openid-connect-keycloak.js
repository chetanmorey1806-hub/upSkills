export default {
  lesson: 'day-25-oauth2-openid-connect-keycloak',
  minutes: 24,
  intro: 'Understand OAuth2 roles, flows and tokens, OpenID Connect, and protect a Spring Boot API as a Keycloak resource server.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'A user clicks "Login with Google" on your Spring Boot app. In OAuth2 terms, what is your Spring Boot app?',
      options: ['The resource owner', 'The client', 'The authorization server', 'The browser'],
      answer: 1,
      explain: 'Resource owner = the **user**. Client = **your app** asking for access. Authorization server = **Google/Keycloak** (logs the user in, issues tokens). Resource server = the API that accepts the access token.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which flow choices are correct today? (choose all that apply)',
      options: [
        'React SPA or mobile app → Authorization Code flow with PKCE',
        'Server-side web app (Spring MVC + Thymeleaf) → Authorization Code flow',
        'Nightly batch service calling another service, no user → Client Credentials',
        'New apps → Implicit flow or Resource Owner Password flow',
      ],
      answers: [0, 1, 2],
      explain: 'Authorization Code (+ **PKCE** for public clients) is the standard for users; **Client Credentials** is machine-to-machine. Implicit and Password grants are deprecated in OAuth 2.1 because they expose tokens or passwords.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about tokens are TRUE? (choose all that apply)',
      options: [
        'The access token is sent to the API in the Authorization: Bearer header',
        'The ID token (OpenID Connect) tells the client who logged in (sub, name, email)',
        'The refresh token is used to get a new access token without logging in again',
        'An ID token should be sent to every API as the access token',
        'OpenID Connect = OAuth2 + an identity layer (ID token, userinfo endpoint, "openid" scope)',
      ],
      answers: [0, 1, 2, 4],
      explain: 'OAuth2 is about **authorization** (access tokens); OIDC adds **authentication** with the ID token. APIs should accept access tokens, not ID tokens.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Keycloak runs on `http://localhost:8080` with a realm called `college`. Complete the resource-server property:\n```\nspring.security.oauth2.resourceserver.jwt.issuer-uri=???\n```',
      example: { title: 'the security chain', code: 'http.oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()));' },
      accept: ['http://localhost:8080/realms/college'],
      explain: 'Keycloak (17+) issuer URLs are `http://host:port/realms/<realm>`. Spring downloads the public keys from the issuer\'s metadata and verifies every JWT signature, `iss` and `exp` - no shared secret in your API.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A Keycloak access token contains the claim below. Your converter maps realm roles to authorities. What does the program print? (one line per println)',
      example: { title: 'why a converter?', text: 'By default Spring maps the "scope" claim to SCOPE_xxx authorities. Keycloak roles live in realm_access.roles, so you convert them yourself.' },
      code: `// token claim
"realm_access": { "roles": ["admin", "teacher"] }

Map<String, Object> realm = jwt.getClaim("realm_access");
List<String> roles = (List<String>) realm.get("roles");
List<String> authorities = roles.stream()
        .map(r -> "ROLE_" + r.toUpperCase())
        .toList();
System.out.println(authorities);
System.out.println(authorities.contains("ROLE_ADMIN"));
System.out.println(authorities.contains("ROLE_STUDENT"));`,
      expected: '[ROLE_ADMIN, ROLE_TEACHER]\ntrue\nfalse',
      explain: 'Each role gets the `ROLE_` prefix and upper case, so `hasRole("ADMIN")` and `hasRole("TEACHER")` now work on endpoints. The user has no student role, so `hasRole("STUDENT")` would give 403.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why use Keycloak (or another identity provider) instead of your home-made JWT login from the Spring Boot course?',
      options: [
        'Keycloak makes the API run faster',
        'It centralises login for many apps (SSO), and provides MFA, social login, password policies and token management without writing that security code yourself',
        'Keycloak removes the need for HTTPS',
        'Home-made JWT cannot be signed',
      ],
      answer: 1,
      explain: 'An identity provider handles the hard, risky parts of authentication for all your apps (single sign-on, MFA, user federation, token revocation). Your services just validate tokens as resource servers.',
    },
  ],
};
