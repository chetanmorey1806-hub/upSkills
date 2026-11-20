export default {
  lesson: 'day-09-mediatr-pipeline-events-vertical-slice',
  minutes: 30,
  intro: 'Practise MediatR pipeline behaviors and their order, notifications and domain events, and vertical slice organisation for the Course Enrollment API.',
  tasks: [
    {
      type: 'output',
      mins: 5,
      q: 'This simulates a MediatR pipeline. `Send` wraps the handler starting from the **last** behavior, so the first behavior in the list is the outermost (exactly like `AddOpenBehavior` order). What does the program print?',
      example: { title: 'the wrapping loop used by Send', code: `Func<string> next = () => Handler(c);
for (int i = behaviors.Count - 1; i >= 0; i--)
{
    var b = behaviors[i];
    var inner = next;
    next = () => b(c, inner);
}
return next();` },
      code: `var behaviors = new List<Func<Cmd, Func<string>, string>>
{
    (c, next) => { if (c.Code.Length != 5) return "400"; Console.WriteLine("V ok"); return next(); },
    (c, next) => { Console.WriteLine("L in"); var r = next(); Console.WriteLine("L out"); return r; },
    (c, next) => { Console.WriteLine("T begin"); var r = next(); Console.WriteLine("T commit"); return r; },
};

string Handler(Cmd c) { Console.WriteLine("H " + c.Code); return "200"; }

Console.WriteLine(Send(new Cmd("DB201")));
Console.WriteLine(Send(new Cmd("ML30")));

record Cmd(string Code);`,
      expected: `V ok
L in
T begin
H DB201
T commit
L out
200
400`,
      explain: 'Validation is first, so it is outermost and runs first. For DB201 the request flows in V -> L -> T -> Handler and the "after" code runs back out: T commit, then L out, then Send returns "200". For ML30 (4 characters) validation returns "400" without calling next(), so logging, the transaction and the handler never run - nothing else is printed before 400.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Register the open generic \`ValidationBehavior<,>\` inside \`AddMediatR\`:
\`services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(assembly);
    cfg.______(typeof(ValidationBehavior<,>));
});\``,
      example: { title: 'what the behavior implements', code: 'public sealed class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull' },
      accept: ['AddOpenBehavior'],
      caseSensitive: true,
      explain: '`AddOpenBehavior` registers an open generic `IPipelineBehavior<,>` so it wraps EVERY request type. Behaviors run in the order they are added. (`AddBehavior` is for one closed type, e.g. a behavior only for one specific request.)',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Registration order is **Logging, Validation, Transaction**. An invalid `CreateCourseCommand` is sent and ValidationBehavior throws `ValidationException`. Which statement is true?',
      options: [
        'The transaction is opened and then rolled back',
        'The handler runs but its result is discarded',
        'Logging logs "Handling", no transaction is opened, the handler never runs, and the exception reaches the global exception handler (400)',
        'Nothing is logged at all',
      ],
      answer: 2,
      explain: 'Logging is outermost, so it starts first. Validation throws before calling next(), so Transaction and the handler are never reached and no database work happens. The exception bubbles out through Logging to IExceptionHandler, which maps ValidationException to a 400 ProblemDetails.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the class so it runs whenever \`StudentEnrolledEvent\` is **published**:
\`public class SendEnrollmentEmailHandler : ______<StudentEnrolledEvent>\``,
      example: { title: 'publishing the event', code: 'await publisher.Publish(new StudentEnrolledEvent(courseId, title, studentId, email), ct);' },
      accept: ['INotificationHandler', 'MediatR.INotificationHandler'],
      caseSensitive: true,
      explain: '`INotificationHandler<TNotification>` has `Task Handle(TNotification notification, CancellationToken ct)`. Unlike requests, a notification can have any number of handlers - email, invoice, statistics - and adding one never changes the others.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which are good candidates for **pipeline behaviors** (cross-cutting concerns)? Select all that apply.',
      options: [
        'Logging request name and duration',
        'Running FluentValidation validators before the handler',
        'Opening and committing a transaction for commands',
        'The rule "a course cannot have more students than its capacity"',
        'Caching the results of selected queries',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Behaviors are for concerns that apply to many requests in the same way. The capacity rule is business logic about one entity, so it belongs in the Domain (Course.Enroll), not in a generic behavior.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why does the CollegeDbContext publish domain events **after** `base.SaveChangesAsync()` succeeds?',
      options: [
        'Because MediatR cannot publish before saving',
        'So emails and invoices are created only for enrollments that were really saved',
        'To make SaveChanges faster',
        'Because domain events must run in a different process',
      ],
      answer: 1,
      explain: 'If events were published first and the save then failed (constraint violation, deadlock), the student would get an email for an enrollment that does not exist. For full reliability across crashes, store events in an Outbox table in the same transaction.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'In **vertical slice architecture**, where would the request, validator, handler and endpoint for "Enroll Student" live?',
      options: [
        'Spread across Domain, Application, Infrastructure and Api projects',
        'Together in one feature folder or file, e.g. Features/Enrollments/EnrollStudent.cs',
        'Inside the Course entity',
        'In a shared Utilities folder',
      ],
      answer: 1,
      explain: 'Slices group code by feature, so adding or changing a use case touches one place. Business rules can still live in a shared Domain project; the slice keeps its own application and API code together.',
    },
  ],
};
