export default {
  lesson: 'day-04-devtools-actuator-logging',
  minutes: 20,
  intro: 'Practise DevTools restart, Actuator endpoints and Spring Boot logging levels and properties.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does **Spring Boot DevTools** mainly do during development?',
      options: [
        'Encrypts your passwords',
        'Automatically restarts the app when classes on the classpath change (plus LiveReload and dev-friendly defaults)',
        'Deploys the app to the cloud',
        'Generates unit tests',
      ],
      answer: 1,
      explain: 'DevTools watches the classpath and does a **fast restart** when you rebuild, disables template caching and supports LiveReload. It is automatically disabled when running a packaged JAR in production.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'With Actuator added, which URL path shows whether the app is UP? (default base path)',
      example: { title: 'another endpoint', code: 'GET /actuator/info' },
      accept: ['/actuator/health', 'actuator/health', 'http://localhost:8080/actuator/health', 'localhost:8080/actuator/health'],
      explain: 'Actuator endpoints live under `/actuator`. `/actuator/health` returns `{"status":"UP"}`. Load balancers and Kubernetes probes call it to check the app.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'By default only `health` is exposed over HTTP. Complete the property that exposes **health, info and metrics**:\n```\n??? =health,info,metrics\n```',
      example: { title: 'show full health details', code: 'management.endpoint.health.show-details=always' },
      accept: ['management.endpoints.web.exposure.include'],
      explain: '`management.endpoints.web.exposure.include=health,info,metrics` (or `*` for all - only safe in development). Note it is `endpoints` (plural) for exposure and `endpoint` (singular) for settings of one endpoint.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`logging.level.root=WARN` is set. Which lines appear in the console? Type each printed message on its own line, in order.',
      example: { title: 'levels from lowest to highest', text: 'TRACE < DEBUG < INFO < WARN < ERROR. A logger prints its level and everything higher.' },
      code: `log.debug("Loading students");
log.info("Server started");
log.warn("Disk almost full");
log.error("Payment failed");
log.trace("Entering method");`,
      expected: 'Disk almost full\nPayment failed',
      explain: 'With level **WARN** only WARN and ERROR messages are written. INFO, DEBUG and TRACE are lower, so they are skipped. Boot\'s default level is INFO.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Write the property line that shows **DEBUG** logs only for your own package `com.upskillr` (everything else stays INFO).',
      example: { title: 'Hibernate SQL logs', code: 'logging.level.org.hibernate.SQL=DEBUG' },
      accept: ['logging.level.com.upskillr=DEBUG', 'logging.level.com.upskillr: DEBUG', 'logging.level.com.upskillr=debug'],
      explain: '`logging.level.<package>=LEVEL` sets the level for one package. Setting `logging.level.root=DEBUG` instead would flood the console with framework logs.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about logging in Spring Boot are TRUE? (choose all that apply)',
      options: [
        'Boot uses SLF4J with Logback by default',
        'logging.file.name=app.log also writes logs to a file',
        'System.out.println is the recommended way to log in production',
        'log.info("Student {} saved", id) uses a placeholder that is filled only if INFO is enabled',
      ],
      answers: [0, 1, 3],
      explain: 'Boot ships **SLF4J + Logback**. `logging.file.name` adds a file appender. `{}` placeholders avoid string building when the level is off. `System.out.println` has no levels, no timestamps and cannot be switched off - avoid it.',
    },
  ],
};
