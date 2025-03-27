document.addEventListener('DOMContentLoaded', () => {
  // Theme toggling
  const themeToggle = document.querySelector('.theme-toggle');
  const body = document.body;
  let isDarkTheme = false;

  themeToggle.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    themeToggle.innerHTML = isDarkTheme ?
      '<i class="fas fa-sun"></i>' :
      '<i class="fas fa-moon"></i>';
  });

  // Chat functionality
  const chatContainer = document.getElementById('chatContainer');
  const messageInput = document.querySelector('.message-input');
  const sendButton = document.querySelector('.send-button');
  const typingIndicator = document.querySelector('.typing-indicator');
  const fileInput = document.getElementById('fileInput');
  let attachedFile = null;

  let isRecording = false;
  let recognition;

  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      messageInput.value = transcript; // Set the transcribed text in the input box
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
  }

  const voiceToggleButton = document.querySelector('.voice-toggle');
  voiceToggleButton.addEventListener('click', () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      voiceToggleButton.classList.remove('recording');
      isRecording = false;
    } else {
      recognition.start();
      voiceToggleButton.classList.add('recording');
      isRecording = true;
    }
  });

  function createMessageElement(content, isUser = false, isFile = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = isUser ? 'U' : 'AI';

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

    // Add action buttons (Copy, Edit, and Voice Playback)
    const actionButtons = document.createElement('div');
    actionButtons.className = 'message-actions';

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
    copyButton.title = 'Copy to Clipboard';
    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(content);
    });

    let currentUtterance = null;

    const voiceButton = document.createElement('button');
    voiceButton.className = 'voice-button';
    voiceButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    voiceButton.title = 'Play Message';

    voiceButton.addEventListener('click', () => {
      if (speechSynthesis.speaking) {
        // If already speaking, stop the speech synthesis
        speechSynthesis.cancel();
        currentUtterance = null;
        voiceButton.classList.remove('playing'); // Optional: Add a visual indicator
      } else {
        // Start speaking the message
        currentUtterance = new SpeechSynthesisUtterance(content);

        currentUtterance.lang = 'en-US'; // Default to English if detection fails

        speechSynthesis.speak(currentUtterance);
        voiceButton.classList.add('playing'); // Optional: Add a visual indicator
      }
    });

    actionButtons.appendChild(copyButton);
    actionButtons.appendChild(voiceButton);

    if (isUser) {
      const editButton = document.createElement('button');
      editButton.className = 'edit-button';
      editButton.innerHTML = '<i class="fas fa-edit"></i>';
      editButton.title = 'Edit Message';
      editButton.addEventListener('click', () => {
        const originalContent = content; // Retain the original content
        const editableInput = document.createElement('textarea');
        editableInput.className = 'editable-input';
        editableInput.value = originalContent;

        const sendIcon = document.createElement('button');
        sendIcon.className = 'send-icon';
        sendIcon.innerHTML = '<i class="fas fa-paper-plane"></i>';
        sendIcon.title = 'Send Edited Message';

        messageBubble.innerHTML = ''; // Clear the current content
        messageBubble.appendChild(editableInput);
        messageBubble.appendChild(sendIcon);

        editableInput.focus();

        const sendEditedMessage = async () => {
          const newContent = editableInput.value.trim();
          if (newContent) {
            // Clear all messages after the edited message
            let currentMessage = messageDiv.nextSibling;
            while (currentMessage) {
              const nextMessage = currentMessage.nextSibling;
              currentMessage.remove();
              currentMessage = nextMessage;
            }

            // Update the message bubble with the new content
            messageBubble.innerHTML = formatBotResponse(newContent);

            // Re-add the action buttons after editing
            messageBubble.appendChild(actionButtons);

            // Send the updated query to the backend
            await simulateBotResponse(newContent);
          } else {
            // Restore the original content if no new content is provided
            messageBubble.innerHTML = formatBotResponse(originalContent);
            messageBubble.appendChild(actionButtons); // Re-add the action buttons
          }
        };

        sendIcon.addEventListener('click', sendEditedMessage);
        editableInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault(); // Prevent newline
            sendEditedMessage();
          }
        });
      });
      actionButtons.appendChild(editButton);
    }

    messageBubble.appendChild(actionButtons);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageBubble);

    return messageDiv;
  }

  function formatBotResponse(text) {
    return text
      .split('\n')
      .map(line => {
        line = line.trim();
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
      addMessage(data.response);
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

  // File input handling
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file) {
      attachedFile = file;

      const existingFileDisplay = document.querySelector('.file-attachment');
      if (existingFileDisplay) {
        existingFileDisplay.remove();
      }

      const fileDisplay = document.createElement('div');
      fileDisplay.className = 'file-attachment';
      fileDisplay.innerHTML = `
        <i class="fas fa-file"></i>
        <span>${file.name}</span>
        <button class="remove-file" aria-label="Remove file">&times;</button>
      `;

      messageInput.parentNode.appendChild(fileDisplay);

      fileDisplay.querySelector('.remove-file').addEventListener('click', () => {
        fileDisplay.remove();
        attachedFile = null;
        fileInput.value = '';
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

  if (sendButton) {
    sendButton.addEventListener('click', () => {
      const message = messageInput.value.trim();
      if (message) {
        console.log('Message sent:', message); // Debugging log
        // Add your message handling logic here
      }
    });
  }
});