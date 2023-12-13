import Abstract from "../utils/abstract.js";

export default class PrismaModal extends Abstract {
  #protected;

  constructor(customClass, template, shared) {
    super(PrismaModal, ['showAsync']);
    this.#protected = shared || {};

    this.#protected.backdrop = document.createElement('div');
    this.#protected.backdrop.classList.add('backdrop');
    if (customClass) {
      this.#protected.backdrop.classList.add(customClass);
    }
    this.#protected.backdrop.insertAdjacentHTML('afterbegin', template);

    this.#protected.querySelector = (selector) => {
      return this.#protected.backdrop.querySelector(selector);
    }

    this.#protected.close = () => {
      this.#protected.backdrop.remove()
    }

    this.#protected.show = () => {
      document.body.insertAdjacentElement('beforeend', this.#protected.backdrop);
    }
  }
}