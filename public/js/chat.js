const socket = io();

socket.on('updateMessages', (messages) => {
    const messageList = document.getElementById('messageList');
    messageList.innerHTML = '';
    messages.forEach(msg => {
        const listItem = document.createElement('li');
        listItem.textContent = `${msg.user}: ${msg.message}`;
        messageList.appendChild(listItem);
    });
});

function sendMessage() {
    const user = document.getElementById('user').value;
    const message = document.getElementById('message').value;
    if (user && message) {
        socket.emit('newMessage', { user, message });
        document.getElementById('message').value = '';
    }
}
