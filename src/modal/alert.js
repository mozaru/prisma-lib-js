import PrismaModal from "./modal.js";

export default class PrismaAlert extends PrismaModal {

  constructor(customClass) {
    const template = `<div class="content">
      </div>
      <div class="footer">
        <button class="btn">Ok</button>
      </div>`;
    super(customClass, template);
  }

  async show(message, buttonText) {
    this.querySelector('.content').innerText = message;

    if (buttonText) {
      this.querySelector('.btn').innerText = buttonText;
    }

    this.querySelector('.btn').addEventListener('click', () => {
      this.close();
    });
    await this.open();
    await this.closed;
  }
}