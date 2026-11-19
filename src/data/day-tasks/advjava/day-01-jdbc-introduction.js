const STUDENTS = `CREATE TABLE students (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(50)  NOT NULL,
  email  VARCHAR(100) NOT NULL UNIQUE,
  course VARCHAR(50)  NOT NULL,
  marks  INT DEFAULT 0
);
INSERT INTO students (name, email, course, marks) VALUES
('Asha Patil', 'asha@gmail.com', 'Java', 88),
('Rohan Mehta', 'rohan@gmail.com', 'Python', 72),
('Sneha Kulkarni', 'sneha@gmail.com', 'Java', 65);`;

export default {
  lesson: 'day-01-jdbc-introduction',
  minutes: 20,
  intro: 'Check what JDBC is, how its architecture and driver types work, the MySQL URL and driver class, and prepare the college_db students table.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In the JDBC architecture, which component picks the right driver and gives your program a `Connection` object?',
      options: ['The JVM garbage collector', 'DriverManager', 'The MySQL Workbench', 'ResultSet'],
      answer: 1,
      explain: 'The flow is **Java application → JDBC API → DriverManager → JDBC driver → database**. `DriverManager.getConnection(url, user, pass)` asks every registered driver whether it understands the URL, and the matching driver (MySQL Connector/J for `jdbc:mysql:`) opens the connection. ResultSet only holds query results.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about the **four JDBC driver types** are TRUE? (choose all that apply)',
      options: [
        'Type 4 (thin driver) is written fully in Java and talks the database network protocol directly',
        'MySQL Connector/J (mysql-connector-j) is a Type 4 driver',
        'Type 1 (JDBC-ODBC bridge) was removed from the JDK in Java 8',
        'Type 2 drivers need no native library on the client machine',
        'Type 3 drivers always connect to the database without any middleware server',
      ],
      answers: [0, 1, 2],
      explain: 'Type 1 = JDBC-ODBC bridge (removed in Java 8), Type 2 = native-API (needs a native client library), Type 3 = network protocol driver that goes through a **middleware server**, Type 4 = pure Java thin driver that speaks the DB protocol directly. Almost every modern driver, including MySQL Connector/J, is Type 4.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Write the JDBC **URL** to connect to the MySQL database `college_db` running on your own computer on the default port.',
      example: { title: 'URL format', text: '`jdbc:<subprotocol>://<host>:<port>/<database>`, e.g. `jdbc:postgresql://localhost:5432/shop_db` for PostgreSQL.' },
      accept: ['jdbc:mysql://localhost:3306/college_db', 'jdbc:mysql://127.0.0.1:3306/college_db', 'jdbc:mysql://localhost/college_db', 'jdbc:mysql://127.0.0.1/college_db'],
      explain: 'MySQL URLs look like `jdbc:mysql://localhost:3306/college_db`: `jdbc` is the protocol, `mysql` tells DriverManager which driver to use, `localhost:3306` is host and port (3306 is MySQL\'s default), and `college_db` is the database. A common mistake is forgetting `jdbc:` or writing `http://`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the fully qualified **driver class name** of MySQL Connector/J 8+ (the one you would pass to `Class.forName(...)` in old code).',
      example: { title: 'another driver class', text: 'PostgreSQL: `org.postgresql.Driver` · Oracle: `oracle.jdbc.OracleDriver`' },
      accept: ['com.mysql.cj.jdbc.Driver', '"com.mysql.cj.jdbc.Driver"'],
      caseSensitive: true,
      explain: 'For Connector/J 8 and newer it is `com.mysql.cj.jdbc.Driver` (note the **cj**). The old `com.mysql.jdbc.Driver` is deprecated. Since JDBC 4.0 drivers on the classpath load automatically, so `Class.forName` is optional today.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'MySQL is running and the driver is on the classpath. What does this program print?',
      example: { title: 'try-with-resources closes automatically', code: 'try (Scanner sc = new Scanner(System.in)) {\n    System.out.println("open");\n} // sc.close() is called here\nSystem.out.println("after");' },
      code: `import java.sql.*;

public class FirstConnection {
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:mysql://localhost:3306/college_db";
        try (Connection con = DriverManager.getConnection(url, "root", "root123")) {
            System.out.println("Connected: " + !con.isClosed());
        }
        System.out.println("Done");
    }
}`,
      expected: 'Connected: true\nDone',
      explain: 'Inside the try block the connection is open, so `isClosed()` is false and `!false` prints **true**. At the end of the try block the connection is closed automatically, then "Done" is printed. If the URL, user or password were wrong, `getConnection` would throw an `SQLException` instead.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'The `students` table of `college_db` is ready (see setup). Before writing Java code, add yourself as a test row: insert a student **Meera Iyer**, email `meera@gmail.com`, course **Java**, marks **81**. Let MySQL generate the `id`.',
      example: { title: 'insert with auto-increment id', code: "INSERT INTO courses (title, fees) VALUES ('MySQL Basics', 4999);" },
      setup: STUDENTS,
      starter: '-- INSERT INTO students ...\n',
      solution: "INSERT INTO students (name, email, course, marks) VALUES ('Meera Iyer', 'meera@gmail.com', 'Java', 81);",
      check: 'SELECT id, name, email, course, marks FROM students ORDER BY id;',
      explain: 'Leave out the `id` column (or pass NULL) so `AUTO_INCREMENT` gives the next number (4). Listing the column names makes the INSERT safe even if the column order changes. Later, your JDBC program will send exactly this kind of SQL with `executeUpdate`.',
    },
  ],
};
