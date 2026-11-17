export default {
  id: 'day-57-vba-intro-variables-procedures',
  title: 'VBA Introduction, Variables and Procedures',
  module: 'Module 8: Automation & Professional Skills',
  day: 57,
  level: 'Advanced',
  duration: '2 hours',
  summary: 'VBA (Visual Basic for Applications) is the programming language behind Excel macros. Today you will learn the VBA Editor, the Excel object model (Workbook, Worksheet, Range), variables and data types, and how to write Sub and Function procedures by hand.',
  objectives: [
    'Open and navigate the Visual Basic Editor (Project Explorer, Code window, Immediate window)',
    'Insert a module and write Sub procedures that use Range, Cells, MsgBox and InputBox',
    'Declare variables with Dim, choose correct data types and use Option Explicit',
    'Understand variable scope (procedure, module, public) and constants',
    'Create Function procedures (User Defined Functions) and call one procedure from another',
  ],
  theory: [
    {
      heading: 'The Visual Basic Editor (VBE)',
      content: 'Open the editor with **Alt+F11** or **Developer > Code > Visual Basic**. Main parts:\n\n- **Project Explorer** (Ctrl+R): tree of open workbooks. Each VBAProject contains Microsoft Excel Objects (Sheet1, ThisWorkbook) and **Modules**.\n- **Code window**: where you type code. Double-click a module to open it.\n- **Properties window** (F4): properties of the selected object (e.g. sheet Name).\n- **Immediate window** (Ctrl+G): test lines instantly, e.g. type `? Range("A1").Value` and press Enter. `Debug.Print` writes here.\n\n**Insert a module**: in the VBE, **Insert > Module**. Normal macros go in standard modules (Module1). Sheet and ThisWorkbook modules are for event code (Day 58).\n\nRun code: put the cursor inside a Sub and press **F5**. Step line by line with **F8**. Toggle a breakpoint with **F9**. Back to Excel: **Alt+F11** again.',
      tip: 'Turn on Tools > Options > Editor > Require Variable Declaration. It adds Option Explicit to every new module automatically.',
    },
    {
      heading: 'Sub procedures and the Excel object model',
      content: 'A **procedure** is a block of code with a name. A **Sub** performs actions (it does not return a value) and appears in the Alt+F8 macro list.\n\nExcel is organised as objects inside objects: **Application > Workbooks > Worksheets > Range**. You use dot notation:\n\n- `Workbooks("Sales.xlsm").Worksheets("Jan").Range("A1").Value = 100`\n- `ThisWorkbook` = the file containing the code; `ActiveSheet` = the visible sheet.\n- `Range("B2")`, `Range("A1:C10")`, `Cells(row, column)` e.g. `Cells(2, 3)` = C2.\n- **Properties** describe an object: `.Value`, `.Font.Bold`, `.Interior.Color`, `.NumberFormat`.\n- **Methods** are actions: `.ClearContents`, `.Copy`, `.Select`, `.AutoFit`.',
      syntax: 'Sub ProcedureName()\n    \' statements\nEnd Sub',
      points: [
        'Comments start with an apostrophe \' and turn green',
        'Use a space + underscore " _" at the end of a line to continue a long statement',
        'MsgBox "text" shows a message; InputBox("prompt") asks the user for a value',
        'You do not need .Select before working on a range: Range("A1").Value = 5 is faster than selecting first',
      ],
    },
    {
      heading: 'Variables and data types',
      content: 'A **variable** is a named box in memory that stores a value while the macro runs. Declare it with **Dim**:\n\n`Dim empName As String`\n\nCommon data types:\n\n- **Integer**: whole numbers -32,768 to 32,767 (avoid for row numbers)\n- **Long**: whole numbers up to about 2.1 billion (use for row counts, quantities)\n- **Double**: decimals (rates, percentages)\n- **Currency**: money with 4 fixed decimals, no rounding errors\n- **String**: text\n- **Boolean**: True / False\n- **Date**: dates and times\n- **Variant**: any type (default if you do not declare; slower)\n- **Object types**: `Worksheet`, `Range`, `Workbook`. Assign them with **Set**: `Set ws = Worksheets("Jan")`.\n\nNaming rules: start with a letter, no spaces, not a VBA keyword. Use meaningful names like `totalSales`, `lastRow`.',
      syntax: 'Dim variableName As DataType\nSet objectVariable = object',
      tip: '**Option Explicit** at the top of the module forces you to declare every variable. Without it a typo like totlSales silently creates a new empty variable and your result is wrong.',
    },
    {
      heading: 'Scope of variables and constants',
      content: '- **Procedure level**: `Dim` inside a Sub; exists only while that Sub runs.\n- **Module level**: `Dim` or `Private` at the top of a module (below Option Explicit, above all Subs); available to all procedures in that module.\n- **Public (global)**: `Public` at the top of a standard module; available in all modules of the project.\n- **Static**: `Static counter As Long` inside a Sub keeps its value between runs.\n\n**Constants** never change while code runs: `Const GST_RATE As Double = 0.18`. Use constants for rates, sheet names and limits so you can change them in one place.',
    },
    {
      heading: 'Function procedures (User Defined Functions)',
      content: 'A **Function** returns a value. When placed in a standard module, it can be used in a worksheet cell like a built-in function: `=GSTAmount(B2)`. It appears in **Formulas > Insert Function > User Defined** category.\n\nThe value is returned by assigning it to the function name inside the code.',
      syntax: 'Function FunctionName(arg1 As Type, Optional arg2 As Type = default) As ReturnType\n    FunctionName = expression\nEnd Function',
      points: [
        'Functions used in cells should only calculate and return a value; they cannot change other cells or formatting',
        'Optional arguments must come after required arguments',
        'Use Application.WorksheetFunction to call Excel functions in VBA, e.g. Application.WorksheetFunction.Sum(Range("B2:B10"))',
      ],
    },
    {
      heading: 'Calling procedures and passing arguments',
      content: 'Large tasks are split into small Subs, and a main Sub calls them in order:\n\n`Call ClearOldData` or simply `ClearOldData`.\n\nSubs can take arguments: `Sub AddTitle(ByVal titleText As String)`, called as `AddTitle "Monthly Sales Report"`.\n\n- **ByRef** (default): the procedure receives the original variable and can change it.\n- **ByVal**: the procedure receives a copy; the original is not changed.\n\nA Sub with arguments does not appear in the Alt+F8 list; it is called from other code. `Private Sub` also hides a macro from the list.',
    },
  ],
  examples: [
    {
      title: 'Your first VBA macro: greeting with InputBox and MsgBox',
      scenario: 'Ask the user for their name, write it in A1 of the active sheet with today\'s date in B1, and show a greeting.',
      steps: [
        'Press Alt+F11 to open the VBA Editor.',
        'Insert > Module.',
        'Type the code below into the code window.',
        'Click anywhere inside the Sub and press F5.',
        'Type Priya in the InputBox and click OK.',
        'Press Alt+F11 to return to Excel and check A1 and B1.',
      ],
      code: `Option Explicit

Sub GreetUser()
    Dim userName As String
    userName = InputBox("Enter your name:", "Welcome")

    If userName = "" Then Exit Sub          ' user pressed Cancel or left it empty

    Range("A1").Value = userName
    Range("B1").Value = Date
    Range("B1").NumberFormat = "dd-mmm-yyyy"

    MsgBox "Hello " & userName & "! Today is " & Format(Date, "dddd"), vbInformation, "Greeting"
End Sub`,
      result: 'A1 = Priya, B1 = today\'s date (e.g. 17-Nov-2026), message "Hello Priya! Today is Tuesday"',
      explanation: 'userName is a String variable. & joins text. Date returns today\'s date and Format(Date, "dddd") gives the weekday name. vbInformation shows the blue "i" icon. The If line exits safely if the user cancels.',
    },
    {
      title: 'Invoice calculation with variables and a constant',
      scenario: 'Sheet "Invoice" has Qty in B2 (10) and Rate in B3 (₹1,500). Calculate Subtotal, GST at 18% and Total into B4:B6 using variables.',
      table: { headers: ['A: Item', 'B: Value'], rows: [['Qty', '10'], ['Rate', '1500'], ['Subtotal', ''], ['GST 18%', ''], ['Total', '']] },
      steps: [
        'Rename a sheet to Invoice and enter the data.',
        'Alt+F11 > Insert > Module and type the code.',
        'Press F5 to run (or Alt+F8 > CalculateInvoice > Run from Excel).',
        'Check B4:B6.',
      ],
      code: `Option Explicit

Const GST_RATE As Double = 0.18

Sub CalculateInvoice()
    Dim ws As Worksheet
    Dim qty As Long
    Dim rate As Currency
    Dim subTotal As Currency, gst As Currency, total As Currency

    Set ws = ThisWorkbook.Worksheets("Invoice")

    qty = ws.Range("B2").Value
    rate = ws.Range("B3").Value

    subTotal = qty * rate
    gst = subTotal * GST_RATE
    total = subTotal + gst

    ws.Range("B4").Value = subTotal
    ws.Range("B5").Value = gst
    ws.Range("B6").Value = total
    ws.Range("B4:B6").NumberFormat = "#,##0.00"

    Debug.Print "Invoice total: "; total      ' visible in Immediate window (Ctrl+G)
End Sub`,
      result: 'B4 = 15,000.00   B5 = 2,700.00   B6 = 17,700.00',
      explanation: '10 x 1500 = 15000; 15000 x 0.18 = 2700; 15000 + 2700 = 17700. Set is used because ws is an object variable. Using the constant GST_RATE means changing the rate later needs just one edit. Writing to ws.Range(...) works even if another sheet is active.',
    },
    {
      title: 'User Defined Function for GST and net salary',
      scenario: 'Create worksheet functions =GSTAmount(amount, [rate]) with default 18%, and =NetSalary(basic, hraPct, pfPct) = basic + basic*hraPct - basic*pfPct.',
      table: { headers: ['A: Basic', 'B: HRA %', 'C: PF %', 'D: Net Salary'], rows: [['30000', '40%', '12%', '=NetSalary(A2,B2,C2)'], ['25000', '20%', '12%', '=NetSalary(A3,B3,C3)']] },
      steps: [
        'Alt+F11 > Insert > Module (functions must be in a standard module, not a sheet module).',
        'Type both functions below.',
        'Return to Excel. In D2 type =NetSalary(A2,B2,C2) and fill down to D3.',
        'In any cell type =GSTAmount(15000) and =GSTAmount(15000,5%).',
        'Save as .xlsm.',
      ],
      code: `Option Explicit

Function GSTAmount(amount As Double, Optional rate As Double = 0.18) As Double
    GSTAmount = Round(amount * rate, 2)
End Function

Function NetSalary(basic As Double, hraPct As Double, pfPct As Double) As Double
    Dim hra As Double, pf As Double
    hra = basic * hraPct
    pf = basic * pfPct
    NetSalary = basic + hra - pf
End Function`,
      result: 'D2 = 38400, D3 = 27000, =GSTAmount(15000) = 2700, =GSTAmount(15000,5%) = 750',
      explanation: '30000 + 12000 - 3600 = 38400; 25000 + 5000 - 3000 = 27000. Assigning to the function name returns the value. The Optional argument rate uses 0.18 if omitted. UDFs recalculate when their input cells change.',
    },
    {
      title: 'Main procedure calling smaller procedures (ByVal argument)',
      scenario: 'Build a month-end routine: clear old figures in Report!B2:B20, add a title in A1 passed as an argument, and show the time taken.',
      steps: [
        'Create a sheet named Report.',
        'Alt+F11 > Insert > Module and type the code.',
        'Run MonthEndReport with F5. Note that ClearOldData and AddTitle do not appear in Alt+F8 because they are Private or take arguments.',
      ],
      code: `Option Explicit

Private startTime As Double      ' module-level variable

Sub MonthEndReport()
    startTime = Timer
    ClearOldData
    AddTitle "Monthly Sales Report - " & Format(Date, "mmm yyyy")
    MsgBox "Report ready in " & Format(Timer - startTime, "0.00") & " seconds", vbInformation
End Sub

Private Sub ClearOldData()
    Worksheets("Report").Range("B2:B20").ClearContents
End Sub

Sub AddTitle(ByVal titleText As String)
    With Worksheets("Report").Range("A1")
        .Value = titleText
        .Font.Bold = True
        .Font.Size = 14
    End With
End Sub`,
      result: 'Report!B2:B20 cleared, A1 = "Monthly Sales Report - Nov 2026" in bold 14 pt, message with time taken',
      explanation: 'startTime is declared at module level so both the Sub and the message can use it. Timer returns seconds since midnight. With ... End With avoids repeating Worksheets("Report").Range("A1"). ByVal passes a copy of the text.',
    },
  ],
  interview: [
    { q: 'What is VBA and how is it related to macros?', a: 'VBA (Visual Basic for Applications) is the programming language built into Microsoft Office. Every Excel macro is VBA code: the recorder writes it automatically, or you write it in the Visual Basic Editor for logic that recording cannot capture.', level: 'Easy' },
    { q: 'What is the difference between a Sub and a Function in VBA?', a: 'A Sub performs actions and does not return a value; it can be run from Alt+F8, buttons or shortcuts. A Function returns a value by assigning to its name; it can be used in worksheet cells as a UDF or called from other code. Functions used in cells cannot change other cells.', level: 'Easy' },
    { q: 'What does Option Explicit do and why is it important?', a: 'It forces explicit declaration of every variable with Dim/Private/Public. Undeclared or misspelt variables cause a compile error "Variable not defined" instead of silently creating new Variant variables, preventing hard-to-find bugs.', level: 'Medium' },
    { q: 'Why use Long instead of Integer for row numbers?', a: 'Integer only stores up to 32,767, but Excel has 1,048,576 rows, so an Integer row counter can overflow (Run-time error 6: Overflow). Long holds up to about 2.1 billion. In modern VBA Integer is internally converted to Long anyway.', level: 'Medium' },
    { q: 'When must you use the Set keyword?', a: 'When assigning an object reference to an object variable, such as Worksheet, Range or Workbook: Set ws = Worksheets("Jan"). For simple values (numbers, text) you assign without Set. Forgetting Set gives error 91 "Object variable or With block variable not set".', level: 'Medium' },
    { q: 'Explain variable scope in VBA.', a: 'Procedure-level variables (Dim inside a Sub) exist only during that procedure. Module-level (Dim/Private at the top of a module) are shared by procedures in that module. Public variables at the top of a standard module are available in all modules. Static variables keep their value between calls.', level: 'Medium' },
    { q: 'What is the difference between ByRef and ByVal?', a: 'ByRef (default) passes a reference to the original variable, so changes inside the procedure affect the caller\'s variable. ByVal passes a copy, so the original stays unchanged. ByVal is safer when the procedure should not modify inputs.', level: 'Hard' },
    { q: 'What is the difference between Range("C2") and Cells(2, 3)?', a: 'Both refer to cell C2. Range uses an A1-style address string; Cells uses numeric row and column indexes, which is convenient inside loops (Cells(i, 3)).', level: 'Easy' },
    { q: 'What is the Immediate window used for?', a: 'Opened with Ctrl+G in the VBE, it lets you run single statements, check values with ? expression (e.g. ? Range("A1").Value) and see Debug.Print output while testing code.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write a macro "ShowTotal" that adds B2:B6 on the active sheet (marks 78, 85, 69, 92, 74) and shows "Total = 398" in a MsgBox.',
      hint: 'Application.WorksheetFunction.Sum.',
      solution: 'Sub ShowTotal()\n    Dim total As Double\n    total = Application.WorksheetFunction.Sum(Range("B2:B6"))\n    MsgBox "Total = " & total\nEnd Sub\nResult: Total = 398.',
    },
    {
      task: 'Write a macro that asks for an employee name and basic salary using InputBox and writes them into the next row of sheet "Staff" in columns A and B (header in row 1).',
      hint: 'Find the last row with Cells(Rows.Count, "A").End(xlUp).Row.',
      solution: 'Sub AddStaff()\n    Dim ws As Worksheet, nextRow As Long\n    Dim nm As String, basic As Double\n    Set ws = Worksheets("Staff")\n    nm = InputBox("Employee name:")\n    If nm = "" Then Exit Sub\n    basic = Val(InputBox("Basic salary:"))\n    nextRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1\n    ws.Cells(nextRow, 1).Value = nm\n    ws.Cells(nextRow, 2).Value = basic\nEnd Sub',
    },
    {
      task: 'Create a UDF =DiscountPrice(price, discountPct) that returns the price after discount. Test: =DiscountPrice(2500, 10%).',
      hint: 'price * (1 - discountPct).',
      solution: 'Function DiscountPrice(price As Double, discountPct As Double) As Double\n    DiscountPrice = price * (1 - discountPct)\nEnd Function\nResult: 2250.',
    },
    {
      task: 'Declare a constant for the company name "Sai Traders Pvt Ltd" and write a macro that puts it in A1 of every report in bold.',
      hint: 'Const at module level.',
      solution: 'Option Explicit\nConst COMPANY As String = "Sai Traders Pvt Ltd"\n\nSub PutCompanyName()\n    With ActiveSheet.Range("A1")\n        .Value = COMPANY\n        .Font.Bold = True\n    End With\nEnd Sub',
    },
    {
      task: 'This code gives "Variable not defined" on run. Find and fix the error:\nOption Explicit\nSub Test()\n    Dim totalSales As Double\n    totalSales = 5000\n    MsgBox totlSales\nEnd Sub',
      hint: 'Check spelling.',
      solution: 'totlSales is misspelt. Option Explicit caught it. Correct the line to MsgBox totalSales. Result: message shows 5000. Without Option Explicit it would have shown an empty message.',
    },
  ],
  quiz: [
    { question: 'Shortcut to open the Visual Basic Editor:', options: ['Alt+F8', 'Alt+F11', 'Ctrl+F11', 'F5'], answer: 1, explanation: 'Alt+F11 toggles between Excel and the VBE.' },
    { question: 'Which data type is best for a row counter that can go above 32,767?', options: ['Integer', 'Byte', 'Long', 'Boolean'], answer: 2, explanation: 'Long holds values up to about 2.1 billion.' },
    { question: 'Correct way to assign a worksheet to a variable ws:', options: ['ws = Worksheets("Jan")', 'Set ws = Worksheets("Jan")', 'Dim ws = Worksheets("Jan")', 'Let ws = "Jan"'], answer: 1, explanation: 'Object variables need the Set keyword.' },
    { question: 'Where should a User Defined Function be written so it can be used in a cell?', options: ['Sheet1 code module', 'ThisWorkbook module', 'A standard module (Insert > Module)', 'A UserForm'], answer: 2, explanation: 'UDFs must be Public functions in a standard module.' },
    { question: 'Basic 30000, HRA 40%, PF 12%. NetSalary = basic + basic*HRA - basic*PF returns:', options: ['38400', '42000', '26400', '34800'], answer: 0, explanation: '30000 + 12000 - 3600 = 38400.' },
  ],
};
