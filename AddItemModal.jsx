import { useState } from "react";
import "../App.css";

export default function AddItemModal({ view, item = null, onClose, onSaved }) {
  const isEdit = Boolean(item);

  // Initialize form state: pre-fill if editing
  const [form, setForm] = useState(() =>
    item
      ? {
          name: item.name || "",
          category: item.category || "",
          price: item.price || "",
          img: item.img || item.image || "",
          producer: item.producer || "",
          barcode: item.barcode || "",
          details: item.details || "",
        }
      : {}
  );

  const update = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    try {
      const token = localStorage.getItem("token");

      const url = isEdit
        ? view === "cafe"
          ? `http://localhost:5000/api/items/${item.id}`
          : `http://localhost:5000/api/market/items/${item.id}`
        : view === "cafe"
          ? "http://localhost:5000/api/items"
          : "http://localhost:5000/api/market/items";

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        alert("Failed to save item");
        return;
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving item");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>✕</button>

        <h2>
          {isEdit ? "Edit" : "Add"}{" "}
          {view === "cafe" ? "Cafe Item" : "Market Product"}
        </h2>

        <input
          placeholder="Name"
          value={form.name || ""}
          onChange={(e) => update("name", e.target.value)}
        />
        <input
          placeholder="Category"
          value={form.category || ""}
          onChange={(e) => update("category", e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price || ""}
          onChange={(e) => update("price", e.target.value)}
        />
        <input
          placeholder="Image filename"
          value={form.img || ""}
          onChange={(e) => update("img", e.target.value)}
        />

        {view === "market" && (
          <>
            <input
              placeholder="Producer"
              value={form.producer || ""}
              onChange={(e) => update("producer", e.target.value)}
            />
            <input
              placeholder="Barcode"
              value={form.barcode || ""}
              onChange={(e) => update("barcode", e.target.value)}
            />
            <textarea
              placeholder="Details"
              value={form.details || ""}
              onChange={(e) => update("details", e.target.value)}
            />
          </>
        )}

        <button className="ok-btn" onClick={submit}>
          {isEdit ? "Save changes" : "Add Item"}
        </button>
      </div>
    </div>
  );
}
