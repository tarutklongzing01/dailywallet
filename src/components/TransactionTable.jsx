import { Link } from 'react-router-dom';
import { TRANSACTION_TYPES } from '../constants/categories';
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
          {transactions.map((item) => {
            const isIncome = item.type === TRANSACTION_TYPES[0];

            return (
              <tr key={item.id}>
                <td data-label="วันที่">{formatDateThai(item.date)}</td>
                <td data-label="ประเภท">
                  <span className={`type-badge ${isIncome ? 'is-income' : 'is-expense'}`}>{item.type}</span>
                </td>
                <td data-label="หมวดหมู่">{item.category}</td>
                <td data-label="รายละเอียด">
                  <div className="transaction-table__detail">
                    <span>{item.description}</span>
                    {item.receiptImageUrl ? (
                      <a
                        href={item.receiptImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link transaction-table__receipt"
                      >
                        ดูสลิป
                      </a>
                    ) : null}
                  </div>
                </td>
                <td data-label="จำนวนเงิน" className={isIncome ? 'text-income' : 'text-expense'}>
                  {isIncome ? '+' : '-'}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
