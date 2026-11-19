// Offline error dictionary for the "Explain my Error" tool.
// Each entry: id, lang, title, patterns (regex source strings, matched case-insensitively),
// meaning { en, mr }, causes, fixes, example { bad, good }, tip.

export const ERRORS = [
  // ───────────────────────────── Java ─────────────────────────────
  {
    id: 'java-npe',
    lang: 'Java',
    title: 'NullPointerException',
    patterns: ['NullPointerException', 'Cannot invoke ".*" because .* is null', 'Cannot (read|load|store) .* because .* is null'],
    meaning: {
      en: 'You tried to call a method or access a field on a reference that is null, i.e. it points to no object.',
      mr: 'तुम्ही null असलेल्या reference वर method call किंवा field access करत आहात. म्हणजे त्या variable मध्ये कोणताही object नाही.',
    },
    causes: [
      'Object declared but never created with new',
      'A method returned null (e.g. map.get() for a missing key) and you used the result directly',
      'Array of objects created but elements never initialised',
      'Field not injected / not set in constructor',
    ],
    fixes: [
      'Read the stack trace line number and find which variable is null on that line',
      'Initialise the object with new before using it',
      'Add a null check (if (x != null)) or use Optional / Objects.requireNonNull',
      'Check return values of methods like map.get(), findById() before use',
    ],
    example: {
      bad: `String name = null;
System.out.println(name.length()); // NPE`,
      good: `String name = "Ravi";
if (name != null) {
    System.out.println(name.length());
}`,
    },
    tip: 'Initialise variables at declaration and never return null from your own methods when an empty value (empty list, "") will do.',
  },
  {
    id: 'java-array-index-oob',
    lang: 'Java',
    title: 'ArrayIndexOutOfBoundsException',
    patterns: ['ArrayIndexOutOfBoundsException'],
    meaning: {
      en: 'You accessed an array position that does not exist. Valid indexes are 0 to length - 1.',
      mr: 'Array मध्ये अस्तित्वात नसलेल्या index वर access केला आहे. Valid index 0 ते length - 1 पर्यंतच असतात.',
    },
    causes: [
      'Loop condition uses <= arr.length instead of < arr.length',
      'Using index -1 or a negative index',
      'Assuming the array has more elements than it actually does',
      'Reading args[0] when no command-line argument was passed',
    ],
    fixes: [
      'Use i < arr.length in loop conditions',
      'Print arr.length and the index just before the failing line',
      'Prefer the enhanced for loop (for (int x : arr)) when you do not need the index',
      'Check args.length before reading args',
    ],
    example: {
      bad: `int[] a = {10, 20, 30};
for (int i = 0; i <= a.length; i++) {
    System.out.println(a[i]); // fails at i = 3
}`,
      good: `int[] a = {10, 20, 30};
for (int i = 0; i < a.length; i++) {
    System.out.println(a[i]);
}`,
    },
    tip: 'Remember: last index = length - 1. Write loop conditions with < length by habit.',
  },
  {
    id: 'java-string-index-oob',
    lang: 'Java',
    title: 'StringIndexOutOfBoundsException',
    patterns: ['StringIndexOutOfBoundsException', 'begin -?\\d+, end -?\\d+, length \\d+'],
    meaning: {
      en: 'charAt(), substring() or similar used a position outside the string. Valid positions are 0 to length() - 1.',
      mr: 'charAt(), substring() सारख्या method मध्ये string च्या बाहेरचा index दिला आहे. Valid index 0 ते length() - 1 असतात.',
    },
    causes: [
      'charAt(s.length()) instead of charAt(s.length() - 1)',
      'substring(begin, end) where end > length() or begin > end',
      'Working on an empty string ""',
      'indexOf() returned -1 and you used it as a position',
    ],
    fixes: [
      'Check s.length() before calling charAt / substring',
      'Remember substring end index is exclusive',
      'Check indexOf() result is not -1 before using it',
      'Handle empty strings separately (if (s.isEmpty()))',
    ],
    example: {
      bad: `String s = "java";
char last = s.charAt(s.length()); // index 4 does not exist`,
      good: `String s = "java";
char last = s.charAt(s.length() - 1); // 'a'`,
    },
    tip: 'Before any substring logic, write down the string with index numbers under each character.',
  },
  {
    id: 'java-class-cast',
    lang: 'Java',
    title: 'ClassCastException',
    patterns: ['ClassCastException', 'class .* cannot be cast to class'],
    meaning: {
      en: 'You cast an object to a type it is not actually an instance of.',
      mr: 'Object जो प्रत्यक्षात ज्या type चा नाही, त्या type मध्ये तुम्ही cast करत आहात.',
    },
    causes: [
      'Casting a parent object to a child class it never was',
      'Using raw collections (List without generics) and casting elements wrongly',
      'Casting Integer to String or similar unrelated types',
    ],
    fixes: [
      'Use instanceof before casting',
      'Use generics (List<String>) so no casts are needed',
      'Convert values properly (String.valueOf(n), Integer.parseInt(s)) instead of casting',
    ],
    example: {
      bad: `Object o = 42;
String s = (String) o; // Integer cannot be cast to String`,
      good: `Object o = 42;
if (o instanceof Integer n) {
    String s = String.valueOf(n);
}`,
    },
    tip: 'Always use generics for collections; a cast in your code is a hint that the design can be improved.',
  },
  {
    id: 'java-number-format',
    lang: 'Java',
    title: 'NumberFormatException',
    patterns: ['NumberFormatException', 'For input string: ".*"'],
    meaning: {
      en: 'Integer.parseInt / Double.parseDouble received text that is not a valid number.',
      mr: 'Integer.parseInt किंवा Double.parseDouble ला valid number नसलेला text मिळाला आहे.',
    },
    causes: [
      'Input has spaces, e.g. " 25" or "25\\n"',
      'Input is empty "" or null',
      'Decimal value like "12.5" passed to Integer.parseInt',
      'Number too large for int (use Long)',
    ],
    fixes: [
      'Call .trim() on input before parsing',
      'Check for empty input before parsing',
      'Use Double.parseDouble for decimals, Long.parseLong for big numbers',
      'Wrap parsing in try-catch and show a friendly message',
    ],
    example: {
      bad: `String input = " 25 ";
int age = Integer.parseInt(input);`,
      good: `String input = " 25 ";
try {
    int age = Integer.parseInt(input.trim());
} catch (NumberFormatException e) {
    System.out.println("Please enter a valid number");
}`,
    },
    tip: 'Treat all user input as untrusted: trim it, validate it, then parse it.',
  },
  {
    id: 'java-arithmetic-div-zero',
    lang: 'Java',
    title: 'ArithmeticException: / by zero',
    patterns: ['ArithmeticException', '/ by zero'],
    meaning: {
      en: 'An integer was divided by zero, which Java does not allow.',
      mr: 'Integer ला zero ने divide केले आहे, जे Java मध्ये allowed नाही.',
    },
    causes: [
      'Divisor variable is 0 (e.g. count of items is 0)',
      'Average calculated on an empty list',
      'Using % (modulo) with 0',
    ],
    fixes: [
      'Check the divisor is not zero before dividing',
      'Handle the empty-list case separately',
      'Use double if you want Infinity/NaN instead of an exception',
    ],
    example: {
      bad: `int total = 100, count = 0;
int avg = total / count;`,
      good: `int total = 100, count = 0;
int avg = (count == 0) ? 0 : total / count;`,
    },
    tip: 'Whenever you write "/", ask yourself: can the right side ever be 0?',
  },
  {
    id: 'java-concurrent-modification',
    lang: 'Java',
    title: 'ConcurrentModificationException',
    patterns: ['ConcurrentModificationException'],
    meaning: {
      en: 'A collection was modified (add/remove) while you were looping over it with a for-each loop or iterator.',
      mr: 'For-each loop किंवा iterator ने collection वर loop चालू असताना त्यात add/remove केले आहे.',
    },
    causes: [
      'list.remove() inside a for-each loop over the same list',
      'Adding elements to a list while iterating it',
      'Two threads modifying a non-thread-safe collection',
    ],
    fixes: [
      'Use Iterator and call iterator.remove()',
      'Use list.removeIf(condition)',
      'Collect items to remove in a separate list and remove after the loop',
      'Use CopyOnWriteArrayList / ConcurrentHashMap for multi-threaded code',
    ],
    example: {
      bad: `for (String s : names) {
    if (s.isEmpty()) names.remove(s);
}`,
      good: `names.removeIf(s -> s.isEmpty());`,
    },
    tip: 'Never change the size of a collection inside its own for-each loop.',
  },
  {
    id: 'java-input-mismatch',
    lang: 'Java',
    title: 'InputMismatchException',
    patterns: ['InputMismatchException'],
    meaning: {
      en: 'Scanner expected one type (like nextInt) but the user typed something else (like text).',
      mr: 'Scanner ला एक type अपेक्षित होता (उदा. nextInt) पण user ने वेगळे काहीतरी (उदा. text) type केले.',
    },
    causes: [
      'User typed letters when nextInt() was called',
      'Typed decimal 12.5 when nextInt() expected an integer',
      'Leftover input in the buffer from a previous read',
    ],
    fixes: [
      'Use sc.hasNextInt() to check before calling nextInt()',
      'Read a line with nextLine() and parse it in try-catch',
      'After a failed read, call sc.next() to clear the bad token',
    ],
    example: {
      bad: `Scanner sc = new Scanner(System.in);
int n = sc.nextInt(); // user types "abc"`,
      good: `Scanner sc = new Scanner(System.in);
while (!sc.hasNextInt()) {
    System.out.println("Enter a number:");
    sc.next();
}
int n = sc.nextInt();`,
    },
    tip: 'Validate Scanner input with hasNextInt()/hasNextDouble() in any program that talks to a user.',
  },
  {
    id: 'java-stack-overflow',
    lang: 'Java',
    title: 'StackOverflowError',
    patterns: ['StackOverflowError'],
    meaning: {
      en: 'A method called itself (directly or indirectly) too many times, usually because recursion never stops.',
      mr: 'Method स्वतःलाच खूप वेळा call करत आहे, बहुतेक वेळा recursion कधीच थांबत नाही म्हणून.',
    },
    causes: [
      'Recursive method has no base case',
      'Base case exists but is never reached (wrong condition)',
      'toString()/equals() of two classes calling each other',
      'Getter calling itself instead of returning the field',
    ],
    fixes: [
      'Add or correct the base case so recursion ends',
      'Make sure each recursive call moves closer to the base case',
      'Look at the repeating lines in the stack trace to find the loop',
      'Convert deep recursion to a loop',
    ],
    example: {
      bad: `int fact(int n) {
    return n * fact(n - 1); // never stops
}`,
      good: `int fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}`,
    },
    tip: 'Write the base case first whenever you write a recursive method.',
  },
  {
    id: 'java-out-of-memory',
    lang: 'Java',
    title: 'OutOfMemoryError',
    patterns: ['OutOfMemoryError', 'Java heap space', 'GC overhead limit exceeded'],
    meaning: {
      en: 'The JVM ran out of heap memory because the program is holding too many objects.',
      mr: 'Program खूप जास्त objects memory मध्ये ठेवत आहे म्हणून JVM ची heap memory संपली आहे.',
    },
    causes: [
      'Infinite loop adding items to a list or map',
      'Loading a huge file or table fully into memory',
      'Static collections that keep growing (memory leak)',
      'Heap size (-Xmx) too small for the task',
    ],
    fixes: [
      'Check loops that add to collections; make sure they end',
      'Process big files/results line by line or in batches',
      'Remove references you no longer need; clear caches',
      'Increase heap with -Xmx (e.g. java -Xmx1g Main) if usage is genuine',
    ],
    example: {
      bad: `List<int[]> list = new ArrayList<>();
while (true) {
    list.add(new int[1_000_000]);
}`,
      good: `try (BufferedReader br = new BufferedReader(new FileReader("big.csv"))) {
    String line;
    while ((line = br.readLine()) != null) {
        process(line); // one line at a time
    }
}`,
    },
    tip: 'Stream large data instead of loading it all at once.',
  },
  {
    id: 'java-cannot-find-symbol',
    lang: 'Java',
    title: 'error: cannot find symbol',
    patterns: ['cannot find symbol'],
    meaning: {
      en: 'The compiler does not know a variable, method or class name you used.',
      mr: 'तुम्ही वापरलेले variable, method किंवा class नाव compiler ला सापडत नाही.',
    },
    causes: [
      'Spelling or capitalisation mistake (system vs System, Length vs length)',
      'Variable used outside the block where it was declared',
      'Missing import (e.g. java.util.Scanner)',
      'Calling a method that does not exist on that type (str.size() instead of str.length())',
    ],
    fixes: [
      'Read the "symbol:" and "location:" lines in the error',
      'Fix spelling and case; Java is case-sensitive',
      'Add the missing import statement',
      'Declare the variable in the right scope before using it',
    ],
    example: {
      bad: `public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in); // no import
    }
}`,
      good: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
    }
}`,
    },
    tip: 'Let your IDE auto-import and auto-complete names; it prevents most spelling errors.',
  },
  {
    id: 'java-incompatible-types',
    lang: 'Java',
    title: 'error: incompatible types',
    patterns: ['incompatible types', 'possible lossy conversion from'],
    meaning: {
      en: 'You assigned or returned a value of one type where a different, non-compatible type is required.',
      mr: 'एका type ची value दुसऱ्या, जुळत नसलेल्या type मध्ये assign किंवा return केली आहे.',
    },
    causes: [
      'Assigning String to int (int n = "5";)',
      'Assigning double to int without a cast (lossy conversion)',
      'Method returns a different type than declared',
      'Using = (assignment) inside if instead of ==',
    ],
    fixes: [
      'Convert explicitly: Integer.parseInt(s), String.valueOf(n)',
      'Cast where safe: int x = (int) d;',
      'Make the variable type match the value type',
      'Use == for comparison in conditions',
    ],
    example: {
      bad: `int n = "5";
double d = 9.7;
int x = d;`,
      good: `int n = Integer.parseInt("5");
double d = 9.7;
int x = (int) d;`,
    },
    tip: 'Read the error as "X cannot be converted to Y" and decide how to convert X into Y.',
  },
  {
    id: 'java-missing-return',
    lang: 'Java',
    title: 'error: missing return statement',
    patterns: ['missing return statement'],
    meaning: {
      en: 'A method that promises to return a value has at least one path where it returns nothing.',
      mr: 'Value return करणाऱ्या method मध्ये किमान एका path वर return statement नाही.',
    },
    causes: [
      'return only inside if, but not in else',
      'return only inside a loop',
      'Forgot to write return at the end of the method',
    ],
    fixes: [
      'Add a return at the end of the method',
      'Make sure every if/else branch returns',
      'If nothing should be returned, change the return type to void',
    ],
    example: {
      bad: `int max(int a, int b) {
    if (a > b) return a;
}`,
      good: `int max(int a, int b) {
    if (a > b) return a;
    return b;
}`,
    },
    tip: 'Keep a single default return at the bottom of non-void methods.',
  },
  {
    id: 'java-public-class-filename',
    lang: 'Java',
    title: 'class X is public, should be declared in a file named X.java',
    patterns: ['class \\w+ is public, should be declared in a file named'],
    meaning: {
      en: 'A public class must be saved in a file with exactly the same name as the class.',
      mr: 'Public class ज्या नावाचा आहे, त्याच नावाच्या .java file मध्ये तो save असला पाहिजे.',
    },
    causes: [
      'File is Main.java but class is public class Test',
      'Different capitalisation (main.java vs Main)',
      'Two public classes in one file',
    ],
    fixes: [
      'Rename the file to ClassName.java',
      'Or rename the class to match the file name',
      'Keep only one public class per file; remove public from others',
    ],
    example: {
      bad: `// File: test.java
public class Main {
    public static void main(String[] args) { }
}`,
      good: `// File: Main.java
public class Main {
    public static void main(String[] args) { }
}`,
    },
    tip: 'Create classes from the IDE (New > Java Class) so file name and class name always match.',
  },
  {
    id: 'java-non-static-context',
    lang: 'Java',
    title: 'non-static method cannot be referenced from a static context',
    patterns: ['non-static (method|variable) .* cannot be referenced from a static context'],
    meaning: {
      en: 'Inside a static method (like main) you used an instance method or field without an object.',
      mr: 'Static method मध्ये (उदा. main) object न बनवता instance method किंवा variable वापरले आहे.',
    },
    causes: [
      'Calling a normal method directly from main',
      'Accessing an instance field from main',
      'Forgetting the static keyword on a helper method',
    ],
    fixes: [
      'Create an object: new Main().method()',
      'Or declare the helper method/field as static',
      'Move logic into an instance method and call it through an object',
    ],
    example: {
      bad: `public class Main {
    void greet() { System.out.println("Hi"); }
    public static void main(String[] args) {
        greet();
    }
}`,
      good: `public class Main {
    void greet() { System.out.println("Hi"); }
    public static void main(String[] args) {
        new Main().greet();
    }
}`,
    },
    tip: 'static belongs to the class, non-static belongs to an object: you need an object to use it.',
  },
  {
    id: 'java-unreachable-statement',
    lang: 'Java',
    title: 'error: unreachable statement',
    patterns: ['unreachable statement'],
    meaning: {
      en: 'There is code that can never run, for example after a return, break or an infinite loop.',
      mr: 'असा code आहे जो कधीच run होऊ शकत नाही, उदा. return, break किंवा infinite loop नंतरचा code.',
    },
    causes: [
      'Statements written after return',
      'Code after break or continue inside the same block',
      'Code after while(true) with no break',
      'Code after throw',
    ],
    fixes: [
      'Move the statement before the return/break',
      'Delete code that is truly not needed',
      'Add a break condition to the infinite loop',
    ],
    example: {
      bad: `int square(int x) {
    return x * x;
    System.out.println("done");
}`,
      good: `int square(int x) {
    System.out.println("done");
    return x * x;
}`,
    },
    tip: 'Treat return, break and throw as the last line of their block.',
  },

  // ───────────────────────────── Python ─────────────────────────────
  {
    id: 'py-indentation-error',
    lang: 'Python',
    title: 'IndentationError',
    patterns: ['IndentationError', 'expected an indented block', 'unindent does not match any outer indentation level', 'TabError'],
    meaning: {
      en: 'Python uses indentation (spaces) to group code, and the spaces in your code are missing or inconsistent.',
      mr: 'Python मध्ये code blocks indentation (spaces) ने ठरतात, आणि तुमच्या code मध्ये spaces कमी आहेत किंवा एकसारखे नाहीत.',
    },
    causes: [
      'No indented line after if/for/def/class ending with :',
      'Mixing tabs and spaces',
      'An extra space at the start of a line (unexpected indent)',
      'Lines in the same block indented by different amounts',
    ],
    fixes: [
      'Indent the block under every line ending with : by 4 spaces',
      'Configure your editor to insert 4 spaces for Tab',
      'Re-indent the whole block consistently',
      'Use pass if a block should be empty for now',
    ],
    example: {
      bad: `def greet(name):
print("Hello", name)`,
      good: `def greet(name):
    print("Hello", name)`,
    },
    tip: 'Turn on "render whitespace" in VS Code so you can see tabs vs spaces.',
  },
  {
    id: 'py-syntax-invalid',
    lang: 'Python',
    title: 'SyntaxError: invalid syntax',
    patterns: ['SyntaxError: invalid syntax', "SyntaxError: expected ':'", 'SyntaxError: (unterminated string literal|EOL while scanning)', "SyntaxError: '\\(' was never closed"],
    meaning: {
      en: 'Python could not understand the structure of a line: something is missing, extra or misspelt.',
      mr: 'Python ला line ची रचना समजली नाही: काहीतरी missing, जास्त किंवा चुकीचे लिहिले आहे.',
    },
    causes: [
      'Missing colon : after if, for, while, def, class',
      'Unclosed bracket or quote on this or the previous line',
      'Using = instead of == in a condition',
      'Python 2 style code like print "hi"',
    ],
    fixes: [
      'Look at the line shown and also the line just before it',
      'Add the missing : or closing bracket/quote',
      'Use == for comparison',
      'Use print("hi") with brackets',
    ],
    example: {
      bad: `if x = 5
    print "five"`,
      good: `if x == 5:
    print("five")`,
    },
    tip: 'The ^ marker points near the problem; the real mistake is often just before it.',
  },
  {
    id: 'py-name-error',
    lang: 'Python',
    title: 'NameError: name is not defined',
    patterns: ["NameError: name '[^']+' is not defined", 'NameError'],
    meaning: {
      en: 'You used a variable or function name that Python does not know at that point.',
      mr: 'तुम्ही असे variable किंवा function नाव वापरले आहे जे Python ला त्या ठिकाणी माहीत नाही.',
    },
    causes: [
      'Spelling or case mistake (Print vs print, Name vs name)',
      'Variable used before it is assigned',
      'Forgot to import a module (math, random)',
      'Text without quotes treated as a variable (print(hello))',
    ],
    fixes: [
      'Check the spelling exactly as in the error message',
      'Assign the variable before using it',
      'Add the missing import',
      'Put text in quotes: print("hello")',
    ],
    example: {
      bad: `print(total)
total = 10`,
      good: `total = 10
print(total)`,
    },
    tip: 'Python reads top to bottom: define first, use later.',
  },
  {
    id: 'py-type-error-operand',
    lang: 'Python',
    title: 'TypeError: unsupported operand / can only concatenate str',
    patterns: ['unsupported operand type\\(s\\) for', 'can only concatenate str \\(not', "can't multiply sequence by non-int", 'must be str, not \\w+'],
    meaning: {
      en: 'You used an operator like + or - between values of types that cannot be combined, such as str and int.',
      mr: 'तुम्ही + किंवा - सारखा operator अशा types वर वापरला आहे जे एकत्र चालत नाहीत, उदा. str आणि int.',
    },
    causes: [
      'Adding a string and a number: "Age: " + 21',
      'input() returns str, but you did maths on it',
      'A variable is None and you added a number to it',
    ],
    fixes: [
      'Convert: str(21) for joining, int(x) / float(x) for maths',
      'Wrap input(): age = int(input())',
      'Use f-strings: f"Age: {age}"',
    ],
    example: {
      bad: `age = 21
print("Age: " + age)`,
      good: `age = 21
print("Age: " + str(age))
print(f"Age: {age}")`,
    },
    tip: 'Remember input() always gives a string; convert it immediately.',
  },
  {
    id: 'py-type-error-not-callable',
    lang: 'Python',
    title: "TypeError: 'X' object is not callable",
    patterns: ["object is not callable"],
    meaning: {
      en: 'You put () after something that is not a function, often because a variable has the same name as a built-in function.',
      mr: 'जे function नाही त्याच्यापुढे () लावले आहे, बहुतेक वेळा variable चे नाव built-in function सारखेच ठेवल्यामुळे.',
    },
    causes: [
      'Variable named list, str, sum, input, max overwrote the built-in',
      'Using () instead of [] for indexing: my_list(0)',
      'Missing * operator: 2(x + 1)',
      'Calling a property/attribute as a method',
    ],
    fixes: [
      'Rename the variable (e.g. numbers instead of list) and restart the kernel/program',
      'Use [] for indexing lists and dicts',
      'Write 2 * (x + 1)',
    ],
    example: {
      bad: `sum = 10
total = sum([1, 2, 3])`,
      good: `total_marks = 10
total = sum([1, 2, 3])`,
    },
    tip: 'Never use built-in names (list, dict, str, sum, max, input) as variable names.',
  },
  {
    id: 'py-type-error-missing-arg',
    lang: 'Python',
    title: 'TypeError: missing required positional argument',
    patterns: ['missing \\d+ required positional argument', 'takes \\d+ positional arguments? but \\d+ (were|was) given'],
    meaning: {
      en: 'A function was called with fewer (or more) arguments than it was defined to take.',
      mr: 'Function ला define केल्यापेक्षा कमी (किंवा जास्त) arguments देऊन call केले आहे.',
    },
    causes: [
      'Forgot to pass one or more arguments',
      'Forgot self as the first parameter of a class method',
      'Calling an instance method on the class instead of an object',
    ],
    fixes: [
      'Pass all required arguments in the call',
      'Add self as the first parameter in methods inside a class',
      'Create an object first: obj = MyClass(); obj.method()',
      'Give a default value if the argument is optional: def f(x, y=0)',
    ],
    example: {
      bad: `class Student:
    def show(name):
        print(name)

Student().show("Asha")`,
      good: `class Student:
    def show(self, name):
        print(name)

Student().show("Asha")`,
    },
    tip: 'Every normal method inside a class must start with self.',
  },
  {
    id: 'py-attribute-error-none',
    lang: 'Python',
    title: "AttributeError: 'NoneType' object has no attribute",
    patterns: ["'NoneType' object has no attribute", "AttributeError: '\\w+' object has no attribute"],
    meaning: {
      en: 'A variable is None (or a different type than you think) and you tried to use an attribute or method on it.',
      mr: 'Variable मध्ये None आहे (किंवा तुम्हाला वाटतो त्यापेक्षा वेगळा type आहे) आणि त्यावर attribute किंवा method वापरले आहे.',
    },
    causes: [
      'Assigning the result of list.sort() / append() which return None',
      'Function has no return statement, so it returns None',
      'A search (re.match, find_one, dict.get) found nothing and returned None',
      'Spelling mistake in a method name on a normal object',
    ],
    fixes: [
      'Do not assign the result of in-place methods: call nums.sort() alone',
      'Add a return statement to your function',
      'Check if result is not None before using it',
      'Use dir(obj) to see valid attributes',
    ],
    example: {
      bad: `nums = [3, 1, 2]
nums = nums.sort()
print(nums.count(1))`,
      good: `nums = [3, 1, 2]
nums.sort()
print(nums.count(1))`,
    },
    tip: 'Methods that change a list in place (sort, append, reverse) return None.',
  },
  {
    id: 'py-key-error',
    lang: 'Python',
    title: 'KeyError',
    patterns: ['KeyError'],
    meaning: {
      en: 'You asked a dictionary (or DataFrame) for a key that does not exist in it.',
      mr: 'Dictionary (किंवा DataFrame) मध्ये नसलेली key तुम्ही access केली आहे.',
    },
    causes: [
      'Spelling/case difference in the key ("Name" vs "name")',
      'Key not added yet',
      'Pandas column name has extra spaces',
      'Using a number key when the dict has string keys ("1" vs 1)',
    ],
    fixes: [
      'Use d.get("key", default) to avoid the crash',
      'Check with if "key" in d before accessing',
      'Print d.keys() (or df.columns) to see the real keys',
      'Strip column names: df.columns = df.columns.str.strip()',
    ],
    example: {
      bad: `student = {"name": "Asha"}
print(student["age"])`,
      good: `student = {"name": "Asha"}
print(student.get("age", "N/A"))`,
    },
    tip: 'Use .get() whenever a key may be missing.',
  },
  {
    id: 'py-index-error',
    lang: 'Python',
    title: 'IndexError: list index out of range',
    patterns: ['IndexError', '(list|string|tuple) index out of range'],
    meaning: {
      en: 'You accessed a position in a list, string or tuple that does not exist.',
      mr: 'List, string किंवा tuple मध्ये अस्तित्वात नसलेल्या position वर access केला आहे.',
    },
    causes: [
      'Using range(len(lst) + 1) or index == len(lst)',
      'List is empty and you read lst[0]',
      'Removing items from a list while looping by index',
      'Reading sys.argv[1] without passing an argument',
    ],
    fixes: [
      'Loop directly: for item in lst',
      'Check if lst: before reading lst[0]',
      'Remember last index is len(lst) - 1, or use lst[-1]',
    ],
    example: {
      bad: `marks = [70, 80, 90]
print(marks[3])`,
      good: `marks = [70, 80, 90]
print(marks[-1])  # last element`,
    },
    tip: 'Prefer "for x in list" over index-based loops.',
  },
  {
    id: 'py-value-error-int',
    lang: 'Python',
    title: 'ValueError: invalid literal for int()',
    patterns: ['invalid literal for int\\(\\) with base', 'could not convert string to float', 'ValueError'],
    meaning: {
      en: 'int() or float() received text that is not a valid number.',
      mr: 'int() किंवा float() ला valid number नसलेला text मिळाला आहे.',
    },
    causes: [
      'User typed letters or left input empty',
      'Converting "12.5" with int() instead of float()',
      'Input or file line has spaces or a newline',
      'Number has a comma like "1,000"',
    ],
    fixes: [
      'Use try/except ValueError around the conversion',
      'Use float() for decimals, then int() if needed',
      'Call .strip() and remove commas before converting',
      'Check with str.isdigit() for simple whole numbers',
    ],
    example: {
      bad: `age = int(input("Age: "))  # user types "twenty"`,
      good: `try:
    age = int(input("Age: ").strip())
except ValueError:
    print("Please enter digits only")`,
    },
    tip: 'Always wrap user-input conversion in try/except.',
  },
  {
    id: 'py-zero-division',
    lang: 'Python',
    title: 'ZeroDivisionError',
    patterns: ['ZeroDivisionError'],
    meaning: {
      en: 'A number was divided (or taken modulo) by zero.',
      mr: 'एखाद्या number ला zero ने divide (किंवा modulo) केले आहे.',
    },
    causes: [
      'Average of an empty list: sum(x) / len(x)',
      'Divisor variable became 0',
      'Using % 0',
    ],
    fixes: [
      'Check the divisor before dividing',
      'Handle the empty case separately',
      'Use try/except ZeroDivisionError where it makes sense',
    ],
    example: {
      bad: `marks = []
avg = sum(marks) / len(marks)`,
      good: `marks = []
avg = sum(marks) / len(marks) if marks else 0`,
    },
    tip: 'Every division by a variable needs a "what if it is 0?" check.',
  },
  {
    id: 'py-module-not-found',
    lang: 'Python',
    title: 'ModuleNotFoundError: No module named',
    patterns: ['ModuleNotFoundError', "No module named '[^']+'", 'ImportError: cannot import name'],
    meaning: {
      en: 'Python cannot find the package or module you are importing.',
      mr: 'तुम्ही import करत असलेला package किंवा module Python ला सापडत नाही.',
    },
    causes: [
      'Package not installed (pip install not run)',
      'Installed in a different Python / virtual environment than the one running the code',
      'Package name differs from import name (pip install scikit-learn, import sklearn)',
      'Your own file named the same as the module (e.g. pandas.py, random.py)',
    ],
    fixes: [
      'Install: python -m pip install package-name',
      'Activate the correct venv and select the same interpreter in VS Code',
      'Rename your file if it shadows a real module and delete __pycache__',
      'Check the correct pip name on pypi.org',
    ],
    example: {
      bad: `# pandas not installed
import pandas as pd`,
      good: `# terminal: python -m pip install pandas
import pandas as pd`,
    },
    tip: 'Use "python -m pip install" so the package goes into the same Python you run.',
  },
  {
    id: 'py-recursion-error',
    lang: 'Python',
    title: 'RecursionError: maximum recursion depth exceeded',
    patterns: ['RecursionError', 'maximum recursion depth exceeded'],
    meaning: {
      en: 'A function called itself too many times (default limit about 1000), usually because recursion never stops.',
      mr: 'Function ने स्वतःला खूप वेळा call केले (default limit साधारण 1000), बहुतेक वेळा recursion थांबत नाही म्हणून.',
    },
    causes: [
      'Missing base case',
      'Base case never reached because the argument does not change',
      'Property/setter calling itself',
    ],
    fixes: [
      'Add a correct base case at the top of the function',
      'Ensure each call moves toward the base case (n - 1)',
      'Convert to a loop for large inputs',
    ],
    example: {
      bad: `def countdown(n):
    print(n)
    countdown(n - 1)`,
      good: `def countdown(n):
    if n == 0:
        return
    print(n)
    countdown(n - 1)`,
    },
    tip: 'Do not just raise sys.setrecursionlimit; fix the base case first.',
  },
  {
    id: 'py-unbound-local',
    lang: 'Python',
    title: 'UnboundLocalError',
    patterns: ['UnboundLocalError', 'referenced before assignment', "cannot access local variable '[^']+'"],
    meaning: {
      en: 'Inside a function you assign to a variable, so Python treats it as local, but you read it before assigning.',
      mr: 'Function मध्ये variable ला value assign केल्यामुळे Python त्याला local मानतो, पण assign करण्याआधीच तुम्ही ते वापरले आहे.',
    },
    causes: [
      'Modifying a global variable inside a function (count += 1)',
      'Variable assigned only inside an if branch that did not run',
      'Variable assigned inside try that failed',
    ],
    fixes: [
      'Pass the value as a parameter and return the new value',
      'Use the global keyword if you really need to change a global',
      'Initialise the variable before the if/try block',
    ],
    example: {
      bad: `count = 0
def add():
    count += 1`,
      good: `count = 0
def add(count):
    return count + 1
count = add(count)`,
    },
    tip: 'Avoid changing globals from functions; pass values in and return results.',
  },
  {
    id: 'py-file-not-found',
    lang: 'Python',
    title: 'FileNotFoundError',
    patterns: ['FileNotFoundError', '\\[Errno 2\\] No such file or directory'],
    meaning: {
      en: 'Python could not find the file at the path you gave.',
      mr: 'तुम्ही दिलेल्या path वर Python ला file सापडली नाही.',
    },
    causes: [
      'Program is run from a different folder (working directory) than you expect',
      'Wrong file name or extension (data.csv vs data.xlsx)',
      'Windows backslashes not escaped ("C:\\new\\data.csv")',
      'File really does not exist yet',
    ],
    fixes: [
      'Print os.getcwd() to see the current folder',
      'Use a path relative to the script: Path(__file__).parent / "data.csv"',
      'Use raw strings r"C:\\data\\file.csv" or forward slashes',
      'Check the file name in the file explorer (hidden extensions)',
    ],
    example: {
      bad: `f = open("data.csv")  # run from another folder`,
      good: `from pathlib import Path
path = Path(__file__).parent / "data.csv"
with open(path) as f:
    print(f.read())`,
    },
    tip: 'Build file paths relative to __file__ instead of relying on the current folder.',
  },
  {
    id: 'py-stop-iteration',
    lang: 'Python',
    title: 'StopIteration',
    patterns: ['StopIteration'],
    meaning: {
      en: 'next() was called on an iterator or generator that has no more items.',
      mr: 'ज्या iterator किंवा generator मध्ये आता items उरलेले नाहीत त्यावर next() call केले आहे.',
    },
    causes: [
      'Calling next() more times than there are items',
      'Reusing an iterator/generator that was already consumed',
      'next() on a filter/map with no matching items',
    ],
    fixes: [
      'Use a for loop which handles the end automatically',
      'Give next() a default: next(it, None)',
      'Create a fresh iterator/generator before reusing it',
    ],
    example: {
      bad: `it = iter([1, 2])
next(it); next(it); next(it)`,
      good: `it = iter([1, 2])
value = next(it, None)
first_even = next((n for n in [1, 3] if n % 2 == 0), None)`,
    },
    tip: 'Use next(iterator, default) whenever the iterator might be empty.',
  },

  // ───────────────────────────── JavaScript ─────────────────────────────
  {
    id: 'js-reference-not-defined',
    lang: 'JavaScript',
    title: 'ReferenceError: X is not defined',
    patterns: ['ReferenceError: .+ is not defined', "ReferenceError: Can't find variable", 'ReferenceError: Cannot access .+ before initialization'],
    meaning: {
      en: 'You used a variable or function name that does not exist in the current scope (or is used before its let/const line).',
      mr: 'Current scope मध्ये नसलेले variable किंवा function नाव वापरले आहे (किंवा let/const line च्या आधीच वापरले आहे).',
    },
    causes: [
      'Spelling or case mistake (getElementByID vs getElementById)',
      'Variable declared inside a block/function and used outside',
      'Script file or library (e.g. jQuery $) not loaded before your code',
      'Using a let/const variable before its declaration line',
    ],
    fixes: [
      'Check spelling and case',
      'Declare the variable in an outer scope if you need it there',
      'Load library <script> tags before your own script',
      'Move the declaration above its first use',
    ],
    example: {
      bad: `if (true) {
  let total = 10;
}
console.log(total);`,
      good: `let total;
if (true) {
  total = 10;
}
console.log(total);`,
    },
    tip: 'Use const/let (never undeclared variables) and keep "use strict" or ES modules on.',
  },
  {
    id: 'js-cannot-read-undefined',
    lang: 'JavaScript',
    title: 'TypeError: Cannot read properties of undefined / null',
    patterns: ['Cannot read propert(y|ies) .*of (undefined|null)', "Cannot set propert(y|ies) .*of (undefined|null)", 'undefined is not an object \\(evaluating', 'null is not an object \\(evaluating'],
    meaning: {
      en: 'You accessed a property (like .length or .map) on something that is undefined or null.',
      mr: 'undefined किंवा null असलेल्या गोष्टीवर property (उदा. .length, .map) access केली आहे.',
    },
    causes: [
      'API data not loaded yet (first render) and you used data.items',
      'document.querySelector() did not find the element (returned null)',
      'Script runs before the HTML element exists',
      'Wrong property name or wrong nesting in an object',
    ],
    fixes: [
      'Use optional chaining: data?.items?.length',
      'Give a default: const items = data?.items ?? []',
      'Put <script> at the end of body or use defer',
      'console.log the object to see its real shape',
    ],
    example: {
      bad: `const btn = document.querySelector('#save');
btn.addEventListener('click', save); // btn is null`,
      good: `const btn = document.querySelector('#save');
if (btn) {
  btn.addEventListener('click', save);
}`,
    },
    tip: 'The word after "reading" tells you which property failed; the thing before it is undefined.',
  },
  {
    id: 'js-not-a-function',
    lang: 'JavaScript',
    title: 'TypeError: X is not a function',
    patterns: ['TypeError: .+ is not a function'],
    meaning: {
      en: 'You called something with () that is not a function (it may be undefined, an object or a different type).',
      mr: 'जे function नाही (undefined, object किंवा दुसरा type) त्याला () लावून call केले आहे.',
    },
    causes: [
      'Calling .map() on an object or string instead of an array',
      'Spelling mistake in a method name',
      'Wrong import (default vs named export)',
      'A variable with the same name overwrote the function',
    ],
    fixes: [
      'console.log(typeof x) to see what it really is',
      'Use Array.isArray(data) before calling array methods',
      'Check import style: import x from vs import { x } from',
      'Rename the conflicting variable',
    ],
    example: {
      bad: `const res = { users: [1, 2] };
res.map(u => console.log(u));`,
      good: `const res = { users: [1, 2] };
res.users.map(u => console.log(u));`,
    },
    tip: 'When data comes from an API, log it once and check if it is an array or an object.',
  },
  {
    id: 'js-assignment-to-const',
    lang: 'JavaScript',
    title: 'TypeError: Assignment to constant variable',
    patterns: ['Assignment to constant variable', 'invalid assignment to const'],
    meaning: {
      en: 'You tried to assign a new value to a variable declared with const.',
      mr: 'const ने declare केलेल्या variable ला नवीन value assign करण्याचा प्रयत्न केला आहे.',
    },
    causes: [
      'Incrementing a const counter (count++)',
      'Reassigning a const inside a loop',
      'Reassigning an imported value',
    ],
    fixes: [
      'Use let for values that change',
      'Keep const for values that are assigned once',
      'For objects/arrays, change contents (push) instead of reassigning',
    ],
    example: {
      bad: `const count = 0;
count++;`,
      good: `let count = 0;
count++;`,
    },
    tip: 'Default to const and switch to let only when you really need to reassign.',
  },
  {
    id: 'js-unexpected-token',
    lang: 'JavaScript',
    title: 'SyntaxError: Unexpected token',
    patterns: ['SyntaxError: Unexpected token(?!.*JSON)', 'SyntaxError: Unexpected identifier', 'SyntaxError: missing \\) after argument list'],
    meaning: {
      en: 'JavaScript found a character or word where it did not expect one, so the code structure is broken.',
      mr: 'JavaScript ला अनपेक्षित ठिकाणी character किंवा शब्द सापडला, म्हणजे code ची रचना बिघडली आहे.',
    },
    causes: [
      'Missing or extra bracket, brace or comma',
      'JSX in a .js file without a JSX compiler',
      'Using a reserved word as a variable name',
      'Missing quote in a string',
    ],
    fixes: [
      'Go to the line:column shown and check brackets just before it',
      'Use an editor with bracket matching / Prettier to spot the mismatch',
      'Make sure JSX files are compiled (Vite/Babel)',
    ],
    example: {
      bad: `const user = {
  name: 'Asha'
  age: 21
};`,
      good: `const user = {
  name: 'Asha',
  age: 21
};`,
    },
    tip: 'Format on save (Prettier) makes missing commas and brackets obvious.',
  },
  {
    id: 'js-unexpected-end-of-input',
    lang: 'JavaScript',
    title: 'SyntaxError: Unexpected end of input',
    patterns: ['Unexpected end of input', 'Unexpected end of script', 'expected expression, got end of script'],
    meaning: {
      en: 'The file ended while JavaScript was still waiting for something, usually a closing } or ).',
      mr: 'JavaScript ला अजून काहीतरी (बहुतेक closing } किंवा )) हवे असताना file संपली.',
    },
    causes: [
      'Missing closing brace } of a function or if block',
      'Missing closing ) of a function call',
      'Unclosed template literal or string',
    ],
    fixes: [
      'Count opening and closing braces; use editor bracket matching',
      'Collapse/fold functions in the editor to find the one not closing',
      'Auto-format the file; wrong indentation shows the missing brace',
    ],
    example: {
      bad: `function greet() {
  if (true) {
    console.log('hi');
}`,
      good: `function greet() {
  if (true) {
    console.log('hi');
  }
}`,
    },
    tip: 'Type the closing brace immediately when you type an opening one.',
  },
  {
    id: 'js-max-call-stack',
    lang: 'JavaScript',
    title: 'RangeError: Maximum call stack size exceeded',
    patterns: ['Maximum call stack size exceeded', 'too much recursion'],
    meaning: {
      en: 'A function kept calling itself (or functions kept calling each other) without stopping.',
      mr: 'Function स्वतःला (किंवा functions एकमेकांना) न थांबता call करत राहिले.',
    },
    causes: [
      'Recursive function with no base case',
      'A setter that sets its own property',
      'Two functions calling each other forever',
      'Event handler that triggers the same event',
    ],
    fixes: [
      'Add a base case that stops recursion',
      'Use a different internal name for setter storage (_value)',
      'Check the repeating function names in the stack trace',
    ],
    example: {
      bad: `function sum(n) {
  return n + sum(n - 1);
}`,
      good: `function sum(n) {
  if (n <= 0) return 0;
  return n + sum(n - 1);
}`,
    },
    tip: 'Write the stopping condition first for any recursive function.',
  },
  {
    id: 'js-cors-blocked',
    lang: 'JavaScript',
    title: 'Blocked by CORS policy',
    patterns: ['blocked by CORS policy', "No 'Access-Control-Allow-Origin' header", 'Cross-Origin Request Blocked'],
    meaning: {
      en: 'The browser blocked your request because the server did not allow requests from your website origin (domain/port).',
      mr: 'Server ने तुमच्या website origin (domain/port) वरून requests allow केल्या नाहीत म्हणून browser ने request block केली.',
    },
    causes: [
      'Frontend (localhost:5173) and backend (localhost:8080) are different origins',
      'Backend has no CORS configuration',
      'Preflight OPTIONS request not handled',
      'Using credentials with Access-Control-Allow-Origin: *',
    ],
    fixes: [
      'Enable CORS on the server: Express app.use(cors({ origin: "http://localhost:5173" }))',
      'Spring Boot: add @CrossOrigin or a CorsConfigurer bean',
      'Use the dev server proxy (Vite server.proxy) during development',
      'CORS is fixed on the server, not in frontend fetch code',
    ],
    example: {
      bad: `// server.js
const app = express();
app.get('/api/users', handler);`,
      good: `// server.js
const cors = require('cors');
const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.get('/api/users', handler);`,
    },
    tip: 'CORS is a browser security rule; Postman does not enforce it, so "works in Postman" does not prove the server allows it.',
  },
  {
    id: 'js-failed-to-fetch',
    lang: 'JavaScript',
    title: 'TypeError: Failed to fetch',
    patterns: ['Failed to fetch', 'NetworkError when attempting to fetch resource', 'net::ERR_CONNECTION_REFUSED', 'TypeError: Load failed'],
    meaning: {
      en: 'The browser could not get any response from the server: the request failed at network level.',
      mr: 'Browser ला server कडून काहीच response मिळाला नाही; request network level वरच fail झाली.',
    },
    causes: [
      'Backend server is not running',
      'Wrong URL or port (http vs https, 3000 vs 5000)',
      'CORS block (check the console for a CORS message too)',
      'No internet or the API domain is down',
    ],
    fixes: [
      'Start the backend and open the API URL directly in the browser',
      'Double-check the protocol, host and port in the fetch URL',
      'Look at the Network tab for the real status',
      'Add .catch() / try-catch to show a friendly message',
    ],
    example: {
      bad: `fetch('http://localhost:500/api/users')
  .then(r => r.json());`,
      good: `try {
  const r = await fetch('http://localhost:5000/api/users');
  const data = await r.json();
} catch (err) {
  console.error('Server not reachable', err);
}`,
    },
    tip: 'Keep the API base URL in one config variable so it is never mistyped.',
  },
  {
    id: 'js-json-unexpected-token-lt',
    lang: 'JavaScript',
    title: 'SyntaxError: Unexpected token < in JSON',
    patterns: ['Unexpected token .?<.? in JSON', 'is not valid JSON', 'Unexpected end of JSON input', 'JSON\\.parse: unexpected character'],
    meaning: {
      en: 'You called res.json() / JSON.parse but the response was not JSON, usually an HTML error page starting with <.',
      mr: 'तुम्ही res.json() / JSON.parse वापरले पण response JSON नव्हता; बहुतेक वेळा < ने सुरू होणारे HTML error page आले.',
    },
    causes: [
      'Wrong API URL returned a 404 HTML page',
      'Server crashed and returned an HTML 500 page',
      'Dev server returned index.html because no proxy was set',
      'Empty response body parsed as JSON',
    ],
    fixes: [
      'Check res.ok and res.status before calling res.json()',
      'Log await res.text() to see what actually came back',
      'Fix the URL / proxy so it hits the API',
      'Make the server always send JSON (res.json(...))',
    ],
    example: {
      bad: `const res = await fetch('/api/user');
const data = await res.json();`,
      good: `const res = await fetch('/api/users');
if (!res.ok) throw new Error('HTTP ' + res.status);
const data = await res.json();`,
    },
    tip: 'Open the API URL in a browser tab first; if you see HTML, res.json() will fail.',
  },
  {
    id: 'js-await-not-async',
    lang: 'JavaScript',
    title: 'await is only valid in async functions',
    patterns: ['await is only valid in async function', 'await is only valid in async functions and the top level bodies of modules', "Unexpected reserved word 'await'"],
    meaning: {
      en: 'You used await inside a function that is not marked async.',
      mr: 'async नसलेल्या function मध्ये await वापरले आहे.',
    },
    causes: [
      'Forgot async before the function',
      'await inside a callback (forEach, map, then) that is not async',
      'Top-level await in a CommonJS file',
    ],
    fixes: [
      'Add async: async function load() { ... }',
      'Make the inner callback async or use for...of instead of forEach',
      'Use .then() or wrap code in an async IIFE',
    ],
    example: {
      bad: `function load() {
  const res = await fetch('/api');
}`,
      good: `async function load() {
  const res = await fetch('/api');
}`,
    },
    tip: 'await and async always go together: look at the nearest function around the await.',
  },
  {
    id: 'js-import-outside-module',
    lang: 'JavaScript',
    title: 'Cannot use import statement outside a module',
    patterns: ['Cannot use import statement outside a module', 'import declarations may only appear at top level of a module'],
    meaning: {
      en: 'The file uses ES module syntax (import) but it is being run as a classic script / CommonJS.',
      mr: 'File मध्ये ES module syntax (import) आहे पण ती classic script / CommonJS म्हणून run होत आहे.',
    },
    causes: [
      'Node project without "type": "module" in package.json',
      '<script src="app.js"> without type="module" in HTML',
      'Jest or another tool not configured for ESM',
    ],
    fixes: [
      'Add "type": "module" to package.json, or rename the file to .mjs',
      'Use <script type="module" src="app.js"></script>',
      'Or switch to require() if the project is CommonJS',
    ],
    example: {
      bad: `<script src="app.js"></script>
<!-- app.js: import { sum } from './math.js'; -->`,
      good: `<script type="module" src="app.js"></script>`,
    },
    tip: 'Pick one module system (ESM or CommonJS) per project and stick with it.',
  },

  // ───────────────────────────── React ─────────────────────────────
  {
    id: 'react-unique-key',
    lang: 'React',
    title: 'Each child in a list should have a unique "key" prop',
    patterns: ['Each child in a list should have a unique "?key"? prop', 'Encountered two children with the same key'],
    meaning: {
      en: 'When rendering a list with map(), each element needs a stable, unique key so React can track it.',
      mr: 'map() ने list render करताना प्रत्येक element ला stable आणि unique key हवी, म्हणजे React त्याला ओळखू शकेल.',
    },
    causes: [
      'No key prop on the element returned from map()',
      'Key put on an inner element instead of the outermost one',
      'Duplicate keys (same id or name repeated)',
    ],
    fixes: [
      'Add key={item.id} on the outermost element inside map()',
      'Use a unique database id, not the array index, when items can change order',
      'For fragments use <React.Fragment key={...}>',
    ],
    example: {
      bad: `{users.map(u => <li>{u.name}</li>)}`,
      good: `{users.map(u => <li key={u.id}>{u.name}</li>)}`,
    },
    tip: 'Keys must be unique among siblings and stable across renders; ids are best.',
  },
  {
    id: 'react-too-many-rerenders',
    lang: 'React',
    title: 'Too many re-renders',
    patterns: ['Too many re-renders', 'Maximum update depth exceeded'],
    meaning: {
      en: 'State is being set during render (or in an effect that runs every time), causing an infinite render loop.',
      mr: 'Render होतानाच state set होत आहे (किंवा प्रत्येक वेळी चालणाऱ्या effect मध्ये), त्यामुळे infinite render loop होतो.',
    },
    causes: [
      'onClick={setCount(count + 1)} calls it immediately instead of on click',
      'setState directly in the component body',
      'useEffect without dependency array that sets state',
      'useEffect depending on an object/array recreated every render',
    ],
    fixes: [
      'Pass a function: onClick={() => setCount(count + 1)}',
      'Move setState into an event handler or useEffect',
      'Add a correct dependency array to useEffect',
      'Memoise objects with useMemo or use primitive dependencies',
    ],
    example: {
      bad: `<button onClick={setCount(count + 1)}>+</button>`,
      good: `<button onClick={() => setCount(count + 1)}>+</button>`,
    },
    tip: 'Event props need a function reference, not a function call.',
  },
  {
    id: 'react-object-not-valid-child',
    lang: 'React',
    title: 'Objects are not valid as a React child',
    patterns: ['Objects are not valid as a React child'],
    meaning: {
      en: 'You tried to render a plain object (or Promise/Date) directly in JSX; React can only render text, numbers, elements and arrays.',
      mr: 'JSX मध्ये थेट object (किंवा Promise/Date) render केला आहे; React फक्त text, numbers, elements आणि arrays render करू शकतो.',
    },
    causes: [
      'Rendering {user} instead of {user.name}',
      'Rendering a Date object directly',
      'Rendering API response object as-is',
      'Async component returning a Promise',
    ],
    fixes: [
      'Render a property: {user.name}',
      'Convert to string: {date.toLocaleDateString()}',
      'For debugging use {JSON.stringify(obj)}',
      'Map arrays of objects to elements',
    ],
    example: {
      bad: `return <p>{user}</p>;`,
      good: `return <p>{user.name}</p>;`,
    },
    tip: 'The error lists the object keys ("found: object with keys {...}"); pick one of them to render.',
  },
  {
    id: 'react-invalid-hook-call',
    lang: 'React',
    title: 'Invalid hook call',
    patterns: ['Invalid hook call', 'Hooks can only be called inside of the body of a function component', 'React Hook "\\w+" is called (conditionally|in function)'],
    meaning: {
      en: 'A hook (useState, useEffect...) was called outside a React function component or custom hook, or React is duplicated.',
      mr: 'Hook (useState, useEffect...) React function component किंवा custom hook च्या बाहेर call झाला आहे, किंवा React दोनदा install आहे.',
    },
    causes: [
      'Calling a hook inside a normal function, loop, or event handler',
      'Calling a hook in a class component',
      'Component name starts with a lowercase letter',
      'Two copies of React in node_modules',
    ],
    fixes: [
      'Call hooks only at the top level of a component or a function starting with use',
      'Start component names with a capital letter',
      'Convert class components to function components to use hooks',
      'Run npm ls react and remove duplicates',
    ],
    example: {
      bad: `function handleClick() {
  const [open, setOpen] = useState(false);
}`,
      good: `function Menu() {
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(!open);
  return <button onClick={handleClick}>Menu</button>;
}`,
    },
    tip: 'Install eslint-plugin-react-hooks; it catches rule-of-hooks mistakes as you type.',
  },
  {
    id: 'react-rendered-more-hooks',
    lang: 'React',
    title: 'Rendered more hooks than during the previous render',
    patterns: ['Rendered more hooks than during the previous render', 'Rendered fewer hooks than expected'],
    meaning: {
      en: 'The number or order of hooks changed between renders, usually because a hook is after an early return or inside an if.',
      mr: 'दोन renders मध्ये hooks ची संख्या किंवा क्रम बदलला, बहुतेक hook early return नंतर किंवा if मध्ये असल्यामुळे.',
    },
    causes: [
      'if (loading) return ... placed before some useState/useEffect calls',
      'Hook inside a condition or loop',
      'Calling a component as a function: {MyComp()}',
    ],
    fixes: [
      'Move all hooks to the top of the component, before any return',
      'Put conditions inside the hook, not around it',
      'Render components as <MyComp />, not MyComp()',
    ],
    example: {
      bad: `function Profile({ user }) {
  if (!user) return null;
  const [tab, setTab] = useState('info');
}`,
      good: `function Profile({ user }) {
  const [tab, setTab] = useState('info');
  if (!user) return null;
}`,
    },
    tip: 'Hooks first, early returns after.',
  },
  {
    id: 'react-update-while-rendering',
    lang: 'React',
    title: 'Cannot update a component while rendering a different component',
    patterns: ['Cannot update a component .* while rendering a different component'],
    meaning: {
      en: 'A child component called a parent\'s setState (or a store update) during its own render instead of in an effect or handler.',
      mr: 'Child component ने स्वतःच्या render दरम्यानच parent चा setState (किंवा store update) call केला, effect किंवा handler मध्ये नाही.',
    },
    causes: [
      'Calling props.onChange(value) directly in the child body',
      'Dispatching a Redux/Zustand action during render',
      'Passing setState() instead of () => setState()',
    ],
    fixes: [
      'Move the update into useEffect',
      'Call it from an event handler',
      'Pass a function reference, not a call',
    ],
    example: {
      bad: `function Child({ onReady }) {
  onReady(true);
  return <p>Child</p>;
}`,
      good: `function Child({ onReady }) {
  useEffect(() => { onReady(true); }, [onReady]);
  return <p>Child</p>;
}`,
    },
    tip: 'Render should only describe UI; side effects belong in handlers or useEffect.',
  },
  {
    id: 'react-uncontrolled-to-controlled',
    lang: 'React',
    title: 'A component is changing an uncontrolled input to be controlled',
    patterns: ['changing an uncontrolled input to be controlled', 'changing a controlled input to be uncontrolled'],
    meaning: {
      en: 'An input\'s value prop started as undefined (uncontrolled) and later became a real value (controlled), or the reverse.',
      mr: 'Input चा value prop सुरुवातीला undefined (uncontrolled) होता आणि नंतर खरी value (controlled) झाला, किंवा उलट.',
    },
    causes: [
      'useState() with no initial value',
      'Form state object missing a field (form.email is undefined)',
      'API data sets value to null/undefined',
    ],
    fixes: [
      'Initialise state with an empty string: useState("")',
      'Include every field in the initial form object',
      'Use value={name ?? ""} as a fallback',
    ],
    example: {
      bad: `const [name, setName] = useState();
<input value={name} onChange={e => setName(e.target.value)} />`,
      good: `const [name, setName] = useState('');
<input value={name} onChange={e => setName(e.target.value)} />`,
    },
    tip: 'Every controlled input should start with "" (or false for checkboxes), never undefined.',
  },
  {
    id: 'react-useeffect-missing-dependency',
    lang: 'React',
    title: 'React Hook useEffect has a missing dependency',
    patterns: ['React Hook use\\w+ has (a )?missing dependenc', 'react-hooks/exhaustive-deps'],
    meaning: {
      en: 'ESLint warns that your effect uses a variable or function that is not listed in its dependency array, so it may use stale values.',
      mr: 'ESLint सांगते की effect मध्ये वापरलेले variable किंवा function dependency array मध्ये नाही, त्यामुळे जुनी (stale) value वापरली जाऊ शकते.',
    },
    causes: [
      'Using props/state inside useEffect without listing them',
      'Calling a function defined in the component from the effect',
      'Intentionally leaving [] to run once',
    ],
    fixes: [
      'Add the missing variables to the dependency array',
      'Move the function inside the useEffect',
      'Wrap the function in useCallback if it is used elsewhere',
    ],
    example: {
      bad: `useEffect(() => {
  fetchUser(userId);
}, []);`,
      good: `useEffect(() => {
  fetchUser(userId);
}, [userId]);`,
    },
    tip: 'Trust the lint rule; if adding a dependency causes a loop, fix the dependency, not the rule.',
  },

  // ───────────────────────────── Node.js ─────────────────────────────
  {
    id: 'node-eaddrinuse',
    lang: 'Node.js',
    title: 'Error: listen EADDRINUSE: address already in use',
    patterns: ['EADDRINUSE', 'address already in use'],
    meaning: {
      en: 'The port your server wants to use is already taken by another running process.',
      mr: 'तुमचा server ज्या port वर चालू करायचा आहे तो आधीच दुसऱ्या process ने वापरात आहे.',
    },
    causes: [
      'An old instance of the server is still running in another terminal',
      'nodemon restarted before the old process exited',
      'Another app uses the same port (e.g. 3000, 5000, 8080)',
    ],
    fixes: [
      'Stop the other terminal (Ctrl + C)',
      'Linux/Mac: lsof -i :3000 then kill -9 <PID>',
      'Windows: netstat -ano | findstr :3000 then taskkill /PID <PID> /F',
      'Use a different port: const PORT = process.env.PORT || 5001',
    ],
    example: {
      bad: `app.listen(3000); // 3000 already used`,
      good: `const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log('Listening on ' + PORT));`,
    },
    tip: 'Read the port from process.env.PORT so you can change it without editing code.',
  },
  {
    id: 'node-econnrefused',
    lang: 'Node.js',
    title: 'Error: connect ECONNREFUSED',
    patterns: ['ECONNREFUSED'],
    meaning: {
      en: 'Your code tried to connect to a server/database at a host and port, but nothing was listening there.',
      mr: 'तुमच्या code ने host आणि port वर server/database ला connect करायचा प्रयत्न केला, पण तिथे काहीच चालू नाही.',
    },
    causes: [
      'Database (MySQL/MongoDB/Redis) service is not started',
      'Wrong port in the connection string',
      'localhost resolves to IPv6 ::1 but the service listens on 127.0.0.1',
      'Inside Docker, using localhost instead of the service name',
    ],
    fixes: [
      'Start the service (e.g. net start MySQL80, sudo systemctl start mongod)',
      'Check host/port in .env',
      'Use 127.0.0.1 instead of localhost',
      'In docker-compose use the service name as host',
    ],
    example: {
      bad: `mongoose.connect('mongodb://localhost:27018/app'); // wrong port`,
      good: `mongoose.connect('mongodb://127.0.0.1:27017/app');`,
    },
    tip: 'The address in the error (e.g. 127.0.0.1:3306) tells you exactly which service is down.',
  },
  {
    id: 'node-cannot-find-module',
    lang: 'Node.js',
    title: "Error: Cannot find module",
    patterns: ["Cannot find module '[^']+'", 'MODULE_NOT_FOUND', 'ERR_MODULE_NOT_FOUND', 'Cannot find package'],
    meaning: {
      en: 'Node cannot locate the package or file you required/imported.',
      mr: 'तुम्ही require/import केलेला package किंवा file Node ला सापडत नाही.',
    },
    causes: [
      'npm install was not run (node_modules missing)',
      'Package not added to package.json',
      'Wrong relative path (./ vs ../) or wrong file name case',
      'In ESM, missing .js extension in a relative import',
    ],
    fixes: [
      'Run npm install (or npm install <package>)',
      'Check the path relative to the current file',
      'Add the file extension for ESM: import x from "./utils.js"',
      'Delete node_modules and package-lock.json and reinstall if corrupted',
    ],
    example: {
      bad: `const db = require('./config/db'); // file is in ../config/db.js`,
      good: `const db = require('../config/db');`,
    },
    tip: 'Linux servers are case-sensitive: User.js and user.js are different files.',
  },
  {
    id: 'node-err-require-esm',
    lang: 'Node.js',
    title: 'ERR_REQUIRE_ESM',
    patterns: ['ERR_REQUIRE_ESM', 'require\\(\\) of ES Module'],
    meaning: {
      en: 'You used require() to load a package that is published only as an ES module.',
      mr: 'फक्त ES module म्हणून publish झालेला package तुम्ही require() ने load करत आहात.',
    },
    causes: [
      'New major versions of packages like node-fetch v3, chalk v5, nanoid v4 are ESM-only',
      'Your project is CommonJS (no "type": "module")',
      'TypeScript compiles imports to require()',
    ],
    fixes: [
      'Convert your project to ESM ("type": "module") and use import',
      'Or use dynamic import: const { default: fetch } = await import("node-fetch")',
      'Or install the older CommonJS version (npm i node-fetch@2)',
      'On Node 18+ use the built-in fetch instead of node-fetch',
    ],
    example: {
      bad: `const fetch = require('node-fetch'); // v3 is ESM-only`,
      good: `// Node 18+: fetch is global
const res = await fetch('https://api.example.com');`,
    },
    tip: 'Check the package README for "ESM only" before installing a new major version.',
  },
  {
    id: 'node-req-body-undefined',
    lang: 'Node.js',
    title: 'req.body is undefined',
    patterns: ["of 'req\\.body' as it is undefined", 'req\\.body (is )?undefined', "Cannot destructure property '\\w+' of 'req\\.body'"],
    meaning: {
      en: 'Express did not parse the request body, so req.body is undefined (or empty).',
      mr: 'Express ने request body parse केली नाही, त्यामुळे req.body undefined (किंवा रिकामे) आहे.',
    },
    causes: [
      'app.use(express.json()) missing',
      'Body-parser middleware added after the routes',
      'Client not sending Content-Type: application/json',
      'Form data (multipart) sent without multer',
    ],
    fixes: [
      'Add app.use(express.json()) before your routes',
      'For HTML forms add app.use(express.urlencoded({ extended: true }))',
      'In fetch set headers: { "Content-Type": "application/json" } and body: JSON.stringify(data)',
      'Use multer for file uploads',
    ],
    example: {
      bad: `app.post('/login', (req, res) => {
  const { email } = req.body;
});
app.use(express.json());`,
      good: `app.use(express.json());
app.post('/login', (req, res) => {
  const { email } = req.body;
});`,
    },
    tip: 'Middleware order matters: parsers first, routes after.',
  },
  {
    id: 'node-headers-already-sent',
    lang: 'Node.js',
    title: 'Cannot set headers after they are sent to the client',
    patterns: ['ERR_HTTP_HEADERS_SENT', 'Cannot set headers after they are sent'],
    meaning: {
      en: 'Your route sent a response more than once; only one response is allowed per request.',
      mr: 'Route ने एकापेक्षा जास्त वेळा response पाठवला; एका request ला फक्त एकच response देता येतो.',
    },
    causes: [
      'Missing return after res.send() / res.json() inside an if',
      'Calling res.send() inside a loop',
      'Calling next() after sending a response',
      'Both try and catch send a response in some path',
    ],
    fixes: [
      'Write return res.status(400).json(...) so the function stops',
      'Send one response after the loop finishes',
      'Do not call next() after responding',
    ],
    example: {
      bad: `if (!user) {
  res.status(404).json({ msg: 'Not found' });
}
res.json(user);`,
      good: `if (!user) {
  return res.status(404).json({ msg: 'Not found' });
}
return res.json(user);`,
    },
    tip: 'Always "return res...." in Express handlers.',
  },
  {
    id: 'node-unhandled-rejection',
    lang: 'Node.js',
    title: 'UnhandledPromiseRejection',
    patterns: ['UnhandledPromiseRejection', 'ERR_UNHANDLED_REJECTION', 'Unhandled promise rejection'],
    meaning: {
      en: 'A Promise failed (rejected) and no .catch() or try/catch handled it, so Node crashed or warned.',
      mr: 'Promise fail (reject) झाला आणि त्याला .catch() किंवा try/catch ने handle केले नाही, त्यामुळे Node crash झाला किंवा warning दिली.',
    },
    causes: [
      'await without try/catch in an async function',
      'Promise chain without .catch()',
      'Async Express route throws and Express 4 does not catch it',
    ],
    fixes: [
      'Wrap await calls in try/catch',
      'Add .catch(err => ...) to promise chains',
      'Use an async error wrapper or Express 5 for async routes',
      'Read the actual reason printed after the warning and fix it',
    ],
    example: {
      bad: `app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});`,
      good: `app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});`,
    },
    tip: 'Every await needs a plan for failure: try/catch or a central error handler.',
  },
  {
    id: 'node-mongoose-server-selection',
    lang: 'Node.js',
    title: 'MongooseServerSelectionError',
    patterns: ['MongooseServerSelectionError', 'MongoServerSelectionError', 'Could not connect to any servers in your MongoDB Atlas cluster'],
    meaning: {
      en: 'Mongoose could not reach any MongoDB server within the timeout, so it could not connect.',
      mr: 'दिलेल्या वेळेत Mongoose ला कोणताही MongoDB server मिळाला नाही, त्यामुळे connection झाले नाही.',
    },
    causes: [
      'Local mongod service not running',
      'Atlas: your IP is not in the Network Access whitelist',
      'Wrong connection string, username or password',
      'localhost resolving to ::1 on Node 17+',
    ],
    fixes: [
      'Start MongoDB locally or check Atlas cluster status',
      'Add your current IP in Atlas > Network Access',
      'Copy the connection string again from Atlas and URL-encode special characters in the password',
      'Use mongodb://127.0.0.1:27017/dbname instead of localhost',
    ],
    example: {
      bad: `mongoose.connect('mongodb://localhost/test');`,
      good: `mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test')
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB error', err.message));`,
    },
    tip: 'Keep the connection string in .env and log connection errors clearly on startup.',
  },

  // ───────────────────────────── SQL / MySQL ─────────────────────────────
  {
    id: 'mysql-1064-syntax',
    lang: 'SQL / MySQL',
    title: 'ERROR 1064: You have an error in your SQL syntax',
    patterns: ['ERROR 1064', 'You have an error in your SQL syntax', 'ER_PARSE_ERROR'],
    meaning: {
      en: 'MySQL could not parse your query; something near the quoted text is written incorrectly.',
      mr: 'MySQL ला तुमची query समजली नाही; दाखवलेल्या text च्या जवळ काहीतरी चुकीचे लिहिले आहे.',
    },
    causes: [
      'Missing or extra comma (especially before FROM or after the last column)',
      'Using a reserved word (order, group, desc) as a column/table name',
      'Unclosed quotes or brackets',
      'Wrong keyword order (WHERE after GROUP BY, etc.)',
    ],
    fixes: [
      'Look at the text after "near" in the message; the mistake is just before it',
      'Wrap reserved words in backticks or rename the column',
      'Check commas between columns and values',
      'Follow the order: SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT',
    ],
    example: {
      bad: `SELECT name, email, FROM users WHERE id = 1;`,
      good: `SELECT name, email FROM users WHERE id = 1;`,
    },
    tip: 'Avoid reserved words as column names (order, group, key, desc, date).',
  },
  {
    id: 'mysql-1146-table-not-exist',
    lang: 'SQL / MySQL',
    title: "ERROR 1146: Table doesn't exist",
    patterns: ['ERROR 1146', "Table '[^']+' doesn't exist", 'ER_NO_SUCH_TABLE'],
    meaning: {
      en: 'The table you referenced does not exist in the current database.',
      mr: 'तुम्ही वापरलेली table current database मध्ये अस्तित्वात नाही.',
    },
    causes: [
      'Wrong database selected (USE was not run)',
      'Spelling mistake or singular/plural difference (user vs users)',
      'Table name case differs on Linux servers',
      'Table was never created or migration not run',
    ],
    fixes: [
      'Run SHOW TABLES; to see actual table names',
      'Run USE your_db; or prefix: your_db.users',
      'Create the table / run migrations (or set spring.jpa.hibernate.ddl-auto=update)',
    ],
    example: {
      bad: `SELECT * FROM user;`,
      good: `USE college;
SHOW TABLES;
SELECT * FROM users;`,
    },
    tip: 'Use lowercase table names consistently to avoid case issues between Windows and Linux.',
  },
  {
    id: 'mysql-1054-unknown-column',
    lang: 'SQL / MySQL',
    title: "ERROR 1054: Unknown column in 'field list'",
    patterns: ['ERROR 1054', "Unknown column '[^']+' in", 'ER_BAD_FIELD_ERROR'],
    meaning: {
      en: 'The query refers to a column name that does not exist in the table (or is not visible at that point).',
      mr: 'Query मध्ये असे column नाव आहे जे table मध्ये नाही (किंवा त्या ठिकाणी उपलब्ध नाही).',
    },
    causes: [
      'Column name misspelt',
      'Text value written without quotes, so MySQL treats it as a column',
      'Using a SELECT alias inside WHERE',
      'Using double quotes with ANSI_QUOTES mode',
    ],
    fixes: [
      'Run DESC table_name; to see real column names',
      'Put string values in single quotes: WHERE city = \'Pune\'',
      'Repeat the expression in WHERE or use HAVING for aliases',
      'Use the correct table alias prefix (u.name)',
    ],
    example: {
      bad: `SELECT * FROM students WHERE city = Pune;`,
      good: `SELECT * FROM students WHERE city = 'Pune';`,
    },
    tip: 'Strings always go in single quotes in SQL.',
  },
  {
    id: 'mysql-1062-duplicate-entry',
    lang: 'SQL / MySQL',
    title: "ERROR 1062: Duplicate entry for key",
    patterns: ['ERROR 1062', "Duplicate entry '.*' for key", 'ER_DUP_ENTRY'],
    meaning: {
      en: 'You inserted a value that already exists in a PRIMARY KEY or UNIQUE column.',
      mr: 'PRIMARY KEY किंवा UNIQUE column मध्ये आधीच असलेली value पुन्हा insert केली आहे.',
    },
    causes: [
      'Inserting the same id manually twice',
      'Registering a user with an email that already exists',
      'Running the same insert script twice',
    ],
    fixes: [
      'Use AUTO_INCREMENT for ids and do not pass the id',
      'Check if the record exists before inserting',
      'Use INSERT IGNORE or ON DUPLICATE KEY UPDATE when appropriate',
      'In the app, catch the error and show "Email already registered"',
    ],
    example: {
      bad: `INSERT INTO users (id, email) VALUES (1, 'a@x.com');
INSERT INTO users (id, email) VALUES (1, 'b@x.com');`,
      good: `INSERT INTO users (email) VALUES ('b@x.com')
ON DUPLICATE KEY UPDATE email = VALUES(email);`,
    },
    tip: 'Let the database generate ids with AUTO_INCREMENT.',
  },
  {
    id: 'mysql-1452-fk-child',
    lang: 'SQL / MySQL',
    title: 'ERROR 1452: Cannot add or update a child row: a foreign key constraint fails',
    patterns: ['ERROR 1452', 'Cannot add or update a child row', 'ER_NO_REFERENCED_ROW'],
    meaning: {
      en: 'You inserted/updated a row whose foreign key value does not exist in the parent table.',
      mr: 'असा row insert/update केला ज्याची foreign key value parent table मध्ये अस्तित्वात नाही.',
    },
    causes: [
      'Inserting an order for a customer_id that does not exist',
      'Inserting child rows before parent rows',
      'Typo in the id value',
      'Existing data violates the FK while adding the constraint',
    ],
    fixes: [
      'Insert the parent row first',
      'Check: SELECT * FROM customers WHERE id = ?',
      'Use the correct existing id',
      'Clean bad data before adding the foreign key',
    ],
    example: {
      bad: `INSERT INTO orders (customer_id, amount) VALUES (99, 500); -- no customer 99`,
      good: `INSERT INTO customers (id, name) VALUES (99, 'Ravi');
INSERT INTO orders (customer_id, amount) VALUES (99, 500);`,
    },
    tip: 'Insert in parent-to-child order, and delete in child-to-parent order.',
  },
  {
    id: 'mysql-1451-fk-parent',
    lang: 'SQL / MySQL',
    title: 'ERROR 1451: Cannot delete or update a parent row',
    patterns: ['ERROR 1451', 'Cannot delete or update a parent row', 'ER_ROW_IS_REFERENCED'],
    meaning: {
      en: 'You tried to delete/update a parent row that child rows still refer to via a foreign key.',
      mr: 'ज्या parent row ला child rows foreign key ने अजून refer करतात, तो delete/update करण्याचा प्रयत्न केला.',
    },
    causes: [
      'Deleting a customer who still has orders',
      'Dropping/truncating a table referenced by another table',
      'Changing a primary key value that is referenced',
    ],
    fixes: [
      'Delete child rows first, then the parent',
      'Define the FK with ON DELETE CASCADE if children should go too',
      'Use ON DELETE SET NULL if children should stay',
      'Prefer soft delete (is_active = 0) for important data',
    ],
    example: {
      bad: `DELETE FROM customers WHERE id = 5; -- orders still reference 5`,
      good: `DELETE FROM orders WHERE customer_id = 5;
DELETE FROM customers WHERE id = 5;`,
    },
    tip: 'Decide the ON DELETE behaviour while designing tables, not after.',
  },
  {
    id: 'mysql-1045-access-denied',
    lang: 'SQL / MySQL',
    title: "ERROR 1045: Access denied for user",
    patterns: ['ERROR 1045', "Access denied for user '[^']*'@'[^']*'", 'ER_ACCESS_DENIED_ERROR'],
    meaning: {
      en: 'MySQL rejected the login: the username, password or host is not allowed.',
      mr: 'MySQL ने login नाकारले: username, password किंवा host ला परवानगी नाही.',
    },
    causes: [
      'Wrong password in application.properties / .env',
      'User exists only for a different host (localhost vs %)',
      'Password not provided (using password: NO)',
      'Root uses auth_socket on Ubuntu',
    ],
    fixes: [
      'Test login in terminal: mysql -u root -p',
      'Fix credentials in your config file (no extra spaces/quotes)',
      'Create a user: CREATE USER \'app\'@\'localhost\' IDENTIFIED BY \'pass\'; then GRANT',
      'On Ubuntu: sudo mysql, then ALTER USER root ... IDENTIFIED WITH mysql_native_password',
    ],
    example: {
      bad: `spring.datasource.username=root
spring.datasource.password=`,
      good: `spring.datasource.username=root
spring.datasource.password=your_real_password`,
    },
    tip: 'Create a separate app user with limited rights instead of using root.',
  },
  {
    id: 'mysql-1048-column-null',
    lang: 'SQL / MySQL',
    title: "ERROR 1048: Column cannot be null",
    patterns: ['ERROR 1048', "Column '[^']+' cannot be null", 'ER_BAD_NULL_ERROR'],
    meaning: {
      en: 'You tried to store NULL in a column declared NOT NULL.',
      mr: 'NOT NULL म्हणून declare केलेल्या column मध्ये NULL store करण्याचा प्रयत्न केला.',
    },
    causes: [
      'Form field not sent, so the value is undefined/null',
      'Wrong parameter order in a prepared statement',
      'req.body empty because JSON parser is missing',
    ],
    fixes: [
      'Validate input before inserting',
      'Give the column a DEFAULT value if it is optional',
      'Log the values being inserted to see which is null',
    ],
    example: {
      bad: `INSERT INTO students (name, email) VALUES (NULL, 'a@x.com');`,
      good: `INSERT INTO students (name, email) VALUES ('Asha', 'a@x.com');`,
    },
    tip: 'Validate required fields in the backend before touching the database.',
  },
  {
    id: 'mysql-1366-incorrect-value',
    lang: 'SQL / MySQL',
    title: 'ERROR 1366: Incorrect integer value',
    patterns: ['ERROR 1366', 'Incorrect (integer|decimal|double|date|datetime|string) value', 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD'],
    meaning: {
      en: 'A value of the wrong type was put in a column, e.g. text or an empty string in an INT column.',
      mr: 'Column मध्ये चुकीच्या type ची value टाकली, उदा. INT column मध्ये text किंवा रिकामी string.',
    },
    causes: [
      'Empty string \'\' inserted into an INT column',
      'Text like \'abc\' in a numeric column',
      'Values in the wrong column order',
      'Emoji/Unicode into a non-utf8mb4 column (Incorrect string value)',
    ],
    fixes: [
      'Insert NULL (or a number) instead of an empty string',
      'List columns explicitly in INSERT and match the order',
      'Convert values in the app before inserting',
      'Use utf8mb4 charset for text with emoji or Marathi',
    ],
    example: {
      bad: `INSERT INTO products (name, price) VALUES ('Pen', '');`,
      good: `INSERT INTO products (name, price) VALUES ('Pen', 10);`,
    },
    tip: 'Always name columns in INSERT statements.',
  },
  {
    id: 'mysql-1055-only-full-group-by',
    lang: 'SQL / MySQL',
    title: 'ERROR 1055: only_full_group_by',
    patterns: ['ERROR 1055', 'only_full_group_by', 'ER_WRONG_FIELD_WITH_GROUP', 'is not in GROUP BY clause'],
    meaning: {
      en: 'A selected column is neither in GROUP BY nor inside an aggregate function, so MySQL does not know which value to show.',
      mr: 'SELECT मधील column GROUP BY मध्ये नाही आणि aggregate function मध्येही नाही, त्यामुळे कोणती value दाखवायची हे MySQL ला कळत नाही.',
    },
    causes: [
      'SELECT name, dept, COUNT(*) ... GROUP BY dept',
      'Code written for old MySQL versions with the mode off',
      'Adding columns to SELECT without updating GROUP BY',
    ],
    fixes: [
      'Add the column to GROUP BY',
      'Or wrap it in an aggregate: MAX(name), ANY_VALUE(name)',
      'Rethink the query: grouped results have one row per group',
    ],
    example: {
      bad: `SELECT dept, name, COUNT(*) FROM employees GROUP BY dept;`,
      good: `SELECT dept, COUNT(*) AS total FROM employees GROUP BY dept;`,
    },
    tip: 'Every SELECT column must be grouped or aggregated; do not just disable the mode.',
  },
  {
    id: 'mysql-2002-cant-connect',
    lang: 'SQL / MySQL',
    title: "ERROR 2002/2003: Can't connect to MySQL server",
    patterns: ['ERROR 200[23]', "Can't connect to (local )?MySQL server", 'Communications link failure'],
    meaning: {
      en: 'The client could not reach the MySQL server at all; it is not running or not reachable at that host/port/socket.',
      mr: 'Client ला MySQL server पर्यंत पोहोचता आले नाही; server चालू नाही किंवा त्या host/port/socket वर उपलब्ध नाही.',
    },
    causes: [
      'MySQL service is stopped',
      'Wrong host or port (default 3306)',
      'XAMPP MySQL not started or port conflict',
      'Firewall blocking the port',
    ],
    fixes: [
      'Start MySQL: Windows Services > MySQL80 > Start, or sudo systemctl start mysql',
      'In XAMPP click Start for MySQL and check its log',
      'Verify host/port in the connection URL',
      'Use 127.0.0.1 instead of localhost to force TCP',
    ],
    example: {
      bad: `spring.datasource.url=jdbc:mysql://localhost:3307/college`,
      good: `spring.datasource.url=jdbc:mysql://localhost:3306/college`,
    },
    tip: 'First check "is the service running?" before debugging code.',
  },
  {
    id: 'mysql-1242-subquery-more-than-one-row',
    lang: 'SQL / MySQL',
    title: 'ERROR 1242: Subquery returns more than 1 row',
    patterns: ['ERROR 1242', 'Subquery returns more than 1 row', 'ER_SUBQUERY_NO_1_ROW'],
    meaning: {
      en: 'A subquery used with = (or similar) returned several rows, but only one value was expected.',
      mr: '= सोबत वापरलेल्या subquery ने अनेक rows दिल्या, पण फक्त एकच value अपेक्षित होती.',
    },
    causes: [
      'Using = with a subquery that matches many rows',
      'Missing WHERE condition in the subquery',
      'Duplicate data where you assumed uniqueness',
    ],
    fixes: [
      'Use IN instead of =',
      'Add a stricter WHERE or LIMIT 1 if one row is intended',
      'Use an aggregate like MAX() in the subquery',
      'Rewrite as a JOIN',
    ],
    example: {
      bad: `SELECT name FROM employees
WHERE dept_id = (SELECT id FROM departments WHERE city = 'Pune');`,
      good: `SELECT name FROM employees
WHERE dept_id IN (SELECT id FROM departments WHERE city = 'Pune');`,
    },
    tip: 'Run the subquery alone first to see how many rows it returns.',
  },

  // ───────────────────────────── C# ─────────────────────────────
  {
    id: 'cs-null-reference',
    lang: 'C#',
    title: 'NullReferenceException',
    patterns: ['NullReferenceException', 'Object reference not set to an instance of an object'],
    meaning: {
      en: 'You used a member of an object reference that is null.',
      mr: 'null असलेल्या object reference चा member वापरला आहे.',
    },
    causes: [
      'Object declared but not created with new',
      'Method or LINQ FirstOrDefault() returned null',
      'Navigation property not loaded in Entity Framework (missing Include)',
      'Controller/view received a null model',
    ],
    fixes: [
      'Check the line in the stack trace and find which reference is null',
      'Initialise objects and collections (new List<T>())',
      'Use ?. and ?? operators: user?.Name ?? "Guest"',
      'Use .Include() for related data in EF Core',
    ],
    example: {
      bad: `List<string> names = null;
names.Add("Asha");`,
      good: `List<string> names = new List<string>();
names.Add("Asha");`,
    },
    tip: 'Enable nullable reference types (<Nullable>enable</Nullable>) so the compiler warns you early.',
  },
  {
    id: 'cs-index-out-of-range',
    lang: 'C#',
    title: 'IndexOutOfRangeException',
    patterns: ['IndexOutOfRangeException', 'Index was outside the bounds of the array', 'ArgumentOutOfRangeException'],
    meaning: {
      en: 'You accessed an array/list index that is less than 0 or greater than or equal to its length.',
      mr: 'Array/list मध्ये 0 पेक्षा कमी किंवा length इतका/त्यापेक्षा मोठा index access केला.',
    },
    causes: [
      'Loop uses <= arr.Length',
      'Empty array accessed at [0]',
      'List index used after removing items',
    ],
    fixes: [
      'Use i < arr.Length (or list.Count)',
      'Use foreach when the index is not needed',
      'Check Length/Count before accessing',
    ],
    example: {
      bad: `int[] a = { 1, 2, 3 };
Console.WriteLine(a[3]);`,
      good: `int[] a = { 1, 2, 3 };
Console.WriteLine(a[a.Length - 1]);`,
    },
    tip: 'Arrays use .Length, lists use .Count, and the last index is always one less.',
  },
  {
    id: 'cs-invalid-cast',
    lang: 'C#',
    title: 'InvalidCastException',
    patterns: ['InvalidCastException', 'Unable to cast object of type'],
    meaning: {
      en: 'An object was cast to a type it is not, at runtime.',
      mr: 'Runtime ला object ला अशा type मध्ये cast केले जो तो प्रत्यक्षात नाही.',
    },
    causes: [
      'Casting object to the wrong class',
      'Unboxing to a different numeric type ((int)objLong)',
      'Casting DataReader/Session values to the wrong type',
    ],
    fixes: [
      'Use is / as with a null check before casting',
      'Use Convert.ToInt32() or int.Parse() for conversions',
      'Check the real type with obj.GetType()',
    ],
    example: {
      bad: `object o = "123";
int n = (int)o;`,
      good: `object o = "123";
int n = Convert.ToInt32(o);`,
    },
    tip: 'Casting changes how you view an object; converting creates a new value. Use Convert/Parse for data.',
  },
  {
    id: 'cs-format-exception',
    lang: 'C#',
    title: 'FormatException',
    patterns: ['\\bFormatException', 'Input string was not in a correct format', 'was not recognized as a valid DateTime'],
    meaning: {
      en: 'int.Parse / Convert / DateTime.Parse received text that is not in the expected format.',
      mr: 'int.Parse / Convert / DateTime.Parse ला अपेक्षित format मध्ये नसलेला text मिळाला.',
    },
    causes: [
      'Empty or non-numeric input from Console.ReadLine() or a TextBox',
      'Decimal value parsed with int.Parse',
      'Date in a different culture format (dd/MM vs MM/dd)',
      'Wrong placeholders in string.Format',
    ],
    fixes: [
      'Use int.TryParse(input, out int n) and check the bool result',
      'Use decimal.Parse / double.Parse for decimals',
      'Use DateTime.ParseExact with the format string',
    ],
    example: {
      bad: `int age = int.Parse(Console.ReadLine());`,
      good: `if (int.TryParse(Console.ReadLine(), out int age))
    Console.WriteLine(age);
else
    Console.WriteLine("Enter a valid number");`,
    },
    tip: 'Prefer TryParse for all user input.',
  },
  {
    id: 'cs-cs0103-name-not-exist',
    lang: 'C#',
    title: 'CS0103: The name does not exist in the current context',
    patterns: ['CS0103', "The name '[^']+' does not exist in the current context"],
    meaning: {
      en: 'The compiler cannot find a variable, method or type with that name in the current scope.',
      mr: 'Current scope मध्ये त्या नावाचे variable, method किंवा type compiler ला सापडत नाही.',
    },
    causes: [
      'Spelling or case mistake',
      'Variable declared inside a block (if/for/try) and used outside',
      'Missing using directive for a namespace',
      'Razor view model property name typo',
    ],
    fixes: [
      'Fix spelling; C# is case-sensitive',
      'Declare the variable before the block',
      'Add the needed using (Ctrl + . in Visual Studio)',
    ],
    example: {
      bad: `try {
    int total = 10;
} catch { }
Console.WriteLine(total);`,
      good: `int total = 0;
try {
    total = 10;
} catch { }
Console.WriteLine(total);`,
    },
    tip: 'Use Ctrl + . (Quick Actions) in Visual Studio to add missing usings automatically.',
  },
  {
    id: 'cs-cs0029-implicit-convert',
    lang: 'C#',
    title: 'CS0029: Cannot implicitly convert type',
    patterns: ['CS0029', 'CS0266', "Cannot implicitly convert type '[^']+' to '[^']+'"],
    meaning: {
      en: 'You assigned a value to a variable of a different type, and C# will not convert it automatically.',
      mr: 'वेगळ्या type च्या variable मध्ये value assign केली आहे, आणि C# ती आपोआप convert करत नाही.',
    },
    causes: [
      'Assigning string to int',
      'Assigning double to int (needs explicit cast)',
      'Returning List<T> where T[] or IEnumerable of another type is expected',
      'Using a Task<T> without await',
    ],
    fixes: [
      'Use int.Parse / Convert.ToInt32 for strings',
      'Cast explicitly: (int)myDouble',
      'Use await for async methods',
      'Match the variable type to the value (or use var)',
    ],
    example: {
      bad: `string s = "5";
int n = s;`,
      good: `string s = "5";
int n = int.Parse(s);`,
    },
    tip: 'Hover over both sides in the IDE to compare their types.',
  },
  {
    id: 'cs-cs1002-semicolon-expected',
    lang: 'C#',
    title: 'CS1002: ; expected',
    patterns: ['CS1002', 'error CS1002: ; expected'],
    meaning: {
      en: 'A statement is missing its ending semicolon.',
      mr: 'Statement च्या शेवटी semicolon ; नाही.',
    },
    causes: [
      'Forgot ; at the end of a line',
      'Unclosed bracket makes the compiler expect ;',
      'Typo that splits one statement in two',
    ],
    fixes: [
      'Add ; at the end of the line shown (or the previous line)',
      'Check brackets and quotes on that line',
      'Format the document (Ctrl + K, Ctrl + D)',
    ],
    example: {
      bad: `int x = 5
Console.WriteLine(x);`,
      good: `int x = 5;
Console.WriteLine(x);`,
    },
    tip: 'Fix the first compiler error first; many later errors disappear after it.',
  },
  {
    id: 'cs-sequence-no-elements',
    lang: 'C#',
    title: 'InvalidOperationException: Sequence contains no elements',
    patterns: ['Sequence contains no elements', 'Sequence contains no matching element', 'Sequence contains more than one'],
    meaning: {
      en: 'LINQ First(), Single(), Max() etc. were called on an empty result (or Single found many).',
      mr: 'LINQ First(), Single(), Max() इत्यादी रिकाम्या result वर call झाले (किंवा Single ला अनेक items मिळाले).',
    },
    causes: [
      'First() when no item matches the condition',
      'Max()/Average() on an empty list',
      'Single() when zero or multiple items match',
    ],
    fixes: [
      'Use FirstOrDefault() / SingleOrDefault() and check for null',
      'Check list.Any() before Max()/Average()',
      'Use DefaultIfEmpty() with aggregates',
    ],
    example: {
      bad: `var user = users.First(u => u.Id == 99);`,
      good: `var user = users.FirstOrDefault(u => u.Id == 99);
if (user == null) return NotFound();`,
    },
    tip: 'Use First/Single only when you are sure the item exists.',
  },

  // ───────────────────────────── HTML / CSS ─────────────────────────────
  {
    id: 'html-resource-404',
    lang: 'HTML / CSS',
    title: '404 for CSS / JS / image file',
    patterns: ['GET .*\\.(css|js|png|jpe?g|gif|svg|webp)\\S* (net::ERR_ABORTED )?404', 'Failed to load resource: the server responded with a status of 404', "Refused to apply style from .* because its MIME type \\('text/html'\\)"],
    meaning: {
      en: 'The browser requested your CSS, JS or image file but nothing exists at that path.',
      mr: 'Browser ने तुमची CSS, JS किंवा image file मागितली, पण त्या path वर काहीच नाही.',
    },
    causes: [
      'Wrong relative path (css/style.css vs ../css/style.css)',
      'File name case or extension mismatch (Logo.PNG vs logo.png)',
      'Leading / makes the path relative to the site root',
      'In React/Vite, file not in public/ or not imported',
    ],
    fixes: [
      'Open DevTools > Network, click the red request and check the full URL',
      'Fix the path relative to the HTML file',
      'Match file names exactly, including case',
      'In React, import images or place them in public/',
    ],
    example: {
      bad: `<!-- index.html is in the root, CSS in /css -->
<link rel="stylesheet" href="style.css">`,
      good: `<link rel="stylesheet" href="css/style.css">`,
    },
    tip: 'Keep file and folder names lowercase with no spaces.',
  },
  {
    id: 'html-mixed-content',
    lang: 'HTML / CSS',
    title: 'Mixed Content blocked',
    patterns: ['Mixed Content', 'was loaded over HTTPS, but requested an insecure'],
    meaning: {
      en: 'Your page is on HTTPS but tries to load something over plain HTTP, so the browser blocks it.',
      mr: 'तुमचे page HTTPS वर आहे पण ते HTTP वरून काहीतरी load करत आहे, म्हणून browser ते block करतो.',
    },
    causes: [
      'Hard-coded http:// API URL in a deployed (Netlify/Vercel) frontend',
      'Images or scripts linked with http://',
      'Backend deployed without HTTPS',
    ],
    fixes: [
      'Change URLs to https://',
      'Deploy the backend with HTTPS (Render/Railway give HTTPS by default)',
      'Use relative URLs or environment variables for API base URL',
    ],
    example: {
      bad: `fetch('http://api.myapp.com/users');`,
      good: `fetch('https://api.myapp.com/users');`,
    },
    tip: 'Use an env variable like VITE_API_URL so production can use the HTTPS URL.',
  },
  {
    id: 'css-styles-not-applying',
    lang: 'HTML / CSS',
    title: 'CSS styles not applying (specificity)',
    patterns: ['(css|styles?) (is |are )?not (applying|working|applied)', 'specificity', 'style (is )?(being )?overridden'],
    meaning: {
      en: 'Your CSS rule is loaded but another rule with higher specificity or later order wins, or the selector does not match.',
      mr: 'तुमचा CSS rule load होतो पण जास्त specificity असलेला किंवा नंतर लिहिलेला दुसरा rule जिंकतो, किंवा selector जुळत नाही.',
    },
    causes: [
      'An ID or inline style overrides your class rule',
      'Bootstrap/library CSS loaded after your CSS',
      'Selector typo (.btn-primay) or missing . / #',
      'Browser cache showing old CSS',
    ],
    fixes: [
      'Inspect the element in DevTools > Styles to see which rule is crossed out',
      'Load your own CSS after library CSS',
      'Make the selector more specific instead of using !important',
      'Hard refresh with Ctrl + Shift + R',
    ],
    example: {
      bad: `<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="bootstrap.min.css">`,
      good: `<link rel="stylesheet" href="bootstrap.min.css">
<link rel="stylesheet" href="style.css">`,
    },
    tip: 'Specificity order: inline > #id > .class > element. Use classes for most styling.',
  },
  {
    id: 'html-favicon-404',
    lang: 'HTML / CSS',
    title: 'favicon.ico 404 (Not Found)',
    patterns: ['favicon\\.ico.*404', 'GET .*/favicon\\.ico'],
    meaning: {
      en: 'The browser automatically asks for /favicon.ico (the tab icon) and your site does not have one. It is harmless.',
      mr: 'Browser आपोआप /favicon.ico (tab icon) मागतो आणि तुमच्या site वर तो नाही. हे धोकादायक नाही.',
    },
    causes: [
      'No favicon file in the project root',
      'No <link rel="icon"> tag',
      'Wrong path in the icon link',
    ],
    fixes: [
      'Add a favicon.ico to the site root (or public/ in React)',
      'Add <link rel="icon" href="favicon.png"> in <head>',
      'Ignore it during practice; it does not break your page',
    ],
    example: {
      bad: `<head>
  <title>My Site</title>
</head>`,
      good: `<head>
  <title>My Site</title>
  <link rel="icon" href="images/favicon.png" type="image/png">
</head>`,
    },
    tip: 'Not every red line in the console is your bug; favicon 404 is cosmetic.',
  },

  // ───────────────────────────── Git ─────────────────────────────
  {
    id: 'git-not-a-repository',
    lang: 'Git',
    title: 'fatal: not a git repository',
    patterns: ['not a git repository'],
    meaning: {
      en: 'You ran a git command in a folder that is not inside a Git repository.',
      mr: 'Git repository नसलेल्या folder मध्ये git command चालवली आहे.',
    },
    causes: [
      'git init was never run',
      'Terminal is in the wrong folder',
      'The .git folder was deleted',
    ],
    fixes: [
      'cd into the project folder (check with pwd / dir)',
      'Run git init to start a new repository',
      'Or git clone <url> to get an existing one',
    ],
    example: {
      bad: `cd Desktop
git status`,
      good: `cd Desktop/my-project
git init
git status`,
    },
    tip: 'Check the folder you are in before running git commands.',
  },
  {
    id: 'git-push-rejected',
    lang: 'Git',
    title: 'failed to push some refs (rejected, non-fast-forward)',
    patterns: ['failed to push some refs', 'non-fast-forward', 'Updates were rejected because', '\\[rejected\\]'],
    meaning: {
      en: 'The remote branch has commits you do not have locally, so Git refuses to overwrite them.',
      mr: 'Remote branch वर असे commits आहेत जे तुमच्या local मध्ये नाहीत, म्हणून Git ते overwrite करू देत नाही.',
    },
    causes: [
      'Someone else pushed to the same branch',
      'You created README on GitHub and then pushed a local repo',
      'You edited files directly on GitHub',
    ],
    fixes: [
      'Run git pull --rebase origin main, then git push',
      'If histories are unrelated: git pull origin main --allow-unrelated-histories',
      'Resolve any conflicts, commit, then push',
      'Avoid git push --force on shared branches',
    ],
    example: {
      bad: `git push origin main
# ! [rejected] main -> main (fetch first)`,
      good: `git pull --rebase origin main
git push origin main`,
    },
    tip: 'Pull before you start work and before you push.',
  },
  {
    id: 'git-merge-conflict',
    lang: 'Git',
    title: 'CONFLICT (content): Merge conflict',
    patterns: ['CONFLICT \\(', 'Merge conflict in', 'Automatic merge failed', 'you need to resolve your current index first'],
    meaning: {
      en: 'Git could not merge automatically because the same lines were changed differently in both branches.',
      mr: 'दोन्ही branches मध्ये त्याच lines वेगवेगळ्या प्रकारे बदलल्यामुळे Git ला आपोआप merge करता आले नाही.',
    },
    causes: [
      'Two people edited the same lines',
      'Pulling remote changes on top of your local edits',
      'Long-lived branches drifting apart',
    ],
    fixes: [
      'Open the file and find <<<<<<<, =======, >>>>>>> markers',
      'Keep the correct code and delete the markers',
      'git add <file> then git commit (or git rebase --continue)',
      'Use git merge --abort to cancel if needed',
    ],
    example: {
      bad: `<<<<<<< HEAD
const title = 'Home';
=======
const title = 'Dashboard';
>>>>>>> feature`,
      good: `const title = 'Dashboard';`,
    },
    tip: 'Commit small and pull often to keep conflicts small.',
  },
  {
    id: 'git-permission-denied-publickey',
    lang: 'Git',
    title: 'Permission denied (publickey)',
    patterns: ['Permission denied \\(publickey\\)', 'Could not read from remote repository'],
    meaning: {
      en: 'GitHub rejected your SSH connection because it does not recognise your SSH key.',
      mr: 'GitHub ने तुमचे SSH connection नाकारले कारण तो तुमची SSH key ओळखत नाही.',
    },
    causes: [
      'No SSH key generated on this computer',
      'Public key not added to GitHub settings',
      'ssh-agent not running / key not added',
      'Remote URL uses SSH but you meant HTTPS',
    ],
    fixes: [
      'Generate a key: ssh-keygen -t ed25519 -C "you@example.com"',
      'Add ~/.ssh/id_ed25519.pub in GitHub > Settings > SSH and GPG keys',
      'Test with ssh -T git@github.com',
      'Or switch to HTTPS: git remote set-url origin https://github.com/user/repo.git',
    ],
    example: {
      bad: `git clone git@github.com:user/repo.git
# Permission denied (publickey)`,
      good: `ssh-keygen -t ed25519 -C "you@example.com"
# add the .pub key on GitHub, then
ssh -T git@github.com
git clone git@github.com:user/repo.git`,
    },
    tip: 'Set up SSH once per computer and test it with ssh -T git@github.com.',
  },

  // ───────────────────────────── npm / Build ─────────────────────────────
  {
    id: 'npm-eresolve',
    lang: 'npm / Build',
    title: 'npm ERR! ERESOLVE unable to resolve dependency tree',
    patterns: ['ERESOLVE', 'unable to resolve dependency tree', 'Could not resolve dependency', 'conflicting peer dependency'],
    meaning: {
      en: 'npm found packages whose peer dependency versions conflict (e.g. a library needs React 17 but you have React 18).',
      mr: 'npm ला असे packages सापडले ज्यांच्या peer dependency versions जुळत नाहीत (उदा. library ला React 17 हवा पण तुमच्याकडे React 18 आहे).',
    },
    causes: [
      'Library not yet updated for your React/Angular version',
      'Installing an old tutorial\'s package versions',
      'npm 7+ is stricter about peer dependencies',
    ],
    fixes: [
      'Read the "Could not resolve dependency" lines to see which versions clash',
      'Install a newer version of the library that supports your version',
      'As a temporary workaround: npm install --legacy-peer-deps',
      'Delete node_modules and package-lock.json and reinstall',
    ],
    example: {
      bad: `npm install react-old-lib   # needs react@^17, project has react@18`,
      good: `npm install react-old-lib@latest
# or temporarily
npm install react-old-lib --legacy-peer-deps`,
    },
    tip: 'Check a package\'s peerDependencies on npmjs.com before installing.',
  },
  {
    id: 'npm-command-not-found',
    lang: 'npm / Build',
    title: 'command not found / is not recognized as an internal or external command',
    patterns: ['command not found', 'is not recognized as an internal or external command', 'is not recognized as the name of a cmdlet'],
    meaning: {
      en: 'The terminal cannot find the program you typed (node, npm, git, nodemon, etc.) in the system PATH.',
      mr: 'तुम्ही type केलेला program (node, npm, git, nodemon इ.) terminal ला system PATH मध्ये सापडत नाही.',
    },
    causes: [
      'Tool is not installed',
      'Installed but terminal/VS Code not restarted after install',
      'Install folder not added to PATH',
      'Local package (nodemon, vite) not installed globally',
    ],
    fixes: [
      'Install the tool (Node.js from nodejs.org, Git from git-scm.com)',
      'Close and reopen the terminal / VS Code',
      'Use npx for local tools: npx nodemon server.js',
      'Add the install folder to PATH in Environment Variables',
    ],
    example: {
      bad: `nodemon server.js
# 'nodemon' is not recognized as an internal or external command`,
      good: `npm install --save-dev nodemon
npx nodemon server.js`,
    },
    tip: 'Prefer npx or npm scripts over global installs.',
  },
  {
    id: 'npm-eacces',
    lang: 'npm / Build',
    title: 'npm ERR! EACCES: permission denied',
    patterns: ['EACCES', 'npm ERR! code EACCES', 'EPERM: operation not permitted'],
    meaning: {
      en: 'npm does not have permission to write to a folder (often the global node_modules folder).',
      mr: 'npm ला folder मध्ये (बहुतेक global node_modules) लिहिण्याची परवानगी नाही.',
    },
    causes: [
      'npm install -g with Node installed system-wide on Linux/Mac',
      'Project files created earlier with sudo',
      'Windows: file locked by VS Code or antivirus (EPERM)',
    ],
    fixes: [
      'Use nvm to install Node in your user folder',
      'Fix ownership: sudo chown -R $USER ~/.npm and the project folder',
      'Avoid sudo npm install',
      'On Windows close editors/terminals using the folder and retry',
    ],
    example: {
      bad: `sudo npm install -g nodemon`,
      good: `# install Node via nvm, then
npm install -g nodemon`,
    },
    tip: 'Never use sudo with npm; use nvm instead.',
  },
  {
    id: 'build-module-not-found-resolve',
    lang: 'npm / Build',
    title: "Module not found: Can't resolve",
    patterns: ["Module not found: (Error: )?Can't resolve", 'Failed to resolve import', 'Could not resolve ".*" from'],
    meaning: {
      en: 'The bundler (Webpack/Vite) could not find a file or package you imported.',
      mr: 'Bundler (Webpack/Vite) ला तुम्ही import केलेली file किंवा package सापडली नाही.',
    },
    causes: [
      'Package not installed',
      'Wrong relative path or file name case',
      'Missing file extension for non-JS files (.css, .png)',
      'Importing from src outside the allowed folder',
    ],
    fixes: [
      'npm install the missing package',
      'Fix the path: ./components/Navbar vs ../components/Navbar',
      'Match exact file name casing (Navbar.jsx vs navbar.jsx)',
      'Restart the dev server after installing',
    ],
    example: {
      bad: `import Navbar from './Components/navbar';`,
      good: `import Navbar from './components/Navbar';`,
    },
    tip: 'Use editor path autocomplete when writing imports.',
  },

  // ───────────────────────────── Extra common errors ─────────────────────────────
  {
    id: 'java-could-not-load-main-class',
    lang: 'Java',
    title: 'Error: Could not find or load main class',
    patterns: ['Could not find or load main class', 'ClassNotFoundException'],
    meaning: {
      en: 'The JVM could not find the class you asked it to run, usually because of a wrong name, package or classpath.',
      mr: 'तुम्ही run करायला सांगितलेला class JVM ला सापडला नाही, बहुतेक चुकीचे नाव, package किंवा classpath मुळे.',
    },
    causes: [
      'Running java Main.java vs java Main from the wrong folder',
      'Class is inside a package but run without the package name',
      'Typing the .class extension: java Main.class',
      'Code not compiled (no .class file)',
    ],
    fixes: [
      'Compile first: javac Main.java, then run: java Main',
      'For packages, run from the source root: java com.app.Main',
      'Do not add .class when running',
      'Check the -cp / classpath includes the output folder',
    ],
    example: {
      bad: `cd src/com/app
java Main.class`,
      good: `cd src
javac com/app/Main.java
java com.app.Main`,
    },
    tip: 'The run command uses the fully qualified class name, not a file path.',
  },
  {
    id: 'java-no-suitable-driver',
    lang: 'Java',
    title: 'SQLException: No suitable driver found',
    patterns: ['No suitable driver found', 'com\\.mysql\\.cj\\.jdbc\\.Driver'],
    meaning: {
      en: 'JDBC could not find a database driver that understands your connection URL.',
      mr: 'तुमच्या connection URL ला समजणारा database driver JDBC ला सापडला नाही.',
    },
    causes: [
      'MySQL connector JAR not added to the project / classpath',
      'Typo in the JDBC URL (jdbc:mysql://...)',
      'Maven dependency missing or not downloaded',
    ],
    fixes: [
      'Add mysql-connector-j dependency in pom.xml (or add the JAR to the build path)',
      'Check URL format: jdbc:mysql://localhost:3306/dbname',
      'Reload Maven project after editing pom.xml',
    ],
    example: {
      bad: `Connection con = DriverManager.getConnection(
    "jdbc:mysq://localhost:3306/college", "root", "pass");`,
      good: `// pom.xml: com.mysql:mysql-connector-j
Connection con = DriverManager.getConnection(
    "jdbc:mysql://localhost:3306/college", "root", "pass");`,
    },
    tip: 'Keep the JDBC URL in one constant or properties file.',
  },
  {
    id: 'py-not-subscriptable',
    lang: 'Python',
    title: "TypeError: 'X' object is not subscriptable",
    patterns: ['object is not subscriptable'],
    meaning: {
      en: 'You used [ ] indexing on something that does not support it, like an int, None or a function.',
      mr: 'जे indexing support करत नाही (उदा. int, None, function) त्यावर [ ] वापरले आहे.',
    },
    causes: [
      'Variable is None because a function returned nothing',
      'Indexing an int: num[0]',
      'Using func[0] instead of func()[0]',
      'Indexing a set (sets have no order)',
    ],
    fixes: [
      'print(type(x)) to see what it really is',
      'Convert to str or list first: str(num)[0]',
      'Make sure the function returns a value',
      'Convert set to list before indexing',
    ],
    example: {
      bad: `num = 12345
print(num[0])`,
      good: `num = 12345
print(str(num)[0])`,
    },
    tip: 'Only sequences (str, list, tuple) and mappings (dict) support [ ].',
  },
  {
    id: 'py-not-iterable',
    lang: 'Python',
    title: "TypeError: 'X' object is not iterable",
    patterns: ["TypeError: '\\w+' object is not iterable", 'cannot unpack non-iterable'],
    meaning: {
      en: 'You tried to loop over (or unpack) a value that is not a collection, such as an int or None.',
      mr: 'Collection नसलेल्या value वर (उदा. int किंवा None) loop किंवा unpack करण्याचा प्रयत्न केला.',
    },
    causes: [
      'for i in 10 instead of for i in range(10)',
      'Function returned None and you looped over it',
      'Unpacking a single value: a, b = 5',
    ],
    fixes: [
      'Use range(n) to loop n times',
      'Make sure the function returns a list/tuple',
      'Check the number of values when unpacking',
    ],
    example: {
      bad: `for i in 5:
    print(i)`,
      good: `for i in range(5):
    print(i)`,
    },
    tip: 'Loops need something iterable: list, str, dict, range, file.',
  },
  {
    id: 'js-not-iterable',
    lang: 'JavaScript',
    title: 'TypeError: X is not iterable',
    patterns: ["TypeError: (?!'\\w+' object)\\S+ is not iterable", 'Symbol\\(Symbol\\.iterator\\)'],
    meaning: {
      en: 'You used for...of, spread (...) or array destructuring on something that is not iterable, like undefined or a plain object.',
      mr: 'for...of, spread (...) किंवा array destructuring अशा गोष्टीवर वापरले जी iterable नाही, उदा. undefined किंवा साधा object.',
    },
    causes: [
      'API data not loaded yet (undefined)',
      'Looping over an object with for...of',
      'Destructuring useState wrongly: const [a, b] = useContext(...) returning an object',
    ],
    fixes: [
      'Default to an empty array: for (const x of items ?? [])',
      'Use Object.entries(obj) to loop over objects',
      'Match destructuring to what is returned ({ } vs [ ])',
    ],
    example: {
      bad: `const user = { name: 'Asha', city: 'Pune' };
for (const v of user) console.log(v);`,
      good: `const user = { name: 'Asha', city: 'Pune' };
for (const [k, v] of Object.entries(user)) console.log(k, v);`,
    },
    tip: 'Objects are not iterable; arrays, strings, Maps and Sets are.',
  },
  {
    id: 'react-target-container',
    lang: 'React',
    title: 'Target container is not a DOM element',
    patterns: ['Target container is not a DOM element', 'createRoot\\(\\.\\.\\.\\): Target container'],
    meaning: {
      en: 'ReactDOM could not find the HTML element you asked it to render into (usually #root).',
      mr: 'ज्या HTML element मध्ये (बहुतेक #root) render करायचे आहे तो ReactDOM ला सापडला नाही.',
    },
    causes: [
      'index.html has <div id="app"> but code uses getElementById("root")',
      'Script runs before the div exists',
      'Typo in the id',
    ],
    fixes: [
      'Make the id in index.html and main.jsx match',
      'Load the script at the end of body or with type="module"/defer',
      'Check the spelling of the id in getElementById("root")',
    ],
    example: {
      bad: `// index.html: <div id="app"></div>
ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
      good: `// index.html: <div id="root"></div>
ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
    },
    tip: 'Do not rename the root div unless you also update main.jsx.',
  },
  {
    id: 'node-jwt-errors',
    lang: 'Node.js',
    title: 'JsonWebTokenError: jwt malformed / invalid signature',
    patterns: ['JsonWebTokenError', 'jwt malformed', 'TokenExpiredError', 'secretOrPrivateKey must have a value'],
    meaning: {
      en: 'jsonwebtoken could not verify the token: it is missing, badly formatted, signed with another secret, or expired.',
      mr: 'jsonwebtoken ला token verify करता आला नाही: token नाही, चुकीच्या format मध्ये आहे, दुसऱ्या secret ने sign केला आहे किंवा expire झाला आहे.',
    },
    causes: [
      'Sending "Bearer <token>" and verifying the whole string',
      'JWT_SECRET undefined because .env is not loaded',
      'Different secret used for sign and verify',
      'Token expired (expiresIn passed)',
    ],
    fixes: [
      'Split the header: const token = authHeader.split(" ")[1]',
      'Call require("dotenv").config() at the very top of server.js',
      'Use the same process.env.JWT_SECRET everywhere',
      'Handle TokenExpiredError by asking the user to log in again',
    ],
    example: {
      bad: `const decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);`,
      good: `const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);`,
    },
    tip: 'Log the token once to confirm it has three dot-separated parts.',
  },
  {
    id: 'git-src-refspec',
    lang: 'Git',
    title: 'error: src refspec main does not match any',
    patterns: ['src refspec .* does not match any'],
    meaning: {
      en: 'You tried to push a branch that does not exist locally, often because there are no commits yet or the branch is named master.',
      mr: 'Local मध्ये नसलेली branch push करायचा प्रयत्न केला; बहुतेक अजून commit झालेला नाही किंवा branch चे नाव master आहे.',
    },
    causes: [
      'No commit made yet after git init',
      'Local branch is master but you push main (or vice versa)',
      'Typo in the branch name',
    ],
    fixes: [
      'Make a first commit: git add . then git commit -m "first commit"',
      'Check branch name with git branch',
      'Rename to main: git branch -M main, then git push -u origin main',
    ],
    example: {
      bad: `git init
git remote add origin <url>
git push -u origin main`,
      good: `git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin <url>
git push -u origin main`,
    },
    tip: 'You cannot push an empty repository; commit at least once.',
  },
];
