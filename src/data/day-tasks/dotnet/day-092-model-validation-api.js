export default {
  lesson: 'day-092-model-validation-api',
  minutes: 32,
  intro: 'Validate API request DTOs with Data Annotations, read the automatic 400 ValidationProblemDetails response and write a custom validation attribute.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'An `[ApiController]` receives a DTO that fails `[Required]`. What happens if your action never checks `ModelState`?',
      options: ['The action runs with null values', 'The framework returns 400 with a ValidationProblemDetails body before the action runs', 'The app throws a 500 error', 'The request is silently ignored'],
      answer: 1,
      explain: 'With `[ApiController]` the **automatic model state validation** filter short-circuits invalid requests with 400 and an `errors` dictionary. In MVC (without the attribute) you must check `ModelState.IsValid` yourself.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'The client posts `{"name":"","age":15,"email":"ravi@mail"}`. Which **keys** appear in the `errors` object of the 400 response? Type them one per line in property order. (Remember what `[EmailAddress]` checks.)',
      example: { title: 'the shape of the 400 body', code: '{\n  "title": "One or more validation errors occurred.",\n  "status": 400,\n  "errors": { "Price": ["The field Price must be between 1 and 100000."] }\n}' },
      code: `public class CreateStudentDto
{
    [Required] public string Name { get; set; }
    [Range(18, 60)] public int Age { get; set; }
    [Required, EmailAddress] public string Email { get; set; }
}`,
      expected: `Name
Age`,
      explain: 'An empty string fails `[Required]` (empty strings are not allowed by default), and 15 is outside 18-60. `[EmailAddress]` only checks for an `@` with text on both sides, so "ravi@mail" passes - add a `[RegularExpression]` if you need a dot in the domain.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the method that a custom validation attribute overrides:\n```\npublic class NotInFutureAttribute : ValidationAttribute\n{\n    protected override ValidationResult? ______(object? value, ValidationContext ctx)\n    {\n        return value is DateTime d && d > DateTime.Today\n            ? new ValidationResult("Date cannot be in the future")\n            : ValidationResult.Success;\n    }\n}\n```',
      example: { title: 'using it on a DTO', code: '[NotInFuture]\npublic DateTime DateOfBirth { get; set; }' },
      accept: ['IsValid'],
      caseSensitive: true,
      explain: 'Override `IsValid(object? value, ValidationContext ctx)` and return `ValidationResult.Success` or an error. For rules across several properties implement `IValidatableObject.Validate` on the DTO instead (or use FluentValidation).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        '[Compare("Password")] checks that ConfirmPassword equals Password',
        '[RegularExpression(@"^[6-9]\\d{9}$")] can validate an Indian mobile number',
        'IValidatableObject is useful when a rule needs two properties (e.g. EndDate > StartDate)',
        'Validation attributes also protect the database, so server checks are not needed',
        'Business validation like "email already registered" usually needs the service/database, not an attribute',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Annotations cover format rules; cross-field rules use `IValidatableObject`; rules that need data (uniqueness) go in the service and return 400/409. Attributes ARE server checks - the point is to always have them.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: '**Build the ValidationProblemDetails body.** Write `validateRegistration(dto)` returning `null` when valid, else `{ status: 400, errors: { Field: ["message"] } }` with these rules:\n- `Name` required → `"The Name field is required."`\n- `Mobile` must match 10 digits starting with 6-9 → `"Invalid mobile number."`\n- `ConfirmPassword` must equal `Password` → `"Passwords do not match."`',
      example: { title: 'an Indian mobile regex', code: '/^[6-9]\\d{9}$/.test("9876543210") // true' },
      starter: 'function validateRegistration(dto) {\n  // TODO\n}\n',
      solution: 'function validateRegistration(dto) {\n  const errors = {};\n  if (!dto.Name || !String(dto.Name).trim()) errors.Name = ["The Name field is required."];\n  if (!/^[6-9]\\d{9}$/.test(dto.Mobile || "")) errors.Mobile = ["Invalid mobile number."];\n  if (dto.ConfirmPassword !== dto.Password) errors.ConfirmPassword = ["Passwords do not match."];\n  return Object.keys(errors).length ? { status: 400, errors } : null;\n}\n',
      tests: [
        { call: 'validateRegistration({ Name: "Asha", Mobile: "9876543210", Password: "P@ss1234", ConfirmPassword: "P@ss1234" })', expect: null },
        { call: 'validateRegistration({ Name: "", Mobile: "5876543210", Password: "a", ConfirmPassword: "b" })', expect: { status: 400, errors: { Name: ['The Name field is required.'], Mobile: ['Invalid mobile number.'], ConfirmPassword: ['Passwords do not match.'] } } },
        { call: 'validateRegistration({ Name: "Ravi", Mobile: "98765", Password: "x", ConfirmPassword: "x" })', expect: { status: 400, errors: { Mobile: ['Invalid mobile number.'] } } },
      ],
      explain: 'ASP.NET Core returns errors as **arrays per field** because one field can break several rules. Matching that shape lets a React form show each message under its input.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 9,
      q: '**The same validation in Express.** `POST /api/students` with `{ name, age, email }`:\n- `name` required, `age` 18-60, `email` must contain `@`\n- invalid → `400` `{ "title": "One or more validation errors occurred.", "errors": { "name": [...], ... } }` (only failing fields; any message text)\n- valid → `201` `{ id: 1, name, age, email }`',
      example: { title: 'adding an error array', code: '(errors.price ||= []).push("Price must be positive");' },
      starter: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\n// TODO\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nlet nextId = 1;\napp.post("/api/students", (req, res) => {\n  const { name, age, email } = req.body;\n  const errors = {};\n  if (!name || !String(name).trim()) errors.name = ["Name is required"];\n  if (!(age >= 18 && age <= 60)) errors.age = ["Age must be between 18 and 60"];\n  if (!email || !String(email).includes("@")) errors.email = ["Invalid email"];\n  if (Object.keys(errors).length) return res.status(400).json({ title: "One or more validation errors occurred.", errors });\n  res.status(201).json({ id: nextId++, name, age, email });\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'valid → 201', steps: [{ method: 'POST', url: '/api/students', body: { name: 'Asha', age: 21, email: 'asha@mail.com' }, expect: { status: 201, json: { id: 1, name: 'Asha' } } }] },
        { name: 'invalid → 400 with name and age', steps: [{ method: 'POST', url: '/api/students', body: { name: '', age: 15, email: 'ravi@mail' }, expect: { status: 400, json: { title: 'One or more validation errors occurred.' }, has: ['errors'], absentIn: { errors: ['email'] } } }] },
        { name: 'errors are arrays', steps: [{ method: 'POST', url: '/api/students', body: { name: 'X', age: 61, email: 'x' }, expect: { status: 400, json: { errors: { age: [''], email: [''] } }, absentIn: { errors: ['name'] } } }] },
      ],
      explain: 'Only failing fields appear and every value is an array of messages, like ASP.NET Core\'s ValidationProblemDetails. A consistent error shape lets the frontend handle all forms the same way.',
    },
  ],
};
