export default {
  id: 'day-27-real-time-apps-socket-io-websockets',
  title: 'Real-time Apps with Socket.io (WebSockets)',
  module: 'Module 5: Advanced Node',
  day: 27,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'HTTP is request-response: the server cannot speak unless asked. Chat, live notifications, dashboards, multiplayer games and delivery tracking need the server to push data instantly. Today you learn WebSockets and build a chat with rooms, typing indicators, acknowledgements and JWT-authenticated real-time notifications using Socket.io 4.',
  objectives: [
    'Compare polling, long polling, Server-Sent Events and WebSockets',
    'Attach Socket.io to an Express 5 HTTP server and connect from Node and React clients',
    'Use emit, broadcast, rooms and acknowledgements correctly',
    'Authenticate socket connections with JWT middleware (io.use) and push events from REST routes',
    'Scale Socket.io across several servers with the Redis adapter and sticky sessions',
  ],
  theory: [
    {
      heading: 'Why real-time? Phone call vs letters',
      content:
        'Normal HTTP is like sending letters: the client writes a request, the server writes back, and the conversation ends. If the client wants to know whether something new happened, it must write again (**polling**: "any new messages?" every 2 seconds). Most answers are "no" - wasted requests, battery and server work, and still up to 2 seconds of delay.\n\nA **WebSocket** is like a phone call: after one handshake the connection stays open and **both sides can talk at any time** with tiny frames (a few bytes of overhead instead of hundreds of bytes of HTTP headers).\n\nOptions:\n- **Short polling** - simple, wasteful, delayed.\n- **Long polling** - server holds the request until data exists; better, still one request per message.\n- **Server-Sent Events (SSE)** - one long HTTP response the server keeps writing to; server → client only; auto-reconnect; great for notifications/feeds/AI token streaming.\n- **WebSockets** - full duplex (both directions), ideal for chat, games, collaboration.',
      points: [
        'WebSocket handshake: an HTTP GET with Upgrade: websocket → 101 Switching Protocols',
        'URLs: ws:// and wss:// (TLS, always use in production)',
        'Use cases: chat, live notifications, stock tickers, live scores, collaborative editing, ride tracking, IoT dashboards',
      ],
    },
    {
      heading: 'Socket.io vs raw WebSockets',
      content:
        'Node can use raw WebSockets via the `ws` package (and browsers have the native `WebSocket` API). **Socket.io** is a library on top that adds what real apps need:\n- **Automatic reconnection** with backoff and connection state recovery\n- **Fallback** to HTTP long-polling when WebSockets are blocked by proxies\n- **Named events** with JSON data: `socket.emit("chat:message", { text })` instead of parsing raw strings\n- **Rooms** and **namespaces** for grouping clients\n- **Acknowledgements** (request/response over a socket)\n- **Middleware** for authentication\n- **Adapters** (Redis, Postgres...) to broadcast across many server instances\n\nImportant: a Socket.io client can only talk to a Socket.io server (it uses its own protocol on top of WebSocket). Install `socket.io` on the server and `socket.io-client` in React/Node clients - keep major versions matched (v4).',
    },
    {
      heading: 'Server setup and the emit cheat-sheet',
      content:
        'Socket.io attaches to the Node **HTTP server**, so with Express you create the server yourself: `const httpServer = http.createServer(app); const io = new Server(httpServer, { cors })` and call `httpServer.listen()` - **not** `app.listen()`, which would create a second server without Socket.io.\n\nInside `io.on("connection", (socket) => { ... })` each `socket` is one connected client with a unique `socket.id`.\n\nWho receives an event?\n- `socket.emit(ev, data)` → only this client\n- `io.emit(ev, data)` → every connected client\n- `socket.broadcast.emit(ev, data)` → everyone except this client\n- `io.to("room1").emit(...)` → everyone in room1\n- `socket.to("room1").emit(...)` → everyone in room1 except the sender\n- `io.to(socketId).emit(...)` → one specific client (each socket auto-joins a room named by its id)\n\n**Rooms** are server-side groups: `socket.join("room1")`, `socket.leave("room1")`. Perfect for chat channels, one room per order, one room per user (`user:42`) for private notifications.',
      syntax: `const http = require('http');
const { Server } = require('socket.io');
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: 'http://localhost:5173' } });

io.on('connection', (socket) => {
  socket.on('chat:message', (msg) => io.to(msg.room).emit('chat:message', msg));
  socket.on('disconnect', (reason) => console.log(socket.id, reason));
});
httpServer.listen(3000);`,
      tip: 'Use a "namespace:action" naming convention for events (chat:message, order:status, user:typing) and validate every payload on the server - socket data is untrusted input just like req.body.',
    },
    {
      heading: 'Acknowledgements, auth and the React client',
      content:
        '**Acknowledgements** give request-response semantics: the client passes a callback as the last argument (or uses `await socket.emitWithAck(...)`) and the server calls it: `socket.on("join", (room, ack) => { ...; ack({ ok: true }) })`. Use them when the client must know an action succeeded (message saved, room joined).\n\n**Authentication**: the client sends a token in the handshake `io(url, { auth: { token } })`. Server middleware `io.use((socket, next) => ...)` verifies it with `jwt.verify` and stores the user on `socket.data.user`, or calls `next(new Error("Unauthorized"))` which the client receives as a `connect_error` event.\n\n**React client**: create the socket once (module scope or context), register listeners in `useEffect` and **remove them in the cleanup** (`socket.off(event, handler)`), otherwise every re-render or StrictMode double-mount adds duplicate listeners and each message appears twice.',
      syntax: `// React (socket.io-client)
import { io } from 'socket.io-client';
export const socket = io('http://localhost:3000', { auth: { token }, autoConnect: false });

useEffect(() => {
  const onMessage = (m) => setMessages(prev => [...prev, m]);
  socket.on('chat:message', onMessage);
  return () => socket.off('chat:message', onMessage);   // cleanup!
}, []);`,
    },
    {
      heading: 'Scaling real-time servers',
      content:
        'One Node process can hold tens of thousands of idle sockets, but eventually you run several instances behind a load balancer. Two problems appear:\n1. **Broadcasts**: a user connected to server A does not receive `io.to("room").emit()` executed on server B. Solution: the **Redis adapter** (`@socket.io/redis-adapter`) - every server publishes broadcasts through Redis pub/sub so all servers deliver them.\n2. **Sticky sessions**: HTTP long-polling sends several requests that must reach the same server. Enable sticky sessions (cookie or IP based) on the load balancer, or force `transports: ["websocket"]` on the client.\n\nOther production notes: set `pingInterval/pingTimeout` for dead-connection detection, limit payload size (`maxHttpBufferSize`, default 1 MB), rate-limit events per socket, persist chat messages in a database (sockets are transport, not storage), and use `wss://` behind HTTPS.',
    },
  ],
  examples: [
    {
      title: 'Chat server with rooms, typing indicator and acknowledgements',
      scenario: 'Build the backend of a group chat: users join a room, see who is typing and receive messages instantly.',
      steps: [
        'npm init -y && npm install express socket.io socket.io-client',
        'Create server.js (Express + http.createServer + Socket.io) and run node server.js',
        'Create client-test.js that connects two users, Asha and Ravi, with socket.io-client',
        'Run node client-test.js in a second terminal and watch both outputs',
      ],
      code: `// server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);            // Socket.io attaches to the HTTP server
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173' },     // React dev server
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', online: io.engine.clientsCount }));

io.on('connection', (socket) => {
  const name = socket.handshake.auth.name || 'Guest';
  console.log(\`connected: \${name}\`);

  socket.on('join', (room, ack) => {
    socket.join(room);
    socket.to(room).emit('system', \`\${name} joined \${room}\`);   // everyone in room except sender
    ack({ ok: true, room });                                      // acknowledgement callback
  });

  socket.on('chat:message', ({ room, text }) => {
    if (typeof text !== 'string' || !text.trim()) return;
    io.to(room).emit('chat:message', { from: name, text: text.trim() }); // everyone in room incl. sender
  });

  socket.on('typing', (room) => socket.to(room).emit('typing', name));

  socket.on('disconnect', (reason) => console.log(\`disconnected: \${name} (\${reason})\`));
});

httpServer.listen(3000, () => console.log('Server running on port 3000'));

// client-test.js
const { io } = require('socket.io-client');

const URL = 'http://localhost:3000';
const asha = io(URL, { auth: { name: 'Asha' } });
const ravi = io(URL, { auth: { name: 'Ravi' } });
const wait = (ms) => new Promise(r => setTimeout(r, ms));

for (const [who, s] of [['Asha', asha], ['Ravi', ravi]]) {
  s.on('system', (msg) => console.log(\`[\${who}] system: \${msg}\`));
  s.on('chat:message', (m) => console.log(\`[\${who}] \${m.from}: \${m.text}\`));
  s.on('typing', (n) => console.log(\`[\${who}] \${n} is typing...\`));
}

(async () => {
  await wait(300);
  console.log('Asha join ack:', await asha.emitWithAck('join', 'general'));
  await wait(100);
  console.log('Ravi join ack:', await ravi.emitWithAck('join', 'general'));
  await wait(100);
  ravi.emit('typing', 'general');
  await wait(100);
  ravi.emit('chat:message', { room: 'general', text: 'Hello everyone!' });
  await wait(200);
  asha.close(); ravi.close();
})();`,
      result: `--- client-test.js output
Asha join ack: { ok: true, room: 'general' }
[Asha] system: Ravi joined general
Ravi join ack: { ok: true, room: 'general' }
[Asha] Ravi is typing...
[Asha] Ravi: Hello everyone!
[Ravi] Ravi: Hello everyone!
--- server.js output
Server running on port 3000
connected: Asha
connected: Ravi
disconnected: Asha (client namespace disconnect)
disconnected: Ravi (client namespace disconnect)`,
      explanation:
        'socket.to(room) excluded the sender, so only Asha saw "Ravi joined" and "Ravi is typing". io.to(room) included the sender, so both received the chat message (Ravi sees his own message confirmed by the server). emitWithAck returned the object the server passed to ack(). httpServer.listen (not app.listen) is essential so Express routes and Socket.io share one port.',
    },
    {
      title: 'JWT-authenticated sockets + pushing events from a REST route',
      scenario: 'Only logged-in users may connect. When an admin marks an order as shipped through the REST API, the customer gets an instant notification in their private room.',
      steps: [
        'npm install express socket.io socket.io-client jsonwebtoken',
        'Add io.use() middleware that verifies socket.handshake.auth.token',
        'Join each socket to a private room user:<id>',
        'In PATCH /api/orders/:id/ship emit order:status to that room',
        'Run the server, then a client with a valid token and one with a forged token',
      ],
      code: `// auth-server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// runs once per connection attempt, like Express middleware
io.use((socket, next) => {
  try {
    const payload = jwt.verify(socket.handshake.auth.token, SECRET, { algorithms: ['HS256'] });
    socket.data.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  const { id, role } = socket.data.user;
  socket.join(\`user:\${id}\`);                 // private room per user -> notifications
  if (role === 'admin') socket.join('admins');
  socket.emit('welcome', \`Hello user \${id} (\${role})\`);
});

// REST + real-time together: an admin ships an order, the customer is notified instantly
const orders = [{ id: 1001, userId: '42', status: 'paid' }];
app.patch('/api/orders/:id/ship', (req, res) => {
  const order = orders.find(o => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = 'shipped';
  io.to(\`user:\${order.userId}\`).emit('order:status', { orderId: order.id, status: order.status });
  res.json(order);
});

httpServer.listen(3000, () => console.log('Server running on port 3000'));

// auth-client.js
const { io } = require('socket.io-client');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ sub: '42', role: 'user' }, 'dev-secret-change-me', { expiresIn: '15m' });

const customer = io('http://localhost:3000', { auth: { token } });
customer.on('welcome', async (msg) => {
  console.log('customer welcome:', msg);
  const res = await fetch('http://localhost:3000/api/orders/1001/ship', { method: 'PATCH' });
  console.log('PATCH /api/orders/1001/ship →', res.status, JSON.stringify(await res.json()));
});
customer.on('order:status', (data) => {
  console.log('customer got order:status', data);
  customer.close();
});

const intruder = io('http://localhost:3000', { auth: { token: 'forged' } });
intruder.on('connect_error', (err) => {
  console.log('intruder connect_error:', err.message);
  intruder.close();
});`,
      result: `customer welcome: Hello user 42 (user)
intruder connect_error: Unauthorized
customer got order:status { orderId: 1001, status: 'shipped' }
PATCH /api/orders/1001/ship → 200 {"id":1001,"userId":"42","status":"shipped"}`,
      explanation:
        'The forged token fails jwt.verify, next(new Error("Unauthorized")) rejects the handshake and the client receives connect_error. The valid client is placed in room user:42. The REST handler uses the same io instance to push the update - the socket event even arrived before the HTTP response was printed, showing how instant the push is. (In a real app the ship route is protected by authenticate + authorize("admin") from Day 23.)',
    },
    {
      title: 'API Lab simulation: rooms and broadcasts with EventEmitter',
      scenario: 'The API Lab cannot open WebSockets, but Socket.io rooms are just "who receives this event" rules. Simulate connected clients with inboxes and an EventEmitter bus, then inspect what each user received.',
      steps: [
        'Paste the code into the API Lab',
        'Join Asha and Ravi to "general" and Meera to "random"',
        'Send a message to general, a typing event, and a global announcement',
        'Read each inbox and compare with the Socket.io emit cheat-sheet',
      ],
      code: `// Socket.io                       → simulation
// io.to(room).emit(ev, data)      → deliver to every member of the room
// socket.to(room).emit(ev, data)  → deliver to every member except the sender
// io.emit(ev, data)               → deliver to every connected user`,
      api: {
        code: `const express = require('express');
const { EventEmitter } = require('events');
const app = express();
app.use(express.json());

const bus = new EventEmitter();
const clients = {};   // name -> { rooms: [], inbox: [] }   (each = one connected socket)

bus.on('deliver', ({ to, except, event, data }) => {
  for (const [name, c] of Object.entries(clients)) {
    if (name === except) continue;
    if (to === '*' || c.rooms.includes(to)) c.inbox.push(event + ': ' + data);
  }
});

app.post('/api/connect', (req, res) => {
  const { name, room } = req.body;
  clients[name] = clients[name] || { rooms: [], inbox: [] };
  clients[name].rooms.push(room);
  bus.emit('deliver', { to: room, except: name, event: 'system', data: name + ' joined ' + room }); // socket.to(room)
  res.status(201).json({ name, rooms: clients[name].rooms });
});

app.post('/api/rooms/:room/messages', (req, res) => {
  const { from, text } = req.body;
  bus.emit('deliver', { to: req.params.room, event: 'chat:message', data: from + ': ' + text });     // io.to(room)
  res.status(202).json({ delivered: true });
});

app.post('/api/rooms/:room/typing', (req, res) => {
  bus.emit('deliver', { to: req.params.room, except: req.body.from, event: 'typing', data: req.body.from }); // socket.to(room)
  res.sendStatus(204);
});

app.post('/api/announce', (req, res) => {
  bus.emit('deliver', { to: '*', event: 'announcement', data: req.body.text });                      // io.emit
  res.status(202).json({ delivered: true });
});

app.get('/api/inbox/:name', (req, res) => {
  const c = clients[req.params.name];
  if (!c) return res.status(404).json({ error: 'Not connected' });
  res.json(c.inbox);
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/connect', body: { name: 'Asha', room: 'general' } },
          { method: 'POST', url: '/api/connect', body: { name: 'Ravi', room: 'general' } },
          { method: 'POST', url: '/api/connect', body: { name: 'Meera', room: 'random' } },
          { method: 'POST', url: '/api/rooms/general/typing', body: { from: 'Ravi' } },
          { method: 'POST', url: '/api/rooms/general/messages', body: { from: 'Ravi', text: 'Hello everyone!' } },
          { method: 'POST', url: '/api/announce', body: { text: 'Server restarts at 10 PM' } },
          { method: 'GET', url: '/api/inbox/Asha' },
          { method: 'GET', url: '/api/inbox/Ravi' },
          { method: 'GET', url: '/api/inbox/Meera' },
        ],
      },
      result: "POST /api/connect → 201 {\"name\":\"Asha\",\"rooms\":[\"general\"]}\nPOST /api/connect → 201 {\"name\":\"Ravi\",\"rooms\":[\"general\"]}\nPOST /api/connect → 201 {\"name\":\"Meera\",\"rooms\":[\"random\"]}\nPOST /api/rooms/general/typing → 204\nPOST /api/rooms/general/messages → 202 {\"delivered\":true}\nPOST /api/announce → 202 {\"delivered\":true}\nGET /api/inbox/Asha → 200 [\"system: Ravi joined general\",\"typing: Ravi\",\"chat:message: Ravi: Hello everyone!\",\"announcement: Server restarts at 10 PM\"]\nGET /api/inbox/Ravi → 200 [\"chat:message: Ravi: Hello everyone!\",\"announcement: Server restarts at 10 PM\"]\nGET /api/inbox/Meera → 200 [\"announcement: Server restarts at 10 PM\"]",
      explanation:
        'Asha received "Ravi joined", the typing event, the room message and the announcement. Ravi did not get his own join or typing events (socket.to excludes the sender) but did get the room message (io.to includes everyone). Meera is in another room, so she only got the global announcement. This is exactly how Socket.io routes events - the library additionally keeps the connections open and pushes instead of you polling an inbox.',
    },
    {
      title: 'React chat client with socket.io-client',
      scenario: 'Connect a Vite + React front end to the chat server with correct listener cleanup.',
      steps: [
        'In the React project: npm install socket.io-client',
        'Create src/socket.js exporting one shared socket with autoConnect: false',
        'Create Chat.jsx: connect on mount, join the room with an ack, register listeners and clean them up',
        'Run the server (port 3000) and the React app (port 5173); open two browser tabs',
      ],
      code: `// src/socket.js
import { io } from 'socket.io-client';
export const socket = io(import.meta.env.VITE_API_URL ?? 'http://localhost:3000', { autoConnect: false });

// src/Chat.jsx
import { useEffect, useState } from 'react';
import { socket } from './socket';

export default function Chat({ name, room = 'general' }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.auth = { name };
    socket.connect();

    const onConnect = async () => {
      setConnected(true);
      await socket.emitWithAck('join', room);       // re-join after every reconnect
    };
    const onDisconnect = () => setConnected(false);
    const onMessage = (m) => setMessages(prev => [...prev, m]);
    const onSystem = (text) => setMessages(prev => [...prev, { from: 'system', text }]);
    const onTyping = (who) => { setTyping(who + ' is typing...'); setTimeout(() => setTyping(''), 1500); };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('chat:message', onMessage);
    socket.on('system', onSystem);
    socket.on('typing', onTyping);

    return () => {                                   // cleanup prevents duplicate listeners
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('chat:message', onMessage);
      socket.off('system', onSystem);
      socket.off('typing', onTyping);
      socket.disconnect();
    };
  }, [name, room]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socket.emit('chat:message', { room, text });
    setText('');
  };

  return (
    <div>
      <p>{connected ? 'Online' : 'Connecting...'}</p>
      <ul>{messages.map((m, i) => <li key={i}><b>{m.from}:</b> {m.text}</li>)}</ul>
      <small>{typing}</small>
      <form onSubmit={send}>
        <input value={text} onChange={e => { setText(e.target.value); socket.emit('typing', room); }} />
        <button>Send</button>
      </form>
    </div>
  );
}`,
      result:
        'Two tabs as Asha and Ravi: typing in one tab shows "Ravi is typing..." in the other, and sent messages appear in both lists instantly. Stopping the server shows "Connecting..."; restarting it reconnects automatically and onConnect re-joins the room.',
      explanation:
        'One shared socket avoids opening a new connection per component. Joining inside the connect handler matters because rooms live on the server and are lost when a connection drops. Without the cleanup function React 18/19 StrictMode (which mounts effects twice in development) would register every listener twice.',
    },
    {
      title: 'Scaling with the Redis adapter',
      scenario: 'Run the chat on 3 instances behind a load balancer so a message sent on instance A reaches users connected to instance C.',
      steps: [
        'npm install @socket.io/redis-adapter redis',
        'Create pub and sub Redis clients and attach the adapter',
        'Enable sticky sessions on the load balancer or force the websocket transport on clients',
        'Start several instances (e.g. PM2 cluster or Docker replicas, Day 28-29)',
      ],
      code: `const { createServer } = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL },
  maxHttpBufferSize: 1e5,          // 100 KB max message size
  pingInterval: 25000,
  pingTimeout: 20000,
});

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);  // (inside an async start function)
io.adapter(createAdapter(pubClient, subClient));

httpServer.listen(process.env.PORT || 3000);

// client: skip long-polling so no sticky sessions are needed
// const socket = io(API_URL, { transports: ['websocket'] });`,
      result:
        'With the adapter, io.to("general").emit(...) on any instance is published to Redis and every instance delivers it to its own connected members of "general". Without it, users only receive messages from people connected to the same instance.',
      explanation:
        'Each Socket.io server only knows its own sockets. The Redis adapter turns room broadcasts into pub/sub messages so the cluster behaves like one big server. Sticky sessions are needed only for the HTTP long-polling transport, which sends multiple requests that must reach the same instance.',
    },
  ],
  interview: [
    { q: 'What is the difference between HTTP and WebSockets?', a: 'HTTP is request-response and stateless: the server answers only when the client asks. WebSocket starts with an HTTP Upgrade handshake (101 Switching Protocols) and then keeps a persistent, full-duplex TCP connection where both sides can send messages any time with very small framing overhead.', level: 'Easy' },
    { q: 'Polling vs long polling vs SSE vs WebSockets?', a: 'Polling: client asks repeatedly - simple but wasteful and delayed. Long polling: server holds the request until data arrives. SSE: one long-lived HTTP response streaming server→client events with auto-reconnect, one direction only. WebSockets: bidirectional persistent connection - best for chat/games/collaboration.', level: 'Medium' },
    { q: 'Is Socket.io the same as WebSocket?', a: 'No. Socket.io is a library and protocol built on top of WebSocket (with HTTP long-polling fallback) adding events, rooms, namespaces, acknowledgements, reconnection, middleware and multi-server adapters. A plain WebSocket client cannot talk to a Socket.io server.', level: 'Easy' },
    { q: 'Explain socket.emit, io.emit, socket.broadcast.emit and io.to(room).emit.', a: 'socket.emit → only that client; io.emit → all clients; socket.broadcast.emit → all except the sender; io.to(room).emit → everyone in the room; socket.to(room).emit → everyone in the room except the sender.', level: 'Medium' },
    { q: 'What are rooms and namespaces?', a: 'Rooms are server-side groups of sockets you join/leave dynamically (chat channels, per-user or per-order rooms); clients do not know which rooms they are in. Namespaces (io.of("/admin")) are separate communication channels over the same connection with their own handlers and middleware.', level: 'Medium' },
    { q: 'How do you authenticate Socket.io connections?', a: 'Send a token in the handshake (io(url, { auth: { token } })) and verify it in io.use((socket, next) => ...) middleware with jwt.verify; store the user in socket.data; call next(new Error("Unauthorized")) to reject - the client gets connect_error. Also authorize each event (e.g. can this user post in this room?).', level: 'Medium' },
    { q: 'What are acknowledgements in Socket.io?', a: 'A callback passed as the last emit argument (or emitWithAck returning a Promise) that the receiver calls to confirm processing and return data. They give request-response semantics over a socket, useful for "message saved" confirmations or join results. Timeouts can be set with socket.timeout(ms).emit(...).', level: 'Medium' },
    { q: 'Why do my React chat messages appear twice?', a: 'Listeners were registered multiple times (component re-render, StrictMode double effect, reconnect) without removing them. Register listeners in useEffect and remove them in the cleanup with socket.off(event, handler); create the socket once outside the component.', level: 'Medium' },
    { q: 'Why must you use httpServer.listen and not app.listen with Socket.io?', a: 'Socket.io attaches to an http.Server instance. app.listen creates a new internal server that Socket.io is not attached to, so socket connections would fail (or you would get two servers). Create http.createServer(app), pass it to new Server(), and listen on it.', level: 'Easy' },
    { q: 'How do you scale Socket.io horizontally?', a: 'Use an adapter (Redis/Postgres/Mongo) so broadcasts reach sockets on all instances, and sticky sessions on the load balancer (or websocket-only transport) because long-polling requests must hit the same instance. Also externalize state (sessions, presence) to Redis.', level: 'Hard' },
    { q: 'Should you store chat messages only in Socket.io?', a: 'No. Socket.io is a transport; messages are lost for offline users and on restarts. Persist messages in a DB (MongoDB collection with roomId and createdAt index), load history via REST with cursor pagination, and use sockets only to push new messages.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Add an online-users feature: maintain a Map of socket.id → name, emit "users:online" (array of names) to everyone on every connect and disconnect.',
      hint: 'Update the Map in connection and disconnect handlers, then io.emit.',
      solution: `const online = new Map();
io.on('connection', (socket) => {
  online.set(socket.id, socket.handshake.auth.name || 'Guest');
  io.emit('users:online', [...online.values()]);

  socket.on('disconnect', () => {
    online.delete(socket.id);
    io.emit('users:online', [...online.values()]);
  });
});`,
    },
    {
      task: 'Implement private (direct) messages: client emits "dm" with { to: "<userId>", text }; deliver it only to the target user\'s room user:<id> and acknowledge delivery to the sender.',
      hint: 'Use the JWT middleware from the example; io.to("user:" + to).emit(...).',
      solution: `io.on('connection', (socket) => {
  const me = socket.data.user;              // set by io.use JWT middleware
  socket.join('user:' + me.id);

  socket.on('dm', ({ to, text } = {}, ack = () => {}) => {
    if (!to || typeof text !== 'string' || !text.trim() || text.length > 1000) {
      return ack({ ok: false, error: 'Invalid message' });
    }
    io.to('user:' + to).emit('dm', { from: me.id, text: text.trim() });
    ack({ ok: true });
  });
});`,
    },
    {
      task: 'Persist chat messages: on "chat:message" save to MongoDB (Message model with room, from, text, createdAt), then broadcast the saved document. Add REST GET /api/rooms/:room/messages?before=<id>&limit=20 for history.',
      hint: 'Cursor pagination from Day 21: _id < before, sort by _id desc.',
      solution: `const Message = mongoose.model('Message', new mongoose.Schema({
  room: { type: String, index: true }, from: String, text: { type: String, maxlength: 1000 },
}, { timestamps: true }));

socket.on('chat:message', async ({ room, text }, ack = () => {}) => {
  if (typeof text !== 'string' || !text.trim()) return ack({ ok: false });
  const msg = await Message.create({ room, from: socket.data.user.name, text: text.trim() });
  io.to(room).emit('chat:message', msg);
  ack({ ok: true, id: msg._id });
});

app.get('/api/rooms/:room/messages', authenticate, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const filter = { room: req.params.room };
  if (req.query.before) filter._id = { $lt: req.query.before };
  const items = await Message.find(filter).sort({ _id: -1 }).limit(limit).lean();
  res.json({ items: items.reverse(), nextCursor: items.length === limit ? items[0]._id : null });
});`,
    },
    {
      task: 'Rate-limit chat events per socket: allow at most 5 messages per 10 seconds; otherwise emit an "error:rate" event to that socket.',
      hint: 'Keep an array of timestamps on socket.data and drop the old ones.',
      solution: `io.on('connection', (socket) => {
  socket.data.sent = [];
  socket.on('chat:message', (msg) => {
    const now = Date.now();
    socket.data.sent = socket.data.sent.filter(t => now - t < 10_000);
    if (socket.data.sent.length >= 5) {
      return socket.emit('error:rate', 'Slow down! Max 5 messages per 10 seconds.');
    }
    socket.data.sent.push(now);
    io.to(msg.room).emit('chat:message', { from: socket.data.user?.name, text: msg.text });
  });
});`,
    },
    {
      task: 'Write a Server-Sent Events endpoint GET /api/stream/time in plain Express that pushes the server time every second, and the browser code to read it.',
      hint: 'Headers: Content-Type text/event-stream; write "data: ...\\n\\n"; clear the interval on req close.',
      solution: `app.get('/api/stream/time', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  res.flushHeaders();
  const timer = setInterval(() => {
    res.write('data: ' + JSON.stringify({ time: new Date().toISOString() }) + '\\n\\n');
  }, 1000);
  req.on('close', () => clearInterval(timer));
});

// browser
const es = new EventSource('/api/stream/time');
es.onmessage = (e) => console.log(JSON.parse(e.data).time);`,
    },
  ],
  quiz: [
    { question: 'Which call sends an event to everyone in "room1" EXCEPT the sending socket?', options: ['io.to("room1").emit(...)', 'socket.to("room1").emit(...)', 'io.emit(...)', 'socket.emit(...)'], answer: 1, explanation: 'socket.to(room) excludes the sender; io.to(room) includes everyone.' },
    { question: 'Which HTTP status code does a successful WebSocket handshake return?', options: ['200 OK', '204 No Content', '301 Moved', '101 Switching Protocols'], answer: 3, explanation: 'The server switches protocols from HTTP to WebSocket with 101.' },
    { question: 'Where should a client send its JWT when connecting with Socket.io?', options: ['io(url, { auth: { token } })', 'In every chat message text', 'In a cookie named socket', 'Socket.io does not support auth'], answer: 0, explanation: 'The handshake auth object is read in io.use middleware via socket.handshake.auth.' },
    { question: 'With 3 Socket.io instances behind a load balancer, users miss messages from other instances. What fixes it?', options: ['Increase pingTimeout', 'Use app.listen', 'A Redis (or other) adapter for cross-instance broadcasts', 'Use HTTP polling only'], answer: 2, explanation: 'The adapter publishes broadcasts to all instances.' },
    { question: 'In React, why must you call socket.off in the useEffect cleanup?', options: ['To save bandwidth', 'Socket.io requires it to connect', 'To close the server', 'To avoid duplicate listeners that cause repeated messages'], answer: 3, explanation: 'Each mount would otherwise add another handler.' },
  ],
};
