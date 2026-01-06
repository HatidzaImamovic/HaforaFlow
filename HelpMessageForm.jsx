import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function HelpMessageForm() {
  const { t } = useLanguage();
  const [text, setText] = useState("");

  const sendHelp = () => {
    if (!text.trim()) return;

    const existing =
      JSON.parse(localStorage.getItem("managerMessages")) || [];

    existing.unshift({
      id: Date.now(),
      type: "HELP",
      title: t("help_request_title"),
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
      <h3>{t("help")}</h3>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={t("write_message_placeholder")}
      />
      <button onClick={sendHelp}>{t("send")}</button>
    </>
  );
}
