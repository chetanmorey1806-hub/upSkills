export default {
  id: 'day-36-parameters-dynamic-titles',
  title: 'What-if Parameters, Field Parameters, Dynamic Titles',
  module: 'Module 6: Advanced Power BI',
  day: 36,
  level: 'Advanced',
  duration: '2 hours',
  summary:
    'Parameters make reports interactive in ways slicers alone cannot: what-if parameters let users try scenarios (discount, price increase), field parameters let users choose which column or measure a visual shows, and dynamic titles keep the visual text in sync with the selections.',
  objectives: [
    'Create a numeric range (what-if) parameter and use its value in scenario measures',
    'Create a field parameter to switch a visual axis or measure without DAX SWITCH',
    'Write text measures that build dynamic titles from slicer selections',
    'Apply a measure to a visual title using conditional formatting (fx)',
  ],
  theory: [
    {
      heading: 'What-if (numeric range) parameters',
      content:
        "A **what-if parameter** answers questions like 'What happens to revenue if we give a 10% discount?'. Power BI creates:\n\n1. A calculated table with a list of numbers, using `GENERATESERIES(start, end, increment)`.\n2. A measure that reads the selected value with `SELECTEDVALUE(column, default)`.\n3. Optionally, a slider slicer on the page.\n\nPath: **Modeling > New parameter > Numeric range**. Fill Name, Data type (Whole number, Decimal number, Fixed decimal), Minimum, Maximum, Increment and Default, keep 'Add slicer to this page' ticked, click **Create**.\n\nThe parameter table is disconnected from the model; it does not filter data. You use its measure inside other measures.",
      syntax: "Discount % = GENERATESERIES ( 0, 0.5, 0.05 )\nDiscount % Value = SELECTEDVALUE ( 'Discount %'[Discount %], 0 )",
      tip: 'Format the parameter column as Percentage so the slider shows 10% instead of 0.1.',
    },
    {
      heading: 'Field parameters',
      content:
        "A **field parameter** lets the report user decide which field a visual uses: Category or City on the axis, or Sales or Profit as the value. No SWITCH measure is needed.\n\nPath: **Modeling > New parameter > Fields**. Give it a name, drag fields (columns or measures) into the list in the order you want, keep 'Add slicer to this page' ticked, click **Create**.\n\nPower BI creates a calculated table using `NAMEOF`, with three columns: the display name, a hidden Fields column and an Order column. Put the parameter column on the visual (Axis or Values) and the slicer switches it.\n\nIf you do not see the option in an older Desktop version, enable it in File > Options and settings > Options > Preview features.",
      syntax: "Axis Choice = {\n    (\"Category\", NAMEOF ( 'Product'[Category] ), 0),\n    (\"City\", NAMEOF ( 'Customer'[City] ), 1),\n    (\"Segment\", NAMEOF ( 'Customer'[Segment] ), 2)\n}",
      points: [
        'You can rename the display text in the DAX table without changing the real field.',
        'Multi-select in the slicer adds several fields at once (e.g. Category and City in a matrix).',
        'Field parameters work with columns and measures but you should not mix both in one parameter.',
      ],
    },
    {
      heading: 'What-if vs field parameter vs SWITCH measure',
      content:
        "- **What-if parameter**: user picks a *number* used inside calculations (scenario analysis).\n- **Field parameter**: user picks a *field* (column or measure) the visual displays.\n- **Disconnected table + SWITCH**: user picks an option and you control the logic in DAX; useful when each option needs special calculation or formatting.\n\nAll three rely on a table that is not related to the fact table.",
    },
    {
      heading: 'Dynamic titles',
      content:
        "A static title such as 'Sales by Category' becomes misleading when a slicer is set to Pune and 2024. A **dynamic title** is a text measure shown in the title.\n\nSteps: create a measure that returns text, then select the visual > **Format > General > Title** > click **fx** next to Text > Format style **Field value** > choose the measure > OK.\n\nUseful functions: `SELECTEDVALUE` (single selection with default), `ISFILTERED` (is there any selection), `CONCATENATEX` (list multiple selections), `FORMAT` (show numbers and dates nicely).",
      syntax: "Title = \"Sales for \" & SELECTEDVALUE ( Customer[City], \"All Cities\" )",
      tip: 'The title measure must return a text value. Use & to join text and FORMAT() to convert numbers.',
    },
    {
      heading: 'Good practice',
      content:
        "1. Keep parameter tables in a display folder or hide the raw column if only the measure is needed.\n2. Always provide a default in SELECTEDVALUE so visuals still work when nothing or many items are selected.\n3. Limit CONCATENATEX lists (e.g. show 'Multiple cities' when more than 3 are selected) to keep titles short.\n4. Test with no selection, one selection and multiple selections.",
    },
  ],
  examples: [
    {
      title: 'Discount scenario with a what-if parameter',
      scenario: 'Sales team wants to see revenue after a discount between 0% and 50% in steps of 5%.',
      table: {
        headers: ['Discount selected', 'Total Sales', 'Sales After Discount'],
        rows: [
          ['0%', '1,86,500', '1,86,500'],
          ['10%', '1,86,500', '1,67,850'],
          ['20%', '1,86,500', '1,49,200'],
        ],
      },
      steps: [
        'Modeling > New parameter > Numeric range',
        'Name: Discount %, Data type: Decimal number, Minimum 0, Maximum 0.5, Increment 0.05, Default 0',
        'Keep Add slicer to this page ticked and click Create',
        'Select the Discount % column in the Data pane and set Column tools > Format: Percentage',
        'Modeling > New measure: Sales After Discount (below)',
        'Add a Card for [Total Sales] and a Card for [Sales After Discount]; move the slider to 10%',
      ],
      code: `-- Created automatically by Power BI
Discount % = GENERATESERIES ( 0, 0.5, 0.05 )
Discount % Value = SELECTEDVALUE ( 'Discount %'[Discount %], 0 )

-- Your scenario measure
Sales After Discount = [Total Sales] * ( 1 - [Discount % Value] )`,
      result: 'With the sample slice (1,86,500): 10% gives 1,67,850; 20% gives 1,49,200.',
      explanation: 'The slider filters the disconnected parameter table; SELECTEDVALUE returns that single number which the scenario measure uses.',
    },
    {
      title: 'Price increase impact on profit',
      scenario: 'Management wants profit if prices rise by 0-20% while cost stays the same.',
      table: {
        headers: ['Price increase', 'Projected Sales', 'Projected Profit'],
        rows: [
          ['0%', '1,86,500', '40,500'],
          ['5%', '1,95,825', '49,825'],
          ['10%', '2,05,150', '59,150'],
        ],
      },
      steps: [
        'Modeling > New parameter > Numeric range: Name Price Increase, Decimal number, 0 to 0.2, increment 0.01, default 0',
        'Create the two measures below',
        'Add a table or cards with the measures and move the slider',
      ],
      code: `Projected Sales = [Total Sales] * ( 1 + [Price Increase Value] )

Projected Profit = [Projected Sales] - SUM ( Sales[Cost] )`,
      result: 'At 5%: Projected Sales 1,95,825 and Projected Profit 49,825 (cost 1,46,000 unchanged).',
      explanation: 'The parameter value is used as a multiplier. Cost is not multiplied, so profit grows by the full increase in sales.',
    },
    {
      title: 'Field parameter to switch the chart axis',
      scenario: 'A single column chart should show Total Sales by Category, City or Segment depending on a slicer.',
      table: {
        headers: ['Selected axis', 'Bars shown (sample slice)'],
        rows: [
          ['Category', 'Electronics 1,50,000; Furniture 24,000; Accessories 12,500'],
          ['City', 'Pune 1,24,000; Nagpur 50,000; Mumbai 12,500'],
          ['Segment', 'Corporate 1,74,000; Retail 12,500'],
        ],
      },
      steps: [
        'Modeling > New parameter > Fields',
        'Name: Axis Choice. Drag Product[Category], Customer[City], Customer[Segment] into Add and reorder fields',
        'Keep Add slicer to this page ticked and click Create',
        'Insert a Clustered column chart. X-axis: Axis Choice (the parameter column). Y-axis: [Total Sales]',
        'Click City in the slicer; the chart axis changes to City',
      ],
      code: `Axis Choice = {
    ( "Category", NAMEOF ( 'Product'[Category] ), 0 ),
    ( "City", NAMEOF ( 'Customer'[City] ), 1 ),
    ( "Segment", NAMEOF ( 'Customer'[Segment] ), 2 )
}`,
      result: 'Selecting Segment shows Corporate 1,74,000 (Asha + Neha) and Retail 12,500 (Ravi).',
      explanation: 'The Fields column holds references created by NAMEOF; the visual swaps the referenced field based on the slicer selection.',
    },
    {
      title: 'Dynamic title from slicer selections',
      scenario: 'The chart title must show which cities are selected, or All Cities when none is selected.',
      table: {
        headers: ['City slicer', 'Title shown'],
        rows: [
          ['(nothing)', 'Sales by Category - All Cities'],
          ['Pune', 'Sales by Category - Pune'],
          ['Pune, Mumbai', 'Sales by Category - Mumbai, Pune'],
        ],
      },
      steps: [
        'Modeling > New measure: Chart Title (below)',
        'Select the chart > Format visual > General > Title',
        'Click fx next to Text; Format style: Field value; What field should we base this on: Chart Title; OK',
        'Test with no city, one city and two cities selected',
      ],
      code: `Chart Title =
VAR Cities =
    IF (
        ISFILTERED ( Customer[City] ),
        CONCATENATEX ( VALUES ( Customer[City] ), Customer[City], ", ", Customer[City], ASC ),
        "All Cities"
    )
RETURN
    "Sales by Category - " & Cities`,
      result: 'Title updates automatically with the selection; multiple cities are listed alphabetically.',
      explanation: 'ISFILTERED detects a slicer selection; CONCATENATEX joins the visible cities. The measure returns text so it can drive the title.',
    },
    {
      title: 'Title that follows a field parameter and shows a number',
      scenario: 'Show "Total Sales by City: 1,86,500" where the field name follows the Axis Choice slicer.',
      table: {
        headers: ['Axis Choice', 'Title'],
        rows: [
          ['Category', 'Total Sales by Category: 1,86,500'],
          ['City', 'Total Sales by City: 1,86,500'],
        ],
      },
      steps: [
        'Create the Axis Choice field parameter from the previous example',
        'Modeling > New measure: Axis Title (below)',
        'Chart > Format > General > Title > fx > Field value > Axis Title',
      ],
      code: `Axis Title =
VAR SelOrder = SELECTEDVALUE ( 'Axis Choice'[Axis Choice Order] )
VAR FieldName =
    SWITCH ( SelOrder, 0, "Category", 1, "City", 2, "Segment", "Selected Field" )
RETURN
    "Total Sales by " & FieldName & ": " & FORMAT ( [Total Sales], "#,##0" )`,
      result: 'Title reads Total Sales by City: 1,86,500 when City is chosen (FORMAT uses the standard thousands separator 186,500 or the locale format of the report).',
      explanation: 'Reading the Order column is a reliable way to know the selected field parameter; FORMAT converts the number into text.',
    },
  ],
  interview: [
    {
      q: 'What objects does Power BI create when you add a what-if parameter?',
      a: 'A calculated table built with GENERATESERIES, a measure "<Name> Value" using SELECTEDVALUE with the default value, and optionally a single-value slider slicer on the page.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between a what-if parameter and a field parameter?',
      a: 'A what-if parameter provides a numeric value for scenario calculations. A field parameter lets the user choose which column or measure a visual displays, switching axis/values without a SWITCH measure.',
      level: 'Easy',
    },
    {
      q: 'Why should parameter tables not have relationships with fact tables?',
      a: 'They exist only to capture a user choice. A relationship would filter the fact table by meaningless values and break results.',
      level: 'Medium',
    },
    {
      q: 'How do you make a visual title dynamic?',
      a: 'Create a measure that returns text (using SELECTEDVALUE, CONCATENATEX, FORMAT), then select the visual > Format > General > Title > fx > Field value and pick the measure.',
      level: 'Easy',
    },
    {
      q: 'Scenario: the dynamic title shows blank when users pick two cities. How do you fix it?',
      a: 'SELECTEDVALUE returns the alternate result/BLANK when there is not exactly one value. Provide a default text, or use CONCATENATEX(VALUES(Customer[City]), Customer[City], ", ") with ISFILTERED to list all selections, possibly capped with a "Multiple cities" message when COUNTROWS(VALUES(...)) > 3.',
      level: 'Medium',
    },
    {
      q: 'What function does Power BI use inside a field parameter table?',
      a: 'NAMEOF, which returns the fully qualified name of a column or measure, so the parameter keeps working when the field is renamed.',
      level: 'Medium',
    },
    {
      q: 'Scenario: Finance wants to test a 0-15% cost increase and see margin. Design the solution.',
      a: 'Create a numeric range parameter Cost Increase (0 to 0.15, step 0.01). Measures: Projected Cost = SUM(Sales[Cost]) * (1 + [Cost Increase Value]); Projected Margin % = DIVIDE([Total Sales] - [Projected Cost], [Total Sales]). Show with cards and a dynamic title including FORMAT([Cost Increase Value], "0%").',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a what-if parameter Target Growth (0% to 30%, step 5%) and a measure for next year target sales.',
      hint: 'Modeling > New parameter > Numeric range; multiply Total Sales by (1 + value).',
      solution: `Target Growth = GENERATESERIES ( 0, 0.3, 0.05 )
Target Growth Value = SELECTEDVALUE ( 'Target Growth'[Target Growth], 0 )
Next Year Target = [Total Sales] * ( 1 + [Target Growth Value] )`,
    },
    {
      task: 'Create a field parameter that switches a card or chart between Total Sales, Profit and Total Quantity measures.',
      hint: 'Modeling > New parameter > Fields; drag the three measures.',
      solution: `Metric Choice = {
    ( "Total Sales", NAMEOF ( [Total Sales] ), 0 ),
    ( "Profit", NAMEOF ( [Profit] ), 1 ),
    ( "Total Quantity", NAMEOF ( [Total Quantity] ), 2 )
}
-- Put Metric Choice in the Y-axis of the chart and in a slicer.`,
    },
    {
      task: 'Write a title measure: "Sales in 2024 - Q1" using Date slicers, with defaults "All Years" and "All Quarters".',
      hint: 'Use SELECTEDVALUE twice.',
      solution: `Period Title =
"Sales in " & SELECTEDVALUE ( 'Date'[Year], "All Years" )
    & " - " & SELECTEDVALUE ( 'Date'[Quarter], "All Quarters" )`,
    },
    {
      task: 'Make a title that lists up to 3 selected categories, otherwise shows "Multiple categories".',
      hint: 'Count VALUES first.',
      solution: `Category Title =
VAR N = COUNTROWS ( VALUES ( Product[Category] ) )
RETURN
    IF (
        NOT ISFILTERED ( Product[Category] ), "All Categories",
        IF ( N <= 3,
            CONCATENATEX ( VALUES ( Product[Category] ), Product[Category], ", " ),
            "Multiple categories" )
    )`,
    },
  ],
  quiz: [
    {
      question: 'Which DAX function builds the what-if parameter table?',
      options: ['CALENDAR', 'GENERATESERIES', 'SUMMARIZE', 'DATATABLE'],
      answer: 1,
      explanation: 'GENERATESERIES(start, end, increment) returns a one-column table of numbers.',
    },
    {
      question: 'Where do you create a field parameter?',
      options: [
        'Home > Transform data',
        'Modeling > New parameter > Fields',
        'View > Bookmarks',
        'Insert > Buttons',
      ],
      answer: 1,
      explanation: 'Field parameters are created from Modeling > New parameter > Fields.',
    },
    {
      question: 'A dynamic title measure must return...',
      options: ['A table', 'A number', 'Text', 'A date'],
      answer: 2,
      explanation: 'Title text is a string; use FORMAT to convert numbers.',
    },
    {
      question: 'With 10% selected, Sales After Discount on 1,86,500 is...',
      options: ['1,67,850', '1,86,500', '18,650', '2,05,150'],
      answer: 0,
      explanation: '1,86,500 x 0.9 = 1,67,850.',
    },
    {
      question: 'What does SELECTEDVALUE(Customer[City], "All Cities") return when nothing is selected?',
      options: ['BLANK', 'An error', '"All Cities"', 'The first city'],
      answer: 2,
      explanation: 'With more than one visible value, SELECTEDVALUE returns the alternate result.',
    },
  ],
};
