export default {
  lesson: 'day-08-loops',
  minutes: 30,
  intro: 'Use for with range(), while loops, break/continue and loop-else to print tables, reverse numbers and test primes.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which numbers does `range(2, 11, 3)` produce?',
      options: ['2, 5, 8, 11', '2, 5, 8', '3, 6, 9', '2, 3, 4 ... 10'],
      answer: 1,
      explain: '`range(start, stop, step)` starts at 2, adds 3 each time and **stops before** 11: 2, 5, 8. The stop value is never included: the most common off-by-one mistake.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `for i in range(10, 0, -3):
    print(i, end=" ")
print()
for n in [3, 5, 7]:
    if n == 5:
        continue
    print(n)
else:
    print("loop done")`,
      expected: '10 7 4 1\n3\n7\nloop done',
      explain: 'A negative step counts down: 10, 7, 4, 1. `continue` skips the rest of that iteration (5 is not printed). The `else` of a loop runs when the loop finishes **without** `break`; `continue` does not stop it.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'Read a number `n` (no prompt) and print its multiplication table from 1 to 10 in this format:\n```\n7 x 1 = 7\n7 x 2 = 14\n...\n7 x 10 = 70\n```',
      example: { title: 'for with range()', code: 'for i in range(1, 4):\n    print(i, "squared is", i * i)' },
      stdin: '7',
      starter: `n = int(input())
# TODO: loop from 1 to 10
`,
      solution: `n = int(input())
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")`,
      tests: [{ stdout: Array.from({ length: 10 }, (_, i) => `7 x ${i + 1} = ${7 * (i + 1)}`).join('\n') }],
      explain: '`range(1, 11)` gives 1..10 because the stop value is excluded. `range(1, 10)` would miss the last line.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Read a positive integer and, using a **while** loop with `%` and `//` (no string slicing), build its reverse. Print:\n```\nReverse: 12321\nPalindrome\n```\n(print `Not palindrome` when the reverse is different). Test input: `12321`.',
      example: { title: 'taking digits one by one', code: 'n = 345\nwhile n > 0:\n    print(n % 10)   # 5, 4, 3\n    n = n // 10' },
      stdin: '12321',
      starter: `n = int(input())
rev = 0
# TODO: while loop to build rev
print("Reverse:", rev)
`,
      solution: `n = int(input())
original = n
rev = 0
while n > 0:
    rev = rev * 10 + n % 10
    n //= 10
print("Reverse:", rev)
if rev == original:
    print("Palindrome")
else:
    print("Not palindrome")`,
      tests: [{ stdout: 'Reverse: 12321\nPalindrome' }],
      explain: '`rev = rev * 10 + n % 10` shifts the reverse left and adds the last digit; `n //= 10` removes it so the loop ends. Save the original first: after the loop `n` is 0. Forgetting `n //= 10` makes an infinite loop.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Prime check with **for-else**. Read a number (≥ 2) and print `<n> is prime` or `<n> is not prime`. Use `break` when you find a divisor and the loop’s `else` for the prime case.\n\nTest input: `91` (= 7 × 13, a classic trap).',
      example: { title: 'search with for-else', code: 'for name in ["Asha", "Ravi"]:\n    if name == "Neha":\n        print("found")\n        break\nelse:\n    print("not found")' },
      stdin: '91',
      starter: `n = int(input())
# TODO: for d in range(...): ... break ... else: ...
`,
      solution: `n = int(input())
for d in range(2, int(n ** 0.5) + 1):
    if n % d == 0:
        print(n, "is not prime")
        break
else:
    print(n, "is prime")`,
      tests: [{ stdout: '91 is not prime' }],
      explain: 'Checking divisors up to √n is enough. The `else` of the for loop runs only if no `break` happened, which is exactly "no divisor found". Checking only "is it odd?" wrongly calls 91 prime.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which keyword **exits a loop immediately**, skipping the loop’s `else` block?',
      accept: ['break'],
      explain: '`break` ends the loop at once (and skips `else`). `continue` only skips to the next iteration, and `pass` does nothing (a placeholder).',
    },
  ],
};
