import { useEffect, useState } from "react";
import NavbarMain from "../components/NavbarMain";
import ItemCard from "../components/ItemCard";
import "../css/kitchenView.css";
import { useLanguage } from "../contexts/LanguageContext";

export default function KitchenView() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [marking, setMarking] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/orders/history?status=pending"
      );

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();

      // Keep ONLY pending, valid orders, dedupe by id and sort oldest-first
      const valid = (Array.isArray(data) ? data : [])
        .filter(
          (o) =>
            o &&
            o.id &&
            o.status === "pending" && // extra safety: server should already honor ?status=pending
            Array.isArray(o.items) &&
            o.items.length > 0
        );

      const uniqueMap = new Map();
      valid.forEach((o) => uniqueMap.set(String(o.id), o));
      const unique = Array.from(uniqueMap.values());

      unique.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setOrders(unique);

      // If selected order was removed / completed on the server, close modal
      if (selectedOrder && !unique.some((u) => String(u.id) === String(selectedOrder.id))) {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedOrder) return; // stop polling while modal open

    fetchOrders();
    const interval = setInterval(fetchOrders, 1500);
    return () => clearInterval(interval);
  }, [selectedOrder]);

  // Also ensure modal closes if orders change and selected is gone
  useEffect(() => {
    if (selectedOrder && !orders.some((o) => String(o.id) === String(selectedOrder.id))) {
      setSelectedOrder(null);
    }
  }, [orders, selectedOrder]);

  const orderDone = async (id) => {
    if (marking) return;
    setMarking(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "done" }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update order status");
      }

      // remove immediately from local list and close modal
      setOrders((prev) => prev.filter((o) => String(o.id) !== String(id)));
      setSelectedOrder(null);

      // refresh from backend to keep in sync
      await fetchOrders();
    } catch (err) {
      console.error("Could not mark order as done:", err);
      alert(t("mark_failed"));
    } finally {
      setMarking(false);
    }
  };

  const selectedIndex = selectedOrder
    ? orders.findIndex((o) => String(o.id) === String(selectedOrder.id)) + 1
    : null;

  return (
    <div className="kitchen-view">
      <NavbarMain />

      <div className="kitchen-grid">
        {orders.map((o, index) => (
          <ItemCard
            key={o.id}
            item={{ name: `Order ${index + 1}`, img: "../clipboard.png" }}
            onClick={() => setSelectedOrder(o)}
          />
        ))}
      </div>

      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button
              className="close-btn"
              onClick={() => setSelectedOrder(null)}
            >
              ×
            </button>

            <h2>{t("order_label")} {selectedIndex}</h2>

            <div className="order-items-list">
              {selectedOrder.items.map((item, idx) => (
                <p key={idx}>
                  {item.qty} × {item.name}
                </p>
              ))}
            </div>

            <button
              className="ok-btn"
              onClick={() => orderDone(selectedOrder.id)}
              disabled={marking}
            >
              {marking ? t("marking") : t("order_up")}
            </button>
          </div>
        </div>
      )}

      <footer className="footer">
        &copy; {new Date().getFullYear()} {t("footer_copyright")}
      </footer>
    </div>
  );
}
