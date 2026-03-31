import { useTheme } from '../hooks/useTheme';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme}>
      <span className="theme-toggle__icon">{theme === 'light' ? '☀' : '☾'}</span>
      <span>{theme === 'light' ? 'โหมดมืด' : 'โหมดสว่าง'}</span>
    </button>
  );
}

export default ThemeToggle;
