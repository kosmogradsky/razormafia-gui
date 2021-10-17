const { app, BrowserWindow } = require("electron");
const path = require("path");
const net = require("net");

const ClientSession = require('./classes/ClientSession')

global.registeredUsers = [
  {
    username: "kosmogradsky",
    hashedPassword: bcrypt.hashSync("12345678", 10),
  },
];

function handleConnection(socket) {
  function writeResponseBody(requestId, body) {
    socket.write(JSON.stringify({ responseId: requestId, body }));
  }

  function writeSubscriptionMessage(subscriptionKey, message) {
    socket.write(JSON.stringify({ subscription: subscriptionKey, message }));
  }

  const clientSession = new ClientSession({ writeSubscriptionMessage });

  socket.setEncoding("utf8");
  socket.on("data", async function (data) {
    writeResponseBody(await clientSession.composeResponseBody(data));
  });
}

const server = net.createServer(handleConnection);
server.listen(8080, "127.0.0.1");

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
  });

  win.loadFile(path.resolve(__dirname, "index.html"));
  win.openDevTools();

  return win;
}

app.whenReady().then(() => {
  createWindow();
});
