export default {
  lesson: 'day-10-global-exception-handling',
  minutes: 25,
  intro: 'Centralise error handling with @RestControllerAdvice, map exceptions to status codes and build the same idea with Express error middleware.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is `@RestControllerAdvice`?',
      options: [
        'A controller that serves HTML',
        '@ControllerAdvice + @ResponseBody: a global class whose @ExceptionHandler methods apply to all controllers and return JSON',
        'A filter that logs every request',
        'An annotation that retries failed requests',
      ],
      answer: 1,
      explain: 'One `@RestControllerAdvice` class handles exceptions thrown by **every** controller, so you remove try/catch blocks from controllers and get one consistent error format.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the annotation so this method handles `StudentNotFoundException`:\n```\n???\npublic ResponseEntity<ErrorResponse> notFound(StudentNotFoundException ex) { ... }\n```',
      example: { title: 'handling two exceptions in one method', code: '@ExceptionHandler({ IllegalArgumentException.class, IllegalStateException.class })' },
      accept: ['@ExceptionHandler(StudentNotFoundException.class)', '@ExceptionHandler({StudentNotFoundException.class})', '@ExceptionHandler(value = StudentNotFoundException.class)'],
      explain: '`@ExceptionHandler(X.class)` tells Spring which exception type the method handles. You can also put `@ResponseStatus(HttpStatus.NOT_FOUND)` on the method, but returning a `ResponseEntity` lets you set status and body together.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The advice class has both handlers below. The service throws `new StudentNotFoundException(7)`. What does the client receive? Type the status code on line 1 and the `message` value on line 2.',
      example: { title: 'which handler wins?', text: 'Spring picks the handler whose exception type is CLOSEST to the thrown exception in the class hierarchy.' },
      code: `class StudentNotFoundException extends RuntimeException {
    StudentNotFoundException(long id) { super("Student " + id + " not found"); }
}

@ExceptionHandler(RuntimeException.class)
ResponseEntity<ErrorResponse> other(RuntimeException ex) {
    return ResponseEntity.status(500).body(new ErrorResponse(500, "Something went wrong"));
}

@ExceptionHandler(StudentNotFoundException.class)
ResponseEntity<ErrorResponse> notFound(StudentNotFoundException ex) {
    return ResponseEntity.status(404).body(new ErrorResponse(404, ex.getMessage()));
}`,
      expected: '404\nStudent 7 not found',
      explain: 'Both handlers match, but `StudentNotFoundException` is the **most specific** type, so `notFound` runs: status 404 and the exception message "Student 7 not found". The RuntimeException handler is the fallback for everything else.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which exception → status code pairs are good choices? (choose all that apply)',
      options: [
        'MethodArgumentNotValidException → 400',
        'StudentNotFoundException → 404',
        'Duplicate email (DuplicateResourceException) → 409 Conflict',
        'HttpMessageNotReadableException (malformed JSON) → 500',
        'Any unexpected Exception → 500 with a generic message (details only in the log)',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Client mistakes are 4xx: invalid body 400, missing resource 404, duplicate 409. **Malformed JSON is also the client\'s fault → 400**, not 500. Unknown errors are 500 with a safe message; never send stack traces to clients.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Spring 6 supports the RFC 7807 error format out of the box. Complete the line that creates a 404 problem detail:\n```\nProblemDetail pd = ???(HttpStatus.NOT_FOUND, ex.getMessage());\n```',
      example: { title: 'adding extra info', code: 'pd.setTitle("Student Not Found");\npd.setProperty("timestamp", Instant.now());' },
      accept: ['ProblemDetail.forStatusAndDetail'],
      explain: '`ProblemDetail.forStatusAndDetail(status, detail)` builds a standard body with `type`, `title`, `status`, `detail` and `instance`, sent as `application/problem+json`.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: '**The same global-handler idea in Express**: routes just `throw`, and ONE error middleware turns errors into JSON.\n- `GET /api/students/:id` → `200` with the student, otherwise throw a `NotFoundError` (status 404, message `Student <id> not found`)\n- an error middleware `(err, req, res, next)` returns `{ status, message }` with `err.status` (or `500` and `"Something went wrong"` for unknown errors)\n- `GET /api/crash` throws a plain `Error("db down")` → must give `500` and the generic message',
      example: { title: 'a custom error class', code: 'class ConflictError extends Error {\n  constructor(msg) { super(msg); this.status = 409; }\n}' },
      starter: 'const express = require("express");\nconst app = express();\n\nconst students = [{ id: 1, name: "Asha" }, { id: 2, name: "Ravi" }];\n\nclass NotFoundError extends Error {\n  // TODO: status 404\n}\n\n// TODO: routes that throw\n// TODO: error middleware (4 parameters) AFTER the routes\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\n\nconst students = [{ id: 1, name: "Asha" }, { id: 2, name: "Ravi" }];\n\nclass NotFoundError extends Error {\n  constructor(msg) { super(msg); this.status = 404; }\n}\n\napp.get("/api/students/:id", (req, res) => {\n  const s = students.find((x) => x.id === Number(req.params.id));\n  if (!s) throw new NotFoundError(`Student ${req.params.id} not found`);\n  res.json(s);\n});\n\napp.get("/api/crash", () => {\n  throw new Error("db down");\n});\n\napp.use((err, req, res, next) => {\n  if (err.status) return res.status(err.status).json({ status: err.status, message: err.message });\n  res.status(500).json({ status: 500, message: "Something went wrong" });\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'existing student → 200', steps: [{ method: 'GET', url: '/api/students/1', expect: { status: 200, json: { id: 1, name: 'Asha' } } }] },
        { name: 'missing student → 404 JSON', steps: [{ method: 'GET', url: '/api/students/7', expect: { status: 404, json: { status: 404, message: 'Student 7 not found' } } }] },
        { name: 'unknown error → 500 generic', steps: [{ method: 'GET', url: '/api/crash', expect: { status: 500, json: { status: 500, message: 'Something went wrong' } } }] },
      ],
      explain: 'An Express error middleware has **4 parameters** and is registered after the routes - just like `@RestControllerAdvice` it is the one place that maps exceptions to status codes. Known errors carry their own status; unknown ones become a generic 500 so internal details ("db down") never leak to the client.',
    },
  ],
};
