import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DateTime from "./DateTime";
import "../App.css";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "../contexts/LanguageContext";

export default function NavbarMain() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    document.body.classList.contains("dark")
  );

  const navigate = useNavigate();
  const { t } = useLanguage();

  // 🔄 keep navbar in sync with global theme
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.body.classList.contains("dark"));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/", { replace: true });
    window.history.pushState(null, "", window.location.href);
  };

  const toggleTheme = () => {
    const isDark = document.body.classList.toggle("dark");

    localStorage.setItem("theme", isDark ? "dark" : "light");
    setDarkMode(isDark);
  };

  return (
    <nav className="navbar-main">
      <img
        id="logo"
        src={darkMode ? "/haforaFlowLogoDM.png" : "/haforaFlowLogo.png"}
        alt="HaforaFlow Logo"
      />

      <DateTime className={"date-time"} />

      <div className="nav-actions">
        <LanguageToggle className="lang-btn-small" />

        <img
          className="settings-icon"
          src="/setting.png"
          alt={t("settings")}
          onClick={() => setOpen(!open)}
        />

        {open && (
          <div className="floating-menu">
            <h4>{t("settings")}</h4>

            <button onClick={toggleTheme}>
              {t("dark_light_mode")}
            </button>

            <button
              onClick={() =>
                window.open(
                  "https://mail.google.com/mail/?view=cm&fs=1&to=haforaflow@gmail.com",
                  "_blank"
                )
              }
            >
              {t("contact_support")}
            </button>

            <button onClick={() => window.open("/help", "_blank")}>
              {t("help")}
            </button>

            <button className="logout" onClick={handleLogout}>
              {t("logout")}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
