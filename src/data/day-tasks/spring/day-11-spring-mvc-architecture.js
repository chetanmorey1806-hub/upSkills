export default {
  lesson: 'day-11-spring-mvc-architecture',
  minutes: 18,
  intro: 'Follow a request through DispatcherServlet, HandlerMapping, Controller, ViewResolver and View in a Spring 6 MVC app.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In Spring MVC, which component is the **Front Controller** that receives every request?',
      options: ['ViewResolver', 'DispatcherServlet', 'HandlerMapping', 'The JSP page'],
      answer: 1,
      explain: '`DispatcherServlet` is one servlet (usually mapped to `/`) that receives all requests and delegates: HandlerMapping finds the controller method, the controller returns a view name and model, the ViewResolver finds the view, and the view renders the response.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the correct **request flow**?',
      options: [
        'Browser → Controller → DispatcherServlet → JSP',
        'Browser → DispatcherServlet → HandlerMapping → Controller → ViewResolver → View → Browser',
        'Browser → ViewResolver → Controller → DispatcherServlet → View',
        'Browser → HandlerMapping → JSP → Controller',
      ],
      answer: 1,
      explain: 'DispatcherServlet first asks HandlerMapping which `@RequestMapping` method fits the URL, calls it (via a HandlerAdapter), receives a logical view name such as "students", asks the ViewResolver for the real view and lets it render with the model data.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The ViewResolver is configured like this. Controller methods return the view names `"students"` and `"admin/dashboard"`. Which JSP paths are used? (one per line)',
      example: { title: 'how a view name is resolved', text: 'Real path = **prefix** + view name + **suffix**. With prefix `/views/` and suffix `.html`, the name `home` → `/views/home.html`.' },
      code: `@Bean
public ViewResolver viewResolver() {
    InternalResourceViewResolver r = new InternalResourceViewResolver();
    r.setPrefix("/WEB-INF/views/");
    r.setSuffix(".jsp");
    return r;
}`,
      expected: '/WEB-INF/views/students.jsp\n/WEB-INF/views/admin/dashboard.jsp',
      explain: 'The controller returns only a **logical** name, so it does not depend on JSP or the folder layout. A slash in the name becomes a sub-folder. Keeping JSPs under WEB-INF stops users from opening them directly.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the annotation that enables Spring MVC features (annotated controllers, message converters, validation) in a Java config class:\n```\n@Configuration\n____\n@ComponentScan("com.upskillr.controller")\npublic class WebConfig implements WebMvcConfigurer { }\n```',
      example: { title: 'adding static resources', code: '@Override\npublic void addResourceHandlers(ResourceHandlerRegistry reg) {\n    reg.addResourceHandler("/css/**").addResourceLocations("/css/");\n}' },
      accept: ['@EnableWebMvc'],
      caseSensitive: true,
      explain: '`@EnableWebMvc` imports Spring MVC\'s default configuration (the XML equivalent is `<mvc:annotation-driven/>`). Implementing `WebMvcConfigurer` lets you customise it, e.g. view resolvers and static resources.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match components to their jobs. Which are CORRECT? (choose all that apply)',
      options: [
        'HandlerMapping: finds which controller method handles a URL',
        'Controller: processes input, calls services, fills the Model and returns a view name',
        'ViewResolver: turns a logical view name into a View object',
        'Model: carries data from the controller to the view',
        'ViewResolver: connects to the database',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Database work belongs to the service/DAO layer, never to MVC infrastructure. Each component has one job, which makes the framework easy to extend: swap JSP for Thymeleaf by changing only the ViewResolver.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In a no-web.xml setup you extend `AbstractAnnotationConfigDispatcherServletInitializer`. What should `getServletMappings()` usually return?',
      options: ['new String[] { "/*" }', 'new String[] { "/" }', 'new String[] { "*.jsp" }', 'null'],
      answer: 1,
      explain: '`"/"` makes DispatcherServlet the **default** servlet, while Tomcat\'s JSP servlet still handles `*.jsp` forwards. Mapping `/*` would also capture the internal JSP forwards and cause 404s or loops.',
    },
  ],
};
