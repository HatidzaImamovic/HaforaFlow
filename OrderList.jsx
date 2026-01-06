import { useState, useEffect } from "react";
import "../App.css";
import { useLanguage } from "../contexts/LanguageContext";

export default function OrderList({ order, onRemove, onEdit, onClearAll }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  // --- Order History Modal ---
  const [historyOpen, setHistoryOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dailyTotal, setDailyTotal] = useState("0.00");
  const todayDate = new Date().toISOString().split("T")[0];
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { t } = useLanguage();

  /* -------------------- REMOVE SINGLE ITEM -------------------- */
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

  /* -------------------- CLEAR ALL -------------------- */
  const handleClearAll = () => setClearAllOpen(true);
  const handleConfirmClearAll = () => {
    onClearAll();
    setClearAllOpen(false);
  };
  const handleCancelClearAll = () => setClearAllOpen(false);

  /* -------------------- FETCH ORDER HISTORY DATES -------------------- */
  useEffect(() => {
    if (!historyOpen) return;

    const fetchDates = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders/history/dates");
        const data = await res.json();
        setDates(data);
      } catch (err) {
        console.error("Failed fetching order dates:", err);
      }
    };

    fetchDates();
  }, [historyOpen]);

  /* -------------------- FETCH ORDER HISTORY -------------------- */
  // ...existing code...
  useEffect(() => {
    if (!historyOpen) return;

    const dateToUse = selectedDate || todayDate;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/history?date=${dateToUse}`);
        const data = await res.json();

        // Put pending first, and keep oldest-first within same status
        const sorted = [...data].sort((a, b) => {
          if (a.status === b.status) {
            return new Date(a.createdAt) - new Date(b.createdAt); // oldest first
          }
          return a.status === "pending" ? -1 : 1; // pending on top
        });

        setOrderHistory(sorted);

        const total = sorted.reduce((sum, o) => sum + Number(o.total), 0);
        setDailyTotal(total.toFixed(2));
      } catch (err) {
        console.error("Failed fetching order history:", err);
      }
    };

    fetchHistory();
  }, [selectedDate, historyOpen]);

  return (
    <>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{t("order_title")}</h2>

        <button
          style={{ padding: "5px 12px", background: "#555", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          onClick={() => {
            setSelectedDate(todayDate);
            setHistoryOpen(true);
          }}
        >
          {t("order_history")}
        </button>

        <button
          style={{ padding: "5px 12px", background: "#1976d2", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          onClick={handleClearAll}
        >
          {t("clear_all")}
        </button>
      </div>

      {/* CURRENT ORDER LIST */}
      {order.map((o) => (
        <div className="order-item" key={o.id} onClick={() => onEdit(o)}>
          <div>
            <p className="item-name">{o.name}</p>
            <p className="item-details">{o.qty} × {o.price.toFixed(2)} KM</p>
          </div>
          <button className="remove-btn" onClick={(e) => handleRemoveClick(o.id, e)}>-</button>
        </div>
      ))}

      {/* REMOVE CONFIRMATION */}
      {confirmOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: "250px" }}>
            <p>{t("remove_item_confirm")}</p>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "15px" }}>
              <button onClick={handleConfirm} style={{ background: "red", color: "white", padding: "5px 12px", borderRadius: "4px" }}>{t("yes")}</button>
              <button onClick={handleCancel} style={{ padding: "5px 12px", borderRadius: "4px" }}>{t("no")}</button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL CONFIRMATION */}
      {clearAllOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: "280px" }}>
            <p>{t("clear_order_confirm")}</p>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "15px" }}>
              <button onClick={handleConfirmClearAll} style={{ background: "red", color: "white", padding: "5px 12px", borderRadius: "4px" }}>{t("yes")}</button>
              <button onClick={handleCancelClearAll} style={{ padding: "5px 12px", borderRadius: "4px" }}>{t("no")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER HISTORY MODAL */}
      {historyOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: "420px", maxHeight: "80vh", overflowY: "auto", position: "relative" }}>
            <button className="close-btn" onClick={() => setHistoryOpen(false)}>×</button>

            <h2>{t("order_history")}</h2>

            {/* DATE PICKER */}
            <label><strong>{t("select_date")}</strong></label>
            <button
              onClick={() => setCalendarOpen(true)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", margin: "6px 0 12px 0", border: "1px solid #ccc", background: "white", cursor: "pointer", textAlign: "left" }}
            >
              {selectedDate || todayDate}
            </button>

            {calendarOpen && (
              <div style={{ position: "absolute", top: "120px", left: "0", background: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.2)", zIndex: 999 }}>
                <input
                  type="date"
                  value={selectedDate || todayDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCalendarOpen(false);
                  }}
                  style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", width: "180px" }}
                />
              </div>
            )}

            <p style={{ marginBottom: "15px" }}>
              <strong>{t("total_sales_for")} {selectedDate || todayDate}:</strong> BAM {dailyTotal}
            </p>

            {orderHistory.length === 0 && <p>{t("no_orders_found")}</p>}

            {orderHistory.map((o) => (
  <div
    key={o.id}
    style={{
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      marginBottom: "10px",
      background: o.status === "done" ? "#e8f5e9" : "#fff8e1"
    }}
  >
    <strong>{t("status")}:</strong>{" "}
    <span
      style={{
        color: o.status === "done" ? "green" : "orange",
        fontWeight: "bold"
      }}
    >
      {o.status.toUpperCase()}
    </span>

    <div style={{ marginTop: "8px" }}>
      {o.items.map((item, index) => (
        <p key={index}>
          {item.qty} × {item.name}
        </p>
      ))}
    </div>

    <p><strong>{t("total")}</strong> BAM {o.total.toFixed(2)}</p>

    <p style={{ fontSize: "0.8em", color: "#666" }}>
      {new Date(o.createdAt).toLocaleString()}
    </p>

    {o.finishedAt && (
      <p style={{ fontSize: "0.75em", color: "#388e3c" }}>
        {t("finished_at")}: {new Date(o.finishedAt).toLocaleString()}
      </p>
    )}
  </div>
))}

          </div>
        </div>
      )}
    </>
  );
}
