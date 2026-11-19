export default {
  lesson: 'day-05-java-based-configuration',
  minutes: 20,
  intro: 'Configure Spring entirely in Java with @Configuration, @Bean, @ComponentScan, @Import and @PropertySource.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the annotation that registers the method\'s return value as a Spring bean:\n```\n@Configuration\npublic class AppConfig {\n    ____\n    public StudentRepository studentRepository() {\n        return new StudentRepository();\n    }\n}\n```',
      example: { title: 'naming a bean', code: '@Bean(name = "mysqlDataSource")\npublic DataSource dataSource() { ... }' },
      accept: ['@Bean'],
      caseSensitive: true,
      explain: '`@Bean` on a method inside a `@Configuration` class tells Spring to call it once and manage the returned object. The bean name defaults to the **method name** (`studentRepository`).',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print?',
      example: { title: 'full mode', text: '`@Configuration` classes are subclassed with CGLIB. A call from one `@Bean` method to another is intercepted and returns the existing singleton instead of running the method again.' },
      code: `@Configuration
public class AppConfig {
    @Bean
    public DataSource dataSource() {
        System.out.println("DataSource created");
        return new DriverManagerDataSource("jdbc:mysql://localhost:3306/college_db");
    }
    @Bean
    public StudentRepository studentRepository() {
        return new StudentRepository(dataSource());
    }
    @Bean
    public CourseRepository courseRepository() {
        return new CourseRepository(dataSource());
    }
}

// main
var ctx = new AnnotationConfigApplicationContext(AppConfig.class);
DataSource a = ctx.getBean(StudentRepository.class).getDataSource();
DataSource b = ctx.getBean(CourseRepository.class).getDataSource();
System.out.println(a == b);`,
      expected: 'DataSource created\ntrue',
      explain: 'Even though `dataSource()` is called in two methods, the CGLIB proxy returns the same singleton, so it is created **once** and both repositories share it. If the class were only `@Component` ("lite mode"), each call would really run the method: three DataSources and `false`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Tell Spring to scan the package `com.upskillr` for components. Complete:\n`@ComponentScan(____ = "com.upskillr")`',
      example: { title: 'short form', code: '@ComponentScan("com.upskillr") // value is an alias' },
      accept: ['basePackages', 'value'],
      caseSensitive: true,
      explain: '`basePackages` (or its alias `value`) lists the packages to scan, including sub-packages. Without @ComponentScan, `@Service` and `@Repository` classes are not found and you get NoSuchBeanDefinitionException. Type-safe alternative: `basePackageClasses = AppConfig.class`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Load `app.properties` from `src/main/resources`. Complete the annotation value:\n`@PropertySource("____")`',
      example: { title: 'reading a property', code: '@Value("${db.url}")\nprivate String dbUrl;' },
      accept: ['classpath:app.properties', 'classpath:/app.properties'],
      explain: 'The `classpath:` prefix tells Spring to look in the classpath, where Maven copies `src/main/resources`. Then `@Value("${key}")` or `Environment.getProperty("key")` reads the values.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'When is `@Bean` the better choice instead of `@Component`? (choose all that apply)',
      options: [
        'The class comes from a library you cannot edit (e.g. HikariDataSource, JdbcTemplate)',
        'Creation needs custom code such as setting URL, pool size and password',
        'You want to create two differently configured beans of the same class',
        'For your own simple service class, you must always use @Bean',
      ],
      answers: [0, 1, 2],
      explain: 'You cannot put `@Component` on a library class, and @Bean methods let you run any setup code and create several variants. For your own classes, `@Component`/`@Service` with scanning is simpler.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `@Import(DatabaseConfig.class)` on `AppConfig` do?',
      options: [
        'Imports a Java package',
        'Adds the beans defined in DatabaseConfig to the same context, so the config can be split into several classes',
        'Imports data into MySQL',
        'Copies the class file into the project',
      ],
      answer: 1,
      explain: '`@Import` combines configuration classes: start the context with `AppConfig` only, and DatabaseConfig\'s beans are loaded too. It keeps large configurations organised (web, database, security).',
    },
  ],
};
