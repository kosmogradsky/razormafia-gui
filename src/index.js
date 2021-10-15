const { app, BrowserWindow } = require("electron");
const path = require("path");
const net = require("net");
const rxjs = require("rxjs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
  });

  win.loadFile(path.resolve(__dirname, "index.html"));
  win.openDevTools();

  return win;
}

function createSessionMapSubject(socket, win) {
  const sessionMapSubject = new rxjs.BehaviorSubject(new Map());

  // socket.on

  sessionMapSubject.subscribe((sessionMap) => {
    win.webContents.send(sessionMap);
  });
}

app.whenReady().then(() => {
  const win = createWindow();

  const server = net.createServer(function (socket) {
    socket.write("Hello client");

    socket.on("data", (data) => {
      console.log(data);
    });
  });

  server.listen(8080, "127.0.0.1");
});
