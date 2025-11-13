import React, { useState, useRef } from "react";
import "./uploads.css";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

const Uploads = () => {
  const [id, setId] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("2yrs");

  const fileInputRef = useRef(null); // ✅ Ref for file input
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${day}-${monthNames[parseInt(month, 10) - 1]}-${year}`;
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
    } else if (selectedDuration === "1yrs") {
      endObj.setFullYear(endObj.getFullYear() + 1);
    } else if (selectedDuration === "2.5yrs") {
      endObj.setFullYear(endObj.getFullYear() + 2);
      endObj.setMonth(endObj.getMonth() + 6);
    }

    endObj.setMonth(endObj.getMonth() + 1);
    setEndDate(endObj.toISOString().split("T")[0]);
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

  if (!id.trim()) {
    return toast.error("ID is required. Please enter a unique identifier for the document.");
  }

  if (!startDate || !endDate) {
    return toast.error("Please select both start and end dates.");
  }

  if (!file) {
    return toast.error("Please upload a PDF, PNG, or JPG file.");
  }

  const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
  if (!allowedTypes.includes(file.type)) {
    return toast.error("Invalid file type. Only PDF, PNG, or JPG are allowed.");
  }

  const formData = new FormData();
  formData.append("id", id);
  formData.append("file", file);
  formData.append("startDate", startDate);
  formData.append("endDate", endDate);


  try {
    const res = await fetch(`${baseUrl}/api/upload/upload`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      await res.json();
      toast.success("File uploaded successfully! ✅");

      // Reset all fields
      setId("");
      setFile(null);
      setStartDate("");
      setEndDate("");
      setDuration("2yrs");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      const errData = await res.json();
      toast.error(errData.error || "Upload failed. The server rejected your file.");
    }
  } catch (err) {
    console.error("Upload error:", err);
    toast.error("Server error. Unable to upload at the moment.");
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
            onChange={(e) => setId(e.target.value.trimStart())} // prevent leading space
            onBlur={(e) => setId(e.target.value.trim())} // clean up trailing space when done
            placeholder="Enter Number"
          />
        </div>

        <div className="form-block">
          <label>Select File</label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            ref={fileInputRef} // ✅ ref here
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

        <div className="form-block full-width">
          {error && <p className="message error">{error}</p>}
          {success && <p className="message success">{success}</p>}
          <button type="submit" className="submit-button">
            Upload
          </button>
        </div>
      </form>
    </div>
  );
};

export default Uploads;
