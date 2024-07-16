export function cpf (msg = 'Invalid CPF') {
  return function (value) {
    return validate(value) ? null : msg;
  }
}

function validate(value) {
  if (!value) return true;

  value = value.replace(/\D/g, '');

  if (!/^\d{11}$/g.test(value)) return false;
  if (/^(\d)\1+$/g.test(value)) return false;
  
  const numbers = [...value].map(Number);	
  function validateDigit(index) {
    let sum = numbers.reduce((acc, cur, idx) => {
      if (idx < index) {
        return acc + cur * (index + 1 - idx);
      }
      return acc;
    }, 0);
  
    let digit = (sum * 10) % 11;
    digit = digit > 9 ? 0 : digit;	
    return digit === numbers[index];
  }
  
  return validateDigit(9) && validateDigit(10);
}