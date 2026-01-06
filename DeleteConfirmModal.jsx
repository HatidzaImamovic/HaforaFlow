import "../App.css";
import { useLanguage } from "../contexts/LanguageContext";

export default function DeleteConfirmModal({
  item,
  onCancel,
  onConfirm
}) {
  const { t } = useLanguage();

  if (!item) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{t("delete_item_title")}</h3>

        <p>
          {t("delete_item_confirm")} {" "}
          <strong>{item.name}</strong>?
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button onClick={onCancel}>{t("cancel")}</button>

          <button
            className="danger-btn"
            onClick={onConfirm}

          >
            {t("ok")}
          </button>
        </div>
      </div>
    </div>
  );
}
