export default {
  id: 'day-33-flash-fill-data-validation',
  title: 'Flash Fill, Data Validation',
  module: 'Module 4: Data Management & Sorting',
  day: 33,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Flash Fill (Ctrl+E) learns a pattern from one or two examples you type and fills the rest of the column automatically. Data Validation stops wrong entries before they happen by allowing only valid numbers, dates, text lengths or custom rules.',
  objectives: [
    'Use Flash Fill to extract, combine and reformat text from one example',
    'Know when Flash Fill fails and how to correct it',
    'Apply Data Validation rules: Whole number, Decimal, Date, Time, Text length and Custom',
    'Use Circle Invalid Data and Clear All to audit and remove validation',
  ],
  theory: [
    {
      heading: 'What is Flash Fill?',
      content: '**Flash Fill** watches what you type next to your data, recognises the pattern and fills the remaining cells for you. No formula is needed.\n\nThree ways to run it:\n1. Type the first result, select the next cell below and press **Ctrl+E**.\n2. **Data > Data Tools > Flash Fill**.\n3. **Home > Editing > Fill > Flash Fill**.\n\nIf **File > Options > Advanced > Automatically Flash Fill** is ON, Excel may also show a grey preview while you type the second entry; press Enter to accept it.',
      points: [
        'Extract: first name from "Riya Sharma", domain from an email, digits from a code.',
        'Combine: "Riya" + "Sharma" into "Sharma, Riya".',
        'Reformat: "9876543210" into "98765-43210", or "riya sharma" into "Riya Sharma".',
      ],
    },
    {
      heading: 'Flash Fill rules and limitations',
      content: '- The result column must be **directly next to** the source data (no blank column between them is best).\n- The result is **static values**, not formulas. If the source changes, the result does not update. Use formulas (LEFT, MID, TEXTJOIN etc.) when you need live updates.\n- If the pattern is ambiguous, Flash Fill may guess wrongly. Type one or two more examples and press Ctrl+E again; Excel re-learns.\n- If Excel says "Flash Fill didn\'t see a pattern", give a clearer example or check that the column is adjacent.',
      tip: 'Always scan the Flash Fill result. Names with middle names (Riya K Sharma) often break the pattern. Use Home > Editing > Find & Select or a filter to spot wrong rows.',
    },
    {
      heading: 'What is Data Validation?',
      content: '**Data Validation** controls what can be typed into a cell. If someone types a wrong value, Excel blocks it (or warns them).\n\nPath: **Data > Data Tools > Data Validation > Data Validation...** (keyboard: Alt, A, V, V).\n\nThe dialog has three tabs:\n- **Settings**: the rule (what is allowed).\n- **Input Message**: a note shown when the cell is selected.\n- **Error Alert**: the message shown when a wrong value is typed.\n\nInput messages, error alert styles and drop-down lists are covered in detail on Day 34. Today we focus on the Settings tab.',
    },
    {
      heading: 'The Allow options in the Settings tab',
      content: 'In **Allow**, choose the type of rule, then set the **Data** condition (between, not between, equal to, not equal to, greater than, less than, greater than or equal to, less than or equal to) and the limits.',
      points: [
        '**Any value**: no restriction (default).',
        '**Whole number**: integers only, e.g. Marks between 0 and 100.',
        '**Decimal**: numbers with decimals, e.g. Discount between 0 and 0.5.',
        '**List**: choose from a drop-down (Day 34).',
        '**Date**: e.g. Invoice date between 01-04-2024 and 31-03-2025 (financial year).',
        '**Time**: e.g. In-time between 09:00 and 11:00.',
        '**Text length**: e.g. PAN must be exactly 10 characters; Mobile equal to 10.',
        '**Custom**: any formula that returns TRUE for valid entries, e.g. no duplicates.',
      ],
      tip: '"Ignore blank" (ticked by default) means an empty value is always allowed. Note that validation never forces anyone to fill a cell: a cell that nobody touches is simply never checked.',
    },
    {
      heading: 'Custom validation formulas',
      content: 'With **Allow: Custom**, type a formula written for the **first (active) cell** of the selection. Excel adjusts it for the other cells exactly like copying a formula, so use relative and absolute references carefully.\n\nExamples (selection starts at A2):\n- No duplicate IDs: `=COUNTIF($A$2:$A$100,A2)=1`\n- 10-digit numeric mobile: `=AND(ISNUMBER(B2),LEN(B2)=10)`\n- Text must start with "E": `=LEFT(C2,1)="E"`\n- Expense cannot exceed budget in D2: `=E2<=$D$2`',
    },
    {
      heading: 'Auditing and removing validation',
      content: '- **Circle Invalid Data**: Data > Data Tools > Data Validation (drop-down arrow) > Circle Invalid Data. Draws red circles around existing values that break the rule (useful because validation does not check data that was already there or pasted in).\n- **Clear Validation Circles**: same menu.\n- **Remove validation**: select cells > Data Validation > **Clear All** > OK.\n- **Find validated cells**: Home > Editing > Find & Select > Data Validation.\n- **Copy validation only**: Copy a cell, then Home > Paste > Paste Special > Validation.',
      tip: 'Pasting (Ctrl+V) over a validated cell replaces its validation rule. Users can bypass validation this way, so audit with Circle Invalid Data regularly.',
    },
  ],
  examples: [
    {
      title: 'Flash Fill: extract first names',
      scenario: 'Column A has full names. Get the first names in column B without formulas.',
      table: {
        headers: ['A: Full Name', 'B: First Name'],
        rows: [
          ['Riya Sharma', 'Riya'],
          ['Aman Verma', ''],
          ['Priya Nair', ''],
          ['Rahul Gupta', ''],
          ['Sneha Patel', ''],
        ],
      },
      steps: [
        'In B2 type Riya and press Enter.',
        'With B3 selected, press Ctrl+E (or Data > Data Tools > Flash Fill).',
        'Check the filled values.',
      ],
      result: 'B3:B6 = Aman, Priya, Rahul, Sneha. Excel shows "Flash Fill changed 4 cells" in a small options icon.',
      explanation: 'Flash Fill learns "take the text before the first space". The results are plain values, so if A3 changes later, B3 will not update.',
    },
    {
      title: 'Flash Fill: combine and reformat names',
      scenario: 'Create "Last, First" format for a report header from separate name columns.',
      table: {
        headers: ['A: First', 'B: Last', 'C: Report Name'],
        rows: [
          ['Riya', 'Sharma', 'Sharma, Riya'],
          ['Aman', 'Verma', ''],
          ['Priya', 'Nair', ''],
        ],
      },
      steps: [
        'In C2 type Sharma, Riya and press Enter.',
        'In C3 press Ctrl+E.',
      ],
      result: 'C3 = Verma, Aman; C4 = Nair, Priya.',
      explanation: 'Flash Fill understands that the output is column B, a comma and space, then column A. One clear example is enough here.',
    },
    {
      title: 'Flash Fill: format mobile numbers',
      scenario: 'Mobile numbers are typed as 10 digits. Show them as 98765-43210.',
      table: {
        headers: ['A: Mobile', 'B: Formatted'],
        rows: [
          ['9876543210', '98765-43210'],
          ['9123456780', ''],
          ['9988776655', ''],
        ],
      },
      steps: [
        'In B2 type 98765-43210 and press Enter.',
        'In B3 press Ctrl+E.',
      ],
      result: 'B3 = 91234-56780; B4 = 99887-76655.',
      explanation: 'Flash Fill inserts the hyphen after the 5th digit for every row. If Excel guesses wrongly, type a second example in B3 and run Ctrl+E again.',
    },
    {
      title: 'Data Validation: marks must be whole numbers from 0 to 100',
      scenario: 'Teachers enter marks in C2:C41. Block decimals, negatives and values above 100.',
      table: {
        headers: ['A: Roll No', 'B: Student', 'C: Marks'],
        rows: [
          ['1', 'Riya', '78'],
          ['2', 'Aman', '105 (blocked)'],
          ['3', 'Priya', '67.5 (blocked)'],
          ['4', 'Rahul', '92'],
        ],
      },
      steps: [
        'Select C2:C41.',
        'Go to Data > Data Tools > Data Validation (Alt, A, V, V).',
        'Settings tab: Allow = Whole number, Data = between, Minimum = 0, Maximum = 100.',
        'Click OK.',
        'Try typing 105 in C3 and press Enter.',
      ],
      result: '78 and 92 are accepted. Typing 105 or 67.5 shows the default Stop alert "This value doesn\'t match the data validation restrictions defined for this cell." with Retry / Cancel buttons.',
      explanation: 'Whole number rejects decimals and the between 0 and 100 condition rejects out-of-range values. The default error style is Stop, which never lets the wrong value in.',
    },
    {
      title: 'Data Validation: PAN must be exactly 10 characters',
      scenario: 'In a vendor master, column D stores PAN numbers. Allow only entries of exactly 10 characters.',
      table: {
        headers: ['A: Vendor', 'D: PAN'],
        rows: [
          ['Shree Traders', 'ABCPS1234K (accepted)'],
          ['Om Supplies', 'ABCP1234 (blocked, 8 chars)'],
        ],
      },
      steps: [
        'Select D2:D200.',
        'Data > Data Tools > Data Validation.',
        'Allow = Text length, Data = equal to, Length = 10.',
        'Click OK.',
      ],
      result: 'ABCPS1234K (10 characters) is accepted; ABCP1234 (8 characters) is rejected with the Stop alert.',
      explanation: 'Text length counts characters of whatever is typed. It does not check the PAN pattern itself; for that you would add a Custom formula.',
    },
    {
      title: 'Custom validation: no duplicate Employee IDs',
      scenario: 'Prevent anyone from typing an Emp ID that already exists in A2:A100.',
      table: {
        headers: ['A: Emp ID', 'B: Name'],
        rows: [
          ['E101', 'Riya'],
          ['E102', 'Aman'],
          ['E103', 'Priya'],
          ['E102 (typed again: blocked)', ''],
        ],
      },
      steps: [
        'Select A2:A100 (A2 must be the active cell).',
        'Data > Data Tools > Data Validation.',
        'Allow = Custom.',
        'Formula: =COUNTIF($A$2:$A$100,A2)=1',
        'Click OK, then try typing E102 in A5.',
      ],
      code: '=COUNTIF($A$2:$A$100,A2)=1',
      result: 'Typing E102 in A5 is blocked because COUNTIF finds 2 cells with E102, so the formula returns FALSE. Typing E104 is accepted (count = 1, TRUE).',
      explanation: 'The range is absolute ($A$2:$A$100) so every cell checks the full list, while A2 is relative so each cell checks its own value.',
    },
  ],
  interview: [
    { q: 'What is the shortcut for Flash Fill and where is it on the ribbon?', a: 'Ctrl+E. On the ribbon it is Data > Data Tools > Flash Fill, and also Home > Editing > Fill > Flash Fill.', level: 'Easy' },
    { q: 'Flash Fill vs formulas: which would you use for a monthly report that refreshes?', a: 'Formulas (or Power Query). Flash Fill produces static values that do not update when source data changes, so it suits one-time cleaning, not refreshing reports.', level: 'Medium' },
    { q: 'What are the Allow options in Data Validation?', a: 'Any value, Whole number, Decimal, List, Date, Time, Text length and Custom.', level: 'Easy' },
    { q: 'Does Data Validation check values already present in the cells?', a: 'No. It only checks values typed after the rule is applied. Use Data > Data Validation > Circle Invalid Data to highlight existing invalid values.', level: 'Medium' },
    { q: 'How can a user bypass Data Validation?', a: 'By pasting a value (or a cell) into the validated cell; normal paste overwrites the validation rule too. Protecting the sheet or using Paste Special > Values plus regular audits reduces this risk.', level: 'Hard' },
    { q: 'Write a validation rule to prevent duplicate entries in A2:A500.', a: 'Select A2:A500 with A2 active, Data Validation > Allow: Custom, Formula: =COUNTIF($A$2:$A$500,A2)=1.', level: 'Medium' },
    { q: 'How do you find all cells that have data validation on a sheet?', a: 'Home > Editing > Find & Select > Data Validation, or F5 > Special > Data validation > All.', level: 'Medium' },
    { q: 'How do you make sure invoice dates fall within FY 2024-25?', a: 'Select the date cells > Data Validation > Allow: Date, Data: between, Start date 01-04-2024, End date 31-03-2025.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Column A has emails: riya.sharma@abc.com, aman.verma@xyz.in, priya.nair@abc.com. Extract the user name before @ in column B using Flash Fill.',
      hint: 'Type the first answer, then Ctrl+E.',
      solution: '1. In B2 type riya.sharma. 2. Select B3, press Ctrl+E. Result: aman.verma, priya.nair.',
    },
    {
      task: 'Allow only a discount between 0% and 25% in E2:E50 (decimals allowed).',
      hint: 'Percentages are decimals: 25% = 0.25.',
      solution: '1. Select E2:E50. 2. Data > Data Validation. 3. Allow: Decimal, Data: between, Minimum 0, Maximum 0.25 (or 25%). 4. OK. Typing 30% is now blocked.',
    },
    {
      task: 'Office in-time in C2:C30 must be between 09:00 and 10:30.',
      hint: 'Use Allow: Time.',
      solution: '1. Select C2:C30. 2. Data > Data Validation. 3. Allow: Time, Data: between, Start time 9:00, End time 10:30. 4. OK.',
    },
    {
      task: 'Mobile numbers in B2:B100 must be numeric and exactly 10 digits. Then highlight any existing invalid numbers.',
      hint: 'Custom formula with AND, ISNUMBER and LEN; then Circle Invalid Data.',
      solution: '1. Select B2:B100 (B2 active). 2. Data Validation > Allow: Custom > Formula =AND(ISNUMBER(B2),LEN(B2)=10). 3. OK. 4. Data > Data Validation arrow > Circle Invalid Data to mark old wrong entries.',
    },
    {
      task: 'Product codes in A: "pen-101", "pencil-202", "eraser-303". Using Flash Fill create "PEN" , "PENCIL", "ERASER" in column B.',
      hint: 'Type the first output in capitals.',
      solution: '1. In B2 type PEN. 2. Select B3 and press Ctrl+E. Result: PENCIL, ERASER. Check the results because Flash Fill guesses the pattern.',
    },
  ],
  quiz: [
    { question: 'What is the keyboard shortcut for Flash Fill?', options: ['Ctrl+F', 'Ctrl+E', 'Ctrl+L', 'Ctrl+D'], answer: 1, explanation: 'Ctrl+E runs Flash Fill. Ctrl+D is Fill Down, Ctrl+L creates a table.' },
    { question: 'Flash Fill results are:', options: ['Formulas that update automatically', 'Static values', 'Data validation rules', 'Hyperlinks'], answer: 1, explanation: 'Flash Fill writes plain values; they do not update when the source changes.' },
    { question: 'Which Allow option restricts a PAN cell to exactly 10 characters?', options: ['Whole number', 'Decimal', 'Text length', 'List'], answer: 2, explanation: 'Text length with "equal to 10" restricts the number of characters.' },
    { question: 'Which feature marks existing values that break a validation rule?', options: ['Clear All', 'Circle Invalid Data', 'Error Checking', 'Trace Precedents'], answer: 1, explanation: 'Data > Data Validation > Circle Invalid Data draws red circles around invalid existing entries.' },
    { question: 'A Custom validation formula must return what for a value to be accepted?', options: ['0', 'TRUE', 'A text message', 'An error'], answer: 1, explanation: 'The entry is allowed when the formula returns TRUE (or a non-zero number).' },
  ],
};
