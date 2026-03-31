import {
  formatMonthInputValue,
  getCurrentMonthValue,
  getMonthKey,
  getTodayDateString,
} from './date';

function getTimestampMillis(value) {
  if (!value) {
    return 0;
  }

  if (typeof value?.toMillis === 'function') {
    return value.toMillis();
  }

  return new Date(value).getTime();
}

export function sortTransactions(transactions = []) {
  return [...transactions].sort((left, right) => {
    if (left.date === right.date) {
      return getTimestampMillis(right.updatedAt || right.createdAt) - getTimestampMillis(left.updatedAt || left.createdAt);
    }

    return right.date.localeCompare(left.date);
  });
}

export function calculatePeriodSummary(transactions = []) {
  const income = transactions
    .filter((item) => item.type === 'รายรับ')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const expense = transactions
    .filter((item) => item.type === 'รายจ่าย')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    income,
    expense,
    balance: income - expense,
  };
}

export function buildDashboardSummary(transactions = []) {
  const today = getTodayDateString();
  const currentMonth = getCurrentMonthValue();

  const todayTransactions = transactions.filter((item) => item.date === today);
  const monthlyTransactions = transactions.filter((item) => getMonthKey(item.date) === currentMonth);

  return {
    today: calculatePeriodSummary(todayTransactions),
    month: calculatePeriodSummary(monthlyTransactions),
  };
}

export function applyTransactionFilters(transactions = [], filters = {}) {
  const normalizedSearch = filters.search?.trim().toLowerCase() || '';

  return sortTransactions(transactions).filter((item) => {
    const matchesSearch = normalizedSearch
      ? `${item.description} ${item.category}`.toLowerCase().includes(normalizedSearch)
      : true;

    const matchesType =
      !filters.type || filters.type === 'ทั้งหมด' ? true : item.type === filters.type;

    let matchesCategory = true;

    if (filters.category && filters.category !== 'ทั้งหมด') {
      if (filters.category.includes('||')) {
        const [categoryType, categoryName] = filters.category.split('||');
        matchesCategory = item.type === categoryType && item.category === categoryName;
      } else {
        matchesCategory = item.category === filters.category;
      }
    }

    let matchesPeriod = true;

    if (filters.period === 'today') {
      matchesPeriod = item.date === getTodayDateString();
    } else if (filters.period === 'thisMonth') {
      matchesPeriod = getMonthKey(item.date) === getCurrentMonthValue();
    } else if (filters.period === 'day' && filters.selectedDate) {
      matchesPeriod = item.date === filters.selectedDate;
    } else if (filters.period === 'month' && filters.selectedMonth) {
      matchesPeriod = getMonthKey(item.date) === filters.selectedMonth;
    }

    return matchesSearch && matchesType && matchesCategory && matchesPeriod;
  });
}

export function buildDailyChartData(transactions = []) {
  const sorted = [...transactions].sort((left, right) => left.date.localeCompare(right.date));
  const grouped = new Map();

  sorted.forEach((item) => {
    const current = grouped.get(item.date) || { income: 0, expense: 0 };
    if (item.type === 'รายรับ') {
      current.income += Number(item.amount || 0);
    } else {
      current.expense += Number(item.amount || 0);
    }
    grouped.set(item.date, current);
  });

  return {
    labels: [...grouped.keys()],
    incomes: [...grouped.values()].map((item) => item.income),
    expenses: [...grouped.values()].map((item) => item.expense),
  };
}

export function buildExpenseCategoryData(transactions = []) {
  const grouped = new Map();

  transactions
    .filter((item) => item.type === 'รายจ่าย')
    .forEach((item) => {
      grouped.set(item.category, (grouped.get(item.category) || 0) + Number(item.amount || 0));
    });

  const entries = [...grouped.entries()].sort((left, right) => right[1] - left[1]);

  return {
    labels: entries.map(([label]) => label),
    amounts: entries.map(([, amount]) => amount),
  };
}

function buildRecentMonthKeys(count = 6) {
  const months = [];
  const cursor = new Date();
  cursor.setDate(1);

  for (let index = count - 1; index >= 0; index -= 1) {
    const current = new Date(cursor.getFullYear(), cursor.getMonth() - index, 1);
    months.push(formatMonthInputValue(current));
  }

  return months;
}

export function buildMonthlySummaryData(transactions = [], monthCount = 6) {
  const monthKeys = buildRecentMonthKeys(monthCount);
  const grouped = new Map(
    monthKeys.map((monthKey) => [monthKey, { income: 0, expense: 0 }]),
  );

  transactions.forEach((item) => {
    const monthKey = getMonthKey(item.date);
    if (!grouped.has(monthKey)) {
      return;
    }

    const current = grouped.get(monthKey);
    if (item.type === 'รายรับ') {
      current.income += Number(item.amount || 0);
    } else {
      current.expense += Number(item.amount || 0);
    }
  });

  return {
    labels: [...grouped.keys()],
    incomes: [...grouped.values()].map((item) => item.income),
    expenses: [...grouped.values()].map((item) => item.expense),
  };
}
