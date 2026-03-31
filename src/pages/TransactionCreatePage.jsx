import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import LoadingScreen from '../components/LoadingScreen';
import TransactionForm from '../components/TransactionForm';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useUserCategories } from '../hooks/useUserCategories';
import { ensureCategoryExists } from '../services/categoryService';
import { deleteReceiptImage, uploadReceiptImage } from '../services/storageService';
import { createTransaction } from '../services/transactionService';
import { getFirebaseErrorMessage } from '../utils/firebaseError';

function TransactionCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { categories, loading } = useUserCategories(user?.uid);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    let uploadedReceipt = null;

    try {
      if (values.receiptFile) {
        uploadedReceipt = await uploadReceiptImage(user.uid, values.receiptFile);
      }

      await ensureCategoryExists(user.uid, values.type, values.category);
      await createTransaction(user.uid, {
        ...values,
        receiptImageUrl: uploadedReceipt?.url || '',
        receiptImagePath: uploadedReceipt?.path || '',
      });

      toast.success('เพิ่มรายการเรียบร้อยแล้ว');
      navigate('/dashboard');
    } catch (error) {
      if (uploadedReceipt?.path) {
        await deleteReceiptImage(uploadedReceipt.path);
      }

      toast.error(getFirebaseErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="เพิ่มรายการใหม่"
      subtitle="บันทึกรายรับหรือรายจ่าย พร้อมแนบรูปสลิปและอ่านข้อมูลอัตโนมัติได้"
      actions={
        <Link to="/dashboard" className="button button--ghost">
          กลับไป Dashboard
        </Link>
      }
    >
      {loading ? (
        <LoadingScreen title="กำลังโหลดหมวดหมู่" message="ระบบกำลังเตรียมฟอร์มบันทึกข้อมูลให้คุณ" />
      ) : (
        <TransactionForm
          categories={categories}
          submitting={submitting}
          onSubmit={handleSubmit}
          submitLabel="บันทึกรายการ"
        />
      )}
    </AppShell>
  );
}

export default TransactionCreatePage;
