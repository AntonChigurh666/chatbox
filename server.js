const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Add CORS handling
const app = express();
const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: 'https://chatboxjesus.onrender.com', // Frontend domain
    methods: ['GET', 'POST'],
  },
});

// Enable CORS for frontend (Modify based on your actual frontend URL)
app.use(cors({
  origin: 'https://chatboxjesus.onrender.com', // Replace with your frontend domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));


// Serving static files in "public" directory
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules/socket.io/client-dist')));

// Admin interface route
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/public/admin.html'); // Admin interface
});

// Store user data (ID, name, IP, messages)
const userConversations = {};

// Handling socket connections
io.on('connection', (socket) => {
  const userIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  console.log(`User connected: ${socket.id}, IP: ${userIp}`);

  // Initialize conversation for user
  userConversations[socket.id] = {
    name: "",
    ip: userIp,
    messages: []
  };

  // Handle user name setting
  socket.on('setUserName', (name) => {
    userConversations[socket.id].name = name; // Set username
    io.emit('updateConversations', userConversations); // Notify admin
  });

  // Handle user messages
  socket.on('sendMessage', (message) => {
    console.log(`Message from user (${socket.id}): ${message}`);
    userConversations[socket.id].messages.push({ from: 'user', message });
    io.emit('updateConversations', userConversations); // Update conversations for admin
  });

  // Handle admin replies to users
  socket.on('replyToUser', ({ userId, reply }) => {
    console.log(`Admin replying to ${userId}: ${reply}`);
    userConversations[userId].messages.push({ from: 'admin', message: reply });
    io.to(userId).emit('receiveMessage', reply); // Send reply to user
    io.emit('updateConversations', userConversations); // Update admin conversation view
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}, IP: ${userConversations[socket.id]?.ip}`);
    delete userConversations[socket.id];
    io.emit('updateConversations', userConversations); // Update conversations
  });

  // Handle admin actions
  socket.on('adminAction', ({ userId, action }) => {
    console.log(`Admin triggered action "${action}" for user ${userId}`);
    io.to(userId).emit('adminAction', action); // Send the action to user
  });
});

// Server listens on the port given by the environment, or default to 3000 for local development
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});