export default {
  lesson: 'day-08-aop-aspectj-annotations',
  minutes: 25,
  intro: 'Write aspects with @Before, @After, @AfterReturning, @AfterThrowing and @Around, and predict the order in which advice runs.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the annotation that switches on @AspectJ-style aspects in a Java config class:\n```\n@Configuration\n@ComponentScan("com.upskillr")\n____\npublic class AppConfig { }\n```',
      example: { title: 'an aspect class', code: '@Aspect\n@Component\npublic class LoggingAspect { ... }' },
      accept: ['@EnableAspectJAutoProxy'],
      caseSensitive: true,
      explain: '`@EnableAspectJAutoProxy` makes Spring create proxies for beans matched by your `@Aspect` classes (you also need the `spring-aspects` / aspectjweaver dependency). The aspect itself needs **both** `@Aspect` and `@Component` (or a @Bean), otherwise it is never registered.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'One aspect has all these advices on `StudentService.findAll()`, which **returns normally**. What is printed (Spring 6)?',
      example: { title: 'advice order (same aspect)', text: 'Around (before proceed) → Before → method → AfterReturning or AfterThrowing → After → Around (after proceed)' },
      code: `@Around("execution(* com.upskillr.service.StudentService.findAll(..))")
public Object around(ProceedingJoinPoint pjp) throws Throwable {
    System.out.println("around before");
    Object result = pjp.proceed();
    System.out.println("around after");
    return result;
}
@Before("execution(* com.upskillr.service.StudentService.findAll(..))")
public void before() { System.out.println("before"); }

@AfterReturning("execution(* com.upskillr.service.StudentService.findAll(..))")
public void afterReturning() { System.out.println("afterReturning"); }

@After("execution(* com.upskillr.service.StudentService.findAll(..))")
public void after() { System.out.println("after"); }

// StudentService.findAll() prints "method"`,
      expected: 'around before\nbefore\nmethod\nafterReturning\nafter\naround after',
      explain: 'Since Spring 5.2.7, advices in the same aspect run in this order: @Around wraps everything, @Before runs just before the method, then @AfterReturning, then @After (like finally), and finally the rest of @Around after `proceed()` returns.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Same aspect, but now with `@AfterThrowing` too, and `findAll()` **throws** `RuntimeException("DB down")` after printing "method". The caller catches it and prints `"caught: " + e.getMessage()`. What is printed?',
      example: { title: 'exceptions and @Around', text: 'If `pjp.proceed()` throws and @Around does not catch it, the lines after `proceed()` are skipped and the exception continues to the caller.' },
      code: `// advices: around (as before), before, afterReturning, afterThrowing, after
@AfterThrowing(pointcut = "execution(* com.upskillr.service.StudentService.findAll(..))", throwing = "ex")
public void afterThrowing(Exception ex) { System.out.println("afterThrowing " + ex.getMessage()); }

// caller
try {
    studentService.findAll();
} catch (RuntimeException e) {
    System.out.println("caught: " + e.getMessage());
}`,
      expected: 'around before\nbefore\nmethod\nafterThrowing DB down\nafter\ncaught: DB down',
      explain: 'On an exception, @AfterThrowing runs instead of @AfterReturning, and @After still runs (it is like finally). "around after" is skipped because `proceed()` threw and @Around did not catch it, so the exception reaches the caller.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Inside an `@Around` advice, complete the line that runs the real method:\n`Object result = pjp.____();`',
      example: { title: 'timing a method', code: 'long start = System.currentTimeMillis();\nObject r = /* run the method */;\nSystem.out.println(pjp.getSignature().getName() + " took " + (System.currentTimeMillis() - start) + " ms");\nreturn r;' },
      accept: ['proceed', 'proceed()'],
      caseSensitive: true,
      explain: '`ProceedingJoinPoint.proceed()` calls the target method (or the next advice) and returns its result. Forgetting to call it means the method never runs; forgetting to **return** the result makes the caller receive null.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'In a `@Before` advice with a `JoinPoint jp` parameter, what can you read? (choose all that apply)',
      options: [
        'The method name: jp.getSignature().getName()',
        'The arguments: jp.getArgs()',
        'The target object: jp.getTarget()',
        'The return value of the method',
        'Call jp.proceed() to run the method',
      ],
      answers: [0, 1, 2],
      explain: 'A @Before advice runs before the method, so there is no return value yet (use `@AfterReturning(returning = "result")`). `proceed()` exists only on `ProceedingJoinPoint` in @Around advice.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`SecurityAspect` has `@Order(1)` and `LoggingAspect` has `@Order(2)`. Both have @Before advice on the same method. Which @Before runs first?',
      options: ['LoggingAspect', 'SecurityAspect', 'Random order', 'Neither runs'],
      answer: 1,
      explain: 'The **lower** order value has **higher** precedence: it is the outermost wrapper, so its "before" logic runs first and its "after" logic runs last. Putting security first means unauthorised calls are stopped before anything is logged as a successful call.',
    },
  ],
};
