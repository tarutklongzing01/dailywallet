import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { logoutUser } from '../services/authService';
import { getFirebaseErrorMessage } from '../utils/firebaseError';

function UserMenu() {
  const navigate = useNavigate();
  const toast = useToast();
  const { profile, user } = useAuth();

  const name = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'ผู้ใช้';
  const initial = name.slice(0, 1).toUpperCase();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('ออกจากระบบเรียบร้อยแล้ว');
      navigate('/login');
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    }
  };

  return (
    <div className="user-menu">
      <Link to="/profile" className="user-menu__profile">
        <span className="user-menu__avatar">{initial}</span>
        <span className="user-menu__meta">
          <strong>{name}</strong>
          <small>{user?.email}</small>
        </span>
      </Link>

      <button type="button" className="button button--ghost" onClick={handleLogout}>
        ออกจากระบบ
      </button>
    </div>
  );
}

export default UserMenu;
