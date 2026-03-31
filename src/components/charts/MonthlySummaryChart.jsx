import { Bar } from 'react-chartjs-2';
import '../../utils/chartSetup';
import EmptyState from '../EmptyState';
import { formatMonthThai } from '../../utils/date';
import { buildMonthlySummaryData } from '../../utils/transactionStats';

function MonthlySummaryChart({ transactions }) {
  const chartData = buildMonthlySummaryData(transactions);

  if (!chartData.labels.length) {
    return (
      <EmptyState
        title="ยังไม่มีข้อมูลรายเดือน"
        description="เมื่อมีรายการย้อนหลัง ระบบจะสรุปแนวโน้มรายเดือนให้ทันที"
      />
    );
  }

  const rootStyle = getComputedStyle(document.documentElement);
  const incomeColor = rootStyle.getPropertyValue('--color-income').trim() || '#1f8a70';
  const expenseColor = rootStyle.getPropertyValue('--color-expense').trim() || '#d95d39';
  const textColor = rootStyle.getPropertyValue('--text-secondary').trim() || '#5e6978';

  return (
    <Bar
      data={{
        labels: chartData.labels.map(formatMonthThai),
        datasets: [
          {
            label: 'รายรับ',
            data: chartData.incomes,
            backgroundColor: incomeColor,
            borderRadius: 12,
          },
          {
            label: 'รายจ่าย',
            data: chartData.expenses,
            backgroundColor: expenseColor,
            borderRadius: 12,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              usePointStyle: true,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColor,
            },
          },
          y: {
            ticks: {
              color: textColor,
            },
          },
        },
      }}
    />
  );
}

export default MonthlySummaryChart;
