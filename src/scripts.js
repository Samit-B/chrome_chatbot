document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    const chatContainer = document.getElementById('chatContainer');
    const messageInput = document.querySelector('.message-input');
    const sendButton = document.querySelector('.send-button');
    const typingIndicator = document.querySelector('.typing-indicator');
    const voiceToggle = document.querySelector('.voice-toggle');
    const fileInput = document.getElementById('fileInput');
    let attachedFile = null;

    // Theme toggling
    let isDarkTheme = false;
    themeToggle.addEventListener('click', () => {
        isDarkTheme = !isDarkTheme;
        body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
        themeToggle.innerHTML = isDarkTheme ?
            '<i class="fas fa-sun"></i>' :
            '<i class="fas fa-moon"></i>';
    });

    // Chat functionality
    function createMessageElement(content, isUser = false, isFile = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';

        // Add icons for User and AI
        avatar.innerHTML = isUser 
            ? '<i class="bi bi-person-lines-fill"></i>' 
            : '<i class="bi bi-hypnotize"></i>';

        const messageBubble = document.createElement('div');
        messageBubble.className = 'message-bubble';

        if (isFile) {
            const fileAttachment = document.createElement('div');
            fileAttachment.className = 'file-attachment';
            fileAttachment.innerHTML = `
                <i class="fas fa-file"></i>
                <span>${content}</span>
            `;
            messageBubble.appendChild(fileAttachment);
        } else {
            messageBubble.innerHTML = formatBotResponse(content);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageBubble);

        return messageDiv;
    }

    function formatBotResponse(text) {
        return text
            .split('\n')
            .map(line => {
                // Remove leading/trailing spaces
                line = line.trim();
    
                // Replace asterisks used for bullet points with '• '
                if (line.startsWith('*')) {
                    line = `• ${line.substring(1).trim()}`;
                }
    
                return `<p>${line}</p>`;
            })
            .join('');
    }
    
    function addMessage(content, isUser = false, isFile = false) {
        const messageElement = createMessageElement(content, isUser, isFile);
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function showTypingIndicator() {
        typingIndicator.style.display = 'block';
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }

    async function simulateBotResponse(userMessage) {
        showTypingIndicator();

        try {
            let response = await fetch(`http://localhost:8000/chat/query?userChatQuery=${encodeURIComponent(userMessage)}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response from server.");
            }

            let data = await response.json();
            hideTypingIndicator();
            addMessage(data.response); // Display AI's response
        } catch (error) {
            hideTypingIndicator();
            addMessage("Sorry, I couldn't fetch a response. Please try again later.");
            console.error("Error:", error);
        }
    }

    async function handleSendMessage() {
        const message = messageInput.value.trim();
        
        if (!message && !attachedFile) return;

        if (attachedFile) {
            addMessage(attachedFile.name, true, true);
            await handlePdfQuery(attachedFile, message);
            attachedFile = null;
        } else {
            addMessage(message, true);
            await simulateBotResponse(message);
        }

        messageInput.value = '';
    }


    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Voice input toggle
    let isListening = false;
    voiceToggle.addEventListener('click', () => {
        isListening = !isListening;
        if (isListening) {
            voiceToggle.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            // Start voice recognition (implementation required)
        } else {
            voiceToggle.innerHTML = '<i class="fas fa-microphone"></i>';
            // Stop voice recognition (implementation required)
        }
    });

    // File input handling
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];

        if (file) {
            attachedFile = file;

            // Remove existing file preview if any
            const existingFileDisplay = document.querySelector('.file-attachment');
            if (existingFileDisplay) {
                existingFileDisplay.remove();
            }

            // Create a new file preview element
            const fileDisplay = document.createElement('div');
            fileDisplay.className = 'file-attachment';
            fileDisplay.innerHTML = `
                <i class="fas fa-file"></i>
                <span>${file.name}</span>
                <button class="remove-file" aria-label="Remove file">&times;</button>
            `;

            // Insert the file preview AFTER the input field
            messageInput.parentNode.appendChild(fileDisplay);

            // Remove file display on click
            fileDisplay.querySelector('.remove-file').addEventListener('click', () => {
                fileDisplay.remove();
                attachedFile = null;
                fileInput.value = ''; // Clear file input
            });
        }
    });
    async function handlePdfQuery(file, userQuery) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("query", userQuery);

        try {
            const response = await fetch("http://localhost:8000/pdf/query", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error("Error processing PDF query.");
            }

            const result = await response.json();
            addMessage(`📄 Answer from PDF:\n${result.answer}`, false);

        } catch (error) {
            addMessage("Error retrieving PDF data. Please try again.", false);
            console.error("PDF Query Error:", error);
        }
    }

    setTimeout(() => {
        addMessage("Hello! I'm your AI assistant. How can I help you today?");
    }, 500);
});
