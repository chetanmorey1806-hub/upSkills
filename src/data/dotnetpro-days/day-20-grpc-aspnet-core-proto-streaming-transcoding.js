const protoCode = `// ===== SchoolGrpc/Protos/school.proto =====
syntax = "proto3";

option csharp_namespace = "SchoolGrpc";

package school.v1;

service StudentService {
  rpc GetStudent   (GetStudentRequest)   returns (StudentReply);          // unary
  rpc ListStudents (ListStudentsRequest) returns (stream StudentReply);   // server streaming
  rpc UploadMarks  (stream MarkEntry)    returns (UploadSummary);         // client streaming
  rpc LiveDoubts   (stream DoubtMessage) returns (stream DoubtMessage);   // bidirectional streaming
}

message GetStudentRequest   { int32 id = 1; }
message ListStudentsRequest { string branch = 1; }

message StudentReply {
  int32  id     = 1;
  string name   = 2;
  string branch = 3;
  double cgpa   = 4;
}

message MarkEntry {
  int32  student_id = 1;     // becomes StudentId in C#
  string subject    = 2;
  int32  marks      = 3;
}

message UploadSummary { int32 count = 1; double average = 2; }
message DoubtMessage  { string from = 1; string text = 2; }

// ===== SchoolGrpc/SchoolGrpc.csproj (created by: dotnet new grpc -n SchoolGrpc) =====
// <ItemGroup>
//   <Protobuf Include="Protos\\school.proto" GrpcServices="Server" />
// </ItemGroup>
// <PackageReference Include="Grpc.AspNetCore" Version="2.*" />

// ===== SchoolGrpc/Services/StudentGrpcService.cs =====
using Grpc.Core;
using SchoolGrpc;

public class StudentGrpcService : StudentService.StudentServiceBase
{
    private static readonly List<StudentReply> Students =
    [
        new() { Id = 1, Name = "Asha",   Branch = "CSE", Cgpa = 8.7 },
        new() { Id = 2, Name = "Rahul",  Branch = "CSE", Cgpa = 7.9 },
        new() { Id = 3, Name = "Meena",  Branch = "ECE", Cgpa = 9.1 },
        new() { Id = 4, Name = "Vikram", Branch = "CSE", Cgpa = 8.2 },
    ];

    // UNARY: one request -> one response
    public override Task<StudentReply> GetStudent(GetStudentRequest request, ServerCallContext context)
    {
        var s = Students.FirstOrDefault(x => x.Id == request.Id)
            ?? throw new RpcException(new Status(StatusCode.NotFound, $"Student {request.Id} not found"));
        return Task.FromResult(s);
    }

    // SERVER STREAMING: one request -> many responses
    public override async Task ListStudents(ListStudentsRequest request,
        IServerStreamWriter<StudentReply> responseStream, ServerCallContext context)
    {
        foreach (var s in Students.Where(x => x.Branch == request.Branch))
        {
            if (context.CancellationToken.IsCancellationRequested) break;   // client left
            await responseStream.WriteAsync(s);
            await Task.Delay(200);                                          // simulate work
        }
    }

    // CLIENT STREAMING: many requests -> one response
    public override async Task<UploadSummary> UploadMarks(
        IAsyncStreamReader<MarkEntry> requestStream, ServerCallContext context)
    {
        int count = 0, total = 0;
        await foreach (var m in requestStream.ReadAllAsync())
        {
            count++;
            total += m.Marks;
        }
        return new UploadSummary { Count = count, Average = count == 0 ? 0 : (double)total / count };
    }

    // BIDIRECTIONAL: both sides stream independently
    public override async Task LiveDoubts(IAsyncStreamReader<DoubtMessage> requestStream,
        IServerStreamWriter<DoubtMessage> responseStream, ServerCallContext context)
    {
        await foreach (var msg in requestStream.ReadAllAsync())
            await responseStream.WriteAsync(new DoubtMessage { From = "Mentor", Text = $"Answer to '{msg.Text}'" });
    }
}

// ===== SchoolGrpc/Program.cs =====
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddGrpc(o => o.EnableDetailedErrors = builder.Environment.IsDevelopment());
var app = builder.Build();
app.MapGrpcService<StudentGrpcService>();
app.MapGet("/", () => "gRPC endpoints need a gRPC client.");
app.Run();`;

const clientCode = `// ===== Create the client =====
// dotnet new console -n SchoolClient
// cd SchoolClient
// dotnet add package Grpc.Net.Client
// dotnet add package Google.Protobuf
// dotnet add package Grpc.Tools
// SchoolClient.csproj:
// <ItemGroup>
//   <Protobuf Include="..\\SchoolGrpc\\Protos\\school.proto" GrpcServices="Client" />
// </ItemGroup>

// ===== SchoolClient/Program.cs =====
using Grpc.Core;
using Grpc.Net.Client;
using SchoolGrpc;

// One channel per server address; reuse it (it holds the HTTP/2 connection)
using var channel = GrpcChannel.ForAddress("https://localhost:7001");
var client = new StudentService.StudentServiceClient(channel);

// 1. Unary call with a deadline
var asha = await client.GetStudentAsync(new GetStudentRequest { Id = 1 },
                                        deadline: DateTime.UtcNow.AddSeconds(5));
Console.WriteLine($"Unary: {asha.Name} ({asha.Branch}) CGPA {asha.Cgpa}");

// 2. Errors arrive as RpcException with a gRPC status code
try
{
    await client.GetStudentAsync(new GetStudentRequest { Id = 99 });
}
catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
{
    Console.WriteLine($"Error: {ex.StatusCode} - {ex.Status.Detail}");
}

// 3. Server streaming: read until the server completes
using var list = client.ListStudents(new ListStudentsRequest { Branch = "CSE" });
await foreach (var s in list.ResponseStream.ReadAllAsync())
    Console.WriteLine($"Stream: {s.Id} {s.Name}");

// 4. Client streaming: write many, then complete, then await the single reply
using var upload = client.UploadMarks();
foreach (var (id, marks) in new[] { (1, 78), (2, 91), (3, 64) })
    await upload.RequestStream.WriteAsync(new MarkEntry { StudentId = id, Subject = "DBMS", Marks = marks });
await upload.RequestStream.CompleteAsync();
UploadSummary summary = await upload;
Console.WriteLine($"Client stream: {summary.Count} marks, average {summary.Average:0.00}");

// 5. Bidirectional streaming
using var chat = client.LiveDoubts();
var reader = Task.Run(async () =>
{
    await foreach (var reply in chat.ResponseStream.ReadAllAsync())
        Console.WriteLine($"Bidi: {reply.From}: {reply.Text}");
});
await chat.RequestStream.WriteAsync(new DoubtMessage { From = "Asha", Text = "What is a JOIN?" });
await chat.RequestStream.CompleteAsync();
await reader;`;

const streamCode = `using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;

using var cts = new CancellationTokenSource();
int received = 0;

// Client side: read the stream message by message (like ResponseStream.ReadAllAsync())
await foreach (var ball in GetLiveScore("IND vs AUS", cts.Token))
{
    received++;
    Console.WriteLine($"client got: {ball}");
    if (ball.Contains("WICKET"))
    {
        Console.WriteLine("client: wicket! closing the stream");
        cts.Cancel();          // in gRPC this cancels the call; the server sees context.CancellationToken
        break;
    }
}
Console.WriteLine($"Messages received: {received}");

// Server side: like  rpc LiveScore (MatchRequest) returns (stream ScoreUpdate);
async IAsyncEnumerable<string> GetLiveScore(string match,
    [EnumeratorCancellation] CancellationToken token)
{
    string[] balls = { "1 run", "4 runs", "dot ball", "WICKET - caught", "6 runs" };
    int over = 12;
    for (int i = 0; i < balls.Length; i++)
    {
        token.ThrowIfCancellationRequested();
        await Task.Delay(50, token);
        yield return $"{match} {over}.{i + 1}: {balls[i]}";
    }
    Console.WriteLine("server: stream completed");
}
`;

const wireCode = `using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;

// message Student { int32 id = 1; string name = 2; }   with id = 150, name = "Asha"
var bytes = new List<byte>();
WriteVarintField(bytes, fieldNumber: 1, value: 150);
WriteStringField(bytes, fieldNumber: 2, value: "Asha");

string json = JsonSerializer.Serialize(new { id = 150, name = "Asha" });

Console.WriteLine($"Protobuf bytes: {string.Join(" ", bytes.Select(b => b.ToString("X2")))}");
Console.WriteLine($"Protobuf size : {bytes.Count} bytes");
Console.WriteLine($"JSON          : {json}");
Console.WriteLine($"JSON size     : {Encoding.UTF8.GetByteCount(json)} bytes");

// tag = (field number << 3) | wire type   (0 = varint, 2 = length-delimited)
void WriteVarintField(List<byte> b, int fieldNumber, uint value)
{
    WriteVarint(b, (uint)(fieldNumber << 3 | 0));
    WriteVarint(b, value);
}

void WriteStringField(List<byte> b, int fieldNumber, string value)
{
    byte[] utf8 = Encoding.UTF8.GetBytes(value);
    WriteVarint(b, (uint)(fieldNumber << 3 | 2));
    WriteVarint(b, (uint)utf8.Length);
    b.AddRange(utf8);
}

// varint: 7 bits per byte, high bit = "more bytes follow"
void WriteVarint(List<byte> b, uint value)
{
    while (value >= 0x80)
    {
        b.Add((byte)(value | 0x80));
        value >>= 7;
    }
    b.Add((byte)value);
}
`;

const transcodingCode = `// ===== 1. Package =====
// dotnet add package Microsoft.AspNetCore.Grpc.JsonTranscoding
// Copy google/api/annotations.proto and google/api/http.proto (from github.com/googleapis/googleapis)
// into the project folder:  SchoolGrpc/google/api/

// ===== 2. Protos/school.proto: add HTTP annotations =====
syntax = "proto3";
option csharp_namespace = "SchoolGrpc";
package school.v1;

import "google/api/annotations.proto";

service StudentService {
  rpc GetStudent (GetStudentRequest) returns (StudentReply) {
    option (google.api.http) = {
      get: "/v1/students/{id}"
    };
  }
  rpc CreateStudent (CreateStudentRequest) returns (StudentReply) {
    option (google.api.http) = {
      post: "/v1/students"
      body: "*"
    };
  }
}

message CreateStudentRequest { string name = 1; string branch = 2; double cgpa = 3; }
// (GetStudentRequest and StudentReply as before)

// ===== 3. Program.cs =====
builder.Services.AddGrpc().AddJsonTranscoding();
// optional OpenAPI for the JSON endpoints:
// dotnet add package Microsoft.AspNetCore.Grpc.Swagger
// builder.Services.AddGrpcSwagger();
// builder.Services.AddSwaggerGen();
app.MapGrpcService<StudentGrpcService>();

// ===== 4. Call it like a REST API =====
// curl https://localhost:7001/v1/students/1
// curl -X POST https://localhost:7001/v1/students -H "Content-Type: application/json" \\
//      -d '{"name":"Kiran","branch":"IT","cgpa":7.5}'`;

export default {
  id: 'day-20-grpc-aspnet-core-proto-streaming-transcoding',
  title: 'gRPC in ASP.NET Core: .proto Files, Unary and Streaming Calls, C# Client, gRPC vs REST and JSON Transcoding',
  module: 'Module 5: Microservices with .NET',
  day: 20,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'gRPC is the fast, strongly typed way for microservices to call each other. Write a contract in a .proto file, let the tooling generate C# classes, implement unary, server streaming, client streaming and bidirectional calls in ASP.NET Core, call them from a C# client, and expose the same service as a JSON REST API with gRPC-JSON transcoding.',
  objectives: [
    'Explain what gRPC is, how it uses HTTP/2 and Protocol Buffers, and when to choose it over REST',
    'Write .proto files with services, messages, field numbers and safe evolution rules',
    'Implement the four call types in an ASP.NET Core gRPC service',
    'Build a C# client with GrpcChannel, deadlines, status codes and streaming',
    'Expose gRPC methods as JSON HTTP APIs with gRPC-JSON transcoding',
  ],
  theory: [
    {
      heading: 'What is gRPC?',
      content:
        '**gRPC** (originally from Google, now a CNCF project) is a Remote Procedure Call framework: the client calls a method like `client.GetStudentAsync(request)` as if it were local, and the framework sends it over the network to the server.\n\nThree building blocks make it fast:\n- **HTTP/2**: one long-lived TCP connection carries many requests at the same time (multiplexing), headers are compressed, and data can stream in both directions.\n- **Protocol Buffers (Protobuf)**: a compact **binary** format. A message that is 24 bytes of JSON can be 9 bytes of Protobuf, and parsing binary is much faster than parsing text.\n- **Contract first**: the API is defined in a `.proto` file. Tools generate strongly typed server base classes and client classes for C#, Java, Go, Python, Node and more, so a Go service and a .NET service share one exact contract.\n\nIn .NET, gRPC is built into ASP.NET Core (`Grpc.AspNetCore` package, `dotnet new grpc` template) and the client is `Grpc.Net.Client`. It is the standard choice for internal service-to-service calls in microservices.',
      points: [
        'Typical use: internal microservice calls, real-time streaming, polyglot systems, mobile apps with poor networks',
        'Not ideal for: public APIs used directly by browsers (browsers cannot use raw gRPC; use gRPC-Web or JSON transcoding)',
        'Default ports in the template: https://localhost:7xxx; gRPC needs HTTP/2 (HTTPS in most setups)',
      ],
    },
    {
      heading: '.proto files and Protocol Buffers',
      content:
        'A `.proto` file (proto3 syntax) declares **messages** (data) and **services** (methods).\n\nEach field has a type, a name and a **field number**: `string name = 2;`. The field number, not the name, is written on the wire. That is why the rules for changing a contract are about numbers:\n- You may **add** new fields with new numbers: old clients simply ignore them (backward and forward compatible).\n- **Never change** the number or type of an existing field.\n- When you remove a field, mark its number `reserved 4;` so nobody reuses it.\n\nScalar types: `int32`, `int64`, `double`, `float`, `bool`, `string`, `bytes`. Collections: `repeated string tags = 5;` (a list) and `map<string, int32> marks = 6;`. Others: `enum`, nested messages, `oneof`, and well-known types like `google.protobuf.Timestamp` and `google.protobuf.Empty`.\n\nIn proto3 every scalar has a **default value** (0, empty string, false) and defaults are not sent on the wire. You cannot tell "0" from "not set" unless you mark the field `optional` or use wrapper types.\n\nC# code generation: the `Grpc.Tools` package reads `<Protobuf Include="Protos\\school.proto" GrpcServices="Server|Client|Both" />` in the .csproj and generates classes at build time. snake_case names become PascalCase (`student_id` -> `StudentId`). `option csharp_namespace` sets the C# namespace.',
      syntax: `syntax = "proto3";
option csharp_namespace = "SchoolGrpc";
service StudentService {
  rpc GetStudent (GetStudentRequest) returns (StudentReply);
}
message GetStudentRequest { int32 id = 1; }
message StudentReply { int32 id = 1; string name = 2; repeated string skills = 3; }`,
      tip: 'Field numbers 1-15 take one byte for the tag, so give them to the most frequently used fields.',
    },
    {
      heading: 'The four kinds of gRPC calls',
      content:
        '1. **Unary**: one request, one response, like a normal REST call. `rpc GetStudent (Req) returns (Reply);`\n2. **Server streaming**: one request, a stream of responses. The server writes with `responseStream.WriteAsync(...)` and the client reads with `await foreach (... ReadAllAsync())`. Use for live cricket scores, stock prices, progress of a long report, or sending a large result in pieces. `returns (stream Reply)`\n3. **Client streaming**: a stream of requests, one response. The client writes many messages, calls `CompleteAsync()`, then awaits the single reply. Use for uploading sensor readings, bulk marks upload, chunks of a file. `rpc Upload (stream Entry) returns (Summary);`\n4. **Bidirectional streaming**: both sides stream independently over one call. Use for chat, multiplayer games, live doubt-solving sessions. `rpc Chat (stream Msg) returns (stream Msg);`\n\nStreams can be cancelled: the client cancels with a CancellationToken or by disposing the call; the server sees `context.CancellationToken` fire and should stop work.',
    },
    {
      heading: 'Building the server and the C# client',
      content:
        '**Server**: `dotnet new grpc -n SchoolGrpc` creates a project with `Grpc.AspNetCore`, a sample greet.proto and a service. Your service class inherits the generated base class (`StudentService.StudentServiceBase`) and overrides the methods. Register with `builder.Services.AddGrpc()` and `app.MapGrpcService<StudentGrpcService>()`. Dependency injection, logging, authentication (`[Authorize]`) and interceptors all work as in Web API.\n\n**Client**: create a `GrpcChannel.ForAddress("https://localhost:7001")`, then the generated client `new StudentService.StudentServiceClient(channel)`. A channel is expensive to create (it holds HTTP/2 connections), so reuse it. In ASP.NET Core apps prefer the **gRPC client factory**: `builder.Services.AddGrpcClient<StudentService.StudentServiceClient>(o => o.Address = new Uri(...))` and inject the client.\n\n**Errors** are returned as status codes, not HTTP status codes: `OK`, `NotFound`, `InvalidArgument`, `PermissionDenied`, `Unauthenticated`, `DeadlineExceeded`, `Unavailable`, `Internal`... The server throws `RpcException(new Status(StatusCode.NotFound, "..."))`; the client catches `RpcException` and checks `ex.StatusCode`.\n\n**Deadlines**: always set one (`deadline: DateTime.UtcNow.AddSeconds(5)`). If the server does not finish in time the call fails with `DeadlineExceeded`, and the deadline is propagated to the server so it can stop. Calls without a deadline can hang forever.\n\n**Interceptors** (`Interceptor` base class) are gRPC middleware for logging, auth headers, or metrics on every call.',
      points: [
        'Server: Grpc.AspNetCore; Client: Grpc.Net.Client + Google.Protobuf + Grpc.Tools (or Grpc.Net.ClientFactory)',
        'Metadata = gRPC headers (e.g. "authorization: Bearer <token>")',
        'Test with Postman (supports gRPC), grpcurl, or Visual Studio\'s Endpoints Explorer',
      ],
    },
    {
      heading: 'gRPC vs REST',
      content:
        'Both are valid; choose by audience and needs.',
      points: [
        'Format: REST usually JSON text (human readable) | gRPC Protobuf binary (smaller, faster to serialize)',
        'Transport: REST works on HTTP/1.1 and HTTP/2 | gRPC requires HTTP/2 (or HTTP/3)',
        'Contract: REST optional (OpenAPI) | gRPC mandatory .proto, code generated for every language',
        'Streaming: REST request/response (use SignalR/SSE for push) | gRPC built-in server, client and bidirectional streaming',
        'Browser support: REST everywhere | gRPC needs gRPC-Web or JSON transcoding',
        'Caching and tooling: REST easy with HTTP caches, curl, browser | gRPC needs special tools (grpcurl, Postman)',
        'Best for: REST = public APIs, browser and third-party clients | gRPC = internal service-to-service calls, low latency, streaming, polyglot microservices',
      ],
      tip: 'A very common real design: a REST/JSON API (or gateway) for the Angular/React front end and mobile apps, and gRPC between internal microservices.',
    },
    {
      heading: 'gRPC-JSON transcoding and gRPC-Web',
      content:
        '**gRPC-JSON transcoding** lets one gRPC service also answer normal REST/JSON requests. You annotate methods in the .proto file with `google.api.http` options (`get: "/v1/students/{id}"`), add the `Microsoft.AspNetCore.Grpc.JsonTranscoding` package and call `AddGrpc().AddJsonTranscoding()`. ASP.NET Core then maps `GET /v1/students/1` to the GetStudent method, converts route values and JSON body into the Protobuf request, and converts the reply back to JSON (field names in camelCase). You write the logic once and serve both gRPC clients (other services) and REST clients (browsers, partners). With `Microsoft.AspNetCore.Grpc.Swagger` the JSON endpoints even appear in Swagger.\n\n**gRPC-Web** is another option for browsers: a protocol variant that works over HTTP/1.1 (`app.UseGrpcWeb()` + `.EnableGrpcWeb()` on the service). It supports unary and server streaming only, and the browser needs a generated JavaScript/TypeScript client.\n\nTranscoding is usually simpler for public consumers because they just see a normal JSON API.',
    },
  ],
  examples: [
    {
      title: 'A gRPC service with all four call types',
      scenario:
        'A college ERP needs a StudentService used by other internal services: fetch one student, stream all students of a branch, upload marks in bulk, and a live doubt channel.',
      steps: [
        'In a terminal: dotnet new grpc -n SchoolGrpc (or Visual Studio: File > New > Project > ASP.NET Core gRPC Service)',
        'Add Protos/school.proto with the content shown, and change the <Protobuf> item in SchoolGrpc.csproj to point to it',
        'Build (Ctrl+Shift+B): Grpc.Tools generates StudentService.StudentServiceBase and message classes in obj/',
        'Add Services/StudentGrpcService.cs and register it in Program.cs with MapGrpcService',
        'Press F5 and note the https port in the console (for example https://localhost:7001)',
      ],
      code: protoCode,
      result: `info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7001
Browser GET https://localhost:7001/  -> "gRPC endpoints need a gRPC client."
Postman > New > gRPC > https://localhost:7001 > import school.proto > GetStudent {"id": 1}
  -> { "id": 1, "name": "Asha", "branch": "CSE", "cgpa": 8.7 }   status 0 OK`,
      explanation:
        'Each rpc in the .proto becomes a virtual method in the generated base class; we override it. Unary returns Task<StudentReply>. Streaming methods receive IServerStreamWriter (to write many replies) and/or IAsyncStreamReader (to read many requests). Throwing RpcException with StatusCode.NotFound is the gRPC way to return "404". A browser cannot call gRPC methods directly, which is why the root path returns a hint.',
    },
    {
      title: 'C# client: unary, error handling, server and client streaming',
      scenario:
        'An Exam service (here a console app) calls SchoolGrpc: get one student, handle a missing student, stream all CSE students and upload three DBMS marks.',
      steps: [
        'dotnet new console -n SchoolClient, then add Grpc.Net.Client, Google.Protobuf and Grpc.Tools packages',
        'Add the <Protobuf ... GrpcServices="Client" /> item pointing to the server\'s school.proto',
        'Replace Program.cs with the code below',
        'Run SchoolGrpc first, then press Ctrl+F5 on SchoolClient',
      ],
      code: clientCode,
      result: `Unary: Asha (CSE) CGPA 8.7
Error: NotFound - Student 99 not found
Stream: 1 Asha
Stream: 2 Rahul
Stream: 4 Vikram
Client stream: 3 marks, average 77.67
Bidi: Mentor: Answer to 'What is a JOIN?'`,
      explanation:
        'GetStudentAsync is the generated async unary method; the deadline makes it fail with DeadlineExceeded after 5 seconds instead of hanging. The NotFound status from the server arrives as RpcException. The stream returns only CSE students (Meena is ECE), one message every 200 ms. For client streaming, (78 + 91 + 64) / 3 = 77.666..., printed with format 0.00 as 77.67 (an en-IN/en-US machine; some cultures use a comma). In the bidi call a background task reads replies while the main code writes requests.',
    },
    {
      title: 'How a streaming call feels: IAsyncEnumerable with cancellation',
      scenario:
        'Simulate a server-streaming "live score" call without any server: the server yields one ball at a time, and the client stops reading (cancels) after a wicket. This is exactly how await foreach over ResponseStream.ReadAllAsync() behaves.',
      steps: [
        'Create a Console App named StreamDemo',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Remove the break and cts.Cancel() lines and run again: all 5 balls arrive and "server: stream completed" is printed',
      ],
      code: streamCode,
      csharp: { files: { 'Program.cs': streamCode }, stdin: '' },
      result: `client got: IND vs AUS 12.1: 1 run
client got: IND vs AUS 12.2: 4 runs
client got: IND vs AUS 12.3: dot ball
client got: IND vs AUS 12.4: WICKET - caught
client: wicket! closing the stream
Messages received: 4`,
      explanation:
        'The async iterator produces values lazily: nothing is produced until the client asks for the next item. When the client breaks out of await foreach, the iterator is disposed while it is paused at yield return, so the loop never reaches "server: stream completed" and the 6 runs ball is never produced. In real gRPC, disposing or cancelling the call sends a cancel to the server and context.CancellationToken fires there.',
    },
    {
      title: 'Why Protobuf is small: encoding a message by hand',
      scenario:
        'Encode message Student { int32 id = 1; string name = 2; } with id 150 and name "Asha" exactly like Protobuf does, and compare its size with the JSON for the same data.',
      steps: [
        'Create a Console App named ProtobufBytes',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Change id to 5 and predict the new byte count (the varint for 5 needs only one byte)',
      ],
      code: wireCode,
      csharp: { files: { 'Program.cs': wireCode }, stdin: '' },
      result: `Protobuf bytes: 08 96 01 12 04 41 73 68 61
Protobuf size : 9 bytes
JSON          : {"id":150,"name":"Asha"}
JSON size     : 24 bytes`,
      explanation:
        'Field 1 with wire type 0 (varint) gives tag (1 << 3) | 0 = 0x08. 150 does not fit in 7 bits, so the varint is 0x96 (low 7 bits + continuation bit) followed by 0x01. Field 2 with wire type 2 (length-delimited) gives tag 0x12, then the length 0x04 and the UTF-8 bytes of "Asha" (41 73 68 61). Field names never travel on the wire, only numbers: that is why renaming a field is safe but changing its number breaks every client.',
    },
    {
      title: 'gRPC-JSON transcoding: one service, gRPC and REST',
      scenario:
        'The Angular admin portal and a partner college want a normal JSON API, while internal services keep using gRPC. Add HTTP annotations instead of writing a second controller.',
      steps: [
        'dotnet add package Microsoft.AspNetCore.Grpc.JsonTranscoding',
        'Copy google/api/annotations.proto and google/api/http.proto into SchoolGrpc/google/api/',
        'Add import "google/api/annotations.proto" and the option (google.api.http) blocks to school.proto',
        'Change Program.cs to builder.Services.AddGrpc().AddJsonTranscoding(); and implement CreateStudent in the service',
        'Run and call the endpoints with curl, Postman or the browser',
      ],
      code: transcodingCode,
      result: `GET https://localhost:7001/v1/students/1
200 OK
{ "id": 1, "name": "Asha", "branch": "CSE", "cgpa": 8.7 }

GET https://localhost:7001/v1/students/99
404 Not Found
{ "code": 5, "message": "Student 99 not found", "details": [] }

POST https://localhost:7001/v1/students   {"name":"Kiran","branch":"IT","cgpa":7.5}
200 OK
{ "id": 5, "name": "Kiran", "branch": "IT", "cgpa": 7.5 }`,
      explanation:
        'The route template {id} binds to the id field of GetStudentRequest; body: "*" maps the whole JSON body onto CreateStudentRequest. gRPC status codes are converted to HTTP codes (NotFound -> 404, InvalidArgument -> 400, Unauthenticated -> 401), and the error body contains the gRPC code (5 = NOT_FOUND). The same methods are still callable over gRPC.',
    },
  ],
  interview: [
    { q: 'What is gRPC?', a: 'A high-performance RPC framework that uses HTTP/2 for transport and Protocol Buffers for contract and serialization. Clients call generated methods as if they were local; it supports unary and streaming calls and generates code for many languages.', level: 'Easy' },
    { q: 'Why is gRPC faster than REST with JSON?', a: 'Protobuf is binary and compact (no field names on the wire, varint numbers), so messages are smaller and faster to serialize/parse. HTTP/2 multiplexes many calls over one connection with header compression, avoiding connection setup per request.', level: 'Medium' },
    { q: 'What are the four types of gRPC methods?', a: 'Unary (one request, one response), server streaming (one request, stream of responses), client streaming (stream of requests, one response), and bidirectional streaming (both sides stream independently).', level: 'Easy' },
    { q: 'Why are field numbers important in a .proto file?', a: 'Field numbers, not names, identify fields in the binary encoding. Changing a number or type breaks existing clients. You can add new fields with new numbers safely; removed numbers should be marked reserved so they are never reused.', level: 'Medium' },
    { q: 'How do you handle errors in gRPC in .NET?', a: 'The server throws RpcException(new Status(StatusCode.X, "detail")). The client catches RpcException and checks ex.StatusCode (NotFound, InvalidArgument, Unavailable, DeadlineExceeded...). Unhandled exceptions become StatusCode.Unknown/Internal; EnableDetailedErrors should be on only in development.', level: 'Medium' },
    { q: 'What is a deadline and why should every call have one?', a: 'An absolute time by which the call must complete. If it is exceeded, the client gets DeadlineExceeded and the server\'s cancellation token fires so it stops work. Without deadlines, a slow dependency can make calls hang and exhaust threads and connections.', level: 'Medium' },
    { q: 'Can a browser call a gRPC service directly?', a: 'No. Browsers cannot control HTTP/2 frames and trailers as gRPC requires. Options: gRPC-Web (with UseGrpcWeb and a JS client; unary and server streaming only) or gRPC-JSON transcoding to expose REST/JSON endpoints.', level: 'Medium' },
    { q: 'What is gRPC-JSON transcoding?', a: 'An ASP.NET Core feature (Microsoft.AspNetCore.Grpc.JsonTranscoding) that maps HTTP/JSON requests to gRPC methods using google.api.http annotations in the .proto. One implementation serves both gRPC and RESTful JSON clients, and can be documented with Swagger.', level: 'Medium' },
    { q: 'When would you choose REST over gRPC?', a: 'For public APIs, browser and third-party clients, when human-readable payloads and easy debugging with curl matter, or when HTTP caching (CDNs) is important. gRPC fits internal low-latency service-to-service calls and streaming.', level: 'Easy' },
    { q: 'Why should a GrpcChannel be reused?', a: 'A channel manages HTTP/2 connections, which are expensive to create. Creating one per call wastes connections and adds latency. Reuse one channel per address, or use the gRPC client factory (AddGrpcClient) which manages it.', level: 'Medium' },
    { q: 'What happens to the server when a client cancels a streaming call?', a: 'The ServerCallContext.CancellationToken is triggered. A well-written server checks it (or passes it to async calls) and stops writing; writing after cancellation throws.', level: 'Hard' },
    { q: 'In proto3, how can you distinguish "0" from "not set" for an int field?', a: 'By default you cannot, because default values are not serialized. Mark the field optional (proto3 optional, gives HasX in C#) or use wrapper types like google.protobuf.Int32Value, which become nullable int in C#.', level: 'Hard' },
    { q: 'What are gRPC interceptors?', a: 'Middleware for gRPC calls. Server interceptors (registered with AddGrpc(o => o.Interceptors.Add<T>())) and client interceptors can run code around every call for logging, metrics, exception mapping or adding auth metadata.', level: 'Medium' },
    { q: 'How do you send a JWT with a gRPC call?', a: 'As metadata: new Metadata { { "Authorization", "Bearer " + token } } passed in the call options, or once for all calls with CallCredentials on the channel or AddCallCredentials on the client factory. The server uses normal ASP.NET Core authentication and [Authorize].', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add an rpc GetTopper (BranchRequest) returns (StudentReply) to school.proto and implement it to return the highest-CGPA student of a branch, or NotFound if the branch has no students.',
      hint: 'Use LINQ OrderByDescending(x => x.Cgpa).FirstOrDefault().',
      solution: `// proto
rpc GetTopper (BranchRequest) returns (StudentReply);
message BranchRequest { string branch = 1; }

// service
public override Task<StudentReply> GetTopper(BranchRequest request, ServerCallContext context)
{
    var top = Students.Where(s => s.Branch == request.Branch)
                      .OrderByDescending(s => s.Cgpa)
                      .FirstOrDefault()
        ?? throw new RpcException(new Status(StatusCode.NotFound, $"No students in {request.Branch}"));
    return Task.FromResult(top);
}
// CSE -> Asha (8.7), ECE -> Meena (9.1), MECH -> NotFound`,
    },
    {
      task: 'A field "phone" (number 5) is no longer needed in StudentReply. Remove it safely and add a new "email" field.',
      hint: 'Never reuse the old number.',
      solution: `message StudentReply {
  reserved 5;
  reserved "phone";
  int32  id     = 1;
  string name   = 2;
  string branch = 3;
  double cgpa   = 4;
  string email  = 6;
}`,
    },
    {
      task: 'Register the generated client with the gRPC client factory in an ASP.NET Core Exam API and use it in a minimal API endpoint GET /exam/students/{id}.',
      hint: 'Package Grpc.Net.ClientFactory; AddGrpcClient<T>.',
      solution: `builder.Services.AddGrpcClient<StudentService.StudentServiceClient>(o =>
    o.Address = new Uri(builder.Configuration["Services:School"]!));

app.MapGet("/exam/students/{id:int}", async (int id, StudentService.StudentServiceClient client) =>
{
    try
    {
        var s = await client.GetStudentAsync(new GetStudentRequest { Id = id },
                                             deadline: DateTime.UtcNow.AddSeconds(3));
        return Results.Ok(new { s.Id, s.Name, s.Branch });
    }
    catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
    {
        return Results.NotFound();
    }
});`,
    },
    {
      task: 'Write a server-streaming rpc DownloadReport that sends a large report in chunks of 4 KB using a bytes field.',
      hint: 'message ReportChunk { bytes data = 1; int32 index = 2; } and ByteString.CopyFrom.',
      solution: `rpc DownloadReport (ReportRequest) returns (stream ReportChunk);
message ReportRequest { string name = 1; }
message ReportChunk { bytes data = 1; int32 index = 2; }

public override async Task DownloadReport(ReportRequest request,
    IServerStreamWriter<ReportChunk> stream, ServerCallContext context)
{
    byte[] file = await File.ReadAllBytesAsync($"reports/{request.Name}.pdf", context.CancellationToken);
    int index = 0;
    for (int offset = 0; offset < file.Length; offset += 4096)
    {
        int size = Math.Min(4096, file.Length - offset);
        await stream.WriteAsync(new ReportChunk
        {
            Data = Google.Protobuf.ByteString.CopyFrom(file, offset, size),
            Index = index++
        });
    }
}`,
    },
    {
      task: 'Add a DELETE endpoint through JSON transcoding: DELETE /v1/students/{id} mapped to rpc DeleteStudent returning google.protobuf.Empty.',
      hint: 'import "google/protobuf/empty.proto"; option (google.api.http) = { delete: "..." }',
      solution: `import "google/protobuf/empty.proto";

rpc DeleteStudent (GetStudentRequest) returns (google.protobuf.Empty) {
  option (google.api.http) = { delete: "/v1/students/{id}" };
}

// C#
public override Task<Empty> DeleteStudent(GetStudentRequest request, ServerCallContext context)
{
    int removed = Students.RemoveAll(s => s.Id == request.Id);
    if (removed == 0) throw new RpcException(new Status(StatusCode.NotFound, "Not found"));
    return Task.FromResult(new Empty());   // using Google.Protobuf.WellKnownTypes;
}`,
    },
  ],
  quiz: [
    {
      question: 'Which declaration is a client-streaming method?',
      options: [
        'rpc Upload (MarkEntry) returns (stream Summary);',
        'rpc Upload (stream MarkEntry) returns (Summary);',
        'rpc Upload (stream MarkEntry) returns (stream Summary);',
        'rpc Upload (MarkEntry) returns (Summary);',
      ],
      answer: 1,
      explanation: 'The stream keyword on the request side means the client sends many messages; the single reply comes at the end.',
    },
    {
      question: 'What is actually written on the wire to identify a Protobuf field?',
      options: ['The field name', 'The C# property name', 'The field number (with the wire type)', 'The JSON key'],
      answer: 2,
      explanation: 'The tag is (field number << 3) | wire type. Names are never sent, which is why numbers must not change.',
    },
    {
      question: 'How does a .NET gRPC server return "student not found"?',
      options: [
        'return NotFound();',
        'throw new RpcException(new Status(StatusCode.NotFound, "..."));',
        'return null;',
        'Set the HTTP status code to 404',
      ],
      answer: 1,
      explanation: 'gRPC uses its own status codes carried in trailers; RpcException is the way to send them.',
    },
    {
      question: 'What does gRPC-JSON transcoding give you?',
      options: [
        'REST/JSON endpoints generated from annotated gRPC methods, with one implementation',
        'A way to convert C# to Java',
        'Faster Protobuf serialization',
        'Bidirectional streaming in the browser',
      ],
      answer: 0,
      explanation: 'google.api.http annotations map HTTP verbs and routes to gRPC methods so REST clients can use the same service.',
    },
    {
      question: 'Which is the BEST use case for gRPC?',
      options: [
        'A public API that third-party developers test with a browser',
        'Internal low-latency calls between microservices written in .NET and Go',
        'Serving static HTML pages',
        'A CDN-cached product catalog for anonymous users',
      ],
      answer: 1,
      explanation: 'gRPC shines for internal, polyglot, high-performance service-to-service communication.',
    },
  ],
};
