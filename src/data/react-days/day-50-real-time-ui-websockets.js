export default {
  id: 'day-50-real-time-ui-websockets',
  title: 'Real-time UI: WebSockets and Socket.io Client, Live Notifications, Chat UI, Polling vs WebSockets',
  module: 'Module 10: Advanced Industry Topics',
  day: 50,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Food-delivery tracking, chat apps, live cricket scores, stock tickers and admin "new order" alerts all need data that arrives without the user refreshing. Today you compare polling, long polling, Server-Sent Events and WebSockets, use the native WebSocket API and the Socket.io client from React with a reusable hook, and build live notifications and a chat UI with connection status, reconnection and cleanup.',
  objectives: [
    'Explain polling, long polling, Server-Sent Events and WebSockets and choose the right one',
    'Connect to a WebSocket or Socket.io server from React with proper cleanup',
    'Build a reusable useSocket hook / SocketProvider and subscribe to events in components',
    'Build a live notification bell and a chat UI with auto-scroll, typing indicator and optimistic messages',
    'Handle connection status, reconnection with backoff, authentication and duplicate listeners',
  ],
  theory: [
    {
      heading: 'Four ways to get "live" data',
      content:
        'HTTP is request-response: the server cannot talk unless the client asks. To make a UI feel live there are four common techniques:\n\n1. **Short polling**: ask every N seconds (`setInterval(fetch, 5000)`). Simple, works everywhere, but wastes requests and has up to N seconds delay.\n2. **Long polling**: the client asks, the server holds the request open until there is new data (or a timeout), then the client immediately asks again. Lower delay, still one HTTP request per message.\n3. **Server-Sent Events (SSE)**: `new EventSource("/events")`. One long HTTP connection, **server to client only**, automatic reconnect, text data. Great for notifications, live scores, AI token streaming.\n4. **WebSockets**: `new WebSocket("wss://...")`. A **full-duplex** connection that stays open; both sides send messages any time with tiny overhead. Best for chat, multiplayer games, collaborative editing, live location.\n\nAnalogy: polling is calling the restaurant every 5 minutes asking "is my food ready?". SSE is the restaurant calling you when it is ready. WebSocket is an open phone line where both of you can talk anytime.',
      points: [
        'Dashboard that refreshes every 30 s: polling (TanStack Query `refetchInterval`) is fine',
        'Order status / notifications only from server: SSE or WebSocket',
        'Chat, typing indicators, live cursors, games: WebSocket / Socket.io',
        'Hosting note: serverless platforms (Vercel functions) do not keep WebSockets open; companies use a separate Node server, or managed services like Pusher, Ably, Firebase, Supabase Realtime',
      ],
    },
    {
      heading: 'The native WebSocket API',
      content:
        'The browser has `WebSocket` built in. Use `wss://` (secure) in production.\n\n- `ws.onopen`, `ws.onmessage`, `ws.onclose`, `ws.onerror` events\n- `ws.send(string)`: data is text or binary, so send JSON with `JSON.stringify` and read with `JSON.parse(event.data)`\n- `ws.readyState`: 0 CONNECTING, 1 OPEN, 2 CLOSING, 3 CLOSED\n- `ws.close()` in the **useEffect cleanup**, otherwise every re-mount opens a new connection (React StrictMode mounts twice in development and you will see two connections if you forget cleanup)\n\nThe native API does **not** reconnect automatically, has no "rooms" and no event names: you build those yourself, or use Socket.io.',
      syntax: `useEffect(() => {
  const ws = new WebSocket("wss://api.example.com/live");
  ws.onopen = () => setStatus("online");
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "order:new") setOrders(o => [msg.payload, ...o]);
  };
  ws.onclose = () => setStatus("offline");
  return () => ws.close();            // cleanup: no duplicate connections
}, []);`,
    },
    {
      heading: 'Socket.io client',
      content:
        '**Socket.io** is a library on top of WebSockets (with HTTP long-polling fallback) used by many Node.js backends. It adds:\n- **Named events**: `socket.emit("chat:message", data)` and `socket.on("chat:message", handler)`\n- **Automatic reconnection** with exponential backoff\n- **Rooms** (server side): join "order-1234" or "support-chat-42"\n- **Acknowledgements**: `socket.emit("msg", data, (ack) => ...)` to confirm delivery\n- **Auth on connect**: `io(URL, { auth: { token } })`\n\nInstall: `npm install socket.io-client` (the server must use Socket.io too, a plain WebSocket server will not understand it).\n\nCompany pattern: create the socket **once** in `src/lib/socket.js` with `autoConnect: false`, connect after login, and share it with a Context. In components subscribe in `useEffect` and **always remove the same handler** with `socket.off(event, handler)` in cleanup, otherwise each re-render adds another listener and you see duplicate messages.',
      syntax: `// src/lib/socket.js
import { io } from "socket.io-client";
export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem("token") }),
});

// any component
useEffect(() => {
  function onNotification(n) { setItems(prev => [n, ...prev]); }
  socket.on("notification", onNotification);
  return () => socket.off("notification", onNotification);
}, []);`,
      tip: 'Common bug: calling socket.on inside the component body (not in an effect). It registers a new listener on every render and you get the same message 2, 3, 10 times.',
    },
    {
      heading: 'Architecture: SocketProvider, useSocket hook and state updates',
      content:
        'A clean real-time feature in a company codebase usually has:\n\n- `SocketProvider`: connects when the user logs in, disconnects on logout, exposes `{ socket, status }` via context\n- `useSocketEvent(event, handler)`: a small hook that subscribes/unsubscribes and always calls the latest handler (store it in a ref)\n- **Functional state updates** `setMessages(prev => [...prev, msg])` because handlers are created once and would otherwise read stale state\n- **Merging with server cache**: with TanStack Query, on a socket event either `queryClient.setQueryData(["orders"], old => [n, ...old])` or `invalidateQueries(["orders"])`\n- **Bounded lists**: keep the last 100 notifications, not infinite arrays\n- **Deduplication** by message id, because reconnects can re-send messages',
      syntax: `function useSocketEvent(socket, event, handler) {
  const saved = useRef(handler);
  useEffect(() => { saved.current = handler; });   // always latest handler
  useEffect(() => {
    const listener = (data) => saved.current(data);
    socket.on(event, listener);
    return () => socket.off(event, listener);
  }, [socket, event]);
}`,
    },
    {
      heading: 'Connection status, reconnection and offline UX',
      content:
        'Networks in India switch between Wi-Fi, 4G and no signal often. A real-time UI must show what is going on:\n\n- A small status pill: 🟢 Live / 🟡 Reconnecting… / 🔴 Offline\n- **Exponential backoff** for reconnects: wait 1 s, 2 s, 4 s, 8 s… up to 30 s, plus random jitter so 10,000 clients do not reconnect at the same moment\n- Listen to `window` `online`/`offline` events and reconnect when the network returns\n- On reconnect, **fetch what you missed** (e.g. messages after the last id) because WebSockets do not store history\n- **Heartbeat/ping** to detect dead connections (Socket.io does this for you)\n- Queue outgoing messages while offline and show them as "sending…" (clock icon), then ✓ sent and ✓✓ delivered after the server acknowledges',
      tip: 'Security: authenticate the socket (token in auth, verified by the server on connect), validate every incoming message on the server, never trust client-sent user ids, and render message text as text (React escapes it), never with dangerouslySetInnerHTML.',
    },
    {
      heading: 'About the playgrounds today',
      content:
        'The playground runs in a sandbox with no backend, so the examples use a small **MockSocket** class written in plain JavaScript. It has the same API shape as Socket.io (`on`, `off`, `emit`, `connect`, `disconnect`, `connected`) and a fake server that pushes events with `setTimeout`. The `code` blocks show the real `socket.io-client` / `WebSocket` code. Example 3 uses a real public API (dummyjson.com) to demonstrate polling.\n\nComing next: Day 51 covers React 19 Actions and useOptimistic, which pair nicely with chat-style optimistic updates.',
    },
  ],
  examples: [
    {
      title: 'Live order notifications with a notification bell',
      scenario: 'An admin panel of a food-delivery company must show "New order" notifications instantly with an unread badge, without refreshing the page.',
      steps: [
        'Create the socket once in src/lib/socket.js (autoConnect: false)',
        'Connect in a provider/effect after login and disconnect in cleanup',
        'Subscribe to "order:new" in useEffect with socket.on and remove it with socket.off',
        'Prepend each order with a functional update and keep only the last 20',
        'Show an unread count badge; opening the panel marks all as read',
        'Run the playground: the mock server pushes an order every 3 seconds',
      ],
      code: `// src/lib/socket.js
import { io } from "socket.io-client";
export const socket = io(import.meta.env.VITE_SOCKET_URL, { autoConnect: false });

// src/features/notifications/NotificationBell.jsx
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    socket.connect();
    function onOrder(order) {
      setItems(prev => [{ ...order, read: false }, ...prev].slice(0, 20));
    }
    socket.on("order:new", onOrder);
    return () => {
      socket.off("order:new", onOrder);
      socket.disconnect();
    };
  }, []);

  const unread = items.filter(i => !i.read).length;
  // ...render bell, badge and list
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

// ---- MockSocket: same API shape as socket.io-client (plain JS, no server needed) ----
class MockSocket {
  constructor() { this.handlers = {}; this.connected = false; this.timer = null; }
  on(evt, fn) { (this.handlers[evt] ||= new Set()).add(fn); }
  off(evt, fn) { this.handlers[evt]?.delete(fn); }
  trigger(evt, data) { this.handlers[evt]?.forEach(fn => fn(data)); }
  connect() {
    if (this.connected) return;
    this.connected = true;
    this.trigger("connect");
    const cities = ["Pune", "Mumbai", "Nagpur", "Bengaluru", "Delhi", "Hyderabad"];
    const names = ["Aarav", "Diya", "Kabir", "Meera", "Rohan", "Sneha"];
    const dishes = ["Paneer Butter Masala", "Masala Dosa", "Veg Biryani", "Pav Bhaji", "Chole Bhature"];
    let id = 1001;
    this.timer = setInterval(() => {
      const pick = arr => arr[Math.floor(Math.random() * arr.length)];
      this.trigger("order:new", {
        id: id++, customer: pick(names), city: pick(cities), dish: pick(dishes),
        amount: 150 + Math.floor(Math.random() * 900), at: new Date().toLocaleTimeString("en-IN"),
      });
    }, 3000);
  }
  disconnect() { clearInterval(this.timer); this.connected = false; this.trigger("disconnect"); }
}
const socket = new MockSocket();

// ---- component: same code you would write with socket.io-client ----
function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    const onConnect = () => setStatus("live");
    const onDisconnect = () => setStatus("offline");
    const onOrder = order => setItems(prev => [{ ...order, read: false }, ...prev].slice(0, 20));
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("order:new", onOrder);
    socket.connect();
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("order:new", onOrder);
      socket.disconnect();
    };
  }, []);

  const unread = items.filter(i => !i.read).length;
  const inr = n => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  function toggle() {
    setOpen(o => !o);
    setItems(prev => prev.map(i => ({ ...i, read: true })));
  }

  return (
    <div className="wrap">
      <header>
        <b>🍛 FoodDash Admin</b>
        <span className={"pill " + status}>{status === "live" ? "● Live" : "● Offline"}</span>
        <button className="bell" onClick={toggle} aria-expanded={open} aria-label={"Notifications, " + unread + " unread"}>
          🔔{unread > 0 && <span className="badge">{unread}</span>}
        </button>
      </header>
      {open && (
        <ul className="panel">
          {items.length === 0 && <li className="empty">No orders yet… waiting for the server</li>}
          {items.map(o => (
            <li key={o.id}>
              <b>#{o.id}</b> {o.customer} ({o.city}) ordered {o.dish} · <b>{inr(o.amount)}</b>
              <small>{o.at}</small>
            </li>
          ))}
        </ul>
      )}
      <p className="sr" aria-live="polite">{unread > 0 ? unread + " new orders" : ""}</p>
      <button onClick={() => (socket.connected ? socket.disconnect() : socket.connect())}>
        {status === "live" ? "Simulate disconnect" : "Reconnect"}
      </button>
    </div>
  );
}

function App() { return <NotificationBell />; }`,
        css: `.wrap { max-width: 460px; }
header { display: flex; align-items: center; gap: 10px; padding: 10px; background: #111827; color: white; border-radius: 10px; }
.pill { font-size: 12px; padding: 2px 8px; border-radius: 99px; }
.pill.live { background: #065f46; } .pill.offline, .pill.connecting { background: #7f1d1d; }
.bell { margin-left: auto; position: relative; font-size: 20px; background: none; border: none; cursor: pointer; }
.badge { position: absolute; top: -6px; right: -8px; background: #ef4444; color: white; font-size: 11px; border-radius: 99px; padding: 1px 6px; }
.panel { list-style: none; padding: 0; margin: 8px 0; border: 1px solid #e5e7eb; border-radius: 10px; max-height: 240px; overflow: auto; }
.panel li { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
.panel small { display: block; color: #6b7280; }
.empty { color: #6b7280; }
.sr { position: absolute; left: -9999px; }`,
      },
      result: 'Every 3 seconds the badge count increases. Clicking the bell opens the list (newest first) and marks all as read. "Simulate disconnect" stops events and the pill turns red; "Reconnect" resumes them.',
      explanation:
        'The effect connects, subscribes with named handlers and returns a cleanup that removes exactly those handlers and disconnects, so StrictMode or re-mounts never create duplicates. setItems(prev => ...) uses the latest list even though onOrder was created once. MockSocket is a plain-JS stand-in for socket.io-client; replace it with io(URL) in a real app.',
    },
    {
      title: 'Chat UI: messages, auto-scroll, typing indicator and delivery ticks',
      scenario: 'A customer-support chat like Swiggy or Zomato help: the user sends a message, sees it immediately as "sending", then ✓✓ when the server acknowledges; the agent\'s reply arrives after a typing indicator.',
      steps: [
        'Keep messages in state, each with id, from, text, status',
        'On send, add the message with status "sending" (optimistic) and emit it with an acknowledgement callback',
        'When the ack arrives, update that message status to "delivered"',
        'Listen to "typing" and "chat:message" events from the agent',
        'Auto-scroll to the newest message with a ref and scrollIntoView',
        'Type a message in the playground and press Enter',
      ],
      code: `// Socket.io acknowledgement pattern
function send(text) {
  const tempId = crypto.randomUUID();
  setMessages(m => [...m, { id: tempId, from: "me", text, status: "sending" }]);
  socket.emit("chat:message", { text, roomId }, (ack) => {        // server calls ack()
    setMessages(m => m.map(x => x.id === tempId ? { ...x, id: ack.id, status: ack.ok ? "delivered" : "failed" } : x));
  });
  socket.emit("typing", { roomId, typing: false });
}

// typing indicator: emit at most once every 2 seconds while typing (throttle)
// server: socket.to(roomId).emit("typing", { user, typing: true })`,
      playground: {
        jsx: `const { useState, useEffect, useRef } = React;

class MockChatSocket {
  constructor() { this.h = {}; }
  on(e, fn) { (this.h[e] ||= new Set()).add(fn); }
  off(e, fn) { this.h[e]?.delete(fn); }
  trigger(e, d) { this.h[e]?.forEach(fn => fn(d)); }
  emit(event, data, ack) {
    if (event !== "chat:message") return;
    // fake server: acknowledge after 600 ms, then the agent types and replies
    setTimeout(() => ack && ack({ ok: true, id: "srv-" + Date.now() }), 600);
    setTimeout(() => this.trigger("typing", { user: "Anjali (Support)", typing: true }), 900);
    setTimeout(() => {
      this.trigger("typing", { user: "Anjali (Support)", typing: false });
      const t = data.text.toLowerCase();
      const reply = t.includes("refund") ? "Your refund of ₹349 will reach your UPI account in 3-5 working days."
        : t.includes("late") || t.includes("where") ? "Your rider Ramesh is 2 km away and will arrive in about 8 minutes 🛵"
        : "Thanks! I have noted: \\"" + data.text + "\\". Anything else I can help with?";
      this.trigger("chat:message", { id: "srv-r-" + Date.now(), from: "agent", text: reply, status: "delivered" });
    }, 2400);
  }
}
const socket = new MockChatSocket();

const tick = s => (s === "sending" ? "🕓" : s === "delivered" ? "✓✓" : "⚠");

function App() {
  const [messages, setMessages] = useState([
    { id: "w1", from: "agent", text: "Hi Priya 👋 I am Anjali. How can I help with order #4521?", status: "delivered" },
  ]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    const onMessage = msg => setMessages(m => (m.some(x => x.id === msg.id) ? m : [...m, msg])); // dedupe by id
    const onTyping = ({ user, typing }) => setTypingUser(typing ? user : null);
    socket.on("chat:message", onMessage);
    socket.on("typing", onTyping);
    return () => { socket.off("chat:message", onMessage); socket.off("typing", onTyping); };
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, typingUser]);

  function send(e) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    const tempId = "tmp-" + Date.now();
    setMessages(m => [...m, { id: tempId, from: "me", text: value, status: "sending" }]); // optimistic
    setText("");
    socket.emit("chat:message", { text: value }, ack => {
      setMessages(m => m.map(x => (x.id === tempId ? { ...x, id: ack.id, status: ack.ok ? "delivered" : "failed" } : x)));
    });
  }

  return (
    <div className="chat">
      <div className="top">Help · Order #4521</div>
      <ol className="list" aria-live="polite">
        {messages.map(m => (
          <li key={m.id} className={"msg " + m.from}>
            <span>{m.text}</span>
            {m.from === "me" && <small aria-label={m.status}>{tick(m.status)}</small>}
          </li>
        ))}
        {typingUser && <li className="typing">{typingUser} is typing<span className="dots">...</span></li>}
        <li ref={endRef} aria-hidden="true" />
      </ol>
      <form onSubmit={send} className="composer">
        <label htmlFor="msg" className="sr">Message</label>
        <input id="msg" value={text} onChange={e => setText(e.target.value)} placeholder="Try: where is my order? / refund" autoComplete="off" />
        <button disabled={!text.trim()}>Send</button>
      </form>
    </div>
  );
}`,
        css: `.chat { max-width: 380px; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; height: 420px; }
.top { background: #fc8019; color: white; padding: 10px 14px; font-weight: 600; }
.list { list-style: none; margin: 0; padding: 10px; flex: 1; overflow-y: auto; background: #f9fafb; }
.msg { max-width: 78%; padding: 8px 10px; border-radius: 12px; margin: 6px 0; font-size: 14px; display: flex; gap: 6px; align-items: flex-end; }
.msg.agent { background: white; border: 1px solid #e5e7eb; }
.msg.me { background: #dcfce7; margin-left: auto; }
.msg small { font-size: 11px; color: #2563eb; white-space: nowrap; }
.typing { color: #6b7280; font-style: italic; font-size: 13px; }
.dots { animation: blink 1s infinite; } @keyframes blink { 50% { opacity: .2; } }
.composer { display: flex; gap: 6px; padding: 8px; border-top: 1px solid #e5e7eb; }
.composer input { flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #d1d5db; }
.composer button { padding: 8px 12px; background: #fc8019; color: white; border: none; border-radius: 8px; }
.composer button:disabled { opacity: .5; }
.sr { position: absolute; left: -9999px; }`,
      },
      result: 'Your message appears instantly with 🕓, switches to ✓✓ after ~0.6 s, then "Anjali (Support) is typing..." shows and a context-aware reply arrives. The list scrolls to the newest message automatically.',
      explanation:
        'The message is added optimistically with a temporary id; the acknowledgement callback (a Socket.io feature) swaps in the server id and status. Incoming messages are deduplicated by id. A sentinel <li ref={endRef}> at the bottom plus scrollIntoView keeps the newest message visible. MockChatSocket is a plain-JS stand-in for a Socket.io server.',
    },
    {
      title: 'Polling vs push: comparing request counts',
      scenario: 'Show a "thought of the day" panel. Version A polls a real API every 4 seconds; version B receives pushes. Count network requests to see the cost of polling.',
      steps: [
        'Write a usePolling(fn, ms, enabled) hook with setInterval and cleanup',
        'Pause polling when the browser tab is hidden (document.visibilityState)',
        'Fetch https://dummyjson.com/quotes/random on each tick and count requests',
        'Compare with the TanStack Query version: useQuery({ queryKey, queryFn, refetchInterval: 4000 })',
        'Run the playground, switch the tab away and back, and watch the counter',
      ],
      code: `// TanStack Query does polling for you (Day 37)
const { data } = useQuery({
  queryKey: ["quote"],
  queryFn: () => fetch("https://dummyjson.com/quotes/random").then(r => r.json()),
  refetchInterval: 4000,                 // poll every 4 s
  refetchIntervalInBackground: false,    // pause when tab hidden
});

// Server-Sent Events: server push over plain HTTP (one direction)
useEffect(() => {
  const es = new EventSource("/api/quotes/stream");
  es.onmessage = (e) => setQuote(JSON.parse(e.data));
  return () => es.close();
}, []);`,
      playground: {
        jsx: `const { useState, useEffect, useRef } = React;

function usePolling(callback, ms, enabled) {
  const saved = useRef(callback);
  useEffect(() => { saved.current = callback; });
  useEffect(() => {
    if (!enabled) return;
    saved.current();                                     // run immediately
    const id = setInterval(() => {
      if (document.visibilityState === "visible") saved.current(); // skip when tab hidden
    }, ms);
    return () => clearInterval(id);
  }, [ms, enabled]);
}

function PollingPanel() {
  const [quote, setQuote] = useState(null);
  const [requests, setRequests] = useState(0);
  const [changes, setChanges] = useState(0);
  const [error, setError] = useState("");
  const [on, setOn] = useState(true);
  const lastId = useRef(null);

  usePolling(async () => {
    setRequests(r => r + 1);
    try {
      const res = await fetch("https://dummyjson.com/quotes/random");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const q = await res.json();
      if (lastId.current !== q.id) setChanges(c => c + 1);
      lastId.current = q.id;
      setQuote(q);
      setError("");
    } catch (e) { setError(e.message); }
  }, 4000, on);

  return (
    <section className="box">
      <h3>A. Short polling (real API, every 4 s)</h3>
      {error && <p className="err">⚠ {error}</p>}
      <blockquote>{quote ? "“" + quote.quote + "” — " + quote.author : "Loading…"}</blockquote>
      <p>HTTP requests sent: <b>{requests}</b> · new data received: <b>{changes}</b></p>
      <button onClick={() => setOn(o => !o)}>{on ? "Pause polling" : "Resume polling"}</button>
    </section>
  );
}

function PushPanel() {
  const [score, setScore] = useState({ runs: 142, wickets: 3, overs: 18.2 });
  const [pushes, setPushes] = useState(0);
  useEffect(() => {
    // pretend server pushes over ONE open WebSocket only when something happens
    let t;
    const schedule = () => {
      t = setTimeout(() => {
        setScore(s => {
          const ball = [0, 1, 1, 2, 4, 6, "W"][Math.floor(Math.random() * 7)];
          let overs = Math.round((s.overs + 0.1) * 10) / 10;
          if (Math.round((overs % 1) * 10) === 6) overs = Math.floor(overs) + 1;
          return ball === "W" ? { ...s, wickets: Math.min(10, s.wickets + 1), overs } : { ...s, runs: s.runs + ball, overs };
        });
        setPushes(p => p + 1);
        schedule();
      }, 2000 + Math.random() * 5000);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);
  return (
    <section className="box">
      <h3>B. Push (simulated WebSocket)</h3>
      <p className="score">🏏 IND {score.runs}/{score.wickets} <small>({score.overs} ov)</small></p>
      <p>Connections opened: <b>1</b> · messages pushed: <b>{pushes}</b> (only when a ball is bowled)</p>
    </section>
  );
}

function App() {
  return (
    <div>
      <PollingPanel />
      <PushPanel />
    </div>
  );
}`,
        css: `.box { border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px 14px; margin-bottom: 12px; max-width: 480px; }
h3 { margin: 4px 0 8px; font-size: 16px; }
blockquote { margin: 0 0 8px; color: #374151; font-style: italic; min-height: 40px; }
.score { font-size: 24px; font-weight: 700; }
.err { color: #b91c1c; }`,
      },
      result: 'Panel A fires a real HTTP request every 4 seconds (the counter keeps climbing even when nothing important changed) and pauses while the tab is hidden. Panel B updates only when an event happens, over one connection.',
      explanation:
        'Polling is easy and cache-friendly but pays for every request, even empty ones. Push sends data only when it changes. usePolling stores the latest callback in a ref so the interval is not recreated on every render, and the cleanup clears the interval on pause/unmount. Choose polling for slow-changing dashboards and WebSockets/SSE for truly live data.',
    },
    {
      title: 'Reconnection with exponential backoff and a connection status bar',
      scenario: 'A delivery-tracking screen must survive network drops: show "Reconnecting in 4 s…", retry with growing delays, and reconnect as soon as the browser comes back online.',
      steps: [
        'Write a useWebSocket(url) hook that creates a WebSocket in an effect',
        'On close (not caused by us), schedule a reconnect with delay = min(30 s, 1 s × 2^attempt) + jitter',
        'Reset attempts to 0 on a successful open',
        'Listen to window "online" to retry immediately; close the socket and clear timers in cleanup',
        'In the playground use the buttons to simulate drops and watch the backoff grow',
      ],
      code: `export function useWebSocket(url, onMessage) {
  const [status, setStatus] = useState("connecting");
  const handlerRef = useRef(onMessage);
  useEffect(() => { handlerRef.current = onMessage; });

  useEffect(() => {
    let ws, timer, attempt = 0, closedByUs = false;
    function connect() {
      setStatus(attempt ? "reconnecting" : "connecting");
      ws = new WebSocket(url);
      ws.onopen = () => { attempt = 0; setStatus("open"); };
      ws.onmessage = (e) => handlerRef.current(JSON.parse(e.data));
      ws.onclose = () => {
        if (closedByUs) return;
        const delay = Math.min(30000, 1000 * 2 ** attempt) + Math.random() * 500;
        attempt++;
        setStatus("offline");
        timer = setTimeout(connect, delay);
      };
    }
    const onOnline = () => { clearTimeout(timer); if (ws.readyState === WebSocket.CLOSED) connect(); };
    window.addEventListener("online", onOnline);
    connect();
    return () => { closedByUs = true; clearTimeout(timer); window.removeEventListener("online", onOnline); ws.close(); };
  }, [url]);

  return status;
}`,
      playground: {
        jsx: `const { useState, useEffect, useRef } = React;

// Fake WebSocket-like connection we can break on purpose
function createFakeConnection(handlers, failNext) {
  const conn = { closed: false };
  const openTimer = setTimeout(() => {
    if (failNext.current) { failNext.current = false; handlers.onclose(); return; }
    handlers.onopen();
  }, 700);
  conn.drop = () => { if (!conn.closed) { conn.closed = true; handlers.onclose(); } };
  conn.close = () => { conn.closed = true; clearTimeout(openTimer); };
  return conn;
}

function useResilientConnection(failNext, log) {
  const [status, setStatus] = useState("connecting");
  const [retryIn, setRetryIn] = useState(0);
  const connRef = useRef(null);

  useEffect(() => {
    let attempt = 0, timer, countdown, stopped = false;
    function connect() {
      setStatus(attempt ? "reconnecting" : "connecting");
      connRef.current = createFakeConnection({
        onopen: () => { attempt = 0; setStatus("open"); log("✅ connected"); },
        onclose: () => {
          if (stopped) return;
          const delay = Math.min(30000, 1000 * 2 ** attempt);
          attempt++;
          setStatus("offline");
          log("❌ closed, retry #" + attempt + " in " + delay / 1000 + " s");
          let left = delay / 1000;
          setRetryIn(left);
          clearInterval(countdown);
          countdown = setInterval(() => { left -= 1; setRetryIn(Math.max(0, left)); if (left <= 0) clearInterval(countdown); }, 1000);
          timer = setTimeout(connect, delay);
        },
      }, failNext);
    }
    connect();
    return () => { stopped = true; clearTimeout(timer); clearInterval(countdown); connRef.current?.close(); };
  }, []);

  return { status, retryIn, drop: () => connRef.current?.drop() };
}

function App() {
  const [logs, setLogs] = useState([]);
  const failNext = useRef(false);
  const log = useRef(msg => setLogs(l => [new Date().toLocaleTimeString("en-IN") + "  " + msg, ...l].slice(0, 8))).current;
  const { status, retryIn, drop } = useResilientConnection(failNext, log);

  const label = {
    connecting: "🟡 Connecting…",
    reconnecting: "🟡 Reconnecting…",
    open: "🟢 Live tracking",
    offline: "🔴 Offline · retrying in " + retryIn + " s",
  }[status];

  return (
    <div className="box">
      <div className={"bar " + status} role="status">{label}</div>
      <p>🛵 Rider Ramesh · ETA 8 min · Koregaon Park, Pune</p>
      <button onClick={drop} disabled={status !== "open"}>Simulate network drop</button>
      <button onClick={() => { failNext.current = true; drop(); }} disabled={status !== "open"}>Drop + fail next retry</button>
      <ul className="log">{logs.map((l, i) => <li key={i}>{l}</li>)}</ul>
    </div>
  );
}`,
        css: `.box { max-width: 420px; }
.bar { padding: 8px 12px; border-radius: 8px; font-weight: 600; margin-bottom: 8px; }
.bar.open { background: #dcfce7; } .bar.offline { background: #fee2e2; } .bar.connecting, .bar.reconnecting { background: #fef9c3; }
button { margin: 4px 6px 4px 0; padding: 6px 10px; }
.log { font-family: monospace; font-size: 12px; color: #374151; padding-left: 16px; }`,
      },
      result: 'The bar goes Connecting → Live. "Simulate network drop" shows Offline with a 1 s countdown, then reconnects. "Drop + fail next retry" makes the first retry fail, so the next wait doubles to 2 s; the log shows each attempt.',
      explanation:
        'Exponential backoff spreads retries out (1, 2, 4, 8… seconds, capped at 30 s) so a server restart is not flooded by thousands of clients at once; real code also adds random jitter. All timers and the connection are cleaned up in the effect cleanup, and the attempt counter resets after a successful connection. The fake connection replaces a real WebSocket only because the sandbox has no server.',
    },
  ],
  interview: [
    { q: 'What is the difference between polling, long polling, SSE and WebSockets?', a: 'Short polling repeatedly sends requests on an interval. Long polling keeps each request open until data is available, then re-requests. SSE (EventSource) is a single long-lived HTTP connection with server-to-client text events and built-in reconnect. WebSockets upgrade an HTTP connection to a persistent full-duplex channel where both sides can send at any time.', level: 'Medium' },
    { q: 'When would you choose SSE over WebSockets?', a: 'When data flows only from server to client (notifications, live scores, log streaming, AI token streaming): SSE is simpler, works over normal HTTP/2, passes proxies easily and reconnects automatically. Use WebSockets when the client also sends frequent messages (chat, games, collaboration).', level: 'Medium' },
    { q: 'How do you avoid duplicate socket listeners in React?', a: 'Subscribe inside useEffect, not in the render body, and in the cleanup call socket.off(event, sameHandler). Create the socket once (module or context), not on every render. Also deduplicate messages by id in case of reconnect re-delivery.', level: 'Medium' },
    { q: 'Why do you see two WebSocket connections in development?', a: 'React StrictMode mounts, unmounts and remounts components in development to check cleanup. If the effect does not close the socket in cleanup, two connections stay open. Fix the cleanup; do not remove StrictMode.', level: 'Medium' },
    { q: 'What does Socket.io add over plain WebSockets?', a: 'Named events, automatic reconnection with backoff, fallback to HTTP long polling, rooms and namespaces, acknowledgements (callbacks), binary support, middleware and auth on handshake. The server and client must both use Socket.io.', level: 'Easy' },
    { q: 'How do you handle stale state in a socket event handler?', a: 'Use functional updates setState(prev => ...) or keep the latest handler/value in a ref (useRef updated in an effect) so a listener registered once still reads current data.', level: 'Hard' },
    { q: 'How do you authenticate a WebSocket connection?', a: 'Send a token in the connection handshake (Socket.io auth option, or a query/cookie for native WebSockets since custom headers are not allowed in the browser API), verify it on the server before accepting, re-auth on token refresh, and authorise each room/event server-side.', level: 'Hard' },
    { q: 'What is exponential backoff and why add jitter?', a: 'Waiting progressively longer between retries (1 s, 2 s, 4 s, ... up to a max) to avoid hammering a failing server. Random jitter prevents all clients from reconnecting at the exact same moment after an outage (thundering herd).', level: 'Medium' },
    { q: 'How do you integrate socket events with TanStack Query?', a: 'In a socket listener either update the cache directly with queryClient.setQueryData(key, updater) for instant UI, or call invalidateQueries(key) to refetch. This keeps one source of truth (the query cache) for both REST and real-time data.', level: 'Hard' },
    { q: 'How do you scale WebSocket servers?', a: 'Connections are stateful, so you use sticky sessions behind the load balancer and a pub/sub adapter (Redis adapter for Socket.io) so events emitted on one server reach clients connected to others; or use managed services like Pusher, Ably, AWS API Gateway WebSockets, Firebase or Supabase Realtime.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a useSocketEvent(socket, event, handler) hook that always calls the latest handler and cleans up correctly. Use it with the MockSocket from Example 1 to count orders.',
      hint: 'Store handler in a ref updated every render; subscribe once per [socket, event].',
      solution: `const { useState, useEffect, useRef } = React;
class MockSocket {
  constructor() { this.h = {}; setInterval(() => this.h["order:new"]?.forEach(f => f({ id: Date.now() })), 1500); }
  on(e, f) { (this.h[e] ||= new Set()).add(f); }
  off(e, f) { this.h[e]?.delete(f); }
}
const socket = new MockSocket();
function useSocketEvent(socket, event, handler) {
  const saved = useRef(handler);
  useEffect(() => { saved.current = handler; });
  useEffect(() => {
    const listener = data => saved.current(data);
    socket.on(event, listener);
    return () => socket.off(event, listener);
  }, [socket, event]);
}
function App() {
  const [count, setCount] = useState(0);
  useSocketEvent(socket, "order:new", () => setCount(c => c + 1));
  return <h2>Orders received: {count}</h2>;
}`,
    },
    {
      task: 'Add a throttled "typing" emitter: while the user types, emit typing:true at most once every 2 seconds and emit typing:false 1.5 s after they stop.',
      hint: 'Keep lastSent and a stop timer in refs.',
      solution: `const { useState, useRef } = React;
function App() {
  const [text, setText] = useState("");
  const [log, setLog] = useState([]);
  const lastSent = useRef(0);
  const stopTimer = useRef(null);
  const emit = (evt, data) => setLog(l => [evt + " " + JSON.stringify(data), ...l].slice(0, 6)); // socket.emit
  function onChange(e) {
    setText(e.target.value);
    const now = Date.now();
    if (now - lastSent.current > 2000) { emit("typing", { typing: true }); lastSent.current = now; }
    clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => { emit("typing", { typing: false }); lastSent.current = 0; }, 1500);
  }
  return (
    <div>
      <input value={text} onChange={onChange} placeholder="Type here" />
      <ul>{log.map((l, i) => <li key={i}>{l}</li>)}</ul>
    </div>
  );
}`,
    },
    {
      task: 'Build a native WebSocket echo client component: input + Send, show sent and received messages, connection status, and close the socket in cleanup. (Use wss://echo.websocket.org or your own local ws server.)',
      hint: 'Create the WebSocket in useEffect with [url]; keep it in a ref so the send handler can use it.',
      solution: `const { useState, useEffect, useRef } = React;
function App({ url = "wss://echo.websocket.org" }) {
  const wsRef = useRef(null);
  const [status, setStatus] = useState("connecting");
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onopen = () => setStatus("open");
    ws.onclose = () => setStatus("closed");
    ws.onerror = () => setStatus("error");
    ws.onmessage = e => setItems(i => [...i, "⬅ " + e.data]);
    return () => ws.close();
  }, [url]);
  function send(e) {
    e.preventDefault();
    if (wsRef.current?.readyState !== WebSocket.OPEN || !text) return;
    wsRef.current.send(text);
    setItems(i => [...i, "➡ " + text]);
    setText("");
  }
  return (
    <form onSubmit={send}>
      <p>Status: {status}</p>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button disabled={status !== "open"}>Send</button>
      <ul>{items.map((m, i) => <li key={i}>{m}</li>)}</ul>
    </form>
  );
}`,
    },
    {
      task: 'Create a SocketProvider that exposes { socket, status } via context, connects only when a user is logged in, and disconnects on logout. Show the status in a header component.',
      hint: 'Effect depending on [user]; if no user, return early. Use the MockSocket class with connect/disconnect.',
      solution: `const { useState, useEffect, createContext, useContext, useMemo } = React;
class MockSocket {
  constructor() { this.h = {}; this.connected = false; }
  on(e, f) { (this.h[e] ||= new Set()).add(f); }
  off(e, f) { this.h[e]?.delete(f); }
  t(e) { this.h[e]?.forEach(f => f()); }
  connect() { this.connected = true; setTimeout(() => this.t("connect"), 300); }
  disconnect() { this.connected = false; this.t("disconnect"); }
}
const SocketContext = createContext(null);
function SocketProvider({ user, children }) {
  const socket = useMemo(() => new MockSocket(), []);
  const [status, setStatus] = useState("offline");
  useEffect(() => {
    if (!user) return;
    const on = () => setStatus("live"), off = () => setStatus("offline");
    socket.on("connect", on); socket.on("disconnect", off);
    socket.connect();
    return () => { socket.off("connect", on); socket.off("disconnect", off); socket.disconnect(); setStatus("offline"); };
  }, [user, socket]);
  return <SocketContext.Provider value={{ socket, status }}>{children}</SocketContext.Provider>;
}
const useSocket = () => useContext(SocketContext);
function Header() { const { status } = useSocket(); return <p>Realtime: {status}</p>; }
function App() {
  const [user, setUser] = useState(null);
  return (
    <SocketProvider user={user}>
      <Header />
      <button onClick={() => setUser(user ? null : { name: "Priya" })}>{user ? "Logout" : "Login"}</button>
    </SocketProvider>
  );
}`,
    },
  ],
  quiz: [
    { question: 'Which technology gives a full-duplex, persistent connection between browser and server?', options: ['Short polling', 'WebSocket', 'Server-Sent Events', 'fetch with keepalive'], answer: 1, explanation: 'WebSockets allow both sides to send messages at any time over one connection.' },
    { question: 'Where should you call socket.on("message", handler) in a React component?', options: ['Directly in the component body', 'Inside JSX', 'Inside useEffect, with socket.off in the cleanup', 'In useMemo'], answer: 2, explanation: 'Subscribing in an effect with cleanup prevents duplicate listeners and leaks.' },
    { question: 'Your chat shows every message twice only in development. Most likely cause?', options: ['StrictMode re-mount plus a missing cleanup (socket.off / close)', 'A bug in React', 'The server is slow', 'Using functional state updates'], answer: 0, explanation: 'StrictMode mounts twice in development; without cleanup two listeners remain.' },
    { question: 'Server-Sent Events are best for...', options: ['Multiplayer games', 'Client uploading video', 'Two-way chat with typing indicators', 'One-way server updates like notifications or live scores'], answer: 3, explanation: 'SSE is a one-way server-to-client stream over HTTP.' },
    { question: 'Why use exponential backoff for reconnection?', options: ['To make reconnection faster every time', 'To avoid overwhelming the server by spacing retries progressively further apart', 'Because WebSockets require it', 'To encrypt the connection'], answer: 1, explanation: 'Growing delays (with jitter) prevent a flood of reconnects after an outage.' },
  ],
};
