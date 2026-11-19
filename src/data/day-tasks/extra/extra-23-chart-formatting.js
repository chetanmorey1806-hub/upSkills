// Day Task (auto-graded practice) for extra-23-chart-formatting
export default {
  "lesson": "extra-23-chart-formatting",
  "minutes": 15,
  "intro": "Format chart elements (titles, axes, labels, colours, gap width) so a chart is clear at a glance.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "You click a chart element (e.g. the vertical axis). Which shortcut opens its **Format** pane?",
      "accept": [
        "Ctrl+1"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*1\\s*$"
      ],
      "explain": "**Ctrl + 1** opens the Format task pane for whatever chart element is selected (axis, series, title ...). Double-clicking the element does the same."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "The columns of your chart look thin with big gaps between them. Which setting makes them **thicker**?",
      "options": [
        "Increase Gap Width",
        "Decrease Gap Width (Format Data Series > Series Options)",
        "Increase Series Overlap",
        "Change the axis maximum"
      ],
      "answer": 1,
      "explain": "**Gap Width** is the space between columns as a % of a column width. Lowering it (e.g. from 150% to 60%) makes columns thicker and easier to read."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You want only the **Pune** column in a column chart to be orange and the rest grey. How do you select just that one column?",
      "options": [
        "Click it once",
        "Click it once (selects the series), then click it again (selects that single point)",
        "Double-click the legend",
        "Right-click the chart area"
      ],
      "answer": 1,
      "explain": "The first click selects the **whole series**, the second click selects the **single data point**. Then Format > Fill changes only that column, highlighting the key value."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which are **good** chart formatting practices? (choose all that apply)",
      "options": [
        "Give the chart a title that states the message, e.g. \"South leads Q2 sales\"",
        "Remove or lighten gridlines that do not add value",
        "Use data labels instead of a busy axis when there are few bars",
        "Use a 3-D effect on every chart",
        "Start the vertical axis of a column chart at 0"
      ],
      "answers": [
        0,
        1,
        2,
        4
      ],
      "explain": "Clarity first: a message title, light/no gridlines, direct labels and a zero-based axis for columns. 3-D effects distort the size of the bars and make values hard to read."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You formatted a chart perfectly and want to reuse the design for every monthly report. What do you save?",
      "options": [
        "A .xltx workbook template",
        "A chart template (.crtx) via right-click > Save as Template",
        "A theme (.thmx)",
        "A copy of the sheet"
      ],
      "answer": 1,
      "explain": "Right-click the chart > **Save as Template** creates a **.crtx** file. Later choose Insert > Recommended Charts > All Charts > **Templates** to apply it."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Chart titles can be **linked** to a cell (select the title, type `=` in the formula bar and click the cell). Build that title text in a cell: **\"Total Sales: \"** followed by the total of B2:B5 with thousand separators (format `#,##0`).",
      "example": {
        "title": "a dynamic title text",
        "code": "=\"Sales for \"&B1&\": \"&TEXT(SUM(C2:C13),\"#,##0\")"
      },
      "grid": {
        "A1": "Month",
        "B1": "Sales",
        "A2": "Apr",
        "B2": "245000",
        "A3": "May",
        "B3": "198500",
        "A4": "Jun",
        "B4": "276300",
        "A5": "Jul",
        "B5": "231200"
      },
      "starter": "",
      "solution": "=\"Total Sales: \"&TEXT(SUM(B2:B5),\"#,##0\")",
      "explain": "A linked title updates when the data changes: **Total Sales: 951,000**. TEXT keeps the thousand separators; plain `&SUM(...)` would show 951000."
    }
  ]
};
