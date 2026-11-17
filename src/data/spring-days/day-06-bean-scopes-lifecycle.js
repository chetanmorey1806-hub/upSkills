export default {
  id: 'day-06-bean-scopes-lifecycle',
  title: 'Bean Scopes and Bean Lifecycle (@PostConstruct, @PreDestroy)',
  module: 'Module 1: Spring Core',
  day: 6,
  level: 'Intermediate',
  duration: '2 hours',
  summary: `Learn how many objects Spring creates for a bean (singleton, prototype, request, session, application, websocket) and every step of a bean's life from constructor to @PostConstruct to @PreDestroy.`,
  objectives: [
    `Explain all six bean scopes and choose the right one`,
    `Simulate singleton/prototype scopes and init/destroy callbacks in plain Java`,
    `List the complete Spring bean lifecycle in order`,
    `Use @PostConstruct/@PreDestroy (jakarta.annotation), InitializingBean/DisposableBean and initMethod/destroyMethod`,
    `Solve the "prototype inside singleton" problem with ObjectProvider`,
  ],
  theory: [
    {
      heading: 'What is a bean scope?',
      content: `Scope decides how many instances the container creates and how long they live. Analogy: a singleton is the office printer, one shared by everyone; a prototype is a paper cup, every person gets a new one; a request-scoped bean is a visitor badge valid for one visit; a session-scoped bean is a gym locker you keep until you log out.`,
      syntax: `@Component
@Scope("prototype")        // or ConfigurableBeanFactory.SCOPE_PROTOTYPE
public class ShoppingCart { }

<bean id="cart" class="com.demo.ShoppingCart" scope="prototype"/>`,
    },
    {
      heading: 'The six scopes',
      content: `Two scopes work everywhere; four need a web-aware ApplicationContext (Spring MVC).`,
      points: [
        `singleton (default): one instance per container, created at startup, shared`,
        `prototype: a new instance every time it is requested/injected; Spring does NOT call its destroy methods`,
        `request: one instance per HTTP request`,
        `session: one instance per HTTP session (e.g. a logged-in user's cart)`,
        `application: one instance per ServletContext`,
        `websocket: one instance per WebSocket session`,
      ],
      tip: `Spring singleton is NOT the GoF Singleton pattern. GoF = one per JVM/classloader; Spring = one per container per bean id. You can have two singleton beans of the same class with different ids.`,
    },
    {
      heading: 'Singleton beans and thread safety',
      content: `Since one singleton is shared by all threads (all users in a web app), never keep user-specific changing data in instance fields of a singleton service. Keep services stateless (only final dependencies) or use local variables. Stateful objects should be prototype or request/session scoped.`,
    },
    {
      heading: 'The bean lifecycle in order',
      content: `Think of a bean's life like an employee joining a company: hired (constructor), given tools (dependency injection), told their name and company (Aware interfaces), training (init callbacks), work (business methods), farewell process (destroy callbacks).`,
      points: [
        `1. Instantiation: constructor is called`,
        `2. Populate properties: setter/field injection`,
        `3. Aware callbacks: setBeanName(), setBeanFactory(), setApplicationContext()`,
        `4. BeanPostProcessor.postProcessBeforeInitialization()`,
        `5. @PostConstruct method`,
        `6. InitializingBean.afterPropertiesSet()`,
        `7. Custom init method (@Bean(initMethod) / init-method)`,
        `8. BeanPostProcessor.postProcessAfterInitialization() (AOP proxies are created here)`,
        `9. Bean is ready and used`,
        `10. On context close: @PreDestroy, then DisposableBean.destroy(), then custom destroy method`,
      ],
    },
    {
      heading: '@PostConstruct and @PreDestroy in Spring 6',
      content: `These come from Jakarta Annotations: import jakarta.annotation.PostConstruct and jakarta.annotation.PreDestroy. They are NOT part of the JDK since Java 11, so add the jakarta.annotation-api dependency. Use @PostConstruct for setup that needs injected dependencies (they are null inside the constructor for setter/field injection). Use @PreDestroy to release resources (close files, connections, thread pools).`,
      syntax: `<dependency>
  <groupId>jakarta.annotation</groupId>
  <artifactId>jakarta.annotation-api</artifactId>
  <version>2.1.1</version>
</dependency>`,
      tip: `Common mistakes: importing javax.annotation.PostConstruct (Spring 6 ignores it), and not closing the context so @PreDestroy never runs. In standalone apps use try-with-resources or ctx.registerShutdownHook().`,
    },
    {
      heading: 'Prototype inside a singleton',
      content: `If a singleton has a prototype dependency injected through its constructor, the prototype is injected only once, so the singleton always uses the same "prototype" object. Fix: inject ObjectProvider<T> (or ObjectFactory, or use @Lookup method injection) and call getObject() each time you need a fresh instance.`,
    },
  ],
  examples: [
    {
      title: 'Scopes and lifecycle in a mini container (plain Java)',
      scenario: `We extend our hand-made container: singleton beans are cached, prototype beans are created every time, init() runs after creation, and on close() only singletons get destroy() (just like Spring). Runs in the browser IDE.`,
      steps: [
        'Create Main.java and paste the code',
        'Click Run ▶',
        'Notice that Cart objects are never destroyed by the container',
      ],
      code: `import java.util.*;
import java.util.function.Supplier;

interface Lifecycle { void init(); void destroy(); }

class DbConnection implements Lifecycle {
    private static int count = 0;
    private final int id;
    DbConnection() { id = ++count; System.out.println("DbConnection created #" + id); }
    public void init() { System.out.println("DbConnection init #" + id); }       // like @PostConstruct
    public void destroy() { System.out.println("DbConnection destroy #" + id); } // like @PreDestroy
}

class Cart implements Lifecycle {
    private static int count = 0;
    private final int id;
    Cart() { id = ++count; System.out.println("Cart created #" + id); }
    public void init() { System.out.println("Cart init #" + id); }
    public void destroy() { System.out.println("Cart destroy #" + id); }
}

class MiniContainer {
    private final Map<String, Supplier<Object>> recipes = new HashMap<>();
    private final Map<String, String> scopes = new HashMap<>();
    private final Map<String, Object> singletons = new LinkedHashMap<>();

    void register(String name, String scope, Supplier<Object> recipe) {
        recipes.put(name, recipe);
        scopes.put(name, scope);
    }
    Object getBean(String name) {
        if ("prototype".equals(scopes.get(name))) return create(name);
        if (!singletons.containsKey(name)) singletons.put(name, create(name));
        return singletons.get(name);
    }
    private Object create(String name) {
        Object bean = recipes.get(name).get();
        if (bean instanceof Lifecycle l) l.init();
        return bean;
    }
    void close() {
        System.out.println("Closing container...");
        List<Object> beans = new ArrayList<>(singletons.values());
        Collections.reverse(beans);                       // destroy in reverse order
        for (Object b : beans) if (b instanceof Lifecycle l) l.destroy();
    }
}

public class Main {
    public static void main(String[] args) {
        MiniContainer c = new MiniContainer();
        c.register("db", "singleton", DbConnection::new);
        c.register("cart", "prototype", Cart::new);

        Object d1 = c.getBean("db");
        Object d2 = c.getBean("db");
        System.out.println("db same? " + (d1 == d2));

        Object c1 = c.getBean("cart");
        Object c2 = c.getBean("cart");
        System.out.println("cart same? " + (c1 == c2));

        c.close();
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.*;
import java.util.function.Supplier;

interface Lifecycle { void init(); void destroy(); }

class DbConnection implements Lifecycle {
    private static int count = 0;
    private final int id;
    DbConnection() { id = ++count; System.out.println("DbConnection created #" + id); }
    public void init() { System.out.println("DbConnection init #" + id); }
    public void destroy() { System.out.println("DbConnection destroy #" + id); }
}

class Cart implements Lifecycle {
    private static int count = 0;
    private final int id;
    Cart() { id = ++count; System.out.println("Cart created #" + id); }
    public void init() { System.out.println("Cart init #" + id); }
    public void destroy() { System.out.println("Cart destroy #" + id); }
}

class MiniContainer {
    private final Map<String, Supplier<Object>> recipes = new HashMap<>();
    private final Map<String, String> scopes = new HashMap<>();
    private final Map<String, Object> singletons = new LinkedHashMap<>();

    void register(String name, String scope, Supplier<Object> recipe) {
        recipes.put(name, recipe);
        scopes.put(name, scope);
    }
    Object getBean(String name) {
        if ("prototype".equals(scopes.get(name))) return create(name);
        if (!singletons.containsKey(name)) singletons.put(name, create(name));
        return singletons.get(name);
    }
    private Object create(String name) {
        Object bean = recipes.get(name).get();
        if (bean instanceof Lifecycle l) l.init();
        return bean;
    }
    void close() {
        System.out.println("Closing container...");
        List<Object> beans = new ArrayList<>(singletons.values());
        Collections.reverse(beans);
        for (Object b : beans) if (b instanceof Lifecycle l) l.destroy();
    }
}

public class Main {
    public static void main(String[] args) {
        MiniContainer c = new MiniContainer();
        c.register("db", "singleton", DbConnection::new);
        c.register("cart", "prototype", Cart::new);

        Object d1 = c.getBean("db");
        Object d2 = c.getBean("db");
        System.out.println("db same? " + (d1 == d2));

        Object c1 = c.getBean("cart");
        Object c2 = c.getBean("cart");
        System.out.println("cart same? " + (c1 == c2));

        c.close();
    }
}`,
        },
      },
      result: `DbConnection created #1
DbConnection init #1
db same? true
Cart created #1
Cart init #1
Cart created #2
Cart init #2
cart same? false
Closing container...
DbConnection destroy #1`,
      explanation: `The singleton is created and initialised once and destroyed on close. Each prototype request creates and initialises a new Cart, but the container does not track prototypes, so their destroy() is never called; the client code must clean them up.`,
    },
    {
      title: 'Full lifecycle order in Spring',
      scenario: `One bean implements every callback so we can see the exact order.`,
      steps: [
        'Add dependencies spring-context 6.1.14 and jakarta.annotation-api 2.1.1 to pom.xml, reload Maven (Eclipse: Alt+F5; IntelliJ: Maven reload)',
        'Create LifeBean and LifeConfig in com.demo',
        'Run LifeApp',
      ],
      code: `<dependencies>
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>6.1.14</version>
  </dependency>
  <dependency>
    <groupId>jakarta.annotation</groupId>
    <artifactId>jakarta.annotation-api</artifactId>
    <version>2.1.1</version>
  </dependency>
</dependencies>

// LifeBean.java
package com.demo;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.*;

public class LifeBean implements BeanNameAware, InitializingBean, DisposableBean {
    public LifeBean() { System.out.println("1 constructor"); }
    public void setBeanName(String name) { System.out.println("2 setBeanName: " + name); }
    @PostConstruct public void postConstruct() { System.out.println("3 @PostConstruct"); }
    public void afterPropertiesSet() { System.out.println("4 afterPropertiesSet"); }
    public void customInit() { System.out.println("5 initMethod"); }
    @PreDestroy public void preDestroy() { System.out.println("6 @PreDestroy"); }
    public void destroy() { System.out.println("7 DisposableBean.destroy"); }
    public void customDestroy() { System.out.println("8 destroyMethod"); }
}

// LifeConfig.java
package com.demo;
import org.springframework.context.annotation.*;
@Configuration
public class LifeConfig {
    @Bean(initMethod = "customInit", destroyMethod = "customDestroy")
    public LifeBean lifeBean() { return new LifeBean(); }
}

// LifeApp.java
package com.demo;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
public class LifeApp {
    public static void main(String[] args) {
        var ctx = new AnnotationConfigApplicationContext(LifeConfig.class);
        System.out.println("-- context ready --");
        ctx.close();
    }
}`,
      result: `1 constructor
2 setBeanName: lifeBean
3 @PostConstruct
4 afterPropertiesSet
5 initMethod
-- context ready --
6 @PreDestroy
7 DisposableBean.destroy
8 destroyMethod`,
      explanation: `Init order: annotation -> interface -> custom method. Destroy order follows the same pattern. Prefer @PostConstruct/@PreDestroy (no coupling to Spring interfaces) or initMethod/destroyMethod for third-party classes.`,
    },
    {
      title: 'Prototype inside singleton and the ObjectProvider fix',
      scenario: `A singleton CheckoutService needs a fresh prototype Cart for every customer.`,
      steps: [
        'Create Cart (@Component @Scope("prototype")) and CheckoutService (@Service)',
        'Inject ObjectProvider<Cart> instead of Cart',
        'Run and compare cart ids',
      ],
      code: `@Component
@Scope("prototype")
public class Cart {
    private static int counter = 0;
    private final int id = ++counter;
    public int getId() { return id; }
}

@Service
public class CheckoutService {
    private final Cart fixedCart;                  // injected ONCE
    private final ObjectProvider<Cart> carts;      // asks container each time
    public CheckoutService(Cart fixedCart, ObjectProvider<Cart> carts) {
        this.fixedCart = fixedCart; this.carts = carts;
    }
    public void serve(String customer) {
        System.out.println(customer + " fixedCart=" + fixedCart.getId() + " newCart=" + carts.getObject().getId());
    }
}

// main
try (var ctx = new AnnotationConfigApplicationContext("com.demo")) {
    CheckoutService s = ctx.getBean(CheckoutService.class);
    s.serve("Asha");
    s.serve("Ravi");
}`,
      result: `Asha fixedCart=1 newCart=2
Ravi fixedCart=1 newCart=3`,
      explanation: `fixedCart was injected once when the singleton was built, so it is always cart 1. ObjectProvider.getObject() returns a new prototype each call.`,
    },
  ],
  interview: [
    { q: 'What is the default bean scope?', a: 'singleton: one instance per Spring container per bean definition.', level: 'Easy' },
    { q: 'List all bean scopes.', a: 'singleton, prototype, request, session, application, websocket. The last four need a web-aware ApplicationContext.', level: 'Easy' },
    { q: 'Spring singleton vs GoF singleton?', a: 'GoF singleton has one instance per classloader enforced by the class. Spring singleton is one instance per container per bean id; the class itself can be instantiated many times.', level: 'Medium' },
    { q: 'Does Spring call destroy methods on prototype beans?', a: 'No. Spring creates, initialises and hands them over; the client is responsible for cleanup.', level: 'Medium' },
    { q: 'Explain the bean lifecycle.', a: 'Instantiate -> populate properties -> Aware callbacks -> BeanPostProcessor before-init -> @PostConstruct -> afterPropertiesSet -> init-method -> BeanPostProcessor after-init (proxies) -> ready -> on close: @PreDestroy -> DisposableBean.destroy -> destroy-method.', level: 'Hard' },
    { q: 'Which package has @PostConstruct in Spring 6?', a: 'jakarta.annotation (dependency jakarta.annotation-api). javax.annotation is not supported by Spring 6.', level: 'Medium' },
    { q: 'Why use @PostConstruct instead of the constructor?', a: 'With setter/field injection, dependencies are not available inside the constructor; @PostConstruct runs after injection is complete.', level: 'Medium' },
    { q: 'How do you inject a prototype bean into a singleton correctly?', a: 'Use ObjectProvider/ObjectFactory, @Lookup method injection, or a scoped proxy (proxyMode = ScopedProxyMode.TARGET_CLASS).', level: 'Hard' },
    { q: 'Are singleton beans thread-safe?', a: 'Not automatically. They are shared, so they must be stateless or synchronise mutable state.', level: 'Medium' },
    { q: 'What is a BeanPostProcessor?', a: 'A hook that lets you modify every bean before and after initialization; Spring uses it for @Autowired, @PostConstruct and AOP proxy creation.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Plain Java: add a "counter" singleton bean to the mini container that is a Lifecycle object printing "Counter init" and "Counter destroy". Register it after db and show the destroy order.',
      hint: 'Destroy runs in reverse creation order.',
      solution: `class Counter implements Lifecycle {
    Counter() { System.out.println("Counter created"); }
    public void init() { System.out.println("Counter init"); }
    public void destroy() { System.out.println("Counter destroy"); }
}
// main
c.register("counter", "singleton", Counter::new);
c.getBean("db");
c.getBean("counter");
c.close();
// ... Closing container...
// Counter destroy
// DbConnection destroy #1`,
    },
    {
      task: 'Create a FileLogger bean that opens a file name in @PostConstruct and prints "closing <file>" in @PreDestroy.',
      hint: 'Use jakarta.annotation imports and close the context.',
      solution: `@Component
public class FileLogger {
    private String file;
    @PostConstruct
    public void open() { file = "app.log"; System.out.println("opening " + file); }
    @PreDestroy
    public void close() { System.out.println("closing " + file); }
}`,
    },
    {
      task: 'Show with getBean twice that a prototype bean gives different hashCodes and a singleton gives the same.',
      hint: '@Scope("prototype") on one class.',
      solution: `@Component @Scope("prototype") public class Ticket { }
@Component public class Counter { }

try (var ctx = new AnnotationConfigApplicationContext("com.demo")) {
    System.out.println(ctx.getBean(Ticket.class) == ctx.getBean(Ticket.class));   // false
    System.out.println(ctx.getBean(Counter.class) == ctx.getBean(Counter.class)); // true
}`,
    },
    {
      task: 'Solve the prototype-in-singleton problem using @Lookup method injection.',
      hint: 'Abstract or dummy method annotated with @Lookup returning the prototype type.',
      solution: `@Service
public class CheckoutService {
    @Lookup
    public Cart newCart() { return null; }   // Spring overrides this with a CGLIB subclass
    public void serve(String customer) {
        System.out.println(customer + " cart=" + newCart().getId());
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which scope returns a new instance for every getBean() call?', options: ['singleton', 'request', 'prototype', 'application'], answer: 2, explanation: 'prototype = new object per request to the container.' },
    { question: 'Correct import for @PostConstruct in Spring 6?', options: ['jakarta.annotation.PostConstruct', 'javax.annotation.PostConstruct', 'org.springframework.PostConstruct', 'java.lang.PostConstruct'], answer: 0, explanation: 'Spring 6 uses the Jakarta namespace.' },
    { question: 'Which runs first?', options: ['afterPropertiesSet()', 'custom init-method', '@PreDestroy', '@PostConstruct'], answer: 3, explanation: '@PostConstruct runs before InitializingBean and init-method.' },
    { question: 'Destroy callbacks are NOT called for which scope?', options: ['singleton', 'prototype', 'session', 'application'], answer: 1, explanation: 'Container does not manage the full lifecycle of prototypes.' },
    { question: 'Which scope needs a web-aware ApplicationContext?', options: ['singleton', 'prototype', 'session', 'none of these'], answer: 2, explanation: 'request/session/application/websocket are web scopes.' },
  ],
};
