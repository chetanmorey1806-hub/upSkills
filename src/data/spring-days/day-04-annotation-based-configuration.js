export default {
  id: 'day-04-annotation-based-configuration',
  title: 'Annotation-based Configuration: @Component, @Autowired, @Qualifier, @Primary',
  module: 'Module 1: Spring Core',
  day: 4,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Replace long XML with annotations: mark classes with @Component (and its specialisations), let Spring inject them with @Autowired, and solve "more than one bean" problems using @Qualifier and @Primary.`,
  objectives: [
    `Enable component scanning in XML and in Java`,
    `Use @Component, @Service, @Repository and @Controller correctly`,
    `Apply @Autowired on constructors, setters and fields`,
    `Resolve NoUniqueBeanDefinitionException with @Qualifier and @Primary`,
    `Handle optional dependencies with required=false and Optional`,
  ],
  theory: [
    {
      heading: 'Component scanning and stereotype annotations',
      content: `Instead of writing a <bean> for each class, you put @Component on the class and tell Spring which package to scan. Spring finds all annotated classes and registers them as beans. Analogy: instead of giving the school a list of every student by name (XML), you say "everyone wearing the school badge in this building is a student" (@Component + scan). Default bean name = class name with first letter lowercase (EmailService -> emailService).`,
      points: [
        `@Component: generic Spring-managed component`,
        `@Service: business/service layer (same behaviour, clearer meaning)`,
        `@Repository: DAO layer; also translates SQL exceptions into Spring DataAccessException`,
        `@Controller: Spring MVC web controller (Day 12)`,
        `@Component("myName") gives a custom bean name`,
      ],
      syntax: `<!-- XML way: needs xmlns:context -->
<context:component-scan base-package="com.demo"/>

// Java way
new AnnotationConfigApplicationContext("com.demo");   // scan this package
// or @ComponentScan("com.demo") on a @Configuration class (Day 5)`,
    },
    {
      heading: '@Autowired: automatic injection by type',
      content: `@Autowired asks Spring to find a bean of the required TYPE and inject it. It can be placed on a constructor, a setter or a field. Since Spring 4.3, if a class has only ONE constructor, @Autowired on it is optional; Spring uses it automatically.`,
      syntax: `@Service
public class OrderService {
    private final PaymentService payment;
    public OrderService(PaymentService payment) {   // @Autowired optional (single constructor)
        this.payment = payment;
    }
}

@Autowired                       // setter injection
public void setAudit(AuditService audit) { ... }

@Autowired                       // field injection (avoid in real code)
private ReportService report;`,
      tip: `Common mistake: forgetting @Component on the dependency class or placing it outside the scanned package. Result: NoSuchBeanDefinitionException.`,
    },
    {
      heading: 'The "two candidates" problem',
      content: `If an interface MessageService has two @Component implementations (EmailService and SmsService), and a class autowires MessageService, Spring finds two matches and fails at startup with NoUniqueBeanDefinitionException: expected single matching bean but found 2. Diagram in words: Notification --needs MessageService--> [emailService, smsService] ?? which one?`,
    },
    {
      heading: '@Primary and @Qualifier',
      content: `@Primary on one implementation makes it the default choice when several beans match. @Qualifier("beanName") at the injection point picks a specific bean and always wins over @Primary. Analogy: @Primary is the "default printer" on your laptop; @Qualifier is choosing a specific printer in the print dialog.`,
      syntax: `@Component @Primary
public class EmailService implements MessageService { ... }

@Component
public class SmsService implements MessageService { ... }

@Component
public class OtpSender {
    private final MessageService service;
    public OtpSender(@Qualifier("smsService") MessageService service) { this.service = service; }
}`,
      points: [
        `Order of resolution: type -> @Qualifier -> @Primary -> parameter/field name matches bean name`,
        `@Qualifier wins over @Primary`,
        `Only one bean of a type should be @Primary, otherwise you get an error again`,
      ],
    },
    {
      heading: 'Optional dependencies and collections',
      content: `@Autowired(required = false) skips injection if no bean exists (field stays null). Better: inject Optional<T> or ObjectProvider<T>. You can also inject ALL implementations: List<MessageService> gets every bean of that type, Map<String, MessageService> gets them keyed by bean name.`,
      syntax: `public NotificationHub(List<MessageService> all) { ... }      // every implementation
public Reporter(Optional<MailServer> mail) { ... }               // may be empty`,
    },
    {
      heading: '@Value for simple values',
      content: `@Value injects literals or properties: @Value("Asha") or a placeholder like @Value("\${app.name}") with @PropertySource("classpath:app.properties"). You will use this a lot in Spring Boot.`,
    },
  ],
  examples: [
    {
      title: 'How Spring chooses among candidates (plain Java simulation)',
      scenario: `We simulate Spring's resolution rules with a small registry: by type with two beans fails, @Qualifier picks by name, @Primary picks the default. Runs without Spring in the browser IDE.`,
      steps: [
        'Create Main.java and paste the code',
        'Click Run ▶',
        'Compare each output line with the rule it represents',
      ],
      code: `import java.util.*;

interface MessageService { String send(String to); }
class EmailService implements MessageService { public String send(String to) { return "Email sent to " + to; } }
class SmsService implements MessageService { public String send(String to) { return "SMS sent to " + to; } }

class Registry {
    private final Map<String, MessageService> beans = new LinkedHashMap<>();
    private String primary;

    void add(String name, MessageService bean, boolean isPrimary) {
        beans.put(name, bean);
        if (isPrimary) primary = name;
    }
    MessageService byType() {                                  // like @Autowired
        if (beans.size() == 1) return beans.values().iterator().next();
        if (primary != null) return beans.get(primary);       // like @Primary
        throw new IllegalStateException("NoUniqueBeanDefinitionException: expected 1 but found "
                + beans.size() + ": " + beans.keySet());
    }
    MessageService byQualifier(String name) { return beans.get(name); }   // like @Qualifier
}

class Notification {
    private final MessageService service;
    Notification(MessageService service) { this.service = service; }
    void notifyUser(String user) { System.out.println(service.send(user)); }
}

public class Main {
    public static void main(String[] args) {
        Registry r = new Registry();
        r.add("emailService", new EmailService(), false);
        r.add("smsService", new SmsService(), false);
        try {
            r.byType();
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage());
        }
        new Notification(r.byQualifier("smsService")).notifyUser("Asha");

        Registry r2 = new Registry();
        r2.add("emailService", new EmailService(), true);
        r2.add("smsService", new SmsService(), false);
        new Notification(r2.byType()).notifyUser("Ravi");
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.*;

interface MessageService { String send(String to); }
class EmailService implements MessageService { public String send(String to) { return "Email sent to " + to; } }
class SmsService implements MessageService { public String send(String to) { return "SMS sent to " + to; } }

class Registry {
    private final Map<String, MessageService> beans = new LinkedHashMap<>();
    private String primary;

    void add(String name, MessageService bean, boolean isPrimary) {
        beans.put(name, bean);
        if (isPrimary) primary = name;
    }
    MessageService byType() {
        if (beans.size() == 1) return beans.values().iterator().next();
        if (primary != null) return beans.get(primary);
        throw new IllegalStateException("NoUniqueBeanDefinitionException: expected 1 but found "
                + beans.size() + ": " + beans.keySet());
    }
    MessageService byQualifier(String name) { return beans.get(name); }
}

class Notification {
    private final MessageService service;
    Notification(MessageService service) { this.service = service; }
    void notifyUser(String user) { System.out.println(service.send(user)); }
}

public class Main {
    public static void main(String[] args) {
        Registry r = new Registry();
        r.add("emailService", new EmailService(), false);
        r.add("smsService", new SmsService(), false);
        try {
            r.byType();
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage());
        }
        new Notification(r.byQualifier("smsService")).notifyUser("Asha");

        Registry r2 = new Registry();
        r2.add("emailService", new EmailService(), true);
        r2.add("smsService", new SmsService(), false);
        new Notification(r2.byType()).notifyUser("Ravi");
    }
}`,
        },
      },
      result: `NoUniqueBeanDefinitionException: expected 1 but found 2: [emailService, smsService]
SMS sent to Asha
Email sent to Ravi`,
      explanation: `Two candidates and no hint = error. A qualifier names the bean directly. Marking emailService as primary makes plain by-type injection succeed. Spring follows the same logic, only with annotations.`,
    },
    {
      title: '@Component + @Autowired + @Qualifier + @Primary in Spring',
      scenario: `Real Spring version of the same idea using component scanning.`,
      steps: [
        'Create a Maven project with spring-context 6.1.14 (Eclipse/STS: File > New > Maven Project; IntelliJ: File > New > Project > Maven)',
        'Create package com.demo with the classes below (one public class per file)',
        'Run AnnoApp (Run As > Java Application in Eclipse, green ▶ in IntelliJ)',
      ],
      code: `package com.demo;
public interface MessageService { String send(String to); }

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
@Service @Primary
public class EmailService implements MessageService {
    public String send(String to) { return "Email sent to " + to; }
}

@Service
public class SmsService implements MessageService {
    public String send(String to) { return "SMS sent to " + to; }
}

import org.springframework.stereotype.Component;
@Component
public class WelcomeNotifier {
    private final MessageService service;
    public WelcomeNotifier(MessageService service) { this.service = service; }   // gets @Primary
    public void welcome(String user) { System.out.println(service.send(user)); }
}

import org.springframework.beans.factory.annotation.Qualifier;
@Component
public class OtpNotifier {
    private final MessageService service;
    public OtpNotifier(@Qualifier("smsService") MessageService service) { this.service = service; }
    public void otp(String user) { System.out.println(service.send(user)); }
}

import org.springframework.context.annotation.AnnotationConfigApplicationContext;
public class AnnoApp {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext("com.demo")) {
            ctx.getBean(WelcomeNotifier.class).welcome("Asha");
            ctx.getBean(OtpNotifier.class).otp("Ravi");
        }
    }
}`,
      result: `Email sent to Asha
SMS sent to Ravi`,
      explanation: `WelcomeNotifier receives the @Primary EmailService. OtpNotifier's @Qualifier("smsService") overrides @Primary. Remove @Primary and WelcomeNotifier causes NoUniqueBeanDefinitionException at startup.`,
    },
    {
      title: 'Injecting all implementations as a List',
      scenario: `Send a broadcast through every MessageService.`,
      steps: [
        'Add BroadcastService to com.demo',
        'Call it from main and run',
      ],
      code: `@Component
public class BroadcastService {
    private final List<MessageService> services;
    public BroadcastService(List<MessageService> services) { this.services = services; }
    public void broadcast(String user) {
        services.forEach(s -> System.out.println(s.send(user)));
    }
}

// in main
ctx.getBean(BroadcastService.class).broadcast("Team");`,
      result: `Email sent to Team
SMS sent to Team`,
      explanation: `Spring injects every bean of type MessageService. The order follows registration order (alphabetical class scan here); use @Order(1), @Order(2) on the classes if you need a guaranteed order.`,
    },
    {
      title: 'Enabling annotations from XML',
      scenario: `Older projects keep beans.xml but switch on scanning.`,
      steps: [
        'Open beans.xml and add the context namespace',
        'Add <context:component-scan>',
        'Load with ClassPathXmlApplicationContext("beans.xml")',
      ],
      code: `<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
         https://www.springframework.org/schema/beans/spring-beans.xsd
         http://www.springframework.org/schema/context
         https://www.springframework.org/schema/context/spring-context.xsd">

    <context:component-scan base-package="com.demo"/>
</beans>`,
      result: `Same output as Example 2: Email sent to Asha / SMS sent to Ravi`,
      explanation: `component-scan also turns on annotation processing (<context:annotation-config/>), so @Autowired, @Qualifier and @PostConstruct work.`,
    },
  ],
  interview: [
    { q: 'What does @Component do?', a: 'Marks a class as a Spring bean candidate; component scanning detects it and registers it in the container.', level: 'Easy' },
    { q: 'Difference between @Component, @Service, @Repository and @Controller?', a: 'All are stereotypes and register beans. @Service marks business logic, @Repository marks DAO and adds persistence exception translation, @Controller marks Spring MVC controllers handled by DispatcherServlet.', level: 'Medium' },
    { q: 'How does @Autowired resolve a dependency?', a: 'By type first; if multiple candidates, it uses @Qualifier, then @Primary, then matches the parameter/field name against bean names; otherwise throws NoUniqueBeanDefinitionException.', level: 'Medium' },
    { q: '@Qualifier vs @Primary?', a: '@Primary sets a default at the bean definition side; @Qualifier selects a specific bean at the injection point. @Qualifier has higher priority.', level: 'Medium' },
    { q: 'Is @Autowired required on a constructor?', a: 'Not if the class has a single constructor (Spring 4.3+). With multiple constructors, mark the one Spring should use.', level: 'Medium' },
    { q: 'What happens if no bean is found for @Autowired?', a: 'NoSuchBeanDefinitionException at startup, unless required=false, Optional<T> or ObjectProvider<T> is used.', level: 'Easy' },
    { q: 'What is the default bean name for @Component class UserService?', a: 'userService (first letter lowercase).', level: 'Easy' },
    { q: 'How do you inject all beans of a type?', a: 'Inject List<Type>, Set<Type> or Map<String, Type> (keyed by bean name).', level: 'Medium' },
    { q: 'Why prefer constructor injection over field injection?', a: 'Dependencies are explicit, fields can be final, the class is testable without Spring, and circular dependencies are detected early.', level: 'Medium' },
    { q: 'What is the purpose of <context:component-scan>?', a: 'Scans the given base package for stereotype annotations and enables annotation-driven config (@Autowired, @Value, @PostConstruct).', level: 'Easy' },
    { q: 'Can @Qualifier be used with custom annotations?', a: 'Yes, you can create your own annotation meta-annotated with @Qualifier (e.g. @Sms) for type-safe qualification.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Plain Java: add a third implementation PushService to the Registry example and make it primary. Print the result of byType().send("Kiran").',
      hint: 'The last add with isPrimary=true sets primary.',
      solution: `// add to Example 1 classes:
class PushService implements MessageService { public String send(String to) { return "Push sent to " + to; } }

// main
Registry r = new Registry();
r.add("emailService", new EmailService(), false);
r.add("smsService", new SmsService(), false);
r.add("pushService", new PushService(), true);
System.out.println(r.byType().send("Kiran"));   // Push sent to Kiran`,
    },
    {
      task: 'Spring: create interface Shape with Circle and Square @Components. Inject Square into Painter using @Qualifier and print "Drawing Square".',
      hint: 'Bean name of Square is "square".',
      solution: `public interface Shape { String draw(); }
@Component public class Circle implements Shape { public String draw() { return "Drawing Circle"; } }
@Component public class Square implements Shape { public String draw() { return "Drawing Square"; } }
@Component public class Painter {
    private final Shape shape;
    public Painter(@Qualifier("square") Shape shape) { this.shape = shape; }
    public void paint() { System.out.println(shape.draw()); }
}
// main: new AnnotationConfigApplicationContext("com.demo").getBean(Painter.class).paint();`,
    },
    {
      task: 'Create a @Repository StudentDao and @Service StudentService that receives it via constructor. Service method prints the count returned by the DAO (return 42).',
      hint: 'Single constructor: no @Autowired needed.',
      solution: `@Repository
public class StudentDao { public int count() { return 42; } }

@Service
public class StudentService {
    private final StudentDao dao;
    public StudentService(StudentDao dao) { this.dao = dao; }
    public void printCount() { System.out.println("Students: " + dao.count()); }
}`,
    },
    {
      task: 'Make an optional dependency: AuditService may or may not exist. Inject it as Optional and print "Audit off" when it is missing.',
      hint: 'Optional<AuditService> in constructor.',
      solution: `@Component
public class PaymentService {
    private final Optional<AuditService> audit;
    public PaymentService(Optional<AuditService> audit) { this.audit = audit; }
    public void pay() {
        audit.ifPresentOrElse(a -> a.log("paid"), () -> System.out.println("Audit off"));
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which annotation adds exception translation for DAOs?', options: ['@Service', '@Component', '@Controller', '@Repository'], answer: 3, explanation: '@Repository enables PersistenceExceptionTranslation.' },
    { question: 'Two beans match an @Autowired type with no hints. Result?', options: ['First one is used', 'NoUniqueBeanDefinitionException', 'null injected', 'Both injected'], answer: 1, explanation: 'Spring refuses to guess.' },
    { question: 'Which has higher priority?', options: ['@Qualifier', '@Primary', '@Lazy', '@Order'], answer: 0, explanation: '@Qualifier at the injection point overrides @Primary.' },
    { question: 'Default bean name of @Service class PaymentGateway is:', options: ['PaymentGateway', 'payment_gateway', 'paymentGateway', 'gateway'], answer: 2, explanation: 'Decapitalised simple class name.' },
    { question: 'In XML, which tag enables scanning for @Component?', options: ['<context:annotation-config/>', '<bean scan="true"/>', '<mvc:annotation-driven/>', '<context:component-scan/>'], answer: 3, explanation: 'component-scan detects stereotypes in the base package.' },
  ],
};
