const STUDENTS = `CREATE TABLE students (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(50)  NOT NULL,
  email  VARCHAR(100) NOT NULL UNIQUE,
  course VARCHAR(50)  NOT NULL,
  marks  INT DEFAULT 0
);
INSERT INTO students (name, email, course, marks) VALUES
('Asha Patil', 'asha@gmail.com', 'Java', 88),
('Rohan Mehta', 'rohan@gmail.com', 'Python', 72),
('Sneha Kulkarni', 'sneha@gmail.com', 'Java', 65),
('Arjun Nair', 'arjun@gmail.com', 'Spring', 91),
('Priya Sharma', 'priya@gmail.com', 'Java', 79),
('Kiran Joshi', 'kiran@gmail.com', 'Spring', 58);`;

export default {
  lesson: 'day-15-spring-project-interview',
  minutes: 25,
  intro: 'Revise the Student Management project: request flow with AOP logging, the dashboard query and frequently asked Spring interview questions.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'In the finished project a `LoggingAspect` wraps every service method. The browser requests `/students`. What is printed on the console?',
      example: { title: 'who prints when', text: 'The controller runs first, calls the service **proxy**; the aspect prints around the real service method; the service calls the DAO.' },
      code: `@Around("execution(* com.upskillr.service.*.*(..))")
public Object log(ProceedingJoinPoint pjp) throws Throwable {
    System.out.println("-> " + pjp.getSignature().getName());
    Object r = pjp.proceed();
    System.out.println("<- " + pjp.getSignature().getName());
    return r;
}

// StudentController
@GetMapping("/students")
public String list(Model model) {
    System.out.println("Controller: list");
    model.addAttribute("students", studentService.findAll());
    return "students";
}

// StudentServiceImpl.findAll() calls studentDao.findAll(),
// which prints "DAO: select students"`,
      expected: 'Controller: list\n-> findAll\nDAO: select students\n<- findAll',
      explain: 'The pointcut matches only the `service` package, so the controller and DAO are not logged themselves. The aspect wraps the service call: "->" before `proceed()`, the DAO runs inside it, then "<-". The same proxy also applies `@Transactional` around the service method.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'The project dashboard shows, for every course with **at least 2 students**, the `course`, the number of students as `total` and the highest marks as `top_marks`, sorted by `total` descending, then course A→Z.',
      example: { title: 'filtering groups', code: 'SELECT city, COUNT(*) AS customers\nFROM customers\nGROUP BY city\nHAVING COUNT(*) >= 3;' },
      setup: STUDENTS,
      starter: '-- SELECT course, COUNT(*) AS total, MAX(marks) AS top_marks ...\n',
      solution: 'SELECT course, COUNT(*) AS total, MAX(marks) AS top_marks\nFROM students\nGROUP BY course\nHAVING COUNT(*) >= 2\nORDER BY total DESC, course;',
      ordered: true,
      explain: '`WHERE` filters rows before grouping; `HAVING` filters the groups after counting. Python (1 student) is dropped; Java has 3 (top 88) and Spring 2 (top 91). In the project this is a JPQL query in the DAO returning a DTO list.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which stereotype annotation marks `StudentServiceImpl`, the class holding business logic and `@Transactional` methods? (with @)',
      example: { title: 'the other layers', code: '@Controller   // web layer\n@Repository   // DAO layer' },
      accept: ['@Service'],
      caseSensitive: true,
      explain: '`@Service` is a `@Component` that documents the business layer. `@Repository` additionally translates persistence exceptions into Spring\'s `DataAccessException` hierarchy, and `@Controller` marks MVC handlers.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Interview revision: which statements are TRUE? (choose all that apply)',
      options: [
        'The default bean scope is singleton',
        'Constructor injection is recommended for required dependencies',
        '@Transactional rolls back by default only for unchecked exceptions',
        'Spring AOP is proxy-based, so self-invocation is not advised',
        'DispatcherServlet is created once per request',
      ],
      answers: [0, 1, 2, 3],
      explain: 'DispatcherServlet is a normal servlet: **one** instance created at startup that handles all requests on many threads. The other four facts appear in almost every Spring interview.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'An interviewer asks: "What is the difference between `@Controller` and `@RestController`?" Which answer is correct?',
      options: [
        'There is no difference',
        '@RestController = @Controller + @ResponseBody, so return values are written to the body (JSON) instead of resolving a view',
        '@RestController only supports GET',
        '@Controller cannot use @RequestMapping',
      ],
      answer: 1,
      explain: 'Use `@Controller` for server-rendered pages (JSP views, like this project) and `@RestController` for REST APIs consumed by JavaScript or mobile apps.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In the project, `StudentNotFoundException` thrown from any controller must show a friendly 404 page. Where is this handled?',
      options: [
        'In a try/catch in every controller method',
        'In a @ControllerAdvice class with an @ExceptionHandler(StudentNotFoundException.class) method',
        'In the DAO',
        'In web.xml only',
      ],
      answer: 1,
      explain: 'A global `@ControllerAdvice` keeps error handling in one place. Adding `@ResponseStatus(HttpStatus.NOT_FOUND)` to the handler (or the exception class) also sets the correct HTTP status code.',
    },
  ],
};
