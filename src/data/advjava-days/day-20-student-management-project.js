export default {
  id: 'day-20-student-management-project',
  title: 'Advanced Java Project: Student Management System (CRUD with MVC) and Interview Questions',
  module: 'Module 4: Project',
  day: 20,
  level: 'Advanced',
  duration: '6 hours',
  summary: 'Build a complete Student Management System with login, add/edit/delete/search, pagination, validation, filters, a listener, error pages and secure password hashing using Servlets, JSP, JSTL 3, JDBC and MySQL on Tomcat 10 - then revise the whole Advanced Java course with 25 interview questions.',
  objectives: [
    'Design a layered MVC web application: model, DAO, service, controller, view, filter and listener',
    'Implement full CRUD with JDBC PreparedStatement, server-side validation and Post/Redirect/Get',
    'Add login/logout with hashed passwords, an authentication filter and flash messages',
    'Add search with pagination and friendly error pages',
    'Run the project in Eclipse and IntelliJ, package it as a WAR and deploy it on standalone Tomcat 10.1',
  ],
  theory: [
    {
      heading: 'Project requirements (what we are building)',
      content:
        'A training institute wants a small web app to manage its students.\n\nFunctional requirements:\n1. Admin logs in with username and password (stored hashed). Wrong login shows an error.\n2. After login, the admin sees a list of students (roll no, name, email, course, marks, grade), 5 per page.\n3. Admin can search by name, roll number or course.\n4. Admin can add a new student, edit an existing one and delete one (with confirmation).\n5. Validation: roll no required and unique, name required (2-100 chars), valid email, course from a list, marks 0-100.\n6. Success messages after add/edit/delete ("flash" messages).\n7. All student pages are protected; logout ends the session.\n8. Friendly 404 and 500 pages.\n\nNon-functional: MVC, no SQL in JSP, no Java code in JSP (EL + JSTL only), PreparedStatement everywhere, UTF-8 support, works on Tomcat 10.1 with Java 17/21 and MySQL 8.',
    },
    {
      heading: 'Architecture and request flow',
      content:
        'Layers (top to bottom):\n- View: JSP pages in WEB-INF/views (login.jsp, student-list.jsp, student-form.jsp) + fragments header.jspf/footer.jspf.\n- Controller: LoginServlet (/login), LogoutServlet (/logout), StudentController (/students/*).\n- Service: StudentService - validation and business rules.\n- DAO: StudentDao/StudentDaoImpl, UserDao - SQL only.\n- Model: Student, User beans.\n- Utility: DBUtil (connections), PasswordUtil (PBKDF2 hashing).\n- Cross-cutting: EncodingFilter (/*), AuthFilter (/students/*), AppInitListener (creates default admin at startup).\n\nFlow for "Add student":\nBrowser GET /students/new -> AuthFilter (logged in?) -> StudentController.showForm -> forward student-form.jsp\nBrowser POST /students/save -> EncodingFilter -> AuthFilter -> StudentController.save -> StudentService.validate -> (errors? forward form again) -> StudentDao.insert -> session flash -> redirect /students -> list page shows "Student added".',
    },
    {
      heading: 'URL design of StudentController',
      content: 'One front controller mapped to /students/* uses request.getPathInfo() to choose the action:',
      points: [
        'GET /students or /students/ -> list (with ?q=keyword&page=n)',
        'GET /students/new -> empty form',
        'GET /students/edit?id=5 -> form filled with student 5',
        'POST /students/save -> insert (id=0) or update (id>0)',
        'POST /students/delete -> delete by id (POST, not a GET link, so it cannot be triggered by a simple link or crawler)',
        'Anything else -> 404',
      ],
      tip: 'getServletPath() returns "/students" and getPathInfo() returns the rest ("/new", "/edit", or null). This is the same idea Spring MVC uses with @GetMapping("/students/new").',
    },
    {
      heading: 'Database design',
      content:
        'Two tables in database studentdb:\n- users(id PK, username UNIQUE, password_hash, full_name)\n- students(id PK AUTO_INCREMENT, roll_no UNIQUE, name, email, course, marks CHECK 0-100, created_at DEFAULT CURRENT_TIMESTAMP)\n\nThe UNIQUE constraint on roll_no is the final protection against duplicates even if two admins save at the same moment; the service also checks it first to give a friendly message. Grade is not stored; it is calculated from marks in the bean (getGrade()), so it can never become inconsistent.',
    },
    {
      heading: 'Key techniques used (revision of the course)',
      content: 'This project reuses almost every topic of Advanced Java:',
      points: [
        'JDBC: DriverManager, PreparedStatement, ResultSet mapping, generated keys, try-with-resources, LIMIT/OFFSET (Days 2-6, 19).',
        'DAO pattern and layered design (Days 6, 18).',
        'Servlet lifecycle init(), doGet/doPost, @WebServlet, path info (Days 8-10).',
        'forward for views, sendRedirect after POST (PRG) (Day 11).',
        'HttpSession for login and flash messages, changeSessionId, invalidate (Day 12).',
        'Filters for encoding and authentication, ServletContextListener for startup (Day 13).',
        'JSP include directive for layout, EL, JSTL core/fmt/fn (Days 15-17).',
        'Error pages, XSS-safe output with c:out, password hashing (Day 19).',
      ],
    },
    {
      heading: 'Common mistakes in such projects',
      content: 'Check your project against this list before submitting:',
      points: [
        'JSTL jars missing or javax version used -> "cannot resolve jakarta.tags.core" or ClassNotFoundException javax.servlet...',
        'Mixing javax.servlet imports with Tomcat 10 -> 404 because the Servlet is never registered. Use jakarta.servlet.',
        'Forgetting mysql-connector-j in WEB-INF/lib -> "No suitable driver".',
        'Forward after POST -> duplicate rows on refresh.',
        'Auth filter on /* without excluding /login and CSS -> redirect loop.',
        'Printing user data with ${...} instead of c:out -> XSS.',
        'Comparing Integer objects with == in Java, or forgetting null checks on parameters -> NumberFormatException/NullPointerException (500 page).',
        'Not closing connections -> "Too many connections" after some time. Always use try-with-resources.',
      ],
    },
  ],
  examples: [
    {
      title: 'Part 1: Database script, pom.xml and project structure',
      scenario: 'Create the database and a Maven WAR project "student-management" in Eclipse or IntelliJ, with the exact folder structure used by the rest of the project.',
      steps: [
        'Install: JDK 17 (or 21), Apache Tomcat 10.1.x (unzip), MySQL 8 Server + Workbench, Eclipse IDE for Enterprise Java and Web Developers or IntelliJ IDEA Ultimate.',
        'Run the SQL script below in MySQL Workbench (File > New Query Tab > paste > click the lightning icon).',
        'IntelliJ: File > New > Project > Jakarta EE > Name student-management, Template Web application, Application server Tomcat 10.1 (New... > select Tomcat home), Build system Maven, Group com.sms, JDK 17 > Next > Version Jakarta EE 10, tick Servlet only > Create. Replace pom.xml with the one below and click Load Maven Changes. Delete the generated HelloServlet and index.jsp.',
        'Eclipse: Window > Preferences > Server > Runtime Environments > Add > Apache Tomcat v10.1 > select folder > Finish. Then File > New > Maven Project > tick Create a simple project > Group com.sms, Artifact student-management, Packaging war > Finish. Replace pom.xml, right-click project > Maven > Update Project (Alt+F5). Right-click project > Properties > Project Facets > Convert to faceted form if asked > tick Dynamic Web Module 6.0, Java 17, JavaScript > Runtimes tab tick Apache Tomcat v10.1 > Apply and Close.',
        'Create packages under src/main/java: com.sms.model, com.sms.util, com.sms.dao, com.sms.service, com.sms.web, com.sms.filter, com.sms.listener.',
        'Create folders src/main/webapp/WEB-INF/views, WEB-INF/views/common, WEB-INF/errors, and file src/main/resources/db.properties.',
      ],
      code: `-- ===== studentdb.sql =====
CREATE DATABASE IF NOT EXISTS studentdb CHARACTER SET utf8mb4;
USE studentdb;

CREATE TABLE IF NOT EXISTS users (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(200) NOT NULL,
  full_name     VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  roll_no    VARCHAR(20)  NOT NULL UNIQUE,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(120) NOT NULL,
  course     VARCHAR(50)  NOT NULL,
  marks      INT NOT NULL CHECK (marks BETWEEN 0 AND 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO students (roll_no, name, email, course, marks) VALUES
 ('S101', 'Asha Patil',   'asha@mail.com',   'Java Full Stack', 91),
 ('S102', 'Ravi Kumar',   'ravi@mail.com',   'Python',          74),
 ('S103', 'Kiran Rao',    'kiran@mail.com',  'Java Full Stack', 58),
 ('S104', 'Meena Shah',   'meena@mail.com',  'Data Analytics',  83),
 ('S105', 'Arjun Singh',  'arjun@mail.com',  'Python',          32),
 ('S106', 'Pooja Desai',  'pooja@mail.com',  'Java Full Stack', 67),
 ('S107', 'Sameer Khan',  'sameer@mail.com', 'Data Analytics',  45);
-- users table stays empty: the app creates admin / admin@123 at first start

<!-- ===== pom.xml ===== -->
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.sms</groupId>
  <artifactId>student-management</artifactId>
  <version>1.0</version>
  <packaging>war</packaging>

  <properties>
    <maven.compiler.release>17</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <!-- provided by Tomcat 10.1 -->
    <dependency>
      <groupId>jakarta.servlet</groupId>
      <artifactId>jakarta.servlet-api</artifactId>
      <version>6.0.0</version>
      <scope>provided</scope>
    </dependency>
    <!-- JSTL 3.0 (must be packaged) -->
    <dependency>
      <groupId>jakarta.servlet.jsp.jstl</groupId>
      <artifactId>jakarta.servlet.jsp.jstl-api</artifactId>
      <version>3.0.0</version>
    </dependency>
    <dependency>
      <groupId>org.glassfish.web</groupId>
      <artifactId>jakarta.servlet.jsp.jstl</artifactId>
      <version>3.0.1</version>
    </dependency>
    <!-- MySQL driver (must be packaged) -->
    <dependency>
      <groupId>com.mysql</groupId>
      <artifactId>mysql-connector-j</artifactId>
      <version>8.4.0</version>
    </dependency>
  </dependencies>

  <build>
    <finalName>student-management</finalName>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-war-plugin</artifactId>
        <version>3.4.0</version>
      </plugin>
    </plugins>
  </build>
</project>

# ===== src/main/resources/db.properties =====
db.url=jdbc:mysql://localhost:3306/studentdb?useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true
db.user=root
db.password=root

===== Final project structure =====
student-management
 |- pom.xml
 |- src/main/java/com/sms
 |    |- model/      Student.java, User.java
 |    |- util/       DBUtil.java, PasswordUtil.java
 |    |- dao/        StudentDao.java, StudentDaoImpl.java, UserDao.java
 |    |- service/    StudentService.java
 |    |- web/        LoginServlet.java, LogoutServlet.java, StudentController.java
 |    |- filter/     EncodingFilter.java, AuthFilter.java
 |    |- listener/   AppInitListener.java
 |- src/main/resources/db.properties
 |- src/main/webapp
      |- index.jsp
      |- css/style.css
      |- WEB-INF/web.xml
      |- WEB-INF/views/login.jsp, student-list.jsp, student-form.jsp
      |- WEB-INF/views/common/header.jspf, footer.jspf
      |- WEB-INF/errors/404.jsp, 500.jsp`,
      result: 'SELECT COUNT(*) FROM students; -> 7\nSELECT COUNT(*) FROM users; -> 0\nThe Maven project imports without errors and shows the packages and folders listed above.',
      explanation: 'Servlet API is "provided" because Tomcat already has it; JSTL and the MySQL driver are not part of Tomcat, so they use the default compile scope and get copied to WEB-INF/lib. The CHECK constraint is enforced by MySQL 8.0.16+.',
    },
    {
      title: 'Part 2: Model beans and utility classes',
      scenario: 'Create Student and User beans, DBUtil for connections and PasswordUtil for PBKDF2 password hashing.',
      steps: [
        'Create each class in its package (IntelliJ: right-click package > New > Java Class; Eclipse: right-click package > New > Class).',
        'Generate getters/setters (IntelliJ: Alt+Insert > Getter and Setter; Eclipse: Source > Generate Getters and Setters).',
      ],
      code: `// ===== com/sms/model/Student.java =====
package com.sms.model;

public class Student {
    private int id;
    private String rollNo;
    private String name;
    private String email;
    private String course;
    private int marks;

    public Student() { }

    public Student(int id, String rollNo, String name, String email, String course, int marks) {
        this.id = id;
        this.rollNo = rollNo;
        this.name = name;
        this.email = email;
        this.course = course;
        this.marks = marks;
    }

    /** Derived property, used in JSP as \${s.grade} */
    public String getGrade() {
        if (marks >= 75) return "Distinction";
        if (marks >= 60) return "First Class";
        if (marks >= 35) return "Pass";
        return "Fail";
    }

    public boolean isNew() { return id == 0; }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public int getMarks() { return marks; }
    public void setMarks(int marks) { this.marks = marks; }
}

// ===== com/sms/model/User.java =====
package com.sms.model;

public class User {
    private int id;
    private String username;
    private String passwordHash;
    private String fullName;

    public User() { }

    public User(int id, String username, String passwordHash, String fullName) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
    }

    public int getId() { return id; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getFullName() { return fullName; }
}

// ===== com/sms/util/DBUtil.java =====
package com.sms.util;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public final class DBUtil {
    private static final Properties PROPS = new Properties();

    static {
        try (InputStream in = DBUtil.class.getClassLoader().getResourceAsStream("db.properties")) {
            if (in == null) {
                throw new IllegalStateException("db.properties not found on classpath");
            }
            PROPS.load(in);
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (IOException | ClassNotFoundException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    private DBUtil() { }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
                PROPS.getProperty("db.url"),
                PROPS.getProperty("db.user"),
                PROPS.getProperty("db.password"));
    }
}

// ===== com/sms/util/PasswordUtil.java =====
package com.sms.util;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public final class PasswordUtil {
    private static final int ITERATIONS = 210_000;
    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordUtil() { }

    public static String hash(String password) {
        byte[] salt = new byte[16];
        RANDOM.nextBytes(salt);
        byte[] h = pbkdf2(password, salt, ITERATIONS);
        return ITERATIONS + ":" + Base64.getEncoder().encodeToString(salt)
                + ":" + Base64.getEncoder().encodeToString(h);
    }

    public static boolean verify(String password, String stored) {
        if (password == null || stored == null) return false;
        String[] parts = stored.split(":");
        if (parts.length != 3) return false;
        int it = Integer.parseInt(parts[0]);
        byte[] salt = Base64.getDecoder().decode(parts[1]);
        byte[] expected = Base64.getDecoder().decode(parts[2]);
        return MessageDigest.isEqual(expected, pbkdf2(password, salt, it));
    }

    private static byte[] pbkdf2(String password, byte[] salt, int iterations) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, 256);
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
                    .generateSecret(spec).getEncoded();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Hashing failed", e);
        }
    }
}`,
      result: 'All classes compile (Build > Build Project in IntelliJ, or automatic build in Eclipse shows no red markers).',
      explanation: 'Student follows JavaBean rules so EL can read rollNo, name, grade (from getGrade) and new (from isNew). User has no setters because it is only read from the database. Passwords are never stored in plain text.',
    },
    {
      title: 'Part 3: DAO layer (JDBC)',
      scenario: 'Write all SQL in one place: search with pagination, count, find by id, insert, update, delete, roll number check, and user lookup.',
      steps: [
        'Create interface com.sms.dao.StudentDao and class StudentDaoImpl.',
        'Create class com.sms.dao.UserDao.',
        'Tip: test each SQL statement first in MySQL Workbench.',
      ],
      code: `// ===== com/sms/dao/StudentDao.java =====
package com.sms.dao;

import com.sms.model.Student;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public interface StudentDao {
    List<Student> search(String keyword, int offset, int limit) throws SQLException;
    int count(String keyword) throws SQLException;
    Optional<Student> findById(int id) throws SQLException;
    boolean rollNoExists(String rollNo, int excludeId) throws SQLException;
    int insert(Student s) throws SQLException;
    boolean update(Student s) throws SQLException;
    boolean delete(int id) throws SQLException;
}

// ===== com/sms/dao/StudentDaoImpl.java =====
package com.sms.dao;

import com.sms.model.Student;
import com.sms.util.DBUtil;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class StudentDaoImpl implements StudentDao {

    private static final String COLUMNS = "id, roll_no, name, email, course, marks";
    private static final String WHERE_SEARCH = " WHERE name LIKE ? OR roll_no LIKE ? OR course LIKE ?";

    @Override
    public List<Student> search(String keyword, int offset, int limit) throws SQLException {
        String sql = "SELECT " + COLUMNS + " FROM students" + WHERE_SEARCH
                   + " ORDER BY id LIMIT ? OFFSET ?";
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            int i = setSearch(ps, keyword);
            ps.setInt(i++, limit);
            ps.setInt(i, offset);
            try (ResultSet rs = ps.executeQuery()) {
                List<Student> list = new ArrayList<>();
                while (rs.next()) list.add(map(rs));
                return list;
            }
        }
    }

    @Override
    public int count(String keyword) throws SQLException {
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM students" + WHERE_SEARCH)) {
            setSearch(ps, keyword);
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                return rs.getInt(1);
            }
        }
    }

    @Override
    public Optional<Student> findById(int id) throws SQLException {
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement("SELECT " + COLUMNS + " FROM students WHERE id = ?")) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(map(rs)) : Optional.empty();
            }
        }
    }

    @Override
    public boolean rollNoExists(String rollNo, int excludeId) throws SQLException {
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     "SELECT 1 FROM students WHERE roll_no = ? AND id <> ?")) {
            ps.setString(1, rollNo);
            ps.setInt(2, excludeId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    @Override
    public int insert(Student s) throws SQLException {
        String sql = "INSERT INTO students (roll_no, name, email, course, marks) VALUES (?, ?, ?, ?, ?)";
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            fill(ps, s);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) s.setId(keys.getInt(1));
            }
            return s.getId();
        }
    }

    @Override
    public boolean update(Student s) throws SQLException {
        String sql = "UPDATE students SET roll_no = ?, name = ?, email = ?, course = ?, marks = ? WHERE id = ?";
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            fill(ps, s);
            ps.setInt(6, s.getId());
            return ps.executeUpdate() == 1;
        }
    }

    @Override
    public boolean delete(int id) throws SQLException {
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement("DELETE FROM students WHERE id = ?")) {
            ps.setInt(1, id);
            return ps.executeUpdate() == 1;
        }
    }

    // ---- helpers ----
    private int setSearch(PreparedStatement ps, String keyword) throws SQLException {
        String like = "%" + (keyword == null ? "" : keyword) + "%";
        ps.setString(1, like);
        ps.setString(2, like);
        ps.setString(3, like);
        return 4;                       // next parameter index
    }

    private void fill(PreparedStatement ps, Student s) throws SQLException {
        ps.setString(1, s.getRollNo());
        ps.setString(2, s.getName());
        ps.setString(3, s.getEmail());
        ps.setString(4, s.getCourse());
        ps.setInt(5, s.getMarks());
    }

    private Student map(ResultSet rs) throws SQLException {
        return new Student(rs.getInt("id"), rs.getString("roll_no"), rs.getString("name"),
                rs.getString("email"), rs.getString("course"), rs.getInt("marks"));
    }
}

// ===== com/sms/dao/UserDao.java =====
package com.sms.dao;

import com.sms.model.User;
import com.sms.util.DBUtil;
import java.sql.*;
import java.util.Optional;

public class UserDao {

    public Optional<User> findByUsername(String username) throws SQLException {
        String sql = "SELECT id, username, password_hash, full_name FROM users WHERE username = ?";
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return Optional.empty();
                return Optional.of(new User(rs.getInt(1), rs.getString(2), rs.getString(3), rs.getString(4)));
            }
        }
    }

    public int count() throws SQLException {
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM users");
             ResultSet rs = ps.executeQuery()) {
            rs.next();
            return rs.getInt(1);
        }
    }

    public void insert(String username, String passwordHash, String fullName) throws SQLException {
        String sql = "INSERT INTO users (username, password_hash, full_name) VALUES (?, ?, ?)";
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, username);
            ps.setString(2, passwordHash);
            ps.setString(3, fullName);
            ps.executeUpdate();
        }
    }
}`,
      result: 'Compiles. With the sample data:\ncount("") -> 7, count("java") -> 3 (S101, S103, S106 - LIKE is case-insensitive with MySQL default collation)\nsearch("", 0, 5) -> S101..S105; search("", 5, 5) -> S106, S107\nrollNoExists("S101", 0) -> true; rollNoExists("S101", 1) -> false (its own row is excluded during edit)',
      explanation: 'Every query uses PreparedStatement, so search text like \' OR 1=1 -- is treated as plain text. The same WHERE clause is used for count and search so pagination numbers always match. Each method opens and closes its own connection via try-with-resources.',
    },
    {
      title: 'Part 4: Service, controllers, filters and listener',
      scenario: 'Add validation rules in StudentService, the StudentController front controller, login/logout Servlets, encoding and auth filters, and a listener that creates the default admin.',
      steps: [
        'Create StudentService in com.sms.service.',
        'Create StudentController, LoginServlet, LogoutServlet in com.sms.web.',
        'Create EncodingFilter and AuthFilter in com.sms.filter, AppInitListener in com.sms.listener.',
        'Note: filter order matters only slightly here (encoding should be first). For a guaranteed order you can declare them in web.xml instead of annotations (Day 13).',
      ],
      code: `// ===== com/sms/service/StudentService.java =====
package com.sms.service;

import com.sms.dao.StudentDao;
import com.sms.model.Student;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

public class StudentService {
    public static final List<String> COURSES =
            List.of("Java Full Stack", "Python", "Data Analytics", "Web Development");
    private static final Pattern EMAIL = Pattern.compile("^[\\\\w.+-]+@[\\\\w-]+(\\\\.[\\\\w-]+)+$");

    private final StudentDao dao;

    public StudentService(StudentDao dao) { this.dao = dao; }

    public List<Student> search(String q, int offset, int limit) throws SQLException {
        return dao.search(q, offset, limit);
    }
    public int count(String q) throws SQLException { return dao.count(q); }
    public Optional<Student> find(int id) throws SQLException { return dao.findById(id); }
    public boolean delete(int id) throws SQLException { return dao.delete(id); }

    /** Validates fields, sets marks if valid, and returns field -> message. */
    public Map<String, String> validate(Student s, String marksText) throws SQLException {
        Map<String, String> errors = new LinkedHashMap<>();

        if (isBlank(s.getRollNo())) {
            errors.put("rollNo", "Roll number is required");
        } else if (!s.getRollNo().matches("[A-Za-z0-9-]{2,20}")) {
            errors.put("rollNo", "Use 2-20 letters, digits or -");
        } else if (dao.rollNoExists(s.getRollNo(), s.getId())) {
            errors.put("rollNo", "Roll number already exists");
        }

        if (isBlank(s.getName()) || s.getName().length() < 2 || s.getName().length() > 100) {
            errors.put("name", "Name must be 2-100 characters");
        }
        if (isBlank(s.getEmail()) || !EMAIL.matcher(s.getEmail()).matches()) {
            errors.put("email", "Enter a valid email");
        }
        if (!COURSES.contains(s.getCourse())) {
            errors.put("course", "Select a course");
        }
        try {
            int m = Integer.parseInt(marksText == null ? "" : marksText.trim());
            if (m < 0 || m > 100) errors.put("marks", "Marks must be between 0 and 100");
            else s.setMarks(m);
        } catch (NumberFormatException e) {
            errors.put("marks", "Marks must be a whole number");
        }
        return errors;
    }

    public void save(Student s) throws SQLException {
        if (s.isNew()) dao.insert(s);
        else dao.update(s);
    }

    private static boolean isBlank(String v) { return v == null || v.isBlank(); }
}

// ===== com/sms/web/StudentController.java =====
package com.sms.web;

import com.sms.dao.StudentDaoImpl;
import com.sms.model.Student;
import com.sms.service.StudentService;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;
import java.util.Optional;

@WebServlet("/students/*")
public class StudentController extends HttpServlet {

    private static final int PAGE_SIZE = 5;
    private static final String LIST_VIEW = "/WEB-INF/views/student-list.jsp";
    private static final String FORM_VIEW = "/WEB-INF/views/student-form.jsp";

    private StudentService service;

    @Override
    public void init() {
        service = new StudentService(new StudentDaoImpl());
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String path = req.getPathInfo() == null ? "/" : req.getPathInfo();
        try {
            switch (path) {
                case "/", "/list" -> list(req, resp);
                case "/new" -> showForm(req, resp, new Student());
                case "/edit" -> edit(req, resp);
                default -> resp.sendError(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (SQLException e) {
            throw new ServletException("Database error", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String path = req.getPathInfo() == null ? "/" : req.getPathInfo();
        try {
            switch (path) {
                case "/save" -> save(req, resp);
                case "/delete" -> delete(req, resp);
                default -> resp.sendError(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (SQLException e) {
            throw new ServletException("Database error", e);
        }
    }

    // ---------- actions ----------
    private void list(HttpServletRequest req, HttpServletResponse resp)
            throws SQLException, ServletException, IOException {
        String q = req.getParameter("q") == null ? "" : req.getParameter("q").trim();
        int total = service.count(q);
        int totalPages = Math.max(1, (total + PAGE_SIZE - 1) / PAGE_SIZE);
        int page = Math.min(Math.max(toInt(req.getParameter("page"), 1), 1), totalPages);

        req.setAttribute("students", service.search(q, (page - 1) * PAGE_SIZE, PAGE_SIZE));
        req.setAttribute("q", q);
        req.setAttribute("page", page);
        req.setAttribute("totalPages", totalPages);
        req.setAttribute("total", total);
        req.getRequestDispatcher(LIST_VIEW).forward(req, resp);
    }

    private void edit(HttpServletRequest req, HttpServletResponse resp)
            throws SQLException, ServletException, IOException {
        Optional<Student> s = service.find(toInt(req.getParameter("id"), 0));
        if (s.isEmpty()) {
            flash(req, "Student not found");
            resp.sendRedirect(req.getContextPath() + "/students");
            return;
        }
        showForm(req, resp, s.get());
    }

    private void showForm(HttpServletRequest req, HttpServletResponse resp, Student s)
            throws ServletException, IOException {
        req.setAttribute("student", s);
        req.setAttribute("courses", StudentService.COURSES);
        req.getRequestDispatcher(FORM_VIEW).forward(req, resp);
    }

    private void save(HttpServletRequest req, HttpServletResponse resp)
            throws SQLException, ServletException, IOException {
        Student s = new Student();
        s.setId(toInt(req.getParameter("id"), 0));
        s.setRollNo(trim(req.getParameter("rollNo")));
        s.setName(trim(req.getParameter("name")));
        s.setEmail(trim(req.getParameter("email")));
        s.setCourse(trim(req.getParameter("course")));

        Map<String, String> errors = service.validate(s, req.getParameter("marks"));
        if (!errors.isEmpty()) {
            req.setAttribute("errors", errors);
            showForm(req, resp, s);                // same request: typed values kept
            return;
        }
        boolean created = s.isNew();
        service.save(s);
        flash(req, (created ? "Student added: " : "Student updated: ") + s.getName());
        resp.sendRedirect(req.getContextPath() + "/students");      // PRG
    }

    private void delete(HttpServletRequest req, HttpServletResponse resp)
            throws SQLException, IOException {
        int id = toInt(req.getParameter("id"), 0);
        flash(req, service.delete(id) ? "Student deleted (id " + id + ")" : "Student not found");
        resp.sendRedirect(req.getContextPath() + "/students");
    }

    // ---------- helpers ----------
    private static int toInt(String v, int def) {
        try { return Integer.parseInt(v); } catch (NumberFormatException e) { return def; }
    }
    private static String trim(String v) { return v == null ? null : v.trim(); }
    private static void flash(HttpServletRequest req, String msg) {
        req.getSession().setAttribute("flash", msg);
    }
}

// ===== com/sms/web/LoginServlet.java =====
package com.sms.web;

import com.sms.dao.UserDao;
import com.sms.model.User;
import com.sms.util.PasswordUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Optional;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    private final UserDao userDao = new UserDao();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        req.getRequestDispatcher("/WEB-INF/views/login.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String username = req.getParameter("username");
        String password = req.getParameter("password");
        try {
            Optional<User> user = userDao.findByUsername(username);
            if (user.isPresent() && PasswordUtil.verify(password, user.get().getPasswordHash())) {
                HttpSession session = req.getSession();
                req.changeSessionId();                         // stop session fixation
                session.setAttribute("loggedUser", user.get());
                resp.sendRedirect(req.getContextPath() + "/students");
            } else {
                req.setAttribute("error", "Invalid username or password");
                req.getRequestDispatcher("/WEB-INF/views/login.jsp").forward(req, resp);
            }
        } catch (SQLException e) {
            throw new ServletException("Database error", e);
        }
    }
}

// ===== com/sms/web/LogoutServlet.java =====
package com.sms.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/logout")
public class LogoutServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) session.invalidate();
        resp.sendRedirect(req.getContextPath() + "/login?logout=1");
    }
}

// ===== com/sms/filter/EncodingFilter.java =====
package com.sms.filter;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import java.io.IOException;

@WebFilter("/*")
public class EncodingFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        req.setCharacterEncoding("UTF-8");
        res.setCharacterEncoding("UTF-8");
        chain.doFilter(req, res);
    }
}

// ===== com/sms/filter/AuthFilter.java =====
package com.sms.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebFilter("/students/*")
public class AuthFilter extends HttpFilter {
    @Override
    protected void doFilter(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("loggedUser") == null) {
            res.sendRedirect(req.getContextPath() + "/login");
            return;
        }
        res.setHeader("Cache-Control", "no-store");   // Back button after logout shows nothing
        chain.doFilter(req, res);
    }
}

// ===== com/sms/listener/AppInitListener.java =====
package com.sms.listener;

import com.sms.dao.UserDao;
import com.sms.util.PasswordUtil;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import java.sql.SQLException;

@WebListener
public class AppInitListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        UserDao dao = new UserDao();
        try {
            if (dao.count() == 0) {
                dao.insert("admin", PasswordUtil.hash("admin@123"), "Administrator");
                sce.getServletContext().log("Default user created: admin / admin@123 (change it!)");
            }
        } catch (SQLException e) {
            sce.getServletContext().log("Could not create default user - is MySQL running?", e);
        }
        sce.getServletContext().setAttribute("appName", "Student Management System");
    }
}`,
      result: 'Everything compiles. At first start Tomcat log prints: "Default user created: admin / admin@123 (change it!)" and SELECT * FROM users shows one row whose password_hash looks like 210000:xxxx==:yyyy= (random).',
      explanation: 'The controller has no SQL and no HTML; the service owns the rules; the DAO owns the SQL. Validation errors forward back (same request, so entered values are kept), while successful saves redirect with a flash message stored in session. The email regex is written with \\\\ in Java source, which becomes a single backslash in the actual pattern.',
    },
    {
      title: 'Part 5: JSP views, web.xml and CSS',
      scenario: 'Create the layout fragments, login page, list page with search/pagination/delete, the shared add/edit form, error pages and web.xml.',
      steps: [
        'Create each file at the path given in its comment.',
        'In Eclipse use New > JSP File (for .jspf choose New > File and type the name). In IntelliJ use New > JSP/JSPX file or New > File.',
        'Make sure every JSP uses EL/JSTL only - no <% %> scriptlets.',
      ],
      code: `<%-- ===== WEB-INF/views/common/header.jspf ===== --%>
<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<c:set var="ctx" value="\${pageContext.request.contextPath}"/>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>\${applicationScope.appName}</title>
  <link rel="stylesheet" href="\${ctx}/css/style.css">
</head>
<body>
<header class="top">
  <strong>\${applicationScope.appName}</strong>
  <c:if test="\${not empty sessionScope.loggedUser}">
    <span>Hi, <c:out value="\${sessionScope.loggedUser.fullName}"/>
      <form action="\${ctx}/logout" method="post" class="inline">
        <button class="link">Logout</button>
      </form>
    </span>
  </c:if>
</header>
<main>
<c:if test="\${not empty sessionScope.flash}">
  <div class="flash"><c:out value="\${sessionScope.flash}"/></div>
  <c:remove var="flash" scope="session"/>
</c:if>

<%-- ===== WEB-INF/views/common/footer.jspf ===== --%>
</main>
<footer class="foot">&copy; 2026 \${applicationScope.appName} - Servlet + JSP + JDBC</footer>
</body>
</html>

<%-- ===== WEB-INF/views/login.jsp ===== --%>
<%@ include file="/WEB-INF/views/common/header.jspf" %>
<h2>Admin Login</h2>
<c:if test="\${not empty error}"><p class="error">\${error}</p></c:if>
<c:if test="\${param.logout == '1'}"><p class="flash">You have been logged out.</p></c:if>
<form action="\${ctx}/login" method="post" class="card">
  <label>Username <input name="username" value="<c:out value='\${param.username}'/>" required></label>
  <label>Password <input type="password" name="password" required></label>
  <button type="submit">Login</button>
</form>
<%@ include file="/WEB-INF/views/common/footer.jspf" %>

<%-- ===== WEB-INF/views/student-list.jsp ===== --%>
<%@ include file="/WEB-INF/views/common/header.jspf" %>
<h2>Students <small>(\${total} found)</small></h2>

<form action="\${ctx}/students" method="get" class="toolbar">
  <input name="q" placeholder="Search name, roll no, course" value="<c:out value='\${q}'/>">
  <button>Search</button>
  <c:if test="\${not empty q}"><a href="\${ctx}/students">Clear</a></c:if>
  <a class="btn" href="\${ctx}/students/new">+ Add Student</a>
</form>

<table class="grid">
  <tr><th>#</th><th>Roll No</th><th>Name</th><th>Email</th><th>Course</th>
      <th>Marks</th><th>Grade</th><th>Actions</th></tr>
  <c:forEach items="\${students}" var="s" varStatus="st">
    <tr>
      <td>\${(page - 1) * 5 + st.count}</td>
      <td><c:out value="\${s.rollNo}"/></td>
      <td><c:out value="\${s.name}"/></td>
      <td><c:out value="\${s.email}"/></td>
      <td><c:out value="\${s.course}"/></td>
      <td>\${s.marks}</td>
      <td class="\${s.grade eq 'Fail' ? 'error' : ''}">\${s.grade}</td>
      <td>
        <a href="\${ctx}/students/edit?id=\${s.id}">Edit</a>
        <form action="\${ctx}/students/delete" method="post" class="inline"
              onsubmit="return confirm('Delete \${fn:escapeXml(s.rollNo)}?');">
          <input type="hidden" name="id" value="\${s.id}">
          <button class="link danger">Delete</button>
        </form>
      </td>
    </tr>
  </c:forEach>
  <c:if test="\${empty students}">
    <tr><td colspan="8">No students found.</td></tr>
  </c:if>
</table>

<c:if test="\${totalPages > 1}">
  <nav class="pager">
    <c:forEach begin="1" end="\${totalPages}" var="i">
      <c:url var="pageUrl" value="/students">
        <c:param name="q" value="\${q}"/>
        <c:param name="page" value="\${i}"/>
      </c:url>
      <c:choose>
        <c:when test="\${i == page}"><span class="current">\${i}</span></c:when>
        <c:otherwise><a href="\${pageUrl}">\${i}</a></c:otherwise>
      </c:choose>
    </c:forEach>
  </nav>
</c:if>
<%@ include file="/WEB-INF/views/common/footer.jspf" %>

<%-- ===== WEB-INF/views/student-form.jsp ===== --%>
<%@ include file="/WEB-INF/views/common/header.jspf" %>
<h2>\${student.id == 0 ? 'Add Student' : 'Edit Student'}</h2>

<form action="\${ctx}/students/save" method="post" class="card">
  <input type="hidden" name="id" value="\${student.id}">

  <label>Roll No
    <input name="rollNo" value="<c:out value='\${student.rollNo}'/>">
    <span class="error">\${errors.rollNo}</span>
  </label>

  <label>Name
    <input name="name" value="<c:out value='\${student.name}'/>">
    <span class="error">\${errors.name}</span>
  </label>

  <label>Email
    <input name="email" value="<c:out value='\${student.email}'/>">
    <span class="error">\${errors.email}</span>
  </label>

  <label>Course
    <select name="course">
      <option value="">-- select --</option>
      <c:forEach items="\${courses}" var="opt">
        <option value="\${opt}" \${opt eq student.course ? 'selected' : ''}>\${opt}</option>
      </c:forEach>
    </select>
    <span class="error">\${errors.course}</span>
  </label>

  <label>Marks
    <c:set var="marksValue"
           value="\${not empty param.marks ? param.marks : (student.id == 0 ? '' : student.marks)}"/>
    <input name="marks" value="<c:out value='\${marksValue}'/>">
    <span class="error">\${errors.marks}</span>
  </label>

  <button type="submit">\${student.id == 0 ? 'Save' : 'Update'}</button>
  <a href="\${ctx}/students">Cancel</a>
</form>
<%@ include file="/WEB-INF/views/common/footer.jspf" %>

<%-- ===== WEB-INF/errors/404.jsp ===== --%>
<%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<html><body style="font-family:sans-serif;text-align:center">
  <h1>404 - Page not found</h1>
  <p><c:out value="\${pageContext.errorData.requestURI}"/> does not exist.</p>
  <a href="\${pageContext.request.contextPath}/students">Back to students</a>
</body></html>

<%-- ===== WEB-INF/errors/500.jsp ===== --%>
<%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" %>
<html><body style="font-family:sans-serif;text-align:center">
  <h1>Something went wrong</h1>
  <p>Please try again. If the problem continues, check that MySQL is running.</p>
  <a href="\${pageContext.request.contextPath}/students">Back to students</a>
</body></html>

<%-- ===== index.jsp ===== --%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:redirect url="/students"/>

<!-- ===== WEB-INF/web.xml ===== -->
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee https://jakarta.ee/xml/ns/jakartaee/web-app_6_0.xsd"
         version="6.0">
  <display-name>Student Management System</display-name>

  <welcome-file-list>
    <welcome-file>index.jsp</welcome-file>
  </welcome-file-list>

  <session-config>
    <session-timeout>30</session-timeout>
    <cookie-config>
      <http-only>true</http-only>
    </cookie-config>
    <tracking-mode>COOKIE</tracking-mode>
  </session-config>

  <error-page>
    <error-code>404</error-code>
    <location>/WEB-INF/errors/404.jsp</location>
  </error-page>
  <error-page>
    <error-code>500</error-code>
    <location>/WEB-INF/errors/500.jsp</location>
  </error-page>
  <error-page>
    <exception-type>java.lang.Throwable</exception-type>
    <location>/WEB-INF/errors/500.jsp</location>
  </error-page>
</web-app>

/* ===== css/style.css ===== */
body { font-family: Arial, sans-serif; margin: 0; background: #f5f7fb; }
.top { background: #1e3a8a; color: #fff; padding: 12px 20px; display: flex; justify-content: space-between; }
main { padding: 20px; }
.card { background: #fff; padding: 20px; max-width: 420px; display: grid; gap: 12px; border-radius: 8px; }
.card label { display: grid; gap: 4px; }
.grid { border-collapse: collapse; background: #fff; width: 100%; }
.grid th, .grid td { border: 1px solid #ddd; padding: 8px; text-align: left; }
.grid th { background: #e8edf8; }
.toolbar { margin-bottom: 12px; display: flex; gap: 8px; align-items: center; }
.btn { background: #1e3a8a; color: #fff; padding: 6px 12px; text-decoration: none; border-radius: 4px; }
.flash { background: #dcfce7; color: #166534; padding: 10px; border-radius: 4px; margin-bottom: 12px; }
.error { color: #b91c1c; font-size: 0.9em; }
.inline { display: inline; }
.link { background: none; border: none; color: inherit; text-decoration: underline; cursor: pointer; }
.danger { color: #b91c1c; }
.pager { margin-top: 12px; display: flex; gap: 6px; }
.pager a, .pager .current { padding: 4px 10px; border: 1px solid #1e3a8a; border-radius: 4px; }
.pager .current { background: #1e3a8a; color: #fff; }
.foot { text-align: center; color: #666; padding: 20px; }`,
      result: 'All views render without errors. Because header.jspf is included with the include directive, its taglib declarations and the ctx variable are available in every page.',
      explanation: 'The form JSP checks ${student.id == 0} to decide between "Add" and "Edit" titles and buttons. The form is shared for add and edit: id=0 means insert. errors is a Map, so ${errors.name} shows the message for that field or nothing. Logout is a POST form so it cannot be triggered by an image or link on another site.',
    },
    {
      title: 'Part 6: Run, test and deploy',
      scenario: 'Run the project from both IDEs, walk through a full test checklist, then build a WAR and deploy it on a standalone Tomcat.',
      steps: [
        'Make sure MySQL is running and db.properties has the right password.',
        'Eclipse: right-click project > Run As > Run on Server > choose Tomcat v10.1 > Finish. Eclipse opens http://localhost:8080/student-management/ (if Maven project, first right-click > Maven > Update Project).',
        'IntelliJ: Run > Edit Configurations > + > Tomcat Server > Local > Server tab: Application server Tomcat 10.1, URL http://localhost:8080/student-management/ > Deployment tab: + > Artifact > student-management:war exploded > Application context: /student-management > OK. Click Run (Shift+F10).',
        'Execute the test checklist below and compare with the expected results.',
        'Package: IntelliJ Maven tool window > Lifecycle > package (or terminal: mvn clean package). Eclipse: right-click project > Run As > Maven build... > Goals: clean package > Run (or File > Export > Web > WAR file).',
        'Deploy: copy target/student-management.war into <TOMCAT>/webapps, run <TOMCAT>/bin/startup.bat (Windows) or ./startup.sh (Linux/Mac), open http://localhost:8080/student-management/. Stop the IDE server first to avoid port 8080 conflicts.',
      ],
      code: `TEST CHECKLIST (expected results with the sample data)

 1. Open /student-management/            -> redirected to /login (not logged in)
 2. Login admin / wrong                  -> "Invalid username or password"
 3. Login admin / admin@123              -> Students (7 found), rows S101..S105, pager [1] 2
 4. Click page 2                         -> rows S106, S107; numbering continues 6, 7
 5. Search "java"                        -> Students (3 found): S101, S103, S106
 6. Search "zzz"                         -> "No students found."
 7. Add: roll S108, name Neha Joshi, email neha@mail.com,
         course Web Development, marks 88
                                         -> flash "Student added: Neha Joshi", 8 found, page 2 shows S106..S108
 8. Add again with roll S108             -> form stays, "Roll number already exists", typed values kept
 9. Add with email "neha@" and marks 120 -> "Enter a valid email", "Marks must be between 0 and 100"
10. Edit S105 marks 32 -> 40             -> flash "Student updated: Arjun Singh", grade Fail -> Pass
11. Delete S107 (confirm OK)             -> flash "Student deleted (id 7)", 7 found
12. Press F5 after delete                -> nothing deleted again (PRG)
13. Open /students/edit?id=999           -> flash "Student not found"
14. Open /student-management/abc         -> custom 404 page
15. Name <script>alert(1)</script>       -> shown as text, no alert (c:out escaping)
16. Search  ' OR '1'='1                  -> "No students found." (PreparedStatement)
17. Logout, then press Back              -> redirected to /login (no-store + AuthFilter)
18. Stop MySQL and open /students        -> custom 500 page, stack trace only in Tomcat log

BUILD AND DEPLOY
> mvn clean package
[INFO] Building war: .../target/student-management.war
[INFO] BUILD SUCCESS

> copy target\\student-management.war C:\\apache-tomcat-10.1.x\\webapps\\
> C:\\apache-tomcat-10.1.x\\bin\\startup.bat
   (Linux/Mac: cp target/student-management.war ~/apache-tomcat-10.1.x/webapps/ && ~/apache-tomcat-10.1.x/bin/startup.sh)

Tomcat log: Deployment of web application archive [.../webapps/student-management.war] has finished
Browser:    http://localhost:8080/student-management/`,
      result: 'All 18 checks behave as listed. The WAR (about 3-4 MB because it contains JSTL and the MySQL driver in WEB-INF/lib) deploys on standalone Tomcat 10.1 and the app works exactly as in the IDE.',
      explanation: 'A test checklist like this is what interviewers and project reviewers expect you to demonstrate. Check 4 numbering is (page - 1) * 5 + st.count = 5 + 1 = 6 and 5 + 2 = 7. Check 7: after insert there are 8 rows, so page 2 holds rows 6-8 (S106, S107, S108).',
    },
  ],
  interview: [
    { q: 'Explain the architecture of your Student Management project.', a: 'It is a layered MVC app: JSP views (EL/JSTL) in WEB-INF, a front controller Servlet /students/* plus Login/Logout Servlets, a service layer for validation, DAO classes using JDBC PreparedStatement, model beans, DBUtil for connections, filters for encoding and authentication, a ServletContextListener for startup, and web.xml for error pages and session config.', level: 'Medium' },
    { q: 'What is JDBC and what are the main steps?', a: 'Java Database Connectivity API. Steps: load/register driver, get Connection, create (Prepared)Statement, execute query/update, process ResultSet, close resources (try-with-resources).', level: 'Easy' },
    { q: 'Statement vs PreparedStatement vs CallableStatement?', a: 'Statement runs static SQL and is open to SQL injection. PreparedStatement is precompiled, uses ? parameters, safer and faster for repeated execution. CallableStatement calls stored procedures.', level: 'Easy' },
    { q: 'execute() vs executeQuery() vs executeUpdate()?', a: 'executeQuery returns a ResultSet (SELECT). executeUpdate returns affected row count (INSERT/UPDATE/DELETE/DDL). execute returns boolean (true if a ResultSet is available) and is used when the SQL type is unknown.', level: 'Easy' },
    { q: 'How do you manage transactions in JDBC?', a: 'con.setAutoCommit(false), run several statements, con.commit() on success, con.rollback() in catch, and restore auto-commit. Savepoints allow partial rollback.', level: 'Medium' },
    { q: 'What is connection pooling and why is it needed?', a: 'A pool keeps a set of open connections and lends them to requests, avoiding the high cost of opening connections each time. HikariCP or Tomcat JNDI DataSource; con.close() returns the connection to the pool.', level: 'Medium' },
    { q: 'What is a Servlet and explain its lifecycle.', a: 'A Java class that handles HTTP requests in a container. Lifecycle: load class, instantiate (once), init() once, service() -> doGet/doPost per request in separate threads, destroy() once at shutdown.', level: 'Easy' },
    { q: 'Are Servlets thread-safe? How do you make them safe?', a: 'No. One instance serves many threads. Avoid mutable instance fields; use local variables; if shared state is needed use synchronization or thread-safe classes (AtomicInteger, ConcurrentHashMap). DAO/service objects in the project are stateless, so they are safe.', level: 'Medium' },
    { q: 'GET vs POST?', a: 'GET sends data in the URL, is bookmarkable, cacheable, limited in length and should be safe/idempotent (read). POST sends data in the body, not cached, used for changes and large/sensitive data.', level: 'Easy' },
    { q: 'ServletConfig vs ServletContext?', a: 'ServletConfig is per Servlet (its init params, name). ServletContext is one per web application (context params, shared attributes, resources, logging).', level: 'Easy' },
    { q: 'forward vs sendRedirect - where did you use each?', a: 'forward (server-side, same request, URL unchanged) to show JSP views and to redisplay the form with errors. sendRedirect (new request, URL changes) after successful save/delete/login for PRG.', level: 'Medium' },
    { q: 'What is the Post/Redirect/Get pattern?', a: 'After a POST that changes data, redirect to a GET page so refresh does not resubmit the form. Used after save and delete in the project.', level: 'Medium' },
    { q: 'What session tracking techniques exist and which did you use?', a: 'Cookies, HttpSession, URL rewriting and hidden form fields. The project uses HttpSession (JSESSIONID cookie) to store the logged-in user and flash messages, and a hidden field for the student id in forms.', level: 'Easy' },
    { q: 'How did you implement login security?', a: 'Passwords stored as salted PBKDF2 hashes, constant-time compare, changeSessionId after login to prevent session fixation, AuthFilter on /students/*, HttpOnly cookie, invalidate on logout, generic error message, no-store cache header.', level: 'Hard' },
    { q: 'What is a Filter and which filters did you write?', a: 'A component that intercepts requests/responses for URL patterns. EncodingFilter sets UTF-8 for all requests, AuthFilter blocks unauthenticated access to /students/*.', level: 'Easy' },
    { q: 'What is a Listener and how did you use it?', a: 'A class notified on lifecycle events. AppInitListener (ServletContextListener) creates the default admin user at application startup and stores the app name in application scope.', level: 'Medium' },
    { q: 'Explain the JSP lifecycle.', a: 'Translation to Servlet source, compilation, loading, instantiation, jspInit(), _jspService() per request, jspDestroy().', level: 'Easy' },
    { q: 'include directive vs jsp:include?', a: 'Directive is static (translation time, merged code, shares variables/taglibs) - used for header.jspf/footer.jspf. jsp:include is dynamic (request time, separate output, supports params).', level: 'Medium' },
    { q: 'Why did you avoid scriptlets in JSP?', a: 'Scriptlets mix logic with presentation, are hard to maintain and break MVC. EL and JSTL give clean, designer-friendly, null-safe pages and c:out prevents XSS.', level: 'Easy' },
    { q: 'What is EL and how does it resolve ${student.name}?', a: 'Expression Language. It finds attribute "student" in page, request, session, application scope (in order) and calls getName(). Missing values print as empty.', level: 'Medium' },
    { q: 'Which JSTL tags did you use?', a: 'c:set, c:if, c:choose/c:when/c:otherwise, c:forEach with varStatus, c:url/c:param for pagination links, c:out for safe output, c:remove for flash messages, c:redirect in index.jsp, fn:escapeXml.', level: 'Medium' },
    { q: 'How did you implement pagination?', a: 'COUNT(*) for total with the same WHERE clause, totalPages = (total + size - 1) / size, page clamped between 1 and totalPages, SQL with ORDER BY id LIMIT ? OFFSET ?, and JSTL loop to render page links preserving the search keyword with c:url.', level: 'Medium' },
    { q: 'How do you prevent SQL injection and XSS in this app?', a: 'SQL injection: PreparedStatement for all user values. XSS: all user-entered text printed with c:out or fn:escapeXml; HttpOnly session cookie.', level: 'Medium' },
    { q: 'What changes when moving from Tomcat 9 to Tomcat 10?', a: 'Package names changed from javax.* to jakarta.* (Jakarta EE 9+). Servlet API 6.0, JSP 3.1, JSTL 3.0 with jakarta.tags.* URIs. Old javax-based libraries and code must be migrated.', level: 'Hard' },
    { q: 'How would you improve this project for production?', a: 'Connection pool (HikariCP/JNDI), CSRF tokens, HTTPS with Secure cookies, role-based access, logging framework (SLF4J/Logback), unit tests for service/DAO, externalized config, and migrate to Spring Boot for less boilerplate.', level: 'Hard' },
    { q: 'What is the difference between web.xml and annotations like @WebServlet?', a: 'Both register components. Annotations are concise and kept with the class; web.xml centralises configuration, can override annotations, and is required for things like guaranteed filter order and some settings. metadata-complete="true" makes the container ignore annotations.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add sorting: clicking a column header (Roll No, Name, Marks) sorts the list ascending/descending, keeping search and page. Prevent SQL injection in ORDER BY.',
      hint: 'Pass sort and dir params; map them through a whitelist Map in the DAO; ORDER BY cannot use ? placeholders.',
      solution: `// StudentDaoImpl
private static final Map<String, String> SORTABLE = Map.of(
        "roll", "roll_no", "name", "name", "marks", "marks");

public List<Student> search(String keyword, int offset, int limit, String sort, String dir)
        throws SQLException {
    String col = SORTABLE.getOrDefault(sort, "id");
    String direction = "desc".equalsIgnoreCase(dir) ? "DESC" : "ASC";
    String sql = "SELECT " + COLUMNS + " FROM students" + WHERE_SEARCH
               + " ORDER BY " + col + " " + direction + ", id LIMIT ? OFFSET ?";
    try (Connection con = DBUtil.getConnection();
         PreparedStatement ps = con.prepareStatement(sql)) {
        int i = setSearch(ps, keyword);
        ps.setInt(i++, limit);
        ps.setInt(i, offset);
        try (ResultSet rs = ps.executeQuery()) {
            List<Student> list = new ArrayList<>();
            while (rs.next()) list.add(map(rs));
            return list;
        }
    }
}

// Controller list(): read sort/dir, pass to service, setAttribute("sort", sort), ("dir", dir)

<%-- JSP header cell --%>
<c:url var="sortName" value="/students">
  <c:param name="q" value="\${q}"/>
  <c:param name="sort" value="name"/>
  <c:param name="dir" value="\${sort eq 'name' and dir eq 'asc' ? 'desc' : 'asc'}"/>
</c:url>
<th><a href="\${sortName}">Name</a></th>`,
    },
    {
      task: 'Add "Export to CSV": GET /students/export downloads all students matching the current search as students.csv.',
      hint: 'Set content type text/csv and Content-Disposition attachment; escape quotes in values.',
      solution: `// in StudentController.doGet switch:
case "/export" -> export(req, resp);

private void export(HttpServletRequest req, HttpServletResponse resp)
        throws SQLException, IOException {
    String q = req.getParameter("q") == null ? "" : req.getParameter("q").trim();
    List<Student> all = service.search(q, 0, Integer.MAX_VALUE);
    resp.setContentType("text/csv;charset=UTF-8");
    resp.setHeader("Content-Disposition", "attachment; filename=\\"students.csv\\"");
    PrintWriter out = resp.getWriter();
    out.println("Roll No,Name,Email,Course,Marks,Grade");
    for (Student s : all) {
        out.println(String.join(",", csv(s.getRollNo()), csv(s.getName()), csv(s.getEmail()),
                csv(s.getCourse()), String.valueOf(s.getMarks()), s.getGrade()));
    }
}

private static String csv(String v) {
    return "\\"" + (v == null ? "" : v.replace("\\"", "\\"\\"")) + "\\"";
}

<%-- list page --%>
<c:url var="exportUrl" value="/students/export"><c:param name="q" value="\${q}"/></c:url>
<a class="btn" href="\${exportUrl}">Export CSV</a>`,
    },
    {
      task: 'Add roles: users table gets a role column (ADMIN or VIEWER). Viewers can only list/search; only ADMIN can add, edit, delete. Hide buttons for viewers AND enforce on the server.',
      hint: 'ALTER TABLE; add role to User; check in controller (or a separate filter for /students/new, /edit, /save, /delete).',
      solution: `-- SQL
ALTER TABLE users ADD role VARCHAR(10) NOT NULL DEFAULT 'ADMIN';

// User.java: add field role + getter, and isAdmin() { return "ADMIN".equals(role); }
// UserDao.findByUsername: SELECT id, username, password_hash, full_name, role ...

// StudentController: at the start of doPost and for /new and /edit in doGet
private boolean denyIfNotAdmin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    User u = (User) req.getSession().getAttribute("loggedUser");
    if (u == null || !u.isAdmin()) {
        resp.sendError(HttpServletResponse.SC_FORBIDDEN, "Admins only");
        return true;
    }
    return false;
}
// usage: case "/new" -> { if (!denyIfNotAdmin(req, resp)) showForm(req, resp, new Student()); }
// doPost: if (denyIfNotAdmin(req, resp)) return;

<%-- JSP --%>
<c:if test="\${sessionScope.loggedUser.admin}">
  <a class="btn" href="\${ctx}/students/new">+ Add Student</a>
</c:if>`,
    },
    {
      task: 'Replace DriverManager in DBUtil with a HikariCP pool created in a ServletContextListener and closed on shutdown.',
      hint: 'Dependency com.zaxxer:HikariCP:5.1.0; store the HikariDataSource in a static field set by the listener.',
      solution: `<!-- pom.xml -->
<dependency>
  <groupId>com.zaxxer</groupId>
  <artifactId>HikariCP</artifactId>
  <version>5.1.0</version>
</dependency>

// DBUtil.java
package com.sms.util;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Properties;

public final class DBUtil {
    private static HikariDataSource ds;
    private DBUtil() { }

    public static synchronized void start() {
        try (InputStream in = DBUtil.class.getClassLoader().getResourceAsStream("db.properties")) {
            Properties p = new Properties();
            p.load(in);
            HikariConfig cfg = new HikariConfig();
            cfg.setDriverClassName("com.mysql.cj.jdbc.Driver");
            cfg.setJdbcUrl(p.getProperty("db.url"));
            cfg.setUsername(p.getProperty("db.user"));
            cfg.setPassword(p.getProperty("db.password"));
            cfg.setMaximumPoolSize(10);
            ds = new HikariDataSource(cfg);
        } catch (Exception e) {
            throw new IllegalStateException("Pool start failed", e);
        }
    }

    public static Connection getConnection() throws SQLException { return ds.getConnection(); }

    public static synchronized void stop() { if (ds != null) ds.close(); }
}

// AppInitListener: call DBUtil.start() FIRST in contextInitialized,
// and add:
@Override
public void contextDestroyed(ServletContextEvent sce) { DBUtil.stop(); }`,
    },
    {
      task: 'Practical test (90 minutes): Build a mini "Book Library" app on the same pattern: table books(id, isbn UNIQUE, title, author, price, available BOOLEAN). Features: list with search by title/author, add, edit, delete, toggle available, validation (isbn 10 or 13 digits, price > 0). Use MVC, JSTL, PreparedStatement and PRG.',
      hint: 'Copy the structure of the Student project: Book bean, BookDao/BookDaoImpl, BookService.validate, BookController /books/*, book-list.jsp, book-form.jsp. Toggle = POST /books/toggle with UPDATE books SET available = NOT available WHERE id = ?.',
      solution: `-- SQL
CREATE TABLE books (
  id INT PRIMARY KEY AUTO_INCREMENT,
  isbn VARCHAR(13) NOT NULL UNIQUE,
  title VARCHAR(150) NOT NULL,
  author VARCHAR(100) NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  available BOOLEAN NOT NULL DEFAULT TRUE
);

// Key parts (rest mirrors the Student project)
// BookService.validate
if (b.getIsbn() == null || !b.getIsbn().matches("\\\\d{10}|\\\\d{13}")) errors.put("isbn", "ISBN must be 10 or 13 digits");
else if (dao.isbnExists(b.getIsbn(), b.getId())) errors.put("isbn", "ISBN already exists");
if (isBlank(b.getTitle())) errors.put("title", "Title is required");
if (isBlank(b.getAuthor())) errors.put("author", "Author is required");
try {
    BigDecimal p = new BigDecimal(priceText.trim());
    if (p.signum() <= 0) errors.put("price", "Price must be greater than 0"); else b.setPrice(p);
} catch (Exception e) { errors.put("price", "Price must be a number"); }

// BookDaoImpl.toggle
public boolean toggle(int id) throws SQLException {
    try (Connection con = DBUtil.getConnection();
         PreparedStatement ps = con.prepareStatement(
             "UPDATE books SET available = NOT available WHERE id = ?")) {
        ps.setInt(1, id);
        return ps.executeUpdate() == 1;
    }
}

// BookController doPost
case "/toggle" -> {
    dao.toggle(toInt(req.getParameter("id"), 0));
    flash(req, "Availability changed");
    resp.sendRedirect(req.getContextPath() + "/books");
}

<%-- book-list.jsp cell --%>
<td>
  <form action="\${ctx}/books/toggle" method="post" class="inline">
    <input type="hidden" name="id" value="\${b.id}">
    <button class="link">\${b.available ? 'Available' : 'Issued'}</button>
  </form>
</td>

Marking scheme: DB + bean 10, DAO 20, validation 15, controller + PRG 20, JSP with JSTL (no scriptlets) 20, security (PreparedStatement, c:out) 10, code quality 5.`,
    },
    {
      task: 'Write a JUnit-free self-check: a pure Java Main class that tests Student.getGrade() for marks 100, 75, 74, 60, 59, 35, 34, 0 and prints PASS/FAIL for each.',
      hint: 'Copy the getGrade logic into a static method so it runs without the web container.',
      solution: `public class Main {
    static String grade(int marks) {
        if (marks >= 75) return "Distinction";
        if (marks >= 60) return "First Class";
        if (marks >= 35) return "Pass";
        return "Fail";
    }

    static void check(int marks, String expected) {
        String actual = grade(marks);
        System.out.println(marks + " -> " + actual + " : " + (actual.equals(expected) ? "PASS" : "FAIL"));
    }

    public static void main(String[] args) {
        check(100, "Distinction");
        check(75, "Distinction");
        check(74, "First Class");
        check(60, "First Class");
        check(59, "Pass");
        check(35, "Pass");
        check(34, "Fail");
        check(0, "Fail");
    }
}
/* Output:
100 -> Distinction : PASS
75 -> Distinction : PASS
74 -> First Class : PASS
60 -> First Class : PASS
59 -> Pass : PASS
35 -> Pass : PASS
34 -> Fail : PASS
0 -> Fail : PASS
*/`,
    },
  ],
  quiz: [
    {
      question: 'In the project, why does StudentController forward (not redirect) when validation fails?',
      options: ['Redirect is not allowed after POST', 'To keep the same request so the typed values and error messages are available to the form', 'Forward is required by JSTL', 'To change the URL in the address bar'],
      answer: 1,
      explanation: 'Errors and the Student object are request attributes; a redirect would lose them.',
    },
    {
      question: 'Which URL pattern and method combination does the project use to delete a student?',
      options: ['GET /students/delete?id=5', 'DELETE /students/5', 'POST /students/delete with hidden id', 'GET /delete.jsp?id=5'],
      answer: 2,
      explanation: 'Data-changing actions use POST forms so links, crawlers or prefetch cannot delete data.',
    },
    {
      question: 'With 8 students and PAGE_SIZE 5, what does the list show on page 2?',
      options: ['3 rows, numbered 6 to 8', '5 rows, numbered 1 to 5', '3 rows, numbered 1 to 3', '8 rows'],
      answer: 0,
      explanation: 'OFFSET 5 returns rows 6-8; numbering uses (page - 1) * 5 + st.count.',
    },
    {
      question: 'Why does the project read the marks value with Integer.parseInt inside a try-catch in StudentService.validate?',
      options: ['Because EL cannot show integers', 'Because marks are stored as text in MySQL', 'Because JSTL converts numbers automatically', 'Because request parameters are Strings and the user may type non-numeric text'],
      answer: 3,
      explanation: 'getParameter always returns a String (or null); invalid input throws NumberFormatException, which is turned into a friendly field error instead of a 500 page.',
    },
    {
      question: 'Which component creates the default admin user when the application starts?',
      options: ['AuthFilter', 'AppInitListener (ServletContextListener)', 'LoginServlet.init()', 'web.xml welcome-file'],
      answer: 1,
      explanation: 'contextInitialized runs once at deployment, the right place for startup tasks.',
    },
  ],
};
