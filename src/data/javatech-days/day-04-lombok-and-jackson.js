const delombokCode = `import java.util.Objects;

// This is roughly what Lombok generates for:
// @Data @AllArgsConstructor @Builder class Student { int id; String name; double marks; }
class Student {
    private int id;
    private String name;
    private double marks;

    public Student(int id, String name, double marks) {   // @AllArgsConstructor
        this.id = id;
        this.name = name;
        this.marks = marks;
    }

    // @Getter / @Setter
    public int getId() { return id; }
    public String getName() { return name; }
    public double getMarks() { return marks; }
    public void setId(int id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setMarks(double marks) { this.marks = marks; }

    @Override
    public boolean equals(Object o) {                     // @EqualsAndHashCode
        if (this == o) return true;
        if (!(o instanceof Student)) return false;
        Student other = (Student) o;
        return id == other.id && Double.compare(marks, other.marks) == 0
                && Objects.equals(name, other.name);
    }

    @Override
    public int hashCode() { return Objects.hash(id, name, marks); }

    @Override
    public String toString() {                            // @ToString
        return "Student(id=" + id + ", name=" + name + ", marks=" + marks + ")";
    }

    // @Builder
    public static StudentBuilder builder() { return new StudentBuilder(); }

    public static class StudentBuilder {
        private int id;
        private String name;
        private double marks;
        public StudentBuilder id(int id) { this.id = id; return this; }
        public StudentBuilder name(String name) { this.name = name; return this; }
        public StudentBuilder marks(double marks) { this.marks = marks; return this; }
        public Student build() { return new Student(id, name, marks); }
    }
}

public class Main {
    public static void main(String[] args) {
        Student s1 = Student.builder().id(1).name("Riya").marks(88.5).build();
        Student s2 = new Student(1, "Riya", 88.5);

        System.out.println(s1);
        System.out.println("equals: " + s1.equals(s2));
        System.out.println("same hash: " + (s1.hashCode() == s2.hashCode()));

        s2.setMarks(91.0);
        System.out.println(s2.getName() + " -> " + s2.getMarks());
        System.out.println("equals after change: " + s1.equals(s2));
    }
}`;

export default {
  id: 'day-04-lombok-and-jackson',
  title: 'Lombok and Jackson: Less Boilerplate and JSON Serialization',
  module: 'Module 1: Build Tools, Git & Libraries',
  day: 4,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Remove getter/setter/constructor boilerplate with Lombok (@Getter, @Setter, @Data, @Builder, @AllArgsConstructor, @Slf4j) and convert Java objects to and from JSON with Jackson ObjectMapper and annotations like @JsonProperty, @JsonIgnore and @JsonFormat.',
  objectives: [
    'Set up Lombok in Maven/Gradle and in IntelliJ/Eclipse',
    'Use @Getter, @Setter, @ToString, @EqualsAndHashCode, @Data, constructors, @Builder and @Slf4j correctly',
    'Serialize and deserialize objects, lists and maps with ObjectMapper',
    'Customize JSON with @JsonProperty, @JsonIgnore, @JsonFormat, @JsonInclude, @JsonIgnoreProperties',
    'Avoid common pitfalls: missing no-arg constructor, @Data on JPA entities, Java 8 dates',
  ],
  theory: [
    {
      heading: '1. What is Lombok and How Does it Work?',
      content: 'A simple Student class with 5 fields needs ~80 lines of getters, setters, constructors, toString, equals and hashCode. Lombok is an annotation processor: at COMPILE time it reads annotations like @Getter and writes those methods into the .class file. Your source stays short; the bytecode is the same as hand-written code. Analogy: you write "make tea" on a sticky note and the compiler (Lombok) prepares the full tea for you.',
      syntax: `<!-- Maven -->
<dependency>
  <groupId>org.projectlombok</groupId>
  <artifactId>lombok</artifactId>
  <version>1.18.32</version>
  <scope>provided</scope>
</dependency>

// Gradle
compileOnly 'org.projectlombok:lombok:1.18.32'
annotationProcessor 'org.projectlombok:lombok:1.18.32'`,
      points: [
        'IntelliJ: Lombok plugin is bundled; enable Settings > Build, Execution, Deployment > Compiler > Annotation Processors > Enable annotation processing',
        'Eclipse/STS: download lombok.jar, run java -jar lombok.jar, select the Eclipse installation, Install/Update, restart Eclipse',
        'Scope provided / compileOnly: Lombok is not needed at runtime',
        'With Java 21+ and maven-compiler-plugin you may need <annotationProcessorPaths> listing lombok',
      ],
    },
    {
      heading: '2. Important Lombok Annotations',
      content: 'Use only what you need. @Data is convenient for DTOs but too much for JPA entities.',
      points: [
        '@Getter / @Setter – on class (all fields) or on one field',
        '@ToString – ClassName(field=value, ...); @ToString.Exclude to skip a field (e.g. password)',
        '@EqualsAndHashCode – based on fields; @EqualsAndHashCode.Include / onlyExplicitlyIncluded = true',
        '@NoArgsConstructor, @AllArgsConstructor, @RequiredArgsConstructor (constructor for final and @NonNull fields – perfect for Spring constructor injection)',
        '@Data = @Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor',
        '@Value – immutable class: all fields private final, only getters, no setters',
        '@Builder – builder pattern: Student.builder().name("Riya").marks(90).build(); @Builder.Default for default values',
        '@Slf4j – creates private static final org.slf4j.Logger log = LoggerFactory.getLogger(ThisClass.class)',
        '@NonNull – adds a null check that throws NullPointerException',
      ],
      tip: 'On JPA entities avoid @Data: equals/hashCode/toString on lazy relationships cause LazyInitializationException or infinite recursion (StackOverflowError). Use @Getter @Setter @NoArgsConstructor and write toString carefully.',
    },
    {
      heading: '3. What is Jackson and ObjectMapper?',
      content: 'JSON is the language of REST APIs. Jackson (jackson-databind) converts Java objects to JSON (serialization) and JSON to Java objects (deserialization). ObjectMapper is the main class. Spring Boot includes Jackson in spring-boot-starter-web and uses it automatically for @RequestBody and @ResponseBody, so understanding Jackson = understanding your API\'s JSON.',
      syntax: `ObjectMapper mapper = new ObjectMapper();
String json = mapper.writeValueAsString(student);                 // Java -> JSON
Student s = mapper.readValue(json, Student.class);                 // JSON -> Java
List<Student> list = mapper.readValue(arr, new TypeReference<List<Student>>() {});
String pretty = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(student);
JsonNode node = mapper.readTree(json);  node.get("name").asText();`,
      points: [
        'Serialization uses getters (getName() → "name"); boolean isActive() → "active"',
        'Deserialization needs a no-arg constructor (or @JsonCreator) and setters or field access',
        'Unknown JSON property → UnrecognizedPropertyException by default (Spring Boot disables this failure)',
        'ObjectMapper is thread-safe after configuration: create once and reuse (Spring injects one)',
      ],
    },
    {
      heading: '4. Jackson Annotations',
      content: 'Annotations control the JSON shape without changing Java names.',
      points: [
        '@JsonProperty("full_name") – different JSON name for a field',
        '@JsonIgnore – never read/write this field (passwords, internal data)',
        '@JsonProperty(access = Access.WRITE_ONLY) – accept in request but never send in response (password on signup)',
        '@JsonFormat(pattern = "dd-MM-yyyy") – date format for LocalDate/LocalDateTime',
        '@JsonInclude(JsonInclude.Include.NON_NULL) – skip null fields',
        '@JsonIgnoreProperties(ignoreUnknown = true) – ignore extra JSON fields',
        '@JsonPropertyOrder({"id","name"}) – order of fields in output',
        '@JsonManagedReference / @JsonBackReference or @JsonIgnore – break infinite recursion in bidirectional relationships',
        'Java 8 dates need jackson-datatype-jsr310 and mapper.registerModule(new JavaTimeModule()) (Spring Boot does it for you)',
      ],
    },
    {
      heading: '5. Lombok + Jackson Together',
      content: 'DTOs usually use both. Jackson needs a no-arg constructor to create the object and setters to fill it, so a typical request/response DTO is @Data @NoArgsConstructor @AllArgsConstructor @Builder. Note: @Builder alone makes an all-args constructor and REMOVES the default constructor, so Jackson fails with "Cannot construct instance ... (no Creators, like default constructor, exist)". Adding @NoArgsConstructor requires @AllArgsConstructor too (for the builder). Java records (record StudentDto(String name, int marks)) also work with Jackson 2.12+ and need no Lombok.',
      syntax: `@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudentDto {
    private Long id;
    @JsonProperty("full_name")
    private String name;
    @JsonIgnore
    private String password;
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate dob;
}`,
    },
  ],
  examples: [
    {
      title: 'Lombok Basics: @Data, @Builder, Constructors',
      scenario: 'Replace an 80-line Product class with a few annotations and use it.',
      steps: [
        'Add the Lombok dependency (theory 1) and reload Maven/Gradle',
        'IntelliJ: make sure annotation processing is enabled; Eclipse: run lombok.jar installer once',
        'Create Product.java and App.java in package com.stn',
        'Run App ▶. In IntelliJ press Alt+7 (Structure) on Product to see generated methods',
      ],
      code: `package com.stn;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    private Long id;
    private String name;
    private double price;
    @Builder.Default
    private int stock = 10;
    @ToString.Exclude
    private String supplierSecret;
}

// App.java
package com.stn;

public class App {
    public static void main(String[] args) {
        Product p1 = new Product(1L, "Laptop", 55000.0, 5, "x1");
        Product p2 = Product.builder().id(2L).name("Mouse").price(499.0).build();
        Product p3 = new Product();
        p3.setName("Keyboard");

        System.out.println(p1);
        System.out.println(p2);
        System.out.println(p3);
        System.out.println(p2.getStock());
        System.out.println(p1.equals(new Product(1L, "Laptop", 55000.0, 5, "x1")));
    }
}`,
      result: `Product(id=1, name=Laptop, price=55000.0, stock=5)
Product(id=2, name=Mouse, price=499.0, stock=10)
Product(id=null, name=Keyboard, price=0.0, stock=10)
10
true`,
      explanation: '@ToString.Exclude hides supplierSecret. @Builder.Default keeps stock = 10 when the builder does not set it (without it the builder would give 0); with @NoArgsConstructor the field initializer also applies. equals() compares all fields, so two separate objects with equal data are equal.',
    },
    {
      title: 'What Lombok Generates (runnable, plain Java)',
      scenario: 'See the exact methods @Data, @AllArgsConstructor and @Builder create by writing them by hand.',
      steps: [
        'IntelliJ: File > New > Java Class > Main (default package, no Lombok needed)',
        'Type the code (both classes in Main.java) and click Run ▶',
        'Tip: in a Lombok project, IntelliJ Refactor > Delombok shows the same generated code',
      ],
      code: delombokCode,
      java: { files: { 'Main.java': delombokCode } },
      result: `Student(id=1, name=Riya, marks=88.5)
equals: true
same hash: true
Riya -> 91.0
equals after change: false`,
      explanation: 'The builder stores values and calls the all-args constructor in build(). toString follows Lombok\'s ClassName(field=value) style. equals/hashCode use all fields, so s1 equals s2 until s2\'s marks change through the generated setter. Lombok saves you writing all this.',
    },
    {
      title: '@Slf4j and @RequiredArgsConstructor in a Spring Boot Service',
      scenario: 'Write a Spring service with constructor injection and logging using Lombok.',
      steps: [
        'Spring Initializr: add Spring Web + Lombok',
        'Create StudentRepository (simple in-memory) and StudentService',
        'Run the application and call the service from a controller or CommandLineRunner',
      ],
      code: `package com.stn.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.stn.repo.StudentRepository;
import com.stn.dto.StudentDto;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository repository;   // injected by generated constructor

    public StudentDto findById(Long id) {
        log.info("Finding student with id {}", id);
        StudentDto dto = repository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Student {} not found", id);
                    return new RuntimeException("Student not found: " + id);
                });
        log.debug("Found {}", dto);
        return dto;
    }
}

// Generated by Lombok (you do NOT write this):
// private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(StudentService.class);
// public StudentService(StudentRepository repository) { this.repository = repository; }`,
      result: `2026-11-18T10:15:02.114+05:30  INFO 8124 --- [nio-8080-exec-1] com.stn.service.StudentService : Finding student with id 7
2026-11-18T10:15:02.120+05:30  WARN 8124 --- [nio-8080-exec-1] com.stn.service.StudentService : Student 7 not found`,
      explanation: '@RequiredArgsConstructor creates a constructor for the final field; Spring uses the only constructor for injection (no @Autowired needed). @Slf4j creates the log field. The debug line is not printed because the default level is INFO.',
    },
    {
      title: 'Jackson ObjectMapper: Object ↔ JSON, Lists and JsonNode',
      scenario: 'Convert Student objects to JSON and back in a plain Maven project.',
      steps: [
        'Add dependency com.fasterxml.jackson.core:jackson-databind:2.17.1 (and Lombok)',
        'Create Student.java (Lombok DTO) and JsonDemo.java',
        'Run JsonDemo ▶',
      ],
      code: `// pom.xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>2.17.1</version>
</dependency>

// Student.java
package com.stn;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    private int id;
    private String name;
    private double marks;
    private boolean active;
}

// JsonDemo.java
package com.stn;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.*;
import java.util.List;

public class JsonDemo {
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        Student s = new Student(1, "Riya", 88.5, true);
        String json = mapper.writeValueAsString(s);
        System.out.println(json);

        Student back = mapper.readValue("{\\"id\\":2,\\"name\\":\\"Aman\\",\\"marks\\":75.0,\\"active\\":false}", Student.class);
        System.out.println(back);

        String arr = "[{\\"id\\":3,\\"name\\":\\"Neha\\",\\"marks\\":91.0,\\"active\\":true}]";
        List<Student> list = mapper.readValue(arr, new TypeReference<List<Student>>() {});
        System.out.println(list.size() + " -> " + list.get(0).getName());

        JsonNode node = mapper.readTree(json);
        System.out.println("name = " + node.get("name").asText());

        System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(s));
    }
}`,
      result: `{"id":1,"name":"Riya","marks":88.5,"active":true}
Student(id=2, name=Aman, marks=75.0, active=false)
1 -> Neha
name = Riya
{
  "id" : 1,
  "name" : "Riya",
  "marks" : 88.5,
  "active" : true
}`,
      explanation: 'writeValueAsString uses the Lombok getters (isActive() → "active"). readValue creates the object with the no-arg constructor and fills it with setters. TypeReference keeps the generic type List<Student>; without it you would get a List of LinkedHashMap. readTree gives a tree when you do not have a class.',
    },
    {
      title: 'Jackson Annotations: @JsonProperty, @JsonIgnore, @JsonFormat, @JsonInclude',
      scenario: 'An API must send full_name, hide the password, format the date as dd-MM-yyyy, skip null fields and ignore unknown fields.',
      steps: [
        'Add jackson-datatype-jsr310 dependency for LocalDate (Spring Boot already has it)',
        'Create UserDto.java with the annotations',
        'Register JavaTimeModule on the ObjectMapper and run the demo',
      ],
      code: `<dependency>
  <groupId>com.fasterxml.jackson.datatype</groupId>
  <artifactId>jackson-datatype-jsr310</artifactId>
  <version>2.17.1</version>
</dependency>

// UserDto.java
package com.stn;

import com.fasterxml.jackson.annotation.*;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserDto {
    private Long id;

    @JsonProperty("full_name")
    private String name;

    @JsonIgnore
    private String password;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate dob;

    private String city;
}

// AnnotationDemo.java
package com.stn;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.LocalDate;

public class AnnotationDemo {
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

        UserDto u = new UserDto(10L, "Riya Sharma", "secret123", LocalDate.of(2002, 3, 15), null);
        System.out.println(mapper.writeValueAsString(u));

        String in = "{\\"id\\":11,\\"full_name\\":\\"Aman Verma\\",\\"dob\\":\\"01-01-2001\\",\\"age\\":23}";
        UserDto read = mapper.readValue(in, UserDto.class);
        System.out.println(read);
    }
}`,
      result: `{"id":10,"full_name":"Riya Sharma","dob":"15-03-2002"}
UserDto(id=11, name=Aman Verma, password=null, dob=2001-01-01, city=null)`,
      explanation: 'password is ignored, city is skipped because it is null (NON_NULL), name is written as full_name, and dob uses the pattern. While reading, the unknown field "age" is ignored instead of throwing UnrecognizedPropertyException. Without JavaTimeModule, Jackson throws InvalidDefinitionException for LocalDate.',
    },
  ],
  interview: [
    { q: 'What is Lombok and how does it work?', a: 'A Java library that acts as an annotation processor at compile time. It modifies the compiler\'s AST to generate getters, setters, constructors, toString, equals/hashCode, builders and loggers into the bytecode, reducing boilerplate. It is not needed at runtime.', level: 'Easy' },
    { q: 'What does @Data include?', a: '@Getter, @Setter (for non-final fields), @ToString, @EqualsAndHashCode and @RequiredArgsConstructor.', level: 'Easy' },
    { q: 'Difference between @Data and @Value?', a: '@Data creates a mutable class with setters. @Value creates an immutable class: fields private final, no setters, class final, all-args constructor, getters, equals/hashCode, toString.', level: 'Medium' },
    { q: 'Why should we avoid @Data on JPA entities?', a: 'Generated equals/hashCode/toString use all fields including lazy collections and bidirectional relations, which can trigger lazy loading, LazyInitializationException, or infinite recursion (StackOverflowError). Also mutable hashCode breaks Sets. Use @Getter/@Setter and custom equals based on id.', level: 'Hard' },
    { q: 'What is @RequiredArgsConstructor and why is it popular with Spring?', a: 'It generates a constructor for all final fields and @NonNull fields. With private final dependencies, it gives clean constructor injection without writing the constructor or @Autowired.', level: 'Medium' },
    { q: 'What does @Builder do? Any pitfall?', a: 'It generates a static builder() with fluent setter-like methods and build(). Pitfall: field initial values are ignored unless @Builder.Default is used, and it removes the default no-arg constructor, so Jackson/JPA need @NoArgsConstructor + @AllArgsConstructor.', level: 'Medium' },
    { q: 'What is ObjectMapper?', a: 'The main Jackson class for converting between Java objects and JSON: writeValueAsString, readValue, readTree, convertValue. It is thread-safe once configured, so it should be reused.', level: 'Easy' },
    { q: 'Serialization vs deserialization in Jackson?', a: 'Serialization: Java object → JSON (uses getters / public fields). Deserialization: JSON → Java object (uses no-arg constructor or @JsonCreator, then setters/fields).', level: 'Easy' },
    { q: 'How do you hide a field in JSON?', a: '@JsonIgnore on the field, @JsonIgnoreProperties({"field"}) on the class, or @JsonProperty(access = WRITE_ONLY) to accept it in input but never output it (e.g. password).', level: 'Medium' },
    { q: 'How do you handle LocalDate in Jackson?', a: 'Add jackson-datatype-jsr310 and register JavaTimeModule (Spring Boot auto-registers), optionally disable WRITE_DATES_AS_TIMESTAMPS, and use @JsonFormat(pattern = "dd-MM-yyyy") for a custom format.', level: 'Medium' },
    { q: 'How do you deserialize a JSON array into List<Student>?', a: 'mapper.readValue(json, new TypeReference<List<Student>>() {}) because of type erasure; Student[].class also works.', level: 'Medium' },
    { q: 'How do you solve infinite recursion when serializing bidirectional JPA relationships?', a: 'Use DTOs (best), or @JsonManagedReference on the parent side and @JsonBackReference on the child side, or @JsonIgnore on one side, or @JsonIdentityInfo.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create an immutable Lombok class Address (street, city, pin) and an Employee class with @Data, @NoArgsConstructor, @AllArgsConstructor, @Builder that contains an Address and a role defaulting to "DEVELOPER". Build one employee and print it.',
      hint: '@Value for Address, @Builder.Default for role.',
      solution: `import lombok.*;

@Value
class Address {
    String street;
    String city;
    String pin;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class Employee {
    private Long id;
    private String name;
    private Address address;
    @Builder.Default
    private String role = "DEVELOPER";
}

public class App {
    public static void main(String[] args) {
        Employee e = Employee.builder()
                .id(1L)
                .name("Riya")
                .address(new Address("MG Road", "Pune", "411001"))
                .build();
        System.out.println(e);
    }
}
// Output:
// Employee(id=1, name=Riya, address=Address(street=MG Road, city=Pune, pin=411001), role=DEVELOPER)`,
    },
    {
      task: 'Write a program that reads this JSON into an Order object and prints the total: {"orderId":101,"items":[{"name":"Pen","price":10.0,"qty":3},{"name":"Book","price":250.0,"qty":1}]}.',
      hint: 'Two classes Order and Item with Lombok @Data @NoArgsConstructor; loop items.',
      solution: `import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import java.util.List;

@Data @NoArgsConstructor
class Item {
    private String name;
    private double price;
    private int qty;
}

@Data @NoArgsConstructor
class Order {
    private int orderId;
    private List<Item> items;
}

public class OrderTotal {
    public static void main(String[] args) throws Exception {
        String json = "{\\"orderId\\":101,\\"items\\":[{\\"name\\":\\"Pen\\",\\"price\\":10.0,\\"qty\\":3},"
                + "{\\"name\\":\\"Book\\",\\"price\\":250.0,\\"qty\\":1}]}";
        Order order = new ObjectMapper().readValue(json, Order.class);
        double total = 0;
        for (Item i : order.getItems()) {
            total += i.getPrice() * i.getQty();
        }
        System.out.println("Order " + order.getOrderId() + " total = " + total);
    }
}
// Output: Order 101 total = 280.0`,
    },
    {
      task: 'Create a SignupRequest DTO where password is accepted in JSON input but never returned in output, email is serialized as "email_id", and null fields are skipped.',
      hint: '@JsonProperty(access = JsonProperty.Access.WRITE_ONLY), @JsonInclude.',
      solution: `import com.fasterxml.jackson.annotation.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SignupRequest {
    private String username;

    @JsonProperty("email_id")
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String phone;
}

// new ObjectMapper().writeValueAsString(new SignupRequest("riya", "r@x.com", "p@ss", null))
// -> {"username":"riya","email_id":"r@x.com"}`,
    },
    {
      task: 'Write plain Java (no Lombok) for a class Book(title, price) with a builder, so that Book.builder().title("Java").price(450).build() prints Book(title=Java, price=450.0).',
      hint: 'Static nested BookBuilder class returning this.',
      solution: `class Book {
    private final String title;
    private final double price;

    private Book(String title, double price) {
        this.title = title;
        this.price = price;
    }

    public static BookBuilder builder() { return new BookBuilder(); }

    public static class BookBuilder {
        private String title;
        private double price;
        public BookBuilder title(String title) { this.title = title; return this; }
        public BookBuilder price(double price) { this.price = price; return this; }
        public Book build() { return new Book(title, price); }
    }

    @Override
    public String toString() { return "Book(title=" + title + ", price=" + price + ")"; }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(Book.builder().title("Java").price(450).build());
    }
}
// Output: Book(title=Java, price=450.0)`,
    },
  ],
  quiz: [
    { question: 'Which Maven scope is correct for Lombok?', options: ['runtime', 'test', 'provided', 'system'], answer: 2, explanation: 'Lombok works at compile time only.' },
    { question: 'Which annotation generates a constructor for final fields only?', options: ['@RequiredArgsConstructor', '@AllArgsConstructor', '@NoArgsConstructor', '@Builder'], answer: 0, explanation: '@RequiredArgsConstructor covers final and @NonNull fields.' },
    { question: 'Jackson fails with "no Creators, like default constructor, exist". Most likely fix?', options: ['Add @JsonIgnore', 'Add @NoArgsConstructor (and @AllArgsConstructor with @Builder)', 'Remove getters', 'Use @Value'], answer: 1, explanation: 'Jackson needs a no-arg constructor (or @JsonCreator) to create the object.' },
    { question: 'Which annotation renames a field in JSON?', options: ['@JsonFormat', '@JsonInclude', '@JsonIgnore', '@JsonProperty'], answer: 3, explanation: '@JsonProperty("new_name") sets the JSON name.' },
    { question: 'What does @Slf4j generate?', options: ['A logback.xml file', 'A static final Logger field named log', 'A toString method', 'A log folder'], answer: 1, explanation: 'private static final org.slf4j.Logger log = LoggerFactory.getLogger(Class.class).' },
  ],
};
