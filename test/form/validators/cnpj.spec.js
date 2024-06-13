import { cnpj } from 'prisma-js/form';

describe('CNPJ validator', () => {
  it('should factory a function that will validate the value',  () => {
    const result = cnpj();
    expect(result).toEqual(jasmine.any(Function));
  });

  it('should validate null value', () => {
    const result = cnpj()(null);
    expect(result).toBeNull();
  });

  it('should validate empty value', () => {
    const result = cnpj()('');
    expect(result).toBeNull();
  });

  it('should invalidate value with less than 14 characters', () => {
    const result =  cnpj()('0123456789');
    expect(result).not.toBeNull();
  });

  it('should invalidate value with repeated characters', () => {
    const result =  cnpj()('11111111111111');
    expect(result).not.toBeNull();
  });

  it('should use custom error message', () => {
    const errMsg = 'Invalid';
    const result =  cnpj(errMsg)('11111111111111');
    expect(result).toEqual(errMsg);
  });

  it('should validate value with mask', () => {
    const validCNPJ = '15.489.782/0001-41';
    const result =  cnpj()(validCNPJ);
    expect(result).toBeNull();
  });

  it('should validate value without mask', () => {
    const validCNPJ = '15489782000141';
    const result =  cnpj()(validCNPJ);
    expect(result).toBeNull();
  });

  it('should invalidate value with first digit wrong', () => {
    const CNPJ = '15.489.782/0001-11';
    const result =  cnpj()(CNPJ);
    expect(result).not.toBeNull();
  });

  it('should invalidate value with second digit wrong', () => {
    const CNPJ = '15.489.782/0001-44';
    const result =  cnpj()(CNPJ);
    expect(result).not.toBeNull();
  });
});