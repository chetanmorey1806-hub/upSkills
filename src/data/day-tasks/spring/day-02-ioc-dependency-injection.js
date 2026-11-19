export default {
  lesson: 'day-02-ioc-dependency-injection',
  minutes: 18,
  intro: 'Understand Inversion of Control and Dependency Injection, and compare Spring\'s BeanFactory and ApplicationContext containers.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does **Inversion of Control** mean?',
      options: [
        'The program runs its loops in reverse',
        'Objects no longer create or look up their own dependencies; a container creates them and controls their life',
        'The database controls the Java code',
        'Controllers are written before services',
      ],
      answer: 1,
      explain: 'Normally your code calls `new` and controls object creation. With IoC that control is **inverted**: the container creates the objects and hands them their dependencies. Dependency Injection is the most common way to implement IoC.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which are the main ways Spring can inject a dependency?',
      options: [
        'Constructor injection, setter injection and field injection',
        'Only through static methods',
        'Only through XML comments',
        'Through the main() method only',
      ],
      answer: 0,
      explain: 'Spring supports **constructor** (recommended for required dependencies), **setter** (for optional ones) and **field** injection (`@Autowired` on a field, convenient but harder to test).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line that starts a Spring container from the Java config class `AppConfig`:\n`ApplicationContext ctx = new ____(AppConfig.class);`',
      example: { title: 'the XML version', code: 'ApplicationContext ctx = new ClassPathXmlApplicationContext("beans.xml");' },
      accept: ['AnnotationConfigApplicationContext'],
      caseSensitive: true,
      explain: '`AnnotationConfigApplicationContext` reads `@Configuration` classes and component scanning; `ClassPathXmlApplicationContext` reads XML from the classpath. Both implement `ApplicationContext`.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`StudentService` is a normal singleton bean. What does this program print?',
      example: { title: 'eager creation', text: 'An ApplicationContext creates all **singleton** beans while it starts, before your next line of code runs.' },
      code: `@Component
class StudentService {
    StudentService() { System.out.println("StudentService created"); }
}

public class Main {
    public static void main(String[] args) {
        var ctx = new AnnotationConfigApplicationContext(AppConfig.class);
        System.out.println("Context ready");
        StudentService a = ctx.getBean(StudentService.class);
        StudentService b = ctx.getBean(StudentService.class);
        System.out.println(a == b);
    }
}`,
      expected: 'StudentService created\nContext ready\ntrue',
      explain: 'ApplicationContext pre-instantiates singletons at startup, so the constructor runs **before** "Context ready". Singleton is the default scope: both `getBean` calls return the **same** object, so `a == b` is true. A plain BeanFactory would create it lazily on the first getBean.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **BeanFactory vs ApplicationContext** are TRUE? (choose all that apply)',
      options: [
        'ApplicationContext extends BeanFactory and adds more features',
        'BeanFactory creates beans lazily (when first requested)',
        'ApplicationContext supports events, i18n messages and automatic BeanPostProcessor registration',
        'ApplicationContext is the one used in almost all real applications',
        'BeanFactory supports annotations like @PostConstruct automatically without extra setup',
      ],
      answers: [0, 1, 2, 3],
      explain: 'BeanFactory is the minimal container. ApplicationContext adds eager singleton creation (errors appear at startup), events, internationalisation and automatic registration of post-processors that make `@Autowired`, `@PostConstruct` etc. work.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Get the bean **by type** without casting:\n`StudentService s = ctx.getBean(____);`',
      example: { title: 'by name (needs a cast or a type)', code: 'StudentService s = (StudentService) ctx.getBean("studentService");\nStudentService t = ctx.getBean("studentService", StudentService.class);' },
      accept: ['StudentService.class'],
      caseSensitive: true,
      explain: '`getBean(StudentService.class)` looks the bean up by type and returns the right type. If two beans of that type exist it throws `NoUniqueBeanDefinitionException`, which you will solve with @Primary/@Qualifier on Day 4.',
    },
  ],
};
