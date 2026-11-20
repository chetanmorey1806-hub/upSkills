export default {
  lesson: 'day-08-cqrs-mediatr',
  minutes: 25,
  intro: 'Practise separating commands from queries, writing MediatR requests and handlers, wiring MediatR in DI and keeping controllers thin.',
  tasks: [
    {
      type: 'multi',
      mins: 3,
      q: 'In a college app, which of these are **commands** (they change state)? Select all that apply.',
      options: [
        'EnrollStudent',
        'GetAttendanceReport',
        'MarkAttendance',
        'GetCourseById',
        'CancelEnrollment',
        'SearchStudentsByName',
      ],
      answers: [0, 2, 4],
      explain: 'Commands express an intent to change something (enroll, mark, cancel). Get/Search/Report requests only read data, so they are queries and must have no side effects.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the request so MediatR knows that sending it returns the new course **id** (an int):
\`public record CreateCourseCommand(string Code, string Title, decimal Fee) : ______;\``,
      example: { title: 'a query that returns a DTO', code: 'public record GetCourseByIdQuery(int Id) : IRequest<CourseDto?>;' },
      accept: ['IRequest<int>', 'MediatR.IRequest<int>'],
      caseSensitive: true,
      explain: '`IRequest<TResponse>` tells MediatR (and the compiler) what `Send` returns, so `int id = await sender.Send(cmd)` is strongly typed. A command with no result implements the non-generic `IRequest`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the handler's class declaration for \`CreateCourseCommand\` (which returns int):
\`public class CreateCourseCommandHandler : ______<CreateCourseCommand, int>\``,
      example: { title: 'the method it must implement', code: 'public async Task<int> Handle(CreateCourseCommand request, CancellationToken ct) { ... }' },
      accept: ['IRequestHandler', 'MediatR.IRequestHandler'],
      caseSensitive: true,
      explain: '`IRequestHandler<TRequest, TResponse>` has one method, `Task<TResponse> Handle(TRequest request, CancellationToken cancellationToken)`. MediatR finds it through DI by these two type arguments.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Using the **mini mediator** from the lesson (it prints `[mediator] <RequestTypeName> -> handler` on every Send; ids are `db.Count + 1`; `ListCoursesQuery` returns courses with `Fee <= MaxFee` ordered by fee), what does this print?',
      example: { title: 'reminder', code: 'Send() prints its log line BEFORE the handler runs and returns.' },
      code: `var db = new List<Course>();
var m = new Mediator();
m.Register(new CreateCourseHandler(db));
m.Register(new ListCoursesHandler(db));

m.Send(new CreateCourseCommand("ML301", "Machine Learning", 9000));
int id = m.Send(new CreateCourseCommand("WD101", "Web Design", 2500));
var list = m.Send(new ListCoursesQuery(MaxFee: 10000));

Console.WriteLine(id);
Console.WriteLine(list.Count);
Console.WriteLine(list[0].Code);`,
      expected: `[mediator] CreateCourseCommand -> handler
[mediator] CreateCourseCommand -> handler
[mediator] ListCoursesQuery -> handler
2
2
WD101`,
      explain: 'Three Send calls print three log lines first. WD101 is the second course, so its id is 2. Both fees (9000 and 2500) are within 10000, so the list has 2 items, ordered by fee: WD101 (2500) comes first. The return value of the first Send is simply ignored.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Calling `sender.Send(new GetStudentQuery(5))` throws **"No service for type IRequestHandler<GetStudentQuery, StudentDto> has been registered"**. What is the most likely cause?',
      options: [
        'The database is offline',
        'The handler class is in an assembly that AddMediatR did not scan (or the handler does not exist)',
        'The controller is not marked [ApiController]',
        'GetStudentQuery should be a class, not a record',
      ],
      answer: 1,
      explain: 'MediatR resolves handlers from DI. `RegisterServicesFromAssembly(...)` registers handlers only from the assembly you pass - usually the Application project. Check that the handler exists, implements the exact `IRequestHandler<GetStudentQuery, StudentDto>` and lives in a scanned assembly.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which interface should a controller inject if it only **sends** commands and queries?',
      options: ['`IPublisher`', '`INotificationHandler`', '`ISender`', '`IPipelineBehavior`'],
      answer: 2,
      explain: '`ISender` exposes only `Send` (request/response). `IPublisher` is for publishing notifications, and `IMediator` combines both. Injecting the narrowest interface documents what the controller does.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'In a CQRS design using one SQL Server database, what is a sensible choice for the **query** side?',
      options: [
        'Load full domain entities with change tracking and map them in the controller',
        'Use Dapper or EF Core AsNoTracking projections straight into DTOs',
        'Call the command handlers to read data',
        'Queries must use a separate database, otherwise it is not CQRS',
      ],
      answer: 1,
      explain: 'Queries need speed, not domain behaviour: project directly into DTOs without tracking. CQRS does not require a second database; separate read stores are an optional, advanced step.',
    },
  ],
};
