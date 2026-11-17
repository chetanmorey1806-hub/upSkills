export default {
  id: 'extra-34-dynamic-visual-titles',
  title: 'Dynamic Visual Titles',
  module: 'Extra: Visualization & Reporting',
  extraNo: 34,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary:
    "Make visual titles, subtitles and labels change automatically with the user's slicer and filter selections by binding them to DAX measures that return text. A dynamic title tells the reader exactly what they are looking at, so one visual can serve many selections without confusion.",
  objectives: [
    'Explain why static titles become misleading when users apply slicers and filters',
    'Write text-returning DAX measures with SELECTEDVALUE, HASONEVALUE, ISFILTERED, CONCATENATEX and FORMAT',
    'Bind a measure to a visual title, subtitle or button text using the fx (conditional formatting) button',
    'Handle the three selection states: nothing selected, one value selected and many values selected',
    'Combine dynamic text with numbers (for example a total in the title) in a clean format',
  ],
  theory: [
    {
      heading: 'Why dynamic titles?',
      content:
        "A visual title like **Sales by Category** is static: it never changes. If the user selects **Pune** and **2024** in slicers, the chart now shows only Pune 2024 data, but the title still says nothing about it. Screenshots get pasted into emails and the reader has no idea which filters were applied.\n\nA **dynamic title** is like the label on a camera photo that prints the date and place automatically. You write a DAX **measure that returns text**, then tell the title to use that measure. Every time the filter context changes, the measure is re-evaluated and the title updates.\n\nTypical dynamic text:\n- \"Sales by Category - Pune - 2024\"\n- \"Top 5 Products for Corporate customers\"\n- \"Total Sales: 1,245,300 (All Cities)\"",
      points: [
        'The measure must return a text value (string), not a number',
        'It is evaluated in the visual filter context (slicers, page filters, report filters, cross-highlighting from other visuals)',
        'One measure can be reused across many visuals and pages',
      ],
    },
    {
      heading: 'Where the fx button lives',
      content:
        "Almost every text property in the Format pane has a small **fx** button. Clicking it opens the conditional formatting dialog where you choose **Format style: Field value** and pick a measure.\n\nCommon places:\n1. Select visual > Format pane (paint brush icon, **Format visual**) > **General** > **Title** > **Title text** > fx\n2. Same path > **Subtitle** > **Subtitle text** > fx\n3. Buttons: Format button > **Button** > **Text** > fx\n4. Card (new) reference labels and callout labels, and text boxes via **+ Value** (dynamic values in a text box)\n5. Title **Font color** and **Background color** > fx (colour from a measure that returns a colour name or hex code like \"#C00000\")",
      tip: "If the fx button is missing, the property does not support field values. Check that you are on the General tab (Title is under General, not Visual).",
    },
    {
      heading: 'The building-block functions',
      content:
        "Dynamic text measures mostly use a small set of functions:\n\n- **SELECTEDVALUE(column, alternate)** returns the value when exactly one value is in context, otherwise the alternate text. Perfect for single-select slicers.\n- **HASONEVALUE(column)** returns TRUE when exactly one value is visible.\n- **ISFILTERED(column)** returns TRUE when the column is directly filtered (by a slicer, filter pane or visual).\n- **CONCATENATEX(VALUES(column), column, \", \")** joins all visible values into one text, useful for multi-select.\n- **COUNTROWS(VALUES(column))** counts how many values are selected.\n- **FORMAT(value, \"#,##0\")** turns a number or date into nicely formatted text.\n- **&** joins text pieces together.",
      syntax:
        'Title Measure =\nVAR v = SELECTEDVALUE ( Table[Column], "All" )\nRETURN\n    "Fixed text - " & v',
      tip: "SELECTEDVALUE returns the alternate when 0 or 2+ values are visible, so on its own it cannot tell 'nothing selected' from 'several selected'. Use ISFILTERED or COUNTROWS(VALUES()) when that matters.",
    },
    {
      heading: 'Handling single, multiple and no selection',
      content:
        "A professional title handles all three states:\n\n1. **No filter** on City: show \"All Cities\".\n2. **One city**: show the city name.\n3. **Two or three cities**: list them with CONCATENATEX.\n4. **Many cities**: show \"Multiple Cities\" so the title does not become a long sentence.\n\nUse a **VAR** for each part and build the final string in **RETURN**. This keeps the measure readable and lets you reuse parts.",
      syntax:
        'City Text =\nVAR Cnt = COUNTROWS ( VALUES ( Customer[City] ) )\nRETURN\n    SWITCH (\n        TRUE (),\n        NOT ISFILTERED ( Customer[City] ), "All Cities",\n        Cnt = 1, SELECTEDVALUE ( Customer[City] ),\n        Cnt <= 3, CONCATENATEX ( VALUES ( Customer[City] ), Customer[City], ", " ),\n        "Multiple Cities"\n    )',
    },
    {
      heading: 'Numbers and dates inside text',
      content:
        "When you join a number to text with **&**, DAX converts it to text without formatting (for example 1245300.5). Wrap numbers in **FORMAT** to control thousands separators, decimals and currency, and wrap dates to control the date pattern.\n\n- `FORMAT([Total Sales], \"#,##0\")` gives 1,245,301\n- `FORMAT([Total Sales], \"#,##0.00\")` gives 1,245,300.50\n- `FORMAT([Margin %], \"0.0%\")` gives 23.4%\n- `FORMAT(MAX(Sales[OrderDate]), \"dd-mmm-yyyy\")` gives 31-Dec-2024\n\nYear is a whole number column, so `FORMAT(SELECTEDVALUE('Date'[Year]), \"0\")` gives clean text like 2024.",
      tip: "FORMAT always returns text. Use it only in display measures (titles, labels), never in measures that other calculations add up.",
    },
    {
      heading: 'Best practices',
      content:
        "- Prefix title measures with something like **Title -** or keep them in a display folder named **Titles** so they are easy to find.\n- Keep titles short: one line, under about 60 characters.\n- Use the **Subtitle** for filter context (city, year) and the **Title** for the business question.\n- Test every state: no selection, one value, multi-select, and cross-highlight from another visual.\n- Remember that a text measure placed on a table visual would show a value for every row. Title measures are meant for title properties, cards and text boxes.\n- Field parameters plus a dynamic title (using SELECTEDVALUE on the parameter column) make a switchable chart self-describing.",
    },
  ],
  examples: [
    {
      title: 'Title that shows the selected city',
      scenario:
        'A clustered column chart shows Total Sales by Product[Category]. A single-select slicer on Customer[City] sits on the page. The title must read "Sales by Category - <City>" or "Sales by Category - All Cities".',
      table: {
        headers: ['City slicer selection', 'Title shown'],
        rows: [
          ['(nothing selected)', 'Sales by Category - All Cities'],
          ['Pune', 'Sales by Category - Pune'],
          ['Nashik', 'Sales by Category - Nashik'],
        ],
      },
      steps: [
        'Make sure the measure Total Sales = SUM(Sales[SalesAmount]) exists',
        'In the Data pane right-click the Sales table > New measure and paste the Sales Title measure',
        'Add a slicer with Customer[City]; in Format visual > Visual > Slicer settings > Selection turn on Single select',
        'Select the column chart > Format pane > General > Title > Title text > click fx',
        'Format style: Field value; What field should we base this on: Sales > Sales Title > OK',
        'Click Pune in the slicer and watch the title change',
      ],
      code: `Sales Title =
VAR SelCity = SELECTEDVALUE ( Customer[City], "All Cities" )
RETURN
    "Sales by Category - " & SelCity`,
      result: 'The title updates instantly: "Sales by Category - Pune" when Pune is selected and "Sales by Category - All Cities" when the slicer is cleared.',
      explanation:
        'SELECTEDVALUE returns the city when exactly one city is in the filter context; otherwise it returns the alternate text "All Cities". The title property re-evaluates the measure in the visual context every time the slicer changes.',
    },
    {
      title: 'City and year together, with multi-select support',
      scenario:
        'The page has two multi-select slicers: Customer[City] and Date[Year]. The subtitle must list up to 3 cities, otherwise say "Multiple Cities", and show the year or "2023-2024" when both years are visible.',
      table: {
        headers: ['City selection', 'Year selection', 'Subtitle shown'],
        rows: [
          ['(none)', '(none)', 'All Cities | 2023-2024'],
          ['Pune, Mumbai', '2024', 'Mumbai, Pune | 2024'],
          ['Pune, Mumbai, Nagpur, Nashik', '2023', 'Multiple Cities | 2023'],
        ],
      },
      steps: [
        'Modeling > New measure > create City Text (the SWITCH(TRUE()) version below)',
        'Modeling > New measure > create Filter Subtitle',
        'Select the chart > Format pane > General > Title > turn on Subtitle',
        'Subtitle > Subtitle text > fx > Format style: Field value > choose Filter Subtitle > OK',
        'Test: clear slicers, pick 2 cities, then pick all 4 cities, and read the subtitle each time',
      ],
      code: `City Text =
VAR Cnt = COUNTROWS ( VALUES ( Customer[City] ) )
RETURN
    SWITCH (
        TRUE (),
        NOT ISFILTERED ( Customer[City] ), "All Cities",
        Cnt <= 3, CONCATENATEX ( VALUES ( Customer[City] ), Customer[City], ", ", Customer[City], ASC ),
        "Multiple Cities"
    )

Filter Subtitle =
VAR YearText =
    IF (
        HASONEVALUE ( 'Date'[Year] ),
        FORMAT ( SELECTEDVALUE ( 'Date'[Year] ), "0" ),
        FORMAT ( MIN ( 'Date'[Year] ), "0" ) & "-" & FORMAT ( MAX ( 'Date'[Year] ), "0" )
    )
RETURN
    [City Text] & " | " & YearText`,
      result: 'Subtitle reads "All Cities | 2023-2024" with no filters, "Mumbai, Pune | 2024" for two cities and 2024, and "Multiple Cities | 2023" when all four cities are ticked.',
      explanation:
        'ISFILTERED tells "no slicer selection" apart from "selections made". CONCATENATEX sorted ASC lists the visible cities alphabetically. Selecting all 4 cities still counts as filtered, so the count rule returns "Multiple Cities". MIN and MAX of Year build the range when more than one year is visible.',
    },
    {
      title: 'Total value inside the title',
      scenario:
        'A line chart shows monthly sales. The manager wants the title to show the total for the current selection, e.g. "Monthly Sales Trend (Total: 452,300)". Use the shared Sales table.',
      steps: [
        'Modeling > New measure > Trend Title (code below)',
        'Select the line chart > Format pane > General > Title > Title text > fx',
        'Format style: Field value > Trend Title > OK',
        'Change the Segment slicer from Corporate to Retail and confirm the total in the title changes',
      ],
      code: `Trend Title =
VAR Total = SUM ( Sales[SalesAmount] )
RETURN
    "Monthly Sales Trend (Total: " & FORMAT ( Total, "#,##0" ) & ")"`,
      result: 'Title such as "Monthly Sales Trend (Total: 452,300)" which changes with every slicer selection. The number always matches the card showing Total Sales for the same filters.',
      explanation:
        'The title is evaluated for the whole visual (not per data point), so SUM gives the total of everything the visual shows. FORMAT with "#,##0" adds thousands separators and removes decimals. Note that DAX FORMAT always groups digits in threes, so Indian lakh grouping is not available through FORMAT.',
    },
    {
      title: 'Dynamic title colour (red when sales fall)',
      scenario:
        'Make the KPI chart title red if this year sales are below last year, otherwise green. Requires the Date table to be marked as a date table.',
      steps: [
        'Modeling > New measure > Title Colour (code below)',
        'Select the visual > Format pane > General > Title > Font color > fx',
        'Format style: Field value > choose Title Colour > OK',
        'Select 2024 in the Year slicer and compare the colour with the actual values',
      ],
      code: `Title Colour =
VAR CY = SUM ( Sales[SalesAmount] )
VAR PY = CALCULATE ( SUM ( Sales[SalesAmount] ), SAMEPERIODLASTYEAR ( 'Date'[Date] ) )
RETURN
    IF ( CY < PY, "#C00000", "#107C10" )`,
      result: 'With 2024 selected the title turns red (#C00000) if 2024 sales are lower than 2023, otherwise green (#107C10).',
      explanation:
        'Colour properties accept a measure that returns a colour name or a hex code. SAMEPERIODLASTYEAR shifts the date filter one year back so PY is the previous-year value for the same period.',
    },
  ],
  interview: [
    {
      q: 'How do you create a dynamic title in Power BI?',
      a: 'Write a measure that returns text (for example using SELECTEDVALUE), then select the visual > Format pane > General > Title > Title text > fx > Format style: Field value and pick the measure. The title is re-evaluated whenever filters change.',
      level: 'Easy',
    },
    {
      q: 'What does the second argument of SELECTEDVALUE do?',
      a: 'It is the alternate result returned when the column does not have exactly one value in the current filter context (zero or many values). Without it, SELECTEDVALUE returns BLANK in those cases.',
      level: 'Easy',
    },
    {
      q: 'A user selects three cities and the title shows "All Cities". Why, and how do you fix it?',
      a: 'The measure uses SELECTEDVALUE(Customer[City], "All Cities"), which returns the alternate for any multi-selection. Fix it by checking ISFILTERED for the "no selection" case and using CONCATENATEX(VALUES(Customer[City]), Customer[City], ", ") or a "Multiple Cities" label when more than one city is visible.',
      level: 'Medium',
    },
    {
      q: 'Why should you use FORMAT inside a title measure but not in a calculation measure?',
      a: 'FORMAT converts a number to text so it can be displayed with separators and currency inside a string. Text cannot be summed, compared numerically or used in charts, so FORMAT belongs only in display measures such as titles and labels.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between ISFILTERED and HASONEVALUE for title logic?',
      a: 'ISFILTERED returns TRUE when a filter is applied directly to the column, even if all values are selected. HASONEVALUE returns TRUE only when exactly one value remains visible, which can also happen through cross-filtering from another column. Use ISFILTERED to detect user selection and HASONEVALUE to decide if you can show a single name.',
      level: 'Medium',
    },
    {
      q: 'Scenario: a chart uses a field parameter to switch between Category, City and Segment. How do you make its title say "Sales by City" when City is picked?',
      a: 'Use the display-name column of the field parameter table: Axis Title = "Sales by " & SELECTEDVALUE(\'Axis Choice\'[Axis Choice], "Category"). Bind it to the Title text with fx. Because the slicer for a field parameter is usually single-select, SELECTEDVALUE returns the chosen display name.',
      level: 'Hard',
    },
    {
      q: 'Which visual properties besides the title can be driven by a measure?',
      a: 'Subtitle text, title font and background colour, button text and fill colour, data colours (via conditional formatting), card labels, reference line values, web URL actions and dynamic values inside text boxes. Any property showing the fx button supports field values.',
      level: 'Medium',
    },
    {
      q: 'Scenario: the dynamic title is correct in Desktop but shows "All Cities" in a dashboard tile after pinning. Why?',
      a: 'A pinned tile is a snapshot of the visual as of pinning and refresh; dashboard tiles do not respond to report slicers. Dynamic titles are meant for interactive reports. Pin a live report page or tell users to use the report for filtered views.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a Category Title measure for a bar chart showing sales by Product. When one category is selected show "Products in Electronics", otherwise "Products in All Categories".',
      hint: 'SELECTEDVALUE on Product[Category] with an alternate value.',
      solution:
        'Category Title = "Products in " & SELECTEDVALUE(Product[Category], "All Categories"). Bind it via Format pane > General > Title > Title text > fx > Field value.',
    },
    {
      task: 'Write a subtitle measure that shows the selected Segment and how many orders are in view, for example "Retail - 312 orders".',
      hint: 'Use COUNTROWS(Sales) and FORMAT for the number.',
      solution:
        'Segment Subtitle = SELECTEDVALUE(Customer[Segment], "All Segments") & " - " & FORMAT(COUNTROWS(Sales), "#,##0") & " orders"',
    },
    {
      task: 'Make a title that lists selected months in order (Jan, Feb, Mar) when up to 4 months are selected, otherwise says "Several months".',
      hint: 'CONCATENATEX has optional order-by arguments. Sort by Date[MonthNo].',
      solution:
        'Month Text = VAR Cnt = COUNTROWS(VALUES(\'Date\'[Month])) RETURN IF(NOT ISFILTERED(\'Date\'[Month]), "All Months", IF(Cnt <= 4, CONCATENATEX(VALUES(\'Date\'[Month]), \'Date\'[Month], ", ", CALCULATE(MIN(\'Date\'[MonthNo])), ASC), "Several months"))',
    },
    {
      task: 'Add a button whose text says "Go to Pune details" when Pune is selected in the City slicer, and "Select a city" otherwise.',
      hint: 'Buttons have a Text property with fx under Format button > Button > Text.',
      solution:
        'Button Text = IF(HASONEVALUE(Customer[City]), "Go to " & SELECTEDVALUE(Customer[City]) & " details", "Select a city"). Insert > Buttons > Blank, then Format button > Button > Text > fx > Field value > Button Text.',
    },
    {
      task: 'Try your Sales Title measure in the DAX Lab with and without a City filter and confirm the returned text.',
      hint: 'The DAX Lab supports SELECTEDVALUE, CONCATENATEX and FORMAT.',
      solution:
        'With no filter the measure returns "Sales by Category - All Cities"; filtering City = Pune returns "Sales by Category - Pune".',
    },
  ],
  quiz: [
    {
      question: 'Which Format pane path sets a dynamic chart title?',
      options: [
        'Visual > X-axis > Title > fx',
        'General > Title > Title text > fx',
        'Data pane > Properties > Description',
        'View > Themes > Customize current theme',
      ],
      answer: 1,
      explanation: 'Title settings are under the General tab of Format visual; the fx button next to Title text lets you bind a measure.',
    },
    {
      question: 'What does SELECTEDVALUE(Customer[City], "All") return when Pune and Mumbai are both selected?',
      options: ['"Pune"', '"Pune, Mumbai"', '"All"', 'An error'],
      answer: 2,
      explanation: 'With more than one value in context SELECTEDVALUE returns its alternate result.',
    },
    {
      question: 'A title measure must return which data type?',
      options: ['Whole number', 'Text', 'Date', 'Boolean'],
      answer: 1,
      explanation: 'Title text expects a string; use & and FORMAT to build it.',
    },
    {
      question: 'Which function joins all visible city names into one string?',
      options: ['CONCATENATE', 'CONCATENATEX', 'COMBINEVALUES', 'VALUES'],
      answer: 1,
      explanation: 'CONCATENATEX iterates a table (e.g. VALUES(Customer[City])) and joins the expression with a delimiter.',
    },
    {
      question: 'Why use FORMAT([Total Sales], "#,##0") in a title?',
      options: [
        'To make the measure faster',
        'To convert the number to text with thousands separators',
        'To round the stored value in the model',
        'To change the column data type',
      ],
      answer: 1,
      explanation: 'FORMAT returns formatted text for display; it does not change the underlying data.',
    },
  ],
};
