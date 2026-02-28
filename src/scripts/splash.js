/**
 * SplashScreen - Handles the intro "hello" splash animation
 */
class SplashScreen {
  constructor() {
    this.element = document.getElementById('splash');
    this.skipButton = this.element?.querySelector('.splash-skip');
    this.duration = 2500; // 2.5 seconds
    this.prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (this.element) {
      this.init();
    }
  }

  init() {
    // Check if already seen this session
    if (sessionStorage.getItem('splash-seen')) {
      this.dismiss(true);
      return;
    }

    // Reduced motion: instant dismiss
    if (this.prefersReducedMotion) {
      this.dismiss(true);
      return;
    }

    // Skip button handler
    this.skipButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dismiss();
    });

    // Click anywhere to skip
    this.element.addEventListener('click', () => {
      this.dismiss();
    });

    // Keyboard skip (Enter, Escape, or Space)
    const handleKeySkip = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
        this.dismiss();
        document.removeEventListener('keydown', handleKeySkip);
      }
    };
    document.addEventListener('keydown', handleKeySkip);

    // Auto-dismiss timer
    this.timer = setTimeout(() => this.dismiss(), this.duration);
  }

  dismiss(instant = false) {
    if (!this.element) return;

    // Clear timer if running
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Mark as seen
    sessionStorage.setItem('splash-seen', 'true');

    if (instant || this.prefersReducedMotion) {
      this.element.remove();
      this.enableDesktop();
    } else {
      this.element.classList.add('splash--fade-out');
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
      }, 600);
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
  new SplashScreen();
});

export { SplashScreen };
