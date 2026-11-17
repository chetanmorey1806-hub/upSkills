export default {
  id: "day-06-transactions-pooling-dao",
  title: "Transaction Management, Connection Pooling (HikariCP) and DAO Pattern",
  module: "Module 1: JDBC",
  day: 6,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Make multiple SQL operations all-or-nothing with commit, rollback and savepoints, reuse connections efficiently with the HikariCP connection pool, and organise JDBC code professionally using the DAO (Data Access Object) pattern.",
  objectives: [
    "Explain ACID properties and JDBC auto-commit",
    "Implement a bank transfer with setAutoCommit(false), commit, rollback and savepoints",
    "Understand transaction isolation levels and the problems they prevent",
    "Configure HikariCP and get connections from a DataSource",
    "Build a layered Student DAO (model, DAO interface, implementation, utility) used later by servlets"
  ],
  theory: [
    {
      heading: "What is a Transaction? (ACID)",
      content: "A transaction is a group of SQL operations that must succeed or fail as ONE unit. Classic example: transferring 1000 rupees from Asha to Ravi = (1) debit Asha, (2) credit Ravi. If the power goes off after step 1, the money disappears. A transaction guarantees both happen or neither happens.\n\nACID properties:",
      points: [
        "Atomicity: all or nothing. Either every statement is saved or none.",
        "Consistency: the database moves from one valid state to another (total money stays the same, constraints are respected).",
        "Isolation: concurrent transactions do not see each other's half-finished work.",
        "Durability: once committed, data survives crashes and restarts.",
        "In MySQL, transactions need the InnoDB engine (the default). MyISAM tables ignore rollback."
      ]
    },
    {
      heading: "Transactions in JDBC: commit, rollback, savepoint",
      content: "By default JDBC connections are in auto-commit mode: each statement is its own transaction and is saved immediately. To group statements: turn auto-commit off, run the statements, then commit() if everything worked or rollback() in the catch block.",
      syntax: "con.setAutoCommit(false);\ntry {\n    debit.executeUpdate();\n    credit.executeUpdate();\n    con.commit();            // save both\n} catch (SQLException e) {\n    con.rollback();          // undo both\n} finally {\n    con.setAutoCommit(true);\n}",
      points: [
        "Savepoint: a bookmark inside a transaction. con.setSavepoint(\"sp1\") then con.rollback(sp1) undoes only the work after the bookmark.",
        "DDL statements (CREATE, ALTER, DROP) cause an implicit commit in MySQL and cannot be rolled back.",
        "If a connection is closed without commit while auto-commit is false, the uncommitted work is rolled back (driver dependent, so always commit or rollback explicitly).",
        "Spring later replaces all this boilerplate with @Transactional."
      ],
      tip: "Always reset setAutoCommit(true) before returning a connection to a pool, otherwise the next user gets a connection in manual-commit mode. HikariCP resets it for you."
    },
    {
      heading: "Isolation Levels and Read Problems",
      content: "When many users work at the same time, three problems can appear:\n- Dirty read: reading data another transaction has changed but not yet committed (it may roll back).\n- Non-repeatable read: reading the same row twice gives different values because someone committed an update in between.\n- Phantom read: running the same query twice returns new rows inserted by someone else.\n\nIsolation levels (set with con.setTransactionIsolation(...)):",
      points: [
        "TRANSACTION_READ_UNCOMMITTED: allows dirty, non-repeatable and phantom reads (fastest, least safe).",
        "TRANSACTION_READ_COMMITTED: prevents dirty reads (default in Oracle, PostgreSQL, SQL Server).",
        "TRANSACTION_REPEATABLE_READ: prevents dirty and non-repeatable reads (default in MySQL InnoDB; InnoDB also mostly prevents phantoms).",
        "TRANSACTION_SERIALIZABLE: prevents all three; transactions behave as if run one after another (slowest)."
      ]
    },
    {
      heading: "Connection Pooling and HikariCP",
      content: "Opening a physical DB connection takes time (TCP handshake, authentication, session setup), often 20 to 100 ms. A web app serving hundreds of requests per second cannot open a new connection for each one. A connection pool keeps a set of ready connections. Analogy: a taxi stand. Instead of building a new car for every passenger, taxis wait at the stand; a passenger takes one, and when done the taxi returns to the stand. In code, con.close() on a pooled connection does NOT close the real connection; it returns it to the pool.\n\nHikariCP is the fastest and most popular Java pool and the default in Spring Boot.",
      syntax: "HikariConfig cfg = new HikariConfig();\ncfg.setJdbcUrl(\"jdbc:mysql://localhost:3306/college_db\");\ncfg.setUsername(\"root\");\ncfg.setPassword(\"root\");\ncfg.setMaximumPoolSize(10);\nHikariDataSource ds = new HikariDataSource(cfg);\n\ntry (Connection con = ds.getConnection()) { ... }   // borrowed and returned",
      points: [
        "maximumPoolSize: max connections (default 10).",
        "minimumIdle: idle connections kept ready.",
        "connectionTimeout: how long getConnection waits for a free connection (default 30000 ms) before throwing SQLTransientConnectionException.",
        "idleTimeout, maxLifetime: retire old/idle connections.",
        "Create ONE HikariDataSource for the whole application and close it on shutdown.",
        "Other pools: Apache DBCP2, C3P0, Tomcat JDBC Pool."
      ]
    },
    {
      heading: "DAO (Data Access Object) Pattern",
      content: "DAO separates database code from business/UI code. Analogy: a librarian. Readers (UI, servlets) ask the librarian for a book; they do not walk into the store room. If the store room changes (MySQL to PostgreSQL, JDBC to Hibernate), only the librarian changes.\n\nLayers (diagram in words):\n[Main / Servlet]  -> uses ->  [StudentDao interface]\n                                   ^ implemented by\n                              [StudentDaoImpl (JDBC code)] -> uses -> [DBUtil / DataSource] -> MySQL\nData travels as [Student] model objects (POJO / entity).",
      points: [
        "Model / Entity: Student class with fields, constructors, getters/setters, toString.",
        "DAO interface: save, findById, findAll, update, deleteById.",
        "DAO implementation: the only class with SQL and JDBC code.",
        "Utility: DBUtil holding the HikariDataSource.",
        "Benefits: single responsibility, easier testing (mock the DAO), reusable in console, servlet and Spring apps.",
        "Return Optional<Student> from findById to avoid null checks."
      ]
    }
  ],
  examples: [
    {
      title: "SQL script and pom.xml for today",
      scenario: "Create an accounts table for the transaction demo and add HikariCP plus a simple logger to the Maven project.",
      steps: [
        "Run the SQL part in MySQL Workbench (New Query Tab > paste > Execute)",
        "Open pom.xml of jdbc-demo and replace the <dependencies> section with the one below",
        "Eclipse: right-click project > Maven > Update Project > OK. IntelliJ: click the 'Load Maven Changes' icon",
        "Confirm HikariCP-5.1.0.jar appears under Maven Dependencies / External Libraries"
      ],
      code: `-- ===== SQL =====
USE college_db;
DROP TABLE IF EXISTS accounts;
CREATE TABLE accounts (
    acc_no  INT PRIMARY KEY,
    holder  VARCHAR(50) NOT NULL,
    balance DECIMAL(10,2) NOT NULL CHECK (balance >= 0)
) ENGINE = InnoDB;

INSERT INTO accounts VALUES
(101, 'Asha', 5000.00),
(102, 'Ravi', 2000.00);

<!-- ===== pom.xml dependencies ===== -->
<dependencies>
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <version>8.4.0</version>
    </dependency>
    <dependency>
        <groupId>com.zaxxer</groupId>
        <artifactId>HikariCP</artifactId>
        <version>5.1.0</version>
    </dependency>
    <!-- HikariCP logs through SLF4J; this simple binding prints logs to the console -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-simple</artifactId>
        <version>2.0.13</version>
    </dependency>
</dependencies>`,
      result: "accounts table: 101 Asha 5000.00, 102 Ravi 2000.00. Maven downloads HikariCP-5.1.0.jar, slf4j-api and slf4j-simple.",
      explanation: "The CHECK constraint (enforced from MySQL 8.0.16) makes the balance unable to go negative, which we use to trigger a failure. HikariCP 5.x needs Java 11+."
    },
    {
      title: "Bank transfer with commit and rollback",
      scenario: "Transfer money between two accounts. A valid transfer commits; a transfer larger than the balance fails on the CHECK constraint and is rolled back, so no money is lost.",
      steps: [
        "Create class TransferDemo in jdbc-demo",
        "Type the code and run it",
        "Check SELECT * FROM accounts in Workbench: Asha 4000.00, Ravi 3000.00 (only the first transfer was saved)"
      ],
      code: `import java.math.BigDecimal;
import java.sql.*;

public class TransferDemo {
    static final String URL = "jdbc:mysql://localhost:3306/college_db";

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "root", "root")) {
            transfer(con, 101, 102, new BigDecimal("1000"));   // valid
            transfer(con, 102, 101, new BigDecimal("9000"));   // more than Ravi has
            printBalances(con);
        }
    }

    static void transfer(Connection con, int from, int to, BigDecimal amt) throws SQLException {
        String credit = "UPDATE accounts SET balance = balance + ? WHERE acc_no = ?";
        String debit  = "UPDATE accounts SET balance = balance - ? WHERE acc_no = ?";
        con.setAutoCommit(false);                      // start transaction
        try (PreparedStatement c = con.prepareStatement(credit);
             PreparedStatement d = con.prepareStatement(debit)) {

            c.setBigDecimal(1, amt);
            c.setInt(2, to);
            c.executeUpdate();                         // credit first

            d.setBigDecimal(1, amt);
            d.setInt(2, from);
            d.executeUpdate();                         // fails if balance < 0

            con.commit();
            System.out.println("Transfer of " + amt + " from " + from + " to " + to + " committed");
        } catch (SQLException e) {
            con.rollback();
            System.out.println("Transfer of " + amt + " failed, rolled back: " + e.getMessage());
        } finally {
            con.setAutoCommit(true);
        }
    }

    static void printBalances(Connection con) throws SQLException {
        try (Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT * FROM accounts ORDER BY acc_no")) {
            while (rs.next()) {
                System.out.println(rs.getInt("acc_no") + " " + rs.getString("holder")
                        + " " + rs.getBigDecimal("balance"));
            }
        }
    }
}`,
      result: "Transfer of 1000 from 101 to 102 committed\nTransfer of 9000 from 102 to 101 failed, rolled back: Check constraint 'accounts_chk_1' is violated.\n101 Asha 4000.00\n102 Ravi 3000.00",
      explanation: "In the second transfer the credit to Asha succeeded first, then the debit failed. Without a transaction Asha would have received 9000 out of nowhere. rollback() undid the credit, so balances remain consistent. BigDecimal is used for money because double has rounding errors."
    },
    {
      title: "Savepoint: partial rollback",
      scenario: "Register a student and their fee account in one transaction; an optional scholarship step fails, but we keep the earlier work by rolling back only to a savepoint.",
      steps: [
        "Create class SavepointDemo",
        "Run the Day 4 reset script first so the outputs match",
        "Type the code and run it"
      ],
      code: `import java.sql.*;

public class SavepointDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root")) {
            con.setAutoCommit(false);
            try (Statement st = con.createStatement()) {
                st.executeUpdate("INSERT INTO students(name,email,course,marks) "
                        + "VALUES('Zoya','zoya@mail.com','Java',84)");
                st.executeUpdate("INSERT INTO accounts VALUES (103, 'Zoya', 500.00)");

                Savepoint sp = con.setSavepoint("beforeScholarship");
                try {
                    // fails: balance would become negative
                    st.executeUpdate("UPDATE accounts SET balance = balance - 1000 WHERE acc_no = 103");
                } catch (SQLException e) {
                    System.out.println("Scholarship step failed, rolling back to savepoint");
                    con.rollback(sp);
                }
                con.commit();
                System.out.println("Student and account saved");
            } catch (SQLException e) {
                con.rollback();
                System.out.println("Everything rolled back: " + e.getMessage());
            }
            try (Statement st = con.createStatement();
                 ResultSet rs = st.executeQuery("SELECT balance FROM accounts WHERE acc_no = 103")) {
                rs.next();
                System.out.println("Zoya balance: " + rs.getBigDecimal(1));
            }
        }
    }
}`,
      result: "Scholarship step failed, rolling back to savepoint\nStudent and account saved\nZoya balance: 500.00",
      explanation: "rollback(sp) undoes only the work after the savepoint; the two INSERTs before it remain and are committed. Running the program a second time goes to the outer catch because of the duplicate email and acc_no, and everything is rolled back."
    },
    {
      title: "HikariCP connection pool: DBUtil with a DataSource",
      scenario: "Replace DriverManager with a pooled DataSource and see that 'closing' a pooled connection just returns it.",
      steps: [
        "Create class DBUtil and class PoolDemo in src/main/java",
        "Type the code and run PoolDemo",
        "Observe the HikariPool log lines printed by slf4j-simple (shown in red in Eclipse because they go to System.err)"
      ],
      code: `// ===== DBUtil.java =====
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.SQLException;

public final class DBUtil {
    private static final HikariDataSource DS;

    static {
        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl("jdbc:mysql://localhost:3306/college_db");
        cfg.setUsername("root");
        cfg.setPassword("root");
        cfg.setMaximumPoolSize(5);
        cfg.setMinimumIdle(2);
        cfg.setConnectionTimeout(10000);
        cfg.setPoolName("CollegePool");
        cfg.addDataSourceProperty("cachePrepStmts", "true");
        cfg.addDataSourceProperty("prepStmtCacheSize", "250");
        DS = new HikariDataSource(cfg);
    }

    private DBUtil() { }

    public static Connection getConnection() throws SQLException {
        return DS.getConnection();
    }

    public static void shutdown() {
        DS.close();
    }
}

// ===== PoolDemo.java =====
import java.sql.*;

public class PoolDemo {
    public static void main(String[] args) throws SQLException {
        for (int i = 1; i <= 3; i++) {
            long t = System.nanoTime();
            try (Connection con = DBUtil.getConnection();
                 PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM students");
                 ResultSet rs = ps.executeQuery()) {
                rs.next();
                long ms = (System.nanoTime() - t) / 1_000_000;
                System.out.println("Request " + i + ": count=" + rs.getInt(1)
                        + ", connection class=" + con.getClass().getSimpleName()
                        + ", time=" + ms + " ms");
            }   // con.close() returns the connection to the pool
        }
        DBUtil.shutdown();
    }
}`,
      result: "[main] INFO com.zaxxer.hikari.HikariDataSource - CollegePool - Starting...\n[main] INFO com.zaxxer.hikari.HikariDataSource - CollegePool - Start completed.\nRequest 1: count=6, connection class=HikariProxyConnection, time=3 ms\nRequest 2: count=6, connection class=HikariProxyConnection, time=1 ms\nRequest 3: count=6, connection class=HikariProxyConnection, time=0 ms\n[main] INFO com.zaxxer.hikari.HikariDataSource - CollegePool - Shutdown initiated...\n[main] INFO com.zaxxer.hikari.HikariDataSource - CollegePool - Shutdown completed.\n\n(count is 6 after the reset script plus Zoya; times vary by machine)",
      explanation: "The pool opens connections once when the static block runs. Each getConnection() borrows an already-open connection wrapped in HikariProxyConnection; close() on the proxy returns it to the pool instead of disconnecting. That is why later requests are almost instant."
    },
    {
      title: "Complete DAO pattern: Student, StudentDao, StudentDaoImpl, Main",
      scenario: "Organise all student database code behind a DAO interface. This exact DAO is reused by the servlet days.",
      steps: [
        "Create classes Student, StudentDao (interface), StudentDaoImpl and Main in src/main/java (DBUtil from the previous example is reused)",
        "Eclipse: New > Interface for StudentDao; IntelliJ: New > Java Class > choose 'Interface' in the popup",
        "Run the Day 4 reset script, then run Main",
        "Tip: Eclipse Source > Generate Getters and Setters / IntelliJ Alt+Insert > Getter and Setter generates the boilerplate in Student"
      ],
      code: `// ===== Student.java (model) =====
public class Student {
    private int id;
    private String name;
    private String email;
    private String course;
    private Integer marks;

    public Student() { }

    public Student(String name, String email, String course, Integer marks) {
        this.name = name;
        this.email = email;
        this.course = course;
        this.marks = marks;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public Integer getMarks() { return marks; }
    public void setMarks(Integer marks) { this.marks = marks; }

    @Override
    public String toString() {
        return "Student[" + id + ", " + name + ", " + course + ", " + marks + "]";
    }
}

// ===== StudentDao.java (interface) =====
import java.util.List;
import java.util.Optional;

public interface StudentDao {
    int save(Student s);
    Optional<Student> findById(int id);
    List<Student> findAll();
    boolean update(Student s);
    boolean deleteById(int id);
}

// ===== StudentDaoImpl.java (JDBC implementation) =====
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class StudentDaoImpl implements StudentDao {

    private static final String INSERT = "INSERT INTO students(name, email, course, marks) VALUES (?, ?, ?, ?)";
    private static final String BY_ID  = "SELECT * FROM students WHERE id = ?";
    private static final String ALL    = "SELECT * FROM students ORDER BY id";
    private static final String UPDATE = "UPDATE students SET name=?, email=?, course=?, marks=? WHERE id=?";
    private static final String DELETE = "DELETE FROM students WHERE id = ?";

    @Override
    public int save(Student s) {
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(INSERT, Statement.RETURN_GENERATED_KEYS)) {
            fill(ps, s);
            ps.executeUpdate();
            try (ResultSet k = ps.getGeneratedKeys()) {
                if (k.next()) s.setId(k.getInt(1));
            }
            return s.getId();
        } catch (SQLException e) {
            throw new RuntimeException("save failed: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<Student> findById(int id) {
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(BY_ID)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(map(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<Student> findAll() {
        List<Student> list = new ArrayList<>();
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(ALL);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) list.add(map(rs));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return list;
    }

    @Override
    public boolean update(Student s) {
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(UPDATE)) {
            fill(ps, s);
            ps.setInt(5, s.getId());
            return ps.executeUpdate() == 1;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public boolean deleteById(int id) {
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(DELETE)) {
            ps.setInt(1, id);
            return ps.executeUpdate() == 1;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private void fill(PreparedStatement ps, Student s) throws SQLException {
        ps.setString(1, s.getName());
        ps.setString(2, s.getEmail());
        ps.setString(3, s.getCourse());
        if (s.getMarks() == null) ps.setNull(4, Types.INTEGER);
        else ps.setInt(4, s.getMarks());
    }

    private Student map(ResultSet rs) throws SQLException {
        Student s = new Student(rs.getString("name"), rs.getString("email"),
                rs.getString("course"), rs.getObject("marks", Integer.class));
        s.setId(rs.getInt("id"));
        return s;
    }
}

// ===== Main.java =====
public class Main {
    public static void main(String[] args) {
        StudentDao dao = new StudentDaoImpl();

        int id = dao.save(new Student("Isha", "isha@mail.com", "Spring", 79));
        System.out.println("Saved id: " + id);

        dao.findById(id).ifPresent(s -> System.out.println("Found: " + s));

        Student s = dao.findById(id).orElseThrow();
        s.setMarks(89);
        System.out.println("Updated: " + dao.update(s));

        System.out.println("All students:");
        dao.findAll().forEach(System.out::println);

        System.out.println("Deleted: " + dao.deleteById(id));
        System.out.println("Find after delete: " + dao.findById(id).isPresent());
        DBUtil.shutdown();
    }
}`,
      result: "Saved id: 6\nFound: Student[6, Isha, Spring, 79]\nUpdated: true\nAll students:\nStudent[1, Asha, Java, 88]\nStudent[2, Ravi, Python, 75]\nStudent[3, Meena, Java, 92]\nStudent[4, Kiran, React, 67]\nStudent[5, Suresh, Java, null]\nStudent[6, Isha, Spring, 89]\nDeleted: true\nFind after delete: false\n\n(HikariCP INFO log lines are also printed. Output assumes the Day 4 reset script was run just before.)",
      explanation: "Main never sees SQL, Connection or ResultSet; it only talks to the StudentDao interface. map() converts a row to an object and fill() converts an object to parameters, so each mapping lives in one place. Checked SQLException is wrapped in RuntimeException so callers are not forced to catch it (Spring does the same with DataAccessException)."
    }
  ],
  interview: [
    { q: "What is a transaction? Explain ACID.", a: "A unit of work that must fully succeed or fully fail. Atomicity (all or nothing), Consistency (valid state to valid state), Isolation (concurrent transactions do not interfere), Durability (committed data is permanent).", level: "Easy" },
    { q: "How do you manage transactions in JDBC?", a: "con.setAutoCommit(false), execute statements, con.commit() on success, con.rollback() in catch, and restore auto-commit in finally.", level: "Easy" },
    { q: "What is a Savepoint?", a: "A named marker inside a transaction created with con.setSavepoint(); con.rollback(savepoint) undoes only the changes made after it, keeping earlier work in the transaction.", level: "Medium" },
    { q: "What are dirty read, non-repeatable read and phantom read?", a: "Dirty: reading uncommitted changes of another transaction. Non-repeatable: same row read twice gives different values due to another committed update. Phantom: same query returns extra/missing rows due to another committed insert/delete.", level: "Medium" },
    { q: "What is the default isolation level in MySQL InnoDB?", a: "REPEATABLE READ.", level: "Medium" },
    { q: "What is connection pooling and why is it needed?", a: "Keeping a set of open connections that are reused. Creating a physical connection is slow; a pool gives ready connections quickly, limits the total number of connections and improves throughput in web apps.", level: "Easy" },
    { q: "What happens when you call close() on a connection from HikariCP?", a: "The physical connection is not closed; the proxy returns it to the pool (after resetting state like auto-commit) for reuse.", level: "Medium" },
    { q: "Difference between DriverManager and DataSource?", a: "DriverManager creates a new physical connection each call and is configured in code. DataSource is an interface implemented by pools (HikariCP) or the server (JNDI), supports pooling, and is the recommended way in enterprise apps.", level: "Medium" },
    { q: "What is the DAO pattern and its benefits?", a: "A design pattern that puts all persistence logic behind an interface (StudentDao) with an implementation (StudentDaoImpl). Benefits: separation of concerns, easy to switch DB technology, easier unit testing with mocks, reusable code.", level: "Easy" },
    { q: "Can DDL be rolled back in MySQL?", a: "No. DDL statements cause an implicit commit in MySQL, so CREATE/ALTER/DROP cannot be undone by rollback.", level: "Hard" },
    { q: "Which HikariCP settings are most important?", a: "jdbcUrl, username, password, maximumPoolSize, minimumIdle, connectionTimeout, idleTimeout and maxLifetime (should be a bit less than the database wait_timeout).", level: "Hard" },
    { q: "Why use BigDecimal instead of double for money?", a: "double is binary floating point and cannot represent many decimal fractions exactly (0.1 + 0.2 != 0.3), causing rounding errors. BigDecimal stores exact decimal values.", level: "Medium" }
  ],
  practice: [
    {
      task: "Write a method placeOrder(con, productId, qty) that, in one transaction, reduces stock in products and inserts a row in orders; roll back if stock is insufficient.",
      hint: "Check the update count of 'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?'; if 0, throw SQLException to trigger rollback.",
      solution: `import java.sql.*;

public class OrderService {
    // tables: products(id, name, price, stock), orders(id AUTO_INCREMENT, product_id, qty)
    public static void placeOrder(Connection con, int productId, int qty) throws SQLException {
        con.setAutoCommit(false);
        try (PreparedStatement upd = con.prepareStatement(
                     "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?");
             PreparedStatement ins = con.prepareStatement(
                     "INSERT INTO orders(product_id, qty) VALUES (?, ?)")) {
            upd.setInt(1, qty);
            upd.setInt(2, productId);
            upd.setInt(3, qty);
            if (upd.executeUpdate() == 0) {
                throw new SQLException("Insufficient stock");
            }
            ins.setInt(1, productId);
            ins.setInt(2, qty);
            ins.executeUpdate();
            con.commit();
            System.out.println("Order placed");
        } catch (SQLException e) {
            con.rollback();
            System.out.println("Order failed: " + e.getMessage());
        } finally {
            con.setAutoCommit(true);
        }
    }
}`
    },
    {
      task: "Wrap the Day 5 batch insert in a transaction so that if any row fails, no rows are inserted.",
      hint: "setAutoCommit(false) before addBatch; commit after executeBatch; rollback in catch (BatchUpdateException is a SQLException).",
      solution: `import java.sql.*;

public class AtomicBatch {
    public static void main(String[] args) throws SQLException {
        String[][] rows = { {"P1", "p1@mail.com"}, {"P2", "asha@mail.com"} };   // second is duplicate
        try (Connection con = DBUtil.getConnection()) {
            con.setAutoCommit(false);
            try (PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO students(name,email,course,marks) VALUES (?,?,'Java',60)")) {
                for (String[] r : rows) {
                    ps.setString(1, r[0]);
                    ps.setString(2, r[1]);
                    ps.addBatch();
                }
                ps.executeBatch();
                con.commit();
                System.out.println("All inserted");
            } catch (SQLException e) {
                con.rollback();
                System.out.println("Rolled back: " + e.getMessage());
            }
        }
    }
}`
    },
    {
      task: "Add two methods to StudentDao and StudentDaoImpl: List<Student> findByCourse(String course) and long count().",
      hint: "Reuse the private map() method; count uses SELECT COUNT(*).",
      solution: `// add to StudentDao
List<Student> findByCourse(String course);
long count();

// add to StudentDaoImpl
@Override
public List<Student> findByCourse(String course) {
    List<Student> list = new ArrayList<>();
    try (Connection con = DBUtil.getConnection();
         PreparedStatement ps = con.prepareStatement(
                 "SELECT * FROM students WHERE course = ? ORDER BY id")) {
        ps.setString(1, course);
        try (ResultSet rs = ps.executeQuery()) {
            while (rs.next()) list.add(map(rs));
        }
    } catch (SQLException e) {
        throw new RuntimeException(e);
    }
    return list;
}

@Override
public long count() {
    try (Connection con = DBUtil.getConnection();
         PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM students");
         ResultSet rs = ps.executeQuery()) {
        rs.next();
        return rs.getLong(1);
    } catch (SQLException e) {
        throw new RuntimeException(e);
    }
}`
    },
    {
      task: "Move the HikariCP settings out of code into a db.properties file in src/main/resources and load it in DBUtil.",
      hint: "new HikariConfig(\"/db.properties\") reads keys like jdbcUrl, username, password, maximumPoolSize from the classpath.",
      solution: `# ===== src/main/resources/db.properties =====
jdbcUrl=jdbc:mysql://localhost:3306/college_db
username=root
password=root
maximumPoolSize=5
poolName=CollegePool

// ===== DBUtil.java =====
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.SQLException;

public final class DBUtil {
    private static final HikariDataSource DS =
            new HikariDataSource(new HikariConfig("/db.properties"));

    private DBUtil() { }

    public static Connection getConnection() throws SQLException {
        return DS.getConnection();
    }

    public static void shutdown() {
        DS.close();
    }
}`
    }
  ],
  quiz: [
    { question: "Which call starts manual transaction control in JDBC?", options: ["con.beginTransaction()", "con.setAutoCommit(false)", "con.startTransaction(true)", "con.setTransaction()"], answer: 1, explanation: "Turning off auto-commit groups subsequent statements until commit() or rollback()." },
    { question: "Which ACID property guarantees 'all or nothing'?", options: ["Consistency", "Isolation", "Durability", "Atomicity"], answer: 3, explanation: "Atomicity means the transaction is indivisible." },
    { question: "What does close() do on a connection obtained from HikariCP?", options: ["Returns it to the pool", "Closes the TCP socket", "Shuts down the pool", "Commits the transaction"], answer: 0, explanation: "Pooled connections are proxies; close() hands them back for reuse." },
    { question: "Which isolation level prevents dirty, non-repeatable and phantom reads?", options: ["READ_COMMITTED", "REPEATABLE_READ", "SERIALIZABLE", "READ_UNCOMMITTED"], answer: 2, explanation: "SERIALIZABLE is the strictest level." },
    { question: "In the DAO pattern, which class contains SQL and JDBC code?", options: ["The model (Student)", "The DAO implementation (StudentDaoImpl)", "The Main / Servlet class", "The DAO interface"], answer: 1, explanation: "Only the implementation knows about JDBC; callers depend on the interface." }
  ]
};
