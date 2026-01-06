import { useState } from "react";
import "../App.css";
import { useLanguage } from "../contexts/LanguageContext";

export default function HelpPage() {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const stored = JSON.parse(localStorage.getItem("managerMessages")) || [];

    const newMessage = {
      id: Date.now(),
      title: "User Question",
      productName: null,
      text: question,
      read: false,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(
      "managerMessages",
      JSON.stringify([newMessage, ...stored])
    );

    window.dispatchEvent(new Event("managerMessagesUpdated"));
    setSubmitted(true);
    setQuestion("");
  };

  return (
    <div className="help-page" style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>{t("frequently_faq_title")}</h1>
      <p>{t("help_intro")}</p>

      <div className="faq-section" style={{ margin: "20px 0" }}>
        <h3>{t("faq_q1")}</h3>
        <p>{t("faq_a1")}</p>

        <h3>{t("faq_q2")}</h3>
        <p>{t("faq_a2")}</p>

        {/* Add more FAQs here */}
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          {t("ask_question_label")}
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            style={{ width: "100%", marginTop: "5px" }}
          />
        </label>

        <button type="submit" style={{ marginTop: "10px" }}>
          {t("submit_question")}
        </button>
      </form>

      {submitted && <p style={{ color: "green", marginTop: "10px" }}>{t("question_sent")}</p>}

      {/* Instructions button */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <button
          onClick={() => window.open("/instructions", "_blank")}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          {t("instructions")}
        </button>
      </div>
    </div>
  );
}
