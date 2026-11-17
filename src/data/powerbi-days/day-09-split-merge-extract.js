export default {
  id: 'day-09-split-merge-extract',
  title: 'Split Columns, Merge Columns, Extract Text',
  module: 'Module 2: Power Query – Data Cleaning',
  day: 9,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Break combined text into useful columns, join columns into one, and pull out exactly the part of text you need (first/last characters, text before/after/between delimiters) – plus the Format commands (Trim, Clean, Capitalize) that make text consistent.',
  objectives: [
    'Split columns by delimiter, number of characters, positions and character transitions – into columns or rows',
    'Merge columns with Transform > Merge Columns and Add Column > Merge Columns',
    'Extract length, first/last characters, a range, and text before/after/between delimiters',
    'Clean text with Trim, Clean, lowercase, UPPERCASE and Capitalize Each Word',
    'Recognise the M functions: Table.SplitColumn, Splitter.*, Table.CombineColumns, Text.Start/End/Middle, Text.BeforeDelimiter/AfterDelimiter/BetweenDelimiters',
  ],
  theory: [
    {
      heading: 'Format text first: Trim, Clean, Case',
      content:
        `Before splitting or merging, make text consistent. Select column(s) > **Transform > Format** (or **Add Column > Format** to keep the original):\n\n- **lowercase** – \`Text.Lower\`\n- **UPPERCASE** – \`Text.Upper\`\n- **Capitalize Each Word** – \`Text.Proper\` ("patil traders" > "Patil Traders")\n- **Trim** – \`Text.Trim\` removes leading and trailing spaces (not spaces in the middle)\n- **Clean** – \`Text.Clean\` removes non-printable characters such as line breaks from copy-paste\n- **Add Prefix / Add Suffix** – e.g. add "INV-" in front of numbers`,
      syntax: `Table.TransformColumns(PreviousStep, {{"City", Text.Trim, type text}})
Table.TransformColumns(PreviousStep, {{"City", Text.Proper, type text}})`,
      tip: 'Trim + Clean + Capitalize on every text key column (City, Customer, Product) before any merge, duplicate removal or relationship. Most "why doesn\'t it match?" problems are spaces or case.',
    },
    {
      heading: 'Split Column',
      content:
        `Select a column > **Home > Split Column** (or **Transform > Split Column**, or right-click header > Split Column). Options:\n\n1. **By Delimiter** – comma, space, hyphen, custom. Split at **Left-most**, **Right-most** or **Each occurrence**. **Advanced options**: split into **Columns** or **Rows**, number of columns, quote character.\n2. **By Number of Characters** – e.g. every 3 characters, once as far left/right as possible or repeatedly.\n3. **By Positions** – e.g. \`0, 3, 7\` cuts at character 0, 3 and 7.\n4. **By Lowercase to Uppercase** / **Uppercase to Lowercase** – "PuneMaharashtra" > "Pune", "Maharashtra".\n5. **By Digit to Non-digit** / **Non-digit to Digit** – "INV2024" > "INV", "2024".\n\nNew columns are named \`Column.1\`, \`Column.2\`; rename them afterwards. Power Query adds an automatic **Changed Type** step after a split.`,
      syntax: `Table.SplitColumn(PreviousStep, "Location", Splitter.SplitTextByDelimiter(",", QuoteStyle.Csv), {"Location.1", "Location.2"})
Splitter.SplitTextByEachDelimiter({"-"}, QuoteStyle.Csv, false)   // left-most delimiter only
Splitter.SplitTextByPositions({0, 3})
Splitter.SplitTextByCharacterTransition({"0".."9"}, (c) => not List.Contains({"0".."9"}, c))`,
    },
    {
      heading: 'Split into rows',
      content:
        `When one cell contains a list ("Laptop, Mouse, Keyboard"), split **into Rows**: Split Column > By Delimiter > Advanced options > **Rows**. Each item becomes its own row and the other columns are repeated. This is how you normalise multi-value fields such as tags or products per order.`,
      syntax: `Table.ExpandListColumn(
    Table.TransformColumns(PreviousStep, {{"Products", Splitter.SplitTextByDelimiter(",", QuoteStyle.Csv),
        let itemType = (type nullable text) meta [Serialized.Text = true] in type {itemType}}}),
    "Products")`,
    },
    {
      heading: 'Merge Columns',
      content:
        `Select two or more columns **in the order you want them joined** (Ctrl+click), then:\n\n- **Transform > Merge Columns** – replaces the selected columns with one merged column. M: \`Table.CombineColumns\`.\n- **Add Column > Merge Columns** – keeps the original columns and adds a new one. M: \`Table.AddColumn\` with \`Text.Combine\`.\n\nChoose a separator (None, Comma, Space, Tab, Custom) and a new column name. If any selected column is a number or date, Transform > Merge first converts it to text automatically.`,
      syntax: `Table.CombineColumns(PreviousStep, {"City", "State"}, Combiner.CombineTextByDelimiter(", ", QuoteStyle.None), "Location")
Table.AddColumn(PreviousStep, "Location", each Text.Combine({[City], [State]}, ", "), type text)`,
      tip: 'Text.Combine skips nulls, so "Pune" & null gives "Pune" not "Pune, ". The & operator would return null if any part is null.',
    },
    {
      heading: 'Extract text',
      content:
        `Select a text column > **Transform > Extract** (replace) or **Add Column > Extract** (new column):\n\n- **Length** – number of characters. \`Text.Length\`\n- **First Characters** – \`Text.Start(text, n)\`\n- **Last Characters** – \`Text.End(text, n)\`\n- **Range** – start index (0-based) and number of characters. \`Text.Middle(text, start, count)\`\n- **Text Before Delimiter** – \`Text.BeforeDelimiter(text, "@")\`\n- **Text After Delimiter** – \`Text.AfterDelimiter(text, "@")\`\n- **Text Between Delimiters** – \`Text.BetweenDelimiters(text, "(", ")")\`\n\nAdvanced options let you search from the start or end and skip N delimiters (e.g. text after the **last** hyphen).`,
      points: [
        'Split = one column becomes many columns (or rows).',
        'Extract = take one piece of the text, rest is discarded (or kept in original column with Add Column).',
        'Merge = many columns become one.',
      ],
    },
  ],
  examples: [
    {
      title: 'Trim and capitalize City and Customer',
      scenario: 'City has spaces and mixed case; Customer has random case.',
      table: {
        headers: ['City before', 'City after', 'Customer before', 'Customer after'],
        rows: [
          [' pune', 'Pune', 'patil traders', 'Patil Traders'],
          ['Mumbai ', 'Mumbai', 'SHAH & SONS', 'Shah & Sons'],
          ['nagpur', 'Nagpur', 'Kulkarni Stores', 'Kulkarni Stores'],
        ],
      },
      steps: [
        'Ctrl+click City and Customer headers.',
        'Transform > Format > Trim.',
        'Transform > Format > Clean.',
        'Transform > Format > Capitalize Each Word.',
      ],
      code: `    #"Trimmed Text" = Table.TransformColumns(#"Renamed Columns",{{"Customer", Text.Trim, type text}, {"City", Text.Trim, type text}}),
    #"Cleaned Text" = Table.TransformColumns(#"Trimmed Text",{{"Customer", Text.Clean, type text}, {"City", Text.Clean, type text}}),
    #"Capitalized Each Word" = Table.TransformColumns(#"Cleaned Text",{{"Customer", Text.Proper, type text}, {"City", Text.Proper, type text}})`,
      result: 'City values are Pune, Mumbai, Nagpur and Customer names are in proper case (after columns).',
      explanation: 'Table.TransformColumns applies a function to each value of the listed columns.',
    },
    {
      title: 'Split a product code into Category code and ProductID',
      scenario: 'The export has ProductCode like "ELE-P01". We need CategoryCode and ProductID to match the Product table.',
      table: {
        headers: ['ProductCode (before)', 'CategoryCode (after)', 'ProductID (after)'],
        rows: [
          ['ELE-P01', 'ELE', 'P01'],
          ['ACC-P04', 'ACC', 'P04'],
          ['FUR-P07', 'FUR', 'P07'],
        ],
      },
      steps: [
        'Select ProductCode > Home > Split Column > By Delimiter.',
        'Select or enter delimiter: --Custom-- and type - (hyphen).',
        'Split at: Left-most delimiter. OK.',
        'Double-click ProductCode.1 > rename to CategoryCode. Double-click ProductCode.2 > rename to ProductID.',
      ],
      code: `    #"Split Column by Delimiter" = Table.SplitColumn(#"Capitalized Each Word", "ProductCode", Splitter.SplitTextByEachDelimiter({"-"}, QuoteStyle.Csv, false), {"ProductCode.1", "ProductCode.2"}),
    #"Changed Type1" = Table.TransformColumnTypes(#"Split Column by Delimiter",{{"ProductCode.1", type text}, {"ProductCode.2", type text}}),
    #"Renamed Columns1" = Table.RenameColumns(#"Changed Type1",{{"ProductCode.1", "CategoryCode"}, {"ProductCode.2", "ProductID"}})`,
      result: 'Two new columns CategoryCode and ProductID as in the table.',
      explanation: 'SplitTextByEachDelimiter with false splits at the left-most hyphen only, so codes with extra hyphens keep the rest in the second column.',
    },
    {
      title: 'Split multiple products in one cell into rows',
      scenario: 'A web order export lists all products of an order in one cell.',
      table: {
        headers: ['OrderID', 'Products (before)', '→', 'OrderID', 'Products (after)'],
        rows: [
          ['2001', 'Laptop, Mouse', '', '2001', 'Laptop'],
          ['', '', '', '2001', 'Mouse'],
          ['2002', 'Office Chair', '', '2002', 'Office Chair'],
        ],
      },
      steps: [
        'Select Products > Home > Split Column > By Delimiter.',
        'Delimiter: Comma. Expand Advanced options and choose Split into: Rows. OK.',
        'Select Products > Transform > Format > Trim (removes the space before "Mouse").',
      ],
      code: `    #"Split Column by Delimiter" = Table.ExpandListColumn(Table.TransformColumns(Source, {{"Products", Splitter.SplitTextByDelimiter(",", QuoteStyle.Csv), let itemType = (type nullable text) meta [Serialized.Text = true] in type {itemType}}}), "Products"),
    #"Changed Type" = Table.TransformColumnTypes(#"Split Column by Delimiter",{{"Products", type text}}),
    #"Trimmed Text" = Table.TransformColumns(#"Changed Type",{{"Products", Text.Trim, type text}})`,
      result: 'Three rows: 2001 Laptop, 2001 Mouse, 2002 Office Chair.',
      explanation: 'Each cell is turned into a list, then Table.ExpandListColumn creates one row per list item.',
    },
    {
      title: 'Merge City and State into Location (keep originals)',
      scenario: 'Map visuals work better with "Pune, Maharashtra" than with "Pune" alone.',
      table: {
        headers: ['City', 'State', 'Location (new)'],
        rows: [
          ['Pune', 'Maharashtra', 'Pune, Maharashtra'],
          ['Nagpur', 'Maharashtra', 'Nagpur, Maharashtra'],
          ['Nashik', 'null', 'Nashik'],
        ],
      },
      steps: [
        'Click City, then Ctrl+click State (order matters).',
        'Add Column > Merge Columns.',
        'Separator: --Custom-- and type a comma followed by a space.',
        'New column name: Location. OK.',
      ],
      code: `    #"Inserted Merged Column" = Table.AddColumn(#"Renamed Columns1", "Location", each Text.Combine({[City], [State]}, ", "), type text)`,
      result: 'A new Location column as shown; City and State remain. Nashik with no state shows just "Nashik".',
      explanation: 'Add Column > Merge uses Text.Combine, which ignores null parts and does not leave a trailing comma.',
    },
    {
      title: 'Extract parts of email and invoice text',
      scenario: 'Customer contact table has Email and InvoiceRef like "INV-2024-0457 (Pune)". Extract user name, domain, year and branch.',
      table: {
        headers: ['Email', 'User (Before @)', 'Domain (After @)', 'InvoiceRef', 'Year (Range 4,4)', 'Branch (Between ( and ))'],
        rows: [
          ['asha@patiltraders.in', 'asha', 'patiltraders.in', 'INV-2024-0457 (Pune)', '2024', 'Pune'],
          ['ravi@shahsons.com', 'ravi', 'shahsons.com', 'INV-2023-0912 (Mumbai)', '2023', 'Mumbai'],
        ],
      },
      steps: [
        'Select Email > Add Column > Extract > Text Before Delimiter > Delimiter: @ > OK. Rename to User.',
        'Select Email > Add Column > Extract > Text After Delimiter > @ > OK. Rename to Domain.',
        'Select InvoiceRef > Add Column > Extract > Range > Starting Index: 4, Number of Characters: 4 > OK. Rename to Year.',
        'Select InvoiceRef > Add Column > Extract > Text Between Delimiters > Start: ( End: ) > OK. Rename to Branch.',
      ],
      code: `    #"Inserted Text Before Delimiter" = Table.AddColumn(Source, "User", each Text.BeforeDelimiter([Email], "@"), type text),
    #"Inserted Text After Delimiter" = Table.AddColumn(#"Inserted Text Before Delimiter", "Domain", each Text.AfterDelimiter([Email], "@"), type text),
    #"Inserted Text Range" = Table.AddColumn(#"Inserted Text After Delimiter", "Year", each Text.Middle([InvoiceRef], 4, 4), type text),
    #"Inserted Text Between Delimiters" = Table.AddColumn(#"Inserted Text Range", "Branch", each Text.BetweenDelimiters([InvoiceRef], "(", ")"), type text)`,
      result: 'Four new columns with the values in the table.',
      explanation: 'Range uses a 0-based start index: "INV-" occupies positions 0-3, so the year starts at index 4.',
    },
  ],
  interview: [
    { q: 'What is the difference between Split Column and Extract?', a: 'Split breaks a column into multiple columns (or rows) and keeps all pieces. Extract takes one part (first N characters, text before a delimiter, etc.) either replacing the column (Transform) or as a new column (Add Column).', level: 'Easy' },
    { q: 'How do you split a comma-separated list into separate rows?', a: 'Split Column > By Delimiter > Advanced options > Split into Rows. Power Query uses Splitter.SplitTextByDelimiter and Table.ExpandListColumn.', level: 'Medium' },
    { q: 'Transform > Merge Columns vs Add Column > Merge Columns?', a: 'Transform version replaces the selected columns with one merged column using Table.CombineColumns. Add Column version keeps the originals and adds a new column using Text.Combine.', level: 'Medium' },
    { q: 'Trim removed spaces at the start and end but "Pune  City" still has two spaces in the middle. Why?', a: 'Text.Trim only removes leading and trailing whitespace. To fix inner spaces use Replace Values (two spaces with one), or a custom M expression such as Text.Combine(List.Select(Text.Split([City], " "), each _ <> ""), " ").', level: 'Hard' },
    { q: 'How do you extract the text after the last hyphen in "A-B-C-123"?', a: 'Extract > Text After Delimiter, delimiter "-", Advanced options: Scan from End of input, skip 0. M: Text.AfterDelimiter([Code], "-", {0, RelativePosition.FromEnd}).', level: 'Hard' },
    { q: 'What is the difference between Trim and Clean?', a: 'Trim removes leading/trailing spaces. Clean removes non-printable control characters like line feeds and tabs.', level: 'Easy' },
    { q: 'Scenario: you merged FirstName and LastName with & in a custom column and some results are null. Why, and what is the fix?', a: 'In M, "text" & null returns null. Use Text.Combine({[FirstName],[LastName]}, " ") which skips nulls, or the Merge Columns command.', level: 'Medium' },
    { q: 'Why does a split by delimiter sometimes miss new parts after refresh?', a: 'The generated step hard-codes the number of output columns (e.g. {"Col.1","Col.2"}). If new data has more parts, extra pieces are dropped. Edit the step or split into rows instead.', level: 'Hard' },
  ],
  practice: [
    { task: 'In the Power Query Lab, trim, clean and capitalize the City and Customer columns.', hint: 'Transform > Format.', solution: 'Text.Trim, Text.Clean, Text.Proper via Table.TransformColumns.' },
    { task: 'Split "Full Name" (e.g. "Asha Patil") into First Name and Last Name at the left-most space.', hint: 'By Delimiter > Space > Left-most.', solution: 'Table.SplitColumn(prev,"Full Name",Splitter.SplitTextByEachDelimiter({" "}, QuoteStyle.Csv, false),{"First Name","Last Name"}).' },
    { task: 'Create OrderKey = OrderID & "-" & ProductID as a new column.', hint: 'Add Column > Merge Columns with custom separator. OrderID is a number, so it must be converted to text.', solution: 'Table.AddColumn(prev,"OrderKey", each Text.Combine({Text.From([OrderID], "en-IN"), [ProductID]}, "-"), type text).' },
    { task: 'Extract the first 3 letters of City as CityCode in uppercase.', hint: 'Add Column > Extract > First Characters, then Format > UPPERCASE.', solution: 'Table.AddColumn(prev,"CityCode", each Text.Start([City],3), type text) then Text.Upper on CityCode.' },
    { task: 'Split "INV2024" into "INV" and "2024".', hint: 'By Non-digit to Digit.', solution: 'Split Column > By Non-digit to Digit. M uses Splitter.SplitTextByCharacterTransition((c) => not List.Contains({"0".."9"}, c), {"0".."9"}).' },
  ],
  quiz: [
    { question: 'Which function does Capitalize Each Word use?', options: ['Text.Proper', 'Text.Upper', 'Text.Capital', 'Text.Title'], answer: 0, explanation: 'Text.Proper capitalises the first letter of each word.' },
    { question: 'Extract > Range with start 2 and 3 characters on "ABCDEFG" gives:', options: ['BCD', 'ABC', 'DEF', 'CDE'], answer: 3, explanation: 'Index is 0-based: A=0, B=1, C=2, so C, D, E.' },
    { question: 'Splitting a list into rows uses which function to create rows?', options: ['Table.SplitColumn', 'Table.CombineColumns', 'Table.ExpandListColumn', 'Table.Unpivot'], answer: 2, explanation: 'Table.ExpandListColumn turns each list item into a row.' },
    { question: 'Transform > Merge Columns generates:', options: ['Table.AddColumn', 'Table.CombineColumns', 'Table.Join', 'Table.Combine'], answer: 1, explanation: 'Table.CombineColumns replaces the selected columns.' },
    { question: 'Text.BeforeDelimiter("ravi@shahsons.com", "@") returns:', options: ['ravi', 'shahsons.com', '@', 'ravi@'], answer: 0, explanation: 'It returns text before the delimiter.' },
  ],
};
