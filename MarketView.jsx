import { useState, useEffect } from "react";
import NavbarMain from "../components/NavbarMain";
import NavbarSub from "../components/NavbarSub";
import ItemCard from "../components/ItemCard";
import ItemModal from "../components/ItemModal";
import MarketOrderList from "../components/MarketOrderList";
import PaymentMethodModal from "../components/PaymentMethodModal";
import CashModal from "../components/CashModal";
import "../App.css";

export default function MarketView() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [order, setOrder] = useState([]);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/market/items"); 
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching market items:", err);
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

  // FILTER ITEMS (by category + name + producer)
  const filtered = items.filter(item => {
  if (item.hidden) return false;          // 🔥 ADD THIS

  const matchesCategory = category === "" || item.category === category;
  const matchesSearch =
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.producer && item.producer.toLowerCase().includes(search.toLowerCase()));

  return matchesCategory && matchesSearch;
});


  const totalPrice = order
    .reduce((sum, item) => sum + item.price * item.qty, 0)
    .toFixed(2);

  // Card payment
  const finishCardPayment = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/market/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: order,
          total: Number(totalPrice),
          paymentType: "card",
          amountGiven: 0
        })
      });

      if (!res.ok) throw new Error("Error completing card payment");

      alert("Card payment successful!");
      setOrder([]);
      setPaymentOpen(false);
    } catch (err) {
      console.error(err);
      alert("Payment failed.");
    }
  };

  // Cash payment
  const finishCashPayment = async (amountGiven) => {
    try {
      const res = await fetch("http://localhost:5000/api/market/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: order,
          total: totalPrice,
          paymentType: "cash",
          amountGiven
        })
      });

      if (!res.ok) throw new Error("Error completing cash payment");

      alert("Cash payment successful!");
      setOrder([]);
      setCashOpen(false);
    } catch (err) {
      console.error(err);
      alert("Cash payment failed.");
    }
  };

  return (
    <div className="market-view">
      <NavbarMain />

      <NavbarSub
        categories={[...new Set(items.map(i => i.category))]}
        selected={category}
        search={search}
        onSelect={setCategory}
        onSearch={setSearch}
        searchBy="name|producer"
      />

      <div className="content">

        <div className="items-grid">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
              showDetails={true}
            />
          ))}
        </div>

        <div className="order-list">
          <div className="order-scroll">
            <MarketOrderList
              order={order}
              onRemove={(id) => setOrder(order.filter(o => o.id !== id))}
              onEdit={(o) => setSelectedItem(o)}
              onClearAll={() => setOrder([])}
            />
          </div>

          <div className="order-bottom">
            <div className="total">
              Total: BAM {totalPrice}
            </div>

            <button 
              className="order-btn"
              onClick={() => setPaymentOpen(true)}
              disabled={order.length === 0}
            >
              Pay
            </button>
          </div>
        </div>
      </div>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          view="market"
          onClose={() => setSelectedItem(null)}
          onConfirm={confirmAdd}
          existingQty={order.find(o => o.id === selectedItem.id)?.qty || 1}
        />
      )}

      {paymentOpen && (
        <PaymentMethodModal
          onClose={() => setPaymentOpen(false)}
          onCard={finishCardPayment}
          onCash={() => {
            setPaymentOpen(false);
            setCashOpen(true);
          }}
        />
      )}

      {cashOpen && (
        <CashModal
          total={Number(totalPrice)}
          onClose={() => setCashOpen(false)}
          onConfirm={finishCashPayment}
        />
      )}

      <footer className="footer">
        &copy; {new Date().getFullYear()} HaforaFlow
      </footer>
    </div>
  );
}
