import { useEffect, useState, useRef } from "react";
import NavbarMain from "../components/NavbarMain";
import ItemCard from "../components/ItemCard";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import MessageModal from "../components/MessageModal";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import AddWorkerModal from "../components/AddWorkerModal";
import EditWorkerModal from "../components/EditWorkerModal";

import "../App.css";
import { useLanguage } from "../contexts/LanguageContext";

export default function ManagerView() {
  const { t } = useLanguage();
  // ---------------- STATE ----------------
  const [messages, setMessages] = useState([]);
  const [openMessage, setOpenMessage] = useState(null);

  const [view, setView] = useState("cafe");
  const [items, setItems] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [reload, setReload] = useState(0);

  const [workers, setWorkers] = useState([]);
  const [addWorkerOpen, setAddWorkerOpen] = useState(false);
  const [editWorker, setEditWorker] = useState(null);
  const [deleteWorker, setDeleteWorker] = useState(null);
  const [workerView, setWorkerView] = useState("cafe"); 
  // cafe | market | kitchen
  const [showArchived, setShowArchived] = useState(false);
  const [workersHeight, setWorkersHeight] = useState(320);
  const isResizingRef = useRef(false);

  // ---------------- LOAD MESSAGES ----------------
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("managerMessages")) || [];
    setMessages(stored);
  }, []);

  // ---------------- FETCH ITEMS ----------------
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setItems([]);

        const url =
          view === "cafe"
            ? "http://localhost:5000/api/items"
            : "http://localhost:5000/api/market/items";

        const res = await fetch(url);
        const data = await res.json();

        // Sort: visible items first, hidden items last
        const sortedItems = data.sort((a, b) => {
          if (a.hidden === b.hidden) return 0;
          return a.hidden ? 1 : -1;
        });

        setItems(sortedItems);
      } catch (err) {
        console.error("Error fetching items:", err);
        setItems([]);
      }
    };

    fetchItems();

    const loadMessages = () => {
      const stored =
        JSON.parse(localStorage.getItem("managerMessages")) || [];

      const sorted = [...stored].sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setMessages(sorted);
    };

    loadMessages();
    window.addEventListener("managerMessagesUpdated", loadMessages);

    return () => {
      window.removeEventListener("managerMessagesUpdated", loadMessages);
    };
  }, [view, reload]);

  // ---------------- FETCH WORKERS ----------------
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/workers");
        const data = await res.json();
        setWorkers(data);
      } catch (err) {
        console.error("Error fetching workers:", err);
        setWorkers([]);
      }
    };

    fetchWorkers();
  }, [reload]);

  // ---------------- MESSAGE OPEN ----------------
  const openMsg = (msg) => {
    const updated = messages.map((m) =>
      m.id === msg.id ? { ...m, read: true } : m
    );

    localStorage.setItem("managerMessages", JSON.stringify(updated));
    setMessages(updated);
    setOpenMessage({ ...msg, read: true });
  };

  // ---------------- DELETE ITEM ----------------
  const handleDeleteItemConfirm = async () => {
    if (!deleteItem) return;

    try {
      const url =
        view === "cafe"
          ? `http://localhost:5000/api/items/${deleteItem.id}`
          : `http://localhost:5000/api/market/items/${deleteItem.id}`;

      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error();

      setItems(prev => prev.filter(i => i.id !== deleteItem.id));
      setDeleteItem(null);
    } catch {
      alert(t("failed_delete_item"));
    }
  };

  // ---------------- DELETE WORKER ----------------
  const handleDeleteWorkerConfirm = async () => {
    if (!deleteWorker) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/workers/${deleteWorker.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error();

      setWorkers(prev =>
        prev.filter(w => w.id !== deleteWorker.id)
      );

      setDeleteWorker(null);
    } catch {
      alert(t("failed_delete_worker"));
    }
  };

  const filteredWorkers = workers.filter(w =>
  w.role === workerView &&
  (showArchived ? w.archived : !w.archived)
);


  // ---------------- TOGGLE HIDE ----------------
  const handleToggleHide = async (item) => {
    try {
      const url =
        view === "cafe"
          ? `http://localhost:5000/api/items/${item.id}/hide`
          : `http://localhost:5000/api/market/items/${item.id}/hide`;

      await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !item.hidden })
      });

      setItems(prev => {
        const updated = prev.map(i =>
          i.id === item.id ? { ...i, hidden: !i.hidden } : i
        );
        // Sort visible first
        return updated.sort((a, b) => {
          if (a.hidden === b.hidden) return 0;
          return a.hidden ? 1 : -1;
        });
      });
    } catch {
      alert(t("failed_hide_item"));
    }
  };
  const handleArchiveWorker = async (worker) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/workers/${worker.id}/archive`,
      { method: "PATCH" }
    );

    if (!res.ok) throw new Error();

    setWorkers(prev =>
      prev.map(w =>
        w.id === worker.id ? { ...w, archived: true } : w
      )
    );
  } catch {
    alert(t("failed_archive_worker"));
  }
};
const startResize = () => {
  isResizingRef.current = true;
  document.body.style.cursor = "row-resize";
};

const stopResize = () => {
  isResizingRef.current = false;
  document.body.style.cursor = "default";
};

const handleMouseMove = (e) => {
  if (!isResizingRef.current) return;

  const topOffset = document.querySelector(".manager-right").getBoundingClientRect().top;
  const newHeight = e.clientY - topOffset;

  // limits (VERY important)
  if (newHeight < 120 || newHeight > window.innerHeight - 250) return;

  setWorkersHeight(newHeight);
};

useEffect(() => {
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", stopResize);

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", stopResize);
  };
}, []);
  // ---------------- RENDER ----------------
  return (
    <div className="manager-view">
      <NavbarMain />

      <div className="manager-grid">
        {/* LEFT — INBOX */}
        <div className="manager-inbox">
          <h3>{t("inbox")}</h3>
          {messages.length === 0 && <p className="empty">{t("no_messages")}</p>}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`inbox-item ${msg.read ? "" : "unread"}`}
              onClick={() => openMsg(msg)}
            >
              <div className="inbox-title">{msg.title}</div>
              <div className="inbox-sub">{msg.productName}</div>
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div className="manager-right">
          {/* WORKERS */}
          <div
  className="manager-top"
  style={{ height: workersHeight }}
>

            <div className="manager-workers">
              <h3>{t("workers_title")}</h3>

              <div className="worker-toggle">
                <button
                  className="add-worker-btn"
                  onClick={() => setAddWorkerOpen(true)}
                >
                  +
                </button>

                {["cafe", "market", "kitchen"].map(r => (
                  <button
                    key={r}
                    className={workerView === r ? "active" : ""}
                    onClick={() => setWorkerView(r)}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
                <button
  className={showArchived ? "active" : ""}
  onClick={() => setShowArchived(p => !p)}
>
  {showArchived ? t("archived") : t("active")}
</button>

              </div>

              <div className="worker-row">
                {filteredWorkers.map(w => (
                  <ItemCard
  key={w.id}
  item={{
    id: w.id,
    name: w.username,
    image: "worker.png",
    role: w.role,
    password: w.password,
    archived: w.archived
  }}
  manager
  onEdit={() => setEditWorker(w)}
  onDelete={() => setDeleteWorker(w)}
  onArchive={() => handleArchiveWorker(w)}
/>
                ))}
              </div>
            </div>
          </div>
          <div
  className="resize-bar"
  onMouseDown={startResize}
/>


          {/* ITEMS */}
          <div className="manager-bottom">
            <div className="items-header">
              <div className="item-toggle">
                <button
                  className="add-item-btn"
                  style={{ background: "#007bff" }}
                  onClick={() => setAddOpen(true)}
                >
                  +
                </button>

                <button
                  className={view === "cafe" ? "active" : ""}
                  onClick={() => setView("cafe")}
                >
                  {t("cafe_items")}
                </button>
                <button
                  className={view === "market" ? "active" : ""}
                  onClick={() => setView("market")}
                >
                  {t("market_items")}
                </button>
              </div>
            </div>

            <div className="items-grid manager-items-grid">
              {items.map(item => (
                <ItemCard
                  key={`${view}-${item.id}`}
                  item={item}
                  manager
                  onEdit={() => setEditItem(item)}
                  onDelete={() => setDeleteItem(item)}
                  onHide={handleToggleHide}  
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* MODALS */}
      {addOpen && (
        <AddItemModal
          view={view}
          onClose={() => setAddOpen(false)}
          onSaved={() => {
            setReload(r => r + 1);
            setAddOpen(false);
          }}
        />
      )}

      {deleteItem && (
        <DeleteConfirmModal
          item={deleteItem}
          onCancel={() => setDeleteItem(null)}
          onConfirm={handleDeleteItemConfirm}
        />
      )}

      {deleteWorker && (
        <DeleteConfirmModal
          item={{ name: deleteWorker.username }}
          onCancel={() => setDeleteWorker(null)}
          onConfirm={handleDeleteWorkerConfirm}
        />
      )}

      {editItem && (
        <EditItemModal
          item={editItem}
          view={view}
          onClose={() => setEditItem(null)}
          onSaved={() => {
            setReload(r => r + 1);
            setEditItem(null);
          }}
        />
      )}

      {addWorkerOpen && (
        <AddWorkerModal
          onClose={() => setAddWorkerOpen(false)}
          onCreated={(worker) => {
            setWorkers(prev => [worker, ...prev]);
            setAddWorkerOpen(false);
          }}
        />
      )}

      {editWorker && (
        <EditWorkerModal
          worker={editWorker}
          onClose={() => setEditWorker(null)}
          onSaved={() => {
            setReload(r => r + 1);
            setEditWorker(null);
          }}
        />
      )}

      <MessageModal
        message={openMessage}
        onClose={() => setOpenMessage(null)}
      />
      <footer className="footer">
        &copy; {new Date().getFullYear()} {t("footer_copyright")}
      </footer>
    </div>
    
  );
}
