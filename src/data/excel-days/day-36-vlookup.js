export default {
  id: 'day-36-vlookup',
  title: 'VLOOKUP()',
  module: 'Module 5: Advanced Excel Functions',
  day: 36,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'VLOOKUP searches for a value in the first column of a table and returns a value from another column in the same row. It is the most asked Excel function in office jobs and interviews: fetching salaries by Emp ID, prices by product code or grades by marks.',
  objectives: [
    'Write VLOOKUP with all four arguments and understand each one',
    'Use exact match (FALSE) and approximate match (TRUE) correctly',
    'Lock the table range with $ and look up from another sheet',
    'Handle #N/A errors with IFERROR and use wildcards',
    'Know the limitations of VLOOKUP',
  ],
  theory: [
    {
      heading: 'What does VLOOKUP do?',
      content: 'V stands for **Vertical**. VLOOKUP looks **down** the first column of a table to find a value, then moves **right** to a column you specify and returns the value from that column in the same row.\n\nThink of a phone diary: you search a name in the first column, then read the phone number from the column next to it.\n\nTypical uses:\n- Get the salary of an employee from Emp ID.\n- Get the price of a product from its code to fill an invoice.\n- Get a grade or commission rate from a slab table.',
    },
    {
      heading: 'Syntax and arguments',
      syntax: '=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
      content: 'Each argument explained:\n\n1. **lookup_value**: what you are searching for, e.g. "E103" or a cell like G2.\n2. **table_array**: the table range, e.g. `$A$2:$D$6`. The lookup_value is always searched in the **first (left-most) column** of this range.\n3. **col_index_num**: the column number **within table_array** to return. The first column of table_array is 1, the next is 2, and so on (it is not the sheet column letter).\n4. **range_lookup** (optional): `FALSE` (or 0) = exact match. `TRUE` (or 1, or omitted) = approximate match (requires the first column sorted ascending).',
      tip: 'Always type FALSE for IDs, codes and names. If you omit the 4th argument, Excel uses TRUE (approximate) and may return a wrong value without any error.',
    },
    {
      heading: 'Exact match vs approximate match',
      content: '**Exact match (FALSE)**: returns a result only if the exact value is found. If not found, returns **#N/A**. Data does not need to be sorted. Use for Emp ID, invoice number, product code.\n\n**Approximate match (TRUE)**: the first column must be sorted **ascending** (smallest to largest). Excel finds the **largest value that is less than or equal to** the lookup value. Use for slab tables: grades by marks, commission by sales, tax by income, discount by quantity.\n\nExample slab table: 0 = F, 35 = D, 50 = C, 65 = B, 80 = A. Marks 72: largest value <= 72 is 65, so the grade is B.',
    },
    {
      heading: 'Absolute reference and lookups from another sheet',
      content: 'When you copy a VLOOKUP down, the table_array must not move. Lock it with **$** (press **F4** after selecting the range): `$A$2:$D$6`.\n\nTo look up from another sheet, include the sheet name: `=VLOOKUP(A2,Products!$A$2:$C$50,3,FALSE)`. If the sheet name has spaces, Excel adds quotes: `\'Price List\'!$A$2:$C$50`.\n\nYou can also use a **named range** (e.g. `EmpTable`) or an **Excel Table** reference, both of which stay fixed automatically.',
    },
    {
      heading: 'Common errors and how to fix them',
      content: 'Most VLOOKUP problems come from a few repeated causes. Learn to recognise each error message:',
      points: [
        '**#N/A**: value not found. Check spelling, extra spaces (use TRIM), numbers stored as text vs real numbers (E.g. 101 vs "101"), or wrong first column.',
        '**#REF!**: col_index_num is bigger than the number of columns in table_array.',
        '**#VALUE!**: col_index_num is less than 1.',
        '**Wrong result without error**: forgot FALSE, so approximate match was used on unsorted data.',
        'Handle not-found cleanly: `=IFERROR(VLOOKUP(...),"Not Found")`.',
      ],
    },
    {
      heading: 'Wildcards and limitations',
      content: 'With exact match, the lookup_value can contain wildcards: `*` (any characters) and `?` (one character). `=VLOOKUP("Sneha*",B2:D6,3,FALSE)` finds the first name starting with "Sneha".\n\n**Limitations of VLOOKUP:**\n- Cannot look to the **left**; the lookup column must be the first column of the table.\n- **Hard-coded column number** breaks if someone inserts a column inside the table.\n- Returns only the **first** match.\n- Not case sensitive.\n\nThese limits are solved by XLOOKUP (Day 38) and INDEX + MATCH (Day 39-40).',
    },
  ],
  examples: [
    {
      title: 'Find the salary of an employee by Emp ID',
      scenario: 'HR wants the salary of employee E103 in cell G2. Emp ID is in F2.',
      table: {
        headers: ['A: Emp ID', 'B: Name', 'C: Department', 'D: Salary (₹)'],
        rows: [
          ['E101', 'Riya Sharma', 'Accounts', '45000'],
          ['E102', 'Aman Verma', 'Sales', '38000'],
          ['E103', 'Priya Nair', 'HR', '42000'],
          ['E104', 'Rahul Gupta', 'IT', '55000'],
          ['E105', 'Sneha Patel', 'Sales', '40000'],
        ],
      },
      steps: [
        'Type E103 in F2.',
        'Click G2 and type =VLOOKUP(F2,$A$2:$D$6,4,FALSE)',
        'Press Enter.',
      ],
      code: '=VLOOKUP(F2,$A$2:$D$6,4,FALSE)',
      result: '42000',
      explanation: 'Excel searches E103 down column A, finds it in row 4, then returns the 4th column of A:D (Salary) from that row. FALSE forces an exact match.',
    },
    {
      title: 'Fill names and departments for a list of IDs',
      scenario: 'A bonus sheet has Emp IDs in column F (E104, E101, E105). Fill Name in G and Department in H using the same employee table A2:D6.',
      table: {
        headers: ['F: Emp ID', 'G: Name', 'H: Department'],
        rows: [
          ['E104', 'Rahul Gupta', 'IT'],
          ['E101', 'Riya Sharma', 'Accounts'],
          ['E105', 'Sneha Patel', 'Sales'],
        ],
      },
      steps: [
        'In G2 type =VLOOKUP($F2,$A$2:$D$6,2,FALSE) and press Enter.',
        'In H2 type =VLOOKUP($F2,$A$2:$D$6,3,FALSE) and press Enter.',
        'Select G2:H2 and drag the fill handle down to row 4.',
      ],
      code: '=VLOOKUP($F2,$A$2:$D$6,2,FALSE)',
      result: 'G2:H4 = Rahul Gupta | IT; Riya Sharma | Accounts; Sneha Patel | Sales',
      explanation: 'The table is locked with $ so it does not shift when copied. Column 2 returns Name and column 3 returns Department. $F keeps the lookup pointing at column F when copied right.',
    },
    {
      title: 'Approximate match: grade from marks',
      scenario: 'Assign a grade using the slab table: 0 = F, 35 = D, 50 = C, 65 = B, 80 = A. The slab table is in F2:G6 sorted ascending.',
      table: {
        headers: ['A: Student', 'B: Marks', 'C: Grade', 'F: Min Marks', 'G: Grade'],
        rows: [
          ['Riya', '72', 'B', '0', 'F'],
          ['Aman', '35', 'D', '35', 'D'],
          ['Priya', '88', 'A', '50', 'C'],
          ['Rahul', '28', 'F', '65', 'B'],
          ['Sneha', '64', 'C', '80', 'A'],
        ],
      },
      steps: [
        'Make sure F2:F6 is sorted from smallest to largest.',
        'In C2 type =VLOOKUP(B2,$F$2:$G$6,2,TRUE)',
        'Press Enter and drag down to C6.',
      ],
      code: '=VLOOKUP(B2,$F$2:$G$6,2,TRUE)',
      result: 'C2:C6 = B, D, A, F, C',
      explanation: 'For 72, the largest slab <= 72 is 65, so B. For 35 the slab 35 matches exactly, so D. For 64 the largest slab <= 64 is 50, so C. For 28 it is 0, so F.',
    },
    {
      title: 'Handle a missing ID with IFERROR',
      scenario: 'Someone types E110 which is not in the employee table. Show "Not Found" instead of #N/A.',
      table: {
        headers: ['F: Emp ID', 'G: Salary'],
        rows: [
          ['E102', '38000'],
          ['E110', 'Not Found'],
        ],
      },
      steps: [
        'In G2 type =IFERROR(VLOOKUP(F2,$A$2:$D$6,4,FALSE),"Not Found")',
        'Press Enter and copy down to G3.',
      ],
      code: '=IFERROR(VLOOKUP(F2,$A$2:$D$6,4,FALSE),"Not Found")',
      result: 'G2 = 38000, G3 = Not Found',
      explanation: 'VLOOKUP returns #N/A for E110. IFERROR catches the error and shows the friendly text. (IFNA would catch only #N/A, which is even safer.)',
    },
    {
      title: 'Wildcard lookup by partial name',
      scenario: 'You only know the employee\'s first name "Sneha". Find her salary from the employee table.',
      table: {
        headers: ['B: Name', 'C: Department', 'D: Salary (₹)'],
        rows: [
          ['Riya Sharma', 'Accounts', '45000'],
          ['Aman Verma', 'Sales', '38000'],
          ['Priya Nair', 'HR', '42000'],
          ['Rahul Gupta', 'IT', '55000'],
          ['Sneha Patel', 'Sales', '40000'],
        ],
      },
      steps: [
        'Click any empty cell, e.g. G5.',
        'Type =VLOOKUP("Sneha*",$B$2:$D$6,3,FALSE)',
        'Press Enter.',
      ],
      code: '=VLOOKUP("Sneha*",$B$2:$D$6,3,FALSE)',
      result: '40000',
      explanation: 'The table starts at column B so Name is the first column; Salary is the 3rd column of B:D. "Sneha*" matches any text starting with Sneha. Wildcards work only with exact match (FALSE).',
    },
    {
      title: 'Look up price from another sheet for an invoice',
      scenario: 'Sheet "Products" has codes in A, names in B and price in C (rows 2-4). On the Invoice sheet fetch the price for each code and calculate the amount.',
      table: {
        headers: ['Products!A: Code', 'B: Product', 'C: Price (₹)'],
        rows: [
          ['P01', 'A4 Paper Ream', '250'],
          ['P02', 'Stapler', '120'],
          ['P03', 'Whiteboard Marker', '35'],
        ],
      },
      steps: [
        'On Invoice sheet: A2 = P03, B2 (Qty) = 10.',
        'In C2 type =VLOOKUP(A2,Products!$A$2:$C$4,3,FALSE)',
        'In D2 type =B2*C2',
        'Press Enter.',
      ],
      code: '=VLOOKUP(A2,Products!$A$2:$C$4,3,FALSE)',
      result: 'C2 = 35, D2 = 350',
      explanation: 'The sheet name followed by ! points to the other sheet. P03 is found in row 4 of Products, the 3rd column gives 35, and 10 x 35 = 350.',
    },
  ],
  interview: [
    { q: 'Explain the four arguments of VLOOKUP.', a: 'lookup_value is the value to find; table_array is the range whose first column is searched; col_index_num is the column number within table_array to return; range_lookup is FALSE for exact match or TRUE/omitted for approximate match.', level: 'Easy' },
    { q: 'What happens if you omit the last argument of VLOOKUP?', a: 'Excel assumes TRUE (approximate match). On unsorted data this can return a wrong value silently, so always type FALSE for exact lookups.', level: 'Medium' },
    { q: 'Why does VLOOKUP return #N/A even though the value is visible in the table?', a: 'Common reasons: extra spaces, number stored as text in one place and as number in the other, the value is not in the first column of table_array, or the table range is not locked and shifted when copied.', level: 'Medium' },
    { q: 'Can VLOOKUP look to the left?', a: 'No. It always searches the first column and returns from columns to its right. Use INDEX+MATCH or XLOOKUP for left lookups.', level: 'Easy' },
    { q: 'How does approximate match decide which row to return?', a: 'With the first column sorted ascending, it returns the row of the largest value that is less than or equal to the lookup value. If the lookup value is smaller than the first value, it returns #N/A.', level: 'Hard' },
    { q: 'How do you make VLOOKUP robust to column insertion?', a: 'Replace the hard-coded col_index_num with MATCH, e.g. =VLOOKUP(F2,$A$1:$D$6,MATCH("Salary",$A$1:$D$1,0),FALSE), or use XLOOKUP / INDEX+MATCH.', level: 'Hard' },
    { q: 'What error appears if col_index_num is 5 but the table has 4 columns?', a: '#REF!', level: 'Easy' },
    { q: 'Does VLOOKUP return all matches?', a: 'No, only the first match from the top. To get all matches use FILTER in Microsoft 365.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Product table A2:C6: P01 Pen 10; P02 Pencil 5; P03 Eraser 3; P04 Notebook 45; P05 Marker 35 (A Code, B Name, C Price). Find the price of P04.',
      hint: 'Price is column 3.',
      solution: '=VLOOKUP("P04",$A$2:$C$6,3,FALSE) returns 45.',
    },
    {
      task: 'Commission slab table F2:G5: 0 = 0%, 50000 = 2%, 100000 = 5%, 200000 = 8%. Salesperson sales are 135000 and 49000. Find the commission rate and amount for each.',
      hint: 'Approximate match, sorted slabs.',
      solution: 'Rate: =VLOOKUP(B2,$F$2:$G$5,2,TRUE). For 135000 the rate is 5%, amount =B2*C2 = 6750. For 49000 the rate is 0%, amount 0.',
    },
    {
      task: 'Using the employee table A2:D6 (E101 to E105), show the department of the ID typed in F2; if not found, show "Invalid ID".',
      hint: 'Wrap with IFERROR.',
      solution: '=IFERROR(VLOOKUP(F2,$A$2:$D$6,3,FALSE),"Invalid ID"). For E102 it returns Sales; for E999 it returns Invalid ID.',
    },
    {
      task: 'VLOOKUP("101",A2:B10,2,FALSE) returns #N/A although 101 is in column A. Why and how do you fix it?',
      hint: 'Text vs number.',
      solution: 'Column A holds the number 101 but the lookup value is the text "101". Use =VLOOKUP(101,A2:B10,2,FALSE) or =VLOOKUP(VALUE(F2),A2:B10,2,FALSE), or convert the column so both are the same type.',
    },
  ],
  quiz: [
    { question: 'In =VLOOKUP(F2,$A$2:$D$6,4,FALSE), the value is returned from which sheet column?', options: ['A', 'B', 'C', 'D'], answer: 3, explanation: 'Column 4 of the range A:D is column D.' },
    { question: 'Which range_lookup value gives an exact match?', options: ['TRUE', 'FALSE', '1', 'Omitted'], answer: 1, explanation: 'FALSE (or 0) gives exact match. TRUE, 1 or omitted give approximate match.' },
    { question: 'For approximate match the first column must be:', options: ['Sorted descending', 'Sorted ascending', 'Text only', 'Unique only'], answer: 1, explanation: 'Approximate match requires ascending order to find the largest value <= lookup value.' },
    { question: 'Slab table 0 = F, 35 = D, 50 = C, 65 = B, 80 = A. VLOOKUP(79, slabs, 2, TRUE) returns:', options: ['A', 'B', 'C', '#N/A'], answer: 1, explanation: 'The largest slab <= 79 is 65, which is grade B.' },
    { question: 'Which is a limitation of VLOOKUP?', options: ['Cannot use exact match', 'Cannot return values to the left of the lookup column', 'Cannot work across sheets', 'Cannot use cell references'], answer: 1, explanation: 'VLOOKUP only returns columns to the right of the first column.' },
  ],
};
