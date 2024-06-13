export function cnpj (msg = 'Invalid CNPJ') {
  return function (value) {
    return validate(value) ? null : msg;
  }
}

function validate(value) {
  if (!value) return true;

  value = value.replace(/\D/g, '');

  if (!/^\d{14}$/g.test(value)) return false;
  if (/^(\d)\1+$/g.test(value)) return false;
  
  const numbers = [...value].map(Number);
  function validateDigit(index) {
    let factor = index - 7;
    let sum = numbers.reduce((acc, cur, idx) => {
      if (idx < index) {
        acc += factor-- * cur;
        if (factor < 2) factor = 9;
      }
      return acc;
    }, 0);
  
    let digit = 11 - (sum % 11);
    digit = digit > 9 ? 0 : digit;
    return digit === numbers[index];
  }
  
  return validateDigit(12) && validateDigit(13);
}