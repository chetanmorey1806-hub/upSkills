export default {
  id: 'interactivity',
  title: 'Filters & Interactivity (Slicers, Drill, Bookmarks, Navigation, Tooltips)',
  level: 'Intermediate',
  day: 12,
  duration: '4 hours',
  summary:
    "Turn static pages into interactive analytical apps: control filter scope, sync slicers across pages, edit how visuals interact, drill down hierarchies, drill through to detail pages, and build navigation, bookmarks and custom tooltips that guide the user.",
  objectives: [
    'Apply and explain visual, page, report and drill-through filters',
    'Configure slicers and sync them across pages',
    'Control cross-filtering and cross-highlighting with Edit interactions',
    'Create hierarchies and use drill-down, drill-up, expand and drill-through',
    'Build bookmarks, use the selection pane, and create buttons for navigation and show/hide toggles',
    'Design report page tooltips',
  ],
  theory: [
    {
      heading: 'Filter levels in the Filters pane',
      content:
        "The **Filters pane** has several scopes:\n\n- **Filters on this visual** - affect only the selected visual (e.g. Top 10 products in one bar chart).\n- **Filters on this page** - affect every visual on the page.\n- **Filters on all pages** (report-level) - affect every page in the report.\n- **Drill-through** - fields placed on a drill-through target page; they receive the filter context passed from the source visual.\n\nFilters combine with AND logic across levels. Filter types: **Basic** (tick values), **Advanced** (contains, starts with, is greater than, is blank, with AND/OR), **Top N** (visual-level only), and **Relative date** (last 3 months, this year).\n\nAuthors can **lock** a filter (users can see but not change it) or **hide** it (users cannot see it in reading view). The pane itself can be formatted or hidden.",
      points: [
        'Visual-level filters can also filter on measures (e.g. Total Sales > 10,000)',
        'Page and report filters cannot filter on measures',
        'Filters pane changes made by readers are saved per user (persistent filters) unless disabled',
        'Use "Reset to default" button in the Service to clear user changes',
      ],
      tip: "Interview trick: 'How do you show only products with sales > 10K in one chart?' - visual-level filter on the measure [Total Sales] is greater than 10000.",
    },
    {
      heading: 'Slicers and sync slicers',
      content:
        "A **slicer** is an on-canvas filter that users interact with directly. Styles: vertical list, tile (buttons), dropdown, between (numeric/date range), relative date, and hierarchy slicers. Newer **Button slicer** and **List slicer** visuals give more formatting control.\n\nKey settings:\n- **Single select** vs multi-select (Ctrl+click) and **Select all** option.\n- **Search** box for long lists.\n- **Show items with no data** off by default.\n\n**Sync slicers** (View > Sync slicers pane) let one slicer drive several pages. For each page you tick **Sync** (the filter applies there) and **Visible** (the slicer is shown there). You can also create sync groups so that different slicers on the same field stay in sync.\n\nSlicers versus Filters pane: slicers are visible and intuitive but use canvas space and generate queries; filters in the pane save space and can be locked/hidden.",
      tip: "Use one 'Filters' panel per page (a group of slicers) and sync Year/Region slicers across all pages so users do not re-select on every page.",
    },
    {
      heading: 'Cross-filtering, cross-highlighting and Edit interactions',
      content:
        "By default, clicking a data point in one visual affects other visuals on the page:\n\n- **Cross-highlight** (default for many charts) - the other visual keeps all bars but highlights the selected portion.\n- **Cross-filter** - the other visual is filtered to show only the related data.\n- **None** - the other visual is not affected.\n\nTo change it: select the source visual > **Format** ribbon > **Edit interactions**, then click the filter, highlight or none icon above each target visual. You can also change the default to cross-filter in File > Options > Report settings.\n\nCommon use: a KPI card showing company total should not be filtered when users click a category bar - set interaction to None.",
      tip: "Ctrl+click lets users select multiple data points across visuals (multi-select cross-filtering).",
    },
    {
      heading: 'Hierarchies, drill-down and drill-up',
      content:
        "A **hierarchy** is an ordered set of columns, e.g. Category > Subcategory > Product, or Year > Quarter > Month > Date. Create it by right-clicking a column > Create hierarchy, then add levels. Power BI also creates an automatic date hierarchy if Auto date/time is enabled (best practice: disable it and use your own Date table).\n\nWhen a hierarchy is on an axis or matrix rows, the visual header shows drill controls:\n\n- **Drill up** (up arrow) - go back one level.\n- **Drill mode** (single down arrow) - when on, clicking a data point drills into that item only.\n- **Go to the next level** (double down arrow) - shows all items at the next level.\n- **Expand all down one level** (forked arrow) - shows the next level while keeping the parent (e.g. 2025 Q1, 2025 Q2).\n\nFor axes with expanded levels, the 'Concatenate labels' option controls whether labels are combined.",
      points: [
        'Drill-down stays within the same visual',
        'Drill-through moves to a different page with filters applied',
        'Users on mobile/Service right-click a data point for drill options',
      ],
    },
    {
      heading: 'Drill-through pages',
      content:
        "**Drill-through** lets users right-click a data point (e.g. a customer in a bar chart) and jump to a detail page filtered to that item.\n\nSetup:\n1. Create a detail page (e.g. 'Customer Details').\n2. Drag the field(s) (e.g. Customer[CustomerName]) into the **Drill-through** well of the page's Visualizations pane (Build tab, Page information / Drill through section).\n3. Power BI automatically adds a **Back** button.\n4. **Keep all filters** (on by default) passes all other filters from the source visual (e.g. Year slicer). Turn off to pass only the drill-through field.\n5. **Cross-report drill-through** allows jumping to a page in another report in the same workspace.\n\nDrill-through can also be used with measures: 'Drill through when Used as category / Used as summarized'.",
      tip: "Add a button with action 'Drill through' and a destination page so users who do not know about right-click can still drill - the button becomes active only when a single valid item is selected.",
    },
    {
      heading: 'Bookmarks and the Selection pane',
      content:
        "A **bookmark** captures the state of a report page: filters, slicers, sort order, drill location, visibility of visuals (from the Selection pane), and spotlight/focus mode. Open View > Bookmarks pane > Add.\n\nEach bookmark has options:\n- **Data** - capture filters and slicer selections.\n- **Display** - capture visibility, spotlight, focus mode.\n- **Current page** - navigate to this page when applied.\n- **All visuals / Selected visuals** - apply only to some visuals.\n\n**Selection pane** (View > Selection) lists every object on the page. You can show/hide objects (eye icon), group them, rename them (important for clarity), and set tab order for keyboard accessibility.\n\nCommon bookmark patterns:\n- **Toggle chart/table view** - two visuals stacked; bookmark A shows the chart, bookmark B shows the table.\n- **Slicer panel pop-out** - a hidden group of slicers shown by a button.\n- **Reset filters** button - a bookmark of the default state with Data enabled.\n- **Story/presentation** - bookmarks in sequence, played via View mode.\n\n**Personal bookmarks** are created by users in the Service to save their own views.",
      tip: "For a show/hide panel bookmark, UNtick 'Data' so applying the bookmark doesn't reset the user's slicer selections.",
    },
    {
      heading: 'Buttons and page navigation',
      content:
        "Insert > **Buttons** (Blank, Back, Bookmark, Navigator, Q&A, Help, arrows, etc.). Each button has an **Action**:\n\n- **Back** - return to the previous page.\n- **Bookmark** - apply a bookmark.\n- **Drill through** - go to a drill-through page.\n- **Page navigation** - go to a page (the destination can be conditional using a measure that returns a page name).\n- **Q&A**, **Web URL**, **Apply all slicers / Clear all slicers**.\n\n**Page navigator** and **Bookmark navigator** automatically create a button for every page or bookmark - easier to maintain than individual buttons.\n\nButtons have states (Default, On hover, On press, Disabled) that can each be formatted. In Desktop, Ctrl+click a button to test it; in the Service a normal click works.",
      syntax:
        'Nav Destination =\nSWITCH (\n    SELECTEDVALUE ( NavTable[Option] ),\n    "Sales", "Sales Overview",\n    "Customers", "Customer Analysis",\n    BLANK ()\n)\n-- Button > Action > Page navigation > Destination > fx > Nav Destination',
    },
    {
      heading: 'Report page tooltips',
      content:
        "Default tooltips show the fields of the hovered data point. **Report page tooltips** let you design a mini page that appears on hover.\n\nSetup:\n1. Create a new page; Format page > Page information > **Allow use as tooltip** = On.\n2. Canvas settings > Type: **Tooltip** (320 x 240) or custom size.\n3. Add visuals (e.g. a small line chart of monthly trend and a card).\n4. Optionally drag fields into the page's **Tooltip** fields well so it appears automatically for visuals using those fields.\n5. On the source visual: Format > General > Tooltips > Type: **Report page**, Page: your tooltip page.\n6. Hide the tooltip page from navigation (right-click page tab > Hide page).\n\nThe tooltip page is filtered by the hovered data point, so a hover over 'Bikes' shows Bikes' monthly trend.",
      tip: "Report page tooltips are a great way to add detail without adding visuals to the main page - mention this in interviews about decluttering reports.",
    },
  ],
  examples: [
    {
      title: 'Top N visual filter on a measure',
      scenario: 'Show only customers with sales > 5,000 in a table, while other visuals show all customers.',
      code:
        '1. Select the table visual (Customer[CustomerName], [Total Sales], [Orders]).\n2. Filters pane > Filters on this visual > Total Sales > Show items when the value: is greater than 5000 > Apply filter.\n3. Lock the filter (lock icon) so readers cannot change it, or leave unlocked to let them adjust.',
      explanation:
        'Measure filters are evaluated for each row of the visual (each customer) in the current filter context, so the list respects slicers: in 2024 different customers may qualify than in 2025. This kind of filter only exists at visual level.',
    },
    {
      title: 'Sync Year and Region slicers across three pages',
      scenario: 'Users choose Year and Region on the Overview page and want the same selection on Products and Customers pages, but only want to see the slicer on Overview.',
      code:
        '1. On Overview, add slicers: \'Date\'[Year] (dropdown) and Customer[Country] (list).\n2. Select the Year slicer > View > Sync slicers.\n3. In the Sync slicers pane, tick Sync for Overview, Products and Customers.\n4. Tick Visible only for Overview.\n5. Repeat for the Country slicer.\n6. Test: pick 2025 / Germany on Overview, go to Products - visuals are filtered.',
      explanation:
        'Sync applies the filter on the selected pages; Visible controls whether the slicer is shown. Hidden synced slicers still filter. Alternative: report-level filters in the Filters pane, but they are less discoverable for users.',
    },
    {
      title: 'Edit interactions so KPI cards ignore chart clicks',
      scenario: 'When a user clicks "Bikes" in the Sales by Category chart, the Total Sales card should still show the company total, but the monthly trend line should filter to Bikes.',
      code:
        '1. Select the "Sales by Category" bar chart.\n2. Format ribbon > Edit interactions.\n3. Above the Total Sales card, click the None (circle with slash) icon.\n4. Above the monthly line chart, click the Filter icon (funnel).\n5. Turn off Edit interactions.',
      explanation:
        'Interactions are configured per source-target pair. The card stays at company level so users keep context, while the trend shows the selected category. This is a common requirement in executive dashboards.',
    },
    {
      title: 'Drill-through to a Customer Details page',
      scenario: 'From any visual showing customers, users should be able to open a page with that customer\'s orders, products and trend.',
      code:
        '1. New page "Customer Details".\n2. Build tab > Drill through > drag Customer[CustomerName] into "Add drill-through fields here".\n3. Keep all filters: On.\n4. Add visuals: Card (Total Sales), Card (Orders), Line chart (Sales by YearMonth), Table (OrderID, OrderDate, ProductName, SalesAmount).\n5. Dynamic title measure:\n   Customer Title = "Customer: " & SELECTEDVALUE ( Customer[CustomerName], "Multiple customers" )\n6. Hide the page (right-click tab > Hide page).\n7. On Overview, right-click a customer bar > Drill through > Customer Details.',
      explanation:
        'The drill-through field defines when the option appears: any visual that uses Customer[CustomerName] can drill. The Back button is added automatically. Keeping all filters passes the Year slicer too, so the detail page matches the context the user came from.',
    },
    {
      title: 'Chart/Table toggle with bookmarks',
      scenario: 'Save space by showing either a column chart or a table of the same data, switched by two buttons.',
      code:
        '1. Place a column chart and a table (same size, same position). Rename them in the Selection pane: "Sales Chart", "Sales Table".\n2. Hide "Sales Table" (eye icon) > Bookmarks pane > Add > rename "Show Chart".\n3. Show the table, hide the chart > Add bookmark > "Show Table".\n4. For both bookmarks: right-click > untick Data (so slicers are not reset) and choose "Selected visuals" if other visuals should be untouched.\n5. Insert two buttons: "Chart" (Action: Bookmark = Show Chart), "Table" (Action: Bookmark = Show Table).\n   Or Insert > Buttons > Navigator > Bookmark navigator, using a bookmark group.',
      explanation:
        'The bookmarks capture visibility (Display) only. Unticking Data is critical: otherwise clicking the button would restore the slicer values that were active when the bookmark was created.',
    },
    {
      title: 'Report page tooltip with a trend sparkline',
      scenario: 'When hovering over a category in a bar chart, show a small trend of the last 12 months and margin.',
      code:
        '1. New page "TT Category". Format page > Page information > Allow use as tooltip: On.\n2. Canvas settings > Type: Tooltip.\n3. Add a line chart (\'Date\'[YearMonth], [Total Sales]) with a relative date filter: in the last 12 months; add cards for [Profit Margin %] and [Orders].\n4. Hide the page.\n5. Select the Sales by Category bar chart > Format > General > Tooltips > Type: Report page > Page: TT Category.',
      explanation:
        'The tooltip page receives the hovered category as a filter. It adds rich context without extra visuals on the main page.',
    },
  ],
  interview: [
    {
      q: 'What are the different filter levels in Power BI?',
      a: 'Visual-level (one visual; can filter on measures and use Top N), page-level (all visuals on a page), report-level (all pages), and drill-through filters (passed to a target page). Additionally slicers act as on-canvas filters and can be synced across pages; in the Service, URL query string filters and RLS also restrict data. Filters combine with AND across levels.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between a slicer and a filter in the Filters pane?',
      a: 'Both filter data. Slicers are visuals on the canvas, very discoverable, support styles (dropdown, tiles, range), can be synced across pages and controlled by bookmarks. They take canvas space and each sends queries. The Filters pane saves space, supports advanced/Top N/relative filtering, can filter measures at visual level, and filters can be locked or hidden. Typically: slicers for the 2-4 most-used selections, Filters pane for the rest or for author-enforced filters.',
      level: 'Easy',
    },
    {
      q: 'Explain cross-filter vs cross-highlight and how to change them.',
      a: 'Cross-highlight keeps all data in the target visual and highlights the part related to the selection (dimmed remainder). Cross-filter removes unrelated data from the target visual. Change it via Format > Edit interactions with the source visual selected, then choose Filter, Highlight or None for each target visual. The default can be set to cross-filter in Report settings.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between drill-down and drill-through?',
      a: 'Drill-down navigates levels of a hierarchy within the same visual (Year > Quarter > Month). Drill-through navigates to a different page that is filtered by the selected item (right-click a customer > Customer Details page). Drill-down explores granularity; drill-through moves to a detail-focused page with its own visuals.',
      level: 'Easy',
    },
    {
      q: 'What does a bookmark store, and what are the Data, Display and Current page options?',
      a: 'A bookmark stores the page state: filters and slicer selections, sort, drill state (Data); visibility of objects, spotlight and focus mode (Display); and which page is active (Current page). You can also limit it to selected visuals. Unticking Data creates a bookmark that only changes visibility, e.g. for show/hide panels, so it does not overwrite user selections.',
      level: 'Medium',
    },
    {
      q: 'Scenario: You built a bookmark to show/hide a slicer panel, but every time users click it their slicer selections are reset. Why and how do you fix it?',
      a: 'The bookmark has the Data option enabled, so it re-applies the filter state captured when it was created. Fix: right-click the bookmark > untick Data (keep Display), and optionally use "Selected visuals" to affect only the panel objects. Update the bookmark after changes.',
      level: 'Medium',
    },
    {
      q: 'How do sync slicers work?',
      a: 'In View > Sync slicers, for a selected slicer you choose per page whether it is synced (filter applies) and visible. Synced slicers share the same selection across pages. You can sync a slicer to a page where it is hidden, so it still filters there. Advanced options allow sync groups so that different slicer visuals on the same field share selection.',
      level: 'Easy',
    },
    {
      q: 'Scenario: Users need to see the company total in a card even after clicking a region in a map. How?',
      a: 'Select the map > Format > Edit interactions > set the card interaction to None. Alternatively, if the card must ignore all filters (including slicers), use a measure with REMOVEFILTERS, e.g. CALCULATE([Total Sales], REMOVEFILTERS(Customer)). Note that slicers are visuals too: selecting a slicer and using Edit interactions can also stop that slicer from filtering a specific visual. Page/report filters in the Filters pane, however, cannot be bypassed with Edit interactions - only with DAX.',
      level: 'Medium',
    },
    {
      q: 'What does "Keep all filters" do on a drill-through page?',
      a: 'When on (default), all filters affecting the source visual - slicers, page filters, other cross-filters - are passed to the target page in addition to the drill-through field. When off, only the drill-through field value is passed. Turn it off when the detail page should show the full history of an item regardless of the source page filters.',
      level: 'Medium',
    },
    {
      q: 'How do you build navigation in a multi-page report?',
      a: 'Use Insert > Buttons > Navigator > Page navigator, which automatically creates buttons for all visible pages and updates when pages are added. Or individual buttons with Action = Page navigation. Hide detail/tooltip pages so they do not appear. For conditional navigation, set the destination via fx using a measure returning a page name. In the published app, users can also use the app navigation pane.',
      level: 'Easy',
    },
    {
      q: 'What is a report page tooltip and how is it configured?',
      a: 'A custom page shown when hovering a data point. Configure: create a page, enable Allow use as tooltip, set canvas type to Tooltip, add visuals, optionally add tooltip fields, hide the page, and on the source visual set Tooltips > Type = Report page and choose the page. The tooltip page is filtered by the hovered item.',
      level: 'Medium',
    },
    {
      q: 'Scenario: A user says the drill-through option does not appear when right-clicking a bar. What could be wrong?',
      a: 'Possible causes: the source visual does not contain the drill-through field (or the exact same column, e.g. uses Product[Category] while the target expects Product[ProductName]); the drill-through field is a measure and the setting expects "used as category"; the data point is a total/aggregate with multiple values; the target page is in another report but cross-report drill-through is not enabled; or the user right-clicks in an area without a data point. Check the drill-through well on the target page.',
      level: 'Hard',
    },
    {
      q: 'What is the Selection pane used for?',
      a: 'Listing all objects on a page; showing/hiding them (used with bookmarks); renaming objects for clarity; grouping objects; changing layer order (which is on top); and setting tab order for keyboard navigation and screen reader accessibility.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Create a page-level filter so the whole "2025 Review" page shows only 2025, and lock it.',
      hint: 'Filters on this page.',
      solution:
        'Drag \'Date\'[Year] to "Filters on this page" > Basic filtering > tick 2025 > click the lock icon. Readers can see the filter but cannot change it. To hide it entirely, click the eye icon.',
    },
    {
      task: 'Create a Product hierarchy (Category > Subcategory > ProductName) and use it in a column chart with drill-down. Explain the four drill buttons.',
      hint: 'Right-click Category > Create hierarchy.',
      solution:
        'Right-click Product[Category] > Create hierarchy; drag Subcategory and ProductName onto it. Put the hierarchy on the X-axis with [Total Sales].\nButtons: Drill up (back one level), Drill mode (click a bar to drill into it only), Go to next level (all items at next level), Expand all down one level (next level combined with parent labels).',
    },
    {
      task: 'Build a "Reset filters" button that clears all slicers on the page.',
      hint: 'Two options: Clear all slicers action or a bookmark.',
      solution:
        'Option 1: Insert > Buttons > Blank > Action > Type: Clear all slicers.\nOption 2: Clear all slicers manually, add a bookmark "Default" with Data ticked, then a button with Action: Bookmark = Default. Option 2 can also reset Filters pane values and other states.',
    },
    {
      task: 'Build a Product Details drill-through page with a dynamic title and test it from a Top 10 products chart.',
      hint: 'Drill-through well + SELECTEDVALUE title.',
      solution:
        'New page, drag Product[ProductName] to Drill through. Title measure:\nProduct Title = "Details for " & SELECTEDVALUE ( Product[ProductName], "selected products" )\nAdd a card/text box with fx title, cards for Total Sales, Quantity, Margin; a line chart by month; a table of top customers. Hide the page. On the Top 10 chart: right-click a bar > Drill through > Product Details.',
    },
    {
      task: 'Create a collapsible slicer panel: a "Filters" button opens a panel with three slicers and a "Close" button hides it.',
      hint: 'Group objects in the Selection pane; two bookmarks with Data unticked.',
      solution:
        '1. Add a rectangle (panel background), 3 slicers and a Close button; group them as "Filter Panel" in the Selection pane.\n2. Panel visible > bookmark "Panel Open" (untick Data, Selected visuals = the group).\n3. Hide group > bookmark "Panel Closed" (same options).\n4. "Filters" button > Action Bookmark: Panel Open. Close button > Action Bookmark: Panel Closed.\n5. Test with Ctrl+click in Desktop.',
    },
    {
      task: 'Set a donut chart (Sales by Segment) to cross-filter instead of cross-highlight the monthly column chart, and make the KPI card ignore it.',
      hint: 'Edit interactions.',
      solution:
        'Select the donut > Format > Edit interactions > over the column chart click the Filter icon; over the KPI card click None. Click Edit interactions again to exit.',
    },
  ],
  quiz: [
    {
      question: 'Which filter level can filter on a measure such as [Total Sales] > 10000?',
      options: ['Report-level', 'Page-level', 'Visual-level', 'Drill-through'],
      answer: 2,
      explanation: 'Only visual-level filters can filter on measures.',
    },
    {
      question: 'In the Sync slicers pane, what does unticking "Visible" but keeping "Sync" on a page do?',
      options: ['The slicer is deleted from that page', 'The slicer is hidden on that page but its selection still filters it', 'The page is unfiltered', 'The slicer becomes a page filter that users can edit'],
      answer: 1,
      explanation: 'Sync controls filtering; Visible controls display. A hidden synced slicer still filters the page.',
    },
    {
      question: 'Which feature lets users right-click a data point and navigate to a detail page filtered to that item?',
      options: ['Drill-down', 'Drill-through', 'Bookmark', 'Cross-highlight'],
      answer: 1,
      explanation: 'Drill-through navigates to a target page filtered by the selected item.',
    },
    {
      question: 'A show/hide bookmark keeps resetting slicers. Which option should be unticked?',
      options: ['Display', 'Current page', 'Data', 'All visuals'],
      answer: 2,
      explanation: 'The Data option stores filter/slicer state; untick it for visibility-only bookmarks.',
    },
    {
      question: 'Where do you change whether a visual is affected by clicks on another visual?',
      options: ['Selection pane', 'Edit interactions', 'Sync slicers', 'Bookmarks pane'],
      answer: 1,
      explanation: 'Format > Edit interactions sets Filter/Highlight/None per target visual.',
    },
    {
      question: 'What must be enabled on a page to use it as a report page tooltip?',
      options: ['Hide page', 'Allow use as tooltip', 'Keep all filters', 'Cross-report drill-through'],
      answer: 1,
      explanation: 'Page information > Allow use as tooltip must be On; then select it in the source visual\'s Tooltips settings.',
    },
  ],
};
