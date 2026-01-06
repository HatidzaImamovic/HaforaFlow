import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function LanguageToggle({ className = "lang-btn" }) {
  const { lang, setLang, t } = useLanguage();

  const toggle = () => {
    setLang((prev) => (prev === "en" ? "bhs" : "en"));
  };

  const imgSrc = lang === "en" ? "/eng.png" : "/bhs.png";
  const alt = t("lang_alt");

  return (
    <button className={className} onClick={(e) => { e.stopPropagation(); toggle(); }}>
      <img src={imgSrc} alt={alt} />
    </button>
  );
}
