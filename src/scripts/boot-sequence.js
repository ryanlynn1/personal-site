/**
 * BootSequence - Multi-stage boot animation
 * Stage 1: BIOS POST text
 * Stage 2: Loading bar with RyanOS logo
 * Stage 3: Dial-up modem connection
 * Stage 4: Fade to desktop
 */
class BootSequence {
  constructor() {
    this.element = document.getElementById('boot');
    this.skipButton = this.element?.querySelector('.boot-skip');
    this.isSkipping = false;
    this.prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (this.element) {
      this.init();
    }
  }

  init() {
    // Check if already seen this session
    if (sessionStorage.getItem('boot-seen')) {
      this.dismiss(true);
      return;
    }

    // Reduced motion: instant dismiss
    if (this.prefersReducedMotion) {
      this.dismiss(true);
      return;
    }

    // Skip button
    this.skipButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.skip();
    });

    // Click anywhere to skip
    this.element.addEventListener('click', () => {
      this.skip();
    });

    // Keyboard skip
    const handleKeySkip = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        this.skip();
        document.removeEventListener('keydown', handleKeySkip);
      }
    };
    document.addEventListener('keydown', handleKeySkip);

    // Run the boot sequence
    this.run();
  }

  skip() {
    this.isSkipping = true;
    this.dismiss();
  }

  async run() {
    try {
      await this.runBios();
      if (this.isSkipping) return;

      await this.runLoading();
      if (this.isSkipping) return;

      await this.runDialup();
      if (this.isSkipping) return;

      await this.runHello();
      if (this.isSkipping) return;

      this.dismiss();
    } catch {
      // If anything fails, just dismiss
      this.dismiss();
    }
  }

  async runBios() {
    const stage = document.getElementById('boot-bios');
    const textEl = document.getElementById('bios-text');
    if (!stage || !textEl) return;

    stage.classList.add('boot-stage--active');

    const lines = [
      'RyanOS BIOS v1.0',
      'Copyright (C) 2024-2026 Ryan Lynn Industries',
      '',
      'Performing system check...',
      '',
      'CPU: Creative Cortex @ 3.2 GHz',
      'Memory Test: 640K OK',
      'Extended Memory: 256MB OK',
      '',
      'Detecting IDE drives...',
      '  Primary Master:   Ideas SSD 256GB',
      '  Primary Slave:    Projects HDD 1TB',
      '  Secondary Master: Experience SATA 500GB',
      '',
      'Keyboard............OK',
      'Mouse...............OK',
      'Network.............Detected',
      '',
      'Press DEL to enter SETUP, or any key to skip',
      '',
      'Booting from C:\\RYANOS\\...',
    ];

    for (const line of lines) {
      if (this.isSkipping) return;
      textEl.textContent += line + '\n';
      textEl.scrollTop = textEl.scrollHeight;
      await this.wait(60);
    }

    await this.wait(300);
    stage.classList.remove('boot-stage--active');
  }

  async runLoading() {
    const stage = document.getElementById('boot-loading');
    const bar = document.getElementById('loading-bar');
    const text = document.getElementById('loading-text');
    const ascii = document.getElementById('loading-ascii');
    if (!stage || !bar || !text) return;

    // Inject ASCII logo via JS to avoid Astro template parsing issues
    if (ascii) {
      ascii.textContent = [
        ' ____                    ___  ____  ',
        '|  _ \\ _   _  __ _ _ __ / _ \\/ ___| ',
        '| |_) | | | |/ _` | \'_ \\ | | \\___ \\ ',
        '|  _ <| |_| | (_| | | | | |_| |___) |',
        '|_| \\_\\\\__, |\\__,_|_| |_|\\___/|____/ ',
        '       |___/           v1.0',
      ].join('\n');
    }

    stage.classList.add('boot-stage--active');

    const steps = [
      { progress: 15, label: 'Loading system files...' },
      { progress: 30, label: 'Initializing window manager...' },
      { progress: 45, label: 'Loading desktop icons...' },
      { progress: 60, label: 'Configuring network adapter...' },
      { progress: 75, label: 'Starting services...' },
      { progress: 90, label: 'Preparing desktop environment...' },
      { progress: 100, label: 'Ready.' },
    ];

    for (const step of steps) {
      if (this.isSkipping) return;
      bar.style.width = step.progress + '%';
      text.textContent = step.label;
      await this.wait(250);
    }

    await this.wait(300);
    stage.classList.remove('boot-stage--active');
  }

  async runDialup() {
    const stage = document.getElementById('boot-dialup');
    const textEl = document.getElementById('dialup-text');
    const signal = document.getElementById('dialup-signal');
    if (!stage || !textEl) return;

    stage.classList.add('boot-stage--active');

    const lines = [
      { text: '╔══════════════════════════════════════╗', delay: 30 },
      { text: '║     RyanOS Internet Connection       ║', delay: 30 },
      { text: '╚══════════════════════════════════════╝', delay: 30 },
      { text: '', delay: 100 },
      { text: 'Initializing modem...', delay: 200 },
      { text: 'Modem: US Robotics 56K Faxmodem', delay: 150 },
      { text: '', delay: 100 },
      { text: 'ATZ', delay: 300 },
      { text: 'OK', delay: 200 },
      { text: '', delay: 50 },
      { text: 'ATDT ryanlynn.ai', delay: 400 },
      { text: '', delay: 100 },
      { text: '~~ DIALING ~~', delay: 300, class: 'dialup-dialing' },
      { text: '', delay: 100 },
      { text: 'bzzz krrrrr shhhhhhh', delay: 200, class: 'dialup-noise' },
      { text: 'EEEEE-URRRRR-EEEE-KKKKKK', delay: 300, class: 'dialup-noise' },
      { text: 'dzzzzzt brrrrr shhhh', delay: 250, class: 'dialup-noise' },
      { text: '', delay: 100 },
      { text: 'CONNECT 56000', delay: 200, class: 'dialup-connect' },
      { text: '', delay: 100 },
      { text: 'Authenticating...', delay: 400 },
      { text: 'Username: ryan', delay: 200 },
      { text: 'Password: ********', delay: 200 },
      { text: '', delay: 200 },
      { text: '✓ CONNECTED to ryanlynn.ai', delay: 100, class: 'dialup-success' },
      { text: '', delay: 50 },
      { text: 'Welcome, Ryan. Loading desktop...', delay: 300, class: 'dialup-success' },
    ];

    for (let i = 0; i < lines.length; i++) {
      if (this.isSkipping) return;
      const line = lines[i];

      const span = document.createElement('span');
      if (line.class) span.className = line.class;
      span.textContent = line.text + '\n';
      textEl.appendChild(span);
      textEl.scrollTop = textEl.scrollHeight;

      // Activate signal bars progressively during connection
      if (signal && i >= 18) {
        const barIndex = Math.min(i - 18, 4);
        const bars = signal.querySelectorAll('.signal-bar');
        if (bars[barIndex]) bars[barIndex].classList.add('signal-bar--active');
      }

      await this.wait(line.delay);
    }

    await this.wait(500);
    stage.classList.remove('boot-stage--active');
  }

  async runHello() {
    const stage = document.getElementById('boot-hello');
    if (!stage) return;

    // Transition boot background from dark to warm cream
    this.element.classList.add('boot--hello-active');

    // Brief pause for background transition to start
    await this.wait(400);
    if (this.isSkipping) return;

    stage.classList.add('boot-stage--active');

    // Hold the hello screen
    await this.wait(1500);
    if (this.isSkipping) return;

    stage.classList.remove('boot-stage--active');
  }

  wait(ms) {
    return new Promise((resolve) => {
      if (this.isSkipping) {
        resolve();
        return;
      }
      setTimeout(resolve, ms);
    });
  }

  dismiss(instant = false) {
    if (!this.element) return;

    // Mark as seen
    sessionStorage.setItem('boot-seen', 'true');

    if (instant || this.prefersReducedMotion) {
      this.element.remove();
      this.enableDesktop();
    } else {
      this.element.classList.add('boot--fade-out');
      this.element.addEventListener(
        'transitionend',
        () => {
          this.element.remove();
          this.enableDesktop();
        },
        { once: true }
      );

      // Fallback if transitionend doesn't fire
      setTimeout(() => {
        if (this.element?.parentNode) {
          this.element.remove();
          this.enableDesktop();
        }
      }, 800);
    }
  }

  enableDesktop() {
    const desktop = document.querySelector('.desktop');
    if (desktop) {
      desktop.classList.remove('desktop--hidden');
    }

    // Focus first desktop icon
    const firstIcon = document.querySelector('.desktop-icon');
    if (firstIcon) {
      requestAnimationFrame(() => {
        firstIcon.focus();
      });
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new BootSequence();
});

export { BootSequence };
