import { useState } from "react";

export default function EditWorkerModal({ worker, onClose, onSaved }) {
  const [username, setUsername] = useState(worker.username);
  const [password, setPassword] = useState(worker.password);
  const [newPassword, setNewPassword] = useState(null);

  const generatePassword = () => {
    const prefix =
      worker.role === "market"
        ? "CR"
        : worker.role === "cafe"
        ? "WT"
        : "KT";

    const generated =
      prefix + Math.floor(1000 + Math.random() * 9000);

    setNewPassword(generated);
  };

  const handleSave = async () => {
    const body = {
      username
    };

    // Only update password if user explicitly chose to
    if (newPassword) {
      body.password = newPassword;
    }

    const res = await fetch(
      `http://localhost:5000/api/workers/${worker.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    if (res.ok) {
      onSaved();
    } else {
      alert("Failed to update worker");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Worker</h3>

        <label>Username</label>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <label>Current Password</label>
        <input value={password} disabled />

        {newPassword && (
          <>
            <label>New Password</label>
            <input value={newPassword} disabled />
          </>
        )}

        <div className="modal-actions">
          <button onClick={generatePassword}>
            Generate New Password
          </button>
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
