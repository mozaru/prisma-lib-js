export default class PrismaAlert {
  #backdrop;
  #close;

  constructor() {
    const html = `<div class="modal">
        <div class="content">
        </div>
        <div class="footer">
          <button class="btn">Ok</button>
        </div>
      </div>`;
    
    this.#backdrop = document.createElement('div');
    this.#backdrop.style.display = 'none';
    this.#backdrop.classList.add('backdrop');
    this.#backdrop.insertAdjacentHTML('afterbegin', html);

    const body = document.querySelector('body');
    body.insertAdjacentElement('beforeend', this.#backdrop);
    
    const btn = this.#backdrop.querySelector('.modal .btn');
    btn.addEventListener('click', () => {
      this.#backdrop.remove();
      if (this.#close) {
        this.#close();
        this.#close = null;
      }
    });
  }

  showAsync(message, buttonText) {
    return new Promise((resolve) => {
      const content = this.#backdrop.querySelector('.modal .content');
      content.innerText = message;

      const btn = this.#backdrop.querySelector('.modal .btn');
      if (buttonText) {
        btn.innerText = buttonText;
      }

      this.#close = resolve;
      this.#backdrop.style.display = 'block';
    })
  }
}