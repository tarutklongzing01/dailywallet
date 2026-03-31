const thaiCurrencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  maximumFractionDigits: 2,
});

export function formatCurrency(value = 0) {
  return thaiCurrencyFormatter.format(Number(value) || 0);
}
