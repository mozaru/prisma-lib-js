import PrismaModal from "./modal.js";

export default class PrismaPrompt extends PrismaModal {
  #resolve;

  constructor(customClass) {
    const template = `
      <div class="modal">
        <div class="content">
          <div class="prisma-field">
            <label></label>
            <input type="text">
          </div>
        </div>
        <div class="footer">
          <button class="btn btnDefault">Ok</button>
          <button class="btn">Cancel</button>
        </div>
      </div>`;
    super(customClass, template);

    const modal = this.querySelector('.modal');
    modal.querySelector('.btn.btnDefault').addEventListener('click', () => {
      this.#close(modal, modal.querySelector('.modal input').value);
    });
    modal.querySelector('.btn:not(.btnDefault)').addEventListener('click', () => {
      this.#close(modal, null);
    });
  }

  #close(modal, result) {
    modal.classList.remove('visible');
    setTimeout(() => {
      this.close();
      if (this.#resolve) {
        this.#resolve(result);
        this.#resolve = null;
      }
    }, 200);
  }

  showAsync(message, value, resolveText, rejectText) {
    return new Promise((resolve) => {
      const modal = this.querySelector('.modal');
      modal.querySelector('label').innerText = message;

      if (resolveText) {
        modal.querySelector('.btn.btnDefault').innerText = resolveText;
      }

      if (rejectText) {
        modal.querySelector('.btn:not(.btnDefault)').innerText = rejectText;
      }

      if (value) {
        modal.querySelector('input').value = value
      }

      this.#resolve = resolve;
      this.show();
      setTimeout(() => {
        modal.classList.add('visible');
      }, 1);
    })
  }
}