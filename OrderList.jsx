import { useState, useEffect } from "react";
import "../App.css";

export default function OrderList({ order, onRemove, onEdit, onClearAll }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false); // order history modal
  const [orderHistory, setOrderHistory] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");


  // Single item remove
  const handleRemoveClick = (id, e) => {
    e.stopPropagation();
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    onRemove(selectedId);
    setConfirmOpen(false);
    setSelectedId(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setSelectedId(null);
  };

  // Clear All
  const handleClearAll = () => {
    setClearAllOpen(true);
  };

  const handleConfirmClearAll = () => {
    onClearAll();
    setClearAllOpen(false);
  };

  const handleCancelClearAll = () => {
    setClearAllOpen(false);
  };

  useEffect(() => {
  if (!historyOpen) return;

  const fetchOrderHistory = async () => {
    try {
      const url = selectedDate
        ? `http://localhost:5000/api/orders/history?date=${selectedDate}`
        : `http://localhost:5000/api/orders/history`;

      const res = await fetch(url);
      const data = await res.json();
      setOrderHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching order history:", err);
    }
  };

  fetchOrderHistory();
}, [historyOpen, selectedDate]);

  
  useEffect(() => {
  if (!historyOpen) return;

  const fetchDates = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders/dates");
      const data = await res.json();
      setDates(data);
    } catch (err) {
      console.error("Error fetching order dates:", err);
    }
  };

  fetchDates();
}, [historyOpen]);


  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Order</h2>
        <select
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  style={{
    width: "100%",
    padding: "6px",
    marginBottom: "10px"
  }}
>
  <option value="">All dates</option>
  {dates.map((d) => (
    <option key={d} value={d}>{d}</option>
  ))}
</select>


        <button
          style={{ padding: "5px 12px", background: "#555", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          onClick={() => setHistoryOpen(true)}
        >
          Order History
        </button>

        <button
          style={{ padding: "5px 12px", background: "#1976d2", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          onClick={handleClearAll}
        >
          Clear All
        </button>
      </div>

      {order.map((o) => (
        <div className="order-item" key={o.id} onClick={() => onEdit(o)}>
          <div>
            <p className="item-name">{o.name}</p>
            <p className="item-details">{o.qty} × {o.price.toFixed(2)} KM</p>
          </div>

          <button className="remove-btn" onClick={(e) => handleRemoveClick(o.id, e)}>-</button>
        </div>
      ))}

      {/* Confirmation Popups */}
      {confirmOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: "250px" }}>
            <p>Remove this item?</p>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "15px" }}>
              <button onClick={handleConfirm} style={{ background: "red", color: "white", padding: "5px 12px", borderRadius: "4px" }}>Yes</button>
              <button onClick={handleCancel} style={{ padding: "5px 12px", borderRadius: "4px" }}>No</button>
            </div>
          </div>
        </div>
      )}

      {clearAllOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: "280px" }}>
            <p>Are you sure you want to clear order?</p>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "15px" }}>
              <button onClick={handleConfirmClearAll} style={{ background: "red", color: "white", padding: "5px 12px", borderRadius: "4px" }}>Yes</button>
              <button onClick={handleCancelClearAll} style={{ padding: "5px 12px", borderRadius: "4px" }}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Order History Modal */}
      {historyOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: "400px", maxHeight: "80vh", overflowY: "auto" }}>
            <button className="close-btn" onClick={() => setHistoryOpen(false)}>×</button>
            <h2>Your Orders</h2>
            {orderHistory.length === 0 && <p>No orders yet</p>}
           {orderHistory.map((o) => {
  const date = new Date(o.createdAt);

  return (
    <div
      key={o.id}
      style={{
        marginBottom: "14px",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        background: "#fafafa"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>Order</strong>
        <span style={{ fontSize: "0.9em", color: "#555" }}>
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </span>
      </div>

      <p style={{ marginTop: "4px", color: o.status === "done" ? "green" : "orange" }}>
        Status: {o.status}
      </p>

      <hr />

      {o.items.map((item, idx) => (
        <div
          key={idx}
          style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95em" }}
        >
          <span>{item.qty} × {item.name}</span>
          <span>{(item.qty * item.price).toFixed(2)} KM</span>
        </div>
      ))}

      <hr />

      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
        <span>Total</span>
        <span>{o.total.toFixed(2)} KM</span>
      </div>
    </div>
  );
})}
          </div>
        </div>
      )}
    </>
  );
}


