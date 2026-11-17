export default {
  "id": "extra-21-rank",
  "title": "RANK()",
  "module": "Additional Job-Oriented Skills",
  "extraNo": 21,
  "level": "Intermediate",
  "duration": "1 hour",
  "summary": "RANK(), RANK.EQ() and RANK.AVG() give the position of a number in a list, like 1st, 2nd, 3rd in a class result or a sales leaderboard. You will also learn how to handle ties and how to rank within a group.",
  "objectives": [
    "Write RANK / RANK.EQ / RANK.AVG with number, ref and order",
    "Rank in descending (highest = 1) and ascending (lowest = 1) order",
    "Understand how ties are handled and create unique ranks",
    "Rank within a group using COUNTIFS"
  ],
  "theory": [
    {
      "heading": "What is RANK()?",
      "content": "RANK returns the position of a number within a list. In a marks sheet the highest marks get rank 1.\n\nExcel has three versions:\n- `RANK()` - older function, kept for compatibility.\n- `RANK.EQ()` - same result as RANK; tied values get the same (best) rank.\n- `RANK.AVG()` - tied values get the AVERAGE of the positions they occupy.",
      "syntax": "=RANK(number, ref, [order])\n=RANK.EQ(number, ref, [order])\n=RANK.AVG(number, ref, [order])"
    },
    {
      "heading": "Arguments explained",
      "content": "- `number` (required): the value you want to rank, e.g. B2.\n- `ref` (required): the full list of values to compare against, e.g. $B$2:$B$7. Must be a **cell range** (not an array calculation). Lock it with $ so it does not move when copied.\n- `order` (optional): 0 or omitted = descending (largest = rank 1). Any non-zero value, usually 1 = ascending (smallest = rank 1).\n\nText and blank cells in ref are ignored.",
      "tip": "The most common mistake is forgetting $ in the ref. Without it, the range shifts down as you copy and ranks become wrong. Press F4 to add $ signs."
    },
    {
      "heading": "Ties: RANK.EQ vs RANK.AVG",
      "content": "Marks 92, 88, 81, 75, 75, 60:\n- RANK.EQ gives 1, 2, 3, **4, 4**, 6 (rank 5 is skipped).\n- RANK.AVG gives 1, 2, 3, **4.5, 4.5**, 6 (the two 75s occupy positions 4 and 5, average 4.5).\n\nTo give unique ranks (first come, first ranked) add a COUNTIF tie-breaker:\n\n`=RANK.EQ(B2,$B$2:$B$7)+COUNTIF($B$2:B2,B2)-1`"
    },
    {
      "heading": "Ascending ranks and ranking within a group",
      "content": "Use order = 1 when SMALLER is better: delivery days, expenses, defects, race time.\n\nRANK has no built-in condition. To rank sales within each region, count how many in the SAME region have a HIGHER value, then add 1:\n\n`=COUNTIFS($A$2:$A$7,A2,$B$2:$B$7,\">\"&B2)+1`",
      "tip": "In Microsoft 365, combine with SORTBY to show a sorted leaderboard: =SORTBY(A2:B7,B2:B7,-1)."
    }
  ],
  "examples": [
    {
      "title": "Class rank (highest marks = rank 1)",
      "scenario": "Give each student a rank based on marks.",
      "table": {
        "headers": [
          "A: Student",
          "B: Marks"
        ],
        "rows": [
          [
            "Riya",
            "88"
          ],
          [
            "Aman",
            "75"
          ],
          [
            "Neha",
            "92"
          ],
          [
            "Karan",
            "75"
          ],
          [
            "Pooja",
            "60"
          ],
          [
            "Vikas",
            "81"
          ]
        ]
      },
      "steps": [
        "Click C2",
        "Type =RANK.EQ(B2,$B$2:$B$7)",
        "Press Enter",
        "Drag the fill handle down to C7"
      ],
      "code": "=RANK.EQ(B2,$B$2:$B$7)",
      "result": "Riya 2, Aman 4, Neha 1, Karan 4, Pooja 6, Vikas 3",
      "explanation": "Order omitted = descending. Aman and Karan both have 75 and share rank 4; rank 5 is skipped. =RANK(B2,$B$2:$B$7) gives the same output."
    },
    {
      "title": "Average rank for ties with RANK.AVG",
      "scenario": "Management wants tied students to get the average of their positions.",
      "table": {
        "headers": [
          "A: Student",
          "B: Marks"
        ],
        "rows": [
          [
            "Riya",
            "88"
          ],
          [
            "Aman",
            "75"
          ],
          [
            "Neha",
            "92"
          ],
          [
            "Karan",
            "75"
          ],
          [
            "Pooja",
            "60"
          ],
          [
            "Vikas",
            "81"
          ]
        ]
      },
      "steps": [
        "Click D2",
        "Type =RANK.AVG(B2,$B$2:$B$7)",
        "Press Enter and fill down to D7"
      ],
      "code": "=RANK.AVG(B2,$B$2:$B$7)",
      "result": "Riya 2, Aman 4.5, Neha 1, Karan 4.5, Pooja 6, Vikas 3",
      "explanation": "The two 75s are at positions 4 and 5, so each gets (4+5)/2 = 4.5."
    },
    {
      "title": "Ascending rank (lowest = 1)",
      "scenario": "Rank the same marks from lowest to highest to find the students who need extra coaching first.",
      "table": {
        "headers": [
          "A: Student",
          "B: Marks"
        ],
        "rows": [
          [
            "Riya",
            "88"
          ],
          [
            "Aman",
            "75"
          ],
          [
            "Neha",
            "92"
          ],
          [
            "Karan",
            "75"
          ],
          [
            "Pooja",
            "60"
          ],
          [
            "Vikas",
            "81"
          ]
        ]
      },
      "steps": [
        "Click E2",
        "Type =RANK.EQ(B2,$B$2:$B$7,1)",
        "Press Enter and fill down"
      ],
      "code": "=RANK.EQ(B2,$B$2:$B$7,1)",
      "result": "Riya 5, Aman 2, Neha 6, Karan 2, Pooja 1, Vikas 4",
      "explanation": "order = 1 ranks ascending: 60 is rank 1, both 75s rank 2, 81 rank 4, 88 rank 5, 92 rank 6."
    },
    {
      "title": "Unique rank without ties",
      "scenario": "The certificate printer needs unique ranks 1-6. Earlier entry wins a tie.",
      "table": {
        "headers": [
          "A: Student",
          "B: Marks"
        ],
        "rows": [
          [
            "Riya",
            "88"
          ],
          [
            "Aman",
            "75"
          ],
          [
            "Neha",
            "92"
          ],
          [
            "Karan",
            "75"
          ],
          [
            "Pooja",
            "60"
          ],
          [
            "Vikas",
            "81"
          ]
        ]
      },
      "steps": [
        "Click F2",
        "Type =RANK.EQ(B2,$B$2:$B$7)+COUNTIF($B$2:B2,B2)-1",
        "Press Enter and fill down to F7"
      ],
      "code": "=RANK.EQ(B2,$B$2:$B$7)+COUNTIF($B$2:B2,B2)-1",
      "result": "Riya 2, Aman 4, Neha 1, Karan 5, Pooja 6, Vikas 3",
      "explanation": "For Aman (row 3) COUNTIF($B$2:B3,75) = 1, so 4+1-1 = 4. For Karan (row 5) COUNTIF($B$2:B5,75) = 2, so 4+2-1 = 5."
    },
    {
      "title": "Rank within each region",
      "scenario": "Rank salespersons inside their own region by sales.",
      "table": {
        "headers": [
          "A: Region",
          "B: Sales (₹)"
        ],
        "rows": [
          [
            "North",
            "50000"
          ],
          [
            "South",
            "42000"
          ],
          [
            "North",
            "61000"
          ],
          [
            "South",
            "39000"
          ],
          [
            "North",
            "45000"
          ],
          [
            "South",
            "58000"
          ]
        ]
      },
      "steps": [
        "Click C2",
        "Type =COUNTIFS($A$2:$A$7,A2,$B$2:$B$7,\">\"&B2)+1",
        "Press Enter and fill down to C7"
      ],
      "code": "=COUNTIFS($A$2:$A$7,A2,$B$2:$B$7,\">\"&B2)+1",
      "result": "2, 2, 1, 3, 3, 1",
      "explanation": "North: 61000 = 1, 50000 = 2, 45000 = 3. South: 58000 = 1, 42000 = 2, 39000 = 3. Row 2: one North value (61000) is greater than 50000, so 1+1 = 2."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between RANK.EQ and RANK.AVG?",
      "a": "RANK.EQ gives tied values the same top rank (e.g. 4, 4). RANK.AVG gives them the average of their positions (4.5, 4.5).",
      "level": "Easy"
    },
    {
      "q": "What does the order argument do?",
      "a": "0 or omitted ranks descending (largest = 1). Any non-zero value (usually 1) ranks ascending (smallest = 1).",
      "level": "Easy"
    },
    {
      "q": "Why should the ref argument be absolute?",
      "a": "Because when the formula is copied down, a relative ref shifts and each row compares against a different range, giving wrong ranks. Use $B$2:$B$7.",
      "level": "Easy"
    },
    {
      "q": "How do you break ties to get unique ranks?",
      "a": "Add a running COUNTIF: =RANK.EQ(B2,$B$2:$B$7)+COUNTIF($B$2:B2,B2)-1. The second occurrence of a tied value gets the next rank.",
      "level": "Medium"
    },
    {
      "q": "How do you rank within categories?",
      "a": "Use COUNTIFS: =COUNTIFS(category_range,this_category,value_range,\">\"&this_value)+1.",
      "level": "Hard"
    },
    {
      "q": "Can RANK work on an array like FILTER(...)?",
      "a": "No. RANK/RANK.EQ need a range reference for ref. For arrays use COUNTIF-like logic with arrays, e.g. =SUM(--(array>value))+1, or XMATCH on a sorted array.",
      "level": "Hard"
    },
    {
      "q": "Is RANK still supported?",
      "a": "Yes, for backward compatibility, and it behaves like RANK.EQ. Microsoft recommends RANK.EQ or RANK.AVG for new work.",
      "level": "Easy"
    },
    {
      "q": "How do you show the name of the top ranked student?",
      "a": "=INDEX(A2:A7,MATCH(1,C2:C7,0)) where C has ranks, or =XLOOKUP(MAX(B2:B7),B2:B7,A2:A7).",
      "level": "Medium"
    }
  ],
  "practice": [
    {
      "task": "Sales of 5 executives are Raj 85000, Simran 92000, Tarun 78000, Uma 92000, Varun 66000 (A2:B6). Rank them highest = 1 with RANK.EQ.",
      "hint": "Lock the ref with $.",
      "solution": "=RANK.EQ(B2,$B$2:$B$6) gives Raj 3, Simran 1, Tarun 4, Uma 1, Varun 5."
    },
    {
      "task": "Using the same data, show RANK.AVG results.",
      "hint": "Simran and Uma share positions 1 and 2.",
      "solution": "=RANK.AVG(B2,$B$2:$B$6) gives Raj 3, Simran 1.5, Tarun 4, Uma 1.5, Varun 5."
    },
    {
      "task": "Delivery days for vendors: V1 5, V2 3, V3 7, V4 3, V5 4. Rank so that the fastest vendor is rank 1.",
      "hint": "Use order = 1.",
      "solution": "=RANK.EQ(B2,$B$2:$B$6,1) gives V1 4, V2 1, V3 5, V4 1, V5 3."
    },
    {
      "task": "Create unique ranks for the executives in task 1.",
      "hint": "Tie-breaker with COUNTIF.",
      "solution": "=RANK.EQ(B2,$B$2:$B$6)+COUNTIF($B$2:B2,B2)-1 gives Raj 3, Simran 1, Tarun 4, Uma 2, Varun 5."
    }
  ],
  "quiz": [
    {
      "question": "Marks {90, 80, 80, 70}: RANK.EQ for 70 (descending) is:",
      "options": [
        "3",
        "4",
        "2",
        "3.5"
      ],
      "answer": 1,
      "explanation": "90=1, 80=2, 80=2, 70=4."
    },
    {
      "question": "RANK.AVG for each 80 in {90, 80, 80, 70} is:",
      "options": [
        "2",
        "2.5",
        "3",
        "1.5"
      ],
      "answer": 1,
      "explanation": "Positions 2 and 3 average 2.5."
    },
    {
      "question": "=RANK.EQ(B2,$B$2:$B$10,1) ranks:",
      "options": [
        "Largest as 1",
        "Smallest as 1",
        "Alphabetically",
        "By date"
      ],
      "answer": 1,
      "explanation": "order = 1 is ascending."
    },
    {
      "question": "Which argument of RANK must be a range reference?",
      "options": [
        "number",
        "ref",
        "order",
        "None"
      ],
      "answer": 1,
      "explanation": "ref must be a reference to cells."
    },
    {
      "question": "Which function would you use to rank within a region?",
      "options": [
        "RANK",
        "COUNTIFS + 1",
        "VLOOKUP",
        "SUMIF"
      ],
      "answer": 1,
      "explanation": "Count higher values in the same region and add 1."
    }
  ]
};
