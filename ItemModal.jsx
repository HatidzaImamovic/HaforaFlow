import { useState } from "react";
import "../App.css";

export default function ItemModal({
  item,
  onClose,
  onConfirm,
  existingQty,
  view // "market" | "kitchen" | "restaurant"
}) {
  const [qty, setQty] = useState(existingQty || 1);

  if (!item) return null;

  const inc = () => setQty(q => q + 1);
  const dec = () => setQty(q => (q > 1 ? q - 1 : 1));

  const sendAutoMessage = (type) => {
  const messages =
    JSON.parse(localStorage.getItem("managerMessages")) || [];

  const msg =
    type === "LOW"
      ? {
          title: "Low stock",
          text: `${item.name} is low on stock`,
        }
      : {
          title: "Expired product",
          text: `${item.name} has expired`,
        };

  const updated = [
    {
      id: Date.now(),
      type: "AUTO",
      ...msg,
      productId: item.id,
      productName: item.name,
      read: false,
      createdAt: new Date().toISOString()
    },
    ...messages
  ];

  localStorage.setItem("managerMessages", JSON.stringify(updated));

  // 🔥 NOTIFY MANAGER VIEW
  window.dispatchEvent(new Event("managerMessagesUpdated"));

  onClose();
};


  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>✕</button>

        <img src={`/images/${item.image}`} alt={item.name} />
        <h2>{item.name}</h2>

        {item.details && (
          <p className="item-details-text">
            {item.details.length > 250
              ? item.details.slice(0, 250) + "..."
              : item.details}
          </p>
        )}

        <div className="qty-selector">
          <button onClick={dec}>-</button>
          <span>{qty}</span>
          <button onClick={inc}>+</button>
        </div>

        <p className="price">BAM {(item.price * qty).toFixed(2)}</p>

        <button
          className="ok-btn"
          onClick={() => onConfirm(item, qty)}
        >
          OK
        </button>

        {/* SUPERMARKET ONLY */}
        {view === "market" && (
          <div className="market-alert-buttons">
            <button
              className="warn-btn"
              onClick={() => sendAutoMessage("LOW")}
            >
              Low on stock
            </button>

            <button
              className="danger-btn"
              onClick={() => sendAutoMessage("EXPIRED")}
            >
              Expired
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
