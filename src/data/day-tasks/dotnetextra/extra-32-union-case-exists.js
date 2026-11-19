const SHOP = `CREATE TABLE OnlineCustomers (Name NVARCHAR(50), City NVARCHAR(50));
INSERT INTO OnlineCustomers VALUES ('Asha', 'Pune'), ('Ravi', 'Nagpur'), ('Meera', 'Mumbai');
CREATE TABLE StoreCustomers (Name NVARCHAR(50), City NVARCHAR(50));
INSERT INTO StoreCustomers VALUES ('Ravi', 'Nagpur'), ('Kiran', 'Pune'), ('Asha', 'Pune'), ('Zoya', 'Delhi');
CREATE TABLE Customers (CustomerId INT PRIMARY KEY, Name NVARCHAR(50), City NVARCHAR(50));
INSERT INTO Customers VALUES (1, 'Asha', 'Pune'), (2, 'Ravi', 'Nagpur'), (3, 'Meera', 'Mumbai'), (4, 'Kiran', 'Pune'), (5, 'Zoya', 'Delhi');
CREATE TABLE Orders (OrderId INT PRIMARY KEY, CustomerId INT, Amount INT);
INSERT INTO Orders VALUES (101, 1, 1200), (102, 1, 800), (103, 3, 4500), (104, 5, 300);`;

const STUDENTS = `CREATE TABLE Students (Name NVARCHAR(50), Marks INT);
INSERT INTO Students VALUES ('Asha', 91), ('Ravi', 67), ('Meera', 45), ('Kiran', 32), ('Zoya', 75);`;

export default {
  lesson: 'extra-32-union-case-exists',
  minutes: 30,
  intro: 'Combine result sets with UNION / UNION ALL, label rows with CASE and filter with EXISTS / NOT EXISTS in SQL Server.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between `UNION` and `UNION ALL`?',
      options: ['UNION ALL removes duplicates, UNION keeps them', 'UNION removes duplicate rows, UNION ALL keeps every row (and is faster)', 'UNION joins tables side by side', 'There is no difference'],
      answer: 1,
      explain: '`UNION` stacks the results and removes duplicates (an extra sort/distinct step). `UNION ALL` keeps all rows, so it is faster; use it when duplicates are impossible or wanted.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 4,
      q: 'The shop has customers who bought **online** and in the **store**. List every distinct customer `Name` from both tables (each name once).',
      example: { title: 'UNION of two lists', code: `SELECT City FROM Branches
UNION
SELECT City FROM Warehouses;` },
      setup: SHOP,
      starter: '-- SELECT Name FROM OnlineCustomers ... StoreCustomers\n',
      solution: 'SELECT Name FROM OnlineCustomers\nUNION\nSELECT Name FROM StoreCustomers;',
      explain: 'Asha and Ravi appear in both tables, so `UNION` returns 5 distinct names. With `UNION ALL` you would get 7 rows. Both SELECTs must return the same number of columns with compatible types.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Using the same tables (3 online rows, 4 store rows, Asha and Ravi in both), how many rows does this return?
\`SELECT Name, City FROM OnlineCustomers UNION ALL SELECT Name, City FROM StoreCustomers;\``,
      example: { title: 'counting rows', text: 'UNION ALL simply stacks the two results: rows = rows of first query + rows of second query.' },
      accept: ['7'],
      explain: '`UNION ALL` never removes duplicates: 3 + 4 = **7** rows. With `UNION`, the identical (Asha, Pune) and (Ravi, Nagpur) rows would be merged, giving 5.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: `Show each student's \`Name\`, \`Marks\` and a column \`Result\` using CASE:
- 75 or more → \`Distinction\`
- 60 to 74 → \`First Class\`
- 40 to 59 → \`Pass\`
- below 40 → \`Fail\``,
      example: { title: 'searched CASE', code: `SELECT Name,
       CASE WHEN Stock = 0 THEN 'Out' WHEN Stock < 10 THEN 'Low' ELSE 'OK' END AS StockStatus
FROM Products;` },
      setup: STUDENTS,
      starter: "SELECT Name, Marks\n-- add the CASE column named Result\nFROM Students;\n",
      solution: "SELECT Name, Marks,\n       CASE WHEN Marks >= 75 THEN 'Distinction'\n            WHEN Marks >= 60 THEN 'First Class'\n            WHEN Marks >= 40 THEN 'Pass'\n            ELSE 'Fail' END AS Result\nFROM Students;",
      explain: 'CASE checks the WHEN branches top to bottom and returns the first match, so checking `>= 75` first means the next branch only needs `>= 60`. Zoya with exactly 75 gets Distinction. Forgetting `ELSE` would give NULL for failing students.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Find customers who have **never** placed an order. Return `CustomerId` and `Name` using `NOT EXISTS`.',
      example: { title: 'EXISTS with a correlated subquery', code: `SELECT p.ProductName FROM Products p
WHERE EXISTS (SELECT 1 FROM OrderItems i WHERE i.ProductId = p.ProductId);` },
      setup: SHOP,
      starter: 'SELECT c.CustomerId, c.Name\nFROM Customers c\n-- WHERE NOT EXISTS (...)\nWHERE 1 = 0;\n',
      solution: 'SELECT c.CustomerId, c.Name\nFROM Customers c\nWHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerId = c.CustomerId);',
      explain: 'The subquery is **correlated** (it uses `c.CustomerId`), so it is checked for each customer. Ravi (2) and Kiran (4) have no orders. `NOT EXISTS` is also NULL-safe, unlike `NOT IN`, which returns nothing if the subquery contains a NULL.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? Select all that apply.',
      options: ['EXISTS stops searching as soon as it finds one matching row', 'The column list inside EXISTS (e.g. `SELECT 1`) does not matter', 'ORDER BY can be written after each SELECT in a UNION', 'Column names of a UNION result come from the first SELECT', 'CASE can be used in ORDER BY for a custom sort order'],
      answers: [0, 1, 3, 4],
      explain: 'EXISTS only checks whether a row exists, so `SELECT 1` or `SELECT *` behave the same and it can stop early. In a UNION, only one ORDER BY is allowed at the very end, and the column names come from the first SELECT. CASE works anywhere an expression is allowed, including ORDER BY.',
    },
  ],
};
