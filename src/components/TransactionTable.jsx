import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { formatDateThai } from '../utils/date';

function TransactionTable({ transactions, onRequestDelete }) {
  return (
    <div className="table-wrap">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>วันที่</th>
            <th>ประเภท</th>
            <th>หมวดหมู่</th>
            <th>รายละเอียด</th>
            <th>จำนวนเงิน</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((item) => (
            <tr key={item.id}>
              <td data-label="วันที่">{formatDateThai(item.date)}</td>
              <td data-label="ประเภท">
                <span className={`type-badge ${item.type === 'รายรับ' ? 'is-income' : 'is-expense'}`}>
                  {item.type}
                </span>
              </td>
              <td data-label="หมวดหมู่">{item.category}</td>
              <td data-label="รายละเอียด">{item.description}</td>
              <td data-label="จำนวนเงิน" className={item.type === 'รายรับ' ? 'text-income' : 'text-expense'}>
                {item.type === 'รายรับ' ? '+' : '-'}
                {formatCurrency(item.amount)}
              </td>
              <td data-label="จัดการ">
                <div className="table-actions">
                  <Link className="button button--ghost" to={`/transactions/${item.id}/edit`}>
                    แก้ไข
                  </Link>
                  <button
                    type="button"
                    className="button button--danger button--soft"
                    onClick={() => onRequestDelete(item)}
                  >
                    ลบ
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
