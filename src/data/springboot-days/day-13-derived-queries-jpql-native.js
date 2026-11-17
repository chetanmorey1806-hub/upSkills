export default {
  id: 'day-13-derived-queries-jpql-native',
  title: 'Derived Query Methods, @Query, JPQL and Native Queries',
  module: 'Module 3: Data Access',
  day: 13,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Learn how Spring Data JPA writes SQL for you from method names (derived queries), and how to write your own JPQL and native SQL with @Query when method names are not enough.',
  objectives: [
    'Write derived query methods like findByCategoryAndPriceLessThan without writing SQL',
    'Use @Query with JPQL and named parameters (@Param)',
    'Write native SQL queries with nativeQuery = true',
    'Use @Modifying + @Transactional for UPDATE and DELETE queries',
    'Return projections (only selected columns) using interface projections',
  ],
  theory: [
    {
      heading: '1. What is a Derived Query Method?',
      content: 'In Spring Data JPA you only declare a method in a repository interface. Spring reads the method NAME, splits it into parts (subject + predicate) and generates the query at startup. Analogy: you tell a waiter "bring me tea with sugar and without milk" — you never go into the kitchen. The method name is your order; Spring Data is the waiter; Hibernate is the kitchen that creates SQL.',
      syntax: `// subject   By  property  [Keyword]  And/Or  property [Keyword]
List<Product> findByCategory(String category);
List<Product> findByCategoryAndPriceLessThan(String category, double price);
Optional<Product> findByName(String name);
long countByCategory(String category);
boolean existsByName(String name);
void deleteByCategory(String category);`,
      points: [
        'Subjects: find...By, read...By, get...By, query...By, count...By, exists...By, delete...By',
        'Property names must match the ENTITY FIELD names (not the column names): findByUnitPrice needs a field unitPrice',
        'Spring validates every method name at startup — a typo like findByCatgory fails the application start with "No property catgory found"',
        'Parameters are matched by position: first parameter goes to first condition',
      ],
    },
    {
      heading: '2. Most Used Keywords',
      content: 'Keywords are added after the property name. Each keyword becomes a SQL operator. Think of them as LEGO pieces you snap onto a property.',
      points: [
        'And / Or → findByNameAndCategory → where name = ? and category = ?',
        'Between → findByPriceBetween(min, max) → where price between ? and ?',
        'LessThan, LessThanEqual, GreaterThan, GreaterThanEqual → <, <=, >, >=',
        'Like, Containing, StartingWith, EndingWith → like ? ; Containing adds % on both sides automatically',
        'IgnoreCase → findByNameIgnoreCase → where upper(name) = upper(?)',
        'IsNull, IsNotNull, True, False → findByActiveTrue() → where active = true',
        'In, NotIn → findByCategoryIn(List<String> cats) → where category in (...)',
        'OrderBy → findByCategoryOrderByPriceDesc → order by price desc',
        'Top / First → findTop3ByOrderByPriceDesc → limit 3',
        'Distinct → findDistinctByCategory',
      ],
      tip: 'If a method name becomes longer than one line (e.g. findByCategoryAndPriceGreaterThanAndStockLessThanAndActiveTrueOrderByNameAsc), switch to @Query. Long names are hard to read and maintain.',
    },
    {
      heading: '3. @Query with JPQL',
      content: 'JPQL (Jakarta Persistence Query Language) looks like SQL but works on ENTITY names and FIELD names, not table and column names. It is database independent — the same JPQL runs on MySQL, PostgreSQL and H2. Use named parameters (:name) with @Param, or positional parameters (?1, ?2).',
      syntax: `@Query("SELECT p FROM Product p WHERE p.category = :cat AND p.price <= :max")
List<Product> searchCheap(@Param("cat") String category, @Param("max") double max);

@Query("SELECT p FROM Product p WHERE p.price > ?1 ORDER BY p.price DESC")
List<Product> costlierThan(double price);`,
      points: [
        'Product = entity class name (case-sensitive), p = alias, p.price = field',
        'Errors in JPQL are detected at startup (query is parsed when the app starts)',
        'Since Spring Boot 3 the -parameters compiler flag is on by default, but writing @Param is still the safest habit',
      ],
    },
    {
      heading: '4. Native Queries',
      content: 'Sometimes you need a database-specific feature (e.g. MySQL functions, complex joins, window functions). Then set nativeQuery = true and write real SQL with TABLE and COLUMN names. The trade-off: native SQL is tied to one database and is not checked at startup.',
      syntax: `@Query(value = "SELECT * FROM products WHERE stock < :limit", nativeQuery = true)
List<Product> lowStock(@Param("limit") int limit);`,
      tip: 'Common mistake: writing table names in JPQL ("FROM products") or entity names in native SQL ("FROM Product"). JPQL = entities, native = tables.',
    },
    {
      heading: '5. @Modifying Queries (UPDATE / DELETE)',
      content: '@Query is for SELECT by default. For UPDATE or DELETE you must add @Modifying and run inside a transaction (@Transactional). The method returns int = number of rows affected. clearAutomatically = true clears the persistence context so you do not read stale entities afterwards.',
      syntax: `@Modifying(clearAutomatically = true)
@Transactional
@Query("UPDATE Product p SET p.price = p.price * :factor WHERE p.category = :cat")
int increasePrice(@Param("cat") String category, @Param("factor") double factor);`,
      points: [
        'Missing @Modifying → InvalidDataAccessApiUsageException / "Not supported for DML operations"',
        'Missing @Transactional → TransactionRequiredException',
      ],
    },
    {
      heading: '6. Projections — Fetch Only What You Need',
      content: 'Loading full entities when you need only two columns wastes memory. An interface projection declares getters for only the fields you want. Spring creates a proxy that implements the interface. Analogy: instead of carrying the whole cupboard, you carry just the two shirts you need.',
      syntax: `public interface ProductSummary {
    String getName();
    Double getPrice();
}
List<ProductSummary> findByCategory(String category); // derived + projection`,
    },
  ],
  examples: [
    {
      title: 'Example 1: Product Catalogue with Derived Query Methods',
      scenario: 'An online shop needs to search products by category, price range and keyword without writing any SQL.',
      steps: [
        'IntelliJ: File > New > Project > Spring Boot (Initializr) > Maven, Java 17, Boot 3.x > add Spring Web, Spring Data JPA, MySQL Driver (or H2 Database), Lombok (optional) > Create',
        'Eclipse/STS: File > New > Spring Starter Project > name catalog-api > Next > select Spring Web, Spring Data JPA, H2 Database, MySQL Driver > Finish',
        'Create packages com.shop.catalog.entity, repository, controller (right-click package > New > Package)',
        'Create Product.java, ProductRepository.java, ProductController.java with the code below',
        'Add data.sql in src/main/resources for sample rows and set spring.jpa.defer-datasource-initialization=true',
        'Run CatalogApiApplication (IntelliJ: green ▶ next to main; STS: right-click project > Run As > Spring Boot App)',
        'Open http://localhost:8080/api/products/search?keyword=phone in the browser or Postman',
      ],
      code: `// ===== pom.xml (dependencies part) =====
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>

// ===== src/main/resources/application.properties =====
spring.datasource.url=jdbc:h2:mem:catalogdb
spring.jpa.hibernate.ddl-auto=create
spring.jpa.show-sql=true
spring.jpa.defer-datasource-initialization=true
spring.h2.console.enabled=true

// ===== src/main/resources/data.sql =====
INSERT INTO products(name, category, price, stock, active) VALUES
('iPhone 15', 'MOBILE', 79999, 10, true),
('Galaxy S24', 'MOBILE', 74999, 4, true),
('Redmi Phone 13', 'MOBILE', 12999, 50, true),
('Dell Inspiron', 'LAPTOP', 55999, 3, true),
('HP Pavilion', 'LAPTOP', 62999, 0, false);

// ===== entity/Product.java =====
package com.shop.catalog.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String category;
    private Double price;
    private Integer stock;
    private Boolean active;

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}

// ===== repository/ProductRepository.java =====
package com.shop.catalog.repository;

import com.shop.catalog.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
    List<Product> findByPriceBetween(double min, double max);
    List<Product> findByNameContainingIgnoreCase(String keyword);
    List<Product> findByCategoryOrderByPriceDesc(String category);
    List<Product> findTop2ByOrderByPriceDesc();
    List<Product> findByActiveTrueAndStockGreaterThan(int stock);
    Optional<Product> findByName(String name);
    long countByCategory(String category);
    boolean existsByName(String name);
}

// ===== controller/ProductController.java =====
package com.shop.catalog.controller;

import com.shop.catalog.entity.Product;
import com.shop.catalog.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository repo;

    public ProductController(ProductRepository repo) { this.repo = repo; }

    @GetMapping("/category/{cat}")
    public List<Product> byCategory(@PathVariable String cat) {
        return repo.findByCategoryOrderByPriceDesc(cat);
    }

    @GetMapping("/price")
    public List<Product> byPrice(@RequestParam double min, @RequestParam double max) {
        return repo.findByPriceBetween(min, max);
    }

    @GetMapping("/search")
    public List<Product> search(@RequestParam String keyword) {
        return repo.findByNameContainingIgnoreCase(keyword);
    }

    @GetMapping("/top")
    public List<Product> top() { return repo.findTop2ByOrderByPriceDesc(); }

    @GetMapping("/in-stock")
    public List<Product> inStock() { return repo.findByActiveTrueAndStockGreaterThan(0); }

    @GetMapping("/count/{cat}")
    public Map<String, Long> count(@PathVariable String cat) {
        return Map.of("count", repo.countByCategory(cat));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Product> byName(@PathVariable String name) {
        return repo.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}`,
      result: `GET /api/products/search?keyword=phone
[{"id":1,"name":"iPhone 15","category":"MOBILE","price":79999.0,"stock":10,"active":true},
 {"id":3,"name":"Redmi Phone 13","category":"MOBILE","price":12999.0,"stock":50,"active":true}]

GET /api/products/count/MOBILE  ->  {"count":3}
GET /api/products/top           ->  iPhone 15 (79999), Galaxy S24 (74999)

Console (show-sql):
Hibernate: select p1_0.id,p1_0.active,p1_0.category,p1_0.name,p1_0.price,p1_0.stock from products p1_0 where upper(p1_0.name) like upper(?) escape '\\\\'`,
      explanation: 'We never wrote SQL. findByNameContainingIgnoreCase became "where upper(name) like upper(%phone%)". findTop2ByOrderByPriceDesc became "order by price desc fetch first 2 rows". Optional return type lets the controller send 404 cleanly when the product is missing.',
    },
    {
      title: 'Example 2: @Query with JPQL and Native SQL',
      scenario: 'The manager wants a report of cheap products in a category and a list of low-stock items using a MySQL-specific query.',
      steps: [
        'Open ProductRepository.java and add the methods below',
        'Create an interface projection ProductSummary in package com.shop.catalog.dto',
        'Add a ReportController with the endpoints',
        'IntelliJ Ultimate highlights JPQL syntax inside @Query (JPA Buddy / Jakarta EE plugin) — use Ctrl+Click on entity names to navigate',
        'In STS, errors in JPQL appear in the Console at startup — read the "Validation failed for query" message',
        'Run and call /api/reports/cheap?cat=MOBILE&max=80000 and /api/reports/low-stock?limit=5',
      ],
      code: `// ===== dto/ProductSummary.java (interface projection) =====
package com.shop.catalog.dto;

public interface ProductSummary {
    String getName();
    Double getPrice();
}

// ===== add to ProductRepository.java =====
import com.shop.catalog.dto.ProductSummary;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

    // JPQL: entity + field names
    @Query("SELECT p FROM Product p WHERE p.category = :cat AND p.price <= :max ORDER BY p.price")
    List<Product> findCheap(@Param("cat") String category, @Param("max") double max);

    // JPQL with aggregate, returns Object[] rows
    @Query("SELECT p.category, COUNT(p), AVG(p.price) FROM Product p GROUP BY p.category")
    List<Object[]> categoryStats();

    // Native SQL: table + column names
    @Query(value = "SELECT * FROM products WHERE stock < :limit AND active = true",
           nativeQuery = true)
    List<Product> lowStock(@Param("limit") int limit);

    // Projection: only name and price are selected
    List<ProductSummary> findByCategoryOrderByName(String category);

// ===== controller/ReportController.java =====
package com.shop.catalog.controller;

import com.shop.catalog.dto.ProductSummary;
import com.shop.catalog.entity.Product;
import com.shop.catalog.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ProductRepository repo;
    public ReportController(ProductRepository repo) { this.repo = repo; }

    @GetMapping("/cheap")
    public List<Product> cheap(@RequestParam String cat, @RequestParam double max) {
        return repo.findCheap(cat, max);
    }

    @GetMapping("/stats")
    public List<Map<String, Object>> stats() {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object[] row : repo.categoryStats()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("category", row[0]);
            m.put("count", row[1]);
            m.put("avgPrice", row[2]);
            out.add(m);
        }
        return out;
    }

    @GetMapping("/low-stock")
    public List<Product> lowStock(@RequestParam int limit) { return repo.lowStock(limit); }

    @GetMapping("/summary/{cat}")
    public List<ProductSummary> summary(@PathVariable String cat) {
        return repo.findByCategoryOrderByName(cat);
    }
}`,
      result: `GET /api/reports/cheap?cat=MOBILE&max=80000
-> Redmi Phone 13 (12999), Galaxy S24 (74999), iPhone 15 (79999)

GET /api/reports/stats
-> [{"category":"MOBILE","count":3,"avgPrice":55999.0},{"category":"LAPTOP","count":2,"avgPrice":59499.0}]
   (group order depends on the database)

GET /api/reports/low-stock?limit=5
-> Galaxy S24 (stock 4), Dell Inspiron (stock 3)

GET /api/reports/summary/LAPTOP
-> [{"name":"Dell Inspiron","price":55999.0},{"name":"HP Pavilion","price":62999.0}]`,
      explanation: 'findCheap uses JPQL so it works on any database. lowStock uses native SQL with the real table name "products". HP Pavilion is excluded from low-stock because active = false. The projection query selects only name and price columns, so the JSON contains only those two fields.',
    },
    {
      title: 'Example 3: Bulk Update and Delete with @Modifying',
      scenario: 'During a sale the admin raises or lowers prices for a whole category in one SQL statement instead of loading every product.',
      steps: [
        'Add the @Modifying methods to ProductRepository',
        'Create ProductService with @Transactional methods (better place for transactions than the repository)',
        'Add PUT /api/admin/price and DELETE /api/admin/inactive endpoints',
        'IntelliJ: open the HTTP Client (Tools > HTTP Client > Create Request in HTTP Client) and send PUT http://localhost:8080/api/admin/price?cat=LAPTOP&factor=0.9',
        'Eclipse/STS: use Postman — choose PUT, paste the URL, Send',
        'Watch the console: only ONE update statement is executed',
      ],
      code: `// ===== add to ProductRepository.java =====
import org.springframework.data.jpa.repository.Modifying;

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Product p SET p.price = p.price * :factor WHERE p.category = :cat")
    int changePrice(@Param("cat") String category, @Param("factor") double factor);

    @Modifying
    @Query("DELETE FROM Product p WHERE p.active = false")
    int deleteInactive();

// ===== service/ProductService.java =====
package com.shop.catalog.service;

import com.shop.catalog.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {
    private final ProductRepository repo;
    public ProductService(ProductRepository repo) { this.repo = repo; }

    @Transactional
    public int applyDiscount(String category, double factor) {
        if (factor <= 0 || factor > 2) {
            throw new IllegalArgumentException("factor must be between 0 and 2");
        }
        return repo.changePrice(category, factor);
    }

    @Transactional
    public int removeInactive() { return repo.deleteInactive(); }
}

// ===== controller/AdminController.java =====
package com.shop.catalog.controller;

import com.shop.catalog.service.ProductService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final ProductService service;
    public AdminController(ProductService service) { this.service = service; }

    @PutMapping("/price")
    public Map<String, Integer> price(@RequestParam String cat, @RequestParam double factor) {
        return Map.of("updatedRows", service.applyDiscount(cat, factor));
    }

    @DeleteMapping("/inactive")
    public Map<String, Integer> inactive() {
        return Map.of("deletedRows", service.removeInactive());
    }
}`,
      result: `PUT /api/admin/price?cat=LAPTOP&factor=0.9
-> {"updatedRows":2}
Hibernate: update products set price=(price*?) where category=?

DELETE /api/admin/inactive
-> {"deletedRows":1}
Hibernate: delete from products where active=false`,
      explanation: 'A bulk JPQL update runs a single SQL statement directly in the database. It bypasses entity lifecycle callbacks and the first-level cache, which is why clearAutomatically = true is useful. Without @Modifying Spring would try to run the UPDATE as a SELECT and fail.',
    },
  ],
  interview: [
    { q: 'What is a derived query method in Spring Data JPA?', a: 'A repository method whose query is generated automatically from its name, e.g. findByEmail(String email) becomes "select ... where email = ?". Spring parses the name at startup and fails fast if a property does not exist.', level: 'Easy' },
    { q: 'What is the difference between JPQL and native SQL?', a: 'JPQL works with entity class names and field names and is database independent; Hibernate translates it to SQL. Native SQL uses table and column names, can use DB-specific features, but is tied to one database and is not validated at startup.', level: 'Easy' },
    { q: 'Why do we need @Modifying?', a: 'By default @Query is executed as a SELECT. @Modifying tells Spring Data the query is INSERT/UPDATE/DELETE so it calls executeUpdate() and returns the affected row count. It must run inside a transaction.', level: 'Medium' },
    { q: 'What does clearAutomatically = true do?', a: 'After the bulk update it clears the persistence context (EntityManager.clear()) so that entities loaded earlier in the same transaction are not stale.', level: 'Hard' },
    { q: 'How do you return only some columns from a query?', a: 'Use projections: an interface projection with getters (getName(), getPrice()), a class/record DTO projection with "SELECT new com.x.Dto(p.name, p.price) FROM Product p", or Object[] for aggregate rows.', level: 'Medium' },
    { q: 'Difference between findByNameLike and findByNameContaining?', a: 'Like requires you to pass wildcards yourself ("%abc%"). Containing adds % on both sides automatically. StartingWith adds % at the end, EndingWith at the start.', level: 'Medium' },
    { q: 'What happens if you write findByCatgory (typo)?', a: 'The application fails at startup with PropertyReferenceException: No property \'catgory\' found for type \'Product\'. Derived queries are validated early.', level: 'Easy' },
    { q: 'Named vs positional parameters?', a: 'Named parameters use :name with @Param("name") and are readable and order-independent. Positional parameters use ?1, ?2 and depend on argument order. Named parameters are preferred.', level: 'Easy' },
    { q: 'What do findFirstBy and findTop5By do?', a: 'They limit the results: findFirstByOrderByPriceDesc returns one record, findTop5By... returns at most five. Hibernate adds limit/fetch first n rows to the SQL.', level: 'Easy' },
    { q: 'Can a derived query method return Optional, List, Stream or a single entity?', a: 'Yes. Optional<T> or T for single results (throws IncorrectResultSizeDataAccessException if more than one row), List<T> for many, Stream<T> inside a transaction for large data, plus Page<T>/Slice<T> with Pageable.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create an Employee entity (id, name, department, salary, city) and write derived queries: employees of a department, salary greater than X, name starting with a letter, and count by city.',
      hint: 'Use findByDepartment, findBySalaryGreaterThan, findByNameStartingWith, countByCity.',
      solution: `public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByDepartment(String department);
    List<Employee> findBySalaryGreaterThan(double salary);
    List<Employee> findByNameStartingWith(String prefix);
    long countByCity(String city);
    List<Employee> findByDepartmentAndCityOrderBySalaryDesc(String dept, String city);
}`,
    },
    {
      task: 'Write a JPQL query that returns the highest salary per department as a DTO record DeptMax(String department, Double maxSalary).',
      hint: 'Use the constructor expression SELECT new full.package.DeptMax(...).',
      solution: `public record DeptMax(String department, Double maxSalary) {}

@Query("SELECT new com.company.hr.dto.DeptMax(e.department, MAX(e.salary)) " +
       "FROM Employee e GROUP BY e.department")
List<DeptMax> maxSalaryByDept();`,
    },
    {
      task: 'Write a native MySQL query to fetch employees who joined in the last 30 days (joined_on column).',
      hint: 'Use nativeQuery = true and the MySQL function DATE_SUB(CURDATE(), INTERVAL 30 DAY).',
      solution: `@Query(value = "SELECT * FROM employees WHERE joined_on >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)",
       nativeQuery = true)
List<Employee> recentJoiners();`,
    },
    {
      task: 'Write a bulk update that gives a percentage hike to one department and expose it via PUT /api/hr/hike?dept=IT&percent=10.',
      hint: '@Modifying + @Transactional in a service; factor = 1 + percent/100.',
      solution: `// Repository
@Modifying(clearAutomatically = true)
@Query("UPDATE Employee e SET e.salary = e.salary * :factor WHERE e.department = :dept")
int hike(@Param("dept") String dept, @Param("factor") double factor);

// Service
@Transactional
public int hike(String dept, double percent) {
    return repo.hike(dept, 1 + percent / 100.0);
}

// Controller
@PutMapping("/api/hr/hike")
public Map<String, Integer> hike(@RequestParam String dept, @RequestParam double percent) {
    return Map.of("updated", service.hike(dept, percent));
}`,
    },
  ],
  quiz: [
    { question: 'Which method name generates "where price between ? and ?"', options: ['findByPriceRange', 'findByPriceBetween', 'findPriceBetween', 'findByPriceIn'], answer: 1, explanation: 'Between is the keyword; it needs two parameters.' },
    { question: 'In JPQL, which name do you use after FROM?', options: ['Entity class name', 'Table name', 'Schema name', 'Repository name'], answer: 0, explanation: 'JPQL works on entities: FROM Product p.' },
    { question: 'What must you add to an UPDATE @Query?', options: ['@Lock', '@QueryHints', '@Param only', '@Modifying and a transaction'], answer: 3, explanation: 'DML queries need @Modifying and must run inside @Transactional.' },
    { question: 'Which keyword adds % on both sides automatically?', options: ['Like', 'Containing', 'In', 'Equals'], answer: 1, explanation: 'Containing wraps the value with %value%.' },
    { question: 'nativeQuery = true means:', options: ['The query is cached', 'The query is JPQL', 'The query is plain SQL with table/column names', 'The query runs asynchronously'], answer: 2, explanation: 'Native queries are sent to the DB as written SQL.' },
  ],
};
