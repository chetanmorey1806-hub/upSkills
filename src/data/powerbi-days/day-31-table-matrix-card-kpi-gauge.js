export default {
  id: 'day-31-table-matrix-card-kpi-gauge',
  title: 'Table, Matrix, Card, KPI, Gauge, Multi-row Card',
  module: 'Module 5: Data Visualization',
  day: 31,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Not every answer is a chart. Tables and matrices show exact values with totals and subtotals, cards show headline numbers, and KPI and gauge visuals show performance against a target. Today you build each one and learn its key formatting options.',
  objectives: [
    'Build a Table visual with totals, sorting and column formatting',
    'Build a Matrix with rows, columns, subtotals, stepped layout and drill/expand',
    'Show headline numbers with Card, the new Card visual and Multi-row card',
    'Show performance vs target with the KPI and Gauge visuals',
    'Choose between table, matrix, card, KPI and gauge for a requirement',
  ],
  theory: [
    {
      heading: 'Table visual',
      content:
        `A **Table** shows data in rows and columns - like an Excel range - with an optional total row. Use it when users need **exact values** or a **detailed list** (top 10 customers, order list).\n\n**Well**: **Columns** (drag fields and measures in the order you want them displayed).\n\nKey behaviour:\n- Text columns become grouping columns; measures are calculated for each row.\n- Click a column header to sort; Shift+click to sort by multiple columns.\n- Rows where all measures are blank are hidden.\n\nFormat visual > Visual options:\n- **Style presets** (Minimal, Bold header, Alternating rows...)\n- **Grid**: horizontal/vertical gridlines, row padding\n- **Values**: font, text color, alternate background color\n- **Column headers**: font, background, text wrap\n- **Totals**: on/off, label text ("Total"), font\n- **Specific column**: format one column (alignment, display units)\n- **Cell elements**: conditional formatting (Day 33)\n\nRename a column only for this visual: double-click the field in the Columns well.`,
    },
    {
      heading: 'Matrix visual',
      content:
        `A **Matrix** is a pivot table: groups on **Rows**, groups across **Columns**, measures in **Values**, with **subtotals** at each level.\n\n**Wells**: **Rows**, **Columns**, **Values**.\n\nHierarchies: put two fields in Rows (Category then Product). The visual header shows drill icons:\n- **Expand all down one level** (forked arrow) - show Products under every Category\n- **Go to the next level** (double arrow) - replace Category with Product\n- **Drill mode** (single down arrow) - click a row to drill into it\n- Right-click a row > **Expand > Selection** to expand one row only\n\nFormat visual > Visual options:\n- **Layout and style presets > Layout**: Compact (stepped, indented in one column), Outline or Tabular\n- **Row subtotals / Column subtotals**: on/off, position (top/bottom), per level\n- **Row headers**: +/- icons to expand/collapse\n- **Values > Options > Switch values to rows**: show measures as rows instead of columns\n\nWhen to use: Category x Year comparisons, financial statements, any "pivot" view.`,
      tip: 'If the matrix total looks "wrong", remember that totals are not the sum of the rows - the measure is re-calculated at the total level (e.g. a % measure or DISTINCTCOUNT).',
    },
    {
      heading: 'Card, new Card and Multi-row card',
      content:
        `**Card** shows one big number (the callout) with a label below it. **Well**: **Fields** (one measure). Format: **Callout value** (font, size, display units, decimals), **Category label** (the text under the value) on/off.\n\nThe newer **Card (new)** visual (available in current Power BI Desktop) can show **several measures** in one visual as separate tiles, with reference labels (e.g. "vs LY: +19.7%"), images and layout options. Well: **Data** (several measures), plus **Reference labels**.\n\n**Multi-row card** shows several values as a list of label/value pairs. **Well**: **Fields** (several measures or columns). If you add a text column (e.g. Customer[City]) it shows one card row per city. Format: **Callout values**, **Category labels**, **Card** (outline, bar color, padding).\n\nUse cards for the top row of a dashboard: Total Sales, Profit, Margin %, Orders.`,
    },
    {
      heading: 'KPI visual',
      content:
        `The **KPI** visual shows a value, compares it with a **target**, colors it (green = good, red = bad) and shows a trend area in the background.\n\n**Wells**:\n- **Value** - the measure (e.g. [Total Sales])\n- **Trend axis** - a time field (e.g. Date[YearMonth]); the KPI shows the value of the **latest** period on this axis\n- **Target** - a measure for the goal (e.g. [Sales Target] or [Sales LY])\n\nFormat visual > Visual:\n- **Callout value**: display units, decimals\n- **Icon**: on/off\n- **Trend axis**: on/off, direction (High is good / Low is good - choose "Low is good" for costs or complaints), good/bad/neutral colors\n- **Target label**: on/off, label text, **Distance** shown as percent or value\n\nAll three wells are needed for the full KPI display. Without Trend axis no background trend is drawn.`,
    },
    {
      heading: 'Gauge visual',
      content:
        `A **Gauge** is a half-circle dial that shows a value between a minimum and a maximum, with an optional target needle. It answers "how close are we to the goal?"\n\n**Wells**: **Value**, **Minimum value**, **Maximum value**, **Target value**, **Tooltips**.\n\nIf Minimum/Maximum are empty, Power BI uses 0 and double the value. Always set them explicitly with measures, otherwise the dial changes scale when filters change.\n\nFormat visual > Visual: **Gauge axis** (Min, Max, Target typed as numbers), **Colors** (fill, target color), **Data labels** (min/max), **Target label**, **Callout value**.\n\nGauges use a lot of space for a single number; use one or two per page at most. A **KPI** or **card with reference label** is often more compact.`,
    },
    {
      heading: 'Choosing among them',
      content: 'Quick guide:',
      points: [
        'Exact detailed list (orders, customers) -> Table',
        'Two-dimensional summary with subtotals (Category x Year) -> Matrix',
        'One headline number -> Card',
        'Several headline numbers in one block -> Card (new) or Multi-row card',
        'Latest value vs target with trend color -> KPI',
        'Progress towards a target within a range -> Gauge',
      ],
    },
  ],
  examples: [
    {
      title: 'Table: customer list with totals',
      scenario: 'Show each customer with city, number of orders and total sales, sorted by sales.',
      table: {
        headers: ['Customer', 'City', 'Orders', 'Total Sales'],
        rows: [
          ['Asha', 'Pune', '2', '1,20,000'],
          ['Kiran', 'Nashik', '2', '1,10,000'],
          ['Neha', 'Nagpur', '2', '14,000'],
          ['Ravi', 'Mumbai', '2', '13,000'],
          ['Total', '', '8', '2,57,000'],
        ],
      },
      steps: [
        'Modeling > New measure: Orders = COUNTROWS(Sales)',
        'Build visual > Table',
        'Columns well: Customer[Customer], Customer[City], [Orders], [Total Sales]',
        'Click the Total Sales column header to sort descending',
        'Format visual > Visual > Style presets: Alternating rows',
        'Format visual > Visual > Totals: On',
      ],
      result: 'Four customer rows sorted from Asha to Ravi and a total row with 8 orders and 2,57,000.',
      explanation:
        'Customer and City group the rows; the measures are evaluated for each customer and again for the total row.',
    },
    {
      title: 'Matrix: Category by Year with subtotals',
      scenario: 'A pivot of sales by Category (rows, with Products underneath) and Year (columns).',
      table: {
        headers: ['Category', '2023', '2024', 'Total'],
        rows: [
          ['Electronics', '1,00,000', '1,30,000', '2,30,000'],
          ['   Laptop', '1,00,000', '50,000', '1,50,000'],
          ['   Phone', '', '80,000', '80,000'],
          ['Furniture', '12,000', '8,000', '20,000'],
          ['Accessories', '5,000', '2,000', '7,000'],
          ['Total', '1,17,000', '1,40,000', '2,57,000'],
        ],
      },
      steps: [
        'Build visual > Matrix',
        'Rows: Product[Category], then Product[Product] below it',
        'Columns: Date[Year]',
        'Values: [Total Sales]',
        'Format visual > Visual > Layout and style presets > Layout: Compact',
        'Format visual > Visual > Row headers > +/- icons: On',
        'Click the + next to Electronics to expand only that category',
        'Format visual > Visual > Row subtotals: On; Column subtotals: On',
      ],
      result: 'Matrix with 2023, 2024 and Total columns; Electronics expanded to Laptop and Phone; grand total 2,57,000.',
      explanation:
        'Rows and Columns define the grouping; subtotals are recalculated by the measure at each level. Phone had no 2023 sales, so the cell is blank.',
    },
    {
      title: 'Cards and Multi-row card: headline numbers',
      scenario: 'Create the top strip of a dashboard.',
      table: {
        headers: ['Measure', 'Value', 'Displayed as'],
        rows: [
          ['Total Sales', '2,57,000', '257K'],
          ['Total Cost', '1,99,200', '199.2K'],
          ['Total Profit', '57,800', '57.8K'],
          ['Orders', '8', '8'],
        ],
      },
      steps: [
        'Build visual > Card; Fields: [Total Sales]',
        'Format visual > Visual > Callout value > Display units: Thousands; Value decimal places: 0',
        'Format visual > Visual > Category label: On (shows "Total Sales")',
        'Copy the card (Ctrl+C, Ctrl+V) and swap the field to [Total Profit]',
        'Build visual > Multi-row card; Fields: [Total Sales], [Total Cost], [Total Profit], [Orders]',
        'Format visual > Visual > Card > Accent bar: On, choose a theme color',
      ],
      result: 'Cards show 257K and 57.8K; the multi-row card lists all four measures with labels.',
      explanation:
        'Cards emphasise one number. Multi-row card saves space when several related values belong together. The new Card visual can do the same with tiles: put all four measures in its Data well.',
    },
    {
      title: 'KPI: latest month sales vs target',
      scenario: 'Show March 2024 sales against a monthly target of 50,000 with a trend background.',
      table: {
        headers: ['YearMonth', 'Total Sales', 'Sales Target'],
        rows: [
          ['2024-01', '20,000', '50,000'],
          ['2024-02', '58,000', '50,000'],
          ['2024-03 (latest)', '62,000', '50,000'],
        ],
      },
      steps: [
        'Modeling > New measure: Sales Target = IF ( NOT ISBLANK ( [Total Sales] ), 50000 )  -- returns the target only for months that have sales, so empty future months do not become the "latest" KPI period',
        'Build visual > KPI',
        'Value: [Total Sales]; Trend axis: Date[YearMonth]; Target: [Sales Target]',
        'Add a slicer on Date[Year] and select 2024',
        'Format visual > Visual > Trend axis > Direction: High is good',
        'Format visual > Visual > Target label > Distance label: Percent',
      ],
      result: 'KPI shows 62K in green with "Goal: 50K (+24%)" and a rising trend area from Jan to Mar 2024.',
      explanation:
        'The KPI always reports the last point of the trend axis (2024-03). 62,000 vs 50,000 is +24%, above target, so it is green.',
    },
    {
      title: 'Gauge: annual sales progress',
      scenario: 'Show 2024 sales progress towards an annual target of 2,00,000 on a 0 - 2,50,000 dial.',
      table: {
        headers: ['Well', 'Measure', 'Value'],
        rows: [
          ['Value', '[Total Sales] (Year = 2024)', '1,40,000'],
          ['Minimum value', 'Gauge Min = 0', '0'],
          ['Maximum value', 'Gauge Max = 250000', '2,50,000'],
          ['Target value', 'Annual Target = 200000', '2,00,000'],
        ],
      },
      steps: [
        'Modeling > New measure for Gauge Min = 0, Gauge Max = 250000 and Annual Target = 200000',
        'Build visual > Gauge',
        'Value: [Total Sales]; Minimum value: [Gauge Min]; Maximum value: [Gauge Max]; Target value: [Annual Target]',
        'Slicer Date[Year] = 2024',
        'Format visual > Visual > Colors > Fill: blue; Target: red',
        'Format visual > Visual > Callout value > Display units: Thousands',
      ],
      result: 'The dial is filled to 140K (56% of the arc) with a red target needle at 200K.',
      explanation:
        'Fixed min/max measures keep the scale stable. The gap between the fill and the needle (60,000) is the amount still needed.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between a Table and a Matrix visual?',
      a: 'A Table shows a flat list with one total row. A Matrix groups on rows and columns (like a pivot table), supports hierarchies, expand/collapse, drill-down and subtotals at every level.',
      level: 'Easy',
    },
    {
      q: 'Why does the total row of a table sometimes not equal the sum of the rows?',
      a: 'Totals are calculated by evaluating the measure in the total filter context, not by summing visible rows. Non-additive measures like DISTINCTCOUNT, averages or % show different totals. Fix with SUMX over VALUES if a sum is required.',
      level: 'Medium',
    },
    {
      q: 'What are the wells of the KPI visual and what does each do?',
      a: 'Value (the measure shown), Trend axis (time field; the KPI shows the latest period and draws the trend), Target (goal measure used for color and distance).',
      level: 'Medium',
    },
    {
      q: 'When would you use a Gauge instead of a KPI?',
      a: 'When the audience needs to see progress within a defined range (min to max) towards a target, e.g. annual target achievement. KPI is better to show the latest value vs target with trend in less space.',
      level: 'Medium',
    },
    {
      q: 'How do you show several numbers in one card?',
      a: 'Use the Multi-row card (Fields well) or the new Card visual (Data well with multiple measures and reference labels).',
      level: 'Easy',
    },
    {
      q: 'Scenario: The gauge maximum changes every time a user picks a different city. Why and how do you fix it?',
      a: 'Minimum/Maximum wells are empty so Power BI auto-scales (max = 2 x value). Add fixed measures for Minimum and Maximum (or set them in Format > Gauge axis).',
      level: 'Hard',
    },
    {
      q: 'How do you show measures as rows in a matrix (like a financial statement)?',
      a: 'Add measures to Values, then Format visual > Values > Options > Switch values to rows: On.',
      level: 'Medium',
    },
    {
      q: 'Scenario: The KPI shows a blank value even though there is data. What could be wrong?',
      a: 'The latest value on the Trend axis has no data (e.g. the axis includes future months from the Date table). Filter the trend axis to periods with sales or use a measure that returns blank for future months.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Build a matrix: Rows = Customer[City], Columns = Customer[Segment], Values = [Total Sales].',
      hint: 'Each city belongs to one segment in the sample.',
      solution: `Pune: Corporate 1,20,000 | Nashik: Corporate 1,10,000
Nagpur: Retail 14,000 | Mumbai: Retail 13,000
Column totals: Corporate 2,30,000, Retail 27,000; Grand total 2,57,000`,
    },
    {
      task: 'Create a card showing Margin % with one decimal.',
      hint: 'Margin % = DIVIDE([Total Profit], [Total Sales]); format as percentage.',
      solution: `Margin % = DIVIDE ( [Total Profit], [Total Sales] )
Card Fields: [Margin %], Measure tools > Format: Percentage, 1 decimal -> 22.5%`,
    },
    {
      task: 'Build a KPI comparing Total Sales with Sales LY by month for 2024.',
      hint: 'Target = Sales LY (Day 27).',
      solution: `Value: [Total Sales]; Trend axis: Date[YearMonth]; Target: [Sales LY]
Latest month 2024-03: 62K vs goal 12K (+416.67%) -> green`,
    },
    {
      task: 'Build a table of orders: OrderID, OrderDate, Customer, Product, SalesAmount, with a total.',
      hint: 'Put Sales[OrderID] first; set SalesAmount to Sum (or use [Total Sales]).',
      solution: `Columns: Sales[OrderID] (set to "Don't summarize"), Sales[OrderDate], Customer[Customer], Product[Product], [Total Sales]
8 rows, total 2,57,000.`,
    },
    {
      task: 'Build a gauge of Total Profit with min 0, max 1,00,000 and target 60,000.',
      hint: 'Three constant measures.',
      solution: `Value: [Total Profit] = 57,800; Min: 0; Max: 100000; Target: 60000.
The needle is just above the fill - 2,200 short of target.`,
    },
  ],
  quiz: [
    {
      question: 'Which visual supports Rows, Columns and Values wells with subtotals?',
      options: ['Table', 'Matrix', 'Card', 'KPI'],
      answer: 1,
      explanation: 'The Matrix is the pivot-style visual.',
    },
    {
      question: 'Which KPI well decides which period value is displayed?',
      options: ['Value', 'Target', 'Trend axis', 'Tooltips'],
      answer: 2,
      explanation: 'The KPI shows the value of the latest point on the Trend axis.',
    },
    {
      question: 'What happens if a gauge has no Maximum value?',
      options: ['Error', 'Max = 100', 'Power BI auto-sets the maximum (about double the value)', 'Max = target'],
      answer: 2,
      explanation: 'Without a maximum, Power BI scales the gauge automatically.',
    },
    {
      question: 'Which visual shows several measures as label/value pairs?',
      options: ['Multi-row card', 'Funnel', 'Gauge', 'Treemap'],
      answer: 0,
      explanation: 'Multi-row card lists multiple fields.',
    },
    {
      question: 'Where do you switch a matrix layout to Tabular?',
      options: ['Build visual > Rows', 'Format visual > Layout and style presets > Layout', 'Analytics', 'View > Layout'],
      answer: 1,
      explanation: 'Layout (Compact, Outline, Tabular) is under Layout and style presets.',
    },
  ],
};
