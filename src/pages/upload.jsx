import React, { useState } from "react";
import "./uploads.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Uploads = () => {
  const [id, setId] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("2yrs");
  const baseUrl = import.meta.env.VITE_BASE_URL;
const formatDateForDisplay = (isoDate) => {
  if (!isoDate) return "";

  const [year, month, day] = isoDate.split("-");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthIndex = parseInt(month, 10) - 1; // Convert to 0-based index
  const monthName = monthNames[monthIndex] || month;

  return `${day}-${monthName}-${year}`;
};


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
    

    // Add 1 month to all durations
    endObj.setMonth(endObj.getMonth() + 1);

    const formattedEnd = endObj.toISOString().split("T")[0];
    setEndDate(formattedEnd);
  };

  const handleStartDateChange = (e) => {
    const start = e.target.value;
    setStartDate(start);

    if (start && duration !== "custom") {
      updateEndDate(start, duration);
    } else {
      setEndDate("");
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // 🔍 Frontend validations
  if (!id.trim()) return setError("ID is required.");
  if (!/^[a-zA-Z0-9]+$/.test(id)) return setError("Document ID must be alphanumeric.");
  if (!startDate || !endDate) return setError("Please select both start and end date.");
  if (!file) return setError("Please upload a PDF or image.");
  if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type)) {
    return setError("File must be a PDF, PNG, or JPG.");
  }

  // 📦 Create FormData
  const formData = new FormData();
  formData.append("id", id);
  formData.append("file", file);
  formData.append("startDate", startDate);
  formData.append("endDate", endDate);

  setError("");
  setSuccess("Uploading...");

  try {
    const res = await fetch(`${baseUrl}/api/upload/upload`,  {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      // ✅ Success
      const result = await res.json();
      console.log("Upload result:", result);

      setSuccess("File uploaded successfully!");
      setId("");
      setFile(null);
      setStartDate("");
      setEndDate("");

      // 🔄 Optionally refresh logs if you're managing local state
      // fetchLogs();
    } else {
      const errData = await res.json();
      setError(errData.error || "Upload failed.");
      setSuccess("");
    }
  } catch (err) {
    console.error("Upload error:", err);
    setError("Server error.");
    setSuccess("");
  }
};

  return (
    <div className="uploads-container">
      <h2 className="mb-4">Upload Document</h2>
<form onSubmit={handleSubmit} className="multi-block-form">

  <div className="form-block">
    <label>Batch Number</label>
    <input
      type="text"
      value={id}
      maxLength={10}
      minLength={10}
      onChange={(e) => setId(e.target.value)}
      placeholder="Enter Number"
    />
  </div>

  <div className="form-block">
    <label>Select File</label>
    <input
      type="file"
      accept=".pdf,.png,.jpg,.jpeg"
      onChange={(e) => setFile(e.target.files[0])}
    />
  </div>

  <div className="form-block full-width">
    <label>Set Duration</label>
    <select
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

  <div className="form-block">
    <label>Start Date</label>
    <input
      type="date"
      value={startDate}
      onChange={handleStartDateChange}
    />
    {startDate && (
      <small className="date-display">
        Selected: {formatDateForDisplay(startDate)}
      </small>
    )}
  </div>

  <div className="form-block">
    <label>End Date</label>
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      disabled={duration !== "custom"}
    />
    {endDate && (
      <small className="date-display">
        Selected: {formatDateForDisplay(endDate)}
      </small>
    )}
  </div>

</form>

  <div className="form-block">
    {error && <p className="message error">{error}</p>}
    {success && <p className="message success">{success}</p>}
    <button type="submit" className="submit-button" onClick={handleSubmit}>Upload</button>
  </div>




    </div>
  );
};

export default Uploads;
