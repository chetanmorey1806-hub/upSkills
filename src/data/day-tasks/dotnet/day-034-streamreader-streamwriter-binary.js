export default {
  lesson: 'day-034-streamreader-streamwriter-binary',
  minutes: 18,
  intro: 'Practise StreamWriter/StreamReader for text files (write, append, read line by line) and BinaryWriter/BinaryReader for binary records.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Writing then reading line by line. What does this print?',
      example: { title: 'reading until the end', code: 'using var reader = new StreamReader("a.txt");\nstring? line;\nwhile ((line = reader.ReadLine()) != null)\n    Console.WriteLine(line);' },
      code: `using (var writer = new StreamWriter("students.txt"))
{
    writer.WriteLine("101,Asha");
    writer.Write("102,");
    writer.WriteLine("Ravi");
    writer.WriteLine("103,Meena");
}

int count = 0;
using (var reader = new StreamReader("students.txt"))
{
    string line;
    while ((line = reader.ReadLine()) != null)
    {
        count++;
        Console.WriteLine(line.Split(',')[1]);
    }
}
Console.WriteLine("Total: " + count);`,
      expected: `Asha
Ravi
Meena
Total: 3`,
      explain: '`Write` does not end the line, so "102," and "Ravi" form one line. `ReadLine` returns **null** at the end of the file, which stops the loop. The `using` blocks flush and close the files.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line that opens `log.txt` for **appending** (keep the old content, add to the end):\n`using var writer = new StreamWriter("log.txt", ______);`',
      example: { title: 'constructor overloads', code: 'new StreamWriter(path)          // overwrite\nnew StreamWriter(path, ????)    // append' },
      accept: ['true', 'append: true'],
      acceptRegex: ['^(append\\s*:\\s*)?true$'],
      explain: 'The second parameter `append: true` opens the file in append mode. Without it, StreamWriter **overwrites** the file. Remember to dispose (`using`) so the buffer is flushed to disk.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A program writes with `var w = new StreamWriter("out.txt"); w.WriteLine("Hello");` and then ends **without** calling `Close`/`Dispose`/`Flush`. What is the most likely result?',
      options: ['out.txt contains Hello', 'out.txt may be empty because the text was still in the memory buffer', 'Compile error', 'An exception is thrown'],
      answer: 1,
      explain: 'StreamWriter **buffers** data in memory and writes to disk when the buffer fills, on `Flush()`, or on `Dispose()`. Always use `using` (or set `AutoFlush = true`) so data is not lost.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'BinaryWriter stores data in binary form. What does this print? (an `int` takes 4 bytes, a `double` 8 bytes, and a short string takes 1 length byte + 1 byte per ASCII character)',
      example: { title: 'binary write/read', code: 'bw.Write(42);        // 4 bytes\nint n = br.ReadInt32(); // read back in the SAME order' },
      code: `using var ms = new MemoryStream();
using var bw = new BinaryWriter(ms);
bw.Write(101);
bw.Write("Asha");
bw.Write(85.5);
bw.Flush();
Console.WriteLine(ms.Length);

ms.Position = 0;
using var br = new BinaryReader(ms);
int roll = br.ReadInt32();
string name = br.ReadString();
double marks = br.ReadDouble();
Console.WriteLine($"{roll} {name} {marks}");`,
      expected: `17
101 Asha 85.5`,
      explain: '4 bytes (int) + 1 + 4 bytes (length-prefixed "Asha") + 8 bytes (double) = 17. Binary data has no separators, so you must read with the matching methods **in the same order** you wrote; reading a double first would give garbage.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`Peek` and `ReadToEnd`: what does this print?',
      example: { title: 'Peek', code: 'reader.Peek()   // next character code without consuming it, or -1 at the end' },
      code: `File.WriteAllText("menu.txt", "Idli\\nDosa\\nVada");
using var r = new StreamReader("menu.txt");
Console.WriteLine((char)r.Peek());
Console.WriteLine(r.ReadLine());
string rest = r.ReadToEnd();
Console.WriteLine(rest.Replace("\\n", " + "));
Console.WriteLine(r.Peek());`,
      expected: `I
Idli
Dosa + Vada
-1`,
      explain: '`Peek` looks at the next character without moving forward, so ReadLine still returns "Idli". `ReadToEnd` reads everything left ("Dosa\\nVada"). At the end of the stream `Peek` returns **-1**.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'When should you choose **BinaryWriter** instead of StreamWriter? (choose all that apply)',
      options: [
        'When you want compact files with numbers stored in their native binary form',
        'When people must open the file in Notepad and read it',
        'When you write fixed-structure records and read them back with the matching ReadXxx methods',
        'When you need a CSV file for Excel',
      ],
      answers: [0, 2],
      explain: 'Binary files are compact and fast to parse but not human-readable. For files that people or other tools (Notepad, Excel) must read, use text formats via StreamWriter: CSV, JSON, plain text.',
    },
  ],
};
