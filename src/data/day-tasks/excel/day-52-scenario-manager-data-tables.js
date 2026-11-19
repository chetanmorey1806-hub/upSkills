// Day Task (auto-graded practice) for day-52-scenario-manager-data-tables
export default {
  "lesson": "day-52-scenario-manager-data-tables",
  "minutes": 25,
  "intro": "Compare Best/Likely/Worst cases with Scenario Manager and calculate many results at once with Data Tables.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Scenario Manager > **Summary** creates:",
      "options": [
        "A chart",
        "A new sheet comparing result cells for every scenario",
        "A pivot table only",
        "A macro"
      ],
      "answer": 1,
      "explain": "The **Scenario Summary** report puts every scenario's changing cells and result cells side by side on a new sheet (or a Scenario PivotTable report)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "In a **one-variable Data Table** with interest rates listed **down a column**, which input box do you fill?",
      "options": [
        "Row input cell",
        "Column input cell",
        "Both",
        "Neither"
      ],
      "answer": 1,
      "explain": "Values listed **down a column** replace the cell given as **Column input cell**. Values across a row use the Row input cell. A two-variable table uses both."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What happens if you try to edit one cell inside a Data Table result?",
      "options": [
        "It works normally",
        "Excel says \"Cannot change part of a data table\"",
        "The table is deleted",
        "The value becomes text"
      ],
      "answer": 1,
      "explain": "Data Table results are a single `{=TABLE(...)}` array, so you **cannot change part** of it. Select the whole result area to delete it."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Profit for the **Likely** scenario = Units x (Price - Cost/Unit). Calculate it from column C.",
      "example": {
        "title": "model formula",
        "code": "=B2*(B3-B4)"
      },
      "grid": {
        "A1": "Input",
        "B1": "Best",
        "C1": "Likely",
        "D1": "Worst",
        "A2": "Units",
        "B2": "12000",
        "C2": "10000",
        "D2": "7000",
        "A3": "Price",
        "B3": "260",
        "C3": "250",
        "D3": "240",
        "A4": "Cost/Unit",
        "B4": "170",
        "C4": "175",
        "D4": "185",
        "A6": "Scenario No",
        "B6": "2"
      },
      "starter": "",
      "solution": "=C2*(C3-C4)",
      "explain": "10000 x (250 - 175) = **750000**. Scenario Manager would swap the input cells and show this result for each scenario."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Pick the scenario by number in **B6** (1 = Best, 2 = Likely, 3 = Worst) and return its **Units** with CHOOSE.",
      "example": {
        "title": "scenario selector",
        "code": "=CHOOSE($H$1, B3, C3, D3)"
      },
      "grid": {
        "A1": "Input",
        "B1": "Best",
        "C1": "Likely",
        "D1": "Worst",
        "A2": "Units",
        "B2": "12000",
        "C2": "10000",
        "D2": "7000",
        "A3": "Price",
        "B3": "260",
        "C3": "250",
        "D3": "240",
        "A4": "Cost/Unit",
        "B4": "170",
        "C4": "175",
        "D4": "185",
        "A6": "Scenario No",
        "B6": "2"
      },
      "starter": "",
      "solution": "=CHOOSE(B6,B2,C2,D2)",
      "explain": "Scenario 2 → Likely → **10000**. A scenario selector cell with CHOOSE or INDEX is a simple alternative to Scenario Manager."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Profit of the **Worst** case minus profit of the **Best** case (how much profit could drop).",
      "example": {
        "title": "comparing two scenarios",
        "code": "=C2*(C3-C4) - B2*(B3-B4)"
      },
      "grid": {
        "A1": "Input",
        "B1": "Best",
        "C1": "Likely",
        "D1": "Worst",
        "A2": "Units",
        "B2": "12000",
        "C2": "10000",
        "D2": "7000",
        "A3": "Price",
        "B3": "260",
        "C3": "250",
        "D3": "240",
        "A4": "Cost/Unit",
        "B4": "170",
        "C4": "175",
        "D4": "185",
        "A6": "Scenario No",
        "B6": "2"
      },
      "starter": "",
      "solution": "=D2*(D3-D4)-B2*(B3-B4)",
      "explain": "Worst = 7000 x 55 = 385000; Best = 12000 x 90 = 1080000 → **-695000**. A negative number shows the drop."
    }
  ]
};
