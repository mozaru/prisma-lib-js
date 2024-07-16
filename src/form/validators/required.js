export function required (msg = 'Required') {
  return function (value) { return value === 0 || value ? null : msg }
}