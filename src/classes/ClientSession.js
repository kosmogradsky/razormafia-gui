const rxjs = require("rxjs");

const SubscriptionManager = require("./SubscriptionManager");
const signInHandler = require("../handlers/signIn");

class ClientSession {
  #authStateSubject = new rxjs.BehaviorSubject({ type: "unauthenticated" });
  #subscriptionManager;

  constructor({ writeSubscriptionMessage }) {
    this.#subscriptionManager = new SubscriptionManager({
      observablesMap: new Map([["auth_state", this.#authStateSubject]]),
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

    switch (requestPath) {
      case "sign_in": {
        return signInHandler({
          requestBody,
          authStateSubject: this.#authStateSubject,
        });
      }
      case "sign_out": {
        const authState = this.#authStateSubject.getValue();
        if (authState.type !== "unauthenticated") {
          this.#authStateSubject.next({ type: "unauthencated" });
        }

        return { status: "ok" };
      }
      default: {
        return { status: "error", reason: "contract_path_invalid" };
      }
    }
  }
}

module.exports = ClientSession;
