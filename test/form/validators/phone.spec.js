import { phone } from 'prisma-js/form';

describe('Phone validator', () => {
  it('should factory a function that will validate the value',  () => {
    const result = phone();
    expect(result).toEqual(jasmine.any(Function));
  });

  it('should validate null value', () => {
    const result = phone()(null);
    expect(result).toBeNull();
  });

  it('should validate empty value', () => {
    const result = phone()('');
    expect(result).toBeNull();
  });

  it('should invalidate value with less than 10 characters', () => {
    const result =  phone()('123456789');
    expect(result).not.toBeNull();
  });

  it('should invalidate value with more than 11 characters', () => {
    const result =  phone()('123456789abc');
    expect(result).not.toBeNull();
  });

  it('should invalidate value with zero in first characters', () => {
    const result =  phone()('0123456789');
    expect(result).not.toBeNull();
  });

  it('should invalidate value with zero in second characters', () => {
    const result =  phone()('1023456789');
    expect(result).not.toBeNull();
  });

  it('should invalidate value with eleven characters and the third different of 9', () => {
    const result =  phone()('1023456789');
    expect(result).not.toBeNull();
  });

  it('should use custom error message', () => {
    const errMsg = 'Invalid';
    const result =  phone(errMsg)('123456789');
    expect(result).toEqual(errMsg);
  });

  it('should validate value with mask and without the 9', () => {
    const validPhone = '(12) 3456-7890';
    const result =  phone()(validPhone);
    expect(result).toBeNull();
  });

  it('should validate value with mask and the 9', () => {
    const validPhone = '(12) 9-3456-7890';
    const result =  phone()(validPhone);
    expect(result).toBeNull();
  });

  it('should validate value without mask and the 9', () => {
    const validPhone = '1234567890';
    const result =  phone()(validPhone);
    expect(result).toBeNull();
  });

  it('should validate value without mask and with the 9', () => {
    const validPhone = '12934567890';
    const result =  phone()(validPhone);
    expect(result).toBeNull();
  });
});