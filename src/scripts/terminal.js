/**
 * Terminal - DOS-style command prompt Easter egg
 */
class Terminal {
  constructor() {
    this.output = document.getElementById('terminal-output');
    this.input = document.getElementById('terminal-input');
    this.history = [];
    this.historyIndex = -1;

    this.commands = {
      help: () => this.cmdHelp(),
      about: () => this.cmdAbout(),
      ls: () => this.cmdLs(),
      dir: () => this.cmdLs(),
      clear: () => this.cmdClear(),
      cls: () => this.cmdClear(),
      whoami: () => 'Ryan Lynn - Builder & Entrepreneur',
      date: () => new Date().toLocaleDateString(),
      time: () => new Date().toLocaleTimeString(),
      echo: (args) => args.join(' '),
      contact: () => 'Email: hello@ryanlynn.ai\nLinkedIn: linkedin.com/in/ryanlynn\nX: @ryanlynn',
      cd: () => 'Nice try. There is nowhere else to go.',
      sudo: () => 'Permission denied. This is not your computer.',
      rm: () => "Let's not delete anything today.",
      exit: () => {
        window.windowManager?.closeWindow('terminal');
        return '';
      },
      projects: () => {
        window.windowManager?.openWindow('projects');
        return 'Opening Projects...';
      },
      open: (args) => {
        const target = args[0];
        const valid = ['about', 'projects', 'writing', 'contact', 'notes', 'terminal', 'calc'];
        if (target && valid.includes(target) && window.windowManager) {
          window.windowManager.openWindow(target);
          return `Opening ${target}...`;
        }
        return 'Usage: open <window>\nAvailable: ' + valid.join(', ');
      },
      neofetch: () => this.cmdNeofetch(),
      matrix: () => this.cmdMatrix(),
      hello: () => 'Hello! Thanks for visiting ryanlynn.ai',
      ping: () => 'Pong!',
      coffee: () => '\n   ( (\n    ) )\n  ........\n  |      |]\n  \\      /\n   `----\'\n\nHere\'s your coffee.',
    };

    if (this.input) {
      this.init();
    }
  }

  init() {
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.execute(this.input.value);
        this.input.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateHistory(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateHistory(1);
      }
    });

    // Focus input when terminal window becomes active
    const terminalWindow = document.getElementById('window-terminal');
    if (terminalWindow) {
      const observer = new MutationObserver(() => {
        if (terminalWindow.getAttribute('aria-hidden') === 'false') {
          setTimeout(() => this.input?.focus(), 100);
        }
      });
      observer.observe(terminalWindow, {
        attributes: true,
        attributeFilter: ['aria-hidden'],
      });
    }

    // Focus input on click anywhere in terminal
    this.output?.parentElement?.addEventListener('click', () => {
      this.input?.focus();
    });
  }

  execute(commandStr) {
    const trimmed = commandStr.trim();
    if (!trimmed) return;

    this.history.push(trimmed);
    this.historyIndex = this.history.length;

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let result;
    if (this.commands[cmd]) {
      result =
        typeof this.commands[cmd] === 'function'
          ? this.commands[cmd](args)
          : this.commands[cmd];
    } else {
      result = `'${cmd}' is not recognized as an internal or external command.\nType 'help' for available commands.`;
    }

    this.appendOutput(`C:\\RYAN>${trimmed}\n${result}\n\n`);
  }

  appendOutput(text) {
    const pre = this.output?.querySelector('pre');
    if (pre) {
      pre.textContent += text;
      this.output.scrollTop = this.output.scrollHeight;
    }
  }

  navigateHistory(direction) {
    this.historyIndex += direction;
    this.historyIndex = Math.max(0, Math.min(this.historyIndex, this.history.length));
    this.input.value = this.history[this.historyIndex] || '';
  }

  cmdHelp() {
    return [
      'Available commands:',
      '  help      - Show this help',
      '  about     - About Ryan Lynn',
      '  ls / dir  - List desktop items',
      '  clear     - Clear screen',
      '  whoami    - Who am I?',
      '  date      - Current date',
      '  time      - Current time',
      '  echo      - Echo text',
      '  contact   - Contact info',
      '  projects  - Open Projects',
      '  open      - Open a window',
      '  neofetch  - System info',
      '  coffee    - Get coffee',
      '  ping      - Pong!',
      '  exit      - Close terminal',
    ].join('\n');
  }

  cmdAbout() {
    return [
      'Ryan Lynn',
      'Builder & Entrepreneur',
      'AI @ Michigan Ross (May 2026)',
      '',
      'Building OuterEdge (AI consulting)',
      'and StartingIt (AI co-founder).',
    ].join('\n');
  }

  cmdLs() {
    return [
      ' Directory of C:\\RYAN\\Desktop',
      '',
      ' About.exe      Projects/       Writing.doc',
      ' Contact.eml    Notes.txt       Terminal.exe',
      ' Calculator.exe',
      '',
      ' 7 item(s)',
    ].join('\n');
  }

  cmdClear() {
    const pre = this.output?.querySelector('pre');
    if (pre) pre.textContent = '';
    return '';
  }

  cmdNeofetch() {
    return [
      '  ┌─────────────────────┐',
      '  │      RyanOS v1.0    │',
      '  └─────────────────────┘',
      '  OS:      RyanOS v1.0',
      '  Host:    ryanlynn.ai',
      '  Kernel:  Astro 5.x',
      '  Shell:   Vanilla JS',
      '  DE:      Win95 Classic',
      '  Theme:   Warm Landscape',
      '  CPU:     Creative Cortex',
      '  Memory:  640K (should be enough)',
      '  Uptime:  Since 2024',
    ].join('\n');
  }

  cmdMatrix() {
    return 'Wake up, Neo... The Matrix has you.\n\nJust kidding. Type "help" for real commands.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Terminal();
});

export { Terminal };
