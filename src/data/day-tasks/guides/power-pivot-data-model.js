// Day Task (auto-graded practice) for power-pivot-data-model
export default {
  "lesson": "power-pivot-data-model",
  "minutes": 18,
  "intro": "Revise the Data Model, relationships, star schema, calculated columns vs measures, CALCULATE and CUBE functions.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "In a **star schema**, which table holds the transactions (sales lines with amounts and keys)?",
      "options": [
        "Dimension table",
        "Fact table",
        "Lookup table",
        "Bridge table"
      ],
      "answer": 1,
      "explain": "The **fact** table (e.g. Sales) holds numeric events and foreign keys. **Dimension** tables (Products, Customers, Dates) describe them and filter the facts through one-to-many relationships."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What is the main difference between a **calculated column** and a **measure**?",
      "options": [
        "None",
        "A calculated column is computed row by row and stored; a measure is computed at query time for the current filter context",
        "Measures are stored in cells",
        "Calculated columns can only use SUM"
      ],
      "answer": 1,
      "explain": "Use calculated columns for row-level values you slice by (e.g. Age Group). Use **measures** for aggregations (Total Sales, Margin %) that must respond to slicers and pivot rows."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Complete the measure for total sales from the Amount column of the Sales table: `Total Sales := ______(Sales[Amount])`",
      "accept": [
        "SUM"
      ],
      "explain": "`Total Sales := SUM(Sales[Amount])`. For row-by-row maths use an iterator: `Revenue := SUMX(Sales, Sales[Qty] * Sales[Price])`."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which DAX function changes the filter context, e.g. to get sales for the North region only?",
      "options": [
        "FILTERS",
        "CALCULATE",
        "SUMIFS",
        "LOOKUPVALUE"
      ],
      "answer": 1,
      "explain": "`CALCULATE([Total Sales], Stores[Region] = \"North\")` evaluates the measure with a modified filter. SUMIFS is an Excel function and does not exist in DAX."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "`Avg Order Value := DIVIDE([Total Sales], [Orders])` is preferred over `[Total Sales] / [Orders]` because:",
      "options": [
        "DIVIDE is faster",
        "DIVIDE returns BLANK (or an alternate value) instead of an error when Orders is 0",
        "DIVIDE rounds the result",
        "/ is not allowed in DAX"
      ],
      "answer": 1,
      "explain": "DIVIDE handles divide-by-zero safely, so empty pivot cells show blank instead of #NUM!/Infinity."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "The measure `Orders := COUNTROWS(Sales)` and `Customers := DISTINCTCOUNT(Sales[CustomerID])` are used in a pivot. For a check, write an Excel formula on this extract that gives **Total Sales ÷ number of orders** (the Avg Order Value).",
      "example": {
        "title": "average per order",
        "code": "=SUM(D2:D200)/COUNTA(A2:A200)"
      },
      "grid": {
        "A1": "OrderID",
        "B1": "CustomerID",
        "C1": "Amount",
        "A2": "S1",
        "B2": "C01",
        "C2": "4500",
        "A3": "S2",
        "B3": "C02",
        "C3": "1200",
        "A4": "S3",
        "B4": "C01",
        "C4": "3300",
        "A5": "S4",
        "B5": "C03",
        "C5": "7800",
        "A6": "S5",
        "B6": "C02",
        "C6": "2200"
      },
      "starter": "",
      "solution": "=SUM(C2:C6)/COUNTA(A2:A6)",
      "explain": "Total 19,000 / 5 orders = **3,800**. In DAX: `DIVIDE([Total Sales],[Orders])`. Do not divide by the 3 distinct customers; that would be sales per customer."
    }
  ]
};
