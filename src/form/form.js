export default class {
  #form
  #settings
  errors = {}

  constructor(form, settings) {
    if (form && settings) {
      this.#form = form;
      this.#settings = settings;

      for (const fieldName in settings) {
        const field = form[fieldName];
        const initVal = settings[fieldName].initialValue;
        if (initVal) {
          field.value = initVal;
        }
        field.addEventListener('input', () => {
          this.#validate();
        });
      }
    }
  }

  get valid() {
    if (this.#settings) {
      this.#validate();
    }
    return Object.keys(this.errors).length === 0;
  }

  get value() {
    const val = {};
    for (const field of this.#form) {
      if (field.name && field.name in this.#settings) {
        val[field.name] = field.value;
      }
    }
    return val;
  }

  #validate() {
    this.hideErrors();
    for (const field of this.#form) {
      if (field.name && field.name in this.#settings) {
        const validators = this.#settings[field.name].validators || [];
        for (const validator of validators) {
          const errMsg = validator(field.value);
          if (errMsg) {
            this.addError(field, errMsg);
          }
        }
      }
    }
    this.showErrors();
  }

  #format(field, message) {
    let regexp = new RegExp('\\{name}', 'gi');
    message = message.replace(regexp, field.name);
    return message;
  }

  addError(field, message) {
    if (!this.errors[field.name]) {
      this.errors[field.name] = [];
    }
    this.errors[field.name].push(this.#format(field, message));
    if (!this.#form) this.#form = field.form;
  }

  showErrors() {
    for (const fieldName in this.errors) {
      const field = this.#form[fieldName];
      field.parentElement.classList.add('error');
      for (const errMsg of this.errors[fieldName]) {
        const div = document.createElement('div');
        div.append(errMsg);
        field.parentElement.append(div);
      }
    }
  }

  hideErrors() {
    for (const fieldName in this.errors) {
      const field = this.#form[fieldName];
      field.parentElement.classList.remove('error');
      const messages = [...field.parentElement.getElementsByTagName('div')];
      for (const div of messages) {
        div.remove();
      }
    }
    this.errors = {};
  }
}