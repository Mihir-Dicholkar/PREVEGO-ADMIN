import { useContext, useEffect, useState } from "react";
import { MaintenanceContext } from "./context/MaintenanceContext";
import { Outlet, NavLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { FaBars, FaUpload, FaHistory, FaUserGraduate, FaEdit, FaWarehouse } from "react-icons/fa";
import "./admin.css";

function AdminApp() {
  const { maintenance, setMaintenance } = useContext(MaintenanceContext);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // -----------------------
  // Countdown Timer
  // -----------------------
  useEffect(() => {
    if (maintenance.active && maintenance.endTime) {
      const interval = setInterval(() => {
        const diff = new Date(maintenance.endTime).getTime() - Date.now();
        if (diff <= 0) {
          clearInterval(interval);
          setMaintenance({ active: false, endTime: null });
          setTimeLeft(0);
        } else {
          setTimeLeft(diff);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [maintenance, setMaintenance]);

  // -----------------------
  // Initial fetch + SSE
  // -----------------------
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_BASE_URL;

    // Initial fetch
    const fetchMaintenance = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/maintenance`);
        const data = await res.json();
        if (data.endTime) data.endTime = new Date(data.endTime).getTime();
        setMaintenance(data);
      } catch (err) {
        console.error("Failed to fetch maintenance state:", err);
      }
    };
    fetchMaintenance();

    // SSE subscription
    const eventSource = new EventSource(`${baseUrl}/api/maintenance/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.endTime) data.endTime = new Date(data.endTime).getTime();
        setMaintenance(data);
      } catch (err) {
        console.error("Failed to parse SSE:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [setMaintenance]);

  // -----------------------
  // Logout
  // -----------------------
  const handleLogout = async () => {
    const token = localStorage.getItem("adminToken");
    const baseUrl = import.meta.env.VITE_BASE_URL;

    if (token) {
      await fetch(`${baseUrl}/api/admin/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    navigate("/", { replace: true });
  };

  // -----------------------
  // Role & sidebar
  // -----------------------
  useEffect(() => {
    const savedRole = localStorage.getItem("adminRole");
    setRole(savedRole);

    // Prevent browser from caching protected pages
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", () => {
      window.history.pushState(null, "", window.location.href);
    });

    return () => {
      window.removeEventListener("popstate", () => {});
    };
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // -----------------------
  // Countdown format
  // -----------------------
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // -----------------------
  // JSX
  // -----------------------
  return (
    <>
      {/* Logout Button */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <button
          onClick={handleLogout}
          title="Logout"
          style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "#444" }}
        >
          <FiLogOut />
        </button>
      </div>

      <div className="admin-container d-flex">
        {/* Sidebar toggle */}
        <button className="menu-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "show" : "hide"}`}>
          <div className="sidebar-header">
            <img src="/White.png" alt="Logo" className="sidebar-logo" />
            <h2>Admin Panel</h2>
          </div>
          <ul className="sidebar-menu">
            <li>
              <NavLink to="upload" className="sidebar-link">
                <FaUpload className="nav-icon" />
                <span>Upload</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="edit" className="sidebar-link">
                <FaEdit className="nav-icon" />
                <span>Edit</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="log" className="sidebar-link">
                <FaHistory className="nav-icon" />
                <span>Log</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="inventory" className="sidebar-link">
                <FaWarehouse className="nav-icon" />
                <span>Inventory</span>
              </NavLink>
            </li>
            {role === "superadmin" && (
              <li>
                <NavLink to="settings" className="sidebar-link">
                  <FaUserGraduate className="nav-icon" />
                  <span>SUPER ADMIN</span>
                </NavLink>
              </li>
            )}
          </ul>
        </aside>

        {/* Main Content */}
        <main className={`admin-content ${!sidebarOpen ? "collapsed" : ""}`}>
          {maintenance.active && (
            <div className="maintenance-banner">
              ⚠️ Site is Under Maintenance ⚠️
              <span className="banner-date"> | Date: {today}</span>
              <span className="banner-timer"> | Time Left: {formatTime(timeLeft)}</span>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default AdminApp;
