import PrismaModal from "./modal.js";

export default class PrismaPrompt extends PrismaModal {

  constructor(customClass) {
    const template = `
        <div class="content">
          <div class="prisma-field">
            <label for="prompt"></label>
            <input type="text" id="prompt">
          </div>
        </div>
        <div class="footer">
          <button class="btn btnDefault">Ok</button>
          <button class="btn">Cancel</button>
        </div>`;
    super(customClass, template);
  }

  show(message, value, resolveText, rejectText) {
    return new Promise(async (resolve) => {
      this.querySelector('label').innerText = message;

      if (value) {
        this.querySelector('input').value = value
      }
      if (resolveText) {
        this.querySelector('.btn.btnDefault').innerText = resolveText;
      }
      if (rejectText) {
        this.querySelector('.btn:not(.btnDefault)').innerText = rejectText;
      }

      this.querySelector('.btn.btnDefault').addEventListener('click', async () => {
        await this.close();
        resolve(this.querySelector('.modal input').value);
      });
      this.querySelector('.btn:not(.btnDefault)').addEventListener('click', async () => {
        await this.close();
        resolve(null);
      });

      await this.open();
    });
  }
}