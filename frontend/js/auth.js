// API Configuration
const API_URL = window.API_CONFIG?.BACKEND_URL || 'http://localhost:5000/api';
// Show/Hide Forms
function showLogin() {
  document.getElementById('loginCard').classList.remove('hidden');
  document.getElementById('signupCard').classList.add('hidden');
}

function showSignup() {
  document.getElementById('loginCard').classList.add('hidden');
  document.getElementById('signupCard').classList.remove('hidden');
}

// Show Alert Message
function showAlert(elementId, message, type = 'error') {
  const alertContainer = document.getElementById(elementId);
  const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
  const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
  
  alertContainer.innerHTML = `
    <div class="alert ${alertClass}">
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 5000);
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  submitBtn.disabled = true;
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showAlert('loginAlert', 'Login successful! Redirecting...', 'success');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      showAlert('loginAlert', data.message || 'Login failed. Please try again.');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('loginAlert', 'Unable to connect to server. Please try again later.');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});

// Signup Form Handler
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('signupUsername').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
  submitBtn.disabled = true;
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showAlert('signupAlert', 'Account created successfully! Redirecting...', 'success');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      const errorMsg = data.errors 
        ? data.errors.map(err => err.msg).join(', ')
        : data.message || 'Registration failed. Please try again.';
      
      showAlert('signupAlert', errorMsg);
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  } catch (error) {
    console.error('Signup error:', error);
    showAlert('signupAlert', 'Unable to connect to server. Please try again later.');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});

// Check if user is already logged in
if (localStorage.getItem('token')) {
  window.location.href = 'dashboard.html';
}
