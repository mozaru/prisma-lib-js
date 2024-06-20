import Abstract from "../utils/abstract.js";

export default class PrismaModal extends Abstract {
  #backdrop;

  constructor(customClass, template) {
    super(PrismaModal, ['showAsync']);

    this.#backdrop = document.createElement('div');
    this.#backdrop.classList.add('backdrop');
    if (customClass) {
      this.#backdrop.classList.add(customClass);
    }
    this.#backdrop.insertAdjacentHTML('afterbegin', template);
  }

  querySelector(selector) {
    return this.#backdrop.querySelector(selector);
  }

  close() {
    this.#backdrop.remove()
  }

  show() {
    document.body.insertAdjacentElement('beforeend', this.#backdrop);
  }
}