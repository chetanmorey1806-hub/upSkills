export default {
  id: 'day-03-springbootapplication-properties-profiles',
  title: '@SpringBootApplication, application.properties vs application.yml, Profiles',
  module: 'Module 1: Spring Boot Basics',
  day: 3,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Understand what @SpringBootApplication really contains, write configuration in both .properties and .yml formats, and use profiles (dev, test, prod) to run the same code with different settings.',
  objectives: [
    'Break @SpringBootApplication into @SpringBootConfiguration, @EnableAutoConfiguration and @ComponentScan',
    'Write common settings in application.properties and application.yml',
    'Create profile-specific files and activate a profile from properties, IDE, command line and environment variables',
    'Use @Profile to create beans only for a specific environment',
    'Know the configuration priority order (which value wins)',
  ],
  theory: [
    {
      heading: '@SpringBootApplication Explained',
      content:
        '@SpringBootApplication is a convenience annotation placed on the main class. It is a combination of three annotations:\n1. @SpringBootConfiguration - a specialised @Configuration, so the main class can declare @Bean methods.\n2. @EnableAutoConfiguration - turns on auto-configuration.\n3. @ComponentScan - scans the current package and all sub-packages for @Component, @Service, @Repository, @Controller, @RestController, @Configuration.\n\nAnalogy: it is like a "combo switch" in a house that turns on the main power, the automatic lights and the security scan with one press.',
      syntax: '@SpringBootApplication(\n    scanBasePackages = {"com.example.app", "com.example.shared"},\n    exclude = { DataSourceAutoConfiguration.class }\n)\npublic class App { public static void main(String[] a) { SpringApplication.run(App.class, a); } }',
      points: [
        'Place the main class in the ROOT package (e.g. com.example.app) so everything below is scanned',
        'scanBasePackages adds extra packages to scan',
        'SpringApplication.run() returns ConfigurableApplicationContext which you can use to get beans',
      ],
    },
    {
      heading: 'application.properties vs application.yml',
      content:
        'Both files live in src/main/resources and hold external configuration. Properties uses flat key=value lines. YAML (YAML Ain\'t Markup Language) uses indentation to show hierarchy, which is shorter when many keys share a prefix.\n\nSame config in both formats:\n  properties:  spring.datasource.url=jdbc:mysql://localhost:3306/school\n  yml:\n    spring:\n      datasource:\n        url: jdbc:mysql://localhost:3306/school\n\nIf both files exist, both are loaded; for the same key, .properties wins over .yml. Do not keep both in real projects - choose one.',
      points: [
        'YAML rules: use spaces (never tabs), 2 spaces per level is common, a space after the colon is mandatory',
        'Lists in YAML: lines starting with "- "; in properties: key[0]=a, key[1]=b or key=a,b',
        'YAML supports multiple documents in one file separated by --- (each can have spring.config.activate.on-profile)',
        'Comments: # in both formats',
        'Common mistake: "url:jdbc..." without a space after colon breaks YAML',
      ],
    },
    {
      heading: 'Profiles',
      content:
        'A profile is a named set of configuration for one environment. The same JAR runs in development with an H2/local MySQL database and in production with the production database, just by switching the active profile.\n\nAnalogy: your phone\'s sound profiles - "Office" (silent), "Home" (loud), "Meeting" (vibrate). Same phone, different settings.\n\nFile naming: application-{profile}.properties, e.g. application-dev.properties, application-prod.properties. The common application.properties is always loaded first; the active profile file is loaded on top and overrides matching keys.',
      points: [
        'Activate in application.properties: spring.profiles.active=dev',
        'Command line: java -jar app.jar --spring.profiles.active=prod',
        'JVM option: -Dspring.profiles.active=prod',
        'Environment variable: SPRING_PROFILES_ACTIVE=prod',
        'IntelliJ: Run > Edit Configurations > Active profiles field (Ultimate) or Program arguments --spring.profiles.active=dev',
        'STS: Run > Run Configurations > Spring Boot App > Profile dropdown',
        'Multiple profiles: spring.profiles.active=dev,mysql',
        'If none is active, the profile "default" is used',
      ],
    },
    {
      heading: '@Profile on Beans',
      content:
        '@Profile("dev") on a @Component or @Bean method means "create this bean only when dev is active". You can negate: @Profile("!prod"). This is useful for things like a fake email sender in dev and a real SMTP sender in prod.',
      syntax: '@Service\n@Profile("dev")\npublic class ConsoleMailService implements MailService { ... }\n\n@Service\n@Profile("prod")\npublic class SmtpMailService implements MailService { ... }',
    },
    {
      heading: 'Configuration Priority (Who Wins?)',
      content:
        'Spring Boot reads configuration from many sources. Higher in the list overrides lower:\n1. Command-line arguments (--server.port=9000)\n2. Java system properties (-Dserver.port=9000)\n3. OS environment variables (SERVER_PORT=9000)\n4. Profile-specific files outside the JAR, then inside the JAR (application-prod.properties)\n5. application.properties / .yml outside the JAR (e.g. ./config/), then inside the JAR\n6. Default values in code\n\nThis lets operations teams change settings on a server without rebuilding the JAR.',
      tip: 'Environment variable naming: replace dots with underscores and use uppercase. spring.datasource.password -> SPRING_DATASOURCE_PASSWORD.',
    },
  ],
  examples: [
    {
      title: 'Same Configuration in .properties and .yml',
      scenario: 'Configure port, app name, a custom property and logging level, first in properties then in YAML, and read the custom property in a controller.',
      steps: [
        'Open src/main/resources/application.properties and type the properties version',
        'To try YAML: rename the file to application.yml (IntelliJ: right-click > Refactor > Rename; STS: right-click > Rename) and replace the content with the YAML version',
        'Create InfoController in the controller package',
        'Run and call GET http://localhost:8081/info in Postman',
      ],
      code: `# ===== application.properties =====
spring.application.name=student-api
server.port=8081
app.welcome-message=Welcome to Student API
logging.level.com.example=DEBUG

# ===== application.yml (same settings) =====
spring:
  application:
    name: student-api
server:
  port: 8081
app:
  welcome-message: Welcome to Student API
logging:
  level:
    com.example: DEBUG

// ===== controller/InfoController.java =====
package com.example.studentapi.controller;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class InfoController {

    @Value("\${spring.application.name}")
    private String appName;

    @Value("\${app.welcome-message}")
    private String message;

    @GetMapping("/info")
    public Map<String, String> info() {
        return Map.of("app", appName, "message", message);
    }
}`,
      result: `GET http://localhost:8081/info
Status: 200 OK
{
  "app": "student-api",
  "message": "Welcome to Student API"
}`,
      explanation: 'Both formats produce exactly the same configuration. @Value("${key}") injects a property value into a field. YAML is easier to read for nested keys; properties is easier for copy-paste of single keys.',
    },
    {
      title: 'dev and prod Profiles with Different Ports and Messages',
      scenario: 'Run the same app with port 8081 in dev and 8080 in prod, and show which profile is active in an endpoint.',
      steps: [
        'Create application-dev.properties and application-prod.properties in src/main/resources',
        'Set spring.profiles.active=dev in application.properties',
        'Create ProfileController that uses Environment.getActiveProfiles()',
        'Run normally: dev is used. Then run with --spring.profiles.active=prod',
        'IntelliJ: Run > Edit Configurations > Program arguments: --spring.profiles.active=prod',
        'STS: Run As > Run Configurations > Spring Boot App > Profile: prod > Run',
      ],
      code: `# ===== application.properties (common) =====
spring.application.name=student-api
spring.profiles.active=dev
app.env-message=Default environment

# ===== application-dev.properties =====
server.port=8081
app.env-message=Running in DEVELOPMENT
logging.level.root=DEBUG

# ===== application-prod.properties =====
server.port=8080
app.env-message=Running in PRODUCTION
logging.level.root=WARN

// ===== controller/ProfileController.java =====
package com.example.studentapi.controller;

import java.util.Arrays;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProfileController {

    private final Environment env;

    @Value("\${app.env-message}")
    private String envMessage;

    public ProfileController(Environment env) {
        this.env = env;
    }

    @GetMapping("/profile")
    public Map<String, String> profile() {
        return Map.of(
            "activeProfiles", Arrays.toString(env.getActiveProfiles()),
            "message", envMessage);
    }
}`,
      result: `Run 1 (default, dev active):
Console: The following 1 profile is active: "dev"
GET http://localhost:8081/profile
{ "activeProfiles": "[dev]", "message": "Running in DEVELOPMENT" }

Run 2 (--spring.profiles.active=prod):
Console: The following 1 profile is active: "prod"
GET http://localhost:8080/profile
{ "activeProfiles": "[prod]", "message": "Running in PRODUCTION" }`,
      explanation: 'The common file is loaded first, then the profile file overrides server.port and app.env-message. The command-line argument overrides spring.profiles.active from the file because command-line arguments have higher priority.',
    },
    {
      title: '@Profile Beans: Fake vs Real Notification Service',
      scenario: 'In dev, print notifications to the console; in prod, use a (simulated) SMTP sender. The controller depends only on the interface.',
      steps: [
        'Create interface NotificationService in package service',
        'Create ConsoleNotificationService with @Profile("dev") and SmtpNotificationService with @Profile("prod")',
        'Create NotifyController with POST /notify',
        'Postman: POST http://localhost:8081/notify, Body > raw > JSON',
        'Switch profile to prod and send again',
      ],
      code: `// ===== service/NotificationService.java =====
package com.example.studentapi.service;

public interface NotificationService {
    String send(String to, String text);
}

// ===== service/ConsoleNotificationService.java =====
package com.example.studentapi.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("dev")
public class ConsoleNotificationService implements NotificationService {
    @Override
    public String send(String to, String text) {
        System.out.println("[DEV] To " + to + ": " + text);
        return "Printed to console (dev)";
    }
}

// ===== service/SmtpNotificationService.java =====
package com.example.studentapi.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("prod")
public class SmtpNotificationService implements NotificationService {
    @Override
    public String send(String to, String text) {
        // real code would use JavaMailSender here
        return "Email sent via SMTP to " + to + " (prod)";
    }
}

// ===== controller/NotifyController.java =====
package com.example.studentapi.controller;

import java.util.Map;
import com.example.studentapi.service.NotificationService;
import org.springframework.web.bind.annotation.*;

@RestController
public class NotifyController {

    private final NotificationService notificationService;

    public NotifyController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public record NotifyRequest(String to, String text) { }

    @PostMapping("/notify")
    public Map<String, String> notify(@RequestBody NotifyRequest req) {
        return Map.of("result", notificationService.send(req.to(), req.text()));
    }
}`,
      result: `POST http://localhost:8081/notify   (dev)
Request body:
{ "to": "ravi@example.com", "text": "Your fee is due" }

Response 200 OK:
{ "result": "Printed to console (dev)" }
Console: [DEV] To ravi@example.com: Your fee is due

Same request with prod active (port 8080):
{ "result": "Email sent via SMTP to ravi@example.com (prod)" }`,
      explanation: 'Only one NotificationService bean exists at a time because each implementation is tied to a profile, so constructor injection is never ambiguous. If NO profile matched (e.g. profile "test"), startup would fail with "No qualifying bean of type NotificationService".',
    },
    {
      title: 'Multi-document YAML with Profiles in One File',
      scenario: 'Keep dev and prod settings in a single application.yml using document separators.',
      steps: [
        'Delete the profile .properties files (or keep them in a backup) to avoid confusion',
        'Write application.yml as shown',
        'Run with --spring.profiles.active=prod and check the port in the console',
      ],
      code: `spring:
  application:
    name: student-api
  profiles:
    active: dev
server:
  port: 8080
---
spring:
  config:
    activate:
      on-profile: dev
server:
  port: 8081
app:
  env-message: Running in DEVELOPMENT
---
spring:
  config:
    activate:
      on-profile: prod
server:
  port: 8080
app:
  env-message: Running in PRODUCTION`,
      result: `Default run:   The following 1 profile is active: "dev"   -> Tomcat started on port 8081
With --spring.profiles.active=prod -> Tomcat started on port 8080`,
      explanation: 'Each document after --- applies only when its on-profile matches. In Boot 2.4+ the old key spring.profiles inside a document was replaced by spring.config.activate.on-profile.',
    },
  ],
  interview: [
    { q: 'What does @SpringBootApplication consist of?', a: '@SpringBootConfiguration (a @Configuration), @EnableAutoConfiguration and @ComponentScan (current package and sub-packages).', level: 'Easy' },
    { q: 'Difference between application.properties and application.yml?', a: 'Both provide configuration. properties uses flat key=value; yml uses indentation-based hierarchy, supports lists naturally and multiple documents with ---. If both define the same key, properties takes precedence.', level: 'Easy' },
    { q: 'What is a Spring profile?', a: 'A named logical group of configuration and beans for an environment (dev, test, prod). Profile files application-{profile}.properties override the common file when that profile is active; @Profile controls bean creation.', level: 'Easy' },
    { q: 'How many ways can you activate a profile?', a: 'spring.profiles.active in application.properties, command-line --spring.profiles.active=prod, JVM -Dspring.profiles.active=prod, environment variable SPRING_PROFILES_ACTIVE, IDE run configuration, or programmatically via SpringApplication.setAdditionalProfiles().', level: 'Medium' },
    { q: 'Which has higher priority: command-line argument or application.properties?', a: 'Command-line argument. Order (high to low): command line, system properties, environment variables, profile-specific files, application.properties, defaults.', level: 'Medium' },
    { q: 'What happens if a bean is required but its @Profile is not active?', a: 'The bean is not created; any class that needs it fails with NoSuchBeanDefinitionException / "required a bean of type ... that could not be found" at startup.', level: 'Medium' },
    { q: 'What is the default profile?', a: 'When no profile is active, Spring uses the profile named "default", so beans marked @Profile("default") and application-default.properties are used.', level: 'Medium' },
    { q: 'Can you have the main class in a sub-package and still scan the parent package?', a: 'Yes with scanBasePackages, but best practice is to keep the main class in the root package so default scanning covers everything.', level: 'Medium' },
    { q: 'How do you keep secrets (like DB password) out of application.properties?', a: 'Use placeholders with environment variables, e.g. spring.datasource.password=${DB_PASSWORD}, set the variable on the server; or use a secrets manager / Spring Cloud Config / Vault.', level: 'Hard' },
    { q: 'Write the env var name for spring.datasource.url.', a: 'SPRING_DATASOURCE_URL (relaxed binding: uppercase, dots become underscores, dashes removed).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Convert this properties file to YAML: server.port=9090, spring.application.name=shop, app.tax-rate=18, app.currencies=INR,USD',
      hint: 'Lists in YAML use "- item".',
      solution: `server:
  port: 9090
spring:
  application:
    name: shop
app:
  tax-rate: 18
  currencies:
    - INR
    - USD`,
    },
    {
      task: 'Create dev, test and prod profiles where app.db-name is shop_dev, shop_test and shop_prod. Expose GET /db to show it.',
      hint: 'Three profile files plus @Value.',
      solution: `# application.properties
spring.profiles.active=dev
# application-dev.properties
app.db-name=shop_dev
# application-test.properties
app.db-name=shop_test
# application-prod.properties
app.db-name=shop_prod

package com.example.shop.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DbController {
    @Value("\${app.db-name}")
    private String dbName;

    @GetMapping("/db")
    public String db() {
        return "Using database: " + dbName;
    }
}`,
    },
    {
      task: 'Create a @Bean in a @Configuration class that returns a String "DEV DATA LOADED" only in dev and print it at startup using CommandLineRunner.',
      hint: '@Profile on a @Bean method; CommandLineRunner runs after startup.',
      solution: `package com.example.shop.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class DevDataConfig {

    @Bean
    @Profile("dev")
    public CommandLineRunner devDataLoader() {
        return args -> System.out.println("DEV DATA LOADED");
    }
}`,
    },
    {
      task: 'Make the database password come from an environment variable DB_PASSWORD with default "root" if not set.',
      hint: 'Placeholder syntax ${NAME:default}.',
      solution: `# application.properties
spring.datasource.password=\${DB_PASSWORD:root}

# Linux/Mac:   export DB_PASSWORD=Secret@123
# Windows:     set DB_PASSWORD=Secret@123
# IntelliJ:    Run > Edit Configurations > Environment variables: DB_PASSWORD=Secret@123
# STS:         Run Configurations > Environment tab > Add`,
    },
  ],
  quiz: [
    {
      question: 'Which is NOT part of @SpringBootApplication?',
      options: ['@ComponentScan', '@EnableAutoConfiguration', '@EnableWebMvc', '@SpringBootConfiguration'],
      answer: 2,
      explanation: '@EnableWebMvc is not included; adding it actually switches off Boot\'s MVC auto-configuration.',
    },
    {
      question: 'File name for the "qa" profile properties is:',
      options: ['application-qa.properties', 'qa-application.properties', 'application.qa.properties', 'application_qa.properties'],
      answer: 0,
      explanation: 'Pattern is application-{profile}.properties.',
    },
    {
      question: 'Which value wins: server.port=8081 in the file or --server.port=9000 on the command line?',
      options: ['8081', 'Error: conflict', 'Whichever is read last randomly', '9000'],
      answer: 3,
      explanation: 'Command-line arguments have the highest priority.',
    },
    {
      question: 'In YAML which line is valid?',
      options: ['port:8080', 'port: 8080', 'port = 8080', '\tport: 8080 (tab indent)'],
      answer: 1,
      explanation: 'YAML needs a space after the colon and spaces (not tabs) for indentation.',
    },
    {
      question: '@Profile("!prod") on a bean means:',
      options: ['Only in prod', 'Never created', 'Created in every profile except prod', 'Created only when no profile is active'],
      answer: 2,
      explanation: 'The ! negates the profile expression.',
    },
  ],
};
