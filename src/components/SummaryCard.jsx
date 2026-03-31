import { formatCurrency } from '../utils/currency';

function SummaryCard({ label, value, accent = 'neutral', hint }) {
  return (
    <article className={`summary-card summary-card--${accent}`}>
      <span>{label}</span>
      <strong>{formatCurrency(value)}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  );
}

export default SummaryCard;
