import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/homePage.css";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

export default function HomeView() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(
  document.body.classList.contains("dark")
);



  const navigate = useNavigate();
  const { t, translateMessage } = useLanguage();

  /* ================= IDLE TIMER ================= */
  const idleTimer = useRef(null);
  const IDLE_TIME = 2 * 60 * 1000; // ⏱ 2 minutes (change if needed)

  const resetIdleTimer = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);

    idleTimer.current = setTimeout(() => {
      navigate("/"); // 👈 go back to welcome page
    }, IDLE_TIME);
  };

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    events.forEach(event =>
      window.addEventListener(event, resetIdleTimer)
    );

    resetIdleTimer(); // start timer immediately

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      events.forEach(event =>
        window.removeEventListener(event, resetIdleTimer)
      );
    };
  }, []);
  /* ============================================== */
  useEffect(() => {
  const isDark = document.body.classList.contains("dark");
  setDarkMode(isDark);
}, []);

useEffect(() => {
  localStorage.setItem("theme", darkMode ? "dark" : "light");
}, [darkMode]);

useEffect(() => {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
    setDarkMode(true);
  }
}, []);



  const login = async () => {
    setUsernameError(false);
    setPasswordError("");

    if (!username || !password) {
      setPasswordError(t("fill_both"));
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
        if (data.role === "admin") navigate("/main");
        if (data.role === "cafe") navigate("/cafe");
        if (data.role === "kitchen") navigate("/kitchen");
        if (data.role === "market") navigate("/market");
        if (data.role === "manager") navigate("/manager");
      } else {
        if (data.message === "User not found") {
          setUsernameError(true);
        } else if (data.message === "Invalid password") {
          setUsernameError(false);
        }
        setPasswordError(translateMessage(data.message) || data.message);
      }
    } catch (err) {
      console.error(err);
      setPasswordError(t("server_error"));
    }
  };

  const toggleTheme = () => {
  setDarkMode(prev => {
    const next = !prev;

    if (next) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    return next;
  });
};



  return (
    <div className="pageWrap">

    <a
  href="/help"
  target="_blank"
  rel="noopener noreferrer"
  className="help-btn"
>
  {t("help")}
</a>


    <button
  className={`light-dark ${darkMode ? "is-dark" : "is-light"}`}
  onClick={toggleTheme}
>
  <img
    src={darkMode ? "/night-mode.png" : "/brightness.png"}
    alt={t("toggle_theme")}
  />
</button>


    <LanguageToggle />

  <div id="loginPage">
    <img
  src={darkMode ? "/haforaFlowLogoDM.png" : "/haforaFlowLogo.png"}
  alt="HaforaFlow Logo"
  className={`login-logo ${darkMode ? "logo-dark" : "logo-light"}`}
/>


    <h2>{t("log_in")}</h2>

    <input
      type="text"
      placeholder={t("username")}
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className={usernameError ? "inputError" : ""}
    />

    <div className="password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    placeholder={t("password")}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className={passwordError ? "inputError" : ""}
  />


  <span
    className="toggle-password"
    onClick={() => setShowPassword(!showPassword)}
  >
    <img
  src={showPassword ? "/hide.png" : "/view.png"}
  alt={t("toggle_theme")}
/>
  </span>
</div>


    {passwordError && (
      <div className="errorMessage">{passwordError}</div>
    )}

    <button onClick={login}>{t("login_button")}</button>
  </div>

  <footer className="footer">
    &copy; {new Date().getFullYear()} {t("footer_copyright")}
  </footer>
</div>

  );
}
