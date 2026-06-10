# Kushal Dhoot - 3D Interactive Cyberdeck Portfolio

Welcome to the **3D Cyberdeck Console** — an immersive, futuristic developer portfolio built for **Kushal Dhoot (B.Tech CSE - AI/ML specialized)**. This portfolio transforms the traditional personal website into a high-fidelity cybernetic terminal console combining WebGL 3D graphics, real-time keyboard audio synthesis, and interactive command interfaces.

---

## 🚀 Key Visual & Interactive Features

### 1. Zero-Allocation Web3D Constellation Backdrop
The background features an optimized, lightweight **Three.js Web3D engine** that runs completely lag-free:
*   **Hero Particle Cloud**: 120 glow-textured particles drifting through a 3D coordinate space. Connecting lines are drawn dynamically between adjacent nodes, forming a living constellation network.
*   **Zero-Allocation Updates**: Line segment arrays and colors are pre-allocated at startup, completely eliminating memory allocation pauses and preventing WebGL context crashes.
*   **Parallax & Depth Zoom**: Moving the mouse tilts the camera rotation vector, while scrolling the page flies the camera deeper through the Z-axis of the particle cloud.
*   **sin/cos Wave Torus Knot**: A floating wireframe torus knot core rotates and morphs its vertices dynamically based on time-based sinusoidal waves.

### 2. Fully Interactive Command Terminal
The Diagnostics panel in the Hero section is a **fully functional, interactive command line prompt**. Type commands to trigger custom protocols:
*   `help` - Lists all available diagnostics commands.
*   `skills` - Runs a simulated look-up showing Kushal's languages and frameworks.
*   `projects` - Queries development logs of all key projects (SUNDAY AI, Modi Mario, Chaos Ball, Aqua AI, QR System).
*   `theme [cyan|green|purple|pink]` - Remaps the accent color of the website and recolors the Three.js WebGL canvas instantly.
*   `hack` - Initiates a mock cybersecurity bypass sequence with alarms, screen glitches, and flashing hex code readouts.
*   `beat` - Plays a custom synthesized cyberpunk drum machine loop and pitch-bend drop (Web Audio synthesis).
*   `matrix` - Streams falling green digital rain down the console screen with rapid keystroke clicks.
*   `glitch` - Disrupts the deck temporarily with full-screen distortion, alarm sounds, and resets the theme colors.
*   `system` - Queries hardware specs (CPU, memory, graphics engine).
*   `skuba` - Summons the bubbles scuba cat video from the local `memes/` folder (playing video audio) with real-time green screen removal for 5s.
*   `oiia` - Summons the spinning cat video from the local `memes/` folder (playing video audio) with real-time green screen removal. Loops indefinitely until stopped by typing `oiia stop`. Plays synchronized page-pulsing beat animations while active.
*   `clear` - Wipes the terminal logs buffer.

### 3. Programmatic Web Audio Synthesizer (Zero Assets)
Generates retro-futuristic sound effects programmatically using the browser's built-in **Web Audio API**:
*   **Keystroke Ticks**: Typing in the prompt plays sharp, microscopic frequency ticks.
*   **Hover Plucks**: Hovering over links, bento tiles, or cards plays loud, clean, high-frequency plucks.
*   **Alarms & Alerts**: Hacks and glitches play repetitive sawtooth alarm sweeps.
*   **Synthesized Beat & Drop**: The `beat` command plays a 16-step rhythmic sequence consisting of bass drum kicks, bandpass-filtered noise snares, lead plucks, and a pitch-bend sub-bass drop.

### 4. HUD Navigation Controls
The navbar features dual-mode cyberdeck control toggle switches:
*   **SOUND button**: Toggle audio feedback ON/OFF (defaults to OFF).
*   **AUTO_LOG toggle switch**: A sleek, sliding switch to pause/resume the background diagnostic log stream in the terminal.

---

## 🛠️ Technology Stack
1.  **3D Graphics**: Three.js WebGL Core (served fully locally).
2.  **Sound Generation**: HTML5 Web Audio API (oscillators, filters, audio buffers).
3.  **Styling**: Vanilla CSS3 (cyber HUD, grid overlays, glassmorphic bento blocks).
4.  **Logic**: HTML5, Vanilla JavaScript ES6.

---

## 📂 Project Structure
```
PTT/
├── index.html          # Main landing portfolio cyberdeck console
├── style.css           # Core styling sheets, animations, glassmorphism
├── script.js          # Interactive prompt parser, Web Audio synthesizer
├── three-bg.js         # Three.js 3D backdrop engine & resize handlers
├── three.min.js        # Local Three.js library copy (100% offline support)
├── AQUA_AI.png         # Aqua AI screenshot asset
├── sunday_ai_screenshot.png # Sunday AI screenshot asset
├── chaos_ball_screenshot.png # Chaos Ball screenshot asset
├── qr_system_screenshot.png # QR entry system screenshot asset
├── modi.png            # Modi Mario sprite screenshot asset
└── projects/           # Subcategory project folders
    ├── index.html      # Projects main index page
    ├── python.html     # Python category page
    ├── web.html        # Web category page
    ├── java.html       # Java category page
    ├── c.html          # C category page
    └── unity.html      # Unity category page
```

---

## 💻 Running Locally
The portfolio runs 100% offline.
1.  **File System**: Double-click `index.html` to open it directly (`file://` protocol).
2.  **Dev Server**: Run a lightweight local server:
    ```bash
    python -m http.server 8000
    ```
    Then open **[http://localhost:8000](http://localhost:8000)** in your browser.
