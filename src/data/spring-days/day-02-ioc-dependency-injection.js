export default {
  id: 'day-02-ioc-dependency-injection',
  title: 'IoC and Dependency Injection, BeanFactory vs ApplicationContext',
  module: 'Module 1: Spring Core',
  day: 2,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Understand Inversion of Control and Dependency Injection with a hand-made mini container in plain Java, then see how Spring's two containers, BeanFactory and ApplicationContext, do the same job.`,
  objectives: [
    `Define Inversion of Control (IoC) and Dependency Injection (DI) in interview-ready words`,
    `Build a tiny IoC container in plain Java to see how Spring works internally`,
    `List the types of DI: constructor, setter and field injection`,
    `Compare BeanFactory and ApplicationContext (lazy vs eager, features)`,
    `Use ClassPathXmlApplicationContext and AnnotationConfigApplicationContext`,
  ],
  theory: [
    {
      heading: 'Inversion of Control (IoC)',
      content: `Normally YOUR code controls object creation: Car car = new Car(new PetrolEngine()). With IoC the control is inverted: a container creates objects and gives them to you. Analogy: in a restaurant you do not go into the kitchen and cook (you control); you order and the kitchen (container) prepares and serves (inverted control). Hollywood principle: "Don't call us, we'll call you."`,
      points: [
        `IoC = a design principle (who controls object creation and wiring)`,
        `The IoC container = the Spring object that does the creating and wiring`,
        `Objects managed by the container are called beans`,
      ],
    },
    {
      heading: 'Dependency Injection (DI)',
      content: `DI is the technique used to achieve IoC. A dependency is an object another object needs (Car needs Engine). Injection means the dependency is pushed into the object from outside instead of the object creating it. Diagram in words: Container --creates--> PetrolEngine; Container --creates Car and injects PetrolEngine--> Car. Car only knows the Engine interface.`,
      points: [
        `Constructor injection: dependency passed in the constructor (recommended for required dependencies, supports final fields)`,
        `Setter injection: dependency passed through a setter (good for optional dependencies)`,
        `Field injection: @Autowired directly on a field (short, but hard to test; avoid in production code)`,
      ],
      tip: `Interview line: "IoC is the principle, DI is the pattern that implements it, and the Spring container is the tool that performs DI."`,
    },
    {
      heading: 'The Spring IoC container: how it works',
      content: `Step 1: You give configuration metadata (XML, annotations or Java @Configuration). Step 2: The container reads it and creates BeanDefinitions (a recipe for each bean: class, scope, dependencies). Step 3: It instantiates beans, injects dependencies and runs lifecycle callbacks. Step 4: Your code asks for beans with getBean() or, better, gets them injected. Step 5: On close(), singleton beans are destroyed.`,
      syntax: `ApplicationContext ctx = new ClassPathXmlApplicationContext("beans.xml");
ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class);
Car car = ctx.getBean(Car.class);              // by type
Car car = ctx.getBean("car", Car.class);       // by name and type`,
    },
    {
      heading: 'BeanFactory',
      content: `BeanFactory (org.springframework.beans.factory) is the root, basic container interface. It supports DI and getBean(). It creates beans lazily: a singleton is created only when you first ask for it. The main implementation is DefaultListableBeanFactory. It is rarely used directly today (memory-limited devices only).`,
    },
    {
      heading: 'ApplicationContext',
      content: `ApplicationContext extends BeanFactory and adds enterprise features. It pre-instantiates (eagerly creates) all singleton beans at startup, so configuration errors are found immediately. Implementations: ClassPathXmlApplicationContext, FileSystemXmlApplicationContext, AnnotationConfigApplicationContext, and web contexts like AnnotationConfigWebApplicationContext.`,
      points: [
        `Eager singleton creation (fail-fast at startup)`,
        `Automatic BeanPostProcessor registration (so @Autowired, @PostConstruct work)`,
        `Internationalization (MessageSource)`,
        `Event publishing (ApplicationEventPublisher)`,
        `Resource loading and Environment/profiles`,
      ],
      tip: `Always use ApplicationContext unless you have a very special reason. Common mistake: forgetting to close it, so @PreDestroy methods never run. Use try-with-resources or ctx.close().`,
    },
    {
      heading: 'BeanFactory vs ApplicationContext (table in words)',
      content: `Creation: BeanFactory lazy | ApplicationContext eager for singletons. Annotations: BeanFactory needs manual post-processor registration | ApplicationContext automatic. i18n, events, AOP auto-proxy: not in BeanFactory | built into ApplicationContext. Usage: BeanFactory for very lightweight cases | ApplicationContext for almost all real applications.`,
    },
  ],
  examples: [
    {
      title: 'Build a mini IoC container in plain Java',
      scenario: `To understand what Spring does internally, we write a 20-line container that stores bean recipes, creates beans lazily (like BeanFactory) and caches them as singletons. Runs in the browser IDE without Spring.`,
      steps: [
        'Create Main.java (IntelliJ: right-click src > New > Java Class)',
        'Paste the code and click Run ▶',
        'Notice the order of the "Creating bean" lines',
      ],
      code: `import java.util.*;
import java.util.function.Supplier;

interface Engine { String type(); }
class PetrolEngine implements Engine { public String type() { return "Petrol"; } }

class Car {
    private final Engine engine;
    Car(Engine engine) { this.engine = engine; }      // constructor injection
    void drive() { System.out.println("Car running with " + engine.type() + " engine"); }
}

class MiniContainer {
    private final Map<Class<?>, Supplier<?>> definitions = new HashMap<>();
    private final Map<Class<?>, Object> singletons = new HashMap<>();

    <T> void register(Class<T> type, Supplier<T> recipe) { definitions.put(type, recipe); }

    <T> T getBean(Class<T> type) {
        Object bean = singletons.get(type);
        if (bean == null) {                                  // lazy, like BeanFactory
            System.out.println("Creating bean: " + type.getSimpleName());
            bean = definitions.get(type).get();
            singletons.put(type, bean);                      // singleton cache
        }
        return type.cast(bean);
    }
}

public class Main {
    public static void main(String[] args) {
        MiniContainer c = new MiniContainer();
        c.register(Engine.class, () -> new PetrolEngine());
        c.register(Car.class, () -> new Car(c.getBean(Engine.class)));
        System.out.println("Container ready");

        Car car = c.getBean(Car.class);
        car.drive();
        Car car2 = c.getBean(Car.class);
        System.out.println("Same car? " + (car == car2));
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.*;
import java.util.function.Supplier;

interface Engine { String type(); }
class PetrolEngine implements Engine { public String type() { return "Petrol"; } }

class Car {
    private final Engine engine;
    Car(Engine engine) { this.engine = engine; }
    void drive() { System.out.println("Car running with " + engine.type() + " engine"); }
}

class MiniContainer {
    private final Map<Class<?>, Supplier<?>> definitions = new HashMap<>();
    private final Map<Class<?>, Object> singletons = new HashMap<>();

    <T> void register(Class<T> type, Supplier<T> recipe) { definitions.put(type, recipe); }

    <T> T getBean(Class<T> type) {
        Object bean = singletons.get(type);
        if (bean == null) {
            System.out.println("Creating bean: " + type.getSimpleName());
            bean = definitions.get(type).get();
            singletons.put(type, bean);
        }
        return type.cast(bean);
    }
}

public class Main {
    public static void main(String[] args) {
        MiniContainer c = new MiniContainer();
        c.register(Engine.class, () -> new PetrolEngine());
        c.register(Car.class, () -> new Car(c.getBean(Engine.class)));
        System.out.println("Container ready");

        Car car = c.getBean(Car.class);
        car.drive();
        Car car2 = c.getBean(Car.class);
        System.out.println("Same car? " + (car == car2));
    }
}`,
        },
      },
      result: `Container ready
Creating bean: Car
Creating bean: Engine
Car running with Petrol engine
Same car? true`,
      explanation: `Nothing is created at registration (lazy). Asking for Car runs its recipe, which asks for Engine, so Engine is created inside Car's creation (dependency resolution). The second getBean returns the cached object, which is exactly Spring's default singleton scope.`,
    },
    {
      title: 'BeanFactory (lazy) vs ApplicationContext (eager) in Spring',
      scenario: `Prove that ApplicationContext creates singletons at startup while BeanFactory waits until getBean().`,
      steps: [
        'Create a Maven project with spring-context 6.1.14 (see Day 1)',
        'Create src/main/resources/beans.xml (Eclipse: right-click resources > New > Other > XML File; IntelliJ: New > File)',
        'Create Engine.java and MainApp.java in package com.demo',
        'Run MainApp and read the order of messages',
      ],
      code: `<!-- src/main/resources/beans.xml -->
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
         https://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id="engine" class="com.demo.Engine"/>
</beans>

// Engine.java
package com.demo;
public class Engine {
    public Engine() { System.out.println("Engine constructor called"); }
}

// MainApp.java
package com.demo;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.beans.factory.xml.XmlBeanDefinitionReader;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MainApp {
    public static void main(String[] args) {
        System.out.println("--- BeanFactory ---");
        DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
        new XmlBeanDefinitionReader(factory).loadBeanDefinitions("beans.xml");
        System.out.println("Factory ready");
        factory.getBean("engine");

        System.out.println("--- ApplicationContext ---");
        ClassPathXmlApplicationContext ctx = new ClassPathXmlApplicationContext("beans.xml");
        System.out.println("Context ready");
        ctx.getBean("engine");
        ctx.close();
    }
}`,
      result: `--- BeanFactory ---
Factory ready
Engine constructor called
--- ApplicationContext ---
Engine constructor called
Context ready`,
      explanation: `With BeanFactory the constructor runs only at getBean(). With ApplicationContext the constructor runs while the context starts, before "Context ready". The second getBean returns the same singleton so no extra message appears.`,
    },
    {
      title: 'DI with ApplicationContext and Java configuration',
      scenario: `Wire Car and Engine with Spring instead of our mini container.`,
      steps: [
        'In the same project create Engine (interface), DieselEngine, Car and AppConfig in com.demo',
        'Eclipse: right-click package > New > Class; IntelliJ: right-click package > New > Java Class',
        'Run CarApp',
      ],
      code: `package com.demo;
public interface Engine { String type(); }

public class DieselEngine implements Engine {
    public String type() { return "Diesel"; }
}

public class Car {
    private final Engine engine;
    public Car(Engine engine) { this.engine = engine; }
    public void drive() { System.out.println("Car running with " + engine.type() + " engine"); }
}

import org.springframework.context.annotation.*;
@Configuration
public class AppConfig {
    @Bean public Engine engine() { return new DieselEngine(); }
    @Bean public Car car(Engine engine) { return new Car(engine); }   // Spring passes the engine bean
}

import org.springframework.context.annotation.AnnotationConfigApplicationContext;
public class CarApp {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext(AppConfig.class)) {
            ctx.getBean(Car.class).drive();
        }
    }
}`,
      result: `Car running with Diesel engine`,
      explanation: `The @Bean method car(Engine engine) declares a dependency as a parameter, and the container injects the Engine bean. Changing to PetrolEngine needs a change only in AppConfig, not in Car.`,
    },
  ],
  interview: [
    { q: 'What is Inversion of Control?', a: 'A principle where control of object creation and wiring moves from application code to a container/framework.', level: 'Easy' },
    { q: 'What is Dependency Injection?', a: 'A design pattern that implements IoC: dependencies are supplied to an object from outside (constructor, setter or field) instead of being created inside it.', level: 'Easy' },
    { q: 'Difference between IoC and DI?', a: 'IoC is the general principle; DI is one concrete way to achieve it. Other IoC forms include service locator and template method callbacks.', level: 'Medium' },
    { q: 'What are the types of DI in Spring?', a: 'Constructor injection, setter injection and field injection. Spring recommends constructor injection for mandatory dependencies.', level: 'Easy' },
    { q: 'BeanFactory vs ApplicationContext?', a: 'BeanFactory is the basic container with lazy bean creation. ApplicationContext extends it with eager singleton creation, automatic post-processor registration, events, i18n, resource loading and environment/profile support.', level: 'Medium' },
    { q: 'Name implementations of ApplicationContext.', a: 'ClassPathXmlApplicationContext, FileSystemXmlApplicationContext, AnnotationConfigApplicationContext, GenericApplicationContext, AnnotationConfigWebApplicationContext.', level: 'Easy' },
    { q: 'Why is eager initialization useful?', a: 'Configuration errors (missing beans, wrong classes) are detected at startup instead of at the first request in production.', level: 'Medium' },
    { q: 'What is a BeanDefinition?', a: 'The metadata/recipe for a bean: class name, scope, constructor args, properties, init/destroy methods, lazy flag. The container creates beans from BeanDefinitions.', level: 'Hard' },
    { q: 'Why is field injection discouraged?', a: 'It hides dependencies, prevents final fields, and you cannot create the object in a unit test without reflection or Spring.', level: 'Medium' },
    { q: 'Can ApplicationContext create beans lazily?', a: 'Yes, mark a bean with @Lazy or lazy-init="true" in XML; it is then created on first use.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Extend the MiniContainer so that register() takes a boolean singleton flag. For prototype beans, return a new object every time. Print whether two Engine lookups are the same.',
      hint: 'Store the flag in a second map; skip the cache when false.',
      solution: `import java.util.*;
import java.util.function.Supplier;

class Engine {}

class MiniContainer {
    private final Map<Class<?>, Supplier<?>> defs = new HashMap<>();
    private final Map<Class<?>, Boolean> single = new HashMap<>();
    private final Map<Class<?>, Object> cache = new HashMap<>();
    <T> void register(Class<T> t, Supplier<T> s, boolean singleton) { defs.put(t, s); single.put(t, singleton); }
    <T> T getBean(Class<T> t) {
        if (!single.get(t)) return t.cast(defs.get(t).get());
        return t.cast(cache.computeIfAbsent(t, k -> defs.get(k).get()));
    }
}

public class Main {
    public static void main(String[] args) {
        MiniContainer c = new MiniContainer();
        c.register(Engine.class, Engine::new, false);
        System.out.println(c.getBean(Engine.class) == c.getBean(Engine.class)); // false
    }
}`,
    },
    {
      task: 'Write the XML and main class to load a bean "student" of class com.demo.Student with ClassPathXmlApplicationContext and print a message from it.',
      hint: '<bean id="student" class="com.demo.Student"/>',
      solution: `<!-- beans.xml -->
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans https://www.springframework.org/schema/beans/spring-beans.xsd">
  <bean id="student" class="com.demo.Student"/>
</beans>

public class Student { public void study() { System.out.println("Student is studying Spring"); } }

public class MainApp {
    public static void main(String[] args) {
        try (var ctx = new ClassPathXmlApplicationContext("beans.xml")) {
            ctx.getBean("student", Student.class).study();
        }
    }
}`,
    },
    {
      task: 'Add @Lazy on a @Bean method and prove with a constructor print that it is created only when getBean is called.',
      hint: 'Print "Context ready" before getBean.',
      solution: `@Configuration
public class AppConfig {
    @Bean @Lazy public Report report() { return new Report(); }
}
public class Report { public Report() { System.out.println("Report created"); } }
public class MainApp {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext(AppConfig.class)) {
            System.out.println("Context ready");
            ctx.getBean(Report.class);
        }
    }
}
// Output: Context ready
//         Report created`,
    },
    {
      task: 'In plain Java, write a Laptop class that receives Processor through a setter (setter injection). Inject IntelProcessor and print "Laptop with Intel".',
      hint: 'Create the object first, then call the setter.',
      solution: `interface Processor { String name(); }
class IntelProcessor implements Processor { public String name() { return "Intel"; } }
class Laptop {
    private Processor processor;
    void setProcessor(Processor p) { this.processor = p; }
    void show() { System.out.println("Laptop with " + processor.name()); }
}
public class Main {
    public static void main(String[] args) {
        Laptop l = new Laptop();
        l.setProcessor(new IntelProcessor());
        l.show();
    }
}`,
    },
  ],
  quiz: [
    { question: 'IoC means...', options: ['Objects create their own dependencies', 'A container controls object creation and wiring', 'Using only interfaces', 'Inheritance of classes'], answer: 1, explanation: 'Control is inverted from your code to the container.' },
    { question: 'Which container creates singleton beans eagerly by default?', options: ['BeanFactory', 'ObjectFactory', 'ApplicationContext', 'FactoryBean'], answer: 2, explanation: 'ApplicationContext pre-instantiates singletons on refresh.' },
    { question: 'Which DI type is recommended for mandatory dependencies?', options: ['Constructor injection', 'Field injection', 'Setter injection', 'Interface injection'], answer: 0, explanation: 'Constructor injection makes dependencies explicit and allows final fields.' },
    { question: 'Which class loads XML configuration from the classpath?', options: ['AnnotationConfigApplicationContext', 'XmlWebContext', 'BeanFactoryUtils', 'ClassPathXmlApplicationContext'], answer: 3, explanation: 'ClassPathXmlApplicationContext reads XML files on the classpath.' },
    { question: 'Which feature is NOT provided by plain BeanFactory?', options: ['getBean()', 'Event publishing', 'Dependency injection', 'Singleton beans'], answer: 1, explanation: 'Event publishing is an ApplicationContext feature.' },
  ],
};
