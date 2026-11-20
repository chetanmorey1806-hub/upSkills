export default {
  lesson: 'day-20-grpc-aspnet-core-proto-streaming-transcoding',
  minutes: 25,
  intro: 'Read and write .proto contracts, pick the right gRPC call type, handle gRPC status codes in a C# client and expose gRPC methods as JSON with transcoding.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'A cricket app sends **one** request for a match and then receives a score update after every ball until the match ends. Which gRPC call type fits?',
      options: ['Unary', 'Server streaming', 'Client streaming', 'Bidirectional streaming'],
      answer: 1,
      explain: 'One request, many responses = **server streaming** (`returns (stream ScoreUpdate)`). Client streaming is the opposite (many requests, one reply, e.g. bulk upload). Bidirectional is for chat-like flows where both sides keep sending.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the declaration so the client can upload **many** MarkEntry messages and get **one** UploadSummary back:
\`\`\`proto
rpc UploadMarks (______ MarkEntry) returns (UploadSummary);
\`\`\``,
      example: { title: 'Server streaming for comparison', code: 'rpc ListStudents (ListStudentsRequest) returns (stream StudentReply);' },
      accept: ['stream'],
      caseSensitive: true,
      explain: 'The `stream` keyword goes on the side that sends many messages. On the request side it makes a **client-streaming** method: the client writes with `RequestStream.WriteAsync`, calls `CompleteAsync()`, and then awaits the single response.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A Protobuf field tag is `(field number << 3) | wire type`, where wire type 0 = varint and 2 = length-delimited (strings, nested messages). What does this print?',
      example: { title: 'Shifting left by 3 multiplies by 8', code: 'Console.WriteLine(5 << 3);              // 40\nConsole.WriteLine(26.ToString("X2"));   // 1A (hex, 2 digits)' },
      code: `int Tag(int field, int wireType) => field << 3 | wireType;

Console.WriteLine(Tag(1, 0).ToString("X2"));   // int32 id = 1;
Console.WriteLine(Tag(2, 2).ToString("X2"));   // string name = 2;
Console.WriteLine(Tag(3, 2).ToString("X2"));   // string branch = 3;`,
      expected: `08
12
1A`,
      explain: '1 << 3 = 8 -> 0x08. 2 << 3 = 16, OR 2 = 18 -> 0x12. 3 << 3 = 24, OR 2 = 26 -> 0x1A. Only these small numbers travel on the wire, never the field names, which is why you must never change a field\'s number or reuse a deleted one.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The server\'s `GetStudent` returns students 1 (Asha), 2 (Rahul) and 3 (Meena), and for any other id throws `new RpcException(new Status(StatusCode.NotFound, $"Student {id} not found"))`. What does this client print?',
      example: { title: 'Catching a specific gRPC status', code: 'catch (RpcException ex) when (ex.StatusCode == StatusCode.Unavailable)\n{\n    Console.WriteLine("Server down, try later");\n}' },
      code: `foreach (int id in new[] { 2, 7 })
{
    try
    {
        var s = await client.GetStudentAsync(new GetStudentRequest { Id = id });
        Console.WriteLine($"OK {s.Name}");
    }
    catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
    {
        Console.WriteLine($"{ex.StatusCode}: {ex.Status.Detail}");
    }
}`,
      expected: `OK Rahul
NotFound: Student 7 not found`,
      explain: 'Id 2 exists, so the unary call returns Rahul. Id 7 makes the server throw RpcException; the status code and detail travel to the client in the response trailers and are thrown again there as RpcException. StatusCode prints as its enum name, NotFound.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Clients already use this message: `message StudentReply { int32 id = 1; string name = 2; double cgpa = 3; }`. Which changes are **safe** (old clients keep working)? Select all that apply.',
      options: [
        'Add `string email = 4;`',
        'Change `double cgpa = 3;` to `string cgpa = 3;`',
        'Rename `name` to `full_name` but keep number 2',
        'Remove cgpa and later reuse number 3 for `int32 rank = 3;`',
        'Remove cgpa and add `reserved 3;`',
      ],
      answers: [0, 2, 4],
      explain: 'Adding new numbers is safe (old clients ignore unknown fields). Renaming is wire-safe because names are not sent (only generated code changes). Changing a type or reusing a number makes old clients decode wrong data. When removing a field, reserve its number.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `You annotated the .proto with \`option (google.api.http) = { get: "/v1/students/{id}" };\` and installed Microsoft.AspNetCore.Grpc.JsonTranscoding. Complete the registration so the methods also answer JSON HTTP requests:
\`\`\`csharp
builder.Services.AddGrpc().______();
\`\`\``,
      example: { title: 'Normal gRPC registration', code: 'builder.Services.AddGrpc();\napp.MapGrpcService<StudentGrpcService>();' },
      accept: ['AddJsonTranscoding', 'AddJsonTranscoding()'],
      caseSensitive: true,
      explain: '`AddJsonTranscoding()` reads the google.api.http annotations and maps routes like GET /v1/students/1 to the gRPC method, converting JSON to Protobuf and back. gRPC clients keep working on the same service.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why should a C# client reuse one `GrpcChannel` (or use `AddGrpcClient`) instead of creating a new channel for every call?',
      options: [
        'A channel can only be used once',
        'Channels hold HTTP/2 connections, which are expensive to create; reuse avoids extra latency and socket exhaustion',
        'Creating channels requires administrator rights',
        'Reusing a channel turns on JSON transcoding',
      ],
      answer: 1,
      explain: 'A channel manages long-lived HTTP/2 connections that multiplex many calls. Creating one per call repeats TCP and TLS handshakes. Reuse one channel per server address, or let the gRPC client factory manage it.',
    },
  ],
};
