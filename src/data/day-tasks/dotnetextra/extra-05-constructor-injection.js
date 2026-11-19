export default {
  lesson: 'extra-05-constructor-injection',
  minutes: 20,
  intro: 'Inject dependencies through constructors, register them in the ASP.NET Core DI container and choose lifetimes.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is **constructor injection**?',
      options: ['The class creates its dependencies with `new` in the constructor', 'Dependencies are passed into the constructor as (usually interface) parameters', 'Dependencies are read from static fields', 'The constructor is marked `[Inject]`'],
      answer: 1,
      explain: 'With constructor injection the caller (or the DI container) supplies the dependencies: `public OrderService(IOrderRepository repo)`. The class never decides which implementation to create, so it is loosely coupled and easy to test.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the constructor body to store the injected repository:
\`private readonly IStudentRepository _repo;\`
\`public StudentService(IStudentRepository repo) { ______ }\``,
      example: { title: 'storing an injected logger', code: 'public HomeController(ILogger<HomeController> logger) { _logger = logger; }' },
      accept: ['_repo = repo;', '_repo = repo', 'this._repo = repo;', 'this._repo = repo', '_repo = repo ?? throw new ArgumentNullException(nameof(repo));'],
      caseSensitive: true,
      explain: 'Assign the parameter to the `readonly` field: `_repo = repo;`. Writing `repo = _repo;` (reversed) leaves the field null and causes a NullReferenceException later.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `In \`Program.cs\`, register \`SqlStudentRepository\` for \`IStudentRepository\` with a **scoped** lifetime (one per HTTP request):
\`builder.Services.______;\``,
      example: { title: 'registering a singleton', code: 'builder.Services.AddSingleton<IClock, SystemClock>();' },
      accept: ['AddScoped<IStudentRepository, SqlStudentRepository>()', 'AddScoped<IStudentRepository,SqlStudentRepository>()'],
      acceptRegex: ['^AddScoped\\s*<\\s*IStudentRepository\\s*,\\s*SqlStudentRepository\\s*>\\s*\\(\\s*\\)\\s*;?$'],
      caseSensitive: true,
      explain: '`AddScoped<TService, TImplementation>()` maps the interface to the class with one instance per request. The order matters: interface first, implementation second.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match the lifetimes correctly. Which statements are TRUE?',
      options: ['Transient: a new instance every time it is requested', 'Scoped: one instance per HTTP request', 'Singleton: one instance for the whole application', 'Scoped: one instance per method call', 'Singleton: a new instance per user'],
      answers: [0, 1, 2],
      explain: 'Transient = new each time, Scoped = one per request (scope), Singleton = one for the app lifetime. A DbContext is usually scoped; a stateless helper can be transient; a cache or config reader is often a singleton.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Manual constructor injection with a fake for testing. What does this print?',
      example: { title: 'injecting a fake', code: 'var svc = new FeeService(new FakeClock(new DateTime(2024, 1, 1)));' },
      code: `Console.WriteLine(new FeeService(new FestivalDiscount()).Fee(4999));
Console.WriteLine(new FeeService(new NoDiscount()).Fee(4999));

interface IDiscount { int Percent(); }
class FestivalDiscount : IDiscount { public int Percent() => 20; }
class NoDiscount : IDiscount { public int Percent() => 0; }
class FeeService
{
    private readonly IDiscount _d;
    public FeeService(IDiscount d) { _d = d; }
    public int Fee(int baseFee) => baseFee - baseFee * _d.Percent() / 100;
}`,
      expected: `4000
4999`,
      explain: '4999 × 20 = 99980, / 100 = **999** (integer division drops .8), 4999 − 999 = 4000. With `NoDiscount` the fee is unchanged. The same `FeeService` works with any `IDiscount` because it is injected.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A **singleton** service has a **scoped** `AppDbContext` injected into its constructor. What happens in ASP.NET Core (development)?',
      options: ['It works perfectly', 'The app throws "Cannot consume scoped service from singleton" (captive dependency)', 'The DbContext becomes transient', 'The singleton becomes scoped automatically'],
      answer: 1,
      explain: 'A singleton lives forever, so it would capture one DbContext and reuse it across requests and threads. Scope validation detects this "captive dependency" and throws. Fix: make the consumer scoped or create a scope with `IServiceScopeFactory`.',
    },
  ],
};
