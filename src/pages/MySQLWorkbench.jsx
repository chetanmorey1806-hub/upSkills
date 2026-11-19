import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { ensurePython, runPyExec, restartPython } from '../components/pyodideRunner.js';
import { WB_ENGINE_PY } from '../engine/wbEngine.js';

import Ico from '../components/Ico.jsx';
export const MYSQL_LOAD_KEY = 'xlpbi-mysql-load';
export const SSMS_LOAD_KEY = 'xlpbi-ssms-load';

const SAMPLE_COLLEGE = `-- Sample database: college
CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  dept_id INT AUTO_INCREMENT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL UNIQUE,
  building VARCHAR(30)
);
CREATE TABLE faculty (
  faculty_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  dept_id INT,
  salary DECIMAL(10,2),
  hire_date DATE,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  gender ENUM('M','F'),
  city VARCHAR(40),
  dept_id INT,
  marks DECIMAL(5,2),
  dob DATE,
  email VARCHAR(80) UNIQUE,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(80) NOT NULL,
  credits INT DEFAULT 3,
  dept_id INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE enrollments (
  enroll_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  grade CHAR(2),
  enrolled_on DATE,
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
INSERT INTO departments (dept_name, building) VALUES ('Computer','A Block'),('Mechanical','B Block'),('Civil','C Block'),('Electronics','A Block');
INSERT INTO faculty (name, dept_id, salary, hire_date) VALUES
 ('Dr. Mehta',1,95000,'2015-06-01'),('Prof. Kulkarni',1,78000,'2019-07-15'),('Dr. Rao',2,88000,'2012-01-10'),
 ('Prof. Shaikh',3,72000,'2020-03-01'),('Dr. Iyer',4,91000,'2016-08-20');
INSERT INTO students (name, gender, city, dept_id, marks, dob, email) VALUES
 ('Asha Patil','F','Pune',1,88.50,'2004-03-12','asha@college.edu'),
 ('Ravi Kumar','M','Mumbai',2,72.00,'2003-11-05','ravi@college.edu'),
 ('Neha Shah','F','Pune',1,93.25,'2004-07-21','neha@college.edu'),
 ('Imran Khan','M','Nagpur',3,65.75,'2003-01-30','imran@college.edu'),
 ('Priya Desai','F','Nashik',4,81.00,'2004-09-09','priya@college.edu'),
 ('Rahul Joshi','M','Pune',2,58.50,'2005-02-14','rahul@college.edu'),
 ('Sneha More','F','Mumbai',1,76.00,'2004-12-01','sneha@college.edu'),
 ('Karan Mehta','M','Nagpur',NULL,69.00,'2003-05-25',NULL);
INSERT INTO courses (title, credits, dept_id) VALUES
 ('Database Systems',4,1),('Data Structures',4,1),('Thermodynamics',3,2),('Surveying',3,3),('Digital Electronics',3,4),('Web Development',2,1);
INSERT INTO enrollments (student_id, course_id, grade, enrolled_on) VALUES
 (1,1,'A','2024-07-01'),(1,2,'A','2024-07-01'),(3,1,'A+','2024-07-02'),(3,6,'A','2024-07-02'),(2,3,'B','2024-07-03'),
 (4,4,'C','2024-07-03'),(5,5,'B+','2024-07-04'),(6,3,'C','2024-07-05'),(7,1,'B','2024-07-05'),(7,6,'A','2024-07-06');
SELECT 'college database ready' AS status;
`;

const SAMPLE_SHOP = `-- Sample database: ecommerce
CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  city VARCHAR(40),
  joined_on DATE
);
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(80) NOT NULL,
  category VARCHAR(40),
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0
);
CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_date DATE,
  status ENUM('Pending','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
CREATE TABLE order_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);
INSERT INTO customers (name, city, joined_on) VALUES ('Om Traders','Pune','2023-01-15'),('Sai Stores','Mumbai','2023-03-02'),('Kiran Mart','Nashik','2023-06-20'),('Laxmi Agencies','Pune','2024-01-05'),('Vijay Retail','Nagpur','2024-02-11');
INSERT INTO products (product_name, category, price, stock) VALUES ('Laptop','Electronics',55000,12),('Mobile','Electronics',18000,40),('Office Chair','Furniture',4500,25),('Desk','Furniture',12000,8),('Headphones','Accessories',2500,60),('Keyboard','Accessories',1500,45);
INSERT INTO orders (customer_id, order_date, status) VALUES (1,'2024-01-05','Delivered'),(2,'2024-01-09','Delivered'),(1,'2024-02-02','Shipped'),(3,'2024-02-14','Delivered'),(2,'2024-03-01','Cancelled'),(4,'2024-03-20','Pending'),(1,'2024-03-28','Delivered');
INSERT INTO order_items (order_id, product_id, quantity) VALUES (1,1,2),(1,5,3),(2,2,3),(3,5,5),(3,6,2),(4,4,1),(4,3,2),(5,1,1),(6,3,6),(7,2,2),(7,6,1);
SELECT 'ecommerce database ready' AS status;
`;

const TSQL_STUDENTDB = `-- Sample database: StudentDB (SQL Server / T-SQL)
CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
DROP TABLE IF EXISTS Enrollments;
DROP TABLE IF EXISTS Students;
DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS Departments;
GO
CREATE TABLE Departments (
  DeptId INT IDENTITY(1,1) PRIMARY KEY,
  DeptName NVARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE Students (
  StudentId INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(100) NOT NULL,
  Gender CHAR(1),
  City NVARCHAR(50),
  DeptId INT FOREIGN KEY REFERENCES Departments(DeptId),
  Marks INT CHECK (Marks BETWEEN 0 AND 100),
  JoinDate DATE
);
CREATE TABLE Courses (
  CourseId INT IDENTITY(1,1) PRIMARY KEY,
  Title NVARCHAR(100) NOT NULL,
  Fees INT DEFAULT 10000
);
CREATE TABLE Enrollments (
  EnrollId INT IDENTITY(1,1) PRIMARY KEY,
  StudentId INT FOREIGN KEY REFERENCES Students(StudentId),
  CourseId INT FOREIGN KEY REFERENCES Courses(CourseId),
  EnrollDate DATE
);
GO
INSERT INTO Departments (DeptName) VALUES (N'Computer'), (N'Mechanical'), (N'Civil');
INSERT INTO Students (Name, Gender, City, DeptId, Marks, JoinDate) VALUES
 (N'Asha Patil', 'F', N'Pune', 1, 88, '2023-07-15'), (N'Ravi Kumar', 'M', N'Mumbai', 2, 72, '2022-08-01'),
 (N'Neha Shah', 'F', N'Pune', 1, 93, '2024-01-10'), (N'Imran Khan', 'M', N'Nagpur', 3, 65, '2023-03-20'),
 (N'Priya Desai', 'F', N'Nashik', 1, 81, '2024-06-05'), (N'Rahul Joshi', 'M', N'Pune', 2, 58, '2022-11-11');
INSERT INTO Courses (Title, Fees) VALUES (N'C# Fundamentals', 12000), (N'ASP.NET Core', 18000), (N'SQL Server', 10000), (N'React', 15000);
INSERT INTO Enrollments (StudentId, CourseId, EnrollDate) VALUES (1,1,'2024-07-01'), (1,2,'2024-07-01'), (2,3,'2024-07-02'), (3,1,'2024-07-03'), (3,4,'2024-07-03'), (5,2,'2024-07-04');
GO
SELECT 'StudentDB ready' AS Status;
`;
const TSQL_EMPLOYEEDB = `-- Sample database: EmployeeDB (SQL Server / T-SQL)
CREATE DATABASE EmployeeDB;
GO
USE EmployeeDB;
GO
DROP TABLE IF EXISTS Employees;
DROP TABLE IF EXISTS Departments;
GO
CREATE TABLE Departments (DeptId INT IDENTITY(1,1) PRIMARY KEY, DeptName NVARCHAR(50) NOT NULL, Location NVARCHAR(50));
CREATE TABLE Employees (
  EmpId INT IDENTITY(101,1) PRIMARY KEY,
  Name NVARCHAR(100) NOT NULL,
  DeptId INT FOREIGN KEY REFERENCES Departments(DeptId),
  Salary INT,
  HireDate DATE,
  ManagerId INT NULL
);
GO
INSERT INTO Departments (DeptName, Location) VALUES (N'IT', N'Pune'), (N'HR', N'Mumbai'), (N'Sales', N'Pune'), (N'Finance', N'Nagpur');
INSERT INTO Employees (Name, DeptId, Salary, HireDate, ManagerId) VALUES
 (N'Imran Khan', 1, 88000, '2016-09-20', NULL), (N'Asha Patil', 1, 72000, '2019-04-10', 101),
 (N'Ravi Kumar', 2, 45000, '2021-07-01', 101), (N'Neha Shah', 3, 52000, '2020-01-15', 101),
 (N'Priya Desai', 4, 61000, '2018-03-05', 101), (N'Rahul Joshi', 3, 39000, '2023-02-11', 104),
 (N'Sneha More', 2, 48000, '2020-11-30', 103), (N'Karan Mehta', 1, 55000, '2022-06-18', 102);
GO
SELECT 'EmployeeDB ready' AS Status;
`;
const TSQL_SNIPPETS = [
  ['CREATE TABLE', 'CREATE TABLE TableName (\n  Id INT IDENTITY(1,1) PRIMARY KEY,\n  Name NVARCHAR(100) NOT NULL,\n  CreatedAt DATETIME DEFAULT GETDATE()\n);'],
  ['INSERT', "INSERT INTO TableName (Name) VALUES\n  (N'Value 1'),\n  (N'Value 2');"],
  ['SELECT TOP', 'SELECT TOP 10 *\nFROM TableName\nORDER BY Id DESC;'],
  ['UPDATE', "UPDATE TableName\nSET Name = N'New'\nWHERE Id = 1;"],
  ['DELETE', 'DELETE FROM TableName\nWHERE Id = 1;'],
  ['INNER JOIN', 'SELECT s.Name, d.DeptName\nFROM Students s\nINNER JOIN Departments d ON d.DeptId = s.DeptId;'],
  ['GROUP BY … HAVING', 'SELECT DeptId, COUNT(*) AS Total, AVG(Marks) AS AvgMarks\nFROM Students\nGROUP BY DeptId\nHAVING COUNT(*) > 1;'],
  ['Paging (OFFSET/FETCH)', 'SELECT *\nFROM Students\nORDER BY StudentId\nOFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY;'],
  ['CASE / IIF', "SELECT Name,\n  CASE WHEN Marks >= 75 THEN 'Distinction' WHEN Marks >= 60 THEN 'First' ELSE 'Pass' END AS Result,\n  IIF(Marks >= 40, 'Pass', 'Fail') AS Status\nFROM Students;"],
  ['CTE', 'WITH DeptAvg AS (\n  SELECT DeptId, AVG(Marks) AS AvgMarks FROM Students GROUP BY DeptId\n)\nSELECT * FROM DeptAvg WHERE AvgMarks > 70;'],
  ['ROW_NUMBER()', 'SELECT Name, Marks,\n  ROW_NUMBER() OVER (ORDER BY Marks DESC) AS RowNum,\n  DENSE_RANK() OVER (PARTITION BY DeptId ORDER BY Marks DESC) AS RankInDept\nFROM Students;'],
  ['CREATE VIEW', 'CREATE VIEW vw_TopStudents AS\nSELECT Name, Marks FROM Students WHERE Marks >= 80;\nGO\nSELECT * FROM vw_TopStudents;'],
  ['SELECT INTO #temp', 'SELECT Name, Marks INTO #Toppers FROM Students WHERE Marks > 80;\nSELECT * FROM #Toppers;'],
  ['Transaction', 'BEGIN TRAN;\nUPDATE Students SET Marks = Marks + 5 WHERE StudentId = 1;\n-- COMMIT TRAN; to save, or:\nROLLBACK TRAN;'],
  ['Date functions', "SELECT GETDATE() AS Now, DATEADD(day, 30, '2024-01-01') AS Plus30,\n  DATEDIFF(year, '2003-05-25', '2025-01-01') AS Age, FORMAT(CAST('2024-03-05' AS DATE), 'dd-MM-yyyy') AS Formatted;"],
];
const TSQL_PRACTICE = [
  ['Top 3 students by marks', 'USE StudentDB;\nSELECT TOP 3 Name, Marks FROM Students ORDER BY Marks DESC;'],
  ['Students with department (JOIN)', 'USE StudentDB;\nSELECT s.Name, d.DeptName FROM Students s\nLEFT JOIN Departments d ON d.DeptId = s.DeptId;'],
  ['Average marks per department', 'USE StudentDB;\nSELECT d.DeptName, COUNT(*) AS Students, AVG(s.Marks) AS AvgMarks\nFROM Students s JOIN Departments d ON d.DeptId = s.DeptId\nGROUP BY d.DeptName ORDER BY AvgMarks DESC;'],
  ['Students not enrolled', 'USE StudentDB;\nSELECT Name FROM Students s\nWHERE NOT EXISTS (SELECT 1 FROM Enrollments e WHERE e.StudentId = s.StudentId);'],
  ['Employees above average salary', 'USE EmployeeDB;\nSELECT Name, Salary FROM Employees\nWHERE Salary > (SELECT AVG(Salary) FROM Employees) ORDER BY Salary DESC;'],
  ['Employee with manager (SELF JOIN)', 'USE EmployeeDB;\nSELECT e.Name AS Employee, m.Name AS Manager\nFROM Employees e LEFT JOIN Employees m ON m.EmpId = e.ManagerId;'],
  ['Department-wise salary rank', 'USE EmployeeDB;\nSELECT Name, DeptId, Salary,\n  RANK() OVER (PARTITION BY DeptId ORDER BY Salary DESC) AS SalaryRank\nFROM Employees;'],
  ['Years of service', "USE EmployeeDB;\nSELECT Name, HireDate, DATEDIFF(year, HireDate, '2025-01-01') AS YearsOfService FROM Employees;"],
];

const SNIPPETS = [
  ['CREATE TABLE', 'CREATE TABLE table_name (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);'],
  ['INSERT', "INSERT INTO table_name (col1, col2) VALUES\n  ('value1', 10),\n  ('value2', 20);"],
  ['SELECT … WHERE', 'SELECT col1, col2\nFROM table_name\nWHERE condition\nORDER BY col1 DESC\nLIMIT 10;'],
  ['UPDATE', "UPDATE table_name\nSET col1 = 'new value'\nWHERE id = 1;"],
  ['DELETE', 'DELETE FROM table_name\nWHERE id = 1;'],
  ['INNER JOIN', 'SELECT a.col, b.col\nFROM table_a a\nINNER JOIN table_b b ON b.a_id = a.id;'],
  ['LEFT JOIN', 'SELECT a.col, b.col\nFROM table_a a\nLEFT JOIN table_b b ON b.a_id = a.id;'],
  ['GROUP BY … HAVING', 'SELECT category, COUNT(*) AS total, AVG(price) AS avg_price\nFROM products\nGROUP BY category\nHAVING COUNT(*) > 1;'],
  ['Subquery', 'SELECT name, marks\nFROM students\nWHERE marks > (SELECT AVG(marks) FROM students);'],
  ['CREATE VIEW', 'CREATE VIEW view_name AS\nSELECT col1, col2\nFROM table_name\nWHERE condition;'],
  ['CREATE INDEX', 'CREATE INDEX idx_name ON table_name (column_name);'],
  ['CASE', "SELECT name,\n  CASE\n    WHEN marks >= 75 THEN 'Distinction'\n    WHEN marks >= 60 THEN 'First Class'\n    ELSE 'Pass'\n  END AS result\nFROM students;"],
  ['Window function', 'SELECT name, dept_id, marks,\n  RANK() OVER (PARTITION BY dept_id ORDER BY marks DESC) AS rank_in_dept\nFROM students;'],
  ['CTE (WITH)', 'WITH dept_avg AS (\n  SELECT dept_id, AVG(marks) AS avg_marks\n  FROM students\n  GROUP BY dept_id\n)\nSELECT * FROM dept_avg WHERE avg_marks > 70;'],
  ['Transaction', 'START TRANSACTION;\nUPDATE accounts SET balance = balance - 500 WHERE id = 1;\nUPDATE accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT;   -- or ROLLBACK;'],
  ['Trigger', 'DELIMITER $$\nCREATE TRIGGER trg_name AFTER INSERT ON table_name\nFOR EACH ROW\nBEGIN\n  INSERT INTO audit_log (msg) VALUES (NEW.name);\nEND$$\nDELIMITER ;'],
];

const PRACTICE = [
  ['Students scoring above 80 (college)', 'USE college;\nSELECT name, city, marks FROM students WHERE marks > 80 ORDER BY marks DESC;'],
  ['Students with department name (JOIN)', 'USE college;\nSELECT s.name, d.dept_name FROM students s\nLEFT JOIN departments d ON d.dept_id = s.dept_id;'],
  ['Average marks per department', 'USE college;\nSELECT d.dept_name, COUNT(*) AS students, ROUND(AVG(s.marks), 2) AS avg_marks\nFROM students s JOIN departments d ON d.dept_id = s.dept_id\nGROUP BY d.dept_name ORDER BY avg_marks DESC;'],
  ['Second highest marks (subquery)', 'USE college;\nSELECT MAX(marks) AS second_highest FROM students\nWHERE marks < (SELECT MAX(marks) FROM students);'],
  ['Students not enrolled in any course', 'USE college;\nSELECT s.name FROM students s\nWHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.student_id);'],
  ['Age of each student', "USE college;\nSELECT name, dob, TIMESTAMPDIFF(YEAR, dob, '2025-01-01') AS age_on_2025_01_01 FROM students;"],
  ['Order value per customer (ecommerce)', 'USE ecommerce;\nSELECT c.name, SUM(oi.quantity * p.price) AS total_spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p ON p.product_id = oi.product_id\nWHERE o.status <> \'Cancelled\'\nGROUP BY c.name ORDER BY total_spent DESC;'],
  ['Rank products by revenue (window)', 'USE ecommerce;\nSELECT p.product_name, SUM(oi.quantity * p.price) AS revenue,\n  DENSE_RANK() OVER (ORDER BY SUM(oi.quantity * p.price) DESC) AS rnk\nFROM order_items oi JOIN products p ON p.product_id = oi.product_id\nGROUP BY p.product_name;'],
  ['Monthly orders', "USE ecommerce;\nSELECT DATE_FORMAT(order_date, '%Y-%m') AS month, COUNT(*) AS orders\nFROM orders GROUP BY month ORDER BY month;"],
];

const CFG = {
  mysql: {
    store: 'mysql', dump: 'xlpbi-wb-dump-v1', tabs: 'xlpbi-wb-tabs-v1', load: 'xlpbi-mysql-load', cls: 'wb',
    title: 'MySQL Workbench', logo: '🐬', conn: 'Local instance 3306', nav: 'Navigator', navSub: 'SCHEMAS', schemaWord: 'schema',
    samples: [['college', SAMPLE_COLLEGE], ['ecommerce', SAMPLE_SHOP]], snippets: SNIPPETS, practice: PRACTICE,
    resultTab: 'Result Grid', outTab: 'Output', useStmt: (s) => `USE ${s};`, selectRows: (s, t) => `USE ${s};\nSELECT * FROM ${t} LIMIT 1000;`,
    welcome: '-- Welcome to the MySQL Workbench Lab -- 1) Click "Load sample DB: college" on the left (or write CREATE DATABASE ...)\n-- 2) Write a query and press Ctrl+Shift+Enter (execute all) or Ctrl+Enter (current statement)\n\nSHOW DATABASES;\n',
    help: ['Ctrl+Shift+Enter: execute all (or selection)', 'Ctrl+Enter: execute statement under cursor', 'Double-click a schema: set as default (USE)', '⊞ next to a table: Select Rows - Limit 1000'],
    limits: 'This lab emulates MySQL 8 on SQLite. Stored procedures, users/GRANT, ALTER … MODIFY and EXPLAIN need real MySQL Workbench; the course shows how.',
  },
  tsql: {
    store: 'tsql', dump: 'xlpbi-ssms-dump-v1', tabs: 'xlpbi-ssms-tabs-v1', load: 'xlpbi-ssms-load', cls: 'wb ssms',
    title: 'SQL Server Management Studio', logo: '🗄️', conn: '(localdb)\\MSSQLLocalDB (SQL Server 16.0)', nav: 'Object Explorer', navSub: 'DATABASES', schemaWord: 'database',
    samples: [['StudentDB', TSQL_STUDENTDB], ['EmployeeDB', TSQL_EMPLOYEEDB]], snippets: TSQL_SNIPPETS, practice: TSQL_PRACTICE,
    resultTab: 'Results', outTab: 'Messages', useStmt: (s) => `USE ${s};`, selectRows: (s, t) => `USE ${s};\nSELECT TOP (1000) * FROM ${t};`,
    welcome: '-- Welcome to the SSMS Lab (SQL Server / T-SQL) -- 1) Click "Load sample DB: StudentDB" on the left (or write CREATE DATABASE ... GO USE ...)\n-- 2) Write a query and press F5 / Ctrl+E (execute all or selection)\n\nSELECT name FROM sys.tables;\n',
    help: ['F5 or Ctrl+E: execute all (or the selected text)', 'Ctrl+Enter: execute statement under cursor', 'Double-click a database: USE it', '⊞ next to a table: Select Top 1000 Rows', 'GO separates batches'],
    limits: 'This lab emulates SQL Server T-SQL on SQLite. Stored procedures, functions, T-SQL triggers, DECLARE variables, cursors, logins and BACKUP need real SQL Server + SSMS; the course shows how.',
  },
};

const now = () => new Date().toTimeString().slice(0, 8);
const loadJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

// split for "execute current statement"
function statementAt(text, offset) {
  let start = 0, q = null;
  const bounds = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === q) q = null; continue; }
    if (c === "'" || c === '"' || c === '`') { q = c; continue; }
    if (c === '-' && text[i + 1] === '-') { const j = text.indexOf('\n', i); i = j < 0 ? text.length : j; continue; }
    if (c === ';') { bounds.push([start, i + 1]); start = i + 1; }
  }
  bounds.push([start, text.length]);
  const hit = bounds.find(([a, b]) => offset >= a && offset <= b && text.slice(a, b).trim()) || bounds.filter(([a, b]) => text.slice(a, b).trim() && b <= offset).pop();
  return hit ? text.slice(hit[0], hit[1]) : text;
}

let engineLoaded = null;
const engineReady = {};
function loadEngineCode() {
  if (!engineLoaded) {
    engineLoaded = (async () => { await ensurePython(); await runPyExec({ code: WB_ENGINE_PY + '\n"ok"', packages: ['sqlite3'] }); })();
    engineLoaded.catch(() => { engineLoaded = null; });
  }
  return engineLoaded;
}
function initEngine(cfg) {
  if (!engineReady[cfg.store]) {
    engineReady[cfg.store] = (async () => {
      await loadEngineCode();
      const saved = loadJSON(cfg.dump, null);
      const r = await runPyExec({ code: `wb_select_store('${cfg.store}'); wb_load(__d, __c)`, vars: { __d: JSON.stringify(saved?.dump || {}), __c: saved?.db || null } });
      return JSON.parse(r);
    })();
    engineReady[cfg.store].catch(() => { delete engineReady[cfg.store]; });
  }
  return engineReady[cfg.store];
}
function resetEngines() { engineLoaded = null; Object.keys(engineReady).forEach((k) => delete engineReady[k]); }

export default function MySQLWorkbench({ dialect = 'mysql' }) {
  const cfg = CFG[dialect];
  const initial = useMemo(() => {
    let loaded = null;
    try { loaded = JSON.parse(sessionStorage.getItem(cfg.load)); sessionStorage.removeItem(cfg.load); } catch { /* ignore */ }
    const tabs = loadJSON(cfg.tabs, null) || [{ name: 'SQLQuery1.sql', sql: cfg.welcome }];
    if (loaded?.script) {
      tabs.push({ name: (loaded.title || 'Lesson').slice(0, 28), sql: loaded.script, expected: loaded.expected || '' });
      return { tabs, active: tabs.length - 1 };
    }
    return { tabs, active: 0 };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [tabs, setTabs] = useState(initial.tabs);
  const [active, setActive] = useState(initial.active);
  const [schemas, setSchemas] = useState({});
  const [currentDb, setCurrentDb] = useState(null);
  const [status, setStatus] = useState('loading');
  const [results, setResults] = useState([]);
  const [resTab, setResTab] = useState(0);
  const [output, setOutput] = useState([]);
  const [bottom, setBottom] = useState('result');
  const [open, setOpen] = useState({});
  const [filter, setFilter] = useState('');
  const [fallback, setFallback] = useState(false);
  const [side, setSide] = useState('snippets');
  const editorRef = useRef(null);
  const counter = useRef(0);

  useEffect(() => { loader.init().catch(() => setFallback(true)); }, []);
  useEffect(() => {
    initEngine(cfg).then((r) => { setSchemas(r.schemas); setCurrentDb(r.db); setStatus('ready'); setOpen(Object.fromEntries(Object.keys(r.schemas).map((k) => [k, true]))); })
      .catch((e) => { setStatus('error'); setOutput([{ n: 1, time: now(), action: 'Connect', message: String(e.message || e), ok: false }]); });
  }, []);
  useEffect(() => { saveJSON(cfg.tabs, tabs.map(({ name, sql }) => ({ name, sql }))); }, [tabs, cfg.tabs]);

  const persist = async () => {
    try { const d = await runPyExec({ code: `wb_select_store('${cfg.store}'); wb_dump()` }); return JSON.parse(d); } catch { return null; }
  };

  const execute = useCallback(async (sql) => {
    if (status !== 'ready' || !sql.trim()) return;
    setStatus('running');
    try {
      await initEngine(cfg);
      const raw = await runPyExec({ code: `wb_select_store('${cfg.store}'); wb_run(__sql)`, vars: { __sql: sql } });
      const r = JSON.parse(raw);
      const out = r.results.map((x) => ({
        n: ++counter.current, time: now(), action: x.sql.replace(/\s+/g, ' ').slice(0, 120),
        message: x.type === 'rows' ? (dialect === 'tsql' ? `(${x.rows.length} row${x.rows.length === 1 ? '' : 's'} affected)` : `${x.rows.length} row(s) returned`) : x.message, ok: x.type !== 'error', ms: x.ms,
      }));
      setOutput((o) => [...o, ...out].slice(-300));
      const grids = r.results.filter((x) => x.type === 'rows');
      setResults(grids);
      setResTab(0);
      setBottom(r.results.some((x) => x.type === 'error') || !grids.length ? 'output' : 'result');
      setSchemas(r.schemas); setCurrentDb(r.db);
      setOpen((o) => ({ ...Object.fromEntries(Object.keys(r.schemas).map((k) => [k, o[k] ?? true])) }));
      persist().then((dump) => { if (dump) saveJSON(cfg.dump, { dump, db: r.db }); });
    } catch (e) {
      setOutput((o) => [...o, { n: ++counter.current, time: now(), action: 'Execute', message: String(e.message || e), ok: false }]);
      setBottom('output');
    }
    setStatus('ready');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, cfg]);

  const cur = tabs[active] || tabs[0];
  const setSql = (v) => setTabs((t) => t.map((x, i) => (i === active ? { ...x, sql: v } : x)));
  const runAll = () => {
    const ed = editorRef.current;
    const sel = ed?.getModel()?.getValueInRange(ed.getSelection());
    execute(sel && sel.trim() ? sel : cur.sql);
  };
  const runCurrent = () => {
    const ed = editorRef.current;
    if (!ed) return execute(cur.sql);
    const sel = ed.getModel().getValueInRange(ed.getSelection());
    if (sel && sel.trim()) return execute(sel);
    const off = ed.getModel().getOffsetAt(ed.getPosition());
    execute(statementAt(ed.getValue(), off));
  };
  const runRef = useRef({}); runRef.current = { runAll, runCurrent };

  const onMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => runRef.current.runAll());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current.runCurrent());
    if (dialect === 'tsql') {
      editor.addCommand(monaco.KeyCode.F5, () => runRef.current.runAll());
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE, () => runRef.current.runAll());
    }
  };
  const insert = (text) => {
    const ed = editorRef.current;
    if (ed) { ed.executeEdits('snippet', [{ range: ed.getSelection(), text: text + '\n' }]); ed.focus(); }
    else setSql(cur.sql + '\n' + text + '\n');
  };
  const newTab = (sql = '', name) => { setTabs((t) => [...t, { name: name || (dialect === 'tsql' ? `SQLQuery${t.length + 1}.sql` : `Query ${t.length + 1}`), sql }]); setActive(tabs.length); };
  const closeTab = (i) => { if (tabs.length === 1) return; setTabs((t) => t.filter((_, j) => j !== i)); setActive((a) => (a >= i && a > 0 ? a - 1 : a)); };
  const resetAll = async () => {
    if (!window.confirm('Delete ALL databases you created in this lab?')) return;
    const r = JSON.parse(await runPyExec({ code: `wb_select_store('${cfg.store}'); wb_reset()` }));
    setSchemas(r.schemas); setCurrentDb(r.db); saveJSON(cfg.dump, null); setResults([]);
    setOutput((o) => [...o, { n: ++counter.current, time: now(), action: 'Reset', message: 'All schemas dropped', ok: true }]);
  };
  const stop = async () => { resetEngines(); await restartPython(); setStatus('loading'); const r = await initEngine(cfg); setSchemas(r.schemas); setCurrentDb(r.db); setStatus('ready'); };
  const openFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    f.text().then((t) => newTab(t, f.name));
    e.target.value = '';
  };
  const saveFile = () => {
    const url = URL.createObjectURL(new Blob([cur.sql], { type: 'text/sql' }));
    const a = document.createElement('a'); a.href = url; a.download = `${cur.name.replace(/[^\w-]+/g, '_')}.sql`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const grid = results[resTab];
  const schemaNames = Object.keys(schemas).filter((s) => !filter || s.includes(filter.toLowerCase()) || Object.keys(schemas[s]).some((t) => t.toLowerCase().includes(filter.toLowerCase())));

  return (
    <div className={cfg.cls}>
      <div className="wb-top">
        <div className="wb-brand"><span className="wb-logo"><Ico e={cfg.logo} /></span><b>{cfg.title}</b><span className="wb-conn">{cfg.conn} · {status === 'loading' ? 'connecting…' : status === 'error' ? 'not connected' : 'connected'}</span></div>
        <div className="wb-tools">
          <label className="wb-btn" title="Open SQL script"><Ico e="📂" /><input type="file" accept=".sql,.txt" hidden onChange={openFile} /></label>
          <button className="wb-btn" title="Save script" onClick={saveFile}><Ico e="💾" /></button>
          <span className="wb-sep" />
          {dialect === 'tsql'
            ? <button className="wb-btn exec ssms-exec" title="Execute (F5)" disabled={status !== 'ready'} onClick={runAll}>▶ Execute</button>
            : <button className="wb-btn exec" title="Execute all / selection (Ctrl+Shift+Enter)" disabled={status !== 'ready'} onClick={runAll}><Ico e="⚡" /></button>}
          <button className="wb-btn exec" title="Execute the statement under the cursor (Ctrl+Enter)" disabled={status !== 'ready'} onClick={runCurrent}><Ico e="⚡" /><small>I</small></button>
          <button className="wb-btn" title="Stop" disabled={status !== 'running'} onClick={stop}><Ico e="⛔" /></button>
          <span className="wb-sep" />
          <button className="wb-btn" title="New query tab" onClick={() => newTab('')}>{dialect === 'tsql' ? <><Ico e="📄" /> New Query</> : '＋SQL'}</button>
          <span className="wb-db">{dialect === 'tsql' ? 'Available Databases' : 'Default schema'}: <b>{currentDb || 'none'}</b></span>
        </div>
      </div>

      <div className="wb-body">
        <aside className="wb-nav">
          <div className="wb-nav-head">{cfg.nav}</div>
          <div className="wb-nav-sub">{cfg.navSub}</div>
          <input className="wb-filter" placeholder="Filter objects" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <div className="wb-tree">
            {schemaNames.length === 0 && <div className="wb-muted">No schemas yet.</div>}
            {schemaNames.map((s) => (
              <div key={s}>
                <div className={`wb-schema ${currentDb === s ? 'cur' : ''}`} onClick={() => setOpen({ ...open, [s]: !open[s] })} onDoubleClick={() => execute(cfg.useStmt(s))} title={`Double-click to set as default ${cfg.schemaWord}`}>
                  {open[s] ? '▾' : '▸'} <Ico e="🛢" /> {s}
                </div>
                {open[s] && (
                  <div className="wb-children">
                    <div className="wb-folder">▾ Tables</div>
                    {Object.entries(schemas[s]).filter(([, v]) => v.kind === 'table').map(([t, v]) => (
                      <div key={t}>
                        <div className="wb-table" onClick={() => setOpen({ ...open, [`${s}.${t}`]: !open[`${s}.${t}`] })}>
                          {open[`${s}.${t}`] ? '▾' : '▸'} ▦ {t}
                          <button className="wb-mini" title={dialect === 'tsql' ? 'Select Top 1000 Rows' : 'Select Rows - Limit 1000'} onClick={(e) => { e.stopPropagation(); const q = cfg.selectRows(s, t); newTab(q, t); setTimeout(() => execute(q), 50); }}>⊞</button>
                        </div>
                        {open[`${s}.${t}`] && v.columns.map(([c, ty, pk]) => <div key={c} className="wb-col">{pk ? <><Ico e="🔑" /></> : '◆'} {c} <span>{ty}</span></div>)}
                      </div>
                    ))}
                    {Object.entries(schemas[s]).some(([, v]) => v.kind === 'view') && <div className="wb-folder">▾ Views</div>}
                    {Object.entries(schemas[s]).filter(([, v]) => v.kind === 'view').map(([t]) => <div key={t} className="wb-table"><Ico e="👁" /> {t}</div>)}
                    <div className="wb-folder muted">▸ Stored Procedures</div>
                    <div className="wb-folder muted">▸ Functions</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="wb-nav-actions">
            {cfg.samples.map(([n, sql]) => (
              <button key={n} className="wb-act" onClick={() => { newTab(sql, `${n}_setup.sql`); setTimeout(() => execute(dialect === 'tsql' ? sql.replace(/CREATE DATABASE (\w+);/, (m, db) => (schemas[db.toLowerCase()] || schemas[db] ? '' : m)) : sql), 50); }}><Ico e="⬇" /> Load sample DB: {n}</button>
            ))}
            <button className="wb-act danger" onClick={resetAll}><Ico e="🗑" /> Drop all {cfg.schemaWord}s</button>
          </div>
        </aside>

        <section className="wb-editor">
          <div className="wb-tabs">
            {tabs.map((t, i) => (
              <div key={i} className={`wb-tab ${i === active ? 'on' : ''}`} onClick={() => setActive(i)}>
                <span>{t.name}</span>{tabs.length > 1 && <button onClick={(e) => { e.stopPropagation(); closeTab(i); }}>×</button>}
              </div>
            ))}
          </div>
          <div className="wb-monaco">
            {fallback ? (
              <textarea className="pg-fallback" spellCheck={false} value={cur.sql} onChange={(e) => setSql(e.target.value)} />
            ) : (
              <Editor key={active} language="mysql" theme="vs" value={cur.sql} onMount={onMount} onChange={(v) => setSql(v ?? '')}
                loading={<div className="pg-loading">Loading SQL editor…</div>}
                options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false, wordWrap: 'on', lineNumbersMinChars: 3 }} />
            )}
          </div>
          {cur.expected && (
            <details className="wb-expected"><summary><Ico e="📋" /> Expected output for this lesson script</summary><pre>{cur.expected}</pre></details>
          )}
        </section>

        <aside className="wb-side">
          <div className="wb-side-tabs">
            <button className={side === 'snippets' ? 'on' : ''} onClick={() => setSide('snippets')}>Snippets</button>
            <button className={side === 'practice' ? 'on' : ''} onClick={() => setSide('practice')}>Practice</button>
            <button className={side === 'help' ? 'on' : ''} onClick={() => setSide('help')}>Help</button>
          </div>
          <div className="wb-side-body">
            {side === 'snippets' && cfg.snippets.map(([n, s]) => <button key={n} className="wb-snip" onClick={() => insert(s)} title={s}>{n}</button>)}
            {side === 'practice' && (
              <>
                <div className="wb-muted">Load the sample DBs first, then try:</div>
                {cfg.practice.map(([n, s]) => <button key={n} className="wb-snip" onClick={() => newTab(s, n.slice(0, 24))}>{n}</button>)}
              </>
            )}
            {side === 'help' && (
              <div className="wb-help">
                {cfg.help.map((h) => <p key={h}>{h}</p>)}
                <p>Your databases are saved in this browser.</p>
                <p className="wb-muted">{cfg.limits}</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="wb-bottom">
        <div className="wb-btabs">
          <button className={bottom === 'result' ? 'on' : ''} onClick={() => setBottom('result')}>{cfg.resultTab}</button>
          {bottom === 'result' && results.length > 1 && results.map((_, i) => <button key={i} className={`sub ${resTab === i ? 'on' : ''}`} onClick={() => setResTab(i)}>Result {i + 1}</button>)}
          <button className={bottom === 'output' ? 'on' : ''} onClick={() => setBottom('output')}>{cfg.outTab} {output.some((o) => !o.ok) ? <><Ico e="⚠" /></> : ''}</button>
          {bottom === 'output' && <button className="sub" onClick={() => setOutput([])}>Clear</button>}
        </div>
        <div className="wb-bbody">
          {bottom === 'result' && (grid ? (
            <table className="wb-grid">
              <thead><tr><th className="rn"></th>{grid.columns.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
              <tbody>{grid.rows.slice(0, 1000).map((r, i) => <tr key={i}><td className="rn">▸</td>{r.map((v, j) => <td key={j} className={typeof v === 'number' ? 'num' : ''}>{v === null ? <span className="null">NULL</span> : String(v)}</td>)}</tr>)}</tbody>
            </table>
          ) : <div className="wb-muted pad">{status === 'loading' ? 'Starting MySQL engine (first time takes a few seconds, needs internet once)…' : 'Run a SELECT to see rows here.'}</div>)}
          {bottom === 'output' && (
            <table className="wb-out">
              <thead><tr><th></th><th>#</th><th>Time</th><th>Action</th><th>Message</th><th>Duration</th></tr></thead>
              <tbody>{output.slice().reverse().map((o) => (
                <tr key={o.n} className={o.ok ? '' : 'bad'}><td>{o.ok ? <><Ico e="✅" /></> : <><Ico e="⛔" /></>}</td><td>{o.n}</td><td>{o.time}</td><td className="act">{o.action}</td><td>{o.message}</td><td>{o.ms != null ? `${(o.ms / 1000).toFixed(3)} sec` : ''}</td></tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
