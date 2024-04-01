document.addEventListener('DOMContentLoaded', () => {
    const appDiv = document.getElementById('app');

    // Create chat interface
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';

    const chatHeader = document.createElement('h1');
    chatHeader.textContent = '💖 milio';
    chatHeader.className = 'chat-header';

    const chatMessages = document.createElement('div');
    chatMessages.id = 'chat-messages';

    // Input container that includes both the text input and the send icon
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

    const userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.id = 'user-input';
    userInput.placeholder = 'Type a message...';

    // Create the send icon
    const sendIcon = document.createElement('i');
    sendIcon.className = 'send-icon';
    sendIcon.innerHTML = '&#x1F815;'; // Placeholder for an up-arrow icon

    // Add event listener for the Enter key on userInput
    userInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission
            if (userInput.value.trim()) { // Check if input is not just whitespace
                sendMessage();
            }
        }
    });

    // Repurpose the sendButton click event for the sendIcon
    sendIcon.addEventListener('click', () => {
        if (!sendIcon.classList.contains('loading')) {
            sendMessage();
        }
        // Else, do nothing since we're waiting for a response
    });

    // Append the userInput and sendIcon to the inputContainer
    inputContainer.appendChild(userInput);
    inputContainer.appendChild(sendIcon);

    // Append components to chatContainer
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(chatMessages);
    chatContainer.appendChild(inputContainer); // Use inputContainer instead of appending userInput and sendButton separately

    appDiv.appendChild(chatContainer);
});

const sendMessage = async () => {
    const userInputField = document.getElementById('user-input');
    const sendIcon = document.querySelector('.send-icon');
    const userInput = userInputField.value.trim();

    // Return early if there's no input or if we're already waiting for a response
    if (!userInput || sendIcon.classList.contains('loading')) return;

    // Indicate loading state
    sendIcon.classList.add('loading');
    // Optionally change the icon to a loading indicator
    sendIcon.innerHTML = '&#8635;'; // Change this to your loading icon

    // Display user message immediately and clear input
    displayMessage(userInput, true);
    userInputField.value = '';

    try {
        const response = await fetch('https://server.lostengineering.com/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Message: userInput }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        // Display chatbot message once received
        displayMessage(data['System message'], false);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // End loading state and allow sending messages again
        sendIcon.classList.remove('loading');
        // Revert icon back to the send symbol
        sendIcon.innerHTML = '&#x1F815;'; // Your send icon
    }
};

const displayMessage = (message, isUserMessage) => {
    const chatMessages = document.getElementById('chat-messages');
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    const messageBubble = document.createElement('div');
    messageBubble.textContent = message;
    messageBubble.classList.add('message-bubble');

    if (isUserMessage) {
        messageContainer.classList.add('user-message');
        messageBubble.classList.add('user-bubble');
    } else {
        messageContainer.classList.add('chatbot-message');
        messageBubble.classList.add('chatbot-bubble');
    }

    
    messageContainer.appendChild(messageBubble);
    chatMessages.appendChild(messageContainer);

    messageContainer.scrollIntoView({ behavior: 'smooth' });
};

