import { useState } from "react";
import "../App.css";

export default function HelpPage() {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
      <h1>Frequently Asked Questions</h1>
      <p>
        Here you can find answers to common questions. If you don't find your question below, submit it using the box below.
      </p>

      <div className="faq-section" style={{ margin: "20px 0" }}>
        <h3>Q: How do I order?</h3>
        <p>A: Select the product and proceed to checkout.</p>

        <h3>Q: Can I edit my order?</h3>
        <p>A: Yes, click on the order and select edit.</p>

        {/* Add more FAQs here */}
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Ask a question:
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            style={{ width: "100%", marginTop: "5px" }}
          />
        </label>

        <button type="submit" style={{ marginTop: "10px" }}>
          Submit Question
        </button>
      </form>

      {submitted && <p style={{ color: "green", marginTop: "10px" }}>Your question has been sent!</p>}

      {/* Instructions button */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <button
          onClick={() => window.open("/instructions", "_blank")}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Instructions
        </button>
      </div>
    </div>
  );
}
