export default {
  id: 'day-10-transaction-management',
  title: 'Transaction Management: @Transactional, Propagation, Isolation',
  module: 'Module 3: Data Access',
  day: 10,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: `Make database work all-or-nothing with Spring's declarative transactions: configure a PlatformTransactionManager, use @Transactional, understand default rollback rules, the seven propagation types, the four isolation levels and the classic pitfalls.`,
  objectives: [
    `Explain ACID and why a money transfer needs a transaction`,
    `Configure @EnableTransactionManagement and DataSourceTransactionManager`,
    `Know the default rollback rule (unchecked rolls back, checked commits) and change it with rollbackFor`,
    `Choose propagation (REQUIRED, REQUIRES_NEW, NESTED...) and isolation levels`,
    `Avoid pitfalls: self-invocation, private methods, swallowed exceptions`,
  ],
  theory: [
    {
      heading: 'What is a transaction? (ACID)',
      content: `A transaction is a group of database operations that must succeed together or fail together. Classic example: transferring 500 from account A to B = debit A + credit B. If the server crashes after the debit, money disappears unless the debit is rolled back. Analogy: an ATM withdrawal. Either the cash comes out AND your balance reduces, or neither happens.`,
      points: [
        `Atomicity: all or nothing`,
        `Consistency: data moves from one valid state to another (rules/constraints hold)`,
        `Isolation: concurrent transactions do not see each other's half-done work`,
        `Durability: once committed, data survives crashes`,
      ],
    },
    {
      heading: 'Programmatic vs declarative transactions',
      content: `Programmatic: you write begin/commit/rollback yourself (plain JDBC con.setAutoCommit(false), or Spring's TransactionTemplate). Declarative: you put @Transactional on a method and Spring's AOP proxy does begin/commit/rollback for you. Declarative is the standard way. Diagram in words: caller -> TransactionInterceptor (proxy): begin -> your method -> success? commit : rollback -> caller.`,
      syntax: `@Configuration
@EnableTransactionManagement
public class TxConfig {
    @Bean
    public PlatformTransactionManager transactionManager(DataSource ds) {
        return new DataSourceTransactionManager(ds);   // JDBC/JdbcTemplate
        // JpaTransactionManager for JPA, HibernateTransactionManager for native Hibernate
    }
}`,
    },
    {
      heading: '@Transactional and rollback rules',
      content: `@Transactional (org.springframework.transaction.annotation) can be placed on a class (all public methods) or a method. Default behaviour: roll back for RuntimeException and Error; COMMIT for checked exceptions. This surprises many developers. Change it with rollbackFor = Exception.class or noRollbackFor = SomeException.class. Other attributes: readOnly = true (optimisation for queries), timeout = 5 (seconds).`,
      syntax: `@Transactional(rollbackFor = Exception.class, timeout = 10)
public void transfer(int from, int to, double amount) throws InsufficientFundsException { ... }

@Transactional(readOnly = true)
public List<Account> findAll() { ... }`,
      tip: `Common mistake: catching the exception inside the @Transactional method and not rethrowing. The proxy sees a normal return and COMMITS the partial work.`,
    },
    {
      heading: 'Propagation: what happens when a transactional method calls another',
      content: `Propagation decides whether the called method joins the current transaction or starts a new one. Analogy: you are already on a bus (transaction). REQUIRED: get on the same bus, or start one if none. REQUIRES_NEW: get off, take your own taxi, then come back to the bus. MANDATORY: must already be on a bus, else error.`,
      points: [
        `REQUIRED (default): join existing, else create new`,
        `REQUIRES_NEW: always create a new transaction, suspend the current one (good for audit logs that must be saved even if the main work rolls back)`,
        `SUPPORTS: join if one exists, else run without transaction`,
        `NOT_SUPPORTED: suspend any transaction and run without one`,
        `MANDATORY: must have an existing transaction, else IllegalTransactionStateException`,
        `NEVER: must NOT have a transaction, else exception`,
        `NESTED: savepoint inside the existing transaction; inner can roll back alone (JDBC DataSourceTransactionManager only)`,
      ],
    },
    {
      heading: 'Isolation levels and concurrency problems',
      content: `Problems when transactions run at the same time: Dirty read (reading uncommitted data of another transaction), Non-repeatable read (same row read twice gives different values), Phantom read (same query returns new rows). Isolation levels from weakest to strongest:`,
      points: [
        `READ_UNCOMMITTED: allows dirty, non-repeatable and phantom reads`,
        `READ_COMMITTED: prevents dirty reads (default of Oracle, PostgreSQL, SQL Server)`,
        `REPEATABLE_READ: also prevents non-repeatable reads (default of MySQL InnoDB)`,
        `SERIALIZABLE: prevents all three; slowest, uses most locking`,
        `DEFAULT: use the database's default`,
      ],
      syntax: `@Transactional(isolation = Isolation.READ_COMMITTED, propagation = Propagation.REQUIRED)`,
    },
    {
      heading: 'Pitfalls (asked in every interview)',
      content: `@Transactional works through a proxy, so the AOP rules from Day 7 apply.`,
      points: [
        `Self-invocation: this.innerMethod() inside the same class ignores innerMethod's @Transactional`,
        `Only public methods are transactional by default with proxy mode`,
        `Bean must be created by Spring (new MyService() has no proxy)`,
        `Checked exceptions commit unless rollbackFor is set`,
        `Swallowing exceptions in catch blocks prevents rollback`,
        `MySQL MyISAM tables do not support transactions; use InnoDB`,
      ],
    },
  ],
  examples: [
    {
      title: 'What the @Transactional proxy does (plain Java simulation)',
      scenario: `We simulate a transaction manager over an in-memory bank: take a snapshot on BEGIN, restore on ROLLBACK, and apply Spring's DEFAULT rollback rule (unchecked = rollback, checked = commit). Runs in the browser IDE.`,
      steps: [
        'Create Main.java and paste the code',
        'Click Run ▶',
        'Look carefully at transfer 3: a checked exception still committed a negative balance',
      ],
      code: `import java.util.*;

class InsufficientFundsException extends Exception {
    InsufficientFundsException(String msg) { super(msg); }
}

class Bank {
    final Map<String, Integer> balances = new LinkedHashMap<>();
    Bank() { balances.put("A", 1000); balances.put("B", 500); }
}

class TransactionManager {
    private Map<String, Integer> snapshot;
    void begin(Bank bank) { snapshot = new LinkedHashMap<>(bank.balances); System.out.println("BEGIN"); }
    void commit() { System.out.println("COMMIT"); }
    void rollback(Bank bank) { bank.balances.clear(); bank.balances.putAll(snapshot); System.out.println("ROLLBACK"); }
}

interface Work { void run() throws Exception; }

class TxProxy {   // what Spring's TransactionInterceptor does
    static void inTransaction(Bank bank, TransactionManager tm, Work work) {
        tm.begin(bank);
        try {
            work.run();
            tm.commit();
        } catch (RuntimeException | Error e) {
            tm.rollback(bank);                       // default: unchecked -> rollback
            System.out.println("Reason: " + e.getMessage());
        } catch (Exception e) {
            tm.commit();                             // default: checked -> COMMIT
            System.out.println("Checked exception, still committed: " + e.getMessage());
        }
    }
}

public class Main {
    static void transfer(Bank bank, String from, String to, int amount, boolean crash)
            throws InsufficientFundsException {
        bank.balances.put(from, bank.balances.get(from) - amount);          // debit
        if (crash) throw new IllegalStateException("Server crashed after debit");
        if (bank.balances.get(from) < 0) throw new InsufficientFundsException("Insufficient funds in " + from);
        bank.balances.put(to, bank.balances.get(to) + amount);              // credit
    }

    public static void main(String[] args) {
        Bank bank = new Bank();
        TransactionManager tm = new TransactionManager();
        System.out.println("Start: " + bank.balances);

        TxProxy.inTransaction(bank, tm, () -> transfer(bank, "A", "B", 200, false));
        System.out.println("After 1: " + bank.balances);

        TxProxy.inTransaction(bank, tm, () -> transfer(bank, "A", "B", 300, true));
        System.out.println("After 2: " + bank.balances);

        TxProxy.inTransaction(bank, tm, () -> transfer(bank, "A", "B", 900, false));
        System.out.println("After 3: " + bank.balances);
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.*;

class InsufficientFundsException extends Exception {
    InsufficientFundsException(String msg) { super(msg); }
}

class Bank {
    final Map<String, Integer> balances = new LinkedHashMap<>();
    Bank() { balances.put("A", 1000); balances.put("B", 500); }
}

class TransactionManager {
    private Map<String, Integer> snapshot;
    void begin(Bank bank) { snapshot = new LinkedHashMap<>(bank.balances); System.out.println("BEGIN"); }
    void commit() { System.out.println("COMMIT"); }
    void rollback(Bank bank) { bank.balances.clear(); bank.balances.putAll(snapshot); System.out.println("ROLLBACK"); }
}

interface Work { void run() throws Exception; }

class TxProxy {
    static void inTransaction(Bank bank, TransactionManager tm, Work work) {
        tm.begin(bank);
        try {
            work.run();
            tm.commit();
        } catch (RuntimeException | Error e) {
            tm.rollback(bank);
            System.out.println("Reason: " + e.getMessage());
        } catch (Exception e) {
            tm.commit();
            System.out.println("Checked exception, still committed: " + e.getMessage());
        }
    }
}

public class Main {
    static void transfer(Bank bank, String from, String to, int amount, boolean crash)
            throws InsufficientFundsException {
        bank.balances.put(from, bank.balances.get(from) - amount);
        if (crash) throw new IllegalStateException("Server crashed after debit");
        if (bank.balances.get(from) < 0) throw new InsufficientFundsException("Insufficient funds in " + from);
        bank.balances.put(to, bank.balances.get(to) + amount);
    }

    public static void main(String[] args) {
        Bank bank = new Bank();
        TransactionManager tm = new TransactionManager();
        System.out.println("Start: " + bank.balances);

        TxProxy.inTransaction(bank, tm, () -> transfer(bank, "A", "B", 200, false));
        System.out.println("After 1: " + bank.balances);

        TxProxy.inTransaction(bank, tm, () -> transfer(bank, "A", "B", 300, true));
        System.out.println("After 2: " + bank.balances);

        TxProxy.inTransaction(bank, tm, () -> transfer(bank, "A", "B", 900, false));
        System.out.println("After 3: " + bank.balances);
    }
}`,
        },
      },
      result: `Start: {A=1000, B=500}
BEGIN
COMMIT
After 1: {A=800, B=700}
BEGIN
ROLLBACK
Reason: Server crashed after debit
After 2: {A=800, B=700}
BEGIN
COMMIT
Checked exception, still committed: Insufficient funds in A
After 3: {A=-100, B=700}`,
      explanation: `Transfer 1 commits. Transfer 2 throws an unchecked exception after the debit, so the snapshot is restored (atomicity). Transfer 3 throws a CHECKED exception, and with Spring's default rule the debit is committed, leaving A at -100. That is why real code uses @Transactional(rollbackFor = Exception.class) or unchecked business exceptions.`,
    },
    {
      title: 'Bank transfer with @Transactional and JdbcTemplate',
      scenario: `Real Spring version: account table, AccountDao, TransferService.`,
      steps: [
        'pom.xml: spring-context, spring-jdbc (brings spring-tx), mysql-connector-j, HikariCP (versions as Day 9); reload Maven',
        'Run the SQL script in MySQL Workbench',
        'Create TxConfig, AccountDao, TransferService and TxApp (Eclipse: New > Class; IntelliJ: New > Java Class)',
        'Run TxApp, then check the table in Workbench: SELECT * FROM account;',
      ],
      code: `-- SQL
CREATE TABLE account (id INT PRIMARY KEY, holder VARCHAR(30), balance DOUBLE) ENGINE=InnoDB;
INSERT INTO account VALUES (1, 'Asha', 1000), (2, 'Ravi', 500);

// TxConfig.java
@Configuration
@ComponentScan("com.demo")
@EnableTransactionManagement
public class TxConfig {
    @Bean public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl("jdbc:mysql://localhost:3306/springdb");
        ds.setUsername("root"); ds.setPassword("root");
        return ds;
    }
    @Bean public JdbcTemplate jdbcTemplate(DataSource ds) { return new JdbcTemplate(ds); }
    @Bean public PlatformTransactionManager transactionManager(DataSource ds) {
        return new DataSourceTransactionManager(ds);
    }
}

// AccountDao.java
@Repository
public class AccountDao {
    private final JdbcTemplate jdbc;
    public AccountDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public void add(int id, double amount) {
        jdbc.update("UPDATE account SET balance = balance + ? WHERE id = ?", amount, id);
    }
    public double balance(int id) {
        return jdbc.queryForObject("SELECT balance FROM account WHERE id = ?", Double.class, id);
    }
}

// TransferService.java
@Service
public class TransferService {
    private final AccountDao dao;
    public TransferService(AccountDao dao) { this.dao = dao; }

    @Transactional(rollbackFor = Exception.class)
    public void transfer(int from, int to, double amount) {
        dao.add(from, -amount);                                  // debit
        if (dao.balance(from) < 0) throw new IllegalStateException("Insufficient balance");
        dao.add(to, amount);                                     // credit
    }
}

// TxApp.java
public class TxApp {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext(TxConfig.class)) {
            TransferService ts = ctx.getBean(TransferService.class);
            AccountDao dao = ctx.getBean(AccountDao.class);
            ts.transfer(1, 2, 300);
            System.out.println("After ok: " + dao.balance(1) + " / " + dao.balance(2));
            try { ts.transfer(1, 2, 5000); }
            catch (IllegalStateException e) { System.out.println("Failed: " + e.getMessage()); }
            System.out.println("After fail: " + dao.balance(1) + " / " + dao.balance(2));
        }
    }
}`,
      result: `After ok: 700.0 / 800.0
Failed: Insufficient balance
After fail: 700.0 / 800.0`,
      explanation: `The second transfer debited 5000 (balance became -4300 inside the transaction) and then threw, so Spring rolled back the debit. Remove @Transactional and run again on fresh data: "After fail" would show -4300.0 / 800.0, proving the annotation matters.`,
    },
    {
      title: 'REQUIRES_NEW for audit logs',
      scenario: `Every transfer attempt must be logged in audit_log, even if the transfer rolls back.`,
      steps: [
        'Create table audit_log(id INT AUTO_INCREMENT PRIMARY KEY, msg VARCHAR(100))',
        'Create AuditService in a SEPARATE bean (not the same class, to avoid self-invocation)',
        'Call it from TransferService.transfer before the business work',
      ],
      code: `@Service
public class AuditService {
    private final JdbcTemplate jdbc;
    public AuditService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String msg) {
        jdbc.update("INSERT INTO audit_log(msg) VALUES (?)", msg);
    }
}

@Service
public class TransferService {
    private final AccountDao dao;
    private final AuditService audit;
    public TransferService(AccountDao dao, AuditService audit) { this.dao = dao; this.audit = audit; }

    @Transactional
    public void transfer(int from, int to, double amount) {
        audit.log("Transfer " + amount + " from " + from + " to " + to);   // own transaction, commits now
        dao.add(from, -amount);
        if (dao.balance(from) < 0) throw new IllegalStateException("Insufficient balance");
        dao.add(to, amount);
    }
}`,
      result: `After ts.transfer(1, 2, 5000) fails: account balances unchanged, but audit_log contains "Transfer 5000.0 from 1 to 2".`,
      explanation: `REQUIRES_NEW suspended the outer transaction, ran log() in a new one and committed it independently. With default REQUIRED the log row would be rolled back together with the transfer.`,
    },
    {
      title: 'Self-invocation pitfall',
      scenario: `A method without @Transactional calls a @Transactional method of the same class.`,
      steps: [
        'Add a public method bulkTransfer() to TransferService that calls this.transfer() twice',
        'Make the second transfer fail',
        'Check the database',
      ],
      code: `public void bulkTransfer() {          // no @Transactional here
    transfer(1, 2, 100);              // this.transfer(...) - no proxy!
    transfer(1, 2, 99999);            // fails
}`,
      result: `Balances after the call: the debit of 99999 is NOT rolled back (no transaction was started), and the first transfer is also permanent.`,
      explanation: `The call goes from the target object to itself, skipping the proxy, so @Transactional on transfer() is ignored and each JdbcTemplate statement auto-commits. Fix: put @Transactional on bulkTransfer, or move transfer() to another bean.`,
    },
  ],
  interview: [
    { q: 'What is a transaction and what is ACID?', a: 'A unit of work that is all-or-nothing. ACID = Atomicity, Consistency, Isolation, Durability.', level: 'Easy' },
    { q: 'Programmatic vs declarative transaction management?', a: 'Programmatic: code calls begin/commit/rollback (TransactionTemplate). Declarative: @Transactional and AOP proxies manage it. Declarative is preferred.', level: 'Easy' },
    { q: 'What is the default rollback behaviour of @Transactional?', a: 'Rolls back on RuntimeException and Error; commits on checked exceptions unless rollbackFor is specified.', level: 'Medium' },
    { q: 'What is the default propagation and isolation?', a: 'Propagation.REQUIRED and Isolation.DEFAULT (the database default).', level: 'Easy' },
    { q: 'REQUIRED vs REQUIRES_NEW?', a: 'REQUIRED joins the current transaction (one rollback affects all). REQUIRES_NEW suspends it and runs in an independent transaction that commits/rolls back separately.', level: 'Medium' },
    { q: 'What is NESTED propagation?', a: 'Runs within the existing transaction using a savepoint; the nested part can roll back without rolling back the outer transaction. Supported by DataSourceTransactionManager.', level: 'Hard' },
    { q: 'Explain dirty, non-repeatable and phantom reads.', a: 'Dirty: reading uncommitted changes. Non-repeatable: same row read twice returns different data because another tx updated it. Phantom: same query returns extra/missing rows because another tx inserted/deleted.', level: 'Medium' },
    { q: 'Why does @Transactional not work on a private method or self-call?', a: 'Spring uses proxies; private methods cannot be intercepted and self-calls bypass the proxy.', level: 'Hard' },
    { q: 'Which transaction manager for JDBC, JPA and Hibernate?', a: 'DataSourceTransactionManager (JDBC/JdbcTemplate), JpaTransactionManager (JPA), HibernateTransactionManager (native Hibernate SessionFactory).', level: 'Medium' },
    { q: 'What does readOnly = true do?', a: 'Hints that no writes occur; lets the driver/ORM optimise (Hibernate skips dirty checking, some DBs route to replicas). It does not by itself block writes in all databases.', level: 'Medium' },
    { q: 'Should @Transactional be on the DAO or service layer?', a: 'Service layer, because one business operation often spans several DAO calls that must be atomic.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Plain Java: modify TxProxy so that it accepts a boolean rollbackForChecked. Re-run transfer 3 with true and show that A stays 800.',
      hint: 'Inside catch (Exception e) choose rollback when the flag is true.',
      solution: `static void inTransaction(Bank bank, TransactionManager tm, Work work, boolean rollbackForChecked) {
    tm.begin(bank);
    try {
        work.run();
        tm.commit();
    } catch (RuntimeException | Error e) {
        tm.rollback(bank);
        System.out.println("Reason: " + e.getMessage());
    } catch (Exception e) {
        if (rollbackForChecked) tm.rollback(bank); else tm.commit();
        System.out.println("Checked: " + e.getMessage());
    }
}
// After transfer 1 then transfer 3 with true:
// BEGIN / ROLLBACK / Checked: Insufficient funds in A
// After 3: {A=800, B=700}`,
    },
    {
      task: 'Write an OrderService.placeOrder() that inserts an order row and reduces stock; if stock becomes negative, throw a checked OutOfStockException and make sure everything rolls back.',
      hint: 'rollbackFor = OutOfStockException.class',
      solution: `public class OutOfStockException extends Exception {
    public OutOfStockException(String m) { super(m); }
}
@Service
public class OrderService {
    private final JdbcTemplate jdbc;
    public OrderService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Transactional(rollbackFor = OutOfStockException.class)
    public void placeOrder(int productId, int qty) throws OutOfStockException {
        jdbc.update("INSERT INTO orders(product_id, qty) VALUES (?, ?)", productId, qty);
        jdbc.update("UPDATE product SET stock = stock - ? WHERE id = ?", qty, productId);
        Integer stock = jdbc.queryForObject("SELECT stock FROM product WHERE id = ?", Integer.class, productId);
        if (stock < 0) throw new OutOfStockException("Only " + (stock + qty) + " left");
    }
}`,
    },
    {
      task: 'Use TransactionTemplate (programmatic) to perform two updates atomically.',
      hint: 'new TransactionTemplate(txManager).executeWithoutResult(status -> {...})',
      solution: `@Service
public class ProgrammaticService {
    private final TransactionTemplate tx;
    private final JdbcTemplate jdbc;
    public ProgrammaticService(PlatformTransactionManager tm, JdbcTemplate jdbc) {
        this.tx = new TransactionTemplate(tm); this.jdbc = jdbc;
    }
    public void move(double amt) {
        tx.executeWithoutResult(status -> {
            jdbc.update("UPDATE account SET balance = balance - ? WHERE id = 1", amt);
            jdbc.update("UPDATE account SET balance = balance + ? WHERE id = 2", amt);
            if (amt > 10000) status.setRollbackOnly();
        });
    }
}`,
    },
    {
      task: 'Fill the table: which isolation level prevents dirty / non-repeatable / phantom reads?',
      hint: 'Each level adds one protection.',
      solution: `READ_UNCOMMITTED: none
READ_COMMITTED: dirty
REPEATABLE_READ: dirty, non-repeatable
SERIALIZABLE: dirty, non-repeatable, phantom`,
    },
  ],
  quiz: [
    { question: 'By default @Transactional rolls back on...', options: ['Any Exception', 'Only checked exceptions', 'RuntimeException and Error', 'Never'], answer: 2, explanation: 'Checked exceptions commit by default.' },
    { question: 'Which annotation enables @Transactional processing in Java config?', options: ['@EnableTransactionManagement', '@EnableTx', '@Transactional on config class', '@EnableAspectJAutoProxy'], answer: 0, explanation: 'It registers the transaction interceptor/proxy infrastructure.' },
    { question: 'Which propagation always starts a new independent transaction?', options: ['REQUIRED', 'NESTED', 'SUPPORTS', 'REQUIRES_NEW'], answer: 3, explanation: 'REQUIRES_NEW suspends the current transaction.' },
    { question: 'MySQL InnoDB default isolation level is...', options: ['READ_COMMITTED', 'REPEATABLE_READ', 'SERIALIZABLE', 'READ_UNCOMMITTED'], answer: 1, explanation: 'InnoDB defaults to REPEATABLE READ.' },
    { question: 'Transaction manager for JdbcTemplate?', options: ['JpaTransactionManager', 'JtaTransactionManager only', 'DataSourceTransactionManager', 'HibernateTransactionManager'], answer: 2, explanation: 'JDBC uses DataSourceTransactionManager.' },
  ],
};
