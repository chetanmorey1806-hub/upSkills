export default {
  lesson: 'day-12-blazor-forms-validation-http',
  minutes: 25,
  intro: 'Practise EditForm validation with Data Annotations and calling a Web API from Blazor with HttpClient, including loading and error states.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `The registration form shows no error messages even though the model has \`[Required]\` attributes. Which component is missing inside \`<EditForm>\`? Write the full tag.`,
      example: { title: 'components that only DISPLAY errors', code: '<ValidationSummary />\n<ValidationMessage For="() => model.Name" />' },
      accept: ['<DataAnnotationsValidator />', '<DataAnnotationsValidator/>', '<DataAnnotationsValidator></DataAnnotationsValidator>', 'DataAnnotationsValidator'],
      explain: 'DataAnnotationsValidator connects the Data Annotations attributes to the EditForm\'s EditContext. Without it nothing is validated, so ValidationSummary and ValidationMessage have nothing to show and OnValidSubmit always runs.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A student model has `[Required] public int Age { get; set; }`. The user leaves the Age box empty and submits. What happens?',
      options: [
        'The message "The Age field is required." is shown',
        'No error: an int always has a value (0), so [Required] passes',
        'The app throws NullReferenceException',
        'The form cannot be submitted at all'
      ],
      answer: 1,
      explain: 'Value types such as int, bool and DateTime always have a value, so [Required] never fails for them. Use int? with [Required], or a [Range(17, 35)] rule, to force a real value.',
    },
    {
      type: 'output',
      mins: 6,
      q: 'Predict the output of this console program that uses the same validation engine as Blazor\'s DataAnnotationsValidator.',
      example: { title: 'rules to remember', text: '- validateAllProperties: true checks every attribute\n- If [Required] fails, the other attributes of that same property are skipped\n- Errors are listed in property order\n- EmailAddress only needs exactly one @ that is not the first or last character' },
      code: `using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

var forms = new[]
{
    new Signup { UserName = "ab", Age = 20, Email = "ab@x.in", Pin = "411001" },
    new Signup { UserName = "", Age = 70, Email = "kiran.mail.com", Pin = "4110" },
    new Signup { UserName = "meena", Age = 18, Email = "meena@x.in", Pin = "560001" }
};
foreach (var f in forms)
{
    var errors = new List<ValidationResult>();
    bool ok = Validator.TryValidateObject(f, new ValidationContext(f), errors, validateAllProperties: true);
    Console.WriteLine(ok ? "VALID" : $"INVALID ({errors.Count})");
    foreach (var e in errors) Console.WriteLine($"- {e.ErrorMessage}");
}

public class Signup
{
    [Required(ErrorMessage = "UserName required")]
    [StringLength(20, MinimumLength = 3, ErrorMessage = "UserName 3-20 chars")]
    public string UserName { get; set; } = "";

    [Range(18, 60, ErrorMessage = "Age 18-60")]
    public int Age { get; set; }

    [EmailAddress(ErrorMessage = "Bad email")]
    public string Email { get; set; } = "";

    [RegularExpression(@"^[1-9][0-9]{5}$", ErrorMessage = "PIN must be 6 digits")]
    public string Pin { get; set; } = "";
}`,
      expected: `INVALID (1)
- UserName 3-20 chars
INVALID (4)
- UserName required
- Age 18-60
- Bad email
- PIN must be 6 digits
VALID`,
      explain: '"ab" passes [Required] but is shorter than 3 characters. In the second form the empty name fails [Required], so StringLength is not checked (only one UserName error); 70 is outside 18-60, the email has no @ and "4110" is not 6 digits. Range is inclusive, so Age 18 is valid in the third form.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Load the product list from the Web API and turn the JSON into a list in one call. Complete the line:
\`products = await Http.______<List<ProductDto>>("api/products");\``,
      example: { title: 'sending data', code: 'var response = await Http.PostAsJsonAsync("api/products", newProduct);\nresponse.EnsureSuccessStatusCode();' },
      accept: ['GetFromJsonAsync'],
      caseSensitive: true,
      explain: 'GetFromJsonAsync<T> (System.Net.Http.Json) sends a GET and deserializes the JSON body into T. It throws HttpRequestException for non-success status codes, so wrap it in try/catch to show an error state.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which practices make a Blazor CRUD page that calls a Web API robust? Select all that apply.',
      options: [
        'Keep the list null while loading and show "Loading..." when it is null',
        'Catch HttpRequestException and show a friendly error with a Retry button',
        'Create a new HttpClient() inside every method',
        'Disable the Save button while a request is running (busy flag)',
        'Bind the edit form directly to the row object from the table',
        'Validate the same rules again in the Web API'
      ],
      answers: [0, 1, 3, 5],
      explain: 'Loading, error and busy states make the page behave well when the API is slow or down, and server-side validation is mandatory because clients can be bypassed. new HttpClient() per call causes socket exhaustion - use IHttpClientFactory/AddHttpClient. Binding the form to the row object changes the table before the user saves; copy it first.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A Blazor WebAssembly app on https://localhost:7100 calls an API on https://localhost:7200. Postman works, but the browser console shows "blocked by CORS policy". Where is the fix?',
      options: [
        'In the Blazor app: add [AllowCors] to the component',
        'In the Web API: AddCors with a policy allowing https://localhost:7100 and app.UseCors(...)',
        'Use http instead of https',
        'Call the API from OnAfterRenderAsync instead of OnInitializedAsync'
      ],
      answer: 1,
      explain: 'CORS is enforced by the browser but configured on the SERVER: the API must send Access-Control-Allow-Origin for the Blazor origin. Postman is not a browser, which is why it works there.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Make ConfirmPassword match Password. Complete the attribute:
\`[______(nameof(Password), ErrorMessage = "Passwords do not match")]\``,
      example: { title: 'other attributes', code: '[Required]\n[StringLength(50, MinimumLength = 3)]\n[Range(17, 35)]' },
      accept: ['Compare'],
      caseSensitive: true,
      explain: '[Compare("OtherProperty")] (System.ComponentModel.DataAnnotations) compares two properties of the same model. Using nameof(Password) avoids typos and survives renaming.',
    },
  ],
};
