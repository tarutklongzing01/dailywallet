import { Link } from 'react-router-dom';

function AuthLayout({
  eyebrow,
  title,
  description,
  alternateLabel,
  alternateHref,
  alternateText,
  children,
}) {
  return (
    <div className="auth-page">
      <div className="auth-page__backdrop auth-page__backdrop--one" />
      <div className="auth-page__backdrop auth-page__backdrop--two" />

      <section className="auth-hero">
        <div className="auth-hero__badge">{eyebrow}</div>
        <h1>รายรับรายจ่ายประจำวัน</h1>
        <p>
          เก็บทุกการใช้จ่ายให้อยู่ในที่เดียว ดูยอดวันนี้ ยอดเดือนนี้ และแนวโน้มย้อนหลังได้แบบเข้าใจง่าย
        </p>

        <div className="auth-hero__cards">
          <article className="glass-card">
            <span>จัดการง่าย</span>
            <strong>บันทึกได้ในไม่กี่วินาที</strong>
          </article>
          <article className="glass-card">
            <span>สรุปชัด</span>
            <strong>มีทั้งกราฟ รายวัน และรายเดือน</strong>
          </article>
          <article className="glass-card">
            <span>ปลอดภัย</span>
            <strong>ข้อมูลแยกตามผู้ใช้ด้วย Firebase</strong>
          </article>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card__header">
          <span className="section-pill">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        {children}

        <div className="auth-card__footer">
          <span>{alternateLabel}</span>
          <Link to={alternateHref}>{alternateText}</Link>
        </div>
      </section>
    </div>
  );
}

export default AuthLayout;
