import '../../styles/components/ActionButton/ActionButton.css'

export default function ActionButton({ label, sub, icon, variant = 'red', onClick }) {
  return (
    <button
      className={`action-button action-button--${variant}`}
      onClick={onClick}
    >
      <span className="action-button__icon">{icon}</span>
      <span className="action-button__label">{label}</span>
      <span className="action-button__sub">{sub}</span>
    </button>
  )
}