// Final Project Studio - Java Full Stack capstone projects.
// Each project: requirements, architecture, DB schema, APIs, milestones,
// a runnable plain-Java starter (for the in-app IDE), key framework code,
// rubric (100 points), viva questions and extension ideas.

export const javaProjects = [
  // ------------------------------------------------------------------
  // 1. Bank Account Management System (Core Java console)
  // ------------------------------------------------------------------
  {
    id: 'bank-console',
    title: 'Bank Account Management System',
    level: 'Beginner',
    duration: '5 days',
    track: 'Core Java',
    stack: ['Java 17', 'OOP', 'Collections', 'Custom Exceptions', 'File I/O'],
    summary:
      'A menu-driven console app where a bank employee can open accounts, deposit, withdraw, transfer money and see a mini statement. It proves you can model real objects with classes, protect data with encapsulation, handle errors with custom exceptions and save data to a file.',
    features: [
      'Open a new account with holder name and opening balance (auto account number starting from 1001)',
      'Deposit money (amount must be positive)',
      'Withdraw money with a custom InsufficientFundsException when balance is low',
      'Transfer money between two accounts',
      'Search an account by account number',
      'Show all accounts and total bank balance',
      'Keep a transaction history (mini statement - last 5 transactions)',
      'Save all accounts to a file on exit and load them on start',
      'Menu loop using Scanner with input validation',
    ],
    roles: ['Bank Employee: performs all operations from the menu'],
    architecture:
      'Simple layered console design. Main shows the menu and reads input. Bank is the service class that holds a Map<Integer, Account> and business rules. Account is the model class. FileStore reads/writes accounts as CSV lines.\n\n' +
      '  Main (menu + Scanner)\n' +
      '     |\n' +
      '  Bank (service: open, deposit, withdraw, transfer, search)\n' +
      '     |\n' +
      '  Account (model)  +  Transaction (model)\n' +
      '     |\n' +
      '  FileStore (save / load accounts.csv)',
    folderStructure: `bank-console/
├── src/
│   ├── Main.java
│   ├── Account.java
│   ├── Transaction.java
│   ├── Bank.java
│   ├── InsufficientFundsException.java
│   └── FileStore.java
├── data/
│   └── accounts.csv
└── README.md`,
    database: '',
    apis: [],
    milestones: [
      {
        title: 'Milestone 1: Setup & models',
        tasks: [
          'Create the project folder and Main.java with a "Hello Bank" print',
          'Create Account class with private fields accNo, holder, balance',
          'Add a static counter so account numbers start at 1001',
          'Override toString() to print one account in a neat line',
        ],
      },
      {
        title: 'Milestone 2: Core operations',
        tasks: [
          'Write deposit() and withdraw() with validation for negative amounts',
          'Create InsufficientFundsException (checked exception)',
          'Throw the exception from withdraw() when amount > balance',
          'Test each method from main() with sample data',
        ],
      },
      {
        title: 'Milestone 3: Bank service with Collections',
        tasks: [
          'Create Bank class with a LinkedHashMap<Integer, Account>',
          'Add openAccount(), findAccount(), getAllAccounts()',
          'Add transfer(from, to, amount) using withdraw + deposit',
          'Add totalBalance() that sums all balances',
        ],
      },
      {
        title: 'Milestone 4: Menu with Scanner',
        tasks: [
          'Build a while loop menu: 1 Open, 2 Deposit, 3 Withdraw, 4 Transfer, 5 Search, 6 Show all, 0 Exit',
          'Use switch to call Bank methods',
          'Catch InputMismatchException for wrong input and show a friendly message',
          'Catch InsufficientFundsException and print its message',
        ],
      },
      {
        title: 'Milestone 5: Transaction history',
        tasks: [
          'Create Transaction class (type, amount, balanceAfter, time)',
          'Store a List<Transaction> inside every Account',
          'Add a "Mini statement" menu option showing the last 5 transactions',
        ],
      },
      {
        title: 'Milestone 6: File persistence & submission',
        tasks: [
          'Write FileStore.save() using BufferedWriter (one CSV line per account)',
          'Write FileStore.load() using BufferedReader and split(",")',
          'Call load() on start and save() on exit',
          'Write a README with how to run and sample output screenshots',
        ],
      },
    ],
    starter: {
      files: {
        'Main.java': `public class Main {
    public static void main(String[] args) {
        Bank bank = new Bank();
        Account a = bank.openAccount("Ravi Kumar", 5000);
        Account b = bank.openAccount("Priya Sharma", 2000);

        System.out.println("=== Bank Account Management System ===");
        System.out.println("Opened: " + a);
        System.out.println("Opened: " + b);

        try {
            a.deposit(1500);
            System.out.println("Deposited 1500 to " + a.getAccNo());
            b.withdraw(500);
            System.out.println("Withdrew 500 from " + b.getAccNo());
            bank.transfer(a.getAccNo(), b.getAccNo(), 2000);
            System.out.println("Transferred 2000 from " + a.getAccNo() + " to " + b.getAccNo());
            b.withdraw(10000); // this should fail
        } catch (InsufficientFundsException e) {
            System.out.println("Error: " + e.getMessage());
        }

        System.out.println("--- All Accounts ---");
        for (Account acc : bank.getAllAccounts()) {
            System.out.println(acc);
        }
        System.out.println("Total accounts: " + bank.count());
        System.out.println("TODO: add Scanner menu, transaction history and file save");
    }
}
`,
        'Account.java': `public class Account {
    private static int nextNo = 1001;

    private final int accNo;
    private final String holder;
    private double balance;

    public Account(String holder, double openingBalance) {
        this.accNo = nextNo++;
        this.holder = holder;
        this.balance = openingBalance;
    }

    public int getAccNo() { return accNo; }
    public String getHolder() { return holder; }
    public double getBalance() { return balance; }

    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }
        balance += amount;
    }

    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount <= 0) {
            throw new IllegalArgumentException("Withdraw amount must be positive");
        }
        if (amount > balance) {
            throw new InsufficientFundsException("Insufficient balance in " + accNo
                    + ". Available: " + String.format("%.2f", balance)
                    + ", Requested: " + String.format("%.2f", amount));
        }
        balance -= amount;
    }

    @Override
    public String toString() {
        return accNo + " | " + holder + " | Rs. " + String.format("%.2f", balance);
    }
}
`,
        'InsufficientFundsException.java': `public class InsufficientFundsException extends Exception {
    public InsufficientFundsException(String message) {
        super(message);
    }
}
`,
        'Bank.java': `import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Bank {
    private final Map<Integer, Account> accounts = new LinkedHashMap<>();

    public Account openAccount(String holder, double openingBalance) {
        Account acc = new Account(holder, openingBalance);
        accounts.put(acc.getAccNo(), acc);
        return acc;
    }

    public Account findAccount(int accNo) {
        Account acc = accounts.get(accNo);
        if (acc == null) {
            throw new IllegalArgumentException("Account not found: " + accNo);
        }
        return acc;
    }

    public void transfer(int fromNo, int toNo, double amount) throws InsufficientFundsException {
        Account from = findAccount(fromNo);
        Account to = findAccount(toNo);
        from.withdraw(amount);
        to.deposit(amount);
    }

    public List<Account> getAllAccounts() {
        return new ArrayList<>(accounts.values());
    }

    public int count() {
        return accounts.size();
    }

    // TODO: totalBalance(), mini statement, save/load using FileStore
}
`,
      },
      stdin: '',
      expected: `=== Bank Account Management System ===
Opened: 1001 | Ravi Kumar | Rs. 5000.00
Opened: 1002 | Priya Sharma | Rs. 2000.00
Deposited 1500 to 1001
Withdrew 500 from 1002
Transferred 2000 from 1001 to 1002
Error: Insufficient balance in 1002. Available: 3500.00, Requested: 10000.00
--- All Accounts ---
1001 | Ravi Kumar | Rs. 4500.00
1002 | Priya Sharma | Rs. 3500.00
Total accounts: 2
TODO: add Scanner menu, transaction history and file save`,
      note:
        'Done: Account model, custom exception, Bank service with open/find/transfer. You must add: Scanner menu loop, totalBalance(), Transaction history (mini statement), FileStore save/load to accounts.csv.',
    },
    keyCode: [
      {
        title: 'FileStore.java (save and load accounts)',
        lang: 'java',
        code: `import java.io.*;
import java.util.*;

public class FileStore {
    private static final String FILE = "accounts.csv";

    public static void save(Collection<Account> accounts) throws IOException {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(FILE))) {
            for (Account a : accounts) {
                bw.write(a.getAccNo() + "," + a.getHolder() + "," + a.getBalance());
                bw.newLine();
            }
        }
    }

    public static List<String[]> load() throws IOException {
        List<String[]> rows = new ArrayList<>();
        File f = new File(FILE);
        if (!f.exists()) return rows;
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            String line;
            while ((line = br.readLine()) != null) {
                rows.add(line.split(","));
            }
        }
        return rows;
    }
}`,
      },
      {
        title: 'Menu loop in Main.java',
        lang: 'java',
        code: `Scanner sc = new Scanner(System.in);
int choice;
do {
    System.out.println("1.Open 2.Deposit 3.Withdraw 4.Transfer 5.Search 6.Show All 0.Exit");
    choice = sc.nextInt();
    try {
        switch (choice) {
            case 1 -> {
                sc.nextLine();
                System.out.print("Name: ");
                String name = sc.nextLine();
                System.out.print("Opening balance: ");
                double bal = sc.nextDouble();
                System.out.println("Opened: " + bank.openAccount(name, bal));
            }
            case 3 -> {
                System.out.print("Acc no: ");
                int no = sc.nextInt();
                System.out.print("Amount: ");
                bank.findAccount(no).withdraw(sc.nextDouble());
            }
            case 0 -> System.out.println("Thank you!");
            default -> System.out.println("Invalid choice");
        }
    } catch (InsufficientFundsException | IllegalArgumentException e) {
        System.out.println("Error: " + e.getMessage());
    }
} while (choice != 0);`,
      },
    ],
    rubric: [
      { criterion: 'Functionality', points: 30, desc: 'All menu options work correctly with correct balances.' },
      { criterion: 'OOP Design', points: 20, desc: 'Encapsulation (private fields), clear classes, no duplicate code.' },
      { criterion: 'Exception Handling', points: 15, desc: 'Custom exception used, wrong input does not crash the app.' },
      { criterion: 'File Persistence', points: 15, desc: 'Data saved on exit and loaded again on start.' },
      { criterion: 'Code Quality & README', points: 10, desc: 'Good names, indentation, comments, README with run steps.' },
      { criterion: 'Viva', points: 10, desc: 'Can explain the code and answer questions.' },
    ],
    viva: [
      { q: 'Why did you make the balance field private?', a: 'To follow encapsulation. Nobody can change balance directly; it changes only through deposit() and withdraw() which check the rules.' },
      { q: 'Why is InsufficientFundsException a checked exception?', a: 'Low balance is an expected business situation. A checked exception forces the caller to handle it with try-catch or declare it with throws.' },
      { q: 'Difference between checked and unchecked exceptions?', a: 'Checked exceptions (extends Exception) are checked at compile time and must be handled. Unchecked (extends RuntimeException) like IllegalArgumentException are not forced by the compiler.' },
      { q: 'Why did you use LinkedHashMap instead of HashMap?', a: 'LinkedHashMap keeps insertion order, so accounts are shown in the order they were opened. Lookup is still O(1).' },
      { q: 'How are account numbers generated?', a: 'A private static int counter starting at 1001 is shared by all objects. Each constructor call uses nextNo++ so every account gets a unique number.' },
      { q: 'What does static mean here?', a: 'A static field belongs to the class, not to an object. Only one copy of nextNo exists for all Account objects.' },
      { q: 'What is try-with-resources?', a: 'A try block that declares resources like BufferedWriter. Java closes them automatically at the end, even if an exception happens.' },
      { q: 'Why use BufferedWriter instead of FileWriter alone?', a: 'BufferedWriter keeps data in memory and writes in big chunks, which is faster than writing character by character.' },
      { q: 'Is the transfer method safe if withdraw fails?', a: 'Yes, withdraw is called first. If it throws, deposit never runs, so money is not created or lost.' },
      { q: 'Why should we not use double for real money in banks?', a: 'double has rounding errors (0.1 + 0.2 is not exactly 0.3). Real banking apps use BigDecimal.' },
      { q: 'What is the use of toString()?', a: 'It returns a readable text form of the object. println(account) calls toString() automatically.' },
      { q: 'How would you add a Savings and Current account?', a: 'Make Account abstract and create SavingsAccount and CurrentAccount subclasses that override withdraw() or add interest - this uses inheritance and polymorphism.' },
    ],
    extensions: [
      'Add SavingsAccount (interest) and CurrentAccount (overdraft) using inheritance',
      'Use BigDecimal instead of double for money',
      'Add PIN based login for each customer',
      'Export the mini statement to a text file',
      'Store data using Java serialization (ObjectOutputStream)',
    ],
  },

  // ------------------------------------------------------------------
  // 2. Library Management System (Collections + Streams + Files)
  // ------------------------------------------------------------------
  {
    id: 'library-console',
    title: 'Library Management System',
    level: 'Beginner',
    duration: '6 days',
    track: 'Core Java (Collections & Streams)',
    stack: ['Java 17', 'OOP', 'Collections', 'Streams API', 'Optional', 'File I/O'],
    summary:
      'A console app for a college library where the librarian manages books and members, issues and returns books and calculates fine for late return. It proves you can choose the right collection, write clean Stream queries and persist data in files.',
    features: [
      'Add, update, delete and list books (id, title, author, category, available)',
      'Register library members',
      'Issue a book to a member (only if available, max 3 books per member)',
      'Return a book and calculate fine (Rs. 5 per day after 14 days)',
      'Search books by title or author (case-insensitive) using Streams',
      'Show books by category and count per category',
      'Show members who have overdue books',
      'Save books and members to CSV files and load them on start',
    ],
    roles: ['Librarian: manages books, members, issue and return'],
    architecture:
      'Model classes (Book, Member, IssueRecord) hold data. LibraryService has all business rules and uses List, Map and Streams. FileRepository reads/writes CSV. Main shows the menu.\n\n' +
      '  Main (menu)\n' +
      '     |\n' +
      '  LibraryService  --uses-->  Streams (filter, map, groupingBy)\n' +
      '     |\n' +
      '  Book / Member / IssueRecord (models)\n' +
      '     |\n' +
      '  FileRepository (books.csv, members.csv)',
    folderStructure: `library-console/
├── src/
│   ├── Main.java
│   ├── Book.java
│   ├── Member.java
│   ├── IssueRecord.java
│   ├── LibraryService.java
│   └── FileRepository.java
├── data/
│   ├── books.csv
│   └── members.csv
└── README.md`,
    database: '',
    apis: [],
    milestones: [
      {
        title: 'Milestone 1: Models',
        tasks: [
          'Create Book with id, title, author, category, available',
          'Create Member with id, name and a list of issued book ids',
          'Override toString(), equals() and hashCode() on Book (based on id)',
        ],
      },
      {
        title: 'Milestone 2: Book management',
        tasks: [
          'Create LibraryService with List<Book> and Map<String, Member>',
          'Add addBook(), updateBook(), deleteBook(), findBook() returning Optional',
          'Prevent duplicate book ids',
          'Test with 5 sample books from main()',
        ],
      },
      {
        title: 'Milestone 3: Issue and return',
        tasks: [
          'Write issueBook(bookId, memberId) with all rules (exists, available, max 3)',
          'Create IssueRecord with issueDate (LocalDate)',
          'Write returnBook() and calculate fine using ChronoUnit.DAYS.between',
        ],
      },
      {
        title: 'Milestone 4: Streams reports',
        tasks: [
          'Search by title/author using filter + toLowerCase().contains()',
          'Group books by category with Collectors.groupingBy',
          'List available books sorted by title using Comparator.comparing',
          'Find overdue members',
        ],
      },
      {
        title: 'Milestone 5: Menu and files',
        tasks: [
          'Build Scanner menu for all features',
          'Save books and members to CSV on exit',
          'Load from CSV on start (skip if file missing)',
        ],
      },
      {
        title: 'Milestone 6: Testing & submission',
        tasks: [
          'Test edge cases: unknown id, issue same book twice, return not issued book',
          'Clean code: remove unused imports, good names',
          'Write README with features and screenshots',
        ],
      },
    ],
    starter: {
      files: {
        'Main.java': `public class Main {
    public static void main(String[] args) {
        LibraryService lib = new LibraryService();
        lib.addBook(new Book("B101", "Head First Java", "Kathy Sierra", "Programming"));
        lib.addBook(new Book("B102", "Clean Code", "Robert Martin", "Programming"));
        lib.addBook(new Book("B103", "Wings of Fire", "A P J Abdul Kalam", "Biography"));
        lib.addBook(new Book("B104", "The Alchemist", "Paulo Coelho", "Fiction"));
        lib.addMember(new Member("M1", "Anjali"));
        lib.addMember(new Member("M2", "Rahul"));

        System.out.println("=== Library Management System ===");
        System.out.println("Total books: " + lib.totalBooks());
        System.out.println(lib.issueBook("B101", "M1"));
        System.out.println(lib.issueBook("B103", "M2"));
        System.out.println(lib.issueBook("B101", "M2"));

        System.out.println("--- Available books ---");
        lib.availableBooks().forEach(System.out::println);

        System.out.println("--- Programming books ---");
        lib.byCategory("Programming").forEach(System.out::println);

        System.out.println("Count by category: " + lib.countByCategory());
        System.out.println(lib.returnBook("B101"));
        System.out.println("Available now: " + lib.availableBooks().size());
        System.out.println("TODO: add fine calculation, search, menu and CSV files");
    }
}
`,
        'Book.java': `public class Book {
    private final String id;
    private String title;
    private String author;
    private String category;
    private boolean available = true;

    public Book(String id, String title, String author, String category) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.category = category;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getCategory() { return category; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    @Override
    public String toString() {
        return id + " - " + title + " by " + author + " [" + category + "]";
    }
}
`,
        'Member.java': `public class Member {
    private final String id;
    private final String name;

    public Member(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() { return id; }
    public String getName() { return name; }
}
`,
        'LibraryService.java': `import java.util.*;
import java.util.stream.Collectors;

public class LibraryService {
    private final List<Book> books = new ArrayList<>();
    private final Map<String, Member> members = new HashMap<>();
    private final Map<String, String> issued = new HashMap<>(); // bookId -> memberId

    public void addBook(Book b) { books.add(b); }
    public void addMember(Member m) { members.put(m.getId(), m); }
    public int totalBooks() { return books.size(); }

    public Optional<Book> findBook(String id) {
        return books.stream().filter(b -> b.getId().equals(id)).findFirst();
    }

    public String issueBook(String bookId, String memberId) {
        Book book = findBook(bookId).orElse(null);
        Member member = members.get(memberId);
        if (book == null || member == null) {
            return "Cannot issue " + bookId + ": book or member not found";
        }
        if (!book.isAvailable()) {
            return "Cannot issue " + bookId + ": already issued";
        }
        book.setAvailable(false);
        issued.put(bookId, memberId);
        return "Issued '" + book.getTitle() + "' to " + member.getName();
    }

    public String returnBook(String bookId) {
        Book book = findBook(bookId).orElse(null);
        if (book == null || book.isAvailable()) {
            return "Cannot return " + bookId + ": not issued";
        }
        book.setAvailable(true);
        issued.remove(bookId);
        return "Returned '" + book.getTitle() + "'";
    }

    public List<Book> availableBooks() {
        return books.stream().filter(Book::isAvailable).collect(Collectors.toList());
    }

    public List<Book> byCategory(String category) {
        return books.stream()
                .filter(b -> b.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
    }

    public Map<String, Long> countByCategory() {
        return books.stream()
                .collect(Collectors.groupingBy(Book::getCategory, TreeMap::new, Collectors.counting()));
    }

    // TODO: search(keyword), max 3 books per member, IssueRecord with dates, fine, overdue list
}
`,
      },
      stdin: '',
      expected: `=== Library Management System ===
Total books: 4
Issued 'Head First Java' to Anjali
Issued 'Wings of Fire' to Rahul
Cannot issue B101: already issued
--- Available books ---
B102 - Clean Code by Robert Martin [Programming]
B104 - The Alchemist by Paulo Coelho [Fiction]
--- Programming books ---
B101 - Head First Java by Kathy Sierra [Programming]
B102 - Clean Code by Robert Martin [Programming]
Count by category: {Biography=1, Fiction=1, Programming=2}
Returned 'Head First Java'
Available now: 3
TODO: add fine calculation, search, menu and CSV files`,
      note:
        'Done: Book/Member models, add, issue, return, available list, category filter and count using Streams. You must add: search, max-3 rule, IssueRecord with LocalDate and fine, overdue report, Scanner menu and CSV save/load.',
    },
    keyCode: [
      {
        title: 'Fine calculation with LocalDate',
        lang: 'java',
        code: `import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class IssueRecord {
    private final String bookId;
    private final String memberId;
    private final LocalDate issueDate;

    public IssueRecord(String bookId, String memberId, LocalDate issueDate) {
        this.bookId = bookId;
        this.memberId = memberId;
        this.issueDate = issueDate;
    }

    public long fine(LocalDate returnDate) {
        long days = ChronoUnit.DAYS.between(issueDate, returnDate);
        long lateDays = days - 14;
        return lateDays > 0 ? lateDays * 5 : 0;
    }
}`,
      },
      {
        title: 'Search and sort using Streams',
        lang: 'java',
        code: `public List<Book> search(String keyword) {
    String k = keyword.toLowerCase();
    return books.stream()
            .filter(b -> b.getTitle().toLowerCase().contains(k)
                      || b.getAuthor().toLowerCase().contains(k))
            .sorted(Comparator.comparing(Book::getTitle))
            .toList();
}`,
      },
      {
        title: 'Saving books to CSV with Files API',
        lang: 'java',
        code: `public void saveBooks(List<Book> books) throws IOException {
    List<String> lines = books.stream()
            .map(b -> String.join(",", b.getId(), b.getTitle(), b.getAuthor(),
                    b.getCategory(), String.valueOf(b.isAvailable())))
            .toList();
    Files.write(Path.of("books.csv"), lines);
}`,
      },
    ],
    rubric: [
      { criterion: 'Functionality', points: 30, desc: 'Book, member, issue, return and fine features work.' },
      { criterion: 'Collections & Streams', points: 20, desc: 'Correct collection choice and clean Stream usage.' },
      { criterion: 'Validation & Errors', points: 15, desc: 'All business rules enforced; app never crashes.' },
      { criterion: 'File Persistence', points: 15, desc: 'Books and members survive app restart.' },
      { criterion: 'Code Quality & README', points: 10, desc: 'Readable code and clear README.' },
      { criterion: 'Viva', points: 10, desc: 'Clear explanation of design and code.' },
    ],
    viva: [
      { q: 'Why did you use a List for books and a Map for members?', a: 'Books are shown and filtered in order, so a List is natural. Members are always looked up by id, so a Map gives O(1) lookup.' },
      { q: 'What is Optional and why does findBook return it?', a: 'Optional is a container that may or may not hold a value. It forces the caller to handle the "not found" case and avoids NullPointerException.' },
      { q: 'Explain filter, map and collect.', a: 'filter keeps elements that match a condition, map converts each element to something else, and collect gathers the result into a List, Map or other collection.' },
      { q: 'How does groupingBy work in countByCategory?', a: 'It groups books by category key. With TreeMap::new the keys are sorted and Collectors.counting() counts books in each group.' },
      { q: 'Difference between ArrayList and LinkedList?', a: 'ArrayList is backed by an array - fast random access. LinkedList is a doubly linked list - fast insert/delete at ends but slow index access.' },
      { q: 'Why override equals() and hashCode() together?', a: 'Hash based collections first use hashCode to find the bucket and then equals to compare. If equal objects have different hash codes, HashSet/HashMap break.' },
      { q: 'How do you calculate the fine?', a: 'ChronoUnit.DAYS.between(issueDate, returnDate) gives days. Days after 14 are late days and each late day costs Rs. 5.' },
      { q: 'What is a method reference like Book::isAvailable?', a: 'A short form of a lambda that only calls an existing method. Book::isAvailable is the same as b -> b.isAvailable().' },
      { q: 'Is a Stream reusable?', a: 'No. A stream can be consumed only once. After a terminal operation you must create a new stream.' },
      { q: 'What happens if books.csv is missing at start?', a: 'The load method checks if the file exists and returns an empty list, so the app starts with no data instead of crashing.' },
      { q: 'Difference between Comparable and Comparator?', a: 'Comparable gives one natural order inside the class (compareTo). Comparator is a separate object, so we can sort in many ways like by title or by author.' },
    ],
    extensions: [
      'Add book reservation queue using Queue<Member>',
      'Add librarian login with password',
      'Show top 3 most issued books using Streams',
      'Store data as JSON using a small hand-written serializer',
    ],
  },

  // ------------------------------------------------------------------
  // 3. Employee Management System (JDBC + MySQL + DAO)
  // ------------------------------------------------------------------
  {
    id: 'employee-jdbc',
    title: 'Employee Management System',
    level: 'Beginner',
    duration: '6 days',
    track: 'JDBC & MySQL',
    stack: ['Java 17', 'JDBC', 'MySQL 8', 'DAO Pattern', 'PreparedStatement', 'Maven'],
    summary:
      'A console app connected to MySQL that lets HR add, view, update, delete and search employees and departments. It proves you can write SQL, use JDBC safely with PreparedStatement, and separate database code using the DAO pattern.',
    features: [
      'Add employee (name, email, department, salary, joining date)',
      'View all employees with department name (JOIN)',
      'Update employee salary and department',
      'Delete employee by id',
      'Search employees by name or department',
      'Give percentage hike to a department in one transaction',
      'Show department-wise count and average salary (GROUP BY)',
      'Read DB url, user and password from db.properties',
    ],
    roles: ['HR Admin: manages employees and departments'],
    architecture:
      'Classic 3-layer console app. Main (UI) talks to EmployeeService (business rules) which talks to EmployeeDao interface. EmployeeDaoImpl uses JDBC and DBConnection reads db.properties.\n\n' +
      '  Main (menu)\n' +
      '     |\n' +
      '  EmployeeService (validation, hike logic)\n' +
      '     |\n' +
      '  EmployeeDao (interface)  <-- EmployeeDaoImpl (JDBC)\n' +
      '     |\n' +
      '  DBConnection --> MySQL (ems_db)',
    folderStructure: `employee-jdbc/
├── pom.xml
└── src/main/
    ├── java/com/ems/
    │   ├── Main.java
    │   ├── model/Employee.java
    │   ├── dao/EmployeeDao.java
    │   ├── dao/EmployeeDaoImpl.java
    │   ├── service/EmployeeService.java
    │   └── util/DBConnection.java
    └── resources/
        └── db.properties`,
    database: `CREATE DATABASE ems_db;
USE ems_db;

CREATE TABLE department (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE employee (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  dept_id INT,
  salary DECIMAL(10,2) NOT NULL CHECK (salary > 0),
  joining_date DATE NOT NULL,
  FOREIGN KEY (dept_id) REFERENCES department(id) ON DELETE SET NULL
);

INSERT INTO department (name) VALUES ('IT'), ('HR'), ('Finance');
INSERT INTO employee (name, email, dept_id, salary, joining_date) VALUES
 ('Amit Verma', 'amit@ems.com', 1, 55000, '2024-07-01'),
 ('Sneha Patil', 'sneha@ems.com', 2, 42000, '2023-11-15');`,
    apis: [],
    milestones: [
      {
        title: 'Milestone 1: Database setup',
        tasks: [
          'Install MySQL and create ems_db',
          'Create department and employee tables with constraints',
          'Insert sample data and test SELECT with JOIN',
        ],
      },
      {
        title: 'Milestone 2: Project & connection',
        tasks: [
          'Create Maven project and add mysql-connector-j dependency',
          'Create db.properties with url, user, password',
          'Write DBConnection.getConnection() and test it from main()',
        ],
      },
      {
        title: 'Milestone 3: Model and DAO',
        tasks: [
          'Create Employee model with getters/setters',
          'Create EmployeeDao interface (save, findById, findAll, update, delete)',
          'Implement EmployeeDaoImpl with PreparedStatement',
          'Map ResultSet rows to Employee objects',
        ],
      },
      {
        title: 'Milestone 4: Service layer',
        tasks: [
          'Create EmployeeService with validation (salary > 0, email format)',
          'Add search by name using LIKE',
          'Add department hike using a transaction (setAutoCommit(false), commit, rollback)',
        ],
      },
      {
        title: 'Milestone 5: Menu & reports',
        tasks: [
          'Build Scanner menu for all features',
          'Add department report with GROUP BY and AVG',
          'Handle SQLException with a friendly message',
        ],
      },
      {
        title: 'Milestone 6: Submission',
        tasks: [
          'Export schema.sql with tables and sample data',
          'Write README: DB setup, how to run, screenshots',
          'Remove hard-coded passwords from code',
        ],
      },
    ],
    starter: {
      files: {
        'Main.java': `public class Main {
    public static void main(String[] args) {
        // In the real project this is EmployeeDaoImpl (JDBC). Here we use an in-memory DAO.
        EmployeeDao dao = new InMemoryEmployeeDao();
        EmployeeService service = new EmployeeService(dao);

        System.out.println("=== Employee Management System (DAO demo) ===");
        System.out.println("Saved: " + service.addEmployee(new Employee("Amit Verma", "IT", 55000)));
        System.out.println("Saved: " + service.addEmployee(new Employee("Sneha Patil", "HR", 42000)));
        System.out.println("Saved: " + service.addEmployee(new Employee("Karan Mehta", "IT", 61000)));

        System.out.println("--- All employees ---");
        for (Employee e : dao.findAll()) {
            System.out.println(e);
        }

        service.giveHike(2, 10);
        System.out.println("After 10% hike: " + dao.findById(2).orElse(null));
        System.out.println("IT department: " + service.byDepartment("IT").size() + " employees");
        System.out.println("Deleted id 1: " + service.deleteEmployee(1));
        System.out.println("Remaining: " + dao.findAll().size());
        System.out.println("Deleted id 99: " + service.deleteEmployee(99));
        System.out.println("TODO: replace InMemoryEmployeeDao with EmployeeDaoImpl using JDBC");
    }
}
`,
        'Employee.java': `public class Employee {
    private int id;
    private String name;
    private String department;
    private double salary;

    public Employee(String name, String department, double salary) {
        this.name = name;
        this.department = department;
        this.salary = salary;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public String getDepartment() { return department; }
    public double getSalary() { return salary; }
    public void setSalary(double salary) { this.salary = salary; }

    @Override
    public String toString() {
        return id + " | " + name + " | " + department + " | " + String.format("%.2f", salary);
    }
}
`,
        'EmployeeDao.java': `import java.util.List;
import java.util.Optional;

public interface EmployeeDao {
    Employee save(Employee e);
    Optional<Employee> findById(int id);
    List<Employee> findAll();
    void update(Employee e);
    boolean delete(int id);
}
`,
        'InMemoryEmployeeDao.java': `import java.util.*;

public class InMemoryEmployeeDao implements EmployeeDao {
    private final Map<Integer, Employee> table = new LinkedHashMap<>();
    private int nextId = 1; // like AUTO_INCREMENT

    @Override
    public Employee save(Employee e) {
        e.setId(nextId++);
        table.put(e.getId(), e);
        return e;
    }

    @Override
    public Optional<Employee> findById(int id) {
        return Optional.ofNullable(table.get(id));
    }

    @Override
    public List<Employee> findAll() {
        return new ArrayList<>(table.values());
    }

    @Override
    public void update(Employee e) {
        table.put(e.getId(), e);
    }

    @Override
    public boolean delete(int id) {
        return table.remove(id) != null;
    }
}
`,
        'EmployeeService.java': `import java.util.List;
import java.util.stream.Collectors;

public class EmployeeService {
    private final EmployeeDao dao;

    public EmployeeService(EmployeeDao dao) {
        this.dao = dao;
    }

    public Employee addEmployee(Employee e) {
        if (e.getSalary() <= 0) {
            throw new IllegalArgumentException("Salary must be positive");
        }
        return dao.save(e);
    }

    public void giveHike(int id, double percent) {
        Employee e = dao.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + id));
        e.setSalary(e.getSalary() + e.getSalary() * percent / 100);
        dao.update(e);
    }

    public List<Employee> byDepartment(String dept) {
        return dao.findAll().stream()
                .filter(e -> e.getDepartment().equalsIgnoreCase(dept))
                .collect(Collectors.toList());
    }

    public boolean deleteEmployee(int id) {
        return dao.delete(id);
    }

    // TODO: searchByName, department report (count + average salary)
}
`,
      },
      stdin: '',
      expected: `=== Employee Management System (DAO demo) ===
Saved: 1 | Amit Verma | IT | 55000.00
Saved: 2 | Sneha Patil | HR | 42000.00
Saved: 3 | Karan Mehta | IT | 61000.00
--- All employees ---
1 | Amit Verma | IT | 55000.00
2 | Sneha Patil | HR | 42000.00
3 | Karan Mehta | IT | 61000.00
After 10% hike: 2 | Sneha Patil | HR | 46200.00
IT department: 2 employees
Deleted id 1: true
Remaining: 2
Deleted id 99: false
TODO: replace InMemoryEmployeeDao with EmployeeDaoImpl using JDBC`,
      note:
        'Done: Employee model, DAO interface, in-memory DAO (acts like a table), service with add/hike/filter/delete. You must add: DBConnection, EmployeeDaoImpl with JDBC + PreparedStatement, search, report with GROUP BY, transaction for department hike and a Scanner menu.',
    },
    keyCode: [
      {
        title: 'DBConnection.java',
        lang: 'java',
        code: `package com.ems.util;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DBConnection {
    private static final Properties props = new Properties();

    static {
        try (InputStream in = DBConnection.class.getClassLoader().getResourceAsStream("db.properties")) {
            props.load(in);
        } catch (Exception e) {
            throw new RuntimeException("Cannot load db.properties", e);
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
                props.getProperty("db.url"),
                props.getProperty("db.user"),
                props.getProperty("db.password"));
    }
}`,
      },
      {
        title: 'EmployeeDaoImpl.java (save + findAll)',
        lang: 'java',
        code: `public class EmployeeDaoImpl implements EmployeeDao {

    @Override
    public Employee save(Employee e) {
        String sql = "INSERT INTO employee(name, email, dept_id, salary, joining_date) VALUES (?, ?, ?, ?, ?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, e.getName());
            ps.setString(2, e.getEmail());
            ps.setInt(3, e.getDeptId());
            ps.setBigDecimal(4, e.getSalary());
            ps.setDate(5, Date.valueOf(e.getJoiningDate()));
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) e.setId(keys.getInt(1));
            }
            return e;
        } catch (SQLException ex) {
            throw new RuntimeException("Could not save employee: " + ex.getMessage(), ex);
        }
    }

    @Override
    public List<Employee> findAll() {
        String sql = "SELECT e.id, e.name, e.email, d.name AS dept, e.salary "
                   + "FROM employee e LEFT JOIN department d ON e.dept_id = d.id";
        List<Employee> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Employee e = new Employee();
                e.setId(rs.getInt("id"));
                e.setName(rs.getString("name"));
                e.setEmail(rs.getString("email"));
                e.setDeptName(rs.getString("dept"));
                e.setSalary(rs.getBigDecimal("salary"));
                list.add(e);
            }
        } catch (SQLException ex) {
            throw new RuntimeException(ex);
        }
        return list;
    }
}`,
      },
      {
        title: 'Department hike in one transaction',
        lang: 'java',
        code: `public void hikeDepartment(int deptId, double percent) throws SQLException {
    String sql = "UPDATE employee SET salary = salary + salary * ? / 100 WHERE dept_id = ?";
    Connection con = DBConnection.getConnection();
    try {
        con.setAutoCommit(false);
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setDouble(1, percent);
            ps.setInt(2, deptId);
            ps.executeUpdate();
        }
        con.commit();
    } catch (SQLException e) {
        con.rollback();
        throw e;
    } finally {
        con.close();
    }
}`,
      },
      {
        title: 'db.properties',
        lang: 'properties',
        code: `db.url=jdbc:mysql://localhost:3306/ems_db
db.user=root
db.password=change_me`,
      },
    ],
    rubric: [
      { criterion: 'Functionality', points: 25, desc: 'CRUD, search, hike and reports work against MySQL.' },
      { criterion: 'Database Design', points: 20, desc: 'Correct tables, keys, constraints and sample data.' },
      { criterion: 'JDBC & DAO', points: 20, desc: 'PreparedStatement, try-with-resources, DAO separation, transactions.' },
      { criterion: 'Error Handling', points: 15, desc: 'SQL errors and bad input handled gracefully.' },
      { criterion: 'Code Quality & README', points: 10, desc: 'Packages, naming, README with setup steps.' },
      { criterion: 'Viva', points: 10, desc: 'Explains JDBC flow and design choices.' },
    ],
    viva: [
      { q: 'What are the steps to connect Java with MySQL using JDBC?', a: 'Add the driver jar, get a Connection with DriverManager.getConnection(url, user, pass), create a PreparedStatement, execute it, read the ResultSet and close resources.' },
      { q: 'Why PreparedStatement instead of Statement?', a: 'PreparedStatement uses ? placeholders, so it prevents SQL injection, handles quotes safely and can be precompiled for better performance.' },
      { q: 'What is the DAO pattern?', a: 'Data Access Object pattern keeps all database code in DAO classes behind an interface. The service layer does not know about SQL, so we can change the DB code without touching business logic.' },
      { q: 'Why did you create an EmployeeDao interface?', a: 'Loose coupling. The service depends on the interface, so we can swap EmployeeDaoImpl (JDBC) with an in-memory or JPA version easily, and test without a database.' },
      { q: 'Difference between executeQuery and executeUpdate?', a: 'executeQuery is for SELECT and returns a ResultSet. executeUpdate is for INSERT, UPDATE, DELETE and returns the number of rows affected.' },
      { q: 'How do you get the auto-generated id after insert?', a: 'Pass Statement.RETURN_GENERATED_KEYS to prepareStatement and read ps.getGeneratedKeys() after executeUpdate.' },
      { q: 'How did you implement a transaction?', a: 'con.setAutoCommit(false), run all statements, con.commit() on success and con.rollback() in the catch block.' },
      { q: 'What is the use of a foreign key here?', a: 'employee.dept_id references department.id, so an employee cannot point to a department that does not exist. It keeps data consistent.' },
      { q: 'Why not hard-code the DB password in code?', a: 'Security and flexibility. Keeping it in db.properties or environment variables lets us change it per environment and keeps it out of source code.' },
      { q: 'What is the difference between INNER JOIN and LEFT JOIN?', a: 'INNER JOIN returns only matching rows. LEFT JOIN returns all rows from the left table, with NULL where the right table has no match - useful for employees without a department.' },
      { q: 'What is connection pooling?', a: 'A pool keeps ready-made DB connections and reuses them instead of opening a new one each time. HikariCP is a popular pool and Spring Boot uses it by default.' },
    ],
    extensions: [
      'Add HikariCP connection pool',
      'Export employee list to CSV',
      'Add pagination using LIMIT and OFFSET',
      'Add login table with hashed passwords (BCrypt)',
      'Write JUnit tests for EmployeeService using the in-memory DAO',
    ],
  },

  // ------------------------------------------------------------------
  // 4. Student Management Web App (Servlet + JSP + JDBC MVC)
  // ------------------------------------------------------------------
  {
    id: 'student-servlet-jsp',
    title: 'Student Management Web App',
    level: 'Intermediate',
    duration: '7 days',
    track: 'Servlet, JSP & JDBC',
    stack: ['Java 17', 'Jakarta Servlet 6', 'JSP + JSTL', 'JDBC', 'MySQL 8', 'Tomcat 10', 'Maven'],
    summary:
      'A web app where an admin logs in and manages students (add, edit, delete, list, search) through JSP pages. It proves you understand the MVC flow on Tomcat: request goes to a Servlet (controller), data comes from a DAO (model) and is shown by JSP (view), with sessions and filters for login security.',
    features: [
      'Admin login with session (HttpSession) and logout',
      'LoginFilter blocks all /students pages if not logged in',
      'List all students in a table using JSTL c:forEach',
      'Add new student with server-side validation',
      'Edit and update student details',
      'Delete student with confirmation',
      'Search students by name or course',
      'Show flash messages like "Student added successfully"',
      'Custom 404 and 500 error pages',
    ],
    roles: ['Admin: logs in and manages student records'],
    architecture:
      'MVC on a servlet container. Browser sends request to StudentServlet (Controller). The servlet calls StudentDao (Model) which uses JDBC. The servlet puts data in request attributes and forwards to a JSP (View).\n\n' +
      '  Browser\n' +
      '     |  HTTP\n' +
      '  LoginFilter  -->  LoginServlet / StudentServlet  (Controller)\n' +
      '                        |                \\\n' +
      '                 StudentDao (JDBC)     JSP + JSTL (View)\n' +
      '                        |\n' +
      '                     MySQL (student_db)',
    folderStructure: `student-web/
├── pom.xml
└── src/main/
    ├── java/com/sms/
    │   ├── model/Student.java
    │   ├── dao/StudentDao.java
    │   ├── util/DBConnection.java
    │   ├── controller/LoginServlet.java
    │   ├── controller/LogoutServlet.java
    │   ├── controller/StudentServlet.java
    │   └── filter/LoginFilter.java
    └── webapp/
        ├── index.jsp            (login page)
        ├── WEB-INF/
        │   ├── web.xml
        │   └── views/
        │       ├── student-list.jsp
        │       ├── student-form.jsp
        │       └── error.jsp
        └── css/style.css`,
    database: `CREATE DATABASE student_db;
USE student_db;

CREATE TABLE admin (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL
);

CREATE TABLE student (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  course VARCHAR(50) NOT NULL,
  cgpa DECIMAL(3,1) CHECK (cgpa BETWEEN 0 AND 10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin (username, password) VALUES ('admin', 'admin123');
INSERT INTO student (name, email, course, cgpa) VALUES
 ('Rohan Das', 'rohan@mail.com', 'BCA', 8.2),
 ('Meera Iyer', 'meera@mail.com', 'BSc IT', 9.1);`,
    apis: [
      { method: 'GET', path: '/login', desc: 'Show login page' },
      { method: 'POST', path: '/login', desc: 'Check username/password, create session, redirect to /students' },
      { method: 'GET', path: '/logout', desc: 'Invalidate session and go to login page' },
      { method: 'GET', path: '/students', desc: 'List all students (optional ?q= search)' },
      { method: 'GET', path: '/students?action=new', desc: 'Show empty add form' },
      { method: 'GET', path: '/students?action=edit&id=5', desc: 'Show form filled with student 5' },
      { method: 'POST', path: '/students?action=save', desc: 'Insert or update a student' },
      { method: 'POST', path: '/students?action=delete&id=5', desc: 'Delete student 5' },
    ],
    milestones: [
      {
        title: 'Milestone 1: Project setup',
        tasks: [
          'Create Maven webapp project (packaging war)',
          'Add jakarta.servlet-api (provided), JSTL and mysql-connector-j',
          'Configure Tomcat 10 in IDE and run a Hello servlet',
          'Create student_db with admin and student tables',
        ],
      },
      {
        title: 'Milestone 2: Model and DAO',
        tasks: [
          'Create Student model',
          'Create DBConnection utility',
          'Write StudentDao: findAll, findById, save, update, delete, search',
        ],
      },
      {
        title: 'Milestone 3: Login and session',
        tasks: [
          'Build index.jsp login form',
          'LoginServlet checks admin table and stores "admin" in HttpSession',
          'LogoutServlet calls session.invalidate()',
          'LoginFilter redirects to login if session has no admin',
        ],
      },
      {
        title: 'Milestone 4: List and search',
        tasks: [
          'StudentServlet doGet: put list in request and forward to student-list.jsp',
          'Use JSTL c:forEach to show a table',
          'Add search box that sends ?q= to the servlet',
        ],
      },
      {
        title: 'Milestone 5: Add, edit, delete',
        tasks: [
          'Build student-form.jsp used for both add and edit',
          'Validate inputs in servlet and show errors on the form',
          'Use Post-Redirect-Get after save and delete',
          'Show success flash messages using session attribute',
        ],
      },
      {
        title: 'Milestone 6: Polish and deploy',
        tasks: [
          'Add CSS for table and forms',
          'Add error pages in web.xml for 404 and 500',
          'Build WAR with mvn package and deploy to Tomcat webapps',
          'Write README with screenshots',
        ],
      },
    ],
    starter: {
      files: {
        'Main.java': `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Student Management (MVC simulation) ===");
        AuthService auth = new AuthService();
        System.out.println("Login admin/wrong: " + auth.login("admin", "wrong"));
        System.out.println("Login admin/admin123: " + auth.login("admin", "admin123"));

        StudentDao dao = new StudentDao();
        dao.save(new Student("Rohan Das", "rohan@mail.com", "BCA", 8.2));
        dao.save(new Student("Meera Iyer", "meera@mail.com", "BSc IT", 9.1));
        dao.save(new Student("Arjun Singh", "arjun@mail.com", "BCA", 7.4));

        System.out.println("--- Student list (what student-list.jsp shows) ---");
        dao.findAll().forEach(System.out::println);

        Student s = dao.findById(3);
        s.setCgpa(7.9);
        dao.update(s);
        System.out.println("Updated: " + dao.findById(3));
        System.out.println("Deleted 1: " + dao.delete(1));
        System.out.println("Total students: " + dao.findAll().size());

        auth.logout();
        System.out.println("Logged in: " + auth.isLoggedIn());
        System.out.println("TODO: add search(), then move this logic into Servlets + JSP");
    }
}
`,
        'Student.java': `public class Student {
    private int id;
    private String name;
    private String email;
    private String course;
    private double cgpa;

    public Student(String name, String email, String course, double cgpa) {
        this.name = name;
        this.email = email;
        this.course = course;
        this.cgpa = cgpa;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getCourse() { return course; }
    public double getCgpa() { return cgpa; }
    public void setCgpa(double cgpa) { this.cgpa = cgpa; }

    @Override
    public String toString() {
        return id + " | " + name + " | " + email + " | " + course + " | CGPA " + cgpa;
    }
}
`,
        'StudentDao.java': `import java.util.*;

// Real project: each method runs SQL with PreparedStatement.
public class StudentDao {
    private final Map<Integer, Student> table = new LinkedHashMap<>();
    private int nextId = 1;

    public void save(Student s) {
        s.setId(nextId++);
        table.put(s.getId(), s);
    }

    public Student findById(int id) {
        return table.get(id);
    }

    public List<Student> findAll() {
        return new ArrayList<>(table.values());
    }

    public void update(Student s) {
        table.put(s.getId(), s);
    }

    public boolean delete(int id) {
        return table.remove(id) != null;
    }

    // TODO: List<Student> search(String keyword) - match name or course
}
`,
        'AuthService.java': `// Simulates LoginServlet + HttpSession
public class AuthService {
    private String loggedInUser; // like session.getAttribute("admin")

    public boolean login(String username, String password) {
        if ("admin".equals(username) && "admin123".equals(password)) {
            loggedInUser = username;
            return true;
        }
        return false;
    }

    public boolean isLoggedIn() {
        return loggedInUser != null;
    }

    public void logout() {
        loggedInUser = null; // like session.invalidate()
    }
}
`,
      },
      stdin: '',
      expected: `=== Student Management (MVC simulation) ===
Login admin/wrong: false
Login admin/admin123: true
--- Student list (what student-list.jsp shows) ---
1 | Rohan Das | rohan@mail.com | BCA | CGPA 8.2
2 | Meera Iyer | meera@mail.com | BSc IT | CGPA 9.1
3 | Arjun Singh | arjun@mail.com | BCA | CGPA 7.4
Updated: 3 | Arjun Singh | arjun@mail.com | BCA | CGPA 7.9
Deleted 1: true
Total students: 2
Logged in: false
TODO: add search(), then move this logic into Servlets + JSP`,
      note:
        'Done: Student model, in-memory StudentDao (CRUD), AuthService that behaves like a session login. You must add: search(), then build the real web app - DBConnection, JDBC StudentDao, LoginServlet, StudentServlet, LoginFilter and JSP pages (see key code).',
    },
    keyCode: [
      {
        title: 'StudentServlet.java (controller)',
        lang: 'java',
        code: `package com.sms.controller;

import com.sms.dao.StudentDao;
import com.sms.model.Student;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/students")
public class StudentServlet extends HttpServlet {
    private final StudentDao dao = new StudentDao();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String action = req.getParameter("action");
        if ("new".equals(action)) {
            req.getRequestDispatcher("/WEB-INF/views/student-form.jsp").forward(req, resp);
            return;
        }
        if ("edit".equals(action)) {
            int id = Integer.parseInt(req.getParameter("id"));
            req.setAttribute("student", dao.findById(id));
            req.getRequestDispatcher("/WEB-INF/views/student-form.jsp").forward(req, resp);
            return;
        }
        String q = req.getParameter("q");
        req.setAttribute("students", q == null || q.isBlank() ? dao.findAll() : dao.search(q));
        req.getRequestDispatcher("/WEB-INF/views/student-list.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String action = req.getParameter("action");
        if ("delete".equals(action)) {
            dao.delete(Integer.parseInt(req.getParameter("id")));
            req.getSession().setAttribute("msg", "Student deleted");
        } else {
            Student s = new Student(req.getParameter("name"), req.getParameter("email"),
                    req.getParameter("course"), Double.parseDouble(req.getParameter("cgpa")));
            String id = req.getParameter("id");
            if (id == null || id.isBlank()) {
                dao.save(s);
            } else {
                s.setId(Integer.parseInt(id));
                dao.update(s);
            }
            req.getSession().setAttribute("msg", "Student saved successfully");
        }
        resp.sendRedirect(req.getContextPath() + "/students"); // Post-Redirect-Get
    }
}`,
      },
      {
        title: 'LoginFilter.java',
        lang: 'java',
        code: `package com.sms.filter;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebFilter("/students/*")
public class LoginFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("admin") == null) {
            resp.sendRedirect(req.getContextPath() + "/login");
            return;
        }
        chain.doFilter(request, response);
    }
}`,
      },
      {
        title: 'student-list.jsp (view with JSTL)',
        lang: 'xml',
        code: `<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<html>
<body>
  <h2>Students</h2>
  <c:if test="\${not empty sessionScope.msg}">
    <p class="success">\${sessionScope.msg}</p>
    <c:remove var="msg" scope="session"/>
  </c:if>
  <form action="students" method="get">
    <input name="q" placeholder="Search by name or course"/>
    <button>Search</button>
  </form>
  <a href="students?action=new">+ Add Student</a>
  <table border="1">
    <tr><th>ID</th><th>Name</th><th>Email</th><th>Course</th><th>CGPA</th><th>Actions</th></tr>
    <c:forEach var="s" items="\${students}">
      <tr>
        <td>\${s.id}</td><td>\${s.name}</td><td>\${s.email}</td>
        <td>\${s.course}</td><td>\${s.cgpa}</td>
        <td>
          <a href="students?action=edit&id=\${s.id}">Edit</a>
          <form action="students?action=delete&id=\${s.id}" method="post" style="display:inline">
            <button onclick="return confirm('Delete?')">Delete</button>
          </form>
        </td>
      </tr>
    </c:forEach>
  </table>
  <a href="logout">Logout</a>
</body>
</html>`,
      },
    ],
    rubric: [
      { criterion: 'Functionality', points: 25, desc: 'Login, CRUD, search and logout all work in the browser.' },
      { criterion: 'MVC Structure', points: 20, desc: 'Servlets as controllers, DAO as model, JSP only for display (no SQL in JSP).' },
      { criterion: 'Session & Security', points: 15, desc: 'Filter protects pages, session invalidated on logout, PreparedStatement used.' },
      { criterion: 'Validation & Errors', points: 15, desc: 'Server-side validation, error pages, no stack traces to user.' },
      { criterion: 'UI & README', points: 15, desc: 'Clean pages, flash messages, README with deploy steps.' },
      { criterion: 'Viva', points: 10, desc: 'Explains request flow and lifecycle.' },
    ],
    viva: [
      { q: 'Explain the flow when the user opens /students.', a: 'Tomcat passes the request through LoginFilter, then calls StudentServlet.doGet(). The servlet gets data from StudentDao, sets it as a request attribute and forwards to student-list.jsp which renders the HTML.' },
      { q: 'What is the servlet life cycle?', a: 'Tomcat loads the class, calls init() once, calls service() (doGet/doPost) for every request, and calls destroy() once when the app stops.' },
      { q: 'Difference between forward and sendRedirect?', a: 'forward happens on the server, same request, URL does not change. sendRedirect tells the browser to make a new request to another URL, so the URL changes.' },
      { q: 'What is the Post-Redirect-Get pattern?', a: 'After a POST (save/delete) we redirect to a GET page. If the user refreshes, the browser repeats the GET and not the POST, so no duplicate insert.' },
      { q: 'How does HttpSession work?', a: 'Tomcat creates a session object on the server and sends a JSESSIONID cookie to the browser. Every next request sends the cookie, so the server finds the same session.' },
      { q: 'Why keep JSP files inside WEB-INF?', a: 'Files inside WEB-INF cannot be opened directly from the browser. Users must go through the servlet, so the controller always prepares data and checks login.' },
      { q: 'What is a Filter?', a: 'A Filter runs before and after servlets for matching URLs. It is used for common work like login checks, logging, and encoding.' },
      { q: 'What is JSTL and why use it instead of scriptlets?', a: 'JSTL is a tag library (c:forEach, c:if) that keeps Java code out of JSP. Pages are cleaner and easier to maintain than using <% %> scriptlets.' },
      { q: 'What is the difference between GET and POST?', a: 'GET sends data in the URL and should only read data. POST sends data in the body and is used to create or change data.' },
      { q: 'How do you prevent SQL injection in this app?', a: 'All queries use PreparedStatement with ? placeholders, so user input is never joined directly into SQL.' },
      { q: 'Why Jakarta packages and Tomcat 10?', a: 'From Jakarta EE 9 the package name changed from javax.servlet to jakarta.servlet. Tomcat 10+ supports jakarta, so we use jakarta.servlet imports.' },
      { q: 'Should passwords be stored in plain text?', a: 'No. In a real app we store a hash using BCrypt and compare hashes during login.' },
    ],
    extensions: [
      'Store admin passwords using BCrypt hash',
      'Add pagination on the student list',
      'Upload student profile photo using Part (multipart)',
      'Export the student list to Excel/CSV',
      'Add a "remember me" cookie',
    ],
  },
  /*__MORE__*/
];
