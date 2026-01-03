# Ollama Widget Project Context

## Project Overview
**Ollama Widget** is a modular Electron desktop widget for monitoring and controlling a local Ollama instance. It features a modern Glass Morphism UI, System Tray support, and secure IPC communication.

## Tech Stack
*   **Runtime:** [Electron](https://www.electronjs.org/) (Node.js + Chromium)
*   **Frontend:** Vanilla JavaScript (ES Modules), CSS3 Variables
*   **Backend (Local):** [Ollama API](https://ollama.com/) (default: `http://localhost:11434`)
*   **Architecture:** Main-Preload-Renderer pattern with Context Isolation.

## Project Structure

### Key Directories
*   **`src/`**
    *   **`main/`**: The Electron **Main Process**.
        *   `index.js`: App entry point, window creation.
        *   `ipc.js`: Handles API requests (`fetch`) and System operations.
        *   `tray.js`: System Tray configuration.
    *   **`preload/`**: **Context Bridge**.
        *   `index.js`: Exposes a safe `window.api` to the Renderer.
    *   **`renderer/`**: The **Renderer Process** (UI).
        *   `index.html`: Main layout.
        *   `css/styles.css`: Glass morphism styling & themes.
        *   `js/app.js`: Main UI logic & state management.
        *   `js/ui.js`: DOM manipulation helpers.
    *   **`shared/`**:
        *   `constants.js`: Shared IPC channel names.

## Building and Running

### Setup
```bash
npm install
```

### Development
```bash
npm start
```
*Runs `electron .` using `src/main/index.js` as the entry point.*

### Production Build
```bash
npm run build
```
*Uses `electron-builder` to create an installer in `release/`.*

## Architecture Notes

### Security
*   **Context Isolation:** Enabled (`contextIsolation: true`). The Renderer cannot access Node.js directly.
*   **IPC:** Communication happens via `window.api` defined in `src/preload/index.js`.
*   **Sandbox:** Disabled (`sandbox: false`) to allow the Preload script to `require` local shared constants.

### State Management
*   **Persistent State:** Theme, Compact Mode, and Pinned Models are saved in `localStorage`.
*   **Runtime State:** `app.js` manages the current list of models and refresh intervals.

## Development Conventions
*   **Styling:** Pure CSS with variables for theming (`--glass-bg`, `--text-primary`).
*   **Modules:** The Renderer uses ES Modules (`<script type="module">`).
*   **IPC:** Always use constants from `src/shared/constants.js` for channel names.