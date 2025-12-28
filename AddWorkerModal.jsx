import { useState } from "react";

export default function AddWorkerModal({ onClose, onCreated }) {
  const [role, setRole] = useState("market");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!email) {
      alert("Please enter worker email");
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
        throw new Error(err.message || "Failed to create worker");
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
        <h3>Create Worker</h3>

        <input
          type="email"
          placeholder="Worker email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="market">Supermarket</option>
          <option value="cafe">Restaurant</option>
          <option value="kitchen">Kitchen</option>
        </select>

        <div className="modal-actions">
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
