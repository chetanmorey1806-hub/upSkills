export default {
  lesson: 'day-033-file-handling-file-directory-filestream',
  minutes: 16,
  intro: 'Practise file handling with System.IO: the File and Directory classes, Path helpers, FileStream and FileMode.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Which namespace must you import to use `File`, `Directory`, `Path` and `FileStream`? Write the full using line.',
      example: { title: 'using a namespace', code: 'using System.Text;   // for StringBuilder' },
      accept: ['using System.IO;', 'using System.IO'],
      caseSensitive: true,
      explain: 'All file and folder classes live in **System.IO**. (.NET 6+ console projects include it through implicit usings, but you should know where they come from.)',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Writing, appending and reading a text file with the `File` class. Assume `marks.txt` does not exist yet. What does this print?',
      example: { title: 'one-line file helpers', code: 'File.WriteAllText("a.txt", "Hello");  // creates or overwrites\nstring s = File.ReadAllText("a.txt");  // "Hello"' },
      code: `string path = "marks.txt";
Console.WriteLine(File.Exists(path));
File.WriteAllText(path, "Asha,80\\n");
File.AppendAllText(path, "Ravi,72\\n");
File.AppendAllText(path, "Meena,91\\n");
string[] lines = File.ReadAllLines(path);
Console.WriteLine(File.Exists(path));
Console.WriteLine(lines.Length);
Console.WriteLine(lines[2].Split(',')[0]);
File.WriteAllText(path, "Reset\\n");
Console.WriteLine(File.ReadAllLines(path).Length);`,
      expected: `False
True
3
Meena
1`,
      explain: '`WriteAllText` creates the file (or **overwrites** it), `AppendAllText` adds to the end. `ReadAllLines` returns one string per line (3). The final `WriteAllText` replaces everything, leaving 1 line. Forgetting that WriteAllText overwrites is a common data-loss bug.',
    },
    {
      type: 'output',
      mins: 2,
      q: '`Path` helpers work on strings only (no disk access). What does this print?',
      example: { title: 'Path methods', code: 'Path.GetFileName("C:/docs/cv.docx")   // cv.docx' },
      code: `string file = "C:/data/reports/sales-2024.xlsx";
Console.WriteLine(Path.GetFileName(file));
Console.WriteLine(Path.GetFileNameWithoutExtension(file));
Console.WriteLine(Path.GetExtension(file));
Console.WriteLine(Path.ChangeExtension("notes.txt", ".md"));`,
      expected: `sales-2024.xlsx
sales-2024
.xlsx
notes.md`,
      explain: '`GetExtension` includes the dot. `ChangeExtension` returns a new path string; it does not rename any file on disk. Use `Path.Combine` to build paths instead of joining strings with "\\\\" by hand.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'You open `new FileStream("log.txt", FileMode.CreateNew)` but `log.txt` already exists. What happens?',
      options: ['The file is overwritten', 'Data is appended at the end', 'An IOException is thrown', 'A new file log(1).txt is created'],
      answer: 2,
      explain: '`CreateNew` demands that the file does **not** exist, otherwise it throws IOException. `Create` overwrites, `Append` opens (or creates) and moves to the end, `Open` requires an existing file, `OpenOrCreate` does either.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Bytes with FileStream: what does this print?',
      example: { title: 'writing bytes', code: 'using var fs = new FileStream("b.bin", FileMode.Create);\nfs.WriteByte(72);   // \'H\'' },
      code: `using (var fs = new FileStream("data.bin", FileMode.Create))
{
    byte[] bytes = { 65, 66, 67, 68 };
    fs.Write(bytes, 0, bytes.Length);
    Console.WriteLine(fs.Length);
    fs.Seek(1, SeekOrigin.Begin);
    Console.WriteLine(fs.ReadByte());
    Console.WriteLine((char)fs.ReadByte());
}`,
      expected: `4
66
C`,
      explain: 'After writing 4 bytes the stream length is 4. `Seek(1, Begin)` moves the position to index 1, so `ReadByte` returns 66 and moves on; the next byte is 67, which cast to char is `C`. The `using` block closes the file automatically.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about `File`/`Directory` are TRUE? (choose all that apply)',
      options: [
        'Directory.CreateDirectory does not fail if the folder already exists',
        'File.Copy(src, dest) throws if dest exists, unless you pass overwrite: true',
        'Directory.GetFiles(folder, "*.txt") returns the matching file paths',
        'File.Delete throws if the file does not exist',
        'You should wrap file operations in try/catch because files can be locked or missing',
      ],
      answers: [0, 1, 2, 4],
      explain: '`File.Delete` on a missing file simply does nothing (no exception). Everything else is true: CreateDirectory is idempotent, Copy needs `overwrite: true` to replace, GetFiles supports search patterns, and IO can fail at any time (permissions, locks).',
    },
  ],
};
