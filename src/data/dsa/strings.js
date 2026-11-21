export default [
  {
    id: 'st-reverse-words',
    title: 'Reverse Words in a Sentence',
    diff: 'Easy',
    pattern: 'Strings',
    companies: ['TCS', 'Infosys', 'Wipro', 'Amazon'],
    statement: "Given a sentence `s`, return a new string with the words in reverse order. A word is a run of non-space characters. The input may contain leading, trailing or repeated spaces; the result must have the words separated by exactly **one** space and no spaces at either end.",
    examples: [
      { input: 's = "coding is fun"', output: '"fun is coding"', explain: 'The three words are written from last to first.' },
      { input: 's = "   upskill   daily  "', output: '"daily upskill"', explain: 'Extra spaces are dropped.' },
    ],
    constraints: ['0 <= s.length <= 10^4', 's contains English letters, digits and spaces'],
    hints: ['Split the sentence into words first and ignore empty pieces.', 'Reverse the list of words and join it back with a single space.'],
    approach: "Split the string on whitespace so that every word becomes one item and empty pieces created by repeated spaces are discarded. Reverse that list of words. Join the list back with a single space between items. Because the empty pieces were thrown away, leading and trailing spaces disappear automatically. If you want to avoid the built-in split, scan from the end of the string, skip spaces, then copy each word as you find it. The brute force of repeatedly finding the last word and slicing the string is O(n^2) because every slice copies the rest of the string.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'reverse_words', js: 'reverseWords' },
    py: {
      starter: 'def reverse_words(s):\n    # write your code here\n    pass\n',
      solution: `def reverse_words(s):
    words = s.split()
    words.reverse()
    return ' '.join(words)
`,
    },
    js: {
      starter: 'function reverseWords(s) {\n  // write your code here\n}\n',
      solution: `function reverseWords(s) {
  const words = s.split(' ').filter((w) => w.length > 0);
  return words.reverse().join(' ');
}
`,
    },
    tests: [
      { args: ['the sky is blue'], expect: 'blue is sky the' },
      { args: ['  hello world  '], expect: 'world hello' },
      { args: ['a good   example'], expect: 'example good a' },
      { args: ['single'], expect: 'single' },
      { args: ['   '], expect: '' },
      { args: ['TCS NQT 2025'], expect: '2025 NQT TCS' },
      { args: [''], expect: '' },
    ],
  },
  {
    id: 'st-valid-palindrome',
    title: 'Valid Palindrome (Alphanumeric Only)',
    diff: 'Easy',
    pattern: 'Strings',
    companies: ['Accenture', 'Cognizant', 'Microsoft', 'Meta'],
    statement: "Given a string `s`, decide whether it reads the same forwards and backwards after you **ignore every character that is not a letter or a digit** and treat upper and lower case letters as equal. Return `true` or `false`.",
    examples: [
      { input: 's = "Step on no pets!"', output: 'true', explain: 'Cleaned string is "steponnopets", which is a palindrome.' },
      { input: 's = "upskillr"', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 2 * 10^5', 's contains printable ASCII characters'],
    hints: ['Use two pointers, one at each end.', 'Move a pointer past characters that are not letters or digits, then compare the two lowercase characters.'],
    approach: "Place a pointer `i` at the start and `j` at the end. Move `i` forward while it points at a character that is not a letter or digit, and move `j` backward in the same way. Compare the lowercase versions of the two characters; if they differ the string is not a palindrome. Otherwise move both pointers inward and repeat until they cross. This reads every character at most once and uses no extra memory. The simple alternative is to build a cleaned lowercase copy and compare it with its reverse; that is also O(n) time but needs O(n) extra space.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'is_palindrome', js: 'isPalindrome' },
    py: {
      starter: 'def is_palindrome(s):\n    # write your code here\n    pass\n',
      solution: `def is_palindrome(s):
    i, j = 0, len(s) - 1
    while i < j:
        if not s[i].isalnum():
            i += 1
        elif not s[j].isalnum():
            j -= 1
        else:
            if s[i].lower() != s[j].lower():
                return False
            i += 1
            j -= 1
    return True
`,
    },
    js: {
      starter: 'function isPalindrome(s) {\n  // write your code here\n}\n',
      solution: `function isPalindrome(s) {
  const ok = (c) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
  let i = 0, j = s.length - 1;
  while (i < j) {
    if (!ok(s[i])) i++;
    else if (!ok(s[j])) j--;
    else {
      if (s[i].toLowerCase() !== s[j].toLowerCase()) return false;
      i++; j--;
    }
  }
  return true;
}
`,
    },
    tests: [
      { args: ['A man, a plan, a canal: Panama'], expect: true },
      { args: ['race a car'], expect: false },
      { args: [' '], expect: true },
      { args: ['0P'], expect: false },
      { args: ['Madam'], expect: true },
      { args: ["No 'x' in Nixon"], expect: true },
      { args: ['ab_a'], expect: true },
      { args: ['12321'], expect: true },
    ],
  },
  {
    id: 'st-valid-anagram',
    title: 'Valid Anagram',
    diff: 'Easy',
    pattern: 'Strings',
    companies: ['TCS', 'Wipro', 'Amazon', 'Google'],
    statement: "Two strings are **anagrams** if one can be formed by rearranging all the letters of the other. Given two lowercase strings `s` and `t`, return `true` if `t` is an anagram of `s`, otherwise `false`.",
    examples: [
      { input: 's = "listen", t = "silent"', output: 'true' },
      { input: 's = "apple", t = "paple"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    constraints: ['0 <= s.length, t.length <= 5 * 10^4', 's and t contain lowercase English letters'],
    hints: ['If the lengths differ the answer is immediately false.', 'Count how many times each letter appears in s, then subtract the counts for t.'],
    approach: "If the lengths are different the strings cannot be anagrams. Otherwise keep a count array of size 26. Walk through `s` and increment the count of each letter; walk through `t` and decrement. If every count ends at zero, both strings use exactly the same letters the same number of times. This is a single linear pass over each string with constant extra space. Sorting both strings and comparing them also works but costs O(n log n).",
    complexity: 'Time O(n), Space O(1) (26 counters)',
    fn: { py: 'is_anagram', js: 'isAnagram' },
    py: {
      starter: 'def is_anagram(s, t):\n    # write your code here\n    pass\n',
      solution: `def is_anagram(s, t):
    if len(s) != len(t):
        return False
    count = [0] * 26
    for a, b in zip(s, t):
        count[ord(a) - 97] += 1
        count[ord(b) - 97] -= 1
    return all(c == 0 for c in count)
`,
    },
    js: {
      starter: 'function isAnagram(s, t) {\n  // write your code here\n}\n',
      solution: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++;
    count[t.charCodeAt(i) - 97]--;
  }
  return count.every((c) => c === 0);
}
`,
    },
    tests: [
      { args: ['anagram', 'nagaram'], expect: true },
      { args: ['rat', 'car'], expect: false },
      { args: ['', ''], expect: true },
      { args: ['a', 'ab'], expect: false },
      { args: ['listen', 'silent'], expect: true },
      { args: ['aacc', 'ccac'], expect: false },
      { args: ['abc', 'cba'], expect: true },
    ],
  },
  {
    id: 'st-first-unique-char',
    title: 'First Non-Repeating Character',
    diff: 'Easy',
    pattern: 'Strings',
    companies: ['TCS', 'Cognizant', 'Amazon', 'Bloomberg'],
    statement: "Given a lowercase string `s`, return the **index** of the first character that appears exactly once in the whole string. If every character repeats, return `-1`.",
    examples: [
      { input: 's = "swiss"', output: '1', explain: "'w' at index 1 is the first character that occurs only once." },
      { input: 's = "aabb"', output: '-1' },
    ],
    constraints: ['1 <= s.length <= 10^5', 's contains only lowercase English letters'],
    hints: ['You need the full frequency of each character before you can decide.', 'Make two passes: one to count, one to find the first index with count 1.'],
    approach: "A character's uniqueness depends on the whole string, so first count how often each letter appears using an array of 26 counters. Then scan the string again from left to right and return the first index whose letter has a count of exactly one. If the scan finishes, no unique letter exists and the answer is -1. Both passes are linear and the counter array has fixed size. The brute force compares each character with every other character, which is O(n^2).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'first_uniq_char', js: 'firstUniqChar' },
    py: {
      starter: 'def first_uniq_char(s):\n    # write your code here\n    pass\n',
      solution: `def first_uniq_char(s):
    count = [0] * 26
    for c in s:
        count[ord(c) - 97] += 1
    for i, c in enumerate(s):
        if count[ord(c) - 97] == 1:
            return i
    return -1
`,
    },
    js: {
      starter: 'function firstUniqChar(s) {\n  // write your code here\n}\n',
      solution: `function firstUniqChar(s) {
  const count = new Array(26).fill(0);
  for (const c of s) count[c.charCodeAt(0) - 97]++;
  for (let i = 0; i < s.length; i++) {
    if (count[s.charCodeAt(i) - 97] === 1) return i;
  }
  return -1;
}
`,
    },
    tests: [
      { args: ['leetcode'], expect: 0 },
      { args: ['loveleetcode'], expect: 2 },
      { args: ['aabb'], expect: -1 },
      { args: ['z'], expect: 0 },
      { args: ['aabbc'], expect: 4 },
      { args: ['swiss'], expect: 1 },
      { args: ['abcabcd'], expect: 6 },
    ],
  },
  {
    id: 'st-count-vowels-consonants',
    title: 'Count Vowels and Consonants',
    diff: 'Easy',
    pattern: 'Strings',
    companies: ['TCS', 'Wipro', 'Capgemini'],
    statement: "Given a string `s`, count how many of its characters are vowels (`a, e, i, o, u` in either case) and how many are consonants (every other English letter). Digits, spaces and symbols are ignored. Return `[vowels, consonants]`.",
    examples: [
      { input: 's = "Hello World"', output: '[3, 7]', explain: 'Vowels: e, o, o. Consonants: H, l, l, W, r, l, d.' },
      { input: 's = "123 !"', output: '[0, 0]' },
    ],
    constraints: ['0 <= s.length <= 10^5', 's contains printable ASCII characters'],
    hints: ['Check first whether the character is a letter at all.', 'Lowercase it and test membership in "aeiou".'],
    approach: "Walk through the string once. For each character, first check that it is an English letter; anything else is skipped. Convert the letter to lowercase and check whether it is one of the five vowels. Increase the vowel counter if it is, otherwise increase the consonant counter. Return both counters as a two-element list. There is no slower approach worth discussing; the only common bug is counting digits or spaces as consonants.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'count_vowels_consonants', js: 'countVowelsConsonants' },
    py: {
      starter: 'def count_vowels_consonants(s):\n    # write your code here\n    pass\n',
      solution: `def count_vowels_consonants(s):
    v = c = 0
    for ch in s:
        low = ch.lower()
        if 'a' <= low <= 'z':
            if low in 'aeiou':
                v += 1
            else:
                c += 1
    return [v, c]
`,
    },
    js: {
      starter: 'function countVowelsConsonants(s) {\n  // write your code here\n}\n',
      solution: `function countVowelsConsonants(s) {
  let v = 0, c = 0;
  for (const ch of s) {
    const low = ch.toLowerCase();
    if (low >= 'a' && low <= 'z') {
      if ('aeiou'.includes(low)) v++;
      else c++;
    }
  }
  return [v, c];
}
`,
    },
    tests: [
      { args: ['Hello World'], expect: [3, 7] },
      { args: ['AEIOU'], expect: [5, 0] },
      { args: ['xyz'], expect: [0, 3] },
      { args: ['123 !'], expect: [0, 0] },
      { args: [''], expect: [0, 0] },
      { args: ['Programming in C++'], expect: [4, 10] },
    ],
  },
  {
    id: 'st-run-length-encoding',
    title: 'String Compression (Run-Length Encoding)',
    diff: 'Easy',
    pattern: 'Strings',
    companies: ['TCS', 'Infosys', 'Accenture', 'Amazon'],
    statement: "Compress a string by replacing every maximal run of the same character with the character followed by the length of the run. Every run is written this way, even runs of length 1. For example `\"aaabbc\"` becomes `\"a3b2c1\"`. Return the compressed string (an empty input gives an empty string).",
    examples: [
      { input: 's = "aaabbc"', output: '"a3b2c1"' },
      { input: 's = "aabbaa"', output: '"a2b2a2"', explain: 'The two runs of a are separate because b is between them.' },
    ],
    constraints: ['0 <= s.length <= 10^5', 's contains English letters'],
    hints: ['Track where the current run started.', 'When the character changes (or the string ends), write the character and the run length.'],
    approach: "Scan the string with an index `i` marking the start of the current run. Move a second index `j` forward while it sees the same character as `s[i]`. The run length is `j - i`; append the character and that number to the output, then set `i = j` and continue. Collect pieces in a list and join once at the end so the build stays linear. Building the result by repeated string concatenation in some languages copies the string each time and can become O(n^2).",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'compress', js: 'compress' },
    py: {
      starter: 'def compress(s):\n    # write your code here\n    pass\n',
      solution: `def compress(s):
    out = []
    i = 0
    n = len(s)
    while i < n:
        j = i
        while j < n and s[j] == s[i]:
            j += 1
        out.append(s[i] + str(j - i))
        i = j
    return ''.join(out)
`,
    },
    js: {
      starter: 'function compress(s) {\n  // write your code here\n}\n',
      solution: `function compress(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    out.push(s[i] + (j - i));
    i = j;
  }
  return out.join('');
}
`,
    },
    tests: [
      { args: ['aaabbc'], expect: 'a3b2c1' },
      { args: ['abc'], expect: 'a1b1c1' },
      { args: [''], expect: '' },
      { args: ['aaaaaaaaaaaa'], expect: 'a12' },
      { args: ['aabbaa'], expect: 'a2b2a2' },
      { args: ['z'], expect: 'z1' },
      { args: ['AAaa'], expect: 'A2a2' },
    ],
  },
  {
    id: 'st-longest-common-prefix',
    title: 'Longest Common Prefix',
    diff: 'Easy',
    pattern: 'Strings',
    companies: ['Infosys', 'Cognizant', 'Google', 'Adobe'],
    statement: "Given a list of strings `strs`, return the longest string that is a prefix of **every** string in the list. If they share no common prefix, return an empty string.",
    examples: [
      { input: 'strs = ["interview", "internet", "interval"]', output: '"inter"' },
      { input: 'strs = ["dog", "racecar", "car"]', output: '""' },
    ],
    constraints: ['1 <= strs.length <= 200', '0 <= strs[i].length <= 200', 'strs[i] contains lowercase English letters'],
    hints: ['The answer can never be longer than the first string.', 'Check position by position: does every string have the same character at index i?'],
    approach: "Use the first string as a reference. For each index `i` of the reference, check that every other string is long enough and has the same character at index `i`. As soon as a string is too short or has a different character, the prefix ends just before `i`. If the loop finishes, the whole first string is the common prefix. This vertical scan stops at the first mismatch, so in total it compares at most S characters where S is the sum of the lengths. Sorting the list and comparing only the first and last strings also works but adds an O(n log n) sort.",
    complexity: 'Time O(S) where S is the total number of characters, Space O(1)',
    fn: { py: 'longest_common_prefix', js: 'longestCommonPrefix' },
    py: {
      starter: 'def longest_common_prefix(strs):\n    # write your code here\n    pass\n',
      solution: `def longest_common_prefix(strs):
    first = strs[0]
    for i, ch in enumerate(first):
        for other in strs[1:]:
            if i >= len(other) or other[i] != ch:
                return first[:i]
    return first
`,
    },
    js: {
      starter: 'function longestCommonPrefix(strs) {\n  // write your code here\n}\n',
      solution: `function longestCommonPrefix(strs) {
  const first = strs[0];
  for (let i = 0; i < first.length; i++) {
    for (let k = 1; k < strs.length; k++) {
      if (i >= strs[k].length || strs[k][i] !== first[i]) return first.slice(0, i);
    }
  }
  return first;
}
`,
    },
    tests: [
      { args: [['flower', 'flow', 'flight']], expect: 'fl' },
      { args: [['dog', 'racecar', 'car']], expect: '' },
      { args: [['alone']], expect: 'alone' },
      { args: [['', '']], expect: '' },
      { args: [['interview', 'internet', 'interval', 'internal']], expect: 'inter' },
      { args: [['abc', 'abc']], expect: 'abc' },
      { args: [['ab', 'a']], expect: 'a' },
    ],
  },
  {
    id: 'st-remove-duplicate-chars',
    title: 'Remove Duplicate Characters',
    diff: 'Easy',
    pattern: 'Strings',
    companies: ['TCS', 'Wipro', 'Capgemini', 'HCL'],
    statement: "Given a string `s`, remove every repeated character so that each character appears only once, keeping its **first** occurrence and the original order. Upper and lower case letters are different characters.",
    examples: [
      { input: 's = "programming"', output: '"progamin"' },
      { input: 's = "mississippi"', output: '"misp"' },
    ],
    constraints: ['0 <= s.length <= 10^5', 's contains printable ASCII characters'],
    hints: ['Remember which characters you have already written.', 'A set gives O(1) membership checks.'],
    approach: "Walk through the string from left to right while keeping a set of characters already seen. When a character is not in the set, append it to the output and add it to the set; otherwise skip it. Because we only ever keep the first time we meet a character, the original order is preserved. Each character costs O(1) work. The naive approach checks whether the character already exists in the output string, which is O(n) per check and O(n^2) overall.",
    complexity: 'Time O(n), Space O(k) where k is the number of distinct characters',
    fn: { py: 'remove_duplicates', js: 'removeDuplicates' },
    py: {
      starter: 'def remove_duplicates(s):\n    # write your code here\n    pass\n',
      solution: `def remove_duplicates(s):
    seen = set()
    out = []
    for c in s:
        if c not in seen:
            seen.add(c)
            out.append(c)
    return ''.join(out)
`,
    },
    js: {
      starter: 'function removeDuplicates(s) {\n  // write your code here\n}\n',
      solution: `function removeDuplicates(s) {
  const seen = new Set();
  let out = '';
  for (const c of s) {
    if (!seen.has(c)) {
      seen.add(c);
      out += c;
    }
  }
  return out;
}
`,
    },
    tests: [
      { args: ['programming'], expect: 'progamin' },
      { args: ['aabbcc'], expect: 'abc' },
      { args: [''], expect: '' },
      { args: ['abc'], expect: 'abc' },
      { args: ['Hello'], expect: 'Helo' },
      { args: ['mississippi'], expect: 'misp' },
      { args: ['AaBb'], expect: 'AaBb' },
    ],
  },
  {
    id: 'st-roman-to-integer',
    title: 'Roman to Integer',
    diff: 'Easy',
    pattern: 'Strings',
    companies: ['Accenture', 'Amazon', 'Microsoft', 'Infosys'],
    statement: "Roman numerals use `I=1, V=5, X=10, L=50, C=100, D=500, M=1000`. Normally symbols are written from largest to smallest and added, but a smaller symbol placed **before** a larger one is subtracted (for example `IV = 4`, `XC = 90`, `CM = 900`). Given a valid Roman numeral `s`, return its integer value.",
    examples: [
      { input: 's = "MMXXIV"', output: '2024' },
      { input: 's = "CDXLIV"', output: '444', explain: 'CD = 400, XL = 40, IV = 4.' },
    ],
    constraints: ['1 <= s.length <= 15', 's is a valid Roman numeral in the range [1, 3999]'],
    hints: ['Look at each symbol together with the one after it.', 'If a symbol is smaller than the next one, subtract it; otherwise add it.'],
    approach: "Map each symbol to its value. Scan the string from left to right. If the current symbol's value is smaller than the value of the next symbol, it is part of a subtractive pair, so subtract it from the total. Otherwise add it. The last symbol is always added. This single pass handles all six subtractive forms without listing them separately. An alternative is to first replace the six two-letter pairs with their values, but that needs several passes and special cases.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'roman_to_int', js: 'romanToInt' },
    py: {
      starter: 'def roman_to_int(s):\n    # write your code here\n    pass\n',
      solution: `def roman_to_int(s):
    val = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    total = 0
    for i in range(len(s)):
        v = val[s[i]]
        if i + 1 < len(s) and v < val[s[i + 1]]:
            total -= v
        else:
            total += v
    return total
`,
    },
    js: {
      starter: 'function romanToInt(s) {\n  // write your code here\n}\n',
      solution: `function romanToInt(s) {
  const val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const v = val[s[i]];
    if (i + 1 < s.length && v < val[s[i + 1]]) total -= v;
    else total += v;
  }
  return total;
}
`,
    },
    tests: [
      { args: ['III'], expect: 3 },
      { args: ['LVIII'], expect: 58 },
      { args: ['MCMXCIV'], expect: 1994 },
      { args: ['IV'], expect: 4 },
      { args: ['IX'], expect: 9 },
      { args: ['MMXXIV'], expect: 2024 },
      { args: ['XL'], expect: 40 },
      { args: ['CDXLIV'], expect: 444 },
    ],
  },
  {
    id: 'st-longest-unique-substring',
    title: 'Longest Substring Without Repeating Characters',
    diff: 'Medium',
    pattern: 'Strings',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Infosys'],
    statement: "Given a string `s`, return the **length** of the longest contiguous substring in which no character appears more than once.",
    examples: [
      { input: 's = "abcabcbb"', output: '3', explain: '"abc" is the longest substring with all distinct characters.' },
      { input: 's = "pwwkew"', output: '3', explain: '"wke" has length 3. "pwke" is not contiguous.' },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's contains letters, digits, symbols and spaces'],
    hints: ['Keep a sliding window that never contains a repeated character.', 'Remember the last index where each character was seen so the left edge can jump forward directly.'],
    approach: "Maintain a window `[left, right]` that has no repeats, and a map from each character to the last index where it appeared. Move `right` one step at a time. If the new character was last seen at an index inside the current window, move `left` to one position after that index, which removes the earlier copy. Then record the new last index and update the best length with `right - left + 1`. Each index is visited once by `right` and `left` only moves forward, so the work is linear. The brute force checks every substring for uniqueness, which is O(n^3) or O(n^2) with a set.",
    complexity: 'Time O(n), Space O(k) where k is the alphabet size',
    fn: { py: 'length_of_longest_substring', js: 'lengthOfLongestSubstring' },
    py: {
      starter: 'def length_of_longest_substring(s):\n    # write your code here\n    pass\n',
      solution: `def length_of_longest_substring(s):
    last = {}
    left = best = 0
    for right, c in enumerate(s):
        if c in last and last[c] >= left:
            left = last[c] + 1
        last[c] = right
        best = max(best, right - left + 1)
    return best
`,
    },
    js: {
      starter: 'function lengthOfLongestSubstring(s) {\n  // write your code here\n}\n',
      solution: `function lengthOfLongestSubstring(s) {
  const last = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (last.has(c) && last.get(c) >= left) left = last.get(c) + 1;
    last.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
    },
    tests: [
      { args: ['abcabcbb'], expect: 3 },
      { args: ['bbbbb'], expect: 1 },
      { args: ['pwwkew'], expect: 3 },
      { args: [''], expect: 0 },
      { args: [' '], expect: 1 },
      { args: ['dvdf'], expect: 3 },
      { args: ['abba'], expect: 2 },
      { args: ['tmmzuxt'], expect: 5 },
    ],
  },
  {
    id: 'st-group-anagrams',
    title: 'Group Anagrams',
    diff: 'Medium',
    pattern: 'Strings',
    companies: ['Amazon', 'Goldman Sachs', 'Uber', 'Cognizant'],
    statement: "Given a list of lowercase words `strs`, group together the words that are anagrams of each other. To make the answer unique: sort the words **inside each group** alphabetically, then sort the groups by their first word. Duplicate words are kept.",
    examples: [
      { input: 'strs = ["eat", "tea", "tan", "ate", "nat", "bat"]', output: '[["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' },
    ],
    constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100', 'strs[i] contains lowercase English letters'],
    hints: ['Two words are anagrams exactly when their sorted letters are equal.', 'Use that sorted form (or a 26-count signature) as a dictionary key.'],
    approach: "Every word has a signature that is the same for all of its anagrams: its letters in sorted order, or a tuple of 26 letter counts. Put each word into a hash map under its signature. After processing all words, each map value is one group. Sort the words inside each group and then sort the groups by their first word to get a deterministic answer. With n words of length up to k this costs O(n k log k) using sorted keys. The brute force compares every pair of words for being anagrams, which is O(n^2 k).",
    complexity: 'Time O(n k log k), Space O(n k)',
    fn: { py: 'group_anagrams', js: 'groupAnagrams' },
    py: {
      starter: 'def group_anagrams(strs):\n    # write your code here\n    pass\n',
      solution: `def group_anagrams(strs):
    groups = {}
    for w in strs:
        key = ''.join(sorted(w))
        groups.setdefault(key, []).append(w)
    return sorted(sorted(g) for g in groups.values())
`,
    },
    js: {
      starter: 'function groupAnagrams(strs) {\n  // write your code here\n}\n',
      solution: `function groupAnagrams(strs) {
  const groups = new Map();
  for (const w of strs) {
    const key = w.split('').sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  const res = [...groups.values()].map((g) => g.sort());
  res.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return res;
}
`,
    },
    tests: [
      { args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expect: [['ate', 'eat', 'tea'], ['bat'], ['nat', 'tan']] },
      { args: [['']], expect: [['']] },
      { args: [['a']], expect: [['a']] },
      { args: [['abc', 'bca', 'cab', 'xyz', 'zyx', 'foo']], expect: [['abc', 'bca', 'cab'], ['foo'], ['xyz', 'zyx']] },
      { args: [['ab', 'ba', 'ab']], expect: [['ab', 'ab', 'ba']] },
      { args: [['listen', 'silent', 'enlist', 'google', 'gooegl']], expect: [['enlist', 'listen', 'silent'], ['gooegl', 'google']] },
      { args: [['', '', 'b']], expect: [['', ''], ['b']] },
    ],
  },
  {
    id: 'st-longest-palindromic-substring',
    title: 'Longest Palindromic Substring',
    diff: 'Medium',
    pattern: 'Strings',
    companies: ['Amazon', 'Microsoft', 'Samsung', 'TCS'],
    statement: "Given a string `s`, return the longest contiguous substring that is a palindrome. If several palindromes share the maximum length, return the one that **starts earliest** in `s`.",
    examples: [
      { input: 's = "babad"', output: '"bab"', explain: '"aba" has the same length but starts later.' },
      { input: 's = "forgeeksskeegfor"', output: '"geeksskeeg"' },
    ],
    constraints: ['1 <= s.length <= 1000', 's contains letters and digits'],
    hints: ['Every palindrome has a centre: one character (odd length) or the gap between two characters (even length).', 'Expand outward from each of the 2n - 1 centres while the ends match.'],
    approach: "A palindrome mirrors around its centre, so try every possible centre. For index `i`, expand from `(i, i)` for odd lengths and from `(i, i + 1)` for even lengths, moving outward while the two characters are equal. Each expansion gives the longest palindrome for that centre. Keep the best one, replacing it only when a strictly longer palindrome is found; since centres are tried from left to right, ties keep the earliest start. There are 2n - 1 centres and each expansion is O(n), giving O(n^2) time with O(1) extra space. Checking all O(n^2) substrings and testing each in O(n) is O(n^3). Manacher's algorithm achieves O(n) but is rarely expected in interviews.",
    complexity: 'Time O(n^2), Space O(1)',
    fn: { py: 'longest_palindrome', js: 'longestPalindrome' },
    py: {
      starter: 'def longest_palindrome(s):\n    # write your code here\n    pass\n',
      solution: `def longest_palindrome(s):
    best_l, best_r = 0, 0
    n = len(s)
    for i in range(n):
        for l, r in ((i, i), (i, i + 1)):
            while l >= 0 and r < n and s[l] == s[r]:
                l -= 1
                r += 1
            if r - l - 1 > best_r - best_l:
                best_l, best_r = l + 1, r
    return s[best_l:best_r]
`,
    },
    js: {
      starter: 'function longestPalindrome(s) {\n  // write your code here\n}\n',
      solution: `function longestPalindrome(s) {
  let bl = 0, br = 0;
  const n = s.length;
  for (let i = 0; i < n; i++) {
    for (const [a, b] of [[i, i], [i, i + 1]]) {
      let l = a, r = b;
      while (l >= 0 && r < n && s[l] === s[r]) { l--; r++; }
      if (r - l - 1 > br - bl) { bl = l + 1; br = r; }
    }
  }
  return s.slice(bl, br);
}
`,
    },
    tests: [
      { args: ['babad'], expect: 'bab' },
      { args: ['cbbd'], expect: 'bb' },
      { args: ['a'], expect: 'a' },
      { args: ['ac'], expect: 'a' },
      { args: ['forgeeksskeegfor'], expect: 'geeksskeeg' },
      { args: ['racecar'], expect: 'racecar' },
      { args: ['abacdfgdcaba'], expect: 'aba' },
      { args: ['aaaa'], expect: 'aaaa' },
    ],
  },
  {
    id: 'st-string-to-integer',
    title: 'String to Integer (atoi)',
    diff: 'Medium',
    pattern: 'Strings',
    companies: ['Amazon', 'Microsoft', 'Goldman Sachs', 'Infosys'],
    statement: "Implement your own string-to-integer conversion. Rules, in order: (1) skip leading spaces; (2) read an optional `+` or `-` sign; (3) read digits until a non-digit or the end of the string; (4) if no digits were read the result is `0`; (5) clamp the result to the 32-bit signed range `[-2147483648, 2147483647]`. Return the integer.",
    examples: [
      { input: 's = "   -42"', output: '-42' },
      { input: 's = "4193 with words"', output: '4193', explain: 'Reading stops at the space after 4193.' },
      { input: 's = "-91283472332"', output: '-2147483648', explain: 'The value is below the 32-bit minimum, so it is clamped.' },
    ],
    constraints: ['0 <= s.length <= 200', 's contains English letters, digits, spaces, "+", "-" and "."'],
    hints: ['Handle the steps one at a time with a single index moving forward.', 'Clamp as soon as the running value passes 2^31 so it never overflows.'],
    approach: "Use an index `i` that only moves forward. Skip spaces, then look for one sign character and remember it. Next, while `s[i]` is a digit, update `value = value * 10 + digit`. As soon as `value` exceeds 2^31 you already know the result is clamped, so stop and return the boundary for the sign. When the digits end, apply the sign and return. All steps together read the string once. A common mistake is to parse the full number before clamping, which can overflow fixed-width integers in languages like Java or C++.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'my_atoi', js: 'myAtoi' },
    py: {
      starter: 'def my_atoi(s):\n    # write your code here\n    pass\n',
      solution: `def my_atoi(s):
    i, n = 0, len(s)
    while i < n and s[i] == ' ':
        i += 1
    sign = 1
    if i < n and s[i] in '+-':
        if s[i] == '-':
            sign = -1
        i += 1
    value = 0
    limit = 2 ** 31
    while i < n and '0' <= s[i] <= '9':
        value = value * 10 + (ord(s[i]) - 48)
        if value >= limit:
            return -limit if sign == -1 else limit - 1
        i += 1
    return sign * value
`,
    },
    js: {
      starter: 'function myAtoi(s) {\n  // write your code here\n}\n',
      solution: `function myAtoi(s) {
  let i = 0;
  const n = s.length;
  while (i < n && s[i] === ' ') i++;
  let sign = 1;
  if (i < n && (s[i] === '+' || s[i] === '-')) {
    if (s[i] === '-') sign = -1;
    i++;
  }
  let value = 0;
  const limit = 2147483648;
  while (i < n && s[i] >= '0' && s[i] <= '9') {
    value = value * 10 + (s.charCodeAt(i) - 48);
    if (value >= limit) return sign === -1 ? -limit : limit - 1;
    i++;
  }
  return value === 0 ? 0 : sign * value;
}
`,
    },
    tests: [
      { args: ['42'], expect: 42 },
      { args: ['   -42'], expect: -42 },
      { args: ['4193 with words'], expect: 4193 },
      { args: ['words and 987'], expect: 0 },
      { args: ['-91283472332'], expect: -2147483648 },
      { args: ['+1'], expect: 1 },
      { args: [''], expect: 0 },
      { args: ['  +0 123'], expect: 0 },
      { args: ['2147483648'], expect: 2147483647 },
    ],
  },
  {
    id: 'st-integer-to-roman',
    title: 'Integer to Roman',
    diff: 'Medium',
    pattern: 'Strings',
    companies: ['Amazon', 'Accenture', 'Twitter', 'Wipro'],
    statement: "Convert an integer `num` (1 to 3999) into a Roman numeral. Use the symbols `I, V, X, L, C, D, M` and the six subtractive forms `IV, IX, XL, XC, CD, CM`. Always use the standard (shortest) form, for example `4` is `\"IV\"`, never `\"IIII\"`.",
    examples: [
      { input: 'num = 58', output: '"LVIII"', explain: 'L = 50, V = 5, III = 3.' },
      { input: 'num = 1994', output: '"MCMXCIV"', explain: 'M = 1000, CM = 900, XC = 90, IV = 4.' },
    ],
    constraints: ['1 <= num <= 3999'],
    hints: ['List the 13 symbol values (including the subtractive pairs) from largest to smallest.', 'Greedily take the largest value that still fits.'],
    approach: "Write down the 13 values 1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1 with their symbols M, CM, D, CD, C, XC, L, XL, X, IX, V, IV, I. Walk through this table from largest to smallest. While the current value is at most `num`, append its symbol and subtract it. Because the table already contains the subtractive pairs, this greedy choice always produces the standard numeral. The table has fixed size and the output has at most 15 characters, so the work is constant. Handling each decimal digit with separate if-else rules also works but is longer and easier to get wrong.",
    complexity: 'Time O(1), Space O(1)',
    fn: { py: 'int_to_roman', js: 'intToRoman' },
    py: {
      starter: 'def int_to_roman(num):\n    # write your code here\n    pass\n',
      solution: `def int_to_roman(num):
    table = [(1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'), (100, 'C'), (90, 'XC'),
             (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]
    out = []
    for value, sym in table:
        while num >= value:
            out.append(sym)
            num -= value
    return ''.join(out)
`,
    },
    js: {
      starter: 'function intToRoman(num) {\n  // write your code here\n}\n',
      solution: `function intToRoman(num) {
  const table = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [value, sym] of table) {
    while (num >= value) { out += sym; num -= value; }
  }
  return out;
}
`,
    },
    tests: [
      { args: [3], expect: 'III' },
      { args: [58], expect: 'LVIII' },
      { args: [1994], expect: 'MCMXCIV' },
      { args: [4], expect: 'IV' },
      { args: [3999], expect: 'MMMCMXCIX' },
      { args: [444], expect: 'CDXLIV' },
      { args: [2024], expect: 'MMXXIV' },
    ],
  },
  {
    id: 'st-decode-string',
    title: 'Decode Nested Encoded String',
    diff: 'Medium',
    pattern: 'Strings',
    companies: ['Google', 'Amazon', 'Cisco', 'Flipkart'],
    statement: "A string is encoded with the rule `k[text]`, meaning `text` repeated exactly `k` times. Encodings can be nested, `k` is a positive integer (possibly more than one digit) and letters can appear outside brackets. Given a valid encoded string `s`, return the decoded string.",
    examples: [
      { input: 's = "3[a2[c]]"', output: '"accaccacc"', explain: '2[c] is "cc", so a2[c] is "acc", repeated 3 times.' },
      { input: 's = "2[abc]3[cd]ef"', output: '"abcabccdcdcdef"' },
    ],
    constraints: ['0 <= s.length <= 30', 's contains lowercase letters, digits and square brackets', 'The decoded string has length at most 10^5'],
    hints: ['When you see "[", you need to pause the current string and start a new one.', 'Use a stack that stores (string built so far, repeat count) pairs.'],
    approach: "Scan the string while keeping the current string `cur` and the number being read `k`. A digit extends `k`. A `[` pushes the pair `(cur, k)` on a stack and starts a fresh `cur` and `k`. A letter is appended to `cur`. A `]` pops `(prev, times)` and sets `cur = prev + cur * times`, which closes the innermost bracket. At the end `cur` is the answer. Every output character is created once per nesting level it is inside, so the time is proportional to the output size. A recursive descent parser is equally good; repeatedly searching for the innermost bracket with string replace is much slower.",
    complexity: 'Time O(output length), Space O(output length)',
    fn: { py: 'decode_string', js: 'decodeString' },
    py: {
      starter: 'def decode_string(s):\n    # write your code here\n    pass\n',
      solution: `def decode_string(s):
    stack = []
    cur = ''
    k = 0
    for c in s:
        if c.isdigit():
            k = k * 10 + int(c)
        elif c == '[':
            stack.append((cur, k))
            cur, k = '', 0
        elif c == ']':
            prev, times = stack.pop()
            cur = prev + cur * times
        else:
            cur += c
    return cur
`,
    },
    js: {
      starter: 'function decodeString(s) {\n  // write your code here\n}\n',
      solution: `function decodeString(s) {
  const stack = [];
  let cur = '', k = 0;
  for (const c of s) {
    if (c >= '0' && c <= '9') k = k * 10 + Number(c);
    else if (c === '[') { stack.push([cur, k]); cur = ''; k = 0; }
    else if (c === ']') {
      const [prev, times] = stack.pop();
      cur = prev + cur.repeat(times);
    } else cur += c;
  }
  return cur;
}
`,
    },
    tests: [
      { args: ['3[a]2[bc]'], expect: 'aaabcbc' },
      { args: ['3[a2[c]]'], expect: 'accaccacc' },
      { args: ['2[abc]3[cd]ef'], expect: 'abcabccdcdcdef' },
      { args: ['abc'], expect: 'abc' },
      { args: ['10[a]'], expect: 'aaaaaaaaaa' },
      { args: ['2[b3[a]]'], expect: 'baaabaaa' },
      { args: [''], expect: '' },
    ],
  },
  {
    id: 'st-permutation-in-string',
    title: 'Permutation in String',
    diff: 'Medium',
    pattern: 'Strings',
    companies: ['Microsoft', 'Amazon', 'Oracle', 'Paytm'],
    statement: "Given two lowercase strings `p` and `s`, return `true` if some contiguous substring of `s` is a rearrangement (permutation) of `p`, otherwise `false`.",
    examples: [
      { input: 'p = "ab", s = "eidbaooo"', output: 'true', explain: '"ba" at index 3 is a permutation of "ab".' },
      { input: 'p = "ab", s = "eidboaoo"', output: 'false' },
    ],
    constraints: ['1 <= p.length, s.length <= 10^4', 'p and s contain lowercase English letters'],
    hints: ['Any matching substring has exactly the length of p.', 'Slide a window of that length across s and maintain its letter counts incrementally.'],
    approach: "A permutation of `p` has the same letter counts as `p` and the same length. Build the 26-letter count of `p`. Slide a window of length `len(p)` over `s`, adding the letter that enters on the right and removing the one that leaves on the left. After each step compare the window's counts to `p`'s counts; comparing two arrays of 26 numbers is constant work. If they ever match, return true. This is O(26 n) time. Generating every permutation of `p` and searching for it is factorial time and hopeless even for short `p`.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'check_inclusion', js: 'checkInclusion' },
    py: {
      starter: 'def check_inclusion(p, s):\n    # write your code here\n    pass\n',
      solution: `def check_inclusion(p, s):
    m, n = len(p), len(s)
    if m > n:
        return False
    need = [0] * 26
    win = [0] * 26
    for c in p:
        need[ord(c) - 97] += 1
    for i in range(n):
        win[ord(s[i]) - 97] += 1
        if i >= m:
            win[ord(s[i - m]) - 97] -= 1
        if win == need:
            return True
    return False
`,
    },
    js: {
      starter: 'function checkInclusion(p, s) {\n  // write your code here\n}\n',
      solution: `function checkInclusion(p, s) {
  const m = p.length, n = s.length;
  if (m > n) return false;
  const need = new Array(26).fill(0), win = new Array(26).fill(0);
  for (const c of p) need[c.charCodeAt(0) - 97]++;
  for (let i = 0; i < n; i++) {
    win[s.charCodeAt(i) - 97]++;
    if (i >= m) win[s.charCodeAt(i - m) - 97]--;
    let same = true;
    for (let k = 0; k < 26; k++) if (win[k] !== need[k]) { same = false; break; }
    if (same) return true;
  }
  return false;
}
`,
    },
    tests: [
      { args: ['ab', 'eidbaooo'], expect: true },
      { args: ['ab', 'eidboaoo'], expect: false },
      { args: ['adc', 'dcda'], expect: true },
      { args: ['a', 'a'], expect: true },
      { args: ['abc', 'ab'], expect: false },
      { args: ['hello', 'ooolleoooleh'], expect: false },
      { args: ['xyz', 'afdgzyxksldfm'], expect: true },
    ],
  },
  {
    id: 'st-count-and-say',
    title: 'Count and Say',
    diff: 'Medium',
    pattern: 'Strings',
    companies: ['Infosys', 'Amazon', 'Facebook', 'Wipro'],
    statement: "The count-and-say sequence starts with `\"1\"`. Each next term describes the previous term by reading its runs aloud: for each group of equal digits, write the group length followed by the digit. So `\"1\"` is one 1 → `\"11\"`, then two 1s → `\"21\"`, then one 2 one 1 → `\"1211\"`. Given `n`, return the `n`-th term.",
    examples: [
      { input: 'n = 4', output: '"1211"' },
      { input: 'n = 5', output: '"111221"', explain: '"1211" is one 1, one 2, two 1s.' },
    ],
    constraints: ['1 <= n <= 30'],
    hints: ['Build the terms one after another starting from "1".', 'Describing a term is the same as run-length encoding it, but writing the count before the digit.'],
    approach: "Start with the term \"1\" and repeat n - 1 times. To build the next term, scan the current term in runs of equal digits. For each run append its length and then the digit. Collect pieces in a list and join them so each step is linear in the length of the term. The total work is the sum of the lengths of all terms, which grows by roughly 30 percent per step, so the last term dominates. There is no known closed formula, so simulation is the expected solution.",
    complexity: 'Time O(total length of all terms), Space O(length of the n-th term)',
    fn: { py: 'count_and_say', js: 'countAndSay' },
    py: {
      starter: 'def count_and_say(n):\n    # write your code here\n    pass\n',
      solution: `def count_and_say(n):
    term = '1'
    for _ in range(n - 1):
        out = []
        i = 0
        while i < len(term):
            j = i
            while j < len(term) and term[j] == term[i]:
                j += 1
            out.append(str(j - i) + term[i])
            i = j
        term = ''.join(out)
    return term
`,
    },
    js: {
      starter: 'function countAndSay(n) {\n  // write your code here\n}\n',
      solution: `function countAndSay(n) {
  let term = '1';
  for (let step = 1; step < n; step++) {
    const out = [];
    let i = 0;
    while (i < term.length) {
      let j = i;
      while (j < term.length && term[j] === term[i]) j++;
      out.push(String(j - i) + term[i]);
      i = j;
    }
    term = out.join('');
  }
  return term;
}
`,
    },
    tests: [
      { args: [1], expect: '1' },
      { args: [2], expect: '11' },
      { args: [3], expect: '21' },
      { args: [4], expect: '1211' },
      { args: [5], expect: '111221' },
      { args: [6], expect: '312211' },
      { args: [8], expect: '1113213211' },
    ],
  },
  {
    id: 'st-character-replacement',
    title: 'Longest Repeating Character Replacement',
    diff: 'Medium',
    pattern: 'Strings',
    companies: ['Google', 'Amazon', 'Uber', 'Swiggy'],
    statement: "You are given an uppercase string `s` and an integer `k`. You may change at most `k` characters of `s` into any other uppercase letter. Return the length of the longest substring that can be made of one repeated letter after these changes.",
    examples: [
      { input: 's = "AABABBA", k = 1', output: '4', explain: 'Change the B in "AABA" to A to get "AAAA".' },
      { input: 's = "ABAB", k = 2', output: '4', explain: 'Change both A to B (or both B to A).' },
    ],
    constraints: ['1 <= s.length <= 10^5', '0 <= k <= s.length', 's contains uppercase English letters'],
    hints: ['A window is valid when (window length - count of its most frequent letter) <= k.', 'Use a sliding window and shrink it from the left only when it becomes invalid.'],
    approach: "In any window, the cheapest way to make all letters equal is to keep the most frequent letter and change the rest, which needs `length - maxFreq` changes. Slide a window over `s`, keeping letter counts and the largest count seen so far. When `length - maxFreq` exceeds `k`, move the left edge one step and decrease that letter's count. The window size never shrinks below the best answer, so at the end `n - left` (or the largest valid size seen) is the answer. Not lowering `maxFreq` when shrinking is safe because only a larger `maxFreq` can produce a longer valid window. Checking every substring is O(n^2) or worse.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'character_replacement', js: 'characterReplacement' },
    py: {
      starter: 'def character_replacement(s, k):\n    # write your code here\n    pass\n',
      solution: `def character_replacement(s, k):
    count = [0] * 26
    left = max_freq = best = 0
    for right, c in enumerate(s):
        idx = ord(c) - 65
        count[idx] += 1
        max_freq = max(max_freq, count[idx])
        while right - left + 1 - max_freq > k:
            count[ord(s[left]) - 65] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best
`,
    },
    js: {
      starter: 'function characterReplacement(s, k) {\n  // write your code here\n}\n',
      solution: `function characterReplacement(s, k) {
  const count = new Array(26).fill(0);
  let left = 0, maxFreq = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const idx = s.charCodeAt(right) - 65;
    count[idx]++;
    maxFreq = Math.max(maxFreq, count[idx]);
    while (right - left + 1 - maxFreq > k) {
      count[s.charCodeAt(left) - 65]--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
    },
    tests: [
      { args: ['ABAB', 2], expect: 4 },
      { args: ['AABABBA', 1], expect: 4 },
      { args: ['A', 0], expect: 1 },
      { args: ['AAAA', 2], expect: 4 },
      { args: ['ABCDE', 1], expect: 2 },
      { args: ['ABBB', 0], expect: 3 },
      { args: ['BAAAB', 2], expect: 5 },
    ],
  },
  {
    id: 'st-zigzag-conversion',
    title: 'Zigzag Conversion',
    diff: 'Medium',
    pattern: 'Strings',
    companies: ['Amazon', 'PayPal', 'Infosys', 'Adobe'],
    statement: "Write the characters of `s` in a zigzag over `numRows` rows: go straight down row 0, 1, ..., numRows-1, then diagonally back up to row 1, then down again, and so on. Then read the rows from top to bottom, each left to right, and return that string. With `numRows = 1` the string is unchanged.",
    examples: [
      { input: 's = "PAYPALISHIRING", numRows = 3', output: '"PAHNAPLSIIGYIR"', explain: 'Rows are "PAHN", "APLSIIG", "YIR".' },
      { input: 's = "ABCD", numRows = 2', output: '"ACBD"' },
    ],
    constraints: ['1 <= s.length <= 1000', '1 <= numRows <= 1000'],
    hints: ['You do not need a 2D grid; one string per row is enough.', 'Keep the current row and a direction that flips at the top and bottom rows.'],
    approach: "Create one bucket per row. Walk through the characters, appending each to the bucket of the current row. The row index moves down by one each step and reverses direction when it reaches row 0 or the last row. After all characters are placed, concatenate the buckets from top to bottom. Every character is handled once. If `numRows` is 1 or at least the string length, the answer is the string itself, which avoids a zero-step direction bug. Simulating a full 2D grid with blank cells works but wastes O(n * numRows) space.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'convert', js: 'convert' },
    py: {
      starter: 'def convert(s, numRows):\n    # write your code here\n    pass\n',
      solution: `def convert(s, numRows):
    if numRows == 1 or numRows >= len(s):
        return s
    rows = [[] for _ in range(numRows)]
    r, step = 0, 1
    for c in s:
        rows[r].append(c)
        if r == 0:
            step = 1
        elif r == numRows - 1:
            step = -1
        r += step
    return ''.join(''.join(row) for row in rows)
`,
    },
    js: {
      starter: 'function convert(s, numRows) {\n  // write your code here\n}\n',
      solution: `function convert(s, numRows) {
  if (numRows === 1 || numRows >= s.length) return s;
  const rows = Array.from({ length: numRows }, () => []);
  let r = 0, step = 1;
  for (const c of s) {
    rows[r].push(c);
    if (r === 0) step = 1;
    else if (r === numRows - 1) step = -1;
    r += step;
  }
  return rows.map((row) => row.join('')).join('');
}
`,
    },
    tests: [
      { args: ['PAYPALISHIRING', 3], expect: 'PAHNAPLSIIGYIR' },
      { args: ['PAYPALISHIRING', 4], expect: 'PINALSIGYAHRPI' },
      { args: ['A', 1], expect: 'A' },
      { args: ['AB', 1], expect: 'AB' },
      { args: ['ABCD', 2], expect: 'ACBD' },
      { args: ['ABC', 5], expect: 'ABC' },
    ],
  },
  {
    id: 'st-minimum-window-substring',
    title: 'Minimum Window Substring',
    diff: 'Hard',
    pattern: 'Strings',
    companies: ['Google', 'Amazon', 'Microsoft', 'Flipkart'],
    statement: "Given strings `s` and `t`, return the shortest contiguous substring of `s` that contains every character of `t`, **including duplicates** (if `t` has two `a`s the window needs at least two `a`s). If there are several shortest windows, return the one that starts earliest. If no window exists, return `\"\"`.",
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
      { input: 's = "a", t = "aa"', output: '""', explain: 's has only one a.' },
    ],
    constraints: ['1 <= s.length, t.length <= 10^5', 's and t contain English letters'],
    hints: ['Expand a window to the right until it covers t, then shrink it from the left as long as it still covers t.', 'Track how many required characters are still missing so the "covers t" test is O(1).'],
    approach: "Count the characters of `t` in `need` and set `missing = len(t)`. Move the right edge across `s`; when the entering character still has a positive need, decrease `missing`, and always decrease its need count. When `missing` reaches 0 the window covers `t`, so move the left edge right while the leftmost character is surplus (its need count is negative), restoring counts as you go. Now the window is the shortest one ending at `right`; record it if it is strictly shorter than the best so far, which keeps the earliest start on ties. Then drop the leftmost character, making `missing` 1 again, and continue. Each pointer moves at most n times, so the algorithm is linear. Checking all O(n^2) substrings is far too slow for n = 10^5.",
    complexity: 'Time O(|s| + |t|), Space O(alphabet)',
    fn: { py: 'min_window', js: 'minWindow' },
    py: {
      starter: 'def min_window(s, t):\n    # write your code here\n    pass\n',
      solution: `def min_window(s, t):
    need = {}
    for c in t:
        need[c] = need.get(c, 0) + 1
    missing = len(t)
    left = 0
    best_l, best_len = 0, float('inf')
    for right, c in enumerate(s):
        if need.get(c, 0) > 0:
            missing -= 1
        need[c] = need.get(c, 0) - 1
        if missing == 0:
            while need[s[left]] < 0:
                need[s[left]] += 1
                left += 1
            if right - left + 1 < best_len:
                best_l, best_len = left, right - left + 1
            need[s[left]] += 1
            missing += 1
            left += 1
    return '' if best_len == float('inf') else s[best_l:best_l + best_len]
`,
    },
    js: {
      starter: 'function minWindow(s, t) {\n  // write your code here\n}\n',
      solution: `function minWindow(s, t) {
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);
  let missing = t.length, left = 0, bestL = 0, bestLen = Infinity;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if ((need.get(c) || 0) > 0) missing--;
    need.set(c, (need.get(c) || 0) - 1);
    if (missing === 0) {
      while (need.get(s[left]) < 0) {
        need.set(s[left], need.get(s[left]) + 1);
        left++;
      }
      if (right - left + 1 < bestLen) { bestL = left; bestLen = right - left + 1; }
      need.set(s[left], need.get(s[left]) + 1);
      missing++;
      left++;
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestL, bestL + bestLen);
}
`,
    },
    tests: [
      { args: ['ADOBECODEBANC', 'ABC'], expect: 'BANC' },
      { args: ['a', 'a'], expect: 'a' },
      { args: ['a', 'aa'], expect: '' },
      { args: ['ab', 'b'], expect: 'b' },
      { args: ['aa', 'aa'], expect: 'aa' },
      { args: ['cabwefgewcwaefgcf', 'cae'], expect: 'cwae' },
      { args: ['bba', 'ab'], expect: 'ba' },
      { args: ['abcabc', 'cb'], expect: 'bc' },
    ],
  },
  {
    id: 'st-edit-distance',
    title: 'Edit Distance',
    diff: 'Hard',
    pattern: 'Strings',
    companies: ['Google', 'Amazon', 'Microsoft', 'Goldman Sachs'],
    statement: "Given two strings `a` and `b`, return the minimum number of single-character operations needed to turn `a` into `b`. The allowed operations are: **insert** a character, **delete** a character, or **replace** a character with another.",
    examples: [
      { input: 'a = "kitten", b = "sitting"', output: '3', explain: 'k→s, e→i, insert g.' },
      { input: 'a = "horse", b = "ros"', output: '3', explain: 'horse → rorse → rose → ros.' },
    ],
    constraints: ['0 <= a.length, b.length <= 500', 'a and b contain lowercase English letters'],
    hints: ['Let dp[i][j] be the answer for the first i characters of a and the first j characters of b.', 'If a[i-1] == b[j-1] no operation is needed; otherwise take 1 + the minimum of insert, delete and replace.'],
    approach: "Define `dp[i][j]` as the edit distance between the prefix `a[:i]` and the prefix `b[:j]`. Turning a prefix into an empty string needs `i` deletions, and building `b[:j]` from nothing needs `j` insertions, which gives the first row and column. For other cells, if the last characters match, `dp[i][j] = dp[i-1][j-1]`. Otherwise it is `1 + min(dp[i-1][j] (delete), dp[i][j-1] (insert), dp[i-1][j-1] (replace))`. Each cell needs only the previous row, so memory can be cut to one row. Plain recursion that tries all three operations without memoization is exponential.",
    complexity: 'Time O(m n), Space O(n)',
    fn: { py: 'min_distance', js: 'minDistance' },
    py: {
      starter: 'def min_distance(a, b):\n    # write your code here\n    pass\n',
      solution: `def min_distance(a, b):
    m, n = len(a), len(b)
    prev = list(range(n + 1))
    for i in range(1, m + 1):
        cur = [i] + [0] * n
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])
        prev = cur
    return prev[n]
`,
    },
    js: {
      starter: 'function minDistance(a, b) {\n  // write your code here\n}\n',
      solution: `function minDistance(a, b) {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = new Array(n + 1).fill(0);
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) cur[j] = prev[j - 1];
      else cur[j] = 1 + Math.min(prev[j], cur[j - 1], prev[j - 1]);
    }
    prev = cur;
  }
  return prev[n];
}
`,
    },
    tests: [
      { args: ['horse', 'ros'], expect: 3 },
      { args: ['intention', 'execution'], expect: 5 },
      { args: ['', 'abc'], expect: 3 },
      { args: ['abc', 'abc'], expect: 0 },
      { args: ['kitten', 'sitting'], expect: 3 },
      { args: ['sunday', 'saturday'], expect: 3 },
      { args: ['a', ''], expect: 1 },
    ],
  },
  {
    id: 'st-shortest-palindrome',
    title: 'Shortest Palindrome by Adding in Front',
    diff: 'Hard',
    pattern: 'Strings',
    companies: ['Google', 'Amazon', 'Microsoft'],
    statement: "You may only add characters to the **front** of string `s`. Return the shortest palindrome you can build this way.",
    examples: [
      { input: 's = "abcd"', output: '"dcbabcd"' },
      { input: 's = "aacecaaa"', output: '"aaacecaaa"', explain: 'The prefix "aacecaa" is already a palindrome, so only one "a" is added.' },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's contains lowercase English letters'],
    hints: ['Find the longest prefix of s that is already a palindrome; only the remaining suffix needs to be mirrored in front.', 'The KMP failure function of s + "#" + reverse(s) gives that prefix length in linear time.'],
    approach: "If the longest palindromic prefix of `s` has length `L`, the answer is `reverse(s[L:]) + s`, because the rest of the string must be mirrored on the left. To find `L` quickly, build `t = s + '#' + reverse(s)` and compute the KMP prefix function (the length of the longest proper prefix that is also a suffix, for each position). The value at the last position of `t` is the length of the longest prefix of `s` that equals a suffix of `reverse(s)`, which is exactly the longest palindromic prefix. The `#` separator stops the match from crossing the middle. Computing the prefix function is linear. The brute force checks every prefix for being a palindrome from longest to shortest, which is O(n^2).",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'shortest_palindrome', js: 'shortestPalindrome' },
    py: {
      starter: 'def shortest_palindrome(s):\n    # write your code here\n    pass\n',
      solution: `def shortest_palindrome(s):
    t = s + '#' + s[::-1]
    pi = [0] * len(t)
    for i in range(1, len(t)):
        k = pi[i - 1]
        while k > 0 and t[i] != t[k]:
            k = pi[k - 1]
        if t[i] == t[k]:
            k += 1
        pi[i] = k
    keep = pi[-1]
    return s[keep:][::-1] + s
`,
    },
    js: {
      starter: 'function shortestPalindrome(s) {\n  // write your code here\n}\n',
      solution: `function shortestPalindrome(s) {
  const rev = s.split('').reverse().join('');
  const t = s + '#' + rev;
  const pi = new Array(t.length).fill(0);
  for (let i = 1; i < t.length; i++) {
    let k = pi[i - 1];
    while (k > 0 && t[i] !== t[k]) k = pi[k - 1];
    if (t[i] === t[k]) k++;
    pi[i] = k;
  }
  const keep = pi[t.length - 1];
  return s.slice(keep).split('').reverse().join('') + s;
}
`,
    },
    tests: [
      { args: ['aacecaaa'], expect: 'aaacecaaa' },
      { args: ['abcd'], expect: 'dcbabcd' },
      { args: [''], expect: '' },
      { args: ['a'], expect: 'a' },
      { args: ['aba'], expect: 'aba' },
      { args: ['abb'], expect: 'bbabb' },
      { args: ['aabba'], expect: 'abbaabba' },
    ],
  },
];
