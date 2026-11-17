export default {
  id: "day-09-doget-dopost-form-data",
  title: "doGet() and doPost(), Reading Form Data (HTML Form to Servlet)",
  module: "Module 2: Servlets",
  day: 9,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Build HTML forms that send data to servlets with GET and POST, read every kind of input (text, radio, checkbox, select, textarea, hidden) using getParameter, getParameterValues and getParameterMap, validate it, and save it to MySQL with JDBC.",
  objectives: [
    "Decide when to use doGet and when to use doPost",
    "Connect HTML form fields to servlet parameters using action, method and name",
    "Read single and multi-valued parameters and handle missing or empty values",
    "Handle UTF-8 input and escape output to prevent broken HTML and XSS",
    "Save form data to MySQL from a servlet using PreparedStatement"
  ],
  theory: [
    {
      heading: "doGet() vs doPost()",
      content: "Both are methods of HttpServlet with the same signature: protected void doXxx(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException. The container calls doGet for HTTP GET requests (typing a URL, clicking a link, a form with method=get) and doPost for HTTP POST requests (a form with method=post).\n\nAnalogy: GET is a postcard; anyone handling it can read the message written on the outside (URL). POST is a sealed envelope; the message is inside (body). Neither is encrypted; use HTTPS for real security.",
      points: [
        "Use doGet for reading/searching: search pages, product details, lists. Safe to refresh and bookmark.",
        "Use doPost for changing data: registration, login, payment, delete. Browser warns before resubmitting.",
        "GET data length is limited by URL size (about 2,000 to 8,000 characters); POST has no practical limit.",
        "Passwords must never go in GET because URLs are stored in browser history and server logs.",
        "To support both, implement doGet and have doPost call doGet (or vice versa)."
      ]
    },
    {
      heading: "How a Form Reaches the Servlet",
      content: "The three key HTML attributes are: action (URL of the servlet), method (get or post) and name on each input (becomes the parameter name). Fields without a name are NOT sent.\n\nForm:\n<form action=\"register\" method=\"post\">\n    <input type=\"text\" name=\"fullName\">\n</form>\n\nBrowser sends (body, URL-encoded): fullName=Asha+Rao\nServlet reads: String n = req.getParameter(\"fullName\");   // \"Asha Rao\"\n\nThe action 'register' is relative to the page's URL, so a form in /student-web/register.html posts to /student-web/register.",
      points: [
        "Content type of a normal form: application/x-www-form-urlencoded (spaces become +, special chars become %XX).",
        "File upload forms need enctype=\"multipart/form-data\" (Day 19).",
        "Disabled fields are not sent; readonly fields are sent.",
        "An unchecked checkbox or unselected radio group sends nothing at all."
      ]
    },
    {
      heading: "Reading Parameters: the Four Methods",
      content: "HttpServletRequest gives four methods to read parameters. All values arrive as String; convert numbers yourself.",
      syntax: "String name      = req.getParameter(\"name\");          // one value or null\nString[] skills  = req.getParameterValues(\"skills\");  // many values or null\nEnumeration<String> names = req.getParameterNames();  // all parameter names\nMap<String, String[]> map = req.getParameterMap();     // everything (read-only)",
      points: [
        "getParameter returns null if the parameter is absent and \"\" if the field was submitted empty.",
        "For checkboxes and multi-select use getParameterValues; getParameter returns only the first value.",
        "Integer.parseInt on a null or empty string throws NumberFormatException; validate first.",
        "Parameter names are case-sensitive: 'Email' is not 'email'."
      ],
      tip: "Common mistake: input name='email' in HTML but req.getParameter(\"mail\") in Java returns null. Copy-paste names between the two files."
    },
    {
      heading: "Character Encoding and Output Escaping",
      content: "To read non-English text (Hindi, Tamil, accented names) correctly from POST, call req.setCharacterEncoding(\"UTF-8\") BEFORE the first getParameter. Tomcat 10 uses UTF-8 for URI (GET) parameters by default. For the response, call resp.setContentType(\"text/html;charset=UTF-8\") BEFORE getWriter().\n\nNever print user input directly into HTML. If a user types <script>alert(1)</script> as a name and you print it, the browser runs it (Cross-Site Scripting, XSS). Escape the five special characters: & < > \" '.",
      points: [
        "A filter (Day 13) can set UTF-8 for every request in one place.",
        "Later, JSP with JSTL <c:out> escapes automatically."
      ]
    },
    {
      heading: "Validation and the Post/Redirect/Get Pattern",
      content: "Server-side validation is mandatory even if the HTML has 'required', because anyone can send requests with curl or edit the HTML. Check for null/blank, length, number format and ranges; show the form again with messages if invalid.\n\nAfter a successful POST that changes data, refreshing the result page would submit the form again (duplicate insert). The Post/Redirect/Get (PRG) pattern solves this: after saving, call resp.sendRedirect(\"success.html\") so the browser makes a fresh GET. Redirects are covered in detail on Day 11.",
      points: [
        "Client-side validation (HTML required, type=email, min/max) improves user experience.",
        "Server-side validation protects the data. Always do both."
      ]
    }
  ],
  examples: [
    {
      title: "Registration form with every input type (HTML)",
      scenario: "A student registration page that sends text, email, password, radio, checkbox, select, textarea and hidden fields to a servlet with POST.",
      steps: [
        "In the student-web project (Day 7), create src/main/webapp/register.html",
        "Type the HTML below; note every input has a name attribute",
        "The form action 'register' will be handled by RegisterServlet in the next example"
      ],
      code: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Student Registration</title>
    <style>
        body  { font-family: Arial, sans-serif; margin: 30px; }
        label { display: block; margin-top: 10px; }
    </style>
</head>
<body>
<h2>Student Registration</h2>

<form action="register" method="post">
    <label>Full name: <input type="text" name="fullName" required></label>
    <label>Email: <input type="email" name="email" required></label>
    <label>Password: <input type="password" name="password" minlength="6" required></label>
    <label>Age: <input type="number" name="age" min="16" max="60"></label>

    <label>Gender:</label>
    <input type="radio" name="gender" value="Male"> Male
    <input type="radio" name="gender" value="Female"> Female

    <label>Skills:</label>
    <input type="checkbox" name="skills" value="Java"> Java
    <input type="checkbox" name="skills" value="SQL"> SQL
    <input type="checkbox" name="skills" value="HTML"> HTML

    <label>Course:
        <select name="course">
            <option value="Java">Java Full Stack</option>
            <option value="Python">Python</option>
            <option value="React">React</option>
        </select>
    </label>

    <label>Address:<br><textarea name="address" rows="3" cols="40"></textarea></label>

    <input type="hidden" name="source" value="website">

    <br><button type="submit">Register</button>
</form>
</body>
</html>`,
      result: "Opening http://localhost:8080/student-web/register.html shows a form with all fields. Submitting sends a POST body like:\nfullName=Asha+Rao&email=asha%40mail.com&password=secret1&age=21&gender=Female&skills=Java&skills=SQL&course=Java&address=Pune&source=website",
      explanation: "Radio buttons share the same name so only one is chosen. Checkboxes share the name skills, so several values with the same name are sent. The hidden field is invisible but submitted. @ is encoded as %40 and spaces as +; the container decodes them for you."
    },
    {
      title: "RegisterServlet: reading all parameters with doPost",
      scenario: "Read every field of the registration form, validate the required ones and display a confirmation page.",
      steps: [
        "Create class RegisterServlet in package com.course.web",
        "Map it in web.xml (snippet included) so it handles /register",
        "Redeploy (Eclipse: server auto-publishes or right-click server > Restart; IntelliJ: Update application / rerun)",
        "Open register.html, fill: Asha Rao, asha@mail.com, secret1, 21, Female, Java + SQL, Java Full Stack, Pune and submit"
      ],
      code: `// ===== com/course/web/RegisterServlet.java =====
package com.course.web;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

public class RegisterServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        req.setCharacterEncoding("UTF-8");                 // before reading params

        String name     = req.getParameter("fullName");
        String email    = req.getParameter("email");
        String password = req.getParameter("password");
        String ageText  = req.getParameter("age");
        String gender   = req.getParameter("gender");     // null if none selected
        String[] skills = req.getParameterValues("skills"); // null if none ticked
        String course   = req.getParameter("course");
        String address  = req.getParameter("address");
        String source   = req.getParameter("source");

        // ---- server-side validation ----
        List<String> errors = new ArrayList<>();
        if (name == null || name.isBlank()) errors.add("Name is required");
        if (email == null || !email.contains("@")) errors.add("Valid email is required");
        if (password == null || password.length() < 6) errors.add("Password must be 6+ characters");
        Integer age = null;
        if (ageText != null && !ageText.isBlank()) {
            try {
                age = Integer.parseInt(ageText);
            } catch (NumberFormatException e) {
                errors.add("Age must be a number");
            }
        }

        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        if (!errors.isEmpty()) {
            out.println("<h3 style='color:red'>Please fix the errors:</h3><ul>");
            for (String e : errors) out.println("<li>" + e + "</li>");
            out.println("</ul><a href='register.html'>Back to form</a>");
            return;
        }

        out.println("<h2>Registration Successful</h2>");
        out.println("<table border='1' cellpadding='5'>");
        row(out, "Name", HtmlUtil.esc(name));
        row(out, "Email", HtmlUtil.esc(email));
        row(out, "Age", age == null ? "Not given" : age.toString());
        row(out, "Gender", gender == null ? "Not selected" : HtmlUtil.esc(gender));
        row(out, "Skills", skills == null ? "None" : HtmlUtil.esc(String.join(", ", skills)));
        row(out, "Course", HtmlUtil.esc(course));
        row(out, "Address", HtmlUtil.esc(address));
        row(out, "Source", HtmlUtil.esc(source));
        out.println("</table>");
    }

    private void row(PrintWriter out, String label, String value) {
        out.println("<tr><th>" + label + "</th><td>" + value + "</td></tr>");
    }
}

// ===== com/course/web/HtmlUtil.java =====
package com.course.web;

public final class HtmlUtil {
    private HtmlUtil() { }

    // escape user input before writing it into HTML (prevents XSS)
    public static String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace(String.valueOf('"'), "&quot;")
                .replace("'", "&#39;");
    }
}

<!-- ===== add to WEB-INF/web.xml ===== -->
<servlet>
    <servlet-name>register</servlet-name>
    <servlet-class>com.course.web.RegisterServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>register</servlet-name>
    <url-pattern>/register</url-pattern>
</servlet-mapping>`,
      result: "Registration Successful\n| Name    | Asha Rao       |\n| Email   | asha@mail.com  |\n| Age     | 21             |\n| Gender  | Female         |\n| Skills  | Java, SQL      |\n| Course  | Java           |\n| Address | Pune           |\n| Source  | website        |\n\n(The password is read but deliberately not displayed. Submitting with no skills shows 'None'; a name like <b>Hi</b> is shown as plain text, not bold.)",
      explanation: "getParameterValues returns all ticked checkboxes. Absent fields (no radio chosen, no checkbox ticked) come back as null, so every value is null-checked. The select sends its option value (Java), not the visible text (Java Full Stack). String.valueOf('\"') turns the double-quote character into a String for replace. Only doPost is overridden, so opening /register directly in the browser (a GET) returns 405."
    },
    {
      title: "Search with GET and listing all parameters",
      scenario: "A search form that uses GET so the URL can be bookmarked and shared, plus a debug servlet that prints every parameter received using getParameterMap.",
      steps: [
        "Create src/main/webapp/search.html and class SearchServlet",
        "SearchServlet uses @WebServlet(\"/search\"), so no web.xml change is needed",
        "Open search.html, type 'java' and 'React', submit, and look at the browser address bar",
        "Edit the URL by hand (e.g. change q=java to q=spring) and press Enter: same servlet, new result"
      ],
      code: `<!-- ===== src/main/webapp/search.html ===== -->
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Search</title></head>
<body>
<form action="search" method="get">
    Keyword: <input type="text" name="q">
    Course:
    <select name="course" multiple size="3">
        <option>Java</option>
        <option>Python</option>
        <option>React</option>
    </select>
    <button type="submit">Search</button>
</form>
</body>
</html>

// ===== com/course/web/SearchServlet.java =====
package com.course.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.Map;

@WebServlet("/search")
public class SearchServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        String q = req.getParameter("q");
        out.println("<h3>You searched for: " + HtmlUtil.esc(q) + "</h3>");
        out.println("<p>Query string: " + HtmlUtil.esc(req.getQueryString()) + "</p>");

        out.println("<h4>All parameters</h4><ul>");
        Map<String, String[]> params = req.getParameterMap();
        for (Map.Entry<String, String[]> e : params.entrySet()) {
            out.println("<li>" + HtmlUtil.esc(e.getKey()) + " = "
                    + HtmlUtil.esc(Arrays.toString(e.getValue())) + "</li>");
        }
        out.println("</ul>");
    }
}`,
      result: "Address bar: http://localhost:8080/student-web/search?q=java&course=React\n\nYou searched for: java\nQuery string: q=java&course=React\nAll parameters\n- q = [java]\n- course = [React]",
      explanation: "With method=get the parameters are appended to the URL, so the page can be bookmarked. getParameterMap returns every parameter with all its values (String[]). Tomcat keeps the parameters in the order they arrived. An <option> without a value attribute sends its text."
    },
    {
      title: "Form to Servlet to MySQL: saving a student with JDBC",
      scenario: "Add a student to the students table (from the JDBC module) through a web form, using a DBUtil class and PreparedStatement, then redirect to avoid duplicate submissions.",
      steps: [
        "Make sure mysql-connector-j is in pom.xml (Day 7 pom already has it) and the college_db.students table exists (Day 1 script)",
        "Create package com.course.util with class DBUtil, and the servlet AddStudentServlet in com.course.web",
        "Create src/main/webapp/add-student.html and src/main/webapp/success.html",
        "Redeploy, open add-student.html, add a student, then check SELECT * FROM students in MySQL Workbench",
        "Press F5 on the success page: nothing is inserted again (Post/Redirect/Get)"
      ],
      code: `// ===== com/course/util/DBUtil.java =====
package com.course.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public final class DBUtil {
    private static final String URL  = "jdbc:mysql://localhost:3306/college_db";
    private static final String USER = "root";
    private static final String PASS = "root";

    static {
        try {
            // explicit loading is recommended inside Tomcat (driver is in WEB-INF/lib)
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    private DBUtil() { }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }
}

// ===== com/course/web/AddStudentServlet.java =====
package com.course.web;

import com.course.util.DBUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;

@WebServlet("/addStudent")
public class AddStudentServlet extends HttpServlet {

    private static final String SQL =
            "INSERT INTO students(name, email, course, marks) VALUES (?, ?, ?, ?)";

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        String name   = req.getParameter("name");
        String email  = req.getParameter("email");
        String course = req.getParameter("course");
        String marks  = req.getParameter("marks");

        resp.setContentType("text/html;charset=UTF-8");
        if (name == null || name.isBlank() || email == null || email.isBlank()) {
            resp.getWriter().println("<p style='color:red'>Name and email are required.</p>"
                    + "<a href='add-student.html'>Back</a>");
            return;
        }

        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(SQL)) {
            ps.setString(1, name.trim());
            ps.setString(2, email.trim());
            ps.setString(3, course);
            ps.setInt(4, (marks == null || marks.isBlank()) ? 0 : Integer.parseInt(marks));
            ps.executeUpdate();
            resp.sendRedirect("success.html");          // Post/Redirect/Get
        } catch (SQLIntegrityConstraintViolationException e) {
            resp.getWriter().println("<p style='color:red'>Email "
                    + HtmlUtil.esc(email) + " is already registered.</p>"
                    + "<a href='add-student.html'>Back</a>");
        } catch (SQLException | NumberFormatException e) {
            throw new ServletException("Could not save student", e);   // shows 500 page
        }
    }
}

<!-- ===== src/main/webapp/add-student.html ===== -->
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Add Student</title></head>
<body>
<h2>Add Student</h2>
<form action="addStudent" method="post">
    Name:   <input type="text" name="name" required><br><br>
    Email:  <input type="email" name="email" required><br><br>
    Course: <select name="course">
                <option>Java</option><option>Python</option><option>React</option>
            </select><br><br>
    Marks:  <input type="number" name="marks" min="0" max="100"><br><br>
    <button type="submit">Save</button>
</form>
</body>
</html>

<!-- ===== src/main/webapp/success.html ===== -->
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Saved</title></head>
<body>
<h2>Student saved successfully!</h2>
<a href="add-student.html">Add another</a>
</body>
</html>`,
      result: "After submitting Neha / neha2@mail.com / Java / 81:\nBrowser URL changes to /student-web/success.html and shows 'Student saved successfully!'\nMySQL: a new row (Neha, neha2@mail.com, Java, 81) appears in students.\nSubmitting the same email again shows: Email neha2@mail.com is already registered.",
      explanation: "The servlet only coordinates: read parameters, validate, call JDBC, redirect. The MySQL driver JAR is packaged into WEB-INF/lib by Maven because it has the default compile scope. Class.forName in DBUtil avoids 'No suitable driver' issues that can happen with drivers loaded from a web application's class loader. sendRedirect makes the browser issue a new GET to success.html, so a refresh does not repeat the INSERT."
    },
    {
      title: "Login form: doGet shows the form, doPost checks the database",
      scenario: "One servlet handles both showing the login form (GET) and checking credentials against the users table from Day 3 (POST).",
      steps: [
        "Make sure the users table from Day 3 exists (admin / admin@123)",
        "Create class LoginServlet in com.course.web",
        "Open http://localhost:8080/student-web/login (GET shows the form)",
        "Try admin / wrong, then the injection string ' OR '1'='1, then admin / admin@123"
      ],
      code: `package com.course.web;

import com.course.util.DBUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        showForm(resp, null);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String user = req.getParameter("username");
        String pass = req.getParameter("password");

        String sql = "SELECT username FROM users WHERE username = ? AND password = ?";
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, user);
            ps.setString(2, pass);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    resp.setContentType("text/html;charset=UTF-8");
                    resp.getWriter().println("<h2>Welcome, " + HtmlUtil.esc(rs.getString(1)) + "!</h2>");
                } else {
                    showForm(resp, "Invalid username or password");
                }
            }
        } catch (SQLException e) {
            throw new ServletException(e);
        }
    }

    private void showForm(HttpServletResponse resp, String error) throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<h2>Login</h2>");
        if (error != null) out.println("<p style='color:red'>" + error + "</p>");
        out.println("<form action='login' method='post'>");
        out.println("Username: <input name='username' required><br><br>");
        out.println("Password: <input type='password' name='password' required><br><br>");
        out.println("<button>Login</button></form>");
    }
}`,
      result: "GET /login                         -> Login form\nPOST admin / wrong                 -> form again with 'Invalid username or password'\nPOST admin / ' OR '1'='1           -> 'Invalid username or password' (injection blocked)\nPOST admin / admin@123             -> Welcome, admin!",
      explanation: "Using the same URL for GET (show) and POST (process) is a common pattern. The password is sent with POST so it never appears in the URL. PreparedStatement from Day 3 keeps the login safe from SQL injection. Day 12 will store the logged-in user in an HttpSession."
    }
  ],
  interview: [
    { q: "Difference between doGet() and doPost()?", a: "doGet handles HTTP GET: parameters in the URL, bookmarkable, length-limited, for reading data. doPost handles HTTP POST: parameters in the request body, not visible in the URL, no size limit, for creating/updating data and sensitive data like passwords.", level: "Easy" },
    { q: "How do you read form data in a servlet?", a: "req.getParameter(name) for single values, req.getParameterValues(name) for multiple values (checkboxes, multi-select), getParameterNames() and getParameterMap() for all parameters.", level: "Easy" },
    { q: "What does getParameter return for a missing field and for an empty field?", a: "null if the parameter was not sent at all (e.g. unchecked checkbox), and an empty string \"\" if the field was submitted empty.", level: "Medium" },
    { q: "How do you read multiple checkbox values?", a: "Give all checkboxes the same name and use req.getParameterValues(\"name\"), which returns a String[] or null if none are ticked.", level: "Easy" },
    { q: "How do you handle UTF-8 form data?", a: "Call req.setCharacterEncoding(\"UTF-8\") before reading any parameter (or use a filter), and set resp.setContentType(\"text/html;charset=UTF-8\") before getWriter().", level: "Medium" },
    { q: "Can one servlet handle both GET and POST?", a: "Yes, override both doGet and doPost; often one delegates to the other, or GET shows a form and POST processes it.", level: "Easy" },
    { q: "What happens if the form method is post but the servlet only has doGet?", a: "The default HttpServlet.doPost returns HTTP 405 Method Not Allowed.", level: "Medium" },
    { q: "What is the Post/Redirect/Get pattern?", a: "After processing a POST that changes data, the server responds with a redirect (302) to a GET URL. Refreshing the result page then repeats only the harmless GET, preventing duplicate form submissions.", level: "Medium" },
    { q: "Why must you validate on the server if the HTML already has 'required'?", a: "Client-side checks can be bypassed (disabled JavaScript, edited HTML, curl/Postman). Server-side validation is the only reliable protection.", level: "Medium" },
    { q: "What is XSS and how do you prevent it in a servlet?", a: "Cross-Site Scripting: injecting script through input that is later printed into a page. Prevent by escaping output (& < > \" '), validating input, and using JSTL c:out or a templating engine that escapes automatically.", level: "Hard" },
    { q: "Why is setContentType called before getWriter()?", a: "The charset in the content type decides how the PrintWriter encodes characters. Calling it after getWriter() has no effect on the encoding.", level: "Hard" }
  ],
  practice: [
    {
      task: "Create a feedback form (name, rating 1-5 as radio buttons, comments) that posts to FeedbackServlet, which displays a thank-you message and shows a different message for rating <= 2.",
      hint: "Parse the rating with Integer.parseInt after null-checking.",
      solution: `<!-- feedback.html -->
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Feedback</title></head>
<body>
<form action="feedback" method="post">
    Name: <input name="name" required><br>
    Rating:
    <input type="radio" name="rating" value="1">1
    <input type="radio" name="rating" value="2">2
    <input type="radio" name="rating" value="3">3
    <input type="radio" name="rating" value="4">4
    <input type="radio" name="rating" value="5" checked>5<br>
    Comments:<br><textarea name="comments"></textarea><br>
    <button>Send</button>
</form>
</body></html>

// FeedbackServlet.java
package com.course.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/feedback")
public class FeedbackServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        req.setCharacterEncoding("UTF-8");
        String name = req.getParameter("name");
        String r = req.getParameter("rating");
        int rating = (r == null) ? 0 : Integer.parseInt(r);
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<h2>Thank you, " + HtmlUtil.esc(name) + "!</h2>");
        if (rating <= 2) {
            out.println("<p>Sorry about your experience. Our team will contact you.</p>");
        } else {
            out.println("<p>Glad you liked it! You rated us " + rating + "/5.</p>");
        }
    }
}`
    },
    {
      task: "Build a simple calculator: a form with two numbers and an operation (select: add, sub, mul, div). The servlet shows the result and handles divide-by-zero and invalid numbers.",
      hint: "Use a switch expression on the operation; catch NumberFormatException.",
      solution: `package com.course.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/calc")
public class CalcServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        var out = resp.getWriter();
        out.println("<form method='post' action='calc'>"
                + "<input name='a'> <select name='op'>"
                + "<option>add</option><option>sub</option><option>mul</option><option>div</option>"
                + "</select> <input name='b'> <button>=</button></form>");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        var out = resp.getWriter();
        try {
            double a = Double.parseDouble(req.getParameter("a"));
            double b = Double.parseDouble(req.getParameter("b"));
            String op = req.getParameter("op");
            if (op.equals("div") && b == 0) {
                out.println("<p>Cannot divide by zero</p>");
                return;
            }
            double r = switch (op) {
                case "add" -> a + b;
                case "sub" -> a - b;
                case "mul" -> a * b;
                default    -> a / b;
            };
            out.println("<h3>Result: " + r + "</h3><a href='calc'>Again</a>");
        } catch (NumberFormatException | NullPointerException e) {
            out.println("<p>Please enter valid numbers</p><a href='calc'>Back</a>");
        }
    }
}`
    },
    {
      task: "Write a StudentListServlet (GET /students) that reads all rows from the students table and displays them in an HTML table, with an optional ?course=Java filter.",
      hint: "Choose the SQL based on whether the course parameter is present; always use PreparedStatement.",
      solution: `package com.course.web;

import com.course.util.DBUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;

@WebServlet("/students")
public class StudentListServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String course = req.getParameter("course");
        boolean filter = course != null && !course.isBlank();
        String sql = filter
                ? "SELECT * FROM students WHERE course = ? ORDER BY id"
                : "SELECT * FROM students ORDER BY id";
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<h2>Students</h2><table border='1' cellpadding='5'>");
        out.println("<tr><th>ID</th><th>Name</th><th>Email</th><th>Course</th><th>Marks</th></tr>");
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            if (filter) ps.setString(1, course);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.println("<tr><td>" + rs.getInt("id") + "</td><td>"
                            + HtmlUtil.esc(rs.getString("name")) + "</td><td>"
                            + HtmlUtil.esc(rs.getString("email")) + "</td><td>"
                            + HtmlUtil.esc(rs.getString("course")) + "</td><td>"
                            + rs.getInt("marks") + "</td></tr>");
                }
            }
        } catch (SQLException e) {
            throw new ServletException(e);
        }
        out.println("</table>");
    }
}`
    },
    {
      task: "Write a servlet that accepts both GET and POST on /echo and prints every parameter name with all its values using getParameterNames().",
      hint: "doPost can simply call doGet(req, resp). Loop with names.hasMoreElements().",
      solution: `package com.course.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;

@WebServlet("/echo")
public class EchoServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<h3>" + req.getMethod() + " parameters</h3><ul>");
        Enumeration<String> names = req.getParameterNames();
        while (names.hasMoreElements()) {
            String n = names.nextElement();
            out.println("<li>" + HtmlUtil.esc(n) + ": "
                    + HtmlUtil.esc(String.join(", ", req.getParameterValues(n))) + "</li>");
        }
        out.println("</ul>");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        doGet(req, resp);
    }
}`
    }
  ],
  quiz: [
    { question: "Which method reads all values of a checkbox group named 'skills'?", options: ["req.getParameter(\"skills\")", "req.getParameterValues(\"skills\")", "req.getAttribute(\"skills\")", "req.getParameters(\"skills\")"], answer: 1, explanation: "getParameterValues returns a String[] with every ticked value." },
    { question: "Which form attribute decides whether doGet or doPost is called?", options: ["action", "name", "enctype", "method"], answer: 3, explanation: "method=get calls doGet; method=post calls doPost." },
    { question: "What does req.getParameter(\"gender\") return if no radio button was selected?", options: ["null", "Empty string", "\"none\"", "It throws an exception"], answer: 0, explanation: "An unselected radio group sends nothing, so the parameter is absent and null is returned." },
    { question: "When must req.setCharacterEncoding(\"UTF-8\") be called?", options: ["After reading parameters", "Only for GET requests", "Before reading any parameter", "In destroy()"], answer: 2, explanation: "Once parameters are parsed the encoding cannot be changed." },
    { question: "Which is the best choice for sending a login password?", options: ["GET with the password in the URL", "POST over HTTPS", "A cookie", "A hidden field in a GET form"], answer: 1, explanation: "POST keeps it out of the URL and logs; HTTPS encrypts it in transit." }
  ]
};
