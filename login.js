document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const registerLink = document.getElementById('registerLink');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Form submission handler
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Validate inputs
        if (!validateInputs(email, password)) {
            return;
        }
        
        // Process login
        try {
            await processLogin(email, password);
            redirectToDomain();
        } catch (error) {
            handleLoginError(error);
        }
    });
    
    // Register link handler
    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'register.html';
    });
    
    // Input validation function
    function validateInputs(email, password) {
        // Clear previous errors
        clearErrors();
        
        let isValid = true;
        
        // Email validation
        if (!email) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError(emailInput, 'Please enter a valid email');
            isValid = false;
        }
        
        // Password validation
        if (!password) {
            showError(passwordInput, 'Password is required');
            isValid = false;
        } else if (password.length < 8) {
            showError(passwordInput, 'Password must be at least 8 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Email format validation
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Process login (simulated)
    async function processLogin(email, password) {
        const btn = loginForm.querySelector('button');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> Logging in...';
        
        // Simulate API call delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // In a real app, this would be an actual API call
                console.log('Login attempt with:', { email, password });
                
                // Simulate successful login
                resolve();
                
                // For failed login you would use:
                // reject(new Error('Invalid credentials'));
            }, 1500);
        });
    }
    
    // Redirect to domain page
    function redirectToDomain() {
        const btn = loginForm.querySelector('button');
        btn.textContent = 'Login successful!';
        setTimeout(() => {
            window.location.href = 'option.html';
        }, 500);
    }
    
    // Error handling
    function handleLoginError(error) {
        const btn = loginForm.querySelector('button');
        btn.disabled = false;
        btn.textContent = 'Login';
        
        showError(passwordInput, error.message || 'Login failed. Please try again.');
    }
    
    // Show error message
    function showError(input, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        input.parentNode.appendChild(errorElement);
        input.focus();
    }
    
    // Clear error messages
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
    }
});