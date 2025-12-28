import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- import this
import DateTime from "./DateTime";
import "../App.css";

export default function NavbarMain() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate(); // <-- initialize navigate

  const handleLogout = () => {
  // remove login/session data
  localStorage.removeItem("userToken");

  // replace current history entry
  navigate("/", { replace: true });

  // extra: prevent back navigation caching
  window.history.pushState(null, "", window.location.href);
};


  return (
    <nav className="navbar-main">
      <img id="logo" src="../haforaFlowLogo.png" alt="HaforaFlow Logo" />

      <DateTime/>

      <div className="nav-actions">
        <img 
          className="settings-icon"
          src="../setting.png" 
          alt="Settings"
          onClick={() => setOpen(!open)}
        />

        {open && (
          <div className="floating-menu">
            <h4>Settings</h4>
            <button>Dark / Light Mode</button>
            <button
              onClick={() => {
                window.open(
                  "https://mail.google.com/mail/?view=cm&fs=1&to=haforaflow@gmail.com",
                  "_blank"
                );
              }}
            >
              Contact Support
            </button>
            <button
  onClick={() => {
    window.open("/help", "_blank");
  }}
>
  Help
</button>

            <button className="logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
