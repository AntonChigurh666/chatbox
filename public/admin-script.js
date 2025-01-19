document.addEventListener('DOMContentLoaded', function () {
  // Elements for password authentication

  const passwordInput = document.getElementById('passwordInput');
  const passwordSubmit = document.getElementById('passwordSubmit');
  const adminPanel = document.getElementById('adminPanel');
  
  // Elements for handling admin functionalities
  const socket = io('https://chatboxbackend-hzlz.onrender.com', {
    withCredentials: true, // Ensure credentials are sent with requests
  });
  const conversationsDiv = document.getElementById('conversations');
  const adminMessageInput = document.getElementById('adminMessage');
  let selectedUserId = null; // Store selected user's ID
  let highlightedUserDiv = null; // Store reference to the currently highlighted user div
  const buttons = document.querySelectorAll('.buttonsadmin');
  
  // Authenticate admin before loading panel
  passwordSubmit.addEventListener('click', () => {
    const enteredPassword = passwordInput.value.trim();
    
    // Send password to the server for validation
    fetch('/api/validate-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: enteredPassword }),
    })
      .then(response => {
        if (response.ok) {
          // Grant access to the admin panel

          adminPanel.style.display = 'block';
          passwordInput.style.display = 'none';
          passwordSubmit.style.display = 'none';
          console.log('Correct:' +  enteredPassword);
        } else {
          alert('Invalid password. Access denied.');
        }
      })
      .catch((error) => {
        console.error('Error verifying password:', error);
        alert('An error occurred. Please try again.');
      });
  });

  passwordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      passwordSubmit.click();
    }
  });

  // Admin panel socket.io functionalities
  socket.on('updateConversations', (conversations) => {
    conversationsDiv.innerHTML = '';

    for (const [userId, user] of Object.entries(conversations)) {
      const userDiv = document.createElement('div');
      userDiv.classList.add('userConversation');

      const userTitle = document.createElement('p');
      userTitle.innerHTML = `User: ${userId} (${user.name}) - IP: ${user.ip}`;
      userTitle.style.cursor = 'pointer';

      userTitle.addEventListener('click', () => {
        if (highlightedUserDiv) {
          highlightedUserDiv.classList.remove('highlighted');
          highlightedUserDiv = null;
        }
        selectedUserId = userId;
        loadConversation(user);
        userDiv.classList.add('highlighted');
        highlightedUserDiv = userDiv;
      });

      userDiv.appendChild(userTitle);

      user.messages.forEach((msg) => {
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `<span style="color: orange;">${msg.from === 'user' ? user.name : 'Admin'}:</span> ${msg.message}`;
        userDiv.appendChild(messageDiv);
      });

      conversationsDiv.appendChild(userDiv);
    }
  });

  function loadConversation(user) {
    adminMessageInput.value = '';
    console.log('Loading conversation with user:', user.name);
  }

  adminMessageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && adminMessageInput.value.trim() && selectedUserId) {
      const reply = adminMessageInput.value.trim();
      socket.emit('replyToUser', { userId: selectedUserId, reply });
      adminMessageInput.value = '';
    }
  });

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      if (!selectedUserId) {
        alert('Please select a user before sending an action.');
        return;
      }

      const action = button.id;
      socket.emit('adminAction', { userId: selectedUserId, action });
    });
  });
});
