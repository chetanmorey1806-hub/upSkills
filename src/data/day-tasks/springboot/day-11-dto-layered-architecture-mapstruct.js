export default {
  lesson: 'day-11-dto-layered-architecture-mapstruct',
  minutes: 22,
  intro: 'Separate controller, service and repository responsibilities, use request/response DTOs and map them by hand or with MapStruct.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these belong in the **service** layer? (choose all that apply)',
      options: [
        'Business rules, e.g. "a student cannot enrol in more than 5 courses"',
        'Starting a @Transactional unit of work',
        'Reading @PathVariable and choosing the HTTP status',
        'Writing SQL/JPA queries',
        'Calling repositories and combining their results',
      ],
      answers: [0, 1, 4],
      explain: '**Controller** = HTTP (paths, params, status codes). **Service** = business logic, transactions, orchestration of repositories. **Repository** = data access (queries). Putting business rules in controllers or queries in services makes code hard to test and reuse.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why return a `StudentResponse` DTO instead of the `Student` JPA entity from a controller?',
      options: [
        'DTOs make the app run faster in all cases',
        'The API contract is decoupled from the database model: sensitive fields (password) stay hidden, lazy relations do not leak, and the entity can change without breaking clients',
        'Entities cannot be converted to JSON',
        'Spring requires DTOs for every endpoint',
      ],
      answer: 1,
      explain: 'A DTO is the **shape the client sees**. It hides internal fields like `password`, avoids lazy-loading/recursion problems with relations and lets you rename columns without breaking the frontend. Entities can be serialised, which is exactly why they leak data by accident.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The controller returns `mapper.toResponse(student)`. What JSON does the client receive? (one line, no spaces, fields in record order)',
      example: { title: 'records become JSON objects', code: 'record CityDto(String name, int pin) {}\nnew CityDto("Pune", 411001)   // {"name":"Pune","pin":411001}' },
      code: `// entity
Student s = new Student(7L, "Asha", "Patil", "asha@mail.com", "secret123", 82);

public record StudentResponse(Long id, String fullName, String email, String grade) {}

public StudentResponse toResponse(Student s) {
    String grade = s.getMarks() >= 75 ? "Distinction" : "Pass";
    return new StudentResponse(s.getId(),
            s.getFirstName() + " " + s.getLastName(),
            s.getEmail(), grade);
}`,
      expected: '{"id":7,"fullName":"Asha Patil","email":"asha@mail.com","grade":"Distinction"}',
      explain: 'Only the 4 record components are serialised. `password` never reaches the client, `fullName` is built from two fields and 82 >= 75 gives "Distinction". This is the main job of a response DTO.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the MapStruct annotation so the generated mapper becomes a **Spring bean** you can inject:\n```\n???\npublic interface StudentMapper {\n    StudentResponse toResponse(Student s);\n}\n```',
      example: { title: 'injecting it later', code: 'private final StudentMapper mapper;   // constructor injection' },
      accept: ['@Mapper(componentModel = "spring")', '@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)'],
      explain: 'MapStruct generates `StudentMapperImpl` at **compile time**. `componentModel = "spring"` adds `@Component` to it so Spring can inject it. Without it you must use `Mappers.getMapper(StudentMapper.class)`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'The entity field is `dob` but the DTO field is `dateOfBirth`. Complete the MapStruct annotation on the method:\n```\n???\nStudentResponse toResponse(Student s);\n```',
      example: { title: 'ignoring a target field', code: '@Mapping(target = "id", ignore = true)' },
      accept: ['@Mapping(source = "dob", target = "dateOfBirth")', '@Mapping(target = "dateOfBirth", source = "dob")'],
      explain: 'MapStruct maps same-named fields automatically. For different names you add `@Mapping(source = "dob", target = "dateOfBirth")`. MapStruct warns at compile time about unmapped target fields - an advantage over runtime mappers.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the main difference between **MapStruct** and **ModelMapper**?',
      options: [
        'MapStruct generates plain mapping code at compile time; ModelMapper maps at runtime using reflection',
        'ModelMapper is faster because it uses code generation',
        'MapStruct only works with Gradle',
        'There is no difference',
      ],
      answer: 0,
      explain: 'MapStruct = **compile-time** code generation (fast, type-safe, errors found while building). ModelMapper = **runtime reflection** (no setup, but slower and mistakes show up only when the code runs). A hand-written mapper is also perfectly fine for small projects.',
    },
  ],
};
