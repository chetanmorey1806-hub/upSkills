export default {
  id: 'day-10-html-tables',
  title: 'HTML Tables: <table>, <tr>, <th>, <td>, <caption>, colspan, rowspan',
  module: 'Module 2: Links, Images & Lists',
  day: 10,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Tables display two-dimensional data such as timetables, price lists and marksheets. Learn the table elements, how to merge cells with colspan and rowspan, add captions and header scope, and why tables must never be used for page layout.',
  objectives: [
    'Build a table with <table>, <tr>, <th> and <td>',
    'Add a <caption> and group rows with <thead>, <tbody> and <tfoot>',
    'Merge cells horizontally with colspan and vertically with rowspan',
    'Make tables accessible with th and the scope attribute',
    'Style tables with CSS instead of obsolete attributes',
  ],
  theory: [
    {
      heading: 'When to use a table',
      content: "A table is for **tabular data**: information that naturally has **rows and columns**, where each cell relates to both its row and its column header. Think of an Excel sheet, a train timetable, a marksheet or a price comparison.\n\nIn the 1990s and 2000s developers used tables to **lay out whole pages** (sidebar in one cell, content in another). **Do not do this.** Layout tables are hard to maintain, are not responsive on mobiles and confuse screen readers, which announce \"table, 3 columns, 5 rows\" for what is not data. Use CSS Flexbox and Grid for layout.",
      tip: 'Interview line: "Tables are for tabular data, not for layout."',
    },
    {
      heading: 'Basic table elements',
      content: "- `<table>`: the container for the whole table.\n- `<tr>`: **table row**. Tables are built **row by row**.\n- `<th>`: **table header** cell. Bold and centred by default; it labels a row or column and is announced by screen readers when reading data cells.\n- `<td>`: **table data** cell: the actual values.\n\nEvery row should have the same number of cells (counting merged cells). Cells go **only** inside `<tr>`, and `<tr>` goes inside `<table>` (or its sections).",
      syntax: '<table>\n  <tr>\n    <th>Name</th>\n    <th>Marks</th>\n  </tr>\n  <tr>\n    <td>Riya</td>\n    <td>92</td>\n  </tr>\n</table>',
    },
    {
      heading: '<caption>, <thead>, <tbody>, <tfoot>',
      content: "- `<caption>`: the **title of the table**. It must be the **first child** of `<table>`. It is shown above the table and screen readers announce it, so users know what the table is about before reading it.\n- `<thead>`: groups the **header rows**.\n- `<tbody>`: groups the **main data rows**. (If you omit it, the browser adds it automatically.)\n- `<tfoot>`: groups **summary rows** like totals.\n\nBenefits of the sections: clearer code, easier CSS (style `thead` differently), printing long tables repeats the header on each page, and JavaScript can sort only `tbody` rows.",
      syntax: '<table>\n  <caption>Monthly Expenses</caption>\n  <thead>\n    <tr><th>Item</th><th>Amount</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Rent</td><td>₹12,000</td></tr>\n    <tr><td>Food</td><td>₹6,000</td></tr>\n  </tbody>\n  <tfoot>\n    <tr><th>Total</th><td>₹18,000</td></tr>\n  </tfoot>\n</table>',
    },
    {
      heading: 'colspan: merging columns',
      content: "`colspan=\"n\"` makes a cell stretch **across n columns** (horizontally), like Excel's \"Merge and Center\" across columns.\n\nWhen a cell spans 2 columns, that row needs **one fewer cell**. Always count: the total of cells (counting each colspan value) in every row should equal the number of columns.",
      syntax: '<tr>\n  <th colspan="3">Student Report</th>   <!-- covers 3 columns -->\n</tr>\n<tr>\n  <td>Name</td><td>Maths</td><td>Science</td>\n</tr>',
      tip: 'Common mistake: adding colspan but not removing the extra cells, which pushes cells outside the table edge.',
    },
    {
      heading: 'rowspan: merging rows',
      content: "`rowspan=\"n\"` makes a cell stretch **down across n rows** (vertically).\n\nThe cell occupies space in the rows below, so **those rows must have one fewer cell**. Tip: sketch the table on paper as a grid first, mark merged cells, then write the HTML row by row.\n\nTimetables are the classic example: a \"Lunch\" cell spanning all days, or a subject that lasts two periods.",
      syntax: '<tr>\n  <td rowspan="2">Monday</td>  <!-- covers this row and the next -->\n  <td>Maths</td>\n</tr>\n<tr>\n  <!-- no Monday cell here: it is already covered -->\n  <td>Physics</td>\n</tr>',
    },
    {
      heading: 'Accessibility and styling',
      content: "**scope** tells screen readers which cells a header labels:\n- `<th scope=\"col\">`: header for its **column**\n- `<th scope=\"row\">`: header for its **row**\n\n**Styling:** old attributes like `border`, `cellpadding`, `cellspacing`, `bgcolor` and `align` on tables are **obsolete**. Use CSS:\n- `border: 1px solid #ccc` on `th, td`\n- `border-collapse: collapse` on `table` to merge double borders into single lines\n- `padding` on cells\n- `tr:nth-child(even)` for zebra stripes\n\nFor wide tables on mobile, wrap the table in a container with `overflow-x: auto` so it scrolls horizontally instead of breaking the page.",
      syntax: 'table { border-collapse: collapse; width: 100%; }\nth, td { border: 1px solid #ccc; padding: 8px; text-align: left; }\ntbody tr:nth-child(even) { background: #f5f5f5; }',
    },
  ],
  examples: [
    {
      title: 'Student marksheet',
      scenario: 'Display student marks with a caption, header row and zebra stripes.',
      steps: [
        'Create marks.html',
        'Add <table> with a <caption> as the first child',
        'Add a <thead> row of <th scope="col"> headers',
        'Add <tbody> rows of <td> data',
        'Add CSS for borders and stripes, then click Run',
      ],
      code: `<table>
  <caption>Class 10 - Term 1 Results</caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Maths</th>
      <th scope="col">Science</th>
      <th scope="col">English</th>
    </tr>
  </thead>
  <tbody>
    <tr><th scope="row">Riya</th><td>92</td><td>88</td><td>79</td></tr>
    <tr><th scope="row">Aman</th><td>75</td><td>81</td><td>90</td></tr>
    <tr><th scope="row">Sara</th><td>98</td><td>94</td><td>85</td></tr>
  </tbody>
</table>`,
      playground: {
        html: `<table>
  <caption>Class 10 - Term 1 Results</caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Maths</th>
      <th scope="col">Science</th>
      <th scope="col">English</th>
    </tr>
  </thead>
  <tbody>
    <tr><th scope="row">Riya</th><td>92</td><td>88</td><td>79</td></tr>
    <tr><th scope="row">Aman</th><td>75</td><td>81</td><td>90</td></tr>
    <tr><th scope="row">Sara</th><td>98</td><td>94</td><td>85</td></tr>
  </tbody>
</table>`,
        css: `table { border-collapse: collapse; font-family: sans-serif; min-width: 360px; }
caption { font-weight: bold; padding: 8px; }
th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: center; }
thead th { background: #0f766e; color: white; }
tbody th { text-align: left; }
tbody tr:nth-child(even) { background: #f1f5f9; }`,
      },
      result: 'A bordered table titled "Class 10 - Term 1 Results" with a teal header row and alternating grey stripes.',
      explanation: 'caption names the table, thead/tbody group rows, th with scope="col" labels columns and th with scope="row" labels each student row. border-collapse merges double borders into single lines.',
    },
    {
      title: 'colspan in an invoice',
      scenario: 'Create a simple invoice where the "Total" label spans three columns.',
      steps: [
        'Create a table with 4 columns: Item, Qty, Price, Amount',
        'Add item rows',
        'In <tfoot>, add a row with colspan="3" for the label and one cell for the total',
        'Click Run',
      ],
      code: `<tfoot>
  <tr>
    <th colspan="3" scope="row">Grand Total</th>
    <td>₹1,350</td>
  </tr>
</tfoot>`,
      playground: {
        html: `<table>
  <caption>Invoice #1024</caption>
  <thead>
    <tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Price</th><th scope="col">Amount</th></tr>
  </thead>
  <tbody>
    <tr><td>Notebook</td><td>5</td><td>₹50</td><td>₹250</td></tr>
    <tr><td>Pen pack</td><td>2</td><td>₹150</td><td>₹300</td></tr>
    <tr><td>Backpack</td><td>1</td><td>₹800</td><td>₹800</td></tr>
  </tbody>
  <tfoot>
    <tr><th colspan="3" scope="row">Grand Total</th><td>₹1,350</td></tr>
  </tfoot>
</table>`,
        css: `table { border-collapse: collapse; font-family: sans-serif; }
th, td { border: 1px solid #999; padding: 6px 12px; }
td:nth-child(n+2) { text-align: right; }
tfoot th { text-align: right; background: #fef3c7; }
tfoot td { font-weight: bold; text-align: right; background: #fef3c7; }`,
      },
      result: 'An invoice table where the last row shows "Grand Total" stretched across three columns and ₹1,350 in the last column.',
      explanation: 'The footer row has only 2 cells, but the first counts as 3 columns (colspan="3") + 1 = 4 columns, matching the other rows.',
    },
    {
      title: 'Timetable with rowspan and colspan',
      scenario: 'A school timetable where one subject lasts two periods and lunch spans all days.',
      steps: [
        'Sketch a grid: columns = Day, P1, P2, Lunch, P3',
        'Lunch cell: rowspan="3" (covers all three day rows)',
        'Monday Maths: colspan="2" (double period)',
        'In rows 2 and 3, do not add a Lunch cell',
        'Click Run and count cells',
      ],
      code: `<tr>
  <th scope="row">Mon</th>
  <td colspan="2">Maths (double)</td>
  <td rowspan="3">Lunch</td>
  <td>English</td>
</tr>
<tr>
  <th scope="row">Tue</th>
  <td>Science</td><td>Hindi</td>
  <!-- Lunch already covered -->
  <td>Art</td>
</tr>`,
      playground: {
        html: `<table>
  <caption>Class 8 Timetable</caption>
  <thead>
    <tr><th scope="col">Day</th><th scope="col">P1</th><th scope="col">P2</th><th scope="col">12:00</th><th scope="col">P3</th></tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Mon</th>
      <td colspan="2">Maths (double)</td>
      <td rowspan="3" class="lunch">Lunch</td>
      <td>English</td>
    </tr>
    <tr>
      <th scope="row">Tue</th>
      <td>Science</td><td>Hindi</td>
      <td>Art</td>
    </tr>
    <tr>
      <th scope="row">Wed</th>
      <td>History</td><td>Computer</td>
      <td>Sports</td>
    </tr>
  </tbody>
</table>`,
        css: `table { border-collapse: collapse; font-family: sans-serif; text-align: center; }
th, td { border: 1px solid #94a3b8; padding: 8px 14px; }
thead th { background: #e2e8f0; }
.lunch { background: #fde68a; font-weight: bold; writing-mode: vertical-rl; }`,
        js: `document.querySelectorAll('tbody tr').forEach((tr, i) => {
  let cols = 0;
  for (const c of tr.cells) cols += c.colSpan;
  console.log('Row ' + (i + 1) + ': ' + tr.cells.length + ' cells written, ' + cols + ' columns via colspan');
});`,
      },
      result: 'A timetable where Monday Maths spans P1 and P2, and a yellow vertical "Lunch" cell spans all three days.',
      explanation: 'The Lunch cell occupies column 4 in rows 1-3, so rows 2 and 3 omit it. Monday uses colspan="2" so it writes one fewer cell. The console shows how many cells were written per row.',
    },
    {
      title: 'Responsive table wrapper',
      scenario: 'A wide comparison table should scroll sideways on small phones instead of breaking the page.',
      steps: [
        'Wrap the table in a <div class="table-wrap">',
        'Give the wrapper overflow-x: auto',
        'Make the preview narrow and scroll the table horizontally',
      ],
      code: `<div class="table-wrap">
  <table>...</table>
</div>

.table-wrap { overflow-x: auto; }`,
      playground: {
        html: `<div class="table-wrap">
  <table>
    <caption>Phone Comparison</caption>
    <thead>
      <tr><th scope="col">Model</th><th scope="col">Price</th><th scope="col">RAM</th><th scope="col">Storage</th><th scope="col">Camera</th><th scope="col">Battery</th><th scope="col">Display</th></tr>
    </thead>
    <tbody>
      <tr><th scope="row">Nova X5</th><td>₹24,999</td><td>8 GB</td><td>128 GB</td><td>50 MP</td><td>5000 mAh</td><td>6.5 in AMOLED</td></tr>
      <tr><th scope="row">Zen Pro</th><td>₹34,999</td><td>12 GB</td><td>256 GB</td><td>64 MP</td><td>4800 mAh</td><td>6.7 in AMOLED</td></tr>
    </tbody>
  </table>
</div>`,
        css: `.table-wrap { overflow-x: auto; max-width: 100%; border: 1px solid #ddd; }
table { border-collapse: collapse; white-space: nowrap; font-family: sans-serif; }
th, td { border: 1px solid #ddd; padding: 8px 12px; }`,
      },
      result: 'A comparison table that can be scrolled horizontally when the preview is narrower than the table.',
      explanation: 'Tables cannot shrink below their content width. The wrapper with overflow-x: auto contains the overflow so only the table scrolls, not the whole page.',
    },
  ],
  interview: [
    { q: 'What is the difference between <th> and <td>?', a: '<th> is a header cell that labels a row or column (bold and centred by default, announced by screen readers as a header). <td> is a standard data cell.', level: 'Easy' },
    { q: 'What do colspan and rowspan do?', a: 'colspan makes a cell span multiple columns horizontally; rowspan makes a cell span multiple rows vertically. The affected rows must contain fewer cells accordingly.', level: 'Easy' },
    { q: 'What is the purpose of <caption>?', a: 'It provides a title/description of the table. It must be the first child of <table>, and screen readers announce it to give context.', level: 'Easy' },
    { q: 'Why should tables not be used for page layout?', a: 'Layout tables are non-semantic, confuse screen readers, are hard to make responsive and maintain, and mix structure with presentation. CSS Flexbox and Grid should be used for layout.', level: 'Medium' },
    { q: 'What are <thead>, <tbody> and <tfoot> used for?', a: 'They group header, body and footer rows. This improves semantics and readability, allows separate styling, enables header/footer repetition when printing, and makes scripting (e.g. sorting tbody) easier.', level: 'Medium' },
    { q: 'What does the scope attribute do?', a: 'On a <th>, scope="col" or scope="row" (also colgroup/rowgroup) tells assistive technology which cells the header applies to, so data cells can be read with the correct header.', level: 'Medium' },
    { q: 'What does border-collapse: collapse do?', a: 'It merges adjacent cell borders into a single border instead of showing separate borders with spacing between cells (the default "separate" model).', level: 'Medium' },
    { q: 'If a table has 4 columns and one cell in a row has colspan="2", how many cells should that row contain?', a: 'Three cells: the merged cell counts as two columns, plus two normal cells = 4 columns.', level: 'Medium' },
    { q: 'Is <tbody> required?', a: 'It is optional in the source, but the browser inserts a <tbody> automatically into the DOM if you omit it. This matters for CSS selectors like table > tr, which will not match.', level: 'Hard' },
    { q: 'How do you make a table responsive?', a: 'Common techniques: wrap it in a container with overflow-x: auto, reduce padding/font size with media queries, or restructure rows into cards on small screens with CSS. Never set fixed widths that exceed the screen.', level: 'Medium' },
    { q: 'Which table attributes are obsolete in HTML5?', a: 'border (except border="1" only as a non-conforming hint), cellpadding, cellspacing, bgcolor, align, width and height on table elements. Use CSS instead.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a 3-column table "Top Indian Cities" with headers City, State, Population and three data rows, with a caption.',
      hint: 'caption first, then thead and tbody.',
      solution: `<table>
  <caption>Top Indian Cities</caption>
  <thead>
    <tr><th scope="col">City</th><th scope="col">State</th><th scope="col">Population</th></tr>
  </thead>
  <tbody>
    <tr><td>Mumbai</td><td>Maharashtra</td><td>2.0 crore</td></tr>
    <tr><td>Delhi</td><td>Delhi</td><td>1.9 crore</td></tr>
    <tr><td>Bengaluru</td><td>Karnataka</td><td>1.3 crore</td></tr>
  </tbody>
</table>`,
    },
    {
      task: 'Build a table where the first row is a single title cell "Employee Details" spanning 3 columns, followed by a header row (Name, Role, Salary) and two employees.',
      hint: 'colspan="3" on the title cell.',
      solution: `<table>
  <thead>
    <tr><th colspan="3">Employee Details</th></tr>
    <tr><th scope="col">Name</th><th scope="col">Role</th><th scope="col">Salary</th></tr>
  </thead>
  <tbody>
    <tr><td>Kiran</td><td>Developer</td><td>₹60,000</td></tr>
    <tr><td>Neha</td><td>Designer</td><td>₹55,000</td></tr>
  </tbody>
</table>`,
    },
    {
      task: 'Create a table of departments and employees where "Engineering" spans 2 employee rows and "Sales" spans 2 rows.',
      hint: 'rowspan="2" on the department cell; the next row has only the employee cell.',
      solution: `<table>
  <thead>
    <tr><th scope="col">Department</th><th scope="col">Employee</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row" rowspan="2">Engineering</th><td>Arjun</td></tr>
    <tr><td>Meera</td></tr>
    <tr><th scope="row" rowspan="2">Sales</th><td>Vikram</td></tr>
    <tr><td>Pooja</td></tr>
  </tbody>
</table>`,
    },
    {
      task: 'Style any table with single-line borders, 10px padding, a dark header with white text and zebra stripes using only CSS.',
      hint: 'border-collapse, th/td borders, nth-child(even).',
      solution: `<style>
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #cbd5e1; padding: 10px; }
  thead th { background: #1e293b; color: #fff; }
  tbody tr:nth-child(even) { background: #f1f5f9; }
</style>
<table>
  <thead><tr><th>Plan</th><th>Price</th></tr></thead>
  <tbody>
    <tr><td>Basic</td><td>₹199</td></tr>
    <tr><td>Standard</td><td>₹499</td></tr>
    <tr><td>Premium</td><td>₹799</td></tr>
  </tbody>
</table>`,
    },
    {
      task: 'Create a monthly budget table with a caption and a tfoot row showing "Total" and the summed amount. Items: Rent 10000, Food 5000, Travel 2000.',
      hint: 'Two columns: Item and Amount. tfoot holds Total.',
      solution: `<table>
  <caption>March Budget</caption>
  <thead><tr><th scope="col">Item</th><th scope="col">Amount (₹)</th></tr></thead>
  <tbody>
    <tr><td>Rent</td><td>10,000</td></tr>
    <tr><td>Food</td><td>5,000</td></tr>
    <tr><td>Travel</td><td>2,000</td></tr>
  </tbody>
  <tfoot>
    <tr><th scope="row">Total</th><td>17,000</td></tr>
  </tfoot>
</table>`,
    },
  ],
  quiz: [
    { question: 'Which element creates a table row?', options: ['<td>', '<tr>', '<th>', '<row>'], answer: 1, explanation: '<tr> = table row.' },
    { question: 'Which attribute merges a cell across columns?', options: ['rowspan', 'merge', 'span', 'colspan'], answer: 3, explanation: 'colspan spans columns horizontally.' },
    { question: 'Where must <caption> appear?', options: ['As the first child of <table>', 'After </table>', 'Inside <thead>', 'Inside any <td>'], answer: 0, explanation: 'caption must be the first child of table.' },
    { question: 'In a 3-column table, a row has a cell with colspan="2". How many cells should that row have?', options: ['1', '3', '2', '4'], answer: 2, explanation: '2 (merged) + 1 = 3 columns, written as 2 cells.' },
    { question: 'What should be used instead of tables for page layout?', options: ['More nested tables', 'CSS Flexbox and Grid', '<frameset>', '<pre>'], answer: 1, explanation: 'Use CSS layout tools; tables are for tabular data.' },
  ],
};
