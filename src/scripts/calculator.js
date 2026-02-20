/**
 * Calculator - Basic calculator widget
 */
class Calculator {
  constructor() {
    this.display = document.getElementById('calc-display');
    this.container = document.getElementById('calculator');
    this.current = '0';
    this.previous = null;
    this.operator = null;
    this.shouldReset = false;

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const value = btn.dataset.value;

      switch (action) {
        case 'digit':
          this.inputDigit(value);
          break;
        case 'decimal':
          this.inputDecimal();
          break;
        case 'add':
          this.handleOperator('+');
          break;
        case 'subtract':
          this.handleOperator('-');
          break;
        case 'multiply':
          this.handleOperator('*');
          break;
        case 'divide':
          this.handleOperator('/');
          break;
        case 'equals':
          this.calculate();
          break;
        case 'clear':
          this.clear();
          break;
        case 'backspace':
          this.backspace();
          break;
        case 'percent':
          this.percent();
          break;
      }

      this.updateDisplay();
    });
  }

  inputDigit(digit) {
    if (this.shouldReset) {
      this.current = digit;
      this.shouldReset = false;
    } else {
      this.current = this.current === '0' ? digit : this.current + digit;
    }
  }

  inputDecimal() {
    if (this.shouldReset) {
      this.current = '0.';
      this.shouldReset = false;
      return;
    }
    if (!this.current.includes('.')) {
      this.current += '.';
    }
  }

  handleOperator(op) {
    if (this.operator && !this.shouldReset) {
      this.calculate();
    }
    this.previous = parseFloat(this.current);
    this.operator = op;
    this.shouldReset = true;
  }

  calculate() {
    if (this.operator === null || this.previous === null) return;

    const a = this.previous;
    const b = parseFloat(this.current);
    let result;

    switch (this.operator) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = b !== 0 ? a / b : 'Error'; break;
    }

    this.current = typeof result === 'number'
      ? parseFloat(result.toPrecision(12)).toString()
      : result;
    this.operator = null;
    this.previous = null;
    this.shouldReset = true;
  }

  clear() {
    this.current = '0';
    this.previous = null;
    this.operator = null;
    this.shouldReset = false;
  }

  backspace() {
    if (this.shouldReset) return;
    this.current = this.current.length > 1 ? this.current.slice(0, -1) : '0';
  }

  percent() {
    this.current = (parseFloat(this.current) / 100).toString();
  }

  updateDisplay() {
    if (this.display) {
      this.display.value = this.current;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Calculator();
});

export { Calculator };
