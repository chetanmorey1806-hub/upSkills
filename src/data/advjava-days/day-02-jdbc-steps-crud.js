export default {
  id: "day-02-jdbc-steps-crud",
  title: "JDBC Steps: Load Driver, Connection, Statement and CRUD Operations",
  module: "Module 1: JDBC",
  day: 2,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Master the standard steps of every JDBC program and use the Statement interface to perform Create, Read, Update and Delete operations on the students table, closing resources correctly with try-with-resources.",
  objectives: [
    "List and explain the steps of a JDBC program in order",
    "Use Statement methods executeQuery, executeUpdate and execute correctly",
    "Perform INSERT, SELECT, UPDATE and DELETE from Java",
    "Close Connection, Statement and ResultSet safely using try-with-resources",
    "Build a small menu-driven CRUD console application"
  ],
  theory: [
    {
      heading: "The Steps of Every JDBC Program",
      content: "Every JDBC program follows the same recipe, like making tea: get the kettle (driver), switch it on (connection), pour water (statement), boil (execute), serve (process result), and wash up (close).\n\n1. Load / register the driver (optional since JDBC 4.0): Class.forName(\"com.mysql.cj.jdbc.Driver\")\n2. Create a connection: DriverManager.getConnection(url, user, pass)\n3. Create a statement: con.createStatement()\n4. Execute the SQL: executeQuery / executeUpdate / execute\n5. Process the result: loop over ResultSet or check the row count\n6. Close resources: ResultSet, then Statement, then Connection (reverse order)",
      tip: "Remember the acronym L-C-S-E-P-C: Load, Connect, Statement, Execute, Process, Close."
    },
    {
      heading: "Statement Interface and its Three Execute Methods",
      content: "Statement is used to send static SQL (SQL text fully known at runtime with no parameters) to the database. It has three execute methods, and choosing the right one is a classic interview question.",
      syntax: "ResultSet rs = st.executeQuery(\"SELECT * FROM students\");    // SELECT only\nint rows    = st.executeUpdate(\"DELETE FROM students WHERE id=5\"); // INSERT/UPDATE/DELETE/DDL\nboolean isRs = st.execute(\"any SQL\");  // true if result is a ResultSet",
      points: [
        "executeQuery(String sql) returns ResultSet. Use for SELECT. Calling it with an INSERT throws SQLException.",
        "executeUpdate(String sql) returns int = number of rows affected. Use for INSERT, UPDATE, DELETE. For DDL like CREATE TABLE it returns 0.",
        "execute(String sql) returns boolean. true means a ResultSet is available (get it with getResultSet()); false means an update count (get it with getUpdateCount()). Use when SQL type is unknown at compile time.",
        "A Statement is created from a Connection: con.createStatement()."
      ]
    },
    {
      heading: "ResultSet Basics: the Cursor",
      content: "A ResultSet is like a table printed on paper with a finger (cursor) pointing just ABOVE the first row. Each call to rs.next() moves the finger down one row and returns true if there is a row, false when the rows are finished. You then read columns of the current row with getXxx methods using the column name or the column index (starting at 1, not 0).",
      syntax: "while (rs.next()) {\n    int id = rs.getInt(\"id\");        // by name\n    String name = rs.getString(2);   // by index (1-based)\n}",
      points: [
        "Column indexes start at 1.",
        "Calling getInt before next() throws SQLException: Before start of result set.",
        "Use getInt, getString, getDouble, getDate, getBoolean etc. matching the SQL type."
      ]
    },
    {
      heading: "CRUD Mapping: SQL to JDBC Method",
      content: "CRUD stands for Create, Read, Update and Delete, the four basic operations of every application (a student portal, a bank, a shop).",
      points: [
        "Create -> INSERT INTO students(...) VALUES(...) -> executeUpdate -> returns 1",
        "Read   -> SELECT ... FROM students -> executeQuery -> returns ResultSet",
        "Update -> UPDATE students SET marks=... WHERE id=... -> executeUpdate -> rows changed",
        "Delete -> DELETE FROM students WHERE id=... -> executeUpdate -> rows deleted",
        "MySQL auto-commits every statement by default (autoCommit = true), so changes are saved immediately."
      ],
      tip: "If executeUpdate returns 0 for an UPDATE/DELETE, no row matched the WHERE clause. Always check the count and inform the user."
    },
    {
      heading: "Closing Resources with try-with-resources",
      content: "Database connections are expensive and limited (MySQL default max_connections is 151). Forgetting to close them causes a 'Too many connections' error after some time, like leaving taps open until the tank is empty. Since Java 7, try-with-resources closes any AutoCloseable automatically, even if an exception occurs, in reverse order of creation. Connection, Statement and ResultSet are all AutoCloseable.",
      syntax: "try (Connection con = DriverManager.getConnection(url, u, p);\n     Statement st = con.createStatement();\n     ResultSet rs = st.executeQuery(sql)) {\n    while (rs.next()) { ... }\n} catch (SQLException e) {\n    e.printStackTrace();\n}",
      points: [
        "Closing a Statement automatically closes its ResultSet; closing a Connection closes its Statements, but close each explicitly anyway.",
        "Old style: close in a finally block with null checks; try-with-resources is shorter and safer."
      ]
    },
    {
      heading: "Limitations of Statement and Common Mistakes",
      content: "Statement builds SQL by string concatenation, e.g. \"... WHERE name='\" + name + \"'\". This is error-prone (missing quotes), slower (SQL compiled each time) and dangerous (SQL injection). Tomorrow we fix all three with PreparedStatement. Use Statement only for fixed SQL like DDL or a constant SELECT.",
      points: [
        "Forgetting single quotes around string values: VALUES(Asha) instead of VALUES('Asha') gives Unknown column 'Asha'.",
        "Using executeQuery for INSERT: SQLException 'Statement.executeQuery() cannot issue statements that do not produce result sets'.",
        "Reading column with wrong name: SQLException 'Column 'nme' not found'.",
        "Inserting a duplicate email: SQLIntegrityConstraintViolationException 'Duplicate entry'."
      ]
    }
  ],
  examples: [
    {
      title: "INSERT a student using Statement (Create)",
      scenario: "Add a new student 'Neha' to the students table created on Day 1.",
      steps: [
        "Use the jdbc-demo Maven project from Day 1 (mysql-connector-j already in pom.xml)",
        "Eclipse: right-click src/main/java > New > Class > InsertDemo. IntelliJ: right-click src/main/java > New > Java Class > InsertDemo",
        "Type the code, set your password, and run it (Run As > Java Application / green Run arrow)",
        "Verify in MySQL Workbench: SELECT * FROM students;"
      ],
      code: `import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class InsertDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/college_db";
        String sql = "INSERT INTO students (name, email, course, marks) "
                   + "VALUES ('Neha', 'neha@mail.com', 'Java', 81)";

        try (Connection con = DriverManager.getConnection(url, "root", "root");
             Statement st = con.createStatement()) {

            int rows = st.executeUpdate(sql);
            System.out.println(rows + " row inserted");

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "1 row inserted\n\n(Running it a second time prints: Error: Duplicate entry 'neha@mail.com' for key 'students.email')",
      explanation: "executeUpdate returns the number of affected rows, which is 1 for a single-row INSERT. The UNIQUE constraint on email makes the second run fail, showing how database errors arrive as SQLException."
    },
    {
      title: "SELECT all students (Read)",
      scenario: "Print every student in a neat table on the console.",
      steps: [
        "Create class SelectDemo in the same project",
        "Type the code and run it",
        "Compare the console output with SELECT * FROM students in Workbench"
      ],
      code: `import java.sql.*;

public class SelectDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/college_db";
        String sql = "SELECT id, name, course, marks FROM students ORDER BY id";

        try (Connection con = DriverManager.getConnection(url, "root", "root");
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {

            System.out.printf("%-4s %-8s %-8s %s%n", "ID", "NAME", "COURSE", "MARKS");
            int count = 0;
            while (rs.next()) {
                int id        = rs.getInt("id");
                String name   = rs.getString("name");
                String course = rs.getString("course");
                int marks     = rs.getInt("marks");
                System.out.printf("%-4d %-8s %-8s %d%n", id, name, course, marks);
                count++;
            }
            System.out.println("Total: " + count);

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}`,
      result: "ID   NAME     COURSE   MARKS\n1    Asha     Java     88\n2    Ravi     Python   75\n3    Meena    Java     92\n4    Kiran    React    67\n5    Suresh   Java     54\n6    Neha     Java     81\nTotal: 6",
      explanation: "rs.next() moves the cursor row by row and returns false after the last row, ending the loop. %-8s left-aligns text in 8 characters, %n prints a platform newline. Output assumes the Day 1 data plus Neha from the previous example."
    },
    {
      title: "UPDATE and DELETE (Update, Delete)",
      scenario: "Give Suresh 10 grace marks and delete student Kiran, then check how many rows each statement affected.",
      steps: [
        "Create class UpdateDeleteDemo",
        "Type the code and run it",
        "Run it again: the update still finds Suresh (marks become 74) but the delete finds nobody, so it prints 0"
      ],
      code: `import java.sql.*;

public class UpdateDeleteDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/college_db";

        try (Connection con = DriverManager.getConnection(url, "root", "root");
             Statement st = con.createStatement()) {

            int updated = st.executeUpdate(
                    "UPDATE students SET marks = marks + 10 WHERE name = 'Suresh'");
            System.out.println("Rows updated: " + updated);

            int deleted = st.executeUpdate(
                    "DELETE FROM students WHERE name = 'Kiran'");
            if (deleted == 0) {
                System.out.println("No student found to delete");
            } else {
                System.out.println("Rows deleted: " + deleted);
            }

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "Rows updated: 1\nRows deleted: 1\n\n(Second run: Rows updated: 1 / No student found to delete)",
      explanation: "One Statement object can execute many SQL commands one after another. The returned count tells you whether the WHERE clause matched. Suresh's marks go from 54 to 64."
    },
    {
      title: "Using execute() when the SQL type is unknown",
      scenario: "A mini SQL runner that accepts any SQL text and decides at runtime whether it returned rows or an update count.",
      steps: [
        "Create class SqlRunner",
        "Type the code and run it",
        "Change the array to add your own SQL commands"
      ],
      code: `import java.sql.*;

public class SqlRunner {
    public static void main(String[] args) {
        String[] commands = {
            "CREATE TABLE IF NOT EXISTS notes (id INT PRIMARY KEY, text VARCHAR(50))",
            "INSERT INTO notes VALUES (1, 'Learn JDBC')",
            "SELECT COUNT(*) FROM notes",
            "DROP TABLE notes"
        };
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             Statement st = con.createStatement()) {

            for (String sql : commands) {
                boolean hasResultSet = st.execute(sql);
                if (hasResultSet) {
                    try (ResultSet rs = st.getResultSet()) {
                        rs.next();
                        System.out.println("Query result: " + rs.getInt(1));
                    }
                } else {
                    System.out.println("Update count: " + st.getUpdateCount());
                }
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "Update count: 0\nUpdate count: 1\nQuery result: 1\nUpdate count: 0",
      explanation: "execute() returns true only for the SELECT. DDL commands (CREATE, DROP) report an update count of 0, the INSERT reports 1. getInt(1) reads the first column (COUNT(*))."
    },
    {
      title: "Menu-driven Student CRUD console application",
      scenario: "Combine all four operations into one program that a user drives from the keyboard.",
      steps: [
        "Create class StudentCrudApp",
        "Type the code and run it",
        "Enter 1 to add, 2 to list, 3 to update marks, 4 to delete, 5 to exit (input is typed in the Console / Run window)",
        "Note: this version uses Statement with string concatenation on purpose; Day 3 rewrites it safely with PreparedStatement"
      ],
      code: `import java.sql.*;
import java.util.Scanner;

public class StudentCrudApp {
    static final String URL = "jdbc:mysql://localhost:3306/college_db";

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        try (Connection con = DriverManager.getConnection(URL, "root", "root");
             Statement st = con.createStatement()) {
            while (true) {
                System.out.println("1.Add 2.List 3.Update marks 4.Delete 5.Exit");
                int ch = sc.nextInt();
                sc.nextLine();
                switch (ch) {
                    case 1 -> {
                        System.out.print("Name: ");   String n = sc.nextLine();
                        System.out.print("Email: ");  String e = sc.nextLine();
                        System.out.print("Course: "); String c = sc.nextLine();
                        System.out.print("Marks: ");  int m = sc.nextInt();
                        String sql = "INSERT INTO students(name,email,course,marks) VALUES('"
                                + n + "','" + e + "','" + c + "'," + m + ")";
                        System.out.println(st.executeUpdate(sql) + " row added");
                    }
                    case 2 -> {
                        try (ResultSet rs = st.executeQuery("SELECT * FROM students")) {
                            while (rs.next()) {
                                System.out.println(rs.getInt("id") + " " + rs.getString("name")
                                        + " " + rs.getString("course") + " " + rs.getInt("marks"));
                            }
                        }
                    }
                    case 3 -> {
                        System.out.print("Id: ");        int id = sc.nextInt();
                        System.out.print("New marks: "); int m = sc.nextInt();
                        int r = st.executeUpdate("UPDATE students SET marks=" + m + " WHERE id=" + id);
                        System.out.println(r == 1 ? "Updated" : "Id not found");
                    }
                    case 4 -> {
                        System.out.print("Id: "); int id = sc.nextInt();
                        int r = st.executeUpdate("DELETE FROM students WHERE id=" + id);
                        System.out.println(r == 1 ? "Deleted" : "Id not found");
                    }
                    case 5 -> { System.out.println("Bye"); return; }
                    default -> System.out.println("Invalid choice");
                }
            }
        } catch (SQLException e) {
            System.out.println("DB error: " + e.getMessage());
        }
    }
}`,
      result: "1.Add 2.List 3.Update marks 4.Delete 5.Exit\n3\nId: 99\nNew marks: 50\nId not found\n1.Add 2.List 3.Update marks 4.Delete 5.Exit\n5\nBye",
      explanation: "A single Connection and Statement are reused for the life of the program. The switch uses Java 14+ arrow syntax. Returning from main inside try-with-resources still closes the Statement and Connection."
    }
  ],
  interview: [
    { q: "What are the steps to connect to a database using JDBC?", a: "1) Load/register driver (optional in JDBC 4+), 2) get Connection from DriverManager, 3) create Statement, 4) execute SQL, 5) process ResultSet or update count, 6) close ResultSet, Statement and Connection.", level: "Easy" },
    { q: "Difference between executeQuery, executeUpdate and execute?", a: "executeQuery is for SELECT and returns ResultSet. executeUpdate is for INSERT/UPDATE/DELETE/DDL and returns the int count of affected rows. execute works for any SQL and returns boolean: true if a ResultSet is available, false for an update count.", level: "Easy" },
    { q: "What does executeUpdate return for a CREATE TABLE statement?", a: "0, because DDL statements do not affect rows.", level: "Medium" },
    { q: "Are ResultSet column indexes 0-based or 1-based?", a: "1-based. rs.getString(1) reads the first column.", level: "Easy" },
    { q: "Where is the ResultSet cursor initially positioned?", a: "Before the first row. You must call next() once before reading the first row.", level: "Easy" },
    { q: "Why must we close JDBC resources?", a: "Connections, statements and result sets hold database and network resources. Not closing them causes leaks and errors like 'Too many connections'. Use try-with-resources.", level: "Easy" },
    { q: "What happens if you call executeQuery with an INSERT statement?", a: "SQLException is thrown, because executeQuery expects a statement that produces a ResultSet.", level: "Medium" },
    { q: "Is JDBC auto-commit on or off by default?", a: "On. Every SQL statement is committed immediately unless you call con.setAutoCommit(false).", level: "Medium" },
    { q: "Can a single Statement have multiple open ResultSets?", a: "No. Executing a new query on the same Statement closes its previous ResultSet. Use separate Statement objects if you need two open result sets.", level: "Hard" },
    { q: "What is the disadvantage of Statement?", a: "SQL is built with string concatenation, so it is vulnerable to SQL injection, needs manual quoting, and the SQL is parsed/compiled on every execution. PreparedStatement solves these.", level: "Medium" }
  ],
  practice: [
    {
      task: "Write a program that prints only Java course students with marks above 80 using Statement.",
      hint: "Put the condition in the WHERE clause: course='Java' AND marks > 80.",
      solution: `import java.sql.*;

public class JavaToppers {
    public static void main(String[] args) throws SQLException {
        String sql = "SELECT name, marks FROM students WHERE course='Java' AND marks > 80";
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                System.out.println(rs.getString("name") + " - " + rs.getInt("marks"));
            }
        }
    }
}`
    },
    {
      task: "Print the count, average and maximum marks of all students in one query.",
      hint: "SELECT COUNT(*), AVG(marks), MAX(marks) FROM students and read columns 1, 2, 3.",
      solution: `import java.sql.*;

public class Stats {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(
                     "SELECT COUNT(*), AVG(marks), MAX(marks) FROM students")) {
            if (rs.next()) {
                System.out.println("Count   : " + rs.getInt(1));
                System.out.printf("Average : %.2f%n", rs.getDouble(2));
                System.out.println("Highest : " + rs.getInt(3));
            }
        }
    }
}`
    },
    {
      task: "Create a table 'courses(code VARCHAR(10) PRIMARY KEY, title VARCHAR(50), fee INT)' from Java and insert 3 rows using one Statement.",
      hint: "Use executeUpdate for the CREATE and each INSERT.",
      solution: `import java.sql.*;

public class CourseSetup {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             Statement st = con.createStatement()) {
            st.executeUpdate("CREATE TABLE IF NOT EXISTS courses ("
                    + "code VARCHAR(10) PRIMARY KEY, title VARCHAR(50), fee INT)");
            int total = 0;
            total += st.executeUpdate("INSERT INTO courses VALUES ('J101','Core Java',15000)");
            total += st.executeUpdate("INSERT INTO courses VALUES ('J201','Advanced Java',18000)");
            total += st.executeUpdate("INSERT INTO courses VALUES ('S301','Spring Boot',22000)");
            System.out.println(total + " courses inserted");
        }
    }
}`
    },
    {
      task: "Increase marks by 5 for all students of a course entered by the user and print how many rows changed.",
      hint: "Read the course with Scanner and concatenate it inside single quotes.",
      solution: `import java.sql.*;
import java.util.Scanner;

public class GraceMarks {
    public static void main(String[] args) throws SQLException {
        Scanner sc = new Scanner(System.in);
        System.out.print("Course: ");
        String course = sc.nextLine();
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             Statement st = con.createStatement()) {
            int n = st.executeUpdate(
                    "UPDATE students SET marks = marks + 5 WHERE course = '" + course + "'");
            System.out.println(n + " students updated");
        }
    }
}`
    }
  ],
  quiz: [
    { question: "Which method should be used to run a SELECT query with Statement?", options: ["executeUpdate()", "executeQuery()", "executeSelect()", "runQuery()"], answer: 1, explanation: "executeQuery returns a ResultSet and is meant for SELECT." },
    { question: "What does executeUpdate() return?", options: ["A ResultSet", "A boolean", "Number of affected rows (int)", "Nothing (void)"], answer: 2, explanation: "It returns the row count for DML, or 0 for DDL." },
    { question: "What is the first column index in a ResultSet?", options: ["1", "0", "-1", "Depends on driver"], answer: 0, explanation: "JDBC column indexes are 1-based." },
    { question: "What does execute() returning true mean?", options: ["The SQL failed", "Rows were updated", "The transaction committed", "A ResultSet is available"], answer: 3, explanation: "true means the first result is a ResultSet; call getResultSet()." },
    { question: "In which order should JDBC resources be closed?", options: ["Connection, Statement, ResultSet", "Any order", "ResultSet, Statement, Connection", "Only Connection is needed"], answer: 2, explanation: "Close in reverse order of creation; try-with-resources does this automatically." }
  ]
};
