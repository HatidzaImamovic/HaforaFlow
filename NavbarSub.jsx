import "../App.css";
import { useLanguage } from "../contexts/LanguageContext";

export default function NavbarSub({ categories, selected, onSelect, search, onSearch, searchBy = "name" }) {
  const { t } = useLanguage();

  return (
    <div className="navbar-sub">

      <select value={selected} onChange={(e) => onSelect(e.target.value)}>
        <option value="">{t("all_categories")}</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder={
          searchBy === "name|producer"
            ? t("search_items_producer_placeholder")
            : t("search_items_placeholder")
        }
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
