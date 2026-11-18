export default {
  id: "extra-10-math-random-statistics-decimal-fractions",
  title: "math, random, statistics, decimal and fractions",
  module: "Module 2: Standard Library Power Tools",
  extraNo: 10,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Do numeric work correctly with the standard library: math functions and constants, safe float comparison with isclose, reproducible random data with seeds, secure tokens with secrets, descriptive statistics (mean, median, mode, stdev), exact money calculations with Decimal and exact ratios with Fraction.",
  objectives: [
    "Use math functions: sqrt, ceil, floor, gcd, lcm, factorial, comb, isclose, prod",
    "Generate reproducible random data and know when to use secrets instead",
    "Compute mean, median, mode, stdev and quantiles with statistics",
    "Explain floating-point errors and fix money calculations with Decimal",
    "Represent exact rational numbers with Fraction",
  ],
  theory: [
    {
      heading: "The math Module",
      content: "`math` provides fast functions for real (float) numbers. Constants: `math.pi`, `math.e`, `math.inf`, `math.nan`, `math.tau`. Rounding: `ceil` (up), `floor` (down), `trunc` (toward zero). Powers and roots: `sqrt`, `isqrt` (integer square root), `pow`, `exp`, `log(x, base)`, `log10`, `log2`. Integer helpers: `gcd`, `lcm` (3.9+), `factorial`, `comb`, `perm`. Aggregates: `fsum` (accurate float sum), `prod`, `dist`, `hypot`. Trigonometry works in radians: `sin`, `cos`, `radians`, `degrees`.",
      syntax: `import math
math.ceil(4.1), math.floor(4.9), math.trunc(-4.9)   # (5, 4, -4)
math.gcd(12, 18), math.lcm(4, 6)                   # (6, 12)
math.isclose(0.1 + 0.2, 0.3)                       # True
`,
      tip: "Built-in round() uses banker's rounding: round(2.5) is 2 and round(3.5) is 4. For commercial rounding use Decimal with ROUND_HALF_UP.",
    },
    {
      heading: "Floating-point Pitfalls",
      content: `Floats are stored in binary (IEEE 754 double precision). Many decimal fractions like 0.1 cannot be represented exactly, so \`0.1 + 0.2\` gives \`0.30000000000000004\` and \`0.1 + 0.2 == 0.3\` is False. This is not a Python bug - every language using doubles behaves the same.

Fixes: compare with \`math.isclose(a, b, rel_tol=1e-9, abs_tol=0.0)\`, round for display, use \`math.fsum\` for long sums, and use \`Decimal\` for money where exact decimal results are required.`,
    },
    {
      heading: "random: Pseudo-random Numbers",
      content: `\`random\` generates pseudo-random numbers using the Mersenne Twister algorithm. Common functions: \`random()\` float in [0, 1), \`randint(a, b)\` inclusive of both ends, \`randrange(start, stop, step)\`, \`uniform(a, b)\`, \`choice(seq)\`, \`choices(seq, weights=..., k=n)\` (with replacement), \`sample(seq, k)\` (without replacement), \`shuffle(list)\` (in place), \`gauss(mu, sigma)\`.

\`random.seed(42)\` makes the sequence **reproducible** - essential for tests, simulations and ML experiments. You can also create independent generators with \`random.Random(seed)\`.`,
      tip: "Never use random for passwords, OTPs or tokens - it is predictable. Use the `secrets` module: secrets.token_hex(16), secrets.randbelow(10), secrets.choice(alphabet).",
    },
    {
      heading: "statistics: Descriptive Statistics",
      content: "The `statistics` module computes common measures without NumPy: `mean`, `fmean` (fast float mean), `median`, `median_low`/`median_high`, `mode`, `multimode`, `stdev` and `variance` (sample, divides by n-1), `pstdev` and `pvariance` (population, divides by n), `quantiles(data, n=4)` for quartiles, `correlation` and `linear_regression` (3.10+). Empty data raises `StatisticsError`.",
      points: [
        "Mean is affected by outliers; median is robust",
        "Use sample stdev when data is a sample of a larger population",
        "mode returns the first mode for multimodal data; multimode returns all",
      ],
    },
    {
      heading: "decimal: Exact Decimal Arithmetic",
      content: `\`Decimal\` stores numbers in base 10, so \`Decimal('0.1') + Decimal('0.2') == Decimal('0.3')\` is True. It is the right choice for money, tax and billing. Always create Decimals from **strings** (or ints): \`Decimal(0.1)\` copies the float's binary error and gives 0.1000000000000000055511151231257827...

Use \`quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)\` to round to paise/cents. The context (\`getcontext().prec\`, default 28 significant digits) controls precision. Decimals cannot be mixed with floats in arithmetic (TypeError), only with ints.`,
      syntax: `from decimal import Decimal, ROUND_HALF_UP
price = Decimal("199.99")
gst = (price * Decimal("0.18")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
`,
    },
    {
      heading: "fractions: Exact Rational Numbers",
      content: "`Fraction(numerator, denominator)` represents exact ratios and is always reduced to lowest terms: `Fraction(6, 8)` is `3/4`. Arithmetic stays exact: `Fraction(1, 3) + Fraction(1, 6)` = `1/2`. You can build fractions from strings (`Fraction('0.25')`) and from floats (exactly, showing the binary value). `limit_denominator(n)` finds the closest simple fraction. Useful for recipes, probability, music timing and unit conversion where exact ratios matter.",
    },
  ],
  examples: [
    {
      title: "math Toolbox for Everyday Problems",
      scenario: "A logistics app calculates boxes needed, distances and team sizes.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import math

items, per_box = 47, 10
print("Boxes needed:", math.ceil(items / per_box))
print("Full boxes  :", math.floor(items / per_box), "| leftover:", items % per_box)

print("Distance:", math.dist((0, 0), (3, 4)), "| hypot:", math.hypot(6, 8))
print("Circle area r=7:", round(math.pi * 7 ** 2, 2))
print("sqrt(50) =", round(math.sqrt(50), 4), "| isqrt(50) =", math.isqrt(50))
print("gcd/lcm:", math.gcd(48, 36), math.lcm(4, 6, 10))
print("5! =", math.factorial(5), "| C(10,3) =", math.comb(10, 3))
print("log2(1024) =", math.log2(1024), "| log(1000,10) =", round(math.log(1000, 10), 6))
print("prod:", math.prod([2, 3, 4]))
print("trunc vs floor:", math.trunc(-3.7), math.floor(-3.7))
print("round() banker's:", round(2.5), round(3.5), round(0.125, 2))
print("sin 30deg:", round(math.sin(math.radians(30)), 3))
print(math.inf > 10**100, math.isnan(math.nan), math.nan == math.nan)
`,
      python: {
        files: {
          "main.py": `import math

items, per_box = 47, 10
print("Boxes needed:", math.ceil(items / per_box))
print("Full boxes  :", math.floor(items / per_box), "| leftover:", items % per_box)

print("Distance:", math.dist((0, 0), (3, 4)), "| hypot:", math.hypot(6, 8))
print("Circle area r=7:", round(math.pi * 7 ** 2, 2))
print("sqrt(50) =", round(math.sqrt(50), 4), "| isqrt(50) =", math.isqrt(50))
print("gcd/lcm:", math.gcd(48, 36), math.lcm(4, 6, 10))
print("5! =", math.factorial(5), "| C(10,3) =", math.comb(10, 3))
print("log2(1024) =", math.log2(1024), "| log(1000,10) =", round(math.log(1000, 10), 6))
print("prod:", math.prod([2, 3, 4]))
print("trunc vs floor:", math.trunc(-3.7), math.floor(-3.7))
print("round() banker's:", round(2.5), round(3.5), round(0.125, 2))
print("sin 30deg:", round(math.sin(math.radians(30)), 3))
print(math.inf > 10**100, math.isnan(math.nan), math.nan == math.nan)
`,
        },
      },
      result: `Boxes needed: 5
Full boxes  : 4 | leftover: 7
Distance: 5.0 | hypot: 10.0
Circle area r=7: 153.94
sqrt(50) = 7.0711 | isqrt(50) = 7
gcd/lcm: 12 60
5! = 120 | C(10,3) = 120
log2(1024) = 10.0 | log(1000,10) = 3.0
prod: 24
trunc vs floor: -3 -4
round() banker's: 2 4 0.12
sin 30deg: 0.5
True True False`,
      explanation: "ceil rounds up for boxes; floor and % split full boxes and leftovers. dist/hypot measure distances. isqrt returns an int. round() uses banker's rounding (ties to even) and float representation also affects 0.125. NaN is never equal to itself.",
    },
    {
      title: "Floating-point Errors and isclose",
      scenario: "A tester sees an assertion fail when comparing calculated totals and needs to understand why.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import math

print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
print(math.isclose(0.1 + 0.2, 0.3))
print(f"{0.1:.20f}")

values = [0.1] * 10
total = 0.0
for v in values:
    total += v
print(total, sum(values), math.fsum(values))

print(math.isclose(1000.0, 1000.1, rel_tol=1e-3))
print(math.isclose(1e-10, 0.0))
print(math.isclose(1e-10, 0.0, abs_tol=1e-9))
print(round(2.675, 2), "(stored as", f"{2.675:.20f})")
`,
      python: {
        files: {
          "main.py": `import math

print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
print(math.isclose(0.1 + 0.2, 0.3))
print(f"{0.1:.20f}")

values = [0.1] * 10
total = 0.0
for v in values:
    total += v
print(total, sum(values), math.fsum(values))

print(math.isclose(1000.0, 1000.1, rel_tol=1e-3))
print(math.isclose(1e-10, 0.0))
print(math.isclose(1e-10, 0.0, abs_tol=1e-9))
print(round(2.675, 2), "(stored as", f"{2.675:.20f})")
`,
        },
      },
      result: `0.30000000000000004
False
True
0.10000000000000000555
0.9999999999999999 1.0 1.0
True
False
True
2.67 (stored as 2.67499999999999982236)`,
      explanation: "0.1 is stored as a nearby binary value, so sums accumulate tiny errors. isclose compares with a relative tolerance; near zero you need abs_tol. A plain += loop drifts to 0.9999999999999999, while math.fsum (and, since Python 3.12, the built-in sum, which now uses compensated summation) returns 1.0. 2.675 is actually 2.67499999..., so it rounds to 2.67.",
    },
    {
      title: "Reproducible Random Data and Secure Tokens",
      scenario: "A QA engineer generates the same fake test data every run, picks lucky-draw winners and creates a secure OTP.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import random
import secrets
import string

random.seed(42)
print(random.randint(1, 100), random.randint(1, 100), round(random.random(), 4))

random.seed(42)
print(random.randint(1, 100), random.randint(1, 100), "(same again after re-seeding)")

rng = random.Random(7)
customers = ["Asha", "Ravi", "Meena", "John", "Kiran", "Priya"]
print("Winners:", rng.sample(customers, 2))
print("Pick one:", rng.choice(customers))
print("Weighted:", rng.choices(["A", "B", "C"], weights=[70, 20, 10], k=8))
deck = list(range(1, 11))
rng.shuffle(deck)
print("Shuffled:", deck)
print("Marks:", [round(rng.gauss(70, 10)) for _ in range(5)])

otp = "".join(secrets.choice(string.digits) for _ in range(6))
token = secrets.token_hex(16)
print("OTP length:", len(otp), "| token length:", len(token), "| digits only:", otp.isdigit())
`,
      python: {
        files: {
          "main.py": `import random
import secrets
import string

random.seed(42)
print(random.randint(1, 100), random.randint(1, 100), round(random.random(), 4))

random.seed(42)
print(random.randint(1, 100), random.randint(1, 100), "(same again after re-seeding)")

rng = random.Random(7)
customers = ["Asha", "Ravi", "Meena", "John", "Kiran", "Priya"]
print("Winners:", rng.sample(customers, 2))
print("Pick one:", rng.choice(customers))
print("Weighted:", rng.choices(["A", "B", "C"], weights=[70, 20, 10], k=8))
deck = list(range(1, 11))
rng.shuffle(deck)
print("Shuffled:", deck)
print("Marks:", [round(rng.gauss(70, 10)) for _ in range(5)])

otp = "".join(secrets.choice(string.digits) for _ in range(6))
token = secrets.token_hex(16)
print("OTP length:", len(otp), "| token length:", len(token), "| digits only:", otp.isdigit())
`,
        },
      },
      result: `82 15 0.025
82 15 (same again after re-seeding)
Winners: ['Meena', 'Ravi']
Pick one: John
Weighted: ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A']
Shuffled: [8, 3, 6, 7, 1, 9, 5, 10, 4, 2]
Marks: [61, 65, 73, 70, 75]
OTP length: 6 | token length: 32 | digits only: True`,
      explanation: "Seeding makes random output repeatable, so tests are deterministic. random.Random(7) is an independent seeded generator. sample picks without replacement, choices with replacement and weights. secrets produces unpredictable values (we only print their lengths because they change every run).",
    },
    {
      title: "Analysing Marks with statistics",
      scenario: "A teacher analyses class marks: average, middle value, most common mark, spread and quartiles, and checks the effect of an outlier.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import statistics as st

marks = [56, 72, 72, 85, 90, 64, 72, 88, 95, 41]
print("mean   :", st.mean(marks))
print("median :", st.median(marks))
print("mode   :", st.mode(marks))
print("stdev  :", round(st.stdev(marks), 2), "(sample)")
print("pstdev :", round(st.pstdev(marks), 2), "(population)")
print("quartiles:", st.quantiles(marks, n=4))
print("multimode:", st.multimode([1, 1, 2, 2, 3]))

salaries = [30, 32, 35, 31, 33, 500]
print("salary mean vs median:", round(st.mean(salaries), 1), st.median(salaries))

hours = [2, 4, 5, 7, 9]
scores = [50, 60, 66, 80, 92]
print("correlation:", round(st.correlation(hours, scores), 3))
slope, intercept = st.linear_regression(hours, scores)
print(f"score = {slope:.2f} * hours + {intercept:.2f}")
try:
    st.mean([])
except st.StatisticsError as e:
    print("Error:", e)
`,
      python: {
        files: {
          "main.py": `import statistics as st

marks = [56, 72, 72, 85, 90, 64, 72, 88, 95, 41]
print("mean   :", st.mean(marks))
print("median :", st.median(marks))
print("mode   :", st.mode(marks))
print("stdev  :", round(st.stdev(marks), 2), "(sample)")
print("pstdev :", round(st.pstdev(marks), 2), "(population)")
print("quartiles:", st.quantiles(marks, n=4))
print("multimode:", st.multimode([1, 1, 2, 2, 3]))

salaries = [30, 32, 35, 31, 33, 500]
print("salary mean vs median:", round(st.mean(salaries), 1), st.median(salaries))

hours = [2, 4, 5, 7, 9]
scores = [50, 60, 66, 80, 92]
print("correlation:", round(st.correlation(hours, scores), 3))
slope, intercept = st.linear_regression(hours, scores)
print(f"score = {slope:.2f} * hours + {intercept:.2f}")
try:
    st.mean([])
except st.StatisticsError as e:
    print("Error:", e)
`,
        },
      },
      result: `mean   : 73.5
median : 72.0
mode   : 72
stdev  : 16.79 (sample)
pstdev : 15.93 (population)
quartiles: [62.0, 72.0, 88.5]
multimode: [1, 2]
salary mean vs median: 110.2 32.5
correlation: 0.998
score = 6.12 * hours + 36.53
Error: mean requires at least one data point`,
      explanation: "mean averages, median takes the middle, mode the most frequent. stdev divides by n-1 (sample), pstdev by n. The salary outlier (500) pulls the mean far up while the median stays realistic. correlation and linear_regression need Python 3.10+.",
    },
    {
      title: "Exact Billing with Decimal and Recipes with Fraction",
      scenario: "An invoicing system must calculate GST and totals to the exact paisa; a recipe app scales ingredient quantities.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from decimal import Decimal, ROUND_HALF_UP, getcontext
from fractions import Fraction

print(Decimal("0.1") + Decimal("0.2") == Decimal("0.3"))
print(Decimal(0.1))

PAISA = Decimal("0.01")
items = [("Shirt", Decimal("799.50"), 2), ("Cap", Decimal("249.99"), 3)]
subtotal = sum(price * qty for _, price, qty in items)
gst = (subtotal * Decimal("0.18")).quantize(PAISA, rounding=ROUND_HALF_UP)
total = subtotal + gst
print(f"Subtotal {subtotal}  GST {gst}  Total {total}")
print(Decimal("2.675").quantize(PAISA, rounding=ROUND_HALF_UP), Decimal("2.665").quantize(PAISA))

getcontext().prec = 6
print(Decimal(1) / Decimal(7))
try:
    Decimal("1.5") + 1.5
except TypeError as e:
    print("TypeError:", e)

cup = Fraction(3, 4)
print("Double recipe:", cup * 2, "| one third:", cup / 3)
print(Fraction(1, 3) + Fraction(1, 6), Fraction("0.125"), Fraction(6, 8))
print(Fraction(0.1), "->", Fraction(0.1).limit_denominator(100))
print(float(Fraction(22, 7)))
`,
      python: {
        files: {
          "main.py": `from decimal import Decimal, ROUND_HALF_UP, getcontext
from fractions import Fraction

print(Decimal("0.1") + Decimal("0.2") == Decimal("0.3"))
print(Decimal(0.1))

PAISA = Decimal("0.01")
items = [("Shirt", Decimal("799.50"), 2), ("Cap", Decimal("249.99"), 3)]
subtotal = sum(price * qty for _, price, qty in items)
gst = (subtotal * Decimal("0.18")).quantize(PAISA, rounding=ROUND_HALF_UP)
total = subtotal + gst
print(f"Subtotal {subtotal}  GST {gst}  Total {total}")
print(Decimal("2.675").quantize(PAISA, rounding=ROUND_HALF_UP), Decimal("2.665").quantize(PAISA))

getcontext().prec = 6
print(Decimal(1) / Decimal(7))
try:
    Decimal("1.5") + 1.5
except TypeError as e:
    print("TypeError:", e)

cup = Fraction(3, 4)
print("Double recipe:", cup * 2, "| one third:", cup / 3)
print(Fraction(1, 3) + Fraction(1, 6), Fraction("0.125"), Fraction(6, 8))
print(Fraction(0.1), "->", Fraction(0.1).limit_denominator(100))
print(float(Fraction(22, 7)))
`,
        },
      },
      result: `True
0.1000000000000000055511151231257827021181583404541015625
Subtotal 2348.97  GST 422.81  Total 2771.78
2.68 2.66
0.142857
TypeError: unsupported operand type(s) for +: 'decimal.Decimal' and 'float'
Double recipe: 3/2 | one third: 1/4
1/2 1/8 3/4
3602879701896397/36028797018963968 -> 1/10
3.142857142857143`,
      explanation: "Decimal from strings is exact; Decimal(0.1) exposes the float's binary error. quantize rounds to 2 places with commercial rounding (default rounding is ROUND_HALF_EVEN, so 2.665 becomes 2.66). Precision is set via the context. Decimal refuses float mixing. Fractions stay exact and reduce automatically.",
    },
  ],
  interview: [
    {
      q: "Why does 0.1 + 0.2 != 0.3 in Python?",
      a: "Floats use binary IEEE 754 representation. 0.1, 0.2 and 0.3 cannot be stored exactly, so the sum is 0.30000000000000004. Compare floats with math.isclose(), or use Decimal for exact decimal arithmetic.",
      level: "Easy",
    },
    {
      q: "How does Python's round() work for .5 values?",
      a: "It uses 'round half to even' (banker's rounding): round(0.5) = 0, round(1.5) = 2, round(2.5) = 2. Also, values like 2.675 are stored slightly below, so round(2.675, 2) = 2.67. For commercial rounding use Decimal.quantize with ROUND_HALF_UP.",
      level: "Medium",
    },
    {
      q: "When should you use Decimal instead of float?",
      a: "For money, accounting, tax and any domain where results must match decimal arithmetic exactly and rounding must follow business rules. Floats are faster and fine for scientific measurements where tiny errors are acceptable.",
      level: "Easy",
    },
    {
      q: "Why should Decimal be created from a string and not a float?",
      a: "Decimal(0.1) converts the float's exact binary value, giving 0.1000000000000000055511151231257827021181583404541015625. Decimal('0.1') is exactly one tenth.",
      level: "Medium",
    },
    {
      q: "What is the difference between random and secrets?",
      a: "random uses the Mersenne Twister PRNG, which is fast and reproducible with a seed but predictable - unsafe for security. secrets uses the OS's cryptographically secure random source and should be used for passwords, OTPs, API tokens and session IDs.",
      level: "Medium",
    },
    {
      q: "Why use random.seed()?",
      a: "Seeding fixes the starting state so the same sequence of 'random' numbers is produced each run. This makes tests, simulations, ML data splits and bug reproductions deterministic.",
      level: "Easy",
    },
    {
      q: "Difference between random.sample, choice and choices?",
      a: "choice picks one element. sample(seq, k) picks k unique elements without replacement (no duplicates). choices(seq, weights, k) picks k elements with replacement and supports weights.",
      level: "Easy",
    },
    {
      q: "What is the difference between stdev and pstdev?",
      a: "stdev is the sample standard deviation and divides by n-1 (Bessel's correction), used when the data is a sample from a larger population. pstdev is the population standard deviation, dividing by n, used when you have the entire population.",
      level: "Medium",
    },
    {
      q: "Why is median sometimes better than mean?",
      a: "The mean is sensitive to outliers; one huge value (like a CEO salary) shifts it a lot. The median is the middle value and is robust to outliers, so it better represents a 'typical' value in skewed data like salaries or house prices.",
      level: "Easy",
    },
    {
      q: "What do math.floor, math.ceil and math.trunc return for -2.5?",
      a: "floor(-2.5) = -3 (down towards negative infinity), ceil(-2.5) = -2 (up), trunc(-2.5) = -2 (towards zero). int(-2.5) also truncates to -2.",
      level: "Medium",
    },
    {
      q: "How does math.isclose decide two numbers are close?",
      a: "It returns True if abs(a - b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol). Default rel_tol is 1e-9 and abs_tol is 0, so for comparisons with values near zero you must supply abs_tol.",
      level: "Hard",
    },
    {
      q: "What is the Decimal context?",
      a: "A settings object (getcontext()) controlling precision (significant digits, default 28), rounding mode, and which conditions raise exceptions (traps) like division by zero or inexact results. localcontext() lets you change settings temporarily in a with block.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "A cab charges Rs 50 base plus Rs 12 per started km. Write fare(km) using math.ceil and print fares for 3.2, 7 and 10.01 km.",
      hint: "50 + 12 * math.ceil(km)",
      solution: `import math

def fare(km):
    return 50 + 12 * math.ceil(km)

for km in (3.2, 7, 10.01):
    print(km, "km ->", fare(km))
`,
    },
    {
      task: "Simulate rolling two dice 10,000 times with random.seed(1) and print how often each total (2-12) appears, plus the most common total.",
      hint: "Use collections.Counter and random.randint(1, 6) twice.",
      solution: `import random
from collections import Counter

random.seed(1)
totals = Counter(random.randint(1, 6) + random.randint(1, 6) for _ in range(10_000))
for t in range(2, 13):
    print(t, totals[t])
print("Most common:", totals.most_common(1)[0][0])
`,
    },
    {
      task: "Given daily website visits [120, 135, 150, 98, 400, 142, 138], print mean, median, sample standard deviation (2 decimals) and identify outliers more than 2 stdev away from the mean.",
      hint: "Use statistics.mean, median, stdev and a list comprehension.",
      solution: `import statistics as st

visits = [120, 135, 150, 98, 400, 142, 138]
m, med, sd = st.mean(visits), st.median(visits), st.stdev(visits)
print(round(m, 2), med, round(sd, 2))
print("Outliers:", [v for v in visits if abs(v - m) > 2 * sd])
`,
    },
    {
      task: "Split a restaurant bill of Rs 1000.00 among 3 friends using Decimal so that the shares add up exactly to the total (give any extra paisa to the first person).",
      hint: "share = (total / 3).quantize(Decimal('0.01'), ROUND_DOWN); remainder = total - share * 3.",
      solution: `from decimal import Decimal, ROUND_DOWN

total = Decimal("1000.00")
n = 3
share = (total / n).quantize(Decimal("0.01"), rounding=ROUND_DOWN)
shares = [share] * n
shares[0] += total - share * n
print(shares, sum(shares) == total)
`,
    },
    {
      task: "Using Fraction, add 1/2 + 1/3 + 1/6, print the result, and convert 0.333 to the closest fraction with denominator at most 10.",
      hint: "Fraction('0.333').limit_denominator(10)",
      solution: `from fractions import Fraction

print(Fraction(1, 2) + Fraction(1, 3) + Fraction(1, 6))
print(Fraction("0.333").limit_denominator(10))
`,
    },
  ],
  quiz: [
    {
      question: "What does round(2.5) return in Python 3?",
      options: [
        "3",
        "2",
        "2.5",
        "3.0",
      ],
      answer: 1,
      explanation: "Python uses round-half-to-even, so 2.5 rounds to 2.",
    },
    {
      question: "Which is the correct way to create an exact Decimal 19.99?",
      options: [
        "Decimal(19.99)",
        "Decimal('19.99')",
        "float('19.99')",
        "Decimal.from_float(19.99)",
      ],
      answer: 1,
      explanation: "Creating from a string avoids float binary errors.",
    },
    {
      question: "random.randint(1, 6) can return...",
      options: [
        "1 to 5",
        "0 to 6",
        "1 to 6 inclusive",
        "0 to 5",
      ],
      answer: 2,
      explanation: "randint includes both end points.",
    },
    {
      question: "Which module should generate a password reset token?",
      options: [
        "random",
        "secrets",
        "math",
        "statistics",
      ],
      answer: 1,
      explanation: "secrets is cryptographically secure; random is predictable.",
    },
    {
      question: "statistics.median([3, 1, 4, 2]) is...",
      options: [
        "2",
        "2.5",
        "3",
        "2.4",
      ],
      answer: 1,
      explanation: "Sorted: 1, 2, 3, 4. The median of an even count is the average of 2 and 3.",
    },
    {
      question: "Fraction(10, 4) is displayed as...",
      options: [
        "10/4",
        "2.5",
        "5/2",
        "Fraction(2.5)",
      ],
      answer: 2,
      explanation: "Fractions are automatically reduced to lowest terms.",
    },
  ],
};
