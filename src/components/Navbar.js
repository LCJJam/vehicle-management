import React, { useState } from "react";
import "./Navbar.css";

function Navbar({
  isVisible,
  setIsNavbarVisible,
  savedRecords,
  saveRecord,
  loadRecord,
  removeRecord,
}) {
  const [recordTitle, setRecordTitle] = useState("");

  const handleSave = () => {
    if (!recordTitle.trim()) {
      alert("제목을 입력하세요!");
      return;
    }
    saveRecord(recordTitle);
    setRecordTitle(""); // 저장 후 제목 초기화
  };

  return (
    <div className={`navbar ${isVisible ? "visible" : ""}`}>
      <h2>배차 기록 관리</h2>
      <div className="navbar-content">
        <input
          type="text"
          placeholder="배차 제목 입력"
          value={recordTitle}
          onChange={(e) => setRecordTitle(e.target.value)}
        />
        <button onClick={handleSave}>저장</button>
        <ul className="record-list">
          {savedRecords.map((record, index) => (
            <li key={index} className="record-item">
              <span onClick={() => loadRecord(index)}>
                {record.title} ({record.date})
              </span>
              <span>
                <button
                  className="delete-record-btn"
                  onClick={() => removeRecord(index)}
                >
                  삭제
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
