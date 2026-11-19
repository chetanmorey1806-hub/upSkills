export default {
  lesson: 'day-22-microservices-eureka-gateway-feign',
  minutes: 24,
  intro: 'Compare monoliths and microservices, and wire Eureka discovery, an OpenFeign client and Spring Cloud Gateway routes.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **microservices** are TRUE? (choose all that apply)',
      options: [
        'Each service can be deployed and scaled independently',
        'Each service ideally owns its own database',
        'They are always simpler than a monolith for a small college project',
        'Network calls between services can fail, so you need timeouts and fallbacks',
        'Different teams can own different services',
      ],
      answers: [0, 1, 3, 4],
      explain: 'Microservices give independent deployment/scaling and team ownership, but add **complexity**: network failures, distributed data, monitoring. For small projects a well-structured monolith is usually the better start.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which annotation on the main class turns a Spring Boot app into a **Eureka discovery server**?',
      example: { title: 'dependency', code: '<artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>' },
      accept: ['@EnableEurekaServer'],
      explain: '`@EnableEurekaServer` starts the registry (dashboard on port 8761 by convention). Client services only need the `eureka-client` starter - they register automatically.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Write the property line that tells a client service where the Eureka server is (`http://localhost:8761/eureka`).',
      example: { title: 'the name it registers with', code: 'spring.application.name=student-service' },
      accept: ['eureka.client.service-url.defaultZone=http://localhost:8761/eureka', 'eureka.client.service-url.defaultZone=http://localhost:8761/eureka/', 'eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka', 'eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/'],
      explain: '`eureka.client.service-url.defaultZone` points to the registry. The service registers under `spring.application.name` - other services and the gateway find it by that name, not by host:port.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the Feign client so `student-service` can call `course-service` by its Eureka name:\n```\n???\npublic interface CourseClient {\n    @GetMapping("/api/courses/{id}")\n    CourseDto getCourse(@PathVariable Long id);\n}\n```',
      example: { title: 'switching Feign on', code: '@EnableFeignClients\n@SpringBootApplication\npublic class StudentServiceApplication { ... }' },
      accept: ['@FeignClient(name = "course-service")', '@FeignClient("course-service")', '@FeignClient(value = "course-service")', '@FeignClient(name = "COURSE-SERVICE")'],
      explain: '`@FeignClient(name = "course-service")` - Feign generates the HTTP code and asks Eureka (through the load balancer) for an instance of that service. You need `@EnableFeignClients` on a configuration class.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The gateway runs on port 8080 with the routes below. A client calls `GET http://localhost:8080/api/courses/5`. Type two lines: the **service name** that receives it and the **path** it receives.',
      example: { title: 'StripPrefix', text: 'StripPrefix=1 removes the first path segment: /api/orders/9 → /orders/9' },
      code: `spring:
  cloud:
    gateway:
      routes:
        - id: students
          uri: lb://student-service
          predicates:
            - Path=/api/students/**
        - id: courses
          uri: lb://course-service
          predicates:
            - Path=/api/courses/**
          filters:
            - StripPrefix=1`,
      expected: 'course-service\n/courses/5',
      explain: 'The `Path=/api/courses/**` predicate matches, so the request goes to `lb://course-service` (lb = load-balanced lookup in Eureka). `StripPrefix=1` removes `/api`, so the service sees `/courses/5`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the main job of an **API Gateway** in a microservice system?',
      options: [
        'Store all data of every service',
        'Be the single entry point: route requests to services and handle cross-cutting concerns like auth, CORS and rate limiting',
        'Replace Eureka completely',
        'Compile the services',
      ],
      answer: 1,
      explain: 'Clients (React, mobile) talk only to the gateway. It routes to services found via discovery and centralises security, CORS, logging and rate limits, so each service does not repeat that work.',
    },
  ],
};
