export default {
  lesson: 'day-09-strings',
  minutes: 30,
  intro: 'Index and slice strings, use string methods to clean input, and solve classic programs: palindrome and character counting.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `s = "Python"
print(s[0], s[-1])
print(s[1:4])
print(s[::-1])
print(s[::2])
print(s[10:])`,
      expected: 'P n\nyth\nnohtyP\nPto\n',
      explain: 'Index 0 is the first character, -1 the last. `s[1:4]` takes indexes 1, 2, 3 (stop excluded). `[::-1]` reverses, `[::2]` takes every 2nd character. Slicing **never** raises IndexError: `s[10:]` is just an empty string (the last line is blank).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '```\nname = "java"\nname[0] = "J"\n```\nWhat happens?',
      options: ['name becomes "Java"', 'TypeError: \'str\' object does not support item assignment', 'name becomes "J"', 'IndexError'],
      answer: 1,
      explain: 'Strings are **immutable**: you cannot change a character in place. Build a new string instead: `name = "J" + name[1:]` or `name = name.capitalize()`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: '`words = ["learn", "python", "fast"]`. Complete the expression that gives `"learn-python-fast"`:\n```\nslug = ____\n```',
      accept: ['"-".join(words)', "'-'.join(words)"],
      explain: '`separator.join(list_of_strings)` joins items with the separator between them. A common mistake is `words.join("-")`: join is a method of the **separator string**, not of the list.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Clean a name typed into a form. Read a line (no prompt) such as `   asha PATIL  ` and print two lines:\n```\nAsha Patil\nAP\n```\n(the cleaned name in title case, then the initials in capitals).',
      example: { title: 'chaining string methods', code: 'city = "  nAVI mumbai "\nprint(city.strip().title())      # Navi Mumbai\nprint(city.split())               # [\'nAVI\', \'mumbai\']' },
      stdin: '   asha PATIL  ',
      starter: `raw = input()
# TODO: clean the name and print it
# TODO: print the initials
`,
      solution: `raw = input()
name = raw.strip().title()
print(name)
first, last = name.split()
print(first[0] + last[0])`,
      tests: [{ stdout: 'Asha Patil\nAP' }],
      explain: '`strip()` removes spaces at both ends and `title()` capitalises each word. Because strings are immutable, each method returns a **new** string: you must store the result (`name = ...`). `split()` without arguments splits on any whitespace.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Palindrome sentence. Read a line and print `Palindrome` if it reads the same backwards **ignoring case and spaces**, else `Not palindrome`.\n\nTest input: `Never odd or even`',
      example: { title: 'reverse with slicing', code: 'w = "level"\nprint(w == w[::-1])   # True' },
      stdin: 'Never odd or even',
      starter: `text = input()
# TODO: remove spaces, lowercase, compare with reverse
`,
      solution: `text = input()
clean = text.replace(" ", "").lower()
if clean == clean[::-1]:
    print("Palindrome")
else:
    print("Not palindrome")`,
      tests: [{ stdout: 'Palindrome' }],
      explain: 'First normalise: `replace(" ", "")` removes spaces and `lower()` ignores case. Then compare with the reversed string `[::-1]`. Without normalising, "N" ≠ "n" and the check fails.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Read a sentence and print the number of **vowels** (a, e, i, o, u, upper or lower case) in this format:\n```\nVowels: 9\n```\nTest input: `Education in India`',
      example: { title: 'loop over characters', code: 'count = 0\nfor ch in "banana":\n    if ch == "a":\n        count += 1\nprint(count)   # 3' },
      stdin: 'Education in India',
      starter: `text = input()
count = 0
# TODO: count vowels
print("Vowels:", count)`,
      solution: `text = input()
count = 0
for ch in text.lower():
    if ch in "aeiou":
        count += 1
print("Vowels:", count)`,
      tests: [{ stdout: 'Vowels: 9' }],
      explain: 'Loop over each character, lowercase it once and test membership with `in "aeiou"`. Forgetting `lower()` misses capital vowels like the E and I here (you would get 7).',
    },
  ],
};
