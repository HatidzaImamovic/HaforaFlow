import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function AddWorkerModal({ onClose, onCreated }) {
  const { t } = useLanguage();
  const [role, setRole] = useState("market");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!email) {
      alert(t("please_enter_worker_email"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || t("failed_create_worker"));
      }

      const data = await res.json();
      onCreated(data);
    } catch (err) {
      console.error("CREATE WORKER ERROR:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{t("create_worker")}</h3>

        <input
          type="email"
          placeholder={t("worker_email_placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="market">{t("role_supermarket")}</option>
          <option value="cafe">{t("role_restaurant")}</option>
          <option value="kitchen">{t("role_kitchen")}</option>
        </select>

        <div className="modal-actions">
          <button onClick={onClose} disabled={loading}>
            {t("cancel")}
          </button>
          <button onClick={handleCreate} disabled={loading}>
            {loading ? t("creating") : t("create")}
          </button>
        </div>
      </div>
    </div>
  );
}
