export default {
  id: "day-43-coding-interview-programs",
  title: "Must-Know Python Coding Interview Programs",
  module: "Module 7: Interview Prep & Project",
  day: 43,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Practise the classic Python programs asked in fresher and junior developer interviews - numbers, strings, lists, dictionaries, searching, sorting and logic puzzles - with both the manual (logic) approach and the Pythonic approach, plus time complexity.",
  objectives: [
    "Solve the most frequently asked number, string, list and dictionary programs",
    "Write both the manual algorithm and the Pythonic one-liner for each problem",
    "Explain time and space complexity using Big-O notation",
    "Implement binary search, bubble sort and two-pointer / hashing techniques",
    "Follow a clear problem-solving approach in live coding rounds",
  ],
  theory: [
    {
      heading: "How to Approach a Coding Question",
      content: "Interviewers judge your thinking, not only the final answer. Follow these steps: 1) Repeat the problem and ask about inputs (empty list? negatives? case-sensitive?). 2) Give a simple brute-force idea. 3) Improve it (hashing, sorting, two pointers). 4) Write clean code with good names. 5) Dry-run with an example and an edge case. 6) State the time and space complexity.",
      tip: "Speak while you code. Silence makes it hard for the interviewer to give hints.",
    },
    {
      heading: "Big-O Notation in Simple Words",
      content: "Big-O describes how the running time grows as the input size n grows. O(1): constant (dict lookup). O(log n): halves the work each step (binary search). O(n): one loop. O(n log n): efficient sorting (sorted()). O(n^2): nested loops (bubble sort). Space complexity measures extra memory used.",
      points: [
        "list 'in' is O(n) but set/dict 'in' is O(1) on average",
        "sorted()/list.sort() use Timsort: O(n log n)",
        "String concatenation in a loop can be O(n^2); use ''.join()",
        "Slicing creates a copy: O(k)",
      ],
    },
    {
      heading: "Number Programs",
      content: "Classic number programs: even/odd, prime check (only test divisors up to the square root), factorial, Fibonacci, palindrome number, Armstrong number (sum of digits each raised to the number of digits equals the number, e.g. 153), sum of digits, reverse a number, GCD/LCM (math.gcd), perfect number, swapping without a temp variable (a, b = b, a). Use % 10 to get the last digit and // 10 to remove it.",
    },
    {
      heading: "String Programs",
      content: "Reverse a string (s[::-1]), palindrome check, count vowels, character frequency (collections.Counter), anagram check (sorted(a) == sorted(b) or Counter), first non-repeating character, remove duplicates keeping order (dict.fromkeys), reverse words in a sentence, capitalize each word, check if a string has all unique characters, longest word.",
      syntax: `s = "level"
s == s[::-1]                        # palindrome
from collections import Counter
Counter("banana")                   # {'a': 3, 'n': 2, 'b': 1}
"".join(dict.fromkeys("programming"))  # 'progamin'
" ".join(reversed("I love Python".split()))
`,
    },
    {
      heading: "List and Dictionary Programs",
      content: "Second largest element, find duplicates, remove duplicates, missing number in 1..n (n*(n+1)//2 - sum), two-sum with a dictionary (O(n)), rotate a list, merge two sorted lists, flatten a nested list (recursion), most frequent element, count word frequency, sort a dictionary by value, merge dictionaries (d1 | d2), group items by key, transpose a matrix.",
      points: [
        "Two-sum: store seen numbers in a dict -> O(n) instead of O(n^2)",
        "Second largest: one pass with two variables, or sorted(set(nums))[-2]",
        "Sort dict by value: sorted(d.items(), key=lambda kv: kv[1], reverse=True)",
      ],
    },
    {
      heading: "Searching and Sorting",
      content: "Linear search checks each element: O(n). Binary search works on SORTED data and halves the search range each time: O(log n) - Python's bisect module implements it. Bubble sort repeatedly swaps adjacent elements: O(n^2), asked to test loop logic. In real code use sorted() or list.sort() with key= and reverse=.",
      tip: "If asked 'without using built-ins', write the manual loop; then mention the built-in to show you know both.",
    },
  ],
  examples: [
    {
      title: "Number Programs: Prime, Fibonacci, Armstrong, Palindrome, GCD",
      scenario: "The most common number-based questions in one script, each as a small function.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import math

def is_prime(n):
    if n < 2:
        return False
    for d in range(2, int(n ** 0.5) + 1):   # only up to sqrt(n)
        if n % d == 0:
            return False
    return True

def fibonacci(n):
    a, b, series = 0, 1, []
    for _ in range(n):
        series.append(a)
        a, b = b, a + b
    return series

def factorial(n):
    return 1 if n <= 1 else n * factorial(n - 1)

def is_armstrong(n):
    digits = str(n)
    return n == sum(int(d) ** len(digits) for d in digits)

def reverse_number(n):
    rev = 0
    while n > 0:
        rev = rev * 10 + n % 10    # take last digit
        n //= 10                    # remove last digit
    return rev

def is_palindrome_number(n):
    return n == reverse_number(n)

print("Primes < 30:", [n for n in range(30) if is_prime(n)])
print("Fibonacci 10:", fibonacci(10))
print("5! =", factorial(5))
print("Armstrong 1-999:", [n for n in range(1, 1000) if is_armstrong(n) and n > 9])
print("Reverse 12345:", reverse_number(12345))
print("121 palindrome?", is_palindrome_number(121), "| 123?", is_palindrome_number(123))
print("Sum of digits 9875:", sum(map(int, str(9875))))
print("GCD(48, 18) =", math.gcd(48, 18), "| LCM =", 48 * 18 // math.gcd(48, 18))
a, b = 5, 9
a, b = b, a                          # swap without temp
print("Swapped:", a, b)
`,
      python: {
        files: {
          "main.py": `import math

def is_prime(n):
    if n < 2:
        return False
    for d in range(2, int(n ** 0.5) + 1):   # only up to sqrt(n)
        if n % d == 0:
            return False
    return True

def fibonacci(n):
    a, b, series = 0, 1, []
    for _ in range(n):
        series.append(a)
        a, b = b, a + b
    return series

def factorial(n):
    return 1 if n <= 1 else n * factorial(n - 1)

def is_armstrong(n):
    digits = str(n)
    return n == sum(int(d) ** len(digits) for d in digits)

def reverse_number(n):
    rev = 0
    while n > 0:
        rev = rev * 10 + n % 10    # take last digit
        n //= 10                    # remove last digit
    return rev

def is_palindrome_number(n):
    return n == reverse_number(n)

print("Primes < 30:", [n for n in range(30) if is_prime(n)])
print("Fibonacci 10:", fibonacci(10))
print("5! =", factorial(5))
print("Armstrong 1-999:", [n for n in range(1, 1000) if is_armstrong(n) and n > 9])
print("Reverse 12345:", reverse_number(12345))
print("121 palindrome?", is_palindrome_number(121), "| 123?", is_palindrome_number(123))
print("Sum of digits 9875:", sum(map(int, str(9875))))
print("GCD(48, 18) =", math.gcd(48, 18), "| LCM =", 48 * 18 // math.gcd(48, 18))
a, b = 5, 9
a, b = b, a                          # swap without temp
print("Swapped:", a, b)
`,
        },
      },
      result: `Primes < 30: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
Fibonacci 10: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
5! = 120
Armstrong 1-999: [153, 370, 371, 407]
Reverse 12345: 54321
121 palindrome? True | 123? False
Sum of digits 9875: 29
GCD(48, 18) = 6 | LCM = 144
Swapped: 9 5`,
      explanation: "is_prime only checks divisors up to sqrt(n), which is O(sqrt n). Fibonacci uses tuple swapping. Armstrong numbers (153, 370, 371, 407) equal the sum of their digits raised to the digit count. reverse_number uses % 10 and // 10 - interviewers often ask for this instead of str()[::-1]. math.gcd gives the GCD and LCM = a*b // gcd.",
    },
    {
      title: "String Programs: Palindrome, Anagram, Frequency, First Unique",
      scenario: "Common string questions solved manually and in Pythonic style.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import Counter

def is_palindrome(s):
    clean = "".join(ch.lower() for ch in s if ch.isalnum())
    return clean == clean[::-1]

def reverse_manual(s):
    result = ""
    for ch in s:
        result = ch + result
    return result

def is_anagram(a, b):
    return Counter(a.replace(" ", "").lower()) == Counter(b.replace(" ", "").lower())

def first_non_repeating(s):
    counts = Counter(s)
    for ch in s:
        if counts[ch] == 1:
            return ch
    return None

def char_frequency(s):
    freq = {}
    for ch in s:
        freq[ch] = freq.get(ch, 0) + 1
    return freq

text = "A man, a plan, a canal: Panama"
print(is_palindrome(text), is_palindrome("hello"))
print(reverse_manual("python"), "python"[::-1])
print(is_anagram("Listen", "Silent"), is_anagram("apple", "paper"))
print(first_non_repeating("swiss"), first_non_repeating("aabb"))
print(char_frequency("banana"))
print(Counter("mississippi").most_common(2))
print("Vowels:", sum(1 for ch in "Programming Language" if ch.lower() in "aeiou"))
print("No duplicates:", "".join(dict.fromkeys("programming")))
print("Reverse words:", " ".join("I love Python".split()[::-1]))
print("Title case:", "welcome to python course".title())
words = "Python is an amazing programming language".split()
print("Longest word:", max(words, key=len))
`,
      python: {
        files: {
          "main.py": `from collections import Counter

def is_palindrome(s):
    clean = "".join(ch.lower() for ch in s if ch.isalnum())
    return clean == clean[::-1]

def reverse_manual(s):
    result = ""
    for ch in s:
        result = ch + result
    return result

def is_anagram(a, b):
    return Counter(a.replace(" ", "").lower()) == Counter(b.replace(" ", "").lower())

def first_non_repeating(s):
    counts = Counter(s)
    for ch in s:
        if counts[ch] == 1:
            return ch
    return None

def char_frequency(s):
    freq = {}
    for ch in s:
        freq[ch] = freq.get(ch, 0) + 1
    return freq

text = "A man, a plan, a canal: Panama"
print(is_palindrome(text), is_palindrome("hello"))
print(reverse_manual("python"), "python"[::-1])
print(is_anagram("Listen", "Silent"), is_anagram("apple", "paper"))
print(first_non_repeating("swiss"), first_non_repeating("aabb"))
print(char_frequency("banana"))
print(Counter("mississippi").most_common(2))
print("Vowels:", sum(1 for ch in "Programming Language" if ch.lower() in "aeiou"))
print("No duplicates:", "".join(dict.fromkeys("programming")))
print("Reverse words:", " ".join("I love Python".split()[::-1]))
print("Title case:", "welcome to python course".title())
words = "Python is an amazing programming language".split()
print("Longest word:", max(words, key=len))
`,
        },
      },
      result: `True False
nohtyp nohtyp
True False
w None
{'b': 1, 'a': 3, 'n': 2}
[('i', 4), ('s', 4)]
Vowels: 7
No duplicates: progamin
Reverse words: Python love I
Title case: Welcome To Python Course
Longest word: programming`,
      explanation: "The palindrome check removes punctuation and spaces and ignores case. reverse_manual builds the string from the front (O(n^2) because strings are immutable - fine for interviews, but [::-1] is better). Counter makes anagram and frequency checks easy. dict.fromkeys keeps the first occurrence of each character in order.",
    },
    {
      title: "List Programs: Second Largest, Duplicates, Missing Number, Two Sum",
      scenario: "Classic array questions with efficient solutions.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def second_largest(nums):
    first = second = float("-inf")
    for n in nums:
        if n > first:
            first, second = n, first
        elif first > n > second:
            second = n
    return second

def find_duplicates(nums):
    seen, dups = set(), set()
    for n in nums:
        if n in seen:
            dups.add(n)
        seen.add(n)
    return sorted(dups)

def missing_number(nums, n):
    return n * (n + 1) // 2 - sum(nums)

def two_sum(nums, target):
    seen = {}                          # value -> index
    for i, n in enumerate(nums):
        if target - n in seen:
            return seen[target - n], i
        seen[n] = i
    return None

def rotate(nums, k):
    k %= len(nums)
    return nums[-k:] + nums[:-k]

def merge_sorted(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    return out + a[i:] + b[j:]

def flatten(lst):
    result = []
    for item in lst:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result

nums = [12, 45, 2, 41, 45, 10, 2]
print("Second largest:", second_largest(nums))
print("Duplicates:", find_duplicates(nums))
print("Unique (order kept):", list(dict.fromkeys(nums)))
print("Missing:", missing_number([1, 2, 4, 5, 6], 6))
print("Two sum indexes:", two_sum([2, 7, 11, 15], 18))
print("Rotate right by 2:", rotate([1, 2, 3, 4, 5], 2))
print("Merged:", merge_sorted([1, 4, 9], [2, 3, 10, 12]))
print("Flatten:", flatten([1, [2, [3, 4]], [5], 6]))
print("Max/Min without built-ins idea -> built-ins:", max(nums), min(nums))
evens, odds = [n for n in nums if n % 2 == 0], [n for n in nums if n % 2]
print("Evens:", evens, "Odds:", odds)
`,
      python: {
        files: {
          "main.py": `def second_largest(nums):
    first = second = float("-inf")
    for n in nums:
        if n > first:
            first, second = n, first
        elif first > n > second:
            second = n
    return second

def find_duplicates(nums):
    seen, dups = set(), set()
    for n in nums:
        if n in seen:
            dups.add(n)
        seen.add(n)
    return sorted(dups)

def missing_number(nums, n):
    return n * (n + 1) // 2 - sum(nums)

def two_sum(nums, target):
    seen = {}                          # value -> index
    for i, n in enumerate(nums):
        if target - n in seen:
            return seen[target - n], i
        seen[n] = i
    return None

def rotate(nums, k):
    k %= len(nums)
    return nums[-k:] + nums[:-k]

def merge_sorted(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    return out + a[i:] + b[j:]

def flatten(lst):
    result = []
    for item in lst:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result

nums = [12, 45, 2, 41, 45, 10, 2]
print("Second largest:", second_largest(nums))
print("Duplicates:", find_duplicates(nums))
print("Unique (order kept):", list(dict.fromkeys(nums)))
print("Missing:", missing_number([1, 2, 4, 5, 6], 6))
print("Two sum indexes:", two_sum([2, 7, 11, 15], 18))
print("Rotate right by 2:", rotate([1, 2, 3, 4, 5], 2))
print("Merged:", merge_sorted([1, 4, 9], [2, 3, 10, 12]))
print("Flatten:", flatten([1, [2, [3, 4]], [5], 6]))
print("Max/Min without built-ins idea -> built-ins:", max(nums), min(nums))
evens, odds = [n for n in nums if n % 2 == 0], [n for n in nums if n % 2]
print("Evens:", evens, "Odds:", odds)
`,
        },
      },
      result: `Second largest: 41
Duplicates: [2, 45]
Unique (order kept): [12, 45, 2, 41, 10]
Missing: 3
Two sum indexes: (1, 2)
Rotate right by 2: [4, 5, 1, 2, 3]
Merged: [1, 2, 3, 4, 9, 10, 12]
Flatten: [1, 2, 3, 4, 5, 6]
Max/Min without built-ins idea -> built-ins: 45 2
Evens: [12, 2, 10, 2] Odds: [45, 41, 45]`,
      explanation: "second_largest finds the answer in one pass (O(n)) and ignores repeated maximums. Duplicates use a set for O(1) lookups. The missing number uses the formula n(n+1)/2. two_sum stores seen values in a dict so each lookup is O(1), giving O(n) overall instead of nested loops. merge_sorted is the merge step of merge sort, and flatten uses recursion for any depth.",
    },
    {
      title: "Dictionary Programs: Word Count, Sort by Value, Group By, Merge",
      scenario: "Text and data processing questions that test dictionary skills.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import Counter, defaultdict

sentence = "the quick brown fox jumps over the lazy dog the end"
counts = {}
for word in sentence.split():
    counts[word] = counts.get(word, 0) + 1
print("Word count:", counts)
print("Top 2:", Counter(sentence.split()).most_common(2))

marks = {"Asha": 88, "Ravi": 72, "Neha": 95, "Arun": 72}
by_value = dict(sorted(marks.items(), key=lambda kv: kv[1], reverse=True))
print("Sorted by marks:", by_value)
print("Topper:", max(marks, key=marks.get))

students = [("Asha", "CSE"), ("Ravi", "ECE"), ("Neha", "CSE"), ("Arun", "MECH"), ("Divya", "ECE")]
groups = defaultdict(list)
for name, dept in students:
    groups[dept].append(name)
print("Grouped:", dict(groups))

d1 = {"a": 1, "b": 2}
d2 = {"b": 20, "c": 3}
print("Merged:", d1 | d2, {**d1, **d2} == d1 | d2)
print("Inverted:", {v: k for k, v in d1.items()})
print("Common keys:", d1.keys() & d2.keys())

words = ["listen", "silent", "enlist", "google", "gogole", "cat"]
anagram_groups = defaultdict(list)
for w in words:
    anagram_groups["".join(sorted(w))].append(w)
print("Anagram groups:", list(anagram_groups.values()))
`,
      python: {
        files: {
          "main.py": `from collections import Counter, defaultdict

sentence = "the quick brown fox jumps over the lazy dog the end"
counts = {}
for word in sentence.split():
    counts[word] = counts.get(word, 0) + 1
print("Word count:", counts)
print("Top 2:", Counter(sentence.split()).most_common(2))

marks = {"Asha": 88, "Ravi": 72, "Neha": 95, "Arun": 72}
by_value = dict(sorted(marks.items(), key=lambda kv: kv[1], reverse=True))
print("Sorted by marks:", by_value)
print("Topper:", max(marks, key=marks.get))

students = [("Asha", "CSE"), ("Ravi", "ECE"), ("Neha", "CSE"), ("Arun", "MECH"), ("Divya", "ECE")]
groups = defaultdict(list)
for name, dept in students:
    groups[dept].append(name)
print("Grouped:", dict(groups))

d1 = {"a": 1, "b": 2}
d2 = {"b": 20, "c": 3}
print("Merged:", d1 | d2, {**d1, **d2} == d1 | d2)
print("Inverted:", {v: k for k, v in d1.items()})
print("Common keys:", d1.keys() & d2.keys())

words = ["listen", "silent", "enlist", "google", "gogole", "cat"]
anagram_groups = defaultdict(list)
for w in words:
    anagram_groups["".join(sorted(w))].append(w)
print("Anagram groups:", list(anagram_groups.values()))
`,
        },
      },
      result: `Word count: {'the': 3, 'quick': 1, 'brown': 1, 'fox': 1, 'jumps': 1, 'over': 1, 'lazy': 1, 'dog': 1, 'end': 1}
Top 2: [('the', 3), ('quick', 1)]
Sorted by marks: {'Neha': 95, 'Asha': 88, 'Ravi': 72, 'Arun': 72}
Topper: Neha
Grouped: {'CSE': ['Asha', 'Neha'], 'ECE': ['Ravi', 'Divya'], 'MECH': ['Arun']}
Merged: {'a': 1, 'b': 20, 'c': 3} True
Inverted: {1: 'a', 2: 'b'}
Common keys: {'b'}
Anagram groups: [['listen', 'silent', 'enlist'], ['google', 'gogole'], ['cat']]`,
      explanation: "dict.get(key, 0) + 1 is the classic counting pattern; Counter does the same in one line. sorted() with key=lambda kv: kv[1] sorts by value. max(d, key=d.get) returns the key with the highest value. defaultdict(list) groups items without checking if the key exists. | merges dicts (later values win). Sorting the letters of each word gives a common key for anagrams.",
    },
    {
      title: "Searching and Sorting: Binary Search, Bubble Sort, Patterns",
      scenario: "Write the classic algorithms by hand and compare with Python built-ins.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import bisect

def linear_search(items, target):
    for i, value in enumerate(items):
        if value == target:
            return i
    return -1

def binary_search(items, target):
    low, high, steps = 0, len(items) - 1, 0
    while low <= high:
        steps += 1
        mid = (low + high) // 2
        if items[mid] == target:
            return mid, steps
        if items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1, steps

def bubble_sort(items):
    arr = items[:]
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:            # already sorted -> stop early
            break
    return arr

data = list(range(0, 100, 3))      # sorted: 0, 3, 6 ... 99
print("Linear search 72:", linear_search(data, 72))
print("Binary search 72 (index, steps):", binary_search(data, 72))
print("Binary search 50:", binary_search(data, 50))
print("bisect index of 72:", bisect.bisect_left(data, 72))

unsorted = [64, 34, 25, 12, 22, 11, 90]
print("Bubble sort:", bubble_sort(unsorted))
print("sorted() desc:", sorted(unsorted, reverse=True))
print("Sort by last digit:", sorted(unsorted, key=lambda x: x % 10))

for i in range(1, 5):
    print(" " * (4 - i) + "* " * i)

for n in range(1, 16):
    print("FizzBuzz" if n % 15 == 0 else "Fizz" if n % 3 == 0 else "Buzz" if n % 5 == 0 else n, end=" ")
print()
`,
      python: {
        files: {
          "main.py": `import bisect

def linear_search(items, target):
    for i, value in enumerate(items):
        if value == target:
            return i
    return -1

def binary_search(items, target):
    low, high, steps = 0, len(items) - 1, 0
    while low <= high:
        steps += 1
        mid = (low + high) // 2
        if items[mid] == target:
            return mid, steps
        if items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1, steps

def bubble_sort(items):
    arr = items[:]
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:            # already sorted -> stop early
            break
    return arr

data = list(range(0, 100, 3))      # sorted: 0, 3, 6 ... 99
print("Linear search 72:", linear_search(data, 72))
print("Binary search 72 (index, steps):", binary_search(data, 72))
print("Binary search 50:", binary_search(data, 50))
print("bisect index of 72:", bisect.bisect_left(data, 72))

unsorted = [64, 34, 25, 12, 22, 11, 90]
print("Bubble sort:", bubble_sort(unsorted))
print("sorted() desc:", sorted(unsorted, reverse=True))
print("Sort by last digit:", sorted(unsorted, key=lambda x: x % 10))

for i in range(1, 5):
    print(" " * (4 - i) + "* " * i)

for n in range(1, 16):
    print("FizzBuzz" if n % 15 == 0 else "Fizz" if n % 3 == 0 else "Buzz" if n % 5 == 0 else n, end=" ")
print()
`,
        },
      },
      result: `Linear search 72: 24
Binary search 72 (index, steps): (24, 6)
Binary search 50: (-1, 5)
bisect index of 72: 24
Bubble sort: [11, 12, 22, 25, 34, 64, 90]
sorted() desc: [90, 64, 34, 25, 22, 12, 11]
Sort by last digit: [90, 11, 12, 22, 64, 34, 25]
   * 
  * * 
 * * * 
* * * * 
1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz `,
      explanation: "Linear search checks up to n items. Binary search on 34 sorted items finds 72 in only a few steps because it halves the range each time (O(log n)); 50 is not a multiple of 3 so it returns -1. bisect is the built-in binary search. Bubble sort swaps neighbours and stops early when no swap happens. The pyramid and FizzBuzz are popular warm-up questions.",
    },
  ],
  interview: [
    {
      q: "How do you check if a number is prime efficiently?",
      a: "Return False for n < 2, then test divisors from 2 up to int(sqrt(n)); if none divides n, it is prime. Time O(sqrt n).",
      level: "Easy",
    },
    {
      q: "How do you reverse a string in Python?",
      a: "s[::-1] (slicing), ''.join(reversed(s)), or a loop building a new string. Strings are immutable so a new string is always created.",
      level: "Easy",
    },
    {
      q: "How do you find duplicates in a list efficiently?",
      a: "Use a set of seen items in one pass (O(n)) or collections.Counter and pick counts > 1.",
      level: "Easy",
    },
    {
      q: "Explain the two-sum problem solution in O(n).",
      a: "Loop once, store each value's index in a dict; for each number check if target - number is already in the dict.",
      level: "Medium",
    },
    {
      q: "What is the time complexity of binary search and its requirement?",
      a: "O(log n); the data must be sorted.",
      level: "Easy",
    },
    {
      q: "How do you remove duplicates from a list while keeping order?",
      a: "list(dict.fromkeys(lst)) - dicts preserve insertion order (3.7+). set() removes duplicates but does not keep order.",
      level: "Medium",
    },
    {
      q: `What is the output?
print(sorted('banana'))`,
      a: "['a', 'a', 'a', 'b', 'n', 'n'] - sorted on a string returns a list of characters.",
      level: "Easy",
    },
    {
      q: `What is the output?
nums = [1, 2, 3]
print(nums[-2:] + nums[:-2])`,
      a: "[2, 3, 1] - this rotates the list right by 2.",
      level: "Medium",
    },
    {
      q: `What is the output?
from collections import Counter
print(Counter('aab').most_common(1))`,
      a: "[('a', 2)]",
      level: "Easy",
    },
    {
      q: "Why is ''.join(list) preferred over += for building strings?",
      a: "Strings are immutable, so += in a loop creates a new string every time (O(n^2) total). join computes the size once and builds the result in O(n).",
      level: "Medium",
    },
    {
      q: "What is an Armstrong number?",
      a: "A number equal to the sum of its digits each raised to the power of the number of digits, e.g. 153 = 1^3 + 5^3 + 3^3.",
      level: "Easy",
    },
    {
      q: "Difference between sort() and sorted()?",
      a: "list.sort() sorts the list in place and returns None; sorted() works on any iterable and returns a new list. Both are stable and O(n log n).",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Check whether two strings are rotations of each other (e.g. 'abcd' and 'cdab').",
      hint: "b in a + a when lengths are equal.",
      solution: `def is_rotation(a, b):
    return len(a) == len(b) and b in a + a
print(is_rotation("abcd", "cdab"), is_rotation("abcd", "acbd"))   # True False
`,
    },
    {
      task: "Find the longest substring without repeating characters (length).",
      hint: "Sliding window with a dict of last positions.",
      solution: `def longest_unique(s):
    last, start, best = {}, 0, 0
    for i, ch in enumerate(s):
        if ch in last and last[ch] >= start:
            start = last[ch] + 1
        last[ch] = i
        best = max(best, i - start + 1)
    return best
print(longest_unique("abcabcbb"))   # 3
`,
    },
    {
      task: "Print all pairs in a list whose sum equals a target, without duplicates.",
      hint: "Use a set of seen numbers and a set of pairs.",
      solution: `def pairs(nums, target):
    seen, out = set(), set()
    for n in nums:
        if target - n in seen:
            out.add(tuple(sorted((n, target - n))))
        seen.add(n)
    return sorted(out)
print(pairs([1, 5, 7, -1, 5, 3], 6))   # [(-1, 7), (1, 5)]
`,
    },
    {
      task: "Count the number of words, characters (without spaces) and sentences in a paragraph.",
      hint: "split(), replace(' ', ''), count('.').",
      solution: `text = "Python is easy. Python is powerful. Learn it."
print(len(text.split()), len(text.replace(" ", "")), text.count("."))   # 8 38 3
`,
    },
    {
      task: "Write a function to check if a list is sorted without using sorted().",
      hint: "Compare each element with the next using zip.",
      solution: `def is_sorted(lst):
    return all(a <= b for a, b in zip(lst, lst[1:]))
print(is_sorted([1, 2, 2, 5]), is_sorted([3, 1]))   # True False
`,
    },
    {
      task: "Find the most frequent element in a list and how many times it occurs.",
      hint: "Counter(...).most_common(1)[0]",
      solution: `from collections import Counter
print(Counter([3, 1, 3, 2, 3, 1]).most_common(1)[0])   # (3, 3)
`,
    },
  ],
  quiz: [
    {
      question: "Time complexity of checking 'x in my_set' on average?",
      options: [
        "O(n)",
        "O(log n)",
        "O(1)",
        "O(n^2)",
      ],
      answer: 2,
      explanation: "Sets use hashing.",
    },
    {
      question: "Which expression reverses the string s?",
      options: [
        "s.reverse()",
        "s[::-1]",
        "reversed(s) as a string",
        "s[-1:]",
      ],
      answer: 1,
      explanation: "Slicing with step -1; str has no reverse() method.",
    },
    {
      question: "Binary search requires the data to be:",
      options: [
        "Sorted",
        "Unique",
        "Numeric only",
        "Stored in a dict",
      ],
      answer: 0,
      explanation: "It relies on ordering to discard half the range.",
    },
    {
      question: "Output of list(dict.fromkeys([3, 1, 3, 2, 1]))?",
      options: [
        "[1, 2, 3]",
        "[3, 1, 3, 2, 1]",
        "[3, 2, 1]",
        "[3, 1, 2]",
      ],
      answer: 3,
      explanation: "First occurrences in original order.",
    },
    {
      question: "Worst-case time complexity of bubble sort?",
      options: [
        "O(n)",
        "O(n log n)",
        "O(log n)",
        "O(n^2)",
      ],
      answer: 3,
      explanation: "Nested loops over the list.",
    },
  ],
};
