const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ── Matchmaking queue ──
const waitingQueue = [];   // socket ids waiting for a partner
const pairs = new Map();   // socketId -> partnerSocketId
const onlineCount = { val: 0 };

function broadcastOnlineCount() {
  io.emit('online_count', onlineCount.val);
}

io.on('connection', (socket) => {
  onlineCount.val++;
  broadcastOnlineCount();
  socket.emit('online_count', onlineCount.val);

  // ── Find match ──
  socket.on('find_match', () => {
    // Already paired? ignore
    if (pairs.has(socket.id)) return;

    // Remove from queue if already in it
    const qi = waitingQueue.indexOf(socket.id);
    if (qi !== -1) waitingQueue.splice(qi, 1);

    if (waitingQueue.length > 0) {
      // Take first waiting person
      const partnerId = waitingQueue.shift();
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (!partnerSocket) {
        // Partner disconnected, try again
        socket.emit('find_match');
        return;
      }

      // Pair them
      pairs.set(socket.id, partnerId);
      pairs.set(partnerId, socket.id);

      // Decide who initiates (caller = socket, callee = partner)
      socket.emit('matched', { role: 'caller', partnerId });
      partnerSocket.emit('matched', { role: 'callee', partnerId: socket.id });
    } else {
      // Wait in queue
      waitingQueue.push(socket.id);
      socket.emit('waiting');
    }
  });

  // ── Cancel waiting ──
  socket.on('cancel_wait', () => {
    const qi = waitingQueue.indexOf(socket.id);
    if (qi !== -1) waitingQueue.splice(qi, 1);
  });

  // ── WebRTC signaling relay ──
  socket.on('signal', ({ to, data }) => {
    io.to(to).emit('signal', { from: socket.id, data });
  });

  // ── Chat message relay ──
  socket.on('chat_msg', (text) => {
    const partnerId = pairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('chat_msg', text);
    }
  });

  // ── Skip / next ──
  socket.on('skip', () => {
    const partnerId = pairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('partner_left');
      pairs.delete(partnerId);
    }
    pairs.delete(socket.id);
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    onlineCount.val = Math.max(0, onlineCount.val - 1);
    broadcastOnlineCount();

    // Remove from queue
    const qi = waitingQueue.indexOf(socket.id);
    if (qi !== -1) waitingQueue.splice(qi, 1);

    // Notify partner
    const partnerId = pairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('partner_left');
      pairs.delete(partnerId);
    }
    pairs.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`RandomChatFace running on port ${PORT}`));
