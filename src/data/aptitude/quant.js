// Quantitative Aptitude topics for placement preparation
export default [
  {
    "id": "number-system",
    "section": "Quantitative Aptitude",
    "title": "Number System & Divisibility",
    "icon": "🔢",
    "summary": "Learn types of numbers, divisibility rules, unit digits and remainders. These ideas are the base for almost every other quant topic.",
    "concepts": [
      {
        "heading": "Types of numbers",
        "content": "Natural numbers start from 1. Whole numbers start from 0. Integers include negative numbers too. A prime number has exactly two factors (1 and itself), for example 2, 3, 5, 7. 1 is neither prime nor composite."
      },
      {
        "heading": "Divisibility rules",
        "content": "By 2: last digit even. By 3: sum of digits divisible by 3. By 4: last two digits divisible by 4. By 5: last digit 0 or 5. By 8: last three digits divisible by 8. By 9: sum of digits divisible by 9. By 11: (sum of digits at odd places) minus (sum at even places) is 0 or a multiple of 11."
      },
      {
        "heading": "Unit digit and cyclicity",
        "content": "Unit digits of powers repeat in a cycle. For 2: 2, 4, 8, 6 (cycle of 4). For 3: 3, 9, 7, 1. For 7: 7, 9, 3, 1. For 8: 8, 4, 2, 6. Digits 0, 1, 5, 6 always stay the same. Divide the power by 4 and use the remainder (remainder 0 means the 4th value)."
      },
      {
        "heading": "Remainders",
        "content": "Dividend = Divisor x Quotient + Remainder. The remainder of a sum or product equals the remainder of the sum or product of the individual remainders."
      },
      {
        "heading": "Number of factors",
        "content": "Write the number as a product of primes, like 72 = 2^3 x 3^2. Then the number of factors = (3+1)(2+1) = 12."
      }
    ],
    "formulas": [
      "Dividend = Divisor x Quotient + Remainder",
      "Sum of first n natural numbers = n(n+1)/2",
      "Sum of squares of first n natural numbers = n(n+1)(2n+1)/6",
      "Sum of cubes of first n natural numbers = [n(n+1)/2]^2",
      "Sum of first n odd numbers = n^2",
      "If N = p^a x q^b x r^c, number of factors = (a+1)(b+1)(c+1)",
      "Trailing zeros in n! = [n/5] + [n/25] + [n/125] + ..."
    ],
    "shortcuts": [
      {
        "trick": "Unit digit of a power: divide the power by 4 and use the remainder to pick from the cycle.",
        "example": "Unit digit of 7^23: 23 ÷ 4 leaves 3. Cycle of 7 is 7, 9, 3, 1, so the 3rd value is 3."
      },
      {
        "trick": "Remainder by 9 (or 3) = remainder of the digit sum.",
        "example": "1234 ÷ 9: digit sum = 10, and 10 ÷ 9 leaves 1. So remainder = 1."
      },
      {
        "trick": "Trailing zeros of n!: keep dividing n by 5 and add the whole-number quotients.",
        "example": "100!: 100/5 = 20, 100/25 = 4, total = 24 zeros."
      },
      {
        "trick": "Count multiples of a OR b up to N: N/a + N/b - N/LCM(a,b) (whole-number parts only).",
        "example": "1 to 100 divisible by 2 or 3: 50 + 33 - 16 = 67."
      }
    ],
    "examples": [
      {
        "q": "Find the unit digit of 2^43.",
        "solution": "Step 1: Cycle of 2 is 2, 4, 8, 6 (length 4).\nStep 2: 43 ÷ 4 leaves remainder 3.\nStep 3: The 3rd value in the cycle is 8.\nAnswer: 8"
      },
      {
        "q": "How many factors does 360 have?",
        "solution": "Step 1: 360 = 2^3 x 3^2 x 5^1.\nStep 2: Number of factors = (3+1)(2+1)(1+1) = 4 x 3 x 2 = 24.\nAnswer: 24"
      },
      {
        "q": "Is 918082 divisible by 11?",
        "solution": "Step 1: Digits from left: 9, 1, 8, 0, 8, 2.\nStep 2: Sum at odd places = 9 + 8 + 8 = 25. Sum at even places = 1 + 0 + 2 = 3.\nStep 3: Difference = 25 - 3 = 22, which is a multiple of 11.\nAnswer: Yes, it is divisible by 11."
      },
      {
        "q": "Find the remainder when 17^23 is divided by 16.",
        "solution": "Step 1: 17 = 16 + 1, so 17 leaves remainder 1 when divided by 16.\nStep 2: So 17^23 leaves remainder 1^23 = 1.\nAnswer: 1"
      }
    ],
    "questions": [
      {
        "q": "Which of the following numbers is divisible by 9?",
        "options": [
          "4537",
          "4536",
          "4538",
          "4535"
        ],
        "answer": 1,
        "explanation": "Digit sum of 4536 = 4+5+3+6 = 18, which is divisible by 9. The other numbers have digit sums 19, 20 and 17.",
        "level": "Easy"
      },
      {
        "q": "What is the unit digit of 7^23?",
        "options": [
          "7",
          "9",
          "1",
          "3"
        ],
        "answer": 3,
        "explanation": "Cycle of 7 is 7, 9, 3, 1. 23 ÷ 4 leaves remainder 3, so the unit digit is the 3rd value = 3.",
        "level": "Easy"
      },
      {
        "q": "What is the sum of the first 20 natural numbers?",
        "options": [
          "210",
          "200",
          "220",
          "190"
        ],
        "answer": 0,
        "explanation": "Sum = n(n+1)/2 = 20 x 21 / 2 = 210.",
        "level": "Easy"
      },
      {
        "q": "What is the remainder when 1234 is divided by 9?",
        "options": [
          "0",
          "2",
          "1",
          "4"
        ],
        "answer": 2,
        "explanation": "Digit sum = 1+2+3+4 = 10. 10 ÷ 9 leaves remainder 1.",
        "level": "Easy"
      },
      {
        "q": "How many factors does 72 have?",
        "options": [
          "10",
          "8",
          "12",
          "9"
        ],
        "answer": 2,
        "explanation": "72 = 2^3 x 3^2. Number of factors = (3+1)(2+1) = 12.",
        "level": "Easy"
      },
      {
        "q": "What is the smallest number that must be added to 457 to make it divisible by 11?",
        "options": [
          "5",
          "6",
          "4",
          "3"
        ],
        "answer": 0,
        "explanation": "457 = 11 x 41 + 6. Remainder is 6, so add 11 - 6 = 5 to get 462 = 11 x 42.",
        "level": "Easy"
      },
      {
        "q": "What is the unit digit of 3^65 x 7^42?",
        "options": [
          "1",
          "3",
          "9",
          "7"
        ],
        "answer": 3,
        "explanation": "3^65: 65 ÷ 4 leaves 1, unit digit 3. 7^42: 42 ÷ 4 leaves 2, unit digit 9. 3 x 9 = 27, so the unit digit is 7.",
        "level": "Medium"
      },
      {
        "q": "A number when divided by 56 leaves a remainder of 29. What will be the remainder when the same number is divided by 8?",
        "options": [
          "3",
          "5",
          "1",
          "7"
        ],
        "answer": 1,
        "explanation": "56 is a multiple of 8, so the remainder is 29 ÷ 8, which leaves 5.",
        "level": "Medium"
      },
      {
        "q": "What is the sum of all two-digit numbers that are divisible by 7?",
        "options": [
          "728",
          "735",
          "700",
          "756"
        ],
        "answer": 0,
        "explanation": "Numbers are 14, 21, ..., 98. Count = 13. Sum = 13 x (14 + 98) / 2 = 728.",
        "level": "Medium"
      },
      {
        "q": "If the 4-digit number 5k32 is divisible by 9, where k is a single digit, what is the value of k?",
        "options": [
          "6",
          "7",
          "8",
          "9"
        ],
        "answer": 2,
        "explanation": "Digit sum = 5 + k + 3 + 2 = 10 + k. The only digit that makes this a multiple of 9 is k = 8 (sum 18).",
        "level": "Medium"
      },
      {
        "q": "How many numbers from 1 to 300 are divisible by 3 or 5?",
        "options": [
          "160",
          "140",
          "120",
          "150"
        ],
        "answer": 1,
        "explanation": "Divisible by 3: 100. By 5: 60. By both (15): 20. Total = 100 + 60 - 20 = 140.",
        "level": "Medium"
      },
      {
        "q": "What is the largest 4-digit number that is exactly divisible by 88?",
        "options": [
          "9988",
          "9900",
          "9856",
          "9944"
        ],
        "answer": 3,
        "explanation": "9999 ÷ 88 = 113 remainder 55. So the largest multiple is 9999 - 55 = 9944.",
        "level": "Medium"
      },
      {
        "q": "What is the remainder when 2^100 is divided by 7?",
        "options": [
          "1",
          "4",
          "3",
          "2"
        ],
        "answer": 3,
        "explanation": "2^3 = 8 leaves remainder 1 with 7. 2^100 = (2^3)^33 x 2, so remainder = 1 x 2 = 2.",
        "level": "Hard"
      },
      {
        "q": "How many zeros are there at the end of 100! (100 factorial)?",
        "options": [
          "20",
          "24",
          "25",
          "22"
        ],
        "answer": 1,
        "explanation": "Count factors of 5: 100/5 = 20 and 100/25 = 4. Total = 24.",
        "level": "Hard"
      },
      {
        "q": "What is the sum of all the factors of 120?",
        "options": [
          "360",
          "240",
          "336",
          "380"
        ],
        "answer": 0,
        "explanation": "120 = 2^3 x 3 x 5. Sum of factors = (1+2+4+8)(1+3)(1+5) = 15 x 4 x 6 = 360.",
        "level": "Hard"
      }
    ]
  },
  {
    "id": "hcf-lcm",
    "section": "Quantitative Aptitude",
    "title": "HCF & LCM",
    "icon": "🔗",
    "summary": "HCF is the largest number that divides given numbers; LCM is the smallest number that all of them divide. Used in problems on bells, tiles, tracks and remainders.",
    "concepts": [
      {
        "heading": "What is HCF?",
        "content": "HCF (Highest Common Factor) is the biggest number that divides all the given numbers exactly. Example: HCF of 12 and 18 is 6."
      },
      {
        "heading": "What is LCM?",
        "content": "LCM (Least Common Multiple) is the smallest number that is a multiple of all the given numbers. Example: LCM of 4 and 6 is 12."
      },
      {
        "heading": "Prime factorization method",
        "content": "Break each number into primes. HCF = product of common primes with the smallest powers. LCM = product of all primes with the highest powers."
      },
      {
        "heading": "When to use which",
        "content": "Words like \"largest\", \"greatest\", \"maximum size\" usually mean HCF. Words like \"least\", \"smallest\", \"together again\", \"next time\" usually mean LCM."
      }
    ],
    "formulas": [
      "HCF x LCM = Product of the two numbers",
      "HCF of fractions = HCF of numerators / LCM of denominators",
      "LCM of fractions = LCM of numerators / HCF of denominators",
      "Least number which leaves remainder r when divided by a, b, c = LCM(a, b, c) + r",
      "Greatest number that divides x, y, z leaving the same remainder = HCF(y - x, z - y, z - x)",
      "Greatest number that divides x and y leaving remainders r1 and r2 = HCF(x - r1, y - r2)"
    ],
    "shortcuts": [
      {
        "trick": "If you know HCF, LCM and one number, other number = HCF x LCM / given number.",
        "example": "HCF = 8, LCM = 48, one number = 16. Other = 8 x 48 / 16 = 24."
      },
      {
        "trick": "Numbers in ratio a:b with HCF h: numbers are ah and bh, and LCM = a x b x h (if a, b are co-prime).",
        "example": "Ratio 3:4, LCM 180: 12h = 180, h = 15, numbers are 45 and 60."
      },
      {
        "trick": "Same remainder problems: take the differences of numbers and find their HCF.",
        "example": "43, 91, 183: differences 48, 92, 140. HCF = 4."
      }
    ],
    "examples": [
      {
        "q": "Find the HCF and LCM of 72 and 120.",
        "solution": "Step 1: 72 = 2^3 x 3^2 and 120 = 2^3 x 3 x 5.\nStep 2: HCF = 2^3 x 3 = 24.\nStep 3: LCM = 2^3 x 3^2 x 5 = 360.\nCheck: 24 x 360 = 8640 = 72 x 120.\nAnswer: HCF 24, LCM 360"
      },
      {
        "q": "Find the least number which when divided by 8, 12 and 18 leaves remainder 5 in each case.",
        "solution": "Step 1: LCM(8, 12, 18) = 72.\nStep 2: Required number = 72 + 5 = 77.\nAnswer: 77"
      },
      {
        "q": "Find the greatest number that divides 245 and 1029 leaving remainder 5 in each case.",
        "solution": "Step 1: Subtract the remainder: 245 - 5 = 240 and 1029 - 5 = 1024.\nStep 2: HCF(240, 1024) = 16.\nAnswer: 16"
      },
      {
        "q": "Three bells ring at intervals of 6, 8 and 12 minutes. They ring together at 9:00 AM. When will they next ring together?",
        "solution": "Step 1: LCM(6, 8, 12) = 24 minutes.\nStep 2: 9:00 AM + 24 minutes = 9:24 AM.\nAnswer: 9:24 AM"
      }
    ],
    "questions": [
      {
        "q": "What is the HCF of 36 and 84?",
        "options": [
          "12",
          "6",
          "18",
          "4"
        ],
        "answer": 0,
        "explanation": "36 = 2^2 x 3^2, 84 = 2^2 x 3 x 7. HCF = 2^2 x 3 = 12.",
        "level": "Easy"
      },
      {
        "q": "What is the LCM of 12, 15 and 20?",
        "options": [
          "120",
          "180",
          "60",
          "30"
        ],
        "answer": 2,
        "explanation": "12 = 2^2 x 3, 15 = 3 x 5, 20 = 2^2 x 5. LCM = 2^2 x 3 x 5 = 60.",
        "level": "Easy"
      },
      {
        "q": "The HCF of two numbers is 8 and their LCM is 48. If one number is 16, what is the other number?",
        "options": [
          "32",
          "12",
          "24",
          "40"
        ],
        "answer": 2,
        "explanation": "Other number = HCF x LCM / 16 = 8 x 48 / 16 = 24.",
        "level": "Easy"
      },
      {
        "q": "Three bells ring at intervals of 6, 8 and 12 minutes. If they ring together at 9:00 AM, when will they next ring together?",
        "options": [
          "9:24 AM",
          "9:48 AM",
          "9:12 AM",
          "10:00 AM"
        ],
        "answer": 0,
        "explanation": "LCM(6, 8, 12) = 24 minutes. So they ring together again at 9:24 AM.",
        "level": "Easy"
      },
      {
        "q": "What is the largest number that divides 24, 36 and 60 exactly?",
        "options": [
          "6",
          "24",
          "18",
          "12"
        ],
        "answer": 3,
        "explanation": "HCF(24, 36, 60) = 12.",
        "level": "Easy"
      },
      {
        "q": "What is the smallest number that is exactly divisible by 4, 6 and 9?",
        "options": [
          "72",
          "36",
          "18",
          "54"
        ],
        "answer": 1,
        "explanation": "LCM(4, 6, 9) = 36.",
        "level": "Easy"
      },
      {
        "q": "What is the least number which when divided by 6, 9 and 15 leaves remainder 4 in each case?",
        "options": [
          "94",
          "90",
          "184",
          "49"
        ],
        "answer": 0,
        "explanation": "LCM(6, 9, 15) = 90. Required number = 90 + 4 = 94.",
        "level": "Medium"
      },
      {
        "q": "What is the greatest number that divides 43, 91 and 183 leaving the same remainder in each case?",
        "options": [
          "8",
          "2",
          "4",
          "12"
        ],
        "answer": 2,
        "explanation": "Differences: 91 - 43 = 48, 183 - 91 = 92, 183 - 43 = 140. HCF(48, 92, 140) = 4.",
        "level": "Medium"
      },
      {
        "q": "What is the greatest number that divides 1657 and 2037 leaving remainders 6 and 5 respectively?",
        "options": [
          "123",
          "127",
          "235",
          "305"
        ],
        "answer": 1,
        "explanation": "1657 - 6 = 1651 and 2037 - 5 = 2032. HCF(1651, 2032) = 127.",
        "level": "Medium"
      },
      {
        "q": "What is the HCF of the fractions 2/3, 8/9 and 16/81?",
        "options": [
          "2/3",
          "16/81",
          "8/27",
          "2/81"
        ],
        "answer": 3,
        "explanation": "HCF of fractions = HCF(2, 8, 16) / LCM(3, 9, 81) = 2/81.",
        "level": "Medium"
      },
      {
        "q": "Two numbers are in the ratio 3:4 and their LCM is 180. What is the sum of the two numbers?",
        "options": [
          "84",
          "120",
          "140",
          "105"
        ],
        "answer": 3,
        "explanation": "Let the numbers be 3x and 4x. LCM = 12x = 180, so x = 15. Numbers are 45 and 60. Sum = 105.",
        "level": "Medium"
      },
      {
        "q": "Three runners take 30, 45 and 60 seconds to complete one round of a circular track. If they start together from the starting point, after how much time will they meet again at the starting point?",
        "options": [
          "2 minutes",
          "3 minutes",
          "90 seconds",
          "4 minutes"
        ],
        "answer": 1,
        "explanation": "LCM(30, 45, 60) = 180 seconds = 3 minutes.",
        "level": "Medium"
      },
      {
        "q": "What is the least 4-digit number which when divided by 12, 15 and 20 leaves remainder 7 in each case?",
        "options": [
          "1027",
          "1007",
          "1087",
          "967"
        ],
        "answer": 0,
        "explanation": "LCM(12, 15, 20) = 60. The smallest 4-digit multiple of 60 is 1020. Required number = 1020 + 7 = 1027.",
        "level": "Hard"
      },
      {
        "q": "The product of two numbers is 2160 and their HCF is 12. How many such pairs of numbers are possible?",
        "options": [
          "1",
          "2",
          "3",
          "4"
        ],
        "answer": 1,
        "explanation": "Let numbers be 12a and 12b with a, b co-prime. 144ab = 2160, so ab = 15. Co-prime pairs: (1, 15) and (3, 5). So 2 pairs.",
        "level": "Hard"
      },
      {
        "q": "A floor 15.17 m long and 9.02 m wide is to be covered with square tiles of the same size. What is the least number of tiles needed?",
        "options": [
          "714",
          "902",
          "1517",
          "814"
        ],
        "answer": 3,
        "explanation": "Largest tile side = HCF(1517 cm, 902 cm) = 41 cm. Tiles = (1517/41) x (902/41) = 37 x 22 = 814.",
        "level": "Hard"
      }
    ]
  },
  {
    "id": "percentages",
    "section": "Quantitative Aptitude",
    "title": "Percentages",
    "icon": "💯",
    "summary": "Percent means \"out of 100\". This topic is used everywhere: marks, salary, population, profit and data interpretation.",
    "concepts": [
      {
        "heading": "Meaning of percent",
        "content": "x% means x out of 100, i.e. x/100. So 25% = 25/100 = 1/4."
      },
      {
        "heading": "Percentage change",
        "content": "Percentage increase or decrease is always calculated on the original (old) value: change / original x 100."
      },
      {
        "heading": "Successive changes",
        "content": "When a value changes by a% and then by b%, the net change is not a + b. Use a + b + ab/100 (use negative sign for decrease)."
      },
      {
        "heading": "Comparing two quantities",
        "content": "If A is r% more than B, then B is not r% less than A. B is r/(100 + r) x 100 % less than A, because the base changes."
      },
      {
        "heading": "Fraction equivalents",
        "content": "Learn: 50% = 1/2, 25% = 1/4, 20% = 1/5, 12.5% = 1/8, 33.33% = 1/3, 16.67% = 1/6, 10% = 1/10. These make calculations very fast."
      }
    ],
    "formulas": [
      "x% of y = x * y / 100",
      "Percentage change = (New - Old) / Old x 100",
      "Net change for successive changes a% and b% = a + b + ab/100",
      "If A is r% more than B, B is less than A by [r / (100 + r)] x 100 %",
      "If A is r% less than B, B is more than A by [r / (100 - r)] x 100 %",
      "Population after n years = P(1 + r/100)^n",
      "If price rises by r%, cut in consumption to keep expense same = [r / (100 + r)] x 100 %"
    ],
    "shortcuts": [
      {
        "trick": "x% of y = y% of x. Pick the easier one.",
        "example": "16% of 25 = 25% of 16 = 4."
      },
      {
        "trick": "Use fractions instead of percentages.",
        "example": "12.5% of 640 = 640/8 = 80."
      },
      {
        "trick": "Successive change formula a + b + ab/100.",
        "example": "+20% then -20%: 20 - 20 - 400/100 = -4, i.e. 4% decrease."
      },
      {
        "trick": "Reverse percentage: if after r% increase value is V, original = V x 100/(100 + r).",
        "example": "After 25% increase price is ₹500. Original = 500 x 100/125 = ₹400."
      }
    ],
    "examples": [
      {
        "q": "The price of a phone rises from ₹12,000 to ₹15,000. Find the percentage increase.",
        "solution": "Step 1: Increase = 15000 - 12000 = 3000.\nStep 2: % increase = 3000/12000 x 100 = 25%.\nAnswer: 25%"
      },
      {
        "q": "A's salary is 25% more than B's. By what percent is B's salary less than A's?",
        "solution": "Step 1: Let B = 100, then A = 125.\nStep 2: B is less by 25 on a base of 125.\nStep 3: 25/125 x 100 = 20%.\nAnswer: 20%"
      },
      {
        "q": "The population of a town is 20,000. It grows by 10% every year. What will it be after 2 years?",
        "solution": "Step 1: Population = 20000 x (1.1)^2.\nStep 2: = 20000 x 1.21 = 24,200.\nAnswer: 24,200"
      },
      {
        "q": "A student must get 40% marks to pass. He gets 178 marks and fails by 22 marks. Find the maximum marks.",
        "solution": "Step 1: Pass marks = 178 + 22 = 200.\nStep 2: 40% of maximum = 200, so maximum = 200 x 100/40 = 500.\nAnswer: 500"
      }
    ],
    "questions": [
      {
        "q": "What is 25% of 480?",
        "options": [
          "100",
          "125",
          "120",
          "96"
        ],
        "answer": 2,
        "explanation": "25% = 1/4. 480/4 = 120.",
        "level": "Easy"
      },
      {
        "q": "What percent of 80 is 20?",
        "options": [
          "25%",
          "20%",
          "40%",
          "15%"
        ],
        "answer": 0,
        "explanation": "20/80 x 100 = 25%.",
        "level": "Easy"
      },
      {
        "q": "The price of an item increases from ₹50 to ₹60. What is the percentage increase?",
        "options": [
          "10%",
          "16.67%",
          "25%",
          "20%"
        ],
        "answer": 3,
        "explanation": "Increase = 10. 10/50 x 100 = 20%.",
        "level": "Easy"
      },
      {
        "q": "A student scores 360 marks out of 450. What is his percentage?",
        "options": [
          "75%",
          "80%",
          "85%",
          "72%"
        ],
        "answer": 1,
        "explanation": "360/450 x 100 = 80%.",
        "level": "Easy"
      },
      {
        "q": "If 40% of a number is 72, what is the number?",
        "options": [
          "180",
          "160",
          "200",
          "172"
        ],
        "answer": 0,
        "explanation": "Number = 72 x 100/40 = 180.",
        "level": "Easy"
      },
      {
        "q": "If 15% of x is 45, what is 30% of x?",
        "options": [
          "60",
          "75",
          "90",
          "135"
        ],
        "answer": 2,
        "explanation": "30% is double of 15%, so 30% of x = 2 x 45 = 90.",
        "level": "Easy"
      },
      {
        "q": "A salary is first increased by 20% and then decreased by 20%. What is the net change?",
        "options": [
          "No change",
          "4% decrease",
          "4% increase",
          "2% decrease"
        ],
        "answer": 1,
        "explanation": "Net change = 20 - 20 - (20 x 20)/100 = -4%, i.e. a 4% decrease.",
        "level": "Medium"
      },
      {
        "q": "A's salary is 25% more than B's salary. By what percent is B's salary less than A's?",
        "options": [
          "25%",
          "30%",
          "15%",
          "20%"
        ],
        "answer": 3,
        "explanation": "B is less by 25/(100 + 25) x 100 = 20%.",
        "level": "Medium"
      },
      {
        "q": "The population of a town is 10,000. It increases by 10% every year. What will the population be after 2 years?",
        "options": [
          "12,000",
          "12,210",
          "11,000",
          "12,100"
        ],
        "answer": 3,
        "explanation": "10000 x 1.1 x 1.1 = 12,100.",
        "level": "Medium"
      },
      {
        "q": "The price of sugar rises by 25%. By what percent should a family reduce its consumption so that its expenditure on sugar does not change?",
        "options": [
          "25%",
          "20%",
          "15%",
          "22.5%"
        ],
        "answer": 1,
        "explanation": "Reduction = 25/(100 + 25) x 100 = 20%.",
        "level": "Medium"
      },
      {
        "q": "In an election between two candidates, one candidate got 35% of the votes and lost by 450 votes. What was the total number of votes? (All votes were valid.)",
        "options": [
          "1500",
          "1200",
          "1800",
          "1350"
        ],
        "answer": 0,
        "explanation": "Winner got 65%. Difference = 65% - 35% = 30% of total = 450. Total = 450 x 100/30 = 1500.",
        "level": "Medium"
      },
      {
        "q": "In an exam, 60% of students passed in English, 70% passed in Maths and 20% failed in both. What percent passed in both subjects?",
        "options": [
          "40%",
          "50%",
          "30%",
          "60%"
        ],
        "answer": 1,
        "explanation": "Failed in English = 40%, failed in Maths = 30%. Failed in at least one = 40 + 30 - 20 = 50%. Passed in both = 100 - 50 = 50%.",
        "level": "Medium"
      },
      {
        "q": "A student needs 40% marks to pass. He gets 178 marks and fails by 22 marks. What are the maximum marks?",
        "options": [
          "450",
          "400",
          "550",
          "500"
        ],
        "answer": 3,
        "explanation": "Pass marks = 178 + 22 = 200 = 40% of maximum. Maximum = 200 x 100/40 = 500.",
        "level": "Hard"
      },
      {
        "q": "The length of a rectangle is increased by 20% and its breadth is decreased by 10%. What is the percentage change in its area?",
        "options": [
          "8% increase",
          "10% increase",
          "8% decrease",
          "2% increase"
        ],
        "answer": 0,
        "explanation": "Net change = 20 - 10 - (20 x 10)/100 = 8%. Area increases by 8%.",
        "level": "Hard"
      },
      {
        "q": "A person spends 30% of his salary on rent and 20% of the remaining amount on food. He is left with ₹16,800. What is his salary?",
        "options": [
          "₹28,000",
          "₹32,000",
          "₹30,000",
          "₹24,000"
        ],
        "answer": 2,
        "explanation": "After rent: 70% left. After food: 80% of 70% = 56% left. 56% of salary = 16800, so salary = 16800/0.56 = ₹30,000.",
        "level": "Hard"
      }
    ]
  },
  {
    "id": "profit-loss-discount",
    "section": "Quantitative Aptitude",
    "title": "Profit, Loss & Discount",
    "icon": "🏷️",
    "summary": "Learn how cost price, selling price, marked price and discounts are connected. Profit and loss percent is always calculated on cost price.",
    "concepts": [
      {
        "heading": "Basic terms",
        "content": "Cost Price (CP) is the price at which you buy. Selling Price (SP) is the price at which you sell. If SP > CP you make a profit; if SP < CP you make a loss."
      },
      {
        "heading": "Profit and loss percent",
        "content": "Profit % and Loss % are always calculated on the Cost Price, not on the Selling Price (unless the question says so)."
      },
      {
        "heading": "Marked price and discount",
        "content": "Marked Price (MP) is the price written on the tag. Discount is given on the Marked Price. SP = MP - Discount."
      },
      {
        "heading": "Dishonest dealer",
        "content": "If a shopkeeper uses a false weight (gives less quantity) but charges for the full quantity, he gains extra. Gain % = (error / true weight given) x 100."
      }
    ],
    "formulas": [
      "Profit = SP - CP;  Loss = CP - SP",
      "Profit % = Profit / CP x 100",
      "SP = CP x (100 + Profit%) / 100;  SP = CP x (100 - Loss%) / 100",
      "Discount = MP - SP;  Discount % = Discount / MP x 100",
      "Single discount equal to successive discounts a% and b% = a + b - ab/100",
      "Two items sold at same SP, one at x% profit and other at x% loss: overall loss % = x^2/100",
      "False weight gain % = (True weight - False weight) / False weight x 100"
    ],
    "shortcuts": [
      {
        "trick": "Use multiplying factors: 20% profit = x1.2, 10% discount = x0.9.",
        "example": "CP ₹500, marked 40% up, 15% discount: SP = 500 x 1.4 x 0.85 = ₹595."
      },
      {
        "trick": "Cost of A items = SP of B items: profit % = (A - B)/B x 100.",
        "example": "CP of 10 pens = SP of 8 pens: profit = 2/8 x 100 = 25%."
      },
      {
        "trick": "Same SP with x% profit and x% loss always gives a loss of x^2/100 %.",
        "example": "Profit 10% and loss 10%: loss = 100/100 = 1%."
      },
      {
        "trick": "Buy n get m free: discount % = m/(n + m) x 100.",
        "example": "Buy 3 get 1 free: 1/4 x 100 = 25% discount."
      }
    ],
    "examples": [
      {
        "q": "A man buys a watch for ₹800 and sells it for ₹1,000. Find his profit percent.",
        "solution": "Step 1: Profit = 1000 - 800 = 200.\nStep 2: Profit % = 200/800 x 100 = 25%.\nAnswer: 25%"
      },
      {
        "q": "The marked price of a shirt is ₹1,500. Two successive discounts of 20% and 10% are given. Find the selling price.",
        "solution": "Step 1: After 20% off: 1500 x 0.8 = 1200.\nStep 2: After 10% off: 1200 x 0.9 = 1080.\nAnswer: ₹1,080 (equivalent single discount = 28%)"
      },
      {
        "q": "By selling an article for ₹720, a shopkeeper loses 10%. At what price should he sell it to gain 15%?",
        "solution": "Step 1: CP = 720 x 100/90 = 800.\nStep 2: SP for 15% gain = 800 x 1.15 = 920.\nAnswer: ₹920"
      },
      {
        "q": "A dealer sells goods at cost price but uses a 900 g weight instead of 1 kg. Find his gain percent.",
        "solution": "Step 1: He gives 900 g but charges for 1000 g.\nStep 2: Gain % = (1000 - 900)/900 x 100 = 11.11%.\nAnswer: 11.11% (11 1/9 %)"
      }
    ],
    "questions": [
      {
        "q": "An article is bought for ₹400 and sold for ₹500. What is the profit percent?",
        "options": [
          "20%",
          "30%",
          "100%",
          "25%"
        ],
        "answer": 3,
        "explanation": "Profit = 100. Profit % = 100/400 x 100 = 25%.",
        "level": "Easy"
      },
      {
        "q": "An article costs ₹800 and is sold at a loss of 15%. What is the selling price?",
        "options": [
          "₹700",
          "₹680",
          "₹920",
          "₹650"
        ],
        "answer": 1,
        "explanation": "SP = 800 x 85/100 = ₹680.",
        "level": "Easy"
      },
      {
        "q": "The marked price of a bag is ₹1,200. A discount of 10% is given. What is the selling price?",
        "options": [
          "₹1,080",
          "₹1,100",
          "₹1,020",
          "₹1,120"
        ],
        "answer": 0,
        "explanation": "SP = 1200 x 0.9 = ₹1,080.",
        "level": "Easy"
      },
      {
        "q": "By selling an article for ₹990, a man gains 10%. What is the cost price?",
        "options": [
          "₹891",
          "₹1,000",
          "₹900",
          "₹880"
        ],
        "answer": 2,
        "explanation": "CP = 990 x 100/110 = ₹900.",
        "level": "Easy"
      },
      {
        "q": "The cost price of 10 pens is equal to the selling price of 8 pens. What is the profit percent?",
        "options": [
          "20%",
          "25%",
          "10%",
          "30%"
        ],
        "answer": 1,
        "explanation": "Profit % = (10 - 8)/8 x 100 = 25%.",
        "level": "Easy"
      },
      {
        "q": "An article is sold for ₹540 at a loss of 10%. What is its cost price?",
        "options": [
          "₹594",
          "₹580",
          "₹620",
          "₹600"
        ],
        "answer": 3,
        "explanation": "CP = 540 x 100/90 = ₹600.",
        "level": "Easy"
      },
      {
        "q": "What single discount is equal to two successive discounts of 20% and 10%?",
        "options": [
          "30%",
          "32%",
          "25%",
          "28%"
        ],
        "answer": 3,
        "explanation": "Single discount = 20 + 10 - (20 x 10)/100 = 28%.",
        "level": "Medium"
      },
      {
        "q": "Two articles are sold for ₹990 each. On one there is a 10% profit and on the other a 10% loss. What is the overall result?",
        "options": [
          "No profit, no loss",
          "1% loss",
          "1% profit",
          "2% loss"
        ],
        "answer": 1,
        "explanation": "Same SP with equal profit and loss % always gives a loss of 10^2/100 = 1%.",
        "level": "Medium"
      },
      {
        "q": "A shopkeeper marks his goods 40% above cost price and then gives a 15% discount. What is his profit percent?",
        "options": [
          "19%",
          "25%",
          "21%",
          "15%"
        ],
        "answer": 0,
        "explanation": "SP = CP x 1.4 x 0.85 = 1.19 CP. Profit = 19%.",
        "level": "Medium"
      },
      {
        "q": "A dishonest dealer sells goods at cost price but uses a weight of 900 g instead of 1 kg. What is his gain percent?",
        "options": [
          "10%",
          "11.11%",
          "9.09%",
          "12.5%"
        ],
        "answer": 1,
        "explanation": "Gain % = (1000 - 900)/900 x 100 = 11.11%.",
        "level": "Medium"
      },
      {
        "q": "By selling an article for ₹720, a man loses 10%. At what price should he sell it to gain 15%?",
        "options": [
          "₹900",
          "₹828",
          "₹940",
          "₹920"
        ],
        "answer": 3,
        "explanation": "CP = 720/0.9 = 800. SP for 15% gain = 800 x 1.15 = ₹920.",
        "level": "Medium"
      },
      {
        "q": "A shop offers \"Buy 3, Get 1 Free\". What is the effective discount percent?",
        "options": [
          "25%",
          "33.33%",
          "20%",
          "30%"
        ],
        "answer": 0,
        "explanation": "You pay for 3 items and get 4. Discount = 1/4 x 100 = 25%.",
        "level": "Medium"
      },
      {
        "q": "An article costs ₹500. At what price should it be marked so that after giving a 20% discount, the shopkeeper still makes a 20% profit?",
        "options": [
          "₹720",
          "₹700",
          "₹750",
          "₹800"
        ],
        "answer": 2,
        "explanation": "Required SP = 500 x 1.2 = 600. MP x 0.8 = 600, so MP = ₹750.",
        "level": "Hard"
      },
      {
        "q": "A man buys oranges at 6 for ₹5 and sells them at 5 for ₹6. What is his gain percent?",
        "options": [
          "20%",
          "36%",
          "44%",
          "40%"
        ],
        "answer": 2,
        "explanation": "CP of 1 orange = 5/6, SP of 1 orange = 6/5. Gain % = (6/5 ÷ 5/6 - 1) x 100 = (36/25 - 1) x 100 = 44%.",
        "level": "Hard"
      },
      {
        "q": "A trader marks his goods 25% above cost price and gives a 12% discount. He also uses an 800 g weight in place of 1 kg. What is his overall profit percent?",
        "options": [
          "37.5%",
          "10%",
          "32.5%",
          "40%"
        ],
        "answer": 0,
        "explanation": "SP for \"1 kg\" = 1.25 x 0.88 = 1.1 times the CP of 1 kg. But he gives only 800 g, which costs 0.8 times. Profit % = (1.1/0.8 - 1) x 100 = 37.5%.",
        "level": "Hard"
      }
    ]
  },
  {
    "id": "simple-compound-interest",
    "section": "Quantitative Aptitude",
    "title": "Simple & Compound Interest",
    "icon": "🏦",
    "summary": "Simple interest is charged only on the principal; compound interest is charged on principal plus earlier interest. Placement tests often ask for the difference between them.",
    "concepts": [
      {
        "heading": "Simple Interest (SI)",
        "content": "Interest is the same every year because it is always calculated on the original amount (principal). SI = P x R x T / 100."
      },
      {
        "heading": "Compound Interest (CI)",
        "content": "Interest of each year is added to the principal, and next year interest is calculated on this new amount. So CI grows faster than SI."
      },
      {
        "heading": "Compounding periods",
        "content": "If interest is compounded half-yearly, use rate R/2 and time 2T. If quarterly, use R/4 and 4T."
      },
      {
        "heading": "CI vs SI",
        "content": "For 1 year (compounded yearly), CI = SI. From the 2nd year onwards CI is more, because you also earn interest on interest."
      }
    ],
    "formulas": [
      "SI = P x R x T / 100",
      "Amount (A) = P + SI",
      "Compound amount A = P (1 + R/100)^T",
      "CI = A - P",
      "Half-yearly compounding: A = P (1 + R/200)^(2T)",
      "CI - SI for 2 years = P (R/100)^2",
      "CI - SI for 3 years = P (R/100)^2 (3 + R/100)",
      "If a sum becomes n times in T years at SI, R = (n - 1) x 100 / T"
    ],
    "shortcuts": [
      {
        "trick": "Use the CI - SI shortcut for 2 years: P x (R/100)^2.",
        "example": "P = ₹5000, R = 10%: difference = 5000 x 0.01 = ₹50."
      },
      {
        "trick": "At CI, if money doubles in T years, it becomes 4 times in 2T years and 8 times in 3T years.",
        "example": "Doubles in 5 years, so 8 times in 15 years."
      },
      {
        "trick": "For 2-year CI, the effective rate = 2R + R^2/100.",
        "example": "10% for 2 years: 20 + 1 = 21%. CI on ₹10,000 = ₹2,100."
      },
      {
        "trick": "SI given for two different times: interest per year = difference of amounts / difference of years.",
        "example": "₹1120 in 2 years, ₹1240 in 4 years: SI per year = 120/2 = 60, P = 1120 - 120 = ₹1000."
      }
    ],
    "examples": [
      {
        "q": "Find the simple interest on ₹6,000 at 9% per annum for 4 years.",
        "solution": "Step 1: SI = 6000 x 9 x 4 / 100.\nStep 2: = 2160.\nAnswer: ₹2,160"
      },
      {
        "q": "Find the compound interest on ₹10,000 at 10% per annum for 2 years, compounded annually.",
        "solution": "Step 1: A = 10000 x (1.1)^2 = 12100.\nStep 2: CI = 12100 - 10000 = 2100.\nAnswer: ₹2,100"
      },
      {
        "q": "The difference between CI and SI on a sum for 2 years at 5% is ₹25. Find the sum.",
        "solution": "Step 1: Difference = P (R/100)^2 = P x 0.0025.\nStep 2: P x 0.0025 = 25, so P = 10000.\nAnswer: ₹10,000"
      },
      {
        "q": "At what rate of simple interest will a sum double itself in 8 years?",
        "solution": "Step 1: Interest = P (it doubles), so P = P x R x 8/100.\nStep 2: R = 100/8 = 12.5%.\nAnswer: 12.5%"
      }
    ],
    "questions": [
      {
        "q": "What is the simple interest on ₹5,000 at 8% per annum for 3 years?",
        "options": [
          "₹1,200",
          "₹1,000",
          "₹1,500",
          "₹1,250"
        ],
        "answer": 0,
        "explanation": "SI = 5000 x 8 x 3/100 = ₹1,200.",
        "level": "Easy"
      },
      {
        "q": "What will ₹2,000 amount to in 4 years at 5% per annum simple interest?",
        "options": [
          "₹2,500",
          "₹2,200",
          "₹2,400",
          "₹2,431"
        ],
        "answer": 2,
        "explanation": "SI = 2000 x 5 x 4/100 = 400. Amount = 2000 + 400 = ₹2,400.",
        "level": "Easy"
      },
      {
        "q": "At what rate of simple interest will ₹1,200 earn ₹360 in 3 years?",
        "options": [
          "12%",
          "10%",
          "9%",
          "8%"
        ],
        "answer": 1,
        "explanation": "R = 360 x 100/(1200 x 3) = 10%.",
        "level": "Easy"
      },
      {
        "q": "What is the compound interest on ₹10,000 at 10% per annum for 2 years, compounded annually?",
        "options": [
          "₹2,000",
          "₹2,200",
          "₹1,100",
          "₹2,100"
        ],
        "answer": 3,
        "explanation": "A = 10000 x 1.1 x 1.1 = 12100. CI = ₹2,100.",
        "level": "Easy"
      },
      {
        "q": "A sum of money doubles itself in 8 years at simple interest. What is the rate of interest?",
        "options": [
          "10%",
          "8%",
          "15%",
          "12.5%"
        ],
        "answer": 3,
        "explanation": "Interest = P in 8 years. R = 100/8 = 12.5%.",
        "level": "Easy"
      },
      {
        "q": "In how many years will ₹800 earn ₹240 as simple interest at 6% per annum?",
        "options": [
          "4 years",
          "5 years",
          "6 years",
          "3 years"
        ],
        "answer": 1,
        "explanation": "T = 240 x 100/(800 x 6) = 5 years.",
        "level": "Easy"
      },
      {
        "q": "What is the difference between compound interest and simple interest on ₹5,000 for 2 years at 10% per annum?",
        "options": [
          "₹50",
          "₹100",
          "₹25",
          "₹55"
        ],
        "answer": 0,
        "explanation": "Difference = P (R/100)^2 = 5000 x 0.01 = ₹50.",
        "level": "Medium"
      },
      {
        "q": "What is the amount on ₹8,000 for 1 year at 10% per annum, compounded half-yearly?",
        "options": [
          "₹8,800",
          "₹8,820",
          "₹8,840",
          "₹8,410"
        ],
        "answer": 1,
        "explanation": "Rate per half-year = 5%, periods = 2. A = 8000 x 1.05 x 1.05 = ₹8,820.",
        "level": "Medium"
      },
      {
        "q": "A sum becomes ₹1,352 in 2 years at 4% per annum compound interest. What is the sum?",
        "options": [
          "₹1,200",
          "₹1,300",
          "₹1,280",
          "₹1,250"
        ],
        "answer": 3,
        "explanation": "P = 1352/(1.04)^2 = 1352/1.0816 = ₹1,250.",
        "level": "Medium"
      },
      {
        "q": "A sum at simple interest amounts to ₹1,120 in 2 years and to ₹1,240 in 4 years. What is the sum?",
        "options": [
          "₹1,000",
          "₹960",
          "₹1,040",
          "₹1,060"
        ],
        "answer": 0,
        "explanation": "Interest for 2 years = 1240 - 1120 = 120, so 60 per year. P = 1120 - 120 = ₹1,000.",
        "level": "Medium"
      },
      {
        "q": "A sum of money becomes three times itself in 10 years at simple interest. What is the rate of interest?",
        "options": [
          "30%",
          "15%",
          "20%",
          "25%"
        ],
        "answer": 2,
        "explanation": "Interest = 2P in 10 years. R = 2 x 100/10 = 20%.",
        "level": "Medium"
      },
      {
        "q": "What is the compound interest on ₹15,625 for 3 years at 8% per annum, compounded annually?",
        "options": [
          "₹3,750",
          "₹4,000",
          "₹4,058",
          "₹4,158"
        ],
        "answer": 2,
        "explanation": "A = 15625 x (1.08)^3 = 19683. CI = 19683 - 15625 = ₹4,058.",
        "level": "Medium"
      },
      {
        "q": "The difference between compound interest and simple interest on a sum for 3 years at 10% per annum is ₹31. What is the sum?",
        "options": [
          "₹1,000",
          "₹1,100",
          "₹3,100",
          "₹1,500"
        ],
        "answer": 0,
        "explanation": "Difference = P (R/100)^2 (3 + R/100) = P x 0.01 x 3.1 = 0.031P. 0.031P = 31, so P = ₹1,000.",
        "level": "Hard"
      },
      {
        "q": "A sum of money doubles itself in 5 years at compound interest. In how many years will it become 8 times?",
        "options": [
          "20 years",
          "40 years",
          "10 years",
          "15 years"
        ],
        "answer": 3,
        "explanation": "2 times in 5 years, 4 times in 10 years, 8 times in 15 years.",
        "level": "Hard"
      },
      {
        "q": "₹12,000 is divided into two parts. One part is lent at 10% and the other at 12% simple interest per annum. The total yearly interest is ₹1,340. How much was lent at 10%?",
        "options": [
          "₹7,000",
          "₹5,000",
          "₹6,000",
          "₹4,000"
        ],
        "answer": 1,
        "explanation": "Let x be at 10%. 0.10x + 0.12(12000 - x) = 1340, so 1440 - 0.02x = 1340, x = ₹5,000.",
        "level": "Hard"
      }
    ]
  },
  {
    "id": "ratio-proportion-partnership",
    "section": "Quantitative Aptitude",
    "title": "Ratio, Proportion & Partnership",
    "icon": "⚖️",
    "summary": "A ratio compares two quantities; a proportion says two ratios are equal. In partnership, profit is shared in the ratio of capital x time.",
    "concepts": [
      {
        "heading": "Ratio",
        "content": "The ratio a:b means a/b. Multiplying or dividing both terms by the same number does not change the ratio. 4:6 = 2:3."
      },
      {
        "heading": "Proportion",
        "content": "If a:b = c:d, then a, b, c, d are in proportion and a x d = b x c (product of extremes = product of means)."
      },
      {
        "heading": "Combining ratios",
        "content": "To combine A:B and B:C, make the common term B equal. Example: A:B = 2:3 and B:C = 4:5. Make B = 12: A:B = 8:12, B:C = 12:15, so A:B:C = 8:12:15."
      },
      {
        "heading": "Partnership",
        "content": "When partners invest money for different periods, profit is divided in the ratio of (capital x time). If times are equal, divide simply in the ratio of capitals."
      }
    ],
    "formulas": [
      "Share of A when N is divided in a:b = a/(a + b) x N",
      "Fourth proportional of a, b, c = bc/a",
      "Third proportional of a, b = b^2/a",
      "Mean proportional of a and b = √(ab)",
      "If a:b = c:d then ad = bc",
      "Partnership: Profit ratio = C1 x T1 : C2 x T2 : C3 x T3"
    ],
    "shortcuts": [
      {
        "trick": "Assume the parts as multiples of x (like 3x and 5x) and form one equation.",
        "example": "Ratio 3:5, after subtracting 9 ratio is 12:23: (3x - 9)/(5x - 9) = 12/23, x = 11."
      },
      {
        "trick": "To combine A:B and B:C, multiply crosswise: A:B:C = (A x B2) : (B1 x B2) : (B1 x C).",
        "example": "2:3 and 4:5: 2x4 : 3x4 : 3x5 = 8:12:15."
      },
      {
        "trick": "In partnership, first reduce capital x time products to simplest ratio, then split profit.",
        "example": "₹40,000 x 12 and ₹60,000 x 6 = 480000 : 360000 = 4:3."
      }
    ],
    "examples": [
      {
        "q": "Divide ₹1,800 between A and B in the ratio 4:5.",
        "solution": "Step 1: Total parts = 4 + 5 = 9.\nStep 2: A = 4/9 x 1800 = 800, B = 5/9 x 1800 = 1000.\nAnswer: A gets ₹800, B gets ₹1,000"
      },
      {
        "q": "Find the fourth proportional to 3, 5 and 12.",
        "solution": "Step 1: 3:5 = 12:x, so 3x = 60.\nStep 2: x = 20.\nAnswer: 20"
      },
      {
        "q": "A:B = 2:3 and B:C = 4:5. Find A:B:C.",
        "solution": "Step 1: Make B common: LCM of 3 and 4 is 12.\nStep 2: A:B = 8:12, B:C = 12:15.\nAnswer: A:B:C = 8:12:15"
      },
      {
        "q": "A invests ₹50,000 for 12 months and B invests ₹30,000 for 10 months. Total profit is ₹36,000. Find B's share.",
        "solution": "Step 1: Ratio = 50000 x 12 : 30000 x 10 = 600000 : 300000 = 2:1.\nStep 2: B's share = 1/3 x 36000 = 12000.\nAnswer: ₹12,000"
      }
    ],
    "questions": [
      {
        "q": "₹720 is divided between two people in the ratio 4:5. What is the larger share?",
        "options": [
          "₹320",
          "₹400",
          "₹360",
          "₹450"
        ],
        "answer": 1,
        "explanation": "Larger share = 5/9 x 720 = ₹400.",
        "level": "Easy"
      },
      {
        "q": "What is the fourth proportional to 4, 6 and 10?",
        "options": [
          "12",
          "20",
          "16",
          "15"
        ],
        "answer": 3,
        "explanation": "4:6 = 10:x, so x = 6 x 10/4 = 15.",
        "level": "Easy"
      },
      {
        "q": "What is the mean proportional between 9 and 16?",
        "options": [
          "12.5",
          "144",
          "7",
          "12"
        ],
        "answer": 3,
        "explanation": "Mean proportional = √(9 x 16) = √144 = 12.",
        "level": "Easy"
      },
      {
        "q": "If A:B = 2:3 and B:C = 4:5, what is A:B:C?",
        "options": [
          "2:3:5",
          "8:12:15",
          "8:12:10",
          "6:9:10"
        ],
        "answer": 1,
        "explanation": "Make B equal to 12: A:B = 8:12 and B:C = 12:15. So A:B:C = 8:12:15.",
        "level": "Easy"
      },
      {
        "q": "A and B invest ₹20,000 and ₹30,000 in a business for one year. The profit is ₹15,000. What is A's share?",
        "options": [
          "₹6,000",
          "₹9,000",
          "₹7,500",
          "₹5,000"
        ],
        "answer": 0,
        "explanation": "Ratio = 2:3. A's share = 2/5 x 15000 = ₹6,000.",
        "level": "Easy"
      },
      {
        "q": "What is the third proportional to 4 and 8?",
        "options": [
          "12",
          "16",
          "32",
          "6"
        ],
        "answer": 1,
        "explanation": "Third proportional = 8^2/4 = 64/4 = 16.",
        "level": "Easy"
      },
      {
        "q": "The ages of two persons are in the ratio 5:7. After 6 years the ratio will be 3:4. What is the present age of the younger person?",
        "options": [
          "25 years",
          "35 years",
          "42 years",
          "30 years"
        ],
        "answer": 3,
        "explanation": "(5x + 6)/(7x + 6) = 3/4, so 20x + 24 = 21x + 18, x = 6. Younger = 5 x 6 = 30 years.",
        "level": "Medium"
      },
      {
        "q": "A invests ₹40,000 for 12 months and B invests ₹60,000 for 6 months. Out of a total profit of ₹21,000, what is B's share?",
        "options": [
          "₹9,000",
          "₹12,000",
          "₹10,500",
          "₹8,400"
        ],
        "answer": 0,
        "explanation": "Ratio = 40000 x 12 : 60000 x 6 = 480000 : 360000 = 4:3. B's share = 3/7 x 21000 = ₹9,000.",
        "level": "Medium"
      },
      {
        "q": "Two numbers are in the ratio 3:5. If 9 is subtracted from each, the new ratio becomes 12:23. What is the smaller number?",
        "options": [
          "27",
          "36",
          "33",
          "55"
        ],
        "answer": 2,
        "explanation": "(3x - 9)/(5x - 9) = 12/23, so 69x - 207 = 60x - 108, 9x = 99, x = 11. Smaller = 33.",
        "level": "Medium"
      },
      {
        "q": "A bag has ₹1, 50-paise and 25-paise coins in the ratio 5:6:8 by number. The total value is ₹210. How many 50-paise coins are there?",
        "options": [
          "105",
          "168",
          "126",
          "120"
        ],
        "answer": 2,
        "explanation": "Let counts be 5k, 6k, 8k. Value = 5k + 3k + 2k = 10k = 210, so k = 21. 50-paise coins = 6 x 21 = 126.",
        "level": "Medium"
      },
      {
        "q": "The salaries of A and B are in the ratio 2:3. If each salary is increased by ₹4,000, the new ratio becomes 3:4. What is B's present salary?",
        "options": [
          "₹12,000",
          "₹8,000",
          "₹16,000",
          "₹15,000"
        ],
        "answer": 0,
        "explanation": "(2x + 4000)/(3x + 4000) = 3/4, so 8x + 16000 = 9x + 12000, x = 4000. B = 3 x 4000 = ₹12,000.",
        "level": "Medium"
      },
      {
        "q": "A starts a business with ₹3,500. After 5 months B joins as a partner. At the end of the year, the profit is divided in the ratio 2:3 (A:B). How much did B invest?",
        "options": [
          "₹7,000",
          "₹10,500",
          "₹8,000",
          "₹9,000"
        ],
        "answer": 3,
        "explanation": "A: 3500 x 12 = 42000. B: x x 7. 42000 : 7x = 2:3, so 14x = 126000, x = ₹9,000.",
        "level": "Medium"
      },
      {
        "q": "A, B and C invest money in the ratio 3:4:5 for periods in the ratio 2:3:4. The total profit is ₹28,500. What is C's share?",
        "options": [
          "₹11,875",
          "₹15,000",
          "₹9,000",
          "₹12,000"
        ],
        "answer": 1,
        "explanation": "Profit ratio = 3x2 : 4x3 : 5x4 = 6:12:20 = 3:6:10. C's share = 10/19 x 28500 = ₹15,000.",
        "level": "Hard"
      },
      {
        "q": "A starts a business with some money. After 6 months B joins with double of A's money, and after 8 months C joins with three times A's money. The annual profit is ₹18,000. What is A's share?",
        "options": [
          "₹6,000",
          "₹3,000",
          "₹4,500",
          "₹9,000"
        ],
        "answer": 0,
        "explanation": "A: x x 12 = 12x, B: 2x x 6 = 12x, C: 3x x 4 = 12x. Ratio 1:1:1, so A gets 18000/3 = ₹6,000.",
        "level": "Hard"
      },
      {
        "q": "₹3,400 is divided among A, B and C such that A gets 2/3 of what B gets and B gets 1/4 of what C gets. What is A's share?",
        "options": [
          "₹600",
          "₹800",
          "₹400",
          "₹2,400"
        ],
        "answer": 2,
        "explanation": "Let C = 12k. Then B = 3k and A = 2k. Total = 17k = 3400, so k = 200. A = 2 x 200 = ₹400.",
        "level": "Hard"
      }
    ]
  },
  {
    "id": "averages-ages",
    "section": "Quantitative Aptitude",
    "title": "Averages & Ages",
    "icon": "👨‍👩‍👧",
    "summary": "Average is the total divided by the count. Age problems use simple equations about present, past and future ages.",
    "concepts": [
      {
        "heading": "Average",
        "content": "Average = Sum of values / Number of values. If you know the average and the count, Sum = Average x Count. Most average questions are solved using totals."
      },
      {
        "heading": "Replacement and addition",
        "content": "When a person is added, removed or replaced, compare the old total and the new total. The difference tells you the value of the person."
      },
      {
        "heading": "Average speed",
        "content": "Average speed = Total distance / Total time. For equal distances at speeds x and y, average speed = 2xy/(x + y), not (x + y)/2."
      },
      {
        "heading": "Ages",
        "content": "If a person's present age is x, then n years ago it was x - n and after n years it will be x + n. The age difference between two people never changes."
      }
    ],
    "formulas": [
      "Average = Sum of observations / Number of observations",
      "Sum = Average x Number of observations",
      "Average of first n natural numbers = (n + 1)/2",
      "Average of consecutive numbers = (first + last)/2",
      "Replacement: New value = Old value + (Number of items x Change in average)",
      "Average speed for equal distances = 2xy/(x + y)"
    ],
    "shortcuts": [
      {
        "trick": "Replacement trick: new person = replaced person + n x (increase in average).",
        "example": "Average of 8 rises by 2.5 when a 65 kg person is replaced: new = 65 + 8 x 2.5 = 85 kg."
      },
      {
        "trick": "For numbers in AP (consecutive, consecutive odd/even), the average is the middle number.",
        "example": "5 consecutive odd numbers with average 61 are 57, 59, 61, 63, 65."
      },
      {
        "trick": "Adding one value: new value = new average + n x (new average - old average), where n is the old count.",
        "example": "Average of 16 innings rises by 3 to a new average A after scoring 85: 85 = A + 16 x 3, so A = 37."
      },
      {
        "trick": "For age ratio questions, use the options and check both conditions quickly.",
        "example": "Ages 4:5 now, 5:6 after 5 years: try 20 and 25: after 5 years 25:30 = 5:6. Correct."
      }
    ],
    "examples": [
      {
        "q": "The average of 5 numbers is 30. If one number is removed, the average becomes 28. Find the removed number.",
        "solution": "Step 1: Total of 5 = 5 x 30 = 150.\nStep 2: Total of 4 = 4 x 28 = 112.\nStep 3: Removed number = 150 - 112 = 38.\nAnswer: 38"
      },
      {
        "q": "The average age of 30 students is 15 years. If the teacher's age is included, the average becomes 16. Find the teacher's age.",
        "solution": "Step 1: Students' total = 30 x 15 = 450.\nStep 2: New total = 31 x 16 = 496.\nStep 3: Teacher = 496 - 450 = 46.\nAnswer: 46 years"
      },
      {
        "q": "A father is 3 times as old as his son. After 12 years he will be twice as old. Find their present ages.",
        "solution": "Step 1: Let son = x, father = 3x.\nStep 2: 3x + 12 = 2(x + 12), so x = 12.\nAnswer: Son 12 years, father 36 years"
      },
      {
        "q": "A car goes to a town at 40 km/h and returns at 60 km/h. Find the average speed.",
        "solution": "Step 1: Equal distances, so use 2xy/(x + y).\nStep 2: = 2 x 40 x 60 / 100 = 48.\nAnswer: 48 km/h"
      }
    ],
    "questions": [
      {
        "q": "What is the average of 12, 15, 18, 21 and 24?",
        "options": [
          "17",
          "19",
          "20",
          "18"
        ],
        "answer": 3,
        "explanation": "Sum = 90. Average = 90/5 = 18.",
        "level": "Easy"
      },
      {
        "q": "What is the average of the first 10 natural numbers?",
        "options": [
          "5",
          "5.5",
          "6",
          "55"
        ],
        "answer": 1,
        "explanation": "Average = (10 + 1)/2 = 5.5.",
        "level": "Easy"
      },
      {
        "q": "The average of 5 numbers is 20. What is their sum?",
        "options": [
          "100",
          "25",
          "4",
          "120"
        ],
        "answer": 0,
        "explanation": "Sum = 5 x 20 = 100.",
        "level": "Easy"
      },
      {
        "q": "A father is 3 times as old as his son. The sum of their ages is 48 years. What is the father's age?",
        "options": [
          "32 years",
          "36 years",
          "40 years",
          "12 years"
        ],
        "answer": 1,
        "explanation": "Son = x, father = 3x. 4x = 48, x = 12. Father = 36 years.",
        "level": "Easy"
      },
      {
        "q": "The average of 4 numbers is 25. If a fifth number 35 is added, what is the new average?",
        "options": [
          "30",
          "26",
          "28",
          "27"
        ],
        "answer": 3,
        "explanation": "Old total = 100. New total = 135. New average = 135/5 = 27.",
        "level": "Easy"
      },
      {
        "q": "Five years ago, Ravi was 20 years old. How old will he be 5 years from now?",
        "options": [
          "30 years",
          "25 years",
          "35 years",
          "28 years"
        ],
        "answer": 0,
        "explanation": "Present age = 25. After 5 years = 30.",
        "level": "Easy"
      },
      {
        "q": "The average weight of 8 persons increases by 2.5 kg when a new person comes in place of one who weighs 65 kg. What is the weight of the new person?",
        "options": [
          "80 kg",
          "75 kg",
          "85 kg",
          "90 kg"
        ],
        "answer": 2,
        "explanation": "New person = 65 + 8 x 2.5 = 85 kg.",
        "level": "Medium"
      },
      {
        "q": "The average of 11 results is 50. The average of the first 6 is 49 and the average of the last 6 is 52. What is the 6th result?",
        "options": [
          "50",
          "54",
          "56",
          "58"
        ],
        "answer": 2,
        "explanation": "First 6 total = 294, last 6 total = 312, all 11 total = 550. 6th result = 294 + 312 - 550 = 56.",
        "level": "Medium"
      },
      {
        "q": "The average age of 30 students is 15 years. When the teacher's age is included, the average becomes 16 years. What is the teacher's age?",
        "options": [
          "46 years",
          "31 years",
          "45 years",
          "47 years"
        ],
        "answer": 0,
        "explanation": "Teacher = 31 x 16 - 30 x 15 = 496 - 450 = 46 years.",
        "level": "Medium"
      },
      {
        "q": "The present ages of A and B are in the ratio 4:5. After 5 years, the ratio will be 5:6. What is A's present age?",
        "options": [
          "25 years",
          "16 years",
          "24 years",
          "20 years"
        ],
        "answer": 3,
        "explanation": "(4x + 5)/(5x + 5) = 5/6, so 24x + 30 = 25x + 25, x = 5. A = 20 years.",
        "level": "Medium"
      },
      {
        "q": "A batsman has a certain average after 16 innings. In the 17th innings he scores 85 runs, which increases his average by 3. What is his average after the 17th innings?",
        "options": [
          "34",
          "37",
          "40",
          "38"
        ],
        "answer": 1,
        "explanation": "16a + 85 = 17(a + 3), so a = 34. New average = 34 + 3 = 37.",
        "level": "Medium"
      },
      {
        "q": "The sum of the ages of 5 children born at intervals of 3 years each is 50 years. What is the age of the youngest child?",
        "options": [
          "4 years",
          "5 years",
          "6 years",
          "3 years"
        ],
        "answer": 0,
        "explanation": "Ages: x, x+3, x+6, x+9, x+12. Sum = 5x + 30 = 50, x = 4 years.",
        "level": "Medium"
      },
      {
        "q": "The average of 5 consecutive odd numbers is 61. What is the product of the smallest and the largest numbers?",
        "options": [
          "3721",
          "3717",
          "3705",
          "3591"
        ],
        "answer": 2,
        "explanation": "Numbers: 57, 59, 61, 63, 65. Product = 57 x 65 = 3705.",
        "level": "Hard"
      },
      {
        "q": "A car travels from A to B at 40 km/h and returns from B to A at 60 km/h. What is its average speed for the whole journey?",
        "options": [
          "50 km/h",
          "48 km/h",
          "45 km/h",
          "52 km/h"
        ],
        "answer": 1,
        "explanation": "Average speed = 2 x 40 x 60/(40 + 60) = 4800/100 = 48 km/h.",
        "level": "Hard"
      },
      {
        "q": "Ten years ago, A was half the age of B. The ratio of their present ages is 3:4. What is the sum of their present ages?",
        "options": [
          "42 years",
          "28 years",
          "49 years",
          "35 years"
        ],
        "answer": 3,
        "explanation": "Present ages 3x and 4x. 3x - 10 = (4x - 10)/2, so 6x - 20 = 4x - 10, x = 5. Ages 15 and 20. Sum = 35.",
        "level": "Hard"
      }
    ]
  },
  {
    "id": "time-work",
    "section": "Quantitative Aptitude",
    "title": "Time & Work",
    "icon": "🛠️",
    "summary": "If a person finishes a job in n days, he does 1/n of it per day. Add the daily work of people working together.",
    "concepts": [
      {
        "heading": "Work per day",
        "content": "If A can finish a job in 10 days, A does 1/10 of the job in one day. Total work is taken as 1 (the whole job)."
      },
      {
        "heading": "Working together",
        "content": "When people work together, add their one-day works. A (1/10) and B (1/15) together do 1/10 + 1/15 = 1/6 per day, so they finish in 6 days."
      },
      {
        "heading": "Efficiency",
        "content": "Efficiency is inversely proportional to time. If A is twice as efficient as B, A takes half the time B takes."
      },
      {
        "heading": "LCM method",
        "content": "Take total work = LCM of the given days. Then each person's daily work is a whole number of units, which makes calculation easy."
      },
      {
        "heading": "Men-days-hours",
        "content": "More men finish the same work in fewer days. Use M1 x D1 x H1 / W1 = M2 x D2 x H2 / W2."
      }
    ],
    "formulas": [
      "One day work of A = 1 / (days taken by A)",
      "Time taken by A and B together = ab / (a + b)",
      "Time taken by A, B, C together = abc / (ab + bc + ca)",
      "M1 x D1 x H1 / W1 = M2 x D2 x H2 / W2",
      "If A is k times as efficient as B, time of A = time of B / k",
      "Wages are shared in the ratio of work done (i.e. ratio of efficiencies when they work the same days)"
    ],
    "shortcuts": [
      {
        "trick": "Two people: together time = product / sum.",
        "example": "A = 10 days, B = 15 days: 150/25 = 6 days."
      },
      {
        "trick": "LCM method: total work = LCM of days, efficiency = total / days.",
        "example": "A = 20, B = 30 days. Work = 60 units. A does 3, B does 2 per day. Together 5 units/day, 12 days."
      },
      {
        "trick": "If (A+B), (B+C), (C+A) times are given, add their rates and halve to get A+B+C.",
        "example": "12, 15, 20 days: (1/12 + 1/15 + 1/20)/2 = 1/10. All three finish in 10 days."
      },
      {
        "trick": "Find B alone from A alone and A+B together: B = (a x t)/(a - t).",
        "example": "A = 12, together = 8: B = 96/4 = 24 days."
      }
    ],
    "examples": [
      {
        "q": "A can do a work in 20 days and B in 30 days. In how many days can they finish it together?",
        "solution": "Step 1: Total work = LCM(20, 30) = 60 units.\nStep 2: A does 3 units/day, B does 2 units/day, together 5 units/day.\nStep 3: Time = 60/5 = 12 days.\nAnswer: 12 days"
      },
      {
        "q": "12 men can do a work in 18 days working 8 hours a day. In how many days can 16 men do it working 9 hours a day?",
        "solution": "Step 1: 12 x 18 x 8 = 16 x D x 9.\nStep 2: D = 1728/144 = 12.\nAnswer: 12 days"
      },
      {
        "q": "A and B together finish a job in 8 days. A alone can finish it in 12 days. How long will B take alone?",
        "solution": "Step 1: B's one day work = 1/8 - 1/12 = 1/24.\nStep 2: B alone takes 24 days.\nAnswer: 24 days"
      },
      {
        "q": "A can do a work in 15 days and B in 10 days. A and B are paid ₹5,000 together for finishing it. Find A's share.",
        "solution": "Step 1: Efficiency ratio A:B = 1/15 : 1/10 = 2:3.\nStep 2: A's share = 2/5 x 5000 = 2000.\nAnswer: ₹2,000"
      }
    ],
    "questions": [
      {
        "q": "A can do a work in 10 days and B can do it in 15 days. In how many days can they finish it together?",
        "options": [
          "6 days",
          "5 days",
          "12.5 days",
          "8 days"
        ],
        "answer": 0,
        "explanation": "Together = 10 x 15/(10 + 15) = 150/25 = 6 days.",
        "level": "Easy"
      },
      {
        "q": "A can finish a work in 12 days. What part of the work will he finish in 3 days?",
        "options": [
          "1/3",
          "1/4",
          "1/6",
          "3/4"
        ],
        "answer": 1,
        "explanation": "One day = 1/12. In 3 days = 3/12 = 1/4.",
        "level": "Easy"
      },
      {
        "q": "10 men can finish a work in 12 days. In how many days will 15 men finish the same work?",
        "options": [
          "18 days",
          "10 days",
          "6 days",
          "8 days"
        ],
        "answer": 3,
        "explanation": "10 x 12 = 15 x D, so D = 8 days.",
        "level": "Easy"
      },
      {
        "q": "A and B together can finish a work in 8 days. A alone can do it in 12 days. How many days will B take alone?",
        "options": [
          "24 days",
          "20 days",
          "16 days",
          "4 days"
        ],
        "answer": 0,
        "explanation": "B = 1/8 - 1/12 = 1/24. So B takes 24 days.",
        "level": "Easy"
      },
      {
        "q": "A is twice as efficient as B. B can finish a work in 30 days. How many days will A take alone?",
        "options": [
          "60 days",
          "10 days",
          "15 days",
          "20 days"
        ],
        "answer": 2,
        "explanation": "A takes half of B's time = 30/2 = 15 days.",
        "level": "Easy"
      },
      {
        "q": "A, B and C can do a work in 6, 12 and 24 days respectively. In how many days can they finish it together?",
        "options": [
          "4 days",
          "3 1/2 days",
          "3 3/7 days",
          "14 days"
        ],
        "answer": 2,
        "explanation": "Together per day = 1/6 + 1/12 + 1/24 = 7/24. Time = 24/7 = 3 3/7 days.",
        "level": "Easy"
      },
      {
        "q": "A can do a work in 20 days and B in 30 days. They work together for 6 days and then A leaves. In how many more days will B finish the remaining work?",
        "options": [
          "15 days",
          "12 days",
          "18 days",
          "10 days"
        ],
        "answer": 0,
        "explanation": "Work in 6 days = 6 x (1/20 + 1/30) = 6 x 1/12 = 1/2. B does the remaining 1/2 in 1/2 x 30 = 15 days.",
        "level": "Medium"
      },
      {
        "q": "12 men can finish a work in 18 days working 8 hours a day. In how many days can 16 men finish it working 9 hours a day?",
        "options": [
          "14 days",
          "16 days",
          "10 days",
          "12 days"
        ],
        "answer": 3,
        "explanation": "12 x 18 x 8 = 16 x D x 9, so D = 1728/144 = 12 days.",
        "level": "Medium"
      },
      {
        "q": "A and B can do a work in 12 days, B and C in 15 days, and C and A in 20 days. In how many days can A, B and C together finish it?",
        "options": [
          "15 days",
          "10 days",
          "8 days",
          "12 days"
        ],
        "answer": 1,
        "explanation": "2(A + B + C) = 1/12 + 1/15 + 1/20 = 1/5. So A + B + C = 1/10, i.e. 10 days.",
        "level": "Medium"
      },
      {
        "q": "A is 50% more efficient than B. B alone can finish a work in 30 days. In how many days can A and B together finish it?",
        "options": [
          "12 days",
          "15 days",
          "10 days",
          "18 days"
        ],
        "answer": 0,
        "explanation": "A takes 30/1.5 = 20 days. Together = 20 x 30/50 = 12 days.",
        "level": "Medium"
      },
      {
        "q": "A can do 1/3 of a work in 5 days and B can do 2/5 of it in 10 days. In how many days can both together finish the whole work?",
        "options": [
          "10 days",
          "9 1/2 days",
          "9 3/8 days",
          "8 3/4 days"
        ],
        "answer": 2,
        "explanation": "A alone = 15 days, B alone = 25 days. Together = 15 x 25/40 = 75/8 = 9 3/8 days.",
        "level": "Medium"
      },
      {
        "q": "A can do a job in 10 days and B in 15 days. Working together they finish it and get ₹4,500. What is A's share?",
        "options": [
          "₹1,800",
          "₹2,700",
          "₹2,250",
          "₹3,000"
        ],
        "answer": 1,
        "explanation": "Work ratio A:B = 1/10 : 1/15 = 3:2. A's share = 3/5 x 4500 = ₹2,700.",
        "level": "Medium"
      },
      {
        "q": "A can do a work in 40 days. He works alone for 8 days, then B joins him and together they finish the remaining work in 16 days. How long would B take to do the whole work alone?",
        "options": [
          "30 days",
          "32 days",
          "48 days",
          "40 days"
        ],
        "answer": 3,
        "explanation": "A works 8 + 16 = 24 days, doing 24/40 = 3/5. B does 2/5 in 16 days, so B alone takes 16 x 5/2 = 40 days.",
        "level": "Hard"
      },
      {
        "q": "4 men and 6 women can finish a work in 8 days, while 3 men and 7 women can finish it in 10 days. In how many days will 10 women finish it?",
        "options": [
          "35 days",
          "50 days",
          "36 days",
          "40 days"
        ],
        "answer": 3,
        "explanation": "4m + 6w = 1/8 and 3m + 7w = 1/10. Solving: w = 1/400 and m = 11/400. 10 women do 10/400 = 1/40 per day, so 40 days.",
        "level": "Hard"
      },
      {
        "q": "A, B and C can do a work in 24, 30 and 40 days respectively. They start together, but C leaves 4 days before the work is finished. In how many days is the work finished?",
        "options": [
          "12 days",
          "11 days",
          "10 days",
          "13 days"
        ],
        "answer": 1,
        "explanation": "Let total time be t. t/24 + t/30 + (t - 4)/40 = 1. Multiply by 120: 5t + 4t + 3t - 12 = 120, so t = 11 days.",
        "level": "Hard"
      }
    ]
  },
  {
    "id": "pipes-cisterns",
    "section": "Quantitative Aptitude",
    "title": "Pipes & Cisterns",
    "icon": "🚰",
    "summary": "Pipes & Cisterns is the same as Time & Work: an inlet pipe does positive work and an outlet pipe or leak does negative work.",
    "concepts": [
      {
        "heading": "Inlet and outlet",
        "content": "An inlet pipe fills the tank (positive work). An outlet pipe or leak empties it (negative work). If a pipe fills the tank in 6 hours, it fills 1/6 per hour."
      },
      {
        "heading": "Net filling rate",
        "content": "When several pipes are open, add the rates of inlets and subtract the rates of outlets. Net rate = sum of inlet rates - sum of outlet rates."
      },
      {
        "heading": "Leak problems",
        "content": "If a pipe normally fills in a hours but takes b hours because of a leak, the leak alone empties the full tank in ab/(b - a) hours."
      },
      {
        "heading": "Pipes opened at different times",
        "content": "Write how long each pipe actually runs, multiply by its rate, and add. The total should be 1 (one full tank)."
      }
    ],
    "formulas": [
      "Part filled in 1 hour by a pipe that fills in x hours = 1/x",
      "Two inlet pipes together: time = ab/(a + b)",
      "Inlet (a hours) and outlet (b hours, b > a) together: time = ab/(b - a)",
      "Leak empties the tank in ab/(b - a), when a pipe takes a hours alone and b hours with the leak",
      "Net rate = sum of inlet rates - sum of outlet rates"
    ],
    "shortcuts": [
      {
        "trick": "Use LCM as tank capacity in units.",
        "example": "A = 12 min, B = 15 min, outlet C = 20 min. Tank = 60 units. A = 5, B = 4, C = -3. Net 6 units/min, time = 10 min."
      },
      {
        "trick": "Fill and empty pair: product / difference.",
        "example": "Fill in 6 h, empty in 12 h: 72/6 = 12 h."
      },
      {
        "trick": "Leak shortcut: product / difference of normal and delayed times.",
        "example": "Fills in 8 h, with leak 10 h: leak empties in 80/2 = 40 h."
      }
    ],
    "examples": [
      {
        "q": "Pipe A fills a tank in 10 hours and pipe B fills it in 15 hours. How long will both take together?",
        "solution": "Step 1: Tank = LCM(10, 15) = 30 units.\nStep 2: A = 3 units/h, B = 2 units/h, together 5 units/h.\nStep 3: Time = 30/5 = 6 hours.\nAnswer: 6 hours"
      },
      {
        "q": "A pipe fills a tank in 6 hours and an outlet empties it in 12 hours. Both are opened. When will the tank be full?",
        "solution": "Step 1: Net rate = 1/6 - 1/12 = 1/12.\nStep 2: Time = 12 hours.\nAnswer: 12 hours"
      },
      {
        "q": "A pipe can fill a tank in 8 hours. Due to a leak, it takes 10 hours. In how much time can the leak empty the full tank?",
        "solution": "Step 1: Leak rate = 1/8 - 1/10 = 1/40.\nStep 2: Leak empties full tank in 40 hours.\nAnswer: 40 hours"
      },
      {
        "q": "Pipes A and B can fill a tank in 20 and 30 minutes. Both are opened together, and A is closed after 8 minutes. In how much total time will the tank be full?",
        "solution": "Step 1: A runs 8 min: 8/20 = 2/5.\nStep 2: B must fill the rest along with its own: let total time be t, then 2/5 + t/30 = 1, so t = 18.\nAnswer: 18 minutes"
      }
    ],
    "questions": [
      {
        "q": "Pipe A can fill a tank in 10 hours and pipe B in 15 hours. If both are opened together, how long will they take to fill the tank?",
        "options": [
          "5 hours",
          "12.5 hours",
          "8 hours",
          "6 hours"
        ],
        "answer": 3,
        "explanation": "Time = 10 x 15/(10 + 15) = 6 hours.",
        "level": "Easy"
      },
      {
        "q": "A pipe can fill a tank in 6 hours and an outlet pipe can empty it in 12 hours. If both are opened, in how many hours will the tank be full?",
        "options": [
          "12 hours",
          "18 hours",
          "6 hours",
          "4 hours"
        ],
        "answer": 0,
        "explanation": "Net rate = 1/6 - 1/12 = 1/12. Tank fills in 12 hours.",
        "level": "Easy"
      },
      {
        "q": "A pipe can fill a tank in 4 hours. What part of the tank will it fill in 1 hour?",
        "options": [
          "1/2",
          "1/8",
          "1/4",
          "3/4"
        ],
        "answer": 2,
        "explanation": "Part filled in 1 hour = 1/4.",
        "level": "Easy"
      },
      {
        "q": "A pipe can fill a tank in 8 hours. Because of a leak at the bottom, it takes 10 hours to fill. How long will the leak take to empty the full tank?",
        "options": [
          "20 hours",
          "18 hours",
          "40 hours",
          "80 hours"
        ],
        "answer": 2,
        "explanation": "Leak rate = 1/8 - 1/10 = 1/40. So the leak empties the tank in 40 hours.",
        "level": "Easy"
      },
      {
        "q": "Two pipes can fill a tank in 20 minutes and 30 minutes. How long will they take together?",
        "options": [
          "12 minutes",
          "25 minutes",
          "10 minutes",
          "15 minutes"
        ],
        "answer": 0,
        "explanation": "Time = 20 x 30/50 = 12 minutes.",
        "level": "Easy"
      },
      {
        "q": "Three pipes can fill a tank in 10, 12 and 15 hours respectively. If all are opened together, how long will they take to fill the tank?",
        "options": [
          "5 hours",
          "3 hours",
          "6 hours",
          "4 hours"
        ],
        "answer": 3,
        "explanation": "Rate = 1/10 + 1/12 + 1/15 = (6 + 5 + 4)/60 = 1/4. Time = 4 hours.",
        "level": "Easy"
      },
      {
        "q": "Pipes A and B can fill a tank in 12 and 15 minutes. Pipe C can empty it in 20 minutes. If all three are opened together, how long will it take to fill the tank?",
        "options": [
          "12 minutes",
          "10 minutes",
          "8 minutes",
          "15 minutes"
        ],
        "answer": 1,
        "explanation": "Rate = 1/12 + 1/15 - 1/20 = (5 + 4 - 3)/60 = 1/10. Time = 10 minutes.",
        "level": "Medium"
      },
      {
        "q": "Pipes A and B can fill a tank in 20 and 30 minutes. Both are opened together, and after 6 minutes A is closed. How many more minutes will B take to fill the tank?",
        "options": [
          "15 minutes",
          "12 minutes",
          "18 minutes",
          "24 minutes"
        ],
        "answer": 0,
        "explanation": "In 6 minutes: 6 x (1/20 + 1/30) = 1/2. B fills the remaining 1/2 in 15 minutes.",
        "level": "Medium"
      },
      {
        "q": "Pipe A fills a tank 3 times as fast as pipe B. Together they fill the tank in 12 hours. How long will the slower pipe B take alone?",
        "options": [
          "36 hours",
          "16 hours",
          "48 hours",
          "24 hours"
        ],
        "answer": 2,
        "explanation": "Let B = 1/x, A = 3/x. 4/x = 1/12, so x = 48 hours.",
        "level": "Medium"
      },
      {
        "q": "A leak can empty a full tank in 8 hours. An inlet pipe fills water at 6 litres per minute. When the tank is full and the inlet is opened, the tank becomes empty in 12 hours. What is the capacity of the tank?",
        "options": [
          "7200 litres",
          "8640 litres",
          "4320 litres",
          "5760 litres"
        ],
        "answer": 1,
        "explanation": "Leak rate - inlet rate = C/720 per minute. Leak rate = C/480. So C/480 - 6 = C/720, giving C/1440 = 6, C = 8640 litres.",
        "level": "Medium"
      },
      {
        "q": "Pipes A and B can fill a tank in 10 and 20 hours. They are opened alternately for 1 hour each, starting with A. In how many hours will the tank be full?",
        "options": [
          "14 hours",
          "12 hours",
          "13.5 hours",
          "13 hours"
        ],
        "answer": 3,
        "explanation": "Every 2 hours: 1/10 + 1/20 = 3/20. After 12 hours: 18/20 filled. In the 13th hour A fills 1/10 = 2/20. Total = 13 hours.",
        "level": "Medium"
      },
      {
        "q": "Two pipes can fill a tank in 24 and 32 minutes. An outlet pipe can empty 3 litres per minute. When all three are open, the tank fills in 16 minutes. What is the capacity of the tank?",
        "options": [
          "240 litres",
          "192 litres",
          "300 litres",
          "288 litres"
        ],
        "answer": 3,
        "explanation": "Outlet rate = 1/24 + 1/32 - 1/16 = 1/96. So the outlet empties the tank in 96 minutes. Capacity = 96 x 3 = 288 litres.",
        "level": "Medium"
      },
      {
        "q": "Pipes A and B can fill a tank in 20 and 30 minutes. Both are opened together, but A is closed after some time. The tank is full in 18 minutes in total. After how many minutes was A closed?",
        "options": [
          "6 minutes",
          "8 minutes",
          "10 minutes",
          "12 minutes"
        ],
        "answer": 1,
        "explanation": "B runs 18 minutes: 18/30 = 3/5. A fills the rest 2/5, so A ran 2/5 x 20 = 8 minutes.",
        "level": "Hard"
      },
      {
        "q": "A tap can fill a tank in 6 hours. After half the tank is filled, three more similar taps are opened. What is the total time taken to fill the tank completely?",
        "options": [
          "3 hours 45 minutes",
          "3 hours 30 minutes",
          "4 hours",
          "4 hours 30 minutes"
        ],
        "answer": 0,
        "explanation": "Half tank by one tap = 3 hours. Remaining half with 4 taps: (1/2)/(4/6) = 3/4 hour = 45 minutes. Total = 3 hours 45 minutes.",
        "level": "Hard"
      },
      {
        "q": "A cistern has three pipes A, B and C. A and B can fill it in 3 and 4 hours, and C can empty it in 1 hour. The empty cistern's pipes are opened at 3 PM, 4 PM and 5 PM respectively (A at 3, B at 4, C at 5). At what time will the cistern be empty again?",
        "options": [
          "6:12 PM",
          "7:12 PM",
          "7:00 PM",
          "7:30 PM"
        ],
        "answer": 1,
        "explanation": "Let t be hours after 3 PM. Water = t/3 + (t - 1)/4 - (t - 2) = 0. Multiply by 12: 4t + 3t - 3 - 12t + 24 = 0, so t = 4.2 hours = 4 h 12 min. Time = 7:12 PM.",
        "level": "Hard"
      }
    ]
  },
  {
    "id": "time-speed-distance",
    "section": "Quantitative Aptitude",
    "title": "Time, Speed & Distance",
    "icon": "🚆",
    "summary": "Distance = Speed x Time. This topic also covers trains crossing objects and boats moving with or against a stream.",
    "concepts": [
      {
        "heading": "Basic relation",
        "content": "Distance = Speed x Time. Keep units the same. To change km/h to m/s multiply by 5/18; to change m/s to km/h multiply by 18/5."
      },
      {
        "heading": "Relative speed",
        "content": "If two objects move in the same direction, relative speed = difference of speeds. If they move in opposite directions, relative speed = sum of speeds."
      },
      {
        "heading": "Trains",
        "content": "A train crossing a pole or a person covers its own length. Crossing a platform or bridge, it covers its own length + the platform length. Crossing another train, it covers the sum of both lengths."
      },
      {
        "heading": "Boats and streams",
        "content": "Downstream (with the water) speed = boat speed + stream speed. Upstream (against the water) speed = boat speed - stream speed."
      },
      {
        "heading": "Average speed",
        "content": "Average speed = total distance / total time. For two equal distances at speeds x and y, it is 2xy/(x + y)."
      }
    ],
    "formulas": [
      "Speed = Distance / Time",
      "1 km/h = 5/18 m/s;  1 m/s = 18/5 km/h",
      "Train crossing pole: Time = Length of train / Speed",
      "Train crossing platform: Time = (Train length + Platform length) / Speed",
      "Two trains: Time = (L1 + L2) / Relative speed",
      "Downstream = u + v;  Upstream = u - v",
      "Boat speed u = (Down + Up)/2;  Stream speed v = (Down - Up)/2",
      "Average speed for equal distances = 2xy/(x + y)"
    ],
    "shortcuts": [
      {
        "trick": "Multiples of 18 km/h convert nicely: 18 km/h = 5 m/s, 36 = 10, 54 = 15, 72 = 20, 90 = 25 m/s.",
        "example": "A train at 54 km/h = 15 m/s. A 150 m train crosses a pole in 150/15 = 10 s."
      },
      {
        "trick": "If speed becomes a/b of usual, the new time is b/a of usual. Extra time = (b/a - 1) x usual time.",
        "example": "At 3/4 speed, time is 4/3 of usual. Late by 20 min = 1/3 of usual, so usual time = 60 min."
      },
      {
        "trick": "Meeting problems: time to meet = gap / sum of speeds.",
        "example": "110 km apart, speeds 20 and 25 km/h towards each other: 110/45 hours (if both start together)."
      },
      {
        "trick": "Boats: average of downstream and upstream is boat speed; half the difference is stream speed.",
        "example": "Down 15, up 9: boat = 12 km/h, stream = 3 km/h."
      }
    ],
    "examples": [
      {
        "q": "A train 150 m long runs at 54 km/h. How long will it take to cross a pole?",
        "solution": "Step 1: 54 km/h = 54 x 5/18 = 15 m/s.\nStep 2: Time = 150/15 = 10 s.\nAnswer: 10 seconds"
      },
      {
        "q": "A train 200 m long crosses a 300 m platform in 25 seconds. Find its speed in km/h.",
        "solution": "Step 1: Distance = 200 + 300 = 500 m.\nStep 2: Speed = 500/25 = 20 m/s.\nStep 3: 20 x 18/5 = 72 km/h.\nAnswer: 72 km/h"
      },
      {
        "q": "A boat goes 30 km downstream in 2 hours and comes back upstream in 3 hours. Find the speed of the boat in still water and the speed of the stream.",
        "solution": "Step 1: Downstream = 15 km/h, upstream = 10 km/h.\nStep 2: Boat = (15 + 10)/2 = 12.5 km/h.\nStep 3: Stream = (15 - 10)/2 = 2.5 km/h.\nAnswer: 12.5 km/h and 2.5 km/h"
      },
      {
        "q": "Two trains 120 m and 180 m long run in opposite directions at 50 km/h and 40 km/h. How long will they take to cross each other?",
        "solution": "Step 1: Relative speed = 90 km/h = 25 m/s.\nStep 2: Distance = 120 + 180 = 300 m.\nStep 3: Time = 300/25 = 12 s.\nAnswer: 12 seconds"
      }
    ],
    "questions": [
      {
        "q": "What is 72 km/h in metres per second?",
        "options": [
          "25 m/s",
          "18 m/s",
          "20 m/s",
          "72 m/s"
        ],
        "answer": 2,
        "explanation": "72 x 5/18 = 20 m/s.",
        "level": "Easy"
      },
      {
        "q": "A car covers 240 km in 4 hours. What is its speed?",
        "options": [
          "50 km/h",
          "80 km/h",
          "60 km/h",
          "40 km/h"
        ],
        "answer": 2,
        "explanation": "Speed = 240/4 = 60 km/h.",
        "level": "Easy"
      },
      {
        "q": "A train 150 m long is running at 54 km/h. How long will it take to cross a pole?",
        "options": [
          "10 seconds",
          "15 seconds",
          "9 seconds",
          "12 seconds"
        ],
        "answer": 0,
        "explanation": "54 km/h = 15 m/s. Time = 150/15 = 10 seconds.",
        "level": "Easy"
      },
      {
        "q": "The speed of a boat in still water is 10 km/h and the speed of the stream is 2 km/h. What is the downstream speed?",
        "options": [
          "8 km/h",
          "10 km/h",
          "20 km/h",
          "12 km/h"
        ],
        "answer": 3,
        "explanation": "Downstream = 10 + 2 = 12 km/h.",
        "level": "Easy"
      },
      {
        "q": "A man walks at 5 km/h for 3 hours 30 minutes. How far does he walk?",
        "options": [
          "15 km",
          "17.5 km",
          "16.5 km",
          "18 km"
        ],
        "answer": 1,
        "explanation": "Distance = 5 x 3.5 = 17.5 km.",
        "level": "Easy"
      },
      {
        "q": "A boat goes downstream at 15 km/h and upstream at 9 km/h. What is the speed of the boat in still water?",
        "options": [
          "12 km/h",
          "3 km/h",
          "6 km/h",
          "24 km/h"
        ],
        "answer": 0,
        "explanation": "Boat speed = (15 + 9)/2 = 12 km/h.",
        "level": "Easy"
      },
      {
        "q": "A train 200 m long crosses a platform 300 m long in 25 seconds. What is the speed of the train in km/h?",
        "options": [
          "60 km/h",
          "28.8 km/h",
          "72 km/h",
          "80 km/h"
        ],
        "answer": 2,
        "explanation": "Speed = 500/25 = 20 m/s = 20 x 18/5 = 72 km/h.",
        "level": "Medium"
      },
      {
        "q": "Two trains 120 m and 180 m long run in opposite directions at 50 km/h and 40 km/h. How long will they take to cross each other completely?",
        "options": [
          "10 seconds",
          "12 seconds",
          "15 seconds",
          "108 seconds"
        ],
        "answer": 1,
        "explanation": "Relative speed = 90 km/h = 25 m/s. Time = (120 + 180)/25 = 12 seconds.",
        "level": "Medium"
      },
      {
        "q": "Two trains 100 m and 125 m long run in the same direction at 60 km/h and 42 km/h. How long will the faster train take to completely pass the slower one?",
        "options": [
          "40 seconds",
          "50 seconds",
          "7.5 seconds",
          "45 seconds"
        ],
        "answer": 3,
        "explanation": "Relative speed = 18 km/h = 5 m/s. Distance = 225 m. Time = 225/5 = 45 seconds.",
        "level": "Medium"
      },
      {
        "q": "A man goes from home to office at 30 km/h and returns at 20 km/h. The total travel time is 10 hours. What is the distance between home and office?",
        "options": [
          "100 km",
          "150 km",
          "125 km",
          "120 km"
        ],
        "answer": 3,
        "explanation": "d/30 + d/20 = 10, so 5d/60 = 10, d = 120 km.",
        "level": "Medium"
      },
      {
        "q": "A boat goes 24 km upstream in 6 hours and 20 km downstream in 2 hours. What is the speed of the stream?",
        "options": [
          "7 km/h",
          "3 km/h",
          "6 km/h",
          "2 km/h"
        ],
        "answer": 1,
        "explanation": "Upstream = 4 km/h, downstream = 10 km/h. Stream = (10 - 4)/2 = 3 km/h.",
        "level": "Medium"
      },
      {
        "q": "Walking at 3/4 of his usual speed, a man reaches his office 20 minutes late. What is his usual time to reach the office?",
        "options": [
          "60 minutes",
          "80 minutes",
          "45 minutes",
          "40 minutes"
        ],
        "answer": 0,
        "explanation": "At 3/4 speed, time = 4/3 of usual. Extra = 1/3 of usual = 20 minutes, so usual time = 60 minutes.",
        "level": "Medium"
      },
      {
        "q": "A train passes two people walking in the same direction as the train at 2 km/h and 4 km/h in 9 seconds and 10 seconds respectively. What is the length of the train?",
        "options": [
          "45 m",
          "50 m",
          "60 m",
          "55 m"
        ],
        "answer": 1,
        "explanation": "Let train speed be S km/h. Length = (S - 2) x 5/18 x 9 = (S - 4) x 5/18 x 10. So 9S - 18 = 10S - 40, S = 22. Length = 20 x 5/18 x 9 = 50 m.",
        "level": "Hard"
      },
      {
        "q": "A boat's speed in still water is 15 km/h. It goes 30 km downstream and comes back in a total of 4 hours 30 minutes. What is the speed of the stream?",
        "options": [
          "3 km/h",
          "4 km/h",
          "6 km/h",
          "5 km/h"
        ],
        "answer": 3,
        "explanation": "30/(15 + v) + 30/(15 - v) = 4.5, so 900/(225 - v^2) = 4.5, 225 - v^2 = 200, v = 5 km/h.",
        "level": "Hard"
      },
      {
        "q": "Stations A and B are 110 km apart. A train starts from A at 7 AM towards B at 20 km/h. Another train starts from B at 8 AM towards A at 25 km/h. At what time will they meet?",
        "options": [
          "10 AM",
          "9 AM",
          "10:30 AM",
          "11 AM"
        ],
        "answer": 0,
        "explanation": "By 8 AM the first train covers 20 km. Remaining gap = 90 km, closing at 45 km/h, so 2 more hours. They meet at 10 AM.",
        "level": "Hard"
      }
    ]
  },
  {
    "id": "permutations-combinations",
    "section": "Quantitative Aptitude",
    "title": "Permutations & Combinations",
    "icon": "🔀",
    "summary": "Permutation means arrangement (order matters); combination means selection (order does not matter). Learn to count ways quickly.",
    "concepts": [
      {
        "heading": "Fundamental counting",
        "content": "If one task can be done in m ways and another in n ways, both together can be done in m x n ways (AND = multiply). If you do either one or the other, there are m + n ways (OR = add)."
      },
      {
        "heading": "Permutation (arrangement)",
        "content": "Use when order matters, like seating people or forming numbers. Number of ways to arrange r things out of n = nPr = n!/(n - r)!."
      },
      {
        "heading": "Combination (selection)",
        "content": "Use when order does not matter, like choosing a team or committee. Number of ways = nCr = n!/(r!(n - r)!)."
      },
      {
        "heading": "Repeated letters",
        "content": "If a word has repeated letters, divide by the factorial of each repeat count. BOOK has 4!/2! = 12 arrangements."
      },
      {
        "heading": "Circular arrangement",
        "content": "n people around a round table can sit in (n - 1)! ways, because rotations are the same."
      }
    ],
    "formulas": [
      "n! = n x (n - 1) x ... x 2 x 1, and 0! = 1",
      "nPr = n! / (n - r)!",
      "nCr = n! / [r! (n - r)!]",
      "nCr = nC(n - r)",
      "Arrangements with repeats = n! / (p! q! r!...)",
      "Circular arrangements = (n - 1)!",
      "Number of diagonals in an n-sided polygon = nC2 - n",
      "Handshakes among n people = nC2"
    ],
    "shortcuts": [
      {
        "trick": "\"Together\" items: tie them into one block, arrange the blocks, then arrange inside the block.",
        "example": "APPLE with vowels together: block (AE) + P, P, L = 4!/2! = 12, times 2! = 24."
      },
      {
        "trick": "\"At least\" questions: total minus the unwanted cases.",
        "example": "At least 2 women from 6M, 4W choose 5: 252 - 6 - 60 = 186."
      },
      {
        "trick": "Particular person must be included: fix them and choose the rest from the others.",
        "example": "Choose 4 from 7 with A always in: 6C3 = 20."
      },
      {
        "trick": "Use nCr = nC(n - r) to reduce calculation.",
        "example": "10C8 = 10C2 = 45."
      }
    ],
    "examples": [
      {
        "q": "In how many ways can the letters of the word LEADER be arranged?",
        "solution": "Step 1: 6 letters, E appears twice.\nStep 2: Ways = 6!/2! = 720/2 = 360.\nAnswer: 360"
      },
      {
        "q": "A committee of 3 men and 2 women is to be formed from 6 men and 5 women. In how many ways can this be done?",
        "solution": "Step 1: Choose men: 6C3 = 20.\nStep 2: Choose women: 5C2 = 10.\nStep 3: Total = 20 x 10 = 200.\nAnswer: 200"
      },
      {
        "q": "How many 3-digit numbers can be formed using the digits 1, 2, 3, 4, 5 without repetition?",
        "solution": "Step 1: Hundreds place: 5 choices, tens: 4, units: 3.\nStep 2: Total = 5 x 4 x 3 = 60.\nAnswer: 60"
      },
      {
        "q": "In how many ways can 6 people sit around a round table?",
        "solution": "Step 1: Circular arrangement = (n - 1)!.\nStep 2: (6 - 1)! = 5! = 120.\nAnswer: 120"
      }
    ],
    "questions": [
      {
        "q": "In how many ways can 5 people stand in a line?",
        "options": [
          "120",
          "24",
          "60",
          "25"
        ],
        "answer": 0,
        "explanation": "Ways = 5! = 120.",
        "level": "Easy"
      },
      {
        "q": "What is the value of 8C3?",
        "options": [
          "336",
          "24",
          "70",
          "56"
        ],
        "answer": 3,
        "explanation": "8C3 = (8 x 7 x 6)/(3 x 2 x 1) = 56.",
        "level": "Easy"
      },
      {
        "q": "In how many ways can a President and a Vice-President be chosen from 6 members?",
        "options": [
          "15",
          "30",
          "36",
          "12"
        ],
        "answer": 1,
        "explanation": "Order matters: 6P2 = 6 x 5 = 30.",
        "level": "Easy"
      },
      {
        "q": "In a party of 10 people, each person shakes hands with every other person once. How many handshakes take place?",
        "options": [
          "45",
          "90",
          "100",
          "55"
        ],
        "answer": 0,
        "explanation": "Handshakes = 10C2 = 45.",
        "level": "Easy"
      },
      {
        "q": "In how many ways can the letters of the word BOOK be arranged?",
        "options": [
          "24",
          "6",
          "12",
          "16"
        ],
        "answer": 2,
        "explanation": "4 letters with O repeated twice: 4!/2! = 12.",
        "level": "Easy"
      },
      {
        "q": "In how many ways can 6 people be seated around a round table?",
        "options": [
          "720",
          "120",
          "360",
          "60"
        ],
        "answer": 1,
        "explanation": "Circular arrangement = (6 - 1)! = 120.",
        "level": "Easy"
      },
      {
        "q": "In how many ways can the letters of the word LEADER be arranged?",
        "options": [
          "720",
          "180",
          "240",
          "360"
        ],
        "answer": 3,
        "explanation": "6 letters with E twice: 6!/2! = 360.",
        "level": "Medium"
      },
      {
        "q": "A committee of 3 men and 2 women is to be formed from 6 men and 5 women. In how many ways can it be done?",
        "options": [
          "462",
          "150",
          "30",
          "200"
        ],
        "answer": 3,
        "explanation": "6C3 x 5C2 = 20 x 10 = 200.",
        "level": "Medium"
      },
      {
        "q": "How many 3-digit numbers can be formed using the digits 1, 2, 3, 4 and 5 if no digit is repeated?",
        "options": [
          "125",
          "60",
          "10",
          "120"
        ],
        "answer": 1,
        "explanation": "5 x 4 x 3 = 60.",
        "level": "Medium"
      },
      {
        "q": "In how many ways can the letters of the word APPLE be arranged so that the vowels always come together?",
        "options": [
          "24",
          "12",
          "48",
          "60"
        ],
        "answer": 0,
        "explanation": "Treat A and E as one block: block, P, P, L = 4!/2! = 12 ways. Vowels inside the block: 2! = 2. Total = 24.",
        "level": "Medium"
      },
      {
        "q": "How many diagonals does a polygon with 10 sides have?",
        "options": [
          "45",
          "35",
          "40",
          "20"
        ],
        "answer": 1,
        "explanation": "Diagonals = 10C2 - 10 = 45 - 10 = 35.",
        "level": "Medium"
      },
      {
        "q": "In how many ways can 4 people be selected from 7 if one particular person must always be included?",
        "options": [
          "35",
          "15",
          "21",
          "20"
        ],
        "answer": 3,
        "explanation": "Fix that person, choose 3 from the other 6: 6C3 = 20.",
        "level": "Medium"
      },
      {
        "q": "A committee of 5 is to be formed from 6 men and 4 women. In how many ways can this be done if the committee must have at least 2 women?",
        "options": [
          "186",
          "180",
          "120",
          "246"
        ],
        "answer": 0,
        "explanation": "Total = 10C5 = 252. Remove 0 women (6C5 = 6) and 1 woman (4C1 x 6C4 = 60). 252 - 66 = 186.",
        "level": "Hard"
      },
      {
        "q": "In how many ways can the letters of the word MATHEMATICS be arranged?",
        "options": [
          "39916800",
          "9979200",
          "4989600",
          "1663200"
        ],
        "answer": 2,
        "explanation": "11 letters; M, A, T each appear twice: 11!/(2! x 2! x 2!) = 4989600.",
        "level": "Hard"
      },
      {
        "q": "How many 4-digit even numbers can be formed using the digits 0, 1, 2, 3, 4, 5, 6 if no digit is repeated?",
        "options": [
          "360",
          "480",
          "420",
          "400"
        ],
        "answer": 2,
        "explanation": "Ending in 0: 6 x 5 x 4 = 120. Ending in 2, 4 or 6: first digit has 5 choices (not 0, not the last digit), then 5 x 4: 3 x 5 x 5 x 4 = 300. Total = 420.",
        "level": "Hard"
      }
    ]
  },
  {
    "id": "probability",
    "section": "Quantitative Aptitude",
    "title": "Probability",
    "icon": "🎲",
    "summary": "Probability measures how likely an event is, from 0 (impossible) to 1 (certain). Questions use coins, dice, cards and balls.",
    "concepts": [
      {
        "heading": "Basic definition",
        "content": "Probability = Number of favourable outcomes / Total number of outcomes. All outcomes must be equally likely."
      },
      {
        "heading": "Common sample spaces",
        "content": "One coin: 2 outcomes. n coins: 2^n. One die: 6 outcomes. Two dice: 36. A deck has 52 cards: 4 suits of 13; 26 red and 26 black; 4 kings, 4 queens, 4 jacks, 4 aces."
      },
      {
        "heading": "Complement",
        "content": "P(not A) = 1 - P(A). For \"at least one\" questions, it is usually easier to find 1 - P(none)."
      },
      {
        "heading": "OR and AND",
        "content": "P(A or B) = P(A) + P(B) - P(A and B). For independent events, P(A and B) = P(A) x P(B)."
      },
      {
        "heading": "Drawing without replacement",
        "content": "When balls or cards are drawn together (or without putting back), count using combinations: favourable selections / total selections."
      }
    ],
    "formulas": [
      "P(E) = Favourable outcomes / Total outcomes",
      "0 ≤ P(E) ≤ 1",
      "P(not E) = 1 - P(E)",
      "P(A or B) = P(A) + P(B) - P(A and B)",
      "Independent events: P(A and B) = P(A) x P(B)",
      "P(at least one) = 1 - P(none)"
    ],
    "shortcuts": [
      {
        "trick": "For \"at least one\", subtract the \"none\" case from 1.",
        "example": "Two coins, at least one head: 1 - P(TT) = 1 - 1/4 = 3/4."
      },
      {
        "trick": "Two dice sums: sum 7 has the most ways (6). Sums 6 and 8 have 5 ways each, 5 and 9 have 4, and so on.",
        "example": "P(sum = 8) = 5/36."
      },
      {
        "trick": "Target hit by at least one shooter = 1 - product of miss probabilities.",
        "example": "A hits 1/3, B hits 1/4: 1 - (2/3)(3/4) = 1/2."
      }
    ],
    "examples": [
      {
        "q": "Two dice are thrown. What is the probability that the sum is 7?",
        "solution": "Step 1: Total outcomes = 36.\nStep 2: Favourable: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6.\nStep 3: P = 6/36 = 1/6.\nAnswer: 1/6"
      },
      {
        "q": "A bag has 4 red and 6 white balls. Two balls are drawn at random. Find the probability that both are red.",
        "solution": "Step 1: Total ways = 10C2 = 45.\nStep 2: Both red = 4C2 = 6.\nStep 3: P = 6/45 = 2/15.\nAnswer: 2/15"
      },
      {
        "q": "One card is drawn from a pack of 52. Find the probability that it is a red card or a king.",
        "solution": "Step 1: Red cards = 26, kings = 4, red kings = 2.\nStep 2: Favourable = 26 + 4 - 2 = 28.\nStep 3: P = 28/52 = 7/13.\nAnswer: 7/13"
      },
      {
        "q": "Three coins are tossed. What is the probability of getting exactly 2 heads?",
        "solution": "Step 1: Total outcomes = 8.\nStep 2: Favourable: HHT, HTH, THH = 3.\nAnswer: 3/8"
      }
    ],
    "questions": [
      {
        "q": "A die is rolled once. What is the probability of getting a number greater than 4?",
        "options": [
          "1/2",
          "1/3",
          "2/3",
          "1/6"
        ],
        "answer": 1,
        "explanation": "Favourable: 5, 6 = 2 outcomes. P = 2/6 = 1/3.",
        "level": "Easy"
      },
      {
        "q": "One card is drawn from a well-shuffled pack of 52 cards. What is the probability that it is a king?",
        "options": [
          "1/13",
          "1/52",
          "1/4",
          "4/13"
        ],
        "answer": 0,
        "explanation": "There are 4 kings. P = 4/52 = 1/13.",
        "level": "Easy"
      },
      {
        "q": "Two coins are tossed together. What is the probability of getting at least one head?",
        "options": [
          "1/2",
          "1/4",
          "3/4",
          "2/3"
        ],
        "answer": 2,
        "explanation": "Outcomes: HH, HT, TH, TT. At least one head in 3. P = 3/4.",
        "level": "Easy"
      },
      {
        "q": "A bag has 5 red and 3 blue balls. One ball is drawn at random. What is the probability that it is red?",
        "options": [
          "3/8",
          "5/8",
          "5/3",
          "1/2"
        ],
        "answer": 1,
        "explanation": "P = 5/(5 + 3) = 5/8.",
        "level": "Easy"
      },
      {
        "q": "A die is rolled once. What is the probability of getting an even number?",
        "options": [
          "1/3",
          "2/3",
          "1/6",
          "1/2"
        ],
        "answer": 3,
        "explanation": "Even numbers: 2, 4, 6. P = 3/6 = 1/2.",
        "level": "Easy"
      },
      {
        "q": "Two dice are thrown together. What is the probability that the sum is 7?",
        "options": [
          "7/36",
          "1/12",
          "5/36",
          "1/6"
        ],
        "answer": 3,
        "explanation": "6 favourable outcomes out of 36. P = 1/6.",
        "level": "Easy"
      },
      {
        "q": "Two dice are thrown together. What is the probability that the sum is 10 or more?",
        "options": [
          "1/12",
          "1/6",
          "5/36",
          "1/4"
        ],
        "answer": 1,
        "explanation": "Sum 10: 3 ways, 11: 2 ways, 12: 1 way. Total 6. P = 6/36 = 1/6.",
        "level": "Medium"
      },
      {
        "q": "A bag has 4 red and 6 white balls. Two balls are drawn at random. What is the probability that both are red?",
        "options": [
          "2/15",
          "4/25",
          "1/5",
          "2/5"
        ],
        "answer": 0,
        "explanation": "4C2/10C2 = 6/45 = 2/15.",
        "level": "Medium"
      },
      {
        "q": "Three coins are tossed. What is the probability of getting exactly 2 heads?",
        "options": [
          "1/2",
          "3/8",
          "1/4",
          "2/3"
        ],
        "answer": 1,
        "explanation": "HHT, HTH, THH = 3 out of 8. P = 3/8.",
        "level": "Medium"
      },
      {
        "q": "One card is drawn from a pack of 52 cards. What is the probability that it is either a red card or a king?",
        "options": [
          "15/26",
          "1/2",
          "8/13",
          "7/13"
        ],
        "answer": 3,
        "explanation": "Red = 26, kings = 4, red kings = 2. Favourable = 28. P = 28/52 = 7/13.",
        "level": "Medium"
      },
      {
        "q": "The probability that A hits a target is 1/3 and that B hits it is 1/4. If both shoot once, what is the probability that the target is hit?",
        "options": [
          "1/2",
          "7/12",
          "1/12",
          "5/12"
        ],
        "answer": 0,
        "explanation": "P(both miss) = 2/3 x 3/4 = 1/2. P(hit) = 1 - 1/2 = 1/2.",
        "level": "Medium"
      },
      {
        "q": "A number is chosen at random from 1 to 30. What is the probability that it is a multiple of 3 or 5?",
        "options": [
          "8/15",
          "1/2",
          "7/15",
          "2/5"
        ],
        "answer": 2,
        "explanation": "Multiples of 3: 10, of 5: 6, of 15: 2. Favourable = 14. P = 14/30 = 7/15.",
        "level": "Medium"
      },
      {
        "q": "A bag has 5 red, 4 blue and 3 green balls. Three balls are drawn at random. What is the probability that all three are of different colours?",
        "options": [
          "1/4",
          "5/22",
          "3/11",
          "3/22"
        ],
        "answer": 2,
        "explanation": "Favourable = 5 x 4 x 3 = 60. Total = 12C3 = 220. P = 60/220 = 3/11.",
        "level": "Hard"
      },
      {
        "q": "Two cards are drawn together from a pack of 52 cards. What is the probability that both are aces?",
        "options": [
          "1/221",
          "1/169",
          "1/26",
          "2/221"
        ],
        "answer": 0,
        "explanation": "4C2/52C2 = 6/1326 = 1/221.",
        "level": "Hard"
      },
      {
        "q": "The letters of the word ORANGE are arranged at random. What is the probability that all the vowels come together?",
        "options": [
          "1/6",
          "1/4",
          "1/3",
          "1/5"
        ],
        "answer": 3,
        "explanation": "Vowels O, A, E as one block: 4! x 3! = 144 arrangements. Total = 6! = 720. P = 144/720 = 1/5.",
        "level": "Hard"
      }
    ]
  },
  {
    "id": "mixtures-alligation",
    "section": "Quantitative Aptitude",
    "title": "Mixtures & Alligation",
    "icon": "🧪",
    "summary": "Alligation is a quick method to find the ratio in which two items of different prices or strengths must be mixed to get a desired mean value.",
    "concepts": [
      {
        "heading": "Mean price",
        "content": "When two things are mixed, the price of the mixture lies between the two prices. Mean price = total cost / total quantity."
      },
      {
        "heading": "Rule of alligation",
        "content": "Quantity of cheaper : Quantity of dearer = (Dearer price - Mean price) : (Mean price - Cheaper price). Write the two prices on top, the mean in the middle, and cross-subtract."
      },
      {
        "heading": "Adding water or a component",
        "content": "When water is added to milk, the amount of milk does not change. Use the unchanged part to find the new total."
      },
      {
        "heading": "Repeated replacement",
        "content": "If x litres are taken out of V litres and replaced with water, n times, the pure liquid left = V x (1 - x/V)^n."
      }
    ],
    "formulas": [
      "Cheaper : Dearer = (d - m) : (m - c)",
      "Mean price = (c1 x q1 + c2 x q2) / (q1 + q2)",
      "Liquid left after n replacements = V (1 - x/V)^n",
      "Water is free: price of water = ₹0 in alligation",
      "Fraction of a mixture replaced = (original strength - new strength) / (original strength - added strength)"
    ],
    "shortcuts": [
      {
        "trick": "Alligation cross: put c and d on top, m in the middle, write d - m under c and m - c under d.",
        "example": "₹20 and ₹30 rice for ₹24: (30 - 24):(24 - 20) = 6:4 = 3:2."
      },
      {
        "trick": "For water added to milk, treat water as cost ₹0.",
        "example": "Milk ₹60/L, mixture worth ₹50/L: water:milk = (60 - 50):(50 - 0) = 1:5."
      },
      {
        "trick": "Keep the unchanged quantity fixed when adding something.",
        "example": "60 L of milk:water 2:1 has 40 L milk. For 1:1, water should be 40 L, so add 20 L."
      }
    ],
    "examples": [
      {
        "q": "In what ratio should rice at ₹20/kg be mixed with rice at ₹30/kg to get a mixture worth ₹24/kg?",
        "solution": "Step 1: Cheaper : Dearer = (30 - 24) : (24 - 20) = 6 : 4.\nStep 2: Simplify to 3 : 2.\nAnswer: 3 : 2"
      },
      {
        "q": "A container has 80 litres of milk. 8 litres are taken out and replaced with water. This is done twice. How much milk is left?",
        "solution": "Step 1: Milk left = 80 x (1 - 8/80)^2.\nStep 2: = 80 x 0.81 = 64.8.\nAnswer: 64.8 litres"
      },
      {
        "q": "How much water must be added to 60 litres of milk-water mixture (2:1) to make the ratio 1:1?",
        "solution": "Step 1: Milk = 40 L, water = 20 L.\nStep 2: For 1:1, water must be 40 L.\nStep 3: Add 40 - 20 = 20 L.\nAnswer: 20 litres"
      },
      {
        "q": "A milkman buys milk at ₹40/L, adds water, and sells the mixture at ₹45/L making a 35% profit. Find the ratio of water to milk.",
        "solution": "Step 1: Cost of 1 L mixture = 45/1.35 = ₹33.33 (100/3).\nStep 2: Alligation with milk ₹40 and water ₹0: water : milk = (40 - 100/3) : (100/3 - 0) = (20/3) : (100/3) = 1 : 5.\nAnswer: 1 : 5"
      }
    ],
    "questions": [
      {
        "q": "In what ratio must rice at ₹20/kg be mixed with rice at ₹30/kg to get a mixture worth ₹24/kg?",
        "options": [
          "2:3",
          "3:1",
          "3:2",
          "1:1"
        ],
        "answer": 2,
        "explanation": "Cheaper : Dearer = (30 - 24):(24 - 20) = 6:4 = 3:2.",
        "level": "Easy"
      },
      {
        "q": "10 kg of tea at ₹40/kg is mixed with 15 kg of tea at ₹50/kg. What is the price of the mixture per kg?",
        "options": [
          "₹45",
          "₹46",
          "₹44",
          "₹48"
        ],
        "answer": 1,
        "explanation": "Total cost = 400 + 750 = 1150. Price = 1150/25 = ₹46 per kg.",
        "level": "Easy"
      },
      {
        "q": "A 40-litre mixture contains milk and water in the ratio 3:1. How much water is in it?",
        "options": [
          "30 litres",
          "13.33 litres",
          "12 litres",
          "10 litres"
        ],
        "answer": 3,
        "explanation": "Water = 1/4 x 40 = 10 litres.",
        "level": "Easy"
      },
      {
        "q": "A 20-litre mixture contains 25% alcohol. How many litres of alcohol does it contain?",
        "options": [
          "4 litres",
          "15 litres",
          "2.5 litres",
          "5 litres"
        ],
        "answer": 3,
        "explanation": "Alcohol = 25% of 20 = 5 litres.",
        "level": "Easy"
      },
      {
        "q": "Tea at ₹120/kg and ₹150/kg is mixed in the ratio 1:2. What is the price of the mixture per kg?",
        "options": [
          "₹135",
          "₹140",
          "₹130",
          "₹145"
        ],
        "answer": 1,
        "explanation": "Price = (120 x 1 + 150 x 2)/3 = 420/3 = ₹140.",
        "level": "Easy"
      },
      {
        "q": "In what ratio must water be mixed with milk costing ₹60 per litre to get a mixture worth ₹50 per litre?",
        "options": [
          "1:5",
          "5:1",
          "1:6",
          "1:4"
        ],
        "answer": 0,
        "explanation": "Water costs ₹0. Water : Milk = (60 - 50):(50 - 0) = 10:50 = 1:5.",
        "level": "Easy"
      },
      {
        "q": "A 60-litre mixture has milk and water in the ratio 2:1. How much water must be added to make the ratio 1:1?",
        "options": [
          "10 litres",
          "20 litres",
          "30 litres",
          "40 litres"
        ],
        "answer": 1,
        "explanation": "Milk = 40 L, water = 20 L. For 1:1, water must be 40 L. Add 20 litres.",
        "level": "Medium"
      },
      {
        "q": "A container has 80 litres of pure milk. 8 litres of milk is taken out and replaced with water. This process is done one more time. How much milk is now in the container?",
        "options": [
          "64 litres",
          "72 litres",
          "65.6 litres",
          "64.8 litres"
        ],
        "answer": 3,
        "explanation": "Milk left = 80 x (1 - 8/80)^2 = 80 x 0.81 = 64.8 litres.",
        "level": "Medium"
      },
      {
        "q": "Alloy A has gold and copper in the ratio 3:2 and alloy B has them in the ratio 1:4. Equal weights of A and B are melted together. What is the ratio of gold to copper in the new alloy?",
        "options": [
          "2:3",
          "1:1",
          "4:1",
          "3:2"
        ],
        "answer": 0,
        "explanation": "Take 5 kg of each. Gold = 3 + 1 = 4 kg, copper = 2 + 4 = 6 kg. Ratio = 4:6 = 2:3.",
        "level": "Medium"
      },
      {
        "q": "A shopkeeper mixes two types of rice costing ₹50/kg and ₹70/kg in the ratio 3:2. He sells the mixture at ₹69.60/kg. What is his profit percent?",
        "options": [
          "15%",
          "18%",
          "20%",
          "25%"
        ],
        "answer": 2,
        "explanation": "Cost price of mixture = (3 x 50 + 2 x 70)/5 = 290/5 = ₹58/kg. Profit = 11.60/58 x 100 = 20%.",
        "level": "Medium"
      },
      {
        "q": "How many kg of sugar costing ₹36/kg must be mixed with 24 kg of sugar costing ₹48/kg so that the mixture costs ₹42/kg?",
        "options": [
          "18 kg",
          "30 kg",
          "24 kg",
          "36 kg"
        ],
        "answer": 2,
        "explanation": "Ratio = (48 - 42):(42 - 36) = 1:1. So 24 kg is needed.",
        "level": "Medium"
      },
      {
        "q": "A 30-litre mixture of milk and water contains 20% water. How much water must be added to make water 25% of the new mixture?",
        "options": [
          "2 litres",
          "1.5 litres",
          "3 litres",
          "2.5 litres"
        ],
        "answer": 0,
        "explanation": "Milk = 24 L. In the new mixture milk is 75%, so total = 32 L. Water to add = 32 - 30 = 2 litres.",
        "level": "Medium"
      },
      {
        "q": "A jar is full of whisky with 40% alcohol. A part of it is replaced by another whisky with 19% alcohol, and now the jar has 26% alcohol. What fraction of the whisky was replaced?",
        "options": [
          "1/3",
          "3/5",
          "2/5",
          "2/3"
        ],
        "answer": 3,
        "explanation": "Alligation: (40 - 26):(26 - 19) = 14:7 = 2:1 is the ratio of the new (19%) whisky to the old (40%) whisky. So 2/3 of the jar was replaced.",
        "level": "Hard"
      },
      {
        "q": "Vessel A has milk and water in the ratio 3:1, and vessel B has them in the ratio 5:3. In what ratio should the contents of A and B be mixed to get a mixture with milk and water in the ratio 2:1?",
        "options": [
          "2:1",
          "1:2",
          "1:1",
          "3:2"
        ],
        "answer": 1,
        "explanation": "Milk fraction: A = 3/4, B = 5/8, target = 2/3. A : B = (2/3 - 5/8):(3/4 - 2/3) = (1/24):(1/12) = 1:2.",
        "level": "Hard"
      },
      {
        "q": "A milkman buys milk at ₹40 per litre, adds some water and sells the mixture at ₹45 per litre. He makes a profit of 35%. What is the ratio of water to milk in the mixture?",
        "options": [
          "1:5",
          "1:4",
          "1:6",
          "2:9"
        ],
        "answer": 0,
        "explanation": "Cost of 1 litre of mixture = 45/1.35 = 100/3. Water (₹0) : Milk (₹40) = (40 - 100/3):(100/3 - 0) = 20/3 : 100/3 = 1:5.",
        "level": "Hard"
      }
    ]
  },
  {
    "id": "data-interpretation",
    "section": "Quantitative Aptitude",
    "title": "Data Interpretation",
    "icon": "📊",
    "summary": "Data Interpretation (DI) gives data in a table or chart and asks questions using percentages, ratios and averages. Speed in calculation matters most.",
    "concepts": [
      {
        "heading": "Read the data first",
        "content": "Spend 20-30 seconds understanding what each row and column means and the units used (lakh, crore, thousands, %). Many mistakes come from wrong units."
      },
      {
        "heading": "Percentage change and growth",
        "content": "Growth from year 1 to year 2 = (Value2 - Value1) / Value1 x 100. Always divide by the earlier (base) value."
      },
      {
        "heading": "Share of total",
        "content": "To find what percent one item is of the total, divide the item by the sum of all items and multiply by 100."
      },
      {
        "heading": "Ratios and averages",
        "content": "Ratios compare two items directly; simplify by dividing by the HCF. Average = total of the values / number of values."
      },
      {
        "heading": "Approximation",
        "content": "When options are far apart, round the numbers to save time. When options are close, calculate exactly."
      }
    ],
    "formulas": [
      "Percentage change = (New - Old) / Old x 100",
      "Percentage share = Part / Total x 100",
      "Average = Sum of values / Number of values",
      "A is what % more than B = (A - B) / B x 100",
      "Value from a percentage share = Share% x Total / 100",
      "Profit % = (Income - Expenditure) / Expenditure x 100"
    ],
    "shortcuts": [
      {
        "trick": "Compare growth by fractions: a bigger change on a smaller base means higher growth.",
        "example": "120 to 150 is +30/120 = 25%; 135 to 180 is +45/135 = 33.33%. Second is higher."
      },
      {
        "trick": "Use percentage-to-fraction for pie data.",
        "example": "25% of ₹40,000 = 40000/4 = ₹10,000."
      },
      {
        "trick": "Difference of two percentages of the same total = (difference of %) x total.",
        "example": "Rent 30% and Travel 10% of ₹40,000: difference = 20% of 40000 = ₹8,000."
      },
      {
        "trick": "For ratios, divide by a common factor before simplifying.",
        "example": "IT : MECH = 180 : 120 = 3 : 2 (divide by 60)."
      }
    ],
    "examples": [
      {
        "q": "Annual sales of a company (in ₹ lakh): 2019 = 120, 2020 = 150, 2021 = 135, 2022 = 180, 2023 = 200. What is the percentage increase in sales from 2021 to 2022?",
        "solution": "Step 1: Increase = 180 - 135 = 45.\nStep 2: % increase = 45/135 x 100 = 33.33%.\nAnswer: 33.33%"
      },
      {
        "q": "Number of students in five departments of a college: CSE = 240, IT = 180, ECE = 150, MECH = 120, CIVIL = 110. What percent of all students are in ECE?",
        "solution": "Step 1: Total = 240 + 180 + 150 + 120 + 110 = 800.\nStep 2: ECE share = 150/800 x 100 = 18.75%.\nAnswer: 18.75%"
      },
      {
        "q": "A family spends its monthly budget of ₹40,000 as follows: Rent 30%, Food 25%, Education 15%, Travel 10%, Savings 20%. How much does the family spend on education and travel together?",
        "solution": "Step 1: Education + Travel = 15% + 10% = 25%.\nStep 2: 25% of 40000 = 10000.\nAnswer: ₹10,000"
      },
      {
        "q": "Marks of a student (each out of 100): Maths 90, Science 84, English 75, Computer 95. Find the average marks.",
        "solution": "Step 1: Total = 90 + 84 + 75 + 95 = 344.\nStep 2: Average = 344/4 = 86.\nAnswer: 86"
      }
    ],
    "questions": [
      {
        "q": "Annual sales of a company (in ₹ lakh): 2019 = 120, 2020 = 150, 2021 = 135, 2022 = 180, 2023 = 200. What is the percentage increase in sales from 2019 to 2020?",
        "options": [
          "30%",
          "20%",
          "15%",
          "25%"
        ],
        "answer": 3,
        "explanation": "Increase = 30. 30/120 x 100 = 25%.",
        "level": "Easy"
      },
      {
        "q": "Number of students in five departments of a college: CSE = 240, IT = 180, ECE = 150, MECH = 120, CIVIL = 110. What percent of the total students are in CSE?",
        "options": [
          "24%",
          "25%",
          "32%",
          "30%"
        ],
        "answer": 3,
        "explanation": "Total = 800. CSE = 240/800 x 100 = 30%.",
        "level": "Easy"
      },
      {
        "q": "A family spends its monthly budget of ₹40,000 as follows: Rent 30%, Food 25%, Education 15%, Travel 10%, Savings 20%. How much money is spent on food?",
        "options": [
          "₹12,000",
          "₹10,000",
          "₹8,000",
          "₹25,000"
        ],
        "answer": 1,
        "explanation": "Food = 25% of 40000 = ₹10,000.",
        "level": "Easy"
      },
      {
        "q": "Annual sales of a company (in ₹ lakh): 2019 = 120, 2020 = 150, 2021 = 135, 2022 = 180, 2023 = 200. What are the average annual sales over the five years?",
        "options": [
          "₹157 lakh",
          "₹150 lakh",
          "₹160 lakh",
          "₹165 lakh"
        ],
        "answer": 0,
        "explanation": "Total = 785. Average = 785/5 = ₹157 lakh.",
        "level": "Easy"
      },
      {
        "q": "Number of students in five departments of a college: CSE = 240, IT = 180, ECE = 150, MECH = 120, CIVIL = 110. What is the ratio of IT students to MECH students?",
        "options": [
          "2:3",
          "3:2",
          "4:3",
          "3:1"
        ],
        "answer": 1,
        "explanation": "IT : MECH = 180 : 120 = 3 : 2.",
        "level": "Easy"
      },
      {
        "q": "A family spends its monthly budget of ₹40,000 as follows: Rent 30%, Food 25%, Education 15%, Travel 10%, Savings 20%. How much more is spent on rent than on travel?",
        "options": [
          "₹4,000",
          "₹12,000",
          "₹10,000",
          "₹8,000"
        ],
        "answer": 3,
        "explanation": "Difference = (30% - 10%) of 40000 = 20% of 40000 = ₹8,000.",
        "level": "Easy"
      },
      {
        "q": "Annual sales of a company (in ₹ lakh): 2019 = 120, 2020 = 150, 2021 = 135, 2022 = 180, 2023 = 200. What is the percentage decrease in sales from 2020 to 2021?",
        "options": [
          "10%",
          "15%",
          "11.11%",
          "12%"
        ],
        "answer": 0,
        "explanation": "Decrease = 15. 15/150 x 100 = 10%.",
        "level": "Medium"
      },
      {
        "q": "Annual sales of a company (in ₹ lakh): 2019 = 120, 2020 = 150, 2021 = 135, 2022 = 180, 2023 = 200. In which year was the percentage growth in sales over the previous year the highest?",
        "options": [
          "2020",
          "2023",
          "2022",
          "2021"
        ],
        "answer": 2,
        "explanation": "Growth: 2020 = 25%, 2021 = -10%, 2022 = 45/135 = 33.33%, 2023 = 20/180 = 11.11%. Highest is 2022.",
        "level": "Medium"
      },
      {
        "q": "Number of students in five departments of a college: CSE = 240, IT = 180, ECE = 150, MECH = 120, CIVIL = 110. If 25% of CSE students and 20% of IT students are girls, how many girls are there in CSE and IT together?",
        "options": [
          "84",
          "105",
          "96",
          "90"
        ],
        "answer": 2,
        "explanation": "CSE girls = 60, IT girls = 36. Total = 96.",
        "level": "Medium"
      },
      {
        "q": "A family spends its monthly budget of ₹40,000 as follows: Rent 30%, Food 25%, Education 15%, Travel 10%, Savings 20%. If the monthly budget increases by 10% and the percentage split stays the same, what will be the new spending on food?",
        "options": [
          "₹11,000",
          "₹10,500",
          "₹12,500",
          "₹11,500"
        ],
        "answer": 0,
        "explanation": "New budget = 44000. Food = 25% of 44000 = ₹11,000.",
        "level": "Medium"
      },
      {
        "q": "Quarterly production of a factory (units): Q1 = 400, Q2 = 500, Q3 = 450, Q4 = 650. What percent of the year's total production was made in Q4?",
        "options": [
          "30%",
          "35%",
          "28.5%",
          "32.5%"
        ],
        "answer": 3,
        "explanation": "Total = 2000. Q4 share = 650/2000 x 100 = 32.5%.",
        "level": "Medium"
      },
      {
        "q": "Marks of a student (each subject out of 100): Maths 85, Science 78, English 72, Hindi 65, Social Science 80. What is his overall percentage?",
        "options": [
          "78%",
          "76%",
          "75%",
          "74%"
        ],
        "answer": 1,
        "explanation": "Total = 380 out of 500. Percentage = 380/500 x 100 = 76%.",
        "level": "Medium"
      },
      {
        "q": "Annual sales of a company (in ₹ lakh): 2019 = 120, 2020 = 150, 2021 = 135, 2022 = 180, 2023 = 200. By what percent are the sales of 2023 more than the average sales of 2019, 2020 and 2021?",
        "options": [
          "48.15%",
          "40%",
          "33.33%",
          "52.5%"
        ],
        "answer": 0,
        "explanation": "Average of 2019-2021 = (120 + 150 + 135)/3 = 135. (200 - 135)/135 x 100 = 48.15%.",
        "level": "Hard"
      },
      {
        "q": "Profit % of a company = (Income - Expenditure) / Expenditure x 100. In 2022 the expenditure was ₹250 crore and the profit was 20%. In 2023 the income was ₹360 crore and the profit was 20%. What is the ratio of expenditure in 2022 to expenditure in 2023?",
        "options": [
          "6:5",
          "25:36",
          "5:6",
          "2:3"
        ],
        "answer": 2,
        "explanation": "2023 expenditure = 360/1.2 = ₹300 crore. Ratio = 250 : 300 = 5 : 6.",
        "level": "Hard"
      },
      {
        "q": "Number of students in five departments of a college: CSE = 240, IT = 180, ECE = 150, MECH = 120, CIVIL = 110. If the number of CSE students grows by 10% every year for 2 years and all other departments stay the same, what percent of the total students will be in CSE after 2 years? (Rounded to two decimals)",
        "options": [
          "33.00%",
          "34.15%",
          "36.30%",
          "32.40%"
        ],
        "answer": 1,
        "explanation": "CSE after 2 years = 240 x 1.1 x 1.1 = 290.4. Others = 560. Total = 850.4. Share = 290.4/850.4 x 100 = 34.15%.",
        "level": "Hard"
      }
    ]
  }
];
