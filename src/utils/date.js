export function formatDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatMonthInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}

export function getTodayDateString() {
  return formatDateInputValue(new Date());
}

export function getCurrentMonthValue() {
  return formatMonthInputValue(new Date());
}

export function formatDateThai(dateString) {
  if (!dateString) {
    return '-';
  }

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
  }).format(new Date(`${dateString}T00:00:00`));
}

export function formatMonthThai(monthString) {
  if (!monthString) {
    return '-';
  }

  return new Intl.DateTimeFormat('th-TH', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${monthString}-01T00:00:00`));
}

export function formatDateTimeThai(value) {
  if (!value) {
    return '-';
  }

  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function getMonthKey(dateString) {
  return dateString?.slice(0, 7) || '';
}
