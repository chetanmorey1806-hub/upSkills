export default {
  lesson: 'day-20-testing-junit-mockito',
  minutes: 24,
  intro: 'Choose the right test type, stub dependencies with Mockito and write @WebMvcTest / MockMvc expectations.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'According to the testing pyramid, which tests should you have the **most** of?',
      options: ['End-to-end UI tests', 'Full @SpringBootTest integration tests', 'Fast unit tests (e.g. a service with mocked repository)', 'Manual tests in Postman'],
      answer: 2,
      explain: 'Many fast **unit tests** at the bottom, fewer slice/integration tests in the middle, very few slow end-to-end tests at the top. Unit tests run in milliseconds and pinpoint the broken class.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`repo` is a Mockito mock of `StudentRepository` (a JpaRepository). What does this print? (one value per line)',
      example: { title: 'unstubbed mock methods', text: 'A mock returns "empty" defaults for anything not stubbed: 0, false, null, empty collections and Optional.empty().' },
      code: `when(repo.count()).thenReturn(5L);
when(repo.existsById(1L)).thenReturn(true);

System.out.println(repo.count());
System.out.println(repo.existsById(1L));
System.out.println(repo.existsById(2L));
System.out.println(repo.findAll().size());
System.out.println(repo.findById(1L).isPresent());`,
      expected: '5\ntrue\nfalse\n0\nfalse',
      explain: 'Stubbed calls return the stubbed values (5, true). `existsById(2L)` was not stubbed for argument 2 → default false. `findAll()` returns an empty list (size 0) and `findById` returns `Optional.empty()`, so `isPresent()` is false.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the class annotation for a **controller slice test** that loads only `StudentController` and MockMvc (no database):\n```\n???\nclass StudentControllerTest {\n    @Autowired MockMvc mockMvc;\n}\n```',
      example: { title: 'a repository slice test', code: '@DataJpaTest\nclass StudentRepositoryTest { ... }' },
      accept: ['@WebMvcTest(StudentController.class)', '@WebMvcTest(controllers = StudentController.class)', '@WebMvcTest({StudentController.class})'],
      explain: '`@WebMvcTest(StudentController.class)` starts only the web layer (controllers, advice, Jackson, MockMvc). Services are not loaded, so you provide them as mocks. `@SpringBootTest` would start the whole application - slower.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'In that `@WebMvcTest`, the controller needs a `StudentService`. Which annotation puts a Mockito mock of it into the Spring context?\n```\n??? StudentService service;\n```',
      example: { title: 'plain unit test (no Spring)', code: '@ExtendWith(MockitoExtension.class)\nclass ServiceTest {\n  @Mock StudentRepository repo;\n  @InjectMocks StudentService service;\n}' },
      accept: ['@MockBean', '@MockitoBean'],
      explain: '`@MockBean` (Boot ≤ 3.3) or its replacement **@MockitoBean** (Boot 3.4+) adds a mock bean to the application context. A plain `@Mock` would not be visible to Spring, so the controller could not be created.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the MockMvc expectation for a missing student:\n```\nmockMvc.perform(get("/api/students/99"))\n       .andExpect(???);\n```',
      example: { title: 'checking JSON', code: '.andExpect(jsonPath("$.name").value("Asha"))' },
      accept: ['status().isNotFound()', 'status().is(404)', 'status().is4xxClientError()'],
      explain: '`status().isNotFound()` asserts 404. Combine with `jsonPath(...)` to check the error body. The static imports come from `MockMvcRequestBuilders` and `MockMvcResultMatchers`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'verify(repo).deleteById(5L) fails if deleteById(5L) was never called',
        '@DataJpaTest rolls back each test, so tests do not affect each other',
        '@SpringBootTest starts the full application context',
        'assertThrows(StudentNotFoundException.class, () -> service.get(99L)) checks an exception is thrown',
        'Unit tests should call the real MySQL database',
      ],
      answers: [0, 1, 2, 3],
      explain: '`verify` checks interactions, `assertThrows` checks exceptions. `@DataJpaTest` runs each test in a rolled-back transaction (embedded DB or Testcontainers). Unit tests use mocks instead of a real database so they are fast and repeatable.',
    },
  ],
};
