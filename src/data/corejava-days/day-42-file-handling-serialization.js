const ex1 = `import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        File file = new File("students.txt");

        // 1. Write (false = overwrite)
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(file, false))) {
            bw.write("101,Riya,88");
            bw.newLine();
            bw.write("102,Aman,74");
            bw.newLine();
        } catch (IOException e) {
            System.out.println("Write failed: " + e.getMessage());
        }

        // 2. Append (true = append mode)
        try (FileWriter fw = new FileWriter(file, true)) {
            fw.write("103,Zoya,95");
            fw.write(System.lineSeparator());
        } catch (IOException e) {
            System.out.println("Append failed: " + e.getMessage());
        }

        System.out.println("Exists: " + file.exists() + ", name: " + file.getName());

        // 3. Read line by line
        int total = 0, count = 0;
        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(",");
                System.out.println("Roll " + parts[0] + ": " + parts[1] + " scored " + parts[2]);
                total += Integer.parseInt(parts[2]);
                count++;
            }
        } catch (IOException e) {
            System.out.println("Read failed: " + e.getMessage());
        }
        System.out.println("Average: " + (total / count));
        System.out.println("Deleted: " + file.delete());
    }
}`;

const ex2 = `import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.List;

public class Main {
    public static void main(String[] args) throws IOException {
        Path dir = Path.of("demo-notes");
        Files.createDirectories(dir);
        Path notes = dir.resolve("notes.txt");

        Files.writeString(notes, "Java NIO is easy" + System.lineSeparator());
        Files.write(notes, List.of("Line two", "Line three"), StandardOpenOption.APPEND);

        List<String> lines = Files.readAllLines(notes);
        System.out.println("Lines: " + lines.size());
        for (String l : lines) System.out.println("> " + l);

        try (var stream = Files.lines(notes)) {
            long withLine = stream.filter(l -> l.startsWith("Line")).count();
            System.out.println("Starting with 'Line': " + withLine);
        }

        Path copy = dir.resolve("notes-copy.txt");
        Files.copy(notes, copy);
        System.out.println("Copy exists: " + Files.exists(copy));
        System.out.println("File name: " + notes.getFileName());
        System.out.println("Parent: " + notes.getParent());

        // clean up
        Files.delete(copy);
        Files.delete(notes);
        Files.delete(dir);
        System.out.println("Cleaned up: " + Files.notExists(dir));
    }
}`;

const ex3 = `import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.nio.file.Files;
import java.nio.file.Path;

class Employee implements Serializable {
    private static final long serialVersionUID = 1L;

    private final int id;
    private final String name;
    private transient String password;     // NOT saved
    static String company = "TechCorp";      // static: belongs to class, NOT saved

    Employee(int id, String name, String password) {
        this.id = id; this.name = name; this.password = password;
    }

    @Override
    public String toString() {
        return "Employee{id=" + id + ", name=" + name + ", password=" + password + "}";
    }
}

public class Main {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        Employee e = new Employee(1, "Riya", "secret123");
        System.out.println("Before: " + e);

        try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("emp.ser"))) {
            out.writeObject(e);                       // serialization
        }
        System.out.println("Saved to emp.ser");

        try (ObjectInputStream in = new ObjectInputStream(new FileInputStream("emp.ser"))) {
            Employee loaded = (Employee) in.readObject();   // deserialization
            System.out.println("After: " + loaded);
            System.out.println("Same object? " + (loaded == e));
        }
        Files.delete(Path.of("emp.ser"));
    }
}`;

const ex4 = `import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;

public class Main {
    public static void main(String[] args) throws IOException {
        // Byte streams: copy a file byte by byte with a buffer
        try (FileOutputStream fos = new FileOutputStream("source.bin")) {
            fos.write(new byte[]{65, 66, 67, 68, 69});      // ASCII A B C D E
        }
        try (FileInputStream in = new FileInputStream("source.bin");
             FileOutputStream out = new FileOutputStream("target.bin")) {
            byte[] buffer = new byte[2];
            int n, chunks = 0;
            while ((n = in.read(buffer)) != -1) {
                out.write(buffer, 0, n);
                chunks++;
            }
            System.out.println("Copied in " + chunks + " chunks");
        }
        System.out.println("Target content: " + Files.readString(Path.of("target.bin")));
        System.out.println("Size: " + Files.size(Path.of("target.bin")) + " bytes");

        // PrintWriter: formatted text output
        try (PrintWriter pw = new PrintWriter("report.txt")) {
            pw.printf("%-6s%5d%n", "Riya", 88);
            pw.printf("%-6s%5d%n", "Aman", 74);
        }
        Files.readAllLines(Path.of("report.txt")).forEach(l -> System.out.println("[" + l + "]"));

        // Handling a missing file
        try (FileInputStream missing = new FileInputStream("no-such-file.txt")) {
            System.out.println("Opened");
        } catch (FileNotFoundException e) {
            System.out.println("Handled FileNotFoundException");
        }

        Files.delete(Path.of("source.bin"));
        Files.delete(Path.of("target.bin"));
        Files.delete(Path.of("report.txt"));
    }
}`;

export default {
  id: 'day-42-file-handling-serialization',
  title: 'File Handling: java.io and java.nio.file.Files, Serialization',
  module: 'Module 8: I/O, JVM & Interview Prep',
  day: 42,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Programs need to save and load data permanently. Learn byte and character streams in java.io, buffered reading and writing, the modern java.nio.file.Files/Path API, and object serialization with Serializable, transient and serialVersionUID.',
  objectives: [
    'Differentiate byte streams and character streams',
    'Read and write text files with FileReader/FileWriter and Buffered classes',
    'Use Path and Files for simple, modern file operations',
    'Serialize and deserialize objects and use transient and serialVersionUID',
    'Handle IOException properly with try-with-resources',
  ],
  theory: [
    {
      heading: 'Streams in java.io: Byte vs Character',
      content: 'In Java I/O, a stream is a one-way pipe of data — like a water pipe from a tank (source) to a tap (destination). Input streams bring data INTO your program; output streams send data OUT. Byte streams move raw 8-bit bytes (images, PDFs, any file). Character streams move 16-bit characters and handle text encoding (UTF-8) for you.',
      points: [
        'Byte streams: InputStream / OutputStream -> FileInputStream, FileOutputStream, BufferedInputStream, ObjectInputStream',
        'Character streams: Reader / Writer -> FileReader, FileWriter, BufferedReader, BufferedWriter, PrintWriter',
        'Rule: text -> Reader/Writer; binary (images, audio, objects) -> InputStream/OutputStream',
        'InputStreamReader / OutputStreamWriter bridge bytes to characters',
        'Always close streams — use try-with-resources',
      ],
    },
    {
      heading: 'Buffered Reading and Writing',
      content: 'Reading a file one character at a time is like carrying water one spoon at a time. Buffered classes carry a bucket: they read/write big chunks into memory (8 KB by default), which is much faster. BufferedReader also gives readLine(), which returns null at end of file.',
      syntax: `try (BufferedWriter bw = new BufferedWriter(new FileWriter("a.txt", true))) {  // true = append
    bw.write("Hello");
    bw.newLine();
}
try (BufferedReader br = new BufferedReader(new FileReader("a.txt"))) {
    String line;
    while ((line = br.readLine()) != null) System.out.println(line);
}`,
      points: [
        'FileWriter(file) overwrites; FileWriter(file, true) appends',
        'flush() pushes buffered data to disk; close() flushes automatically',
        'File class represents a path: exists(), getName(), length(), delete(), mkdir(), listFiles()',
      ],
    },
    {
      heading: 'java.nio.file: Path and Files (Modern Way)',
      content: 'Java 7 introduced NIO.2 (java.nio.file). Path represents a file location and Files is a utility class with one-line methods for most tasks. It gives better error messages than the old File class (exceptions instead of false).',
      syntax: `Path p = Path.of("data", "notes.txt");          // Java 11 (Paths.get in Java 7/8)
Files.writeString(p, "text");                    // Java 11
String s = Files.readString(p);                  // Java 11
List<String> lines = Files.readAllLines(p);
Files.write(p, lines, StandardOpenOption.APPEND);
try (Stream<String> st = Files.lines(p)) { ... } // lazy, for big files
Files.exists(p); Files.size(p); Files.createDirectories(dir);
Files.copy(src, dst); Files.move(src, dst); Files.delete(p); Files.deleteIfExists(p);
Files.list(dir); Files.walk(dir);`,
      tip: 'readAllLines loads the entire file into memory. For huge log files, use Files.lines() (lazy stream) or BufferedReader, and close it with try-with-resources.',
    },
    {
      heading: 'Serialization and Deserialization',
      content: 'Serialization converts an object into a stream of bytes so it can be saved to a file or sent over a network — like packing a piece of furniture flat into a box. Deserialization rebuilds the object from bytes — unpacking and assembling it again. The class must implement the marker interface java.io.Serializable (no methods).',
      syntax: `class Employee implements Serializable {
    private static final long serialVersionUID = 1L;
    private String name;
    private transient String password;   // skipped
}
out.writeObject(emp);                     // ObjectOutputStream
Employee e = (Employee) in.readObject();  // ObjectInputStream`,
      points: [
        'transient fields are not saved; after deserialization they get default values (null, 0, false)',
        'static fields belong to the class, not the object, so they are not serialized',
        'serialVersionUID is a version number; if it differs between saved data and class, InvalidClassException is thrown',
        'All fields referenced must also be Serializable, or NotSerializableException is thrown',
        'Constructor of a Serializable class is NOT called during deserialization',
        'Externalizable gives full control with writeExternal/readExternal',
        'Security: never deserialize untrusted data; prefer JSON for data exchange in modern apps',
      ],
    },
  ],
  examples: [
    {
      title: 'Write, Append and Read a CSV with java.io',
      scenario: 'A school saves student marks in a text file and later reads them to compute the average.',
      steps: ['In IntelliJ: File > New > Java Class > Main', 'Type the code (the file is created in the project root folder)', 'Click Run ▶', 'In Eclipse, press F5 on the project to see students.txt before it is deleted (comment out the delete line)'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Exists: true, name: students.txt
Roll 101: Riya scored 88
Roll 102: Aman scored 74
Roll 103: Zoya scored 95
Average: 85
Deleted: true`,
      explanation: 'BufferedWriter with false overwrites the file; FileWriter with true appends a third line. BufferedReader.readLine() returns null at end of file. (88 + 74 + 95) / 3 = 257 / 3 = 85 with integer division.',
    },
    {
      title: 'Modern File Operations with Path and Files',
      scenario: 'A note-taking app creates a folder, writes notes, appends lines, reads them, copies the file and cleans up.',
      steps: ['Create Main.java', 'Use Path.of and Files methods', 'Run ▶'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Lines: 3
> Java NIO is easy
> Line two
> Line three
Starting with 'Line': 2
Copy exists: true
File name: notes.txt
Parent: demo-notes
Cleaned up: true`,
      explanation: 'Files.writeString creates/overwrites; Files.write with APPEND adds lines. Files.lines returns a lazy Stream that must be closed, so it is in try-with-resources. A directory can be deleted only when it is empty.',
    },
    {
      title: 'Serialization with transient and static Fields',
      scenario: 'An HR app saves an Employee object to disk without saving the password.',
      steps: ['Create Main.java with Employee implementing Serializable', 'Run ▶', 'Observe password becomes null after loading'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Before: Employee{id=1, name=Riya, password=secret123}
Saved to emp.ser
After: Employee{id=1, name=Riya, password=null}
Same object? false`,
      explanation: 'writeObject turns the object into bytes; readObject creates a NEW object with the same data, so == is false. The transient password is skipped and comes back as null. The static company field is never part of the saved bytes.',
    },
    {
      title: 'Byte Streams, PrintWriter and FileNotFoundException',
      scenario: 'Copy a binary file in chunks, write a formatted report, and handle a missing file gracefully.',
      steps: ['Create Main.java', 'Run ▶', 'Change the buffer size to 1024 and see the chunk count change'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Copied in 3 chunks
Target content: ABCDE
Size: 5 bytes
[Riya     88]
[Aman     74]
Handled FileNotFoundException`,
      explanation: 'With a 2-byte buffer the 5 bytes are read as 2 + 2 + 1 = 3 chunks; write(buffer, 0, n) writes only the bytes actually read. %-6s left-aligns the name in 6 characters and %5d right-aligns the number in 5. Opening a missing file throws FileNotFoundException (a subclass of IOException).',
    },
  ],
  interview: [
    { q: 'Difference between byte stream and character stream?', a: 'Byte streams (InputStream/OutputStream) handle raw 8-bit data for any file type. Character streams (Reader/Writer) handle 16-bit Unicode characters and encoding, used for text.', level: 'Easy' },
    { q: 'Why use BufferedReader instead of FileReader alone?', a: 'BufferedReader reads large chunks into an internal buffer, reducing disk access, and provides readLine().', level: 'Easy' },
    { q: 'How do you append to a file?', a: 'new FileWriter(file, true) or Files.write(path, data, StandardOpenOption.APPEND).', level: 'Easy' },
    { q: 'What is the difference between java.io.File and java.nio.file.Path/Files?', a: 'File is the old API that often returns boolean on failure. Path/Files (NIO.2) offer richer operations, symbolic links, attributes, streams, and throw descriptive exceptions.', level: 'Medium' },
    { q: 'What is serialization?', a: 'Converting an object\'s state to a byte stream for storage or transfer; deserialization reconstructs the object. The class must implement Serializable.', level: 'Easy' },
    { q: 'What is a marker interface? Give examples.', a: 'An interface without methods used to tag a class for special treatment: Serializable, Cloneable, RandomAccess.', level: 'Medium' },
    { q: 'What is the use of transient?', a: 'It excludes a field from serialization; on deserialization it gets its default value.', level: 'Easy' },
    { q: 'What is serialVersionUID? What if you do not declare it?', a: 'A version identifier checked during deserialization. If absent, the JVM computes one from the class structure; any class change can alter it and cause InvalidClassException.', level: 'Medium' },
    { q: 'Are static fields serialized?', a: 'No. Static fields belong to the class, not the instance.', level: 'Easy' },
    { q: 'What happens if a Serializable class has a field of a non-serializable type?', a: 'writeObject throws java.io.NotSerializableException unless that field is transient or null.', level: 'Medium' },
    { q: 'Is the constructor called during deserialization?', a: 'No, not for the Serializable class itself. The no-arg constructor of the first non-serializable superclass is called.', level: 'Hard' },
    { q: 'Serializable vs Externalizable?', a: 'Serializable uses default automatic serialization. Externalizable requires writeExternal/readExternal for full control and a public no-arg constructor.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a program that counts lines, words and characters in a text file (create the file first with Files.writeString).',
      hint: 'Read with Files.readAllLines; words = line.trim().split(" ").length for non-empty lines.',
      solution: `import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class Main {
    public static void main(String[] args) throws IOException {
        Path p = Path.of("sample.txt");
        Files.write(p, List.of("Java is fun", "File handling is easy"));
        int lines = 0, words = 0, chars = 0;
        for (String line : Files.readAllLines(p)) {
            lines++;
            chars += line.length();
            if (!line.isBlank()) words += line.trim().split(" ").length;
        }
        System.out.println("Lines: " + lines + ", Words: " + words + ", Chars: " + chars);
        // Lines: 2, Words: 7, Chars: 32
        Files.delete(p);
    }
}`,
    },
    {
      task: 'Copy only the lines containing "ERROR" from app.log into errors.log.',
      hint: 'Files.lines(src).filter(l -> l.contains("ERROR")).toList(), then Files.write.',
      solution: `import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

public class Main {
    public static void main(String[] args) throws IOException {
        Path log = Path.of("app.log");
        Files.write(log, List.of("INFO start", "ERROR db down", "INFO retry", "ERROR timeout"));
        List<String> errors;
        try (Stream<String> s = Files.lines(log)) {
            errors = s.filter(l -> l.contains("ERROR")).toList();
        }
        Files.write(Path.of("errors.log"), errors);
        System.out.println("Errors copied: " + errors.size()); // 2
    }
}`,
    },
    {
      task: 'Serialize a List<Product> (Product is Serializable with name and price) to products.ser and read it back.',
      hint: 'ArrayList is Serializable; write the whole list with writeObject and cast back to List<Product>.',
      solution: `import java.io.*;
import java.util.ArrayList;
import java.util.List;

class Product implements Serializable {
    private static final long serialVersionUID = 1L;
    String name; double price;
    Product(String n, double p) { name = n; price = p; }
    public String toString() { return name + ":" + price; }
}

public class Main {
    @SuppressWarnings("unchecked")
    public static void main(String[] args) throws Exception {
        List<Product> list = new ArrayList<>(List.of(new Product("Pen", 10), new Product("Bag", 500)));
        try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("products.ser"))) {
            out.writeObject(list);
        }
        try (ObjectInputStream in = new ObjectInputStream(new FileInputStream("products.ser"))) {
            List<Product> loaded = (List<Product>) in.readObject();
            System.out.println(loaded); // [Pen:10.0, Bag:500.0]
        }
    }
}`,
    },
    {
      task: 'List all .txt files in a folder with their sizes using Files.list.',
      hint: 'try (Stream<Path> s = Files.list(dir)) { s.filter(p -> p.toString().endsWith(".txt")) ... }',
      solution: `import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

public class Main {
    public static void main(String[] args) throws IOException {
        Path dir = Path.of(".");
        try (Stream<Path> files = Files.list(dir)) {
            files.filter(p -> p.toString().endsWith(".txt"))
                 .sorted()
                 .forEach(p -> {
                     try {
                         System.out.println(p.getFileName() + " - " + Files.size(p) + " bytes");
                     } catch (IOException e) {
                         System.out.println("Cannot read " + p);
                     }
                 });
        }
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which class is best for reading a text file line by line?', options: ['FileInputStream', 'BufferedReader', 'ObjectInputStream', 'DataOutputStream'], answer: 1, explanation: 'BufferedReader.readLine() reads text line by line efficiently.' },
    { question: 'What does new FileWriter("a.txt", true) do?', options: ['Opens the file in append mode', 'Deletes the file', 'Opens read-only', 'Creates a directory'], answer: 0, explanation: 'The second argument true means append.' },
    { question: 'Which modifier excludes a field from serialization?', options: ['static final', 'volatile', 'private', 'transient'], answer: 3, explanation: 'transient fields are not serialized.' },
    { question: 'Serializable is an example of:', options: ['A functional interface', 'An abstract class', 'A marker interface', 'An annotation'], answer: 2, explanation: 'It has no methods; it only marks the class.' },
    { question: 'Which Files method returns a lazy Stream<String> of lines?', options: ['Files.readAllLines', 'Files.lines', 'Files.readString', 'Files.list'], answer: 1, explanation: 'Files.lines reads lazily and must be closed.' },
  ],
};
