import PrismaForm from 'prisma-js/form';
import { MockDocument } from '../mock-dom.js';

const requiredMessage = 'This field is required';
function require(value) {
  return value ? '' : requiredMessage;
}

describe('PrismaForm', () => {
  let form;

  beforeEach(() => {
    global.document = new MockDocument();
  });

  describe('old style', () => {
    beforeEach(() => {
      form = document.createElement('form');
    });

    it('should add errors', () => {
      const errMsg = 'This field has a error';
      const prismaForm = new PrismaForm();
      prismaForm.addError(document.createElement('input', { name: 'username' }), errMsg);
      prismaForm.addError(document.createElement('input', { name: 'password' }), errMsg);

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ username: [errMsg], password: [errMsg] });
    });

    it('should put error class on parent element of the field', () => {
      const errMsg = 'Invalid cpf';
      const prismaForm = new PrismaForm();
      const parent = document.createElement('div');
      const field = document.createElement('input', { name: 'cpf' });
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
      const parent = document.createElement('div');
      const field = document.createElement('input', { name: 'cpf' });
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
      const parent = document.createElement('div');
      const field = document.createElement('input', { name: 'cpf' });
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
      const parent = document.createElement('div');
      const field = document.createElement('input', { name: 'cpf' });
      parent.append(field);
      form.append(parent);
      prismaForm.addError(field, errMsg);
      prismaForm.showErrors();

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [errMsg] });
      expect(parent.className).toEqual('error');

      field.value = '271.326.330-15';
      field.dispatchEvent(document.createElement('input'));

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [errMsg] });
      expect(parent.className).toEqual('error');
    });
  });

  describe('new style', () => {
    const initialValue = 'Prisma Form';
    let field;

    beforeEach(() => {
      field = document.createElement('input', {
        name: 'cpf'
      });
      form = document.createElement('form');
      form.append(field);
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
      const parent = document.createElement('div');
      parent.append(field);
      form = document.createElement('form');
      form.append(parent);
      const prismaForm = new PrismaForm(form, {
        cpf: { validators: [require] }
      });

      expect(prismaForm.valid).toBeFalse();
      expect(prismaForm.errors).toEqual({ cpf: [requiredMessage] });
      expect(parent.className).toEqual('error');
    });

    it('should remove error class on parent element of the field', () => {
      const parent = document.createElement('div');
      parent.append(field);
      form = document.createElement('form');
      form.append(parent);
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

    it('should validate form on call valid', () => {
      const parent = document.createElement('div');
      parent.append(field);
      form = document.createElement('form');
      form.append(parent);
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
      const parent = document.createElement('div');
      parent.append(field);
      form = document.createElement('form');
      form.append(parent);
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