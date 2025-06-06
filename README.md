# chat-ext: AI Assistant Browser Extension

A browser extension that enables AI-powered chat interactions with webpage content using Hugging Face models.

![Screenshot](https://github.com/abhishekkrthakur/chat-ext/blob/main/ss.png?raw=true)

## Features

- 🔍 Process selected text or entire webpage content
- 💬 Interact with AI models through a convenient sidebar interface
- 🎨 Dark/Light theme support
- ⚡ Rate-limited API calls for stability
- 🔒 Secure API key management
- 📱 Responsive design with Tailwind CSS

## Usage

To use the extension:

### Chrome
1. Download the latest Chrome build from the [Releases](https://github.com/abhishekkrthakur/chat-ext/releases) page or build from source
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/chrome` directory from the project

### Firefox
1. Download the latest Firefox build from the [Releases](https://github.com/abhishekkrthakur/chat-ext/releases) page or build from source
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the sidebar
4. Click "Load Temporary Add-on"
5. Navigate to the `dist/firefox` directory and select `manifest.json`

Click the extension icon and open settings. Configure the following:
   - API URL: Your Hugging Face API endpoint or local endpoint.
   - API Token: Your Hugging Face API token (for gated repos).
   - Model Name: The model to use (default: meta-llama/Llama-2-7b-chat)
   - Max Tokens: Maximum response length (default: 500)

You can also use a local llm server. I tried vLLM:

```
docker run --runtime nvidia --gpus 2 \
        --name my_vllm_container \
        -v ~/.cache/huggingface:/root/.cache/huggingface \
        --env "HUGGING_FACE_HUB_TOKEN=hf_XXX" \
        -p 8000:8000 \
        --ipc=host \
        vllm/vllm-openai:latest \
        --model meta-llama/Llama-3.2-1B-Instruct --dtype=half
```

If you want to use an LLM from Hugging Face API Inference, you can use the following:

```
api url: `https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B-Instruct`
token: your token which can be used for api inference
model: meta-llama/Llama-3.2-1B-Instruct
```

The above example is for Llama-3.2-1B-Instruct model. You can use any compatible model you want.


## Detailed Installation

### From Source

If you do not want to compile on your own, you can download the latest release from the [Releases](https://github.com/abhishekkrthakur/chat-ext/releases) page. After that, skip to step 4.

1. Clone the repository:
```bash
git clone https://github.com/abhishekkrthakur/chat-ext.git
cd chat-ext
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory from the project

## Configuration

1. Click the extension icon and open settings
2. Configure the following:
   - API URL: Your Hugging Face API endpoint or local endpoint.
   - API Token: Your Hugging Face API token (for gated repos).
   - Model Name: The model to use (default: meta-llama/Llama-2-7b-chat)
   - Max Tokens: Maximum response length (default: 500)

## Usage

1. Click the extension icon to open the sidebar
2. Either:
   - Select text on the webpage to process specific content
   - Or leave unselected to process the entire page
3. Click "Ask AI" to get AI response when asking a question or use the quick buttons
4. Use the theme toggle to switch between light/dark modes

## Development

### Scripts

- `npm run dev` - Watch mode for development
- `npm run build` - Production build
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code

### Project Structure

```
chat-ext/
├── src/
│   ├── background.js    # Extension background script
│   ├── content.js       # Content script for webpage interaction
│   ├── client.js        # API client
│   ├── popup.js         # UI logic
│   └── popup.html       # Extension UI
├── dist/                # Build output
└── scripts/            # Build and utility scripts
```

### Technologies Used

- Webpack for bundling
- Tailwind CSS for styling
- Babel for JavaScript compilation
- ESLint and Prettier for code quality
- Jest for testing

## Browser Support

- Google Chrome and Chromium-based browsers (latest 2 versions)
- Mozilla Firefox (version 57.0 and later)

Note: Some features may differ between browsers:
- Chrome supports the side panel feature
- Firefox will open the extension in a popup window instead

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Note

Most of this extension code was generated by LLMs.#   c h r o m e _ c h a t b o t  
 