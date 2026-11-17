export default {
  id: 'day-04-devtools-actuator-logging',
  title: 'DevTools, Actuator and Logging',
  module: 'Module 1: Spring Boot Basics',
  day: 4,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Speed up development with DevTools automatic restart, monitor a running application with Actuator endpoints (health, info, metrics), and write proper logs with SLF4J and Logback including levels, files and patterns.',
  objectives: [
    'Add DevTools and make automatic restart work in IntelliJ and Eclipse/STS',
    'Enable and secure Actuator endpoints such as /actuator/health, /info and /metrics',
    'Write a custom HealthIndicator and info contributor',
    'Use SLF4J Logger with TRACE, DEBUG, INFO, WARN, ERROR levels',
    'Configure log levels, log files and log patterns in application.properties',
  ],
  theory: [
    {
      heading: 'Spring Boot DevTools',
      content:
        'DevTools is a development-only module that restarts your application automatically whenever a class file on the classpath changes. Restart is fast because Boot uses two class loaders: a "base" class loader for libraries (never reloaded) and a "restart" class loader for your own code (thrown away and recreated).\n\nAnalogy: instead of switching off the whole computer to change a wallpaper, you only refresh the desktop.\n\nDevTools also disables template caching (Thymeleaf) and adds LiveReload support for browsers. It is automatically disabled when you run a packaged JAR with java -jar, so it never affects production.',
      points: [
        'Dependency: spring-boot-devtools with scope runtime and optional true',
        'Restart is triggered when compiled classes change, so the IDE must COMPILE on save',
        'IntelliJ: Settings > Build, Execution, Deployment > Compiler > tick "Build project automatically"; then Settings > Advanced Settings > tick "Allow auto-make to start even if developed application is currently running". Or press Ctrl+F9 (Build) after editing',
        'Eclipse/STS: Project > Build Automatically is on by default, so saving (Ctrl+S) triggers restart',
        'Exclude paths: spring.devtools.restart.exclude=static/**,public/**',
        'Disable: spring.devtools.restart.enabled=false',
      ],
    },
    {
      heading: 'Spring Boot Actuator',
      content:
        'Actuator adds production-ready endpoints to monitor and manage your application: is it up, how much memory is used, how many HTTP requests, which beans exist, which config is loaded.\n\nAnalogy: Actuator is the dashboard of a car - speed, fuel, engine temperature - you do not drive with it but you must watch it.\n\nBy default only /actuator/health is exposed over HTTP. You choose others with management.endpoints.web.exposure.include.',
      points: [
        '/actuator/health - UP/DOWN status (used by load balancers, Kubernetes probes)',
        '/actuator/info - custom app info (version, team)',
        '/actuator/metrics and /actuator/metrics/{name} - JVM memory, CPU, http.server.requests',
        '/actuator/beans - all beans in the context',
        '/actuator/env - environment properties (sensitive!)',
        '/actuator/loggers - view and CHANGE log levels at runtime',
        '/actuator/mappings - all URL mappings',
        '/actuator/shutdown - disabled by default',
        'Security: never expose "*" publicly in production; protect with Spring Security and use management.server.port for a separate port',
      ],
    },
    {
      heading: 'Logging in Spring Boot',
      content:
        'Spring Boot uses SLF4J (Simple Logging Facade for Java) as the API and Logback as the default implementation, both included by every starter. Never use System.out.println in real apps: logs have levels, timestamps, thread names, class names and can go to files.\n\nLevels from most detailed to least: TRACE < DEBUG < INFO < WARN < ERROR. Setting a level shows that level and everything ABOVE it. Default root level is INFO, so DEBUG and TRACE are hidden.\n\nAnalogy: log levels are like a volume knob. TRACE = whisper everything, ERROR = only shout emergencies.',
      syntax: 'private static final Logger log = LoggerFactory.getLogger(MyClass.class);\nlog.info("Student created with id {}", id);   // {} placeholder, no string concat',
      points: [
        'Use {} placeholders: the message is only built if the level is enabled (faster)',
        'Log exceptions with the exception as last argument: log.error("Failed to save", ex)',
        'Lombok shortcut: @Slf4j on the class gives a ready "log" field',
        'Never log passwords, tokens or card numbers',
      ],
    },
    {
      heading: 'Configuring Logging',
      content:
        'Most logging configuration is done in application.properties. For advanced setups (rolling by size and date, separate files per package, JSON logs) create src/main/resources/logback-spring.xml.',
      syntax: 'logging.level.root=INFO\nlogging.level.com.example=DEBUG\nlogging.level.org.hibernate.SQL=DEBUG\nlogging.file.name=logs/app.log\nlogging.logback.rollingpolicy.max-file-size=10MB\nlogging.logback.rollingpolicy.max-history=7\nlogging.pattern.console=%d{HH:mm:ss} %-5level [%thread] %logger{20} - %msg%n',
      points: [
        'logging.file.name writes to a specific file; logging.file.path writes spring.log into a folder',
        'Pattern tokens: %d date, %-5level level padded, %thread, %logger{20} short class name, %msg message, %n newline',
        'Profile-specific: DEBUG in application-dev.properties, WARN in application-prod.properties',
      ],
    },
  ],
  examples: [
    {
      title: 'DevTools Automatic Restart',
      scenario: 'Change a controller message and see the app restart by itself without pressing Run again.',
      steps: [
        'Add the devtools dependency to pom.xml and reload Maven (IntelliJ: Load Maven Changes; STS: Maven > Update Project)',
        'IntelliJ: Settings > Build, Execution, Deployment > Compiler > tick Build project automatically; Settings > Advanced Settings > tick Allow auto-make to start even if developed application is currently running',
        'STS: make sure Project > Build Automatically is ticked',
        'Run the app, call GET /hello in Postman',
        'Change the returned text and save (STS: Ctrl+S; IntelliJ: wait 1-2 seconds or press Ctrl+F9)',
        'Watch the console restart and call GET /hello again',
      ],
      code: `<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>

// ===== controller/HelloController.java =====
package com.example.studentapi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello v2 - changed without restarting manually!";
    }
}`,
      result: `Console after saving:
  restartedMain  o.s.b.d.a.OptionalLiveReloadServer : LiveReload server is running on port 35729
  restartedMain  c.e.s.StudentApiApplication        : Started StudentApiApplication in 0.6 seconds

GET http://localhost:8080/hello
200 OK
Hello v2 - changed without restarting manually!`,
      explanation: 'The thread name "restartedMain" shows DevTools is active. The restart took 0.6 seconds instead of 2 because library classes stayed loaded in the base class loader.',
    },
    {
      title: 'Actuator: health, info, metrics and a Custom Health Indicator',
      scenario: 'Expose health, info, metrics and loggers endpoints, add app info, and write a custom HealthIndicator that checks free disk space for uploads.',
      steps: [
        'Add spring-boot-starter-actuator to pom.xml and reload Maven',
        'Add the management properties to application.properties',
        'Create class UploadFolderHealthIndicator in package health',
        'Run the app; in Postman send GET http://localhost:8080/actuator/health',
        'Send GET http://localhost:8080/actuator/info and GET http://localhost:8080/actuator/metrics/jvm.memory.used',
      ],
      code: `<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

# ===== application.properties =====
management.endpoints.web.exposure.include=health,info,metrics,loggers
management.endpoint.health.show-details=always
management.info.env.enabled=true
info.app.name=Student API
info.app.version=1.0.0
info.app.team=Backend Batch 7

// ===== health/UploadFolderHealthIndicator.java =====
package com.example.studentapi.health;

import java.io.File;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class UploadFolderHealthIndicator implements HealthIndicator {

    private static final long MIN_FREE_BYTES = 100L * 1024 * 1024; // 100 MB

    @Override
    public Health health() {
        File folder = new File(".");
        long free = folder.getUsableSpace();
        if (free > MIN_FREE_BYTES) {
            return Health.up()
                    .withDetail("freeMB", free / (1024 * 1024))
                    .build();
        }
        return Health.down()
                .withDetail("reason", "Less than 100 MB free")
                .build();
    }
}`,
      result: `GET http://localhost:8080/actuator/health
200 OK
{
  "status": "UP",
  "components": {
    "diskSpace": { "status": "UP", "details": { "total": 499963174912, "free": 210345467904, "threshold": 10485760, "path": ".../student-api/.", "exists": true } },
    "ping": { "status": "UP" },
    "uploadFolder": { "status": "UP", "details": { "freeMB": 200601 } }
  }
}

GET http://localhost:8080/actuator/info
{ "app": { "name": "Student API", "version": "1.0.0", "team": "Backend Batch 7" } }

GET http://localhost:8080/actuator/metrics/jvm.memory.used
{ "name": "jvm.memory.used", "baseUnit": "bytes", "measurements": [ { "statistic": "VALUE", "value": 1.08E8 } ], ... }
(Numbers depend on your machine.)`,
      explanation: 'The bean name uploadFolderHealthIndicator becomes the component name "uploadFolder" (the HealthIndicator suffix is removed). If any component is DOWN, the overall status becomes DOWN and the HTTP status becomes 503, which tells a load balancer to stop sending traffic.',
    },
    {
      title: 'Logging with SLF4J, Levels and a Log File',
      scenario: 'Log at every level from a controller, show only DEBUG and above for our package, write logs to logs/app.log, and change the level at runtime using Actuator.',
      steps: [
        'Create LogDemoController in the controller package',
        'Add the logging properties to application.properties',
        'Run and call GET http://localhost:8080/log-demo?name=Ravi in Postman',
        'Open logs/app.log in the project folder (IntelliJ: right-click project > Reload from Disk; STS: F5 Refresh)',
        'Postman: POST http://localhost:8080/actuator/loggers/com.example with body {"configuredLevel":"TRACE"} and call /log-demo again',
      ],
      code: `// ===== controller/LogDemoController.java =====
package com.example.studentapi.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LogDemoController {

    private static final Logger log = LoggerFactory.getLogger(LogDemoController.class);

    @GetMapping("/log-demo")
    public String logDemo(@RequestParam String name) {
        log.trace("TRACE: entering logDemo");
        log.debug("DEBUG: name parameter = {}", name);
        log.info("INFO: greeting user {}", name);
        log.warn("WARN: this endpoint is only for demo");
        try {
            int x = 10 / 0;
        } catch (ArithmeticException ex) {
            log.error("ERROR: calculation failed", ex);
        }
        return "Check the console and logs/app.log";
    }
}

# ===== application.properties =====
logging.level.root=INFO
logging.level.com.example=DEBUG
logging.file.name=logs/app.log
logging.pattern.console=%d{HH:mm:ss} %-5level %logger{20} - %msg%n
management.endpoints.web.exposure.include=health,info,loggers`,
      result: `Console (TRACE hidden because level is DEBUG):
10:15:02 DEBUG c.e.s.c.LogDemoController - DEBUG: name parameter = Ravi
10:15:02 INFO  c.e.s.c.LogDemoController - INFO: greeting user Ravi
10:15:02 WARN  c.e.s.c.LogDemoController - WARN: this endpoint is only for demo
10:15:02 ERROR c.e.s.c.LogDemoController - ERROR: calculation failed
java.lang.ArithmeticException: / by zero
    at com.example.studentapi.controller.LogDemoController.logDemo(LogDemoController.java:20)
    ...

POST http://localhost:8080/actuator/loggers/com.example
Body: { "configuredLevel": "TRACE" }
Response: 204 No Content
Calling /log-demo again now also prints:
10:16:40 TRACE c.e.s.c.LogDemoController - TRACE: entering logDemo`,
      explanation: 'With logging.level.com.example=DEBUG, the TRACE line is filtered out. The exception is passed as the last argument so the full stack trace is logged. The /actuator/loggers endpoint changed the level at runtime without restarting - very useful in production debugging.',
    },
  ],
  interview: [
    { q: 'What is Spring Boot DevTools and how does fast restart work?', a: 'A development-time module that restarts the app when classpath files change. It uses two class loaders: base (third-party jars, kept) and restart (your classes, recreated), so restart is much faster than a cold start. It is disabled automatically in a packaged jar.', level: 'Medium' },
    { q: 'Why is DevTools marked optional and runtime scope?', a: 'optional prevents it from being passed transitively to other projects that depend on yours; runtime because it is not needed for compiling. The repackaged jar excludes it by default.', level: 'Medium' },
    { q: 'What is Spring Boot Actuator?', a: 'A module providing production-ready features: endpoints for health, metrics, info, env, beans, loggers, mappings, thread dumps, integrated with Micrometer for monitoring systems like Prometheus.', level: 'Easy' },
    { q: 'Which actuator endpoints are exposed over HTTP by default?', a: 'Only /actuator/health (in Boot 3). Others must be listed in management.endpoints.web.exposure.include.', level: 'Medium' },
    { q: 'How do you create a custom health check?', a: 'Implement HealthIndicator (or extend AbstractHealthIndicator), annotate with @Component and return Health.up()/down() with details. It appears as a component under /actuator/health.', level: 'Medium' },
    { q: 'What logging framework does Spring Boot use by default?', a: 'SLF4J as the facade and Logback as the implementation, configured by spring-boot-starter-logging (included in every starter).', level: 'Easy' },
    { q: 'Explain log levels and which are shown when level is INFO.', a: 'TRACE, DEBUG, INFO, WARN, ERROR (increasing severity). With INFO, INFO, WARN and ERROR are printed; DEBUG and TRACE are suppressed.', level: 'Easy' },
    { q: 'Why use log.info("id {}", id) instead of "id " + id?', a: 'With placeholders the string is only formatted if the level is enabled, avoiding unnecessary string building; it is also cleaner and lets the exception be passed as the last argument.', level: 'Medium' },
    { q: 'How can you change log level without restarting the app?', a: 'Expose the loggers actuator endpoint and POST {"configuredLevel":"DEBUG"} to /actuator/loggers/{logger.name}.', level: 'Hard' },
    { q: 'How do you secure actuator endpoints?', a: 'Expose only the endpoints needed, protect /actuator/** with Spring Security roles, optionally use a separate management.server.port not reachable from the internet, and never expose env/heapdump publicly.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Expose the mappings and beans actuator endpoints and find your own controller URLs in the mappings response.',
      hint: 'Add them to management.endpoints.web.exposure.include.',
      solution: `# application.properties
management.endpoints.web.exposure.include=health,info,mappings,beans

# Postman: GET http://localhost:8080/actuator/mappings
# Search for "/hello" under contexts > application > mappings > dispatcherServlets`,
    },
    {
      task: 'Write a HealthIndicator named "externalApi" that is DOWN if a property app.external-api.enabled=false, else UP.',
      hint: 'Inject the property with @Value; class name ExternalApiHealthIndicator.',
      solution: `package com.example.studentapi.health;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class ExternalApiHealthIndicator implements HealthIndicator {

    @Value("\${app.external-api.enabled:true}")
    private boolean enabled;

    @Override
    public Health health() {
        return enabled
                ? Health.up().withDetail("externalApi", "reachable").build()
                : Health.down().withDetail("externalApi", "disabled by config").build();
    }
}`,
    },
    {
      task: 'Configure dev to log SQL and DEBUG for your package, and prod to log only WARN to a file logs/prod.log.',
      hint: 'Use profile-specific property files.',
      solution: `# application-dev.properties
logging.level.com.example=DEBUG
logging.level.org.hibernate.SQL=DEBUG

# application-prod.properties
logging.level.root=WARN
logging.file.name=logs/prod.log
logging.logback.rollingpolicy.max-file-size=10MB
logging.logback.rollingpolicy.max-history=30`,
    },
    {
      task: 'Rewrite LogDemoController using Lombok @Slf4j.',
      hint: 'Add the lombok dependency (optional true) and install the Lombok plugin in the IDE (IntelliJ has it bundled; Eclipse: run lombok.jar installer).',
      solution: `package com.example.studentapi.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class LombokLogController {

    @GetMapping("/lombok-log")
    public String demo() {
        log.info("Logged using Lombok @Slf4j");
        return "ok";
    }
}`,
    },
  ],
  quiz: [
    {
      question: 'Default logging implementation in Spring Boot is:',
      options: ['Log4j 1', 'java.util.logging', 'Logback', 'Commons Logging only'],
      answer: 2,
      explanation: 'spring-boot-starter-logging uses Logback with SLF4J.',
    },
    {
      question: 'With logging.level.root=WARN, which call is printed?',
      options: ['log.error(...)', 'log.info(...)', 'log.debug(...)', 'log.trace(...)'],
      answer: 0,
      explanation: 'WARN shows WARN and ERROR only.',
    },
    {
      question: 'Which actuator endpoint is exposed over HTTP by default in Boot 3?',
      options: ['/actuator/env', '/actuator/beans', '/actuator/metrics', '/actuator/health'],
      answer: 3,
      explanation: 'Only health is exposed by default.',
    },
    {
      question: 'Why does DevTools restart faster than a normal start?',
      options: ['It skips Tomcat', 'It uses a separate restart class loader for your code only', 'It disables Spring', 'It compiles faster'],
      answer: 1,
      explanation: 'Library classes stay in the base class loader.',
    },
    {
      question: 'If a custom HealthIndicator returns DOWN, /actuator/health returns HTTP status:',
      options: ['200', '404', '503', '500'],
      answer: 2,
      explanation: 'DOWN maps to 503 Service Unavailable by default.',
    },
  ],
};
