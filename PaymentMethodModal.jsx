export default function PaymentMethodModal({ onClose, onCard, onCash }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: "300px" }}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Select Payment Method</h2>

        <button className="ok-btn" onClick={onCard}>
          Pay by Card
        </button>

        <button
          className="ok-btn"
          style={{ background: "#444", marginTop: "10px" }}
          onClick={onCash}
        >
          Pay by Cash
        </button>
      </div>
    </div>
  );
}
