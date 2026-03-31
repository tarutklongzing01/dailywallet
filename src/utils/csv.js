import { formatDateInputValue, formatDateThai } from './date';

function escapeCsvValue(value) {
  const stringValue = String(value ?? '');

  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

export function exportTransactionsToCsv(transactions) {
  const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'รายละเอียด', 'จำนวนเงิน'];
  const rows = transactions.map((item) => [
    formatDateThai(item.date),
    item.type,
    item.category,
    item.description,
    Number(item.amount).toFixed(2),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: 'text/csv;charset=utf-8;',
  });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const dateStamp = formatDateInputValue(new Date());

  link.href = url;
  link.download = `transactions-${dateStamp}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
