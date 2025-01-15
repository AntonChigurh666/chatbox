document.addEventListener('DOMContentLoaded', function () {
  // Update Socket.IO connection to point to the backend service on Render
  const backendUrl = "https://chatboxbackend-hzlz.onrender.com"; // Your live backend URL
  const socket = io(backendUrl); // Initialize socket with backend URL
  
  const conversationsDiv = document.getElementById('conversations');
  const adminMessageInput = document.getElementById('adminMessage');
  let selectedUserId = null; // Store selected user's ID
  let highlightedUserDiv = null; // Store reference to the currently highlighted user div
  const buttons = document.querySelectorAll('.buttonsadmin');

  // Update conversations when new messages arrive
  socket.on('updateConversations', (conversations) => {
    // Clear and rebuild the conversations view
    conversationsDiv.innerHTML = '';

    for (const [userId, user] of Object.entries(conversations)) {
      const userDiv = document.createElement('div');
      userDiv.classList.add('userConversation');

      // Display user ID, name, and IP address, allow click to select user
      const userTitle = document.createElement('h3');
      userTitle.innerHTML = `User: ${userId} (${user.name}) - IP: ${user.ip}`;
      
      // Change the cursor to pointer to indicate it's clickable
      userTitle.style.cursor = 'pointer';

      userTitle.addEventListener('click', () => {
        // If another user was highlighted, remove the highlight
        if (highlightedUserDiv) {
          highlightedUserDiv.classList.remove('highlighted');
          highlightedUserDiv = null;
        }

        // Set the selected user and load their conversation
        selectedUserId = userId;
        loadConversation(user);

        // Highlight the selected user container (entire user conversation)
        userDiv.classList.add('highlighted');
        highlightedUserDiv = userDiv; // Store reference to the highlighted user div
      });

      userDiv.appendChild(userTitle);

      // Display the messages in conversation, show last few messages
      user.messages.forEach((msg) => {
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `<span style="color: orange;">${msg.from === 'user' ? user.name : 'Admin'}:</span> ${msg.message}`;
        userDiv.appendChild(messageDiv);
      });

      conversationsDiv.appendChild(userDiv);
    }
  });

  // Load conversation for a selected user
  function loadConversation(user) {
    adminMessageInput.value = ''; // Clear the input field (if you want to clear when changing users)
    console.log('Loading conversation with user:', user.name);
  }

  // Send reply when the admin presses Enter
  adminMessageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && adminMessageInput.value.trim() && selectedUserId) {
      const reply = adminMessageInput.value.trim();
      socket.emit('replyToUser', { userId: selectedUserId, reply });
      adminMessageInput.value = ''; // Clear input field
    }
  });

  // Handle button clicks
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      if (!selectedUserId) {
        alert('Please select a user before sending an action.');
        return;
      }

      const action = button.id;
      socket.emit('adminAction', { userId: selectedUserId, action }); // Emit the action to the server
    });
  });
});