document.addEventListener('DOMContentLoaded', () => {
    const storedToken = localStorage.getItem('jwtToken');
    verifyToken(storedToken).then(isValid => {
        if (isValid) {
            loadMainContent();
        } else {
            displayLoginForm();
        }
    });
});

async function verifyToken(token) {
    if (!token) return false;
    try {
        const response = await fetch('https://server.lostengineering.com/verify-token', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Token verification failed');
        const data = await response.json();
        return data.valid;
    } catch (error) {
        console.error('Error verifying token:', error);
        return false;
    }
}

function displayLoginForm() {
    const authFormHtml = `
        <div id="authForms">
            <form id="loginForm">
                <input type="email" id="loginEmail" placeholder="Enter your email" required />
                <input type="password" id="loginPassword" placeholder="Enter your password" required />
                <button type="submit">Login</button>
            </form>
            <form id="signupForm">
                <input type="email" id="signupEmail" placeholder="Enter your email" required />
                <input type="password" id="signupPassword" placeholder="Enter your password" required />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    `;
    document.getElementById('app').innerHTML = authFormHtml;

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const jwt = await loginUser(email, password);
        if (jwt) {
            localStorage.setItem('jwtToken', jwt);
            loadMainContent();
        } else {
            alert('Login failed. Please try again.');
        }
    } catch (error) {
        alert('Login error. Please try again.');
    }
}

async function loginUser(email, password) {
    const response = await fetch('https://server.lostengineering.com/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    return response.ok ? data.token : null; 
}

async function handleSignup(event) {
    event.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    const response = await fetch('https://server.lostengineering.com/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (response.ok) {
        alert('Signup successful. Please log in.');
    } else {
        alert('Signup failed. Please try again.');
    }
}

function logout() {
    localStorage.removeItem('jwtToken');
    displayLoginForm(); 
}


async function deleteAccount() {
    const storedToken = localStorage.getItem('jwtToken');
    
    if (!storedToken) {
        alert('No user is currently logged in.');
        return;
    }

    console.log('Sending token:', storedToken); // For debugging purposes

    const confirmation = confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (!confirmation) {
        return; // User cancelled the operation
    }

    try {
        const response = await fetch('https://server.lostengineering.com/user/delete', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${storedToken}`
            }
        });

        if (!response.ok) {
            if(response.status === 401) {
                // Handle unauthorized error specifically
                alert('Session expired. Please log in again.');
                localStorage.removeItem('jwtToken'); // Consider logging the user out
                displayLoginForm();
                return;
            }
            throw new Error('Failed to delete account');
        }

        alert('Account successfully deleted.');
        localStorage.removeItem('jwtToken'); // Clear the JWT token
        displayLoginForm(); // Redirect user to login page
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account. Please try again.');
    }
}




function loadMainContent() {
    const scriptTag = document.createElement('script');
    scriptTag.src = 'renderer.js';
    scriptTag.onload = () => {
        console.log('Renderer script loaded successfully.');
        if (window.initMainApp) {
            window.initMainApp();
        }
    };
    document.body.appendChild(scriptTag);
}