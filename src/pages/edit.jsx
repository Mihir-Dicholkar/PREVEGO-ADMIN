import React, { useState } from "react";
import "./uploads.css";
import { toast } from "react-toastify";

const Edit = () => {
  const [batch, setBatch] = useState("");
  const [formData, setFormData] = useState(null); // full document
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formId, setFormId] = useState(null);
  const [docId, setDocId] = useState("");
  const [originalData, setOriginalData] = useState(null);
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
    } else if (selectedDuration === "1yrs") {
      endObj.setFullYear(endObj.getFullYear() + 1);
    } else if (selectedDuration === "2.5yrs") {
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
        endDate: "",
      }));
    }
  };

  const handleFetch = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowModal(false);
    setFormId(null);

    // ✅ Validation before API call
    if (!batch || batch.trim() === "") {
     toast.error("Please enter a valid batch number.");

      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/upload/get-by-docid/${batch}`);

      if (!res.ok) {
        let errMsg = "Batch not found.";
        try {
          const err = await res.json();
          if (err?.error) errMsg = err.error;
        } catch {
          // fallback if server didn’t return JSON
        }
         toast.error(errMsg);
        return;
      }

      const data = await res.json();
      if (file && !["application/pdf", "image/png", "image/jpeg"].includes(file.type)) {
  toast.error("Invalid file type. Allowed: PDF, PNG, JPG, JPEG.");
  return;
}


      if (!data || !data._id || !data.docId) {
       toast.error("Invalid response from server.");
        return;
      }
      // Build a usable file URL
      if (data.filePath) {
        data.fileUrl = `${baseUrl}/${data.filePath}`;
      }

      // ✅ Store values safely
      setFormId(data._id);
      setDocId(data.docId);
      setFormData(data);
        setOriginalData({ ...data });
      // ✅ Duration calculation
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const months =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());

        let detectedDuration = "custom";
        if (months === 13) detectedDuration = "1yrs"; // +1 month rule
        else if (months === 19) detectedDuration = "1.5yrs";
        else if (months === 25) detectedDuration = "2yrs";
        else if (months === 31) detectedDuration = "2.5yrs";
        else if (months === 37) detectedDuration = "3yrs";

        setDuration(detectedDuration);
      } else {
        setDuration("custom");
      }

      setShowModal(true); // ✅ Show edit modal after data is ready
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Server error while fetching. Please try again.");
    }
  };


  const hasChanges = () => {
  if (!formData || !originalData) return false;

  // Compare docId, startDate, endDate
  if (
    formData.docId !== originalData.docId ||
    formData.startDate !== originalData.startDate ||
    formData.endDate !== originalData.endDate
  ) {
    return true;
  }

  // Check if a new file is selected
  if (file) return true;

  return false;
};

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!formData.startDate && !formData.endDate && !file) {
      toast.error("Please update at least one field before submitting.");
      return;
    }
      if (!hasChanges()) {
    toast.error("Please make some changes before updating.");
    return;
  } 

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
        toast.success("Document updated successfully!");
        setShowModal(false);
        setFormData(null);
        setFile(null);
        setBatch("");
      } else {
        const text = await res.text();
        console.error("Server error:", text);
          toast.error("Update failed.");
      }
    } catch (err) {
      console.error("Edit error:", err); // <- Add this if not there
     toast.error("Server error while updating. Please try again.");
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
              value={batch}
              onChange={(e) => setBatch(e.target.value.trimStart())} // trims only leading space as user types
              onBlur={(e) => setBatch(e.target.value.trim())} // trims both sides when input loses focus
              className="input"
            />
          </div>
          <button type="submit" className="submit-button">
            Fetch
          </button>
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
                  if (formData?.startDate && e.target.value !== "custom") {
                    updateEndDate(formData.startDate, e.target.value);
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
                value={formData.endDate?.slice(0, 10) || ""}
                disabled={duration !== "custom"} // ✅ Disable unless "custom" selected
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className={`input ${
                  duration !== "custom" ? "opacity-50 cursor-not-allowed" : ""
                }`} // Optional styling
              />
            </div>

            <div className="field-group full-width">
              <label>Replace File (optional)</label>
           <input
    type="file"
    onChange={(e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
        if (!allowedTypes.includes(selectedFile.type)) {
          toast.error("Invalid file type. Allowed: PDF, PNG, JPG, JPEG.");
          setFile(null); // reset file if invalid
          e.target.value = null; // reset the input field
        } else {
          setFile(selectedFile);
        }
      }
    }}
    accept=".pdf,.png,.jpg,.jpeg"
    className="input"
  />
            </div>

            <div className="modal-buttons full-width">
              <button 
             
              type="submit" className="modal-update-button">
                Update
              </button>
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
