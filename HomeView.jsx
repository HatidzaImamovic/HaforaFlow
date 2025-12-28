import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function HomeView() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState(false); // for red border only
  const [passwordError, setPasswordError] = useState("");    // shared error text
  const navigate = useNavigate();

  const login = async () => {
    // Clear previous errors
    setUsernameError(false);
    setPasswordError("");

    if (!username || !password) {
      setPasswordError("Please fill in both fields");
      if (!username) setUsernameError(true);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        if(data.role === "admin") navigate("/main"); // successful login
        if (data.role === "cafe") navigate("/cafe");
        if (data.role === "kitchen") navigate("/kitchen");
        if (data.role === "market") navigate("/market");
        if (data.role === "manager") navigate("/manager");
      } else {
        // Highlight fields based on error
        if (data.message === "User not found") {
          setUsernameError(true);     // mark username red
        } else if (data.message === "Invalid password") {
          setUsernameError(false);
        }
        setPasswordError(data.message); // show message under password field
      }
    } catch (err) {
      console.error(err);
      setPasswordError("Server error");
    }
  };

  return (
    <div className="pageWrap">
      <button
  onClick={() => {
    window.open("/help", "_blank");
  }}
>
  Help
</button>
      <div id="loginPage">
        <img src="..\haforaFlowLogo.png" alt="HaforaFlow Logo" />
        <h2>Log In</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={usernameError ? "inputError" : ""}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={passwordError ? "inputError" : ""}
        />
        {passwordError && <div className="errorMessage">{passwordError}</div>}

        <button onClick={login}>Login</button>
      </div>

      <footer className="footer">
        &copy; {new Date().getFullYear()} HaforaFlow
      </footer>
    </div>
  );
}
