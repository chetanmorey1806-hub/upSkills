// Day Task (auto-graded practice) for day-51-what-if-goal-seek
export default {
  "lesson": "day-51-what-if-goal-seek",
  "minutes": 20,
  "intro": "Use What-If Analysis and Goal Seek to work backwards from a target, and solve the same questions with formulas.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where is **Goal Seek**?",
      "options": [
        "Data > Forecast > What-If Analysis > Goal Seek",
        "Formulas > Goal Seek",
        "Home > Editing > Goal Seek",
        "Review > Goal Seek"
      ],
      "answer": 0,
      "explain": "**Data > Forecast > What-If Analysis > Goal Seek**. The same menu has Scenario Manager and Data Table."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements about the Goal Seek dialog are TRUE? (choose all that apply)",
      "options": [
        "\"Set cell\" must contain a formula",
        "\"By changing cell\" must be a typed value (input), not a formula",
        "Goal Seek can change several input cells at once",
        "\"To value\" is the result you want"
      ],
      "answers": [
        0,
        1,
        3
      ],
      "explain": "Set cell = the **formula** (result), To value = the target number, By changing cell = **one input cell** with a constant. To change several inputs with constraints you need **Solver**."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which What-If tool stores named sets of inputs like **Best / Likely / Worst** case?",
      "options": [
        "Goal Seek",
        "Scenario Manager",
        "Data Table",
        "Flash Fill"
      ],
      "answer": 1,
      "explain": "**Scenario Manager** stores scenarios and creates a summary report. Goal Seek finds one input for one target; Data Table shows results for many input values."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Target-marks problem: Neha scored B2:B4 in three tests and wants an **average of 75** over **four** tests. Which score does she need in test 4? (This is what Goal Seek would find; solve it with a formula.)",
      "example": {
        "title": "working backwards",
        "code": "=Target*Count - SUM(existing)"
      },
      "grid": {
        "A1": "Test",
        "B1": "Marks",
        "A2": "Test 1",
        "B2": "68",
        "A3": "Test 2",
        "B3": "74",
        "A4": "Test 3",
        "B4": "79",
        "A5": "Test 4",
        "A7": "Target Avg",
        "B7": "75"
      },
      "starter": "",
      "solution": "=B7*4-SUM(B2:B4)",
      "explain": "Needed total = 75 x 4 = 300; already scored 221 → **79**. Goal Seek would set the average cell to 75 by changing B5 and find the same value."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "**Break-even**: Fixed cost ₹1,20,000 per month, selling price ₹450 and variable cost ₹290 per unit. How many **whole units** must be sold to cover costs? (round up)",
      "example": {
        "title": "break-even units",
        "code": "=ROUNDUP(Fixed/(Price-VarCost), 0)"
      },
      "grid": {
        "A1": "Fixed Cost",
        "B1": "120000",
        "A2": "Price",
        "B2": "450",
        "A3": "Variable Cost",
        "B3": "290"
      },
      "starter": "",
      "solution": "=ROUNDUP(B1/(B2-B3),0)",
      "explain": "Contribution per unit = 450 - 290 = 160; 120000 / 160 = **750** units exactly. ROUNDUP makes sure a fractional answer becomes the next whole unit."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "**Gross salary** problem: the employee wants a **net salary of ₹45,000** after a **10% deduction**. Which gross salary is needed? (net = gross x (1 - 10%))",
      "example": {
        "title": "reverse a percentage",
        "code": "=Net/(1-Rate)"
      },
      "grid": {
        "A1": "Net Wanted",
        "B1": "45000",
        "A2": "Deduction %",
        "B2": "0.1"
      },
      "starter": "",
      "solution": "=B1/(1-B2)",
      "explain": "Gross = 45000 / 0.9 = **50000**. A common mistake is 45000 x 1.1 = 49500, which gives a net of only 44550. Goal Seek avoids such algebra mistakes."
    }
  ]
};
