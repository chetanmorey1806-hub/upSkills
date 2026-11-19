export default {
  lesson: 'extra-10-math-random-statistics-decimal-fractions',
  minutes: 30,
  intro: 'Use math, random, statistics, decimal and fractions correctly, and avoid floating-point mistakes with money.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `import math
print(0.1 + 0.2 == 0.3)
print(math.isclose(0.1 + 0.2, 0.3))
print(math.ceil(4.1), math.floor(-4.1))
print(math.gcd(84, 36), math.lcm(4, 6))
print(math.comb(5, 2), math.factorial(5))`,
      expected: 'False\nTrue\n5 -5\n12 12\n10 120',
      explain: '0.1 and 0.2 cannot be stored exactly in binary, so their sum is 0.30000000000000004; compare floats with `math.isclose`. `floor(-4.1)` goes DOWN to -5. `comb(5, 2)` = 10 ways to choose 2 of 5.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You are generating a password-reset token. Which module should you use?',
      options: ['`random`', '`secrets`', '`math`', '`statistics`'],
      answer: 1,
      explain: '`random` is a pseudo-random generator meant for simulations and games; its output can be predicted. `secrets` (e.g. `secrets.token_urlsafe()`) uses the operating system\'s cryptographically secure source.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `import statistics as st
marks = [40, 50, 50, 60, 300]
print(st.mean(marks))
print(st.median(marks))
print(st.mode(marks))
from fractions import Fraction
print(Fraction(1, 3) + Fraction(1, 6))`,
      expected: '100\n50\n50\n1/2',
      explain: 'One outlier (300) pulls the **mean** up to 100 while the **median** (middle value) stays 50, which is why median is more robust. `mode` is the most frequent value. Fractions are exact: 1/3 + 1/6 = 1/2.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `gst_total(prices, rate)` for a shop bill. `prices` are strings like `"199.99"`, `rate` is a string like `"18"` (percent). Using `Decimal`, add the prices, add GST, and return the total **as a string rounded to 2 decimals with ROUND_HALF_UP**.',
      example: { title: 'Decimal money maths', code: 'from decimal import Decimal, ROUND_HALF_UP\namt = Decimal("10.125")\nprint(amt.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))  # 10.13' },
      starter: 'from decimal import Decimal, ROUND_HALF_UP\n\ndef gst_total(prices, rate):\n    # TODO\n    return "0.00"\n',
      solution: 'from decimal import Decimal, ROUND_HALF_UP\n\ndef gst_total(prices, rate):\n    subtotal = sum(Decimal(p) for p in prices)\n    total = subtotal * (1 + Decimal(rate) / 100)\n    return str(total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))\n',
      tests: [
        { call: 'gst_total(["100.00", "50.00"], "18")', expect: '177.00' },
        { call: 'gst_total(["0.10", "0.20"], "0")', expect: '0.30', msg: 'No float errors' },
        { call: 'gst_total(["10.25"], "5")', expect: '10.76', msg: '10.7625 rounds half up to 10.76' },
        { call: 'gst_total(["2.50"], "5")', expect: '2.63', msg: '2.625 must round UP to 2.63' },
      ],
      explain: 'Create Decimals from **strings** (`Decimal("0.1")`), never from floats (`Decimal(0.1)` keeps the float error). `quantize(Decimal("0.01"), ROUND_HALF_UP)` rounds like a bill does; Python\'s `round()` uses banker\'s rounding (2.625 → 2.62).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `pick_winners(names, k, seed)` that returns `k` **different** names chosen at random for a lucky draw. Make it reproducible: create `random.Random(seed)` and use its `sample` method. The same seed must always give the same winners.',
      example: { title: 'reproducible randomness', code: 'import random\nrng = random.Random(7)\nprint(rng.randint(1, 6), rng.choice(["a", "b"]))' },
      starter: 'import random\n\ndef pick_winners(names, k, seed):\n    # TODO\n    return names[:k]\n',
      solution: 'import random\n\ndef pick_winners(names, k, seed):\n    rng = random.Random(seed)\n    return rng.sample(names, k)\n',
      tests: [
        { call: 'pick_winners(list("ABCDEFGHIJ"), 3, 42) == pick_winners(list("ABCDEFGHIJ"), 3, 42)', expect: true, msg: 'Same seed → same winners' },
        { call: 'len(set(pick_winners(list("ABCDEFGHIJ"), 5, 1)))', expect: 5, msg: 'Winners must be different people' },
        { call: 'pick_winners(list("ABCDEFGHIJ"), 3, 42)', expect: ['B', 'A', 'E'], msg: 'Use random.Random(seed).sample(names, k)' },
      ],
      explain: '`sample` picks without replacement, so nobody wins twice (`choices` would allow repeats). A separate `random.Random(seed)` object gives reproducible results without changing the global random state used by other code.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `report(marks)` that returns a dict with `mean` (rounded to 2), `median`, `stdev` (sample standard deviation, rounded to 2) and `modes` (list from `statistics.multimode`).',
      example: { title: 'statistics module', code: 'import statistics as st\nst.mean([2, 4, 9])       # 5\nst.pstdev([2, 4, 4, 4, 5, 5, 7, 9])  # 2.0' },
      starter: 'import statistics as st\n\ndef report(marks):\n    # TODO\n    return {}\n',
      solution: 'import statistics as st\n\ndef report(marks):\n    return {\n        "mean": round(st.mean(marks), 2),\n        "median": st.median(marks),\n        "stdev": round(st.stdev(marks), 2),\n        "modes": st.multimode(marks),\n    }\n',
      tests: [
        { call: 'report([70, 80, 80, 90, 95])', expect: { mean: 83, median: 80, stdev: 9.75, modes: [80] } },
        { call: 'report([1, 1, 2, 2, 9])', expect: { mean: 3, median: 2, stdev: 3.39, modes: [1, 2] } },
      ],
      explain: '`stdev` is the **sample** standard deviation (divides by n-1); `pstdev` is for a whole population. `mode` returns only one value while `multimode` returns every most-frequent value.',
    },
  ],
};
