const rxjs = require("rxjs");

const SubscriptionManager = require("./SubscriptionManager");
const signInHandler = require("../handlers/signIn");
const signOutHandler = require("../handlers/signOut");
const enterQueueHandler = require("../handlers/enterQueue");

function createObservablesMap(internalSubjectsMap, externalSubjectsMap) {
  const observablesMap = new Map([...internalSubjectsMap]);

  const gameQueueLength$ = externalSubjectsMap
    .get("game_queue")
    .pipe(rxjs.map((gameQueue) => gameQueue.size));

  observablesMap.set("game_queue_length", gameQueueLength$);

  return observablesMap;
}

class ClientSession {
  #handlersMap = new Map([
    ["sign_in", signInHandler],
    ["sign_out", signOutHandler],
    ["enter_queue", enterQueueHandler],
  ]);
  #subjectsMap;
  #subscriptionManager;

  constructor({ writeSubscriptionMessage, externalSubjectsMap }) {
    const internalSubjectsMap = new Map([
      ["auth_state", new rxjs.BehaviorSubject({ type: "unauthenticated" })],
    ]);

    this.#subjectsMap = new Map([
      ...internalSubjectsMap,
      ...externalSubjectsMap,
    ]);

    this.#subscriptionManager = new SubscriptionManager({
      observablesMap: createObservablesMap(
        internalSubjectsMap,
        externalSubjectsMap
      ),
      writeSubscriptionMessage,
    });
  }

  async composeResponseBody(requestData) {
    const requestPath = requestData.path;
    const requestBody = requestData.body;
    const requestMethod = requestData.method;

    console.log(requestData);

    if (requestMethod === "subscribe") {
      return this.#subscriptionManager.subscribe(requestPath);
    }

    if (requestMethod === "unsubscribe") {
      return this.#subscriptionManager.unsubscribe(requestPath);
    }

    const handler = this.#handlersMap.get(requestPath);

    if (handler === undefined) {
      return { status: "error", reason: "contract_path_invalid" };
    }

    return handler({
      requestBody,
      subjectsMap: this.#subjectsMap,
    });
  }
}

module.exports = ClientSession;
