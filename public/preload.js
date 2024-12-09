const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  readFile: (fileName) => ipcRenderer.invoke("read-file", fileName),
  writeFile: (fileName, data) =>
    ipcRenderer.invoke("write-file", fileName, data),
});
