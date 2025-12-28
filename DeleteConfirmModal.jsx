import "../App.css";

export default function DeleteConfirmModal({
  item,
  onCancel,
  onConfirm
}) {
  if (!item) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Delete item</h3>

        <p>
          Are you sure you want to delete{" "}
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
          <button onClick={onCancel}>Cancel</button>

          <button
            className="danger-btn"
            onClick={onConfirm}

          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
