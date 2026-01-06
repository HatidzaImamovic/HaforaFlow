import { useState } from "react";
import "../App.css";
import { useLanguage } from "../contexts/LanguageContext";

export default function AddItemModal({ view, item = null, onClose, onSaved }) {
  const { t } = useLanguage();
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
        alert(t("failed_save_item"));
        return;
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert(t("error_save_item"));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>✕</button>

        <h2>
          {isEdit ? t("edit") : t("add_item")} {" "}
          {view === "cafe" ? t("cafe_item") : t("market_product")}
        </h2>

        <input
          placeholder={t("field_name")}
          value={form.name || ""}
          onChange={(e) => update("name", e.target.value)}
        />
        <input
          placeholder={t("field_category")}
          value={form.category || ""}
          onChange={(e) => update("category", e.target.value)}
        />
        <input
          type="number"
          placeholder={t("field_price")}
          value={form.price || ""}
          onChange={(e) => update("price", e.target.value)}
        />
        <input
          placeholder={t("field_image")}
          value={form.img || ""}
          onChange={(e) => update("img", e.target.value)}
        />

        {view === "market" && (
          <>
            <input
              placeholder={t("field_producer")}
              value={form.producer || ""}
              onChange={(e) => update("producer", e.target.value)}
            />
            <input
              placeholder={t("field_barcode")}
              value={form.barcode || ""}
              onChange={(e) => update("barcode", e.target.value)}
            />
            <textarea
              placeholder={t("field_details")}
              value={form.details || ""}
              onChange={(e) => update("details", e.target.value)}
            />
          </>
        )}

        <button className="ok-btn" onClick={submit}>
          {isEdit ? t("save_changes") : t("add_item_button")}
        </button>
      </div>
    </div>
  );
}
