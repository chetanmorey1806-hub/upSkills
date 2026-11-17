const ex1 = `using System;
using System.IO;

string path = "students.csv";

// Write text line by line
using (StreamWriter writer = new StreamWriter(path))
{
    writer.WriteLine("RollNo,Name,Marks");
    writer.WriteLine("1,Asha,85");
    writer.WriteLine("2,Ravi,72");
    writer.WriteLine("3,Meena,91");
}   // Dispose flushes the buffer and closes the file
Console.WriteLine("Saved 3 student records");

// Read text line by line
using (StreamReader reader = new StreamReader(path))
{
    string? header = reader.ReadLine();
    Console.WriteLine("Header: " + header);

    string? line;
    int total = 0, count = 0;
    while ((line = reader.ReadLine()) != null)
    {
        string[] p = line.Split(',');
        int marks = int.Parse(p[2]);
        total += marks;
        count++;
        Console.WriteLine($"Roll {p[0]}: {p[1]} - {marks}");
    }
    Console.WriteLine($"Average: {total / count}");
}

File.Delete(path);`;

const ex2 = `using System;
using System.IO;

string path = "attendance.txt";
File.Delete(path);   // no error if the file does not exist

using (var w = new StreamWriter(path, append: true))
{
    w.Write("Mon: ");          // Write = no new line
    w.WriteLine("Present");    // WriteLine = adds a new line
}

using (var w = new StreamWriter(path, append: true))   // opens again, adds at the end
{
    w.WriteLine("Tue: Absent");
}

using (var r = new StreamReader(path))
{
    Console.WriteLine("First char code: " + r.Peek());   // looks, does not move
    string all = r.ReadToEnd();
    Console.Write(all);
    Console.WriteLine("At end: " + r.EndOfStream);
}

File.Delete(path);`;

const ex3 = `using System;
using System.IO;

string path = "students.bin";

var students = new (int Roll, string Name, int Marks, bool Passed)[]
{
    (1, "Asha", 85, true),
    (2, "Ravi", 32, false),
};

// Save in binary format
using (var bw = new BinaryWriter(File.Open(path, FileMode.Create)))
{
    bw.Write(students.Length);        // header: how many records
    foreach (var s in students)
    {
        bw.Write(s.Roll);             // 4 bytes
        bw.Write(s.Name);             // 1 length byte + characters
        bw.Write(s.Marks);            // 4 bytes
        bw.Write(s.Passed);           // 1 byte
    }
}
Console.WriteLine("File size: " + new FileInfo(path).Length + " bytes");

// Load - read in EXACTLY the same order and types
using (var br = new BinaryReader(File.Open(path, FileMode.Open)))
{
    int count = br.ReadInt32();
    Console.WriteLine("Records: " + count);
    for (int i = 0; i < count; i++)
    {
        int roll = br.ReadInt32();
        string name = br.ReadString();
        int marks = br.ReadInt32();
        bool passed = br.ReadBoolean();
        Console.WriteLine($"{roll} {name} {marks} {(passed ? "PASS" : "FAIL")}");
    }
}

File.Delete(path);`;

const ex4 = `using System;
using System.Collections.Generic;
using System.IO;

var repo = new StudentFileRepository("records.txt");

repo.Save(new List<Student>
{
    new Student(101, "Asha", 88),
    new Student(102, "Ravi", 64),
});
repo.Add(new Student(103, "Meena", 93));

List<Student> loaded = repo.Load();
Console.WriteLine($"Loaded {loaded.Count} students");
foreach (Student s in loaded)
    Console.WriteLine(s);

File.Delete("records.txt");

public record Student(int Id, string Name, int Marks);

public class StudentFileRepository
{
    private readonly string _path;

    public StudentFileRepository(string path) => _path = path;

    public void Save(List<Student> students)
    {
        using var writer = new StreamWriter(_path, append: false);   // overwrite
        foreach (var s in students)
            writer.WriteLine($"{s.Id}|{s.Name}|{s.Marks}");
    }

    public void Add(Student s)
    {
        using var writer = new StreamWriter(_path, append: true);    // add to end
        writer.WriteLine($"{s.Id}|{s.Name}|{s.Marks}");
    }

    public List<Student> Load()
    {
        var list = new List<Student>();
        if (!File.Exists(_path)) return list;

        using var reader = new StreamReader(_path);
        string? line;
        while ((line = reader.ReadLine()) != null)
        {
            string[] p = line.Split('|');
            list.Add(new Student(int.Parse(p[0]), p[1], int.Parse(p[2])));
        }
        return list;
    }
}`;

const ex5 = `using System;
using System.IO;
using System.Text;

// StreamWriter buffers text in memory; Flush pushes it to the stream
var memory = new MemoryStream();
var writer = new StreamWriter(memory, Encoding.UTF8);

writer.Write("ABC");
Console.WriteLine("Before Flush, stream length: " + memory.Length);
writer.Flush();
Console.WriteLine("After Flush, stream length: " + memory.Length);

writer.AutoFlush = true;     // flush after every Write
writer.Write("DE");
Console.WriteLine("With AutoFlush, stream length: " + memory.Length);

// Read it back with a StreamReader on the same MemoryStream
memory.Position = 0;
var reader = new StreamReader(memory);
Console.WriteLine("Content: " + reader.ReadToEnd());

writer.Dispose();   // also disposes the MemoryStream`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8 or .NET 10 (LTS), click Create`,
  'Replace all code in Program.cs with the code below',
  'Press Ctrl+F5 to run. To inspect the saved file, comment out the File.Delete line, run again and open bin\\Debug\\net8.0 (or net10.0) via right-click project > Open Folder in File Explorer',
];

export default {
  id: 'day-034-streamreader-streamwriter-binary',
  title: 'StreamReader, StreamWriter, BinaryReader, BinaryWriter',
  module: 'Module 3: Advanced C# Programming',
  day: 34,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Streams let you read and write data piece by piece instead of loading a whole file. Learn what a stream is, read and write text with StreamReader/StreamWriter (ReadLine, ReadToEnd, Peek, append mode, Flush, encoding), and save typed data compactly with BinaryWriter/BinaryReader. Practical: save and load student records.',
  objectives: [
    'Explain what a stream is and how reader/writer classes wrap a FileStream',
    'Write text with StreamWriter (Write, WriteLine, append mode, Flush, AutoFlush)',
    'Read text with StreamReader (ReadLine loop, ReadToEnd, Peek, EndOfStream)',
    'Save and load typed values with BinaryWriter and BinaryReader in the same order',
    'Build a small file-based repository that saves and loads student records',
  ],
  theory: [
    {
      heading: 'What is a stream?',
      content: 'A stream is a sequence of bytes that you read or write in order, like water flowing through a pipe. The source can be a file (FileStream), memory (MemoryStream), a network connection (NetworkStream) or a compressed file (GZipStream). All of them derive from the abstract class System.IO.Stream with Read, Write, Seek, Position, Length, Flush and Dispose. Reader and writer classes sit on top of a stream and convert bytes into text or typed values for you.',
      syntax: `Stream (abstract)
 ├─ FileStream     (disk file)
 ├─ MemoryStream   (byte array in RAM)
 ├─ NetworkStream  (socket)
 └─ GZipStream ... (wraps another stream)

TextReader -> StreamReader      TextWriter -> StreamWriter
BinaryReader                    BinaryWriter`,
      tip: 'Analogy: the stream is the water pipe; StreamReader is a tap that gives you water in glasses (lines of text); BinaryReader gives you sealed bottles of exactly known size (int, bool, double).',
    },
    {
      heading: 'StreamWriter: writing text',
      content: 'StreamWriter writes characters to a stream using an encoding (UTF-8 without BOM by default). new StreamWriter(path) creates or overwrites the file; new StreamWriter(path, append: true) adds to the end. Write writes text without a newline; WriteLine adds Environment.NewLine (\\r\\n on Windows, \\n on Linux). Text is first collected in a memory buffer for speed and written to disk when the buffer is full, when you call Flush(), or when the writer is disposed.',
      syntax: `using (var writer = new StreamWriter("log.txt", append: true))
{
    writer.Write("Name: ");
    writer.WriteLine("Asha");
    writer.WriteLine($"Marks: {85}");
}   // Dispose -> Flush -> Close

// C# 8 using declaration: disposed at the end of the enclosing block
using var w = new StreamWriter("out.txt", false, Encoding.UTF8);`,
      points: [
        'Forgetting using/Dispose is the number one bug: the last part of the text stays in the buffer and never reaches the file',
        'AutoFlush = true flushes after every write (simpler, but slower)',
        'Constructor overloads accept an Encoding, e.g. Encoding.UTF8 (writes a BOM) or Encoding.Unicode',
      ],
    },
    {
      heading: 'StreamReader: reading text',
      content: 'StreamReader reads characters from a stream and detects the encoding from the BOM. ReadLine returns the next line without the newline, or null at the end of the file - so the standard pattern is a while loop. ReadToEnd returns the rest of the file as one string. Peek returns the next character code without consuming it (-1 at the end). EndOfStream tells you if there is nothing left to read.',
      syntax: `using var reader = new StreamReader("students.csv");
string? line;
while ((line = reader.ReadLine()) != null)
{
    Console.WriteLine(line);
}

// or: string everything = reader.ReadToEnd();`,
      points: [
        'Reading line by line uses very little memory, even for huge files',
        'File.ReadLines(path) gives a lazy IEnumerable<string> built on StreamReader',
        'Read() returns one character code; Read(char[] buffer, ...) reads a block',
      ],
    },
    {
      heading: 'BinaryWriter and BinaryReader',
      content: 'BinaryWriter writes primitive values in their raw binary form: an int always takes 4 bytes, a bool 1 byte, a double 8 bytes, and a string is written as a length prefix followed by its UTF-8 bytes. BinaryReader reads them back with ReadInt32, ReadString, ReadBoolean, ReadDouble, ReadDecimal and so on. There are no separators or line breaks - you MUST read values in exactly the same order and types in which they were written.',
      syntax: `using (var bw = new BinaryWriter(File.Open("data.bin", FileMode.Create)))
{
    bw.Write(101);        // int
    bw.Write("Asha");     // string
    bw.Write(85.5);       // double
    bw.Write(true);       // bool
}
using (var br = new BinaryReader(File.Open("data.bin", FileMode.Open)))
{
    int id = br.ReadInt32();
    string name = br.ReadString();
    double marks = br.ReadDouble();
    bool active = br.ReadBoolean();
}`,
      points: [
        'Advantages: compact, fast, no parsing of text, exact values (no culture issues with decimals)',
        'Disadvantages: not human-readable; changing the order or type breaks old files',
        'Reading past the end throws EndOfStreamException',
      ],
    },
    {
      heading: 'Text vs binary vs JSON - which format?',
      content: 'Plain text/CSV (StreamWriter) is readable in Notepad and opens in Excel. Binary (BinaryWriter) is smallest and fastest but unreadable and fragile. In modern applications structured data is usually saved as JSON with System.Text.Json (see Extra topic 31) or in a database (Module 4). Knowing streams is still important because JSON serializers, HTTP bodies, file uploads (IFormFile.OpenReadStream) and Azure Blob storage all work with streams.',
      points: [
        'Text/CSV - logs, exports for Excel, simple config',
        'Binary - game saves, custom compact formats, images and media',
        'JSON - APIs, settings, documents',
        'Database - large, related, multi-user data',
      ],
    },
    {
      heading: 'MemoryStream and good practices',
      content: 'MemoryStream is a stream over a byte array in RAM. It is useful for testing reader/writer code without touching the disk, building a file in memory before sending it as an HTTP download, or converting between bytes and text. The same rules apply to all streams.',
      points: [
        'Always use using so streams are flushed and closed',
        'Disposing a reader/writer also disposes the stream it wraps (unless you pass leaveOpen: true)',
        'Reset Position = 0 before reading a MemoryStream you just wrote to',
        'Prefer async versions (ReadLineAsync, WriteLineAsync) in web apps - Day 38',
        'Wrap IO in try/catch for IOException and UnauthorizedAccessException',
      ],
    },
  ],
  examples: [
    {
      title: 'Save and read student records with StreamWriter / StreamReader',
      scenario: 'Write a CSV file with a header and three students, then read it line by line, skip the header, print each student and the class average.',
      steps: steps('StudentRecordsText'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `Saved 3 student records
Header: RollNo,Name,Marks
Roll 1: Asha - 85
Roll 2: Ravi - 72
Roll 3: Meena - 91
Average: 82`,
      explanation: 'The first ReadLine call consumes the header. The while loop assigns each next line and stops when ReadLine returns null. Each line is split on commas and marks are summed: 85 + 72 + 91 = 248, and 248 / 3 with integers is 82 (decimal part dropped). Both writer and reader are inside using blocks, so the file is closed before the next step.',
    },
    {
      title: 'Append mode, Write vs WriteLine, Peek and ReadToEnd',
      scenario: 'An attendance log is opened twice in append mode; then it is read with Peek and ReadToEnd.',
      steps: steps('AppendAndPeek'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `First char code: 77
Mon: Present
Tue: Absent
At end: True`,
      explanation: 'Write("Mon: ") and WriteLine("Present") produce one line. The second writer opens with append: true, so "Tue: Absent" is added instead of overwriting. Peek returns 77, the code of \'M\', without moving forward, so ReadToEnd still returns the whole text. After ReadToEnd, EndOfStream is True.',
    },
    {
      title: 'Binary student records with BinaryWriter / BinaryReader',
      scenario: 'Save student roll numbers, names, marks and pass flags in a compact binary file and load them back.',
      steps: steps('StudentRecordsBinary'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `File size: 32 bytes
Records: 2
1 Asha 85 PASS
2 Ravi 32 FAIL`,
      explanation: 'Size: count (4 bytes) + per student: Roll 4 + Name (1 length byte + 4 characters = 5) + Marks 4 + Passed 1 = 14 bytes, so 4 + 14 + 14 = 32 bytes. The same data as text would need separators and parsing. The reader calls ReadInt32, ReadString, ReadInt32, ReadBoolean in exactly the write order; swapping two calls would produce garbage or EndOfStreamException.',
    },
    {
      title: 'A StudentFileRepository class (Save, Add, Load)',
      scenario: 'Hide the file details inside a repository class: Save overwrites the file with a list, Add appends one student, Load reads all students back into a List<Student>.',
      steps: steps('StudentRepositoryFile'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `Loaded 3 students
Student { Id = 101, Name = Asha, Marks = 88 }
Student { Id = 102, Name = Ravi, Marks = 64 }
Student { Id = 103, Name = Meena, Marks = 93 }`,
      explanation: 'Save uses append: false (overwrite) and writes "101|Asha|88" style lines; Add uses append: true. The using declarations (using var) close the file at the end of each method. Load returns an empty list if the file is missing, otherwise splits each line on | and creates records. A record prints its properties automatically through the compiler-generated ToString. This is the same idea as the repository pattern used later with EF Core.',
    },
    {
      title: 'Buffering: Flush and AutoFlush with a MemoryStream',
      scenario: 'See with your own eyes that StreamWriter keeps text in a buffer until it is flushed - the reason why forgetting Dispose loses data.',
      steps: steps('FlushDemo'),
      code: ex5,
      csharp: { files: { 'Program.cs': ex5 }, stdin: '' },
      result: `Before Flush, stream length: 0
After Flush, stream length: 6
With AutoFlush, stream length: 8
Content: ABCDE`,
      explanation: 'After Write("ABC") the text is only in the writer buffer, so the MemoryStream is still empty (0). Flush writes it: Encoding.UTF8 adds a 3-byte BOM (preamble) on the first flush plus 3 bytes for ABC = 6. With AutoFlush, "DE" is written immediately: 8 bytes. StreamReader detects and skips the BOM, so the content is ABCDE. If you use new StreamWriter(stream) without an encoding, no BOM is written and the numbers would be 0, 3 and 5.',
    },
  ],
  interview: [
    { q: 'What is a stream in .NET?', a: 'An abstraction (System.IO.Stream) for a sequence of bytes that can be read/written sequentially, possibly with seeking. Concrete streams: FileStream, MemoryStream, NetworkStream, GZipStream, CryptoStream.', level: 'Easy' },
    { q: 'Difference between StreamReader and BinaryReader?', a: 'StreamReader reads characters/text using an encoding (ReadLine, ReadToEnd). BinaryReader reads primitive types in raw binary form (ReadInt32, ReadDouble, ReadString).', level: 'Easy' },
    { q: 'What does ReadLine return at the end of the file?', a: 'null. That is why the loop is while ((line = reader.ReadLine()) != null).', level: 'Easy' },
    { q: 'Why can data be missing if you forget to dispose a StreamWriter?', a: 'StreamWriter buffers text in memory. Without Flush/Dispose the last buffer is never written to the file.', level: 'Medium' },
    { q: 'How do you open a StreamWriter to add to an existing file?', a: 'new StreamWriter(path, append: true). With append: false (default) the file is overwritten.', level: 'Easy' },
    { q: 'What is the difference between Write and WriteLine?', a: 'Write writes only the given text; WriteLine writes the text followed by the newline sequence (Environment.NewLine by default).', level: 'Easy' },
    { q: 'How does BinaryWriter store a string?', a: 'As a length prefix (7-bit encoded integer, 1 byte for short strings) followed by the UTF-8 bytes of the string.', level: 'Hard' },
    { q: 'What is the most important rule when reading a binary file with BinaryReader?', a: 'Read values in exactly the same order and with the same types as they were written; otherwise you get wrong data or EndOfStreamException.', level: 'Medium' },
    { q: 'What does Peek() do?', a: 'Returns the next character code without consuming it, or -1 if there is nothing more to read.', level: 'Medium' },
    { q: 'What is MemoryStream used for?', a: 'A stream backed by a byte array in RAM: building files in memory (e.g. Excel/PDF downloads), unit testing stream code, converting data without disk IO.', level: 'Medium' },
    { q: 'What is the output? using var ms = new MemoryStream(); using var w = new StreamWriter(ms); w.Write("Hi"); Console.Write(ms.Length);', a: '0. The text is still in the StreamWriter buffer because Flush was not called.', level: 'Hard' },
    { q: 'Does disposing a StreamReader close the underlying FileStream?', a: 'Yes, by default the reader owns the stream and disposes it. Use the constructor with leaveOpen: true to keep it open.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write 5 employee names to employees.txt with StreamWriter, then read them with StreamReader and print them in upper case.',
      hint: 'Use two using blocks; ToUpperInvariant() for upper case.',
      solution: `using System;
using System.IO;

using (var w = new StreamWriter("employees.txt"))
{
    foreach (string n in new[] { "Asha", "Ravi", "Meena", "John", "Sara" })
        w.WriteLine(n);
}
using (var r = new StreamReader("employees.txt"))
{
    string? line;
    while ((line = r.ReadLine()) != null)
        Console.WriteLine(line.ToUpperInvariant());
}
File.Delete("employees.txt");`,
    },
    {
      task: 'Write a simple logger: Log(string message) appends "[INFO] message" to app.log. Log three messages and print the file.',
      hint: 'new StreamWriter("app.log", append: true) inside Log.',
      solution: `using System;
using System.IO;

File.Delete("app.log");
Log("App started");
Log("User logged in");
Log("App stopped");
Console.Write(File.ReadAllText("app.log"));
File.Delete("app.log");

static void Log(string message)
{
    using var w = new StreamWriter("app.log", append: true);
    w.WriteLine("[INFO] " + message);
}
// [INFO] App started
// [INFO] User logged in
// [INFO] App stopped`,
    },
    {
      task: 'Read marks.csv (Name,Marks) and write only students with marks >= 60 into passed.csv.',
      hint: 'Open a StreamReader and a StreamWriter at the same time.',
      solution: `using System;
using System.IO;

File.WriteAllLines("marks.csv", new[] { "Asha,85", "Ravi,45", "Meena,91", "John,59" });

using (var r = new StreamReader("marks.csv"))
using (var w = new StreamWriter("passed.csv"))
{
    string? line;
    while ((line = r.ReadLine()) != null)
    {
        if (int.Parse(line.Split(',')[1]) >= 60)
            w.WriteLine(line);
    }
}
Console.Write(File.ReadAllText("passed.csv"));
// Asha,85
// Meena,91
File.Delete("marks.csv");
File.Delete("passed.csv");`,
    },
    {
      task: 'Save a product (int Id, string Name, decimal Price, int Stock) with BinaryWriter and read it back with BinaryReader.',
      hint: 'bw.Write(decimal) / br.ReadDecimal(). Print the price with ToString(CultureInfo.InvariantCulture).',
      solution: `using System;
using System.Globalization;
using System.IO;

using (var bw = new BinaryWriter(File.Open("product.bin", FileMode.Create)))
{
    bw.Write(7);
    bw.Write("Keyboard");
    bw.Write(1499.50m);
    bw.Write(25);
}
using (var br = new BinaryReader(File.Open("product.bin", FileMode.Open)))
{
    int id = br.ReadInt32();
    string name = br.ReadString();
    decimal price = br.ReadDecimal();
    int stock = br.ReadInt32();
    Console.WriteLine($"{id} {name} {price.ToString(CultureInfo.InvariantCulture)} stock {stock}");
}
// 7 Keyboard 1499.50 stock 25
File.Delete("product.bin");`,
    },
    {
      task: 'Count how many lines in a file contain the word "error" (ignore case) by reading it line by line.',
      hint: 'line.Contains("error", StringComparison.OrdinalIgnoreCase).',
      solution: `using System;
using System.IO;

File.WriteAllLines("server.log", new[] { "Start", "ERROR: disk", "ok", "Error: timeout" });
int count = 0;
using (var r = new StreamReader("server.log"))
{
    string? line;
    while ((line = r.ReadLine()) != null)
        if (line.Contains("error", StringComparison.OrdinalIgnoreCase)) count++;
}
Console.WriteLine("Error lines: " + count);   // Error lines: 2
File.Delete("server.log");`,
    },
  ],
  quiz: [
    { question: 'Which class reads text from a file line by line?', options: ['BinaryReader', 'StreamReader', 'FileInfo', 'StreamWriter'], answer: 1, explanation: 'StreamReader.ReadLine reads one line of text at a time.' },
    { question: 'What does StreamReader.ReadLine() return when the end of file is reached?', options: ['null', 'An empty string', '-1', 'It throws EndOfStreamException'], answer: 0, explanation: 'ReadLine returns null at the end of the stream.' },
    { question: 'How do you make StreamWriter add to an existing file?', options: ['Call Seek(0)', 'Use FileMode.Truncate', 'Pass append: true to the constructor', 'Call WriteLine twice'], answer: 2, explanation: 'new StreamWriter(path, append: true) opens the file positioned at the end.' },
    { question: 'You wrote int, string, bool with BinaryWriter. How must you read them?', options: ['In any order', 'ReadString, ReadInt32, ReadBoolean', 'Only with ReadToEnd', 'ReadInt32, ReadString, ReadBoolean'], answer: 3, explanation: 'Binary data has no separators; read the same types in the same order.' },
    { question: 'What forces buffered StreamWriter data to be written to the stream?', options: ['Flush() or Dispose()', 'Peek()', 'Position = 0', 'ReadLine()'], answer: 0, explanation: 'Flush writes the buffer; Dispose (end of using) flushes and closes.' },
  ],
};
