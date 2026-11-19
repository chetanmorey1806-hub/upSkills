export default {
  lesson: 'extra-53-file-download-background-webhooks',
  minutes: 30,
  intro: 'Serve file downloads, accept uploads safely, hand long work to a background queue and verify incoming webhooks.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Return a CSV report that the browser **downloads** as \`sales-2024.csv\`:
\`return File(bytes, "______", "sales-2024.csv");\``,
      example: { title: 'PDF download', code: 'return File(pdfBytes, "application/pdf", "invoice-501.pdf");' },
      accept: ['text/csv'],
      explain: 'The second argument is the content type (`text/csv`); passing a file name adds `Content-Disposition: attachment; filename=sales-2024.csv`, so the browser saves it instead of displaying it. For unknown binary data use `application/octet-stream`.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Students upload assignment PDFs through `IFormFile`. Which checks are important? Select all that apply.',
      options: ['Limit the size (e.g. `[RequestSizeLimit]` and check `file.Length`)', 'Allow only expected extensions/content (e.g. `.pdf`) and verify the file signature', 'Save with a server-generated name (e.g. a GUID) instead of the user\'s file name', 'Store uploads inside `wwwroot` so they can be executed', 'Trust the `ContentType` header sent by the browser completely'],
      answers: [0, 1, 2],
      explain: 'Limit size, whitelist types and check magic bytes, and generate the stored name to prevent path traversal and overwrites. Keep uploads outside `wwwroot` (or in blob storage) and never trust the client-supplied content type alone.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'An API queues report jobs for a background worker using a `Channel<T>`. What does this program print?',
      example: { title: 'producer / consumer', code: `await channel.Writer.WriteAsync(job);          // API (producer)
await foreach (var j in channel.Reader.ReadAllAsync(token)) { ... }  // worker (consumer)` },
      code: `using System.Threading.Channels;

var channel = Channel.CreateUnbounded<int>();

foreach (var reportId in new[] { 101, 102, 103 })
{
    await channel.Writer.WriteAsync(reportId);
    Console.WriteLine($"202 Accepted: report {reportId}");
}
channel.Writer.Complete();

await foreach (var id in channel.Reader.ReadAllAsync())
    Console.WriteLine($"Generated report {id}");
Console.WriteLine("Queue empty");`,
      expected: `202 Accepted: report 101
202 Accepted: report 102
202 Accepted: report 103
Generated report 101
Generated report 102
Generated report 103
Queue empty`,
      explain: 'The API writes jobs and immediately answers **202 Accepted** instead of making the user wait. The consumer reads them in FIFO order. `Writer.Complete()` tells `ReadAllAsync` that no more items will come, so the loop ends. In a real app the reader runs inside a BackgroundService.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A payment gateway signs webhook bodies with HMAC-SHA256 using the shared secret `whsec_demo`. What does this verification code print?',
      example: { title: 'why sign webhooks', text: 'Anyone can POST to your webhook URL. Recomputing the signature with the shared secret proves the request really came from the gateway and the body was not changed.' },
      code: `using System.Security.Cryptography;
using System.Text;

string body = """{"event":"payment.captured","orderId":501,"amount":1499}""";
byte[] key = Encoding.UTF8.GetBytes("whsec_demo");

string Sign(string payload) =>
    Convert.ToHexString(HMACSHA256.HashData(key, Encoding.UTF8.GetBytes(payload)));

string received = Sign(body);                 // header sent by the gateway
string tampered = body.Replace("1499", "1");  // attacker changes the amount

Console.WriteLine(received[..16]);
Console.WriteLine(Sign(body) == received);
Console.WriteLine(Sign(tampered) == received);`,
      expected: `258C5ABE0A26AD8C
True
False`,
      explain: '`Convert.ToHexString` gives uppercase hex; the first 16 characters of the HMAC are `258C5ABE0A26AD8C`. Recomputing over the same body matches, but any change to the body (amount 1499 → 1) gives a completely different signature, so the webhook is rejected. In production compare with `CryptographicOperations.FixedTimeEquals`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'The gateway may deliver the same webhook **twice** (retries). How should your endpoint handle it?',
      options: ['Process it again; duplicates are harmless', 'Make it idempotent: store the event id and ignore events already processed, still returning 200', 'Return 500 for duplicates so the gateway stops', 'Disable retries in the gateway'],
      answer: 1,
      explain: 'Webhooks are "at least once": retries happen when your response is slow or fails. Record processed event ids (unique constraint) so a repeat does not mark an order paid twice, and reply 2xx quickly (queue heavy work).',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Stream a large existing file from disk without loading it fully into memory:
\`var stream = System.IO.File.OpenRead(path);\`
\`return File(______, "application/zip", "backup.zip");\``,
      example: { title: 'physical file shortcut', code: 'return PhysicalFile(fullPath, "application/pdf", "report.pdf");' },
      accept: ['stream'],
      caseSensitive: true,
      explain: 'Passing a `Stream` returns a `FileStreamResult`: ASP.NET Core copies it to the response in chunks and disposes it afterwards. Reading the whole file into a `byte[]` first wastes memory for large files.',
    },
  ],
};
