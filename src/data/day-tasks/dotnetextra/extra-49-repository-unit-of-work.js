export default {
  lesson: 'extra-49-repository-unit-of-work',
  minutes: 25,
  intro: 'Hide data access behind repositories and commit related changes together with a Unit of Work.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What problem does the **Repository** pattern mainly solve?',
      options: ['It makes SQL run faster', 'It hides data-access details behind an interface so business code and tests do not depend on EF Core/SQL directly', 'It replaces the database', 'It generates controllers automatically'],
      answer: 1,
      explain: 'Services talk to `IStudentRepository` (GetById, Add, Find...) instead of DbContext/SQL, which keeps business logic clean and lets tests use an in-memory fake.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the generic repository interface method that adds an entity:
\`public interface IRepository<T> where T : class\`
\`{ Task<T?> GetByIdAsync(int id); ______ }\``,
      example: { title: 'another member', code: 'Task<IReadOnlyList<T>> ListAsync();' },
      accept: ['Task AddAsync(T entity);', 'Task AddAsync(T entity)', 'void Add(T entity);', 'void Add(T entity)'],
      acceptRegex: ['^(Task|void|ValueTask)\\s+Add(Async)?\\s*\\(\\s*T\\s+\\w+\\s*\\)\\s*;?$'],
      caseSensitive: true,
      explain: 'Using `T` for the parameter makes the interface reusable for every entity (`IRepository<Student>`, `IRepository<Course>`). Note that `Add` only stages the entity; nothing is written to the database until the Unit of Work saves.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A Unit of Work over in-memory fakes. What does this program print?',
      example: { title: 'one commit for several repositories', code: `_uow.Orders.Add(order);
_uow.Stock.Reduce(productId, qty);
await _uow.SaveChangesAsync();   // both or nothing` },
      code: `var uow = new UnitOfWork();
uow.Orders.Add("ORD-1");
uow.Payments.Add("PAY-1");
Console.WriteLine(uow.Database.Count);
Console.WriteLine(uow.SaveChanges());
uow.Orders.Add("ORD-2");
Console.WriteLine(uow.SaveChanges());
Console.WriteLine(string.Join(",", uow.Database));

class Repo
{
    private readonly List<string> _pending;
    public Repo(List<string> pending) { _pending = pending; }
    public void Add(string item) => _pending.Add(item);
}
class UnitOfWork
{
    private readonly List<string> _pending = new();
    public List<string> Database { get; } = new();
    public Repo Orders { get; }
    public Repo Payments { get; }
    public UnitOfWork() { Orders = new Repo(_pending); Payments = new Repo(_pending); }
    public int SaveChanges()
    {
        int n = _pending.Count;
        Database.AddRange(_pending);
        _pending.Clear();
        return n;
    }
}`,
      expected: `0
2
1
ORD-1,PAY-1,ORD-2`,
      explain: 'Both repositories share the unit of work\'s pending list, so adds are only staged (database count 0). `SaveChanges` commits both (returns 2) together. The next save commits the single new order. EF Core\'s DbContext behaves the same way: `SaveChanges` writes all tracked changes in one transaction.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why should repositories **not** call `SaveChanges()` inside their own `Add` method?',
      options: ['SaveChanges is slow', 'Because then an order and its payment could be saved separately; the Unit of Work must commit related changes together', 'Repositories cannot access DbContext', 'It is a compile error'],
      answer: 1,
      explain: 'If each repository saved immediately, a failure after the first save would leave half-finished data (order saved, payment not). A single `SaveChangesAsync()` on the Unit of Work keeps the operation atomic.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Register the unit of work with the **same lifetime as DbContext** (one per request):
\`builder.Services.______<IUnitOfWork, UnitOfWork>();\``,
      example: { title: 'repository registration', code: 'builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));' },
      accept: ['AddScoped'],
      caseSensitive: true,
      explain: 'The Unit of Work wraps the scoped `AppDbContext`, so it must be scoped too. All repositories resolved in the same request then share one DbContext and one transaction.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? Select all that apply.',
      options: ['EF Core\'s `DbSet<T>` is already a repository and `DbContext` already a unit of work', 'A generic repository returning `IQueryable<T>` leaks EF details to callers', 'Specific methods like `GetTopCustomersAsync(int n)` make intent clearer than exposing raw queries', 'The pattern is mandatory to use EF Core', 'Repositories make unit testing services easier by allowing fakes/mocks'],
      answers: [0, 1, 2, 4],
      explain: 'Many teams wrap EF Core for testability and clear intent, while others use DbContext directly because it already implements both patterns. Returning `IQueryable` lets callers build arbitrary queries, defeating the abstraction. The pattern is optional.',
    },
  ],
};
