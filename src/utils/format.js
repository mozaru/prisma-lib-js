export function formatCurrency(value, symbol) {
  return `${symbol} ${formatReal(value, 2)}`;
}

export function formatReal(value, digits) {
  if (!value)
    value = 0;
  return parseFloat(value).toFixed(digits);
}

export function formatInt(value) {
  if (!value)
    value = 0;
  return parseInt(value).toString();
}

export function formatDate(value, naMessage) {
  if (!value) {
    if (typeof naMessage == "string") {
      return naMessage;
    }
    value = new Date("");
  } else if (typeof value == 'string') {
    value = new Date(value);
  }
  return value.toLocaleDateString()
}

export function formatDateTime(value, naMessage) {
  if (!value) {
    if (typeof naMessage == "string") {
      return naMessage;
    }
    value = new Date("");
  } else if (typeof value == 'string') {
    value = new Date(value);
  }
  return value.toLocaleString()
}