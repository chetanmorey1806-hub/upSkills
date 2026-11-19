// Day Task (auto-graded practice) for day-55-power-pivot-data-model-dax
export default {
  "lesson": "day-55-power-pivot-data-model-dax",
  "minutes": 25,
  "intro": "Understand the Data Model, relationships and write first DAX measures (practised on the DAX Lab model: Sales, Product, Customer, Date).",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "In a Data Model, which table is the **fact** table?",
      "options": [
        "Product (ProductID, Name, Category, Price)",
        "Sales (OrderID, OrderDate, ProductID, Quantity, SalesAmount)",
        "Customer (CustomerID, Name, City)",
        "Date (Date, Month, Year)"
      ],
      "answer": 1,
      "explain": "The **fact** table holds the transactions (numbers to add: Quantity, SalesAmount) and keys to other tables. Product, Customer and Date are **lookup (dimension)** tables."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What is the main difference between a **calculated column** and a **measure**?",
      "options": [
        "No difference",
        "A calculated column is computed row by row and stored; a measure is calculated for the current filter context when used in a pivot",
        "Measures are stored in the table",
        "Calculated columns only work in pivots"
      ],
      "answer": 1,
      "explain": "**Calculated columns** are evaluated per row and stored (use them for slicing/grouping). **Measures** are calculated on the fly for each pivot cell/filter (use them for totals, ratios, KPIs)."
    },
    {
      "type": "code",
      "lang": "dax",
      "mins": 4,
      "q": "Write a measure for **Total Quantity**: the sum of the `Quantity` column of the `Sales` table.",
      "example": {
        "title": "a SUM measure",
        "code": "Total Cost := SUM(Sales[Cost])"
      },
      "starter": "",
      "solution": "SUM(Sales[Quantity])",
      "explain": "`SUM(Sales[Quantity])` adds the column for whatever filter the pivot cell applies (category, city, year). Column references use the form `Table[Column]`."
    },
    {
      "type": "code",
      "lang": "dax",
      "mins": 4,
      "q": "Write a measure for **Revenue** that multiplies `Quantity` by `UnitPrice` **row by row** in `Sales` and adds the results (use SUMX).",
      "example": {
        "title": "an iterator",
        "code": "Margin := SUMX(Sales, Sales[SalesAmount] - Sales[Cost])"
      },
      "starter": "",
      "solution": "SUMX(Sales, Sales[Quantity] * Sales[UnitPrice])",
      "explain": "SUMX(table, expression) evaluates the expression for each row and sums it. `SUM(Sales[Quantity]) * SUM(Sales[UnitPrice])` would multiply two totals, which is wrong."
    },
    {
      "type": "code",
      "lang": "dax",
      "mins": 4,
      "q": "Write a measure for the **number of different customers** who bought something (count distinct `CustomerID` in Sales).",
      "example": {
        "title": "unique count",
        "code": "Products Sold := DISTINCTCOUNT(Sales[ProductID])"
      },
      "starter": "",
      "solution": "DISTINCTCOUNT(Sales[CustomerID])",
      "explain": "DISTINCTCOUNT counts unique values. COUNT(Sales[CustomerID]) would count orders, so a customer with 5 orders would be counted 5 times."
    },
    {
      "type": "code",
      "lang": "dax",
      "mins": 4,
      "q": "Write a measure for **Electronics Sales**: total `SalesAmount` only where `Product[Category]` is \"Electronics\" (use CALCULATE).",
      "example": {
        "title": "CALCULATE with a filter",
        "code": "Pune Sales := CALCULATE(SUM(Sales[SalesAmount]), Customer[City] = \"Pune\")"
      },
      "starter": "",
      "solution": "CALCULATE(SUM(Sales[SalesAmount]), Product[Category] = \"Electronics\")",
      "explain": "CALCULATE changes the filter context: it adds Category = \"Electronics\" and then evaluates the SUM. The relationship Sales[ProductID] → Product[ProductID] makes the filter flow from Product to Sales."
    }
  ]
};
