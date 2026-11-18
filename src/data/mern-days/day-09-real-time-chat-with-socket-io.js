export default {
  id: 'day-09-real-time-chat-with-socket-io',
  title: 'Real-time Features with Socket.IO: Chat Rooms, Online Users, Typing Indicator and JWT-Authenticated Sockets',
  module: 'Module 3: Real Features',
  day: 9,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Build a production-style real-time chat for a MERN app: Socket.IO 4 attached to the same Express 5 server, JWT authentication in the handshake, rooms per conversation, messages saved to MongoDB with acknowledgements, online presence across multiple tabs, a typing indicator, a React socket hook that cooperates with TanStack Query, and scaling with the Redis adapter.',
  objectives: [
    'Attach Socket.IO 4 to an Express 5 HTTP server and share CORS/auth settings with the REST API',
    'Authenticate sockets with a JWT in the handshake (io.use middleware) and authorise room joins',
    'Implement rooms, persisted messages with acknowledgements, online users and typing indicators',
    'Write a React socket provider/hook that connects once, cleans up listeners and updates TanStack Query caches',
    'Explain reconnection, missed messages, and horizontal scaling with the Redis adapter and sticky sessions',
  ],
  theory: [
    {
      heading: 'REST + WebSockets: who does what in a chat app',
      content:
        "HTTP is **request-response**: the browser asks, the server answers. For chat the server must **push** new messages to the browser the moment they arrive. Polling every 2 seconds wastes bandwidth and still feels slow.\n\n**WebSocket** is one long-lived, two-way connection. **Socket.IO** is a library on top of WebSocket that adds: automatic reconnection, fallback to HTTP long-polling, **rooms**, **acknowledgements** (callbacks), middleware and broadcasting. Note: a Socket.IO client can only talk to a Socket.IO server (it is not plain WebSocket).\n\nIn a real MERN chat, split the work:\n\n- **REST (Express)**: login, list my conversations, load **message history** with cursor pagination (Day 8), upload attachments (Day 7). These are cacheable and easy to test.\n- **Socket.IO**: send a new message, receive new messages, typing indicator, online/offline status, read receipts, notifications.\n- **MongoDB**: the source of truth. Every message is saved before it is broadcast, so a user who was offline can load it later through REST.\n\nAnalogy: REST is the **post office** (you go and collect letters when you want). Socket.IO is a **phone call** that stays connected, so either side can speak at any moment.",
      syntax: `// event design for the chat (write it down like an API contract)
// client -> server
'room:join'      { roomId }                       ack({ ok, error? })
'message:send'   { roomId, text, tempId }         ack({ ok, message?, error? })
'typing:start'   { roomId }
'typing:stop'    { roomId }
// server -> client
'message:new'    message
'typing'         { roomId, userId, name, isTyping }
'presence'       { userId, online }`,
    },
    {
      heading: 'Setting up Socket.IO on the Express 5 server',
      content:
        "Socket.IO needs the raw Node HTTP server, so create it with `http.createServer(app)` and attach `new Server(httpServer, options)`. Call `httpServer.listen()` (not `app.listen()`), otherwise sockets are not served.\n\nImportant options:\n\n- `cors: { origin: process.env.CLIENT_URL.split(','), credentials: true }` (Socket.IO has its own CORS setting; the Express `cors()` middleware does not apply to it)\n- `pingInterval` / `pingTimeout`: heartbeat to detect dead connections\n- `connectionStateRecovery`: lets a client that briefly disconnects get missed events automatically (works with the default in-memory adapter and the Redis Streams adapter)\n\nStructure the code like your REST code: `socket/index.js` creates the server and auth middleware, `socket/chat.handlers.js` registers events, and handlers call the same **services** (e.g. `messageService.create`) that REST controllers use. Make `io` available to controllers with `app.set('io', io)` so a REST action (\"order shipped\") can also push a notification.",
      syntax: `// server/src/index.js
import http from 'node:http';
import mongoose from 'mongoose';
import app from './app.js';
import { initSocket } from './socket/index.js';

await mongoose.connect(process.env.MONGO_URI);
const server = http.createServer(app);
const io = initSocket(server);
app.set('io', io);
server.listen(process.env.PORT || 5000, () => console.log('API + Socket.IO on', process.env.PORT || 5000));`,
    },
    {
      heading: 'Authenticating sockets with JWT',
      content:
        "Every socket must belong to a known user, otherwise anyone can connect and join any room.\n\n**Client** sends the access token in the handshake: `io(URL, { auth: { token } })`. Do not put the token in the query string (it ends up in server logs). If your auth uses httpOnly cookies, pass `withCredentials: true` and read the cookie from `socket.handshake.headers.cookie` instead.\n\n**Server** verifies it in `io.use((socket, next) => { ... })`, a middleware that runs once per connection. On success store the user on `socket.data.user`; on failure call `next(new Error('unauthorized'))`. The client then receives a `connect_error` event with that message, so it can refresh the token and reconnect.\n\nThree common gotchas:\n\n1. **Token expiry**: the access token expires after 15 minutes, but the socket can stay open for hours. The connection was authenticated at connect time, which is usually fine; for sensitive apps, disconnect sockets when the user logs out (`io.in('user:' + id).disconnectSockets()`).\n2. **Auth is not authorisation**: being logged in does not mean you may join room X. Check membership in MongoDB on `room:join` and on every `message:send`.\n3. **Never trust client data for identity**: take `senderId` from `socket.data.user`, not from the payload.",
      syntax: `import jwt from 'jsonwebtoken';

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('unauthorized'));
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.data.user = { id: payload.sub, name: payload.name, role: payload.role };
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});`,
    },
    {
      heading: 'Rooms, broadcasting and acknowledgements',
      content:
        "A **room** is a named group of sockets on the server. `socket.join('room:42')` adds the socket; `io.to('room:42').emit(...)` sends to everyone in it. Rooms exist only on the server; clients cannot see or join rooms by themselves, they must ask you.\n\nUseful targets:\n\n- `socket.emit()` → only this socket\n- `socket.to(room).emit()` → everyone in the room **except** the sender (good for typing indicators)\n- `io.to(room).emit()` → everyone in the room **including** the sender\n- `io.to('user:' + userId).emit()` → all tabs/devices of one user, if each socket joins a personal room `user:<id>` on connect. This is the standard trick for notifications.\n\n**Acknowledgements** turn an emit into request-response: the client calls `socket.emit('message:send', data, (res) => ...)` and the server calls the callback after saving. The client can then replace its **optimistic** message (shown greyed with a `tempId`) with the saved one, or show \"failed, retry\". With Socket.IO 4 you can also use `await socket.timeout(5000).emitWithAck('message:send', data)`.\n\n**Validate every payload** (Zod) and limit message length; a socket event is user input just like a POST body.",
    },
    {
      heading: 'Online users and typing indicator',
      content:
        "**Presence**: one user can have several sockets (two tabs + phone). Keep a `Map<userId, Set<socketId>>` (or a Redis set when you have multiple servers):\n\n- on `connection`: add the socket id; if it is the user's **first** socket, broadcast `presence { userId, online: true }`\n- on `disconnect`: remove it; if the set is now **empty**, broadcast `online: false` and save `lastSeen` in MongoDB\n\nThis avoids showing a user as offline when they just closed one of two tabs.\n\n**Typing indicator**:\n\n- Client emits `typing:start` when the user types (throttled, e.g. at most every 2 seconds) and `typing:stop` after 3 seconds of no typing or when the message is sent.\n- Server relays with `socket.to(roomId).emit('typing', { userId, name, isTyping })` (not to the sender).\n- Client keeps a set of typing users per room and also **auto-expires** each entry after ~5 seconds in case the stop event is lost (e.g. the sender's network dropped).\n\nTyping and presence events are **volatile** (losing one is fine), so do not save them in MongoDB. You can use `socket.volatile.emit()` for them.",
    },
    {
      heading: 'React side: one socket, clean listeners, TanStack Query cache',
      content:
        "Rules for using Socket.IO in React 19:\n\n1. **Create one socket per app**, not per component. Put it in a context provider created after login, with `autoConnect: false` and call `socket.connect()` when you have a token.\n2. **Register listeners in `useEffect` and remove them in the cleanup** with `socket.off(event, handler)`. In development, StrictMode runs effects twice; without cleanup you get duplicate messages.\n3. **Do not store messages only in component state.** Load history with `useInfiniteQuery(['messages', roomId])` and, when `message:new` arrives, update the cache with `queryClient.setQueryData`. Then switching rooms and coming back is instant, and refetching after reconnect is easy.\n4. **Handle reconnection**: on `connect` after a disconnect, re-join the current room and `invalidateQueries(['messages', roomId])` to fetch anything missed (unless connection state recovery restored it: check `socket.recovered`).\n5. **Handle `connect_error`**: if the message is `unauthorized`, refresh the access token (Day 4), set `socket.auth.token = newToken` and call `socket.connect()` again.",
      syntax: `// client/src/socket/SocketProvider.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../auth/AuthProvider';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
  const { accessToken, refresh } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!accessToken) return;
    const s = io(import.meta.env.VITE_API_URL, { auth: { token: accessToken }, withCredentials: true });
    s.on('connect_error', async (err) => {
      if (err.message === 'unauthorized') {
        s.auth.token = await refresh();
        s.connect();
      }
    });
    setSocket(s);
    return () => { s.disconnect(); setSocket(null); };
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}`,
    },
    {
      heading: 'Scaling Socket.IO: Redis adapter and sticky sessions',
      content:
        "On one server, `io.to(room).emit()` reaches everybody because all sockets live in that process. With **two or more instances** (PM2 cluster, Kubernetes, Render with 2 instances), a user connected to instance A will not receive a message emitted on instance B.\n\nFixes:\n\n1. **Redis adapter** (`@socket.io/redis-adapter` or the Redis Streams adapter): every instance publishes broadcasts to Redis, and the others forward them to their local sockets.\n2. **Sticky sessions**: HTTP long-polling sends several requests per session, and they must hit the same instance. Configure your load balancer for sticky sessions (cookie or IP hash), or force `transports: ['websocket']` on the client (no polling fallback).\n3. Store **presence** in Redis (not a local Map), because each instance only sees its own sockets.\n\nOther production tips: put a reverse proxy that supports WebSocket upgrade (`proxy_set_header Upgrade` in Nginx), set a reasonable `maxHttpBufferSize` (default 1 MB), rate-limit events per socket, and log connect/disconnect counts for monitoring.",
      syntax: `import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pub = createClient({ url: process.env.REDIS_URL });
const sub = pub.duplicate();
await Promise.all([pub.connect(), sub.connect()]);
io.adapter(createAdapter(pub, sub));`,
    },
  ],
  examples: [
    {
      title: 'Complete Socket.IO server: JWT auth, rooms, persisted messages, presence and typing',
      scenario: 'Build the server side of a support/team chat for your MERN app. Users can only join conversations they are members of.',
      steps: [
        'npm i socket.io jsonwebtoken zod (server) and create socket/index.js',
        'Add the JWT io.use middleware and join a personal room user:<id> on connect',
        'Track presence with a Map of userId -> Set of socket ids',
        'Handle room:join with a membership check, message:send with validation + save + broadcast + ack',
        'Relay typing events to the room except the sender; clean up on disconnect',
      ],
      code: `// server/src/socket/index.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const sendSchema = z.object({
  roomId: z.string().length(24),
  text: z.string().trim().min(1).max(2000),
  tempId: z.string().max(64).optional(),
});
const online = new Map(); // userId -> Set(socketId). Use Redis when you run >1 instance.

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL.split(','), credentials: true },
    connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000 },
  });

  io.use((socket, next) => {
    try {
      const payload = jwt.verify(socket.handshake.auth?.token, process.env.JWT_ACCESS_SECRET);
      socket.data.user = { id: payload.sub, name: payload.name };
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const { id: userId, name } = socket.data.user;
    socket.join('user:' + userId);

    // presence (multi-tab aware)
    if (!online.has(userId)) online.set(userId, new Set());
    online.get(userId).add(socket.id);
    if (online.get(userId).size === 1) io.emit('presence', { userId, online: true });
    socket.emit('presence:list', [...online.keys()]);

    socket.on('room:join', async ({ roomId } = {}, ack = () => {}) => {
      const isMember = await Conversation.exists({ _id: roomId, members: userId });
      if (!isMember) return ack({ ok: false, error: 'Not a member of this conversation' });
      socket.join(roomId);
      ack({ ok: true });
    });

    socket.on('room:leave', ({ roomId } = {}) => socket.leave(roomId));

    socket.on('message:send', async (payload, ack = () => {}) => {
      const parsed = sendSchema.safeParse(payload);
      if (!parsed.success) return ack({ ok: false, error: 'Invalid message' });
      const { roomId, text, tempId } = parsed.data;
      if (!socket.rooms.has(roomId)) return ack({ ok: false, error: 'Join the room first' });

      const msg = await Message.create({ conversation: roomId, sender: userId, text });
      await Conversation.updateOne({ _id: roomId }, { lastMessage: msg._id, lastMessageAt: msg.createdAt });
      const dto = { _id: msg._id, roomId, text, sender: { _id: userId, name }, createdAt: msg.createdAt, tempId };

      socket.to(roomId).emit('message:new', dto);  // others
      ack({ ok: true, message: dto });             // sender replaces its optimistic copy
    });

    socket.on('typing:start', ({ roomId } = {}) => {
      if (socket.rooms.has(roomId)) socket.volatile.to(roomId).emit('typing', { roomId, userId, name, isTyping: true });
    });
    socket.on('typing:stop', ({ roomId } = {}) => {
      if (socket.rooms.has(roomId)) socket.volatile.to(roomId).emit('typing', { roomId, userId, name, isTyping: false });
    });

    socket.on('disconnect', async () => {
      const set = online.get(userId);
      set?.delete(socket.id);
      if (set && set.size === 0) {
        online.delete(userId);
        io.emit('presence', { userId, online: false });
        await User.updateOne({ _id: userId }, { lastSeen: new Date() });
      }
    });
  });

  return io;
}`,
      explanation:
        "Authentication happens once in io.use, and the user identity always comes from socket.data.user (never from the payload). Every socket also joins user:<id>, so you can notify all of a user's tabs. room:join checks membership in MongoDB, and message:send double-checks socket.rooms.has(roomId), validates with Zod, saves first, then broadcasts to others and acknowledges to the sender with the saved message (including tempId for optimistic UI). Presence uses a Set per user so closing one of two tabs does not mark the user offline. Typing events are volatile and never stored.",
    },
    {
      title: 'REST side of chat: history, membership and pushing events from a controller (API Lab)',
      scenario: 'Message history is loaded over REST, and a REST POST (e.g. from a mobile client or a bot) must also notify sockets. Here an EventEmitter stands in for io so you can see the flow.',
      steps: [
        'Fake auth: read the user id from an x-user-id header (real app: JWT protect middleware)',
        'GET /api/conversations/:id/messages returns history only for members (403 otherwise)',
        "POST /api/conversations/:id/messages saves the message and calls io.to(roomId).emit('message:new')",
        'The EventEmitter listener logs what Socket.IO would push',
        'Run the requests and check the console tab for the emitted event',
      ],
      code: `// Real controller: req.app.get('io') is the Socket.IO server
export async function postMessage(req, res) {
  const conv = await Conversation.findOne({ _id: req.params.id, members: req.user.id });
  if (!conv) return res.status(403).json({ message: 'Not a member' });
  const msg = await Message.create({ conversation: conv._id, sender: req.user.id, text: req.body.text });
  req.app.get('io').to(String(conv._id)).emit('message:new', msg);
  res.status(201).json(msg);
}`,
      api: {
        code: `const express = require('express');
const { EventEmitter } = require('events');
const app = express();
app.use(express.json());

// stand-in for Socket.IO: io.to(room).emit(event, data)
const bus = new EventEmitter();
const io = { to: (room) => ({ emit: (event, data) => bus.emit('broadcast', room, event, data) }) };
bus.on('broadcast', (room, event, data) => console.log('[socket] to ' + room + ' -> ' + event + ': ' + data.text));
app.set('io', io);

const conversations = [{ id: 'c1', members: ['u1', 'u2'] }];
const messages = [
  { id: 1, conversation: 'c1', sender: 'u2', text: 'Hi Asha, is the deploy done?' },
  { id: 2, conversation: 'c1', sender: 'u1', text: 'Almost, running tests now' },
];

// fake protect middleware (real app: verify JWT)
app.use((req, res, next) => {
  const id = req.get('x-user-id');
  if (!id) return res.status(401).json({ message: 'Login required' });
  req.user = { id };
  next();
});

function loadMemberConversation(req, res, next) {
  const conv = conversations.find(c => c.id === req.params.id);
  if (!conv) return res.status(404).json({ message: 'Conversation not found' });
  if (!conv.members.includes(req.user.id)) return res.status(403).json({ message: 'Not a member' });
  req.conversation = conv;
  next();
}

app.get('/api/conversations/:id/messages', loadMemberConversation, (req, res) => {
  res.json(messages.filter(m => m.conversation === req.conversation.id));
});

app.post('/api/conversations/:id/messages', loadMemberConversation, (req, res) => {
  const text = String(req.body.text || '').trim();
  if (!text || text.length > 2000) return res.status(400).json({ message: 'Message must be 1-2000 characters' });
  const msg = { id: messages.length + 1, conversation: req.conversation.id, sender: req.user.id, text };
  messages.push(msg);
  req.app.get('io').to(req.conversation.id).emit('message:new', msg);
  res.status(201).json(msg);
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/conversations/c1/messages', headers: { 'x-user-id': 'u1' } },
          { method: 'GET', url: '/api/conversations/c1/messages', headers: { 'x-user-id': 'u9' } },
          { method: 'POST', url: '/api/conversations/c1/messages', headers: { 'x-user-id': 'u2' }, body: { text: 'Great, ping me when it is live' } },
          { method: 'POST', url: '/api/conversations/c1/messages', headers: { 'x-user-id': 'u2' }, body: { text: '   ' } },
          { method: 'GET', url: '/api/conversations/c1/messages' },
        ],
      },
      result: "GET /api/conversations/c1/messages → 200 [{\"id\":1,\"conversation\":\"c1\",\"sender\":\"u2\",\"text\":\"Hi Asha, is the deploy done?\"},{\"id\":2,\"conversation\":\"c1\",\"sender\":\"u1\",\"text\":\"Almost, running tests now\"}]\nGET /api/conversations/c1/messages → 403 {\"message\":\"Not a member\"}\nPOST /api/conversations/c1/messages → 201 {\"id\":3,\"conversation\":\"c1\",\"sender\":\"u2\",\"text\":\"Great, ping me when it is live\"}\nPOST /api/conversations/c1/messages → 400 {\"message\":\"Message must be 1-2000 characters\"}\nGET /api/conversations/c1/messages → 401 {\"message\":\"Login required\"}",
      explanation:
        "Member u1 gets the history; u9 is logged in but not a member, so 403 (authentication is not authorisation). The valid POST saves the message, returns 201 and the console shows '[socket] to c1 -> message:new: Great, ping me when it is live', which is what io.to('c1').emit pushes to every connected member. An empty message is rejected with 400 and nothing is broadcast. A request without a user gets 401. Because REST and sockets share the same service logic, mobile apps, bots and the web client all trigger the same real-time updates.",
    },
    {
      title: 'React chat UI with optimistic messages and typing indicator (simulated socket)',
      scenario: 'Two users (Asha and Rahul) chat in one room. The playground uses a tiny in-page fake socket server with the same emit/on/ack API as Socket.IO so you can see rooms, acks and typing events.',
      steps: [
        'Create a fake server that relays events to other sockets in the same room',
        'Each ChatPane gets its own socket, registers listeners in useEffect and removes them in cleanup',
        'On send, show an optimistic message (pending) and replace it when the ack arrives',
        'Emit typing:start while typing and typing:stop after 1.5 s of inactivity',
        'Click Run and type in one pane while watching the other',
      ],
      code: `// client/src/features/chat/ChatRoom.jsx (real app, socket.io-client + TanStack Query)
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../../socket/SocketProvider';

export default function ChatRoom({ roomId, me }) {
  const socket = useSocket();
  const qc = useQueryClient();
  const [typing, setTyping] = useState({});
  const stopTimer = useRef();

  useEffect(() => {
    if (!socket) return;
    socket.emit('room:join', { roomId }, (res) => { if (!res.ok) alert(res.error); });
    const onNew = (msg) => {
      if (msg.roomId !== roomId) return;
      qc.setQueryData(['messages', roomId], (old) => addToLastPage(old, msg));
    };
    const onTyping = ({ roomId: r, userId, name, isTyping }) => {
      if (r !== roomId) return;
      setTyping((t) => { const n = { ...t }; if (isTyping) n[userId] = name; else delete n[userId]; return n; });
    };
    socket.on('message:new', onNew);
    socket.on('typing', onTyping);
    return () => {
      socket.emit('room:leave', { roomId });
      socket.off('message:new', onNew);
      socket.off('typing', onTyping);
    };
  }, [socket, roomId, qc]);

  async function send(text) {
    const tempId = crypto.randomUUID();
    qc.setQueryData(['messages', roomId], (old) =>
      addToLastPage(old, { _id: tempId, tempId, text, sender: me, pending: true }));
    try {
      const res = await socket.timeout(5000).emitWithAck('message:send', { roomId, text, tempId });
      if (!res.ok) throw new Error(res.error);
      qc.setQueryData(['messages', roomId], (old) => replaceTemp(old, tempId, res.message));
    } catch {
      qc.setQueryData(['messages', roomId], (old) => markFailed(old, tempId));
    }
  }

  function onType() {
    socket.emit('typing:start', { roomId });
    clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => socket.emit('typing:stop', { roomId }), 1500);
  }
  // ...render messages from useInfiniteQuery(['messages', roomId]) + input calling onType/send
}`,
      playground: {
        jsx: `const { useState, useEffect, useRef } = React;

// ---- tiny fake Socket.IO server (same idea: rooms, emit, on, ack) ----
function createFakeServer() {
  const sockets = [];
  let nextId = 1;
  return {
    connect(user) {
      const listeners = {};
      const rooms = new Set();
      const socket = {
        user, rooms,
        on: (e, fn) => { (listeners[e] = listeners[e] || []).push(fn); },
        off: (e, fn) => { listeners[e] = (listeners[e] || []).filter(f => f !== fn); },
        _receive: (e, data) => (listeners[e] || []).forEach(fn => fn(data)),
        emit: (e, data, ack) => setTimeout(() => handle(socket, e, data, ack), 150), // network delay
      };
      sockets.push(socket);
      return socket;
    },
  };
  function toOthers(sender, room, e, data) {
    sockets.filter(s => s !== sender && s.rooms.has(room)).forEach(s => s._receive(e, data));
  }
  function handle(socket, e, data, ack) {
    if (e === 'room:join') { socket.rooms.add(data.roomId); ack && ack({ ok: true }); }
    if (e === 'message:send') {
      const text = String(data.text || '').trim();
      if (!text) return ack({ ok: false, error: 'Empty message' });
      const msg = { id: nextId++, roomId: data.roomId, text, sender: socket.user, tempId: data.tempId };
      toOthers(socket, data.roomId, 'message:new', msg);
      ack({ ok: true, message: msg });
    }
    if (e === 'typing:start' || e === 'typing:stop') {
      toOthers(socket, data.roomId, 'typing', { name: socket.user, isTyping: e === 'typing:start' });
    }
  }
}
const server = createFakeServer();

function ChatPane({ user, color }) {
  const [socket] = useState(() => server.connect(user));
  const [messages, setMessages] = useState([]);
  const [typers, setTypers] = useState([]);
  const [text, setText] = useState('');
  const stopTimer = useRef();

  useEffect(() => {
    socket.emit('room:join', { roomId: 'team' }, res => console.log(user, 'joined team:', res.ok));
    const onNew = msg => setMessages(m => [...m, msg]);
    const onTyping = ({ name, isTyping }) =>
      setTypers(t => isTyping ? [...new Set([...t, name])] : t.filter(n => n !== name));
    socket.on('message:new', onNew);
    socket.on('typing', onTyping);
    return () => { socket.off('message:new', onNew); socket.off('typing', onTyping); };
  }, [socket]);

  function onChange(e) {
    setText(e.target.value);
    socket.emit('typing:start', { roomId: 'team' });
    clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => socket.emit('typing:stop', { roomId: 'team' }), 1500);
  }

  function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const tempId = 'tmp-' + Date.now();
    setMessages(m => [...m, { id: tempId, tempId, text, sender: user, pending: true }]); // optimistic
    setText('');
    clearTimeout(stopTimer.current);
    socket.emit('typing:stop', { roomId: 'team' });
    socket.emit('message:send', { roomId: 'team', text, tempId }, res => {
      setMessages(m => m.map(x => x.tempId === tempId ? (res.ok ? res.message : { ...x, failed: true }) : x));
    });
  }

  return (
    <div style={{ flex: 1, border: '2px solid ' + color, borderRadius: 8, padding: 8, minWidth: 220 }}>
      <b style={{ color }}>{user}</b>
      <div style={{ height: 180, overflowY: 'auto', background: '#fafafa', margin: '6px 0', padding: 4 }}>
        {messages.map(m => (
          <div key={m.id} style={{ textAlign: m.sender === user ? 'right' : 'left', opacity: m.pending ? 0.5 : 1 }}>
            <span style={{ display: 'inline-block', background: m.sender === user ? color : '#e5e7eb', color: m.sender === user ? '#fff' : '#111', borderRadius: 12, padding: '4px 10px', margin: 2 }}>
              {m.sender !== user && <small>{m.sender}: </small>}{m.text}{m.pending ? ' ...' : ''}
            </span>
          </div>
        ))}
      </div>
      <div style={{ height: 18, fontSize: 12, color: '#666' }}>{typers.length ? typers.join(', ') + ' is typing...' : ''}</div>
      <form onSubmit={send} style={{ display: 'flex', gap: 4 }}>
        <input value={text} onChange={onChange} placeholder="Type a message" style={{ flex: 1 }} />
        <button>Send</button>
      </form>
    </div>
  );
}

function App() {
  return (
    <div style={{ fontFamily: 'system-ui', display: 'flex', gap: 12, padding: 12, flexWrap: 'wrap' }}>
      <ChatPane user="Asha" color="#2563eb" />
      <ChatPane user="Rahul" color="#16a34a" />
    </div>
  );
}`,
      },
      result: 'Console logs "Asha joined team: true" and "Rahul joined team: true". Typing in Asha\'s box shows "Asha is typing..." under Rahul\'s messages, and it disappears 1.5 s after she stops. When Asha sends, her bubble appears instantly at 50% opacity with "..." and becomes solid when the ack arrives; Rahul receives the message in his pane.',
      explanation:
        "Each pane owns one socket, like each browser tab in the real app. Listeners are added in useEffect and removed in the cleanup (with StrictMode this prevents duplicate handlers). The server sends message:new and typing only to OTHER sockets in the room (socket.to(room) in real Socket.IO), while the sender gets the saved message through the acknowledgement callback and swaps its optimistic copy using tempId. The typing:stop timer is reset on every keystroke, which is a debounce.",
    },
    {
      title: 'Online users list across tabs and the Redis adapter for multiple servers',
      scenario: 'Show a green dot next to online teammates, and make it work when the API runs on 3 instances behind a load balancer.',
      steps: [
        'Store presence in Redis: a set of socket ids per user (SADD / SREM)',
        'Emit presence only when a user goes from 0 to 1 or 1 to 0 sockets',
        'Attach the Redis adapter so io.emit reaches sockets on all instances',
        'In React, keep a Set of online user ids in a small hook',
        'Load the initial list on connect, then apply presence events',
      ],
      code: `// ===== server/src/socket/presence.js (multi-instance safe) =====
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

export async function setupRedis(io) {
  const pub = createClient({ url: process.env.REDIS_URL });
  const sub = pub.duplicate();
  await Promise.all([pub.connect(), sub.connect()]);
  io.adapter(createAdapter(pub, sub));

  io.on('connection', async (socket) => {
    const userId = socket.data.user.id;
    const count = await pub.sAdd('presence:' + userId, socket.id).then(() => pub.sCard('presence:' + userId));
    await pub.sAdd('online-users', userId);
    if (count === 1) io.emit('presence', { userId, online: true });
    socket.emit('presence:list', await pub.sMembers('online-users'));

    socket.on('disconnect', async () => {
      await pub.sRem('presence:' + userId, socket.id);
      if ((await pub.sCard('presence:' + userId)) === 0) {
        await pub.sRem('online-users', userId);
        io.emit('presence', { userId, online: false });
      }
    });
  });
}
// Note: if an instance crashes, its socket ids stay in Redis. Production apps add a TTL heartbeat
// per socket or clean up ids of dead instances on startup.

// ===== client/src/socket/usePresence.js =====
import { useEffect, useState } from 'react';
import { useSocket } from './SocketProvider';

export function usePresence() {
  const socket = useSocket();
  const [online, setOnline] = useState(() => new Set());
  useEffect(() => {
    if (!socket) return;
    const onList = (ids) => setOnline(new Set(ids));
    const onPresence = ({ userId, online: isOn }) =>
      setOnline((prev) => { const s = new Set(prev); isOn ? s.add(userId) : s.delete(userId); return s; });
    socket.on('presence:list', onList);
    socket.on('presence', onPresence);
    return () => { socket.off('presence:list', onList); socket.off('presence', onPresence); };
  }, [socket]);
  return online;
}

// usage
const online = usePresence();
<span className={online.has(member._id) ? 'dot dot-green' : 'dot dot-grey'} />

// ===== client: avoid sticky-session issues on multi-instance hosts =====
const socket = io(import.meta.env.VITE_API_URL, { auth: { token }, transports: ['websocket'] });`,
      explanation:
        "With several instances, each process only knows its own sockets, so presence must live in shared storage (Redis sets) and broadcasts must go through the Redis adapter. Counting socket ids per user makes multi-tab presence correct. The client receives a full list once (presence:list) and then incremental updates. Forcing the websocket transport avoids long-polling, which would otherwise need sticky sessions on the load balancer.",
    },
  ],
  interview: [
    {
      q: 'What is the difference between WebSocket and Socket.IO?',
      a: "WebSocket is a browser/IETF protocol for a persistent full-duplex connection. Socket.IO is a library that uses WebSocket (with HTTP long-polling fallback) and adds automatic reconnection, heartbeats, rooms, namespaces, acknowledgements, middleware, broadcasting and adapters for scaling. A Socket.IO client cannot connect to a plain WebSocket server and vice versa because Socket.IO has its own protocol on top.",
      level: 'Easy',
    },
    {
      q: 'How do you authenticate Socket.IO connections with JWT?',
      a: "Send the token in the handshake: io(url, { auth: { token } }). On the server use io.use((socket, next) => ...) to verify it with jwt.verify, store the user on socket.data.user and call next(); on failure call next(new Error('unauthorized')), which the client receives as connect_error. Avoid tokens in query strings (logged). For cookie auth, read socket.handshake.headers.cookie with withCredentials enabled.",
      level: 'Medium',
    },
    {
      q: 'Explain rooms in Socket.IO. Can a client join a room by itself?',
      a: "Rooms are server-side groups of sockets: socket.join(room), io.to(room).emit(...). Clients cannot join directly; they send an event (e.g. room:join) and the server decides, after checking permissions, whether to call socket.join. A common pattern is a personal room per user (user:<id>) to reach all their devices.",
      level: 'Easy',
    },
    {
      q: 'What is the difference between socket.emit, socket.to(room).emit, io.to(room).emit and io.emit?',
      a: "socket.emit sends only to that one socket. socket.to(room).emit sends to everyone in the room except the sender. io.to(room).emit sends to everyone in the room including the sender. io.emit broadcasts to all connected sockets (in the namespace).",
      level: 'Easy',
    },
    {
      q: 'Why should you save a chat message to MongoDB before broadcasting it?',
      a: "MongoDB is the source of truth. If you broadcast first and the save fails, other users see a message that does not exist on refresh. Saving first gives the message a real _id and createdAt for ordering and de-duplication, and offline users can load it later via REST history. The sender receives the saved message in the acknowledgement.",
      level: 'Medium',
    },
    {
      q: 'How do you implement an online/offline indicator when a user has several tabs open?',
      a: "Track a set of socket ids per user (Map<userId, Set<socketId>> or a Redis set with multiple servers). On connect add the id and broadcast online only when the count goes from 0 to 1; on disconnect remove it and broadcast offline only when it reaches 0, also storing lastSeen. Send the current list to new connections.",
      level: 'Medium',
    },
    {
      q: 'How do you handle messages missed during a short disconnection?',
      a: "Options: Socket.IO 4 connectionStateRecovery (server buffers events for a limited time; check socket.recovered on reconnect); otherwise, on reconnect re-join rooms and refetch history since the last received message id/timestamp via REST (e.g. invalidate the TanStack Query cache). Use message ids to de-duplicate.",
      level: 'Hard',
    },
    {
      q: 'Why do you need the Redis adapter and sticky sessions when scaling Socket.IO?',
      a: "Each Node instance only knows its own connected sockets, so io.to(room).emit on instance A would miss users connected to instance B; the Redis adapter relays broadcasts between instances via pub/sub. Sticky sessions are required when HTTP long-polling is used, because the multiple HTTP requests of one session must reach the same instance; alternatively force transports: ['websocket'].",
      level: 'Hard',
    },
    {
      q: 'Why do React apps sometimes receive every socket message twice, and how do you fix it?',
      a: "Listeners are registered in an effect without cleanup, or a new socket is created on every render/component. In development StrictMode mounts effects twice, so you get two listeners. Fix: create one socket in a provider (or module) and in useEffect return a cleanup that calls socket.off(event, handler) with the same handler reference.",
      level: 'Medium',
    },
    {
      q: 'How would you design a typing indicator efficiently?',
      a: "Client emits typing:start (throttled) while typing and typing:stop after a short inactivity timeout or on send. The server relays to others in the room with socket.to(room) and a volatile emit, never persisting it. The receiver shows names and auto-expires each typing entry after a few seconds in case a stop event is lost.",
      level: 'Medium',
    },
    {
      q: 'What are Socket.IO acknowledgements and how do they help optimistic UI?',
      a: "An acknowledgement is a callback passed as the last emit argument (or emitWithAck returning a Promise) that the server calls with a result. The client shows the message immediately with a tempId and pending state, and when the ack returns ok it replaces it with the saved message; on error or timeout (socket.timeout(5000)) it marks it failed with a retry option.",
      level: 'Medium',
    },
    {
      q: 'When would you choose Server-Sent Events instead of Socket.IO?',
      a: "SSE is a simple one-way stream from server to browser over plain HTTP with built-in reconnect, good for notifications, live scores, progress or streaming AI responses. If the client also needs to send frequent real-time events (chat, games, collaboration), WebSockets/Socket.IO fit better. SSE works well with HTTP/2 and needs no extra library on the client.",
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Add read receipts: when a user opens a conversation, mark messages as read and notify the sender in real time with "message:read" so a double tick turns blue.',
      hint: 'Store readBy: [userId] on Message; use updateMany and emit to the room.',
      solution: `// Message model: readBy: [{ type: ObjectId, ref: 'User' }]

// server: in chat handlers
socket.on('messages:read', async ({ roomId, upTo } = {}, ack = () => {}) => {
  if (!socket.rooms.has(roomId)) return ack({ ok: false });
  const userId = socket.data.user.id;
  const result = await Message.updateMany(
    { conversation: roomId, _id: { $lte: upTo }, sender: { $ne: userId }, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } },
  );
  if (result.modifiedCount) socket.to(roomId).emit('message:read', { roomId, userId, upTo });
  ack({ ok: true, updated: result.modifiedCount });
});

// client: when the room is visible and the last message changes
useEffect(() => {
  const last = messages.at(-1);
  if (socket && last && last.sender._id !== me.id && document.visibilityState === 'visible') {
    socket.emit('messages:read', { roomId, upTo: last._id });
  }
}, [socket, roomId, messages.at(-1)?._id]); // eslint-disable-line

useEffect(() => {
  if (!socket) return;
  const onRead = ({ roomId: r, userId, upTo }) => {
    if (r !== roomId) return;
    qc.setQueryData(['messages', roomId], (old) => mapMessages(old, (m) =>
      m._id <= upTo && !m.readBy?.includes(userId) ? { ...m, readBy: [...(m.readBy || []), userId] } : m));
  };
  socket.on('message:read', onRead);
  return () => socket.off('message:read', onRead);
}, [socket, roomId, qc]);

// render: {m.sender._id === me.id && (m.readBy?.length ? <BlueTicks /> : <GreyTicks />)}`,
    },
    {
      task: 'Send real-time notifications from a REST controller: when an admin changes an order status, push "order:updated" to all devices of the order owner, and show a toast in React.',
      hint: "Use the personal room 'user:<id>' and req.app.get('io').",
      solution: `// server/src/controllers/orders.js
export async function updateOrderStatus(req, res) {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true },
  );
  if (!order) return res.status(404).json({ message: 'Order not found' });
  req.app.get('io').to('user:' + order.user).emit('order:updated', {
    orderId: order._id, status: order.status,
  });
  res.json(order);
}

// client/src/socket/useOrderNotifications.js
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSocket } from './SocketProvider';

export function useOrderNotifications() {
  const socket = useSocket();
  const qc = useQueryClient();
  useEffect(() => {
    if (!socket) return;
    const onUpdate = ({ orderId, status }) => {
      toast.success('Order ' + String(orderId).slice(-6) + ' is now ' + status);
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['orders', orderId] });
    };
    socket.on('order:updated', onUpdate);
    return () => socket.off('order:updated', onUpdate);
  }, [socket, qc]);
}
// call useOrderNotifications() once inside the logged-in layout`,
    },
    {
      task: 'Write a Jest test for the Socket.IO server: two clients connect with valid tokens, both join a room, client A sends a message, and client B receives message:new while A gets an ack. Also test that a bad token is rejected.',
      hint: 'Start the server on port 0 in beforeAll, use socket.io-client, mock Mongo models or use mongodb-memory-server.',
      solution: `// server/test/socket.test.js
import http from 'node:http';
import { io as Client } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { initSocket } from '../src/socket/index.js';
import Conversation from '../src/models/Conversation.js';

let server, ioServer, url, mongo, room;
const token = (id, name) => jwt.sign({ sub: id, name }, process.env.JWT_ACCESS_SECRET, { expiresIn: '5m' });
const connect = (t) => new Promise((resolve, reject) => {
  const c = Client(url, { auth: { token: t }, transports: ['websocket'], forceNew: true });
  c.on('connect', () => resolve(c));
  c.on('connect_error', reject);
});

beforeAll(async () => {
  process.env.JWT_ACCESS_SECRET = 'test-secret';
  process.env.CLIENT_URL = 'http://localhost:5173';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  const a = new mongoose.Types.ObjectId(), b = new mongoose.Types.ObjectId();
  room = await Conversation.create({ members: [a, b] });
  room.a = String(a); room.b = String(b);
  server = http.createServer();
  ioServer = initSocket(server);
  await new Promise((r) => server.listen(0, r));
  url = 'http://localhost:' + server.address().port;
});

afterAll(async () => {
  ioServer.close();
  await mongoose.disconnect();
  await mongo.stop();
});

test('rejects invalid token', async () => {
  await expect(connect('bad.token')).rejects.toThrow('unauthorized');
});

test('message is delivered to room members', async () => {
  const A = await connect(token(room.a, 'Asha'));
  const B = await connect(token(room.b, 'Rahul'));
  const roomId = String(room._id);
  await A.emitWithAck('room:join', { roomId });
  await B.emitWithAck('room:join', { roomId });

  const received = new Promise((r) => B.once('message:new', r));
  const ack = await A.emitWithAck('message:send', { roomId, text: 'hello', tempId: 't1' });

  expect(ack.ok).toBe(true);
  expect(ack.message.tempId).toBe('t1');
  expect((await received).text).toBe('hello');
  A.close(); B.close();
});`,
    },
    {
      task: 'Rate-limit socket events: allow at most 10 message:send events per 10 seconds per socket; extra events get ack({ ok:false, error:"Slow down" }).',
      hint: 'Use socket.use() (per-socket middleware) with a simple token bucket stored on socket.data.',
      solution: `// server/src/socket/rateLimit.js
export function socketRateLimit({ event = 'message:send', limit = 10, windowMs = 10_000 } = {}) {
  return (socket) => {
    socket.data.hits = [];
    socket.use(([name, payload, ack], next) => {
      if (name !== event) return next();
      const now = Date.now();
      socket.data.hits = socket.data.hits.filter((t) => now - t < windowMs);
      if (socket.data.hits.length >= limit) {
        if (typeof ack === 'function') ack({ ok: false, error: 'Slow down' });
        else if (typeof payload === 'function') payload({ ok: false, error: 'Slow down' });
        return; // do not call next(): event is dropped
      }
      socket.data.hits.push(now);
      next();
    });
  };
}

// in initSocket
const limitMessages = socketRateLimit();
io.on('connection', (socket) => {
  limitMessages(socket);
  // ...register handlers
});`,
    },
  ],
  quiz: [
    {
      question: 'Where should the server get the sender id of a chat message?',
      options: ['From payload.senderId sent by the client', 'From socket.data.user set by the JWT auth middleware', 'From the room name', 'From localStorage'],
      answer: 1,
      explanation: 'Never trust identity sent in the payload. The authenticated user is attached once in io.use and read from socket.data.',
    },
    {
      question: 'Which call sends a typing event to everyone in the room except the user who is typing?',
      options: ['io.emit("typing")', 'io.to(roomId).emit("typing")', 'socket.emit("typing")', 'socket.to(roomId).emit("typing")'],
      answer: 3,
      explanation: 'socket.to(room) excludes the sender; io.to(room) includes everyone in the room.',
    },
    {
      question: 'Your API runs on 3 instances and users on different instances do not receive each other\'s messages. What is missing?',
      options: ['A Socket.IO adapter such as the Redis adapter', 'helmet()', 'A bigger pingTimeout', 'A text index on messages'],
      answer: 0,
      explanation: 'Each instance only knows its own sockets. The Redis adapter forwards broadcasts between instances.',
    },
    {
      question: 'In React, why must socket.on listeners be removed in the useEffect cleanup?',
      options: ['Socket.IO forbids more than one listener', 'Cleanup makes the socket reconnect faster', 'Otherwise re-renders/StrictMode add duplicate listeners and messages appear twice', 'It is only needed in production'],
      answer: 2,
      explanation: 'Every effect run adds another listener unless the previous one is removed with socket.off(event, handler).',
    },
    {
      question: 'Which data should NOT be stored in MongoDB in a chat app?',
      options: ['Messages', 'Conversation members', 'User lastSeen time', 'Each individual "is typing" event'],
      answer: 3,
      explanation: 'Typing events are short-lived and volatile; losing one is harmless, so they are only relayed, never persisted.',
    },
  ],
};
