import './Toast.css';

export default function Toast({ message, tone = 'success' }) {
  return (
    <div className={`toast toast-${tone}`} role="status">
      <span className="toast-icon">{tone === 'success' ? '✓' : '!'}</span>
      {message}
    </div>
  );
}
