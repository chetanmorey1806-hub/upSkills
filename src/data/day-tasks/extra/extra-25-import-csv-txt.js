// Day Task (auto-graded practice) for extra-25-import-csv-txt
export default {
  "lesson": "extra-25-import-csv-txt",
  "minutes": 18,
  "intro": "Import CSV and TXT files correctly with Data > From Text/CSV and fix IDs, Indian dates and text-numbers.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which command imports a CSV with full control over delimiter, data types and refresh?",
      "options": [
        "File > Open and double-click the CSV",
        "Data > Get Data > From Text/CSV",
        "Insert > Object",
        "Home > Paste Special"
      ],
      "answer": 1,
      "explain": "**Data > From Text/CSV** loads the file through Power Query, where you choose delimiter, file origin (encoding) and column types, and you can Refresh next month."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "A bank CSV has account IDs like **00412578** and dates like **05-04-2025** (5 April). What usually happens if you just double-click the CSV?",
      "options": [
        "Everything is imported perfectly",
        "Leading zeros are lost and some dates may be read as 4 May (or stay text)",
        "Excel refuses to open it",
        "All values become text"
      ],
      "answer": 1,
      "explain": "Double-clicking lets Excel guess: **00412578** becomes 412578 and dd-mm dates may be swapped to mm-dd on a US-locale PC. Import with Power Query and set the types yourself."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "In the Power Query editor, how do you keep Employee IDs like **00125** with their leading zeros?",
      "options": [
        "Change the column type to Whole Number",
        "Change the column type to Text",
        "Apply a custom number format after loading",
        "Delete the Changed Type step and do nothing"
      ],
      "answer": 1,
      "explain": "Set the column type to **Text** (replace the automatic Changed Type). IDs, PIN codes and phone numbers are labels, not numbers to calculate."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Dates in the file are **dd-mm-yyyy** but your PC uses US settings. What is the correct fix in Power Query?",
      "options": [
        "Change type to Date",
        "Right-click column > Change Type > Using Locale... > Date, English (India)",
        "Split the column",
        "Format the cells as Date after loading"
      ],
      "answer": 1,
      "explain": "**Change Type > Using Locale** tells Power Query how the text is written (English (India) = dd-mm-yyyy). A plain \"Date\" type uses the PC's locale and can swap day and month."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A file was opened the wrong way and the amounts are now **text** with commas, e.g. \"1,25,000\". Write a formula that converts the amount in **B3** into a real number.",
      "example": {
        "title": "removing a character, then converting",
        "code": "=VALUE(SUBSTITUTE(\"2,500\",\",\",\"\"))   → 2500"
      },
      "grid": {
        "A1": "Voucher",
        "B1": "Amount",
        "A2": "V-001",
        "B2": "45,800",
        "A3": "V-002",
        "B3": "1,25,000",
        "A4": "V-003",
        "B4": "9,750"
      },
      "starter": "",
      "solution": "=VALUE(SUBSTITUTE(B3,\",\",\"\"))",
      "explain": "SUBSTITUTE removes every comma (\"125000\") and VALUE turns the text into the number **125000**. Using LEFT/RIGHT would break for different lengths."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A TXT export has dates as text in **dd-mm-yyyy** form. Convert the text in **A2** into a real Excel date with DATE, LEFT, MID and RIGHT.",
      "example": {
        "title": "building a date from pieces",
        "text": "For the text \"2025/03/09\" (yyyy/mm/dd):",
        "code": "=DATE(LEFT(A2,4),MID(A2,6,2),RIGHT(A2,2))"
      },
      "grid": {
        "A1": "Date (text)",
        "B1": "Amount",
        "A2": "15-08-2025",
        "B2": "3200",
        "A3": "02-10-2025",
        "B3": "1850"
      },
      "starter": "",
      "solution": "=DATE(RIGHT(A2,4),MID(A2,4,2),LEFT(A2,2))",
      "explain": "Year = last 4 characters, month = 2 characters starting at position 4, day = first 2 characters. DATE builds the serial number **45884** (15-Aug-2025), which you can then format as a date."
    }
  ]
};
