import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="panel not-found-card">
        <span className="section-pill">404</span>
        <h1>ไม่พบหน้าที่คุณต้องการ</h1>
        <p>ลิงก์ที่เปิดอยู่อาจไม่ถูกต้อง หรือหน้าถูกย้ายตำแหน่งไปแล้ว</p>
        <div className="button-row">
          <Link to="/dashboard" className="button button--primary">
            กลับไป Dashboard
          </Link>
          <Link to="/login" className="button button--ghost">
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
