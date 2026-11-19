export default {
  lesson: 'day-12-controllers-requestmapping',
  minutes: 25,
  intro: 'Write controllers with @RequestMapping and its shortcuts, read @RequestParam and @PathVariable values, and pass data to views with Model.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the shortcut annotation for `@RequestMapping(value = "/students", method = RequestMethod.GET)`:\n```\n____("/students")\npublic String list(Model model) { ... }\n```',
      example: { title: 'other shortcuts', code: '@PostMapping("/students")\n@PutMapping("/students/{id}")\n@DeleteMapping("/students/{id}")' },
      accept: ['@GetMapping'],
      caseSensitive: true,
      explain: '`@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping` and `@PatchMapping` are composed annotations for `@RequestMapping(method = ...)`. A `@RequestMapping("/students")` on the class adds a common prefix to all methods.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'The URL is `/students/7`. Complete the annotation that binds `7` to `id`:\n```\n@GetMapping("/students/{id}")\npublic String show(____ int id, Model model) { ... }\n```',
      example: { title: 'query string instead', code: '// /students?id=7\npublic String show(@RequestParam int id) { ... }' },
      accept: ['@PathVariable', '@PathVariable("id")', '@PathVariable(name = "id")', '@PathVariable(value = "id")'],
      caseSensitive: true,
      explain: '`@PathVariable` reads a `{placeholder}` from the URL path (`/students/7`), while `@RequestParam` reads query-string or form values (`/students?id=7`). If the names differ, write `@PathVariable("id") int studentId`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The browser sends these requests in order:\n1. `/students/search?course=Java&page=2`\n2. `/students/search?course=MySQL`\n3. `/students/7`\n\nWhat is printed on the server console?',
      example: { title: 'optional parameters', code: '@RequestParam(defaultValue = "10") int size        // missing → 10\n@RequestParam(required = false) String city      // missing → null' },
      code: `@Controller
@RequestMapping("/students")
public class StudentController {

    @GetMapping("/search")
    public String search(@RequestParam String course,
                         @RequestParam(defaultValue = "1") int page) {
        System.out.println(course + " page " + page);
        return "students";
    }

    @GetMapping("/{id}")
    public String show(@PathVariable int id) {
        System.out.println("Student " + id);
        return "student-detail";
    }
}`,
      expected: 'Java page 2\nMySQL page 1\nStudent 7',
      explain: 'Request 2 has no `page`, so `defaultValue = "1"` is used (Spring converts the String to int). Request 3 matches `/{id}` and binds 7. Without the default, a missing required `@RequestParam` gives **400 Bad Request**.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 8,
      q: '**The same routing idea in JavaScript (Express)**: `req.params` is `@PathVariable`, `req.query` is `@RequestParam`. Build:\n- `GET /students` → all students; if `?course=Java` is given, only that course\n- `GET /students/:id` → that student, or **404** with `{ "error": "Student not found" }`',
      example: { title: 'params vs query', code: 'app.get("/books/:id", (req, res) => {\n  const id = Number(req.params.id);   // like @PathVariable int id\n  const lang = req.query.lang;         // like @RequestParam(required = false) String lang\n});' },
      starter: 'const express = require("express");\nconst app = express();\n\nconst students = [\n  { id: 1, name: "Asha", course: "Java" },\n  { id: 2, name: "Rohan", course: "Python" },\n  { id: 3, name: "Sneha", course: "Java" },\n];\n\n// TODO: GET /students (optional ?course=) and GET /students/:id\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\n\nconst students = [\n  { id: 1, name: "Asha", course: "Java" },\n  { id: 2, name: "Rohan", course: "Python" },\n  { id: 3, name: "Sneha", course: "Java" },\n];\n\napp.get("/students", (req, res) => {\n  const { course } = req.query;\n  res.json(course ? students.filter((s) => s.course === course) : students);\n});\n\napp.get("/students/:id", (req, res) => {\n  const s = students.find((x) => x.id === Number(req.params.id));\n  if (!s) return res.status(404).json({ error: "Student not found" });\n  res.json(s);\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'GET /students → all 3', steps: [{ method: 'GET', url: '/students', expect: { status: 200, length: 3 } }] },
        { name: 'GET /students?course=Java → 2', steps: [{ method: 'GET', url: '/students?course=Java', expect: { status: 200, length: 2 } }] },
        { name: 'GET /students/2 → Rohan', steps: [{ method: 'GET', url: '/students/2', expect: { status: 200, json: { id: 2, name: 'Rohan' } } }] },
        { name: 'GET /students/99 → 404', steps: [{ method: 'GET', url: '/students/99', expect: { status: 404, json: { error: 'Student not found' } } }] },
      ],
      explain: 'Path values identify **which** resource (`/students/2`), query values **filter or page** a list (`?course=Java`). Path params arrive as strings, so convert them (`Number(...)`), which Spring does automatically when you declare `int id`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'After saving a student in a `@PostMapping` method, what should the method return to follow Post/Redirect/Get?',
      options: ['"students"', '"redirect:/students"', '"forward:/students"', 'null'],
      answer: 1,
      explain: 'The `redirect:` prefix makes Spring send a 302 to `/students`, so the browser does a fresh GET and refresh will not re-submit the form. Returning `"students"` renders the view directly from the POST.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about `@ResponseBody` and `@RestController` are TRUE? (choose all that apply)',
      options: [
        '@ResponseBody writes the return value directly into the response body instead of resolving a view',
        'With Jackson on the classpath, a returned object is converted to JSON',
        '@RestController = @Controller + @ResponseBody on every method',
        'A @RestController method returning "students" renders students.jsp',
      ],
      answers: [0, 1, 2],
      explain: 'In a @RestController the String "students" is sent as the text body, not resolved as a view. Use `@Controller` for JSP pages and `@RestController` for JSON APIs.',
    },
  ],
};
