export default {
  id: 'extra-48-signalr-real-time',
  title: 'SignalR Real-Time Communication',
  module: 'Extra: ASP.NET Core, EF Core & Web API',
  extraNo: 48,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Push data from the server to browsers instantly with ASP.NET Core SignalR: hubs, transports (WebSockets, SSE, long polling), client groups, Clients.All/Caller/Others/Group/User, strongly typed hubs, sending from controllers and background services with IHubContext, JavaScript and React clients, JWT authentication, CORS and scaling out with Redis or Azure SignalR.',
  objectives: [
    'Explain real-time communication and how SignalR negotiates WebSockets, Server-Sent Events or long polling',
    'Create a Hub, map it, and call hub methods from a JavaScript client and back',
    'Target specific clients: All, Caller, Others, Group, User and manage groups on connect/disconnect',
    'Push notifications from controllers/background services with IHubContext and strongly typed hubs',
    'Secure hubs with JWT, configure CORS for React, and know how to scale out',
  ],
  theory: [
    {
      heading: 'What is real-time and what is SignalR?',
      content: 'In normal HTTP the client always asks first (request) and the server answers (response). For chat, live scores, notifications, dashboards or stock prices, the SERVER must send data the moment something happens. Polling every few seconds wastes bandwidth and is still late. SignalR is an ASP.NET Core library that keeps a persistent connection open and lets the server call JavaScript (or .NET, Java, Swift) functions on the client and the client call C# methods on the server. Analogy: HTTP is sending letters; SignalR is a phone call that stays connected.',
      points: [
        'Transports, best first: WebSockets (full duplex), Server-Sent Events (server-to-client stream), Long Polling (fallback). SignalR negotiates automatically.',
        'Messages are serialized as JSON (default) or MessagePack (binary, smaller).',
        'Server package is built into ASP.NET Core; JS client: npm install @microsoft/signalr; .NET client: Microsoft.AspNetCore.SignalR.Client.',
        'Uses: chat, notifications, live dashboards, collaborative editing, multiplayer games, progress bars of long jobs.',
      ],
    },
    {
      heading: 'Hubs: the server side',
      content: 'A Hub is a class deriving from Hub (or Hub<TClient>). Public methods can be invoked by clients. Inside a hub you use Clients to send messages, Groups to manage groups, and Context for the ConnectionId, User (claims) and cancellation. Register with builder.Services.AddSignalR() and expose with app.MapHub<ChatHub>("/hubs/chat"). A new hub instance is created for EVERY call, so never store state in hub fields - use a singleton service or database.',
      syntax: `public class ChatHub : Hub
{
    public async Task SendMessage(string user, string message) =>
        await Clients.All.SendAsync("ReceiveMessage", user, message);

    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("ReceiveMessage", "system", "Welcome " + Context.ConnectionId);
        await base.OnConnectedAsync();
    }
}`,
    },
    {
      heading: 'Choosing who receives a message',
      content: 'Clients.All - everyone connected. Clients.Caller - only the connection that called the method. Clients.Others - everyone except the caller. Clients.Client(id) / Clients.Clients(ids) - specific connections. Clients.Group("dotnet") - all connections in a group; Clients.OthersInGroup("dotnet") excludes the caller. Clients.User(userId) - all connections (tabs, phone, laptop) of one authenticated user (user id from the NameIdentifier claim). Groups are created automatically by Groups.AddToGroupAsync and are NOT persisted: re-add users after reconnect.',
      points: [
        'One user can have many ConnectionIds (one per tab/device).',
        'Group membership is lost when a connection drops; rejoin in OnConnectedAsync or from the client after reconnect.',
        'Hub method names are case-insensitive; client method names in SendAsync are matched by the client handler name.',
      ],
    },
    {
      heading: 'Strongly typed hubs and IHubContext',
      content: 'SendAsync("ReceiveMessage", ...) uses magic strings - a typo silently does nothing. Define an interface for client methods and derive from Hub<IChatClient>; then call Clients.All.ReceiveMessage(user, text) with compile-time checking. Outside a hub (controllers, services, BackgroundService) inject IHubContext<ChatHub> or IHubContext<NotificationHub, INotificationClient> to push messages - for example when an order is shipped.',
      syntax: `public interface INotificationClient
{
    Task OrderStatusChanged(int orderId, string status);
}
public class NotificationHub : Hub<INotificationClient> { }

public class OrdersController(IHubContext<NotificationHub, INotificationClient> hub) : ControllerBase
{
    [HttpPost("{id}/ship")]
    public async Task<IActionResult> Ship(int id, string userId)
    {
        await hub.Clients.User(userId).OrderStatusChanged(id, "Shipped");
        return NoContent();
    }
}`,
    },
    {
      heading: 'Security, CORS and scaling out',
      content: 'Add [Authorize] to a hub (or a method) after setting up authentication. Browsers cannot send an Authorization header on WebSockets, so the JS client sends the JWT as ?access_token=...; read it in JwtBearerEvents.OnMessageReceived for the hub path. For a React app on another origin, CORS must use WithOrigins(...).AllowCredentials() (AllowAnyOrigin is not allowed with credentials). With several servers behind a load balancer, a message sent on server A must reach clients connected to server B: add a backplane with AddStackExchangeRedis(...) or use Azure SignalR Service, and enable sticky sessions unless all clients use WebSockets with SkipNegotiation.',
      tip: 'SignalR does not guarantee delivery when a client is offline. Save important notifications in the database and let the client load missed ones after reconnecting.',
    },
  ],
  examples: [
    {
      title: 'Group chat: ChatHub with rooms and a JavaScript client',
      scenario: 'Students join a room (dotnet, react) and chat in real time. Joining and leaving are announced to the room.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Empty; name ChatApp; .NET 8/10 > Create',
        'Add folder Hubs and class ChatHub.cs; replace Program.cs',
        'Add wwwroot/index.html (right-click project > Add > New Folder wwwroot, then Add > New Item > HTML Page)',
        'Press F5; open the URL in two different browser windows, join the same room and send messages',
        'Press F12 > Network > WS to see the WebSocket frames',
      ],
      code: `// Hubs/ChatHub.cs
using Microsoft.AspNetCore.SignalR;
namespace ChatApp.Hubs;

public interface IChatClient
{
    Task ReceiveMessage(string user, string message, string time);
    Task SystemMessage(string message);
}

public class ChatHub : Hub<IChatClient>
{
    public async Task JoinRoom(string room, string user)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, room);
        Context.Items["user"] = user;          // per-connection data
        Context.Items["room"] = room;
        await Clients.OthersInGroup(room).SystemMessage(user + " joined " + room);
        await Clients.Caller.SystemMessage("You joined " + room);
    }

    public async Task SendToRoom(string message)
    {
        var room = (string)Context.Items["room"]!;
        var user = (string)Context.Items["user"]!;
        await Clients.Group(room).ReceiveMessage(user, message, DateTime.UtcNow.ToString("HH:mm"));
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (Context.Items.TryGetValue("room", out var room) && room is string r)
            await Clients.Group(r).SystemMessage(Context.Items["user"] + " left");
        await base.OnDisconnectedAsync(exception);
    }
}

// Program.cs
using ChatApp.Hubs;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();

var app = builder.Build();
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapHub<ChatHub>("/hubs/chat");
app.Run();

<!-- wwwroot/index.html -->
<!DOCTYPE html>
<html>
<head><title>SignalR Chat</title></head>
<body>
  <input id="user" placeholder="Name" />
  <select id="room"><option>dotnet</option><option>react</option></select>
  <button id="join">Join</button>
  <hr />
  <input id="msg" placeholder="Message" /> <button id="send" disabled>Send</button>
  <ul id="messages"></ul>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/8.0.7/signalr.min.js"></script>
  <script>
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/chat")
      .withAutomaticReconnect()           // retries after 0, 2, 10, 30 seconds
      .configureLogging(signalR.LogLevel.Information)
      .build();

    function add(text) {
      const li = document.createElement("li");
      li.textContent = text;              // textContent prevents XSS
      document.getElementById("messages").appendChild(li);
    }

    connection.on("ReceiveMessage", (user, message, time) => add("[" + time + "] " + user + ": " + message));
    connection.on("SystemMessage", text => add("* " + text));

    document.getElementById("join").onclick = async () => {
      await connection.invoke("JoinRoom",
        document.getElementById("room").value, document.getElementById("user").value);
      document.getElementById("send").disabled = false;
    };
    document.getElementById("send").onclick = async () => {
      await connection.invoke("SendToRoom", document.getElementById("msg").value);
      document.getElementById("msg").value = "";
    };

    connection.start().then(() => add("* connected")).catch(err => add("Error: " + err));
  </script>
</body>
</html>`,
      result: `Window 1 (Asha joins dotnet):          Window 2 (Ravi joins dotnet):
* connected                            * connected
* You joined dotnet                    * You joined dotnet
* Ravi joined dotnet
[09:41] Ravi: Hi Asha!                 [09:41] Ravi: Hi Asha!
[09:42] Asha: Hello Ravi               [09:42] Asha: Hello Ravi
                                       (Asha closes her tab)
                                       * Asha left

Network tab: /hubs/chat/negotiate?negotiateVersion=1 -> 200, then wss://localhost:7031/hubs/chat?id=... (101 Switching Protocols)`,
      explanation: 'The browser first calls /negotiate, then upgrades to a WebSocket. connection.invoke("JoinRoom", ...) calls the C# method; the hub adds the connection to the group and uses OthersInGroup so only the other members see "joined". Clients.Group(room).ReceiveMessage(...) is strongly typed through IChatClient, and the JS handler name must match the interface method name. Context.Items stores data for this connection only. The times shown are UTC examples.',
    },
    {
      title: 'Order notifications: IHubContext from an API, JWT auth and a React client',
      scenario: 'When an admin marks an order as shipped, the customer who owns the order sees a toast instantly on every device. The hub requires a JWT.',
      steps: [
        'Open your Web API project that already has JWT authentication (see Day 94) and install nothing extra for the server',
        'Add Hubs/NotificationHub.cs, update Program.cs (SignalR, CORS, JWT query-string token), add the Ship action to OrdersController',
        'In the React (Vite) project run: npm install @microsoft/signalr',
        'Add src/hooks/useNotifications.js and use it in App.jsx',
        'Run both projects; log in as a customer in React; call POST /api/orders/1001/ship from Swagger as admin',
      ],
      code: `// Hubs/NotificationHub.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
namespace ShopApi.Hubs;

public interface INotificationClient
{
    Task OrderStatusChanged(int orderId, string status);
}

[Authorize]
public class NotificationHub : Hub<INotificationClient> { }

// Program.cs (relevant parts)
builder.Services.AddSignalR();
builder.Services.AddCors(o => o.AddPolicy("react", p => p
    .WithOrigins("http://localhost:5173")
    .AllowAnyHeader().AllowAnyMethod()
    .AllowCredentials()));                         // required by SignalR

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters { /* issuer, audience, key as on Day 94 */ };
        o.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                var token = ctx.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(token) && ctx.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                    ctx.Token = token;                // WebSockets cannot send headers
                return Task.CompletedTask;
            }
        };
    });
...
app.UseCors("react");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

// Controllers/OrdersController.cs (action)
[HttpPost("{id:int}/ship")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> Ship(int id,
    [FromServices] IHubContext<NotificationHub, INotificationClient> hub)
{
    var order = await db.Orders.FindAsync(id);
    if (order is null) return NotFound();
    order.Status = "Shipped";
    await db.SaveChangesAsync();
    // UserId stored on the order = NameIdentifier claim of the customer
    await hub.Clients.User(order.UserId).OrderStatusChanged(order.Id, order.Status);
    return NoContent();
}

// React: src/hooks/useNotifications.js
import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

export function useNotifications(token) {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if (!token) return;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7001/hubs/notifications", { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();
    connection.on("OrderStatusChanged", (orderId, status) =>
      setMessages(m => [...m, "Order #" + orderId + " is now " + status]));
    connection.start().catch(console.error);
    return () => { connection.stop(); };          // cleanup on logout/unmount
  }, [token]);
  return messages;
}

// React: App.jsx (part)
const messages = useNotifications(auth.token);
return <ul>{messages.map((m, i) => <li key={i}>{m}</li>)}</ul>;`,
      result: `Swagger (admin):  POST /api/orders/1001/ship  -> 204 No Content

Customer's laptop and phone (both logged in) show immediately:
  Order #1001 is now Shipped

Without a token:
  POST https://localhost:7001/hubs/notifications/negotiate -> 401 Unauthorized
  Error: Failed to complete negotiation with the server`,
      explanation: 'IHubContext lets any service push through the hub without being inside it. Clients.User(order.UserId) reaches every connection whose NameIdentifier claim equals that id, so all devices of that customer get the message. accessTokenFactory makes the JS client send the JWT as access_token in the query string, and OnMessageReceived copies it into ctx.Token for /hubs paths. AllowCredentials with an explicit origin is mandatory for SignalR CORS.',
    },
    {
      title: 'Console simulation: All, Group, Others and Caller targeting',
      scenario: 'Model three connected students and see exactly who receives each kind of hub message, including after a disconnect.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it HubTargetingDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Linq;

var hub = new MiniHub();
hub.Connect("c1", "Asha");
hub.Connect("c2", "Ravi");
hub.Connect("c3", "Meena");
hub.AddToGroup("c1", "dotnet");
hub.AddToGroup("c3", "dotnet");

hub.SendToAll("c2", "Hello everyone");
hub.SendToGroup("c1", "dotnet", "Class at 5 PM");
hub.SendToOthers("c3", "I am typing...");
hub.SendToCaller("c2", "Your message was saved");
hub.Disconnect("c3");
hub.SendToGroup("c1", "dotnet", "Anyone there?");

class MiniHub
{
    private readonly List<(string Id, string User)> _connections = new();
    private readonly Dictionary<string, List<string>> _groups = new();

    private string UserOf(string id) => _connections.First(c => c.Id == id).User;

    public void Connect(string id, string user)
    {
        _connections.Add((id, user));
        Console.WriteLine("OnConnectedAsync: " + id + " (" + user + ")");
    }

    public void Disconnect(string id)
    {
        string user = UserOf(id);
        _connections.RemoveAll(c => c.Id == id);
        foreach (var members in _groups.Values) members.Remove(id);   // groups forget the connection
        Console.WriteLine("OnDisconnectedAsync: " + id + " (" + user + ")");
    }

    public void AddToGroup(string id, string group)
    {
        if (!_groups.ContainsKey(group)) _groups[group] = new List<string>();
        _groups[group].Add(id);
        Console.WriteLine("Groups.AddToGroupAsync(" + id + ", " + group + ")");
    }

    private void Deliver(string target, string from, string message, Func<string, bool> filter)
    {
        Console.WriteLine(target + " <- " + UserOf(from) + ": " + message);
        var receivers = _connections.Where(c => filter(c.Id)).Select(c => c.User).ToList();
        Console.WriteLine("   delivered to: " + (receivers.Count == 0 ? "(nobody)" : string.Join(", ", receivers)));
    }

    public void SendToAll(string from, string msg) => Deliver("Clients.All", from, msg, id => true);
    public void SendToOthers(string from, string msg) => Deliver("Clients.Others", from, msg, id => id != from);
    public void SendToCaller(string from, string msg) => Deliver("Clients.Caller", from, msg, id => id == from);
    public void SendToGroup(string from, string group, string msg) =>
        Deliver("Clients.Group(" + group + ")", from, msg,
                id => _groups.TryGetValue(group, out var members) && members.Contains(id));
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Linq;

var hub = new MiniHub();
hub.Connect("c1", "Asha");
hub.Connect("c2", "Ravi");
hub.Connect("c3", "Meena");
hub.AddToGroup("c1", "dotnet");
hub.AddToGroup("c3", "dotnet");

hub.SendToAll("c2", "Hello everyone");
hub.SendToGroup("c1", "dotnet", "Class at 5 PM");
hub.SendToOthers("c3", "I am typing...");
hub.SendToCaller("c2", "Your message was saved");
hub.Disconnect("c3");
hub.SendToGroup("c1", "dotnet", "Anyone there?");

class MiniHub
{
    private readonly List<(string Id, string User)> _connections = new();
    private readonly Dictionary<string, List<string>> _groups = new();

    private string UserOf(string id) => _connections.First(c => c.Id == id).User;

    public void Connect(string id, string user)
    {
        _connections.Add((id, user));
        Console.WriteLine("OnConnectedAsync: " + id + " (" + user + ")");
    }

    public void Disconnect(string id)
    {
        string user = UserOf(id);
        _connections.RemoveAll(c => c.Id == id);
        foreach (var members in _groups.Values) members.Remove(id);   // groups forget the connection
        Console.WriteLine("OnDisconnectedAsync: " + id + " (" + user + ")");
    }

    public void AddToGroup(string id, string group)
    {
        if (!_groups.ContainsKey(group)) _groups[group] = new List<string>();
        _groups[group].Add(id);
        Console.WriteLine("Groups.AddToGroupAsync(" + id + ", " + group + ")");
    }

    private void Deliver(string target, string from, string message, Func<string, bool> filter)
    {
        Console.WriteLine(target + " <- " + UserOf(from) + ": " + message);
        var receivers = _connections.Where(c => filter(c.Id)).Select(c => c.User).ToList();
        Console.WriteLine("   delivered to: " + (receivers.Count == 0 ? "(nobody)" : string.Join(", ", receivers)));
    }

    public void SendToAll(string from, string msg) => Deliver("Clients.All", from, msg, id => true);
    public void SendToOthers(string from, string msg) => Deliver("Clients.Others", from, msg, id => id != from);
    public void SendToCaller(string from, string msg) => Deliver("Clients.Caller", from, msg, id => id == from);
    public void SendToGroup(string from, string group, string msg) =>
        Deliver("Clients.Group(" + group + ")", from, msg,
                id => _groups.TryGetValue(group, out var members) && members.Contains(id));
}
`,
        },
        stdin: '',
      },
      result: `OnConnectedAsync: c1 (Asha)
OnConnectedAsync: c2 (Ravi)
OnConnectedAsync: c3 (Meena)
Groups.AddToGroupAsync(c1, dotnet)
Groups.AddToGroupAsync(c3, dotnet)
Clients.All <- Ravi: Hello everyone
   delivered to: Asha, Ravi, Meena
Clients.Group(dotnet) <- Asha: Class at 5 PM
   delivered to: Asha, Meena
Clients.Others <- Meena: I am typing...
   delivered to: Asha, Ravi
Clients.Caller <- Ravi: Your message was saved
   delivered to: Ravi
OnDisconnectedAsync: c3 (Meena)
Clients.Group(dotnet) <- Asha: Anyone there?
   delivered to: Asha`,
      explanation: 'All includes the sender; Others excludes it; Caller is only the sender; Group includes every member, sender too (use OthersInGroup to skip the sender). Ravi is not in "dotnet", so he never sees "Class at 5 PM". After Meena disconnects, SignalR removes her connection from every group automatically, so the last group message reaches only Asha.',
    },
    {
      title: 'Console simulation: strongly typed client and Clients.User across devices',
      scenario: 'A user has a laptop and a phone connected. Show how a typed INotificationClient call through a hub-context-like object reaches all of that user\'s connections.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it TypedHubDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

var clients = new List<FakeClient>
{
    new("c1", "asha", "laptop"),
    new("c2", "asha", "phone"),
    new("c3", "ravi", "laptop")
};
var hubContext = new FakeHubContext(clients);

Console.WriteLine("-- Clients.User(asha) --");
await hubContext.User("asha").OrderStatusChanged(1001, "Shipped");
Console.WriteLine("-- Clients.User(ravi) --");
await hubContext.User("ravi").OrderStatusChanged(1002, "Packed");
Console.WriteLine("-- Clients.All --");
await hubContext.All.ReceiveAnnouncement("Diwali sale starts at 10 AM");

interface INotificationClient
{
    Task OrderStatusChanged(int orderId, string status);
    Task ReceiveAnnouncement(string text);
}

record FakeClient(string ConnectionId, string UserId, string Device) : INotificationClient
{
    private string Prefix => "[" + ConnectionId + " " + UserId + "/" + Device + "] ";
    public Task OrderStatusChanged(int orderId, string status)
    {
        Console.WriteLine(Prefix + "Order " + orderId + " is now " + status);
        return Task.CompletedTask;
    }
    public Task ReceiveAnnouncement(string text)
    {
        Console.WriteLine(Prefix + "Announcement: " + text);
        return Task.CompletedTask;
    }
}

// What SignalR generates for Hub<T>: a proxy that forwards each call to many connections
class ClientProxy(IEnumerable<INotificationClient> targets) : INotificationClient
{
    public async Task OrderStatusChanged(int orderId, string status)
    {
        foreach (var t in targets) await t.OrderStatusChanged(orderId, status);
    }
    public async Task ReceiveAnnouncement(string text)
    {
        foreach (var t in targets) await t.ReceiveAnnouncement(text);
    }
}

class FakeHubContext(List<FakeClient> clients)
{
    public INotificationClient All => new ClientProxy(clients);
    public INotificationClient User(string userId) => new ClientProxy(clients.Where(c => c.UserId == userId));
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

var clients = new List<FakeClient>
{
    new("c1", "asha", "laptop"),
    new("c2", "asha", "phone"),
    new("c3", "ravi", "laptop")
};
var hubContext = new FakeHubContext(clients);

Console.WriteLine("-- Clients.User(asha) --");
await hubContext.User("asha").OrderStatusChanged(1001, "Shipped");
Console.WriteLine("-- Clients.User(ravi) --");
await hubContext.User("ravi").OrderStatusChanged(1002, "Packed");
Console.WriteLine("-- Clients.All --");
await hubContext.All.ReceiveAnnouncement("Diwali sale starts at 10 AM");

interface INotificationClient
{
    Task OrderStatusChanged(int orderId, string status);
    Task ReceiveAnnouncement(string text);
}

record FakeClient(string ConnectionId, string UserId, string Device) : INotificationClient
{
    private string Prefix => "[" + ConnectionId + " " + UserId + "/" + Device + "] ";
    public Task OrderStatusChanged(int orderId, string status)
    {
        Console.WriteLine(Prefix + "Order " + orderId + " is now " + status);
        return Task.CompletedTask;
    }
    public Task ReceiveAnnouncement(string text)
    {
        Console.WriteLine(Prefix + "Announcement: " + text);
        return Task.CompletedTask;
    }
}

// What SignalR generates for Hub<T>: a proxy that forwards each call to many connections
class ClientProxy(IEnumerable<INotificationClient> targets) : INotificationClient
{
    public async Task OrderStatusChanged(int orderId, string status)
    {
        foreach (var t in targets) await t.OrderStatusChanged(orderId, status);
    }
    public async Task ReceiveAnnouncement(string text)
    {
        foreach (var t in targets) await t.ReceiveAnnouncement(text);
    }
}

class FakeHubContext(List<FakeClient> clients)
{
    public INotificationClient All => new ClientProxy(clients);
    public INotificationClient User(string userId) => new ClientProxy(clients.Where(c => c.UserId == userId));
}
`,
        },
        stdin: '',
      },
      result: `-- Clients.User(asha) --
[c1 asha/laptop] Order 1001 is now Shipped
[c2 asha/phone] Order 1001 is now Shipped
-- Clients.User(ravi) --
[c3 ravi/laptop] Order 1002 is now Packed
-- Clients.All --
[c1 asha/laptop] Announcement: Diwali sale starts at 10 AM
[c2 asha/phone] Announcement: Diwali sale starts at 10 AM
[c3 ravi/laptop] Announcement: Diwali sale starts at 10 AM`,
      explanation: 'The interface gives compile-time safety: hubContext.User("asha").OrderStatusChanged(...) cannot be misspelled, unlike SendAsync("OrderStatusChaged"). The proxy forwards one call to every matching connection - Clients.User finds both of Asha\'s devices by user id, not by connection id. (The List<FakeClient> converts to IEnumerable<INotificationClient> through interface covariance.)',
    },
  ],
  interview: [
    { q: 'What is SignalR?', a: 'An ASP.NET Core library for real-time, bi-directional communication between server and clients over a persistent connection, with automatic transport negotiation, groups and RPC-style method calls.', level: 'Easy' },
    { q: 'Which transports does SignalR support and in what order?', a: 'WebSockets first, then Server-Sent Events, then Long Polling. The client negotiates and falls back automatically.', level: 'Easy' },
    { q: 'What is a Hub?', a: 'A server class deriving from Hub/Hub<T> whose public methods clients can call and which can call client methods via Clients. A new instance is created per invocation.', level: 'Easy' },
    { q: 'Clients.Others vs Clients.OthersInGroup vs Clients.Group?', a: 'Others: all connections except the caller. Group: all connections in a group including the caller. OthersInGroup: group members except the caller.', level: 'Medium' },
    { q: 'How do you send a message from a controller or background service?', a: 'Inject IHubContext<THub> (or IHubContext<THub, TClient> for typed hubs) and call hubContext.Clients.All/Group/User(...).', level: 'Medium' },
    { q: 'Why can you not store data in hub fields?', a: 'Hubs are transient: a new instance handles each method call, so field values are lost. Use Context.Items for per-connection data or a singleton/DB for shared state.', level: 'Medium' },
    { q: 'How does a browser client send a JWT to a hub?', a: 'Through accessTokenFactory; the token is sent as the access_token query parameter (WebSockets/SSE cannot set headers), and the server reads it in JwtBearerEvents.OnMessageReceived.', level: 'Hard' },
    { q: 'How does Clients.User identify a user?', a: 'With IUserIdProvider; by default the ClaimTypes.NameIdentifier claim of the authenticated user. All connections of that user receive the message.', level: 'Medium' },
    { q: 'What is needed to scale SignalR across several servers?', a: 'A backplane (Redis via AddStackExchangeRedis) or Azure SignalR Service so messages reach clients on any server; sticky sessions are needed unless WebSockets-only with SkipNegotiation.', level: 'Hard' },
    { q: 'Are SignalR groups persisted after reconnect?', a: 'No. Group membership is tied to a connection id; after a reconnect (new connection id) the client must be added again.', level: 'Medium' },
    { q: 'Why does SignalR CORS need AllowCredentials?', a: 'The negotiate request and connection use credentials (cookies/auth); AllowCredentials must be combined with explicit WithOrigins, not AllowAnyOrigin.', level: 'Medium' },
    { q: 'Output question: 3 users connected; user A calls a hub method that does Clients.Others.SendAsync(...). How many receive it?', a: '2 (everyone except the caller A).', level: 'Easy' },
  ],
  practice: [
    { task: 'Add a "typing..." indicator to the chat: when a user types, all others in the room see "Asha is typing".', hint: 'Hub method UserTyping() using Clients.OthersInGroup.', solution: 'public Task UserTyping() => Clients.OthersInGroup((string)Context.Items["room"]!).SystemMessage(Context.Items["user"] + " is typing..."); JS: msgInput.oninput = () => connection.invoke("UserTyping");' },
    { task: 'Show a live count of online users on every page.', hint: 'Keep a static ConcurrentDictionary of connection ids in the hub or a singleton tracker; broadcast in OnConnected/OnDisconnected.', solution: 'public class PresenceTracker { public ConcurrentDictionary<string, byte> Ids { get; } = new(); } In OnConnectedAsync: tracker.Ids.TryAdd(Context.ConnectionId, 0); await Clients.All.OnlineCount(tracker.Ids.Count); In OnDisconnectedAsync remove and broadcast again.' },
    { task: 'Report progress of a long CSV import (0-100%) to the user who started it.', hint: 'Pass the connection id to the API, then use IHubContext in the background worker.', solution: 'POST /api/import?connectionId=xyz; worker: for each chunk ... await hub.Clients.Client(connectionId).ImportProgress(percent); JS: connection.on("ImportProgress", p => bar.style.width = p + "%"); send connection.connectionId with the upload.' },
    { task: 'Build a live dashboard: a BackgroundService pushes the total sales amount every 5 seconds to the "admins" group.', hint: 'PeriodicTimer + IHubContext<DashboardHub>.', solution: 'while (await timer.WaitForNextTickAsync(ct)) { await using var s = scopes.CreateAsyncScope(); var db = s.ServiceProvider.GetRequiredService<AppDbContext>(); var total = await db.Orders.SumAsync(o => o.Total, ct); await hub.Clients.Group("admins").SendAsync("SalesUpdated", total, ct); } Admins call JoinAdmins() which checks Context.User.IsInRole("Admin").' },
    { task: 'Write a .NET console client that connects to the ChatHub and prints messages.', hint: 'Install-Package Microsoft.AspNetCore.SignalR.Client.', solution: 'var conn = new HubConnectionBuilder().WithUrl("https://localhost:7031/hubs/chat").WithAutomaticReconnect().Build(); conn.On<string, string, string>("ReceiveMessage", (u, m, t) => Console.WriteLine(u + ": " + m)); await conn.StartAsync(); await conn.InvokeAsync("JoinRoom", "dotnet", "ConsoleBot"); Console.ReadLine();' },
  ],
  quiz: [
    { question: 'Which call exposes a hub at /hubs/chat?', options: ['app.UseHub<ChatHub>("/hubs/chat")', 'app.MapHub<ChatHub>("/hubs/chat")', 'builder.Services.AddHub<ChatHub>()', 'app.MapControllers("/hubs/chat")'], answer: 1, explanation: 'MapHub maps the hub endpoint; AddSignalR registers services.' },
    { question: 'Which target sends to every connection except the caller?', options: ['Clients.All', 'Clients.Caller', 'Clients.Others', 'Clients.Group'], answer: 2, explanation: 'Clients.Others excludes the calling connection.' },
    { question: 'Which transport does SignalR prefer when available?', options: ['WebSockets', 'Long Polling', 'Server-Sent Events', 'FTP'], answer: 0, explanation: 'WebSockets give full-duplex, low-latency communication.' },
    { question: 'How do you push a SignalR message from an MVC controller?', options: ['new ChatHub().Clients.All', 'Make the controller derive from Hub', 'Call the JavaScript function directly', 'Inject IHubContext<ChatHub>'], answer: 3, explanation: 'IHubContext gives access to Clients and Groups outside the hub.' },
    { question: 'What is required to run SignalR on 3 servers behind a load balancer?', options: ['Nothing', 'A backplane such as Redis or Azure SignalR Service', 'A bigger server', 'Disable WebSockets'], answer: 1, explanation: 'A backplane forwards messages between servers.' },
  ],
};
