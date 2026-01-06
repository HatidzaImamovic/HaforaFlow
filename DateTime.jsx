import "../App.css";
import { useState, useEffect } from "react";

export default function DateTime({className}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const dateString = now.toLocaleDateString();
  const timeString = now.toLocaleTimeString();

  return (
    <div className={className}>
     {dateString} — {timeString}
    </div>
  );
}
