// Socket.IO: live chat messages, who is online, "typing…". Messages themselves are posted over HTTP (they can carry files).
const { Server } = require('socket.io');
const config = require('./config');
const { userFromToken, publicUser } = require('./auth');

let _io = null;
const online = new Map(); // userId -> { user, sockets: Set }

const onlineList = () => [...online.values()].map((o) => ({ id: o.user.id, name: o.user.name, username: o.user.username, role: o.user.role }));

function attach(httpServer) {
  _io = new Server(httpServer, { cors: { origin: config.corsOrigins, credentials: false }, maxHttpBufferSize: 1e5 });
  _io.use(async (socket, next) => {
    const u = await userFromToken(socket.handshake.auth?.token);
    if (!u) return next(new Error('unauthorized'));
    socket.data.user = publicUser(u);
    return next();
  });
  _io.on('connection', (socket) => {
    const u = socket.data.user;
    const entry = online.get(u.id) || { user: u, sockets: new Set() };
    entry.sockets.add(socket.id);
    online.set(u.id, entry);
    _io.emit('chat:online', onlineList());
    let lastTyping = 0;
    socket.on('chat:typing', () => {
      const now = Date.now();
      if (now - lastTyping < 1500) return;
      lastTyping = now;
      socket.broadcast.emit('chat:typing', { id: u.id, name: u.name });
    });
    socket.on('disconnect', () => {
      const e = online.get(u.id);
      if (e) { e.sockets.delete(socket.id); if (!e.sockets.size) online.delete(u.id); }
      _io.emit('chat:online', onlineList());
    });
  });
  return _io;
}

module.exports = { attach, io: () => _io };
