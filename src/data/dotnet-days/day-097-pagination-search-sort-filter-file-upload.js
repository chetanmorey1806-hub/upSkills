export default {
  id: 'day-097-pagination-search-sort-filter-file-upload',
  title: 'API Pagination, Searching, Sorting, Filtering, File Upload',
  module: 'ASP.NET Core Web API',
  day: 97,
  level: 'Advanced',
  duration: '3.5 hours',
  summary: `Build the complete Product Management API. Return large lists page by page with a PagedResult (items + total count + total pages), let clients search by text, filter by category, price range and stock, and sort by any allowed column in either direction - all translated by EF Core into one efficient SQL query with OFFSET/FETCH. Then upload product images and CSV files with IFormFile and multipart/form-data, validate them safely, save them and serve them as static files. Test everything with Swagger and Postman.`,
  objectives: [
    'Implement offset pagination with page/pageSize, limits and pagination metadata',
    'Combine search, filters and sorting on an IQueryable so EF Core produces a single SQL query',
    'Bind query string parameters into a ProductQueryParameters class with [FromQuery]',
    'Upload single and multiple files with IFormFile, validate size/type and store them safely',
    'Test paging URLs and multipart/form-data uploads in Swagger and Postman',
  ],
  theory: [
    {
      heading: 'Why pagination?',
      content: `GET /api/products on a table with 1,00,000 rows would load every row into memory, serialize megabytes of JSON and freeze the React page. Pagination returns one "page" at a time: GET /api/products?page=2&pageSize=20. The server must (1) apply a maximum page size so clients cannot request 1,000,000 rows, (2) always sort before paging so pages are stable, and (3) return metadata - total count and total pages - so the UI can draw page buttons.`,
      syntax: `Skip = (page - 1) * pageSize        page 1 -> skip 0, page 2 -> skip 20, page 3 -> skip 40
TotalPages = ceiling(totalCount / pageSize)

EF Core:  query.OrderBy(p => p.Id).Skip((page - 1) * pageSize).Take(pageSize)
SQL:      ORDER BY [p].[Id] OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY`,
      points: [
        'Response body style: { "items": [...], "page": 2, "pageSize": 20, "totalCount": 135, "totalPages": 7, "hasNext": true }',
        'Header style: body is a plain array and metadata goes in a header such as X-Pagination (remember WithExposedHeaders for CORS)',
        'Offset paging gets slower on very deep pages; keyset (cursor) paging - WHERE Id > @lastId ORDER BY Id - scales better for infinite scrolling',
      ],
    },
    {
      heading: 'Searching and filtering',
      content: `Search is free text across one or more columns (name or SKU contains "lap"). Filters are exact conditions (category = Electronics, price between 1000 and 20000, inStock = true). Build them on an IQueryable step by step, adding a Where only when the parameter was supplied. Nothing runs until ToListAsync/CountAsync, so EF Core combines everything into ONE SQL statement with parameters - safe from SQL injection.`,
      syntax: `IQueryable<Product> q = _db.Products.AsNoTracking();
if (!string.IsNullOrWhiteSpace(p.Search))
    q = q.Where(x => x.Name.Contains(p.Search) || x.Sku.Contains(p.Search));   // LIKE N'%lap%'
if (!string.IsNullOrWhiteSpace(p.Category)) q = q.Where(x => x.Category == p.Category);
if (p.MinPrice.HasValue) q = q.Where(x => x.Price >= p.MinPrice);
if (p.MaxPrice.HasValue) q = q.Where(x => x.Price <= p.MaxPrice);
if (p.InStock == true)   q = q.Where(x => x.Stock > 0);`,
    },
    {
      heading: 'Sorting',
      content: `Let the client choose sortBy and sortOrder, but only from a WHITELIST of columns - never pass user input into raw SQL ORDER BY. A switch expression maps the text to a typed lambda. Add a unique tie-breaker (ThenBy Id) so rows with equal values do not jump between pages.`,
      syntax: `q = (p.SortBy?.ToLower(), p.SortOrder?.ToLower() == "desc") switch
{
    ("name",  false) => q.OrderBy(x => x.Name).ThenBy(x => x.Id),
    ("name",  true)  => q.OrderByDescending(x => x.Name).ThenBy(x => x.Id),
    ("price", false) => q.OrderBy(x => x.Price).ThenBy(x => x.Id),
    ("price", true)  => q.OrderByDescending(x => x.Price).ThenBy(x => x.Id),
    _                => q.OrderBy(x => x.Id)
};`,
    },
    {
      heading: 'Binding query parameters to a class',
      content: `Instead of eight action parameters, create ProductQueryParameters and bind it with [FromQuery]. Property names become query string keys (case-insensitive). Put defaults and limits in the class, and Data Annotations ([Range]) validate it automatically thanks to [ApiController].`,
      syntax: `GET /api/products?search=o&category=Electronics&minPrice=1000&maxPrice=70000&inStock=true&sortBy=price&sortOrder=desc&page=1&pageSize=5

public async Task<ActionResult<PagedResult<ProductDto>>> GetAll([FromQuery] ProductQueryParameters p)`,
    },
    {
      heading: 'File upload with IFormFile',
      content: `Files are sent with Content-Type: multipart/form-data, where each part is a form field or a file. ASP.NET Core exposes each file as IFormFile (FileName, Length, ContentType, OpenReadStream, CopyToAsync). Bind with [FromForm]; for several files use List<IFormFile> or IFormFileCollection. Default limits: about 28.6 MB request body in Kestrel ([RequestSizeLimit] to change) and 128 MB multipart body (FormOptions).`,
      points: [
        'Validate: not empty, maximum size, allowed extensions AND content (magic bytes) - ContentType and FileName are sent by the client and can lie',
        'Never use the client file name as the stored name: generate Guid.NewGuid() + extension (prevents path traversal like ../../web.config and overwrites)',
        'Store outside the web root when files are private; serve public images from wwwroot with app.UseStaticFiles()',
        'Production: store files in Azure Blob Storage / S3 and keep only the URL in the database',
        'Save the relative URL (/images/products/abc.png) in the Product row',
      ],
    },
    {
      heading: 'Reading files: CSV import',
      content: `An uploaded file does not have to be saved - you can read it directly from file.OpenReadStream() with a StreamReader (Day 34). A CSV import endpoint reads line by line, validates each row, collects errors with line numbers, and inserts valid rows in one SaveChangesAsync. Return a summary such as { "imported": 3, "errors": [ "Line 4: price must be a number" ] }.`,
    },
  ],
  examples: [
    {
      title: 'Console: paging, searching, filtering and sorting with LINQ',
      scenario: 'Understand the logic of the Product API query with an in-memory list before using EF Core.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ProductQueryDemo > .NET 10 > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `var products = new List<Product>
{
    new(1, "Laptop", "Electronics", 65000m, 5),
    new(2, "Mouse", "Electronics", 799m, 120),
    new(3, "Keyboard", "Electronics", 1499m, 0),
    new(4, "Office Chair", "Furniture", 8999m, 12),
    new(5, "Desk", "Furniture", 12999m, 3),
    new(6, "Monitor", "Electronics", 15999m, 7),
    new(7, "Notebook", "Stationery", 60m, 500),
    new(8, "Pen Pack", "Stationery", 120m, 0),
    new(9, "Webcam", "Electronics", 2999m, 15),
    new(10, "Bookshelf", "Furniture", 6999m, 2),
};

Print("Q1 sort=name", Query(products, new ProductQuery { SortBy = "name", PageSize = 3 }));
Print("Q2 Electronics in stock, price desc",
      Query(products, new ProductQuery { Category = "electronics", InStock = true, SortBy = "price", Desc = true, PageSize = 5 }));
Print("Q3 search=o, minPrice=1000, stock asc",
      Query(products, new ProductQuery { Search = "o", MinPrice = 1000, SortBy = "stock", Page = 2, PageSize = 2 }));
Print("Q4 page 9", Query(products, new ProductQuery { SortBy = "name", Page = 9, PageSize = 3 }));
Console.WriteLine($"Requested pageSize 500 -> used {new ProductQuery { PageSize = 500 }.PageSize}");

static PagedResult<Product> Query(IEnumerable<Product> source, ProductQuery q)
{
    IEnumerable<Product> query = source;

    if (!string.IsNullOrWhiteSpace(q.Search))
        query = query.Where(p => p.Name.Contains(q.Search, StringComparison.OrdinalIgnoreCase));
    if (!string.IsNullOrWhiteSpace(q.Category))
        query = query.Where(p => string.Equals(p.Category, q.Category, StringComparison.OrdinalIgnoreCase));
    if (q.MinPrice.HasValue) query = query.Where(p => p.Price >= q.MinPrice.Value);
    if (q.MaxPrice.HasValue) query = query.Where(p => p.Price <= q.MaxPrice.Value);
    if (q.InStock == true) query = query.Where(p => p.Stock > 0);

    query = (q.SortBy.ToLowerInvariant(), q.Desc) switch
    {
        ("name", false)  => query.OrderBy(p => p.Name).ThenBy(p => p.Id),
        ("name", true)   => query.OrderByDescending(p => p.Name).ThenBy(p => p.Id),
        ("price", false) => query.OrderBy(p => p.Price).ThenBy(p => p.Id),
        ("price", true)  => query.OrderByDescending(p => p.Price).ThenBy(p => p.Id),
        ("stock", false) => query.OrderBy(p => p.Stock).ThenBy(p => p.Id),
        ("stock", true)  => query.OrderByDescending(p => p.Stock).ThenBy(p => p.Id),
        _                => query.OrderBy(p => p.Id)
    };

    int total = query.Count();
    var items = query.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToList();
    return new PagedResult<Product>(items, q.Page, q.PageSize, total);
}

static void Print(string label, PagedResult<Product> r)
{
    Console.WriteLine($"{label}: page {r.Page}/{r.TotalPages}, total {r.TotalCount}");
    if (r.Items.Count == 0) Console.WriteLine("  (no items)");
    foreach (var p in r.Items)
        Console.WriteLine($"  {p.Id} {p.Name} | {p.Category} | {p.Price} | stock {p.Stock}");
}

public record Product(int Id, string Name, string Category, decimal Price, int Stock);

public record PagedResult<T>(List<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public class ProductQuery
{
    private const int MaxPageSize = 50;
    private int _page = 1;
    private int _pageSize = 10;

    public int Page { get => _page; set => _page = value < 1 ? 1 : value; }
    public int PageSize { get => _pageSize; set => _pageSize = value > MaxPageSize ? MaxPageSize : (value < 1 ? 1 : value); }
    public string? Search { get; set; }
    public string? Category { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? InStock { get; set; }
    public string SortBy { get; set; } = "id";
    public bool Desc { get; set; }
}`,
      csharp: {
        files: {
          'Program.cs': `var products = new List<Product>
{
    new(1, "Laptop", "Electronics", 65000m, 5),
    new(2, "Mouse", "Electronics", 799m, 120),
    new(3, "Keyboard", "Electronics", 1499m, 0),
    new(4, "Office Chair", "Furniture", 8999m, 12),
    new(5, "Desk", "Furniture", 12999m, 3),
    new(6, "Monitor", "Electronics", 15999m, 7),
    new(7, "Notebook", "Stationery", 60m, 500),
    new(8, "Pen Pack", "Stationery", 120m, 0),
    new(9, "Webcam", "Electronics", 2999m, 15),
    new(10, "Bookshelf", "Furniture", 6999m, 2),
};

Print("Q1 sort=name", Query(products, new ProductQuery { SortBy = "name", PageSize = 3 }));
Print("Q2 Electronics in stock, price desc",
      Query(products, new ProductQuery { Category = "electronics", InStock = true, SortBy = "price", Desc = true, PageSize = 5 }));
Print("Q3 search=o, minPrice=1000, stock asc",
      Query(products, new ProductQuery { Search = "o", MinPrice = 1000, SortBy = "stock", Page = 2, PageSize = 2 }));
Print("Q4 page 9", Query(products, new ProductQuery { SortBy = "name", Page = 9, PageSize = 3 }));
Console.WriteLine($"Requested pageSize 500 -> used {new ProductQuery { PageSize = 500 }.PageSize}");

static PagedResult<Product> Query(IEnumerable<Product> source, ProductQuery q)
{
    IEnumerable<Product> query = source;

    if (!string.IsNullOrWhiteSpace(q.Search))
        query = query.Where(p => p.Name.Contains(q.Search, StringComparison.OrdinalIgnoreCase));
    if (!string.IsNullOrWhiteSpace(q.Category))
        query = query.Where(p => string.Equals(p.Category, q.Category, StringComparison.OrdinalIgnoreCase));
    if (q.MinPrice.HasValue) query = query.Where(p => p.Price >= q.MinPrice.Value);
    if (q.MaxPrice.HasValue) query = query.Where(p => p.Price <= q.MaxPrice.Value);
    if (q.InStock == true) query = query.Where(p => p.Stock > 0);

    query = (q.SortBy.ToLowerInvariant(), q.Desc) switch
    {
        ("name", false)  => query.OrderBy(p => p.Name).ThenBy(p => p.Id),
        ("name", true)   => query.OrderByDescending(p => p.Name).ThenBy(p => p.Id),
        ("price", false) => query.OrderBy(p => p.Price).ThenBy(p => p.Id),
        ("price", true)  => query.OrderByDescending(p => p.Price).ThenBy(p => p.Id),
        ("stock", false) => query.OrderBy(p => p.Stock).ThenBy(p => p.Id),
        ("stock", true)  => query.OrderByDescending(p => p.Stock).ThenBy(p => p.Id),
        _                => query.OrderBy(p => p.Id)
    };

    int total = query.Count();
    var items = query.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToList();
    return new PagedResult<Product>(items, q.Page, q.PageSize, total);
}

static void Print(string label, PagedResult<Product> r)
{
    Console.WriteLine($"{label}: page {r.Page}/{r.TotalPages}, total {r.TotalCount}");
    if (r.Items.Count == 0) Console.WriteLine("  (no items)");
    foreach (var p in r.Items)
        Console.WriteLine($"  {p.Id} {p.Name} | {p.Category} | {p.Price} | stock {p.Stock}");
}

public record Product(int Id, string Name, string Category, decimal Price, int Stock);

public record PagedResult<T>(List<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public class ProductQuery
{
    private const int MaxPageSize = 50;
    private int _page = 1;
    private int _pageSize = 10;

    public int Page { get => _page; set => _page = value < 1 ? 1 : value; }
    public int PageSize { get => _pageSize; set => _pageSize = value > MaxPageSize ? MaxPageSize : (value < 1 ? 1 : value); }
    public string? Search { get; set; }
    public string? Category { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? InStock { get; set; }
    public string SortBy { get; set; } = "id";
    public bool Desc { get; set; }
}`,
        },
        stdin: '',
      },
      result: `Q1 sort=name: page 1/4, total 10
  10 Bookshelf | Furniture | 6999 | stock 2
  5 Desk | Furniture | 12999 | stock 3
  3 Keyboard | Electronics | 1499 | stock 0
Q2 Electronics in stock, price desc: page 1/1, total 4
  1 Laptop | Electronics | 65000 | stock 5
  6 Monitor | Electronics | 15999 | stock 7
  9 Webcam | Electronics | 2999 | stock 15
  2 Mouse | Electronics | 799 | stock 120
Q3 search=o, minPrice=1000, stock asc: page 2/3, total 5
  1 Laptop | Electronics | 65000 | stock 5
  6 Monitor | Electronics | 15999 | stock 7
Q4 page 9: page 9/4, total 10
  (no items)
Requested pageSize 500 -> used 50`,
      explanation: `Q2: Keyboard is Electronics but has stock 0, so 4 products remain; "electronics" matches because the comparison ignores case. Q3: names containing "o" with price >= 1000 are Laptop, Keyboard, Office Chair, Monitor, Bookshelf (5). Sorted by stock: Keyboard 0, Bookshelf 2, Laptop 5, Monitor 7, Office Chair 12; page 2 with size 2 skips the first two and returns Laptop and Monitor. Q4 asks for a page beyond the last one, so the list is empty but the metadata still says 4 pages. The setter caps pageSize at 50 to protect the server.`,
    },
    {
      title: 'Product Management API: entity, query parameters, PagedResult and GET endpoint',
      scenario: 'Implement paging, search, filters and sorting on SQL Server with EF Core.',
      steps: [
        'File > New > Project > ASP.NET Core Web API > ProductApi > .NET 10 > Use controllers',
        'Install-Package Microsoft.EntityFrameworkCore.SqlServer, Microsoft.EntityFrameworkCore.Tools, Swashbuckle.AspNetCore',
        'Add Models/Product.cs, Dtos/ProductDtos.cs, Dtos/ProductQueryParameters.cs, Dtos/PagedResult.cs, Data/AppDbContext.cs',
        'Add the connection string (ProductApiDB) to appsettings.json and register AddDbContext in Program.cs',
        'PM> Add-Migration InitialCreate  then  PM> Update-Database',
        'Add Controllers/ProductsController.cs; Ctrl+F5 and test in Swagger',
      ],
      code: `// Models/Product.cs
namespace ProductApi.Models;
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// Dtos/ProductDtos.cs
namespace ProductApi.Dtos;
public record ProductDto(int Id, string Name, string Sku, string Category, decimal Price, int Stock, string? ImageUrl);

// Dtos/ProductQueryParameters.cs
using System.ComponentModel.DataAnnotations;
namespace ProductApi.Dtos;
public class ProductQueryParameters
{
    private const int MaxPageSize = 50;
    private int _pageSize = 10;

    [Range(1, int.MaxValue)] public int Page { get; set; } = 1;
    public int PageSize { get => _pageSize; set => _pageSize = Math.Clamp(value, 1, MaxPageSize); }
    [StringLength(50)] public string? Search { get; set; }
    public string? Category { get; set; }
    [Range(0, 10000000)] public decimal? MinPrice { get; set; }
    [Range(0, 10000000)] public decimal? MaxPrice { get; set; }
    public bool? InStock { get; set; }
    [RegularExpression("^(id|name|price|stock|createdAt)$", ErrorMessage = "sortBy must be id, name, price, stock or createdAt")]
    public string SortBy { get; set; } = "id";
    [RegularExpression("^(asc|desc)$", ErrorMessage = "sortOrder must be asc or desc")]
    public string SortOrder { get; set; } = "asc";
}

// Dtos/PagedResult.cs
namespace ProductApi.Dtos;
public class PagedResult<T>
{
    public List<T> Items { get; init; } = new();
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}

// Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using ProductApi.Models;
namespace ProductApi.Data;
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Product>(e =>
        {
            e.Property(p => p.Name).HasMaxLength(100).IsRequired();
            e.Property(p => p.Sku).HasMaxLength(20).IsRequired();
            e.HasIndex(p => p.Sku).IsUnique();
            e.HasIndex(p => p.Category);                     // speeds up the category filter
            e.Property(p => p.Price).HasPrecision(18, 2);
            e.HasData(
                new Product { Id = 1, Name = "Laptop", Sku = "LAP-001", Category = "Electronics", Price = 65000, Stock = 5, CreatedAt = new DateTime(2026, 11, 1) },
                new Product { Id = 2, Name = "Mouse", Sku = "MOU-001", Category = "Electronics", Price = 799, Stock = 120, CreatedAt = new DateTime(2026, 11, 1) },
                new Product { Id = 3, Name = "Keyboard", Sku = "KEY-001", Category = "Electronics", Price = 1499, Stock = 0, CreatedAt = new DateTime(2026, 11, 1) },
                new Product { Id = 4, Name = "Office Chair", Sku = "CHR-001", Category = "Furniture", Price = 8999, Stock = 12, CreatedAt = new DateTime(2026, 11, 1) },
                new Product { Id = 5, Name = "Desk", Sku = "DSK-001", Category = "Furniture", Price = 12999, Stock = 3, CreatedAt = new DateTime(2026, 11, 1) },
                new Product { Id = 6, Name = "Monitor", Sku = "MON-001", Category = "Electronics", Price = 15999, Stock = 7, CreatedAt = new DateTime(2026, 11, 1) },
                new Product { Id = 7, Name = "Notebook", Sku = "NBK-001", Category = "Stationery", Price = 60, Stock = 500, CreatedAt = new DateTime(2026, 11, 1) },
                new Product { Id = 8, Name = "Pen Pack", Sku = "PEN-001", Category = "Stationery", Price = 120, Stock = 0, CreatedAt = new DateTime(2026, 11, 1) },
                new Product { Id = 9, Name = "Webcam", Sku = "CAM-001", Category = "Electronics", Price = 2999, Stock = 15, CreatedAt = new DateTime(2026, 11, 1) },
                new Product { Id = 10, Name = "Bookshelf", Sku = "BSH-001", Category = "Furniture", Price = 6999, Stock = 2, CreatedAt = new DateTime(2026, 11, 1) });
        });
    }
}

// Controllers/ProductsController.cs (GET part)
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductApi.Data;
using ProductApi.Dtos;
using ProductApi.Models;
namespace ProductApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public partial class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(AppDbContext db, IWebHostEnvironment env, ILogger<ProductsController> logger)
    {
        _db = db;
        _env = env;
        _logger = logger;
    }

    // GET api/products?search=o&category=Electronics&minPrice=1000&inStock=true&sortBy=price&sortOrder=desc&page=1&pageSize=5
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetAll([FromQuery] ProductQueryParameters p)
    {
        if (p.MinPrice > p.MaxPrice)
            return BadRequest(new { message = "minPrice cannot be greater than maxPrice" });

        IQueryable<Product> q = _db.Products.AsNoTracking();

        // 1. search
        if (!string.IsNullOrWhiteSpace(p.Search))
        {
            string s = p.Search.Trim();
            q = q.Where(x => x.Name.Contains(s) || x.Sku.Contains(s));
        }
        // 2. filters
        if (!string.IsNullOrWhiteSpace(p.Category)) q = q.Where(x => x.Category == p.Category);
        if (p.MinPrice.HasValue) q = q.Where(x => x.Price >= p.MinPrice.Value);
        if (p.MaxPrice.HasValue) q = q.Where(x => x.Price <= p.MaxPrice.Value);
        if (p.InStock == true)  q = q.Where(x => x.Stock > 0);
        if (p.InStock == false) q = q.Where(x => x.Stock == 0);

        // 3. count BEFORE paging
        int total = await q.CountAsync();

        // 4. sort (whitelist) + tie-breaker
        bool desc = p.SortOrder == "desc";
        q = p.SortBy switch
        {
            "name"      => desc ? q.OrderByDescending(x => x.Name).ThenBy(x => x.Id)      : q.OrderBy(x => x.Name).ThenBy(x => x.Id),
            "price"     => desc ? q.OrderByDescending(x => x.Price).ThenBy(x => x.Id)     : q.OrderBy(x => x.Price).ThenBy(x => x.Id),
            "stock"     => desc ? q.OrderByDescending(x => x.Stock).ThenBy(x => x.Id)     : q.OrderBy(x => x.Stock).ThenBy(x => x.Id),
            "createdAt" => desc ? q.OrderByDescending(x => x.CreatedAt).ThenBy(x => x.Id) : q.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id),
            _           => desc ? q.OrderByDescending(x => x.Id) : q.OrderBy(x => x.Id)
        };

        // 5. page + project to DTO
        var items = await q.Skip((p.Page - 1) * p.PageSize).Take(p.PageSize)
            .Select(x => new ProductDto(x.Id, x.Name, x.Sku, x.Category, x.Price, x.Stock, x.ImageUrl))
            .ToListAsync();

        var result = new PagedResult<ProductDto> { Items = items, Page = p.Page, PageSize = p.PageSize, TotalCount = total };

        // optional: metadata also in a header
        Response.Headers["X-Pagination"] = JsonSerializer.Serialize(new { result.Page, result.PageSize, result.TotalCount, result.TotalPages });
        return result;
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        var dto = await _db.Products.AsNoTracking().Where(x => x.Id == id)
            .Select(x => new ProductDto(x.Id, x.Name, x.Sku, x.Category, x.Price, x.Stock, x.ImageUrl))
            .FirstOrDefaultAsync();
        return dto is null ? NotFound() : dto;
    }
}`,
      result: `GET /api/products?search=o&minPrice=1000&sortBy=stock&sortOrder=asc&page=2&pageSize=2 -> 200
X-Pagination: {"Page":2,"PageSize":2,"TotalCount":5,"TotalPages":3}
{
  "items": [
    { "id": 1, "name": "Laptop",  "sku": "LAP-001", "category": "Electronics", "price": 65000.00, "stock": 5, "imageUrl": null },
    { "id": 6, "name": "Monitor", "sku": "MON-001", "category": "Electronics", "price": 15999.00, "stock": 7, "imageUrl": null }
  ],
  "page": 2, "pageSize": 2, "totalCount": 5, "totalPages": 3, "hasPrevious": true, "hasNext": true
}

GET /api/products?category=Electronics&inStock=true&sortBy=price&sortOrder=desc&pageSize=5
-> items: Laptop 65000.00, Monitor 15999.00, Webcam 2999.00, Mouse 799.00; totalCount 4, totalPages 1

GET /api/products?sortBy=password -> 400 { "errors": { "SortBy": [ "sortBy must be id, name, price, stock or createdAt" ] } }
GET /api/products?pageSize=1000    -> pageSize used = 50
GET /api/products?minPrice=5000&maxPrice=100 -> 400 { "message": "minPrice cannot be greater than maxPrice" }

SQL generated by EF Core (Output window):
SELECT COUNT(*) FROM [Products] AS [p] WHERE ([p].[Name] LIKE N'%o%' OR [p].[Sku] LIKE N'%o%') AND [p].[Price] >= @minPrice
SELECT [p].[Id], [p].[Name], ... FROM [Products] AS [p]
WHERE ([p].[Name] LIKE N'%o%' OR [p].[Sku] LIKE N'%o%') AND [p].[Price] >= @minPrice
ORDER BY [p].[Stock], [p].[Id] OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY`,
      explanation: `The same IQueryable is used twice: once for CountAsync (total before paging) and once for the page. The search also checks Sku: with SQL Server's case-insensitive collation only MOU-001 (Mouse, price 799 - removed by minPrice) and MON-001 (Monitor - already matched by name) contain an O, so the result equals the console example. Prices come back with two decimals because the column is decimal(18,2). Sorting uses a whitelist validated with RegularExpression, so user input never reaches SQL text.`,
    },
    {
      title: 'Same query in SQL Server: OFFSET / FETCH',
      scenario: 'See the SQL that pagination, search, filter and sort produce (run in the SSMS Lab).',
      steps: [
        'Open SSMS > New Query (Ctrl+N)',
        'Paste the script and press F5',
        'Compare the second result with page 2 of the console example and the API',
      ],
      code: `CREATE DATABASE ProductApiDB;
GO
USE ProductApiDB;
GO
CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    Stock INT NOT NULL
);
GO
INSERT INTO Products (Name, Category, Price, Stock) VALUES
('Laptop', 'Electronics', 65000, 5),
('Mouse', 'Electronics', 799, 120),
('Keyboard', 'Electronics', 1499, 0),
('Office Chair', 'Furniture', 8999, 12),
('Desk', 'Furniture', 12999, 3),
('Monitor', 'Electronics', 15999, 7),
('Notebook', 'Stationery', 60, 500),
('Pen Pack', 'Stationery', 120, 0),
('Webcam', 'Electronics', 2999, 15),
('Bookshelf', 'Furniture', 6999, 2);
GO
-- total count for the metadata
SELECT COUNT(*) AS TotalCount FROM Products WHERE Name LIKE '%o%' AND Price >= 1000;
-- page 2, page size 2, sorted by stock
SELECT Id, Name, Category, Price, Stock FROM Products
WHERE Name LIKE '%o%' AND Price >= 1000
ORDER BY Stock ASC, Id ASC
OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY;
-- Electronics in stock, price high to low, first page of 5
SELECT Id, Name, Price, Stock FROM Products
WHERE Category = 'Electronics' AND Stock > 0
ORDER BY Price DESC
OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY;`,
      tsql: `CREATE DATABASE ProductApiDB;
GO
USE ProductApiDB;
GO
CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    Stock INT NOT NULL
);
GO
INSERT INTO Products (Name, Category, Price, Stock) VALUES
('Laptop', 'Electronics', 65000, 5),
('Mouse', 'Electronics', 799, 120),
('Keyboard', 'Electronics', 1499, 0),
('Office Chair', 'Furniture', 8999, 12),
('Desk', 'Furniture', 12999, 3),
('Monitor', 'Electronics', 15999, 7),
('Notebook', 'Stationery', 60, 500),
('Pen Pack', 'Stationery', 120, 0),
('Webcam', 'Electronics', 2999, 15),
('Bookshelf', 'Furniture', 6999, 2);
GO
SELECT COUNT(*) AS TotalCount FROM Products WHERE Name LIKE '%o%' AND Price >= 1000;
SELECT Id, Name, Category, Price, Stock FROM Products
WHERE Name LIKE '%o%' AND Price >= 1000
ORDER BY Stock ASC, Id ASC
OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY;
SELECT Id, Name, Price, Stock FROM Products
WHERE Category = 'Electronics' AND Stock > 0
ORDER BY Price DESC
OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY;`,
      result: `(10 rows affected)

+------------+
| TotalCount |
+------------+
| 5          |
+------------+
1 row(s) returned

+----+---------+-------------+-------+-------+
| Id | Name    | Category    | Price | Stock |
+----+---------+-------------+-------+-------+
| 1  | Laptop  | Electronics | 65000 | 5     |
| 6  | Monitor | Electronics | 15999 | 7     |
+----+---------+-------------+-------+-------+
2 row(s) returned

+----+---------+-------+-------+
| Id | Name    | Price | Stock |
+----+---------+-------+-------+
| 1  | Laptop  | 65000 | 5     |
| 6  | Monitor | 15999 | 7     |
| 9  | Webcam  | 2999  | 15    |
| 2  | Mouse   | 799   | 120   |
+----+---------+-------+-------+
4 row(s) returned`,
      explanation: `OFFSET skips (page - 1) * pageSize rows and FETCH NEXT takes pageSize rows; SQL Server requires ORDER BY for OFFSET/FETCH. The lab prints DECIMAL values without trailing zeros (65000); real SQL Server shows 65000.00. LIKE '%o%' matches "Office Chair" because SQL Server's default collation is case-insensitive.`,
    },
    {
      title: 'Upload a product image and import products from CSV',
      scenario: 'Add image upload (single file), gallery upload (multiple files) and CSV import to the Product API.',
      steps: [
        'Create the folder wwwroot/images/products in the project (right-click project > Add > New Folder)',
        'In Program.cs add app.UseStaticFiles(); before app.MapControllers();',
        'Add Dtos/UploadDtos.cs and the upload actions below to ProductsController',
        'Ctrl+F5; Swagger shows a "Choose File" button for multipart endpoints',
        'Postman: POST {{baseUrl}}/api/products/1/image > Body > form-data > key "File" type File > select laptop.png > Send',
        'Open the returned imageUrl in the browser: https://localhost:7001/images/products/<guid>.png',
        'Postman: POST {{baseUrl}}/api/products/import > Body > form-data > key "File" (File) > products.csv > Send',
      ],
      code: `// Dtos/UploadDtos.cs
namespace ProductApi.Dtos;
public class ProductImageUploadDto
{
    public IFormFile File { get; set; } = default!;
    public string? AltText { get; set; }
}
public class CsvUploadDto
{
    public IFormFile File { get; set; } = default!;
}

// ProductsController - upload actions
private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
private const long MaxImageBytes = 2 * 1024 * 1024;          // 2 MB

// POST api/products/1/image   (multipart/form-data)
[HttpPost("{id:int}/image")]
[Consumes("multipart/form-data")]
[RequestSizeLimit(5 * 1024 * 1024)]
public async Task<IActionResult> UploadImage(int id, [FromForm] ProductImageUploadDto dto)
{
    var product = await _db.Products.FindAsync(id);
    if (product is null) return NotFound(new { message = $"Product {id} not found" });

    var file = dto.File;
    if (file is null || file.Length == 0)
        return BadRequest(new { message = "Please choose a file" });
    if (file.Length > MaxImageBytes)
        return BadRequest(new { message = "Image must be 2 MB or smaller" });

    string ext = Path.GetExtension(file.FileName).ToLowerInvariant();
    if (!AllowedImageExtensions.Contains(ext))
        return BadRequest(new { message = "Only .jpg, .jpeg, .png and .webp files are allowed" });
    if (!await HasImageSignatureAsync(file))
        return BadRequest(new { message = "File content is not a valid image" });

    // safe, unique file name - never trust file.FileName
    string fileName = $"{Guid.NewGuid():N}{ext}";
    string folder = Path.Combine(_env.WebRootPath, "images", "products");
    Directory.CreateDirectory(folder);
    string fullPath = Path.Combine(folder, fileName);

    await using (var stream = new FileStream(fullPath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    // delete the old image file, if any
    if (!string.IsNullOrEmpty(product.ImageUrl))
    {
        string oldPath = Path.Combine(_env.WebRootPath, product.ImageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
    }

    product.ImageUrl = $"/images/products/{fileName}";
    await _db.SaveChangesAsync();
    _logger.LogInformation("Image {FileName} ({Bytes} bytes) uploaded for product {ProductId}", fileName, file.Length, id);

    return Ok(new { product.Id, product.ImageUrl, size = file.Length, originalName = file.FileName });
}

// POST api/products/1/gallery   (several files with the same key "files")
[HttpPost("{id:int}/gallery")]
[Consumes("multipart/form-data")]
public async Task<IActionResult> UploadGallery(int id, [FromForm] List<IFormFile> files)
{
    if (files.Count == 0 || files.Count > 5)
        return BadRequest(new { message = "Upload between 1 and 5 images" });

    var saved = new List<string>();
    foreach (var f in files)
    {
        string ext = Path.GetExtension(f.FileName).ToLowerInvariant();
        if (f.Length == 0 || f.Length > MaxImageBytes || !AllowedImageExtensions.Contains(ext)) continue;
        string name = $"{id}-{Guid.NewGuid():N}{ext}";
        string path = Path.Combine(_env.WebRootPath, "images", "products", name);
        await using var s = System.IO.File.Create(path);
        await f.CopyToAsync(s);
        saved.Add($"/images/products/{name}");
    }
    return Ok(new { uploaded = saved.Count, skipped = files.Count - saved.Count, urls = saved });
}

// POST api/products/import   CSV: Name,Sku,Category,Price,Stock
[HttpPost("import")]
[Consumes("multipart/form-data")]
public async Task<IActionResult> ImportCsv([FromForm] CsvUploadDto dto)
{
    if (dto.File is null || !dto.File.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
        return BadRequest(new { message = "Upload a .csv file" });

    var errors = new List<string>();
    var toAdd = new List<Product>();
    using var reader = new StreamReader(dto.File.OpenReadStream());
    int lineNo = 0;
    string? line;
    while ((line = await reader.ReadLineAsync()) != null)
    {
        lineNo++;
        if (lineNo == 1 || string.IsNullOrWhiteSpace(line)) continue;           // header
        string[] c = line.Split(',');
        if (c.Length != 5) { errors.Add($"Line {lineNo}: expected 5 columns"); continue; }
        if (!decimal.TryParse(c[3], System.Globalization.NumberStyles.Number, System.Globalization.CultureInfo.InvariantCulture, out decimal price) || price <= 0)
        { errors.Add($"Line {lineNo}: price must be a positive number"); continue; }
        if (!int.TryParse(c[4], out int stock) || stock < 0)
        { errors.Add($"Line {lineNo}: stock must be 0 or more"); continue; }
        if (await _db.Products.AnyAsync(p => p.Sku == c[1]) || toAdd.Any(p => p.Sku == c[1]))
        { errors.Add($"Line {lineNo}: SKU {c[1]} already exists"); continue; }

        toAdd.Add(new Product { Name = c[0].Trim(), Sku = c[1].Trim(), Category = c[2].Trim(), Price = price, Stock = stock });
    }

    _db.Products.AddRange(toAdd);
    await _db.SaveChangesAsync();
    return Ok(new { imported = toAdd.Count, errors });
}

private static async Task<bool> HasImageSignatureAsync(IFormFile file)
{
    byte[] header = new byte[12];
    await using var s = file.OpenReadStream();
    int read = await s.ReadAsync(header);
    if (read < 4) return false;
    bool png  = header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47;
    bool jpg  = header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;
    bool webp = read >= 12 && header[0] == 0x52 && header[1] == 0x49 && header[8] == 0x57 && header[9] == 0x45;  // RIFF....WEBP
    return png || jpg || webp;
}

/* products.csv
Name,Sku,Category,Price,Stock
USB Cable,USB-001,Electronics,249,300
Standing Desk,DSK-002,Furniture,24999,4
Marker Set,MRK-001,Stationery,abc,50
Laptop Stand,LAP-001,Electronics,1999,20
Stapler,STP-001,Stationery,180,40
*/`,
      result: `POST /api/products/1/image  (form-data: File = laptop.png, 184 KB)
-> 200 { "id": 1, "imageUrl": "/images/products/3f6c1a0e9b2d4c7e8a1b2c3d4e5f6a7b.png", "size": 188416, "originalName": "laptop.png" }
GET https://localhost:7001/images/products/3f6c1a0e9b2d4c7e8a1b2c3d4e5f6a7b.png -> the image is displayed
GET /api/products/1 -> { ..., "imageUrl": "/images/products/3f6c1a0e....png" }

Upload resume.pdf           -> 400 { "message": "Only .jpg, .jpeg, .png and .webp files are allowed" }
Upload virus.exe renamed .png -> 400 { "message": "File content is not a valid image" }
Upload 6 MB photo           -> 400 { "message": "Image must be 2 MB or smaller" } (or 413 Payload Too Large above the 5 MB request limit)
Upload to product 999       -> 404 { "message": "Product 999 not found" }

POST /api/products/1/gallery (files = a.jpg, b.png, notes.txt) -> 200 { "uploaded": 2, "skipped": 1, "urls": [ "/images/products/1-....jpg", "/images/products/1-....png" ] }

POST /api/products/import (products.csv)
-> 200
{
  "imported": 3,
  "errors": [
    "Line 4: price must be a positive number",
    "Line 5: SKU LAP-001 already exists"
  ]
}`,
      explanation: `[FromForm] tells ASP.NET Core to read multipart/form-data; the form key must match the property name ("File" or "files"). Extension checks are easy to fool, so the magic-byte check reads the first bytes of the file (PNG starts with 89 50 4E 47, JPEG with FF D8 FF). The stored name is a Guid, so two users uploading "photo.png" never overwrite each other and a malicious name like ../../Program.cs is ignored. The GUID and sizes in the output are examples - yours will differ. The CSV parser is simple (no quoted commas); use a library such as CsvHelper for real imports.`,
    },
  ],
  interview: [
    { q: 'Why must you sort before paging?', a: 'Without ORDER BY the database may return rows in any order, so the same row can appear on two pages or never. SQL Server even requires ORDER BY for OFFSET/FETCH. Add a unique tie-breaker (Id) for stable pages.', level: 'Medium' },
    { q: 'How do you calculate Skip and TotalPages?', a: 'Skip = (page - 1) * pageSize. TotalPages = ceiling(totalCount / pageSize), e.g. 135 rows with pageSize 20 -> 7 pages.', level: 'Easy' },
    { q: 'Why limit the maximum page size?', a: 'To protect the server and database from huge queries and responses (accidental or malicious, e.g. pageSize=1000000). Clamp it to a maximum such as 50 or 100.', level: 'Easy' },
    { q: 'Offset vs keyset (cursor) pagination?', a: 'Offset uses OFFSET/FETCH and allows jumping to any page, but deep pages get slower and inserts can shift rows. Keyset uses WHERE Id > @lastId ORDER BY Id with an index - fast and stable at any depth, ideal for infinite scroll, but no random page jumps.', level: 'Hard' },
    { q: 'How do you implement dynamic sorting safely?', a: 'Accept sortBy/sortOrder, validate against a whitelist, and map each allowed value to a strongly typed OrderBy lambda (switch expression). Never concatenate the input into SQL.', level: 'Medium' },
    { q: 'Why build filters on IQueryable instead of IEnumerable?', a: 'IQueryable builds an expression tree that EF Core translates into one SQL query with WHERE/ORDER BY/OFFSET, so filtering happens in the database. With IEnumerable all rows would be loaded and filtered in memory.', level: 'Medium' },
    { q: 'What is IFormFile?', a: 'The ASP.NET Core abstraction for an uploaded file in a multipart/form-data request, with FileName, ContentType, Length, OpenReadStream() and CopyToAsync().', level: 'Easy' },
    { q: 'How do you secure file uploads?', a: 'Limit size, allow-list extensions, verify file signatures, generate random server-side names, store outside wwwroot if private (or in blob storage), scan for malware when needed, never execute uploaded files, and require authentication.', level: 'Hard' },
    { q: 'Why not use file.FileName to save the file?', a: 'It is client-controlled: it can contain path traversal (../../), collide with existing files, contain invalid characters, or overwrite another user\'s file. Generate a GUID-based name and keep the original only as metadata.', level: 'Medium' },
    { q: 'What are the default upload size limits?', a: 'Kestrel MaxRequestBodySize is 30,000,000 bytes (about 28.6 MB); FormOptions.MultipartBodyLengthLimit is 128 MB. Change with [RequestSizeLimit], [DisableRequestSizeLimit] or server options. Exceeding returns 413.', level: 'Hard' },
    { q: 'Output question: totalCount = 41, pageSize = 10. What is totalPages and what does page 5 contain?', a: 'totalPages = 5 (ceiling of 4.1). Page 5 skips 40 rows and contains 1 item.', level: 'Medium' },
    { q: 'Output question: page=0 is sent to an API that computes Skip((page-1)*pageSize). What happens?', a: 'Skip receives a negative number. LINQ to Objects treats it as 0, but EF Core/SQL Server fails because OFFSET cannot be negative (500). Validate page >= 1 ([Range(1, int.MaxValue)]) to return 400 instead.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a GET /api/products/categories endpoint that returns each category with its product count and average price, sorted by count descending.',
      hint: 'GroupBy + Select on IQueryable translates to GROUP BY.',
      solution: `[HttpGet("categories")]
public async Task<IActionResult> Categories() =>
    Ok(await _db.Products.GroupBy(p => p.Category)
        .Select(g => new { category = g.Key, count = g.Count(), averagePrice = g.Average(p => p.Price) })
        .OrderByDescending(x => x.count)
        .ToListAsync());`,
    },
    {
      task: 'Write a reusable extension method ToPagedResultAsync<T>(this IQueryable<T> query, int page, int pageSize) and use it in GetAll.',
      hint: 'Do CountAsync and Skip/Take inside the extension.',
      solution: `public static class QueryableExtensions
{
    public static async Task<PagedResult<T>> ToPagedResultAsync<T>(this IQueryable<T> query, int page, int pageSize)
    {
        int total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PagedResult<T> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
    }
}
// GetAll: return await q.Select(x => new ProductDto(...)).ToPagedResultAsync(p.Page, p.PageSize);`,
    },
    {
      task: 'Implement keyset pagination: GET /api/products/feed?afterId=20&take=10 returns the next 10 products with Id > afterId and a nextCursor.',
      hint: 'WHERE Id > afterId ORDER BY Id, Take(take); nextCursor = last item Id or null.',
      solution: `[HttpGet("feed")]
public async Task<IActionResult> Feed(int afterId = 0, int take = 10)
{
    take = Math.Clamp(take, 1, 50);
    var items = await _db.Products.AsNoTracking()
        .Where(p => p.Id > afterId).OrderBy(p => p.Id).Take(take)
        .Select(p => new ProductDto(p.Id, p.Name, p.Sku, p.Category, p.Price, p.Stock, p.ImageUrl))
        .ToListAsync();
    int? next = items.Count == take ? items[^1].Id : null;
    return Ok(new { items, nextCursor = next });
}`,
    },
    {
      task: 'Add GET /api/products/{id}/image/download that returns the stored image as a file download.',
      hint: 'PhysicalFile(path, contentType, downloadName).',
      solution: `[HttpGet("{id:int}/image/download")]
public async Task<IActionResult> DownloadImage(int id)
{
    var p = await _db.Products.FindAsync(id);
    if (p?.ImageUrl is null) return NotFound();
    string path = Path.Combine(_env.WebRootPath, p.ImageUrl.TrimStart('/'));
    if (!System.IO.File.Exists(path)) return NotFound();
    string type = Path.GetExtension(path) == ".png" ? "image/png" : "image/jpeg";
    return PhysicalFile(path, type, $"{p.Sku}{Path.GetExtension(path)}");
}`,
    },
    {
      task: 'Allow searching across multiple categories: ?categories=Electronics&categories=Furniture.',
      hint: 'Bind a List<string> from the query string and use Contains (translated to SQL IN).',
      solution: `public List<string> Categories { get; set; } = new();   // in ProductQueryParameters
if (p.Categories.Count > 0)
    q = q.Where(x => p.Categories.Contains(x.Category));
// SQL: WHERE [p].[Category] IN (N'Electronics', N'Furniture')`,
    },
  ],
  quiz: [
    { question: 'For page = 3 and pageSize = 20, how many rows are skipped?', options: ['60', '20', '40', '3'], answer: 2, explanation: '(3 - 1) * 20 = 40.' },
    { question: 'Which SQL Server clause pair implements paging?', options: ['TOP / LIMIT', 'OFFSET ... ROWS FETCH NEXT ... ROWS ONLY', 'SKIP / TAKE', 'ROWNUM / LIMIT'], answer: 1, explanation: 'EF Core translates Skip/Take into OFFSET/FETCH (with ORDER BY).' },
    { question: 'Which attribute binds a ProductQueryParameters object from the query string?', options: ['[FromQuery]', '[FromBody]', '[FromForm]', '[FromRoute]'], answer: 0, explanation: '[FromQuery] reads values from the URL query string.' },
    { question: 'Which Content-Type is used for file uploads?', options: ['application/json', 'text/plain', 'application/octet-stream only', 'multipart/form-data'], answer: 3, explanation: 'multipart/form-data carries files and form fields together.' },
    { question: 'The safest file name to store an upload under is:', options: ['file.FileName', 'A server-generated GUID plus a validated extension', 'The product name', 'The user email'], answer: 1, explanation: 'Server-generated names avoid path traversal and collisions.' },
  ],
};
