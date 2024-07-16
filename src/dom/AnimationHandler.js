export default class {
  #observer;
  #resolve;

  constructor(element) {
    this.element = element;
    const css = window.getComputedStyle(element);
    this.#observer = new MutationObserver(() => {
      const tduration = this.#toNumber(css['transition-duration']);
      const aDuration = this.#toNumber(css['animation-duration']);
      this.#observer.disconnect();
      setTimeout(() => {
        this.#resolve();
      }, Math.max(tduration, aDuration));
    });
  }

  #toNumber(value) {
    if (value.endsWith('ms')) {
      return parseInt(value);
    } else {
      return parseFloat(value) * 1000;
    }
  }

  #handle(doWork) {
    return new Promise(resolve => {
      this.#resolve = resolve;
      this.#observer.observe(this.element, {
        attributes: true,
        attributeFilter: ['class']
      });
      setTimeout(doWork, 0);
    });
  }

  animate(cssClass) {
    return this.#handle(() => {
      this.element.classList.add(cssClass);
    });
  }

  revert(cssClass) {
    return this.#handle(() => {
      this.element.classList.remove(cssClass);
    });
  }
}