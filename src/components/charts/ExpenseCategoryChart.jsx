import { Doughnut } from 'react-chartjs-2';
import '../../utils/chartSetup';
import EmptyState from '../EmptyState';
import { buildExpenseCategoryData } from '../../utils/transactionStats';

const piePalette = ['#d95d39', '#f18805', '#1f8a70', '#28536b', '#6c757d', '#ffd166', '#4d9de0'];

function ExpenseCategoryChart({ transactions }) {
  const chartData = buildExpenseCategoryData(transactions);

  if (!chartData.labels.length) {
    return (
      <EmptyState
        title="ยังไม่มีรายจ่ายในช่วงนี้"
        description="เมื่อมีข้อมูลรายจ่าย ระบบจะแสดงสัดส่วนหมวดหมู่ให้อัตโนมัติ"
      />
    );
  }

  const textColor =
    getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#5e6978';

  return (
    <Doughnut
      data={{
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.amounts,
            backgroundColor: piePalette,
            borderWidth: 0,
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
        cutout: '62%',
      }}
    />
  );
}

export default ExpenseCategoryChart;
