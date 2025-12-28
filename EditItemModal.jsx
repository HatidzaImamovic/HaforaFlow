import { useState } from "react";
import "../App.css";

export default function EditItemModal({ item, view, onClose, onSaved }) {
  const [form, setForm] = useState({ ...item });
  const [loading, setLoading] = useState(false);

  const editableFields = [
    "name",
    "category",
    "price",
    "producer",
    "details",
    "barcode",
    "image"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);

    const itemId =
      view === "market" ? Number(item.id) : item.id;

    const url =
      view === "cafe"
        ? `http://localhost:5000/api/items/${itemId}`
        : `http://localhost:5000/api/market/items/${itemId}`;

    // 🔧 FIX: clean, explicit payload
    const payload =
  view === "cafe"
    ? {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        image: form.image,
      }
    : {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        producer: form.producer,
        details: form.details,
        barcode: form.barcode,
        image: form.image,
      };


    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Update failed");
      setLoading(false);
      return;
    }

    const updated = await res.json();
    onSaved(updated);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Item</h3>

        {editableFields.map((key) => (
          form[key] !== undefined && (
            <div key={key} className="form-group">
              <label>{key}</label>
              <input
                name={key}
                value={form[key] ?? ""}
                onChange={handleChange}
              />
            </div>
          )
        ))}

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
