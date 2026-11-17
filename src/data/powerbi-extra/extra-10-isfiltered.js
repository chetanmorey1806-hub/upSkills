export default {
  id: 'extra-10-isfiltered',
  title: 'ISFILTERED()',
  module: 'Extra: DAX',
  extraNo: 10,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'ISFILTERED() tells a measure whether a column (or table) is being filtered directly by a slicer, a visual row, a filter pane setting or CALCULATE. Use it to build dynamic titles, show calculations only at certain levels, and warn users that filters are applied.',
  objectives: [
    'Explain what a direct filter is and when ISFILTERED returns TRUE',
    'Build dynamic titles and filter messages with ISFILTERED and SELECTEDVALUE',
    'Show or hide a measure on total rows using ISFILTERED',
    'Compare ISFILTERED with ISCROSSFILTERED, HASONEVALUE and ISINSCOPE',
    'Avoid the common slicer trap when using ISFILTERED for hierarchy levels',
  ],
  theory: [
    {
      heading: 'What does ISFILTERED() check?',
      content: 'Every visual cell is calculated in a **filter context**: the set of filters coming from slicers, rows and columns of the visual, the filter pane and CALCULATE. ISFILTERED asks one simple question: "Is there a filter placed directly on this column?"\n\nAnalogy: you are in a shop and ask, "Did the customer pick a size?" If the customer chose size M, the answer is yes (directly filtered). If the customer only chose a brand and that brand happens to have only size M, the size was not directly picked; it is only cross-filtered.',
      syntax: 'ISFILTERED(<column or table>)',
      points: [
        'Returns TRUE or FALSE',
        'TRUE when the column itself has a filter (slicer, visual row/column, filter pane, CALCULATE filter)',
        'With a table name, TRUE if any column of that table is directly filtered',
      ],
    },
    {
      heading: 'Direct filter vs cross-filter (ISCROSSFILTERED)',
      content: 'If a slicer on Customer[Segment] selects Corporate:\n- `ISFILTERED(Customer[Segment])` = TRUE (direct filter).\n- `ISFILTERED(Customer[City])` = FALSE (no filter on City itself).\n- `ISCROSSFILTERED(Customer[City])` = TRUE, because City is affected by a filter on another column of the same table (or a related table).\n\nSo ISFILTERED is about "what did the user or visual explicitly filter?", while ISCROSSFILTERED is about "is this column affected by any filter?".',
    },
    {
      heading: 'Visual rows and totals',
      content: 'When Customer[City] is on the rows of a table or matrix, each city row has a filter City = that city, so ISFILTERED(Customer[City]) is TRUE. The **Total** row has no city filter, so it is FALSE (unless a slicer also filters City).\n\nThis makes ISFILTERED handy for showing a value only on detail rows, for example a share % on each city but blank on the total.',
      tip: 'For matrix hierarchies (Category > Product), ISINSCOPE() is usually better than ISFILTERED because it checks whether the column is on the current visual level, and is not fooled by slicers.',
    },
    {
      heading: 'Dynamic titles and filter messages',
      content: 'Combine ISFILTERED with SELECTEDVALUE to build friendly text:\n\n- If City is filtered to one value: "Sales for Pune".\n- If City is filtered to several values: "Sales for multiple cities".\n- If not filtered: "Sales for all cities".\n\nUse the measure in a Card, a Text box with a dynamic value, or the visual title via Format > General > Title > fx (Field value).',
    },
    {
      heading: 'Common traps',
      content: '1. **Slicers count as filters.** If a City slicer selects Pune and Mumbai, the Total row of a city table also has a City filter, so ISFILTERED is TRUE on the total too.\n2. **Filter on another column of the same table** does not make ISFILTERED TRUE (use ISCROSSFILTERED).\n3. **ALL / REMOVEFILTERS inside CALCULATE** removes the filter, so ISFILTERED inside that CALCULATE returns FALSE.\n4. **Multiple values**: ISFILTERED does not tell you how many values are selected. Use HASONEVALUE or SELECTEDVALUE for that.',
    },
  ],
  examples: [
    {
      title: 'Dynamic title based on the City slicer',
      scenario: 'A report page has a City slicer. The chart title should say which city is shown.',
      table: {
        headers: ['City slicer selection', 'Sales Title'],
        rows: [['Nothing selected', 'Sales for all cities'], ['Pune', 'Sales for Pune'], ['Pune and Mumbai', 'Sales for multiple cities']],
      },
      steps: [
        'Select the Sales table > Modeling > New measure; enter Sales Title',
        'Insert a slicer with Customer[City]',
        'Select your column chart > Format visual > General > Title > click fx next to Text',
        'Format style: Field value; What field should we base this on: Sales Title; OK',
        'Change the slicer selection and watch the title',
      ],
      code: `Sales Title =
IF(
    ISFILTERED(Customer[City]),
    "Sales for " & SELECTEDVALUE(Customer[City], "multiple cities"),
    "Sales for all cities"
)`,
      result: 'The title updates: all cities, Pune, or multiple cities.',
      explanation: 'ISFILTERED detects any slicer selection on City. SELECTEDVALUE returns the city when exactly one is selected and the alternate text "multiple cities" otherwise.',
    },
    {
      title: 'Show city share only on city rows',
      scenario: 'In a table of cities for 2024, show each city share of total sales, but keep the Total row clean.',
      table: {
        headers: ['City', 'Total Sales', 'City Share'],
        rows: [['Pune', '6,00,000', '40.0%'], ['Mumbai', '4,50,000', '30.0%'], ['Nagpur', '3,00,000', '20.0%'], ['Nashik', '1,50,000', '10.0%'], ['Total', '15,00,000', '(blank)']],
      },
      steps: [
        'Make sure Total Sales = SUM(Sales[SalesAmount]) exists',
        'Modeling > New measure: City Share; Measure tools > Format > Percentage, 1 decimal',
        'Insert a Table visual with Customer[City], Total Sales and City Share',
        'Add a Date[Year] slicer and select 2024 (no City slicer)',
      ],
      code: `City Share =
IF(
    ISFILTERED(Customer[City]),
    DIVIDE([Total Sales], CALCULATE([Total Sales], ALL(Customer[City]))),
    BLANK()
)`,
      result: 'Pune 40.0%, Mumbai 30.0%, Nagpur 20.0%, Nashik 10.0%; the Total row is blank.',
      explanation: 'On each city row the City column is filtered, so the share is calculated (6,00,000 / 15,00,000 = 40%). On the Total row City is not filtered, so the measure returns BLANK. Note: if you add a City slicer, the total row becomes filtered too and would show the share of the selected cities.',
    },
    {
      title: 'ISFILTERED vs ISCROSSFILTERED',
      scenario: 'Understand what each function returns when a slicer on Product[Category] selects Electronics.',
      table: {
        headers: ['Measure', 'Result'],
        rows: [
          ['ISFILTERED(Product[Category])', 'TRUE'],
          ['ISFILTERED(Product[Product])', 'FALSE'],
          ['ISCROSSFILTERED(Product[Product])', 'TRUE'],
          ['ISFILTERED(Product)', 'TRUE'],
        ],
      },
      steps: [
        'Create the four test measures with Modeling > New measure',
        'Add a slicer on Product[Category] and select Electronics',
        'Show each measure in a Card visual (or one table with all four)',
        'Clear the slicer and observe all become FALSE',
      ],
      code: `Cat Filtered = ISFILTERED(Product[Category])
Product Filtered = ISFILTERED(Product[Product])
Product CrossFiltered = ISCROSSFILTERED(Product[Product])
Product Table Filtered = ISFILTERED(Product)`,
      result: 'With Electronics selected: TRUE, FALSE, TRUE, TRUE. With no selection: all FALSE.',
      explanation: 'The slicer directly filters Category only. Product is affected indirectly (cross-filtered). Passing the table name returns TRUE because one of its columns has a direct filter. (ISCROSSFILTERED may not be available in the in-app DAX Lab; try it in Power BI Desktop.)',
    },
    {
      title: 'Warning text when customer filters are active',
      scenario: 'Executives often forget slicers are set. Show a message when City or Segment is filtered.',
      table: {
        headers: ['Slicers', 'Filter Note'],
        rows: [['None', 'All customers'], ['Segment = Retail', 'Customer filters applied'], ['City = Nagpur', 'Customer filters applied']],
      },
      steps: [
        'Modeling > New measure: Filter Note',
        'Insert a Card visual with Filter Note at the top of the page',
        'Add slicers for Customer[City] and Customer[Segment] and test',
      ],
      code: `Filter Note =
IF(
    OR(ISFILTERED(Customer[City]), ISFILTERED(Customer[Segment])),
    "Customer filters applied",
    "All customers"
)`,
      result: 'The card says All customers until a City or Segment slicer is used.',
      explanation: 'OR combines two ISFILTERED checks. You could also use ISFILTERED(Customer) to detect a direct filter on any column of the Customer table.',
    },
  ],
  interview: [
    { q: 'What does ISFILTERED() return?', a: 'TRUE if the given column (or any column of the given table) has a direct filter in the current filter context, otherwise FALSE.', level: 'Easy' },
    { q: 'What is the difference between ISFILTERED and ISCROSSFILTERED?', a: 'ISFILTERED is TRUE only for a direct filter on that column. ISCROSSFILTERED is TRUE when the column is filtered directly or indirectly, e.g. by a filter on another column of the same table or a related table.', level: 'Medium' },
    { q: 'In a table visual with City on rows, what does ISFILTERED(Customer[City]) return for the total row?', a: 'FALSE, unless a slicer, filter pane or page filter is also filtering City. Each detail row returns TRUE because of the row filter.', level: 'Medium' },
    { q: 'How is ISFILTERED different from HASONEVALUE?', a: 'ISFILTERED checks if a direct filter exists; HASONEVALUE checks if exactly one distinct value is visible. Selecting Pune and Mumbai: ISFILTERED TRUE, HASONEVALUE FALSE. A Segment filter that leaves only Pune customers: ISFILTERED(City) FALSE but HASONEVALUE(City) TRUE.', level: 'Hard' },
    { q: 'Why can ISFILTERED give wrong results for matrix hierarchy levels?', a: 'Slicers on the lower-level column make it filtered even on higher-level rows and totals. ISINSCOPE checks the visual grouping level and is the better choice for hierarchy-specific calculations.', level: 'Hard' },
    { q: 'How would you create a dynamic visual title showing the selected city?', a: 'Measure: IF(ISFILTERED(Customer[City]), "Sales for " & SELECTEDVALUE(Customer[City], "multiple cities"), "Sales for all cities"), then use it in Format > General > Title > fx > Field value.', level: 'Medium' },
    { q: 'What does ISFILTERED return inside CALCULATE(..., ALL(Customer[City]))?', a: 'FALSE for Customer[City], because ALL removes filters from that column within the CALCULATE.', level: 'Medium' },
  ],
  practice: [
    { task: 'Create a measure Segment Title: "Segment: <name>" when one segment is selected, "Segment: multiple" when filtered to several, else "Segment: all".', hint: 'ISFILTERED + SELECTEDVALUE with an alternate result.', solution: 'Segment Title =\nIF(\n    ISFILTERED(Customer[Segment]),\n    "Segment: " & SELECTEDVALUE(Customer[Segment], "multiple"),\n    "Segment: all"\n)' },
    { task: 'In a matrix with Product[Category] then Product[Product] on rows, create Product Share that shows each product share of its category only on product rows.', hint: 'Use ALLEXCEPT to keep the Category filter.', solution: 'Product Share =\nIF(\n    ISFILTERED(Product[Product]),\n    DIVIDE([Total Sales], CALCULATE([Total Sales], ALLEXCEPT(Product, Product[Category]))),\n    BLANK()\n)' },
    { task: 'Make a measure that returns 1 if any Date column is directly filtered and 0 otherwise.', hint: 'Pass the table name.', solution: "Date Filtered = IF(ISFILTERED('Date'), 1, 0)" },
    { task: 'Test what City Share shows on the Total row when the City slicer selects Pune and Mumbai.', hint: 'The total row now has a City filter.', solution: 'Total Sales for Pune + Mumbai = 10,50,000 and ALL(City) total = 15,00,000, so the total row shows 70.0% instead of blank. Use ISINSCOPE(Customer[City]) if you want blank on the total regardless of slicers.' },
  ],
  quiz: [
    { question: 'A slicer on Customer[Segment] selects Retail. ISFILTERED(Customer[City]) returns:', options: ['TRUE', 'FALSE', 'BLANK', 'Retail'], answer: 1, explanation: 'City is only cross-filtered, not directly filtered.' },
    { question: 'Which function detects indirect (cross) filters too?', options: ['ISFILTERED', 'ISCROSSFILTERED', 'HASONEVALUE', 'ISBLANK'], answer: 1, explanation: 'ISCROSSFILTERED is TRUE for direct or indirect filters.' },
    { question: 'In a table with Customer[City] on rows and no slicers, ISFILTERED(Customer[City]) on the Total row is:', options: ['TRUE', 'FALSE', 'Error', 'Depends on the measure format'], answer: 1, explanation: 'The total row has no filter on City.' },
    { question: 'Which pair builds "Sales for Pune" when exactly one city is selected?', options: ['ISFILTERED + SELECTEDVALUE', 'ISBLANK + FORMAT', 'RANKX + TOPN', 'RELATED + LOOKUPVALUE'], answer: 0, explanation: 'ISFILTERED checks for a selection and SELECTEDVALUE returns the single value.' },
    { question: 'Which function is usually better than ISFILTERED for matrix hierarchy levels?', options: ['ISINSCOPE', 'ISEMPTY', 'ISNUMBER', 'ISERROR'], answer: 0, explanation: 'ISINSCOPE checks if the column is a grouping level in the current visual cell and ignores slicers.' },
  ],
};
