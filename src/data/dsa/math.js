export default [
  {
    id: 'mt-check-prime',
    title: 'Check Prime Number',
    diff: 'Easy',
    pattern: 'Math & Number Theory',
    companies: ['TCS', 'Infosys', 'Wipro', 'Accenture'],
    statement: "Given a non-negative integer `n`, return `true` if it is a prime number and `false` otherwise. A prime is an integer greater than 1 whose only positive divisors are 1 and itself.",
    examples: [
      { input: 'n = 17', output: 'true' },
      { input: 'n = 49', output: 'false', explain: '49 = 7 * 7.' },
      { input: 'n = 1', output: 'false', explain: '1 is not prime by definition.' },
    ],
    constraints: ['0 <= n <= 10^9'],
    hints: ['If n has a divisor larger than sqrt(n), it also has one smaller than sqrt(n).', 'Handle 0, 1, 2 and even numbers first, then try odd divisors up to sqrt(n).'],
    approach: "Numbers below 2 are not prime, and 2 is the only even prime. For an odd `n`, try dividing by 3, 5, 7, ... while `d * d <= n`. Divisors come in pairs `d` and `n / d`, and one of each pair is at most `sqrt(n)`, so if no divisor is found up to the square root, `n` is prime. Skipping even divisors halves the work. Trying every number from 2 to n - 1 is O(n), which is too slow for n near 10^9.",
    complexity: 'Time O(sqrt(n)), Space O(1)',
    fn: { py: 'is_prime', js: 'isPrime' },
    py: {
      starter: 'def is_prime(n):\n    # write your code here\n    pass\n',
      solution: `def is_prime(n):
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    d = 3
    while d * d <= n:
        if n % d == 0:
            return False
        d += 2
    return True
`,
    },
    js: {
      starter: 'function isPrime(n) {\n  // write your code here\n}\n',
      solution: `function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}
`,
    },
    tests: [
      { args: [1], expect: false },
      { args: [2], expect: true },
      { args: [17], expect: true },
      { args: [15], expect: false },
      { args: [0], expect: false },
      { args: [97], expect: true },
      { args: [1000003], expect: true },
      { args: [49], expect: false },
    ],
  },
  {
    id: 'mt-gcd-lcm',
    title: 'GCD and LCM of Two Numbers',
    diff: 'Easy',
    pattern: 'Math & Number Theory',
    companies: ['TCS', 'Cognizant', 'Capgemini', 'Infosys'],
    statement: "Given two positive integers `a` and `b`, return `[gcd, lcm]` where `gcd` is their greatest common divisor and `lcm` is their least common multiple.",
    examples: [
      { input: 'a = 12, b = 18', output: '[6, 36]' },
      { input: 'a = 7, b = 13', output: '[1, 91]', explain: 'Co-prime numbers have gcd 1, so the lcm is their product.' },
    ],
    constraints: ['1 <= a, b <= 10^6'],
    hints: ['Euclid: gcd(a, b) = gcd(b, a mod b), and gcd(a, 0) = a.', 'lcm(a, b) = a / gcd(a, b) * b.'],
    approach: "Use Euclid's algorithm: replace `(a, b)` with `(b, a mod b)` until `b` becomes 0; the remaining `a` is the gcd. This works because any common divisor of `a` and `b` also divides `a mod b`. The number of steps is logarithmic in the smaller number. Then compute the lcm as `a / gcd * b`, dividing first to keep intermediate values small. The brute force tries every number from min(a, b) down to 1, which is O(min(a, b)).",
    complexity: 'Time O(log min(a, b)), Space O(1)',
    fn: { py: 'gcd_lcm', js: 'gcdLcm' },
    py: {
      starter: 'def gcd_lcm(a, b):\n    # write your code here\n    pass\n',
      solution: `def gcd_lcm(a, b):
    x, y = a, b
    while y:
        x, y = y, x % y
    return [x, a // x * b]
`,
    },
    js: {
      starter: 'function gcdLcm(a, b) {\n  // write your code here\n}\n',
      solution: `function gcdLcm(a, b) {
  let x = a, y = b;
  while (y) { [x, y] = [y, x % y]; }
  return [x, (a / x) * b];
}
`,
    },
    tests: [
      { args: [12, 18], expect: [6, 36] },
      { args: [7, 13], expect: [1, 91] },
      { args: [5, 5], expect: [5, 5] },
      { args: [1, 100], expect: [1, 100] },
      { args: [21, 6], expect: [3, 42] },
      { args: [100000, 250000], expect: [50000, 500000] },
      { args: [48, 180], expect: [12, 720] },
    ],
  },
  {
    id: 'mt-armstrong-number',
    title: 'Armstrong Number',
    diff: 'Easy',
    pattern: 'Math & Number Theory',
    companies: ['TCS', 'Wipro', 'Accenture', 'HCL'],
    statement: "A non-negative integer with `k` digits is an **Armstrong number** if the sum of each digit raised to the power `k` equals the number itself. For example `153` has 3 digits and `1^3 + 5^3 + 3^3 = 153`. Given `n`, return `true` if it is an Armstrong number.",
    examples: [
      { input: 'n = 9474', output: 'true', explain: '9^4 + 4^4 + 7^4 + 4^4 = 9474.' },
      { input: 'n = 123', output: 'false', explain: '1 + 8 + 27 = 36.' },
    ],
    constraints: ['0 <= n <= 10^9'],
    hints: ['First find k, the number of digits.', 'Extract digits with n % 10 and n // 10.'],
    approach: "Count the digits `k`, either by converting to a string or by dividing by 10 repeatedly. Then take the digits one by one with `% 10` and `// 10`, adding `digit^k` to a running sum. Finally compare the sum with the original number. A single-digit number is always an Armstrong number because `d^1 = d`, and 0 counts as a one-digit number. The work is proportional to the number of digits.",
    complexity: 'Time O(d) where d is the number of digits, Space O(1)',
    fn: { py: 'is_armstrong', js: 'isArmstrong' },
    py: {
      starter: 'def is_armstrong(n):\n    # write your code here\n    pass\n',
      solution: `def is_armstrong(n):
    k = len(str(n))
    total, m = 0, n
    while m > 0:
        total += (m % 10) ** k
        m //= 10
    return total == n
`,
    },
    js: {
      starter: 'function isArmstrong(n) {\n  // write your code here\n}\n',
      solution: `function isArmstrong(n) {
  const k = String(n).length;
  let total = 0, m = n;
  while (m > 0) {
    total += (m % 10) ** k;
    m = Math.floor(m / 10);
  }
  return total === n;
}
`,
    },
    tests: [
      { args: [153], expect: true },
      { args: [370], expect: true },
      { args: [9474], expect: true },
      { args: [123], expect: false },
      { args: [0], expect: true },
      { args: [9], expect: true },
      { args: [10], expect: false },
      { args: [9475], expect: false },
    ],
  },
  {
    id: 'mt-palindrome-number',
    title: 'Palindrome Number',
    diff: 'Easy',
    pattern: 'Math & Number Theory',
    companies: ['TCS', 'Infosys', 'Amazon', 'Cognizant'],
    statement: "Given an integer `x`, return `true` if its decimal representation reads the same forwards and backwards. Negative numbers are **not** palindromes because of the minus sign. Try to solve it without converting the number to a string.",
    examples: [
      { input: 'x = 12321', output: 'true' },
      { input: 'x = -121', output: 'false', explain: 'Read backwards it is "121-".' },
      { input: 'x = 10', output: 'false' },
    ],
    constraints: ['-2^31 <= x <= 2^31 - 1'],
    hints: ['Numbers ending in 0 (except 0 itself) cannot be palindromes.', 'Reverse only the second half of the digits and compare it with the first half.'],
    approach: "Reject negative numbers and numbers ending in 0 other than 0 itself. Then build the reverse of the lower half: repeatedly move the last digit of `x` onto `rev` (`rev = rev * 10 + x % 10`, `x //= 10`) until `rev >= x`. At that point we have processed half the digits. For an even digit count the number is a palindrome when `x == rev`; for an odd count the middle digit sits at the end of `rev`, so compare `x == rev // 10`. Reversing only half avoids overflow in fixed-width languages. Converting to a string and comparing with its reverse is simpler but uses O(d) extra space.",
    complexity: 'Time O(d), Space O(1)',
    fn: { py: 'is_palindrome_number', js: 'isPalindromeNumber' },
    py: {
      starter: 'def is_palindrome_number(x):\n    # write your code here\n    pass\n',
      solution: `def is_palindrome_number(x):
    if x < 0 or (x % 10 == 0 and x != 0):
        return False
    rev = 0
    while x > rev:
        rev = rev * 10 + x % 10
        x //= 10
    return x == rev or x == rev // 10
`,
    },
    js: {
      starter: 'function isPalindromeNumber(x) {\n  // write your code here\n}\n',
      solution: `function isPalindromeNumber(x) {
  if (x < 0 || (x % 10 === 0 && x !== 0)) return false;
  let rev = 0;
  while (x > rev) {
    rev = rev * 10 + (x % 10);
    x = Math.floor(x / 10);
  }
  return x === rev || x === Math.floor(rev / 10);
}
`,
    },
    tests: [
      { args: [121], expect: true },
      { args: [-121], expect: false },
      { args: [10], expect: false },
      { args: [0], expect: true },
      { args: [12321], expect: true },
      { args: [1221], expect: true },
      { args: [123], expect: false },
      { args: [1000021], expect: false },
    ],
  },
  {
    id: 'mt-reverse-integer',
    title: 'Reverse an Integer',
    diff: 'Easy',
    pattern: 'Math & Number Theory',
    companies: ['TCS', 'Accenture', 'Amazon', 'Apple'],
    statement: "Given a 32-bit signed integer `x`, return the number formed by reversing its digits, keeping the sign. If the reversed value falls outside the 32-bit signed range `[-2147483648, 2147483647]`, return `0`.",
    examples: [
      { input: 'x = -123', output: '-321' },
      { input: 'x = 120', output: '21', explain: 'Leading zeros of the result are dropped.' },
      { input: 'x = 1534236469', output: '0', explain: '9646324351 is too large for 32 bits.' },
    ],
    constraints: ['-2^31 <= x <= 2^31 - 1'],
    hints: ['Work with the absolute value and remember the sign.', 'Pop the last digit with % 10 and push it with rev * 10 + digit.'],
    approach: "Save the sign and work with `abs(x)`. Repeatedly take the last digit with `% 10`, append it to `rev` with `rev = rev * 10 + digit`, and drop it from the number with integer division by 10. When the number reaches 0, apply the sign. Finally check the 32-bit range and return 0 if the result is outside it. In languages with fixed 32-bit ints you must check for overflow before each multiplication; here we check once at the end. The string approach (reverse the digits as text) also works but uses extra memory.",
    complexity: 'Time O(d), Space O(1)',
    fn: { py: 'reverse_integer', js: 'reverseInteger' },
    py: {
      starter: 'def reverse_integer(x):\n    # write your code here\n    pass\n',
      solution: `def reverse_integer(x):
    sign = -1 if x < 0 else 1
    x = abs(x)
    rev = 0
    while x:
        rev = rev * 10 + x % 10
        x //= 10
    rev *= sign
    if rev < -2 ** 31 or rev > 2 ** 31 - 1:
        return 0
    return rev
`,
    },
    js: {
      starter: 'function reverseInteger(x) {\n  // write your code here\n}\n',
      solution: `function reverseInteger(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  let rev = 0;
  while (x > 0) {
    rev = rev * 10 + (x % 10);
    x = Math.floor(x / 10);
  }
  rev *= sign;
  if (rev < -2147483648 || rev > 2147483647) return 0;
  return rev === 0 ? 0 : rev;
}
`,
    },
    tests: [
      { args: [123], expect: 321 },
      { args: [-123], expect: -321 },
      { args: [120], expect: 21 },
      { args: [0], expect: 0 },
      { args: [1534236469], expect: 0 },
      { args: [-2147483648], expect: 0 },
      { args: [1463847412], expect: 2147483641 },
    ],
  },
  {
    id: 'mt-decimal-to-binary',
    title: 'Decimal to Binary',
    diff: 'Easy',
    pattern: 'Math & Number Theory',
    companies: ['TCS', 'Wipro', 'Infosys'],
    statement: "Given a non-negative integer `n`, return its binary representation as a string without leading zeros. For `n = 0` return `\"0\"`. Do it with arithmetic, not a built-in conversion.",
    examples: [
      { input: 'n = 10', output: '"1010"', explain: '10 = 8 + 2.' },
      { input: 'n = 0', output: '"0"' },
    ],
    constraints: ['0 <= n <= 10^9'],
    hints: ['n % 2 gives the last binary digit.', 'Collect remainders while dividing by 2, then reverse them.'],
    approach: "Repeatedly divide `n` by 2. The remainder of each division is the next binary digit, starting from the least significant one. Append each remainder to a list and replace `n` with `n // 2` until `n` becomes 0. Reverse the collected digits to get the usual most-significant-first order. Handle `n = 0` separately because the loop would produce no digits. The number of steps equals the number of bits, about log2(n).",
    complexity: 'Time O(log n), Space O(log n)',
    fn: { py: 'to_binary', js: 'toBinary' },
    py: {
      starter: 'def to_binary(n):\n    # write your code here\n    pass\n',
      solution: `def to_binary(n):
    if n == 0:
        return '0'
    bits = []
    while n > 0:
        bits.append(str(n % 2))
        n //= 2
    return ''.join(reversed(bits))
`,
    },
    js: {
      starter: 'function toBinary(n) {\n  // write your code here\n}\n',
      solution: `function toBinary(n) {
  if (n === 0) return '0';
  const bits = [];
  while (n > 0) {
    bits.push(n % 2);
    n = Math.floor(n / 2);
  }
  return bits.reverse().join('');
}
`,
    },
    tests: [
      { args: [0], expect: '0' },
      { args: [5], expect: '101' },
      { args: [10], expect: '1010' },
      { args: [1], expect: '1' },
      { args: [255], expect: '11111111' },
      { args: [1024], expect: '10000000000' },
    ],
  },
  {
    id: 'mt-perfect-number',
    title: 'Perfect Number',
    diff: 'Easy',
    pattern: 'Math & Number Theory',
    companies: ['TCS', 'Accenture', 'Capgemini'],
    statement: "A **perfect number** is a positive integer equal to the sum of its positive divisors excluding itself. For example `28 = 1 + 2 + 4 + 7 + 14`. Given `n`, return `true` if it is perfect.",
    examples: [
      { input: 'n = 28', output: 'true' },
      { input: 'n = 12', output: 'false', explain: '1 + 2 + 3 + 4 + 6 = 16.' },
    ],
    constraints: ['1 <= n <= 10^8'],
    hints: ['Divisors come in pairs (d, n / d).', 'Loop d up to sqrt(n) and add both members of each pair, taking care not to add a square root twice.'],
    approach: "Start the sum at 1 (every n > 1 is divisible by 1) and loop `d` from 2 while `d * d <= n`. When `d` divides `n`, add `d` and its partner `n / d`, but add only once if they are equal. This finds every proper divisor in O(sqrt(n)) steps. Compare the sum with `n`. Remember that 1 is not perfect because its only proper divisor sum is 0. Looping every d up to n - 1 is O(n), which is too slow for 10^8.",
    complexity: 'Time O(sqrt(n)), Space O(1)',
    fn: { py: 'is_perfect', js: 'isPerfect' },
    py: {
      starter: 'def is_perfect(n):\n    # write your code here\n    pass\n',
      solution: `def is_perfect(n):
    if n < 2:
        return False
    total = 1
    d = 2
    while d * d <= n:
        if n % d == 0:
            total += d
            if d != n // d:
                total += n // d
        d += 1
    return total == n
`,
    },
    js: {
      starter: 'function isPerfect(n) {\n  // write your code here\n}\n',
      solution: `function isPerfect(n) {
  if (n < 2) return false;
  let total = 1;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) {
      total += d;
      if (d !== n / d) total += n / d;
    }
  }
  return total === n;
}
`,
    },
    tests: [
      { args: [6], expect: true },
      { args: [28], expect: true },
      { args: [496], expect: true },
      { args: [8128], expect: true },
      { args: [1], expect: false },
      { args: [12], expect: false },
      { args: [27], expect: false },
      { args: [2], expect: false },
    ],
  },
  {
    id: 'mt-excel-column-title',
    title: 'Excel Sheet Column Title',
    diff: 'Easy',
    pattern: 'Math & Number Theory',
    companies: ['Microsoft', 'Zoho', 'Infosys', 'Amazon'],
    statement: "Spreadsheet columns are named `A, B, ..., Z, AA, AB, ..., AZ, BA, ..., ZZ, AAA, ...`. Given a positive integer `n`, return the name of the `n`-th column (`1 → \"A\"`, `26 → \"Z\"`, `27 → \"AA\"`).",
    examples: [
      { input: 'n = 28', output: '"AB"' },
      { input: 'n = 701', output: '"ZY"' },
    ],
    constraints: ['1 <= n <= 2^31 - 1'],
    hints: ['This is base 26, but the digits run from 1 to 26 instead of 0 to 25.', 'Subtract 1 before taking n % 26 so that 26 maps to Z.'],
    approach: "Column names are a base-26 system with digits A=1 to Z=26 and no zero digit. To extract the last letter, first do `n -= 1` so the digit range becomes 0 to 25, then the letter is `chr(65 + n % 26)` and the remaining value is `n // 26`. Repeat until `n` is 0, then reverse the collected letters. Without the `- 1` adjustment, multiples of 26 would wrongly produce a zero digit. The loop runs once per letter of the result.",
    complexity: 'Time O(log26 n), Space O(log26 n)',
    fn: { py: 'column_title', js: 'columnTitle' },
    py: {
      starter: 'def column_title(n):\n    # write your code here\n    pass\n',
      solution: `def column_title(n):
    out = []
    while n > 0:
        n -= 1
        out.append(chr(65 + n % 26))
        n //= 26
    return ''.join(reversed(out))
`,
    },
    js: {
      starter: 'function columnTitle(n) {\n  // write your code here\n}\n',
      solution: `function columnTitle(n) {
  const out = [];
  while (n > 0) {
    n -= 1;
    out.push(String.fromCharCode(65 + (n % 26)));
    n = Math.floor(n / 26);
  }
  return out.reverse().join('');
}
`,
    },
    tests: [
      { args: [1], expect: 'A' },
      { args: [26], expect: 'Z' },
      { args: [27], expect: 'AA' },
      { args: [28], expect: 'AB' },
      { args: [701], expect: 'ZY' },
      { args: [702], expect: 'ZZ' },
      { args: [703], expect: 'AAA' },
      { args: [2147483647], expect: 'FXSHRXW' },
    ],
  },
  {
    id: 'mt-sieve-primes',
    title: 'All Primes up to N (Sieve of Eratosthenes)',
    diff: 'Medium',
    pattern: 'Math & Number Theory',
    companies: ['TCS', 'Infosys', 'Amazon', 'Microsoft'],
    statement: "Given an integer `n`, return a list of all prime numbers less than or equal to `n`, in increasing order.",
    examples: [
      { input: 'n = 10', output: '[2, 3, 5, 7]' },
      { input: 'n = 1', output: '[]' },
    ],
    constraints: ['0 <= n <= 10^6'],
    hints: ['Testing every number separately costs O(n sqrt(n)).', 'Instead, cross out the multiples of each prime, starting from its square.'],
    approach: "Create a boolean array `isPrime` of size n + 1, initially true for every index from 2. For each `p` from 2 while `p * p <= n`, if `p` is still marked prime, mark `p*p, p*p + p, p*p + 2p, ...` as not prime. Starting at `p*p` is safe because smaller multiples were already crossed out by smaller primes. When the loop ends, every index still marked true is prime. The total work is about n log log n, which is nearly linear. Checking each number with trial division is O(n sqrt(n)) and much slower for n = 10^6.",
    complexity: 'Time O(n log log n), Space O(n)',
    fn: { py: 'primes_up_to', js: 'primesUpTo' },
    py: {
      starter: 'def primes_up_to(n):\n    # write your code here\n    pass\n',
      solution: `def primes_up_to(n):
    if n < 2:
        return []
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    p = 2
    while p * p <= n:
        if is_prime[p]:
            for m in range(p * p, n + 1, p):
                is_prime[m] = False
        p += 1
    return [i for i in range(n + 1) if is_prime[i]]
`,
    },
    js: {
      starter: 'function primesUpTo(n) {\n  // write your code here\n}\n',
      solution: `function primesUpTo(n) {
  if (n < 2) return [];
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  for (let p = 2; p * p <= n; p++) {
    if (isPrime[p]) for (let m = p * p; m <= n; m += p) isPrime[m] = false;
  }
  const res = [];
  for (let i = 2; i <= n; i++) if (isPrime[i]) res.push(i);
  return res;
}
`,
    },
    tests: [
      { args: [10], expect: [2, 3, 5, 7] },
      { args: [1], expect: [] },
      { args: [2], expect: [2] },
      { args: [0], expect: [] },
      { args: [30], expect: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29] },
      { args: [20], expect: [2, 3, 5, 7, 11, 13, 17, 19] },
      { args: [49], expect: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47] },
    ],
  },
  {
    id: 'mt-factorial-trailing-zeros',
    title: 'Trailing Zeros in N Factorial',
    diff: 'Medium',
    pattern: 'Math & Number Theory',
    companies: ['TCS', 'Amazon', 'Bloomberg', 'Infosys'],
    statement: "Given a non-negative integer `n`, return how many zeros appear at the end of `n!` (n factorial). Do not compute the factorial itself.",
    examples: [
      { input: 'n = 5', output: '1', explain: '5! = 120.' },
      { input: 'n = 25', output: '6', explain: '25 contributes two factors of 5.' },
    ],
    constraints: ['0 <= n <= 10^9'],
    hints: ['Each trailing zero comes from a factor 10 = 2 * 5, and factors of 2 are always more plentiful.', 'Count the factors of 5: n/5 + n/25 + n/125 + ...'],
    approach: "A trailing zero is produced by each pair of factors 2 and 5 in the product 1 * 2 * ... * n. There are always more 2s than 5s, so the answer is the number of factors of 5. Every multiple of 5 gives one, every multiple of 25 gives an extra one, every multiple of 125 another, and so on. So the answer is `n//5 + n//25 + n//125 + ...`, which we compute by repeatedly dividing n by 5 and adding. This takes O(log5 n) steps. Computing n! directly is impossible for large n because the number has millions of digits.",
    complexity: 'Time O(log n), Space O(1)',
    fn: { py: 'trailing_zeroes', js: 'trailingZeroes' },
    py: {
      starter: 'def trailing_zeroes(n):\n    # write your code here\n    pass\n',
      solution: `def trailing_zeroes(n):
    count = 0
    while n:
        n //= 5
        count += n
    return count
`,
    },
    js: {
      starter: 'function trailingZeroes(n) {\n  // write your code here\n}\n',
      solution: `function trailingZeroes(n) {
  let count = 0;
  while (n > 0) {
    n = Math.floor(n / 5);
    count += n;
  }
  return count;
}
`,
    },
    tests: [
      { args: [5], expect: 1 },
      { args: [3], expect: 0 },
      { args: [0], expect: 0 },
      { args: [25], expect: 6 },
      { args: [100], expect: 24 },
      { args: [1000], expect: 249 },
      { args: [10000], expect: 2499 },
      { args: [1000000000], expect: 249999998 },
    ],
  },
  {
    id: 'mt-prime-factors',
    title: 'Prime Factorization',
    diff: 'Medium',
    pattern: 'Math & Number Theory',
    companies: ['TCS', 'Wipro', 'Cognizant', 'Amazon'],
    statement: "Given an integer `n >= 2`, return its prime factors in non-decreasing order, repeating each prime as many times as it divides `n`. For example `360 → [2, 2, 2, 3, 3, 5]`.",
    examples: [
      { input: 'n = 12', output: '[2, 2, 3]' },
      { input: 'n = 97', output: '[97]', explain: '97 is prime.' },
    ],
    constraints: ['2 <= n <= 10^12'],
    hints: ['Divide out each small factor completely before moving on.', 'Only try divisors while d * d <= n; whatever remains above 1 is a prime.'],
    approach: "Try divisors `d = 2, 3, 4, ...` while `d * d <= n`. For each `d`, divide `n` by `d` as many times as possible, appending `d` each time. Because smaller factors are removed first, any `d` that divides `n` at this point must be prime. When `d * d > n`, the remaining `n` (if greater than 1) has no factor up to its square root, so it is itself prime and is appended last. This is O(sqrt(n)) in the worst case. Testing primality of every number up to n and dividing is far slower.",
    complexity: 'Time O(sqrt(n)), Space O(log n) for the output',
    fn: { py: 'prime_factors', js: 'primeFactors' },
    py: {
      starter: 'def prime_factors(n):\n    # write your code here\n    pass\n',
      solution: `def prime_factors(n):
    res = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            res.append(d)
            n //= d
        d += 1 if d == 2 else 2
    if n > 1:
        res.append(n)
    return res
`,
    },
    js: {
      starter: 'function primeFactors(n) {\n  // write your code here\n}\n',
      solution: `function primeFactors(n) {
  const res = [];
  for (let d = 2; d * d <= n; d += d === 2 ? 1 : 2) {
    while (n % d === 0) {
      res.push(d);
      n /= d;
    }
  }
  if (n > 1) res.push(n);
  return res;
}
`,
    },
    tests: [
      { args: [12], expect: [2, 2, 3] },
      { args: [2], expect: [2] },
      { args: [97], expect: [97] },
      { args: [360], expect: [2, 2, 2, 3, 3, 5] },
      { args: [1001], expect: [7, 11, 13] },
      { args: [1024], expect: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2] },
      { args: [1999966], expect: [2, 999983] },
      { args: [999966000289], expect: [999983, 999983] },
    ],
  },
  {
    id: 'mt-base-conversion',
    title: 'Convert Between Number Bases',
    diff: 'Medium',
    pattern: 'Math & Number Theory',
    companies: ['TCS', 'Infosys', 'Zoho'],
    statement: "Given a non-negative number written as a string `num` in base `from` and a target base `to` (both between 2 and 36), return the number written in base `to`. Digits above 9 use uppercase letters: `A = 10, B = 11, ..., Z = 35`. The input uses uppercase letters too, and the output has no leading zeros (zero is `\"0\"`).",
    examples: [
      { input: 'num = "255", from = 10, to = 16', output: '"FF"' },
      { input: 'num = "777", from = 8, to = 16', output: '"1FF"', explain: '777 in base 8 is 511 in decimal, which is 1FF in base 16.' },
    ],
    constraints: ['2 <= from, to <= 36', 'The value of num is less than 2^53'],
    hints: ['Go through base 10 (an ordinary integer) in the middle.', 'Parse with value = value * from + digit; print with repeated % to and // to.'],
    approach: "Convert in two steps through an ordinary integer. To parse, start with `value = 0` and for each character do `value = value * from + digitValue`, where digits 0 to 9 map to themselves and A to Z map to 10 to 35. To print in the target base, repeatedly take `value % to` as the next digit (least significant first) and set `value = value // to`, then reverse the digits. Treat a value of 0 separately so it prints as \"0\". Both steps are linear in the number of digits.",
    complexity: 'Time O(d), Space O(d)',
    fn: { py: 'convert_base', js: 'convertBase' },
    py: {
      starter: 'def convert_base(num, from_base, to_base):\n    # write your code here\n    pass\n',
      solution: `def convert_base(num, from_base, to_base):
    digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    value = 0
    for c in num:
        value = value * from_base + digits.index(c)
    if value == 0:
        return '0'
    out = []
    while value > 0:
        out.append(digits[value % to_base])
        value //= to_base
    return ''.join(reversed(out))
`,
    },
    js: {
      starter: 'function convertBase(num, fromBase, toBase) {\n  // write your code here\n}\n',
      solution: `function convertBase(num, fromBase, toBase) {
  const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let value = 0;
  for (const c of num) value = value * fromBase + digits.indexOf(c);
  if (value === 0) return '0';
  const out = [];
  while (value > 0) {
    out.push(digits[value % toBase]);
    value = Math.floor(value / toBase);
  }
  return out.reverse().join('');
}
`,
    },
    tests: [
      { args: ['255', 10, 16], expect: 'FF' },
      { args: ['FF', 16, 2], expect: '11111111' },
      { args: ['0', 10, 2], expect: '0' },
      { args: ['1010', 2, 10], expect: '10' },
      { args: ['Z', 36, 10], expect: '35' },
      { args: ['777', 8, 16], expect: '1FF' },
      { args: ['12345', 10, 36], expect: '9IX' },
      { args: ['00101', 2, 8], expect: '5' },
    ],
  },
  {
    id: 'mt-modular-power',
    title: 'Fast Modular Exponentiation',
    diff: 'Medium',
    pattern: 'Math & Number Theory',
    companies: ['Amazon', 'Google', 'Codenation', 'TCS'],
    statement: "Given non-negative integers `x`, `n` and a positive modulus `m`, return `(x^n) mod m`. `n` can be as large as 10^9, so multiplying `x` by itself `n` times is too slow.",
    examples: [
      { input: 'x = 2, n = 10, m = 1000', output: '24', explain: '2^10 = 1024 and 1024 mod 1000 = 24.' },
      { input: 'x = 3, n = 0, m = 7', output: '1', explain: 'Anything to the power 0 is 1.' },
    ],
    constraints: ['0 <= x <= 10^9', '0 <= n <= 10^9', '1 <= m <= 10^9 + 7'],
    hints: ['x^n = (x^(n/2))^2 when n is even.', 'Process n bit by bit: square the base each step and multiply it into the answer when the bit is 1. Reduce mod m after every multiplication.'],
    approach: "Use binary exponentiation. Keep `result = 1 % m` and `base = x % m`. While `n > 0`: if the lowest bit of `n` is 1, set `result = result * base % m`; then set `base = base * base % m` and shift `n` right by one bit. Each step halves `n`, so only about 30 steps are needed for n up to 10^9. Taking the remainder after every multiplication keeps numbers small; in JavaScript use BigInt because products of two numbers near 10^9 exceed 2^53. Starting with `1 % m` makes m = 1 return 0. Repeated multiplication n times is O(n), far too slow.",
    complexity: 'Time O(log n), Space O(1)',
    fn: { py: 'mod_pow', js: 'modPow' },
    py: {
      starter: 'def mod_pow(x, n, m):\n    # write your code here\n    pass\n',
      solution: `def mod_pow(x, n, m):
    result = 1 % m
    base = x % m
    while n > 0:
        if n & 1:
            result = result * base % m
        base = base * base % m
        n >>= 1
    return result
`,
    },
    js: {
      starter: 'function modPow(x, n, m) {\n  // write your code here\n}\n',
      solution: `function modPow(x, n, m) {
  const M = BigInt(m);
  let result = 1n % M;
  let base = BigInt(x) % M;
  let e = n;
  while (e > 0) {
    if (e % 2 === 1) result = (result * base) % M;
    base = (base * base) % M;
    e = Math.floor(e / 2);
  }
  return Number(result);
}
`,
    },
    tests: [
      { args: [2, 10, 1000], expect: 24 },
      { args: [3, 0, 7], expect: 1 },
      { args: [2, 30, 1000000007], expect: 73741817 },
      { args: [5, 3, 13], expect: 8 },
      { args: [7, 1000000000, 1000000007], expect: 312556845 },
      { args: [0, 5, 7], expect: 0 },
      { args: [10, 5, 1], expect: 0 },
      { args: [3, 200, 13], expect: 9 },
    ],
  },
  {
    id: 'mt-ugly-number',
    title: 'N-th Ugly Number',
    diff: 'Medium',
    pattern: 'Math & Number Theory',
    companies: ['Amazon', 'Microsoft', 'Samsung', 'Infosys'],
    statement: "An **ugly number** is a positive integer whose only prime factors are 2, 3 and 5. The sequence starts `1, 2, 3, 4, 5, 6, 8, 9, 10, 12, ...` (1 is included by convention). Given `n`, return the `n`-th ugly number.",
    examples: [
      { input: 'n = 10', output: '12' },
      { input: 'n = 1', output: '1' },
    ],
    constraints: ['1 <= n <= 1690'],
    hints: ['Every ugly number except 1 is 2, 3 or 5 times a smaller ugly number.', 'Keep three pointers into the list you are building, one for each multiplier, and always take the smallest next candidate.'],
    approach: "Build the sequence in order. Keep three indices `i2`, `i3`, `i5` into the list, all starting at 0. The next ugly number is the minimum of `ugly[i2] * 2`, `ugly[i3] * 3` and `ugly[i5] * 5`. Append it, then advance every pointer whose product equals that minimum; advancing all equal pointers avoids duplicates such as 6 = 2 * 3 = 3 * 2. After n - 1 steps the last element is the answer. This is a three-way merge of sorted streams and takes O(n). Testing every integer for being ugly is slow because ugly numbers become very sparse.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'nth_ugly_number', js: 'nthUglyNumber' },
    py: {
      starter: 'def nth_ugly_number(n):\n    # write your code here\n    pass\n',
      solution: `def nth_ugly_number(n):
    ugly = [1]
    i2 = i3 = i5 = 0
    while len(ugly) < n:
        a, b, c = ugly[i2] * 2, ugly[i3] * 3, ugly[i5] * 5
        nxt = min(a, b, c)
        ugly.append(nxt)
        if nxt == a:
            i2 += 1
        if nxt == b:
            i3 += 1
        if nxt == c:
            i5 += 1
    return ugly[n - 1]
`,
    },
    js: {
      starter: 'function nthUglyNumber(n) {\n  // write your code here\n}\n',
      solution: `function nthUglyNumber(n) {
  const ugly = [1];
  let i2 = 0, i3 = 0, i5 = 0;
  while (ugly.length < n) {
    const a = ugly[i2] * 2, b = ugly[i3] * 3, c = ugly[i5] * 5;
    const nxt = Math.min(a, b, c);
    ugly.push(nxt);
    if (nxt === a) i2++;
    if (nxt === b) i3++;
    if (nxt === c) i5++;
  }
  return ugly[n - 1];
}
`,
    },
    tests: [
      { args: [1], expect: 1 },
      { args: [10], expect: 12 },
      { args: [7], expect: 8 },
      { args: [15], expect: 24 },
      { args: [100], expect: 1536 },
      { args: [150], expect: 5832 },
    ],
  },
  {
    id: 'mt-fraction-to-decimal',
    title: 'Fraction to Recurring Decimal',
    diff: 'Medium',
    pattern: 'Math & Number Theory',
    companies: ['Google', 'Amazon', 'Microsoft'],
    statement: "Given integers `numerator` and `denominator` (denominator not zero), return the value of the fraction as a decimal string. If the fractional part repeats forever, put the repeating block in parentheses, for example `1/6 = \"0.1(6)\"`. Terminating decimals have no parentheses and whole numbers have no decimal point.",
    examples: [
      { input: 'numerator = 4, denominator = 333', output: '"0.(012)"' },
      { input: 'numerator = -50, denominator = 8', output: '"-6.25"' },
    ],
    constraints: ['-2^31 <= numerator, denominator <= 2^31 - 1', 'denominator != 0'],
    hints: ['Do long division by hand: remainder * 10, next digit, new remainder.', 'The digits start repeating exactly when a remainder repeats. Remember where each remainder first appeared.'],
    approach: "Handle the sign separately: the result is negative when exactly one input is negative and the numerator is not zero. Work with absolute values. The integer part is `a // b` and the remainder is `a % b`; if the remainder is 0 we are done. Otherwise do long division: multiply the remainder by 10, the next digit is `r // b` and the new remainder is `r % b`. Store each remainder with the position of the digit it produces. When a remainder repeats, the digits from its first position onward form the cycle, so insert '(' there and append ')'. There are fewer than `b` possible remainders, so the loop always ends.",
    complexity: 'Time O(d) where d is the length of the answer (at most the denominator), Space O(d)',
    fn: { py: 'fraction_to_decimal', js: 'fractionToDecimal' },
    py: {
      starter: 'def fraction_to_decimal(numerator, denominator):\n    # write your code here\n    pass\n',
      solution: `def fraction_to_decimal(numerator, denominator):
    if numerator == 0:
        return '0'
    sign = '-' if (numerator < 0) != (denominator < 0) else ''
    a, b = abs(numerator), abs(denominator)
    whole, r = divmod(a, b)
    if r == 0:
        return sign + str(whole)
    digits = []
    seen = {}
    while r and r not in seen:
        seen[r] = len(digits)
        r *= 10
        digits.append(str(r // b))
        r %= b
    if r:
        i = seen[r]
        frac = ''.join(digits[:i]) + '(' + ''.join(digits[i:]) + ')'
    else:
        frac = ''.join(digits)
    return sign + str(whole) + '.' + frac
`,
    },
    js: {
      starter: 'function fractionToDecimal(numerator, denominator) {\n  // write your code here\n}\n',
      solution: `function fractionToDecimal(numerator, denominator) {
  if (numerator === 0) return '0';
  const sign = (numerator < 0) !== (denominator < 0) ? '-' : '';
  const a = Math.abs(numerator), b = Math.abs(denominator);
  const whole = Math.floor(a / b);
  let r = a % b;
  if (r === 0) return sign + whole;
  const digits = [];
  const seen = new Map();
  while (r !== 0 && !seen.has(r)) {
    seen.set(r, digits.length);
    r *= 10;
    digits.push(Math.floor(r / b));
    r %= b;
  }
  let frac;
  if (r !== 0) {
    const i = seen.get(r);
    frac = digits.slice(0, i).join('') + '(' + digits.slice(i).join('') + ')';
  } else frac = digits.join('');
  return sign + whole + '.' + frac;
}
`,
    },
    tests: [
      { args: [1, 2], expect: '0.5' },
      { args: [2, 1], expect: '2' },
      { args: [4, 333], expect: '0.(012)' },
      { args: [1, 6], expect: '0.1(6)' },
      { args: [-50, 8], expect: '-6.25' },
      { args: [0, -5], expect: '0' },
      { args: [22, 7], expect: '3.(142857)' },
      { args: [-1, -2], expect: '0.5' },
      { args: [-2147483648, 1], expect: '-2147483648' },
    ],
  },
  {
    id: 'mt-multiply-strings',
    title: 'Multiply Large Numbers as Strings',
    diff: 'Medium',
    pattern: 'Math & Number Theory',
    companies: ['Amazon', 'Facebook', 'TCS', 'Twitter'],
    statement: "Given two non-negative integers `a` and `b` written as decimal strings, return their product as a string. The numbers can be much larger than any built-in integer type, so do the multiplication digit by digit (no big-integer libraries).",
    examples: [
      { input: 'a = "123", b = "456"', output: '"56088"' },
      { input: 'a = "999", b = "0"', output: '"0"' },
    ],
    constraints: ['1 <= a.length, b.length <= 200', 'a and b contain only digits and have no leading zeros, except the number "0" itself'],
    hints: ['The product of a number with m digits and one with n digits has at most m + n digits.', 'Digit a[i] times digit b[j] contributes to position i + j + 1 of the result array.'],
    approach: "Create an array `res` of `m + n` zeros. Loop over the digits of `a` and `b` from the right. The product `a[i] * b[j]` belongs at position `i + j + 1`; add it there, then move everything above 9 into position `i + j` as a carry. Processing from right to left means every carry is settled before it is used. At the end, skip leading zeros and join the digits; if nothing is left, the answer is \"0\". This is the schoolbook method and runs in O(m n). Adding `a` to itself `b` times would be astronomically slow.",
    complexity: 'Time O(m n), Space O(m + n)',
    fn: { py: 'multiply', js: 'multiply' },
    py: {
      starter: 'def multiply(a, b):\n    # write your code here\n    pass\n',
      solution: `def multiply(a, b):
    m, n = len(a), len(b)
    res = [0] * (m + n)
    for i in range(m - 1, -1, -1):
        for j in range(n - 1, -1, -1):
            total = (ord(a[i]) - 48) * (ord(b[j]) - 48) + res[i + j + 1]
            res[i + j + 1] = total % 10
            res[i + j] += total // 10
    k = 0
    while k < len(res) - 1 and res[k] == 0:
        k += 1
    return ''.join(map(str, res[k:]))
`,
    },
    js: {
      starter: 'function multiply(a, b) {\n  // write your code here\n}\n',
      solution: `function multiply(a, b) {
  const m = a.length, n = b.length;
  const res = new Array(m + n).fill(0);
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const total = (a.charCodeAt(i) - 48) * (b.charCodeAt(j) - 48) + res[i + j + 1];
      res[i + j + 1] = total % 10;
      res[i + j] += Math.floor(total / 10);
    }
  }
  let k = 0;
  while (k < res.length - 1 && res[k] === 0) k++;
  return res.slice(k).join('');
}
`,
    },
    tests: [
      { args: ['123', '456'], expect: '56088' },
      { args: ['0', '52'], expect: '0' },
      { args: ['999', '999'], expect: '998001' },
      { args: ['2', '3'], expect: '6' },
      { args: ['123456789', '987654321'], expect: '121932631112635269' },
      { args: ['1', '0'], expect: '0' },
      { args: ['99999999999999999999', '2'], expect: '199999999999999999998' },
    ],
  },
  {
    id: 'mt-large-factorial',
    title: 'Factorial of a Large Number',
    diff: 'Medium',
    pattern: 'Math & Number Theory',
    companies: ['TCS', 'Infosys', 'Samsung', 'Wipro'],
    statement: "Given `n`, return `n!` (the product 1 * 2 * ... * n) as a decimal string. `0! = 1`. The result quickly exceeds 64-bit integers, so store the number as an array of digits.",
    examples: [
      { input: 'n = 5', output: '"120"' },
      { input: 'n = 25', output: '"15511210043330985984000000"' },
    ],
    constraints: ['0 <= n <= 200'],
    hints: ['Store the digits in reverse order (least significant first) so it is easy to grow the number.', 'To multiply by k, multiply every digit by k, keep the last digit and carry the rest forward.'],
    approach: "Keep the current product as a list of digits, least significant digit first, starting with `[1]`. To multiply by `k`, walk through the digits: compute `digit * k + carry`, store its last digit back and carry the rest. After the walk, append the remaining carry digit by digit. Repeat for k = 2 to n, then reverse the list and join it. The number of digits of n! is about n log10 n, and each multiplication touches every digit once, so the total time is O(n^2 log n). This is how factorials are computed in C or Java without BigInteger.",
    complexity: 'Time O(n * D) where D is the number of digits of n!, Space O(D)',
    fn: { py: 'factorial_string', js: 'factorialString' },
    py: {
      starter: 'def factorial_string(n):\n    # write your code here\n    pass\n',
      solution: `def factorial_string(n):
    digits = [1]
    for k in range(2, n + 1):
        carry = 0
        for i in range(len(digits)):
            cur = digits[i] * k + carry
            digits[i] = cur % 10
            carry = cur // 10
        while carry:
            digits.append(carry % 10)
            carry //= 10
    return ''.join(str(d) for d in reversed(digits))
`,
    },
    js: {
      starter: 'function factorialString(n) {\n  // write your code here\n}\n',
      solution: `function factorialString(n) {
  const digits = [1];
  for (let k = 2; k <= n; k++) {
    let carry = 0;
    for (let i = 0; i < digits.length; i++) {
      const cur = digits[i] * k + carry;
      digits[i] = cur % 10;
      carry = Math.floor(cur / 10);
    }
    while (carry > 0) {
      digits.push(carry % 10);
      carry = Math.floor(carry / 10);
    }
  }
  return digits.reverse().join('');
}
`,
    },
    tests: [
      { args: [0], expect: '1' },
      { args: [1], expect: '1' },
      { args: [5], expect: '120' },
      { args: [10], expect: '3628800' },
      { args: [20], expect: '2432902008176640000' },
      { args: [25], expect: '15511210043330985984000000' },
      { args: [30], expect: '265252859812191058636308480000000' },
    ],
  },
  {
    id: 'mt-count-digit-one',
    title: 'Count of Digit One',
    diff: 'Hard',
    pattern: 'Math & Number Theory',
    companies: ['Google', 'Amazon', 'Microsoft'],
    statement: "Given a non-negative integer `n`, count how many times the digit `1` is written in total when you write every integer from `0` to `n`.",
    examples: [
      { input: 'n = 13', output: '6', explain: 'The ones appear in 1, 10, 11 (twice), 12 and 13.' },
      { input: 'n = 0', output: '0' },
    ],
    constraints: ['0 <= n <= 10^9'],
    hints: ['Count separately how often a 1 appears in the units place, the tens place, the hundreds place, and so on.', 'For place value p, split n into high = n // (p*10), cur = (n // p) % 10 and low = n % p.'],
    approach: "Consider one decimal place at a time with value `p = 1, 10, 100, ...`. Split `n` into the digits above that place (`high`), the digit at that place (`cur`) and the number formed by the digits below (`low`). Full cycles of the higher digits contribute `high * p` ones at this place. If `cur > 1`, the current partial cycle contributes another full `p`; if `cur == 1`, it contributes `low + 1`; if `cur == 0`, it contributes nothing. Summing over all places gives the answer in O(log n). Counting ones in every number from 0 to n is O(n log n), which is too slow for n = 10^9.",
    complexity: 'Time O(log n), Space O(1)',
    fn: { py: 'count_digit_one', js: 'countDigitOne' },
    py: {
      starter: 'def count_digit_one(n):\n    # write your code here\n    pass\n',
      solution: `def count_digit_one(n):
    total = 0
    p = 1
    while p <= n:
        high = n // (p * 10)
        cur = (n // p) % 10
        low = n % p
        total += high * p
        if cur > 1:
            total += p
        elif cur == 1:
            total += low + 1
        p *= 10
    return total
`,
    },
    js: {
      starter: 'function countDigitOne(n) {\n  // write your code here\n}\n',
      solution: `function countDigitOne(n) {
  let total = 0;
  for (let p = 1; p <= n; p *= 10) {
    const high = Math.floor(n / (p * 10));
    const cur = Math.floor(n / p) % 10;
    const low = n % p;
    total += high * p;
    if (cur > 1) total += p;
    else if (cur === 1) total += low + 1;
  }
  return total;
}
`,
    },
    tests: [
      { args: [13], expect: 6 },
      { args: [0], expect: 0 },
      { args: [1], expect: 1 },
      { args: [100], expect: 21 },
      { args: [99], expect: 20 },
      { args: [1000], expect: 301 },
      { args: [2345], expect: 1775 },
      { args: [100000], expect: 50001 },
      { args: [824883294], expect: 767944060 },
    ],
  },
  {
    id: 'mt-kth-permutation',
    title: 'K-th Permutation Sequence',
    diff: 'Hard',
    pattern: 'Math & Number Theory',
    companies: ['Amazon', 'Microsoft', 'Adobe', 'Twitter'],
    statement: "The digits `1, 2, ..., n` can be arranged in `n!` permutations. List them in lexicographic (dictionary) order and number them from 1. Given `n` and `k`, return the `k`-th permutation as a string.",
    examples: [
      { input: 'n = 3, k = 3', output: '"213"', explain: 'The order is 123, 132, 213, 231, 312, 321.' },
      { input: 'n = 4, k = 9', output: '"2314"' },
    ],
    constraints: ['1 <= n <= 9', '1 <= k <= n!'],
    hints: ['With n digits, each choice of first digit is followed by (n-1)! permutations.', 'Use k - 1 (zero-based) and divide by factorials to pick each digit in turn.'],
    approach: "Switch to a zero-based rank `k = k - 1`. Keep the list of unused digits in increasing order. For the first position there are `(n-1)!` permutations for each possible leading digit, so the index of the leading digit is `k // (n-1)!`; remove that digit from the list and set `k = k % (n-1)!`. Repeat with `(n-2)!` for the next position, and so on until the list is empty. This is the factorial number system and needs only n steps with list removals, O(n^2) in total. Generating permutations one by one until the k-th takes up to n! steps.",
    complexity: 'Time O(n^2), Space O(n)',
    fn: { py: 'get_permutation', js: 'getPermutation' },
    py: {
      starter: 'def get_permutation(n, k):\n    # write your code here\n    pass\n',
      solution: `def get_permutation(n, k):
    fact = [1] * (n + 1)
    for i in range(1, n + 1):
        fact[i] = fact[i - 1] * i
    digits = [str(i) for i in range(1, n + 1)]
    k -= 1
    out = []
    for pos in range(n, 0, -1):
        idx, k = divmod(k, fact[pos - 1])
        out.append(digits.pop(idx))
    return ''.join(out)
`,
    },
    js: {
      starter: 'function getPermutation(n, k) {\n  // write your code here\n}\n',
      solution: `function getPermutation(n, k) {
  const fact = [1];
  for (let i = 1; i <= n; i++) fact[i] = fact[i - 1] * i;
  const digits = [];
  for (let i = 1; i <= n; i++) digits.push(String(i));
  k -= 1;
  let out = '';
  for (let pos = n; pos >= 1; pos--) {
    const idx = Math.floor(k / fact[pos - 1]);
    k %= fact[pos - 1];
    out += digits.splice(idx, 1)[0];
  }
  return out;
}
`,
    },
    tests: [
      { args: [3, 3], expect: '213' },
      { args: [4, 9], expect: '2314' },
      { args: [3, 1], expect: '123' },
      { args: [1, 1], expect: '1' },
      { args: [9, 362880], expect: '987654321' },
      { args: [4, 24], expect: '4321' },
      { args: [5, 50], expect: '31254' },
      { args: [6, 400], expect: '425361' },
    ],
  },
  {
    id: 'mt-largest-multiple-of-three',
    title: 'Largest Multiple of Three from Digits',
    diff: 'Hard',
    pattern: 'Math & Number Theory',
    companies: ['Google', 'Amazon', 'Directi'],
    statement: "Given an array `digits` (each 0 to 9), build the largest number that is a multiple of 3 by concatenating some of the digits in any order. Each digit can be used at most once. Return it as a string without unnecessary leading zeros (all zeros give `\"0\"`). If no non-empty selection works, return `\"\"`.",
    examples: [
      { input: 'digits = [8, 1, 9]', output: '"981"' },
      { input: 'digits = [8, 6, 7, 1, 0]', output: '"8760"', explain: 'The sum is 22 (remainder 1), so drop the 1.' },
      { input: 'digits = [1]', output: '""' },
    ],
    constraints: ['1 <= digits.length <= 10^4', '0 <= digits[i] <= 9'],
    hints: ['A number is divisible by 3 exactly when its digit sum is.', 'If the sum leaves remainder r, remove the smallest digit with remainder r, or if none exists, the two smallest digits with remainder 3 - r.'],
    approach: "Count how many of each digit we have and compute the digit sum. If the sum mod 3 is 0, use every digit. If it is 1, the cheapest fix is to drop one digit with remainder 1 (1, 4 or 7, the smallest available); if none exists, drop two digits with remainder 2 (2, 5, 8, smallest first). If the remainder is 2, do the mirror image. Dropping the fewest and smallest digits keeps the number as long and as large as possible. Then output the remaining digits from 9 down to 0. If nothing is left return \"\", and if the largest digit is 0 return \"0\". Using counts avoids sorting, so the whole thing is linear.",
    complexity: 'Time O(n), Space O(1) besides the output',
    fn: { py: 'largest_multiple_of_three', js: 'largestMultipleOfThree' },
    py: {
      starter: 'def largest_multiple_of_three(digits):\n    # write your code here\n    pass\n',
      solution: `def largest_multiple_of_three(digits):
    cnt = [0] * 10
    for d in digits:
        cnt[d] += 1
    r = sum(digits) % 3

    def remove(rem, times):
        for d in range(10):
            while d % 3 == rem and cnt[d] > 0 and times > 0:
                cnt[d] -= 1
                times -= 1
        return times == 0

    if r:
        saved = cnt[:]
        if not remove(r, 1):
            cnt[:] = saved
            if not remove(3 - r, 2):
                return ''
    out = ''.join(str(d) * cnt[d] for d in range(9, -1, -1))
    if not out:
        return ''
    return '0' if out[0] == '0' else out
`,
    },
    js: {
      starter: 'function largestMultipleOfThree(digits) {\n  // write your code here\n}\n',
      solution: `function largestMultipleOfThree(digits) {
  let cnt = new Array(10).fill(0);
  let sum = 0;
  for (const d of digits) { cnt[d]++; sum += d; }
  const r = sum % 3;
  const remove = (rem, times) => {
    for (let d = 0; d < 10; d++) {
      while (d % 3 === rem && cnt[d] > 0 && times > 0) { cnt[d]--; times--; }
    }
    return times === 0;
  };
  if (r) {
    const saved = cnt.slice();
    if (!remove(r, 1)) {
      cnt = saved;
      if (!remove(3 - r, 2)) return '';
    }
  }
  let out = '';
  for (let d = 9; d >= 0; d--) out += String(d).repeat(cnt[d]);
  if (!out) return '';
  return out[0] === '0' ? '0' : out;
}
`,
    },
    tests: [
      { args: [[8, 1, 9]], expect: '981' },
      { args: [[8, 6, 7, 1, 0]], expect: '8760' },
      { args: [[1]], expect: '' },
      { args: [[0, 0, 0, 0]], expect: '0' },
      { args: [[1, 1, 1, 2]], expect: '111' },
      { args: [[9, 8, 6, 8, 6]], expect: '966' },
      { args: [[2, 2, 1, 1, 1]], expect: '2211' },
      { args: [[5, 8]], expect: '' },
      { args: [[1, 0]], expect: '0' },
    ],
  },
];
