export default {
  "id": "extra-23-chart-formatting",
  "title": "Chart Formatting",
  "module": "Additional Job-Oriented Skills",
  "extraNo": 23,
  "level": "Intermediate",
  "duration": "1.5 hours",
  "summary": "A chart is only useful when it is clear at a glance. This lesson teaches how to format every part of an Excel chart: titles, axes, data labels, colours, gridlines, legends and gap width, how to highlight one bar, link a title to a cell, and save your formatting as a reusable chart template.",
  "objectives": [
    "Identify chart elements and the tools to format them (Chart Design, Format, Format pane)",
    "Format titles, axes, data labels, legends and gridlines with exact menu paths",
    "Highlight a key data point and create a dynamic chart title",
    "Save and reuse formatting as a chart template (.crtx)"
  ],
  "theory": [
    {
      "heading": "Chart elements and where to format them",
      "content": "Click a chart and three tools appear:\n\n- **Chart Design** tab: Add Chart Element, Quick Layout, Change Colors, Chart Styles, Switch Row/Column, Select Data, Change Chart Type, Move Chart.\n- **Format** tab: Current Selection drop-down (select any element precisely), Shape Fill, Shape Outline, Shape Effects, WordArt Styles, Size.\n- Three buttons beside the chart: **+** Chart Elements, **brush** Chart Styles, **funnel** Chart Filters.\n\nThe most powerful tool is the **Format pane**: select any element and press **Ctrl+1** (or double-click it, or right-click > Format ...).",
      "points": [
        "Alt+F1: insert a default chart next to the data",
        "F11: insert a chart on a new chart sheet",
        "Ctrl+1: open the Format pane for the selected element",
        "Delete: removes the selected element (e.g. gridlines, legend)"
      ]
    },
    {
      "heading": "Titles, legend and gridlines",
      "content": "- **Chart title**: Chart Design > Add Chart Element > Chart Title > Above Chart. Click the title box to type.\n- **Axis titles**: Chart Design > Add Chart Element > Axis Titles > Primary Horizontal / Primary Vertical.\n- **Legend**: Chart Design > Add Chart Element > Legend > Right / Top / Bottom / None. For a single-series chart, remove the legend (the title explains it).\n- **Gridlines**: Chart Design > Add Chart Element > Gridlines. Or click a gridline and press Delete for a cleaner look.\n\n**Dynamic title**: click the chart title, click in the formula bar, type `=` and click a cell (e.g. `=Sheet1!$D$1`), press Enter. The title now changes when the cell changes.",
      "tip": "Keep only what helps the reader: one clear title, labels or axis, no 3-D effects, no unnecessary gridlines."
    },
    {
      "heading": "Formatting axes",
      "content": "Select the vertical axis and press Ctrl+1 to open **Format Axis**:\n\n- Axis Options > **Bounds**: Minimum and Maximum (e.g. start at 0 so bars are not misleading).\n- Axis Options > **Units**: Major (gap between gridlines).\n- Axis Options > **Display units**: Thousands, Millions etc.\n- **Number** section: Category Custom, format code e.g. `#,##0,\"K\"` shows 120000 as 120K. Untick Linked to source.\n- Horizontal (category) axis: Labels > Label Position, Text direction / custom angle in Size & Properties.",
      "tip": "For column/bar charts, always start the value axis at 0. A cut axis exaggerates small differences."
    },
    {
      "heading": "Data labels, colours and gap width",
      "content": "- **Data labels**: Chart Design > Add Chart Element > Data Labels > Outside End. Format with Ctrl+1 > Label Options: Value, Category Name, Percentage (pie), or **Value From Cells** to show custom text.\n- **Series colour**: click a bar once (selects the series) > Format > Shape Fill.\n- **One bar only**: click once (series), then click again on the same bar (single point) > Format > Shape Fill.\n- **Gap width**: select the series > Ctrl+1 > Series Options > Gap Width (e.g. 50% for thicker bars). Series Overlap is for clustered charts.\n- **Colour palette**: Chart Design > Change Colors, or Page Layout > Themes > Colors for the whole workbook.\n- **Chart style**: Chart Design > Chart Styles gallery."
    },
    {
      "heading": "Size, position and chart templates",
      "content": "- **Exact size**: Format > Size > Height / Width (e.g. 7.5 cm x 12 cm) so all dashboard charts match.\n- **Lock position**: Ctrl+1 on the chart area > Size & Properties > Properties > Don't move or size with cells.\n- **Align several charts**: Ctrl+click charts > Shape Format > Align > Align Top / Distribute Horizontally.\n- **Save as template**: right-click the chart area > **Save as Template...** > name e.g. `Company_Column.crtx`. It is saved in the Charts templates folder.\n- **Use a template**: Insert > Charts dialog launcher (or Insert > Recommended Charts) > **All Charts** tab > **Templates** folder > pick it. Or for an existing chart: Chart Design > Change Chart Type > Templates.\n- **Reset**: Format > Reset to Match Style removes custom formatting from the selected element.",
      "tip": "Copy formatting from one chart to another: select the formatted chart, Ctrl+C, select the other chart, Home > Paste > Paste Special > Formats."
    }
  ],
  "examples": [
    {
      "title": "Make a professional monthly sales column chart",
      "scenario": "Create and format a clean column chart for H1 sales.",
      "table": {
        "headers": [
          "A: Month",
          "B: Sales (₹)"
        ],
        "rows": [
          [
            "Apr",
            "120000"
          ],
          [
            "May",
            "135000"
          ],
          [
            "Jun",
            "98000"
          ],
          [
            "Jul",
            "150000"
          ],
          [
            "Aug",
            "142000"
          ],
          [
            "Sep",
            "160000"
          ]
        ]
      },
      "steps": [
        "Select A1:B7 and press Alt+F1 to insert a clustered column chart",
        "Click the title and type: Monthly Sales Apr-Sep 2025",
        "Click the legend and press Delete",
        "Click any gridline and press Delete",
        "Chart Design > Add Chart Element > Data Labels > Outside End",
        "Click any bar > Ctrl+1 > Series Options > Gap Width = 60%",
        "Format > Shape Fill > choose a dark blue",
        "Click the vertical axis > Ctrl+1 > Number > Category Custom > Format Code #,##0,\"K\" > Add; set Bounds Minimum = 0"
      ],
      "result": "A chart with one blue series, 6 thicker bars, values shown on top, no legend, no gridlines and the axis showing 0K, 20K ... 180K (data labels show full values unless you format them too)",
      "explanation": "Removing clutter (legend for one series, gridlines) and adding data labels makes the numbers readable without guessing from the axis."
    },
    {
      "title": "Highlight the best month in a different colour",
      "scenario": "Make the highest month stand out in green.",
      "table": {
        "headers": [
          "A: Month",
          "B: Sales (₹)"
        ],
        "rows": [
          [
            "Apr",
            "120000"
          ],
          [
            "May",
            "135000"
          ],
          [
            "Jun",
            "98000"
          ],
          [
            "Jul",
            "150000"
          ],
          [
            "Aug",
            "142000"
          ],
          [
            "Sep",
            "160000"
          ]
        ]
      },
      "steps": [
        "Use the chart from the previous example",
        "Click once on any bar: the whole series is selected",
        "Click again on the Sep bar: only that bar is selected",
        "Format > Shape Fill > Green",
        "Optional: Ctrl+1 > Fill > keep other bars grey for contrast"
      ],
      "result": "The Sep bar (160000, the maximum) is green and the other five bars stay blue/grey",
      "explanation": "Two single clicks (not a double-click) select one data point. This manual method does not move if data changes; for an automatic highlight use a helper series =IF(B2=MAX($B$2:$B$7),B2,NA()) plotted with 100% series overlap."
    },
    {
      "title": "Dynamic chart title linked to a cell",
      "scenario": "The chart title must show the total, and update when numbers change.",
      "table": {
        "headers": [
          "A: Month",
          "B: Sales (₹)"
        ],
        "rows": [
          [
            "Apr",
            "120000"
          ],
          [
            "May",
            "135000"
          ],
          [
            "Jun",
            "98000"
          ],
          [
            "Jul",
            "150000"
          ],
          [
            "Aug",
            "142000"
          ],
          [
            "Sep",
            "160000"
          ]
        ]
      },
      "steps": [
        "In D1 type =\"Total Sales Apr-Sep: \"&TEXT(SUM(B2:B7),\"₹#,##0\")",
        "Click the chart title once to select it",
        "Click in the formula bar, type = and click cell D1 (Excel writes =Sheet1!$D$1)",
        "Press Enter"
      ],
      "code": "=\"Total Sales Apr-Sep: \"&TEXT(SUM(B2:B7),\"₹#,##0\")",
      "result": "Chart title shows: Total Sales Apr-Sep: ₹805,000",
      "explanation": "120000 + 135000 + 98000 + 150000 + 142000 + 160000 = 805000. Change any month's sales and the title updates automatically."
    },
    {
      "title": "Display values in thousands on axis and labels",
      "scenario": "The managers want 120K style numbers on the axis and data labels.",
      "table": {
        "headers": [
          "A: Month",
          "B: Sales (₹)"
        ],
        "rows": [
          [
            "Apr",
            "120000"
          ],
          [
            "May",
            "135000"
          ],
          [
            "Jun",
            "98000"
          ],
          [
            "Jul",
            "150000"
          ],
          [
            "Aug",
            "142000"
          ],
          [
            "Sep",
            "160000"
          ]
        ]
      },
      "steps": [
        "Click the vertical axis > Ctrl+1 > Axis Options > Number > Category: Custom > Format Code: #,##0,\"K\" > Add",
        "Click a data label > Ctrl+1 > Label Options > Number > Custom > same code > Add",
        "Untick Linked to source if it is ticked"
      ],
      "code": "#,##0,\"K\"",
      "result": "Labels: 120K, 135K, 98K, 150K, 142K, 160K",
      "explanation": "Each comma at the end of a number format divides the displayed value by 1000. The underlying data does not change."
    },
    {
      "title": "Save and reuse the formatting as a chart template",
      "scenario": "Every monthly report must use the same chart style.",
      "table": {
        "headers": [
          "A: Month",
          "B: Sales (₹)"
        ],
        "rows": [
          [
            "Apr",
            "120000"
          ],
          [
            "May",
            "135000"
          ],
          [
            "Jun",
            "98000"
          ],
          [
            "Jul",
            "150000"
          ],
          [
            "Aug",
            "142000"
          ],
          [
            "Sep",
            "160000"
          ]
        ]
      },
      "steps": [
        "Right-click the formatted chart area > Save as Template",
        "File name: Company_Column > Save (saves as Company_Column.crtx)",
        "Next month: select the new data, Insert > Recommended Charts > All Charts tab > Templates > Company_Column > OK"
      ],
      "result": "The new chart appears with the same colours, fonts, gap width, labels and axis format in one click",
      "explanation": "Chart templates (.crtx) store formatting and chart type, not data. Share the .crtx file with colleagues so the whole team's charts look identical."
    }
  ],
  "interview": [
    {
      "q": "How do you open the formatting options for any chart element quickly?",
      "a": "Select the element and press Ctrl+1 (or double-click it). The Format pane opens with Fill & Line, Effects, Size & Properties and element-specific options.",
      "level": "Easy"
    },
    {
      "q": "How do you change the colour of only one bar?",
      "a": "Click a bar once to select the series, click it again to select that single point, then Format > Shape Fill (or Ctrl+1 > Fill).",
      "level": "Easy"
    },
    {
      "q": "How do you make a chart title dynamic?",
      "a": "Select the title, type = in the formula bar, click the cell containing the title text and press Enter. The title is now linked to the cell.",
      "level": "Medium"
    },
    {
      "q": "What is gap width?",
      "a": "The space between columns/bars as a percentage of bar width (Format Data Series > Series Options > Gap Width). Lower gap width gives thicker bars.",
      "level": "Easy"
    },
    {
      "q": "Why should a column chart's value axis start at 0?",
      "a": "Bar length represents value. If the axis starts higher, small differences look huge and the chart misleads the reader.",
      "level": "Medium"
    },
    {
      "q": "How do you show numbers in thousands on an axis without changing data?",
      "a": "Format Axis > Number > Custom code #,##0,\"K\" or Axis Options > Display units > Thousands.",
      "level": "Medium"
    },
    {
      "q": "What is a chart template and how is it used?",
      "a": "A .crtx file that stores chart type and formatting. Create with right-click > Save as Template; apply via Insert > Recommended Charts > All Charts > Templates or Change Chart Type > Templates.",
      "level": "Medium"
    },
    {
      "q": "How do you highlight the maximum value automatically?",
      "a": "Add a helper column =IF(B2=MAX($B$2:$B$7),B2,NA()), add it as a second series, set Series Overlap 100% and give it a different colour. NA() values are not plotted.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Insert a line chart for weekly visitors (Wk1 1200, Wk2 1500, Wk3 1350, Wk4 1800) and add markers and data labels above.",
      "hint": "Insert > Line with Markers; Data Labels > Above.",
      "solution": "Select data > Insert > Charts > Line > Line with Markers. Chart Design > Add Chart Element > Data Labels > Above. Delete the legend. Title: Weekly Visitors."
    },
    {
      "task": "For a bar chart of 5 products, sort bars so the largest is on top and reduce gap width to 40%.",
      "hint": "Sort data ascending (bar charts plot from bottom); Series Options.",
      "solution": "Sort the data smallest to largest (Data > Sort Smallest to Largest) so the largest appears at the top of a bar chart. Select series > Ctrl+1 > Gap Width 40%. Alternatively Format Axis > Categories in reverse order."
    },
    {
      "task": "Link a chart title to cell F1 that contains =\"Sales of \"&G1 where G1 has a region name selected from a drop-down.",
      "hint": "Select title, type = in formula bar.",
      "solution": "Select chart title, click the formula bar, type =, click F1, Enter. Changing G1 to South changes the title to Sales of South."
    },
    {
      "task": "Make all 4 dashboard charts exactly 7 cm high and 11 cm wide and align their tops.",
      "hint": "Format > Size and Align.",
      "solution": "Ctrl+click all 4 charts > Shape Format > Size: Height 7 cm, Width 11 cm. Then Shape Format > Align > Align Top and Distribute Horizontally."
    }
  ],
  "quiz": [
    {
      "question": "Which shortcut opens the Format pane for a selected chart element?",
      "options": [
        "Ctrl+F1",
        "Ctrl+1",
        "Alt+F1",
        "F11"
      ],
      "answer": 1,
      "explanation": "Ctrl+1 opens the format pane for any selected object."
    },
    {
      "question": "Which shortcut creates a chart on a separate chart sheet?",
      "options": [
        "F11",
        "Alt+F1",
        "Ctrl+T",
        "F4"
      ],
      "answer": 0,
      "explanation": "F11 creates a chart sheet; Alt+F1 embeds a chart."
    },
    {
      "question": "Custom number format #,##0,\"K\" shows 150000 as:",
      "options": [
        "150000K",
        "150K",
        "1.5K",
        "15K"
      ],
      "answer": 1,
      "explanation": "One trailing comma divides the displayed value by 1000."
    },
    {
      "question": "The file extension of a saved chart template is:",
      "options": [
        ".xltx",
        ".crtx",
        ".thmx",
        ".xlsm"
      ],
      "answer": 1,
      "explanation": ".crtx is the chart template format."
    },
    {
      "question": "To select a single bar in a series you:",
      "options": [
        "Double-click the legend",
        "Click once then click again on that bar",
        "Press Ctrl+A",
        "Right-click the axis"
      ],
      "answer": 1,
      "explanation": "First click selects the series, second click selects the single point."
    }
  ]
};
