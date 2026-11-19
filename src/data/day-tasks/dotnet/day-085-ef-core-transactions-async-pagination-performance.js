export default {
  lesson: 'day-085-ef-core-transactions-async-pagination-performance',
  minutes: 35,
  intro: 'Keep related changes atomic with transactions, use async EF Core methods, page large tables with Skip/Take and spot the common performance mistakes.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A fee payment must (1) insert a Payment row and (2) update the Student balance. If step 2 fails, what should happen?',
      options: ['Keep the payment row, it is fine', 'Both changes are rolled back, because they run in one transaction', 'Retry step 2 forever', 'Delete the student'],
      answer: 1,
      explain: 'A **transaction** is all-or-nothing (atomic). One `SaveChanges` already runs in a transaction; for several `SaveChanges` calls use `BeginTransactionAsync()` + `CommitAsync()`, and anything not committed is rolled back.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that starts an explicit transaction:\n```\nawait using var tx = await _db.Database.______();\n// ... several SaveChangesAsync calls ...\nawait tx.CommitAsync();\n```',
      example: { title: 'rolling back on error', code: 'catch { await tx.RollbackAsync(); throw; }' },
      accept: ['BeginTransactionAsync'],
      acceptRegex: ['^BeginTransactionAsync(\\(\\))?$'],
      caseSensitive: true,
      explain: '`Database.BeginTransactionAsync()` opens a transaction on the context\'s connection. If `CommitAsync` is never reached (exception), disposing the transaction rolls it back.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The Students table has **47** rows. A page request uses `page = 3`, `pageSize = 10`. What do `skip`, the number of items returned, and `totalPages` print? Then for `page = 5`? Type the 6 numbers as two lines: `skip items totalPages`.',
      example: { title: 'pagination maths', code: 'skip = (page - 1) * pageSize;\ntotalPages = (int)Math.Ceiling(total / (double)pageSize);' },
      code: `int total = await _db.Students.CountAsync();     // 47
int skip = (page - 1) * pageSize;
var items = await _db.Students.OrderBy(s => s.Id)
                              .Skip(skip).Take(pageSize)
                              .ToListAsync();
int totalPages = (int)Math.Ceiling(total / (double)pageSize);
Console.WriteLine($"{skip} {items.Count} {totalPages}");`,
      expected: `20 10 5
40 7 5`,
      explain: 'Page 3 skips 20 rows and takes 10. Page 5 skips 40, and only 7 rows are left. 47 / 10 = 4.7 → Ceiling = **5** pages. Integer division (`47 / 10 = 4`) would lose the last page - a classic bug. Always `OrderBy` before `Skip/Take`, or the pages are unpredictable.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 6,
      q: '**The SQL for Skip/Take.** Return page **2** with page size **3** of the `Products` table ordered by `Id` (all columns) using `OFFSET ... FETCH NEXT ...`.',
      example: { title: 'page 1 of size 5', code: 'SELECT * FROM Orders\nORDER BY Id\nOFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY;' },
      setup: `CREATE TABLE Products (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(50),
  Price INT
);
INSERT INTO Products (Name, Price) VALUES
('Pen', 10), ('Notebook', 60), ('Bag', 899), ('Bottle', 249),
('Lamp', 499), ('Mouse', 399), ('Keyboard', 799), ('Charger', 599);`,
      starter: '-- TODO: page 2, size 3\nSELECT * FROM Products ORDER BY Id;\n',
      solution: 'SELECT Id, Name, Price\nFROM Products\nORDER BY Id\nOFFSET 3 ROWS FETCH NEXT 3 ROWS ONLY;\n',
      ordered: true,
      explain: 'EF Core turns `.OrderBy(p => p.Id).Skip(3).Take(3)` into exactly this. OFFSET = (page - 1) × size = 3. SQL Server requires ORDER BY for OFFSET/FETCH.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are real EF Core performance improvements? (choose all that apply)',
      options: [
        'Use AsNoTracking() for read-only queries',
        'Select only the needed columns with a projection (Select(s => new { s.Id, s.Name }))',
        'Call ToList() first and filter with Where afterwards in memory',
        'Avoid N+1 queries with Include or projections',
        'Add database indexes on columns used in WHERE and JOIN',
      ],
      answers: [0, 1, 3, 4],
      explain: 'Filter, sort and page **in the database** (before `ToList`), load only what you need, skip tracking for reads and index the columns you search. Calling `ToList()` first downloads the whole table into memory.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: '**Write the paging helper** your API service uses. `paginate(items, page, pageSize)` returns `{ items, page, pageSize, totalCount, totalPages }` where `items` is the slice for that page. If `page < 1` treat it as 1; if `pageSize > 50` cap it at 50.',
      example: { title: 'slicing an array', code: '[1,2,3,4,5].slice(2, 4) // [3, 4]' },
      starter: 'function paginate(items, page, pageSize) {\n  // TODO\n}\n',
      solution: 'function paginate(items, page, pageSize) {\n  page = Math.max(1, page);\n  pageSize = Math.min(50, pageSize);\n  const skip = (page - 1) * pageSize;\n  return {\n    items: items.slice(skip, skip + pageSize),\n    page,\n    pageSize,\n    totalCount: items.length,\n    totalPages: Math.ceil(items.length / pageSize),\n  };\n}\n',
      tests: [
        { call: 'paginate([1,2,3,4,5,6,7], 3, 3)', expect: { items: [7], page: 3, pageSize: 3, totalCount: 7, totalPages: 3 } },
        { call: 'paginate([1,2,3,4,5], 0, 2)', expect: { items: [1, 2], page: 1, pageSize: 2, totalCount: 5, totalPages: 3 } },
        { call: 'paginate(Array.from({ length: 120 }, (_, i) => i), 1, 500).items.length', expect: 50, msg: 'pageSize must be capped at 50' },
      ],
      explain: 'Returning `totalCount` and `totalPages` lets the React UI draw page buttons. Capping `pageSize` protects the API from a client asking for 1,000,000 rows in one request - a simple but important defence.',
    },
  ],
};
