export default {
  id: 'day-05-dependency-injection-value-configprops',
  title: 'Dependency Injection in Spring Boot, @Value and @ConfigurationProperties',
  module: 'Module 1: Spring Boot Basics',
  day: 5,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Use constructor injection, stereotypes, @Qualifier and @Primary in a Spring Boot app, and read configuration safely with @Value and type-safe @ConfigurationProperties classes with validation.',
  objectives: [
    'Explain DI and IoC with a simple analogy and a plain Java example',
    'Use @Component, @Service, @Repository, @RestController and constructor injection',
    'Resolve multiple beans of the same type with @Primary and @Qualifier',
    'Inject single values with @Value including defaults, lists and SpEL',
    'Bind groups of properties to a Java record/class with @ConfigurationProperties and validate them',
  ],
  theory: [
    {
      heading: 'IoC and Dependency Injection (Quick Recap)',
      content:
        'Inversion of Control (IoC): objects do not create their own dependencies; a container (Spring ApplicationContext) creates them and hands them over. Dependency Injection (DI) is the technique used to hand them over: through a constructor, a setter or a field.\n\nAnalogy: a restaurant chef does not grow vegetables. The supplier (container) delivers them every morning. If the supplier changes from Farm A to Farm B, the chef\'s recipe does not change. That is loose coupling.\n\nWithout DI: class OrderService { PaymentService p = new CardPaymentService(); }  -> tightly coupled, hard to test.\nWith DI:    class OrderService { OrderService(PaymentService p) { this.p = p; } } -> any implementation can be passed, easy to mock in tests.',
    },
    {
      heading: 'Stereotypes and Injection Types in Boot',
      content:
        'Mark classes so component scanning registers them as beans:\n- @Component: generic bean\n- @Service: business logic layer\n- @Repository: data access layer (also translates DB exceptions to DataAccessException)\n- @Controller / @RestController: web layer\n- @Configuration + @Bean: create beans from third-party classes you cannot annotate\n\nInjection types:\n1. Constructor injection (RECOMMENDED): dependencies are final, object is never half-built, easy to unit test. If a class has only one constructor, @Autowired is optional.\n2. Setter injection: for optional dependencies.\n3. Field injection (@Autowired on a field): short but hides dependencies, cannot be final, harder to test. Avoid in new code.',
      points: [
        'All beans are singletons by default (one shared instance per container)',
        'Lombok @RequiredArgsConstructor generates the constructor for all final fields',
        'Circular dependency (A needs B, B needs A) fails at startup with constructor injection in Boot 3 - redesign the classes',
      ],
    },
    {
      heading: 'Multiple Implementations: @Primary and @Qualifier',
      content:
        'If two beans implement the same interface, Spring does not know which to inject and throws NoUniqueBeanDefinitionException ("expected single matching bean but found 2").\n- @Primary on one bean makes it the default choice.\n- @Qualifier("beanName") at the injection point picks a specific one and overrides @Primary.\n- Inject List<PaymentService> or Map<String, PaymentService> to get ALL implementations (map key = bean name).',
      syntax: '@Service("upi") @Primary class UpiPayment implements PaymentService {}\n@Service("card") class CardPayment implements PaymentService {}\n\npublic CheckoutService(@Qualifier("card") PaymentService payment) { ... }',
    },
    {
      heading: '@Value',
      content:
        '@Value injects a single value from properties, environment variables or a SpEL expression into a field, constructor parameter or setter.',
      syntax: '@Value("${app.name}") String name;                 // property (startup fails if missing)\n@Value("${app.page-size:10}") int pageSize;         // default 10 if missing\n@Value("${app.admins}") List<String> admins;        // app.admins=a@x.com,b@x.com\n@Value("#{${app.page-size:10} * 2}") int doubled;   // SpEL expression\n@Value("${JAVA_HOME:unknown}") String javaHome;     // environment variable',
      points: [
        'Type conversion is automatic (String -> int, boolean, Duration like 30s, DataSize like 10MB)',
        'Missing property without default -> "Could not resolve placeholder" at startup',
        '@Value does NOT work on static fields or in classes not managed by Spring (created with new)',
      ],
    },
    {
      heading: '@ConfigurationProperties (Type-safe Configuration)',
      content:
        'When you have many related properties with the same prefix (e.g. app.mail.host, app.mail.port, app.mail.from), bind them all into one object. This is cleaner, type-safe, supports nested objects, lists and maps, IDE auto-completion (with spring-boot-configuration-processor) and validation with @Validated.\n\nRelaxed binding: app.mail.from-address, app.mail.fromAddress and APP_MAIL_FROMADDRESS all bind to field fromAddress.\n\nAnalogy: @Value is picking items one by one from a shelf; @ConfigurationProperties is receiving a packed box with everything labelled.',
      syntax: '@ConfigurationProperties(prefix = "app.mail")\n@Validated\npublic record MailProperties(@NotBlank String host, @Min(1) int port, String from) { }\n\n// Register: @EnableConfigurationProperties(MailProperties.class) on a @Configuration\n// or @ConfigurationPropertiesScan on the main class',
      points: [
        '@Value: one or few values, SpEL support, no validation, no relaxed binding for complex types',
        '@ConfigurationProperties: groups, type-safe, validation, relaxed binding, metadata for IDE hints; no SpEL',
        'Records (Java 16+) are perfect for immutable configuration in Boot 3 (constructor binding is automatic)',
      ],
    },
  ],
  examples: [
    {
      title: 'Pure Java: Why DI Makes Code Flexible',
      scenario: 'A plain Java program that injects different PaymentService implementations into an OrderService through the constructor, exactly what Spring does for you.',
      steps: [
        'IntelliJ: New Project > Java > create Main.java; Eclipse: New Java Project > New Class Main',
        'Type the code and click Run ▶',
      ],
      code: `interface PaymentService {
    String pay(double amount);
}

class UpiPayment implements PaymentService {
    public String pay(double amount) { return "Paid " + amount + " via UPI"; }
}

class CardPayment implements PaymentService {
    public String pay(double amount) { return "Paid " + amount + " via Card"; }
}

class OrderService {
    private final PaymentService payment;
    OrderService(PaymentService payment) { this.payment = payment; } // constructor injection
    String placeOrder(double amount) { return "Order placed. " + payment.pay(amount); }
}

public class Main {
    public static void main(String[] args) {
        // "container" decides which implementation to inject
        OrderService s1 = new OrderService(new UpiPayment());
        OrderService s2 = new OrderService(new CardPayment());
        System.out.println(s1.placeOrder(499.0));
        System.out.println(s2.placeOrder(1250.5));
    }
}`,
      java: {
        files: {
          'Main.java': `interface PaymentService {
    String pay(double amount);
}

class UpiPayment implements PaymentService {
    public String pay(double amount) { return "Paid " + amount + " via UPI"; }
}

class CardPayment implements PaymentService {
    public String pay(double amount) { return "Paid " + amount + " via Card"; }
}

class OrderService {
    private final PaymentService payment;
    OrderService(PaymentService payment) { this.payment = payment; } // constructor injection
    String placeOrder(double amount) { return "Order placed. " + payment.pay(amount); }
}

public class Main {
    public static void main(String[] args) {
        // "container" decides which implementation to inject
        OrderService s1 = new OrderService(new UpiPayment());
        OrderService s2 = new OrderService(new CardPayment());
        System.out.println(s1.placeOrder(499.0));
        System.out.println(s2.placeOrder(1250.5));
    }
}`,
        },
      },
      result: `Order placed. Paid 499.0 via UPI
Order placed. Paid 1250.5 via Card`,
      explanation: 'OrderService never uses "new" for its dependency, so it works with any PaymentService. In Spring Boot, the ApplicationContext plays the role of main(): it creates the beans and passes them to constructors.',
    },
    {
      title: 'Constructor Injection with @Primary and @Qualifier in Spring Boot',
      scenario: 'Two payment implementations as Spring beans; checkout uses the primary (UPI) by default and a refund service explicitly uses card. A controller exposes both.',
      steps: [
        'Create package payment with PaymentService, UpiPaymentService, CardPaymentService',
        'Create CheckoutService and RefundService in service package',
        'Create PaymentController in controller package',
        'Run the app (IntelliJ ▶ / STS Run As > Spring Boot App)',
        'Postman: POST http://localhost:8080/api/checkout with JSON body, then POST /api/refund',
      ],
      code: `// ===== payment/PaymentService.java =====
package com.example.studentapi.payment;

public interface PaymentService {
    String pay(double amount);
}

// ===== payment/UpiPaymentService.java =====
package com.example.studentapi.payment;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service("upi")
@Primary
public class UpiPaymentService implements PaymentService {
    @Override
    public String pay(double amount) {
        return "Paid " + amount + " via UPI";
    }
}

// ===== payment/CardPaymentService.java =====
package com.example.studentapi.payment;

import org.springframework.stereotype.Service;

@Service("card")
public class CardPaymentService implements PaymentService {
    @Override
    public String pay(double amount) {
        return "Paid " + amount + " via Card";
    }
}

// ===== service/CheckoutService.java =====
package com.example.studentapi.service;

import com.example.studentapi.payment.PaymentService;
import org.springframework.stereotype.Service;

@Service
public class CheckoutService {
    private final PaymentService paymentService;   // gets @Primary (upi)

    public CheckoutService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    public String checkout(double amount) {
        return "Checkout OK. " + paymentService.pay(amount);
    }
}

// ===== service/RefundService.java =====
package com.example.studentapi.service;

import com.example.studentapi.payment.PaymentService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
public class RefundService {
    private final PaymentService paymentService;

    public RefundService(@Qualifier("card") PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    public String refund(double amount) {
        return "Refund via card gateway. " + paymentService.pay(-amount);
    }
}

// ===== controller/PaymentController.java =====
package com.example.studentapi.controller;

import java.util.Map;
import com.example.studentapi.service.CheckoutService;
import com.example.studentapi.service.RefundService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PaymentController {

    private final CheckoutService checkoutService;
    private final RefundService refundService;

    public PaymentController(CheckoutService checkoutService, RefundService refundService) {
        this.checkoutService = checkoutService;
        this.refundService = refundService;
    }

    public record AmountRequest(double amount) { }

    @PostMapping("/checkout")
    public Map<String, String> checkout(@RequestBody AmountRequest req) {
        return Map.of("message", checkoutService.checkout(req.amount()));
    }

    @PostMapping("/refund")
    public Map<String, String> refund(@RequestBody AmountRequest req) {
        return Map.of("message", refundService.refund(req.amount()));
    }
}`,
      result: `POST http://localhost:8080/api/checkout
Body (raw JSON): { "amount": 499.0 }
200 OK
{ "message": "Checkout OK. Paid 499.0 via UPI" }

POST http://localhost:8080/api/refund
Body: { "amount": 200.0 }
200 OK
{ "message": "Refund via card gateway. Paid -200.0 via Card" }`,
      explanation: 'CheckoutService has no qualifier so the @Primary bean (upi) is injected. RefundService asks for "card" explicitly; @Qualifier beats @Primary. Remove @Primary and the app fails to start with NoUniqueBeanDefinitionException for CheckoutService.',
    },
    {
      title: '@Value and @ConfigurationProperties Together',
      scenario: 'Read a single support email with @Value and a group of mail settings with a validated @ConfigurationProperties record, then expose them at GET /api/config.',
      steps: [
        'Add spring-boot-starter-validation and (optional) spring-boot-configuration-processor to pom.xml; reload Maven',
        'Add the properties to application.properties',
        'Create config/MailProperties.java record',
        'Add @ConfigurationPropertiesScan to the main class',
        'Create ConfigController and call GET http://localhost:8080/api/config in Postman',
        'Try removing app.mail.host and restart to see the validation error',
      ],
      code: `<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>

# ===== application.properties =====
app.support-email=support@college.edu
app.max-upload-mb=5
app.allowed-types=pdf,jpg,png
app.mail.host=smtp.college.edu
app.mail.port=587
app.mail.from-address=no-reply@college.edu
app.mail.recipients[0]=principal@college.edu
app.mail.recipients[1]=office@college.edu

// ===== config/MailProperties.java =====
package com.example.studentapi.config;

import java.util.List;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.mail")
public record MailProperties(
        @NotBlank String host,
        @Min(1) @Max(65535) int port,
        @NotBlank String fromAddress,
        List<String> recipients) { }

// ===== StudentApiApplication.java =====
package com.example.studentapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class StudentApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudentApiApplication.class, args);
    }
}

// ===== controller/ConfigController.java =====
package com.example.studentapi.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import com.example.studentapi.config.MailProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ConfigController {

    private final MailProperties mail;
    private final String supportEmail;
    private final int maxUploadMb;
    private final List<String> allowedTypes;

    public ConfigController(MailProperties mail,
                            @Value("\${app.support-email}") String supportEmail,
                            @Value("\${app.max-upload-mb:10}") int maxUploadMb,
                            @Value("\${app.allowed-types}") List<String> allowedTypes) {
        this.mail = mail;
        this.supportEmail = supportEmail;
        this.maxUploadMb = maxUploadMb;
        this.allowedTypes = allowedTypes;
    }

    @GetMapping("/api/config")
    public Map<String, Object> config() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("supportEmail", supportEmail);
        body.put("maxUploadMb", maxUploadMb);
        body.put("allowedTypes", allowedTypes);
        body.put("mail", mail);
        return body;
    }
}`,
      result: `GET http://localhost:8080/api/config
200 OK
{
  "supportEmail": "support@college.edu",
  "maxUploadMb": 5,
  "allowedTypes": ["pdf", "jpg", "png"],
  "mail": {
    "host": "smtp.college.edu",
    "port": 587,
    "fromAddress": "no-reply@college.edu",
    "recipients": ["principal@college.edu", "office@college.edu"]
  }
}

If app.mail.host is removed, startup fails:
  Binding to target com.example.studentapi.config.MailProperties failed:
    Property: app.mail.host
    Value: "null"
    Reason: must not be blank`,
      explanation: 'from-address in the file binds to fromAddress in the record (relaxed binding). The comma-separated allowed-types is converted to a List by @Value. Validation fails fast at startup, which is far better than a NullPointerException later when the first email is sent.',
    },
  ],
  interview: [
    { q: 'What is Dependency Injection?', a: 'A design pattern where an object receives its dependencies from outside (the IoC container) instead of creating them, which gives loose coupling and easier testing.', level: 'Easy' },
    { q: 'Why is constructor injection recommended?', a: 'Dependencies can be final (immutable), the object is always fully initialised, required dependencies are obvious, it works without Spring in unit tests (just call new with mocks), and circular dependencies are detected early.', level: 'Medium' },
    { q: 'Is @Autowired needed on a constructor?', a: 'Not if the class has exactly one constructor; Spring uses it automatically. With multiple constructors, mark the one to use with @Autowired.', level: 'Easy' },
    { q: 'Difference between @Component, @Service and @Repository?', a: 'All register beans. @Service and @Repository are specialisations that express the layer; @Repository also enables persistence exception translation into Spring DataAccessException.', level: 'Easy' },
    { q: 'What happens when two beans of the same type exist and you inject by type?', a: 'NoUniqueBeanDefinitionException at startup unless one is @Primary, the injection point uses @Qualifier, or the parameter name matches a bean name.', level: 'Medium' },
    { q: '@Primary vs @Qualifier?', a: '@Primary sets the default bean on the bean side; @Qualifier selects a specific bean at the injection point and takes precedence over @Primary.', level: 'Medium' },
    { q: 'Difference between @Value and @ConfigurationProperties?', a: '@Value injects individual values and supports SpEL. @ConfigurationProperties binds a whole prefix into a type-safe object, supports relaxed binding, nested objects, lists, maps, validation and IDE metadata; it does not support SpEL.', level: 'Medium' },
    { q: 'How do you give a default value with @Value?', a: 'Use a colon: @Value("${app.timeout:30}"). If the property is missing, 30 is used.', level: 'Easy' },
    { q: 'How do you register a @ConfigurationProperties class?', a: 'Use @ConfigurationPropertiesScan on the main class, @EnableConfigurationProperties(MyProps.class) on a configuration class, or annotate the class with @Component (not for records/constructor binding).', level: 'Hard' },
    { q: 'Why does @Value not work in an object created with new?', a: 'Injection is done by the Spring container only for beans it manages. An object created with new is outside the container, so its @Value fields stay null/default.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a GreetingService interface with EnglishGreeting and HindiGreeting beans. Make English primary and create a controller with GET /greet/en and /greet/hi using @Qualifier.',
      hint: 'Inject both with different qualifiers in the controller constructor.',
      solution: `public interface GreetingService { String greet(String name); }

@Service("english") @Primary
public class EnglishGreeting implements GreetingService {
    public String greet(String name) { return "Hello " + name; }
}

@Service("hindi")
public class HindiGreeting implements GreetingService {
    public String greet(String name) { return "Namaste " + name; }
}

@RestController
@RequestMapping("/greet")
public class GreetController {
    private final GreetingService en;
    private final GreetingService hi;

    public GreetController(GreetingService en, @Qualifier("hindi") GreetingService hi) {
        this.en = en;
        this.hi = hi;
    }

    @GetMapping("/en")
    public String english(@RequestParam String name) { return en.greet(name); }

    @GetMapping("/hi")
    public String hindi(@RequestParam String name) { return hi.greet(name); }
}
// GET /greet/hi?name=Ravi -> Namaste Ravi`,
    },
    {
      task: 'Inject all PaymentService beans as a Map and create GET /api/payment/{type}?amount=100 that uses the bean with that name.',
      hint: 'Map<String, PaymentService> key is the bean name.',
      solution: `@RestController
@RequestMapping("/api/payment")
public class DynamicPaymentController {
    private final Map<String, PaymentService> services;

    public DynamicPaymentController(Map<String, PaymentService> services) {
        this.services = services;
    }

    @GetMapping("/{type}")
    public ResponseEntity<String> pay(@PathVariable String type, @RequestParam double amount) {
        PaymentService s = services.get(type);
        if (s == null) {
            return ResponseEntity.badRequest().body("Unknown payment type: " + type);
        }
        return ResponseEntity.ok(s.pay(amount));
    }
}
// GET /api/payment/card?amount=100 -> Paid 100.0 via Card
// GET /api/payment/cash?amount=100 -> 400 Unknown payment type: cash`,
    },
    {
      task: 'Create a @ConfigurationProperties record for prefix "app.jwt" with secret (not blank) and expiryMinutes (min 1), and print them at startup with CommandLineRunner.',
      hint: 'Register with @ConfigurationPropertiesScan.',
      solution: `# application.properties
app.jwt.secret=mySuperSecretKeyThatIsLongEnough123456
app.jwt.expiry-minutes=60

@Validated
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(@NotBlank String secret, @Min(1) int expiryMinutes) { }

@Component
public class JwtPrinter implements CommandLineRunner {
    private final JwtProperties jwt;
    public JwtPrinter(JwtProperties jwt) { this.jwt = jwt; }

    @Override
    public void run(String... args) {
        System.out.println("JWT expiry = " + jwt.expiryMinutes() + " minutes");
    }
}
// Console: JWT expiry = 60 minutes`,
    },
    {
      task: 'Convert this field-injected class to constructor injection with Lombok: @Service class ReportService { @Autowired StudentRepository repo; @Autowired MailService mail; }',
      hint: 'Make fields private final and add @RequiredArgsConstructor.',
      solution: `import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final StudentRepository repo;
    private final MailService mail;
}`,
    },
  ],
  quiz: [
    {
      question: 'Which injection type is recommended in Spring Boot?',
      options: ['Field injection', 'Setter injection', 'Constructor injection', 'Static injection'],
      answer: 2,
      explanation: 'Constructor injection gives immutable, testable, fully initialised beans.',
    },
    {
      question: '@Value("${app.size:20}") when app.size is not defined gives:',
      options: ['20', 'null', '0', 'Startup error'],
      answer: 0,
      explanation: 'The value after the colon is the default.',
    },
    {
      question: 'Two beans implement the same interface, one has @Primary, and the injection point has @Qualifier for the other. Which is injected?',
      options: ['The @Primary bean', 'Error', 'Both', 'The @Qualifier bean'],
      answer: 3,
      explanation: '@Qualifier at the injection point overrides @Primary.',
    },
    {
      question: 'Which feature is supported by @ConfigurationProperties but not @Value?',
      options: ['SpEL expressions', 'Relaxed binding and JSR-303 validation of a whole group', 'Default values', 'Reading properties'],
      answer: 1,
      explanation: '@ConfigurationProperties supports relaxed binding and @Validated; SpEL is only for @Value.',
    },
    {
      question: 'app.mail.from-address binds to which record component?',
      options: ['from_address', 'fromaddress only', 'fromAddress', 'from-address (invalid Java)'],
      answer: 2,
      explanation: 'Relaxed binding maps kebab-case to camelCase.',
    },
  ],
};
