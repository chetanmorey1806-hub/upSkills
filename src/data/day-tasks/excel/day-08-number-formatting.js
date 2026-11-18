// Day Task (auto-graded practice) for day-08-number-formatting
export default {
  "lesson": "day-08-number-formatting",
  "minutes": 20,
  "intro": "Show numbers as rupees, percentages, dates and decimals, while remembering that the stored value does not change.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "A cell contains **0.18**. You apply **Percentage** format. What does it show?",
      "options": [
        "0.18%",
        "18%",
        "1800%",
        "0%"
      ],
      "answer": 1,
      "explain": "Percentage format multiplies the **display** by 100: 0.18 shows as **18%**. The stored value is still 0.18. If you type 18 and then apply %, it shows 1800% (a common mistake)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Excel stores dates as **serial numbers**. What is the serial number of **1-Jan-1900**?",
      "options": [
        "0",
        "1",
        "1900",
        "36526"
      ],
      "answer": 1,
      "explain": "Excel counts days from 1-Jan-1900 = **1**. That is why you can subtract dates to get days between them. Time is stored as a fraction of a day (12:00 PM = 0.5)."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut opens the **Format Cells** dialog?",
      "accept": [
        "Ctrl+1"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*1\\s*$"
      ],
      "explain": "**Ctrl + 1** opens Format Cells. The Number tab has Number, Currency, Accounting, Date, Time, Percentage, Text and Custom formats."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "B2 has **12.456** formatted to show **2 decimal places** (12.46). C2 has `=B2*100`. What value does C2 calculate?",
      "options": [
        "1246",
        "1245.6",
        "1200",
        "12.46"
      ],
      "answer": 1,
      "explain": "Decimal formatting only changes the display; Excel still calculates with **12.456**, so C2 = **1245.6**. To really change the value you need ROUND (Day 15)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which format shows the rupee symbol aligned at the **left edge** of the cell and zeros as a dash?",
      "options": [
        "Currency",
        "Accounting",
        "Number",
        "General"
      ],
      "answer": 1,
      "explain": "**Accounting** format lines up currency symbols at the left edge and shows zero as \"-\". **Currency** puts the ₹ right next to the number."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "B2 has the cost price and C2 the selling price of a phone. Write a formula for the **profit percentage** as a decimal (profit / cost). In a real sheet you would then apply Percentage format.",
      "example": {
        "title": "a ratio as a decimal",
        "code": "=B5/C5"
      },
      "grid": {
        "A1": "Item",
        "B1": "Cost",
        "C1": "Selling",
        "A2": "Phone",
        "B2": "12000",
        "C2": "13800"
      },
      "starter": "",
      "solution": "=(C2-B2)/B2",
      "explain": "Profit % = (Selling - Cost) / Cost = 1800 / 12000 = **0.15**, which shows as 15% with Percentage format. Do not multiply by 100 if you are going to apply % format: you would get 1500%."
    }
  ]
};
