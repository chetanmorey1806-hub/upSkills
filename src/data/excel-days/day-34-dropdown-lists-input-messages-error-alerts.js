export default {
  id: 'day-34-dropdown-lists-input-messages-error-alerts',
  title: 'Drop-down Lists, Input Messages, Error Alerts',
  module: 'Module 4: Data Management & Sorting',
  day: 34,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'Drop-down lists let users pick values instead of typing them, which removes spelling mistakes in departments, cities and status fields. Input messages guide the user and error alerts (Stop, Warning, Information) control what happens when a wrong value is entered.',
  objectives: [
    'Create drop-down lists from typed items, a cell range, a named range and an Excel Table',
    'Add an Input Message that appears when a cell is selected',
    'Configure the three Error Alert styles: Stop, Warning, Information',
    'Edit, extend and remove drop-down lists',
    'Build a simple dependent (cascading) drop-down',
  ],
  theory: [
    {
      heading: 'Why use drop-down lists?',
      content: 'If ten people type a department name you may get "Sales", "sales", "Sale", "SALES " and "Slaes". Reports, SUMIF and Pivot Tables then treat them as different departments. A **drop-down list** shows a small arrow in the cell; the user clicks it and picks one value from a fixed list, so the data is always consistent.\n\nDrop-downs are a type of Data Validation: **Data > Data Tools > Data Validation > Settings > Allow: List**.\n\nKeyboard: select the cell and press **Alt+Down Arrow** to open the list.',
    },
    {
      heading: 'Creating a drop-down: three source types',
      content: '**1. Typed items** (small, fixed lists)\nAllow: List, Source: `Present,Absent,Leave` (separate items with commas; no quotes needed).\n\n**2. Cell range** (list stored on the sheet)\nType the items in a range, e.g. H2:H6 on a "Lists" sheet. Source: `=Lists!$H$2:$H$6` (you can click the range with the mouse).\n\n**3. Named range or Table** (best practice)\nSelect the list, type a name like `DeptList` in the Name Box and press Enter. Source: `=DeptList`. If the list is inside an Excel Table (Insert > Table, Ctrl+T) and the name refers to the table column, new items added at the bottom of the table automatically appear in the drop-down.',
      points: [
        '**In-cell dropdown** must be ticked for the arrow to show.',
        '**Ignore blank** allows the cell to be left empty.',
        'Items appear in the same order as the source, so sort the source list A to Z.',
      ],
      tip: 'The Source box does not accept a direct table reference like =Depts[Department]. Create a named range (Formulas > Defined Names > Define Name) that refers to =Depts[Department] and use =DeptName in Source, or use =INDIRECT("Depts[Department]").',
    },
    {
      heading: 'Input Message tab',
      content: 'An **Input Message** is a yellow note that pops up when the user selects the cell. It tells them what to enter before they make a mistake.\n\nData Validation > **Input Message** tab:\n1. Tick "Show input message when cell is selected".\n2. **Title** (bold, up to 32 characters), e.g. "Department".\n3. **Input message** (up to 255 characters), e.g. "Pick the department from the list. Contact HR to add a new one."\n\nYou can add an input message even with Allow: Any value, just as a help note.',
    },
    {
      heading: 'Error Alert tab: Stop, Warning, Information',
      content: 'The **Error Alert** decides what happens when someone types a value that breaks the rule. Tick "Show error alert after invalid data is entered", then choose a **Style**, a **Title** and an **Error message**.',
      points: [
        '**Stop** (red X): the invalid value is never accepted. Buttons: Retry, Cancel. Use for strict rules (Emp ID, Status).',
        '**Warning** (yellow triangle): asks "Continue?" Buttons: Yes (accepts the value), No (edit again), Cancel. Use when exceptions are sometimes allowed.',
        '**Information** (blue i): only informs. Buttons: OK (accepts the value), Cancel. Use for gentle reminders.',
      ],
      tip: 'If you untick "Show error alert", any value can be typed even in a drop-down cell. Keep it ticked with Stop style for strict lists.',
    },
    {
      heading: 'Editing, extending and removing a drop-down',
      content: '- **Edit**: select the cells > Data Validation > change Source. Tick "Apply these changes to all other cells with the same settings" to update every matching cell on the sheet.\n- **Extend**: copy a drop-down cell and Paste Special > Validation to other cells, or drag the fill handle.\n- **Remove**: select cells > Data Validation > **Clear All** > OK. The values typed earlier stay; only the rule is removed.\n- **Find drop-down cells**: Home > Editing > Find & Select > Data Validation.',
    },
    {
      heading: 'Dependent (cascading) drop-down: quick introduction',
      content: 'A dependent list changes based on another cell. Example: choose State in A2, and B2 shows only cities of that state.\n\n1. Type each state\'s cities in a column with the state name as the header (Maharashtra, Karnataka).\n2. Select the city lists with headers > **Formulas > Defined Names > Create from Selection** > tick **Top row**. This creates names Maharashtra and Karnataka.\n3. A2: List with source `=$E$1:$F$1` (the state names).\n4. B2: List with source `=INDIRECT(A2)`.\n\nINDIRECT turns the text "Karnataka" into the named range Karnataka. INDIRECT itself is explained fully on Day 41. Names cannot contain spaces, so use Tamil_Nadu style names.',
    },
  ],
  examples: [
    {
      title: 'Attendance status drop-down from typed items',
      scenario: 'In an attendance sheet, column C should accept only Present, Absent or Leave.',
      table: {
        headers: ['A: Emp ID', 'B: Name', 'C: Status'],
        rows: [
          ['E101', 'Riya', 'Present'],
          ['E102', 'Aman', 'Leave'],
          ['E103', 'Priya', 'Absent'],
        ],
      },
      steps: [
        'Select C2:C31.',
        'Data > Data Tools > Data Validation (Alt, A, V, V).',
        'Settings: Allow = List.',
        'Source: Present,Absent,Leave',
        'Keep In-cell dropdown ticked. Click OK.',
        'Click C2, press Alt+Down Arrow and choose a value.',
      ],
      result: 'Each cell in C2:C31 shows an arrow with three choices: Present, Absent, Leave. Typing "Holiday" is rejected with the Stop alert.',
      explanation: 'Typed items are fine for short lists that rarely change. Items are separated by commas exactly as you want them displayed.',
    },
    {
      title: 'Department drop-down from a named range',
      scenario: 'Department names are kept on a sheet called Lists in A2:A6. Use them as the source for column C of the Employee sheet.',
      table: {
        headers: ['Lists!A: Department'],
        rows: [['Accounts'], ['HR'], ['IT'], ['Sales'], ['Admin']],
      },
      steps: [
        'On the Lists sheet select A2:A6.',
        'Click the Name Box (left of the formula bar), type DeptList and press Enter.',
        'Go to the Employee sheet and select C2:C200.',
        'Data > Data Validation > Allow: List > Source: =DeptList > OK.',
      ],
      code: '=DeptList',
      result: 'Every cell in Employee!C2:C200 shows a drop-down with Accounts, HR, IT, Sales, Admin.',
      explanation: 'Using a named range keeps the formula readable and lets you use a list stored on another sheet. To add a department, insert a row inside A2:A6 (so the name expands) or make the list a Table.',
    },
    {
      title: 'Add an Input Message',
      scenario: 'Users often forget the format of the joining date. Show a help note when they click D2:D200.',
      table: {
        headers: ['D: Joining Date'],
        rows: [['(cell selected: yellow note appears)']],
      },
      steps: [
        'Select D2:D200.',
        'Data > Data Validation > Input Message tab.',
        'Tick "Show input message when cell is selected".',
        'Title: Joining Date',
        'Input message: Enter date as DD-MM-YYYY, for example 15-08-2024.',
        'Click OK and select D2.',
      ],
      result: 'When D2 is selected, a yellow box titled "Joining Date" shows "Enter date as DD-MM-YYYY, for example 15-08-2024."',
      explanation: 'Input messages prevent errors by guiding the user beforehand. They do not block anything by themselves; combine with a Date rule for control.',
    },
    {
      title: 'Warning alert for discount above 10%',
      scenario: 'Sales staff normally give up to 10% discount. Higher discount is possible with manager approval, so show a warning instead of blocking.',
      table: {
        headers: ['A: Invoice', 'B: Discount'],
        rows: [
          ['INV-501', '8%'],
          ['INV-502', '15% (warning shown)'],
        ],
      },
      steps: [
        'Select B2:B500.',
        'Data > Data Validation > Settings: Allow Decimal, between 0 and 0.1.',
        'Error Alert tab: Style = Warning.',
        'Title: High Discount. Error message: Discount above 10% needs manager approval. Continue?',
        'Click OK, type 15% in B3 and press Enter.',
      ],
      result: '8% is accepted silently. 15% shows the yellow Warning box "Discount above 10% needs manager approval. Continue?"; clicking Yes keeps 15%, No returns to edit the cell.',
      explanation: 'Warning style lets the user override the rule; Stop would never allow 15%. Choose the style according to how strict the business rule is.',
    },
    {
      title: 'Stop alert with a custom message on a drop-down',
      scenario: 'The Status column (Pending, Paid, Cancelled) must never contain any other value. Show a clear message.',
      table: {
        headers: ['A: Invoice', 'E: Status'],
        rows: [
          ['INV-501', 'Paid'],
          ['INV-502', 'Pending'],
          ['INV-503', 'Done (blocked)'],
        ],
      },
      steps: [
        'Select E2:E500.',
        'Data > Data Validation > Settings: Allow List, Source: Pending,Paid,Cancelled.',
        'Error Alert tab: Style Stop. Title: Invalid Status. Error message: Choose Pending, Paid or Cancelled from the list.',
        'OK. Type Done in E4 and press Enter.',
      ],
      result: 'A red Stop box titled "Invalid Status" appears with "Choose Pending, Paid or Cancelled from the list." and buttons Retry / Cancel. "Done" is not saved.',
      explanation: 'Stop is the only style that guarantees the value cannot be entered by typing.',
    },
    {
      title: 'Dependent drop-down: State and City',
      scenario: 'Select a state in A2 and show only its cities in B2.',
      table: {
        headers: ['E: Maharashtra', 'F: Karnataka'],
        rows: [
          ['Mumbai', 'Bengaluru'],
          ['Pune', 'Mysuru'],
          ['Nagpur', 'Hubballi'],
        ],
      },
      steps: [
        'Select E1:F4 and choose Formulas > Defined Names > Create from Selection > tick Top row only > OK.',
        'Select A2: Data Validation > List > Source =$E$1:$F$1 > OK.',
        'Select B2: Data Validation > List > Source =INDIRECT(A2) > OK.',
        'Pick Karnataka in A2, then open the B2 drop-down.',
      ],
      code: '=INDIRECT(A2)',
      result: 'With A2 = Karnataka, the B2 drop-down shows Bengaluru, Mysuru, Hubballi. With A2 = Maharashtra, it shows Mumbai, Pune, Nagpur.',
      explanation: 'Create from Selection makes names that match the header text. INDIRECT(A2) converts the selected state name into that named range.',
    },
  ],
  interview: [
    { q: 'How do you create a drop-down list in Excel?', a: 'Select the cells, go to Data > Data Tools > Data Validation, choose Allow: List and type items separated by commas or give a range/named range as Source, keep In-cell dropdown ticked and click OK.', level: 'Easy' },
    { q: 'What are the three Error Alert styles and how do they differ?', a: 'Stop blocks the invalid value (Retry/Cancel). Warning asks to continue; Yes accepts the value. Information only informs; OK accepts the value. Only Stop guarantees invalid data cannot be typed.', level: 'Medium' },
    { q: 'How do you make a drop-down list update automatically when new items are added?', a: 'Keep the source in an Excel Table and create a named range referring to the table column (e.g. =Depts[Department]); use that name as the Source. New rows added to the table appear in the list.', level: 'Hard' },
    { q: 'What is an Input Message?', a: 'A note shown when the user selects a validated cell, set on the Input Message tab of Data Validation with a title (32 chars max) and message (255 chars max).', level: 'Easy' },
    { q: 'How do you build a dependent drop-down?', a: 'Create named ranges for each sub-list whose names match the parent items (Formulas > Create from Selection), make the parent cell a list of those names, and set the child cell Source to =INDIRECT(parent_cell).', level: 'Hard' },
    { q: 'How do you remove a drop-down but keep the values already selected?', a: 'Select the cells, open Data Validation and click Clear All, then OK. Only the rule is removed; the values remain.', level: 'Medium' },
    { q: 'What is the keyboard shortcut to open a drop-down list in a cell?', a: 'Alt+Down Arrow.', level: 'Easy' },
    { q: 'Can a drop-down list use a source on another sheet?', a: 'Yes. Use a reference like =Lists!$A$2:$A$6 or, better, a named range like =DeptList.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a Payment Mode drop-down in F2:F100 with Cash, UPI, Card, Cheque.',
      hint: 'Typed comma-separated source.',
      solution: '1. Select F2:F100. 2. Data > Data Validation > Allow: List. 3. Source: Cash,UPI,Card,Cheque. 4. OK.',
    },
    {
      task: 'Cities Mumbai, Pune, Delhi, Chennai, Kolkata are in Lists!B2:B6. Name the range CityList and use it in a drop-down for Customer!D2:D300 with a Stop alert "Select a city from the list".',
      hint: 'Name Box, then Source =CityList, then Error Alert tab.',
      solution: '1. Select Lists!B2:B6, type CityList in the Name Box, Enter. 2. Select Customer!D2:D300. 3. Data Validation > List > Source =CityList. 4. Error Alert: Style Stop, Title "Invalid City", Message "Select a city from the list". 5. OK.',
    },
    {
      task: 'Add an Input Message on G2:G100 (Quantity): "Enter whole number from 1 to 500".',
      hint: 'Combine Whole number rule with an Input Message.',
      solution: '1. Select G2:G100. 2. Data Validation > Settings: Whole number between 1 and 500. 3. Input Message tab: Title Quantity, Message Enter whole number from 1 to 500. 4. OK.',
    },
    {
      task: 'Overtime hours in H2:H31 should normally be 0 to 4, but more is allowed after a warning.',
      hint: 'Use Warning style.',
      solution: '1. Select H2:H31. 2. Data Validation > Decimal between 0 and 4. 3. Error Alert: Style Warning, Message "More than 4 hours overtime. Is this approved?". 4. OK. Users can click Yes to keep a value like 6.',
    },
    {
      task: 'Create a Category (Stationery, Electronics) and Item dependent drop-down. Stationery: Pen, Pencil, Stapler. Electronics: Mouse, Keyboard, Pendrive.',
      hint: 'Create from Selection + INDIRECT.',
      solution: '1. Put Stationery in J1 with items J2:J4 and Electronics in K1 with items K2:K4. 2. Select J1:K4 > Formulas > Create from Selection > Top row. 3. A2: List Source =$J$1:$K$1. 4. B2: List Source =INDIRECT(A2).',
    },
  ],
  quiz: [
    { question: 'In Data Validation, which Allow option creates a drop-down?', options: ['Any value', 'Custom', 'List', 'Text length'], answer: 2, explanation: 'Allow: List with In-cell dropdown ticked creates the arrow.' },
    { question: 'Which error alert style lets the user keep an invalid value by clicking Yes?', options: ['Stop', 'Warning', 'Information', 'None of these'], answer: 1, explanation: 'Warning asks "Continue?" and Yes accepts the value. Information accepts it with OK.' },
    { question: 'How should typed items be separated in the Source box?', options: ['Semicolons only', 'Spaces', 'Commas (list separator)', 'Line breaks'], answer: 2, explanation: 'Use commas, e.g. Present,Absent,Leave (in regions with a different list separator, use that separator).' },
    { question: 'Which shortcut opens a drop-down list in the active cell?', options: ['Ctrl+Down Arrow', 'Alt+Down Arrow', 'Shift+F3', 'F4'], answer: 1, explanation: 'Alt+Down Arrow opens the in-cell drop-down.' },
    { question: 'For a dependent drop-down in B2 based on A2, the Source is usually:', options: ['=A2', '=INDIRECT(A2)', '=VLOOKUP(A2)', '=LIST(A2)'], answer: 1, explanation: 'INDIRECT converts the text in A2 into the named range of the same name.' },
  ],
};
