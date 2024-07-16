import { cpf } from 'prisma-js/form';

describe('CPF validator', () => {
  it('should factory a function that will validate the value',  () => {
    const result = cpf();
    expect(result).toEqual(jasmine.any(Function));
  });

  it('should validate null value', () => {
    const result = cpf()(null);
    expect(result).toBeNull();
  });

  it('should validate empty value', () => {
    const result = cpf()('');
    expect(result).toBeNull();
  });

  it('should invalidate value with less than 11 characters', () => {
    const result =  cpf()('0123456789');
    expect(result).not.toBeNull();
  });

  it('should invalidate value with repeated characters', () => {
    const result =  cpf()('11111111111');
    expect(result).not.toBeNull();
  });

  it('should use custom error message', () => {
    const errMsg = 'Invalid';
    const result =  cpf(errMsg)('11111111111');
    expect(result).toEqual(errMsg);
  });

  it('should validate value with mask', () => {
    const validCPF = '487.501.680-88';
    const result =  cpf()(validCPF);
    expect(result).toBeNull();
  });

  it('should validate value without mask', () => {
    const validCPF = '48750168088';
    const result =  cpf()(validCPF);
    expect(result).toBeNull();
  });

  it('should invalidate value with first digit wrong', () => {
    const CPF = '487.501.680-78';
    const result =  cpf()(CPF);
    expect(result).not.toBeNull();
  });

  it('should invalidate value with second digit wrong', () => {
    const CPF = '487.501.680-87';
    const result =  cpf()(CPF);
    expect(result).not.toBeNull();
  });
});