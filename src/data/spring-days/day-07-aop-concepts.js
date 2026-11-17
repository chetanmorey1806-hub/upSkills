export default {
  id: 'day-07-aop-concepts',
  title: 'AOP Concepts: Aspect, Advice, Pointcut, JoinPoint',
  module: 'Module 2: Spring AOP',
  day: 7,
  level: 'Intermediate',
  duration: '2 hours',
  summary: `Understand Aspect-Oriented Programming: why cross-cutting concerns like logging and security cause duplicate code, the AOP vocabulary (aspect, advice, pointcut, join point, target, proxy, weaving), and how Spring implements AOP with proxies.`,
  objectives: [
    `Identify cross-cutting concerns and the problems of code tangling and scattering`,
    `Define aspect, advice, join point, pointcut, target, proxy and weaving`,
    `Build a logging proxy in plain Java with java.lang.reflect.Proxy`,
    `Read and write basic AspectJ pointcut expressions`,
    `Explain JDK dynamic proxy vs CGLIB proxy in Spring`,
  ],
  theory: [
    {
      heading: 'Cross-cutting concerns',
      content: `Business logic is the main job of a method (transfer money, place order). But many methods also need logging, security checks, transactions, performance timing and caching. These "cross-cutting concerns" cut across many classes. If you write them inside every method you get code tangling (business + technical code mixed in one method) and code scattering (the same logging code copied in 100 places). Analogy: airport security. Every passenger, whatever their flight, passes the same security check. The airline does not write security rules into each flight; the airport applies them in one place for all flights. AOP is that central security check.`,
    },
    {
      heading: 'AOP vocabulary',
      content: `Learn these definitions by heart; every interview asks them.`,
      points: [
        `Aspect: a class that holds a cross-cutting concern (e.g. LoggingAspect). Annotated @Aspect`,
        `Join point: a point during execution where an aspect can be plugged in. In Spring AOP it is always a METHOD EXECUTION`,
        `Advice: the action taken at a join point (the code that runs) and WHEN: before, after, after returning, after throwing, around`,
        `Pointcut: an expression that SELECTS which join points get the advice, e.g. execution(* com.demo.service.*.*(..))`,
        `Target object: the original object being advised (your service)`,
        `Proxy: the object Spring creates around the target; callers talk to the proxy`,
        `Weaving: linking aspects with targets to create the proxy. Spring weaves at runtime`,
        `Introduction: adding new interfaces/methods to an existing class (rarely used)`,
      ],
      tip: `Memory trick: Pointcut = WHERE, Advice = WHAT + WHEN, Aspect = Pointcut + Advice packaged together.`,
    },
    {
      heading: 'Types of advice',
      content: `Diagram in words: caller -> proxy -> [@Before] -> target method -> [@AfterReturning or @AfterThrowing] -> [@After (finally)] -> back to caller. @Around wraps the whole thing and decides whether to call the target at all.`,
      points: [
        `@Before: runs before the method; cannot stop it unless it throws an exception`,
        `@AfterReturning: runs after a successful return; can read the return value`,
        `@AfterThrowing: runs if the method throws; can read the exception`,
        `@After: runs always, like finally`,
        `@Around: most powerful; surrounds the call, uses ProceedingJoinPoint.proceed(), can change args/return value or skip the call`,
      ],
    },
    {
      heading: 'Pointcut expressions (AspectJ syntax)',
      content: `The most common designator is execution(modifiers? return-type declaring-type? method-name(params) throws?). * means any one thing, .. in params means any number of params, .. in package means any sub-package.`,
      syntax: `execution(public * *(..))                          // every public method
execution(* com.demo.service.*.*(..))             // any method of any class in service package
execution(* com.demo..*.*(..))                    // any method in com.demo and sub-packages
execution(* com.demo.service.BankService.get*(..))// methods starting with get
execution(void *.deposit(String, int))           // exact parameters
within(com.demo.service..*)                       // all join points inside these types
@annotation(com.demo.Loggable)                    // methods annotated with @Loggable
bean(*Service)                                    // Spring-only: beans whose name ends with Service`,
    },
    {
      heading: 'How Spring AOP works: proxies',
      content: `Spring AOP is proxy-based and runtime-only. At startup a BeanPostProcessor checks every bean against your pointcuts; if any method matches, it returns a proxy instead of the real bean. If the bean implements an interface Spring can use a JDK dynamic proxy (implements the same interface); otherwise it uses CGLIB (a generated subclass). Spring Boot and @EnableAspectJAutoProxy(proxyTargetClass = true) prefer CGLIB.`,
      points: [
        `Only public method executions on Spring beans can be advised`,
        `Self-invocation (this.otherMethod()) bypasses the proxy, so advice does not run`,
        `final classes/methods cannot be proxied by CGLIB`,
        `Full AspectJ (compile-time/load-time weaving) can advise fields, constructors and private methods; Spring AOP cannot`,
      ],
    },
    {
      heading: 'Spring AOP setup',
      content: `Add spring-aspects (it brings the AspectJ weaver for annotation parsing) and enable auto-proxying with @EnableAspectJAutoProxy on a @Configuration class (XML: <aop:aspectj-autoproxy/>). Day 8 writes all advice types in detail.`,
      syntax: `<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-aspects</artifactId>
  <version>6.1.14</version>
</dependency>`,
    },
  ],
  examples: [
    {
      title: 'The problem: tangled and scattered code (plain Java)',
      scenario: `Without AOP, logging and security lines are copied into every business method. Run it to see how noisy the code is.`,
      steps: [
        'Create Main.java and paste the code',
        'Click Run ▶',
        'Count how many lines are NOT business logic',
      ],
      code: `class PaymentService {
    void pay(int amount) {
        System.out.println("LOG: start pay");          // cross-cutting
        System.out.println("SECURITY: user checked");  // cross-cutting
        System.out.println("Paying " + amount);        // business logic
        System.out.println("LOG: end pay");            // cross-cutting
    }
    void refund(int amount) {
        System.out.println("LOG: start refund");
        System.out.println("SECURITY: user checked");
        System.out.println("Refunding " + amount);
        System.out.println("LOG: end refund");
    }
}

public class Main {
    public static void main(String[] args) {
        PaymentService s = new PaymentService();
        s.pay(100);
        s.refund(40);
    }
}`,
      java: {
        files: {
          'Main.java': `class PaymentService {
    void pay(int amount) {
        System.out.println("LOG: start pay");
        System.out.println("SECURITY: user checked");
        System.out.println("Paying " + amount);
        System.out.println("LOG: end pay");
    }
    void refund(int amount) {
        System.out.println("LOG: start refund");
        System.out.println("SECURITY: user checked");
        System.out.println("Refunding " + amount);
        System.out.println("LOG: end refund");
    }
}

public class Main {
    public static void main(String[] args) {
        PaymentService s = new PaymentService();
        s.pay(100);
        s.refund(40);
    }
}`,
        },
      },
      result: `LOG: start pay
SECURITY: user checked
Paying 100
LOG: end pay
LOG: start refund
SECURITY: user checked
Refunding 40
LOG: end refund`,
      explanation: `Only 1 of 4 lines per method is business logic. Changing the log format means editing every method. This is tangling + scattering, the exact problem AOP solves.`,
    },
    {
      title: 'Build your own AOP proxy with java.lang.reflect.Proxy',
      scenario: `We create a JDK dynamic proxy that adds "before" and "after" logging around every method of BankService, without touching BankServiceImpl. This is how Spring AOP works for interface-based beans. Runs in the browser IDE.`,
      steps: [
        'Create Main.java and paste the code',
        'Click Run ▶',
        'Map each piece: BankServiceImpl = target, LoggingHandler = aspect/advice, proxy = Spring proxy, each method call = join point',
      ],
      code: `import java.lang.reflect.*;
import java.util.Arrays;

interface BankService {
    void deposit(String acc, int amount);
    int balance(String acc);
}

class BankServiceImpl implements BankService {        // TARGET: only business logic
    private int bal = 1000;
    public void deposit(String acc, int amount) {
        bal += amount;
        System.out.println("  [core] Deposited " + amount + " to " + acc);
    }
    public int balance(String acc) {
        System.out.println("  [core] Fetching balance of " + acc);
        return bal;
    }
}

class LoggingHandler implements InvocationHandler {    // ASPECT with "around" ADVICE
    private final Object target;
    LoggingHandler(Object target) { this.target = target; }

    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("[before] " + method.getName() + " args=" + Arrays.toString(args));
        Object result = method.invoke(target, args);     // proceed to the JOIN POINT
        System.out.println("[after] " + method.getName() + " returned " + result);
        return result;
    }
}

public class Main {
    public static void main(String[] args) {
        BankService target = new BankServiceImpl();
        BankService proxy = (BankService) Proxy.newProxyInstance(
                BankService.class.getClassLoader(),
                new Class<?>[] { BankService.class },
                new LoggingHandler(target));

        proxy.deposit("ACC1", 500);
        int b = proxy.balance("ACC1");
        System.out.println("Balance = " + b);
    }
}`,
      java: {
        files: {
          'Main.java': `import java.lang.reflect.*;
import java.util.Arrays;

interface BankService {
    void deposit(String acc, int amount);
    int balance(String acc);
}

class BankServiceImpl implements BankService {
    private int bal = 1000;
    public void deposit(String acc, int amount) {
        bal += amount;
        System.out.println("  [core] Deposited " + amount + " to " + acc);
    }
    public int balance(String acc) {
        System.out.println("  [core] Fetching balance of " + acc);
        return bal;
    }
}

class LoggingHandler implements InvocationHandler {
    private final Object target;
    LoggingHandler(Object target) { this.target = target; }

    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("[before] " + method.getName() + " args=" + Arrays.toString(args));
        Object result = method.invoke(target, args);
        System.out.println("[after] " + method.getName() + " returned " + result);
        return result;
    }
}

public class Main {
    public static void main(String[] args) {
        BankService target = new BankServiceImpl();
        BankService proxy = (BankService) Proxy.newProxyInstance(
                BankService.class.getClassLoader(),
                new Class<?>[] { BankService.class },
                new LoggingHandler(target));

        proxy.deposit("ACC1", 500);
        int b = proxy.balance("ACC1");
        System.out.println("Balance = " + b);
    }
}`,
        },
      },
      result: `[before] deposit args=[ACC1, 500]
  [core] Deposited 500 to ACC1
[after] deposit returned null
[before] balance args=[ACC1]
  [core] Fetching balance of ACC1
[after] balance returned 1500
Balance = 1500`,
      explanation: `BankServiceImpl contains only business logic. The proxy intercepts every call (join point) and runs logging (advice) before and after. deposit is void so the result is null. Spring generates such proxies automatically from @Aspect classes.`,
    },
    {
      title: 'Same idea with Spring AOP (preview)',
      scenario: `A LoggingAspect logs every method in com.demo.service with one pointcut expression.`,
      steps: [
        'Add spring-context 6.1.14 and spring-aspects 6.1.14 to pom.xml and reload Maven',
        'Eclipse/STS: create classes via File > New > Class; IntelliJ: right-click package > New > Java Class',
        'Create AppConfig with @EnableAspectJAutoProxy, BankService in com.demo.service, LoggingAspect in com.demo.aspect',
        'Run AopApp',
      ],
      code: `// com/demo/service/BankService.java
package com.demo.service;
import org.springframework.stereotype.Service;
@Service
public class BankService {
    private int bal = 1000;
    public void deposit(String acc, int amount) {
        bal += amount;
        System.out.println("  [core] Deposited " + amount + " to " + acc);
    }
}

// com/demo/aspect/LoggingAspect.java
package com.demo.aspect;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;
@Aspect
@Component
public class LoggingAspect {
    @Pointcut("execution(* com.demo.service.*.*(..))")       // WHERE
    public void serviceMethods() { }

    @Before("serviceMethods()")                               // WHAT + WHEN
    public void logBefore(JoinPoint jp) {
        System.out.println("[before] " + jp.getSignature().getName());
    }
}

// com/demo/AppConfig.java
package com.demo;
import org.springframework.context.annotation.*;
@Configuration
@ComponentScan("com.demo")
@EnableAspectJAutoProxy
public class AppConfig { }

// com/demo/AopApp.java
package com.demo;
import com.demo.service.BankService;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
public class AopApp {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext(AppConfig.class)) {
            BankService bank = ctx.getBean(BankService.class);
            bank.deposit("ACC1", 500);
            System.out.println(bank.getClass().getSimpleName().contains("CGLIB"));
        }
    }
}`,
      result: `[before] deposit
  [core] Deposited 500 to ACC1
true`,
      explanation: `BankService has no interface, so Spring created a CGLIB subclass proxy (class name like BankService$$SpringCGLIB$$0). The aspect ran before deposit without any logging code in BankService.`,
    },
    {
      title: 'Self-invocation pitfall',
      scenario: `Why advice sometimes "does not work".`,
      steps: [
        'Add a method transfer() in BankService that calls this.deposit()',
        'Call bank.transfer() from main',
        'Observe that [before] is printed only once',
      ],
      code: `public void transfer(String acc, int amount) {
    System.out.println("  [core] transfer");
    deposit(acc, amount);      // this.deposit(): direct call, NOT through proxy
}

// main
bank.transfer("ACC2", 200);`,
      result: `[before] transfer
  [core] transfer
  [core] Deposited 200 to ACC2`,
      explanation: `The proxy only intercepts calls coming from outside. Inside the target, this refers to the real object, so deposit's advice is skipped. Fix: move the method to another bean, or inject the bean into itself (self-injection), or use AspectJ weaving.`,
    },
  ],
  interview: [
    { q: 'What is AOP?', a: 'Aspect-Oriented Programming: a paradigm that modularises cross-cutting concerns (logging, security, transactions) into aspects, separate from business logic.', level: 'Easy' },
    { q: 'What is a cross-cutting concern?', a: 'Functionality needed across many layers/classes that is not the core business purpose, e.g. logging, security, transactions, caching, auditing.', level: 'Easy' },
    { q: 'Define aspect, advice, pointcut and join point.', a: 'Aspect: module containing the concern. Advice: the code and when it runs. Pointcut: expression selecting join points. Join point: a point in execution; in Spring AOP always a method execution.', level: 'Easy' },
    { q: 'What types of advice exist?', a: 'Before, AfterReturning, AfterThrowing, After (finally) and Around.', level: 'Easy' },
    { q: 'What is weaving and when does Spring do it?', a: 'Weaving links aspects to target objects. Spring AOP weaves at runtime by creating proxies; AspectJ can weave at compile time or load time.', level: 'Medium' },
    { q: 'JDK dynamic proxy vs CGLIB?', a: 'JDK proxy implements the target interfaces (needs an interface). CGLIB creates a subclass of the target class (works without interfaces, cannot proxy final classes/methods). Spring Boot defaults to CGLIB.', level: 'Medium' },
    { q: 'Spring AOP vs AspectJ?', a: 'Spring AOP: proxy-based, runtime, only method execution on Spring beans, simple. AspectJ: full AOP, compile/load-time weaving, supports field access, constructors, private methods, faster at runtime.', level: 'Hard' },
    { q: 'Why does advice not run on self-invocation?', a: 'Internal this.method() calls go to the target directly, bypassing the proxy where the advice lives.', level: 'Hard' },
    { q: 'Explain execution(* com.demo.service.*.*(..)).', a: 'Any return type, any class directly in com.demo.service, any method name, any number of parameters.', level: 'Medium' },
    { q: 'Which annotation enables Spring AOP auto-proxying?', a: '@EnableAspectJAutoProxy on a @Configuration class (XML: <aop:aspectj-autoproxy/>). Spring Boot enables it automatically.', level: 'Easy' },
    { q: 'Give real uses of AOP in Spring itself.', a: '@Transactional, @Cacheable, @Async, @PreAuthorize (method security), @Retryable are all implemented with AOP proxies.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Plain Java: write a TimingHandler (InvocationHandler) that prints "<method> took fast" if the call took less than 1000 ms. Wrap a Calculator interface with add(int,int) and print add(2,3).',
      hint: 'Use System.nanoTime() before and after method.invoke.',
      solution: `import java.lang.reflect.*;
interface Calculator { int add(int a, int b); }
class CalculatorImpl implements Calculator { public int add(int a, int b) { return a + b; } }
class TimingHandler implements InvocationHandler {
    private final Object target;
    TimingHandler(Object t) { target = t; }
    public Object invoke(Object p, Method m, Object[] args) throws Throwable {
        long start = System.nanoTime();
        Object r = m.invoke(target, args);
        long ms = (System.nanoTime() - start) / 1_000_000;
        System.out.println(m.getName() + (ms < 1000 ? " took fast" : " took slow"));
        return r;
    }
}
public class Main {
    public static void main(String[] args) {
        Calculator c = (Calculator) Proxy.newProxyInstance(Calculator.class.getClassLoader(),
            new Class<?>[] { Calculator.class }, new TimingHandler(new CalculatorImpl()));
        System.out.println(c.add(2, 3));
    }
}
// Output: add took fast
//         5`,
    },
    {
      task: 'Modify LoggingHandler so it logs only methods whose name starts with "get" (a pointcut in plain Java).',
      hint: 'if (method.getName().startsWith("get")) ...',
      solution: `public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    boolean matches = method.getName().startsWith("get");   // pointcut
    if (matches) System.out.println("[before] " + method.getName());
    Object result = method.invoke(target, args);
    if (matches) System.out.println("[after] " + method.getName());
    return result;
}`,
    },
    {
      task: 'Write pointcut expressions for: (a) all methods in com.shop.dao and sub-packages, (b) methods named save with any args, (c) methods returning String in OrderService.',
      hint: 'Use .. for sub-packages and params.',
      solution: `(a) execution(* com.shop.dao..*.*(..))
(b) execution(* save(..))
(c) execution(String com.shop.service.OrderService.*(..))`,
    },
    {
      task: 'List five cross-cutting concerns in an e-commerce app and the advice type you would use for each.',
      hint: 'Think before/after/around.',
      solution: `Logging - @Before/@After
Performance timing - @Around
Security/role check - @Before
Transactions - @Around (what @Transactional does)
Error alerting - @AfterThrowing`,
    },
  ],
  quiz: [
    { question: 'In Spring AOP a join point is always...', options: ['A field access', 'A method execution', 'A constructor call', 'A class load'], answer: 1, explanation: 'Spring AOP supports only method execution join points.' },
    { question: 'Which part answers "WHERE should advice apply"?', options: ['Aspect', 'Weaving', 'Target', 'Pointcut'], answer: 3, explanation: 'A pointcut selects join points.' },
    { question: 'Which advice can skip calling the target method?', options: ['@Around', '@Before', '@After', '@AfterReturning'], answer: 0, explanation: '@Around controls whether proceed() is called.' },
    { question: 'A bean without interfaces is proxied using...', options: ['JDK dynamic proxy', 'RMI stub', 'CGLIB subclass', 'No proxy possible'], answer: 2, explanation: 'CGLIB generates a subclass.' },
    { question: 'Which dependency adds AspectJ annotation support to Spring?', options: ['spring-tx', 'spring-aspects', 'spring-jdbc', 'spring-web'], answer: 1, explanation: 'spring-aspects brings aspectjweaver.' },
  ],
};
