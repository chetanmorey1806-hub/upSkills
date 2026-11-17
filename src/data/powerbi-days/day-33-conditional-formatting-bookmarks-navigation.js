export default {
  id: 'day-33-conditional-formatting-bookmarks-navigation',
  title: 'Conditional Formatting, Bookmarks, Buttons, Page Navigation',
  module: 'Module 5: Data Visualization',
  day: 33,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Conditional formatting makes important numbers jump out with colors, data bars and icons. Bookmarks, buttons and page navigation turn a set of pages into an app-like experience: toggle views, reset filters and move between pages with one click.',
  objectives: [
    'Apply background color, font color, data bars and icons using Gradient, Rules and Field value',
    'Color chart bars dynamically with a DAX color measure',
    'Create bookmarks with the Selection pane to show/hide visuals and reset filters',
    'Add buttons with actions: Page navigation, Bookmark, Back, Drill through, Web URL',
    'Build a navigation menu with the Page navigator and Bookmark navigator',
  ],
  theory: [
    {
      heading: 'Conditional formatting in tables and matrices',
      content:
        `Conditional formatting changes the look of a cell based on its value, so the reader sees good/bad results without reading every number.\n\nHow to open it: select the table/matrix > in the **Values** (or Columns) well, click the dropdown arrow on a field > **Conditional formatting** > choose a type. Or Format visual > Visual > **Cell elements** > pick the series > toggle the option > click **fx**.\n\nTypes:\n- **Background color** - fill the cell\n- **Font color** - color the text\n- **Data bars** - a bar inside the cell proportional to the value\n- **Icons** - arrows, traffic lights, flags next to the value\n- **Web URL** - turn text into a clickable link (field must contain a URL)\n\nFormat style (for colors and icons):\n- **Gradient** - color scale from minimum to maximum (optionally a middle color for diverging data)\n- **Rules** - "If value >= 0 and < 0.25 then red" - you define ranges (Number or Percent)\n- **Field value** - a column or measure returns the color itself (e.g. "#2E7D32" or "Green")\n\n**What field should we base this on?** - formatting can be based on a different measure than the one displayed (show Sales, color by Margin %).\n\n"Apply to": Values only, Values and totals, or Totals only.`,
      tip: 'Use color sparingly: one or two highlighted columns per table. Red/green only is hard for color-blind users - add icons or bold text too.',
    },
    {
      heading: 'Conditional formatting in charts (field value colors)',
      content:
        `Charts support conditional color too: Format visual > Visual > **Columns / Bars > Colors** > click **fx** next to Default color.\n\nThe most flexible method is a **color measure**:\n\n\`Margin Color = IF([Margin %] >= 0.25, "#2E7D32", "#C62828")\`\n\nThen fx > Format style: **Field value** > based on **Margin Color**. Each bar gets the color returned for its category.\n\nThe measure can return hex codes ("#FF0000") or color names ("Red"). Use SWITCH(TRUE(), ...) for several bands.\n\nNote: when a chart has a **Legend** field, the fx option for colors is not available - colors then come from the legend values.\n\nMany other properties also have **fx**: titles (dynamic title from Day 26), data label color, background of a card, button text.`,
    },
    {
      heading: 'Bookmarks and the Selection pane',
      content:
        `A **bookmark** captures the current state of a report page: filters, slicer selections, sort order, drill level, which visuals are visible, and the current page.\n\nOpen **View > Bookmarks** and **View > Selection**.\n\n**Selection pane** lists every object on the page. Click the eye icon to hide/show it; drag to change layer order; group objects (Ctrl+click, right-click > Group).\n\nCreate a bookmark: set up the page > Bookmarks pane > **Add** > rename (double-click). Each bookmark has options in its **...** menu:\n- **Data** - capture filters, slicers, sort, drill state\n- **Display** - capture visibility (hidden/visible) and spotlight/focus mode\n- **Current page** - jump to the page when applied\n- **All visuals / Selected visuals** - apply only to some visuals\n- **Update** - overwrite the bookmark with the current state\n\nClassic uses:\n- **Toggle views** (chart vs table) - two bookmarks with Display only (Data unticked)\n- **Reset filters** - a bookmark with no selections, Data ticked\n- **Storytelling** - View in the Bookmarks pane presents bookmarks like slides\n\nBookmark groups can be used to organise many bookmarks and to feed a Bookmark navigator.`,
      tip: 'Untick Data on view-toggle bookmarks. Otherwise clicking "Show table" also resets the user slicer selections to whatever they were when you created the bookmark.',
    },
    {
      heading: 'Buttons and actions',
      content:
        `**Insert > Buttons** gives: Right arrow, Left arrow, Reset, Back, Information, Help, Q&A, Bookmark, Blank, plus **Navigator > Page navigator / Bookmark navigator**.\n\nAny button (and also shapes and images) can have an **Action** - select it > Format pane > **Action: On** > **Type**:\n- **Back** - return to the previous page (used with drill through)\n- **Bookmark** - apply a bookmark\n- **Drill through** - go to a drill-through page with the current selection\n- **Page navigation** - go to a chosen page (Destination; also **fx** for a dynamic destination from a measure)\n- **Q&A** - open the Q&A dialog\n- **Web URL** - open a website\n- **Apply all slicers / Clear all slicers** - for apply buttons on slicer-heavy pages\n\nButton **Style** has states: Default, On hover, On press, Disabled - set fill, text, icon and border per state.\n\nIn **Power BI Desktop** you must **Ctrl+click** a button to run its action (normal click selects it for editing). In the Power BI Service a normal click works.`,
    },
    {
      heading: 'Page navigation patterns',
      content:
        `Three ways to build navigation:\n\n1. **Page navigator** (Insert > Buttons > Navigator > Page navigator): creates one button per page automatically and highlights the current page. Format > **Pages** to hide some pages (e.g. tooltip and drill-through pages are hidden by default; hidden pages can be excluded). Layout: Horizontal/Vertical grid.\n2. **Individual buttons** with Action type **Page navigation** - full control over design and order.\n3. **Bookmark navigator** - one button per bookmark in a chosen bookmark group (great for view toggles).\n\nDesign tips:\n- Put the menu in the same place on every page (left strip or top bar) - copy and paste it; it keeps position.\n- Hide helper pages (right-click page tab > **Hide page**) so users navigate only with your buttons.\n- Use a clear "selected" state color for the current page.`,
    },
  ],
  examples: [
    {
      title: 'Background color rules on Margin %',
      scenario: 'In a category table, color Margin %: below 25% red, 25% to below 35% amber, 35% and above green.',
      table: {
        headers: ['Category', 'Total Sales', 'Margin %', 'Cell color'],
        rows: [
          ['Accessories', '7,000', '40.00%', 'Green'],
          ['Furniture', '20,000', '25.00%', 'Amber'],
          ['Electronics', '2,30,000', '21.74%', 'Red'],
        ],
      },
      steps: [
        'Margin % = DIVIDE([Total Sales] - [Total Cost], [Total Sales]) (from Day 26)',
        'Build visual > Table: Columns Product[Category], [Total Sales], [Margin %]',
        'In the Columns well, click the dropdown on Margin % > Conditional formatting > Background color',
        'Format style: Rules; What field should we base this on: Margin %',
        'Rule 1: If value >= 0 Number and < 0.25 Number then red (#F8D7DA)',
        'Click + New rule: >= 0.25 and < 0.35 then amber (#FFE8A3); + New rule: >= 0.35 and <= 1 then green (#D4EDDA)',
        'Click OK',
      ],
      result: 'Accessories cell green, Furniture amber, Electronics red.',
      explanation:
        'Rules compare the numeric value (0.2174, 0.25, 0.40), so use decimals with "Number", not 25. Choose "Percent" only if you mean percentiles of the range.',
    },
    {
      title: 'Data bars and icons for YoY %',
      scenario: 'For 2024 show data bars on sales and arrow icons on YoY % by category.',
      table: {
        headers: ['Category', 'Total Sales (2024)', 'Sales LY (2023)', 'YoY %', 'Icon'],
        rows: [
          ['Electronics', '1,30,000', '1,00,000', '30.00%', 'Green up arrow'],
          ['Furniture', '8,000', '12,000', '-33.33%', 'Red down arrow'],
          ['Accessories', '2,000', '5,000', '-60.00%', 'Red down arrow'],
        ],
      },
      steps: [
        'Use Sales LY and YoY % measures from Day 27',
        'Build visual > Table: Product[Category], [Total Sales], [Sales LY], [YoY %]; Year slicer = 2024',
        'Total Sales dropdown in Columns well > Conditional formatting > Data bars: positive bar color blue, Show bar only: Off; OK',
        'YoY % dropdown > Conditional formatting > Icons; Format style: Rules',
        'Rules: If value >= 0 Number then green up arrow; If value < 0 Number then red down arrow; Icon layout: Left of data',
      ],
      result: 'Electronics shows the longest data bar and a green up arrow; Furniture and Accessories show red down arrows.',
      explanation:
        'Data bars give a quick visual size comparison inside the table; icons signal direction without relying only on color.',
    },
    {
      title: 'Bar colors from a DAX color measure',
      scenario: 'Color the Sales by Category columns green when margin is at least 25%, otherwise red.',
      table: {
        headers: ['Category', 'Margin %', 'Margin Color', 'Column color'],
        rows: [
          ['Electronics', '21.74%', '#C62828', 'Red'],
          ['Furniture', '25.00%', '#2E7D32', 'Green'],
          ['Accessories', '40.00%', '#2E7D32', 'Green'],
        ],
      },
      steps: [
        'Modeling > New measure: Margin Color (code below)',
        'Build visual > Clustered column chart: X-axis Product[Category], Y-axis [Total Sales] (no Legend)',
        'Format visual > Visual > Columns > Colors > click fx next to Default color',
        'Format style: Field value; What field should we base this on: Margin Color; OK',
      ],
      code: `Margin Color =
IF ( [Margin %] >= 0.25, "#2E7D32", "#C62828" )`,
      result: 'Electronics column is red (high sales, low margin), Furniture and Accessories are green.',
      explanation:
        'Field value formatting reads the color directly from the measure for each column. You can change the business rule in one DAX formula.',
    },
    {
      title: 'Bookmarks: toggle Chart / Table view and Reset filters',
      scenario: 'Show either a chart or a table in the same space using two buttons, and add a Reset button.',
      table: {
        headers: ['Bookmark', 'Chart', 'Table', 'Data ticked?'],
        rows: [
          ['Show Chart', 'Visible', 'Hidden', 'No (Display only)'],
          ['Show Table', 'Hidden', 'Visible', 'No (Display only)'],
          ['Reset Filters', 'unchanged', 'unchanged', 'Yes (Data only)'],
        ],
      },
      steps: [
        'Place the Sales by City bar chart and a Sales by City table exactly on top of each other (Format > General > Properties > same size and position)',
        'View > Selection and View > Bookmarks to open both panes',
        'Selection pane: hide the table (eye icon). Bookmarks pane > Add > rename to Show Chart > ... > untick Data',
        'Selection pane: hide the chart, show the table. Bookmarks > Add > rename to Show Table > ... > untick Data',
        'Clear all slicers. Bookmarks > Add > rename to Reset Filters > ... > untick Display, keep Data ticked',
        'Insert > Buttons > Blank twice; set Button text to Chart and Table; Action: On, Type: Bookmark, Bookmark: Show Chart / Show Table',
        'Insert > Buttons > Reset; Action Type: Bookmark, Bookmark: Reset Filters',
        'Ctrl+click each button to test',
      ],
      result: 'Ctrl+clicking Table hides the chart and shows the table without changing slicers; Reset clears all slicer selections.',
      explanation:
        'Display-only bookmarks change visibility; Data-only bookmarks change filters. Mixing them would make view buttons reset user selections.',
    },
    {
      title: 'Navigation menu with Page navigator and buttons',
      scenario: 'A 3-page report (Overview, Products, Customers) needs a consistent left menu and a "Go to Products" button.',
      table: {
        headers: ['Object', 'Action', 'Destination'],
        rows: [
          ['Page navigator (3 buttons)', 'Automatic', 'Overview / Products / Customers'],
          ['Button "See product detail"', 'Page navigation', 'Products'],
          ['Back button on City Details', 'Back', 'Previous page'],
        ],
      },
      steps: [
        'Create pages Overview, Products, Customers (+ the hidden drill-through page City Details from Day 32)',
        'On Overview: Insert > Buttons > Navigator > Page navigator',
        'Format navigator > Visual > Grid layout > Orientation: Vertical; place it on the left',
        'Format navigator > Visual > Pages > Show hidden pages: Off; Show tooltip pages: Off',
        'Format navigator > Visual > Style > State: Selected - fill dark blue, text white',
        'Copy the navigator (Ctrl+C) and paste (Ctrl+V) on the other pages - it keeps the same position',
        'Insert > Buttons > Blank; Button text: See product detail; Action: On, Type: Page navigation, Destination: Products',
        'Right-click the City Details page tab > Hide page',
        'Ctrl+click navigator buttons to test',
      ],
      result: 'Every page has the same vertical menu; the current page button is dark blue. The extra button jumps to Products.',
      explanation:
        'The Page navigator updates automatically when you add, rename or hide pages, so it needs less maintenance than individual buttons.',
    },
  ],
  interview: [
    {
      q: 'What conditional formatting options are available in a table or matrix?',
      a: 'Background color, font color, data bars, icons and web URL. Colors and icons can use Gradient, Rules or Field value, and can be based on a different field than the one displayed.',
      level: 'Easy',
    },
    {
      q: 'How do you color bars dynamically based on a business rule?',
      a: 'Create a measure that returns a color (hex or name), e.g. IF([Margin %] >= 0.25, "#2E7D32", "#C62828"), then Format > Columns > Colors > fx > Field value > choose the measure.',
      level: 'Medium',
    },
    {
      q: 'What does a bookmark capture?',
      a: 'The page state: filters, slicer selections, sort, drill location, visibility of objects (Selection pane), spotlight/focus mode and current page. Options Data, Display and Current page control what is applied.',
      level: 'Medium',
    },
    {
      q: 'Scenario: Clicking your "Show Table" button resets the user slicers. Why?',
      a: 'The bookmark captured Data (filters/slicers). Untick Data for view-toggle bookmarks so they only change Display.',
      level: 'Hard',
    },
    {
      q: 'Why does a button not work when clicked in Power BI Desktop?',
      a: 'In Desktop, buttons need Ctrl+click to execute (normal click selects them for editing). In the Service or Reading view a normal click works.',
      level: 'Easy',
    },
    {
      q: 'What action types can a button have?',
      a: 'Back, Bookmark, Drill through, Page navigation, Q&A, Web URL, and Apply all slicers / Clear all slicers.',
      level: 'Easy',
    },
    {
      q: 'Page navigator vs individual navigation buttons?',
      a: 'Page navigator creates and maintains buttons automatically for all (non-hidden) pages with selected-state styling. Individual buttons give full control over design, order and which pages appear, but must be maintained manually.',
      level: 'Medium',
    },
    {
      q: 'Scenario: You want the color fx option on a column chart but it is missing. Why?',
      a: 'The chart has a field in the Legend well. Conditional (fx) color is only available when there is no legend (or a single series). Remove the legend or use a different approach.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Apply a font color gradient (red to green) to Total Sales in a City table.',
      hint: 'Conditional formatting > Font color > Gradient.',
      solution: `Columns dropdown on Total Sales > Conditional formatting > Font color > Format style: Gradient
Lowest value: red, Highest value: green -> Mumbai (13,000) red, Pune (1,20,000) green`,
    },
    {
      task: 'Create a 3-band color measure for profit and use it on a bar chart by City.',
      hint: 'SWITCH(TRUE(), ...) returning hex codes.',
      solution: `Profit Color =
SWITCH (
    TRUE (),
    [Total Profit] >= 20000, "#2E7D32",
    [Total Profit] >= 4000, "#F9A825",
    "#C62828"
)
-- Pune 25,000 green, Nashik 25,000 green, Mumbai 4,000 amber, Nagpur 3,800 red`,
    },
    {
      task: 'Create a bookmark "2024 Electronics" that sets Year = 2024 and Category = Electronics, and a button to apply it.',
      hint: 'Set slicers first, then Add bookmark with Data ticked.',
      solution: `Select 2024 and Electronics in slicers > Bookmarks > Add > rename "2024 Electronics".
Insert > Buttons > Bookmark > Action Bookmark: 2024 Electronics. Ctrl+click -> Total Sales card shows 1,30,000.`,
    },
    {
      task: 'Add a Web URL action to an Information button that opens the company sales policy page.',
      hint: 'Action Type: Web URL.',
      solution: `Insert > Buttons > Information > Action: On > Type: Web URL > enter https://example.com/sales-policy`,
    },
    {
      task: 'Build a Bookmark navigator for the bookmarks Show Chart and Show Table.',
      hint: 'Group the two bookmarks first.',
      solution: `Bookmarks pane: Ctrl+click both > ... > Group > rename "Views".
Insert > Buttons > Navigator > Bookmark navigator > Format > Bookmarks > Bookmark group: Views.`,
    },
  ],
  quiz: [
    {
      question: 'Which format style lets a DAX measure decide the exact color?',
      options: ['Gradient', 'Rules', 'Field value', 'Data bars'],
      answer: 2,
      explanation: 'Field value reads the color returned by a column or measure.',
    },
    {
      question: 'Which pane controls whether a visual is visible when a bookmark is captured?',
      options: ['Filters pane', 'Selection pane', 'Sync slicers pane', 'Performance analyzer'],
      answer: 1,
      explanation: 'The Selection pane shows/hides objects; bookmarks capture this when Display is ticked.',
    },
    {
      question: 'In Power BI Desktop, how do you run a button action?',
      options: ['Double-click', 'Ctrl+click', 'Right-click', 'Shift+click'],
      answer: 1,
      explanation: 'Ctrl+click executes button actions in Desktop.',
    },
    {
      question: 'Which bookmark option should be unticked for a view-toggle bookmark?',
      options: ['Display', 'Current page', 'Data', 'All visuals'],
      answer: 2,
      explanation: 'Unticking Data keeps user filters unchanged when toggling views.',
    },
    {
      question: 'Which object automatically creates one button per report page?',
      options: ['Bookmark navigator', 'Page navigator', 'Back button', 'Slicer'],
      answer: 1,
      explanation: 'Page navigator generates and maintains buttons for each page.',
    },
  ],
};
