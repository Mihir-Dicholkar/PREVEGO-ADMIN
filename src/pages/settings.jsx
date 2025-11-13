import React, { useContext, useEffect, useState } from "react";
import { MaintenanceContext } from "../context/MaintenanceContext";
import "./settings.css";

const Settings = () => {
  const { maintenance, setMaintenance } = useContext(MaintenanceContext);
  const [countdown, setCountdown] = useState("");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const toggleMaintenance = async () => {
    let newState;
    if (!maintenance.active) {
      const endTime = Date.now() + 60 * 60 * 1000; // 1 hour from now
      newState = { active: true, endTime };
    } else {
      newState = { active: false, endTime: null };
    }

    try {
      const token = localStorage.getItem("adminToken"); // already stored at login

      const res = await fetch(`${baseUrl}/api/maintenance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newState),
      });

      const data = await res.json();
      if (res.ok) {
        setMaintenance(data);
      } else {
        console.error("Error:", data.error);
      }
    } catch (err) {
      console.error("Failed to update maintenance:", err);
    }
  };

  


  // ⏳ Countdown effect
useEffect(() => {
  let timer;
  if (maintenance.active && maintenance.endTime) {
    const updateCountdown = () => {
      const endTime = new Date(maintenance.endTime).getTime(); // ✅ parse string to number
      const now = Date.now();
      const distance = endTime - now;

      if (distance <= 0) {
        setCountdown("Expired");
        clearInterval(timer);
        return;
      }

      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setCountdown(
        `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s left`
      );
    };

    updateCountdown();
    timer = setInterval(updateCountdown, 1000);
  } else {
    setCountdown("");
  }

  return () => clearInterval(timer);
}, [maintenance]);

  return (
    <div className="settings-container">
      <h2 className="settings-heading">Super Admin Settings</h2>

      <button
        onClick={toggleMaintenance}
        className={maintenance.active ? "btn btn-danger" : "btn btn-success"}
      >
        {maintenance.active ? "Disable Maintenance" : "Enable Maintenance"}
      </button>

  
    </div>
  );
};

export default Settings;
