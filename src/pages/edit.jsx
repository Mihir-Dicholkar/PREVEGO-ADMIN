import React, { useState } from "react";
import "./uploads.css";

const Edit = () => {
  const [batch, setBatch] = useState("");
  const [formData, setFormData] = useState(null); // full document
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
const [formId, setFormId] = useState(null); 
const [docId, setDocId] = useState("");
    const [duration, setDuration] = useState("2yrs");
const baseUrl = import.meta.env.VITE_BASE_URL;
const updateEndDate = (start, selectedDuration) => {
  const startObj = new Date(start);
  const endObj = new Date(startObj);

  if (selectedDuration === "2yrs")
    endObj.setFullYear(endObj.getFullYear() + 2);
  else if (selectedDuration === "3yrs")
    endObj.setFullYear(endObj.getFullYear() + 3);
  else if (selectedDuration === "1.5yrs") {
    endObj.setFullYear(endObj.getFullYear() + 1);
    endObj.setMonth(endObj.getMonth() + 6);
  }
  else if (selectedDuration === "1yrs") {
    endObj.setFullYear(endObj.getFullYear() + 1);
  }
  else if (selectedDuration === "2.5yrs") {
    endObj.setFullYear(endObj.getFullYear() + 2);
    endObj.setMonth(endObj.getMonth() + 6);
  }

  endObj.setMonth(endObj.getMonth() + 1);

  const formattedEnd = endObj.toISOString().split("T")[0];

  setFormData((prev) => ({
    ...prev,
    endDate: formattedEnd,
  }));
};

const handleStartDateChange = (e) => {
  const start = e.target.value;

  setFormData((prev) => ({
    ...prev,
    startDate: start,
  }));

  if (start && duration !== "custom") {
    updateEndDate(start, duration);
  } else {
    setFormData((prev) => ({
      ...prev,
      endDate: ""
    }));
  }
};


const handleFetch = async (e) => {
   e.preventDefault(); 
  setError("");
  setSuccess("");
  setShowModal(false);
  setFormId(null);

  try {
    const res = await fetch(`${baseUrl}/api/upload/get-by-docid/${batch}`);

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Batch not found.");
      return;
    }

    const data = await res.json();

    if (!data || !data._id) {
      setError("Invalid response from server.");
      return;
    }

    setFormId(data._id); // ✅ now safe
    setDocId(data.docId);
  
    setFormData(data);         // ✅ this is critical for form
setShowModal(true);

    // Optionally calculate year difference
    const yearDiff = new Date(data.endDate).getFullYear() - new Date(data.startDate).getFullYear();

    setFormData(data);   
    setShowModal(true); // Show the editing form now
  } catch (err) {
    console.error("Fetch error:", err);
    setError("Server error while fetching.");
  }
};

 const handleUpdate = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  const updated = new FormData();
  updated.append("docId", formData.docId);
  updated.append("startDate", formData.startDate);
  updated.append("endDate", formData.endDate);
  if (file) updated.append("file", file);

  try {
    const res = await fetch(`${baseUrl}/api/upload/edit/${formData._id}`, {
      method: "POST",
      body: updated,
    });

    if (res.ok) {
      const data = await res.json();
      setSuccess("Document updated successfully!");
      setShowModal(false);
      setFormData(null);
      setFile(null);
      setBatch("");
    } else {
      const text = await res.text();
      console.error("Server error:", text);
      setError("Update failed.");
    }
  } catch (err) {
  console.error("Edit error:", err);  // <- Add this if not there
  res.status(500).json({ message: "Edit failed", error: err.message });
}

};

  return (
    <>
        <div className="edits-container">
      <h2>Edit Document</h2>
      <form onSubmit={handleFetch} className="upload-form">
        <div className="field-group">
          <label htmlFor="batch">Enter Batch Number</label>
          <input
            type="text"
            id="batch"
            maxLength={10}
            minLength={10}
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="input"
          />
        </div>
        <button type="submit" className="submit-button">Fetch</button>
        {error && <p className="message error">{error}</p>}
        {success && <p className="message success">{success}</p>}
      </form>
      </div>

      {/* Modal Form */}
    {showModal && formData && (
      <div className="modal">
        <h3>Edit Batch: {formData.docId}</h3>
        <form onSubmit={handleUpdate} className="edit-form">
          <div className="field-group full-width">
            <label>Batch Number</label>
            <input
              type="text"
              maxLength={10}
              minLength={10}
              value={formData.docId}
              onChange={(e) =>
                setFormData({ ...formData, docId: e.target.value })
              }
              className="input"
            />
          </div>

          <div className="field-group full-width">
            <label htmlFor="duration">Set Duration</label>
            <select
              id="duration"
              className="input"
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                if (startDate && e.target.value !== "custom") {
                  updateEndDate(startDate, e.target.value);
                }
              }}
            >
              <option value="custom">Custom</option>
              <option value="1yrs">1 Years</option>
              <option value="1.5yrs">1.5 Years</option>
              <option value="2yrs">2 Years</option>
              <option value="2.5yrs">2.5 Years</option>
              <option value="3yrs">3 Years</option>
            </select>
          </div>

          <div className="field-group">
            <label>Start Date</label>
            <input
              type="date"
              value={formData.startDate?.slice(0, 10)}
              onChange={handleStartDateChange}
              className="input"
            />
          </div>

          <div className="field-group">
            <label>End Date</label>
            <input
              type="date"
              value={formData.endDate?.slice(0, 10)}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="input"
            />
          </div>

          <div className="field-group full-width">
            <label>Replace File (optional)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".pdf,.png,.jpg,.jpeg"
              className="input"
            />
          </div>

         <div className="modal-buttons full-width">
  <button type="submit" className="modal-update-button">Update</button>
  <button
    type="button"
    className="modal-cancel-button"
    onClick={() => {
      setShowModal(false);
      setFormData(null);
      setFile(null);
    }}
  >
    Cancel
  </button>
</div>

        </form>
      </div>   
 
)}
</>
   
  );
};

export default Edit;
