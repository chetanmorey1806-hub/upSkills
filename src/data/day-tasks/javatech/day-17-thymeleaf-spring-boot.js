export default {
  lesson: 'day-17-thymeleaf-spring-boot',
  minutes: 24,
  intro: 'Render pages with Thymeleaf: pass model data, loop and branch with th:* attributes, bind forms and handle validation.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A controller method returns `"students/list"` to render `templates/students/list.html`. Which class annotation must the controller have?',
      options: ['@RestController', '@Controller', '@Repository', '@ThymeleafController'],
      answer: 1,
      explain: 'With **@Controller** the returned String is a **view name**, resolved to `src/main/resources/templates/students/list.html`. A `@RestController` would send the text "students/list" as the response body.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line that passes the list of students to the template under the name `students`:\n```\n@GetMapping("/students")\npublic String list(Model model) {\n    ???\n    return "students/list";\n}\n```',
      example: { title: 'using it in the template', code: '<tr th:each="s : ${students}">' },
      accept: ['model.addAttribute("students", service.findAll());', 'model.addAttribute("students", service.findAll())', 'model.addAttribute("students", studentService.findAll());', 'model.addAttribute("students", repo.findAll());', 'model.addAttribute("students", studentRepository.findAll());'],
      explain: '`model.addAttribute(name, value)` makes data available to the template as `${students}`. A typo in the name means the loop renders nothing (no error), so keep names consistent.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The model contains `students` = Asha (82), Ravi (67), Meera (91). Type the **visible text** of the rendered page: the text of each `<li>` on its own line (single spaces between parts), then the paragraph text.',
      example: { title: 'iteration status', text: 'th:each="s, stat : ${list}" gives stat.index (0-based), stat.count (1-based), stat.first, stat.last ...' },
      code: `<ul>
  <li th:each="s, stat : \${students}">
    <span th:text="\${stat.count} + '. ' + \${s.name}">Name</span>
    <b th:if="\${s.marks >= 75}">Distinction</b>
  </li>
</ul>
<p th:unless="\${students.isEmpty()}"
   th:text="'Total: ' + \${#lists.size(students)}">0</p>`,
      expected: '1. Asha Distinction\n2. Ravi\n3. Meera Distinction\nTotal: 3',
      explain: '`th:text` replaces the placeholder text ("Name", "0"). `stat.count` starts at 1. `th:if` removes the `<b>` for Ravi (67 < 75). `th:unless` shows the paragraph because the list is not empty. The placeholders let designers open the HTML file directly in a browser (natural templates).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'The form uses `th:object="${student}"`. Complete the input so it is bound to the `name` property (id, name and value are filled automatically):\n```\n<input type="text" th:field="???">\n```',
      example: { title: 'showing the field error', code: '<span th:if="${#fields.hasErrors(\'name\')}" th:errors="*{name}"></span>' },
      accept: ['*{name}'],
      caseSensitive: true,
      explain: '`*{...}` is a **selection expression**: it is evaluated on the `th:object` (student), so `*{name}` = `${student.name}`. `th:field` sets id, name and value, and keeps the typed value when the form is shown again with errors.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The form is POSTed twice: first with an empty name (fails `@NotBlank`), then with valid data. What does the method return each time? (two lines)',
      example: { title: 'Post/Redirect/Get', text: 'After a successful POST, redirect so refreshing the page does not submit the form again.' },
      code: `@PostMapping("/students")
public String save(@Valid @ModelAttribute("student") Student student,
                   BindingResult result) {
    if (result.hasErrors()) {
        return "students/form";
    }
    service.save(student);
    return "redirect:/students";
}`,
      expected: 'students/form\nredirect:/students',
      explain: 'With errors the same form view is rendered again, showing messages via `th:errors`. `BindingResult` must come **directly after** the validated parameter, or Spring throws instead. On success `redirect:` sends the browser to GET /students (Post/Redirect/Get).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'th:fragment defines a reusable piece (e.g. a navbar) and th:replace / th:insert includes it',
        '@{/students/{id}(id=${s.id})} builds a link URL with the context path',
        'Thymeleaf needs Node.js to run',
        'Server-side rendering sends ready HTML, which is good for SEO and simple admin screens',
      ],
      answers: [0, 1, 3],
      explain: 'Fragments avoid copy-pasting headers/footers; `@{...}` link expressions handle the context path and path variables. Thymeleaf runs inside the Spring Boot JVM - no Node.js. SSR suits SEO and simple CRUD UIs; React suits highly interactive apps.',
    },
  ],
};
