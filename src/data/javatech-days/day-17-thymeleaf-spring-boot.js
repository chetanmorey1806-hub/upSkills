export default {
  id: 'day-17-thymeleaf-spring-boot',
  title: 'Thymeleaf with Spring Boot: Server-Side Rendering, Forms, Validation and a CRUD UI',
  module: 'Module 5: Spring Ecosystem Extras',
  day: 17,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Build HTML pages on the server with Thymeleaf and Spring Boot 3: learn the most used th:* attributes, reuse layouts with fragments, handle forms with validation, and finish a complete Student CRUD web UI.',
  objectives: [
    'Explain server-side rendering and where Thymeleaf fits in Spring MVC',
    'Use th:text, th:each, th:if/th:unless, th:href, th:object and th:field correctly',
    'Reuse header/footer with th:fragment, th:replace and th:insert',
    'Handle a form with @ModelAttribute, @Valid, BindingResult and show error messages',
    'Build a complete list/add/edit/delete Student UI with the Post-Redirect-Get pattern',
  ],
  theory: [
    {
      heading: 'Server-Side Rendering (SSR) and Thymeleaf',
      content:
        'There are two ways to build a web UI with Spring Boot:\n1. REST API + separate frontend (React/Angular): the server returns JSON, the browser builds the HTML.\n2. Server-side rendering: the server builds the full HTML page and sends it to the browser.\n\nThymeleaf is a template engine for option 2. A template is a normal .html file with extra th:* attributes. Spring fills the template with data from the Model and sends finished HTML.\n\nFlow in words:\nBrowser GET /students -> DispatcherServlet -> StudentController.list(Model) -> model.addAttribute("students", list) -> returns "students/list" -> ThymeleafViewResolver finds templates/students/list.html -> Thymeleaf replaces th:* attributes with real data -> plain HTML goes to the browser.\n\nAnalogy: A template is a printed admission form with blank boxes. The controller is the clerk who fills the boxes. The student (browser) only receives the filled form.\n\nWhy Thymeleaf (not JSP) in Spring Boot: JSP does not work well with executable JARs, while Thymeleaf works out of the box with spring-boot-starter-thymeleaf. Thymeleaf templates are also "natural templates" - you can open them directly in a browser and they still look like valid HTML.',
      points: [
        'Dependency: spring-boot-starter-thymeleaf (plus spring-boot-starter-web)',
        'Templates go in src/main/resources/templates; static files (CSS/JS/images) go in src/main/resources/static',
        'Use @Controller (NOT @RestController) - the returned String is a view name, not the response body',
        'Add xmlns:th="http://www.thymeleaf.org" on the <html> tag so the IDE understands th:* attributes',
        'spring.thymeleaf.cache=false in development so changes show after refresh (DevTools sets this automatically)',
      ],
    },
    {
      heading: 'Expressions and Core Attributes',
      content:
        'Thymeleaf has five kinds of expressions:\n- ${...} variable expression: reads a Model attribute. ${student.name} calls getName().\n- *{...} selection expression: reads a field of the object chosen with th:object.\n- @{...} link (URL) expression: builds URLs and adds the context path. @{/students/{id}(id=${s.id})} -> /students/5\n- #{...} message expression: reads text from messages.properties (i18n).\n- ~{...} fragment expression: points to a reusable fragment.\n\nMost used attributes:\n- th:text: sets the element text (HTML is escaped - safe against XSS). th:utext does not escape.\n- th:each: loop. <tr th:each="s, stat : ${students}"> - stat gives index, count, size, even, odd, first, last.\n- th:if / th:unless: show the element only if the condition is true / false.\n- th:href, th:src, th:action: URL attributes, used with @{...}.\n- th:value, th:class, th:classappend, th:attr: set other attributes.\n- th:switch / th:case: multi-way choice.\n- th:object and th:field: bind a form to an object (next section).',
      syntax: '<p th:text="${message}">Default text shown when opened as a plain file</p>\n<tr th:each="s, stat : ${students}">\n  <td th:text="${stat.count}">1</td>\n  <td th:text="${s.name}">Name</td>\n</tr>\n<p th:if="${#lists.isEmpty(students)}">No students found</p>\n<a th:href="@{/students/edit/{id}(id=${s.id})}">Edit</a>\n<a th:href="@{/students(page=2,size=10)}">Next</a>  <!-- /students?page=2&size=10 -->',
      points: [
        'Utility objects: #strings, #numbers, #dates, #temporals (java.time), #lists, #fields',
        'Inline text: [[${name}]] escapes, [(${name})] does not escape',
        'Safe navigation: ${student?.address?.city} returns null instead of throwing',
        'Elvis/default: ${name} ?: \'Guest\'',
      ],
      tip: 'Always prefer th:text over th:utext. th:utext with user input opens an XSS (Cross-Site Scripting) hole.',
    },
    {
      heading: 'Layouts with Fragments',
      content:
        'Every page usually has the same header, navigation bar and footer. Copy-paste is bad: change once, edit everywhere. Thymeleaf fragments solve this.\n\n1. Define a fragment: <nav th:fragment="navbar">...</nav> in templates/fragments/layout.html\n2. Use it in a page:\n   - th:replace="~{fragments/layout :: navbar}" - the host tag is REPLACED by the fragment.\n   - th:insert="~{fragments/layout :: navbar}" - the fragment is put INSIDE the host tag.\n3. Fragments can take parameters: th:fragment="head(title)" and use th:replace="~{fragments/layout :: head(\'Students\')}".\n\nAnalogy: fragments are like rubber stamps - you design the college logo stamp once and press it on every page.',
      syntax: '<!-- fragments/layout.html -->\n<head th:fragment="head(title)">\n  <meta charset="UTF-8">\n  <title th:text="${title}">Title</title>\n  <link rel="stylesheet" th:href="@{/css/app.css}">\n</head>\n\n<!-- any page -->\n<head th:replace="~{fragments/layout :: head(\'Students\')}"></head>',
      points: [
        'th:replace is used most often because it does not leave an extra wrapper tag',
        'Fragment file path is relative to templates/ and has no .html extension',
        'For full "decorator" layouts, the optional thymeleaf-layout-dialect library adds layout:decorate',
      ],
    },
    {
      heading: 'Form Handling: th:object, th:field and Validation',
      content:
        'Form flow (two requests):\n1. GET /students/new -> controller puts an EMPTY object in the model -> form page shows.\n2. POST /students -> Spring binds request parameters to the object (@ModelAttribute) -> @Valid runs Bean Validation -> if errors, return the same form view; if OK, save and REDIRECT.\n\nIn the template:\n- th:object="${student}" on <form> selects the object.\n- th:field="*{name}" on an input sets id, name and value attributes automatically, and on re-display keeps what the user typed.\n- th:errors="*{name}" prints the error message for that field.\n- #fields.hasErrors(\'name\') checks if the field has errors.\n\nIn the controller, BindingResult MUST come immediately after the @Valid parameter, otherwise Spring throws an exception instead of giving you the errors.',
      syntax: '@PostMapping("/students")\npublic String save(@Valid @ModelAttribute("student") Student student,\n                   BindingResult result, RedirectAttributes ra) {\n    if (result.hasErrors()) return "students/form";\n    service.save(student);\n    ra.addFlashAttribute("msg", "Student saved");\n    return "redirect:/students";\n}',
      points: [
        'Post-Redirect-Get (PRG): after a successful POST, redirect. Pressing F5 then does not submit the form again',
        'RedirectAttributes.addFlashAttribute keeps a message for exactly one request after the redirect',
        'Spring Security (if added) inserts the CSRF hidden field automatically into th:action forms',
        'HTML forms only support GET and POST, so delete is usually done with POST /students/delete/{id}',
      ],
      tip: 'Common mistake: writing th:field="${name}" instead of th:field="*{name}". th:field needs the selection expression *{...}.',
    },
    {
      heading: 'Thymeleaf vs React/Angular - When to Use What',
      content:
        'Use Thymeleaf when: admin panels, internal company tools, simple CRUD sites, SEO-friendly pages, small teams that only know Java, or quick prototypes.\nUse a REST API + React/Angular when: highly interactive UIs, mobile apps also need the same API, separate frontend team.\n\nMany real projects use both: a REST API for the mobile app and Thymeleaf for the internal admin screens.',
      points: [
        'SSR: faster first page load, good SEO, simpler deployment (one JAR)',
        'SPA: richer interaction, no full page reloads, clear separation of frontend and backend',
      ],
    },
  ],
  examples: [
    {
      title: 'Project Setup and First Thymeleaf Page',
      scenario: 'Create a Spring Boot project and show a welcome page with a name from the controller.',
      steps: [
        'Open start.spring.io: Maven, Spring Boot 3.3.x, Java 17, Group com.example, Artifact student-ui. Dependencies: Spring Web, Thymeleaf, Spring Data JPA, H2 Database, Validation, DevTools > GENERATE',
        'IntelliJ: File > Open > select the unzipped student-ui folder > Trust Project. STS: File > Import > Maven > Existing Maven Projects',
        'Create package com.example.studentui.controller and class HomeController',
        'Right-click src/main/resources/templates > New > HTML File > home.html and paste the template',
        'Run StudentUiApplication (green Run button) and open http://localhost:8080/?name=Priya',
      ],
      code: `<!-- pom.xml (main dependencies) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>

// HomeController.java
package com.example.studentui.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(@RequestParam(defaultValue = "Guest") String name, Model model) {
        model.addAttribute("name", name);
        model.addAttribute("courses", List.of("Core Java", "Spring Boot", "React"));
        return "home";   // -> templates/home.html
    }
}

<!-- src/main/resources/templates/home.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Home</title>
</head>
<body>
    <h1 th:text="'Welcome, ' + \${name} + '!'">Welcome, Guest!</h1>
    <p>Your courses:</p>
    <ol>
        <li th:each="c : \${courses}" th:text="\${c}">Course</li>
    </ol>
    <p th:if="\${#lists.size(courses) > 2}">You are a full stack learner!</p>
</body>
</html>`,
      result: `Browser: http://localhost:8080/?name=Priya
Rendered HTML (View Page Source):
<h1>Welcome, Priya!</h1>
<p>Your courses:</p>
<ol>
    <li>Core Java</li>
    <li>Spring Boot</li>
    <li>React</li>
</ol>
<p>You are a full stack learner!</p>`,
      explanation: 'The controller returns the view name "home". ThymeleafViewResolver adds the prefix classpath:/templates/ and suffix .html. th:text replaces the placeholder text, th:each repeats the <li> once per course, and th:if keeps the <p> because the list has 3 items. Notice there are no th:* attributes in the final HTML - the browser only sees plain HTML.',
    },
    {
      title: 'Reusable Layout with Fragments',
      scenario: 'Create a common head, navbar and footer and use them on every page.',
      steps: [
        'Create folder src/main/resources/templates/fragments and file layout.html',
        'Create src/main/resources/static/css/app.css with simple styles',
        'In each page replace the <head>, <nav> and <footer> with th:replace',
        'Refresh the browser - every page now shares the same navbar',
      ],
      code: `<!-- templates/fragments/layout.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head th:fragment="head(title)">
    <meta charset="UTF-8">
    <title th:text="\${title} + ' | Student Portal'">Title</title>
    <link rel="stylesheet" th:href="@{/css/app.css}">
</head>
<body>
<nav th:fragment="navbar" class="nav">
    <a th:href="@{/}">Home</a> |
    <a th:href="@{/students}">Students</a> |
    <a th:href="@{/students/new}">Add Student</a>
</nav>

<footer th:fragment="footer">
    <hr>
    <small>&copy; 2025 Student Portal - Built with Spring Boot and Thymeleaf</small>
</footer>
</body>
</html>

/* static/css/app.css */
body  { font-family: Arial, sans-serif; margin: 20px; }
.nav a { margin-right: 8px; }
table { border-collapse: collapse; }
td, th { border: 1px solid #ccc; padding: 6px 10px; }
.error { color: red; font-size: 13px; }
.success { color: green; }

<!-- any page, e.g. templates/about.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head th:replace="~{fragments/layout :: head('About')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<h2>About this portal</h2>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>`,
      result: `Rendered <head> of about.html:
<head>
    <meta charset="UTF-8">
    <title>About | Student Portal</title>
    <link rel="stylesheet" href="/css/app.css">
</head>
The page shows: Home | Students | Add Student, then "About this portal", then the footer line.`,
      explanation: 'The head fragment takes a parameter (title) so each page gets its own title. th:replace swaps the empty <nav> tag for the full navbar. @{/css/app.css} adds the context path automatically, so links still work if the app is deployed under /portal.',
    },
    {
      title: 'Complete Student CRUD UI (Entity, Repository, Service, Controller)',
      scenario: 'Build list, add, edit and delete pages for students with validation, using H2 in-memory DB.',
      steps: [
        'Add the properties below to src/main/resources/application.properties',
        'Create packages entity, repository, service, controller under com.example.studentui',
        'Create Student entity, StudentRepository, StudentService and StudentController as shown',
        'Create templates/students/list.html and templates/students/form.html (next example)',
        'Run the app and open http://localhost:8080/students; H2 console is at /h2-console (JDBC URL jdbc:h2:mem:studentdb)',
      ],
      code: `# application.properties
spring.datasource.url=jdbc:h2:mem:studentdb
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.h2.console.enabled=true
spring.thymeleaf.cache=false

// entity/Student.java
package com.example.studentui.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 50, message = "Name must be 3 to 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Please select a course")
    private String course;

    @Min(value = 0, message = "Marks cannot be negative")
    @Max(value = 100, message = "Marks cannot be more than 100")
    private int marks;

    public Student() { }

    // getters and setters for all fields
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public int getMarks() { return marks; }
    public void setMarks(int marks) { this.marks = marks; }
}

// repository/StudentRepository.java
package com.example.studentui.repository;

import com.example.studentui.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByNameContainingIgnoreCase(String keyword);
}

// service/StudentService.java
package com.example.studentui.service;

import com.example.studentui.entity.Student;
import com.example.studentui.repository.StudentRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StudentService {
    private final StudentRepository repo;

    public StudentService(StudentRepository repo) { this.repo = repo; }

    public List<Student> findAll(String keyword) {
        if (keyword == null || keyword.isBlank()) return repo.findAll();
        return repo.findByNameContainingIgnoreCase(keyword);
    }
    public Student findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + id));
    }
    public Student save(Student s) { return repo.save(s); }
    public void delete(Long id) { repo.deleteById(id); }
}

// controller/StudentController.java
package com.example.studentui.controller;

import com.example.studentui.entity.Student;
import com.example.studentui.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.util.List;

@Controller
@RequestMapping("/students")
public class StudentController {
    private final StudentService service;

    public StudentController(StudentService service) { this.service = service; }

    @ModelAttribute("courses")            // available in every view of this controller
    public List<String> courses() {
        return List.of("Java Full Stack", "Python", "Data Analytics");
    }

    @GetMapping
    public String list(@RequestParam(required = false) String keyword, Model model) {
        model.addAttribute("students", service.findAll(keyword));
        model.addAttribute("keyword", keyword);
        return "students/list";
    }

    @GetMapping("/new")
    public String showAddForm(Model model) {
        model.addAttribute("student", new Student());
        return "students/form";
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model) {
        model.addAttribute("student", service.findById(id));
        return "students/form";
    }

    @PostMapping("/save")
    public String save(@Valid @ModelAttribute("student") Student student,
                       BindingResult result, RedirectAttributes ra) {
        if (result.hasErrors()) {
            return "students/form";            // show the same form with errors
        }
        boolean isNew = student.getId() == null;
        service.save(student);
        ra.addFlashAttribute("msg", isNew ? "Student added successfully" : "Student updated successfully");
        return "redirect:/students";           // Post-Redirect-Get
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id, RedirectAttributes ra) {
        service.delete(id);
        ra.addFlashAttribute("msg", "Student deleted");
        return "redirect:/students";
    }
}`,
      result: `Console (startup):
Tomcat started on port 8080 (http) with context path '/'
Started StudentUiApplication in 3.412 seconds
After saving a new student:
Hibernate: insert into students (course,email,marks,name,id) values (?,?,?,?,default)
Browser is redirected to /students and shows: Student added successfully`,
      explanation: 'The same form.html is used for add and edit: for edit, the student has an id, which is sent back in a hidden field, so repo.save() does an UPDATE instead of an INSERT. @ModelAttribute("courses") on a method adds the course list to the model for every request handled by this controller, which is needed for the dropdown even when the form is re-shown with errors.',
    },
    {
      title: 'List and Form Templates with Validation Messages',
      scenario: 'Write the two Thymeleaf pages used by the StudentController.',
      steps: [
        'Create folder templates/students',
        'Create list.html and form.html with the code below',
        'Open /students > click Add Student > submit an empty form to see the validation messages',
        'Fill valid data and submit; you are redirected to the list with a green success message',
      ],
      code: `<!-- templates/students/list.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head th:replace="~{fragments/layout :: head('Students')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<h2>Students</h2>

<p class="success" th:if="\${msg}" th:text="\${msg}">Saved</p>

<form th:action="@{/students}" method="get">
    <input type="text" name="keyword" th:value="\${keyword}" placeholder="Search by name">
    <button type="submit">Search</button>
</form>

<table th:unless="\${#lists.isEmpty(students)}">
    <thead>
    <tr><th>#</th><th>Name</th><th>Email</th><th>Course</th><th>Marks</th><th>Result</th><th>Actions</th></tr>
    </thead>
    <tbody>
    <tr th:each="s, stat : \${students}">
        <td th:text="\${stat.count}">1</td>
        <td th:text="\${s.name}">Ravi</td>
        <td th:text="\${s.email}">ravi@mail.com</td>
        <td th:text="\${s.course}">Java</td>
        <td th:text="\${s.marks}">80</td>
        <td th:text="\${s.marks >= 40} ? 'PASS' : 'FAIL'"
            th:classappend="\${s.marks >= 40} ? 'success' : 'error'">PASS</td>
        <td>
            <a th:href="@{/students/edit/{id}(id=\${s.id})}">Edit</a>
            <form th:action="@{/students/delete/{id}(id=\${s.id})}" method="post" style="display:inline"
                  onsubmit="return confirm('Delete this student?')">
                <button type="submit">Delete</button>
            </form>
        </td>
    </tr>
    </tbody>
</table>
<p th:if="\${#lists.isEmpty(students)}">No students found.</p>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>

<!-- templates/students/form.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head th:replace="~{fragments/layout :: head('Student Form')}"></head>
<body>
<nav th:replace="~{fragments/layout :: navbar}"></nav>
<h2 th:text="\${student.id == null} ? 'Add Student' : 'Edit Student'">Add Student</h2>

<form th:action="@{/students/save}" th:object="\${student}" method="post">
    <input type="hidden" th:field="*{id}">

    <label>Name</label><br>
    <input type="text" th:field="*{name}">
    <span class="error" th:if="\${#fields.hasErrors('name')}" th:errors="*{name}"></span><br>

    <label>Email</label><br>
    <input type="email" th:field="*{email}">
    <span class="error" th:if="\${#fields.hasErrors('email')}" th:errors="*{email}"></span><br>

    <label>Course</label><br>
    <select th:field="*{course}">
        <option value="">-- Select --</option>
        <option th:each="c : \${courses}" th:value="\${c}" th:text="\${c}">Course</option>
    </select>
    <span class="error" th:if="\${#fields.hasErrors('course')}" th:errors="*{course}"></span><br>

    <label>Marks</label><br>
    <input type="number" th:field="*{marks}">
    <span class="error" th:if="\${#fields.hasErrors('marks')}" th:errors="*{marks}"></span><br><br>

    <button type="submit">Save</button>
    <a th:href="@{/students}">Cancel</a>
</form>
<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>`,
      result: `Submitting an empty form shows:
Name   [        ]  Name is required
Email  [        ]  Email is required
Course [-- Select --]  Please select a course
Marks  [0]

After entering name "Ravi Kumar", email "ravi@gmail.com", course "Java Full Stack", marks 78:
Student added successfully
# | Name       | Email          | Course          | Marks | Result | Actions
1 | Ravi Kumar | ravi@gmail.com | Java Full Stack | 78    | PASS   | Edit Delete`,
      explanation: 'th:field="*{name}" generates id="name" name="name" value="..." so the typed values stay in the boxes when the form is re-shown with errors. th:errors prints the message from the annotation. Note: an empty name shows only "Name is required" in most cases, but if both @NotBlank and @Size fail Spring may show both messages joined. The delete uses a small POST form because links can only send GET requests.',
    },
    {
      title: 'Global Error Page and th:switch',
      scenario: 'Show a friendly page when a student id does not exist, and show a grade using th:switch.',
      steps: [
        'Create a @ControllerAdvice class GlobalErrorHandler in the controller package',
        'Create templates/error/not-found.html',
        'Open http://localhost:8080/students/edit/999 to see the friendly page',
      ],
      code: `// controller/GlobalErrorHandler.java
package com.example.studentui.controller;

import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@ControllerAdvice
public class GlobalErrorHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String notFound(IllegalArgumentException ex, Model model) {
        model.addAttribute("error", ex.getMessage());
        return "error/not-found";
    }
}

<!-- templates/error/not-found.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head th:replace="~{fragments/layout :: head('Not Found')}"></head>
<body>
<h2>Oops!</h2>
<p class="error" th:text="\${error}">Error message</p>
<a th:href="@{/students}">Back to list</a>
</body>
</html>

<!-- grade with th:switch (inside the list table row) -->
<td th:switch="\${s.marks / 10}">
    <span th:case="10">A+</span>
    <span th:case="9">A+</span>
    <span th:case="8">A</span>
    <span th:case="7">B</span>
    <span th:case="*">C</span>
</td>`,
      result: `GET /students/edit/999  -> HTTP 404
Oops!
Student not found: 999
Back to list

Grade column for marks 78 -> 78/10 = 7 -> B`,
      explanation: '@ControllerAdvice catches the IllegalArgumentException thrown by service.findById and returns a view instead of the default Whitelabel error page. th:case="*" is the default branch. Spring Boot also picks templates/error/404.html automatically for unknown URLs if that file exists.',
    },
  ],
  interview: [
    { q: 'What is Thymeleaf?', a: 'Thymeleaf is a server-side Java template engine. It processes HTML templates that contain th:* attributes, fills them with data from the Spring Model and produces plain HTML. Its templates are natural templates: they open correctly in a browser even without the server.', level: 'Easy' },
    { q: 'Difference between @Controller and @RestController when using Thymeleaf?', a: '@Controller methods return a view name that the ViewResolver turns into a template. @RestController = @Controller + @ResponseBody, so the returned String is written directly into the response body and no template is rendered. For Thymeleaf pages use @Controller.', level: 'Easy' },
    { q: 'What is the difference between ${...} and *{...}?', a: '${...} evaluates an expression on the whole model (e.g. ${student.name}). *{...} evaluates on the object selected by the nearest th:object, so inside th:object="${student}", *{name} is the same as ${student.name}.', level: 'Medium' },
    { q: 'th:text vs th:utext?', a: 'th:text escapes HTML special characters (< becomes &lt;), so it is safe against XSS. th:utext (unescaped) writes HTML as-is; use it only for trusted content.', level: 'Easy' },
    { q: 'th:replace vs th:insert?', a: 'th:replace replaces the host tag with the fragment. th:insert keeps the host tag and puts the fragment inside it. th:include is deprecated.', level: 'Medium' },
    { q: 'What does th:field do?', a: 'Used inside a th:object form, th:field="*{email}" generates the id, name and value attributes for the input and correctly handles checkboxes, radio buttons and select options. It also keeps user input when the form is re-displayed after a validation error.', level: 'Medium' },
    { q: 'Why must BindingResult come right after the @Valid parameter?', a: 'Spring links a BindingResult to the model attribute just before it. If it is missing or in the wrong position, validation errors cause a MethodArgumentNotValidException / BindException (400) instead of being passed to your method, so you cannot re-show the form.', level: 'Medium' },
    { q: 'What is the Post-Redirect-Get pattern?', a: 'After a successful POST, the controller returns "redirect:/url" instead of a view. The browser then does a GET. If the user refreshes, only the GET repeats, so duplicate records are not created. Flash attributes carry a one-time message across the redirect.', level: 'Medium' },
    { q: 'How do you build a URL with a path variable and query parameters in Thymeleaf?', a: 'Use the link expression: @{/students/{id}(id=${s.id})} gives /students/5 and @{/students(page=${p},size=10)} gives /students?page=2&size=10. Variables inside {} in the path are filled; other parameters become query parameters. Context path is added automatically.', level: 'Medium' },
    { q: 'Why is JSP not recommended with Spring Boot?', a: 'JSPs need a servlet container that compiles them, do not work from inside an executable JAR, and have limitations with embedded Tomcat. Thymeleaf, FreeMarker and Mustache work fully with Boot auto-configuration.', level: 'Hard' },
    { q: 'How does Thymeleaf protect forms from CSRF when Spring Security is used?', a: 'When a form uses th:action, Thymeleaf with Spring Security automatically adds a hidden _csrf input with the token. Plain action="" attributes do not get the token, so always use th:action.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a /products page that shows a list of products (name, price, stock) in a table. Show "Out of stock" in red when stock is 0, and the price formatted with 2 decimals.',
      hint: 'Use th:each, th:if/th:unless and #numbers.formatDecimal(price, 1, 2).',
      solution: `// Product.java (a simple record - no DB)
package com.example.studentui.model;
public record Product(String name, double price, int stock) { }

// ProductController.java
@Controller
public class ProductController {
    @GetMapping("/products")
    public String products(Model model) {
        model.addAttribute("products", List.of(
            new Product("Laptop", 54999.5, 4),
            new Product("Mouse", 499, 0),
            new Product("Keyboard", 1250.75, 10)));
        return "products";
    }
}

<!-- templates/products.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>
<table border="1">
  <tr><th>Name</th><th>Price</th><th>Stock</th></tr>
  <tr th:each="p : \${products}">
    <td th:text="\${p.name}">Name</td>
    <td th:text="'Rs. ' + \${#numbers.formatDecimal(p.price, 1, 2)}">0.00</td>
    <td>
      <span th:if="\${p.stock == 0}" style="color:red">Out of stock</span>
      <span th:unless="\${p.stock == 0}" th:text="\${p.stock}">0</span>
    </td>
  </tr>
</table>
</body>
</html>
<!-- Output rows: Laptop Rs. 54999.50 4 | Mouse Rs. 499.00 Out of stock | Keyboard Rs. 1250.75 10 -->`,
    },
    {
      task: 'Build a registration form (username, password, confirm password, age) with validation: username 4-15 chars, password at least 6 chars, age 18-60. Show errors next to each field and a success page after submit.',
      hint: 'Create a RegisterForm class with Bean Validation annotations; compare password and confirm in the controller using result.rejectValue().',
      solution: `// RegisterForm.java
public class RegisterForm {
    @Size(min = 4, max = 15, message = "Username must be 4-15 characters")
    private String username;
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    private String confirmPassword;
    @Min(value = 18, message = "Minimum age is 18") @Max(value = 60, message = "Maximum age is 60")
    private Integer age;
    // getters and setters
}

// RegisterController.java
@Controller
public class RegisterController {
    @GetMapping("/register")
    public String form(Model model) {
        model.addAttribute("form", new RegisterForm());
        return "register";
    }
    @PostMapping("/register")
    public String submit(@Valid @ModelAttribute("form") RegisterForm form, BindingResult result, Model model) {
        if (form.getPassword() != null && !form.getPassword().equals(form.getConfirmPassword())) {
            result.rejectValue("confirmPassword", "mismatch", "Passwords do not match");
        }
        if (result.hasErrors()) return "register";
        model.addAttribute("username", form.getUsername());
        return "register-success";
    }
}

<!-- templates/register.html -->
<form th:action="@{/register}" th:object="\${form}" method="post">
  Username <input th:field="*{username}"> <span th:errors="*{username}" style="color:red"></span><br>
  Password <input type="password" th:field="*{password}"> <span th:errors="*{password}" style="color:red"></span><br>
  Confirm  <input type="password" th:field="*{confirmPassword}"> <span th:errors="*{confirmPassword}" style="color:red"></span><br>
  Age <input type="number" th:field="*{age}"> <span th:errors="*{age}" style="color:red"></span><br>
  <button>Register</button>
</form>

<!-- templates/register-success.html -->
<h2 th:text="'Welcome ' + \${username} + ', registration successful!'">Welcome</h2>`,
    },
    {
      task: 'Add pagination to the student list: 5 students per page with Previous / Next links and page numbers.',
      hint: 'Use repo.findAll(PageRequest.of(page, 5)) and pass the Page object to the view. Use #numbers.sequence(0, totalPages-1) for page links.',
      solution: `// StudentController
@GetMapping
public String list(@RequestParam(defaultValue = "0") int page, Model model) {
    Page<Student> p = repo.findAll(PageRequest.of(page, 5, Sort.by("name")));
    model.addAttribute("page", p);
    return "students/list";
}

<!-- list.html -->
<tr th:each="s : \${page.content}">
  <td th:text="\${s.name}">Name</td><td th:text="\${s.marks}">0</td>
</tr>
<div th:if="\${page.totalPages > 1}">
  <a th:if="\${page.hasPrevious()}" th:href="@{/students(page=\${page.number - 1})}">Previous</a>
  <span th:each="i : \${#numbers.sequence(0, page.totalPages - 1)}">
    <a th:if="\${i != page.number}" th:href="@{/students(page=\${i})}" th:text="\${i + 1}">1</a>
    <b th:if="\${i == page.number}" th:text="\${i + 1}">1</b>
  </span>
  <a th:if="\${page.hasNext()}" th:href="@{/students(page=\${page.number + 1})}">Next</a>
</div>`,
    },
    {
      task: 'Create a reusable "alert" fragment that takes a message and a type (success/error) and use it on the list page for the flash message.',
      hint: 'th:fragment="alert(msg, type)" and th:classappend="${type}".',
      solution: `<!-- fragments/layout.html -->
<div th:fragment="alert(msg, type)" class="alert" th:classappend="\${type}" th:text="\${msg}">Message</div>

<!-- students/list.html -->
<div th:if="\${msg}" th:replace="~{fragments/layout :: alert(\${msg}, 'success')}"></div>

/* app.css */
.alert { padding: 8px; border-radius: 4px; margin: 8px 0; }
.alert.success { background: #e6ffed; color: #116329; }
.alert.error   { background: #ffebe9; color: #a40e26; }`,
    },
  ],
  quiz: [
    { question: 'Where must Thymeleaf templates be placed by default in Spring Boot?', options: ['src/main/webapp/WEB-INF/views', 'src/main/resources/templates', 'src/main/resources/static', 'src/main/java/templates'], answer: 1, explanation: 'ThymeleafViewResolver uses prefix classpath:/templates/ and suffix .html. The static folder is for CSS/JS/images served as-is.' },
    { question: 'Which attribute repeats an element for each item in a list?', options: ['th:for', 'th:loop', 'th:each', 'th:repeat'], answer: 2, explanation: 'th:each="s : ${students}" repeats the element once per student.' },
    { question: 'Inside <form th:object="${student}">, which is correct for the name input?', options: ['th:field="*{name}"', 'th:field="${name}"', 'th:field="@{name}"', 'th:value="name"'], answer: 0, explanation: 'th:field needs a selection expression *{...} that refers to the object chosen by th:object.' },
    { question: 'What is the main reason for returning "redirect:/students" after saving?', options: ['It is faster', 'It skips validation', 'Thymeleaf cannot render after POST', 'To avoid duplicate submission when the user refreshes (PRG pattern)'], answer: 3, explanation: 'Post-Redirect-Get makes the browser do a GET, so F5 does not resubmit the POST.' },
    { question: 'Which expression is used to build a link in Thymeleaf?', options: ['${/students}', '@{/students}', '#{/students}', '~{/students}'], answer: 1, explanation: '@{...} is the link expression; it adds the context path and supports path variables and query parameters.' },
  ],
};
