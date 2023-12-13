import PrismaModal from "./modal.js";

export default class PrismaAlert extends PrismaModal {
  #close;
  #protected;

  constructor(customClass) {
    const template = `<div class="modal">
        <div class="content">
        </div>
        <div class="footer">
          <button class="btn">Ok</button>
        </div>
      </div>`;
    const shared = {}
    super(customClass, template, shared);
    this.#protected = shared;

    const modal = this.#protected.querySelector('.modal');
    modal.querySelector('.btn').addEventListener('click', () => {
      modal.classList.remove('visible');
      setTimeout(() => {
        this.#protected.close();
        if (this.#close) {
          this.#close();
          this.#close = null;
        }
      }, 200);
    });
  }

  showAsync(message, buttonText) {
    return new Promise((resolve) => {
      const modal = this.#protected.querySelector('.modal');
      modal.querySelector('.content').innerText = message;

      if (buttonText) {
        modal.querySelector('.btn').innerText = buttonText;
      }

      this.#close = resolve;
      this.#protected.show();
      setTimeout(() => {
        modal.classList.add('visible');
      }, 1);
    })
  }
}