const { ipcRenderer } = require('electron');

function initiateGmailOAuth() {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
        console.error('JWT token is not available in localStorage.');
        closeAuthModal(); 
        return;
    }

    const oauthUrl = `https://server.lostengineering.com/email/login?jwt=${encodeURIComponent(jwtToken)}`;
    ipcRenderer.send('open-auth-window', oauthUrl);
}

function choiceModal(recipient = '', subject = '', content = '') {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center;";
    modal.addEventListener('click', (event) => {
        if (event.target === modal) { 
            closeModal(modal);
        }
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.style = "background: white; padding: 20px; border-radius: 10px; display: flex; gap: 20px;";

    const gmailButton = document.createElement('button');
    gmailButton.textContent = 'Send via Gmail';
    gmailButton.onclick = () => gmailModal(recipient, subject, content, 'Gmail');

    const outlookButton = document.createElement('button');
    outlookButton.textContent = 'Send via Outlook';
    outlookButton.onclick = () => gmailModal(recipient, subject, content, 'Outlook');

    buttonContainer.appendChild(gmailButton);
    buttonContainer.appendChild(outlookButton);
    modal.appendChild(buttonContainer);
    document.body.appendChild(modal);
}

function closeModal(modal) {
    document.body.removeChild(modal);
}


function gmailModal(recipient, subject, content, platform) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center;";
    modal.addEventListener('click', (event) => {
        if (event.target === modal) { 
            closeModal(modal);
        }
    });

    const modalContent = document.createElement('div');
    modalContent.style = "background: white; padding: 20px; border-radius: 10px; width: 500px; display: flex; flex-direction: column; gap: 10px;";

    const inputEmail = document.createElement('input');
    inputEmail.placeholder = 'Recipient Email';
    inputEmail.style = "width: 100%;";
    inputEmail.value = recipient;
    localStorage.setItem('recipientEmail', recipient); 
    inputEmail.addEventListener('input', () => {
        localStorage.setItem('recipientEmail', inputEmail.value);
    });

    const inputSubject = document.createElement('input');
    inputSubject.placeholder = 'Subject';
    inputSubject.style = "width: 100%;";
    inputSubject.value = subject;
    localStorage.setItem('emailSubject', subject); 
    inputSubject.addEventListener('input', () => {
        localStorage.setItem('emailSubject', inputSubject.value);
    });

    const textareaContent = document.createElement('textarea');
    textareaContent.placeholder = 'Email Content';
    textareaContent.style = "width: 100%; height: 100px;";
    textareaContent.value = content;
    localStorage.setItem('emailContent', content);
    textareaContent.addEventListener('input', () => {
        localStorage.setItem('emailContent', textareaContent.value);
    });

    const sendButton = document.createElement('button');
    sendButton.textContent = `Send via ${platform}`;
    sendButton.onclick = initiateGmailOAuth;

    modalContent.appendChild(inputEmail);
    modalContent.appendChild(inputSubject);
    modalContent.appendChild(textareaContent);
    modalContent.appendChild(sendButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}




function closeModal(modal) {
    document.body.removeChild(modal);
}


function clearModals() {
    const existingModals = document.querySelectorAll('.modal');
    existingModals.forEach(modal => {
        modal.parentNode.removeChild(modal); 
    });
}

function createModal(message, isSuccess) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center;";

    const modalContent = document.createElement('div');
    modalContent.style = "background: white; padding: 20px; border-radius: 10px; text-align: center; width: 300px;";

    const messageP = document.createElement('p');
    messageP.textContent = message;
    modalContent.appendChild(messageP);

    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style = "margin-top: 20px; padding: 10px 20px; font-size: 16px; cursor: pointer;";
    okButton.onclick = () => {
        document.body.removeChild(modal);
    };

    modalContent.appendChild(okButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function successModal() {
    clearModals();
    createModal('Success! Operation completed successfully.', true);
}

function failureModal() {
    clearModals();
    createModal('Failure! There was an error completing the operation.', false);
}

ipcRenderer.on('show-success-modal', () => {
    successModal(); 
});

ipcRenderer.on('show-failure-modal', () => {
    failureModal(); 
});


module.exports = {
    choiceModal,
    gmailModal,
    initiateGmailOAuth,
    successModal,
    failureModal
};
