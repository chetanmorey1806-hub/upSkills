export default {
  lesson: 'day-06-repository-unit-of-work-dtos-automapper',
  minutes: 25,
  intro: 'Practise repositories and the Unit of Work, designing safe DTOs, and AutoMapper profiles with ForMember, flattening and ProjectTo.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'Enrolling a student inserts an `Enrollment` row AND updates the student\'s `Credits`. What guarantees both are saved together or not at all?',
      options: [
        'Calling SaveChanges inside each repository method',
        'One `IUnitOfWork.SaveChangesAsync()` call over a shared DbContext',
        'Registering repositories as Singleton',
        'Returning DTOs instead of entities',
      ],
      answer: 1,
      explain: 'The Unit of Work collects the changes from all repositories and commits them in one transaction. If every repository called SaveChanges itself, the first change could be saved and the second could fail, leaving inconsistent data.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Using the `UnitOfWork` from the lesson (repositories only collect pending changes; `SaveChanges` validates all enrollments first and throws `InvalidOperationException` if a course code is empty, otherwise copies everything to the database and returns the count), what does this print?',
      example: { title: 'remember', code: 'Repository.Add -> pending only\nSaveChanges    -> validate all, then save all (or nothing)' },
      code: `var db = new FakeDatabase();
var uow = new UnitOfWork(db);
uow.Students.Add(new Student(1, "Asha"));
uow.Students.Add(new Student(2, "Ravi"));
uow.Enrollments.Add(new Enrollment(1, "CS101"));
Console.WriteLine(db.Students.Count);
Console.WriteLine(uow.SaveChanges());

uow.Enrollments.Add(new Enrollment(2, ""));
uow.Students.Add(new Student(3, "Neha"));
try { uow.SaveChanges(); }
catch (InvalidOperationException) { Console.WriteLine("rolled back"); }
Console.WriteLine($"{db.Students.Count} {db.Enrollments.Count}");`,
      expected: `0
3
rolled back
2 1`,
      explain: 'Before SaveChanges nothing is in the database (0). The first commit saves 2 students + 1 enrollment = 3. In the second batch the enrollment has no course code, so validation fails BEFORE anything is written: Neha is not saved either. The database still has 2 students and 1 enrollment.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Why should `GET /api/students` return a `StudentDto` instead of the EF Core `Student` entity? Select all that apply.',
      options: [
        'The entity may contain sensitive fields such as PasswordHash',
        'Navigation properties can cause JSON reference cycles or extra lazy-loading queries',
        'The API contract would change every time the database schema changes',
        'Entities cannot be serialised to JSON at all',
        'DTOs make the SQL query run without an index',
      ],
      answers: [0, 1, 2],
      explain: 'DTOs give a minimal, stable and safe contract. Entities CAN be serialised (that is the danger), and DTOs have nothing to do with indexes. Also use request DTOs on input to prevent over-posting.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the query so AutoMapper turns the mapping into a SQL \`SELECT\` of only the DTO columns:
\`var list = await db.Courses.______<CourseDto>(mapper.ConfigurationProvider).ToListAsync();\``,
      example: { title: 'the Mapster equivalent', code: 'var list = await db.Courses.ProjectToType<CourseDto>().ToListAsync();' },
      accept: ['ProjectTo'],
      caseSensitive: true,
      explain: '`ProjectTo` works on `IQueryable` and builds a `Select` expression, so EF Core fetches only the needed columns (and computes counts in SQL) - no Include and no tracking needed. `mapper.Map` would require loading full entities first.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `In the profile for \`CreateMap<CreateCourseRequest, Course>()\`, tell AutoMapper to leave the database-generated \`Id\` alone:
\`.ForMember(d => d.Id, o => o.______())\``,
      example: { title: 'a computed value', code: '.ForMember(d => d.EnrolledCount, o => o.MapFrom(s => s.Enrollments.Count))' },
      accept: ['Ignore'],
      caseSensitive: true,
      explain: '`Ignore()` skips the property, and also satisfies `AssertConfigurationIsValid`, which otherwise reports `Id` as an unmapped destination member. The database (IDENTITY) sets Id when SaveChanges runs.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`CourseDto` has a property `DepartmentName`. The `Course` entity has `Department` (with a `Name` property). With no `ForMember`, what does AutoMapper do?',
      options: [
        'Throws because the names do not match',
        'Leaves DepartmentName null',
        'Fills DepartmentName from Department.Name (flattening)',
        'Copies the whole Department object into DepartmentName',
      ],
      answer: 2,
      explain: 'Flattening splits the destination name by PascalCase: Department + Name, and follows that path on the source. This convention removes a lot of ForMember code - but renaming Department would silently break it, which is why configuration tests matter.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A developer registered the DbContext as Scoped but `CourseRepository` as **Singleton**. What goes wrong?',
      options: [
        'Nothing, it is faster',
        'The singleton captures one DbContext forever: it is shared across requests and threads (and DI validation reports a captive dependency)',
        'AutoMapper stops working',
        'Only the first request can read data',
      ],
      answer: 1,
      explain: 'A singleton that depends on a scoped service is a "captive dependency". DbContext is not thread-safe and would keep tracking entities forever. In Development ASP.NET Core throws "Cannot consume scoped service ... from singleton". Register repositories, Unit of Work and DbContext as Scoped.',
    },
  ],
};
