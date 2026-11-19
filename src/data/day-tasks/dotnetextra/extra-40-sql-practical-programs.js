const SCHOOL = `CREATE TABLE Students (RollNo INT PRIMARY KEY, Name NVARCHAR(50));
INSERT INTO Students VALUES (1, 'Asha'), (2, 'Ravi'), (3, 'Meera'), (4, 'Kiran');
CREATE TABLE Marks (RollNo INT, Subject NVARCHAR(20), Marks INT);
INSERT INTO Marks VALUES
(1, 'Maths', 88), (1, 'Science', 92), (1, 'English', 79),
(2, 'Maths', 34), (2, 'Science', 61), (2, 'English', 70),
(3, 'Maths', 55), (3, 'Science', 48), (3, 'English', 66),
(4, 'Maths', 91), (4, 'Science', 39), (4, 'English', 85);`;

const SHOP = `CREATE TABLE Categories (CategoryId INT PRIMARY KEY, CategoryName NVARCHAR(30));
INSERT INTO Categories VALUES (1, 'Stationery'), (2, 'Electronics'), (3, 'Toys'), (4, 'Grocery');
CREATE TABLE Products (ProductId INT PRIMARY KEY, Name NVARCHAR(50), CategoryId INT, Price INT);
INSERT INTO Products VALUES (1, 'Pen', 1, 20), (2, 'Notebook', 1, 60), (3, 'Earphones', 2, 899), (4, 'Charger', 2, 499), (5, 'Mouse', 2, 650), (6, 'Rice 5kg', 4, 420);
CREATE TABLE Orders (OrderId INT PRIMARY KEY, Customer NVARCHAR(50), Amount INT);
INSERT INTO Orders VALUES (1, 'Asha', 1200), (2, 'Ravi', 5400), (3, 'Asha', 3900), (4, 'Meera', 2500), (5, 'Kiran', 700), (6, 'Ravi', 800), (7, 'Zoya', 4800);
CREATE TABLE Stock (ProductId INT, Warehouse NVARCHAR(20), Qty INT);
INSERT INTO Stock VALUES (1, 'Pune', 120), (1, 'Nagpur', 80), (2, 'Pune', 15), (2, 'Nagpur', 10), (3, 'Pune', 4), (4, 'Nagpur', 30), (5, 'Pune', 6), (5, 'Nagpur', 3), (6, 'Pune', 50);`;

export default {
  lesson: 'extra-40-sql-practical-programs',
  minutes: 35,
  intro: 'Solve real report programs (student results, catalog counts, top customers, low stock) with joins, GROUP BY, HAVING and CASE.',
  tasks: [
    {
      type: 'code',
      lang: 'tsql',
      mins: 7,
      q: `**Student result program.** For each student return \`RollNo\`, \`Name\`, \`Total\` (sum of 3 subjects), \`Average\` (\`Total / 3\`, integer) and \`Result\`:
- \`Pass\` if the student scored **at least 35 in every subject**
- otherwise \`Fail\``,
      example: { title: 'aggregate + CASE on an aggregate', code: `SELECT OrderId, SUM(Qty) AS Items,
       CASE WHEN MIN(Qty) > 0 THEN 'Complete' ELSE 'Partial' END AS Status
FROM OrderLines GROUP BY OrderId;` },
      setup: SCHOOL,
      starter: 'SELECT s.RollNo, s.Name\nFROM Students s;\n-- JOIN Marks, GROUP BY, SUM, MIN, CASE\n',
      solution: "SELECT s.RollNo, s.Name,\n       SUM(m.Marks) AS Total,\n       SUM(m.Marks) / 3 AS Average,\n       CASE WHEN MIN(m.Marks) >= 35 THEN 'Pass' ELSE 'Fail' END AS Result\nFROM Students s\nJOIN Marks m ON m.RollNo = s.RollNo\nGROUP BY s.RollNo, s.Name;",
      explain: '"At least 35 in every subject" is the same as "the **minimum** mark ≥ 35". Ravi has 34 in Maths → Fail even though his total is 165. Kiran has 39 in Science → Pass. In T-SQL `INT / INT` is integer division, so Asha\'s 259 / 3 = 86.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: '**Catalog program.** Show every `CategoryName` with its `ProductCount`, **including categories that have no products** (they must show 0).',
      example: { title: 'LEFT JOIN + COUNT(column)', code: `SELECT d.DeptName, COUNT(e.EmpId) AS Staff
FROM Departments d LEFT JOIN Employees e ON e.DeptId = d.DeptId
GROUP BY d.DeptName;` },
      setup: SHOP,
      starter: 'SELECT c.CategoryName, COUNT(*) AS ProductCount\nFROM Categories c\nJOIN Products p ON p.CategoryId = c.CategoryId\nGROUP BY c.CategoryName;\n',
      solution: 'SELECT c.CategoryName, COUNT(p.ProductId) AS ProductCount\nFROM Categories c\nLEFT JOIN Products p ON p.CategoryId = c.CategoryId\nGROUP BY c.CategoryName;',
      explain: 'An INNER JOIN drops Toys completely. With LEFT JOIN, Toys appears with NULL product columns; `COUNT(p.ProductId)` counts only non-NULL values, giving 0. `COUNT(*)` would wrongly count that NULL row as 1.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: '**Orders program.** Return the **top 3 customers** by total order amount: `Customer` and `Total`, highest first.',
      example: { title: 'TOP with ORDER BY', code: `SELECT TOP 5 Name, Marks FROM Students ORDER BY Marks DESC;` },
      setup: SHOP,
      starter: 'SELECT Customer, Amount FROM Orders;\n',
      solution: 'SELECT TOP 3 Customer, SUM(Amount) AS Total\nFROM Orders\nGROUP BY Customer\nORDER BY Total DESC;',
      ordered: true,
      explain: 'Group per customer first (Ravi 6200, Asha 5100, Zoya 4800, Meera 2500, Kiran 700), then sort descending and keep 3 with `TOP 3`. Without ORDER BY, TOP returns an arbitrary 3 rows.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 6,
      q: '**Inventory program.** Stock is spread across warehouses. List products whose **total quantity across all warehouses is below 20**: `Name` and `TotalQty`.',
      example: { title: 'HAVING filters groups', code: `SELECT City, COUNT(*) AS Customers
FROM Customers GROUP BY City
HAVING COUNT(*) >= 3;` },
      setup: SHOP,
      starter: 'SELECT p.Name, s.Qty\nFROM Products p\nJOIN Stock s ON s.ProductId = p.ProductId\nWHERE s.Qty < 20;\n',
      solution: 'SELECT p.Name, SUM(s.Qty) AS TotalQty\nFROM Products p\nJOIN Stock s ON s.ProductId = p.ProductId\nGROUP BY p.Name\nHAVING SUM(s.Qty) < 20;',
      explain: 'Filtering single rows with WHERE is the trap: Notebook has 15 + 10 = 25 in total and is fine. Aggregate first, then filter the groups with `HAVING`: Earphones (4) and Mouse (6 + 3 = 9) need restocking.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In a report query, where must a condition on `SUM(Amount)` go?',
      options: ['WHERE', 'HAVING', 'ORDER BY only', 'ON'],
      answer: 1,
      explain: 'WHERE filters rows **before** grouping, so aggregates are not available there. HAVING filters the groups **after** GROUP BY.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Logical processing order of a SELECT. Which statements are TRUE? Select all that apply.',
      options: ['FROM/JOIN is processed before WHERE', 'WHERE is processed before GROUP BY', 'A column alias from SELECT can be used in WHERE', 'A column alias from SELECT can be used in ORDER BY', 'HAVING is processed before GROUP BY'],
      answers: [0, 1, 3],
      explain: 'Order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. Because SELECT runs after WHERE, its aliases are unknown in WHERE but available in ORDER BY (that is why `ORDER BY Total DESC` works).',
    },
  ],
};
