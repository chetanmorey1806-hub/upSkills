export default {
  id: 'visualizations',
  title: 'Visualizations: Choosing, Building and Formatting Visuals',
  level: 'Beginner',
  day: 11,
  duration: '4 hours',
  summary:
    "Learn every core Power BI visual, when to use each one, how to format it, how to apply conditional formatting, and how to design clean, consistent reports with themes. Choosing the right visual is the difference between a report people trust and one they ignore.",
  objectives: [
    'Identify the right visual for comparison, trend, composition, distribution, relationship and KPI questions',
    'Build and format bar, line, combo, pie/donut, treemap, map, table, matrix, card, KPI, gauge, scatter, waterfall, funnel and ribbon charts',
    'Apply conditional formatting (background, font colour, data bars, icons, web URL) in tables and matrices',
    'Import custom visuals from AppSource and understand certification',
    'Apply report design principles and JSON themes for a consistent, professional look',
  ],
  theory: [
    {
      heading: 'How visuals are built: fields, wells and the Visualizations pane',
      content:
        "Every visual is built from the **Visualizations pane** (right side of Report view). It has three tabs:\n\n1. **Build visual** - pick a visual type and drag fields into wells (X-axis, Y-axis, Legend, Values, Tooltips, Small multiples, etc.).\n2. **Format visual** - Visual and General tabs to style axes, labels, colours, title, background, border, shadow, size.\n3. **Analytics** - add constant lines, average/min/max lines, trend and forecast lines (not every visual supports it).\n\nWhen you drag a numeric column (e.g. Sales[SalesAmount]) into Values, Power BI creates an **implicit measure** (Sum of SalesAmount). In professional models you should use **explicit measures** such as `Total Sales = SUM(Sales[SalesAmount])` so logic is reusable and consistent.",
      points: [
        'Text/date fields usually go to axis/legend/rows; measures go to values',
        'The field list shows measures with a calculator icon and columns with Σ (summarizable) or plain icons',
        'Use the On-object interaction (if enabled) to format directly on the visual',
        'Ctrl+click visuals to select multiple and align/distribute them via Format > Align',
      ],
      tip: "Rename fields inside a visual (double-click in the well) to change the label for that visual only without renaming the model column.",
    },
    {
      heading: 'Comparison visuals: bar, column, clustered, stacked, 100% stacked',
      content:
        "**Bar (horizontal)** and **column (vertical)** charts compare values across categories. They are the most accurate visuals for the human eye because we compare lengths from a common baseline.\n\n- Use **bar** charts when category names are long or there are many categories (e.g. 20 product names).\n- Use **column** charts for a small number of categories or time periods.\n- **Clustered** shows sub-categories side by side (Sales by Category, split by Year).\n- **Stacked** shows totals plus composition (Sales by Region split by Category).\n- **100% stacked** shows only proportions (mix of Category per Region) - totals are hidden.\n\nAlways sort meaningfully (usually descending by value) and start the value axis at zero.",
      tip: "Too many legend items in a stacked chart (more than ~5) makes it unreadable. Group the rest into 'Other' or use a matrix.",
    },
    {
      heading: 'Trend visuals: line, area, combo and ribbon',
      content:
        "**Line chart** - the default for trends over continuous time (Sales by Month). Multiple lines can compare series, but more than 4-5 lines becomes a 'spaghetti chart'.\n\n**Area chart** - a line chart with the area filled; emphasises volume. **Stacked area** shows how parts contribute to a total over time.\n\n**Combo chart (Line and clustered/stacked column)** - two different measures, often on two axes: columns for Sales and a line for Profit Margin %. Ideal when units differ.\n\n**Ribbon chart** - shows ranking changes over time: within each period, the category with the highest value is on top, and ribbons show how ranks change between periods. Good for 'Which category was No. 1 each month?'\n\nFor continuous date axes, set X-axis type to **Continuous**; for categorical months use **Categorical** and sort by month number.",
      tip: "When a line chart shows the month names in alphabetical order (Apr, Aug, Dec...), set 'Date'[MonthName] to Sort by column 'Date'[MonthNumber] in the Column tools ribbon.",
    },
    {
      heading: 'Composition visuals: pie, donut, treemap, waterfall, funnel',
      content:
        "**Pie / Donut** - part-to-whole for a few categories (2-5). Humans are poor at comparing angles, so avoid pies with many slices or for comparing values precisely. A donut is the same with a hole (space for a label).\n\n**Treemap** - nested rectangles sized by value; handles many categories and hierarchies (Category > Subcategory) better than a pie.\n\n**Waterfall** - shows how a starting value moves to an ending value through positive and negative contributions (e.g. Profit bridge: Revenue, - Cost, - Discounts, = Profit; or monthly change in sales). Add a **Breakdown** field to explain changes between two periods.\n\n**Funnel** - sequential stages that decrease (Leads > Qualified > Proposal > Won). Each bar shows the value and % of the first stage.",
      tip: "If someone asks for a pie with 12 slices, suggest a sorted bar chart: it communicates the same data far more clearly.",
    },
    {
      heading: 'Single-number visuals: card, multi-row card, KPI, gauge',
      content:
        "**Card** - displays one big number (Total Sales = 1.2M). The newer **Card (new)** visual can show several measures with reference labels in one visual.\n\n**Multi-row card** - several measures or one measure per category in a compact list.\n\n**KPI** - shows a value, a target, the status (green/red with icon) and a trend background (requires a field in the Trend axis, e.g. Date). Example: Sales this month vs Target.\n\n**Gauge** - a semicircle showing a value against minimum, maximum and a target. Looks attractive but uses a lot of space; a KPI or a bullet chart (custom visual) is usually more efficient.\n\nCards normally sit at the top of a report page (the 'KPI row') because readers scan top-left first.",
      points: [
        'Format cards with display units (Thousands, Millions) and decimals',
        'Use DAX for dynamic card subtitles, e.g. "vs LY: +12%"',
        'KPI visual needs: Value, Trend axis, Target',
      ],
    },
    {
      heading: 'Tables, matrices, scatter and maps',
      content:
        "**Table** - flat list of rows and columns; best for detail and exact values (top 10 customers with sales, orders, margin).\n\n**Matrix** - like an Excel PivotTable: rows, columns and values with hierarchies, subtotals, expand/collapse (+/-) and drill-down. Use 'Stepped layout' for compact hierarchies.\n\n**Scatter chart** - relationship between two measures (X = Sales, Y = Profit Margin %) for each item in Values/Details (e.g. each Product). Size adds a third measure (bubble chart). Add a Play axis (Date) to animate over time.\n\n**Map (bubble map)** - circles sized by value at locations. **Filled map (choropleth)** - shades areas (countries, states) by value. **Azure Maps** visual is the modern option; the legacy Map and Filled map visuals are being deprecated in favour of Azure Maps. Maps require geographic fields - set Data category (Country, State, City, Postal code, Latitude/Longitude) in Column tools to avoid ambiguous locations (e.g. 'Paris' in France vs Texas).\n\nMap visuals may need to be enabled by an admin in tenant settings.",
      tip: "Ambiguous geography fix: create a combined column like City & \", \" & Country and set its Data category to Place, or use latitude/longitude.",
    },
    {
      heading: 'Choosing the right visual',
      content:
        "Start from the **business question**, not the visual. Match the question type to a visual family:",
      points: [
        'Comparison across categories -> bar / column chart',
        'Trend over time -> line / area chart; two measures with different units -> combo chart',
        'Part-to-whole -> stacked bar, 100% stacked bar, treemap; pie/donut only for 2-5 categories',
        'Ranking changes over time -> ribbon chart',
        'Contribution / bridge from start to end -> waterfall',
        'Process stages / conversion -> funnel',
        'Relationship / correlation -> scatter / bubble',
        'Geographic patterns -> filled map or Azure Maps',
        'Single headline number -> card; number vs target -> KPI / gauge',
        'Exact values / detail lookup -> table; cross-tab with hierarchies -> matrix',
      ],
      tip: "In interviews, justify your choice: 'I used a bar chart because the users need to compare 15 products and the names are long.' Reasoning matters more than the visual itself.",
    },
    {
      heading: 'Formatting and conditional formatting',
      content:
        "The **Format pane** controls everything: titles (can be driven by a measure via the fx button), data labels, axis titles, gridlines, colours, legend position, background, borders, shadows, padding, and visual header icons.\n\n**Conditional formatting** (tables, matrices, and colour of many charts) is applied from the field dropdown in the Values well or Format > Cell elements:\n\n- **Background colour / Font colour** - by Gradient (colour scale), Rules (if value >= 0 and < 0.1 then red), or Field value (a measure that returns a colour such as \"#2E7D32\").\n- **Data bars** - in-cell bars proportional to value.\n- **Icons** - traffic lights, arrows by rules.\n- **Web URL** - turn a text column into a clickable link.\n\nUsing a **field value measure** is the most flexible approach because business logic lives in DAX.",
      syntax:
        'Margin Colour =\nVAR m = [Profit Margin %]\nRETURN\n    SWITCH (\n        TRUE (),\n        m < 0.10, "#D32F2F",   -- red\n        m < 0.25, "#F9A825",   -- amber\n        "#2E7D32"              -- green\n    )',
      tip: "Use 'Format by: Field value' and select the Margin Colour measure. The same measure can colour bar chart columns (Format > Columns > Colors > fx).",
    },
    {
      heading: 'Custom visuals, themes and report design principles',
      content:
        "**Custom visuals** come from **AppSource** (Visualizations pane > ... > Get more visuals). Examples: Bullet chart, Chiclet slicer, Sankey, Gantt, Zebra BI, Deneb. Prefer **certified** visuals (Microsoft has reviewed that they do not access external services). Admins can restrict which custom visuals are allowed (organizational visuals).\n\n**Themes** (View > Themes) apply colours, fonts and default visual formatting to the whole report. You can customise the current theme or import a **JSON theme file** to match corporate branding.\n\n**Design principles**:",
      points: [
        'One page = one purpose/audience; put the most important KPIs top-left',
        'Follow a Z-pattern or F-pattern layout: KPI cards on top, main trends in the middle, details at the bottom',
        'Limit visuals per page (around 6-8) for clarity and performance',
        'Use consistent colours: one colour per meaning (e.g. brand blue for actuals, grey for prior year, red only for bad)',
        'Remove chart junk: unnecessary gridlines, 3D, heavy borders, redundant legends',
        'Align visuals to a grid; use consistent spacing, fonts and title styles',
        'Use clear titles that state the insight or question, and consistent number formats',
        'Design for accessibility: sufficient contrast, do not rely on colour alone, set alt text and tab order',
      ],
      syntax:
        '{\n  "name": "Contoso Corporate",\n  "dataColors": ["#1F4E79", "#2E86C1", "#A9CCE3", "#F39C12", "#7F8C8D"],\n  "background": "#FFFFFF",\n  "foreground": "#252423",\n  "tableAccent": "#1F4E79"\n}',
      tip: "Create a page background (canvas image) in PowerPoint with the header and section shapes, then place visuals on top - fast way to get a polished layout.",
    },
  ],
  examples: [
    {
      title: 'Sales vs Profit Margin combo chart',
      scenario: 'Show monthly Total Sales (columns) and Profit Margin % (line) on one chart for 2025.',
      code:
        'Measures:\nTotal Sales = SUM ( Sales[SalesAmount] )\nProfit Margin % = DIVIDE ( SUM ( Sales[SalesAmount] ) - SUM ( Sales[Cost] ), SUM ( Sales[SalesAmount] ) )\n\nSteps:\n1. Insert "Line and clustered column chart".\n2. X-axis: \'Date\'[MonthName] (sorted by MonthNumber).\n3. Column y-axis: [Total Sales].  Line y-axis: [Profit Margin %].\n4. Add a slicer or filter on \'Date\'[Year] = 2025.\n5. Format > Y-axis: set display units to Thousands; Secondary y-axis: show, format as %.\n6. Turn on data labels for the line only (Data labels > Apply settings to: Profit Margin %).\n7. Title: "Sales grow while margin dips in Q3".',
      explanation:
        'A combo chart is the right choice because the two measures have different units (currency vs percentage). Without a secondary axis, the margin line (values around 0.3) would be flat at the bottom. An insight-driven title tells readers what to notice.',
    },
    {
      title: 'Top 10 products bar chart',
      scenario: 'Display the 10 best-selling products by sales, sorted descending.',
      code:
        '1. Insert a Clustered bar chart.\n2. Y-axis: Product[ProductName].  X-axis: [Total Sales].\n3. Filters pane > ProductName > Filter type: Top N.\n   Show items: Top 10, By value: [Total Sales] > Apply filter.\n4. Visual ... menu > Sort axis > Total Sales, Sort descending.\n5. Format: data labels on, gridlines off, X-axis off (labels make it redundant).\n6. Bars colour: brand colour; optionally conditional colour via fx with a measure.',
      explanation:
        'Bar (horizontal) is chosen because product names are long. The visual-level Top N filter is evaluated in the current filter context, so if a Year slicer changes, the Top 10 list is recalculated. Removing the axis and showing labels reduces clutter.',
    },
    {
      title: 'Matrix with conditional formatting',
      scenario: 'Category managers want a matrix of Category > Subcategory by Year with sales, margin %, data bars and red/amber/green margin colouring.',
      table: {
        headers: ['Category', '2024 Sales', '2025 Sales', 'Margin %'],
        rows: [
          ['Bikes', '820,000', '910,000', '32%'],
          ['Accessories', '140,000', '175,000', '45%'],
          ['Clothing', '95,000', '88,000', '8%'],
        ],
      },
      code:
        '1. Insert Matrix. Rows: Product[Category], Product[Subcategory]. Columns: \'Date\'[Year].\n   Values: [Total Sales], [Profit Margin %].\n2. Turn on Stepped layout (Format > Row headers > Options).\n3. Field dropdown on Total Sales > Conditional formatting > Data bars.\n4. Profit Margin % > Conditional formatting > Background color > Format style: Field value > What field: [Margin Colour].\n5. Format > Row subtotals and Column subtotals: On.\n6. Use the drill buttons (+/-) to expand categories.\n\nMargin Colour =\nVAR m = [Profit Margin %]\nRETURN SWITCH ( TRUE (), m < 0.10, "#F8D7DA", m < 0.25, "#FFF3CD", "#D4EDDA" )',
      explanation:
        'A matrix gives exact values with hierarchy, while data bars add a quick visual comparison and colours highlight problems (Clothing 8% margin turns red). The colour logic lives in a DAX measure, so thresholds can be changed in one place.',
    },
    {
      title: 'Profit bridge with a waterfall chart',
      scenario: 'Explain how 2025 sales changed versus 2024 by category.',
      code:
        '1. Insert Waterfall chart.\n2. Category: \'Date\'[Year] (filter to 2024 and 2025).\n3. Breakdown: Product[Category].  Y-axis: [Total Sales].\n4. Format > Breakdown: Max breakdowns = 5 (others grouped).\n5. Colours: Increase green, Decrease red, Total grey.\n\nResult: bar for 2024 total, then floating bars showing +90K Bikes, +35K Accessories, -7K Clothing, ending at the 2025 total.',
      explanation:
        'With Breakdown, the waterfall shows which categories drove the change between the two years - a very common executive question ("why did sales go up?"). Increase/decrease colours make the story instant.',
    },
    {
      title: 'KPI visual: monthly sales vs target',
      scenario: 'Show this month\'s sales vs target, with green/red status and a trend.',
      code:
        'Sales Target = [Total Sales LY] * 1.10      -- target = last year + 10%\nTotal Sales LY = CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( \'Date\'[Date] ) )\n\n1. Insert KPI visual.\n2. Value: [Total Sales]. Trend axis: \'Date\'[YearMonth]. Target: [Sales Target].\n3. Format > Target label: show "Goal" and distance as percent.\n4. Color coding: Direction = High is good.',
      explanation:
        'The KPI visual shows the value for the latest period on the trend axis and compares it to the target. The background area shows the trend. Status is green when value >= target. Note that the KPI visual needs a trend axis field to determine the "current" value.',
    },
    {
      title: 'Scatter chart for product performance',
      scenario: 'Identify products with high sales but low margin.',
      code:
        '1. Insert Scatter chart.\n2. Values (Details): Product[ProductName].\n3. X-axis: [Total Sales].  Y-axis: [Profit Margin %].  Size: [Total Quantity].\n4. Legend: Product[Category].\n5. Analytics pane: add X-axis average line and Y-axis average line to create four quadrants.\n6. Play axis (optional): \'Date\'[Year] to animate.',
      explanation:
        'Each dot is a product. Average lines divide the chart into quadrants: bottom-right (high sales, low margin) are pricing review candidates; top-left (low sales, high margin) are growth opportunities. Scatter is the right visual for relationships between two measures.',
    },
  ],
  interview: [
    {
      q: 'How do you decide which visual to use?',
      a: 'I start with the business question and the data type. Comparison across categories -> bar/column; trend over time -> line; two measures with different scales -> combo; part-to-whole -> stacked bar or treemap (pie only for very few categories); relationship -> scatter; geography -> map; process stages -> funnel; contribution/bridge -> waterfall; single KPI -> card/KPI; detail -> table/matrix. I also consider the audience (executives want KPIs and trends, analysts want detail) and the number of categories.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between a table and a matrix?',
      a: 'A table is a flat grid: each field is a column, one row per unique combination, and it has a single total row. A matrix is a pivot: it has rows, columns and values, supports hierarchies with expand/collapse and drill-down, row and column subtotals, and stepped layout. Use a table for detail lists, a matrix for cross-tab analysis (Category by Year).',
      level: 'Easy',
    },
    {
      q: 'Why are pie charts often discouraged? When are they acceptable?',
      a: 'People compare angles and areas poorly, so differences between similar slices are hard to see, and many slices become unreadable and need a legend. They are acceptable for a simple part-to-whole with 2-5 categories where the message is "roughly how big is each share" (e.g. Online vs Store = 65/35). For precise comparison, a sorted bar chart is better.',
      level: 'Easy',
    },
    {
      q: 'Explain the different ways to apply conditional formatting in a table or matrix.',
      a: 'Background colour, font colour, data bars, icons and web URL. Colour rules can be: Gradient (2 or 3 colour scale based on min/mid/max), Rules (numeric ranges -> colours, including percent-based rules), or Field value (a measure or column returns the colour as text such as "#FF0000" or "Red"). Field value is the most flexible because logic is in DAX and can combine several measures (e.g. red if margin < 10% AND sales falling).',
      level: 'Medium',
    },
    {
      q: 'What is the difference between a KPI visual and a gauge?',
      a: 'The KPI visual shows a value, a target, a status indicator (colour and icon) and a trend area over a time axis - compact and good for dashboards. A gauge shows one value on a semicircular scale with min, max and a target needle - attractive but space-consuming and without trend. A KPI visual needs a trend axis field; a gauge does not.',
      level: 'Medium',
    },
    {
      q: 'When would you use a waterfall chart?',
      a: 'To explain how a starting value becomes an ending value through incremental positive and negative changes: profit bridge (revenue -> costs -> profit), year-over-year sales change broken down by category (using the Breakdown field), cash flow, headcount movement (start + hires - leavers = end).',
      level: 'Medium',
    },
    {
      q: 'Scenario: A map visual places "Paris" in the USA instead of France. How do you fix it?',
      a: 'Geocoding is ambiguous. Fixes: set the Data category of the column (Column tools > Data category: City) and add a hierarchy Country > City in the Location well; create a combined column like City & ", " & Country and set its Data category to Place; or use Latitude and Longitude columns for exact positions. Also make sure the country names are standardized.',
      level: 'Medium',
    },
    {
      q: 'Scenario: Month names on your line chart appear in alphabetical order. How do you fix it?',
      a: 'Select \'Date\'[MonthName] in Data/Table view, Column tools > Sort by column > MonthNumber. Then in the visual, sort axis by MonthName ascending. Also confirm the X-axis type (categorical for month names). Alternatively, use the date hierarchy or a YearMonth column sorted by a YearMonth number key.',
      level: 'Easy',
    },
    {
      q: 'What are custom visuals and what risks should you consider?',
      a: 'Custom visuals are third-party (or self-developed) visuals imported from AppSource or a .pbiviz file. Risks: they may not be supported in all features (export, PDF, mobile), may break with updates, and uncertified visuals could send data to external services. Prefer certified visuals, check the publisher, and follow tenant admin settings - admins can block uncertified visuals or deploy approved organizational visuals.',
      level: 'Medium',
    },
    {
      q: 'What is a report theme and why use it?',
      a: 'A theme (View > Themes) defines data colours, background, foreground, fonts and default formatting for visuals. Using a JSON theme ensures brand consistency across all reports, saves formatting time and makes changes global (change a colour once). You can customise the current theme in Desktop and export it as JSON for reuse.',
      level: 'Easy',
    },
    {
      q: 'Scenario: A stakeholder wants 25 visuals on one page. What do you do?',
      a: 'Explain the trade-offs: too many visuals hurt readability and performance (each visual sends at least one query). Propose a design: a summary page with key KPIs and 4-6 main visuals, then detail pages reachable through drill-through, tooltips, bookmarks or field parameters. Group related visuals, use a matrix instead of many cards, and use report page tooltips for extra details. Prototype both and agree based on the decisions the user must make.',
      level: 'Hard',
    },
    {
      q: 'What are the key report design principles you follow?',
      a: 'Know the audience and the purpose of each page; most important KPIs top-left (Z-pattern); limited number of visuals; consistent colours with meaning (e.g. grey for prior year, red only for bad); remove clutter (gridlines, borders, 3D); aligned grid layout with consistent spacing; insight-oriented titles; consistent number formats and units; accessibility (contrast, alt text, tab order, not colour-only cues); and performance (fewer visuals, efficient measures).',
      level: 'Medium',
    },
    {
      q: 'How do you make a chart title dynamic?',
      a: 'Create a measure returning text, e.g. `Sales Title = "Sales for " & SELECTEDVALUE(\'Date\'[Year], "All Years")`. Then Format > General > Title > Text > fx (conditional formatting) > Field value > select the measure. The title updates with slicers.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Build a page with four KPI cards: Total Sales, Total Profit, Profit Margin %, Orders. Format numbers in millions with 1 decimal (except Orders and %).',
      hint: 'Create explicit measures first; use Format > Callout value > Display units.',
      solution:
        'Total Sales = SUM ( Sales[SalesAmount] )\nTotal Profit = SUM ( Sales[SalesAmount] ) - SUM ( Sales[Cost] )\nProfit Margin % = DIVIDE ( [Total Profit], [Total Sales] )\nOrders = DISTINCTCOUNT ( Sales[OrderID] )\n\nInsert 4 Card visuals. For Sales/Profit: Callout value > Display units: Millions, Value decimal places: 1. Margin: set measure format to Percentage, 1 decimal. Orders: whole number, display units None. Align: select all four > Format > Align top, Distribute horizontally.',
    },
    {
      task: 'Create a line chart of monthly sales for 2024 and 2025 as two lines, with month names in correct order.',
      hint: 'Legend = Year; sort month name by month number.',
      solution:
        '1. Sort \'Date\'[MonthName] by \'Date\'[MonthNumber] (Column tools > Sort by column).\n2. Line chart: X-axis = \'Date\'[MonthName], Y-axis = [Total Sales], Legend = \'Date\'[Year].\n3. Filter Year to 2024 and 2025.\n4. Sort axis by MonthName ascending.\nResult: two lines Jan-Dec for easy YoY comparison.',
    },
    {
      task: 'In a table of products, colour the Profit Margin % cell red (<10%), amber (10-25%) and green (>=25%) using rules, then redo it with a field value measure.',
      hint: 'Conditional formatting > Background color.',
      solution:
        'Rules: Format style = Rules; If value >= 0 and < 0.1 -> red; >= 0.1 and < 0.25 -> amber; >= 0.25 and <= 1 -> green (Number type).\n\nField value:\nMargin Colour =\nVAR m = [Profit Margin %]\nRETURN SWITCH ( TRUE (), ISBLANK ( m ), BLANK (), m < 0.10, "#D32F2F", m < 0.25, "#F9A825", "#2E7D32" )\nFormat style = Field value, What field = [Margin Colour].',
    },
    {
      task: 'Build a funnel of a sales pipeline with stages Lead (1000), Qualified (600), Proposal (250), Won (90). Data is in a Pipeline table (Stage, StageOrder, Count).',
      hint: 'Sort stages by StageOrder.',
      solution:
        '1. Enter data: Pipeline table with the 4 rows.\n2. Sort Pipeline[Stage] by Pipeline[StageOrder].\n3. Funnel visual: Category = Stage, Values = Sum of Count (or a measure).\n4. Data labels show value and % of first stage (Won = 9% of Leads).\nInsight: biggest drop is Qualified -> Proposal (600 -> 250).',
    },
    {
      task: 'Import a certified custom visual (e.g. Bullet Chart) from AppSource and display Sales vs Target per Category.',
      hint: 'Visualizations pane > ... > Get more visuals.',
      solution:
        '1. Visualizations pane > ... (Get more visuals) > search "Bullet Chart" > choose a certified one > Add.\n2. Category = Product[Category], Value = [Total Sales], Target value = [Sales Target].\n3. Configure bands (e.g. needs improvement, satisfactory, good) based on % of target.\nBullet charts show actual vs target with qualitative ranges in far less space than gauges.',
    },
    {
      task: 'Create and apply a custom theme with your company colours (#1F4E79, #2E86C1, #F39C12, #7F8C8D).',
      hint: 'JSON file with name and dataColors.',
      solution:
        'Save as corporate.json:\n{\n  "name": "Corporate",\n  "dataColors": ["#1F4E79", "#2E86C1", "#F39C12", "#7F8C8D"],\n  "background": "#FFFFFF",\n  "foreground": "#252423",\n  "tableAccent": "#1F4E79"\n}\nView > Themes > Browse for themes > select file. All visuals switch to the new palette. Or View > Themes > Customize current theme and Save current theme.',
    },
  ],
  quiz: [
    {
      question: 'Which visual is best for comparing sales of 18 products with long names?',
      options: ['Pie chart', 'Clustered bar chart', 'Gauge', 'Line chart'],
      answer: 1,
      explanation: 'A horizontal bar chart handles many categories and long labels, and lengths are easy to compare.',
    },
    {
      question: 'Which visual shows ranking changes of categories across time periods?',
      options: ['Ribbon chart', 'Treemap', 'Funnel', 'Card'],
      answer: 0,
      explanation: 'The ribbon chart orders categories by value in each period and connects them with ribbons to show rank changes.',
    },
    {
      question: 'You need Sales (currency) and Margin % on one chart. Which visual?',
      options: ['Stacked area', 'Line and clustered column chart', '100% stacked bar', 'Donut'],
      answer: 1,
      explanation: 'A combo chart with a secondary axis handles two measures with different units.',
    },
    {
      question: 'Which conditional formatting option lets a DAX measure return the colour code?',
      options: ['Gradient', 'Rules', 'Field value', 'Data bars'],
      answer: 2,
      explanation: 'Format style "Field value" uses a measure/column that returns a colour such as "#FF0000".',
    },
    {
      question: 'Which field is required for the KPI visual to work as intended?',
      options: ['Legend', 'Trend axis', 'Small multiples', 'Tooltips'],
      answer: 1,
      explanation: 'The KPI visual uses the Trend axis to determine the current value and draw the trend; Value and Target are also used.',
    },
    {
      question: 'What is the main advantage of a JSON theme?',
      options: ['Faster data refresh', 'Consistent colours and formatting across reports', 'Enables row-level security', 'Adds new data sources'],
      answer: 1,
      explanation: 'Themes standardise colours, fonts and visual defaults for brand consistency.',
    },
  ],
};
