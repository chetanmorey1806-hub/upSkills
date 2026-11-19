// Day Task (auto-graded practice) for what-if-analysis
export default {
  "lesson": "what-if-analysis",
  "minutes": 20,
  "intro": "Revise Goal Seek, Scenario Manager, Data Tables, Solver and the financial functions behind EMI and investment decisions.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "You know the target **profit** cell (formula) and want Excel to find the **units** needed to reach ₹5,00,000. Which tool?",
      "options": [
        "Scenario Manager",
        "Goal Seek",
        "Data Table",
        "Solver with 10 constraints"
      ],
      "answer": 1,
      "explain": "**Goal Seek** (Data > What-If Analysis > Goal Seek): Set cell = profit, To value = 500000, By changing = units. It solves one input for one target."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which tools are under **Data > What-If Analysis**? (choose all that apply)",
      "options": [
        "Scenario Manager",
        "Goal Seek",
        "Data Table",
        "Solver",
        "Forecast Sheet"
      ],
      "answers": [
        0,
        1,
        2
      ],
      "explain": "What-If Analysis contains Scenario Manager, Goal Seek and Data Table. **Solver** is an add-in (Data > Analyze > Solver after enabling it) and Forecast Sheet is a separate button."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Break-even: Fixed cost is in **B1**, price per unit in **B2** and variable cost per unit in **B3**. Write the formula for the **break-even units** (the answer Goal Seek would find for profit = 0).",
      "example": {
        "title": "solving for one input",
        "code": "=Target/(Price-Cost)"
      },
      "grid": {
        "A1": "Fixed cost",
        "B1": "240000",
        "A2": "Price per unit",
        "B2": "850",
        "A3": "Variable cost per unit",
        "B3": "550"
      },
      "starter": "",
      "solution": "=B1/(B2-B3)",
      "explain": "Profit = units × (price − variable cost) − fixed cost = 0 → units = 240,000 / 300 = **800**. Goal Seek finds the same number by trial; the formula shows the logic."
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
      "explain": "Values arranged **down a column** replace the cell given as **Column input cell**. Excel then writes `{=TABLE(,B3)}`, which cannot be edited directly."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "A loan of ₹1,00,000 at 12% per year is repaid in 12 monthly EMIs. What does this formula return, rounded to 2 decimals?",
      "code": "=ROUND(-PMT(12%/12, 12, 100000), 2)",
      "expected": "8884.88",
      "explain": "PMT(rate per period 1%, 12 periods, 100000) = −8,884.88; the minus sign is cash going out. Using the **annual** rate 12% instead of 1% per month is the classic mistake."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "NPV of a project at the company's required rate is **positive**. What does it mean?",
      "options": [
        "The project loses money",
        "The project earns more than the required rate of return",
        "IRR is lower than the required rate",
        "The project payback is under 1 year"
      ],
      "answer": 1,
      "explain": "Positive NPV = the discounted cash inflows exceed the investment at the required rate, which is equivalent to **IRR > required rate**. Remember `NPV()` discounts from period 1, so add the time-0 investment separately."
    }
  ]
};
