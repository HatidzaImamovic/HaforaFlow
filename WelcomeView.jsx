import { useNavigate } from "react-router-dom";
import "../css/welcomePage.css";
import DateTime from "../components/DateTime";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

export default function WelcomeView() {
  const navigate = useNavigate();

  const { t } = useLanguage();

  const goHome = () => {
    navigate("/home"); // or whatever route your homeView uses
  };

  return (
    
    <div className="welcome-container" onClick={goHome}>
      <LanguageToggle />
        <DateTime className="datetime"/>
        <div className="bubbles">
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>

  <div className="blob blue" />
  <div className="blob purple" />
  <div className="blob indigo" />

  <h1 className="welcome-title">{t("welcome_title")}</h1>
  <p className="welcome-subtitle">{t("welcome_subtitle")}</p>

  <footer className="welcome-footer">
        &copy; {new Date().getFullYear()} HaforaFlow
      </footer>
    <svg
  className="wave"
  viewBox="0 0 1440 320"
  preserveAspectRatio="none"
>
<defs>
  <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="rgba(255,255,255,0.25)" />
    <stop offset="100%" stop-color="rgba(255,255,255,0.1)" />
  </linearGradient>
</defs>

<path
  fill="rgba(255, 255, 255, 0.18)"
  d="M0,20
     C240,120 480,-20 720,80
     960,180 1200,60 1440,160
     L1440,320 L0,320 Z"
/>

</svg>

</div>
  );
}
