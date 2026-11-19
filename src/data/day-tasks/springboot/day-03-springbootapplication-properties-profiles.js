export default {
  lesson: 'day-03-springbootapplication-properties-profiles',
  minutes: 20,
  intro: 'Understand @SpringBootApplication, convert between .properties and .yml, and predict which profile value wins.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: '`@SpringBootApplication` is a shortcut for which three annotations? (choose all that apply)',
      options: ['@SpringBootConfiguration (a @Configuration)', '@EnableAutoConfiguration', '@ComponentScan', '@EnableWebMvc', '@RestController'],
      answers: [0, 1, 2],
      explain: '`@SpringBootApplication` = **@SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan**. Adding `@EnableWebMvc` yourself actually switches OFF Boot\'s MVC auto-configuration - a common mistake.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Write the **application.properties** line equivalent to this YAML:\n```\nserver:\n  port: 9090\n```',
      example: { title: 'yml → properties', code: 'spring:\n  application:\n    name: shop\n# becomes\nspring.application.name=shop' },
      accept: ['server.port=9090', 'server.port: 9090', 'server.port = 9090'],
      explain: 'Each YAML level becomes a dot in the key: `server` → `port` = `server.port=9090`. In YAML, indentation matters and a space is required after the colon.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which property (key only) selects the active profile, e.g. to run with `application-dev.properties`?',
      example: { title: 'activating from the command line', code: 'java -jar app.jar --spring.profiles.active=prod' },
      accept: ['spring.profiles.active'],
      explain: '`spring.profiles.active=dev` loads `application.properties` first and then `application-dev.properties` on top (profile values override). It can also be set with an environment variable `SPRING_PROFILES_ACTIVE`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The app is started with `java -jar app.jar --spring.profiles.active=dev`. What does the startup line print?',
      example: { title: 'override order', text: 'application.properties < application-{profile}.properties < command-line arguments' },
      code: `# application.properties
app.name=UpSkillr
app.discount=5

# application-dev.properties
app.discount=50

// Java
@Value("\${app.name}") String name;
@Value("\${app.discount}") int discount;
System.out.println(name + " discount " + discount + "%");`,
      expected: 'UpSkillr discount 50%',
      explain: 'The base file is always loaded, then the active profile file **overrides** matching keys. `app.name` exists only in the base file (UpSkillr) and `app.discount` is overridden by dev (50).',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Same files as before, but started with `java -jar app.jar --spring.profiles.active=dev --app.discount=10`. What is printed now?',
      example: { title: 'command line beats files', code: 'java -jar app.jar --server.port=9000   # wins over server.port in any file' },
      code: `System.out.println(name + " discount " + discount + "%");`,
      expected: 'UpSkillr discount 10%',
      explain: 'Command-line arguments have **higher priority** than any application*.properties file, so `--app.discount=10` wins over the dev value 50.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A bean is annotated `@Profile("prod")`. The app runs with `spring.profiles.active=dev`. What happens?',
      options: ['The bean is created anyway', 'The bean is NOT created, because its profile is not active', 'The app fails to start', 'The bean is created twice'],
      answer: 1,
      explain: '`@Profile` makes bean creation conditional: it is registered only when that profile is active. Use it e.g. for a real payment gateway in prod and a fake one in dev.',
    },
  ],
};
