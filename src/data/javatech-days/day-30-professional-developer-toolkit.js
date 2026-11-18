export default {
  id: 'day-30-professional-developer-toolkit',
  title: 'Professional Developer Toolkit: Debugging, Code Quality, Code Reviews, Postman, API Docs and Agile/Jira',
  module: 'Module 7: DevOps, Cloud & Professional Tools',
  day: 30,
  level: 'Intermediate',
  duration: '3.5 hours',
  summary: 'Learn the daily tools and habits that make a fresher productive from week one in an IT company: debugging in IntelliJ (breakpoints, watches, evaluate expression, conditional breakpoints, remote debug), code quality with SonarLint/SonarQube, the pull-request code review process, Postman collections/environments/tests, API documentation with OpenAPI, and how Agile Scrum teams work with Jira.',
  objectives: [
    'Debug Java programs in IntelliJ IDEA (and Eclipse) using breakpoints, stepping, watches, evaluate expression and conditional breakpoints',
    'Find and fix bugs, code smells and vulnerabilities with SonarLint in the IDE and SonarQube in CI',
    'Create good pull requests and give/receive code review comments professionally',
    'Organize API testing with Postman collections, environments, variables, test scripts and Newman',
    'Document APIs with OpenAPI/springdoc and explain the Scrum process and Jira workflow used in Indian IT companies',
  ],
  theory: [
    {
      heading: '1. Debugging Like a Professional (IntelliJ IDEA and Eclipse)',
      content: 'Printing System.out.println everywhere is slow and you must remove it later. A DEBUGGER pauses the running program at a line (BREAKPOINT) so you can see every variable value and execute line by line. Analogy: watching a cricket replay frame by frame to find the exact ball where the batsman got out. Start the app with Debug (the bug icon, Shift+F9 in IntelliJ; Eclipse: Debug As > Java Application) instead of Run.',
      points: [
        'Breakpoint: click the left gutter next to the line number (red dot). Eclipse: double-click the left margin',
        'Step Over (F8 IntelliJ / F6 Eclipse): run the current line, do not go inside methods',
        'Step Into (F7 / F5): go inside the method called on this line; Smart Step Into (Shift+F7) chooses which call',
        'Step Out (Shift+F8 / F7 Eclipse): finish the current method and return to the caller',
        'Resume (F9 / F8 Eclipse): run until the next breakpoint; Run to Cursor (Alt+F9)',
        'Variables pane shows locals and fields; Watches pane keeps an expression (e.g., total / marks.length) visible while stepping',
        'Evaluate Expression (Alt+F8): run any Java expression in the paused context, e.g., list.stream().filter(x -> x > 50).count()',
        'Conditional breakpoint: right-click the red dot > Condition: orderId == 105 — pauses only for that case (great for loops)',
        'Exception breakpoint: Run > View Breakpoints (Ctrl+Shift+F8) > + > Java Exception Breakpoint > NullPointerException — pauses exactly where it is thrown',
        'Frames pane = call stack; Drop Frame / Reset Frame re-runs the current method; Set Value (F2) changes a variable while paused',
        'Remote debug: start the JVM with -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005 and attach with a "Remote JVM Debug" configuration',
      ],
    },
    {
      heading: '2. Code Quality: SonarLint and SonarQube',
      content: 'SonarLint (now also called SonarQube for IDE) is a free IDE plugin (IntelliJ, Eclipse, VS Code) that underlines problems AS YOU TYPE, like a spell-checker for code. SonarQube is the server version run by the CI pipeline for the whole project, with history, dashboards and Quality Gates (Day 28). In "Connected Mode" SonarLint uses the same rules as your company SonarQube server, so you fix issues before pushing.',
      points: [
        'Bug: code that is likely wrong (possible NullPointerException, resource not closed, == on strings)',
        'Vulnerability: security risk (SQL built with string concatenation, hard-coded password, weak crypto)',
        'Security Hotspot: code that needs human review (CORS allow all, disabled CSRF)',
        'Code Smell: maintainability issue (method too long, magic numbers, unused imports, duplicated code, high cognitive complexity)',
        'Severity: Blocker, Critical, Major, Minor, Info. Fix Blocker/Critical first',
        'Install: IntelliJ Settings > Plugins > Marketplace > "SonarQube for IDE"/"SonarLint" > Install; Eclipse: Help > Eclipse Marketplace > SonarLint',
      ],
      tip: 'Also use IntelliJ built-in tools: Code > Inspect Code, Code > Reformat Code (Ctrl+Alt+L), Optimize Imports (Ctrl+Alt+O), and Refactor > Rename (Shift+F6) / Extract Method (Ctrl+Alt+M).',
    },
    {
      heading: '3. Git Workflow and Code Reviews',
      content: 'In companies you never push directly to main. You create a feature branch named after the Jira ticket (feature/SHOP-142-add-coupon), commit small logical changes, push, and open a PULL REQUEST (GitHub/Bitbucket) or MERGE REQUEST (GitLab). The CI pipeline runs, and one or two teammates REVIEW the code before it is merged. Code review catches bugs early, spreads knowledge and keeps the codebase consistent.',
      points: [
        'Good commit message: "SHOP-142: Add coupon validation for minimum order amount" — ticket id + what and why, in present tense',
        'Small PRs (under ~400 lines) get faster and better reviews; write a description: what, why, how to test, screenshots',
        'Self-review your own diff before asking others; remove debug prints and commented code',
        'Reviewer checklist: correctness and edge cases, naming and readability, tests added, exceptions handled, security (input validation, no secrets), performance (N+1 queries, loops calling DB), follows project conventions',
        'Comment on code, not the person: "Can we extract this into a method?" instead of "This is bad"',
        'Label comments: nit (minor style), suggestion, question, must-fix/blocker',
        'Reply to every comment, push fixes as new commits, then re-request review; resolve conversations only when agreed',
      ],
    },
    {
      heading: '4. Postman: Collections, Environments, Variables and Tests',
      content: 'Postman is the most used tool for testing REST APIs. A COLLECTION groups related requests in folders (Auth, Products, Orders) and can be exported as JSON and shared with the team (or synced in a team workspace). An ENVIRONMENT is a set of variables per server (Local, DEV, QA, PROD) such as baseUrl and token; switch environments from the top-right dropdown and the same requests hit a different server. Variables are written as {{baseUrl}}. Scripts written in JavaScript run before (Pre-request) or after (Post-response "Tests") a request.',
      points: [
        'Variable scopes (narrow wins): local > data > environment > collection > global',
        'Use Initial value for shareable defaults and Current value for your secrets (current values are not synced)',
        'Tests: pm.test("Status is 200", () => pm.response.to.have.status(200));',
        'Chain requests: save the JWT from the login response into an environment variable and use Bearer {{token}} in the collection Authorization',
        'Collection Runner runs all requests in order, optionally with a CSV/JSON data file for many inputs',
        'Newman (npm install -g newman) runs collections from the command line or CI: newman run shop.postman_collection.json -e qa.postman_environment.json',
        'Postman can import an OpenAPI file and create a collection automatically',
      ],
    },
    {
      heading: '5. API Documentation with OpenAPI',
      content: 'Frontend developers, testers and partner companies need to know your endpoints, request bodies, response codes and error formats. OpenAPI (formerly Swagger) is the standard YAML/JSON format for describing REST APIs. In Spring Boot, springdoc-openapi generates it automatically from your controllers at /v3/api-docs and shows an interactive Swagger UI at /swagger-ui.html. Annotations like @Operation, @ApiResponse, @Parameter and @Schema add descriptions and examples. Good documentation also includes a README (how to run), error code list, authentication steps and a changelog.',
      points: [
        'Code-first: generate docs from code (springdoc). Design-first: write openapi.yaml first, review with the team, then generate code (openapi-generator)',
        'Document every status code: 200, 201, 400 validation errors, 401, 403, 404, 409, 500',
        'Version APIs (/api/v1/...) and never break existing clients without notice',
        'Disable Swagger UI in production if the API is private: springdoc.swagger-ui.enabled=false',
      ],
    },
    {
      heading: '6. Agile, Scrum and Jira in IT Companies',
      content: 'Most Indian IT companies (service and product) follow AGILE: deliver working software in small increments and adapt to feedback, instead of one big release after a year (Waterfall). SCRUM is the most popular Agile framework. Work happens in SPRINTS of usually 2 weeks. Roles: PRODUCT OWNER (decides WHAT to build, owns the Product Backlog, talks to the client), SCRUM MASTER (removes blockers, protects the process), DEVELOPMENT TEAM (developers, testers — decides HOW). Ceremonies: Sprint Planning, Daily Stand-up (15 minutes), Sprint Review (demo to stakeholders), Sprint Retrospective (what went well, what to improve), and Backlog Refinement (grooming).',
      points: [
        'Jira issue types: Epic (big feature, e.g., Payments) > Story (user-visible requirement) > Sub-task; Bug; Task; Spike (research)',
        'User story format: "As a customer, I want to apply a coupon, so that I get a discount" + Acceptance Criteria (Given/When/Then)',
        'Story points (Fibonacci 1, 2, 3, 5, 8, 13) estimate effort/complexity, not hours; Planning Poker is used to agree',
        'Typical Jira workflow: To Do -> In Progress -> Code Review -> QA/Testing -> Done (sometimes Blocked, Reopened)',
        'Daily stand-up answers: What did I do yesterday? What will I do today? Any blockers?',
        'Definition of Done: code reviewed and merged, tests passing, Sonar gate green, deployed to QA, acceptance criteria verified, documentation updated',
        'Velocity = story points completed per sprint; burndown chart shows remaining work during the sprint',
        'Kanban (no fixed sprints, WIP limits) is common in support/maintenance projects',
      ],
      tip: 'Update your Jira ticket status yourself and log work/comments daily. Managers judge progress from Jira, not from what you say in the corridor.',
    },
  ],
  examples: [
    {
      title: 'Example 1: Find a Bug with Breakpoints, Watches and Evaluate Expression',
      scenario: 'A result program prints wrong averages. Debug it in IntelliJ to find two bugs, then run the fixed version.',
      steps: [
        'IntelliJ: File > New > Project > Java (JDK 17/21) > create class Main; Eclipse: File > New > Java Project, then New > Class > Main',
        'First paste the BUGGY version shown in the explanation and run it: Asha shows 50.00 instead of 76.33',
        'Click the gutter on the line "total += marks[i];" to add a breakpoint and start Debug (Shift+F9 / Eclipse: right-click > Debug As > Java Application)',
        'In the Variables pane observe i: it starts at 1, so marks[0] (78) is skipped — bug 1',
        'Add a Watch (+ in Watches pane): total / marks.length and also (double) total / marks.length — the first shows an int, bug 2 (integer division)',
        'Right-click the breakpoint > Condition: s == 2 on the line in main to pause only for Kiran; use Evaluate Expression (Alt+F8) to run grade(33.0)',
        'Fix both bugs (loop from 0, cast to double), stop the debugger and Run the fixed code below',
      ],
      code: `public class Main {

    static double average(int[] marks) {
        int total = 0;
        for (int i = 0; i < marks.length; i++) {      // FIX 1: start from 0
            total += marks[i];
        }
        return (double) total / marks.length;         // FIX 2: avoid integer division
    }

    static String grade(double avg) {
        if (avg >= 75) return "Distinction";
        else if (avg >= 60) return "First Class";
        else if (avg >= 35) return "Pass";
        return "Fail";
    }

    public static void main(String[] args) {
        int[][] students = { {78, 82, 69}, {55, 61, 58}, {30, 41, 28} };
        String[] names = {"Asha", "Ravi", "Kiran"};
        for (int s = 0; s < students.length; s++) {
            double avg = average(students[s]);
            System.out.printf("%s -> %.2f (%s)%n", names[s], avg, grade(avg));
        }
    }
}`,
      java: {
        files: {
          'Main.java': `public class Main {

    static double average(int[] marks) {
        int total = 0;
        for (int i = 0; i < marks.length; i++) {      // FIX 1: start from 0
            total += marks[i];
        }
        return (double) total / marks.length;         // FIX 2: avoid integer division
    }

    static String grade(double avg) {
        if (avg >= 75) return "Distinction";
        else if (avg >= 60) return "First Class";
        else if (avg >= 35) return "Pass";
        return "Fail";
    }

    public static void main(String[] args) {
        int[][] students = { {78, 82, 69}, {55, 61, 58}, {30, 41, 28} };
        String[] names = {"Asha", "Ravi", "Kiran"};
        for (int s = 0; s < students.length; s++) {
            double avg = average(students[s]);
            System.out.printf("%s -> %.2f (%s)%n", names[s], avg, grade(avg));
        }
    }
}`,
        },
      },
      result: `Asha -> 76.33 (Distinction)
Ravi -> 58.00 (Pass)
Kiran -> 33.00 (Fail)`,
      explanation: 'The buggy version had "for (int i = 1; ...)" and "return total / marks.length;". With it, Asha = (82 + 69) / 3 = 151 / 3 = 50 (int) -> "50.00 (Pass)", Ravi = (61 + 58) / 3 = 119 / 3 = 39 -> "39.00 (Pass)", Kiran = (41 + 28) / 3 = 69 / 3 = 23 -> "23.00 (Fail)". The debugger showed i = 1 on the first pause and the watch showed the int result. Fixed trace: Asha 78+82+69 = 229, 229/3.0 = 76.333... -> 76.33 Distinction; Ravi 174/3 = 58.00 -> Pass (below 60); Kiran 99/3 = 33.00 -> Fail (below 35).',
    },
    {
      title: 'Example 2: Act on SonarLint Findings and Code Review Comments (Refactoring)',
      scenario: 'A teammate\'s PR calculates membership discounts with String tiers and magic numbers. SonarLint and the reviewer raise issues; you refactor while keeping the same behaviour.',
      steps: [
        'Install SonarLint (IntelliJ: Settings > Plugins > search "SonarQube for IDE" / "SonarLint" > Install > restart)',
        'Open the "before" code (shown in the explanation): SonarLint underlines "==" on strings, the magic numbers 0.10, 0.15, 1000 and the nested if-else',
        'Open the SonarLint tool window (View > Tool Windows > SonarLint) > Current File to read each rule description and the "Why is this an issue?" text',
        'Apply refactorings: replace String tiers with an enum, extract constants (IntelliJ: select 0.10 > Refactor > Introduce Constant, Ctrl+Alt+C), use a switch expression',
        'Run the program to confirm the same results, commit as "SHOP-231: Refactor discount calculation (enum + constants)" and reply to review comments',
      ],
      code: `public class Main {

    enum Tier { SILVER, GOLD, PLATINUM }

    static final double GOLD_RATE = 0.10;
    static final double PLATINUM_RATE = 0.15;
    static final double MIN_ORDER_FOR_DISCOUNT = 1000.0;

    static double discount(Tier tier, double amount) {
        if (amount < MIN_ORDER_FOR_DISCOUNT) {
            return 0.0;
        }
        return switch (tier) {
            case SILVER -> 0.0;
            case GOLD -> amount * GOLD_RATE;
            case PLATINUM -> amount * PLATINUM_RATE;
        };
    }

    public static void main(String[] args) {
        System.out.printf("GOLD 2000 -> %.2f%n", discount(Tier.GOLD, 2000));
        System.out.printf("PLATINUM 1500 -> %.2f%n", discount(Tier.PLATINUM, 1500));
        System.out.printf("GOLD 999 -> %.2f%n", discount(Tier.GOLD, 999));
        System.out.printf("SILVER 5000 -> %.2f%n", discount(Tier.SILVER, 5000));
    }
}`,
      java: {
        files: {
          'Main.java': `public class Main {

    enum Tier { SILVER, GOLD, PLATINUM }

    static final double GOLD_RATE = 0.10;
    static final double PLATINUM_RATE = 0.15;
    static final double MIN_ORDER_FOR_DISCOUNT = 1000.0;

    static double discount(Tier tier, double amount) {
        if (amount < MIN_ORDER_FOR_DISCOUNT) {
            return 0.0;
        }
        return switch (tier) {
            case SILVER -> 0.0;
            case GOLD -> amount * GOLD_RATE;
            case PLATINUM -> amount * PLATINUM_RATE;
        };
    }

    public static void main(String[] args) {
        System.out.printf("GOLD 2000 -> %.2f%n", discount(Tier.GOLD, 2000));
        System.out.printf("PLATINUM 1500 -> %.2f%n", discount(Tier.PLATINUM, 1500));
        System.out.printf("GOLD 999 -> %.2f%n", discount(Tier.GOLD, 999));
        System.out.printf("SILVER 5000 -> %.2f%n", discount(Tier.SILVER, 5000));
    }
}`,
        },
      },
      result: `GOLD 2000 -> 200.00
PLATINUM 1500 -> 225.00
GOLD 999 -> 0.00
SILVER 5000 -> 0.00`,
      explanation: 'Before: static double discount(String tier, double amt) { if (amt >= 1000) { if (tier == "GOLD") return amt * 0.10; else if (tier == "PLATINUM") return amt * 0.15; } return 0; }. Review comments: (1) must-fix: comparing Strings with == checks references, not content — it may fail for values read from a request; use equals or, better, an enum. (2) suggestion: magic numbers -> named constants. (3) nit: guard clause for the minimum amount reduces nesting. The enum makes invalid tiers impossible, and the switch expression must cover all constants (the compiler checks it). Trace: 2000 x 0.10 = 200.00; 1500 x 0.15 = 225.00; 999 < 1000 -> 0.00; SILVER -> 0.00.',
    },
    {
      title: 'Example 3: Postman Collection with Environments, Token Chaining, Tests and Newman',
      scenario: 'Create a "ShopKart API" collection that logs in, saves the JWT automatically, tests responses, and runs against Local or QA servers — also from the command line.',
      steps: [
        'Postman > Environments > + > "Local": baseUrl = http://localhost:8080, username = ravi, password = ravi123 (put password in Current value only). Duplicate it as "QA" with baseUrl = https://qa-api.shopkart.in',
        'Collections > + > "ShopKart API" > Authorization tab: Type Bearer Token, Token = {{token}}',
        'Add folder "Auth" > request POST {{baseUrl}}/api/auth/login, Authorization: No Auth, Body raw JSON (below); in the Scripts > Post-response tab paste the login script',
        'Add folder "Products" > GET {{baseUrl}}/api/products (Authorization: Inherit auth from parent) with the tests script; POST {{baseUrl}}/api/products with body and tests',
        'Select environment "Local" (top-right) and click Send on login, then on products — the token is reused automatically',
        'Run all: right-click collection > Run collection > Run; or export collection and environment (… > Export) and run with Newman',
      ],
      code: `// ---- POST {{baseUrl}}/api/auth/login  Body (raw JSON) ----
{
  "username": "{{username}}",
  "password": "{{password}}"
}

// ---- Login: Post-response script ----
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
});
const body = pm.response.json();
pm.environment.set("token", body.token);
console.log("Token saved, length = " + body.token.length);

// ---- GET {{baseUrl}}/api/products : Post-response tests ----
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Response time below 800 ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(800);
});
pm.test("Every product has id, name and price", function () {
    const products = pm.response.json();
    pm.expect(products).to.be.an("array").that.is.not.empty;
    products.forEach(function (p) {
        pm.expect(p).to.have.property("id");
        pm.expect(p).to.have.property("name");
        pm.expect(p.price).to.be.above(0);
    });
});

// ---- POST {{baseUrl}}/api/products  Body ----
{
  "name": "USB-C Charger {{$randomInt}}",
  "price": 899.00
}
// tests
pm.test("Created", function () {
    pm.response.to.have.status(201);
});
pm.collectionVariables.set("newProductId", pm.response.json().id);

# ---- Command line / CI with Newman ----
npm install -g newman newman-reporter-htmlextra
newman run ShopKart-API.postman_collection.json \\
  -e QA.postman_environment.json \\
  --env-var "password=$QA_PASSWORD" \\
  -r cli,htmlextra --reporter-htmlextra-export newman-report.html`,
      result: `Postman Test Results (GET products):
PASS  Status is 200
PASS  Response time below 800 ms
PASS  Every product has id, name and price

Newman:
ShopKart API
❏ Auth
↳ Login
  POST https://qa-api.shopkart.in/api/auth/login [200 OK, 512B, 184ms]
  ✓  Login successful
❏ Products
↳ Get all products
  GET https://qa-api.shopkart.in/api/products [200 OK, 1.2kB, 95ms]
  ✓  Status is 200
  ✓  Response time below 800 ms
  ✓  Every product has id, name and price
↳ Create product
  POST https://qa-api.shopkart.in/api/products [201 Created, 310B, 120ms]
  ✓  Created
┌─────────────────────────┬──────────┬──────────┐
│                         │ executed │   failed │
├─────────────────────────┼──────────┼──────────┤
│              assertions │        5 │        0 │
└─────────────────────────┴──────────┴──────────┘
(sizes and times vary)`,
      explanation: 'The login script stores the JWT in the active environment, and the collection-level Bearer auth uses {{token}} for every request, so you never copy-paste tokens. Switching the environment from Local to QA re-targets all requests. {{$randomInt}} is a Postman dynamic variable for unique test data. Newman runs the same collection in a CI pipeline and fails the build (non-zero exit code) if any assertion fails; the password is passed with --env-var so it is not stored in the exported file.',
    },
    {
      title: 'Example 4: Document a Spring Boot API with springdoc-openapi',
      scenario: 'Give the frontend and QA teams interactive documentation with descriptions, examples, error responses and JWT authorization.',
      steps: [
        'Add the springdoc dependency to pom.xml (IntelliJ: Maven tool window > Reload; Eclipse: right-click project > Maven > Update Project)',
        'Add OpenApiConfig with API info and a bearer security scheme',
        'Annotate the controller and DTO as shown',
        'Run the app and open http://localhost:8080/swagger-ui.html; click Authorize, paste a JWT, then "Try it out" on an endpoint',
        'Download http://localhost:8080/v3/api-docs.yaml and import it into Postman (Import > File) to create a collection automatically',
      ],
      code: `<!-- pom.xml (Spring Boot 3.3/3.4) -->
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.6.0</version>
</dependency>

# application.properties
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operations-sorter=method
# springdoc.swagger-ui.enabled=false   (prod, if API is private)

// OpenApiConfig.java
@Configuration
@OpenAPIDefinition(
    info = @Info(title = "ShopKart Product API", version = "v1",
                 description = "Products catalogue for web and mobile apps",
                 contact = @Contact(name = "Product Team", email = "product-team@shopkart.in")),
    security = @SecurityRequirement(name = "bearerAuth"))
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP,
                scheme = "bearer", bearerFormat = "JWT")
public class OpenApiConfig {}

// ProductRequest.java
public record ProductRequest(
    @Schema(description = "Product name", example = "Wireless Mouse")
    @NotBlank String name,
    @Schema(description = "Price in INR", example = "799.00", minimum = "1")
    @Positive BigDecimal price) {}

// ProductController.java
@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Products", description = "Create and search products")
public class ProductController {

    @Operation(summary = "Get product by id")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Product found"),
        @ApiResponse(responseCode = "404", description = "Product not found",
                     content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public ProductResponse get(@Parameter(description = "Product id", example = "1") @PathVariable Long id) {
        return service.get(id);
    }

    @Operation(summary = "Create a product (ADMIN only)")
    @ApiResponse(responseCode = "201", description = "Created")
    @ApiResponse(responseCode = "400", description = "Validation failed")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        return service.create(request);
    }
}`,
      result: `http://localhost:8080/swagger-ui.html
ShopKart Product API  v1  (OAS 3.0)   [Authorize 🔒]
Products — Create and search products
  GET  /api/v1/products/{id}   Get product by id          responses: 200, 404
  POST /api/v1/products        Create a product (ADMIN only)   responses: 201, 400
Schemas: ProductRequest { name* string example "Wireless Mouse", price* number example 799.00 }

GET /v3/api-docs -> {"openapi":"3.0.1","info":{"title":"ShopKart Product API","version":"v1",...},"paths":{"/api/v1/products/{id}":{...}}}`,
      explanation: 'springdoc reads Spring MVC mappings, validation annotations (@NotBlank marks the field required) and the OpenAPI annotations to produce the spec at runtime, so documentation stays in sync with code. The bearerAuth scheme adds the Authorize button, letting testers call secured endpoints. The springdoc version must match your Spring Boot line (2.x for Boot 3); check the springdoc compatibility table when upgrading. If Spring Security is enabled, permit /v3/api-docs/** and /swagger-ui/** in the filter chain.',
    },
    {
      title: 'Example 5: One Sprint in a Real Team — From Jira Story to Done',
      scenario: 'Follow a fresher, Priya, through a 2-week sprint working on a coupon feature in Jira, Git and the CI pipeline.',
      steps: [
        'Backlog refinement: the Product Owner explains story SHOP-142; the team asks questions and adds acceptance criteria',
        'Sprint Planning (Day 1): team estimates with Planning Poker; SHOP-142 = 5 points; Priya creates sub-tasks and moves the story to In Progress when she starts',
        'Create the branch from the Jira ticket (Jira "Create branch" link or git checkout -b feature/SHOP-142-apply-coupon); commit with the ticket id so Jira shows commits and PRs automatically',
        'Daily stand-up: give a 3-line update, mention blockers early (e.g., "Need QA DB access")',
        'Open a PR, link SHOP-142, move the ticket to Code Review; fix review comments; after merge and deployment to QA move it to QA',
        'Tester verifies acceptance criteria; any defect is logged as a Bug linked to the story; when verified it moves to Done',
        'Sprint Review: demo the coupon feature; Retrospective: discuss improvements',
      ],
      code: `JIRA STORY  SHOP-142   Type: Story   Epic: SHOP-100 Checkout   Points: 5   Sprint: Sprint 23
Title: Apply coupon code at checkout
As a customer, I want to apply a coupon code at checkout, so that I get a discount on my order.

Acceptance Criteria:
  AC1  Given a valid coupon "DIWALI10" and cart total >= 1000
       When I apply it
       Then 10% discount (max 500) is shown and the total is updated
  AC2  Given an expired coupon, When I apply it, Then I see "Coupon expired" (HTTP 400)
  AC3  Given cart total < 1000, When I apply it, Then I see "Minimum order 1000 required"
Sub-tasks: SHOP-143 API endpoint | SHOP-144 Unit tests | SHOP-145 React UI | SHOP-146 Swagger docs

BOARD (Sprint 23)
| To Do        | In Progress      | Code Review    | QA            | Done          |
| SHOP-150     | SHOP-145 (Priya) | SHOP-143 (PR#88)| SHOP-139     | SHOP-131      |
| SHOP-152     |                  |                |               | SHOP-133      |

GIT
git checkout main && git pull
git checkout -b feature/SHOP-142-apply-coupon
git add .
git commit -m "SHOP-143: Add POST /api/v1/cart/coupon endpoint with validation"
git push -u origin feature/SHOP-142-apply-coupon
# open PR: title "SHOP-142 Apply coupon at checkout", description: what/why/how to test

PR DESCRIPTION TEMPLATE
## What
Adds coupon validation and discount calculation (SHOP-142).
## Why
Diwali campaign needs coupon support.
## How to test
1. POST /api/v1/cart/coupon {"code":"DIWALI10"} with cart total 2000 -> discount 200
2. Expired coupon -> 400 "Coupon expired"
## Checklist
- [x] Unit tests added (CouponServiceTest, 9 tests)
- [x] Swagger annotations updated
- [x] No secrets / debug logs

DAILY STAND-UP (Priya, Day 4)
Yesterday: finished coupon API and unit tests, raised PR #88.
Today: address review comments and start React coupon input (SHOP-145).
Blockers: none.`,
      result: `Jira SHOP-142 activity:
- Status: To Do -> In Progress -> Code Review -> QA -> Done
- Development panel: 1 branch, 4 commits, 1 pull request MERGED, Build ✓ (CI #212)
- Linked bug SHOP-158 "Discount not capped at 500" -> fixed in PR #91 -> Verified

Sprint 23 report: Committed 34 points, Completed 31 points (velocity 31); SHOP-152 moved to next sprint.`,
      explanation: 'Linking the ticket id in branch names, commits and PR titles lets Jira show the full development history on the story, which managers and testers use daily. Acceptance criteria written as Given/When/Then become both test cases for QA and unit tests for developers. Story points measure relative effort; velocity helps plan the next sprint. Unfinished stories go back to the backlog or the next sprint — never mark a story Done if the Definition of Done is not met.',
    },
  ],
  interview: [
    { q: 'What is the difference between Step Over, Step Into and Step Out?', a: 'Step Over executes the current line completely (including method calls) and stops at the next line. Step Into enters the method called on the current line. Step Out runs the rest of the current method and stops in the caller.', level: 'Easy' },
    { q: 'What is a conditional breakpoint and when do you use it?', a: 'A breakpoint that pauses only when a boolean expression is true (e.g., i == 999 or order.getId() == 105). Used in loops or frequently called methods to stop only at the problematic case.', level: 'Easy' },
    { q: 'How do you debug an application running on a remote server or in Docker?', a: 'Start the JVM with the JDWP agent (-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005), expose/port-forward port 5005, and attach a Remote JVM Debug configuration from IntelliJ/Eclipse. Never leave the debug port open in production.', level: 'Medium' },
    { q: 'What is the difference between SonarLint and SonarQube?', a: 'SonarLint is an IDE plugin giving instant feedback on the file you edit. SonarQube is a server that analyses the whole project in CI, tracks history and enforces Quality Gates. Connected Mode syncs rules between them.', level: 'Easy' },
    { q: 'What do you check when reviewing a pull request?', a: 'Correctness and edge cases, readability and naming, tests, error handling, security (validation, secrets, SQL injection), performance (N+1 queries, unnecessary loops), adherence to design and conventions, and whether the PR does only what the ticket requires.', level: 'Medium' },
    { q: 'How do you handle a review comment you disagree with?', a: 'Reply politely with reasoning or data, ask questions to understand the concern, and if needed discuss on a call or involve the tech lead. Focus on the code and the team goal, not ego; document the decision.', level: 'Medium' },
    { q: 'What are Postman environments and variables?', a: 'Environments are named sets of variables (e.g., Local, QA) so the same requests can target different servers. Variables like {{baseUrl}} and {{token}} exist at global, collection, environment, data and local scopes, with the narrowest scope winning.', level: 'Easy' },
    { q: 'How do you automate API tests from Postman in CI?', a: 'Write pm.test assertions in request scripts, export the collection and environment, and run them with Newman (newman run collection.json -e env.json) in Jenkins/GitHub Actions; failures return a non-zero exit code and reporters create HTML/JUnit reports.', level: 'Medium' },
    { q: 'What is OpenAPI and how do you generate it in Spring Boot?', a: 'OpenAPI is a standard specification for describing REST APIs in YAML/JSON. springdoc-openapi scans controllers and generates /v3/api-docs and Swagger UI; annotations like @Operation, @ApiResponse and @Schema enrich it.', level: 'Easy' },
    { q: 'Explain the Scrum roles and ceremonies.', a: 'Roles: Product Owner (backlog and priorities), Scrum Master (facilitates, removes impediments), Developers (build the increment). Ceremonies: Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective, plus ongoing backlog refinement, all inside a time-boxed sprint.', level: 'Easy' },
    { q: 'What are story points and velocity?', a: 'Story points are relative estimates of effort, complexity and risk (often Fibonacci). Velocity is the average story points a team completes per sprint and is used for planning future sprints, not for comparing teams.', level: 'Medium' },
    { q: 'What is a Definition of Done?', a: 'A shared checklist that every story must satisfy to be called Done, e.g., code reviewed and merged, tests written and passing, quality gate passed, deployed to QA, acceptance criteria verified, documentation updated.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a program that has a NullPointerException hidden in a loop. Describe how you would locate it with an exception breakpoint, then write the fixed program and its output.',
      hint: 'Ctrl+Shift+F8 > + > Java Exception Breakpoints > NullPointerException. Fix with a null check.',
      solution: `// Buggy idea: String[] cities = {"Pune", null, "Nagpur"}; cities[i].length() throws NPE at i = 1.
// Debug: add an exception breakpoint for NullPointerException and start Debug.
// IntelliJ pauses on the exact line; Variables pane shows i = 1 and cities[1] = null.

public class Main {
    public static void main(String[] args) {
        String[] cities = {"Pune", null, "Nagpur"};
        int totalLetters = 0;
        for (int i = 0; i < cities.length; i++) {
            if (cities[i] == null) {
                System.out.println("Skipping empty city at index " + i);
                continue;
            }
            totalLetters += cities[i].length();
            System.out.println(cities[i] + " has " + cities[i].length() + " letters");
        }
        System.out.println("Total letters = " + totalLetters);
    }
}

/* Output:
Pune has 4 letters
Skipping empty city at index 1
Nagpur has 6 letters
Total letters = 10
*/`,
    },
    {
      task: 'Review the following method and write at least five review comments with labels (must-fix / suggestion / nit), then give the improved version: public List getUsers(String n) { List l = new ArrayList(); String q = "select * from users where name = \'" + n + "\'"; ... System.out.println(q); return l; }',
      hint: 'Think about SQL injection, raw types, naming, logging and select *.',
      solution: `Review comments:
1. must-fix: SQL is built by string concatenation -> SQL injection. Use a PreparedStatement / JPA parameter.
2. must-fix: System.out.println of the query; use a logger (SLF4J) at DEBUG and never log personal data.
3. suggestion: raw types List / ArrayList -> use List<UserDto> for type safety.
4. suggestion: "select *" fetches unnecessary columns (e.g., password hash); select only needed columns.
5. nit: names n, l, q are unclear -> name, users, sql.
6. question: should the search be case-insensitive / partial (LIKE)? Clarify with the story's acceptance criteria.

Improved version (Spring Data JPA):
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("select new com.shop.dto.UserDto(u.id, u.name, u.email) from User u where u.name = :name")
    List<UserDto> findByNameDto(@Param("name") String name);
}

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) { this.userRepository = userRepository; }

    public List<UserDto> getUsersByName(String name) {
        log.debug("Searching users by name");
        return userRepository.findByNameDto(name);
    }
}`,
    },
    {
      task: 'Write a Postman pre-request script at collection level that automatically logs in if the token is missing or older than 50 minutes.',
      hint: 'pm.sendRequest; store token and tokenTime in environment variables.',
      solution: `// Collection > Scripts > Pre-request
const token = pm.environment.get("token");
const tokenTime = Number(pm.environment.get("tokenTime") || 0);
const fiftyMinutes = 50 * 60 * 1000;

if (!token || (Date.now() - tokenTime) > fiftyMinutes) {
    pm.sendRequest({
        url: pm.environment.get("baseUrl") + "/api/auth/login",
        method: "POST",
        header: { "Content-Type": "application/json" },
        body: {
            mode: "raw",
            raw: JSON.stringify({
                username: pm.environment.get("username"),
                password: pm.environment.get("password")
            })
        }
    }, function (err, res) {
        if (err) {
            console.log("Login failed: " + err);
            return;
        }
        pm.environment.set("token", res.json().token);
        pm.environment.set("tokenTime", Date.now());
        console.log("New token fetched");
    });
}`,
    },
    {
      task: 'Write a user story with acceptance criteria (Given/When/Then), sub-tasks and a story-point estimate for "Forgot password by email OTP".',
      hint: 'As a ... I want ... so that ...; cover success, wrong OTP, expired OTP and rate limiting.',
      solution: `SHOP-210  Story  (Epic: SHOP-200 User Accounts)   Estimate: 8 points
As a registered customer, I want to reset my password using an OTP sent to my email,
so that I can log in again if I forget my password.

Acceptance Criteria
AC1 Given a registered email, When I request a reset, Then a 6-digit OTP valid for 10 minutes is emailed
    and the API returns 200 with "If the email exists, an OTP has been sent".
AC2 Given an unregistered email, When I request a reset, Then the same generic message is shown
    (do not reveal whether the account exists).
AC3 Given a correct OTP within 10 minutes, When I submit a new password meeting the policy,
    Then the password is changed and all existing sessions/tokens are invalidated.
AC4 Given a wrong OTP 5 times, Then the OTP is locked and I must request a new one.
AC5 Given more than 3 reset requests in 15 minutes for one email, Then the API returns 429.

Sub-tasks
- SHOP-211 OTP generation, hashing and expiry (backend)
- SHOP-212 Email sending via SMTP/SES with template
- SHOP-213 Reset password endpoint + validation
- SHOP-214 Rate limiting and lockout
- SHOP-215 React screens (request OTP, verify, new password)
- SHOP-216 Unit + integration tests, Swagger docs
Definition of Done: PR reviewed, tests green, Sonar gate passed, deployed to QA, AC1-AC5 verified by QA.`,
    },
  ],
  quiz: [
    {
      question: 'In IntelliJ IDEA, which feature lets you run any Java expression while the program is paused at a breakpoint?',
      options: ['Evaluate Expression (Alt+F8)', 'Run to Cursor', 'Reformat Code', 'Optimize Imports'],
      answer: 0,
      explanation: 'Evaluate Expression executes code in the current paused context.',
    },
    {
      question: 'SonarLint underlines the condition tier == "GOLD" in Java. The main reason is:',
      options: ['Strings cannot be used in if statements', 'It is a style issue only', '== compares references, not string content; use equals()', 'GOLD must be lowercase'],
      answer: 2,
      explanation: 'Use equals() or an enum; == checks whether both references point to the same object.',
    },
    {
      question: 'In Postman, how do you write a variable named baseUrl inside a request URL?',
      options: ['$baseUrl', '{{baseUrl}}', '#{baseUrl}', '%baseUrl%'],
      answer: 1,
      explanation: 'Postman uses double curly braces for variables.',
    },
    {
      question: 'Who is responsible for prioritizing the Product Backlog in Scrum?',
      options: ['Scrum Master', 'Tester', 'Tech Lead', 'Product Owner'],
      answer: 3,
      explanation: 'The Product Owner owns and orders the Product Backlog.',
    },
    {
      question: 'Which tool runs exported Postman collections from the command line in a CI pipeline?',
      options: ['Maven Surefire', 'SonarScanner', 'Newman', 'JaCoCo'],
      answer: 2,
      explanation: 'Newman is the Postman command-line collection runner.',
    },
  ],
};
