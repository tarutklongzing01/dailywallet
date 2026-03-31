import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import FilterBar from '../components/FilterBar';
import LoadingScreen from '../components/LoadingScreen';
import SummaryCard from '../components/SummaryCard';
import TransactionTable from '../components/TransactionTable';
import DailyIncomeExpenseChart from '../components/charts/DailyIncomeExpenseChart';
import ExpenseCategoryChart from '../components/charts/ExpenseCategoryChart';
import MonthlySummaryChart from '../components/charts/MonthlySummaryChart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useUserCategories } from '../hooks/useUserCategories';
import { useUserTransactions } from '../hooks/useUserTransactions';
import { deleteReceiptImage } from '../services/storageService';
import { deleteTransaction } from '../services/transactionService';
import { exportTransactionsToCsv } from '../utils/csv';
import { getCurrentMonthValue, getTodayDateString } from '../utils/date';
import { getFirebaseErrorMessage } from '../utils/firebaseError';
import { applyTransactionFilters, buildDashboardSummary } from '../utils/transactionStats';

const initialFilters = {
  search: '',
  period: 'all',
  selectedDate: getTodayDateString(),
  selectedMonth: getCurrentMonthValue(),
  type: 'ทั้งหมด',
  category: 'ทั้งหมด',
};

function DashboardPage() {
  const { error: showError, info, success } = useToast();
  const { user, profile } = useAuth();
  const { categories, loading: categoriesLoading, error: categoriesError } = useUserCategories(user?.uid);
  const { transactions, loading: transactionsLoading, error: transactionsError } = useUserTransactions(user?.uid);
  const [filters, setFilters] = useState(initialFilters);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const categoryErrorKeyRef = useRef('');
  const transactionErrorKeyRef = useRef('');

  useEffect(() => {
    const errorKey = categoriesError?.code || categoriesError?.message || '';

    if (!errorKey) {
      categoryErrorKeyRef.current = '';
      return;
    }

    if (categoryErrorKeyRef.current !== errorKey) {
      showError(getFirebaseErrorMessage(categoriesError));
      categoryErrorKeyRef.current = errorKey;
    }
  }, [categoriesError, showError]);

  useEffect(() => {
    const errorKey = transactionsError?.code || transactionsError?.message || '';

    if (!errorKey) {
      transactionErrorKeyRef.current = '';
      return;
    }

    if (transactionErrorKeyRef.current !== errorKey) {
      showError(getFirebaseErrorMessage(transactionsError));
      transactionErrorKeyRef.current = errorKey;
    }
  }, [transactionsError, showError]);

  if (categoriesLoading || transactionsLoading) {
    return (
      <AppShell title="Dashboard" subtitle="กำลังโหลดข้อมูลของคุณ">
        <LoadingScreen title="กำลังดึงข้อมูลรายรับรายจ่าย" message="อีกไม่นานคุณจะเห็นภาพรวมทั้งหมด" />
      </AppShell>
    );
  }

  const summary = buildDashboardSummary(transactions);
  const filteredTransactions = applyTransactionFilters(transactions, filters);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === 'type' ? { category: 'ทั้งหมด' } : {}),
    }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleExportCsv = () => {
    if (!filteredTransactions.length) {
      info('ไม่มีข้อมูลที่ตรงกับตัวกรองสำหรับ export');
      return;
    }

    exportTransactionsToCsv(filteredTransactions);
    success('สร้างไฟล์ CSV เรียบร้อยแล้ว');
  };

  const handleDelete = async () => {
    if (!itemToDelete) {
      return;
    }

    setDeleting(true);

    try {
      await deleteTransaction(itemToDelete.id);

      if (itemToDelete.receiptImagePath) {
        try {
          await deleteReceiptImage(itemToDelete.receiptImagePath);
        } catch {
          info('ลบรายการแล้ว แต่ลบรูปสลิปไม่สำเร็จ');
        }
      }

      success('ลบรายการเรียบร้อยแล้ว');
      setItemToDelete(null);
    } catch (error) {
      showError(getFirebaseErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const greetingName = profile?.displayName || user?.displayName || 'ผู้ใช้งาน';

  return (
    <AppShell
      title={`สวัสดี ${greetingName}`}
      subtitle="ภาพรวมรายรับรายจ่ายวันนี้ เดือนนี้ และรายการย้อนหลังของบัญชีคุณ"
      actions={
        <>
          <button type="button" className="button button--secondary" onClick={handleExportCsv}>
            Export CSV
          </button>
          <Link to="/transactions/new" className="button button--primary">
            เพิ่มรายการใหม่
          </Link>
        </>
      }
    >
      <section className="summary-grid">
        <SummaryCard label="รายรับวันนี้" value={summary.today.income} accent="income" hint="เฉพาะวันที่เลือกวันนี้" />
        <SummaryCard label="รายจ่ายวันนี้" value={summary.today.expense} accent="expense" hint="รวมทุกรายการของวันนี้" />
        <SummaryCard label="คงเหลือวันนี้" value={summary.today.balance} accent="neutral" hint="รายรับ - รายจ่าย" />
        <SummaryCard label="รายรับเดือนนี้" value={summary.month.income} accent="income" hint="เฉพาะเดือนปัจจุบัน" />
        <SummaryCard label="รายจ่ายเดือนนี้" value={summary.month.expense} accent="expense" hint="รวมทั้งหมดในเดือนนี้" />
        <SummaryCard label="คงเหลือเดือนนี้" value={summary.month.balance} accent="neutral" hint="ดูแนวโน้มได้จากกราฟด้านล่าง" />
      </section>

      <FilterBar
        filters={filters}
        categories={categories}
        resultCount={filteredTransactions.length}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <section className="chart-grid">
        <article className="panel chart-panel">
          <div className="panel__header">
            <div>
              <h2>กราฟรายรับ/รายจ่ายรายวัน</h2>
              <p>ดูแนวโน้มรายวันจากข้อมูลที่ผ่านฟิลเตอร์ปัจจุบัน</p>
            </div>
          </div>
          <div className="chart-canvas">
            <DailyIncomeExpenseChart transactions={filteredTransactions} />
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="panel__header">
            <div>
              <h2>สัดส่วนหมวดหมู่รายจ่าย</h2>
              <p>ช่วยมองเห็นว่าค่าใช้จ่ายส่วนใหญ่ไปอยู่ที่หมวดไหน</p>
            </div>
          </div>
          <div className="chart-canvas">
            <ExpenseCategoryChart transactions={filteredTransactions} />
          </div>
        </article>

        <article className="panel chart-panel chart-panel--wide">
          <div className="panel__header">
            <div>
              <h2>สรุปยอดรายเดือน</h2>
              <p>แสดงแนวโน้มรายรับและรายจ่ายย้อนหลัง 6 เดือนล่าสุด</p>
            </div>
          </div>
          <div className="chart-canvas">
            <MonthlySummaryChart transactions={transactions} />
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <h2>รายการล่าสุด</h2>
            <p>จัดการแก้ไข ลบ และย้อนดูรายการที่เคยบันทึกไว้ได้จากส่วนนี้</p>
          </div>
        </div>

        {filteredTransactions.length ? (
          <TransactionTable transactions={filteredTransactions} onRequestDelete={setItemToDelete} />
        ) : (
          <EmptyState
            title="ยังไม่มีรายการที่ตรงกับตัวกรอง"
            description="ลองเปลี่ยนฟิลเตอร์ หรือเริ่มต้นเพิ่มรายการรายรับรายจ่ายใหม่"
            action={
              <Link to="/transactions/new" className="button button--primary">
                เพิ่มรายการแรก
              </Link>
            }
          />
        )}
      </section>

      <ConfirmModal
        open={Boolean(itemToDelete)}
        title="ยืนยันการลบรายการ"
        description={
          itemToDelete
            ? `คุณต้องการลบรายการ "${itemToDelete.description}" ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้`
            : ''
        }
        confirmLabel="ลบรายการ"
        cancelLabel="ยกเลิก"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </AppShell>
  );
}

export default DashboardPage;
