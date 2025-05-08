document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const userInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const micButton = document.getElementById('mic-button');
    const chatMessages = document.getElementById('chatMessages');
    
    // Initialize code blocks object for storing code snippets
    window.codeBlocks = {};
    
    // Speech recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // Set language
        
        recognition.onstart = () => {
            micButton.classList.add('recording');
            updateMicButtonUI('Listening...');
        };
        
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
                
            userInput.value = transcript;
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            updateMicButtonUI('Error: ' + event.error);
            setTimeout(() => updateMicButtonUI(), 1500);
            micButton.classList.remove('recording');
        };
        
        recognition.onend = () => {
            micButton.classList.remove('recording');
            updateMicButtonUI();
        };
    }
    
    // ======================
    // Voice Recording Logic
    // ======================
    micButton.addEventListener('click', () => {
        if (!recognition) {
            alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
            return;
        }
        
        if (micButton.classList.contains('recording')) {
            // Stop recording
            recognition.stop();
        } else {
            // Start recording
            recognition.start();
            
            // Auto-stop after 10 seconds
            setTimeout(() => {
                if (micButton.classList.contains('recording')) {
                    recognition.stop();
                }
            }, 10000);
        }
    });

    function updateMicButtonUI(status = '') {
        if (status) {
            micButton.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                </svg>
                <span class="status-text">${status}</span>
            `;
        } else {
            micButton.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                </svg>
            `;
        }
    }

    // ======================
    // Chat Message Handling
    // ======================
    function handleSendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addUserMessage(message);
        
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot';
        loadingDiv.innerHTML = 'Thinking...';
        loadingDiv.id = 'loading-message';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        })
        .then(response => {
            // Remove loading indicator
            const loadingMessage = document.getElementById('loading-message');
            if (loadingMessage) {
                chatMessages.removeChild(loadingMessage);
            }

            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Server error');
            }
        })
        .then(data => {
            const botResponse = processCodeInResponse(data.response || "I'm sorry, I didn't understand that.");
            addBotMessage(botResponse);
        })
        .catch(error => {
            console.error('Chat error:', error);
            const loadingMessage = document.getElementById('loading-message');
            if (loadingMessage) {
                chatMessages.removeChild(loadingMessage);
            }
            addBotMessage('Error: Something went wrong connecting to the server.');
        });

        userInput.value = '';
    }

    // ======================
    // Message Display Functions
    // ======================
    function addUserMessage(message) {
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user';
        userMessageDiv.textContent = message;
        chatMessages.appendChild(userMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addBotMessage(message) {
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message bot';
        botMessageDiv.innerHTML = message;
        chatMessages.appendChild(botMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        attachEventListenersToNewButtons(botMessageDiv);
    }

    // ======================
    // Code Processing Functions
    // ======================
    function processCodeInResponse(response) {
        const codeBlockRegex = /```(html|css|javascript|js|python|php)([\s\S]*?)```/g;
        let match;
        let processedResponse = response;
        let blockCounter = 1;

        while ((match = codeBlockRegex.exec(response)) !== null) {
            const language = match[1];
            const code = match[2].trim();
            const blockId = `code-block-${Date.now()}-${blockCounter}`;
            
            window.codeBlocks[blockId] = { language, code };
            
            const formattedCodeBlock = `
                <div class="code-block">
                    <div class="code-header">${language}</div>
                    <pre class="code-content">${escapeHtml(code)}</pre>
                    <div class="code-options">
                        <button class="code-option-btn copy-btn" data-code="${blockId}">Copy</button>
                        <button class="code-option-btn preview-btn" data-id="${blockId}">Preview</button>
                    </div>
                    <div class="code-preview" id="preview-${blockId}" style="display: none;">
                        <div class="preview-header">
                            <span>Preview</span>
                            <button class="close-preview-btn" data-id="${blockId}">×</button>
                        </div>
                        <iframe class="preview-frame" id="frame-${blockId}" sandbox="allow-scripts allow-same-origin"></iframe>
                    </div>
                </div>
            `;
            
            processedResponse = processedResponse.replace(match[0], formattedCodeBlock);
            blockCounter++;
        }
        
        return processedResponse;
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function attachEventListenersToNewButtons(messageDiv) {
        messageDiv.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', handleCopyButtonClick);
        });
        
        messageDiv.querySelectorAll('.preview-btn').forEach(button => {
            button.addEventListener('click', handlePreviewButtonClick);
        });
        
        messageDiv.querySelectorAll('.close-preview-btn').forEach(button => {
            button.addEventListener('click', handleClosePreviewClick);
        });
    }

    function handleCopyButtonClick(e) {
        const blockId = e.target.getAttribute('data-code');
        const codeBlock = window.codeBlocks[blockId];
        
        if (codeBlock?.code) {
            navigator.clipboard.writeText(codeBlock.code)
                .then(() => {
                    e.target.textContent = 'Copied!';
                    setTimeout(() => {
                        e.target.textContent = 'Copy';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                });
        }
    }

    function handlePreviewButtonClick(e) {
        const blockId = e.target.getAttribute('data-id');
        const previewElement = document.getElementById(`preview-${blockId}`);
        
        if (previewElement) {
            const codeBlock = window.codeBlocks[blockId];
            const frameId = `frame-${blockId}`;
            
            if (previewElement.style.display === 'none') {
                previewElement.style.display = 'block';
                displayPreview(frameId, codeBlock.language, codeBlock.code);
                e.target.textContent = 'Hide Preview';
            } else {
                previewElement.style.display = 'none';
                e.target.textContent = 'Preview';
            }
        }
    }

    function handleClosePreviewClick(e) {
        const blockId = e.target.getAttribute('data-id');
        const previewElement = document.getElementById(`preview-${blockId}`);
        const previewButton = document.querySelector(`.preview-btn[data-id="${blockId}"]`);
        
        if (previewElement) {
            previewElement.style.display = 'none';
            if (previewButton) {
                previewButton.textContent = 'Preview';
            }
        }
    }

    function displayPreview(frameId, language, code) {
        const iframe = document.getElementById(frameId);
        if (!iframe) return;

        let content = '';
        
        if (language === 'html') {
            content = code;
        } else if (language === 'css') {
            content = `<style>${code}</style><div class="preview-message">CSS applied to this page</div>`;
        } else if (language === 'javascript' || language === 'js') {
            content = `
                <div class="preview-message">JavaScript code loaded:</div>
                <pre>${escapeHtml(code)}</pre>
                <script>${code}<\/script>
            `;
        } else {
            content = `<pre>${escapeHtml(code)}</pre>`;
        }

        const fullContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; margin: 0; padding: 10px; }
                    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; }
                    .preview-message { margin-bottom: 10px; color: #555; }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `;

        try {
            const iframeDoc = iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(fullContent);
            iframeDoc.close();
        } catch (error) {
            console.error("Error rendering preview:", error);
        }
    }

    // ======================
    // Event Listeners
    // ======================
    sendButton.addEventListener('click', handleSendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });