import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./log.css";

const Log = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const baseUrl = import.meta.env.VITE_BASE_URL;
const logsPerPage = 10;


 useEffect(() => {
  const fetchLogs = async () => {
    try {
        const res = await fetch(`${baseUrl}/api/logs`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  fetchLogs();
}, []);


const filteredLogs = logs
  .filter((log) => {
    if (!searchTerm) return true;
    return log.docId.toLowerCase().includes(searchTerm.toLowerCase());
  })
    .sort((a, b) =>
  sortAsc
    ? new Date(a.uploadedAt) - new Date(b.uploadedAt)
    : new Date(b.uploadedAt) - new Date(a.uploadedAt)
);

    const indexOfLastLog = currentPage * logsPerPage;
const indexOfFirstLog = indexOfLastLog - logsPerPage;
const sortedLogs = [...logs].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);



const totalPages = Math.ceil(filteredLogs.length / logsPerPage);


  return (
    <div className="log-container">
      <h2>Document Logs</h2>

      <div className="log-controls">
        <input
          type="text"
          placeholder="Search Document ID..."
          value={searchTerm}
        
          onChange={(e) => {
  setSearchTerm(e.target.value);
  setCurrentPage(1); // Reset to first page on search
}}

onClick={() => {
  setSortAsc(!sortAsc);
  setCurrentPage(1); // Reset on sort toggle
}}

        />

        <button     onChange={(e) => {
  setSearchTerm(e.target.value);
  setCurrentPage(1); // Reset to first page on search
}}

onClick={() => {
  setSortAsc(!sortAsc);
  setCurrentPage(1); // Reset on sort toggle
}}>
          Sort {sortAsc ? (
            <i className="fas fa-arrow-down-a-z"></i>
          ) : (
            <i className="fas fa-arrow-up-a-z"></i>
          )}
      
        </button>
      </div>

      <table className="log-table">
        <thead>
          <tr  >
            <th>#</th>
            <th>Document ID</th>
            <th>File</th>
               <th>Start Date</th>
    <th>End Date</th>  
            <th>Create/Update Date</th>
            <th>Status</th>
            <th>Changes</th>

          </tr>
        </thead>
        <tbody>
         {currentLogs.map((item, index) => (
          <tr key={item._id} className={item.status === "Deleted" ? "log-deleted-row" : ""}>

  <td>{indexOfFirstLog + index + 1}</td>
  <td>{item.docId}</td>
  <td>
    <a href={`${baseUrl}/uploads/${item.filePath}`} target="_blank" rel="noreferrer">
      <i className="fas fa-file-alt"></i> View
    </a>
  </td>
  <td>{item.startDate ? new Date(item.startDate).toLocaleDateString("en-GB") : "—"}</td>
  <td>{item.endDate ? new Date(item.endDate).toLocaleDateString("en-GB") : "—"}</td>
  <td>{new Date(item.uploadedAt).toLocaleString()}</td>
  
  <td>{item.status}</td>
  <td>
    {item.status === "Created"
      ? "—"
      : item.changes?.length
        ? item.changes.join(", ")
        : "Edited"}
  </td>
</tr>

          ))}
        </tbody>
      </table>
<div className="pagination">
  <button
    className="page-btn"
    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
  >
    « Prev
  </button>

  {/* First page + dots */}
  {currentPage > 2 && (
    <>
      <button className="page-btn" onClick={() => setCurrentPage(1)}>1</button>
      {currentPage > 3 && <span className="dots">...</span>}
    </>
  )}

  {/* Current ±1 pages */}
  {Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(page =>
      page === currentPage ||
      page === currentPage - 1 ||
      page === currentPage + 1
    )
    .map((page) => (
      <button
        key={page}
        className={`page-btn ${currentPage === page ? "active" : ""}`}
        onClick={() => setCurrentPage(page)}
      >
        {page}
      </button>
    ))}

  {/* Last page + dots */}
  {currentPage < totalPages - 1 && (
    <>
      {currentPage < totalPages - 2 && <span className="dots">...</span>}
      <button className="page-btn" onClick={() => setCurrentPage(totalPages)}>
        {totalPages}
      </button>
    </>
  )}

  <button
    className="page-btn"
    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
  >
    Next »
  </button>
</div>


    </div>
  );
};

export default Log;
