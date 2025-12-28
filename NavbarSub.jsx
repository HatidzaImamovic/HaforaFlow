import "../App.css";

export default function NavbarSub({ categories, selected, onSelect, search, onSearch, searchBy = "name" }) {
  return (
    <div className="navbar-sub">

      <select value={selected} onChange={(e) => onSelect(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder={
          searchBy === "name|producer"
            ? "Search items or producer..."
            : "Search items..."
        }
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
