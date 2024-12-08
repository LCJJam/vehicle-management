const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

const dataDir = path.join(app.getPath("userData"), "data");
const driversPath = path.join(dataDir, "drivers.json");
const passengersPath = path.join(dataDir, "passengers.json");
const vehiclesPath = path.join(dataDir, "vehicles.json");

const initializeFiles = () => {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const defaultDrivers = { drivers: [] };
  const defaultPassengers = { passengers: [] };
  const defaultVehicles = {
    vehicles: [
      {
        title: "평일 오전",
        data: [
          {
            id: "vehicle1",
            title: "1 호차",
            departureTime: "09:00",
            arrivalTime: "10:30",
            drivers: [],
            firstGroup: [],
            secondGroup: [],
          },
          {
            id: "vehicle2",
            title: "2 호차",
            departureTime: "10:45",
            arrivalTime: "12:15",
            drivers: [],
            firstGroup: [],
            secondGroup: [],
          },
          {
            id: "vehicle3",
            title: "3 호차",
            departureTime: "13:00",
            arrivalTime: "14:30",
            drivers: [],
            firstGroup: [],
            secondGroup: [],
          },
        ],
      },
    ],
  };

  if (!fs.existsSync(driversPath)) {
    fs.writeFileSync(driversPath, JSON.stringify(defaultDrivers, null, 2));
  }

  if (!fs.existsSync(passengersPath)) {
    fs.writeFileSync(
      passengersPath,
      JSON.stringify(defaultPassengers, null, 2)
    );
  }

  if (!fs.existsSync(vehiclesPath)) {
    fs.writeFileSync(vehiclesPath, JSON.stringify(defaultVehicles, null, 2));
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

// IPC 핸들러: 파일 읽기
ipcMain.handle("read-file", async (event, type) => {
  const filePath = getFilePath(type);
  try {
    const data = await fs.promises.readFile(filePath, "utf-8");
    return data;
  } catch (err) {
    console.error(`Failed to read file for ${type}:`, err);
    throw err;
  }
});

// IPC 핸들러: 파일 쓰기
ipcMain.handle("write-file", async (event, type, content) => {
  const filePath = getFilePath(type);
  try {
    await fs.promises.writeFile(filePath, content, "utf-8");
    console.log(`Data written to ${filePath}`);
    return true;
  } catch (err) {
    console.error(`Failed to write file for ${type}:`, err);
    throw err;
  }
});

const getFilePath = (type) => {
  switch (type) {
    case "drivers":
      return driversPath;
    case "passengers":
      return passengersPath;
    case "vehicles":
      return vehiclesPath;
    default:
      throw new Error(`Invalid file type: ${type}`);
  }
};
