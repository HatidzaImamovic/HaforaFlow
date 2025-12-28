import { useEffect, useState } from "react";
import NavbarMain from "../components/NavbarMain";
import ItemCard from "../components/ItemCard";
import "../App.css";

export default function KitchenView() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders/pending");
      if (!res.ok) throw new Error("Failed to fetch pending orders");
      const data = await res.json();
      // sort by createdAt ascending so oldest first (kitchen prepares older orders first)
      data.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 1500);
    return () => clearInterval(interval);
  }, []);

  const orderDone = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order");
      }

      // Optimistic UI: remove from pending list
      setOrders(prev => prev.filter(o => o.id !== id));
      setSelectedOrder(null);
    } catch (err) {
      console.error("Could not update order:", err);
      alert("Could not mark order done.");
    }
  };

  return (
    <div className="kitchen-view">
      <NavbarMain />

      <div className="kitchen-grid">
        {orders.map((o) => (
          <ItemCard
            key={o.id}
            item={{ name: `Order #${o.id}`, img: "../clipboard.png" }}
            onClick={() => setSelectedOrder(o)}
          />
        ))}
      </div>

      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="close-btn" onClick={() => setSelectedOrder(null)}>
              ×
            </button>

            <h2>Order #{selectedOrder.id}</h2>

            <div className="order-items-list">
              {selectedOrder.items.map((item) => (
                <p key={item.id}>{item.qty} × {item.name}</p>
              ))}
            </div>

            <button className="ok-btn" onClick={() => orderDone(selectedOrder.id)}>
              ORDER UP
            </button>
          </div>
        </div>
      )}
      <footer className="footer">
        &copy; {new Date().getFullYear()} HaforaFlow
      </footer>
    </div>
  );
}
