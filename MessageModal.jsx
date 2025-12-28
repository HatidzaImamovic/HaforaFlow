import "../App.css";

export default function MessageModal({ message, onClose }) {
  if (!message) return null;

  const markAsUnread = () => {
    const stored =
      JSON.parse(localStorage.getItem("managerMessages")) || [];

    const updated = stored.map((m) =>
      m.id === message.id ? { ...m, read: false } : m
    );

    localStorage.setItem(
      "managerMessages",
      JSON.stringify(updated)
    );

    // notify ManagerView to refresh inbox
    window.dispatchEvent(new Event("managerMessagesUpdated"));

    onClose();
  };

  const deleteMessage = () => {
    const stored =
      JSON.parse(localStorage.getItem("managerMessages")) || [];

    const updated = stored.filter((m) => m.id !== message.id);

    localStorage.setItem(
      "managerMessages",
      JSON.stringify(updated)
    );

    // notify ManagerView to refresh inbox
    window.dispatchEvent(new Event("managerMessagesUpdated"));

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>✕</button>

        <h2>{message.title}</h2>

        {message.productName && (
          <p><strong>Product:</strong> {message.productName}</p>
        )}

        <p className="message-text">{message.text}</p>

        <small>
          {new Date(message.createdAt).toLocaleString()}
        </small>

        <div style={{ marginTop: "15px", textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            className="mark-unread-btn"
            onClick={markAsUnread}
          >
            Mark as unread
          </button>
          <button
            className="delete-msg-btn"
            onClick={deleteMessage}
            style={{ backgroundColor: "#ff4d4f", color: "#fff" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
