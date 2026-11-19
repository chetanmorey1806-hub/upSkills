export default {
  lesson: 'extra-50-ef-core-advanced',
  minutes: 30,
  intro: 'Use EF Core change tracking, eager loading, AsNoTracking, global query filters, concurrency tokens and bulk updates correctly.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'What does this EF Core code print? (one `EntityState` per line)',
      example: { title: 'checking state', code: 'Console.WriteLine(db.Entry(product).State);' },
      code: `using var db = new ShopContext();
var p = new Product { Name = "Pen", Price = 20 };
Console.WriteLine(db.Entry(p).State);
db.Products.Add(p);
Console.WriteLine(db.Entry(p).State);
db.SaveChanges();
Console.WriteLine(db.Entry(p).State);
p.Price = 25;
db.ChangeTracker.DetectChanges();
Console.WriteLine(db.Entry(p).State);
db.Products.Remove(p);
Console.WriteLine(db.Entry(p).State);`,
      expected: `Detached
Added
Unchanged
Modified
Deleted`,
      explain: 'A new object is not tracked (Detached). `Add` marks it Added; after `SaveChanges` it becomes Unchanged. Changing a property makes it Modified (detected automatically before saving, or by `DetectChanges`). `Remove` marks it Deleted until the next save.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Load orders **with their customer and each item's product** in one query (avoid N+1):
\`var orders = db.Orders.Include(o => o.Customer).Include(o => o.Items).______(i => i.Product).ToList();\``,
      example: { title: 'single level', code: 'db.Students.Include(s => s.Course).ToList();' },
      accept: ['ThenInclude'],
      caseSensitive: true,
      explain: '`ThenInclude` continues from the previous `Include` to load the next level (Items → Product). Without eager loading, touching `item.Product` in a loop causes one extra query per item (the N+1 problem) or a null if lazy loading is off.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A read-only product listing page loads 5,000 rows. What should you add to the query?',
      options: ['`.AsTracking()`', '`.AsNoTracking()`', '`.Include(p => p)`', '`.ToListAsync().Result`'],
      answer: 1,
      explain: '`AsNoTracking()` skips creating change-tracking snapshots, using less memory and CPU. Use it for data you only display. Tracking is needed only when you will modify and save the entities.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Soft delete: hide rows with \`IsDeleted = true\` from **every** query automatically. Complete the line in \`OnModelCreating\`:
\`modelBuilder.Entity<Student>().______(s => !s.IsDeleted);\``,
      example: { title: 'multi-tenant filter', code: 'modelBuilder.Entity<Invoice>().HasQueryFilter(i => i.TenantId == _tenantId);' },
      accept: ['HasQueryFilter'],
      caseSensitive: true,
      explain: '`HasQueryFilter` adds the condition to all LINQ queries for that entity, including Includes. Use `IgnoreQueryFilters()` on a query when an admin needs to see deleted rows.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Two admins edit the same product at the same time. Which statements about **optimistic concurrency** in EF Core are TRUE? Select all that apply.',
      options: ['Add a `[Timestamp] public byte[] RowVersion { get; set; }` property (SQL Server rowversion)', 'EF adds the original RowVersion to the UPDATE\'s WHERE clause', 'If no row is updated, EF throws `DbUpdateConcurrencyException`', 'The second save silently overwrites the first, which is the desired behaviour', 'Optimistic concurrency locks the row while the admin edits the form'],
      answers: [0, 1, 2],
      explain: 'The concurrency token is checked in `WHERE Id = @id AND RowVersion = @original`. If someone else saved first, 0 rows are affected and EF throws `DbUpdateConcurrencyException`, which you catch to show "data changed, reload". No lock is held while the user edits.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `EF Core 7+: increase the price of all Stationery products by 10 in **one SQL UPDATE**, without loading entities:
\`await db.Products.Where(p => p.Category == "Stationery").______(s => s.SetProperty(p => p.Price, p => p.Price + 10));\``,
      example: { title: 'bulk delete', code: 'await db.Logs.Where(l => l.CreatedAt < cutoff).ExecuteDeleteAsync();' },
      accept: ['ExecuteUpdateAsync', 'ExecuteUpdate'],
      caseSensitive: true,
      explain: '`ExecuteUpdateAsync` translates directly to `UPDATE ... SET Price = Price + 10 WHERE ...`. It bypasses the change tracker, so it is fast for bulk changes, but already-loaded entities are not updated in memory.',
    },
  ],
};
