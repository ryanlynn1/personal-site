/**
 * KeyboardManager - Handles keyboard navigation for desktop experience
 */
class KeyboardManager {
  constructor() {
    // Wait for WindowManager to be available
    this.checkForWindowManager();
  }

  checkForWindowManager() {
    if (window.windowManager) {
      this.wm = window.windowManager;
      this.init();
    } else {
      // Retry in a short while
      setTimeout(() => this.checkForWindowManager(), 50);
    }
  }

  init() {
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  handleKeydown(e) {
    const activeElement = document.activeElement;

    // Escape: Close active window
    if (e.key === 'Escape') {
      const activeWindow = this.wm.getActiveWindow();
      if (activeWindow) {
        const win = this.wm.getWindows().get(activeWindow);
        if (win && win.isOpen) {
          this.wm.closeWindow(activeWindow);
          e.preventDefault();
        }
      }
    }

    // Tab: Trap focus in open windows
    if (e.key === 'Tab') {
      const activeWindow = this.wm.getActiveWindow();
      if (activeWindow) {
        const win = this.wm.getWindows().get(activeWindow);
        if (win && win.isOpen) {
          this.trapFocus(e, win.element);
        }
      }
    }

    // Arrow keys: Navigate between desktop icons
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
      activeElement?.classList.contains('desktop-icon')
    ) {
      this.navigateIcons(e);
    }
  }

  trapFocus(e, windowEl) {
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusableElements = windowEl.querySelectorAll(focusableSelectors);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Check if focus is within window
    if (!windowEl.contains(document.activeElement)) {
      firstElement.focus();
      e.preventDefault();
      return;
    }

    if (e.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  }

  navigateIcons(e) {
    const icons = Array.from(document.querySelectorAll('.desktop-icon'));
    const currentIndex = icons.indexOf(document.activeElement);

    if (currentIndex === -1) return;

    let nextIndex;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    if (isMobile) {
      // Horizontal navigation on mobile (dock)
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = (currentIndex + 1) % icons.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = (currentIndex - 1 + icons.length) % icons.length;
          break;
      }
    } else {
      // Vertical navigation on desktop (column)
      switch (e.key) {
        case 'ArrowDown':
          nextIndex = (currentIndex + 1) % icons.length;
          break;
        case 'ArrowUp':
          nextIndex = (currentIndex - 1 + icons.length) % icons.length;
          break;
        case 'ArrowRight':
        case 'ArrowLeft':
          // Could be used for multiple columns in future
          return;
      }
    }

    if (nextIndex !== undefined) {
      icons[nextIndex].focus();
      e.preventDefault();
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new KeyboardManager();
});

export { KeyboardManager };
