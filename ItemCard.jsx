import "../App.css";
import { useLanguage } from "../contexts/LanguageContext";

export default function ItemCard({
  item,
  onClick,
  manager = false,
  onDelete,
  onHide,
  onArchive
}) {
  const isWorker = !!item.role;

  /* -----------------------------------
     Decide which image NAME or PATH
  ----------------------------------- */
  const getImage = () => {
    // Workers
    if (isWorker) {
      switch (item.role) {
        case "market":
          return "cashier.png";
        case "cafe":
          return "waiter.png";
        case "kitchen":
          return "chefworker.png";
        default:
          return "placeholder.png";
      }
    }

    // Normal items / orders
    return item.image || item.img || "placeholder.png";
  };

  /* -----------------------------------
     Build FINAL src safely
  ----------------------------------- */
  const getImageSrc = () => {
    const img = getImage();

    // imported image or absolute path
    if (typeof img === "string" && (img.startsWith("/") || img.includes("://"))) {
      return img;
    }

    // imported image module (Vite/Webpack)
    if (typeof img === "object" && img?.default) {
      return img.default;
    }

    // public/images fallback
    return `/images/${img}`;
  };

  const { lang, t } = useLanguage();
  const displayName = lang === "bhs" && item.name_bhs ? item.name_bhs : item.name;

  return (
    <div
      className="item-card"
      onClick={!manager && onClick ? onClick : undefined}
      style={{ cursor: manager ? "default" : "pointer" }}
    >
      <img
  src={getImageSrc()}
  alt={displayName}
  loading="lazy"
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "/images/placeholder.png";
  }}
/>


      <h3>{displayName}</h3>

      {/* Price only for products */}
      {!isWorker && typeof item.price === "number" && (
        <p>BAM {item.price.toFixed(2)}</p>
      )}

      {/* Manager buttons */}
      {manager && (
        <div className="manager-card-buttons">
          {onDelete && (
            <button
              className="delete-btn"
              onClick={() => onDelete(item)}
            >
              {t("delete")}
            </button>
          )}

          {isWorker && !item.archived && onArchive && (
            <button
              className="archive-btn"
              onClick={() => onArchive(item)}
            >
              {t("archive")}
            </button>
          )}

          {!isWorker && onHide && (
            <button
              className="hide-btn"
              onClick={() => onHide(item)}
            >
              {item.hidden ? t("unhide") : t("hide")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
