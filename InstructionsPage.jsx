import "../App.css";

export default function InstructionsPage() {
  return (
    <div className="instructions-page" style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h1>App Instructions</h1>

      <section style={{ marginTop: "20px" }}>
        <h3>1. Logging In</h3>
        <p>Use your credentials to log in to the app. If you forget your password, use the contact support option.</p>

        <h3>2. Browsing Items</h3>
        <p>Switch between "Cafe Items" and "Market Items" using the buttons in the manager view. Click on an item to see details.</p>

        <h3>3. Managing Items</h3>
        <p>As a manager, you can add, edit, delete, or hide items using the buttons on each item card.</p>

        <h3>4. Managing Workers</h3>
        <p>You can add, edit, or delete workers, and filter them by role (Cafe, Market, Kitchen).</p>

        <h3>5. Inbox & Messages</h3>
        <p>The inbox shows messages and questions from users. Click a message to view details and mark it as read/unread.</p>

        <h3>6. Submitting Questions</h3>
        <p>Use the Help page to submit questions. They will appear in the manager's inbox.</p>

        <h3>7. Logging Out</h3>
        <p>Click the Logout button in the settings menu to log out safely.</p>

        {/* Add more steps as needed */}
      </section>
    </div>
  );
}
