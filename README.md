<p align="center">
  <img src="./src/assets/icon.png" width="128" height="128" alt="Ollama Widget Logo" />
</p>

# Ollama Widget

A beautiful, glass-morphism Electron widget for monitoring and controlling your local Ollama instance.

## Features

- 🎨 **Glass Design**: Modern transparent UI with Light ☀ and Dark 🌙 themes.
- 📊 **Real-time Monitoring**: View running models with CPU and VRAM usage.
- 🎮 **Model Control**: Stop running models directly from the widget.
- 📌 **Favorites**: Pin your most-used models to the top of the list.
- 🔍 **Detailed Specs**: Click any model to view parameters, quantization, and template info.
- 📏 **Compact Mode**: Minimalist view that hides the footer and extra details.
- 🎯 **Always-on-Top**: Toggle to keep the widget floating above other windows.
- 🔄 **Auto-refresh**: Updates every 5 seconds.
- 📥 **System Tray**: Minimize to tray to keep your taskbar clean.

## Prerequisites

- **Node.js**: v18+ (for development)
- **Ollama**: Must be installed and running locally on port 11434 (`ollama serve`)

## Installation

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start Ollama:

   ```bash
   ollama serve
   ```

2. Run the widget:

   ```bash
   npm start
   ```

3. **Build for production** (creates an installer in `release/`):
   ```bash
   npm run build
   ```

## Controls

- **Top Bar**:
  - ☀/🌙: Toggle Theme
  - ↕: Toggle Compact Mode
  - 📌: Toggle Always-on-Top
  - −/×: Minimize/Close
- **Lists**:
  - **Click Name**: View Model Details (Parameters, Template)
  - **Stop (⏹)**: Stop a running model
  - **Pin (☆/★)**: Pin a model to the top of the Available list

## Project Structure

The project follows a modular Electron architecture:

- **`src/main/`**: Main process (Window creation, System Tray, API proxy).
- **`src/renderer/`**: Frontend UI (HTML, CSS, JS).
- **`src/preload/`**: Secure Context Bridge for IPC.
- **`src/shared/`**: Shared constants.

## Security

This app uses **Context Isolation** (`contextIsolation: true`) to ensure the renderer process cannot directly access Node.js primitives, communicating instead through a secure Preload script.

## License

MIT License
