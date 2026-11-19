export default {
  lesson: 'day-04-annotation-based-configuration',
  minutes: 22,
  intro: 'Use @Component and its stereotypes, @Autowired injection and solve "two candidates" problems with @Primary and @Qualifier.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which annotations make a class a bean found by **component scanning**? (choose all that apply)',
      options: ['@Component', '@Service', '@Repository', '@Controller', '@Autowired', '@Bean'],
      answers: [0, 1, 2, 3],
      explain: '`@Service`, `@Repository` and `@Controller` are specialisations of `@Component` that also document the layer (and `@Repository` translates database exceptions). `@Autowired` asks for injection, and `@Bean` is used on methods inside `@Configuration` classes, not on classes.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`SmsSender` and `EmailSender` both implement `Sender` and both are `@Component`. A service has `@Autowired private Sender sender;` with nothing else. What happens at startup?',
      options: [
        'Spring picks one at random',
        'Spring injects null',
        'Startup fails with NoUniqueBeanDefinitionException (expected single matching bean but found 2)',
        'Both are injected',
      ],
      answer: 2,
      explain: '`@Autowired` matches by **type**; two candidates make it ambiguous, so the context fails to start. Fix it with `@Primary` on the default implementation, `@Qualifier` at the injection point, or by injecting a `List<Sender>`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Inject the `EmailSender` bean (default bean name) even though `SmsSender` is @Primary. Complete the annotation:\n```\n@Autowired\n____\nprivate Sender sender;\n```',
      example: { title: 'default bean names', text: 'A class `StudentRepository` annotated with `@Repository` gets the bean name `studentRepository` (first letter lower-case).' },
      accept: ['@Qualifier("emailSender")', '@Qualifier(value = "emailSender")', '@Qualifier(value="emailSender")'],
      caseSensitive: true,
      explain: 'The default name is the class name with a lower-case first letter: `emailSender`. `@Qualifier` is more specific than `@Primary`, so it wins. A typo in the name causes NoSuchBeanDefinitionException.',
    },
    {
      type: 'output',
      mins: 4,
      q: '`SmsSender` is annotated `@Primary`. What does `main` print?',
      example: { title: 'who wins?', text: '`@Qualifier` at the injection point > `@Primary` on a bean > error if still ambiguous.' },
      code: `interface Sender { String name(); }

@Component @Primary
class SmsSender implements Sender { public String name() { return "SMS"; } }

@Component
class EmailSender implements Sender { public String name() { return "EMAIL"; } }

@Service
class AlertService {
    @Autowired Sender sender;
}
@Service
class ReportService {
    @Autowired @Qualifier("emailSender") Sender sender;
}

// main
System.out.println(ctx.getBean(AlertService.class).sender.name());
System.out.println(ctx.getBean(ReportService.class).sender.name());`,
      expected: 'SMS\nEMAIL',
      explain: 'AlertService has no qualifier, so the **@Primary** bean (SmsSender) is chosen. ReportService explicitly asks for `emailSender`, and a qualifier always beats @Primary.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Three senders exist: `EmailSender` with `@Order(1)`, `SmsSender` with `@Order(2)`, `WhatsAppSender` with `@Order(3)`. What does this print?',
      example: { title: 'injecting all beans of a type', code: '@Autowired\nprivate List<PaymentGateway> gateways; // every PaymentGateway bean' },
      code: `@Service
class BroadcastService {
    @Autowired
    private List<Sender> senders;

    void broadcast() {
        for (Sender s : senders) System.out.println(s.name());
    }
}
// names: "EMAIL", "SMS", "WHATSAPP"`,
      expected: 'EMAIL\nSMS\nWHATSAPP',
      explain: 'Injecting a `List<Sender>` gives **all** Sender beans, so there is no ambiguity. `@Order` (lower value first) controls their order in the list. This is handy for "send through every channel" or plugin-style designs.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Inject the property `app.name=UpSkillr` from a properties file into a String field. Complete the annotation:\n```\n____\nprivate String appName;\n```',
      example: { title: 'with a default value', code: '@Value("${app.pageSize:10}")\nprivate int pageSize;' },
      accept: ['@Value("${app.name}")', "@Value('${app.name}')", '@Value(value = "${app.name}")', '@Value("${app.name:UpSkillr}")'],
      caseSensitive: true,
      explain: '`@Value("${key}")` reads a property placeholder (the file is registered with `@PropertySource`). Writing `@Value("app.name")` without `${}` injects the literal text "app.name".',
    },
  ],
};
