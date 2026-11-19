const ACCOUNTS = `CREATE TABLE accounts (
  acc_no  VARCHAR(10) PRIMARY KEY,
  holder  VARCHAR(50) NOT NULL,
  balance INT NOT NULL
);
INSERT INTO accounts VALUES
('A101', 'Asha Patil', 5000),
('A102', 'Rohan Mehta', 2000),
('A103', 'Sneha Kulkarni', 7500);`;

export default {
  lesson: 'day-06-transactions-pooling-dao',
  minutes: 25,
  intro: 'Make JDBC work all-or-nothing with commit and rollback, and check your understanding of isolation, HikariCP pooling and the DAO pattern.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'By default every JDBC statement is committed immediately. Complete the line that starts a manual transaction:\n`con.setAutoCommit(____);`',
      example: { title: 'the transaction skeleton', code: 'con.setAutoCommit(false);\ntry { /* several updates */ con.commit(); }\ncatch (SQLException e) { con.rollback(); }' },
      accept: ['false'],
      explain: 'With auto-commit **true** (the default) each statement is its own transaction, so a failure halfway leaves half the work saved. `setAutoCommit(false)` groups everything until you call `commit()` or `rollback()`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Accounts: **A101 = 5000**, **A102 = 2000**. `deposit` adds money; `withdraw` throws `SQLException("Insufficient balance")` if the balance is too low. What does the program print?',
      example: { title: 'rollback undoes everything since the last commit', code: 'update1(); update2(); // fails\ncon.rollback(); // update1 is undone too' },
      code: `static void transfer(Connection con, String from, String to, int amt) throws SQLException {
    con.setAutoCommit(false);
    try {
        deposit(con, to, amt);      // credit first
        withdraw(con, from, amt);   // may throw
        con.commit();
        System.out.println("Transferred " + amt);
    } catch (SQLException e) {
        con.rollback();
        System.out.println("Rolled back: " + e.getMessage());
    }
}

// main
transfer(con, "A101", "A102", 3000);
transfer(con, "A101", "A102", 2500);
System.out.println("A101 = " + balance(con, "A101"));
System.out.println("A102 = " + balance(con, "A102"));`,
      expected: 'Transferred 3000\nRolled back: Insufficient balance\nA101 = 2000\nA102 = 5000',
      explain: 'Transfer 1 succeeds: A101 5000→2000, A102 2000→5000. Transfer 2 first deposits 2500 into A102 (7500), then withdraw fails because A101 has only 2000. `rollback()` undoes the deposit too, so A102 is back to 5000. That is **atomicity**: all or nothing.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the **default isolation level** of MySQL InnoDB?',
      options: ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'],
      answer: 2,
      explain: 'MySQL InnoDB defaults to **REPEATABLE READ** (Oracle and SQL Server default to READ COMMITTED). It prevents dirty reads and non-repeatable reads. You can change it per connection with `con.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED)`.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Write the SQL a transfer transaction sends: move **1500** from **A103** (Sneha) to **A101** (Asha) inside one transaction and commit it.',
      example: { title: 'a transaction in SQL', code: "START TRANSACTION;\nUPDATE wallet SET amount = amount - 100 WHERE id = 1;\nUPDATE wallet SET amount = amount + 100 WHERE id = 2;\nCOMMIT;" },
      setup: ACCOUNTS,
      starter: 'START TRANSACTION;\n-- two UPDATEs\nCOMMIT;\n',
      solution: "START TRANSACTION;\nUPDATE accounts SET balance = balance - 1500 WHERE acc_no = 'A103';\nUPDATE accounts SET balance = balance + 1500 WHERE acc_no = 'A101';\nCOMMIT;",
      check: 'SELECT acc_no, balance FROM accounts ORDER BY acc_no;',
      explain: 'Both UPDATEs belong to one unit of work: A103 goes 7500→6000 and A101 5000→6500, so the total money in the bank stays the same. In JDBC, `setAutoCommit(false)` plays the role of START TRANSACTION and `con.commit()` the role of COMMIT.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Your app uses a **HikariCP** pool. Which statements are TRUE? (choose all that apply)',
      options: [
        'Opening a physical database connection is slow, so a pool keeps ready connections and lends them out',
        'Calling con.close() on a pooled connection returns it to the pool instead of closing the socket',
        'maximumPoolSize limits how many connections the pool opens to MySQL',
        'The application should create a new HikariDataSource for every request',
        'With a pool you no longer need try-with-resources',
      ],
      answers: [0, 1, 2],
      explain: 'Create **one** `HikariDataSource` for the whole application and borrow connections with `ds.getConnection()`. You must still close them (try-with-resources), otherwise the pool runs dry and requests wait until `connectionTimeout`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In the **DAO pattern**, what does `StudentDao` contain?',
      options: [
        'HTML for displaying students',
        'Only the JDBC/SQL code to save, find, update and delete Student objects, hidden behind an interface',
        'The main() method of the application',
        'Business rules such as calculating fees and sending emails',
      ],
      answer: 1,
      explain: 'A DAO (Data Access Object) isolates **database access**: e.g. `interface StudentDao { void save(Student s); Student findById(int id); List<Student> findAll(); }` with a `StudentDaoImpl` that uses JDBC. The rest of the code works with Student objects and never sees SQL, so you can swap JDBC for Hibernate later.',
    },
  ],
};
