import { useEffect, useState } from 'react';
import { updateProfile } from 'firebase/auth';
import AppShell from '../components/AppShell';
import LoadingScreen from '../components/LoadingScreen';
import { auth } from '../config/firebase-config';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useUserCategories } from '../hooks/useUserCategories';
import { useUserTransactions } from '../hooks/useUserTransactions';
import mockCategories from '../data/mock-categories.json';
import mockTransactions from '../data/mock-transactions.json';
import { createCategory } from '../services/categoryService';
import { updateUserProfileData } from '../services/profileService';
import { seedMockTransactions } from '../services/transactionService';
import { formatDateTimeThai } from '../utils/date';
import { getFirebaseErrorMessage } from '../utils/firebaseError';

function ProfilePage() {
  const toast = useToast();
  const { user, profile } = useAuth();
  const { categories, loading: categoriesLoading } = useUserCategories(user?.uid);
  const { transactions } = useUserTransactions(user?.uid);
  const [displayName, setDisplayName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    type: 'รายจ่าย',
    name: '',
  });
  const [seedingMock, setSeedingMock] = useState(false);
  const [seedingCategories, setSeedingCategories] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.displayName || user?.displayName || '');
  }, [profile?.displayName, user?.displayName]);

  const handleProfileSave = async (event) => {
    event.preventDefault();

    if (!displayName.trim()) {
      toast.error('กรุณากรอกชื่อที่ใช้แสดง');
      return;
    }

    setSavingProfile(true);

    try {
      await Promise.all([
        updateProfile(auth.currentUser, {
          displayName: displayName.trim(),
        }),
        updateUserProfileData(user.uid, {
          displayName: displayName.trim(),
        }),
      ]);

      toast.success('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddCategory = async (event) => {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      toast.error('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    setAddingCategory(true);

    try {
      await createCategory({
        uid: user.uid,
        type: categoryForm.type,
        name: categoryForm.name,
      });

      setCategoryForm((current) => ({
        ...current,
        name: '',
      }));
      toast.success('เพิ่มหมวดหมู่เรียบร้อยแล้ว');
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSeedTransactions = async () => {
    setSeedingMock(true);

    try {
      await seedMockTransactions(user.uid, mockTransactions);
      toast.success('เพิ่มข้อมูลตัวอย่างเรียบร้อยแล้ว');
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    } finally {
      setSeedingMock(false);
    }
  };

  const handleSeedCategories = async () => {
    setSeedingCategories(true);

    try {
      await Promise.all(
        mockCategories.map((item) =>
          createCategory({
            uid: user.uid,
            type: item.type,
            name: item.name,
          }),
        ),
      );

      toast.success('เพิ่มหมวดหมู่แนะนำเรียบร้อยแล้ว');
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    } finally {
      setSeedingCategories(false);
    }
  };

  return (
    <AppShell title="โปรไฟล์และการตั้งค่า" subtitle="จัดการข้อมูลบัญชี หมวดหมู่ และข้อมูลทดสอบของระบบ">
      <section className="profile-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h2>ข้อมูลบัญชี</h2>
              <p>อัปเดตชื่อที่ใช้แสดงและตรวจสอบข้อมูลการเข้าสู่ระบบของคุณ</p>
            </div>
          </div>

          <form className="form-card form-card--compact" onSubmit={handleProfileSave}>
            <label className="field">
              <span>ชื่อที่ใช้แสดง</span>
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </label>

            <div className="profile-meta">
              <div>
                <span>อีเมล</span>
                <strong>{user?.email}</strong>
              </div>
              <div>
                <span>วิธีเข้าสู่ระบบ</span>
                <strong>{profile?.provider || '-'}</strong>
              </div>
              <div>
                <span>สร้างบัญชีเมื่อ</span>
                <strong>{formatDateTimeThai(profile?.createdAt)}</strong>
              </div>
              <div>
                <span>อัปเดตล่าสุด</span>
                <strong>{formatDateTimeThai(profile?.updatedAt)}</strong>
              </div>
            </div>

            <button type="submit" className="button button--primary" disabled={savingProfile}>
              {savingProfile ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
            </button>
          </form>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h2>จัดการหมวดหมู่</h2>
              <p>เพิ่มหมวดหมู่ใหม่ได้ง่าย และระบบจะนำไปใช้ในฟอร์มเพิ่ม/แก้ไขรายการทันที</p>
            </div>
          </div>

          {categoriesLoading ? (
            <LoadingScreen title="กำลังโหลดหมวดหมู่" message="ระบบกำลังดึงข้อมูลหมวดหมู่ของคุณ" />
          ) : (
            <>
              <form className="inline-form" onSubmit={handleAddCategory}>
                <label className="field">
                  <span>ประเภท</span>
                  <select
                    value={categoryForm.type}
                    onChange={(event) =>
                      setCategoryForm((current) => ({
                        ...current,
                        type: event.target.value,
                      }))
                    }
                  >
                    <option value="รายรับ">รายรับ</option>
                    <option value="รายจ่าย">รายจ่าย</option>
                  </select>
                </label>

                <label className="field">
                  <span>ชื่อหมวดหมู่</span>
                  <input
                    type="text"
                    placeholder="เช่น การศึกษา, โบนัส, สุขภาพ"
                    value={categoryForm.name}
                    onChange={(event) =>
                      setCategoryForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </label>

                <button type="submit" className="button button--secondary" disabled={addingCategory}>
                  {addingCategory ? 'กำลังเพิ่ม...' : 'เพิ่มหมวดหมู่'}
                </button>
              </form>

              <div className="category-columns">
                <div className="category-column">
                  <h3>หมวดหมู่รายรับ</h3>
                  <ul className="chip-list">
                    {categories
                      .filter((category) => category.type === 'รายรับ')
                      .map((category) => (
                        <li key={category.id} className="chip chip--income">
                          {category.name}
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="category-column">
                  <h3>หมวดหมู่รายจ่าย</h3>
                  <ul className="chip-list">
                    {categories
                      .filter((category) => category.type === 'รายจ่าย')
                      .map((category) => (
                        <li key={category.id} className="chip chip--expense">
                          {category.name}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </article>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <h2>ข้อมูลทดสอบและการเริ่มต้นเร็ว</h2>
            <p>ใช้ปุ่มด้านล่างเพื่อเติม mock data สำหรับทดลอง dashboard และกราฟได้ทันที</p>
          </div>
        </div>

        <div className="seed-tools">
          <div className="seed-tool">
            <span>ข้อมูลรายการตัวอย่าง</span>
            <strong>ปัจจุบันมี {transactions.length} รายการ</strong>
            <p>จะเพิ่มรายการตัวอย่างอีกชุดลงใน Firestore ของผู้ใช้ปัจจุบัน</p>
            <button type="button" className="button button--primary" onClick={handleSeedTransactions} disabled={seedingMock}>
              {seedingMock ? 'กำลังเพิ่มข้อมูล...' : 'เพิ่มข้อมูลตัวอย่าง'}
            </button>
          </div>

          <div className="seed-tool">
            <span>หมวดหมู่แนะนำเพิ่มเติม</span>
            <strong>ปัจจุบันมี {categories.length} หมวดหมู่</strong>
            <p>เหมาะสำหรับทดลองฟิลเตอร์และดูสัดส่วนค่าใช้จ่ายหลายหมวด</p>
            <button
              type="button"
              className="button button--secondary"
              onClick={handleSeedCategories}
              disabled={seedingCategories}
            >
              {seedingCategories ? 'กำลังเพิ่มหมวดหมู่...' : 'เพิ่มหมวดหมู่แนะนำ'}
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default ProfilePage;
