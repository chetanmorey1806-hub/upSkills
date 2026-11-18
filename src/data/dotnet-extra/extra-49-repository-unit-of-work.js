export default {
  id: 'extra-49-repository-unit-of-work',
  title: 'Repository and Unit of Work Patterns',
  module: 'Extra: ASP.NET Core, EF Core & Web API',
  extraNo: 49,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Separate data access from business logic with the Repository pattern (generic and specific repositories) and coordinate several repositories in one transaction with the Unit of Work pattern on top of EF Core. Includes full Web API code, DI registration, unit testing with Moq, and an honest discussion of when NOT to add these layers.',
  objectives: [
    'Explain the Repository pattern and the Unit of Work pattern with real-world analogies',
    'Implement IGenericRepository<T>, a specific IProductRepository and IUnitOfWork over EF Core',
    'Use the Unit of Work to save an order and a stock update atomically',
    'Register repositories with the correct DI lifetime and unit test a service with Moq',
    'Discuss the trade-offs: EF Core DbContext already is a Unit of Work and DbSet already is a repository',
  ],
  theory: [
    {
      heading: 'The Repository pattern',
      content: 'A repository is a class that hides HOW data is stored and offers collection-like methods: GetByIdAsync, GetAllAsync, AddAsync, Update, Remove, plus meaningful queries like GetLowStockAsync. Controllers and services talk to the interface (IProductRepository), not to SQL or DbContext. Analogy: a library counter. You ask the librarian for "books by author X"; you do not walk into the store room and search the shelves yourself. If the library moves the store room, you still use the same counter.',
      points: [
        'Generic repository: IGenericRepository<T> with common CRUD for all entities - less repeated code.',
        'Specific repository: IProductRepository : IGenericRepository<Product> adds business queries for one aggregate.',
        'Return domain objects or DTOs, not IQueryable, if you want to keep EF details out of the service layer.',
        'Benefits: single place for queries, easier unit testing (mock the interface), possible to swap data source.',
      ],
    },
    {
      heading: 'The Unit of Work pattern',
      content: 'A business operation often changes several tables: placing an order inserts into Orders and OrderItems and decreases Products.Stock. These changes must succeed or fail TOGETHER. The Unit of Work keeps track of all changes made through its repositories and writes them in ONE transaction when you call SaveChangesAsync / CompleteAsync. If you never call it (or an exception happens), nothing is saved. Analogy: a shopping cart - you put many items in, but pay once at the counter; if the payment fails, you take nothing home.',
      syntax: `public interface IUnitOfWork : IDisposable
{
    IProductRepository Products { get; }
    IGenericRepository<Order> Orders { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}`,
      tip: 'Repositories should NOT call SaveChanges themselves. Only the Unit of Work commits, otherwise half an operation may be saved.',
    },
    {
      heading: 'How this maps to EF Core',
      content: 'EF Core already implements both patterns: DbSet<T> behaves like a repository and DbContext is a Unit of Work (its change tracker records every Add/Update/Remove and SaveChanges runs them in one transaction). Our classes are thin wrappers: GenericRepository<T> uses context.Set<T>(), and UnitOfWork exposes repositories that all share the SAME scoped AppDbContext instance. Because they share one context, one SaveChangesAsync saves everything atomically.',
      points: [
        'Register AppDbContext, repositories and UnitOfWork as SCOPED (one per HTTP request).',
        'All repositories inside one UnitOfWork must receive the same DbContext instance.',
        'For multiple SaveChanges calls in one operation use await context.Database.BeginTransactionAsync().',
      ],
    },
    {
      heading: 'Testing with repositories',
      content: 'Because services depend on interfaces, unit tests can replace them with fakes or mocks (Moq, NSubstitute). The test checks business rules (e.g. "cannot order more than stock") without a database. Integration tests (Day 115) then check the real EF Core repositories against SQL Server or SQLite.',
      syntax: `var uow = new Mock<IUnitOfWork>();
uow.Setup(u => u.Products.GetByIdAsync(1)).ReturnsAsync(new Product { Id = 1, Stock = 2 });
var service = new OrderService(uow.Object);
await Assert.ThrowsAsync<InvalidOperationException>(() => service.PlaceOrderAsync(1, 5));
uow.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);`,
    },
    {
      heading: 'When to use (and not use) these patterns',
      content: 'The patterns add files and indirection. Many modern teams use DbContext directly in services for simple CRUD apps and use repositories only for complex domains (DDD aggregates) or when data comes from several sources. A common anti-pattern is a generic repository that returns IQueryable<T> everywhere - EF leaks out anyway and nothing is gained. Choose consistently per project and explain the choice in interviews.',
      points: [
        'Good fit: large teams, complex business rules, many unit tests, multiple data sources (SQL + API + cache).',
        'Overkill: small CRUD apps, Minimal API prototypes, reporting queries (use projections directly).',
        'Specification pattern (e.g. Ardalis.Specification) is an alternative for reusable query logic.',
      ],
    },
  ],
  examples: [
    {
      title: 'Generic repository, product repository and Unit of Work with EF Core',
      scenario: 'Build the data layer of an Inventory API: generic CRUD for all entities, a specific low-stock query, and a Unit of Work that saves an order and the stock change together.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web API; name InventoryApi; .NET 8/10; Use controllers ticked > Create',
        'Package Manager Console: Install-Package Microsoft.EntityFrameworkCore.SqlServer; Install-Package Microsoft.EntityFrameworkCore.Tools',
        'Create folders Models, Data, Repositories, Services and add the files below',
        'Add "ConnectionStrings": { "Default": "Server=(localdb)\\\\MSSQLLocalDB;Database=InventoryDb;Trusted_Connection=True;TrustServerCertificate=True" } to appsettings.json',
        'Run Add-Migration Init and Update-Database; press F5 and test in Swagger',
      ],
      code: `// Models/Entities.cs
namespace InventoryApi.Models;
public abstract class BaseEntity { public int Id { get; set; } }
public class Product : BaseEntity
{
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}
public class Order : BaseEntity
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Total { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Product? Product { get; set; }
}

// Data/AppDbContext.cs
using InventoryApi.Models;
using Microsoft.EntityFrameworkCore;
namespace InventoryApi.Data;
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Product>().Property(p => p.Price).HasPrecision(18, 2);
        mb.Entity<Order>().Property(o => o.Total).HasPrecision(18, 2);
        mb.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Pen", Price = 10, Stock = 100 },
            new Product { Id = 2, Name = "Notebook", Price = 60, Stock = 3 });
    }
}

// Repositories/IGenericRepository.cs
using System.Linq.Expressions;
using InventoryApi.Models;
namespace InventoryApi.Repositories;
public interface IGenericRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(int id);
    Task<IReadOnlyList<T>> GetAllAsync();
    Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate);
    Task AddAsync(T entity);
    void Update(T entity);
    void Remove(T entity);
}

// Repositories/GenericRepository.cs
using System.Linq.Expressions;
using InventoryApi.Data;
using InventoryApi.Models;
using Microsoft.EntityFrameworkCore;
namespace InventoryApi.Repositories;
public class GenericRepository<T>(AppDbContext context) : IGenericRepository<T> where T : BaseEntity
{
    protected readonly AppDbContext Context = context;
    protected DbSet<T> Set => Context.Set<T>();

    public async Task<T?> GetByIdAsync(int id) => await Set.FindAsync(id);
    public async Task<IReadOnlyList<T>> GetAllAsync() => await Set.AsNoTracking().ToListAsync();
    public async Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate) =>
        await Set.AsNoTracking().Where(predicate).ToListAsync();
    public async Task AddAsync(T entity) => await Set.AddAsync(entity);
    public void Update(T entity) => Set.Update(entity);
    public void Remove(T entity) => Set.Remove(entity);
}

// Repositories/ProductRepository.cs
using InventoryApi.Data;
using InventoryApi.Models;
using Microsoft.EntityFrameworkCore;
namespace InventoryApi.Repositories;
public interface IProductRepository : IGenericRepository<Product>
{
    Task<IReadOnlyList<Product>> GetLowStockAsync(int threshold);
}
public class ProductRepository(AppDbContext context) : GenericRepository<Product>(context), IProductRepository
{
    public async Task<IReadOnlyList<Product>> GetLowStockAsync(int threshold) =>
        await Set.AsNoTracking().Where(p => p.Stock < threshold).OrderBy(p => p.Stock).ToListAsync();
}

// Data/UnitOfWork.cs
using InventoryApi.Models;
using InventoryApi.Repositories;
namespace InventoryApi.Data;
public interface IUnitOfWork : IDisposable
{
    IProductRepository Products { get; }
    IGenericRepository<Order> Orders { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
public class UnitOfWork(AppDbContext context) : IUnitOfWork
{
    private IProductRepository? _products;
    private IGenericRepository<Order>? _orders;

    // all repositories share the SAME DbContext
    public IProductRepository Products => _products ??= new ProductRepository(context);
    public IGenericRepository<Order> Orders => _orders ??= new GenericRepository<Order>(context);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => context.SaveChangesAsync(ct);
    public void Dispose() => context.Dispose();
}

// Services/OrderService.cs
using InventoryApi.Data;
using InventoryApi.Models;
namespace InventoryApi.Services;
public record PlaceOrderDto(int ProductId, int Quantity);
public class OrderService(IUnitOfWork uow)
{
    public async Task<Order> PlaceOrderAsync(PlaceOrderDto dto, CancellationToken ct = default)
    {
        var product = await uow.Products.GetByIdAsync(dto.ProductId)
            ?? throw new KeyNotFoundException($"Product {dto.ProductId} not found");
        if (dto.Quantity <= 0 || dto.Quantity > product.Stock)
            throw new InvalidOperationException($"Only {product.Stock} {product.Name} in stock");

        product.Stock -= dto.Quantity;                         // tracked change
        var order = new Order { ProductId = product.Id, Quantity = dto.Quantity, Total = product.Price * dto.Quantity };
        await uow.Orders.AddAsync(order);                      // tracked insert

        await uow.SaveChangesAsync(ct);                        // ONE transaction: UPDATE + INSERT
        return order;
    }
}

// Controllers/OrdersController.cs
using InventoryApi.Data;
using InventoryApi.Services;
using Microsoft.AspNetCore.Mvc;
namespace InventoryApi.Controllers;
[ApiController]
[Route("api/[controller]")]
public class OrdersController(OrderService service, IUnitOfWork uow) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Place(PlaceOrderDto dto, CancellationToken ct)
    {
        try
        {
            var order = await service.PlaceOrderAsync(dto, ct);
            return Created($"/api/orders/{order.Id}", new { order.Id, order.ProductId, order.Quantity, order.Total });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("/api/products/low-stock")]
    public async Task<IActionResult> LowStock(int threshold = 5) =>
        Ok(await uow.Products.GetLowStockAsync(threshold));
}

// Program.cs
using InventoryApi.Data;
using InventoryApi.Repositories;
using InventoryApi.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));  // open generic
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<OrderService>();

var app = builder.Build();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseHttpsRedirection();
app.MapControllers();
app.Run();`,
      result: `POST /api/orders   {"productId":1,"quantity":4}
201 Created  Location: /api/orders/1
{"id":1,"productId":1,"quantity":4,"total":40}

SQL Server Profiler / EF log shows ONE transaction:
  BEGIN TRANSACTION
  UPDATE [Products] SET [Stock] = 96 WHERE [Id] = 1
  INSERT INTO [Orders] ([CreatedAt],[ProductId],[Quantity],[Total]) OUTPUT INSERTED.[Id] VALUES (...)
  COMMIT

POST /api/orders   {"productId":2,"quantity":5}
400 Bad Request  {"message":"Only 3 Notebook in stock"}     (nothing saved)

GET /api/products/low-stock?threshold=5
200 [{"id":2,"name":"Notebook","price":60,"stock":3}]`,
      explanation: 'OrderService knows nothing about EF Core: it uses IUnitOfWork, so it can be unit tested with mocks. Both repositories share the scoped AppDbContext, so the stock change and the new order are tracked by the same change tracker and written by one SaveChangesAsync inside one transaction. When the rule fails, SaveChangesAsync is never called and the database stays unchanged. The open-generic registration lets any service ask for IGenericRepository<Customer> without extra code. The exact SQL text varies slightly between EF Core versions.',
    },
    {
      title: 'Unit testing OrderService with Moq (no database)',
      scenario: 'Prove the business rules: an order larger than stock is rejected and nothing is saved; a valid order calls SaveChangesAsync exactly once.',
      steps: [
        'Right-click the solution > Add > New Project > xUnit Test Project; name InventoryApi.Tests',
        'Right-click InventoryApi.Tests > Add > Project Reference > tick InventoryApi',
        'Package Manager Console (Default project: InventoryApi.Tests): Install-Package Moq',
        'Add OrderServiceTests.cs; open Test > Test Explorer (Ctrl+E, T) and click Run All',
      ],
      code: `using InventoryApi.Data;
using InventoryApi.Models;
using InventoryApi.Repositories;
using InventoryApi.Services;
using Moq;
using Xunit;

public class OrderServiceTests
{
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IProductRepository> _products = new();
    private readonly Mock<IGenericRepository<Order>> _orders = new();

    public OrderServiceTests()
    {
        _uow.Setup(u => u.Products).Returns(_products.Object);
        _uow.Setup(u => u.Orders).Returns(_orders.Object);
    }

    [Fact]
    public async Task PlaceOrder_MoreThanStock_Throws_AndDoesNotSave()
    {
        _products.Setup(r => r.GetByIdAsync(2))
                 .ReturnsAsync(new Product { Id = 2, Name = "Notebook", Price = 60, Stock = 3 });
        var service = new OrderService(_uow.Object);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.PlaceOrderAsync(new PlaceOrderDto(2, 5)));

        Assert.Equal("Only 3 Notebook in stock", ex.Message);
        _uow.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task PlaceOrder_Valid_ReducesStock_AddsOrder_SavesOnce()
    {
        var pen = new Product { Id = 1, Name = "Pen", Price = 10, Stock = 100 };
        _products.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(pen);
        var service = new OrderService(_uow.Object);

        var order = await service.PlaceOrderAsync(new PlaceOrderDto(1, 4));

        Assert.Equal(96, pen.Stock);
        Assert.Equal(40m, order.Total);
        _orders.Verify(r => r.AddAsync(It.Is<Order>(o => o.Quantity == 4)), Times.Once);
        _uow.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task PlaceOrder_UnknownProduct_ThrowsKeyNotFound()
    {
        _products.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Product?)null);
        var service = new OrderService(_uow.Object);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.PlaceOrderAsync(new PlaceOrderDto(99, 1)));
    }
}`,
      result: `Test Explorer:
  OrderServiceTests (3 tests)  Passed
    PlaceOrder_MoreThanStock_Throws_AndDoesNotSave        Passed  < 1 ms
    PlaceOrder_UnknownProduct_ThrowsKeyNotFound          Passed  < 1 ms
    PlaceOrder_Valid_ReducesStock_AddsOrder_SavesOnce    Passed  12 ms
Total: 3, Passed: 3, Failed: 0`,
      explanation: 'Moq creates fake implementations of the interfaces. Setup tells the fake what to return, Verify checks how it was called. Because OrderService only depends on IUnitOfWork, these tests run in milliseconds with no SQL Server. Times.Never proves that a failed rule does not save anything - the core promise of the Unit of Work. Durations are examples.',
    },
    {
      title: 'Console simulation: a generic in-memory repository',
      scenario: 'Write one generic repository class and reuse it for Students and Products - the heart of the generic repository idea.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it GenericRepositoryDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Linq;

IRepository<Student> students = new InMemoryRepository<Student>();
students.Add(new Student { Name = "Asha", Marks = 82 });
students.Add(new Student { Name = "Ravi", Marks = 45 });
students.Add(new Student { Name = "Meena", Marks = 91 });

Console.WriteLine("All: " + string.Join(", ", students.GetAll().Select(s => s.Id + ":" + s.Name)));
Console.WriteLine("Passed (>=60): " + string.Join(", ", students.Find(s => s.Marks >= 60).Select(s => s.Name)));
var ravi = students.GetById(2);
Console.WriteLine("GetById(2): " + ravi?.Name + " (" + ravi?.Marks + ")");
Console.WriteLine("Remove(2): " + students.Remove(2));
Console.WriteLine("Remove(9): " + students.Remove(9));
Console.WriteLine("Count after remove: " + students.GetAll().Count);

IRepository<Product> products = new InMemoryRepository<Product>();
products.Add(new Product { Name = "Pen", Stock = 100 });
products.Add(new Product { Name = "Book", Stock = 3 });
Console.WriteLine("Products: " + string.Join(", ", products.GetAll().Select(p => p.Id + ":" + p.Name)));
Console.WriteLine("Low stock: " + string.Join(", ", products.Find(p => p.Stock < 5).Select(p => p.Name)));

abstract class BaseEntity { public int Id { get; set; } }
class Student : BaseEntity { public string Name { get; set; } = ""; public int Marks { get; set; } }
class Product : BaseEntity { public string Name { get; set; } = ""; public int Stock { get; set; } }

interface IRepository<T> where T : BaseEntity
{
    void Add(T entity);
    T? GetById(int id);
    IReadOnlyList<T> GetAll();
    IReadOnlyList<T> Find(Func<T, bool> predicate);
    bool Remove(int id);
}

class InMemoryRepository<T> : IRepository<T> where T : BaseEntity
{
    private readonly List<T> _items = new();
    private int _nextId = 1;

    public void Add(T entity) { entity.Id = _nextId++; _items.Add(entity); }
    public T? GetById(int id) => _items.FirstOrDefault(x => x.Id == id);
    public IReadOnlyList<T> GetAll() => _items.ToList();
    public IReadOnlyList<T> Find(Func<T, bool> predicate) => _items.Where(predicate).ToList();
    public bool Remove(int id) => _items.RemoveAll(x => x.Id == id) > 0;
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Linq;

IRepository<Student> students = new InMemoryRepository<Student>();
students.Add(new Student { Name = "Asha", Marks = 82 });
students.Add(new Student { Name = "Ravi", Marks = 45 });
students.Add(new Student { Name = "Meena", Marks = 91 });

Console.WriteLine("All: " + string.Join(", ", students.GetAll().Select(s => s.Id + ":" + s.Name)));
Console.WriteLine("Passed (>=60): " + string.Join(", ", students.Find(s => s.Marks >= 60).Select(s => s.Name)));
var ravi = students.GetById(2);
Console.WriteLine("GetById(2): " + ravi?.Name + " (" + ravi?.Marks + ")");
Console.WriteLine("Remove(2): " + students.Remove(2));
Console.WriteLine("Remove(9): " + students.Remove(9));
Console.WriteLine("Count after remove: " + students.GetAll().Count);

IRepository<Product> products = new InMemoryRepository<Product>();
products.Add(new Product { Name = "Pen", Stock = 100 });
products.Add(new Product { Name = "Book", Stock = 3 });
Console.WriteLine("Products: " + string.Join(", ", products.GetAll().Select(p => p.Id + ":" + p.Name)));
Console.WriteLine("Low stock: " + string.Join(", ", products.Find(p => p.Stock < 5).Select(p => p.Name)));

abstract class BaseEntity { public int Id { get; set; } }
class Student : BaseEntity { public string Name { get; set; } = ""; public int Marks { get; set; } }
class Product : BaseEntity { public string Name { get; set; } = ""; public int Stock { get; set; } }

interface IRepository<T> where T : BaseEntity
{
    void Add(T entity);
    T? GetById(int id);
    IReadOnlyList<T> GetAll();
    IReadOnlyList<T> Find(Func<T, bool> predicate);
    bool Remove(int id);
}

class InMemoryRepository<T> : IRepository<T> where T : BaseEntity
{
    private readonly List<T> _items = new();
    private int _nextId = 1;

    public void Add(T entity) { entity.Id = _nextId++; _items.Add(entity); }
    public T? GetById(int id) => _items.FirstOrDefault(x => x.Id == id);
    public IReadOnlyList<T> GetAll() => _items.ToList();
    public IReadOnlyList<T> Find(Func<T, bool> predicate) => _items.Where(predicate).ToList();
    public bool Remove(int id) => _items.RemoveAll(x => x.Id == id) > 0;
}
`,
        },
        stdin: '',
      },
      result: `All: 1:Asha, 2:Ravi, 3:Meena
Passed (>=60): Asha, Meena
GetById(2): Ravi (45)
Remove(2): True
Remove(9): False
Count after remove: 2
Products: 1:Pen, 2:Book
Low stock: Book`,
      explanation: 'The constraint where T : BaseEntity lets the generic class read and set Id for ANY entity. Each repository instance has its own list and id counter, so Products start again at 1. Remove returns True only if something was deleted (RemoveAll count > 0). The caller only sees IRepository<T>, so the in-memory class could be replaced by an EF Core one without changing the calling code.',
    },
    {
      title: 'Console simulation: Unit of Work - all or nothing',
      scenario: 'Place three orders. Each order stages an INSERT and a stock UPDATE; only a successful business rule commits both. A failed order leaves the "database" untouched.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it UnitOfWorkDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Linq;

var db = new FakeDatabase();
db.Products.Add(new Product(1, "Pen", 10));
db.Products.Add(new Product(2, "Book", 2));

var service = new OrderService(() => new UnitOfWork(db));
service.PlaceOrder(1, 3);
service.PlaceOrder(2, 5);
service.PlaceOrder(1, 4);
db.Print();

record Product(int Id, string Name, int Stock);
record Order(int Id, int ProductId, int Qty);

class FakeDatabase
{
    public List<Product> Products { get; } = new();
    public List<Order> Orders { get; } = new();
    public void Print()
    {
        Console.WriteLine("-- Database --");
        foreach (var p in Products) Console.WriteLine("Product " + p.Id + " " + p.Name + " stock=" + p.Stock);
        foreach (var o in Orders) Console.WriteLine("Order " + o.Id + ": product " + o.ProductId + " x" + o.Qty);
    }
}

class ProductRepository(FakeDatabase db, List<Action> pending)
{
    public Product? GetById(int id) => db.Products.FirstOrDefault(p => p.Id == id);
    public void Update(Product p) => pending.Add(() =>
    {
        int i = db.Products.FindIndex(x => x.Id == p.Id);
        db.Products[i] = p;
    });
}

class OrderRepository(FakeDatabase db, List<Action> pending)
{
    public void Add(Order o) => pending.Add(() => db.Orders.Add(o));
}

class UnitOfWork(FakeDatabase db) : IDisposable
{
    private readonly List<Action> _pending = new();
    public ProductRepository Products => new(db, _pending);
    public OrderRepository Orders => new(db, _pending);

    public int SaveChanges()
    {
        foreach (var change in _pending) change();
        int count = _pending.Count;
        _pending.Clear();
        return count;
    }

    public void Dispose()
    {
        if (_pending.Count > 0)
            Console.WriteLine("   UnitOfWork disposed: " + _pending.Count + " pending change(s) discarded");
    }
}

class OrderService(Func<UnitOfWork> createUow)
{
    private int _nextOrderId = 101;

    public void PlaceOrder(int productId, int qty)
    {
        using var uow = createUow();
        Console.WriteLine("PlaceOrder(product " + productId + ", qty " + qty + ")");
        uow.Orders.Add(new Order(_nextOrderId, productId, qty));     // staged
        var p = uow.Products.GetById(productId)!;
        if (p.Stock < qty)
        {
            Console.WriteLine("   FAILED: only " + p.Stock + " " + p.Name + " in stock");
            return;                                                  // SaveChanges never called
        }
        uow.Products.Update(p with { Stock = p.Stock - qty });       // staged
        int changes = uow.SaveChanges();
        Console.WriteLine("   OK: order " + _nextOrderId + " saved, " + changes + " changes committed");
        _nextOrderId++;
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Linq;

var db = new FakeDatabase();
db.Products.Add(new Product(1, "Pen", 10));
db.Products.Add(new Product(2, "Book", 2));

var service = new OrderService(() => new UnitOfWork(db));
service.PlaceOrder(1, 3);
service.PlaceOrder(2, 5);
service.PlaceOrder(1, 4);
db.Print();

record Product(int Id, string Name, int Stock);
record Order(int Id, int ProductId, int Qty);

class FakeDatabase
{
    public List<Product> Products { get; } = new();
    public List<Order> Orders { get; } = new();
    public void Print()
    {
        Console.WriteLine("-- Database --");
        foreach (var p in Products) Console.WriteLine("Product " + p.Id + " " + p.Name + " stock=" + p.Stock);
        foreach (var o in Orders) Console.WriteLine("Order " + o.Id + ": product " + o.ProductId + " x" + o.Qty);
    }
}

class ProductRepository(FakeDatabase db, List<Action> pending)
{
    public Product? GetById(int id) => db.Products.FirstOrDefault(p => p.Id == id);
    public void Update(Product p) => pending.Add(() =>
    {
        int i = db.Products.FindIndex(x => x.Id == p.Id);
        db.Products[i] = p;
    });
}

class OrderRepository(FakeDatabase db, List<Action> pending)
{
    public void Add(Order o) => pending.Add(() => db.Orders.Add(o));
}

class UnitOfWork(FakeDatabase db) : IDisposable
{
    private readonly List<Action> _pending = new();
    public ProductRepository Products => new(db, _pending);
    public OrderRepository Orders => new(db, _pending);

    public int SaveChanges()
    {
        foreach (var change in _pending) change();
        int count = _pending.Count;
        _pending.Clear();
        return count;
    }

    public void Dispose()
    {
        if (_pending.Count > 0)
            Console.WriteLine("   UnitOfWork disposed: " + _pending.Count + " pending change(s) discarded");
    }
}

class OrderService(Func<UnitOfWork> createUow)
{
    private int _nextOrderId = 101;

    public void PlaceOrder(int productId, int qty)
    {
        using var uow = createUow();
        Console.WriteLine("PlaceOrder(product " + productId + ", qty " + qty + ")");
        uow.Orders.Add(new Order(_nextOrderId, productId, qty));     // staged
        var p = uow.Products.GetById(productId)!;
        if (p.Stock < qty)
        {
            Console.WriteLine("   FAILED: only " + p.Stock + " " + p.Name + " in stock");
            return;                                                  // SaveChanges never called
        }
        uow.Products.Update(p with { Stock = p.Stock - qty });       // staged
        int changes = uow.SaveChanges();
        Console.WriteLine("   OK: order " + _nextOrderId + " saved, " + changes + " changes committed");
        _nextOrderId++;
    }
}
`,
        },
        stdin: '',
      },
      result: `PlaceOrder(product 1, qty 3)
   OK: order 101 saved, 2 changes committed
PlaceOrder(product 2, qty 5)
   FAILED: only 2 Book in stock
   UnitOfWork disposed: 1 pending change(s) discarded
PlaceOrder(product 1, qty 4)
   OK: order 102 saved, 2 changes committed
-- Database --
Product 1 Pen stock=3
Product 2 Book stock=2
Order 101: product 1 x3
Order 102: product 1 x4`,
      explanation: 'Repositories only STAGE changes into the shared pending list (like EF Core\'s change tracker). The second order had already staged its INSERT, but the stock rule failed, so SaveChanges was never called and Dispose discarded the change - no orphan order without a stock update. Pen goes 10 -> 7 -> 3. This is exactly why repositories must not save on their own.',
    },
  ],
  interview: [
    { q: 'What is the Repository pattern?', a: 'An abstraction that mediates between business logic and data storage, exposing collection-like methods (Get, Add, Remove, queries) and hiding persistence details behind an interface.', level: 'Easy' },
    { q: 'What is the Unit of Work pattern?', a: 'It tracks changes made during a business transaction across multiple repositories and commits them together in one atomic operation (or discards them all).', level: 'Easy' },
    { q: 'Is EF Core DbContext already a Unit of Work?', a: 'Yes. DbContext tracks changes and SaveChanges writes them in a single transaction; DbSet<T> acts like a repository. Custom UoW/repositories are thin wrappers that add abstraction and testability.', level: 'Medium' },
    { q: 'Generic vs specific repository?', a: 'A generic repository (IGenericRepository<T>) implements common CRUD for all entities. A specific repository (IProductRepository) extends it with domain-specific queries like GetLowStockAsync.', level: 'Easy' },
    { q: 'Why should repositories not call SaveChanges?', a: 'Because one business operation may involve several repositories; if each saves independently, a failure halfway leaves inconsistent data. Only the Unit of Work commits.', level: 'Medium' },
    { q: 'Which DI lifetime should repositories and UnitOfWork have?', a: 'Scoped - same as DbContext, so all of them share one context per HTTP request.', level: 'Medium' },
    { q: 'How do you register a generic repository for all entity types?', a: 'builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>)); - an open generic registration.', level: 'Medium' },
    { q: 'Why is returning IQueryable<T> from a repository debated?', a: 'It leaks EF Core query semantics to callers (deferred execution, provider-specific translation), making the abstraction leaky and hard to mock. Returning materialized lists or using specifications keeps the boundary clean.', level: 'Hard' },
    { q: 'How do repositories help unit testing?', a: 'Services depend on interfaces, so tests can inject mocks/fakes (Moq) and verify business rules without a database.', level: 'Easy' },
    { q: 'When would you skip these patterns?', a: 'Small CRUD apps or prototypes where DbContext in services is simpler, and reporting queries where direct projections are clearer and faster.', level: 'Medium' },
    { q: 'Output question: a UoW stages 2 inserts and 1 update, then an exception occurs before SaveChanges. How many rows change?', a: 'Zero. Staged changes are discarded when the context/UoW is disposed without saving.', level: 'Easy' },
  ],
  practice: [
    { task: 'Add a CustomerRepository with GetByEmailAsync(string email) and expose it on IUnitOfWork.', hint: 'Inherit GenericRepository<Customer> and add the property with ??= in UnitOfWork.', solution: 'public interface ICustomerRepository : IGenericRepository<Customer> { Task<Customer?> GetByEmailAsync(string email); } public class CustomerRepository(AppDbContext c) : GenericRepository<Customer>(c), ICustomerRepository { public Task<Customer?> GetByEmailAsync(string email) => Set.FirstOrDefaultAsync(x => x.Email == email); } In UnitOfWork: public ICustomerRepository Customers => _customers ??= new CustomerRepository(context);' },
    { task: 'Add paging to the generic repository: GetPagedAsync(int page, int pageSize) returning items and total count.', hint: 'Use Skip/Take and CountAsync.', solution: 'public async Task<(IReadOnlyList<T> Items, int Total)> GetPagedAsync(int page, int size) { var q = Set.AsNoTracking().OrderBy(x => x.Id); return (await q.Skip((page - 1) * size).Take(size).ToListAsync(), await q.CountAsync()); }' },
    { task: 'Add BeginTransactionAsync/CommitAsync/RollbackAsync to IUnitOfWork for operations that need two SaveChanges calls.', hint: 'Use context.Database.BeginTransactionAsync() and store the IDbContextTransaction.', solution: 'private IDbContextTransaction? _tx; public async Task BeginTransactionAsync() => _tx = await context.Database.BeginTransactionAsync(); public Task CommitAsync() => _tx!.CommitAsync(); public Task RollbackAsync() => _tx!.RollbackAsync();' },
    { task: 'Write a unit test that verifies GetLowStockAsync is called with threshold 5 by the controller action LowStock().', hint: 'Mock IUnitOfWork and IProductRepository; Verify with It.Is<int>(t => t == 5).', solution: 'products.Setup(p => p.GetLowStockAsync(5)).ReturnsAsync(new List<Product>()); var c = new OrdersController(null!, uow.Object); await c.LowStock(); products.Verify(p => p.GetLowStockAsync(5), Times.Once);' },
    { task: 'Refactor the console UnitOfWork demo so a failed order also prints which staged change was discarded.', hint: 'Store (string Description, Action Apply) tuples instead of Action.', solution: 'List<(string Desc, Action Apply)> pending; Add: pending.Add(("INSERT order " + o.Id, () => db.Orders.Add(o))); Dispose: foreach (var p in _pending) Console.WriteLine("discarded: " + p.Desc);' },
  ],
  quiz: [
    { question: 'Which component should call SaveChangesAsync?', options: ['Every repository method', 'The controller after each repository call', 'The Unit of Work, once per business operation', 'The DbSet'], answer: 2, explanation: 'Only the Unit of Work commits, so the operation is atomic.' },
    { question: 'How do you register IGenericRepository<T> for every T?', options: ['AddScoped<IGenericRepository<>, GenericRepository<>>()', 'AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>))', 'AddSingleton<GenericRepository>()', 'It is not possible'], answer: 1, explanation: 'Open generic types are registered with the typeof overload.' },
    { question: 'Why must all repositories in one Unit of Work share one DbContext?', options: ['So one SaveChanges saves all their tracked changes in one transaction', 'To make queries slower', 'Because DbContext is a singleton', 'It is not required'], answer: 0, explanation: 'Only changes tracked by the same context are saved together.' },
    { question: 'Which EF Core type already behaves like a repository?', options: ['DbContextOptions', 'ModelBuilder', 'Migration', 'DbSet<T>'], answer: 3, explanation: 'DbSet<T> offers Add, Remove, Find and LINQ queries for one entity type.' },
    { question: 'A unit test of OrderService uses Mock<IUnitOfWork>. What is the main advantage?', options: ['It tests SQL Server performance', 'It tests business rules quickly without a database', 'It generates migrations', 'It replaces integration tests completely'], answer: 1, explanation: 'Mocks isolate the business logic; integration tests are still needed for the real data layer.' },
  ],
};
