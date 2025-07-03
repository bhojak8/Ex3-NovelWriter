# Ex3 Novel Writer - Local LLM Edition

A web-based implementation of the Ex3 (Extracting, Excelsior, Expanding) framework for automatic novel writing, designed to work with local Large Language Models.

![Ex3 Framework](imgs/framework-ex3.png)

## Features

### 🤖 **Local LLM Integration**
- Works with popular local LLM servers (Ollama, LM Studio, Text Generation WebUI, vLLM)
- No external API keys required
- Full privacy - your stories never leave your machine
- Supports any OpenAI-compatible API endpoint

### 📚 **Three-Stage Novel Creation**
1. **Extracting**: Set up your novel parameters and premise
2. **Excelsior**: Generate and refine story outlines
3. **Expanding**: AI-powered chapter writing with context awareness

### ✨ **Smart Writing Features**
- **Context-Aware Writing**: Maintains story consistency across chapters
- **Entity Tracking**: Automatic character and location extraction
- **Entity Database**: Keeps track of story elements for consistency
- **Multiple Writing Styles**: First person (我) or third person (他/她)
- **Real-time Progress**: Track writing progress and statistics

## Quick Start

### Prerequisites

You'll need a local LLM server running. Here are the most popular options:

#### Option 1: Ollama (Recommended)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model (Chinese-capable recommended)
ollama pull llama3.1:8b
ollama pull qwen2:7b

# Start Ollama (runs on http://localhost:11434)
ollama serve
```

#### Option 2: LM Studio
1. Download from [LM Studio](https://lmstudio.ai/)
2. Load a model (Qwen2, Llama3.1, or similar)
3. Start the local server (runs on http://localhost:1234)

#### Option 3: Text Generation WebUI
```bash
git clone https://github.com/oobabooga/text-generation-webui
cd text-generation-webui
./start_linux.sh --api --listen-port 5000
```

### Running Ex3 Novel Writer

1. **Start the application:**
   ```bash
   npm install
   npm run dev
   ```

2. **Configure your LLM:**
   - Click "Configure LLM" when you first open the app
   - Select your LLM server type (Ollama, LM Studio, etc.)
   - Test the connection
   - Save settings

3. **Create your novel:**
   - Set up your project with title, genre, and premise
   - Generate AI outline or create manually
   - Start writing and watch AI create your novel chapter by chapter

## Supported LLM Servers

| Server | Default URL | Notes |
|--------|-------------|-------|
| **Ollama** | `http://localhost:11434` | Easiest setup, great for beginners |
| **LM Studio** | `http://localhost:1234` | User-friendly GUI |
| **Text Generation WebUI** | `http://localhost:5000` | Advanced features, many model formats |
| **vLLM** | `http://localhost:8000` | High performance inference |
| **Custom** | Your URL | Any OpenAI-compatible API |

## Recommended Models

For best results with Chinese novel writing, we recommend:

- **Qwen2:7b** or **Qwen2:14b** - Excellent Chinese language capabilities
- **Llama3.1:8b** - Good multilingual support
- **Yi:6b** or **Yi:34b** - Strong Chinese performance
- **ChatGLM3:6b** - Optimized for Chinese tasks

## How It Works

### The Ex3 Framework

1. **Extracting Stage**
   - Extract story parameters (genre, themes, writing style)
   - Generate or refine the initial premise
   - Set up the foundation for your novel

2. **Excelsior Stage** 
   - Create detailed story outlines
   - Plan chapter structure and flow
   - Establish character and plot development

3. **Expanding Stage**
   - Generate full chapters with AI assistance
   - Maintain story consistency with entity tracking
   - Build comprehensive character and location databases

### Entity Tracking System

The system automatically:
- Extracts characters and locations from generated content
- Maintains a database of story elements
- Provides context to the AI for consistent writing
- Tracks relationships and character development

## Configuration

### LLM Settings

The app stores your LLM configuration locally:
- **Base URL**: Your LLM server endpoint
- **Model**: The specific model to use
- **API Key**: Optional, for hosted services

### Writing Parameters

- **Genre**: Fantasy, Sci-Fi, Romance, Mystery, etc.
- **Writing Style**: First person (我) or Third person (他/她)
- **Target Length**: Short, Medium, or Long novel
- **Themes**: Optional thematic elements

## Export Options

- **Plain Text**: Export your complete novel as a .txt file
- **Chapter-by-Chapter**: Individual chapter files
- **With Metadata**: Include character and location databases

## Privacy & Security

- **100% Local**: All processing happens on your machine
- **No Data Collection**: Your stories never leave your computer
- **Offline Capable**: Works without internet connection
- **Open Source**: Full transparency in how your data is handled

## Troubleshooting

### Common Issues

1. **"Connection failed" error**
   - Ensure your LLM server is running
   - Check the URL and port number
   - Verify the model is loaded

2. **Slow generation**
   - Try a smaller model
   - Reduce max tokens in generation
   - Check your hardware resources

3. **Poor Chinese output**
   - Use a Chinese-capable model (Qwen2, Yi, ChatGLM)
   - Adjust temperature settings
   - Provide more detailed prompts

### Performance Tips

- **GPU Acceleration**: Use CUDA/Metal for faster inference
- **Model Size**: Balance quality vs. speed based on your hardware
- **Context Length**: Longer context = better consistency but slower generation

## Contributing

This is a web implementation of the original Ex3 research. Contributions welcome!

## License

Based on the Ex3 research paper: [Ex3: Automatic Novel Writing by Extracting, Excelsior and Expanding](https://arxiv.org/pdf/2408.08506)

## Citation

```bibtex
@inproceedings{DBLP:conf/acl/LeiGHZZPL024,
  author       = {Huang Lei and
                  Jiaming Guo and
                  Guanhua He and
                  Xishan Zhang and
                  Rui Zhang and
                  Shaohui Peng and
                  Shaoli Liu and
                  Tianshi Chen},
  title        = {Ex3: Automatic Novel Writing by Extracting, Excelsior and Expanding},
  booktitle    = {{ACL} {(1)}},
  pages        = {9125--9146},
  publisher    = {Association for Computational Linguistics},
  year         = {2024}
}
```