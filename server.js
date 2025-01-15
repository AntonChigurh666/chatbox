const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/public/admin.html'); // Path to your HTML file for the admin interface
});

// Store user data (ID, name, IP, messages)
const userConversations = {};


io.on('connection', (socket) => {
  const userIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address; // Get the IP address
  console.log(`User connected: ${socket.id}, IP: ${userIp}`);

  // Store a new conversation for the user
  userConversations[socket.id] = {
    name: "", // Name will be set later
    ip: userIp, // Save the user's IP address
    messages: [] // Store user messages
  };

  // Capture and store the user's name when they enter
  socket.on('setUserName', (name) => {
    userConversations[socket.id].name = name; // Save the user name
    io.emit('updateConversations', userConversations); // Update admin with new user info
  });

  // Receive a message from a specific user
  socket.on('sendMessage', (message) => {
    console.log(`Message from user (${socket.id}): ${message}`);
    
    // Store the message in the conversation history
    userConversations[socket.id].messages.push({ from: 'user', message });

    // Notify admin of the new message
    io.emit('updateConversations', userConversations);
  });

  // Admin sends a reply to a specific user
  socket.on('replyToUser', ({ userId, reply }) => {
    console.log(`Admin replying to ${userId}: ${reply}`);
    
    // Store admin reply in the conversation history
    userConversations[userId].messages.push({ from: 'admin', message: reply });

    // Send the reply to the specific user
    io.to(userId).emit('receiveMessage', reply);

    // Update admin panel with the conversation
    io.emit('updateConversations', userConversations);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}, IP: ${userConversations[socket.id]?.ip}`);
    delete userConversations[socket.id];
    io.emit('updateConversations', userConversations); // Update admin panel
  });

  // Handle admin action
  socket.on('adminAction', ({ userId, action }) => {
    console.log(`Admin triggered action "${action}" for user ${userId}`);
    io.to(userId).emit('adminAction', action); // Emit the action to the specific user
  });
  
});


// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});





 