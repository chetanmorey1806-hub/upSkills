export default {
  id: 'day-08-aop-aspectj-annotations',
  title: 'AOP with AspectJ Annotations (@Before, @After, @AfterReturning, @Around)',
  module: 'Module 2: Spring AOP',
  day: 8,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Write real Spring aspects with @Aspect and the five advice annotations, read method details through JoinPoint, change behaviour with @Around and ProceedingJoinPoint, reuse pointcuts, target custom annotations and order multiple aspects.`,
  objectives: [
    `Configure Spring 6 AOP with spring-aspects and @EnableAspectJAutoProxy`,
    `Write @Before, @After, @AfterReturning, @AfterThrowing and @Around advice`,
    `Use JoinPoint and ProceedingJoinPoint to read arguments and return values`,
    `Know the exact execution order of advices, including on exceptions`,
    `Create annotation-driven aspects (@Loggable) and order aspects with @Order`,
  ],
  theory: [
    {
      heading: 'Setting up Spring AOP',
      content: `Dependencies: spring-context and spring-aspects (same version). Enable proxies with @EnableAspectJAutoProxy. An aspect class needs BOTH @Aspect (AspectJ annotation: "this is an aspect") and @Component (Spring: "this is a bean"); forgetting @Component is the number-one beginner mistake.`,
      syntax: `@Configuration
@ComponentScan("com.demo")
@EnableAspectJAutoProxy
public class AppConfig { }

@Aspect
@Component
public class LoggingAspect { ... }`,
    },
    {
      heading: '@Before, @After, @AfterReturning, @AfterThrowing',
      content: `Each takes a pointcut expression (inline or a reference to a @Pointcut method). Add a JoinPoint parameter to read details: jp.getSignature().getName(), jp.getArgs(), jp.getTarget(). @AfterReturning uses returning = "result" to bind the return value; @AfterThrowing uses throwing = "ex" to bind the exception. The parameter name must match the attribute value.`,
      syntax: `@Before("execution(* com.demo.service.*.*(..))")
public void before(JoinPoint jp) { ... }

@AfterReturning(pointcut = "execution(* com.demo.service.*.*(..))", returning = "result")
public void afterReturning(JoinPoint jp, Object result) { ... }

@AfterThrowing(pointcut = "execution(* com.demo.service.*.*(..))", throwing = "ex")
public void afterThrowing(JoinPoint jp, Exception ex) { ... }

@After("execution(* com.demo.service.*.*(..))")      // always, like finally
public void after(JoinPoint jp) { ... }`,
    },
    {
      heading: '@Around and ProceedingJoinPoint',
      content: `@Around wraps the method like a sandwich. It receives ProceedingJoinPoint and MUST call pjp.proceed() to run the real method and MUST return its result (otherwise the caller gets null). You can measure time, retry, cache, change arguments with proceed(newArgs), or block the call. Analogy: a personal assistant who receives every call for the boss, may note the time, decide to pass it on, and reports back the answer.`,
      syntax: `@Around("execution(* com.demo.service.*.*(..))")
public Object time(ProceedingJoinPoint pjp) throws Throwable {
    long start = System.currentTimeMillis();
    try {
        return pjp.proceed();
    } finally {
        System.out.println(pjp.getSignature().getName() + " took " + (System.currentTimeMillis() - start) + " ms");
    }
}`,
      tip: `Common mistake: declaring @Around with void return type or forgetting "return pjp.proceed()". The target runs but the caller receives null (or 0 / an error for primitives).`,
    },
    {
      heading: 'Advice execution order',
      content: `For advices in the SAME aspect on the same method (Spring 5.2.7+): Around (code before proceed) -> Before -> target method -> AfterReturning OR AfterThrowing -> After -> Around (code after proceed). When the method throws, AfterThrowing and After run, and the exception propagates through Around unless Around catches it.`,
    },
    {
      heading: 'Reusable pointcuts, combining and custom annotations',
      content: `Declare a pointcut once with @Pointcut on an empty method and refer to it by name. Combine with && , || and !. To advise only selected methods, create your own annotation and use @annotation(...). Bind arguments with args(..).`,
      syntax: `@Pointcut("execution(* com.demo.service.*.*(..))")
public void service() { }

@Pointcut("execution(* com.demo.service.*.get*(..))")
public void getters() { }

@Before("service() && !getters()")
public void writeOps(JoinPoint jp) { ... }

@Around("@annotation(com.demo.Loggable)")
public Object logAnnotated(ProceedingJoinPoint pjp) throws Throwable { ... }`,
    },
    {
      heading: 'Ordering multiple aspects',
      content: `When several aspects match the same method, use @Order(n) on the aspect classes. Lower value = higher precedence = runs FIRST on the way in and LAST on the way out (like nested layers of an onion). Example: SecurityAspect @Order(1) wraps LoggingAspect @Order(2) which wraps the target.`,
      points: [
        `Without @Order, order between aspects is undefined`,
        `Advices inside one aspect cannot be ordered with @Order; split into separate aspects if needed`,
      ],
    },
  ],
  examples: [
    {
      title: 'Advice order simulated in plain Java',
      scenario: `Before writing Spring code, we reproduce exactly what the Spring proxy does for one aspect with all five advices, using try/catch/finally. Runs in the browser IDE.`,
      steps: [
        'Create Main.java and paste the code',
        'Click Run ▶',
        'Compare the success case and the exception case',
      ],
      code: `import java.util.function.IntSupplier;

public class Main {
    // What the proxy does for one method call
    static int call(String method, IntSupplier target) {
        System.out.println("Around (before) " + method);
        int r = advised(method, target);            // pjp.proceed()
        System.out.println("Around (after) " + method);
        return r;
    }

    static int advised(String method, IntSupplier target) {
        System.out.println("Before " + method);
        try {
            int r = target.getAsInt();               // real method
            System.out.println("AfterReturning " + method + " = " + r);
            return r;
        } catch (RuntimeException e) {
            System.out.println("AfterThrowing " + method + ": " + e.getMessage());
            throw e;
        } finally {
            System.out.println("After " + method);
        }
    }

    static int divide(int a, int b) { return a / b; }

    public static void main(String[] args) {
        int x = call("divide(10,2)", () -> divide(10, 2));
        System.out.println("Result: " + x);
        try {
            call("divide(10,0)", () -> divide(10, 0));
        } catch (ArithmeticException e) {
            System.out.println("Caller got: " + e.getMessage());
        }
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.function.IntSupplier;

public class Main {
    static int call(String method, IntSupplier target) {
        System.out.println("Around (before) " + method);
        int r = advised(method, target);
        System.out.println("Around (after) " + method);
        return r;
    }

    static int advised(String method, IntSupplier target) {
        System.out.println("Before " + method);
        try {
            int r = target.getAsInt();
            System.out.println("AfterReturning " + method + " = " + r);
            return r;
        } catch (RuntimeException e) {
            System.out.println("AfterThrowing " + method + ": " + e.getMessage());
            throw e;
        } finally {
            System.out.println("After " + method);
        }
    }

    static int divide(int a, int b) { return a / b; }

    public static void main(String[] args) {
        int x = call("divide(10,2)", () -> divide(10, 2));
        System.out.println("Result: " + x);
        try {
            call("divide(10,0)", () -> divide(10, 0));
        } catch (ArithmeticException e) {
            System.out.println("Caller got: " + e.getMessage());
        }
    }
}`,
        },
      },
      result: `Around (before) divide(10,2)
Before divide(10,2)
AfterReturning divide(10,2) = 5
After divide(10,2)
Around (after) divide(10,2)
Result: 5
Around (before) divide(10,0)
Before divide(10,0)
AfterThrowing divide(10,0): / by zero
After divide(10,0)
Caller got: / by zero`,
      explanation: `On success: AfterReturning then After. On exception: AfterThrowing then After (finally), and "Around (after)" is skipped because the exception escapes proceed(). The caller still receives the exception.`,
    },
    {
      title: 'All five advices in a Spring aspect',
      scenario: `A Calculator service with a full LoggingAspect.`,
      steps: [
        'pom.xml: spring-context 6.1.14 and spring-aspects 6.1.14; reload Maven (Eclipse: right-click project > Maven > Update Project; IntelliJ: Maven tool window > Reload)',
        'Create com.demo.service.Calculator, com.demo.aspect.LoggingAspect, com.demo.AppConfig, com.demo.AopApp',
        'Run AopApp (Eclipse: Run As > Java Application; IntelliJ: green ▶)',
      ],
      code: `// Calculator.java
package com.demo.service;
import org.springframework.stereotype.Service;
@Service
public class Calculator {
    public int divide(int a, int b) {
        System.out.println("  divide running");
        return a / b;
    }
}

// LoggingAspect.java
package com.demo.aspect;
import java.util.Arrays;
import org.aspectj.lang.*;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {
    @Pointcut("execution(* com.demo.service.Calculator.*(..))")
    public void calc() { }

    @Before("calc()")
    public void before(JoinPoint jp) {
        System.out.println("Before " + jp.getSignature().getName() + Arrays.toString(jp.getArgs()));
    }

    @AfterReturning(pointcut = "calc()", returning = "result")
    public void afterReturning(Object result) { System.out.println("AfterReturning " + result); }

    @AfterThrowing(pointcut = "calc()", throwing = "ex")
    public void afterThrowing(Exception ex) { System.out.println("AfterThrowing " + ex.getMessage()); }

    @After("calc()")
    public void after() { System.out.println("After (finally)"); }

    @Around("calc()")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("Around before");
        Object r = pjp.proceed();
        System.out.println("Around after");
        return r;
    }
}

// AppConfig.java
package com.demo;
import org.springframework.context.annotation.*;
@Configuration
@ComponentScan("com.demo")
@EnableAspectJAutoProxy
public class AppConfig { }

// AopApp.java
package com.demo;
import com.demo.service.Calculator;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
public class AopApp {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext(AppConfig.class)) {
            Calculator c = ctx.getBean(Calculator.class);
            System.out.println("Result = " + c.divide(10, 2));
            try { c.divide(1, 0); } catch (ArithmeticException e) { System.out.println("Main caught " + e.getMessage()); }
        }
    }
}`,
      result: `Around before
Before divide[10, 2]
  divide running
AfterReturning 5
After (finally)
Around after
Result = 5
Around before
Before divide[1, 0]
  divide running
AfterThrowing / by zero
After (finally)
Main caught / by zero`,
      explanation: `Exactly the same order as our plain Java simulation. Calculator contains zero logging code; everything is in the aspect.`,
    },
    {
      title: '@Around for performance timing with a custom @Loggable annotation',
      scenario: `Measure only the methods marked with @Loggable.`,
      steps: [
        'Create the annotation com.demo.Loggable (IntelliJ: New > Java Class > Annotation; Eclipse: New > Annotation)',
        'Put @Loggable on ReportService.generate()',
        'Create TimingAspect and run',
      ],
      code: `// Loggable.java
package com.demo;
import java.lang.annotation.*;
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Loggable { }

// ReportService.java
@Service
public class ReportService {
    @Loggable
    public String generate(String month) throws InterruptedException {
        Thread.sleep(200);
        return "Report-" + month;
    }
    public String title() { return "Monthly"; }       // not annotated, not timed
}

// TimingAspect.java
@Aspect
@Component
public class TimingAspect {
    @Around("@annotation(com.demo.Loggable)")
    public Object time(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = pjp.proceed();
        long took = System.currentTimeMillis() - start;
        System.out.println(pjp.getSignature().getName() + " took ~" + (took / 100 * 100) + " ms");
        return result;
    }
}

// main
ReportService r = ctx.getBean(ReportService.class);
System.out.println(r.generate("JAN"));
System.out.println(r.title());`,
      result: `generate took ~200 ms
Report-JAN
Monthly`,
      explanation: `Only generate() is advised. The time is rounded down to hundreds; on a slow machine it might show ~300 ms. RetentionPolicy.RUNTIME is required, otherwise Spring cannot see the annotation.`,
    },
    {
      title: 'Ordering two aspects with @Order',
      scenario: `SecurityAspect must run before LoggingAspect.`,
      steps: [
        'Add @Order(1) to SecurityAspect and @Order(2) to AuditAspect',
        'Both use @Around on the same pointcut',
        'Run and read the nesting',
      ],
      code: `@Aspect @Component @Order(1)
public class SecurityAspect {
    @Around("execution(* com.demo.service.Calculator.*(..))")
    public Object check(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("Security IN");
        Object r = pjp.proceed();
        System.out.println("Security OUT");
        return r;
    }
}

@Aspect @Component @Order(2)
public class AuditAspect {
    @Around("execution(* com.demo.service.Calculator.*(..))")
    public Object audit(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("Audit IN");
        Object r = pjp.proceed();
        System.out.println("Audit OUT");
        return r;
    }
}

// (remove LoggingAspect from Example 2 for clear output)
c.divide(8, 4);`,
      result: `Security IN
Audit IN
  divide running
Audit OUT
Security OUT`,
      explanation: `Lower order value is the outer layer: first in, last out.`,
    },
  ],
  interview: [
    { q: 'Which annotations are needed on an aspect class?', a: '@Aspect to mark it as an aspect and @Component (or a @Bean) so Spring registers it.', level: 'Easy' },
    { q: 'How do you enable AspectJ annotation support in Spring?', a: '@EnableAspectJAutoProxy on a @Configuration class, or <aop:aspectj-autoproxy/> in XML, plus the spring-aspects dependency.', level: 'Easy' },
    { q: 'Difference between @After and @AfterReturning?', a: '@AfterReturning runs only after a normal return and can access the result; @After runs always (success or exception), like finally.', level: 'Medium' },
    { q: 'JoinPoint vs ProceedingJoinPoint?', a: 'JoinPoint gives method info (signature, args, target). ProceedingJoinPoint extends it with proceed(), and is used only in @Around.', level: 'Medium' },
    { q: 'What happens if @Around does not call proceed()?', a: 'The target method never executes; the caller gets whatever the advice returns.', level: 'Medium' },
    { q: 'How do you access the return value or exception?', a: '@AfterReturning(returning = "result") with a parameter named result; @AfterThrowing(throwing = "ex") with a parameter named ex.', level: 'Medium' },
    { q: 'What is the order of advices within one aspect?', a: 'Around-before, Before, method, AfterReturning/AfterThrowing, After, Around-after.', level: 'Hard' },
    { q: 'How do you order multiple aspects?', a: '@Order on aspect classes or implementing Ordered; lower value has higher precedence and wraps the others.', level: 'Medium' },
    { q: 'How do you advise only methods with a custom annotation?', a: 'Create a RUNTIME-retained annotation and use pointcut @annotation(fully.qualified.Annotation).', level: 'Medium' },
    { q: 'Can @AfterThrowing swallow an exception?', a: 'No, the exception still propagates. Use @Around with try/catch to handle or translate it.', level: 'Hard' },
    { q: 'What is @Pointcut used for?', a: 'To declare a named, reusable pointcut expression on an empty method that other advices reference by name.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Plain Java: change the simulation so that the Around advice catches ArithmeticException and returns -1 instead of rethrowing. Print the result of divide(10,0).',
      hint: 'Wrap advised(...) in try/catch inside call().',
      solution: `static int call(String method, IntSupplier target) {
    System.out.println("Around (before) " + method);
    try {
        int r = advised(method, target);
        System.out.println("Around (after) " + method);
        return r;
    } catch (ArithmeticException e) {
        System.out.println("Around handled: " + e.getMessage());
        return -1;
    }
}
// main: System.out.println("Result: " + call("divide(10,0)", () -> divide(10, 0)));
// Around (before) divide(10,0)
// Before divide(10,0)
// AfterThrowing divide(10,0): / by zero
// After divide(10,0)
// Around handled: / by zero
// Result: -1`,
    },
    {
      task: 'Write a @Before advice that throws SecurityException if the first argument of any method in AccountService is a negative number.',
      hint: 'jp.getArgs()[0]',
      solution: `@Aspect @Component
public class ValidationAspect {
    @Before("execution(* com.demo.service.AccountService.*(..))")
    public void check(JoinPoint jp) {
        Object[] args = jp.getArgs();
        if (args.length > 0 && args[0] instanceof Number n && n.doubleValue() < 0) {
            throw new SecurityException("Negative amount not allowed");
        }
    }
}`,
    },
    {
      task: 'Write an @Around caching aspect: if the same String argument was seen before, return the cached result without calling the method.',
      hint: 'Use a ConcurrentHashMap<Object,Object>.',
      solution: `@Aspect @Component
public class CacheAspect {
    private final Map<Object, Object> cache = new ConcurrentHashMap<>();
    @Around("execution(* com.demo.service.PriceService.getPrice(String))")
    public Object cache(ProceedingJoinPoint pjp) throws Throwable {
        Object key = pjp.getArgs()[0];
        if (cache.containsKey(key)) { System.out.println("cache hit " + key); return cache.get(key); }
        Object value = pjp.proceed();
        cache.put(key, value);
        return value;
    }
}`,
    },
    {
      task: 'Write an @AfterThrowing advice that logs the method name and exception class for any method in com.demo.. that throws.',
      hint: 'throwing = "ex", ex.getClass().getSimpleName().',
      solution: `@AfterThrowing(pointcut = "execution(* com.demo..*.*(..))", throwing = "ex")
public void alert(JoinPoint jp, Throwable ex) {
    System.out.println("ALERT: " + jp.getSignature().getName() + " threw " + ex.getClass().getSimpleName());
}`,
    },
  ],
  quiz: [
    { question: 'Which object is passed to @Around advice?', options: ['JoinPoint', 'MethodInvocation only', 'ProceedingJoinPoint', 'Signature'], answer: 2, explanation: 'Only @Around gets ProceedingJoinPoint with proceed().' },
    { question: 'Which advice runs even if the method throws?', options: ['@After', '@AfterReturning', '@Before only', 'None'], answer: 0, explanation: '@After behaves like finally.' },
    { question: 'In @AfterReturning(returning = "val"), the parameter must be named...', options: ['result', 'returnValue', 'anything', 'val'], answer: 3, explanation: 'The name must match the attribute.' },
    { question: 'Aspect with @Order(1) vs @Order(5): which runs first on entry?', options: ['@Order(5)', '@Order(1)', 'Random', 'Both at once'], answer: 1, explanation: 'Lower value = higher precedence.' },
    { question: 'Forgetting @Component on an @Aspect class causes...', options: ['Compile error', 'The aspect is ignored', 'Exception at startup', 'Double execution'], answer: 1, explanation: 'Spring never registers it, so no advice runs.' },
  ],
};
