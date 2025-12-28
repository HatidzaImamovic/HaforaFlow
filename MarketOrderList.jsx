import { useState, useEffect } from "react";
import "../App.css";

export default function MarketOrderList({ order, onRemove, onEdit, onClearAll }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  // --- Purchase History Modal ---
  const [historyOpen, setHistoryOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);

  const [dates, setDates] = useState([]);      // all available purchase dates
  const [selectedDate, setSelectedDate] = useState(""); // selected date filter
  const [dailyTotal, setDailyTotal] = useState("0.00");

  const todayDate = new Date().toISOString().split("T")[0];
const [calendarOpen, setCalendarOpen] = useState(false);


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

    const fetchDates = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/market/history/dates");
        const data = await res.json();
        setDates(data);
      } catch (err) {
        console.error("Failed fetching purchase dates:", err);
      }
    };

    fetchDates();
  }, [historyOpen]);

  useEffect(() => {
  if (!historyOpen) return;

  const dateToUse = selectedDate || todayDate;

  const fetchHistory = async () => {
    try {
      const url = `http://localhost:5000/api/market/history?date=${dateToUse}`;

      const res = await fetch(url);
      const data = await res.json();

      setOrderHistory(data);

      const total = data.reduce((sum, order) => sum + Number(order.total), 0);
      setDailyTotal(total.toFixed(2));
    } catch (err) {
      console.error("Failed fetching purchase history:", err);
    }
  };

  fetchHistory();
}, [selectedDate, historyOpen]);


  return (
    <>
      {/* HEADER BUTTONS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Purchases</h2>

        <button
          style={{
            padding: "5px 12px",
            background: "#555",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => {
  setSelectedDate(todayDate);
  setHistoryOpen(true);
}}

        >
          Purchase History
        </button>

        <button
          style={{
            padding: "5px 12px",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={handleClearAll}
        >
          Clear All
        </button>
      </div>

      {/* CURRENT ORDER LIST */}
      {order.map((o) => (
        <div className="order-item" key={o.id} onClick={() => onEdit(o)}>
          <div>
            <p className="item-name">{o.name}</p>
            <p className="item-details">
              {o.qty} × {o.price.toFixed(2)} KM
            </p>
          </div>

          <button className="remove-btn" onClick={(e) => handleRemoveClick(o.id, e)}>
            -
          </button>
        </div>
      ))}

      {/* ---------------------------------------------
          REMOVE SINGLE ITEM CONFIRMATION
      -----------------------------------------------*/}
      {confirmOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: "250px" }}>
            <p>Remove this item?</p>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "15px" }}>
              <button
                onClick={handleConfirm}
                style={{ background: "red", color: "white", padding: "5px 12px", borderRadius: "4px" }}
              >
                Yes
              </button>
              <button onClick={handleCancel} style={{ padding: "5px 12px", borderRadius: "4px" }}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------
          CLEAR ALL CONFIRMATION
      -----------------------------------------------*/}
      {clearAllOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: "280px" }}>
            <p>Are you sure you want to clear order?</p>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "15px" }}>
              <button
                onClick={handleConfirmClearAll}
                style={{ background: "red", color: "white", padding: "5px 12px", borderRadius: "4px" }}
              >
                Yes
              </button>
              <button onClick={handleCancelClearAll} style={{ padding: "5px 12px", borderRadius: "4px" }}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------
          PURCHASE HISTORY MODAL
      -----------------------------------------------*/}
      {historyOpen && (
  <div className="modal-overlay">
    <div
      className="modal-box"
      style={{ width: "420px", maxHeight: "80vh", overflowY: "auto", position: "relative" }}
    >
      <button className="close-btn" onClick={() => setHistoryOpen(false)}>×</button>

      <h2>Purchase History</h2>

      {/* DATE PICKER BUTTON */}
      <label><strong>Select Date:</strong></label>
      <button
        onClick={() => setCalendarOpen(true)}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "6px",
          margin: "6px 0 12px 0",
          border: "1px solid #ccc",
          background: "white",
          cursor: "pointer",
          textAlign: "left"
        }}
      >
        {selectedDate || todayDate}
      </button>

      {/* SMALL CALENDAR POPUP */}
      {calendarOpen && (
        <div
          style={{
            position: "absolute",
            top: "120px",
            left: "0",
            background: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            zIndex: 999
          }}
        >
          <input
            type="date"
  value={selectedDate || todayDate}
  onChange={(e) => {
    setSelectedDate(e.target.value);
    setCalendarOpen(false);
  }}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              width: "180px"
            }}
          />
        </div>
      )}

      <p style={{ marginBottom: "15px" }}>
        <strong>Total Sales for {selectedDate || todayDate}:</strong> BAM {dailyTotal}
      </p>

      {orderHistory.length === 0 && <p>No purchases found.</p>}

      {orderHistory.map((o) => (
        <div
          key={o.id}
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            marginBottom: "10px",
          }}
        >
          <div>
            {o.items.map((item, index) => (
              <p key={index}>
                {item.qty} × {item.name}
              </p>
            ))}
          </div>

          <p><strong>Total:</strong> BAM {o.total.toFixed(2)}</p>

          <p style={{ fontSize: "0.8em", color: "#666" }}>
            {new Date(o.date).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
    </>
  );
}
