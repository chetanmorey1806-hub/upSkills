export default {
  id: 'conditional-formatting',
  title: 'Conditional Formatting',
  level: 'Intermediate',
  day: 10,
  duration: '2.5 hours',
  summary: 'Conditional Formatting automatically changes the look of cells (fill, font, borders, bars, colors, icons) based on their values or on a formula. It turns raw numbers into visual insights and is a favourite interview topic, especially formula-based rules and highlighting entire rows.',
  objectives: [
    'Apply built-in highlight, top/bottom, data bar, color scale and icon set rules',
    'Write formula-based rules with correct absolute/mixed references',
    'Highlight duplicates, uniques, entire rows and dates (e.g. overdue tasks)',
    'Manage, edit, reorder and delete rules using the Rules Manager and Stop If True',
    'Understand performance and best practices for conditional formatting in reports',
  ],
  theory: [
    {
      heading: 'What is Conditional Formatting?',
      content: 'Conditional Formatting (Home > Styles > **Conditional Formatting**) applies formatting only when a condition is TRUE. The format is live: when the value changes, the formatting updates automatically. It does not change the cell value, only how it looks.\n\nThe menu has these groups:\n\n- **Highlight Cells Rules** - Greater Than, Less Than, Between, Equal To, Text that Contains, A Date Occurring, Duplicate Values\n- **Top/Bottom Rules** - Top 10 Items, Top 10%, Bottom 10 Items, Bottom 10%, Above Average, Below Average\n- **Data Bars**, **Color Scales**, **Icon Sets**\n- **New Rule**, **Clear Rules**, **Manage Rules**',
      tip: 'Quick Analysis (Ctrl+Q after selecting data) offers a one-click preview of the most common formatting options.',
    },
    {
      heading: 'Highlight Cells and Top/Bottom rules',
      content: '**Highlight Cells Rules** compare each cell with a fixed value or a cell reference. For example, Greater Than with `=$H$1` lets the threshold be controlled from an input cell, which is great for dashboards.\n\n**A Date Occurring** offers Yesterday, Today, Tomorrow, Last 7 Days, Last Week, This Week, Next Week, Last Month, This Month, Next Month. These are relative and update every day.\n\n**Top/Bottom Rules** evaluate the whole selected range together: Top 10 Items (the number is editable, e.g. Top 3), Top 10% (percent of the count of cells), Above Average and Below Average. Ties are all highlighted, so "Top 3" can highlight more than three cells.',
      points: [
        'Text that Contains is not case-sensitive',
        'Duplicate Values can be switched to Unique in the same dialog',
        'Blank cells are not counted in Above/Below Average',
      ],
    },
    {
      heading: 'Data Bars, Color Scales and Icon Sets',
      content: '**Data Bars** draw an in-cell bar whose length is proportional to the value - a mini bar chart. You can choose Gradient or Solid fill, set Minimum/Maximum (Automatic, Number, Percent, Percentile, Formula) and choose "Show Bar Only" to hide the numbers. Negative values can be drawn in a different color with an axis.\n\n**Color Scales** apply a 2-color or 3-color gradient, for example Green-Yellow-Red where the highest value is green. They are ideal for heat maps (sales by month x region).\n\n**Icon Sets** show arrows, traffic lights, flags, ratings etc. By default thresholds are percentages of the range (e.g. 3 icons: >=67%, >=33%, rest). In Manage Rules > Edit you can switch Type to **Number** to use fixed business thresholds, reverse the icon order, and tick "Show Icon Only".',
      tip: 'Default icon thresholds are "Percent" of the min-max range, NOT percentile and NOT the cell value. For KPIs like "Achievement >= 100% is green" change the Type to Number and enter 1 (100%).',
    },
    {
      heading: 'Formula-based rules (Use a formula to determine which cells to format)',
      content: 'This is the most powerful option: New Rule > **Use a formula to determine which cells to format**. The formula must return TRUE (or a non-zero number) for cells that should be formatted.\n\nThe key concept: **write the formula for the top-left (active) cell of the selected range**. Excel then copies the formula relatively to every other cell in the Applies To range, exactly as if you had filled it down and across.\n\nThe dollar signs control what moves:\n\n- `=$D2>50000` - column D fixed, row moves. Each row looks at its own column D. Used for whole-row highlighting.\n- `=D2>$H$1` - compares each cell with a single threshold cell.\n- `=D$2` - row fixed, column moves (used across columns, e.g. header-based rules).\n\nYou do not need `IF` - just write the logical test. `=IF($D2>50000,TRUE,FALSE)` works but `=$D2>50000` is cleaner.',
      syntax: 'Select range (e.g. A2:F100) > Home > Conditional Formatting > New Rule > Use a formula...\nFormula: =$F2="Pending"\nFormat... > Fill > OK',
      tip: 'The #1 mistake: selecting A2:F100 but writing the formula as if for row 1 (e.g. =$F1="Pending"), which shifts every highlight one row. Always reference the first row of the selection.',
    },
    {
      heading: 'Highlighting entire rows',
      content: 'To highlight a whole record based on one column, select the full data range (all columns, starting from the first data row) and use a formula that locks the **column** but not the row.\n\nExamples for data in A2:F100:\n\n- Status is Pending: `=$F2="Pending"`\n- Sales above 50,000: `=$D2>50000`\n- North region and sales above 50,000: `=AND($B2="North",$D2>50000)`\n- Overdue (Due Date in E, not Done): `=AND($E2<TODAY(),$F2<>"Done")`\n- Every alternate row (banding): `=MOD(ROW(),2)=0`\n- Every new group (top border when value changes): `=$B2<>$B1`',
      tip: 'If you want a dashboard-controlled filter, point the formula to an input cell: =$B2=$H$1 highlights rows matching whatever region the user types in H1.',
    },
    {
      heading: 'Duplicates, uniques and comparing lists',
      content: 'Built-in: Highlight Cells Rules > **Duplicate Values** highlights every occurrence of repeated values (including the first one).\n\nFormula variations give more control:\n\n- Highlight only the 2nd and later occurrences: `=COUNTIF($A$2:$A2,$A2)>1` (expanding range)\n- Highlight duplicates across two columns (rows where Name and City repeat): `=COUNTIFS($A$2:$A$100,$A2,$B$2:$B$100,$B2)>1`\n- Highlight items in List 1 that are missing in List 2 (on another sheet): `=COUNTIF(Sheet2!$A:$A,$A2)=0`\n- Case-sensitive duplicates: `=SUMPRODUCT(--EXACT($A$2:$A$100,$A2))>1`',
      tip: 'Duplicate Values is not case-sensitive and treats "Apple " (with trailing space) as different from "Apple". Clean with TRIM first.',
    },
    {
      heading: 'Managing rules: priority, Stop If True and Applies To',
      content: 'Home > Conditional Formatting > **Manage Rules** shows all rules for the current selection or the whole sheet (use the "Show formatting rules for" drop-down).\n\n- Rules are evaluated **top to bottom**. When two rules conflict on the same property (e.g. fill color), the rule higher in the list wins. Non-conflicting properties (one sets fill, another sets bold) both apply.\n- **Stop If True** prevents lower rules from being applied when a rule is TRUE (useful to exclude blanks: a top rule `=ISBLANK(A2)` with no format and Stop If True).\n- **Applies to** can be edited directly to extend a rule to more rows, instead of creating duplicate rules.\n- Use the up/down arrows to reorder, Edit Rule to change, Delete Rule to remove, and Duplicate Rule to copy.\n\nTo remove all formatting: Clear Rules > from Selected Cells / Entire Sheet / This Table / This PivotTable.',
      points: [
        'Copy-pasting cells copies their rules and often creates fragmented duplicate rules - clean them up in Manage Rules',
        'Format Painter copies conditional formats too',
        'Too many rules or volatile functions (TODAY, OFFSET, INDIRECT) on large ranges slow down the workbook',
        'Use Paste Special > Formats to apply rules without changing values',
      ],
    },
    {
      heading: 'Conditional formatting with Tables and PivotTables',
      content: 'Rules applied to an entire column of an **Excel Table** automatically extend to new rows added to the table.\n\nIn **PivotTables**, after applying a rule a small formatting options button lets you apply it to "All cells showing Sum of Sales values for Region and Month", so the rule survives refresh and pivot layout changes. Without that option, the rule is tied to fixed cells and can break when the pivot changes size.',
      tip: 'For Data Bars in PivotTables, exclude Grand Total cells - otherwise the total dominates the scale and all other bars look tiny.',
    },
  ],
  examples: [
    {
      title: 'Highlight sales above a target controlled by an input cell',
      scenario: 'The manager types a target in H1 and wants all sales above that target highlighted green.',
      table: {
        headers: ['A: Rep', 'B: Sales', 'H1: Target'],
        rows: [['Amit', '42000', '50000'], ['Priya', '55000', ''], ['John', '61000', ''], ['Sara', '38000', '']],
      },
      code: 'Select B2:B5 > Home > Conditional Formatting > Highlight Cells Rules > Greater Than\nValue box: =$H$1\nFormat: Green Fill with Dark Green Text > OK',
      result: 'Priya (55000) and John (61000) are highlighted',
      explanation: 'Referencing $H$1 makes the rule dynamic. If the manager changes H1 to 40000, Amit (42000) also turns green instantly. The absolute reference is required so every cell compares with H1.',
    },
    {
      title: 'Highlight the entire row where Status is Pending',
      scenario: 'An order tracker in A1:E6. Pending orders should stand out across all columns.',
      table: {
        headers: ['A: Order', 'B: Customer', 'C: Region', 'D: Amount', 'E: Status'],
        rows: [
          ['1001', 'Acme', 'North', '72000', 'Closed'],
          ['1002', 'Bolt', 'South', '30000', 'Pending'],
          ['1003', 'Crux', 'North', '45000', 'Closed'],
          ['1004', 'Delta', 'East', '90000', 'Pending'],
          ['1005', 'Echo', 'North', '51000', 'Closed'],
        ],
      },
      code: 'Select A2:E6 (active cell A2)\nConditional Formatting > New Rule > Use a formula to determine which cells to format\nFormula: =$E2="Pending"\nFormat > Fill > light orange > OK',
      result: 'Rows 3 (order 1002) and 5 (order 1004) are fully highlighted',
      explanation: 'The formula is written for A2, the top-left cell. $E locks the column so every cell in a row checks column E of that row; the row number 2 is relative so it becomes 3, 4, 5, 6 for lower rows.',
    },
    {
      title: 'Overdue tasks',
      scenario: 'Highlight tasks whose due date has passed and which are not marked Done.',
      table: {
        headers: ['A: Task', 'B: Owner', 'C: Due Date', 'D: Status'],
        rows: [
          ['Report', 'Amit', '01-Nov-2026', 'Done'],
          ['Audit', 'Priya', '05-Nov-2026', 'Open'],
          ['Budget', 'John', '30-Dec-2026', 'Open'],
        ],
      },
      code: 'Select A2:D4\nNew Rule > Use a formula:\n=AND($C2<TODAY(), $D2<>"Done")\nFormat: red fill, white bold font',
      result: 'With today = 17-Nov-2026, only the Audit row is highlighted',
      explanation: 'Report is past due but Done, so the AND fails. Budget is not yet due. Audit is past due and Open, so both conditions are TRUE. Because TODAY() is volatile, the highlight updates automatically each day.',
    },
    {
      title: 'Highlight only repeat occurrences of an invoice number',
      scenario: 'Invoice numbers should be unique. Flag every repeat, but not the first entry.',
      table: {
        headers: ['A: Invoice'],
        rows: [['INV-01'], ['INV-02'], ['INV-01'], ['INV-03'], ['INV-02'], ['INV-01']],
      },
      code: 'Select A2:A7\nNew Rule > Use a formula:\n=COUNTIF($A$2:$A2,$A2)>1\nFormat: yellow fill',
      result: 'A4, A6 and A7 are highlighted (2nd INV-01, 2nd INV-02, 3rd INV-01)',
      explanation: 'The range $A$2:$A2 expands as the rule moves down: for A4 it is $A$2:$A4, which contains INV-01 twice, so the count is 2 > 1. For A2 the count is 1, so the first occurrence is not flagged. The built-in Duplicate Values rule would highlight A2 as well.',
    },
    {
      title: 'KPI icon set with fixed thresholds',
      scenario: 'Achievement % (actual/target) should show a green icon at >= 100%, yellow at >= 80%, red below 80%.',
      table: {
        headers: ['A: Rep', 'B: Achievement'],
        rows: [['Amit', '112%'], ['Priya', '85%'], ['John', '64%']],
      },
      code: 'Select B2:B4 > Conditional Formatting > Icon Sets > 3 Traffic Lights\nManage Rules > Edit Rule:\nGreen when value >= 1, Type: Number\nYellow when < 1 and >= 0.8, Type: Number\nRed when < 0.8',
      result: 'Amit green, Priya yellow, John red',
      explanation: 'Percent values are stored as decimals (112% = 1.12), so thresholds of type Number must be 1 and 0.8. With the default Type "Percent", the thresholds would be relative to the min/max of the range, which gives misleading colors.',
    },
    {
      title: 'Heat map with a 3-color scale',
      scenario: 'Monthly sales by region in B2:D4 should show low values red, mid yellow, high green.',
      table: {
        headers: ['A: Region', 'B: Jan', 'C: Feb', 'D: Mar'],
        rows: [['North', '120', '150', '90'], ['South', '80', '200', '110'], ['East', '60', '95', '170']],
      },
      code: 'Select B2:D4 > Conditional Formatting > Color Scales > Green - Yellow - Red Color Scale',
      result: '200 is darkest green, 60 is darkest red, values around the 50th percentile (~110) are yellow',
      explanation: 'The default 3-color scale uses Lowest Value, 50th Percentile and Highest Value as its three points and blends colors in between. Exclude totals from the selection so they do not distort the scale.',
    },
  ],
  interview: [
    {
      q: 'How do you highlight an entire row based on the value in one column?',
      a: 'Select the whole data range starting at the first data row (e.g. A2:F100), choose New Rule > Use a formula to determine which cells to format, and enter a formula that locks the column only, e.g. `=$F2="Pending"`. The $ before F keeps every cell looking at column F; the relative row lets each row test its own value. Then set the format.',
      level: 'Easy',
    },
    {
      q: 'Why do we use $D2 rather than $D$2 or D2 in a row-highlighting rule?',
      a: 'The rule formula is written for the active (top-left) cell and is applied relatively to the rest of the range. `$D$2` would make every cell check D2 only, so either all rows or no rows get formatted. `D2` would shift column as well, so cell B2 would check E2, C2 would check F2 etc. `$D2` fixes the column and lets the row move, which is exactly what row highlighting needs.',
      level: 'Medium',
    },
    {
      q: 'Your formula rule highlights the row below the one you expected. What went wrong?',
      a: 'The formula was written relative to the wrong row. For example, the selection starts at row 2 (A2:F100) but the rule says `=$F1="Pending"`, so each row checks the row above it. Fix by editing the formula to refer to the first row of the Applies To range (`=$F2`), or re-select the range starting from the row the formula refers to.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between the built-in Duplicate Values rule and a COUNTIF formula rule?',
      a: 'Duplicate Values highlights all occurrences of duplicated values, including the first. A formula like `=COUNTIF($A$2:$A2,$A2)>1` uses an expanding range to highlight only the second and later occurrences. COUNTIF/COUNTIFS also allow duplicates across multiple columns (`=COUNTIFS($A$2:$A$100,$A2,$B$2:$B$100,$B2)>1`), comparison with another list, and other custom logic. Both are not case-sensitive; use EXACT for case-sensitive checks.',
      level: 'Medium',
    },
    {
      q: 'What is rule precedence and what does Stop If True do?',
      a: 'In Manage Rules, rules are evaluated from top to bottom. If two TRUE rules set the same property (like fill color), the higher rule wins; if they set different properties, both apply. Stop If True, when ticked on a rule that evaluates TRUE, prevents any lower rules from being applied to that cell. A common use is a top rule `=A2=""` with no format and Stop If True so blanks are not colored by later rules. (Stop If True is not available for data bars, color scales or icon sets themselves, but those can be stopped by a rule above them.)',
      level: 'Hard',
    },
    {
      q: 'How are icon set thresholds calculated by default and why can that mislead?',
      a: 'By default icon sets use Type = Percent, which means percent of the range between the minimum and maximum values. For 3 icons: >= 67% of the way from min to max gets the top icon, >= 33% the middle icon, rest the bottom. If all reps achieved 95-110%, someone at 95% still gets a red icon. For KPI reporting, edit the rule and change Type to Number with fixed thresholds (e.g. 1 and 0.8), or use Percentile or Formula types.',
      level: 'Hard',
    },
    {
      q: 'How would you highlight weekends in a date column?',
      a: 'Select the dates (e.g. A2:A100) and use the formula `=WEEKDAY($A2,2)>5`. With return_type 2, Monday = 1 ... Sunday = 7, so values 6 and 7 are Saturday and Sunday. For a calendar laid out across columns, use `=WEEKDAY(B$1,2)>5` with the dates in the header row.',
      level: 'Medium',
    },
    {
      q: 'How do you compare two lists and highlight values missing from the second list?',
      a: 'Select List 1 (e.g. Sheet1!A2:A200) and use `=COUNTIF(Sheet2!$A$2:$A$500,$A2)=0`. Modern Excel allows references to other sheets directly in conditional formatting formulas (older versions required a named range). Alternatively, `=ISNA(MATCH($A2,Sheet2!$A$2:$A$500,0))` or `=ISNA(XMATCH($A2,Sheet2!$A$2:$A$500))` works the same way.',
      level: 'Medium',
    },
    {
      q: 'How do you highlight the top 3 sales per region, not overall?',
      a: 'The built-in Top 10 rule works on the whole range only. Use a formula: with Region in B and Sales in D for rows 2-100, `=COUNTIFS($B$2:$B$100,$B2,$D$2:$D$100,">"&$D2)<3`. It counts how many rows in the same region have higher sales; if fewer than 3, the row is in the regional top 3 (ties included). In Microsoft 365 an alternative is `=$D2>=LARGE(FILTER($D$2:$D$100,$B$2:$B$100=$B2),3)` (requires each region to have at least 3 rows).',
      level: 'Hard',
    },
    {
      q: 'Does conditional formatting change the value of a cell? Can you filter or sort by it?',
      a: 'No, it only changes appearance; the value is unchanged and formulas referencing the cell are unaffected. You can, however, sort and filter by the resulting cell color, font color or icon (Sort > Sort On: Cell Color / Conditional Formatting Icon; Filter > Filter by Color). Functions cannot directly read conditional formatting colors - instead reuse the same logical test in a helper column.',
      level: 'Easy',
    },
    {
      q: 'What causes a workbook with conditional formatting to become slow, and how do you fix it?',
      a: 'Common causes: thousands of fragmented duplicate rules created by copy/paste and inserting rows, rules applied to entire columns with heavy formulas, and volatile functions (TODAY, NOW, OFFSET, INDIRECT) or COUNTIF over large ranges evaluated for every cell. Fixes: open Manage Rules > This Worksheet, delete duplicates and merge them into one rule with a clean Applies To range, restrict ranges to the actual data (or use a Table), move complex logic into a helper column and point the rule at that, and paste values with Paste Special to avoid copying formats.',
      level: 'Hard',
    },
    {
      q: 'How do you make conditional formatting extend automatically when new rows are added?',
      a: 'Convert the data to an Excel Table and apply the rule to the full table column(s); new rows inherit the rule. Alternatively apply the rule to a larger range (e.g. A2:F5000) with a formula that also checks the row is not blank, such as `=AND($A2<>"",$F2="Pending")`. In PivotTables, use the option "All cells showing ... values" so the rule follows the pivot layout.',
      level: 'Medium',
    },
    {
      q: 'Can you use structured references or other sheets in a conditional formatting formula?',
      a: 'Other sheets: yes, in Excel 2010 and later you can refer to other worksheets directly (e.g. `=COUNTIF(Lists!$A:$A,$A2)>0`). Structured references like `tblSales[Amount]` are not accepted directly in the rule dialog; workarounds are to use normal references to the table cells, wrap it in INDIRECT (`INDIRECT("tblSales[Amount]")`), or define a named range that points to the table column and use the name in the rule.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Marks of 30 students are in B2:B31. Highlight marks below 35 in red, and the top 5 marks in green.',
      hint: 'Use Highlight Cells Rules and Top/Bottom Rules.',
      solution: 'Select B2:B31 > Highlight Cells Rules > Less Than > 35 > Light Red Fill with Dark Red Text.\nWith B2:B31 still selected > Top/Bottom Rules > Top 10 Items > change 10 to 5 > Green Fill with Dark Green Text.\n(Ties at 5th place will also be highlighted.)',
    },
    {
      task: 'Employee data in A2:G200 (Name, Dept, City, DOJ, Salary, Rating, Status). Highlight entire rows where Dept is "Sales" and Rating >= 4.',
      hint: 'Use AND with column-locked references.',
      solution: 'Select A2:G200 > New Rule > Use a formula:\n=AND($B2="Sales",$F2>=4)\nFormat > Fill > light green > OK.',
    },
    {
      task: 'Invoice dates in C2:C500 and Paid flag (Yes/No) in E2:E500. Highlight rows (A:E) where the invoice is unpaid and older than 30 days. Leave blank rows unformatted.',
      hint: 'Compare with TODAY()-30 and check C is not blank.',
      solution: 'Select A2:E500 > New Rule > Use a formula:\n=AND($C2<>"",$E2="No",$C2<TODAY()-30)\nFormat: red fill, white font.\nThe $C2<>"" test prevents blank rows (blank = 0, which is a date long before today) from being highlighted.',
    },
    {
      task: 'Customer names are in A2:A300. Highlight only the second and later occurrences of each name.',
      hint: 'Use COUNTIF with an expanding range.',
      solution: 'Select A2:A300 > New Rule > Use a formula:\n=COUNTIF($A$2:$A2,$A2)>1\nFormat: yellow fill.',
    },
    {
      task: 'Monthly sales grid for 6 regions x 12 months is in B2:M7 with totals in column N and row 8. Create a heat map and add data bars to the totals column N2:N7 only.',
      hint: 'Do not include totals in the color scale range.',
      solution: 'Select B2:M7 > Color Scales > Green - Yellow - Red Color Scale (or White - Green for a single-color heat map).\nSelect N2:N7 > Data Bars > Solid Fill > Blue.\nExcluding row 8 and column N from the color scale keeps the totals from distorting the min/max.',
    },
    {
      task: 'In an attendance sheet, dates are in row 1 (B1:AF1) and employees in rows 2-21. Shade the whole column for weekends (Saturday and Sunday).',
      hint: 'Lock the row of the date header, not the column.',
      solution: 'Select B1:AF21 > New Rule > Use a formula:\n=WEEKDAY(B$1,2)>5\nFormat: grey fill.\nB$1 keeps row 1 fixed (the date header) while the column moves across.',
    },
    {
      task: 'A product list in Sheet1!A2:A100 must be checked against an approved list in Sheet2!A2:A50. Highlight products that are NOT approved, and make sure blanks are not highlighted.',
      hint: 'COUNTIF returns 0 for missing values.',
      solution: 'Select Sheet1!A2:A100 > New Rule > Use a formula:\n=AND($A2<>"",COUNTIF(Sheet2!$A$2:$A$50,$A2)=0)\nFormat: orange fill.',
    },
  ],
  quiz: [
    {
      question: 'You select A2:F50 and want to highlight entire rows where column C is "Closed". Which formula is correct?',
      options: ['=$C$2="Closed"', '=C2="Closed"', '=$C2="Closed"', '=C$2="Closed"'],
      answer: 2,
      explanation: '$C2 locks the column so each cell checks column C, while the row changes for each row.',
    },
    {
      question: 'Which formula highlights only the second and later occurrences of a value in A2:A100?',
      options: ['=COUNTIF($A$2:$A$100,$A2)>1', '=COUNTIF($A$2:$A2,$A2)>1', '=COUNTIF(A2:A100,A2)=1', '=MATCH($A2,$A$2:$A$100,0)>1'],
      answer: 1,
      explanation: 'The expanding range $A$2:$A2 counts only occurrences up to the current row, so the first occurrence returns 1. Option A highlights every occurrence including the first.',
    },
    {
      question: 'By default, how are icon set thresholds determined?',
      options: ['Fixed numbers 67 and 33', 'Percentiles of the data', 'Percent of the range between min and max', 'Standard deviations from the mean'],
      answer: 2,
      explanation: 'The default Type is Percent, meaning a percentage of the distance between the minimum and maximum values.',
    },
    {
      question: 'Two rules apply to the same cell, both TRUE, and both set the fill color. Which fill appears?',
      options: ['The rule lower in Manage Rules', 'The rule higher in Manage Rules', 'A blend of both colors', 'Neither; an error is shown'],
      answer: 1,
      explanation: 'Rules are evaluated top to bottom and the higher-priority rule wins when properties conflict.',
    },
    {
      question: 'Which rule formula highlights weekend dates in A2:A50?',
      options: ['=WEEKDAY($A2)>5', '=WEEKDAY($A2,2)>5', '=WEEKDAY($A2,2)<2', '=DAY($A2)>5'],
      answer: 1,
      explanation: 'With return_type 2, Monday=1 through Sunday=7, so 6 and 7 are Saturday and Sunday. With the default type 1, Sunday=1 and Saturday=7, so >5 would wrongly include Friday.',
    },
    {
      question: 'What does conditional formatting change?',
      options: ['The cell value', 'The cell formula', 'Only the cell appearance', 'The data type'],
      answer: 2,
      explanation: 'Conditional formatting changes only how cells look; the underlying values and formulas remain the same.',
    },
  ],
};
