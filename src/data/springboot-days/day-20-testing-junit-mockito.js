export default {
  id: 'day-20-testing-junit-mockito',
  title: 'Testing: JUnit 5, Mockito, @SpringBootTest, @WebMvcTest',
  module: 'Module 5: Advanced',
  day: 20,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Write fast unit tests for services with JUnit 5 and Mockito, slice tests for controllers with @WebMvcTest/MockMvc and repositories with @DataJpaTest, and full integration tests with @SpringBootTest.',
  objectives: [
    'Explain the testing pyramid: unit, slice and integration tests',
    'Write JUnit 5 tests with @Test, @BeforeEach, @DisplayName, @ParameterizedTest and assertions',
    'Mock dependencies with Mockito (@Mock, @InjectMocks, when/thenReturn, verify)',
    'Test controllers with @WebMvcTest + MockMvc + @MockitoBean, including security',
    'Run integration tests with @SpringBootTest and repository tests with @DataJpaTest',
  ],
  theory: [
    {
      heading: '1. Why Test? The Testing Pyramid',
      content: 'Tests are a safety net: when you change code tomorrow, tests tell you instantly if you broke something. The pyramid (bottom to top): MANY fast unit tests (one class, no Spring), FEWER slice tests (part of Spring: web layer or JPA layer), FEW slow integration tests (whole application context). Car factory analogy: test each part (unit), then the engine assembly (slice), then a full test drive (integration).',
      points: [
        'spring-boot-starter-test already includes JUnit 5 (Jupiter), Mockito, AssertJ, Hamcrest, JSONPath, MockMvc',
        'Test classes live in src/test/java with the same package as the class under test',
        'Naming: ClassNameTest; methods describe behaviour: shouldThrowWhenBalanceLow()',
        'Run: IntelliJ — green ▶ beside class/method or right-click > Run Tests; STS — right-click > Run As > JUnit Test; Maven — mvn test',
      ],
    },
    {
      heading: '2. JUnit 5 Essentials',
      content: 'JUnit 5 = Jupiter API. Each @Test method creates a fresh instance of the test class. Arrange–Act–Assert (Given–When–Then) keeps tests readable.',
      syntax: `@BeforeEach  void setUp() { ... }          // runs before every test
@Test        void add() { assertEquals(5, calc.add(2, 3)); }
@Test        void divideByZero() {
    assertThrows(ArithmeticException.class, () -> calc.divide(1, 0));
}
@ParameterizedTest
@CsvSource({"2,3,5", "10,-4,6"})
void addMany(int a, int b, int expected) { assertEquals(expected, calc.add(a, b)); }
@DisplayName("Readable name") @Disabled("reason") @Nested @Tag("slow")`,
      points: [
        'assertEquals, assertTrue/False, assertNull/NotNull, assertThrows, assertAll',
        'AssertJ fluent style: assertThat(list).hasSize(2).contains("A")',
      ],
    },
    {
      heading: '3. Mockito — Fake the Dependencies',
      content: 'A unit test for ProductService should not need a real database. Mockito creates a MOCK (a fake object) of ProductRepository. You "stub" what it returns, call the service, then "verify" interactions. Analogy: a flight simulator — the pilot (service) is real, the plane (repository) is fake but behaves as told.',
      syntax: `@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    @Mock ProductRepository repo;            // fake
    @InjectMocks ProductService service;     // real object, mocks injected

    @Test void findsProduct() {
        when(repo.findById(1L)).thenReturn(Optional.of(new Product(1L, "Pen", 10.0)));
        assertEquals("Pen", service.get(1L).name());
        verify(repo).findById(1L);
    }
}`,
      points: [
        'when(...).thenReturn(...) / thenThrow(...)',
        'verify(mock, times(1)).save(any()); verify(mock, never()).deleteById(anyLong())',
        'ArgumentCaptor captures the argument passed to a mock to assert on it',
        'Mockito strict stubs: unused stubbings fail the test (UnnecessaryStubbingException) — keep tests clean',
      ],
    },
    {
      heading: '4. Slice Tests: @WebMvcTest and @DataJpaTest',
      content: '@WebMvcTest(ProductController.class) starts ONLY the MVC layer (controllers, advice, filters, Jackson) — no services or repositories. You provide service mocks with @MockitoBean (Spring Boot 3.4+; earlier versions use @MockBean, now deprecated). MockMvc sends fake HTTP requests without starting Tomcat. @DataJpaTest starts only JPA with an embedded DB, and each test is rolled back.',
      syntax: `mockMvc.perform(get("/api/products/1"))
       .andExpect(status().isOk())
       .andExpect(jsonPath("$.name").value("Pen"));`,
      tip: 'If Spring Security is on the classpath, @WebMvcTest applies security too. Use @WithMockUser(roles = "ADMIN") or import your SecurityConfig and mock JwtService, or add .with(csrf()) for form-based apps.',
    },
    {
      heading: '5. Integration Tests: @SpringBootTest',
      content: '@SpringBootTest loads the WHOLE application context — real services, repositories and DB (H2 or Testcontainers). Use webEnvironment = RANDOM_PORT with TestRestTemplate to make real HTTP calls, or @AutoConfigureMockMvc to use MockMvc against the full context. Slower, so keep fewer of these.',
      points: [
        'Use a test profile: src/test/resources/application-test.properties + @ActiveProfiles("test")',
        'Testcontainers can start a real MySQL in Docker for very realistic tests',
        '@Transactional on a test class rolls back after each test (with MockMvc, not with RANDOM_PORT real HTTP)',
      ],
    },
  ],
  examples: [
    {
      title: 'Example 1: Unit Testing a Service with JUnit 5 + Mockito',
      scenario: 'Test ProductService business rules (not found, duplicate name, discount) without Spring or a database.',
      steps: [
        'Project: Spring Boot 3 product-api (Spring Web, Data JPA, H2, Validation). spring-boot-starter-test is added automatically by Initializr',
        'IntelliJ: open ProductService, press Ctrl+Shift+T (Cmd+Shift+T on Mac) > Create New Test > JUnit5 > tick methods > OK',
        'STS/Eclipse: right-click ProductService > New > JUnit Test Case > New JUnit Jupiter test > Next > select methods > Finish',
        'Write the test class below',
        'Run: click the double green arrow next to the class name (IntelliJ) or right-click > Run As > JUnit Test (STS); see the green bar',
      ],
      code: `// ===== src/main/java/com/shop/product/service/ProductService.java =====
package com.shop.product.service;

import com.shop.product.entity.Product;
import com.shop.product.repository.ProductRepository;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private final ProductRepository repo;
    public ProductService(ProductRepository repo) { this.repo = repo; }

    public Product get(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    public Product create(Product p) {
        if (repo.existsByName(p.getName())) {
            throw new IllegalArgumentException("Product already exists: " + p.getName());
        }
        return repo.save(p);
    }

    public Product applyDiscount(Long id, int percent) {
        if (percent < 0 || percent > 90) throw new IllegalArgumentException("Invalid discount");
        Product p = get(id);
        p.setPrice(p.getPrice() - p.getPrice() * percent / 100.0);
        return repo.save(p);
    }
}

// ===== ProductNotFoundException.java =====
public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(Long id) { super("Product not found: " + id); }
}

// ===== src/test/java/com/shop/product/service/ProductServiceTest.java =====
package com.shop.product.service;

import com.shop.product.entity.Product;
import com.shop.product.repository.ProductRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    ProductRepository repo;

    @InjectMocks
    ProductService service;

    @Test
    @DisplayName("get() returns product when it exists")
    void getExisting() {
        when(repo.findById(1L)).thenReturn(Optional.of(new Product(1L, "Pen", 100.0)));

        Product p = service.get(1L);

        assertEquals("Pen", p.getName());
        verify(repo, times(1)).findById(1L);
    }

    @Test
    void getMissingThrows() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        ProductNotFoundException ex =
            assertThrows(ProductNotFoundException.class, () -> service.get(99L));
        assertEquals("Product not found: 99", ex.getMessage());
    }

    @Test
    void createRejectsDuplicate() {
        when(repo.existsByName("Pen")).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> service.create(new Product(null, "Pen", 10.0)));
        verify(repo, never()).save(any());
    }

    @Test
    void discountIsSaved() {
        when(repo.findById(1L)).thenReturn(Optional.of(new Product(1L, "Bag", 2000.0)));
        when(repo.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        service.applyDiscount(1L, 25);

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(repo).save(captor.capture());
        assertEquals(1500.0, captor.getValue().getPrice());
    }

    @ParameterizedTest
    @ValueSource(ints = {-5, 91, 200})
    void invalidDiscounts(int percent) {
        assertThrows(IllegalArgumentException.class, () -> service.applyDiscount(1L, percent));
        verifyNoInteractions(repo);
    }
}`,
      result: `ProductServiceTest
 ✔ get() returns product when it exists
 ✔ getMissingThrows()
 ✔ createRejectsDuplicate()
 ✔ discountIsSaved()
 ✔ invalidDiscounts(int) [1] percent=-5
 ✔ invalidDiscounts(int) [2] percent=91
 ✔ invalidDiscounts(int) [3] percent=200

Tests run: 7, Failures: 0, Errors: 0, Skipped: 0  (about 0.5 s, no Spring context)`,
      explanation: 'No Spring, no DB — so the tests run in milliseconds. 2000 - 2000*25/100 = 1500.0. ArgumentCaptor proves the service saved the discounted product. verifyNoInteractions(repo) proves invalid percentages are rejected before touching the repository. @ParameterizedTest runs one method with three inputs.',
    },
    {
      title: 'Example 2: Controller Slice Test with @WebMvcTest and MockMvc',
      scenario: 'Test HTTP status codes, JSON body and validation of ProductController while the service is mocked.',
      steps: [
        'Create src/test/java/.../controller/ProductControllerTest.java',
        'Annotate with @WebMvcTest(ProductController.class); inject MockMvc and ObjectMapper',
        'Mock ProductService with @MockitoBean (Spring Boot 3.4+). On Boot 3.0–3.3 use @MockBean from org.springframework.boot.test.mock.mockito',
        'If the project has Spring Security, add spring-security-test dependency and @WithMockUser',
        'Run the test class; in IntelliJ the Run window shows each test with its time',
      ],
      code: `<!-- pom.xml (when the app uses Spring Security) -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>

// ===== controller/ProductController.java (under test) =====
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;
    public ProductController(ProductService service) { this.service = service; }

    @GetMapping("/{id}")
    public Product get(@PathVariable Long id) { return service.get(id); }

    @PostMapping
    public ResponseEntity<Product> create(@Valid @RequestBody Product p) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(p));
    }
}

// GlobalExceptionHandler maps ProductNotFoundException -> 404 {"message": "..."}
// Product has @NotBlank name and @Positive price

// ===== src/test/java/com/shop/product/controller/ProductControllerTest.java =====
package com.shop.product.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.product.entity.Product;
import com.shop.product.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@WithMockUser(roles = "ADMIN")
class ProductControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper mapper;

    @MockitoBean ProductService service;

    @Test
    void getReturns200AndJson() throws Exception {
        when(service.get(1L)).thenReturn(new Product(1L, "Pen", 100.0));

        mockMvc.perform(get("/api/products/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(1))
               .andExpect(jsonPath("$.name").value("Pen"))
               .andExpect(jsonPath("$.price").value(100.0));
    }

    @Test
    void getMissingReturns404() throws Exception {
        when(service.get(9L)).thenThrow(new ProductNotFoundException(9L));

        mockMvc.perform(get("/api/products/9"))
               .andExpect(status().isNotFound())
               .andExpect(jsonPath("$.message").value("Product not found: 9"));
    }

    @Test
    void createReturns201() throws Exception {
        Product input = new Product(null, "Bag", 999.0);
        when(service.create(any(Product.class))).thenReturn(new Product(5L, "Bag", 999.0));

        mockMvc.perform(post("/api/products").with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(input)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value(5));
    }

    @Test
    void invalidBodyReturns400() throws Exception {
        String bad = "{\\"name\\":\\"\\",\\"price\\":-1}";

        mockMvc.perform(post("/api/products").with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(bad))
               .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
}`,
      result: `ProductControllerTest
 ✔ getReturns200AndJson()
 ✔ getMissingReturns404()
 ✔ createReturns201()
 ✔ invalidBodyReturns400()

Tests run: 4, Failures: 0, Errors: 0, Skipped: 0`,
      explanation: '@WebMvcTest loads only the web layer, so it is much faster than @SpringBootTest. MockMvc runs requests through DispatcherServlet, validation, exception handlers and Jackson. Bean validation fails for the empty name and negative price, so the service is never called. @WithMockUser fakes a logged-in user; csrf() adds a valid CSRF token when CSRF is enabled (harmless when disabled). For JWT projects that import a JwtAuthFilter, also add @MockitoBean JwtService.',
    },
    {
      title: 'Example 3: @DataJpaTest and Full @SpringBootTest Integration Test',
      scenario: 'Verify a custom repository query against a real (H2) database and test the complete flow POST → GET over real HTTP.',
      steps: [
        'Make sure H2 is in pom.xml with <scope>test</scope> (or runtime)',
        'Create ProductRepositoryTest with @DataJpaTest',
        'Create ProductApiIntegrationTest with @SpringBootTest(webEnvironment = RANDOM_PORT)',
        'Create src/test/resources/application-test.properties for the H2 database',
        'Run all tests: IntelliJ — right-click src/test/java > Run \'All Tests\'; STS — right-click project > Run As > Maven test; terminal — mvn test',
      ],
      code: `# ===== src/test/resources/application-test.properties =====
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop
spring.flyway.enabled=false

// ===== ProductRepositoryTest.java =====
package com.shop.product.repository;

import com.shop.product.entity.Product;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ProductRepositoryTest {

    @Autowired ProductRepository repo;

    @Test
    void findByPriceBetweenReturnsOnlyMatching() {
        repo.save(new Product(null, "Pen", 10.0));
        repo.save(new Product(null, "Bag", 500.0));
        repo.save(new Product(null, "Phone", 15000.0));

        List<Product> result = repo.findByPriceBetween(5.0, 1000.0);

        assertThat(result).extracting(Product::getName)
                          .containsExactlyInAnyOrder("Pen", "Bag");
        assertThat(repo.existsByName("Phone")).isTrue();
    }
}

// ===== ProductApiIntegrationTest.java =====
package com.shop.product;

import com.shop.product.entity.Product;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ProductApiIntegrationTest {

    @Autowired TestRestTemplate rest;   // already knows the random port

    @Test
    void createThenFetch() {
        ResponseEntity<Product> created = rest.postForEntity(
                "/api/products", new Product(null, "Lamp", 750.0), Product.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        Long id = created.getBody().getId();

        ResponseEntity<Product> fetched = rest.getForEntity("/api/products/" + id, Product.class);
        assertThat(fetched.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(fetched.getBody().getName()).isEqualTo("Lamp");
    }

    @Test
    void unknownIdGives404() {
        ResponseEntity<String> res = rest.getForEntity("/api/products/12345", String.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
// Note: if the API is secured with JWT, first call /api/auth/login with TestRestTemplate,
// then send the token in an HttpEntity with headers.setBearerAuth(token).`,
      result: `ProductRepositoryTest
 ✔ findByPriceBetweenReturnsOnlyMatching()   (rolled back after test)

ProductApiIntegrationTest
 Tomcat started on port 54321 (random, changes every run)
 ✔ createThenFetch()
 ✔ unknownIdGives404()

[INFO] Tests run: 13, Failures: 0, Errors: 0, Skipped: 0   (all test classes of the day)
[INFO] BUILD SUCCESS`,
      explanation: '@DataJpaTest starts only JPA + embedded H2 and rolls back each test, so data does not leak between tests. @SpringBootTest(RANDOM_PORT) starts the real application on a free port; TestRestTemplate makes real HTTP calls through every layer. Integration tests catch wiring and configuration errors that unit tests cannot.',
    },
  ],
  interview: [
    { q: 'What is the difference between @Mock and @MockitoBean/@MockBean?', a: '@Mock (Mockito) creates a mock for plain unit tests without Spring. @MockitoBean (Boot 3.4+, previously @MockBean) creates a mock AND registers/replaces it as a bean in the Spring ApplicationContext used by the test.', level: 'Medium' },
    { q: 'What does @InjectMocks do?', a: 'Creates a real instance of the class under test and injects fields annotated with @Mock/@Spy into it via constructor, setter or field injection.', level: 'Easy' },
    { q: '@WebMvcTest vs @SpringBootTest?', a: '@WebMvcTest loads only web-layer beans (controllers, advice, filters, converters) — fast, dependencies must be mocked. @SpringBootTest loads the full application context — slower, used for integration tests.', level: 'Easy' },
    { q: 'What is MockMvc?', a: 'A Spring test utility that performs requests against the DispatcherServlet without a real HTTP server and lets you assert status, headers and JSON (jsonPath).', level: 'Easy' },
    { q: 'What does @DataJpaTest configure?', a: 'Only JPA components: entities, repositories, an embedded database (replacing the real one by default), and it makes each test @Transactional with rollback.', level: 'Medium' },
    { q: 'What is the difference between a mock and a spy?', a: 'A mock is a full fake: all methods return defaults unless stubbed. A spy wraps a real object: real methods run unless specifically stubbed.', level: 'Medium' },
    { q: 'How do you test that a method was never called?', a: 'verify(mock, never()).method(any()) or verifyNoInteractions(mock).', level: 'Easy' },
    { q: 'How do you test secured endpoints?', a: 'Add spring-security-test and use @WithMockUser(username, roles), or .with(user("x").roles("ADMIN")), .with(jwt()) for resource servers, plus .with(csrf()) when CSRF is enabled. For integration tests, log in and send a real token.', level: 'Hard' },
    { q: 'What is ArgumentCaptor used for?', a: 'To capture the actual argument passed to a mocked method so you can assert its state, e.g. that save() received a product with the discounted price.', level: 'Medium' },
    { q: 'What are JUnit 5 lifecycle annotations?', a: '@BeforeAll/@AfterAll (static, once per class), @BeforeEach/@AfterEach (around every test).', level: 'Easy' },
    { q: 'What is Testcontainers?', a: 'A library that starts real dependencies (MySQL, Kafka, Redis) in Docker containers during tests, giving production-like integration tests. Spring Boot 3.1+ supports @ServiceConnection to wire them automatically.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a Mockito unit test for BankService.transfer() that verifies both accounts are updated and an exception is thrown when balance is low.',
      hint: 'Mock AccountRepository.findById for both ids; assert balances on the returned objects.',
      solution: `@ExtendWith(MockitoExtension.class)
class BankServiceTest {
    @Mock AccountRepository repo;
    @InjectMocks BankService service;

    @Test
    void transferMovesMoney() {
        Account a = new Account("A", 1000), b = new Account("B", 100);
        when(repo.findById(1L)).thenReturn(Optional.of(a));
        when(repo.findById(2L)).thenReturn(Optional.of(b));
        service.transfer(1L, 2L, 300);
        assertEquals(700, a.getBalance());
        assertEquals(400, b.getBalance());
    }

    @Test
    void lowBalanceThrows() {
        when(repo.findById(1L)).thenReturn(Optional.of(new Account("A", 50)));
        assertThrows(InsufficientBalanceException.class, () -> service.transfer(1L, 2L, 300));
    }
}`,
    },
    {
      task: 'Write a @WebMvcTest that checks GET /api/products returns a JSON array of size 2.',
      hint: 'jsonPath("$.length()").value(2) or jsonPath("$", hasSize(2)).',
      solution: `@Test
void listReturnsTwo() throws Exception {
    when(service.all()).thenReturn(List.of(new Product(1L, "A", 1.0), new Product(2L, "B", 2.0)));
    mockMvc.perform(get("/api/products"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.length()").value(2))
           .andExpect(jsonPath("$[1].name").value("B"));
}`,
    },
    {
      task: 'Test that a USER (not ADMIN) gets 403 on DELETE /api/products/1 in a @WebMvcTest.',
      hint: '@WithMockUser(roles = "USER") on the method; import your SecurityConfig with @Import.',
      solution: `@Test
@WithMockUser(roles = "USER")
void userCannotDelete() throws Exception {
    mockMvc.perform(delete("/api/products/1").with(csrf()))
           .andExpect(status().isForbidden());
    verifyNoInteractions(service);
}`,
    },
    {
      task: 'Write a parameterized test for a PasswordValidator.isStrong(String) with valid and invalid passwords.',
      hint: '@CsvSource({"abc,false", "abcd1234,true"}).',
      solution: `@ParameterizedTest
@CsvSource({
    "abc,false",
    "abcdefgh,false",
    "12345678,false",
    "abcd1234,true",
    "Hello2025,true"
})
void strength(String pwd, boolean expected) {
    assertEquals(expected, PasswordValidator.isStrong(pwd));
}`,
    },
  ],
  quiz: [
    { question: 'Which annotation loads only the MVC layer?', options: ['@SpringBootTest', '@DataJpaTest', '@WebMvcTest', '@JsonTest'], answer: 2, explanation: '@WebMvcTest is the web slice.' },
    { question: 'In Spring Boot 3.4+, the recommended way to add a mock bean to the context is:', options: ['@MockitoBean', '@Mock', '@Spy', '@InjectMocks'], answer: 0, explanation: '@MockBean is deprecated in favour of @MockitoBean.' },
    { question: 'verifyNoInteractions(repo) checks that:', options: ['repo is null', 'repo threw an exception', 'repo returned empty', 'no method of repo was called'], answer: 3, explanation: 'It fails if any interaction occurred.' },
    { question: 'Default behaviour of @DataJpaTest after each test:', options: ['Commit', 'Rollback', 'Drop database', 'Nothing'], answer: 1, explanation: 'Each test is transactional and rolled back.' },
    { question: 'Which JUnit 5 annotation runs before EVERY test method?', options: ['@BeforeAll', '@Before', '@BeforeEach', '@Setup'], answer: 2, explanation: '@Before was JUnit 4.' },
  ],
};
