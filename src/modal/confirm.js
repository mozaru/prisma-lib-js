import PrismaModal from "./modal.js";

export default class PrismaPrompt extends PrismaModal {

  constructor(customClass) {
    const template = `
        <div class="content">
        </div>
        <div class="footer">
          <button class="btn btnDefault">Yes</button>
          <button class="btn">No</button>
        </div>`;
    super(customClass, template);
  }

  show(message, resolveText, rejectText) {
    return new Promise(async (resolve) => {
      this.querySelector('.content').innerText = message;

      if (resolveText) {
        this.querySelector('.btn.btnDefault').innerText = resolveText;
      }
      if (rejectText) {
        this.querySelector('.btn:not(.btnDefault)').innerText = rejectText;
      }

      this.querySelector('.btn.btnDefault').addEventListener('click', async () => {
        await this.close();
        resolve(true);
      });
      this.querySelector('.btn:not(.btnDefault)').addEventListener('click', async () => {
        await this.close();
        resolve(false);
      });

      await this.open();
    });
  }
}