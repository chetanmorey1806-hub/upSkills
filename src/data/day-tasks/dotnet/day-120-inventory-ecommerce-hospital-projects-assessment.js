export default {
  lesson: 'day-120-inventory-ecommerce-hospital-projects-assessment',
  minutes: 40,
  intro: 'Final assessment: inventory and e-commerce SQL reports, a cart total with GST, a hospital appointment rule and interview-style questions across the whole course.',
  tasks: [
    {
      type: 'code',
      lang: 'tsql',
      mins: 7,
      q: '**Inventory: reorder report.** List `Name`, `Stock` and `ReorderLevel` of products whose stock is **at or below** their reorder level, with the most urgent first (smallest `Stock - ReorderLevel`), then by `Name`.',
      example: { title: 'ordering by an expression', code: 'SELECT Name, Price, Cost\nFROM Products\nORDER BY Price - Cost DESC;' },
      setup: `CREATE TABLE Products (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(50),
  Stock INT,
  ReorderLevel INT
);
INSERT INTO Products (Name, Stock, ReorderLevel) VALUES
('Pen', 40, 50), ('Notebook', 200, 100), ('Stapler', 5, 20),
('Marker', 20, 20), ('Bag', 12, 10), ('Eraser', 2, 15);`,
      starter: '-- TODO\nSELECT Name, Stock, ReorderLevel FROM Products;\n',
      solution: 'SELECT Name, Stock, ReorderLevel\nFROM Products\nWHERE Stock <= ReorderLevel\nORDER BY Stock - ReorderLevel, Name;\n',
      ordered: true,
      explain: 'Stapler (-15) and Eraser (-13) are most urgent, then Pen (-10) and Marker (0, exactly at the level - `<=` includes it). Bag and Notebook are fine. In the Inventory project this report feeds a "Low stock" dashboard card.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 8,
      q: '**E-commerce: order totals.** For each order show `OrderId`, `Customer` (name), `Items` (sum of quantities) and `Amount` (sum of `Qty * Price`), only for orders with an amount **above 1000**, ordered by `Amount` descending.',
      example: { title: 'HAVING on a calculated sum', code: 'SELECT CustomerId, SUM(Amount) AS Spent\nFROM Payments\nGROUP BY CustomerId\nHAVING SUM(Amount) > 5000;' },
      setup: `CREATE TABLE Customers (Id INT PRIMARY KEY, Name NVARCHAR(50));
CREATE TABLE Orders (Id INT PRIMARY KEY, CustomerId INT);
CREATE TABLE OrderItems (OrderId INT, Product NVARCHAR(50), Qty INT, Price INT);
INSERT INTO Customers VALUES (1, 'Asha'), (2, 'Ravi');
INSERT INTO Orders VALUES (101, 1), (102, 2), (103, 1);
INSERT INTO OrderItems VALUES
(101, 'Mouse', 2, 399), (101, 'Keyboard', 1, 799),
(102, 'Pen', 10, 10),
(103, 'Monitor', 1, 8999), (103, 'Cable', 3, 149);`,
      starter: '-- TODO\nSELECT * FROM Orders;\n',
      solution: 'SELECT o.Id AS OrderId, c.Name AS Customer, SUM(i.Qty) AS Items, SUM(i.Qty * i.Price) AS Amount\nFROM Orders o\nJOIN Customers c ON c.Id = o.CustomerId\nJOIN OrderItems i ON i.OrderId = o.Id\nGROUP BY o.Id, c.Name\nHAVING SUM(i.Qty * i.Price) > 1000\nORDER BY Amount DESC;\n',
      ordered: true,
      explain: 'Order 103 = 8999 + 447 = 9446, order 101 = 798 + 799 = 1597, order 102 = 100 (filtered out by HAVING). Line totals are `Qty * Price` summed per order - store the price on the order line so later price changes do not alter old orders.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: '**Cart total with coupon and GST.** Write `cartTotal(items, coupon)` where `items = [{ price, qty }]`:\n- `subtotal` = sum of price × qty\n- coupon `"SAVE10"` → 10% off subtotal, but only if subtotal >= 1000; any other coupon → no discount\n- `gst` = 18% of (subtotal - discount)\n- return `{ subtotal, discount, gst, total }`, each rounded to 2 decimals (`Math.round(x * 100) / 100`)',
      example: { title: 'summing with reduce', code: 'const sum = items.reduce((s, i) => s + i.price * i.qty, 0);' },
      starter: 'function cartTotal(items, coupon) {\n  // TODO\n}\n',
      solution: 'function cartTotal(items, coupon) {\n  const r = (x) => Math.round(x * 100) / 100;\n  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);\n  const discount = coupon === "SAVE10" && subtotal >= 1000 ? subtotal * 0.1 : 0;\n  const gst = (subtotal - discount) * 0.18;\n  return { subtotal: r(subtotal), discount: r(discount), gst: r(gst), total: r(subtotal - discount + gst) };\n}\n',
      tests: [
        { call: 'cartTotal([{ price: 399, qty: 2 }, { price: 799, qty: 1 }], "SAVE10")', expect: { subtotal: 1597, discount: 159.7, gst: 258.71, total: 1696.01 } },
        { call: 'cartTotal([{ price: 100, qty: 3 }], "SAVE10")', expect: { subtotal: 300, discount: 0, gst: 54, total: 354 }, msg: 'Coupon needs subtotal >= 1000' },
        { call: 'cartTotal([{ price: 500, qty: 2 }], "FREE")', expect: { subtotal: 1000, discount: 0, gst: 180, total: 1180 }, msg: 'Unknown coupons give no discount' },
      ],
      explain: 'Discount first, then tax on the discounted amount - the order matters for GST. In C# use `decimal` (not double) for money; here we round to 2 decimals to show what the invoice would print. Always recalculate totals on the server: never trust prices sent from the browser.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: '**Hospital appointment slots.** Write `freeSlots(booked, start, end, minutes)` returning the list of free slot start times (`"HH:MM"`) between `start` and `end` (e.g. `"10:00"` to `"12:00"`) in steps of `minutes`, excluding times in `booked`.',
      example: { title: 'time ↔ minutes', code: 'const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));\nconst toTime = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");' },
      starter: 'function freeSlots(booked, start, end, minutes) {\n  // TODO\n}\n',
      solution: 'function freeSlots(booked, start, end, minutes) {\n  const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));\n  const toTime = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");\n  const out = [];\n  for (let m = toMin(start); m + minutes <= toMin(end); m += minutes) {\n    const t = toTime(m);\n    if (!booked.includes(t)) out.push(t);\n  }\n  return out;\n}\n',
      tests: [
        { call: 'freeSlots(["10:30", "11:00"], "10:00", "12:00", 30)', expect: ['10:00', '11:30'] },
        { call: 'freeSlots([], "09:00", "10:00", 20)', expect: ['09:00', '09:20', '09:40'] },
        { call: 'freeSlots(["09:00"], "09:00", "09:30", 30)', expect: [] },
      ],
      explain: 'A slot is valid only if it **ends** by the closing time (`m + minutes <= end`). In the Hospital project the API computes free slots from the doctor\'s schedule and existing appointments, and a unique index (DoctorId, Date, Time) prevents double booking.',
    },
    {
      type: 'multi',
      mins: 3,
      q: '**Interview round.** Which statements are TRUE? (choose all that apply)',
      options: [
        'Scoped services live for one HTTP request; DbContext is registered as scoped',
        'IQueryable builds a SQL query executed in the database; IEnumerable filters in memory after loading',
        '401 = not authenticated, 403 = authenticated but not allowed',
        'A JWT is encrypted, so its payload cannot be read without the key',
        'Middleware order matters: UseAuthentication must run before UseAuthorization',
        'PUT replaces a resource, PATCH changes part of it',
      ],
      answers: [0, 1, 2, 4, 5],
      explain: 'These are the most common .NET full-stack interview checks. The trap: a JWT is **signed**, not encrypted - anyone can Base64-decode the payload, so never put secrets in it.',
    },
    {
      type: 'output',
      mins: 4,
      q: '**Interview round: predict the output.** What does this C# code print?',
      example: { title: 'deferred execution', code: 'var q = list.Where(x => x > 2); // not run yet\nlist.Add(5);\nq.Count();  // runs now, sees 5' },
      code: `var stock = new List<int> { 5, 12, 0, 8 };
var low = stock.Where(s => s < 10);

stock.Add(3);
Console.WriteLine(low.Count());

var snapshot = low.ToList();
stock.Add(1);
Console.WriteLine(low.Count() + " " + snapshot.Count);`,
      expected: `4
5 4`,
      explain: 'LINQ queries are **deferred**: `low` is re-evaluated each time it is enumerated, so it sees the added 3 (5, 0, 8, 3 → 4) and later the 1 (→ 5). `ToList()` takes a snapshot that does not change. The same rule explains why EF Core queries hit the database only on `ToList()`/`Count()`.',
    },
  ],
};
