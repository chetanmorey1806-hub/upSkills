export default {
  id: 'day-58-vba-loops-conditions-buttons',
  title: 'VBA Loops, Conditions, Buttons and Automation',
  module: 'Module 8: Automation & Professional Skills',
  day: 58,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Make macros think and repeat: use If...Then...Else and Select Case for decisions, For...Next, For Each and Do loops for repetition, attach macros to buttons, and automate full reports with events, error handling and speed settings.',
  objectives: [
    'Write decisions with If...Then...ElseIf...Else and Select Case',
    'Repeat actions with For...Next, For Each...Next, Do While and Do Until loops',
    'Find the last used row so macros work on any amount of data',
    'Insert Form Control buttons and shapes and assign macros to them',
    'Automate reports using ScreenUpdating, error handling and event procedures (Workbook_Open, Worksheet_Change)',
  ],
  theory: [
    {
      heading: 'Conditions: If...Then...ElseIf...Else',
      content: 'VBA makes decisions just like the IF() function, but can run many lines for each case.\n\nComparison operators: `=`, `<>`, `>`, `<`, `>=`, `<=`. Logical operators: `And`, `Or`, `Not`.\n\nSingle-line form: `If marks >= 35 Then result = "Pass"`.\n\nBlock form (more common):',
      syntax: 'If condition1 Then\n    \' code when condition1 is True\nElseIf condition2 Then\n    \' code when condition2 is True\nElse\n    \' code when none is True\nEnd If',
      points: [
        'Conditions are checked from top to bottom; the first True block runs and the rest are skipped',
        'Put the strictest condition first (>= 90 before >= 75)',
        'Text comparison is case-sensitive by default ("north" <> "North"); use UCase() or Option Compare Text',
      ],
    },
    {
      heading: 'Select Case: cleaner multiple choices',
      content: 'When one value is tested against many options, **Select Case** is easier to read than long ElseIf chains.',
      syntax: 'Select Case expression\n    Case 0\n        \' exactly 0\n    Case 1 To 20\n        \' a range\n    Case Is > 100\n        \' a comparison\n    Case "North", "South"\n        \' list of values\n    Case Else\n        \' anything else\nEnd Select',
    },
    {
      heading: 'Loops: For...Next, For Each, Do While / Do Until',
      content: '- **For...Next**: repeat a known number of times with a counter. `For i = 2 To lastRow ... Next i`. Add `Step 2` to jump, `Step -1` to go backwards (needed when deleting rows).\n- **For Each...Next**: visit every item in a collection: each cell in a range, each sheet in a workbook. `For Each cell In Range("B2:B100") ... Next cell`.\n- **Do While condition ... Loop**: repeat as long as the condition is True.\n- **Do Until condition ... Loop**: repeat until the condition becomes True.\n- **Exit For / Exit Do**: leave a loop early.\n\n**Finding the last row** (so the macro works for 10 or 10,000 rows):\n\n`lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row`\n\nThis is the VBA version of going to the bottom of column A and pressing Ctrl+Up.',
      tip: 'Infinite loop warning: in a Do loop always change something (move to the next row) or the loop never ends. Press Ctrl+Break (or Esc) to stop a running macro.',
    },
    {
      heading: 'Buttons to run macros',
      content: '**Form Control button** (recommended, simple):\n\n1. **Developer > Controls > Insert > Form Controls > Button** (first icon).\n2. Drag on the sheet to draw the button.\n3. The **Assign Macro** dialog opens; choose the macro > OK.\n4. Right-click the button > **Edit Text** to change the caption (e.g. "Generate Report").\n5. Right-click > **Format Control** > Properties > choose "Don\'t move or size with cells" so filtering/resizing does not hide it.\n\n**Shape as a button** (looks modern): Insert > Illustrations > Shapes > Rounded Rectangle, type text, then right-click > **Assign Macro**.\n\n**ActiveX Command Button** (Developer > Controls > Insert > ActiveX Controls) has more properties but needs Design Mode and code in the sheet module; it is less stable across versions, so Form Controls are preferred for simple automation.',
    },
    {
      heading: 'Automation best practices',
      content: '- **Speed**: `Application.ScreenUpdating = False` at the start stops screen flicker; set it back to True at the end. `Application.Calculation = xlCalculationManual` speeds up large loops (restore `xlCalculationAutomatic`).\n- **Error handling**: `On Error GoTo ErrHandler` jumps to a label if something fails, where you show a message and restore settings.\n- **Avoid Select**: write `ws.Range("A1").Value = 5` instead of selecting first.\n- **Confirm destructive actions**: `If MsgBox("Delete old data?", vbYesNo) = vbNo Then Exit Sub`.\n- **Status**: `Application.StatusBar = "Processing row " & i` shows progress; set it to False at the end.',
    },
    {
      heading: 'Event procedures: macros that run automatically',
      content: 'Events run code automatically when something happens. They are written in object modules, not in Module1:\n\n- **ThisWorkbook** module: `Private Sub Workbook_Open()` runs when the file opens; `Workbook_BeforeSave`, `Workbook_BeforeClose`.\n- **Sheet** module (double-click Sheet1 in Project Explorer): `Private Sub Worksheet_Change(ByVal Target As Range)` runs when a user edits a cell; `Worksheet_Activate`, `Worksheet_SelectionChange`.\n\nIn the code window choose the object in the left drop-down (Workbook / Worksheet) and the event in the right drop-down; VBE writes the first and last lines for you.\n\nWhen an event macro itself changes cells, wrap the change with `Application.EnableEvents = False` ... `True` to avoid the event calling itself again and again.',
    },
  ],
  examples: [
    {
      title: 'Grade every student with For...Next and If...ElseIf',
      scenario: 'Sheet "Marks" has names in A and marks in B (rows 2 to 6, but the list can grow). Write the grade in C and count the failures. Rules: 90+ A+, 75+ A, 60+ B, 35+ C, below 35 Fail.',
      table: { headers: ['A: Student', 'B: Marks', 'C: Grade'], rows: [['Riya', '92', ''], ['Amit', '76', ''], ['Kiran', '58', ''], ['Meena', '34', ''], ['Rahul', '81', '']] },
      steps: [
        'Alt+F11 > Insert > Module, type the code.',
        'Return to Excel. Developer > Controls > Insert > Form Controls > Button. Draw it near E2.',
        'In Assign Macro choose AssignGrades > OK. Right-click > Edit Text: Assign Grades.',
        'Click outside, then click the button.',
      ],
      code: `Option Explicit

Sub AssignGrades()
    Dim ws As Worksheet
    Dim lastRow As Long, i As Long
    Dim marks As Double, failCount As Long

    Set ws = ThisWorkbook.Worksheets("Marks")
    lastRow = ws.Cells(ws.Rows.Count, "B").End(xlUp).Row

    For i = 2 To lastRow
        marks = ws.Cells(i, "B").Value

        If marks >= 90 Then
            ws.Cells(i, "C").Value = "A+"
        ElseIf marks >= 75 Then
            ws.Cells(i, "C").Value = "A"
        ElseIf marks >= 60 Then
            ws.Cells(i, "C").Value = "B"
        ElseIf marks >= 35 Then
            ws.Cells(i, "C").Value = "C"
        Else
            ws.Cells(i, "C").Value = "Fail"
            ws.Cells(i, "C").Font.Color = vbRed
            failCount = failCount + 1
        End If
    Next i

    MsgBox "Grades assigned to " & (lastRow - 1) & " students." & vbNewLine & _
           "Failed: " & failCount, vbInformation
End Sub`,
      result: 'Riya A+, Amit A, Kiran C, Meena Fail (red), Rahul A. Message: 5 students, Failed: 1',
      explanation: 'lastRow finds row 6, so the loop runs for rows 2 to 6. Kiran has 58: not >= 60, but >= 35, so C. Long variables start at 0, so failCount needs no initial value. Add more students and click again; it still works.',
    },
    {
      title: 'Inventory status with For Each and Select Case',
      scenario: 'Sheet "Stock" has Item (A) and Qty (B). Write status in C and colour the row: 0 = "Out of Stock" (red), 1 to 20 = "Reorder" (orange), above 20 = "OK" (no colour).',
      table: { headers: ['A: Item', 'B: Qty', 'C: Status'], rows: [['Pen', '0', ''], ['Notebook', '15', ''], ['Marker', '45', ''], ['Stapler', '8', ''], ['File', '120', '']] },
      steps: [
        'Insert > Module in VBE and type the code.',
        'Run with Alt+F8 > StockStatus > Run.',
      ],
      code: `Option Explicit

Sub StockStatus()
    Dim ws As Worksheet
    Dim cell As Range
    Dim lastRow As Long

    Set ws = Worksheets("Stock")
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row

    For Each cell In ws.Range("B2:B" & lastRow)
        Select Case cell.Value
            Case 0
                cell.Offset(0, 1).Value = "Out of Stock"
                cell.EntireRow.Range("A1:C1").Interior.Color = RGB(255, 199, 206)
            Case 1 To 20
                cell.Offset(0, 1).Value = "Reorder"
                cell.EntireRow.Range("A1:C1").Interior.Color = RGB(255, 235, 156)
            Case Else
                cell.Offset(0, 1).Value = "OK"
                cell.EntireRow.Range("A1:C1").Interior.Pattern = xlNone
        End Select
    Next cell
End Sub`,
      result: 'Pen Out of Stock (red) | Notebook Reorder (orange) | Marker OK | Stapler Reorder (orange) | File OK',
      explanation: 'For Each visits each Qty cell. Offset(0, 1) is the cell to the right (column C). EntireRow.Range("A1:C1") means columns A to C of that row. Case 1 To 20 covers a range of values; Case Else catches everything above 20.',
    },
    {
      title: 'Do Until loop: total invoices until the first blank row',
      scenario: 'Column B of sheet "Invoices" has amounts from B2 down with no gaps: 12000, 8500, 15000, 4500. Add them with a Do Until loop and write the count and total.',
      table: { headers: ['A: Invoice No', 'B: Amount'], rows: [['INV-101', '12000'], ['INV-102', '8500'], ['INV-103', '15000'], ['INV-104', '4500']] },
      steps: [
        'Type the code in a module.',
        'Run it with F5 (cursor inside the Sub).',
        'Check D2 and D3.',
      ],
      code: `Option Explicit

Sub TotalInvoices()
    Dim ws As Worksheet
    Dim r As Long, countInv As Long
    Dim total As Currency

    Set ws = Worksheets("Invoices")
    r = 2

    Do Until IsEmpty(ws.Cells(r, "B").Value)
        total = total + ws.Cells(r, "B").Value
        countInv = countInv + 1
        r = r + 1                      ' move to next row - prevents an infinite loop
    Loop

    ws.Range("D2").Value = "Invoices: " & countInv
    ws.Range("D3").Value = total
    ws.Range("D3").NumberFormat = "#,##0.00"
End Sub`,
      result: 'D2 = Invoices: 4   D3 = 40,000.00',
      explanation: '12000 + 8500 + 15000 + 4500 = 40000. The loop stops at B6 because it is empty. The same logic with Do While Not IsEmpty(...) gives the same result. Forgetting r = r + 1 would make the loop run forever (press Esc / Ctrl+Break).',
    },
    {
      title: 'One-click region report with a button, speed settings and error handling',
      scenario: 'Sheet "Data" has Region in A and Sales in B (North 45000, South 52000, North 38000, West 36000, South 41000). A button on sheet "Summary" should rebuild a region-wise total table every time.',
      table: { headers: ['A: Region', 'B: Sales'], rows: [['North', '45000'], ['South', '52000'], ['North', '38000'], ['West', '36000'], ['South', '41000']] },
      steps: [
        'Create sheets Data and Summary. In Summary A1:B1 type Region and Total; in A2:A4 type North, South, West.',
        'Alt+F11 > Insert > Module. Type the code below.',
        'On Summary: Insert > Illustrations > Shapes > Rounded Rectangle, draw it at D2, type "Refresh Report".',
        'Right-click the shape > Assign Macro > BuildRegionReport > OK.',
        'Click the shape. Change a value in Data and click again to see it update.',
      ],
      code: `Option Explicit

Sub BuildRegionReport()
    Dim wsData As Worksheet, wsSum As Worksheet
    Dim lastData As Long, lastSum As Long, i As Long

    On Error GoTo ErrHandler
    Application.ScreenUpdating = False

    Set wsData = Worksheets("Data")
    Set wsSum = Worksheets("Summary")

    lastData = wsData.Cells(wsData.Rows.Count, "A").End(xlUp).Row
    lastSum = wsSum.Cells(wsSum.Rows.Count, "A").End(xlUp).Row

    For i = 2 To lastSum
        wsSum.Cells(i, "B").Value = Application.WorksheetFunction.SumIf( _
            wsData.Range("A2:A" & lastData), wsSum.Cells(i, "A").Value, _
            wsData.Range("B2:B" & lastData))
    Next i

    wsSum.Range("B2:B" & lastSum).NumberFormat = "#,##0"
    wsSum.Range("A1:B1").Font.Bold = True
    wsSum.Range("D1").Value = "Updated: " & Format(Now, "dd-mmm-yyyy hh:mm")

CleanExit:
    Application.ScreenUpdating = True
    Exit Sub

ErrHandler:
    MsgBox "Report failed: " & Err.Description, vbCritical
    Resume CleanExit
End Sub`,
      result: 'Summary: North 83,000 | South 93,000 | West 36,000 and an "Updated:" timestamp in D1',
      explanation: 'The loop runs SUMIF for each region. ScreenUpdating = False makes it fast and flicker-free. If a sheet name is wrong, the error handler shows the message and still restores ScreenUpdating via CleanExit.',
    },
    {
      title: 'Event automation: auto time-stamp and open message',
      scenario: 'In sheet "Orders", whenever a user types a status in column D, write the date-time in column E automatically. Also greet users when the workbook opens.',
      steps: [
        'Alt+F11. In Project Explorer double-click the Orders sheet (e.g. Sheet2 (Orders)).',
        'Paste the Worksheet_Change code.',
        'Double-click ThisWorkbook and paste the Workbook_Open code.',
        'Save as .xlsm, close and reopen to see the message.',
        'Type Dispatched in D5; E5 shows the current date and time.',
      ],
      code: `' ----- In the Orders sheet module -----
Private Sub Worksheet_Change(ByVal Target As Range)
    Dim c As Range
    If Intersect(Target, Me.Range("D2:D1000")) Is Nothing Then Exit Sub

    Application.EnableEvents = False
    For Each c In Intersect(Target, Me.Range("D2:D1000"))
        If c.Value <> "" Then
            c.Offset(0, 1).Value = Now
            c.Offset(0, 1).NumberFormat = "dd-mm-yyyy hh:mm"
        Else
            c.Offset(0, 1).ClearContents
        End If
    Next c
    Application.EnableEvents = True
End Sub

' ----- In the ThisWorkbook module -----
Private Sub Workbook_Open()
    Worksheets("Orders").Activate
    MsgBox "Welcome! Please update order status in column D.", vbInformation, "Order Tracker"
End Sub`,
      result: 'Typing in D5 writes the timestamp in E5; clearing D5 clears E5. A welcome message appears on opening.',
      explanation: 'Intersect checks whether the edited cell is inside D2:D1000. EnableEvents = False stops the timestamp write from triggering Worksheet_Change again. Me refers to the sheet that owns the code.',
    },
  ],
  interview: [
    { q: 'What is the difference between For...Next and For Each...Next?', a: 'For...Next uses a numeric counter with start, end and optional Step, good when you need row numbers (Cells(i, 2)). For Each...Next loops through every object in a collection (cells in a range, sheets in a workbook) without a counter, which is simpler and readable.', level: 'Easy' },
    { q: 'How do you find the last used row in a column in VBA?', a: 'lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row. It starts from the very last row of column A and moves up to the first non-empty cell, like pressing Ctrl+Up. It works even if there are gaps in the middle.', level: 'Medium' },
    { q: 'When should you loop backwards (Step -1)?', a: 'When deleting rows. If you delete row 5 while looping forward, row 6 moves up to 5 and the loop skips it. Looping from lastRow To 2 Step -1 avoids skipping.', level: 'Hard' },
    { q: 'Do While vs Do Until?', a: 'Do While repeats while the condition is True; Do Until repeats until the condition becomes True. Both can test at the start (Do While x ... Loop) or at the end (Do ... Loop While x, which runs at least once). Always change the loop variable to avoid infinite loops.', level: 'Medium' },
    { q: 'How do you assign a macro to a button?', a: 'Developer > Controls > Insert > Form Controls > Button, draw it and pick the macro in Assign Macro. For a shape or picture: right-click > Assign Macro. Edit the caption with right-click > Edit Text.', level: 'Easy' },
    { q: 'Why use Application.ScreenUpdating = False?', a: 'It stops Excel redrawing the screen after every change, making macros much faster and avoiding flicker. Always set it back to True at the end, including in the error handler.', level: 'Medium' },
    { q: 'Explain On Error GoTo with an example use.', a: 'On Error GoTo ErrHandler redirects execution to the label ErrHandler when a runtime error occurs (e.g. missing sheet). There you can show Err.Description, restore settings and exit cleanly with Resume or Exit Sub. On Error Resume Next ignores errors and should be used carefully for specific lines only.', level: 'Hard' },
    { q: 'What is Worksheet_Change and what precaution is needed?', a: 'An event procedure in a sheet module that runs automatically whenever cells on that sheet are changed by a user or code. If the procedure itself changes cells, set Application.EnableEvents = False before and True after, otherwise it triggers itself repeatedly. Use Intersect to react only to specific ranges.', level: 'Hard' },
    { q: 'Select Case vs If...ElseIf: when to use which?', a: 'Use Select Case when one expression is compared with many values or ranges (Case 1 To 20, Case "North", "South"); it is cleaner. Use If...ElseIf when conditions involve different variables or complex And/Or logic.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Sheet "Sales" has Amount in column C (rows 2 onwards). Write a macro that makes the font bold and green for amounts >= 50000 and red for amounts < 10000.',
      hint: 'For Each cell, If...ElseIf.',
      solution: 'Sub HighlightSales()\n    Dim c As Range, lastRow As Long\n    lastRow = Cells(Rows.Count, "C").End(xlUp).Row\n    For Each c In Range("C2:C" & lastRow)\n        If c.Value >= 50000 Then\n            c.Font.Bold = True\n            c.Font.Color = vbGreen\n        ElseIf c.Value < 10000 Then\n            c.Font.Color = vbRed\n        End If\n    Next c\nEnd Sub',
    },
    {
      task: 'Delete every row in sheet "Leads" where column B (Status) is "Rejected".',
      hint: 'Loop backwards.',
      solution: 'Sub DeleteRejected()\n    Dim i As Long, lastRow As Long\n    With Worksheets("Leads")\n        lastRow = .Cells(.Rows.Count, "B").End(xlUp).Row\n        For i = lastRow To 2 Step -1\n            If .Cells(i, "B").Value = "Rejected" Then .Rows(i).Delete\n        Next i\n    End With\nEnd Sub',
    },
    {
      task: 'Create a sheet for each region name listed in Setup!A2:A5 (North, South, East, West), skipping if the sheet already exists.',
      hint: 'For Each over the range, test existence with On Error Resume Next.',
      solution: 'Sub CreateRegionSheets()\n    Dim c As Range, ws As Worksheet\n    For Each c In Worksheets("Setup").Range("A2:A5")\n        Set ws = Nothing\n        On Error Resume Next\n        Set ws = Worksheets(c.Value)\n        On Error GoTo 0\n        If ws Is Nothing Then\n            Set ws = Worksheets.Add(After:=Worksheets(Worksheets.Count))\n            ws.Name = c.Value\n        End If\n    Next c\nEnd Sub',
    },
    {
      task: 'Using Select Case, write a UDF =Commission(sales): up to 50000 = 2%, 50001 to 100000 = 5%, above 100000 = 8% of sales. Test with 40000, 75000, 150000.',
      hint: 'Case Is <= 50000, Case Is <= 100000, Case Else.',
      solution: 'Function Commission(sales As Double) As Double\n    Select Case sales\n        Case Is <= 50000: Commission = sales * 0.02\n        Case Is <= 100000: Commission = sales * 0.05\n        Case Else: Commission = sales * 0.08\n    End Select\nEnd Function\nResults: 800, 3750, 12000.',
    },
    {
      task: 'Add a button "Clear Form" on sheet "Entry" that asks for confirmation and then clears B2:B8.',
      hint: 'MsgBox with vbYesNo.',
      solution: 'Sub ClearForm()\n    If MsgBox("Clear all entries?", vbYesNo + vbQuestion, "Confirm") = vbNo Then Exit Sub\n    Worksheets("Entry").Range("B2:B8").ClearContents\nEnd Sub\nThen Developer > Controls > Insert > Form Controls > Button, draw, assign ClearForm, Edit Text: Clear Form.',
    },
  ],
  quiz: [
    { question: 'Which loop is best for visiting every cell in Range("B2:B50") without a counter?', options: ['For i = 1 To 10', 'For Each cell In Range("B2:B50")', 'Do Until False', 'Select Case'], answer: 1, explanation: 'For Each loops through each object in a collection.' },
    { question: 'Path to insert a Form Control button:', options: ['Insert > Button', 'Developer > Controls > Insert > Form Controls > Button', 'View > Macros > Button', 'Home > Cells > Button'], answer: 1, explanation: 'Developer > Controls > Insert gives Form Controls and ActiveX Controls.' },
    { question: 'Why is Application.EnableEvents set to False inside Worksheet_Change?', options: ['To speed up printing', 'To prevent the event from triggering itself again', 'To protect the sheet', 'To disable macros'], answer: 1, explanation: 'Changing cells inside the event would trigger the same event repeatedly.' },
    { question: 'Marks = 58 with rules >=90 A+, >=75 A, >=60 B, >=35 C. Which grade?', options: ['B', 'C', 'A', 'Fail'], answer: 1, explanation: '58 fails >=60 but passes >=35, so C.' },
    { question: 'To delete rows safely in a loop you should:', options: ['Loop from top to bottom', 'Loop from bottom to top with Step -1', 'Use For Each', 'Use Select Case'], answer: 1, explanation: 'Looping backwards avoids skipping rows that shift up after a delete.' },
  ],
};
