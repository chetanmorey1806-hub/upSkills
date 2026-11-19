const STUDENTS = `CREATE TABLE students (
  student_id INT PRIMARY KEY,
  first_name VARCHAR(30),
  last_name  VARCHAR(30),
  email      VARCHAR(80),
  phone      VARCHAR(10),
  dob        DATE
);
INSERT INTO students VALUES
 (1, 'Aarav',  'Sharma',   'aarav.sharma@gmail.com', '9876543210', '2004-03-12'),
 (2, 'Diya',   'Patel',    'diya@yahoo.in',          '9123456780', '2003-11-05'),
 (3, 'Kabir',  NULL,       'kabir.k@college.edu',    '9988776655', '2004-07-21'),
 (4, 'Meera',  'Iyer',     'meera@college.edu',      '9090909090', '2005-01-30'),
 (5, 'Vikram', 'Singh',    'vikram99@gmail.com',     '9812345678', '2002-09-17');`;

const FORMS = `CREATE TABLE admission_forms (
  form_id     INT PRIMARY KEY,
  full_name   VARCHAR(60),
  city        VARCHAR(30),
  course_code VARCHAR(10)
);
INSERT INTO admission_forms VALUES
 (1, '  Riya Desai ', 'pune',   'cs101'),
 (2, 'Arjun Mehta  ', 'MUMBAI', 'me201'),
 (3, '   Zoya Khan',  'Nagpur', 'Cs101');`;

export default {
  lesson: 'mysql-day-11',
  minutes: 30,
  intro: 'Join, cut, search, clean and mask text with MySQL string functions on real student data.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: "Kabir's `last_name` is NULL. What does `CONCAT(first_name, ' ', last_name)` return for him, and what does `CONCAT_WS(' ', first_name, last_name)` return?",
      options: ["'Kabir ' and 'Kabir'", "NULL and 'Kabir'", "'Kabir' and NULL", 'NULL and NULL'],
      answer: 1,
      explain: '**CONCAT returns NULL if any argument is NULL**. `CONCAT_WS(separator, ...)` (With Separator) **skips NULL values**, so it returns \'Kabir\'. Use CONCAT_WS or wrap columns in `IFNULL(col, \'\')` when names can be missing.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What does this query return?',
      code: "SELECT SUBSTRING_INDEX('ravi.kumar@gmail.com', '@', -1);",
      expected: 'gmail.com',
      explain: '`SUBSTRING_INDEX(str, delim, n)` returns the part **before** the n-th delimiter when n is positive, and the part **after** the n-th delimiter counting from the right when n is negative. -1 → everything after the last \'@\' = the email domain.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'For every student show:\n- `username` = the part of the email **before** the @\n- `domain` = the part **after** the @\n\n(show only these two columns)',
      example: { title: 'splitting text at a character', code: "SELECT SUBSTRING_INDEX('2024-06-15', '-', 1) AS yr,\n       SUBSTRING_INDEX('2024-06-15', '-', -1) AS dd;" },
      setup: STUDENTS,
      starter: '-- SELECT ... AS username, ... AS domain FROM students;\n',
      solution: "SELECT SUBSTRING_INDEX(email, '@', 1) AS username,\n       SUBSTRING_INDEX(email, '@', -1) AS domain\nFROM students;",
      explain: 'Positive count → text before the 1st \'@\'; negative count → text after the last \'@\'. `LEFT(email, LOCATE(\'@\', email) - 1)` and `SUBSTRING(email, LOCATE(\'@\', email) + 1)` give the same result.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Generate a **login id** for each student: the first 3 letters of the first name + the last 2 digits of the birth year, all **lowercase** (Aarav born 2004 → `aar04`). Show `first_name` and `login_id`.\n\nUse `SUBSTRING` (in this browser lab `LEFT()`/`RIGHT()` are not available; in Workbench they work too).',
      example: { title: 'building a code from pieces', code: "SELECT LOWER(CONCAT(SUBSTRING(city, 1, 2), '-', SUBSTRING(pincode, -3))) AS code\nFROM stores;" },
      setup: STUDENTS,
      starter: '-- SUBSTRING(...), YEAR(...), CONCAT, LOWER\n',
      solution: 'SELECT first_name,\n       LOWER(CONCAT(SUBSTRING(first_name, 1, 3), SUBSTRING(YEAR(dob), 3, 2))) AS login_id\nFROM students;',
      explain: '`SUBSTRING(first_name, 1, 3)` takes the first 3 characters, `YEAR(dob)` gives 2004 and `SUBSTRING(..., 3, 2)` (or `SUBSTRING(..., -2)`) takes "04". `CONCAT` joins them and `LOWER` changes the case. In MySQL Workbench `LEFT(first_name, 3)` and `RIGHT(YEAR(dob), 2)` do the same.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Show each student\'s `first_name` and a **masked phone**: 6 `X` characters followed by the **last 4 digits** (9876543210 → `XXXXXX3210`). Name the column `masked_phone`.\n\nUse `SUBSTRING` with a negative position for the last digits (`RIGHT()` is not available in this browser lab).',
      example: { title: 'masking text', code: "SELECT CONCAT(REPEAT('*', 8), SUBSTRING(card_no, -4)) AS card\nFROM payments;" },
      setup: STUDENTS,
      starter: '-- REPEAT / LPAD with SUBSTRING(..., -4)\n',
      solution: "SELECT first_name,\n       CONCAT(REPEAT('X', 6), SUBSTRING(phone, -4)) AS masked_phone\nFROM students;",
      explain: '`SUBSTRING(phone, -4)` keeps the last 4 digits (a negative position counts from the end; `RIGHT(phone, 4)` in Workbench); `REPEAT(\'X\', 6)` builds the mask. `LPAD(SUBSTRING(phone, -4), 10, \'X\')` is another neat solution: it pads on the left up to 10 characters. Masking protects personal data in reports.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Permanently clean `admission_forms` with ONE UPDATE:\n- remove extra spaces at both ends of `full_name`\n- store `course_code` in **UPPER case**',
      example: { title: 'cleaning text with UPDATE', code: 'UPDATE customers\nSET email = LOWER(TRIM(email));' },
      setup: FORMS,
      starter: '-- UPDATE admission_forms SET ...;\n',
      solution: 'UPDATE admission_forms\nSET full_name = TRIM(full_name),\n    course_code = UPPER(course_code);',
      check: 'SELECT form_id, full_name, course_code FROM admission_forms ORDER BY form_id;',
      explain: '`TRIM` removes leading and trailing spaces (`LTRIM`/`RTRIM` only one side). `UPPER` makes \'cs101\' and \'Cs101\' the same \'CS101\', so grouping and searching work. Always preview with a SELECT using the same functions before the UPDATE.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Show `first_name` and the **number of characters** in the first name (`name_length`), **longest first**; for equal lengths sort by first_name A→Z.',
      example: { title: 'length in characters', code: 'SELECT city, CHAR_LENGTH(city) AS len\nFROM stores\nORDER BY len DESC;' },
      setup: STUDENTS,
      starter: '-- CHAR_LENGTH ...\n',
      solution: 'SELECT first_name, CHAR_LENGTH(first_name) AS name_length\nFROM students\nORDER BY name_length DESC, first_name;',
      ordered: true,
      explain: '`CHAR_LENGTH` counts characters; `LENGTH` counts **bytes**, which differs for Hindi or other multi-byte UTF-8 text (\'नमस्ते\' has 6 characters but 18 bytes). For English names both give the same number.',
    },
  ],
};
