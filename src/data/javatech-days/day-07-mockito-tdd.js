const STEPS = [
  'Open the Maven project from Day 6 (IntelliJ or Eclipse) and add the Mockito dependencies to pom.xml, then reload Maven',
  'Create the production classes in src/main/java/com/example and the test class in src/test/java/com/example',
  'Right-click the test class > Run (IntelliJ) / Run As > JUnit Test (Eclipse), or run mvn test',
];

const pom = `<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>5.10.2</version>
        <scope>test</scope>
    </dependency>
    <!-- Mockito core + the JUnit 5 extension (MockitoExtension) -->
    <dependency>
        <groupId>org.mockito</groupId>
        <artifactId>mockito-core</artifactId>
        <version>5.11.0</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.mockito</groupId>
        <artifactId>mockito-junit-jupiter</artifactId>
        <version>5.11.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>
<!-- Spring Boot projects: spring-boot-starter-test already contains JUnit 5, Mockito and AssertJ -->`;

const ex1 = `// ===== src/main/java/com/example/User.java =====
package com.example;
public record User(Long id, String name, String email) {}

// ===== src/main/java/com/example/UserRepository.java =====
package com.example;
import java.util.Optional;
public interface UserRepository {          // real version would talk to MySQL
    Optional<User> findById(Long id);
    User save(User user);
    boolean existsByEmail(String email);
}

// ===== src/main/java/com/example/EmailService.java =====
package com.example;
public interface EmailService {            // real version would send real mails
    void sendWelcome(String email);
}

// ===== src/main/java/com/example/UserService.java =====
package com.example;

public class UserService {
    private final UserRepository repo;
    private final EmailService emailService;

    public UserService(UserRepository repo, EmailService emailService) {
        this.repo = repo;
        this.emailService = emailService;
    }

    public String getUserName(Long id) {
        return repo.findById(id)
                   .map(User::name)
                   .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    public User register(String name, String email) {
        if (repo.existsByEmail(email)) {
            throw new IllegalStateException("Email already used");
        }
        User saved = repo.save(new User(null, name, email));
        emailService.sendWelcome(saved.email());
        return saved;
    }
}

// ===== src/test/java/com/example/UserServiceTest.java =====
package com.example;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)      // creates @Mock objects before each test
class UserServiceTest {

    @Mock
    UserRepository repo;                 // fake repository, no database

    @Mock
    EmailService emailService;           // fake mailer, no real email

    @InjectMocks
    UserService service;                 // real UserService, mocks passed to its constructor

    @Test
    void returnsNameWhenUserExists() {
        // Arrange (stubbing)
        when(repo.findById(1L)).thenReturn(Optional.of(new User(1L, "Riya", "riya@mail.com")));
        // Act
        String name = service.getUserName(1L);
        // Assert
        assertEquals("Riya", name);
        verify(repo).findById(1L);       // was the repository really called?
    }

    @Test
    void throwsWhenUserMissing() {
        when(repo.findById(99L)).thenReturn(Optional.empty());
        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class, () -> service.getUserName(99L));
        assertEquals("User not found: 99", ex.getMessage());
    }

    @Test
    void registerSavesUserAndSendsWelcomeMail() {
        when(repo.existsByEmail("amit@mail.com")).thenReturn(false);
        when(repo.save(any(User.class))).thenReturn(new User(10L, "Amit", "amit@mail.com"));

        User result = service.register("Amit", "amit@mail.com");

        assertEquals(Long.valueOf(10), result.id());
        verify(emailService, times(1)).sendWelcome("amit@mail.com");
    }

    @Test
    void duplicateEmailIsNeverSaved() {
        when(repo.existsByEmail("x@mail.com")).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> service.register("X", "x@mail.com"));

        verify(repo, never()).save(any());
        verifyNoInteractions(emailService);
    }
}`;

const ex2 = `// ===== src/main/java/com/example/SmsMessage.java =====
package com.example;
public record SmsMessage(String phone, String text) {}

// ===== src/main/java/com/example/SmsGateway.java =====
package com.example;
public interface SmsGateway {
    void send(SmsMessage message);
}

// ===== src/main/java/com/example/OrderNotifier.java =====
package com.example;

public class OrderNotifier {
    private final SmsGateway gateway;

    public OrderNotifier(SmsGateway gateway) {
        this.gateway = gateway;
    }

    public boolean notifyOrder(String phone, String orderId, int amount) {
        String text = "Order " + orderId + " of Rs." + amount + " confirmed";
        try {
            gateway.send(new SmsMessage(phone, text));   // object created INSIDE the method
            return true;
        } catch (RuntimeException e) {
            return false;                                 // SMS failure must not crash the order
        }
    }
}

// ===== src/test/java/com/example/OrderNotifierTest.java =====
package com.example;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderNotifierTest {

    @Mock
    SmsGateway gateway;

    @InjectMocks
    OrderNotifier notifier;

    @Captor
    ArgumentCaptor<SmsMessage> smsCaptor;     // catches the argument passed to send()

    @Test
    void buildsCorrectSmsText() {
        boolean ok = notifier.notifyOrder("9876543210", "A101", 499);

        assertTrue(ok);
        verify(gateway).send(smsCaptor.capture());     // capture what was sent
        SmsMessage sent = smsCaptor.getValue();
        assertEquals("9876543210", sent.phone());
        assertEquals("Order A101 of Rs.499 confirmed", sent.text());
    }

    @Test
    void returnsFalseWhenGatewayFails() {
        // void method -> use doThrow().when(mock).method(...)
        doThrow(new RuntimeException("Network down")).when(gateway).send(any());

        assertFalse(notifier.notifyOrder("9876543210", "A102", 100));
        verify(gateway, times(1)).send(any(SmsMessage.class));
    }
}`;

const ex3 = `// ===== src/test/java/com/example/SpyVsMockTest.java =====
package com.example;

import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class SpyVsMockTest {

    @Test
    @SuppressWarnings("unchecked")
    void mockReturnsDefaults() {
        List<String> mockList = mock(List.class);   // NO real behaviour
        mockList.add("A");                           // does nothing
        assertEquals(0, mockList.size());            // default int = 0
        assertNull(mockList.get(0));                 // default object = null

        when(mockList.size()).thenReturn(5);         // stub
        assertEquals(5, mockList.size());
        verify(mockList).add("A");
    }

    @Test
    void spyCallsRealMethods() {
        List<String> spyList = spy(new ArrayList<>());   // wraps a REAL ArrayList
        spyList.add("A");                                 // really added
        spyList.add("B");
        assertEquals(2, spyList.size());                  // real size
        verify(spyList, times(2)).add(anyString());

        doReturn(100).when(spyList).size();               // stub ONE method of the spy
        assertEquals(100, spyList.size());
        assertEquals("A", spyList.get(0));                // other methods still real
    }

    @Test
    void consecutiveStubbing() {
        @SuppressWarnings("unchecked")
        List<String> list = mock(List.class);
        when(list.get(0)).thenReturn("first").thenReturn("second").thenThrow(new IllegalStateException());
        assertEquals("first", list.get(0));
        assertEquals("second", list.get(0));
        assertThrows(IllegalStateException.class, () -> list.get(0));
    }
}`;

const ex4 = `import java.util.ArrayList;
import java.util.List;

interface PaymentGateway {
    boolean charge(String card, int amount);
}

// STUB: returns a canned answer, remembers nothing
class AlwaysApproveStub implements PaymentGateway {
    public boolean charge(String card, int amount) {
        return true;
    }
}

// MOCK (hand-made): returns a configured answer AND records calls for verification
class RecordingMock implements PaymentGateway {
    final List<String> calls = new ArrayList<>();
    private final boolean answer;

    RecordingMock(boolean answer) {
        this.answer = answer;
    }

    public boolean charge(String card, int amount) {
        calls.add("charge(" + card + ", " + amount + ")");
        return answer;
    }
}

// REAL implementation (imagine it calls the bank)
class RealGateway implements PaymentGateway {
    public boolean charge(String card, int amount) {
        System.out.println("  [real] contacting bank for " + amount);
        return amount <= 5000;
    }
}

// SPY: wraps the REAL object and counts calls
class SpyGateway implements PaymentGateway {
    private final PaymentGateway real;
    int callCount = 0;

    SpyGateway(PaymentGateway real) {
        this.real = real;
    }

    public boolean charge(String card, int amount) {
        callCount++;
        return real.charge(card, amount);
    }
}

class OrderService {
    private final PaymentGateway gateway;

    OrderService(PaymentGateway gateway) {
        this.gateway = gateway;
    }

    String placeOrder(String card, int amount) {
        if (amount <= 0) return "INVALID";
        return gateway.charge(card, amount) ? "CONFIRMED" : "PAYMENT_FAILED";
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("1) Stub");
        OrderService s1 = new OrderService(new AlwaysApproveStub());
        System.out.println("  result = " + s1.placeOrder("4111", 999));

        System.out.println("2) Mock");
        RecordingMock mock = new RecordingMock(false);
        OrderService s2 = new OrderService(mock);
        System.out.println("  result = " + s2.placeOrder("4111", 2500));
        System.out.println("  result = " + s2.placeOrder("4111", -5));
        System.out.println("  verify calls = " + mock.calls);

        System.out.println("3) Spy");
        SpyGateway spy = new SpyGateway(new RealGateway());
        OrderService s3 = new OrderService(spy);
        System.out.println("  result = " + s3.placeOrder("4111", 8000));
        System.out.println("  charge called " + spy.callCount + " time(s)");
    }
}`;

const ex5 = `// TDD kata: StringCalculator.add(String)
// Cycle 1 RED   : test add("") == 0      -> fails (method missing)       GREEN: return 0;
// Cycle 2 RED   : test add("5") == 5     -> fails (returns 0)             GREEN: parse one number
// Cycle 3 RED   : test add("1,2") == 3   -> NumberFormatException         GREEN: split on ","
// Cycle 4 RED   : add("1, 2, 3, 4") == 10 -> fails on " 2"                 GREEN: trim()
// Cycle 5 RED   : add("2,-7") must throw  -> no exception                  GREEN: check n < 0
// REFACTOR      : clean names, remove duplication, rerun all tests

class StringCalculator {
    int add(String numbers) {
        if (numbers.isEmpty()) return 0;
        int sum = 0;
        for (String part : numbers.split(",")) {
            int n = Integer.parseInt(part.trim());
            if (n < 0) {
                throw new IllegalArgumentException("Negatives not allowed: " + n);
            }
            sum += n;
        }
        return sum;
    }
}

public class Main {
    static int green = 0;

    static void expect(String name, int expected, int actual) {
        if (expected != actual) {
            throw new AssertionError(name + ": expected " + expected + " but was " + actual);
        }
        green++;
        System.out.println("GREEN " + name);
    }

    public static void main(String[] args) {
        StringCalculator calc = new StringCalculator();
        expect("emptyStringIsZero", 0, calc.add(""));
        expect("singleNumber", 5, calc.add("5"));
        expect("twoNumbers", 3, calc.add("1,2"));
        expect("manyNumbersWithSpaces", 10, calc.add("1, 2, 3, 4"));
        try {
            calc.add("2,-7");
            System.out.println("RED   negativeThrows");
        } catch (IllegalArgumentException e) {
            green++;
            System.out.println("GREEN negativeThrows (" + e.getMessage() + ")");
        }
        System.out.println(green + "/5 tests green - now REFACTOR safely");
    }
}

/* Same tests in JUnit 5 (src/test/java/StringCalculatorTest.java):
class StringCalculatorTest {
    StringCalculator calc = new StringCalculator();
    @Test void emptyStringIsZero()     { assertEquals(0, calc.add("")); }
    @Test void singleNumber()          { assertEquals(5, calc.add("5")); }
    @Test void twoNumbers()            { assertEquals(3, calc.add("1,2")); }
    @Test void manyNumbersWithSpaces() { assertEquals(10, calc.add("1, 2, 3, 4")); }
    @Test void negativeThrows() {
        var ex = assertThrows(IllegalArgumentException.class, () -> calc.add("2,-7"));
        assertEquals("Negatives not allowed: -7", ex.getMessage());
    }
} */`;

const pr1 = `// src/main/java/com/example/Product.java
package com.example;
public record Product(String code, int price) {}

// src/main/java/com/example/ProductRepository.java
package com.example;
import java.util.Optional;
public interface ProductRepository {
    Optional<Product> findByCode(String code);
}

// src/main/java/com/example/PriceService.java
package com.example;

public class PriceService {
    private final ProductRepository repo;
    public PriceService(ProductRepository repo) { this.repo = repo; }

    // 10% discount when quantity >= 10
    public int totalPrice(String code, int qty) {
        Product p = repo.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("No product " + code));
        int total = p.price() * qty;
        return qty >= 10 ? total - total / 10 : total;
    }
}

// src/test/java/com/example/PriceServiceTest.java
package com.example;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PriceServiceTest {
    @Mock ProductRepository repo;
    @InjectMocks PriceService service;

    @Test
    void noDiscountBelowTen() {
        when(repo.findByCode("PEN")).thenReturn(Optional.of(new Product("PEN", 20)));
        assertEquals(180, service.totalPrice("PEN", 9));
    }

    @Test
    void tenPercentDiscountFromTen() {
        when(repo.findByCode("PEN")).thenReturn(Optional.of(new Product("PEN", 20)));
        assertEquals(180, service.totalPrice("PEN", 10));   // 200 - 20
    }

    @Test
    void unknownProductThrows() {
        when(repo.findByCode("XYZ")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.totalPrice("XYZ", 1));
        verify(repo).findByCode("XYZ");
    }
}`;

const pr2 = `// src/main/java/com/example/AuditLog.java
package com.example;
public interface AuditLog {
    void record(String user, String action);
}

// src/main/java/com/example/AccountService.java
package com.example;

public class AccountService {
    private final AuditLog audit;
    public AccountService(AuditLog audit) { this.audit = audit; }

    public void changePassword(String user, String newPassword) {
        if (newPassword.length() < 8) throw new IllegalArgumentException("Too short");
        // ... update password ...
        audit.record(user.toUpperCase(), "PASSWORD_CHANGED");
    }
}

// src/test/java/com/example/AccountServiceTest.java
package com.example;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {
    @Mock AuditLog audit;
    @InjectMocks AccountService service;
    @Captor ArgumentCaptor<String> userCaptor;
    @Captor ArgumentCaptor<String> actionCaptor;

    @Test
    void auditEntryIsWritten() {
        service.changePassword("riya", "secret123");
        verify(audit).record(userCaptor.capture(), actionCaptor.capture());
        assertEquals("RIYA", userCaptor.getValue());
        assertEquals("PASSWORD_CHANGED", actionCaptor.getValue());
    }

    @Test
    void shortPasswordWritesNoAudit() {
        assertThrows(IllegalArgumentException.class, () -> service.changePassword("riya", "abc"));
        verifyNoInteractions(audit);
    }
}`;

const pr3 = `// STEP 1 (RED): write the test first - LeapYear does not even exist yet
// src/test/java/com/example/LeapYearTest.java
package com.example;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;

class LeapYearTest {
    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource({
        "2024, true",    // divisible by 4
        "2023, false",   // not divisible by 4
        "1900, false",   // divisible by 100 but not 400
        "2000, true"     // divisible by 400
    })
    void leapYearRules(int year, boolean expected) {
        assertEquals(expected, LeapYear.isLeap(year));
    }
}

// STEP 2 (GREEN): simplest code that passes all rows
// src/main/java/com/example/LeapYear.java
package com.example;

public class LeapYear {
    public static boolean isLeap(int year) {
        if (year % 400 == 0) return true;
        if (year % 100 == 0) return false;
        return year % 4 == 0;
    }
}

// STEP 3 (REFACTOR): one readable expression, tests still green
// public static boolean isLeap(int year) {
//     return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
// }`;

const pr4 = `import java.util.HashMap;
import java.util.Map;

interface StudentRepository {
    void save(int roll, String name);
    String findName(int roll);
}

// FAKE: a working but simplified implementation (in-memory instead of MySQL)
class InMemoryStudentRepository implements StudentRepository {
    private final Map<Integer, String> data = new HashMap<>();
    public void save(int roll, String name) { data.put(roll, name); }
    public String findName(int roll) { return data.getOrDefault(roll, "UNKNOWN"); }
}

class StudentService {
    private final StudentRepository repo;
    StudentService(StudentRepository repo) { this.repo = repo; }
    void admit(int roll, String name) { repo.save(roll, name.trim().toUpperCase()); }
    String greet(int roll) { return "Welcome, " + repo.findName(roll); }
}

public class Main {
    public static void main(String[] args) {
        StudentService service = new StudentService(new InMemoryStudentRepository());
        service.admit(1, "  neha ");
        System.out.println(service.greet(1));
        System.out.println(service.greet(2));
        System.out.println(service.greet(1).equals("Welcome, NEHA") ? "TEST PASSED" : "TEST FAILED");
    }
}
/* Output:
Welcome, NEHA
Welcome, UNKNOWN
TEST PASSED */`;

export default {
  id: 'day-07-mockito-tdd',
  title: 'Mockito and Test-Driven Development (TDD)',
  module: 'Module 2: Testing, Clean Code & Design Patterns',
  day: 7,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Test a class in isolation by replacing its dependencies with Mockito mocks: understand mocks vs stubs vs spies, use @Mock and @InjectMocks, stub with when/thenReturn, check calls with verify and ArgumentCaptor, and write code test-first with the TDD red-green-refactor cycle.',
  objectives: [
    'Explain test doubles: dummy, stub, fake, mock and spy',
    'Write Mockito tests with @ExtendWith(MockitoExtension.class), @Mock and @InjectMocks',
    'Stub behaviour with when/thenReturn/thenThrow and doThrow/doReturn',
    'Verify interactions with verify, times, never and ArgumentCaptor',
    'Apply the TDD red-green-refactor cycle to a small problem',
  ],
  theory: [
    {
      heading: 'Why Mock? Testing a Class in Isolation',
      content:
        'A UserService usually depends on a UserRepository (database) and an EmailService (mail server). If the unit test uses the real ones, the test becomes slow, needs MySQL running and may send real emails. Analogy: a film shoot uses a stunt double instead of the hero for dangerous scenes. In testing, a "test double" stands in for the real dependency. Mockito creates these doubles at runtime from an interface or class, with no hand-written code.',
      points: [
        'Unit test = the class under test is REAL, its dependencies are DOUBLES.',
        'Mocks make tests fast (milliseconds), repeatable (no network/DB) and focused (failure points to one class).',
        'You can simulate hard cases easily: DB returns empty, network throws exception.',
        'Mocking works best when dependencies are injected through the constructor (Dependency Injection) and typed as interfaces.',
      ],
    },
    {
      heading: 'Test Doubles: Dummy, Stub, Fake, Mock, Spy',
      content:
        'These words are asked in interviews. Diagram in words: Dummy (passed but never used) < Stub (gives canned answers) < Fake (working simple version) ; Mock (canned answers + records calls for verification) ; Spy (real object + records calls, some methods can be overridden).',
      points: [
        'Dummy: an object passed only to fill a parameter list, e.g. null logger.',
        'Stub: returns fixed answers to calls. Used to check STATE (the result). when(repo.findById(1L)).thenReturn(...).',
        'Fake: has real working logic but takes a shortcut, e.g. an in-memory HashMap repository or H2 database.',
        'Mock: an object that records how it was called, so you can check BEHAVIOUR: verify(emailService).sendWelcome("a@b.com"). In Mockito, a mock can also be stubbed.',
        'Spy: wraps a real object; methods run for real unless you stub them. Mockito: spy(new ArrayList<>()).',
        'A Mockito mock returns defaults when not stubbed: 0, false, null, empty collections, Optional.empty().',
      ],
    },
    {
      heading: 'Mockito Setup and Annotations',
      content:
        'Add mockito-core and mockito-junit-jupiter (Spring Boot already has them in spring-boot-starter-test). Put @ExtendWith(MockitoExtension.class) on the test class; Mockito then creates fresh mocks before every test.',
      syntax: `@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock UserRepository repo;           // mock
    @Spy  ArrayList<String> list;        // spy on a real object
    @InjectMocks UserService service;    // real object; mocks injected
    @Captor ArgumentCaptor<User> captor; // captures arguments
}

// without annotations:
UserRepository repo = Mockito.mock(UserRepository.class);`,
      points: [
        '@InjectMocks tries constructor injection first (biggest constructor), then setter, then field injection.',
        'MockitoExtension uses STRICT STUBS: a stub you never use makes the test fail with UnnecessaryStubbingException. This keeps tests clean.',
        'Mockito 5 can mock final classes and static methods (mockStatic) out of the box, but mocking statics is a design smell; prefer injecting an interface.',
        'Never mock the class under test, and do not mock value objects like String, List or records; just create them.',
      ],
    },
    {
      heading: 'Stubbing: when / thenReturn / thenThrow',
      content:
        'Stubbing tells a mock what to return when a method is called with certain arguments. Argument matchers like any(), anyString(), eq() let one stub cover many inputs.',
      syntax: `when(repo.findById(1L)).thenReturn(Optional.of(user));
when(repo.save(any(User.class))).thenReturn(savedUser);
when(repo.findById(99L)).thenThrow(new RuntimeException("DB down"));
when(list.get(0)).thenReturn("a").thenReturn("b");   // consecutive calls
when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0)); // return the argument

// void methods and spies use the do... family:
doThrow(new RuntimeException()).when(emailService).sendWelcome(anyString());
doNothing().when(emailService).sendWelcome("a@b.com");
doReturn(100).when(spyList).size();`,
      points: [
        'If you use a matcher for one argument, ALL arguments must be matchers: when(svc.find(eq("A"), anyInt())). Mixing raw values and matchers throws InvalidUseOfMatchersException.',
        'when(spy.get(5)) would call the REAL get(5) first and may throw; that is why spies use doReturn().when(spy).',
      ],
    },
    {
      heading: 'Verification: verify and ArgumentCaptor',
      content:
        'Sometimes a method returns nothing (void) and its only job is to call another object, e.g. send an email. We then check the interaction: was it called, how many times, with which arguments? ArgumentCaptor grabs the actual argument object, which is very useful when the object is created inside the method under test.',
      syntax: `verify(emailService).sendWelcome("amit@mail.com");      // exactly once
verify(repo, times(2)).save(any());
verify(repo, never()).delete(any());
verify(repo, atLeastOnce()).findById(anyLong());
verifyNoInteractions(emailService);
verifyNoMoreInteractions(repo);

ArgumentCaptor<SmsMessage> captor = ArgumentCaptor.forClass(SmsMessage.class);
verify(gateway).send(captor.capture());
assertEquals("Hello", captor.getValue().text());   // getAllValues() for many calls`,
      tip: 'Verify what matters to the business (an email was sent, a payment was charged). Over-verifying every call makes tests break on every small refactor.',
    },
    {
      heading: 'Test-Driven Development: Red, Green, Refactor',
      content:
        'TDD means writing the test BEFORE the code. Cycle: RED - write a small failing test for the next tiny requirement (it fails or does not compile). GREEN - write the simplest code that makes it pass, even if it looks silly. REFACTOR - clean up code and tests while all tests stay green. Repeat in cycles of a few minutes. Analogy: a tailor takes measurements first (test), stitches the shirt to fit (code), and then finishes the edges (refactor).',
      points: [
        'Three laws of TDD (Uncle Bob): no production code without a failing test; write only enough test to fail; write only enough code to pass.',
        'Benefits: high coverage automatically, simpler design (testable code = loosely coupled), living documentation, fearless refactoring.',
        'Costs: slower at the beginning, needs discipline; hard for UI and exploratory spikes.',
        'BDD (Behaviour-Driven Development) is TDD with business language: given / when / then. Mockito has BDDMockito.given(...).willReturn(...).',
        'Popular katas for practice: FizzBuzz, String Calculator, Bowling Game, Roman Numerals.',
      ],
    },
  ],
  examples: [
    {
      title: 'Mocking a Repository and Email Service with @Mock and @InjectMocks',
      scenario: 'Test UserService without a database or mail server: stub the repository, verify the email call.',
      steps: STEPS,
      code: pom + '\n\n' + ex1,
      result: `✔ UserServiceTest
   ✔ returnsNameWhenUserExists()
   ✔ throwsWhenUserMissing()
   ✔ registerSavesUserAndSendsWelcomeMail()
   ✔ duplicateEmailIsNeverSaved()
Tests passed: 4 of 4 tests

mvn test:
[INFO] Running com.example.UserServiceTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.912 s -- in com.example.UserServiceTest
[INFO] BUILD SUCCESS`,
      explanation:
        'MockitoExtension creates two mocks and passes them into the UserService constructor because of @InjectMocks. Each test follows Arrange (when...thenReturn), Act (call the service) and Assert (assertEquals + verify). The last test proves that for a duplicate email save() is never called and the email service is never touched. The first Mockito test is slower (about 1 s) because Mockito generates mock classes with ByteBuddy.',
    },
    {
      title: 'ArgumentCaptor and Simulating Failures with doThrow',
      scenario: 'OrderNotifier builds an SmsMessage internally. We capture it to check the text, and we simulate a network failure.',
      steps: STEPS,
      code: ex2,
      result: `✔ OrderNotifierTest
   ✔ buildsCorrectSmsText()
   ✔ returnsFalseWhenGatewayFails()
Tests passed: 2 of 2 tests`,
      explanation:
        'The test never sees the SmsMessage object because it is created inside notifyOrder(). verify(gateway).send(smsCaptor.capture()) grabs it so we can assert on phone and text. send() is void, so failure is stubbed with doThrow(...).when(gateway).send(any()). The notifier catches the exception and returns false.',
    },
    {
      title: 'Mock vs Spy and Consecutive Stubbing',
      scenario: 'Compare a mocked List (no real behaviour) with a spied ArrayList (real behaviour) in one test class.',
      steps: [
        'Create SpyVsMockTest.java in src/test/java/com/example (no production class needed)',
        'Run it and read each assertion as a fact about mocks and spies',
      ],
      code: ex3,
      result: `✔ SpyVsMockTest
   ✔ mockReturnsDefaults()
   ✔ spyCallsRealMethods()
   ✔ consecutiveStubbing()
Tests passed: 3 of 3 tests`,
      explanation:
        'A mock ignores add() and returns defaults (size 0, get null) until stubbed. A spy really stores "A" and "B"; after doReturn(100).when(spyList).size() only size() is faked while get(0) is still real. Consecutive stubbing returns "first", then "second", then throws. This class does not use MockitoExtension, so mocks are created with mock()/spy().',
    },
    {
      title: 'Stub, Mock and Spy Written by Hand (Plain Java)',
      scenario: 'Understand what Mockito generates for you by writing the three kinds of test doubles yourself.',
      steps: [
        'IntelliJ: New Project > Java > Main.java (no Maven needed)',
        'Paste the code and click Run ▶',
        'Map each class to the Mockito call: stub = when().thenReturn(), mock + calls list = verify(), spy = spy()',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `1) Stub
  result = CONFIRMED
2) Mock
  result = PAYMENT_FAILED
  result = INVALID
  verify calls = [charge(4111, 2500)]
3) Spy
  [real] contacting bank for 8000
  result = PAYMENT_FAILED
  charge called 1 time(s)`,
      explanation:
        'The stub always approves. The mock is configured to decline and records only ONE call because the -5 order is rejected before the gateway is used (that is exactly what verify(mock, times(1)) checks). The spy delegates to the real gateway, whose message is printed before "result =" because the argument of println is evaluated first; 8000 > 5000 so it is declined.',
    },
    {
      title: 'TDD Kata: String Calculator, Red-Green-Refactor',
      scenario: 'Build add("1,2,3") test-first in five tiny cycles.',
      steps: [
        'Write ONE test (red), run it and watch it fail',
        'Write the minimum code to pass (green), run all tests',
        'Refactor, run again, then write the next test. The final state is shown below as a plain-Java runner; the JUnit version is in the comment',
        'Click Run ▶',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `GREEN emptyStringIsZero
GREEN singleNumber
GREEN twoNumbers
GREEN manyNumbersWithSpaces
GREEN negativeThrows (Negatives not allowed: -7)
5/5 tests green - now REFACTOR safely`,
      explanation:
        'Each requirement started as a failing test. "1, 2, 3, 4".split(",") gives "1", " 2", " 3", " 4"; trim() removes the spaces so the sum is 10. For "2,-7" the loop adds 2, then finds -7 and throws, so the test passes in the catch block.',
    },
  ],
  interview: [
    {
      q: 'What is Mockito and why do we use it?',
      a: 'A Java mocking framework that creates test doubles at runtime. It lets us unit test a class in isolation by replacing dependencies (DB, REST clients, mail) with mocks whose behaviour we control and whose calls we can verify.',
      level: 'Easy',
    },
    {
      q: 'Difference between a mock, a stub and a spy?',
      a: 'Stub: returns canned data, used for state verification. Mock: records interactions so behaviour can be verified (Mockito mocks can also be stubbed). Spy: wraps a real object, calls real methods unless specific methods are stubbed.',
      level: 'Medium',
    },
    {
      q: 'Difference between @Mock and @InjectMocks?',
      a: '@Mock creates a mock of a dependency. @InjectMocks creates a real instance of the class under test and injects the @Mock/@Spy fields into it (constructor, then setter, then field injection).',
      level: 'Easy',
    },
    {
      q: 'What does an un-stubbed Mockito mock return?',
      a: 'Default values: 0 for numbers, false for boolean, null for objects, empty collections for List/Set/Map, Optional.empty() for Optional, and does nothing for void methods.',
      level: 'Medium',
    },
    {
      q: 'when(...).thenReturn vs doReturn(...).when(...)?',
      a: 'when(mock.m()).thenReturn(x) is type-safe and readable. doReturn is needed for void methods (doThrow/doNothing) and for spies, because when(spy.m()) would execute the real method first.',
      level: 'Hard',
    },
    {
      q: 'What is ArgumentCaptor?',
      a: 'A Mockito class that captures arguments passed to a mocked method during verify, so you can assert on them. Useful when the argument is created inside the method under test. getValue() returns the last value, getAllValues() all of them.',
      level: 'Medium',
    },
    {
      q: 'How do you verify that a method was never called?',
      a: 'verify(mock, never()).method(any()); or verifyNoInteractions(mock) to ensure no method at all was called.',
      level: 'Easy',
    },
    {
      q: 'What is UnnecessaryStubbingException?',
      a: 'Thrown by MockitoExtension (strict stubs) when a test stubs a method that is never called. It signals dead or wrong test code. Fix by removing the stub, or use lenient() if truly needed.',
      level: 'Hard',
    },
    {
      q: 'Explain TDD and the red-green-refactor cycle.',
      a: 'Test-Driven Development: write a failing test first (red), write the minimum code to pass (green), then improve the design without changing behaviour (refactor). Repeat in very small steps.',
      level: 'Easy',
    },
    {
      q: 'What are the advantages and disadvantages of TDD?',
      a: 'Advantages: fewer bugs, high coverage, testable loosely coupled design, safe refactoring, tests as documentation. Disadvantages: slower initially, learning curve, tests must be maintained, hard for UI/unclear requirements.',
      level: 'Medium',
    },
    {
      q: 'Can Mockito mock static or final methods?',
      a: 'Yes, since Mockito 5 the inline mock maker is default, so final classes/methods can be mocked and mockStatic(Utils.class) works inside try-with-resources. It is still better design to wrap statics behind an interface.',
      level: 'Hard',
    },
    {
      q: 'Difference between unit tests with Mockito and @SpringBootTest?',
      a: 'Mockito unit tests run without Spring, in milliseconds, testing one class. @SpringBootTest starts the whole application context (integration test), is slower, and uses @MockBean/@MockitoBean to replace beans.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Write PriceService.totalPrice(code, qty) that loads a Product from a ProductRepository and gives 10% discount for qty >= 10. Test it with a mocked repository, including the "product not found" case.',
      hint: 'Stub findByCode to return Optional.of(...) or Optional.empty().',
      solution: pr1,
    },
    {
      task: 'AccountService.changePassword must write an audit record with the user name in UPPER CASE. Verify the audit arguments using ArgumentCaptor, and verify that no audit is written for a short password.',
      hint: 'Use two @Captor fields (one per argument) and verifyNoInteractions for the failure case.',
      solution: pr2,
    },
    {
      task: 'Using TDD, write a parameterized test for leap years FIRST, then the LeapYear.isLeap code, then refactor.',
      hint: 'Rules: divisible by 400 -> leap; divisible by 100 -> not leap; divisible by 4 -> leap.',
      solution: pr3,
    },
    {
      task: 'In plain Java, write a FAKE in-memory StudentRepository (HashMap) and use it to test a StudentService that stores names in upper case.',
      hint: 'A fake has real logic but no database; getOrDefault returns "UNKNOWN" for missing rolls.',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Which annotation creates the real object under test and injects mocks into it?',
      options: ['@Mock', '@Spy', '@Captor', '@InjectMocks'],
      answer: 3,
      explanation: '@InjectMocks builds the class under test using the @Mock fields.',
    },
    {
      question: 'An un-stubbed mock method returning int will return...',
      options: ['0', '-1', 'null', 'It throws an exception'],
      answer: 0,
      explanation: 'Mocks return default values; for int that is 0.',
    },
    {
      question: 'How do you stub a void method to throw an exception?',
      options: [
        'when(mock.send()).thenThrow(ex)',
        'doThrow(ex).when(mock).send(any())',
        'verify(mock).send().thenThrow(ex)',
        'mock.send().throws(ex)',
      ],
      answer: 1,
      explanation: 'when() needs a return value, so void methods use the do... family.',
    },
    {
      question: 'In TDD, what is the FIRST step?',
      options: ['Write production code', 'Refactor', 'Write a failing test', 'Measure coverage'],
      answer: 2,
      explanation: 'Red: start with a failing test.',
    },
    {
      question: 'Which object calls REAL methods unless you stub them?',
      options: ['Mock', 'Stub', 'Dummy', 'Spy'],
      answer: 3,
      explanation: 'A spy wraps a real object.',
    },
  ],
};
