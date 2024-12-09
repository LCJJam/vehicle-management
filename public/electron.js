const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

const dataDir = path.join(app.getPath("userData"), "data");
const driversPath = path.join(dataDir, "drivers.json");
const passengersPath = path.join(dataDir, "passengers.json");
const savedRecordsPath = path.join(dataDir, "savedRecords.json");

const initializeFiles = () => {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const defaultDrivers = [];
  const defaultPassengers = [];
  const defaultSavedRecords = [];

  // Drivers 파일 생성 또는 유지
  if (!fs.existsSync(driversPath)) {
    fs.writeFileSync(driversPath, JSON.stringify(defaultDrivers, null, 2));
  }

  // Passengers 파일 생성 또는 유지
  if (!fs.existsSync(passengersPath)) {
    fs.writeFileSync(
      passengersPath,
      JSON.stringify(defaultPassengers, null, 2)
    );
  }

  // SavedRecords 파일 생성 또는 유지
  if (!fs.existsSync(savedRecordsPath)) {
    fs.writeFileSync(
      savedRecordsPath,
      JSON.stringify(defaultSavedRecords, null, 2)
    );
  }
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
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

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(() => {
  createWindow();
  initializeFiles();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.handle("read-file", async (event, fileName) => {
  try {
    const filePath = path.join(app.getPath("userData"), fileName);

    // 파일 존재 여부 확인
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${fileName}, returning default data.`);
      return JSON.stringify([]); // 기본값 반환
    }

    // 파일 읽기
    const data = await fs.promises.readFile(filePath, "utf-8");
    return data;
  } catch (err) {
    console.error("Failed to read file:", err);
    throw err;
  }
});

ipcMain.handle("write-file", async (event, fileName, data) => {
  try {
    const filePath = path.join(app.getPath("userData"), fileName);

    // 데이터 덮어쓰기
    await fs.promises.writeFile(filePath, data, "utf-8");
    console.log(`Data written to ${filePath}`);
    return { success: true };
  } catch (err) {
    console.error("Failed to write file:", err);
    throw err;
  }
});

// // IPC 핸들러: 파일 읽기
// ipcMain.handle("read-file", async (event, type) => {
//   const filePath = getFilePath(type);
//   try {
//     const data = await fs.promises.readFile(filePath, "utf-8");
//     return data;
//   } catch (err) {
//     console.error(`Failed to read file for ${type}:`, err);
//     throw err;
//   }
// });

// // IPC 핸들러: 파일 쓰기
// ipcMain.handle("write-file", async (event, type, content) => {
//   const filePath = getFilePath(type);
//   try {
//     await fs.promises.writeFile(filePath, content, "utf-8");
//     console.log(`Data written to ${filePath}`);
//     return true;
//   } catch (err) {
//     console.error(`Failed to write file for ${type}:`, err);
//     throw err;
//   }
// });

// const getFilePath = (type) => {
//   switch (type) {
//     case "drivers":
//       return driversPath;
//     case "passengers":
//       return passengersPath;
//     case "vehicles":
//       return vehiclesPath;
//     default:
//       throw new Error(`Invalid file type: ${type}`);
//   }
// };
