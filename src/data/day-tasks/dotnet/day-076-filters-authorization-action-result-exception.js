export default {
  lesson: 'day-076-filters-authorization-action-result-exception',
  minutes: 28,
  intro: 'Use MVC filters (Authorization, Resource, Action, Exception, Result) to run cross-cutting code around actions and know the order in which they execute.',
  tasks: [
    {
      type: 'output',
      mins: 5,
      q: 'An action, decorated with an action filter and a result filter (each prints in its `...Executing` and `...Executed` methods), runs successfully. What is printed, in order?',
      example: { title: 'the filter pipeline', code: 'Authorization → Resource → Action → (action method) → Action → Result → (view) → Result → Resource' },
      code: `public class LogAction : IActionFilter {
    public void OnActionExecuting(ActionExecutingContext c) => Console.WriteLine("Action before");
    public void OnActionExecuted(ActionExecutedContext c)  => Console.WriteLine("Action after");
}
public class LogResult : IResultFilter {
    public void OnResultExecuting(ResultExecutingContext c) => Console.WriteLine("Result before");
    public void OnResultExecuted(ResultExecutedContext c)  => Console.WriteLine("Result after");
}

[LogAction, LogResult]   // (registered as attributes)
public IActionResult Index() {
    Console.WriteLine("Index runs");
    return View();
}`,
      expected: `Action before
Index runs
Action after
Result before
Result after`,
      explain: 'Action filters wrap the **action method**; result filters wrap the **execution of the result** (rendering the view), which happens after the action has returned. Logging, timing and model checks fit action filters; adding headers fits result filters.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which filter type runs **first** for every request to an action?',
      options: ['Action filter', 'Exception filter', 'Authorization filter', 'Result filter'],
      answer: 2,
      explain: 'Authorization filters run first and can short-circuit (e.g. return 401/403) before model binding or the action. Then resource → action → exception (only on errors) → result.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'In an action filter, stop the action and return 400 when the model is invalid. Complete the line:\n```\npublic void OnActionExecuting(ActionExecutingContext context)\n{\n    if (!context.ModelState.IsValid)\n        ______ = new BadRequestObjectResult(context.ModelState);\n}\n```',
      example: { title: 'short-circuit in an authorization filter', code: 'context.Result = new UnauthorizedResult();' },
      accept: ['context.Result'],
      caseSensitive: true,
      explain: 'Setting `context.Result` in an `...Executing` method **short-circuits**: the action does not run and that result is returned. This is exactly how `[ApiController]` produces automatic 400 responses.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about filters are TRUE? (choose all that apply)',
      options: [
        'Filters can be applied to an action, a controller, or globally via options.Filters.Add(...)',
        'An exception filter handles exceptions thrown by actions (MVC only), not by other middleware',
        '[ServiceFilter(typeof(AuditFilter))] lets a filter receive services through DI',
        'Filters replace middleware completely',
        '[AllowAnonymous] lets an action skip [Authorize] on the controller',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Filters run inside the MVC pipeline with access to action context; middleware runs for every request (including static files). Use `ServiceFilter`/`TypeFilter` for DI. `AllowAnonymous` exempts a single action, e.g. Login.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'This exception filter is registered globally. `GET /students/details/0` throws `ArgumentException("Invalid id")`. Type the **status code** on line 1 and the **JSON** on line 2 exactly as written by the filter.',
      example: { title: 'handling inside the filter', code: 'context.ExceptionHandled = true; // stop it from bubbling up' },
      code: `public class ApiExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        int code = context.Exception is ArgumentException ? 400 : 500;
        context.Result = new ObjectResult(new { error = context.Exception.Message })
                         { StatusCode = code };
        context.ExceptionHandled = true;
    }
}`,
      expected: `400
{"error":"Invalid id"}`,
      explain: '`ArgumentException` maps to 400 (a client mistake), everything else to 500. The anonymous object is serialized to camelCase JSON. Setting `ExceptionHandled = true` stops the exception from reaching the exception middleware.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You want to measure how long every action takes and log it. Which filter type fits best?',
      options: ['Authorization filter', 'Action filter (start a Stopwatch in OnActionExecuting, stop in OnActionExecuted)', 'Exception filter', 'Partial view'],
      answer: 1,
      explain: 'An action filter wraps the action method, so a Stopwatch started before and stopped after measures exactly the action. For the whole request including other middleware, use a middleware instead.',
    },
  ],
};
