export default {
  id: 'day-29-bar-column-line-area',
  title: 'Bar Chart, Column Chart, Line Chart, Area Chart',
  module: 'Module 5: Data Visualization',
  day: 29,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Bar, column, line and area charts are the workhorses of every Power BI report. Today you build each one with exact field wells, learn the clustered, stacked and 100% stacked variants, add a secondary axis, and format axes, data labels, colors and markers.',
  objectives: [
    'Build clustered, stacked and 100% stacked bar and column charts',
    'Build line charts with a legend and with a secondary Y-axis',
    'Build area and stacked area charts and know when they mislead',
    'Format axes, data labels, legend, colors, gridlines and markers in the Format pane',
    'Choose correctly between bar, column, line and area for a given question',
  ],
  theory: [
    {
      heading: 'Bar chart vs column chart',
      content:
        `Both compare values across categories using length.\n\n- **Bar chart** = horizontal bars. Categories go on the **Y-axis** well, values on the **X-axis** well. Best when category names are long ("Corporate - Pune Region") or there are many categories (10-30), because labels are readable and you can scroll vertically.\n- **Column chart** = vertical columns. Categories on **X-axis**, values on **Y-axis**. Best for few categories (up to ~10) and for short time periods (months of a year, quarters).\n\nWells (Build visual): **Y-axis / X-axis, Legend, Small multiples, Tooltips**.\n\nVariants:\n- **Clustered** - bars for each legend value stand side by side. Compare series within a category.\n- **Stacked** - legend values are stacked on one bar. Shows total and composition; only the bottom segment is easy to compare.\n- **100% stacked** - each bar is 100%; shows share only, not size.\n\nAnalogy: bars are like runners in parallel lanes - the longest one wins at a glance.`,
      points: [
        'Sort descending for rankings: visual header ... > Sort axis',
        'Always start the value axis at 0 (default) - never cut bars',
        'Use one color unless color has meaning (highlight one bar via Format > Visual > Bars/Columns > Colors > Show all)',
      ],
    },
    {
      heading: 'Line chart',
      content:
        `A line chart shows **change over a continuous dimension**, almost always time. Points are joined to show direction.\n\nWells: **X-axis** (date or month), **Y-axis** (one or more measures), **Secondary y-axis** (a measure on a different scale), **Legend** (split into one line per value, e.g. Year), **Small multiples**, **Tooltips**.\n\nKey settings:\n- X-axis **Type**: *Continuous* (proportional spacing for real dates, allows scrolling/zoom) or *Categorical* (one slot per value). Text fields like Date[Month] are always categorical.\n- **Markers** (Format > Visual > Markers) show each data point - useful with few points.\n- **Lines** section: stroke width, line style (solid/dashed/dotted), interpolation (linear, step, smooth).\n- **Analytics** tab: trend line, average line, constant (target) line, forecast.\n\nUse **Legend = Date[Year]** with **X-axis = Date[Month]** to overlay years (this year vs last year). Two measures with very different scales (Sales in lakhs, Quantity in units) need the **Secondary y-axis** well.`,
      tip: 'Do not use a line chart for unordered categories like City - the line suggests a trend between Pune and Mumbai that does not exist.',
    },
    {
      heading: 'Area chart and stacked area chart',
      content:
        `An **area chart** is a line chart with the space below the line filled. The fill emphasises **volume / magnitude** over time.\n\n- **Area chart** - each series is filled from zero; overlapping series are transparent. Good for one or two series (Sales vs Cost).\n- **Stacked area chart** - series stacked on top of each other; the top edge is the total. Good to show how a total is built by categories over time.\n- **100% stacked area chart** - share over time.\n\nWells are the same as the line chart (**X-axis, Y-axis, Legend, Small multiples, Tooltips**), without a secondary axis.\n\nCaution: in stacked area only the bottom series has a flat baseline; middle series are hard to read. If exact comparison per series matters, use a line chart.`,
    },
    {
      heading: 'Combo: line and column charts',
      content:
        `Power BI has **Line and clustered column chart** and **Line and stacked column chart**. Wells: **X-axis, Column y-axis, Line y-axis, Column legend, Small multiples, Tooltips**.\n\nTypical uses:\n- Columns = actual sales, line = target or last year\n- Columns = sales, line = margin % (line uses the secondary axis automatically)\n\nTurn the secondary axis on/off in Format > Visual > **Secondary y-axis**.`,
    },
    {
      heading: 'Format pane checklist for these charts',
      content: 'Select the chart > Format visual. The most used sections:',
      points: [
        '**X-axis / Y-axis**: Values (font, size, display units, decimal places), Title (on/off, text), Range (Minimum/Maximum, Invert range), Type for dates',
        '**Gridlines**: horizontal/vertical on/off, color, width, line style - keep light or off',
        '**Legend**: on/off, Position (Top, Bottom, Right...), Title',
        '**Columns / Bars**: Colors per series (Show all to color single bars), Spacing, Border',
        '**Lines** (line/area): color, width, style, Shade area (area transparency)',
        '**Markers**: on/off, shape, size, color',
        '**Data labels**: on/off, Display units (Thousands, Millions), Decimals, Position (Inside end, Outside end...), Background',
        '**General > Title**: text, font, alignment; **General > Effects**: background, border, shadow',
      ],
    },
  ],
  examples: [
    {
      title: 'Clustered bar chart: Sales by City',
      scenario: 'Rank cities by total sales with clean labels.',
      table: {
        headers: ['City', 'Total Sales'],
        rows: [
          ['Pune', '1,20,000'],
          ['Nashik', '1,10,000'],
          ['Nagpur', '14,000'],
          ['Mumbai', '13,000'],
        ],
      },
      steps: [
        'Report view > Visualizations > Build visual > Clustered bar chart',
        'Y-axis well: Customer[City]',
        'X-axis well: [Total Sales]',
        'Visual header ... > Sort axis > Total Sales; then ... > Sort axis > Sort descending',
        'Format visual > Visual > Data labels: On; Display units: Thousands; Value decimal places: 0',
        'Format visual > Visual > X-axis: Off (labels make it redundant); Gridlines: Off',
        'Format visual > General > Title > Text: Sales by City',
      ],
      result: 'Four horizontal bars, Pune on top (120K), then Nashik (110K), Nagpur (14K), Mumbai (13K).',
      explanation:
        'A horizontal bar chart is ideal for ranking. Data labels replace the axis and reduce clutter.',
    },
    {
      title: 'Stacked column chart: Sales by Year and Category',
      scenario: 'Show total sales per year and how each category contributes.',
      table: {
        headers: ['Year', 'Electronics', 'Furniture', 'Accessories', 'Total'],
        rows: [
          ['2023', '1,00,000', '12,000', '5,000', '1,17,000'],
          ['2024', '1,30,000', '8,000', '2,000', '1,40,000'],
        ],
      },
      steps: [
        'Build visual > Stacked column chart',
        'X-axis: Date[Year]; Y-axis: [Total Sales]; Legend: Product[Category]',
        'Format visual > Visual > X-axis > Type: Categorical (so 2023 and 2024 are labels, not a number range)',
        'Format visual > Visual > Data labels: On; Total labels: On',
        'Format visual > Visual > Columns > Colors: pick a fixed color for each category',
      ],
      result: 'Two columns: 2023 total label 117K and 2024 total label 140K, each split into three colored segments.',
      explanation:
        'Stacked columns show the total (height) and the composition (segments). Total labels show the column total on top.',
    },
    {
      title: '100% stacked bar chart: share of each year within a category',
      scenario: 'For each category, what share of its sales came in 2023 vs 2024?',
      table: {
        headers: ['Category', '2023 share', '2024 share'],
        rows: [
          ['Electronics', '43.48%', '56.52%'],
          ['Furniture', '60.00%', '40.00%'],
          ['Accessories', '71.43%', '28.57%'],
        ],
      },
      steps: [
        'Build visual > 100% stacked bar chart',
        'Y-axis: Product[Category]; X-axis: [Total Sales]; Legend: Date[Year]',
        'Format visual > Visual > Data labels: On (labels show values; hover tooltips show the %)',
        'Optional: to show % on labels, add a measure % of Category Year = DIVIDE([Total Sales], CALCULATE([Total Sales], ALL(\'Date\'))) and use it instead',
      ],
      result: 'Three full-length bars; Electronics is the only category where 2024 has the bigger share.',
      explanation:
        'Each bar is scaled to 100%, so you compare composition, not size. Accessories (7,000) and Electronics (2,30,000) look the same length.',
    },
    {
      title: 'Line chart: this year vs last year with Legend',
      scenario: 'Compare monthly sales of 2023 and 2024 on the same Jan-Dec axis.',
      table: {
        headers: ['Month', '2023', '2024'],
        rows: [
          ['Jan', '1,00,000', '20,000'],
          ['Feb', '5,000', '58,000'],
          ['Mar', '12,000', '62,000'],
        ],
      },
      steps: [
        'Make sure Date[Month] is sorted by Date[MonthNo] (Table view > select Month column > Column tools > Sort by column > MonthNo)',
        'Build visual > Line chart',
        'X-axis: Date[Month]; Y-axis: [Total Sales]; Legend: Date[Year]',
        'Visual header ... > Sort axis > Month, Sort ascending',
        'Format visual > Visual > Markers: On',
        'Format visual > Visual > Lines > choose series 2023 > Line style: Dashed',
      ],
      result: 'Two lines Jan-Mar: 2023 falls from 100K to 5K then rises to 12K; 2024 rises 20K -> 58K -> 62K.',
      explanation:
        'Putting Year in Legend creates one line per year on a shared month axis - the classic YoY line chart.',
    },
    {
      title: 'Line chart with secondary axis: Sales and Quantity',
      scenario: 'Show sales value and units sold per month on one chart even though the scales differ.',
      table: {
        headers: ['YearMonth', 'Total Sales', 'Total Quantity'],
        rows: [
          ['2023-01', '1,00,000', '2'],
          ['2023-02', '5,000', '10'],
          ['2023-03', '12,000', '3'],
          ['2024-01', '20,000', '1'],
          ['2024-02', '58,000', '3'],
          ['2024-03', '62,000', '7'],
        ],
      },
      steps: [
        'Create Total Quantity = SUM(Sales[Quantity]) via Modeling > New measure',
        'Build visual > Line chart',
        'X-axis: Date[YearMonth]; Y-axis: [Total Sales]; Secondary y-axis: [Total Quantity]',
        'Format visual > Visual > Y-axis > Title: On (Sales); Secondary y-axis > Title: On (Units)',
        'Format visual > Visual > Legend > Position: Top',
      ],
      result: 'Sales line on the left axis (0-100K), Quantity line on the right axis (0-10). Feb 2023 shows high quantity (10 mice) but low sales.',
      explanation:
        'Without the secondary axis the quantity line would be flat at zero next to values in lakhs.',
    },
    {
      title: 'Area chart: Sales vs Cost over time',
      scenario: 'Show the gap between sales and cost (profit) month by month.',
      table: {
        headers: ['YearMonth', 'Total Sales', 'Total Cost'],
        rows: [
          ['2023-01', '1,00,000', '80,000'],
          ['2023-02', '5,000', '3,000'],
          ['2023-03', '12,000', '9,000'],
          ['2024-01', '20,000', '15,000'],
          ['2024-02', '58,000', '46,000'],
          ['2024-03', '62,000', '46,200'],
        ],
      },
      steps: [
        'Build visual > Area chart',
        'X-axis: Date[YearMonth]; Y-axis: [Total Sales] and [Total Cost]',
        'Format visual > Visual > Lines > Shade area: On, transparency around 60%',
        'Format visual > Visual > Lines > Colors: Sales dark blue, Cost light grey',
        'Optional: change type to Stacked area chart with Legend = Product[Category] to see category volume over time',
      ],
      result: 'Two overlapping filled areas; the visible gap between them is the profit, largest in Jan 2023 (20K).',
      explanation:
        'Area charts emphasise magnitude. Use non-stacked area here because Sales and Cost are not parts of one total.',
    },
  ],
  interview: [
    {
      q: 'When would you use a bar chart instead of a column chart?',
      a: 'When category names are long or there are many categories - horizontal bars keep labels readable and allow vertical scrolling. Column charts suit few categories and time periods.',
      level: 'Easy',
    },
    {
      q: 'Clustered vs stacked vs 100% stacked - explain.',
      a: 'Clustered places series side by side for direct comparison; stacked shows the total and composition on one bar; 100% stacked normalises each bar to 100% to compare shares only.',
      level: 'Easy',
    },
    {
      q: 'When do you use a secondary axis?',
      a: 'When two measures with very different scales or units (sales in lakhs and quantity in units, or sales and margin %) are shown on one chart. Use the Secondary y-axis well in a line chart or a combo chart.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between continuous and categorical X-axis?',
      a: 'Continuous spaces points proportionally to the real date/number and allows zoom and scrolling; categorical gives each value an equal slot (used for text such as month names). Date hierarchies and text fields are categorical.',
      level: 'Medium',
    },
    {
      q: 'Why can stacked area charts be misleading?',
      a: 'Only the bottom series has a flat baseline. Middle and top series ride on the ones below, so their own change is hard to judge. Use a line chart when individual series comparison matters.',
      level: 'Medium',
    },
    {
      q: 'Scenario: The month axis shows Apr, Aug, Dec, Feb... How do you fix it?',
      a: 'Set the Month column Sort by column = MonthNo (Column tools > Sort by column), then sort the visual axis by Month ascending.',
      level: 'Easy',
    },
    {
      q: 'Scenario: A manager wants actual sales as columns and target as a line. Which visual and wells?',
      a: 'Line and clustered column chart: X-axis = Month, Column y-axis = [Total Sales], Line y-axis = [Target]. Turn off the secondary axis if both use the same scale.',
      level: 'Medium',
    },
    {
      q: 'How do you highlight a single bar in a different color?',
      a: 'Format visual > Visual > Bars (or Columns) > Colors > turn on Show all and change that category color, or use conditional formatting (fx) based on a rule or measure.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Build a clustered column chart of Total Sales by Segment with Year in the legend.',
      hint: 'X-axis Segment, Y-axis measure, Legend Year.',
      solution: `X-axis: Customer[Segment]; Y-axis: [Total Sales]; Legend: Date[Year]
Corporate: 2023 1,00,000 | 2024 1,30,000
Retail:    2023 17,000   | 2024 10,000`,
    },
    {
      task: 'Create a line chart of Total Profit by YearMonth with an average line from the Analytics tab.',
      hint: 'Analytics > Average line > Add.',
      solution: `X-axis: Date[YearMonth]; Y-axis: [Total Profit]
Analytics > Average line > + Add > Series: Total Profit
Monthly profit: 20,000; 2,000; 3,000; 5,000; 12,000; 15,800 -> average line at 9,633.33`,
    },
    {
      task: 'Convert the stacked column chart (Year x Category) into a 100% stacked column chart and describe what changes.',
      hint: 'Select the visual and click the 100% stacked column icon.',
      solution: `Both columns now reach 100%. 2023: Electronics 85.47%, Furniture 10.26%, Accessories 4.27%.
2024: Electronics 92.86%, Furniture 5.71%, Accessories 1.43%. You lose the total size, gain share comparison.`,
    },
    {
      task: 'Format the city bar chart: data labels in thousands, no gridlines, highlight Pune in orange.',
      hint: 'Format visual > Data labels, Gridlines, Bars > Colors > Show all.',
      solution: `Data labels On, Display units Thousands; Gridlines Off; Bars > Colors > Show all: Pune = orange, others grey.`,
    },
    {
      task: 'Build a stacked area chart showing Total Sales by YearMonth split by Category.',
      hint: 'Legend = Product[Category].',
      solution: `Stacked area chart: X-axis Date[YearMonth]; Y-axis [Total Sales]; Legend Product[Category].
The top edge equals the monthly total (e.g. 2024-03 = 62,000 = Electronics 60,000 + Accessories 2,000).`,
    },
  ],
  quiz: [
    {
      question: 'In a clustered bar chart, which well holds the category field?',
      options: ['X-axis', 'Y-axis', 'Legend', 'Tooltips'],
      answer: 1,
      explanation: 'Bars are horizontal, so categories are on the vertical Y-axis.',
    },
    {
      question: 'Which chart best shows share of each category inside each year, ignoring totals?',
      options: ['Clustered column', 'Line chart', '100% stacked column', 'Area chart'],
      answer: 2,
      explanation: '100% stacked normalises each column to show shares.',
    },
    {
      question: 'Two measures with very different scales on one line chart need:',
      options: ['Small multiples', 'Secondary y-axis', 'Legend', 'Drill through'],
      answer: 1,
      explanation: 'The secondary axis gives the second measure its own scale.',
    },
    {
      question: 'Which chart is NOT suitable for unordered categories like City?',
      options: ['Bar chart', 'Column chart', 'Line chart', 'Stacked bar chart'],
      answer: 2,
      explanation: 'Lines imply continuity/trend between points.',
    },
    {
      question: 'Where do you turn on "Total labels" for a stacked column chart?',
      options: ['Analytics tab', 'Format visual > Visual > Total labels', 'Build visual > Values', 'View > Total'],
      answer: 1,
      explanation: 'Total labels is a Visual section in the Format pane for stacked charts.',
    },
  ],
};
