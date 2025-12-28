import { useState } from "react";

export default function HelpMessageForm() {
  const [text, setText] = useState("");

  const sendHelp = () => {
    if (!text.trim()) return;

    const existing =
      JSON.parse(localStorage.getItem("managerMessages")) || [];

    existing.unshift({
      id: Date.now(),
      type: "HELP",
      title: "Help request",
      text,
      sender: "Worker",
      read: false,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem("managerMessages", JSON.stringify(existing));
    setText("");
  };

  return (
    <>
      <h3>Help</h3>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write message to manager..."
      />
      <button onClick={sendHelp}>Send</button>
    </>
  );
}
