export default {
  id: 'day-37-hlookup',
  title: 'HLOOKUP()',
  module: 'Module 5: Advanced Excel Functions',
  day: 37,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'HLOOKUP is the horizontal version of VLOOKUP: it searches across the first ROW of a table and returns a value from a row below it. Use it when headers like months, quarters or slab limits run across the top of the sheet.',
  objectives: [
    'Write HLOOKUP with all four arguments',
    'Use exact and approximate match with horizontal tables',
    'Make the row number dynamic with MATCH',
    'Compare HLOOKUP with VLOOKUP and know when to use each',
  ],
  theory: [
    {
      heading: 'What does HLOOKUP do?',
      content: 'H stands for **Horizontal**. HLOOKUP looks **across** the first row of a table to find a value, then moves **down** to the row number you specify and returns that cell.\n\nUse it when your data is laid out sideways:\n- Months Jan, Feb, Mar... across row 1 with Sales and Target in rows below.\n- Quantity slabs 0, 10, 50, 100 across the top with discounts below.\n- Subjects across the top with marks of a student below.',
    },
    {
      heading: 'Syntax and arguments',
      syntax: '=HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])',
      content: '1. **lookup_value**: the value to find in the **first row** of table_array, e.g. "Mar".\n2. **table_array**: the range, e.g. `$B$1:$F$3`. Excel searches only its top row.\n3. **row_index_num**: the row number **within table_array** to return. The first row of the range is 1, the next is 2, etc.\n4. **range_lookup** (optional): `FALSE`/0 = exact match; `TRUE`/1/omitted = approximate match (first row must be sorted ascending from left to right).',
      tip: 'Row 1 of table_array is the header row itself. So if your range is B1:F3 and you want the Sales row (sheet row 2), row_index_num is 2.',
    },
    {
      heading: 'Exact and approximate match',
      content: '**Exact match (FALSE)**: used for month names, product codes, subject names. Not found = #N/A.\n\n**Approximate match (TRUE)**: the first row must be sorted ascending left to right. HLOOKUP returns the column of the largest value that is less than or equal to the lookup value. Used for slab tables laid out horizontally (discount by quantity, tax by income, grade by marks).',
    },
    {
      heading: 'Dynamic row number with MATCH',
      content: 'Hard-coding row_index_num (2, 3...) breaks if rows are inserted. Combine with MATCH to find the row position by its label:\n\n`=HLOOKUP("Feb",$A$1:$F$3,MATCH("Target",$A$1:$A$3,0),FALSE)`\n\nMATCH("Target",A1:A3,0) returns 3, so HLOOKUP returns row 3 of the Feb column. MATCH is explained fully on Day 39.',
    },
    {
      heading: 'Errors and limitations',
      content: 'The errors are the same as VLOOKUP:',
      points: [
        '**#N/A**: value not found in the first row (spelling, spaces, "Jan " with a trailing space, text vs number).',
        '**#REF!**: row_index_num greater than the number of rows in table_array.',
        '**#VALUE!**: row_index_num less than 1.',
        'Can only search the **top** row and return rows **below** it (cannot look up).',
        'Returns only the first match. Not case sensitive.',
        'XLOOKUP (Day 38) works both vertically and horizontally and replaces both VLOOKUP and HLOOKUP in Microsoft 365.',
      ],
      tip: 'Wrap with IFERROR for clean reports: =IFERROR(HLOOKUP(...),"No data").',
    },
  ],
  examples: [
    {
      title: 'Find March sales from a monthly table',
      scenario: 'Monthly sales and targets are laid out across columns. Find the sales for March.',
      table: {
        headers: ['A: Month', 'B: Jan', 'C: Feb', 'D: Mar', 'E: Apr', 'F: May'],
        rows: [
          ['Sales', '120000', '135000', '98000', '150000', '142000'],
          ['Target', '110000', '130000', '100000', '140000', '145000'],
        ],
      },
      steps: [
        'Click an empty cell, e.g. B6.',
        'Type =HLOOKUP("Mar",$B$1:$F$3,2,FALSE)',
        'Press Enter.',
      ],
      code: '=HLOOKUP("Mar",$B$1:$F$3,2,FALSE)',
      result: '98000',
      explanation: 'Excel finds "Mar" in the first row of B1:F3 (column D), then returns the 2nd row of the range, which is sheet row 2 (Sales).',
    },
    {
      title: 'Find the target for a month typed in a cell',
      scenario: 'The manager types a month in B8 (Apr). Show the target in C8.',
      table: {
        headers: ['B8: Month', 'C8: Target'],
        rows: [['Apr', '140000']],
      },
      steps: [
        'Type Apr in B8.',
        'In C8 type =HLOOKUP(B8,$B$1:$F$3,3,FALSE)',
        'Press Enter.',
      ],
      code: '=HLOOKUP(B8,$B$1:$F$3,3,FALSE)',
      result: '140000',
      explanation: 'Row 3 of the range B1:F3 is the Target row. Changing B8 to Jan would give 110000.',
    },
    {
      title: 'Approximate match: discount by quantity slab',
      scenario: 'Discount slabs are across a row: 0 qty = 0%, 10 = 5%, 50 = 10%, 100 = 15%. A customer orders 64 units. Find the discount.',
      table: {
        headers: ['A: Min Qty', 'B: 0', 'C: 10', 'D: 50', 'E: 100'],
        rows: [['Discount', '0%', '5%', '10%', '15%']],
      },
      steps: [
        'Type 64 in B5 (order quantity).',
        'In C5 type =HLOOKUP(B5,$B$1:$E$2,2,TRUE)',
        'Press Enter and format C5 as Percentage.',
      ],
      code: '=HLOOKUP(B5,$B$1:$E$2,2,TRUE)',
      result: '10%',
      explanation: 'The slabs 0, 10, 50, 100 are sorted ascending. The largest slab <= 64 is 50, so the discount below it (10%) is returned. For 100 or more units it would be 15%.',
    },
    {
      title: 'Dynamic row with MATCH',
      scenario: 'Get the Feb Target without hard-coding the row number, so the formula keeps working if a new row (e.g. "Returns") is inserted.',
      table: {
        headers: ['A: Month', 'B: Jan', 'C: Feb', 'D: Mar', 'E: Apr', 'F: May'],
        rows: [
          ['Sales', '120000', '135000', '98000', '150000', '142000'],
          ['Target', '110000', '130000', '100000', '140000', '145000'],
        ],
      },
      steps: [
        'Click an empty cell.',
        'Type =HLOOKUP("Feb",$A$1:$F$3,MATCH("Target",$A$1:$A$3,0),FALSE)',
        'Press Enter.',
      ],
      code: '=HLOOKUP("Feb",$A$1:$F$3,MATCH("Target",$A$1:$A$3,0),FALSE)',
      result: '130000',
      explanation: 'MATCH finds "Target" at position 3 in A1:A3, so HLOOKUP returns row 3 of the Feb column. The range starts at column A here so the labels are included.',
    },
    {
      title: 'Student marks by subject with IFERROR',
      scenario: 'Subjects are across the top and a student\'s marks are below. Look up "Science" and also a subject that does not exist ("Sanskrit").',
      table: {
        headers: ['A: Subject', 'B: Maths', 'C: Science', 'D: English', 'E: Hindi'],
        rows: [['Riya', '78', '85', '91', '74']],
      },
      steps: [
        'In G2 type =IFERROR(HLOOKUP("Science",$B$1:$E$2,2,FALSE),"No such subject")',
        'In G3 type =IFERROR(HLOOKUP("Sanskrit",$B$1:$E$2,2,FALSE),"No such subject")',
        'Press Enter after each.',
      ],
      code: '=IFERROR(HLOOKUP("Science",$B$1:$E$2,2,FALSE),"No such subject")',
      result: 'G2 = 85, G3 = No such subject',
      explanation: 'Science is found in C1, so row 2 gives 85. Sanskrit is not in the header row, HLOOKUP returns #N/A, and IFERROR replaces it with the message.',
    },
  ],
  interview: [
    { q: 'What is the difference between VLOOKUP and HLOOKUP?', a: 'VLOOKUP searches down the first column and returns from a column to the right (col_index_num). HLOOKUP searches across the first row and returns from a row below (row_index_num). Use the one that matches the data orientation.', level: 'Easy' },
    { q: 'Explain row_index_num in HLOOKUP.', a: 'It is the position of the row within table_array to return, counting the first row of the range as 1. It is not the sheet row number unless the range starts at row 1.', level: 'Medium' },
    { q: 'What are the requirements for approximate match in HLOOKUP?', a: 'The first row of table_array must be sorted in ascending order from left to right. HLOOKUP then returns the column of the largest value less than or equal to the lookup value.', level: 'Medium' },
    { q: 'How do you avoid hard-coding the row number?', a: 'Use MATCH inside HLOOKUP, e.g. =HLOOKUP("Feb",A1:F3,MATCH("Target",A1:A3,0),FALSE).', level: 'Hard' },
    { q: 'What error does HLOOKUP return when row_index_num exceeds the rows in the table?', a: '#REF!', level: 'Easy' },
    { q: 'Can HLOOKUP return a value from a row above the lookup row?', a: 'No. It only searches the top row and returns from that row or rows below. Use INDEX+MATCH or XLOOKUP instead.', level: 'Medium' },
    { q: 'Which modern function replaces both VLOOKUP and HLOOKUP?', a: 'XLOOKUP, available in Microsoft 365 and Excel 2021+. It works with vertical or horizontal ranges and defaults to exact match.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Quarter table: row 1 headers Q1, Q2, Q3, Q4 in B1:E1; row 2 Revenue 450000, 520000, 480000, 610000. Find Q3 revenue.',
      hint: 'Exact match, row 2.',
      solution: '=HLOOKUP("Q3",$B$1:$E$2,2,FALSE) returns 480000.',
    },
    {
      task: 'Income tax slab row: B1:E1 = 0, 300000, 700000, 1000000; B2:E2 = 0%, 5%, 10%, 15%. Find the rate for income 850000.',
      hint: 'Approximate match.',
      solution: '=HLOOKUP(850000,$B$1:$E$2,2,TRUE) returns 10% (largest slab <= 850000 is 700000).',
    },
    {
      task: 'Using the monthly table (A1:F3 with Sales in row 2, Target in row 3), calculate the gap Sales minus Target for May.',
      hint: 'Two HLOOKUPs subtracted.',
      solution: '=HLOOKUP("May",$B$1:$F$3,2,FALSE)-HLOOKUP("May",$B$1:$F$3,3,FALSE) = 142000 - 145000 = -3000.',
    },
    {
      task: 'A user types "Jun" in B8, which is not in the month table. Show "Month not found" instead of #N/A.',
      hint: 'IFERROR or IFNA.',
      solution: '=IFNA(HLOOKUP(B8,$B$1:$F$3,2,FALSE),"Month not found") returns Month not found.',
    },
  ],
  quiz: [
    { question: 'HLOOKUP searches the lookup value in:', options: ['The first column', 'The first row', 'The last row', 'Any cell'], answer: 1, explanation: 'HLOOKUP searches across the first (top) row of table_array.' },
    { question: 'In =HLOOKUP("Mar",B1:F3,2,FALSE), the result comes from:', options: ['Row 1', 'Row 2 of the range', 'Row 3', 'Column 2'], answer: 1, explanation: 'row_index_num 2 means the second row of B1:F3, i.e. sheet row 2.' },
    { question: 'Slabs 0, 10, 50, 100 with discounts 0%, 5%, 10%, 15%. HLOOKUP(49, slabs, 2, TRUE) returns:', options: ['0%', '5%', '10%', '15%'], answer: 1, explanation: 'The largest slab <= 49 is 10, giving 5%.' },
    { question: 'If row_index_num is 4 but table_array has 3 rows, the result is:', options: ['#N/A', '#VALUE!', '#REF!', '0'], answer: 2, explanation: 'A row index beyond the table returns #REF!.' },
    { question: 'Which argument value makes HLOOKUP use exact match?', options: ['TRUE', '1', 'FALSE', 'Leave it blank'], answer: 2, explanation: 'FALSE (or 0) forces exact match.' },
  ],
};
