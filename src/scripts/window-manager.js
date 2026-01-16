/**
 * WindowManager - Handles window state, positioning, z-index, and dragging
 */
class WindowManager {
  constructor() {
    this.windows = new Map();
    this.highestZIndex = 100;
    this.activeWindow = null;
    this.isMobile = window.matchMedia('(max-width: 767px)').matches;

    this.init();
  }

  init() {
    // Register all windows
    document.querySelectorAll('.window').forEach((el) => {
      const id = el.id.replace('window-', '');
      const defaultX = parseInt(el.dataset.defaultX) || this.getRandomOffset();
      const defaultY = parseInt(el.dataset.defaultY) || this.getRandomOffset();

      this.windows.set(id, {
        element: el,
        isOpen: false,
        position: { x: defaultX, y: defaultY },
        zIndex: 100,
      });
    });

    // Bind desktop icon clicks
    this.bindIconClicks();

    // Bind close buttons
    document.querySelectorAll('[data-close-window]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeWindow(btn.dataset.closeWindow);
      });
    });

    // Bring window to front on click
    document.querySelectorAll('.window').forEach((el) => {
      el.addEventListener('mousedown', () => {
        const id = el.id.replace('window-', '');
        this.bringToFront(id);
      });
    });

    // Setup drag handlers (desktop only)
    if (!this.isMobile) {
      this.setupDragging();
    }

    // Listen for viewport changes
    window.matchMedia('(max-width: 767px)').addEventListener('change', (e) => {
      this.isMobile = e.matches;
      this.handleViewportChange();
    });
  }

  bindIconClicks() {
    const icons = document.querySelectorAll('.desktop-icon');
    let clickTimer = null;
    let clickCount = 0;

    icons.forEach((icon) => {
      icon.addEventListener('click', () => {
        const windowId = icon.dataset.window;
        if (!windowId) return;

        if (this.isMobile) {
          // Mobile: single click opens
          this.openWindow(windowId);
          return;
        }

        // Desktop: double-click to open
        clickCount++;

        if (clickCount === 1) {
          // Single click: select icon
          this.selectIcon(icon);
          clickTimer = setTimeout(() => {
            clickCount = 0;
          }, 300);
        } else if (clickCount === 2) {
          // Double click: open window
          clearTimeout(clickTimer);
          clickCount = 0;
          this.openWindow(windowId);
        }
      });

      // Also support Enter key
      icon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const windowId = icon.dataset.window;
          if (windowId) {
            this.openWindow(windowId);
          }
        }
      });
    });
  }

  selectIcon(icon) {
    // Remove selection from all icons
    document.querySelectorAll('.desktop-icon').forEach((i) => {
      i.classList.remove('desktop-icon--selected');
    });
    // Add selection to clicked icon
    icon.classList.add('desktop-icon--selected');
  }

  openWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    // On mobile, close other windows first
    if (this.isMobile) {
      this.windows.forEach((w, wId) => {
        if (wId !== id && w.isOpen) {
          this.closeWindow(wId);
        }
      });
    }

    win.isOpen = true;
    win.element.setAttribute('aria-hidden', 'false');

    // Position window (desktop only)
    if (!this.isMobile) {
      this.setPosition(id, win.position.x, win.position.y);
    }

    // Bring to front
    this.bringToFront(id);

    // Focus first focusable element
    requestAnimationFrame(() => {
      const focusable = win.element.querySelector(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) {
        focusable.focus();
      }
    });
  }

  closeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.isOpen = false;
    win.element.setAttribute('aria-hidden', 'true');
    win.element.classList.remove('window--active');

    // If this was the active window, clear it
    if (this.activeWindow === id) {
      this.activeWindow = null;
    }

    // Return focus to desktop icon
    const icon = document.querySelector(`[data-window="${id}"]`);
    if (icon) {
      icon.focus();
    }
  }

  bringToFront(id) {
    const win = this.windows.get(id);
    if (!win) return;

    this.highestZIndex++;
    win.zIndex = this.highestZIndex;
    win.element.style.zIndex = this.highestZIndex.toString();

    // Update active states
    this.windows.forEach((w, wId) => {
      w.element.classList.toggle('window--active', wId === id);
    });
    this.activeWindow = id;
  }

  setPosition(id, x, y) {
    const win = this.windows.get(id);
    if (!win) return;

    // Clamp to viewport
    const rect = win.element.getBoundingClientRect();
    const maxX = window.innerWidth - Math.min(rect.width, 100);
    const maxY = window.innerHeight - Math.min(rect.height, 50);

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(24, Math.min(y, maxY)); // 24px for menu bar

    win.position = { x, y };
    win.element.style.left = `${x}px`;
    win.element.style.top = `${y}px`;
  }

  setupDragging() {
    let isDragging = false;
    let currentWindow = null;
    let startX, startY, startLeft, startTop;

    // Mouse down on title bar
    document.addEventListener('mousedown', (e) => {
      const titleBar = e.target.closest('[data-draggable]');
      if (!titleBar) return;

      // Don't drag if clicking on controls
      if (e.target.closest('.title-bar-controls')) return;

      const windowEl = titleBar.closest('.window');
      if (!windowEl) return;

      const id = windowEl.id.replace('window-', '');
      currentWindow = this.windows.get(id);
      if (!currentWindow) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = currentWindow.position.x;
      startTop = currentWindow.position.y;

      this.bringToFront(id);
      windowEl.style.willChange = 'left, top';

      e.preventDefault();
    });

    // Mouse move
    window.addEventListener('mousemove', (e) => {
      if (!isDragging || !currentWindow) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const id = currentWindow.element.id.replace('window-', '');
      this.setPosition(id, startLeft + deltaX, startTop + deltaY);
    });

    // Mouse up
    window.addEventListener('mouseup', () => {
      if (currentWindow) {
        currentWindow.element.style.willChange = 'auto';
      }
      isDragging = false;
      currentWindow = null;
    });

    // Touch support for tablets
    this.setupTouchDragging();
  }

  setupTouchDragging() {
    let isDragging = false;
    let currentWindow = null;
    let startX, startY, startLeft, startTop;

    document.addEventListener(
      'touchstart',
      (e) => {
        const titleBar = e.target.closest('[data-draggable]');
        if (!titleBar || this.isMobile) return;

        if (e.target.closest('.title-bar-controls')) return;

        const windowEl = titleBar.closest('.window');
        if (!windowEl) return;

        const id = windowEl.id.replace('window-', '');
        currentWindow = this.windows.get(id);
        if (!currentWindow) return;

        const touch = e.touches[0];
        isDragging = true;
        startX = touch.clientX;
        startY = touch.clientY;
        startLeft = currentWindow.position.x;
        startTop = currentWindow.position.y;

        this.bringToFront(id);
      },
      { passive: true }
    );

    window.addEventListener(
      'touchmove',
      (e) => {
        if (!isDragging || !currentWindow) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;

        const id = currentWindow.element.id.replace('window-', '');
        this.setPosition(id, startLeft + deltaX, startTop + deltaY);
      },
      { passive: true }
    );

    window.addEventListener('touchend', () => {
      isDragging = false;
      currentWindow = null;
    });
  }

  handleViewportChange() {
    if (this.isMobile) {
      // Close all windows except active
      this.windows.forEach((win, id) => {
        if (id !== this.activeWindow && win.isOpen) {
          this.closeWindow(id);
        }
      });
    }
  }

  getRandomOffset() {
    return 100 + Math.floor(Math.random() * 100);
  }

  // Public API for keyboard manager
  getActiveWindow() {
    return this.activeWindow;
  }

  getWindows() {
    return this.windows;
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.windowManager = new WindowManager();
});

export { WindowManager };
