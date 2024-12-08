const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

const isDevelopment = !app.isPackaged;
const dataDir = isDevelopment
  ? path.join(__dirname, "data") // 개발 환경: 현재 프로젝트 경로에 "data" 디렉토리
  : path.join(path.dirname(app.getPath("exe")), "data"); // 배포 환경: 실행 파일 경로에 "data" 디렉토리
const dataPath = path.join(dataDir, "personList.json");

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const startUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`;

  mainWindow.loadURL(startUrl);

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
}

// 앱 초기화
app.on("ready", () => {
  createWindow();

  // ./data 디렉토리 생성
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // ./data/personList.json 파일 생성(없을 경우)
  if (!fs.existsSync(dataPath)) {
    const initialData = { drivers: [], passengers: [] };
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2), "utf-8");
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC 핸들러: 파일 읽기
ipcMain.handle("read-file", async () => {
  return fs.promises.readFile(dataPath, "utf-8");
});

// IPC 핸들러: 파일 쓰기
ipcMain.handle("write-file", async (event, content) => {
  try {
    console.log("저장할 데이터:", content); // 로그로 확인
    await fs.promises.writeFile(dataPath, content, "utf-8");
    return true;
  } catch (err) {
    console.error("파일 쓰기 실패:", err);
    throw err;
  }
});
