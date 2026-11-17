export default {
  id: 'formulas-references',
  title: 'Formulas & Cell References',
  level: 'Beginner',
  day: 3,
  duration: '3 hours',
  summary: 'Formulas are the engine of Excel. This topic covers operators and calculation order, relative/absolute/mixed references (and the F4 key), named ranges, references to other sheets and workbooks, and how to read and fix the common error values. Reference types are one of the most frequently asked Excel interview topics.',
  objectives: [
    'Write formulas using arithmetic, comparison, text and reference operators',
    'Predict results using Excel\'s order of operations, including the negation/exponent trap',
    'Choose relative, absolute or mixed references and toggle them with F4',
    'Create and use named ranges and cross-sheet / cross-workbook references',
    'Diagnose and fix #N/A, #DIV/0!, #REF!, #VALUE!, #NAME?, #SPILL!, #NUM! and #NULL!',
  ],
  theory: [
    {
      heading: 'Formula anatomy and operators',
      content: 'Every formula starts with `=`. It can contain **constants** (`100`, `"Pune"`), **cell references** (`B2`), **functions** (`SUM()`), and **operators**.\n\n**Arithmetic:** `+` `-` `*` `/` `^` (power) `%` (percent, divides by 100).\n**Comparison** (return TRUE/FALSE): `=` `>` `<` `>=` `<=` `<>` (not equal).\n**Text concatenation:** `&` — `="Q"&1` returns Q1.\n**Reference operators:** `:` range (`A1:A10`), `,` union (`SUM(A1:A3,C1:C3)`), space = intersection (`=B1:B5 A3:D3` returns B3), and `#` spilled-range reference (`=E2#`), plus `@` implicit intersection.',
      points: [
        'Text constants go in double quotes; numbers do not.',
        'Comparisons are not case-sensitive: `="abc"="ABC"` returns TRUE.',
        'TRUE and FALSE behave as 1 and 0 in arithmetic: `=TRUE+TRUE` returns 2.',
      ],
    },
    {
      heading: 'Order of operations (BODMAS / PEMDAS in Excel)',
      content: 'Excel evaluates operators in this order (top first):\n\n1. Reference operators `:` (space) `,`\n2. Negation (unary minus) `-`\n3. Percent `%`\n4. Exponent `^`\n5. Multiplication and division `*` `/` (left to right)\n6. Addition and subtraction `+` `-` (left to right)\n7. Concatenation `&`\n8. Comparison `=` `<` `>` `<=` `>=` `<>`\n\nParentheses override everything. Examples: `=10+5*2` → 20; `=(10+5)*2` → 30; `=2^3^2` → 64 (Excel evaluates left to right: (2^3)^2, unlike mathematics where it would be 512).\n\nThe famous trap: **negation is higher than exponent** in Excel, so `=-3^2` returns **9** (it is (-3)^2), whereas `=0-3^2` returns -9.',
      tip: 'When in doubt, add parentheses. They cost nothing and make formulas readable. Use Formulas > Evaluate Formula to watch Excel calculate step by step.',
    },
    {
      heading: 'Relative references',
      content: 'By default references are **relative**: they describe a position relative to the formula cell. If C2 contains `=A2*B2` and you copy it down to C3, it becomes `=A3*B3`; copied right to D2 it becomes `=B2*C2`. Excel effectively stores "two cells to the left times one cell to the left".\n\nRelative references are what make filling a formula down a whole column work.',
    },
    {
      heading: 'Absolute and mixed references, and the F4 key',
      content: 'A **dollar sign** locks part of a reference so it does not change when copied.\n\n`$A$1` — **absolute**: column and row both locked.\n`$A1` — **mixed**: column locked, row changes.\n`A$1` — **mixed**: row locked, column changes.\n`A1` — **relative**.\n\nWhile editing a reference, press **F4** to cycle: `A1` → `$A$1` → `A$1` → `$A1` → `A1`. (On many laptops use `Fn + F4`; on Mac use `Cmd + T`.)\n\nUse absolute references for fixed inputs such as a tax rate, exchange rate or a lookup table. Use mixed references for two-dimensional grids like multiplication tables or price × quantity matrices where one input runs across the top and the other down the side.',
      syntax: '=B2*$F$1     (B2 moves, F1 stays fixed)',
      tip: 'Moving or cutting a cell (not copying) never changes references — Excel updates them to follow the moved data. Dollar signs only affect copy/fill behaviour.',
    },
    {
      heading: 'Named ranges',
      content: 'A **name** is a meaningful label for a cell, range, constant or formula, e.g. `TaxRate` instead of `$F$1`. Names are absolute by default and make formulas self-documenting: `=Subtotal*TaxRate`.\n\nCreate names by: typing in the **Name Box** with the range selected; **Formulas > Define Name**; or **Formulas > Create from Selection** (uses the header row/column labels). Manage, edit or delete them in **Name Manager** (`Ctrl + F3`). Paste a list of all names with `F3`.\n\nRules: must start with a letter, underscore or backslash; no spaces (use `_`); cannot look like a cell address (`Q1`, `AB12` are invalid); not case-sensitive; scope can be Workbook or a specific Worksheet.',
      points: [
        'Names can hold constants: define `GST` as `=0.18`.',
        'Dynamic names: in Excel Tables use structured references instead, or define a name as `=OFFSET(...)` / `=Sheet1!$A$2:INDEX(Sheet1!$A:$A,COUNTA(Sheet1!$A:$A))`.',
        'Names work across sheets, in Data Validation lists and in charts.',
      ],
    },
    {
      heading: 'References to other sheets and workbooks',
      content: '**Other sheet:** `=SheetName!A1`, e.g. `=Jan!B10`. If the sheet name has spaces or special characters, wrap it in single quotes: `=\'Sales Data\'!B10`.\n\n**3-D reference** (same cell across consecutive sheets): `=SUM(Jan:Dec!B10)` adds B10 from every sheet between Jan and Dec, inclusive. Inserting a sheet between them automatically includes it.\n\n**Other workbook (external link):** `=[Budget.xlsx]Sheet1!$B$4`. When the source is closed, Excel shows the full path: `=\'C:\\Reports\\[Budget.xlsx]Sheet1\'!$B$4`. Manage these via **Data > Edit Links** (Workbook Links in newer versions) — you can update, change source or break links.',
      tip: 'The easiest way to build a cross-sheet reference is to type = then click the other sheet and the cell; Excel writes the syntax for you.',
    },
    {
      heading: 'Common error values and how to fix them',
      content: 'Error values tell you what went wrong:',
      points: [
        '**#DIV/0!** — division by zero or by a blank cell. Fix: check the divisor, or `=IF(B2=0,"",A2/B2)` / `=IFERROR(A2/B2,0)`.',
        '**#N/A** — a value is not available, usually a lookup that found no match (`VLOOKUP`, `MATCH`, `XLOOKUP`). Check spelling, extra spaces, numbers stored as text, or use `IFNA` / XLOOKUP\'s if_not_found argument.',
        '**#REF!** — invalid reference, typically because referenced rows/columns/sheets were deleted, or a VLOOKUP col_index_num larger than the table width. Fix the reference; Undo immediately if you just deleted something.',
        '**#VALUE!** — wrong data type, e.g. `="abc"+1`, a date stored as text in arithmetic, or ranges of mismatched size in some functions.',
        '**#NAME?** — Excel does not recognise text in the formula: a misspelled function (`=SUMM(A1:A5)`), an undefined name, text without quotes (`=IF(A1=Yes,...)`), or a new function in an old version.',
        '**#SPILL!** — a dynamic array formula cannot spill because the target cells are not empty (or are merged, or inside a Table). Clear the blocking cells.',
        '**#NUM!** — invalid numeric value: `=SQRT(-1)`, an IRR that cannot converge, or a result too large.',
        '**#NULL!** — intersection of two ranges that do not intersect, usually a missing comma or colon: `=SUM(A1:A5 C1:C5)`.',
        '**#CALC!** — a calculation error in dynamic arrays, e.g. `FILTER` returning nothing without an if_empty argument.',
        '**#####** — not an error value: the column is too narrow, or a negative date/time.',
      ],
      tip: 'Use Formulas > Error Checking, Trace Precedents, Trace Dependents and Evaluate Formula to find where an error starts. Errors propagate: one #N/A makes every dependent SUM an #N/A.',
    },
    {
      heading: 'Calculation settings and circular references',
      content: 'Excel recalculates automatically by default. In very large workbooks people sometimes switch to **Manual** (Formulas > Calculation Options); then press `F9` to recalculate all open workbooks or `Shift + F9` for the active sheet. A workbook left in manual mode is a common cause of "my formula is not updating".\n\nA **circular reference** occurs when a formula refers to its own cell, directly or indirectly (e.g. A1 has `=SUM(A1:A10)`). Excel warns you and the status bar shows "Circular References: A1". Fix by changing the range; only enable iterative calculation (File > Options > Formulas) when the circularity is intentional, e.g. some interest calculations.',
      points: [
        'Show all formulas: Ctrl + grave accent (`Formulas > Show Formulas`).',
        'Trace Precedents shows which cells feed a formula; Trace Dependents shows which formulas use a cell.',
        'Watch Window lets you monitor key cells on other sheets while you edit.',
      ],
    },
  ],
  examples: [
    {
      title: 'GST calculation with an absolute reference',
      scenario: 'Calculate GST for each invoice using a single rate stored in F1.',
      table: {
        headers: ['A: Invoice', 'B: Amount', 'C: GST', 'F1: Rate'],
        rows: [['INV-01', '1000', '=B2*$F$1', '18%'], ['INV-02', '2500', '=B3*$F$1', ''], ['INV-03', '400', '=B4*$F$1', '']],
      },
      code: 'C2: =B2*$F$1  (fill down)',
      result: '180, 450, 72',
      explanation: 'B2 is relative so it moves to B3, B4. $F$1 is absolute so every row still points to the rate. Without dollars, C3 would become =B3*F2 (blank) and return 0.',
    },
    {
      title: 'Price matrix with mixed references',
      scenario: 'Build a grid of total cost = quantity (column A) × unit price (row 1).',
      table: {
        headers: ['', 'B1: 10', 'C1: 20', 'D1: 50'],
        rows: [['A2: 1', '10', '20', '50'], ['A3: 5', '50', '100', '250'], ['A4: 10', '100', '200', '500']],
      },
      code: 'B2: =$A2*B$1   then fill right to D2 and down to row 4',
      explanation: '$A2 locks the column so every cell reads the quantity from column A; B$1 locks the row so every cell reads the price from row 1. One formula fills the whole grid correctly.',
    },
    {
      title: 'Percentage of total',
      scenario: 'Find each region\'s share of total sales.',
      table: {
        headers: ['A: Region', 'B: Sales', 'C: Share'],
        rows: [['North', '200', '=B2/$B$6'], ['South', '300', ''], ['East', '100', ''], ['West', '400', ''], ['Total', '=SUM(B2:B5)', '']],
      },
      code: 'C2: =B2/$B$6   (format as %, fill down to C5)',
      result: '20%, 30%, 10%, 40%',
      explanation: 'The total cell must be absolute. A common mistake is =B2/B6, which becomes =B3/B7 (blank) and gives #DIV/0!.',
    },
    {
      title: 'Yearly total across 12 monthly sheets (3-D reference)',
      scenario: 'Sheets Jan to Dec all have the monthly total in cell E20. Summary sheet needs the annual total.',
      code: '=SUM(Jan:Dec!E20)',
      explanation: 'The 3-D reference sums E20 on Jan, Dec and every sheet positioned between them. All sheets must share the same layout.',
    },
    {
      title: 'Named range for readability',
      scenario: 'Commission is 5% of sales. Make the formula self-explanatory.',
      code: '1. Select H1 (containing 5%), type CommRate in the Name Box, press Enter.\n2. In C2: =B2*CommRate',
      result: 'For sales of 40000 → 2000',
      explanation: 'Names are absolute by default, so the formula can be filled down without dollar signs, and anyone reading it understands the logic.',
    },
    {
      title: 'Diagnosing errors',
      scenario: 'Identify and fix each error.',
      table: {
        headers: ['Formula', 'Result', 'Cause and fix'],
        rows: [
          ['=A2/B2 where B2 is blank', '#DIV/0!', '=IF(B2=0,"",A2/B2)'],
          ['=SUMM(A1:A5)', '#NAME?', 'Typo, use =SUM(A1:A5)'],
          ['="10 kg"*2', '#VALUE!', 'Text cannot be multiplied; store 10 as a number'],
          ['=VLOOKUP("P9",A2:C5,2,FALSE)', '#N/A', 'P9 not in list; wrap: =IFNA(VLOOKUP(...),"Not found")'],
          ['=VLOOKUP("P1",A2:C5,4,FALSE)', '#REF!', 'Table has only 3 columns; use 2 or 3'],
          ['=SEQUENCE(5) with data in A3', '#SPILL!', 'Clear the blocking cell'],
        ],
      },
      code: 'See the third column for fixes.',
      explanation: 'Read the error code first — each one points to a specific category of problem.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between relative, absolute and mixed references?',
      a: '**Relative** (`A1`) adjusts both row and column when copied. **Absolute** (`$A$1`) never changes. **Mixed** locks one part: `$A1` locks the column, `A$1` locks the row. Example: in a sales sheet, `=B2*$F$1` multiplies each amount by a fixed tax rate; in a 2-D matrix, `=$A2*B$1` uses the quantity column and the price row.',
      level: 'Easy',
    },
    {
      q: 'What does F4 do?',
      a: 'While editing a formula with the cursor on a reference, F4 cycles through `A1` → `$A$1` → `A$1` → `$A1` → back to `A1`. When not editing, F4 repeats the last action (e.g. last formatting or insert row). On laptops you may need Fn + F4; on Mac Cmd + T in formulas.',
      level: 'Easy',
    },
    {
      q: 'What will =-2^2 return in Excel and why?',
      a: '**4**. In Excel the unary minus (negation) has higher precedence than exponentiation, so it computes (-2)^2. In standard mathematics -2² = -4. To get -4 write `=-(2^2)` or `=0-2^2`. This is a classic trick question.',
      level: 'Hard',
    },
    {
      q: 'Explain the order in which Excel evaluates operators.',
      a: 'Reference operators (`:`, space, `,`) → negation → percent → exponent → multiply/divide → add/subtract → concatenation `&` → comparison operators. Operators of equal precedence go left to right (so `=2^3^2` = 64). Parentheses override. E.g. `=5+10%*2` = 5.2 because % first (0.1), then * (0.2), then +.',
      level: 'Medium',
    },
    {
      q: 'What causes a #REF! error and how do you prevent it?',
      a: 'It appears when a formula refers to a cell that no longer exists: deleted rows/columns/sheets, pasting over referenced cells with cut-paste, a VLOOKUP/INDEX column number beyond the range, or a closed external workbook used with INDIRECT/OFFSET. Prevention: use Excel Tables and structured references, XLOOKUP or INDEX-MATCH instead of hard-coded column numbers, avoid deleting cells used by formulas (check Trace Dependents first), and undo immediately if it appears after a deletion.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between #N/A and #VALUE!?',
      a: '`#N/A` means "value not available" — usually a lookup could not find the lookup value (or NA() was used intentionally). `#VALUE!` means a wrong type of argument, such as adding text to a number or passing a range where a single value is expected. Handle #N/A with `IFNA`; fix #VALUE! by cleaning data types (VALUE, TRIM, DATEVALUE).',
      level: 'Easy',
    },
    {
      q: 'What is #SPILL! and how do you fix it?',
      a: 'In Microsoft 365, dynamic array formulas (FILTER, SORT, UNIQUE, SEQUENCE, or any formula returning multiple values) spill results into neighbouring cells. #SPILL! appears when that spill area is blocked by data, merged cells, is inside an Excel Table, or extends beyond the sheet edge, or the size is indeterminate (e.g. RANDARRAY with a volatile size). Click the warning icon > Select Obstructing Cells, then clear or move them.',
      level: 'Medium',
    },
    {
      q: 'How do you reference a cell in another sheet whose name contains a space?',
      a: 'Wrap the sheet name in single quotes: `=\'Sales Data\'!B5`. For other workbooks: `=\'[Annual Budget.xlsx]Q1 Sheet\'!B5`, and when the workbook is closed the full path is included. Excel adds the quotes automatically if you click the cell while building the formula.',
      level: 'Easy',
    },
    {
      q: 'What are named ranges and what are their advantages?',
      a: 'A named range assigns a readable name to a cell, range, constant or formula (e.g. `TaxRate`, `SalesData`). Advantages: readable formulas (`=Price*TaxRate`), absolute by default, easy navigation via the Name Box, reusable in validation lists and charts, and a single place (Name Manager) to update the range. Scope can be workbook-level or sheet-level. Rules: no spaces, cannot start with a number or look like a cell address.',
      level: 'Medium',
    },
    {
      q: 'What is a 3-D reference?',
      a: 'A reference to the same cell or range across multiple consecutive sheets, e.g. `=SUM(Jan:Dec!B5)`. It includes every sheet physically between Jan and Dec. Works with SUM, AVERAGE, COUNT, MAX, MIN and similar aggregate functions, but not with lookup functions. A common trick is placing blank "Start" and "End" sheets around the data sheets and using `=SUM(Start:End!B5)`.',
      level: 'Medium',
    },
    {
      q: 'What is a circular reference? When might you intentionally use one?',
      a: 'A formula that depends on its own result, directly or through a chain. Excel warns and usually returns 0. Find it via Formulas > Error Checking > Circular References. Intentional use occurs in some financial models (e.g. interest on an average debt balance that depends on cash flow that depends on interest); you enable iterative calculation with max iterations and max change. Most analysts prefer to avoid them or use a copy-paste macro / algebraic solution.',
      level: 'Hard',
    },
    {
      q: 'Your formulas are not updating when inputs change. What do you check?',
      a: '1) Calculation mode — Formulas > Calculation Options; if Manual, set to Automatic or press F9. 2) The cell is formatted as Text, so the "formula" is stored as text — change format to General and re-enter (F2, Enter). 3) Show Formulas mode is on (Ctrl + grave accent). 4) The input is a number stored as text. 5) External links not refreshed.',
      level: 'Medium',
    },
    {
      q: 'What happens to references when you cut and paste a cell versus copy and paste?',
      a: 'Copy/paste adjusts relative references based on the new position. Cut/paste moves the formula without changing its references, and any formulas that pointed to the moved cell are updated to follow it. Dollar signs only matter for copying/filling.',
      level: 'Medium',
    },
    {
      q: 'How do you find which cells a formula depends on in a complex workbook?',
      a: 'Use Formulas > Trace Precedents (arrows to inputs; dashed arrow with a sheet icon means another sheet), Trace Dependents (what uses this cell), Evaluate Formula (step through calculation), Ctrl + [ to jump to precedents, Watch Window to monitor cells, and Inquire add-in (if available) for workbook relationships.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Predict then verify: (a) =10+4/2  (b) =(10+4)/2  (c) =-4^2  (d) =2^3^2  (e) =50%*200  (f) ="A"&1+2',
      hint: 'Remember negation before exponent, and & is lower than +.',
      solution: '(a) 12  (b) 7  (c) 16  (d) 64  (e) 100  (f) "A3" because 1+2 is evaluated before concatenation.',
    },
    {
      task: 'Products in A2:A6, prices in B2:B6, and a discount of 10% in E1. Write one formula in C2 that you can fill down to get the discounted price.',
      hint: 'Lock the discount cell.',
      solution: 'C2: =B2*(1-$E$1), fill down to C6.',
    },
    {
      task: 'Build a 9×9 multiplication table: numbers 1-9 in B1:J1 and in A2:A10. Use ONE formula.',
      hint: 'Mixed references.',
      solution: 'B2: =$A2*B$1, then fill to J10.',
    },
    {
      task: 'Sheet "Q1 Sales" has total revenue in D50. On the Summary sheet, write a formula that shows it, and another that sums D50 across sheets Q1 Sales, Q2 Sales, Q3 Sales, Q4 Sales (consecutive).',
      hint: 'Single quotes for spaces.',
      solution: '=\'Q1 Sales\'!D50\n=SUM(\'Q1 Sales:Q4 Sales\'!D50)',
    },
    {
      task: 'Create a name ExchangeRate for cell H2 containing 83.2, then convert USD in B2:B10 to INR in C2:C10.',
      hint: 'Name Box.',
      solution: 'Select H2, type ExchangeRate in the Name Box, Enter. C2: =B2*ExchangeRate, fill down.',
    },
    {
      task: 'Margin % = Profit / Revenue. Some revenue cells are 0 or blank. Write a formula in D2 that shows a blank instead of #DIV/0!.',
      hint: 'Test the divisor first.',
      solution: '=IF(B2=0,"",C2/B2)  — a blank cell counts as 0, so both cases are handled. Alternatively =IFERROR(C2/B2,"") but that also hides other errors.',
    },
    {
      task: 'For each formula, name the error and the fix: (1) =SUM(A1:A3 B1:B3)  (2) =IF(A1=Pass,1,0)  (3) =DATE(2024,1,1)+"abc"',
      hint: 'Space is the intersection operator.',
      solution: '(1) #NULL! — the ranges do not intersect; use a comma: =SUM(A1:A3,B1:B3).\n(2) #NAME? — Pass must be in quotes: =IF(A1="Pass",1,0).\n(3) #VALUE! — cannot add text to a number.',
    },
  ],
  quiz: [
    {
      question: 'A formula =B2*$C$1 in D2 is copied to E3. What does it become?',
      options: ['=B2*$C$1', '=C3*$C$1', '=C3*$D$2', '=B3*$C$1'],
      answer: 1,
      explanation: 'Moving one column right and one row down shifts B2 to C3; $C$1 is fully locked.',
    },
    {
      question: 'Pressing F4 twice on the reference A1 produces:',
      options: ['$A$1', 'A$1', '$A1', 'A1'],
      answer: 1,
      explanation: 'The cycle is A1 → $A$1 → A$1 → $A1 → A1.',
    },
    {
      question: 'What does =-3^2 return in Excel?',
      options: ['-9', '9', '-6', '#VALUE!'],
      answer: 1,
      explanation: 'Negation is evaluated before exponentiation, so it is (-3)^2 = 9.',
    },
    {
      question: 'Which error appears when a function name is misspelled?',
      options: ['#VALUE!', '#REF!', '#NAME?', '#N/A'],
      answer: 2,
      explanation: '#NAME? means Excel does not recognise text in the formula.',
    },
    {
      question: 'Which reference correctly points to B5 on a sheet named Sales 2024?',
      options: ['=Sales 2024!B5', '="Sales 2024"!B5', '=\'Sales 2024\'!B5', '=[Sales 2024]B5'],
      answer: 2,
      explanation: 'Sheet names containing spaces must be enclosed in single quotes.',
    },
    {
      question: 'A FILTER formula returns #SPILL!. The most likely cause is:',
      options: ['No rows matched', 'Cells in the output area are not empty', 'The function is misspelled', 'Division by zero'],
      answer: 1,
      explanation: '#SPILL! means the spill range is blocked. No matches would give #CALC! (unless if_empty is provided).',
    },
  ],
};
