// Day Task (auto-graded practice) for day-18-concat-textjoin
export default {
  "lesson": "day-18-concat-textjoin",
  "minutes": 20,
  "intro": "Join names, addresses and codes with &, CONCATENATE(), CONCAT() and TEXTJOIN().",
  "tasks": [
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Create Sneha's **full name** \"Sneha Iyer\" (first name, space, last name).",
      "example": {
        "title": "joining with a space",
        "code": "=CONCATENATE(A5, \" \", B5)"
      },
      "grid": {
        "A1": "First",
        "B1": "Last",
        "C1": "City",
        "D1": "PIN",
        "E1": "Mobile",
        "A2": "Sneha",
        "B2": "Iyer",
        "C2": "Chennai",
        "D2": "600028",
        "E2": "9876543210",
        "A3": "Rahul",
        "B3": "Verma",
        "C3": "Lucknow",
        "D3": "226010",
        "A4": "Farah",
        "B4": "Khan",
        "C4": "Mumbai",
        "D4": "400050",
        "E4": "9123456780"
      },
      "starter": "",
      "solution": "=A2&\" \"&B2",
      "explain": "Both `=A2&\" \"&B2` and `=CONCAT(A2,\" \",B2)` give **Sneha Iyer**. The common mistake is forgetting the space `\" \"`."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Create an address line for Rahul like **Lucknow - 226010** (city, space-hyphen-space, PIN).",
      "example": {
        "title": "adding fixed text",
        "code": "=A2&\", \"&B2"
      },
      "grid": {
        "A1": "First",
        "B1": "Last",
        "C1": "City",
        "D1": "PIN",
        "E1": "Mobile",
        "A2": "Sneha",
        "B2": "Iyer",
        "C2": "Chennai",
        "D2": "600028",
        "E2": "9876543210",
        "A3": "Rahul",
        "B3": "Verma",
        "C3": "Lucknow",
        "D3": "226010",
        "A4": "Farah",
        "B4": "Khan",
        "C4": "Mumbai",
        "D4": "400050",
        "E4": "9123456780"
      },
      "starter": "",
      "solution": "=C3&\" - \"&D3",
      "explain": "Fixed text goes inside quotes: `=C3&\" - \"&D3` → **Lucknow - 226010**."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Use **TEXTJOIN** to join Farah's First, Last and City (A4:C4) with a **comma and space** between them: `Farah, Khan, Mumbai`.",
      "example": {
        "title": "TEXTJOIN",
        "code": "=TEXTJOIN(\"-\", TRUE, A2:D2)"
      },
      "grid": {
        "A1": "First",
        "B1": "Last",
        "C1": "City",
        "D1": "PIN",
        "E1": "Mobile",
        "A2": "Sneha",
        "B2": "Iyer",
        "C2": "Chennai",
        "D2": "600028",
        "E2": "9876543210",
        "A3": "Rahul",
        "B3": "Verma",
        "C3": "Lucknow",
        "D3": "226010",
        "A4": "Farah",
        "B4": "Khan",
        "C4": "Mumbai",
        "D4": "400050",
        "E4": "9123456780"
      },
      "starter": "",
      "solution": "=TEXTJOIN(\", \",TRUE,A4:C4)",
      "explain": "TEXTJOIN(delimiter, ignore_empty, range) puts the delimiter between every item: **Farah, Khan, Mumbai**."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Join all **mobile numbers** in E2:E4 into one cell separated by `; ` and **skip the empty one**.",
      "example": {
        "title": "ignore empty cells",
        "code": "=TEXTJOIN(\", \", TRUE, B2:B10)"
      },
      "grid": {
        "A1": "First",
        "B1": "Last",
        "C1": "City",
        "D1": "PIN",
        "E1": "Mobile",
        "A2": "Sneha",
        "B2": "Iyer",
        "C2": "Chennai",
        "D2": "600028",
        "E2": "9876543210",
        "A3": "Rahul",
        "B3": "Verma",
        "C3": "Lucknow",
        "D3": "226010",
        "A4": "Farah",
        "B4": "Khan",
        "C4": "Mumbai",
        "D4": "400050",
        "E4": "9123456780"
      },
      "starter": "",
      "solution": "=TEXTJOIN(\"; \",TRUE,E2:E4)",
      "explain": "With ignore_empty = **TRUE**, the blank mobile of Rahul is skipped: `9876543210; 9123456780`. With FALSE you would get a double separator \"9876543210; ; 9123456780\"."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What is the main advantage of **CONCAT** over **CONCATENATE**?",
      "options": [
        "CONCAT adds spaces automatically",
        "CONCAT accepts whole ranges like A2:C2",
        "CONCAT can ignore empty cells",
        "There is no difference"
      ],
      "answer": 1,
      "explain": "**CONCAT** accepts ranges (`=CONCAT(A2:C2)`); CONCATENATE needs every cell listed separately. Neither adds a separator; only TEXTJOIN has a delimiter and ignore_empty."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "A1 has **1250.5** and the formula is below. What does it show?",
      "code": "  | A\n1 | 1250.5\n\n=\"Total: Rs \"&TEXT(A1,\"0.00\")",
      "expected": "Total: Rs 1250.50",
      "explain": "TEXT(A1,\"0.00\") formats the number with 2 decimals as text, so the result is **Total: Rs 1250.50**. Without TEXT, joining gives \"Total: Rs 1250.5\" and loses the number format."
    }
  ]
};
