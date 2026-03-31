import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import LoadingScreen from '../components/LoadingScreen';
import TransactionForm from '../components/TransactionForm';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useUserCategories } from '../hooks/useUserCategories';
import { ensureCategoryExists } from '../services/categoryService';
import { getTransactionById, updateTransaction } from '../services/transactionService';
import { getFirebaseErrorMessage } from '../utils/firebaseError';

function TransactionEditPage() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { categories, loading: categoriesLoading } = useUserCategories(user?.uid);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    async function loadTransaction() {
      try {
        const transaction = await getTransactionById(transactionId);

        if (!transaction || transaction.uid !== user?.uid) {
          toast.error('ไม่พบรายการที่ต้องการแก้ไข');
          navigate('/dashboard', { replace: true });
          return;
        }

        setInitialValues({
          date: transaction.date,
          type: transaction.type,
          category: transaction.category,
          customCategory: '',
          description: transaction.description,
          amount: transaction.amount,
        });
      } catch (error) {
        toast.error(getFirebaseErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    if (user?.uid) {
      loadTransaction();
    }
  }, [navigate, toast, transactionId, user?.uid]);

  const handleSubmit = async (values) => {
    setSubmitting(true);

    try {
      await ensureCategoryExists(user.uid, values.type, values.category);
      await updateTransaction(transactionId, user.uid, values);
      toast.success('อัปเดตรายการเรียบร้อยแล้ว');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="แก้ไขรายการ"
      subtitle="ปรับรายละเอียดรายการเดิม แล้วบันทึกกลับเข้าสู่ระบบ"
      actions={
        <Link to="/dashboard" className="button button--ghost">
          กลับไป Dashboard
        </Link>
      }
    >
      {loading || categoriesLoading || !initialValues ? (
        <LoadingScreen title="กำลังโหลดรายการ" message="ระบบกำลังดึงข้อมูลเดิมมาแสดงในฟอร์ม" />
      ) : (
        <TransactionForm
          initialValues={initialValues}
          categories={categories}
          submitting={submitting}
          submitLabel="บันทึกการแก้ไข"
          onSubmit={handleSubmit}
        />
      )}
    </AppShell>
  );
}

export default TransactionEditPage;
