export default {
  id: 'day-08-data-types-rename-replace',
  title: 'Change Data Types, Rename Columns, Replace Values',
  module: 'Module 2: Power Query – Data Cleaning',
  day: 8,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Give every column the correct data type (including Indian dd-mm-yyyy dates using locale), give columns business-friendly names, and fix wrong or inconsistent values with Replace Values and Replace Errors – with the exact clicks and M code.',
  objectives: [
    'Choose the right Power Query data type for each column and understand why types matter',
    'Change types with the header icon, the ribbon and Using Locale for dd-mm-yyyy dates',
    'Rename columns cleanly and understand Table.RenameColumns',
    'Replace values and text (whole cell vs part of text) and replace errors',
    'Order steps correctly: replace bad values before changing type',
  ],
  theory: [
    {
      heading: 'Why data types matter',
      content:
        `A data type tells Power BI **what kind of value** is in a column. Without the right type:\n\n- you cannot **SUM** an Amount stored as text,\n- dates stored as text sort alphabetically ("01-02-2024" before "05-01-2024") and do not work with time intelligence,\n- relationships fail if one key is text and the other is number,\n- text columns use more memory than numbers.\n\nAnalogy: data types are like **labelled containers in a kitchen** – sugar in the sugar jar, salt in the salt jar. If the labels are wrong, every recipe goes wrong.`,
    },
    {
      heading: 'Power Query data types and their M names',
      content:
        `Click the icon on the left of a column header, or use **Transform > Data Type** (also **Home > Data Type**):`,
      points: [
        '**Decimal Number** (1.2) – `type number`',
        '**Fixed Decimal Number** ($) – `Currency.Type` (4 decimal places, good for money)',
        '**Whole Number** (123) – `Int64.Type`',
        '**Percentage** (%) – `Percentage.Type`',
        '**Date/Time** – `type datetime`, **Date** – `type date`, **Time** – `type time`',
        '**Date/Time/Timezone** – `type datetimezone`, **Duration** – `type duration`',
        '**Text** (ABC) – `type text`, **True/False** – `type logical`, **Binary** – `type binary`',
        '**Any** (ABC/123) – type not set; avoid loading Any columns.',
      ],
      syntax: `Table.TransformColumnTypes(PreviousStep, {{"OrderID", Int64.Type}, {"Amount", type number}, {"Order Date", type date}})`,
      tip: 'When you change a type right after an existing Changed Type step, Power Query asks "Replace current" or "Add new step". Choose Replace current to keep one tidy type step.',
    },
    {
      heading: 'Dates and Using Locale',
      content:
        `In India dates are written **dd-mm-yyyy**. Power BI uses your computer/file locale to read text dates. If the locale is English (United States), "05-01-2024" becomes **1 May 2024** instead of **5 January 2024**, and "25-01-2024" becomes an **Error**.\n\nFix: right-click the header > **Change Type > Using Locale...** > Data Type **Date**, Locale **English (India)** > OK. This adds a culture code to the M step so it works on any computer.\n\nAlso check **Detect data type**: **Transform > Detect Data Type** guesses types for selected columns. Automatic detection after import is controlled in **File > Options and settings > Options > Data Load > Type detection**.`,
      syntax: `Table.TransformColumnTypes(PreviousStep, {{"Order Date", type date}}, "en-IN")`,
    },
    {
      heading: 'Renaming columns',
      content:
        `Ways to rename:\n\n1. **Double-click** the column header, type the new name, Enter.\n2. Right-click header > **Rename...**\n3. Select column > **Transform > Rename**.\n\nAll renames done one after another are combined into one **Renamed Columns** step. Use business-friendly names with spaces allowed ("Sales Amount") or keep model-style names consistent with your other tables ("SalesAmount"). In this course the model uses **Quantity** and **SalesAmount**.`,
      syntax: `Table.RenameColumns(PreviousStep, {{"Qty", "Quantity"}, {"Amount", "SalesAmount"}})`,
      tip: 'Rename columns in Power Query, not only in the report. A Power Query rename becomes the real column name used by DAX.',
    },
    {
      heading: 'Replace Values and Replace Errors',
      content:
        `Select a column > **Transform > Replace Values** (or **Home > Replace Values**, or right-click > Replace Values...).\n\n- **Value To Find** / **Replace With**.\n- **Advanced options > Match entire cell contents** – replace only when the whole cell equals the value. Without it, Power Query replaces **text inside** the cell ("Mum" inside "Mumbai").\n- **Replace using special characters** – tab, carriage return, line feed, non-breaking space.\n\nIn M:\n\n- Whole cell (and all non-text columns): \`Replacer.ReplaceValue\`\n- Part of text: \`Replacer.ReplaceText\`\n\nTo replace with a real **null**, type \`null\` in Replace With. Replacing is **case-sensitive**.\n\n**Replace Errors**: select column > **Transform > Replace Values drop-down > Replace Errors** > type a value (e.g. 0). M: \`Table.ReplaceErrorValues\`.`,
      syntax: `Table.ReplaceValue(PreviousStep, "N/A", null, Replacer.ReplaceValue, {"Amount"})
Table.ReplaceValue(PreviousStep, "Bombay", "Mumbai", Replacer.ReplaceText, {"City"})
Table.ReplaceErrorValues(PreviousStep, {{"Amount", 0}})`,
    },
    {
      heading: 'Order of steps',
      content:
        `A common beginner mistake is to change the type first and then try to fix values. If Amount contains "N/A", changing it to Decimal Number creates **Error** cells and the original text is lost.\n\nGood order:\n\n1. Remove junk rows/columns (Day 7).\n2. **Replace** bad values ("N/A", "-", "") with null or correct values.\n3. **Change data types**.\n4. **Rename** columns.\n5. Replace remaining errors if any.`,
    },
  ],
  examples: [
    {
      title: 'Set data types for the cleaned sales export',
      scenario: 'After Day 7 all columns are text (ABC). Set proper types.',
      table: {
        headers: ['Column', 'Before (type)', 'After (type)', 'Sample after'],
        rows: [
          ['OrderID', 'Text', 'Whole Number', '1001'],
          ['Qty', 'Text', 'Whole Number', '2'],
          ['Amount', 'Text', 'Fixed Decimal Number', '110000.00'],
          ['Customer, City, Product', 'Text', 'Text', 'patil traders'],
        ],
      },
      steps: [
        'Click the ABC icon on OrderID header > Whole Number.',
        'Click the ABC icon on Qty > Whole Number. If asked "Change Column Type", click Replace current.',
        'Select Amount > Transform > Data Type > Fixed Decimal Number.',
        'Check the Column quality bar: Valid should be 100% for all three.',
      ],
      code: `    #"Changed Type" = Table.TransformColumnTypes(#"Removed Duplicates",{{"OrderID", Int64.Type}, {"Qty", Int64.Type}, {"Amount", Currency.Type}})`,
      result: 'OrderID and Qty show 123 icons, Amount shows the $ (fixed decimal) icon and values are right-aligned.',
      explanation: 'Choosing "Replace current" merged all changes into one Table.TransformColumnTypes step.',
    },
    {
      title: 'Convert dd-mm-yyyy text to dates using locale',
      scenario: 'Order Date is text in Indian format. A plain Change Type to Date gives wrong months and errors.',
      table: {
        headers: ['Order Date (text)', 'Change Type to Date (en-US PC)', 'Using Locale English (India)'],
        rows: [
          ['05-01-2024', '01-May-2024 (wrong)', '05-Jan-2024'],
          ['06-01-2024', '01-Jun-2024 (wrong)', '06-Jan-2024'],
          ['25-01-2024', 'Error', '25-Jan-2024'],
        ],
      },
      steps: [
        'Right-click the Order Date header > Change Type > Using Locale...',
        'Data Type: Date. Locale: English (India). Click OK.',
        'Verify 25-01-2024 shows 25-01-2024 / 25 Jan 2024 with no errors.',
      ],
      code: `    #"Changed Type with Locale" = Table.TransformColumnTypes(#"Changed Type", {{"Order Date", type date}}, "en-IN")`,
      result: 'All dates are correct January 2024 dates and the column shows the calendar icon.',
      explanation: 'The "en-IN" culture tells Power Query to read day first, regardless of the PC\'s regional settings.',
    },
    {
      title: 'Rename columns to match the course model',
      scenario: 'Make names consistent with the Sales table used in DAX (Quantity, SalesAmount, OrderDate).',
      table: {
        headers: ['Before', 'After'],
        rows: [
          ['Order Date', 'OrderDate'],
          ['Qty', 'Quantity'],
          ['Amount', 'SalesAmount'],
        ],
      },
      steps: [
        'Double-click the "Order Date" header, type OrderDate, Enter.',
        'Double-click "Qty", type Quantity, Enter.',
        'Double-click "Amount", type SalesAmount, Enter.',
        'Note in Applied Steps there is just one step "Renamed Columns".',
      ],
      code: `    #"Renamed Columns" = Table.RenameColumns(#"Changed Type with Locale",{{"Order Date", "OrderDate"}, {"Qty", "Quantity"}, {"Amount", "SalesAmount"}})`,
      result: 'Headers read OrderID, OrderDate, Customer, City, Product, Quantity, SalesAmount.',
      explanation: 'Consecutive renames are merged into one Table.RenameColumns list of {old, new} pairs.',
    },
    {
      title: 'Replace whole values vs part of text',
      scenario: 'City has old names: "Bombay" should be "Mumbai". Product has "Chr" abbreviation in "Office Chr" but also appears inside "Chromebook".',
      table: {
        headers: ['Product before', 'Replace "Chr" > "Chair" (part of text)', 'With Match entire cell contents: "Office Chr" > "Office Chair"'],
        rows: [
          ['Office Chr', 'Office Chair', 'Office Chair'],
          ['Chromebook', 'Chairomebook (wrong!)', 'Chromebook'],
          ['Laptop', 'Laptop', 'Laptop'],
        ],
      },
      steps: [
        'Select City > Transform > Replace Values. Value To Find: Bombay, Replace With: Mumbai, OK.',
        'Select Product > Transform > Replace Values.',
        'Value To Find: Office Chr, Replace With: Office Chair.',
        'Expand Advanced options and tick Match entire cell contents. OK.',
      ],
      code: `    #"Replaced Value" = Table.ReplaceValue(#"Renamed Columns","Bombay","Mumbai",Replacer.ReplaceText,{"City"}),
    #"Replaced Value1" = Table.ReplaceValue(#"Replaced Value","Office Chr","Office Chair",Replacer.ReplaceValue,{"Product"})`,
      result: 'City shows Mumbai instead of Bombay; Product shows Office Chair and Chromebook stays unchanged (third column of the table).',
      explanation: 'Replacer.ReplaceText changes any matching substring; Replacer.ReplaceValue (Match entire cell contents) only changes cells that exactly equal the value.',
    },
    {
      title: 'Fix "N/A" amounts: replace before type, then replace errors',
      scenario: 'The export sometimes has "N/A" or "-" in Amount.',
      table: {
        headers: ['Amount (text, before)', 'After Replace N/A, - with null', 'After type Decimal'],
        rows: [
          ['110000', '110000', '110000'],
          ['N/A', 'null', 'null'],
          ['-', 'null', 'null'],
          ['4000', '4000', '4000'],
        ],
      },
      steps: [
        'Make sure Amount is still Text (move the Replace step above Changed Type if needed).',
        'Select Amount > Transform > Replace Values > Value To Find: N/A, Replace With: null, tick Match entire cell contents > OK.',
        'Repeat for "-" with Match entire cell contents ticked.',
        'Now change Amount to Decimal Number.',
        'Safety net: Transform > Replace Values drop-down > Replace Errors > 0 > OK.',
      ],
      code: `    #"Replaced NA" = Table.ReplaceValue(#"Removed Duplicates","N/A",null,Replacer.ReplaceValue,{"Amount"}),
    #"Replaced Dash" = Table.ReplaceValue(#"Replaced NA","-",null,Replacer.ReplaceValue,{"Amount"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Replaced Dash",{{"Amount", type number}}),
    #"Replaced Errors" = Table.ReplaceErrorValues(#"Changed Type", {{"Amount", 0}})`,
      result: 'Amount becomes a numeric column with nulls instead of "N/A"/"-" and no error cells.',
      explanation: 'null is treated as blank in Power BI and ignored by SUM/AVERAGE, which is more honest than 0 for unknown values.',
    },
  ],
  interview: [
    { q: 'Why are data types important in Power Query?', a: 'They control which operations are possible (math on numbers, time intelligence on dates), sorting, relationship matching, memory/compression and data validation. Wrong types cause errors or wrong results.', level: 'Easy' },
    { q: 'What is the difference between Decimal Number and Fixed Decimal Number?', a: 'Decimal Number is a floating-point number (type number). Fixed Decimal Number (Currency.Type) stores exactly 4 decimal places, avoiding floating-point rounding issues, ideal for money.', level: 'Medium' },
    { q: 'Dates like 25-01-2024 show errors after Change Type. How do you fix it?', a: 'Use Change Type > Using Locale with Date and English (India) so Power Query reads day-month-year. M: Table.TransformColumnTypes(prev, {{"Order Date", type date}}, "en-IN").', level: 'Medium' },
    { q: 'Replacer.ReplaceText vs Replacer.ReplaceValue?', a: 'ReplaceText replaces matching substrings inside text. ReplaceValue replaces only when the whole cell equals the value; it is used when "Match entire cell contents" is ticked and for non-text columns.', level: 'Medium' },
    { q: 'Why should you replace "N/A" before changing type?', a: 'After changing to number, "N/A" becomes an Error and can no longer be replaced as text. Replacing first lets you convert it to null cleanly.', level: 'Medium' },
    { q: 'Is Replace Values case-sensitive?', a: 'Yes. "bombay" will not match "Bombay". Standardise case first or replace each variant.', level: 'Easy' },
    { q: 'Scenario: a relationship between Sales[ProductID] and Product[ProductID] is not working and visuals show the same total for every product. What would you check first?', a: 'Data types and values of both key columns – e.g. one is text "P01 " with a trailing space or one is number vs text. Make types identical and trim text, then check the relationship.', level: 'Hard' },
    { q: 'What does the "Replace current" option do when changing types?', a: 'If the previous step is already a Changed Type step, Replace current edits that step instead of adding another one, keeping Applied Steps tidy.', level: 'Easy' },
  ],
  practice: [
    { task: 'In the Power Query Lab, change OrderID and Qty to Whole Number and Amount to Decimal Number.', hint: 'Use the header icons.', solution: 'Table.TransformColumnTypes(prev,{{"OrderID", Int64.Type},{"Qty", Int64.Type},{"Amount", type number}}).' },
    { task: 'Convert Order Date (dd-mm-yyyy) to a real date using English (India).', hint: 'Right-click > Change Type > Using Locale.', solution: 'Table.TransformColumnTypes(prev, {{"Order Date", type date}}, "en-IN").' },
    { task: 'Rename Qty to Quantity and Amount to SalesAmount in one step.', hint: 'Double-click headers one after another.', solution: 'Table.RenameColumns(prev,{{"Qty","Quantity"},{"Amount","SalesAmount"}}).' },
    { task: 'Replace "Bangalore" with "Bengaluru" only when the whole cell matches.', hint: 'Advanced options > Match entire cell contents.', solution: 'Table.ReplaceValue(prev,"Bangalore","Bengaluru",Replacer.ReplaceValue,{"City"}).' },
    { task: 'Replace empty-string Amount values with null before changing type.', hint: 'Leave Value To Find empty, type null in Replace With.', solution: 'Table.ReplaceValue(prev,"",null,Replacer.ReplaceValue,{"Amount"}).' },
  ],
  quiz: [
    { question: 'Which M type is Whole Number?', options: ['type number', 'Currency.Type', 'type text', 'Int64.Type'], answer: 3, explanation: 'Whole Number is Int64.Type.' },
    { question: 'Which option converts "05-01-2024" to 5 January 2024 on any PC?', options: ['Detect Data Type', 'Replace Values', 'Change Type > Using Locale > English (India)', 'Rename'], answer: 2, explanation: 'Using Locale adds the "en-IN" culture.' },
    { question: 'Ticking "Match entire cell contents" generates:', options: ['Replacer.ReplaceText', 'Replacer.ReplaceValue', 'Text.Replace', 'Table.ReplaceErrorValues'], answer: 1, explanation: 'Whole-cell matching uses Replacer.ReplaceValue.' },
    { question: 'Several renames in a row produce:', options: ['One Renamed Columns step', 'One step per rename always', 'No steps', 'An error'], answer: 0, explanation: 'Consecutive renames are merged into one Table.RenameColumns step.' },
    { question: 'Best type for money values to avoid floating-point rounding:', options: ['Decimal Number', 'Text', 'Percentage', 'Fixed Decimal Number'], answer: 3, explanation: 'Fixed Decimal (Currency.Type) stores 4 fixed decimals.' },
  ],
};
