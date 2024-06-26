const searchGoogle = require("./action_scripts/searchCall");
const softwareScript = require("./action_scripts/software");
const hardwareScript = require("./action_scripts/hardware");
const closeMilio = require("./action_scripts/quitMilio");
const { marked } = require('marked'); 
const extractTextFromPdf = require("./utils/pdf");

function initMainApp() {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = ''; 

    
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';

    const chatHeader = document.createElement('h1');
    chatHeader.textContent = '💖 Milio';
    chatHeader.className = 'chat-header';

    const settingsIcon = document.createElement('i');
    settingsIcon.className = 'fas fa-cog settings-icon';
    settingsIcon.style.position = 'absolute';
    settingsIcon.style.top = '10px';
    settingsIcon.style.right = '10px';
    settingsIcon.addEventListener('click', function() {
        showSettingsModal();
    });

    const chatMessages = document.createElement('div');
    chatMessages.id = 'chat-messages';

    const downloadsContainer = document.createElement('div');
    downloadsContainer.id = 'downloads-container';
    downloadsContainer.style.position = 'fixed';
    downloadsContainer.style.bottom = '80px';
    downloadsContainer.style.left = '20px';
    downloadsContainer.style.right = '20px';
    downloadsContainer.style.display = 'none';

    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

    const pdfDownloadIcon = document.createElement('i');
    pdfDownloadIcon.className = 'fas fa-plus pdf-download-icon';
    pdfDownloadIcon.style.cursor = 'pointer';
    pdfDownloadIcon.addEventListener('click', function() {
        downloadPDF();
    });

    const userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.id = 'user-input';
    userInput.placeholder = 'Type a message...';

    const sendIcon = document.createElement('i');
    sendIcon.className = 'fas fa-arrow-up send-icon';
    sendIcon.addEventListener('click', sendMessage);

    inputContainer.appendChild(pdfDownloadIcon);
    inputContainer.appendChild(userInput);
    inputContainer.appendChild(sendIcon);

    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(settingsIcon);
    chatContainer.appendChild(chatMessages);
    chatContainer.appendChild(downloadsContainer);
    chatContainer.appendChild(inputContainer);

    appDiv.appendChild(chatContainer);

    userInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
}

let downloadedFiles = [];
previousUserMessage = "";
previousSystemMessage = "";
previousInteraction = "";

function downloadPDF() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf'; 
    fileInput.style.display = 'none'; 
    document.body.appendChild(fileInput);

    fileInput.onchange = function(event) {
        if (event.target.files.length > 0) {
            for (const file of event.target.files) {
                displayPDFInfo(file);
            }
            fileInput.remove();
        }
    };

    fileInput.click(); 
}

function displayPDFInfo(file) {
    const downloadsContainer = document.getElementById('downloads-container');
    downloadsContainer.style.display = 'flex'; 
    downloadsContainer.style.flexDirection = 'column'; 

    const pdfItem = document.createElement('div');
    pdfItem.style.display = 'flex';
    pdfItem.style.alignItems = 'center';
    pdfItem.style.marginTop = '5px';

    const pdfIcon = document.createElement('i');
    pdfIcon.className = 'fas fa-file-pdf';
    pdfIcon.style.color = 'red';
    pdfIcon.style.marginRight = '5px';

    const fileNameSpan = document.createElement('span');
    fileNameSpan.textContent = file.name;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.style.color = '#ff0000';
    deleteBtn.style.border = 'none';
    deleteBtn.style.background = 'transparent';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.onclick = function() {
        pdfItem.remove(); 
        const index = downloadedFiles.findIndex(f => f.file === file);
        if (index > -1) {
            downloadedFiles.splice(index, 1);
        }

        if (downloadsContainer.children.length === 0) {
            downloadsContainer.style.display = 'none';
        }
    };

    pdfItem.appendChild(pdfIcon);
    pdfItem.appendChild(fileNameSpan);
    pdfItem.appendChild(deleteBtn);
    downloadsContainer.appendChild(pdfItem);

    downloadedFiles.push({ file: file, element: pdfItem });
}




const sendMessage = async () => {
    const userInputField = document.getElementById('user-input');
    const sendIcon = document.querySelector('.send-icon');
    let userInput = userInputField.value.trim();

    if (!userInput || sendIcon.classList.contains('loading')) return;

    sendIcon.classList.add('loading');
    
    sendIcon.classList.remove('fas', 'fa-arrow-up'); 
    sendIcon.classList.add('fas', 'fa-circle-notch'); 
    sendIcon.classList.add('fa-spin'); 

    displayMessage(userInput, true);
    userInputField.value = '';

    if (userInput.trim() == "exit milio" || userInput.trim() == "exit Milio" || userInput.trim() == "milio exit" || userInput.trim() == "Milio exit"){
        closeMilio();
    }

    if (downloadedFiles.length > 0) {
        pdfContent = "";
        for (let i = 0; i < downloadedFiles.length; i++) {
            try {
                const pdfText = await extractTextFromPdf(downloadedFiles[i].file);
                pdfContent += `PDF Content number ${i+1}: ${pdfText}\n`;
            } catch (error) {
                console.error(`Error extracting PDF text from file ${i}:`, error);
            }
        }
        userInput = `${pdfContent}User request: ${userInput}`;
    }

    previousUserMessage = userInput; 

    const storedToken = localStorage.getItem('jwtToken');

    try {
        const response = await fetch('https://server.lostengineering.com/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${storedToken}`
            },
            body: JSON.stringify({ Message: previousInteraction + ".\n New user message : "  + userInput }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        analyzeAndDisplayChatbotMessage(data['System message']);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        sendIcon.classList.remove('loading', 'fa-spin', 'fa-circle-notch');
        sendIcon.classList.add('fas', 'fa-arrow-up');
        
        downloadedFiles = [];
        clearDownloadsContainer();
    }
};

function clearDownloadsContainer() {
    const downloadsContainer = document.getElementById('downloads-container');
    while (downloadsContainer.firstChild) {
        downloadsContainer.removeChild(downloadsContainer.firstChild);
    }
    downloadsContainer.style.display = 'none'; 
}






const displayMessage = (message, isUserMessage) => {
    const chatMessages = document.getElementById('chat-messages');
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    const messageBubble = document.createElement('div');
    if (!isUserMessage) {
        message = marked(message);
        messageBubble.innerHTML = message;
    } else {
        messageBubble.textContent = message; 
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



const analyzeAndDisplayChatbotMessage = async (message) => {
    const actionCode = message.charAt(0);
    
    try {
        switch (actionCode) {
            case '0':
                console.log('Action Software');
                let res1 = await softwareScript(message.substring(1));
                console.log(res1);
                previousUserMessage = "";
                previousSystemMessage = "";
                previousInteraction = "";
                displayMessage(res1, false);
                break;
            case '1':
                console.log('Action Hardware');
                let res2 = await hardwareScript(message.substring(1));
                console.log(res2);
                previousUserMessage = "";
                previousSystemMessage = "";
                previousInteraction = "";
                displayMessage(res2, false);
                break;
            case '3':
                console.log("Action Search");
                console.log("Before calling searchGoogle");
                let res3 = await searchGoogle(message.substring(1));
                console.log("After calling searchGoogle", res3);
                console.log("search");
                previousSystemMessage = res3;
                previousInteraction = "Previous user message : " + previousUserMessage + ".\nPrevious System response : " + previousSystemMessage + ".\n";
                displayMessage(res3, false);
                break;
            case 'A':
                console.log("Error : LLM can't understand");
                displayMessage("Sorry, I can't understand. Please try again.");
                break;
            case 'B':
                console.log("Error : LLM rate limit");
                displayMessage("Sorry, I'm not able to help you now.Try again later.");
                break;
            default:
                if (actionCode === '4' || actionCode === '5' || actionCode === '6' || actionCode === '7') {
                    console.log("Action Direct answer : logic, creative, cs or discussion");
                    previousSystemMessage = message.substring(1);
                    previousInteraction = "Previous user message : " + previousUserMessage + ".\nPrevious System response : " + previousSystemMessage + ".\n";
                    displayMessage(message.substring(1), false);
                }else{
                    console.log("other request");
                }
        }
    } catch (error) {
        console.error("An error occurred:", error);
        displayMessage("An error occurred processing your request.", false);
    }
};


function showSettingsModal() {
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

    
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    });

    const modalContent = document.createElement('div');
    modalContent.style.background = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '5px';
    modalContent.style.textAlign = 'center';
    modalContent.style.maxWidth = '400px';
    modalContent.style.width = '80%';

    modalContent.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Logout';
    logoutButton.onclick = function() {
        logout();
        modal.remove();
    };

    const deleteAccountButton = document.createElement('button');
    deleteAccountButton.textContent = 'Delete Account';
    deleteAccountButton.style.marginLeft = '10px';
    deleteAccountButton.onclick = function() {
        deleteAccount();
        modal.remove();
    };

    modalContent.appendChild(logoutButton);
    modalContent.appendChild(deleteAccountButton);

    modal.appendChild(modalContent);

    document.body.appendChild(modal);
}


marked.setOptions({
    gfm: true,
    tables: true
  });
  

