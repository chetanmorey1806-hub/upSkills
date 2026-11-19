export default {
  lesson: 'day-05-logging-slf4j-logback-log4j2',
  minutes: 22,
  intro: 'Use the SLF4J facade, log levels, logback configuration, placeholders and MDC like a professional.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'Why do libraries and apps write their log calls against **SLF4J** instead of Logback or Log4j2 directly?',
      options: [
        'SLF4J writes logs faster than any implementation',
        'SLF4J is a facade (API): code depends only on it, and the real implementation (Logback, Log4j2) can be swapped by changing a dependency',
        'SLF4J stores logs in a database',
        'Logback cannot be used in Spring Boot',
      ],
      answer: 1,
      explain: 'SLF4J = **Simple Logging Facade for Java**. You code against `org.slf4j.Logger`; the binding on the classpath (Logback by default in Spring Boot, or Log4j2) does the actual writing.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'With the logback.xml below, which messages are printed? Type each printed **message** on its own line, in order.',
      example: { title: 'per-package levels', text: 'A <logger name="..."> sets the level for that package and its sub-packages; everything else uses <root>.' },
      code: `<!-- logback.xml -->
<logger name="com.shop" level="DEBUG"/>
<root level="WARN"> <appender-ref ref="CONSOLE"/> </root>

// in class com.shop.service.OrderService
log.trace("t1 entering placeOrder");
log.debug("d1 cart has 3 items");
log.info("i1 order placed");

// in class org.hibernate.SQL
log.debug("d2 select * from orders");
log.info("i2 session opened");
log.warn("w2 slow query");`,
      expected: 'd1 cart has 3 items\ni1 order placed\nw2 slow query',
      explain: '`com.shop.service.OrderService` inherits **DEBUG** from `com.shop`, so DEBUG and INFO print, TRACE does not. `org.hibernate.SQL` has no own logger, so it uses root **WARN**: only the warning prints.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Rewrite this as a proper SLF4J call with **placeholders** (INFO level):\n```\nlog.info("Order " + orderId + " placed by " + user);\n```',
      example: { title: 'one placeholder', code: 'log.debug("Loaded {} students", list.size());' },
      accept: ['log.info("Order {} placed by {}", orderId, user);', 'log.info("Order {} placed by {}", orderId, user)'],
      explain: '`{}` placeholders are filled in order and the string is built **only if** the level is enabled, so disabled debug logs cost almost nothing. String concatenation always builds the string, even when nothing is printed.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'A filter wants every log line of one request to show its request id via `%X{requestId}` in the pattern. Complete the line that stores it:\n```\nString id = UUID.randomUUID().toString();\n???\ntry { chain.doFilter(req, res); } finally { MDC.remove("requestId"); }\n```',
      example: { title: 'pattern using MDC', code: '<pattern>%d %-5level [%X{requestId}] %logger - %msg%n</pattern>' },
      accept: ['MDC.put("requestId", id);', 'MDC.put("requestId", id)'],
      explain: '**MDC** (Mapped Diagnostic Context) is a per-thread map. Values put there appear in every log line via `%X{key}`. Always remove/clear it in `finally`, because threads are reused by the server pool.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are logging **best practices**? (choose all that apply)',
      options: [
        'Never log passwords, OTPs, card numbers or full tokens',
        'Log an exception with the exception object: log.error("Payment failed for order {}", id, ex)',
        'Use System.out.println in production code',
        'Use a rolling file appender so log files do not grow forever',
        'Log every loop iteration at INFO level',
      ],
      answers: [0, 1, 3],
      explain: 'Protect sensitive data, pass the exception as the **last argument** so the stack trace is printed, and roll files by size/time with a max history. Noisy INFO logs hide the important lines and fill disks.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Order the levels from **most detailed** to **most severe**.',
      options: ['ERROR, WARN, INFO, DEBUG, TRACE', 'TRACE, DEBUG, INFO, WARN, ERROR', 'DEBUG, TRACE, INFO, ERROR, WARN', 'INFO, DEBUG, TRACE, WARN, ERROR'],
      answer: 1,
      explain: '**TRACE < DEBUG < INFO < WARN < ERROR**. Setting a level shows that level and everything more severe. Production usually runs at INFO; DEBUG/TRACE are switched on temporarily for one package.',
    },
  ],
};
