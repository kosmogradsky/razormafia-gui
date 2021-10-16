const { app, BrowserWindow } = require("electron");
const path = require("path");
const net = require("net");
const rxjs = require("rxjs");
const bcrypt = require("bcrypt");
const nanoid = require("nanoid");

const registeredUsers = [
  {
    username: "kosmogradsky",
    hashedPassword: bcrypt.hashSync("12345678", 10),
  },
];

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
    socket.setEncoding("utf8");

    socket.on("data", (data) => {
      const message = JSON.parse(data);
      const requestId = message.requestId;
      const body = message.body;

      console.log(message);

      if (requestId === undefined) {
        console.log("requestId not found");
        return;
      }

      switch (body.type) {
        case "login": {
          const { username, password } = body;

          const registeredUser = registeredUsers.find(
            (user) => user.username === username
          );

          if (registeredUser === undefined) {
            socket.write(
              JSON.stringify({
                responseId: requestId,
                body: { status: "error", reason: "wrong_credentials" },
              })
            );

            break;
          }

          const isSamePassword = bcrypt.compareSync(
            password,
            registeredUser.hashedPassword
          );

          if (isSamePassword) {
            socket.write(
              JSON.stringify({ responseId: requestId, body: { status: "ok" } })
            );
          } else {
            socket.write(
              JSON.stringify({
                responseId: requestId,
                body: { status: "error", reason: "wrong_credentials" },
              })
            );
          }

          break;
        }
      }
    });
  });

  server.listen(8080, "127.0.0.1");
});
