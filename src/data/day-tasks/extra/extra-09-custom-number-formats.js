// Day Task (auto-graded practice) for extra-09-custom-number-formats
export default {
  "lesson": "extra-09-custom-number-formats",
  "minutes": 18,
  "intro": "Write custom format codes that change how numbers look (units, colours, leading zeros) without changing their values.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "A custom format code can have up to four sections separated by semicolons. What is their order?",
      "options": [
        "Positive;Negative;Zero;Text",
        "Text;Zero;Negative;Positive",
        "Negative;Positive;Zero;Text",
        "Zero;Positive;Negative;Text"
      ],
      "answer": 0,
      "explain": "The order is **Positive;Negative;Zero;Text**, e.g. `#,##0;[Red]-#,##0;\"-\";@`. If only one section is given, it is used for all numbers."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Weights in B2:B5 have the custom format `0\" kg\"`, so they look like **25 kg**. Write the formula for the **total weight**.",
      "example": {
        "title": "formatted numbers still calculate",
        "text": "Cells showing \"₹ 500\" (format \"₹ \"0) can still be added:",
        "code": "=A2+A3"
      },
      "grid": {
        "A1": "Item",
        "B1": "Weight",
        "A2": "Rice bag",
        "B2": "25",
        "A3": "Wheat bag",
        "B3": "30",
        "A4": "Sugar bag",
        "B4": "10",
        "A5": "Dal bag",
        "B5": "15"
      },
      "starter": "",
      "solution": "=SUM(B2:B5)",
      "explain": "A custom format changes only the **look**. The cells still contain 25, 30, 10, 15, so `=SUM(B2:B5)` = **80**. If someone had typed \"25 kg\" as text, SUM would ignore it; that is why units belong in the format, not in the value."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Employee IDs must always show **5 digits** (7 shows as 00007, 123 as 00123). Write the custom format code.",
      "accept": [
        "00000"
      ],
      "explain": "Each **0** is a placeholder that shows a digit even if it is not needed, so `00000` pads with leading zeros. `#####` would show 7 as just 7. The value stays 7."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does this formula return? (type the text exactly)",
      "code": "=TEXT(1234567.5,\"#,##0.00\")",
      "expected": "1,234,567.50",
      "explain": "`#,##0.00` adds thousand separators and always shows 2 decimals: **1,234,567.50**. TEXT returns **text**, so use it for labels, not for further calculations."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What does the format code `;;;` (three semicolons) do?",
      "options": [
        "Shows the value in red",
        "Hides the cell value on screen (it still exists and calculates)",
        "Deletes the value",
        "Shows the value as text"
      ],
      "answer": 1,
      "explain": "All four sections are empty, so nothing is displayed. The value is still in the formula bar and still used by formulas. Use it to hide helper values, not to hide sensitive data."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Build a label for the report header: **\"Total: \"** followed by the total of B2:B4 with **thousand separators and 2 decimals** (format `#,##0.00`). Use `&` and `TEXT`.",
      "example": {
        "title": "TEXT inside a label",
        "code": "=\"Rate: \"&TEXT(B1,\"0.0%\")"
      },
      "grid": {
        "A1": "Branch",
        "B1": "Sales",
        "A2": "Thane",
        "B2": "125400.5",
        "A3": "Vashi",
        "B3": "98750",
        "A4": "Panvel",
        "B4": "143210.25"
      },
      "starter": "",
      "solution": "=\"Total: \"&TEXT(SUM(B2:B4),\"#,##0.00\")",
      "explain": "Joining a number with text loses its format (`\"Total: \"&SUM(...)` shows 367360.75). `TEXT(value, \"#,##0.00\")` applies a format code inside a formula: **Total: 367,360.75**."
    }
  ]
};
