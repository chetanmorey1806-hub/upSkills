export default {
  id: "day-03-preparedstatement-sql-injection",
  title: "PreparedStatement and SQL Injection",
  module: "Module 1: JDBC",
  day: 3,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Understand how SQL injection attacks work against Statement-based code and how PreparedStatement with ? placeholders prevents them, while also giving better performance and cleaner code for CRUD operations.",
  objectives: [
    "Explain SQL injection with a real login example",
    "Use PreparedStatement with ? placeholders and setXxx methods",
    "Perform parameterized INSERT, SELECT, UPDATE and DELETE",
    "Retrieve auto-generated keys after an INSERT",
    "Compare Statement and PreparedStatement for interviews"
  ],
  theory: [
    {
      heading: "What is SQL Injection?",
      content: "SQL injection is an attack where a user types SQL code into an input field and, because the program glues that input directly into a SQL string, the database executes the attacker's code. Analogy: a bank form says 'Pay ____ rupees to Ravi'. If the clerk copies whatever you write blindly, you could write '10 rupees to Ravi and 1 lakh to me'. The clerk (database) cannot tell which part was the original instruction and which part came from you.\n\nVulnerable code:\nString sql = \"SELECT * FROM users WHERE username='\" + u + \"' AND password='\" + p + \"'\";\n\nIf the user types password:  ' OR '1'='1\nThe final SQL becomes:\nSELECT * FROM users WHERE username='admin' AND password='' OR '1'='1'\nSince '1'='1' is always true, the query returns rows and the attacker logs in without a password.",
      points: [
        "Other payloads: admin' --  (comments out the password check), '; DROP TABLE users; -- (on drivers that allow multiple statements).",
        "Consequences: login bypass, data theft, data deletion, full server compromise.",
        "SQL injection is in the OWASP Top 10 under 'Injection'."
      ],
      tip: "Never build SQL with + and user input. Always use PreparedStatement (or an ORM that uses it internally)."
    },
    {
      heading: "PreparedStatement: Precompiled, Parameterized SQL",
      content: "PreparedStatement (sub-interface of Statement) is created with SQL that contains ? placeholders. The SQL is sent to the database once and compiled into an execution plan. Values are sent separately and are always treated as DATA, never as SQL code, so injection becomes impossible. Analogy: the form now has fixed printed text and locked boxes; whatever you write in a box is only a value.",
      syntax: "String sql = \"INSERT INTO students(name, email, course, marks) VALUES (?, ?, ?, ?)\";\nPreparedStatement ps = con.prepareStatement(sql);\nps.setString(1, \"Neha\");     // first ?\nps.setString(2, \"neha@mail.com\");\nps.setString(3, \"Java\");\nps.setInt(4, 81);              // fourth ?\nint rows = ps.executeUpdate();",
      points: [
        "Parameter indexes start at 1, from left to right.",
        "setString automatically adds quotes and escapes special characters; you never write quotes around ?.",
        "Same PreparedStatement can be executed many times with different values (just call setXxx again).",
        "executeQuery / executeUpdate / execute on PreparedStatement take NO argument."
      ]
    },
    {
      heading: "setXxx Methods and Data Types",
      content: "Use the setter that matches the column type.",
      points: [
        "setInt, setLong, setDouble, setBigDecimal for numbers",
        "setString for VARCHAR/CHAR/TEXT",
        "setBoolean for BOOLEAN/TINYINT(1)",
        "setDate(java.sql.Date), setTimestamp(java.sql.Timestamp); convert from LocalDate with java.sql.Date.valueOf(localDate)",
        "setObject(index, value) works for most types including LocalDate in JDBC 4.2",
        "setNull(index, java.sql.Types.INTEGER) to insert SQL NULL",
        "clearParameters() clears all values that were set"
      ],
      tip: "You cannot use ? for table names, column names or SQL keywords (ORDER BY ? will not sort by that column). Placeholders are only for values. For dynamic column names, validate against a whitelist."
    },
    {
      heading: "Getting Auto-Generated Keys",
      content: "After inserting a row into a table with AUTO_INCREMENT id, you often need the new id (e.g. to show 'Registration ID 7'). Pass Statement.RETURN_GENERATED_KEYS when preparing the statement and read the keys after executing.",
      syntax: "PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);\nps.executeUpdate();\nResultSet keys = ps.getGeneratedKeys();\nif (keys.next()) { int newId = keys.getInt(1); }"
    },
    {
      heading: "Statement vs PreparedStatement",
      content: "A side-by-side comparison you should be able to say in an interview.",
      points: [
        "SQL injection: Statement is vulnerable; PreparedStatement is safe.",
        "Compilation: Statement SQL is parsed every time; PreparedStatement is precompiled and the plan can be reused (faster for repeated execution).",
        "Parameters: Statement uses string concatenation; PreparedStatement uses ? and setXxx.",
        "Readability: PreparedStatement has no messy quote handling.",
        "Binary data: PreparedStatement supports setBlob/setBinaryStream for images and files.",
        "Use Statement only for fixed DDL like CREATE TABLE; use PreparedStatement for everything with input."
      ],
      tip: "MySQL tip: add useServerPrepStmts=true&cachePrepStmts=true to the URL to make the driver use real server-side prepared statements and cache them."
    }
  ],
  examples: [
    {
      title: "SQL script: users table for the login demo",
      scenario: "Create a users table that we will attack and then protect.",
      steps: [
        "Open MySQL Workbench > File > New Query Tab",
        "Paste the script and click Execute (lightning icon)",
        "Confirm the two users appear in the result grid"
      ],
      code: `USE college_db;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL
);

INSERT INTO users (username, password) VALUES
('admin', 'admin@123'),
('ravi',  'ravi@456');

SELECT * FROM users;`,
      result: "+----+----------+-----------+\n| id | username | password  |\n+----+----------+-----------+\n|  1 | admin    | admin@123 |\n|  2 | ravi     | ravi@456  |\n+----+----------+-----------+",
      explanation: "Passwords are stored as plain text here only for learning. Real applications store a hash (e.g. BCrypt), which you will see in Spring Security."
    },
    {
      title: "Vulnerable login with Statement (SQL injection attack)",
      scenario: "A login check that concatenates user input. Enter a wrong password containing ' OR '1'='1 and get logged in.",
      steps: [
        "In the jdbc-demo project create class UnsafeLogin",
        "Run it. Username: admin. Password: ' OR '1'='1",
        "Notice 'Login successful' even though the password is wrong",
        "Look at the printed SQL to see exactly why"
      ],
      code: `import java.sql.*;
import java.util.Scanner;

public class UnsafeLogin {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Username: ");
        String u = sc.nextLine();
        System.out.print("Password: ");
        String p = sc.nextLine();

        String sql = "SELECT * FROM users WHERE username='" + u
                   + "' AND password='" + p + "'";
        System.out.println("SQL sent: " + sql);

        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {

            if (rs.next()) {
                System.out.println("Login successful. Welcome " + rs.getString("username"));
            } else {
                System.out.println("Invalid username or password");
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "Username: admin\nPassword: ' OR '1'='1\nSQL sent: SELECT * FROM users WHERE username='admin' AND password='' OR '1'='1'\nLogin successful. Welcome admin",
      explanation: "AND has higher priority than OR, so the WHERE becomes (username='admin' AND password='') OR ('1'='1'). The second part is true for every row, so rows come back and the first row (admin) is used. The attacker never knew the password."
    },
    {
      title: "Safe login with PreparedStatement",
      scenario: "The same login rewritten with ? placeholders. The attack string is now just a wrong password.",
      steps: [
        "Create class SafeLogin",
        "Run with Username: admin, Password: ' OR '1'='1 -> login fails",
        "Run again with Username: admin, Password: admin@123 -> login succeeds"
      ],
      code: `import java.sql.*;
import java.util.Scanner;

public class SafeLogin {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Username: ");
        String u = sc.nextLine();
        System.out.print("Password: ");
        String p = sc.nextLine();

        String sql = "SELECT username FROM users WHERE username = ? AND password = ?";

        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, u);
            ps.setString(2, p);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    System.out.println("Login successful. Welcome " + rs.getString("username"));
                } else {
                    System.out.println("Invalid username or password");
                }
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "Username: admin\nPassword: ' OR '1'='1\nInvalid username or password\n\n(With password admin@123: Login successful. Welcome admin)",
      explanation: "The whole text ' OR '1'='1 is sent as a single string value for the second ?. MySQL compares password with that literal text, finds no match, and returns no rows. The structure of the SQL can no longer be changed by input."
    },
    {
      title: "Parameterized INSERT with generated key, UPDATE and DELETE",
      scenario: "Register a new student, print the new id, update the student's marks and finally delete the student, all with PreparedStatement.",
      steps: [
        "Create class PreparedCrud",
        "Type the code and run it",
        "Check the students table in Workbench after each run (the inserted row is deleted at the end)"
      ],
      code: `import java.sql.*;

public class PreparedCrud {
    static final String URL = "jdbc:mysql://localhost:3306/college_db";

    public static void main(String[] args) {
        try (Connection con = DriverManager.getConnection(URL, "root", "root")) {

            // CREATE
            String insert = "INSERT INTO students(name, email, course, marks) VALUES (?, ?, ?, ?)";
            int newId;
            try (PreparedStatement ps = con.prepareStatement(insert, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, "O'Brien");          // apostrophe handled automatically
                ps.setString(2, "obrien@mail.com");
                ps.setString(3, "Spring");
                ps.setInt(4, 70);
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    keys.next();
                    newId = keys.getInt(1);
                }
            }
            System.out.println("Inserted with id > 0: " + (newId > 0));

            // UPDATE
            try (PreparedStatement ps = con.prepareStatement(
                    "UPDATE students SET marks = ? WHERE id = ?")) {
                ps.setInt(1, 95);
                ps.setInt(2, newId);
                System.out.println("Updated rows: " + ps.executeUpdate());
            }

            // READ
            try (PreparedStatement ps = con.prepareStatement(
                    "SELECT name, marks FROM students WHERE id = ?")) {
                ps.setInt(1, newId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        System.out.println(rs.getString("name") + " has " + rs.getInt("marks"));
                    }
                }
            }

            // DELETE
            try (PreparedStatement ps = con.prepareStatement("DELETE FROM students WHERE id = ?")) {
                ps.setInt(1, newId);
                System.out.println("Deleted rows: " + ps.executeUpdate());
            }

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "Inserted with id > 0: true\nUpdated rows: 1\nO'Brien has 95\nDeleted rows: 1",
      explanation: "The name O'Brien contains a single quote that would break concatenated SQL; setString escapes it automatically. RETURN_GENERATED_KEYS gives back the AUTO_INCREMENT id. We print a boolean instead of the id itself because the exact id depends on how many rows you inserted before."
    },
    {
      title: "Reusing one PreparedStatement in a loop and setting NULL",
      scenario: "Insert several students from an array with a single precompiled statement; one student has unknown marks (NULL).",
      steps: [
        "Create class BulkInsert",
        "Type the code and run it once (running twice will fail on the UNIQUE email)",
        "Run SELECT * FROM students WHERE email LIKE '%@uni.com' in Workbench"
      ],
      code: `import java.sql.*;

public class BulkInsert {
    public static void main(String[] args) {
        String[][] data = {
            {"Arjun",  "arjun@uni.com",  "Java",   "78"},
            {"Divya",  "divya@uni.com",  "Python", "85"},
            {"Farhan", "farhan@uni.com", "Java",   null}
        };
        String sql = "INSERT INTO students(name, email, course, marks) VALUES (?, ?, ?, ?)";

        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             PreparedStatement ps = con.prepareStatement(sql)) {

            int total = 0;
            for (String[] s : data) {
                ps.setString(1, s[0]);
                ps.setString(2, s[1]);
                ps.setString(3, s[2]);
                if (s[3] == null) {
                    ps.setNull(4, Types.INTEGER);
                } else {
                    ps.setInt(4, Integer.parseInt(s[3]));
                }
                total += ps.executeUpdate();
            }
            System.out.println(total + " students inserted");
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "3 students inserted",
      explanation: "The SQL is compiled once and executed three times with new values. setNull stores SQL NULL in marks. When you read it back, rs.getInt returns 0 for NULL, so use rs.wasNull() or rs.getObject(\"marks\", Integer.class) to detect it."
    }
  ],
  interview: [
    { q: "What is SQL injection?", a: "An attack where malicious SQL is inserted through user input that is concatenated into a query, changing the query's meaning, e.g. ' OR '1'='1 to bypass login.", level: "Easy" },
    { q: "How does PreparedStatement prevent SQL injection?", a: "The SQL structure with ? placeholders is compiled first; values are sent separately as parameters and are always treated as data, never parsed as SQL, so input cannot change the query.", level: "Medium" },
    { q: "Difference between Statement and PreparedStatement?", a: "PreparedStatement is precompiled, parameterized with ?, safe from SQL injection, faster for repeated execution and supports binary data. Statement concatenates static SQL and is compiled each time.", level: "Easy" },
    { q: "Can you use ? for a table name or column name?", a: "No. Placeholders only bind values. Table/column names must be in the SQL text; validate them against a whitelist if they are dynamic.", level: "Medium" },
    { q: "How do you insert NULL with PreparedStatement?", a: "ps.setNull(index, java.sql.Types.XXX), e.g. setNull(4, Types.INTEGER). setObject(index, null) also works with most drivers.", level: "Medium" },
    { q: "How do you get the auto-generated id after insert?", a: "Prepare with con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS), call executeUpdate(), then read ps.getGeneratedKeys().", level: "Medium" },
    { q: "Is PreparedStatement a class or interface? What is its parent?", a: "An interface in java.sql that extends Statement. CallableStatement extends PreparedStatement.", level: "Easy" },
    { q: "What happens if you forget to set one parameter?", a: "SQLException: No value specified for parameter n.", level: "Medium" },
    { q: "Why can a PreparedStatement be faster than Statement?", a: "The database parses and plans the SQL once; repeated executions only send new values and reuse the plan. Combined with statement caching this reduces CPU and network work.", level: "Hard" },
    { q: "Does using PreparedStatement guarantee no SQL injection anywhere?", a: "Only for the values bound through ?. If you still concatenate input into the SQL string (e.g. for ORDER BY column or LIKE patterns built wrongly), injection is possible. Bind everything that comes from users.", level: "Hard" }
  ],
  practice: [
    {
      task: "Write a search program that asks for a course name and prints matching students using PreparedStatement.",
      hint: "SELECT ... WHERE course = ? and ps.setString(1, course).",
      solution: `import java.sql.*;
import java.util.Scanner;

public class SearchByCourse {
    public static void main(String[] args) throws SQLException {
        System.out.print("Course: ");
        String course = new Scanner(System.in).nextLine();
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             PreparedStatement ps = con.prepareStatement(
                     "SELECT id, name, marks FROM students WHERE course = ?")) {
            ps.setString(1, course);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    System.out.println(rs.getInt(1) + " " + rs.getString(2) + " " + rs.getInt(3));
                }
            }
        }
    }
}`
    },
    {
      task: "Search students whose name contains a given text (LIKE) safely.",
      hint: "Keep the SQL as 'WHERE name LIKE ?' and put the % signs in the value: setString(1, \"%\" + text + \"%\").",
      solution: `import java.sql.*;
import java.util.Scanner;

public class NameSearch {
    public static void main(String[] args) throws SQLException {
        System.out.print("Name contains: ");
        String text = new Scanner(System.in).nextLine();
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             PreparedStatement ps = con.prepareStatement(
                     "SELECT name, email FROM students WHERE name LIKE ?")) {
            ps.setString(1, "%" + text + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    System.out.println(rs.getString("name") + " <" + rs.getString("email") + ">");
                }
            }
        }
    }
}`
    },
    {
      task: "Write a user registration program that inserts a username and password into users using PreparedStatement and prints the generated id. Handle duplicate usernames gracefully.",
      hint: "Catch SQLIntegrityConstraintViolationException before SQLException.",
      solution: `import java.sql.*;
import java.util.Scanner;

public class Register {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Username: "); String u = sc.nextLine();
        System.out.print("Password: "); String p = sc.nextLine();
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             PreparedStatement ps = con.prepareStatement(
                     "INSERT INTO users(username, password) VALUES (?, ?)",
                     Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, u);
            ps.setString(2, p);
            ps.executeUpdate();
            try (ResultSet k = ps.getGeneratedKeys()) {
                if (k.next()) System.out.println("Registered with id " + k.getInt(1));
            }
        } catch (SQLIntegrityConstraintViolationException e) {
            System.out.println("Username already taken");
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`
    },
    {
      task: "Rewrite the Day 2 menu-driven StudentCrudApp so that every operation uses PreparedStatement.",
      hint: "Prepare four statements (insert, select, update, delete) once before the loop and reuse them.",
      solution: `import java.sql.*;
import java.util.Scanner;

public class SafeCrudApp {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             PreparedStatement ins = con.prepareStatement(
                     "INSERT INTO students(name,email,course,marks) VALUES(?,?,?,?)");
             PreparedStatement sel = con.prepareStatement("SELECT * FROM students");
             PreparedStatement upd = con.prepareStatement("UPDATE students SET marks=? WHERE id=?");
             PreparedStatement del = con.prepareStatement("DELETE FROM students WHERE id=?")) {
            while (true) {
                System.out.println("1.Add 2.List 3.Update 4.Delete 5.Exit");
                int ch = Integer.parseInt(sc.nextLine());
                if (ch == 1) {
                    System.out.print("Name: ");   ins.setString(1, sc.nextLine());
                    System.out.print("Email: ");  ins.setString(2, sc.nextLine());
                    System.out.print("Course: "); ins.setString(3, sc.nextLine());
                    System.out.print("Marks: ");  ins.setInt(4, Integer.parseInt(sc.nextLine()));
                    System.out.println(ins.executeUpdate() + " added");
                } else if (ch == 2) {
                    try (ResultSet rs = sel.executeQuery()) {
                        while (rs.next()) System.out.println(rs.getInt("id") + " "
                                + rs.getString("name") + " " + rs.getInt("marks"));
                    }
                } else if (ch == 3) {
                    System.out.print("Id: ");    int id = Integer.parseInt(sc.nextLine());
                    System.out.print("Marks: "); int m = Integer.parseInt(sc.nextLine());
                    upd.setInt(1, m); upd.setInt(2, id);
                    System.out.println(upd.executeUpdate() == 1 ? "Updated" : "Not found");
                } else if (ch == 4) {
                    System.out.print("Id: ");
                    del.setInt(1, Integer.parseInt(sc.nextLine()));
                    System.out.println(del.executeUpdate() == 1 ? "Deleted" : "Not found");
                } else {
                    break;
                }
            }
        } catch (SQLException e) {
            System.out.println("DB error: " + e.getMessage());
        }
    }
}`
    }
  ],
  quiz: [
    { question: "Which input bypasses the vulnerable login query in today's example?", options: ["admin123", "' OR '1'='1", "NULL", "SELECT *"], answer: 1, explanation: "It turns the WHERE clause into a condition that is always true." },
    { question: "How are PreparedStatement parameters numbered?", options: ["From 0", "From the right", "From 1, left to right", "By column name only"], answer: 2, explanation: "The first ? is index 1." },
    { question: "Which statement about PreparedStatement is FALSE?", options: ["It extends Statement", "It is precompiled", "It prevents SQL injection for bound values", "It allows ? for table names"], answer: 3, explanation: "Placeholders can only stand for values, not identifiers like table names." },
    { question: "How do you retrieve an AUTO_INCREMENT id after an insert?", options: ["RETURN_GENERATED_KEYS and getGeneratedKeys()", "rs.getId()", "ps.getLastId()", "con.getAutoId()"], answer: 0, explanation: "Pass Statement.RETURN_GENERATED_KEYS while preparing, then call getGeneratedKeys()." },
    { question: "What happens when ps.executeQuery() runs but parameter 2 was never set?", options: ["NULL is used", "SQLException: No value specified for parameter 2", "It returns an empty ResultSet", "Compile-time error"], answer: 1, explanation: "Every placeholder must have a value before execution." }
  ]
};
