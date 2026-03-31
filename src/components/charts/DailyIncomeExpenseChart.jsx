import { Line } from 'react-chartjs-2';
import '../../utils/chartSetup';
import EmptyState from '../EmptyState';
import { formatDateThai } from '../../utils/date';
import { buildDailyChartData } from '../../utils/transactionStats';

function DailyIncomeExpenseChart({ transactions }) {
  const chartData = buildDailyChartData(transactions);

  if (!chartData.labels.length) {
    return (
      <EmptyState
        title="ยังไม่มีข้อมูลกราฟรายวัน"
        description="เพิ่มรายการอย่างน้อย 1 รายการเพื่อดูแนวโน้มรายรับและรายจ่าย"
      />
    );
  }

  const rootStyle = getComputedStyle(document.documentElement);
  const incomeColor = rootStyle.getPropertyValue('--color-income').trim() || '#1f8a70';
  const expenseColor = rootStyle.getPropertyValue('--color-expense').trim() || '#d95d39';
  const textColor = rootStyle.getPropertyValue('--text-secondary').trim() || '#5e6978';

  return (
    <Line
      data={{
        labels: chartData.labels.map(formatDateThai),
        datasets: [
          {
            label: 'รายรับ',
            data: chartData.incomes,
            borderColor: incomeColor,
            backgroundColor: `${incomeColor}33`,
            fill: true,
            tension: 0.35,
          },
          {
            label: 'รายจ่าย',
            data: chartData.expenses,
            borderColor: expenseColor,
            backgroundColor: `${expenseColor}22`,
            fill: true,
            tension: 0.35,
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

export default DailyIncomeExpenseChart;
