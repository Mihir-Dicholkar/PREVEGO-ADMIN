// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1 style={{ fontSize: "3rem", color: "#ff4d4f" }}>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn’t exist or you don’t have access.</p>
      <Link to="/" style={{ color: "#007bff" }}>
        Go to Login
      </Link>
    </div>
  );
};

export default NotFound;
