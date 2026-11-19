export default {
  lesson: 'day-22-spring-cloud-config-resilience4j-tracing',
  minutes: 24,
  intro: 'Centralise configuration with Config Server, protect calls with Resilience4j and follow requests across services with tracing.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Which annotation on the main class turns a Spring Boot app into a **Spring Cloud Config Server**?',
      example: { title: 'Git backend', code: 'spring.cloud.config.server.git.uri=https://github.com/upskillr/config-repo' },
      accept: ['@EnableConfigServer'],
      explain: '`@EnableConfigServer` (plus the `spring-cloud-config-server` dependency) serves files like `student-service-dev.yml` from a Git repo at URLs such as `/student-service/dev`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Write the property line a **client** service (Boot 3) uses to load its configuration from the Config Server on `http://localhost:8888`, without failing if the server is down.',
      example: { title: 'the client also needs its name', code: 'spring.application.name=student-service' },
      accept: ['spring.config.import=optional:configserver:http://localhost:8888', 'spring.config.import=optional:configserver:http://localhost:8888/'],
      explain: 'Since Boot 2.4 the client uses `spring.config.import=configserver:...`; the `optional:` prefix lets the app start with local settings when the server is unreachable. The old `bootstrap.yml` approach is legacy.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A circuit breaker has `slidingWindowSize=4`, `minimumNumberOfCalls=4`, `failureRateThreshold=50`. The first four calls to course-service give: success, failure, failure, success. Type two lines: the breaker state after these 4 calls, and what the 5th call returns.',
      example: { title: 'the three states', text: 'CLOSED (calls pass) → OPEN (calls rejected immediately, fallback used) → HALF_OPEN (a few trial calls) → CLOSED or OPEN again.' },
      code: `@CircuitBreaker(name = "courseService", fallbackMethod = "fallback")
public String getCourses() {
    return courseClient.getAll();
}

public String fallback(Throwable t) {
    return "Course service unavailable";
}`,
      expected: 'OPEN\nCourse service unavailable',
      explain: '2 failures out of 4 = **50%**, which reaches the threshold → the breaker opens. While OPEN, calls are not even sent to course-service; the fallback answers immediately. After `waitDurationInOpenState` it goes HALF_OPEN to test recovery.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`@Retry(name = "payment", fallbackMethod = "fallback")` with `maxAttempts=3`. The payment API fails on every call. How many times is the API called, and what is returned? (two lines)',
      example: { title: 'maxAttempts', text: 'maxAttempts counts the FIRST call too: maxAttempts=3 means 1 call + 2 retries.' },
      code: `public String pay() { calls++; return paymentClient.charge(); }  // always throws
public String fallback(Throwable t) { return "Payment pending"; }`,
      expected: '3\nPayment pending',
      explain: 'Resilience4j tries 3 times in total (the original call + 2 retries, with a wait between), then gives up and calls the fallback. Retry only safe/idempotent operations, and combine it with a circuit breaker so retries do not hammer a dead service.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which Resilience4j module limits how many calls per second a client may make to protect your API?',
      options: ['TimeLimiter', 'RateLimiter', 'Bulkhead', 'Retry'],
      answer: 1,
      explain: '**RateLimiter** = max N calls per period. **TimeLimiter** = give up after a timeout. **Bulkhead** = limit concurrent calls so one slow dependency cannot use every thread. **Retry** = try again after a failure.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'A request goes gateway → order-service → payment-service with Micrometer Tracing + Zipkin. Which statements are TRUE? (choose all that apply)',
      options: [
        'All three services log the same traceId for this request',
        'Each hop (service call) has its own spanId',
        'Zipkin shows a timeline of the spans, so you can see which service was slow',
        'Tracing works without propagating any headers between services',
        'Centralised logging (e.g. ELK / Loki) lets you search all services\' logs by traceId',
      ],
      answers: [0, 1, 2, 4],
      explain: 'The trace context is **propagated in HTTP headers** (W3C `traceparent`); that is how all services share one traceId. Each operation is a span. Zipkin (default port 9411) visualises them; centralised logging + traceId turns debugging across services into one search.',
    },
  ],
};
