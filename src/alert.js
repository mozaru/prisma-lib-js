export default class PrismaAlert {
  #backdrop;
  #close;

  constructor(customClass) {
    const html = `<div class="modal">
        <div class="content">
        </div>
        <div class="footer">
          <button class="btn">Ok</button>
        </div>
      </div>`;
    
    this.#backdrop = document.createElement('div');
    this.#backdrop.classList.add('backdrop');
    if (customClass) {
      this.#backdrop.classList.add(customClass);
    }
    this.#backdrop.insertAdjacentHTML('afterbegin', html);
    
    const modal = this.#backdrop.querySelector('.modal');
    modal.querySelector('.btn').addEventListener('click', () => {
      modal.classList.remove('visible');
      setTimeout(() => {
        this.#backdrop.remove();
        if (this.#close) {
          this.#close();
          this.#close = null;
        }
      }, 200);
    });
  }

  showAsync(message, buttonText) {
    return new Promise((resolve) => {
      const modal = this.#backdrop.querySelector('.modal');
      modal.querySelector('.content').innerText = message;

      if (buttonText) {
        modal.querySelector('.btn').innerText = buttonText;
      }

      this.#close = resolve;
      document.body.insertAdjacentElement('beforeend', this.#backdrop);
      modal.classList.add('visible');
    })
  }
}