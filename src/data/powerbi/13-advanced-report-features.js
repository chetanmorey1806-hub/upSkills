export default {
  id: 'advanced-report-features',
  title: 'Advanced Report Features (Parameters, AI Visuals, Analytics, Mobile, Paginated)',
  level: 'Advanced',
  day: 13,
  duration: '4 hours',
  summary:
    "Use Power BI's advanced reporting features: what-if and field parameters, dynamic titles, AI visuals (Q&A, Key Influencers, Decomposition Tree, Smart Narrative), anomaly detection, forecasting, small multiples, mobile layouts and paginated reports. These features separate a basic report builder from a strong Power BI developer.",
  objectives: [
    'Create what-if parameters for scenario analysis and field parameters for dynamic axes and measures',
    'Write DAX for dynamic titles and labels',
    'Use AI visuals: Q&A, Key Influencers, Decomposition Tree and Smart Narrative, and explain their limitations',
    'Add trend lines, forecasts, reference lines and anomaly detection from the Analytics pane',
    'Use small multiples and design a mobile layout',
    'Explain when to use paginated reports instead of Power BI reports',
  ],
  theory: [
    {
      heading: 'What-if parameters',
      content:
        "A **what-if parameter** lets users change an input value with a slider and see the impact on measures. Modeling > New parameter > **Numeric range**: name, data type, minimum, maximum, increment, default.\n\nPower BI creates:\n- a calculated table using **GENERATESERIES** (e.g. `Discount % = GENERATESERIES(0, 0.30, 0.01)`),\n- a measure that reads the selected value with **SELECTEDVALUE** (e.g. `Discount % Value = SELECTEDVALUE('Discount %'[Discount %], 0)`),\n- optionally a single-value slicer.\n\nYou then reference the value measure in your own measures for scenario analysis (price increase, discount, growth rate, FX rate).",
      syntax:
        'Discount % = GENERATESERIES ( 0, 0.30, 0.01 )\nDiscount % Value = SELECTEDVALUE ( \'Discount %\'[Discount %], 0 )\n\nSales After Discount = [Total Sales] * ( 1 - [Discount % Value] )\nProfit After Discount = [Sales After Discount] - [Total Cost]',
      tip: "The parameter table is disconnected (no relationships), so it does not filter the model - it only provides a value to measures.",
    },
    {
      heading: 'Field parameters',
      content:
        "**Field parameters** (Modeling > New parameter > **Fields**) let users choose which **dimension** or **measure** a visual uses - for example a slicer to switch the axis between Category, Country and Segment, or the values between Sales, Profit and Quantity.\n\nPower BI creates a calculated table using the **NAMEOF** function with three columns: display name, field reference, and order. You put the parameter column on the visual axis/values and the slicer lets users switch.\n\nBenefits: fewer visuals and pages, no bookmarks needed for 'switch measure' scenarios, and users can build their own view. Field parameters work in most visuals; you can allow multi-select so users add several fields to a table.",
      syntax:
        'Axis Choice = {\n    ( "Category", NAMEOF ( Product[Category] ), 0 ),\n    ( "Country",  NAMEOF ( Customer[Country] ), 1 ),\n    ( "Segment",  NAMEOF ( Customer[Segment] ), 2 )\n}',
      tip: "Before field parameters, the same thing required bookmarks or a SWITCH measure with a disconnected table - field parameters are now the preferred approach for switching dimensions.",
    },
    {
      heading: 'Dynamic titles and labels with DAX',
      content:
        "Most text properties (titles, subtitles, button text, data label text, card reference labels) have an **fx** button. You can bind them to a measure that returns text, making the report react to the user's selections.\n\nUseful functions: **SELECTEDVALUE** (single selection or a default), **ISFILTERED** / **ISCROSSFILTERED**, **HASONEVALUE**, **CONCATENATEX** (list multiple selections), **FORMAT** (format numbers/dates inside text), **COUNTROWS(VALUES(...))**.",
      syntax:
        'Sales Title =\nVAR Yr = SELECTEDVALUE ( \'Date\'[Year], "All Years" )\nVAR Ctry =\n    IF (\n        ISFILTERED ( Customer[Country] ),\n        CONCATENATEX ( VALUES ( Customer[Country] ), Customer[Country], ", " ),\n        "All Countries"\n    )\nRETURN\n    "Sales Trend - " & Yr & " - " & Ctry',
      tip: "Limit CONCATENATEX output: if more than 3 items are selected, show 'Multiple countries' instead of a long string.",
    },
    {
      heading: 'AI visuals: Q&A, Key Influencers, Decomposition Tree, Smart Narrative',
      content:
        "**Q&A visual** - users type natural language questions ('total sales by category in 2025 as bar chart') and Power BI builds a visual. Improve it with synonyms in the model (Model view > Q&A setup / linguistic schema), clear table/column names, and suggested questions. A Q&A answer can be turned into a standard visual.\n\n**Key Influencers** - analyses which factors drive a metric up or down or influence a categorical outcome (e.g. 'What influences Profit Margin to be Low?'). Shows top influencers, top segments and how much each factor changes the outcome. Uses machine learning (logistic/linear regression, decision trees) at the granularity of the 'Explain by' fields.\n\n**Decomposition Tree** - breaks down a measure across dimensions in any order the user chooses, with AI splits (High value / Low value) that pick the dimension contributing most. Great for root cause analysis ('why are sales in Germany down?').\n\n**Smart Narrative / Narrative visual** - generates a text summary of the page or visual (trends, top items, changes) with dynamic values that update with filters. The newer **Narrative with Copilot** visual uses Copilot to write summaries (requires Copilot-enabled capacity).",
      points: [
        'AI visuals rely on clean, well-modelled data and meaningful names',
        'Key Influencers needs enough rows per category to find significant patterns',
        'Explain correlations, not causation, to stakeholders',
        'Some AI features are not supported with certain data sources (e.g. some DirectQuery/live connection scenarios) or in Publish to web',
      ],
    },
    {
      heading: 'Analytics pane: reference lines, trend, forecast and anomaly detection',
      content:
        "The **Analytics** pane (magnifying glass tab) adds statistical lines to supported visuals:\n\n- **Constant line**, **Min/Max/Average/Median/Percentile lines** - e.g. average sales line on a column chart.\n- **Trend line** - linear trend on line/scatter/column charts with a continuous axis.\n- **Forecast** - available on **line charts** with a continuous date axis and a single measure. Settings: forecast length (e.g. 6 months), confidence interval (e.g. 95%), seasonality (auto or manual, e.g. 12 points), and **ignore the last N points** (to exclude incomplete periods or to validate the forecast against actual data). It uses exponential smoothing.\n- **Find anomalies** - on line charts with a date axis; detects unusual points with an expected range band and lets you see an AI explanation of possible causes. Adjust sensitivity.\n- **Error bars** - show uncertainty ranges on line/bar charts.\n\nThe forecast is visual-only: it is not a measure and cannot be used in DAX or exported as a model value.",
      tip: "Forecast does not work with a categorical axis (e.g. month names) or with multiple measures/legend - change the X-axis to the Date column and type Continuous.",
    },
    {
      heading: 'Small multiples',
      content:
        "**Small multiples** split one visual into a grid of identical small charts, one per value of a field (e.g. Sales trend per Country). Drag a field into the **Small multiples** well of a bar, column, line, area or combo chart. Format options: rows/columns of the grid, shared or independent Y-axis, titles.\n\nThey make comparison across categories easier than a single chart with many lines (spaghetti) or many separate visuals - and they are one visual (fewer queries).",
      tip: "Use a shared Y-axis to compare magnitudes; use independent axes only to compare shapes/patterns.",
    },
    {
      heading: 'Mobile layout',
      content:
        "Power BI reports are designed for landscape screens. For phones, create a **mobile layout**: View > **Mobile layout**. A portrait canvas appears; drag visuals from the 'Page visuals' pane onto it, resize and reorder them. Visuals keep their data and interactions; you can apply mobile-specific formatting.\n\nWhen users open the report in the Power BI mobile app in portrait mode, the mobile layout is used automatically (if one exists); in landscape they see the standard layout. Dashboards also have a phone view in the Service.\n\nBest practice for mobile: KPI cards first, few visuals, larger fonts, slicers as dropdowns or in a separate area, avoid wide tables.",
    },
    {
      heading: 'Paginated reports overview',
      content:
        "**Paginated reports** (.rdl files, built with **Power BI Report Builder**, based on SQL Server Reporting Services technology) are designed for **pixel-perfect, printable** output: invoices, statements, regulatory reports, long lists that span many pages.\n\nKey differences from Power BI (.pbix) reports:",
      points: [
        'Paginated: fixed layout, prints all rows across pages, exports cleanly to PDF/Excel/Word; Power BI reports: interactive, screen-optimised, scrollable visuals',
        'Paginated reports use parameters (often cascading) and datasets with queries (SQL, DAX, or a Power BI semantic model)',
        'Paginated reports can now be published to workspaces on Pro/PPU and Premium/Fabric capacity (since 2022, Pro licence is sufficient for publishing to non-Premium workspaces)',
        'Use paginated reports for operational, print-ready reports; use Power BI reports for exploration and dashboards',
        'Subscriptions can email paginated reports as attachments (PDF/Excel), including data-driven-like dynamic per-recipient subscriptions in Fabric/Premium',
      ],
      tip: "Interview line: 'If the requirement is export all 50,000 invoice lines to a formatted PDF each month, I would build a paginated report, not a .pbix report.'",
    },
  ],
  examples: [
    {
      title: 'Price increase what-if analysis',
      scenario: 'Sales managers want to see the impact on revenue and profit if prices increase by 0-20%, assuming 0.5% volume loss for every 1% price increase.',
      code:
        '-- Created via Modeling > New parameter > Numeric range (0 to 0.20, step 0.01)\nPrice Increase = GENERATESERIES ( 0, 0.20, 0.01 )\nPrice Increase Value = SELECTEDVALUE ( \'Price Increase\'[Price Increase], 0 )\n\nProjected Sales =\nVAR Inc = [Price Increase Value]\nVAR VolumeFactor = 1 - ( Inc * 0.5 )\nRETURN\n    SUMX (\n        Sales,\n        Sales[Quantity] * VolumeFactor * Sales[UnitPrice] * ( 1 + Inc )\n    )\n\nProjected Profit =\nVAR Inc = [Price Increase Value]\nVAR VolumeFactor = 1 - ( Inc * 0.5 )\nRETURN\n    [Projected Sales] - [Total Cost] * VolumeFactor\n\nSales Impact = [Projected Sales] - [Total Sales]',
      result: 'With 10%: volume factor 0.95, price factor 1.10 -> Projected Sales = 1.045 x Total Sales (+4.5%).',
      explanation:
        'The slider writes nothing to the model; SELECTEDVALUE simply reads the chosen value. Measures recompute per query, so every visual updates instantly. Cost scales only with volume (not price). Format the parameter as Percentage and show a single-value slider.',
    },
    {
      title: 'Field parameter to switch the measure and the axis',
      scenario: 'One bar chart should let users choose the measure (Sales, Profit, Quantity) and the dimension (Category, Country, Segment).',
      code:
        'Metric Choice = {\n    ( "Sales",    NAMEOF ( [Total Sales] ),    0 ),\n    ( "Profit",   NAMEOF ( [Total Profit] ),   1 ),\n    ( "Quantity", NAMEOF ( [Total Quantity] ), 2 )\n}\n\nAxis Choice = {\n    ( "Category", NAMEOF ( Product[Category] ), 0 ),\n    ( "Country",  NAMEOF ( Customer[Country] ), 1 ),\n    ( "Segment",  NAMEOF ( Customer[Segment] ), 2 )\n}\n\nSteps: Modeling > New parameter > Fields (add the fields; Power BI writes the DAX).\nBar chart: Y-axis = Axis Choice, X-axis = Metric Choice.\nTwo slicers (single select): Metric Choice and Axis Choice.',
      explanation:
        'Each slicer selection swaps the field in the visual. This replaces 9 separate charts or a complex bookmark setup. Tip: a dynamic title can use SELECTEDVALUE(\'Metric Choice\'[Metric Choice]) to show "Sales by Country".',
    },
    {
      title: 'Dynamic title for a selected period and measure',
      scenario: 'Title should read e.g. "Profit by Country - 2025 (Q1, Q2)".',
      code:
        'Chart Title =\nVAR Metric = SELECTEDVALUE ( \'Metric Choice\'[Metric Choice], "Sales" )\nVAR Axis   = SELECTEDVALUE ( \'Axis Choice\'[Axis Choice], "Category" )\nVAR Yr     = SELECTEDVALUE ( \'Date\'[Year], "All Years" )\nVAR QtrCount = COUNTROWS ( VALUES ( \'Date\'[Quarter] ) )\nVAR Qtrs =\n    IF (\n        ISFILTERED ( \'Date\'[Quarter] ) && QtrCount <= 3,\n        " (" & CONCATENATEX ( VALUES ( \'Date\'[Quarter] ), \'Date\'[Quarter], ", ", \'Date\'[Quarter], ASC ) & ")",\n        ""\n    )\nRETURN\n    Metric & " by " & Axis & " - " & Yr & Qtrs\n\nApply: Format > General > Title > Text > fx > Field value > Chart Title.',
      explanation:
        'SELECTEDVALUE returns the value if exactly one is selected, otherwise the default. CONCATENATEX lists selected quarters sorted ascending, only when 1-3 are filtered to keep the title short.',
    },
    {
      title: 'Root cause analysis with the Decomposition Tree',
      scenario: 'Sales fell in Q3. The regional director asks where the drop comes from.',
      code:
        '1. Create a measure: Sales Change vs PQ = [Total Sales] - CALCULATE ( [Total Sales], DATEADD ( \'Date\'[Date], -1, QUARTER ) )\n2. Insert Decomposition tree. Analyze: [Total Sales] (or the change measure). Explain by: Customer[Country], Product[Category], Customer[Segment], Product[ProductName].\n3. Filter the page to Q3.\n4. Click "+" next to Total Sales > choose "Low value" (AI split) - Power BI picks the dimension with the lowest-value item, e.g. Country = Germany.\n5. Continue: Germany > Category > Bikes > Segment > Corporate.\n6. Lock levels for consumers if you want a fixed path.',
      explanation:
        'The Decomposition Tree allows ad hoc drill across dimensions in any order, while AI splits suggest the next best dimension. It quickly reveals that the drop is concentrated in, for example, Corporate bike customers in Germany.',
    },
    {
      title: 'Key Influencers for low profit margin orders',
      scenario: 'Find which factors make an order more likely to be low margin (< 15%).',
      code:
        '1. Calculated column in Sales:\n   Margin Flag =\n   IF ( DIVIDE ( Sales[SalesAmount] - Sales[Cost], Sales[SalesAmount] ) < 0.15, "Low", "Normal" )\n2. Insert Key influencers visual.\n3. Analyze: Sales[Margin Flag]. Explain by: Product[Category], Customer[Segment], Customer[Country], Sales[Quantity].\n4. Select "What influences Margin Flag to be Low".\n5. Review Key influencers tab (e.g. "Segment is Wholesale: 2.4x more likely to be Low") and Top segments tab.',
      explanation:
        'For a categorical target, Key Influencers uses logistic regression to compare the likelihood of the outcome per factor value. Numeric Explain-by fields are binned or treated as continuous. Results show correlation; validate with the business before acting.',
    },
    {
      title: 'Forecast and anomaly detection on a line chart',
      scenario: 'Forecast the next 6 months of sales and detect unusual months.',
      code:
        '1. Line chart: X-axis = \'Date\'[Date] or a month-start date column (Type: Continuous), Y-axis = [Total Sales]. No legend.\n2. Analytics pane > Forecast > On. Units: Points, Forecast length: 6, Ignore last: 1 (current incomplete month), Confidence interval: 95%, Seasonality: 12.\n3. Analytics pane > Find anomalies > On. Sensitivity: 70%.\n4. Click an anomaly point to view possible explanations (Explain by fields).',
      explanation:
        'Forecast uses exponential smoothing with seasonality; the shaded band is the confidence interval. Ignoring the last point prevents a partial month from dragging the forecast down. Anomaly detection highlights points outside the expected range and suggests contributing dimensions.',
    },
  ],
  interview: [
    {
      q: 'What is a what-if parameter and how does it work internally?',
      a: 'It is a disconnected calculated table generated with GENERATESERIES (min, max, increment) plus a measure using SELECTEDVALUE to read the selected value (with a default). A slider slicer lets users pick the value. Measures reference the value measure to calculate scenarios (e.g. Sales * (1 + growth)). Because it is disconnected, it does not filter data; it only feeds a value into measures.',
      level: 'Medium',
    },
    {
      q: 'What are field parameters and how are they different from what-if parameters?',
      a: 'Field parameters let users switch which columns or measures a visual uses (dynamic axis/measure). They are a calculated table built with NAMEOF references, and the visual uses the parameter column. What-if parameters provide a numeric input value for calculations. Field parameters change the structure of visuals; what-if parameters change values inside measures.',
      level: 'Medium',
    },
    {
      q: 'How do you create a dynamic title that reflects slicer selections?',
      a: 'Write a measure returning text using SELECTEDVALUE (single value or default), ISFILTERED, and CONCATENATEX for multiple selections, then bind the visual title via Format > Title > fx > Field value. Example: "Sales for " & SELECTEDVALUE(\'Date\'[Year], "All Years").',
      level: 'Easy',
    },
    {
      q: 'Explain Key Influencers vs Decomposition Tree.',
      a: 'Key Influencers uses statistical models to rank which factors most influence a metric or outcome (e.g. "customers in segment X are 2.4x more likely to churn"), including top segments. Decomposition Tree lets users break down a measure hierarchically across dimensions in any order, with optional AI splits for highest/lowest value. Key Influencers answers "what drives it?", Decomposition Tree answers "where does it come from?".',
      level: 'Medium',
    },
    {
      q: 'Scenario: The Forecast option is missing in the Analytics pane. Why?',
      a: 'Forecast requires a line chart with a continuous date/numeric X-axis and a single measure without a legend or secondary values. Common causes: X-axis is categorical (e.g. month name text), there are multiple measures or a legend, the visual is not a line chart, or the axis uses a hierarchy with drill state. Fix: use a date column, set the X-axis type to Continuous, keep one measure.',
      level: 'Hard',
    },
    {
      q: 'What does "Ignore last N points" do in forecasting?',
      a: 'It excludes the last N data points from the model training. Use it to exclude an incomplete current period (partial month), or to back-test the forecast: hide the last 3 known months and compare the forecast with actual values to judge accuracy.',
      level: 'Medium',
    },
    {
      q: 'When would you use a paginated report instead of a Power BI report?',
      a: 'When the output must be pixel-perfect and printable, span multiple pages, include all detail rows, or be exported/emailed as PDF/Excel/Word - invoices, statements, regulatory reports, operational lists. They are built in Power BI Report Builder (.rdl), use parameters and query-based datasets (including Power BI semantic models). Power BI reports are for interactive exploration and dashboards.',
      level: 'Medium',
    },
    {
      q: 'What are small multiples and when are they useful?',
      a: 'Small multiples repeat a visual for each value of a field in a grid (e.g. sales trend per region). They are useful to compare patterns across many categories without a cluttered single chart or many separate visuals. Supported on bar, column, line, area and combo charts. Use a shared axis to compare magnitudes.',
      level: 'Easy',
    },
    {
      q: 'How do you improve the Q&A experience for users?',
      a: 'Use clear, business-friendly table and column names; add synonyms (e.g. revenue = Total Sales); hide technical columns; set data categories and default summarization; review the Q&A setup (Teach Q&A, review questions asked by users); add suggested questions; ensure relationships are correct. Q&A is only as good as the semantic model.',
      level: 'Medium',
    },
    {
      q: 'How does the mobile layout work?',
      a: 'In Desktop, View > Mobile layout opens a portrait canvas where you place existing page visuals (they keep data, filters and interactions) and can format them for mobile. When a user opens the report on a phone in portrait mode in the Power BI mobile app, the mobile layout is shown; otherwise the standard layout is used. Each page has its own mobile layout.',
      level: 'Easy',
    },
    {
      q: 'Scenario: Management asks for a "what if we reduce marketing spend by X%" slider affecting projected revenue with a known elasticity. How do you implement it?',
      a: 'Create a numeric what-if parameter (e.g. 0 to 50% in 1% steps). Projected Revenue = [Total Sales] * (1 - [Spend Cut Value] * Elasticity), where Elasticity is either a constant or another parameter so users can test assumptions. Display current vs projected in cards and a combo chart, with a dynamic title stating the assumption. Explain that it is a model-based scenario, not a forecast.',
      level: 'Hard',
    },
    {
      q: 'What is Smart Narrative and what are its limitations?',
      a: 'Smart Narrative (Narrative visual) automatically generates text describing key trends, top/bottom items and changes, with dynamic values that update with filters; you can edit the text and insert your own dynamic values (measures). The Copilot-based narrative needs Copilot-enabled capacity and permissions. Limitations: generic insights, needs a good model, and some data source modes/publish-to-web are not supported. Always review generated text for accuracy.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create a "Growth Rate" what-if parameter from -10% to +30% (step 1%, default 5%) and a measure "Next Year Sales" = current sales grown by the selected rate.',
      hint: 'Modeling > New parameter > Numeric range.',
      solution:
        'Growth Rate = GENERATESERIES ( -0.10, 0.30, 0.01 )\nGrowth Rate Value = SELECTEDVALUE ( \'Growth Rate\'[Growth Rate], 0.05 )\nNext Year Sales = [Total Sales] * ( 1 + [Growth Rate Value] )\nFormat Growth Rate as Percentage; use a single-value slider.',
    },
    {
      task: 'Create a field parameter to switch a table between showing Customer[City], Customer[Country] and Customer[Segment] (allow multiple selections).',
      hint: 'New parameter > Fields; then multi-select slicer.',
      solution:
        'Customer Fields = {\n    ( "City", NAMEOF ( Customer[City] ), 0 ),\n    ( "Country", NAMEOF ( Customer[Country] ), 1 ),\n    ( "Segment", NAMEOF ( Customer[Segment] ), 2 )\n}\nAdd the parameter to a table with [Total Sales]; slicer on Customer Fields with multi-select enabled. Selecting Country + Segment shows both columns.',
    },
    {
      task: 'Write a card subtitle measure "vs LY" that shows e.g. "+12.4% vs LY" in text, or "No prior year" when last year is blank.',
      hint: 'FORMAT with a custom format string.',
      solution:
        'vs LY Text =\nVAR Cur = [Total Sales]\nVAR PY = CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( \'Date\'[Date] ) )\nVAR Pct = DIVIDE ( Cur - PY, PY )\nRETURN\n    IF ( ISBLANK ( PY ), "No prior year", FORMAT ( Pct, "+0.0%;-0.0%" ) & " vs LY" )',
    },
    {
      task: 'Add an average line, a 12-month trend line, and a 3-month forecast with 95% confidence to a monthly sales line chart.',
      hint: 'Analytics pane; continuous date axis.',
      solution:
        'X-axis: month-start date (continuous). Analytics: Average line > Add (series Total Sales). Trend line > On. Forecast > On, Forecast length 3 points, Confidence interval 95%, Seasonality auto. Ensure no legend and only one measure.',
    },
    {
      task: 'Build a small multiples line chart showing monthly sales per Product Category with a shared Y-axis, 2 columns.',
      hint: 'Small multiples well.',
      solution:
        'Line chart: X-axis \'Date\'[YearMonth] or date, Y-axis [Total Sales], Small multiples: Product[Category]. Format > Small multiples > Layout: Columns = 2. Y-axis > Shared (default). Each category gets its own mini chart.',
    },
    {
      task: 'Design a mobile layout for your Sales Overview page with 3 KPI cards, the sales trend and a Year slicer.',
      hint: 'View > Mobile layout.',
      solution:
        'View > Mobile layout. From Page visuals, drag Year slicer (dropdown) to the top, then Sales/Profit/Margin cards (stack or side by side), then the line chart full width. Increase font sizes in mobile formatting. Publish and open in the mobile app in portrait to verify.',
    },
  ],
  quiz: [
    {
      question: 'Which DAX function does a numeric what-if parameter use to build its table?',
      options: ['CALENDAR', 'GENERATESERIES', 'SUMMARIZE', 'DATATABLE'],
      answer: 1,
      explanation: 'GENERATESERIES(min, max, increment) creates the parameter values.',
    },
    {
      question: 'Field parameter tables use which function to reference columns or measures?',
      options: ['NAMEOF', 'SELECTEDMEASURE', 'RELATED', 'PATH'],
      answer: 0,
      explanation: 'Field parameters store tuples (display name, NAMEOF(field), order).',
    },
    {
      question: 'Which visual lets users break down a measure across dimensions in any order, with AI high/low splits?',
      options: ['Key Influencers', 'Decomposition Tree', 'Q&A', 'Ribbon chart'],
      answer: 1,
      explanation: 'The Decomposition Tree supports ad hoc hierarchical breakdowns and AI splits.',
    },
    {
      question: 'Forecasting in the Analytics pane is available on which visual?',
      options: ['Clustered column chart', 'Line chart with a continuous axis', 'Pie chart', 'Matrix'],
      answer: 1,
      explanation: 'Forecast is supported for line charts with a continuous time axis and a single measure.',
    },
    {
      question: 'Which tool is used to author paginated reports?',
      options: ['Power BI Desktop', 'Power BI Report Builder', 'Tabular Editor', 'DAX Studio'],
      answer: 1,
      explanation: 'Paginated reports (.rdl) are authored in Power BI Report Builder.',
    },
    {
      question: 'What does SELECTEDVALUE(\'Date\'[Year], "All Years") return when 2024 and 2025 are both selected?',
      options: ['2024', '2025', '"All Years"', 'An error'],
      answer: 2,
      explanation: 'SELECTEDVALUE returns the alternate result when there is not exactly one value in context.',
    },
  ],
};
