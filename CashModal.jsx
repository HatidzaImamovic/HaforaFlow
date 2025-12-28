import { useState } from "react";

export default function CashModal({ total, onClose, onConfirm }) {
  const [amount, setAmount] = useState("");

  const change = amount ? (amount - total).toFixed(2) : "0.00";

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: "320px" }}>
        <button className="close-btn" onClick={onClose}>×</button>

        <h2>Cash Payment</h2>
        <p>Total: BAM {total.toFixed(2)}</p>

        <input
          type="number"
          placeholder="Amount given"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "10px" }}
        />

        {amount && (
          <p style={{ marginTop: "10px", fontWeight: "bold" }}>
            Change: BAM {change}
          </p>
        )}

        <button
          className="ok-btn"
          onClick={() => onConfirm(Number(amount))}
          disabled={Number(amount) < total}
          style={{ marginTop: "15px" }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
