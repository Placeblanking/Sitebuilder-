document.addEventListener('DOMContentLoaded', function () {
    const domainForm = document.getElementById('domainForm');
    const continueBtn = document.querySelector('.login-btn');

    domainForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const selectedOption = document.querySelector('input[name="domain"]:checked').value;

        // Show loading state
        continueBtn.disabled = true;
        continueBtn.innerHTML = '<span class="loading-spinner"></span> Processing...';

        setTimeout(() => {
            switch (selectedOption) {
                case 'templates':
                    window.location.href = 'Blog/blog.html'; // Path to your blog templates
                    break;
                case 'editor':
                    window.location.href = 'index1.html'; // Path to your drag-and-drop editor
                    break;
                default:
                    continueBtn.disabled = false;
                    continueBtn.textContent = 'Continue';
                    console.error('Unknown option selected');
            }
        }, 1000);
    });
});
