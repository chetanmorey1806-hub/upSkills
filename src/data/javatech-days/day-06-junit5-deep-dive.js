const MAVEN_STEPS = [
  'IntelliJ: File > New > Project > Maven (Java 17, GroupId com.example). Eclipse: File > New > Maven Project > Create a simple project',
  'Paste the dependencies into pom.xml, then click the Maven refresh icon (IntelliJ) or right-click project > Maven > Update Project (Eclipse)',
  'Put production classes in src/main/java and test classes in src/test/java (same package name)',
  'Run: right-click the test class > Run \'CalculatorTest\' (IntelliJ) or Run As > JUnit Test (Eclipse), or in a terminal: mvn test',
];

const pom = `<!-- pom.xml (only the important parts) -->
<properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>

<dependencies>
    <!-- junit-jupiter = API + params + engine in one dependency -->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>5.10.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>

<build>
    <plugins>
        <!-- Surefire runs the tests during "mvn test" -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.2.5</version>
        </plugin>
    </plugins>
</build>`;

const ex1 = `// ===== src/main/java/com/example/Calculator.java =====
package com.example;

public class Calculator {
    public int add(int a, int b)      { return a + b; }
    public int subtract(int a, int b) { return a - b; }
    public int divide(int a, int b) {
        if (b == 0) {
            throw new ArithmeticException("Cannot divide by zero");
        }
        return a / b;
    }
    public boolean isEven(int n)      { return n % 2 == 0; }
}

// ===== src/test/java/com/example/CalculatorTest.java =====
package com.example;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Calculator tests")
class CalculatorTest {

    private final Calculator calc = new Calculator();

    @Test
    @DisplayName("2 + 3 should be 5")
    void addTwoPositiveNumbers() {
        assertEquals(5, calc.add(2, 3));          // (expected, actual)
    }

    @Test
    void subtractGivesNegativeResult() {
        assertEquals(-2, calc.subtract(3, 5), "3 - 5 must be -2");   // message shown only on failure
    }

    @Test
    void evenAndOddChecks() {
        assertTrue(calc.isEven(10));
        assertFalse(calc.isEven(7));
    }

    @Test
    void groupedAssertions() {
        // assertAll runs EVERY assertion and reports all failures together
        assertAll("basic operations",
            () -> assertEquals(4, calc.add(2, 2)),
            () -> assertEquals(0, calc.subtract(2, 2)),
            () -> assertEquals(1, calc.divide(2, 2))
        );
    }

    @Test
    void objectAndNullAssertions() {
        String name = "Riya";
        String nothing = null;
        assertNotNull(name);
        assertNull(nothing);
        assertSame(name, name);                                // same reference
        assertArrayEquals(new int[]{1, 2}, new int[]{1, 2});  // compares contents
    }
}`;

const ex1Result = `IntelliJ Run window (green bar):
✔ Calculator tests
   ✔ 2 + 3 should be 5
   ✔ subtractGivesNegativeResult()
   ✔ evenAndOddChecks()
   ✔ groupedAssertions()
   ✔ objectAndNullAssertions()
Tests passed: 5 of 5 tests

mvn test (terminal, time will differ on your machine):
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.example.CalculatorTest
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.052 s -- in com.example.CalculatorTest
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] BUILD SUCCESS`;

const ex2 = `// ===== src/test/java/com/example/LifecycleTest.java =====
package com.example;

import org.junit.jupiter.api.*;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)   // run tests in @Order sequence
class LifecycleTest {

    private List<String> cart;          // fresh for every test

    LifecycleTest() {
        System.out.println("  constructor: new LifecycleTest object");
    }

    @BeforeAll
    static void beforeAll() {            // MUST be static (default lifecycle)
        System.out.println("@BeforeAll : start test DB once");
    }

    @BeforeEach
    void setUp() {
        cart = new ArrayList<>();
        System.out.println("  @BeforeEach: empty cart created");
    }

    @Test
    @Order(1)
    void addOneItem() {
        cart.add("Pen");
        System.out.println("    test addOneItem, size = " + cart.size());
        assertEquals(1, cart.size());
    }

    @Test
    @Order(2)
    void addTwoItems() {
        cart.add("Book");
        cart.add("Bag");
        System.out.println("    test addTwoItems, size = " + cart.size());
        assertEquals(2, cart.size());   // passes: cart is NOT shared with test 1
    }

    // A test marked @Disabled("reason") would be skipped and reported as "Skipped"

    @AfterEach
    void tearDown() {
        System.out.println("  @AfterEach : cart cleared");
    }

    @AfterAll
    static void afterAll() {
        System.out.println("@AfterAll  : stop test DB");
    }
}`;

const ex2Result = `@BeforeAll : start test DB once
  constructor: new LifecycleTest object
  @BeforeEach: empty cart created
    test addOneItem, size = 1
  @AfterEach : cart cleared
  constructor: new LifecycleTest object
  @BeforeEach: empty cart created
    test addTwoItems, size = 2
  @AfterEach : cart cleared
@AfterAll  : stop test DB

Tests run: 2, Failures: 0, Errors: 0, Skipped: 0`;

const ex3 = `// ===== src/main/java/com/example/StringUtil.java =====
package com.example;

public class StringUtil {
    public static boolean isPalindrome(String s) {
        String clean = s.toLowerCase().replace(" ", "");
        return new StringBuilder(clean).reverse().toString().equals(clean);
    }
    public static int countVowels(String s) {
        int count = 0;
        for (char c : s.toLowerCase().toCharArray()) {
            if ("aeiou".indexOf(c) >= 0) count++;
        }
        return count;
    }
}

// ===== src/test/java/com/example/StringUtilTest.java =====
package com.example;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import static org.junit.jupiter.api.Assertions.*;

class StringUtilTest {

    // ONE method, runs 4 times (once per value)
    @ParameterizedTest(name = "\\"{0}\\" is a palindrome")
    @ValueSource(strings = {"madam", "level", "Nitin", "nurses run"})
    void palindromes(String word) {
        assertTrue(StringUtil.isPalindrome(word));
    }

    // each CSV row = one run: input, expected
    @ParameterizedTest(name = "{0} has {1} vowels")
    @CsvSource({
        "java,      2",
        "spring,    1",
        "AEIOU,     5",
        "rhythm,    0"
    })
    void vowelCount(String input, int expected) {
        assertEquals(expected, StringUtil.countVowels(input));
    }
}`;

const ex3Result = `✔ StringUtilTest
   ✔ palindromes(String)
      ✔ [1] "madam" is a palindrome
      ✔ [2] "level" is a palindrome
      ✔ [3] "Nitin" is a palindrome
      ✔ [4] "nurses run" is a palindrome
   ✔ vowelCount(String, int)
      ✔ [1] java has 2 vowels
      ✔ [2] spring has 1 vowels
      ✔ [3] AEIOU has 5 vowels
      ✔ [4] rhythm has 0 vowels
Tests passed: 8 of 8 tests`;

const ex4 = `// ===== src/main/java/com/example/BankAccount.java =====
package com.example;

public class BankAccount {
    private int balance;

    public BankAccount(int opening) {
        if (opening < 0) throw new IllegalArgumentException("Opening balance cannot be negative");
        this.balance = opening;
    }
    public void withdraw(int amount) {
        if (amount > balance) {
            throw new IllegalStateException("Insufficient balance: " + balance);
        }
        balance -= amount;
    }
    public int getBalance() { return balance; }
}

// ===== src/test/java/com/example/BankAccountTest.java =====
package com.example;

import org.junit.jupiter.api.Test;
import java.time.Duration;
import static org.junit.jupiter.api.Assertions.*;

class BankAccountTest {

    @Test
    void withdrawMoreThanBalanceThrows() {
        BankAccount acc = new BankAccount(1000);
        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> acc.withdraw(5000));                       // code that SHOULD throw
        assertEquals("Insufficient balance: 1000", ex.getMessage());   // check the message too
        assertEquals(1000, acc.getBalance());                    // balance unchanged
    }

    @Test
    void negativeOpeningBalanceThrows() {
        assertThrows(IllegalArgumentException.class, () -> new BankAccount(-1));
    }

    @Test
    void validWithdrawDoesNotThrow() {
        BankAccount acc = new BankAccount(1000);
        assertDoesNotThrow(() -> acc.withdraw(400));
        assertEquals(600, acc.getBalance());
    }

    @Test
    void withdrawIsFast() {
        assertTimeout(Duration.ofMillis(100), () -> new BankAccount(10).withdraw(5));
    }
}

<!-- ===== pom.xml: add JaCoCo for code coverage ===== -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <goals><goal>prepare-agent</goal></goals>   <!-- attaches agent before tests -->
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals><goal>report</goal></goals>         <!-- writes target/site/jacoco/index.html -->
        </execution>
    </executions>
</plugin>`;

const ex4Result = `mvn clean test
[INFO] Running com.example.BankAccountTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.061 s -- in com.example.BankAccountTest
[INFO] Results:
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
[INFO] --- jacoco:0.8.11:report (report) @ demo ---
[INFO] Loading execution data file /.../target/jacoco.exec
[INFO] Analyzed bundle 'demo' with 1 classes
[INFO] BUILD SUCCESS

Open target/site/jacoco/index.html in a browser:
Element        Instruction Cov.  Missed Branches  Branch Cov.  Lines missed
BankAccount    100%              0 of 4           100%         0`;

const ex5 = `import java.util.LinkedHashMap;
import java.util.Map;

class Calculator {
    int add(int a, int b) { return a + b; }
    int divide(int a, int b) {
        if (b == 0) throw new ArithmeticException("Cannot divide by zero");
        return a / b;
    }
    boolean isEven(int n) { return n % 2 == 0; }
}

// A tiny version of org.junit.jupiter.api.Assertions
class Assert {
    static void assertEquals(Object expected, Object actual) {
        if (!expected.equals(actual)) {
            throw new AssertionError("expected: <" + expected + "> but was: <" + actual + ">");
        }
    }
    static void assertTrue(boolean condition) {
        if (!condition) throw new AssertionError("expected: <true> but was: <false>");
    }
    static void assertThrows(Class<? extends Throwable> type, Runnable code) {
        try {
            code.run();
        } catch (Throwable t) {
            if (type.isInstance(t)) return;          // correct exception -> pass
            throw new AssertionError("Unexpected exception type: " + t.getClass().getSimpleName());
        }
        throw new AssertionError("Expected " + type.getSimpleName() + " but nothing was thrown");
    }
}

public class Main {
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        Map<String, Runnable> tests = new LinkedHashMap<>();   // keeps insertion order
        tests.put("addTwoPositiveNumbers", () -> Assert.assertEquals(5, calc.add(2, 3)));
        tests.put("addNegativeNumbers", () -> Assert.assertEquals(-7, calc.add(-3, -4)));
        tests.put("fourIsEven", () -> Assert.assertTrue(calc.isEven(4)));
        tests.put("divideByZeroThrows",
                () -> Assert.assertThrows(ArithmeticException.class, () -> calc.divide(10, 0)));
        tests.put("wrongExpectation", () -> Assert.assertEquals(10, calc.add(5, 4)));
        tests.put("noExceptionThrown",
                () -> Assert.assertThrows(ArithmeticException.class, () -> calc.divide(10, 2)));

        int passed = 0, failed = 0;
        for (Map.Entry<String, Runnable> t : tests.entrySet()) {
            try {
                t.getValue().run();
                System.out.println("PASS  " + t.getKey());
                passed++;
            } catch (AssertionError e) {
                System.out.println("FAIL  " + t.getKey() + " -> " + e.getMessage());
                failed++;
            }
        }
        System.out.println("Tests run: " + tests.size() + ", Passed: " + passed + ", Failed: " + failed);
    }
}`;

const pr1 = `// src/main/java/com/example/GradeService.java
package com.example;

public class GradeService {
    public String grade(int marks) {
        if (marks < 0 || marks > 100) throw new IllegalArgumentException("Invalid marks: " + marks);
        if (marks >= 75) return "Distinction";
        if (marks >= 60) return "First Class";
        if (marks >= 35) return "Pass";
        return "Fail";
    }
}

// src/test/java/com/example/GradeServiceTest.java
package com.example;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import static org.junit.jupiter.api.Assertions.*;

class GradeServiceTest {
    private final GradeService service = new GradeService();

    @ParameterizedTest(name = "{0} marks -> {1}")
    @CsvSource({
        "100, Distinction", "75, Distinction",
        "74, First Class",  "60, First Class",
        "59, Pass",         "35, Pass",
        "34, Fail",         "0, Fail"
    })
    void boundaryValues(int marks, String expected) {
        assertEquals(expected, service.grade(marks));
    }

    @ParameterizedTest
    @ValueSource(ints = {-1, 101, 500})
    void invalidMarksThrow(int marks) {
        IllegalArgumentException ex =
            assertThrows(IllegalArgumentException.class, () -> service.grade(marks));
        assertTrue(ex.getMessage().startsWith("Invalid marks"));
    }
}
// Result: 11 tests, all green (8 boundary rows + 3 invalid values)`;

const pr2 = `// src/main/java/com/example/ShoppingCart.java
package com.example;

import java.util.ArrayList;
import java.util.List;

public class ShoppingCart {
    private final List<Integer> prices = new ArrayList<>();
    public void add(int price) {
        if (price <= 0) throw new IllegalArgumentException("Price must be positive");
        prices.add(price);
    }
    public int total() {
        int sum = 0;
        for (int p : prices) sum += p;
        return sum;
    }
    public int count() { return prices.size(); }
    public void clear() { prices.clear(); }
}

// src/test/java/com/example/ShoppingCartTest.java
package com.example;

import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Shopping cart")
class ShoppingCartTest {
    private ShoppingCart cart;

    @BeforeEach
    void setUp() {
        cart = new ShoppingCart();
        cart.add(100);
        cart.add(250);
    }

    @AfterEach
    void tearDown() {
        cart.clear();
    }

    @Test
    @DisplayName("total of 100 + 250 is 350")
    void total() {
        assertEquals(350, cart.total());
    }

    @Test
    @DisplayName("count is 2 after setUp")
    void count() {
        assertEquals(2, cart.count());
    }

    @Test
    @DisplayName("zero price is rejected")
    void zeroPrice() {
        assertThrows(IllegalArgumentException.class, () -> cart.add(0));
        assertEquals(2, cart.count());
    }
}`;

const pr3 = `<!-- pom.xml: fail the build if line coverage drops below 80% -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <id>prepare</id>
            <goals><goal>prepare-agent</goal></goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals><goal>report</goal></goals>
        </execution>
        <execution>
            <id>check</id>
            <phase>verify</phase>
            <goals><goal>check</goal></goals>
            <configuration>
                <rules>
                    <rule>
                        <element>BUNDLE</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>

<!-- Run:  mvn clean verify
     If coverage is 0.65 you will see:
     [WARNING] Rule violated for bundle demo: lines covered ratio is 0.65, but expected minimum is 0.80
     [INFO] BUILD FAILURE -->`;

const pr4 = `import java.util.ArrayList;
import java.util.List;

class TemperatureConverter {
    static int toFahrenheit(int c) { return c * 9 / 5 + 32; }
}

public class Main {
    static int passed = 0, failed = 0;

    static void check(String name, int expected, int actual) {
        if (expected == actual) {
            passed++;
            System.out.println("PASS " + name);
        } else {
            failed++;
            System.out.println("FAIL " + name + " expected " + expected + " but was " + actual);
        }
    }

    public static void main(String[] args) {
        int[][] rows = { {0, 32}, {100, 212}, {-40, -40}, {37, 98} };   // like @CsvSource
        for (int[] r : rows) {
            check("toFahrenheit(" + r[0] + ")", r[1], TemperatureConverter.toFahrenheit(r[0]));
        }
        System.out.println(passed + " passed, " + failed + " failed");
    }
}
/* Output:
PASS toFahrenheit(0)
PASS toFahrenheit(100)
PASS toFahrenheit(-40)
PASS toFahrenheit(37)
4 passed, 0 failed
(37*9 = 333, 333/5 = 66 in int division, 66+32 = 98) */`;

export default {
  id: 'day-06-junit5-deep-dive',
  title: 'JUnit 5 Deep Dive: Assertions, Lifecycle, Parameterized Tests and JaCoCo Coverage',
  module: 'Module 2: Testing, Clean Code & Design Patterns',
  day: 6,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Write professional unit tests with JUnit 5: @Test and all common assertions, the test lifecycle (@BeforeAll, @BeforeEach, @AfterEach, @AfterAll), @DisplayName, parameterized tests with @ValueSource and @CsvSource, exception testing with assertThrows, and measuring code coverage with JaCoCo.',
  objectives: [
    'Set up JUnit 5 in a Maven project and run tests from IntelliJ, Eclipse and mvn test',
    'Use assertEquals, assertTrue, assertAll, assertThrows and other assertions correctly',
    'Explain the JUnit 5 test lifecycle and when each lifecycle annotation runs',
    'Remove duplicate tests with @ParameterizedTest, @ValueSource and @CsvSource',
    'Generate and read a JaCoCo coverage report and enforce a minimum coverage',
  ],
  theory: [
    {
      heading: 'What is Unit Testing and Why JUnit 5?',
      content:
        'A unit test is a small piece of code that checks ONE unit (usually one method of one class) automatically. Analogy: before a car leaves the factory, every part (brakes, lights, horn) is tested separately on a machine. If a part fails, you know exactly which one. In the same way, unit tests tell you exactly which method broke after a change. JUnit is the standard testing framework for Java. JUnit 5 (also called JUnit Jupiter) is the current version used by Spring Boot 3.',
      points: [
        'JUnit 5 = JUnit Platform (launcher that IDEs and Maven use) + JUnit Jupiter (new API: @Test, Assertions) + JUnit Vintage (runs old JUnit 4 tests).',
        'Package names: org.junit.jupiter.api.* (JUnit 4 used org.junit.*). Do not mix them in one class.',
        'Test classes live in src/test/java, same package as the class under test, name ends with Test (CalculatorTest). Surefire runs classes named *Test, Test*, *Tests, *TestCase.',
        'Test classes and methods do NOT need to be public in JUnit 5 (package-private is fine).',
        'Good tests follow AAA: Arrange (create objects), Act (call method), Assert (check result). And FIRST: Fast, Independent, Repeatable, Self-validating, Timely.',
      ],
      tip: 'Interviewers love the question "what is the difference between JUnit 4 and JUnit 5?" Remember: @Before -> @BeforeEach, @BeforeClass -> @BeforeAll, @Ignore -> @Disabled, @RunWith -> @ExtendWith, and expected= in @Test -> assertThrows.',
    },
    {
      heading: 'Assertions: Checking Results',
      content:
        'An assertion compares what you expected with what the code actually produced. If they differ, the test fails with a clear message such as "expected: <5> but was: <6>". All assertions are static methods of org.junit.jupiter.api.Assertions, so we use a static import.',
      syntax: `import static org.junit.jupiter.api.Assertions.*;

assertEquals(expected, actual);              // equals() comparison
assertEquals(expected, actual, "message");   // message shown on failure
assertEquals(0.3, 0.1 + 0.2, 0.0001);        // doubles need a delta
assertNotEquals(a, b);
assertTrue(cond);   assertFalse(cond);
assertNull(obj);    assertNotNull(obj);
assertSame(a, b);                            // same reference (==)
assertArrayEquals(arr1, arr2);               // element by element
assertIterableEquals(list1, list2);
assertAll("group", () -> ..., () -> ...);    // all run, all failures reported
T ex = assertThrows(Type.class, () -> code);
assertDoesNotThrow(() -> code);
assertTimeout(Duration.ofMillis(100), () -> code);
fail("message");                             // fail on purpose`,
      points: [
        'Order matters: expected FIRST, actual SECOND. Swapping them gives confusing failure messages.',
        'Normal assertions stop at the first failure. assertAll executes every lambda and reports all failures together.',
        'Never compare doubles without a delta: 0.1 + 0.2 is 0.30000000000000004.',
        'Many teams also use AssertJ (assertThat(list).hasSize(3).contains("A")) which comes with spring-boot-starter-test.',
      ],
    },
    {
      heading: 'The Test Lifecycle',
      content:
        'JUnit creates a NEW object of the test class for EVERY test method (default "per-method" lifecycle). This keeps tests independent: data changed by one test never leaks into another. Diagram in words: @BeforeAll (once) -> [constructor -> @BeforeEach -> @Test -> @AfterEach] repeated for each test -> @AfterAll (once).',
      points: [
        '@BeforeAll / @AfterAll: run once per class, must be static (costly setup like starting an embedded DB).',
        '@BeforeEach / @AfterEach: run before/after every test (create fresh objects, reset data, close files).',
        '@AfterEach runs even when the test fails, so it is the right place for clean-up.',
        '@TestInstance(TestInstance.Lifecycle.PER_CLASS) makes JUnit reuse one object; then @BeforeAll can be non-static.',
        '@Disabled("reason") skips a test; it is reported as Skipped.',
        'Test order is deterministic but intentionally not obvious. Never depend on order; if you must, use @TestMethodOrder(MethodOrderer.OrderAnnotation.class) with @Order(n).',
      ],
    },
    {
      heading: '@DisplayName, @Nested and @Tag',
      content:
        'Test reports are read by humans. @DisplayName("2 + 3 should be 5") replaces the method name in the report with a readable sentence. @Nested lets you group related tests in inner classes (e.g. "when cart is empty" / "when cart has items"). @Tag("slow") lets you run or skip groups: mvn test -Dgroups=fast.',
      syntax: `@DisplayName("Shopping cart")
class CartTest {
    @Nested
    @DisplayName("when empty")
    class WhenEmpty {
        @Test @DisplayName("total is 0")
        void total() { ... }
    }
}`,
    },
    {
      heading: 'Parameterized Tests',
      content:
        'Copy-pasting the same test with different values is a code smell. A parameterized test is one method that JUnit runs many times with different inputs. It needs the junit-jupiter-params module (already included in the junit-jupiter dependency). Replace @Test with @ParameterizedTest and add a source annotation.',
      syntax: `@ParameterizedTest
@ValueSource(ints = {2, 4, 6})          // one argument per run
void even(int n) { assertTrue(calc.isEven(n)); }

@ParameterizedTest(name = "{0} + {1} = {2}")
@CsvSource({ "1, 2, 3", "10, 20, 30" })   // several arguments per run
void add(int a, int b, int sum) { assertEquals(sum, calc.add(a, b)); }`,
      points: [
        '@ValueSource supports strings, ints, longs, doubles, chars, booleans, classes.',
        '@CsvSource: each string is a row; JUnit converts text to int, double, enum etc. automatically. Use single quotes for values with commas.',
        '@CsvFileSource(resources = "/data.csv", numLinesToSkip = 1) reads rows from a file.',
        '@NullSource, @EmptySource, @NullAndEmptySource test edge cases; @EnumSource runs once per enum constant; @MethodSource uses a static method returning Stream<Arguments>.',
        'name = "{0} has {1} vowels" controls how each run appears in the report; {index} is the run number.',
      ],
    },
    {
      heading: 'Testing Exceptions with assertThrows',
      content:
        'Checking the happy path is not enough; you must also check that bad input is rejected. assertThrows(Type.class, executable) passes only if the lambda throws that type (or a subclass). It RETURNS the exception, so you can also verify the message. If nothing is thrown, the test fails with "Expected ... to be thrown, but nothing was thrown."',
      syntax: `IllegalStateException ex = assertThrows(IllegalStateException.class,
        () -> account.withdraw(5000));
assertEquals("Insufficient balance: 1000", ex.getMessage());`,
      points: [
        'Put ONLY the line that should throw inside the lambda, otherwise an earlier line may throw and give a false pass.',
        'assertThrowsExactly (5.8+) fails if a subclass is thrown.',
        'Older JUnit 4 style @Test(expected = X.class) does not exist in JUnit 5.',
      ],
    },
    {
      heading: 'Code Coverage with JaCoCo',
      content:
        'Code coverage tells you what percentage of your production code was executed by the tests. JaCoCo (Java Code Coverage) is the standard tool. It attaches an agent to the JVM during mvn test, records which lines and branches ran, and writes an HTML report to target/site/jacoco/index.html. Green lines = executed, red = never executed, yellow = only some branches of an if executed.',
      points: [
        'Line coverage: % of lines executed. Branch coverage: % of if/else and switch paths executed (more strict).',
        'Typical company rule: 70-80% coverage, enforced with the jacoco check goal so the CI build fails below the limit.',
        '100% coverage does NOT mean bug-free: a test with no assertions still "covers" code. Coverage shows what is NOT tested.',
        'IntelliJ: right-click test > More Run/Debug > Run with Coverage shows coverage without Maven. Eclipse: install EclEmma (Coverage As > JUnit Test).',
      ],
      tip: 'Usually exclude DTOs, entities with only getters/setters and the main Application class from coverage rules.',
    },
  ],
  examples: [
    {
      title: 'First JUnit 5 Test Class with Common Assertions',
      scenario: 'A Calculator class is tested with assertEquals, assertTrue/False, assertAll, assertNull and assertArrayEquals.',
      steps: MAVEN_STEPS,
      code: pom + '\n\n' + ex1,
      result: ex1Result,
      explanation:
        'Each @Test method is an independent test. @DisplayName on the class and on one method changes the names shown in the IDE. assertAll groups three checks so that, if two of them failed, both failures would be listed. The timing in the Maven output differs on every machine.',
    },
    {
      title: 'Test Lifecycle Order with @BeforeAll, @BeforeEach, @AfterEach and @AfterAll',
      scenario: 'Print messages from every lifecycle method to see exactly when JUnit calls them.',
      steps: [
        'Create LifecycleTest.java in src/test/java/com/example',
        'Run it from the IDE; the println output appears in the Run console (Eclipse: Console view)',
        'Notice the constructor message: a new object is created for every test',
      ],
      code: ex2,
      result: ex2Result,
      explanation:
        '@BeforeAll and @AfterAll run once. For each enabled test JUnit creates a new object, then calls @BeforeEach, the test and @AfterEach. That is why addTwoItems sees size 2, not 3. @TestMethodOrder makes the order fixed so the output is predictable.',
    },
    {
      title: 'Parameterized Tests with @ValueSource and @CsvSource',
      scenario: 'Test a palindrome checker and a vowel counter with many inputs without writing many methods.',
      steps: [
        'junit-jupiter already includes junit-jupiter-params; nothing extra is needed',
        'Create StringUtil in src/main/java and StringUtilTest in src/test/java',
        'Run StringUtilTest and expand the tree in the Run window to see every invocation',
      ],
      code: ex3,
      result: ex3Result,
      explanation:
        'Two methods produce 8 test runs. @ValueSource passes one String per run. @CsvSource passes two columns; JUnit trims spaces and converts "2" to int automatically. The name attribute uses {0} and {1} for the arguments, and IntelliJ adds the [index] prefix.',
    },
    {
      title: 'Exception Testing with assertThrows and Coverage with JaCoCo',
      scenario: 'A BankAccount must reject overdrafts and negative opening balances; we also want a coverage report.',
      steps: [
        'Create BankAccount and BankAccountTest',
        'Add the jacoco-maven-plugin to the <build><plugins> section of pom.xml',
        'Run mvn clean test in the terminal (IntelliJ: Maven tool window > Lifecycle > test)',
        'Open target/site/jacoco/index.html in a browser and click BankAccount to see green/red lines',
      ],
      code: ex4,
      result: ex4Result,
      explanation:
        'assertThrows returns the exception, so the message is checked too. Because the tests cover both the if-true and if-false paths of both checks, JaCoCo reports 100% line and branch coverage (4 branches = 2 ifs x 2 outcomes).',
    },
    {
      title: 'How JUnit Works Inside: A Mini Test Runner in Plain Java',
      scenario: 'Build a tiny test framework with assertEquals, assertTrue and assertThrows to understand what JUnit does for us.',
      steps: [
        'IntelliJ: New Project > Java (no Maven needed) > create Main.java in src',
        'Paste the code and click Run ▶',
        'Change the expected value in "wrongExpectation" to 9 and run again: it becomes PASS',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `PASS  addTwoPositiveNumbers
PASS  addNegativeNumbers
PASS  fourIsEven
PASS  divideByZeroThrows
FAIL  wrongExpectation -> expected: <10> but was: <9>
FAIL  noExceptionThrown -> Expected ArithmeticException but nothing was thrown
Tests run: 6, Passed: 4, Failed: 2`,
      explanation:
        'An assertion is just a method that throws AssertionError when the check fails. The runner calls each test, catches AssertionError and counts passes and failures, exactly like JUnit. In assertThrows the "nothing was thrown" error is raised AFTER the try/catch, so it is not caught by our own catch block. LinkedHashMap keeps the tests in insertion order.',
    },
  ],
  interview: [
    {
      q: 'What is unit testing and why is it important?',
      a: 'Testing the smallest unit of code (a method/class) in isolation, automatically. It catches bugs early, gives confidence to refactor, documents expected behaviour and is required by CI/CD pipelines.',
      level: 'Easy',
    },
    {
      q: 'What are the three parts of JUnit 5?',
      a: 'JUnit Platform (foundation to launch tests from IDE/Maven), JUnit Jupiter (new programming model and extension model: @Test, Assertions, @ExtendWith) and JUnit Vintage (engine to run JUnit 3/4 tests).',
      level: 'Medium',
    },
    {
      q: 'Difference between @BeforeEach and @BeforeAll?',
      a: '@BeforeEach runs before every test method on a fresh instance; @BeforeAll runs only once before all tests of the class and must be static (unless @TestInstance(PER_CLASS) is used).',
      level: 'Easy',
    },
    {
      q: 'Why does JUnit create a new instance of the test class for each test?',
      a: 'To keep tests independent. Instance fields modified by one test cannot affect another, so tests can run in any order and even in parallel.',
      level: 'Medium',
    },
    {
      q: 'How do you test that a method throws an exception in JUnit 5?',
      a: 'Use assertThrows(ExpectedType.class, () -> code). It returns the thrown exception so you can also assert on getMessage(). In JUnit 4 we used @Test(expected=...) or ExpectedException rule.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between assertEquals and assertSame?',
      a: 'assertEquals uses equals() (logical equality); assertSame uses == (same object reference).',
      level: 'Easy',
    },
    {
      q: 'What is assertAll used for?',
      a: 'Grouped assertions: all executables run even if some fail, and all failures are reported together in a MultipleFailuresError. Useful when checking many fields of one object.',
      level: 'Medium',
    },
    {
      q: 'What is a parameterized test? Name some sources.',
      a: 'A test method executed multiple times with different arguments, annotated with @ParameterizedTest. Sources: @ValueSource, @CsvSource, @CsvFileSource, @EnumSource, @MethodSource, @NullSource, @EmptySource, @ArgumentsSource.',
      level: 'Medium',
    },
    {
      q: 'List JUnit 4 to JUnit 5 annotation changes.',
      a: '@Before -> @BeforeEach, @After -> @AfterEach, @BeforeClass -> @BeforeAll, @AfterClass -> @AfterAll, @Ignore -> @Disabled, @Category -> @Tag, @RunWith -> @ExtendWith, @Rule -> extensions. Package org.junit -> org.junit.jupiter.api.',
      level: 'Medium',
    },
    {
      q: 'What is code coverage? Is 100% coverage enough?',
      a: 'The percentage of code (lines, branches, methods) executed by tests, measured with tools like JaCoCo. 100% is not enough because executing code is not the same as verifying it; tests without good assertions or missing edge cases still give high coverage.',
      level: 'Medium',
    },
    {
      q: 'Difference between line coverage and branch coverage?',
      a: 'Line coverage counts executed lines. Branch coverage counts executed decision outcomes (true/false of each if, each switch case). if (a > 0) x++; with only a positive input has 100% line but 50% branch coverage.',
      level: 'Hard',
    },
    {
      q: 'How does Maven run tests and how do you skip them?',
      a: 'The maven-surefire-plugin runs tests in the test phase (mvn test). Run one class: mvn test -Dtest=CalculatorTest. Skip running: -DskipTests; skip compiling and running: -Dmaven.test.skip=true (avoid in real projects).',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Write a GradeService.grade(int marks) method (Distinction >= 75, First Class >= 60, Pass >= 35, else Fail; invalid outside 0-100) and test all boundary values with @CsvSource and invalid values with @ValueSource + assertThrows.',
      hint: 'Boundary value testing: test exactly 75 and 74, 60 and 59, 35 and 34, plus 0, 100, -1 and 101.',
      solution: pr1,
    },
    {
      task: 'Test a ShoppingCart class using @BeforeEach to add two items before each test, @AfterEach to clear it, and @DisplayName for readable names.',
      hint: 'Every test starts with exactly 2 items because a new test instance and a new cart are created each time.',
      solution: pr2,
    },
    {
      task: 'Configure JaCoCo so that mvn verify fails when line coverage is below 80%.',
      hint: 'Add a third execution with the check goal and a LINE COVEREDRATIO limit.',
      solution: pr3,
    },
    {
      task: 'Without any library, write a plain-Java runner that checks a Celsius-to-Fahrenheit converter with a table of inputs (like @CsvSource) and prints PASS/FAIL and a summary.',
      hint: 'Store rows in an int[][] and loop over them; integer division truncates.',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Which annotation method must be static by default in JUnit 5?',
      options: ['@BeforeEach', '@Test', '@BeforeAll', '@AfterEach'],
      answer: 2,
      explanation: '@BeforeAll and @AfterAll run once per class before any instance exists, so they must be static (unless PER_CLASS lifecycle).',
    },
    {
      question: 'In assertEquals(a, b), which argument is the expected value?',
      options: ['a (the first)', 'b (the second)', 'Either, order never matters', 'Neither, it is the message'],
      answer: 0,
      explanation: 'JUnit 5 signature is assertEquals(expected, actual).',
    },
    {
      question: 'What does assertThrows return?',
      options: ['void', 'boolean', 'The class object', 'The thrown exception'],
      answer: 3,
      explanation: 'It returns the exception instance so you can check its message.',
    },
    {
      question: 'A test class has 3 enabled @Test methods. How many times is @BeforeEach called?',
      options: ['1', '3', '4', '0'],
      answer: 1,
      explanation: 'Once before each test method.',
    },
    {
      question: 'Where does JaCoCo write its HTML report by default?',
      options: ['src/test/resources', 'target/surefire-reports', 'target/site/jacoco/index.html', 'pom.xml'],
      answer: 2,
      explanation: 'The report goal writes to target/site/jacoco.',
    },
  ],
};
