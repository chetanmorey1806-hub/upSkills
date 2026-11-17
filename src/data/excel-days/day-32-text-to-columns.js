export default {
  id: 'day-32-text-to-columns',
  title: 'Text to Columns',
  module: 'Module 4: Data Management & Sorting',
  day: 32,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'Text to Columns splits the content of one column into several columns using a delimiter (comma, space, hyphen) or a fixed width. It is the quickest way to separate full names, addresses, codes and imported CSV data, and to fix text-dates and numbers stored as text.',
  objectives: [
    'Open and use the 3-step Convert Text to Columns Wizard',
    'Split data using Delimited mode (comma, space, tab, semicolon, other)',
    'Split data using Fixed width mode with break lines',
    'Set column data formats (General, Text, Date, Do not import) and a Destination cell',
    'Use Text to Columns to convert text dates and numbers stored as text',
  ],
  theory: [
    {
      heading: 'What is Text to Columns?',
      content: 'Often one cell contains several pieces of information together, for example "Riya Sharma" (first and last name), "E101,Riya,Sales" (data from a CSV export) or "Pune-411001" (city and PIN). **Text to Columns** cuts such text into separate columns in one go.\n\nPath: **Data > Data Tools > Text to Columns** (keyboard: Alt, A, E).\n\nIt works on **one column at a time**. Select the cells of a single column, then start the wizard.',
      tip: 'Text to Columns overwrites the cells to the right of the selected column. Insert enough empty columns first (right-click column header > Insert) or set a different Destination in Step 3.',
    },
    {
      heading: 'Step 1: Delimited or Fixed width',
      content: 'The wizard asks how your data is separated:\n\n- **Delimited**: a character such as a comma, space, tab, semicolon, hyphen or slash separates each part. Use this for names ("Riya Sharma"), CSV text ("E101,Riya,Sales") or "Mumbai-400001".\n- **Fixed width**: every part has the same number of characters, aligned in columns. Use this for codes like "INV2024MUM0001" where characters 1-3 are the type, 4-7 the year, 8-10 the branch and 11-14 the serial number.\n\nThe preview at the bottom shows your data. Click **Next**.',
    },
    {
      heading: 'Step 2: Choose delimiters or break lines',
      content: '**For Delimited:** tick one or more delimiters: Tab, Semicolon, Comma, Space, or **Other** (type any one character such as - or / or |).\n\n- **Treat consecutive delimiters as one**: tick it when there may be two spaces between words, so you do not get empty columns.\n- **Text qualifier**: usually the double quote ("). Text inside quotes is kept together even if it contains a comma, so "Sharma, Riya" stays in one column.\n\n**For Fixed width:** click on the ruler in the preview to create a break line. Drag a line to move it; double-click a line to remove it.',
    },
    {
      heading: 'Step 3: Column data format and Destination',
      content: 'Click each column in the preview and choose its format:\n\n- **General**: numbers become numbers, date-like text becomes dates, everything else stays text.\n- **Text**: keeps the value exactly as text. Use this for codes with leading zeros like 0001 or PIN codes, otherwise Excel shows 1.\n- **Date**: choose the order of the source text, for example DMY for 15.08.2024 or MDY for 08/15/2024. Excel converts it into a real date.\n- **Do not import column (skip)**: that part is not written anywhere.\n\n**Destination**: the top-left cell where the split result starts. By default it is the first selected cell (it overwrites the original). Type another cell like $C$2 to keep the original column.\n\nClick **Finish**.',
      tip: 'If Excel asks "There is already data here. Do you want to replace it?", click Cancel, fix the Destination or insert blank columns, and run the wizard again.',
    },
    {
      heading: 'Two hidden uses: fixing text dates and text numbers',
      content: 'Imported data often has numbers stored as text (green triangle in the corner, left-aligned) or dates as text like 15.08.2024 that Excel does not recognise.\n\n- **Numbers stored as text**: select the column > Data > Text to Columns > click **Finish** straight away. Excel re-enters every value and converts them to real numbers.\n- **Text dates**: select the column > Text to Columns > Delimited > Next > untick all delimiters > Next > choose **Date: DMY** > Finish. The text becomes real dates you can sort and calculate with.',
      points: [
        'Text to Columns remembers the last delimiter you used. If you later paste text and it splits by itself, open the wizard and untick the delimiter.',
        'It is a one-time action, not a formula. If the source changes, run it again. (A formula alternative, TEXTSPLIT, is covered in the Additional Skills section.)',
      ],
    },
  ],
  examples: [
    {
      title: 'Split full names into First and Last name',
      scenario: 'Column A has full names. Put first names in column B and last names in column C.',
      table: {
        headers: ['A: Full Name', 'B: First', 'C: Last'],
        rows: [
          ['Riya Sharma', '', ''],
          ['Aman Verma', '', ''],
          ['Priya Nair', '', ''],
          ['Rahul Gupta', '', ''],
        ],
      },
      steps: [
        'Select A2:A5.',
        'Go to Data > Data Tools > Text to Columns.',
        'Step 1: choose Delimited, click Next.',
        'Step 2: untick Tab, tick Space, tick "Treat consecutive delimiters as one". Click Next.',
        'Step 3: set Destination to $B$2 so column A is kept. Click Finish.',
      ],
      result: 'B2:B5 = Riya, Aman, Priya, Rahul; C2:C5 = Sharma, Verma, Nair, Gupta.',
      explanation: 'The space is the delimiter. Setting Destination to B2 keeps the original full names in column A. If a name has three words (Riya K Sharma), you get three columns, so check the data first.',
    },
    {
      title: 'Split comma-separated employee data',
      scenario: 'Data pasted from a CSV export landed in one column. Split it into Emp ID, Name, Department and Salary.',
      table: {
        headers: ['A: Raw Data'],
        rows: [
          ['E101,Riya,Accounts,45000'],
          ['E102,Aman,Sales,38000'],
          ['E103,Priya,HR,42000'],
        ],
      },
      steps: [
        'Select A2:A4.',
        'Data > Data Tools > Text to Columns > Delimited > Next.',
        'Tick Comma (untick others). Text qualifier: ". Click Next.',
        'Leave all columns as General and Destination $A$2. Click Finish.',
      ],
      result: 'A2:D2 = E101 | Riya | Accounts | 45000; A3:D3 = E102 | Aman | Sales | 38000; A4:D4 = E103 | Priya | HR | 42000 (salary as numbers, right-aligned).',
      explanation: 'Each comma marks a column boundary. General format turns 45000 into a real number, so you can SUM the salary column immediately.',
    },
    {
      title: 'Split invoice codes with Fixed width and keep leading zeros',
      scenario: 'Invoice codes like INV2024MUM0001 contain Type (3 chars), Year (4), Branch (3) and Serial (4). Split them and keep 0001 as it is.',
      table: {
        headers: ['A: Invoice Code'],
        rows: [
          ['INV2024MUM0001'],
          ['INV2024DEL0012'],
          ['CRN2025PUN0105'],
        ],
      },
      steps: [
        'Select A2:A4 and open Data > Data Tools > Text to Columns.',
        'Step 1: choose Fixed width, Next.',
        'Step 2: click on the ruler after character 3, after 7 and after 10 to create three break lines. Next.',
        'Step 3: click the 4th column (serial) in the preview and choose Text. Click Finish.',
      ],
      result: 'Row 2: INV | 2024 | MUM | 0001; Row 3: INV | 2024 | DEL | 0012; Row 4: CRN | 2025 | PUN | 0105.',
      explanation: 'Fixed width cuts at character positions. Without setting the last column to Text, Excel would show 1, 12 and 105 because General converts "0001" to the number 1.',
    },
    {
      title: 'Split city and PIN code with a hyphen',
      scenario: 'Branch locations are stored as City-PIN. Split them into two columns B and C.',
      table: {
        headers: ['A: Location'],
        rows: [
          ['Pune-411001'],
          ['Mumbai-400001'],
          ['Delhi-110001'],
        ],
      },
      steps: [
        'Select A2:A4 and open Text to Columns.',
        'Delimited > Next.',
        'Tick Other and type a hyphen (-) in the box. Next.',
        'Select the second column in preview, choose Text (PIN codes should not be used in maths). Destination $B$2. Finish.',
      ],
      result: 'B2:B4 = Pune, Mumbai, Delhi; C2:C4 = 411001, 400001, 110001 (stored as text).',
      explanation: 'Other lets you use any single character as a delimiter. PIN codes are identifiers, so storing them as Text avoids accidental number formatting.',
    },
    {
      title: 'Convert text dates (DD.MM.YYYY) into real dates',
      scenario: 'Joining dates were imported as text like 15.08.2024. Excel cannot sort them by date. Convert them.',
      table: {
        headers: ['A: Joining Date (text)'],
        rows: [
          ['15.08.2024'],
          ['01.12.2023'],
          ['26.01.2025'],
        ],
      },
      steps: [
        'Select A2:A4 and open Data > Data Tools > Text to Columns.',
        'Delimited > Next.',
        'Untick every delimiter. Next.',
        'Choose Column data format: Date and select DMY from the list. Finish.',
        'Optionally apply Home > Number > Short Date or a custom format dd-mmm-yyyy.',
      ],
      result: 'A2:A4 become real dates: 15-Aug-2024, 01-Dec-2023, 26-Jan-2025 (right-aligned; sorting Oldest to Newest gives 01-Dec-2023, 15-Aug-2024, 26-Jan-2025).',
      explanation: 'With no delimiter the whole text stays in one column, and the Date: DMY option tells Excel the day comes first. The cell now contains a date serial number, so sorting and date formulas work.',
    },
  ],
  interview: [
    { q: 'What is the difference between Delimited and Fixed width in Text to Columns?', a: 'Delimited splits wherever a chosen character (comma, space, tab, semicolon or other) appears. Fixed width splits at specific character positions that you set with break lines, useful when every part has the same length.', level: 'Easy' },
    { q: 'How do you keep the original column when using Text to Columns?', a: 'In Step 3 of the wizard change the Destination to an empty cell (for example $C$2) instead of the original first cell.', level: 'Easy' },
    { q: 'How do you prevent leading zeros from being lost when splitting codes like 00123?', a: 'In Step 3, select that column in the data preview and set Column data format to Text. General format would convert 00123 to the number 123.', level: 'Medium' },
    { q: 'How can Text to Columns fix numbers stored as text?', a: 'Select the column, open Data > Text to Columns and click Finish immediately. Excel re-enters each value, so text numbers become real numbers.', level: 'Medium' },
    { q: 'What does Treat consecutive delimiters as one do?', a: 'If two or more delimiters appear together (for example two spaces), Excel treats them as one separator, so no blank columns are created.', level: 'Medium' },
    { q: 'What is the Text qualifier used for?', a: 'Text enclosed in the qualifier (usually double quotes) is treated as one value even if it contains the delimiter. For example "Sharma, Riya" stays in one column when splitting by comma.', level: 'Hard' },
    { q: 'Can Text to Columns split multiple columns at once?', a: 'No. It works on one column at a time. Select a single column range; selecting more columns gives the message that Text to Columns can convert only one column at a time.', level: 'Easy' },
    { q: 'Is Text to Columns dynamic like a formula?', a: 'No. It is a one-time transformation. If the source data changes you must run it again. For a dynamic split use formulas like LEFT/MID/FIND or TEXTSPLIT in Microsoft 365, or Power Query.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Column A: "Sales/North/2024", "HR/South/2023", "IT/West/2025". Split into Department, Region and Year.',
      hint: 'Delimited with Other = /',
      solution: '1. Select A2:A4. 2. Data > Text to Columns > Delimited > Next. 3. Tick Other and type /. Next. 4. Finish. Result: A = Sales, HR, IT; B = North, South, West; C = 2024, 2023, 2025.',
    },
    {
      task: 'Column A has mobile numbers with country code like "+91 9876543210". Keep only the 10-digit number in column B and skip the +91 part.',
      hint: 'Use Do not import column (skip).',
      solution: '1. Select the column. 2. Text to Columns > Delimited > tick Space > Next. 3. Click the first column (+91) in preview and choose Do not import column (skip). 4. Select the second column, choose Text. 5. Destination $B$2. Finish. B shows 9876543210.',
    },
    {
      task: 'Employee codes "MH01EMP0045" have State (2), Office (2), Type (3), Number (4). Split them keeping leading zeros in Office and Number.',
      hint: 'Fixed width with breaks after 2, 4 and 7.',
      solution: '1. Select codes. 2. Text to Columns > Fixed width > Next. 3. Click the ruler after 2, 4 and 7. Next. 4. Set column 2 and column 4 to Text. Finish. Result: MH | 01 | EMP | 0045.',
    },
    {
      task: 'Amounts in column C (₹ values imported from a web report) are left-aligned with a green triangle and SUM returns 0. Fix them.',
      hint: 'Use the wizard without changing anything.',
      solution: '1. Select column C values. 2. Data > Data Tools > Text to Columns. 3. Click Finish at Step 1. 4. Values become numbers (right-aligned) and SUM now works.',
    },
  ],
  quiz: [
    { question: 'Where is Text to Columns located?', options: ['Home > Editing', 'Data > Data Tools', 'Formulas > Text', 'Insert > Text'], answer: 1, explanation: 'Data > Data Tools > Text to Columns (Alt, A, E).' },
    { question: 'Which option splits "INV2024MUM" at fixed character positions?', options: ['Delimited with Comma', 'Fixed width', 'Delimited with Space', 'Text qualifier'], answer: 1, explanation: 'Fixed width splits at character positions using break lines.' },
    { question: 'To keep 0045 as 0045 after splitting, choose column data format:', options: ['General', 'Date', 'Text', 'Do not import'], answer: 2, explanation: 'Text keeps the value exactly as typed; General would convert it to 45.' },
    { question: 'Text "15.08.2024" must become a real date. Which Step 3 option is correct?', options: ['Date: MDY', 'Date: DMY', 'General', 'Text'], answer: 1, explanation: 'The day comes first, then month, then year, so choose Date: DMY.' },
    { question: 'What happens to the original column if Destination is left as the first selected cell?', options: ['It is kept and results go to a new sheet', 'It is overwritten by the first split part', 'Excel refuses to split', 'It is hidden'], answer: 1, explanation: 'By default the first split part replaces the original column and the rest fill columns to the right.' },
  ],
};
