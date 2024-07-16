import { required } from "prisma-js/form";

describe('Required validator', () => {
  it('should factory a function that will validate the value',  () => {
    const result = required();
    expect(result).toEqual(jasmine.any(Function));
  });

  it('should validate string zero value', () => {
    const result = required()('0');
    expect(result).toBeNull();
  });

  it('should validate number zero value', () => {
    const result = required()(0);
    expect(result).toBeNull();
  });

  it('should invalidate undefined value', () => {
    const result = required()(undefined);
    expect(result).not.toBeNull();
  });

  it('should invalidate null value', () => {
    const result = required()(null);
    expect(result).not.toBeNull();
  });

  it('should invalidate empty value', () => {
    const result = required()('');
    expect(result).not.toBeNull();
  });

  it('should use custom error message', () => {
    const errMsg = 'Invalid';
    const result =  required(errMsg)('');
    expect(result).toEqual(errMsg);
  });
});