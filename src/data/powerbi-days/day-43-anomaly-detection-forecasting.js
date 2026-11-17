export default {
  id: 'day-43-anomaly-detection-forecasting',
  title: 'AI Visuals, Anomaly Detection, Forecasting',
  module: 'Module 8: AI Features & Advanced Integration',
  day: 43,
  level: 'Advanced',
  duration: '2 hours',
  summary:
    'Beyond the AI visuals of Day 42, Power BI adds machine learning directly to line charts (anomaly detection and forecasting), explains changes with "Analyze > Explain the increase", and offers AI Insights in Power Query. You will learn the requirements, settings and limits of each, and how to check results with your own DAX.',
  objectives: [
    'Enable anomaly detection on a time-series line chart and tune sensitivity and explanations',
    'Add a forecast with length, seasonality, ignore-last and confidence interval settings',
    'Use Analyze > Explain the increase/decrease on a data point',
    'Describe AI Insights in Power Query (Text Analytics, Vision, Azure ML) and their licence needs',
    'Validate AI output with DAX measures such as moving averages',
  ],
  theory: [
    {
      heading: 'The AI toolbox in Power BI',
      content:
        "Power BI's AI features fall into three groups:\n\n1. **AI visuals**: Key influencers, Decomposition tree, Q&A, Smart narrative (Day 42).\n2. **Analytics on charts**: anomaly detection, forecasting, trend lines and 'Explain the increase/decrease' on line and column charts.\n3. **AI in data preparation**: Power Query **AI Insights** (Text Analytics for sentiment, key phrases, language detection; Vision for image tagging; Azure Machine Learning models).\n\nOn top of these, **Copilot** (paid Fabric/Premium capacity) can build pages, write DAX and summarise reports.\n\nAll AI results are suggestions based on statistics. A good analyst checks them against business knowledge.",
    },
    {
      heading: 'Anomaly detection',
      content:
        "**Anomaly detection** marks points in a time series that are unusually high or low compared with the expected pattern, and draws an expected range band.\n\nRequirements:\n\n- **Line chart** with a **date/time field on the X-axis** (continuous axis).\n- **One measure** on the Y-axis; no Legend and no secondary axis.\n\nPath: select the line chart > **Analytics pane** (magnifying glass icon in Visualizations) > **Find anomalies** > **+ Add**.\n\nSettings:\n\n- **Sensitivity** (default 70%): higher = more points flagged.\n- **Explain by**: fields the algorithm uses to explain each anomaly (e.g. City, Category).\n- Format: anomaly marker shape/colour, expected range transparency.\n\nClick an anomaly marker to open the **Anomalies pane**, which shows the expected range and possible explanations ranked by strength.",
      tip: 'Anomaly detection needs a reasonable history (dozens of points). Daily data for 2023-2024 in the practice model works well; 3 monthly points do not.',
    },
    {
      heading: 'Forecasting',
      content:
        "The **Forecast** feature predicts future values of a line chart using exponential smoothing (it detects trend and seasonality automatically).\n\nRequirements: line chart, continuous **date** X-axis (Date column or date hierarchy turned off, axis type Continuous), one measure, no Legend.\n\nPath: select the line chart > **Analytics pane > Forecast > + Add**.\n\nOptions:\n\n- **Units** and **Forecast length**: e.g. 3 months or 90 days ahead.\n- **Ignore the last**: exclude the last N points (incomplete current month) or test accuracy by forecasting a period you already know.\n- **Seasonality**: Auto, or set the number of points in one cycle (12 for monthly data with yearly seasonality, 7 for daily data with weekly cycle).\n- **Confidence interval**: 75%, 80%, 85%, 90%, 95% (default), 99%. Shown as a shaded band.\n\nThe forecast is a visual-level calculation; you cannot use its values in DAX. For a forecast you can reuse, use Fabric notebooks, Azure ML or Excel's Forecast Sheet.",
      points: [
        'Text month columns (Jan, Feb) on the axis disable forecasting; use a date column.',
        'Use Ignore the last to back-test: hide 3 known months and compare forecast vs actual.',
      ],
    },
    {
      heading: 'Explain the increase / decrease',
      content:
        "Right-click a data point in a line or column chart (when comparing it with the previous point) > **Analyze > Explain the increase** (or decrease). Power BI looks across other fields in the model and shows small charts of the categories that contributed most to the change, e.g. 'Electronics in Pune drove most of the increase from Feb to Mar'.\n\nYou can add any of those charts to the report with the + icon. The feature does not work with some measure types or DirectQuery sources and is limited for complex measures.",
    },
    {
      heading: 'AI Insights in Power Query',
      content:
        "In Power Query Editor, **Home** (or Add column) > **AI Insights**:\n\n- **Text Analytics**: Score sentiment (0 to 1), Extract key phrases, Detect language.\n- **Vision**: Tag images from URLs or binary columns.\n- **Azure Machine Learning**: call models your data scientists have published and you have access to.\n\nText Analytics and Vision run on the Premium/Fabric capacity and require the workspace or model to be on capacity (or PPU); Azure ML requires an Azure subscription and permission. Each call consumes capacity, so filter rows first.\n\nExample: a customer feedback table (extra table, not part of the shared model) can get a Sentiment column, which you then average by City in a report.",
    },
  ],
  examples: [
    {
      title: 'Detect anomalies in daily sales',
      scenario: 'Find unusual days in 2024 daily sales from the full practice dataset.',
      table: {
        headers: ['Setting', 'Value'],
        rows: [
          ['X-axis', "'Date'[Date] (continuous)"],
          ['Y-axis', '[Total Sales]'],
          ['Filter', "'Date'[Year] = 2024"],
          ['Sensitivity', '80%'],
          ['Explain by', 'Customer[City], Product[Category]'],
        ],
      },
      steps: [
        'Insert a Line chart; X-axis: Date[Date] (choose Date, not Date Hierarchy); Y-axis: [Total Sales]',
        'Add a visual filter Date[Year] = 2024',
        'Analytics pane > Find anomalies > + Add',
        'Set Sensitivity to 80%; drag Customer[City] and Product[Category] into Explain by',
        'Click a highlighted anomaly marker to open the Anomalies pane and read the explanations',
      ],
      result: 'Spikes or dips outside the grey expected range are marked; the pane lists which City/Category most explains each anomaly.',
      explanation: 'The algorithm models the expected value for each day from the series and flags points outside the expected band; explanations compare contribution of each field value.',
    },
    {
      title: 'Forecast next 3 months',
      scenario: 'Management wants a 3-month forecast of monthly sales after December 2024.',
      table: {
        headers: ['Option', 'Value'],
        rows: [
          ['Units', 'Months'],
          ['Forecast length', '3'],
          ['Ignore the last', '0'],
          ['Seasonality', '12 (yearly pattern in monthly data)'],
          ['Confidence interval', '95%'],
        ],
      },
      steps: [
        'Create a Month Start column in the Date table (code below) and set its type to Date',
        'Insert a Line chart; X-axis: Date[Month Start]; Y-axis: [Total Sales]',
        'Format > X-axis > Type: Continuous',
        'Analytics pane > Forecast > + Add',
        'Units: Months, Forecast length 3, Seasonality 12, Confidence interval 95% > Apply',
      ],
      code: `Month Start = DATE ( 'Date'[Year], 'Date'[MonthNo], 1 )`,
      result: 'A dotted forecast line for Jan-Mar 2025 with a shaded 95% confidence band appears after the actual line.',
      explanation: 'Forecasting needs a continuous date axis. Month Start gives one point per month; seasonality 12 tells the model one cycle is a year.',
    },
    {
      title: 'Back-test forecast accuracy with Ignore the last',
      scenario: 'Check how good the forecast is by hiding the last 3 known months (Oct-Dec 2024).',
      table: {
        headers: ['Month', 'Actual', 'Forecast', 'Inside 95% band?'],
        rows: [
          ['Oct 2024', 'from your data', 'from chart', 'Yes/No'],
          ['Nov 2024', 'from your data', 'from chart', 'Yes/No'],
          ['Dec 2024', 'from your data', 'from chart', 'Yes/No'],
        ],
      },
      steps: [
        'Use the forecast chart from the previous example',
        'Analytics pane > Forecast > Ignore the last: 3 > Apply',
        'Hover each of Oct, Nov, Dec to compare actual line vs forecast line and band',
        'Record the values in a table like the one above',
      ],
      result: 'You see how far forecasts were from known actuals; if most actuals are inside the band, the forecast is reasonable.',
      explanation: 'Ignore the last trains the model without the final points, simulating a forecast made three months ago.',
    },
    {
      title: 'Validate with a 3-month moving average',
      scenario: 'Show a simple, explainable trend alongside the ML forecast.',
      table: {
        headers: ['Month (sample slice)', 'Total Sales', '3M Moving Avg'],
        rows: [
          ['Jan 2024', '1,05,000', '1,05,000'],
          ['Feb 2024', '24,000', '64,500'],
          ['Mar 2024', '57,500', '62,166.67'],
        ],
      },
      steps: [
        'Modeling > New measure: 3M Moving Avg (below)',
        'Add it as a second Y value on the monthly line chart (note: forecast requires a single measure, so use a separate chart or remove the forecast)',
        'Compare the smooth trend with the forecast',
      ],
      code: `3M Moving Avg =
VAR Window =
    DATESINPERIOD ( 'Date'[Date], MAX ( 'Date'[Date] ), -3, MONTH )
RETURN
    CALCULATE (
        AVERAGEX ( VALUES ( 'Date'[YearMonth] ), [Total Sales] ),
        Window
    )`,
      result: 'Jan 1,05,000; Feb (1,05,000+24,000)/2 = 64,500; Mar (1,05,000+24,000+57,500)/3 = 62,166.67 on the sample slice.',
      explanation: 'DATESINPERIOD returns the 3 months ending at the last date of the current month. AVERAGEX averages the monthly totals in that window and skips months with BLANK sales (Nov-Dec 2023 have no rows in the sample slice).',
    },
    {
      title: 'Sentiment score with AI Insights',
      scenario: 'An extra Feedback table (FeedbackID, CustomerID, Comment) needs a sentiment score.',
      table: {
        headers: ['Comment', 'Sentiment score (example)'],
        rows: [
          ['Delivery was fast and the laptop is excellent', '0.95'],
          ['Chair arrived damaged, very disappointed', '0.08'],
          ['Mouse is okay', '0.55'],
        ],
      },
      steps: [
        'Workspace must be on Premium/Fabric capacity or PPU',
        'Home > Transform data; select the Feedback query',
        'Add column > AI Insights > Text Analytics; sign in if asked',
        'Choose Score sentiment; Text: Comment; Language: en > OK',
        'Close & Apply; build a bar chart of average sentiment by Customer[City]',
      ],
      result: 'A new numeric column with scores between 0 (negative) and 1 (positive).',
      explanation: 'Power Query calls Cognitive Services through the capacity; scores are stored in the model at refresh time.',
    },
  ],
  interview: [
    {
      q: 'What are the requirements for anomaly detection in Power BI?',
      a: 'A line chart with a date/time field on a continuous X-axis and a single measure on Y, with no legend or secondary axis. Enable it in Analytics pane > Find anomalies.',
      level: 'Easy',
    },
    {
      q: 'What does the sensitivity setting do in anomaly detection?',
      a: 'It controls how narrow the expected range is. Higher sensitivity flags more points as anomalies; lower flags only extreme ones.',
      level: 'Medium',
    },
    {
      q: 'Which algorithm does Power BI forecasting use and what settings can you change?',
      a: 'Exponential smoothing (ETS-based). You can set forecast length and units, ignore the last N points, seasonality (auto or number of points) and confidence interval.',
      level: 'Medium',
    },
    {
      q: 'Why is the Forecast option missing in the Analytics pane?',
      a: 'The chart is not eligible: X-axis is categorical (text months or hierarchy), there is a legend or multiple measures, or the visual is not a line chart. Use a date column with a continuous axis and one measure.',
      level: 'Medium',
    },
    {
      q: 'How can you test forecast accuracy in Power BI?',
      a: 'Use Ignore the last to exclude known recent points, then compare the forecast with the actual values, checking whether actuals fall inside the confidence band.',
      level: 'Hard',
    },
    {
      q: 'Can you use forecast values in a DAX measure?',
      a: 'No. The built-in forecast is computed in the visual layer only. To reuse forecasts, build them in Python/R, Fabric notebooks, Azure ML, or a DAX method like moving averages or linear regression (LINESTX).',
      level: 'Hard',
    },
    {
      q: 'What are AI Insights in Power Query and their licensing need?',
      a: 'Text Analytics (sentiment, key phrases, language), Vision (image tagging) and Azure ML model scoring. Text Analytics and Vision run on Premium/Fabric capacity (or PPU); Azure ML needs Azure access.',
      level: 'Medium',
    },
    {
      q: 'Scenario: anomaly detection flags every December. Is that a real anomaly?',
      a: 'Probably seasonality (festive sales). Check with business users, look at multiple years, and consider that a short history makes seasonal peaks look unusual. Lower sensitivity or use more history.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Write a 3-month rolling total of sales (sum, not average) to compare with the forecast line.',
      hint: 'Same DATESINPERIOD window, but sum the sales.',
      solution: `3M Rolling Sales =
CALCULATE (
    [Total Sales],
    DATESINPERIOD ( 'Date'[Date], MAX ( 'Date'[Date] ), -3, MONTH )
)
-- Sample slice: Jan 1,05,000; Feb 1,29,000; Mar 1,86,500`,
    },
    {
      task: 'Enable anomaly detection on monthly profit and add Category as an explain-by field.',
      hint: 'Line chart with Month Start on X and [Profit] on Y.',
      solution: 'Line chart: X Date[Month Start] (continuous), Y [Profit]. Analytics > Find anomalies > Add > Explain by Product[Category].',
    },
    {
      task: 'Create a 30-day forecast of daily sales with weekly seasonality.',
      hint: 'Seasonality in points.',
      solution: 'X-axis Date[Date], Y [Total Sales]. Analytics > Forecast > Units: Points (or Days), Length 30, Seasonality 7, CI 95% > Apply.',
    },
    {
      task: 'Use Explain the increase on the monthly sales chart for the biggest month-on-month jump and add the top explanation visual to the report.',
      hint: 'Right-click the data point.',
      solution: 'Right-click the month > Analyze > Explain the increase > review charts > click + on the top chart to add it to the page.',
    },
  ],
  quiz: [
    {
      question: 'Anomaly detection is available on which visual?',
      options: ['Pie chart', 'Line chart with date axis', 'Table', 'Card'],
      answer: 1,
      explanation: 'It requires a time-series line chart.',
    },
    {
      question: 'Default confidence interval for forecasting is...',
      options: ['75%', '90%', '95%', '99%'],
      answer: 2,
      explanation: '95% is the default.',
    },
    {
      question: 'Seasonality for monthly data with a yearly cycle should be...',
      options: ['4', '7', '12', '30'],
      answer: 2,
      explanation: '12 monthly points make one year.',
    },
    {
      question: '"Ignore the last" is used to...',
      options: ['Hide future dates', 'Exclude recent points from the model to back-test or skip incomplete periods', 'Remove outliers', 'Increase sensitivity'],
      answer: 1,
      explanation: 'It trains the forecast without the last N points.',
    },
    {
      question: 'AI Insights Text Analytics is found in...',
      options: ['Report view Format pane', 'Power Query Editor', 'Model view', 'Performance analyzer'],
      answer: 1,
      explanation: 'It is a Power Query transformation under AI Insights.',
    },
  ],
};
