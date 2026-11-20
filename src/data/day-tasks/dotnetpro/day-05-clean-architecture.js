export default {
  lesson: 'day-05-clean-architecture',
  minutes: 25,
  intro: 'Practise placing code in the right Clean Architecture layer, the dependency rule, dependency inversion and the dotnet CLI commands that build the solution.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'In the CollegeHub solution, where does the class `CollegeDbContext : DbContext` belong?',
      options: ['Domain', 'Application', 'Infrastructure', 'Api controllers'],
      answer: 2,
      explain: 'DbContext is an EF Core (database) detail, so it lives in Infrastructure. Putting it in Domain or Application would make the core depend on EF Core - exactly what Clean Architecture avoids.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which of these belong in the **Domain** project? Select all that apply.',
      options: [
        '`Course` entity with an `Enroll(studentId)` method that checks seats',
        '`DomainException`',
        '`StudentsController`',
        '`Email` value object (record) that validates its format',
        '`SmtpEmailSender` that sends mail with MailKit',
        '`[Table("Students")]` EF Core attributes and a `DbSet<Student>`',
      ],
      answers: [0, 1, 3],
      explain: 'Domain holds entities, value objects, domain exceptions and business rules - plain C# only. Controllers are presentation, SmtpEmailSender is infrastructure, and EF Core attributes/DbSets are persistence details (configure EF with IEntityTypeConfiguration classes in Infrastructure instead).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`EnrollmentService` (Application) needs to send a confirmation email. What is the Clean Architecture way?',
      options: [
        'Reference the Infrastructure project from Application and call `SmtpEmailSender` directly',
        'Declare `IEmailSender` in Application, implement it in Infrastructure, register the implementation in DI',
        'Send the email from the Domain entity using SmtpClient',
        'Copy the SMTP code into every controller',
      ],
      answer: 1,
      explain: 'Dependency inversion: the layer that needs the service owns the interface, the outer layer implements it, and Program.cs wires them. Application stays testable (use a fake IEmailSender in tests) and you can switch to SendGrid without touching use cases.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the command that makes **CollegeHub.Application** reference **CollegeHub.Domain**:
\`dotnet add src/CollegeHub.Application/CollegeHub.Application.csproj ______ src/CollegeHub.Domain/CollegeHub.Domain.csproj\``,
      example: { title: 'adding a project to the solution', code: 'dotnet sln add src/CollegeHub.Domain/CollegeHub.Domain.csproj' },
      accept: ['reference'],
      explain: '`dotnet add <project> reference <other>` adds a `<ProjectReference>` to the .csproj. `dotnet sln add` only puts a project into the solution - it does not let one project use another\'s types. `dotnet add package` is for NuGet packages.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this Domain code print?',
      example: { title: 'reminder', code: 'Rules are checked in the order they are written inside Enroll().' },
      code: `var course = Course.Create(" db201 ", "SQL Server", capacity: 2);
Console.WriteLine(course.Code);

foreach (int id in new[] { 5, 6, 5, 7 })
{
    try { course.Enroll(id); Console.WriteLine($"{id} ok"); }
    catch (DomainException ex) { Console.WriteLine($"{id} {ex.Message}"); }
}
Console.WriteLine(course.SeatsLeft);

// inside Course:
public static Course Create(string code, string title, int capacity)
{
    if (string.IsNullOrWhiteSpace(code)) throw new DomainException("code required");
    return new Course(code.Trim().ToUpperInvariant(), title, capacity);
}
public void Enroll(int studentId)
{
    if (_studentIds.Contains(studentId)) throw new DomainException("duplicate");
    if (SeatsLeft == 0) throw new DomainException("full");
    _studentIds.Add(studentId);
}`,
      expected: `DB201
5 ok
6 ok
5 duplicate
7 full
0`,
      explain: '`Trim()` removes the spaces and `ToUpperInvariant()` gives DB201. Students 5 and 6 fill both seats. The second 5 hits the duplicate rule first (it is checked before the seat rule). 7 finds no seat. SeatsLeft = 2 - 2 = 0.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which project reference **breaks** the dependency rule?',
      options: [
        'CollegeHub.Api -> CollegeHub.Application',
        'CollegeHub.Infrastructure -> CollegeHub.Application',
        'CollegeHub.Application -> CollegeHub.Infrastructure',
        'CollegeHub.Application -> CollegeHub.Domain',
      ],
      answer: 2,
      explain: 'Dependencies must point inwards. Application is closer to the centre than Infrastructure, so it must not reference it - otherwise the use cases depend on EF Core, SMTP and other technical details.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `In \`Program.cs\` of CollegeHub.Api, complete the line that registers all Infrastructure services (DbContext, repositories) through the layer's extension method:
\`builder.Services.______(builder.Configuration);\``,
      example: { title: 'the Application layer has one too', code: 'builder.Services.AddApplication();' },
      accept: ['AddInfrastructure'],
      caseSensitive: true,
      explain: 'Each layer exposes one `IServiceCollection` extension method, so Program.cs (the composition root) stays short and each layer controls its own registrations. AddInfrastructure takes the configuration because it needs the connection string.',
    },
  ],
};
