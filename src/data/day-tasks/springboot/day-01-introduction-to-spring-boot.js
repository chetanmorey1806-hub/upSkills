export default {
  lesson: 'day-01-introduction-to-spring-boot',
  minutes: 18,
  intro: 'Check what Spring Boot adds on top of Spring: auto-configuration, starters, the embedded server and the main class.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which sentence best describes **Spring Boot**?',
      options: [
        'A new programming language that replaces Java',
        'An opinionated layer on top of the Spring Framework that auto-configures the app and runs it with an embedded server',
        'A database used by Spring applications',
        'A tool that only generates HTML pages',
      ],
      answer: 1,
      explain: 'Spring Boot is **built on top of Spring**. It does not replace Spring: it removes the setup work (XML, server installation, manual bean configuration) with sensible defaults, auto-configuration, starters and an embedded server, so you can run the app with `java -jar`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are things Spring Boot gives you **out of the box**? (choose all that apply)',
      options: [
        'Auto-configuration based on the jars on the classpath',
        'Starter dependencies that bring a tested set of libraries',
        'An embedded Tomcat server, so no separate server install is needed',
        'Automatic writing of your business logic',
        'A mandatory XML file for every bean',
      ],
      answers: [0, 1, 2],
      explain: 'Boot = **auto-configuration + starters + embedded server** (+ Actuator, externalized config). It never writes your business logic, and it is famous for needing **no XML** at all - plain Spring projects used to need large XML files.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'You want to build a REST API. Which **starter** artifactId do you add to `pom.xml`? (it brings Spring MVC, Jackson and embedded Tomcat)',
      example: { title: 'a starter for JPA', code: '<dependency>\n  <groupId>org.springframework.boot</groupId>\n  <artifactId>spring-boot-starter-data-jpa</artifactId>\n</dependency>' },
      accept: ['spring-boot-starter-web', '<artifactId>spring-boot-starter-web</artifactId>'],
      explain: '`spring-boot-starter-web` pulls in Spring MVC, Jackson (JSON) and `spring-boot-starter-tomcat`. Starters are named `spring-boot-starter-*`; a common mistake is adding `spring-webmvc` alone and then wondering why there is no embedded server.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'How does auto-configuration decide to create a `DataSource` bean for you?',
      options: [
        'It always creates one, even in apps without a database',
        'It uses conditions such as @ConditionalOnClass / @ConditionalOnMissingBean: if the JDBC classes are on the classpath and you did not define your own DataSource, it creates one',
        'It reads a mandatory datasource.xml file',
        'It asks the user at startup',
      ],
      answer: 1,
      explain: 'Auto-configuration classes are guarded by **conditions**. `@ConditionalOnClass` checks the classpath, `@ConditionalOnMissingBean` backs off when you define your own bean. That is why "your bean always wins" over Boot\'s default.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the missing line inside `main` that starts the Spring Boot application:\n```\n@SpringBootApplication\npublic class ShopApplication {\n    public static void main(String[] args) {\n        // ???\n    }\n}\n```',
      example: { title: 'what this line does', text: 'It creates the ApplicationContext, runs auto-configuration, starts the embedded server and returns the context.' },
      accept: ['SpringApplication.run(ShopApplication.class, args);', 'SpringApplication.run(ShopApplication.class, args)'],
      explain: '`SpringApplication.run(ShopApplication.class, args)` bootstraps everything: it creates the context, scans components from this package downwards, applies auto-configuration and starts Tomcat. Passing the wrong class or forgetting `args` (command-line properties) are common mistakes.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'The app runs with default settings. You open `http://localhost:8080/hello?name=asha` in the browser. What text is shown?',
      example: { title: 'a controller returning text', code: '@GetMapping("/hi")\npublic String hi() { return "Hi"; }   // browser shows: Hi' },
      code: `@RestController
public class HelloController {
    @GetMapping("/hello")
    public String hello(@RequestParam String name) {
        return "Hello, " + name.toUpperCase() + "! Welcome to Spring Boot";
    }
}`,
      expected: 'Hello, ASHA! Welcome to Spring Boot',
      explain: '`@RestController` writes the returned String directly into the HTTP response body. `name` comes from the query string `?name=asha` and `toUpperCase()` makes it ASHA.',
    },
  ],
};
