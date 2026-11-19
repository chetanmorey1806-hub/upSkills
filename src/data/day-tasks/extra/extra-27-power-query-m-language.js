// Day Task (auto-graded practice) for extra-27-power-query-m-language
export default {
  "lesson": "extra-27-power-query-m-language",
  "minutes": 18,
  "intro": "Read and write basic Power Query M: let ... in, steps, each and _, conditions and try ... otherwise.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "In an M query `let ... in ...`, what does the part after **in** specify?",
      "options": [
        "The data source",
        "The step whose value the query returns (usually the last step)",
        "The list of columns",
        "A comment"
      ],
      "answer": 1,
      "explain": "Each line in `let` is a named step; the expression after **in** is what the query outputs, normally the last step name. If you add a step but forget to update `in`, the new step is ignored."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does this M expression return?",
      "code": "let\n    a = 5,\n    b = a * 2\nin\n    a + b",
      "expected": "15",
      "explain": "a = 5, b = 10, and the `in` expression is a + b = **15**. Steps can use previous steps by name, just like LET in Excel."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Complete the M step that keeps only rows with **Amount above 1000**: `= Table.SelectRows(Source, ______ [Amount] > 1000)` (type the missing keyword)",
      "accept": [
        "each"
      ],
      "explain": "`each` is shorthand for a function with one parameter `_` (the current row): `each [Amount] > 1000` = `(_) => _[Amount] > 1000`."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which M expression joins the text \"Order-\" with the number in [OrderID] (a whole number)?",
      "options": [
        "\"Order-\" + [OrderID]",
        "\"Order-\" & [OrderID]",
        "\"Order-\" & Text.From([OrderID])",
        "CONCAT(\"Order-\", [OrderID])"
      ],
      "answer": 2,
      "explain": "M uses **&** to join text, but it does **not** convert numbers automatically: `\"Order-\" & 25` gives an error. Use `Text.From([OrderID])` first. `+` is only for numbers."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Complete the custom column that returns **0** when the division fails: `= ______ [Sales] / [Units] otherwise 0` (type the missing keyword)",
      "accept": [
        "try"
      ],
      "explain": "`try ... otherwise ...` is M's IFERROR: if the expression raises an error, the otherwise value is used."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements about M are **TRUE**? (choose all that apply)",
      "options": [
        "M is case-sensitive: Table.selectrows will not work",
        "Column names are written in square brackets, e.g. [Amount]",
        "if ... then ... else needs all three parts",
        "Every step must be on a single line",
        "You can see the M code in Home > Advanced Editor"
      ],
      "answers": [
        0,
        1,
        2,
        4
      ],
      "explain": "M is **case-sensitive** (function names and text comparisons), uses `[Column]` for fields, and an `if` always needs `else`. Steps can span several lines; they are separated by commas."
    }
  ]
};
