export default {
  id: 'day-01-introduction-to-spring',
  title: 'Introduction to Spring, Spring Modules, Why Spring',
  module: 'Module 1: Spring Core',
  day: 1,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Learn what the Spring Framework is, which problems it solves for enterprise Java developers, how its modules are organised, and how to create your first Spring 6 Maven project in Eclipse/STS and IntelliJ IDEA.`,
  objectives: [
    `Explain what Spring is and why companies use it`,
    `Describe tight coupling vs loose coupling with a simple example`,
    `List the main Spring modules (Core, AOP, Data Access, Web, Test)`,
    `Create a Spring 6 Maven project in Eclipse/STS and IntelliJ IDEA`,
    `Run a first Spring program that gets a bean from the ApplicationContext`,
  ],
  theory: [
    {
      heading: 'What is Spring?',
      content: `Spring is an open-source, lightweight framework for building Java applications. It was created by Rod Johnson in 2003 as a simpler alternative to heavy EJB (Enterprise JavaBeans). The heart of Spring is a container (the IoC container) that creates your objects, connects them together and manages their life. Real-world analogy: think of Spring as an event manager. Instead of you personally calling the caterer, the decorator and the DJ and making them talk to each other, you tell the event manager what you need, and the manager arranges everything and connects them. Your classes simply say "I need a PaymentService" and Spring hands it over.`,
      points: [
        `Open source, maintained by VMware/Broadcom (spring.io)`,
        `Spring 6 needs Java 17+ and uses the jakarta.* namespace (not javax.*)`,
        `POJO-based: your classes are normal Java classes, no special interfaces needed`,
        `Spring Boot (later course) is built ON TOP of the Spring Framework`,
      ],
    },
    {
      heading: 'The problem: tight coupling',
      content: `In plain Java, a class often creates its own dependencies with new. Example: class OrderService { private EmailSender sender = new EmailSender(); }. Now OrderService is glued to EmailSender. If tomorrow you want SmsSender, you must edit OrderService. Testing is also hard because you cannot replace EmailSender with a fake. This is called tight coupling. Diagram in words: OrderService ---creates---> EmailSender (hard wire). With Spring: OrderService ---needs---> Notifier (interface) <---implemented by--- EmailSender / SmsSender, and Spring plugs in the right one (loose coupling).`,
      tip: `Rule of thumb: program to interfaces, and let someone else (Spring) decide the implementation.`,
    },
    {
      heading: 'Why Spring? Key benefits',
      content: `Spring removes boilerplate code and gives ready-made solutions for common enterprise needs.`,
      points: [
        `Dependency Injection (DI): loose coupling, easy testing`,
        `AOP: put cross-cutting code (logging, security, transactions) in one place`,
        `JdbcTemplate: no more repetitive try/catch/close JDBC code`,
        `Declarative transactions with @Transactional`,
        `Spring MVC: clean web layer with DispatcherServlet`,
        `Easy integration with Hibernate/JPA, messaging, security, caching`,
        `Huge community, excellent documentation, used by most Java companies`,
      ],
    },
    {
      heading: 'Spring modules (the architecture)',
      content: `Spring is not one huge jar. It is a set of modules; you add only what you need. Picture a building: Core Container is the foundation, AOP is a layer that wraps around, Data Access and Web are floors built on top, and Test is the inspection team.`,
      points: [
        `Core Container: spring-core, spring-beans, spring-context, spring-expression (SpEL)`,
        `AOP: spring-aop, spring-aspects (AspectJ integration)`,
        `Data Access/Integration: spring-jdbc, spring-tx, spring-orm, spring-jms`,
        `Web: spring-web, spring-webmvc, spring-webflux, spring-websocket`,
        `Test: spring-test (JUnit 5 integration, MockMvc)`,
      ],
      tip: `spring-context pulls spring-core, spring-beans, spring-aop and spring-expression automatically, so for Core lessons one dependency is enough.`,
    },
    {
      heading: 'Spring vs Spring Boot (quick view)',
      content: `Spring Framework gives the building blocks, but you configure things yourself (XML or Java config, server setup, dependency versions). Spring Boot adds auto-configuration, starter dependencies and an embedded server so you can start in minutes. In this course we first learn plain Spring so that Spring Boot "magic" makes sense later.`,
    },
    {
      heading: 'Setting up a Spring 6 Maven project',
      content: `We use Maven to download Spring jars. Add spring-context to pom.xml. Eclipse/STS: File > New > Maven Project > tick "Create a simple project" > Group Id com.demo, Artifact Id spring-day1 > Finish, then edit pom.xml and press Alt+F5 (Maven > Update Project). IntelliJ IDEA: File > New > Project > Maven (Build system: Maven, JDK 17) > Create, edit pom.xml and click the Maven reload icon (or Ctrl+Shift+O).`,
      syntax: `<properties>
  <maven.compiler.source>17</maven.compiler.source>
  <maven.compiler.target>17</maven.compiler.target>
</properties>
<dependencies>
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>6.1.14</version>
  </dependency>
</dependencies>`,
      tip: `Common mistake: using Spring 5 tutorials with javax.annotation imports. In Spring 6 use jakarta.annotation (added via the jakarta.annotation-api dependency).`,
    },
  ],
  examples: [
    {
      title: 'Tight coupling vs loose coupling (plain Java)',
      scenario: `A shop sends order notifications. First version creates EmailSender inside the service; second version receives a Notifier from outside (manual DI). No Spring needed; run it in the browser IDE.`,
      steps: [
        'In IntelliJ: File > New > Java Class > Main (or in Eclipse: File > New > Class)',
        'Paste the code into Main.java',
        'Click Run ▶ and compare the two outputs',
      ],
      code: `interface Notifier { String send(String msg); }

class EmailNotifier implements Notifier {
    public String send(String msg) { return "EMAIL: " + msg; }
}

class SmsNotifier implements Notifier {
    public String send(String msg) { return "SMS: " + msg; }
}

// Tightly coupled: creates its own dependency
class TightOrderService {
    private EmailNotifier notifier = new EmailNotifier();
    void placeOrder(int id) { System.out.println(notifier.send("Order " + id + " placed")); }
}

// Loosely coupled: dependency comes from outside
class OrderService {
    private final Notifier notifier;
    OrderService(Notifier notifier) { this.notifier = notifier; }
    void placeOrder(int id) { System.out.println(notifier.send("Order " + id + " placed")); }
}

public class Main {
    public static void main(String[] args) {
        new TightOrderService().placeOrder(1);
        new OrderService(new EmailNotifier()).placeOrder(2);
        new OrderService(new SmsNotifier()).placeOrder(3);
    }
}`,
      java: {
        files: {
          'Main.java': `interface Notifier { String send(String msg); }

class EmailNotifier implements Notifier {
    public String send(String msg) { return "EMAIL: " + msg; }
}

class SmsNotifier implements Notifier {
    public String send(String msg) { return "SMS: " + msg; }
}

class TightOrderService {
    private EmailNotifier notifier = new EmailNotifier();
    void placeOrder(int id) { System.out.println(notifier.send("Order " + id + " placed")); }
}

class OrderService {
    private final Notifier notifier;
    OrderService(Notifier notifier) { this.notifier = notifier; }
    void placeOrder(int id) { System.out.println(notifier.send("Order " + id + " placed")); }
}

public class Main {
    public static void main(String[] args) {
        new TightOrderService().placeOrder(1);
        new OrderService(new EmailNotifier()).placeOrder(2);
        new OrderService(new SmsNotifier()).placeOrder(3);
    }
}`,
        },
      },
      result: `EMAIL: Order 1 placed
EMAIL: Order 2 placed
SMS: Order 3 placed`,
      explanation: `TightOrderService can only ever send email. OrderService works with any Notifier, so we switched to SMS without touching its code. Spring automates exactly this "passing from outside" step.`,
    },
    {
      title: 'First Spring 6 program (Maven project)',
      scenario: `Let Spring create a GreetingService object and give it back to us from the container.`,
      steps: [
        'Eclipse/STS: File > New > Maven Project > tick "Create a simple project" > Group Id com.demo, Artifact Id spring-day1 > Finish',
        'IntelliJ: File > New > Project > Maven, JDK 17, GroupId com.demo, ArtifactId spring-day1 > Create',
        'Add the spring-context dependency to pom.xml and reload Maven (Eclipse: Alt+F5, IntelliJ: Maven reload icon)',
        'Create package com.demo and classes GreetingService, AppConfig and MainApp under src/main/java',
        'Right-click MainApp > Run As > Java Application (Eclipse) or click the green ▶ next to main (IntelliJ)',
      ],
      code: `<!-- pom.xml -->
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.demo</groupId>
  <artifactId>spring-day1</artifactId>
  <version>1.0</version>
  <properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-context</artifactId>
      <version>6.1.14</version>
    </dependency>
  </dependencies>
</project>

// GreetingService.java
package com.demo;
public class GreetingService {
    public String greet(String name) { return "Hello " + name + ", welcome to Spring!"; }
}

// AppConfig.java
package com.demo;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
    @Bean
    public GreetingService greetingService() { return new GreetingService(); }
}

// MainApp.java
package com.demo;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class MainApp {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext(AppConfig.class)) {
            GreetingService gs = ctx.getBean(GreetingService.class);
            System.out.println(gs.greet("Ravi"));
        }
    }
}`,
      result: `Hello Ravi, welcome to Spring!`,
      explanation: `We never wrote new GreetingService() in main. Spring read AppConfig, created the bean and returned it from getBean(). try-with-resources closes the context. (Days 3–5 explain XML, annotation and Java config in detail.)`,
    },
    {
      title: 'Seeing which jars spring-context brings',
      scenario: `Understand the module structure by looking at the Maven dependency tree.`,
      steps: [
        'Eclipse: open pom.xml > Dependency Hierarchy tab',
        'IntelliJ: open the Maven tool window (right side) > expand Dependencies under spring-day1',
        'Or run in terminal: mvn dependency:tree',
      ],
      code: `[INFO] com.demo:spring-day1:jar:1.0
[INFO] \\- org.springframework:spring-context:jar:6.1.14:compile
[INFO]    +- org.springframework:spring-aop:jar:6.1.14:compile
[INFO]    +- org.springframework:spring-beans:jar:6.1.14:compile
[INFO]    +- org.springframework:spring-core:jar:6.1.14:compile
[INFO]    |  \\- org.springframework:spring-jcl:jar:6.1.14:compile
[INFO]    +- org.springframework:spring-expression:jar:6.1.14:compile
[INFO]    \\- io.micrometer:micrometer-observation:jar:1.12.11:compile`,
      result: `The tree shows spring-context depends on spring-aop, spring-beans, spring-core, spring-expression (Core Container + AOP modules).`,
      explanation: `One dependency gives you the whole Core Container. Later we add spring-jdbc, spring-tx, spring-orm and spring-webmvc as needed. (Exact micrometer version may differ slightly.)`,
    },
  ],
  interview: [
    { q: 'What is the Spring Framework?', a: 'Spring is a lightweight, open-source Java framework whose core is an IoC container that creates and wires objects (beans). It also provides AOP, data access, transactions, MVC web and testing support.', level: 'Easy' },
    { q: 'Why is Spring called lightweight?', a: 'You use plain POJOs, you add only the modules you need, and it does not need a heavy application server like EJB did. It can run in a simple main() method.', level: 'Easy' },
    { q: 'What is tight coupling and how does Spring solve it?', a: 'Tight coupling is when a class creates its own concrete dependency with new. Spring solves it with Dependency Injection: the class depends on an interface and the container supplies the implementation.', level: 'Easy' },
    { q: 'Name the main Spring modules.', a: 'Core Container (core, beans, context, expression), AOP, Data Access/Integration (jdbc, tx, orm, jms), Web (web, webmvc, webflux, websocket) and Test.', level: 'Easy' },
    { q: 'What is a Spring bean?', a: 'Any object that is created, configured and managed by the Spring IoC container.', level: 'Easy' },
    { q: 'What changed in Spring 6?', a: 'Java 17 baseline, migration from javax.* to jakarta.* (Jakarta EE 9+), AOT/native image support, observability with Micrometer, HTTP interface clients.', level: 'Medium' },
    { q: 'Difference between Spring and Spring Boot?', a: 'Spring provides the framework features; you configure everything manually. Spring Boot is built on Spring and adds auto-configuration, starters, embedded servers and production features like Actuator.', level: 'Medium' },
    { q: 'Which dependency do you need for a basic Spring Core application?', a: 'org.springframework:spring-context; it brings spring-core, spring-beans, spring-aop and spring-expression transitively.', level: 'Easy' },
    { q: 'What is a POJO?', a: 'Plain Old Java Object: a normal class that does not extend or implement framework-specific types. Spring works with POJOs.', level: 'Easy' },
    { q: 'Is Spring only for web applications?', a: 'No. Spring Core can be used in console apps, batch jobs, desktop apps and web apps.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a plain Java program with interface PaymentMethod and two implementations (UpiPayment, CardPayment). A Checkout class should receive the PaymentMethod in its constructor. Pay 500 with both.',
      hint: 'Same pattern as OrderService(Notifier).',
      solution: `interface PaymentMethod { String pay(int amount); }
class UpiPayment implements PaymentMethod { public String pay(int a) { return "Paid " + a + " via UPI"; } }
class CardPayment implements PaymentMethod { public String pay(int a) { return "Paid " + a + " via Card"; } }
class Checkout {
    private final PaymentMethod method;
    Checkout(PaymentMethod method) { this.method = method; }
    void complete(int amount) { System.out.println(method.pay(amount)); }
}
public class Main {
    public static void main(String[] args) {
        new Checkout(new UpiPayment()).complete(500);
        new Checkout(new CardPayment()).complete(500);
    }
}`,
    },
    {
      task: 'Create a Spring 6 Maven project (spring-context 6.1.x) in your IDE and print "Spring is ready" from a bean method.',
      hint: 'Use @Configuration + @Bean and AnnotationConfigApplicationContext.',
      solution: `@Configuration
public class AppConfig {
    @Bean public Hello hello() { return new Hello(); }
}
public class Hello { public void say() { System.out.println("Spring is ready"); } }
public class MainApp {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext(AppConfig.class)) {
            ctx.getBean(Hello.class).say();
        }
    }
}`,
    },
    {
      task: 'Run mvn dependency:tree (or view the Dependency Hierarchy) and write down the 4 Core Container jars.',
      hint: 'Look below spring-context.',
      solution: `spring-core, spring-beans, spring-context, spring-expression (plus spring-aop and spring-jcl come along).`,
    },
    {
      task: 'Write a table comparing Spring and Spring Boot in 5 rows (configuration, server, dependencies, startup speed, production features).',
      hint: 'Think manual vs automatic.',
      solution: `Configuration: manual XML/Java | auto-configuration
Server: deploy WAR to external Tomcat | embedded Tomcat
Dependencies: pick each jar + version | starters with managed versions
Startup: more setup steps | create via start.spring.io in minutes
Production: add yourself | Actuator health/metrics built in`,
    },
  ],
  quiz: [
    { question: 'Who created the Spring Framework?', options: ['James Gosling', 'Rod Johnson', 'Gavin King', 'Martin Fowler'], answer: 1, explanation: 'Rod Johnson wrote "Expert One-on-One J2EE Design and Development" which led to Spring.' },
    { question: 'Which Java version is the minimum for Spring 6?', options: ['Java 8', 'Java 11', 'Java 17', 'Java 21'], answer: 2, explanation: 'Spring Framework 6 has a Java 17 baseline.' },
    { question: 'Which module contains BeanFactory?', options: ['spring-beans', 'spring-web', 'spring-tx', 'spring-jdbc'], answer: 0, explanation: 'BeanFactory lives in spring-beans; ApplicationContext is in spring-context.' },
    { question: 'Spring 6 uses which namespace for EE APIs?', options: ['javax.*', 'sun.*', 'java.ee.*', 'jakarta.*'], answer: 3, explanation: 'Spring 6 moved to Jakarta EE 9+, so imports are jakarta.*.' },
    { question: 'What is the main benefit of Dependency Injection?', options: ['Faster CPU', 'Loose coupling and easier testing', 'Smaller jar files', 'No need for interfaces'], answer: 1, explanation: 'DI lets classes depend on abstractions and receive implementations from outside.' },
  ],
};
