const FEES = `CREATE TABLE fee_payments (
  payment_id INT PRIMARY KEY,
  student    VARCHAR(30),
  amount     DECIMAL(10,2),
  paid_on    DATE
);
INSERT INTO fee_payments VALUES
 (1, 'Aarav',  25000, '2024-06-01'),
 (2, 'Diya',   30000, '2024-06-08'),
 (3, 'Kabir',  12500, '2024-06-15'),
 (4, 'Meera',  18000, '2024-07-03'),
 (5, 'Rohan',  22000, '2024-07-14'),
 (6, 'Sneha',  15750, '2024-08-20');`;

const INVOICES = `CREATE TABLE invoices (
  invoice_id   INT PRIMARY KEY,
  customer     VARCHAR(30),
  invoice_date DATE,
  amount       DECIMAL(10,2),
  paid         BOOLEAN
);
INSERT INTO invoices VALUES
 (101, 'Sharma Traders', '2024-09-10', 48250.75, 0),
 (102, 'Patel Stores',   '2024-10-25', 12999.40, 0),
 (103, 'Iyer & Sons',    '2024-08-01', 7450.00,  1),
 (104, 'Khan Mart',      '2024-11-15', 15600.55, 0),
 (105, 'Rao Agencies',   '2024-07-20', 9999.99,  0);`;

export default {
  lesson: 'mysql-day-12',
  minutes: 30,
  intro: 'Work with dates (extracting parts, date arithmetic, formatting) and numbers (ROUND, CEIL, MOD...) in business reports.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: "What does `SELECT DATEDIFF('2024-03-01', '2024-02-01');` return?",
      options: ['-29', '29', '1', '30'],
      answer: 1,
      explain: '`DATEDIFF(later, earlier)` returns the number of **days** = first date minus second date. 2024 is a leap year, so February has 29 days → **29**. Swapping the arguments gives -29. For months or years use `TIMESTAMPDIFF(MONTH, start, end)`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: "Complete the format string so that `DATE_FORMAT('2024-08-15', '____')` returns **15-08-2024**.",
      accept: ['%d-%m-%Y'],
      caseSensitive: true,
      explain: '`%d` = day with 2 digits, `%m` = month number with 2 digits, `%Y` = 4-digit year (lower-case `%y` gives 24). Other useful ones: `%b` = Aug, `%M` = August, `%W` = weekday name. Format specifiers are **case-sensitive**.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Find fee payments made on a **weekend** (Saturday or Sunday). Show `student`, `paid_on` and the weekday name as `day_name`.',
      example: { title: 'weekday of a date', code: "SELECT order_id, DAYNAME(order_date) AS day_name\nFROM orders\nWHERE DAYNAME(order_date) = 'Monday';" },
      setup: FEES,
      starter: '-- DAYNAME(...) or DAYOFWEEK(...)\n',
      solution: "SELECT student, paid_on, DAYNAME(paid_on) AS day_name\nFROM fee_payments\nWHERE DAYNAME(paid_on) IN ('Saturday', 'Sunday');",
      explain: '`DAYNAME` returns the English weekday. `DAYOFWEEK` returns a number where **1 = Sunday and 7 = Saturday**, so `DAYOFWEEK(paid_on) IN (1, 7)` is equivalent. A common mistake is assuming Monday = 1.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'For each **unpaid** invoice (`paid = 0`) show `invoice_id`, `customer`, the `due_date` (= invoice_date **+ 30 days**) and `days_overdue` = number of days from the due date until **\'2024-12-31\'**.',
      example: { title: 'adding days and counting days', code: "SELECT order_id,\n       DATE_ADD(order_date, INTERVAL 7 DAY) AS deliver_by,\n       DATEDIFF('2024-12-31', order_date) AS age_days\nFROM orders;" },
      setup: INVOICES,
      starter: '-- DATE_ADD(... INTERVAL 30 DAY), DATEDIFF(...)\n',
      solution: "SELECT invoice_id, customer,\n       DATE_ADD(invoice_date, INTERVAL 30 DAY) AS due_date,\n       DATEDIFF('2024-12-31', DATE_ADD(invoice_date, INTERVAL 30 DAY)) AS days_overdue\nFROM invoices\nWHERE paid = 0;",
      explain: '`DATE_ADD(d, INTERVAL 30 DAY)` (or `d + INTERVAL 30 DAY`) moves a date forward. `DATEDIFF(end, start)` counts the days between them. Writing a fixed "as of" date instead of `CURDATE()` keeps reports reproducible.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'For every invoice show:\n- `invoice_id`\n- `with_gst` = amount + 18% GST, **rounded to 2 decimals**\n- `instalments` = how many **₹10,000** instalments are needed to pay the original amount (always round **up**)',
      example: { title: 'ROUND and CEIL', code: 'SELECT ROUND(1234.5678, 2) AS r,   -- 1234.57\n       CEIL(25 / 10)        AS c;   -- 3' },
      setup: INVOICES,
      starter: '-- ROUND(...), CEIL(...)\n',
      solution: 'SELECT invoice_id,\n       ROUND(amount * 1.18, 2) AS with_gst,\n       CEIL(amount / 10000) AS instalments\nFROM invoices;',
      explain: '`ROUND(x, 2)` keeps 2 decimals (rounding half up). `CEIL` (CEILING) always rounds **up**: 12999.40 / 10000 = 1.29 → 2 instalments. `FLOOR` would give 1 and leave money unpaid; `TRUNCATE(x, 2)` cuts digits without rounding.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Show each payment with `student`, `pay_month` (full month name, e.g. June), `pay_year` and `pay_quarter`, for payments made in **June or July 2024** only. Use date functions, not LIKE.',
      example: { title: 'extracting date parts', code: 'SELECT MONTHNAME(order_date) AS m, YEAR(order_date) AS y, QUARTER(order_date) AS q\nFROM orders\nWHERE MONTH(order_date) = 12;' },
      setup: FEES,
      starter: '-- MONTHNAME, YEAR, QUARTER, MONTH\n',
      solution: 'SELECT student,\n       MONTHNAME(paid_on) AS pay_month,\n       YEAR(paid_on) AS pay_year,\n       QUARTER(paid_on) AS pay_quarter\nFROM fee_payments\nWHERE YEAR(paid_on) = 2024 AND MONTH(paid_on) IN (6, 7);',
      explain: '`MONTH()` returns 1-12 and `MONTHNAME()` the name; `QUARTER()` returns 1-4 (June = Q2, July = Q3). For big tables a range such as `paid_on >= \'2024-06-01\' AND paid_on < \'2024-08-01\'` is faster because it can use an index.',
    },
  ],
};
