import "../App.css";
import { useState, useEffect } from "react";

export default function DateTime() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const dayName = now.toLocaleDateString(undefined, { weekday: "long" });
  const dateString = now.toLocaleDateString();
  const timeString = now.toLocaleTimeString();

  return (
    <div className="date-time">
      {dayName}, {dateString} — {timeString}
    </div>
  );
}
