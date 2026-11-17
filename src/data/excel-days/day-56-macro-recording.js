export default {
  id: 'day-56-macro-recording',
  title: 'Macro Recording and Macro Execution',
  module: 'Module 8: Automation & Professional Skills',
  day: 56,
  level: 'Advanced',
  duration: '1.5 hours',
  summary: 'A macro is a recorded set of Excel actions that you can replay with one click or shortcut. Today you will enable the Developer tab, record macros with absolute and relative references, save them correctly, handle macro security and run macros in different ways.',
  objectives: [
    'Enable the Developer tab and understand what a macro is',
    'Record a macro with a name, shortcut key, storage location and description',
    'Use absolute vs relative references while recording',
    'Save macro-enabled workbooks (.xlsm) and understand macro security settings',
    'Run, view, edit and delete macros using Alt+F8, shortcut keys and the Quick Access Toolbar',
  ],
  theory: [
    {
      heading: 'What is a macro?',
      content: 'A **macro** is a small program that repeats a series of Excel actions automatically. If you format the same daily sales report every morning (bold header, colours, column width, currency format), you can record it once and then do it in one second every day.\n\nWhen you record, Excel writes your actions as **VBA (Visual Basic for Applications)** code. You do not need to know VBA to record and run macros; we learn to read and write VBA on Days 57-58.\n\n**Enable the Developer tab** (hidden by default): **File > Options > Customize Ribbon** > in the right-hand list tick **Developer** > OK.\n\nThe Developer tab > **Code** group has: Visual Basic, Macros, Record Macro, Use Relative References, Macro Security. Recording is also available at **View > Macros > Record Macro** and from the small record button on the **Status Bar**.',
    },
    {
      heading: 'Recording a macro step by step',
      content: '1. Plan the steps first (practise once without recording).\n2. **Developer > Code > Record Macro**.\n3. **Macro name**: must start with a letter, no spaces or special characters (use FormatReport or Format_Report). It cannot look like a cell address (e.g. ABC1).\n4. **Shortcut key**: type a letter. Use **Shift + letter** (Ctrl+Shift+H) to avoid overriding Excel shortcuts like Ctrl+C or Ctrl+S.\n5. **Store macro in**: This Workbook / New Workbook / **Personal Macro Workbook**.\n6. **Description**: what the macro does.\n7. Click **OK** and perform the actions carefully.\n8. **Developer > Code > Stop Recording** (or the square stop button on the Status Bar).',
      points: [
        'This Workbook: macro works only when this file is open; shared with the file',
        'Personal Macro Workbook (PERSONAL.XLSB): hidden file that opens with Excel, so the macro is available in every workbook on your PC',
        'Every click, including mistakes and scrolling selections, is recorded, so plan before you record',
      ],
    },
    {
      heading: 'Absolute vs relative references in recording',
      content: 'By default the recorder uses **absolute references**: it records exact addresses like `Range("A1:E1").Select`. Running the macro always affects A1:E1, no matter which cell is active.\n\nIf you turn on **Developer > Code > Use Relative References** before performing actions, Excel records movements relative to the active cell, like `ActiveCell.Offset(1, 0).Range("A1").Select` (one row down). The macro then works from wherever you start it.\n\nUse absolute for fixed report layouts (the header is always row 1). Use relative for actions that repeat at different places (insert a signature block below the current cell).',
      tip: 'Use Relative References is a toggle. It stays highlighted when ON. You can switch it on and off in the middle of a recording.',
    },
    {
      heading: 'Saving macro workbooks and macro security',
      content: 'A normal **.xlsx** file CANNOT store macros. If you save as .xlsx, Excel warns "The following features cannot be saved in macro-free workbooks" and the macros are lost. Save as:\n\n- **.xlsm**: Excel Macro-Enabled Workbook (most common). File > Save As > Save as type: Excel Macro-Enabled Workbook.\n- **.xlsb**: Excel Binary Workbook (also stores macros, smaller and faster).\n- **.xltm**: Macro-Enabled Template.\n\n**Macro security**: Developer > Code > **Macro Security** (or File > Options > Trust Center > Trust Center Settings > Macro Settings):\n\n- Disable VBA macros without notification\n- **Disable VBA macros with notification** (default, recommended): a yellow bar shows **Enable Content**\n- Disable VBA macros except digitally signed macros\n- Enable VBA macros (not recommended, risky)\n\n**Trusted Locations** (Trust Center > Trusted Locations > Add new location) run macros without warnings. Files downloaded from the internet or email have the **Mark of the Web** and macros are blocked; if you trust the file, right-click it in File Explorer > Properties > tick **Unblock** > OK.',
      tip: 'Never enable macros in files from unknown senders. Macros can run harmful code.',
    },
    {
      heading: 'Running, viewing, editing and deleting macros',
      content: 'Ways to run a macro:\n\n1. **Alt+F8** (or Developer > Code > Macros, or View > Macros > View Macros) > select the macro > **Run**.\n2. The **shortcut key** you assigned (e.g. Ctrl+Shift+H).\n3. **Quick Access Toolbar**: File > Options > Quick Access Toolbar > Choose commands from: **Macros** > select > **Add >>** > Modify (choose icon) > OK.\n4. A **button or shape** on the sheet (right-click shape > Assign Macro), covered in detail on Day 58.\n5. From the VBA editor: put the cursor inside the macro and press **F5**.\n\nIn the Macro dialog (Alt+F8): **Step Into** (run line by line with F8), **Edit** (opens the VBA Editor, Alt+F11), **Delete**, **Options** (change shortcut key and description).\n\n**Important**: Undo (Ctrl+Z) does NOT work for actions done by a macro. Save your file before running a new macro.',
    },
    {
      heading: 'Limitations of the macro recorder',
      content: '- It records **Select** and **Selection** for every step, making code long and slower.\n- It cannot record **decisions** (IF a value is low then...) or **loops** (repeat for every row).\n- It records fixed addresses, so if data grows from 100 to 150 rows the macro may miss rows (use Ctrl+Shift+Down while recording, or edit the code).\n- It cannot create message boxes or input boxes.\n\nThat is why on Days 57 and 58 we learn to write VBA by hand. The recorder is still a great way to discover the VBA code for any Excel command.',
    },
  ],
  examples: [
    {
      title: 'Record a macro to format a report header',
      scenario: 'Every day you receive a sales sheet with headers in A1:E1 (Date, Region, Product, Qty, Amount). Format the header bold, white text on dark blue, centred, and autofit columns A:E.',
      table: { headers: ['A: Date', 'B: Region', 'C: Product', 'D: Qty', 'E: Amount'], rows: [['01-04-2025', 'North', 'Laptop', '2', '110000']] },
      steps: [
        'Developer > Code > Record Macro.',
        'Macro name: FormatHeader. Shortcut key: press Shift+H (shows Ctrl+Shift+H). Store macro in: This Workbook. Description: Formats the header row of the sales report. Click OK.',
        'Select A1:E1.',
        'Press Ctrl+B. Home > Font > Fill Color > Dark Blue. Home > Font > Font Color > White.',
        'Home > Alignment > Center.',
        'Select columns A:E, Home > Cells > Format > AutoFit Column Width.',
        'Developer > Code > Stop Recording.',
        'File > Save As > Excel Macro-Enabled Workbook (*.xlsm).',
        'Open a new unformatted sheet with the same layout and press Ctrl+Shift+H.',
      ],
      code: `Sub FormatHeader()
'
' FormatHeader Macro
' Formats the header row of the sales report
'
' Keyboard Shortcut: Ctrl+Shift+H
'
    Range("A1:E1").Select
    Selection.Font.Bold = True
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .Color = 6299648
        .TintAndShade = 0
        .PatternTintAndShade = 0
    End With
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    With Selection
        .HorizontalAlignment = xlCenter
    End With
    Columns("A:E").Select
    Columns("A:E").EntireColumn.AutoFit
End Sub`,
      result: 'Header A1:E1 becomes bold white text on dark blue, centred, columns auto-fitted in one keystroke',
      explanation: 'The recorder wrote every action as VBA. 6299648 is the colour code for RGB(0, 32, 96) dark blue. Lines starting with an apostrophe are comments. Because references are absolute, it always formats A1:E1.',
    },
    {
      title: 'Record with relative references: signature block',
      scenario: 'At the end of various reports you add "Prepared by: Accounts Team" and below it "Checked by:". The last row is different in each report, so the macro must start from the active cell.',
      steps: [
        'Click any empty cell, for example A20.',
        'Developer > Code > Record Macro. Name: AddSignature, Shortcut Ctrl+Shift+S, Store in This Workbook > OK.',
        'Developer > Code > Use Relative References (make sure it is highlighted).',
        'Type Prepared by: Accounts Team and press Enter (cursor moves down).',
        'Type Checked by: and press Enter.',
        'Developer > Code > Stop Recording. Turn Use Relative References off.',
        'Click cell C35 in another report and press Ctrl+Shift+S.',
      ],
      code: `Sub AddSignature()
'
' AddSignature Macro
'
' Keyboard Shortcut: Ctrl+Shift+S
'
    ActiveCell.FormulaR1C1 = "Prepared by: Accounts Team"
    ActiveCell.Offset(1, 0).Range("A1").Select
    ActiveCell.FormulaR1C1 = "Checked by:"
    ActiveCell.Offset(1, 0).Range("A1").Select
End Sub`,
      result: 'C35 = Prepared by: Accounts Team, C36 = Checked by:, cursor ends at C37',
      explanation: 'Offset(1, 0) means "one row down, same column" from the current cell. With absolute recording the code would have been Range("A20") and Range("A21"), always writing in the same cells.',
    },
    {
      title: 'Store a macro in the Personal Macro Workbook',
      scenario: 'You want a macro "QuickClean" available in every workbook: number format with thousand separators on the selection, autofit all columns and freeze the top row.',
      steps: [
        'Open any workbook and select some numbers (e.g. B2:B10).',
        'Developer > Code > Record Macro. Name: QuickClean. Store macro in: Personal Macro Workbook. OK.',
        'Ctrl+1 > Number > Number, 2 decimal places, tick Use 1000 Separator > OK.',
        'Click the Select All triangle (top-left of the grid), Home > Cells > Format > AutoFit Column Width.',
        'View > Window > Freeze Panes > Freeze Top Row.',
        'Developer > Code > Stop Recording.',
        'Close Excel. When asked "Do you want to save changes to the Personal Macro Workbook?" click Save.',
        'Open any other file, select numbers and run Alt+F8 > PERSONAL.XLSB!QuickClean > Run.',
      ],
      code: `Sub QuickClean()
'
' QuickClean Macro
'
    Selection.NumberFormat = "#,##0.00"
    Cells.Select
    Cells.EntireColumn.AutoFit
    With ActiveWindow
        .SplitColumn = 0
        .SplitRow = 1
    End With
    ActiveWindow.FreezePanes = True
End Sub`,
      result: 'Macro listed as PERSONAL.XLSB!QuickClean and usable in every workbook',
      explanation: 'PERSONAL.XLSB is a hidden workbook stored in the XLSTART folder that opens automatically with Excel. To edit it: View > Window > Unhide > PERSONAL.XLSB, or open it in the VBA Editor (Alt+F11).',
    },
    {
      title: 'Run a macro from the Quick Access Toolbar and change its shortcut',
      scenario: 'Your manager prefers a toolbar icon instead of a shortcut for FormatHeader, and wants the shortcut changed to Ctrl+Shift+F.',
      steps: [
        'File > Options > Quick Access Toolbar.',
        'Choose commands from: Macros. Select FormatHeader. Click Add >>.',
        'Click Modify, choose an icon, Display name: Format Header. OK, OK.',
        'Click the new icon on the Quick Access Toolbar to run the macro.',
        'Press Alt+F8, select FormatHeader, click Options.',
        'Change the shortcut letter to Shift+F (Ctrl+Shift+F). OK > Cancel.',
      ],
      result: 'Macro runs from a toolbar icon and from Ctrl+Shift+F',
      explanation: 'The QAT is always visible, so non-technical users can run the macro easily. Changing the shortcut in Options updates the hidden attribute in the code; the comment line "Keyboard Shortcut" in the code is just text and is not updated automatically.',
    },
  ],
  interview: [
    { q: 'What is a macro in Excel?', a: 'A macro is a stored set of instructions, written in VBA, that automates repetitive tasks. You can create one by recording actions with the Macro Recorder or by writing VBA code in the Visual Basic Editor, and run it with a shortcut, button or Alt+F8.', level: 'Easy' },
    { q: 'How do you enable the Developer tab?', a: 'File > Options > Customize Ribbon, tick Developer in the Main Tabs list on the right, click OK.', level: 'Easy' },
    { q: 'Which file format must be used to save macros? Why can\'t .xlsx store them?', a: 'Use .xlsm (Macro-Enabled Workbook), .xlsb (Binary) or .xltm (Macro-Enabled Template). .xlsx is designed as a macro-free format for security, so Excel removes the VBA project when saving as .xlsx.', level: 'Easy' },
    { q: 'What is the difference between absolute and relative recording?', a: 'Absolute (default) records exact cell addresses (Range("A1")), so the macro always acts on the same cells. Relative (Developer > Use Relative References) records movement from the active cell (ActiveCell.Offset(1,0)), so the macro acts relative to where you start it.', level: 'Medium' },
    { q: 'What is the Personal Macro Workbook?', a: 'PERSONAL.XLSB is a hidden workbook in the XLSTART folder that opens whenever Excel starts. Macros stored there are available in all workbooks on that computer, but they are not shared when you send a file to someone else.', level: 'Medium' },
    { q: 'Can you undo a macro with Ctrl+Z?', a: 'No. Running a macro clears the Undo stack, so its changes cannot be undone with Ctrl+Z. Save a backup or test on a copy before running macros that change data.', level: 'Medium' },
    { q: 'Explain the macro security settings and the recommended one.', a: 'Trust Center > Macro Settings offers: Disable without notification, Disable with notification (default/recommended – shows Enable Content bar), Disable except digitally signed, and Enable all (risky). You can also add Trusted Locations. Internet files with Mark of the Web are blocked until unblocked in file Properties.', level: 'Medium' },
    { q: 'What are the limitations of the macro recorder?', a: 'It records unnecessary Select statements, uses fixed ranges, cannot record loops, IF conditions, variables, message/input boxes or error handling, and records mistakes too. For dynamic automation you edit or write VBA code.', level: 'Hard' },
    { q: 'Why should you use Ctrl+Shift+letter for macro shortcuts?', a: 'A Ctrl+letter shortcut overrides Excel built-in shortcuts (Ctrl+C copy, Ctrl+S save) while the workbook is open. Ctrl+Shift+letter combinations are mostly unused, so you avoid conflicts.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Record a macro "SalaryFormat" that formats C2:C20 (salary column) with 2 decimals and thousand separators, and makes C1 bold. Assign Ctrl+Shift+M.',
      hint: 'Absolute references; Ctrl+1 for Format Cells.',
      solution: '1. Developer > Record Macro: Name SalaryFormat, Shortcut Shift+M, This Workbook > OK.\n2. Select C2:C20 > Ctrl+1 > Number, 2 decimals, Use 1000 Separator > OK.\n3. Click C1 > Ctrl+B.\n4. Stop Recording. Save as .xlsm.\nRecorded core lines: Range("C2:C20").Select / Selection.NumberFormat = "#,##0.00" / Range("C1").Select / Selection.Font.Bold = True',
    },
    {
      task: 'Record a relative macro "MarkDone" that writes "Done" in the active cell, colours it green and moves one cell down. Use it on a task list in column D.',
      hint: 'Turn on Use Relative References before typing.',
      solution: '1. Click D2. Record Macro: MarkDone, Ctrl+Shift+D.\n2. Turn on Use Relative References.\n3. Type Done, press Ctrl+Enter (stays in cell), Home > Fill Color > Green.\n4. Press Down Arrow. Stop Recording.\nCode contains ActiveCell.FormulaR1C1 = "Done", With Selection.Interior .Color = 5296274 (green), ActiveCell.Offset(1, 0).Range("A1").Select.',
    },
    {
      task: 'You saved a workbook with macros as Report.xlsx and the macros vanished. Explain why and how to avoid it.',
      hint: 'File formats.',
      solution: '.xlsx cannot hold VBA; Excel warned that features cannot be saved in macro-free workbooks and clicking Yes removed them. Always use File > Save As > Excel Macro-Enabled Workbook (*.xlsm) or Excel Binary Workbook (*.xlsb). Re-record or restore from a backup.',
    },
    {
      task: 'A colleague emails you a .xlsm file and the macros do not run even after opening. A red bar says "Microsoft has blocked macros from running because the source of this file is untrusted". Fix it safely.',
      hint: 'Mark of the Web.',
      solution: '1. Confirm the sender and file are trusted.\n2. Close the file. In File Explorer right-click it > Properties > General > tick Unblock > OK.\n3. Reopen and click Enable Content on the yellow bar.\nAlternatively save it into a Trusted Location (File > Options > Trust Center > Trust Center Settings > Trusted Locations).',
    },
    {
      task: 'Add the macro AddSignature to the Quick Access Toolbar and delete an unwanted macro "Macro1".',
      hint: 'File > Options > Quick Access Toolbar; Alt+F8 > Delete.',
      solution: '1. File > Options > Quick Access Toolbar > Choose commands from Macros > AddSignature > Add >> > Modify icon > OK.\n2. Alt+F8 > select Macro1 > Delete > Yes.\n(For a PERSONAL.XLSB macro, first unhide PERSONAL via View > Unhide, or delete it in the VBA Editor.)',
    },
  ],
  quiz: [
    { question: 'Which file extension can store macros?', options: ['.xlsx', '.csv', '.xlsm', '.txt'], answer: 2, explanation: '.xlsm is the Macro-Enabled Workbook format.' },
    { question: 'Shortcut to open the Macro dialog box:', options: ['Alt+F11', 'Alt+F8', 'Ctrl+F8', 'F5'], answer: 1, explanation: 'Alt+F8 lists macros; Alt+F11 opens the VBA Editor.' },
    { question: 'To make a macro available in all workbooks on your PC, store it in:', options: ['This Workbook', 'New Workbook', 'Personal Macro Workbook', 'Trusted Location'], answer: 2, explanation: 'PERSONAL.XLSB opens with Excel and is available everywhere.' },
    { question: 'The recorded line ActiveCell.Offset(1, 0).Range("A1").Select indicates:', options: ['Absolute recording', 'Relative recording', 'An error', 'A loop'], answer: 1, explanation: 'Offset from ActiveCell is produced when Use Relative References is on.' },
    { question: 'The default and recommended macro security setting is:', options: ['Enable all macros', 'Disable VBA macros with notification', 'Disable without notification', 'Trust access to the VBA project'], answer: 1, explanation: 'It blocks macros but lets you enable trusted files via the Enable Content bar.' },
  ],
};
