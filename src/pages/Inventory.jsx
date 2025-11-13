import React, { useEffect, useState } from "react";
import "./inventory.css"; // Create this CSS
import { toast } from "react-toastify";
import { FaSearch, FaRegCalendarPlus, FaCalendarAlt, FaRegCalendarCheck, 
         FaFileAlt, FaTrashAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState([]);

  const itemsPerPage = 14;

  const baseUrl = import.meta.env.VITE_BASE_URL;

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/upload/all`);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      toast.error("Failed to fetch inventory data");
    }
  };

  fetchData();
}, []);

const fetchLogs = async () => {
  try {
    const res = await fetch(`${baseUrl}/api/logs`);
    const data = await res.json();
    setLogs(data);
  } catch (err) {
    console.error("Error fetching logs:", err);
    toast.error("Failed to fetch logs");
  }
};

const handleDelete = async (id) => {
  if (!window.confirm("Are you sure to delete this product?")) return;

  try {
    const res = await fetch(`${baseUrl}/api/upload/delete/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setProducts((prev) => prev.filter((item) => item._id !== id));
      toast.success("Product deleted successfully");
    } else {
      toast.error("Delete failed.");
    }
  } catch (err) {
    console.error("Error deleting:", err);
    toast.error("Error deleting product");
  }
  await fetchLogs();
};


  const filteredProducts = products.filter((p) => {
    const created = new Date(p.uploadedAt);
    const matchYear = filterYear
      ? created.getFullYear().toString() === filterYear
      : true;
    const matchMonth = filterMonth
      ? created.getMonth().toString() === filterMonth
      : true;
    const matchDate = filterDate
      ? created.getDate().toString() === filterDate
      : true;

    const searchMatch = Object.values(p).some((val) =>
      val?.toString().toLowerCase().includes(search.toLowerCase())
    );

    return matchYear && matchMonth && matchDate && searchMatch;
  });
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginated = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
 <div className="inventory-container">
  <div className="inventory-header">
    <h2>Inventory </h2>
    <div className="header-actions">
      <span className="records-count">{filteredProducts.length} records</span>
    </div>
  </div>

  {/* Enhanced Filters */}
  <div className="filters">
    <div className="filter-group search-group">
      <FaSearch className="filter-icon" />
      <input
        type="text"
        placeholder="Search by Batch No, File, or Date..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="filter-input"
      />
    </div>

    <div className="date-filter-group">
      <span className="filter-label">Uploaded Date:</span>
      
      <div className="filter-group">
        <FaRegCalendarPlus className="filter-icon" />
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="filter-select">
          <option value="">All Years</option>
          {[...new Set(products.map(p => new Date(p.uploadedAt).getFullYear()))]
            .sort((a,b) => b-a)
            .map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <FaCalendarAlt className="filter-icon" />
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="filter-select">
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
        <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="filter-select">
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </select>
      </div>
    </div>
  </div>

  {/* Professional Table */}
  <div className="table-wrapper">
    <table className="inventory-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Batch No</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Uploaded On</th>
          <th>File</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {paginated.length === 0 ? (
          <tr>
            <td colSpan="7" className="no-data">
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>No inventory records found</p>
              </div>
            </td>
          </tr>
        ) : (
          paginated.map((item, index) => (
            <tr key={item._id} className="table-row-hover">
              <td className="serial">{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td className="batch-no"><strong>{item.docId}</strong></td>
              <td>{new Date(item.startDate).toLocaleDateString('en-IN')}</td>
              <td>{new Date(item.endDate).toLocaleDateString('en-IN')}</td>
              <td className="date-cell">
                <div>{new Date(item.uploadedAt).toLocaleDateString('en-IN')}</div>
                <small style={{color:'#666', fontSize:'0.75rem'}}>
                  {new Date(item.uploadedAt).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}
                </small>
              </td>
              <td>
                <a
                  href={`${baseUrl}/uploads/${item.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="view-link"
                >
                  <FaFileAlt /> View File
                </a>
              </td>
              <td>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="delete-btn"
                  title="Delete batch"
                >
                  <FaTrashAlt />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

  {/* Enhanced Pagination */}
  <div className="pagination-controls">
    <button
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="pagination-btn"
    >
      <FaChevronLeft /> Previous
    </button>

    <div className="page-numbers">
      {currentPage > 3 && <button onClick={() => setCurrentPage(1)} className="pagination-btn">1</button>}
      {currentPage > 4 && <span className="pagination-dots">...</span>}

      {[...Array(totalPages)].map((_, i) => {
        if (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1) {
          return (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          );
        }
        return null;
      })}

      {currentPage < totalPages - 3 && <span className="pagination-dots">...</span>}
      {totalPages > 1 && currentPage < totalPages - 2 && (
        <button onClick={() => setCurrentPage(totalPages)} className="pagination-btn">
          {totalPages}
        </button>
      )}
    </div>

    <button
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="pagination-btn"
    >
      Next <FaChevronRight />
    </button>
  </div>
</div>
  );
};

export default Inventory;
