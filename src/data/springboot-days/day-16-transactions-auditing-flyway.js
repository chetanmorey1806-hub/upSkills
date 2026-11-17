export default {
  id: 'day-16-transactions-auditing-flyway',
  title: 'Transactions, Auditing (@CreatedDate) and Database Migrations with Flyway',
  module: 'Module 3: Data Access',
  day: 16,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Make multi-step database work all-or-nothing with @Transactional, fill created/updated columns automatically with Spring Data JPA Auditing, and version your database schema with Flyway migration scripts.',
  objectives: [
    'Explain ACID and use @Transactional correctly in the service layer',
    'Know rollback rules (unchecked vs checked exceptions), propagation and readOnly',
    'Avoid the self-invocation proxy trap',
    'Enable JPA auditing with @CreatedDate, @LastModifiedDate, @CreatedBy',
    'Create and run Flyway migrations (V1__, V2__) instead of ddl-auto',
  ],
  theory: [
    {
      heading: '1. What is a Transaction? (ACID)',
      content: 'A transaction is a group of database operations that succeed together or fail together. Bank analogy: transferring ₹500 = debit A + credit B. If the credit fails after the debit, the money vanishes — unless both are in one transaction, which rolls back the debit.',
      points: [
        'Atomicity – all or nothing',
        'Consistency – data moves from one valid state to another',
        'Isolation – concurrent transactions do not see each other\'s half-done work',
        'Durability – once committed, data survives crashes',
      ],
    },
    {
      heading: '2. @Transactional in Spring Boot',
      content: 'Spring Boot auto-configures a JpaTransactionManager. Put @Transactional on public SERVICE methods. Spring wraps the bean in a proxy: begin transaction → call your method → commit, or rollback on exception. Diagram in words: Controller → [Proxy: BEGIN] → Service method → [Proxy: COMMIT/ROLLBACK] → back to Controller.',
      syntax: `@Service
public class BankService {
    @Transactional
    public void transfer(Long from, Long to, double amount) { ... }

    @Transactional(readOnly = true)
    public Account find(Long id) { ... }
}`,
      points: [
        'By default rollback happens for RuntimeException and Error, NOT for checked exceptions',
        'Use rollbackFor = Exception.class to roll back on checked exceptions too',
        'readOnly = true lets Hibernate skip dirty checking — faster for queries',
        'Inside a transaction, changes to managed entities are saved automatically (dirty checking) — no save() needed',
      ],
    },
    {
      heading: '3. Propagation, Isolation and Common Traps',
      content: 'Propagation decides what happens when a transactional method calls another transactional method. REQUIRED (default) joins the existing transaction; REQUIRES_NEW suspends it and starts a fresh one (useful for audit logs that must be saved even if the main work fails). Isolation (READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE) controls what concurrent transactions can see.',
      points: [
        'Self-invocation: calling this.otherMethod() inside the same class bypasses the proxy, so @Transactional on otherMethod is ignored',
        '@Transactional on private methods does not work (proxy cannot intercept)',
        'Catching the exception inside the method and not re-throwing means NO rollback',
        'Long transactions hold DB locks/connections — keep them short; never call slow external APIs inside them',
      ],
      tip: 'Interview favourite: "Why is my @Transactional not rolling back?" → checked exception, swallowed exception, self-invocation, private method, or the class is not a Spring bean.',
    },
    {
      heading: '4. JPA Auditing',
      content: 'Almost every table needs created_at, updated_at, created_by. Instead of setting them by hand everywhere, Spring Data fills them automatically. Steps: @EnableJpaAuditing on a config class, @EntityListeners(AuditingEntityListener.class) on the entity (or a @MappedSuperclass base class), then annotate fields.',
      syntax: `@CreatedDate      @Column(updatable = false) private Instant createdAt;
@LastModifiedDate                            private Instant updatedAt;
@CreatedBy        @Column(updatable = false) private String createdBy;
@LastModifiedBy                              private String updatedBy;`,
      points: [
        '@CreatedBy / @LastModifiedBy need an AuditorAware<String> bean that returns the current user (later from Spring Security)',
        'Put audit fields in an abstract @MappedSuperclass Auditable class and extend it — DRY',
      ],
    },
    {
      heading: '5. Why Database Migrations? Flyway Basics',
      content: 'spring.jpa.hibernate.ddl-auto=update is fine for learning but dangerous in production: it never drops/renames columns safely, and you cannot see what changed. Flyway is "Git for your database schema": numbered SQL files are applied in order and recorded in the table flyway_schema_history, so every environment (dev, test, prod) has the same schema.',
      syntax: `src/main/resources/db/migration/
    V1__create_account_table.sql
    V2__add_audit_columns.sql
    V3__insert_seed_data.sql`,
      points: [
        'Naming: V<version>__<description>.sql (two underscores!)',
        'Spring Boot runs Flyway automatically at startup when flyway-core is on the classpath',
        'For MySQL also add flyway-mysql dependency (Flyway 10+)',
        'Never edit an already-applied migration — checksum mismatch error. Create a new V file instead',
        'Use ddl-auto=validate with Flyway so Hibernate only checks the schema',
      ],
    },
  ],
  examples: [
    {
      title: 'Example 1: Bank Transfer with @Transactional and Rollback',
      scenario: 'Transfer money between two accounts. If the receiver does not exist or the balance is insufficient, nothing must change.',
      steps: [
        'IntelliJ: New Project > Spring Boot > Spring Web, Spring Data JPA, H2 Database, Flyway Migration > Create',
        'STS: File > New > Spring Starter Project > bank-api > choose the same starters > Finish',
        'Create Account entity, AccountRepository, InsufficientBalanceException, BankService, BankController',
        'Temporarily set spring.jpa.hibernate.ddl-auto=create (we switch to Flyway in Example 3)',
        'Run, create two accounts, call the transfer endpoint with a too-high amount and check that balances did not change',
        'Add logging.level.org.springframework.transaction=DEBUG to see "Creating new transaction" / "Rolling back" in the console',
      ],
      code: `// ===== entity/Account.java =====
package com.bank.entity;

import jakarta.persistence.*;

@Entity
public class Account {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String owner;
    private double balance;

    protected Account() {}
    public Account(String owner, double balance) { this.owner = owner; this.balance = balance; }

    public void debit(double amt) {
        if (amt > balance) throw new InsufficientBalanceException(owner, balance, amt);
        balance -= amt;
    }
    public void credit(double amt) { balance += amt; }

    public Long getId() { return id; }
    public String getOwner() { return owner; }
    public double getBalance() { return balance; }
}

// ===== entity/InsufficientBalanceException.java =====
package com.bank.entity;

public class InsufficientBalanceException extends RuntimeException {
    public InsufficientBalanceException(String owner, double bal, double amt) {
        super(owner + " has " + bal + " but tried to send " + amt);
    }
}

// ===== repository/AccountRepository.java =====
package com.bank.repository;
import com.bank.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AccountRepository extends JpaRepository<Account, Long> {}

// ===== service/BankService.java =====
package com.bank.service;

import com.bank.entity.Account;
import com.bank.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BankService {
    private final AccountRepository repo;
    public BankService(AccountRepository repo) { this.repo = repo; }

    @Transactional
    public void transfer(Long fromId, Long toId, double amount) {
        Account from = repo.findById(fromId)
                .orElseThrow(() -> new IllegalArgumentException("No account " + fromId));
        from.debit(amount);                       // 1st change (in memory)
        Account to = repo.findById(toId)
                .orElseThrow(() -> new IllegalArgumentException("No account " + toId));
        to.credit(amount);                        // 2nd change
        // no save() needed: dirty checking writes both UPDATEs at commit
    }

    @Transactional(readOnly = true)
    public Account get(Long id) { return repo.findById(id).orElseThrow(); }
}

// ===== controller/BankController.java =====
package com.bank.controller;

import com.bank.entity.Account;
import com.bank.repository.AccountRepository;
import com.bank.service.BankService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class BankController {
    private final BankService service;
    private final AccountRepository repo;
    public BankController(BankService s, AccountRepository r) { this.service = s; this.repo = r; }

    @PostMapping
    public Account open(@RequestBody Map<String, Object> body) {
        return repo.save(new Account((String) body.get("owner"),
                ((Number) body.get("balance")).doubleValue()));
    }

    @PostMapping("/transfer")
    public ResponseEntity<String> transfer(@RequestParam Long from, @RequestParam Long to,
                                           @RequestParam double amount) {
        try {
            service.transfer(from, to, amount);
            return ResponseEntity.ok("Transfer successful");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body("Failed: " + ex.getMessage());
        }
    }

    @GetMapping("/{id}")
    public Account get(@PathVariable Long id) { return service.get(id); }
}`,
      result: `POST /api/accounts {"owner":"Anil","balance":1000}  -> {"id":1,"owner":"Anil","balance":1000.0}
POST /api/accounts {"owner":"Bina","balance":500}   -> {"id":2,"owner":"Bina","balance":500.0}

POST /api/accounts/transfer?from=1&to=2&amount=300  -> Transfer successful
GET /api/accounts/1 -> balance 700.0 ; GET /api/accounts/2 -> balance 800.0

POST /api/accounts/transfer?from=1&to=99&amount=100 -> Failed: No account 99
GET /api/accounts/1 -> balance 700.0   (debit of 100 was rolled back)

POST /api/accounts/transfer?from=2&to=1&amount=5000 -> Failed: Bina has 800.0 but tried to send 5000.0`,
      explanation: 'In the second transfer the debit happened in memory first, then IllegalArgumentException (a RuntimeException) was thrown. The proxy rolled back, so Anil still has 700. Note the try/catch is in the CONTROLLER, outside the transactional method — catching inside transfer() would have prevented the rollback.',
    },
    {
      title: 'Example 2: JPA Auditing with a Base Class',
      scenario: 'Every entity must store who created it and when, and when it was last changed.',
      steps: [
        'Create config/AuditConfig.java with @EnableJpaAuditing and an AuditorAware bean',
        'Create entity/Auditable.java as @MappedSuperclass with @EntityListeners',
        'Make Account extend Auditable',
        'Restart and create an account; then update it and compare createdAt vs updatedAt',
        'IntelliJ: use Database tool window (or H2 console) to see the new columns',
      ],
      code: `// ===== config/AuditConfig.java =====
package com.bank.config;

import org.springframework.context.annotation.*;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import java.util.Optional;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class AuditConfig {
    @Bean
    public AuditorAware<String> auditorProvider() {
        // Day 17+: return SecurityContextHolder user name instead
        return () -> Optional.of("system");
    }
}

// ===== entity/Auditable.java =====
package com.bank.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.Instant;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class Auditable {
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public String getUpdatedBy() { return updatedBy; }
}

// ===== entity/Account.java (change class line) =====
@Entity
public class Account extends Auditable { ... same fields ... }`,
      result: `POST /api/accounts {"owner":"Chetan","balance":200}
{"id":3,"owner":"Chetan","balance":200.0,
 "createdAt":"2025-01-10T09:15:02.120Z","updatedAt":"2025-01-10T09:15:02.120Z",
 "createdBy":"system","updatedBy":"system"}

After a transfer involving account 3:
 "createdAt" unchanged, "updatedAt":"2025-01-10T09:20:44.005Z"
(timestamps depend on when you run it)`,
      explanation: 'AuditingEntityListener fills the fields in @PrePersist and @PreUpdate callbacks. updatable = false guarantees createdAt is never overwritten. Because every entity extends Auditable, auditing is written once and reused.',
    },
    {
      title: 'Example 3: Flyway Migrations for the Bank Schema',
      scenario: 'Move from ddl-auto to version-controlled SQL scripts so dev, test and production databases are identical.',
      steps: [
        'Add flyway-core (and flyway-mysql when using MySQL) to pom.xml; reload Maven (IntelliJ: Maven tool window > Reload; STS: right-click project > Maven > Update Project)',
        'Create folder src/main/resources/db/migration',
        'Create V1__create_account.sql, V2__add_audit_columns.sql, V3__seed_accounts.sql',
        'Change spring.jpa.hibernate.ddl-auto to validate',
        'Run the application and read the Flyway log lines in the console',
        'Check table flyway_schema_history in the H2 console / MySQL Workbench',
      ],
      code: `<!-- ===== pom.xml ===== -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<!-- only for MySQL -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-mysql</artifactId>
</dependency>

# ===== application.properties (MySQL) =====
spring.datasource.url=jdbc:mysql://localhost:3306/bankdb?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
# for an existing database that already has tables:
# spring.flyway.baseline-on-migrate=true

-- ===== db/migration/V1__create_account.sql =====
CREATE TABLE account (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner   VARCHAR(100) NOT NULL,
    balance DOUBLE NOT NULL
);

-- ===== db/migration/V2__add_audit_columns.sql =====
ALTER TABLE account ADD COLUMN created_at TIMESTAMP(6);
ALTER TABLE account ADD COLUMN updated_at TIMESTAMP(6);
ALTER TABLE account ADD COLUMN created_by VARCHAR(50);
ALTER TABLE account ADD COLUMN updated_by VARCHAR(50);

-- ===== db/migration/V3__seed_accounts.sql =====
INSERT INTO account(owner, balance, created_by, updated_by) VALUES ('Anil', 1000, 'flyway', 'flyway');
INSERT INTO account(owner, balance, created_by, updated_by) VALUES ('Bina', 500, 'flyway', 'flyway');`,
      result: `Console on first start:
Flyway Community Edition ... by Redgate
Database: jdbc:mysql://localhost:3306/bankdb (MySQL 8.0)
Successfully validated 3 migrations
Creating Schema History table \`bankdb\`.\`flyway_schema_history\` ...
Current version of schema \`bankdb\`: << Empty Schema >>
Migrating schema \`bankdb\` to version "1 - create account"
Migrating schema \`bankdb\` to version "2 - add audit columns"
Migrating schema \`bankdb\` to version "3 - seed accounts"
Successfully applied 3 migrations to schema \`bankdb\`, now at version v3

Second start:
Schema \`bankdb\` is up to date. No migration necessary.`,
      explanation: 'Flyway applies each pending script exactly once, in version order, and records it in flyway_schema_history with a checksum. ddl-auto=validate makes Hibernate fail fast if the entity and the table do not match. If you edit V1 after it has run, Flyway refuses to start with a checksum mismatch — always add a new V4 script instead.',
    },
  ],
  interview: [
    { q: 'Where should @Transactional be placed and why?', a: 'On public methods (or the class) of the service layer, because a business operation may call several repositories and must be atomic. Controllers should not own transactions.', level: 'Easy' },
    { q: 'Does @Transactional roll back on checked exceptions?', a: 'No. By default only RuntimeException and Error trigger rollback. Use @Transactional(rollbackFor = Exception.class) for checked exceptions.', level: 'Medium' },
    { q: 'What is self-invocation and why does it break @Transactional?', a: 'Calling a @Transactional method from another method of the same class uses "this", not the Spring proxy, so the transaction advice is never applied. Move the method to another bean or inject the proxy.', level: 'Hard' },
    { q: 'Difference between REQUIRED and REQUIRES_NEW?', a: 'REQUIRED joins the current transaction or creates one. REQUIRES_NEW always suspends the current one and creates an independent transaction that commits/rolls back on its own.', level: 'Medium' },
    { q: 'What does readOnly = true do?', a: 'Hints that no writes happen: Hibernate sets flush mode to manual and skips dirty checking; some drivers route to read replicas. It improves performance for queries.', level: 'Medium' },
    { q: 'What is dirty checking?', a: 'Hibernate keeps a snapshot of each managed entity. At flush/commit it compares current values with the snapshot and issues UPDATE statements automatically, so save() is not required for managed entities.', level: 'Medium' },
    { q: 'How do you enable JPA auditing?', a: '@EnableJpaAuditing on a configuration class, @EntityListeners(AuditingEntityListener.class) on entities, @CreatedDate/@LastModifiedDate fields, and an AuditorAware bean for @CreatedBy/@LastModifiedBy.', level: 'Easy' },
    { q: 'What is Flyway and why use it over ddl-auto=update?', a: 'Flyway is a schema migration tool that applies versioned SQL scripts in order and tracks them in flyway_schema_history. It is repeatable, reviewable and safe for production, whereas ddl-auto=update is unpredictable and cannot handle renames/data changes.', level: 'Easy' },
    { q: 'What happens if you modify an already-applied Flyway migration?', a: 'Flyway detects a checksum mismatch on validate and fails startup. Fix by reverting the change and adding a new migration (or flyway repair only in development).', level: 'Medium' },
    { q: 'Name the transaction isolation levels.', a: 'READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE (plus DEFAULT = database default; MySQL InnoDB uses REPEATABLE_READ).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write an OrderService.placeOrder() that reduces product stock and saves an order in one transaction; throw OutOfStockException (runtime) when stock is low.',
      hint: 'Load product, check stock, reduce it, save order — all inside @Transactional.',
      solution: `@Service
public class OrderService {
    private final ProductRepository products;
    private final OrderRepository orders;
    public OrderService(ProductRepository p, OrderRepository o) { products = p; orders = o; }

    @Transactional
    public Order placeOrder(Long productId, int qty) {
        Product p = products.findById(productId).orElseThrow();
        if (p.getStock() < qty) throw new OutOfStockException(p.getName());
        p.setStock(p.getStock() - qty);           // dirty checking
        return orders.save(new Order(p, qty, p.getPrice() * qty));
    }
}`,
    },
    {
      task: 'Save an audit log row even when the main transaction rolls back.',
      hint: 'Put the log method in a separate bean with Propagation.REQUIRES_NEW.',
      solution: `@Service
public class AuditLogService {
    private final AuditLogRepository repo;
    public AuditLogService(AuditLogRepository repo) { this.repo = repo; }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String msg) { repo.save(new AuditLog(msg)); }
}

// in OrderService
@Transactional
public Order placeOrder(Long id, int qty) {
    auditLogService.log("Order attempt for product " + id);  // commits independently
    ... // may throw and roll back, but the log stays
}`,
    },
    {
      task: 'Add a V4 Flyway migration that creates an orders table with a foreign key to account.',
      hint: 'File name V4__create_orders.sql.',
      solution: `-- V4__create_orders.sql
CREATE TABLE orders (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id  BIGINT NOT NULL,
    amount      DOUBLE NOT NULL,
    created_at  TIMESTAMP(6),
    CONSTRAINT fk_orders_account FOREIGN KEY (account_id) REFERENCES account(id)
);`,
    },
    {
      task: 'Make a Customer entity auditable by extending Auditable and verify createdAt is not changed on update.',
      hint: 'updatable = false on createdAt.',
      solution: `@Entity
public class Customer extends Auditable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;
    // getters/setters
}

@Transactional
public Customer rename(Long id, String name) {
    Customer c = repo.findById(id).orElseThrow();
    c.setName(name);       // @PreUpdate updates only updatedAt / updatedBy
    return c;
}`,
    },
  ],
  quiz: [
    { question: 'Which exception does NOT roll back by default?', options: ['IllegalStateException', 'IOException', 'NullPointerException', 'IllegalArgumentException'], answer: 1, explanation: 'IOException is checked; default rollback is only for unchecked exceptions.' },
    { question: 'Correct Flyway file name:', options: ['V1_create.sql', 'v1-create.sql', 'V1__create_table.sql', '1__create.sql'], answer: 2, explanation: 'V + version + two underscores + description.' },
    { question: 'Which annotation turns on JPA auditing?', options: ['@EnableJpaAuditing', '@EnableAuditing', '@Auditable', '@EnableTransactionManagement'], answer: 0, explanation: '@EnableJpaAuditing on a @Configuration class.' },
    { question: 'Calling a @Transactional method via this.method() inside the same bean:', options: ['Creates a new transaction', 'Throws an exception', 'Uses REQUIRES_NEW', 'Bypasses the proxy, so no transaction advice'], answer: 3, explanation: 'Self-invocation skips the proxy.' },
    { question: 'With Flyway, the best ddl-auto value is:', options: ['create-drop', 'update', 'validate', 'create'], answer: 2, explanation: 'Flyway creates the schema; Hibernate only validates.' },
  ],
};
