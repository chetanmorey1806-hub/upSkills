export default {
  id: "day-05-callablestatement-batch",
  title: "CallableStatement, Stored Procedures and Batch Processing",
  module: "Module 1: JDBC",
  day: 5,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Create MySQL stored procedures and functions with IN, OUT and INOUT parameters and call them from Java using CallableStatement, then speed up bulk inserts and updates with JDBC batch processing.",
  objectives: [
    "Write stored procedures and functions in MySQL",
    "Call procedures with IN, OUT and INOUT parameters using CallableStatement",
    "Read a ResultSet returned by a stored procedure",
    "Use addBatch and executeBatch with Statement and PreparedStatement",
    "Tune batch performance with rewriteBatchedStatements and handle BatchUpdateException"
  ],
  theory: [
    {
      heading: "What is a Stored Procedure?",
      content: "A stored procedure is a named block of SQL statements saved inside the database and executed with a single CALL. Analogy: instead of telling a cook every step of a recipe each time (sending many SQL statements), you say 'make dish number 7' and the cook already knows the steps. The logic lives near the data, so there are fewer network trips.",
      points: [
        "Benefits: precompiled and stored once, fewer network round trips, reusable by many applications (Java, Python, reports), security (grant EXECUTE without giving table access).",
        "Drawbacks: business logic is split between Java and DB, harder to version control and test, vendor specific syntax (MySQL vs Oracle PL/SQL).",
        "Parameter modes: IN (input, default), OUT (output value returned to caller), INOUT (input that is modified and returned).",
        "A stored FUNCTION returns exactly one value with RETURN and can be used inside SELECT; a PROCEDURE is invoked with CALL and may return many OUT values and result sets."
      ]
    },
    {
      heading: "Creating Procedures in MySQL (DELIMITER)",
      content: "Inside a procedure each SQL statement ends with ;, but the MySQL client would think the whole CREATE PROCEDURE ends at the first ;. So we temporarily change the delimiter to // (or $$), write the procedure, and change it back.",
      syntax: "DELIMITER //\nCREATE PROCEDURE get_student(IN p_id INT)\nBEGIN\n    SELECT * FROM students WHERE id = p_id;\nEND //\nDELIMITER ;\n\nCALL get_student(1);",
      tip: "DELIMITER is a command of the MySQL client/Workbench only, not SQL. Never send DELIMITER through JDBC."
    },
    {
      heading: "CallableStatement",
      content: "CallableStatement (extends PreparedStatement) is the JDBC interface for calling stored procedures and functions. You create it with con.prepareCall() using JDBC escape syntax in curly braces. IN parameters are set with setXxx like PreparedStatement. OUT parameters must be registered with registerOutParameter before execution, and read with getXxx after execution.",
      syntax: "CallableStatement cs = con.prepareCall(\"{call add_student(?, ?, ?, ?, ?)}\");\ncs.setString(1, \"Tara\");                 // IN\n...\ncs.registerOutParameter(5, Types.INTEGER); // OUT\ncs.execute();\nint newId = cs.getInt(5);\n\n// function\nCallableStatement f = con.prepareCall(\"{? = call grade_of(?)}\");\nf.registerOutParameter(1, Types.VARCHAR);\nf.setInt(2, 85);\nf.execute();\nString g = f.getString(1);",
      points: [
        "Procedure syntax: {call proc_name(?, ?)}",
        "Function syntax: {? = call func_name(?)}",
        "INOUT: call both setXxx and registerOutParameter on the same index.",
        "Hierarchy: Statement <- PreparedStatement <- CallableStatement."
      ]
    },
    {
      heading: "Batch Processing",
      content: "Without batching, inserting 1,000 rows means 1,000 separate trips to the database, like a delivery boy carrying one parcel per trip. Batch processing groups many SQL commands and sends them together in one trip: addBatch() puts a command in the bag, executeBatch() delivers the bag and returns an int[] with the update count of each command.",
      syntax: "PreparedStatement ps = con.prepareStatement(\"INSERT INTO t(a,b) VALUES(?,?)\");\nfor (Item it : items) {\n    ps.setString(1, it.a());\n    ps.setInt(2, it.b());\n    ps.addBatch();\n}\nint[] counts = ps.executeBatch();",
      points: [
        "Statement.addBatch(String sql): different SQL commands in one batch.",
        "PreparedStatement.addBatch(): same SQL with different parameter sets (most common).",
        "clearBatch() empties the batch. For huge data, execute every 500 or 1000 rows to limit memory.",
        "Only DML/DDL is allowed in a batch, never SELECT.",
        "Statement.SUCCESS_NO_INFO (-2) in the counts array means success but the count is unknown."
      ]
    },
    {
      heading: "Batch Performance and Errors",
      content: "MySQL Connector/J by default still sends each batched statement separately. Adding rewriteBatchedStatements=true to the URL makes the driver rewrite them into one multi-row INSERT (INSERT ... VALUES (...),(...),(...)), which can be 10x to 50x faster. If one command fails, executeBatch throws BatchUpdateException; getUpdateCounts() shows which commands ran before the failure. Combine batches with transactions (setAutoCommit(false) + commit/rollback, Day 6) so the batch is all-or-nothing.",
      tip: "URL for fast batches: jdbc:mysql://localhost:3306/college_db?rewriteBatchedStatements=true"
    }
  ],
  examples: [
    {
      title: "SQL script: stored procedures and a function",
      scenario: "Create four routines used in the Java examples: a select procedure, an insert with OUT id, an INOUT bonus calculator and a grade function.",
      steps: [
        "Run the Day 4 reset script first so data matches the outputs",
        "Open MySQL Workbench > New Query Tab, paste the script and execute it",
        "In the Schemas panel expand college_db > Stored Procedures and Functions to see them",
        "Test in Workbench: CALL get_students_by_course('Java');"
      ],
      code: `USE college_db;

DROP PROCEDURE IF EXISTS get_students_by_course;
DROP PROCEDURE IF EXISTS add_student;
DROP PROCEDURE IF EXISTS add_bonus;
DROP FUNCTION  IF EXISTS grade_of;

DELIMITER //

-- 1. IN parameter + returns a result set
CREATE PROCEDURE get_students_by_course(IN p_course VARCHAR(50))
BEGIN
    SELECT id, name, marks FROM students
    WHERE course = p_course
    ORDER BY id;
END //

-- 2. IN parameters + OUT parameter (new id)
CREATE PROCEDURE add_student(
    IN  p_name   VARCHAR(50),
    IN  p_email  VARCHAR(100),
    IN  p_course VARCHAR(50),
    IN  p_marks  INT,
    OUT p_new_id INT)
BEGIN
    INSERT INTO students(name, email, course, marks)
    VALUES (p_name, p_email, p_course, p_marks);
    SET p_new_id = LAST_INSERT_ID();
END //

-- 3. INOUT parameter
CREATE PROCEDURE add_bonus(INOUT p_marks INT, IN p_bonus INT)
BEGIN
    SET p_marks = LEAST(p_marks + p_bonus, 100);
END //

-- 4. Function returning one value
CREATE FUNCTION grade_of(p_marks INT) RETURNS CHAR(1)
DETERMINISTIC
BEGIN
    IF p_marks >= 90 THEN RETURN 'A';
    ELSEIF p_marks >= 75 THEN RETURN 'B';
    ELSEIF p_marks >= 60 THEN RETURN 'C';
    ELSE RETURN 'F';
    END IF;
END //

DELIMITER ;

CALL get_students_by_course('Java');
SELECT name, marks, grade_of(marks) AS grade FROM students;`,
      result: "CALL get_students_by_course('Java') returns:\n1 Asha 88\n3 Meena 92\n5 Suresh NULL\n\nSELECT with grade_of: Asha 88 B, Ravi 75 B, Meena 92 A, Kiran 67 C, Suresh NULL F",
      explanation: "DELIMITER // lets semicolons appear inside the body. DETERMINISTIC tells MySQL the function always returns the same output for the same input (required when binary logging is on). LEAST caps marks at 100. For Suresh (NULL marks) every comparison inside grade_of is NULL, which IF treats as not true, so the ELSE branch runs and the function returns 'F'."
    },
    {
      title: "Calling a procedure that returns a ResultSet (IN parameter)",
      scenario: "Get all Java students by calling get_students_by_course from Java.",
      steps: [
        "In jdbc-demo create class CallSelectDemo",
        "Type the code and run it",
        "Change 'Java' to 'Python' and run again"
      ],
      code: `import java.sql.*;

public class CallSelectDemo {
    public static void main(String[] args) {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             CallableStatement cs = con.prepareCall("{call get_students_by_course(?)}")) {

            cs.setString(1, "Java");
            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    System.out.println(rs.getInt("id") + " " + rs.getString("name")
                            + " " + rs.getObject("marks", Integer.class));
                }
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "1 Asha 88\n3 Meena 92\n5 Suresh null",
      explanation: "A procedure that ends with a SELECT returns a ResultSet, so executeQuery() can be used. getObject with Integer.class shows NULL marks as null instead of 0."
    },
    {
      title: "OUT, INOUT parameters and calling a function",
      scenario: "Add a student and get the new id back (OUT), calculate bonus marks (INOUT) and get a grade (function).",
      steps: [
        "Create class CallOutDemo",
        "Type the code and run it once (the second run fails because the email is UNIQUE)",
        "Notice registerOutParameter is called BEFORE execute()"
      ],
      code: `import java.sql.*;

public class CallOutDemo {
    public static void main(String[] args) {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root")) {

            // 1. IN + OUT
            try (CallableStatement cs = con.prepareCall("{call add_student(?, ?, ?, ?, ?)}")) {
                cs.setString(1, "Tara");
                cs.setString(2, "tara@mail.com");
                cs.setString(3, "Java");
                cs.setInt(4, 77);
                cs.registerOutParameter(5, Types.INTEGER);
                cs.execute();
                System.out.println("New student id: " + cs.getInt(5));
            }

            // 2. INOUT
            try (CallableStatement cs = con.prepareCall("{call add_bonus(?, ?)}")) {
                cs.setInt(1, 95);                         // input value
                cs.registerOutParameter(1, Types.INTEGER); // same index is also output
                cs.setInt(2, 10);
                cs.execute();
                System.out.println("Marks after bonus: " + cs.getInt(1));
            }

            // 3. Function
            try (CallableStatement cs = con.prepareCall("{? = call grade_of(?)}")) {
                cs.registerOutParameter(1, Types.CHAR);
                cs.setInt(2, 81);
                cs.execute();
                System.out.println("Grade for 81: " + cs.getString(1));
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "New student id: 6\nMarks after bonus: 100\nGrade for 81: B",
      explanation: "After the Day 4 reset the table has ids 1 to 5, so Tara gets id 6. add_bonus receives 95, adds 10 and LEAST caps it at 100. For the function, index 1 is the return value and index 2 the argument."
    },
    {
      title: "Batch insert with PreparedStatement and timing",
      scenario: "Insert 1,000 test students in batches of 200 and measure the time with and without batching.",
      steps: [
        "Create class BatchInsertDemo",
        "Note the URL contains rewriteBatchedStatements=true",
        "Run it. Then compare: comment out addBatch/executeBatch and call ps.executeUpdate() inside the loop to see how much slower it is",
        "Clean up afterwards in Workbench: DELETE FROM students WHERE email LIKE 'test%';"
      ],
      code: `import java.sql.*;

public class BatchInsertDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/college_db?rewriteBatchedStatements=true";
        String sql = "INSERT INTO students(name, email, course, marks) VALUES (?, ?, ?, ?)";

        try (Connection con = DriverManager.getConnection(url, "root", "root");
             PreparedStatement ps = con.prepareStatement(sql)) {

            long start = System.currentTimeMillis();
            int total = 0;
            for (int i = 1; i <= 1000; i++) {
                ps.setString(1, "Test" + i);
                ps.setString(2, "test" + i + "@mail.com");
                ps.setString(3, i % 2 == 0 ? "Java" : "Python");
                ps.setInt(4, 50 + (i % 50));
                ps.addBatch();

                if (i % 200 == 0) {               // send every 200 rows
                    int[] counts = ps.executeBatch();
                    total += counts.length;
                    ps.clearBatch();
                }
            }
            long time = System.currentTimeMillis() - start;
            System.out.println("Rows sent in batches: " + total);
            System.out.println("Time taken (ms): " + time);
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "Rows sent in batches: 1000\nTime taken (ms): 120\n\n(The time depends on your machine; without batching it is typically several seconds.)",
      explanation: "addBatch stores one parameter set; executeBatch sends 200 at once and returns an int[] of length 200. With rewriteBatchedStatements=true the driver turns them into one multi-row INSERT. The counts array then contains Statement.SUCCESS_NO_INFO (-2) values, which is normal."
    },
    {
      title: "Statement batch with mixed SQL and BatchUpdateException",
      scenario: "Run several different SQL commands in one batch; one command has a duplicate email, so see how the failure is reported.",
      steps: [
        "Create class MixedBatchDemo",
        "Type the code and run it after the Day 4 reset script",
        "Read which commands succeeded from getUpdateCounts()"
      ],
      code: `import java.sql.*;
import java.util.Arrays;

public class MixedBatchDemo {
    public static void main(String[] args) {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             Statement st = con.createStatement()) {

            st.addBatch("UPDATE students SET marks = marks + 2 WHERE course = 'Java'");
            st.addBatch("INSERT INTO students(name,email,course,marks) VALUES('Asha2','asha@mail.com','Java',70)");
            st.addBatch("DELETE FROM students WHERE name = 'Kiran'");

            int[] counts = st.executeBatch();
            System.out.println("Counts: " + Arrays.toString(counts));

        } catch (BatchUpdateException e) {
            System.out.println("Batch failed: " + e.getMessage());
            System.out.println("Counts: " + Arrays.toString(e.getUpdateCounts()));
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "Batch failed: Duplicate entry 'asha@mail.com' for key 'students.email'\nCounts: [3, -3, 1]",
      explanation: "The UPDATE matched the 3 Java students (Connector/J reports matched rows by default). The INSERT failed (-3 = Statement.EXECUTE_FAILED) and, because continueBatchOnError is true by default in MySQL Connector/J, the DELETE still ran (1). Without a transaction the successful commands stay committed, which is why batches are usually wrapped in a transaction (Day 6)."
    }
  ],
  interview: [
    { q: "What is a stored procedure?", a: "A precompiled, named set of SQL statements stored in the database and executed with CALL. It can accept IN, OUT and INOUT parameters and return result sets.", level: "Easy" },
    { q: "Difference between stored procedure and function?", a: "A function must return exactly one value with RETURN and can be used inside SELECT; a procedure is called with CALL, returns values through OUT parameters or result sets, and cannot be used in a SELECT.", level: "Medium" },
    { q: "What is CallableStatement?", a: "A JDBC interface extending PreparedStatement used to execute stored procedures and functions, created with con.prepareCall(\"{call proc(?)}\").", level: "Easy" },
    { q: "How do you read an OUT parameter?", a: "Call registerOutParameter(index, Types.X) before execute(), then getXxx(index) after execute().", level: "Medium" },
    { q: "How do you handle an INOUT parameter?", a: "Set the input with setXxx(index, value) and also registerOutParameter(index, type) on the same index; after execute read it with getXxx(index).", level: "Medium" },
    { q: "What is batch processing in JDBC?", a: "Grouping multiple SQL commands with addBatch() and sending them in one round trip with executeBatch(), which returns an int[] of update counts. It greatly improves bulk insert/update performance.", level: "Easy" },
    { q: "Can a SELECT be added to a batch?", a: "No. Batches are only for statements that return update counts; a SELECT causes BatchUpdateException.", level: "Medium" },
    { q: "What is BatchUpdateException?", a: "A subclass of SQLException thrown when a command in a batch fails. getUpdateCounts() returns counts for commands processed, with EXECUTE_FAILED (-3) for failures if the driver continued.", level: "Hard" },
    { q: "What does rewriteBatchedStatements=true do in MySQL?", a: "It tells Connector/J to rewrite batched INSERTs into a single multi-row INSERT (and send other statements as multi-queries), drastically reducing round trips.", level: "Hard" },
    { q: "Why use DELIMITER when creating procedures?", a: "So the client does not end the CREATE PROCEDURE statement at the first ; inside the body. It is a client command, not sent through JDBC.", level: "Medium" },
    { q: "Difference between Statement batch and PreparedStatement batch?", a: "Statement.addBatch(sql) can mix different SQL commands. PreparedStatement.addBatch() repeats the same precompiled SQL with different parameters, which is faster and safe from injection.", level: "Medium" }
  ],
  practice: [
    {
      task: "Create a procedure count_by_course(IN p_course, OUT p_count) and call it from Java to print the number of students in 'Java'.",
      hint: "SELECT COUNT(*) INTO p_count FROM students WHERE course = p_course;",
      solution: `-- SQL (run in Workbench)
DELIMITER //
CREATE PROCEDURE count_by_course(IN p_course VARCHAR(50), OUT p_count INT)
BEGIN
    SELECT COUNT(*) INTO p_count FROM students WHERE course = p_course;
END //
DELIMITER ;

// Java
import java.sql.*;

public class CountByCourse {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             CallableStatement cs = con.prepareCall("{call count_by_course(?, ?)}")) {
            cs.setString(1, "Java");
            cs.registerOutParameter(2, Types.INTEGER);
            cs.execute();
            System.out.println("Java students: " + cs.getInt(2));
        }
    }
}`
    },
    {
      task: "Write a function avg_marks_of(p_course) RETURNS DECIMAL(5,2) and call it from Java with the {? = call ...} syntax.",
      hint: "Register the return value as Types.DECIMAL and read it with getBigDecimal(1).",
      solution: `-- SQL
DELIMITER //
CREATE FUNCTION avg_marks_of(p_course VARCHAR(50)) RETURNS DECIMAL(5,2)
READS SQL DATA
BEGIN
    DECLARE a DECIMAL(5,2);
    SELECT AVG(marks) INTO a FROM students WHERE course = p_course;
    RETURN a;
END //
DELIMITER ;

// Java
import java.sql.*;

public class AvgMarks {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             CallableStatement cs = con.prepareCall("{? = call avg_marks_of(?)}")) {
            cs.registerOutParameter(1, Types.DECIMAL);
            cs.setString(2, "Java");
            cs.execute();
            System.out.println("Average: " + cs.getBigDecimal(1));
        }
    }
}`
    },
    {
      task: "Use a PreparedStatement batch to give different bonus marks to students by id: {1:5, 2:3, 3:2}.",
      hint: "UPDATE students SET marks = marks + ? WHERE id = ? with a Map and addBatch in the loop.",
      solution: `import java.sql.*;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

public class BonusBatch {
    public static void main(String[] args) throws SQLException {
        Map<Integer, Integer> bonus = new LinkedHashMap<>();
        bonus.put(1, 5);
        bonus.put(2, 3);
        bonus.put(3, 2);
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             PreparedStatement ps = con.prepareStatement(
                     "UPDATE students SET marks = marks + ? WHERE id = ?")) {
            for (Map.Entry<Integer, Integer> e : bonus.entrySet()) {
                ps.setInt(1, e.getValue());
                ps.setInt(2, e.getKey());
                ps.addBatch();
            }
            System.out.println(Arrays.toString(ps.executeBatch()));
        }
    }
}`
    },
    {
      task: "Read lines of a CSV string array (name,email,course,marks) and batch insert them, reporting failed rows using BatchUpdateException.",
      hint: "Loop over e.getUpdateCounts() and print index when the value equals Statement.EXECUTE_FAILED.",
      solution: `import java.sql.*;

public class CsvBatch {
    public static void main(String[] args) {
        String[] lines = {
            "Lata,lata@mail.com,Java,80",
            "Mohan,mohan@mail.com,React,72",
            "Dup,asha@mail.com,Java,60"
        };
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             PreparedStatement ps = con.prepareStatement(
                     "INSERT INTO students(name,email,course,marks) VALUES (?,?,?,?)")) {
            for (String line : lines) {
                String[] p = line.split(",");
                ps.setString(1, p[0]);
                ps.setString(2, p[1]);
                ps.setString(3, p[2]);
                ps.setInt(4, Integer.parseInt(p[3]));
                ps.addBatch();
            }
            ps.executeBatch();
            System.out.println("All rows inserted");
        } catch (BatchUpdateException e) {
            int[] c = e.getUpdateCounts();
            for (int i = 0; i < c.length; i++) {
                if (c[i] == Statement.EXECUTE_FAILED) {
                    System.out.println("Failed line " + (i + 1) + ": " + lines[i]);
                }
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }
}`
    }
  ],
  quiz: [
    { question: "Which method creates a CallableStatement?", options: ["con.prepareStatement()", "con.createCall()", "con.prepareCall()", "con.callProcedure()"], answer: 2, explanation: "Connection.prepareCall(\"{call name(?)}\") returns a CallableStatement." },
    { question: "What must be done before execute() for an OUT parameter?", options: ["registerOutParameter()", "setNull()", "addBatch()", "Nothing"], answer: 0, explanation: "OUT parameters must be registered with their SQL type before execution." },
    { question: "What is the JDBC escape syntax to call a function?", options: ["{call f(?)}", "{? = call f(?)}", "CALL f(?) RETURNS ?", "{exec f(?)}"], answer: 1, explanation: "The leading ? = receives the function's return value." },
    { question: "What does executeBatch() return?", options: ["boolean", "ResultSet", "int", "int[]"], answer: 3, explanation: "An array with one update count per command in the batch." },
    { question: "Which interface hierarchy is correct?", options: ["PreparedStatement extends CallableStatement", "CallableStatement extends PreparedStatement extends Statement", "Statement extends PreparedStatement", "CallableStatement extends Connection"], answer: 1, explanation: "Statement <- PreparedStatement <- CallableStatement." }
  ]
};
