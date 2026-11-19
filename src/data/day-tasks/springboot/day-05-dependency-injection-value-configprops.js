export default {
  lesson: 'day-05-dependency-injection-value-configprops',
  minutes: 22,
  intro: 'Practise constructor injection, @Primary/@Qualifier, @Value defaults and @ConfigurationProperties binding.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which injection style is recommended in Spring Boot?',
      options: ['Field injection with @Autowired on a private field', 'Constructor injection (with final fields)', 'Setter injection for every dependency', 'Creating dependencies with new inside the class'],
      answer: 1,
      explain: '**Constructor injection** makes dependencies `final`, required and easy to pass in unit tests. With a single constructor, `@Autowired` is not even needed. Field injection hides dependencies and makes testing harder.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Two beans implement `NotificationService`. What does `checkout()` print?',
      example: { title: 'rule of thumb', text: '@Qualifier on the injection point is the most specific choice; @Primary is only the default when no qualifier is given.' },
      code: `@Service @Primary
class EmailService implements NotificationService {
    public String send() { return "Email sent"; }
}
@Service("smsService")
class SmsService implements NotificationService {
    public String send() { return "SMS sent"; }
}
@Service
class OrderService {
    private final NotificationService a;
    private final NotificationService b;
    OrderService(NotificationService a,
                 @Qualifier("smsService") NotificationService b) {
        this.a = a; this.b = b;
    }
    void checkout() {
        System.out.println(a.send());
        System.out.println(b.send());
    }
}`,
      expected: 'Email sent\nSMS sent',
      explain: '`a` has no qualifier, so Spring picks the **@Primary** bean (EmailService). `b` is marked `@Qualifier("smsService")`, which wins over @Primary, so it gets SmsService.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the annotation so `pageSize` reads `app.page-size` and uses **20** when the property is missing:\n```\n???\nprivate int pageSize;\n```',
      example: { title: 'a String with a default', code: '@Value("${app.city:Pune}")\nprivate String city;' },
      accept: ['@Value("${app.page-size:20}")', "@Value('${app.page-size:20}')"],
      explain: '`${key:default}` - the part after the colon is the default. Without a default, a missing key makes startup fail with "Could not resolve placeholder". Forgetting the `${}` injects the literal text instead of the property.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`application.properties` contains the lines below. What does the program print?',
      example: { title: 'relaxed binding', text: 'max-students, maxStudents and MAX_STUDENTS all bind to the field maxStudents.' },
      code: `app.college.name=Shivaji College
app.college.max-students=60
app.college.subjects=Java,Spring,MySQL

@ConfigurationProperties(prefix = "app.college")
public class CollegeProps {
    private String name;
    private int maxStudents;
    private List<String> subjects;
    // getters and setters
}

System.out.println(props.getName() + " | " + props.getMaxStudents()
    + " | " + props.getSubjects().size());`,
      expected: 'Shivaji College | 60 | 3',
      explain: 'The prefix `app.college` is removed and the rest binds to fields. `max-students` binds to `maxStudents` (relaxed binding) and a comma-separated value binds to a `List` with 3 items.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why prefer `@ConfigurationProperties` over many `@Value` annotations for a group of related settings?',
      options: [
        'It is the only way to read properties',
        'It binds a whole prefix into one type-safe class, supports lists/nested objects and can be validated with @Validated',
        'It is faster at runtime',
        'It works without any properties file',
      ],
      answer: 1,
      explain: '`@ConfigurationProperties` groups settings in one **type-safe** object, supports relaxed binding, lists, maps and nested classes, and fails fast with `@Validated` + `@NotBlank`/`@Min`. `@Value` is fine for one or two single values.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which annotations register a class as a Spring bean during component scanning? (choose all that apply)',
      options: ['@Component', '@Service', '@Repository', '@RestController', '@Value', '@Qualifier'],
      answers: [0, 1, 2, 3],
      explain: '`@Service`, `@Repository`, `@Controller`/`@RestController` are all specialisations of **@Component**. `@Value` and `@Qualifier` only describe what to inject; they do not create beans.',
    },
  ],
};
