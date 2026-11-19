export default {
  lesson: 'day-070-model-binding-validation-data-annotations',
  minutes: 32,
  intro: 'Let model binding fill your parameters from the route, query string and form, and validate the model with Data Annotations and ModelState.IsValid.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'For `GET /students/search?city=Pune&page=2` and the action `Search(string city, int page)`, where does model binding get the values?',
      options: ['From the request body', 'From the query string', 'From the cookie', 'From the route template'],
      answer: 1,
      explain: 'Values after `?` are the **query string**. Model binding looks in form fields, route values and the query string (for simple types) and converts them, so `page` becomes the int 2.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which Data Annotations exist in `System.ComponentModel.DataAnnotations`? (choose all that apply)',
      options: ['[Required]', '[StringLength(50)]', '[Range(18, 60)]', '[EmailAddress]', '[NotEmptyNumber]'],
      answers: [0, 1, 2, 3],
      explain: '`Required`, `StringLength`, `Range`, `EmailAddress` (also `Compare`, `RegularExpression`, `Phone`, `Url`...) are built in. `[NotEmptyNumber]` does not exist - for rules not covered you write a custom `ValidationAttribute`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the check in the POST action so invalid data shows the form again with error messages:\n```\nif (!______)\n    return View(student);\n```',
      example: { title: 'adding your own error', code: 'ModelState.AddModelError("Email", "Email already registered");' },
      accept: ['ModelState.IsValid'],
      caseSensitive: true,
      explain: 'Validation runs automatically during model binding; the result is in `ModelState`. MVC does NOT stop the action by itself, so you must check `ModelState.IsValid` (Web API controllers with `[ApiController]` return 400 automatically).',
    },
    {
      type: 'output',
      mins: 5,
      q: 'This model is posted with `Name = "Al"`, `Age = 17`, `Email = "al@mail.com"`. Which properties have errors? Type the property names in class order, one per line.',
      example: { title: 'reading an annotation', code: '[StringLength(30, MinimumLength = 2)]  // 2 to 30 characters allowed' },
      code: `public class Student
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Name { get; set; }

    [Range(18, 60)]
    public int Age { get; set; }

    [Required, EmailAddress]
    public string Email { get; set; }
}`,
      expected: `Name
Age`,
      explain: '"Al" has 2 characters but `MinimumLength = 3` → error. 17 is outside `Range(18, 60)` → error (both ends are inclusive). The email is present and valid, so it passes.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why must you validate on the server even though the form has client-side (jQuery) validation?',
      options: ['Server validation is faster', 'Anyone can disable JavaScript or call the URL directly with Postman, skipping the browser checks', 'Client-side validation does not support [Required]', 'It is only needed for numbers'],
      answer: 1,
      explain: 'Client-side validation is for user experience; **server-side validation is for security and data integrity**. A request can always be crafted without your page.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 9,
      q: '**Write the validator.** `validateStudent(s)` returns an object with error messages for the same rules as the C# model (only failing keys, `{}` when valid):\n- `Name`: required → `"Name is required"`; otherwise length 3-50 → `"Name must be 3-50 characters"`\n- `Age`: 18-60 inclusive → `"Age must be between 18 and 60"`\n- `Email`: required → `"Email is required"`; otherwise must contain `@` and a `.` after it → `"Invalid email"`',
      example: { title: 'collecting errors', code: 'const errors = {};\nif (!p.price) errors.Price = "Price is required";\nreturn errors;' },
      starter: 'function validateStudent(s) {\n  const errors = {};\n  // TODO\n  return errors;\n}\n',
      solution: 'function validateStudent(s) {\n  const errors = {};\n  const name = (s.Name || "").trim();\n  if (!name) errors.Name = "Name is required";\n  else if (name.length < 3 || name.length > 50) errors.Name = "Name must be 3-50 characters";\n  if (!(s.Age >= 18 && s.Age <= 60)) errors.Age = "Age must be between 18 and 60";\n  const email = (s.Email || "").trim();\n  if (!email) errors.Email = "Email is required";\n  else if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)) errors.Email = "Invalid email";\n  return errors;\n}\n',
      tests: [
        { call: 'validateStudent({ Name: "Asha", Age: 21, Email: "asha@mail.com" })', expect: {} },
        { call: 'validateStudent({ Name: "Al", Age: 17, Email: "al@mail.com" })', expect: { Name: 'Name must be 3-50 characters', Age: 'Age must be between 18 and 60' } },
        { call: 'validateStudent({ Name: "", Age: 60, Email: "" })', expect: { Name: 'Name is required', Email: 'Email is required' } },
        { call: 'validateStudent({ Name: "Ravi", Age: 18, Email: "ravi.mail.com" })', expect: { Email: 'Invalid email' } },
      ],
      explain: 'Each Data Annotation is just a rule like these `if`s, and `ModelState` is the error dictionary keyed by property name. Note that both ends of `[Range]` are **inclusive** (18 and 60 are valid) and that "required" is checked before the format.',
    },
  ],
};
