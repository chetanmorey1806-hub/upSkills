export default {
  lesson: 'extra-48-signalr-real-time',
  minutes: 25,
  intro: 'Push real-time updates with SignalR hubs: send to all, the caller, others and groups, and connect from JavaScript.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Map the hub so clients can connect at \`/chathub\`:
\`app.______<ChatHub>("/chathub");\``,
      example: { title: 'register services', code: 'builder.Services.AddSignalR();' },
      accept: ['MapHub'],
      caseSensitive: true,
      explain: '`AddSignalR()` registers the services and `app.MapHub<ChatHub>("/chathub")` exposes the hub endpoint. The JavaScript client then uses `.withUrl("/chathub")`.',
    },
    {
      type: 'output',
      mins: 5,
      q: `Clients **A**, **B** and **C** are connected. A and B joined group \`"class-10"\`, C did not. Client **A** calls \`Announce("Exam on Monday")\`. Each client's \`connection.on(...)\` handler prints \`<client> got <method>: <message>\`. List what is printed, grouped by the calls in the method (A's lines first, then B, then C for each call).`,
      example: { title: 'target choices', code: `Clients.All      // everyone
Clients.Caller   // only the sender
Clients.Others   // everyone except the sender
Clients.Group(g) // connections in group g` },
      code: `public class SchoolHub : Hub
{
    public async Task Announce(string msg)
    {
        await Clients.Caller.SendAsync("Ack", msg);
        await Clients.Others.SendAsync("Notice", msg);
        await Clients.Group("class-10").SendAsync("ClassNotice", msg);
    }
}`,
      expected: `A got Ack: Exam on Monday
B got Notice: Exam on Monday
C got Notice: Exam on Monday
A got ClassNotice: Exam on Monday
B got ClassNotice: Exam on Monday`,
      explain: '`Caller` = only A. `Others` = everyone except A (B and C). `Group("class-10")` = all members of the group, **including** the sender A, but not C. Use `OthersInGroup` to skip the sender within a group.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Inside a hub method, add the current connection to the group \`"admins"\`:
\`await Groups.______(Context.ConnectionId, "admins");\``,
      example: { title: 'leaving', code: 'await Groups.RemoveFromGroupAsync(Context.ConnectionId, "admins");' },
      accept: ['AddToGroupAsync'],
      caseSensitive: true,
      explain: '`Groups.AddToGroupAsync(connectionId, groupName)` adds a connection to a named group; groups are created on demand. Group membership is not persisted, so re-join after reconnecting.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `JavaScript client: register a handler for messages the server sends with \`SendAsync("ReceiveMessage", user, text)\`:
\`connection.______("ReceiveMessage", (user, text) => { /* show it */ });\``,
      example: { title: 'calling a hub method from JS', code: 'await connection.invoke("SendMessage", "Asha", "Hi all");' },
      accept: ['on'],
      caseSensitive: true,
      explain: '`connection.on(name, handler)` subscribes to server-to-client calls, and `connection.invoke(name, ...args)` calls a hub method on the server. The method names must match exactly.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about SignalR are TRUE? Select all that apply.',
      options: ['It prefers WebSockets and falls back to Server-Sent Events or Long Polling', 'Hub instances are transient: do not store state in hub fields', 'To send from a controller or background service, inject `IHubContext<ChatHub>`', 'Scaling to several servers needs a backplane such as Redis or Azure SignalR Service', 'SignalR messages are stored and replayed if a client is offline'],
      answers: [0, 1, 2, 3],
      explain: 'SignalR negotiates the best transport. A new hub object is created per call, so keep state elsewhere. `IHubContext<T>` sends from outside hubs. Multiple servers need a backplane. Messages are **not** stored: offline clients miss them unless you persist them yourself.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which feature is a natural fit for SignalR?',
      options: ['Monthly PDF report download', 'Live order-tracking status updates on a food delivery page', 'Password reset email', 'Static About Us page'],
      answer: 1,
      explain: 'SignalR shines when the server must **push** changes instantly to open pages: chats, live dashboards, notifications, order tracking. The other features are normal request/response or background tasks.',
    },
  ],
};
