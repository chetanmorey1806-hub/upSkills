export default {
  id: 'day-60-final-project-test-interview',
  title: 'Final Excel Project, Practical Test and Interview Questions',
  module: 'Module 8: Automation & Professional Skills',
  day: 60,
  level: 'Advanced',
  duration: '4 hours',
  summary: 'Put all 60 days together: build a complete Sales MIS & Dashboard for a distributor (tables, lookups, conditional summaries, PivotTables, charts, What-If, macro, protection and print), then take a timed practical test and revise with 25 mixed interview questions from every module.',
  objectives: [
    'Plan and build an end-to-end Excel reporting project from raw data to a protected, printable dashboard',
    'Apply formulas from every module: XLOOKUP, IF, SUMIFS, COUNTIFS, AVERAGEIFS, INDEX/MATCH, TEXT, ROUND',
    'Create PivotTables, PivotCharts, slicers, KPI cards and conditional formatting for an interactive report',
    'Use Goal Seek, a VBA refresh macro with a button, sheet protection and print setup in a real workflow',
    'Self-assess with a 100-mark practical test and prepare for job interviews with mixed questions',
  ],
  theory: [
    {
      heading: 'Project brief: Sai Traders Sales MIS & Dashboard',
      content: '**Client**: Sai Traders Pvt Ltd, an electronics and furniture distributor with three regions (North, South, West).\n\n**Problem**: Every month the accounts team copies orders into Excel, types rates manually, makes totals with a calculator and emails a messy sheet to the director. Mistakes are common and it takes two days.\n\n**Your task**: Build a workbook `SaiTraders_MIS.xlsm` with these sheets:\n\n1. **Products**: master list (Product, Category, Rate, Cost) as Table `tblProducts`.\n2. **Sales**: order data as Table `tblSales` with automatic calculated columns.\n3. **Summary**: region, salesperson, category and month analysis with formulas, plus a small **KPI** sheet that holds the values shown on the dashboard cards.\n4. **Pivot**: PivotTables used by the charts.\n5. **Dashboard**: KPI cards, charts, slicers, region selector, refresh button.\n6. **Target**: What-If analysis for next month.\n\n**Raw data (April-May 2025)**:\n\n- Products: Laptop (Electronics, Rate ₹55,000, Cost ₹48,000), Mobile (Electronics, ₹18,000, ₹15,000), Printer (Electronics, ₹12,000, ₹9,500), Chair (Furniture, ₹4,500, ₹3,000), Table (Furniture, ₹9,000, ₹6,500).\n- Sales: 10 orders, OrderID 1001-1010 (see Example 1 for the full table).\n\n**Deliverables checked by the director**: correct totals, a one-page dashboard, a protected file that others cannot break, a PDF printout, and one-click refresh for next month.',
      tip: 'Before touching Excel, write the list of outputs the user needs (KPIs, charts, filters). Then design inputs and calculations backwards from those outputs. This is how professionals plan MIS reports.',
    },
    {
      heading: 'Solution phase 1-2: Data setup and calculations (Modules 1-5)',
      content: '**Phase 1: Data setup**\n\n1. Enter Products in A1:D6 of sheet Products. Click inside, **Ctrl+T** > My table has headers > OK. **Table Design > Properties > Table Name**: `tblProducts`.\n2. Enter Sales columns OrderID, Date, Region, Salesperson, Product, Qty on sheet Sales. Ctrl+T, name it `tblSales`.\n3. If data comes as a CSV each month, import it with **Data > From Text/CSV > Transform Data**, trim text, set types and Close & Load To the Sales sheet (Day 54).\n4. Data validation: select the Region column > **Data > Data Tools > Data Validation > List**, Source: `North,South,West`. Product column: List with Source `=INDIRECT("tblProducts[Product]")`. Qty: Whole number greater than 0 with an Error Alert.\n5. Remove duplicate OrderIDs: Data > Data Tools > Remove Duplicates (OrderID only).\n\n**Phase 2: Calculated columns in tblSales** (type once in the first row, the Table fills down):\n\n- Category: `=XLOOKUP([@Product],tblProducts[Product],tblProducts[Category],"Not found")`\n- Rate: `=XLOOKUP([@Product],tblProducts[Product],tblProducts[Rate])`\n- Amount: `=[@Qty]*[@Rate]`\n- GST: `=ROUND([@Amount]*18%,2)`\n- Total: `=[@Amount]+[@GST]`\n- Profit: `=[@Qty]*([@Rate]-XLOOKUP([@Product],tblProducts[Product],tblProducts[Cost]))`\n- Month: `=TEXT([@Date],"mmm-yy")`\n- Size: `=IF([@Amount]>=100000,"Large",IF([@Amount]>=40000,"Medium","Small"))`\n\nFormat Amount, GST, Total and Profit with Ctrl+Shift+1 or Indian style number format, Date as dd-mm-yyyy.',
    },
    {
      heading: 'Solution phase 3: Summary analysis (Modules 3, 5, 6)',
      content: 'On sheet **Summary**:\n\n1. Region table: A2:A4 = North, South, West.\n   - Sales: `=SUMIFS(tblSales[Amount],tblSales[Region],A2)`\n   - Orders: `=COUNTIFS(tblSales[Region],A2)`\n   - Avg Order: `=IFERROR(AVERAGEIFS(tblSales[Amount],tblSales[Region],A2),0)`\n   - Profit: `=SUMIFS(tblSales[Profit],tblSales[Region],A2)`\n   - Share %: `=B2/SUM($B$2:$B$4)` (absolute reference)\n2. Salesperson table: get a unique list with `=SORT(UNIQUE(tblSales[Salesperson]))` (or type names), then `=SUMIFS(tblSales[Amount],tblSales[Salesperson],H2#)`.\n3. Month table: Apr-25 and May-25 with `=SUMIFS(tblSales[Amount],tblSales[Month],"Apr-25")`, or better, with date ranges: `=SUMIFS(tblSales[Amount],tblSales[Date],">="&DATE(2025,4,1),tblSales[Date],"<="&EOMONTH(DATE(2025,4,1),0))`.\n4. Top performer: `=INDEX(H2:H6,MATCH(MAX(I2:I6),I2:I6,0))` or `=XLOOKUP(MAX(I2:I6),I2:I6,H2:H6)`.\n\n**Pivot sheet**: Insert > PivotTable > tblSales > New Worksheet. Rows: Date (right-click > Group > Months), Columns: Region, Values: Sum of Amount. A second PivotTable with Rows: Category, Values: Sum of Amount and Sum of Profit.',
    },
    {
      heading: 'Solution phase 4: Dashboard (Modules 4, 6)',
      content: '1. Add a sheet **Dashboard**. Remove gridlines: View > Show > untick Gridlines.\n2. **Title bar**: merge B1:M2 (Home > Alignment > Merge & Center), fill dark blue, white bold 20 pt text "Sai Traders Sales Dashboard - Apr-May 2025".\n3. **KPI cards** (rounded rectangle shapes linked to cells): select a shape, click the formula bar, type `=KPI!B2` and press Enter. Cards: Total Sales, Total Profit, Profit Margin %, Orders, Average Order Value.\n4. **Charts**: from the PivotTables use PivotTable Analyze > Tools > PivotChart:\n   - Clustered Column: month-wise sales by region\n   - Doughnut: category share\n   - Bar: salesperson ranking (sorted descending)\n   Move each chart to Dashboard (right-click > Move Chart or cut-paste), delete unnecessary gridlines/legends, add data labels.\n5. **Slicers**: click a PivotTable > PivotTable Analyze > Filter > Insert Slicer > Region, Category. Connect each slicer to all PivotTables via Slicer > Report Connections. Add a **Timeline** for Date (Insert Timeline).\n6. **Region selector**: a cell with a Data Validation drop-down (North/South/West) and a card using `=SUMIFS(tblSales[Amount],tblSales[Region],$P$4)`.\n7. **Conditional formatting** on the Summary table: Data Bars on Sales, Icon Sets on Share %, and a rule to highlight Profit < 30000 in red.\n8. Align everything with Shape Format > Arrange > Align, and group with Ctrl+G objects.',
    },
    {
      heading: 'Solution phase 5: What-If, automation, protection and printing (Modules 7-8)',
      content: '1. **Target sheet (Goal Seek)**: B2 = May sales 241000 (from the PivotTable month total), B3 = growth % (0%), B4 = `=B2*(1+B3)`. Data > What-If Analysis > Goal Seek: Set cell B4, To value 317000 (April level), By changing cell B3.\n2. **Scenario Manager** (optional): Best/Likely/Worst growth % with a Scenario Summary.\n3. **Macro**: write `RefreshDashboard` (see Example 6) that unprotects, runs RefreshAll, stamps the time and re-protects. Insert a shape "Refresh" on Dashboard > right-click > Assign Macro. Save as **.xlsm**.\n4. **Protection**: unlock only the region selector cell, then Review > Protect Sheet on Dashboard and Summary (allow Use PivotTable & PivotChart and Use AutoFilter). Review > Protect Workbook > Structure.\n5. **Print**: Dashboard > Page Layout > Orientation Landscape, Size A4, Scale to Fit Width 1 / Height 1, Print Area = B1:Q30, footer "Page &[Page] of &[Pages]" and &[Date]. File > Export > Create PDF/XPS.\n6. **Documentation**: add an "About" sheet with purpose, data source, refresh steps and owner name. Professionals always document their files.',
    },
    {
      heading: 'Practical test (100 marks, 90 minutes)',
      content: 'Use the same Sai Traders data in a new workbook. Do not look at the solution until you finish. Answers are in the Practice section below.\n\n1. **(10 marks)** Convert both ranges to Tables named tblProducts and tblSales. Add data validation on Region (list) and Qty (whole number > 0).\n2. **(15 marks)** Add calculated columns Category, Rate, Amount, GST (18%), Total and Profit using XLOOKUP and structured references. State the grand total of Amount and Total.\n3. **(15 marks)** Build a region summary with SUMIFS, COUNTIFS and AVERAGEIFS. Which region has the highest sales and what is its share %?\n4. **(15 marks)** Build a PivotTable of sales by month (grouped dates) and category, with a PivotChart and a Region slicer. Give the April and May totals.\n5. **(10 marks)** Classify each order as Large/Medium/Small and count them with COUNTIF. Highlight Large orders with conditional formatting.\n6. **(10 marks)** Use Goal Seek to find the growth % May needs to reach April sales.\n7. **(15 marks)** Record or write a macro that formats the Summary header and assign it to a button; save as .xlsm.\n8. **(10 marks)** Protect the KPI sheet (only the region selector cell editable), and set the Dashboard to print on one landscape A4 page with page numbers.\n\nGrading: 90+ Excellent (job-ready), 75-89 Good, 60-74 Revise Modules 5-7, below 60 repeat the practice files.',
    },
  ],
  examples: [
    {
      title: 'Step 1: Sales table with calculated columns',
      scenario: 'Fill the tblSales Table with XLOOKUP-based calculated columns and find the grand totals.',
      table: {
        headers: ['A: OrderID', 'B: Date', 'C: Region', 'D: Salesperson', 'E: Product', 'F: Qty', 'G: Amount', 'H: Profit'],
        rows: [
          ['1001', '01-04-2025', 'North', 'Amit', 'Laptop', '2', '110000', '14000'],
          ['1002', '03-04-2025', 'South', 'Kiran', 'Mobile', '5', '90000', '15000'],
          ['1003', '05-04-2025', 'West', 'Rahul', 'Chair', '10', '45000', '15000'],
          ['1004', '08-04-2025', 'North', 'Riya', 'Printer', '3', '36000', '7500'],
          ['1005', '12-04-2025', 'South', 'Meena', 'Table', '4', '36000', '10000'],
          ['1006', '15-05-2025', 'West', 'Rahul', 'Laptop', '1', '55000', '7000'],
          ['1007', '18-05-2025', 'North', 'Amit', 'Mobile', '6', '108000', '18000'],
          ['1008', '22-05-2025', 'South', 'Kiran', 'Chair', '8', '36000', '12000'],
          ['1009', '25-05-2025', 'North', 'Riya', 'Table', '2', '18000', '5000'],
          ['1010', '28-05-2025', 'West', 'Rahul', 'Printer', '2', '24000', '5000'],
        ],
      },
      steps: [
        'Enter OrderID to Qty (A:F) and press Ctrl+T > OK. Table Design > Table Name: tblSales.',
        'In the Products sheet create tblProducts (Product, Category, Rate, Cost).',
        'In the first empty column header of tblSales type Rate, then in the first data cell type =XLOOKUP([@Product],tblProducts[Product],tblProducts[Rate]) and press Enter. The whole column fills.',
        'Add column Amount: =[@Qty]*[@Rate].',
        'Add column GST: =ROUND([@Amount]*18%,2) and Total: =[@Amount]+[@GST].',
        'Add column Profit: =[@Qty]*([@Rate]-XLOOKUP([@Product],tblProducts[Product],tblProducts[Cost])).',
        'Table Design > Table Style Options > tick Total Row. Set Amount, Total and Profit total cells to Sum.',
      ],
      code: '=[@Qty]*[@Rate]\n=ROUND([@Amount]*18%,2)\n=[@Qty]*([@Rate]-XLOOKUP([@Product],tblProducts[Product],tblProducts[Cost]))\nTotal Row: =SUBTOTAL(109,[Amount])',
      result: 'Total Amount ₹5,58,000 | Total GST ₹1,00,440 | Total incl. GST ₹6,58,440 | Total Profit ₹1,08,500',
      explanation: 'Laptop order 1001: 2 x 55000 = 110000, profit 2 x (55000 - 48000) = 14000. Structured references auto-fill and expand when new rows are added. The Total Row uses SUBTOTAL(109), so it respects filters.',
    },
    {
      title: 'Step 2: Region summary with SUMIFS, COUNTIFS, AVERAGEIFS',
      scenario: 'On sheet Summary build a region-wise table with Sales, Orders, Average Order, Profit and Share %.',
      table: {
        headers: ['A: Region', 'B: Sales', 'C: Orders', 'D: Avg Order', 'E: Profit', 'F: Share %'],
        rows: [['North', '=SUMIFS(tblSales[Amount],tblSales[Region],A2)', '=COUNTIFS(tblSales[Region],A2)', '=AVERAGEIFS(tblSales[Amount],tblSales[Region],A2)', '=SUMIFS(tblSales[Profit],tblSales[Region],A2)', '=B2/SUM($B$2:$B$4)'], ['South', '', '', '', '', ''], ['West', '', '', '', '', '']],
      },
      steps: [
        'Type headers in A1:F1 and regions in A2:A4.',
        'Enter the formulas in row 2 as shown.',
        'Select B2:F2 and drag the fill handle down to row 4.',
        'Format F2:F4 as Percentage with 1 decimal (Ctrl+Shift+5 then Increase Decimal).',
        'In A5 type Total and in B5 =SUM(B2:B4); C5 =SUM(C2:C4); E5 =SUM(E2:E4).',
        'Apply Home > Conditional Formatting > Data Bars on B2:B4.',
      ],
      code: '=SUMIFS(tblSales[Amount],tblSales[Region],A2)\n=COUNTIFS(tblSales[Region],A2)\n=AVERAGEIFS(tblSales[Amount],tblSales[Region],A2)\n=B2/SUM($B$2:$B$4)',
      result: 'North 2,72,000 | 4 | 68,000 | 44,500 | 48.7%\nSouth 1,62,000 | 3 | 54,000 | 37,000 | 29.0%\nWest 1,24,000 | 3 | 41,333.33 | 27,000 | 22.2%\nTotal 5,58,000 | 10 | | 1,08,500',
      explanation: 'North = 110000 + 36000 + 108000 + 18000 = 272000 from 4 orders, average 68000. Share = 272000 / 558000 = 48.7%. $B$2:$B$4 is absolute so the denominator stays fixed when filled down.',
    },
    {
      title: 'Step 3: KPI cards, top performer and interactive region selector',
      scenario: 'Prepare the cells that feed the Dashboard KPI cards, including a drop-down that changes one card.',
      table: {
        headers: ['A: KPI', 'B: Formula'],
        rows: [
          ['Total Sales', '=SUM(tblSales[Amount])'],
          ['Total Profit', '=SUM(tblSales[Profit])'],
          ['Profit Margin', '=B3/B2'],
          ['Orders', '=ROWS(tblSales)'],
          ['Avg Order Value', '=B2/B5'],
          ['Top Salesperson', '=XLOOKUP(MAX(Summary!I2:I6),Summary!I2:I6,Summary!H2:H6)'],
          ['Selected Region', 'North (drop-down)'],
          ['Region Sales', '=SUMIFS(tblSales[Amount],tblSales[Region],B8)'],
        ],
      },
      steps: [
        'In Summary H2 type =SORT(UNIQUE(tblSales[Salesperson])) (spills Amit, Kiran, Meena, Rahul, Riya into H2:H6).',
        'In I2 type =SUMIFS(tblSales[Amount],tblSales[Salesperson],H2#) (spills five totals).',
        'Add a new sheet named KPI. Type the KPI labels in A2:A9 and the formulas in B2:B7 as shown.',
        'On sheet KPI select B8 > Data > Data Validation > Allow: List > Source: North,South,West > OK. Choose North.',
        'In B9 type =SUMIFS(tblSales[Amount],tblSales[Region],B8).',
        'On Dashboard insert a rounded rectangle, select it, type =KPI!B2 in the formula bar and press Enter. Repeat for each card. Format numbers in the source cells.',
      ],
      code: '=SUMIFS(tblSales[Amount],tblSales[Salesperson],H2#)\n=XLOOKUP(MAX(Summary!I2:I6),Summary!I2:I6,Summary!H2:H6)\n=SUMIFS(tblSales[Amount],tblSales[Region],B8)',
      result: 'Total Sales 5,58,000 | Profit 1,08,500 | Margin 19.4% | Orders 10 | AOV 55,800 | Top Salesperson Amit (2,18,000) | Region Sales (North) 2,72,000',
      explanation: 'Salesperson totals: Amit 218000, Kiran 126000, Meena 36000, Rahul 124000, Riya 54000; MAX is 218000 so XLOOKUP returns Amit. Margin = 108500 / 558000 = 19.44%. Changing B8 to West changes the Region Sales card to 1,24,000.',
    },
    {
      title: 'Step 4: PivotTable, PivotChart and slicer by month',
      scenario: 'Create a month x region PivotTable with a column chart and a Region slicer for the dashboard.',
      steps: [
        'Click inside tblSales > Insert > Tables > PivotTable > New Worksheet > OK. Rename the sheet Pivot.',
        'Drag Date to Rows. If Excel adds Months/Quarters automatically keep Months; otherwise right-click a date > Group > Months > OK.',
        'Drag Region to Columns and Amount to Values (Sum of Amount). Value Field Settings > Number Format > Number, 0 decimals, 1000 separator.',
        'PivotTable Analyze > Tools > PivotChart > Clustered Column > OK.',
        'PivotTable Analyze > Filter > Insert Slicer > tick Region and Category > OK.',
        'Cut the chart and slicers and paste them on Dashboard. Slicer > Report Connections: tick all PivotTables.',
        'Click North in the slicer to test, then clear the filter (Alt+C or the funnel icon).',
      ],
      result: 'Apr: North 1,46,000 | South 1,26,000 | West 45,000 | Total 3,17,000\nMay: North 1,26,000 | South 36,000 | West 79,000 | Total 2,41,000\nGrand Total 5,58,000',
      explanation: 'April North = 110000 + 36000 = 146000; May North = 108000 + 18000 = 126000. The PivotTable recalculates when you click Refresh (Alt+F5) after adding new orders to tblSales; because the source is a Table, new rows are included automatically.',
    },
    {
      title: 'Step 5: Goal Seek for next month growth',
      scenario: 'May sales (₹2,41,000) fell below April (₹3,17,000). What growth % is needed in June over May to get back to the April level?',
      table: { headers: ['A: Item', 'B: Value'], rows: [['May Sales', '241000'], ['Growth %', '0%'], ['June Target', '=B2*(1+B3)']] },
      steps: [
        'On sheet Target enter the values and formula as shown.',
        'Data > Forecast > What-If Analysis > Goal Seek.',
        'Set cell: B4. To value: 317000. By changing cell: B3.',
        'Click OK and OK. Format B3 as Percentage with 2 decimals.',
      ],
      code: '=B2*(1+B3)',
      result: 'Growth % = 31.54% (June target = ₹3,17,000)',
      explanation: '317000 / 241000 = 1.3154, so 31.54% growth is required. Goal Seek is perfect for this "how much do I need" question. Add a Scenario Manager with Best 35%, Likely 20%, Worst 5% to present options to the director.',
    },
    {
      title: 'Step 6: One-click refresh and PDF export macro with a button',
      scenario: 'The protected Dashboard must refresh all PivotTables and queries, stamp the refresh time, and export a PDF beside the workbook, all with one button.',
      steps: [
        'Alt+F11 > Insert > Module. Paste the code.',
        'Change the password constant to your own.',
        'Back in Excel, Insert > Shapes > Rounded Rectangle on Dashboard, type Refresh & PDF.',
        'Right-click the shape > Assign Macro > RefreshDashboard > OK.',
        'File > Save As > Excel Macro-Enabled Workbook (.xlsm).',
        'Add a new order to tblSales, click the button and check the dashboard and the PDF file.',
      ],
      code: `Option Explicit

Const DASH_PWD As String = "Dash@2025"

Sub RefreshDashboard()
    Dim ws As Worksheet
    Dim pdfPath As String

    On Error GoTo ErrHandler
    Application.ScreenUpdating = False

    Set ws = ThisWorkbook.Worksheets("Dashboard")
    ws.Unprotect Password:=DASH_PWD
    ThisWorkbook.Worksheets("Pivot").Unprotect Password:=DASH_PWD

    ThisWorkbook.RefreshAll                 ' queries, connections and PivotTables
    Application.CalculateUntilAsyncQueriesDone

    ws.Range("B3").Value = "Last refreshed: " & Format(Now, "dd-mmm-yyyy hh:mm")

    pdfPath = ThisWorkbook.Path & Application.PathSeparator & _
              "Sales_Dashboard_" & Format(Date, "yyyy-mm-dd") & ".pdf"
    ws.ExportAsFixedFormat Type:=xlTypePDF, Filename:=pdfPath, _
        Quality:=xlQualityStandard, IgnorePrintAreas:=False, OpenAfterPublish:=False

    MsgBox "Dashboard refreshed and saved as PDF:" & vbNewLine & pdfPath, vbInformation

CleanExit:
    ThisWorkbook.Worksheets("Pivot").Protect Password:=DASH_PWD, AllowUsingPivotTables:=True
    ws.Protect Password:=DASH_PWD, AllowUsingPivotTables:=True
    Application.ScreenUpdating = True
    Exit Sub

ErrHandler:
    MsgBox "Refresh failed: " & Err.Description, vbCritical
    If ws Is Nothing Then
        Application.ScreenUpdating = True
        Exit Sub
    End If
    Resume CleanExit
End Sub`,
      result: 'Dashboard refreshed, B3 shows "Last refreshed: <date time>", PDF saved as Sales_Dashboard_<yyyy-mm-dd>.pdf in the workbook folder',
      explanation: 'Protected sheets block PivotTable refresh, so the macro unprotects, refreshes and re-protects. CalculateUntilAsyncQueriesDone waits for background queries. Application.PathSeparator avoids hard-coding a backslash. The error handler always restores protection and screen updating.',
    },
  ],
  interview: [
    { q: '(Module 1) What is the difference between a workbook and a worksheet? How many rows and columns does a modern worksheet have?', a: 'A workbook is the Excel file (.xlsx); a worksheet is one sheet/tab inside it. A modern worksheet has 1,048,576 rows and 16,384 columns (A to XFD).', level: 'Easy' },
    { q: '(Module 1) What is the difference between .xlsx, .xlsm, .xlsb and .csv?', a: '.xlsx is the standard macro-free workbook; .xlsm stores macros; .xlsb is a binary workbook (smaller, faster, can store macros); .csv is plain text with comma-separated values, one sheet only, no formatting or formulas.', level: 'Easy' },
    { q: '(Module 1) A number shows as ##### in a cell. Why?', a: 'The column is too narrow to show the formatted number or date (or a date/time is negative). Double-click the column border to AutoFit or widen the column.', level: 'Easy' },
    { q: '(Module 2) Explain relative, absolute and mixed references with an example.', a: 'Relative (A1) changes when copied. Absolute ($A$1) never changes, used for fixed rates like GST in $B$1. Mixed ($A1 or A$1) locks only the column or row, used in multiplication tables. Press F4 to cycle through them.', level: 'Easy' },
    { q: '(Module 2) What is the difference between COUNT, COUNTA and COUNTBLANK?', a: 'COUNT counts cells with numbers, COUNTA counts non-empty cells (numbers, text, errors), COUNTBLANK counts empty cells (including formulas that return "").', level: 'Easy' },
    { q: '(Module 2) How do you remove extra spaces and fix name case in imported data?', a: 'Use =PROPER(TRIM(A2)). TRIM removes leading/trailing and repeated spaces, PROPER capitalises each word. For non-breaking spaces from the web use SUBSTITUTE(A2,CHAR(160)," ") first; CLEAN removes non-printable characters.', level: 'Medium' },
    { q: '(Module 3) Write a formula for grade: >= 75 "Distinction", >= 35 "Pass", else "Fail".', a: '=IF(B2>=75,"Distinction",IF(B2>=35,"Pass","Fail")). In Microsoft 365 you can also use =IFS(B2>=75,"Distinction",B2>=35,"Pass",TRUE,"Fail"). Check the highest condition first.', level: 'Easy' },
    { q: '(Module 3) Difference between SUMIF and SUMIFS?', a: 'SUMIF has one condition and the sum range is the last argument: SUMIF(range, criteria, [sum_range]). SUMIFS supports multiple conditions with AND logic and the sum range comes first: SUMIFS(sum_range, criteria_range1, criteria1, ...).', level: 'Medium' },
    { q: '(Module 3) When would you use IFNA instead of IFERROR?', a: 'IFNA catches only #N/A (e.g. lookup value not found), while IFERROR hides every error including #DIV/0!, #VALUE! and #REF!, which may hide real mistakes. Use IFNA around lookups to show "Not found" but still see other errors.', level: 'Medium' },
    { q: '(Module 4) How do you find and remove duplicate invoice numbers?', a: 'Highlight them first with Home > Conditional Formatting > Highlight Cells Rules > Duplicate Values to review. Then Data > Data Tools > Remove Duplicates, tick only the Invoice No column. Or use =COUNTIF($A$2:$A$500,A2)>1 as a flag column.', level: 'Easy' },
    { q: '(Module 4) How do you create a dependent drop-down list (State -> City)?', a: 'Create named ranges for each state containing its cities (name = state name). First drop-down: Data Validation list of states. Second: Data Validation List with Source =INDIRECT(A2). In Microsoft 365 you can also use FILTER-based spill ranges with =D2# as the source.', level: 'Hard' },
    { q: '(Module 4) What is the difference between AutoFilter and Advanced Filter?', a: 'AutoFilter adds drop-down arrows to filter in place with simple criteria. Advanced Filter uses a criteria range for complex AND/OR conditions, can copy results to another location and can extract unique records only.', level: 'Medium' },
    { q: '(Module 5) What are the limitations of VLOOKUP and how does XLOOKUP solve them?', a: 'VLOOKUP looks only to the right, uses a hard-coded column number that breaks when columns are inserted, defaults to approximate match and returns only the first match. XLOOKUP looks in any direction, uses a return range, defaults to exact match, has a built-in if_not_found argument, can search last-to-first and returns multiple columns.', level: 'Medium' },
    { q: '(Module 5) Write an INDEX-MATCH formula for a two-way lookup.', a: '=INDEX(B2:M20, MATCH("Riya",A2:A20,0), MATCH("Mar",B1:M1,0)). The first MATCH finds the row, the second the column, INDEX returns the intersection. 0 means exact match.', level: 'Hard' },
    { q: '(Module 5) How do you calculate an employee\'s exact age or service in years and months?', a: '=DATEDIF(B2,TODAY(),"y") & " years " & DATEDIF(B2,TODAY(),"ym") & " months". DATEDIF is a hidden function; the start date must be before the end date. For working days use NETWORKDAYS(start,end,holidays).', level: 'Medium' },
    { q: '(Module 6) What are the advantages of Excel Tables?', a: 'Auto-expanding ranges for formulas, charts and PivotTables; structured references like tblSales[Amount]; automatic fill-down of calculated columns; banded formatting; built-in filters and Total Row; easy use as Power Query/Data Model sources.', level: 'Easy' },
    { q: '(Module 6) Your PivotTable does not show newly added data. Why and how do you fix it?', a: 'PivotTables do not refresh automatically and the source range may not include new rows. Convert the source to a Table so it expands, then PivotTable Analyze > Refresh (Alt+F5) or Refresh All (Ctrl+Alt+F5). Optionally set PivotTable Options > Data > Refresh data when opening the file.', level: 'Medium' },
    { q: '(Module 6) What is a slicer and how do you connect one slicer to multiple PivotTables?', a: 'A slicer is a visual filter button panel. Insert it from PivotTable Analyze > Insert Slicer. To control several PivotTables built on the same source/cache, select the slicer > Slicer > Report Connections and tick all required PivotTables.', level: 'Medium' },
    { q: '(Module 6) When would you use a combo chart and a waterfall chart?', a: 'A combo chart shows two different measures together, such as Sales (columns) and Profit Margin % (line on a secondary axis). A waterfall chart shows how a starting value changes through positive and negative steps to an ending value, e.g. opening balance to closing balance or profit bridge.', level: 'Medium' },
    { q: '(Module 7) Compare Goal Seek, Scenario Manager and Data Tables.', a: 'Goal Seek finds the single input value that gives a target result. Scenario Manager saves named sets of up to 32 inputs and creates a summary report. Data Tables show a formula\'s results for many values of one or two inputs at once in a grid.', level: 'Medium' },
    { q: '(Module 7) What is the difference between Power Query and Power Pivot?', a: 'Power Query is for getting and cleaning/shaping data (ETL) using M; it loads tables. Power Pivot is for modelling: storing many tables in the Data Model, creating relationships and writing DAX measures for analysis. Typically Power Query feeds Power Pivot, and both exist in Power BI.', level: 'Medium' },
    { q: '(Module 7) What is a DAX measure? Give an example.', a: 'A measure is a calculation evaluated at query time based on the PivotTable or visual filter context. Example: Total Sales := SUM(Sales[Amount]) or Margin % := DIVIDE([Profit],[Total Sales]). Measures are not stored row by row like calculated columns.', level: 'Medium' },
    { q: '(Module 8) Can macros be recorded with conditions and loops?', a: 'No. The recorder captures only actions. Conditions (If, Select Case), loops (For, For Each, Do), variables, message boxes and error handling must be written in the VBA Editor.', level: 'Easy' },
    { q: '(Module 8) Write VBA to find the last row and loop through column B.', a: 'Dim i As Long, lastRow As Long: lastRow = Cells(Rows.Count, "B").End(xlUp).Row: For i = 2 To lastRow: Debug.Print Cells(i, "B").Value: Next i. Use Long, not Integer, because rows exceed 32,767.', level: 'Medium' },
    { q: '(Module 8) How do you allow editing only in input cells and still let users use slicers and PivotTables?', a: 'Unlock input cells (Ctrl+1 > Protection > untick Locked), then Review > Protect Sheet and tick Use PivotTable & PivotChart and Edit objects (for slicers) along with Select unlocked cells. Refresh macros should unprotect and re-protect the sheet.', level: 'Hard' },
    { q: '(Scenario) Your manager says the monthly report takes two days. How would you automate it in Excel?', a: 'Use Power Query to import and clean the monthly files from a folder; load to an Excel Table or the Data Model; build PivotTables/DAX measures and a dashboard with slicers; add a RefreshAll macro button and PDF export; protect the sheets and document refresh steps. Next month only the new file is dropped into the folder and Refresh is clicked.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Practical Test Q1-Q2 answers: Create tblProducts and tblSales, add validation, and add Category, Rate, Amount, GST, Total and Profit columns. What are the grand totals?',
      hint: 'Ctrl+T, Table Name, XLOOKUP with structured references.',
      solution: '1. Ctrl+T on each range; Table Design > Table Name tblProducts / tblSales.\n2. Region: Data Validation > List > North,South,West. Qty: Whole number > greater than > 0, Error Alert Stop.\n3. Columns: Category =XLOOKUP([@Product],tblProducts[Product],tblProducts[Category]); Rate =XLOOKUP([@Product],tblProducts[Product],tblProducts[Rate]); Amount =[@Qty]*[@Rate]; GST =ROUND([@Amount]*18%,2); Total =[@Amount]+[@GST]; Profit =[@Qty]*([@Rate]-XLOOKUP([@Product],tblProducts[Product],tblProducts[Cost])).\nAnswers: Amount ₹5,58,000; GST ₹1,00,440; Total ₹6,58,440; Profit ₹1,08,500.',
    },
    {
      task: 'Practical Test Q3 answer: Region summary. Which region is highest and its share?',
      hint: 'SUMIFS / COUNTIFS / AVERAGEIFS; share = region / total.',
      solution: 'Formulas: =SUMIFS(tblSales[Amount],tblSales[Region],A2), =COUNTIFS(tblSales[Region],A2), =AVERAGEIFS(tblSales[Amount],tblSales[Region],A2), =B2/SUM($B$2:$B$4).\nNorth 272000 (4 orders, avg 68000), South 162000 (3, 54000), West 124000 (3, 41333.33).\nHighest: North, 48.7% share. Formula for the name: =INDEX(A2:A4,MATCH(MAX(B2:B4),B2:B4,0)).',
    },
    {
      task: 'Practical Test Q4 answer: PivotTable by month and category with PivotChart and Region slicer. Give the April and May totals and category totals.',
      hint: 'Group the Date field by Months.',
      solution: 'Insert > PivotTable > tblSales > Rows: Date (Group > Months), Columns: Category, Values: Sum of Amount. PivotTable Analyze > PivotChart > Clustered Column. Insert Slicer > Region.\nApril: Electronics 2,36,000 + Furniture 81,000 = 3,17,000.\nMay: Electronics 1,87,000 + Furniture 54,000 = 2,41,000.\nCategory totals: Electronics 4,23,000; Furniture 1,35,000.',
    },
    {
      task: 'Practical Test Q5 answer: Order size classification and counts. Highlight Large orders.',
      hint: 'Nested IF; COUNTIF; conditional formatting with a formula.',
      solution: 'Size column: =IF([@Amount]>=100000,"Large",IF([@Amount]>=40000,"Medium","Small")).\nCounts: =COUNTIF(tblSales[Size],"Large") = 2 (1001, 1007); Medium = 3 (1002, 1003, 1006); Small = 5.\nHighlight: select table data rows > Home > Conditional Formatting > New Rule > Use a formula: =$G2>=100000 (G = Amount column) > Format Fill light green > OK.',
    },
    {
      task: 'Practical Test Q6-Q7 answers: Goal Seek for growth, and a macro button that formats the Summary header.',
      hint: 'Goal Seek on =B2*(1+B3). For the macro use Range("A1:F1").',
      solution: 'Goal Seek: B2 = 241000, B3 = 0%, B4 = =B2*(1+B3). Data > What-If Analysis > Goal Seek: Set cell B4, To value 317000, By changing cell B3. Answer 31.54%.\nMacro:\nSub FormatSummaryHeader()\n    With Worksheets("Summary").Range("A1:F1")\n        .Font.Bold = True\n        .Font.Color = vbWhite\n        .Interior.Color = RGB(0, 32, 96)\n        .HorizontalAlignment = xlCenter\n    End With\n    Worksheets("Summary").Columns("A:F").AutoFit\nEnd Sub\nDeveloper > Controls > Insert > Form Controls > Button > assign FormatSummaryHeader. Save as .xlsm.',
    },
    {
      task: 'Practical Test Q8 answer: Protect the KPI sheet with only the region selector (B8) editable and set up Dashboard printing.',
      hint: 'Unlock first, then protect. Page Layout > Scale to Fit.',
      solution: '1. KPI sheet: select B8 > Ctrl+1 > Protection > untick Locked > OK. Review > Protect Sheet > password > keep Select unlocked cells > OK.\n2. Dashboard: Page Layout > Orientation Landscape, Size A4, Print Area > Set Print Area (B1:Q30), Scale to Fit Width 1 page, Height 1 page.\n3. Insert > Header & Footer > right footer "Page &[Page] of &[Pages]", left footer &[Date].\n4. Ctrl+P to preview; File > Export > Create PDF/XPS.',
    },
  ],
  quiz: [
    { question: 'In the project, which formula correctly fetches the Rate for each order inside the Table?', options: ['=VLOOKUP(E2,tblProducts,2,TRUE)', '=XLOOKUP([@Product],tblProducts[Product],tblProducts[Rate])', '=MATCH([@Product],tblProducts[Rate],0)', '=INDEX(tblProducts[Product],[@Qty])'], answer: 1, explanation: 'XLOOKUP with structured references returns the Rate for the matching product; it defaults to exact match.' },
    { question: 'Total sales are ₹5,58,000 and North sales are ₹2,72,000. North share % is about:', options: ['27.2%', '48.7%', '51.3%', '29.0%'], answer: 1, explanation: '272000 / 558000 = 0.487 = 48.7%.' },
    { question: 'Why should the PivotTable source be an Excel Table?', options: ['Tables print better', 'The source range expands automatically with new rows', 'Tables are required for slicers in all cases', 'Tables protect the data'], answer: 1, explanation: 'A Table grows with new data, so a refresh includes new rows without changing the source range.' },
    { question: 'May sales 241000, target 317000. Which tool directly finds the required growth %?', options: ['Consolidate', 'Goal Seek', 'Subtotal', 'Remove Duplicates'], answer: 1, explanation: 'Goal Seek finds the input (growth %) that makes the formula reach the target (31.54%).' },
    { question: 'A refresh macro fails on a protected Dashboard with PivotTables. Best fix?', options: ['Remove all protection permanently', 'Unprotect in the macro, refresh, then re-protect', 'Save as .xlsx', 'Use Ctrl+Z after refresh'], answer: 1, explanation: 'The macro should unprotect, run RefreshAll and protect again, ideally with an error handler that always re-protects.' },
  ],
};
