export function formatNumber(number: number, fractionDigits: number = 1) {
  return Number(number).toFixed(fractionDigits);
}
