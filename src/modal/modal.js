import AnimationHandler from "../dom/AnimationHandler.js";
import Abstract from "../utils/abstract.js";

export default class PrismaModal extends Abstract {
  #backdrop;
  #modal;
  #animation;
  #bodyObserver;

  constructor(customClass, template) {
    super(PrismaModal, ['show']);
    
    this.#modal = document.createElement('div');
    this.#modal.classList.add('modal');
    this.#modal.insertAdjacentHTML('afterbegin', template);
    this.#animation = new AnimationHandler(this.#modal);

    this.#backdrop = document.createElement('div');
    this.#backdrop.classList.add('backdrop');
    if (customClass) {
      this.#backdrop.classList.add(customClass);
    }
    this.#backdrop.append(this.#modal);

    let resolveOpen, resolveClose;
    this.opened = new Promise((resolve) => {
      resolveOpen = resolve;
    });

    this.closed = new Promise(async (resolve) => {
      resolveClose = resolve;
    });

    this.#bodyObserver = new MutationObserver(async mutations => {
      for (const mutation of mutations) {
        if (Array.from(mutation.addedNodes).includes(this.#backdrop)) {
          await this.#animation.animate('visible');
          resolveOpen();
        } else if (Array.from(mutation.removedNodes).includes(this.#backdrop)) {
          this.#bodyObserver.disconnect();
          resolveClose();
        }
      }
    });
  }

  querySelector(selector) {
    return this.#backdrop.querySelector(selector);
  }

  async close() {
    await this.#animation.revert('visible');
    this.#backdrop.remove();
    return this.closed;
  }

  open() {
    this.#bodyObserver.observe(document.body, {
      childList: true
    });
    document.body.insertAdjacentElement('beforeend', this.#backdrop);
    return this.opened;
  }
}