const { app, BrowserWindow } = require("electron");
const path = require("path");
const net = require("net");
const bcrypt = require("bcrypt");
const rxjs = require("rxjs");
const immutable = require("immutable");

const ClientSession = require("./classes/ClientSession");
const writeStringToSocket = require("./util/writeStringToSocket");
const readMessagesFromSocket = require("./util/readMessagesFromSocket");

global.registeredUsers = [
  {
    username: "kosmogradsky",
    hashedPassword: bcrypt.hashSync("12345678", 10),
  },
];

const gameQueueSubject = new rxjs.BehaviorSubject(new immutable.Set());

function handleConnection(socket) {
  function writeResponseBody(requestId, body) {
    writeStringToSocket(
      socket,
      JSON.stringify({ responseId: requestId, body })
    );
  }

  function writeSubscriptionMessage(subscriptionKey, message) {
    writeStringToSocket(
      socket,
      JSON.stringify({ subscription: subscriptionKey, message })
    );
  }

  const clientSession = new ClientSession({
    writeSubscriptionMessage,
    externalSubjectsMap: new Map([["game_queue", gameQueueSubject]]),
  });

  socket.on("data", async function (dataBuffer) {
    const dataUint8Array = new Uint8Array(dataBuffer);
    const strMessages = readMessagesFromSocket(dataUint8Array);
    console.log(strMessages);

    for (const strMessage of strMessages) {
      console.log(strMessage);
      const parsedRequestData = JSON.parse(strMessage);
      const requestId = parsedRequestData.requestId;

      if (requestId === undefined) {
        console.log("requestId not found");
        continue;
      }

      clientSession
        .composeResponseBody(parsedRequestData)
        .then((responseBody) => {
          writeResponseBody(requestId, responseBody);
        });
    }
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
