import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import api from "../utils/api";
import { notificationStyles as s } from "../assets/dummyStyles.jsx";
import useClickOutside from "../hooks/useClickoutside.js";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreads, setUnreads] = useState(0);
  const ref = useRef(null);

  useClickOutside(ref, () => setOpen(false), open);

  const load = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; // Don't try to fetch if not logged in

      const { data } = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` }, // 🔴 Attach Token
      });

      setItems(data.items || []);
      setUnreads(data.unreads || 0);
    } catch (error) {
      console.error(
        "Notifications Load Error:",
        error.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);

    if (next) {
      await load();
      if (unreads) {
        try {
          const token = localStorage.getItem("token");

          await api.patch(
            "/notifications/read",
            {},
            {
              headers: { Authorization: `Bearer ${token}` }, // 🔴 Attach Token
            },
          );

          setUnreads(0);
        } catch (error) {
          console.error(
            "Mark Read Error:",
            error.response?.data || error.message,
          );
        }
      }
    }
  };

  return (
    <div ref={ref} className={s.container}>
      <button onClick={toggle} className={s.bellButton}>
        <Bell size={17} />
        {unreads > 0 && <span className={s.badgeDot} />}
      </button>

      {open && (
        <div className={`${s.dropdown} notification-scrollbar`}>
          <div className={s.header}>
            <p className={s.headerText}>Notifications</p>
          </div>
          {items.length ? (
            items.map((item) => (
              <div
                key={item._id}
                className={`${s.notificationLink} ${
                  !item.read ? s.notificationUnread : ""
                }`}
              >
                <p className={s.notificationText}>
                  <span className={s.actorName}>
                    {item.actor?.name || "Someone"}
                  </span>{" "}
                  {item.type === "vote" ? "voted on" : "commented on"} your poll
                </p>
                <p className={s.pollPreview}>{item.poll?.question}</p>
              </div>
            ))
          ) : (
            <p className={s.emptyText}>No notifications yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
