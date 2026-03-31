import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useToast } from '../hooks/useToast';
import { loginWithEmail, loginWithGoogle } from '../services/authService';
import { getFirebaseErrorMessage } from '../utils/firebaseError';
import { hasErrors, validateLoginForm } from '../utils/validation';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [values, setValues] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectPath = location.state?.from?.pathname || '/dashboard';

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
    const nextErrors = validateLoginForm(values);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    setLoading(true);

    try {
      await loginWithEmail(values);
      toast.success('เข้าสู่ระบบสำเร็จ');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      toast.success('เข้าสู่ระบบด้วย Google สำเร็จ');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="เข้าสู่ระบบ"
      title="ยินดีต้อนรับกลับ"
      description="เข้าสู่ระบบเพื่อดู dashboard รายรับรายจ่ายของคุณแบบแยกตามบัญชีผู้ใช้"
      alternateLabel="ยังไม่มีบัญชี?"
      alternateHref="/register"
      alternateText="สมัครสมาชิก"
    >
      <form className="form-card auth-form" onSubmit={handleSubmit}>
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
            autoComplete="current-password"
            placeholder="กรอกรหัสผ่าน"
            value={values.password}
            onChange={(event) => handleChange('password', event.target.value)}
          />
          {errors.password ? <small className="field-error">{errors.password}</small> : null}
        </label>

        <button type="submit" className="button button--primary button--full" disabled={loading}>
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>

        <button
          type="button"
          className="button button--secondary button--full"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
        >
          {googleLoading ? 'กำลังเชื่อมต่อ Google...' : 'เข้าสู่ระบบด้วย Google'}
        </button>

        <Link className="text-link" to="/register">
          ยังไม่มีบัญชี? สมัครสมาชิกที่นี่
        </Link>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
