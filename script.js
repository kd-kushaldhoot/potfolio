/**
 * Kushal Dhoot Portfolio - Cyberdeck Interactions & HUD Core
 * Controls interactive commands, sound synthesis, theme toggles, and scroll-morph hooks.
 */

// --- 1. HUD AUDIO SYSTEM (Web Audio API Synthesizer) ---
let audioContext = null;
let audioEnabled = false;

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playSynthSound(freqStart, freqEnd, duration, volume = 0.05, type = 'sine') {
  if (!audioEnabled) return;
  initAudio();
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, audioContext.currentTime);
  if (freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, audioContext.currentTime + duration);
  }

  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

function playHover() {
  playSynthSound(900, 1500, 0.06, 0.09, 'sine');
}

function playClick() {
  playSynthSound(700, 180, 0.12, 0.16, 'triangle');
}

function playTypeTick() {
  playSynthSound(1600, 1200, 0.03, 0.05, 'sine');
}

function playWarningAlarm() {
  playSynthSound(350, 480, 0.28, 0.14, 'sawtooth');
}

function playSuccessBeep() {
  initAudio();
  if (!audioEnabled) return;
  
  // Double high beep
  playSynthSound(950, 950, 0.08, 0.12, 'sine');
  setTimeout(() => {
    playSynthSound(1350, 1350, 0.12, 0.12, 'sine');
  }, 100);
}

// Audio Toggle Button Event
const audioToggle = document.getElementById('audio-toggle');
if (audioToggle) {
  audioToggle.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    if (audioEnabled) {
      audioToggle.classList.add('active');
      audioToggle.textContent = '// SOUND: ON';
      initAudio();
      playClick();
    } else {
      audioToggle.classList.remove('active');
      audioToggle.textContent = '// SOUND: OFF';
    }
  });
}

// Auto Logs Toggle Event
const logToggle = document.getElementById('log-toggle');
window.autoLogsEnabled = window.innerWidth > 900;
if (logToggle) {
  const termPanel = document.querySelector('.hero-terminal');
  
  logToggle.addEventListener('change', () => {
    window.autoLogsEnabled = logToggle.checked;
    if (window.autoLogsEnabled) {
      if (termPanel) termPanel.classList.remove('hidden-log');
      printLog("FUN MODE ACTIVE: DIAGNOSTICS STREAM START", null, 'var(--green)');
      playSuccessBeep();
    } else {
      printLog("FUN MODE SILENT: DIAGNOSTICS STREAM PAUSED", null, 'var(--pink)');
      playWarningAlarm();
      setTimeout(() => {
        if (termPanel) termPanel.classList.add('hidden-log');
      }, 500);
    }
  });
}

// --- 2. CURSOR FOLLOW SYSTEM ---
const cur = document.getElementById('cursor');
const crr = document.getElementById('cr');
let mx = 0, my = 0, rx = 0, ry = 0;

if (cur && crr) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top = my + 'px';
  });

  (function anim() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    crr.style.left = rx + 'px';
    crr.style.top = ry + 'px';
    requestAnimationFrame(anim);
  })();

  const interactives = document.querySelectorAll('a, button, .skill-tile, .project-card, .social-card, .contact-item, .category-card');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cur.style.width = '6px';
      cur.style.height = '6px';
      crr.style.width = '48px';
      crr.style.height = '48px';
      crr.style.borderColor = 'var(--cyan)';
      crr.style.boxShadow = 'var(--glow)';
      playHover();
    });
    
    el.addEventListener('mouseleave', () => {
      cur.style.width = '10px';
      cur.style.height = '10px';
      crr.style.width = '30px';
      crr.style.height = '30px';
      crr.style.borderColor = 'rgba(0, 245, 255, 0.5)';
      crr.style.boxShadow = 'none';
    });
    
    el.addEventListener('click', () => {
      playClick();
    });
  });
}

// --- 3. HAMBURGER MOBILE MENU ---
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}

// --- 4. TYPEWRITER EFFECT (Hero Content) ---
const phrases = [
  "Hey, this is Kushal Dhoot :)",
  "Welcome to my Cyberdeck Console!",
  "Python · Java · C# · Unity · Game Dev · AR/VR",
  "CSE Student specializing in AI/ML"
];
let pi = 0, ci = 0, del = false;
const tw = document.getElementById('typewriter');
if (tw) {
  function type() {
    const p = phrases[pi];
    if (!del) {
      tw.textContent = p.slice(0, ++ci);
      if (ci === p.length) {
        del = true;
        setTimeout(type, 2200);
        return;
      }
      setTimeout(type, 50);
    } else {
      tw.textContent = p.slice(0, --ci);
      if (ci === 0) {
        del = false;
        pi = (pi + 1) % phrases.length;
        setTimeout(type, 400);
        return;
      }
      setTimeout(type, 20);
    }
  }
  type();
}

// --- 5. SCROLL SECTIONS TRIGGER (Three.js Shapes Morphing) ---
const sectionIds = ['hero', 'about', 'skills', 'projects', 'contact'];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = sectionIds.indexOf(entry.target.id);
      if (idx !== -1 && window.cyberdeckBackdrop) {
        window.cyberdeckBackdrop.updateActiveShape(idx);
      }
    }
  });
}, { threshold: 0.25, rootMargin: '0px' });

sectionIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

// --- 7. INTERACTIVE TERMINAL ENGINE ---
const termInput = document.getElementById('term-input');
const termLogs = document.getElementById('term-logs');

if (termInput && termLogs) {
  // Clear logs completely on mobile/tablets
  if (window.innerWidth <= 900) {
    termLogs.innerHTML = '';
  }

  // Focus terminal input on box click
  termLogs.parentElement.addEventListener('click', () => {
    if (window.innerWidth > 900) {
      termInput.focus();
    }
  });

  // Play keyboard sounds as user types
  termInput.addEventListener('input', () => {
    if (window.innerWidth > 900) {
      playTypeTick();
    }
  });

  termInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const rawText = termInput.value.trim();
      termInput.value = '';
      if (rawText.length === 0) return;

      if (window.innerWidth > 900) {
        processCommand(rawText);
      }
    }
  });

  // Auto scrolling diagnostics stream in background
  const autoLogs = [
    "SYNCING LOCAL DECK CACHE TO GITHUB...",
    "ESTABLISHING SECURE PIPELINE TO PORTFOLIO SERVER...",
    "AI COGNITIVE LAYER NOMINAL [OK]",
    "GAME PHYSICS ENGINE STANDBY (CHAOS BALL)",
    "DUMPING LOCAL CACHE SCRIPTS...",
    "MONITORING TRAFFIC LATENCY CORE..."
  ];
  let autoLogIndex = 0;
  
  setInterval(() => {
    // Only stream auto logs if enabled, not on mobile, and not actively executing a hacking simulation
    if (window.innerWidth <= 900 || !window.autoLogsEnabled || window.isHackingModeActive) return;

    const timeStr = new Date().toTimeString().split(' ')[0];
    const logText = autoLogs[autoLogIndex];
    autoLogIndex = (autoLogIndex + 1) % autoLogs.length;

    printLog(logText, timeStr);
  }, 9000);
}

function printLog(text, timeStr, color = '') {
  if (!termLogs || window.innerWidth <= 900) return;
  const row = document.createElement('div');
  row.className = 'term-row';
  if (color) row.style.color = color;
  
  const actualTime = timeStr || new Date().toTimeString().split(' ')[0];
  row.innerHTML = `<span class="term-time">[${actualTime}]</span> ${text}`;
  
  termLogs.appendChild(row);
  termLogs.scrollTop = termLogs.scrollHeight;

  // Cleanup history to keep it fast
  if (termLogs.children.length > 40) {
    termLogs.removeChild(termLogs.firstChild);
  }
}

// Command execution parser
function processCommand(rawInput) {
  const parts = rawInput.toLowerCase().split(' ');
  const cmd = parts[0];
  const args = parts.slice(1);

  // Echo user input
  printLog(`guest@dhoot-deck:~$ ${rawInput}`, null, 'var(--dim)');
  playClick();

  switch (cmd) {
    case 'help':
      printLog('Available terminal commands:', null, 'var(--cyan)');
      printLog('  help       - show this diagnostic menu');
      printLog('  skills     - query technical skills list');
      printLog('  projects   - query active project releases');
      printLog('  theme [c]  - change color themes (cyan, green, purple, pink)');
      printLog('  hack       - initiate cybersecurity bypass sequence');
      printLog('  beat       - play custom cyberpunk synth beat & drop');
      printLog('  matrix     - stream animated binary falling digital rain');
      printLog('  glitch     - disrupt deck and force recolor theme glitch');
      printLog('  system     - query deck hardware diagnostics');
      printLog('  skuba      - summon bubbles scuba cat for 5 seconds');
      printLog('  oiia       - summon spinning cat with synthesized vocal song');
      printLog('  oiia stop  - terminate active spinning cat meme sequence');
      printLog('  clear      - wipe terminal logs buffer');
      break;

    case 'clear':
      termLogs.innerHTML = `<div class="term-row">// BUFFER PURGED. READY FOR NEW COMMANDS.</div>`;
      break;

    case 'skills':
      printLog('>>> RETRIEVING SKILLS DATAREADS...', null, 'var(--green)');
      printLog(' - Languages: Python, Java, C#, C, JavaScript, SQL, HTML/CSS');
      printLog(' - Focus Areas: AI/ML Algorithms, Game Development, AR/VR');
      printLog(' - Tools/Tech: Unity Engine, Gemini API, Pygame, Git, Linux, SQL');
      break;

    case 'projects':
      printLog('>>> RETRIEVING PROJECT RELEASES...', null, 'var(--green)');
      printLog(' - SUNDAY AI: voice PC assistant & automation [ACTIVE DEV]');
      printLog(' - Modi Mario: platformer platformer (Unity/C#) [STABLE]');
      printLog(' - Chaos Ball: 20-levels custom platformer (Pygame) [STABLE]');
      printLog(' - Aqua AI: sleek frontend UI tool [STABLE]');
      printLog(' - QR Security System: access control desktop App (Java) [STABLE]');
      break;

    case 'theme':
      const choice = args[0];
      const validThemes = ['cyan', 'green', 'purple', 'pink'];
      if (!choice || !validThemes.includes(choice)) {
        printLog("Error: Invalid theme choice. Type 'theme green', 'theme pink', 'theme purple', or 'theme cyan'", null, '#ff5f56');
      } else {
        changeGlobalTheme(choice);
        printLog(`Theme switched successfully to: [${choice.toUpperCase()}]`, null, 'var(--green)');
      }
      break;

    case 'hack':
      initiateHackSequence();
      break;

    case 'beat':
      playBeatSequence();
      break;

    case 'matrix':
      playMatrixRain();
      break;

    case 'glitch':
      triggerGlitchCommand();
      break;

    case 'system':
      showSystemSpecs();
      break;

    case 'skuba':
      playChromakeyMeme('memes/skuba.mp4', 5000, 1.0, false);
      break;

    case 'oiia':
      if (args[0] === 'stop') {
        stopChromakeyMeme();
      } else {
        playChromakeyMeme('memes/oiia.mp4', 0, 1.0, true);
      }
      break;

    default:
      printLog(`Command not found: '${cmd}'. Type 'help' to see active protocols.`, null, '#ff5f56');
      break;
  }
}

// --- 8. THEME SWITCHER UTILITY ---
function changeGlobalTheme(themeName) {
  const root = document.documentElement;
  
  const themes = {
    cyan: {
      color: '#00f5ff',
      border: 'rgba(0, 245, 255, 0.12)',
      glow: '0 0 20px rgba(0, 245, 255, 0.3)'
    },
    green: {
      color: '#00ff88',
      border: 'rgba(0, 255, 136, 0.12)',
      glow: '0 0 20px rgba(0, 255, 136, 0.3)'
    },
    purple: {
      color: '#7b2fff',
      border: 'rgba(123, 47, 255, 0.12)',
      glow: '0 0 20px rgba(123, 47, 255, 0.3)'
    },
    pink: {
      color: '#ff2d78',
      border: 'rgba(255, 45, 120, 0.12)',
      glow: '0 0 20px rgba(255, 45, 120, 0.3)'
    }
  };

  const selected = themes[themeName] || themes.cyan;

  // Set CSS Variables on root
  root.style.setProperty('--cyan', selected.color);
  root.style.setProperty('--border', selected.border);
  root.style.setProperty('--glow', selected.glow);

  // Sync to Three.js canvas backdrop
  if (window.cyberdeckBackdrop) {
    window.cyberdeckBackdrop.updateTheme(themeName);
  }
  
  playSuccessBeep();
}

// --- 9. MOCK CYBERSECURITY BYPASS (HACK SEQUENCE) ---
window.isHackingModeActive = false;

function initiateHackSequence() {
  if (window.isHackingModeActive) return;
  window.isHackingModeActive = true;
  
  // Disable console input temporarily
  termInput.disabled = true;
  
  // Shake and distort page
  document.body.classList.add('glitch-active');
  
  printLog("CRITICAL: SECURITY BREACH DETECTED!", null, '#ff5f56');
  printLog("BYPASSING SECURITY FIREWALL NODES...", null, '#ffbd2e');
  
  let loopCount = 0;
  const maxLoops = 25;
  
  // Repeated alarms sound
  const alarmInterval = setInterval(() => {
    playWarningAlarm();
  }, 200);

  // Hex streams printer
  const hexInterval = setInterval(() => {
    const randomHex = Array.from({ length: 6 }, () => 
      Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')
    ).join(' : ');
    
    printLog(`BYPASSING CORE_ADDR: [0x${randomHex}]`, null, '#ff5f56');
    loopCount++;

    if (loopCount >= maxLoops) {
      clearInterval(hexInterval);
      clearInterval(alarmInterval);

      // Clean up shakes
      document.body.classList.remove('glitch-active');

      // Success readout
      printLog("[ACCESS GRANTED] SECURITY INTERCEPT SECURED.", null, 'var(--green)');
      printLog("WELCOME AGENT: KUSHAL DHOOT // DECK STATUS NORMAL.", null, 'var(--cyan)');
      
      playSuccessBeep();

      // Re-enable console
      termInput.disabled = false;
      termInput.focus();
      window.isHackingModeActive = false;
    }
  }, 100);
}

// --- 10. SCROLL REVEAL BINDINGS & FALLBACK ---
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Fallback: If inside iframe previews or if IntersectionObserver fails to trigger, force reveal after a brief delay
setTimeout(() => {
  document.querySelectorAll('.reveal').forEach(el => {
    if (!el.classList.contains('visible')) {
      el.classList.add('visible');
    }
  });
}, 800);

// --- 11. CYBERDECK SYNTHESIZER BEAT & DROP SEQUENCE ---
function playBeatSequence() {
  initAudio();
  if (!audioEnabled) {
    printLog("Error: Sound is currently OFF. Click '// SOUND: OFF' at the top to enable deck acoustics.", null, '#ff5f56');
    return;
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  printLog(">>> INITIATING CYBERDECK ACOUSTIC BEAT & DROP...", null, 'var(--green)');
  const now = audioContext.currentTime;
  const tempo = 130; // BPM
  const quarterNote = 60 / tempo;
  const eighthNote = quarterNote / 2;

  // Sync-to-audio visual timers
  const triggerKickVisual = () => {
    document.body.classList.add('kick-pulse');
    setTimeout(() => {
      document.body.classList.remove('kick-pulse');
    }, 120);
  };
  
  const triggerSnareVisual = () => {
    const targets = document.querySelectorAll('.skill-tile, .sec-header, .term-header');
    targets.forEach(el => {
      el.classList.add('snare-pulse');
      setTimeout(() => {
        el.classList.remove('snare-pulse');
      }, 140);
    });
  };
  
  const triggerDropVisual = () => {
    document.body.classList.add('drop-pulse');
    setTimeout(() => {
      document.body.classList.remove('drop-pulse');
    }, 1250);
  };
  
  const playKick = (time) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.16);
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
    osc.start(time);
    osc.stop(time + 0.16);
  };
  
  const playPluck = (time, freq, type = 'sawtooth') => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = type;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq / 2, time + 0.22);
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    osc.start(time);
    osc.stop(time + 0.22);
  };
  
  const playSnare = (time) => {
    try {
      const bufferSize = audioContext.sampleRate * 0.18;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;
      
      const filter = audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      
      const gain = audioContext.createGain();
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      
      gain.gain.setValueAtTime(0.14, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
      
      noise.start(time);
      noise.stop(time + 0.18);
    } catch(e) {
      playSynthSound(800, 200, 0.15, 0.1, 'triangle');
    }
  };
  
  const playDrop = (time) => {
    const osc = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sawtooth';
    osc2.type = 'sine';
    
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 1.2);
    
    osc2.frequency.setValueAtTime(400, time);
    osc2.frequency.exponentialRampToValueAtTime(50, time + 1.2);
    
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
    
    osc.start(time);
    osc2.start(time);
    osc.stop(time + 1.25);
    osc2.stop(time + 1.25);
  };

  // Schedule beats (16 eighth-note steps)
  for (let step = 0; step < 16; step++) {
    const time = now + step * eighthNote;
    const delayMs = step * eighthNote * 1000;
    
    // Kick drum beats + physical screen pulse
    if (step === 0 || step === 4 || step === 8 || step === 10 || step === 12) {
      playKick(time);
      setTimeout(triggerKickVisual, delayMs);
    }
    
    // Snare white noise drums + bento box glow flash
    if (step === 4 || step === 12 || step === 14) {
      playSnare(time);
      setTimeout(triggerSnareVisual, delayMs);
    }
    
    // Bass & Lead plucks
    if (step === 0) playPluck(time, 196, 'sawtooth'); // G
    if (step === 2) playPluck(time, 220, 'sawtooth'); // A
    if (step === 4) playPluck(time, 293, 'sawtooth'); // D
    if (step === 6) playPluck(time, 329, 'sawtooth'); // E
    if (step === 8) playPluck(time, 440, 'triangle'); // High A
    if (step === 9) playPluck(time, 392, 'sine');     // High G
    
    // Huge synthesizer drop bend at beat 12 + full-screen color sweep
    if (step === 12) {
      playDrop(time);
      setTimeout(triggerDropVisual, delayMs);
    }
  }

  // Visual cues in log matching beat intervals
  setTimeout(() => printLog("  [BEAT] KICK START: 130 BPM [BASSLINE ACTIVE]", null, 'var(--cyan)'), 0);
  setTimeout(() => printLog("  [BEAT] SNARE ENTERED: DECK SYNTH RESONANCE", null, 'var(--yellow)'), quarterNote * 1000);
  setTimeout(() => printLog("  [DROP] PITCH BENDBACK SWOOP: SUB-BASS DISCHARGE", null, 'var(--pink)'), quarterNote * 3000);
}

// --- 12. MATRIX falling digital rain ---
let matrixInterval = null;

function playMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) {
    printLog("Error: Matrix Canvas target not found.", null, '#ff5f56');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  printLog(">>> DEPLOYING FULL-SCREEN MATRIX COGNITIVE OVERLAY...", null, 'var(--green)');
  playWarningAlarm();

  // Show the canvas background overlay
  canvas.style.opacity = '0.35';

  // Adjust size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const fontSize = 16;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$@#%+*&¥?".split("");

  if (matrixInterval) clearInterval(matrixInterval);

  matrixInterval = setInterval(() => {
    ctx.fillStyle = 'rgba(2, 4, 8, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff88';
    ctx.font = `${fontSize}px "Share Tech Mono", monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillText(text, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }, 33);

  // Stop and fade out after 12 seconds
  setTimeout(() => {
    canvas.style.opacity = '0';
    setTimeout(() => {
      clearInterval(matrixInterval);
      matrixInterval = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      printLog(">>> MATRIX DECODER DEACTIVATED.", null, 'var(--cyan)');
      playSuccessBeep();
    }, 1000);
  }, 11000);
}

// --- 13. SCREEN GLITCH AND DISRUPTION ---
function triggerGlitchCommand() {
  printLog("WARNING: SCHEDULING FULL-DECK DISRUPTION...", null, '#ff5f56');
  document.body.classList.add('glitch-active');
  playWarningAlarm();
  
  setTimeout(() => {
    const themes = ['cyan', 'green', 'purple', 'pink'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    changeGlobalTheme(randomTheme);
    document.body.classList.remove('glitch-active');
    printLog(`DECK STABILIZED. RADIAL COLORS RE-MAPPED TO: [${randomTheme.toUpperCase()}]`, null, 'var(--green)');
    playSuccessBeep();
  }, 1300);
}
// --- 14. HARDWARE SPEC LOGS ---
function showSystemSpecs() {
  printLog("=== DECK SPECIFICATIONS & ACCESS NODES ===", null, 'var(--cyan)');
  setTimeout(() => {
    printLog("  HOST STATION: guest@dhoot-deck-v2.6", null, 'var(--text)');
    playTypeTick();
  }, 100);
  setTimeout(() => {
    printLog("  COGNITIVE ENGINE: Google Gemini API (Active Node)", null, 'var(--text)');
    playTypeTick();
  }, 220);
  setTimeout(() => {
    printLog("  GRAPHICS RENDERER: Local WebGL Three.js Backdrop", null, 'var(--text)');
    playTypeTick();
  }, 340);
  setTimeout(() => {
    printLog("  ACTIVE DECK TERMINAL PROTOCOLS: [HELP, CLS, SKILLS, PROJECTS, THEME, HACK, BEAT, MATRIX, GLITCH, SYSTEM, SKUBA, OIIA]", null, 'var(--green)');
    playSuccessBeep();
  }, 500);
}

// --- 15. CHROMAKEY GREEN SCREEN VIDEO MEME PLAYER ---
let chromakeyActive = false;
let beatIntervalTimer = null;
let currentMemeStep = 0;

function playChromakeyMeme(videoSrc, durationMs, scale = 1.0, isOiia = false) {
  const memeVideo = document.getElementById('meme-video');
  const memeCanvas = document.getElementById('meme-canvas');
  if (!memeVideo || !memeCanvas) {
    printLog("Error: Meme player DOM elements missing.", null, '#ff5f56');
    return;
  }

  const memeCtx = memeCanvas.getContext('2d');
  if (!memeCtx) return;

  // Set video source
  memeVideo.src = videoSrc;
  memeVideo.load();
  memeVideo.currentTime = 0;
  
  // Try to play with audio enabled (requires interaction, which entering commands counts as)
  memeVideo.muted = false;
  memeVideo.volume = 0.65;
  
  const startPlayback = () => {
    chromakeyActive = true;
    memeCanvas.style.display = 'block';
    
    const onFrame = () => {
      if (!chromakeyActive) return;
      
      // Auto-size canvas with a performance-optimized clamp (max 320px width) to prevent CPU pixel lag
      if (memeVideo.videoWidth > 0 && memeCanvas.width !== Math.min(memeVideo.videoWidth * scale, 320)) {
        const targetWidth = Math.min(memeVideo.videoWidth * scale, 320);
        const ratio = targetWidth / (memeVideo.videoWidth * scale);
        memeCanvas.width = targetWidth;
        memeCanvas.height = (memeVideo.videoHeight * scale) * ratio;
      }
      
      if (memeCanvas.width > 0) {
        // Draw video frame to canvas
        memeCtx.drawImage(memeVideo, 0, 0, memeCanvas.width, memeCanvas.height);
        
        // Fetch pixel data
        const frame = memeCtx.getImageData(0, 0, memeCanvas.width, memeCanvas.height);
        const l = frame.data.length / 4;
        
        for (let i = 0; i < l; i++) {
          const r = frame.data[i * 4 + 0];
          const g = frame.data[i * 4 + 1];
          const b = frame.data[i * 4 + 2];
          
          // Green screen chromakey filter threshold:
          // Detect pixels where green is dominant and bright
          if (g > 85 && g > r * 1.3 && g > b * 1.3) {
            frame.data[i * 4 + 3] = 0; // Set alpha to 0 (fully transparent)
          }
        }
        
        // Output filtered pixels back to canvas
        memeCtx.putImageData(frame, 0, 0);
      }
      
      requestAnimationFrame(onFrame);
    };
    
    requestAnimationFrame(onFrame);
    
    if (isOiia) {
      printLog(">>> PLAYING SPINNING CAT MEME [OIIA]...", null, 'var(--green)');
      printLog("// TYPE 'oiia stop' TO TERMINATE SEQUENCE", null, 'var(--yellow)');
      startContinuousBeatVisuals();
    } else {
      printLog(">>> SUMMONING BUBBLES SCUBA CAT...", null, 'var(--green)');
    }
  };

  memeVideo.play().then(startPlayback).catch(err => {
    console.warn("Unmuted playback blocked, falling back to muted", err);
    memeVideo.muted = true;
    memeVideo.play().then(() => {
      startPlayback();
      printLog("Audio permission required. Click on webpage and re-type command for sound.", null, '#ffbd2e');
    }).catch(e => {
      printLog(`Error: Could not load '${videoSrc}'.`, null, '#ff5f56');
      printLog(`Please place the video files inside the 'memes/' folder to run them locally!`, null, 'var(--dim)');
    });
  });

  // If a duration is specified (like 5s for skuba), auto stop after that time
  if (durationMs > 0) {
    setTimeout(() => {
      stopChromakeyMeme();
    }, durationMs);
  }
}

function stopChromakeyMeme() {
  const memeVideo = document.getElementById('meme-video');
  const memeCanvas = document.getElementById('meme-canvas');
  
  chromakeyActive = false;
  
  if (memeVideo) {
    memeVideo.pause();
    memeVideo.currentTime = 0;
  }
  
  if (memeCanvas) {
    memeCanvas.style.display = 'none';
    const ctx = memeCanvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);
  }
  
  stopContinuousBeatVisuals();
  printLog(">>> MEME SEQUENCE DEACTIVATED.", null, 'var(--cyan)');
}

// --- 16. CONTINUOUS SYNCHRONIZED BEAT VISUALS ---
function startContinuousBeatVisuals() {
  stopContinuousBeatVisuals();
  
  const bpm = 130;
  const quarterNote = 60 / bpm;
  const eighthNote = quarterNote / 2;
  const stepTimeMs = eighthNote * 1000; // ~230ms per step
  
  currentMemeStep = 0;
  
  const triggerKickVisual = () => {
    document.body.classList.add('kick-pulse');
    setTimeout(() => {
      document.body.classList.remove('kick-pulse');
    }, 120);
  };
  
  const triggerSnareVisual = () => {
    const targets = document.querySelectorAll('.skill-tile, .sec-header, .term-header');
    targets.forEach(el => {
      el.classList.add('snare-pulse');
      setTimeout(() => {
        el.classList.remove('snare-pulse');
      }, 140);
    });
  };
  
  const triggerDropVisual = () => {
    document.body.classList.add('drop-pulse');
    setTimeout(() => {
      document.body.classList.remove('drop-pulse');
    }, 1250);
  };

  beatIntervalTimer = setInterval(() => {
    const step = currentMemeStep % 16;
    
    // Kick drum beats
    if (step === 0 || step === 4 || step === 8 || step === 10 || step === 12) {
      triggerKickVisual();
    }
    
    // Snare beats
    if (step === 4 || step === 12 || step === 14) {
      triggerSnareVisual();
    }
    
    // Drop bend
    if (step === 12) {
      triggerDropVisual();
    }
    
    currentMemeStep++;
  }, stepTimeMs);
}

function stopContinuousBeatVisuals() {
  if (beatIntervalTimer) {
    clearInterval(beatIntervalTimer);
    beatIntervalTimer = null;
  }
  
  // Remove classes from all targets
  document.body.classList.remove('kick-pulse', 'drop-pulse');
  document.querySelectorAll('.skill-tile, .sec-header, .term-header').forEach(el => {
    el.classList.remove('snare-pulse');
  });
}
