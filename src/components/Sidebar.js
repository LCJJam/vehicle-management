import React from "react";
import "./Sidebar.css";

function Sidebar({ onSave, onLoad }) {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      onLoad(file);
    }
  };

  return (
    <div className="sidebar">
      <button onClick={onSave}>배차 기록 저장</button>
      <label htmlFor="file-upload" className="file-upload-label">
        배차 기록 불러오기
        <input
          type="file"
          id="file-upload"
          accept="application/json"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
}

export default Sidebar;
