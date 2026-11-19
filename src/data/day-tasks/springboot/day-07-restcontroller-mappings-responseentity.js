export default {
  lesson: 'day-07-restcontroller-mappings-responseentity',
  minutes: 24,
  intro: 'Use @RestController, mapping shortcuts, @PathVariable, @RequestParam, @RequestBody and ResponseEntity, and predict what each endpoint returns.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between `@Controller` and `@RestController`?',
      options: [
        'There is no difference',
        '@RestController = @Controller + @ResponseBody, so return values are written to the body (as JSON) instead of being treated as view names',
        '@RestController only supports GET',
        '@Controller cannot be scanned by Spring',
      ],
      answer: 1,
      explain: '`@RestController` combines `@Controller` and `@ResponseBody`. With a plain `@Controller`, returning `"students"` would look for a view template named students - the reason beginners get "Circular view path" or 404 errors.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the parameter so `id` is taken from the URL `/api/students/{id}`:\n```\n@GetMapping("/{id}")\npublic Student getOne(??? Long id) { ... }\n```',
      example: { title: 'reading a query parameter', code: '@GetMapping\npublic List<Student> list(@RequestParam String city) { ... }   // /api/students?city=Pune' },
      accept: ['@PathVariable', '@PathVariable("id")', '@PathVariable(name = "id")', '@PathVariable(value = "id")'],
      explain: '`@PathVariable` binds a `{placeholder}` in the path. `@RequestParam` is for `?key=value` query parameters. Mixing them up gives a 400 "Required parameter is not present".',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The controller below is called with `GET /api/products?category=books`. What JSON body is returned? (type it on one line without spaces)',
      example: { title: 'a Map becomes a JSON object', code: 'return Map.of("ok", true);   // {"ok":true}' },
      code: `@RestController
@RequestMapping("/api/products")
public class ProductController {
    @GetMapping
    public Map<String, Object> search(
            @RequestParam String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("category", category);
        m.put("page", page);
        m.put("from", (page - 1) * size + 1);
        return m;
    }
}`,
      expected: '{"category":"books","page":1,"from":1}',
      explain: '`page` and `size` are missing from the URL, so their `defaultValue`s are used (1 and 10). `from = (1 - 1) * 10 + 1 = 1`. Jackson writes a `LinkedHashMap` as a JSON object in insertion order.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Same controller, now called with `GET /api/products?category=pens&page=3&size=5`. What JSON body is returned? (one line, no spaces)',
      example: { title: 'request params are converted', text: 'Spring converts "3" from the URL into the int 3 automatically.' },
      code: `m.put("category", category);
m.put("page", page);
m.put("from", (page - 1) * size + 1);`,
      expected: '{"category":"pens","page":3,"from":11}',
      explain: 'Values from the query string override the defaults: page = 3, size = 5, so from = (3 - 1) * 5 + 1 = **11** (page 3 shows items 11-15).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the return statement so a POST returns status **201 Created** with the saved student in the body:\n```\n@PostMapping\npublic ResponseEntity<Student> create(@RequestBody Student s) {\n    Student saved = service.save(s);\n    return ???;\n}\n```',
      example: { title: 'a 200 response', code: 'return ResponseEntity.ok(student);' },
      accept: ['ResponseEntity.status(HttpStatus.CREATED).body(saved)', 'ResponseEntity.status(201).body(saved)', 'new ResponseEntity<>(saved, HttpStatus.CREATED)', 'new ResponseEntity<Student>(saved, HttpStatus.CREATED)', 'ResponseEntity.status(HttpStatus.CREATED).body(saved);', 'ResponseEntity.status(201).body(saved);', 'new ResponseEntity<>(saved, HttpStatus.CREATED);'],
      explain: '`ResponseEntity` gives full control over status, headers and body. Returning `saved` directly would send **200**, but REST expects **201** for creation. `ResponseEntity.created(uri).body(saved)` also adds a Location header.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'There is no student with id 50. What **status code** does `GET /api/students/50` return?',
      example: { title: 'Optional.map', code: 'Optional.of(5).map(x -> x * 2).orElse(0)   // 10\nOptional.empty().map(x -> x * 2).orElse(0) // 0' },
      code: `@GetMapping("/{id}")
public ResponseEntity<Student> getOne(@PathVariable Long id) {
    return repo.findById(id)
               .map(ResponseEntity::ok)
               .orElse(ResponseEntity.notFound().build());
}`,
      expected: '404',
      explain: '`findById` returns an empty `Optional`, so `map` is skipped and `orElse` returns `ResponseEntity.notFound().build()` → **404** with an empty body. If the student existed, `ResponseEntity.ok(student)` would give 200.',
    },
  ],
};
