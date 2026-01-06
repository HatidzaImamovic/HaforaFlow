import { useState, useEffect } from "react";
import NavbarMain from "../components/NavbarMain";
import NavbarSub from "../components/NavbarSub";
import ItemCard from "../components/ItemCard";
import ItemModal from "../components/ItemModal";
import OrderList from "../components/OrderList";
import "../css/cafeView.css";
import { useLanguage } from "../contexts/LanguageContext";

export default function CafeView() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [order, setOrder] = useState([]);

  /* -------------------- FETCH ITEMS -------------------- */
  useEffect(() => {
  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/items");

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setItems(data);
      } else if (Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        console.error("Unexpected items response:", data);
        setItems([]);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      setItems([]);
    }
  };

  fetchItems();
}, []);

  /* -------------------- ADD / UPDATE ITEM -------------------- */
  const confirmAdd = (item, qty) => {
    setOrder((prev) => {
      const exists = prev.find((o) => o.id === item.id);

      if (exists) {
        return prev.map((o) =>
          o.id === item.id ? { ...o, qty } : o
        );
      }

      return [...prev, { ...item, qty }];
    });

    setSelectedItem(null);
  };

  /* -------------------- FILTER MENU -------------------- */
 const filtered = Array.isArray(items)
  ? items.filter(item =>
      !item.hidden &&
      (category === "" || item.category === category) &&
      item.name.toLowerCase().includes(search.toLowerCase())
    )
  : [];


  /* -------------------- SEND ORDER (LEGACY) -------------------- */
  const sendOrder = async () => {
    if (order.length === 0) return;

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: order }),
      });

      if (res.ok) {
        alert("Order sent to kitchen!");
        setOrder([]);
      } else {
        alert("Error sending order");
      }
    } catch (err) {
      console.error("Send order error:", err);
    }
  };

  return (
    <div className="cafe-view">
      <NavbarMain />

      <NavbarSub
        categories={[...new Set(items.map((i) => i.category))]}
        selected={category}
        search={search}
        onSelect={setCategory}
        onSearch={setSearch}
      />

      <div className="content">
        {/* MENU ITEMS */}
        <div className="items-grid">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>

        {/* ORDER SECTION */}
        <div className="order-list">
          <div className="order-scroll">
            <OrderList
              order={order}
              onRemove={(id) =>
                setOrder(order.filter((o) => o.id !== id))
              }
              onEdit={(o) => setSelectedItem(o)}
              onClearAll={() => setOrder([])}
            />
          </div>

          <div className="order-bottom">
            <div className="total">
              {t("total")} BAM {order
                .reduce(
                  (sum, item) => sum + item.price * item.qty,
                  0
                )
                .toFixed(2)}
            </div>

            <button
  className="order-btn"
  onClick={async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: order,
          total: order.reduce((sum, i) => sum + i.price * i.qty, 0)
        }),
      });

      if (!res.ok) throw new Error("Failed to send order");

      await res.json();
      alert(t("order_sent"));
      setOrder([]);
    } catch (err) {
      console.error(err);
      alert(t("order_send_error"));
    }
  }}
>
  {t("order_button")}
</button>


          </div>
        </div>
      </div>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          view="restaurant"
          onClose={() => setSelectedItem(null)}
          onConfirm={confirmAdd}
          existingQty={
            order.find((o) => o.id === selectedItem.id)?.qty || 1
          }
        />
      )}

      <footer className="footer">
        &copy; {new Date().getFullYear()} {t("footer_copyright")}
      </footer>
    </div>
  );
}
