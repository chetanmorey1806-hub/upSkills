export default {
  id: 'day-05-java-based-configuration',
  title: 'Java-based Configuration: @Configuration, @Bean, @ComponentScan',
  module: 'Module 1: Spring Core',
  day: 5,
  level: 'Intermediate',
  duration: '2 hours',
  summary: `Configure Spring 100% in Java with @Configuration classes and @Bean methods, combine them with @ComponentScan, @Import and @PropertySource, and understand why @Configuration classes are proxied.`,
  objectives: [
    `Write a @Configuration class with @Bean methods`,
    `Use @ComponentScan to combine scanned components with @Bean definitions`,
    `Explain full (@Configuration) vs lite (@Component) mode for @Bean methods`,
    `Split configuration with @Import and read properties with @PropertySource and @Value`,
    `Decide when to use @Bean vs @Component`,
  ],
  theory: [
    {
      heading: 'Why Java configuration?',
      content: `XML is verbose and not type-safe (a typo in a class name is found only at runtime). Annotations like @Component work only on YOUR classes. Java config gives the best of both: type-safe, refactor-friendly code, and you can create beans for third-party classes (DataSource, ObjectMapper, RestTemplate) that you cannot annotate. Analogy: XML is a hand-written shopping list, Java config is an online cart with auto-complete and error checking.`,
    },
    {
      heading: '@Configuration and @Bean',
      content: `@Configuration marks a class as a source of bean definitions. Each method annotated with @Bean returns an object that becomes a bean. The method name is the bean name (override with @Bean("name") or @Bean(name = {"a","b"})). Dependencies can be method parameters (preferred) or calls to other @Bean methods.`,
      syntax: `@Configuration
public class AppConfig {
    @Bean
    public DataSource dataSource() { ... }

    @Bean(initMethod = "init", destroyMethod = "close")
    public UserDao userDao(DataSource dataSource) {   // parameter injection
        return new UserDao(dataSource);
    }
}
var ctx = new AnnotationConfigApplicationContext(AppConfig.class);`,
    },
    {
      heading: 'Full mode vs lite mode (the proxy secret)',
      content: `Spring subclasses every @Configuration class at runtime using CGLIB. The proxy intercepts calls to @Bean methods: if the bean already exists it returns the cached singleton instead of running the method again. So userDao() and orderDao() both calling dataSource() share ONE DataSource. If you put @Bean methods in a @Component class (lite mode) or use @Configuration(proxyBeanMethods = false), the call is a normal Java call and creates a NEW object each time. Diagram in words: userDao() -> dataSource() -> [proxy checks cache] -> existing DataSource.`,
      tip: `Because of the CGLIB subclass, @Configuration classes and @Bean methods must not be final or private.`,
    },
    {
      heading: '@ComponentScan',
      content: `@ComponentScan on a @Configuration class turns on component scanning (Java equivalent of <context:component-scan>). Without a value it scans the package of the config class and sub-packages. You can mix: scanned @Service/@Repository classes plus @Bean methods for library objects.`,
      syntax: `@Configuration
@ComponentScan(basePackages = {"com.demo.service", "com.demo.dao"})
public class AppConfig { }

@ComponentScan(basePackageClasses = AppConfig.class)    // type-safe
@ComponentScan(value = "com.demo",
    excludeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = Controller.class))`,
    },
    {
      heading: '@Import, @PropertySource and @Value',
      content: `Large apps split config: DbConfig, ServiceConfig, WebConfig. @Import(DbConfig.class) pulls another config in. @PropertySource("classpath:app.properties") loads a properties file into the Environment; @Value("\${db.url}") injects one value (default: \${db.pool:5}).`,
      syntax: `@Configuration
@Import(DbConfig.class)
@PropertySource("classpath:app.properties")
public class AppConfig {
    @Value("\${app.name}") private String appName;
}`,
    },
    {
      heading: '@Bean vs @Component: when to use which',
      content: `Both create beans.`,
      points: [
        `@Component: on your own classes, detected automatically by scanning`,
        `@Bean: on a method in a config class; for third-party classes or when creation needs logic (if/else, builders)`,
        `@Bean gives full control over construction; @Component keeps config close to the class`,
        `Most real projects use both: @Service/@Repository for own code, @Bean for DataSource, JdbcTemplate, ObjectMapper`,
      ],
    },
  ],
  examples: [
    {
      title: 'Why @Configuration is proxied (plain Java simulation)',
      scenario: `Two DAOs call dataSource(). Without a proxy, each call makes a new DataSource (lite mode). We write a subclass that caches the result, exactly what Spring's CGLIB proxy does in full mode. Runs in the browser IDE.`,
      steps: [
        'Create Main.java and paste the code',
        'Click Run ▶',
        'Count how many DataSource objects are created in each mode',
      ],
      code: `import java.util.*;

class DataSource {
    private static int count = 0;
    final int id;
    DataSource() { id = ++count; System.out.println("DataSource #" + id + " created"); }
}
class UserDao { final DataSource ds; UserDao(DataSource ds) { this.ds = ds; } }
class OrderDao { final DataSource ds; OrderDao(DataSource ds) { this.ds = ds; } }

// Our "configuration class" with @Bean-like methods
class AppConfig {
    DataSource dataSource() { return new DataSource(); }
    UserDao userDao() { return new UserDao(dataSource()); }
    OrderDao orderDao() { return new OrderDao(dataSource()); }
}

// What Spring generates for @Configuration (CGLIB subclass)
class AppConfigProxy extends AppConfig {
    private final Map<String, Object> singletons = new HashMap<>();
    @Override
    DataSource dataSource() {
        if (!singletons.containsKey("dataSource")) {
            singletons.put("dataSource", super.dataSource());
        }
        return (DataSource) singletons.get("dataSource");
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("Lite mode (plain class):");
        AppConfig plain = new AppConfig();
        UserDao u1 = plain.userDao();
        OrderDao o1 = plain.orderDao();
        System.out.println("Shared DataSource? " + (u1.ds == o1.ds));

        System.out.println("Full mode (@Configuration proxy):");
        AppConfig proxy = new AppConfigProxy();
        UserDao u2 = proxy.userDao();
        OrderDao o2 = proxy.orderDao();
        System.out.println("Shared DataSource? " + (u2.ds == o2.ds));
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.*;

class DataSource {
    private static int count = 0;
    final int id;
    DataSource() { id = ++count; System.out.println("DataSource #" + id + " created"); }
}
class UserDao { final DataSource ds; UserDao(DataSource ds) { this.ds = ds; } }
class OrderDao { final DataSource ds; OrderDao(DataSource ds) { this.ds = ds; } }

class AppConfig {
    DataSource dataSource() { return new DataSource(); }
    UserDao userDao() { return new UserDao(dataSource()); }
    OrderDao orderDao() { return new OrderDao(dataSource()); }
}

class AppConfigProxy extends AppConfig {
    private final Map<String, Object> singletons = new HashMap<>();
    @Override
    DataSource dataSource() {
        if (!singletons.containsKey("dataSource")) {
            singletons.put("dataSource", super.dataSource());
        }
        return (DataSource) singletons.get("dataSource");
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("Lite mode (plain class):");
        AppConfig plain = new AppConfig();
        UserDao u1 = plain.userDao();
        OrderDao o1 = plain.orderDao();
        System.out.println("Shared DataSource? " + (u1.ds == o1.ds));

        System.out.println("Full mode (@Configuration proxy):");
        AppConfig proxy = new AppConfigProxy();
        UserDao u2 = proxy.userDao();
        OrderDao o2 = proxy.orderDao();
        System.out.println("Shared DataSource? " + (u2.ds == o2.ds));
    }
}`,
        },
      },
      result: `Lite mode (plain class):
DataSource #1 created
DataSource #2 created
Shared DataSource? false
Full mode (@Configuration proxy):
DataSource #3 created
Shared DataSource? true`,
      explanation: `In the proxy, userDao() calls dataSource() which is dispatched to the overriding method (polymorphism), so the second call returns the cached object. That is why a @Configuration class gives singleton semantics even for inter-bean method calls.`,
    },
    {
      title: 'Complete Java-config application',
      scenario: `A greeting app where GreetingRepository is scanned (@Repository) and a Clock-like helper comes from a @Bean method.`,
      steps: [
        'Create a Maven project with spring-context 6.1.14 (Eclipse/STS: File > New > Maven Project; IntelliJ: File > New > Project > Maven, JDK 17)',
        'Create packages com.demo and com.demo.repo',
        'Add the classes below, then run JavaConfigApp',
      ],
      code: `// com/demo/repo/GreetingRepository.java
package com.demo.repo;
import org.springframework.stereotype.Repository;
@Repository
public class GreetingRepository {
    public String template() { return "Good morning, %s!"; }
}

// com/demo/Formatter.java  (pretend this is a third-party class we cannot annotate)
package com.demo;
public class Formatter {
    private final boolean upper;
    public Formatter(boolean upper) { this.upper = upper; }
    public String format(String s) { return upper ? s.toUpperCase() : s; }
}

// com/demo/GreetingService.java
package com.demo;
import com.demo.repo.GreetingRepository;
import org.springframework.stereotype.Service;
@Service
public class GreetingService {
    private final GreetingRepository repo;
    private final Formatter formatter;
    public GreetingService(GreetingRepository repo, Formatter formatter) {
        this.repo = repo; this.formatter = formatter;
    }
    public String greet(String name) { return formatter.format(String.format(repo.template(), name)); }
}

// com/demo/AppConfig.java
package com.demo;
import org.springframework.context.annotation.*;
@Configuration
@ComponentScan("com.demo")
public class AppConfig {
    @Bean
    public Formatter formatter() { return new Formatter(true); }
}

// com/demo/JavaConfigApp.java
package com.demo;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
public class JavaConfigApp {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext(AppConfig.class)) {
            System.out.println(ctx.getBean(GreetingService.class).greet("Asha"));
            System.out.println("Has formatter bean? " + ctx.containsBean("formatter"));
        }
    }
}`,
      result: `GOOD MORNING, ASHA!
Has formatter bean? true`,
      explanation: `GreetingRepository and GreetingService come from scanning; Formatter comes from @Bean. Spring injects both into GreetingService's constructor. The @Bean method name "formatter" becomes the bean name, so containsBean("formatter") is true.`,
    },
    {
      title: '@PropertySource, @Value and @Import',
      scenario: `Read database settings from a properties file in a separate DbConfig class.`,
      steps: [
        'Create src/main/resources/app.properties',
        'Create DbConfig with @PropertySource and @Value fields',
        'Import DbConfig into AppConfig and run',
      ],
      code: `# app.properties
db.url=jdbc:mysql://localhost:3306/shop
db.user=root

// DbSettings.java
package com.demo;
public record DbSettings(String url, String user, int poolSize) { }

// DbConfig.java
package com.demo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
@Configuration
@PropertySource("classpath:app.properties")
public class DbConfig {
    @Bean
    public DbSettings dbSettings(@Value("\${db.url}") String url,
                                 @Value("\${db.user}") String user,
                                 @Value("\${db.pool:5}") int pool) {
        return new DbSettings(url, user, pool);
    }
}

// AppConfig.java
@Configuration
@Import(DbConfig.class)
public class AppConfig { }

// main
try (var ctx = new AnnotationConfigApplicationContext(AppConfig.class)) {
    System.out.println(ctx.getBean(DbSettings.class));
}`,
      result: `DbSettings[url=jdbc:mysql://localhost:3306/shop, user=root, poolSize=5]`,
      explanation: `db.pool is missing in the file, so the default after the colon (5) is used. @Import registers DbConfig even though it is not scanned.`,
    },
  ],
  interview: [
    { q: 'What is @Configuration?', a: 'A class-level annotation marking a class as a source of bean definitions via @Bean methods. It is itself a @Component and is CGLIB-proxied for singleton semantics.', level: 'Easy' },
    { q: 'What is @Bean?', a: 'A method-level annotation; the returned object is registered as a bean whose name defaults to the method name.', level: 'Easy' },
    { q: '@Bean vs @Component?', a: '@Component is class-level and auto-detected by scanning (own classes). @Bean is method-level in a config class, giving explicit control and working for third-party classes.', level: 'Medium' },
    { q: 'Why are @Configuration classes proxied?', a: 'So that calls between @Bean methods return the same container-managed singleton instead of creating new objects.', level: 'Hard' },
    { q: 'What is proxyBeanMethods = false?', a: 'Lite mode: no CGLIB proxy, faster startup; inter-bean method calls create new objects, so use parameter injection instead.', level: 'Hard' },
    { q: 'What does @ComponentScan do without arguments?', a: 'Scans the package of the annotated class and all sub-packages.', level: 'Easy' },
    { q: 'How do you combine multiple configuration classes?', a: 'Use @Import, pass several classes to AnnotationConfigApplicationContext, or let @ComponentScan find @Configuration classes.', level: 'Medium' },
    { q: 'How do you read values from a properties file?', a: '@PropertySource("classpath:file.properties") and @Value("${key:default}") or Environment.getProperty("key").', level: 'Medium' },
    { q: 'Can a @Bean method be private or final?', a: 'No in full mode, because the CGLIB subclass must override it.', level: 'Medium' },
    { q: 'How do you set init and destroy methods with @Bean?', a: '@Bean(initMethod = "init", destroyMethod = "cleanup"). Spring also auto-detects public close()/shutdown() as destroy methods.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Plain Java: extend the simulation so AppConfigProxy also caches userDao(). Call proxy.userDao() twice and print whether both are the same.',
      hint: 'Override userDao() the same way as dataSource().',
      solution: `class AppConfigProxy extends AppConfig {
    private final Map<String, Object> singletons = new HashMap<>();
    @Override DataSource dataSource() {
        if (!singletons.containsKey("dataSource")) singletons.put("dataSource", super.dataSource());
        return (DataSource) singletons.get("dataSource");
    }
    @Override UserDao userDao() {
        if (!singletons.containsKey("userDao")) singletons.put("userDao", super.userDao());
        return (UserDao) singletons.get("userDao");
    }
}
// main
AppConfig p = new AppConfigProxy();
System.out.println(p.userDao() == p.userDao());   // DataSource #1 created, then true`,
    },
    {
      task: 'Create a @Configuration class that defines two beans of type String named "appName" and "version" and a bean AppInfo that receives both.',
      hint: 'Use @Qualifier on @Bean parameters or parameter names.',
      solution: `@Configuration
public class InfoConfig {
    @Bean public String appName() { return "ShopApp"; }
    @Bean public String version() { return "1.0"; }
    @Bean public AppInfo appInfo(@Qualifier("appName") String name, @Qualifier("version") String v) {
        return new AppInfo(name, v);
    }
}
public record AppInfo(String name, String version) { }`,
    },
    {
      task: 'Write a config that scans only com.demo.service and excludes classes annotated with @Controller.',
      hint: 'excludeFilters with FilterType.ANNOTATION.',
      solution: `@Configuration
@ComponentScan(basePackages = "com.demo.service",
    excludeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = Controller.class))
public class ServiceConfig { }`,
    },
    {
      task: 'Using @Profile, create a "dev" bean returning "H2 database" and a "prod" bean returning "MySQL database" of type DbInfo. Activate dev in main.',
      hint: 'ctx.getEnvironment().setActiveProfiles("dev"); then register and refresh.',
      solution: `@Configuration
public class ProfileConfig {
    @Bean @Profile("dev")  public DbInfo devDb()  { return new DbInfo("H2 database"); }
    @Bean @Profile("prod") public DbInfo prodDb() { return new DbInfo("MySQL database"); }
}
public record DbInfo(String name) { }

var ctx = new AnnotationConfigApplicationContext();
ctx.getEnvironment().setActiveProfiles("dev");
ctx.register(ProfileConfig.class);
ctx.refresh();
System.out.println(ctx.getBean(DbInfo.class).name());   // H2 database
ctx.close();`,
    },
  ],
  quiz: [
    { question: 'Default name of a bean created by @Bean public JdbcTemplate jdbcTemplate()?', options: ['JdbcTemplate', 'jdbcTemplate', 'template', 'bean1'], answer: 1, explanation: 'Method name is the bean name.' },
    { question: 'Which library does Spring use to proxy @Configuration classes?', options: ['JDK dynamic proxy', 'Javassist', 'CGLIB', 'ByteBuddy only'], answer: 2, explanation: 'Spring uses (repackaged) CGLIB to subclass config classes.' },
    { question: 'Which annotation loads a .properties file into the Environment?', options: ['@PropertySource', '@Value', '@ConfigFile', '@Import'], answer: 0, explanation: '@PropertySource registers the file; @Value reads keys.' },
    { question: 'Best choice to register a third-party class as a bean?', options: ['@Component on it', 'Edit the jar', '@Autowired', '@Bean method'], answer: 3, explanation: 'You cannot annotate library classes, so use @Bean.' },
    { question: 'Which annotation pulls another @Configuration class in?', options: ['@Include', '@Import', '@ComponentScan only', '@Extends'], answer: 1, explanation: '@Import(OtherConfig.class).' },
  ],
};
