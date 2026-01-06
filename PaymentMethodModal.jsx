import { useLanguage } from "../contexts/LanguageContext";

export default function PaymentMethodModal({ onClose, onCard, onCash }) {
  const { t } = useLanguage();

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: "300px" }}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{t("pay")}</h2>

        <button className="ok-btn" onClick={onCard}>
          {t("pay_by_card")}
        </button>

        <button
          className="ok-btn"
          style={{ background: "#444", marginTop: "10px" }}
          onClick={onCash}
        >
          {t("pay_by_cash")}
        </button>
      </div>
    </div>
  );
}
