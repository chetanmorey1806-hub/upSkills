export default {
  lesson: 'day-04-lombok-and-jackson',
  minutes: 22,
  intro: 'Remove boilerplate with Lombok and predict the JSON Jackson produces with its annotations.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which methods/constructors does Lombok\'s `@Data` generate? (choose all that apply)',
      options: ['Getters for all fields', 'Setters for non-final fields', 'toString()', 'equals() and hashCode()', 'A constructor for final / @NonNull fields (@RequiredArgsConstructor)', 'A builder()'],
      answers: [0, 1, 2, 3, 4],
      explain: '`@Data` = @Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor. It does **not** add `builder()` (that is `@Builder`) or a no-args/all-args constructor. Avoid `@Data` on JPA entities with relations: its equals/hashCode/toString can loop.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this print? (Lombok generates toString in the format `ClassName(field=value, ...)`)',
      example: { title: 'Lombok toString', code: '@ToString class City { String name = "Pune"; int pin = 411001; }\n// City(name=Pune, pin=411001)' },
      code: `@Builder
@ToString
public class Student {
    private String name;
    private int marks;
    @Builder.Default
    private String city = "Pune";
    private String email;
}

Student s = Student.builder().name("Ravi").marks(75).build();
System.out.println(s);`,
      expected: 'Student(name=Ravi, marks=75, city=Pune, email=null)',
      explain: 'Fields not set in the builder get default values: `email` → null. Because of **@Builder.Default** the initializer "Pune" is kept; without it the builder would set city to null too (a classic Lombok surprise).',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What JSON does `mapper.writeValueAsString(s)` produce? (one line, no spaces) `mapper` has the JavaTimeModule registered.',
      example: { title: 'renaming a property', code: '@JsonProperty("pin_code") int pin;   // {"pin_code":411001}' },
      code: `@Getter @AllArgsConstructor
@JsonPropertyOrder({"full_name", "marks", "dob"})
public class Student {
    @JsonProperty("full_name")
    private String name;
    private int marks;
    @JsonIgnore
    private String password;
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate dob;
}

Student s = new Student("Asha Patil", 88, "secret", LocalDate.of(2004, 3, 15));`,
      expected: '{"full_name":"Asha Patil","marks":88,"dob":"15-03-2004"}',
      explain: '`@JsonProperty` renames name → full_name, `@JsonIgnore` hides the password completely and `@JsonFormat` formats the date as dd-MM-yyyy (15-03-2004). Without JavaTimeModule, LocalDate cannot be serialised.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line that converts a JSON string into a `Student` object:\n```\nObjectMapper mapper = new ObjectMapper();\nStudent s = ???;\n```',
      example: { title: 'the other direction', code: 'String json = mapper.writeValueAsString(student);' },
      accept: ['mapper.readValue(json, Student.class)', 'mapper.readValue(json, Student.class);'],
      explain: '`readValue(json, Student.class)` = deserialisation (JSON → object), `writeValueAsString` = serialisation. Jackson needs a no-args constructor (or `@JsonCreator`) and setters/fields to fill. For a list use `new TypeReference<List<Student>>() {}`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'You want fields that are `null` to be left out of the JSON entirely. Which annotation do you put on the class?',
      options: ['@JsonIgnore', '@JsonInclude(JsonInclude.Include.NON_NULL)', '@JsonProperty(required = false)', '@NonNull'],
      answer: 1,
      explain: '`@JsonInclude(Include.NON_NULL)` skips null values, giving smaller, cleaner responses. `@JsonIgnore` always hides a field, and Lombok\'s `@NonNull` adds a null check - it does not affect JSON.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'You annotate a class with Lombok\'s `@Slf4j`. What is the **name of the logger field** you can now use?',
      example: { title: 'what Lombok writes for you', code: 'private static final org.slf4j.Logger ??? = LoggerFactory.getLogger(OrderService.class);' },
      accept: ['log'],
      caseSensitive: true,
      explain: '`@Slf4j` generates `private static final Logger log`. So you write `log.info("Order {} placed", id);`. Writing `logger.info` does not compile.',
    },
  ],
};
