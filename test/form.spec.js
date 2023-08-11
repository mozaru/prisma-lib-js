import PrismaForm from 'prisma-js/form';

class Element {
  name;
  value;
  form;
  parentElement;
  classList;
  tagName;
  children;
  #listeners;

  constructor(tagName, options) {
    this.tagName = tagName;
    this.classList = new List();
    this.children = [];
    this.#listeners = [];

    if (options) {
      for (const opt in options) {
        this[opt] = options[opt];
      }
    }
  }

  get className() {
    return this.classList.value;
  }

  addEventListener(type, handler) {
    this.#listeners.push({ type, handler });
  }

  dispatchEvent(event) {
    for (const listener of this.#listeners) {
      if (listener.type == event.type) {
        listener.handler(event);
      }
    }
  }

  append(element) {
    if (typeof element == 'string') {
      element = new Element('text', { value: element });
    }
    element.parentElement = this;
    this.children.push(element);
  }

  remove() {
    const index = this.parentElement.children.indexOf(this);
    this.parentElement.children.splice(index, 1);
    this.parentElement = null;
  }

  getElementsByTagName(name) {
    const elements = [];
    for (const child of this.children) {
      if (child.tagName == name) {
        elements.push(child);
      }
    }
    return elements;
  }
}

class Form extends Element {
  #fields = [];

  constructor(fields) {
    super('form')
    for (const field of fields) {
      this[field.name] = field;
      this.append(field);
      field.form = this;
    }

    this[Symbol.iterator] = function* () {
      let index = 0;
      while (index < this.#fields.length) {
        yield this.#fields[index++];
      }
    }
  }



  #setForm(element) {
    if (element.tagName == 'input') {
      this[element.name] = element;
      element.form = this;
      this.#fields.push(element);
    } else {
      for (const child of element.children) {
        this.#setForm(child);
      }
    }
  }

  append(element) {
    super.append(element);
    this.#setForm(element);
  }

  remove(element) {
    super.remove(element);
    if (element.name in this) {
      delete this[element.name]
    }
  }
}

class List extends Array {
  get value() {
    if (!this.length) {
      return '';
    }

    return this.join(' ');
  };

  add(...tokens) {
    for (const token of tokens) {
      if (!this.includes(token)) {
        this.push(token);
      }
    }
  }

  remove(...tokens) {
    let index = -1;
    for (const token of tokens) {
      if ((index = this.indexOf(token)) != -1) {
        this.splice(index, 1);
      }
    }
  }
}

const requiredMessage = 'This field is required';
function require(value) {
  return value ? '' : requiredMessage;
}

describe('PrismaForm', () => {
  let form;

  beforeEach(() => {
    global.document = {
      createElement: (tagName) => new Element(tagName)
    }
  });

  describe('old style', () => {
    beforeEach(() => {
      form = new Form([]);
    });

    it('should add errors', () => {
      const errMsg = 'This field has a error';
      const prismaForm = new PrismaForm();
      prismaForm.addError(new Element('input', { name: 'username' }), errMsg);
      prismaForm.addError(new Element('input', { name: 'password' }), errMsg);

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ username: [errMsg], password: [errMsg] });
    });

    it('should put error class on parent element of the field', () => {
      const errMsg = 'Invalid cpf';
      const prismaForm = new PrismaForm();
      const parent = new Element('div');
      const field = new Element('input', { name: 'cpf' });
      parent.append(field);
      form.append(parent);
      prismaForm.addError(field, errMsg);
      prismaForm.showErrors();

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [errMsg] });
      expect(parent.className).toEqual('error');
    });

    it('should remove error class on parent element of the field', () => {
      const errMsg = 'Invalid cpf';
      const prismaForm = new PrismaForm();
      const parent = new Element('div');
      const field = new Element('input', { name: 'cpf' });
      parent.append(field);
      form.append(parent);
      prismaForm.addError(field, errMsg);
      prismaForm.showErrors();

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [errMsg] });
      expect(parent.className).toEqual('error');

      prismaForm.hideErrors();
      expect(prismaForm.valid).toBeTrue();
      expect(prismaForm.errors).toEqual({});
      expect(parent.className).toEqual('');
    });

    it('should not validate form on call valid', () => {
      const errMsg = 'Invalid cpf';
      const prismaForm = new PrismaForm();
      const parent = new Element('div');
      const field = new Element('input', { name: 'cpf' });
      parent.append(field);
      form.append(parent);
      prismaForm.addError(field, errMsg);
      prismaForm.showErrors();

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [errMsg] });
      expect(parent.className).toEqual('error');

      field.value = '271.326.330-15';

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [errMsg] });
      expect(parent.className).toEqual('error');
    });

    it('should not validate form on input event dispatched', () => {
      const errMsg = 'Invalid cpf';
      const prismaForm = new PrismaForm();
      const parent = new Element('div');
      const field = new Element('input', { name: 'cpf' });
      parent.append(field);
      form.append(parent);
      prismaForm.addError(field, errMsg);
      prismaForm.showErrors();

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [errMsg] });
      expect(parent.className).toEqual('error');

      field.value = '271.326.330-15';
      field.dispatchEvent(new Event('input'));

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [errMsg] });
      expect(parent.className).toEqual('error');
    });
  });

  describe('new style', () => {
    const initialValue = 'Prisma Form';
    let field;

    beforeEach(() => {
      field = new Element('input', {
        name: 'cpf'
      });
      form = new Form([field]);
    });

    it('should return not valid form', () => {
      const prismaForm = new PrismaForm(form, {
        cpf: { validators: [require] }
      });

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [requiredMessage] });
    });

    it('should return valid form', () => {
      const prismaForm = new PrismaForm(form, {
        cpf: { initialValue, validators: [require] }
      });

      expect(prismaForm.valid).toBeTrue();
      expect(prismaForm.errors).toEqual({});
    });

    it('should create form with initial value', () => {
      const prismaForm = new PrismaForm(form, {
        cpf: { initialValue }
      });

      expect(prismaForm.value).toEqual({ cpf: initialValue })
    });

    it('should put error class on parent element of the field', () => {
      const parent = new Element('div');
      parent.append(field);
      form = new Form([parent]);
      const prismaForm = new PrismaForm(form, {
        cpf: { validators: [require] }
      });

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [requiredMessage] });
      expect(parent.className).toEqual('error');
    });

    it('should remove error class on parent element of the field', () => {
      const parent = new Element('div');
      parent.append(field);
      form = new Form([parent]);
      const prismaForm = new PrismaForm(form, {
        cpf: { validators: [require] }
      });

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [requiredMessage] });
      expect(parent.className).toEqual('error');

      prismaForm.hideErrors();

      expect(prismaForm.errors).toEqual({});
      expect(parent.className).toEqual('');
    });

    //TODO: colocar o inverso desses dois no old style 'should not validate'

    it('should validate form on call valid', () => {
      const parent = new Element('div');
      parent.append(field);
      form = new Form([parent]);
      const prismaForm = new PrismaForm(form, {
        cpf: { validators: [require] }
      });

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [requiredMessage] });
      expect(parent.className).toEqual('error');

      prismaForm.hideErrors();

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [requiredMessage] });
      expect(parent.className).toEqual('error');
    });

    it('should validate form on input event dispatched', () => {
      const parent = new Element('div');
      parent.append(field);
      form = new Form([parent])
      const prismaForm = new PrismaForm(form, {
        cpf: { validators: [require] }
      });

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [requiredMessage] });
      expect(parent.className).toEqual('error');

      field.value = '271.326.330-15';
      field.dispatchEvent(new Event('input'));

      expect(prismaForm.valid).toBeTrue();
      expect(prismaForm.errors).toEqual({});
      expect(parent.className).toEqual('');
    });
  });
});