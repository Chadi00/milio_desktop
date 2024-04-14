const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    loginButton.addEventListener('click', openAuthModal);
});

function createAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center;";

    const modalContent = document.createElement('div');
    modalContent.style = "background: white; padding: 20px; border-radius: 10px; width: 500px; height: 300px; display: flex; flex-direction: column; justify-content: space-around; align-items: center;";

    const heading = document.createElement('h2');
    heading.textContent = 'Login with Gmail';

    const paragraph = document.createElement('p');
    paragraph.textContent = 'Please wait, redirecting to Gmail...';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = closeAuthModal;

    modalContent.appendChild(heading);
    modalContent.appendChild(paragraph);
    modalContent.appendChild(cancelButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    initiateGmailOAuth();
    return modal;
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.parentNode.removeChild(modal);
    }
}

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

module.exports = createAuthModal;
