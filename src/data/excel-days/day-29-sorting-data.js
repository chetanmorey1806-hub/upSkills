export default {
  id: 'day-29-sorting-data',
  title: 'Sorting Data: Ascending, Descending, Custom Sort',
  module: 'Module 4: Data Management & Sorting',
  day: 29,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Sorting rearranges rows so data is easier to read: names A to Z, salaries highest first, dates oldest first, or your own order like High-Medium-Low. You will learn quick sorts, multi-level sorts and custom lists without breaking your records.',
  objectives: [
    'Sort text, numbers and dates in ascending and descending order',
    'Sort a full table safely without mixing up rows',
    'Create multi-level sorts (e.g. Department, then Salary)',
    'Use custom lists to sort in a business order (High, Medium, Low; months)',
    'Sort by cell colour and sort left to right',
  ],
  theory: [
    {
      heading: 'What is sorting and where to find it',
      content: 'Sorting means arranging rows in an order based on one or more columns. Excel moves the **entire row** together, so each employee keeps their own salary and department.\n\nWhere to find the sort commands:\n\n- **Data > Sort & Filter > Sort A to Z** (ascending) and **Sort Z to A** (descending)\n- **Data > Sort & Filter > Sort** opens the full Sort dialog box\n- **Home > Editing > Sort & Filter** has the same options\n- Right-click a cell > **Sort** > Sort A to Z / Sort Z to A / Custom Sort\n\nKeyboard shortcuts (press keys one after another):\n\n- **Alt, A, S, A**: Sort A to Z\n- **Alt, A, S, D**: Sort Z to A\n- **Alt, A, S, S**: open the Sort dialog box',
    },
    {
      heading: 'Ascending and descending order',
      content: 'In **Home > Editing > Sort & Filter** and the right-click **Sort** menu, the command names change with the data type (the Data tab buttons always show A to Z / Z to A):\n\n- **Text**: Sort A to Z / Sort Z to A\n- **Numbers**: Sort Smallest to Largest / Sort Largest to Smallest\n- **Dates**: Sort Oldest to Newest / Sort Newest to Oldest\n\nIn ascending order, Excel places numbers first, then text, then logical values (FALSE before TRUE), then errors. **Blank cells always go to the bottom**, whether you sort ascending or descending.',
      tip: 'Click just ONE cell inside the column you want to sort, then click Sort A to Z. Excel detects the whole table automatically. Do not select only one column, or the rows will get mixed up.',
    },
    {
      heading: 'Sorting safely: the Sort Warning',
      content: 'If you select only one column and click Sort, Excel shows the **Sort Warning** dialog:\n\n- **Expand the selection** (recommended): sorts the whole table and keeps rows together.\n- **Continue with the current selection**: sorts only that column, which breaks the data (names no longer match salaries).\n\nOther safety rules:\n\n- Keep one header row and no fully blank rows or columns inside the table.\n- In the Sort dialog, tick **My data has headers** so the header row stays on top.\n- Numbers stored as text sort wrongly (10 before 9). Convert them to numbers first.\n- If you want to return to the original order later, add a Serial No. column before sorting.\n- Ctrl + Z undoes a sort immediately.',
    },
    {
      heading: 'Multi-level sort (Custom Sort)',
      content: 'Use **Data > Sort** (Alt, A, S, S) when you need more than one sort key.\n\n1. Click any cell in the table and open Data > Sort.\n2. Tick **My data has headers**.\n3. **Sort by**: choose the first column (e.g. Dept), **Sort On**: Cell Values, **Order**: A to Z.\n4. Click **Add Level**. **Then by**: Salary, Order: Largest to Smallest.\n5. Click **OK**.\n\nExcel sorts by the first level, and only within equal values of the first level does it use the second level. Up to 64 levels are allowed. **Copy Level** duplicates a level, **Delete Level** removes it, and the up/down arrows change priority.',
    },
    {
      heading: 'Custom lists: sorting in your own order',
      content: 'Alphabetical order is not always meaningful. "High, Low, Medium" is alphabetical, but managers want **High, Medium, Low**.\n\n1. Data > Sort.\n2. Sort by: Priority; Order: **Custom List...**\n3. In List entries type `High`, press Enter, `Medium`, Enter, `Low`; click **Add**, then **OK**.\n4. Click OK to sort.\n\nExcel already has built-in custom lists for **days** (Sun, Mon... / Sunday, Monday...) and **months** (Jan, Feb... / January, February...). Your own lists can also be saved permanently in **File > Options > Advanced > General > Edit Custom Lists**, and they also work with AutoFill.',
    },
    {
      heading: 'Other sort options',
      content: '- **Sort by colour / icon**: In the Sort dialog, set Sort On to **Cell Color**, **Font Color** or **Conditional Formatting Icon**, then choose the colour and On Top / On Bottom.\n- **Case sensitive**: Sort dialog > Options > Case sensitive (lowercase comes before uppercase).\n- **Sort left to right**: Sort dialog > Options > **Sort left to right** sorts columns instead of rows (e.g. month columns).\n- **Formulas**: Excel 365 also has SORT() and SORTBY() functions that return a sorted copy without changing the original (covered in the extra topics).',
    },
  ],
  examples: [
    {
      title: 'Sort names A to Z',
      scenario: 'An attendance list must be arranged alphabetically by employee name.',
      table: {
        headers: ['A: Employee', 'B: Dept', 'C: Salary (₹)'],
        rows: [['Rahul', 'Sales', '45000'], ['Amit', 'Sales', '52000'], ['Sneha', 'HR', '38000'], ['Priya', 'IT', '65000'], ['Karan', 'IT', '30000']],
      },
      steps: [
        'Click any one cell in column A, e.g. A3 (do not select the whole column)',
        'Go to Data > Sort & Filter > Sort A to Z (or press Alt, A, S, A)',
        'Check that the header row stayed in row 1 and each name kept its own department and salary',
      ],
      result: 'Order: Amit (Sales, 52000), Karan (IT, 30000), Priya (IT, 65000), Rahul (Sales, 45000), Sneha (HR, 38000)',
      explanation: 'Excel detects the table around the active cell, recognises the header and moves whole rows. Amit < Karan < Priya < Rahul < Sneha alphabetically.',
    },
    {
      title: 'Sort salaries Largest to Smallest',
      scenario: 'The HR head wants the highest-paid employee at the top.',
      table: {
        headers: ['A: Employee', 'B: Dept', 'C: Salary (₹)'],
        rows: [['Rahul', 'Sales', '45000'], ['Amit', 'Sales', '52000'], ['Sneha', 'HR', '38000'], ['Priya', 'IT', '65000'], ['Karan', 'IT', '30000']],
      },
      steps: [
        'Click any cell in column C, e.g. C2',
        'Go to Data > Sort & Filter > Sort Z to A, or press Alt, A, S, D (in Home > Editing > Sort & Filter the same command is named Sort Largest to Smallest)',
        'Verify the result',
      ],
      result: 'Order: Priya 65000, Amit 52000, Rahul 45000, Sneha 38000, Karan 30000',
      explanation: 'Descending order on a numeric column puts the largest value first. If salaries were stored as text, the order could be wrong, so check that numbers are right-aligned.',
    },
    {
      title: 'Multi-level sort: Department, then Salary',
      scenario: 'Show employees grouped by department (A to Z) and, within each department, highest salary first.',
      table: {
        headers: ['A: Employee', 'B: Dept', 'C: Salary (₹)'],
        rows: [['Rahul', 'Sales', '45000'], ['Amit', 'Sales', '52000'], ['Sneha', 'HR', '38000'], ['Priya', 'IT', '65000'], ['Karan', 'IT', '30000'], ['Rohit', 'HR', '41000']],
      },
      steps: [
        'Click any cell in the table',
        'Go to Data > Sort & Filter > Sort (Alt, A, S, S)',
        'Tick My data has headers',
        'Sort by: Dept, Sort On: Cell Values, Order: A to Z',
        'Click Add Level. Then by: Salary (₹), Sort On: Cell Values, Order: Largest to Smallest',
        'Click OK',
      ],
      result: 'HR: Rohit 41000, Sneha 38000 | IT: Priya 65000, Karan 30000 | Sales: Amit 52000, Rahul 45000',
      explanation: 'Departments are arranged HR, IT, Sales (alphabetical). Inside each department the second level orders salaries from high to low.',
    },
    {
      title: 'Custom sort: High, Medium, Low',
      scenario: 'A task tracker must show High priority tasks first, then Medium, then Low.',
      table: {
        headers: ['A: Task', 'B: Priority'],
        rows: [['Update price list', 'Low'], ['Pay GST', 'High'], ['Team meeting', 'Medium'], ['Client follow-up', 'High'], ['File cleanup', 'Low']],
      },
      steps: [
        'Click any cell in the table and open Data > Sort',
        'Tick My data has headers',
        'Sort by: Priority, Sort On: Cell Values, Order: Custom List...',
        'In List entries type High, press Enter, type Medium, press Enter, type Low',
        'Click Add, then OK',
        'Click OK in the Sort dialog',
      ],
      result: 'Order: Pay GST (High), Client follow-up (High), Team meeting (Medium), Update price list (Low), File cleanup (Low)',
      explanation: 'A normal A to Z sort would give High, High, Low, Low, Medium, which is not the business order. Rows with the same priority keep their original relative order.',
    },
    {
      title: 'Sort months in calendar order',
      scenario: 'A monthly sales summary was typed in random order. Arrange it Jan to Dec, not alphabetically.',
      table: {
        headers: ['A: Month', 'B: Sales (₹)'],
        rows: [['Mar', '42000'], ['Jan', '35000'], ['Apr', '50000'], ['Feb', '38000']],
      },
      steps: [
        'Click any cell in the table and open Data > Sort',
        'Sort by: Month, Order: Custom List...',
        'Select the built-in list Jan, Feb, Mar, Apr, ... and click OK',
        'Click OK in the Sort dialog',
      ],
      result: 'Order: Jan 35000, Feb 38000, Mar 42000, Apr 50000',
      explanation: 'An A to Z sort would give Apr, Feb, Jan, Mar. The built-in month custom list sorts in calendar order. (If the column held real dates, Oldest to Newest would work directly.)',
    },
  ],
  interview: [
    { q: 'How do you sort a table by one column without mixing up rows?', a: 'Click a single cell in that column (not the whole column) and use Data > Sort A to Z / Z to A. Excel expands to the full table. If you see the Sort Warning, choose Expand the selection.', level: 'Easy' },
    { q: 'What is a multi-level sort? Give an example.', a: 'A sort with more than one key, set in Data > Sort using Add Level. Example: sort by Region A to Z, then by Sales Largest to Smallest within each region.', level: 'Easy' },
    { q: 'How do you sort a column in the order High, Medium, Low?', a: 'Data > Sort > Order: Custom List, type High, Medium, Low as list entries, click Add, OK, then OK. It can also be saved in File > Options > Advanced > Edit Custom Lists.', level: 'Medium' },
    { q: 'Where do blank cells go when sorting?', a: 'Blank cells are always placed at the bottom, in both ascending and descending sorts.', level: 'Medium' },
    { q: 'Why might numbers sort as 1, 10, 100, 2, 20?', a: 'They are stored as text, so Excel sorts them character by character. Convert them to numbers (Data > Text to Columns > Finish, or VALUE, or the green-triangle Convert to Number option) and sort again.', level: 'Medium' },
    { q: 'How can you restore the original order after sorting and saving?', a: 'Ctrl+Z works only before closing. A reliable method is to add a Serial No. column before sorting; sorting by that column later restores the original order.', level: 'Medium' },
    { q: 'How do you sort columns instead of rows?', a: 'Data > Sort > Options > Sort left to right, then choose the row to sort by (e.g. Row 1 with month names).', level: 'Hard' },
    { q: 'What is the keyboard shortcut to open the Sort dialog?', a: 'Alt, A, S, S (pressed in sequence). Alt, A, S, A sorts ascending and Alt, A, S, D sorts descending.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a product list: Pen 10, Notebook 45, Bag 650, Marker 25, Stapler 120 (columns Product and Price). Sort by Price from smallest to largest.',
      hint: 'Click a Price cell, then Data > Sort A to Z.',
      solution: 'Click B2 > Data > Sort & Filter > Sort A to Z (Alt, A, S, A), or Home > Editing > Sort & Filter > Sort Smallest to Largest. Result: Pen 10, Marker 25, Notebook 45, Stapler 120, Bag 650.',
    },
    {
      task: 'Student list with Class and Marks: (Riya, 10, 88), (Aman, 9, 76), (Neha, 10, 92), (Karan, 9, 81). Sort by Class ascending, then Marks descending.',
      hint: 'Two levels in Data > Sort.',
      solution: 'Data > Sort > Sort by Class (Smallest to Largest) > Add Level > Then by Marks (Largest to Smallest) > OK. Result: Karan 9 81, Aman 9 76, Neha 10 92, Riya 10 88.',
    },
    {
      task: 'A delivery list has Status values: Delivered, In Transit, Ordered, Returned. Sort it in the business flow order Ordered, In Transit, Delivered, Returned.',
      hint: 'Use a Custom List.',
      solution: 'Data > Sort > Sort by Status > Order: Custom List > type Ordered, In Transit, Delivered, Returned (one per line) > Add > OK > OK.',
    },
    {
      task: 'In a sales list some rows are highlighted yellow (urgent). Bring the yellow rows to the top without changing anything else.',
      hint: 'Sort On: Cell Color.',
      solution: 'Data > Sort > Sort by: (column with colour) > Sort On: Cell Color > Order: choose yellow > On Top > OK.',
    },
  ],
  quiz: [
    { question: 'Which shortcut sequence sorts the current column A to Z?', options: ['Ctrl + S', 'Alt, A, S, A', 'Alt, H, S', 'Ctrl + Shift + L'], answer: 1, explanation: 'Alt, A, S, A = Data tab > Sort A to Z. Ctrl+Shift+L is the filter toggle.' },
    { question: 'In the Sort Warning dialog, which option keeps rows together?', options: ['Continue with the current selection', 'Expand the selection', 'Cancel', 'Sort left to right'], answer: 1, explanation: 'Expand the selection sorts the whole table so each row stays intact.' },
    { question: 'Where do blank cells appear after a descending sort?', options: ['At the top', 'At the bottom', 'In the middle', 'They are deleted'], answer: 1, explanation: 'Blank cells always go to the bottom.' },
    { question: 'To sort "High, Medium, Low" in that order, you should use...', options: ['Sort A to Z', 'Sort Z to A', 'Custom List', 'Sort left to right'], answer: 2, explanation: 'Neither alphabetical order gives High, Medium, Low; a custom list does.' },
    { question: 'In a multi-level sort, the second level is used...', options: ['Before the first level', 'Only for rows with equal values in the first level', 'For hidden rows only', 'Only for blank cells'], answer: 1, explanation: 'Then by acts as a tie-breaker within equal values of the previous level.' },
  ],
};
