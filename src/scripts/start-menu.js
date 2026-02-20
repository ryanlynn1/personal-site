/**
 * StartMenuManager - Handles Start menu open/close and item clicks
 */
class StartMenuManager {
  constructor() {
    this.menu = document.getElementById('start-menu');
    this.button = document.getElementById('start-button');
    this.isOpen = false;

    if (this.menu && this.button) {
      this.init();
    }
  }

  init() {
    // Toggle on Start button click
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.menu.contains(e.target) && e.target !== this.button) {
        this.close();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        this.button.focus();
      }
    });

    // Menu items that open windows
    this.menu.querySelectorAll('[data-open-window]').forEach((item) => {
      item.addEventListener('click', () => {
        const windowId = item.dataset.openWindow;
        if (window.windowManager) {
          window.windowManager.openWindow(windowId);
        }
        this.close();
      });
    });

    // Shutdown button
    const shutdownBtn = document.getElementById('shutdown-btn');
    if (shutdownBtn) {
      shutdownBtn.addEventListener('click', () => this.shutdown());
    }

    // Arrow key navigation within menu
    this.menu.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = [...this.menu.querySelectorAll('.start-menu-item')];
        const currentIndex = items.indexOf(document.activeElement);

        let nextIndex;
        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }
        items[nextIndex]?.focus();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.menu.setAttribute('aria-hidden', 'false');
    this.button.setAttribute('aria-expanded', 'true');
    this.button.classList.add('taskbar-start--active');

    // Focus first menu item
    const firstItem = this.menu.querySelector('.start-menu-item');
    if (firstItem) {
      requestAnimationFrame(() => firstItem.focus());
    }
  }

  close() {
    this.isOpen = false;
    this.menu.setAttribute('aria-hidden', 'true');
    this.button.setAttribute('aria-expanded', 'false');
    this.button.classList.remove('taskbar-start--active');
  }

  shutdown() {
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'shutdown-overlay';
    overlay.setAttribute('role', 'alert');
    overlay.innerHTML = `
      <div class="shutdown-box">
        <p class="shutdown-title">It is now safe to turn off<br>your computer.</p>
        <p class="shutdown-subtext">Or just close this tab. Either way, thanks for visiting.</p>
      </div>
    `;
    document.body.appendChild(overlay);

    // Click or key to dismiss
    const dismiss = () => overlay.remove();
    overlay.addEventListener('click', dismiss);
    document.addEventListener(
      'keydown',
      (e) => {
        if (overlay.parentNode) {
          dismiss();
        }
      },
      { once: true }
    );
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new StartMenuManager();
});

export { StartMenuManager };
