document.addEventListener('DOMContentLoaded', function() {
    const dragDropOption = document.getElementById('dragDropOption');
    const aiOption = document.getElementById('aiOption');
    const helpLink = document.getElementById('helpLink');
    
    // Handle option selection
    dragDropOption.addEventListener('click', function() {
        window.location.href = 'domain.html';
    });
    
    aiOption.addEventListener('click', function() {
        window.location.href = 'index.html';  // Updated path to frontend/index.html
    });
    
    // Make the entire card clickable (not just the button)
    dragDropOption.querySelector('.select-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        window.location.href = 'domain.html';
    });
    
    aiOption.querySelector('.select-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        window.location.href = 'index.html';  // Updated path to frontend/index.html
    });
    
    // Help link functionality
    helpLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert("Drag & Drop is best if you want full control over your design.\n\nAI Builder is perfect if you want a quick, professional site created automatically.");
    });
});