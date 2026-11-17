export default {
  id: "day-01-jdbc-introduction",
  title: "Introduction to JDBC, Architecture, Driver Types and MySQL Setup",
  module: "Module 1: JDBC",
  day: 1,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Learn what JDBC is, how a Java program talks to a database through the DriverManager and a driver, the four JDBC driver types, and how to set up MySQL, the MySQL Connector/J driver and a first working connection in Eclipse and IntelliJ IDEA.",
  objectives: [
    "Explain what JDBC is and why Java needs it to talk to databases",
    "Describe the JDBC architecture: application, JDBC API, DriverManager, driver, database",
    "Compare the four JDBC driver types and know why Type 4 is used today",
    "Install MySQL, create a database and table, and add mysql-connector-j to a project",
    "Write and run a first Java program that connects to MySQL"
  ],
  theory: [
    {
      heading: "What is JDBC?",
      content: "JDBC (Java Database Connectivity) is a standard Java API (packages java.sql and javax.sql) that lets a Java program connect to a relational database, send SQL queries and read the results. Think of JDBC as a universal TV remote: the buttons (methods like getConnection, executeQuery) are the same for every brand of TV (MySQL, Oracle, PostgreSQL). Only the small chip inside the remote (the driver) changes per brand. Because of this, you learn JDBC once and can work with any database by simply changing the driver and the URL.",
      points: [
        "JDBC is part of Java SE. java.sql is available in every JDK, no extra download is needed for the API itself.",
        "The driver is supplied by the database vendor (for MySQL it is MySQL Connector/J, artifact mysql-connector-j).",
        "JDBC is the foundation under Hibernate, JPA, Spring JdbcTemplate and Spring Data JPA. Every ORM finally calls JDBC.",
        "Before JDBC, Microsoft ODBC existed but it was written in C and was platform dependent."
      ],
      tip: "Interview one-liner: JDBC is a Java API that defines interfaces (Connection, Statement, ResultSet) which database vendors implement inside a driver, so Java code stays database independent."
    },
    {
      heading: "JDBC Architecture (diagram in words)",
      content: "JDBC follows a layered architecture. Picture it top to bottom like this:\n\n[ Java Application ]\n        |  calls methods of\n[ JDBC API: Connection, Statement, PreparedStatement, ResultSet ]\n        |  asks\n[ DriverManager ]  (picks the correct driver for the URL)\n        |  uses\n[ JDBC Driver: MySQL Connector/J ]\n        |  speaks the MySQL network protocol over TCP port 3306\n[ MySQL Database Server ]\n\nThe application only talks to interfaces. DriverManager looks at the URL (jdbc:mysql://...) and hands the work to the driver registered for that URL. The driver converts JDBC calls into the database's own network protocol.",
      points: [
        "DriverManager (class): manages registered drivers and creates connections.",
        "Driver (interface): implemented by each vendor, e.g. com.mysql.cj.jdbc.Driver.",
        "Connection (interface): one session with the database.",
        "Statement / PreparedStatement / CallableStatement (interfaces): carry SQL to the database.",
        "ResultSet (interface): the table of rows returned by a SELECT.",
        "SQLException (class): the checked exception thrown when anything goes wrong."
      ],
      tip: "Two-tier architecture: the Java app talks directly to the DB (desktop apps). Three-tier: browser -> server (Servlet/Spring) -> DB. JDBC is used in both."
    },
    {
      heading: "The Four JDBC Driver Types",
      content: "Sun defined four driver types based on how they reach the database. Compare them like four ways of sending a letter abroad: through two translators (Type 1), through one local translator (Type 2), through a post office in the middle (Type 3), or writing directly in the receiver's language (Type 4).",
      points: [
        "Type 1 – JDBC-ODBC Bridge: JDBC calls -> ODBC driver -> DB. Slow, needs ODBC installed on every machine. Removed from Java 8 onward.",
        "Type 2 – Native API (partly Java): JDBC calls -> vendor native C library (e.g. Oracle OCI) -> DB. Faster than Type 1 but needs native libraries on the client, so not portable.",
        "Type 3 – Network Protocol (middleware): JDBC calls -> middleware server -> DB. Pure Java on the client, but needs an extra server in the middle.",
        "Type 4 – Thin / Pure Java driver: JDBC calls -> DB's own network protocol directly. Pure Java, no installation except a JAR, fastest and most portable. MySQL Connector/J, PostgreSQL JDBC and Oracle Thin are Type 4.",
        "Today almost everyone uses Type 4."
      ],
      tip: "Common interview question: 'Which driver type is the MySQL driver?' Answer: Type 4 (thin, pure Java)."
    },
    {
      heading: "JDBC URL, Driver Class and Auto-loading",
      content: "A JDBC URL tells DriverManager which driver and which database to use. Format: jdbc:<subprotocol>://<host>:<port>/<database>?<options>. For MySQL: jdbc:mysql://localhost:3306/college_db. The modern MySQL driver class is com.mysql.cj.jdbc.Driver (the old com.mysql.jdbc.Driver is deprecated). Since JDBC 4.0 (Java 6), drivers register themselves automatically using the file META-INF/services/java.sql.Driver inside the JAR, so Class.forName(...) is optional. Many teachers and old projects still write it, and inside Tomcat it is sometimes needed, so you should know both.",
      syntax: "String url  = \"jdbc:mysql://localhost:3306/college_db\";\nString user = \"root\";\nString pass = \"root\";\nConnection con = DriverManager.getConnection(url, user, pass);",
      points: [
        "Default MySQL port: 3306.",
        "Useful options: ?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true (helpful on local MySQL 8 setups).",
        "Oracle URL: jdbc:oracle:thin:@localhost:1521:xe. PostgreSQL URL: jdbc:postgresql://localhost:5432/dbname."
      ]
    },
    {
      heading: "Installing MySQL and Creating the Course Database",
      content: "Install MySQL Community Server 8.x (Windows: MySQL Installer > Developer Default, which also installs MySQL Workbench; Ubuntu: sudo apt install mysql-server; macOS: brew install mysql). During setup remember the root password. Open MySQL Workbench (or the mysql command-line client) and run the SQL script in Example 1. We will use the same college_db database and students table for the whole JDBC module.",
      points: [
        "Check the server is running: Windows Services > MySQL80, or sudo systemctl status mysql on Linux.",
        "Log in from the terminal: mysql -u root -p",
        "Create a separate user for apps instead of root in real projects."
      ],
      tip: "Error 'Public Key Retrieval is not allowed' on MySQL 8? Add allowPublicKeyRetrieval=true&useSSL=false to the URL for local development."
    },
    {
      heading: "Adding the MySQL Driver to a Project (Maven or JAR)",
      content: "The JDBC API is inside the JDK, but the MySQL driver is a separate JAR. There are two ways to add it. (1) Maven (recommended): add the mysql-connector-j dependency in pom.xml and Maven downloads it. (2) Manual JAR: download mysql-connector-j-8.4.0.jar from dev.mysql.com/downloads/connector/j (choose 'Platform Independent') and add it to the build path. If the JAR is missing you get java.sql.SQLException: No suitable driver found, or ClassNotFoundException: com.mysql.cj.jdbc.Driver.",
      syntax: "<dependency>\n    <groupId>com.mysql</groupId>\n    <artifactId>mysql-connector-j</artifactId>\n    <version>8.4.0</version>\n</dependency>",
      points: [
        "Old artifact mysql:mysql-connector-java was renamed to com.mysql:mysql-connector-j from 8.0.31 onward.",
        "Eclipse plain project: right-click project > Build Path > Configure Build Path > Libraries > Classpath > Add External JARs.",
        "IntelliJ plain project: File > Project Structure > Modules > Dependencies > + > JARs or Directories."
      ]
    }
  ],
  examples: [
    {
      title: "SQL Script: Create college_db and the students table",
      scenario: "Every JDBC day uses this database. Run it once in MySQL Workbench or the mysql command line.",
      steps: [
        "Open MySQL Workbench and connect to 'Local instance MySQL80' with your root password",
        "Click File > New Query Tab",
        "Paste the script below",
        "Click the lightning bolt icon (Execute) or press Ctrl+Shift+Enter",
        "Click the refresh icon in the Schemas panel; college_db with table students appears"
      ],
      code: `-- Day 1: database used for the whole JDBC module
CREATE DATABASE IF NOT EXISTS college_db;
USE college_db;

DROP TABLE IF EXISTS students;

CREATE TABLE students (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    name   VARCHAR(50)  NOT NULL,
    email  VARCHAR(100) NOT NULL UNIQUE,
    course VARCHAR(50)  NOT NULL,
    marks  INT          DEFAULT 0
);

INSERT INTO students (name, email, course, marks) VALUES
('Asha',   'asha@mail.com',   'Java',   88),
('Ravi',   'ravi@mail.com',   'Python', 75),
('Meena',  'meena@mail.com',  'Java',   92),
('Kiran',  'kiran@mail.com',  'React',  67),
('Suresh', 'suresh@mail.com', 'Java',   54);

SELECT * FROM students;`,
      result: "+----+--------+-----------------+--------+-------+\n| id | name   | email           | course | marks |\n+----+--------+-----------------+--------+-------+\n|  1 | Asha   | asha@mail.com   | Java   |    88 |\n|  2 | Ravi   | ravi@mail.com   | Python |    75 |\n|  3 | Meena  | meena@mail.com  | Java   |    92 |\n|  4 | Kiran  | kiran@mail.com  | React  |    67 |\n|  5 | Suresh | suresh@mail.com | Java   |    54 |\n+----+--------+-----------------+--------+-------+\n5 rows in set",
      explanation: "AUTO_INCREMENT lets MySQL generate the id. email is UNIQUE so the same email cannot be inserted twice (useful later to see SQLException). DROP TABLE IF EXISTS makes the script safe to run again."
    },
    {
      title: "Create a Maven project with mysql-connector-j (Eclipse and IntelliJ)",
      scenario: "Set up a Java 17 Maven project that can use the MySQL driver. This pom.xml is reused for Days 1 to 6.",
      steps: [
        "Eclipse (Enterprise Edition): File > New > Maven Project > tick 'Create a simple project (skip archetype selection)' > Next",
        "Eclipse: Group Id = com.course, Artifact Id = jdbc-demo, Packaging = jar > Finish",
        "Eclipse: open pom.xml, switch to the pom.xml tab at the bottom, replace the content with the code below, save (Ctrl+S); then right-click project > Maven > Update Project > OK",
        "IntelliJ IDEA: File > New > Project > choose 'Java' on the left > Build system: Maven > JDK: 17 > Name: jdbc-demo > GroupId: com.course > Create",
        "IntelliJ: open pom.xml, paste the code below, then click the small 'Load Maven Changes' (M with refresh arrow) icon at the top right",
        "Both IDEs: expand 'Maven Dependencies' (Eclipse) or 'External Libraries' (IntelliJ) and confirm mysql-connector-j-8.4.0.jar is listed"
      ],
      code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.course</groupId>
    <artifactId>jdbc-demo</artifactId>
    <version>1.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- MySQL JDBC driver (Type 4) -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>8.4.0</version>
        </dependency>
    </dependencies>
</project>`,
      result: "Project builds with no errors. Maven Dependencies / External Libraries shows: mysql-connector-j-8.4.0.jar (and protobuf-java, a transitive dependency).",
      explanation: "Maven downloads the driver from Maven Central into ~/.m2/repository and puts it on the classpath. maven.compiler.source/target set the Java version to 17. Without the 'Update Project' (Eclipse) or 'Load Maven Changes' (IntelliJ) step the IDE will not see the JAR."
    },
    {
      title: "First JDBC program: test the connection",
      scenario: "Connect to college_db and print some information about the database to prove the setup works.",
      steps: [
        "Eclipse: right-click src/main/java > New > Class > Name: TestConnection > tick 'public static void main' > Finish",
        "IntelliJ: right-click src/main/java > New > Java Class > TestConnection",
        "Type the code below and change the password to your MySQL root password",
        "Eclipse: right-click the file > Run As > Java Application. IntelliJ: click the green Run arrow next to main",
        "Read the output in the Console / Run window"
      ],
      code: `import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestConnection {

    private static final String URL  = "jdbc:mysql://localhost:3306/college_db";
    private static final String USER = "root";
    private static final String PASS = "root";   // change to your password

    public static void main(String[] args) {
        // try-with-resources closes the connection automatically
        try (Connection con = DriverManager.getConnection(URL, USER, PASS)) {
            System.out.println("Connected successfully!");
            DatabaseMetaData meta = con.getMetaData();
            System.out.println("Database : " + meta.getDatabaseProductName());
            System.out.println("Version  : " + meta.getDatabaseProductVersion());
            System.out.println("Driver   : " + meta.getDriverName());
            System.out.println("Catalog  : " + con.getCatalog());
        } catch (SQLException e) {
            System.out.println("Connection failed: " + e.getMessage());
        }
    }
}`,
      result: "Connected successfully!\nDatabase : MySQL\nVersion  : 8.0.36\nDriver   : MySQL Connector/J\nCatalog  : college_db\n\n(The Version line shows whatever MySQL version you installed.)",
      explanation: "DriverManager finds the MySQL driver automatically (JDBC 4 service loading), opens a TCP connection to port 3306 and logs in. DatabaseMetaData gives information about the database. If the password is wrong you will instead see: Connection failed: Access denied for user 'root'@'localhost' (using password: YES)."
    },
    {
      title: "Explicit driver loading with Class.forName and common errors",
      scenario: "Old-style code and many interview answers load the driver explicitly. Also see how each common setup mistake looks.",
      steps: [
        "Create class LoadDriverDemo in the same project",
        "Type the code and run it (Run As > Java Application / green Run arrow)",
        "To see the errors: temporarily remove the dependency from pom.xml, reload Maven and run again; then restore it",
        "Stop the MySQL service and run again to see the 'Communications link failure' message"
      ],
      code: `import java.sql.Connection;
import java.sql.DriverManager;

public class LoadDriverDemo {
    public static void main(String[] args) {
        try {
            // Step 1: load and register the driver (optional since JDBC 4.0)
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("Driver loaded");

            // Step 2: get connection
            Connection con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/college_db", "root", "root");
            System.out.println("Connection object: " + con.getClass().getName());

            // Step 3: close
            con.close();
            System.out.println("Connection closed: " + con.isClosed());
        } catch (ClassNotFoundException e) {
            System.out.println("Driver JAR missing: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      result: "Driver loaded\nConnection object: com.mysql.cj.jdbc.ConnectionImpl\nConnection closed: true\n\nCommon errors:\n- JAR missing      -> Driver JAR missing: com.mysql.cj.jdbc.Driver\n- Wrong DB name    -> Error: Unknown database 'colege_db'\n- MySQL stopped    -> Error: Communications link failure ...\n- Wrong password   -> Error: Access denied for user 'root'@'localhost' (using password: YES)",
      explanation: "Class.forName loads the driver class; its static block calls DriverManager.registerDriver. The real Connection object is the vendor class com.mysql.cj.jdbc.ConnectionImpl, which implements the java.sql.Connection interface. This proves the 'interfaces in JDK, implementation in driver' design."
    }
  ],
  interview: [
    { q: "What is JDBC?", a: "JDBC (Java Database Connectivity) is a Java API in java.sql/javax.sql used to connect to relational databases, execute SQL and process results. It defines interfaces; database vendors implement them in drivers.", level: "Easy" },
    { q: "What are the main components of JDBC?", a: "DriverManager, Driver, Connection, Statement, PreparedStatement, CallableStatement, ResultSet, ResultSetMetaData, DatabaseMetaData and SQLException.", level: "Easy" },
    { q: "Explain the four types of JDBC drivers.", a: "Type 1 JDBC-ODBC bridge (removed in Java 8), Type 2 native-API partly Java, Type 3 network protocol via middleware, Type 4 thin pure Java driver that speaks the DB protocol directly. Type 4 is fastest and most portable and is used most.", level: "Medium" },
    { q: "Which driver type is MySQL Connector/J?", a: "Type 4 (pure Java thin driver).", level: "Easy" },
    { q: "Is Class.forName() required to load the driver?", a: "Not since JDBC 4.0 (Java 6). Drivers are auto-registered through META-INF/services/java.sql.Driver using ServiceLoader. It is still harmless and sometimes used in web containers where auto-loading from WEB-INF/lib may not happen at the right time.", level: "Medium" },
    { q: "What does Class.forName(\"com.mysql.cj.jdbc.Driver\") actually do?", a: "It loads the class into the JVM, which runs its static initializer block. That block creates a Driver object and calls DriverManager.registerDriver() with it.", level: "Medium" },
    { q: "What is the format of a JDBC URL for MySQL?", a: "jdbc:mysql://host:port/database?options, for example jdbc:mysql://localhost:3306/college_db?useSSL=false.", level: "Easy" },
    { q: "Difference between java.sql and javax.sql?", a: "java.sql has the core API (DriverManager, Connection, Statement, ResultSet). javax.sql has extensions for server-side use such as DataSource, connection pooling (PooledConnection), RowSet and distributed transactions.", level: "Medium" },
    { q: "Why is JDBC called database independent?", a: "Code is written against JDBC interfaces only. To switch databases you change the driver JAR and the URL (and any vendor specific SQL); the Java code using Connection/Statement/ResultSet stays the same.", level: "Medium" },
    { q: "What causes 'No suitable driver found for jdbc:mysql://...'?", a: "Either the driver JAR is not on the classpath, or the URL is misspelt (e.g. jdbc:mysq:// or missing jdbc:), so no registered driver accepts the URL.", level: "Medium" },
    { q: "What is DriverManager vs DataSource?", a: "DriverManager is a basic class that creates a new physical connection each time. DataSource (javax.sql) is a factory interface preferred in real apps; it supports connection pooling and is configured outside the code (e.g. HikariCP, Tomcat JNDI).", level: "Hard" }
  ],
  practice: [
    {
      task: "Write a SQL script that creates a database shop_db with a table products(id, name, price DECIMAL(10,2), stock) and inserts 4 products.",
      hint: "Use AUTO_INCREMENT PRIMARY KEY for id and DECIMAL for money.",
      solution: `CREATE DATABASE IF NOT EXISTS shop_db;
USE shop_db;
CREATE TABLE products (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(60) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0
);
INSERT INTO products (name, price, stock) VALUES
('Keyboard', 799.00, 25),
('Mouse',    399.50, 40),
('Monitor', 8999.00, 10),
('Webcam',  1499.00, 15);
SELECT * FROM products;`
    },
    {
      task: "Write a Java program that connects to shop_db and prints the database product name, driver version and whether the connection is read-only.",
      hint: "Use con.getMetaData().getDriverVersion() and con.isReadOnly().",
      solution: `import java.sql.*;

public class ShopConnection {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/shop_db";
        try (Connection con = DriverManager.getConnection(url, "root", "root")) {
            DatabaseMetaData md = con.getMetaData();
            System.out.println("Product  : " + md.getDatabaseProductName());
            System.out.println("Driver v : " + md.getDriverVersion());
            System.out.println("ReadOnly : " + con.isReadOnly());
        } catch (SQLException e) {
            System.out.println("Failed: " + e.getMessage());
        }
    }
}`
    },
    {
      task: "Create a reusable DBUtil class with a static getConnection() method that reads URL, user and password from constants, and use it from a Main class.",
      hint: "Make the constructor private; declare 'throws SQLException' on getConnection().",
      solution: `import java.sql.*;

class DBUtil {
    private static final String URL  = "jdbc:mysql://localhost:3306/college_db";
    private static final String USER = "root";
    private static final String PASS = "root";

    private DBUtil() { }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }
}

public class Main {
    public static void main(String[] args) {
        try (Connection con = DBUtil.getConnection()) {
            System.out.println("Connected to " + con.getCatalog());
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }
}`
    },
    {
      task: "Write a program that lists all tables of college_db using DatabaseMetaData.getTables().",
      hint: "getTables(catalog, schemaPattern, tableNamePattern, types) returns a ResultSet; column TABLE_NAME holds the name.",
      solution: `import java.sql.*;

public class ListTables {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/college_db", "root", "root")) {
            DatabaseMetaData md = con.getMetaData();
            try (ResultSet rs = md.getTables("college_db", null, "%", new String[]{"TABLE"})) {
                while (rs.next()) {
                    System.out.println("Table: " + rs.getString("TABLE_NAME"));
                }
            }
        }
    }
}`
    }
  ],
  quiz: [
    { question: "Which package contains the core JDBC interfaces like Connection and ResultSet?", options: ["java.sql", "java.db", "javax.jdbc", "java.io"], answer: 0, explanation: "Core JDBC lives in java.sql; javax.sql adds DataSource and pooling." },
    { question: "Which JDBC driver type is pure Java and talks directly to the database protocol?", options: ["Type 1", "Type 2", "Type 4", "Type 3"], answer: 2, explanation: "Type 4 (thin) drivers are written fully in Java and use the database's own network protocol." },
    { question: "What is the correct modern MySQL driver class name?", options: ["com.mysql.jdbc.Driver", "mysql.jdbc.Driver", "org.mysql.Driver", "com.mysql.cj.jdbc.Driver"], answer: 3, explanation: "com.mysql.cj.jdbc.Driver is used from Connector/J 8; com.mysql.jdbc.Driver is deprecated." },
    { question: "What is the default port of MySQL?", options: ["1521", "3306", "5432", "8080"], answer: 1, explanation: "MySQL listens on 3306; 1521 is Oracle, 5432 PostgreSQL, 8080 Tomcat." },
    { question: "Which class is used to obtain a Connection in basic JDBC code?", options: ["ConnectionFactory", "Driver", "DriverManager", "ResultSet"], answer: 2, explanation: "DriverManager.getConnection(url, user, password) returns a Connection." }
  ]
};
