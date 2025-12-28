import "../App.css";

export default function ItemCard({
  item,
  onClick,
  manager = false,
  onDelete,
  onHide,
  onArchive
}) {
  const isWorker = !!item.role;

  // Decide image based on worker role
  const getImage = () => {
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

    return item.image || item.img || "placeholder.png";
  };

  return (
    <div
      className="item-card"
      onClick={!manager && onClick ? () => onClick(item) : undefined}
      style={{ cursor: manager ? "default" : "pointer" }}
    >
      <img src={`/images/${getImage()}`} alt={item.name} />

      <h3>{item.name}</h3>

      {/* ITEM PRICE (only for products) */}
      {!isWorker && item.price !== undefined && (
        <p>BAM {item.price.toFixed(2)}</p>
      )}

      {manager && (
        <div className="manager-card-buttons">
          <button
            className="delete-btn"
            onClick={() => onDelete(item)}
          >
            Delete
          </button>
          {isWorker && !item.archived && onArchive && (
  <button
    className="archive-btn"
    onClick={() => onArchive(item)}
  >
    Archive
  </button>
)}

          {/* 🔥 Hide ONLY for cafe/market items */}
          {!isWorker && onHide && (
            <button
              className="hide-btn"
              onClick={() => onHide(item)}
            >
              {item.hidden ? "Unhide" : "Hide"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
