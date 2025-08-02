import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa"; // Menu icon
import { FaUpload, FaHistory, FaEdit, FaWarehouse } from "react-icons/fa";
import './admin.css'
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles"; 


const particlesInit = async (main) => {
  await loadFull(main);
};


function AdminApp() {
    const [theme, setTheme] = useState("theme-dark");
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

const toggleSidebar = () => {
  setSidebarOpen(!sidebarOpen);
};
  // Apply selected theme to body class
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);
    return (
      <>
     <div style={{
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 1000,
  background: "#fff",
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  display: "flex",
  alignItems: "center",
  gap: "1rem"
}}>
  <label htmlFor="themeSelect" style={{ fontWeight: 600 }}>Theme:</label>
  <select
    id="themeSelect"
    value={theme}
    onChange={(e) => setTheme(e.target.value)}
    style={{ padding: "4px 8px", borderRadius: "5px" }}
  >
    <option value="theme-dark">Dark</option>
    <option value="theme-light">Light</option>
    <option value="theme-vibrant">Vibrant</option>
  </select>

  <button
    onClick={() => navigate("/")} // change path as needed
    title="Logout"
    style={{
      background: "transparent",
      border: "none",
      cursor: "pointer",
      fontSize: "1.5rem",
      color: "#444",
    }}
  >
    <FiLogOut />
  </button>
</div>

      <div className="admin-container d-flex">
       
        <button className="menu-toggle" onClick={toggleSidebar}>
  <FaBars />
</button>

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
  </ul>
</aside>

      <main  className={`admin-content ${!sidebarOpen ? "collapsed" : ""}`}>

        <Outlet />
      </main>
    </div>
    </>
  );
}


export default AdminApp;
