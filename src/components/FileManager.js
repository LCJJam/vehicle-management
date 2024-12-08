import React, { useState, useEffect } from "react";

function FileManager() {
  const [fileData, setFileData] = useState("");

  // 파일 데이터를 Electron에서 읽어오기
  useEffect(() => {
    window.electronAPI.readFile().then((data) => setFileData(data));
  }, []);

  // 파일 데이터를 Electron에 저장
  const saveFile = () => {
    window.electronAPI.writeFile(fileData).then(() => alert("File saved!"));
  };

  return (
    <div>
      <h2>File Manager</h2>
      <textarea
        value={fileData}
        onChange={(e) => setFileData(e.target.value)}
        rows="10"
        cols="50"
      />
      <button onClick={saveFile}>Save File</button>
    </div>
  );
}

export default FileManager;
