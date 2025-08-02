import React, { useEffect, useState } from "react";
import "./inventory.css"; // Create this CSS
import { FaSearch, FaCalendarAlt, FaRegCalendarCheck, FaRegCalendarPlus } from "react-icons/fa";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

const baseUrl = import.meta.env.VITE_BASE_URL;

 useEffect(() => {
  const fetchData = async () => {
    try {
  const res = await fetch(`${baseUrl}/api/logs`);
      const data = await res.json();
      setProducts(data); // or setLogs(data)
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  fetchData();
}, []);


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this product?")) return;

    try {
      const res = await fetch(`${baseUrl}/api/upload/delete/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((item) => item._id !== id));
      } else {
        console.error("Delete failed.");
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
    await fetchLogs();
  };

  const filtered = products.filter((p) => {
    const created = new Date(p.uploadedAt);
    const matchYear = filterYear ? created.getFullYear().toString() === filterYear : true;
    const matchMonth = filterMonth ? created.getMonth().toString() === filterMonth : true;
    const matchDate = filterDate ? created.getDate().toString() === filterDate : true;

    const searchMatch = Object.values(p).some((val) =>
      val?.toString().toLowerCase().includes(search.toLowerCase())
    );

    return matchYear && matchMonth && matchDate && searchMatch;
  });
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  return (
    <div className="inventory-container">
      <h2>Inventory</h2>

   
<div className="filters">
  <div className="filter-group">
    <FaSearch className="filter-icon" />
    <input
      type="text"
      placeholder="Search all fields..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="filter-input"
    />
  </div>

  <div className="filter-group">
    <FaRegCalendarPlus className="filter-icon" />
    <select onChange={(e) => setFilterYear(e.target.value)} value={filterYear} className="filter-select">
      <option value="">All Years</option>
      {[...new Set(products.map(p => new Date(p.uploadedAt).getFullYear()))].map(y => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  </div>

  <div className="filter-group">
    <FaCalendarAlt className="filter-icon" />
    <select onChange={(e) => setFilterMonth(e.target.value)} value={filterMonth} className="filter-select">
      <option value="">All Months</option>
      {Array.from({ length: 12 }, (_, i) => (
        <option key={i} value={i}>
          {new Date(0, i).toLocaleString("default", { month: "long" })}
        </option>
      ))}
    </select>
  </div>

  <div className="filter-group">
    <FaRegCalendarCheck className="filter-icon" />
    <select onChange={(e) => setFilterDate(e.target.value)} value={filterDate} className="filter-select">
      <option value="">All Dates</option>
      {Array.from({ length: 31 }, (_, i) => (
        <option key={i} value={i + 1}>{i + 1}</option>
      ))}
    </select>
  </div>
</div>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Batch No</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Uploaded</th>
            <th>File</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
       {paginated.map((item, index) => (

            <tr key={item._id}>
           <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>

              <td>{item.docId}</td>
              <td>{new Date(item.startDate).toLocaleDateString()}</td>
              <td>{new Date(item.endDate).toLocaleDateString()}</td>
              <td>{new Date(item.uploadedAt).toLocaleString()}</td>
              <td>
                <a href={`${baseUrl}/uploads/${item.filePath}`} target="_blank" rel="noreferrer">
                  View
                </a>
              </td>
              <td>
                <i className="fas fa-trash-alt delete-icon" onClick={() => handleDelete(item._id)}></i>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination-controls">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    className="pagination-btn"
  >
    Prev
  </button>

  {[...Array(totalPages)].map((_, i) => (
    <button
      key={i}
      onClick={() => setCurrentPage(i + 1)}
      className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
    >
      {i + 1}
    </button>
  ))}

  <button
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
    className="pagination-btn"
  >
    Next
  </button>
</div>

    </div>
  );
};

export default Inventory;
