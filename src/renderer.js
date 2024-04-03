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
    sendIcon.className = 'fas fa-arrow-up send-icon';
    sendIcon.innerHTML = ''; 

    // Add event listener for the Enter key on userInput
    userInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission
            if (userInput.value.trim()) { // Check if input is not just whitespace
                sendMessage();
            }
        }
    });

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
    
    sendIcon.classList.remove('fas', 'fa-arrow-up'); // Remove the original send icon classes
    sendIcon.classList.add('fas', 'fa-circle-notch'); // Add the loading icon classes
    sendIcon.classList.add('fa-spin'); // Add spinning animation

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
        analyzeAndDisplayChatbotMessage(data['System message']);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // End loading state and allow sending messages again
        sendIcon.classList.remove('loading', 'fa-spin', 'fa-circle-notch');
        sendIcon.classList.add('fas', 'fa-arrow-up'); // Revert icon back to the send symbol
    }
};




const displayMessage = (message, isUserMessage) => {
    const chatMessages = document.getElementById('chat-messages');
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    const messageBubble = document.createElement('div');
    if (!isUserMessage) {
        // Use the Markdown to HTML converter for chatbot messages
        message = markdownToHtml(message);
        messageBubble.innerHTML = message; 
    } else {
        messageBubble.textContent = message; // Use textContent for user messages to avoid XSS
    }
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



// This function analyzes the chatbot message based on the first character
const analyzeAndDisplayChatbotMessage = async (message) => {
    const actionCode = message.charAt(0);
    
    try {
        switch (actionCode) {
            case '0':
                console.log('Action 0: software');
                let res = await window.electronAPI.softwareScript(message.substring(1));
                console.log(res);
                displayMessage(res, false);
                break;
            case '1':
                console.log('Action 1: ', message);
                displayMessage(message.substring(3), false);
                break;
            default:
                if (actionCode === 'A' || actionCode === 'B') {
                    console.log("Can't understand the request");
                    displayMessage("Sorry I did not understand your request", false);
                }else{
                    console.log("other request than software and hardware");
                }
        }
    } catch (error) {
        console.error("An error occurred:", error);
        displayMessage("An error occurred processing your request.", false);
    }
};




const markdownToHtml = (markdownText) => {
    // Ensure markdownText is a string to avoid errors
    if (typeof markdownText !== 'string') {
        console.error('Invalid input: markdownText must be a string.');
        return ''; // Return an empty string or some error message
    }

    // Convert headers
    markdownText = markdownText.replace(/(######\s(.*))/g, '<h6>$2</h6>')
                               .replace(/(#####\s(.*))/g, '<h5>$2</h5>')
                               .replace(/(####\s(.*))/g, '<h4>$2</h4>')
                               .replace(/(###\s(.*))/g, '<h3>$2</h3>')
                               .replace(/(##\s(.*))/g, '<h2>$2</h2>')
                               .replace(/(#\s(.*))/g, '<h1>$2</h1>');

    // Convert bold text
    markdownText = markdownText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // Convert italic text
    markdownText = markdownText.replace(/\*(.*?)\*/g, '<i>$1</i>');

    // Convert inline code
    markdownText = markdownText.replace(/`(.*?)`/g, '<code>$1</code>');

    // Convert blockquotes
    markdownText = markdownText.replace(/^\s*>\s*(.*)/gm, '<blockquote>$1</blockquote>');

    // Convert unordered lists (simple version, does not handle nested lists)
    markdownText = markdownText.replace(/^\s*-\s*(.*)/gm, '<ul><li>$1</li></ul>');
    markdownText = markdownText.replace(/<\/ul><ul>/g, '');

    // Convert links
    markdownText = markdownText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Convert code blocks
    markdownText = markdownText.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');

    // Handle new lines
    markdownText = markdownText.replace(/\n/g, '<br>');

    return markdownText;
};

