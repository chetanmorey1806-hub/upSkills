export default {
  id: 'day-18-mvc-servlet-jsp-jdbc',
  title: 'MVC Architecture with Servlet + JSP + JDBC',
  module: 'Module 3: JSP',
  day: 18,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Combine everything learned so far into the Model-View-Controller pattern: a Servlet controller, JSP views with JSTL, and a model layer with JavaBeans and a JDBC DAO talking to MySQL.',
  objectives: [
    'Explain MVC (Model 2) and compare it with Model 1 architecture',
    'Organise a project into model, dao, controller (web) and view (JSP) layers',
    'Write a DAO with JDBC PreparedStatement and a reusable connection utility',
    'Build a Servlet front controller that dispatches actions and forwards to JSP views',
    'Run the full application on Tomcat 10 from Eclipse and IntelliJ with MySQL',
  ],
  theory: [
    {
      heading: 'What is MVC?',
      content:
        'MVC (Model-View-Controller) is a design pattern that separates an application into three parts:\n- Model: data and business logic - JavaBeans (Employee), DAO classes (EmployeeDao) and services. It knows nothing about HTML.\n- View: presentation - JSP pages using EL and JSTL. They only display data given to them.\n- Controller: the traffic police - a Servlet that receives the request, reads parameters, calls the model, puts results in request scope and chooses the view.\n\nAnalogy: a restaurant. The waiter (controller) takes your order, the kitchen (model) cooks, and the plate presentation (view) is what you see. The waiter never cooks and the chef never talks to customers.\n\nDiagram in words:\nBrowser --(1) GET /employees?action=list--> EmployeeController (Servlet)\nController --(2) dao.findAll()--> EmployeeDao --(3) SQL--> MySQL\nDAO --(4) List<Employee>--> Controller --(5) request.setAttribute("list", ...) + forward--> list.jsp\nlist.jsp --(6) HTML--> Browser',
    },
    {
      heading: 'Model 1 vs Model 2 (MVC)',
      content:
        'Model 1: the browser requests a JSP directly; the JSP contains both logic (scriptlets, JDBC code) and HTML. Fast to write for tiny apps but becomes spaghetti code, hard to test and secure.\nModel 2 (MVC): all requests go to a controller Servlet; JSPs are only views (often under WEB-INF so they cannot be called directly). Clear separation, reusable model, easy maintenance. Frameworks like Spring MVC are built on the same idea (DispatcherServlet = front controller).',
      points: [
        'Front Controller pattern: a single Servlet handles many actions (e.g. ?action=list/new/insert/delete or path /employees/*).',
        'Post/Redirect/Get after insert/update/delete to avoid duplicate submissions.',
        'Views never call the DAO directly.',
      ],
    },
    {
      heading: 'Layered project structure',
      content:
        'Recommended Maven structure:\nsrc/main/java/com/demo/model/Employee.java  (bean)\nsrc/main/java/com/demo/util/DBUtil.java      (connection)\nsrc/main/java/com/demo/dao/EmployeeDao.java  (interface)\nsrc/main/java/com/demo/dao/EmployeeDaoImpl.java (JDBC)\nsrc/main/java/com/demo/web/EmployeeController.java (Servlet)\nsrc/main/webapp/WEB-INF/views/employee-list.jsp\nsrc/main/webapp/WEB-INF/views/employee-form.jsp\nsrc/main/webapp/index.jsp (redirects to controller)\nsrc/main/resources/db.properties\n\nDependencies: jakarta.servlet-api 6.0 (provided), JSTL 3.0 API + impl (compile), mysql-connector-j 8.x/9.x (compile - Tomcat does not provide it).',
    },
    {
      heading: 'Connection handling in a web app',
      content:
        'Opening a JDBC connection is slow. For learning we use DriverManager with try-with-resources in each DAO method (simple and correct). In production use a connection pool: either HikariCP created in a ServletContextListener, or a Tomcat JNDI DataSource configured in META-INF/context.xml and obtained with InitialContext lookup("java:comp/env/jdbc/empdb").\n\nImportant: with Tomcat, call Class.forName("com.mysql.cj.jdbc.Driver") once (e.g. static block). JDBC 4 auto-loading sometimes fails in web apps because of class loaders, so the explicit call avoids "No suitable driver found".',
      tip: 'Never put the DB password in JSP. Keep it in db.properties (or environment variables) and read it in DBUtil.',
    },
    {
      heading: 'Request flow and responsibilities',
      content: 'Who does what in a well-designed MVC request:',
      points: [
        'Controller: read and validate parameters, call DAO/service, handle exceptions, set attributes, forward (for GET pages) or redirect (after POST).',
        'DAO: only SQL and mapping ResultSet <-> bean. No request/response objects.',
        'Bean: fields + getters/setters + optional simple helpers.',
        'JSP: EL/JSTL only, no scriptlets, no SQL. Use c:out for user-entered data.',
        'Common mistake: forwarding after POST insert -> refresh inserts again. Use redirect.',
        'Common mistake: catching SQLException and ignoring it -> blank pages. Log and show an error page.',
      ],
    },
  ],
  examples: [
    {
      title: 'Step 1: Database, pom.xml and project setup',
      scenario: 'Prepare MySQL table and a Maven web project "emp-mvc" that runs on Tomcat 10.1.',
      steps: [
        'Open MySQL Workbench or the mysql command line and run the SQL below.',
        'IntelliJ IDEA Ultimate: New Project > Jakarta EE > name emp-mvc, Template Web application, Application server Tomcat 10.1, Build Maven, Group com.demo, JDK 17 > Next > Jakarta EE 10 > Create. Replace pom.xml with the one below and click Load Maven Changes.',
        'Eclipse IDE for Enterprise Java: File > New > Maven Project > tick Create a simple project > Group com.demo, Artifact emp-mvc, Packaging war > Finish. Replace pom.xml, right-click project > Maven > Update Project. Then Properties > Project Facets > Dynamic Web Module 6.0, Java 17, Runtimes: Apache Tomcat v10.1 > Apply and Close.',
        'Create the packages com.demo.model, com.demo.util, com.demo.dao, com.demo.web and folder src/main/webapp/WEB-INF/views.',
        'Create src/main/resources/db.properties with your MySQL password.',
      ],
      code: `-- MySQL
CREATE DATABASE IF NOT EXISTS empdb;
USE empdb;
CREATE TABLE employee (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(50) NOT NULL,
  salary DECIMAL(10,2) NOT NULL
);
INSERT INTO employee (name, department, salary) VALUES
 ('Asha Patil', 'IT', 65000),
 ('Ravi Kumar', 'HR', 42000),
 ('Kiran Rao', 'IT', 58000);

<!-- pom.xml -->
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.demo</groupId>
  <artifactId>emp-mvc</artifactId>
  <version>1.0</version>
  <packaging>war</packaging>
  <properties>
    <maven.compiler.release>17</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>jakarta.servlet</groupId>
      <artifactId>jakarta.servlet-api</artifactId>
      <version>6.0.0</version>
      <scope>provided</scope>
    </dependency>
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
    <dependency>
      <groupId>com.mysql</groupId>
      <artifactId>mysql-connector-j</artifactId>
      <version>8.4.0</version>
    </dependency>
  </dependencies>
  <build>
    <finalName>emp-mvc</finalName>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-war-plugin</artifactId>
        <version>3.4.0</version>
      </plugin>
    </plugins>
  </build>
</project>

# src/main/resources/db.properties
db.url=jdbc:mysql://localhost:3306/empdb?useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true
db.user=root
db.password=root`,
      result: 'SELECT * FROM employee; shows 3 rows (ids 1, 2, 3). The project builds with no errors and the four packages are visible in the Project/Package Explorer.',
      explanation: 'The MySQL driver must be packaged inside the WAR (WEB-INF/lib) because Tomcat does not ship it. db.properties under resources ends up in WEB-INF/classes and is loaded from the classpath.',
    },
    {
      title: 'Step 2: Model (bean), DBUtil and DAO layer',
      scenario: 'Create the Employee bean, a connection utility that reads db.properties, and a DAO with findAll, findByDept, insert and delete.',
      steps: [
        'Create com.demo.model.Employee (IntelliJ: Alt+Insert > Getter and Setter; Eclipse: Source > Generate Getters and Setters).',
        'Create com.demo.util.DBUtil.',
        'Create interface com.demo.dao.EmployeeDao and class EmployeeDaoImpl.',
      ],
      code: `// com/demo/model/Employee.java
package com.demo.model;

import java.math.BigDecimal;

public class Employee {
    private int id;
    private String name;
    private String department;
    private BigDecimal salary;

    public Employee() { }

    public Employee(int id, String name, String department, BigDecimal salary) {
        this.id = id;
        this.name = name;
        this.department = department;
        this.salary = salary;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public BigDecimal getSalary() { return salary; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }
}

// com/demo/util/DBUtil.java
package com.demo.util;

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
            if (in == null) throw new IllegalStateException("db.properties not found");
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

// com/demo/dao/EmployeeDao.java
package com.demo.dao;

import com.demo.model.Employee;
import java.sql.SQLException;
import java.util.List;

public interface EmployeeDao {
    List<Employee> findAll() throws SQLException;
    List<Employee> findByDepartment(String dept) throws SQLException;
    int insert(Employee e) throws SQLException;
    boolean delete(int id) throws SQLException;
}

// com/demo/dao/EmployeeDaoImpl.java
package com.demo.dao;

import com.demo.model.Employee;
import com.demo.util.DBUtil;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EmployeeDaoImpl implements EmployeeDao {

    private static final String SELECT_ALL = "SELECT id, name, department, salary FROM employee ORDER BY id";
    private static final String SELECT_BY_DEPT = "SELECT id, name, department, salary FROM employee WHERE department = ? ORDER BY id";
    private static final String INSERT = "INSERT INTO employee (name, department, salary) VALUES (?, ?, ?)";
    private static final String DELETE = "DELETE FROM employee WHERE id = ?";

    @Override
    public List<Employee> findAll() throws SQLException {
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(SELECT_ALL);
             ResultSet rs = ps.executeQuery()) {
            return mapAll(rs);
        }
    }

    @Override
    public List<Employee> findByDepartment(String dept) throws SQLException {
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(SELECT_BY_DEPT)) {
            ps.setString(1, dept);
            try (ResultSet rs = ps.executeQuery()) {
                return mapAll(rs);
            }
        }
    }

    @Override
    public int insert(Employee e) throws SQLException {
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(INSERT, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, e.getName());
            ps.setString(2, e.getDepartment());
            ps.setBigDecimal(3, e.getSalary());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                return keys.next() ? keys.getInt(1) : 0;
            }
        }
    }

    @Override
    public boolean delete(int id) throws SQLException {
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(DELETE)) {
            ps.setInt(1, id);
            return ps.executeUpdate() == 1;
        }
    }

    private List<Employee> mapAll(ResultSet rs) throws SQLException {
        List<Employee> list = new ArrayList<>();
        while (rs.next()) {
            list.add(new Employee(rs.getInt("id"), rs.getString("name"),
                    rs.getString("department"), rs.getBigDecimal("salary")));
        }
        return list;
    }
}`,
      result: 'All classes compile. No output yet - the DAO is used by the controller in the next step.',
      explanation: 'The DAO hides all SQL. PreparedStatement prevents SQL injection, try-with-resources closes ResultSet, Statement and Connection automatically, and RETURN_GENERATED_KEYS gives the new AUTO_INCREMENT id.',
    },
    {
      title: 'Step 3: Controller Servlet (front controller)',
      scenario: 'One Servlet mapped to /employees handles actions list, search, new, insert and delete.',
      steps: [
        'Create com.demo.web.EmployeeController (Eclipse: New > Servlet; IntelliJ: New > Servlet).',
        'Create src/main/webapp/index.jsp that redirects to /employees so the app opens on the list.',
      ],
      code: `// com/demo/web/EmployeeController.java
package com.demo.web;

import com.demo.dao.EmployeeDao;
import com.demo.dao.EmployeeDaoImpl;
import com.demo.model.Employee;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/employees")
public class EmployeeController extends HttpServlet {

    private EmployeeDao dao;

    @Override
    public void init() {
        dao = new EmployeeDaoImpl();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String action = req.getParameter("action");
        if (action == null) action = "list";
        try {
            switch (action) {
                case "new" -> showForm(req, resp);
                case "delete" -> delete(req, resp);
                case "search" -> search(req, resp);
                default -> list(req, resp);
            }
        } catch (SQLException e) {
            throw new ServletException("Database error", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        try {
            insert(req, resp);
        } catch (SQLException e) {
            throw new ServletException("Database error", e);
        }
    }

    private void list(HttpServletRequest req, HttpServletResponse resp)
            throws SQLException, ServletException, IOException {
        req.setAttribute("employees", dao.findAll());
        req.getRequestDispatcher("/WEB-INF/views/employee-list.jsp").forward(req, resp);
    }

    private void search(HttpServletRequest req, HttpServletResponse resp)
            throws SQLException, ServletException, IOException {
        String dept = req.getParameter("dept");
        req.setAttribute("employees", dao.findByDepartment(dept));
        req.setAttribute("dept", dept);
        req.getRequestDispatcher("/WEB-INF/views/employee-list.jsp").forward(req, resp);
    }

    private void showForm(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        req.getRequestDispatcher("/WEB-INF/views/employee-form.jsp").forward(req, resp);
    }

    private void insert(HttpServletRequest req, HttpServletResponse resp)
            throws SQLException, ServletException, IOException {
        String name = req.getParameter("name");
        String dept = req.getParameter("department");
        String salaryText = req.getParameter("salary");

        List<String> errors = new ArrayList<>();
        if (name == null || name.isBlank()) errors.add("Name is required");
        if (dept == null || dept.isBlank()) errors.add("Department is required");
        BigDecimal salary = null;
        try {
            salary = new BigDecimal(salaryText);
            if (salary.signum() <= 0) errors.add("Salary must be positive");
        } catch (NumberFormatException | NullPointerException ex) {
            errors.add("Salary must be a number");
        }

        if (!errors.isEmpty()) {
            req.setAttribute("errors", errors);
            req.getRequestDispatcher("/WEB-INF/views/employee-form.jsp").forward(req, resp);
            return;
        }

        int id = dao.insert(new Employee(0, name.trim(), dept.trim(), salary));
        resp.sendRedirect(req.getContextPath() + "/employees?msg=Added+employee+" + id);
    }

    private void delete(HttpServletRequest req, HttpServletResponse resp)
            throws SQLException, IOException {
        int id = Integer.parseInt(req.getParameter("id"));
        boolean ok = dao.delete(id);
        resp.sendRedirect(req.getContextPath() + "/employees?msg="
                + (ok ? "Deleted+employee+" + id : "Employee+not+found"));
    }
}

<%-- src/main/webapp/index.jsp --%>
<% response.sendRedirect(request.getContextPath() + "/employees"); %>`,
      result: 'Compiles. Requests now route as:\nGET /employees -> list\nGET /employees?action=new -> form\nPOST /employees -> insert then redirect\nGET /employees?action=delete&id=3 -> delete then redirect\nGET /employees?action=search&dept=IT -> filtered list',
      explanation: 'The controller contains no HTML and no SQL. GET pages forward to JSP views; data-changing actions redirect (PRG). Validation errors forward back to the form with the user input still available via param. Note: delete via GET link is used for simplicity; Day 19 shows why a POST form is safer.',
    },
    {
      title: 'Step 4: Views with JSTL and running the app',
      scenario: 'Create the list page (table, search box, delete link, message) and the add form (with error list), then run everything.',
      steps: [
        'Create WEB-INF/views/employee-list.jsp and WEB-INF/views/employee-form.jsp.',
        'Eclipse: right-click project > Run As > Run on Server > Tomcat v10.1 > Finish. Opens http://localhost:8080/emp-mvc/.',
        'IntelliJ: Run > Edit Configurations > Tomcat Server > Local > Deployment tab > + Artifact > emp-mvc:war exploded, set Application context to /emp-mvc > OK > Run.',
        'Test: list, search IT, add "Meena Shah / Finance / 47000", delete id 2, try adding with an empty name.',
      ],
      code: `<%-- WEB-INF/views/employee-list.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<!DOCTYPE html>
<html>
<head><title>Employees</title>
<style>
  table { border-collapse: collapse; } td, th { border: 1px solid #999; padding: 6px 10px; }
  .msg { color: green; }
</style>
</head>
<body>
<h2>Employee List</h2>

<c:if test="\${not empty param.msg}">
  <p class="msg"><c:out value="\${param.msg}"/></p>
</c:if>

<form action="\${pageContext.request.contextPath}/employees" method="get">
  <input type="hidden" name="action" value="search">
  Department: <input name="dept" value="<c:out value='\${dept}'/>">
  <button>Search</button>
  <a href="\${pageContext.request.contextPath}/employees">Show all</a>
</form>
<p><a href="\${pageContext.request.contextPath}/employees?action=new">+ Add Employee</a></p>

<table>
  <tr><th>ID</th><th>Name</th><th>Department</th><th>Salary</th><th>Action</th></tr>
  <c:forEach items="\${employees}" var="e">
    <tr>
      <td>\${e.id}</td>
      <td><c:out value="\${e.name}"/></td>
      <td><c:out value="\${e.department}"/></td>
      <td><fmt:formatNumber value="\${e.salary}" pattern="#,##0.00"/></td>
      <td><a href="\${pageContext.request.contextPath}/employees?action=delete&id=\${e.id}"
             onclick="return confirm('Delete \${e.id}?')">Delete</a></td>
    </tr>
  </c:forEach>
  <c:if test="\${empty employees}">
    <tr><td colspan="5">No employees found.</td></tr>
  </c:if>
</table>
<p>Total: \${employees.size()}</p>
</body>
</html>

<%-- WEB-INF/views/employee-form.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html>
<head><title>Add Employee</title></head>
<body>
<h2>Add Employee</h2>
<c:if test="\${not empty errors}">
  <ul style="color:red">
    <c:forEach items="\${errors}" var="err"><li>\${err}</li></c:forEach>
  </ul>
</c:if>
<form action="\${pageContext.request.contextPath}/employees" method="post">
  Name: <input name="name" value="<c:out value='\${param.name}'/>"><br><br>
  Department:
  <select name="department">
    <c:forEach items="\${['IT','HR','Finance','Sales']}" var="d">
      <option \${param.department eq d ? 'selected' : ''}>\${d}</option>
    </c:forEach>
  </select><br><br>
  Salary: <input name="salary" value="<c:out value='\${param.salary}'/>"><br><br>
  <button type="submit">Save</button>
  <a href="\${pageContext.request.contextPath}/employees">Cancel</a>
</form>
</body>
</html>`,
      result: 'Open /emp-mvc/ -> Employee List:\n1 | Asha Patil | IT | 65,000.00\n2 | Ravi Kumar | HR | 42,000.00\n3 | Kiran Rao | IT | 58,000.00\nTotal: 3\nSearch IT -> rows 1 and 3, Total: 2\nAdd Meena Shah/Finance/47000 -> redirected to list with "Added employee 4" and a 4th row 47,000.00\nDelete id 2 -> "Deleted employee 2", Ravi Kumar gone\nSave with empty name -> form again with red "Name is required" and other typed values kept.',
      explanation: 'The JSPs contain no Java code. The list view works for both list and search because the controller always sets "employees". ${[\'IT\',...]} is an EL 3.0 list literal. The form re-fills values from param after a validation error because it was reached by forward (same request).',
    },
  ],
  interview: [
    { q: 'What is MVC?', a: 'A design pattern that separates Model (data/business logic), View (presentation) and Controller (request handling and flow). In Java web apps: JavaBeans/DAO, JSP, Servlet.', level: 'Easy' },
    { q: 'Difference between Model 1 and Model 2 architecture?', a: 'Model 1: JSP receives requests and contains both logic and presentation. Model 2: a controller Servlet receives requests, uses the model, and forwards to JSP views - this is MVC.', level: 'Easy' },
    { q: 'What is the Front Controller pattern?', a: 'A single entry point (Servlet) that receives all requests for a module and dispatches to handlers/views. Spring\'s DispatcherServlet is a front controller.', level: 'Medium' },
    { q: 'What is the DAO pattern and why use it?', a: 'Data Access Object: a class/interface that encapsulates all database access for an entity. It separates persistence from business logic, makes code testable and lets you change DB technology (JDBC to Hibernate) without touching controllers.', level: 'Easy' },
    { q: 'Why put JSPs inside WEB-INF in MVC?', a: 'So they cannot be requested directly; every request must go through the controller, which prepares data and applies security checks.', level: 'Medium' },
    { q: 'Why redirect after insert/update/delete instead of forward?', a: 'To follow Post/Redirect/Get: refreshing the result page repeats only a GET and avoids duplicate inserts/deletes.', level: 'Medium' },
    { q: 'Where should the MySQL driver jar go in a Tomcat web app?', a: 'In WEB-INF/lib (Maven compile scope), or in Tomcat lib when using a container-managed JNDI DataSource.', level: 'Medium' },
    { q: 'How do you share data from controller to JSP?', a: 'request.setAttribute("name", value) followed by forward; in JSP read it with EL ${name}.', level: 'Easy' },
    { q: 'Why is Class.forName("com.mysql.cj.jdbc.Driver") still used in web apps?', a: 'Automatic JDBC 4 driver loading via ServiceLoader may run in a different class loader than the web app, causing "No suitable driver". Explicit loading avoids it.', level: 'Hard' },
    { q: 'How would you add connection pooling to this app?', a: 'Create a HikariDataSource in a ServletContextListener and store it in ServletContext (or DAO), or configure a JNDI DataSource in META-INF/context.xml and look it up with InitialContext. Close the pool in contextDestroyed.', level: 'Hard' },
    { q: 'What layer should validate input?', a: 'The controller (and/or a service layer) validates request input before calling the DAO; the database constraints are the final safety net.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add an "update salary" feature: a form per row that POSTs id and new salary to /employees?action=raise. Add updateSalary(int id, BigDecimal salary) to the DAO.',
      hint: 'In doPost check the action parameter; UPDATE employee SET salary=? WHERE id=?; redirect with a message.',
      solution: `// EmployeeDao
boolean updateSalary(int id, java.math.BigDecimal salary) throws SQLException;

// EmployeeDaoImpl
@Override
public boolean updateSalary(int id, BigDecimal salary) throws SQLException {
    try (Connection con = DBUtil.getConnection();
         PreparedStatement ps = con.prepareStatement("UPDATE employee SET salary = ? WHERE id = ?")) {
        ps.setBigDecimal(1, salary);
        ps.setInt(2, id);
        return ps.executeUpdate() == 1;
    }
}

// EmployeeController.doPost
String action = req.getParameter("action");
try {
    if ("raise".equals(action)) {
        int id = Integer.parseInt(req.getParameter("id"));
        BigDecimal s = new BigDecimal(req.getParameter("salary"));
        dao.updateSalary(id, s);
        resp.sendRedirect(req.getContextPath() + "/employees?msg=Salary+updated");
    } else {
        insert(req, resp);
    }
} catch (SQLException e) { throw new ServletException(e); }

<%-- in employee-list.jsp, extra cell --%>
<td>
  <form method="post" action="\${pageContext.request.contextPath}/employees?action=raise">
    <input type="hidden" name="id" value="\${e.id}">
    <input name="salary" size="8"><button>Update</button>
  </form>
</td>`,
    },
    {
      task: 'Add a summary row showing the total and average salary computed in the DAO with SQL (SUM, AVG).',
      hint: 'SELECT SUM(salary), AVG(salary) FROM employee; return a Map or small class; set as request attribute.',
      solution: `// DAO
public java.math.BigDecimal[] totals() throws SQLException {
    try (Connection con = DBUtil.getConnection();
         PreparedStatement ps = con.prepareStatement("SELECT SUM(salary), AVG(salary) FROM employee");
         ResultSet rs = ps.executeQuery()) {
        rs.next();
        return new java.math.BigDecimal[] { rs.getBigDecimal(1), rs.getBigDecimal(2) };
    }
}

// Controller list()
java.math.BigDecimal[] t = ((EmployeeDaoImpl) dao).totals();
req.setAttribute("total", t[0]);
req.setAttribute("avg", t[1]);

<%-- JSP --%>
<p>Total salary: <fmt:formatNumber value="\${total}" pattern="#,##0.00"/>,
   Average: <fmt:formatNumber value="\${avg}" pattern="#,##0.00"/></p>`,
    },
    {
      task: 'Create a JNDI DataSource version of DBUtil using META-INF/context.xml for Tomcat.',
      hint: 'Resource name jdbc/empdb, type javax.sql.DataSource; lookup java:comp/env/jdbc/empdb. Put mysql-connector-j in Tomcat lib or WEB-INF/lib.',
      solution: `<!-- src/main/webapp/META-INF/context.xml -->
<Context>
  <Resource name="jdbc/empdb" auth="Container" type="javax.sql.DataSource"
            factory="org.apache.tomcat.jdbc.pool.DataSourceFactory"
            driverClassName="com.mysql.cj.jdbc.Driver"
            url="jdbc:mysql://localhost:3306/empdb?serverTimezone=Asia/Kolkata"
            username="root" password="root"
            maxActive="20" maxIdle="5" initialSize="2"/>
</Context>

// DBUtil (JNDI)
package com.demo.util;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

public final class DBUtil {
    private static final DataSource DS;
    static {
        try {
            DS = (DataSource) new InitialContext().lookup("java:comp/env/jdbc/empdb");
        } catch (NamingException e) {
            throw new ExceptionInInitializerError(e);
        }
    }
    private DBUtil() { }
    public static Connection getConnection() throws SQLException {
        return DS.getConnection();   // close() returns it to the pool
    }
}`,
    },
    {
      task: 'Add an error page: when the controller throws ServletException because of a database problem, show WEB-INF/views/db-error.jsp with a friendly message instead of a stack trace.',
      hint: 'web.xml <error-page><exception-type>jakarta.servlet.ServletException</exception-type><location>...</location></error-page>.',
      solution: `<!-- WEB-INF/web.xml -->
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee" version="6.0">
  <error-page>
    <exception-type>jakarta.servlet.ServletException</exception-type>
    <location>/WEB-INF/views/db-error.jsp</location>
  </error-page>
</web-app>

<%-- WEB-INF/views/db-error.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" %>
<h2 style="color:red">Sorry, we could not reach the database.</h2>
<p>Please try again later.</p>
<!-- for developers: \${requestScope['jakarta.servlet.error.message']} -->`,
    },
  ],
  quiz: [
    {
      question: 'In Servlet + JSP MVC, which component decides which view to show?',
      options: ['The JSP', 'The Controller Servlet', 'The DAO', 'The JavaBean'],
      answer: 1,
      explanation: 'The controller handles flow and forwards to the chosen view.',
    },
    {
      question: 'Where should SQL statements live?',
      options: ['In JSP scriptlets', 'In the Controller', 'In the DAO', 'In web.xml'],
      answer: 2,
      explanation: 'The DAO encapsulates all data access.',
    },
    {
      question: 'After successfully inserting a record from a POST, the controller should:',
      options: ['sendRedirect to the list page', 'forward to the list JSP', 'include the form again', 'Do nothing'],
      answer: 0,
      explanation: 'PRG prevents duplicate inserts on refresh.',
    },
    {
      question: 'Model 1 architecture means:',
      options: ['A single Servlet handles all requests', 'Spring MVC', 'DAO with Hibernate', 'JSP handles requests and contains logic + presentation'],
      answer: 3,
      explanation: 'In Model 1, the JSP is both controller and view.',
    },
    {
      question: 'Why are views placed under WEB-INF/views?',
      options: ['To make them load faster', 'So they cannot be accessed directly, only via the controller', 'Because JSTL requires it', 'Because Tomcat compiles only those'],
      answer: 1,
      explanation: 'WEB-INF is not publicly accessible; forward can still reach it.',
    },
  ],
};
