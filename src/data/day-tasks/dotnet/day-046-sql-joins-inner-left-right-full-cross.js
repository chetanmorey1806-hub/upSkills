const SHOP = `CREATE TABLE Customers (
    CustId INT PRIMARY KEY,
    Name NVARCHAR(50),
    City NVARCHAR(30)
);
CREATE TABLE Orders (
    OrderId INT PRIMARY KEY,
    CustId INT,
    Amount INT
);
INSERT INTO Customers VALUES
(1, 'Asha', 'Pune'), (2, 'Ravi', 'Delhi'), (3, 'Meena', 'Chennai'), (4, 'Kiran', 'Mumbai');
INSERT INTO Orders VALUES
(101, 1, 1500), (102, 2, 900), (103, 1, 2300), (104, 3, 400), (105, 9, 700);`;

const MENU = `CREATE TABLE Sizes (Size NVARCHAR(10));
CREATE TABLE Toppings (Topping NVARCHAR(20));
INSERT INTO Sizes VALUES ('Regular'), ('Large');
INSERT INTO Toppings VALUES ('Paneer'), ('Corn'), ('Olives');`;

export default {
  lesson: 'day-046-sql-joins-inner-left-right-full-cross',
  minutes: 24,
  intro: 'Practise combining tables with INNER, LEFT, RIGHT, FULL and CROSS JOIN, and finding unmatched rows.',
  tasks: [
    {
      type: 'code',
      lang: 'tsql',
      mins: 4,
      q: 'Show every order with the customer\'s name: columns `OrderId`, `Name`, `Amount`. Only orders that have a matching customer.',
      example: { title: 'INNER JOIN with aliases', code: 'SELECT s.Name, c.Title\nFROM Students s\nINNER JOIN Courses c ON s.CourseId = c.CourseId;' },
      setup: SHOP,
      starter: '-- SELECT ... FROM Orders o INNER JOIN Customers c ON ...\n',
      solution: 'SELECT o.OrderId, c.Name, o.Amount FROM Orders o INNER JOIN Customers c ON o.CustId = c.CustId;',
      explain: 'INNER JOIN keeps only rows that match in **both** tables. Order 105 has CustId 9, which does not exist, so it is dropped. Kiran has no orders, so Kiran is also absent.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 4,
      q: 'Show **all customers** with the number of orders each has placed (0 if none). Columns: `Name`, `OrderCount`.',
      example: { title: 'LEFT JOIN keeps all rows of the left table', code: 'SELECT d.DeptName, COUNT(e.EmpId) AS Staff\nFROM Departments d\nLEFT JOIN Employees e ON e.DeptId = d.DeptId\nGROUP BY d.DeptName;' },
      setup: SHOP,
      starter: '-- Customers LEFT JOIN Orders ... GROUP BY ...\n',
      solution: 'SELECT c.Name, COUNT(o.OrderId) AS OrderCount FROM Customers c LEFT JOIN Orders o ON o.CustId = c.CustId GROUP BY c.Name;',
      explain: 'LEFT JOIN keeps every customer; for Kiran the order columns are NULL. `COUNT(o.OrderId)` ignores NULL, giving 0. Using `COUNT(*)` would wrongly give Kiran 1.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 4,
      q: 'Find **orders whose customer does not exist** (orphan orders). Show `OrderId` and `CustId`.',
      example: { title: 'unmatched rows', code: 'SELECT s.Name\nFROM Students s\nLEFT JOIN Results r ON r.StudentId = s.StudentId\nWHERE r.StudentId IS NULL;' },
      setup: SHOP,
      starter: '-- LEFT JOIN ... WHERE ... IS NULL\n',
      solution: 'SELECT o.OrderId, o.CustId FROM Orders o LEFT JOIN Customers c ON c.CustId = o.CustId WHERE c.CustId IS NULL;',
      explain: 'A LEFT JOIN followed by `WHERE right.Key IS NULL` keeps only the left rows **without** a match: order 105. This "anti-join" pattern finds data-quality problems (a foreign key would have prevented it).',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 3,
      q: 'A pizza shop wants **every combination** of size and topping. Return all pairs: columns `Size`, `Topping`.',
      example: { title: 'CROSS JOIN', code: 'SELECT c.Color, s.Size FROM Colors c CROSS JOIN Sizes s;' },
      setup: MENU,
      starter: '-- every size with every topping\n',
      solution: 'SELECT s.Size, t.Topping FROM Sizes s CROSS JOIN Toppings t;',
      explain: '`CROSS JOIN` produces the **Cartesian product**: 2 sizes × 3 toppings = 6 rows. It has no ON clause. Forgetting the ON condition in other joins can accidentally produce huge cross products.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Using the Customers/Orders data above, how many rows does `Customers c FULL OUTER JOIN Orders o ON o.CustId = c.CustId` return?',
      options: ['4', '5', '6', '7'],
      answer: 2,
      explain: 'FULL JOIN = matched rows + unmatched from both sides: 4 matched order rows (101, 102, 103, 104) + Kiran (no orders) + order 105 (no customer) = **6** rows.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about joins are TRUE? (choose all that apply)',
      options: [
        '`JOIN` on its own means INNER JOIN',
        '`A RIGHT JOIN B` gives the same rows as `B LEFT JOIN A`',
        'LEFT JOIN can return fewer rows than the left table has',
        'A CROSS JOIN of tables with 10 and 20 rows returns 200 rows',
        'Table aliases like `c` and `o` make join queries shorter and clearer',
      ],
      answers: [0, 1, 3, 4],
      explain: 'A LEFT JOIN returns **at least** one row per left-table row (more if there are several matches), never fewer. The other statements are true.',
    },
  ],
};
