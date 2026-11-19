const EMP = `CREATE TABLE Departments (
    DeptId INT PRIMARY KEY,
    DeptName NVARCHAR(20),
    Location NVARCHAR(20)
);
CREATE TABLE Employees (
    EmpId INT PRIMARY KEY,
    Name NVARCHAR(30),
    DeptId INT,
    Salary INT
);
INSERT INTO Departments VALUES (1, 'IT', 'Pune'), (2, 'HR', 'Mumbai'), (3, 'Sales', 'Pune'), (4, 'Legal', 'Delhi');
INSERT INTO Employees VALUES
(1, 'Asha', 1, 70000), (2, 'Ravi', 1, 52000), (3, 'Meena', 2, 45000),
(4, 'Kiran', 3, 38000), (5, 'Sneha', 3, 61000), (6, 'Om', 2, 40000);`;

export default {
  lesson: 'day-047-subqueries-nested-correlated',
  minutes: 24,
  intro: 'Practise subqueries: single-value subqueries, IN/NOT IN with a list, EXISTS and correlated subqueries that run once per outer row.',
  tasks: [
    {
      type: 'code',
      lang: 'tsql',
      mins: 4,
      q: 'Show `Name` and `Salary` of employees who earn **more than the company average** salary.',
      example: { title: 'scalar subquery', code: 'SELECT Title, Price FROM Books\nWHERE Price > (SELECT AVG(Price) FROM Books);' },
      setup: EMP,
      starter: '-- WHERE Salary > (SELECT ...)\n',
      solution: 'SELECT Name, Salary FROM Employees WHERE Salary > (SELECT AVG(Salary) FROM Employees);',
      explain: 'The inner query returns one value (the average, 51000) and the outer query compares each row with it. You cannot write `WHERE Salary > AVG(Salary)` directly, because aggregates are not allowed in WHERE.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 4,
      q: 'Show the names of employees who work in a department located in **Pune** (use a subquery with IN, not a join).',
      example: { title: 'IN with a subquery', code: "SELECT Name FROM Students\nWHERE CourseId IN (SELECT CourseId FROM Courses WHERE Fees > 5000);" },
      setup: EMP,
      starter: '-- WHERE DeptId IN (SELECT ...)\n',
      solution: "SELECT Name FROM Employees WHERE DeptId IN (SELECT DeptId FROM Departments WHERE Location = 'Pune');",
      explain: 'The subquery returns a **list** of DeptIds (1, 3), so use `IN`. Using `=` with a subquery that returns several rows causes Msg 512 "Subquery returned more than 1 value".',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 4,
      q: 'Show the names of departments that have **no employees** (use NOT EXISTS or NOT IN).',
      example: { title: 'NOT EXISTS', code: 'SELECT c.Name FROM Customers c\nWHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.CustId = c.CustId);' },
      setup: EMP,
      starter: '-- departments without employees\n',
      solution: 'SELECT d.DeptName FROM Departments d WHERE NOT EXISTS (SELECT 1 FROM Employees e WHERE e.DeptId = d.DeptId);',
      explain: '`NOT EXISTS` is true when the inner query finds no row for that department: only Legal. Prefer NOT EXISTS over NOT IN when the inner column can contain NULLs, because `NOT IN (…, NULL)` returns nothing.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: '**Correlated subquery:** show `Name`, `DeptId` and `Salary` of employees who earn **more than the average salary of their own department**.',
      example: { title: 'the inner query uses the outer row', code: 'SELECT p.Name, p.Price FROM Products p\nWHERE p.Price > (SELECT AVG(p2.Price) FROM Products p2 WHERE p2.Category = p.Category);' },
      setup: EMP,
      starter: '-- WHERE e.Salary > (SELECT AVG(...) ... WHERE x.DeptId = e.DeptId)\n',
      solution: 'SELECT e.Name, e.DeptId, e.Salary FROM Employees e WHERE e.Salary > (SELECT AVG(e2.Salary) FROM Employees e2 WHERE e2.DeptId = e.DeptId);',
      explain: 'The inner query refers to `e.DeptId` from the outer query, so it is evaluated **per outer row**. IT avg = 61000 → Asha; HR avg = 42500 → Meena; Sales avg = 49500 → Sneha.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What makes a subquery **correlated**?',
      options: [
        'It uses an aggregate function',
        'It references a column from the outer query, so it is (logically) re-evaluated for every outer row',
        'It is placed in the FROM clause',
        'It returns more than one column',
      ],
      answer: 1,
      explain: 'A normal (nested) subquery can run on its own once. A **correlated** subquery depends on the current outer row (e.g. `WHERE e2.DeptId = e.DeptId`) and cannot run alone.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the query that finds the employee(s) with the **highest** salary:\n`SELECT Name FROM Employees WHERE Salary = ________________;`',
      example: { title: 'lowest price product', code: 'SELECT Title FROM Products WHERE Price = (SELECT MIN(Price) FROM Products);' },
      accept: ['(SELECT MAX(Salary) FROM Employees)'],
      acceptRegex: ['^\\(\\s*SELECT\\s+MAX\\s*\\(\\s*Salary\\s*\\)\\s+FROM\\s+Employees\\s*\\)\\s*;?$'],
      explain: 'The subquery returns a single value (70000), so `=` is fine. This also returns every employee tied for the top salary, unlike `TOP 1 … ORDER BY`.',
    },
  ],
};
