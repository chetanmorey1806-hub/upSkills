export default {
  lesson: 'day-06-junit5-deep-dive',
  minutes: 24,
  intro: 'Trace the JUnit 5 lifecycle, count parameterized runs, test exceptions and read JaCoCo coverage.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'What does running this test class print? (one line per println)',
      example: { title: 'per-test vs per-class', text: '@BeforeEach/@AfterEach run around EVERY test; @BeforeAll/@AfterAll run once for the class (static methods).' },
      code: `@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CartTest {
    @BeforeAll static void init()  { System.out.println("start"); }
    @BeforeEach void setUp()       { System.out.println("new cart"); }
    @AfterEach  void tearDown()    { System.out.println("clear"); }
    @AfterAll  static void done()  { System.out.println("end"); }

    @Test @Order(2) void total()   { System.out.println("total"); }
    @Test @Order(1) void add()     { System.out.println("add"); }
}`,
      expected: 'start\nnew cart\nadd\nclear\nnew cart\ntotal\nclear\nend',
      explain: '`@BeforeAll` once → for each test (ordered by @Order: add, then total): `@BeforeEach`, test, `@AfterEach` → `@AfterAll` once. JUnit creates a new instance of the class for every test, so tests do not share fields.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`isEven(n)` is implemented correctly (`n % 2 == 0`). How many times does the test method run, and how many runs **fail**? Type two lines: runs, then failures.',
      example: { title: 'CsvSource', text: 'Each string in @CsvSource is one run; values are split by commas into the parameters.' },
      code: `@ParameterizedTest
@CsvSource({ "2, true", "3, false", "10, true", "7, true", "0, true" })
void checksEven(int n, boolean expected) {
    assertEquals(expected, MathUtil.isEven(n));
}`,
      expected: '5\n1',
      explain: '5 CSV rows → **5 runs**. Only "7, true" is wrong (7 is odd, isEven returns false) → **1 failure**. Parameterized tests replace copy-pasted test methods; each row is reported separately.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the assertion that checks `calc.divide(5, 0)` throws `ArithmeticException`:\n```\n???\n```',
      example: { title: 'checking the message too', code: 'var ex = assertThrows(IllegalArgumentException.class, () -> svc.setAge(-1));\nassertEquals("Age must be positive", ex.getMessage());' },
      accept: ['assertThrows(ArithmeticException.class, () -> calc.divide(5, 0));', 'assertThrows(ArithmeticException.class, () -> calc.divide(5, 0))', 'Assertions.assertThrows(ArithmeticException.class, () -> calc.divide(5, 0));', 'assertThrows(ArithmeticException.class, () -> { calc.divide(5, 0); });'],
      explain: '`assertThrows(Type.class, executable)` runs the lambda and passes only if that exception (or a subclass) is thrown; it returns the exception for further checks. Calling `calc.divide(5, 0)` directly would crash the test instead.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`assertEquals(a, b)` failed with: `expected: <90> but was: <85>`. The test is `assertEquals(result.getMarks(), 90);`. What is wrong?',
      options: [
        'Nothing, the message is right',
        'The arguments are swapped: JUnit expects assertEquals(expected, actual), so the message is misleading',
        'assertEquals cannot compare ints',
        'It should be assertSame',
      ],
      answer: 1,
      explain: 'The signature is **assertEquals(expected, actual)**. With swapped arguments the failure message says the opposite of the truth, which wastes debugging time. Write `assertEquals(90, result.getMarks())`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'assertAll(...) runs all grouped assertions and reports every failure together',
        '@DisplayName("Should give 10% discount above 5000") changes how the test is shown in reports',
        '@Disabled skips a test',
        '@BeforeAll methods must be static (with the default lifecycle)',
        'JUnit 5 tests must be public classes with public methods',
      ],
      answers: [0, 1, 2, 3],
      explain: 'JUnit 5 (Jupiter) test classes and methods can be **package-private** - `public` is not needed (it was in JUnit 4). `assertAll`, `@DisplayName`, `@Disabled` and static `@BeforeAll` are all correct.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'After `mvn test` with the JaCoCo plugin (report goal bound to the test phase), which file do you open in the browser to see the coverage report? Give the path from the project root.',
      example: { title: 'Gradle location', code: 'build/reports/jacoco/test/html/index.html' },
      accept: ['target/site/jacoco/index.html', './target/site/jacoco/index.html'],
      explain: 'Maven JaCoCo writes the HTML report to **target/site/jacoco/index.html**: green = covered, red = never executed, yellow = partly covered branches. High coverage does not prove good tests, but red lines are definitely untested.',
    },
  ],
};
