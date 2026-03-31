import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useToast } from '../hooks/useToast';
import { registerWithEmail } from '../services/authService';
import { getFirebaseErrorMessage } from '../utils/firebaseError';
import { hasErrors, validateRegisterForm } from '../utils/validation';

function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [values, setValues] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, nextValue) => {
    setValues((current) => ({
      ...current,
      [field]: nextValue,
    }));
    setErrors((current) => ({
      ...current,
      [field]: '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateRegisterForm(values);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    setLoading(true);

    try {
      await registerWithEmail(values);
      toast.success('สมัครสมาชิกสำเร็จ พร้อมเริ่มใช้งานได้ทันที');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="สมัครสมาชิก"
      title="เริ่มต้นใช้งานในไม่กี่นาที"
      description="สร้างบัญชีใหม่เพื่อบันทึกข้อมูลรายรับรายจ่ายแบบแยกตามผู้ใช้ และดูสรุปผลย้อนหลังได้ทันที"
      alternateLabel="มีบัญชีอยู่แล้ว?"
      alternateHref="/login"
      alternateText="กลับไปหน้าเข้าสู่ระบบ"
    >
      <form className="form-card auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>ชื่อที่ใช้แสดง</span>
          <input
            type="text"
            placeholder="เช่น ณิชา, ทีมบัญชี, My Finance"
            value={values.displayName}
            onChange={(event) => handleChange('displayName', event.target.value)}
          />
          {errors.displayName ? <small className="field-error">{errors.displayName}</small> : null}
        </label>

        <label className="field">
          <span>อีเมล</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={values.email}
            onChange={(event) => handleChange('email', event.target.value)}
          />
          {errors.email ? <small className="field-error">{errors.email}</small> : null}
        </label>

        <label className="field">
          <span>รหัสผ่าน</span>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="อย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข"
            value={values.password}
            onChange={(event) => handleChange('password', event.target.value)}
          />
          {errors.password ? <small className="field-error">{errors.password}</small> : null}
        </label>

        <label className="field">
          <span>ยืนยันรหัสผ่าน</span>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            value={values.confirmPassword}
            onChange={(event) => handleChange('confirmPassword', event.target.value)}
          />
          {errors.confirmPassword ? <small className="field-error">{errors.confirmPassword}</small> : null}
        </label>

        <button type="submit" className="button button--primary button--full" disabled={loading}>
          {loading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
        </button>

        <p className="auth-form__help">
          หลังสมัครเสร็จ ระบบจะพาเข้าหน้า dashboard และสร้างหมวดหมู่พื้นฐานให้อัตโนมัติ
        </p>
        <Link className="text-link" to="/login">
          มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
        </Link>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
