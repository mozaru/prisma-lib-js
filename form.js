export default class PrismaForm {
  #form
  #settings
  #errors = {}
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
          this.validate();
        })
      }
    }
  }
  get valid() {
    this.validate()
    return Object.keys(this.#errors).length === 0;
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
  get errors() {
    const errs = [];
    for (const fieldName in this.#errors) {
      const field = this.#form[fieldName];
      for (const message of this.#errors[fieldName]) {
        errs.push({ field, message });
      }
    }
    return errs;
  }
  validate() {
    this.hideErrors();
    this.#errors = {};
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
  addError(field, message) {
    if (!this.#errors[field.name]) {
      this.#errors[field.name] = [];
    }
    this.#errors[field.name].push(message);
    if (!this.#form) this.#form = field.form;
  }
  showErrors() {
    for (const fieldName in this.#errors) {
      const field = this.#form[fieldName];
      field.parentElement.classList.add('error');
      for (const errMsg of this.#errors[fieldName]) {
        const div = document.createElement('div');
        div.append(errMsg);
        field.parentElement.append(div);
      }
    }
  }
  hideErrors() {
    for (const fieldName in this.#errors) {
      const field = this.#form[fieldName];
      field.parentElement.classList.remove('error');
      const messages = [...field.parentElement.getElementsByTagName('div')];
      for (const div of messages) {
        div.remove();
      }
    }
    this.#errors = {};
  }
}