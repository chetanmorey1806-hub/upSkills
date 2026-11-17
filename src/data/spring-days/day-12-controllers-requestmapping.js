export default {
  id: 'day-12-controllers-requestmapping',
  title: 'Controllers: @Controller, @RequestMapping, @RequestParam, @PathVariable, Model, Views',
  module: 'Module 4: Spring MVC',
  day: 12,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Write real Spring MVC controllers: map URLs and HTTP methods with @RequestMapping and its shortcuts, read query parameters with @RequestParam and URL segments with @PathVariable, pass data to JSP views with Model, and use redirect, forward and @ResponseBody.`,
  objectives: [
    `Use @Controller with class-level and method-level @RequestMapping`,
    `Use @GetMapping, @PostMapping, @PutMapping, @DeleteMapping`,
    `Read request data with @RequestParam (required, defaultValue) and @PathVariable`,
    `Pass data to JSP with Model/ModelAndView and display lists with JSTL`,
    `Return redirects, forwards and JSON with @ResponseBody`,
  ],
  theory: [
    {
      heading: '@Controller and @RequestMapping',
      content: `@Controller marks a class as a web controller (it is also a @Component, so it is scanned). @RequestMapping maps URLs to methods. On the class it sets a common prefix; on methods it adds the rest. You can also restrict by HTTP method, params, headers, consumes and produces. Analogy: the class-level mapping is the building address ("/students"), the method mapping is the room number ("/{id}").`,
      syntax: `@Controller
@RequestMapping("/students")
public class StudentController {
    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public String list(Model model) { ... }

    @GetMapping("/{id}")            // shortcut for @RequestMapping(method = GET)
    public String one(@PathVariable int id, Model model) { ... }

    @PostMapping("/save")
    public String save(...) { ... }
}`,
      points: [
        `@GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping are shortcuts`,
        `HTML forms support only GET and POST; PUT/DELETE are mostly used in REST APIs`,
        `Two methods with the same URL and HTTP method = "Ambiguous mapping" error at startup`,
      ],
    },
    {
      heading: '@RequestParam: query string and form fields',
      content: `For /search?q=java&page=2, @RequestParam String q reads "java". Spring converts types automatically (int page). By default the parameter is REQUIRED; a missing one gives 400 Bad Request. Use required = false (value becomes null) or defaultValue = "1". If the Java variable name differs, give the name: @RequestParam("q") String keyword.`,
      syntax: `@GetMapping("/search")
public String search(@RequestParam("q") String keyword,
                     @RequestParam(defaultValue = "1") int page,
                     @RequestParam(required = false) String sort,
                     Model model) { ... }`,
    },
    {
      heading: '@PathVariable: values inside the URL path',
      content: `For /students/42, a template "/students/{id}" captures 42. Use path variables to identify a resource (which student) and request params for options (filters, sorting, paging). Analogy: path = house number, params = instructions to the delivery person ("leave at door").`,
      syntax: `@GetMapping("/courses/{course}/students/{roll}")
public String byCourse(@PathVariable String course, @PathVariable("roll") int rollNo) { ... }`,
      tip: `Spring 6.1 no longer infers names from bytecode debug info; parameter names are taken from the -parameters compiler flag. Maven with maven-compiler-plugin 3.11+ and <maven.compiler.parameters>true</maven.compiler.parameters> (or explicit names like @PathVariable("id")) avoids "Name for argument not specified" errors.`,
    },
    {
      heading: 'Model, ModelMap, ModelAndView and views',
      content: `Model is a map of attributes that the view can read (\${name} in JSP). Return a String view name, or a ModelAndView holding both. Special view names: "redirect:/students" sends a 302 redirect (browser makes a new GET; use after POST to avoid double submit, the Post-Redirect-Get pattern); "forward:/other" forwards on the server. RedirectAttributes.addFlashAttribute passes a one-time message across a redirect.`,
    },
    {
      heading: 'Other useful parameters and annotations',
      content: `Controller methods can receive many things directly.`,
      points: [
        `HttpServletRequest, HttpServletResponse, HttpSession (jakarta.servlet.http)`,
        `@RequestHeader("User-Agent") String agent`,
        `@CookieValue(value = "theme", defaultValue = "light") String theme`,
        `@ModelAttribute Student student: binds form fields to an object (Day 13)`,
        `@ResponseBody: return value is written directly to the response (JSON via Jackson) instead of a view`,
        `@RestController = @Controller + @ResponseBody on every method (Spring Boot REST course)`,
      ],
    },
    {
      heading: 'JSTL in Jakarta EE 10',
      content: `To loop over lists in JSP use JSTL 3.0. The taglib URI changed to jakarta.tags.core (old http://java.sun.com/jsp/jstl/core still works in some containers but use the new one).`,
      syntax: `<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:forEach var="s" items="\${students}">
    <li>\${s.name}</li>
</c:forEach>`,
    },
  ],
  examples: [
    {
      title: 'How Spring matches path variables and request params (plain Java)',
      scenario: `We write a small matcher that understands URL templates like /students/{id} and query strings like ?view=full, then "calls" the right handler. This is what RequestMappingHandlerMapping and argument resolvers do. Runs in the browser IDE.`,
      steps: [
        'Create Main.java and paste the code',
        'Click Run ▶',
        'Try adding your own URL in main',
      ],
      code: `import java.util.*;

public class Main {
    // "/students/{id}" vs "/students/42"  ->  {id=42}
    static Map<String, String> matchPath(String template, String path) {
        String[] t = template.split("/");
        String[] p = path.split("/");
        if (t.length != p.length) return null;
        Map<String, String> vars = new LinkedHashMap<>();
        for (int i = 0; i < t.length; i++) {
            if (t[i].startsWith("{") && t[i].endsWith("}")) vars.put(t[i].substring(1, t[i].length() - 1), p[i]);
            else if (!t[i].equals(p[i])) return null;
        }
        return vars;
    }

    // "q=spring&page=2" -> {q=spring, page=2}
    static Map<String, String> parseQuery(String query) {
        Map<String, String> m = new LinkedHashMap<>();
        if (query.isEmpty()) return m;
        for (String pair : query.split("&")) {
            String[] kv = pair.split("=", 2);
            m.put(kv[0], kv.length > 1 ? kv[1] : "");
        }
        return m;
    }

    static void handle(String url) {
        String[] parts = url.split("\\\\?", 2);
        String path = parts[0];
        Map<String, String> params = parseQuery(parts.length > 1 ? parts[1] : "");
        Map<String, String> vars;
        if ((vars = matchPath("/students/{id}", path)) != null) {
            int id = Integer.parseInt(vars.get("id"));                 // @PathVariable int id
            String view = params.getOrDefault("view", "summary");      // @RequestParam(defaultValue="summary")
            System.out.println("getStudent(id=" + id + ", view=" + view + ")");
        } else if ((vars = matchPath("/courses/{course}/students/{roll}", path)) != null) {
            System.out.println("getCourseStudent(course=" + vars.get("course") + ", roll=" + vars.get("roll") + ")");
        } else if (matchPath("/search", path) != null) {
            System.out.println("search(q=" + params.get("q") + ", page=" + params.getOrDefault("page", "1") + ")");
        } else {
            System.out.println("404 for " + path);
        }
    }

    public static void main(String[] args) {
        handle("/students/42?view=full");
        handle("/students/7");
        handle("/courses/java/students/15");
        handle("/search?q=spring&page=2");
        handle("/teachers/1");
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.*;

public class Main {
    static Map<String, String> matchPath(String template, String path) {
        String[] t = template.split("/");
        String[] p = path.split("/");
        if (t.length != p.length) return null;
        Map<String, String> vars = new LinkedHashMap<>();
        for (int i = 0; i < t.length; i++) {
            if (t[i].startsWith("{") && t[i].endsWith("}")) vars.put(t[i].substring(1, t[i].length() - 1), p[i]);
            else if (!t[i].equals(p[i])) return null;
        }
        return vars;
    }

    static Map<String, String> parseQuery(String query) {
        Map<String, String> m = new LinkedHashMap<>();
        if (query.isEmpty()) return m;
        for (String pair : query.split("&")) {
            String[] kv = pair.split("=", 2);
            m.put(kv[0], kv.length > 1 ? kv[1] : "");
        }
        return m;
    }

    static void handle(String url) {
        String[] parts = url.split("\\\\?", 2);
        String path = parts[0];
        Map<String, String> params = parseQuery(parts.length > 1 ? parts[1] : "");
        Map<String, String> vars;
        if ((vars = matchPath("/students/{id}", path)) != null) {
            int id = Integer.parseInt(vars.get("id"));
            String view = params.getOrDefault("view", "summary");
            System.out.println("getStudent(id=" + id + ", view=" + view + ")");
        } else if ((vars = matchPath("/courses/{course}/students/{roll}", path)) != null) {
            System.out.println("getCourseStudent(course=" + vars.get("course") + ", roll=" + vars.get("roll") + ")");
        } else if (matchPath("/search", path) != null) {
            System.out.println("search(q=" + params.get("q") + ", page=" + params.getOrDefault("page", "1") + ")");
        } else {
            System.out.println("404 for " + path);
        }
    }

    public static void main(String[] args) {
        handle("/students/42?view=full");
        handle("/students/7");
        handle("/courses/java/students/15");
        handle("/search?q=spring&page=2");
        handle("/teachers/1");
    }
}`,
        },
      },
      result: `getStudent(id=42, view=full)
getStudent(id=7, view=summary)
getCourseStudent(course=java, roll=15)
search(q=spring, page=2)
404 for /teachers/1`,
      explanation: `Path segments in {braces} become variables; the query string becomes a parameter map; defaults fill in missing params. Spring adds type conversion (the int conversion here), required checks (400 errors) and many more patterns (wildcards, regex).`,
    },
    {
      title: 'StudentController with list, details and search',
      scenario: `An in-memory student list displayed with JSP + JSTL.`,
      steps: [
        'Use the Day 11 project (spring-webmvc 6.1.14, Tomcat 10.1, JSTL 3.0.1)',
        'Add <maven.compiler.parameters>true</maven.compiler.parameters> to pom.xml properties',
        'Create record com.demo.model.Student and com.demo.controller.StudentController',
        'Create students.jsp and student.jsp in src/main/webapp/WEB-INF/views',
        'Run on Tomcat and open /spring-mvc/students, /spring-mvc/students/2, /spring-mvc/students/search?name=a',
      ],
      code: `// Student.java
package com.demo.model;
public record Student(int id, String name, String course) { }

// StudentController.java
package com.demo.controller;
import java.util.*;
import com.demo.model.Student;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/students")
public class StudentController {
    private final List<Student> students = List.of(
        new Student(1, "Asha", "Java"),
        new Student(2, "Ravi", "Spring"),
        new Student(3, "Meera", "Java"));

    @GetMapping
    public String list(Model model) {
        model.addAttribute("students", students);
        return "students";
    }

    @GetMapping("/{id}")
    public String one(@PathVariable int id, Model model) {
        Student s = students.stream().filter(x -> x.id() == id).findFirst().orElse(null);
        model.addAttribute("student", s);
        return "student";
    }

    @GetMapping("/search")
    public String search(@RequestParam String name,
                         @RequestParam(defaultValue = "") String course,
                         Model model) {
        List<Student> found = students.stream()
            .filter(s -> s.name().toLowerCase().contains(name.toLowerCase()))
            .filter(s -> course.isEmpty() || s.course().equalsIgnoreCase(course))
            .toList();
        model.addAttribute("students", found);
        return "students";
    }
}

<%-- WEB-INF/views/students.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<html><body>
<h2>Students (\${students.size()})</h2>
<ul>
  <c:forEach var="s" items="\${students}">
    <li><a href="\${pageContext.request.contextPath}/students/\${s.id()}">\${s.name()}</a> - \${s.course()}</li>
  </c:forEach>
</ul>
</body></html>

<%-- WEB-INF/views/student.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<html><body>
<c:choose>
  <c:when test="\${student != null}"><h2>\${student.name()} studies \${student.course()}</h2></c:when>
  <c:otherwise><h2>Student not found</h2></c:otherwise>
</c:choose>
</body></html>`,
      result: `/students            -> Students (3): Asha - Java, Ravi - Spring, Meera - Java
/students/2          -> Ravi studies Spring
/students/9          -> Student not found
/students/search?name=a -> Students (3): Asha, Ravi, Meera (all contain "a")
/students/search?name=a&course=java -> Students (2): Asha, Meera
/students/search     -> HTTP 400 Bad Request (required parameter 'name' missing)`,
      explanation: `GET /students/search matches the literal "/search" mapping, which is more specific than "/{id}". Records are accessed in EL with method calls like s.name() (EL 4.0+ in Tomcat 10.1 supports method calls). Missing required @RequestParam gives 400.`,
    },
    {
      title: 'POST, redirect and flash attributes (Post-Redirect-Get)',
      scenario: `A small form adds a feedback message and redirects back to a page that shows a one-time success message.`,
      steps: [
        'Create FeedbackController in com.demo.controller',
        'Create feedback.jsp with a form posting to /feedback',
        'Submit the form, then press F5 and notice the form is NOT resubmitted',
      ],
      code: `@Controller
public class FeedbackController {
    private final List<String> messages = new java.util.concurrent.CopyOnWriteArrayList<>();

    @GetMapping("/feedback")
    public String form(Model model) {
        model.addAttribute("messages", messages);
        return "feedback";
    }

    @PostMapping("/feedback")
    public String submit(@RequestParam String text, RedirectAttributes ra) {
        messages.add(text);
        ra.addFlashAttribute("info", "Thanks! Feedback saved.");
        return "redirect:/feedback";               // 302 -> browser does GET /feedback
    }
}

<%-- feedback.jsp --%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<html><body>
  <p style="color:green">\${info}</p>
  <form method="post" action="\${pageContext.request.contextPath}/feedback">
    <input name="text"/> <button>Send</button>
  </form>
  <c:forEach var="m" items="\${messages}"><div>\${m}</div></c:forEach>
</body></html>`,
      result: `After submitting "Great course": page shows "Thanks! Feedback saved." and the list item "Great course". Refreshing the page shows the list but the green message disappears (flash attributes live for one request) and no duplicate is added.`,
      explanation: `Redirect after POST prevents double submission. Flash attributes are stored in the session temporarily and removed after the redirected request reads them. A thread-safe list is used because the controller is a shared singleton.`,
    },
    {
      title: 'Returning JSON with @ResponseBody',
      scenario: `Expose the student list as JSON for JavaScript clients.`,
      steps: [
        'Add jackson-databind 2.17.2 to pom.xml (com.fasterxml.jackson.core:jackson-databind) and reload Maven',
        'Add the method below to StudentController',
        'Open /spring-mvc/students/api in the browser or Postman',
      ],
      code: `<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>2.17.2</version>
</dependency>

@GetMapping(value = "/api", produces = "application/json")
@ResponseBody
public List<Student> api() {
    return students;
}`,
      result: `[{"id":1,"name":"Asha","course":"Java"},{"id":2,"name":"Ravi","course":"Spring"},{"id":3,"name":"Meera","course":"Java"}]`,
      explanation: `@EnableWebMvc registers MappingJackson2HttpMessageConverter automatically when Jackson is on the classpath, and the record is serialised to JSON. No view resolver is involved.`,
    },
  ],
  interview: [
    { q: 'What is the difference between @Controller and @RestController?', a: '@Controller methods return view names by default; @RestController = @Controller + @ResponseBody, so return values are written as JSON/XML to the response body.', level: 'Easy' },
    { q: '@RequestParam vs @PathVariable?', a: '@RequestParam reads query string or form parameters (?page=2); @PathVariable reads values from the URL path template (/students/{id}).', level: 'Easy' },
    { q: 'What happens when a required @RequestParam is missing?', a: 'Spring throws MissingServletRequestParameterException and responds 400 Bad Request.', level: 'Medium' },
    { q: 'How do you make a request parameter optional?', a: 'required = false, defaultValue = "...", or use Optional<T> as the parameter type.', level: 'Easy' },
    { q: 'What is @RequestMapping used for at class level?', a: 'Defines a common base path (and optionally method/produces) shared by all handler methods in the controller.', level: 'Easy' },
    { q: 'Model vs ModelAndView?', a: 'Model is a method parameter you add attributes to and you return a view name; ModelAndView bundles both model and view in one returned object.', level: 'Medium' },
    { q: 'What is redirect: vs forward:?', a: 'redirect: sends HTTP 302 so the browser makes a new request (URL changes, request attributes lost). forward: is server-side within the same request (URL unchanged).', level: 'Medium' },
    { q: 'What is the Post-Redirect-Get pattern?', a: 'After processing a POST, redirect to a GET page so refreshing does not resubmit the form.', level: 'Medium' },
    { q: 'What are flash attributes?', a: 'Attributes saved temporarily (in session) before a redirect and made available to the next request only, via RedirectAttributes.addFlashAttribute.', level: 'Medium' },
    { q: 'How does Spring convert "42" in the URL to int?', a: 'Through its ConversionService/WebDataBinder type conversion; failures produce 400 (MethodArgumentTypeMismatchException).', level: 'Hard' },
    { q: 'Are controllers thread-safe?', a: 'They are singletons shared across requests, so they must not hold per-request mutable state in fields.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Plain Java: extend the matcher so "/products/{id}/reviews" is handled and prints "reviews(productId=<id>, sort=<sort or latest>)". Test with /products/5/reviews?sort=rating.',
      hint: 'Add one more else-if with matchPath.',
      solution: `} else if ((vars = matchPath("/products/{id}/reviews", path)) != null) {
    System.out.println("reviews(productId=" + vars.get("id") + ", sort=" + params.getOrDefault("sort", "latest") + ")");
}
// handle("/products/5/reviews?sort=rating")  ->  reviews(productId=5, sort=rating)`,
    },
    {
      task: 'Create a CalculatorController: GET /calc/add?a=5&b=7 shows "Result: 12" on a JSP.',
      hint: 'Two int @RequestParams.',
      solution: `@Controller
public class CalculatorController {
    @GetMapping("/calc/add")
    public String add(@RequestParam int a, @RequestParam int b, Model model) {
        model.addAttribute("result", a + b);
        return "calc";
    }
}
<%-- calc.jsp --%>
<html><body><h2>Result: \${result}</h2></body></html>`,
    },
    {
      task: 'Create GET /orders/{orderId}/items/{itemNo} that shows both values; use explicit names in @PathVariable.',
      hint: '@PathVariable("orderId") long id',
      solution: `@GetMapping("/orders/{orderId}/items/{itemNo}")
public String item(@PathVariable("orderId") long id, @PathVariable("itemNo") int no, Model model) {
    model.addAttribute("text", "Order " + id + ", item " + no);
    return "item";
}`,
    },
    {
      task: 'Read the User-Agent header and a "theme" cookie (default light) and display them.',
      hint: '@RequestHeader and @CookieValue.',
      solution: `@GetMapping("/info")
public String info(@RequestHeader("User-Agent") String agent,
                   @CookieValue(value = "theme", defaultValue = "light") String theme,
                   Model model) {
    model.addAttribute("agent", agent);
    model.addAttribute("theme", theme);
    return "info";
}`,
    },
  ],
  quiz: [
    { question: 'Which annotation reads /users/{id}?', options: ['@RequestParam', '@PathVariable', '@RequestBody', '@ModelAttribute'], answer: 1, explanation: 'Path template variables use @PathVariable.' },
    { question: 'Return value "redirect:/home" causes...', options: ['Server-side forward', 'HTTP 404', 'HTTP 302 redirect', 'JSON output'], answer: 2, explanation: 'redirect: prefix sends a redirect to the browser.' },
    { question: '@GetMapping is equivalent to...', options: ['@RequestMapping(method = RequestMethod.GET)', '@RequestMapping(params = "get")', '@GetParam', '@ResponseBody'], answer: 0, explanation: 'It is a composed annotation.' },
    { question: 'Missing required request parameter results in HTTP...', options: ['200', '404', '500', '400'], answer: 3, explanation: 'Bad Request.' },
    { question: 'Which annotation writes the return value directly as response body?', options: ['@ModelAttribute', '@ResponseBody', '@RequestMapping', '@SessionAttributes'], answer: 1, explanation: 'Message converters (Jackson) serialise it.' },
  ],
};
