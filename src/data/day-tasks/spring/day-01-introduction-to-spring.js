export default {
  lesson: 'day-01-introduction-to-spring',
  minutes: 15,
  intro: 'Check what Spring is, which problems it solves, how its modules are organised and how to start a Spring 6 Maven project.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the **core idea** of the Spring Framework?',
      options: [
        'A database that stores Java objects',
        'An IoC container that creates objects (beans) and injects their dependencies, so classes stay loosely coupled',
        'A replacement for the Java language',
        'A front-end library for building HTML pages',
      ],
      answer: 1,
      explain: 'Spring\'s heart is the **IoC container**: you describe which objects exist and what they need, and Spring creates and wires them. On top of that it adds AOP, transactions, JDBC/ORM support, MVC and more.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which code shows **tight coupling**?',
      options: [
        'public FeeService(PaymentGateway gateway) { this.gateway = gateway; }',
        'private PaymentGateway gateway = new RazorpayGateway();',
        '@Autowired private PaymentGateway gateway;',
        'void setGateway(PaymentGateway gateway) { this.gateway = gateway; }',
      ],
      answer: 1,
      explain: 'Creating the concrete class with `new RazorpayGateway()` inside FeeService hard-wires it: switching to another gateway or using a fake one in tests means editing FeeService. The other options receive the dependency from outside (dependency injection).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this loosely coupled program print?',
      example: { title: 'program to an interface', code: 'interface Greeter { String greet(String n); }\nGreeter g = n -> "Hi " + n;\nSystem.out.println(g.greet("Asha")); // Hi Asha' },
      code: `interface Sender { String send(String msg); }

class SmsSender implements Sender {
    public String send(String msg) { return "SMS: " + msg; }
}
class EmailSender implements Sender {
    public String send(String msg) { return "Email: " + msg; }
}

class NotificationService {
    private final Sender sender;
    NotificationService(Sender sender) { this.sender = sender; }
    void notifyStudent(String msg) { System.out.println(sender.send(msg)); }
}

public class Main {
    public static void main(String[] args) {
        new NotificationService(new SmsSender()).notifyStudent("Fees due");
        new NotificationService(new EmailSender()).notifyStudent("Result out");
    }
}`,
      expected: 'SMS: Fees due\nEmail: Result out',
      explain: 'NotificationService depends only on the `Sender` interface; the concrete sender is **passed in**. That is dependency injection done by hand. Spring automates exactly this: it creates the SmsSender bean and passes it to the constructor for you.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are real **benefits of Spring**? (choose all that apply)',
      options: [
        'Loose coupling through dependency injection',
        'Easy unit testing, because dependencies can be replaced with mocks',
        'Declarative transactions with @Transactional',
        'Less JDBC boilerplate with JdbcTemplate',
        'It makes Java code run without a JVM',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Spring is a lightweight, modular framework: Core (IoC/DI), AOP, Data Access (JDBC, ORM, transactions), Web (MVC) and Test. It still runs on the normal JVM.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which Maven **artifactId** (groupId `org.springframework`) gives you the IoC container with `ApplicationContext` and annotation support?',
      example: { title: 'another Spring module', code: '<dependency>\n  <groupId>org.springframework</groupId>\n  <artifactId>spring-webmvc</artifactId>\n  <version>6.1.6</version>\n</dependency>' },
      accept: ['spring-context'],
      explain: '`spring-context` brings `ApplicationContext`, annotation config and component scanning, and pulls in `spring-core`, `spring-beans`, `spring-aop` and `spring-expression` transitively. Spring 6 requires **Java 17+**.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'How is **Spring Boot** related to the Spring Framework?',
      options: [
        'Spring Boot is a completely different framework that replaces Spring',
        'Spring Boot is built on top of Spring: it adds auto-configuration, starter dependencies and an embedded server',
        'Spring Boot is only for front-end development',
        'Spring Boot is an older version of Spring',
      ],
      answer: 1,
      explain: 'Boot uses the same Spring Framework underneath (IoC, MVC, transactions). It removes setup work through auto-configuration, starters and embedded Tomcat. Learning plain Spring first helps you understand what Boot configures for you.',
    },
  ],
};
