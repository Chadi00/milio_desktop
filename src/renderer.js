const searchGoogle = require("./action_scripts/searchCall");
const softwareScript = require("./action_scripts/software");
const hardwareScript = require("./action_scripts/hardware");

function initMainApp() {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = ''; // Clear existing content

    // Create the chat interface components
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';

    const chatHeader = document.createElement('h1');
    chatHeader.textContent = '💖 Milio';
    chatHeader.className = 'chat-header';

    // Create a settings gear icon
    const settingsIcon = document.createElement('i');
    settingsIcon.className = 'fas fa-cog settings-icon'; // Use FontAwesome's gear icon
    settingsIcon.style.position = 'absolute';
    settingsIcon.style.top = '10px';
    settingsIcon.style.right = '10px';
    settingsIcon.style.cursor = 'pointer'; // Change cursor on hover
    settingsIcon.addEventListener('click', function() {
        showSettingsModal();
    });

    const chatMessages = document.createElement('div');
    chatMessages.id = 'chat-messages';

    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

    const userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.id = 'user-input';
    userInput.placeholder = 'Type a message...';

    const sendIcon = document.createElement('i');
    sendIcon.className = 'fas fa-arrow-up send-icon';

    inputContainer.appendChild(userInput);
    inputContainer.appendChild(sendIcon);

    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(settingsIcon); // Add the settings icon to the chat container
    chatContainer.appendChild(chatMessages);
    chatContainer.appendChild(inputContainer);

    appDiv.appendChild(chatContainer);

    // Event listeners for sending messages
    userInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default action
            sendMessage(); // Send message
        }
    });

    sendIcon.addEventListener('click', function() {
        sendMessage(); // Send message
    });
}




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

    // Retrieve the stored JWT token
    const storedToken = localStorage.getItem('jwtToken');

    try {
        const response = await fetch('https://server.lostengineering.com/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include the JWT token in the Authorization header
                'Authorization': `Bearer ${storedToken}`
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
                console.log('Action Software');
                let res1 = await softwareScript(message.substring(1));
                console.log(res1);
                displayMessage(res1, false);
                break;
            case '1':
                console.log('Action Hardware');
                let res2 = await hardwareScript(message.substring(1));
                console.log(res2);
                displayMessage(res2, false);
                break;
            case '4':
                console.log("Action Search");
                let res3 = await searchGoogle(message.substring(1));
                console.log(res3);
                displayMessage(res3, false);
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


function showSettingsModal() {
    // Create the modal container
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    // Create the modal content box
    const modalContent = document.createElement('div');
    modalContent.style.background = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '5px';
    modalContent.style.textAlign = 'center';
    modalContent.style.maxWidth = '400px';
    modalContent.style.width = '80%';

    // Add buttons to the modal content
    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Logout';
    logoutButton.onclick = function() {
        logout(); // Call the logout function
        modal.remove(); // Remove the modal
    };

    const deleteAccountButton = document.createElement('button');
    deleteAccountButton.textContent = 'Delete Account';
    deleteAccountButton.style.marginLeft = '10px';
    deleteAccountButton.onclick = function() {
        deleteAccount();
        modal.remove();
    };
    

    // Add the buttons to the modal content
    modalContent.appendChild(logoutButton);
    modalContent.appendChild(deleteAccountButton);

    // Append the content to the modal container
    modal.appendChild(modalContent);

    // Append the modal to the document body or appDiv
    document.body.appendChild(modal); // or appDiv.appendChild(modal);
}




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

