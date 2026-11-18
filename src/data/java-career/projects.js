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

  // ------------------------------------------------------------------
  // 5. Online Exam / Quiz Portal (Spring MVC + Hibernate)
  // ------------------------------------------------------------------
  {
    id: 'quiz-spring-mvc',
    title: 'Online Exam / Quiz Portal',
    level: 'Intermediate',
    duration: '8 days',
    track: 'Spring MVC & Hibernate',
    stack: ['Java 17', 'Spring MVC 6', 'Hibernate 6 (JPA)', 'Thymeleaf / JSP', 'MySQL 8', 'Tomcat 10', 'Maven'],
    summary:
      'An exam portal where an admin creates tests with multiple-choice questions and students log in, attempt tests with a timer and see their result and leaderboard. It proves you can build a Spring MVC app with controllers, services, Hibernate entities and relationships (one-to-many, many-to-one).',
    features: [
      'Admin and Student login (role stored in users table)',
      'Admin: create, edit, publish and delete tests',
      'Admin: add MCQ questions with 4 options and one correct answer',
      'Student: see list of published tests',
      'Student: attempt a test with a countdown timer (auto submit on time up)',
      'Automatic evaluation, score, percentage and PASS/FAIL',
      'Student: view past results and answer review',
      'Leaderboard per test (top 10 scores)',
      'Prevent a student from attempting the same test twice',
    ],
    roles: [
      'Admin: manages tests and questions, views all results',
      'Student: attempts tests, views own results and leaderboard',
    ],
    architecture:
      'Spring MVC layered design. DispatcherServlet sends requests to @Controller classes. Controllers call @Service classes, which use Hibernate (JPA EntityManager or Spring Data repositories) to talk to MySQL. Views are Thymeleaf templates.\n\n' +
      '  Browser\n' +
      '     |\n' +
      '  DispatcherServlet\n' +
      '     |\n' +
      '  AdminController / ExamController / AuthController\n' +
      '     |\n' +
      '  TestService / ExamService / ResultService  (@Transactional)\n' +
      '     |\n' +
      '  Repositories (Hibernate 6 / JPA)\n' +
      '     |\n' +
      '  MySQL: users, test, question, result, answer',
    folderStructure: `quiz-portal/
├── pom.xml
└── src/main/
    ├── java/com/quiz/
    │   ├── config/WebConfig.java
    │   ├── config/PersistenceConfig.java
    │   ├── entity/User.java
    │   ├── entity/Test.java
    │   ├── entity/Question.java
    │   ├── entity/Result.java
    │   ├── repository/TestRepository.java
    │   ├── repository/ResultRepository.java
    │   ├── service/TestService.java
    │   ├── service/ExamService.java
    │   ├── controller/AuthController.java
    │   ├── controller/AdminController.java
    │   └── controller/ExamController.java
    ├── resources/
    │   └── application.properties
    └── webapp/WEB-INF/templates/
        ├── login.html
        ├── admin/tests.html
        ├── admin/question-form.html
        ├── student/tests.html
        ├── student/attempt.html
        └── student/result.html`,
    database: `CREATE DATABASE quiz_db;
USE quiz_db;

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role ENUM('ADMIN','STUDENT') NOT NULL
);

CREATE TABLE test (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  duration_min INT NOT NULL,
  pass_percent INT NOT NULL DEFAULT 40,
  published BOOLEAN DEFAULT FALSE
);

CREATE TABLE question (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  test_id BIGINT NOT NULL,
  text VARCHAR(500) NOT NULL,
  option_a VARCHAR(200), option_b VARCHAR(200),
  option_c VARCHAR(200), option_d VARCHAR(200),
  correct_option CHAR(1) NOT NULL,
  FOREIGN KEY (test_id) REFERENCES test(id) ON DELETE CASCADE
);

CREATE TABLE result (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  test_id BIGINT NOT NULL,
  score INT NOT NULL,
  total INT NOT NULL,
  attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, test_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (test_id) REFERENCES test(id)
);`,
    apis: [
      { method: 'GET', path: '/login', desc: 'Login page' },
      { method: 'GET', path: '/admin/tests', desc: 'Admin: list all tests' },
      { method: 'POST', path: '/admin/tests', desc: 'Admin: create a test' },
      { method: 'POST', path: '/admin/tests/{id}/questions', desc: 'Admin: add question to a test' },
      { method: 'POST', path: '/admin/tests/{id}/publish', desc: 'Admin: publish a test' },
      { method: 'GET', path: '/student/tests', desc: 'Student: list published tests' },
      { method: 'GET', path: '/student/tests/{id}/attempt', desc: 'Student: show questions with timer' },
      { method: 'POST', path: '/student/tests/{id}/submit', desc: 'Student: submit answers, evaluate and save result' },
      { method: 'GET', path: '/student/results', desc: 'Student: my results' },
      { method: 'GET', path: '/tests/{id}/leaderboard', desc: 'Top 10 scores of a test' },
    ],
    milestones: [
      {
        title: 'Milestone 1: Setup',
        tasks: [
          'Create Maven war project with spring-webmvc, hibernate-core, mysql-connector-j, thymeleaf-spring6',
          'Configure DispatcherServlet using WebApplicationInitializer',
          'Configure DataSource, EntityManagerFactory and TransactionManager',
          'Run a Hello controller on Tomcat 10',
        ],
      },
      {
        title: 'Milestone 2: Entities and relationships',
        tasks: [
          'Create User, Test, Question, Result entities with @Entity',
          'Map Test 1-to-many Question with @OneToMany(mappedBy) and cascade',
          'Map Result many-to-one User and Test',
          'Let Hibernate validate schema (hbm2ddl validate) against your SQL',
        ],
      },
      {
        title: 'Milestone 3: Login and roles',
        tasks: [
          'Build AuthController with login form and session',
          'Write a HandlerInterceptor that blocks /admin/** for non-admin users',
          'Redirect admin and student to different home pages',
        ],
      },
      {
        title: 'Milestone 4: Admin features',
        tasks: [
          'Create and list tests',
          'Add questions using a form backed by a DTO',
          'Publish / unpublish and delete test',
          'Validate input using @Valid and BindingResult',
        ],
      },
      {
        title: 'Milestone 5: Exam attempt',
        tasks: [
          'Show questions of a published test with radio buttons',
          'Add JavaScript countdown timer that auto submits the form',
          'Evaluate answers in ExamService (@Transactional) and save Result',
          'Block second attempt using the unique (user_id, test_id) rule',
        ],
      },
      {
        title: 'Milestone 6: Results and leaderboard',
        tasks: [
          'Show result page with score, percent and answer review',
          'Show my results history',
          'Leaderboard query: ORDER BY score DESC LIMIT 10 using JPQL',
        ],
      },
      {
        title: 'Milestone 7: Polish and submit',
        tasks: [
          'Add Bootstrap styling',
          'Global exception handler using @ControllerAdvice',
          'Write README with DB setup, users to log in and screenshots',
        ],
      },
    ],
    starter: {
      files: {
        'Main.java': `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Online Quiz Portal (service simulation) ===");
        Test t = new Test("Java Basics");
        t.addQuestion(new Question("Which keyword is used to inherit a class?",
                new String[]{"implements", "extends", "super", "this"}, 1));
        t.addQuestion(new Question("Size of int in Java?",
                new String[]{"2 bytes", "4 bytes", "8 bytes", "Depends on OS"}, 1));
        t.addQuestion(new Question("Which collection does not allow duplicates?",
                new String[]{"List", "ArrayList", "Set", "Vector"}, 2));
        t.addQuestion(new Question("Default value of a boolean field?",
                new String[]{"true", "false", "null", "0"}, 1));
        System.out.println("Test: " + t.getTitle() + " (" + t.getQuestions().size() + " questions)");

        QuizService service = new QuizService();
        int[] answers = {1, 1, 0, 1};
        for (int i = 0; i < t.getQuestions().size(); i++) {
            Question q = t.getQuestions().get(i);
            String status = q.isCorrect(answers[i]) ? "correct" : "wrong (answer: " + q.getCorrectOption() + ")";
            System.out.println("Q" + (i + 1) + ": " + status);
        }
        Result r1 = service.evaluate("Pooja", t, answers);
        System.out.println(r1);

        Result r2 = service.evaluate("Vikram", t, new int[]{0, 2, 2, 0});
        System.out.println(r2);

        System.out.println("--- Leaderboard ---");
        int rank = 1;
        for (Result r : service.leaderboard()) {
            System.out.println(rank + ". " + r.getStudentName() + " - " + r.getScore() + "/" + r.getTotal());
            rank++;
        }
        System.out.println("TODO: block second attempt, add timer and admin features");
    }
}
`,
        'Question.java': `public class Question {
    private final String text;
    private final String[] options;
    private final int correctIndex;

    public Question(String text, String[] options, int correctIndex) {
        this.text = text;
        this.options = options;
        this.correctIndex = correctIndex;
    }

    public String getText() { return text; }
    public String[] getOptions() { return options; }

    public boolean isCorrect(int chosenIndex) {
        return chosenIndex == correctIndex;
    }

    public String getCorrectOption() {
        return options[correctIndex];
    }
}
`,
        'Test.java': `import java.util.ArrayList;
import java.util.List;

// In the real project this is a JPA @Entity with @OneToMany questions
public class Test {
    private final String title;
    private final List<Question> questions = new ArrayList<>();

    public Test(String title) {
        this.title = title;
    }

    public void addQuestion(Question q) {
        questions.add(q);
    }

    public String getTitle() { return title; }
    public List<Question> getQuestions() { return questions; }
}
`,
        'Result.java': `public class Result {
    private final String studentName;
    private final int score;
    private final int total;

    public Result(String studentName, int score, int total) {
        this.studentName = studentName;
        this.score = score;
        this.total = total;
    }

    public String getStudentName() { return studentName; }
    public int getScore() { return score; }
    public int getTotal() { return total; }

    public int getPercent() {
        return score * 100 / total;
    }

    public boolean isPassed() {
        return getPercent() >= 40;
    }

    @Override
    public String toString() {
        return studentName + " scored " + score + "/" + total + " (" + getPercent() + "%) - "
                + (isPassed() ? "PASS" : "FAIL");
    }
}
`,
        'QuizService.java': `import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class QuizService {
    private final List<Result> results = new ArrayList<>();

    public Result evaluate(String studentName, Test test, int[] answers) {
        int score = 0;
        List<Question> qs = test.getQuestions();
        for (int i = 0; i < qs.size(); i++) {
            if (i < answers.length && qs.get(i).isCorrect(answers[i])) {
                score++;
            }
        }
        Result r = new Result(studentName, score, qs.size());
        results.add(r);
        return r;
    }

    public List<Result> leaderboard() {
        return results.stream()
                .sorted(Comparator.comparingInt(Result::getScore).reversed())
                .collect(Collectors.toList());
    }

    // TODO: hasAttempted(studentName, test) to block second attempt
}
`,
      },
      stdin: '',
      expected: `=== Online Quiz Portal (service simulation) ===
Test: Java Basics (4 questions)
Q1: correct
Q2: correct
Q3: wrong (answer: Set)
Q4: correct
Pooja scored 3/4 (75%) - PASS
Vikram scored 1/4 (25%) - FAIL
--- Leaderboard ---
1. Pooja - 3/4
2. Vikram - 1/4
TODO: block second attempt, add timer and admin features`,
      note:
        'Done: Test/Question/Result models and QuizService that evaluates answers and builds a leaderboard. You must add: one-attempt rule, then build the Spring MVC app - Hibernate entities, repositories, controllers, Thymeleaf pages and timer (see key code).',
    },
    keyCode: [
      {
        title: 'Test.java and Question.java (Hibernate entities)',
        lang: 'java',
        code: `@Entity
@Table(name = "test")
public class Test {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "duration_min")
    private int durationMin;

    private boolean published;

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();

    public void addQuestion(Question q) {
        questions.add(q);
        q.setTest(this);
    }
    // getters and setters
}

@Entity
@Table(name = "question")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String text;
    private String optionA, optionB, optionC, optionD;

    @Column(name = "correct_option")
    private String correctOption;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id")
    private Test test;
    // getters and setters
}`,
      },
      {
        title: 'ExamController.java',
        lang: 'java',
        code: `@Controller
@RequestMapping("/student/tests")
public class ExamController {
    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping
    public String list(Model model) {
        model.addAttribute("tests", examService.publishedTests());
        return "student/tests";
    }

    @GetMapping("/{id}/attempt")
    public String attempt(@PathVariable Long id, HttpSession session, Model model) {
        Long userId = (Long) session.getAttribute("userId");
        if (examService.hasAttempted(userId, id)) {
            return "redirect:/student/results?already=true";
        }
        model.addAttribute("test", examService.getTestWithQuestions(id));
        return "student/attempt";
    }

    @PostMapping("/{id}/submit")
    public String submit(@PathVariable Long id, @RequestParam Map<String, String> answers,
                         HttpSession session, Model model) {
        Long userId = (Long) session.getAttribute("userId");
        model.addAttribute("result", examService.evaluateAndSave(userId, id, answers));
        return "student/result";
    }
}`,
      },
      {
        title: 'ExamService.evaluateAndSave (@Transactional)',
        lang: 'java',
        code: `@Service
public class ExamService {
    private final TestRepository testRepo;
    private final ResultRepository resultRepo;
    private final UserRepository userRepo;

    public ExamService(TestRepository t, ResultRepository r, UserRepository u) {
        this.testRepo = t; this.resultRepo = r; this.userRepo = u;
    }

    @Transactional
    public Result evaluateAndSave(Long userId, Long testId, Map<String, String> answers) {
        Test test = testRepo.findById(testId).orElseThrow();
        int score = 0;
        for (Question q : test.getQuestions()) {
            String chosen = answers.get("q" + q.getId());
            if (q.getCorrectOption().equals(chosen)) score++;
        }
        Result r = new Result(userRepo.getReferenceById(userId), test, score, test.getQuestions().size());
        return resultRepo.save(r);
    }

    @Transactional(readOnly = true)
    public List<Result> leaderboard(Long testId) {
        return resultRepo.findTop10ByTestIdOrderByScoreDesc(testId);
    }
}`,
      },
      {
        title: 'Countdown timer in attempt.html',
        lang: 'jsx',
        code: `<form id="examForm" method="post" th:action="@{/student/tests/{id}/submit(id=\${test.id})}">
  <div th:each="q : \${test.questions}">
    <p th:text="\${q.text}"></p>
    <label><input type="radio" th:name="'q' + \${q.id}" value="A"/> <span th:text="\${q.optionA}"></span></label>
    <label><input type="radio" th:name="'q' + \${q.id}" value="B"/> <span th:text="\${q.optionB}"></span></label>
  </div>
  <button>Submit</button>
</form>
<p>Time left: <span id="timer"></span></p>
<script th:inline="javascript">
  let seconds = /*[[\${test.durationMin * 60}]]*/ 600;
  const t = setInterval(function () {
    seconds--;
    document.getElementById('timer').innerText = Math.floor(seconds / 60) + ':' + (seconds % 60);
    if (seconds <= 0) { clearInterval(t); document.getElementById('examForm').submit(); }
  }, 1000);
</script>`,
      },
    ],
    rubric: [
      { criterion: 'Functionality', points: 25, desc: 'Admin and student flows work end to end, evaluation is correct.' },
      { criterion: 'Spring MVC Design', points: 20, desc: 'Controllers thin, logic in services, DI via constructors.' },
      { criterion: 'Hibernate Mapping', points: 20, desc: 'Correct entities, relationships, transactions and queries.' },
      { criterion: 'Security & Validation', points: 15, desc: 'Role checks, one attempt rule, @Valid on forms.' },
      { criterion: 'UI & README', points: 10, desc: 'Usable pages, timer works, clear README.' },
      { criterion: 'Viva', points: 10, desc: 'Explains MVC flow and ORM concepts.' },
    ],
    viva: [
      { q: 'What is the role of DispatcherServlet?', a: 'It is the front controller of Spring MVC. Every request comes to it first; it finds the right controller method using handler mappings, calls it and then resolves the view name to a template.' },
      { q: 'Difference between @Controller and @RestController?', a: '@Controller returns view names (HTML pages). @RestController = @Controller + @ResponseBody, so it returns data like JSON directly.' },
      { q: 'What is Hibernate and what is ORM?', a: 'ORM (Object Relational Mapping) maps Java classes to tables and objects to rows. Hibernate is the most popular ORM and also the default JPA implementation.' },
      { q: 'Explain the mapping between Test and Question.', a: 'One Test has many Questions. Test has @OneToMany(mappedBy = "test") and Question has @ManyToOne with @JoinColumn(test_id). The question table owns the foreign key.' },
      { q: 'What does cascade = CascadeType.ALL do?', a: 'Operations on the parent (save, delete) are also applied to the children. Saving a Test saves its Questions; deleting a Test deletes its Questions.' },
      { q: 'What is lazy loading and LazyInitializationException?', a: 'With LAZY fetch, related data loads only when accessed. If you access it after the session/transaction is closed, Hibernate throws LazyInitializationException. Fix with JOIN FETCH or by loading inside the transaction.' },
      { q: 'Why use @Transactional on evaluateAndSave?', a: 'Reading the test and saving the result should be one unit of work. If anything fails, the transaction rolls back, so no half-saved data.' },
      { q: 'How do you stop a student from attempting twice?', a: 'The service checks hasAttempted() before showing the test, and the DB has a UNIQUE (user_id, test_id) constraint as a final safety net.' },
      { q: 'What is the difference between get() and load() / getReferenceById()?', a: 'get/findById hits the DB immediately and returns null/empty if not found. load/getReferenceById returns a proxy and only hits the DB when a field is used; it throws if the row does not exist.' },
      { q: 'What is the N+1 select problem?', a: 'Loading N parents and then firing one extra query for each parent children. It is solved with JOIN FETCH, @EntityGraph or batch fetching.' },
      { q: 'How is the timer made safe if the user changes the JavaScript?', a: 'The server also stores the start time and rejects or marks late submissions after duration + small grace time. Client timer is only for user experience.' },
      { q: 'What is @ControllerAdvice?', a: 'A global class to handle exceptions from all controllers in one place using @ExceptionHandler methods.' },
    ],
    extensions: [
      'Random question order and option shuffling',
      'Negative marking and question-wise marks',
      'Upload questions from a CSV file',
      'Email result to the student',
      'Migrate the project to Spring Boot and compare setup',
    ],
  },

  // ------------------------------------------------------------------
  // 6. E-Commerce REST API (Spring Boot + JPA + JWT + Swagger)
  // ------------------------------------------------------------------
  {
    id: 'ecommerce-rest-api',
    title: 'E-Commerce REST API',
    level: 'Intermediate',
    duration: '10 days',
    track: 'Spring Boot & REST',
    stack: ['Java 17', 'Spring Boot 3', 'Spring Data JPA', 'Spring Security 6', 'JWT', 'MySQL 8', 'Swagger (springdoc-openapi)', 'Lombok', 'JUnit 5'],
    summary:
      'A secure backend for an online shop with products, categories, cart and orders. Users register and log in to get a JWT, customers place orders and admins manage products. It proves you can design REST APIs, use Spring Data JPA, secure endpoints with JWT and document them with Swagger.',
    features: [
      'User registration and login returning a JWT token',
      'Role based access: ADMIN manages products, CUSTOMER shops',
      'Product and Category CRUD with validation (@Valid)',
      'Product search by name, category and price range with pagination and sorting',
      'Add to cart, update quantity, remove from cart',
      'Place order from cart with stock check and stock reduction (@Transactional)',
      'Order history for customer and order status update for admin',
      'Global exception handling with proper HTTP status codes (400, 401, 403, 404)',
      'Swagger UI with JWT Authorize button',
      'DTOs so entities are never exposed directly',
    ],
    roles: [
      'Admin: manage categories, products, see all orders, update status',
      'Customer: browse products, manage cart, place and view own orders',
    ],
    architecture:
      'Spring Boot layered REST architecture. Requests pass the JwtAuthFilter, then reach @RestController classes. Controllers use DTOs and call services. Services hold business rules and call Spring Data JPA repositories.\n\n' +
      '  Client (Postman / React)\n' +
      '     |  Authorization: Bearer <jwt>\n' +
      '  SecurityFilterChain + JwtAuthFilter\n' +
      '     |\n' +
      '  AuthController / ProductController / CartController / OrderController\n' +
      '     |  DTOs\n' +
      '  AuthService / ProductService / CartService / OrderService\n' +
      '     |\n' +
      '  JpaRepository interfaces\n' +
      '     |\n' +
      '  MySQL (ecommerce_db)\n\n' +
      '  GlobalExceptionHandler (@RestControllerAdvice) handles errors for all controllers.',
    folderStructure: `ecommerce-api/
├── pom.xml
└── src/
    ├── main/java/com/shop/
    │   ├── EcommerceApplication.java
    │   ├── config/SecurityConfig.java
    │   ├── config/OpenApiConfig.java
    │   ├── security/JwtService.java
    │   ├── security/JwtAuthFilter.java
    │   ├── entity/ (User, Category, Product, CartItem, Order, OrderItem)
    │   ├── dto/ (ProductRequest, ProductResponse, LoginRequest, AuthResponse, OrderResponse)
    │   ├── repository/ (UserRepository, ProductRepository, OrderRepository ...)
    │   ├── service/ (AuthService, ProductService, CartService, OrderService)
    │   ├── controller/ (AuthController, ProductController, CartController, OrderController)
    │   └── exception/ (ResourceNotFoundException, GlobalExceptionHandler)
    ├── main/resources/application.properties
    └── test/java/com/shop/service/OrderServiceTest.java`,
    database: `CREATE DATABASE ecommerce_db;
USE ecommerce_db;

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL
);

CREATE TABLE category (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE product (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  category_id BIGINT,
  FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE cart_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  UNIQUE (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES product(id)
);

CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES product(id)
);`,
    apis: [
      { method: 'POST', path: '/api/auth/register', desc: 'Register a new customer' },
      { method: 'POST', path: '/api/auth/login', desc: 'Login and get JWT token' },
      { method: 'GET', path: '/api/products?page=0&size=10&sort=price,asc', desc: 'List products (public, paginated)' },
      { method: 'GET', path: '/api/products/{id}', desc: 'Get one product (public)' },
      { method: 'GET', path: '/api/products/search?name=&categoryId=&min=&max=', desc: 'Search products' },
      { method: 'POST', path: '/api/products', desc: 'ADMIN: create product' },
      { method: 'PUT', path: '/api/products/{id}', desc: 'ADMIN: update product' },
      { method: 'DELETE', path: '/api/products/{id}', desc: 'ADMIN: delete product' },
      { method: 'GET', path: '/api/cart', desc: 'CUSTOMER: view my cart' },
      { method: 'POST', path: '/api/cart', desc: 'CUSTOMER: add item {productId, quantity}' },
      { method: 'DELETE', path: '/api/cart/{itemId}', desc: 'CUSTOMER: remove item from cart' },
      { method: 'POST', path: '/api/orders', desc: 'CUSTOMER: place order from cart' },
      { method: 'GET', path: '/api/orders/my', desc: 'CUSTOMER: my orders' },
      { method: 'GET', path: '/api/admin/orders', desc: 'ADMIN: all orders' },
      { method: 'PATCH', path: '/api/admin/orders/{id}/status', desc: 'ADMIN: update order status' },
    ],
    milestones: [
      {
        title: 'Milestone 1: Project setup',
        tasks: [
          'Create project on start.spring.io: Web, Data JPA, Security, Validation, MySQL, Lombok',
          'Add springdoc-openapi-starter-webmvc-ui dependency',
          'Configure application.properties for MySQL',
          'Run the app and open /swagger-ui.html',
        ],
      },
      {
        title: 'Milestone 2: Product catalog',
        tasks: [
          'Create Category and Product entities and repositories',
          'Create ProductRequest/ProductResponse DTOs with validation',
          'Build ProductService and ProductController CRUD',
          'Add pagination and sorting with Pageable',
        ],
      },
      {
        title: 'Milestone 3: Exception handling',
        tasks: [
          'Create ResourceNotFoundException and InsufficientStockException',
          'Create GlobalExceptionHandler with @RestControllerAdvice',
          'Return a standard ErrorResponse (timestamp, status, message, path)',
        ],
      },
      {
        title: 'Milestone 4: Security with JWT',
        tasks: [
          'Create User entity with role and BCrypt password',
          'Write JwtService (generate, validate, extract username) using jjwt',
          'Write JwtAuthFilter (OncePerRequestFilter)',
          'Configure SecurityFilterChain: stateless, public GET products, role rules',
          'Build register and login endpoints',
        ],
      },
      {
        title: 'Milestone 5: Cart and orders',
        tasks: [
          'CartItem entity and CartService (add, update, remove, view)',
          'OrderService.placeOrder: check stock, create Order + OrderItems, reduce stock, clear cart in one @Transactional method',
          'My orders and admin order status update',
        ],
      },
      {
        title: 'Milestone 6: Docs and testing',
        tasks: [
          'Add JWT security scheme in OpenApiConfig so Swagger has Authorize button',
          'Write JUnit 5 + Mockito tests for OrderService',
          'Export a Postman collection',
        ],
      },
      {
        title: 'Milestone 7: Submission',
        tasks: [
          'Move secrets to environment variables',
          'Write README with endpoints table and sample requests',
          'Push to GitHub with a clean commit history',
        ],
      },
    ],
    starter: {
      files: {
        'Main.java': `import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== E-Commerce API (service layer simulation) ===");
        ProductRepository repo = new ProductRepository();
        repo.save(new Product("Laptop", 55000, 5));
        repo.save(new Product("Headphones", 1500, 20));
        repo.save(new Product("Mouse", 499, 2));

        System.out.println("GET /api/products");
        repo.findAll().forEach(p -> System.out.println("  " + p));

        OrderService orders = new OrderService(repo);
        Map<Long, Integer> cart = new LinkedHashMap<>();
        cart.put(1L, 1);
        cart.put(2L, 2);
        System.out.println("POST /api/orders (user: neha)");
        Order o = orders.placeOrder("neha", cart);
        System.out.println("  201 Created: " + o);

        System.out.println("POST /api/orders (user: neha)");
        try {
            Map<Long, Integer> cart2 = new LinkedHashMap<>();
            cart2.put(3L, 5);
            orders.placeOrder("neha", cart2);
        } catch (IllegalStateException e) {
            System.out.println("  400 Bad Request: " + e.getMessage());
        }

        System.out.println("GET /api/products/99");
        try {
            repo.findById(99L);
        } catch (ResourceNotFoundException e) {
            System.out.println("  404 Not Found: " + e.getMessage());
        }

        System.out.println("GET /api/products (after order)");
        repo.findAll().forEach(p -> System.out.println("  " + p));
        System.out.println("TODO: add cart, order history and admin status update");
    }
}
`,
        'Product.java': `public class Product {
    private Long id;
    private final String name;
    private final int price;
    private int stock;

    public Product(String name, int price, int stock) {
        this.name = name;
        this.price = price;
        this.stock = stock;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public int getPrice() { return price; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    @Override
    public String toString() {
        return "{id:" + id + ", name:" + name + ", price:" + price + ", stock:" + stock + "}";
    }
}
`,
        'Order.java': `public class Order {
    private final Long id;
    private final String user;
    private final int total;
    private String status = "PLACED";

    public Order(Long id, String user, int total) {
        this.id = id;
        this.user = user;
        this.total = total;
    }

    public Long getId() { return id; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return "{orderId:" + id + ", user:" + user + ", total:" + total + ", status:" + status + "}";
    }
}
`,
        'ResourceNotFoundException.java': `public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
`,
        'ProductRepository.java': `import java.util.*;

// Simulates: interface ProductRepository extends JpaRepository<Product, Long>
public class ProductRepository {
    private final Map<Long, Product> store = new LinkedHashMap<>();
    private long nextId = 1;

    public Product save(Product p) {
        if (p.getId() == null) {
            p.setId(nextId++);
        }
        store.put(p.getId(), p);
        return p;
    }

    public Product findById(Long id) {
        Product p = store.get(id);
        if (p == null) {
            throw new ResourceNotFoundException("Product not found with id " + id);
        }
        return p;
    }

    public List<Product> findAll() {
        return new ArrayList<>(store.values());
    }
}
`,
        'OrderService.java': `import java.util.*;

public class OrderService {
    private final ProductRepository productRepo;
    private final List<Order> orders = new ArrayList<>();
    private long nextOrderId = 1;

    public OrderService(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    // In Spring this method is @Transactional: all or nothing
    public Order placeOrder(String user, Map<Long, Integer> items) {
        // 1. validate stock for ALL items first
        for (Map.Entry<Long, Integer> e : items.entrySet()) {
            Product p = productRepo.findById(e.getKey());
            if (p.getStock() < e.getValue()) {
                throw new IllegalStateException("Insufficient stock for " + p.getName()
                        + ". Available: " + p.getStock());
            }
        }
        // 2. reduce stock and calculate total
        int total = 0;
        for (Map.Entry<Long, Integer> e : items.entrySet()) {
            Product p = productRepo.findById(e.getKey());
            p.setStock(p.getStock() - e.getValue());
            productRepo.save(p);
            total += p.getPrice() * e.getValue();
        }
        Order order = new Order(nextOrderId++, user, total);
        orders.add(order);
        return order;
    }

    // TODO: List<Order> findByUser(String user), updateStatus(Long orderId, String status)
}
`,
      },
      stdin: '',
      expected: `=== E-Commerce API (service layer simulation) ===
GET /api/products
  {id:1, name:Laptop, price:55000, stock:5}
  {id:2, name:Headphones, price:1500, stock:20}
  {id:3, name:Mouse, price:499, stock:2}
POST /api/orders (user: neha)
  201 Created: {orderId:1, user:neha, total:58000, status:PLACED}
POST /api/orders (user: neha)
  400 Bad Request: Insufficient stock for Mouse. Available: 2
GET /api/products/99
  404 Not Found: Product not found with id 99
GET /api/products (after order)
  {id:1, name:Laptop, price:55000, stock:4}
  {id:2, name:Headphones, price:1500, stock:18}
  {id:3, name:Mouse, price:499, stock:2}
TODO: add cart, order history and admin status update`,
      note:
        'Done: Product/Order models, in-memory repository that throws ResourceNotFoundException, OrderService with all-or-nothing stock check. You must add: cart, order history, status update; then build the real Spring Boot app with JPA entities, DTOs, JWT security and Swagger (see key code).',
    },
    keyCode: [
      {
        title: 'ProductController.java',
        lang: 'java',
        code: `@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products")
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public Page<ProductResponse> list(@PageableDefault(size = 10, sort = "name") Pageable pageable) {
        return productService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        return productService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}`,
      },
      {
        title: 'SecurityConfig.java (Spring Security 6, stateless JWT)',
        lang: 'java',
        code: `@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}`,
      },
      {
        title: 'JwtAuthFilter.java',
        lang: 'java',
        code: `@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }
        String token = header.substring(7);
        String email = jwtService.extractUsername(token);
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails user = userDetailsService.loadUserByUsername(email);
            if (jwtService.isValid(token, user)) {
                var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(request, response);
    }
}`,
      },
      {
        title: 'GlobalExceptionHandler.java',
        lang: 'java',
        code: `@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), req);
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<ErrorResponse> stock(InsufficientStockException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> invalid(MethodArgumentNotValidException ex, HttpServletRequest req) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return build(HttpStatus.BAD_REQUEST, msg, req);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String msg, HttpServletRequest req) {
        return ResponseEntity.status(status)
                .body(new ErrorResponse(LocalDateTime.now(), status.value(), msg, req.getRequestURI()));
    }
}`,
      },
      {
        title: 'application.properties',
        lang: 'properties',
        code: `spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db
spring.datasource.username=root
spring.datasource.password=change_me
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
app.jwt.secret=put-a-long-random-base64-secret-here
app.jwt.expiration-ms=86400000
springdoc.swagger-ui.path=/swagger-ui.html`,
      },
    ],
    rubric: [
      { criterion: 'API Functionality', points: 25, desc: 'All endpoints work with correct status codes.' },
      { criterion: 'Security (JWT & Roles)', points: 20, desc: 'Stateless JWT, BCrypt passwords, role rules enforced.' },
      { criterion: 'JPA & Transactions', points: 15, desc: 'Good entity design, relationships, @Transactional order flow.' },
      { criterion: 'Code Structure & DTOs', points: 15, desc: 'Layered packages, DTOs, validation, global exception handler.' },
      { criterion: 'Docs & Tests', points: 15, desc: 'Swagger with Authorize, Postman collection, unit tests.' },
      { criterion: 'Viva', points: 10, desc: 'Explains REST, JWT and Spring Boot internals.' },
    ],
    viva: [
      { q: 'What is REST and what makes an API RESTful?', a: 'REST is an architecture style using resources identified by URLs, standard HTTP methods (GET, POST, PUT, DELETE), stateless requests and representations like JSON.' },
      { q: 'Explain the JWT login flow in your project.', a: 'User sends email/password to /api/auth/login. AuthenticationManager verifies with BCrypt. JwtService creates a signed token with email and role. The client sends it as Authorization: Bearer <token>, and JwtAuthFilter validates it on every request.' },
      { q: 'What are the three parts of a JWT?', a: 'Header (algorithm), Payload (claims like sub, role, exp) and Signature. They are Base64URL encoded and joined with dots.' },
      { q: 'Why is CSRF disabled in this API?', a: 'CSRF attacks use browser cookies. Our API is stateless and uses a token in the Authorization header, not cookies, so CSRF protection is not needed.' },
      { q: 'Why use DTOs instead of returning entities?', a: 'DTOs hide internal fields like password, avoid lazy loading and infinite recursion issues in JSON, and let the API change independently of the DB.' },
      { q: 'How does placeOrder stay consistent?', a: 'It is @Transactional. Stock check, order insert, stock reduction and cart clearing happen in one transaction; if any step throws, everything rolls back.' },
      { q: 'Difference between PUT and PATCH?', a: 'PUT replaces the whole resource. PATCH updates only some fields, like order status.' },
      { q: 'What does @SpringBootApplication do?', a: 'It combines @Configuration, @EnableAutoConfiguration and @ComponentScan. It sets up beans automatically based on dependencies in the classpath.' },
      { q: 'What is the difference between 401 and 403?', a: '401 Unauthorized means not logged in or invalid token. 403 Forbidden means logged in but does not have permission, e.g. a customer calling an admin API.' },
      { q: 'How does pagination work with Spring Data?', a: 'The controller takes a Pageable (page, size, sort) and the repository method returns a Page with content, totalElements and totalPages. It uses LIMIT/OFFSET in SQL.' },
      { q: 'Why store passwords using BCrypt?', a: 'BCrypt is a slow one-way hash with a salt, so even if the DB leaks, the real passwords are hard to recover.' },
      { q: 'How would you handle two users buying the last item at the same time?', a: 'Use optimistic locking with @Version on Product, or a conditional update (UPDATE product SET stock = stock - ? WHERE id = ? AND stock >= ?) and check rows affected.' },
    ],
    extensions: [
      'Refresh tokens and logout with token blacklist',
      'Product images upload to local disk or S3',
      'Payment gateway sandbox (Razorpay test mode)',
      'Redis caching for product list',
      'Dockerize the API with MySQL using docker-compose',
    ],
  },

  // ------------------------------------------------------------------
  // 7. Hospital Management System (Spring Boot + React + MySQL)
  // ------------------------------------------------------------------
  {
    id: 'hospital-fullstack',
    title: 'Hospital Management System',
    level: 'Advanced',
    duration: '12 days',
    track: 'Full Stack (Spring Boot + React)',
    stack: ['Java 17', 'Spring Boot 3', 'Spring Data JPA', 'Spring Security + JWT', 'MySQL 8', 'React 18', 'React Router', 'Axios', 'Bootstrap / Tailwind'],
    summary:
      'A full stack web app for a small hospital: receptionists register patients, patients book appointments with doctors, doctors see their schedule and add prescriptions, and admins manage doctors. It proves you can build a secure Spring Boot API and a React frontend that talk to each other, with real business rules like slot conflicts.',
    features: [
      'JWT login for ADMIN, DOCTOR and PATIENT roles with role-based React routes',
      'Admin: add, edit, delete doctors with specialization and fee',
      'Patient registration and profile',
      'Book appointment: choose doctor, date and time slot',
      'Prevent double booking of the same doctor slot',
      'Cancel appointment (patient) and complete appointment (doctor)',
      'Doctor dashboard: today\'s appointments',
      'Doctor adds prescription / notes to a completed appointment',
      'Admin dashboard with counts (doctors, patients, today\'s appointments)',
      'Search doctors by specialization',
    ],
    roles: [
      'Admin: manages doctors and sees dashboard stats',
      'Doctor: views schedule, completes appointments, writes prescriptions',
      'Patient: registers, books and cancels appointments, sees prescriptions',
    ],
    architecture:
      'Two separate apps. React (Vite) frontend calls the Spring Boot REST API using Axios with the JWT in the Authorization header. Spring Boot follows Controller -> Service -> Repository and stores data in MySQL. CORS is enabled for the React dev URL.\n\n' +
      '  React SPA (localhost:5173)\n' +
      '    pages: Login, AdminDashboard, Doctors, BookAppointment, MyAppointments, DoctorSchedule\n' +
      '    api/axios.js (adds Bearer token)\n' +
      '        |  JSON over HTTP\n' +
      '  Spring Boot API (localhost:8080)\n' +
      '    controller -> service -> repository\n' +
      '    security: JwtAuthFilter + roles\n' +
      '        |\n' +
      '  MySQL (hospital_db): users, doctor, patient, appointment, prescription',
    folderStructure: `hospital-management/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/hms/
│       ├── HospitalApplication.java
│       ├── config/ (SecurityConfig, CorsConfig)
│       ├── security/ (JwtService, JwtAuthFilter)
│       ├── entity/ (User, Doctor, Patient, Appointment, Prescription)
│       ├── dto/ (AppointmentRequest, AppointmentResponse, DoctorDto ...)
│       ├── repository/
│       ├── service/ (DoctorService, PatientService, AppointmentService)
│       ├── controller/ (AuthController, DoctorController, AppointmentController, DashboardController)
│       └── exception/
└── frontend/
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/ (Navbar, ProtectedRoute)
        └── pages/ (Login, AdminDashboard, Doctors, BookAppointment, MyAppointments, DoctorSchedule)`,
    database: `CREATE DATABASE hospital_db;
USE hospital_db;

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL
);

CREATE TABLE doctor (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNIQUE,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  fee DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE patient (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNIQUE,
  name VARCHAR(100) NOT NULL,
  age INT,
  gender VARCHAR(10),
  phone VARCHAR(15) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE appointment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  doctor_id BIGINT NOT NULL,
  patient_id BIGINT NOT NULL,
  appt_date DATE NOT NULL,
  slot TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'BOOKED',
  reason VARCHAR(255),
  FOREIGN KEY (doctor_id) REFERENCES doctor(id),
  FOREIGN KEY (patient_id) REFERENCES patient(id),
  INDEX idx_doctor_date (doctor_id, appt_date)
);

CREATE TABLE prescription (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  appointment_id BIGINT NOT NULL UNIQUE,
  diagnosis VARCHAR(255),
  medicines TEXT,
  advice TEXT,
  FOREIGN KEY (appointment_id) REFERENCES appointment(id)
);`,
    apis: [
      { method: 'POST', path: '/api/auth/login', desc: 'Login (all roles), returns JWT + role' },
      { method: 'POST', path: '/api/auth/register', desc: 'Patient self registration' },
      { method: 'GET', path: '/api/doctors?specialization=', desc: 'List/search doctors' },
      { method: 'POST', path: '/api/doctors', desc: 'ADMIN: add doctor' },
      { method: 'PUT', path: '/api/doctors/{id}', desc: 'ADMIN: update doctor' },
      { method: 'DELETE', path: '/api/doctors/{id}', desc: 'ADMIN: delete doctor' },
      { method: 'GET', path: '/api/doctors/{id}/slots?date=2026-12-01', desc: 'Free slots of a doctor on a date' },
      { method: 'POST', path: '/api/appointments', desc: 'PATIENT: book appointment {doctorId, date, slot, reason}' },
      { method: 'GET', path: '/api/appointments/my', desc: 'PATIENT: my appointments' },
      { method: 'PATCH', path: '/api/appointments/{id}/cancel', desc: 'PATIENT: cancel appointment' },
      { method: 'GET', path: '/api/appointments/doctor/today', desc: 'DOCTOR: today\'s schedule' },
      { method: 'PATCH', path: '/api/appointments/{id}/complete', desc: 'DOCTOR: mark completed' },
      { method: 'POST', path: '/api/appointments/{id}/prescription', desc: 'DOCTOR: add prescription' },
      { method: 'GET', path: '/api/dashboard/stats', desc: 'ADMIN: counts for dashboard' },
    ],
    milestones: [
      {
        title: 'Milestone 1: Backend setup & entities',
        tasks: [
          'Create Spring Boot project (Web, JPA, Security, Validation, MySQL, Lombok)',
          'Create entities: User, Doctor, Patient, Appointment, Prescription',
          'Create repositories and seed an admin user with CommandLineRunner',
        ],
      },
      {
        title: 'Milestone 2: Security',
        tasks: [
          'Add JWT login reusing your E-Commerce JwtService/JwtAuthFilter',
          'Return role in login response',
          'Protect endpoints with hasRole rules',
          'Configure CORS for http://localhost:5173',
        ],
      },
      {
        title: 'Milestone 3: Doctor & patient APIs',
        tasks: [
          'Doctor CRUD (admin) and search by specialization',
          'Patient registration and profile',
          'Test all APIs in Postman',
        ],
      },
      {
        title: 'Milestone 4: Appointment business rules',
        tasks: [
          'Book API with slot conflict check (ignore cancelled)',
          'Do not allow booking in the past',
          'Cancel and complete endpoints with status checks',
          'Free slots API (9:00 to 17:00, 30 minute slots, minus booked)',
        ],
      },
      {
        title: 'Milestone 5: React setup & auth',
        tasks: [
          'Create React app with Vite, install react-router-dom and axios',
          'Create axios instance with interceptor that adds the token',
          'AuthContext storing token and role in localStorage',
          'ProtectedRoute component that checks role',
        ],
      },
      {
        title: 'Milestone 6: React pages',
        tasks: [
          'Doctors page with search and admin add/edit form',
          'BookAppointment page: pick doctor, date, then free slot',
          'MyAppointments page with cancel button',
          'DoctorSchedule page with complete + prescription form',
          'AdminDashboard with stat cards',
        ],
      },
      {
        title: 'Milestone 7: Polish, test & submit',
        tasks: [
          'Loading and error messages on every page',
          'Unit tests for AppointmentService conflict logic',
          'README with run steps for backend and frontend, plus screenshots',
          'Record a 3 minute demo video',
        ],
      },
    ],
    starter: {
      files: {
        'Main.java': `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Hospital Management (service simulation) ===");
        HospitalService h = new HospitalService();
        Doctor d1 = h.addDoctor("Dr. Suresh Rao", "Cardiology");
        Doctor d2 = h.addDoctor("Dr. Kavya Nair", "Dermatology");
        Patient p1 = h.addPatient("Manoj Gupta", 45, "9876543210");
        Patient p2 = h.addPatient("Sita Devi", 32, "9123456780");
        System.out.println("Doctors: " + h.getDoctors().size() + ", Patients: " + h.getPatients().size());

        System.out.println(h.book(p1.getId(), d1.getId(), "2026-12-01", "10:00"));
        System.out.println(h.book(p2.getId(), d1.getId(), "2026-12-01", "10:00"));
        System.out.println(h.book(p2.getId(), d1.getId(), "2026-12-01", "10:30"));
        System.out.println(h.book(p2.getId(), d2.getId(), "2026-12-02", "11:00"));

        System.out.println("Cancelled appointment 2: " + h.cancel(2));
        System.out.println("--- Appointments of " + d1.getName() + " ---");
        h.appointmentsOfDoctor(d1.getId()).forEach(System.out::println);
        System.out.println("Active appointments: " + h.activeCount());
        System.out.println("TODO: complete appointment, prescriptions, free slots API");
    }
}
`,
        'Doctor.java': `public class Doctor {
    private final long id;
    private final String name;
    private final String specialization;

    public Doctor(long id, String name, String specialization) {
        this.id = id;
        this.name = name;
        this.specialization = specialization;
    }

    public long getId() { return id; }
    public String getName() { return name; }
    public String getSpecialization() { return specialization; }
}
`,
        'Patient.java': `public class Patient {
    private final long id;
    private final String name;
    private final int age;
    private final String phone;

    public Patient(long id, String name, int age, String phone) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.phone = phone;
    }

    public long getId() { return id; }
    public String getName() { return name; }
    public int getAge() { return age; }
    public String getPhone() { return phone; }
}
`,
        'Appointment.java': `public class Appointment {
    private final long id;
    private final Patient patient;
    private final Doctor doctor;
    private final String date;
    private final String slot;
    private String status = "BOOKED";

    public Appointment(long id, Patient patient, Doctor doctor, String date, String slot) {
        this.id = id;
        this.patient = patient;
        this.doctor = doctor;
        this.date = date;
        this.slot = slot;
    }

    public long getId() { return id; }
    public Patient getPatient() { return patient; }
    public Doctor getDoctor() { return doctor; }
    public String getDate() { return date; }
    public String getSlot() { return slot; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return "#" + id + " " + patient.getName() + " | " + date + " " + slot + " | " + status;
    }
}
`,
        'HospitalService.java': `import java.util.*;
import java.util.stream.Collectors;

public class HospitalService {
    private final Map<Long, Doctor> doctors = new LinkedHashMap<>();
    private final Map<Long, Patient> patients = new LinkedHashMap<>();
    private final List<Appointment> appointments = new ArrayList<>();
    private long doctorSeq = 1, patientSeq = 1, apptSeq = 1;

    public Doctor addDoctor(String name, String specialization) {
        Doctor d = new Doctor(doctorSeq++, name, specialization);
        doctors.put(d.getId(), d);
        return d;
    }

    public Patient addPatient(String name, int age, String phone) {
        Patient p = new Patient(patientSeq++, name, age, phone);
        patients.put(p.getId(), p);
        return p;
    }

    public Collection<Doctor> getDoctors() { return doctors.values(); }
    public Collection<Patient> getPatients() { return patients.values(); }

    public String book(long patientId, long doctorId, String date, String slot) {
        Patient p = patients.get(patientId);
        Doctor d = doctors.get(doctorId);
        if (p == null || d == null) {
            return "Rejected: patient or doctor not found";
        }
        boolean busy = appointments.stream().anyMatch(a ->
                a.getDoctor().getId() == doctorId
                        && a.getDate().equals(date)
                        && a.getSlot().equals(slot)
                        && !a.getStatus().equals("CANCELLED"));
        if (busy) {
            return "Rejected: " + d.getName() + " is not free on " + date + " at " + slot;
        }
        Appointment a = new Appointment(apptSeq++, p, d, date, slot);
        appointments.add(a);
        return "Booked: Appointment#" + a.getId() + " " + p.getName() + " with " + d.getName()
                + " on " + date + " at " + slot;
    }

    public boolean cancel(long appointmentId) {
        for (Appointment a : appointments) {
            if (a.getId() == appointmentId && a.getStatus().equals("BOOKED")) {
                a.setStatus("CANCELLED");
                return true;
            }
        }
        return false;
    }

    public List<Appointment> appointmentsOfDoctor(long doctorId) {
        return appointments.stream()
                .filter(a -> a.getDoctor().getId() == doctorId)
                .collect(Collectors.toList());
    }

    public long activeCount() {
        return appointments.stream().filter(a -> a.getStatus().equals("BOOKED")).count();
    }

    // TODO: complete(appointmentId), addPrescription(...), freeSlots(doctorId, date)
}
`,
      },
      stdin: '',
      expected: `=== Hospital Management (service simulation) ===
Doctors: 2, Patients: 2
Booked: Appointment#1 Manoj Gupta with Dr. Suresh Rao on 2026-12-01 at 10:00
Rejected: Dr. Suresh Rao is not free on 2026-12-01 at 10:00
Booked: Appointment#2 Sita Devi with Dr. Suresh Rao on 2026-12-01 at 10:30
Booked: Appointment#3 Sita Devi with Dr. Kavya Nair on 2026-12-02 at 11:00
Cancelled appointment 2: true
--- Appointments of Dr. Suresh Rao ---
#1 Manoj Gupta | 2026-12-01 10:00 | BOOKED
#2 Sita Devi | 2026-12-01 10:30 | CANCELLED
Active appointments: 2
TODO: complete appointment, prescriptions, free slots API`,
      note:
        'Done: Doctor/Patient/Appointment models and HospitalService with booking, slot-conflict check, cancel and doctor schedule. You must add: complete, prescription, free slots; then build the Spring Boot API (JPA + JWT) and the React frontend (see key code).',
    },
    keyCode: [
      {
        title: 'AppointmentService.book (Spring Boot)',
        lang: 'java',
        code: `@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository apptRepo;
    private final DoctorRepository doctorRepo;
    private final PatientRepository patientRepo;

    @Transactional
    public AppointmentResponse book(String patientEmail, AppointmentRequest req) {
        if (req.date().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot book an appointment in the past");
        }
        Doctor doctor = doctorRepo.findById(req.doctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        Patient patient = patientRepo.findByUserEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        boolean busy = apptRepo.existsByDoctorIdAndApptDateAndSlotAndStatusNot(
                doctor.getId(), req.date(), req.slot(), AppointmentStatus.CANCELLED);
        if (busy) {
            throw new ConflictException("Slot already booked for " + doctor.getName());
        }

        Appointment a = new Appointment();
        a.setDoctor(doctor);
        a.setPatient(patient);
        a.setApptDate(req.date());
        a.setSlot(req.slot());
        a.setReason(req.reason());
        a.setStatus(AppointmentStatus.BOOKED);
        return AppointmentResponse.from(apptRepo.save(a));
    }
}`,
      },
      {
        title: 'CorsConfig.java',
        lang: 'java',
        code: `@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
// In SecurityConfig: http.cors(Customizer.withDefaults())`,
      },
      {
        title: 'api/axios.js (React)',
        lang: 'jsx',
        code: `import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;`,
      },
      {
        title: 'BookAppointment.jsx (React page)',
        lang: 'jsx',
        code: `import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/doctors').then((res) => setDoctors(res.data));
  }, []);

  useEffect(() => {
    if (doctorId && date) {
      api.get('/doctors/' + doctorId + '/slots', { params: { date } })
        .then((res) => setSlots(res.data));
    }
  }, [doctorId, date]);

  const book = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments', { doctorId, date, slot, reason: 'Checkup' });
      setMsg('Appointment booked!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <form onSubmit={book} className="card">
      <h2>Book Appointment</h2>
      <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
        <option value="">Select doctor</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>
        ))}
      </select>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      <div className="slots">
        {slots.map((s) => (
          <button type="button" key={s} className={s === slot ? 'active' : ''} onClick={() => setSlot(s)}>{s}</button>
        ))}
      </div>
      <button disabled={!slot}>Book</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}`,
      },
      {
        title: 'ProtectedRoute.jsx',
        lang: 'jsx',
        code: `import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ role, children }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" replace />;
  if (role && role !== userRole) return <Navigate to="/unauthorized" replace />;
  return children;
}

// Usage in App.jsx:
// <Route path="/doctor/schedule" element={<ProtectedRoute role="DOCTOR"><DoctorSchedule /></ProtectedRoute>} />`,
      },
    ],
    rubric: [
      { criterion: 'Backend Functionality', points: 20, desc: 'All APIs work with business rules (conflicts, statuses).' },
      { criterion: 'Frontend Functionality', points: 20, desc: 'React pages for all roles work and handle errors.' },
      { criterion: 'Security', points: 15, desc: 'JWT, role-based APIs and protected React routes, CORS set correctly.' },
      { criterion: 'Database & JPA', points: 15, desc: 'Good schema, relationships, indexes, transactions.' },
      { criterion: 'Code Quality, Tests & README', points: 20, desc: 'Clean layers, DTOs, unit tests, README, demo video.' },
      { criterion: 'Viva', points: 10, desc: 'Explains full request flow from React to MySQL.' },
    ],
    viva: [
      { q: 'Explain what happens when a patient clicks "Book".', a: 'React calls api.post("/appointments") with the JWT. JwtAuthFilter validates the token, AppointmentController receives the DTO, AppointmentService checks past date and slot conflict, saves the entity using JPA and returns a response DTO. React shows the success message.' },
      { q: 'What is CORS and why did you need it?', a: 'Browsers block calls from one origin (localhost:5173) to another (localhost:8080) unless the server allows it. We configured CORS in Spring to allow the React origin.' },
      { q: 'How do you prevent double booking?', a: 'Before saving, the service checks if an appointment exists for the same doctor, date and slot that is not cancelled. For full safety under concurrency, a unique index or locking can be added.' },
      { q: 'Where do you store the JWT in React and what is the risk?', a: 'In localStorage for simplicity. The risk is XSS can read it. A safer option is an HttpOnly cookie.' },
      { q: 'What are useState and useEffect?', a: 'useState stores component data that causes re-render when changed. useEffect runs side effects like API calls after render, depending on the dependency array.' },
      { q: 'How does role-based access work on both sides?', a: 'Backend: hasRole rules and @PreAuthorize - this is the real security. Frontend: ProtectedRoute hides pages for other roles - this is only for user experience.' },
      { q: 'Why did you use an enum for appointment status?', a: 'An enum (BOOKED, COMPLETED, CANCELLED) prevents invalid values and makes status checks type safe. With @Enumerated(EnumType.STRING) it is stored as text in MySQL.' },
      { q: 'What is the relationship between Appointment and Doctor?', a: 'Many appointments belong to one doctor, so Appointment has @ManyToOne Doctor with a doctor_id foreign key.' },
      { q: 'Why is there an index on (doctor_id, appt_date)?', a: 'Most queries search appointments of a doctor on a date (schedule, conflict check, free slots). The composite index makes those queries fast.' },
      { q: 'What is an Axios interceptor?', a: 'A function that runs before every request or after every response. We use it to add the Bearer token and to redirect to login on 401.' },
      { q: 'How would you deploy this project?', a: 'Build the React app (npm run build) and host on Netlify/Vercel or serve from Nginx; package Spring Boot as a jar and run on a VM or container with a managed MySQL; set environment variables for secrets and the allowed CORS origin.' },
      { q: 'What does @Transactional do on the book method?', a: 'The check and the insert run in one database transaction, so if saving fails nothing partial is stored.' },
    ],
    extensions: [
      'Email/SMS reminder one day before the appointment (scheduled job)',
      'Download prescription as PDF',
      'Online fee payment in test mode',
      'Doctor availability calendar with leave days',
      'Dockerize backend, frontend and MySQL with docker-compose',
    ],
  },

  // ------------------------------------------------------------------
  // 8. Food Delivery Microservices (Spring Cloud + Kafka + Docker)
  // ------------------------------------------------------------------
  {
    id: 'food-delivery-microservices',
    title: 'Food Delivery Microservices',
    level: 'Advanced',
    duration: '15 days',
    track: 'Microservices & DevOps',
    stack: ['Java 17', 'Spring Boot 3', 'Spring Cloud Gateway', 'Eureka', 'OpenFeign', 'Resilience4j', 'Apache Kafka', 'MySQL 8', 'Docker Compose'],
    summary:
      'A Swiggy/Zomato-style backend split into small services: user, restaurant, order, payment and delivery. Services find each other with Eureka, clients enter through an API Gateway, services call each other with OpenFeign, and order status flows through Kafka events. It proves you understand microservice design, service discovery, async messaging and containerization.',
    features: [
      'API Gateway as single entry point with route config and JWT check',
      'Eureka service registry - all services register and discover each other',
      'Restaurant service: restaurants and menu items',
      'Order service: place order, calls Restaurant service with OpenFeign to get prices',
      'Order service publishes order-placed event to Kafka',
      'Payment service consumes order-placed, publishes payment-completed or payment-failed',
      'Delivery service consumes payment-completed, assigns a rider, publishes delivery-assigned',
      'Order service listens to events and updates order status (Saga choreography)',
      'Circuit breaker with Resilience4j fallback when Restaurant service is down',
      'Each service has its own MySQL database; everything runs with docker compose up',
    ],
    roles: [
      'Customer: browses restaurants, places orders, tracks status',
      'Restaurant Owner: manages menu',
      'Rider (simulated): gets assigned deliveries',
    ],
    architecture:
      'Microservices with database-per-service. Synchronous calls use OpenFeign through Eureka; long running flow (payment, delivery) is asynchronous using Kafka topics. The gateway routes /api/** to services by name (lb://SERVICE-NAME).\n\n' +
      '                 Client\n' +
      '                   |\n' +
      '            API Gateway :8080 ----- Eureka Server :8761\n' +
      '        /        |          \\\n' +
      '  user-svc  restaurant-svc  order-svc ---Feign---> restaurant-svc\n' +
      '                               |\n' +
      '                     Kafka: order-placed\n' +
      '                               |\n' +
      '                         payment-svc\n' +
      '              Kafka: payment-completed / payment-failed\n' +
      '                               |\n' +
      '                         delivery-svc\n' +
      '                  Kafka: delivery-assigned --> order-svc (status update)\n\n' +
      '  Each service -> its own MySQL schema. All containers in docker-compose.yml.',
    folderStructure: `food-delivery/
├── docker-compose.yml
├── eureka-server/
├── api-gateway/
│   └── src/main/resources/application.yml
├── user-service/
├── restaurant-service/
│   └── src/main/java/com/food/restaurant/ (entity, repository, service, controller)
├── order-service/
│   └── src/main/java/com/food/order/
│       ├── client/RestaurantClient.java      (OpenFeign)
│       ├── event/OrderPlacedEvent.java
│       ├── kafka/OrderEventPublisher.java
│       ├── kafka/OrderStatusListener.java
│       ├── service/OrderService.java
│       └── controller/OrderController.java
├── payment-service/
│   └── src/main/java/com/food/payment/PaymentListener.java
└── delivery-service/
    └── src/main/java/com/food/delivery/DeliveryListener.java`,
    database: `-- restaurant_db (restaurant-service)
CREATE TABLE restaurant (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50) NOT NULL,
  is_open BOOLEAN DEFAULT TRUE
);
CREATE TABLE menu_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurant(id)
);

-- order_db (order-service)
CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  restaurant_id BIGINT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(30) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE order_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  menu_item_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- payment_db (payment-service)
CREATE TABLE payment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  paid_at DATETIME
);

-- delivery_db (delivery-service)
CREATE TABLE delivery (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL UNIQUE,
  rider_name VARCHAR(100),
  status VARCHAR(20) NOT NULL
);`,
    apis: [
      { method: 'POST', path: '/api/users/register', desc: 'user-service: register customer' },
      { method: 'POST', path: '/api/users/login', desc: 'user-service: login, returns JWT' },
      { method: 'GET', path: '/api/restaurants?city=Pune', desc: 'restaurant-service: list restaurants' },
      { method: 'GET', path: '/api/restaurants/{id}/menu', desc: 'restaurant-service: menu of a restaurant' },
      { method: 'GET', path: '/api/restaurants/menu-items/{id}', desc: 'restaurant-service: one menu item (used by Feign)' },
      { method: 'POST', path: '/api/orders', desc: 'order-service: place order, publishes order-placed' },
      { method: 'GET', path: '/api/orders/{id}', desc: 'order-service: track order status' },
      { method: 'GET', path: '/api/payments/order/{orderId}', desc: 'payment-service: payment status' },
      { method: 'GET', path: '/api/deliveries/order/{orderId}', desc: 'delivery-service: rider and delivery status' },
    ],
    milestones: [
      {
        title: 'Milestone 1: Design',
        tasks: [
          'Draw the service diagram and list each service\'s database and APIs',
          'Define Kafka topics and event JSON (order-placed, payment-completed, payment-failed, delivery-assigned)',
          'Define order status flow: CREATED -> PAID -> OUT_FOR_DELIVERY or CANCELLED',
        ],
      },
      {
        title: 'Milestone 2: Eureka & Gateway',
        tasks: [
          'Create eureka-server with @EnableEurekaServer',
          'Create api-gateway with routes lb://RESTAURANT-SERVICE etc.',
          'Register a sample service and see it on the Eureka dashboard (:8761)',
        ],
      },
      {
        title: 'Milestone 3: Restaurant & User services',
        tasks: [
          'Restaurant service with restaurant and menu_item CRUD',
          'User service with register/login and JWT',
          'Validate JWT at the gateway using a GlobalFilter',
        ],
      },
      {
        title: 'Milestone 4: Order service with Feign',
        tasks: [
          'Create RestaurantClient Feign interface to fetch menu item prices',
          'Place order: calculate total, save with status CREATED',
          'Add Resilience4j circuit breaker with a fallback',
        ],
      },
      {
        title: 'Milestone 5: Kafka events',
        tasks: [
          'Run Kafka in Docker and create topics',
          'Order service publishes OrderPlacedEvent with KafkaTemplate',
          'Payment service @KafkaListener on order-placed and publishes result',
          'Delivery service listens to payment-completed and publishes delivery-assigned',
          'Order service listens to payment-failed and delivery-assigned to update status',
        ],
      },
      {
        title: 'Milestone 6: Docker Compose',
        tasks: [
          'Write a Dockerfile for each service (eclipse-temurin:17-jre)',
          'Write docker-compose.yml with mysql, kafka, eureka, gateway and all services',
          'Use service names as hostnames in config (mysql, kafka, eureka-server)',
          'Run the full flow with docker compose up',
        ],
      },
      {
        title: 'Milestone 7: Observability & submission',
        tasks: [
          'Add Spring Boot Actuator health endpoints',
          'Add correlation id (orderId) in all logs',
          'README with architecture diagram, how to run and sample requests',
          'Record a demo showing order status change through events',
        ],
      },
    ],
    starter: {
      files: {
        'Main.java': `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Food Delivery Microservices (event simulation) ===");
        EventBus bus = new EventBus();               // acts like Kafka
        RestaurantService restaurant = new RestaurantService();
        OrderService orderService = new OrderService(bus, restaurant);
        new PaymentService(bus);
        new DeliveryService(bus);

        Order o1 = orderService.placeOrder("user-7", "Paneer Biryani", 2);
        System.out.println("Final status: " + o1.getStatus());
        System.out.println("---");
        Order o2 = orderService.placeOrder("user-9", "Masala Dosa", 12);
        System.out.println("Final status: " + o2.getStatus());
        System.out.println("---");
        System.out.println("Orders in system: " + orderService.count());
        System.out.println("TODO: add Feign fallback when restaurant is down and a refund event");
    }
}
`,
        'Event.java': `public class Event {
    private final long orderId;
    private final int amount;

    public Event(long orderId, int amount) {
        this.orderId = orderId;
        this.amount = amount;
    }

    public long getOrderId() { return orderId; }
    public int getAmount() { return amount; }

    @Override
    public String toString() {
        return "{orderId:" + orderId + ", amount:" + amount + "}";
    }
}
`,
        'EventBus.java': `import java.util.*;
import java.util.function.Consumer;

// Very small in-memory replacement for Kafka topics
public class EventBus {
    private final Map<String, List<Consumer<Event>>> subscribers = new HashMap<>();

    public void subscribe(String topic, Consumer<Event> listener) {
        subscribers.computeIfAbsent(topic, k -> new ArrayList<>()).add(listener);
    }

    public void publish(String topic, Event event) {
        System.out.println("[kafka] " + topic + " <- " + event);
        for (Consumer<Event> listener : subscribers.getOrDefault(topic, List.of())) {
            listener.accept(event);
        }
    }
}
`,
        'Order.java': `public class Order {
    private final long id;
    private final String userId;
    private final int total;
    private String status = "CREATED";

    public Order(long id, String userId, int total) {
        this.id = id;
        this.userId = userId;
        this.total = total;
    }

    public long getId() { return id; }
    public String getUserId() { return userId; }
    public int getTotal() { return total; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
`,
        'RestaurantService.java': `import java.util.HashMap;
import java.util.Map;

// In the real project the order-service calls this using OpenFeign
public class RestaurantService {
    private final Map<String, Integer> menu = new HashMap<>();

    public RestaurantService() {
        menu.put("Paneer Biryani", 220);
        menu.put("Masala Dosa", 90);
    }

    public int priceOf(String item) {
        Integer price = menu.get(item);
        if (price == null) {
            throw new IllegalArgumentException("Menu item not found: " + item);
        }
        return price;
    }
}
`,
        'OrderService.java': `import java.util.LinkedHashMap;
import java.util.Map;

public class OrderService {
    private final EventBus bus;
    private final RestaurantService restaurant;
    private final Map<Long, Order> orders = new LinkedHashMap<>();
    private long nextId = 101;

    public OrderService(EventBus bus, RestaurantService restaurant) {
        this.bus = bus;
        this.restaurant = restaurant;
        bus.subscribe("delivery-assigned", e -> updateStatus(e.getOrderId(), "OUT_FOR_DELIVERY"));
        bus.subscribe("payment-failed", e -> updateStatus(e.getOrderId(), "CANCELLED"));
    }

    public Order placeOrder(String userId, String item, int qty) {
        int total = restaurant.priceOf(item) * qty;
        Order order = new Order(nextId++, userId, total);
        orders.put(order.getId(), order);
        System.out.println("[order-service] Order " + order.getId() + " created: "
                + qty + " x " + item + " = Rs." + total);
        bus.publish("order-placed", new Event(order.getId(), total));
        return order;
    }

    private void updateStatus(long orderId, String status) {
        Order o = orders.get(orderId);
        o.setStatus(status);
        System.out.println("[order-service] Order " + orderId + " status -> " + status);
    }

    public int count() {
        return orders.size();
    }
}
`,
        'PaymentService.java': `public class PaymentService {
    private static final int WALLET_LIMIT = 1000;

    public PaymentService(EventBus bus) {
        bus.subscribe("order-placed", e -> {
            if (e.getAmount() <= WALLET_LIMIT) {
                System.out.println("[payment-service] Payment OK for order " + e.getOrderId());
                bus.publish("payment-completed", e);
            } else {
                System.out.println("[payment-service] Payment FAILED for order " + e.getOrderId()
                        + " (wallet limit Rs." + WALLET_LIMIT + ")");
                bus.publish("payment-failed", e);
            }
        });
    }
}
`,
        'DeliveryService.java': `public class DeliveryService {
    public DeliveryService(EventBus bus) {
        bus.subscribe("payment-completed", e -> {
            System.out.println("[delivery-service] Rider assigned to order " + e.getOrderId());
            bus.publish("delivery-assigned", e);
        });
    }
}
`,
      },
      stdin: '',
      expected: `=== Food Delivery Microservices (event simulation) ===
[order-service] Order 101 created: 2 x Paneer Biryani = Rs.440
[kafka] order-placed <- {orderId:101, amount:440}
[payment-service] Payment OK for order 101
[kafka] payment-completed <- {orderId:101, amount:440}
[delivery-service] Rider assigned to order 101
[kafka] delivery-assigned <- {orderId:101, amount:440}
[order-service] Order 101 status -> OUT_FOR_DELIVERY
Final status: OUT_FOR_DELIVERY
---
[order-service] Order 102 created: 12 x Masala Dosa = Rs.1080
[kafka] order-placed <- {orderId:102, amount:1080}
[payment-service] Payment FAILED for order 102 (wallet limit Rs.1000)
[kafka] payment-failed <- {orderId:102, amount:1080}
[order-service] Order 102 status -> CANCELLED
Final status: CANCELLED
---
Orders in system: 2
TODO: add Feign fallback when restaurant is down and a refund event`,
      note:
        'Done: an in-memory EventBus that behaves like Kafka topics, and Order, Payment and Delivery services that react to events (Saga choreography). You must add: fallback for a missing restaurant, PAID status, refund event; then build real Spring Boot services with Eureka, Gateway, Feign, Kafka and Docker Compose (see key code).',
    },
    keyCode: [
      {
        title: 'api-gateway application.yml',
        lang: 'yaml',
        code: `server:
  port: 8080
spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://USER-SERVICE
          predicates:
            - Path=/api/users/**
        - id: restaurant-service
          uri: lb://RESTAURANT-SERVICE
          predicates:
            - Path=/api/restaurants/**
        - id: order-service
          uri: lb://ORDER-SERVICE
          predicates:
            - Path=/api/orders/**
eureka:
  client:
    service-url:
      defaultZone: http://eureka-server:8761/eureka`,
      },
      {
        title: 'RestaurantClient.java (OpenFeign + Resilience4j)',
        lang: 'java',
        code: `@FeignClient(name = "RESTAURANT-SERVICE", fallback = RestaurantClientFallback.class)
public interface RestaurantClient {
    @GetMapping("/api/restaurants/menu-items/{id}")
    MenuItemDto getMenuItem(@PathVariable("id") Long id);
}

@Component
class RestaurantClientFallback implements RestaurantClient {
    @Override
    public MenuItemDto getMenuItem(Long id) {
        throw new ServiceUnavailableException("Restaurant service is down. Please try again later.");
    }
}

// order-service application.yml:
// spring.cloud.openfeign.circuitbreaker.enabled: true
// main class: @EnableFeignClients`,
      },
      {
        title: 'Kafka publisher and listener',
        lang: 'java',
        code: `// order-service
@Service
@RequiredArgsConstructor
public class OrderEventPublisher {
    private final KafkaTemplate<String, OrderPlacedEvent> kafkaTemplate;

    public void publishOrderPlaced(Order order) {
        OrderPlacedEvent event = new OrderPlacedEvent(order.getId(), order.getUserId(), order.getTotal());
        kafkaTemplate.send("order-placed", String.valueOf(order.getId()), event);
    }
}

// payment-service
@Component
@RequiredArgsConstructor
public class PaymentListener {
    private final PaymentService paymentService;
    private final KafkaTemplate<String, PaymentEvent> kafkaTemplate;

    @KafkaListener(topics = "order-placed", groupId = "payment-group")
    public void onOrderPlaced(OrderPlacedEvent event) {
        boolean ok = paymentService.charge(event.orderId(), event.amount());
        String topic = ok ? "payment-completed" : "payment-failed";
        kafkaTemplate.send(topic, String.valueOf(event.orderId()),
                new PaymentEvent(event.orderId(), event.amount(), ok));
    }
}`,
      },
      {
        title: 'docker-compose.yml (main parts)',
        lang: 'yaml',
        code: `services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
    ports: ["3306:3306"]

  kafka:
    image: bitnami/kafka:3.7
    environment:
      KAFKA_CFG_NODE_ID: 1
      KAFKA_CFG_PROCESS_ROLES: broker,controller
      KAFKA_CFG_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_CFG_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_CFG_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      KAFKA_CFG_CONTROLLER_LISTENER_NAMES: CONTROLLER
    ports: ["9092:9092"]

  eureka-server:
    build: ./eureka-server
    ports: ["8761:8761"]

  api-gateway:
    build: ./api-gateway
    ports: ["8080:8080"]
    depends_on: [eureka-server]

  order-service:
    build: ./order-service
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/order_db?createDatabaseIfNotExist=true
      SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:9092
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka-server:8761/eureka
    depends_on: [mysql, kafka, eureka-server]

  # restaurant-service, payment-service, delivery-service, user-service: same pattern`,
      },
      {
        title: 'Dockerfile (each service)',
        lang: 'yaml',
        code: `FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`,
      },
    ],
    rubric: [
      { criterion: 'Service Design', points: 20, desc: 'Clear service boundaries, database per service, clean APIs.' },
      { criterion: 'Discovery, Gateway & Feign', points: 15, desc: 'Eureka registration, gateway routes, Feign calls with fallback.' },
      { criterion: 'Kafka Event Flow', points: 20, desc: 'Events published and consumed correctly; status updates via saga.' },
      { criterion: 'Docker & Run Experience', points: 15, desc: 'Whole system starts with docker compose up.' },
      { criterion: 'Code Quality, Logs & README', points: 20, desc: 'Layered code, logs with orderId, diagram and README.' },
      { criterion: 'Viva', points: 10, desc: 'Explains trade-offs of microservices and async messaging.' },
    ],
    viva: [
      { q: 'What is a microservice architecture? When should you not use it?', a: 'An app split into small, independently deployable services, each owning its data. For small teams or simple apps a monolith is better because microservices add network, deployment and debugging complexity.' },
      { q: 'What does Eureka do?', a: 'Eureka is a service registry. Each service registers its name and address; other services and the gateway look up the name (lb://ORDER-SERVICE) instead of hard-coding IPs.' },
      { q: 'Why do we need an API Gateway?', a: 'It is the single entry point: routing, authentication, rate limiting and CORS in one place, so clients do not need to know every service address.' },
      { q: 'What is OpenFeign?', a: 'A declarative HTTP client. You write an interface with @FeignClient and Spring MVC annotations; Spring creates the implementation and load-balances using Eureka.' },
      { q: 'Why use Kafka instead of calling Payment service directly?', a: 'Async events decouple services: the order service does not wait or fail if payment is slow or down. Kafka stores events so consumers can process them later and new consumers can be added easily.' },
      { q: 'What is the Saga pattern?', a: 'A way to manage a business transaction across services without a distributed DB transaction. Each service does its local transaction and publishes an event; on failure, compensating actions (like cancelling the order) undo earlier steps. We used choreography (services react to events).' },
      { q: 'What is a circuit breaker?', a: 'It stops calling a failing service after repeated errors and returns a fallback quickly. After some time it lets a few test calls through (half-open) and closes again if they succeed. We used Resilience4j.' },
      { q: 'What is a Kafka consumer group?', a: 'Consumers with the same groupId share the partitions of a topic, so each message is processed by only one consumer in the group. Different groups each get all messages.' },
      { q: 'Why does each service have its own database?', a: 'So services are loosely coupled and can change schema or scale independently. Other services get data through APIs or events, not by joining tables.' },
      { q: 'How do you make event processing idempotent?', a: 'Kafka can deliver a message more than once, so consumers check if they already processed that orderId (e.g. UNIQUE order_id in payment table) before doing the work again.' },
      { q: 'Difference between a Docker image and a container?', a: 'An image is a read-only template (app + JRE). A container is a running instance of an image.' },
      { q: 'How do services find MySQL and Kafka inside Docker Compose?', a: 'Compose creates a network where each service name is a hostname, so we use jdbc:mysql://mysql:3306 and kafka:9092.' },
    ],
    extensions: [
      'Add a notification-service that sends email/SMS on status change',
      'Distributed tracing with Micrometer Tracing + Zipkin',
      'Centralized config with Spring Cloud Config Server',
      'Deploy to Kubernetes with Deployments and Services',
      'Real-time order tracking on a React page using WebSocket',
    ],
  },
];
