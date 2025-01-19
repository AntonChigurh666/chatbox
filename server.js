require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); 
const path = require('path'); 

const app = express();
const server = http.createServer(app);

const adminPassword = "plejadianie";

const io = require('socket.io')(server, {
  cors: {
    origin: 'https://chatboxjesus.onrender.com',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: 'https://chatboxjesus.onrender.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

// Middleware to parse JSON in requests
app.use(express.json());

// Static files for the client
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules/socket.io/client-dist')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Store the admin password securely (use env variable or hash in production)

// Admin authentication endpoint
app.post('/api/validate-admin', (req, res) => {
  const { password } = req.body;

  if (password === adminPassword) {
    res.sendStatus(200); // Valid password
  } else {
    res.sendStatus(401); // Invalid password
  }
});

// Admin panel route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});

const userConversations = {};

// Handle socket.io connections
io.on('connection', (socket) => {
  const userIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  console.log(`User connected: ${socket.id}, IP: ${userIp}`);

  userConversations[socket.id] = {
    name: "",
    ip: userIp,
    messages: [],
  };

  socket.on('setUserName', (name) => {
    userConversations[socket.id].name = name;
    io.emit('updateConversations', userConversations);
  });

  socket.on('sendMessage', (message) => {
    console.log(`Message from user (${socket.id}): ${message}`);
    userConversations[socket.id].messages.push({ from: 'user', message });
    io.emit('updateConversations', userConversations);
  });

  socket.on('replyToUser', ({ userId, reply }) => {
    console.log(`Admin replying to ${userId}: ${reply}`);
    userConversations[userId].messages.push({ from: 'admin', message: reply });
    io.to(userId).emit('receiveMessage', reply);
    io.emit('updateConversations', userConversations);
  });

  socket.on('adminAction', ({ userId, action }) => {
    console.log(`Admin triggered action "${action}" for user ${userId}`);
    io.to(userId).emit('adminAction', action);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete userConversations[socket.id];
    io.emit('updateConversations', userConversations);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("Entered password:", password);
console.log("Expected password:", adminPassword);
