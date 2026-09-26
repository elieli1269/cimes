import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 860,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#0b110e",
    title: "Cimes",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  void win.loadFile(path.join(dir, "..", "desktop-dist", "index.html"));
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
