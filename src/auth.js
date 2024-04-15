document.addEventListener('DOMContentLoaded', () => {
    const storedToken = localStorage.getItem('jwtToken');
    verifyToken(storedToken).then(isValid => {
        if (isValid) {
            loadMainContent();
        } else {
            displaySignupForm();
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

function displaySignupForm() {
    const formsHtml = `
        <div class="welcome-message">
            <h1>Welcome to Milio</h1>
            <p>An AI assistant that <em>actually</em> assists you.</p>
        </div>
        <div id="authForms" class="auth-forms">
            <div id="signupSection">
                <form id="signupForm" class="auth-form">
                    <input type="email" id="signupEmail" placeholder="Enter your email" required />
                    <input type="password" id="signupPassword" placeholder="Enter your password" required />
                    <input type="password" id="confirmPassword" placeholder="Confirm your password" required />
                    <button type="submit" class="submit-btn">Sign Up</button>
                </form>
                <p class="switch-form">Already have an account? <a href="#" id="showLoginForm">Log in</a></p>
            </div>
            <div id="loginSection" class="hidden">
                <form id="loginForm" class="auth-form">
                    <input type="email" id="loginEmail" placeholder="Enter your email" required />
                    <input type="password" id="loginPassword" placeholder="Enter your password" required />
                    <button type="submit" class="submit-btn">Login</button>
                </form>
                <p class="switch-form">Need an account? <a href="#" id="showSignupForm">Sign up!</a></p>
            </div>
        </div>
    `;
    document.getElementById('app').innerHTML = formsHtml;
    attachFormListeners();
}


function attachFormListeners() {
    document.getElementById('showLoginForm').addEventListener('click', () => toggleFormsVisibility(true));
    document.getElementById('showSignupForm').addEventListener('click', () => toggleFormsVisibility(false));
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

function toggleFormsVisibility(showLogin) {
    const loginSection = document.getElementById('loginSection');
    const signupSection = document.getElementById('signupSection');
    if (showLogin) {
        loginSection.classList.remove('hidden');
        signupSection.classList.add('hidden');
    } else {
        loginSection.classList.add('hidden');
        signupSection.classList.remove('hidden');
    }
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
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
    }

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
    displaySignupForm(); 
}


async function deleteAccount() {
    const storedToken = localStorage.getItem('jwtToken');
    
    if (!storedToken) {
        alert('No user is currently logged in.');
        return;
    }

    console.log('Sending token:', storedToken);

    const confirmation = confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (!confirmation) {
        return; 
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
                alert('Session expired. Please log in again.');
                localStorage.removeItem('jwtToken'); 
                displaySignupForm();
                return;
            }
            throw new Error('Failed to delete account');
        }

        alert('Account successfully deleted.');
        localStorage.removeItem('jwtToken'); 
        displaySignupForm();
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