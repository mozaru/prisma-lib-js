export function phone (msg = 'Invalid phone') {
  return function(value) {
    return validate(value) ? null : msg;
  }
}

function validate(value) {
  if (!value) return true;

  value = value.replace(/\D/g, '');
  return /^[1-9]{2}9?\d{8}$/.test(value);
}