const ex1 = `using System;
using System.IO;

string path = "students.txt";

// Create (or overwrite) the file with two lines
File.WriteAllText(path, "Asha,85\\nRavi,72\\n");
Console.WriteLine("File created: " + File.Exists(path));

// Add one more line at the end
File.AppendAllText(path, "Meena,91\\n");

// Read the whole file as one string
string content = File.ReadAllText(path);
Console.Write(content);

// Read the file as an array of lines
string[] lines = File.ReadAllLines(path);
Console.WriteLine("Total lines: " + lines.Length);
foreach (string line in lines)
{
    string[] parts = line.Split(',');
    Console.WriteLine($"{parts[0]} scored {parts[1]}");
}

File.Delete(path);
Console.WriteLine("After delete exists: " + File.Exists(path));`;

const ex2 = `using System;
using System.IO;

string root = "SchoolData";
if (Directory.Exists(root))
    Directory.Delete(root, true);

// CreateDirectory also creates missing parent folders
Directory.CreateDirectory(Path.Combine(root, "ClassA"));
Directory.CreateDirectory(Path.Combine(root, "ClassB"));

File.WriteAllText(Path.Combine(root, "ClassA", "roll.txt"), "1,Asha");
File.WriteAllText(Path.Combine(root, "ClassA", "notes.txt"), "Exam on Monday");
File.WriteAllText(Path.Combine(root, "ClassB", "roll.txt"), "1,Ravi\\n2,Meena");

string[] dirs = Directory.GetDirectories(root);
Array.Sort(dirs);   // the operating system does not guarantee an order
foreach (string d in dirs)
{
    string[] files = Directory.GetFiles(d, "*.txt");
    Console.WriteLine($"{Path.GetFileName(d)}: {files.Length} file(s)");
}

string[] all = Directory.GetFiles(root, "*.txt", SearchOption.AllDirectories);
Console.WriteLine("All .txt files: " + all.Length);

var info = new FileInfo(Path.Combine(root, "ClassB", "roll.txt"));
Console.WriteLine($"{info.Name} size: {info.Length} bytes, extension: {info.Extension}");

Directory.Delete(root, recursive: true);
Console.WriteLine("Deleted: " + !Directory.Exists(root));`;

const ex3 = `using System;
using System.IO;
using System.Text;

string path = "log.dat";

// 1. Write bytes with FileStream
using (FileStream fs = new FileStream(path, FileMode.Create, FileAccess.Write))
{
    byte[] data = Encoding.UTF8.GetBytes("Hello FileStream");
    fs.Write(data, 0, data.Length);
    Console.WriteLine("Bytes written: " + data.Length);
    Console.WriteLine("Position after write: " + fs.Position);
}   // Dispose() closes the file here

// 2. Read bytes back
using (FileStream fs = new FileStream(path, FileMode.Open, FileAccess.Read))
{
    Console.WriteLine("File length: " + fs.Length);
    byte[] buffer = new byte[fs.Length];
    int read = fs.Read(buffer, 0, buffer.Length);
    Console.WriteLine("Bytes read: " + read);
    Console.WriteLine("Text: " + Encoding.UTF8.GetString(buffer));

    // 3. Jump to a position with Seek
    fs.Seek(6, SeekOrigin.Begin);
    int b = fs.ReadByte();
    Console.WriteLine("Byte at position 6: " + b + " = " + (char)b);
}

// 4. Append mode adds to the end
using (FileStream fs = new FileStream(path, FileMode.Append))
{
    byte[] more = Encoding.UTF8.GetBytes("!!");
    fs.Write(more, 0, more.Length);
}

Console.WriteLine("Final content: " + File.ReadAllText(path));
File.Delete(path);`;

const ex4 = `using System;
using System.IO;

// 1. Reading a file that does not exist
try
{
    string text = File.ReadAllText("missing.txt");
}
catch (FileNotFoundException ex)
{
    Console.WriteLine("Not found: " + Path.GetFileName(ex.FileName));
}

// 2. Copy and Move
File.WriteAllText("report.txt", "Q1 sales: 500");
File.Copy("report.txt", "report_backup.txt", overwrite: true);
File.Move("report.txt", "report_final.txt", overwrite: true);

Console.WriteLine("report.txt exists: " + File.Exists("report.txt"));
Console.WriteLine("backup exists: " + File.Exists("report_backup.txt"));
Console.WriteLine("final: " + File.ReadAllText("report_final.txt"));

// 3. FileMode.CreateNew fails when the file already exists
try
{
    using var fs = new FileStream("report_final.txt", FileMode.CreateNew);
    Console.WriteLine("Created");
}
catch (IOException)
{
    Console.WriteLine("CreateNew failed: file already exists");
}

File.Delete("report_backup.txt");
File.Delete("report_final.txt");
Console.WriteLine("Cleanup done");`;

const ex5 = `using System;
using System.IO;

string folder = "Data";
string file = Path.Combine(folder, "students.txt");

Directory.CreateDirectory(folder);       // safe even if it already exists
File.WriteAllText(file, "");             // start empty

AddStudent(file, "Asha");
AddStudent(file, "Ravi");
AddStudent(file, "Meena");

Console.WriteLine("Registered students:");
string[] names = File.ReadAllLines(file);
for (int i = 0; i < names.Length; i++)
    Console.WriteLine($"{i + 1}. {names[i]}");

Console.WriteLine("Folder name: " + Path.GetFileName(folder));
Console.WriteLine("File name without extension: " + Path.GetFileNameWithoutExtension(file));
Console.WriteLine("Has .txt extension: " + (Path.GetExtension(file) == ".txt"));

Directory.Delete(folder, true);

static void AddStudent(string path, string name)
{
    File.AppendAllLines(path, new[] { name });
    Console.WriteLine("Saved " + name);
}`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8 or .NET 10 (LTS), click Create`,
  'Replace all code in Program.cs with the code below',
  'Press Ctrl+F5 to run. Files are created in the working folder bin\\Debug\\net8.0 (or net10.0); comment out the Delete line and open that folder via right-click project > Open Folder in File Explorer to see them',
];

export default {
  id: 'day-033-file-handling-file-directory-filestream',
  title: 'File Handling: File, Directory, FileStream',
  module: 'Module 3: Advanced C# Programming',
  day: 33,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Programs need to save data that survives after they close. Learn the System.IO namespace: the static File class for quick read/write/append/copy/move/delete, Directory for folders, Path for building file paths safely, FileInfo/DirectoryInfo, and FileStream for byte-level access with FileMode, FileAccess and Seek. Practical: create and read a text file.',
  objectives: [
    'Create, read, append, copy, move and delete text files with the File class',
    'Create, list and delete folders with Directory and build paths with Path.Combine',
    'Use FileInfo to read file details such as size and extension',
    'Read and write bytes with FileStream using FileMode, FileAccess, Position and Seek',
    'Handle common IO exceptions and always close files with using',
  ],
  theory: [
    {
      heading: 'System.IO and why file handling matters',
      content: 'Variables live in RAM and disappear when the program ends. To keep data (student records, logs, reports, settings) you write it to a file on disk. All file classes live in the System.IO namespace (included automatically by implicit usings in .NET 6+ console apps). A relative path such as "students.txt" is resolved from the current working directory - when you run from Visual Studio this is the bin\\Debug\\net8.0 folder.',
      points: [
        'File / Directory - static helper classes, one-line operations',
        'FileInfo / DirectoryInfo - objects describing one file or folder (useful when you call many operations on the same item)',
        'Path - builds and inspects path strings (no disk access)',
        'FileStream - low-level stream of bytes; StreamReader/StreamWriter (Day 34) sit on top of it',
      ],
      tip: 'Analogy: File is like a quick photocopy machine (one button, done); FileStream is like opening the cabinet drawer yourself and reading page by page.',
    },
    {
      heading: 'The File class',
      content: 'File has static methods that open, do the work and close the file in a single call. They are perfect for small files. WriteAllText creates the file or overwrites it; AppendAllText creates it if missing and adds at the end; ReadAllText returns the whole content; ReadAllLines returns a string[] (one element per line).',
      syntax: `File.WriteAllText("a.txt", "Hello");          // create / overwrite
File.AppendAllText("a.txt", " World\\n");       // add to end
string all = File.ReadAllText("a.txt");        // whole file
string[] lines = File.ReadAllLines("a.txt");   // one item per line
File.WriteAllLines("b.txt", new[] { "x", "y" });
bool exists = File.Exists("a.txt");
File.Copy("a.txt", "c.txt", overwrite: true);
File.Move("c.txt", "d.txt");                   // also used to rename
File.Delete("d.txt");                          // no error if missing
byte[] bytes = File.ReadAllBytes("photo.jpg");`,
      points: [
        'Every File method has an async version: ReadAllTextAsync, WriteAllTextAsync (Day 38)',
        'ReadAllText loads the whole file into memory - fine for KBs, not for a 2 GB log',
      ],
    },
    {
      heading: 'Directory, DirectoryInfo and Path',
      content: 'Directory works with folders: CreateDirectory (creates all missing parent folders, no error if it exists), Exists, GetFiles (optionally with a search pattern like "*.txt" and SearchOption.AllDirectories), GetDirectories, Delete (pass true to delete non-empty folders) and Move. Never join paths with + "\\\\" because Windows uses \\ and Linux/macOS use /. Path.Combine chooses the right separator.',
      syntax: `Directory.CreateDirectory(Path.Combine("Data", "2025"));
string[] txt = Directory.GetFiles("Data", "*.txt", SearchOption.AllDirectories);
string[] subFolders = Directory.GetDirectories("Data");
Directory.Delete("Data", recursive: true);

Path.Combine("Data", "a.txt")          // Data\\a.txt (Windows) or Data/a.txt
Path.GetFileName(@"C:\\Data\\a.txt")       // a.txt
Path.GetFileNameWithoutExtension(...)  // a
Path.GetExtension(...)                 // .txt
Path.GetTempPath(), Path.GetRandomFileName()`,
      tip: 'Use @"C:\\Data\\a.txt" (verbatim string) for Windows paths so you do not need to double every backslash.',
    },
    {
      heading: 'FileInfo and DirectoryInfo',
      content: 'FileInfo represents one file as an object with properties: Name, FullName, Length (size in bytes), Extension, CreationTime, LastWriteTime, Exists, Directory. Methods: CopyTo, MoveTo, Delete, OpenRead, OpenWrite. DirectoryInfo is the same idea for folders, with GetFiles() returning FileInfo[] objects.',
      syntax: `var fi = new FileInfo("students.txt");
if (fi.Exists)
    Console.WriteLine($"{fi.Name} - {fi.Length} bytes - {fi.Extension}");

var di = new DirectoryInfo("Data");
foreach (FileInfo f in di.GetFiles("*.csv"))
    Console.WriteLine(f.Name);`,
    },
    {
      heading: 'FileStream, FileMode and FileAccess',
      content: 'FileStream reads and writes raw bytes and gives full control: where to start (Position, Seek), how to open (FileMode) and what is allowed (FileAccess, FileShare). Text must be converted to bytes with Encoding.UTF8.GetBytes and back with Encoding.UTF8.GetString.',
      points: [
        'FileMode.Create - create new or overwrite existing',
        'FileMode.CreateNew - create new; IOException if it already exists',
        'FileMode.Open - open existing; FileNotFoundException if missing',
        'FileMode.OpenOrCreate - open if exists, otherwise create',
        'FileMode.Append - open (or create) and move to the end; write only',
        'FileMode.Truncate - open existing and empty it',
        'FileAccess.Read / Write / ReadWrite - what the stream may do',
        'FileShare.Read etc. - what other programs may do while you hold the file open',
      ],
      syntax: `using (var fs = new FileStream("log.dat", FileMode.Create, FileAccess.Write))
{
    byte[] data = Encoding.UTF8.GetBytes("Hello");
    fs.Write(data, 0, data.Length);
}
using (var fs = new FileStream("log.dat", FileMode.Open, FileAccess.Read))
{
    fs.Seek(1, SeekOrigin.Begin);      // jump to byte 1
    int b = fs.ReadByte();             // 'e' = 101, returns -1 at end
}`,
    },
    {
      heading: 'Closing files, using, and IO exceptions',
      content: 'An open file is an operating system resource; while it is open other programs (and your own code) may be blocked from using it. Streams implement IDisposable, so always wrap them in a using block or using declaration - Dispose() flushes and closes the file even if an exception happens. The File.* helper methods close the file for you.',
      points: [
        'FileNotFoundException - file is missing (FileMode.Open, ReadAllText)',
        'DirectoryNotFoundException - part of the path does not exist',
        'IOException - general IO error: file in use by another process, CreateNew on existing file, disk full',
        'UnauthorizedAccessException - no permission (e.g. writing into C:\\Windows) or the path is a folder',
        'PathTooLongException, NotSupportedException - invalid path',
        'Catch specific exceptions first: FileNotFoundException and DirectoryNotFoundException derive from IOException',
      ],
      tip: 'Checking File.Exists before opening is good for user messages, but the file can still disappear between the check and the open, so keep the try/catch as well.',
    },
  ],
  examples: [
    {
      title: 'Create and read a text file (File class)',
      scenario: 'Save student names and marks to students.txt, append another student, then read the file back both as one string and line by line.',
      steps: steps('FileBasics'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `File created: True
Asha,85
Ravi,72
Meena,91
Total lines: 3
Asha scored 85
Ravi scored 72
Meena scored 91
After delete exists: False`,
      explanation: 'WriteAllText creates the file with two lines, AppendAllText adds the third. ReadAllText returns all text including newlines, so Console.Write prints three lines. ReadAllLines splits on line breaks and ignores the final trailing newline, giving 3 elements; Split(\',\') separates name and marks. Delete removes the file so Exists returns False.',
    },
    {
      title: 'Working with folders: Directory, Path and FileInfo',
      scenario: 'Create a SchoolData folder with two class sub-folders and some files, then list and count files per folder and show details of one file.',
      steps: steps('DirectoryDemo'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `ClassA: 2 file(s)
ClassB: 1 file(s)
All .txt files: 3
roll.txt size: 14 bytes, extension: .txt
Deleted: True`,
      explanation: 'Path.Combine builds correct paths on every OS. GetDirectories returns full sub-folder paths; we sort them because the OS order is not guaranteed and print only the last part with Path.GetFileName. GetFiles with SearchOption.AllDirectories searches sub-folders too (3 files). "1,Ravi\\n2,Meena" is 6 + 1 + 7 = 14 bytes because WriteAllText uses UTF-8 without a BOM. Directory.Delete(root, recursive: true) removes everything.',
    },
    {
      title: 'Bytes with FileStream: Write, Read, Seek, Append',
      scenario: 'Write a message as bytes, read it back, jump to a specific byte position, then append more bytes.',
      steps: steps('FileStreamDemo'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `Bytes written: 16
Position after write: 16
File length: 16
Bytes read: 16
Text: Hello FileStream
Byte at position 6: 70 = F
Final content: Hello FileStream!!`,
      explanation: '"Hello FileStream" has 16 ASCII characters, so 16 UTF-8 bytes, and the Position moves to 16 after writing. Reading fills a buffer of fs.Length bytes. Seek(6, SeekOrigin.Begin) moves to index 6 (H=0, e=1, l=2, l=3, o=4, space=5, F=6); ReadByte returns 70, the code of \'F\'. FileMode.Append opens the file positioned at the end, so "!!" is added.',
    },
    {
      title: 'Copy, Move, FileMode.CreateNew and IO exceptions',
      scenario: 'Handle a missing file gracefully, back up a report, rename it, and see what happens when you try to create a file that already exists.',
      steps: steps('FileOperations'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `Not found: missing.txt
report.txt exists: False
backup exists: True
final: Q1 sales: 500
CreateNew failed: file already exists`,
      explanation: 'ReadAllText on a missing file throws FileNotFoundException; its FileName property is the full path, so we print only the file name. Copy duplicates the file; Move with overwrite (.NET Core 3.0+) renames it, so report.txt no longer exists. FileMode.CreateNew throws IOException because report_final.txt exists, so "Created" is never printed. Finally both files are deleted and "Cleanup done" prints as the last line.',
    },
    {
      title: 'Mini student register saved to a folder',
      scenario: 'A reusable AddStudent method appends each name to Data/students.txt; the program then prints the register with numbers and shows Path helper methods.',
      steps: steps('StudentRegister'),
      code: ex5,
      csharp: { files: { 'Program.cs': ex5 }, stdin: '' },
      result: `Saved Asha
Saved Ravi
Saved Meena
Registered students:
1. Asha
2. Ravi
3. Meena
Folder name: Data
File name without extension: students
Has .txt extension: True`,
      explanation: 'Directory.CreateDirectory does nothing if the folder already exists, so it is always safe. File.AppendAllLines adds each name followed by a newline. ReadAllLines returns 3 names that a for loop numbers from 1. Path methods only work on the path string: GetFileNameWithoutExtension gives "students" and GetExtension gives ".txt". The folder is deleted at the end so the program can be run again.',
    },
  ],
  interview: [
    { q: 'Which namespace contains file handling classes?', a: 'System.IO (File, Directory, Path, FileInfo, DirectoryInfo, FileStream, StreamReader, StreamWriter, BinaryReader, BinaryWriter).', level: 'Easy' },
    { q: 'Difference between File and FileInfo?', a: 'File has static methods - each call checks security and opens by path, good for one-off operations. FileInfo is an instance representing one file; it caches information and is efficient for many operations on the same file, and exposes properties like Length and Extension.', level: 'Medium' },
    { q: 'What is the difference between File.WriteAllText and File.AppendAllText?', a: 'WriteAllText creates the file or replaces its entire content. AppendAllText creates the file if missing, otherwise adds text to the end.', level: 'Easy' },
    { q: 'Explain FileMode.Create vs FileMode.CreateNew vs FileMode.OpenOrCreate.', a: 'Create: create or overwrite. CreateNew: create, throw IOException if it exists. OpenOrCreate: open existing (without truncating) or create a new one.', level: 'Medium' },
    { q: 'Why should you use Path.Combine instead of string concatenation?', a: 'It inserts the correct separator for the OS (\\ on Windows, / on Linux), avoids double or missing separators, and makes code cross-platform.', level: 'Easy' },
    { q: 'Why wrap a FileStream in a using block?', a: 'FileStream holds an operating system file handle. using calls Dispose at the end (even on exceptions), which flushes buffers and closes the handle so the file is not left locked.', level: 'Medium' },
    { q: 'What does Directory.CreateDirectory do if the folder already exists?', a: 'Nothing - it returns the DirectoryInfo without error. It also creates all missing parent folders in the path.', level: 'Easy' },
    { q: 'What happens with Directory.Delete("Data") if the folder contains files?', a: 'It throws IOException ("directory is not empty"). Use Directory.Delete("Data", true) to delete recursively.', level: 'Medium' },
    { q: 'What is the output? File.WriteAllText("a.txt", "AB"); File.WriteAllText("a.txt", "C"); Console.Write(File.ReadAllText("a.txt"));', a: 'C. WriteAllText overwrites the whole file.', level: 'Easy' },
    { q: 'What does FileStream.ReadByte() return at the end of the file?', a: '-1. That is why it returns int instead of byte - so -1 can signal end of stream.', level: 'Medium' },
    { q: 'Which exceptions are common in file handling?', a: 'FileNotFoundException, DirectoryNotFoundException, IOException (file in use, already exists), UnauthorizedAccessException (no permission), PathTooLongException.', level: 'Easy' },
    { q: 'Is File.ReadAllText suitable for a 3 GB log file?', a: 'No - it loads everything into memory. Use a StreamReader and read line by line (File.ReadLines returns lines lazily).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a text file notes.txt with three lines using File.WriteAllLines, then read it and print each line with its line number.',
      hint: 'WriteAllLines takes a string array; ReadAllLines returns one.',
      solution: `using System;
using System.IO;

File.WriteAllLines("notes.txt", new[] { "Buy books", "Submit assignment", "Revise LINQ" });
string[] lines = File.ReadAllLines("notes.txt");
for (int i = 0; i < lines.Length; i++)
    Console.WriteLine($"{i + 1}: {lines[i]}");
File.Delete("notes.txt");
// 1: Buy books
// 2: Submit assignment
// 3: Revise LINQ`,
    },
    {
      task: 'Ask the user for a file name. If it exists print its content; otherwise print "File not found" (use both File.Exists and a try/catch).',
      hint: 'Console.ReadLine() can return null - use ?? "".',
      solution: `using System;
using System.IO;

Console.Write("File name: ");
string name = Console.ReadLine() ?? "";
if (!File.Exists(name))
{
    Console.WriteLine("File not found");
    return;
}
try
{
    Console.WriteLine(File.ReadAllText(name));
}
catch (IOException ex)
{
    Console.WriteLine("Could not read: " + ex.Message);
}`,
    },
    {
      task: 'Count the words and lines in a text file.',
      hint: 'Split each line on space with StringSplitOptions.RemoveEmptyEntries.',
      solution: `using System;
using System.IO;

File.WriteAllText("essay.txt", "C# is fun\\nFiles are easy to use\\n");
string[] lines = File.ReadAllLines("essay.txt");
int words = 0;
foreach (string line in lines)
    words += line.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
Console.WriteLine($"Lines: {lines.Length}, Words: {words}");
File.Delete("essay.txt");
// Lines: 2, Words: 8`,
    },
    {
      task: 'Create a Backup folder and copy every .txt file from a Data folder into it, printing each copied file name.',
      hint: 'Directory.GetFiles("Data", "*.txt"); destination = Path.Combine("Backup", Path.GetFileName(file)).',
      solution: `using System;
using System.IO;

Directory.CreateDirectory("Data");
File.WriteAllText(Path.Combine("Data", "a.txt"), "A");
File.WriteAllText(Path.Combine("Data", "b.txt"), "B");

Directory.CreateDirectory("Backup");
string[] files = Directory.GetFiles("Data", "*.txt");
Array.Sort(files);
foreach (string file in files)
{
    string dest = Path.Combine("Backup", Path.GetFileName(file));
    File.Copy(file, dest, overwrite: true);
    Console.WriteLine("Copied " + Path.GetFileName(file));
}
Directory.Delete("Data", true);
Directory.Delete("Backup", true);`,
    },
    {
      task: 'Using FileStream, write the bytes 10, 20, 30, 40, 50 to numbers.bin, then read them back and print their sum.',
      hint: 'fs.WriteByte(b) and fs.ReadByte() until it returns -1.',
      solution: `using System;
using System.IO;

using (var fs = new FileStream("numbers.bin", FileMode.Create))
{
    foreach (byte b in new byte[] { 10, 20, 30, 40, 50 })
        fs.WriteByte(b);
}
int sum = 0, value;
using (var fs = new FileStream("numbers.bin", FileMode.Open))
{
    while ((value = fs.ReadByte()) != -1)
        sum += value;
}
Console.WriteLine("Sum: " + sum);   // Sum: 150
File.Delete("numbers.bin");`,
    },
  ],
  quiz: [
    { question: 'Which method creates a file or overwrites it with new text?', options: ['File.AppendAllText', 'File.WriteAllText', 'File.Create only', 'File.ReadAllText'], answer: 1, explanation: 'WriteAllText creates the file or replaces its whole content.' },
    { question: 'Which FileMode throws an IOException if the file already exists?', options: ['Create', 'OpenOrCreate', 'Append', 'CreateNew'], answer: 3, explanation: 'CreateNew requires that the file does not exist.' },
    { question: 'What is the best way to join a folder name and a file name?', options: ['Path.Combine(folder, file)', 'folder + "\\\\" + file', 'string.Concat(folder, file)', 'Directory.Join(folder, file)'], answer: 0, explanation: 'Path.Combine uses the right separator for the operating system.' },
    { question: 'What does FileStream.ReadByte() return at end of file?', options: ['0', 'null', '-1', 'It throws EndOfStreamException'], answer: 2, explanation: 'ReadByte returns -1 when no more bytes are available.' },
    { question: 'Which call deletes a folder that still contains files?', options: ['Directory.Delete("Data")', 'File.Delete("Data")', 'Directory.Remove("Data")', 'Directory.Delete("Data", true)'], answer: 3, explanation: 'The recursive: true overload deletes all contents too.' },
  ],
};
