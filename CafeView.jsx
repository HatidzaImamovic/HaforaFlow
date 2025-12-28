import { useState, useEffect } from "react";
import NavbarMain from "../components/NavbarMain";
import NavbarSub from "../components/NavbarSub";
import ItemCard from "../components/ItemCard";
import ItemModal from "../components/ItemModal";
import OrderList from "../components/OrderList";
import "../App.css";

export default function CafeView() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [order, setOrder] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/items");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };
    fetchItems();
  }, []);

  // ADD OR UPDATE ITEM IN ORDER
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

  // FILTER MENU
  const filtered = items.filter(
  item =>
    !item.hidden &&                      // 🔥 ADD THIS
    (category === "" || item.category === category) &&
    item.name.toLowerCase().includes(search.toLowerCase())
);


  return (
    <div className="cafe-view">

      <NavbarMain />

      <NavbarSub
        categories={[...new Set(items.map(i => i.category))]}
        selected={category}
        search={search}
        onSelect={setCategory}
        onSearch={setSearch}
      />

      <div className="content">

        {/* MENU ITEMS */}
        <div className="items-grid">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
          ))}
        </div>

        {/* ORDER SECTION */}
        <div className="order-list">
          
          <div className="order-scroll">
            <OrderList
              order={order}
              onRemove={(id) => setOrder(order.filter(o => o.id !== id))}
              onEdit={(o) => setSelectedItem(o)}
              onClearAll={() => setOrder([])}
            />
          </div>

          <div className="order-bottom">
            <div className="total">
              Total: BAM {order.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}
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
          total: order.reduce((sum, item) => sum + item.price * item.qty, 0)
        })
      });

      if (!res.ok) {
        throw new Error("Failed to send order");
      }

      const data = await res.json();
      alert("Order sent!");
      setOrder([]);

    } catch (err) {
      console.error(err);
      alert("Could not send order.");
    }
  }}
>
  Order
</button>

          </div>

        </div>

      </div>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          view="restuarant"
          onClose={() => setSelectedItem(null)}
          onConfirm={confirmAdd}
          existingQty={order.find(o => o.id === selectedItem.id)?.qty || 1}
        />
      )}
      <footer className="footer">
        &copy; {new Date().getFullYear()} HaforaFlow
      </footer>
    </div>
  );
}
