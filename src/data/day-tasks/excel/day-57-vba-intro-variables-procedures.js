// Day Task (auto-graded practice) for day-57-vba-intro-variables-procedures
export default {
  "lesson": "day-57-vba-intro-variables-procedures",
  "minutes": 25,
  "intro": "Read and write simple VBA: the editor, Sub and Function procedures, variables, data types and scope.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut opens the **Visual Basic Editor** (VBE)?",
      "accept": [
        "Alt+F11"
      ],
      "acceptRegex": [
        "^\\s*Alt\\s*\\+\\s*F11\\s*$"
      ],
      "explain": "**Alt + F11** toggles between Excel and the VBA editor. Insert a module with Insert > Module."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which statement at the top of a module **forces** you to declare every variable with Dim?",
      "accept": [
        "Option Explicit"
      ],
      "explain": "**Option Explicit** makes VBA report an error for any undeclared variable, which catches spelling mistakes like `Totl` instead of `Total`. Turn it on for all new modules in Tools > Options > Require Variable Declaration."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which data type is best for a whole number like an **employee count of 1,50,000**?",
      "options": [
        "Integer",
        "Long",
        "String",
        "Boolean"
      ],
      "answer": 1,
      "explain": "**Integer** only holds up to 32,767, so 150000 would cause an Overflow error. **Long** holds about ±2.1 billion. Use Double for decimals, String for text, Boolean for True/False."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does the message box show?",
      "code": "Sub Test()\n    Dim qty As Long, rate As Double\n    qty = 12\n    rate = 45.5\n    MsgBox \"Total: \" & qty * rate\nEnd Sub",
      "expected": "Total: 546",
      "explain": "qty * rate = 12 x 45.5 = 546, joined to the text with &: **Total: 546**."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What is the difference between a **Sub** and a **Function** procedure?",
      "options": [
        "No difference",
        "A Function returns a value and can be used in a cell like =MyFunc(A1); a Sub performs actions",
        "A Sub returns a value",
        "Functions cannot have arguments"
      ],
      "answer": 1,
      "explain": "A **Function** returns a value (assign it to the function name) and can be used as a worksheet formula (a UDF). A **Sub** performs actions (formatting, copying) and is run as a macro."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "This UDF is used in a cell as `=GSTAmount(1000)`. What does the cell show?",
      "code": "Function GSTAmount(price As Double) As Double\n    Const RATE As Double = 0.18\n    GSTAmount = price * RATE\nEnd Function",
      "expected": "180",
      "explain": "The function returns price x 0.18 = **180**. The result is assigned to the function name `GSTAmount`."
    }
  ]
};
