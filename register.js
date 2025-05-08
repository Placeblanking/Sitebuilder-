document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const loginLink = document.getElementById('loginLink');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Password strength indicator
    passwordInput.addEventListener('input', function() {
        updatePasswordStrength(this.value);
    });
    
    // Form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validate inputs
        if (!validateForm(username, email, password, confirmPassword)) {
            return;
        }
        
        // Here you would typically send to server
        console.log('Registration data:', { username, email, password });
        
        // Simulate successful registration
        simulateRegistration();
    });
    
    function validateForm(username, email, password, confirmPassword) {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });
        
        // Username validation
        if (username.length < 3) {
            showError('username', 'Username must be at least 3 characters');
            isValid = false;
        }
        
        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Password validation
        if (password.length < 8) {
            showError('password', 'Password must be at least 8 characters');
            isValid = false;
        }
        
        // Password match validation
        if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }
        
        return isValid;
    }
    
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Insert after the input field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    
    function updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        if (!strengthBar) return;
        
        // Calculate strength (simple version)
        let strength = 0;
        if (password.length > 0) strength += 25;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/\d/.test(password)) strength += 25;
        
        // Update visual indicator
        strengthBar.style.width = strength + '%';
        strengthBar.style.background = 
            strength < 50 ? '#f44336' : 
            strength < 75 ? '#ff9800' : '#4CAF50';
    }
    
    function simulateRegistration() {
        const btn = registerForm.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Creating account...';
        
        setTimeout(() => {
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.textContent = 'Account created successfully!';
            successMsg.style.display = 'block';
            registerForm.insertBefore(successMsg, registerForm.lastElementChild);
            
            btn.textContent = 'Redirecting...';
            
            setTimeout(() => {
                // Redirect to login page
                window.location.href = 'login.html';
            }, 1500);
        }, 2000);
    }
});