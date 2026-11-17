export default {
  id: "day-04-resultset-metadata-scrollable",
  title: "ResultSet, ResultSetMetaData and Scrollable ResultSet",
  module: "Module 1: JDBC",
  day: 4,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Go deeper into ResultSet: its types and concurrency modes, moving the cursor forward, backward and to any row, updating rows through the ResultSet, and discovering column details at runtime with ResultSetMetaData and DatabaseMetaData.",
  objectives: [
    "Read data from a ResultSet by column name and index, handling NULL values",
    "Explain ResultSet types (FORWARD_ONLY, SCROLL_INSENSITIVE, SCROLL_SENSITIVE) and concurrency (READ_ONLY, UPDATABLE)",
    "Navigate a scrollable ResultSet with first, last, absolute, relative and previous",
    "Use ResultSetMetaData to print any table generically",
    "Update and insert rows through an updatable ResultSet"
  ],
  theory: [
    {
      heading: "ResultSet and the Cursor (recap and more)",
      content: "A ResultSet represents the rows returned by a query. Imagine a list of songs in a music player: the cursor is the 'now playing' marker. By default you can only press 'next' (forward-only). A scrollable ResultSet adds 'previous', 'first', 'last' and 'jump to song 5'.\n\nPositions in a ResultSet of 3 rows:\n  beforeFirst  <- initial position\n  row 1\n  row 2\n  row 3\n  afterLast    <- after next() returns false",
      points: [
        "getXxx(String columnLabel) or getXxx(int columnIndex). Using the label is more readable; index is slightly faster.",
        "If a column is SQL NULL, getInt returns 0 and getString returns null. Call rs.wasNull() right after a getXxx to check.",
        "getObject(\"col\", Integer.class) returns null for SQL NULL (Java 7+ / JDBC 4.1).",
        "Column labels follow the SQL alias: SELECT name AS student_name -> rs.getString(\"student_name\")."
      ]
    },
    {
      heading: "ResultSet Types",
      content: "The type controls how the cursor can move and whether changes made by others are visible.",
      points: [
        "TYPE_FORWARD_ONLY (default): only next(). Fastest, uses least memory.",
        "TYPE_SCROLL_INSENSITIVE: move in any direction; the data is a snapshot, changes made in the DB by others after the query are NOT visible.",
        "TYPE_SCROLL_SENSITIVE: move in any direction; tries to reflect changes made by others. MySQL Connector/J does not really support it and silently falls back to insensitive."
      ],
      syntax: "Statement st = con.createStatement(\n        ResultSet.TYPE_SCROLL_INSENSITIVE,\n        ResultSet.CONCUR_READ_ONLY);\n\nPreparedStatement ps = con.prepareStatement(sql,\n        ResultSet.TYPE_SCROLL_INSENSITIVE,\n        ResultSet.CONCUR_UPDATABLE);"
    },
    {
      heading: "Cursor Movement Methods",
      content: "On a scrollable ResultSet these methods return true if the cursor lands on a valid row.",
      points: [
        "next() / previous(): one row forward / back",
        "first() / last(): jump to first or last row",
        "beforeFirst() / afterLast(): move outside the rows (useful before a while(next) or while(previous) loop)",
        "absolute(n): go to row n; absolute(-1) = last row, absolute(-2) = second last",
        "relative(n): move n rows from the current row (negative goes back)",
        "getRow(): current row number (0 if not on a row)",
        "isFirst(), isLast(), isBeforeFirst(), isAfterLast()"
      ],
      tip: "Count rows quickly on a scrollable ResultSet: rs.last(); int count = rs.getRow(); rs.beforeFirst(); For large tables prefer SELECT COUNT(*)."
    },
    {
      heading: "Concurrency: READ_ONLY vs UPDATABLE",
      content: "CONCUR_READ_ONLY (default) means you can only read. CONCUR_UPDATABLE lets you change the database through the ResultSet itself, like editing a cell directly in an Excel sheet and pressing save.",
      syntax: "rs.absolute(2);\nrs.updateInt(\"marks\", 90);\nrs.updateRow();          // write change to DB\n\nrs.moveToInsertRow();\nrs.updateString(\"name\", \"Tara\");\n...\nrs.insertRow();          // insert new row\nrs.moveToCurrentRow();\n\nrs.deleteRow();          // delete current row",
      points: [
        "Updatable ResultSet requires: a single table query, and the primary key in the select list.",
        "If not possible, the driver downgrades to read-only and updateXxx throws 'Result Set not updatable'.",
        "In real projects, plain UPDATE statements are clearer; know updatable ResultSets for interviews."
      ]
    },
    {
      heading: "ResultSetMetaData",
      content: "Metadata means 'data about data'. ResultSetMetaData describes the columns of a ResultSet: how many, their names, SQL types, sizes and whether they allow NULL. It is how tools like MySQL Workbench or a generic 'export any table to CSV' feature work without knowing the table in advance.",
      syntax: "ResultSetMetaData md = rs.getMetaData();\nint cols = md.getColumnCount();\nfor (int i = 1; i <= cols; i++) {\n    md.getColumnName(i);       // name in table\n    md.getColumnLabel(i);      // alias if used\n    md.getColumnTypeName(i);   // VARCHAR, INT ...\n    md.getColumnDisplaySize(i);\n    md.isNullable(i);          // columnNoNulls=0, columnNullable=1\n    md.isAutoIncrement(i);\n}"
    },
    {
      heading: "DatabaseMetaData",
      content: "DatabaseMetaData (from con.getMetaData()) describes the whole database and driver: product name/version, driver name, list of tables, columns, primary keys, and supported features such as supportsResultSetType(ResultSet.TYPE_SCROLL_SENSITIVE). It is used by frameworks like Hibernate to detect the database dialect.",
      points: [
        "getDatabaseProductName(), getDatabaseProductVersion()",
        "getTables(catalog, schema, pattern, types)",
        "getColumns(catalog, schema, table, columnPattern)",
        "getPrimaryKeys(catalog, schema, table)",
        "supportsBatchUpdates(), supportsTransactions()"
      ]
    }
  ],
  examples: [
    {
      title: "Reset data script for today's examples",
      scenario: "Make sure everyone has the same 5 rows so the outputs below match exactly.",
      steps: [
        "Open MySQL Workbench > New Query Tab",
        "Paste and execute the script",
        "Keep this script handy; re-run it whenever your data gets messy"
      ],
      code: `USE college_db;

TRUNCATE TABLE students;   -- removes all rows and resets AUTO_INCREMENT to 1

INSERT INTO students (name, email, course, marks) VALUES
('Asha',   'asha@mail.com',   'Java',   88),
('Ravi',   'ravi@mail.com',   'Python', 75),
('Meena',  'meena@mail.com',  'Java',   92),
('Kiran',  'kiran@mail.com',  'React',  67),
('Suresh', 'suresh@mail.com', 'Java',   NULL);

SELECT * FROM students;`,
      result: "5 rows: ids 1 to 5 (Asha 88, Ravi 75, Meena 92, Kiran 67, Suresh NULL).",
      explanation: "TRUNCATE resets AUTO_INCREMENT so ids start from 1 again. Suresh has NULL marks so we can practise wasNull()."
    },
    {
      title: "Scrollable ResultSet navigation",
      scenario: "Move around the student list: last row, first row, row 3, two back, and print the list in reverse.",
      steps: [
        "In the jdbc-demo project create class ScrollDemo",
        "Type the code and run it (Run As > Java Application in Eclipse / green arrow in IntelliJ)",
        "Try changing TYPE_SCROLL_INSENSITIVE to TYPE_FORWARD_ONLY and run again: rs.last() throws SQLException"
      ],
      code: `import java.sql.*;

public class ScrollDemo {
    public static void main(String[] args) {
        String sql = "SELECT id, name FROM students ORDER BY id";
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             Statement st = con.createStatement(
                     ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
             ResultSet rs = st.executeQuery(sql)) {

            rs.last();
            System.out.println("Total rows : " + rs.getRow());
            System.out.println("Last       : " + rs.getString("name"));

            rs.first();
            System.out.println("First      : " + rs.getString("name"));

            rs.absolute(3);
            System.out.println("Row 3      : " + rs.getString("name"));

            rs.relative(-2);
            System.out.println("2 rows back: " + rs.getString("name") + " (row " + rs.getRow() + ")");

            rs.absolute(-2);
            System.out.println("2nd last   : " + rs.getString("name"));

            System.out.print("Reverse    : ");
            rs.afterLast();
            while (rs.previous()) {
                System.out.print(rs.getString("name") + " ");
            }
            System.out.println();

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "Total rows : 5\nLast       : Suresh\nFirst      : Asha\nRow 3      : Meena\n2 rows back: Asha (row 1)\n2nd last   : Kiran\nReverse    : Suresh Kiran Meena Ravi Asha ",
      explanation: "After absolute(3) the cursor is on Meena; relative(-2) moves to row 1 (Asha). absolute(-2) counts from the end, so it is row 4 (Kiran). afterLast() + previous() walks backwards. Note the trailing space after Asha in the last line."
    },
    {
      title: "Generic table printer with ResultSetMetaData",
      scenario: "Print ANY table (name given by the user) with its column headers and types, without hard-coding column names.",
      steps: [
        "Create class TablePrinter",
        "Type the code and run it; enter students when asked",
        "Run again and enter users (from Day 3); the same code prints a different table"
      ],
      code: `import java.sql.*;
import java.util.Scanner;
import java.util.Set;

public class TablePrinter {
    // whitelist because table names cannot be bound with ?
    private static final Set<String> ALLOWED = Set.of("students", "users");

    public static void main(String[] args) {
        System.out.print("Table: ");
        String table = new Scanner(System.in).nextLine().trim();
        if (!ALLOWED.contains(table)) {
            System.out.println("Table not allowed");
            return;
        }
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT * FROM " + table)) {

            ResultSetMetaData md = rs.getMetaData();
            int cols = md.getColumnCount();
            System.out.println("Columns: " + cols);
            for (int i = 1; i <= cols; i++) {
                System.out.println("  " + md.getColumnName(i) + " " + md.getColumnTypeName(i)
                        + (md.isAutoIncrement(i) ? " AUTO_INCREMENT" : "")
                        + (md.isNullable(i) == ResultSetMetaData.columnNullable ? " NULL" : " NOT NULL"));
            }
            while (rs.next()) {
                StringBuilder row = new StringBuilder();
                for (int i = 1; i <= cols; i++) {
                    row.append(rs.getString(i)).append(i < cols ? " | " : "");
                }
                System.out.println(row);
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "Table: students\nColumns: 5\n  id INT AUTO_INCREMENT NOT NULL\n  name VARCHAR NOT NULL\n  email VARCHAR NOT NULL\n  course VARCHAR NOT NULL\n  marks INT NULL\n1 | Asha | asha@mail.com | Java | 88\n2 | Ravi | ravi@mail.com | Python | 75\n3 | Meena | meena@mail.com | Java | 92\n4 | Kiran | kiran@mail.com | React | 67\n5 | Suresh | suresh@mail.com | Java | null",
      explanation: "getColumnCount and getColumnName make the code work for any table. getString(i) on a NULL column returns Java null, which StringBuilder prints as the word null. The whitelist protects the concatenated table name from injection."
    },
    {
      title: "Handling NULL values with wasNull() and getObject()",
      scenario: "Suresh has NULL marks. getInt returns 0, which wrongly looks like a real score. Detect NULL properly.",
      steps: [
        "Create class NullDemo",
        "Type the code and run it",
        "Compare the two ways of detecting NULL"
      ],
      code: `import java.sql.*;

public class NullDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             PreparedStatement ps = con.prepareStatement(
                     "SELECT name, marks FROM students WHERE id IN (4, 5) ORDER BY id");
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                String name = rs.getString("name");
                int marks = rs.getInt("marks");
                boolean isNull = rs.wasNull();       // must be called right after getInt
                Integer boxed = rs.getObject("marks", Integer.class);
                System.out.println(name + ": getInt=" + marks + ", wasNull=" + isNull
                        + ", getObject=" + boxed);
            }
        }
    }
}`,
      result: "Kiran: getInt=67, wasNull=false, getObject=67\nSuresh: getInt=0, wasNull=true, getObject=null",
      explanation: "Primitive int cannot hold null, so the driver returns 0. wasNull() reports whether the LAST value read was SQL NULL. getObject with Integer.class returns a wrapper that can be null, which is the cleaner approach for entity classes."
    },
    {
      title: "Updatable ResultSet: update, insert and delete through the cursor",
      scenario: "Give Suresh 60 marks, add a new student Tara, and delete Tara again, without writing UPDATE/INSERT/DELETE SQL.",
      steps: [
        "Create class UpdatableDemo",
        "Type the code and run it",
        "Check the table in Workbench: Suresh now has 60 marks; Tara was added and removed"
      ],
      code: `import java.sql.*;

public class UpdatableDemo {
    public static void main(String[] args) {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             Statement st = con.createStatement(
                     ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);
             ResultSet rs = st.executeQuery(
                     "SELECT id, name, email, course, marks FROM students ORDER BY id")) {

            // 1. update row 5 (Suresh)
            rs.absolute(5);
            rs.updateInt("marks", 60);
            rs.updateRow();
            System.out.println("Updated " + rs.getString("name") + " to " + rs.getInt("marks"));

            // 2. insert a new row
            rs.moveToInsertRow();
            rs.updateString("name", "Tara");
            rs.updateString("email", "tara@mail.com");
            rs.updateString("course", "Java");
            rs.updateInt("marks", 77);
            rs.insertRow();
            rs.moveToCurrentRow();
            System.out.println("Inserted Tara");

            // 3. delete the row we inserted (it is now the last row)
            rs.last();
            System.out.println("Deleting " + rs.getString("name"));
            rs.deleteRow();

            System.out.println("Concurrency updatable: "
                    + (rs.getConcurrency() == ResultSet.CONCUR_UPDATABLE));
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "Updated Suresh to 60\nInserted Tara\nDeleting Tara\nConcurrency updatable: true",
      explanation: "The query selects from one table and includes the primary key id, so MySQL Connector/J allows updates. updateRow() sends an UPDATE, insertRow() an INSERT and deleteRow() a DELETE behind the scenes. With MySQL Connector/J the inserted row is appended to the ResultSet, so last() lands on Tara."
    }
  ],
  interview: [
    { q: "What is a ResultSet?", a: "An interface representing the table of data returned by a query, with a cursor initially before the first row that is moved with next() and other methods.", level: "Easy" },
    { q: "What are the types of ResultSet?", a: "TYPE_FORWARD_ONLY (default, only next), TYPE_SCROLL_INSENSITIVE (scrollable, does not see later DB changes), TYPE_SCROLL_SENSITIVE (scrollable, reflects changes made by others if the driver supports it).", level: "Medium" },
    { q: "What is the default type and concurrency of a ResultSet?", a: "TYPE_FORWARD_ONLY and CONCUR_READ_ONLY.", level: "Easy" },
    { q: "Difference between absolute() and relative()?", a: "absolute(n) moves to row number n counted from the start (negative from the end). relative(n) moves n rows from the current position.", level: "Medium" },
    { q: "What is ResultSetMetaData used for?", a: "To get information about the columns of a ResultSet at runtime: count, names, labels, SQL types, size, nullability, auto-increment. Useful for generic code like table viewers and exporters.", level: "Easy" },
    { q: "Difference between ResultSetMetaData and DatabaseMetaData?", a: "ResultSetMetaData describes the columns of one result set (rs.getMetaData()). DatabaseMetaData describes the whole database and driver: product, version, tables, keys, supported features (con.getMetaData()).", level: "Medium" },
    { q: "How do you check for NULL when reading an int column?", a: "Call rs.wasNull() immediately after rs.getInt(), or use rs.getObject(col, Integer.class) which returns null.", level: "Medium" },
    { q: "What are the requirements for an updatable ResultSet?", a: "Create the statement with CONCUR_UPDATABLE, query a single table, and include the primary key columns. Otherwise the driver downgrades to read-only.", level: "Hard" },
    { q: "What happens when you call previous() on a forward-only ResultSet?", a: "SQLException is thrown (operation not allowed for a result set of type FORWARD_ONLY).", level: "Medium" },
    { q: "How can you find the number of rows in a ResultSet?", a: "With a scrollable ResultSet: rs.last(); rs.getRow(); then rs.beforeFirst(). Better: run SELECT COUNT(*) or count while iterating.", level: "Medium" },
    { q: "Difference between getColumnName and getColumnLabel?", a: "getColumnName returns the actual column name; getColumnLabel returns the alias given with AS (or the name if no alias). JDBC 4 recommends getColumnLabel for display and lookup.", level: "Hard" }
  ],
  practice: [
    {
      task: "Print the students table in reverse order of id using a scrollable ResultSet (without ORDER BY DESC).",
      hint: "Use afterLast() and then while (rs.previous()).",
      solution: `import java.sql.*;

public class ReversePrint {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             Statement st = con.createStatement(
                     ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
             ResultSet rs = st.executeQuery("SELECT id, name FROM students ORDER BY id")) {
            rs.afterLast();
            while (rs.previous()) {
                System.out.println(rs.getInt("id") + " " + rs.getString("name"));
            }
        }
    }
}`
    },
    {
      task: "Export any query result to CSV text on the console using ResultSetMetaData (header row + data rows).",
      hint: "Print column labels joined by commas first, then each row.",
      solution: `import java.sql.*;

public class CsvExport {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT id, name, course, marks FROM students")) {
            ResultSetMetaData md = rs.getMetaData();
            int n = md.getColumnCount();
            StringBuilder header = new StringBuilder();
            for (int i = 1; i <= n; i++) {
                header.append(md.getColumnLabel(i)).append(i < n ? "," : "");
            }
            System.out.println(header);
            while (rs.next()) {
                StringBuilder line = new StringBuilder();
                for (int i = 1; i <= n; i++) {
                    String v = rs.getString(i);
                    line.append(v == null ? "" : v).append(i < n ? "," : "");
                }
                System.out.println(line);
            }
        }
    }
}`
    },
    {
      task: "Implement simple paging: show 2 students per page and let the user type the page number.",
      hint: "With a scrollable ResultSet use absolute((page - 1) * size + 1) and then read up to size rows. (Real apps use LIMIT ? OFFSET ?.)",
      solution: `import java.sql.*;
import java.util.Scanner;

public class PagingDemo {
    public static void main(String[] args) throws SQLException {
        int size = 2;
        System.out.print("Page: ");
        int page = new Scanner(System.in).nextInt();
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root");
             Statement st = con.createStatement(
                     ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
             ResultSet rs = st.executeQuery("SELECT id, name FROM students ORDER BY id")) {
            int start = (page - 1) * size + 1;
            if (!rs.absolute(start)) {
                System.out.println("No such page");
                return;
            }
            int shown = 0;
            do {
                System.out.println(rs.getInt("id") + " " + rs.getString("name"));
                shown++;
            } while (shown < size && rs.next());
        }
    }
}`
    },
    {
      task: "Using DatabaseMetaData, print every column of the students table with its type and size, and the primary key column.",
      hint: "getColumns(\"college_db\", null, \"students\", \"%\") gives COLUMN_NAME, TYPE_NAME, COLUMN_SIZE; getPrimaryKeys gives COLUMN_NAME.",
      solution: `import java.sql.*;

public class DescribeTable {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root")) {
            DatabaseMetaData md = con.getMetaData();
            try (ResultSet cols = md.getColumns("college_db", null, "students", "%")) {
                while (cols.next()) {
                    System.out.println(cols.getString("COLUMN_NAME") + " "
                            + cols.getString("TYPE_NAME") + "(" + cols.getInt("COLUMN_SIZE") + ")");
                }
            }
            try (ResultSet pk = md.getPrimaryKeys("college_db", null, "students")) {
                while (pk.next()) {
                    System.out.println("Primary key: " + pk.getString("COLUMN_NAME"));
                }
            }
        }
    }
}`
    }
  ],
  quiz: [
    { question: "What is the default ResultSet type?", options: ["TYPE_SCROLL_SENSITIVE", "TYPE_SCROLL_INSENSITIVE", "TYPE_UPDATABLE", "TYPE_FORWARD_ONLY"], answer: 3, explanation: "Without arguments createStatement() gives a forward-only, read-only ResultSet." },
    { question: "On a 5-row scrollable ResultSet, which row does absolute(-2) move to?", options: ["Row 4", "Row 2", "Row 3", "Before first"], answer: 0, explanation: "Negative numbers count from the end: -1 is row 5, -2 is row 4." },
    { question: "Which method tells you how many columns a ResultSet has?", options: ["rs.getColumnCount()", "rs.getMetaData().getColumnCount()", "con.getMetaData().getColumns()", "rs.size()"], answer: 1, explanation: "Column information is on ResultSetMetaData, obtained via rs.getMetaData()." },
    { question: "rs.getInt(\"marks\") is called on a SQL NULL value. What is returned?", options: ["null", "-1", "0", "SQLException"], answer: 2, explanation: "Primitive getters return 0 for NULL; use wasNull() to detect it." },
    { question: "Which call saves changes made with updateXxx on the current row?", options: ["rs.commit()", "rs.save()", "rs.insertRow()", "rs.updateRow()"], answer: 3, explanation: "updateRow() writes the updated values of the current row to the database." }
  ]
};
