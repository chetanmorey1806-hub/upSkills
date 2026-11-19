// Day Task (auto-graded practice) for day-56-macro-recording
export default {
  "lesson": "day-56-macro-recording",
  "minutes": 20,
  "intro": "Record, save, run and manage macros: Developer tab, absolute vs relative recording, .xlsm and macro security.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "How do you show the **Developer** tab?",
      "options": [
        "File > Options > Customize Ribbon > tick Developer",
        "View > Developer",
        "Insert > Developer",
        "It is always visible"
      ],
      "answer": 0,
      "explain": "**File > Options > Customize Ribbon**, then tick **Developer** in the right-hand list. It contains Record Macro, Macros, Visual Basic and Insert (controls)."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut opens the **Macro** dialog to run, edit or delete macros?",
      "accept": [
        "Alt+F8"
      ],
      "acceptRegex": [
        "^\\s*Alt\\s*\\+\\s*F8\\s*$"
      ],
      "explain": "**Alt + F8** opens the Macro dialog. **Alt + F11** opens the Visual Basic Editor."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which macro name is **valid**?",
      "options": [
        "Monthly Report",
        "1stReport",
        "Format_Report",
        "Report-2025"
      ],
      "answer": 2,
      "explain": "Macro names must start with a **letter** and cannot contain spaces or hyphens. Use underscores or CamelCase: `Format_Report`, `FormatReport`."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You recorded a macro that formats \"the 3 cells below the active cell\". It always formats A2:A4 instead. What went wrong?",
      "options": [
        "Macro security",
        "It was recorded with absolute references; turn on Use Relative References before recording",
        "Wrong file type",
        "The shortcut key"
      ],
      "answer": 1,
      "explain": "By default the recorder uses **absolute** references (exact addresses). Turn on **Developer > Use Relative References** before recording so the macro works relative to the active cell."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where should you store a macro you want to use in **every** workbook on your PC?",
      "options": [
        "This Workbook",
        "New Workbook",
        "Personal Macro Workbook",
        "A .csv file"
      ],
      "answer": 2,
      "explain": "The **Personal Macro Workbook** (PERSONAL.XLSB) opens hidden every time Excel starts, so its macros are always available."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which file **extension** must a workbook with macros be saved as?",
      "accept": [
        ".xlsm",
        "xlsm"
      ],
      "explain": "**.xlsm** (macro-enabled workbook). Saving as .xlsx removes the macros. .xlsb (binary) can also hold macros."
    }
  ]
};
