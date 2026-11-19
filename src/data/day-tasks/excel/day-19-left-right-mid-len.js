// Day Task (auto-graded practice) for day-19-left-right-mid-len
export default {
  "lesson": "day-19-left-right-mid-len",
  "minutes": 20,
  "intro": "Extract parts of IDs and codes with LEFT(), RIGHT(), MID() and validate lengths with LEN().",
  "tasks": [
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Extract the **state code** (first 2 characters) from the Emp ID in A2.",
      "example": {
        "title": "LEFT",
        "code": "=LEFT(B5, 3)"
      },
      "grid": {
        "A1": "Emp ID",
        "B1": "PAN",
        "C1": "Mobile",
        "D1": "Invoice",
        "A2": "MH2021-0457",
        "B2": "ABCPK1234F",
        "C2": "9876543210",
        "D2": "INV-2025-0081",
        "A3": "KA2019-1120",
        "B3": "BQRPS5678L",
        "C3": "98765",
        "D3": "INV-2025-0102",
        "A4": "DL2023-0098",
        "B4": "CXZPM9012K",
        "C4": "9123456780",
        "D4": "INV-2024-1199"
      },
      "starter": "",
      "solution": "=LEFT(A2,2)",
      "explain": "`=LEFT(A2,2)` → **MH**. LEFT takes characters from the start; if you leave out num_chars it returns just 1 character."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Extract the **joining year** (characters 3 to 6) from the Emp ID in A3.",
      "example": {
        "title": "MID",
        "code": "=MID(C2, 5, 2)"
      },
      "grid": {
        "A1": "Emp ID",
        "B1": "PAN",
        "C1": "Mobile",
        "D1": "Invoice",
        "A2": "MH2021-0457",
        "B2": "ABCPK1234F",
        "C2": "9876543210",
        "D2": "INV-2025-0081",
        "A3": "KA2019-1120",
        "B3": "BQRPS5678L",
        "C3": "98765",
        "D3": "INV-2025-0102",
        "A4": "DL2023-0098",
        "B4": "CXZPM9012K",
        "C4": "9123456780",
        "D4": "INV-2024-1199"
      },
      "starter": "",
      "solution": "=MID(A3,3,4)",
      "explain": "MID(text, start, count): start at position 3 and take 4 characters → **2019**. Note the result is text, not a number."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Extract the last **4 digits** of the invoice number in D4.",
      "example": {
        "title": "RIGHT",
        "code": "=RIGHT(A9, 3)"
      },
      "grid": {
        "A1": "Emp ID",
        "B1": "PAN",
        "C1": "Mobile",
        "D1": "Invoice",
        "A2": "MH2021-0457",
        "B2": "ABCPK1234F",
        "C2": "9876543210",
        "D2": "INV-2025-0081",
        "A3": "KA2019-1120",
        "B3": "BQRPS5678L",
        "C3": "98765",
        "D3": "INV-2025-0102",
        "A4": "DL2023-0098",
        "B4": "CXZPM9012K",
        "C4": "9123456780",
        "D4": "INV-2024-1199"
      },
      "starter": "",
      "solution": "=RIGHT(D4,4)",
      "explain": "`=RIGHT(D4,4)` → **1199**. RIGHT counts from the end of the text."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Check the mobile number in C3: how many **characters** does it have? (A valid number has 10.)",
      "example": {
        "title": "LEN",
        "code": "=LEN(B4)"
      },
      "grid": {
        "A1": "Emp ID",
        "B1": "PAN",
        "C1": "Mobile",
        "D1": "Invoice",
        "A2": "MH2021-0457",
        "B2": "ABCPK1234F",
        "C2": "9876543210",
        "D2": "INV-2025-0081",
        "A3": "KA2019-1120",
        "B3": "BQRPS5678L",
        "C3": "98765",
        "D3": "INV-2025-0102",
        "A4": "DL2023-0098",
        "B4": "CXZPM9012K",
        "C4": "9123456780",
        "D4": "INV-2024-1199"
      },
      "starter": "",
      "solution": "=LEN(C3)",
      "explain": "`=LEN(C3)` = **5**, so the number is incomplete. LEN counts every character including spaces."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Remove the **\"INV-\"** prefix from D2 by taking everything except the first 4 characters (combine RIGHT and LEN).",
      "example": {
        "title": "remove a fixed prefix",
        "code": "=RIGHT(A2, LEN(A2)-3)"
      },
      "grid": {
        "A1": "Emp ID",
        "B1": "PAN",
        "C1": "Mobile",
        "D1": "Invoice",
        "A2": "MH2021-0457",
        "B2": "ABCPK1234F",
        "C2": "9876543210",
        "D2": "INV-2025-0081",
        "A3": "KA2019-1120",
        "B3": "BQRPS5678L",
        "C3": "98765",
        "D3": "INV-2025-0102",
        "A4": "DL2023-0098",
        "B4": "CXZPM9012K",
        "C4": "9123456780",
        "D4": "INV-2024-1199"
      },
      "starter": "",
      "solution": "=RIGHT(D2,LEN(D2)-4)",
      "explain": "LEN(D2) = 13; RIGHT(D2, 13-4) → **2025-0081**. `=MID(D2,5,100)` also works."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What will this formula show?",
      "code": "=MID(\"UPSKILLR\",3,5)",
      "expected": "SKILL",
      "explain": "Start at the 3rd character (S) and take 5 characters: S-K-I-L-L → **SKILL**."
    }
  ]
};
