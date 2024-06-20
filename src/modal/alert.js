import PrismaModal from "./modal.js";

export default class PrismaAlert extends PrismaModal {
  #close;

  constructor(customClass) {
    const template = `<div class="modal">
        <div class="content">
        </div>
        <div class="footer">
          <button class="btn">Ok</button>
        </div>
      </div>`;
    super(customClass, template);

    const modal = this.querySelector('.modal');
    modal.querySelector('.btn').addEventListener('click', () => {
      modal.classList.remove('visible');
      setTimeout(() => {
        this.close();
        if (this.#close) {
          this.#close();
          this.#close = null;
        }
      }, 200);
    });
  }

  showAsync(message, buttonText) {
    return new Promise((resolve) => {
      const modal = this.querySelector('.modal');
      modal.querySelector('.content').innerText = message;

      if (buttonText) {
        modal.querySelector('.btn').innerText = buttonText;
      }

      this.#close = resolve;
      this.show();
      setTimeout(() => {
        modal.classList.add('visible');
      }, 1);
    })
  }
}