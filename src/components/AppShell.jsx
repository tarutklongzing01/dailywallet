import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', mobileLabel: 'หน้าแรก' },
  { to: '/transactions/new', label: 'เพิ่มรายการ', mobileLabel: 'เพิ่ม' },
  { to: '/profile', label: 'โปรไฟล์', mobileLabel: 'โปรไฟล์' },
];

function AppShell({ title, subtitle, actions, children }) {
  return (
    <div className="app-shell">
      <div className="app-shell__ambient app-shell__ambient--top" />
      <div className="app-shell__ambient app-shell__ambient--bottom" />

      <aside className="app-sidebar">
        <Link to="/dashboard" className="brand-mark">
          <span className="brand-mark__icon">+</span>
          <div>
            <strong>Daily Money Flow</strong>
            <small>รายรับรายจ่ายประจำวัน</small>
          </div>
        </Link>

        <nav className="nav-list" aria-label="เมนูหลัก">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-list__item ${isActive ? 'is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar__footer">
          <p>ออกแบบให้ใช้งานง่ายทั้งมือถือและคอม พร้อม dark mode และ export CSV</p>
        </div>
      </aside>

      <div className="app-shell__main">
        <header className="page-header">
          <div>
            <span className="section-pill">ภาพรวมการเงิน</span>
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>

          <div className="page-header__actions">
            {actions}
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <main className="page-content">{children}</main>

        <nav className="mobile-nav" aria-label="เมนูมือถือ">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `mobile-nav__item ${isActive ? 'is-active' : ''}`}
            >
              <span className="mobile-nav__label">{item.mobileLabel || item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default AppShell;
