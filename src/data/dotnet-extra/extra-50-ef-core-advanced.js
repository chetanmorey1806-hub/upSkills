export default {
  id: 'extra-50-ef-core-advanced',
  title: 'EF Core Advanced: Change Tracking, Shadow Properties, Owned Types, Global Query Filters, Concurrency and Seeding',
  module: 'Extra: ASP.NET Core, EF Core & Web API',
  extraNo: 50,
  level: 'Advanced',
  duration: '3.5 hours',
  summary: 'Go beyond basic CRUD in EF Core 8/9/10: how the change tracker decides what SQL to send, shadow properties for audit columns, owned types (value objects such as Address), global query filters for soft delete and multi-tenancy, optimistic concurrency with rowversion and DbUpdateConcurrencyException, and data seeding with HasData and UseSeeding/UseAsyncSeeding.',
  objectives: [
    'Explain entity states (Detached, Added, Unchanged, Modified, Deleted), DetectChanges, AsNoTracking and ChangeTracker.DebugView',
    'Add audit columns as shadow properties and fill them automatically in SaveChangesAsync',
    'Map value objects with OwnsOne / OwnsMany and complex types',
    'Implement soft delete and tenant isolation with HasQueryFilter and bypass it with IgnoreQueryFilters',
    'Handle concurrent edits with [Timestamp]/rowversion, return 409 Conflict, and seed reference data correctly',
  ],
  theory: [
    {
      heading: 'Change tracking and entity states',
      content: 'Every entity a DbContext knows about has an EntityEntry with a State. Detached: not tracked. Added: will be INSERTed. Unchanged: loaded and not modified. Modified: some properties changed, will be UPDATEd (only the changed columns). Deleted: will be DELETEd. When you query, EF stores a SNAPSHOT of original values; DetectChanges (run automatically by SaveChanges, Entry() and some other APIs) compares current values with the snapshot. Analogy: a teacher photographs the answer sheet at the start; at the end she compares to see what you changed.',
      syntax: `var p = await db.Products.FirstAsync(x => x.Id == 1);   // Unchanged
p.Price = 12;                                           // Modified after DetectChanges
db.Entry(p).Property(x => x.Price).IsModified;          // true
db.Products.Add(new Product { Name = "Bag" });          // Added
db.Remove(p);                                           // Deleted
Console.WriteLine(db.ChangeTracker.DebugView.LongView);
await db.SaveChangesAsync();                            // SQL for all, one transaction`,
      points: [
        'AsNoTracking() skips snapshots - faster for read-only queries (lists, reports, GET APIs).',
        'db.Update(entity) marks ALL properties modified (useful for disconnected DTOs); db.Attach(entity) marks it Unchanged.',
        'ChangeTracker.Clear() detaches everything - useful in long-running loops and tests.',
        'Tracking a huge number of entities slows SaveChanges; use ExecuteUpdateAsync / ExecuteDeleteAsync for bulk work.',
      ],
    },
    {
      heading: 'Shadow properties',
      content: 'A shadow property exists in the EF model and in the database table but NOT in your C# class. It is perfect for audit columns (CreatedAt, UpdatedAt, CreatedBy) that you do not want developers to set by hand, and for foreign keys that EF creates automatically. Configure with modelBuilder.Entity<T>().Property<DateTime>("CreatedAt"), set it through ChangeTracker entries, and query it with EF.Property<T>(entity, "Name").',
      syntax: `mb.Entity<Customer>().Property<DateTime>("CreatedAt");
// in SaveChangesAsync override
entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
// query
var recent = db.Customers.OrderByDescending(c => EF.Property<DateTime>(c, "CreatedAt")).Take(5);`,
    },
    {
      heading: 'Owned types and complex types',
      content: 'An owned type is a class without its own identity that belongs to an owner, like Address inside Customer (a "value object" in DDD). OwnsOne stores its properties as columns in the owner\'s table (ShippingAddress_City by default, renameable); OwnsMany stores a collection in a separate table with a foreign key. EF Core 8 added ComplexProperty for value objects that are always loaded/compared by value and never tracked separately.',
      syntax: `mb.Entity<Customer>().OwnsOne(c => c.ShippingAddress, a =>
{
    a.Property(x => x.City).HasColumnName("ShipCity").HasMaxLength(60);
    a.Property(x => x.Pin).HasColumnName("ShipPin").HasMaxLength(6);
});
mb.Entity<Customer>().OwnsMany(c => c.Phones);   // table CustomerPhones`,
      tip: 'Owned types are always loaded with the owner - no Include needed.',
    },
    {
      heading: 'Global query filters: soft delete and multi-tenancy',
      content: 'HasQueryFilter adds a WHERE condition to EVERY query on that entity, including Include navigations. Soft delete: instead of DELETE, set IsDeleted = 1 and filter !IsDeleted, so data can be restored and audited. Multi-tenancy: filter TenantId == current tenant so one company never sees another company\'s rows. A filter can reference a property of the DbContext (e.g. TenantId from an injected service); EF parameterizes it per context instance. Use IgnoreQueryFilters() for admin screens and restores.',
      syntax: `mb.Entity<Product>().HasQueryFilter(p => !p.IsDeleted);
mb.Entity<Customer>().HasQueryFilter(c => !c.IsDeleted && c.TenantId == TenantId);
// EF Core 10: named filters can be ignored one by one
// mb.Entity<Product>().HasQueryFilter("SoftDelete", p => !p.IsDeleted);
// db.Products.IgnoreQueryFilters(["SoftDelete"])`,
      points: [
        'Before EF Core 10, only ONE HasQueryFilter call per entity is kept - combine conditions with &&.',
        'Add an index on IsDeleted / TenantId because every query uses them.',
        'Required navigations to filtered entities can cause missing parents - configure carefully.',
      ],
    },
    {
      heading: 'Optimistic concurrency',
      content: 'Two users open the same product, both change it, both save: without protection the second save silently overwrites the first (the "lost update" problem). With optimistic concurrency, a concurrency token (SQL Server rowversion via [Timestamp] byte[] RowVersion, or [ConcurrencyCheck] on a normal column) is added to the UPDATE: WHERE Id = @id AND RowVersion = @original. If 0 rows are affected, EF throws DbUpdateConcurrencyException. You can then reload, merge, ask the user, or return HTTP 409 Conflict.',
      syntax: `public class Product
{
    public int Id { get; set; }
    public decimal Price { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } = [];   // SQL Server rowversion
}
try { await db.SaveChangesAsync(); }
catch (DbUpdateConcurrencyException ex)
{
    var entry = ex.Entries.Single();
    var databaseValues = await entry.GetDatabaseValuesAsync();   // null = row deleted
}`,
    },
    {
      heading: 'Seeding data',
      content: 'HasData (model seed data) puts fixed reference rows (countries, roles, categories) into migrations: Add-Migration generates InsertData calls and later UpdateData/DeleteData if you change them. Keys must be set explicitly and no navigation objects are allowed. EF Core 9+ adds UseSeeding / UseAsyncSeeding in the options: code that runs during EnsureCreated / Migrate / Update-Database and can contain any logic (check if empty, read a file, create users). For EF Core 8, seed at start-up with a scope after app.Build().',
      syntax: `builder.Services.AddDbContext<ShopDbContext>(o => o
    .UseSqlServer(cs)
    .UseSeeding((ctx, _) => { /* sync version, used by EnsureCreated / Update-Database */ })
    .UseAsyncSeeding(async (ctx, _, ct) =>
    {
        if (!await ctx.Set<Category>().AnyAsync(ct))
        {
            ctx.Set<Category>().AddRange(new Category { Name = "Stationery" }, new Category { Name = "Books" });
            await ctx.SaveChangesAsync(ct);
        }
    }));`,
    },
  ],
  examples: [
    {
      title: 'ShopDbContext with shadow audit columns, owned Address, soft delete + tenant filters, rowversion and seeding',
      scenario: 'A multi-tenant shop API: each company (tenant) sees only its own customers; deletes are soft; CreatedAt/UpdatedAt are automatic; customer addresses are value objects; product edits are protected against lost updates.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web API; name ShopAdvanced; .NET 8/10 > Create',
        'Package Manager Console: Install-Package Microsoft.EntityFrameworkCore.SqlServer; Install-Package Microsoft.EntityFrameworkCore.Tools',
        'Add Models/Entities.cs, Data/TenantProvider.cs, Data/ShopDbContext.cs, Controllers/ProductsController.cs, Controllers/CustomersController.cs and update Program.cs',
        'Run Add-Migration Advanced then Update-Database; open SQL Server Object Explorer (View menu) to see columns ShipCity, CreatedAt, RowVersion',
        'Press F5; send requests with header X-Tenant-Id: acme in Swagger/Postman (or the .http file)',
      ],
      code: `// Models/Entities.cs
using System.ComponentModel.DataAnnotations;
namespace ShopAdvanced.Models;

public interface ISoftDelete { bool IsDeleted { get; set; } }

public class Address                        // owned type: no Id
{
    public string Street { get; set; } = "";
    public string City { get; set; } = "";
    public string Pin { get; set; } = "";
}

public class Customer : ISoftDelete
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string TenantId { get; set; } = "";
    public bool IsDeleted { get; set; }
    public Address ShippingAddress { get; set; } = new();
    // CreatedAt / UpdatedAt are SHADOW properties (not in the class)
}

public class Product : ISoftDelete
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public bool IsDeleted { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } = [];
}

// Data/TenantProvider.cs
namespace ShopAdvanced.Data;
public interface ITenantProvider { string TenantId { get; } }
public class HeaderTenantProvider(IHttpContextAccessor accessor) : ITenantProvider
{
    public string TenantId =>
        accessor.HttpContext?.Request.Headers["X-Tenant-Id"].FirstOrDefault() ?? "default";
}

// Data/ShopDbContext.cs
using Microsoft.EntityFrameworkCore;
using ShopAdvanced.Models;
namespace ShopAdvanced.Data;

public class ShopDbContext(DbContextOptions<ShopDbContext> options, ITenantProvider tenant) : DbContext(options)
{
    public string TenantId => tenant.TenantId;
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Customer>(e =>
        {
            e.Property(c => c.Name).HasMaxLength(100);
            e.Property(c => c.TenantId).HasMaxLength(40);
            e.Property<DateTime>("CreatedAt");                         // shadow
            e.Property<DateTime?>("UpdatedAt");                        // shadow
            e.OwnsOne(c => c.ShippingAddress, a =>
            {
                a.Property(x => x.Street).HasColumnName("ShipStreet").HasMaxLength(200);
                a.Property(x => x.City).HasColumnName("ShipCity").HasMaxLength(60);
                a.Property(x => x.Pin).HasColumnName("ShipPin").HasMaxLength(6);
            });
            e.HasIndex(c => new { c.TenantId, c.IsDeleted });
            e.HasQueryFilter(c => !c.IsDeleted && c.TenantId == TenantId);
        });

        mb.Entity<Product>(e =>
        {
            e.Property(p => p.Price).HasPrecision(18, 2);
            e.HasQueryFilter(p => !p.IsDeleted);
            e.HasData(                                                   // model seed data
                new Product { Id = 1, Name = "Pen", Price = 10, Stock = 100 },
                new Product { Id = 2, Name = "Notebook", Price = 60, Stock = 40 });
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries<Customer>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Property("CreatedAt").CurrentValue = now;
                entry.Entity.TenantId = TenantId;                      // stamp tenant automatically
            }
            if (entry.State == EntityState.Modified)
                entry.Property("UpdatedAt").CurrentValue = now;
        }
        foreach (var entry in ChangeTracker.Entries<ISoftDelete>())
        {
            if (entry.State == EntityState.Deleted)                    // turn DELETE into UPDATE
            {
                entry.State = EntityState.Modified;
                entry.Entity.IsDeleted = true;
            }
        }
        return base.SaveChangesAsync(ct);
    }
}

// Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopAdvanced.Data;
namespace ShopAdvanced.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(ShopDbContext db) : ControllerBase
{
    public record ProductDto(int Id, string Name, decimal Price, int Stock, string RowVersion);
    public record UpdateProductDto(decimal Price, int Stock, string RowVersion);

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id) =>
        await db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id) is { } p
            ? Ok(new ProductDto(p.Id, p.Name, p.Price, p.Stock, Convert.ToBase64String(p.RowVersion)))
            : NotFound();

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateProductDto dto)
    {
        var p = await db.Products.FindAsync(id);
        if (p is null) return NotFound();

        // tell EF which version the CLIENT saw
        db.Entry(p).Property(x => x.RowVersion).OriginalValue = Convert.FromBase64String(dto.RowVersion);
        p.Price = dto.Price;
        p.Stock = dto.Stock;
        try
        {
            await db.SaveChangesAsync();
            return Ok(new ProductDto(p.Id, p.Name, p.Price, p.Stock, Convert.ToBase64String(p.RowVersion)));
        }
        catch (DbUpdateConcurrencyException ex)
        {
            var dbValues = await ex.Entries.Single().GetDatabaseValuesAsync();
            if (dbValues is null) return NotFound(new { message = "Product was deleted by another user." });
            return Conflict(new
            {
                message = "Product was changed by another user. Reload and try again.",
                currentPrice = dbValues.GetValue<decimal>("Price"),
                currentStock = dbValues.GetValue<int>("Stock")
            });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await db.Products.FindAsync(id);
        if (p is null) return NotFound();
        db.Products.Remove(p);               // becomes soft delete in SaveChangesAsync
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("deleted")]                    // admin view
    public async Task<IActionResult> Deleted() =>
        Ok(await db.Products.IgnoreQueryFilters().Where(p => p.IsDeleted).Select(p => new { p.Id, p.Name }).ToListAsync());
}

// Controllers/CustomersController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopAdvanced.Data;
using ShopAdvanced.Models;
namespace ShopAdvanced.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController(ShopDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await db.Customers
        .OrderByDescending(c => EF.Property<DateTime>(c, "CreatedAt"))
        .Select(c => new { c.Id, c.Name, c.ShippingAddress.City, CreatedAt = EF.Property<DateTime>(c, "CreatedAt") })
        .ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Create(Customer c)
    {
        db.Customers.Add(c);
        await db.SaveChangesAsync();
        return Created($"/api/customers/{c.Id}", new { c.Id, c.Name, c.TenantId });
    }
}

// Program.cs
using Microsoft.EntityFrameworkCore;
using ShopAdvanced.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantProvider, HeaderTenantProvider>();
builder.Services.AddDbContext<ShopDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.MapControllers();
app.Run();`,
      result: `POST /api/customers   X-Tenant-Id: acme
{"name":"Asha Traders","shippingAddress":{"street":"MG Road 5","city":"Pune","pin":"411001"}}
201 {"id":1,"name":"Asha Traders","tenantId":"acme"}

GET /api/customers   X-Tenant-Id: acme   -> [{"id":1,"name":"Asha Traders","city":"Pune","createdAt":"2026-11-17T10:20:31.52"}]
GET /api/customers   X-Tenant-Id: globex -> []      (tenant filter)

GET /api/products/1  -> {"id":1,"name":"Pen","price":10.00,"stock":100,"rowVersion":"AAAAAAAAB9E="}
PUT /api/products/1  {"price":12,"stock":100,"rowVersion":"AAAAAAAAB9E="}   -> 200 (new rowVersion "AAAAAAAAB9I=")
PUT /api/products/1  {"price":15,"stock":90,"rowVersion":"AAAAAAAAB9E="}    -> 409 Conflict
{"message":"Product was changed by another user. Reload and try again.","currentPrice":12.00,"currentStock":100}

DELETE /api/products/2 -> 204   SQL: UPDATE [Products] SET [IsDeleted] = 1 WHERE [Id] = 2 AND [RowVersion] = @p
GET /api/products/2    -> 404   (filtered out)
GET /api/products/deleted -> [{"id":2,"name":"Notebook"}]

Generated SELECT for customers:
SELECT ... FROM [Customers] AS [c] WHERE [c].[IsDeleted] = CAST(0 AS bit) AND [c].[TenantId] = @__ef_filter__TenantId_0`,
      explanation: 'CreatedAt never appears in the C# class yet is stored and sortable through EF.Property. The owned Address becomes three columns in Customers. The tenant and soft-delete filters are added to every query automatically; IgnoreQueryFilters bypasses them for the admin endpoint. The second PUT still carries the OLD rowVersion, so the UPDATE matches 0 rows, EF throws DbUpdateConcurrencyException and the API answers 409 with the current values. rowVersion strings and timestamps are examples - SQL Server generates them.',
    },
    {
      title: 'Watching the change tracker with EF Core + SQLite (console app)',
      scenario: 'Print entity states at each step and the ChangeTracker.DebugView before SaveChanges, using a local SQLite file so no SQL Server is needed.',
      steps: [
        'In Visual Studio: File > New > Project > Console App; name ChangeTrackerDemo > Create',
        'Package Manager Console: Install-Package Microsoft.EntityFrameworkCore.Sqlite',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 (the database file shop.db is created in bin/Debug/net8.0 or net10.0)',
      ],
      code: `using Microsoft.EntityFrameworkCore;

using var db = new ShopContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
db.Products.AddRange(new Product { Name = "Pen", Price = 10 }, new Product { Name = "Book", Price = 250 });
db.SaveChanges();
db.ChangeTracker.Clear();                                    // start fresh

var pen = db.Products.Single(p => p.Name == "Pen");
Console.WriteLine("1. After query: " + db.Entry(pen).State);

pen.Price = 12;
var penEntry = db.Entry(pen);                                // Entry() detects changes for this entity
Console.WriteLine("2. After change: " + penEntry.State
    + ", Price modified = " + penEntry.Property(p => p.Price).IsModified
    + ", Name modified = " + penEntry.Property(p => p.Name).IsModified);

var bag = new Product { Name = "Bag", Price = 799 };
db.Add(bag);
Console.WriteLine("3. New entity: " + db.Entry(bag).State);

var book = db.Products.Single(p => p.Name == "Book");
db.Remove(book);
Console.WriteLine("4. Removed: " + db.Entry(book).State);

Console.WriteLine(db.ChangeTracker.DebugView.ShortView);
int rows = db.SaveChanges();
Console.WriteLine("5. Rows affected: " + rows + ", book: " + db.Entry(book).State + ", bag Id: " + bag.Id);

var readOnly = db.Products.AsNoTracking().First(p => p.Name == "Pen");
Console.WriteLine("6. AsNoTracking copy: " + db.Entry(readOnly).State);

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
}

public class ShopContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    protected override void OnConfiguring(DbContextOptionsBuilder o) => o.UseSqlite("Data Source=shop.db");
}`,
      result: `1. After query: Unchanged
2. After change: Modified, Price modified = True, Name modified = False
3. New entity: Added
4. Removed: Deleted
Product {Id: -2147482647} Added
Product {Id: 1} Modified
Product {Id: 2} Deleted

5. Rows affected: 3, book: Detached, bag Id: 3
6. AsNoTracking copy: Detached`,
      explanation: 'The query creates a snapshot (Unchanged). Changing Price makes only that property modified, so EF will send UPDATE ... SET Price only. Add gives the new entity a temporary negative key (the exact number may differ) until the real identity value comes back. After SaveChanges, deleted entities become Detached and Added/Modified ones become Unchanged. AsNoTracking returns a separate untracked copy, which is why it is Detached even though Pen is tracked.',
    },
    {
      title: 'Console simulation: how the change tracker produces SQL',
      scenario: 'Rebuild a tiny change tracker: snapshots, DetectChanges, entity states and the UPDATE/INSERT/DELETE it would generate - no NuGet packages needed.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MiniChangeTracker > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Linq;

var tracker = new MiniTracker();
var pen = new Product { Id = 1, Name = "Pen", Price = 10 };
var book = new Product { Id = 2, Name = "Book", Price = 250 };
tracker.Attach(pen);        // as if loaded by a query
tracker.Attach(book);

var bag = new Product { Name = "Bag", Price = 799 };
tracker.Add(bag);
pen.Price = 12;             // plain property change - nobody is notified
tracker.Remove(book);

tracker.DetectChanges();
Console.WriteLine("-- Before SaveChanges --");
tracker.PrintStates();
Console.WriteLine("-- SQL --");
int rows = tracker.SaveChanges();
Console.WriteLine("SaveChanges: " + rows + " rows affected");
Console.WriteLine("-- After SaveChanges --");
tracker.PrintStates();
Console.WriteLine("Book state now: " + tracker.StateOf(book));

enum State { Detached, Unchanged, Added, Modified, Deleted }

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Price { get; set; }
}

class Entry
{
    public Product Entity = null!;
    public State State;
    public string OriginalName = "";
    public int OriginalPrice;
}

class MiniTracker
{
    private readonly List<Entry> _entries = new();
    private int _nextId = 3;    // pretend identity column

    public void Attach(Product p) => _entries.Add(new Entry { Entity = p, State = State.Unchanged, OriginalName = p.Name, OriginalPrice = p.Price });
    public void Add(Product p) => _entries.Add(new Entry { Entity = p, State = State.Added });
    public void Remove(Product p) => _entries.First(e => e.Entity == p).State = State.Deleted;
    public State StateOf(Product p) => _entries.FirstOrDefault(e => e.Entity == p)?.State ?? State.Detached;

    public void DetectChanges()
    {
        foreach (var e in _entries.Where(e => e.State == State.Unchanged))
            if (e.Entity.Name != e.OriginalName || e.Entity.Price != e.OriginalPrice)
                e.State = State.Modified;
    }

    public void PrintStates()
    {
        foreach (var e in _entries)
        {
            string line = e.Entity.Name + " (Id " + e.Entity.Id + "): " + e.State;
            if (e.State == State.Modified && e.Entity.Price != e.OriginalPrice)
                line += " [Price: " + e.OriginalPrice + " -> " + e.Entity.Price + "]";
            Console.WriteLine(line);
        }
    }

    public int SaveChanges()
    {
        int rows = 0;
        foreach (var e in _entries.ToList())
        {
            switch (e.State)
            {
                case State.Modified:
                    var sets = new List<string>();
                    if (e.Entity.Name != e.OriginalName) sets.Add("Name = '" + e.Entity.Name + "'");
                    if (e.Entity.Price != e.OriginalPrice) sets.Add("Price = " + e.Entity.Price);
                    Console.WriteLine("UPDATE Products SET " + string.Join(", ", sets) + " WHERE Id = " + e.Entity.Id);
                    break;
                case State.Deleted:
                    Console.WriteLine("DELETE FROM Products WHERE Id = " + e.Entity.Id);
                    _entries.Remove(e);
                    rows++;
                    continue;
                case State.Added:
                    e.Entity.Id = _nextId++;
                    Console.WriteLine("INSERT INTO Products (Name, Price) VALUES ('" + e.Entity.Name + "', " + e.Entity.Price + ")  -- new Id " + e.Entity.Id);
                    break;
                default:
                    continue;
            }
            rows++;
            e.State = State.Unchanged;            // accept changes: new snapshot
            e.OriginalName = e.Entity.Name;
            e.OriginalPrice = e.Entity.Price;
        }
        return rows;
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Linq;

var tracker = new MiniTracker();
var pen = new Product { Id = 1, Name = "Pen", Price = 10 };
var book = new Product { Id = 2, Name = "Book", Price = 250 };
tracker.Attach(pen);        // as if loaded by a query
tracker.Attach(book);

var bag = new Product { Name = "Bag", Price = 799 };
tracker.Add(bag);
pen.Price = 12;             // plain property change - nobody is notified
tracker.Remove(book);

tracker.DetectChanges();
Console.WriteLine("-- Before SaveChanges --");
tracker.PrintStates();
Console.WriteLine("-- SQL --");
int rows = tracker.SaveChanges();
Console.WriteLine("SaveChanges: " + rows + " rows affected");
Console.WriteLine("-- After SaveChanges --");
tracker.PrintStates();
Console.WriteLine("Book state now: " + tracker.StateOf(book));

enum State { Detached, Unchanged, Added, Modified, Deleted }

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Price { get; set; }
}

class Entry
{
    public Product Entity = null!;
    public State State;
    public string OriginalName = "";
    public int OriginalPrice;
}

class MiniTracker
{
    private readonly List<Entry> _entries = new();
    private int _nextId = 3;    // pretend identity column

    public void Attach(Product p) => _entries.Add(new Entry { Entity = p, State = State.Unchanged, OriginalName = p.Name, OriginalPrice = p.Price });
    public void Add(Product p) => _entries.Add(new Entry { Entity = p, State = State.Added });
    public void Remove(Product p) => _entries.First(e => e.Entity == p).State = State.Deleted;
    public State StateOf(Product p) => _entries.FirstOrDefault(e => e.Entity == p)?.State ?? State.Detached;

    public void DetectChanges()
    {
        foreach (var e in _entries.Where(e => e.State == State.Unchanged))
            if (e.Entity.Name != e.OriginalName || e.Entity.Price != e.OriginalPrice)
                e.State = State.Modified;
    }

    public void PrintStates()
    {
        foreach (var e in _entries)
        {
            string line = e.Entity.Name + " (Id " + e.Entity.Id + "): " + e.State;
            if (e.State == State.Modified && e.Entity.Price != e.OriginalPrice)
                line += " [Price: " + e.OriginalPrice + " -> " + e.Entity.Price + "]";
            Console.WriteLine(line);
        }
    }

    public int SaveChanges()
    {
        int rows = 0;
        foreach (var e in _entries.ToList())
        {
            switch (e.State)
            {
                case State.Modified:
                    var sets = new List<string>();
                    if (e.Entity.Name != e.OriginalName) sets.Add("Name = '" + e.Entity.Name + "'");
                    if (e.Entity.Price != e.OriginalPrice) sets.Add("Price = " + e.Entity.Price);
                    Console.WriteLine("UPDATE Products SET " + string.Join(", ", sets) + " WHERE Id = " + e.Entity.Id);
                    break;
                case State.Deleted:
                    Console.WriteLine("DELETE FROM Products WHERE Id = " + e.Entity.Id);
                    _entries.Remove(e);
                    rows++;
                    continue;
                case State.Added:
                    e.Entity.Id = _nextId++;
                    Console.WriteLine("INSERT INTO Products (Name, Price) VALUES ('" + e.Entity.Name + "', " + e.Entity.Price + ")  -- new Id " + e.Entity.Id);
                    break;
                default:
                    continue;
            }
            rows++;
            e.State = State.Unchanged;            // accept changes: new snapshot
            e.OriginalName = e.Entity.Name;
            e.OriginalPrice = e.Entity.Price;
        }
        return rows;
    }
}
`,
        },
        stdin: '',
      },
      result: `-- Before SaveChanges --
Pen (Id 1): Modified [Price: 10 -> 12]
Book (Id 2): Deleted
Bag (Id 0): Added
-- SQL --
UPDATE Products SET Price = 12 WHERE Id = 1
DELETE FROM Products WHERE Id = 2
INSERT INTO Products (Name, Price) VALUES ('Bag', 799)  -- new Id 3
SaveChanges: 3 rows affected
-- After SaveChanges --
Pen (Id 1): Unchanged
Bag (Id 3): Unchanged
Book state now: Detached`,
      explanation: 'Changing pen.Price does not notify anyone; DetectChanges finds it by comparing with the snapshot taken at Attach. Only the changed column (Price) appears in the UPDATE. The Added entity gets its identity value during save, and the Deleted entity leaves the tracker (Detached). Real EF Core may order and batch commands differently, but the states and the "only changed columns" rule are the same.',
    },
    {
      title: 'Console simulation: optimistic concurrency with a row version',
      scenario: 'Asha and Ravi both load "Pen" with stock 10. Asha sells 3, Ravi sells 5. Show why the version check prevents a lost update and how Ravi recovers.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ConcurrencyDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;

var table = new ProductTable();
table.Rows[1] = new Row("Pen", 10, 1);

var asha = table.Read(1);
var ravi = table.Read(1);
Console.WriteLine("Asha read: stock=" + asha.Stock + " version=" + asha.Version);
Console.WriteLine("Ravi read: stock=" + ravi.Stock + " version=" + ravi.Version);

table.Update("Asha", 1, asha.Stock - 3, asha.Version);
try
{
    table.Update("Ravi", 1, ravi.Stock - 5, ravi.Version);   // stale version!
}
catch (ConcurrencyException ex)
{
    Console.WriteLine("Ravi got DbUpdateConcurrencyException: " + ex.Message);
    var fresh = table.Read(1);                                 // reload and re-apply
    Console.WriteLine("Ravi reloads: stock=" + fresh.Stock + " version=" + fresh.Version);
    table.Update("Ravi", 1, fresh.Stock - 5, fresh.Version);
}
var final = table.Read(1);
Console.WriteLine("Final: " + final.Name + " stock=" + final.Stock + " version=" + final.Version);

record Row(string Name, int Stock, int Version);

class ConcurrencyException(string message) : Exception(message);

class ProductTable
{
    public Dictionary<int, Row> Rows { get; } = new();

    public Row Read(int id) => Rows[id];

    public void Update(string who, int id, int newStock, int expectedVersion)
    {
        Console.Write(who + ": UPDATE Products SET Stock = " + newStock +
                      " WHERE Id = " + id + " AND Version = " + expectedVersion);
        var current = Rows[id];
        if (current.Version != expectedVersion)
        {
            Console.WriteLine(" -> 0 rows affected");
            throw new ConcurrencyException("row changed since it was read");
        }
        Rows[id] = current with { Stock = newStock, Version = current.Version + 1 };
        Console.WriteLine(" -> 1 row affected");
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;

var table = new ProductTable();
table.Rows[1] = new Row("Pen", 10, 1);

var asha = table.Read(1);
var ravi = table.Read(1);
Console.WriteLine("Asha read: stock=" + asha.Stock + " version=" + asha.Version);
Console.WriteLine("Ravi read: stock=" + ravi.Stock + " version=" + ravi.Version);

table.Update("Asha", 1, asha.Stock - 3, asha.Version);
try
{
    table.Update("Ravi", 1, ravi.Stock - 5, ravi.Version);   // stale version!
}
catch (ConcurrencyException ex)
{
    Console.WriteLine("Ravi got DbUpdateConcurrencyException: " + ex.Message);
    var fresh = table.Read(1);                                 // reload and re-apply
    Console.WriteLine("Ravi reloads: stock=" + fresh.Stock + " version=" + fresh.Version);
    table.Update("Ravi", 1, fresh.Stock - 5, fresh.Version);
}
var final = table.Read(1);
Console.WriteLine("Final: " + final.Name + " stock=" + final.Stock + " version=" + final.Version);

record Row(string Name, int Stock, int Version);

class ConcurrencyException(string message) : Exception(message);

class ProductTable
{
    public Dictionary<int, Row> Rows { get; } = new();

    public Row Read(int id) => Rows[id];

    public void Update(string who, int id, int newStock, int expectedVersion)
    {
        Console.Write(who + ": UPDATE Products SET Stock = " + newStock +
                      " WHERE Id = " + id + " AND Version = " + expectedVersion);
        var current = Rows[id];
        if (current.Version != expectedVersion)
        {
            Console.WriteLine(" -> 0 rows affected");
            throw new ConcurrencyException("row changed since it was read");
        }
        Rows[id] = current with { Stock = newStock, Version = current.Version + 1 };
        Console.WriteLine(" -> 1 row affected");
    }
}
`,
        },
        stdin: '',
      },
      result: `Asha read: stock=10 version=1
Ravi read: stock=10 version=1
Asha: UPDATE Products SET Stock = 7 WHERE Id = 1 AND Version = 1 -> 1 row affected
Ravi: UPDATE Products SET Stock = 5 WHERE Id = 1 AND Version = 1 -> 0 rows affected
Ravi got DbUpdateConcurrencyException: row changed since it was read
Ravi reloads: stock=7 version=2
Ravi: UPDATE Products SET Stock = 2 WHERE Id = 1 AND Version = 2 -> 1 row affected
Final: Pen stock=2 version=3`,
      explanation: 'Both users read version 1. Asha saves first, so the row becomes version 2. Ravi\'s UPDATE still says "AND Version = 1", matches nothing, and fails. Without the version check, Ravi would have written stock 5 and Asha\'s sale of 3 would be lost (10 - 3 - 5 should be 2). After reloading, Ravi re-applies his change to the fresh value and the final stock 2 is correct. SQL Server rowversion works the same way, but the database increments it automatically.',
    },
    {
      title: 'Console simulation: global query filters for soft delete and tenants',
      scenario: 'See which rows a query returns when soft-delete and tenant filters are applied automatically, and what IgnoreQueryFilters returns.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it QueryFilterDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Linq;

var products = new List<Product>
{
    new(1, "Pen", "acme", false),
    new(2, "Book", "acme", true),      // already soft-deleted
    new(3, "Bag", "globex", false),
    new(4, "Lamp", "acme", false)
};
string currentTenant = "acme";

// what HasQueryFilter(p => !p.IsDeleted && p.TenantId == TenantId) does to every query
IEnumerable<Product> Query(bool ignoreFilters = false) =>
    ignoreFilters ? products : products.Where(p => !p.IsDeleted && p.TenantId == currentTenant);

void Show(string title, IEnumerable<Product> rows)
{
    var names = rows.Select(p => p.Name).ToList();
    Console.WriteLine(title + " -> " + (names.Count == 0 ? "(none)" : string.Join(", ", names)));
}

Show("Products (tenant acme)", Query());
Show("IgnoreQueryFilters()", Query(ignoreFilters: true));

int i = products.FindIndex(p => p.Name == "Lamp");
products[i] = products[i] with { IsDeleted = true };
Console.WriteLine("Remove(Lamp) => UPDATE Products SET IsDeleted = 1 WHERE Id = 4");
Show("Products (tenant acme)", Query());

currentTenant = "globex";
Show("Products (tenant globex)", Query());
Show("Deleted rows (admin)", Query(ignoreFilters: true).Where(p => p.IsDeleted));

record Product(int Id, string Name, string TenantId, bool IsDeleted);`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Linq;

var products = new List<Product>
{
    new(1, "Pen", "acme", false),
    new(2, "Book", "acme", true),      // already soft-deleted
    new(3, "Bag", "globex", false),
    new(4, "Lamp", "acme", false)
};
string currentTenant = "acme";

// what HasQueryFilter(p => !p.IsDeleted && p.TenantId == TenantId) does to every query
IEnumerable<Product> Query(bool ignoreFilters = false) =>
    ignoreFilters ? products : products.Where(p => !p.IsDeleted && p.TenantId == currentTenant);

void Show(string title, IEnumerable<Product> rows)
{
    var names = rows.Select(p => p.Name).ToList();
    Console.WriteLine(title + " -> " + (names.Count == 0 ? "(none)" : string.Join(", ", names)));
}

Show("Products (tenant acme)", Query());
Show("IgnoreQueryFilters()", Query(ignoreFilters: true));

int i = products.FindIndex(p => p.Name == "Lamp");
products[i] = products[i] with { IsDeleted = true };
Console.WriteLine("Remove(Lamp) => UPDATE Products SET IsDeleted = 1 WHERE Id = 4");
Show("Products (tenant acme)", Query());

currentTenant = "globex";
Show("Products (tenant globex)", Query());
Show("Deleted rows (admin)", Query(ignoreFilters: true).Where(p => p.IsDeleted));

record Product(int Id, string Name, string TenantId, bool IsDeleted);
`,
        },
        stdin: '',
      },
      result: `Products (tenant acme) -> Pen, Lamp
IgnoreQueryFilters() -> Pen, Book, Bag, Lamp
Remove(Lamp) => UPDATE Products SET IsDeleted = 1 WHERE Id = 4
Products (tenant acme) -> Pen
Products (tenant globex) -> Bag
Deleted rows (admin) -> Book, Lamp`,
      explanation: 'The filter hides Book (deleted) and Bag (other tenant) without any Where in the calling code. Soft delete only flips a flag, so Lamp disappears from normal queries but is still in the table for audits and restores. Because the filter reads currentTenant when the query runs, switching tenant changes the result - just like EF reading the DbContext TenantId property per request.',
    },
  ],
  interview: [
    { q: 'Name the EF Core entity states.', a: 'Detached, Unchanged, Added, Modified, Deleted.', level: 'Easy' },
    { q: 'What does DetectChanges do and when does it run?', a: 'It compares tracked entities with their original-value snapshots and marks changed properties/entities as Modified. It runs automatically in SaveChanges, Entry(), ChangeTracker.Entries() and some other APIs.', level: 'Medium' },
    { q: 'Why use AsNoTracking?', a: 'For read-only queries: EF skips snapshots and identity resolution, so queries are faster and use less memory. Entities returned are Detached.', level: 'Easy' },
    { q: 'Difference between db.Update(entity) and changing a tracked entity?', a: 'Changing a tracked entity marks only changed properties, so UPDATE includes only those columns. Update(entity) attaches a disconnected entity and marks ALL properties Modified, updating every column.', level: 'Medium' },
    { q: 'What is a shadow property? Give a use case.', a: 'A property in the EF model and database but not in the CLR class, accessed via Entry().Property("Name") or EF.Property<T>(). Use for audit columns (CreatedAt, UpdatedBy) or hidden foreign keys.', level: 'Medium' },
    { q: 'What is an owned type?', a: 'A type without its own key that is part of an owner entity (value object), configured with OwnsOne/OwnsMany. OwnsOne stores its properties in the owner table; it is always loaded with the owner.', level: 'Medium' },
    { q: 'How do you implement soft delete in EF Core?', a: 'Add IsDeleted, configure HasQueryFilter(e => !e.IsDeleted), and in SaveChanges convert Deleted entries to Modified with IsDeleted = true. Use IgnoreQueryFilters to see deleted rows.', level: 'Medium' },
    { q: 'How can a global query filter use the current tenant?', a: 'Reference a property/field of the DbContext (e.g. TenantId from an injected ITenantProvider) inside the filter lambda; EF parameterizes it per context instance.', level: 'Hard' },
    { q: 'What is optimistic concurrency and how does EF Core implement it?', a: 'Assume conflicts are rare; detect them at save time. A concurrency token ([Timestamp] rowversion or [ConcurrencyCheck]) is included in the UPDATE/DELETE WHERE clause; if 0 rows are affected EF throws DbUpdateConcurrencyException.', level: 'Medium' },
    { q: 'How do you handle DbUpdateConcurrencyException?', a: 'Get ex.Entries, call GetDatabaseValuesAsync to see the current values (null if deleted), then choose: client wins (refresh original values and save), database wins (reload), merge, or return 409 Conflict to the user.', level: 'Hard' },
    { q: 'HasData vs UseSeeding?', a: 'HasData is static model seed data managed by migrations (explicit keys, no navigations). UseSeeding/UseAsyncSeeding (EF Core 9+) run arbitrary code during EnsureCreated/Migrate, suitable for conditional or large seeding.', level: 'Medium' },
    { q: 'How many HasQueryFilter calls per entity are allowed?', a: 'Before EF Core 10 only the last one is kept, so combine conditions with &&. EF Core 10 supports multiple named filters that can be ignored individually.', level: 'Hard' },
    { q: 'Output question: you load a product (Unchanged), set Price to the SAME value, and call SaveChanges. How many rows are updated?', a: '0. DetectChanges sees no difference from the snapshot, so the entity stays Unchanged and no SQL is sent.', level: 'Medium' },
  ],
  practice: [
    { task: 'Add shadow properties CreatedBy and UpdatedBy (string) to every entity that implements IAuditable and fill them from the logged-in user name.', hint: 'Loop over mb.Model.GetEntityTypes() in OnModelCreating; use IHttpContextAccessor for the user.', solution: 'foreach (var et in mb.Model.GetEntityTypes().Where(t => typeof(IAuditable).IsAssignableFrom(t.ClrType))) { mb.Entity(et.ClrType).Property<string>("CreatedBy").HasMaxLength(100); mb.Entity(et.ClrType).Property<string>("UpdatedBy").HasMaxLength(100); } In SaveChangesAsync: var user = accessor.HttpContext?.User.Identity?.Name ?? "system"; foreach (var e in ChangeTracker.Entries<IAuditable>()) { if (e.State == EntityState.Added) e.Property("CreatedBy").CurrentValue = user; if (e.State is EntityState.Added or EntityState.Modified) e.Property("UpdatedBy").CurrentValue = user; }' },
    { task: 'Add a restore endpoint POST /api/products/{id}/restore that un-deletes a soft-deleted product.', hint: 'You must use IgnoreQueryFilters to find it.', solution: 'var p = await db.Products.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id && x.IsDeleted); if (p is null) return NotFound(); p.IsDeleted = false; await db.SaveChangesAsync(); return NoContent();' },
    { task: 'Model Order with an owned collection of OrderLines (ProductName, Qty, UnitPrice) using OwnsMany.', hint: 'OwnsMany creates a separate table with a shadow key.', solution: 'public class Order { public int Id { get; set; } public List<OrderLine> Lines { get; set; } = []; } public class OrderLine { public string ProductName { get; set; } = ""; public int Qty { get; set; } public decimal UnitPrice { get; set; } } mb.Entity<Order>().OwnsMany(o => o.Lines, l => { l.ToTable("OrderLines"); l.WithOwner().HasForeignKey("OrderId"); l.Property<int>("Id"); l.HasKey("Id"); l.Property(x => x.UnitPrice).HasPrecision(18, 2); });' },
    { task: 'Implement "client wins" handling: on DbUpdateConcurrencyException, overwrite the database with the user\'s values.', hint: 'Set the entry\'s original values to the database values and save again.', solution: 'catch (DbUpdateConcurrencyException ex) { foreach (var entry in ex.Entries) { var dbValues = await entry.GetDatabaseValuesAsync(); if (dbValues is null) throw; entry.OriginalValues.SetValues(dbValues); } await db.SaveChangesAsync(); }' },
    { task: 'Seed 3 categories with HasData and seed an admin user with UseAsyncSeeding only if no users exist.', hint: 'HasData needs explicit Ids.', solution: 'mb.Entity<Category>().HasData(new Category { Id = 1, Name = "Stationery" }, new Category { Id = 2, Name = "Books" }, new Category { Id = 3, Name = "Bags" }); o.UseAsyncSeeding(async (ctx, _, ct) => { if (!await ctx.Set<User>().AnyAsync(ct)) { ctx.Set<User>().Add(new User { Email = "admin@shop.com", Role = "Admin" }); await ctx.SaveChangesAsync(ct); } });' },
  ],
  quiz: [
    { question: 'An entity was loaded by a tracking query and not changed. What is its state?', options: ['Added', 'Modified', 'Unchanged', 'Detached'], answer: 2, explanation: 'Queried entities start as Unchanged.' },
    { question: 'How do you read a shadow property "CreatedAt" inside a LINQ query?', options: ['c.CreatedAt', 'EF.Property<DateTime>(c, "CreatedAt")', 'c["CreatedAt"]', 'db.Shadow("CreatedAt")'], answer: 1, explanation: 'EF.Property<T>(entity, name) references properties that are not on the class.' },
    { question: 'Which call bypasses global query filters?', options: ['AsNoTracking()', 'AsSplitQuery()', 'Include()', 'IgnoreQueryFilters()'], answer: 3, explanation: 'IgnoreQueryFilters disables the filters for that query.' },
    { question: 'Which attribute maps a byte[] property to SQL Server rowversion for concurrency?', options: ['[Timestamp]', '[Key]', '[Required]', '[Owned]'], answer: 0, explanation: '[Timestamp] marks a rowversion concurrency token.' },
    { question: 'What does OwnsOne(c => c.Address) do by default?', options: ['Creates a separate Addresses table with its own Id', 'Ignores the Address property', 'Stores Address properties as columns in the Customers table', 'Stores Address as JSON in a file'], answer: 2, explanation: 'A single owned type is table-split into the owner table.' },
  ],
};
