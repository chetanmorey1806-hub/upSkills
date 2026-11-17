export default {
  id: 'day-15-spring-project-interview',
  title: 'Spring Project and Interview Questions',
  module: 'Module 5: Project',
  day: 15,
  level: 'Advanced',
  duration: '4 hours',
  summary: `Bring together everything from the Spring course in a Student Management web application (Spring MVC + Hibernate/JPA + validation + AOP logging + declarative transactions + global exception handling), then revise with 25 frequently asked Spring interview questions.`,
  objectives: [
    `Design a layered Spring 6 application (Controller -> Service -> DAO -> MySQL)`,
    `Configure root and web contexts, JPA, transactions, AOP and validation together`,
    `Implement CRUD with forms, validation, redirects and global error pages`,
    `Run a plain-Java version of the same architecture to understand the wiring`,
    `Answer the most common Spring Core, AOP, Data and MVC interview questions confidently`,
  ],
  theory: [
    {
      heading: 'Project overview: Student Management System',
      content: `Features: list students, register a new student (form with validation), view details, edit, delete, duplicate email check, friendly 404 page, and execution-time logging of all service methods via AOP. Tech: Spring 6.1 (webmvc, orm, aspects), Hibernate 6.5 via JPA, Hibernate Validator 8, MySQL 8, HikariCP, JSP + JSTL 3, Tomcat 10.1, Java 17, Maven.`,
      points: [
        `Module 1 (Core): DI with constructor injection, Java config, component scanning`,
        `Module 2 (AOP): @Aspect with @Around for timing`,
        `Module 3 (Data): JPA EntityManager DAO + @Transactional service`,
        `Module 4 (MVC): DispatcherServlet, controllers, forms, validation, @ControllerAdvice`,
      ],
    },
    {
      heading: 'Package structure',
      content: `Organise by layer so every developer knows where things live.`,
      syntax: `student-mgmt/
 ├─ pom.xml
 └─ src/main/
    ├─ java/com/sms/
    │   ├─ config/      AppInitializer, RootConfig, WebConfig
    │   ├─ entity/      Student
    │   ├─ dao/         StudentDao
    │   ├─ service/     StudentService
    │   ├─ controller/  StudentController, GlobalExceptionHandler
    │   ├─ aspect/      TimingAspect
    │   └─ exception/   StudentNotFoundException, DuplicateEmailException
    └─ webapp/WEB-INF/views/
        list.jsp, form.jsp, error.jsp`,
    },
    {
      heading: 'Request flow in the finished app',
      content: `Diagram in words: Browser POST /students -> DispatcherServlet -> StudentController.save(@Valid Student, BindingResult) -> (errors? back to form.jsp) -> StudentService proxy [TimingAspect @Around -> TransactionInterceptor begin] -> StudentService.register -> StudentDao.save (EntityManager.persist) -> commit -> redirect:/students -> GET /students -> list.jsp.`,
      tip: `Notice how one service bean is wrapped by TWO proxies' worth of advice (transaction + timing). Both are AOP; the order can be controlled with @Order and @EnableTransactionManagement(order = ...).`,
    },
    {
      heading: 'Build and run checklist',
      content: `Follow these steps in order; most "it doesn't work" problems come from skipping one.`,
      points: [
        `MySQL running; CREATE DATABASE sms; user/password match RootConfig`,
        `Java 17+, Maven reload successful (no red pom.xml)`,
        `Tomcat 10.1 configured (NOT Tomcat 9)`,
        `Eclipse/STS: right-click project > Run As > Run on Server > Tomcat v10.1`,
        `IntelliJ Ultimate: Run > Edit Configurations > + Tomcat Server > Local > Deployment: student-mgmt:war exploded, context /sms; Community: Smart Tomcat plugin or mvn package and copy the WAR to tomcat/webapps`,
        `Open http://localhost:8080/sms/students`,
      ],
    },
    {
      heading: 'How to explain this project in an interview',
      content: `Use the STAR format: "I built a Student Management System using Spring MVC and Hibernate. I used a layered architecture with constructor injection, JPA with a HikariCP pool, declarative transactions at the service layer, Bean Validation on forms, a @ControllerAdvice for consistent error pages and an AOP aspect to log slow service methods. A challenge was LazyInitializationException in JSPs, which I solved by fetching data in the transactional service." Be ready to draw the request flow and the bean lifecycle.`,
    },
  ],
  examples: [
    {
      title: 'Whole architecture in plain Java (manual DI composition root)',
      scenario: `A console version of the project: repository, service with business rules, controller returning HTTP-like responses, custom exceptions, and an AppContext that wires everything like Spring does. Runs in the browser IDE.`,
      steps: [
        'Create Main.java and paste the code',
        'Click Run ▶',
        'Map each class to its Spring equivalent: AppContext = ApplicationContext, @Repository, @Service, @Controller, @ControllerAdvice (the catch blocks)',
      ],
      code: `import java.util.*;

record Student(int id, String name, String email) { }

interface StudentRepository {
    Student save(Student s);
    Optional<Student> findById(int id);
    List<Student> findAll();
    boolean existsByEmail(String email);
}

class InMemoryStudentRepository implements StudentRepository {        // @Repository
    private final Map<Integer, Student> data = new TreeMap<>();
    private int seq = 0;
    public Student save(Student s) {
        Student saved = new Student(++seq, s.name(), s.email());       // like IDENTITY id generation
        data.put(saved.id(), saved);
        return saved;
    }
    public Optional<Student> findById(int id) { return Optional.ofNullable(data.get(id)); }
    public List<Student> findAll() { return new ArrayList<>(data.values()); }
    public boolean existsByEmail(String email) {
        return data.values().stream().anyMatch(s -> s.email().equalsIgnoreCase(email));
    }
}

class DuplicateEmailException extends RuntimeException {
    DuplicateEmailException(String email) { super("Email already registered: " + email); }
}
class NotFoundException extends RuntimeException {
    NotFoundException(int id) { super("Student " + id + " not found"); }
}

class StudentService {                                                  // @Service @Transactional
    private final StudentRepository repo;
    StudentService(StudentRepository repo) { this.repo = repo; }
    Student register(String name, String email) {
        if (repo.existsByEmail(email)) throw new DuplicateEmailException(email);
        return repo.save(new Student(0, name, email));
    }
    Student get(int id) { return repo.findById(id).orElseThrow(() -> new NotFoundException(id)); }
    List<Student> all() { return repo.findAll(); }
}

class StudentController {                                               // @Controller
    private final StudentService service;
    StudentController(StudentService service) { this.service = service; }

    String handle(String method, String path, Map<String, String> params) {
        try {
            if (method.equals("POST") && path.equals("/students")) {
                return "201 Created " + service.register(params.get("name"), params.get("email"));
            }
            if (method.equals("GET") && path.equals("/students")) {
                return "200 OK " + service.all();
            }
            if (method.equals("GET") && path.startsWith("/students/")) {
                int id = Integer.parseInt(path.substring("/students/".length()));
                return "200 OK " + service.get(id);
            }
            return "404 No mapping for " + method + " " + path;
        } catch (NotFoundException e) {                                // @ExceptionHandler
            return "404 " + e.getMessage();
        } catch (DuplicateEmailException e) {
            return "409 " + e.getMessage();
        }
    }
}

class AppContext {                                                      // what Spring does at startup
    private final Map<Class<?>, Object> beans = new LinkedHashMap<>();
    AppContext() {
        StudentRepository repo = new InMemoryStudentRepository();
        StudentService service = new StudentService(repo);
        StudentController controller = new StudentController(service);
        beans.put(StudentRepository.class, repo);
        beans.put(StudentService.class, service);
        beans.put(StudentController.class, controller);
        System.out.println("Context started with beans: " + beans.size());
    }
    <T> T getBean(Class<T> type) { return type.cast(beans.get(type)); }
}

public class Main {
    public static void main(String[] args) {
        AppContext ctx = new AppContext();
        StudentController c = ctx.getBean(StudentController.class);

        System.out.println(c.handle("POST", "/students", Map.of("name", "Asha", "email", "asha@mail.com")));
        System.out.println(c.handle("POST", "/students", Map.of("name", "Ravi", "email", "ravi@mail.com")));
        System.out.println(c.handle("POST", "/students", Map.of("name", "Asha2", "email", "ASHA@mail.com")));
        System.out.println(c.handle("GET", "/students", Map.of()));
        System.out.println(c.handle("GET", "/students/2", Map.of()));
        System.out.println(c.handle("GET", "/students/7", Map.of()));
        System.out.println(c.handle("DELETE", "/students/1", Map.of()));
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.*;

record Student(int id, String name, String email) { }

interface StudentRepository {
    Student save(Student s);
    Optional<Student> findById(int id);
    List<Student> findAll();
    boolean existsByEmail(String email);
}

class InMemoryStudentRepository implements StudentRepository {
    private final Map<Integer, Student> data = new TreeMap<>();
    private int seq = 0;
    public Student save(Student s) {
        Student saved = new Student(++seq, s.name(), s.email());
        data.put(saved.id(), saved);
        return saved;
    }
    public Optional<Student> findById(int id) { return Optional.ofNullable(data.get(id)); }
    public List<Student> findAll() { return new ArrayList<>(data.values()); }
    public boolean existsByEmail(String email) {
        return data.values().stream().anyMatch(s -> s.email().equalsIgnoreCase(email));
    }
}

class DuplicateEmailException extends RuntimeException {
    DuplicateEmailException(String email) { super("Email already registered: " + email); }
}
class NotFoundException extends RuntimeException {
    NotFoundException(int id) { super("Student " + id + " not found"); }
}

class StudentService {
    private final StudentRepository repo;
    StudentService(StudentRepository repo) { this.repo = repo; }
    Student register(String name, String email) {
        if (repo.existsByEmail(email)) throw new DuplicateEmailException(email);
        return repo.save(new Student(0, name, email));
    }
    Student get(int id) { return repo.findById(id).orElseThrow(() -> new NotFoundException(id)); }
    List<Student> all() { return repo.findAll(); }
}

class StudentController {
    private final StudentService service;
    StudentController(StudentService service) { this.service = service; }

    String handle(String method, String path, Map<String, String> params) {
        try {
            if (method.equals("POST") && path.equals("/students")) {
                return "201 Created " + service.register(params.get("name"), params.get("email"));
            }
            if (method.equals("GET") && path.equals("/students")) {
                return "200 OK " + service.all();
            }
            if (method.equals("GET") && path.startsWith("/students/")) {
                int id = Integer.parseInt(path.substring("/students/".length()));
                return "200 OK " + service.get(id);
            }
            return "404 No mapping for " + method + " " + path;
        } catch (NotFoundException e) {
            return "404 " + e.getMessage();
        } catch (DuplicateEmailException e) {
            return "409 " + e.getMessage();
        }
    }
}

class AppContext {
    private final Map<Class<?>, Object> beans = new LinkedHashMap<>();
    AppContext() {
        StudentRepository repo = new InMemoryStudentRepository();
        StudentService service = new StudentService(repo);
        StudentController controller = new StudentController(service);
        beans.put(StudentRepository.class, repo);
        beans.put(StudentService.class, service);
        beans.put(StudentController.class, controller);
        System.out.println("Context started with beans: " + beans.size());
    }
    <T> T getBean(Class<T> type) { return type.cast(beans.get(type)); }
}

public class Main {
    public static void main(String[] args) {
        AppContext ctx = new AppContext();
        StudentController c = ctx.getBean(StudentController.class);

        System.out.println(c.handle("POST", "/students", Map.of("name", "Asha", "email", "asha@mail.com")));
        System.out.println(c.handle("POST", "/students", Map.of("name", "Ravi", "email", "ravi@mail.com")));
        System.out.println(c.handle("POST", "/students", Map.of("name", "Asha2", "email", "ASHA@mail.com")));
        System.out.println(c.handle("GET", "/students", Map.of()));
        System.out.println(c.handle("GET", "/students/2", Map.of()));
        System.out.println(c.handle("GET", "/students/7", Map.of()));
        System.out.println(c.handle("DELETE", "/students/1", Map.of()));
    }
}`,
        },
      },
      result: `Context started with beans: 3
201 Created Student[id=1, name=Asha, email=asha@mail.com]
201 Created Student[id=2, name=Ravi, email=ravi@mail.com]
409 Email already registered: ASHA@mail.com
200 OK [Student[id=1, name=Asha, email=asha@mail.com], Student[id=2, name=Ravi, email=ravi@mail.com]]
200 OK Student[id=2, name=Ravi, email=ravi@mail.com]
404 Student 7 not found
404 No mapping for DELETE /students/1`,
      explanation: `The email check is case-insensitive, so ASHA@mail.com is a duplicate (409 Conflict). Every dependency is passed through constructors from one place (AppContext). In the Spring version below, the container builds this graph from annotations, and the catch blocks move into @ControllerAdvice.`,
    },
    {
      title: 'Project setup: pom.xml and configuration classes',
      scenario: `Create the Maven WAR project and the three configuration classes.`,
      steps: [
        'Eclipse/STS: File > New > Maven Project > simple project, Group com.sms, Artifact student-mgmt, Packaging war. IntelliJ: File > New > Project > Maven Archetype > maven-archetype-webapp, JDK 17',
        'Replace pom.xml with the one below and reload Maven',
        'Create database: CREATE DATABASE sms;',
        'Create AppInitializer, RootConfig, WebConfig in com.sms.config',
      ],
      code: `<!-- pom.xml -->
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.sms</groupId>
  <artifactId>student-mgmt</artifactId>
  <version>1.0</version>
  <packaging>war</packaging>
  <properties>
    <maven.compiler.release>17</maven.compiler.release>
    <maven.compiler.parameters>true</maven.compiler.parameters>
    <spring.version>6.1.14</spring.version>
  </properties>
  <dependencies>
    <dependency><groupId>org.springframework</groupId><artifactId>spring-webmvc</artifactId><version>\${spring.version}</version></dependency>
    <dependency><groupId>org.springframework</groupId><artifactId>spring-orm</artifactId><version>\${spring.version}</version></dependency>
    <dependency><groupId>org.springframework</groupId><artifactId>spring-aspects</artifactId><version>\${spring.version}</version></dependency>
    <dependency><groupId>org.hibernate.orm</groupId><artifactId>hibernate-core</artifactId><version>6.5.3.Final</version></dependency>
    <dependency><groupId>org.hibernate.validator</groupId><artifactId>hibernate-validator</artifactId><version>8.0.1.Final</version></dependency>
    <dependency><groupId>com.mysql</groupId><artifactId>mysql-connector-j</artifactId><version>8.4.0</version></dependency>
    <dependency><groupId>com.zaxxer</groupId><artifactId>HikariCP</artifactId><version>5.1.0</version></dependency>
    <dependency><groupId>org.glassfish.web</groupId><artifactId>jakarta.servlet.jsp.jstl</artifactId><version>3.0.1</version></dependency>
    <dependency><groupId>jakarta.servlet</groupId><artifactId>jakarta.servlet-api</artifactId><version>6.0.0</version><scope>provided</scope></dependency>
  </dependencies>
  <build>
    <finalName>sms</finalName>
    <plugins>
      <plugin><groupId>org.apache.maven.plugins</groupId><artifactId>maven-war-plugin</artifactId><version>3.4.0</version></plugin>
    </plugins>
  </build>
</project>

// config/AppInitializer.java
package com.sms.config;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;
public class AppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {
    protected Class<?>[] getRootConfigClasses() { return new Class<?>[] { RootConfig.class }; }
    protected Class<?>[] getServletConfigClasses() { return new Class<?>[] { WebConfig.class }; }
    protected String[] getServletMappings() { return new String[] { "/" }; }
}

// config/RootConfig.java  (services, DAOs, JPA, transactions, AOP)
package com.sms.config;
import java.util.Properties;
import javax.sql.DataSource;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.context.annotation.*;
import org.springframework.orm.jpa.*;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@ComponentScan({"com.sms.service", "com.sms.dao", "com.sms.aspect"})
@EnableTransactionManagement
@EnableAspectJAutoProxy
public class RootConfig {
    @Bean
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl("jdbc:mysql://localhost:3306/sms");
        ds.setUsername("root");
        ds.setPassword("root");
        return ds;
    }
    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource ds) {
        var emf = new LocalContainerEntityManagerFactoryBean();
        emf.setDataSource(ds);
        emf.setPackagesToScan("com.sms.entity");
        emf.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        Properties p = new Properties();
        p.put("hibernate.hbm2ddl.auto", "update");
        p.put("hibernate.show_sql", "true");
        emf.setJpaProperties(p);
        return emf;
    }
    @Bean
    public JpaTransactionManager transactionManager(EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }
}

// config/WebConfig.java  (controllers, views)
package com.sms.config;
import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
@EnableWebMvc
@ComponentScan("com.sms.controller")
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.jsp("/WEB-INF/views/", ".jsp");
    }
}`,
      result: `Maven builds target/sms.war; deploying it to Tomcat 10.1 starts both contexts and Hibernate creates the student table (visible in the console as "create table student ..." because show_sql is on).`,
      explanation: `\${spring.version} inside pom.xml is a Maven property (not JavaScript). The root context holds the data layer; the web context holds only controllers, keeping concerns separated.`,
    },
    {
      title: 'Entity, DAO, service, aspect and exceptions',
      scenario: `The backend layers of the project.`,
      steps: [
        'Create the classes in their packages (Eclipse: New > Class, IntelliJ: New > Java Class)',
        'Generate getters/setters for Student (Eclipse: Source > Generate; IntelliJ: Alt+Insert)',
        'Build the project to confirm there are no compile errors (Eclipse: Project > Build; IntelliJ: Build > Build Project)',
      ],
      code: `// entity/Student.java
package com.sms.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "student")
public class Student {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 50, message = "Name must be 3-50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Course is required")
    private String course;

    // no-arg constructor + getters and setters
}

// exception/StudentNotFoundException.java
package com.sms.exception;
public class StudentNotFoundException extends RuntimeException {
    public StudentNotFoundException(int id) { super("Student " + id + " not found"); }
}
// exception/DuplicateEmailException.java
package com.sms.exception;
public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String email) { super("Email already registered: " + email); }
}

// dao/StudentDao.java
package com.sms.dao;
import java.util.*;
import com.sms.entity.Student;
import jakarta.persistence.*;
import org.springframework.stereotype.Repository;

@Repository
public class StudentDao {
    @PersistenceContext
    private EntityManager em;

    public void save(Student s) { if (s.getId() == null) em.persist(s); else em.merge(s); }
    public Optional<Student> findById(int id) { return Optional.ofNullable(em.find(Student.class, id)); }
    public List<Student> findAll() { return em.createQuery("from Student order by id", Student.class).getResultList(); }
    public boolean existsByEmail(String email, Integer excludeId) {
        return em.createQuery("from Student where lower(email) = :e", Student.class)
                 .setParameter("e", email.toLowerCase())
                 .getResultList().stream()
                 .anyMatch(s -> !s.getId().equals(excludeId));       // ignore the record being edited
    }
    public void delete(Student s) { em.remove(s); }
}

// service/StudentService.java
package com.sms.service;
import java.util.List;
import com.sms.dao.StudentDao;
import com.sms.entity.Student;
import com.sms.exception.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StudentService {
    private final StudentDao dao;
    public StudentService(StudentDao dao) { this.dao = dao; }

    public void save(Student s) {
        if (dao.existsByEmail(s.getEmail(), s.getId())) throw new DuplicateEmailException(s.getEmail());
        dao.save(s);
    }
    @Transactional(readOnly = true)
    public Student get(int id) { return dao.findById(id).orElseThrow(() -> new StudentNotFoundException(id)); }
    @Transactional(readOnly = true)
    public List<Student> all() { return dao.findAll(); }
    public void delete(int id) { dao.delete(get(id)); }
}

// aspect/TimingAspect.java
package com.sms.aspect;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class TimingAspect {
    @Around("execution(* com.sms.service.*.*(..))")
    public Object time(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        try {
            return pjp.proceed();
        } finally {
            System.out.println("[TIMING] " + pjp.getSignature().toShortString() + " " + (System.currentTimeMillis() - start) + " ms");
        }
    }
}`,
      result: `Project compiles. At runtime each service call prints a line like "[TIMING] StudentService.all() 12 ms" in the Tomcat console (the number varies).`,
      explanation: `The same Student class is both the JPA entity and the form-backing object to keep the project small; in larger projects use a separate DTO. existsByEmail excludes the student being edited so updating your own record does not trigger a false duplicate.`,
    },
    {
      title: 'Controller, global exception handler and JSP views',
      scenario: `The web layer: list, add, edit, delete with validation and friendly errors.`,
      steps: [
        'Create StudentController and GlobalExceptionHandler in com.sms.controller',
        'Create list.jsp, form.jsp and error.jsp in src/main/webapp/WEB-INF/views',
        'Run on Tomcat 10.1 (Eclipse: Run As > Run on Server; IntelliJ: Tomcat run configuration) and open http://localhost:8080/sms/students',
        'Test: add a valid student, submit an empty form, add a duplicate email, open /sms/students/999',
      ],
      code: `// controller/StudentController.java
package com.sms.controller;
import com.sms.entity.Student;
import com.sms.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/students")
public class StudentController {
    private final StudentService service;
    public StudentController(StudentService service) { this.service = service; }

    @ModelAttribute("courses")
    public java.util.List<String> courses() { return java.util.List.of("Java", "Spring", "React"); }

    @GetMapping
    public String list(Model model) { model.addAttribute("students", service.all()); return "list"; }

    @GetMapping("/new")
    public String create(Model model) { model.addAttribute("student", new Student()); return "form"; }

    @GetMapping("/{id}/edit")
    public String edit(@PathVariable int id, Model model) { model.addAttribute("student", service.get(id)); return "form"; }

    @PostMapping
    public String save(@Valid @ModelAttribute("student") Student student, BindingResult result, RedirectAttributes ra) {
        if (result.hasErrors()) return "form";
        service.save(student);
        ra.addFlashAttribute("msg", "Saved " + student.getName());
        return "redirect:/students";
    }

    @PostMapping("/{id}/delete")
    public String delete(@PathVariable int id, RedirectAttributes ra) {
        service.delete(id);
        ra.addFlashAttribute("msg", "Deleted student " + id);
        return "redirect:/students";
    }
}

// controller/GlobalExceptionHandler.java
package com.sms.controller;
import com.sms.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(StudentNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String notFound(StudentNotFoundException ex, Model m) { m.addAttribute("error", ex.getMessage()); return "error"; }

    @ExceptionHandler(DuplicateEmailException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public String duplicate(DuplicateEmailException ex, Model m) { m.addAttribute("error", ex.getMessage()); return "error"; }
}

<%-- list.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<html><body>
<h2>Students</h2>
<p style="color:green">\${msg}</p>
<a href="\${pageContext.request.contextPath}/students/new">+ Add Student</a>
<table border="1" cellpadding="5">
  <tr><th>Id</th><th>Name</th><th>Email</th><th>Course</th><th>Actions</th></tr>
  <c:forEach var="s" items="\${students}">
    <tr>
      <td>\${s.id}</td><td>\${s.name}</td><td>\${s.email}</td><td>\${s.course}</td>
      <td>
        <a href="\${pageContext.request.contextPath}/students/\${s.id}/edit">Edit</a>
        <form method="post" action="\${pageContext.request.contextPath}/students/\${s.id}/delete" style="display:inline">
          <button onclick="return confirm('Delete?')">Delete</button>
        </form>
      </td>
    </tr>
  </c:forEach>
</table>
</body></html>

<%-- form.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<html><head><style>.err{color:red}</style></head><body>
<h2>Student Form</h2>
<form:form modelAttribute="student" action="\${pageContext.request.contextPath}/students" method="post">
  <form:hidden path="id"/>
  Name:   <form:input path="name"/>  <form:errors path="name" cssClass="err"/><br/>
  Email:  <form:input path="email"/> <form:errors path="email" cssClass="err"/><br/>
  Course: <form:select path="course">
            <form:option value="" label="--select--"/>
            <form:options items="\${courses}"/>
          </form:select> <form:errors path="course" cssClass="err"/><br/>
  <button type="submit">Save</button>
</form:form>
</body></html>

<%-- error.jsp --%>
<html><body><h2 style="color:red">\${error}</h2><a href="\${pageContext.request.contextPath}/students">Back to list</a></body></html>`,
      result: `/sms/students              -> empty table + "Add Student" link
Save Asha / asha@mail.com / Java -> redirect, green "Saved Asha", row 1 in table
Save with empty fields      -> form redisplayed with red messages (Name is required, Email is required, Course is required)
Save another with asha@mail.com -> HTTP 409 page "Email already registered: asha@mail.com"
/sms/students/999/edit      -> HTTP 404 page "Student 999 not found"
Console                     -> [TIMING] StudentService.save(..) 25 ms (values vary)`,
      explanation: `Every Spring concept from the course appears: DI (constructor injection everywhere), Java config, scopes (all singletons), AOP (timing + transactions), JPA via Spring ORM, MVC with forms, validation and @ControllerAdvice. Delete uses POST (not a GET link) so search engines or prefetching cannot delete data.`,
    },
  ],
  interview: [
    { q: 'What is Spring and what are its main features?', a: 'A lightweight Java framework centred on an IoC container. Features: DI, AOP, transaction management, JDBC/ORM integration, MVC web framework, testing support, and a large ecosystem (Boot, Security, Data).', level: 'Easy' },
    { q: 'Explain IoC and DI with an example.', a: 'IoC: the container controls object creation and wiring. DI: dependencies are provided from outside. Example: OrderService receives a PaymentGateway via its constructor; Spring decides whether it is a Razorpay or Stripe implementation.', level: 'Easy' },
    { q: 'BeanFactory vs ApplicationContext?', a: 'BeanFactory: basic, lazy. ApplicationContext: extends BeanFactory with eager singletons, automatic post-processors, events, i18n, resource loading and profiles.', level: 'Medium' },
    { q: 'What are the types of dependency injection, and which is recommended?', a: 'Constructor, setter and field injection. Constructor injection is recommended for mandatory dependencies (immutability, testability, fail-fast).', level: 'Easy' },
    { q: 'What are the ways to configure Spring?', a: 'XML, annotation-based (@Component + scanning + @Autowired) and Java-based (@Configuration + @Bean). Modern projects mainly use annotations + Java config.', level: 'Easy' },
    { q: '@Component vs @Bean?', a: '@Component is class-level and auto-detected by scanning; @Bean is method-level in a @Configuration class and suits third-party classes or custom creation logic.', level: 'Medium' },
    { q: 'How does Spring resolve @Autowired with multiple candidates?', a: 'By type, then @Qualifier, then @Primary, then matching parameter/field name to bean name; otherwise NoUniqueBeanDefinitionException.', level: 'Medium' },
    { q: 'Explain bean scopes.', a: 'singleton (default, one per container), prototype (new per request), and web scopes request, session, application, websocket.', level: 'Easy' },
    { q: 'Describe the bean lifecycle.', a: 'Instantiate -> inject -> Aware callbacks -> BeanPostProcessor before -> @PostConstruct -> afterPropertiesSet -> init-method -> BeanPostProcessor after (proxies) -> use -> @PreDestroy -> destroy() -> destroy-method.', level: 'Hard' },
    { q: 'How do you inject a prototype bean into a singleton?', a: 'ObjectProvider/ObjectFactory, @Lookup method injection, or a scoped proxy; plain injection gives the same instance forever.', level: 'Hard' },
    { q: 'What is AOP and what are its key terms?', a: 'Aspect-Oriented Programming separates cross-cutting concerns. Terms: aspect, advice, join point, pointcut, target, proxy, weaving.', level: 'Easy' },
    { q: 'What advice types does Spring AOP support?', a: '@Before, @AfterReturning, @AfterThrowing, @After and @Around.', level: 'Easy' },
    { q: 'JDK dynamic proxy vs CGLIB?', a: 'JDK proxies implement interfaces; CGLIB subclasses the class. Spring uses JDK when interfaces exist (unless proxyTargetClass=true), CGLIB otherwise; final classes/methods cannot be CGLIB-proxied.', level: 'Medium' },
    { q: 'Why does @Transactional or AOP not work on self-invocation?', a: 'Internal calls use this, not the proxy, so the interceptor never runs. Move the method to another bean or call through the proxy.', level: 'Hard' },
    { q: 'What is JdbcTemplate and what problem does it solve?', a: 'A Spring JDBC helper that removes boilerplate (connections, statements, result sets, closing, checked exceptions) using the template-callback pattern.', level: 'Easy' },
    { q: 'What is DataAccessException?', a: 'Spring\'s unchecked, technology-neutral data access exception hierarchy into which JDBC/Hibernate/JPA exceptions are translated.', level: 'Medium' },
    { q: 'What is the default rollback rule of @Transactional?', a: 'Rollback on unchecked exceptions (RuntimeException, Error); commit on checked exceptions unless rollbackFor is configured.', level: 'Medium' },
    { q: 'Explain propagation REQUIRED, REQUIRES_NEW and NESTED.', a: 'REQUIRED joins or creates a transaction; REQUIRES_NEW always creates a new one and suspends the outer; NESTED uses a savepoint inside the outer transaction.', level: 'Hard' },
    { q: 'What are isolation levels?', a: 'READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE (plus DEFAULT); they progressively prevent dirty, non-repeatable and phantom reads.', level: 'Medium' },
    { q: 'Explain the Spring MVC request flow.', a: 'DispatcherServlet receives the request -> HandlerMapping finds the controller -> HandlerAdapter invokes it -> controller returns model + view name -> ViewResolver finds the view -> view renders the response.', level: 'Medium' },
    { q: '@Controller vs @RestController?', a: '@RestController combines @Controller and @ResponseBody, so methods return data (JSON) rather than view names.', level: 'Easy' },
    { q: '@RequestParam vs @PathVariable vs @RequestBody?', a: '@RequestParam: query/form parameters. @PathVariable: URL template parts. @RequestBody: the whole request body (JSON) converted to an object.', level: 'Medium' },
    { q: 'How do you validate form input in Spring MVC?', a: 'Add Jakarta Bean Validation annotations on the model, use @Valid on the @ModelAttribute parameter, and check BindingResult placed right after it.', level: 'Medium' },
    { q: 'How do you handle exceptions globally?', a: '@ControllerAdvice (or @RestControllerAdvice) with @ExceptionHandler methods, optionally with @ResponseStatus or ResponseEntity/ProblemDetail.', level: 'Easy' },
    { q: 'How do you integrate Hibernate with Spring?', a: 'Use spring-orm: define DataSource, LocalSessionFactoryBean (or LocalContainerEntityManagerFactoryBean), a HibernateTransactionManager/JpaTransactionManager, enable transactions, and inject SessionFactory/EntityManager into @Repository DAOs.', level: 'Medium' },
    { q: 'What changed in Spring 6 compared to Spring 5?', a: 'Java 17 baseline, Jakarta EE 9+ (jakarta.* namespace), Servlet 6/Tomcat 10.1, AOT and GraalVM native support, ProblemDetail, HTTP interface clients, Micrometer observability.', level: 'Medium' },
    { q: 'Spring vs Spring Boot?', a: 'Spring provides the core framework with manual configuration. Spring Boot adds auto-configuration, starters, embedded servers, externalised config and Actuator on top of Spring.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Plain Java: add a delete operation to the console project: DELETE /students/{id} returns "204 No Content" or "404 Student <id> not found".',
      hint: 'Add deleteById to the repository and service; add a branch in handle().',
      solution: `// repository
public boolean deleteById(int id) { return data.remove(id) != null; }   // add to interface too
// service
void delete(int id) { if (!repo.deleteById(id)) throw new NotFoundException(id); }
// controller (before the final 404 return)
if (method.equals("DELETE") && path.startsWith("/students/")) {
    int id = Integer.parseInt(path.substring("/students/".length()));
    service.delete(id);
    return "204 No Content";
}
// handle("DELETE", "/students/1", Map.of()) -> 204 No Content
// handle("DELETE", "/students/1", Map.of()) -> 404 Student 1 not found`,
    },
    {
      task: 'Add a search box to list.jsp: GET /students?q=as filters by name (case-insensitive) using a JPQL LIKE query.',
      hint: '@RequestParam(required = false) String q in list().',
      solution: `// StudentDao
public List<Student> search(String q) {
    return em.createQuery("from Student where lower(name) like :q order by id", Student.class)
             .setParameter("q", "%" + q.toLowerCase() + "%").getResultList();
}
// StudentService
@Transactional(readOnly = true)
public List<Student> search(String q) { return (q == null || q.isBlank()) ? dao.findAll() : dao.search(q); }
// StudentController
@GetMapping
public String list(@RequestParam(required = false) String q, Model model) {
    model.addAttribute("students", service.search(q));
    model.addAttribute("q", q);
    return "list";
}
<%-- list.jsp --%>
<form method="get"><input name="q" value="\${q}"/><button>Search</button></form>`,
    },
    {
      task: 'Add pagination: /students?page=0&size=5 using setFirstResult/setMaxResults.',
      hint: 'firstResult = page * size.',
      solution: `public List<Student> page(int page, int size) {
    return em.createQuery("from Student order by id", Student.class)
             .setFirstResult(page * size)
             .setMaxResults(size)
             .getResultList();
}
public long count() { return em.createQuery("select count(s) from Student s", Long.class).getSingleResult(); }`,
    },
    {
      task: 'Write an AuditAspect that prints "AUDIT: <method> by system" after every successful save or delete in StudentService.',
      hint: '@AfterReturning with pointcut matching save(..) || delete(..).',
      solution: `@Aspect
@Component
public class AuditAspect {
    @AfterReturning("execution(* com.sms.service.StudentService.save(..)) || execution(* com.sms.service.StudentService.delete(..))")
    public void audit(JoinPoint jp) {
        System.out.println("AUDIT: " + jp.getSignature().getName() + " by system");
    }
}`,
    },
    {
      task: 'Expose a JSON API GET /api/students returning all students (add jackson-databind 2.17.2).',
      hint: 'A separate @RestController in com.sms.controller.',
      solution: `@RestController
@RequestMapping("/api/students")
public class StudentApiController {
    private final StudentService service;
    public StudentApiController(StudentService service) { this.service = service; }
    @GetMapping
    public List<Student> all() { return service.all(); }
    @GetMapping("/{id}")
    public Student one(@PathVariable int id) { return service.get(id); }
}`,
    },
  ],
  quiz: [
    { question: 'In the project, where should @Transactional be placed?', options: ['Controller', 'JSP', 'Service layer', 'Entity class'], answer: 2, explanation: 'One business operation per service method = one transaction.' },
    { question: 'Which config class holds controllers and the ViewResolver?', options: ['WebConfig (servlet context)', 'RootConfig', 'AppInitializer', 'pom.xml'], answer: 0, explanation: 'Web beans live in the DispatcherServlet context.' },
    { question: 'Which HTTP status does the project return for a duplicate email?', options: ['404', '500', '400', '409'], answer: 3, explanation: 'GlobalExceptionHandler maps DuplicateEmailException to CONFLICT (409).' },
    { question: 'Why is delete implemented with POST instead of a GET link?', options: ['GET is slower', 'GET requests should be safe; crawlers or prefetch could delete data', 'JSP cannot create links', 'Spring does not support GET'], answer: 1, explanation: 'State-changing operations must not use GET.' },
    { question: 'Which component logs execution time of service methods?', options: ['TimingAspect with @Around', 'HandlerInterceptor', 'BindingResult', 'ViewResolver'], answer: 0, explanation: 'An @Around advice measures before and after proceed().' },
  ],
};
