export default {
  id: 'day-01-introduction-to-spring-boot',
  title: 'Introduction to Spring Boot, Spring vs Spring Boot, Auto-configuration and Starters',
  module: 'Module 1: Spring Boot Basics',
  day: 1,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Learn what Spring Boot is, why it was created, how it differs from the plain Spring Framework, and how auto-configuration and starter dependencies let you build a running web app in minutes.',
  objectives: [
    'Explain what Spring Boot is and which problems of plain Spring it solves',
    'Compare Spring Framework and Spring Boot point by point',
    'Understand auto-configuration and how Spring Boot decides which beans to create',
    'Use starter dependencies such as spring-boot-starter-web and spring-boot-starter-data-jpa',
    'Build and run a first "Hello Spring Boot" REST endpoint with the embedded Tomcat server',
  ],
  theory: [
    {
      heading: 'What is Spring Boot?',
      content:
        'Spring Boot is a project built on top of the Spring Framework that makes it fast and easy to create stand-alone, production-ready Spring applications. It does not replace Spring; it uses Spring underneath and removes most of the boring setup work.\n\nReal-world analogy: Spring Framework is like buying all the parts of a computer (motherboard, RAM, CPU, cabinet) and assembling them yourself. Spring Boot is like buying a ready-made laptop: the same parts are inside, but they are already assembled and configured with sensible defaults. You switch it on and start working, and you can still open it up and change parts if you want.\n\nSpring Boot 3.x requires Java 17 or higher and uses Jakarta EE 9+ packages (jakarta.* instead of javax.*).',
      points: [
        'Stand-alone: runs with a simple main() method, no external server installation needed',
        'Embedded server: Tomcat (default), Jetty or Undertow is packed inside the JAR',
        'Opinionated defaults: sensible configuration chosen for you, override only what you need',
        'Starters: one dependency brings a whole set of compatible libraries',
        'Auto-configuration: beans are configured automatically based on the classpath',
        'Production-ready: Actuator gives health checks and metrics out of the box',
        'No XML configuration required',
      ],
    },
    {
      heading: 'Spring vs Spring Boot',
      content:
        'In a plain Spring MVC project you have to: add many dependencies with matching versions, write web.xml or a WebApplicationInitializer, configure DispatcherServlet, a ViewResolver, a DataSource, an EntityManagerFactory, a TransactionManager, build a WAR file and deploy it to an external Tomcat. In Spring Boot most of that disappears.\n\nDiagram in words:\n  Plain Spring:  Your code + Manual config (XML/Java) + Dependency versions + External Tomcat -> WAR deploy\n  Spring Boot:   Your code + application.properties -> java -jar app.jar (Tomcat inside)',
      points: [
        'Configuration: Spring = manual (XML/Java config); Spring Boot = auto-configuration',
        'Dependencies: Spring = add each library and pick versions; Boot = starters + version management by spring-boot-starter-parent',
        'Server: Spring = deploy WAR to external server; Boot = embedded server, runnable JAR',
        'Boilerplate: Spring = a lot; Boot = very little',
        'Production features: Spring = add manually; Boot = Actuator ready',
        'Development speed: Boot is much faster, ideal for microservices and REST APIs',
      ],
      tip: 'Interview line: "Spring Boot = Spring Framework + auto-configuration + starters + embedded server + production-ready features."',
    },
    {
      heading: 'Auto-configuration',
      content:
        'Auto-configuration means Spring Boot looks at (1) the JARs present on the classpath, (2) the beans you already defined, and (3) the properties you set, and then automatically creates the beans you most likely need.\n\nExample: if spring-webmvc and Tomcat are on the classpath, Boot configures a DispatcherServlet, an embedded Tomcat on port 8080 and Jackson for JSON. If a database driver and spring-data-jpa are present, it creates a DataSource, an EntityManagerFactory and a TransactionManager.\n\nHow it works internally: @SpringBootApplication includes @EnableAutoConfiguration. Spring Boot reads the file META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports inside spring-boot-autoconfigure.jar, which lists about 150 auto-configuration classes. Each class is guarded by conditions such as @ConditionalOnClass, @ConditionalOnMissingBean and @ConditionalOnProperty, so it only activates when it makes sense.\n\nAnalogy: a smart home. When you walk into a dark room (condition), the light switches on (bean created). If you already switched on your own lamp (your own bean), the smart light stays off (@ConditionalOnMissingBean).',
      syntax: '@AutoConfiguration\n@ConditionalOnClass(DataSource.class)\n@ConditionalOnMissingBean(DataSource.class)\npublic class DataSourceAutoConfiguration { ... }',
      points: [
        '@ConditionalOnClass: activate only if a class is on the classpath',
        '@ConditionalOnMissingBean: activate only if you have NOT defined that bean yourself (your bean always wins)',
        '@ConditionalOnProperty: activate based on a property value',
        'See the report: run with debug=true in application.properties to print the CONDITIONS EVALUATION REPORT',
        'Exclude one: @SpringBootApplication(exclude = DataSourceAutoConfiguration.class)',
      ],
    },
    {
      heading: 'Starter Dependencies',
      content:
        'A starter is a single Maven dependency that pulls in a curated, version-compatible group of libraries for one purpose. You never write versions for them because spring-boot-starter-parent (or the Spring Boot BOM) manages them.\n\nAnalogy: a starter is like a "meal combo" at a restaurant. You ask for "Burger Combo" and you get the burger, fries and drink that go well together, instead of ordering each item separately.',
      points: [
        'spring-boot-starter-web: Spring MVC, embedded Tomcat, Jackson (REST APIs and web apps)',
        'spring-boot-starter-data-jpa: Spring Data JPA, Hibernate 6, HikariCP connection pool',
        'spring-boot-starter-validation: Hibernate Validator (Bean Validation, @NotBlank, @Email)',
        'spring-boot-starter-security: Spring Security',
        'spring-boot-starter-test: JUnit 5, Mockito, AssertJ, Spring Test',
        'spring-boot-starter-actuator: health, metrics and info endpoints',
        'spring-boot-devtools: automatic restart and live reload during development',
        'Naming rule: official starters are spring-boot-starter-*; third-party ones are *-spring-boot-starter',
      ],
    },
    {
      heading: 'How a Spring Boot Application Starts',
      content:
        'Step by step, in words:\n1. JVM calls main() in your class annotated with @SpringBootApplication.\n2. SpringApplication.run() creates the ApplicationContext (the IoC container).\n3. Component scanning finds your @Component, @Service, @Repository and @RestController classes in the main package and its sub-packages.\n4. Auto-configuration adds the framework beans (DispatcherServlet, Jackson ObjectMapper, DataSource, ...).\n5. Embedded Tomcat starts on port 8080.\n6. The app is ready: you see "Started DemoApplication in 2.1 seconds" in the console.',
      points: [
        'Common mistake: putting controllers in a package that is NOT under the main class package, so they are never scanned (404 error)',
        'Common mistake: port 8080 already in use -> change server.port=8081 in application.properties',
        'Common mistake: using javax.persistence or javax.servlet imports in Boot 3; use jakarta.*',
      ],
    },
  ],
  examples: [
    {
      title: 'Your First Spring Boot REST Application',
      scenario: 'Create a minimal Spring Boot 3 web application that returns a greeting at http://localhost:8080/hello.',
      steps: [
        'Open https://start.spring.io: Project = Maven, Language = Java, Spring Boot = 3.3.x, Group = com.example, Artifact = demo, Packaging = Jar, Java = 17',
        'Add dependency "Spring Web" and click GENERATE; unzip demo.zip',
        'IntelliJ IDEA: File > Open > select the demo folder (the one with pom.xml) > Trust Project; wait for Maven import to finish',
        'Eclipse/STS: File > Import > Maven > Existing Maven Projects > Browse to demo folder > Finish',
        'Create class HelloController in package com.example.demo (right-click package > New > Java Class) and type the code',
        'Run DemoApplication: IntelliJ: click the green ▶ next to main(); STS: right-click project > Run As > Spring Boot App',
        'Open http://localhost:8080/hello in the browser or send GET in Postman',
      ],
      code: `// ===== pom.xml (important parts) =====
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.4</version>
    <relativePath/>
</parent>
<groupId>com.example</groupId>
<artifactId>demo</artifactId>
<version>0.0.1-SNAPSHOT</version>
<properties>
    <java.version>17</java.version>
</properties>
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>

// ===== src/main/java/com/example/demo/DemoApplication.java =====
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}

// ===== src/main/java/com/example/demo/HelloController.java =====
package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring Boot!";
    }
}

// ===== src/main/resources/application.properties =====
spring.application.name=demo
server.port=8080`,
      result: `Console:
  Tomcat initialized with port 8080 (http)
  Tomcat started on port 8080 (http) with context path '/'
  Started DemoApplication in 1.9 seconds (process running for 2.3)

Postman: GET http://localhost:8080/hello
Status: 200 OK
Body: Hello, Spring Boot!`,
      explanation: 'Only two Java classes and no server setup. spring-boot-starter-web brought Spring MVC, Jackson and embedded Tomcat. Auto-configuration created the DispatcherServlet and started Tomcat. @RestController + @GetMapping mapped the URL /hello to the hello() method and the String was written directly to the response body.',
    },
    {
      title: 'Returning JSON Automatically',
      scenario: 'Return a Java object from a controller and see Spring Boot convert it to JSON using Jackson (added by the web starter).',
      steps: [
        'In the same project create a record Greeting in com.example.demo (IntelliJ: New > Java Class > choose Record)',
        'Add a new method to HelloController',
        'Restart the app (or let DevTools restart it)',
        'In Postman: New > HTTP Request > GET http://localhost:8080/greet?name=Ravi > Send',
      ],
      code: `// ===== Greeting.java =====
package com.example.demo;

public record Greeting(int id, String message, String language) { }

// ===== HelloController.java (add this method) =====
@GetMapping("/greet")
public Greeting greet(@RequestParam(defaultValue = "Guest") String name) {
    return new Greeting(1, "Welcome " + name, "Java 17");
}
// import org.springframework.web.bind.annotation.RequestParam;`,
      result: `GET http://localhost:8080/greet?name=Ravi
Status: 200 OK
Content-Type: application/json
{
  "id": 1,
  "message": "Welcome Ravi",
  "language": "Java 17"
}`,
      explanation: 'Because Jackson is on the classpath, Spring Boot auto-configured an HttpMessageConverter that turns any returned object into JSON. You wrote zero configuration for this. Records work perfectly with Jackson in Boot 3.',
    },
    {
      title: 'Seeing Auto-configuration in Action (debug report and exclude)',
      scenario: 'Print the conditions evaluation report and exclude one auto-configuration to understand how Boot decides which beans to create.',
      steps: [
        'Add debug=true to src/main/resources/application.properties',
        'Run the application and scroll the console to "CONDITIONS EVALUATION REPORT"',
        'Look at "Positive matches" (activated) and "Negative matches" (skipped) sections',
        'Optionally add spring-boot-starter-data-jpa without a database URL: the app fails with "Failed to configure a DataSource"; then exclude DataSourceAutoConfiguration as shown and run again',
      ],
      code: `// ===== application.properties =====
debug=true

// ===== DemoApplication.java (exclude example) =====
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}`,
      result: `============================
CONDITIONS EVALUATION REPORT
============================
Positive matches:
-----------------
   DispatcherServletAutoConfiguration matched:
      - @ConditionalOnClass found required class 'org.springframework.web.servlet.DispatcherServlet'
   JacksonAutoConfiguration matched:
      - @ConditionalOnClass found required class 'com.fasterxml.jackson.databind.ObjectMapper'
Negative matches:
-----------------
   DataSourceAutoConfiguration:
      Did not match: ... (excluded)
...
Started DemoApplication in 2.0 seconds`,
      explanation: 'The report shows exactly which auto-configurations were applied and why. This is the number one tool for debugging "why is this bean (not) created?". Excluding is useful when a starter is on the classpath but you do not want its auto-configuration yet.',
    },
    {
      title: 'Pure Java Demo: Simulating @ConditionalOnMissingBean',
      scenario: 'A plain Java program that mimics how auto-configuration creates a default bean only when the user has not provided one.',
      steps: [
        'IntelliJ: File > New > Project > Java (no build system) > create Main.java',
        'Eclipse: File > New > Java Project > New > Class > Main',
        'Type the code and click Run ▶',
      ],
      code: `import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    static Map<String, String> context = new LinkedHashMap<>();

    static void autoConfigure(String beanName, String defaultImpl) {
        if (!context.containsKey(beanName)) {
            context.put(beanName, defaultImpl);
            System.out.println("Auto-configured " + beanName + " -> " + defaultImpl);
        } else {
            System.out.println("Skipped " + beanName + " (user bean found)");
        }
    }

    public static void main(String[] args) {
        // the user defines their own ObjectMapper bean
        context.put("objectMapper", "CustomObjectMapper");

        autoConfigure("dataSource", "HikariDataSource");
        autoConfigure("objectMapper", "DefaultObjectMapper");
        autoConfigure("dispatcherServlet", "DispatcherServlet");

        System.out.println("Final beans: " + context);
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    static Map<String, String> context = new LinkedHashMap<>();

    static void autoConfigure(String beanName, String defaultImpl) {
        if (!context.containsKey(beanName)) {
            context.put(beanName, defaultImpl);
            System.out.println("Auto-configured " + beanName + " -> " + defaultImpl);
        } else {
            System.out.println("Skipped " + beanName + " (user bean found)");
        }
    }

    public static void main(String[] args) {
        // the user defines their own ObjectMapper bean
        context.put("objectMapper", "CustomObjectMapper");

        autoConfigure("dataSource", "HikariDataSource");
        autoConfigure("objectMapper", "DefaultObjectMapper");
        autoConfigure("dispatcherServlet", "DispatcherServlet");

        System.out.println("Final beans: " + context);
    }
}`,
        },
      },
      result: `Auto-configured dataSource -> HikariDataSource
Skipped objectMapper (user bean found)
Auto-configured dispatcherServlet -> DispatcherServlet
Final beans: {objectMapper=CustomObjectMapper, dataSource=HikariDataSource, dispatcherServlet=DispatcherServlet}`,
      explanation: 'This is the idea behind @ConditionalOnMissingBean: the framework only supplies a default when you have not supplied your own. LinkedHashMap keeps insertion order, so the output order is fixed.',
    },
  ],
  interview: [
    { q: 'What is Spring Boot?', a: 'Spring Boot is an extension of the Spring Framework that simplifies building stand-alone, production-ready applications using auto-configuration, starter dependencies, an embedded server and Actuator, with minimal or no XML configuration.', level: 'Easy' },
    { q: 'What is the difference between Spring and Spring Boot?', a: 'Spring is the core framework (IoC, DI, MVC, AOP) that needs manual configuration and an external server. Spring Boot is built on Spring and adds auto-configuration, starters, version management, an embedded server and production-ready features, so you can run an app with java -jar.', level: 'Easy' },
    { q: 'What is auto-configuration and how does it work?', a: '@EnableAutoConfiguration (inside @SpringBootApplication) loads the auto-configuration classes listed in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports. Each one is guarded by @Conditional annotations (@ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty) so beans are created only when the right classes are present and you have not defined your own.', level: 'Medium' },
    { q: 'What is a starter? Name five.', a: 'A starter is a dependency descriptor that brings a tested set of compatible libraries for a feature. Examples: spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-security, spring-boot-starter-test, spring-boot-starter-validation, spring-boot-starter-actuator.', level: 'Easy' },
    { q: 'Which embedded servers does Spring Boot support and which is the default?', a: 'Tomcat (default with starter-web), Jetty and Undertow. To switch, exclude spring-boot-starter-tomcat and add spring-boot-starter-jetty or spring-boot-starter-undertow. Reactive apps (WebFlux) use Netty by default.', level: 'Medium' },
    { q: 'How do you disable a specific auto-configuration?', a: 'Use @SpringBootApplication(exclude = DataSourceAutoConfiguration.class) or the property spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.', level: 'Medium' },
    { q: 'How can you see which auto-configurations were applied?', a: 'Set debug=true in application.properties (or run with --debug) to print the Conditions Evaluation Report, or use the Actuator /actuator/conditions endpoint.', level: 'Medium' },
    { q: 'What is the minimum Java version for Spring Boot 3?', a: 'Java 17. Spring Boot 3 is based on Spring Framework 6 and Jakarta EE 9+, so imports changed from javax.* to jakarta.*.', level: 'Easy' },
    { q: 'If you define your own DataSource bean, will Spring Boot still create one?', a: 'No. DataSourceAutoConfiguration is guarded by @ConditionalOnMissingBean, so your bean takes priority and the auto-configured one is backed off.', level: 'Hard' },
    { q: 'What does spring-boot-starter-parent provide?', a: 'Dependency version management (BOM), default Java version, UTF-8 encoding, resource filtering and plugin configuration such as spring-boot-maven-plugin, so you do not write versions for Boot-managed dependencies.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a Spring Boot app with an endpoint GET /about that returns your name and course as plain text.',
      hint: 'Use @RestController and @GetMapping("/about").',
      solution: `package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AboutController {

    @GetMapping("/about")
    public String about() {
        return "Name: Asha | Course: Java Full Stack";
    }
}`,
    },
    {
      task: 'Change the server port to 9090 and the context path to /api, then call GET http://localhost:9090/api/about.',
      hint: 'Use server.port and server.servlet.context-path in application.properties.',
      solution: `# src/main/resources/application.properties
server.port=9090
server.servlet.context-path=/api

# Test in Postman:
# GET http://localhost:9090/api/about  -> 200 OK  "Name: Asha | Course: Java Full Stack"`,
    },
    {
      task: 'Create an endpoint GET /course that returns a JSON object with fields name, durationDays and topics (a list of strings).',
      hint: 'Return a record; Jackson converts it to JSON.',
      solution: `package com.example.demo;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CourseController {

    public record Course(String name, int durationDays, List<String> topics) { }

    @GetMapping("/course")
    public Course course() {
        return new Course("Spring Boot", 25, List.of("REST", "JPA", "Security"));
    }
}
// Response: {"name":"Spring Boot","durationDays":25,"topics":["REST","JPA","Security"]}`,
    },
    {
      task: 'Switch the embedded server from Tomcat to Jetty.',
      hint: 'Exclude spring-boot-starter-tomcat from starter-web and add spring-boot-starter-jetty.',
      solution: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jetty</artifactId>
</dependency>
<!-- Console now shows: Jetty started on port 8080 -->`,
    },
  ],
  quiz: [
    {
      question: 'Which annotation inside @SpringBootApplication triggers auto-configuration?',
      options: ['@ComponentScan', '@EnableAutoConfiguration', '@Configuration', '@EnableWebMvc'],
      answer: 1,
      explanation: '@EnableAutoConfiguration loads the auto-configuration classes; @ComponentScan scans your own classes.',
    },
    {
      question: 'What is the default embedded server added by spring-boot-starter-web?',
      options: ['Jetty', 'Undertow', 'Netty', 'Tomcat'],
      answer: 3,
      explanation: 'spring-boot-starter-web includes spring-boot-starter-tomcat by default.',
    },
    {
      question: 'Minimum Java version for Spring Boot 3.x is:',
      options: ['Java 17', 'Java 8', 'Java 11', 'Java 21'],
      answer: 0,
      explanation: 'Spring Boot 3 / Spring 6 require Java 17 as baseline.',
    },
    {
      question: 'You define your own ObjectMapper bean. What does Spring Boot do?',
      options: ['Throws an error for duplicate beans', 'Creates its own anyway and picks randomly', 'Backs off and uses your bean', 'Ignores your bean'],
      answer: 2,
      explanation: 'Auto-configurations use @ConditionalOnMissingBean, so user-defined beans win.',
    },
    {
      question: 'Which property prints the conditions evaluation report?',
      options: ['logging.level=ALL', 'spring.report=true', 'server.debug=on', 'debug=true'],
      answer: 3,
      explanation: 'debug=true (or the --debug argument) prints the auto-configuration report at startup.',
    },
  ],
};
