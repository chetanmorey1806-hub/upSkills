// Day Task (auto-graded practice) for day-04-data-entry-editing-copy-paste
export default {
  "lesson": "day-04-data-entry-editing-copy-paste",
  "minutes": 20,
  "intro": "Enter and edit data correctly, use Clear options, and move or copy data with Cut, Copy and Paste.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "Which key puts the active cell into **Edit mode** so you can change part of its content?",
      "accept": [
        "F2"
      ],
      "explain": "**F2** edits the cell in place (the cursor goes to the end of the content). Typing directly over a cell **replaces** everything in it, which is a common mistake."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Match the shortcuts. Which of these pairs are **correct**? (choose all that apply)",
      "options": [
        "Ctrl+C = Copy",
        "Ctrl+X = Cut",
        "Ctrl+V = Paste",
        "Ctrl+Y = Undo",
        "Ctrl+Z = Undo"
      ],
      "answers": [
        0,
        1,
        2,
        4
      ],
      "explain": "Copy **Ctrl+C**, Cut **Ctrl+X**, Paste **Ctrl+V**, Undo **Ctrl+Z**. **Ctrl+Y** is **Redo** (repeat), not Undo."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut enters **today's date** as a fixed value in the active cell?",
      "accept": [
        "Ctrl+;"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*;\\s*$"
      ],
      "explain": "**Ctrl + ;** types today's date as a fixed value (it will not change tomorrow). Ctrl + Shift + ; enters the current time."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Pressing **Delete** on a cell with bold red text \"450\" removes:",
      "options": [
        "the content and the formatting",
        "only the content; the formatting stays",
        "only the formatting",
        "the whole row"
      ],
      "answer": 1,
      "explain": "**Delete** removes only the **contents**. If you type a new number in that cell it will still be bold red. Use **Home > Editing > Clear > Clear All** to remove contents **and** formats."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Cell D2 has the formula `=B2*C2`. You want to paste its **result only** (not the formula) into another sheet. Which paste option do you use?",
      "options": [
        "Paste (Ctrl+V)",
        "Paste Values",
        "Paste Formatting",
        "Transpose"
      ],
      "answer": 1,
      "explain": "**Paste Values** (Home > Paste > Values, or Ctrl+Alt+V > V) pastes only the calculated result. A normal paste copies the formula, whose references change and may give wrong results in the new place."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Enter the formula for the **Total** marks of Riya (Maths + Science) in D2 using cell references.",
      "example": {
        "title": "a formula with references",
        "code": "=B2*C2"
      },
      "grid": {
        "A1": "Name",
        "B1": "Maths",
        "C1": "Science",
        "D1": "Total",
        "A2": "Riya",
        "B2": "78",
        "C2": "85"
      },
      "starter": "",
      "solution": "=B2+C2",
      "explain": "Type `=B2+C2` and press Enter. A formula with references recalculates if you later edit a mark with F2. Typing `=78+85` gives the same number today but becomes wrong when the data changes."
    }
  ]
};
