const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  readFile: (type) => ipcRenderer.invoke("read-file", type),
  writeFile: (type, content) => ipcRenderer.invoke("write-file", type, content),
});
