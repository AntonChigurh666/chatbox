document.addEventListener('DOMContentLoaded', function () {
  const nameInput = document.getElementById('nameInput');
  const youDiv = document.getElementById('you');
  const userInput = document.getElementById('userInput');
  const nameCont = document.getElementById('nameContainer');

  // Admin - dynamiczny tekst z nazwą użytkownika

  // Specify your backend URL
  const socket = io('https://chatboxbackend-hzlz.onrender.com', {
    withCredentials: true, // Ensure credentials are sent with requests
  });
  
  nameInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();

      const userName = nameInput.value.trim();
      if (userName) {
        youDiv.textContent = `${userName}:`; // Update the "you" div with the entered name
        nameInput.disabled = true; // Optional: disable input after name is set
        socket.emit('setUserName', userName); // Send the name to the server
        
        // Focus the userInput field after setting the name
        userInput.focus();  // Moves the focus to the message input field (userInput)

        nameCont.style.opacity = "0.4";
      }
    }
  });

  // Handling message sending to the server when pressing Enter
  userInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && userInput.value.trim()) {
      event.preventDefault();
      const message = userInput.value.trim();

      // Emit the message to the server
      socket.emit('sendMessage', message);

      // Clear input after message is sent
      userInput.value = '';
    }
  });

  // Receive messages from the server (admin's replies)
  socket.on('receiveMessage', function (message) {
    // After displaying admin's reply, keep the cursor in the userInput field
    userInput.focus();  // Ensure cursor stays in the message input field

    const adminReplyElement = document.getElementById('adminReply');
    adminReplyElement.textContent = message;

  });

  // Listen for admin actions and perform DOM updates
  socket.on('adminAction', function (action) {
    console.log(`Received action from admin: ${action}`);

    switch (action) {
      case 'jesusgood':
        document.getElementById('jesusgood').style.display = 'block';
        setTimeout(() => {
          document.getElementById('jesusgood').classList.add('jesusgoodAnimation');
        }, 1000);
        setTimeout(() => {
          document.getElementById('jesusgood').style.display = 'none';
        }, 12000);
        break;
      case 'jesusfuckyou':
        document.getElementById('jesusfuckyou').style.display = "block";
        setTimeout(() => {
          document.getElementById('jesusfuckyou').style.opacity = "1";
        }, 1000);
        setTimeout(() => {
          document.getElementById('jesusfuckyou').style.opacity = "0";
        }, 4000);
        setTimeout(() => {
          document.getElementById('jesusfuckyou').style.display = "none";
        }, 5000);
        break;
      case 'jesusblock':
        document.getElementById('blockleft').style.display = "block";
        document.getElementById('blockright').style.display = "block";
        document.getElementById('jesusblockpic').style.display = 'block';
        setTimeout(() => {
          document.getElementById('blockleft').classList.add('blockleftAnimation');
          document.getElementById('blockright').classList.add('blockrightAnimation');
          document.getElementById('jesusblockpic').classList.add('jesusblockpicAnimation');
        }, 1000);
        break;
      case 'devilblock':
        document.getElementById('blockleft').style.display = "block";
        document.getElementById('blockright').style.display = "block";
        document.getElementById('devilblockpic').style.display = 'block';
        setTimeout(() => {
          document.getElementById('blockleft').classList.add('blockleftAnimation');
          document.getElementById('blockright').classList.add('blockrightAnimation');
          document.getElementById('devilblockpic').classList.add('devilblockpicAnimation');
        }, 1000);
        break;
      case 'devil':
        document.getElementById('devil').style.display = 'block';
        setTimeout(() => {
          document.getElementById('devil').classList.add('devilAnimation');
        }, 1000);
        setTimeout(() => {
          document.getElementById('devil').style.display = 'none';
        }, 30000);
        break;
      default:
        console.warn(`Unhandled admin action: ${action}`);
    }
  });

});