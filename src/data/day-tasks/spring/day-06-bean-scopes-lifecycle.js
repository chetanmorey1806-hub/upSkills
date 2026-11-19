export default {
  lesson: 'day-06-bean-scopes-lifecycle',
  minutes: 20,
  intro: 'Practise singleton vs prototype scope, web scopes, and the order of the bean lifecycle with @PostConstruct and @PreDestroy.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: '`Cart` is annotated `@Scope("prototype")`; `CourseCatalog` has no scope annotation. What does this print?',
      example: { title: 'scope in one line', text: '**singleton**: one object per container (default) · **prototype**: a new object on every getBean / injection' },
      code: `CourseCatalog c1 = ctx.getBean(CourseCatalog.class);
CourseCatalog c2 = ctx.getBean(CourseCatalog.class);
Cart k1 = ctx.getBean(Cart.class);
Cart k2 = ctx.getBean(Cart.class);
System.out.println(c1 == c2);
System.out.println(k1 == k2);`,
      expected: 'true\nfalse',
      explain: 'Without `@Scope`, a bean is a **singleton**: the same instance every time. A prototype bean is created fresh on each request, so k1 and k2 are different objects.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print?',
      example: { title: 'lifecycle hooks (Spring 6)', code: 'import jakarta.annotation.PostConstruct;\nimport jakarta.annotation.PreDestroy;\n// add the jakarta.annotation-api dependency' },
      code: `@Component
class ExamService {
    private QuestionRepository repo;

    ExamService() { System.out.println("constructor"); }

    @Autowired
    void setRepo(QuestionRepository repo) {
        this.repo = repo;
        System.out.println("dependencies injected");
    }

    @PostConstruct
    void init() { System.out.println("init"); }

    @PreDestroy
    void cleanup() { System.out.println("destroy"); }
}

// main
var ctx = new AnnotationConfigApplicationContext(AppConfig.class);
System.out.println("using bean");
ctx.close();`,
      expected: 'constructor\ndependencies injected\ninit\nusing bean\ndestroy',
      explain: 'Order: **instantiate** (constructor) → **populate** dependencies (setters/fields) → `@PostConstruct` → ready → `@PreDestroy` when the context closes. That is why `@PostConstruct` (not the constructor) is the place to use injected dependencies.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Give `Cart` a new instance every time it is requested. Complete:\n`@Component`\n`@Scope("____")`',
      example: { title: 'a web scope', code: '@Scope(value = WebApplicationContext.SCOPE_SESSION, proxyMode = ScopedProxyMode.TARGET_CLASS)' },
      accept: ['prototype'],
      explain: '`@Scope("prototype")` (or `ConfigurableBeanFactory.SCOPE_PROTOTYPE`). Use it for stateful, per-use objects. Most service/repository beans are stateless and stay singletons.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Is `@PreDestroy` called for a **prototype** bean when the context closes?',
      options: [
        'Yes, always',
        'No: Spring hands the prototype to you and does not track it, so you must clean it up yourself',
        'Only if it is also @Primary',
        'Only in XML configuration',
      ],
      answer: 1,
      explain: 'Spring creates and initialises prototypes (`@PostConstruct` runs) but does not manage their destruction. Releasing resources held by a prototype is the caller\'s job.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which scopes exist only in a **web-aware** ApplicationContext? (choose all that apply)',
      options: ['request', 'session', 'application', 'websocket', 'singleton', 'prototype'],
      answers: [0, 1, 2, 3],
      explain: '`request` = one per HTTP request, `session` = one per HTTP session (e.g. a shopping cart), `application` = one per ServletContext, `websocket` = one per WebSocket session. `singleton` and `prototype` work in every container.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A **singleton** `OrderService` has `@Autowired Cart cart;` where Cart is a **prototype**. How many Cart objects does OrderService use over its lifetime?',
      options: [
        'A new Cart on every method call',
        'Only one: the prototype is injected once when the singleton is created',
        'Zero; injection fails',
        'One per user automatically',
      ],
      answer: 1,
      explain: 'Injection happens **once**, so the singleton keeps the same Cart forever. To get a fresh one each time, inject `ObjectProvider<Cart>` and call `getObject()`, use `@Lookup` method injection, or a scoped proxy.',
    },
  ],
};
