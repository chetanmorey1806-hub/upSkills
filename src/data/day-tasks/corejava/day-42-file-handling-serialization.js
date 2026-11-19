export default {
  lesson: 'day-42-file-handling-serialization',
  minutes: 22,
  intro: 'Read and write files with java.io and java.nio.file.Files, and serialize objects with Serializable and transient.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Files API: what does this program print?',
      example: { title: 'reading all lines', code: 'List<String> lines = Files.readAllLines(Path.of("data.txt"));' },
      code: `import java.nio.file.*;
import java.io.IOException;
import java.util.List;

public class Main {
    public static void main(String[] args) throws IOException {
        Path p = Path.of("notes.txt");
        Files.writeString(p, "Java\\nPython\\nSQL\\n");
        Files.writeString(p, "React\\n", StandardOpenOption.APPEND);
        List<String> lines = Files.readAllLines(p);
        System.out.println(lines.size());
        System.out.println(lines.get(1));
        System.out.println(lines);
        System.out.println(Files.exists(p));
        Files.delete(p);
        System.out.println(Files.exists(p));
    }
}`,
      expected: `4
Python
[Java, Python, SQL, React]
true
false`,
      explain: '`writeString` creates (or overwrites) the file; `APPEND` adds to the end instead. `readAllLines` splits on line breaks, giving 4 lines without the newline characters. After `Files.delete` the file no longer exists.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'Serialization and transient: what does this program print?',
      example: {
        title: 'marking a field to skip',
        code: `class User implements Serializable {
  String name;
  transient String password; // not saved
}`,
      },
      code: `import java.io.*;

class Account implements Serializable {
    private static final long serialVersionUID = 1L;
    String holder;
    double balance;
    transient String pin;

    Account(String holder, double balance, String pin) {
        this.holder = holder; this.balance = balance; this.pin = pin;
    }
}

public class Main {
    public static void main(String[] args) throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(new Account("Meena", 2500.5, "4321"));
        }
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            Account a = (Account) in.readObject();
            System.out.println(a.holder);
            System.out.println(a.balance);
            System.out.println(a.pin);
        }
    }
}`,
      expected: `Meena
2500.5
null`,
      explain: '`writeObject` turns the object into bytes and `readObject` rebuilds it. **transient** fields are not saved, so after deserialization `pin` has its default value null — perfect for passwords and PINs. The class must implement Serializable, and `serialVersionUID` keeps versions compatible.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the class header so objects of \`Order\` can be written with ObjectOutputStream:
\`class Order implements ____ {\``,
      example: {
        title: 'a marker interface',
        text: 'Serializable has no methods at all; it only marks the class as allowed to be serialized.',
      },
      accept: ['Serializable', 'java.io.Serializable'],
      acceptRegex: ['^Serializable\\s*[;{]?$', '^java\\s*\\.\\s*io\\s*\\.\\s*Serializable\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Without `implements Serializable`, writeObject throws **NotSerializableException**. Every field type must also be serializable (or transient).',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Read a text file line by line with a BufferedReader \`br\`. Complete the loop condition:
\`String line;\`
\`while (____) {\`
\`    System.out.println(line);\`
\`}\``,
      example: { title: 'creating the reader', code: 'BufferedReader br = new BufferedReader(new FileReader("students.txt"));' },
      accept: ['(line = br.readLine()) != null', 'null != (line = br.readLine())'],
      acceptRegex: [
        '^\\(\\s*line\\s*=\\s*br\\s*\\.\\s*readLine\\s*\\(\\s*\\)\\s*\\)\\s*!\\s*=\\s*null\\s*[;{]?$',
        '^null\\s*!\\s*=\\s*\\(\\s*line\\s*=\\s*br\\s*\\.\\s*readLine\\s*\\(\\s*\\)\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: '`readLine()` returns the next line without the line break, or **null at end of file**. The assignment inside brackets reads a line and tests it in one step. Forgetting the brackets (`line = br.readLine() != null`) does not compile.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You need to copy a **JPG image** byte for byte. Which stream family should you use?',
      options: [
        'FileReader / FileWriter (character streams)',
        'FileInputStream / FileOutputStream (byte streams)',
        'Scanner / PrintWriter',
        'StringReader',
      ],
      answer: 1,
      explain: 'Images, PDFs and other binary data need **byte streams** (InputStream/OutputStream). Character streams (Reader/Writer) decode bytes as text using a charset and can corrupt binary files. Or simply use `Files.copy`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'BufferedReader reduces disk reads by reading large chunks into memory',
        'static fields are serialized with the object',
        'FileWriter("log.txt", true) appends instead of overwriting',
        'Files.readAllLines is fine for huge multi-GB files',
        'Path.of("data", "a.txt") builds a path in an OS-independent way',
      ],
      answers: [0, 2, 4],
      explain: 'Buffering improves performance; the `true` flag of FileWriter means append; Path.of joins parts with the right separator. static fields belong to the class, so they are **not** serialized. readAllLines loads everything into memory — for huge files use `Files.lines` or a BufferedReader.',
    },
  ],
};
