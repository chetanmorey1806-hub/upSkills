export default {
  id: 'day-11-spring-mvc-architecture',
  title: 'Spring MVC Architecture and DispatcherServlet',
  module: 'Module 4: Spring MVC',
  day: 11,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Understand the Model-View-Controller pattern and the Front Controller design of Spring MVC, follow a request through DispatcherServlet, HandlerMapping, Controller, ViewResolver and View, and build your first Spring 6 MVC web app on Tomcat 10.1.`,
  objectives: [
    `Explain MVC and the Front Controller pattern`,
    `Describe the full request flow through DispatcherServlet step by step`,
    `Simulate a mini DispatcherServlet in plain Java`,
    `Configure Spring MVC without web.xml (AbstractAnnotationConfigDispatcherServletInitializer) and with web.xml`,
    `Create, deploy and run a Spring MVC project on Tomcat 10.1 in Eclipse/STS and IntelliJ`,
  ],
  theory: [
    {
      heading: 'MVC pattern',
      content: `MVC splits a web app into three roles. Model: the data (and business objects) to show. View: how data is displayed (JSP, Thymeleaf). Controller: receives the request, calls services, fills the model and chooses the view. Analogy: in a restaurant, the waiter (controller) takes your order, the kitchen (service/model) prepares the food, and the plate presentation (view) is what you see.`,
    },
    {
      heading: 'Front Controller: DispatcherServlet',
      content: `In plain Servlets each URL needs its own servlet. Spring MVC uses ONE servlet, the DispatcherServlet, mapped to "/". It receives every request and dispatches it to the right controller method. Analogy: a hospital reception desk. Every patient goes to reception first; reception checks the symptoms and sends them to the right doctor, then hands them the report.`,
      points: [
        `DispatcherServlet extends HttpServlet (jakarta.servlet.http.HttpServlet in Spring 6)`,
        `It has its own WebApplicationContext with controllers, view resolvers, etc.`,
        `A root ApplicationContext (services, DAOs) can be shared by several DispatcherServlets`,
      ],
    },
    {
      heading: 'Request flow step by step',
      content: `Diagram in words: Browser -> DispatcherServlet -> HandlerMapping -> HandlerAdapter -> Controller -> (Model + view name) -> DispatcherServlet -> ViewResolver -> View (JSP) -> HTML response -> Browser.`,
      points: [
        `1. Browser sends GET /hello?name=Asha; Tomcat passes it to DispatcherServlet`,
        `2. DispatcherServlet asks HandlerMapping (RequestMappingHandlerMapping) which controller method handles /hello`,
        `3. HandlerAdapter (RequestMappingHandlerAdapter) calls that method, converting request params into method arguments`,
        `4. Controller calls services, puts data into Model, returns a logical view name like "hello"`,
        `5. ViewResolver (InternalResourceViewResolver) converts "hello" into /WEB-INF/views/hello.jsp`,
        `6. The View renders HTML using model data; response goes back to the browser`,
        `Interceptors (HandlerInterceptor) can run before/after the controller; exceptions go to HandlerExceptionResolver`,
      ],
    },
    {
      heading: 'Configuration options',
      content: `Spring 6 + Servlet 6 (Tomcat 10.1+). Option A (modern, no web.xml): extend AbstractAnnotationConfigDispatcherServletInitializer, which registers DispatcherServlet automatically via the Servlet container's ServletContainerInitializer. Option B: classic web.xml with <servlet> and <servlet-mapping>. Either way, a @Configuration class with @EnableWebMvc (or XML <mvc:annotation-driven/>) turns on annotation-driven controllers.`,
      syntax: `<packaging>war</packaging>
<dependencies>
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>6.1.14</version>
  </dependency>
  <dependency>
    <groupId>jakarta.servlet</groupId>
    <artifactId>jakarta.servlet-api</artifactId>
    <version>6.0.0</version>
    <scope>provided</scope>
  </dependency>
  <dependency>
    <groupId>org.glassfish.web</groupId>
    <artifactId>jakarta.servlet.jsp.jstl</artifactId>
    <version>3.0.1</version>
  </dependency>
</dependencies>`,
      tip: `Common mistakes: running a Spring 6 app on Tomcat 9 (javax namespace) gives ClassNotFoundException jakarta/servlet/...; use Tomcat 10.1+. Putting JSPs outside WEB-INF lets users open them directly without the controller.`,
    },
    {
      heading: 'Key components summary',
      content: `Remember these names for interviews.`,
      points: [
        `DispatcherServlet: front controller`,
        `HandlerMapping: URL -> handler`,
        `HandlerAdapter: invokes the handler`,
        `Controller: your @Controller class`,
        `ModelAndView / Model: data + view name`,
        `ViewResolver: logical name -> actual view`,
        `View: renders the response (JSP, Thymeleaf, JSON via message converters)`,
        `HandlerExceptionResolver: turns exceptions into error views/responses`,
      ],
    },
    {
      heading: 'Running on Tomcat 10.1 in your IDE',
      content: `Eclipse Enterprise/STS: Window > Preferences > Server > Runtime Environments > Add > Apache Tomcat v10.1 > browse to the Tomcat folder. Then right-click project > Run As > Run on Server. IntelliJ IDEA Ultimate: Run > Edit Configurations > + > Tomcat Server > Local, set Tomcat home, Deployment tab > + > Artifact > spring-mvc:war exploded, Application context "/spring-mvc". IntelliJ Community: install the "Smart Tomcat" plugin, or run mvn package and copy target/spring-mvc.war into tomcat/webapps.`,
    },
  ],
  examples: [
    {
      title: 'Mini DispatcherServlet in plain Java',
      scenario: `We simulate the front controller: a handler mapping (URL -> controller lambda), a Model, and a view resolver that adds prefix/suffix. No server needed; runs in the browser IDE.`,
      steps: [
        'Create Main.java and paste the code',
        'Click Run ▶',
        'Follow each request through mapping, controller, view resolver and render',
      ],
      code: `import java.util.*;

class Model extends LinkedHashMap<String, Object> { }

interface Controller { String handle(Map<String, String> params, Model model); }

class DispatcherServlet {
    private final Map<String, Controller> handlerMapping = new LinkedHashMap<>();
    private final String prefix = "/WEB-INF/views/", suffix = ".jsp";

    void register(String url, Controller c) { handlerMapping.put(url, c); }

    void service(String url, Map<String, String> params) {
        System.out.println("Request: " + url);
        Controller c = handlerMapping.get(url);                   // HandlerMapping
        if (c == null) { System.out.println("404 Not Found"); return; }
        Model model = new Model();
        String viewName = c.handle(params, model);                // HandlerAdapter -> Controller
        System.out.println("ViewResolver -> " + prefix + viewName + suffix);
        System.out.println("Render: " + viewName + " page with " + model);   // View
    }
}

public class Main {
    public static void main(String[] args) {
        DispatcherServlet ds = new DispatcherServlet();
        ds.register("/hello", (p, m) -> {
            m.put("msg", "Hello " + p.getOrDefault("name", "Guest"));
            return "hello";
        });
        ds.register("/products", (p, m) -> {
            m.put("products", List.of("Pen", "Book"));
            return "productList";
        });

        ds.service("/hello", Map.of("name", "Asha"));
        ds.service("/products", Map.of());
        ds.service("/cart", Map.of());
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.*;

class Model extends LinkedHashMap<String, Object> { }

interface Controller { String handle(Map<String, String> params, Model model); }

class DispatcherServlet {
    private final Map<String, Controller> handlerMapping = new LinkedHashMap<>();
    private final String prefix = "/WEB-INF/views/", suffix = ".jsp";

    void register(String url, Controller c) { handlerMapping.put(url, c); }

    void service(String url, Map<String, String> params) {
        System.out.println("Request: " + url);
        Controller c = handlerMapping.get(url);
        if (c == null) { System.out.println("404 Not Found"); return; }
        Model model = new Model();
        String viewName = c.handle(params, model);
        System.out.println("ViewResolver -> " + prefix + viewName + suffix);
        System.out.println("Render: " + viewName + " page with " + model);
    }
}

public class Main {
    public static void main(String[] args) {
        DispatcherServlet ds = new DispatcherServlet();
        ds.register("/hello", (p, m) -> {
            m.put("msg", "Hello " + p.getOrDefault("name", "Guest"));
            return "hello";
        });
        ds.register("/products", (p, m) -> {
            m.put("products", List.of("Pen", "Book"));
            return "productList";
        });

        ds.service("/hello", Map.of("name", "Asha"));
        ds.service("/products", Map.of());
        ds.service("/cart", Map.of());
    }
}`,
        },
      },
      result: `Request: /hello
ViewResolver -> /WEB-INF/views/hello.jsp
Render: hello page with {msg=Hello Asha}
Request: /products
ViewResolver -> /WEB-INF/views/productList.jsp
Render: productList page with {products=[Pen, Book]}
Request: /cart
404 Not Found`,
      explanation: `One entry point handles all URLs. Controllers only fill the model and return a logical view name; the dispatcher resolves and renders it. Unknown URLs produce 404, just like Spring's "No mapping for GET /cart".`,
    },
    {
      title: 'First Spring MVC app (no web.xml)',
      scenario: `Build a real Spring 6 web app with a HelloController and a JSP view.`,
      steps: [
        'Eclipse/STS: File > New > Maven Project > simple project, Packaging = war. IntelliJ: File > New > Project > Maven Archetype > maven-archetype-webapp (or plain Maven and set <packaging>war</packaging>)',
        'Paste the pom.xml below and reload Maven',
        'Create packages com.demo.config and com.demo.controller and the classes',
        'Create src/main/webapp/WEB-INF/views/hello.jsp',
        'Add Tomcat 10.1 (see theory) and run on server; open http://localhost:8080/spring-mvc/hello?name=Asha',
      ],
      code: `<!-- pom.xml -->
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.demo</groupId>
  <artifactId>spring-mvc</artifactId>
  <version>1.0</version>
  <packaging>war</packaging>
  <properties>
    <maven.compiler.release>17</maven.compiler.release>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-webmvc</artifactId>
      <version>6.1.14</version>
    </dependency>
    <dependency>
      <groupId>jakarta.servlet</groupId>
      <artifactId>jakarta.servlet-api</artifactId>
      <version>6.0.0</version>
      <scope>provided</scope>
    </dependency>
    <dependency>
      <groupId>org.glassfish.web</groupId>
      <artifactId>jakarta.servlet.jsp.jstl</artifactId>
      <version>3.0.1</version>
    </dependency>
  </dependencies>
  <build>
    <finalName>spring-mvc</finalName>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-war-plugin</artifactId>
        <version>3.4.0</version>
      </plugin>
    </plugins>
  </build>
</project>

// com/demo/config/WebConfig.java
package com.demo.config;
import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
@EnableWebMvc
@ComponentScan("com.demo.controller")
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.jsp("/WEB-INF/views/", ".jsp");      // InternalResourceViewResolver
    }
}

// com/demo/config/AppInitializer.java  (replaces web.xml)
package com.demo.config;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

public class AppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {
    protected Class<?>[] getRootConfigClasses() { return null; }               // services/DAOs later
    protected Class<?>[] getServletConfigClasses() { return new Class<?>[] { WebConfig.class }; }
    protected String[] getServletMappings() { return new String[] { "/" }; }
}

// com/demo/controller/HelloController.java
package com.demo.controller;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class HelloController {
    @GetMapping("/hello")
    public String hello(@RequestParam(defaultValue = "Guest") String name, Model model) {
        model.addAttribute("msg", "Hello " + name + ", from Spring MVC!");
        return "hello";                                       // logical view name
    }
}

<%-- src/main/webapp/WEB-INF/views/hello.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<body>
  <h2>\${msg}</h2>
</body>
</html>`,
      result: `Browser at http://localhost:8080/spring-mvc/hello?name=Asha shows a heading:
Hello Asha, from Spring MVC!`,
      explanation: `Tomcat finds AppInitializer through Spring's SpringServletContainerInitializer, which registers DispatcherServlet on "/". The request flows exactly as in our simulation: mapping -> HelloController.hello -> "hello" -> /WEB-INF/views/hello.jsp.`,
    },
    {
      title: 'Same setup with classic web.xml',
      scenario: `Many existing projects still use web.xml with an XML Spring config.`,
      steps: [
        'Create src/main/webapp/WEB-INF/web.xml',
        'Create src/main/webapp/WEB-INF/dispatcher-servlet.xml',
        'Delete AppInitializer (only one approach should register the servlet) and redeploy',
      ],
      code: `<!-- WEB-INF/web.xml (Servlet 6.0) -->
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee https://jakarta.ee/xml/ns/jakartaee/web-app_6_0.xsd"
         version="6.0">
  <servlet>
    <servlet-name>dispatcher</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <load-on-startup>1</load-on-startup>
  </servlet>
  <servlet-mapping>
    <servlet-name>dispatcher</servlet-name>
    <url-pattern>/</url-pattern>
  </servlet-mapping>
</web-app>

<!-- WEB-INF/dispatcher-servlet.xml (default name = servlet-name + "-servlet.xml") -->
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans https://www.springframework.org/schema/beans/spring-beans.xsd
         http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd
         http://www.springframework.org/schema/mvc https://www.springframework.org/schema/mvc/spring-mvc.xsd">
  <context:component-scan base-package="com.demo.controller"/>
  <mvc:annotation-driven/>
  <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
    <property name="prefix" value="/WEB-INF/views/"/>
    <property name="suffix" value=".jsp"/>
  </bean>
</beans>`,
      result: `Same page: Hello Asha, from Spring MVC!`,
      explanation: `DispatcherServlet loads WEB-INF/<servlet-name>-servlet.xml by default; override with an <init-param> contextConfigLocation. load-on-startup 1 creates the context when Tomcat starts instead of on the first request.`,
    },
  ],
  interview: [
    { q: 'What is Spring MVC?', a: 'Spring\'s web framework built on the Servlet API that implements MVC using a front controller (DispatcherServlet) and annotation-based controllers.', level: 'Easy' },
    { q: 'What is DispatcherServlet?', a: 'The front controller servlet that receives all requests and coordinates HandlerMapping, HandlerAdapter, controllers, ViewResolver and views.', level: 'Easy' },
    { q: 'Explain the Spring MVC request flow.', a: 'Request -> DispatcherServlet -> HandlerMapping finds handler -> HandlerAdapter invokes controller -> controller returns model + view name -> ViewResolver resolves view -> view renders -> response.', level: 'Medium' },
    { q: 'What is a ViewResolver?', a: 'A strategy that maps a logical view name to an actual View; InternalResourceViewResolver adds prefix/suffix to locate JSPs.', level: 'Easy' },
    { q: 'What does @EnableWebMvc do?', a: 'Imports Spring MVC configuration (RequestMappingHandlerMapping, HandlerAdapter, message converters, validation) like <mvc:annotation-driven/>.', level: 'Medium' },
    { q: 'Root WebApplicationContext vs servlet WebApplicationContext?', a: 'Root context holds shared beans (services, DAOs, DataSource) loaded by ContextLoaderListener/getRootConfigClasses; servlet context holds web beans (controllers, view resolvers) and is a child of the root.', level: 'Hard' },
    { q: 'How do you configure Spring MVC without web.xml?', a: 'Extend AbstractAnnotationConfigDispatcherServletInitializer (or implement WebApplicationInitializer); Servlet 3.0+ containers detect it via SpringServletContainerInitializer.', level: 'Medium' },
    { q: 'Why place JSPs in WEB-INF?', a: 'Files under WEB-INF cannot be requested directly by the browser, forcing access through controllers.', level: 'Easy' },
    { q: 'Which Tomcat version supports Spring 6?', a: 'Tomcat 10.1+ (Servlet 6.0, jakarta namespace). Tomcat 9 uses javax and is not compatible.', level: 'Medium' },
    { q: 'What are HandlerInterceptors?', a: 'Components with preHandle, postHandle and afterCompletion callbacks around controller execution, used for logging, auth checks, locale etc.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Plain Java: add an interceptor list to the mini DispatcherServlet that prints "preHandle <url>" before the controller and "afterCompletion <url>" after rendering.',
      hint: 'Call them inside service() around the controller call.',
      solution: `// inside DispatcherServlet.service, after the 404 check:
System.out.println("preHandle " + url);
Model model = new Model();
String viewName = c.handle(params, model);
System.out.println("ViewResolver -> " + prefix + viewName + suffix);
System.out.println("Render: " + viewName + " page with " + model);
System.out.println("afterCompletion " + url);`,
    },
    {
      task: 'Add an /about mapping to HelloController that returns a view "about" showing "Company: TechCorp" from the model.',
      hint: 'Create about.jsp in WEB-INF/views.',
      solution: `@GetMapping("/about")
public String about(Model model) {
    model.addAttribute("company", "TechCorp");
    return "about";
}

<%-- about.jsp --%>
<html><body><h3>Company: \${company}</h3></body></html>`,
    },
    {
      task: 'Return ModelAndView instead of String + Model for /time and display the server time.',
      hint: 'new ModelAndView("time", "now", LocalDateTime.now())',
      solution: `@GetMapping("/time")
public ModelAndView time() {
    ModelAndView mv = new ModelAndView("time");
    mv.addObject("now", java.time.LocalDateTime.now());
    return mv;
}`,
    },
    {
      task: 'Write a HandlerInterceptor that logs request URI and time taken, and register it in WebConfig.',
      hint: 'Override addInterceptors(InterceptorRegistry).',
      solution: `public class TimeInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object h) {
        req.setAttribute("start", System.currentTimeMillis());
        return true;
    }
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res, Object h, Exception ex) {
        long start = (Long) req.getAttribute("start");
        System.out.println(req.getRequestURI() + " took " + (System.currentTimeMillis() - start) + " ms");
    }
}
// WebConfig
@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new TimeInterceptor());
}`,
    },
  ],
  quiz: [
    { question: 'Which design pattern does DispatcherServlet implement?', options: ['Singleton', 'Front Controller', 'Decorator', 'Prototype'], answer: 1, explanation: 'One controller servlet handles all requests.' },
    { question: 'Which component finds the controller method for a URL?', options: ['ViewResolver', 'HandlerAdapter', 'HandlerMapping', 'MessageConverter'], answer: 2, explanation: 'HandlerMapping maps requests to handlers.' },
    { question: 'Controller returns "home"; prefix /WEB-INF/views/, suffix .jsp. The view is...', options: ['/WEB-INF/views/home.jsp', '/home', 'home.html', '/views/home'], answer: 0, explanation: 'prefix + name + suffix.' },
    { question: 'Servlet API package used by Spring 6?', options: ['javax.servlet', 'java.servlet', 'org.servlet', 'jakarta.servlet'], answer: 3, explanation: 'Spring 6 requires Jakarta Servlet 6.' },
    { question: 'Scope of jakarta.servlet-api dependency in a WAR?', options: ['compile', 'provided', 'runtime', 'test'], answer: 1, explanation: 'Tomcat provides it at runtime.' },
  ],
};
